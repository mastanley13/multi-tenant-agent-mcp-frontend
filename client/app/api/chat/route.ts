import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

import { prisma } from '@/lib/prisma'
import { getUserContext } from '@/lib/auth'
import { getOpenAIAgent } from '@/lib/openai'
import { checkRateLimit, createRateLimitHeaders } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  try {
    // Verify session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(session.user.id)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429, 
          headers: createRateLimitHeaders(rateLimitResult)
        }
      )
    }

    const { message, conversationId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Try to get user context with fresh token, but don't fail if it's not available
    let userCtx
    try {
      userCtx = await getUserContext(session.user.id)
    } catch (error) {
      console.log('GoHighLevel user context not available, continuing with basic chat functionality:', error)
      // Continue without user context - this means MCP tools won't be available but basic chat will work
      userCtx = undefined
    }

    // Find or create conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: session.user.id
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 50 // Limit message history
          }
        }
      })
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : '')
        },
        include: {
          messages: true
        }
      })
    }

    // Save user message
    await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        conversationId: conversation.id
      }
    })

    // Prepare messages for OpenAI
    const systemMessage = userCtx?.accessToken 
      ? 'You are a helpful assistant for GoHighLevel users. You can help manage contacts, opportunities, campaigns, and other CRM tasks using the available tools.'
      : 'You are a helpful AI assistant. Note: GoHighLevel CRM tools are not currently available - please sign in with GoHighLevel OAuth to access CRM functionality.'
      
    const messages = [
      {
        role: 'system' as const,
        content: systemMessage
      },
      ...conversation.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ]

    // Get OpenAI agent and create streaming completion
    const agent = getOpenAIAgent(userCtx)
    console.log('[CHAT DEBUG] Created OpenAI agent, userCtx available:', !!userCtx)
    console.log('[CHAT DEBUG] Prepared messages for OpenAI:', messages.length, 'messages')
    
    const stream = await agent.createStreamingChatCompletion(messages)
    console.log('[CHAT DEBUG] Created streaming completion')

    // Create readable stream for SSE
    const encoder = new TextEncoder()
    let assistantMessage = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        console.log('[CHAT DEBUG] Starting stream processing')

        // Process the stream
        try {
          let accumulatedToolCalls: any[] = []
          let chunkCount = 0
          
          for await (const chunk of stream) {
            chunkCount++
            console.log('[CHAT DEBUG] Processing chunk', chunkCount, 'choices:', chunk.choices?.length)
            
            const choice = chunk.choices?.[0]
            const delta = choice?.delta
            
            // Handle content
            const content = delta?.content || ''
            if (content) {
              console.log('[CHAT DEBUG] Content chunk:', content.slice(0, 50) + '...')
              assistantMessage += content
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }

            // Handle tool calls accumulation
            if (delta?.tool_calls) {
              for (const toolCall of delta.tool_calls) {
                if (!accumulatedToolCalls[toolCall.index]) {
                  accumulatedToolCalls[toolCall.index] = {
                    id: toolCall.id,
                    type: toolCall.type,
                    function: { name: '', arguments: '' }
                  }
                }
                
                if (toolCall.function?.name) {
                  accumulatedToolCalls[toolCall.index].function.name += toolCall.function.name
                }
                if (toolCall.function?.arguments) {
                  accumulatedToolCalls[toolCall.index].function.arguments += toolCall.function.arguments
                }
              }
            }

            // Check if completion is finished
            if (choice?.finish_reason) {
              // If we have tool calls, execute them
              if (accumulatedToolCalls.length > 0 && choice.finish_reason === 'tool_calls') {
                try {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'executing_tools' })}\n\n`))
                  
                  // Execute tool calls
                  const toolResults = await agent.handleToolCalls(accumulatedToolCalls)
                  
                  // Create a new completion with tool results
                  const followupMessages = [
                    ...messages,
                    {
                      role: 'assistant' as const,
                      content: null,
                      tool_calls: accumulatedToolCalls
                    },
                    ...toolResults
                  ]
                  
                  // Get follow-up response from OpenAI
                  const followupStream = await agent.createStreamingChatCompletion(followupMessages)
                  
                  // Process the follow-up stream
                  for await (const followupChunk of followupStream) {
                    const followupContent = followupChunk.choices?.[0]?.delta?.content || ''
                    if (followupContent) {
                      assistantMessage += followupContent
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: followupContent })}\n\n`))
                    }
                    
                    if (followupChunk.choices?.[0]?.finish_reason) {
                      break
                    }
                  }
                } catch (toolError: any) {
                  console.error('Tool execution error:', toolError)
                  const errorMessage = `\n\n[Tool execution failed: ${toolError?.message || 'Unknown error'}]`
                  assistantMessage += errorMessage
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: errorMessage })}\n\n`))
                }
              }
              
              // Save assistant message
              if (assistantMessage.trim()) {
                prisma.message.create({
                  data: {
                    content: assistantMessage,
                    role: 'assistant',
                    conversationId: conversation.id
                  }
                }).catch(console.error) // Fire and forget
              }

              controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
              controller.close()
              break
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream processing failed' })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(readableStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Accel-Buffering': 'no',
        ...createRateLimitHeaders(rateLimitResult)
      }
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 