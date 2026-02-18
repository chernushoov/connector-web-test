'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarDays,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Star,
  Car,
  Wrench,
  Zap,
  Edit3,
  Save,
  X,
  Trash2,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  AlertCircle,
  Loader2,
  User,
} from 'lucide-react'

// ── Inline types ─────────────────────────────────────────────
interface ShiftDetail {
  id: string
  title: string
  description?: string
  cityCode: string
  specialization?: string
  date: string
  startTime: string
  endTime: string
  baseRate: number
  slots: number
  filled: number
  status: string
  urgency: string
  lat: number
  lng: number
  requirements: {
    needsCar: boolean
    needsTools: boolean
    teamSize: number
    minRating: number
  }
  applicantCount: number
  createdAt: string
}

interface ShiftApplication {
  id: string
  workerId: string
  workerName: string
  workerPhotoUrl?: string
  workerRating: number
  workerSpecialization: string
  status: string
  appliedAt: string
}

// ── Status colors ────────────────────────────────────────────
const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-emerald-100 text-emerald-700'
    case 'matched':
    case 'in_progress':
      return 'bg-blue-100 text-blue-700'
    case 'completed':
      return 'bg-neutral-100 text-neutral-600'
    case 'cancelled':
      return 'bg-red-100 text-red-600'
    default:
      return 'bg-neutral-100 text-neutral-600'
  }
}

const appStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-amber-100 text-amber-700'
    case 'approved':
      return 'bg-emerald-100 text-emerald-700'
    case 'rejected':
      return 'bg-red-100 text-red-600'
    default:
      return 'bg-neutral-100 text-neutral-600'
  }
}

