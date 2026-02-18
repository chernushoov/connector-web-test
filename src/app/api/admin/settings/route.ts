/**
 * Admin Settings API
 * GET /api/admin/settings - Get platform settings
 * PUT /api/admin/settings - Update platform settings
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'

const DEFAULT_SETTINGS = {
  platform_fee: 10,
  min_withdrawal: 100,
  max_shifts_per_day: 3,
  auto_approve_shifts: false,
  require_documents: true,
}

export async function GET(request: NextRequest) {
  const auth = withAdminAuth(request)
  if ('error' in auth) return auth.error

  const { supabase } = auth

  try {
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('*')
      .single()

    return NextResponse.json({ settings: settings || DEFAULT_SETTINGS })
  } catch {
    return NextResponse.json({ settings: DEFAULT_SETTINGS })
  }
}

export async function PUT(request: NextRequest) {
  const auth = withAdminAuth(request)
  if ('error' in auth) return auth.error

  const { supabase, admin } = auth

  try {
    const body = await request.json()

    // Validate fields
    const allowedFields = [
      'platform_fee',
      'min_withdrawal',
      'max_shifts_per_day',
      'auto_approve_shifts',
      'require_documents',
    ]

    const updates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updates[key] = value
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Validate numeric ranges
    if (typeof updates.platform_fee === 'number' && (updates.platform_fee < 0 || updates.platform_fee > 50)) {
      return NextResponse.json({ error: 'Platform fee must be between 0 and 50' }, { status: 400 })
    }
    if (typeof updates.min_withdrawal === 'number' && updates.min_withdrawal < 0) {
      return NextResponse.json({ error: 'Min withdrawal must be positive' }, { status: 400 })
    }
    if (typeof updates.max_shifts_per_day === 'number' && (updates.max_shifts_per_day < 1 || updates.max_shifts_per_day > 10)) {
      return NextResponse.json({ error: 'Max shifts per day must be between 1 and 10' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()
    updates.updated_by = admin.id

    const { data, error } = await supabase
      .from('platform_settings')
      .upsert({
        id: 'default',
        ...updates,
      })
      .select()
      .single()

    if (error) {
      console.error('Update settings error:', error)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json({ success: true, settings: data })
  } catch (error) {
    console.error('Admin settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
