import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  // ============================================
  // ADMIN ROUTES PROTECTION
  // ============================================
  if (pathname.startsWith('/admin')) {
    // Skip login page - it should be accessible without auth
    if (pathname === '/admin/login') {
      // If already authenticated, redirect to dashboard
      const adminToken = request.cookies.get('admin-token')?.value
      if (adminToken) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return supabaseResponse
    }

    // Check for admin token in cookies
    const adminToken = request.cookies.get('admin-token')?.value

    if (!adminToken) {
      // Redirect to admin login with return URL
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // TODO: Validate admin JWT token
  }

  // ============================================
  // PROTECTED API ROUTES
  // ============================================
  if (pathname.startsWith('/api/')) {
    // Public API routes (no auth required)
    const publicRoutes = [
      '/api/auth/',
      '/api/ai/',  // AI endpoints are public (chat, moderate, etc.)
    ]

    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    if (!isPublicRoute && !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  // ============================================
  // PROTECTED APP ROUTES
  // ============================================
  const protectedRoutes = ['/worker', '/employer', '/profile', '/notifications']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // ============================================
  // AUTH ROUTES (redirect if already logged in)
  // ============================================
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.some(route => pathname === route)

  if (isAuthRoute && user) {
    // Redirect to home if already authenticated
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
