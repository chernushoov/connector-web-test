'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { Language, ShiftPosting, ShiftUrgency } from '@/types'

// ============================================
// CREATE SHIFT FORM PROPS
// ============================================

export interface CreateShiftFormProps {
  lang?: Language
  onSubmit: (shift: Partial<ShiftPosting>) => Promise<void>
  onCancel?: () => void
  className?: string
}

// ============================================
// SKILL OPTIONS
// ============================================

const skillOptions = [
  { id: 'construction', label: { ru: 'Строительство', en: 'Construction', he: 'בנייה', ar: 'بناء' } },
  { id: 'cleaning', label: { ru: 'Уборка', en: 'Cleaning', he: 'ניקיון', ar: 'تنظيف' } },
  { id: 'delivery', label: { ru: 'Доставка', en: 'Delivery', he: 'משלוחים', ar: 'توصيل' } },
  { id: 'moving', label: { ru: 'Переезды', en: 'Moving', he: 'הובלות', ar: 'نقل' } },
  { id: 'warehouse', label: { ru: 'Склад', en: 'Warehouse', he: 'מחסן', ar: 'مستودع' } },
  { id: 'catering', label: { ru: 'Кейтеринг', en: 'Catering', he: 'קייטרינג', ar: 'تموين' } },
  { id: 'events', label: { ru: 'Мероприятия', en: 'Events', he: 'אירועים', ar: 'فعاليات' } },
  { id: 'retail', label: { ru: 'Торговля', en: 'Retail', he: 'קמעונאות', ar: 'تجزئة' } },
]

// ============================================
// CREATE SHIFT FORM COMPONENT
// ============================================

