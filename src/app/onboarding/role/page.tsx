'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore } from '@/store'
import {
  Briefcase,
  User,
  Globe,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

type UserRole = 'worker' | 'employer' | 'free'

const ROLES: {
  id: UserRole
  icon: typeof Briefcase
  gradient: string
  shadowColor: string
}[] = [
  { id: 'worker', icon: Briefcase, gradient: 'from-purple-500 to-purple-700', shadowColor: 'rgba(107, 92, 231, 0.4)' },
  { id: 'employer', icon: User, gradient: 'from-blue-500 to-blue-700', shadowColor: 'rgba(59, 130, 246, 0.4)' },
  { id: 'free', icon: Globe, gradient: 'from-green-500 to-emerald-700', shadowColor: 'rgba(34, 197, 94, 0.4)' },
]

export default function RoleSelectPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { setMode } = useConnectorStore()

  const handleRoleSelect = (role: UserRole) => {
    setMode(role === 'employer' ? 'employer' : role === 'worker' ? 'worker' : 'free')
    localStorage.setItem('connector-role-selected', 'true')
    router.push('/onboarding/profile?role=' + role)
  }

  const getRoleTitle = (role: UserRole) => {
    const titles: Record<UserRole, Record<string, string>> = {
      worker: { ru: 'Хочу работать', he: 'אני רוצה לעבוד', en: 'I want to work', ar: 'أريد العمل' },
      employer: { ru: 'Ищу работника', he: 'מחפש עובד', en: 'Looking for workers', ar: 'أبحث عن عامل' },
      free: { ru: 'Свободный мир', he: 'עולם חופשי', en: 'Free World', ar: 'العالم الحر' },
    }
    return titles[role][language] || titles[role].en
  }

  const getRoleDescription = (role: UserRole) => {
    const descriptions: Record<UserRole, Record<string, string>> = {
      worker: { ru: 'Находите смены, выполняйте задания и зарабатывайте', he: 'מצאו משמרות, בצעו משימות והרוויחו', en: 'Find shifts, complete tasks and earn money', ar: 'ابحث عن الورديات وأكمل المهام واكسب المال' },
      employer: { ru: 'Создавайте смены и находите исполнителей', he: 'צרו משמרות ומצאו עובדים', en: 'Create shifts and find workers', ar: 'أنشئ الورديات وابحث عن العمال' },
      free: { ru: 'Публикуйте и берите задания на карте', he: 'פרסמו וקחו משימות על המפה', en: 'Post and take tasks on the map', ar: 'انشر وخذ المهام على الخريطة' },
    }
    return descriptions[role][language] || descriptions[role].en
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(180deg, #0a0612 0%, #1a0a2e 40%, #0f0a1a 100%)' }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {language === 'ru' ? 'Кто вы?' : language === 'he' ? 'מי אתם?' : language === 'ar' ? 'من أنت؟' : 'Who are you?'}
          </h1>
          <p className="text-neutral-400 text-lg">
            {language === 'ru' ? 'Выберите как вы хотите использовать Connector' : language === 'he' ? 'בחרו איך תרצו להשתמש ב-Connector' : language === 'ar' ? 'اختر كيف تريد استخدام Connector' : 'Choose how you want to use Connector'}
          </p>
        </motion.div>

        <div className="w-full max-w-sm space-y-4">
          {ROLES.map((role, index) => {
            const Icon = role.icon
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.15 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect(role.id)}
                className="w-full p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-4 text-left transition-colors hover:bg-white/15"
              >
                <div
                  className={cn('w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0', role.gradient)}
                  style={{ boxShadow: `0 4px 20px ${role.shadowColor}` }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg">{getRoleTitle(role.id)}</h3>
                  <p className="text-neutral-400 text-sm mt-0.5">{getRoleDescription(role.id)}</p>
                </div>
                <ArrowRight className={cn('w-5 h-5 text-neutral-500 flex-shrink-0', isRTL && 'rotate-180')} />
              </motion.button>
            )
          })}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center pb-8">
        <p className="text-neutral-600 text-sm">
          {language === 'ru' ? 'Вы сможете изменить роль позже' : language === 'he' ? 'תוכלו לשנות את התפקיד מאוחר יותר' : language === 'ar' ? 'يمكنك تغيير الدور لاحقا' : 'You can change your role later'}
        </p>
      </motion.div>
    </div>
  )
}
