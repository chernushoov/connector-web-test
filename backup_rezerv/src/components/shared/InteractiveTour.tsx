'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Briefcase, Building2, User, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// ============================================
// INTERACTIVE TOUR PROPS
// ============================================

export interface InteractiveTourProps {
  onComplete: () => void
}

// ============================================
// TOUR STEPS
// ============================================

interface TourStep {
  id: string
  title: string
  description: string
  targetElement?: string
  position: 'top' | 'bottom' | 'center'
  highlightArea?: {
    top?: string
    bottom?: string
    left?: string
    right?: string
    width?: string
    height?: string
  }
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Добро пожаловать!',
    description: 'Давайте за 30 секунд покажем вам все возможности Connector',
    position: 'center',
  },
  {
    id: 'map',
    title: 'Карта в реальном времени',
    description: 'Здесь вы видите всех доступных работников и задачи рядом с вами. Кликните на маркер чтобы узнать подробности.',
    position: 'top',
    targetElement: 'map-view',
  },
  {
    id: 'search',
    title: 'Поиск',
    description: 'Быстро находите нужных специалистов или работу по категориям и локации',
    position: 'top',
    targetElement: 'search-bar',
    highlightArea: {
      top: '60px',
      left: '16px',
      right: '16px',
      height: '48px',
    },
  },
  {
    id: 'tabs',
    title: 'Переключение режимов',
    description: 'Смотрите карту, список работников или список задач - выбирайте удобный формат',
    position: 'top',
    targetElement: 'tab-bar',
    highlightArea: {
      top: '120px',
      left: '0',
      right: '0',
      height: '48px',
    },
  },
  {
    id: 'navigation',
    title: 'Навигация',
    description: 'Переключайтесь между режимами: исследуйте карту, ищите работу или нанимайте работников',
    position: 'bottom',
    targetElement: 'bottom-nav',
    highlightArea: {
      bottom: '0',
      left: '0',
      right: '0',
      height: '64px',
    },
  },
  {
    id: 'ready',
    title: 'Готово!',
    description: 'Теперь вы готовы начать работу. Зарегистрируйтесь чтобы откликаться на задачи или публиковать свои предложения.',
    position: 'center',
  },
]

// ============================================
// INTERACTIVE TOUR COMPONENT
// ============================================

export function InteractiveTour({ onComplete }: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const step = tourSteps[currentStep]

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  const isLastStep = currentStep === tourSteps.length - 1

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay with spotlight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 pointer-events-auto"
        onClick={handleSkip}
      />

      {/* Highlight area */}
      <AnimatePresence mode="wait">
        {step.highlightArea && (
          <motion.div
            key={step.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bg-white/5 border-2 border-brand-primary rounded-2xl pointer-events-none"
            style={{
              top: step.highlightArea.top,
              bottom: step.highlightArea.bottom,
              left: step.highlightArea.left,
              right: step.highlightArea.right,
              width: step.highlightArea.width,
              height: step.highlightArea.height,
            }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(107, 92, 231, 0.7)',
                  '0 0 0 20px rgba(107, 92, 231, 0)',
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
              className="absolute inset-0 rounded-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: step.position === 'top' ? 20 : -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`absolute left-4 right-4 pointer-events-auto ${
            step.position === 'center'
              ? 'top-1/2 -translate-y-1/2'
              : step.position === 'top'
              ? 'top-48'
              : 'bottom-24'
          }`}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto">
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="pr-8">
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Progress */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-1.5">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-brand-primary'
                        : index < currentStep
                        ? 'w-1.5 bg-brand-primary/50'
                        : 'w-1.5 bg-neutral-200'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {!isLastStep && (
                  <Button variant="ghost" size="sm" onClick={handleSkip}>
                    Пропустить
                  </Button>
                )}
                <Button variant="primary" size="sm" onClick={handleNext}>
                  {isLastStep ? 'Начать' : 'Далее'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
