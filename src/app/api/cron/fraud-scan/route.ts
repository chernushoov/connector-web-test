// ============================================
// Cron: Fraud Scan
// Runs every 4 hours to detect suspicious users
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getAgent } from '@/lib/agent'
import { FraudDetectionModule } from '@/lib/agent/modules/fraud-detection'

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const agent = getAgent()
  agent.start()

  try {
    // In production: fetch active users from Supabase
    // const { data: users } = await supabase
    //   .from('users')
    //   .select('*, worker_profiles(*)')
    //   .eq('status', 'active')
    //   .gte('last_active', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    // For now, return agent status
    const stats = agent.getStats()

    return NextResponse.json({
      success: true,
      message: 'Fraud scan cron executed',
      stats: {
        byModule: stats.byModule,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

function verifyCronSecret(req: NextRequest): boolean {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  return secret === process.env.CRON_SECRET
}
