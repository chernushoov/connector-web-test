'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { ApplicantCard } from './ApplicantCard'
import { EmptyState, LoadingState } from '@/components/shared'
import type { TaskFlow } from '@/types'

interface ApplicantListProps {
  applications: TaskFlow[]
  isLoading?: boolean
  onApprove?: (applicationId: string) => void
  onReject?: (applicationId: string) => void
  onContact?: (applicationId: string) => void
  onViewProfile?: (applicationId: string) => void
  className?: string
}

export function ApplicantList({
  applications,
  isLoading,
  onApprove,
  onReject,
  onContact,
  onViewProfile,
  className
}: ApplicantListProps) {
  const { language, isRTL } = useUI()

  if (isLoading) {
    return <LoadingState variant="skeleton" className={className} />
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        type="no-applications"
        title="No applicants yet"
        subtitle="Share your shift to attract more workers"
        className={className}
      />
    )
  }

  // Group applications by status
  const pending = applications.filter(a => a.status === 'applied' || a.status === 'reviewing')
  const approved = applications.filter(a => a.status === 'approved' || a.status === 'upcoming')

  return (
    <div className={cn('space-y-6', className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Pending applications */}
      {pending.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-neutral-500 mb-3 px-1">
            Pending ({pending.length})
          </h3>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {pending.map((application, index) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ApplicantCard
                    application={application}
                    onApprove={() => onApprove?.(application.id)}
                    onReject={() => onReject?.(application.id)}
                    onContact={() => onContact?.(application.id)}
                    onViewProfile={() => onViewProfile?.(application.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Approved workers */}
      {approved.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-neutral-500 mb-3 px-1">
            Approved ({approved.length})
          </h3>
          <div className="space-y-3">
            {approved.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ApplicantCard
                  application={application}
                  onContact={() => onContact?.(application.id)}
                  onViewProfile={() => onViewProfile?.(application.id)}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ApplicantList
