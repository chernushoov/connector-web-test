/**
 * Current User Profile
 * GET /api/users/me - Get current user with full profile
 * PATCH /api/users/me - Update current user profile
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { updateWorkerProfileSchema, updateEmployerProfileSchema, validate, formatErrors } from '@/lib/validators'

/**
 * GET - Get current user with full profile
 */
export async function GET() {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Get base profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get type-specific profile
    let specificProfile = null

    if (profile.user_type === 'worker') {
      const { data } = await supabase
        .from('worker_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      specificProfile = data
    } else if (profile.user_type === 'employer') {
      const { data } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      specificProfile = data
    }

    // Get active subscription if any
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    // Get unread notifications count
    const { count: unreadNotifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
      },
      profile,
      specificProfile,
      subscription,
      unreadNotifications: unreadNotifications || 0,
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update current user profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const supabaseAdmin = createAdminClient()

    // Get current profile to determine user type
    const { data: currentProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (!currentProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Separate base profile fields from specific profile fields
    const baseFields = ['full_name', 'avatar_url', 'city', 'bio', 'language', 'timezone']
    const baseUpdate: Record<string, unknown> = {}
    const specificUpdate: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(body)) {
      if (baseFields.includes(key)) {
        baseUpdate[key] = value
      } else {
        specificUpdate[key] = value
      }
    }

    // Update base profile if has fields
    if (Object.keys(baseUpdate).length > 0) {
      baseUpdate.updated_at = new Date().toISOString()

      const { error: baseError } = await supabaseAdmin
        .from('profiles')
        .update(baseUpdate)
        .eq('id', user.id)

      if (baseError) {
        console.error('Base profile update error:', baseError)
        return NextResponse.json(
          { error: 'Failed to update profile', message: baseError.message },
          { status: 400 }
        )
      }
    }

    // Update specific profile if has fields
    if (Object.keys(specificUpdate).length > 0) {
      // Validate based on user type
      const schema = currentProfile.user_type === 'worker'
        ? updateWorkerProfileSchema
        : updateEmployerProfileSchema

      const validation = validate(schema, specificUpdate)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: formatErrors(validation.errors) },
          { status: 400 }
        )
      }

      const tableName = currentProfile.user_type === 'worker'
        ? 'worker_profiles'
        : 'employer_profiles'

      specificUpdate.updated_at = new Date().toISOString()

      const { error: specificError } = await supabaseAdmin
        .from(tableName)
        .update(specificUpdate)
        .eq('id', user.id)

      if (specificError) {
        console.error('Specific profile update error:', specificError)
        return NextResponse.json(
          { error: 'Failed to update profile', message: specificError.message },
          { status: 400 }
        )
      }
    }

    // Return updated profile
    const { data: updatedProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
