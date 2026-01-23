'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAdminStore } from '@/store/admin'
import { Button } from '@/components/ui/Button'
import { Shield, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin'

  const loginAdmin = useAdminStore((state) => state.loginAdmin)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!email || !isValidEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      await loginAdmin(email, password)
      router.replace(redirect)
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-dark mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-neutral-400 mt-1">Connector Management System</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-danger/10 text-danger rounded-lg text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@connector.app"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="mt-6"
            >
              Sign In
            </Button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-3 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-500 text-center">
              Demo credentials: admin@connector.app / admin123
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-neutral-400 mt-4">
            Access restricted to authorized administrators only.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
