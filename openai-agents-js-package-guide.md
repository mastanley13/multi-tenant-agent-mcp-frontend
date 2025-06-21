# OpenAI Agents JS Package Guide: A Complete Beginner's Guide

## 🚀 Introduction

The OpenAI Agents JS framework is a powerful, lightweight toolkit for building AI agents in JavaScript and TypeScript. It's designed to be production-ready while remaining simple enough for beginners to understand and use effectively.

Think of it as your toolkit for creating AI assistants that can:
- Chat with users
- Use tools and functions
- Hand off tasks to other specialized agents
- Work with voice and audio
- Connect to external services

This guide will walk you through each package in the OpenAI Agents JS ecosystem, explaining what they do and when to use them.

---

## 📦 Package Overview

The OpenAI Agents JS framework is organized into several focused packages, each serving specific purposes:

| Package | Purpose | Best For |
|---------|---------|----------|
| `@openai/agents` | Main entry point with everything included | Most applications, getting started |
| `@openai/agents-core` | Core framework without OpenAI-specific features | Custom implementations, non-OpenAI models |
| `@openai/agents-openai` | OpenAI-specific integrations and tools | OpenAI-powered applications |
| `@openai/agents-realtime` | Voice and real-time audio agents | Voice assistants, phone systems |
| `@openai/agents-extensions` | Third-party integrations | Connecting to other services |

---

## 🎯 @openai/agents - The Complete Package

### What it is:
This is the **main package** that most developers should start with. It includes everything you need to build AI agents and is the easiest way to get started.

### What it includes:
- All core agent functionality
- OpenAI integrations
- Built-in tools (web search, file search, code interpreter)
- Tracing and debugging capabilities
- Multi-agent workflows
- Guardrails for safety

### When to use it:
- **Starting a new project** with AI agents
- Building **text-based agents** that need to use tools
- Creating **multi-agent workflows** where agents hand off tasks
- Need **built-in OpenAI tools** like web search or code interpreter
- Want **everything in one package** without complexity

### Simple Example:
```javascript
import { Agent, run } from '@openai/agents';

// Create a simple assistant agent
const agent = new Agent({
  name: 'Assistant',
  instructions: 'You are a helpful assistant',
});

// Run the agent with a question
const result = await run(agent, 'Write a haiku about programming.');
console.log(result.finalOutput);
```

### Advanced Example with Tools:
```javascript
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';

// Create a weather tool
const weatherTool = tool({
  name: 'get_weather',
  description: 'Get weather for a city',
  parameters: z.object({ city: z.string() }),
  execute: async (input) => {
    return `The weather in ${input.city} is sunny and 72°F`;
  },
});

// Create agent with the tool
const weatherAgent = new Agent({
  name: 'Weather Agent',
  instructions: 'Help users get weather information',
  tools: [weatherTool],
});

const result = await run(weatherAgent, 'What\'s the weather in Tokyo?');
console.log(result.finalOutput);
```

---

## ⚙️ @openai/agents-core - The Foundation

### What it is:
This is the **core framework** without any OpenAI-specific features. It provides the fundamental building blocks for creating agents that can work with any AI model or service.

### What it includes:
- Agent class and runner
- Tool system
- Handoff mechanisms
- Tracing infrastructure
- Guardrails framework
- Model abstraction layer

### What it doesn't include:
- OpenAI-specific tools (web search, file search, etc.)
- OpenAI API integrations
- Pre-built OpenAI model providers

### When to use it:
- Building agents for **non-OpenAI models** (Claude, Gemini, local models)
- Need **maximum flexibility** and control
- Building **custom agent frameworks**
- Want to **minimize dependencies**
- Creating **provider-agnostic** solutions

### Example with Custom Model:
```javascript
import { Agent, run } from '@openai/agents-core';

// You'd need to implement your own model provider
class CustomModelProvider {
  async generateResponse(messages) {
    // Your custom model logic here
    return { content: 'Response from custom model' };
  }
}

const agent = new Agent({
  name: 'Custom Agent',
  instructions: 'You are a helpful assistant',
  modelProvider: new CustomModelProvider(),
});
```

---

## 🤖 @openai/agents-openai - OpenAI Integrations

### What it is:
This package provides **OpenAI-specific** integrations, tools, and model providers. It's the bridge between the core framework and OpenAI's services.

