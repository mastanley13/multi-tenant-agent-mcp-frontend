import MemoryClient from 'mem0ai'

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
  private client: MemoryClient | null = null
  private initialized: boolean = false

  constructor() {
    try {
      const apiKey = process.env.MEM0_API_KEY
      if (!apiKey) {
        console.warn('[MEMORY] MEM0_API_KEY not found, memory features will be disabled')
        return
      }
      
      this.client = new MemoryClient({ apiKey })
      this.initialized = true
      console.log('[MEMORY] Mem0 client initialized successfully')
    } catch (error) {
      console.error('[MEMORY] Failed to initialize Mem0 client:', error)
      this.initialized = false
    }
  }

  /**
   * Check if memory client is available
   */
  isAvailable(): boolean {
    return this.initialized && this.client !== null
  }

  /**
   * Add a message to user-specific memory (tied to GHL userId, not locationId)
   */
  async addMessage(message: string, ghlUserId: string, role: 'user' | 'assistant', metadata?: any): Promise<boolean> {
    if (!this.isAvailable() || !this.client) {
      console.warn('[MEMORY] Client not available, skipping memory addition')
      return false
    }

    if (!ghlUserId) {
      console.warn('[MEMORY] No ghlUserId provided, skipping memory addition')
      return false
    }

    try {
      const messages: Message[] = [{ role, content: message }]
      const options: MemoryOptions = { 
        user_id: ghlUserId, // Use actual GHL user ID for memory persistence
        metadata: {
          timestamp: new Date().toISOString(),
          role,
          ...metadata
        }
      }

      await this.client.add(messages, options)
      console.log(`[MEMORY] Added ${role} message to memory for user: ${ghlUserId}`)
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
    if (!this.isAvailable() || !this.client) {
      console.warn('[MEMORY] Client not available, returning empty memories')
      return []
    }

    if (!ghlUserId) {
      console.warn('[MEMORY] No ghlUserId provided, returning empty memories')
      return []
    }

    try {
      const options: SearchOptions = {
        user_id: ghlUserId, // Search memories for actual GHL user
        limit,
        threshold: 0.1 // Only return memories with reasonable relevance
      }

      const result: MemoryResult[] = await this.client.search(query, options)
      
      if (!result || result.length === 0) {
        console.log(`[MEMORY] No relevant memories found for user: ${ghlUserId}`)
        return []
      }

      const memories = result
        .filter(r => r.score && r.score > 0.1) // Additional score filtering
        .map(r => r.memory || '')
        .filter(m => m.length > 0) // Remove empty memories

      console.log(`[MEMORY] Found ${memories.length} relevant memories for user: ${ghlUserId}`)
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
    if (!this.isAvailable()) {
      return ''
    }

    if (!ghlUserId) {
      console.warn('[MEMORY] No ghlUserId provided for context')
      return ''
    }

    try {
      const relevantMemories = await this.searchMemories(query, ghlUserId, 5)
      
      if (relevantMemories.length === 0) {
        return ''
      }

      // Build context from most relevant memories
      const context = relevantMemories
        .slice(0, 3) // Limit to top 3 most relevant
        .join('\n')

      console.log(`[MEMORY] Built context with ${relevantMemories.length} memories for user: ${ghlUserId}`)
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
    if (!this.isAvailable() || !this.client) {
      return false
    }

    if (!ghlUserId) {
      console.warn('[MEMORY] No ghlUserId provided for conversation')
      return false
    }

    try {
      // Add both messages as a conversation pair
      const messages: Message[] = [
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantResponse }
      ]

      const options: MemoryOptions = {
        user_id: ghlUserId, // Store conversation for actual GHL user
        metadata: {
          timestamp: new Date().toISOString(),
          conversation_pair: true,
          ...metadata
        }
      }

      await this.client.add(messages, options)
      console.log(`[MEMORY] Added conversation pair to memory for user: ${ghlUserId}`)
      return true
    } catch (error) {
      console.error('[MEMORY] Failed to add conversation:', error)
      return false
    }
  }
}

// Export singleton instance
export const memoryClient = new TenantMemoryClient() 