export function CreateShiftForm({
  lang = 'ru',
  onSubmit,
  onCancel,
  className,
}: CreateShiftFormProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Form data
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [urgency, setUrgency] = useState<ShiftUrgency>('scheduled')
  const [baseRate, setBaseRate] = useState('')
  const [slots, setSlots] = useState('1')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [needsCar, setNeedsCar] = useState(false)
  const [needsTools, setNeedsTools] = useState(false)
  const [acceptsTeams, setAcceptsTeams] = useState(false)
  const [hasEscrow, setHasEscrow] = useState(true)

  const texts = {
    ru: {
      step1Title: 'Опишите работу',
      step2Title: 'Когда и где',
      step3Title: 'Оплата и требования',
      step4Title: 'Проверьте и опубликуйте',
      titleLabel: 'Название',
      titlePlaceholder: 'Например: Помощь на складе',
      descriptionLabel: 'Описание (опционально)',
      descriptionPlaceholder: 'Что нужно делать...',
      dateLabel: 'Дата',
      startTimeLabel: 'Начало',
      endTimeLabel: 'Конец',
      urgencyLabel: 'Срочность',
      instant: 'Срочно (сейчас)',
      today: 'Сегодня',
      scheduled: 'По расписанию',
      rateLabel: 'Ставка (₪/час)',
      slotsLabel: 'Сколько человек нужно',
      cityLabel: 'Город',
      addressLabel: 'Адрес',
      skillsLabel: 'Требуемые навыки',
      needsCar: 'Нужна машина',
      needsTools: 'Нужен инструмент',
      acceptsTeams: 'Принимаем бригады',
      hasEscrow: 'Гарантия оплаты (Escrow)',
      next: 'Далее',
      back: 'Назад',
      publish: 'Опубликовать',
      cancel: 'Отмена',
      totalEstimate: 'Примерная стоимость',
      publishSuccess: 'Смена опубликована!',
    },
    en: {
      step1Title: 'Describe the job',
      step2Title: 'When and where',
      step3Title: 'Pay and requirements',
      step4Title: 'Review and publish',
      titleLabel: 'Title',
      titlePlaceholder: 'e.g., Warehouse helper needed',
      descriptionLabel: 'Description (optional)',
      descriptionPlaceholder: 'What needs to be done...',
      dateLabel: 'Date',
      startTimeLabel: 'Start time',
      endTimeLabel: 'End time',
      urgencyLabel: 'Urgency',
      instant: 'Urgent (now)',
      today: 'Today',
      scheduled: 'Scheduled',
      rateLabel: 'Rate (₪/hour)',
      slotsLabel: 'How many workers needed',
      cityLabel: 'City',
      addressLabel: 'Address',
      skillsLabel: 'Required skills',
      needsCar: 'Car required',
      needsTools: 'Tools required',
      acceptsTeams: 'Teams accepted',
      hasEscrow: 'Payment guarantee (Escrow)',
      next: 'Next',
      back: 'Back',
      publish: 'Publish',
      cancel: 'Cancel',
      totalEstimate: 'Estimated total',
      publishSuccess: 'Shift published!',
    },
    he: {
      step1Title: 'תאר את העבודה',
      step2Title: 'מתי ואיפה',
      step3Title: 'תשלום ודרישות',
      step4Title: 'בדוק ופרסם',
      titleLabel: 'כותרת',
      titlePlaceholder: 'לדוגמה: עוזר מחסן',
      descriptionLabel: 'תיאור (אופציונלי)',
      descriptionPlaceholder: 'מה צריך לעשות...',
      dateLabel: 'תאריך',
      startTimeLabel: 'שעת התחלה',
      endTimeLabel: 'שעת סיום',
      urgencyLabel: 'דחיפות',
      instant: 'דחוף (עכשיו)',
      today: 'היום',
      scheduled: 'מתוכנן',
      rateLabel: 'תעריף (₪/שעה)',
      slotsLabel: 'כמה עובדים צריך',
      cityLabel: 'עיר',
      addressLabel: 'כתובת',
      skillsLabel: 'מיומנויות נדרשות',
      needsCar: 'צריך רכב',
      needsTools: 'צריך כלים',
      acceptsTeams: 'מקבלים צוותים',
      hasEscrow: 'אחריות תשלום (Escrow)',
      next: 'הבא',
      back: 'חזור',
      publish: 'פרסם',
      cancel: 'ביטול',
      totalEstimate: 'סה"כ משוער',
      publishSuccess: 'המשמרת פורסמה!',
    },
    ar: {
      step1Title: 'صف العمل',
      step2Title: 'متى وأين',
      step3Title: 'الدفع والمتطلبات',
      step4Title: 'راجع وانشر',
      titleLabel: 'العنوان',
      titlePlaceholder: 'مثال: مساعد مستودع',
      descriptionLabel: 'الوصف (اختياري)',
      descriptionPlaceholder: 'ما يجب القيام به...',
      dateLabel: 'التاريخ',
      startTimeLabel: 'وقت البدء',
      endTimeLabel: 'وقت الانتهاء',
      urgencyLabel: 'الإلحاح',
      instant: 'عاجل (الآن)',
      today: 'اليوم',
      scheduled: 'مجدول',
      rateLabel: 'المعدل (₪/ساعة)',
      slotsLabel: 'كم عامل مطلوب',
      cityLabel: 'المدينة',
      addressLabel: 'العنوان',
      skillsLabel: 'المهارات المطلوبة',
      needsCar: 'سيارة مطلوبة',
      needsTools: 'أدوات مطلوبة',
      acceptsTeams: 'الفرق مقبولة',
      hasEscrow: 'ضمان الدفع (Escrow)',
      next: 'التالي',
      back: 'رجوع',
      publish: 'نشر',
      cancel: 'إلغاء',
      totalEstimate: 'الإجمالي المقدر',
      publishSuccess: 'تم نشر الوردية!',
    },
  }

  const t = texts[lang]

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((s) => s !== skillId)
        : [...prev, skillId]
    )
  }

  const calculateTotalEstimate = () => {
    if (!baseRate || !startTime || !endTime) return 0
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM)
    // Handle overnight shifts (e.g. 22:00 - 06:00)
    if (totalMinutes <= 0) totalMinutes += 24 * 60
    const hours = totalMinutes / 60
    return Math.round(parseFloat(baseRate) * hours * parseInt(slots))
  }

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!title.trim()) newErrors.title = 'Required'
      else if (title.trim().length < 3) newErrors.title = 'Min 3 characters'
      else if (title.trim().length > 100) newErrors.title = 'Max 100 characters'
    }

    if (currentStep === 2) {
      if (!date) {
        newErrors.date = 'Required'
      } else {
        const selectedDate = new Date(date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (selectedDate < today) newErrors.date = 'Must be today or later'
      }
      if (!startTime) newErrors.startTime = 'Required'
      if (!endTime) newErrors.endTime = 'Required'
      if (!city.trim()) newErrors.city = 'Required'
    }

    if (currentStep === 3) {
      const rate = parseFloat(baseRate)
      if (!baseRate || isNaN(rate)) newErrors.baseRate = 'Required'
      else if (rate < 30) newErrors.baseRate = 'Min ₪30/h'
      else if (rate > 500) newErrors.baseRate = 'Max ₪500/h'

      const slotsNum = parseInt(slots)
      if (!slots || isNaN(slotsNum)) newErrors.slots = 'Required'
      else if (slotsNum < 1) newErrors.slots = 'Min 1'
      else if (slotsNum > 20) newErrors.slots = 'Max 20'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const goToNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    setIsLoading(true)

    try {
      const shift: Partial<ShiftPosting> = {
        title,
        description,
        date: new Date(date),
        startTime,
        endTime,
        urgency,
        baseRate: parseInt(baseRate),
        surgeMultiplier: urgency === 'instant' ? 1.5 : 1,
        totalEstimate: calculateTotalEstimate(),
        slots: parseInt(slots),
        filled: 0,
        applicants: 0,
        city,
        location: {
          address,
          city,
        },
        requiredSkills: selectedSkills,
        requirements: {
          needsCar,
          needsTools,
          needsTeam: acceptsTeams ? parseInt(slots) : 0,
          minExperience: 0,
          minRating: 0,
        },
        acceptsTeams,
        hasEscrow,
        paymentGuarantee: hasEscrow,
        status: 'open',
        isInstant: urgency === 'instant',
      }

      await onSubmit(shift)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('bg-white rounded-2xl', className)}>
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'flex-1 h-1.5 rounded-full transition-all',
              i <= step ? 'bg-brand-primary' : 'bg-neutral-200'
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Basic info */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-neutral-900">{t.step1Title}</h2>

            <div>
              <Input
                label={t.titleLabel}
                placeholder={t.titlePlaceholder}
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: '' })) }}
              />
              {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                {t.descriptionLabel}
              </label>
              <textarea
                placeholder={t.descriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 resize-none
                         focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t.skillsLabel}
              </label>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      selectedSkills.includes(skill.id)
                        ? 'bg-brand-primary text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    )}
                  >
                    {skill.label[lang]}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: When and where */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-neutral-900">{t.step2Title}</h2>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t.urgencyLabel}
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'instant', label: t.instant },
                  { value: 'today', label: t.today },
                  { value: 'scheduled', label: t.scheduled },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setUrgency(opt.value as ShiftUrgency)}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all',
                      urgency === opt.value
                        ? opt.value === 'instant'
                          ? 'bg-danger text-white'
                          : 'bg-brand-primary text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Input
                type="date"
                label={t.dateLabel}
                value={date}
                onChange={(e) => { setDate(e.target.value); setErrors((prev) => ({ ...prev, date: '' })) }}
              />
              {errors.date && <p className="text-xs text-danger mt-1">{errors.date}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="time"
                  label={t.startTimeLabel}
                  value={startTime}
                  onChange={(e) => { setStartTime(e.target.value); setErrors((prev) => ({ ...prev, startTime: '' })) }}
                />
                {errors.startTime && <p className="text-xs text-danger mt-1">{errors.startTime}</p>}
              </div>
              <div>
                <Input
                  type="time"
                  label={t.endTimeLabel}
                  value={endTime}
                  onChange={(e) => { setEndTime(e.target.value); setErrors((prev) => ({ ...prev, endTime: '' })) }}
                />
                {errors.endTime && <p className="text-xs text-danger mt-1">{errors.endTime}</p>}
              </div>
            </div>

            <div>
              <Input
                label={t.cityLabel}
                value={city}
                onChange={(e) => { setCity(e.target.value); setErrors((prev) => ({ ...prev, city: '' })) }}
              />
              {errors.city && <p className="text-xs text-danger mt-1">{errors.city}</p>}
            </div>

            <Input
              label={t.addressLabel}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </motion.div>
        )}

        {/* Step 3: Pay and requirements */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-neutral-900">{t.step3Title}</h2>

            <div>
              <Input
                type="number"
                label={t.rateLabel}
                value={baseRate}
                onChange={(e) => { setBaseRate(e.target.value); setErrors((prev) => ({ ...prev, baseRate: '' })) }}
                leftIcon={<span className="text-neutral-400">₪</span>}
              />
              {errors.baseRate && <p className="text-xs text-danger mt-1">{errors.baseRate}</p>}
            </div>

            <div>
              <Input
                type="number"
                label={t.slotsLabel}
                value={slots}
                onChange={(e) => { setSlots(e.target.value); setErrors((prev) => ({ ...prev, slots: '' })) }}
                min="1"
                max="20"
              />
              {errors.slots && <p className="text-xs text-danger mt-1">{errors.slots}</p>}
            </div>

            {/* Toggle options */}
            <div className="space-y-3">
              {[
                { id: 'needsCar', label: t.needsCar, value: needsCar, setValue: setNeedsCar },
                { id: 'needsTools', label: t.needsTools, value: needsTools, setValue: setNeedsTools },
                { id: 'acceptsTeams', label: t.acceptsTeams, value: acceptsTeams, setValue: setAcceptsTeams },
                { id: 'hasEscrow', label: t.hasEscrow, value: hasEscrow, setValue: setHasEscrow },
              ].map((option) => (
                <label
                  key={option.id}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl cursor-pointer"
                >
                  <span className="font-medium text-neutral-900">{option.label}</span>
                  <button
                    onClick={() => option.setValue(!option.value)}
                    className={cn(
                      'w-12 h-7 rounded-full p-1 transition-colors',
                      option.value ? 'bg-brand-primary' : 'bg-neutral-300'
                    )}
                  >
                    <motion.div
                      animate={{ x: option.value ? 20 : 0 }}
                      className="w-5 h-5 bg-white rounded-full shadow"
                    />
                  </button>
                </label>
              ))}
            </div>

            {/* Total estimate */}
            {baseRate && startTime && endTime && (
              <div className="p-4 bg-brand-primary/10 rounded-xl">
                <p className="text-sm text-neutral-600">{t.totalEstimate}</p>
                <p className="text-2xl font-bold text-brand-primary">
                  ₪{calculateTotalEstimate().toLocaleString()}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-neutral-900">{t.step4Title}</h2>

            <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-sm text-neutral-500">Title</p>
                <p className="font-semibold text-neutral-900">{title}</p>
              </div>

              {description && (
                <div>
                  <p className="text-sm text-neutral-500">Description</p>
                  <p className="text-neutral-900">{description}</p>
                </div>
              )}

              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-neutral-500">Date</p>
                  <p className="font-medium">{date}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Time</p>
                  <p className="font-medium">{startTime} - {endTime}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Location</p>
                <p className="font-medium">{address}, {city}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  <p className="text-sm text-neutral-500">Rate</p>
                  <p className="text-lg font-bold text-success">₪{baseRate}/h</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-500">Total</p>
                  <p className="text-lg font-bold">₪{calculateTotalEstimate()}</p>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {urgency === 'instant' && <Badge variant="danger">Urgent</Badge>}
              {hasEscrow && <Badge variant="success">Escrow</Badge>}
              {acceptsTeams && <Badge variant="primary">Teams OK</Badge>}
              {needsCar && <Badge variant="neutral">Car required</Badge>}
              {needsTools && <Badge variant="neutral">Tools required</Badge>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <Button variant="ghost" onClick={() => setStep(step - 1)}>
            {t.back}
          </Button>
        )}
        {onCancel && step === 1 && (
          <Button variant="ghost" onClick={onCancel}>
            {t.cancel}
          </Button>
        )}
        <div className="flex-1" />
        {step < 4 ? (
          <Button
            variant="primary"
            onClick={goToNextStep}
          >
            {t.next}
          </Button>
        ) : (
          <Button
            variant="success"
            onClick={handleSubmit}
            isLoading={isLoading}
            glow
          >
            {t.publish}
          </Button>
        )}
      </div>
    </div>
  )
}
