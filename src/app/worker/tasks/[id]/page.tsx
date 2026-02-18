'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Building2,
  Star,
  Play,
  CheckCircle2,
  MessageSquare,
  DollarSign,
  Send,
  Loader2,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { cn } from '@/lib/utils'

// ---------------------
// Inline types
// ---------------------

type TaskFlowStatus =
  | 'applied'
  | 'reviewing'
  | 'approved'
  | 'upcoming'
  | 'in_progress'
  | 'completed'
  | 'awaiting_review'
  | 'reviewed'
  | 'payment_pending'
  | 'paid'
  | 'rejected'
  | 'cancelled'
  | 'disputed'

interface TaskFlowDetail {
  id: string
  shiftTitle: string
  shiftDescription: string
  employerName: string
  employerCompany: string
  location: string
  cityCode: string
  date: string
  startTime: string
  endTime: string
  agreedRate: number
  surgeMultiplier: number
  status: TaskFlowStatus
  currentStep: number
  totalSteps: number
  payment: {
    amount: number
    hoursWorked: number
    status: string
    paidAt: string | null
  } | null
  review: {
    rating: number
    text: string
    createdAt: string
  } | null
}

// 13-step flow labels
const FLOW_STEPS = [
  'Applied',
  'Reviewing',
  'Approved',
  'Upcoming',
  'Check-in',
  'In Progress',
  'Check-out',
  'Completed',
  'Employer Review',
  'Worker Review',
  'Payment Calc',
  'Payment Pending',
  'Paid',
]

const STATUS_STEP_MAP: Record<string, number> = {
  applied: 1,
  reviewing: 2,
  approved: 3,
  upcoming: 4,
  in_progress: 6,
  completed: 8,
  awaiting_review: 9,
  reviewed: 10,
  payment_pending: 12,
  paid: 13,
  rejected: 0,
  cancelled: 0,
  disputed: 0,
}

// ---------------------
// Page
// ---------------------

