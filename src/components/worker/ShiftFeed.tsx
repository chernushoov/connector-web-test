'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useWorker, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { InfiniteList } from '@/components/shared'
import { ShiftCard, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  MapPin,
  Clock,
  Users,
  Star,
  Zap,
  Shield,
  Car,
  Wrench,
  DollarSign,
  ChevronRight,
  TrendingUp
} from 'lucide-react'
import { mockShifts } from '@/data/mockData'
import type { ShiftPosting } from '@/types'

interface ShiftFeedProps {
  onShiftClick?: (shift: ShiftPosting) => void
  className?: string
}

export function ShiftFeed({ onShiftClick, className }: ShiftFeedProps) {
  const { language, isRTL } = useUI()
  const { shifts, isLoadingShifts, filters } = useWorker()
  const { loadShifts, applyToShift } = useConnectorStore()

  const [displayShifts, setDisplayShifts] = useState<ShiftPosting[]>(mockShifts)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadShifts()
  }, [])

  // Use mock data if no shifts from store
  useEffect(() => {
    if (shifts.length > 0) {
      setDisplayShifts(shifts)
    }
  }, [shifts])

  const handleApply = async (shiftId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await applyToShift(shiftId)
  }

  return (
    <div className={cn('w-full', className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <InfiniteList
        items={displayShifts}
        renderItem={(shift) => (
          <ShiftFeedItem
            shift={shift}
            language={language}
            isRTL={isRTL}
            onClick={() => onShiftClick?.(shift)}
            onApply={(e) => handleApply(shift.id, e)}
          />
        )}
        keyExtractor={(shift) => shift.id}
        isLoading={isLoadingShifts}
        hasMore={false}
        emptyType="no-shifts"
        gap={4}
      />
    </div>
  )
}

interface ShiftFeedItemProps {
  shift: ShiftPosting
  language: string
  isRTL: boolean
  onClick: () => void
  onApply: (e: React.MouseEvent) => void
}

function ShiftFeedItem({ shift, language, isRTL, onClick, onApply }: ShiftFeedItemProps) {
  const slotsLeft = shift.slots - shift.filled
  const isUrgent = shift.urgency === 'instant' || slotsLeft <= 2
  const matchPercent = calculateMatchPercent(shift)

  return (
    <ShiftCard
      isUrgent={isUrgent}
      isInstant={shift.isInstant}
      slotsTotal={shift.slots}
      slotsFilled={shift.filled}
      applicants={shift.applicants}
      viewCount={shift.viewCount}
      onClick={onClick}
      className="relative"
    >
      {/* Match indicator */}
      {matchPercent >= 70 && (
        <div className="absolute top-3 right-3">
          <SmartMatchBadge percent={matchPercent} />
        </div>
      )}

      <CardHeader
        title={shift.title}
        subtitle={shift.employer.company}
      >
        <div className="flex items-center gap-2 mt-1">
          {shift.employer.isVerified && (
            <Badge variant="success" size="sm">
              <Shield className="w-3 h-3 mr-1" />
              {t('shift.verified.employer', language as any)}
            </Badge>
          )}
          {shift.hasEscrow && (
            <Badge variant="accent" size="sm">
              {t('shift.escrow', language as any)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-neutral-600">
            <MapPin className="w-4 h-4 text-neutral-400" />
            <span>{shift.location.address}</span>
            {shift.location.distance && (
              <span className="text-neutral-400">({shift.location.distance} km)</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span>{shift.startTime} - {shift.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <Users className="w-4 h-4 text-neutral-400" />
            <span>
              {slotsLeft} {t('shift.slots.left', language as any)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <Star className="w-4 h-4 text-brand-accent" />
            <span>{shift.employer.rating} ({shift.employer.reviewCount})</span>
          </div>
        </div>

        {/* Requirements */}
        {(shift.requirements.needsCar || shift.requirements.needsTools || shift.acceptsTeams) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {shift.requirements.needsCar && (
              <Badge variant="neutral" size="sm">
                <Car className="w-3 h-3 mr-1" />
                {t('worker.has.car', language as any)}
              </Badge>
            )}
            {shift.requirements.needsTools && (
              <Badge variant="neutral" size="sm">
                <Wrench className="w-3 h-3 mr-1" />
                {t('worker.has.tools', language as any)}
              </Badge>
            )}
            {shift.acceptsTeams && (
              <Badge variant="neutral" size="sm">
                <Users className="w-3 h-3 mr-1" />
                {t('shift.team', language as any)}
              </Badge>
            )}
          </div>
        )}

        {/* Footer with rate and apply button */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-brand-accent">
                ₪{Math.round(shift.baseRate * shift.surgeMultiplier)}
              </span>
              <span className="text-sm text-neutral-500">
                {t('shift.per.hour', language as any)}
              </span>
            </div>
            {shift.surgeMultiplier > 1 && (
              <div className="flex items-center gap-1 text-xs text-success">
                <TrendingUp className="w-3 h-3" />
                <span>+{Math.round((shift.surgeMultiplier - 1) * 100)}% surge</span>
              </div>
            )}
            <p className="text-sm text-neutral-500 mt-0.5">
              {t('shift.total', language as any)}: ₪{shift.totalEstimate}
            </p>
          </div>

          <Button
            variant={isUrgent ? 'accent' : 'primary'}
            size="md"
            onClick={onApply}
            isUrgent={isUrgent}
            rightIcon={isUrgent ? <Zap className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          >
            {isUrgent
              ? t('shift.quick.apply', language as any)
              : t('shift.apply', language as any)
            }
          </Button>
        </div>
      </CardContent>
    </ShiftCard>
  )
}

function SmartMatchBadge({ percent }: { percent: number }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-full',
        'text-xs font-bold',
        percent >= 90
          ? 'bg-success text-white'
          : percent >= 80
            ? 'bg-brand-primary text-white'
            : 'bg-brand-accent text-neutral-900'
      )}
    >
      <TrendingUp className="w-3 h-3" />
      {percent}% match
    </motion.div>
  )
}

function calculateMatchPercent(shift: ShiftPosting): number {
  // Simple mock calculation - in real app this would use worker profile
  let score = 60

  if (!shift.requirements.needsCar) score += 10
  if (!shift.requirements.needsTools) score += 10
  if (shift.requirements.minExperience <= 1) score += 10
  if (shift.requirements.minRating <= 4) score += 10

  return Math.min(score, 98)
}

export default ShiftFeed
