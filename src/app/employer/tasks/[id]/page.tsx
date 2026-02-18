'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import {
  ArrowLeft,
  ArrowRight,
  User,
  Briefcase,
  CalendarDays,
  Clock,
  Star,
  DollarSign,
  CheckCircle2,
  XCircle,
  Send,
  AlertCircle,
  Loader2,
} from 'lucide-react'

// ── Inline types ─────────────────────────────────────────────
interface TaskFlowDetail {
  id: string
  shiftId: string
  shiftTitle: string
  shiftDescription?: string
  shiftDate: string
  shiftStartTime: string
  shiftEndTime: string
  shiftBaseRate: number
  workerId: string
  workerName: string
  workerPhotoUrl?: string
  workerRating: number
  workerSpecialization: string
  status: string
  appliedAt: string
  approvedAt?: string
  startedAt?: string
  completedAt?: string
  paidAt?: string
  agreedRate: number
  hoursWorked?: number
  totalAmount?: number
  workerReviewRating?: number
  workerReviewText?: string
  employerReviewRating?: number
  employerReviewText?: string
}

// ── Status badge helper ──────────────────────────────────────
const statusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'applied':
      return { bg: 'bg-blue-100', text: 'text-blue-700' }
    case 'reviewing':
      return { bg: 'bg-amber-100', text: 'text-amber-700' }
    case 'approved':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
    case 'rejected':
      return { bg: 'bg-red-100', text: 'text-red-600' }
    case 'upcoming':
      return { bg: 'bg-indigo-100', text: 'text-indigo-700' }
    case 'in_progress':
      return { bg: 'bg-blue-100', text: 'text-blue-700' }
    case 'completed':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
    case 'awaiting_review':
      return { bg: 'bg-amber-100', text: 'text-amber-700' }
    case 'reviewed':
      return { bg: 'bg-violet-100', text: 'text-violet-700' }
    case 'payment_pending':
      return { bg: 'bg-amber-100', text: 'text-amber-700' }
    case 'paid':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
    case 'cancelled':
      return { bg: 'bg-neutral-100', text: 'text-neutral-500' }
    case 'disputed':
      return { bg: 'bg-red-100', text: 'text-red-600' }
    default:
      return { bg: 'bg-neutral-100', text: 'text-neutral-500' }
  }
}

// ── Progress steps ───────────────────────────────────────────
const PROGRESS_STEPS = [
  'applied',
  'reviewing',
  'approved',
  'in_progress',
  'completed',
  'reviewed',
  'paid',
]

function getProgressPercent(status: string): number {
  const idx = PROGRESS_STEPS.indexOf(status.toLowerCase())
  if (idx === -1) return 0
  return Math.round(((idx + 1) / PROGRESS_STEPS.length) * 100)
}

