// @ts-nocheck
/**
 * Nearby Shifts (Geo Search)
 * GET /api/shifts/nearby - Find shifts near location
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nearbyShiftsSchema, validate, formatErrors } from '@/lib/validators'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query params
    const params = {
      latitude: parseFloat(searchParams.get('lat') || searchParams.get('latitude') || '0'),
      longitude: parseFloat(searchParams.get('lng') || searchParams.get('longitude') || '0'),
      radius_km: parseInt(searchParams.get('radius') || searchParams.get('radius_km') || '50'),
      limit: parseInt(searchParams.get('limit') || '20'),
    }

    // Validate params
    const validation = validate(nearbyShiftsSchema, params)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatErrors(validation.errors) },
        { status: 400 }
      )
    }

    const { latitude, longitude, radius_km, limit } = validation.data
    const supabase = await createClient()

    // Call the PostgreSQL function for geo search
    const { data: shifts, error } = await supabase
      .rpc('find_shifts_nearby', {
        user_lat: latitude,
        user_lng: longitude,
        radius_km: radius_km,
        max_results: limit,
      })

    if (error) {
      console.error('Nearby search error:', error)

      // Fallback to simple query if function doesn't exist yet
      if (error.code === 'PGRST202') {
        const { data: fallbackShifts, error: fallbackError } = await supabase
          .from('shifts')
          .select(`
            *,
            employer:profiles!shifts_employer_id_fkey(
              id,
              full_name,
              avatar_url,
              is_verified
            )
          `)
          .in('status', ['published', 'active'])
          .not('location_lat', 'is', null)
          .not('location_lng', 'is', null)
          .limit(limit)

        if (fallbackError) {
          return NextResponse.json(
            { error: 'Search failed' },
            { status: 500 }
          )
        }

        // Calculate distances manually
        const shiftsWithDistance = (fallbackShifts || []).map((shift: Record<string, unknown>) => {
          const distance = calculateDistance(
            latitude,
            longitude,
            shift.location_lat as number,
            shift.location_lng as number
          )
          return { ...shift, distance_km: distance }
        })

        // Filter by radius and sort
        const filtered = shiftsWithDistance
          .filter((s: { distance_km: number }) => s.distance_km <= radius_km)
          .sort((a: { distance_km: number }, b: { distance_km: number }) => a.distance_km - b.distance_km)
          .slice(0, limit)

        return NextResponse.json({
          shifts: filtered,
          location: { latitude, longitude },
          radius_km,
          count: filtered.length,
        })
      }

      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }

    // Get full shift details for the results
    if (shifts && shifts.length > 0) {
      const shiftIds = shifts.map((s: { id: string }) => s.id)

      const { data: fullShifts } = await supabase
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
        .in('id', shiftIds)

      // Merge distance info with full shift data
      const shiftsWithDistance = (fullShifts || []).map((shift: Record<string, unknown>) => {
        const nearbyInfo = shifts.find((s: { id: string }) => s.id === shift.id)
        return {
          ...shift,
          distance_km: nearbyInfo?.distance_km || null,
        }
      })

      // Sort by distance
      shiftsWithDistance.sort((a: { distance_km: number }, b: { distance_km: number }) =>
        (a.distance_km || 999) - (b.distance_km || 999)
      )

      return NextResponse.json({
        shifts: shiftsWithDistance,
        location: { latitude, longitude },
        radius_km,
        count: shiftsWithDistance.length,
      })
    }

    return NextResponse.json({
      shifts: [],
      location: { latitude, longitude },
      radius_km,
      count: 0,
    })
  } catch (error) {
    console.error('Nearby search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // Round to 1 decimal
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}
