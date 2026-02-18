/**
 * Disputes API
 * GET /api/disputes - Get my disputes
 * POST /api/disputes - Create dispute
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createDisputeSchema, validate, formatErrors } from '@/lib/validators'
import { sanitizeText } from '@/lib/sanitize'
import { PAGINATION } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const supabase = await createClient()

    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || String(PAGINATION.DEFAULT_PAGE))
    const limit = Math.min(parseInt(searchParams.get('limit') || String(PAGINATION.DEFAULT_LIMIT)), PAGINATION.ADMIN_MAX_LIMIT)
    const offset = (page - 1) * limit

    let query = supabase
      .from('disputes')
      .select(`
        *,
        initiator:profiles!disputes_initiator_id_fkey(id, full_name, avatar_url),
        respondent:profiles!disputes_respondent_id_fkey(id, full_name, avatar_url),
        task_flow:task_flows!disputes_task_flow_id_fkey(
          id, status,
          shift:shifts!task_flows_shift_id_fkey(id, title)
        )
      `, { count: 'exact' })
      .or(`initiator_id.eq.${user.id},respondent_id.eq.${user.id}`)

    if (status) {
      query = query.eq('status', status)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: disputes, error, count } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 })
    }

    return NextResponse.json({
      disputes: disputes || [],
      pagination: { page, limit, total: count || 0 },
    })
  } catch (error) {
    console.error('Get disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = validate(createDisputeSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatErrors(validation.errors) },
        { status: 400 }
      )
    }

    const data = validation.data
    const supabaseAdmin = createAdminClient()

    // Verify user is part of the task flow
    const { data: taskFlow } = await supabaseAdmin
      .from('task_flows')
      .select('worker_id, employer_id')
      .eq('id', data.task_flow_id)
      .single()

    if (!taskFlow) {
      return NextResponse.json({ error: 'Task flow not found' }, { status: 404 })
    }

    if (taskFlow.worker_id !== user.id && taskFlow.employer_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check for existing dispute
    const { data: existing } = await supabaseAdmin
      .from('disputes')
      .select('id')
      .eq('task_flow_id', data.task_flow_id)
      .eq('status', 'open')
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Active dispute already exists', disputeId: existing.id },
        { status: 400 }
      )
    }

    const { data: dispute, error: createError } = await supabaseAdmin
      .from('disputes')
      .insert({
        task_flow_id: data.task_flow_id,
        shift_id: data.shift_id,
        initiator_id: user.id,
        respondent_id: data.respondent_id,
        type: data.type,
        description: sanitizeText(data.description),
        evidence: data.evidence || [],
        priority: data.priority || 'medium',
        status: 'open',
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: 'Failed to create dispute' }, { status: 500 })
    }

    // Notify respondent
    await supabaseAdmin.from('notifications').insert({
      user_id: data.respondent_id,
      type: 'dispute',
      title: 'Открыт спор',
      body: 'Против вас открыт спор. Пожалуйста, ответьте.',
      data: { dispute_id: dispute.id, task_flow_id: data.task_flow_id },
    })

    return NextResponse.json({ success: true, dispute }, { status: 201 })
  } catch (error) {
    console.error('Create dispute error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
