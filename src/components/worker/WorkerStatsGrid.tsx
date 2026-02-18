'use client'

import { cn, formatMoney } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  DollarSign,
  Clock,
  Briefcase,
  Star,
  CheckCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'

// ============================================
// WORKER STATS PROPS
// ============================================

export interface WorkerStats {
  totalEarned: number
  totalHours: number
  totalShifts: number
  avgRating: number
  activeTasks: number
}

export interface WorkerStatsGridProps {
  stats: WorkerStats
  className?: string
}

// ============================================
// STAT ITEMS CONFIG
// ============================================

function getStatItems(stats: WorkerStats) {
  return [
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: 'Total Earned',
      value: formatMoney(stats.totalEarned),
      color: 'text-brand-accent',
      bgColor: 'bg-brand-accent/10',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'Hours Worked',
      value: `${stats.totalHours}h`,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: <Briefcase className="w-5 h-5" />,
      label: 'Shifts Done',
      value: String(stats.totalShifts),
      color: 'text-brand-primary',
      bgColor: 'bg-brand-primary/10',
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: 'Avg Rating',
      value: stats.avgRating.toFixed(1),
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ]
}

// ============================================
// WORKER STATS GRID COMPONENT
// ============================================

export function WorkerStatsGrid({ stats, className }: WorkerStatsGridProps) {
  const items = getStatItems(stats)

  return (
    <div className={cn('space-y-3', className)}>
      {/* Active tasks banner */}
      {stats.activeTasks > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/10"
        >
          <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">
              {stats.activeTasks} Active Task{stats.activeTasks !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-neutral-500">Currently in progress</p>
          </div>
        </motion.div>
      )}

      {/* 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card variant="outlined" className="flex items-center gap-3">
              <div className={cn('p-2 rounded-xl', item.bgColor, item.color)}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm text-neutral-500">{item.label}</p>
                <p className="text-lg font-bold text-neutral-900">{item.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default WorkerStatsGrid
