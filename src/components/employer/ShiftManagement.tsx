'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  MapPin,
  Clock,
  Users,
  DollarSign,
  Edit2,
  Trash2,
  Share2,
  Copy,
  Eye,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Pause,
  Play
} from 'lucide-react'
import type { ShiftPosting, ShiftStatus } from '@/types'

interface ShiftManagementProps {
  shift: ShiftPosting
  onEdit?: () => void
  onDelete?: () => void
  onShare?: () => void
  onDuplicate?: () => void
  onViewApplicants?: () => void
  className?: string
}

const statusConfig: Record<ShiftStatus, {
  label: string
  color: string
  bgColor: string
  icon: React.ReactNode
}> = {
  open: {
    label: 'Open',
    color: 'text-success',
    bgColor: 'bg-success/10',
    icon: <Play className="w-4 h-4" />
  },
  matched: {
    label: 'Matched',
    color: 'text-brand-primary',
    bgColor: 'bg-brand-primary/10',
    icon: <CheckCircle2 className="w-4 h-4" />
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-success',
    bgColor: 'bg-success/10',
    icon: <Play className="w-4 h-4" />
  },
  completed: {
    label: 'Completed',
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
    icon: <CheckCircle2 className="w-4 h-4" />
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-danger',
    bgColor: 'bg-danger/10',
    icon: <AlertCircle className="w-4 h-4" />
  },
}

export function ShiftManagement({
  shift,
  onEdit,
  onDelete,
  onShare,
  onDuplicate,
  onViewApplicants,
  className
}: ShiftManagementProps) {
  const { language, isRTL } = useUI()
  const { updateShift, deleteShift } = useConnectorStore()

  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const status = statusConfig[shift.status]
  const slotsLeft = shift.slots - shift.filled
  const fillPercent = (shift.filled / shift.slots) * 100

  const handlePauseResume = async () => {
    await updateShift(shift.id, {
      status: shift.status === 'open' ? 'cancelled' : 'open'
    })
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this shift?')) {
      setIsDeleting(true)
      await deleteShift(shift.id)
      setIsDeleting(false)
      onDelete?.()
    }
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Status bar */}
      <div className={cn('flex items-center justify-between px-4 py-2', status.bgColor)}>
        <div className={cn('flex items-center gap-2', status.color)}>
          {status.icon}
          <span className="text-sm font-medium">{status.label}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Eye className="w-4 h-4 text-neutral-400" />
          <span className="text-neutral-600">{shift.viewCount} views</span>
        </div>
      </div>

      <div className="p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Title and menu */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-neutral-900">{shift.title}</h3>
            {shift.description && (
              <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                {shift.description}
              </p>
            )}
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    'absolute top-full mt-1 z-50',
                    isRTL ? 'left-0' : 'right-0',
                    'bg-white rounded-xl shadow-elevated',
                    'border border-neutral-100',
                    'overflow-hidden min-w-[160px]'
                  )}
                >
                  <MenuOption
                    icon={<Edit2 className="w-4 h-4" />}
                    label="Edit"
                    onClick={() => { setShowMenu(false); onEdit?.() }}
                  />
                  <MenuOption
                    icon={<Copy className="w-4 h-4" />}
                    label="Duplicate"
                    onClick={() => { setShowMenu(false); onDuplicate?.() }}
                  />
                  <MenuOption
                    icon={<Share2 className="w-4 h-4" />}
                    label="Share"
                    onClick={() => { setShowMenu(false); onShare?.() }}
                  />
                  <MenuOption
                    icon={shift.status === 'open' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    label={shift.status === 'open' ? 'Pause' : 'Resume'}
                    onClick={() => { setShowMenu(false); handlePauseResume() }}
                  />
                  <MenuOption
                    icon={<Trash2 className="w-4 h-4" />}
                    label="Delete"
                    danger
                    onClick={() => { setShowMenu(false); handleDelete() }}
                  />
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div className="flex items-center gap-2 text-neutral-600">
            <MapPin className="w-4 h-4 text-neutral-400" />
            <span>{shift.location.address || shift.city}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span>{shift.startTime} - {shift.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <DollarSign className="w-4 h-4 text-neutral-400" />
            <span>₪{shift.baseRate}/hr</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <Users className="w-4 h-4 text-neutral-400" />
            <span>{shift.filled}/{shift.slots} filled</span>
          </div>
        </div>

        {/* Fill progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-neutral-500">Spots filled</span>
            <span className="font-medium">{shift.filled}/{shift.slots}</span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-brand"
              initial={{ width: 0 }}
              animate={{ width: `${fillPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Applicants count */}
        {shift.applicants > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-brand-primary/5 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-brand-primary" />
              <span className="font-medium text-brand-primary">
                {shift.applicants} new applicants
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={onViewApplicants}
            >
              Review
            </Button>
          </motion.div>
        )}

        {/* Quick actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100">
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            leftIcon={<Share2 className="w-4 h-4" />}
            onClick={onShare}
          >
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            leftIcon={<Edit2 className="w-4 h-4" />}
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            leftIcon={<Users className="w-4 h-4" />}
            onClick={onViewApplicants}
          >
            Applicants
          </Button>
        </div>
      </div>
    </Card>
  )
}

function MenuOption({
  icon,
  label,
  onClick,
  danger
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3',
        'text-sm font-medium',
        'transition-colors duration-150',
        'hover:bg-neutral-50',
        danger ? 'text-danger' : 'text-neutral-700'
      )}
    >
      {icon}
      {label}
    </button>
  )
}

export default ShiftManagement
