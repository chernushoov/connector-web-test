'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  MapPin,
  Clock,
  Star,
  Briefcase,
  Car,
  Wrench,
  Users,
  Shield,
} from 'lucide-react'
import type { MatchCriteria } from '@/types'

// ============================================
// MATCH DETAIL VIEW PROPS
// ============================================

export interface MatchDetailViewProps {
  matchDetails: MatchCriteria[]
  className?: string
}

// ============================================
// CRITERIA ICON MAP
// ============================================

const CRITERIA_ICONS: Record<string, React.ReactNode> = {
  location: <MapPin className="w-4 h-4" />,
  schedule: <Clock className="w-4 h-4" />,
  rating: <Star className="w-4 h-4" />,
  experience: <Briefcase className="w-4 h-4" />,
  car: <Car className="w-4 h-4" />,
  tools: <Wrench className="w-4 h-4" />,
  team: <Users className="w-4 h-4" />,
  verification: <Shield className="w-4 h-4" />,
}

// ============================================
// MATCH DETAIL VIEW COMPONENT
// ============================================

export function MatchDetailView({ matchDetails, className }: MatchDetailViewProps) {
  const totalScore = matchDetails.reduce((sum, c) => {
    return sum + (c.matched ? c.weight * 100 : 0)
  }, 0)
  const maxScore = matchDetails.reduce((sum, c) => sum + c.weight * 100, 0)
  const overallPercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall score */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-50 border-4 border-neutral-200">
          <span
            className={cn(
              'text-2xl font-bold',
              overallPercent >= 80
                ? 'text-success'
                : overallPercent >= 60
                  ? 'text-amber-500'
                  : 'text-neutral-500'
            )}
          >
            {overallPercent}%
          </span>
        </div>
        <p className="text-sm text-neutral-500 mt-2">Match Score</p>
      </div>

      {/* Criteria list */}
      <div className="space-y-3">
        {matchDetails.map((criteria, index) => {
          const icon = CRITERIA_ICONS[criteria.icon] || (
            <Shield className="w-4 h-4" />
          )
          const scorePercent = criteria.matched
            ? Math.round(criteria.weight * 100)
            : 0

          return (
            <motion.div
              key={criteria.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  criteria.matched
                    ? 'bg-success/10 text-success'
                    : 'bg-neutral-100 text-neutral-400'
                )}
              >
                {icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-900 truncate">
                    {criteria.name}
                  </span>
                  <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">
                    Weight: {Math.round(criteria.weight * 100)}%
                  </span>
                </div>

                {/* Score bar */}
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scorePercent}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
                    className={cn(
                      'h-full rounded-full',
                      criteria.matched ? 'bg-success' : 'bg-neutral-300'
                    )}
                  />
                </div>

                {/* Detail text */}
                <p className="text-xs text-neutral-500 mt-0.5">{criteria.detail}</p>
              </div>

              {/* Matched/Unmatched visual */}
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                  criteria.matched
                    ? 'bg-success text-white'
                    : 'bg-neutral-200 text-neutral-400'
                )}
              >
                {criteria.matched ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default MatchDetailView
