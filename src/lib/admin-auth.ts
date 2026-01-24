import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'connector-admin-2024'

interface AdminPayload {
  id: string
  email: string
  role: string
  iat: number
  exp: number
}

function hmacSign(data: string): string {
  return createHmac('sha256', ADMIN_SECRET).update(data).digest('base64url')
}

export function signAdminToken(payload: Omit<AdminPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000)
  const data = { ...payload, iat: now, exp: now + 7 * 24 * 60 * 60 }
  const dataB64 = Buffer.from(JSON.stringify(data)).toString('base64url')
  const signature = hmacSign(dataB64)
  return `${dataB64}.${signature}`
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const [dataB64, signature] = token.split('.')
    if (!dataB64 || !signature) return null

    // Verify HMAC signature with timing-safe comparison
    const expectedSig = hmacSign(dataB64)
    const sigBuf = Buffer.from(signature)
    const expectedBuf = Buffer.from(expectedSig)
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null
    }

    const payload: AdminPayload = JSON.parse(Buffer.from(dataB64, 'base64url').toString())
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
