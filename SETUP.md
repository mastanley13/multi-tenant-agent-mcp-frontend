# 🚀 GoHighLevel MCP Integration Setup Guide

## 📋 **Prerequisites Checklist**

Before starting, ensure you have:

- [ ] **Working GHL MCP Server** with stdio support (confirmed ✅)
- [ ] **GoHighLevel API Access** with valid credentials
- [ ] **Node.js 18+** installed locally
- [ ] **TypeScript support** (tsx or ts-node)

## 🔑 **Environment Configuration**

### 1. Create Environment File

Create a `.env` file in this directory with the following variables:

```bash
# Required: Your GoHighLevel API credentials
GHL_API_KEY=your_ghl_api_key_here
GHL_LOCATION_ID=your_ghl_location_id_here

# Optional: GoHighLevel configuration  
GHL_BASE_URL=https://services.leadconnectorhq.com

# Optional: Development configuration
NODE_ENV=development

# Optional: OpenAI API key (if you want to use different models)
# OPENAI_API_KEY=your_openai_api_key_here

# Optional: Logging and debugging
LOG_LEVEL=info
DEBUG=openai-agents:*
```

### 2. Get Your GHL Credentials

**API Key Location:**
1. Go to your GoHighLevel account
2. Navigate to: Settings → Integrations → API Keys
3. Create or copy your API key

**Location ID Location:**
1. In your GHL dashboard, check the URL
2. The location ID is in the URL: `app.gohighlevel.com/location/{LOCATION_ID}/dashboard`
3. Or go to: Settings → Company Info

## 📁 **Configure Server Path**

In **both example files**, update the path to your GHL MCP server:

```typescript
// ✅ UPDATED with your actual Windows path
const ghlMcpServer = new MCPServerStdio({
  name: 'GoHighLevel MCP Server',
  
  // Your server path (quotes handle spaces in Windows paths):
  fullCommand: 'node "C:\\Users\\Mykel\\OneDrive\\Desktop\\GHL MCP\\ghl-mcp-server\\dist\\server.js"',
  
  // Alternative using command + args (often more reliable on Windows):
  // command: 'node',
  // args: ['C:\\Users\\Mykel\\OneDrive\\Desktop\\GHL MCP\\ghl-mcp-server\\dist\\server.js'],
  
  // Rest of config...
});
```

### Common Server Locations:

- **Your setup**: `node "C:\\Users\\Mykel\\OneDrive\\Desktop\\GHL MCP\\ghl-mcp-server\\dist\\server.js"`
- **Local development**: `node ./dist/server.js`
- **Windows with spaces**: Always use quotes: `"C:\\Path With Spaces\\server.js"`
- **NPM global**: `npx ghl-mcp-server` (if published)
- **Docker**: `docker run your-ghl-mcp-server`

**Windows Path Tips**:
- Use double backslashes `\\` or forward slashes `/`
- Wrap paths with spaces in quotes: `"path with spaces"`
- Test your path first: `node "C:\\Your\\Path\\server.js"`

## 🧪 **Testing Your Connection**

### 1. Test Your MCP Server Independently

First, verify your MCP server works:

```bash
# Test your specific server path
node "C:\Users\Mykel\OneDrive\Desktop\GHL MCP\ghl-mcp-server\dist\server.js"

# Or test with a simple tools list request
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node "C:\Users\Mykel\OneDrive\Desktop\GHL MCP\ghl-mcp-server\dist\server.js"
```

You should see:
1. No immediate errors (server starts successfully)
2. JSON response with your available GHL tools

### 2. Test Environment Variables

Create a quick test script:

```typescript
// test-env.ts
import 'dotenv/config';

console.log('GHL_API_KEY:', process.env.GHL_API_KEY ? '✅ Set' : '❌ Missing');
console.log('GHL_LOCATION_ID:', process.env.GHL_LOCATION_ID ? '✅ Set' : '❌ Missing');
console.log('Server path check:', process.env.GHL_SERVER_PATH || 'Update hardcoded path in examples');
```

Run: `npx tsx test-env.ts`

## 🚀 **Running the Examples**

### Option 1: Basic Example (Recommended first)

```bash
# Install dependencies
pnpm install --filter ghl-integration

# Run basic example
pnpm -F ghl-integration start
```

### Option 2: Specialized Agents Example

```bash
# Run advanced multi-agent example
pnpm -F ghl-integration start:specialized
```

## 🐛 **Troubleshooting Common Issues**

### **Issue: "Command failed" Error**

```
Error: Command failed: node /path/to/server.js
```

**Solutions:**
1. Check the path is correct: `ls -la /path/to/your/server.js`
2. Test manually: `node /path/to/your/server.js`
3. Check permissions: `chmod +x /path/to/your/server.js`

### **Issue: "GHL_API_KEY is required"**

```
Error: GHL_API_KEY is required
```

**Solutions:**
1. Verify `.env` file exists in the correct directory
2. Check the API key format (no spaces, quotes, etc.)
3. Test environment loading: `node -e "require('dotenv').config(); console.log(process.env.GHL_API_KEY)"`

### **Issue: "Found 0 tools"**

```
Found 0 tools from your GHL MCP server
```

**Solutions:**
1. Check your MCP server logs for startup errors
2. Verify the server implements the MCP `tools/list` method
3. Test the tools endpoint manually (see testing section above)

### **Issue: Connection Timeout**

```
Error: Client session timeout
```

**Solutions:**
1. Increase timeout: `clientSessionTimeoutSeconds: 30`
2. Check if your server is slow to start
3. Verify network connectivity to GHL APIs from your server

## 🔧 **Advanced Configuration**

### Custom Working Directory

If your MCP server needs to run from a specific directory:

```typescript
const ghlMcpServer = new MCPServerStdio({
  // ... other config
  cwd: '/path/to/your/ghl-mcp-server',
});
```

### Custom Environment Variables

Pass additional environment variables to your server:

```typescript
const ghlMcpServer = new MCPServerStdio({
  // ... other config
  env: {
    ...process.env,  // Include current environment
    GHL_API_KEY: process.env.GHL_API_KEY!,
    GHL_LOCATION_ID: process.env.GHL_LOCATION_ID!,
    CUSTOM_SERVER_CONFIG: 'value',
    LOG_LEVEL: 'debug',
  },
});
```

### Multiple MCP Servers

You can connect multiple MCP servers to one agent:

```typescript
const agent = new Agent({
  name: 'Multi-System Agent',
  instructions: 'You have access to multiple systems...',
  mcpServers: [ghlMcpServer, otherMcpServer],
});
```

## ✅ **Success Indicators**

When everything is working correctly, you should see:

1. **Connection Success**: `✅ Connected successfully!`
2. **Tools Discovery**: `Found X tools from your GHL MCP server:`
3. **Tool Execution**: Actual responses from your GHL system
4. **Clean Shutdown**: `✅ Connection closed successfully`

## 🎯 **Next Steps After Setup**

1. **Customize Instructions**: Modify agent instructions for your business
2. **Add Error Handling**: Implement robust error handling for production
3. **Create Specialized Workflows**: Build agents for specific business processes
4. **Scale Architecture**: Consider deployment strategies for production

---

**🎉 Once setup is complete, you'll have OpenAI-powered agents with full access to your GoHighLevel system!** 