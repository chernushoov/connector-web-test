'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// ============================================
// WELCOME SCREEN PROPS
// ============================================

export interface WelcomeScreenProps {
  onComplete: () => void
  duration?: number
}

// ============================================
// ANIMATED BACKGROUND PARTICLES
// ============================================

function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
    color: i % 3 === 0 ? '#F5BD42' : i % 3 === 1 ? '#6B5CE7' : '#8B7CF7',
  }))

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
          }}
          animate={{
            y: [-20, -100, -20],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// ANIMATED GRADIENT BACKGROUND
// ============================================

function AnimatedBackground() {
  return (
    <div className="absolute inset-0">
      {/* Base dark gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0a0612 0%, #1a0a2e 30%, #0f0a1a 60%, #150820 100%)',
        }}
      />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: '150%',
          height: '150%',
          top: '-25%',
          left: '-25%',
          background: 'radial-gradient(ellipse at 30% 20%, rgba(107, 92, 231, 0.15) 0%, transparent 50%)',
        }}
      />

      <motion.div
        className="absolute"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        style={{
          width: '120%',
          height: '120%',
          bottom: '-30%',
          right: '-20%',
          background: 'radial-gradient(ellipse at 70% 80%, rgba(245, 189, 66, 0.1) 0%, transparent 50%)',
        }}
      />

      {/* Purple glow center */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(107, 92, 231, 0.2) 0%, transparent 60%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      <FloatingParticles />
    </div>
  )
}

// ============================================
// ANIMATED LOGO
// ============================================

function AnimatedLogo() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-brand-primary/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [1, 2.5, 1],
            opacity: [0.4, 0, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: 'easeOut',
          }}
          style={{
            width: 120,
            height: 120,
          }}
        />
      ))}

      {/* Rotating ring */}
      <motion.div
        className="absolute w-32 h-32"
        animate={{ rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <svg viewBox="0 0 128 128" className="w-full h-full">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6B5CE7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#F5BD42" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6B5CE7" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth="2"
            strokeDasharray="30 20"
          />
        </svg>
      </motion.div>

      {/* Main logo container */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 15,
          delay: 0.3,
        }}
      >
        {/* Glow behind logo */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          animate={{
            boxShadow: [
              '0 0 60px rgba(107, 92, 231, 0.5), 0 0 120px rgba(107, 92, 231, 0.3)',
              '0 0 80px rgba(107, 92, 231, 0.7), 0 0 160px rgba(107, 92, 231, 0.4)',
              '0 0 60px rgba(107, 92, 231, 0.5), 0 0 120px rgba(107, 92, 231, 0.3)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Logo box */}
        <div
          className="relative w-24 h-24 rounded-3xl flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #6B5CE7 0%, #5046C7 50%, #4338CA 100%)',
          }}
        >
          {/* Inner shine */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 40%)',
            }}
          />

          {/* Animated shine sweep */}
          <motion.div
            className="absolute inset-0"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut',
            }}
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              width: '50%',
            }}
          />

          {/* Pin icon */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5, type: 'spring' }}
          >
            <MapPin className="w-12 h-12 text-white" strokeWidth={2.5} />
          </motion.div>
        </div>
      </motion.div>

      {/* Orbiting dots */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={`orbit-${i}`}
          className="absolute"
          style={{
            width: 8,
            height: 8,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 1.5,
          }}
        >
          <motion.div
            className="rounded-full"
            style={{
              width: 8,
              height: 8,
              background: i % 2 === 0 ? '#F5BD42' : '#6B5CE7',
              transform: `translateX(${70}px)`,
              boxShadow: i % 2 === 0
                ? '0 0 10px rgba(245, 189, 66, 0.8)'
                : '0 0 10px rgba(107, 92, 231, 0.8)',
            }}
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.25,
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// WELCOME SCREEN COMPONENT
// ============================================

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [isExiting, setIsExiting] = useState(false)

  const handleContinue = () => {
    setIsExiting(true)
    setTimeout(() => {
      onComplete()
    }, 800)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated background */}
        <AnimatedBackground />

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo */}
          <AnimatedLogo />

          {/* Brand name */}
          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.h1
              className="text-5xl font-bold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #E8E8E8 50%, #FFFFFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              Connector
            </motion.h1>

            {/* Tagline with typing effect */}
            <motion.p
              className="mt-4 text-xl text-neutral-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              Работа рядом с тобой
            </motion.p>

            {/* Underline accent */}
            <motion.div
              className="mt-3 mx-auto h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ delay: 1.4, duration: 0.8, ease: 'easeOut' }}
              style={{
                background: 'linear-gradient(90deg, transparent, #F5BD42, transparent)',
              }}
            />
          </motion.div>

          {/* Feature pills */}
          <motion.div
            className="mt-12 flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.5 }}
          >
            {[
              { icon: '⚡', text: 'Мгновенно' },
              { icon: '📍', text: 'Рядом' },
              { icon: '💰', text: 'Выгодно' },
            ].map((item, i) => (
              <motion.div
                key={item.text}
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(107, 92, 231, 0.15)',
                  border: '1px solid rgba(107, 92, 231, 0.3)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.8 + i * 0.15 }}
              >
                <span>{item.icon}</span>
                <span className="text-sm text-neutral-300">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Continue button */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handleContinue}
              className="px-8 py-4 text-lg shadow-2xl"
              glow
            >
              Продолжить
              <ChevronRight className="w-6 h-6" />
            </Button>
          </motion.div>
        </div>

        {/* Bottom text */}
        <motion.div
          className="absolute bottom-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <p className="text-neutral-600 text-sm">
            Israel · 2024
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
