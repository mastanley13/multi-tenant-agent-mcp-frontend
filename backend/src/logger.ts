import winston from 'winston'

// Simple token redaction: removes bearer tokens and common sensitive fields
const redact = winston.format((info) => {
  if (typeof info.message === 'string') {
    info.message = info.message
      .replace(/Bearer\s+[A-Za-z0-9\-_.]+/gi, 'Bearer [REDACTED]')
      .replace(/access_token":"[^"]+/gi, 'access_token":"[REDACTED]')
      .replace(/refresh_token":"[^"]+/gi, 'refresh_token":"[REDACTED]')
  }
  return info
})

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    redact(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
}) 