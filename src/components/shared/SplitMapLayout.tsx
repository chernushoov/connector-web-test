'use client'

import { useState, useRef, useCallback, ReactNode } from 'react'
import { motion, useMotionValue, PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GripHorizontal, ChevronUp, ChevronDown } from 'lucide-react'

interface SplitMapLayoutProps {
  mapContent: ReactNode
  listContent: ReactNode
  className?: string
  initialSplit?: number // 0-100, percent for map
  minMapHeight?: number // minimum map height in vh
  maxMapHeight?: number // maximum map height in vh
}

export function SplitMapLayout({
  mapContent,
  listContent,
  className,
  initialSplit = 40,
  minMapHeight = 20,
  maxMapHeight = 70,
}: SplitMapLayoutProps) {
  const [mapPercent, setMapPercent] = useState(initialSplit)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const y = useMotionValue(0)

  const handleDrag = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!containerRef.current) return

      const containerHeight = containerRef.current.offsetHeight
      const deltaPercent = (info.delta.y / containerHeight) * 100

      setMapPercent((prev) => {
        const newPercent = prev + deltaPercent
        return Math.max(minMapHeight, Math.min(maxMapHeight, newPercent))
      })
    },
    [minMapHeight, maxMapHeight]
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    y.set(0)
  }, [y])

  const toggleExpand = useCallback(() => {
    setMapPercent((prev) => {
      // Snap to collapsed or expanded
      if (prev > 50) {
        return minMapHeight // Collapse map, expand list
      } else {
        return maxMapHeight // Expand map
      }
    })
  }, [minMapHeight, maxMapHeight])

  const isMapExpanded = mapPercent > 50

  return (
    <div
      ref={containerRef}
      className={cn('flex flex-col h-[calc(100vh-64px)] overflow-hidden', className)}
    >
      {/* Map Section */}
      <motion.div
        className="relative flex-shrink-0 overflow-hidden"
        style={{ height: `${mapPercent}%` }}
        animate={{ height: `${mapPercent}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {mapContent}
      </motion.div>

      {/* Drag Handle */}
      <motion.div
        className={cn(
          'relative flex items-center justify-center',
          'h-6 bg-white border-y border-neutral-200',
          'cursor-grab active:cursor-grabbing',
          'touch-none select-none',
          isDragging && 'bg-neutral-50'
        )}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0}
        onDrag={handleDrag}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ y }}
      >
        {/* Grip indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleExpand}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label={isMapExpanded ? 'Collapse map' : 'Expand map'}
          >
            {isMapExpanded ? (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            )}
          </button>
          <GripHorizontal className="w-5 h-5 text-neutral-300" />
          <div className="w-8 h-1 bg-neutral-300 rounded-full" />
        </div>
      </motion.div>

      {/* List Section */}
      <motion.div
        className="flex-1 overflow-y-auto bg-neutral-50"
        style={{ height: `${100 - mapPercent}%` }}
      >
        {listContent}
      </motion.div>
    </div>
  )
}

// Mini version for pages that don't need full split
export function CompactMapHeader({
  mapContent,
  height = '200px',
  className,
}: {
  mapContent: ReactNode
  height?: string
  className?: string
}) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-b-2xl shadow-md', className)}
      style={{ height }}
    >
      {mapContent}
    </div>
  )
}

export default SplitMapLayout
