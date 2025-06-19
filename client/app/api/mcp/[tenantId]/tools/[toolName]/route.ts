import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string; toolName: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tenantId, toolName } = params
    const body = await request.json()
    
    // Proxy request to backend wrapper
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/tools/${toolName}`, {
      method: 'POST',
      headers: {
        'x-tenant-id': tenantId,
        'Authorization': `Bearer ${session.accessToken}`,
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
    console.error(`MCP tool execution API error for ${params.toolName}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 