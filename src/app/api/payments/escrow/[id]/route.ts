/**
 * Single Escrow API
 * GET /api/payments/escrow/[id] - Get escrow status
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET - Get escrow details and status
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    const { data: escrow, error } = await supabase
      .from('escrow_transactions')
      .select(`
        *,
        task_flow:task_flows!escrow_transactions_task_flow_id_fkey(
          id,
          status,
          shift:shifts!task_flows_shift_id_fkey(
            id,
            title,
            date,
            start_time
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error || !escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      )
    }

    // Check access
    if (escrow.employer_id !== user.id && escrow.worker_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      escrow,
      isEmployer: escrow.employer_id === user.id,
      isWorker: escrow.worker_id === user.id,
    })
  } catch (error) {
    console.error('Get escrow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
