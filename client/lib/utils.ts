import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { prisma } from './prisma'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const isYesterday = d.toDateString() === new Date(now.getTime() - 86400000).toDateString()
  
  if (isToday) return 'Today'
  if (isYesterday) return 'Yesterday'
  
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export async function getTenantSecrets(tenantId: string) {
  const secret = await prisma.tenantSecret.findUnique({ where: { tenantId } })
  if (!secret) {
    throw new Error(`TenantSecret not found for ${tenantId}`)
  }
  return {
    accessToken: secret.accessToken,
    refreshToken: secret.refreshToken ?? '',
    expiresAt: secret.expiresAt ?? 0,
    locationId: secret.locationId,
    companyId: secret.companyId ?? '',
    ghlUserId: secret.ghlUserId ?? '',
    userType: secret.userType ?? '',
  }
} 