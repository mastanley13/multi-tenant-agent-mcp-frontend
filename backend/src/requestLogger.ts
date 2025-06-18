import { Request, Response, NextFunction } from 'express'
import { logger } from './logger'

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint()
  const tenantId = (req.headers['x-tenant-id'] as string) || 'unknown'
  const method = req.method
  const url = req.originalUrl || req.url

  // Redact Authorization header if present
  const safeHeaders = { ...req.headers }
  if (safeHeaders['authorization']) {
    safeHeaders['authorization'] = 'Bearer [REDACTED]'
  }

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000
    logger.info(`${method} ${url} ${res.statusCode} - ${durationMs.toFixed(1)} ms`, {
      tenantId,
      method,
      path: url,
      status: res.statusCode,
      durationMs,
    })
  })

  next()
} 