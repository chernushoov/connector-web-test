'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import {
  MapPin,
  Clock,
  Calendar,
  Users,
  Star,
  Shield,
  Car,
  Wrench,
  Phone,
  MessageCircle,
  ChevronRight,
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Building2
} from 'lucide-react'
import type { ShiftPosting, MatchCriteria } from '@/types'

interface ShiftDetailProps {
  shift: ShiftPosting
  onApply?: () => void
  onClose?: () => void
  className?: string
}

export function ShiftDetail({ shift, onApply, onClose, className }: ShiftDetailProps) {
  const { language, isRTL } = useUI()
  const { applyToShift, showToast } = useConnectorStore()

  const [isApplying, setIsApplying] = useState(false)
  const [showApplySheet, setShowApplySheet] = useState(false)
  const [applyMessage, setApplyMessage] = useState('')

  const slotsLeft = shift.slots - shift.filled
  const isUrgent = shift.urgency === 'instant' || slotsLeft <= 2
  const matchResult = calculateMatch(shift)

  const handleApply = async () => {
    setIsApplying(true)
    try {
      await applyToShift(shift.id, applyMessage)
      setShowApplySheet(false)
      onApply?.()
    } catch (error) {
      showToast('Failed to apply', 'error')
    } finally {
      setIsApplying(false)
    }
  }

  const handleQuickApply = async () => {
    setIsApplying(true)
    try {
      await applyToShift(shift.id)
      onApply?.()
    } catch (error) {
      showToast('Failed to apply', 'error')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className={cn('bg-white', className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero section with gradient */}
      <div className="relative bg-gradient-brand p-6 pb-12 text-white">
        {isUrgent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 flex items-center gap-1 bg-danger px-3 py-1 rounded-full text-sm font-bold"
          >
            <Zap className="w-4 h-4" />
            {t('shift.instant', language as any)}
          </motion.div>
        )}

        <h1 className="text-2xl font-bold mb-2">{shift.title}</h1>

        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 opacity-80" />
          <span className="font-medium">{shift.employer.company}</span>
          {shift.employer.isVerified && (
            <Shield className="w-4 h-4 text-success" />
          )}
        </div>

        {/* Match indicator */}
        {matchResult.percent >= 70 && (
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <TrendingUp className="w-4 h-4" />
            <span className="font-semibold">{matchResult.percent}% match</span>
          </div>
        )}
      </div>

      {/* Quick stats cards */}
      <div className="px-4 -mt-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center py-3">
            <p className="text-2xl font-bold text-brand-accent">
              ₪{Math.round(shift.baseRate * shift.surgeMultiplier)}
            </p>
            <p className="text-xs text-neutral-500">{t('shift.per.hour', language as any)}</p>
          </Card>
          <Card className="text-center py-3">
            <p className="text-2xl font-bold text-neutral-900">
              {shift.startTime.split(':')[0]}h
            </p>
            <p className="text-xs text-neutral-500">Duration</p>
          </Card>
          <Card className="text-center py-3">
            <p className="text-2xl font-bold text-brand-primary">
              ₪{shift.totalEstimate}
            </p>
            <p className="text-xs text-neutral-500">{t('shift.total', language as any)}</p>
          </Card>
        </div>
      </div>

      {/* Content sections */}
      <div className="p-4 space-y-6">
        {/* Description */}
        {shift.description && (
          <section>
            <h3 className="font-semibold text-neutral-900 mb-2">Description</h3>
            <p className="text-neutral-600">{shift.description}</p>
          </section>
        )}

        {/* Details */}
        <section>
          <h3 className="font-semibold text-neutral-900 mb-3">Details</h3>
          <div className="space-y-3">
            <DetailRow
              icon={<MapPin className="w-5 h-5" />}
              label="Location"
              value={shift.location.address || shift.city}
              subvalue={shift.location.distance ? `${shift.location.distance} km away` : undefined}
            />
            <DetailRow
              icon={<Calendar className="w-5 h-5" />}
              label="Date"
              value={new Date(shift.date).toLocaleDateString(language, {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            />
            <DetailRow
              icon={<Clock className="w-5 h-5" />}
              label="Time"
              value={`${shift.startTime} - ${shift.endTime}`}
            />
            <DetailRow
              icon={<Users className="w-5 h-5" />}
              label="Spots"
              value={`${slotsLeft} of ${shift.slots} available`}
              urgent={slotsLeft <= 2}
            />
          </div>
        </section>

        {/* Requirements */}
        <section>
          <h3 className="font-semibold text-neutral-900 mb-3">
            {t('shift.requirements', language as any)}
          </h3>
          <div className="flex flex-wrap gap-2">
            {shift.requirements.needsCar && (
              <Badge variant="neutral" size="md">
                <Car className="w-4 h-4 mr-1" />
                {t('worker.has.car', language as any)}
              </Badge>
            )}
            {shift.requirements.needsTools && (
              <Badge variant="neutral" size="md">
                <Wrench className="w-4 h-4 mr-1" />
                {t('worker.has.tools', language as any)}
              </Badge>
            )}
            {shift.requirements.needsTeam > 0 && (
              <Badge variant="neutral" size="md">
                <Users className="w-4 h-4 mr-1" />
                Team of {shift.requirements.needsTeam}+
              </Badge>
            )}
            {shift.requirements.minExperience > 0 && (
              <Badge variant="neutral" size="md">
                {shift.requirements.minExperience}+ years exp.
              </Badge>
            )}
            {shift.requirements.minRating > 0 && (
              <Badge variant="neutral" size="md">
                <Star className="w-4 h-4 mr-1" />
                {shift.requirements.minRating}+ rating
              </Badge>
            )}
          </div>
        </section>

        {/* Match breakdown */}
        {matchResult.details.length > 0 && (
          <section>
            <h3 className="font-semibold text-neutral-900 mb-3">Match Breakdown</h3>
            <div className="space-y-2">
              {matchResult.details.map((criteria) => (
                <div
                  key={criteria.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-neutral-50"
                >
                  {criteria.matched ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-neutral-400" />
                  )}
                  <span className={cn(
                    'flex-1',
                    criteria.matched ? 'text-neutral-900' : 'text-neutral-500'
                  )}>
                    {criteria.name}
                  </span>
                  <span className="text-xs text-neutral-400">
                    +{criteria.weight}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Employer info */}
        <section>
          <h3 className="font-semibold text-neutral-900 mb-3">Employer</h3>
          <Card variant="outlined" className="flex items-center gap-4">
            <Avatar
              size="lg"
              name={shift.employer.name}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{shift.employer.name}</p>
                {shift.employer.isVerified && (
                  <Shield className="w-4 h-4 text-success" />
                )}
              </div>
              <p className="text-sm text-neutral-500">{shift.employer.company}</p>
              <div className="flex items-center gap-3 mt-1 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-brand-accent" />
                  {shift.employer.rating}
                </span>
                <span className="text-neutral-400">
                  {shift.employer.reviewCount} reviews
                </span>
                <span className="text-success">
                  ₪{(shift.employer.totalPaid / 1000).toFixed(0)}k paid
                </span>
              </div>
            </div>
          </Card>
        </section>

        {/* Psychology triggers */}
        {(shift.viewCount > 10 || shift.applicants > 0) && (
          <Card variant="accent" className="text-center py-4">
            <div className="flex items-center justify-center gap-6 text-sm">
              {shift.viewCount > 10 && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span>{shift.viewCount} viewing now</span>
                </div>
              )}
              {shift.applicants > 0 && (
                <div>
                  <span className="font-semibold">{shift.applicants}</span>
                  <span className="text-neutral-600 ml-1">
                    {t('urgency.people.applied', language as any)}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Fixed bottom CTA */}
      <div className="sticky bottom-0 p-4 bg-white border-t border-neutral-100 safe-area-pb">
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="lg"
            className="flex-shrink-0"
            onClick={() => window.open(`tel:${shift.employer.phone}`)}
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="flex-shrink-0"
            onClick={() => setShowApplySheet(true)}
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          <Button
            variant={isUrgent ? 'accent' : 'primary'}
            size="lg"
            fullWidth
            onClick={handleQuickApply}
            isLoading={isApplying}
            isUrgent={isUrgent}
            glow={isUrgent}
            rightIcon={!isApplying && (isUrgent ? <Zap className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)}
          >
            {isUrgent
              ? t('shift.quick.apply', language as any)
              : t('shift.apply', language as any)
            }
          </Button>
        </div>
      </div>

      {/* Apply with message bottom sheet */}
      <AnimatePresence>
        {showApplySheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setShowApplySheet(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 safe-area-pb"
            >
              <h3 className="text-lg font-semibold mb-4">Add a message</h3>
              <textarea
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                placeholder="Introduce yourself, mention relevant experience..."
                className="w-full h-32 p-4 bg-neutral-50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <div className="flex gap-3 mt-4">
                <Button
                  variant="ghost"
                  size="lg"
                  className="flex-1"
                  onClick={() => setShowApplySheet(false)}
                >
                  {t('common.cancel', language as any)}
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={handleApply}
                  isLoading={isApplying}
                >
                  {t('shift.apply', language as any)}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
  subvalue,
  urgent
}: {
  icon: React.ReactNode
  label: string
  value: string
  subvalue?: string
  urgent?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-neutral-400">{icon}</div>
      <div className="flex-1">
        <p className={cn(
          'font-medium',
          urgent ? 'text-danger' : 'text-neutral-900'
        )}>
          {value}
        </p>
        {subvalue && (
          <p className="text-sm text-neutral-500">{subvalue}</p>
        )}
      </div>
    </div>
  )
}

function calculateMatch(shift: ShiftPosting): { percent: number; details: MatchCriteria[] } {
  const details: MatchCriteria[] = [
    {
      id: 'location',
      name: 'Within your preferred distance',
      icon: 'map-pin',
      matched: (shift.location.distance || 0) <= 10,
      weight: 20,
      detail: `${shift.location.distance || 0} km`
    },
    {
      id: 'experience',
      name: 'Experience requirement met',
      icon: 'briefcase',
      matched: shift.requirements.minExperience <= 2,
      weight: 15,
      detail: `${shift.requirements.minExperience} years needed`
    },
    {
      id: 'rating',
      name: 'Rating requirement met',
      icon: 'star',
      matched: shift.requirements.minRating <= 4.0,
      weight: 15,
      detail: `${shift.requirements.minRating}+ required`
    },
    {
      id: 'car',
      name: 'Vehicle requirement',
      icon: 'car',
      matched: !shift.requirements.needsCar,
      weight: 10,
      detail: shift.requirements.needsCar ? 'Car required' : 'No car needed'
    },
    {
      id: 'tools',
      name: 'Tools requirement',
      icon: 'wrench',
      matched: !shift.requirements.needsTools,
      weight: 10,
      detail: shift.requirements.needsTools ? 'Tools required' : 'No tools needed'
    },
    {
      id: 'skills',
      name: 'Skills match',
      icon: 'check',
      matched: true,
      weight: 20,
      detail: 'Your skills match'
    },
  ]

  const percent = details
    .filter(d => d.matched)
    .reduce((sum, d) => sum + d.weight, 10)

  return { percent: Math.min(percent, 98), details }
}

export default ShiftDetail
