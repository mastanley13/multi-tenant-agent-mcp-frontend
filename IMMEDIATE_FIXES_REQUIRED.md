# 🚨 IMMEDIATE MCP INTEGRATION FIXES REQUIRED

## Critical Issue: Framework Misalignment

Our current implementation does NOT follow the OpenAI Agents JS framework patterns. We need to completely refactor the OpenAI integration.

## 🔥 Immediate Fixes Required

### 1. Replace Custom OpenAI Client with OpenAI Agents Framework

**Current Problem**:
```typescript
// client/lib/openai.ts - WRONG APPROACH
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
// Manual tool call handling, manual streaming, manual context management
```

**Correct Implementation** (Based on `/openai/openai-agents-js` docs):
```typescript
import { Agent, run, tool } from '@openai/agents'
import { MCPServerStdio } from '@modelcontextprotocol/typescript-sdk'

// Define MCP tools using OpenAI Agents pattern
const ghlContactTool = tool({
  name: 'ghl_create_contact',
  description: 'Create a contact in GoHighLevel',
  parameters: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email()
  }),
  execute: async (params) => {
    // This will call our MCP server
    return await mcpServer.call('create_contact', params)
  }
})

// Create agent with tools
const agent = new Agent({
  name: 'GoHighLevel Assistant',
  instructions: 'You help manage GoHighLevel CRM operations',
  tools: [ghlContactTool]
})

// Use the agent
const result = await run(agent, 'Create a contact for John Doe')
```

### 2. Fix MCP Server Integration

**Current Problem**: MCP server exists but not integrated with OpenAI Agents framework.

**Required Changes**:

1. **Update client/lib/openai.ts** - Replace entire file with OpenAI Agents pattern
2. **Create MCP Tools Bridge** - Connect OpenAI Agent tools to our MCP server
3. **Add Tenant Context Injection** - Pass tenant credentials to MCP server

### 3. Database Integration Fix

**Current**: Manual database queries in frontend
**Required**: Proper tenant context management

```typescript
// NEW: client/lib/tenant-context.ts
export async function getTenantContext(userId: string) {
  const tenantSecret = await prisma.tenantSecret.findUnique({
    where: { tenantId: userId }
  })
  
  if (!tenantSecret || tenantSecret.expiresAt < Date.now()) {
    throw new Error('Invalid or expired tenant credentials')
  }
  
  return {
    accessToken: tenantSecret.accessToken,
    locationId: tenantSecret.locationId,
    companyId: tenantSecret.companyId
  }
}
```

### 4. Fix Authentication Flow

**Current Problem**: Complex proxy setup to backend
**Required**: Direct MCP integration with tenant context

**New Flow**:
1. User authenticates with GoHighLevel OAuth → stores in TenantSecret
2. Frontend creates OpenAI Agent with tenant-specific MCP tools
3. Agent calls MCP server with injected tenant credentials
4. MCP server uses tenant's access token for GHL API calls

## 🎯 Step-by-Step Implementation

### Step 1: Install Dependencies
```bash
cd client
npm install @openai/agents @modelcontextprotocol/typescript-sdk zod
```

### Step 2: Create New OpenAI Agent Implementation
- Replace `client/lib/openai.ts` with OpenAI Agents framework
- Create `client/lib/mcp-tools.ts` for tool definitions
- Create `client/lib/tenant-context.ts` for credential management

### Step 3: Update MCP Server
- Modify `backend/mcp-src/src/server.ts` to accept tenant context
- Update all tools to use tenant-specific credentials
- Remove hardcoded environment variables

### Step 4: Fix Frontend Integration
- Update `client/app/api/chat/route.ts` to use new Agent pattern
- Remove manual tool call handling
- Implement proper streaming with OpenAI Agents

### Step 5: Database Updates
- Ensure TenantSecret model has all required fields
- Add token refresh mechanism
- Add credential validation

## 📋 Validation Checklist

After implementing fixes:
- [ ] Can create OpenAI Agent with custom MCP tools
- [ ] Agent properly calls MCP server with tenant context
- [ ] MCP server receives and uses tenant credentials
- [ ] GHL API calls work with tenant's access token
- [ ] Streaming responses work correctly
- [ ] Error handling works for expired tokens
- [ ] Multiple tenants can operate simultaneously

## 🚨 Critical Files to Modify

1. `client/lib/openai.ts` - Complete rewrite using OpenAI Agents
2. `client/app/api/chat/route.ts` - Use Agent.run() instead of custom logic
3. `backend/mcp-src/src/server.ts` - Add tenant context injection
4. `client/lib/auth.ts` - Add tenant context extraction
5. `client/components/chat-window.tsx` - Update to work with new Agent pattern

## 📚 Reference Documentation

- OpenAI Agents JS: `/openai/openai-agents-js` (Context7)
- GoHighLevel API: `/gohighlevel/highlevel-api-docs` (Context7)
- MCP SDK: `@modelcontextprotocol/typescript-sdk`

---

**PRIORITY**: These fixes are CRITICAL for MCP functionality. Current implementation will NOT work with proper multi-tenant MCP integration. 