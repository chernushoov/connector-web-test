import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'connector-admin-2024'

interface AdminPayload {
  id: string
  email: string
  role: string
  iat: number
  exp: number
}

export function signAdminToken(payload: Omit<AdminPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000)
  const data = { ...payload, iat: now, exp: now + 7 * 24 * 60 * 60 }
  return btoa(JSON.stringify(data)) + '.' + btoa(ADMIN_SECRET.slice(0, 8))
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const [dataB64] = token.split('.')
    if (!dataB64) return null
    const payload: AdminPayload = JSON.parse(atob(dataB64))
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export function withAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const cookieToken = request.cookies.get('admin_token')?.value

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : cookieToken

  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const admin = verifyAdminToken(token)
  if (!admin) {
    return { error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) }
  }

  const supabase = createAdminClient()
  return { admin, supabase }
}
