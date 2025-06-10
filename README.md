# GoHighLevel MCP Integration with OpenAI Agents

This example demonstrates how to integrate a **GoHighLevel MCP server** with the OpenAI Agents framework for intelligent business automation.

> **📋 Setup Required**: You'll need to configure the examples with your GoHighLevel MCP server path and credentials (see setup instructions below).

## 🎯 **Prerequisites**

1. **GoHighLevel MCP Server**: A compatible GHL MCP server with stdio support ([example implementation](https://github.com/yourusername/ghl-mcp-server))
2. **GHL API Credentials**: Valid GoHighLevel API key and location ID from your GHL account
3. **Node.js Environment**: Node.js 18+ with TypeScript support

## 📁 **Project Structure**

```
examples/ghl-integration/
├── server.ts                     # Main chat server with frontend UI
├── server/
│   ├── basic-example.ts          # Simple GHL agent example
│   ├── specialized-agents-example.ts # Multi-agent business workflow
│   └── chat-example.ts           # Chat interface example
├── client/                       # Frontend React application
├── package.json                  # Dependencies and scripts
├── SETUP.md                      # Detailed setup instructions
└── README.md                     # This file
```

## 🚀 **Quick Start**

### 1. Environment Setup

Create a `.env` file in this directory with your GHL credentials:

```bash
# Create .env file with your actual credentials
GHL_API_KEY=your_actual_ghl_api_key_here
GHL_LOCATION_ID=your_actual_ghl_location_id_here
GHL_BASE_URL=https://services.leadconnectorhq.com
```

### 2. Install Dependencies

```bash
# From the repository root
pnpm install

# Or just for this example
pnpm install --filter ghl-integration
```

### 3. Configure MCP Server Path

Update the server path in the example files to point to your GHL MCP server:

```typescript
// Update this path to your actual GHL MCP server location
fullCommand: 'node /path/to/your/ghl-mcp-server/dist/server.js'
```

### 4. Run Examples

```bash
# Start the main chat server with UI
npm run dev

# Or run individual examples:
# Basic example - Simple GHL operations
npx tsx server/basic-example.ts

# Specialized agents - Multi-agent workflows  
npx tsx server/specialized-agents-example.ts

# Chat interface example
npx tsx server/chat-example.ts
```

## 📋 **Examples Overview**

### **Basic Example** (`server/basic-example.ts`)

Demonstrates fundamental MCP integration patterns:

- ✅ Connecting to a GHL MCP server
- ✅ Listing available tools from the server
- ✅ Creating simple agents with GHL access
- ✅ Performing basic CRM operations
- ✅ Error handling and cleanup

**Perfect for**: Understanding the core integration mechanics

### **Specialized Agents Example** (`server/specialized-agents-example.ts`)

Demonstrates advanced multi-agent patterns:

- 🏢 **CRM Agent**: Contact and relationship management
- 💰 **Sales Agent**: Opportunities and pipeline operations  
- 📧 **Marketing Agent**: Campaigns and automation workflows
- 🎧 **Customer Service Agent**: Support and retention activities
- 🎭 **Workflow Orchestrator**: Coordinates complex multi-department workflows

**Perfect for**: Building sophisticated business automation systems

### **Chat Server Example** (`server.ts`)

Complete chat interface with real-time frontend:

- 🎮 **Interactive UI**: React-based chat interface
- 🔄 **Real-time Communication**: WebSocket integration
- 🤖 **AI Assistant**: Full-featured GoHighLevel assistant
- 📊 **Tool Execution**: Visual feedback for GHL operations
- 🎯 **Production Ready**: Complete server implementation

**Perfect for**: Building user-facing GHL automation tools

## 🔧 **Key Integration Points**

### **1. MCP Server Configuration**

```typescript
const ghlMcpServer = new MCPServerStdio({
  name: 'GoHighLevel MCP Server',
  fullCommand: 'node /path/to/your/ghl-mcp-server/dist/server.js',
  env: {
    GHL_API_KEY: process.env.GHL_API_KEY!,
    GHL_BASE_URL: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
    GHL_LOCATION_ID: process.env.GHL_LOCATION_ID!,
  },
  cacheToolsList: true,
  clientSessionTimeoutSeconds: 10,
});
```

### **2. Agent Creation with MCP Access**

```typescript
const agent = new Agent({
  name: 'GHL Assistant',
  instructions: 'Your specialized instructions...',
  mcpServers: [ghlMcpServer],  // This provides tool access
});
```

### **3. Multi-Agent Handoffs**

```typescript
const orchestrator = new Agent({
  name: 'Workflow Orchestrator',
  instructions: 'Coordinate complex operations...',
  handoffs: [crmAgent, salesAgent, marketingAgent],  // Agent delegation
});
```

## 🎛️ **Configuration Options**

### **MCPServerStdio Options**

| Option | Type | Description |
|--------|------|-------------|
| `name` | string | Descriptive name for your MCP server |
| `fullCommand` | string | Complete command to start your server |
| `command` + `args` | string + array | Alternative: separate command and arguments |
| `env` | object | Environment variables for your server |
| `cacheToolsList` | boolean | Cache tools for better performance (default: true) |
| `clientSessionTimeoutSeconds` | number | Connection timeout (default: 5) |
| `cwd` | string | Working directory for server execution |

### **Environment Variables**

```bash
# Required GHL Credentials
GHL_API_KEY=your_ghl_api_key_here
GHL_LOCATION_ID=your_ghl_location_id_here

# Optional Configuration
GHL_BASE_URL=https://services.leadconnectorhq.com
NODE_ENV=development
```

## 🔄 **Connection Lifecycle**

```typescript
// 1. Create MCP server instance
const mcpServer = new MCPServerStdio({ /* config */ });

// 2. Connect to server (starts child process)
await mcpServer.connect();

// 3. Use in agents
const agent = new Agent({ mcpServers: [mcpServer] });

// 4. Always cleanup when done
await mcpServer.close();
```

## 🛠️ **Troubleshooting**

### **Connection Issues**

```bash
Error: Command failed: node /path/to/server.js
```

**Solutions**:
- ✅ Verify the path to your GHL MCP server is correct
- ✅ Ensure your server script is executable: `chmod +x server.js` (Unix/Linux)
- ✅ Test your server independently: `node /path/to/your/server.js`
- ✅ Check that your GHL MCP server supports stdio communication

### **Authentication Issues**

```bash
Error: GHL_API_KEY is required
```

**Solutions**:
- ✅ Check your `.env` file exists and contains valid credentials
- ✅ Verify API key has proper permissions in GoHighLevel
- ✅ Confirm location ID is correct for your GHL account

### **Tool Discovery Issues**

```bash
Found 0 tools from GHL MCP server
```

**Solutions**:
- ✅ Verify your MCP server implements the `tools/list` method
- ✅ Check server logs for any startup errors
- ✅ Ensure your server properly exports tools in MCP format
- ✅ Test the MCP server directly before integration

### **Runtime Issues**

```bash
Error: Server not initialized. Make sure you call connect() first.
```

**Solutions**:
- ✅ Always call `await mcpServer.connect()` before using
- ✅ Handle connection errors with try/catch blocks
- ✅ Implement proper cleanup with `await mcpServer.close()`

## 🏗️ **Architecture Notes**

### **Why This Approach Works**

1. **🔌 Loose Coupling**: Your MCP server remains independent and focused
2. **📈 Scalability**: Each component can scale independently
3. **🔄 Flexibility**: Easy to update either side without affecting the other
4. **🎯 Specialization**: Agents focus on business logic, MCP server handles API integration

### **Process Communication**

```
┌─────────────────┐    stdio     ┌──────────────────┐    HTTP/API    ┌─────────────┐
│   OpenAI Agent  │◄────────────►│  GHL MCP Server  │◄──────────────►│  GHL APIs   │
│    (Business    │   JSON-RPC   │  (Integration    │   REST/GraphQL │ (CRM Data)  │
│     Logic)      │              │     Layer)       │                │             │
└─────────────────┘              └──────────────────┘                └─────────────┘
```

The OpenAI Agents framework spawns the GHL MCP server as a child process and communicates via JSON-RPC over stdio. The MCP server handles all the GoHighLevel API complexity, while the agents focus on intelligent business workflows.

## 🚀 **Next Steps**

1. **Setup**: Configure your GHL MCP server path and credentials
2. **Start Simple**: Run the basic example to verify integration
3. **Try the UI**: Launch the chat server for interactive testing
4. **Customize Agents**: Modify instructions for your specific business needs
5. **Add Tools**: Extend your MCP server with additional GHL capabilities
6. **Scale Up**: Use the specialized agents pattern for complex workflows
7. **Deploy**: Consider containerization for production deployments

## 📚 **Additional Resources**

- [OpenAI Agents Documentation](https://github.com/openai/agents-js)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [GoHighLevel API Documentation](https://highlevel.stoplight.io/)

---

**🎉 You now have a complete framework for building intelligent GoHighLevel automation with OpenAI models!** 