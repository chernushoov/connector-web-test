'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore, useAuth, useFreeWorld } from '@/store'
import { t } from '@/i18n/translations'
import { RoleTabBar } from '@/components/shared'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  User,
  Wifi,
  WifiOff,
  Star,
  Settings,
  ChevronRight,
  Shield,
  LogOut,
  Briefcase,
  CheckCircle,
  Plus,
  X,
} from 'lucide-react'

const AVAILABLE_SKILLS = [
  'Moving',
  'Repair',
  'Cleaning',
  'Delivery',
  'Furniture Assembly',
  'Electrical',
  'Plumbing',
  'Shopping',
  'Photo/Video',
  'Tutoring',
  'Translation',
  'IT Help',
]

export default function FreeProfilePage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { setMode, toggleAvailability, logout } = useConnectorStore()
  const freeWorld = useFreeWorld() as any
  const { userId } = useAuth()

  const freeProfile = freeWorld?.freeProfile
  const isOnline = freeWorld?.isAvailable ?? false

  const [skills, setSkills] = useState<string[]>([])
  const [showSkillPicker, setShowSkillPicker] = useState(false)

  useEffect(() => {
    setMode('free-world')
    freeWorld?.loadFreeProfile?.()
  }, [setMode])

  // Sync skills from profile
  useEffect(() => {
    if (freeProfile?.tags) {
      setSkills(freeProfile.tags)
    }
  }, [freeProfile?.tags])

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill))
    } else {
      setSkills([...skills, skill])
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleSaveSkills = async () => {
    await freeWorld?.updateFreeProfile?.({ tags: skills })
    setShowSkillPicker(false)
  }

  // Stats from profile
  const stats = {
    completedTasks: freeProfile?.tasksCompleted ?? 0,
    rating: freeProfile?.rating ?? 0,
    reviewCount: freeProfile?.reviewCount ?? 0,
  }

  return (
    <div
      className={cn('min-h-screen bg-neutral-50 pb-20')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header with profile */}
      <div className="bg-white px-4 py-6 border-b">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-brand-primary">
              {freeProfile?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-neutral-900">
              {freeProfile?.name || 'User'}
            </h1>
            <p className="text-sm text-neutral-500">{freeProfile?.phone || '+972...'}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/profile/settings')}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Online toggle */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => toggleAvailability()}
          className={cn(
            'w-full mt-4 p-4 rounded-2xl flex items-center justify-between transition-colors',
            isOnline
              ? 'bg-success text-white'
              : 'bg-neutral-100 text-neutral-700'
          )}
        >
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="w-6 h-6" />
            ) : (
              <WifiOff className="w-6 h-6" />
            )}
            <div className="text-left">
              <p className="font-semibold">
                {isOnline ? 'You are online' : 'You are offline'}
              </p>
              <p className={cn('text-sm', isOnline ? 'opacity-80' : 'text-neutral-500')}>
                {isOnline
                  ? 'Others can see you on the map'
                  : 'You are not visible on the map'}
              </p>
            </div>
          </div>
          <div className={cn(
            'w-12 h-7 rounded-full p-1 transition-colors',
            isOnline ? 'bg-white/20' : 'bg-neutral-300'
          )}>
            <motion.div
              className="w-5 h-5 rounded-full bg-white"
              animate={{ x: isOnline ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-3 text-center">
            <CheckCircle className="w-6 h-6 mx-auto text-success mb-1" />
            <p className="text-lg font-bold text-neutral-900">{stats.completedTasks}</p>
            <p className="text-xs text-neutral-500">Completed</p>
          </Card>
          <Card className="p-3 text-center">
            <div className="flex justify-center gap-0.5 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-4 h-4',
                    star <= Math.round(stats.rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-neutral-300'
                  )}
                />
              ))}
            </div>
            <p className="text-lg font-bold text-neutral-900">{stats.rating.toFixed(1)}</p>
            <p className="text-xs text-neutral-500">Rating</p>
          </Card>
          <Card className="p-3 text-center">
            <Briefcase className="w-6 h-6 mx-auto text-brand-primary mb-1" />
            <p className="text-lg font-bold text-neutral-900">{stats.reviewCount}</p>
            <p className="text-xs text-neutral-500">Reviews</p>
          </Card>
        </div>

        {/* Skills */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-neutral-900">My Skills</h2>
            <button
              onClick={() => setShowSkillPicker(true)}
              className="text-brand-primary text-sm font-medium"
            >
              Edit
            </button>
          </div>

          {skills.length === 0 ? (
            <p className="text-neutral-500 text-sm">Add skills to get relevant tasks</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Menu items */}
        <Card className="divide-y">
          <button
            onClick={() => router.push('/profile/reviews')}
            className="w-full p-4 flex items-center justify-between hover:bg-neutral-50"
          >
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="font-medium">Reviews</span>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </button>

          <button
            onClick={() => router.push('/profile/documents')}
            className="w-full p-4 flex items-center justify-between hover:bg-neutral-50"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-brand-primary" />
              <span className="font-medium">Verification</span>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full p-4 flex items-center gap-3 hover:bg-neutral-50 text-danger"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </Card>

        {/* Find tasks */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-500 mb-2">Looking for tasks?</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/free/execute')}
          >
            Find Tasks
          </Button>
        </div>
      </div>

      {/* Tab Bar */}
      <RoleTabBar />

      {/* Skill Picker Modal */}
      {showSkillPicker && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowSkillPicker(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="w-full bg-white rounded-t-3xl p-4 max-h-[70vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Select Skills</h2>
              <button
                onClick={() => setShowSkillPicker(false)}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {AVAILABLE_SKILLS.map((skill) => {
                const isSelected = skills.includes(skill)
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                      isSelected
                        ? 'bg-brand-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    )}
                  >
                    {isSelected && <CheckCircle className="w-4 h-4 inline mr-1" />}
                    {skill}
                  </button>
                )
              })}
            </div>

            <Button
              fullWidth
              onClick={handleSaveSkills}
            >
              Save ({skills.length} skills)
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
