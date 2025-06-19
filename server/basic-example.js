"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agents_1 = require("@openai/agents");
require("dotenv/config");
async function main() {
    // Configure your GHL MCP Server with your exact Windows path
    const ghlMcpServer = new agents_1.MCPServerStdio({
        name: 'GoHighLevel MCP Server',
        // Using command + args (handles Windows paths with spaces better)
        command: 'node',
        args: ['C:\\Users\\Mykel\\OneDrive\\Desktop\\GHL MCP\\ghl-mcp-server\\dist\\server.js'],
        // Alternative option using fullCommand (can have issues with spaces on Windows)
        // fullCommand: 'node "C:\\Users\\Mykel\\OneDrive\\Desktop\\GHL MCP\\ghl-mcp-server\\dist\\server.js"',
        // Environment variables your GHL MCP server needs
        env: {
            GHL_API_KEY: process.env.GHL_API_KEY,
            GHL_BASE_URL: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
            GHL_LOCATION_ID: process.env.GHL_LOCATION_ID,
            NODE_ENV: process.env.NODE_ENV || 'development',
        },
        // Optional configuration
        cacheToolsList: true, // Cache tools for better performance
        clientSessionTimeoutSeconds: 10,
    });
    // Connect to the MCP server
    await ghlMcpServer.connect();
    try {
        await (0, agents_1.withTrace)('GHL Basic Example', async () => {
            // Create an agent with access to your GHL MCP server
            const agent = new agents_1.Agent({
                name: 'GHL Assistant',
                instructions: `You are a GoHighLevel assistant with access to GHL CRM tools.
        Use the available tools to help with GoHighLevel operations.
        Always be specific about what actions you're taking and provide clear results.
        If you cannot find specific information, say so rather than making assumptions.`,
                mcpServers: [ghlMcpServer], // This is the key connection
            });
            // List available tools
            console.log('=== Available GHL Tools ===');
            const tools = await agent.getMcpTools();
            console.log(`Found ${tools.length} tools from your GHL MCP server:`);
            tools.forEach(tool => {
                console.log(`• ${tool.name}: ${tool.description || 'No description provided'}`);
            });
            console.log('');
            // Test basic contact operations
            let message = 'List the first 3 contacts in the system to see what data we have available.';
            console.log(`Running: ${message}`);
            let result = await (0, agents_1.run)(agent, message);
            console.log(result.finalOutput ?? result.output ?? result);
            console.log('');
            // Test contact creation
            message = 'Create a test contact with name "Alex Johnson", email "alex@example.com", and phone "+1555000123".';
            console.log(`Running: ${message}`);
            result = await (0, agents_1.run)(agent, message);
            console.log(result.finalOutput ?? result.output ?? result);
            console.log('');
            // Test opportunity operations
            message = 'Check if there are any opportunities in the system and show me the first few.';
            console.log(`Running: ${message}`);
            result = await (0, agents_1.run)(agent, message);
            console.log(result.finalOutput ?? result.output ?? result);
            console.log('');
            // Test a complex operation
            message = `Help me understand my GHL setup by:
      1. Showing me a summary of contacts count
      2. Showing me available pipelines
      3. Listing any recent activities
      
      Provide a brief summary of the current state.`;
            console.log(`Running: ${message}`);
            result = await (0, agents_1.run)(agent, message);
            console.log(result.finalOutput ?? result.output ?? result);
        });
    }
    finally {
        // Always clean up the connection
        await ghlMcpServer.close();
    }
}
// Handle errors gracefully
main().catch((err) => {
    console.error('Error:', err);
    // Provide helpful error messages
    if (err.message.includes('connect')) {
        console.error('\n💡 Connection Error: Check that your GHL MCP server path is correct and the server is accessible.');
    }
    if (err.message.includes('GHL_API_KEY')) {
        console.error('\n💡 API Key Error: Make sure your .env file contains valid GHL credentials.');
    }
    if (err.message.includes('spawn')) {
        console.error('\n💡 Server Start Error: Check that Node.js can execute your MCP server script.');
    }
    process.exit(1);
});
