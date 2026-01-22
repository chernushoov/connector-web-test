'use client'

import { forwardRef, type InputHTMLAttributes, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// INPUT PROPS
// ============================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconClick?: () => void
  // Size variants
  inputSize?: 'md' | 'lg'
}

// ============================================
// INPUT COMPONENT
// ============================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      inputSize = 'md',
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)

    const sizeClasses = {
      md: 'px-4 py-3',
      lg: 'px-5 py-4 text-lg',
    }

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            type={type}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            className={cn(
              'w-full rounded-xl border bg-white text-neutral-900',
              'placeholder:text-neutral-400',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2',
              sizeClasses[inputSize],
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
              error
                ? 'border-danger focus:border-danger focus:ring-danger/20'
                : 'border-neutral-200 focus:border-brand-primary focus:ring-brand-primary/20',
              className
            )}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400',
                'hover:text-neutral-600 transition-colors',
                onRightIconClick && 'cursor-pointer'
              )}
              tabIndex={onRightIconClick ? 0 : -1}
            >
              {rightIcon}
            </button>
          )}

          {/* Focus indicator line */}
          <motion.div
            initial={false}
            animate={{
              scaleX: isFocused ? 1 : 0,
              opacity: isFocused ? 1 : 0,
            }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-[calc(100%-2rem)]
                       bg-gradient-brand rounded-full"
          />
        </div>

        {/* Error or hint */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-1.5 text-sm text-danger"
            >
              {error}
            </motion.p>
          ) : hint ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-1.5 text-sm text-neutral-500"
            >
              {hint}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    )
  }
)

Input.displayName = 'Input'

// ============================================
// PHONE INPUT (with country code)
// ============================================

export interface PhoneInputProps extends Omit<InputProps, 'type' | 'leftIcon'> {
  countryCode?: string
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ countryCode = '+972', className, ...props }, ref) => {
    return (
      <div className="relative">
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2
                     text-neutral-600 font-medium border-r border-neutral-200 pr-3"
        >
          {countryCode}
        </div>
        <Input
          ref={ref}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          className={cn('pl-20', className)}
          {...props}
        />
      </div>
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

// ============================================
// SEARCH INPUT
// ============================================

export interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onSearch?: (value: string) => void
  onClear?: () => void
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onClear, value, onChange, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => {
          onChange?.(e)
          onSearch?.(e.target.value)
        }}
        leftIcon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        rightIcon={
          value ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : undefined
        }
        onRightIconClick={onClear}
        {...props}
      />
    )
  }
)

SearchInput.displayName = 'SearchInput'

// ============================================
// OTP INPUT (for verification code)
// ============================================

export interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  error?: string
  autoFocus?: boolean
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  error,
  autoFocus = true,
}: OTPInputProps) {
  const inputRefs: React.RefObject<HTMLInputElement | null>[] = Array(length)
    .fill(null)
    .map(() => ({ current: null }))

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return

    const newValue = value.split('')
    newValue[index] = digit
    const result = newValue.join('').slice(0, length)
    onChange(result)

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs[index + 1]?.current?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pasted)

    // Focus last filled input or first empty
    const focusIndex = Math.min(pasted.length, length - 1)
    inputRefs[focusIndex]?.current?.focus()
  }

  return (
    <div className="w-full">
      <div className="flex gap-2 justify-center" dir="ltr">
        {Array(length)
          .fill(null)
          .map((_, index) => (
            <motion.input
              key={index}
              ref={(el) => { inputRefs[index] = { current: el } }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value[index] || ''}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              autoFocus={autoFocus && index === 0}
              whileFocus={{ scale: 1.05 }}
              className={cn(
                'w-12 h-14 text-center text-2xl font-bold rounded-xl border',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2',
                error
                  ? 'border-danger focus:border-danger focus:ring-danger/20'
                  : 'border-neutral-200 focus:border-brand-primary focus:ring-brand-primary/20'
              )}
            />
          ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-3 text-sm text-danger text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
