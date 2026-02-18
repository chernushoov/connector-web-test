/**
 * Shifts API
 * GET /api/shifts - List shifts (with basic filters)
 * POST /api/shifts - Create new shift (employers only)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createShiftSchema, validate, formatErrors } from '@/lib/validators'
import { getAgent } from '@/lib/agent'
import { isDemoMode } from '@/lib/demo'
import { sanitizeText } from '@/lib/sanitize'
import { PAGINATION, SHIFTS } from '@/lib/config'

const demoShifts = [
  {
        id: 'shift-1',
        title: 'Уборка офиса',
        description: 'Генеральная уборка офиса 150 кв.м. Все средства предоставляются.',
        city: 'Тель-Авив',
        address: 'ул. Ротшильд 45',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '14:00',
        base_rate: 65,
        hourly_rate: 65,
        currency: 'ILS',
        status: 'published',
        urgency: 'normal',
        specialization: 'cleaning',
        is_instant: false,
        employer_id: 'employer-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        employer: {
                id: 'employer-1',
                full_name: 'Давид Коэн',
                avatar_url: null,
                is_verified: true,
        },
        employer_profile: {
                company_name: 'CleanPro Ltd',
                company_logo: null,
                rating: 4.8,
                is_verified_company: true,
        },
  },
  {
        id: 'shift-2',
        title: 'Доставка продуктов',
        description: 'Доставка заказов из супермаркета клиентам. Нужен автомобиль.',
        city: 'Тель-Авив',
        address: 'ул. Дизенгоф 120',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '18:00',
        base_rate: 55,
        hourly_rate: 55,
        currency: 'ILS',
        status: 'published',
        urgency: 'urgent',
        specialization: 'delivery',
        is_instant: true,
        employer_id: 'employer-2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        employer: {
                id: 'employer-2',
                full_name: 'Мария Леви',
                avatar_url: null,
                is_verified: true,
        },
        employer_profile: {
                company_name: 'QuickDelivery',
                company_logo: null,
                rating: 4.5,
                is_verified_company: true,
        },
  },
  {
        id: 'shift-3',
        title: 'Помощь на складе',
        description: 'Разгрузка и сортировка товаров. Физическая работа.',
        city: 'Хайфа',
        address: 'Промзона Кирьят-Ата',
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        start_time: '07:00',
        end_time: '15:00',
        base_rate: 70,
        hourly_rate: 70,
        currency: 'ILS',
        status: 'published',
        urgency: 'normal',
        specialization: 'warehouse',
        is_instant: false,
        employer_id: 'employer-3',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        employer: {
                id: 'employer-3',
                full_name: 'Алекс Браун',
                avatar_url: null,
                is_verified: true,
        },
        employer_profile: {
                company_name: 'LogiStore',
                company_logo: null,
                rating: 4.2,
                is_verified_company: false,
        },
  },
  {
        id: 'shift-4',
        title: 'Официант в ресторане',
        description: 'Обслуживание гостей в ресторане. Опыт приветствуется.',
        city: 'Тель-Авив',
        address: 'ул. Бен-Йегуда 78',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        start_time: '17:00',
        end_time: '23:00',
        base_rate: 60,
        hourly_rate: 60,
        currency: 'ILS',
        status: 'published',
        urgency: 'urgent',
        specialization: 'hospitality',
        is_instant: false,
        employer_id: 'employer-4',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        employer: {
                id: 'employer-4',
                full_name: 'Ицхак Шимон',
                avatar_url: null,
                is_verified: true,
        },
        employer_profile: {
                company_name: 'Cafe Milano',
                company_logo: null,
                rating: 4.6,
                is_verified_company: true,
        },
  },
  {
        id: 'shift-5',
        title: 'Ремонт квартиры',
        description: 'Покраска стен и мелкий ремонт. Инструменты предоставляются.',
        city: 'Иерусалим',
        address: 'ул. Яффо 200',
        date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        start_time: '08:00',
        end_time: '17:00',
        base_rate: 80,
        hourly_rate: 80,
        currency: 'ILS',
        status: 'published',
        urgency: 'normal',
        specialization: 'construction',
        is_instant: false,
        employer_id: 'employer-5',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        employer: {
                id: 'employer-5',
                full_name: 'Олег Петров',
                avatar_url: null,
                is_verified: false,
        },
        employer_profile: {
                company_name: 'FixIt Pro',
                company_logo: null,
                rating: 4.0,
                is_verified_company: false,
        },
  },
  ]

/**
   * GET - List shifts with basic filters
   */
