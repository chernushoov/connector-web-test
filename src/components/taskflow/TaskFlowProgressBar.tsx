'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Check, X, AlertTriangle } from 'lucide-react'
import type { TaskFlowStatus } from '@/types'

// ============================================
// PROGRESS STEPS CONFIG
// ============================================

const MAIN_STEPS: { status: TaskFlowStatus; label: string; shortLabel: string }[] = [
  { status: 'applied', label: 'Applied', shortLabel: 'APP' },
  { status: 'reviewing', label: 'Reviewing', shortLabel: 'REV' },
  { status: 'approved', label: 'Approved', shortLabel: 'APR' },
  { status: 'upcoming', label: 'Upcoming', shortLabel: 'UPC' },
  { status: 'in_progress', label: 'In Progress', shortLabel: 'WRK' },
  { status: 'completed', label: 'Completed', shortLabel: 'DON' },
  { status: 'awaiting_review', label: 'Awaiting Review', shortLabel: 'AWR' },
  { status: 'reviewed', label: 'Reviewed', shortLabel: 'RVD' },
  { status: 'payment_pending', label: 'Payment Pending', shortLabel: 'PAY' },
  { status: 'paid', label: 'Paid', shortLabel: 'PD' },
]

const BRANCH_STATUSES: TaskFlowStatus[] = ['rejected', 'cancelled', 'disputed']

// ============================================
// PROGRESS BAR PROPS
// ============================================

export interface TaskFlowProgressBarProps {
  currentStatus: TaskFlowStatus
  className?: string
}

// ============================================
// PROGRESS BAR COMPONENT
// ============================================

export function TaskFlowProgressBar({
  currentStatus,
  className,
}: TaskFlowProgressBarProps) {
  const isBranch = BRANCH_STATUSES.includes(currentStatus)
  const currentMainIndex = MAIN_STEPS.findIndex((s) => s.status === currentStatus)

  // For branch statuses, find the last main step reached before the branch
  const getBranchIndex = () => {
    if (currentStatus === 'rejected') return 1 // After reviewing
    if (currentStatus === 'cancelled') return currentMainIndex >= 0 ? currentMainIndex : 3
    if (currentStatus === 'disputed') return 5 // After completed
    return -1
  }

  const branchIndex = isBranch ? getBranchIndex() : -1
  const activeIndex = isBranch ? branchIndex : currentMainIndex

  return (
    <div className={cn('w-full', className)}>
      {/* Main progress track */}
      <div className="relative flex items-center">
        {MAIN_STEPS.map((step, index) => {
          const isPast = index < activeIndex
          const isCurrent = index === activeIndex && !isBranch
          const isFuture = index > activeIndex
          const isLast = index === MAIN_STEPS.length - 1

          return (
            <div key={step.status} className="flex items-center flex-1 last:flex-none">
              {/* Step circle */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                className={cn(
                  'relative flex items-center justify-center flex-shrink-0',
                  'w-6 h-6 rounded-full border-2 transition-all duration-300',
                  isPast && 'bg-success border-success',
                  isCurrent && 'bg-brand-primary border-brand-primary ring-4 ring-brand-primary/20',
                  isFuture && 'bg-white border-neutral-200',
                  isBranch && index === activeIndex && 'bg-white border-neutral-300'
                )}
              >
                {isPast && <Check className="w-3 h-3 text-white" />}
                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </motion.div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-0.5">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      index < activeIndex ? 'bg-success' : 'bg-neutral-200'
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Step labels (show only a few key ones) */}
      <div className="relative flex items-start mt-1">
        {MAIN_STEPS.map((step, index) => {
          const isPast = index < activeIndex
          const isCurrent = index === activeIndex && !isBranch
          const isLast = index === MAIN_STEPS.length - 1

          // Only show labels for first, current, and last
          const showLabel = index === 0 || isCurrent || isPast || isLast

          return (
            <div
              key={step.status}
              className={cn('flex-1 last:flex-none', !isLast && 'pr-1')}
            >
              {showLabel && (
                <p
                  className={cn(
                    'text-[9px] leading-tight text-center truncate',
                    isCurrent ? 'text-brand-primary font-semibold' : 'text-neutral-400'
                  )}
                >
                  {step.shortLabel}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Branch indicator (rejected/cancelled/disputed) */}
      {isBranch && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 mt-2"
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-danger">
            {currentStatus === 'disputed' ? (
              <AlertTriangle className="w-3 h-3 text-white" />
            ) : (
              <X className="w-3 h-3 text-white" />
            )}
          </div>
          <span className="text-xs text-danger font-semibold capitalize">
            {currentStatus.replace('_', ' ')}
          </span>
        </motion.div>
      )}
    </div>
  )
}

export default TaskFlowProgressBar
