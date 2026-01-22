'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Briefcase, Building2, Map, Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { UserMode } from '@/types'

// ============================================
// MODE SELECTOR PROPS
// ============================================

export interface ModeSelectorProps {
  onModeChange?: (mode: UserMode) => void
}

// ============================================
// MODE OPTIONS
// ============================================

interface ModeOption {
  id: UserMode
  icon: React.ReactNode
  titleKey: string
  descriptionKey: string
  gradient: string
  href: string
}

const modeOptions: ModeOption[] = [
  {
    id: 'free-world',
    icon: <Map className="w-6 h-6" />,
    titleKey: 'mode.free',
    descriptionKey: 'mode.freeDescription',
    gradient: 'from-blue-500 to-cyan-500',
    href: '/',
  },
  {
    id: 'worker',
    icon: <Briefcase className="w-6 h-6" />,
    titleKey: 'mode.worker',
    descriptionKey: 'mode.workerDescription',
    gradient: 'from-purple-500 to-pink-500',
    href: '/worker',
  },
  {
    id: 'employer',
    icon: <Building2 className="w-6 h-6" />,
    titleKey: 'mode.employer',
    descriptionKey: 'mode.employerDescription',
    gradient: 'from-amber-500 to-orange-500',
    href: '/employer',
  },
]

// ============================================
// MODE SELECTOR COMPONENT
// ============================================

export function ModeSelector({ onModeChange }: ModeSelectorProps) {
  const { language, isRTL } = useUI()
  const { user, setMode } = useConnectorStore()
  const [isOpen, setIsOpen] = useState(false)

  const currentMode = user.mode
  const currentModeOption = modeOptions.find((m) => m.id === currentMode) || modeOptions[0]

  const handleModeSelect = (mode: UserMode) => {
    setMode(mode)
    setIsOpen(false)
    if (onModeChange) {
      onModeChange(mode)
    }
    // Navigate to mode page
    const option = modeOptions.find((m) => m.id === mode)
    if (option) {
      window.location.href = option.href
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-neutral-50 transition-colors w-full"
      >
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br',
            currentModeOption.gradient,
            'text-white'
          )}
        >
          {currentModeOption.icon}
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-neutral-900">
            {t('mode.current', language as any)}
          </p>
          <p className="text-sm text-neutral-500">
            {t(currentModeOption.titleKey as any, language)}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-400" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-neutral-100">
                  <h2 className="text-xl font-bold text-neutral-900">
                    {t('mode.selectMode', language as any)}
                  </h2>
                  <p className="text-sm text-neutral-500 mt-1">
                    {t('mode.selectModeDescription', language as any)}
                  </p>
                </div>

                {/* Mode Options */}
                <div className="p-4 space-y-3">
                  {modeOptions.map((option) => {
                    const isSelected = currentMode === option.id

                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => handleModeSelect(option.id)}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'relative w-full p-4 rounded-2xl transition-all',
                          'flex items-start gap-4 text-left',
                          isSelected
                            ? 'bg-brand-primary/5 border-2 border-brand-primary'
                            : 'bg-neutral-50 border-2 border-transparent hover:border-neutral-200'
                        )}
                      >
                        {/* Icon */}
                        <div
                          className={cn(
                            'flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br flex-shrink-0',
                            option.gradient,
                            'text-white'
                          )}
                        >
                          {option.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                          <h3 className="font-semibold text-neutral-900 mb-1">
                            {t(option.titleKey as any, language)}
                          </h3>
                          <p className="text-sm text-neutral-600 leading-relaxed">
                            {t(option.descriptionKey as any, language)}
                          </p>
                        </div>

                        {/* Check mark */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white flex-shrink-0"
                            >
                              <Check className="w-4 h-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-neutral-100">
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setIsOpen(false)}
                  >
                    {t('common.cancel', language as any)}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
