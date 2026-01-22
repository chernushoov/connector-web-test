'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { Language } from '@/types'

// ============================================
// URGENCY COUNTDOWN
// ============================================

export interface CountdownTimerProps {
  endTime: Date
  onExpire?: () => void
  variant?: 'default' | 'inline' | 'banner'
  lang?: Language
  className?: string
}

export function CountdownTimer({
  endTime,
  onExpire,
  variant = 'default',
  lang = 'en',
  className,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())

  function getTimeLeft() {
    const diff = endTime.getTime() - Date.now()
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true }

    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: false,
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = getTimeLeft()
      setTimeLeft(newTimeLeft)
      if (newTimeLeft.expired) {
        clearInterval(timer)
        onExpire?.()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime, onExpire])

  if (timeLeft.expired) {
    return (
      <span className={cn('text-danger font-semibold', className)}>
        Expired
      </span>
    )
  }

  const texts = {
    ru: { hours: 'ч', minutes: 'м', seconds: 'с', hurry: 'Спешите!' },
    en: { hours: 'h', minutes: 'm', seconds: 's', hurry: 'Hurry!' },
    he: { hours: 'ש', minutes: 'ד', seconds: 'ש', hurry: '!מהר' },
    ar: { hours: 'س', minutes: 'د', seconds: 'ث', hurry: '!أسرع' },
  }

  const t = texts[lang]

  if (variant === 'inline') {
    return (
      <span className={cn('font-mono font-semibold text-danger', className)}>
        {timeLeft.hours > 0 && `${timeLeft.hours}${t.hours} `}
        {timeLeft.minutes}${t.minutes} {timeLeft.seconds}${t.seconds}
      </span>
    )
  }

  if (variant === 'banner') {
    const isUrgent = timeLeft.hours === 0 && timeLeft.minutes < 30

    return (
      <motion.div
        animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
        className={cn(
          'flex items-center justify-center gap-3 p-3 rounded-xl',
          isUrgent ? 'bg-danger text-white' : 'bg-warning-light text-warning-dark',
          className
        )}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-semibold">{t.hurry}</span>
        <div className="flex items-center gap-1 font-mono">
          {timeLeft.hours > 0 && (
            <>
              <span className="bg-white/20 px-2 py-1 rounded">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
            </>
          )}
          <span className="bg-white/20 px-2 py-1 rounded">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span>:</span>
          <span className="bg-white/20 px-2 py-1 rounded">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
      </motion.div>
    )
  }

  // Default variant
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {[
        { value: timeLeft.hours, label: t.hours },
        { value: timeLeft.minutes, label: t.minutes },
        { value: timeLeft.seconds, label: t.seconds },
      ]
        .filter((_, i) => i > 0 || timeLeft.hours > 0)
        .map((segment, index) => (
          <div key={segment.label} className="flex items-center gap-1">
            {index > 0 && <span className="text-danger font-bold">:</span>}
            <div className="bg-danger-light text-danger px-2 py-1 rounded font-mono font-bold">
              {String(segment.value).padStart(2, '0')}
            </div>
            <span className="text-xs text-neutral-500">{segment.label}</span>
          </div>
        ))}
    </div>
  )
}

// ============================================
// SCARCITY INDICATOR
// ============================================

export interface ScarcityIndicatorProps {
  total: number
  remaining: number
  showBar?: boolean
  lang?: Language
  className?: string
}

