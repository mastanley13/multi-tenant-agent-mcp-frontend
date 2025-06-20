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

    // Get OpenAI agent instance
    const agentInstance = getOpenAIAgent(userCtx)
    console.log('[CHAT DEBUG] Created OpenAI agent, userCtx available:', !!userCtx)
    
    // Build intelligent conversation context using Mem0 semantic memory
    let contextualPrompt = message
    let relevantContext = ''
    
    // Add user message to memory (if userCtx available with ghlUserId for user-based memory)
    if (userCtx?.ghlUserId) {
      // Import memory client dynamically to avoid initialization issues
      const { memoryClient } = await import('@/lib/memory')
      
      // Get relevant context from semantic memory using actual GHL user ID
      relevantContext = await memoryClient.getConversationContext(message, userCtx.ghlUserId, conversation.id)
      
      // Add user message to memory for future context (tied to user, not location)
      await memoryClient.addMessage(message, userCtx.ghlUserId, 'user', {
        conversationId: conversation.id,
        currentLocation: userCtx.locationId, // Store location as metadata
        timestamp: new Date().toISOString()
      })
    }
    
    // Build contextual prompt with intelligent memory (if available) or fallback to basic history
    if (relevantContext) {
      contextualPrompt = `Relevant context from previous conversations:\n${relevantContext}\n\nCurrent message: ${message}`
      console.log('[MEMORY] Using semantic memory context for enhanced response')
    } else {
      // Fallback to basic conversation history (but limit to recent messages for performance)
      const recentHistory = conversation.messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')
      contextualPrompt = recentHistory 
        ? `Recent conversation:\n${recentHistory}\n\nUser: ${message}`
      : message
      console.log('[MEMORY] Using fallback conversation history')
    }

    console.log('[CHAT DEBUG] Prepared contextual prompt for agent')
    
    // Check if this is a streaming request or backend proxy
    const streamFromBackend = await agentInstance.createStreamingChatCompletion([
      { role: 'user', content: contextualPrompt }
    ])
    console.log('[CHAT DEBUG] Created streaming completion')

    // If the stream from the agent is a raw ReadableStream, pipe it directly.
    // This happens when we are proxying to our backend.
    if (streamFromBackend instanceof ReadableStream) {
      console.log('[CHAT DEBUG] Piping raw stream from backend proxy.');
      return new Response(streamFromBackend, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        }
      });
    }

    // Handle streaming response from OpenAI Agents framework
    const encoder = new TextEncoder()
    let assistantMessage = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        console.log('[CHAT DEBUG] Starting Agent framework stream processing')

        try {
          // For non-backend cases, use the Agent framework directly
          if (streamFromBackend && typeof streamFromBackend[Symbol.asyncIterator] === 'function') {
            // Handle async iterable from Agent framework
            for await (const chunk of streamFromBackend) {
              console.log('[CHAT DEBUG] Received chunk:', chunk.type)
              
              // Handle different chunk types from OpenAI Agents framework
              if (chunk.type === 'raw_model_stream_event' && chunk.data?.type === 'model') {
                // Handle raw model streaming events
                const event = chunk.data.event
                if (event?.type === 'response.output_text.delta' && event.delta) {
                  const content = event.delta
                  assistantMessage += content
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                }
              } else if (chunk.type === 'run_item_stream_event') {
                // Handle run item events
                const item = chunk.item
                if (item?.type === 'message' && item.content) {
                  const content = item.content
                  assistantMessage += content
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                }
              } else if (chunk.type === 'agent_updated_stream_event') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'agent_updated' })}\n\n`))
              }
            }
          } else {
            // Fallback: create a simple non-streaming response
            const prompt = contextualPrompt
            const agent = await agentInstance.agent
            
            // Import run function dynamically
            const { run } = await import('@openai/agents')
            const agentResult = await run(agent, prompt)

            const finalOutput = agentResult?.finalOutput || 'No response generated'
            assistantMessage = finalOutput
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: finalOutput })}\n\n`))
          }

          // Additional fallback: if no content was streamed, get the final result
          if (!assistantMessage && streamFromBackend && streamFromBackend.finalOutput) {
            assistantMessage = streamFromBackend.finalOutput
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: assistantMessage })}\n\n`))
          }

          // Save assistant message to database
          if (assistantMessage) {
            await prisma.message.create({
              data: {
                content: assistantMessage,
                role: 'assistant',
                conversationId: conversation.id
              }
            })
            
            // Add assistant response to memory for future context (tied to user)
            if (userCtx?.ghlUserId) {
              const { memoryClient } = await import('@/lib/memory')
              await memoryClient.addMessage(assistantMessage, userCtx.ghlUserId, 'assistant', {
                conversationId: conversation.id,
                currentLocation: userCtx.locationId, // Store location as metadata
                timestamp: new Date().toISOString()
              })
            }
          }

          // Send completion signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            status: 'completed',
            conversationId: conversation.id 
          })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))

        } catch (error) {
          console.error('[CHAT DEBUG] Stream processing error:', error)
          
          // Try fallback: non-streaming response
          try {
            const prompt = contextualPrompt
            const agent = await agentInstance.agent
            const { run } = await import('@openai/agents')
            const agentResult = await run(agent, prompt)
            const finalOutput = agentResult?.finalOutput || 'I apologize, but I encountered an error processing your request.'
            
            assistantMessage = finalOutput
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: finalOutput })}\n\n`))
            
            // Save fallback message to database
            await prisma.message.create({
              data: {
                content: assistantMessage,
                role: 'assistant',
                conversationId: conversation.id
              }
            })
            
            // Add fallback assistant response to memory for future context (tied to user)
            if (userCtx?.ghlUserId) {
              const { memoryClient } = await import('@/lib/memory')
              await memoryClient.addMessage(assistantMessage, userCtx.ghlUserId, 'assistant', {
                conversationId: conversation.id,
                currentLocation: userCtx.locationId, // Store location as metadata
                timestamp: new Date().toISOString(),
                fallback: true
              })
            }
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              status: 'completed',
              conversationId: conversation.id 
            })}\n\n`))
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          } catch (fallbackError) {
            console.error('[CHAT DEBUG] Fallback error:', fallbackError)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              error: 'An error occurred while processing your request.' 
            })}\n\n`))
          }
        }

        controller.close()
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      }
    })

  } catch (error) {
    console.error('[CHAT DEBUG] Request processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 