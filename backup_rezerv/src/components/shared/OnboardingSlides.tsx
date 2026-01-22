'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Zap, MapPin, Shield, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// ============================================
// ONBOARDING SLIDES PROPS
// ============================================

export interface OnboardingSlidesProps {
  onComplete: (startTour: boolean) => void
}

// ============================================
// SLIDE DATA
// ============================================

const slides = [
  {
    id: 1,
    icon: Zap,
    title: 'Мгновенный найм',
    subtitle: 'Работа за секунды',
    description: 'Находите работников или работу прямо сейчас. Без резюме, без интервью, без ожидания.',
    color: '#6B5CE7',
    gradient: 'from-purple-500 to-purple-700',
  },
  {
    id: 2,
    icon: MapPin,
    title: 'Работа на карте',
    subtitle: 'Рядом с вами',
    description: 'Видите всех доступных работников и задачи на карте в реальном времени. Выбирайте ближайших.',
    color: '#F5BD42',
    gradient: 'from-yellow-400 to-yellow-600',
  },
  {
    id: 3,
    icon: Shield,
    title: 'Безопасность',
    subtitle: 'Проверенные профили',
    description: 'Все пользователи верифицированы. Рейтинги, отзывы и система безопасных платежей.',
    color: '#34C759',
    gradient: 'from-green-500 to-green-700',
  },
  {
    id: 4,
    icon: TrendingUp,
    title: 'Прозрачные цены',
    subtitle: 'Без комиссий',
    description: 'Договаривайтесь напрямую. Мы не берем процент с ваших заработков. Вся сумма - ваша.',
    color: '#FF9500',
    gradient: 'from-orange-500 to-orange-700',
  },
  {
    id: 5,
    icon: Users,
    title: 'Сообщество',
    subtitle: 'Тысячи активных пользователей',
    description: 'Присоединяйтесь к растущему сообществу работников и работодателей по всему Израилю.',
    color: '#6B5CE7',
    gradient: 'from-purple-600 to-pink-600',
  },
]

// ============================================
// ONBOARDING SLIDES COMPONENT
// ============================================

export function OnboardingSlides({ onComplete }: OnboardingSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1)

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1)
      setCurrentSlide(currentSlide + 1)
    }
  }

  const handleSkip = () => {
    onComplete(false)
  }

  const handleFinish = (startTour: boolean) => {
    onComplete(startTour)
  }

  const slide = slides[currentSlide]
  const Icon = slide.icon
  const isLastSlide = currentSlide === slides.length - 1

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Skip button */}
      {!isLastSlide && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 px-4 py-2 text-sm text-neutral-500 hover:text-neutral-700"
        >
          Пропустить
        </motion.button>
      )}

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -100 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md flex flex-col items-center text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center mb-8 shadow-lg`}
            >
              <Icon className="w-12 h-12 text-white" strokeWidth={2} />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-neutral-900 mb-2"
            >
              {slide.title}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg font-medium text-brand-primary mb-6"
            >
              {slide.subtitle}
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-base text-neutral-600 leading-relaxed max-w-sm"
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-40 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <motion.div
            key={index}
            initial={false}
            animate={{
              width: currentSlide === index ? 32 : 8,
              backgroundColor: currentSlide === index ? slide.color : '#E5E5E5',
            }}
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full"
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-neutral-100">
        {!isLastSlide ? (
          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            className="w-full"
          >
            Далее
            <ChevronRight className="w-5 h-5" />
          </Button>
        ) : (
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleFinish(true)}
              className="w-full"
            >
              Пройти интерактивный гайд
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => handleFinish(false)}
              className="w-full"
            >
              Начать без гайда
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
