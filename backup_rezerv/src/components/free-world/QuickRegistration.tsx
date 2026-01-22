'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useConnectorStore } from '@/store'
import { Button } from '@/components/ui/Button'
import { Input, PhoneInput, OTPInput } from '@/components/ui/Input'
import type { Language, QuickProfile } from '@/types'

// ============================================
// QUICK REGISTRATION PROPS
// ============================================

export interface QuickRegistrationProps {
  lang?: Language
  onComplete?: (profile: QuickProfile) => void
  onSkip?: () => void
  className?: string
}

// ============================================
// QUICK REGISTRATION STEPS
// ============================================

type Step = 'phone' | 'code' | 'name' | 'skills' | 'complete'

const skillOptions = [
  { id: 'construction', emoji: '🔨', label: { ru: 'Строительство', en: 'Construction', he: 'בנייה', ar: 'بناء' } },
  { id: 'cleaning', emoji: '🧹', label: { ru: 'Уборка', en: 'Cleaning', he: 'ניקיון', ar: 'تنظيف' } },
  { id: 'delivery', emoji: '📦', label: { ru: 'Доставка', en: 'Delivery', he: 'משלוחים', ar: 'توصيل' } },
  { id: 'moving', emoji: '🚚', label: { ru: 'Переезды', en: 'Moving', he: 'הובלות', ar: 'نقل' } },
  { id: 'garden', emoji: '🌱', label: { ru: 'Сад/Огород', en: 'Gardening', he: 'גינון', ar: 'حدائق' } },
  { id: 'repair', emoji: '🔧', label: { ru: 'Ремонт', en: 'Repair', he: 'תיקונים', ar: 'إصلاح' } },
  { id: 'cooking', emoji: '👨‍🍳', label: { ru: 'Готовка', en: 'Cooking', he: 'בישול', ar: 'طبخ' } },
  { id: 'driving', emoji: '🚗', label: { ru: 'Вождение', en: 'Driving', he: 'נהיגה', ar: 'قيادة' } },
  { id: 'catering', emoji: '🍽️', label: { ru: 'Кейтеринг', en: 'Catering', he: 'קייטרינג', ar: 'تموين' } },
  { id: 'other', emoji: '✨', label: { ru: 'Другое', en: 'Other', he: 'אחר', ar: 'أخرى' } },
]

// ============================================
// QUICK REGISTRATION COMPONENT
// ============================================

