import { z } from 'zod'
import { UserContext } from './auth'

// Conditional imports to prevent build-time initialization
let Agent: any = null
let run: any = null
let tool: any = null

async function initializeAgents() {
  if (!Agent) {
    const agentsModule = await import('@openai/agents')
    Agent = agentsModule.Agent
    run = agentsModule.run
    tool = agentsModule.tool
  }
}

// ===== MAIN EXPORT FUNCTION =====

export function getOpenAIAgent(userCtx?: UserContext) {
  console.log('[OPENAI DEBUG] Creating OpenAI agent, API key available:', !!process.env.OPENAI_API_KEY)
  console.log('[OPENAI DEBUG] User context available:', !!userCtx)

  // Lazy agent creation function
  const createAgent = async () => {
    await initializeAgents()
    
    // Define GoHighLevel MCP tool if user has access token
    const ghlMcpTool = userCtx?.accessToken ? tool({
      name: 'call_ghl_tool',
      description: 'Call a GoHighLevel tool through the MCP server',
      parameters: z.object({
        toolName: z.string().describe('The name of the GoHighLevel tool to call'),
        parameters: z.object({}).optional().describe('Parameters to pass to the tool')
      }),
      execute: async ({ toolName, parameters = {} }: { toolName: string; parameters?: any }) => {
        try {
          // CRITICAL FIX: Use locationId (tenant) instead of userId (person) for MCP routing
          const tenantId = userCtx.locationId
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
          return JSON.stringify(result)
        } catch (error: any) {
          console.error(`MCP tool call error for ${toolName}:`, error)
          throw new Error(`Tool call failed: ${error?.message || 'Unknown error'}`)
        }
      }
    }) : null

    return new Agent({
      name: 'GoHighLevel Assistant',
      instructions: userCtx?.accessToken 
        ? 'You are a helpful assistant for GoHighLevel users. You can help manage contacts, opportunities, campaigns, and other CRM tasks using the available tools.'
        : 'You are a helpful AI assistant. Note: GoHighLevel CRM tools are not currently available - please sign in with GoHighLevel OAuth to access CRM functionality.',
      model: 'gpt-4.1',
      tools: ghlMcpTool ? [ghlMcpTool] : []
    })
  }

  console.log('[OPENAI DEBUG] Agent factory created with tools:', userCtx?.accessToken ? 1 : 0, 'tools')

  return {
    get agent() {
      return createAgent()
    },
    userContext: userCtx,
    
    async createChatCompletion(messages: any[], options?: {
      stream?: boolean
      temperature?: number
    }) {
      // Convert messages to simple prompt for Agent framework
      const prompt = messages[messages.length - 1]?.content || ''
      const agent = await createAgent()
      await initializeAgents()
      
      // Handle streaming vs non-streaming explicitly
      if (options?.stream) {
        const result = await run(agent, prompt, { stream: true })
        return {
          choices: [{
            message: {
              content: '',
              role: 'assistant'
            }
          }],
          stream: result
        }
      } else {
        const result = await run(agent, prompt)
        return {
          choices: [{
            message: {
              content: result.finalOutput,
              role: 'assistant'
            }
          }]
        }
      }
    },

    async createStreamingChatCompletion(messages: any[]): Promise<any> {
      console.log('[PROXY DEBUG] Creating streaming completion with OpenAI Agents framework for tenant:', this.userContext?.locationId);

      if (!this.userContext?.locationId) {
        // Fallback to basic agent call if no tenant context is available
        console.log('[PROXY DEBUG] No tenant context. Using basic agent.');
        try {
          const prompt = messages[messages.length - 1]?.content || ''
          const agent = await createAgent()
          await initializeAgents()
          const stream = run(agent, prompt, { stream: true })
          return stream
        } catch (error) {
          console.error('[OPENAI DEBUG] Failed to create stream:', error);
          throw error;
        }
      }

      // For tenant users, proxy to backend service (which handles MCP integration)
      try {
        const response = await fetch('http://localhost:3001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': this.userContext.locationId,
          },
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
        const tenantId = userCtx.locationId
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
        const tenantId = userCtx.locationId
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