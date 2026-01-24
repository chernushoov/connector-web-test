'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useAuth, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { PhoneInput, CodeInput, SocialButtons } from '@/components/auth'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/shared'
import { ArrowRight } from 'lucide-react'

type AuthStep = 'phone' | 'code'

export default function LoginPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { isLoading } = useAuth()
  const { setPhone, setVerificationCode, login, showToast } = useConnectorStore()

  const [step, setStep] = useState<AuthStep>('phone')
  const [phone, setPhoneLocal] = useState('')
  const [code, setCodeLocal] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handlePhoneSubmit = async () => {
    if (phone.replace(/\D/g, '').length < 12) {
      setError(t('auth.error.phone', language))
      return
    }

    setError(null)
    setPhone(phone)

    // Mock SMS sending
    await new Promise((resolve) => setTimeout(resolve, 500))
    setStep('code')
  }

  const handleCodeComplete = async (completedCode: string) => {
    setError(null)
    setVerificationCode(completedCode)

    try {
      await login()
      // Redirect to home or previous page
      router.push('/')
    } catch {
      setError(t('auth.error.code', language))
      setCodeLocal('')
    }
  }

  const handleBack = () => {
    setStep('phone')
    setCodeLocal('')
    setError(null)
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-brand-primary/5 to-white"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        showBack={step === 'code'}
        onBack={handleBack}
        transparent
      />

      <main className="px-6 py-8">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-brand mb-4">
            <span className="text-white font-bold text-3xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            {t('auth.title', language)}
          </h1>
          <p className="text-neutral-600">
            {t('auth.subtitle', language)}
          </p>
        </motion.div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <PhoneInput
                value={phone}
                onChange={setPhoneLocal}
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

              <SocialButtons
                onApple={() => showToast('Apple Sign In coming soon', 'info')}
                onGoogle={() => showToast('Google Sign In coming soon', 'info')}
                disabled={isLoading}
              />
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Phone display */}
              <div className="text-center mb-6">
                <p className="text-neutral-600 mb-1">
                  {t('auth.code', language)}
                </p>
                <p className="text-lg font-semibold" dir="ltr">
                  {phone}
                </p>
              </div>

              <CodeInput
                value={code}
                onChange={setCodeLocal}
                onComplete={handleCodeComplete}
                error={error || undefined}
                disabled={isLoading}
              />

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => handleCodeComplete(code)}
                isLoading={isLoading}
                disabled={code.length < 6}
              >
                {t('auth.verify', language)}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-neutral-400">
            {t('powered', language)}
          </p>
        </motion.div>
      </main>
    </div>
  )
}
