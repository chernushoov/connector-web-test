'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { IconButton } from './Button'

// ============================================
// MODAL SIZES
// ============================================

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full mx-4',
}

// ============================================
// MODAL PROPS
// ============================================

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  subtitle?: string
  size?: keyof typeof sizes
  // Options
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

// ============================================
// MODAL COMPONENT
// ============================================

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, closeOnEscape])

  // Focus trap
  useEffect(() => {
    if (!isOpen) return

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements?.[0] as HTMLElement
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement

    firstElement?.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden',
              sizes[size],
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-5 pb-0">
                <div>
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-xl font-semibold text-neutral-900"
                    >
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
                  )}
                </div>
                {showCloseButton && (
                  <IconButton
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Close modal"
                    onClick={onClose}
                    icon={
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    }
                  />
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// MODAL FOOTER
// ============================================

export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 -mx-5 -mb-5 px-5 py-4 bg-neutral-50',
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================
// CONFIRMATION MODAL
// ============================================

export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        {/* Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center',
            variant === 'danger' ? 'bg-danger-light' : 'bg-brand-primary/10'
          )}
        >
          {variant === 'danger' ? (
            <svg
              className="w-6 h-6 text-danger"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-brand-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <p className="text-neutral-500 mt-2">{message}</p>
      </div>

      <ModalFooter className="justify-center">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl font-medium text-neutral-600
                     hover:bg-neutral-100 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            'px-4 py-2 rounded-xl font-semibold text-white transition-colors',
            variant === 'danger'
              ? 'bg-danger hover:bg-danger-dark'
              : 'bg-brand-primary hover:bg-brand-primary-dark'
          )}
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <motion.span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Loading...
            </span>
          ) : (
            confirmText
          )}
        </button>
      </ModalFooter>
    </Modal>
  )
}

// ============================================
// SUCCESS MODAL
// ============================================

export interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  actionText?: string
  onAction?: () => void
  // Psychology: show earnings
  earnings?: number
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  actionText,
  onAction,
  earnings,
}: SuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-16 h-16 rounded-full bg-success-light mx-auto mb-4
                     flex items-center justify-center"
        >
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-8 h-8 text-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </motion.div>

        <h3 className="text-xl font-semibold text-neutral-900">{title}</h3>
        <p className="text-neutral-500 mt-2">{message}</p>

        {/* Earnings highlight */}
        {earnings && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-3 bg-success-light rounded-xl"
          >
            <p className="text-sm text-success-dark">Potential earnings</p>
            <p className="text-2xl font-bold text-success">
              +₪{earnings.toLocaleString()}
            </p>
          </motion.div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {onAction && actionText && (
          <button
            onClick={onAction}
            className="w-full py-3 rounded-xl font-semibold text-white
                       bg-gradient-brand hover:shadow-glow-primary transition-all"
          >
            {actionText}
          </button>
        )}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-medium text-neutral-600
                     hover:bg-neutral-100 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  )
}