// ── Main component ───────────────────────────────────────────
export default function EmployerShiftDetailPage() {
  const router = useRouter()
  const params = useParams()
  const shiftId = params.id as string
  const { language, isRTL } = useUI()

  const [shift, setShift] = useState<ShiftDetail | null>(null)
  const [applications, setApplications] = useState<ShiftApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Edit mode
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    baseRate: 0,
    slots: 0,
  })

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  // ── Fetch shift ────────────────────────────────────────
  const fetchShift = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [shiftRes, appsRes] = await Promise.all([
        fetch(`/api/shifts/${shiftId}`),
        fetch(`/api/employer/applications?shiftId=${shiftId}`),
      ])

      if (!shiftRes.ok) throw new Error('Failed to fetch shift')

      const shiftData = await shiftRes.json()
      const appsData = appsRes.ok ? await appsRes.json() : { applications: [] }

      const shiftInfo = shiftData.shift || shiftData
      setShift(shiftInfo)
      setApplications(appsData.applications || [])
      setEditForm({
        title: shiftInfo.title || '',
        description: shiftInfo.description || '',
        baseRate: shiftInfo.baseRate || 0,
        slots: shiftInfo.slots || 0,
      })
    } catch {
      setError('Failed to load shift details')
    } finally {
      setLoading(false)
    }
  }, [shiftId])

  useEffect(() => {
    if (shiftId) fetchShift()
  }, [shiftId, fetchShift])

  // ── Actions ────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!shift) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/shifts/${shift.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error('Failed to update')
      setIsEditing(false)
      await fetchShift()
    } catch {
      setError('Failed to update shift')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!shift) return
    const newStatus = shift.status === 'open' ? 'cancelled' : 'open'
    setActionLoading(true)
    try {
      const res = await fetch(`/api/shifts/${shift.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed')
      await fetchShift()
    } catch {
      setError('Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!shift) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/shifts/${shift.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      router.push('/employer')
    } catch {
      setError('Failed to delete shift')
      setShowDeleteConfirm(false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleApplicationAction = async (
    appId: string,
    action: 'approve' | 'reject'
  ) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/employer/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'approve' ? 'approved' : 'rejected' }),
      })
      if (!res.ok) throw new Error('Failed')
      await fetchShift()
    } catch {
      setError(`Failed to ${action} application`)
    } finally {
      setActionLoading(false)
    }
  }

  // ── Loading skeleton ───────────────────────────────────
  if (loading) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-neutral-200 animate-pulse" />
          <div className="h-6 w-40 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-5 w-48 bg-neutral-200 rounded mb-3" />
              <div className="h-4 w-32 bg-neutral-200 rounded mb-2" />
              <div className="h-4 w-24 bg-neutral-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────
  if (error && !shift) {
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

  if (!shift) return null

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="px-4 pt-6 pb-8">
      {/* ── Back button ──────────────────────────────── */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-neutral-600 mb-4"
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

      {/* ── Shift Detail Card ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 shadow-sm mb-4"
      >
        <div className="flex items-start justify-between mb-3">
          {isEditing ? (
            <input
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, title: e.target.value }))
              }
              className="flex-1 text-lg font-bold text-neutral-900 border-b-2 border-brand-primary focus:outline-none bg-transparent"
            />
          ) : (
            <h2 className="text-lg font-bold text-neutral-900 flex-1">
              {shift.title}
            </h2>
          )}
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            <span
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                statusColor(shift.status)
              )}
            >
              {shift.status}
            </span>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
              >
                <Edit3 className="w-4 h-4 text-neutral-500" />
              </button>
            ) : (
              <div className="flex gap-1">
                <button
                  onClick={handleSaveEdit}
                  disabled={actionLoading}
                  className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center hover:bg-emerald-200 transition-colors"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  ) : (
                    <Save className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditForm({
                      title: shift.title,
                      description: shift.description || '',
                      baseRate: shift.baseRate,
                      slots: shift.slots,
                    })
                  }}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                >
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {isEditing ? (
          <textarea
            value={editForm.description}
            onChange={(e) =>
              setEditForm((p) => ({ ...p, description: e.target.value }))
            }
            rows={3}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            placeholder="Description..."
          />
        ) : shift.description ? (
          <p className="text-sm text-neutral-600 mb-3">{shift.description}</p>
        ) : null}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" />
            <span>{shift.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{shift.startTime} - {shift.endTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{shift.cityCode}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            <span className="capitalize">{shift.urgency}</span>
          </div>
        </div>

        {/* Rate & Slots (editable) */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-brand-primary" />
            {isEditing ? (
              <input
                type="number"
                value={editForm.baseRate}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, baseRate: Number(e.target.value) }))
                }
                className="w-16 text-sm font-semibold border-b border-brand-primary focus:outline-none bg-transparent"
              />
            ) : (
              <span className="font-semibold text-brand-primary">
                {'\u20AA'}{shift.baseRate}/hr
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-neutral-500" />
            {isEditing ? (
              <input
                type="number"
                min="1"
                value={editForm.slots}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, slots: Number(e.target.value) }))
                }
                className="w-12 text-sm font-medium border-b border-brand-primary focus:outline-none bg-transparent"
              />
            ) : (
              <span className="text-sm text-neutral-600">
                {shift.filled}/{shift.slots} filled
              </span>
            )}
          </div>
        </div>

        {/* Requirements */}
        {shift.requirements && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-neutral-100">
            {shift.requirements.needsCar && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-100 text-xs text-neutral-600">
                <Car className="w-3 h-3" /> Car
              </span>
            )}
            {shift.requirements.needsTools && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-100 text-xs text-neutral-600">
                <Wrench className="w-3 h-3" /> Tools
              </span>
            )}
            {shift.requirements.teamSize > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-100 text-xs text-neutral-600">
                <Users className="w-3 h-3" /> Team: {shift.requirements.teamSize}
              </span>
            )}
            {shift.requirements.minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-100 text-xs text-neutral-600">
                <Star className="w-3 h-3" /> Min: {shift.requirements.minRating}
              </span>
            )}
            {shift.specialization && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-brand-primary/10 text-xs text-brand-primary">
                <Briefcase className="w-3 h-3" /> {shift.specialization}
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Applications Section ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl p-5 shadow-sm mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            Applications ({applications.length})
          </h3>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
            <p className="text-sm text-neutral-500">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app, idx) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="border border-neutral-100 rounded-xl p-3"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  {app.workerPhotoUrl ? (
                    <img
                      src={app.workerPhotoUrl}
                      alt={app.workerName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-brand-primary" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {app.workerName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {app.workerRating.toFixed(1)}
                      </span>
                      {app.workerSpecialization && (
                        <span>{app.workerSpecialization}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Applied: {app.appliedAt}
                    </p>
                  </div>

                  {/* Status / Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {app.status.toLowerCase() === 'pending' ? (
                      <>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          disabled={actionLoading}
                          onClick={() =>
                            handleApplicationAction(app.id, 'approve')
                          }
                          className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center hover:bg-emerald-200 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          disabled={actionLoading}
                          onClick={() =>
                            handleApplicationAction(app.id, 'reject')
                          }
                          className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
                        >
                          <XCircle className="w-4 h-4 text-red-600" />
                        </motion.button>
                      </>
                    ) : (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                          appStatusColor(app.status)
                        )}
                      >
                        {app.status}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Management Actions ────────────────────────── */}
      <div className="space-y-3 mt-6">
        {/* Open / Close shift */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={actionLoading}
          onClick={handleToggleStatus}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-colors disabled:opacity-50',
            shift.status === 'open'
              ? 'bg-amber-50 border-2 border-amber-300 text-amber-700 hover:bg-amber-100'
              : 'bg-emerald-50 border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
          )}
        >
          {actionLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : shift.status === 'open' ? (
            <>
              <Lock className="w-5 h-5" />
              Close Shift
            </>
          ) : (
            <>
              <Unlock className="w-5 h-5" />
              Reopen Shift
            </>
          )}
        </motion.button>

        {/* Delete shift */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Shift
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4"
          >
            <p className="text-sm text-red-700 font-medium mb-3">
              Are you sure you want to delete this shift? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 font-medium text-sm"
              >
                {t('common.cancel', language)}
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={actionLoading}
                onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
