'use client'

import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Image as ImageIcon } from 'lucide-react'

// ============================================
// PORTFOLIO SECTION PROPS
// ============================================

export interface PortfolioItem {
  id: string
  imageUrl: string
  caption?: string
}

export interface PortfolioSectionProps {
  items: PortfolioItem[]
  onAdd?: () => void
  onDelete?: (id: string) => void
  className?: string
}

// ============================================
// PORTFOLIO SECTION COMPONENT
// ============================================

export function PortfolioSection({
  items,
  onAdd,
  onDelete,
  className,
}: PortfolioSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">Portfolio</h3>
        <span className="text-sm text-neutral-500">{items.length} photos</span>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Existing items */}
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="relative aspect-square rounded-xl overflow-hidden group"
            >
              <img
                src={item.imageUrl}
                alt={item.caption || 'Portfolio image'}
                className="w-full h-full object-cover"
              />

              {/* Hover overlay with caption */}
              {item.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white truncate">{item.caption}</p>
                </div>
              )}

              {/* Delete button */}
              {onDelete && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className={cn(
                    'absolute top-1.5 right-1.5 p-1 rounded-full',
                    'bg-black/40 text-white backdrop-blur-sm',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'hover:bg-danger'
                  )}
                >
                  <X className="w-3 h-3" />
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add button */}
        {onAdd && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onAdd}
            className={cn(
              'aspect-square rounded-xl border-2 border-dashed border-neutral-200',
              'flex flex-col items-center justify-center gap-1',
              'text-neutral-400 hover:text-brand-primary hover:border-brand-primary',
              'transition-colors'
            )}
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs">Add</span>
          </motion.button>
        )}

        {/* Empty state placeholder */}
        {items.length === 0 && !onAdd && (
          <div className="col-span-3 py-8 text-center">
            <ImageIcon className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">No portfolio items yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PortfolioSection
