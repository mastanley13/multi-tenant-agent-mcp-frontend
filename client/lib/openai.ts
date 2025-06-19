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
    model: 'o3-2025-04-16',
    userContext: userCtx,
    
    async createChatCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], options?: {
      stream?: boolean
      temperature?: number
    }) {
      return await openai.chat.completions.create({
        model: 'o3-2025-04-16',
        messages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? 'auto' : undefined,
        stream: options?.stream || false,
      })
    },

    async createStreamingChatCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<any> {
      console.log('[PROXY DEBUG] Forwarding request to backend chat API for tenant:', this.userContext?.id);

      if (!this.userContext?.id) {
        // Fallback to basic OpenAI call if no tenant context is available
        // This maintains the "basic chat" functionality when GHL is not connected
        console.log('[PROXY DEBUG] No tenant context. Calling OpenAI directly.');
        try {
          const stream = await this.openai.chat.completions.create({
            model: 'gpt-4.1',
            messages,
            stream: true,
          });
          return stream;
        } catch (error) {
          console.error('[OPENAI DEBUG] Failed to create stream:', error);
          throw error;
        }
      }

      // Proxy the request to the backend service
      try {
        const response = await fetch('http://localhost:3001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': this.userContext.id,
          },
          // The backend expects a simple 'message' string, let's send the last user message.
          // The backend will manage its own history/context.
          body: JSON.stringify({ 
            message: messages[messages.length - 1].content,
            stream: true 
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[PROXY DEBUG] Backend API error: ${response.status} ${errorText}`);
          throw new Error(`Backend API request failed: ${response.status}`);
        }

        // The response body from the backend is already a stream of SSE events.
        // We can return it directly.
        if (!response.body) {
          throw new Error('Backend response did not have a body');
        }
        return response.body;

      } catch (error) {
        console.error('[PROXY DEBUG] Failed to proxy request to backend:', error);
        throw error;
      }
    },

    async getAvailableTools() {
      if (!userCtx?.accessToken) {
        return []
      }
      
      try {
        const tenantId = userCtx.id
        const response = await fetch(`/api/mcp/${tenantId}/tools`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          console.error('Failed to fetch available tools:', response.status)
          return []
        }
        
        const result = await response.json()
        return result.tools || []
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
        const tenantId = userCtx.id
        const response = await fetch(`/api/mcp/${tenantId}/tools/${toolName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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