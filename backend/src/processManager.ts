import { MCPServerStdio } from '@openai/agents'
import { getTenantSecrets } from './secrets'
import { logger } from './logger'
import { activeMcpChildren } from './metrics'

interface ProcInfo {
  proc: MCPServerStdio
  refCount: number
  lastUsed: number
}

// Map of tenantId → process details
const processes: Map<string, ProcInfo> = new Map()

/**
 * Return an active MCP process for the given tenant. If none exists (or it was
 * disconnected), a new child process is spawned using the tenant-specific
 * credentials fetched via `getTenantSecrets`.
 */
export async function getProcess(tenantId: string): Promise<MCPServerStdio> {
  const existing = processes.get(tenantId)
  if (existing) {
    existing.refCount++
    existing.lastUsed = Date.now()
    return existing.proc
  }

  const { accessToken, locationId } = await getTenantSecrets(tenantId)

  const procPath = process.env.GHL_MCP_PATH || (process.env.NODE_ENV === 'development' ? `${__dirname}/../mcp-src/dist/server.js` : `${__dirname}/../mcp-src/dist/server.js`)

  const proc = new MCPServerStdio({
    name: `GHL-MCP-${tenantId}`,
    command: 'node',
    args: [procPath],
    env: {
      GHL_API_KEY: accessToken,
      GHL_LOCATION_ID: locationId,
      GHL_BASE_URL: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
      NODE_ENV: process.env.NODE_ENV || 'production',
    },
    cacheToolsList: true,
    clientSessionTimeoutSeconds: 30,
  })

  await proc.connect()
  processes.set(tenantId, { proc, refCount: 1, lastUsed: Date.now() })
  activeMcpChildren.inc({ tenantId })
  return proc
}

/**
 * Decrease the reference count for the tenant's process, signifying that one
 * logical client connection has completed.
 */
export function releaseProcess(tenantId: string) {
  const info = processes.get(tenantId)
  if (!info) return
  info.refCount--
  info.lastUsed = Date.now()
  if (info.refCount <= 0) {
    activeMcpChildren.dec({ tenantId })
  }
}

// ----------------- Idle reaper cron (D-2) ------------------------
const IDLE_LIMIT_MS = 10 * 60_000 // 10 minutes

import { mcpProcessesReapedTotal, idleReaperLastRun } from './metrics'

setInterval(async () => {
  const now = Date.now()
  idleReaperLastRun.set(Math.floor(now / 1000))

  for (const [tenantId, info] of Array.from(processes.entries())) {
    if (info.refCount === 0 && now - info.lastUsed > IDLE_LIMIT_MS) {
      try {
        await info.proc.close()
      } catch (err) {
        logger.error(`Failed to close MCP process for ${tenantId}:`, err)
      }
      processes.delete(tenantId)
      activeMcpChildren.dec({ tenantId })
      mcpProcessesReapedTotal.inc({ tenantId })
    }
  }
}, 60_000)

/**
 * Force run of the idle‐reaper loop (primarily for unit tests).
 */
export async function __forceReapIdleForTests() {
  const now = Date.now()
  for (const [tenantId, info] of Array.from(processes.entries())) {
    if (info.refCount === 0) {
      try {
        await info.proc.close()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Failed to close MCP process for ${tenantId}:`, err)
      }
      processes.delete(tenantId)
      activeMcpChildren.dec({ tenantId })
    }
  }
} 