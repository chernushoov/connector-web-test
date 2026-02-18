'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore, useUser } from '@/store'
import { t } from '@/i18n/translations'
import type { CreateTaskInput } from '@/types'
import { RoleTabBar } from '@/components/shared'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import {
  PlusCircle,
  Package,
  Wrench,
  Car,
  Sparkles,
  Home,
  ShoppingCart,
  Camera,
  HelpCircle,
  MapPin,
  DollarSign,
  Check,
} from 'lucide-react'

const TASK_CATEGORIES = [
  { id: 'delivery', icon: Package, label: 'Delivery', color: 'bg-blue-500' },
  { id: 'repair', icon: Wrench, label: 'Repair', color: 'bg-orange-500' },
  { id: 'transport', icon: Car, label: 'Transport', color: 'bg-purple-500' },
  { id: 'cleaning', icon: Sparkles, label: 'Cleaning', color: 'bg-cyan-500' },
  { id: 'home', icon: Home, label: 'Home', color: 'bg-green-500' },
  { id: 'shopping', icon: ShoppingCart, label: 'Shopping', color: 'bg-pink-500' },
  { id: 'photo', icon: Camera, label: 'Photo/Video', color: 'bg-amber-500' },
  { id: 'other', icon: HelpCircle, label: 'Other', color: 'bg-neutral-500' },
]

type Step = 'category' | 'details' | 'confirm'

export default function FreeCreatePage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { currentLocation } = useUser()
  const { setMode, createTask, showToast } = useConnectorStore()

  const [step, setStep] = useState<Step>('category')
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMode('free-world')
  }, [setMode])

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setStep('details')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const lat = currentLocation?.latitude ?? 32.0853
      const lng = currentLocation?.longitude ?? 34.7818

      const taskInput: CreateTaskInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        category: selectedCategory!,
        lat,
        lng,
        addressText: location.trim(),
        budgetType: 'FIXED',
        budgetMin: parseInt(budget) || 0,
        schedule: 'NOW',
      }

      const createdTask = await createTask(taskInput)
      if (createdTask) {
        setCreatedTaskId(createdTask.id)
        setStep('confirm')
      }
    } catch (error) {
      showToast('Failed to create task', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategoryData = TASK_CATEGORIES.find((c) => c.id === selectedCategory)

  return (
    <div
      className={cn('min-h-screen bg-neutral-50 pb-20')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
            <PlusCircle className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">
              {t('tabs.create', language)}
            </h1>
            <p className="text-sm text-neutral-500">
              {step === 'category' && 'Choose a category'}
              {step === 'details' && 'Describe the task'}
              {step === 'confirm' && 'Task created!'}
            </p>
          </div>
        </div>

        {step !== 'confirm' && (
          <div className="flex gap-2 mt-4">
            <div className={cn('h-1 flex-1 rounded-full', 'bg-brand-primary')} />
            <div className={cn('h-1 flex-1 rounded-full', step === 'details' ? 'bg-brand-primary' : 'bg-neutral-200')} />
          </div>
        )}
      </div>

      <div className="px-4 py-4">
        {step === 'category' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-neutral-600 mb-4">What needs to be done?</p>
            <div className="grid grid-cols-2 gap-3">
              {TASK_CATEGORIES.map((category, index) => {
                const Icon = category.icon
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="p-4 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]"
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-3', category.color)}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-medium text-neutral-900">{category.label}</p>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {selectedCategoryData && (
              <div className="flex items-center gap-3 p-3 bg-brand-primary/5 rounded-xl">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', selectedCategoryData.color)}>
                  <selectedCategoryData.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">{selectedCategoryData.label}</span>
                <button onClick={() => setStep('category')} className="ml-auto text-sm text-brand-primary">
                  Change
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Task Title</label>
              <Input placeholder="e.g. Help move a sofa" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <TextArea placeholder="Describe the details..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input className="pl-10" placeholder="Where the task needs to be done" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Budget (₪)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input className="pl-10" type="number" placeholder="How much are you willing to pay" value={budget} onChange={(e) => setBudget(e.target.value)} />
              </div>
            </div>

            <div className="pt-4">
              <Button fullWidth onClick={handleSubmit} disabled={!title || !description || !location || !budget || isSubmitting} loading={isSubmitting}>
                Create Task
              </Button>
              <button onClick={() => setStep('category')} className="w-full mt-3 py-2 text-neutral-500 text-sm">
                Back
              </button>
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Task Created!</h2>
            <p className="text-neutral-500 mb-6">Executors will see your task and can respond</p>

            <Card className="p-4 text-left mb-6">
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-neutral-500 mb-3">{description}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-neutral-400">
                  <MapPin className="w-4 h-4" />
                  {location}
                </div>
                <span className="font-bold text-brand-primary">₪{budget}</span>
              </div>
            </Card>

            <div className="space-y-3">
              <Button fullWidth onClick={() => router.push(createdTaskId ? `/free/task/${createdTaskId}` : '/free')}>
                Go to Task
              </Button>
              <Button fullWidth variant="outline" onClick={() => { setStep('category'); setSelectedCategory(null); setTitle(''); setDescription(''); setLocation(''); setBudget(''); setCreatedTaskId(null); }}>
                Create Another
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <RoleTabBar />
    </div>
  )
}
