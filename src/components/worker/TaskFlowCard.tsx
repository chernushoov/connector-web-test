'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  Star,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react'
import type { TaskFlow, TaskFlowStatus } from '@/types'

interface TaskFlowCardProps {
  task: TaskFlow
  onAction?: (action: string) => void
  className?: string
}

const statusConfig: Record<TaskFlowStatus, {
  color: string
  bgColor: string
  icon: React.ReactNode
  labelKey: string
}> = {
  applied: {
    color: 'text-brand-primary',
    bgColor: 'bg-brand-primary/10',
    icon: <Clock className="w-4 h-4" />,
    labelKey: 'Applied'
  },
  reviewing: {
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    icon: <AlertCircle className="w-4 h-4" />,
    labelKey: 'Under review'
  },
  approved: {
    color: 'text-success',
    bgColor: 'bg-success/10',
    icon: <CheckCircle2 className="w-4 h-4" />,
    labelKey: 'Approved'
  },
  rejected: {
    color: 'text-danger',
    bgColor: 'bg-danger/10',
    icon: <XCircle className="w-4 h-4" />,
    labelKey: 'Rejected'
  },
  upcoming: {
    color: 'text-brand-primary',
    bgColor: 'bg-brand-primary/10',
    icon: <Clock className="w-4 h-4" />,
    labelKey: 'Upcoming'
  },
  in_progress: {
    color: 'text-success',
    bgColor: 'bg-success/10',
    icon: <Play className="w-4 h-4" />,
    labelKey: 'In progress'
  },
  completed: {
    color: 'text-success',
    bgColor: 'bg-success/10',
    icon: <CheckCircle2 className="w-4 h-4" />,
    labelKey: 'Completed'
  },
  awaiting_review: {
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    icon: <Star className="w-4 h-4" />,
    labelKey: 'Awaiting review'
  },
  reviewed: {
    color: 'text-brand-primary',
    bgColor: 'bg-brand-primary/10',
    icon: <Star className="w-4 h-4" />,
    labelKey: 'Reviewed'
  },
  payment_pending: {
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    icon: <DollarSign className="w-4 h-4" />,
    labelKey: 'Payment pending'
  },
  paid: {
    color: 'text-success',
    bgColor: 'bg-success/10',
    icon: <DollarSign className="w-4 h-4" />,
    labelKey: 'Paid'
  },
  cancelled: {
    color: 'text-neutral-500',
    bgColor: 'bg-neutral-100',
    icon: <XCircle className="w-4 h-4" />,
    labelKey: 'Cancelled'
  },
  disputed: {
    color: 'text-danger',
    bgColor: 'bg-danger/10',
    icon: <AlertCircle className="w-4 h-4" />,
    labelKey: 'Disputed'
  },
}

export function TaskFlowCard({ task, onAction, className }: TaskFlowCardProps) {
  const { language, isRTL } = useUI()
  const config = statusConfig[task.status]

  const getActionButton = () => {
    switch (task.status) {
      case 'approved':
      case 'upcoming':
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAction?.('start')}
            rightIcon={<Play className="w-4 h-4" />}
          >
            Start shift
          </Button>
        )
      case 'in_progress':
        return (
          <Button
            variant="success"
            size="sm"
            onClick={() => onAction?.('complete')}
            rightIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Complete
          </Button>
        )
      case 'completed':
      case 'awaiting_review':
        return (
          <Button
            variant="accent"
            size="sm"
            onClick={() => onAction?.('review')}
            rightIcon={<Star className="w-4 h-4" />}
          >
            Leave review
          </Button>
        )
      case 'applied':
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAction?.('cancel')}
          >
            Cancel
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <Card
      interactive
      className={cn('overflow-hidden', className)}
      onClick={() => onAction?.('view')}
    >
      {/* Status bar */}
      <div className={cn('flex items-center gap-2 px-4 py-2', config.bgColor)}>
        <span className={config.color}>{config.icon}</span>
        <span className={cn('text-sm font-medium', config.color)}>
          {config.labelKey}
        </span>
        {task.status === 'in_progress' && (
          <motion.span
            className="ml-auto text-sm text-success font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <LiveTimer startTime={task.startedAt} />
          </motion.span>
        )}
      </div>

      {/* Content */}
      <div className="p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <h3 className="font-semibold text-neutral-900">{task.shift.title}</h3>
        <p className="text-sm text-neutral-500 mt-0.5">{task.shift.employer.company}</p>

        {/* Details */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-neutral-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-neutral-400" />
            <span>{task.shift.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span>{task.shift.startTime} - {task.shift.endTime}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
          <div>
            <span className="text-xl font-bold text-brand-accent">
              ₪{task.agreedRate}
            </span>
            <span className="text-sm text-neutral-500">/hr</span>
            {task.totalAmount && (
              <p className="text-sm text-neutral-500">
                Total: ₪{task.totalAmount}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Contact buttons for active tasks */}
            {['approved', 'upcoming', 'in_progress'].includes(task.status) && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(`tel:${task.shift.employer.phone}`)
                  }}
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAction?.('message')
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </>
            )}
            {getActionButton()}
          </div>
        </div>
      </div>
    </Card>
  )
}

// Live timer component
function LiveTimer({ startTime }: { startTime?: Date }) {
  const [elapsed, setElapsed] = useState('00:00:00')

  useEffect(() => {
    if (!startTime) return

    const updateTimer = () => {
      const start = new Date(startTime).getTime()
      const now = Date.now()
      const diff = Math.floor((now - start) / 1000)

      const hours = Math.floor(diff / 3600).toString().padStart(2, '0')
      const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0')
      const seconds = (diff % 60).toString().padStart(2, '0')

      setElapsed(`${hours}:${minutes}:${seconds}`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return <>{elapsed}</>
}

// Need to import these for LiveTimer
import { useState, useEffect } from 'react'

export default TaskFlowCard
