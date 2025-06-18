// @ts-nocheck
/** @jest-environment node */

// jest globals are available automatically; no explicit import needed

// Use mocked timers so we can fast-forward for idle reaper tests
jest.useFakeTimers({ advanceTimers: 'modern' })

// Mock getTenantSecrets to return fixed credentials
jest.mock('../../backend/src/secrets', () => ({
  getTenantSecrets: jest.fn().mockResolvedValue({
    accessToken: 'fake-token',
    locationId: 'loc-123',
  }),
}))

// Capture constructor calls & methods of the fake MCP class
const connectSpy = jest.fn()
const closeSpy = jest.fn()

class FakeMCP {
  public connected = false
  constructor(public readonly config: any) {}
  async connect() {
    connectSpy(this.config)
    this.connected = true
  }
  async close() {
    closeSpy()
    this.connected = false
  }
}

// Mock the @openai/agents export so ProcessManager uses the fake class
jest.mock('@openai/agents', () => ({
  MCPServerStdio: jest.fn().mockImplementation((cfg) => new FakeMCP(cfg)),
}))

// Now import after the mocks so they take effect
import { getProcess, releaseProcess } from '../../backend/src/processManager'

describe('processManager', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('spawns a new MCP process on first request', async () => {
    const proc = await getProcess('tenant-a')
    expect(proc).toBeDefined()
    expect(connectSpy).toHaveBeenCalledTimes(1)
    // The constructor of FakeMCP must have been invoked once
    const MCPMock = require('@openai/agents').MCPServerStdio as jest.Mock
    expect(MCPMock).toHaveBeenCalledTimes(1)
    const firstInstance = proc

    // Second call with same tenant should reuse same instance (no new constructor)
    const reused = await getProcess('tenant-a')
    expect(reused).toBe(firstInstance)
    expect(MCPMock).toHaveBeenCalledTimes(1)
  })

  it('idle reaper removes idle process so a new one is spawned next time', async () => {
    const first = await getProcess('tenant-b')

    // Release reference so it becomes idle
    releaseProcess('tenant-b')

    const pm = await import('../../backend/src/processManager')
    await pm.__forceReapIdleForTests()

    // Next getProcess should spawn a new instance
    const MCPMock = require('@openai/agents').MCPServerStdio as jest.Mock

    const second = await getProcess('tenant-b')
    expect(second).not.toBe(first)
    expect(MCPMock).toHaveBeenCalledTimes(2) // new constructor call
  })
}) 