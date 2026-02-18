'use client'

import { cn } from '@/lib/utils'
import type { TaskFlowStatus } from '@/types'

// ============================================
// STATUS CONFIG
// ============================================

const STATUS_CONFIG: Record<
  TaskFlowStatus,
  { label: string; color: string; bgColor: string }
> = {
  applied: {
    label: 'Applied',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  reviewing: {
    label: 'Reviewing',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  approved: {
    label: 'Approved',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
  },
  upcoming: {
    label: 'Upcoming',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
  },
  awaiting_review: {
    label: 'Awaiting Review',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  reviewed: {
    label: 'Reviewed',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
  },
  payment_pending: {
    label: 'Payment Pending',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
  paid: {
    label: 'Paid',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
  disputed: {
    label: 'Disputed',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
  },
}

// ============================================
// STATUS BADGE PROPS
// ============================================

export interface StatusBadgeProps {
  status: TaskFlowStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// ============================================
// STATUS BADGE COMPONENT
// ============================================

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        config.color,
        config.bgColor,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  )
}

export default StatusBadge
