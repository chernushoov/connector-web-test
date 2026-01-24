// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = withAdminAuth(request)
  if ('error' in auth) return auth.error

  const { supabase } = auth

  try {
    // Fetch counts in parallel
    const [usersRes, shiftsRes, applicationsRes, disputesRes, paymentsRes] = await Promise.all([
      supabase.from('profiles').select('id, user_type, is_verified, created_at', { count: 'exact' }),
      supabase.from('shifts').select('id, status, created_at', { count: 'exact' }),
      supabase.from('applications').select('id, status', { count: 'exact' }),
      supabase.from('disputes').select('id, status', { count: 'exact' }),
      supabase.from('escrow_payments').select('id, status, amount', { count: 'exact' }),
    ])

    const users = usersRes.data || []
    const shifts = shiftsRes.data || []
    const applications = applicationsRes.data || []
    const disputes = disputesRes.data || []
    const payments = paymentsRes.data || []

    // Calculate stats
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const stats = {
      totalUsers: users.length,
      newUsersToday: users.filter((u: any) => new Date(u.created_at) >= todayStart).length,
      verifiedUsers: users.filter((u: any) => u.is_verified).length,
      workers: users.filter((u: any) => u.user_type === 'worker').length,
      employers: users.filter((u: any) => u.user_type === 'employer').length,

      totalShifts: shifts.length,
      activeShifts: shifts.filter((s: any) => s.status === 'active').length,
      pendingShifts: shifts.filter((s: any) => s.status === 'pending' || s.status === 'draft').length,

      totalApplications: applications.length,
      pendingApplications: applications.filter((a: any) => a.status === 'applied').length,

      openDisputes: disputes.filter((d: any) => d.status === 'open' || d.status === 'in_review').length,
      totalDisputes: disputes.length,

      totalPayments: payments.length,
      totalVolume: payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
      pendingPayments: payments.filter((p: any) => p.status === 'held').length,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
