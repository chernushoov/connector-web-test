'use client'

import { useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'

interface InfiniteListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
  isLoading?: boolean
  isLoadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  onRefresh?: () => void
  emptyType?: 'no-results' | 'no-workers' | 'no-tasks' | 'no-shifts'
  emptyTitle?: string
  emptySubtitle?: string
  emptyAction?: {
    label: string
    onClick: () => void
  }
  error?: Error | null
  onRetry?: () => void
  className?: string
  itemClassName?: string
  gap?: number
  columns?: 1 | 2 | 3
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function InfiniteList<T>({
  items,
  renderItem,
  keyExtractor,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  onRefresh,
  emptyType = 'no-results',
  emptyTitle,
  emptySubtitle,
  emptyAction,
  error,
  onRetry,
  className,
  itemClassName,
  gap = 3,
  columns = 1,
  header,
  footer,
}: InfiniteListProps<T>) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Set up intersection observer for infinite scroll
  const setupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    if (!hasMore || !onLoadMore || isLoadingMore) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }
  }, [hasMore, onLoadMore, isLoadingMore])

  useEffect(() => {
    setupObserver()
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [setupObserver])

  // Initial loading state
  if (isLoading && items.length === 0) {
    return <LoadingState variant="skeleton" className={className} />
  }

  // Error state
  if (error && items.length === 0) {
    return (
      <ErrorState
        type="generic"
        message={error.message}
        onRetry={onRetry}
        className={className}
      />
    )
  }

  // Empty state
  if (!isLoading && items.length === 0) {
    return (
      <EmptyState
        type={emptyType}
        title={emptyTitle}
        subtitle={emptySubtitle}
        action={emptyAction}
        className={className}
      />
    )
  }

  const gridClasses = cn(
    'grid',
    columns === 1 && 'grid-cols-1',
    columns === 2 && 'grid-cols-2',
    columns === 3 && 'grid-cols-3',
    `gap-${gap}`
  )

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      {header}

      {/* Items */}
      <div className={gridClasses}>
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={keyExtractor(item, index)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className={itemClassName}
            >
              {renderItem(item, index)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="w-full h-1" />

      {/* Loading more indicator */}
      {isLoadingMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-4"
        >
          <LoadingState size="sm" variant="dots" />
        </motion.div>
      )}

      {/* Footer */}
      {footer}

      {/* End of list indicator */}
      {!hasMore && items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-6 text-center text-sm text-neutral-400"
        >
          {/* No more items */}
        </motion.div>
      )}
    </div>
  )
}

// Virtual list for very large datasets
export function VirtualList<T>({
  items,
  renderItem,
  keyExtractor,
  itemHeight,
  overscan = 5,
  className,
}: {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
  itemHeight: number
  overscan?: number
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollTop(container.scrollTop)
    }

    const handleResize = () => {
      setContainerHeight(container.clientHeight)
    }

    handleResize()
    container.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const totalHeight = items.length * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={keyExtractor(item, startIndex + index)}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Need to import useState for VirtualList
import { useState } from 'react'

export default InfiniteList
