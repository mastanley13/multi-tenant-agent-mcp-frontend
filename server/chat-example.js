"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agents_1 = require("@openai/agents");
const promises_1 = require("node:readline/promises");
require("dotenv/config");
const rl = (0, promises_1.createInterface)({ input: process.stdin, output: process.stdout });
async function ask(prompt) {
    const message = await rl.question(prompt);
    return message;
}
let history = [];
let ghlAgent;
let ghlMcpServer;
async function initializeGHLAgent() {
    console.log('🚀 Initializing GoHighLevel AI Agent...\n');
    // Configure GHL MCP Server
    ghlMcpServer = new agents_1.MCPServerStdio({
        name: 'GoHighLevel MCP Server - Chat Interface',
        command: 'node',
        args: ['C:\\Users\\Mykel\\OneDrive\\Desktop\\GHL MCP\\ghl-mcp-server\\dist\\server.js'],
        env: {
            GHL_API_KEY: process.env.GHL_API_KEY,
            GHL_LOCATION_ID: process.env.GHL_LOCATION_ID,
            GHL_BASE_URL: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
            NODE_ENV: 'development',
        },
        cacheToolsList: true,
        clientSessionTimeoutSeconds: 20,
    });
    await ghlMcpServer.connect();
    // Get tools with non-strict validation (the approach that works)
    console.log('🔧 Loading GHL tools with non-strict validation...');
    const mcpTools = await (0, agents_1.withTrace)('load-ghl-mcp-tools', async () => {
        return await (0, agents_1.getAllMcpTools)([ghlMcpServer], false);
    });
    console.log(`✅ Loaded ${mcpTools.length} GHL tools successfully!\n`);
    // Create the conversational agent
    ghlAgent = new agents_1.Agent({
        name: 'GoHighLevel AI Assistant',
        instructions: `You are an expert GoHighLevel AI assistant with full access to GHL CRM capabilities.

🎯 **Your Abilities:**
- Contact Management: Search, create, update, delete contacts, manage tags, notes, tasks
- Opportunity Management: Create deals, manage pipelines, track sales progress
- Calendar & Appointments: Schedule meetings, check availability, manage bookings
- Messaging: Send SMS and emails, manage conversations
- Marketing: Create campaigns, manage social media posts, email templates
- Location Management: Handle sub-accounts, custom fields, workflows
- Payments & Invoicing: Process payments, create invoices, manage subscriptions
- Custom Objects: Manage any custom data structures
- And much more with 250+ available tools!

🗣️ **Conversation Style:**
- Be conversational and helpful
- Ask clarifying questions when needed
- Explain what you're doing when using tools
- Provide actionable insights and suggestions
- Be proactive in suggesting related actions

🔍 **When the user asks about anything GHL-related:**
1. Use the appropriate tools to get real data
2. Provide specific, actionable information
3. Suggest follow-up actions when relevant
4. Explain any results clearly

Examples of what you can help with:
- "Show me my recent contacts"
- "Create a new contact for John Smith at john@company.com"
- "What opportunities are in my sales pipeline?"
- "Schedule a meeting for tomorrow at 2pm"
- "Send an SMS to my latest lead"
- "Show me my appointment calendar for this week"
- "Create an invoice for $500 for John Smith"
- "What social media posts did I publish recently?"

Always use real GHL data and provide specific, actionable responses!`,
        tools: mcpTools, // All 253 tools loaded with non-strict validation
        modelSettings: {
            temperature: 0.7, // Slightly more creative for conversation
            maxTokens: 2000,
        }
    });
    console.log('🎉 GoHighLevel AI Assistant is ready for conversation!\n');
}
async function startChat() {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                   🚀 GoHighLevel AI Chat                      ║');
    console.log('║                                                                ║');
    console.log('║  Chat with your AI assistant that has full access to your     ║');
    console.log('║  GoHighLevel CRM with 250+ tools for complete automation!     ║');
    console.log('║                                                                ║');
    console.log('║  Examples:                                                     ║');
    console.log('║  • "Show me my recent contacts"                                ║');
    console.log('║  • "Create a contact for Sarah at sarah@company.com"          ║');
    console.log('║  • "What deals are in my pipeline?"                           ║');
    console.log('║  • "Schedule a meeting for tomorrow at 2pm"                   ║');
    console.log('║  • "Send an SMS to my latest lead"                            ║');
    console.log('║                                                                ║');
    console.log('║  Type "exit" to quit, "help" for more examples                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('');
    await (0, agents_1.withTrace)('GHL AI Chat Session', async () => {
        while (true) {
            try {
                const message = await ask('💬 You: ');
                if (message.toLowerCase() === 'exit') {
                    console.log('\n👋 Thanks for using GoHighLevel AI Assistant!');
                    break;
                }
                if (message.toLowerCase() === 'help') {
                    showHelpExamples();
                    continue;
                }
                if (!message.trim()) {
                    continue;
                }
                history.push((0, agents_1.user)(message));
                console.log('\n🤖 GHL AI Assistant: ');
                console.log('─'.repeat(50));
                const result = await (0, agents_1.run)(ghlAgent, history);
                console.log(result.finalOutput ?? result.output ?? result);
                console.log('─'.repeat(50));
                console.log('');
                history = result.history;
            }
            catch (error) {
                console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
                console.log('Please try again or type "help" for examples.\n');
            }
        }
    });
}
function showHelpExamples() {
    console.log('\n📚 **Example Commands You Can Try:**\n');
    console.log('📞 **Contact Management:**');
    console.log('• "Show me my last 5 contacts"');
    console.log('• "Create a contact for Alex Johnson with email alex@startup.com"');
    console.log('• "Find contacts tagged as hot leads"');
    console.log('• "Add a note to contact ID 12345 saying they\'re interested in premium plan"');
    console.log('');
    console.log('💰 **Sales & Opportunities:**');
    console.log('• "What deals are currently in my sales pipeline?"');
    console.log('• "Create an opportunity for $5000 called Website Redesign for John Smith"');
    console.log('• "Show me won deals from this month"');
    console.log('• "Move opportunity ID 67890 to closing stage"');
    console.log('');
    console.log('🗓️ **Calendar & Appointments:**');
    console.log('• "Show me my appointments for this week"');
    console.log('• "Check my calendar availability for tomorrow"');
    console.log('• "Create an appointment for Friday at 3pm with Sarah Johnson"');
    console.log('• "What appointments do I have today?"');
    console.log('');
    console.log('💬 **Messaging:**');
    console.log('• "Send an SMS to +1234567890 saying the proposal is ready"');
    console.log('• "Show me recent conversations"');
    console.log('• "Send a follow-up email to my latest lead"');
    console.log('');
    console.log('📊 **Analytics & Reporting:**');
    console.log('• "How many contacts do I have total?"');
    console.log('• "What\'s my sales performance this month?"');
    console.log('• "Show me my most active contacts"');
    console.log('');
    console.log('🎯 **Advanced Operations:**');
    console.log('• "Create a complete customer onboarding workflow for enterprise clients"');
    console.log('• "Set up automated follow-up for leads who haven\'t responded in 3 days"');
    console.log('• "Generate a sales report for Q4 performance"');
    console.log('');
}
async function cleanup() {
    if (ghlMcpServer) {
        console.log('🧹 Cleaning up MCP connection...');
        await ghlMcpServer.close();
    }
    rl.close();
}
async function main() {
    try {
        await initializeGHLAgent();
        await startChat();
    }
    catch (error) {
        console.error('❌ Initialization error:', error instanceof Error ? error.message : String(error));
    }
    finally {
        await cleanup();
    }
}
// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n\n⏹️  Shutting down gracefully...');
    await cleanup();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await cleanup();
    process.exit(0);
});
main().catch(async (error) => {
    console.error('❌ Fatal error:', error instanceof Error ? error.message : String(error));
    await cleanup();
    process.exit(1);
});
