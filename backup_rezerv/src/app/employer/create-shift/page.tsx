'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Header } from '@/components/shared'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Car,
  Wrench,
  Star,
  Briefcase,
  Zap,
  Shield
} from 'lucide-react'
import type { ShiftPosting, ShiftUrgency } from '@/types'

type Step = 1 | 2 | 3 | 4

interface ShiftFormData {
  // Step 1: What
  title: string
  description: string
  requiredSkills: string[]

  // Step 2: When
  date: string
  startTime: string
  endTime: string
  urgency: ShiftUrgency

  // Step 3: Where
  address: string
  city: string

  // Step 4: Requirements
  baseRate: number
  slots: number
  needsCar: boolean
  needsTools: boolean
  needsTeam: number
  minExperience: number
  minRating: number
  paymentGuarantee: boolean
}

const skillOptions = [
  'Warehouse', 'Moving', 'Cleaning', 'Driving', 'Events',
  'Construction', 'Painting', 'Cooking', 'Retail', 'Other'
]

const initialFormData: ShiftFormData = {
  title: '',
  description: '',
  requiredSkills: [],
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '17:00',
  urgency: 'today',
  address: '',
  city: 'Tel Aviv',
  baseRate: 50,
  slots: 1,
  needsCar: false,
  needsTools: false,
  needsTeam: 0,
  minExperience: 0,
  minRating: 0,
  paymentGuarantee: true,
}

