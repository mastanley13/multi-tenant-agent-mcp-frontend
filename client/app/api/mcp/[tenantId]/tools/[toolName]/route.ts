import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; toolName: string }> }
) {
  try {
    // Check for Authorization header first (for OpenAI Agent calls)
    const authHeader = request.headers.get('Authorization')
    let accessToken: string | null = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7) // Remove 'Bearer ' prefix
    } else {
      // Fallback to session-based auth (for direct browser calls)
      const session = await getServerSession(authOptions)
      accessToken = session?.accessToken || null
    }
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tenantId, toolName } = await params
    const body = await request.json()
    
    // Proxy request to backend wrapper
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/tools/${toolName}`, {
      method: 'POST',
      headers: {
        'x-tenant-id': tenantId,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend tool execution failed for ${toolName}:`, response.status, errorText)
      return NextResponse.json(
        { error: `Failed to execute tool ${toolName}`, details: errorText },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    const { toolName } = await params
    console.error(`MCP tool execution API error for ${toolName}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 