export function ScarcityIndicator({
  total,
  remaining,
  showBar = true,
  lang = 'en',
  className,
}: ScarcityIndicatorProps) {
  const percentage = (remaining / total) * 100
  const isLow = remaining <= 3
  const isCritical = remaining <= 1

  const texts = {
    ru: {
      spotsLeft: 'мест осталось',
      outOf: 'из',
      lastSpot: 'Последнее место!',
      almostGone: 'Почти закончились!',
    },
    en: {
      spotsLeft: 'spots left',
      outOf: 'of',
      lastSpot: 'Last spot!',
      almostGone: 'Almost gone!',
    },
    he: {
      spotsLeft: 'מקומות נותרו',
      outOf: 'מתוך',
      lastSpot: '!מקום אחרון',
      almostGone: '!כמעט נגמר',
    },
    ar: {
      spotsLeft: 'أماكن متبقية',
      outOf: 'من',
      lastSpot: '!آخر مكان',
      almostGone: '!على وشك النفاد',
    },
  }

  const t = texts[lang]

  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            'text-sm font-semibold',
            isCritical ? 'text-danger animate-pulse' : isLow ? 'text-warning' : 'text-neutral-600'
          )}
        >
          {isCritical
            ? t.lastSpot
            : isLow
            ? t.almostGone
            : `${remaining} ${t.spotsLeft}`}
        </span>
        <span className="text-xs text-neutral-500">
          {remaining} {t.outOf} {total}
        </span>
      </div>

      {showBar && (
        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${100 - percentage}%` }}
            className={cn(
              'h-full rounded-full',
              isCritical
                ? 'bg-danger animate-pulse'
                : isLow
                ? 'bg-warning'
                : 'bg-brand-primary'
            )}
          />
        </div>
      )}
    </div>
  )
}

// ============================================
// SOCIAL PROOF BANNER
// ============================================

export interface SocialProofBannerProps {
  type: 'viewers' | 'applicants' | 'completed' | 'earnings'
  count: number
  avatars?: string[]
  lang?: Language
  className?: string
}

export function SocialProofBanner({
  type,
  count,
  avatars = [],
  lang = 'en',
  className,
}: SocialProofBannerProps) {
  const texts = {
    ru: {
      viewers: 'человек смотрят сейчас',
      applicants: 'уже откликнулись',
      completed: 'выполнили сегодня',
      earnings: 'заработали сегодня',
    },
    en: {
      viewers: 'people viewing now',
      applicants: 'already applied',
      completed: 'completed today',
      earnings: 'earned today',
    },
    he: {
      viewers: 'צופים עכשיו',
      applicants: 'כבר הגישו',
      completed: 'השלימו היום',
      earnings: 'הרוויחו היום',
    },
    ar: {
      viewers: 'يشاهدون الآن',
      applicants: 'تقدموا بالفعل',
      completed: 'أكملوا اليوم',
      earnings: 'كسبوا اليوم',
    },
  }

  const t = texts[lang]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-3 p-3 bg-neutral-50 rounded-xl',
        className
      )}
    >
      {/* Live indicator */}
      {type === 'viewers' && (
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
        </span>
      )}

      {/* Avatars */}
      {avatars.length > 0 && (
        <div className="flex -space-x-2">
          {avatars.slice(0, 3).map((avatar, i) => (
            <img
              key={i}
              src={avatar}
              className="w-6 h-6 rounded-full border-2 border-white"
              alt=""
            />
          ))}
          {avatars.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center text-xs font-medium">
              +{avatars.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Count and message */}
      <p className="text-sm text-neutral-600">
        <span className="font-semibold text-neutral-900">
          {type === 'earnings' ? `₪${count.toLocaleString()}` : count}
        </span>{' '}
        {t[type]}
      </p>
    </motion.div>
  )
}

// ============================================
// LOSS AVERSION MESSAGE
// ============================================

export interface LossAversionMessageProps {
  amount: number
  period?: 'day' | 'week' | 'month'
  lang?: Language
  className?: string
}

export function LossAversionMessage({
  amount,
  period = 'day',
  lang = 'en',
  className,
}: LossAversionMessageProps) {
  const texts = {
    ru: {
      day: 'в день',
      week: 'в неделю',
      month: 'в месяц',
      youMiss: 'Вы упускаете до',
      byNotWorking: 'не работая',
    },
    en: {
      day: 'per day',
      week: 'per week',
      month: 'per month',
      youMiss: "You're missing out on up to",
      byNotWorking: 'by not working',
    },
    he: {
      day: 'ליום',
      week: 'לשבוע',
      month: 'לחודש',
      youMiss: 'אתה מפסיד עד',
      byNotWorking: 'בלי לעבוד',
    },
    ar: {
      day: 'في اليوم',
      week: 'في الأسبوع',
      month: 'في الشهر',
      youMiss: 'أنت تفوت ما يصل إلى',
      byNotWorking: 'بدون العمل',
    },
  }

  const t = texts[lang]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'p-4 bg-gradient-to-r from-danger-light to-warning-light rounded-xl',
        className
      )}
    >
      <p className="text-sm text-neutral-700">
        {t.youMiss}{' '}
        <span className="text-xl font-bold text-danger">
          ₪{amount.toLocaleString()}
        </span>{' '}
        {t[period]} {t.byNotWorking}
      </p>
    </motion.div>
  )
}

// ============================================
// TRUST INDICATORS
// ============================================

export interface TrustIndicatorsProps {
  verifiedEmployer?: boolean
  escrowEnabled?: boolean
  insuranceIncluded?: boolean
  totalPaid?: number
  lang?: Language
  className?: string
}

export function TrustIndicators({
  verifiedEmployer,
  escrowEnabled,
  insuranceIncluded,
  totalPaid,
  lang = 'en',
  className,
}: TrustIndicatorsProps) {
  const texts = {
    ru: {
      verified: 'Проверенный работодатель',
      escrow: 'Оплата защищена',
      insurance: 'Есть страховка',
      paid: 'Выплачено',
    },
    en: {
      verified: 'Verified employer',
      escrow: 'Payment protected',
      insurance: 'Insurance included',
      paid: 'Total paid',
    },
    he: {
      verified: 'מעסיק מאומת',
      escrow: 'תשלום מוגן',
      insurance: 'כולל ביטוח',
      paid: 'סה"כ שולם',
    },
    ar: {
      verified: 'صاحب عمل موثق',
      escrow: 'الدفع محمي',
      insurance: 'التأمين مشمول',
      paid: 'إجمالي المدفوع',
    },
  }

  const t = texts[lang]

  const indicators = [
    {
      show: verifiedEmployer,
      label: t.verified,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      color: 'text-success bg-success-light',
    },
    {
      show: escrowEnabled,
      label: t.escrow,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      color: 'text-brand-primary bg-brand-primary/10',
    },
    {
      show: insuranceIncluded,
      label: t.insurance,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      ),
      color: 'text-warning bg-warning-light',
    },
  ]

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {indicators
        .filter((ind) => ind.show)
        .map((ind) => (
          <div
            key={ind.label}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
              ind.color
            )}
          >
            {ind.icon}
            {ind.label}
          </div>
        ))}

      {totalPaid && totalPaid > 10000 && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-success bg-success-light">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          {t.paid}: ₪{(totalPaid / 1000).toFixed(0)}k+
        </div>
      )}
    </div>
  )
}

// ============================================
// URGENCY POPUP
// ============================================

export interface UrgencyPopupProps {
  isOpen: boolean
  onClose: () => void
  message: string
  subMessage?: string
  actionLabel: string
  onAction: () => void
  countdown?: Date
  lang?: Language
}

export function UrgencyPopup({
  isOpen,
  onClose,
  message,
  subMessage,
  actionLabel,
  onAction,
  countdown,
  lang = 'en',
}: UrgencyPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                       w-[90%] max-w-sm bg-white rounded-2xl p-6 shadow-2xl text-center"
          >
            {/* Pulsing icon */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-light
                         flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-danger" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </motion.div>

            <h3 className="text-xl font-bold text-neutral-900">{message}</h3>
            {subMessage && (
              <p className="text-neutral-500 mt-2">{subMessage}</p>
            )}

            {countdown && (
              <div className="mt-4">
                <CountdownTimer endTime={countdown} variant="default" lang={lang} />
              </div>
            )}

            <button
              onClick={onAction}
              className="w-full mt-6 py-3 rounded-xl font-semibold text-white
                         bg-danger hover:bg-danger-dark transition-colors"
            >
              {actionLabel}
            </button>

            <button
              onClick={onClose}
              className="w-full mt-2 py-2 text-neutral-500 hover:text-neutral-700"
            >
              Later
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
