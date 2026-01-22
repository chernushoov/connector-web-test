'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore } from '@/store'
import { languages } from '@/i18n/translations'
import { Globe, Check } from 'lucide-react'
import type { Language } from '@/types'

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline' | 'compact'
  className?: string
}

export function LanguageSwitcher({
  variant = 'dropdown',
  className
}: LanguageSwitcherProps) {
  const { language, isRTL } = useUI()
  const { setLanguage } = useConnectorStore()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = languages.find((l) => l.code === language)

  const handleSelect = (lang: Language) => {
    setLanguage(lang)
    setIsOpen(false)
  }

  if (variant === 'inline') {
    return (
      <div
        className={cn('flex flex-wrap gap-2', className)}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl',
              'transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
              language === lang.code
                ? 'bg-brand-primary text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            )}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="text-sm font-medium">{lang.nativeName}</span>
          </button>
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('relative', className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center justify-center',
            'w-10 h-10 rounded-full',
            'bg-neutral-100 hover:bg-neutral-200',
            'transition-colors duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
          )}
        >
          <span className="text-xl">{currentLang?.flag}</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'absolute top-full mt-2 z-50',
                  isRTL ? 'left-0' : 'right-0',
                  'bg-white rounded-xl shadow-elevated',
                  'border border-neutral-100',
                  'overflow-hidden min-w-[140px]'
                )}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3',
                      'transition-colors duration-150',
                      'hover:bg-neutral-50',
                      language === lang.code && 'bg-brand-primary/5'
                    )}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm font-medium flex-1 text-left">
                      {lang.nativeName}
                    </span>
                    {language === lang.code && (
                      <Check className="w-4 h-4 text-brand-primary" />
                    )}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Default dropdown variant
  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl',
          'bg-neutral-100 hover:bg-neutral-200',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
        )}
      >
        <Globe className="w-4 h-4 text-neutral-500" />
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="text-sm font-medium">{currentLang?.nativeName}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute top-full mt-2 z-50',
                isRTL ? 'left-0' : 'right-0',
                'bg-white rounded-xl shadow-elevated',
                'border border-neutral-100',
                'overflow-hidden min-w-[180px]'
              )}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3',
                    'transition-colors duration-150',
                    'hover:bg-neutral-50',
                    language === lang.code && 'bg-brand-primary/5'
                  )}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{lang.nativeName}</p>
                    <p className="text-xs text-neutral-500">{lang.name}</p>
                  </div>
                  {language === lang.code && (
                    <Check className="w-4 h-4 text-brand-primary" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LanguageSwitcher