### What it includes:
- OpenAI model providers (GPT-4, GPT-3.5, etc.)
- OpenAI-hosted tools:
  - Web search tool
  - File search tool
  - Code interpreter tool
  - Image generation tool
- OpenAI API client configurations
- OpenAI tracing and monitoring

### When to use it:
- Building agents that use **OpenAI's hosted tools**
- Need **OpenAI-specific optimizations**
- Want to use **OpenAI's latest models** and features
- Building **production applications** with OpenAI
- Need **OpenAI's tracing and monitoring**

### Example with OpenAI Tools:
```javascript
import { Agent, run } from '@openai/agents-core';
import { webSearchTool, fileSearchTool } from '@openai/agents-openai';

const researchAgent = new Agent({
  name: 'Research Agent',
  instructions: 'Help users research topics using web search',
  tools: [webSearchTool, fileSearchTool],
});

const result = await run(
  researchAgent, 
  'Research the latest developments in renewable energy'
);
```

---

## 🎙️ @openai/agents-realtime - Voice Agents

### What it is:
This package is specifically designed for building **voice-enabled agents** that can have real-time conversations with users through audio.

### What it includes:
- RealtimeAgent class for voice interactions
- WebRTC and WebSocket transport layers
- Audio input/output handling
- Real-time conversation management
- Voice interruption detection
- Audio streaming capabilities

### Key Features:
- **Real-time voice conversations**
- **Automatic speech recognition**
- **Text-to-speech synthesis**
- **Interruption handling** (users can interrupt the agent)
- **Low latency** for natural conversations
- **Browser and server support**

### When to use it:
- Building **voice assistants**
- Creating **phone-based AI systems**
- Developing **conversational interfaces**
- Need **real-time audio processing**
- Building **customer service bots** with voice
- Creating **interactive voice applications**

### Browser Example:
```javascript
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

// Create a voice agent
const voiceAgent = new RealtimeAgent({
  name: 'Voice Assistant',
  instructions: 'You are a helpful voice assistant. Keep responses concise.',
});

// Set up real-time session (in browser)
const session = new RealtimeSession(voiceAgent);

// Connect and start listening
await session.connect({
  apiKey: 'your-api-key', // Use ephemeral keys in production
});

// The agent will automatically handle voice input/output
```

### With Custom Tools:
```javascript
import { RealtimeAgent, RealtimeSession, tool } from '@openai/agents-realtime';

const appointmentTool = tool({
  name: 'schedule_appointment',
  description: 'Schedule an appointment',
  parameters: z.object({
    date: z.string(),
    time: z.string(),
    purpose: z.string(),
  }),
  execute: async (input) => {
    // Schedule the appointment
    return `Appointment scheduled for ${input.date} at ${input.time}`;
  },
});

const schedulingAgent = new RealtimeAgent({
  name: 'Scheduling Assistant',
  instructions: 'Help users schedule appointments',
  tools: [appointmentTool],
});
```

---

## 🔌 @openai/agents-extensions - Third-Party Integrations

### What it is:
This package provides **extensions and integrations** with third-party services and platforms, expanding what your agents can do.

### What it includes:
- **Vercel AI SDK integration** (use any AI model)
- **Twilio integration** (connect voice agents to phone systems)
- Additional transport layers
- Third-party service connectors

### Key Integrations:

#### 1. Vercel AI SDK Integration
Use any AI model (Claude, Gemini, local models) with the agents framework:

```javascript
import { Agent, run } from '@openai/agents-core';
import { aisdk } from '@openai/agents-extensions';
import { anthropic } from '@ai-sdk/anthropic';

// Use Claude with the agents framework
const agent = new Agent({
  name: 'Claude Agent',
  instructions: 'You are Claude, an AI assistant',
  modelProvider: aisdk(anthropic('claude-3-sonnet-20240229')),
});
```

#### 2. Twilio Integration
Connect voice agents to phone systems:

```javascript
import { RealtimeAgent } from '@openai/agents-realtime';
import { TwilioRealtimeTransportLayer } from '@openai/agents-extensions';

const phoneAgent = new RealtimeAgent({
  name: 'Phone Assistant',
  instructions: 'You are a helpful phone assistant',
});

// Connect to Twilio for phone calls
const twilioTransport = new TwilioRealtimeTransportLayer({
  accountSid: 'your-twilio-sid',
  authToken: 'your-twilio-token',
});
```

