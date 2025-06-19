"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agents_1 = require("@openai/agents");
require("dotenv/config");
/**
 * Base class for GoHighLevel specialized agents
 */
class BaseGHLAgent {
    constructor(name, instructions, mcpServer, toolFilter) {
        this.mcpServer = mcpServer;
        this.agent = new agents_1.Agent({
            name,
            instructions: `${instructions}
      
      Important: Always use the available GoHighLevel tools to perform operations.
      Be specific about what actions you're taking and their results.
      If a tool call fails, explain what went wrong and suggest alternatives.`,
            mcpServers: [mcpServer],
            // Note: Tool filtering happens at the MCP server level, not here
            // The OpenAI Agents framework doesn't have built-in tool filtering
            // You would need to implement this in your MCP server if needed
        });
    }
    async execute(input) {
        return await (0, agents_1.run)(this.agent, input);
    }
    get agentInstance() {
        return this.agent;
    }
}
/**
 * CRM Agent - Specialized for contact and relationship management
 */
class CRMAgent extends BaseGHLAgent {
    constructor(mcpServer) {
        super('GHL CRM Specialist', `You are a GoHighLevel CRM expert specializing in:
       - Contact management and segmentation
       - Task and note management  
       - Customer relationship optimization
       - Data organization and cleanup
       
       Focus on contact-related operations and relationship building activities.`, mcpServer);
    }
    getHandoffDescription() {
        return 'Expert in customer relationship management and contact operations. Handles contact creation, updates, segmentation, and relationship tracking.';
    }
}
/**
 * Sales Agent - Specialized for opportunities and pipeline management
 */
class SalesAgent extends BaseGHLAgent {
    constructor(mcpServer) {
        super('GHL Sales Specialist', `You are a GoHighLevel sales expert specializing in:
       - Opportunity creation and management
       - Pipeline optimization and tracking
       - Deal progression and forecasting
       - Sales workflow automation
       
       Focus on revenue-generating activities and sales process optimization.`, mcpServer);
    }
    getHandoffDescription() {
        return 'Expert in sales operations and opportunity management. Handles deal creation, pipeline management, and sales process optimization.';
    }
}
/**
 * Marketing Agent - Specialized for campaigns and automation
 */
class MarketingAgent extends BaseGHLAgent {
    constructor(mcpServer) {
        super('GHL Marketing Specialist', `You are a GoHighLevel marketing expert specializing in:
       - Campaign creation and management
       - Automation workflow setup
       - Lead nurturing sequences
       - Marketing analytics and optimization
       
       Focus on marketing activities that drive engagement and conversions.`, mcpServer);
    }
    getHandoffDescription() {
        return 'Expert in marketing campaigns and automation workflows. Handles campaign setup, lead nurturing, and marketing process optimization.';
    }
}
/**
 * Customer Service Agent - Specialized for support and retention
 */
class CustomerServiceAgent extends BaseGHLAgent {
    constructor(mcpServer) {
        super('GHL Customer Service Specialist', `You are a GoHighLevel customer service expert specializing in:
       - Customer support ticket management
       - Issue resolution and tracking
       - Customer satisfaction monitoring
       - Retention and follow-up activities
       
       Focus on maintaining excellent customer relationships and resolving issues efficiently.`, mcpServer);
    }
    getHandoffDescription() {
        return 'Expert in customer service and support operations. Handles issue resolution, customer satisfaction, and retention activities.';
    }
}
/**
 * Workflow Orchestrator - Coordinates between specialized agents
 */
