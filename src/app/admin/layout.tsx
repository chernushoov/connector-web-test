'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAdminAuth, useAdminStore } from '@/store/admin'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { cn } from '@/lib/utils'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAdminAuth()
  const sidebarCollapsed = useAdminStore((state) => state.ui.sidebarCollapsed)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') return

    // Redirect to login if not authenticated
    if (mounted && !isLoading && !isAuthenticated) {
      router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [mounted, isAuthenticated, isLoading, pathname, router])

  // Show loading while checking auth
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Login page layout (no sidebar)
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-neutral-100">{children}</div>
  }

  // Not authenticated - show nothing while redirecting
  if (!isAuthenticated) {
    return null
  }

  // Main admin layout
  return (
    <div className="min-h-screen bg-neutral-100">
      <AdminSidebar />

      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <AdminHeader />

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
