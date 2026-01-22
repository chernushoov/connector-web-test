'use client'

import { useState, useRef, useEffect, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'

interface CodeInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  autoFocus?: boolean
  onComplete?: (code: string) => void
  className?: string
}

export const CodeInput = forwardRef<HTMLInputElement, CodeInputProps>(
  ({
    length = 6,
    value,
    onChange,
    error,
    disabled,
    autoFocus = true,
    onComplete,
    className
  }, ref) => {
    const { language, isRTL } = useUI()
    const [focusedIndex, setFocusedIndex] = useState(0)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Focus first input on mount
    useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }
    }, [autoFocus])

    // Call onComplete when code is filled
    useEffect(() => {
      if (value.length === length && onComplete) {
        onComplete(value)
      }
    }, [value, length, onComplete])

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (!value[index] && index > 0) {
          // Move to previous input if current is empty
          inputRefs.current[index - 1]?.focus()
          setFocusedIndex(index - 1)
        }
        // Clear current digit
        const newValue = value.slice(0, index) + value.slice(index + 1)
        onChange(newValue)
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus()
        setFocusedIndex(index - 1)
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
        setFocusedIndex(index + 1)
      }
    }

    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const digit = e.target.value.replace(/\D/g, '').slice(-1)

      if (digit) {
        // Insert digit at position
        const newValue = value.slice(0, index) + digit + value.slice(index + 1)
        onChange(newValue.slice(0, length))

        // Move to next input
        if (index < length - 1) {
          inputRefs.current[index + 1]?.focus()
          setFocusedIndex(index + 1)
        }
      }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
      onChange(pastedData)

      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
      setFocusedIndex(nextIndex)
    }

    const handleFocus = (index: number) => {
      setFocusedIndex(index)
      // Select input content
      inputRefs.current[index]?.select()
    }

    return (
      <div className={cn('w-full', className)} dir={isRTL ? 'rtl' : 'ltr'}>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          {t('auth.code', language)}
        </label>

        {/* Code inputs */}
        <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
          {Array.from({ length }).map((_, index) => {
            const isFilled = value[index] !== undefined
            const isFocused = focusedIndex === index

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <input
                  ref={(el) => {
                    inputRefs.current[index] = el
                    if (index === 0 && ref) {
                      if (typeof ref === 'function') ref(el)
                      else ref.current = el
                    }
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value[index] || ''}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={() => handleFocus(index)}
                  onPaste={handlePaste}
                  disabled={disabled}
                  className={cn(
                    'w-12 h-14 sm:w-14 sm:h-16',
                    'rounded-xl text-center text-2xl font-bold',
                    'transition-all duration-200',
                    'focus:outline-none',
                    isFocused
                      ? 'bg-white border-2 border-brand-primary shadow-glow-primary'
                      : isFilled
                        ? 'bg-brand-primary/10 border-2 border-brand-primary/30'
                        : 'bg-neutral-100 border-2 border-transparent',
                    error && 'border-danger bg-danger-light/10',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-label={`Digit ${index + 1}`}
                />

                {/* Cursor animation for focused empty input */}
                {isFocused && !isFilled && (
                  <motion.div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-brand-primary"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm text-danger text-center"
          >
            {error}
          </motion.p>
        )}

        {/* Resend code */}
        <div className="mt-4 text-center">
          <ResendCode onResend={() => {}} />
        </div>
      </div>
    )
  }
)

CodeInput.displayName = 'CodeInput'

// Resend code component with countdown
function ResendCode({ onResend }: { onResend: () => void }) {
  const { language } = useUI()
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleResend = () => {
    if (canResend) {
      onResend()
      setCountdown(60)
      setCanResend(false)
    }
  }

  return (
    <button
      onClick={handleResend}
      disabled={!canResend}
      className={cn(
        'text-sm transition-colors',
        canResend
          ? 'text-brand-primary font-medium hover:text-brand-primary-dark'
          : 'text-neutral-400'
      )}
    >
      {canResend ? (
        t('auth.send.code', language)
      ) : (
        <span>
          {t('auth.send.code', language)} ({countdown}s)
        </span>
      )}
    </button>
  )
}

export default CodeInput
