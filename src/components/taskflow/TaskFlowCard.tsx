'use client'

import { cn, formatMoney, formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Calendar, ChevronRight } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { TaskFlowProgressBar } from './TaskFlowProgressBar'
import type { TaskFlowStatus } from '@/types'

// ============================================
// TASK FLOW CARD PROPS
// ============================================

export interface TaskFlowCardData {
  id: string
  shiftTitle: string
  counterpartyName: string
  status: TaskFlowStatus
  date: Date | string
  amount?: number
}

export interface TaskFlowCardProps {
  taskflow: TaskFlowCardData
  onClick?: () => void
  className?: string
}

// ============================================
// TASK FLOW CARD COMPONENT
// ============================================

export function TaskFlowCard({ taskflow, onClick, className }: TaskFlowCardProps) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl p-4 shadow-card cursor-pointer',
        'transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 truncate">
            {taskflow.shiftTitle}
          </h3>
          <p className="text-sm text-neutral-500 mt-0.5 truncate">
            {taskflow.counterpartyName}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={taskflow.status} size="sm" />
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="mt-3">
        <TaskFlowProgressBar currentStatus={taskflow.status} />
      </div>

      {/* Footer: date & amount */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
        <span className="flex items-center gap-1 text-xs text-neutral-500">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(taskflow.date)}
        </span>

        {taskflow.amount !== undefined && (
          <span className="text-sm font-bold text-success">
            {formatMoney(taskflow.amount)}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default TaskFlowCard
