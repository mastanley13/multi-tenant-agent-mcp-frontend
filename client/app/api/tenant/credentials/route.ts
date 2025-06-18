import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Body {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  locationId: string
  companyId?: string
  ghlUserId?: string
  userType?: string
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { accessToken, refreshToken, expiresAt, locationId, companyId, ghlUserId, userType } =
      (await req.json()) as Partial<Body>

    if (!accessToken || !locationId) {
      return NextResponse.json({ error: 'accessToken and locationId required' }, { status: 400 })
    }

    // Upsert the credential row keyed by tenantId = session.user.id
    await prisma.tenantSecret.upsert({
      where: { tenantId: session.user.id },
      update: { accessToken, refreshToken, expiresAt, locationId, companyId, ghlUserId, userType },
      create: { tenantId: session.user.id, accessToken, refreshToken, expiresAt, locationId, companyId, ghlUserId, userType }
    } as any)

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error('Credential upsert error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 