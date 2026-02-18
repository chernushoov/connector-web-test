'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useUI, useAuth } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, LoadingState } from '@/components/shared'
import { ReviewList, RatingOverview } from '@/components/profile'
import type { Review } from '@/types'

interface FreeReview {
  id: string
  rating: number
  text: string | null
  tags: string[]
  createdAt: string
  fromUser: {
    id: string
    name: string | null
    rating: number
  }
  task: {
    id: string
    title: string
    category: string
  }
}

export default function ReviewsPage() {
  const { language, isRTL } = useUI()
  const { userId } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all')
  const [distribution, setDistribution] = useState<Record<number, number>>({})

  useEffect(() => {
    const loadReviews = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/free/reviews/${userId}`, {
          headers: {
            'x-user-id': userId,
          },
        })

        if (res.ok) {
          const data = await res.json()

          // Transform API response to Review type
          const transformedReviews: Review[] = data.reviews.map((r: FreeReview) => ({
            id: r.id,
            authorId: r.fromUser.id,
            authorName: r.fromUser.name || 'User',
            targetId: userId,
            targetType: 'worker' as const,
            rating: r.rating,
            comment: r.text || '',
            shiftId: r.task.id,
            shiftTitle: r.task.title,
            isFromEmployer: true,
            createdAt: new Date(r.createdAt),
          }))

          setReviews(transformedReviews)
          setDistribution(data.distribution || {})
        }
      } catch (error) {
        console.error('Failed to load reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadReviews()
  }, [userId])

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter(r => r.rating === parseInt(filter))

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const distributionPercent = reviews.length > 0
    ? Object.fromEntries(
        Object.entries(distribution).map(([k, v]) => [k, Math.round((v / reviews.length) * 100)])
      )
    : {}

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        title={t('profile.reviews', language as 'ru' | 'he' | 'en')}
        showBack
      />

      <main className="px-4 py-4 space-y-6">
        {isLoading ? (
          <LoadingState variant="skeleton" />
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">No reviews yet</p>
            <p className="text-sm text-neutral-400 mt-1">
              Reviews will appear after completing tasks
            </p>
          </div>
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
                  onClick={() => setFilter(f as 'all' | '5' | '4' | '3' | '2' | '1')}
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
