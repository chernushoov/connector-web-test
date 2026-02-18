'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  FileText,
  CreditCard,
  Car,
  File,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { DocumentType, VerificationStatus } from '@/types'

// ============================================
// DOCUMENT ROW PROPS
// ============================================

export interface DocumentRowData {
  id: string
  type: DocumentType
  imageUrl?: string
  status: VerificationStatus
}

export interface DocumentRowProps {
  doc: DocumentRowData
  onDelete?: (id: string) => void
  className?: string
}

// ============================================
// TYPE CONFIG
// ============================================

const TYPE_CONFIG: Record<DocumentType, { label: string; icon: React.ReactNode }> = {
  passport: {
    label: 'Passport',
    icon: <FileText className="w-5 h-5" />,
  },
  work_permit: {
    label: 'Work Permit',
    icon: <CreditCard className="w-5 h-5" />,
  },
  driver_license: {
    label: "Driver's License",
    icon: <Car className="w-5 h-5" />,
  },
  other: {
    label: 'Other Document',
    icon: <File className="w-5 h-5" />,
  },
}

// ============================================
// VERIFICATION STATUS CONFIG
// ============================================

const STATUS_CONFIG: Record<
  VerificationStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral'; icon: React.ReactNode }
> = {
  verified: {
    label: 'Verified',
    variant: 'success',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  pending: {
    label: 'Pending',
    variant: 'warning',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  rejected: {
    label: 'Rejected',
    variant: 'danger',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  unverified: {
    label: 'Not Verified',
    variant: 'neutral',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
}

// ============================================
// DOCUMENT ROW COMPONENT
// ============================================

export function DocumentRow({ doc, onDelete, className }: DocumentRowProps) {
  const typeConfig = TYPE_CONFIG[doc.type]
  const statusConfig = STATUS_CONFIG[doc.status]

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-100',
        'hover:bg-neutral-50 transition-colors',
        className
      )}
    >
      {/* Type icon */}
      <div className="p-2 bg-neutral-100 rounded-lg text-neutral-600 flex-shrink-0">
        {typeConfig.icon}
      </div>

      {/* Type label */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-900 text-sm">{typeConfig.label}</p>
      </div>

      {/* Verification status badge */}
      <Badge variant={statusConfig.variant} size="sm">
        {statusConfig.label}
      </Badge>

      {/* Delete button */}
      {onDelete && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => onDelete(doc.id)}
          className="p-1.5 text-neutral-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  )
}

export default DocumentRow
