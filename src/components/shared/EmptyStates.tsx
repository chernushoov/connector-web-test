'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import {
  Search,
  MapPin,
  Briefcase,
  Users,
  Calendar,
  Bell,
  MessageCircle,
  FileText,
  Star,
  Plus,
  RefreshCw,
  Settings,
  Wifi,
  WifiOff,
} from 'lucide-react'

type EmptyStateType =
  | 'no-shifts'
  | 'no-shifts-area'
  | 'no-applications'
  | 'no-workers'
  | 'no-tasks'
  | 'no-messages'
  | 'no-notifications'
  | 'no-reviews'
  | 'no-results'
  | 'no-documents'
  | 'offline'
  | 'error'

interface EmptyStateProps {
  type: EmptyStateType
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  className?: string
}

const emptyStateConfigs: Record<EmptyStateType, {
  icon: typeof Search
  defaultTitle: string
  defaultDescription: string
  defaultAction?: string
  iconBg: string
  iconColor: string
}> = {
  'no-shifts': {
    icon: Briefcase,
    defaultTitle: 'No shifts available',
    defaultDescription: 'There are no shifts matching your criteria right now. Try adjusting your filters or check back later.',
    defaultAction: 'Adjust filters',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
  },
  'no-shifts-area': {
    icon: MapPin,
    defaultTitle: 'No shifts in your area',
    defaultDescription: 'We don\'t have shifts in your location yet. Try expanding your search radius or selecting a different city.',
    defaultAction: 'Change location',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
  },
  'no-applications': {
    icon: FileText,
    defaultTitle: 'No applications yet',
    defaultDescription: 'Your shift hasn\'t received any applications yet. Make sure your offer is competitive and try sharing it.',
    defaultAction: 'Share shift',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-500',
  },
  'no-workers': {
    icon: Users,
    defaultTitle: 'No workers found',
    defaultDescription: 'No workers match your search criteria. Try adjusting filters or expanding your search area.',
    defaultAction: 'Clear filters',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-500',
  },
  'no-tasks': {
    icon: Calendar,
    defaultTitle: 'No tasks yet',
    defaultDescription: 'You don\'t have any tasks yet. Start applying to shifts to see them here.',
    defaultAction: 'Find shifts',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-500',
  },
  'no-messages': {
    icon: MessageCircle,
    defaultTitle: 'No messages',
    defaultDescription: 'You don\'t have any messages yet. Messages from employers and workers will appear here.',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-500',
  },
  'no-notifications': {
    icon: Bell,
    defaultTitle: 'All caught up!',
    defaultDescription: 'You don\'t have any notifications. We\'ll let you know when something important happens.',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
  },
  'no-reviews': {
    icon: Star,
    defaultTitle: 'No reviews yet',
    defaultDescription: 'Complete your first shift to start collecting reviews and build your reputation.',
    defaultAction: 'Find work',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-500',
  },
  'no-results': {
    icon: Search,
    defaultTitle: 'No results found',
    defaultDescription: 'We couldn\'t find anything matching your search. Try different keywords or filters.',
    defaultAction: 'Clear search',
    iconBg: 'bg-neutral-100',
    iconColor: 'text-neutral-500',
  },
  'no-documents': {
    icon: FileText,
    defaultTitle: 'No documents uploaded',
    defaultDescription: 'Upload your documents to get verified and unlock more opportunities.',
    defaultAction: 'Upload documents',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-500',
  },
  'offline': {
    icon: WifiOff,
    defaultTitle: 'You\'re offline',
    defaultDescription: 'Please check your internet connection and try again.',
    defaultAction: 'Retry',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
  },
  'error': {
    icon: RefreshCw,
    defaultTitle: 'Something went wrong',
    defaultDescription: 'We couldn\'t load this content. Please try again.',
    defaultAction: 'Try again',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
  },
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  const config = emptyStateConfigs[type]
  const Icon = config.icon

  const displayTitle = title || config.defaultTitle
  const displayDescription = description || config.defaultDescription
  const displayAction = actionLabel || config.defaultAction

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center mb-6',
          config.iconBg
        )}
      >
        <Icon className={cn('w-10 h-10', config.iconColor)} />
      </motion.div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {displayTitle}
      </h3>

      {/* Description */}
      <p className="text-neutral-500 text-sm max-w-xs mb-6">
        {displayDescription}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {displayAction && onAction && (
          <Button
            variant="primary"
            onClick={onAction}
          >
            {displayAction}
          </Button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <Button
            variant="ghost"
            onClick={onSecondaryAction}
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Specialized empty states for common scenarios
 */

export function NoShiftsInArea({
  onChangeLocation,
  onExpandRadius,
  currentCity,
}: {
  onChangeLocation: () => void
  onExpandRadius?: () => void
  currentCity?: string
}) {
  return (
    <EmptyState
      type="no-shifts-area"
      title={currentCity ? `No shifts in ${currentCity}` : 'No shifts in your area'}
      description="We're growing! Try a nearby city or check back soon as new shifts are added daily."
      actionLabel="Change city"
      onAction={onChangeLocation}
      secondaryActionLabel={onExpandRadius ? 'Expand search' : undefined}
      onSecondaryAction={onExpandRadius}
    />
  )
}

export function NoApplicationsYet({
  hoursPosted,
  onShareShift,
  onEditShift,
}: {
  hoursPosted: number
  onShareShift: () => void
  onEditShift?: () => void
}) {
  const getDescription = () => {
    if (hoursPosted < 2) {
      return 'Your shift was just posted. Give it some time — workers will see it soon!'
    }
    if (hoursPosted < 24) {
      return 'No applications yet. Try sharing your shift or consider increasing the rate.'
    }
    return 'Still no applications? Consider updating the shift details or adjusting the pay rate.'
  }

  return (
    <EmptyState
      type="no-applications"
      description={getDescription()}
      actionLabel="Share shift"
      onAction={onShareShift}
      secondaryActionLabel={hoursPosted >= 2 ? 'Edit shift' : undefined}
      onSecondaryAction={onEditShift}
    />
  )
}

export function FirstTimeWorker({
  onFindShifts,
  onCompleteProfile,
}: {
  onFindShifts: () => void
  onCompleteProfile?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6">
        <Briefcase className="w-10 h-10 text-white" />
      </div>

      <h3 className="text-xl font-bold text-neutral-900 mb-2">
        Ready to start earning?
      </h3>

      <p className="text-neutral-500 text-sm max-w-xs mb-6">
        Find your first shift and start building your profile. The more you work, the more opportunities you'll get!
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button variant="primary" size="lg" onClick={onFindShifts}>
          Find shifts near me
        </Button>

        {onCompleteProfile && (
          <Button variant="ghost" size="lg" onClick={onCompleteProfile}>
            Complete my profile
          </Button>
        )}
      </div>

      {/* Tips */}
      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
            <Star className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs text-neutral-600">Build your rating</p>
        </div>
        <div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs text-neutral-600">Connect with employers</p>
        </div>
        <div>
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xs text-neutral-600">Work on your schedule</p>
        </div>
      </div>
    </motion.div>
  )
}

export function FirstTimeEmployer({
  onCreateShift,
  onBrowseWorkers,
}: {
  onCreateShift: () => void
  onBrowseWorkers?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6">
        <Plus className="w-10 h-10 text-white" />
      </div>

      <h3 className="text-xl font-bold text-neutral-900 mb-2">
        Post your first shift
      </h3>

      <p className="text-neutral-500 text-sm max-w-xs mb-6">
        Create a shift posting and get qualified workers applying within minutes. It's faster than an agency!
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button variant="primary" size="lg" onClick={onCreateShift} leftIcon={<Plus className="w-5 h-5" />}>
          Create shift
        </Button>

        {onBrowseWorkers && (
          <Button variant="ghost" size="lg" onClick={onBrowseWorkers}>
            Browse workers first
          </Button>
        )}
      </div>

      {/* Benefits */}
      <div className="mt-8 text-left max-w-xs">
        <p className="text-sm font-medium text-neutral-900 mb-3">Why use Connector?</p>
        <ul className="space-y-2">
          {[
            'Workers respond in minutes, not days',
            'See ratings and reviews before hiring',
            'Pay only for work completed',
            'Save up to 40% vs agencies',
          ].map((benefit, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
              <span className="text-green-500 mt-0.5">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export default EmptyState