export async function GET(request: NextRequest) {
    try {
          // Demo mode - return mock shifts
      if (isDemoMode()) {
              return NextResponse.json({
                        shifts: demoShifts,
                        pagination: {
                                    page: 1,
                                    limit: 20,
                                    total: demoShifts.length,
                                    totalPages: 1,
                        },
              })
      }

      const { searchParams } = new URL(request.url)
          const supabase = await createClient()

      // Build query
      let query = supabase
            .from('shifts')
            .select(`
                    *,
                            employer:profiles!shifts_employer_id_fkey(
                                      id,
                                                full_name,
                                                          avatar_url,
                                                                    is_verified
                                                                            ),
                                                                                    employer_profile:employer_profiles!shifts_employer_id_fkey(
                                                                                              company_name,
                                                                                                        company_logo,
                                                                                                                  rating,
                                                                                                                            is_verified_company
                                                                                                                                    )
                                                                                                                                          `)
            .in('status', ['published', 'active'])

      // Apply filters
      const city = searchParams.get('city')
          if (city) {
                  query = query.eq('city', city)
          }

      const date = searchParams.get('date')
          if (date) {
                  query = query.eq('date', date)
          }

      const urgency = searchParams.get('urgency')
          if (urgency) {
                  query = query.eq('urgency', urgency)
          }

      const minRate = searchParams.get('min_rate')
          if (minRate) {
                  query = query.gte('base_rate', parseInt(minRate))
          }

      const maxRate = searchParams.get('max_rate')
          if (maxRate) {
                  query = query.lte('base_rate', parseInt(maxRate))
          }

      const specialization = searchParams.get('specialization')
          if (specialization) {
                  query = query.eq('specialization', specialization)
          }

      const instantOnly = searchParams.get('instant_only')
          if (instantOnly === 'true') {
                  query = query.eq('is_instant', true)
          }

      // Pagination
      const page = parseInt(searchParams.get('page') || String(PAGINATION.DEFAULT_PAGE))
          const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || String(PAGINATION.DEFAULT_LIMIT)) || PAGINATION.DEFAULT_LIMIT, 1), PAGINATION.MAX_LIMIT)
          const offset = Math.max((page - 1) * limit, 0)

      // Sorting (allowlist to prevent injection)
      const ALLOWED_SORT_FIELDS: readonly string[] = SHIFTS.ALLOWED_SORT_FIELDS
          const sortByParam = searchParams.get('sort_by') || 'created_at'
          const sortBy = ALLOWED_SORT_FIELDS.includes(sortByParam) ? sortByParam : 'created_at'
          const sortOrder = searchParams.get('sort_order') === 'asc' ? true : false

      query = query
            .order(sortBy, { ascending: sortOrder })
            .range(offset, offset + limit - 1)

      const { data: shifts, error, count } = await query

      if (error) {
              console.error('Shifts query error:', error)
              return NextResponse.json(
                { error: 'Failed to fetch shifts' },
                { status: 500 }
                      )
      }

      return NextResponse.json({
              shifts: shifts || [],
              pagination: {
                        page,
                        limit,
                        total: count || 0,
                        totalPages: Math.ceil((count || 0) / limit),
              },
      })
    } catch (error) {
          console.error('Get shifts error:', error)
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
                )
    }
}

/**
 * POST - Create new shift (employers only)
 */
export async function POST(request: NextRequest) {
    try {
          if (isDemoMode()) {
                  return NextResponse.json({
                            shift: { id: 'demo-shift-new', title: 'Demo Shift' },
                            message: 'Shift created (demo mode)',
                  })
          }

      const user = await getUser()
          if (!user) {
                  return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                          )
          }

      const body = await request.json()
          const validation = validate(createShiftSchema, body)
          if (!validation.success) {
                  return NextResponse.json(
                    { error: 'Validation failed', details: formatErrors(validation.errors) },
                    { status: 400 }
                          )
          }

      const supabaseAdmin = createAdminClient()

      const shiftData = {
            ...validation.data,
            title: sanitizeText(validation.data.title),
            description: sanitizeText(validation.data.description),
            address: validation.data.address ? sanitizeText(validation.data.address) : validation.data.address,
            employer_id: user.id,
            status: 'published',
      }

      const { data: shift, error } = await supabaseAdmin
            .from('shifts')
            .insert(shiftData)
            .select()
            .single()

      if (error) {
              console.error('Create shift error:', error)
              return NextResponse.json(
                { error: 'Failed to create shift' },
                { status: 500 }
                      )
      }

      // AI moderation
      try {
              const agent = getAgent()
              await agent.moderateContent({
                        type: 'shift',
                        id: shift.id,
                        content: `${shift.title} ${shift.description}`,
              })
      } catch (modError) {
              console.error('Moderation error (non-blocking):', modError)
      }

      return NextResponse.json({
              shift,
              message: 'Shift created successfully',
      })
    } catch (error) {
          console.error('Create shift error:', error)
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
                )
    }
}
