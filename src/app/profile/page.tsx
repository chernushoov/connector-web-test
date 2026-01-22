'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useUser, useAuth, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, LoadingState } from '@/components/shared'
import { ProfileHeader, StatsGrid, SkillsEditor } from '@/components/profile'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  ChevronRight,
  Settings,
  FileText,
  Star,
  Shield,
  LogOut,
  Globe,
  Bell,
  HelpCircle,
  Award
} from 'lucide-react'
import type { WorkerProfile } from '@/types'

// Mock profile data
const mockProfile: WorkerProfile = {
  id: 'user1',
  phone: '+972501234567',
  name: 'Alex Cohen',
  photoUrl: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
  language: 'he',
  isVerified: true,
  verificationStatus: 'verified',
  skills: ['warehouse', 'moving', 'driving', 'events'],
  availabilityStatus: 'available',
  rating: 4.8,
  reviewCount: 45,
  hourlyRate: 55,
  city: 'Tel Aviv',
  specialization: 'Logistics & Moving',
  experience: 3,
  about: 'Experienced worker with a focus on logistics and moving services. Reliable, punctual, and hardworking.',
  hasCar: true,
  hasTools: false,
  teamSize: 2,
  availability: 'flexible',
  minRate: 45,
  maxRate: 80,
  documents: [],
  portfolio: [],
  completedShifts: 67,
  totalEarned: 28500,
  totalHours: 520,
  reliabilityScore: 95,
  responseTime: 5,
  onTimeRate: 0.98,
  languages: ['Hebrew', 'English', 'Russian'],
  isPro: true,
}

export default function ProfilePage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { quickProfile, workerProfile } = useUser()
  const { isAuthenticated } = useAuth()
  const { logout, updateWorkerProfile } = useConnectorStore()

  const [profile, setProfile] = useState<WorkerProfile | null>(mockProfile)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setProfile(workerProfile as WorkerProfile || mockProfile)
      setIsLoading(false)
    }
    load()
  }, [workerProfile])

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout()
      router.push('/')
    }
  }

  const handleSkillsChange = (skills: string[]) => {
    setProfile(prev => prev ? { ...prev, skills } : prev)
    updateWorkerProfile({ skills } as any)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header title={t('profile.title', language as any)} showBack />
        <LoadingState fullScreen />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Profile header with gradient */}
      <ProfileHeader
        profile={profile}
        isOwn
        onEdit={() => router.push('/profile/edit')}
        onEditPhoto={() => router.push('/profile/edit?section=photo')}
      />

      {/* Stats - overlapping header */}
      <div className="px-4 -mt-6 relative z-10">
        <StatsGrid profile={profile} />
      </div>

      <main className="px-4 py-6 space-y-6">
        {/* About */}
        {profile?.about && (
          <Card>
            <h3 className="font-semibold text-neutral-900 mb-2">
              {t('profile.about', language as any)}
            </h3>
            <p className="text-neutral-600">{profile.about}</p>
          </Card>
        )}

        {/* Skills */}
        <Card>
          <h3 className="font-semibold text-neutral-900 mb-3">
            {t('profile.skills', language as any)}
          </h3>
          <SkillsEditor
            skills={profile?.skills || []}
            editable
            onChange={handleSkillsChange}
          />
        </Card>

        {/* Menu items */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-500 px-1 mb-2">
            Account
          </h3>

          <MenuItem
            icon={<FileText className="w-5 h-5" />}
            label={t('profile.documents', language as any)}
            href="/profile/documents"
          />
          <MenuItem
            icon={<Star className="w-5 h-5" />}
            label={t('profile.reviews', language as any)}
            value={`${profile?.reviewCount || 0}`}
            href="/profile/reviews"
          />
          <MenuItem
            icon={<Award className="w-5 h-5" />}
            label="Badges & Achievements"
            href="#"
          />
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-500 px-1 mb-2">
            {t('profile.settings', language as any)}
          </h3>

          <MenuItem
            icon={<Settings className="w-5 h-5" />}
            label={t('profile.settings', language as any)}
            href="/profile/settings"
          />
          <MenuItem
            icon={<Globe className="w-5 h-5" />}
            label="Language"
            value={language.toUpperCase()}
            href="/profile/settings"
          />
          <MenuItem
            icon={<Bell className="w-5 h-5" />}
            label="Notifications"
            href="/profile/settings"
          />
          <MenuItem
            icon={<HelpCircle className="w-5 h-5" />}
            label="Help & Support"
            href="#"
          />
        </section>

        {/* Logout */}
        <Button
          variant="ghost"
          fullWidth
          onClick={handleLogout}
          leftIcon={<LogOut className="w-5 h-5" />}
          className="text-danger justify-start"
        >
          {t('profile.logout', language as any)}
        </Button>

        {/* Version */}
        <p className="text-center text-xs text-neutral-400 mt-6">
          Connector v2.0.0 • {t('powered', language as any)}
        </p>
      </main>

      <Navigation />
    </div>
  )
}

function MenuItem({
  icon,
  label,
  value,
  href
}: {
  icon: React.ReactNode
  label: string
  value?: string
  href: string
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-neutral-50 transition-colors"
    >
      <span className="text-neutral-400">{icon}</span>
      <span className="flex-1 font-medium text-neutral-900">{label}</span>
      {value && (
        <span className="text-sm text-neutral-500">{value}</span>
      )}
      <ChevronRight className="w-5 h-5 text-neutral-400" />
    </a>
  )
}
