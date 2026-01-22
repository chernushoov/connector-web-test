'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { X, Plus, Check } from 'lucide-react'

interface SkillsEditorProps {
  skills: string[]
  onChange?: (skills: string[]) => void
  editable?: boolean
  maxSkills?: number
  className?: string
}

const availableSkills = [
  'Warehouse', 'Moving', 'Cleaning', 'Driving', 'Events',
  'Construction', 'Painting', 'Cooking', 'Retail', 'Delivery',
  'Assembly', 'Gardening', 'Security', 'Hospitality', 'Carpentry',
  'Plumbing', 'Electrical', 'HVAC', 'Welding', 'Other'
]

export function SkillsEditor({
  skills,
  onChange,
  editable = false,
  maxSkills = 10,
  className
}: SkillsEditorProps) {
  const { language, isRTL } = useUI()
  const [isEditing, setIsEditing] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>(skills)

  const handleToggleSkill = (skill: string) => {
    const skillLower = skill.toLowerCase()
    if (selectedSkills.includes(skillLower)) {
      setSelectedSkills(prev => prev.filter(s => s !== skillLower))
    } else if (selectedSkills.length < maxSkills) {
      setSelectedSkills(prev => [...prev, skillLower])
    }
  }

  const handleSave = () => {
    onChange?.(selectedSkills)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setSelectedSkills(skills)
    setIsEditing(false)
  }

  if (!editable) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)} dir={isRTL ? 'rtl' : 'ltr'}>
        {skills.map((skill) => (
          <Badge key={skill} variant="neutral" size="md" className="capitalize">
            {skill}
          </Badge>
        ))}
        {skills.length === 0 && (
          <p className="text-sm text-neutral-500">No skills added</p>
        )}
      </div>
    )
  }

  return (
    <div className={className} dir={isRTL ? 'rtl' : 'ltr'}>
      {!isEditing ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="neutral" size="md" className="capitalize">
                {skill}
              </Badge>
            ))}
            {skills.length === 0 && (
              <p className="text-sm text-neutral-500">No skills added</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Edit skills
          </Button>
        </div>
      ) : (
        <Card variant="outlined" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium">
              Select skills ({selectedSkills.length}/{maxSkills})
            </p>
            <button
              onClick={handleCancel}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <AnimatePresence mode="popLayout">
              {availableSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill.toLowerCase())
                return (
                  <motion.button
                    key={skill}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => handleToggleSkill(skill)}
                    disabled={!isSelected && selectedSkills.length >= maxSkills}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium',
                      'transition-all duration-200',
                      isSelected
                        ? 'bg-brand-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {skill}
                    {isSelected && <Check className="w-3 h-3 ml-1 inline" />}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              {t('common.cancel', language as any)}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {t('common.save', language as any)}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default SkillsEditor
