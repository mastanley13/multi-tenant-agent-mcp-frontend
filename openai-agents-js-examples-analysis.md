# OpenAI Agents JS Basic Examples: Reference Guide for Building a Multi-Agent Business Executive Assistant

## Executive Summary

This report analyzes the OpenAI Agents JavaScript SDK's basic examples and their applicability for building a sophisticated multi-agent business executive assistant. The OpenAI Agents SDK provides a robust framework for creating agent-based applications with features including multi-agent orchestration, handoffs, tool calling, guardrails, and MCP (Model Context Protocol) support.

## Repository Overview

The OpenAI Agents JS repository (https://github.com/openai/openai-agents-js) is a TypeScript-first framework for building multi-agent workflows. Key characteristics:

- **Framework Type**: Lightweight yet powerful multi-agent orchestration
- **Language Support**: TypeScript/JavaScript with Node.js 22+, Deno, Bun
- **Architecture**: Provider-agnostic supporting OpenAI APIs and more
- **Key Features**: Multi-agent workflows, tool integration, handoffs, streaming, tracing, guardrails, realtime voice agents, and MCP server support

## Core Architecture Concepts for Business Executive Assistant

### 1. Agent-as-Tool vs. Handoff Patterns

The SDK supports two primary collaboration patterns:

#### **Agent-as-Tool Pattern** (Recommended for Executive Assistant)
```typescript
// Head Portfolio Manager controls the workflow
const executiveAgent = new Agent({
  name: 'Executive Assistant',
  instructions: 'You coordinate multiple specialized agents...',
  tools: [calendarAgent, emailAgent, researchAgent, financialAgent]
});
```

**Benefits for Business Executive Assistant:**
- Centralized control and accountability
- Clear audit trail of decisions
- Easier to maintain global context
- Supports parallel execution of tasks

#### **Handoff Pattern**
```typescript
// Agents transfer control to each other
const triageAgent = new Agent({
  name: 'Triage Agent',
  instructions: 'Route requests to appropriate specialists',
  handoffs: [calendarAgent, emailAgent, researchAgent]
});
```

## Key Example Files and Applications

### 1. Basic Multi-Agent Orchestration

**Example Pattern:**
```typescript
import { Agent, run, tool } from '@openai/agents';

// Specialized agents for different business functions
const calendarAgent = new Agent({
  name: 'Calendar Manager',
  instructions: 'Manage scheduling and calendar operations',
  handoffDescription: 'Handles all calendar-related tasks',
  tools: [calendarTools]
});

const emailAgent = new Agent({
  name: 'Email Assistant',
  instructions: 'Manage email communication and responses',
  handoffDescription: 'Processes email operations',
  tools: [emailTools]
});

// Executive coordinator agent
const executiveAssistant = Agent.create({
  name: 'Executive Assistant',
  instructions: 'You are a senior business executive assistant...',
  handoffs: [calendarAgent, emailAgent, researchAgent]
});
```

**Business Application:**
- **Calendar Management**: Schedule meetings, check availability, resolve conflicts
- **Email Processing**: Draft responses, prioritize messages, follow-up tracking
- **Research Tasks**: Market analysis, competitor research, industry reports
- **Document Management**: Create reports, presentations, and summaries

### 2. Tool Integration Examples

**Custom Business Tools:**
```typescript
const crmTool = tool({
  name: 'crm_lookup',
  description: 'Search CRM for customer information',
  parameters: z.object({ 
    customerId: z.string(),
    searchType: z.enum(['contact', 'deals', 'history'])
  }),
  execute: async (input) => {
    // CRM integration logic
    return await crmService.lookup(input.customerId, input.searchType);
  }
});

const financialTool = tool({
  name: 'financial_analysis',
  description: 'Generate financial reports and analysis',
  parameters: z.object({
    reportType: z.string(),
    dateRange: z.object({
      start: z.string(),
      end: z.string()
    })
  }),
  execute: async (input) => {
    return await financialService.generateReport(input);
  }
});
```

**OpenAI Managed Tools:**
- **Code Interpreter**: For data analysis, financial calculations
- **Web Search**: For market research, competitor analysis
- **File Search**: For document retrieval and analysis

### 3. MCP Server Integration

**Local MCP Server Example:**
```typescript
import { MCPServerStdio } from '@openai/agents';

// Filesystem MCP for document management
const documentServer = new MCPServerStdio(
  'npx',
  ['-y', '@modelcontextprotocol/server-filesystem', '/business/documents']
);

// Custom CRM MCP server
const crmServer = new MCPServerStdio(
  'node',
  ['./mcp-servers/crm-server.js']
);

const executiveAgent = new Agent({
  name: 'Executive Assistant',
  instructions: 'Use available tools to assist with business operations',
  mcp_servers: [documentServer, crmServer]
});
```

**Business MCP Applications:**
- **CRM Integration**: Customer data, sales pipeline, contact management
- **Financial Systems**: Accounting software, expense tracking, budget analysis
- **Document Management**: File systems, SharePoint, Google Drive integration
- **Calendar Systems**: Outlook, Google Calendar, scheduling platforms

### 4. Streaming and Real-time Features

**Streaming Example:**
```typescript
const streamedResult = await run(
  executiveAgent,
  'Prepare a quarterly business review presentation',
  { streamMode: 'updates' }
);

for await (const chunk of streamedResult.stream()) {
  console.log('Progress update:', chunk);
  // Real-time updates to UI
}
```

**Voice Agent Integration:**
```typescript
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';

const voiceExecutiveAgent = new RealtimeAgent({
  name: 'Voice Executive Assistant',
  instructions: 'Respond to verbal requests and commands',
  tools: [calendarTools, emailTools]
});

const session = new RealtimeSession(voiceExecutiveAgent);
await session.connect({ apiKey: clientApiKey });
```

### 5. Guardrails for Business Context

**Business-Specific Guardrails:**
```typescript
import { defineOutputGuardrail } from '@openai/agents';

const businessEthicsGuardrail = defineOutputGuardrail({
  name: 'business_ethics_check',
  description: 'Ensure responses comply with business ethics',
  execute: async (output) => {
    // Check for sensitive information, compliance issues
    const hasComplianceIssues = await checkCompliance(output);
    return {
      allowed: !hasComplianceIssues,
      reason: hasComplianceIssues ? 'Potential compliance violation' : null
    };
  }
});

const executiveAgent = new Agent({
  name: 'Executive Assistant',
  instructions: 'Business executive assistant with ethical guidelines',
  output_guardrails: [businessEthicsGuardrail]
});
```

## Implementation Architecture for Business Executive Assistant

### 1. Multi-Agent Orchestration Structure

```typescript
// Core business function agents
const calendarAgent = new Agent({...}); // Meeting management
const emailAgent = new Agent({...});    // Communication
const researchAgent = new Agent({...}); // Market/competitive intelligence
const financialAgent = new Agent({...}); // Financial analysis
const documentAgent = new Agent({...}); // Document creation/management
const crmAgent = new Agent({...});      // Customer relationship management

// Master orchestrator
const executiveAssistant = new Agent({
  name: 'Senior Executive Assistant',
  instructions: `You are a senior executive assistant with access to specialized agents.
                 Coordinate multiple agents to complete complex business tasks.`,
  handoffs: [calendarAgent, emailAgent, researchAgent, financialAgent, documentAgent, crmAgent],
  tools: [urgencyAssessment, taskPrioritization, stakeholderNotification]
});
```

### 2. MCP Server Integration Points

**Local MCP Servers:**
- **CRM System**: Customer data, sales pipeline
- **Financial Systems**: Accounting, expense tracking
- **Document Management**: File systems, collaboration platforms
- **Calendar Integration**: Scheduling systems

**Remote MCP Servers:**
- **External APIs**: Market data, news feeds
- **Cloud Services**: AWS, Azure, Google Cloud integrations
- **Third-party Tools**: Slack, Teams, Jira, Salesforce

### 3. Business Workflow Examples

**Complex Task Orchestration:**
```typescript
// Example: "Prepare for board meeting next week"
const boardMeetingPrep = await run(executiveAssistant, 
  `Prepare for board meeting next week:
   1. Check calendar and confirm attendees
   2. Gather Q3 financial reports
   3. Research market trends in our sector
   4. Draft agenda with key talking points
   5. Schedule prep meetings with department heads`
);
```

**Parallel Task Execution:**
```typescript
// Execute multiple agents simultaneously
const parallelTasks = await Promise.all([
  run(financialAgent, 'Generate Q3 revenue analysis'),
  run(researchAgent, 'Compile competitor analysis'),
  run(calendarAgent, 'Find optimal meeting times for 8 executives'),
  run(documentAgent, 'Create board presentation template')
]);
```

## Tracing and Monitoring

**Built-in Tracing:**
```typescript
import { trace } from '@openai/agents';

with trace('Executive Assistant Workflow') as workflow_trace:
    result = await run(executiveAssistant, userRequest);
    
// View traces at: https://platform.openai.com/traces/{trace_id}
```

**Business Metrics Tracking:**
- Task completion rates
- Response times by function
- Agent handoff patterns
- Error rates and failure points

## Best Practices for Business Executive Assistant

### 1. **Modular Agent Design**
- Separate agents for distinct business functions
- Clear handoff descriptions and boundaries
- Specialized tools for each domain

### 2. **Security and Compliance**
- Input/output guardrails for sensitive data
- Audit trails for all actions
- Role-based access controls

### 3. **Performance Optimization**
- Parallel tool execution where possible
- Efficient context management
- Appropriate model selection (GPT-4.1 for complex reasoning)

### 4. **User Experience**
- Real-time progress updates
- Clear explanation of agent decisions
- Graceful error handling and recovery

## Implementation Roadmap

### Phase 1: Core Foundation
1. Set up basic agent structure with handoffs
2. Implement calendar and email agents
3. Add basic MCP server for document access
4. Establish tracing and monitoring

### Phase 2: Business Intelligence
1. Add research and financial analysis agents
2. Integrate CRM and financial system MCPs
3. Implement business-specific guardrails
4. Add parallel task execution

### Phase 3: Advanced Features
1. Voice agent integration
2. Real-time streaming updates
3. Advanced workflow orchestration
4. Custom business tool development

### Phase 4: Production Readiness
1. Comprehensive error handling
2. Performance optimization
3. Security hardening
4. User interface development

## Conclusion

The OpenAI Agents JS framework provides a robust foundation for building sophisticated multi-agent business executive assistants. The examples demonstrate clear patterns for:

- **Multi-agent orchestration** with both handoff and agent-as-tool patterns
- **MCP integration** for connecting to business systems
- **Tool calling** for custom business functions
- **Guardrails** for business compliance
- **Streaming and real-time** capabilities for responsive user experience

The framework's TypeScript-first approach, comprehensive tracing, and modular design make it well-suited for enterprise applications requiring reliability, auditability, and scalability.

By following the patterns demonstrated in the basic examples and extending them with business-specific agents and tools, organizations can create powerful AI assistants that integrate seamlessly with existing business systems while maintaining security and compliance requirements.