'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Star,
  Shield,
  Camera,
  Edit2,
  Share2,
  Award
} from 'lucide-react'
import type { QuickProfile, WorkerProfile, EmployerProfile } from '@/types'

interface ProfileHeaderProps {
  profile: QuickProfile | WorkerProfile | EmployerProfile | null
  isOwn?: boolean
  onEditPhoto?: () => void
  onEdit?: () => void
  onShare?: () => void
  className?: string
}

export function ProfileHeader({
  profile,
  isOwn = false,
  onEditPhoto,
  onEdit,
  onShare,
  className
}: ProfileHeaderProps) {
  const { language, isRTL } = useUI()

  if (!profile) return null

  const isWorker = 'completedShifts' in profile
  const isEmployer = 'company' in profile && 'shiftsPosted' in profile

  return (
    <div
      className={cn(
        'bg-gradient-brand text-white p-6 pb-10',
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-start gap-4">
        {/* Avatar with edit button */}
        <div className="relative">
          <Avatar
            size="xl"
            name={profile.name}
            src={profile.photoUrl}
            className="ring-4 ring-white/20"
          />
          {isOwn && (
            <button
              onClick={onEditPhoto}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-brand-primary flex items-center justify-center shadow-lg"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold truncate">{profile.name}</h1>
            {profile.isVerified && (
              <Shield className="w-5 h-5 text-success flex-shrink-0" />
            )}
            {isWorker && (profile as WorkerProfile).isPro && (
              <Badge variant="accent" size="sm">PRO</Badge>
            )}
          </div>

          {/* Role/company */}
          {isEmployer && (
            <p className="text-white/80 mt-1">
              {(profile as EmployerProfile).company}
            </p>
          )}
          {isWorker && (
            <p className="text-white/80 mt-1">
              {(profile as WorkerProfile).specialization}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-brand-accent" />
              <span className="font-semibold">{profile.rating.toFixed(1)}</span>
              <span className="text-white/60">
                ({profile.reviewCount} {t('worker.reviews', language as any)})
              </span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {isOwn ? (
            <Button
              variant="outline-white"
              size="sm"
              onClick={onEdit}
              leftIcon={<Edit2 className="w-4 h-4" />}
            >
              {t('profile.edit', language as any)}
            </Button>
          ) : (
            <Button
              variant="outline-white"
              size="sm"
              onClick={onShare}
              leftIcon={<Share2 className="w-4 h-4" />}
            >
              {t('common.share', language as any)}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
