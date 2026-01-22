'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import {
  Star,
  Clock,
  Phone,
  MessageCircle,
  Check,
  X,
  Shield,
  Car,
  Wrench,
  Users,
  Briefcase,
  TrendingUp
} from 'lucide-react'
import type { TaskFlow, WorkerProfile } from '@/types'

interface ApplicantCardProps {
  application: TaskFlow
  worker?: WorkerProfile
  onApprove?: () => void
  onReject?: () => void
  onContact?: () => void
  onViewProfile?: () => void
  className?: string
}

export function ApplicantCard({
  application,
  worker,
  onApprove,
  onReject,
  onContact,
  onViewProfile,
  className
}: ApplicantCardProps) {
  const { language, isRTL } = useUI()

  // Use worker from application or passed prop
  const workerData = worker || application.worker

  // Calculate match score (mock)
  const matchScore = calculateMatchScore(application)

  return (
    <Card
      interactive
      onClick={onViewProfile}
      className={cn('overflow-hidden', className)}
    >
      {/* Match indicator */}
      {matchScore >= 80 && (
        <div className="bg-success/10 px-4 py-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="text-sm font-medium text-success">
            {matchScore}% match
          </span>
        </div>
      )}

      <div className="p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar
            size="lg"
            name={workerData?.name || 'Worker'}
            src={workerData?.photoUrl}
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-900 truncate">
                {workerData?.name || 'Anonymous'}
              </h3>
              {workerData?.isVerified && (
                <Shield className="w-4 h-4 text-success flex-shrink-0" />
              )}
              {workerData?.isPro && (
                <Badge variant="accent" size="sm">PRO</Badge>
              )}
            </div>

            {/* Rating and stats */}
            <div className="flex items-center gap-3 mt-1 text-sm">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-brand-accent" />
                <span className="font-medium">{workerData?.rating || 5.0}</span>
                <span className="text-neutral-400">
                  ({workerData?.reviewCount || 0})
                </span>
              </span>
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-600">
                {workerData?.completedShifts || 0} shifts
              </span>
            </div>

            {/* Response time */}
            <div className="flex items-center gap-1 mt-1 text-sm text-neutral-500">
              <Clock className="w-3 h-3" />
              <span>
                {t('worker.response.time', language as any)} {workerData?.responseTime || 5} {t('worker.minutes', language as any)}
              </span>
            </div>
          </div>
        </div>

        {/* Skills/attributes */}
        <div className="flex flex-wrap gap-2 mt-3">
          {workerData?.hasCar && (
            <Badge variant="neutral" size="sm">
              <Car className="w-3 h-3 mr-1" />
              {t('worker.has.car', language as any)}
            </Badge>
          )}
          {workerData?.hasTools && (
            <Badge variant="neutral" size="sm">
              <Wrench className="w-3 h-3 mr-1" />
              {t('worker.has.tools', language as any)}
            </Badge>
          )}
          {workerData?.teamSize && workerData.teamSize > 0 && (
            <Badge variant="neutral" size="sm">
              <Users className="w-3 h-3 mr-1" />
              +{workerData.teamSize} {t('worker.people', language as any)}
            </Badge>
          )}
          {workerData?.experience && workerData.experience > 0 && (
            <Badge variant="neutral" size="sm">
              <Briefcase className="w-3 h-3 mr-1" />
              {workerData.experience}y exp
            </Badge>
          )}
        </div>

        {/* Rate */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
          <div>
            <span className="text-lg font-bold text-brand-accent">
              ₪{application.agreedRate || workerData?.hourlyRate || 50}
            </span>
            <span className="text-sm text-neutral-500">
              {t('shift.per.hour', language as any)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation()
                onContact?.()
              }}
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation()
                onContact?.()
              }}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>

            {application.status === 'applied' && (
              <>
                <Button
                  variant="danger"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onReject?.()
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onApprove?.()
                  }}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

function calculateMatchScore(application: TaskFlow): number {
  // Mock calculation
  let score = 70
  const worker = application.worker

  if (worker?.isVerified) score += 10
  if (worker?.rating && worker.rating >= 4.5) score += 10
  if (worker?.reliabilityScore && worker.reliabilityScore >= 90) score += 10

  return Math.min(score, 98)
}

export default ApplicantCard
