'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, EmptyState, LoadingState } from '@/components/shared'
import { Button } from '@/components/ui/Button'
import {
  Heart,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Briefcase,
  Star,
  Trash2,
} from 'lucide-react'
import type { Language } from '@/types'

interface FavoriteShift {
  id: string
  title: string
  companyName: string
  city: string
  date: string
  startTime: string
  endTime: string
  hourlyRate: number
  status: 'published' | 'active' | 'filled' | 'completed' | 'cancelled'
  isInstant: boolean
  savedAt: string
}

interface FavoriteEmployer {
  id: string
  companyName: string
  companyLogo: string | null
  city: string
  rating: number
  activeShifts: number
  industry: string
}

type TabView = 'shifts' | 'employers'

export default function WorkerFavoritesPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { showToast } = useConnectorStore()

  const [activeTab, setActiveTab] = useState<TabView>('shifts')
  const [shifts, setShifts] = useState<FavoriteShift[]>([])
  const [employers, setEmployers] = useState<FavoriteEmployer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    setIsLoading(true)
    // For now, use empty state — API endpoints for favorites
    // would be /api/favorites?type=shifts and /api/favorites?type=employers
    await new Promise(r => setTimeout(r, 300))
    setShifts([])
    setEmployers([])
    setIsLoading(false)
  }

  const removeShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id))
    showToast('Removed from favorites', 'success')
  }

  const removeEmployer = (id: string) => {
    setEmployers(prev => prev.filter(e => e.id !== id))
    showToast('Unfollowed employer', 'success')
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: 'bg-green-100 text-green-700',
      active: 'bg-blue-100 text-blue-700',
      filled: 'bg-amber-100 text-amber-700',
      completed: 'bg-neutral-100 text-neutral-600',
      cancelled: 'bg-red-100 text-red-700',
    }
    return styles[status] || 'bg-neutral-100 text-neutral-600'
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header title="Favorites" showBack showNotifications />

      {/* Segment tabs */}
      <div className="px-4 py-3 bg-white border-b border-neutral-100">
        <div className="flex bg-neutral-100 rounded-xl p-1">
          {(['shifts', 'employers'] as TabView[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500'
              )}
            >
              {tab === 'shifts' ? 'Shifts' : 'Employers'}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-4">
        {isLoading ? (
          <LoadingState variant="skeleton" />
        ) : activeTab === 'shifts' ? (
          shifts.length === 0 ? (
            <EmptyState
              type="no-favorites"
              title="No saved shifts"
              subtitle="Tap the heart icon on shifts to save them here"
              action={{
                label: 'Browse Shifts',
                onClick: () => router.push('/worker'),
              }}
            />
          ) : (
            <motion.div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {shifts.map((shift, i) => (
                  <motion.div
                    key={shift.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-neutral-200 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusBadge(shift.status))}>
                          {shift.status}
                        </span>
                        {shift.isInstant && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            Instant
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeShift(shift.id)}
                        className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      </button>
                    </div>

                    <h3
                      className="font-semibold text-neutral-900 mb-1 cursor-pointer hover:text-brand-primary"
                      onClick={() => router.push(`/worker/shifts/${shift.id}`)}
                    >
                      {shift.title}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-3">{shift.companyName}</p>

                    <div className="flex flex-wrap gap-3 text-sm text-neutral-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{shift.city}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{shift.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{shift.startTime}-{shift.endTime}</span>
                      <span className="flex items-center gap-1 font-medium text-neutral-700"><DollarSign className="w-3.5 h-3.5" />{shift.hourlyRate} ILS/hr</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )
        ) : (
          employers.length === 0 ? (
            <EmptyState
              type="no-favorites"
              title="No followed employers"
              subtitle="Follow employers to see their new shifts first"
              action={{
                label: 'Search',
                onClick: () => router.push('/search'),
              }}
            />
          ) : (
            <motion.div className="space-y-3">
              {employers.map((emp, i) => (
                <motion.div
                  key={emp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-neutral-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 truncate">{emp.companyName}</h3>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" />{emp.rating}</span>
                        <span>&middot;</span>
                        <span>{emp.activeShifts} active shifts</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeEmployer(emp.id)}
                      className="p-2 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )
        )}
      </main>

      <Navigation />
    </div>
  )
}
