import client from 'prom-client'

// Create a global Registry (prom-client v15 creates default one)
export const register = new client.Registry()
client.collectDefaultMetrics({ register })

// Gauge: active MCP children per tenant
export const activeMcpChildren = new client.Gauge({
  name: 'active_mcp_children',
  help: 'Number of active MCP child processes',
  labelNames: ['tenantId'] as const,
  registers: [register],
})

// Gauge: remaining requests in current rate-limit window (updated by middleware)
export const rateLimitRemainingGauge = new client.Gauge({
  name: 'rate_limit_remaining',
  help: 'Remaining requests in current sliding window',
  labelNames: ['tenantId'] as const,
  registers: [register],
})

// Gauge: wrapper process memory usage bytes
export const wrapperMemBytes = new client.Gauge({
  name: 'wrapper_process_mem_bytes',
  help: 'RSS memory of wrapper process in bytes',
  registers: [register],
})

// Counter: number of MCP child processes killed by idle reaper
export const mcpProcessesReapedTotal = new client.Counter({
  name: 'mcp_processes_reaped_total',
  help: 'Total number of MCP child processes reaped due to idleness',
  labelNames: ['tenantId'] as const,
  registers: [register],
})

// Gauge: last run timestamp of idle reaper (unix seconds)
export const idleReaperLastRun = new client.Gauge({
  name: 'idle_reaper_last_run_timestamp',
  help: 'Unix timestamp of the last idle-reaper cycle',
  registers: [register],
})

// Update memory gauge periodically
setInterval(() => {
  const mem = process.memoryUsage()
  wrapperMemBytes.set(mem.rss)
}, 10_000) 