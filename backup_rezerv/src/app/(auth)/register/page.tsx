'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { PhoneInput, CodeInput } from '@/components/auth'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/shared'
import {
  ArrowRight,
  Camera,
  Check,
  User,
  Briefcase,
  Wrench,
  Car,
  Package,
  Paintbrush,
  Sparkles,
  ChefHat,
  Truck
} from 'lucide-react'
import type { QuickProfile } from '@/types'

type RegisterStep = 'phone' | 'code' | 'name' | 'photo' | 'skills' | 'done'

const skillOptions = [
  { id: 'handyman', icon: <Wrench className="w-5 h-5" />, labelKey: 'Handyman' },
  { id: 'driver', icon: <Car className="w-5 h-5" />, labelKey: 'Driver' },
  { id: 'mover', icon: <Truck className="w-5 h-5" />, labelKey: 'Mover' },
  { id: 'cleaner', icon: <Sparkles className="w-5 h-5" />, labelKey: 'Cleaner' },
  { id: 'painter', icon: <Paintbrush className="w-5 h-5" />, labelKey: 'Painter' },
  { id: 'cook', icon: <ChefHat className="w-5 h-5" />, labelKey: 'Cook' },
  { id: 'warehouse', icon: <Package className="w-5 h-5" />, labelKey: 'Warehouse' },
  { id: 'other', icon: <Briefcase className="w-5 h-5" />, labelKey: 'Other' },
]

export default function RegisterPage() {
  const { language, isRTL } = useUI()
  const { finishQuickRegistration } = useConnectorStore()

  const [step, setStep] = useState<RegisterStep>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const steps: RegisterStep[] = ['phone', 'code', 'name', 'photo', 'skills', 'done']
  const currentStepIndex = steps.indexOf(step)
  const progress = ((currentStepIndex) / (steps.length - 1)) * 100

  const handlePhoneSubmit = async () => {
    if (phone.replace(/\D/g, '').length < 12) {
      setError(t('auth.error.phone', language))
      return
    }
    setError(null)
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsLoading(false)
    setStep('code')
  }

  const handleCodeComplete = async (completedCode: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsLoading(false)
    setStep('name')
  }

  const handleNameSubmit = () => {
    if (name.trim().length < 2) {
      setError('Please enter your name')
      return
    }
    setError(null)
    setStep('photo')
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    )
  }

  const handleComplete = () => {
    const profile: QuickProfile = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      phone,
      name,
      photoUrl: photoUrl || undefined,
      skills: selectedSkills,
      availabilityStatus: 'available',
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      language,
      isVerified: false,
      verificationStatus: 'unverified',
    }

    finishQuickRegistration(profile)
    setStep('done')

    // Redirect after animation
    setTimeout(() => {
      window.location.href = '/'
    }, 2000)
  }

  const handleBack = () => {
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
      setError(null)
    }
  }

  const canGoBack = step !== 'phone' && step !== 'done'

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-brand-primary/5 to-white"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        showBack={canGoBack}
        onBack={handleBack}
        transparent
      />

      {/* Progress bar */}
      {step !== 'done' && (
        <div className="px-6">
          <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-brand"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      <main className="px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Phone Step */}
          {step === 'phone' && (
            <StepWrapper key="phone">
              <StepHeader
                title={t('auth.title', language)}
                subtitle={t('auth.subtitle', language)}
              />
              <PhoneInput
                value={phone}
                onChange={setPhone}
                error={error || undefined}
                disabled={isLoading}
              />
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handlePhoneSubmit}
                isLoading={isLoading}
                rightIcon={!isLoading && <ArrowRight className="w-5 h-5" />}
              >
                {t('auth.send.code', language)}
              </Button>
            </StepWrapper>
          )}

          {/* Code Step */}
          {step === 'code' && (
            <StepWrapper key="code">
              <StepHeader
                title={t('auth.code', language)}
                subtitle={phone}
              />
              <CodeInput
                value={code}
                onChange={setCode}
                onComplete={handleCodeComplete}
                error={error || undefined}
                disabled={isLoading}
              />
            </StepWrapper>
          )}

          {/* Name Step */}
          {step === 'name' && (
            <StepWrapper key="name">
              <StepHeader
                title={t('quick.reg.name', language)}
                subtitle={t('quick.reg.subtitle', language)}
              />
              <div className="space-y-4">
                <div className="relative">
                  <User className={cn(
                    'absolute top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400',
                    isRTL ? 'right-4' : 'left-4'
                  )} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('quick.reg.name.placeholder', language)}
                    className={cn(
                      'w-full h-14 rounded-2xl',
                      'bg-neutral-50 border-2 border-transparent',
                      'text-lg font-medium',
                      isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4',
                      'focus:outline-none focus:border-brand-primary focus:bg-white',
                      error && 'border-danger'
                    )}
                  />
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleNameSubmit}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  {t('common.continue', language)}
                </Button>
              </div>
            </StepWrapper>
          )}

          {/* Photo Step */}
          {step === 'photo' && (
            <StepWrapper key="photo">
              <StepHeader
                title={t('quick.reg.photo', language)}
                subtitle={t('quick.reg.photo.subtitle', language)}
              />
              <div className="flex flex-col items-center space-y-6">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'w-32 h-32 rounded-full',
                    'bg-neutral-100 border-2 border-dashed border-neutral-300',
                    'flex items-center justify-center',
                    'overflow-hidden transition-all',
                    'hover:border-brand-primary hover:bg-brand-primary/5'
                  )}
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-10 h-10 text-neutral-400" />
                  )}
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="flex gap-3 w-full">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep('skills')}
                  >
                    {t('common.skip', language)}
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep('skills')}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    {t('common.continue', language)}
                  </Button>
                </div>
              </div>
            </StepWrapper>
          )}

          {/* Skills Step */}
          {step === 'skills' && (
            <StepWrapper key="skills">
              <StepHeader
                title={t('quick.reg.skills', language)}
                subtitle={t('quick.reg.skills.placeholder', language)}
              />
              <div className="grid grid-cols-2 gap-3 mb-6">
                {skillOptions.map((skill) => {
                  const isSelected = selectedSkills.includes(skill.id)
                  return (
                    <motion.button
                      key={skill.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSkillToggle(skill.id)}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-2xl',
                        'transition-all duration-200',
                        isSelected
                          ? 'bg-brand-primary text-white shadow-glow-primary'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      )}
                    >
                      {skill.icon}
                      <span className="font-medium">{skill.labelKey}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 ml-auto" />
                      )}
                    </motion.button>
                  )
                })}
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleComplete}
                disabled={selectedSkills.length === 0}
                glow
              >
                {t('common.done', language)}
              </Button>
            </StepWrapper>
          )}

          {/* Done Step */}
          {step === 'done' && (
            <StepWrapper key="done">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="flex flex-col items-center text-center py-12"
              >
                <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-16 h-16 rounded-full bg-success flex items-center justify-center"
                  >
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  {t('quick.reg.done', language)}
                </h2>
                <p className="text-neutral-600">
                  {t('freeworld.subtitle', language)}
                </p>
              </motion.div>
            </StepWrapper>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {children}
    </motion.div>
  )
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">{title}</h1>
      <p className="text-neutral-600">{subtitle}</p>
    </div>
  )
}
