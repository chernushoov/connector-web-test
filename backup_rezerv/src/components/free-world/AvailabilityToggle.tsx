'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useConnectorStore } from '@/store'
import type { Language } from '@/types'

// ============================================
// AVAILABILITY TOGGLE PROPS
// ============================================

export interface AvailabilityToggleProps {
  lang?: Language
  onToggle?: (isAvailable: boolean) => void
  className?: string
}

// ============================================
// AVAILABILITY TOGGLE COMPONENT
// ============================================

export function AvailabilityToggle({
  lang = 'ru',
  onToggle,
  className,
}: AvailabilityToggleProps) {
  const { isAvailable, availableUntil } = useConnectorStore((state) => state.freeWorld)
  const toggleAvailability = useConnectorStore((state) => state.toggleAvailability)
  const setAvailableUntil = useConnectorStore((state) => state.setAvailableUntil)

  const [showDurationPicker, setShowDurationPicker] = useState(false)

  const handleToggle = () => {
    toggleAvailability()
    onToggle?.(!isAvailable)

    if (!isAvailable) {
      // Show duration picker when turning on
      setShowDurationPicker(true)
    }
  }

  const handleDurationSelect = (hours: number) => {
    const until = new Date()
    until.setHours(until.getHours() + hours)
    setAvailableUntil(until)
    setShowDurationPicker(false)
  }

  const texts = {
    ru: {
      available: 'Я свободен',
      notAvailable: 'Не в сети',
      forHours: 'На сколько?',
      hour: 'час',
      hours: 'часа',
      allDay: 'Весь день',
      until: 'До',
    },
    en: {
      available: "I'm available",
      notAvailable: 'Offline',
      forHours: 'For how long?',
      hour: 'hour',
      hours: 'hours',
      allDay: 'All day',
      until: 'Until',
    },
    he: {
      available: 'אני פנוי',
      notAvailable: 'לא מקוון',
      forHours: 'לכמה זמן?',
      hour: 'שעה',
      hours: 'שעות',
      allDay: 'כל היום',
      until: 'עד',
    },
    ar: {
      available: 'أنا متاح',
      notAvailable: 'غير متصل',
      forHours: 'لكم ساعة؟',
      hour: 'ساعة',
      hours: 'ساعات',
      allDay: 'طوال اليوم',
      until: 'حتى',
    },
  }

  const t = texts[lang]

  return (
    <div className={cn('relative', className)}>
      {/* Main toggle button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={cn(
          'relative flex items-center gap-3 px-5 py-4 rounded-2xl',
          'transition-all duration-300 shadow-lg',
          'min-w-[200px]',
          isAvailable
            ? 'bg-gradient-to-r from-success to-success-dark text-white'
            : 'bg-white text-neutral-600 border border-neutral-200'
        )}
      >
        {/* Status indicator */}
        <div className="relative">
          <motion.div
            animate={{
              scale: isAvailable ? [1, 1.2, 1] : 1,
            }}
            transition={{
              repeat: isAvailable ? Infinity : 0,
              duration: 2,
            }}
            className={cn(
              'w-4 h-4 rounded-full',
              isAvailable ? 'bg-white' : 'bg-neutral-300'
            )}
          />
          {isAvailable && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 w-4 h-4 rounded-full bg-white"
            />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 text-left">
          <p className="font-semibold">
            {isAvailable ? t.available : t.notAvailable}
          </p>
          {isAvailable && availableUntil && (
            <p className="text-xs opacity-80">
              {t.until}{' '}
              {availableUntil.toLocaleTimeString(lang, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>

        {/* Toggle switch visual */}
        <div
          className={cn(
            'w-12 h-7 rounded-full p-1 transition-colors',
            isAvailable ? 'bg-white/30' : 'bg-neutral-200'
          )}
        >
          <motion.div
            animate={{ x: isAvailable ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={cn(
              'w-5 h-5 rounded-full',
              isAvailable ? 'bg-white' : 'bg-neutral-400'
            )}
          />
        </div>
      </motion.button>

      {/* Duration picker */}
      <AnimatePresence>
        {showDurationPicker && isAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 left-0 right-0 z-20
                       bg-white rounded-xl shadow-elevated p-3"
          >
            <p className="text-sm font-medium text-neutral-500 mb-2">
              {t.forHours}
            </p>
            <div className="flex gap-2">
              {[1, 2, 4, 8].map((hours) => (
                <button
                  key={hours}
                  onClick={() => handleDurationSelect(hours)}
                  className="flex-1 py-2 px-3 rounded-lg bg-neutral-100
                           hover:bg-brand-primary hover:text-white
                           transition-colors text-sm font-medium"
                >
                  {hours} {hours === 1 ? t.hour : t.hours}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleDurationSelect(12)}
              className="w-full mt-2 py-2 rounded-lg bg-brand-primary/10
                       text-brand-primary hover:bg-brand-primary hover:text-white
                       transition-colors text-sm font-medium"
            >
              {t.allDay}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {showDurationPicker && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowDurationPicker(false)}
        />
      )}
    </div>
  )
}

// ============================================
// MINI AVAILABILITY TOGGLE (for header)
// ============================================

export function MiniAvailabilityToggle({ className }: { className?: string }) {
  const isAvailable = useConnectorStore((state) => state.freeWorld.isAvailable)
  const toggleAvailability = useConnectorStore((state) => state.toggleAvailability)

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleAvailability}
      className={cn(
        'relative flex items-center gap-2 px-3 py-1.5 rounded-full',
        'transition-all duration-300',
        isAvailable
          ? 'bg-success text-white'
          : 'bg-neutral-100 text-neutral-500',
        className
      )}
    >
      <div className="relative">
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            isAvailable ? 'bg-white' : 'bg-neutral-400'
          )}
        />
        {isAvailable && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 w-2 h-2 rounded-full bg-white"
          />
        )}
      </div>
      <span className="text-xs font-medium">
        {isAvailable ? 'Available' : 'Offline'}
      </span>
    </motion.button>
  )
}

// ============================================
// AVAILABILITY STATUS BADGE
// ============================================

export function AvailabilityBadge({
  isAvailable,
  className,
}: {
  isAvailable: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        isAvailable
          ? 'bg-success-light text-success-dark'
          : 'bg-neutral-100 text-neutral-500',
        className
      )}
    >
      <div className="relative">
        <div
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            isAvailable ? 'bg-success' : 'bg-neutral-400'
          )}
        />
        {isAvailable && (
          <motion.div
            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-success"
          />
        )}
      </div>
      {isAvailable ? 'Available' : 'Offline'}
    </div>
  )
}
