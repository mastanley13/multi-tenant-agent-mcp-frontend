import OpenAI from 'openai'

import { UserContext } from './auth'

export function getOpenAIAgent(userCtx?: UserContext) {
  console.log('[OPENAI DEBUG] Creating OpenAI agent, API key available:', !!process.env.OPENAI_API_KEY)
  console.log('[OPENAI DEBUG] User context available:', !!userCtx)

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  // Configure tools to call our MCP server (only if we have user context)
  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = userCtx?.accessToken ? [
    {
      type: 'function',
      function: {
        name: 'call_ghl_tool',
        description: 'Call a GoHighLevel tool through the MCP server',
        parameters: {
          type: 'object',
          properties: {
            toolName: {
              type: 'string',
              description: 'The name of the GoHighLevel tool to call'
            },
            parameters: {
              type: 'object',
              description: 'Parameters to pass to the tool'
            }
          },
          required: ['toolName']
        }
      }
    }
  ] : []

  console.log('[OPENAI DEBUG] Tools configured:', tools.length, 'tools')

  return {
    openai,
    model: 'gpt-4o',
    userContext: userCtx,
    
    async createChatCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], options?: {
      stream?: boolean
      temperature?: number
    }) {
      return await openai.chat.completions.create({
        model: 'gpt-4.1',
        messages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? 'auto' : undefined,
        stream: options?.stream || false,
        temperature: options?.temperature || 0.7,
        max_tokens: 4000,
      })
    },

    async createStreamingChatCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
      console.log('[OPENAI DEBUG] Creating streaming completion with', messages.length, 'messages')
      console.log('[OPENAI DEBUG] Model: gpt-4o, tools:', tools.length)
      
      try {
        const stream = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages,
          tools: tools.length > 0 ? tools : undefined,
          tool_choice: tools.length > 0 ? 'auto' : undefined,
          stream: true,
          temperature: 0.7,
          max_tokens: 4000,
        })
        
        console.log('[OPENAI DEBUG] Stream created successfully')
        return stream
      } catch (error) {
        console.error('[OPENAI DEBUG] Failed to create stream:', error)
        throw error
      }
    },

    async getAvailableTools() {
      if (!userCtx?.accessToken) {
        return []
      }
      
      try {
        const tenantId = userCtx.id
        const response = await fetch(`${process.env.MCP_SERVER_URL}/mcp/${tenantId}/tools`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userCtx.accessToken}`
          }
        })
        
        if (!response.ok) {
          console.error('Failed to fetch available tools:', response.status)
          return []
        }
        
        return await response.json()
      } catch (error) {
        console.error('Error fetching available tools:', error)
        return []
      }
    },

    async callMCPTool(toolName: string, parameters: any = {}) {
      if (!userCtx?.accessToken) {
        throw new Error('No access token available for MCP tool calls')
      }
      
      try {
        // Use the multi-tenant MCP server endpoint format
        const tenantId = userCtx.id // Use user ID as tenant ID
        const response = await fetch(`${process.env.MCP_SERVER_URL}/mcp/${tenantId}/tool/${toolName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userCtx.accessToken}`
          },
          body: JSON.stringify(parameters)
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`MCP tool call failed: ${response.status} ${errorText}`)
        }

        const result = await response.json()
        return result
      } catch (error) {
        console.error(`MCP tool call error for ${toolName}:`, error)
        throw error
      }
    },

    async handleToolCalls(toolCalls: any[]) {
      const toolResults = []
      
      for (const toolCall of toolCalls) {
        try {
          if (toolCall.function?.name === 'call_ghl_tool') {
            if (!userCtx?.accessToken) {
              toolResults.push({
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ 
                  error: 'GoHighLevel access not available. Please sign in with GoHighLevel OAuth to use CRM tools.' 
                })
              })
              continue
            }
            
            const args = JSON.parse(toolCall.function.arguments)
            const result = await this.callMCPTool(args.toolName, args.parameters)
            
            toolResults.push({
              tool_call_id: toolCall.id,
              role: 'tool' as const,
              content: JSON.stringify(result)
            })
          }
        } catch (error: any) {
          console.error('Tool call error:', error)
          toolResults.push({
            tool_call_id: toolCall.id,
            role: 'tool' as const,
            content: JSON.stringify({ error: `Tool call failed: ${error?.message || 'Unknown error'}` })
          })
        }
      }
      
      return toolResults
    }
  }
}

export type OpenAIAgent = ReturnType<typeof getOpenAIAgent> 