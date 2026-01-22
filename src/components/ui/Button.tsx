'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { motion, type HTMLMotionProps } from 'framer-motion'

// ============================================
// BUTTON VARIANTS & SIZES
// ============================================

const variants = {
  primary:
    'bg-gradient-brand text-white hover:shadow-glow-primary focus-visible:ring-brand-primary',
  secondary:
    'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus-visible:ring-neutral-400',
  accent:
    'bg-gradient-accent text-neutral-900 hover:shadow-glow-accent focus-visible:ring-brand-accent',
  success:
    'bg-gradient-success text-white hover:shadow-glow-success focus-visible:ring-success',
  danger:
    'bg-gradient-danger text-white hover:shadow-glow-danger focus-visible:ring-danger',
  ghost:
    'bg-transparent text-neutral-600 hover:bg-neutral-100 focus-visible:ring-neutral-400',
  outline:
    'bg-transparent border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white focus-visible:ring-brand-primary',
  'outline-white':
    'bg-transparent border-2 border-white text-white hover:bg-white hover:text-neutral-900',
}

const sizes = {
  sm: 'text-sm px-3 py-2',
  md: 'text-base px-4 py-2.5',
  lg: 'text-lg px-6 py-3',
  xl: 'text-xl px-8 py-4',
  icon: 'p-2.5',
  'icon-sm': 'p-2',
  'icon-lg': 'p-3',
}

// ============================================
// BUTTON PROPS
// ============================================

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  children?: React.ReactNode
  // Psychology: urgency indicator
  isUrgent?: boolean
  // Psychology: highlight for important actions
  glow?: boolean
}

// ============================================
// BUTTON COMPONENT
// ============================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      isUrgent = false,
      glow = false,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 font-semibold',
          'rounded-xl transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variant & size
          variants[variant],
          sizes[size],
          // Full width
          fullWidth && 'w-full',
          // Psychology: urgency
          isUrgent && 'animate-pulse-fast',
          // Psychology: glow
          glow && 'glow-attention',
          className
        )}
        disabled={disabled || isLoading}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {/* Loading spinner */}
        {isLoading ? (
          <motion.span
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

// ============================================
// ICON BUTTON
// ============================================

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn('aspect-square', className)}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'

// ============================================
// CTA BUTTON (Call to Action - with psychology)
// ============================================

export interface CTAButtonProps extends ButtonProps {
  // Psychology: show potential earnings
  earnings?: number
  // Psychology: show urgency countdown
  urgencyText?: string
  // Psychology: show scarcity
  spotsLeft?: number
}

export const CTAButton = forwardRef<HTMLButtonElement, CTAButtonProps>(
  ({ children, earnings, urgencyText, spotsLeft, className, ...props }, ref) => {
    return (
      <div className="relative">
        {/* Urgency badge */}
        {urgencyText && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-10
                       bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full
                       whitespace-nowrap"
          >
            {urgencyText}
          </motion.span>
        )}

        <Button
          ref={ref}
          variant="primary"
          size="lg"
          fullWidth
          glow
          className={cn('relative', className)}
          {...props}
        >
          <div className="flex flex-col items-center">
            <span>{children}</span>
            {/* Earnings indicator */}
            {earnings && (
              <span className="text-sm opacity-90">
                +{earnings.toLocaleString()}₪ potential
              </span>
            )}
          </div>
        </Button>

        {/* Scarcity indicator */}
        {spotsLeft !== undefined && spotsLeft <= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2
                       text-xs text-danger font-semibold"
          >
            Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left!
          </motion.div>
        )}
      </div>
    )
  }
)

CTAButton.displayName = 'CTAButton'
