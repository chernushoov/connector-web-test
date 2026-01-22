'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { Card } from '@/components/ui/Card'
import {
  Briefcase,
  Clock,
  DollarSign,
  Star,
  Users,
  TrendingUp
} from 'lucide-react'
import type { WorkerProfile, EmployerProfile } from '@/types'

interface StatsGridProps {
  profile: WorkerProfile | EmployerProfile | null
  className?: string
}

export function StatsGrid({ profile, className }: StatsGridProps) {
  const { language, isRTL } = useUI()

  if (!profile) return null

  const isWorker = 'completedShifts' in profile && 'totalEarned' in profile

  const workerStats = isWorker ? [
    {
      icon: <Briefcase className="w-5 h-5" />,
      label: t('profile.shifts.completed', language as any),
      value: (profile as WorkerProfile).completedShifts,
      color: 'text-brand-primary',
      bgColor: 'bg-brand-primary/10',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: t('profile.hours.worked', language as any),
      value: `${(profile as WorkerProfile).totalHours}h`,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: t('profile.earned', language as any),
      value: `₪${(profile as WorkerProfile).totalEarned.toLocaleString()}`,
      color: 'text-brand-accent',
      bgColor: 'bg-brand-accent/10',
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: t('profile.rating', language as any),
      value: profile.rating.toFixed(1),
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ] : []

  const employerStats = !isWorker ? [
    {
      icon: <Briefcase className="w-5 h-5" />,
      label: 'Shifts posted',
      value: (profile as EmployerProfile).shiftsPosted,
      color: 'text-brand-primary',
      bgColor: 'bg-brand-primary/10',
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Shifts completed',
      value: (profile as EmployerProfile).shiftsCompleted,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: 'Total paid',
      value: `₪${(profile as EmployerProfile).totalPaid.toLocaleString()}`,
      color: 'text-brand-accent',
      bgColor: 'bg-brand-accent/10',
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: t('profile.rating', language as any),
      value: profile.rating.toFixed(1),
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ] : []

  const stats = isWorker ? workerStats : employerStats

  return (
    <div
      className={cn('grid grid-cols-2 gap-3', className)}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card variant="outlined" className="flex items-center gap-3">
            <div className={cn('p-2 rounded-xl', stat.bgColor, stat.color)}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-neutral-500">{stat.label}</p>
              <p className="text-lg font-bold text-neutral-900">{stat.value}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default StatsGrid
