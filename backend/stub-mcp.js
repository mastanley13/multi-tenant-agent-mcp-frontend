#!/usr/bin/env node
// Simple stub MCP that satisfies @openai/agents handshake for local dev.
// It writes a single JSON line describing zero tools and then echoes back
// minimal success responses for any incoming requests.

const readline = require('readline')

// Echo generic OK for each input line to keep agent happy
const rl = readline.createInterface({ input: process.stdin })
rl.on('line', (line) => {
  console.error('MCP-STUB>>', line)
  try {
    const req = JSON.parse(line)
    const res = { id: req.id, jsonrpc: '2.0', result: {} }
    if (req.method === 'initialize' || req.method === 'server_metadata') {
      res.result = {
        protocolVersion: '2025-03-26',
        capabilities: {},
        serverInfo: { name: 'Stub MCP', version: '0.0.1' },
      }
    } else if (req.method === 'list_tools') {
      res.result = { tools: [] }
    } else {
      res.result = { ok: true }
    }
    process.stdout.write(JSON.stringify(res) + '\n')
  } catch (err) {
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', error: { code: -32603, message: 'parse error' } }) + '\n')
  }
})

// Keep process alive
setInterval(() => {}, 1 << 30) 