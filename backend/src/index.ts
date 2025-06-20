import express from 'express'
// Ensure not running as root in production
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import { logger } from './logger'
import { Agent, AgentInputItem, run, withTrace, getAllMcpTools, user } from '@openai/agents'
import { getProcess, releaseProcess } from './processManager'
import { rateLimitMiddleware } from './rateLimiter'
import { register } from './metrics'
import { requestLogger } from './requestLogger'
import type { Request, Response, NextFunction, RequestHandler } from 'express'

// ---------------- Security: refuse to run as root in prod ----------------
if (process.env.NODE_ENV === 'production' && typeof process.getuid === 'function' && process.getuid() === 0) {
  // eslint-disable-next-line no-console
  console.error('Refusing to run backend as root user (UID 0)')
  process.exit(1)
}

// ---------- Express + Socket.io setup --------------------------
const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

const PORT = process.env.BACKEND_PORT || 3001

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(requestLogger)

// Helper type for async handlers so that returned Promise is handled correctly
// and TypeScript can accept it as a valid Express RequestHandler.
function asyncHandler<T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as T, res as U, next)).catch(next)
  }
}

// Replace direct use of async middleware that returns Promise to avoid TS overload issues
app.use(asyncHandler(rateLimitMiddleware))

// ---------- In-memory agent cache per tenant -------------------
interface AgentCacheEntry {
  agent: Agent
  mcpServerPath: string
  toolsCount: number
}
const agents = new Map<string, AgentCacheEntry>()

async function getAgentForTenant(tenantId: string) {
  const cached = agents.get(tenantId)
  if (cached) return cached.agent

  const mcp = await getProcess(tenantId)
  // Build tools list (cached inside Agent to avoid re-fetch each call)
  const tools = await withTrace('load-tools', () => getAllMcpTools([mcp], false))

  const agent = new Agent({
    name: `GHL Assistant (${tenantId})`,
    instructions: 'You are a GoHighLevel assistant for tenant ' + tenantId,
    model: 'o3-2025-04-16',
    tools,
    modelSettings: { maxTokens: 1500 },
  })

  // Store limited metadata for diagnostics
  agents.set(tenantId, { agent, mcpServerPath: '', toolsCount: tools.length })
  return agent
}

// ---------- REST example: agent status -------------------------
app.get('/api/agent/status', asyncHandler(async (req, res) => {
  const tenantId = (req.headers['x-tenant-id'] as string) ?? ''
  if (!tenantId) return res.status(400).json({ error: 'Missing x-tenant-id header' })

  const agent = await getAgentForTenant(tenantId)
  const toolsCollection: any = (agent as any).tools
  let toolsCount: number
  if (Array.isArray(toolsCollection)) {
    toolsCount = toolsCollection.length
  } else if (toolsCollection instanceof Map || toolsCollection instanceof Set) {
    toolsCount = toolsCollection.size
  } else if (toolsCollection && typeof toolsCollection === 'object') {
    toolsCount = Object.keys(toolsCollection).length
  } else {
    toolsCount = 0
  }

  return res.json({ tenantId, tools: toolsCount })
}))

// Health endpoint
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Prometheus metrics endpoint
app.get('/metrics', asyncHandler(async (_, res) => {
  try {
    res.setHeader('Content-Type', register.contentType)
    const metrics = await register.metrics()
    res.send(metrics)
  } catch (err) {
    logger.error('Failed to collect metrics', err)
    res.status(500).send('Error collecting metrics')
  }
}))

// MCP Tools listing endpoint
app.get('/tools', asyncHandler(async (req, res) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) ?? 'anonymous'
    const agent = await getAgentForTenant(tenantId)

    // Normalize the tools collection into an array regardless of concrete type
    let toolsArray: any[] = []
    const rawTools: any = (agent as any).tools
    if (Array.isArray(rawTools)) {
      toolsArray = rawTools
    } else if (rawTools && typeof rawTools === 'object') {
      // Map, Set or generic object
      if (rawTools instanceof Map) {
        toolsArray = Array.from(rawTools.values())
      } else if (rawTools instanceof Set) {
        toolsArray = Array.from(rawTools)
      } else {
        toolsArray = Object.values(rawTools)
      }
    }

    const toolsInfo = toolsArray.map((tool) => {
      const parameters = (tool.inputSchema ?? tool.parameters) || undefined
      return {
        name: tool.name,
        description: tool.description ?? tool.summary ?? undefined,
        parameters,
      }
    })

    res.json({
      tools: toolsInfo,
      count: toolsInfo.length,
      tenantId,
    })
  } catch (error) {
    logger.error('Failed to get tools', error)
    res.status(500).json({ error: 'Failed to get tools' })
  }
}))

