'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, LoadingState, EmptyState, FilterSheet } from '@/components/shared'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import {
  Search,
  X,
  MapPin,
  Clock,
  Star,
  Filter,
  TrendingUp,
  Briefcase,
  Users,
  ChevronRight,
  Zap,
  Shield
} from 'lucide-react'
import type { ShiftPosting, WorkerProfile, Language } from '@/types'

// Mock shifts for search (simplified structure)
interface SearchShift {
  id: string
  title: string
  employerName: string
  category: string
  startTime: string
  endTime: string
  hourlyRate: number
  location: { address: string }
  spotsTotal: number
  spotsFilled: number
  urgency: 'instant' | 'normal'
}

const mockShifts: SearchShift[] = [
  {
    id: '1',
    employerName: 'FastLogistics Ltd',
    title: 'Warehouse Helper',
    category: 'warehouse',
    startTime: '08:00',
    endTime: '16:00',
    hourlyRate: 55,
    location: { address: 'Tel Aviv, Industrial Area' },
    spotsTotal: 5,
    spotsFilled: 3,
    urgency: 'instant',
  },
  {
    id: '2',
    employerName: 'EventPro',
    title: 'Event Setup Crew',
    category: 'events',
    startTime: '06:00',
    endTime: '14:00',
    hourlyRate: 65,
    location: { address: 'Herzliya, Convention Center' },
    spotsTotal: 8,
    spotsFilled: 2,
    urgency: 'normal',
  },
  {
    id: '3',
    employerName: 'QuickMove',
    title: 'Moving Assistant',
    category: 'moving',
    startTime: '07:00',
    endTime: '15:00',
    hourlyRate: 60,
    location: { address: 'Ramat Gan' },
    spotsTotal: 3,
    spotsFilled: 1,
    urgency: 'normal',
  },
]

// Mock workers for search
const mockWorkers: WorkerProfile[] = [
  {
    id: 'w1',
    phone: '+972501111111',
    name: 'David Ben',
    photoUrl: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    language: 'he',
    isVerified: true,
    verificationStatus: 'verified',
    skills: ['warehouse', 'moving', 'driving'],
    availabilityStatus: 'available',
    rating: 4.9,
    reviewCount: 52,
    hourlyRate: 55,
    city: 'Tel Aviv',
    specialization: 'Logistics & Moving',
    experience: 4,
    about: 'Experienced logistics worker',
    hasCar: true,
    hasTools: false,
    teamSize: 1,
    availability: 'flexible',
    minRate: 50,
    maxRate: 80,
    documents: [],
    portfolio: [],
    completedShifts: 78,
    totalEarned: 42000,
    totalHours: 650,
    reliabilityScore: 98,
    responseTime: 3,
    onTimeRate: 0.99,
    languages: ['Hebrew', 'English'],
    isPro: true,
  },
  {
    id: 'w2',
    phone: '+972502222222',
    name: 'Maria Ivanova',
    photoUrl: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    language: 'ru',
    isVerified: true,
    verificationStatus: 'verified',
    skills: ['cleaning', 'events', 'hospitality'],
    availabilityStatus: 'available',
    rating: 4.7,
    reviewCount: 34,
    hourlyRate: 50,
    city: 'Netanya',
    specialization: 'Cleaning & Events',
    experience: 2,
    about: 'Detail-oriented cleaner',
    hasCar: false,
    hasTools: true,
    teamSize: 1,
    availability: 'flexible',
    minRate: 45,
    maxRate: 70,
    documents: [],
    portfolio: [],
    completedShifts: 45,
    totalEarned: 22500,
    totalHours: 380,
    reliabilityScore: 95,
    responseTime: 8,
    onTimeRate: 0.96,
    languages: ['Russian', 'Hebrew', 'English'],
    isPro: false,
  },
  {
    id: 'w3',
    phone: '+972503333333',
    name: 'Ahmed Hassan',
    photoUrl: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    language: 'ar',
    isVerified: true,
    verificationStatus: 'verified',
    skills: ['construction', 'warehouse', 'driving'],
    availabilityStatus: 'busy',
    rating: 4.8,
    reviewCount: 67,
    hourlyRate: 65,
    city: 'Haifa',
    specialization: 'Construction & Heavy Work',
    experience: 6,
    about: 'Skilled construction worker',
    hasCar: true,
    hasTools: true,
    teamSize: 3,
    availability: 'flexible',
    minRate: 55,
    maxRate: 100,
    documents: [],
    portfolio: [],
    completedShifts: 120,
    totalEarned: 78000,
    totalHours: 1200,
    reliabilityScore: 97,
    responseTime: 5,
    onTimeRate: 0.98,
    languages: ['Arabic', 'Hebrew'],
    isPro: true,
  },
]

