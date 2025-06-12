# GoHighLevel AI Assistant

A production-ready SaaS chat application that integrates with GoHighLevel CRM through AI-powered conversation interface.

## Features

- 🔐 OAuth 2.0 authentication with GoHighLevel
- 💬 Real-time streaming chat with OpenAI GPT-4o
- 🛠️ MCP (Model Context Protocol) tool integration
- 📱 Mobile-responsive design
- 🚀 Rate limiting and security measures
- 💾 Persistent conversation history
- ⚡ Server-sent events for real-time responses

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth.js v5
- **Database**: PostgreSQL with Prisma
- **AI**: OpenAI GPT-4o with MCP tools
- **Styling**: Tailwind CSS + Radix UI
- **Deployment**: Vercel

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the client directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ghl_agents"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# GoHighLevel OAuth
GHL_CLIENT_ID="your-ghl-client-id"
GHL_CLIENT_SECRET="your-ghl-client-secret"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# MCP Server
MCP_BASE="https://mcp.yourapp.com"

# Redis (Upstash for rate limiting)
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"
```

### 2. Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Or run migrations in production
npm run db:migrate
```

### 3. GoHighLevel App Configuration

1. Register your marketplace app in GoHighLevel
2. Set redirect URI: `https://yourdomain.com/api/auth/callback/gohighlevel`
3. Configure required scopes:
   - `contacts.read`
   - `contacts.write`
   - `conversations.read`
   - `conversations.write`
   - `locations.read`
   - `opportunities.read`
   - `opportunities.write`
   - `calendars.read`
   - `calendars.write`
   - `campaigns.read`
   - `campaigns.write`
   - `forms.read`
   - `forms.write`
   - `surveys.read`
   - `surveys.write`
   - `workflows.read`
   - `workflows.write`

### 4. Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### 5. Deployment

#### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Environment Setup

- **Database**: Use Neon, Supabase, or Railway for PostgreSQL
- **Redis**: Use Upstash for rate limiting
- **MCP Server**: Deploy the companion MCP server

## API Endpoints

- `POST /api/chat` - Send chat messages with streaming responses
- `GET /api/conversations` - List user conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/[id]/messages` - Get conversation messages

## Rate Limits

- 60 messages per minute per user
- 120 second timeout for chat responses
- 30 second timeout for MCP tool calls

## Architecture

The application follows the shared contract with the MCP server:

- **MCP Discovery**: `GET /mcp/{tenantId}/tools`
- **Tool Execution**: `POST /mcp/{tenantId}/tool/{toolName}`
- **Authentication**: `Authorization: Bearer <user-access-token>`

## Security

- JWT-based session management
- Rate limiting with Redis
- Token refresh handling
- Tenant isolation
- Input validation and sanitization

## Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details 