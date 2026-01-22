'use client'

import { useCallback } from 'react'
import { useConnectorStore } from '@/store'
import { translations, isRTL } from '@/i18n/translations'
import type { Language } from '@/types'

// ============================================
// USE TRANSLATION HOOK
// ============================================

export function useTranslation() {
  const language = useConnectorStore((state) => state.ui.language)
  const setLanguage = useConnectorStore((state) => state.setLanguage)

  const t = useCallback(
    (
      key: keyof typeof translations.en,
      params?: Record<string, string | number>
    ): string => {
      const langTranslations = translations[language] || translations.en
      let text: string = String(langTranslations[key] || translations.en[key] || key)

      // Replace parameters
      if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
          text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(value))
        })
      }

      return text
    },
    [language]
  )

  const changeLanguage = useCallback(
    (lang: Language) => {
      setLanguage(lang)
      // Update document direction for RTL languages
      document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr'
      document.documentElement.lang = lang
    },
    [setLanguage]
  )

  return {
    t,
    language,
    isRTL: isRTL(language),
    changeLanguage,
  }
}

// ============================================
// LANGUAGE SELECTOR COMPONENT
// ============================================

import { cn } from '@/lib/utils'

const languageNames: Record<Language, string> = {
  ru: 'Русский',
  en: 'English',
  he: 'עברית',
  ar: 'العربية',
}

const languageFlags: Record<Language, string> = {
  ru: '🇷🇺',
  en: '🇬🇧',
  he: '🇮🇱',
  ar: '🇸🇦',
}

export function LanguageSelector({ className }: { className?: string }) {
  const { language, changeLanguage } = useTranslation()

  return (
    <div className={cn('flex gap-1', className)}>
      {(['ru', 'en', 'he', 'ar'] as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            language === lang
              ? 'bg-brand-primary text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          )}
          title={languageNames[lang]}
        >
          <span className="mr-1">{languageFlags[lang]}</span>
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export function LanguageDropdown({ className }: { className?: string }) {
  const { language, changeLanguage } = useTranslation()

  return (
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value as Language)}
      className={cn(
        'px-3 py-2 rounded-xl border border-neutral-200 bg-white',
        'text-sm font-medium text-neutral-700',
        'focus:outline-none focus:ring-2 focus:ring-brand-primary/20',
        className
      )}
    >
      {(['ru', 'en', 'he', 'ar'] as Language[]).map((lang) => (
        <option key={lang} value={lang}>
          {languageFlags[lang]} {languageNames[lang]}
        </option>
      ))}
    </select>
  )
}
