'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface MetricCardProps {
  title: string
  titleRu?: string
  value: string | number
  previousValue?: number
  format?: 'number' | 'currency' | 'percent'
  icon?: React.ReactNode
  trend?: {
    value: number
    label?: string
  }
  chart?: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  onClick?: () => void
}

export function MetricCard({
  title,
  titleRu,
  value,
  format = 'number',
  icon,
  trend,
  chart,
  className,
  size = 'md',
  variant = 'default',
  onClick,
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'currency':
        return `₪${val.toLocaleString()}`
      case 'percent':
        return `${val}%`
      default:
        return val.toLocaleString()
    }
  }

  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.value > 0) return <TrendingUp className="w-4 h-4" />
    if (trend.value < 0) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getTrendColor = () => {
    if (!trend) return ''
    if (trend.value > 0) return 'text-success'
    if (trend.value < 0) return 'text-danger'
    return 'text-neutral-500'
  }

  const variantClasses = {
    default: 'bg-white',
    primary: 'bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white',
    success: 'bg-gradient-to-br from-success to-green-600 text-white',
    warning: 'bg-gradient-to-br from-warning to-orange-600 text-white',
    danger: 'bg-gradient-to-br from-danger to-red-600 text-white',
  }

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const valueClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      onClick={onClick}
      className={cn(
        'rounded-xl shadow-sm',
        variantClasses[variant],
        sizeClasses[size],
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={cn(
              'text-sm font-medium',
              variant === 'default' ? 'text-neutral-500' : 'opacity-80'
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'font-bold mt-1',
              valueClasses[size],
              variant === 'default' && 'text-neutral-900'
            )}
          >
            {formatValue(value)}
          </p>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 mt-2 text-sm font-medium',
                variant === 'default' ? getTrendColor() : 'opacity-90'
              )}
            >
              {getTrendIcon()}
              <span>
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
              {trend.label && (
                <span
                  className={cn(
                    variant === 'default' ? 'text-neutral-400' : 'opacity-70'
                  )}
                >
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'p-2 rounded-lg',
              variant === 'default'
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'bg-white/20'
            )}
          >
            {icon}
          </div>
        )}
      </div>
      {chart && <div className="mt-4">{chart}</div>}
    </motion.div>
  )
}
