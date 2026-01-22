'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion'

// ============================================
// BOTTOM SHEET PROPS
// ============================================

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  // Snap points (0-1, where 1 is full screen)
  snapPoints?: number[]
  initialSnap?: number
  // Options
  showHandle?: boolean
  showOverlay?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

// ============================================
// BOTTOM SHEET COMPONENT
// ============================================

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.5, 0.9],
  initialSnap = 0,
  showHandle = true,
  showOverlay = true,
  closeOnOverlayClick = true,
  className,
}: BottomSheetProps) {
  const dragControls = useDragControls()
  const sheetRef = useRef<HTMLDivElement>(null)

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

  // Handle drag end
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 100
    const velocity = info.velocity.y

    if (info.offset.y > threshold || velocity > 500) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOnOverlayClick ? onClose : undefined}
              className="fixed inset-0 bg-black/50 z-40"
            />
          )}

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50',
              'bg-white rounded-t-3xl shadow-2xl',
              'max-h-[90vh] overflow-hidden',
              'safe-bottom',
              className
            )}
          >
            {/* Handle */}
            {showHandle && (
              <div
                className="py-3 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto" />
              </div>
            )}

            {/* Header */}
            {title && (
              <div className="px-5 pb-3 border-b border-neutral-100">
                <h2 className="text-lg font-semibold text-center">{title}</h2>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================
// BOTTOM SHEET CONTENT HELPERS
// ============================================

export function BottomSheetContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('p-5', className)}>{children}</div>
}

export function BottomSheetActions({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'p-5 pt-0 flex flex-col gap-3 safe-bottom',
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================
// ACTION SHEET (Quick actions bottom sheet)
// ============================================

export interface ActionSheetOption {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

export interface ActionSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  options: ActionSheetOption[]
}

export function ActionSheet({
  isOpen,
  onClose,
  title,
  options,
}: ActionSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => {
              option.onClick()
              onClose()
            }}
            disabled={option.disabled}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
              'transition-colors text-left',
              option.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-neutral-100 active:bg-neutral-200',
              option.variant === 'danger' && 'text-danger'
            )}
          >
            {option.icon && (
              <span className="flex-shrink-0 text-neutral-500">
                {option.icon}
              </span>
            )}
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>

      {/* Cancel button */}
      <div className="p-2 pt-0 safe-bottom">
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-neutral-100 font-semibold
                     hover:bg-neutral-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </BottomSheet>
  )
}
