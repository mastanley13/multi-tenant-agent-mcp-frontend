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

const PORT = process.env.PORT || 3001

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(requestLogger)
app.use(rateLimitMiddleware)

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

  // In development, avoid spawning MCP and just return a stub Agent with no tools.
  if (process.env.NODE_ENV === 'development') {
    const devAgent = new Agent({
      name: `Stub Agent (${tenantId})`,
      instructions: 'Dev-mode stub agent without MCP tools.',
      model: 'o3-2025-04-16',
      tools: [],
    })
    agents.set(tenantId, { agent: devAgent, mcpServerPath: 'stub', toolsCount: 0 })
    return devAgent
  }

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

  agents.set(tenantId, { agent, mcpServerPath: mcp.opts?.args?.[0] ?? '', toolsCount: tools.length })
  return agent
}

// ---------- REST example: agent status -------------------------
app.get('/api/agent/status', async (req, res) => {
  const tenantId = (req.headers['x-tenant-id'] as string) ?? ''
  if (!tenantId) return res.status(400).json({ error: 'Missing x-tenant-id header' })

  const agent = await getAgentForTenant(tenantId)
  return res.json({ tenantId, tools: agent.tools.length })
})

// Health endpoint
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Prometheus metrics endpoint
app.get('/metrics', async (_, res) => {
  try {
    res.setHeader('Content-Type', register.contentType)
    const metrics = await register.metrics()
    res.send(metrics)
  } catch (err) {
    logger.error('Failed to collect metrics', err)
    res.status(500).send('Error collecting metrics')
  }
})

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

// ---------- Server start --------------------------------------
server.listen(PORT, () => {
  logger.info(`Multi-tenant wrapper listening on ${PORT}`)
}) 