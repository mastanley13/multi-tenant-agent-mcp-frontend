# OpenAI Agents JS Packages: A Complete Beginner's Guide

## Table of Contents
1. [Overview](#overview)
2. [Main Package: @openai/agents](#main-package-openaiagents)
3. [Core Package: @openai/agents-core](#core-package-openaiagents-core)
4. [OpenAI Integration: @openai/agents-openai](#openai-integration-openaiagents-openai)
5. [Real-time Voice Agents: @openai/agents-realtime](#real-time-voice-agents-openaiagents-realtime)
6. [Extensions: @openai/agents-extensions](#extensions-openaiagents-extensions)
7. [Installation Guide](#installation-guide)
8. [Getting Started Examples](#getting-started-examples)
9. [Use Case Scenarios](#use-case-scenarios)
10. [Best Practices](#best-practices)

---

## Overview

The OpenAI Agents SDK for JavaScript/TypeScript is a lightweight yet powerful framework for building multi-agent workflows and voice agents. It's designed as a production-ready upgrade from the earlier experimental "Swarm" framework, offering a small set of powerful primitives that make it easy to build complex AI applications.

**Key Design Principles:**
- **Simple but Powerful**: Few enough primitives to learn quickly, but powerful enough for real-world applications
- **TypeScript-First**: Built natively for JavaScript/TypeScript ecosystem
- **Modular Architecture**: Clean separation between different functionalities
- **Provider-Agnostic**: While optimized for OpenAI, supports other model providers

---

## Main Package: @openai/agents

**Purpose**: The primary entry point that combines all functionality from other packages into a unified API.

### What it includes:
- **Agent Management**: Create and configure AI agents with instructions, tools, and behaviors
- **Agent Orchestration**: Run agents individually or in multi-agent workflows
- **Built-in Tools**: Pre-built tools for common tasks (web search, file operations, etc.)
- **Handoffs**: Transfer control between specialized agents
- **Guardrails**: Input/output validation and safety checks
- **Tracing**: Built-in monitoring and debugging capabilities
- **Streaming**: Real-time response streaming
- **Human-in-the-loop**: Pause for human intervention when needed

### Key Classes and Functions:
- `Agent`: The main agent class
- `run()`: Execute agent workflows
- `tool()`: Create custom tools
- `handoff()`: Define agent handoffs
- Various built-in tools like `webSearchTool`, `fileSearchTool`

### When to use this package:
- **Building text-based AI agents** for chat applications, automation, or data processing
- **Creating multi-agent workflows** where different agents handle specialized tasks
- **Developing AI assistants** that need to use tools and external APIs
- **Building customer service bots** with specialized routing between agents

### Simple Example:
```typescript
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';

// Create a simple tool
const getWeatherTool = tool({
  name: 'get_weather',
  description: 'Get weather for a city',
  parameters: z.object({ city: z.string() }),
  execute: async (input) => {
    return `The weather in ${input.city} is sunny`;
  },
});

// Create an agent
const agent = new Agent({
  name: 'Weather Assistant',
  instructions: 'You help users get weather information',
  tools: [getWeatherTool],
});

// Run the agent
const result = await run(agent, 'What is the weather in Tokyo?');
console.log(result.finalOutput);
```

---

## Core Package: @openai/agents-core

**Purpose**: Provides the foundational infrastructure and base classes that power the entire SDK.

### What it includes:
- **Base Agent Class**: Core agent implementation without provider-specific features
- **Runner System**: The engine that executes agent loops and manages state
- **Tool Framework**: Base classes and interfaces for creating tools
- **Context Management**: Handle conversation state and shared data
- **Event System**: Runtime events and lifecycle management
- **Tracing Infrastructure**: Low-level tracing and monitoring capabilities
- **Error Handling**: Comprehensive error types and handling
- **Type System**: TypeScript interfaces and type definitions

### Key Features:
- **Provider-Agnostic**: Works with any LLM provider that implements the interface
- **Extensible**: Easy to extend with custom functionality
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Memory Management**: Efficient handling of conversation history and context

### When to use this package directly:
- **Building custom integrations** with non-OpenAI model providers
- **Creating specialized agent frameworks** on top of the core functionality
- **Developing plugins or extensions** for the agents ecosystem
- **Research and experimentation** where you need lower-level control

### Example:
```typescript
import { Agent, Runner } from '@openai/agents-core';

// Using core directly for maximum control
const agent = new Agent({
  name: 'Custom Agent',
  instructions: 'You are a helpful assistant',
  // Custom model provider
  model: myCustomModelProvider,
});

const result = await Runner.run(agent, 'Hello');
```

---

## OpenAI Integration: @openai/agents-openai

**Purpose**: Provides OpenAI-specific integrations, tools, and optimizations.

### What it includes:
- **OpenAI Model Providers**: Optimized interfaces for OpenAI's API
- **Chat Completions Model**: Standard OpenAI chat interface
- **Responses Model**: OpenAI's advanced structured response format
- **Built-in OpenAI Tools**: Pre-configured tools that use OpenAI's hosted services
- **Tracing Integration**: Send traces to OpenAI's dashboard for monitoring

### Available Tools:
- **`codeInterpreterTool`**: Execute Python code in a sandboxed environment
- **`fileSearchTool`**: Search through uploaded files and documents
- **`webSearchTool`**: Search the web using OpenAI's web search capability
- **`imageGenerationTool`**: Generate images using DALL-E

### Configuration Functions:
- `setDefaultOpenAIClient()`: Configure the OpenAI API client
- `setDefaultOpenAIKey()`: Set your OpenAI API key
- `setOpenAIAPI()`: Configure API settings

### When to use this package:
- **Leveraging OpenAI's hosted tools** like code interpreter and web search
- **Using OpenAI's latest model features** like structured outputs
- **Monitoring agents** through OpenAI's tracing dashboard
- **Building production applications** that need OpenAI's reliability and scale

### Example:
```typescript
import { Agent, run } from '@openai/agents';
import { webSearchTool, fileSearchTool } from '@openai/agents-openai';

const researchAgent = new Agent({
  name: 'Research Assistant',
  instructions: 'Help users research topics using web search and documents',
  tools: [webSearchTool, fileSearchTool],
});

const result = await run(researchAgent, 'Research the latest developments in AI agents');
```

---

## Real-time Voice Agents: @openai/agents-realtime

**Purpose**: Build voice-enabled AI agents with real-time audio processing and conversation capabilities.

### What it includes:
- **RealtimeAgent**: Specialized agent class for voice interactions
- **RealtimeSession**: Manage voice conversation sessions
- **Audio Transport**: WebRTC and WebSocket support for audio streaming
- **Voice Activity Detection**: Automatic speech detection and interruption handling
- **Audio Formats**: Support for various audio formats and streaming protocols
- **Context Management**: Maintain conversation context across voice interactions

### Key Classes:
- `RealtimeAgent`: Voice-enabled agent with audio capabilities
- `RealtimeSession`: Manage real-time conversation sessions
- `OpenAIRealtimeWebRTC`: WebRTC transport layer for browser applications
- `OpenAIRealtimeWebSocket`: WebSocket transport for server applications

### Transport Mechanisms:
- **WebRTC**: Direct browser-to-OpenAI connection (lowest latency)
- **WebSocket**: Server-mediated connections for more control
- **Custom Transport**: Build your own transport layer (e.g., for Twilio)

### When to use this package:
- **Building voice assistants** with natural conversation flow
- **Creating customer service bots** that can handle phone calls
- **Developing interactive voice apps** for mobile or web
- **Building voice-controlled systems** for accessibility or hands-free operation

### Browser Example:
```typescript
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

const voiceAgent = new RealtimeAgent({
  name: 'Voice Assistant',
  instructions: 'You are a helpful voice assistant. Be conversational and friendly.',
});

// In a browser environment
const session = new RealtimeSession(voiceAgent);
await session.connect({
  apiKey: clientApiKey, // Use ephemeral keys for browser
});

// The session automatically handles:
// - Microphone input
// - Voice activity detection
// - Audio output
// - Conversation management
```

### Advanced Voice Agent Example:
```typescript
import { RealtimeAgent, tool } from '@openai/agents-realtime';
import { z } from 'zod';

const weatherTool = tool({
  name: 'get_weather',
  description: 'Get current weather',
  parameters: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    // Call weather API
    return `The weather in ${location} is sunny and 72°F`;
  },
});

const voiceWeatherAgent = new RealtimeAgent({
  name: 'Weather Voice Assistant',
  instructions: 'Help users get weather information through voice conversation',
  tools: [weatherTool],
});
```

---

## Extensions: @openai/agents-extensions

**Purpose**: Provides integrations with external services and alternative model providers.

### What it includes:
- **AI SDK Integration**: Use any LLM provider through Vercel's AI SDK
- **Twilio Integration**: Connect voice agents to phone systems
- **Custom Transport Layers**: Build connections to other communication platforms
- **Model Adapters**: Bridge between different AI providers and the agents framework

### Key Features:

#### AI SDK Integration (`aisdk`)
- **Universal Model Support**: Use models from Anthropic, Google, Cohere, local models, etc.
- **Provider Abstraction**: Switch between providers without changing agent code
- **Cost Optimization**: Use different models for different tasks based on cost/performance

#### Twilio Integration (`TwilioRealtimeTransportLayer`)
- **Phone Call Integration**: Connect agents directly to phone calls
- **SMS Integration**: Handle text message conversations
- **WebRTC Bridge**: Connect Twilio's communication infrastructure with OpenAI's realtime API

### When to use this package:
- **Using non-OpenAI models** while keeping the agents framework
- **Building phone-based voice agents** that handle real phone calls
- **Creating multi-modal applications** that work across different communication channels
- **Optimizing costs** by using different models for different tasks

### AI SDK Example (Using Claude):
```typescript
import { createAnthropic } from '@ai-sdk/anthropic';
import { aisdk } from '@openai/agents-extensions';
import { Agent, run } from '@openai/agents';

// Set up Anthropic provider
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Use Claude with the agents framework
const claudeAgent = new Agent({
  name: 'Claude Assistant',
  instructions: 'You are Claude, an AI assistant by Anthropic',
  model: aisdk(anthropic('claude-3-5-sonnet-20241022')),
});

const result = await run(claudeAgent, 'Explain quantum computing');
```

### Twilio Voice Integration Example:
```typescript
import { RealtimeAgent } from '@openai/agents-realtime';
import { TwilioRealtimeTransportLayer } from '@openai/agents-extensions';

const phoneAgent = new RealtimeAgent({
  name: 'Phone Support Agent',
  instructions: 'You are a customer support agent handling phone calls',
});

// Connect to Twilio for phone call handling
const transport = new TwilioRealtimeTransportLayer({
  twilioOptions: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  },
});

// Now your agent can handle real phone calls
```

---

## Installation Guide

### Basic Installation (Most Common)
```bash
# Install the main package (includes core and OpenAI integration)
npm install @openai/agents

# For TypeScript projects, you might also want Zod for schema validation
npm install zod
```

### Modular Installation
```bash
# Install only what you need
npm install @openai/agents-core    # Core functionality only
npm install @openai/agents-openai  # + OpenAI integrations
npm install @openai/agents-realtime # + Voice capabilities
npm install @openai/agents-extensions # + External integrations
```

### Voice Applications
```bash
# For browser-based voice apps
npm install @openai/agents-realtime

# For phone system integration
npm install @openai/agents-extensions
```

### Alternative Model Providers
```bash
# To use non-OpenAI models
npm install @openai/agents-extensions @ai-sdk/anthropic @ai-sdk/google
# Or other AI SDK providers
```

---

## Getting Started Examples

### 1. Simple Chat Agent
```typescript
import { Agent, run } from '@openai/agents';

const chatAgent = new Agent({
  name: 'Helpful Assistant',
  instructions: 'You are a helpful, friendly assistant.',
});

const result = await run(chatAgent, 'Tell me a joke');
console.log(result.finalOutput);
```

### 2. Agent with Tools
```typescript
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';

const calculateTool = tool({
  name: 'calculate',
  description: 'Perform mathematical calculations',
  parameters: z.object({ 
    expression: z.string().describe('Math expression to evaluate') 
  }),
  execute: async ({ expression }) => {
    try {
      // Simple evaluation (in production, use a safer math parser)
      return `Result: ${eval(expression)}`;
    } catch (error) {
      return 'Error: Invalid mathematical expression';
    }
  },
});

const mathAgent = new Agent({
  name: 'Math Assistant',
  instructions: 'Help users with mathematical calculations',
  tools: [calculateTool],
});

const result = await run(mathAgent, 'What is 15 * 24 + 100?');
```

### 3. Multi-Agent Workflow
```typescript
import { Agent, run } from '@openai/agents';

// Specialized agents
const writerAgent = new Agent({
  name: 'Content Writer',
  instructions: 'Write engaging, clear content on any topic',
  handoffDescription: 'Expert at writing articles, blogs, and content',
});

const editorAgent = new Agent({
  name: 'Editor',
  instructions: 'Edit and improve written content for clarity and engagement',
  handoffDescription: 'Expert at editing and improving written content',
});

// Router agent
const contentAgent = Agent.create({
  name: 'Content Manager',
  instructions: 'Coordinate content creation and editing tasks',
  handoffs: [writerAgent, editorAgent],
});

const result = await run(contentAgent, 'Create a blog post about renewable energy, then edit it');
```

### 4. Voice Agent (Browser)
```typescript
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

const voiceAgent = new RealtimeAgent({
  name: 'Voice Assistant',
  instructions: 'You are a friendly voice assistant. Keep responses concise for voice.',
});

// Get ephemeral API key from your backend
const response = await fetch('/api/ephemeral-key');
const { apiKey } = await response.json();

const session = new RealtimeSession(voiceAgent);
await session.connect({ apiKey });

// Voice conversation starts automatically
console.log('Start talking! The agent is listening...');
```

---

## Use Case Scenarios

### 1. Customer Support System
**Packages**: `@openai/agents`, `@openai/agents-realtime`

```typescript
// Text support agent
const textSupportAgent = new Agent({
  name: 'Text Support',
  instructions: 'Provide helpful customer support via text',
  tools: [orderLookupTool, refundTool],
});

// Voice support agent  
const voiceSupportAgent = new RealtimeAgent({
  name: 'Voice Support',
  instructions: 'Provide friendly phone support',
  tools: [orderLookupTool, transferToHumanTool],
});
```

### 2. Content Creation Pipeline
**Packages**: `@openai/agents`, `@openai/agents-openai`

```typescript
const researchAgent = new Agent({
  name: 'Researcher',
  tools: [webSearchTool, fileSearchTool],
  instructions: 'Research topics thoroughly',
});

const writerAgent = new Agent({
  name: 'Writer', 
  instructions: 'Create engaging content from research',
});

const editorAgent = new Agent({
  name: 'Editor',
  instructions: 'Polish and improve content',
});
```

### 3. Multi-Model Cost Optimization
**Packages**: `@openai/agents-extensions`

```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { aisdk } from '@openai/agents-extensions';

// Use GPT-4 for complex reasoning
const complexAgent = new Agent({
  model: aisdk(createOpenAI()('gpt-4o')),
  instructions: 'Handle complex analysis tasks',
});

// Use Claude for creative writing
const creativeAgent = new Agent({
  model: aisdk(createAnthropic()('claude-3-5-sonnet-20241022')),
  instructions: 'Generate creative content',
});

// Use local model for simple tasks
const simpleAgent = new Agent({
  model: aisdk(createOpenAI({ baseURL: 'http://localhost:1234/v1' })('llama-3')),
  instructions: 'Handle simple queries',
});
```

### 4. Phone-Based Voice Agent
**Packages**: `@openai/agents-realtime`, `@openai/agents-extensions`

```typescript
import { TwilioRealtimeTransportLayer } from '@openai/agents-extensions';
import { RealtimeAgent } from '@openai/agents-realtime';

const phoneAgent = new RealtimeAgent({
  name: 'Phone Assistant',
  instructions: 'Handle incoming phone calls professionally',
  tools: [appointmentBookingTool, informationLookupTool],
});

const transport = new TwilioRealtimeTransportLayer({
  twilioOptions: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  },
});

// Connect agent to phone system
```

---

## Best Practices

### 1. Package Selection
- **Start Simple**: Begin with `@openai/agents` for most use cases
- **Add Voice**: Include `@openai/agents-realtime` when you need voice capabilities
- **Multi-Provider**: Use `@openai/agents-extensions` when you need non-OpenAI models
- **Advanced Control**: Use `@openai/agents-core` directly only when building custom frameworks

### 2. Performance Optimization
- **Model Selection**: Use appropriate models for different tasks (GPT-4 for complex reasoning, GPT-3.5 for simple tasks)
- **Streaming**: Enable streaming for better user experience in interactive applications
- **Caching**: Implement caching for repeated tool calls or API requests
- **Parallel Processing**: Use multiple agents in parallel when tasks are independent

### 3. Security Considerations
- **API Keys**: Never expose API keys in client-side code; use ephemeral keys for browser applications
- **Input Validation**: Always validate user inputs, especially in tool parameters
- **Guardrails**: Implement input and output guardrails for production applications
- **Rate Limiting**: Implement rate limiting to prevent abuse

### 4. Development Workflow
- **Start with Prototyping**: Begin with simple agents and gradually add complexity
- **Use Tracing**: Enable tracing to debug and optimize agent behavior
- **Test Thoroughly**: Test edge cases, especially with multi-agent handoffs
- **Monitor Performance**: Track token usage, latency, and error rates in production

### 5. Architecture Patterns
- **Specialized Agents**: Create focused agents for specific tasks rather than one general-purpose agent
- **Clear Handoffs**: Define clear handoff criteria and descriptions
- **Context Management**: Design your context objects to carry necessary state between agents
- **Error Handling**: Implement comprehensive error handling and fallback strategies

---

This guide provides a comprehensive overview of all OpenAI Agents JS packages and their intended use cases. Each package serves a specific purpose in the ecosystem, from core functionality to specialized voice capabilities and external integrations. Choose the packages that best fit your specific use case and requirements.