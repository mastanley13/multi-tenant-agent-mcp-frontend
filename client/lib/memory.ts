// Memory client interface for type safety
interface MemoryClientInterface {
  add(messages: any[], options: any): Promise<void>
  search(query: string, options: any): Promise<any[]>
}

// Fallback implementation when mem0ai is not available
class FallbackMemoryClient implements MemoryClientInterface {
  async add(messages: any[], options: any): Promise<void> {
    // No-op implementation - memory features disabled
  }
  
  async search(query: string, options: any): Promise<any[]> {
    return []
  }
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface SearchOptions {
  user_id: string
  limit?: number
  threshold?: number
}

interface MemoryOptions {
  user_id: string
  metadata?: any
}

interface MemoryResult {
  id: string
  memory?: string
  score?: number
  metadata?: any
}

export class TenantMemoryClient {
  private client: MemoryClientInterface
  private initialized: boolean = false

  constructor() {
    // For now, always use fallback implementation
    // To enable mem0ai, install the package and update this implementation
    this.client = new FallbackMemoryClient()
    
    const apiKey = process.env.MEM0_API_KEY
    if (!apiKey) {
      console.warn('[MEMORY] MEM0_API_KEY not found, memory features will be disabled')
    } else {
      console.warn('[MEMORY] mem0ai package not installed, memory features will be disabled. Install mem0ai to enable.')
    }
  }

  /**
   * Check if memory client is available
   */
  isAvailable(): boolean {
    return this.initialized
  }

  /**
   * Add a message to user-specific memory (tied to GHL userId, not locationId)
   */
  async addMessage(message: string, ghlUserId: string, role: 'user' | 'assistant', metadata?: any): Promise<boolean> {
    if (!ghlUserId) {
      console.warn('[MEMORY] No ghlUserId provided, skipping memory addition')
      return false
    }

    try {
      const messages: Message[] = [{ role, content: message }]
      const options: MemoryOptions = { 
        user_id: ghlUserId,
        metadata: {
          timestamp: new Date().toISOString(),
          role,
          ...metadata
        }
      }

      await this.client.add(messages, options)
      return true
    } catch (error) {
      console.error('[MEMORY] Failed to add message:', error)
      return false
    }
  }

  /**
   * Search for relevant memories for a user (based on GHL userId)
   */
  async searchMemories(query: string, ghlUserId: string, limit: number = 5): Promise<string[]> {
    if (!ghlUserId) {
      return []
    }

    try {
      const options: SearchOptions = {
        user_id: ghlUserId,
        limit,
        threshold: 0.1
      }

      const result: MemoryResult[] = await this.client.search(query, options)
      
      if (!result || result.length === 0) {
        return []
      }

      const memories = result
        .filter(r => r.score && r.score > 0.1)
        .map(r => r.memory || '')
        .filter(m => m.length > 0)

      return memories
    } catch (error) {
      console.error('[MEMORY] Failed to search memories:', error)
      return []
    }
  }

  /**
   * Get conversation context by combining recent memories with semantic search
   */
  async getConversationContext(query: string, ghlUserId: string, conversationId?: string): Promise<string> {
    if (!ghlUserId) {
      return ''
    }

    try {
      const relevantMemories = await this.searchMemories(query, ghlUserId, 5)
      
      if (relevantMemories.length === 0) {
        return ''
      }

      const context = relevantMemories
        .slice(0, 3)
        .join('\n')

      return context
    } catch (error) {
      console.error('[MEMORY] Failed to get conversation context:', error)
      return ''
    }
  }

  /**
   * Add conversation messages (both user and assistant) to memory
   */
  async addConversation(userMessage: string, assistantResponse: string, ghlUserId: string, metadata?: any): Promise<boolean> {
    if (!ghlUserId) {
      return false
    }

    try {
      const messages: Message[] = [
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantResponse }
      ]

      const options: MemoryOptions = {
        user_id: ghlUserId,
        metadata: {
          timestamp: new Date().toISOString(),
          conversation_pair: true,
          ...metadata
        }
      }

      await this.client.add(messages, options)
      return true
    } catch (error) {
      console.error('[MEMORY] Failed to add conversation:', error)
      return false
    }
  }
}

// Export singleton instance
export const memoryClient = new TenantMemoryClient() 