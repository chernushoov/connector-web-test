'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore, useAuth } from '@/store'
import { Button } from '@/components/ui/Button'
import {
  ArrowRight,
  ArrowLeft,
  Camera,
  User,
  Building2,
  Check,
  Wrench,
  Truck,
  Package,
  Paintbrush,
  Sparkles,
  ChefHat,
  Warehouse,
  Calendar,
  MoreHorizontal,
} from 'lucide-react'

type ProfileStep = 'name' | 'photo' | 'skills' | 'done'

const WORKER_SKILLS = [
  { id: 'handyman', icon: Wrench, label: { ru: 'Мастер', he: 'שיפוצניק', en: 'Handyman', ar: 'حرفي' } },
  { id: 'driver', icon: Truck, label: { ru: 'Водитель', he: 'נהג', en: 'Driver', ar: 'سائق' } },
  { id: 'mover', icon: Package, label: { ru: 'Грузчик', he: 'סבל', en: 'Mover', ar: 'ناقل' } },
  { id: 'cleaner', icon: Sparkles, label: { ru: 'Уборка', he: 'ניקיון', en: 'Cleaner', ar: 'منظف' } },
  { id: 'painter', icon: Paintbrush, label: { ru: 'Маляр', he: 'צבע', en: 'Painter', ar: 'دهان' } },
  { id: 'cook', icon: ChefHat, label: { ru: 'Повар', he: 'טבח', en: 'Cook', ar: 'طباخ' } },
  { id: 'warehouse', icon: Warehouse, label: { ru: 'Склад', he: 'מחסן', en: 'Warehouse', ar: 'مستودع' } },
  { id: 'events', icon: Calendar, label: { ru: 'Ивенты', he: 'אירועים', en: 'Events', ar: 'فعاليات' } },
  { id: 'other', icon: MoreHorizontal, label: { ru: 'Другое', he: 'אחר', en: 'Other', ar: 'أخرى' } },
]