### When to use it:
- Need to use **non-OpenAI models** (Claude, Gemini, local models)
- Building **phone-based voice agents** with Twilio
- Want to **extend functionality** with third-party services
- Need **custom transport layers**
- Building **multi-provider** applications

---

## 🏗️ Architecture and How Packages Work Together

### Package Dependencies:
```
@openai/agents (main package)
├── @openai/agents-core (foundation)
├── @openai/agents-openai (OpenAI tools)
└── @openai/agents-realtime (voice features)

@openai/agents-extensions
├── Uses @openai/agents-core
└── Provides third-party integrations
```

### Typical Usage Patterns:

#### 1. Simple Text Agent (Most Common):
```javascript
// Just use the main package
import { Agent, run } from '@openai/agents';
```

#### 2. Voice Agent with OpenAI:
```javascript
// Use main package + realtime
import { Agent, run } from '@openai/agents';
import { RealtimeAgent } from '@openai/agents-realtime';
```

#### 3. Custom Model with Voice:
```javascript
// Use core + extensions + realtime
import { Agent } from '@openai/agents-core';
import { aisdk } from '@openai/agents-extensions';
import { RealtimeAgent } from '@openai/agents-realtime';
```

---

## 🎯 Choosing the Right Package

### For Beginners:
**Start with `@openai/agents`** - it has everything you need and is the easiest to use.

### For Different Use Cases:

| Use Case | Recommended Packages |
|----------|---------------------|
| **Simple chatbot** | `@openai/agents` |
| **Voice assistant** | `@openai/agents` + `@openai/agents-realtime` |
| **Customer service bot** | `@openai/agents` + `@openai/agents-realtime` |
| **Research assistant** | `@openai/agents` (includes web search) |
| **Code assistant** | `@openai/agents` (includes code interpreter) |
| **Multi-agent workflow** | `@openai/agents` |
| **Using Claude/Gemini** | `@openai/agents-core` + `@openai/agents-extensions` |
| **Phone system integration** | `@openai/agents-realtime` + `@openai/agents-extensions` |
| **Custom framework** | `@openai/agents-core` |

---

## 🛠️ Common Patterns and Examples

### 1. Multi-Agent Handoff Pattern:
```javascript
import { Agent, run } from '@openai/agents';

// Specialized agents
const researchAgent = new Agent({
  name: 'Research Agent',
  instructions: 'Research topics and gather information',
  tools: [webSearchTool],
});

const writingAgent = new Agent({
  name: 'Writing Agent',
  instructions: 'Write clear, engaging content',
});

// Coordinator agent
const coordinator = new Agent({
  name: 'Coordinator',
  instructions: 'Coordinate between research and writing agents',
  handoffs: [researchAgent, writingAgent],
});

// The coordinator will hand off to appropriate agents
const result = await run(coordinator, 'Write an article about climate change');
```

### 2. Voice Agent with Tools:
```javascript
import { RealtimeAgent, tool } from '@openai/agents-realtime';

const bookingTool = tool({
  name: 'book_flight',
  description: 'Book a flight',
  parameters: z.object({
    from: z.string(),
    to: z.string(),
    date: z.string(),
  }),
  execute: async (params) => {
    // Book the flight
    return `Flight booked from ${params.from} to ${params.to}`;
  },
});

const travelAgent = new RealtimeAgent({
  name: 'Travel Agent',
  instructions: 'Help users book flights and travel',
  tools: [bookingTool],
});
```

### 3. Custom Model Integration:
```javascript
import { Agent, run } from '@openai/agents-core';
import { aisdk } from '@openai/agents-extensions';
import { anthropic } from '@ai-sdk/anthropic';

const agent = new Agent({
  name: 'Claude Assistant',
  instructions: 'You are a helpful assistant powered by Claude',
  modelProvider: aisdk(anthropic('claude-3-sonnet-20240229')),
});
```

---

## 🔧 Installation and Setup

### Quick Start (Recommended):
```bash
npm install @openai/agents
```

### Voice Agents:
```bash
npm install @openai/agents @openai/agents-realtime
```

### Custom Models:
```bash
npm install @openai/agents-core @openai/agents-extensions
```

### Environment Setup:
```bash
# For OpenAI agents
export OPENAI_API_KEY=sk-...

# For custom models (example with Anthropic)
export ANTHROPIC_API_KEY=sk-ant-...
```

---

## 🚀 Getting Started Guide