export default function WorkerTaskDetailPage() {
  const { language, isRTL } = useUI()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [task, setTask] = useState<TaskFlowDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/taskflow/${id}`)
        const json = await res.json()
        setTask(json.data || null)
      } catch (e) {
        console.error('Failed to fetch task:', e)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchTask()
  }, [id])

  const handleStatusUpdate = async (newStatus: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/taskflow/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (json.data) {
        setTask(json.data)
      }
    } catch (e) {
      console.error('Failed to update status:', e)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    setSubmittingReview(true)
    try {
      const res = await fetch(`/api/taskflow/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, text: reviewText }),
      })
      const json = await res.json()
      if (json.data) {
        setTask(json.data)
      }
      setShowReviewForm(false)
    } catch (e) {
      console.error('Failed to submit review:', e)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50">
        <div className="px-4 pt-4">
          <div className="h-8 w-8 bg-neutral-200 rounded-full animate-pulse mb-4" />
          <div className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-neutral-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-neutral-100 rounded w-1/2 mb-3" />
            <div className="h-4 bg-neutral-100 rounded w-2/3 mb-3" />
            <div className="h-4 bg-neutral-100 rounded w-1/3 mb-6" />
            <div className="h-2 bg-neutral-100 rounded w-full mb-2" />
            <div className="grid grid-cols-13 gap-1">
              {Array.from({ length: 13 }).map((_, i) => (
                <div key={i} className="h-6 bg-neutral-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 font-medium">{t('error.generic', language)}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-xl text-sm"
          >
            {t('common.back', language)}
          </button>
        </div>
      </div>
    )
  }

  const effectiveRate = Math.round(task.agreedRate * (task.surgeMultiplier || 1))
  const activeStep = task.currentStep || STATUS_STEP_MAP[task.status] || 1

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50 pb-8">
      {/* Back button */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-neutral-200 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">{t('common.back', language)}</span>
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Shift Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-neutral-900">{task.shiftTitle}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                <Building2 className="w-4 h-4" />
                <span>{task.employerName}</span>
                {task.employerCompany && (
                  <>
                    <span className="text-neutral-300">|</span>
                    <span>{task.employerCompany}</span>
                  </>
                )}
              </div>
            </div>
            <StatusBadge status={task.status} />
          </div>

          {task.shiftDescription && (
            <p className="text-sm text-neutral-600 mb-3">{task.shiftDescription}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-neutral-500">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{task.location || task.cityCode}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-500">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{task.date}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-500">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{task.startTime} - {task.endTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 flex-shrink-0 text-brand-primary" />
              <span className="font-semibold text-brand-primary">
                {'\u20AA'}{effectiveRate}/h
              </span>
              {task.surgeMultiplier > 1 && (
                <span className="text-xs text-amber-600 font-medium">
                  +{Math.round((task.surgeMultiplier - 1) * 100)}%
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* 13-Step Progress Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100"
        >
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
            TaskFlow Progress
          </h2>

          <div className="space-y-0">
            {FLOW_STEPS.map((step, index) => {
              const stepNum = index + 1
              const isCompleted = stepNum < activeStep
              const isCurrent = stepNum === activeStep
              const isFuture = stepNum > activeStep

              return (
                <div key={step} className="flex items-start gap-3">
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border-2 flex-shrink-0',
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isCurrent
                            ? 'bg-brand-primary border-brand-primary text-white'
                            : 'bg-white border-neutral-200 text-neutral-400'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        stepNum
                      )}
                    </div>
                    {index < FLOW_STEPS.length - 1 && (
                      <div
                        className={cn(
                          'w-0.5 h-6',
                          isCompleted ? 'bg-green-500' : 'bg-neutral-200'
                        )}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div className={cn('pt-0.5 pb-4', isFuture && 'opacity-40')}>
                    <span
                      className={cn(
                        'text-sm',
                        isCurrent
                          ? 'font-semibold text-brand-primary'
                          : isCompleted
                            ? 'text-neutral-700'
                            : 'text-neutral-400'
                      )}
                    >
                      {step}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Action Buttons */}
        {(task.status === 'approved' || task.status === 'upcoming') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => handleStatusUpdate('IN_PROGRESS')}
              disabled={actionLoading}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Work
                </>
              )}
            </button>
          </motion.div>
        )}

        {task.status === 'in_progress' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => handleStatusUpdate('COMPLETED')}
              disabled={actionLoading}
              className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Complete
                </>
              )}
            </button>
          </motion.div>
        )}

        {task.status === 'awaiting_review' && !task.review && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {!showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                Leave Review
              </button>
            ) : (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 space-y-4">
                <h3 className="font-semibold text-neutral-900">
                  Rate Your Employer
                </h3>

                {/* Star Rating */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-0.5"
                    >
                      <Star
                        className={cn(
                          'w-8 h-8 transition-colors',
                          star <= reviewRating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-neutral-200'
                        )}
                      />
                    </button>
                  ))}
                </div>

                {/* Review Text */}
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 py-2.5 bg-neutral-100 text-neutral-600 rounded-xl text-sm font-medium"
                  >
                    {t('common.cancel', language)}
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="flex-1 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submittingReview ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Existing Review */}
        {task.review && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100"
          >
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              Your Review
            </h3>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-5 h-5',
                    star <= task.review!.rating
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-neutral-200'
                  )}
                />
              ))}
            </div>
            {task.review.text && (
              <p className="text-sm text-neutral-600">{task.review.text}</p>
            )}
          </motion.div>
        )}

        {/* Payment Info */}
        {task.payment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100"
          >
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              Payment
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-neutral-400">Total Amount</p>
                <p className="text-xl font-bold text-green-600">
                  {'\u20AA'}{task.payment.amount}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Hours Worked</p>
                <p className="text-xl font-bold text-neutral-900">
                  {task.payment.hoursWorked}h
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Status</p>
                <span
                  className={cn(
                    'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                    task.payment.status === 'paid'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  )}
                >
                  {task.payment.status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
              {task.payment.paidAt && (
                <div>
                  <p className="text-xs text-neutral-400">Paid At</p>
                  <p className="text-sm text-neutral-700">{task.payment.paidAt}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ---------------------
// StatusBadge
// ---------------------

function StatusBadge({ status }: { status: TaskFlowStatus }) {
  const config: Record<string, { bg: string; text: string }> = {
    applied: { bg: 'bg-blue-50', text: 'text-blue-700' },
    reviewing: { bg: 'bg-blue-50', text: 'text-blue-700' },
    approved: { bg: 'bg-green-50', text: 'text-green-700' },
    upcoming: { bg: 'bg-green-50', text: 'text-green-700' },
    in_progress: { bg: 'bg-amber-50', text: 'text-amber-700' },
    completed: { bg: 'bg-neutral-100', text: 'text-neutral-700' },
    awaiting_review: { bg: 'bg-amber-50', text: 'text-amber-700' },
    reviewed: { bg: 'bg-neutral-100', text: 'text-neutral-700' },
    payment_pending: { bg: 'bg-green-50', text: 'text-green-700' },
    paid: { bg: 'bg-green-50', text: 'text-green-700' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700' },
    disputed: { bg: 'bg-red-50', text: 'text-red-700' },
  }

  const c = config[status] || config.applied
  const labels: Record<string, string> = {
    applied: 'Applied',
    reviewing: 'Reviewing',
    approved: 'Approved',
    upcoming: 'Upcoming',
    in_progress: 'In Progress',
    completed: 'Completed',
    awaiting_review: 'Awaiting Review',
    reviewed: 'Reviewed',
    payment_pending: 'Payment Pending',
    paid: 'Paid',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    disputed: 'Disputed',
  }

  return (
    <span
      className={cn(
        'px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0',
        c.bg,
        c.text
      )}
    >
      {labels[status] || status}
    </span>
  )
}
