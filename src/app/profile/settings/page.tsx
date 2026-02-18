'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useUser, useConnectorStore } from '@/store'
import { t, languages } from '@/i18n/translations'
import { Header, Navigation } from '@/components/shared'
import { LanguageSwitcher } from '@/components/shared'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Globe,
  Bell,
  Moon,
  Sun,
  Shield,
  Trash2,
  ChevronRight,
  Check,
  User as UserIcon,
} from 'lucide-react'
import type { Language, UserMode } from '@/types'

export default function SettingsPage() {
  const router = useRouter()
  const { language, isRTL, theme } = useUI()
  const { mode } = useUser()
  const { setLanguage, toggleTheme, setMode } = useConnectorStore()

  const [notifications, setNotifications] = useState({
    shifts: true,
    messages: true,
    applications: true,
    marketing: false,
  })

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        title={t('profile.settings', language as any)}
        showBack
      />

      <main className="px-4 py-4 space-y-6">
        {/* Language */}
        <section>
          <h3 className="text-sm font-medium text-neutral-500 px-1 mb-3">
            Language
          </h3>
          <Card>
            <div className="space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl',
                    'transition-colors duration-200',
                    language === lang.code
                      ? 'bg-brand-primary/10'
                      : 'hover:bg-neutral-50'
                  )}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{lang.nativeName}</p>
                    <p className="text-sm text-neutral-500">{lang.name}</p>
                  </div>
                  {language === lang.code && (
                    <Check className="w-5 h-5 text-brand-primary" />
                  )}
                </button>
              ))}
            </div>
          </Card>
        </section>

        {/* Theme */}
        <section>
          <h3 className="text-sm font-medium text-neutral-500 px-1 mb-3">
            Appearance
          </h3>
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'light' ? (
                <Sun className="w-5 h-5 text-neutral-400" />
              ) : (
                <Moon className="w-5 h-5 text-neutral-400" />
              )}
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-neutral-500">
                  {theme === 'light' ? 'Light mode' : 'Dark mode'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={cn(
                'w-11 h-6 rounded-full p-0.5 transition-colors duration-200',
                theme === 'dark' ? 'bg-brand-primary' : 'bg-neutral-200'
              )}
            >
              <motion.div
                className="w-5 h-5 rounded-full bg-white shadow"
                animate={{ x: theme === 'dark' ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </Card>
        </section>

        {/* Account Mode */}
        <section>
          <h3 className="text-sm font-medium text-neutral-500 px-1 mb-3">
            Account Mode
          </h3>
          <Card className="space-y-0 divide-y divide-neutral-100">
            <ModeOption
              icon={<UserIcon className="w-5 h-5" />}
              label="Free User"
              description="Create and complete quick tasks"
              selected={mode === 'free-world'}
              onClick={() => {
                setMode('free-world')
                router.push('/free')
              }}
            />
          </Card>
        </section>

        {/* Notifications */}
        <section>
          <h3 className="text-sm font-medium text-neutral-500 px-1 mb-3">
            Notifications
          </h3>
          <Card className="space-y-0 divide-y divide-neutral-100">
            <NotificationToggle
              icon={<Bell className="w-5 h-5" />}
              label="New shifts"
              description="Get notified about matching shifts"
              checked={notifications.shifts}
              onChange={(checked) => setNotifications(prev => ({ ...prev, shifts: checked }))}
            />
            <NotificationToggle
              icon={<Bell className="w-5 h-5" />}
              label="Messages"
              description="Direct messages from employers"
              checked={notifications.messages}
              onChange={(checked) => setNotifications(prev => ({ ...prev, messages: checked }))}
            />
            <NotificationToggle
              icon={<Bell className="w-5 h-5" />}
              label="Applications"
              description="Updates on your applications"
              checked={notifications.applications}
              onChange={(checked) => setNotifications(prev => ({ ...prev, applications: checked }))}
            />
            <NotificationToggle
              icon={<Bell className="w-5 h-5" />}
              label="Marketing"
              description="Tips, offers, and promotions"
              checked={notifications.marketing}
              onChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
            />
          </Card>
        </section>

        {/* Privacy */}
        <section>
          <h3 className="text-sm font-medium text-neutral-500 px-1 mb-3">
            Privacy & Security
          </h3>
          <Card className="space-y-0 divide-y divide-neutral-100">
            <MenuItem
              icon={<Shield className="w-5 h-5" />}
              label="Privacy policy"
              onClick={() => {}}
            />
            <MenuItem
              icon={<Shield className="w-5 h-5" />}
              label="Terms of service"
              onClick={() => {}}
            />
          </Card>
        </section>

        {/* Danger zone */}
        <section>
          <h3 className="text-sm font-medium text-danger px-1 mb-3">
            Danger Zone
          </h3>
          <Card>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                  // Handle delete
                }
              }}
              className="w-full flex items-center gap-3 p-3 text-danger"
            >
              <Trash2 className="w-5 h-5" />
              <span className="font-medium">{t('profile.delete', language as any)}</span>
            </button>
          </Card>
        </section>
      </main>

      <Navigation />
    </div>
  )
}

function NotificationToggle({
  icon,
  label,
  description,
  checked,
  onChange
}: {
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-3">
        <span className="text-neutral-400">{icon}</span>
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
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
      </button>
    </div>
  )
}

function MenuItem({
  icon,
  label,
  onClick
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 transition-colors"
    >
      <span className="text-neutral-400">{icon}</span>
      <span className="flex-1 text-left font-medium">{label}</span>
      <ChevronRight className="w-5 h-5 text-neutral-400" />
    </button>
  )
}

function ModeOption({
  icon,
  label,
  description,
  selected,
  onClick
}: {
  icon: React.ReactNode
  label: string
  description: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 transition-colors',
        selected ? 'bg-brand-primary/10' : 'hover:bg-neutral-50'
      )}
    >
      <span className={selected ? 'text-brand-primary' : 'text-neutral-400'}>
        {icon}
      </span>
      <div className="flex-1 text-left">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      {selected && <Check className="w-5 h-5 text-brand-primary" />}
    </button>
  )
}
