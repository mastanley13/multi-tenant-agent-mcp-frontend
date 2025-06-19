import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tenantId } = params
    
    // Proxy request to backend wrapper
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/tools`, {
      method: 'GET',
      headers: {
        'x-tenant-id': tenantId,
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend tools request failed:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch tools', details: errorText },
        { status: response.status }
      )
    }

    const tools = await response.json()
    return NextResponse.json(tools)
    
  } catch (error) {
    console.error('MCP tools API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 