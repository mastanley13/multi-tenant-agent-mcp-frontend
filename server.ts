import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import winston from 'winston';
import { Agent, AgentInputItem, run, MCPServerStdio, withTrace, getAllMcpTools, user, assistant } from '@openai/agents';
import 'dotenv/config';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    ...(process.env.NODE_ENV !== 'production' ? [new winston.transports.Console({
      format: winston.format.simple()
    })] : [])
  ]
});

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for development
}));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Global variables for agent management
let ghlAgent: Agent;
let ghlMcpServer: MCPServerStdio;
let isInitialized = false;

// Store user sessions and chat histories
const userSessions = new Map<string, {
  history: AgentInputItem[];
  isConnected: boolean;
}>();

async function initializeGHLAgent(): Promise<void> {
  if (isInitialized) return;
  
  logger.info('🚀 Initializing GoHighLevel AI Agent...');
  
  try {
    // Configure GHL MCP Server
    ghlMcpServer = new MCPServerStdio({
      name: 'GoHighLevel MCP Server - Web Interface',
      command: 'node',
      args: ['C:\\Users\\Mykel\\OneDrive\\Desktop\\GHL MCP\\ghl-mcp-server\\dist\\server.js'],
      env: {
        GHL_API_KEY: process.env.GHL_API_KEY!,
        GHL_LOCATION_ID: process.env.GHL_LOCATION_ID!,
        GHL_BASE_URL: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
        NODE_ENV: 'development',
      },
      cacheToolsList: true,
      clientSessionTimeoutSeconds: 30,
    });

    await ghlMcpServer.connect();
    
    // Get tools with filtering
    logger.info('🔧 Loading GHL tools...');
    const allMcpTools = await withTrace('load-ghl-mcp-tools', async () => {
      return await getAllMcpTools([ghlMcpServer], false);
    });
    
    // Filter out problematic tools
    const filteredTools = allMcpTools.filter(tool => {
      const problematicTools = ['create_invoice'];
      return !problematicTools.includes(tool.name);
    });
    
    logger.info(`✅ Loaded ${filteredTools.length} GHL tools successfully (filtered from ${allMcpTools.length})!`);
    
    // Create the conversational agent
    ghlAgent = new Agent({
      name: 'GoHighLevel AI Assistant',
      instructions: `You are an expert GoHighLevel AI assistant with access to comprehensive GHL CRM capabilities.

🎯 **Your Abilities:**
- Contact Management: Search, create, update, delete contacts, manage tags, notes, tasks
- Opportunity Management: Create deals, manage pipelines, track sales progress
- Calendar & Appointments: Schedule meetings, check availability, manage bookings
- Messaging: Send SMS and emails, manage conversations
- Marketing: Create campaigns, manage social media posts, email templates
- Location Management: Handle sub-accounts, custom fields, workflows
- Payments: Process payments, manage subscriptions
- Custom Objects: Manage any custom data structures
- And much more with ${filteredTools.length}+ available tools!

🗣️ **Conversation Style:**
- Be conversational, helpful, and professional
- Ask clarifying questions when needed
- Explain what you're doing when using tools
- Provide actionable insights and suggestions
- Be proactive in suggesting related actions
- Keep responses concise but informative for chat interface

🔍 **When the user asks about anything GHL-related:**
1. Use the appropriate tools to get real data
2. Provide specific, actionable information
3. Suggest follow-up actions when relevant
4. Explain any results clearly

Always use real GHL data and provide specific, actionable responses optimized for a web chat interface!`,
      
      model: 'o3-2025-04-16',
      tools: filteredTools,
      
      modelSettings: {
        maxTokens: 1500, // Shorter for chat interface
      }
    });
    
    isInitialized = true;
    logger.info('🎉 GoHighLevel AI Assistant is ready!');
  } catch (error) {
    logger.error('❌ Failed to initialize GHL Agent:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    initialized: isInitialized,
    timestamp: new Date().toISOString()
  });
});

// Agent status endpoint
app.get('/api/agent/status', (req, res) => {
  res.json({
    initialized: isInitialized,
    connectedUsers: userSessions.size,
    timestamp: new Date().toISOString()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  const userId = socket.id;
  logger.info(`👤 User connected: ${userId}`);
  
  // Initialize user session
  userSessions.set(userId, {
    history: [],
    isConnected: true
  });

  // Send connection status
  socket.emit('connection_status', {
    connected: true,
    agentReady: isInitialized,
    userId: userId
  });

  // Handle chat messages
  socket.on('chat_message', async (data) => {
    const { message, timestamp } = data;
    const userSession = userSessions.get(userId);
    
    if (!userSession) {
      socket.emit('error', { message: 'User session not found' });
      return;
    }

    if (!isInitialized) {
      socket.emit('error', { message: 'Agent not initialized. Please wait...' });
      return;
    }

    try {
      logger.info(`💬 Processing message from ${userId}: ${message}`);
      
      // Add user message to history
      userSession.history.push(user(message));
      
      // Emit typing indicator
      socket.emit('agent_typing', { typing: true });
      
      // Process with agent
      const result = await withTrace('chat-message-processing', async () => {
        return await run(ghlAgent, userSession.history);
      });
      
      // Update history with result
      userSession.history = result.history;
      
      // Extract response
      const response = result.finalOutput ?? result.output ?? 'I apologize, but I encountered an issue processing your request.';
      
      // Send response
      socket.emit('agent_response', {
        message: response,
        timestamp: new Date().toISOString(),
        messageId: Date.now().toString()
      });
      
      socket.emit('agent_typing', { typing: false });
      
      logger.info(`✅ Response sent to ${userId}`);
      
    } catch (error) {
      logger.error(`❌ Error processing message for ${userId}:`, error);
      
      socket.emit('agent_typing', { typing: false });
      socket.emit('error', {
        message: 'I encountered an error processing your request. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`👤 User disconnected: ${userId}`);
    
    const userSession = userSessions.get(userId);
    if (userSession) {
      userSession.isConnected = false;
      // Keep session for potential reconnection
      setTimeout(() => {
        if (!userSession.isConnected) {
          userSessions.delete(userId);
          logger.info(`🗑️ Cleaned up session for ${userId}`);
        }
      }, 300000); // 5 minutes
    }
  });

  // Handle clear chat
  socket.on('clear_chat', () => {
    const userSession = userSessions.get(userId);
    if (userSession) {
      userSession.history = [];
      socket.emit('chat_cleared');
      logger.info(`🧹 Chat cleared for ${userId}`);
    }
  });
});

// Graceful shutdown
async function gracefulShutdown() {
  logger.info('🛑 Shutting down gracefully...');
  
  // Close all socket connections
  io.close();
  
  // Close MCP server connection
  if (ghlMcpServer) {
    try {
      await ghlMcpServer.close();
      logger.info('✅ MCP server connection closed');
    } catch (error) {
      logger.error('❌ Error closing MCP server:', error);
    }
  }
  
  // Close HTTP server
  server.close(() => {
    logger.info('✅ HTTP server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
async function startServer() {
  try {
    // Initialize the agent first
    await initializeGHLAgent();
    
    // Start the server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌐 Frontend should connect to: http://localhost:${PORT}`);
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                🚀 GoHighLevel AI Chat Server                  ║
║                                                                ║
║  Server Status: READY                                          ║
║  Port: ${PORT}                                                    ║
║  WebSocket: ENABLED                                            ║
║  Agent: INITIALIZED                                            ║
║                                                                ║
║  Next: Start the frontend client to begin chatting!           ║
╚════════════════════════════════════════════════════════════════╝
      `);
    });
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 