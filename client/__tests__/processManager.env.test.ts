// @ts-nocheck
/** @jest-environment node */

// Mock tenant secrets to fixed values
jest.mock('../../backend/src/secrets', () => ({
  getTenantSecrets: jest.fn().mockResolvedValue({
    accessToken: 'token-abc',
    locationId: 'loc-xyz',
  }),
}))

const ctorSpy = jest.fn()
let capturedEnv: Record<string, string> | undefined

class FakeMCP {
  constructor(opts) {
    capturedEnv = opts.env
    ctorSpy(opts)
  }
  async connect() {}
  isConnected() { return true }
  async close() {}
}

jest.mock('@openai/agents', () => ({
  MCPServerStdio: jest.fn().mockImplementation((opts) => new FakeMCP(opts)),
}))

import { getProcess } from '../../backend/src/processManager'

describe('processManager env injection', () => {
  it('passes tenant secrets via env vars', async () => {
    await getProcess('tenant-env')
    expect(ctorSpy).toHaveBeenCalled()
    expect(capturedEnv).toMatchObject({
      GHL_ACCESS_TOKEN: 'token-abc',
      GHL_LOCATION_ID: 'loc-xyz',
      GHL_BASE_URL: expect.any(String),
    })
  })
}) 