// MCP Tool execution endpoint
app.post('/tools/:toolName', asyncHandler(async (req, res) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) ?? 'anonymous'
    const { toolName } = req.params
    const agent = await getAgentForTenant(tenantId)

    // Normalize tools collection (same logic as above)
    let toolsArray: any[] = []
    const rawTools: any = (agent as any).tools
    if (Array.isArray(rawTools)) {
      toolsArray = rawTools
    } else if (rawTools && typeof rawTools === 'object') {
      if (rawTools instanceof Map) {
        toolsArray = Array.from(rawTools.values())
      } else if (rawTools instanceof Set) {
        toolsArray = Array.from(rawTools)
      } else {
        toolsArray = Object.values(rawTools)
      }
    }

    const tool: any = toolsArray.find((t) => t.name === toolName)
    if (!tool) {
      return res.status(404).json({ error: `Tool '${toolName}' not found` })
    }

    // Execute the tool. Support different method names across versions
    let result: any
    if (typeof tool.call === 'function') {
      result = await tool.call(req.body)
    } else if (typeof tool.invoke === 'function') {
      result = await tool.invoke(req.body)
    } else if (typeof tool.execute === 'function') {
      result = await tool.execute(req.body)
    } else if (typeof tool.run === 'function') {
      result = await tool.run(req.body)
    } else {
      return res.status(500).json({ error: `Tool '${toolName}' does not expose an executable method` })
    }

    res.json({
      toolName,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error(`Tool execution failed for ${req.params.toolName}`, error)
    res.status(500).json({ error: 'Tool execution failed' })
  }
}))

// ---------- TENANT-SPECIFIC MCP ENDPOINTS (for frontend) ---------------

// GET /api/mcp/:tenantId/tools - List tools for specific tenant
app.get('/api/mcp/:tenantId/tools', asyncHandler(async (req, res) => {
  try {
    const { tenantId } = req.params
    const agent = await getAgentForTenant(tenantId)

    // Normalize the tools collection into an array
    let toolsArray: any[] = []
    const rawTools: any = (agent as any).tools
    if (Array.isArray(rawTools)) {
      toolsArray = rawTools
    } else if (rawTools && typeof rawTools === 'object') {
      if (rawTools instanceof Map) {
        toolsArray = Array.from(rawTools.values())
      } else if (rawTools instanceof Set) {
        toolsArray = Array.from(rawTools)
      } else {
        toolsArray = Object.values(rawTools)
      }
    }

    const toolsInfo = toolsArray.map((tool) => {
      const parameters = (tool.inputSchema ?? tool.parameters) || undefined
      return {
        name: tool.name,
        description: tool.description ?? tool.summary ?? undefined,
        parameters,
      }
    })

    res.json({
      tools: toolsInfo,
      count: toolsInfo.length,
      tenantId,
    })
  } catch (error) {
    logger.error(`Failed to get tools for tenant ${req.params.tenantId}`, error)
    res.status(500).json({ error: 'Failed to get tools' })
  }
}))

