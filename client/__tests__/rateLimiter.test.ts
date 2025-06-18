import { rateLimitMiddleware } from '../../backend/src/rateLimiter'
import { NextFunction, Request, Response } from 'express'

describe('rateLimitMiddleware (in-memory fallback)', () => {
  function mockReq(): Request {
    return {
      headers: { 'x-tenant-id': 'test-tenant' },
    } as unknown as Request
  }

  function mockRes() {
    const headers: Record<string, string> = {}
    return {
      setHeader: (key: string, value: string) => { headers[key] = value },
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      get sentHeaders() { return headers },
    } as unknown as Response & { sentHeaders: Record<string, string> }
  }

  const next: NextFunction = jest.fn()

  it('allows first 60 requests', async () => {
    const res = mockRes()
    for (let i = 0; i < 60; i++) {
      await rateLimitMiddleware(mockReq(), res as Response, next)
      expect(res.status).not.toHaveBeenCalledWith(429)
    }
  })

  it('blocks 61st request', async () => {
    const res = mockRes()
    await rateLimitMiddleware(mockReq(), res as Response, next)
    expect(res.status).toHaveBeenCalledWith(429)
    expect(res.json).toHaveBeenCalledWith({ error: 'Rate limit exceeded' })
  })
}) 