export default function CreateShiftPage() {
  const { language, isRTL } = useUI()
  const { createShift, showToast } = useConnectorStore()

  const [step, setStep] = useState<Step>(1)
  const [formData, setFormData] = useState<ShiftFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const updateForm = (updates: Partial<ShiftFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title.trim().length > 0
      case 2:
        return formData.date && formData.startTime && formData.endTime
      case 3:
        return formData.city.trim().length > 0
      case 4:
        return formData.baseRate > 0 && formData.slots > 0
      default:
        return true
    }
  }

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as Step)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
    } else {
      window.history.back()
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const shiftData = {
        title: formData.title,
        description: formData.description,
        employer: {
          id: 'current_user',
          name: 'Current User',
          company: 'My Company',
          phone: '+972501234567',
          rating: 5.0,
          reviewCount: 0,
          totalPaid: 0,
          isVerified: true,
        },
        location: {
          latitude: 32.0853,
          longitude: 34.7818,
          address: formData.address,
        },
        city: formData.city,
        date: new Date(formData.date),
        startTime: formData.startTime,
        endTime: formData.endTime,
        urgency: formData.urgency,
        baseRate: formData.baseRate,
        surgeMultiplier: formData.urgency === 'instant' ? 1.2 : 1.0,
        totalEstimate: formData.baseRate * 8,
        paymentGuarantee: formData.paymentGuarantee,
        slots: formData.slots,
        filled: 0,
        applicants: 0,
        requirements: {
          needsCar: formData.needsCar,
          needsTools: formData.needsTools,
          needsTeam: formData.needsTeam,
          minExperience: formData.minExperience,
          minRating: formData.minRating,
        },
        requiredSkills: formData.requiredSkills,
        status: 'open' as const,
        isInstant: formData.urgency === 'instant',
        acceptsTeams: formData.needsTeam > 0,
        hasEscrow: true,
        hasInsurance: false,
        workplaceRating: 5.0,
        viewCount: 0,
      }

      await createShift(shiftData as any)
      showToast(t('task.published', language as any), 'success')
      window.location.href = '/employer'
    } catch (error) {
      showToast('Failed to create shift', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-neutral-50"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        title="Create Shift"
        showBack
        onBack={handleBack}
      />

      {/* Progress bar */}
      <div className="px-4">
        <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-brand"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-sm text-neutral-500 mt-2">
          Step {step} of {totalSteps}
        </p>
      </div>

      <main className="px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Step 1: What */}
          {step === 1 && (
            <StepWrapper key="step1">
              <h2 className="text-xl font-bold text-neutral-900 mb-1">
                {t('task.what', language as any)}
              </h2>
              <p className="text-neutral-500 mb-6">
                Describe the job you need done
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateForm({ title: e.target.value })}
                    placeholder="e.g., Warehouse Helper"
                    className="w-full h-12 px-4 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateForm({ description: e.target.value })}
                    placeholder="What will the worker be doing?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Required Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map((skill) => {
                      const isSelected = formData.requiredSkills.includes(skill.toLowerCase())
                      return (
                        <button
                          key={skill}
                          onClick={() => {
                            const skillLower = skill.toLowerCase()
                            updateForm({
                              requiredSkills: isSelected
                                ? formData.requiredSkills.filter(s => s !== skillLower)
                                : [...formData.requiredSkills, skillLower]
                            })
                          }}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm font-medium',
                            'transition-all duration-200',
                            isSelected
                              ? 'bg-brand-primary text-white'
                              : 'bg-white text-neutral-700 border border-neutral-200'
                          )}
                        >
                          {skill}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </StepWrapper>
          )}

          {/* Step 2: When */}
          {step === 2 && (
            <StepWrapper key="step2">
              <h2 className="text-xl font-bold text-neutral-900 mb-1">
                {t('task.when', language as any)}
              </h2>
              <p className="text-neutral-500 mb-6">
                Set the date and time
              </p>

              <div className="space-y-4">
                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Urgency
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'instant', label: t('task.when.now', language as any), icon: <Zap className="w-4 h-4" /> },
                      { value: 'today', label: t('task.when.today', language as any), icon: <Clock className="w-4 h-4" /> },
                      { value: 'scheduled', label: 'Scheduled', icon: <Calendar className="w-4 h-4" /> },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateForm({ urgency: option.value as ShiftUrgency })}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl',
                          'transition-all duration-200',
                          formData.urgency === option.value
                            ? 'bg-brand-primary text-white shadow-glow-primary'
                            : 'bg-white text-neutral-700 border border-neutral-200'
                        )}
                      >
                        {option.icon}
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateForm({ date: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                {/* Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Start time
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => updateForm({ startTime: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      End time
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => updateForm({ endTime: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>
              </div>
            </StepWrapper>
          )}

          {/* Step 3: Where */}
          {step === 3 && (
            <StepWrapper key="step3">
              <h2 className="text-xl font-bold text-neutral-900 mb-1">
                {t('task.where', language as any)}
              </h2>
              <p className="text-neutral-500 mb-6">
                Set the work location
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    City
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => updateForm({ city: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="Tel Aviv">Tel Aviv</option>
                    <option value="Jerusalem">Jerusalem</option>
                    <option value="Haifa">Haifa</option>
                    <option value="Rishon LeZion">Rishon LeZion</option>
                    <option value="Petah Tikva">Petah Tikva</option>
                    <option value="Ashdod">Ashdod</option>
                    <option value="Netanya">Netanya</option>
                    <option value="Beer Sheva">Beer Sheva</option>
                    <option value="Ramat Gan">Ramat Gan</option>
                    <option value="Herzliya">Herzliya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Address (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateForm({ address: e.target.value })}
                    placeholder="Street address or landmark"
                    className="w-full h-12 px-4 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <Card variant="filled" className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-brand-primary" />
                  <div>
                    <p className="text-sm font-medium">Use current location</p>
                    <p className="text-xs text-neutral-500">Auto-fill based on your location</p>
                  </div>
                </Card>
              </div>
            </StepWrapper>
          )}

          {/* Step 4: Requirements */}
          {step === 4 && (
            <StepWrapper key="step4">
              <h2 className="text-xl font-bold text-neutral-900 mb-1">
                {t('shift.requirements', language as any)}
              </h2>
              <p className="text-neutral-500 mb-6">
                Set payment and requirements
              </p>

              <div className="space-y-4">
                {/* Rate */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Hourly Rate (₪)
                  </label>
                  <input
                    type="number"
                    value={formData.baseRate}
                    onChange={(e) => updateForm({ baseRate: Number(e.target.value) })}
                    min={30}
                    max={200}
                    className="w-full h-12 px-4 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-primary text-xl font-bold"
                  />
                  <p className="text-sm text-neutral-500 mt-1">
                    Market average: ₪50-70/hour
                  </p>
                </div>

                {/* Slots */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Workers Needed
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => updateForm({ slots: Math.max(1, formData.slots - 1) })}
                      className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-xl font-bold"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold w-12 text-center">{formData.slots}</span>
                    <button
                      onClick={() => updateForm({ slots: formData.slots + 1 })}
                      className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-xl font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Requirements toggles */}
                <div className="space-y-3">
                  <ToggleOption
                    icon={<Car className="w-5 h-5" />}
                    label={t('worker.has.car', language as any)}
                    checked={formData.needsCar}
                    onChange={(checked) => updateForm({ needsCar: checked })}
                  />
                  <ToggleOption
                    icon={<Wrench className="w-5 h-5" />}
                    label={t('worker.has.tools', language as any)}
                    checked={formData.needsTools}
                    onChange={(checked) => updateForm({ needsTools: checked })}
                  />
                  <ToggleOption
                    icon={<Shield className="w-5 h-5" />}
                    label={t('shift.escrow', language as any)}
                    description="Payment guaranteed to worker"
                    checked={formData.paymentGuarantee}
                    onChange={(checked) => updateForm({ paymentGuarantee: checked })}
                  />
                </div>

                {/* Summary */}
                <Card variant="accent" className="mt-6">
                  <h3 className="font-semibold mb-3">Estimated Cost</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Rate × Hours × Workers</span>
                      <span>₪{formData.baseRate} × 8h × {formData.slots}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span className="text-brand-primary">
                        ₪{formData.baseRate * 8 * formData.slots}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </StepWrapper>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button
              variant="ghost"
              size="lg"
              onClick={handleBack}
              leftIcon={<ArrowLeft className="w-5 h-5" />}
            >
              {t('common.back', language as any)}
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleNext}
            disabled={!canProceed()}
            isLoading={isSubmitting}
            rightIcon={step < 4 ? <ArrowRight className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          >
            {step < 4 ? t('common.next', language as any) : t('task.publish', language as any)}
          </Button>
        </div>
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
    >
      {children}
    </motion.div>
  )
}

function ToggleOption({
  icon,
  label,
  description,
  checked,
  onChange
}: {
  icon: React.ReactNode
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-neutral-200"
    >
      <div className="flex items-center gap-3">
        <span className="text-neutral-400">{icon}</span>
        <div className="text-left">
          <p className="font-medium text-neutral-900">{label}</p>
          {description && (
            <p className="text-xs text-neutral-500">{description}</p>
          )}
        </div>
      </div>
      <div
        className={cn(
          'w-11 h-6 rounded-full p-0.5 transition-colors duration-200',
          checked ? 'bg-brand-primary' : 'bg-neutral-200'
        )}
      >
        <motion.div
          className="w-5 h-5 rounded-full bg-white shadow"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  )
}
