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
  CheckCircle2,
  Shield,
  Car,
  Wrench,
  Users,
  TrendingUp,
  MessageCircle,
  Phone,
  Loader2,
  Zap,
  DollarSign,
  AlertCircle,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { cn } from '@/lib/utils'

// ---------------------
// Inline types
// ---------------------

interface ShiftDetail {
  id: string
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  cityCode: string
  address: string
  lat: number
  lng: number
  baseRate: number
  surgeMultiplier: number
  isInstant: boolean
  urgency: string
  slots: number
  filled: number
  specialization: string

  employer: {
    id: string
    name: string
    company: string
    phone: string
    rating: number
    reviewsCount: number
    isVerified: boolean
    avatarUrl: string | null
  }

  requirements: {
    needsCar: boolean
    needsTools: boolean
    teamSize: number | null
    minRating: number | null
    experienceYears: number | null
    description: string | null
  }

  hasApplied: boolean
}

// ---------------------
// Page
// ---------------------

export default function WorkerShiftDetailPage() {
  const { language, isRTL } = useUI()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [shift, setShift] = useState<ShiftDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    const fetchShift = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/shifts/${id}`)
        const json = await res.json()
        const data = json.data || null
        setShift(data)
        if (data?.hasApplied) {
          setApplied(true)
        }
      } catch (e) {
        console.error('Failed to fetch shift:', e)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchShift()
  }, [id])

  const handleApply = async () => {
    setApplying(true)
    try {
      const res = await fetch(`/api/shifts/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        setApplied(true)
      }
    } catch (e) {
      console.error('Failed to apply:', e)
    } finally {
      setApplying(false)
    }
  }

  const openWhatsApp = () => {
    if (!shift?.employer.phone) return
    const cleanPhone = shift.employer.phone.replace(/[^\d+]/g, '').replace('+', '')
    const message = encodeURIComponent(
      `${t('contact.template', language)} ${shift.title}`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
  }

  const openPhone = () => {
    if (!shift?.employer.phone) return
    window.open(`tel:${shift.employer.phone}`, '_self')
  }

  if (loading) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50">
        <div className="px-4 pt-4 space-y-4">
          <div className="h-8 w-8 bg-neutral-200 rounded-full animate-pulse" />
          <div className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-neutral-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-neutral-100 rounded w-1/2 mb-3" />
            <div className="h-4 bg-neutral-100 rounded w-2/3 mb-3" />
            <div className="h-4 bg-neutral-100 rounded w-full mb-3" />
            <div className="h-20 bg-neutral-100 rounded w-full" />
          </div>
          <div className="bg-white rounded-2xl p-6 animate-pulse h-40" />
          <div className="bg-white rounded-2xl p-6 animate-pulse h-32" />
        </div>
      </div>
    )
  }

  if (!shift) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
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

  const effectiveRate = Math.round(shift.baseRate * shift.surgeMultiplier)
  const hasSurge = shift.surgeMultiplier > 1
  const slotsLeft = shift.slots - shift.filled

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50 pb-24">
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
        {/* Employer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100"
        >
          <div className="flex items-center gap-3">
            {shift.employer.avatarUrl ? (
              <img
                src={shift.employer.avatarUrl}
                alt={shift.employer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-brand-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-neutral-900 truncate">
                  {shift.employer.name}
                </h3>
                {shift.employer.isVerified && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                    <Shield className="w-3 h-3" />
                    {t('worker.verified', language)}
                  </span>
                )}
              </div>
              {shift.employer.company && (
                <p className="text-sm text-neutral-500">{shift.employer.company}</p>
              )}
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-sm font-medium text-neutral-700">
                  {shift.employer.rating.toFixed(1)}
                </span>
                <span className="text-xs text-neutral-400">
                  ({shift.employer.reviewsCount} {t('worker.reviews', language)})
                </span>
              </div>
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={openWhatsApp}
              className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t('contact.whatsapp', language)}
            </button>
            <button
              onClick={openPhone}
              className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4" />
              {t('contact.call', language)}
            </button>
          </div>
        </motion.div>

        {/* Shift Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100"
        >
          <div className="flex items-center gap-2 mb-3">
            {shift.isInstant && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {t('shift.instant', language)}
              </span>
            )}
            <h2 className="text-lg font-bold text-neutral-900">{shift.title}</h2>
          </div>

          {shift.description && (
            <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
              {shift.description}
            </p>
          )}

          <div className="space-y-3">
            <DetailRow
              icon={<Calendar className="w-4 h-4 text-neutral-400" />}
              label="Date"
              value={shift.date}
            />
            <DetailRow
              icon={<Clock className="w-4 h-4 text-neutral-400" />}
              label="Time"
              value={`${shift.startTime} - ${shift.endTime}`}
            />
            <DetailRow
              icon={<MapPin className="w-4 h-4 text-neutral-400" />}
              label="Location"
              value={shift.address || shift.cityCode}
            />
          </div>
        </motion.div>

        {/* Rate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'rounded-2xl p-5 shadow-sm border',
            hasSurge
              ? 'bg-amber-50 border-amber-200'
              : 'bg-white border-neutral-100'
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-brand-primary" />
            <h3 className="font-semibold text-neutral-900">
              {t('shift.rate', language)}
            </h3>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                'text-3xl font-bold',
                hasSurge ? 'text-amber-600' : 'text-brand-primary'
              )}
            >
              {'\u20AA'}{effectiveRate}
            </span>
            <span className="text-neutral-500">{t('shift.per.hour', language)}</span>
          </div>

          {hasSurge && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-neutral-500 line-through">
                {'\u20AA'}{shift.baseRate}
              </span>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-semibold">
                +{Math.round((shift.surgeMultiplier - 1) * 100)}% surge
              </span>
            </div>
          )}
        </motion.div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100"
        >
          <h3 className="font-semibold text-neutral-900 mb-3">
            {t('shift.requirements', language)}
          </h3>

          <div className="space-y-2.5">
            {shift.requirements.needsCar && (
              <RequirementItem
                icon={<Car className="w-4 h-4" />}
                text={t('worker.has.car', language)}
                met={true}
              />
            )}
            {shift.requirements.needsTools && (
              <RequirementItem
                icon={<Wrench className="w-4 h-4" />}
                text={t('worker.has.tools', language)}
                met={true}
              />
            )}
            {shift.requirements.teamSize && (
              <RequirementItem
                icon={<Users className="w-4 h-4" />}
                text={`${t('shift.team', language)}: ${shift.requirements.teamSize} ${t('worker.people', language)}`}
                met={true}
              />
            )}
            {shift.requirements.minRating && (
              <RequirementItem
                icon={<Star className="w-4 h-4" />}
                text={`Min rating: ${shift.requirements.minRating}`}
                met={true}
              />
            )}
            {shift.requirements.experienceYears && (
              <RequirementItem
                icon={<TrendingUp className="w-4 h-4" />}
                text={`Experience: ${shift.requirements.experienceYears}+ years`}
                met={true}
              />
            )}
            {shift.requirements.description && (
              <p className="text-sm text-neutral-600 mt-2">
                {shift.requirements.description}
              </p>
            )}
            {!shift.requirements.needsCar &&
              !shift.requirements.needsTools &&
              !shift.requirements.teamSize &&
              !shift.requirements.minRating &&
              !shift.requirements.experienceYears &&
              !shift.requirements.description && (
                <p className="text-sm text-neutral-400">No special requirements</p>
              )}
          </div>
        </motion.div>

        {/* Slots Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-neutral-900">
              {t('shift.slots', language)}
            </h3>
            <span
              className={cn(
                'text-sm font-semibold',
                slotsLeft <= 2 ? 'text-red-600' : 'text-neutral-600'
              )}
            >
              {shift.filled}/{shift.slots} filled
            </span>
          </div>

          <div className="w-full bg-neutral-100 rounded-full h-2.5">
            <div
              className={cn(
                'h-2.5 rounded-full transition-all',
                slotsLeft <= 1
                  ? 'bg-red-500'
                  : slotsLeft <= 3
                    ? 'bg-amber-500'
                    : 'bg-green-500'
              )}
              style={{
                width: `${Math.round((shift.filled / shift.slots) * 100)}%`,
              }}
            />
          </div>

          {slotsLeft <= 3 && slotsLeft > 0 && (
            <p className="text-xs text-red-600 mt-2 font-medium">
              {slotsLeft} {t('shift.slots.left', language)}! {t('urgency.hurry', language)}
            </p>
          )}
        </motion.div>
      </div>

      {/* Sticky Bottom Apply Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-neutral-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div
              className={cn(
                'text-xl font-bold',
                hasSurge ? 'text-amber-600' : 'text-brand-primary'
              )}
            >
              {'\u20AA'}{effectiveRate}
              <span className="text-sm font-normal text-neutral-500">
                {t('shift.per.hour', language)}
              </span>
            </div>
          </div>

          {applied ? (
            <div className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-2xl font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              {t('shift.applied', language)}
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying || slotsLeft <= 0}
              className="px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-semibold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {applying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('shift.apply', language)
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------
// Sub-components
// ---------------------

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="text-sm font-medium text-neutral-700">{value}</p>
      </div>
    </div>
  )
}

function RequirementItem({
  icon,
  text,
  met,
}: {
  icon: React.ReactNode
  text: string
  met: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center',
          met ? 'bg-brand-primary/10 text-brand-primary' : 'bg-neutral-100 text-neutral-400'
        )}
      >
        {icon}
      </div>
      <span className="text-sm text-neutral-700">{text}</span>
    </div>
  )
}