// ── Main component ───────────────────────────────────────────
export default function EmployerTaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string
  const { language, isRTL } = useUI()

  const [task, setTask] = useState<TaskFlowDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Review form state
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  const fetchTask = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/taskflow/${taskId}`)
      if (!res.ok) throw new Error('Failed to fetch task')
      const data = await res.json()
      setTask(data.task || null)
    } catch {
      setError('Failed to load task details')
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    if (taskId) fetchTask()
  }, [taskId, fetchTask])

  // ── Actions ────────────────────────────────────────────
  const handleApprove = async () => {
    if (!task) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/taskflow/${task.id}/approve`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      await fetchTask()
    } catch {
      setError('Failed to approve')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!task) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/taskflow/${task.id}/reject`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      await fetchTask()
    } catch {
      setError('Failed to reject')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!task || reviewRating === 0) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/taskflow/${task.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          text: reviewText,
          role: 'employer',
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setShowReviewForm(false)
      await fetchTask()
    } catch {
      setError('Failed to submit review')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReleasePayment = async () => {
    if (!task) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/taskflow/${task.id}/release-payment`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed')
      await fetchTask()
    } catch {
      setError('Failed to release payment')
    } finally {
      setActionLoading(false)
    }
  }

  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  // ── Loading skeleton ───────────────────────────────────
  if (loading) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-neutral-200 animate-pulse" />
          <div className="h-6 w-40 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="bg-white rounded-2xl p-6 animate-pulse space-y-4">
          <div className="h-5 w-48 bg-neutral-200 rounded" />
          <div className="h-4 w-32 bg-neutral-200 rounded" />
          <div className="h-3 w-full bg-neutral-200 rounded" />
          <div className="h-4 w-24 bg-neutral-200 rounded" />
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────
  if (error && !task) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="px-4 pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-600 mb-6"
        >
          <BackIcon className="w-5 h-5" />
          <span className="font-medium">{t('common.back', language)}</span>
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      </div>
    )
  }

  if (!task) return null

  const badge = statusBadge(task.status)
  const progress = getProgressPercent(task.status)
  const statusLower = task.status.toLowerCase()

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="px-4 pt-6 pb-8">
      {/* ── Back button ──────────────────────────────── */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-neutral-600 mb-6"
      >
        <BackIcon className="w-5 h-5" />
        <span className="font-medium">{t('common.back', language)}</span>
      </button>

      {/* ── Error banner ─────────────────────────────── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 flex items-center gap-2 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      {/* ── Shift Info Card ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 shadow-sm mb-4"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg font-bold text-neutral-900">{task.shiftTitle}</h2>
          </div>
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
              badge.bg,
              badge.text
            )}
          >
            {task.status.replace('_', ' ')}
          </span>
        </div>

        {task.shiftDescription && (
          <p className="text-sm text-neutral-600 mb-3">{task.shiftDescription}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {task.shiftDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {task.shiftStartTime} - {task.shiftEndTime}
          </span>
          <span className="font-semibold text-brand-primary">
            {'\u20AA'}{task.shiftBaseRate}/hr
          </span>
        </div>
      </motion.div>

      {/* ── Worker Info Card ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl p-5 shadow-sm mb-4"
      >
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Worker
        </h3>
        <div className="flex items-center gap-3">
          {task.workerPhotoUrl ? (
            <img
              src={task.workerPhotoUrl}
              alt={task.workerName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-brand-primary" />
            </div>
          )}
          <div>
            <p className="font-semibold text-neutral-900">{task.workerName}</p>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
              <span className="flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {task.workerRating.toFixed(1)}
              </span>
              <span>{task.workerSpecialization}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Progress Bar ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-5 shadow-sm mb-4"
      >
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Progress
        </h3>
        <div className="w-full bg-neutral-100 rounded-full h-2.5 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="bg-brand-primary h-2.5 rounded-full"
          />
        </div>
        <p className="text-xs text-neutral-500 text-right">{progress}%</p>

        {/* Timeline */}
        <div className="mt-4 space-y-2 text-xs text-neutral-500">
          {task.appliedAt && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Applied: {task.appliedAt}</span>
            </div>
          )}
          {task.approvedAt && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Approved: {task.approvedAt}</span>
            </div>
          )}
          {task.startedAt && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Started: {task.startedAt}</span>
            </div>
          )}
          {task.completedAt && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Completed: {task.completedAt}</span>
            </div>
          )}
          {task.paidAt && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Paid: {task.paidAt}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Payment Info ──────────────────────────────── */}
      {(task.hoursWorked || task.totalAmount) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-5 shadow-sm mb-4"
        >
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Payment
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-neutral-400">Rate</p>
              <p className="font-semibold text-neutral-900">
                {'\u20AA'}{task.agreedRate}/hr
              </p>
            </div>
            {task.hoursWorked !== undefined && (
              <div>
                <p className="text-xs text-neutral-400">Hours</p>
                <p className="font-semibold text-neutral-900">{task.hoursWorked}h</p>
              </div>
            )}
            {task.totalAmount !== undefined && (
              <div>
                <p className="text-xs text-neutral-400">Total</p>
                <p className="font-bold text-brand-primary text-lg">
                  {'\u20AA'}{task.totalAmount.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Existing review ───────────────────────────── */}
      {task.employerReviewRating && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm mb-4"
        >
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Your Review
          </h3>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-5 h-5',
                  star <= (task.employerReviewRating || 0)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-neutral-200'
                )}
              />
            ))}
          </div>
          {task.employerReviewText && (
            <p className="text-sm text-neutral-600">{task.employerReviewText}</p>
          )}
        </motion.div>
      )}

      {/* ── Actions ───────────────────────────────────── */}
      <div className="space-y-3 mt-6">
        {/* REVIEWING → Approve / Reject */}
        {statusLower === 'reviewing' && (
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={actionLoading}
              onClick={handleApprove}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white',
                'bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50'
              )}
            >
              {actionLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              Approve
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={actionLoading}
              onClick={handleReject}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold',
                'bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50'
              )}
            >
              {actionLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              Reject
            </motion.button>
          </div>
        )}

        {/* COMPLETED → Leave Review */}
        {statusLower === 'completed' && !task.employerReviewRating && (
          <>
            {!showReviewForm ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowReviewForm(true)}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white',
                  'bg-brand-primary hover:bg-brand-primary/90 transition-colors'
                )}
              >
                <Star className="w-5 h-5" />
                Leave Review
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-sm"
              >
                <h3 className="font-semibold text-neutral-900 mb-4">
                  Rate this worker
                </h3>

                {/* Star selector */}
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          'w-8 h-8',
                          star <= reviewRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-200 hover:text-amber-200'
                        )}
                      />
                    </button>
                  ))}
                </div>

                {/* Text input */}
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this worker..."
                  rows={3}
                  className={cn(
                    'w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary',
                    'resize-none placeholder:text-neutral-400'
                  )}
                />

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 font-medium text-sm"
                  >
                    {t('common.cancel', language)}
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={actionLoading || reviewRating === 0}
                    onClick={handleSubmitReview}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white text-sm',
                      'bg-brand-primary hover:bg-brand-primary/90 transition-colors disabled:opacity-50'
                    )}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Submit
                  </motion.button>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* REVIEWED → Release Payment */}
        {statusLower === 'reviewed' && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={actionLoading}
            onClick={handleReleasePayment}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white',
              'bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50',
              'shadow-lg shadow-emerald-500/25'
            )}
          >
            {actionLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <DollarSign className="w-5 h-5" />
            )}
            Release Payment
            {task.totalAmount ? ` (${'\u20AA'}${task.totalAmount.toLocaleString()})` : ''}
          </motion.button>
        )}
      </div>
    </div>
  )
}
