// @ts-nocheck
/**
 * User Profile by ID
 * GET /api/users/[id] - Get public user profile
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET - Get user profile by ID (public view)
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const currentUser = await getUser()
    const supabase = await createClient()

    // Get base profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        avatar_url,
        city,
        bio,
        user_type,
        is_verified,
        created_at
      `)
      .eq('id', id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get type-specific public profile
    let specificProfile = null
    let stats = null

    if (profile.user_type === 'worker') {
      const { data: workerProfile } = await supabase
        .from('worker_profiles')
        .select(`
          specializations,
          skills,
          experience_years,
          hourly_rate_min,
          hourly_rate_max,
          has_car,
          has_tools,
          total_jobs,
          rating,
          review_count,
          is_pro,
          response_rate,
          completion_rate,
          is_available
        `)
        .eq('id', id)
        .single()

      specificProfile = workerProfile

      // Get portfolio items
      const { data: portfolio } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('worker_id', id)
        .order('created_at', { ascending: false })
        .limit(10)

      stats = {
        portfolio: portfolio || [],
      }
    } else if (profile.user_type === 'employer') {
      const { data: employerProfile } = await supabase
        .from('employer_profiles')
        .select(`
          company_name,
          company_description,
          company_logo,
          company_website,
          industry,
          company_size,
          total_jobs_posted,
          total_spent,
          rating,
          review_count,
          is_verified_company,
          plan
        `)
        .eq('id', id)
        .single()

      specificProfile = employerProfile

      // Get recent shifts (public)
      const { data: recentShifts, count: totalShifts } = await supabase
        .from('shifts')
        .select('id, title, city, base_rate, date, status', { count: 'exact' })
        .eq('employer_id', id)
        .in('status', ['published', 'active'])
        .order('created_at', { ascending: false })
        .limit(5)

      stats = {
        recentShifts: recentShifts || [],
        totalShifts: totalShifts || 0,
      }
    }

    // Get reviews for this user
    const { data: reviews, count: reviewCount } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        reviewer:profiles!reviews_reviewer_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('reviewee_id', id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Check if current user can see more details
    const isOwnProfile = currentUser?.id === id
    const canSeePrivateDetails = isOwnProfile

    return NextResponse.json({
      profile: {
        ...profile,
        ...specificProfile,
      },
      stats,
      reviews: {
        items: reviews || [],
        total: reviewCount || 0,
      },
      isOwnProfile,
      canSeePrivateDetails,
    })
  } catch (error) {
    console.error('Get user by ID error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
