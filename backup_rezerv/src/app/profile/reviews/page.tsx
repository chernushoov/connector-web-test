'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, LoadingState } from '@/components/shared'
import { ReviewList, RatingOverview } from '@/components/profile'
import type { Review } from '@/types'

// Mock reviews
const mockReviews: Review[] = [
  {
    id: '1',
    authorId: 'emp1',
    authorName: 'FastLogistics Ltd',
    targetId: 'user1',
    targetType: 'worker',
    rating: 5,
    comment: 'Excellent worker! Very reliable and hardworking. Would definitely hire again.',
    shiftId: 'shift1',
    shiftTitle: 'Warehouse Helper',
    isFromEmployer: true,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: '2',
    authorId: 'emp2',
    authorName: 'QuickMove',
    targetId: 'user1',
    targetType: 'worker',
    rating: 5,
    comment: 'Great job on the moving project. Very efficient and careful with the items.',
    shiftId: 'shift2',
    shiftTitle: 'Moving Assistant',
    isFromEmployer: true,
    createdAt: new Date(Date.now() - 259200000),
  },
  {
    id: '3',
    authorId: 'emp3',
    authorName: 'Marina Events',
    targetId: 'user1',
    targetType: 'worker',
    rating: 4,
    comment: 'Good work setting up the event. Arrived on time and followed instructions well.',
    shiftId: 'shift3',
    shiftTitle: 'Event Setup Crew',
    isFromEmployer: true,
    createdAt: new Date(Date.now() - 604800000),
  },
  {
    id: '4',
    authorId: 'emp4',
    authorName: 'TechStore',
    targetId: 'user1',
    targetType: 'worker',
    rating: 5,
    comment: 'Professional attitude, fast learner. Helped with inventory management.',
    shiftId: 'shift4',
    shiftTitle: 'Retail Assistant',
    isFromEmployer: true,
    createdAt: new Date(Date.now() - 1209600000),
  },
  {
    id: '5',
    authorId: 'emp5',
    authorName: 'CleanPro Services',
    targetId: 'user1',
    targetType: 'worker',
    rating: 5,
    comment: 'Thorough cleaning, attention to detail. Very satisfied.',
    shiftId: 'shift5',
    shiftTitle: 'Cleaning Staff',
    isFromEmployer: true,
    createdAt: new Date(Date.now() - 2592000000),
  },
]

export default function ReviewsPage() {
  const { language, isRTL } = useUI()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all')

  useEffect(() => {
    const load = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setReviews(mockReviews)
      setIsLoading(false)
    }
    load()
  }, [])

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter(r => r.rating === parseInt(filter))

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const distribution = reviews.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  const distributionPercent = Object.fromEntries(
    Object.entries(distribution).map(([k, v]) => [k, Math.round((v / reviews.length) * 100)])
  )

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        title={t('profile.reviews', language as any)}
        showBack
      />

      <main className="px-4 py-4 space-y-6">
        {isLoading ? (
          <LoadingState variant="skeleton" />
        ) : (
          <>
            {/* Rating overview */}
            <RatingOverview
              rating={averageRating}
              reviewCount={reviews.length}
              distribution={distributionPercent}
            />

            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['all', '5', '4', '3', '2', '1'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium',
                    'whitespace-nowrap transition-all duration-200',
                    filter === f
                      ? 'bg-brand-primary text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-100'
                  )}
                >
                  {f === 'all' ? 'All' : `${f} stars`}
                </button>
              ))}
            </div>

            {/* Reviews list */}
            <ReviewList reviews={filteredReviews} />
          </>
        )}
      </main>

      <Navigation />
    </div>
  )
}
