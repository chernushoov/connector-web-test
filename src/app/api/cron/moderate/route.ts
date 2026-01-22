// ============================================
// Cron: Batch Moderation
// Runs every 15 minutes to moderate pending content
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getAgent } from '@/lib/agent'

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const agent = getAgent()
  agent.start()

  try {
    // In production: fetch pending items from Supabase
    // const { data: pendingShifts } = await supabase
    //   .from('shifts')
    //   .select('*')
    //   .eq('moderation_status', 'pending')
    //   .limit(50)

    // For now, return status
    const stats = agent.getStats()

    return NextResponse.json({
      success: true,
      message: 'Moderation cron executed',
      stats: {
        total: stats.total,
        completed: stats.completed,
        failed: stats.failed,
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