// POST /api/mcp/:tenantId/tools/:toolName - Execute tool for specific tenant
app.post('/api/mcp/:tenantId/tools/:toolName', asyncHandler(async (req, res) => {
  try {
    const { tenantId, toolName } = req.params
    const agent = await getAgentForTenant(tenantId)

    // Normalize tools collection
    let toolsArray: any[] = []
    const rawTools: any = (agent as any).tools
    if (Array.isArray(rawTools)) {
      toolsArray = rawTools
    } else if (rawTools && typeof rawTools === 'object') {
      if (rawTools instanceof Map) {
        toolsArray = Array.from(rawTools.values())
      } else if (rawTools instanceof Set) {
        toolsArray = Array.from(rawTools)
      } else {
        toolsArray = Object.values(rawTools)
      }
    }

    const tool: any = toolsArray.find((t) => t.name === toolName)
    if (!tool) {
      return res.status(404).json({ error: `Tool '${toolName}' not found for tenant '${tenantId}'` })
    }

    // Execute the tool with different method signatures
    let result: any
    if (typeof tool.call === 'function') {
      result = await tool.call(req.body)
    } else if (typeof tool.invoke === 'function') {
      result = await tool.invoke(req.body)
    } else if (typeof tool.execute === 'function') {
      result = await tool.execute(req.body)
    } else if (typeof tool.run === 'function') {
      result = await tool.run(req.body)
    } else {
      return res.status(500).json({ error: `Tool '${toolName}' does not expose an executable method` })
    }

    res.json({
      tenantId,
      toolName,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error(`Tool execution failed for ${req.params.toolName} (tenant: ${req.params.tenantId})`, error)
    res.status(500).json({ error: 'Tool execution failed' })
  } finally {
    // Release the process after tool execution
    releaseProcess(req.params.tenantId)
  }
}))

// ---------- Socket.io chat ------------------------------------
interface SessionInfo {
  history: AgentInputItem[]
  tenantId: string
}
const sessions = new Map<string, SessionInfo>()

io.use((socket, next) => {
  const tenantId = socket.handshake.auth?.tenantId || socket.handshake.headers['x-tenant-id']
  if (!tenantId || typeof tenantId !== 'string') {
    return next(new Error('tenantId required'))
  }
  ;(socket as any).tenantId = tenantId
  next()
})

io.on('connection', (socket) => {
  const tenantId: string = (socket as any).tenantId
  const userId = socket.id
  logger.info(`User ${userId} connected (tenant ${tenantId})`)

  sessions.set(userId, { history: [], tenantId })
  socket.emit('connection_status', { connected: true, tenantId })

  socket.on('chat_message', async (data) => {
    const { message } = data
    const session = sessions.get(userId)
    if (!session) return

    try {
      const agent = await getAgentForTenant(tenantId)
      session.history.push(user(message))
      socket.emit('agent_typing', { typing: true })

      const result = await run(agent, session.history)
      session.history = result.history
      const response = result.finalOutput ?? result.output ?? 'Unhandled'

      socket.emit('agent_response', { message: response, timestamp: new Date().toISOString() })
      socket.emit('agent_typing', { typing: false })
    } catch (err) {
      logger.error('Chat error', err)
      socket.emit('error', { message: 'Error processing request' })
    } finally {
      // release after each interaction so idle reaper counts correctly
      releaseProcess(tenantId)
    }
  })

  socket.on('disconnect', () => {
    sessions.delete(userId)
    logger.info(`User ${userId} disconnected`)
  })
})

// ---------- NEW: REST Chat endpoint for frontend proxy -----------------
app.post('/api/chat', asyncHandler(async (req, res) => {
  const tenantId = (req.headers['x-tenant-id'] as string) ?? 'anonymous';
  if (tenantId === 'anonymous') {
    return res.status(400).json({ error: 'x-tenant-id header is required' });
  }

  const { message, stream = false } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message is required in the request body' });
  }

  try {
    const agent = await getAgentForTenant(tenantId);
    
    // Convert the message string to the expected format for the agents library
    const messages: AgentInputItem[] = [user(message)];
    
    if (stream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      const result = await run(agent, messages, { stream: true });
      let responseContent = '';
      
      for await (const event of result) {
        // Handle different event types based on the OpenAI agents library documentation
        if ('type' in event) {
          const eventType = event.type as string;
          
          // Handle run item events (messages, tool calls, etc)
          if (eventType === 'run_item_stream_event') {
            const item = (event as any).item;
            if (item?.type === 'message_output_item' && item.content) {
              // Extract text content from message
              const textContent = typeof item.content === 'string' 
                ? item.content 
                : item.content?.text || '';
              if (textContent) {
                responseContent += textContent;
                res.write(`data: ${JSON.stringify({ content: textContent })}\n\n`);
              }
            }
          }
          // Handle raw model stream events
          else if (eventType === 'raw_model_stream_event') {
            const data = (event as any).data;
            // Check if it's a text delta event
            if (data?.choices?.[0]?.delta?.content) {
              const content = data.choices[0].delta.content;
              responseContent += content;
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          }
        }
      }
      
      // Send done event
      res.write(`data: [DONE]\n\n`);
      res.end();

    } else {
      const result = await run(agent, messages);
      res.json({
        message: result.finalOutput || result.output || 'No response generated',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    logger.error(`[CHAT API] Error for tenant ${tenantId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        details: errorMessage
      });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`);
      res.end();
    }
  } finally {
    // Release the process so it can be reaped if idle
    releaseProcess(tenantId);
  }
}));

// ---------- Server start --------------------------------------
server.listen(PORT, () => {
  logger.info(`Multi-tenant wrapper listening on ${PORT}`)
}) 