export default function ProfileSetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'free'
  const { language, isRTL } = useUI()
  const { finishQuickRegistration, updateQuickProfile } = useConnectorStore()
  const { userId, phone } = useAuth()

  const [step, setStep] = useState<ProfileStep>('name')
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const isWorker = role === 'worker'
  const isEmployer = role === 'employer'

  const steps: ProfileStep[] = isWorker ? ['name', 'photo', 'skills', 'done'] : ['name', 'photo', 'done']
  const currentStepIndex = steps.indexOf(step)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNameSubmit = () => {
    if (name.trim().length < 2) { setError(language === 'ru' ? 'Введите ваше имя' : 'Enter your name'); return }
    if (isEmployer && companyName.trim().length < 2) { setError(language === 'ru' ? 'Введите название компании' : 'Enter company name'); return }
    setError(null)
    setStep('photo')
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoNext = () => {
    if (isWorker) setStep('skills')
    else completeProfile()
  }

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills((prev) => prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId])
  }

  const handleSkillsSubmit = () => {
    if (selectedSkills.length === 0) { setError(language === 'ru' ? 'Выберите хотя бы один навык' : 'Select at least one skill'); return }
    completeProfile()
  }

  const completeProfile = () => {
    const profile = {
      id: userId || 'user_' + Date.now(),
      phone: phone || '',
      name,
      photoUrl: photoPreview || undefined,
      skills: selectedSkills,
      availabilityStatus: 'available' as const,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      language,
      isVerified: true,
      verificationStatus: 'verified' as const,
    }
    finishQuickRegistration(profile)
    localStorage.setItem('connector-profile-setup', 'true')
    setStep('done')
    setTimeout(() => router.replace('/free'), 2000)
  }

  const handleBack = () => {
    const idx = steps.indexOf(step)
    if (idx > 0) { setStep(steps[idx - 1]); setError(null) }
    else router.back()
  }

  const getTitle = () => {
    const titles: Record<ProfileStep, Record<string, string>> = {
      name: { ru: isEmployer ? 'О вашей компании' : 'Как вас зовут?', he: isEmployer ? 'על החברה שלכם' : 'איך קוראים לכם?', en: isEmployer ? 'About your company' : 'What\'s your name?', ar: isEmployer ? 'عن شركتك' : 'ما اسمك؟' },
      photo: { ru: 'Фото профиля', he: 'תמונת פרופיל', en: 'Profile photo', ar: 'صورة الملف الشخصي' },
      skills: { ru: 'Ваши навыки', he: 'הכישורים שלכם', en: 'Your skills', ar: 'مهاراتك' },
      done: { ru: 'Готово!', he: 'מוכן!', en: 'All set!', ar: 'تم!' },
    }
    return titles[step][language] || titles[step].en
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-primary/5 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {step !== 'done' && (
        <div className="px-4 pt-4">
          <button onClick={handleBack} className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
            <ArrowLeft className={cn('w-5 h-5 text-neutral-600', isRTL && 'rotate-180')} />
          </button>
        </div>
      )}

      {step !== 'done' && (
        <div className="px-6 mt-2 mb-6">
          <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>
      )}

      <main className="flex-1 px-6 py-4">
        <motion.div key={step} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">{getTitle()}</h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'name' && (
            <motion.div key="name" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5 max-w-sm mx-auto">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">{isEmployer ? 'Contact person' : 'Name'}</label>
                <div className="relative">
                  <User className={cn('absolute top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400', isRTL ? 'right-4' : 'left-4')} />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                    className={cn('w-full h-14 rounded-2xl bg-neutral-50 border-2 border-transparent text-lg font-medium focus:outline-none focus:border-brand-primary focus:bg-white', isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4', error && 'border-red-300')} />
                </div>
              </div>
              {isEmployer && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Company name</label>
                  <div className="relative">
                    <Building2 className={cn('absolute top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400', isRTL ? 'right-4' : 'left-4')} />
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Ltd."
                      className={cn('w-full h-14 rounded-2xl bg-neutral-50 border-2 border-transparent text-lg font-medium focus:outline-none focus:border-brand-primary focus:bg-white', isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4')} />
                  </div>
                </div>
              )}
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <Button variant="primary" size="lg" fullWidth onClick={handleNameSubmit} rightIcon={<ArrowRight className="w-5 h-5" />}>Continue</Button>
            </motion.div>
          )}

          {step === 'photo' && (
            <motion.div key="photo" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center space-y-6 max-w-sm mx-auto">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => fileInputRef.current?.click()}
                className={cn('w-36 h-36 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center overflow-hidden transition-all hover:border-brand-primary hover:bg-brand-primary/5')}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                    <span className="text-sm text-neutral-500">Add photo</span>
                  </div>
                )}
              </motion.button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <div className="flex gap-3 w-full">
                <Button variant="ghost" size="lg" className="flex-1" onClick={handlePhotoNext}>Skip</Button>
                <Button variant="primary" size="lg" className="flex-1" onClick={handlePhotoNext} rightIcon={<ArrowRight className="w-5 h-5" />}>Next</Button>
              </div>
            </motion.div>
          )}

          {step === 'skills' && (
            <motion.div key="skills" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-sm mx-auto">
              <div className="grid grid-cols-3 gap-3 mb-6">
                {WORKER_SKILLS.map((skill) => {
                  const Icon = skill.icon
                  const isSelected = selectedSkills.includes(skill.id)
                  const label = skill.label[language as keyof typeof skill.label] || skill.label.en
                  return (
                    <motion.button key={skill.id} whileTap={{ scale: 0.95 }} onClick={() => handleSkillToggle(skill.id)}
                      className={cn('relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                        isSelected ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300')}>
                      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', isSelected ? 'bg-brand-primary/10' : 'bg-neutral-100')}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-medium text-center leading-tight">{label}</span>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
              {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}
              <Button variant="primary" size="lg" fullWidth onClick={handleSkillsSubmit} disabled={selectedSkills.length === 0} glow>Done</Button>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-16">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}>
                  <Check className="w-12 h-12 text-green-600" />
                </motion.div>
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-2xl font-bold text-neutral-900 mb-2">
                Welcome!
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-neutral-600">
                Your profile is ready. Redirecting...
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6">
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                  Loading...
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