export function QuickRegistration({
  lang = 'ru',
  onComplete,
  onSkip,
  className,
}: QuickRegistrationProps) {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const finishQuickRegistration = useConnectorStore(
    (state) => state.finishQuickRegistration
  )

  const texts = {
    ru: {
      title: 'Быстрая регистрация',
      subtitle: '30 секунд и вы на карте',
      phone: 'Номер телефона',
      phonePlaceholder: '50 123 4567',
      sendCode: 'Получить код',
      code: 'Код из SMS',
      codeSent: 'Код отправлен на',
      verify: 'Подтвердить',
      name: 'Как вас зовут?',
      namePlaceholder: 'Ваше имя',
      skills: 'Что вы умеете?',
      skillsHint: 'Выберите 1-3 навыка',
      finish: 'Готово!',
      welcome: 'Добро пожаловать!',
      welcomeText: 'Теперь вас видят на карте',
      startWorking: 'Начать работать',
      skip: 'Пропустить',
      next: 'Далее',
      resend: 'Отправить код повторно',
    },
    en: {
      title: 'Quick Registration',
      subtitle: '30 seconds and you are on the map',
      phone: 'Phone number',
      phonePlaceholder: '50 123 4567',
      sendCode: 'Get code',
      code: 'SMS Code',
      codeSent: 'Code sent to',
      verify: 'Verify',
      name: 'What is your name?',
      namePlaceholder: 'Your name',
      skills: 'What can you do?',
      skillsHint: 'Select 1-3 skills',
      finish: 'Done!',
      welcome: 'Welcome!',
      welcomeText: 'Now you are visible on the map',
      startWorking: 'Start working',
      skip: 'Skip',
      next: 'Next',
      resend: 'Resend code',
    },
    he: {
      title: 'הרשמה מהירה',
      subtitle: '30 שניות ואתה על המפה',
      phone: 'מספר טלפון',
      phonePlaceholder: '50 123 4567',
      sendCode: 'קבל קוד',
      code: 'קוד SMS',
      codeSent: 'קוד נשלח ל',
      verify: 'אמת',
      name: 'מה שמך?',
      namePlaceholder: 'השם שלך',
      skills: 'מה אתה יודע לעשות?',
      skillsHint: 'בחר 1-3 מיומנויות',
      finish: 'סיום!',
      welcome: 'ברוך הבא!',
      welcomeText: 'עכשיו אתה נראה על המפה',
      startWorking: 'התחל לעבוד',
      skip: 'דלג',
      next: 'הבא',
      resend: 'שלח קוד שוב',
    },
    ar: {
      title: 'تسجيل سريع',
      subtitle: '30 ثانية وأنت على الخريطة',
      phone: 'رقم الهاتف',
      phonePlaceholder: '50 123 4567',
      sendCode: 'احصل على الرمز',
      code: 'رمز SMS',
      codeSent: 'تم إرسال الرمز إلى',
      verify: 'تحقق',
      name: 'ما اسمك؟',
      namePlaceholder: 'اسمك',
      skills: 'ماذا تجيد؟',
      skillsHint: 'اختر 1-3 مهارات',
      finish: 'انتهى!',
      welcome: 'مرحبًا!',
      welcomeText: 'الآن أنت مرئي على الخريطة',
      startWorking: 'ابدأ العمل',
      skip: 'تخطي',
      next: 'التالي',
      resend: 'إعادة إرسال الرمز',
    },
  }

  const t = texts[lang]

  const handleSendCode = async () => {
    if (phone.length < 9) {
      setError('Invalid phone number')
      return
    }
    setIsLoading(true)
    setError('')

    try {
      // TODO: Implement actual SMS sending
      await new Promise((r) => setTimeout(r, 1000))
      setStep('code')
    } catch (e) {
      setError('Failed to send code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Invalid code')
      return
    }
    setIsLoading(true)
    setError('')

    try {
      // TODO: Implement actual verification
      await new Promise((r) => setTimeout(r, 1000))
      setStep('name')
    } catch (e) {
      setError('Invalid code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameSubmit = () => {
    if (name.length < 2) {
      setError('Name is too short')
      return
    }
    setError('')
    setStep('skills')
  }

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((s) => s !== skillId)
        : prev.length < 3
        ? [...prev, skillId]
        : prev
    )
  }

  const handleComplete = () => {
    const profile: QuickProfile = {
      id: 'user_' + Date.now(),
      phone: '+972' + phone,
      name,
      skills: selectedSkills,
      availabilityStatus: 'available',
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      language: lang,
      isVerified: false,
      verificationStatus: 'unverified',
    }

    finishQuickRegistration(profile)
    setStep('complete')
    onComplete?.(profile)
  }

  // Step indicator
  const stepNumber = {
    phone: 1,
    code: 2,
    name: 3,
    skills: 4,
    complete: 5,
  }

  return (
    <div className={cn('bg-white rounded-3xl p-6', className)}>
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">{t.title}</h2>
        <p className="text-neutral-500 mt-1">{t.subtitle}</p>

        {/* Progress */}
        {step !== 'complete' && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i <= stepNumber[step]
                    ? 'bg-brand-primary w-6'
                    : 'bg-neutral-200'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Phone step */}
        {step === 'phone' && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <PhoneInput
              label={t.phone}
              placeholder={t.phonePlaceholder}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={error}
            />
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleSendCode}
              isLoading={isLoading}
            >
              {t.sendCode}
            </Button>
            {onSkip && (
              <button
                onClick={onSkip}
                className="w-full text-center text-neutral-500 text-sm hover:text-neutral-700"
              >
                {t.skip}
              </button>
            )}
          </motion.div>
        )}

        {/* Code step */}
        {step === 'code' && (
          <motion.div
            key="code"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <p className="text-center text-neutral-600 mb-4">
              {t.codeSent} <span className="font-semibold">+972{phone}</span>
            </p>
            <OTPInput
              value={code}
              onChange={setCode}
              error={error}
            />
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleVerifyCode}
              isLoading={isLoading}
              disabled={code.length !== 6}
            >
              {t.verify}
            </Button>
            <button
              onClick={handleSendCode}
              disabled={isLoading}
              className="w-full text-center text-brand-primary text-sm hover:underline"
            >
              {t.resend}
            </button>
          </motion.div>
        )}

        {/* Name step */}
        {step === 'name' && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Input
              label={t.name}
              placeholder={t.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={error}
              inputSize="lg"
              autoFocus
            />
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleNameSubmit}
              disabled={name.length < 2}
            >
              {t.next}
            </Button>
          </motion.div>
        )}

        {/* Skills step */}
        {step === 'skills' && (
          <motion.div
            key="skills"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <p className="font-medium text-neutral-900">{t.skills}</p>
              <p className="text-sm text-neutral-500">{t.skillsHint}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {skillOptions.map((skill) => (
                <motion.button
                  key={skill.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSkill(skill.id)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border-2 transition-all',
                    selectedSkills.includes(skill.id)
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-neutral-200 hover:border-neutral-300'
                  )}
                >
                  <span className="text-xl">{skill.emoji}</span>
                  <span className="text-sm font-medium">
                    {skill.label[lang]}
                  </span>
                </motion.button>
              ))}
            </div>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleComplete}
              disabled={selectedSkills.length === 0}
            >
              {t.finish}
            </Button>
          </motion.div>
        )}

        {/* Complete step */}
        {step === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            {/* Success animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-success-light
                         flex items-center justify-center"
            >
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="w-10 h-10 text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>

            <h3 className="text-xl font-bold text-neutral-900">{t.welcome}</h3>
            <p className="text-neutral-500 mt-1">{t.welcomeText}</p>

            {/* Psychology: potential earnings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-4 p-4 bg-brand-accent/20 rounded-xl"
            >
              <p className="text-sm text-neutral-600">
                People like you earn on average
              </p>
              <p className="text-2xl font-bold text-neutral-900">
                ₪3,000 - ₪8,000/week
              </p>
            </motion.div>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              className="mt-6"
              glow
            >
              {t.startWorking}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// QUICK REGISTRATION MODAL
// ============================================

export function QuickRegistrationModal({
  isOpen,
  onClose,
  lang = 'ru',
}: {
  isOpen: boolean
  onClose: () => void
  lang?: Language
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-50
                       bg-white rounded-t-3xl safe-bottom max-h-[90vh] overflow-y-auto"
          >
            <div className="p-2">
              <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto" />
            </div>
            <QuickRegistration lang={lang} onComplete={onClose} onSkip={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
