'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, EmptyState, LoadingState } from '@/components/shared'
import { Button } from '@/components/ui/Button'
import {
  Search,
  Star,
  MapPin,
  Clock,
  Briefcase,
  MessageCircle,
  Phone,
  Heart,
  Filter,
  ChevronDown,
  User,
  CheckCircle2,
} from 'lucide-react'
import type { Language } from '@/types'

interface Candidate {
  id: string
  fullName: string
  avatarUrl: string | null
  city: string
  specialization: string[]
  rating: number
  reviewCount: number
  completedShifts: number
  responseTime: string
  hourlyRate: number
  isVerified: boolean
  hasCar: boolean
  languages: string[]
  isOnline: boolean
}

export default function CandidatesPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { showToast } = useConnectorStore()

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    specialization: '',
    minRating: 0,
    city: '',
    verifiedOnly: false,
  })

  useEffect(() => {
    loadCandidates()
  }, [])

  const loadCandidates = async () => {
    setIsLoading(true)
    // Workers search would be via /api/users?type=worker or /api/shifts/search
    await new Promise(r => setTimeout(r, 300))
    setCandidates([])
    setIsLoading(false)
  }

  const filteredCandidates = candidates.filter(c => {
    if (searchQuery && !c.fullName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filters.verifiedOnly && !c.isVerified) return false
    if (filters.minRating && c.rating < filters.minRating) return false
    if (filters.city && c.city !== filters.city) return false
    return true
  })

  const specializations = ['cleaning', 'delivery', 'warehouse', 'construction', 'hospitality', 'retail']

  return (
    <div className="min-h-screen bg-neutral-50 pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header title="Find Workers" showBack showNotifications />

      {/* Search bar */}
      <div className="px-4 py-3 bg-white border-b border-neutral-100 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skill..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'p-2.5 rounded-full transition-colors',
              showFilters ? 'bg-brand-primary text-white' : 'bg-neutral-100 text-neutral-600'
            )}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {specializations.map(spec => (
            <button
              key={spec}
              onClick={() => setFilters(f => ({
                ...f,
                specialization: f.specialization === spec ? '' : spec,
              }))}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                filters.specialization === spec
                  ? 'bg-brand-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {spec.charAt(0).toUpperCase() + spec.slice(1)}
            </button>
          ))}
        </div>

        {/* Extended filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pt-3 border-t border-neutral-100 space-y-3"
          >
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => setFilters(f => ({ ...f, verifiedOnly: e.target.checked }))}
                className="w-4 h-4 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-neutral-700">Verified workers only</span>
            </label>
            <div className="flex gap-3">
              <select
                value={filters.minRating}
                onChange={(e) => setFilters(f => ({ ...f, minRating: Number(e.target.value) }))}
                className="flex-1 bg-neutral-100 rounded-xl px-3 py-2 text-sm focus:outline-none"
              >
                <option value={0}>Any rating</option>
                <option value={4}>4+ stars</option>
                <option value={4.5}>4.5+ stars</option>
              </select>
              <Button size="sm" variant="ghost" onClick={() => setFilters({ specialization: '', minRating: 0, city: '', verifiedOnly: false })}>
                Reset
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <main className="px-4 py-4">
        {isLoading ? (
          <LoadingState variant="skeleton" />
        ) : filteredCandidates.length === 0 ? (
          <EmptyState
            type="no-workers"
            title="No workers found"
            subtitle="Try adjusting your filters or search terms"
            action={{
              label: 'Post a Shift',
              onClick: () => router.push('/employer/create-shift'),
            }}
          />
        ) : (
          <motion.div className="space-y-3">
            {filteredCandidates.map((worker, i) => (
              <motion.div
                key={worker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-neutral-200 p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center">
                      <User className="w-7 h-7 text-brand-primary" />
                    </div>
                    {worker.isVerified && (
                      <CheckCircle2 className="w-5 h-5 text-blue-500 absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
                    )}
                    {worker.isOnline && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-neutral-900 truncate">{worker.fullName}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500" />{worker.rating}
                      </span>
                      <span>&middot;</span>
                      <span>{worker.completedShifts} shifts</span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{worker.responseTime}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {worker.specialization.slice(0, 3).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-neutral-100 rounded-full text-xs text-neutral-600">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">{worker.hourlyRate} ILS/hr</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => showToast('Invite sent!', 'success')}
                          className="px-3 py-1.5 bg-brand-primary text-white rounded-full text-xs font-medium hover:bg-brand-primary/90 transition-colors"
                        >
                          Invite
                        </button>
                        <button
                          onClick={() => showToast('Added to favorites', 'success')}
                          className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
                        >
                          <Heart className="w-4 h-4 text-neutral-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
