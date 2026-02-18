'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ShiftCard, type ShiftCardData } from './ShiftCard'
import type { MatchCriteria } from '@/types'

// ============================================
// SMART MATCH CARD PROPS
// ============================================

export interface SmartMatchCardProps {
  shift: ShiftCardData
  matchPercent: number
  matchDetails: MatchCriteria[]
  onClick?: () => void
  className?: string
}

// ============================================
// MATCH PERCENT BADGE COLOR
// ============================================

function getMatchColor(percent: number) {
  if (percent >= 80) return { bg: 'bg-success', text: 'text-white' }
  if (percent >= 60) return { bg: 'bg-amber-500', text: 'text-white' }
  return { bg: 'bg-neutral-400', text: 'text-white' }
}

// ============================================
// SMART MATCH CARD COMPONENT
// ============================================

export function SmartMatchCard({
  shift,
  matchPercent,
  matchDetails,
  onClick,
  className,
}: SmartMatchCardProps) {
  const [expanded, setExpanded] = useState(false)
  const colors = getMatchColor(matchPercent)

  return (
    <div className={cn('relative', className)}>
      {/* Match percentage badge */}
      <div
        className={cn(
          'absolute top-3 right-3 z-10 flex items-center justify-center',
          'w-12 h-12 rounded-full font-bold text-sm shadow-lg',
          colors.bg,
          colors.text
        )}
      >
        {matchPercent}%
      </div>

      {/* Shift card */}
      <ShiftCard shift={shift} onClick={onClick} />

      {/* Expandable match details */}
      <div className="bg-white rounded-b-2xl -mt-2 px-4 pb-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
          className="flex items-center gap-1 w-full py-2 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Hide match details
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              View match details
            </>
          )}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pb-3">
                {matchDetails.map((criteria) => (
                  <div key={criteria.id} className="flex items-center gap-2">
                    {/* Criteria name */}
                    <span className="text-xs text-neutral-600 w-24 flex-shrink-0 truncate">
                      {criteria.name}
                    </span>

                    {/* Score bar */}
                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${criteria.weight * 100}%` }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className={cn(
                          'h-full rounded-full',
                          criteria.matched ? 'bg-success' : 'bg-neutral-300'
                        )}
                      />
                    </div>

                    {/* Matched indicator */}
                    <span
                      className={cn(
                        'text-[10px] font-semibold w-6 text-center',
                        criteria.matched ? 'text-success' : 'text-neutral-400'
                      )}
                    >
                      {criteria.matched ? 'Yes' : 'No'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default SmartMatchCard
