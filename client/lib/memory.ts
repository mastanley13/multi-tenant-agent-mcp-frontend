// Placeholder memory client - will be replaced with full implementation
export class TenantMemoryClient {
  isAvailable(): boolean {
    return false
  }

  async addMessage(message: string, tenantId: string, role: 'user' | 'assistant', metadata?: any): Promise<boolean> {
    console.log('[MEMORY] Placeholder - memory system not active')
    return false
  }

  async getConversationContext(query: string, tenantId: string, conversationId?: string): Promise<string> {
    console.log('[MEMORY] Placeholder - memory system not active')
    return ''
  }
}

// Export singleton instance
export const memoryClient = new TenantMemoryClient() 