class WorkflowOrchestrator {
    constructor(crmAgent, salesAgent, marketingAgent, customerServiceAgent) {
        this.specializedAgents = {
            crm: crmAgent,
            sales: salesAgent,
            marketing: marketingAgent,
            customerService: customerServiceAgent
        };
        this.orchestratorAgent = new agents_1.Agent({
            name: 'GHL Workflow Orchestrator',
            instructions: `You coordinate complex GoHighLevel operations across different business functions.
      
      You have access to specialized agents for:
      - CRM operations (contacts, relationships)
      - Sales operations (opportunities, pipelines)  
      - Marketing operations (campaigns, automation)
      - Customer Service operations (support, retention)
      
      When handling complex requests:
      1. Break down the request into functional areas
      2. Delegate specific tasks to appropriate specialists
      3. Coordinate the sequence of operations
      4. Provide comprehensive status updates
      
      Always explain your delegation strategy and coordination approach.`,
            handoffs: [
                crmAgent.agentInstance,
                salesAgent.agentInstance,
                marketingAgent.agentInstance,
                customerServiceAgent.agentInstance
            ]
        });
    }
    async executeWorkflow(workflowDescription) {
        return await (0, agents_1.run)(this.orchestratorAgent, workflowDescription);
    }
}
async function main() {
    // Setup GHL MCP Server with your exact Windows path
    const ghlMcpServer = new agents_1.MCPServerStdio({
        name: 'GoHighLevel MCP Server',
        command: 'node',
        args: ['C:\\Users\\Mykel\\OneDrive\\Desktop\\GHL MCP\\ghl-mcp-server\\dist\\server.js'],
        env: {
            GHL_API_KEY: process.env.GHL_API_KEY,
            GHL_BASE_URL: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
            GHL_LOCATION_ID: process.env.GHL_LOCATION_ID,
            NODE_ENV: process.env.NODE_ENV || 'development',
        },
        cacheToolsList: true,
        clientSessionTimeoutSeconds: 10,
    });
    console.log('Connecting to GHL MCP Server...');
    await ghlMcpServer.connect();
    console.log('✅ Connected successfully!');
    try {
        await (0, agents_1.withTrace)('GHL Specialized Agents Example', async () => {
            // Create specialized agents
            console.log('🏗️  Creating specialized agents...');
            const crmAgent = new CRMAgent(ghlMcpServer);
            const salesAgent = new SalesAgent(ghlMcpServer);
            const marketingAgent = new MarketingAgent(ghlMcpServer);
            const customerServiceAgent = new CustomerServiceAgent(ghlMcpServer);
            // Create workflow orchestrator
            const orchestrator = new WorkflowOrchestrator(crmAgent, salesAgent, marketingAgent, customerServiceAgent);
            console.log('✅ All agents created successfully!\n');
            // Example 1: Direct CRM Operation
            console.log('=== Example 1: Direct CRM Operation ===');
            let result = await crmAgent.execute('Create a new contact for Maria Garcia with email maria@startup.com and phone +1555123456. Add a note that she\'s interested in our premium package.');
            console.log(result.finalOutput ?? result.output ?? result);
            console.log('');
            // Example 2: Direct Sales Operation  
            console.log('=== Example 2: Direct Sales Operation ===');
            result = await salesAgent.execute('Create a new opportunity called "Enterprise Software License" worth $15,000 for Maria Garcia. Set it to the "Proposal" stage.');
            console.log(result.finalOutput ?? result.output ?? result);
            console.log('');
            // Example 3: Complex Workflow via Orchestrator
            console.log('=== Example 3: Complex Customer Onboarding Workflow ===');
            result = await orchestrator.executeWorkflow(`
        Complete customer onboarding for a new enterprise client:
        
        1. CRM Tasks:
           - Create contact: David Chen, david@techcorp.com, +1555987654
           - Add company: TechCorp Industries  
           - Tag as "Enterprise Client"
           - Create initial consultation task
        
        2. Sales Tasks:
           - Create opportunity: "Enterprise Implementation" worth $25,000
           - Set to "Discovery" stage
           - Add projected close date of 30 days from now
        
        3. Marketing Tasks:
           - Add to enterprise nurture sequence
           - Send welcome email series
           - Schedule follow-up touchpoints
        
        4. Customer Service Tasks:
           - Create onboarding checklist
           - Assign account manager
           - Schedule kickoff meeting
        
        Coordinate these activities and provide a comprehensive status report.
      `);
            console.log(result.finalOutput ?? result.output ?? result);
            console.log('');
            // Example 4: Multi-Agent Coordination
            console.log('=== Example 4: Multi-Agent Lead Processing ===');
            result = await orchestrator.executeWorkflow(`
        Process a hot lead from our website form:
        
        Lead Details:
        - Name: Jennifer Smith
        - Email: jennifer@digitalagency.com  
        - Company: Digital Marketing Pro
        - Interest: Marketing automation setup
        - Budget: $5,000-10,000
        - Timeline: ASAP
        
        Please coordinate a complete lead processing workflow across all departments.
      `);
            console.log(result.finalOutput ?? result.output ?? result);
        });
    }
    finally {
        console.log('\nClosing MCP server connection...');
        await ghlMcpServer.close();
        console.log('✅ Connection closed successfully');
    }
}
// Error handling with detailed logging
main().catch((err) => {
    console.error('❌ Error occurred:');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    if (err.message.includes('GHL_API_KEY')) {
        console.error('\n💡 Hint: Make sure your .env file contains valid GHL credentials');
    }
    process.exit(1);
});
