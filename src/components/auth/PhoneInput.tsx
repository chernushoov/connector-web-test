'use client'

import { useState, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { Phone, Check, AlertCircle } from 'lucide-react'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  className?: string
}

// Israeli phone format: +972 XX XXX XXXX
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '')

  // Handle Israeli format
  if (digits.startsWith('972')) {
    const rest = digits.slice(3)
    if (rest.length <= 2) return `+972 ${rest}`
    if (rest.length <= 5) return `+972 ${rest.slice(0, 2)} ${rest.slice(2)}`
    return `+972 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 9)}`
  }

  // Handle 0X format (Israeli local)
  if (digits.startsWith('0')) {
    const rest = digits.slice(1)
    if (rest.length <= 2) return `+972 ${rest}`
    if (rest.length <= 5) return `+972 ${rest.slice(0, 2)} ${rest.slice(2)}`
    return `+972 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 9)}`
  }

  // Default format
  if (digits.length <= 2) return `+972 ${digits}`
  if (digits.length <= 5) return `+972 ${digits.slice(0, 2)} ${digits.slice(2)}`
  return `+972 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`
}

const isValidIsraeliPhone = (value: string): boolean => {
  const digits = value.replace(/\D/g, '')
  // Israeli mobile: 972 5X XXX XXXX (10 digits after country code)
  // or starts with 05X (9 digits)
  return digits.length >= 12 && digits.startsWith('972')
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, error, disabled, className }, ref) => {
    const { language, isRTL } = useUI()
    const [isFocused, setIsFocused] = useState(false)

    const isValid = value.length > 0 && isValidIsraeliPhone(value)
    const showError = error || (value.length > 8 && !isValid)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value)
      onChange(formatted)
    }

    return (
      <div className={cn('w-full', className)} dir={isRTL ? 'rtl' : 'ltr'}>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {t('auth.phone', language)}
        </label>

        <div className="relative">
          {/* Phone icon */}
          <div className={cn(
            'absolute top-1/2 -translate-y-1/2 z-10',
            isRTL ? 'right-4' : 'left-4'
          )}>
            <Phone className={cn(
              'w-5 h-5 transition-colors',
              isFocused ? 'text-brand-primary' : 'text-neutral-400'
            )} />
          </div>

          {/* Input */}
          <input
            ref={ref}
            type="tel"
            inputMode="tel"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t('auth.phone.placeholder', language)}
            disabled={disabled}
            dir="ltr"
            className={cn(
              'w-full h-14 rounded-2xl',
              'bg-neutral-50 border-2 transition-all duration-200',
              'text-lg font-medium tracking-wider',
              isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12',
              isFocused ? 'border-brand-primary bg-white' : 'border-transparent',
              showError && 'border-danger bg-danger-light/10',
              disabled && 'opacity-50 cursor-not-allowed',
              'focus:outline-none'
            )}
          />

          {/* Status icon */}
          <div className={cn(
            'absolute top-1/2 -translate-y-1/2',
            isRTL ? 'left-4' : 'right-4'
          )}>
            {isValid && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-success flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
            {showError && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-danger"
              >
                <AlertCircle className="w-5 h-5" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Error message */}
        {showError && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-danger"
          >
            {error || t('auth.error.phone', language)}
          </motion.p>
        )}

        {/* Helper text */}
        {!showError && (
          <p className="mt-2 text-xs text-neutral-500">
            {t('free.visible.to', language)} 50 km
          </p>
        )}
      </div>
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

export default PhoneInput