### 1. Your First Agent (5 minutes):
```javascript
import { Agent, run } from '@openai/agents';

const agent = new Agent({
  name: 'Helper',
  instructions: 'You are a helpful assistant',
});

const result = await run(agent, 'Explain quantum computing in simple terms');
console.log(result.finalOutput);
```

### 2. Agent with Tools (10 minutes):
```javascript
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';

const calculatorTool = tool({
  name: 'calculate',
  description: 'Perform calculations',
  parameters: z.object({
    expression: z.string(),
  }),
  execute: async (input) => {
    // Simple calculator (use a proper math library in production)
    return eval(input.expression).toString();
  },
});

const mathAgent = new Agent({
  name: 'Math Assistant',
  instructions: 'Help with math problems',
  tools: [calculatorTool],
});

const result = await run(mathAgent, 'What is 25 * 47 + 183?');
```

### 3. Voice Agent (15 minutes):
```javascript
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

const voiceAgent = new RealtimeAgent({
  name: 'Voice Helper',
  instructions: 'You are a friendly voice assistant',
});

const session = new RealtimeSession(voiceAgent);
await session.connect({ apiKey: 'your-api-key' });

// Agent will now listen and respond with voice
```

---

## 📚 Key Concepts Explained

### Agents:
Think of agents as specialized AI assistants. Each agent has:
- **Instructions**: What the agent should do
- **Tools**: Functions the agent can call
- **Handoffs**: Other agents it can delegate to

### Tools:
Functions that agents can use to interact with the world:
- Web search
- File operations
- API calls
- Calculations
- Database queries

### Handoffs:
When one agent passes control to another specialized agent:
- Research agent → Writing agent
- General agent → Technical specialist
- English agent → Spanish agent

### Guardrails:
Safety mechanisms that validate inputs and outputs:
- Check for harmful content
- Validate data formats
- Enforce business rules

---

## 🎯 Best Practices

### 1. Start Simple:
- Begin with `@openai/agents`
- Use basic agents first
- Add complexity gradually

### 2. Design for Your Use Case:
- **Text-only**: `@openai/agents`
- **Voice**: Add `@openai/agents-realtime`
- **Custom models**: Use `@openai/agents-core` + `@openai/agents-extensions`

### 3. Use Appropriate Tools:
- Web search for research
- Code interpreter for programming
- Custom tools for business logic

### 4. Structure Agent Teams:
- One coordinator agent
- Specialized worker agents
- Clear handoff criteria

### 5. Implement Safety:
- Use guardrails
- Validate inputs
- Monitor outputs

---

## 🔍 Troubleshooting Common Issues

### 1. "Module not found" errors:
Make sure you're importing from the right package:
```javascript
// Correct
import { Agent } from '@openai/agents';

// Also correct
import { Agent } from '@openai/agents-core';
```

### 2. Voice agents not working in browser:
Ensure you have proper API key handling:
```javascript
// Don't put API keys in client-side code
// Use ephemeral keys from your server
const { apiKey } = await fetch('/api/get-ephemeral-key').then(r => r.json());
```

### 3. Custom models not working:
Make sure you have the right extensions:
```javascript
import { aisdk } from '@openai/agents-extensions';
import { anthropic } from '@ai-sdk/anthropic';
```

---

## 🌟 Conclusion

The OpenAI Agents JS framework provides a powerful, flexible way to build AI agents. Here's a quick recap:

- **`@openai/agents`**: Start here for most projects
- **`@openai/agents-core`**: For custom implementations
- **`@openai/agents-openai`**: For OpenAI-specific features
- **`@openai/agents-realtime`**: For voice agents
- **`@openai/agents-extensions`**: For third-party integrations

The framework is designed to grow with your needs - start simple and add complexity as required. Whether you're building a simple chatbot or a complex multi-agent system with voice capabilities, these packages provide the foundation you need.

---

## 📖 Additional Resources

- [Official Documentation](https://openai.github.io/openai-agents-js/)
- [GitHub Repository](https://github.com/openai/openai-agents-js)
- [Example Projects](https://github.com/openai/openai-agents-js/tree/main/examples)
- [API Reference](https://openai.github.io/openai-agents-js/api/)

---

*This guide covers the essential information about OpenAI Agents JS packages. As the framework continues to evolve, new features and packages may be added. Always refer to the official documentation for the most up-to-date information.*