const recentSearches = [
  'Warehouse helper',
  'Tel Aviv',
  'Event setup',
  'Moving',
]

const popularCategories = [
  { id: 'warehouse', label: 'Warehouse', icon: Briefcase, count: 45 },
  { id: 'events', label: 'Events', icon: Users, count: 28 },
  { id: 'moving', label: 'Moving', icon: TrendingUp, count: 32 },
]

type SearchMode = 'shifts' | 'workers'

export default function SearchPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()

  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchMode, setSearchMode] = useState<SearchMode>('shifts')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: 'all',
    minRate: 0,
    maxRate: 200,
    verified: false,
  })

  const [shifts] = useState<SearchShift[]>(mockShifts)
  const [workers] = useState<WorkerProfile[]>(mockWorkers)

  const filteredShifts = useMemo(() => {
    if (!query.trim()) return []
    return shifts.filter(shift =>
      shift.title.toLowerCase().includes(query.toLowerCase()) ||
      shift.location.address.toLowerCase().includes(query.toLowerCase()) ||
      shift.category.toLowerCase().includes(query.toLowerCase())
    )
  }, [query, shifts])

  const filteredWorkers = useMemo(() => {
    if (!query.trim()) return []
    let result = workers.filter(worker =>
      worker.name.toLowerCase().includes(query.toLowerCase()) ||
      worker.city?.toLowerCase().includes(query.toLowerCase()) ||
      worker.skills.some(s => s.toLowerCase().includes(query.toLowerCase())) ||
      worker.specialization?.toLowerCase().includes(query.toLowerCase())
    )
    if (filters.verified) {
      result = result.filter(w => w.isVerified)
    }
    return result
  }, [query, workers, filters.verified])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    if (searchQuery.trim()) {
      setIsSearching(true)
      // Simulate search delay
      setTimeout(() => setIsSearching(false), 300)
    }
  }

  const handleCategoryClick = (category: string) => {
    handleSearch(category)
  }

  const hasResults = searchMode === 'shifts'
    ? filteredShifts.length > 0
    : filteredWorkers.length > 0

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Search header */}
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-20">
        <div className="px-4 py-3">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchMode === 'shifts'
                ? t('search.placeholder', language as Language)
                : 'Search workers by name, skill, or city...'
              }
              className={cn(
                'w-full pl-10 pr-10 py-3 rounded-xl',
                'bg-neutral-100 border-none',
                'text-neutral-900 placeholder-neutral-400',
                'focus:outline-none focus:ring-2 focus:ring-brand-primary/20'
              )}
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-200 rounded-full"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            )}
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setSearchMode('shifts')}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                searchMode === 'shifts'
                  ? 'bg-brand-primary text-white'
                  : 'bg-neutral-100 text-neutral-600'
              )}
            >
              {t('search.shifts', language as Language)}
            </button>
            <button
              onClick={() => setSearchMode('workers')}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                searchMode === 'workers'
                  ? 'bg-brand-primary text-white'
                  : 'bg-neutral-100 text-neutral-600'
              )}
            >
              {t('search.workers', language as Language)}
            </button>
            <button
              onClick={() => setShowFilters(true)}
              className="p-2 rounded-lg bg-neutral-100 text-neutral-600"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <main className="px-4 py-4">
        {/* No query - show suggestions */}
        {!query.trim() && (
          <div className="space-y-6">
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-neutral-500 mb-3">
                  {t('search.recent', language as Language)}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="px-3 py-2 bg-white rounded-full text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Popular categories */}
            <section>
              <h3 className="text-sm font-medium text-neutral-500 mb-3">
                {t('search.popular', language as Language)}
              </h3>
              <div className="space-y-2">
                {popularCategories.map((cat) => (
                  <Card
                    key={cat.id}
                    interactive
                    onClick={() => handleCategoryClick(cat.label)}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                      <cat.icon className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{cat.label}</p>
                      <p className="text-sm text-neutral-500">{cat.count} shifts available</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                  </Card>
                ))}
              </div>
            </section>

            {/* Trending */}
            <section>
              <h3 className="text-sm font-medium text-neutral-500 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t('search.trending', language as Language)}
              </h3>
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-brand-accent" />
                  <span className="font-medium">High Demand This Week</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Warehouse', 'Delivery', 'Events', 'Cleaning'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleSearch(tag)}
                      className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </Card>
            </section>
          </div>
        )}

        {/* Loading */}
        {query.trim() && isSearching && (
          <LoadingState variant="dots" />
        )}

        {/* Results */}
        {query.trim() && !isSearching && (
          <>
            {/* Results count */}
            <p className="text-sm text-neutral-500 mb-4">
              {searchMode === 'shifts'
                ? `${filteredShifts.length} shifts found`
                : `${filteredWorkers.length} workers found`
              }
            </p>

            {/* No results */}
            {!hasResults && (
              <EmptyState
                icon={<Search className="w-16 h-16" />}
                title={t('search.noResults', language as Language)}
                subtitle="Try different keywords or adjust filters"
              />
            )}

            {/* Shifts results */}
            {searchMode === 'shifts' && (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredShifts.map((shift, index) => (
                    <motion.div
                      key={shift.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ShiftResultCard shift={shift} language={language as Language} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Workers results */}
            {searchMode === 'workers' && (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredWorkers.map((worker, index) => (
                    <motion.div
                      key={worker.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <WorkerResultCard
                        worker={worker}
                        language={language as Language}
                        onClick={() => router.push(`/worker/${worker.id}`)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </main>

      {/* Filters */}
      <FilterSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(newFilters) => {
          setFilters(prev => ({ ...prev, ...newFilters }))
          setShowFilters(false)
        }}
      />

      <Navigation />
    </div>
  )
}

function ShiftResultCard({ shift, language }: { shift: SearchShift; language: Language }) {
  const spotsLeft = shift.spotsTotal - shift.spotsFilled

  return (
    <Card interactive onClick={() => window.location.href = `/worker/shifts/${shift.id}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-brand-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-neutral-900 truncate">
              {shift.title}
            </h3>
            {shift.urgency === 'instant' && (
              <Badge variant="danger" size="sm">Urgent</Badge>
            )}
          </div>
          <p className="text-sm text-neutral-500">{shift.employerName}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {shift.location.address}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {shift.startTime} - {shift.endTime}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-brand-primary">₪{shift.hourlyRate}/hr</p>
          <p className="text-xs text-neutral-500 mt-1">
            {spotsLeft} {t('shift.spotsLeft', language)}
          </p>
        </div>
      </div>
    </Card>
  )
}

function WorkerResultCard({ worker, language, onClick }: { worker: WorkerProfile; language: Language; onClick?: () => void }) {
  return (
    <Card interactive onClick={onClick}>
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar
            size="lg"
            name={worker.name}
            src={worker.photoUrl}
          />
          {worker.availabilityStatus === 'available' && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-neutral-900">{worker.name}</h3>
            {worker.isVerified && (
              <Shield className="w-4 h-4 text-success" />
            )}
            {worker.isPro && (
              <Badge variant="accent" size="sm">PRO</Badge>
            )}
          </div>
          <p className="text-sm text-neutral-500">{worker.specialization}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-brand-accent" />
              <span className="font-medium">{worker.rating.toFixed(1)}</span>
              <span className="text-neutral-400">({worker.reviewCount})</span>
            </span>
            <span className="text-sm text-neutral-500">
              {worker.completedShifts} shifts
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {worker.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="neutral" size="sm">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-brand-primary">₪{worker.hourlyRate}/hr</p>
          {worker.city && (
            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {worker.city}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
