'use client'

import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { motion } from 'framer-motion'

// ============================================
// AVATAR SIZES
// ============================================

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
  '3xl': 'w-24 h-24 text-3xl',
}

// ============================================
// AVATAR PROPS
// ============================================

export interface AvatarProps {
  src?: string | null
  name?: string
  size?: keyof typeof sizes
  className?: string
  // Status indicators
  isOnline?: boolean
  isAvailable?: boolean
  isVerified?: boolean
  isPro?: boolean
  // Click handler
  onClick?: () => void
}

// ============================================
// AVATAR COMPONENT
// ============================================

export function Avatar({
  src,
  name = '',
  size = 'md',
  className,
  isOnline,
  isAvailable,
  isVerified,
  isPro,
  onClick,
}: AvatarProps) {
  const initials = getInitials(name)

  return (
    <div className="relative inline-block">
      <motion.div
        whileHover={onClick ? { scale: 1.05 } : undefined}
        whileTap={onClick ? { scale: 0.95 } : undefined}
        onClick={onClick}
        className={cn(
          'relative rounded-full overflow-hidden flex items-center justify-center',
          'bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white font-semibold',
          sizes[size],
          onClick && 'cursor-pointer',
          isPro && 'ring-2 ring-brand-accent ring-offset-2',
          className
        )}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials on error
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <span>{initials || '?'}</span>
        )}
      </motion.div>

      {/* Online/Available indicator */}
      {(isOnline || isAvailable) && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3',
            isAvailable ? 'bg-success animate-pulse' : 'bg-success'
          )}
        />
      )}

      {/* Verified badge */}
      {isVerified && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 bg-success text-white rounded-full p-0.5',
            size === 'xs' || size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
          )}
        >
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}

      {/* Pro badge */}
      {isPro && !isVerified && (
        <span
          className={cn(
            'absolute -bottom-1 -right-1 bg-gradient-accent text-neutral-900 rounded-full',
            'text-[8px] font-bold px-1',
            size === 'xl' || size === '2xl' || size === '3xl'
              ? 'text-[10px] px-1.5 py-0.5'
              : ''
          )}
        >
          PRO
        </span>
      )}
    </div>
  )
}

// ============================================
// AVATAR GROUP
// ============================================

export interface AvatarGroupProps {
  avatars: Array<{
    src?: string | null
    name: string
  }>
  max?: number
  size?: keyof typeof sizes
  className?: string
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = 'sm',
  className,
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'rounded-full bg-neutral-200 text-neutral-600 font-semibold',
            'flex items-center justify-center ring-2 ring-white',
            sizes[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

// ============================================
// WORKER AVATAR (with rating)
// ============================================

export interface WorkerAvatarProps extends AvatarProps {
  rating?: number
  completedJobs?: number
}

export function WorkerAvatar({
  rating,
  completedJobs,
  ...props
}: WorkerAvatarProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Avatar {...props} />
      {rating !== undefined && rating > 0 && (
        <div className="flex items-center gap-0.5 text-xs">
          <svg className="w-3 h-3 text-warning" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-medium">{rating.toFixed(1)}</span>
        </div>
      )}
    </div>
  )
}

// ============================================
// EMPLOYER AVATAR (with company)
// ============================================

export interface EmployerAvatarProps extends AvatarProps {
  company?: string
  totalPaid?: number
}

export function EmployerAvatar({
  company,
  totalPaid,
  name,
  ...props
}: EmployerAvatarProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} {...props} />
      <div>
        <p className="font-medium text-neutral-900">{name}</p>
        {company && <p className="text-sm text-neutral-500">{company}</p>}
        {totalPaid !== undefined && totalPaid > 10000 && (
          <p className="text-xs text-success">
            ₪{(totalPaid / 1000).toFixed(0)}k+ paid
          </p>
        )}
      </div>
    </div>
  )
}
