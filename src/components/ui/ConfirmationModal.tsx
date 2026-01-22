'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react'

type ConfirmationType = 'danger' | 'warning' | 'info' | 'success'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: ConfirmationType
  isLoading?: boolean
  showIcon?: boolean
}

const typeConfig = {
  danger: {
    icon: XCircle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100',
    confirmVariant: 'danger' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-100',
    confirmVariant: 'accent' as const,
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    confirmVariant: 'primary' as const,
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-100',
    confirmVariant: 'primary' as const,
  },
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  isLoading = false,
  showIcon = true,
}: ConfirmationModalProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>

            {/* Content */}
            <div className="p-6 pt-8 text-center">
              {showIcon && (
                <div className={cn(
                  'w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center',
                  config.iconBg
                )}>
                  <Icon className={cn('w-7 h-7', config.iconColor)} />
                </div>
              )}

              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {title}
              </h3>

              <p className="text-neutral-600 text-sm">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 pt-0">
              <Button
                variant="ghost"
                size="lg"
                className="flex-1"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                variant={config.confirmVariant}
                size="lg"
                className="flex-1"
                onClick={handleConfirm}
                isLoading={isLoading}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Hook for easy confirmation modal usage
 */
import { useState, useCallback } from 'react'

interface UseConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: ConfirmationType
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState<UseConfirmationOptions | null>(null)

  const confirm = useCallback((opts: UseConfirmationOptions) => {
    setOptions(opts)
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    if (!isLoading) {
      setIsOpen(false)
      options?.onCancel?.()
    }
  }, [isLoading, options])

  const handleConfirm = useCallback(async () => {
    if (!options) return

    setIsLoading(true)
    try {
      await options.onConfirm()
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }, [options])

  const ConfirmationDialog = useCallback(() => {
    if (!options) return null

    return (
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        type={options.type}
        isLoading={isLoading}
      />
    )
  }, [isOpen, isLoading, options, handleClose, handleConfirm])

  return {
    confirm,
    ConfirmationDialog,
    isOpen,
    isLoading,
  }
}

export default ConfirmationModal
