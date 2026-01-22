'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { Button } from '@/components/ui/Button'
import { Zap, Plus, Users } from 'lucide-react'

interface QuickHireButtonProps {
  onClick?: () => void
  variant?: 'fab' | 'banner' | 'card'
  className?: string
}

export function QuickHireButton({
  onClick,
  variant = 'fab',
  className
}: QuickHireButtonProps) {
  const { language, isRTL } = useUI()

  if (variant === 'fab') {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn(
          'fixed bottom-24 z-40',
          isRTL ? 'left-4' : 'right-4',
          'w-14 h-14 rounded-full',
          'bg-gradient-brand text-white',
          'shadow-glow-primary',
          'flex items-center justify-center',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
          className
        )}
      >
        <Plus className="w-7 h-7" />
      </motion.button>
    )
  }

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'bg-gradient-brand text-white p-4 rounded-2xl',
          className
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Need workers fast?</h3>
              <p className="text-sm opacity-80">Post a shift in 60 seconds</p>
            </div>
          </div>
          <Button
            variant="outline-white"
            size="sm"
            onClick={onClick}
          >
            {t('task.create', language as any)}
          </Button>
        </div>
      </motion.div>
    )
  }

  // Card variant
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full p-6 rounded-2xl',
        'bg-gradient-to-br from-brand-primary/10 to-brand-accent/10',
        'border-2 border-dashed border-brand-primary/30',
        'flex flex-col items-center justify-center gap-3',
        'transition-all duration-200',
        'hover:border-brand-primary hover:bg-brand-primary/5',
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-brand-primary/20 flex items-center justify-center">
        <Plus className="w-7 h-7 text-brand-primary" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-neutral-900">
          {t('task.create', language as any)}
        </p>
        <p className="text-sm text-neutral-500">
          Find workers in minutes
        </p>
      </div>
    </motion.button>
  )
}

export default QuickHireButton
