'use client'

import { cn, formatDistance, formatMoney, formatRelativeTime } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { QuickTask, Language } from '@/types'
import { Avatar, Badge, InstantBadge } from '@/components/ui'
import { Button } from '@/components/ui/Button'

// ============================================
// TASK CARD PROPS
// ============================================

export interface TaskCardProps {
  task: QuickTask
  lang?: Language
  distance?: number
  onClick?: () => void
  onRespond?: () => void
  // Display options
  variant?: 'default' | 'compact' | 'featured'
  showCreator?: boolean
  // Psychology
  isHot?: boolean
  responseCount?: number
  className?: string
}

// ============================================
// TASK CARD COMPONENT
// ============================================

export function TaskCard({
  task,
  lang = 'ru',
  distance,
  onClick,
  onRespond,
  variant = 'default',
  showCreator = true,
  isHot = false,
  responseCount,
  className,
}: TaskCardProps) {
  const isUrgent = task.when === 'now'
  const isOpen = task.status === 'open'

  if (variant === 'compact') {
    return (
      <CompactTaskCard
        task={task}
        distance={distance}
        onClick={onClick}
        isUrgent={isUrgent}
        className={className}
      />
    )
  }

  if (variant === 'featured') {
    return (
      <FeaturedTaskCard
        task={task}
        distance={distance}
        onClick={onClick}
        onRespond={onRespond}
        isUrgent={isUrgent}
        className={className}
      />
    )
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl p-4 shadow-card cursor-pointer',
        'transition-all duration-200 hover:shadow-card-hover',
        isUrgent && 'ring-2 ring-danger ring-offset-2',
        !isOpen && 'opacity-60',
        className
      )}
    >
      {/* Urgency banner */}
      {isUrgent && (
        <div className="flex items-center gap-2 mb-3 -mt-1">
          <InstantBadge />
          <span className="text-xs text-danger font-medium animate-pulse">
            Needs help right now!
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 line-clamp-2">
            {task.title}
          </h3>

          {task.description && (
            <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-neutral-500">
            {/* When */}
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {task.when === 'now'
                ? 'Right now'
                : task.when === 'today'
                ? 'Today'
                : task.when === 'tomorrow'
                ? 'Tomorrow'
                : formatRelativeTime(task.when, lang)}
            </span>

            {/* Distance */}
            {distance && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {formatDistance(distance)}
              </span>
            )}

            {/* Duration */}
            {task.duration && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ~{task.duration}h
              </span>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-success">
            {formatMoney(task.amount)}
          </p>
          {task.isNegotiable && (
            <p className="text-xs text-neutral-500">negotiable</p>
          )}
        </div>
      </div>

      {/* Creator */}
      {showCreator && task.creator && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
          <Avatar
            src={task.creator.photoUrl}
            name={task.creator.name}
            size="sm"
            isVerified={task.creator.isVerified}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {task.creator.name}
            </p>
          </div>
          {task.creator.isVerified && (
            <Badge variant="success" size="sm">
              Verified
            </Badge>
          )}
        </div>
      )}

      {/* Psychology indicators */}
      {(isHot || (responseCount !== undefined && responseCount > 0)) && (
        <div className="flex items-center gap-2 mt-3 text-xs">
          {isHot && (
            <span className="text-danger font-semibold flex items-center gap-1">
              <span className="animate-pulse">🔥</span>
              Hot task
            </span>
          )}
          {responseCount !== undefined && responseCount > 0 && (
            <span className="text-neutral-500">
              {responseCount} people responded
            </span>
          )}
        </div>
      )}

      {/* Action */}
      {isOpen && onRespond && (
        <div className="mt-4">
          <Button
            variant={isUrgent ? 'danger' : 'primary'}
            fullWidth
            onClick={(e) => {
              e.stopPropagation()
              onRespond()
            }}
            isUrgent={isUrgent}
          >
            {isUrgent ? "I'm available!" : 'Respond'}
          </Button>
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// COMPACT TASK CARD
// ============================================

function CompactTaskCard({
  task,
  distance,
  onClick,
  isUrgent,
  className,
}: {
  task: QuickTask
  distance?: number
  onClick?: () => void
  isUrgent?: boolean
  className?: string
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer',
        'hover:bg-neutral-50 transition-colors',
        isUrgent && 'bg-danger-light',
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          isUrgent ? 'bg-danger' : 'bg-brand-accent'
        )}
      >
        <svg
          className={cn('w-5 h-5', isUrgent ? 'text-white' : 'text-neutral-900')}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-900 truncate">{task.title}</p>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>
            {task.when === 'now'
              ? 'Now'
              : task.when === 'today'
              ? 'Today'
              : 'Tomorrow'}
          </span>
          {distance && <span>{formatDistance(distance)}</span>}
        </div>
      </div>

      {/* Amount */}
      <p className="font-bold text-success">{formatMoney(task.amount)}</p>

      <svg
        className="w-5 h-5 text-neutral-400 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </motion.div>
  )
}

// ============================================
// FEATURED TASK CARD
// ============================================

function FeaturedTaskCard({
  task,
  distance,
  onClick,
  onRespond,
  isUrgent,
  className,
}: {
  task: QuickTask
  distance?: number
  onClick?: () => void
  onRespond?: () => void
  isUrgent?: boolean
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        'bg-gradient-to-br',
        isUrgent
          ? 'from-danger to-danger-dark text-white'
          : 'from-brand-accent to-brand-accent-dark text-neutral-900',
        'shadow-lg cursor-pointer',
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Badge */}
        {isUrgent && (
          <div className="inline-flex items-center gap-1 bg-white/20 text-white px-2 py-1 rounded-full text-xs font-bold mb-3">
            <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            URGENT
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold">{task.title}</h3>

        {/* Amount - big and bold */}
        <p className="text-3xl font-bold mt-2">
          {formatMoney(task.amount)}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-3 text-sm opacity-90">
          <span>
            {task.when === 'now' ? 'Right now' : task.when === 'today' ? 'Today' : 'Tomorrow'}
          </span>
          {distance && <span>{formatDistance(distance)}</span>}
        </div>

        {/* CTA */}
        {onRespond && (
          <Button
            variant={isUrgent ? 'outline-white' : 'primary'}
            fullWidth
            className="mt-4"
            onClick={(e) => {
              e.stopPropagation()
              onRespond()
            }}
          >
            Grab this task
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// ============================================
// TASK LIST
// ============================================

export interface TaskListProps {
  tasks: QuickTask[]
  title?: string
  emptyMessage?: string
  variant?: 'default' | 'compact'
  onTaskClick?: (task: QuickTask) => void
  onRespond?: (task: QuickTask) => void
  className?: string
}

export function TaskList({
  tasks,
  title,
  emptyMessage = 'No tasks found nearby',
  variant = 'default',
  onTaskClick,
  onRespond,
  className,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <svg
          className="w-12 h-12 text-neutral-300 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-neutral-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {title && (
        <h2 className="text-lg font-semibold text-neutral-900 mb-3">{title}</h2>
      )}
      <div className={cn('flex flex-col', variant === 'default' ? 'gap-3' : 'gap-1')}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            variant={variant}
            onClick={() => onTaskClick?.(task)}
            onRespond={() => onRespond?.(task)}
          />
        ))}
      </div>
    </div>
  )
}
