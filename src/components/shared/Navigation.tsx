'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useAuth, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Map, Briefcase, Building2, User } from 'lucide-react'
import type { UserMode } from '@/types'

interface NavItem {
  id: UserMode | 'profile'
  icon: React.ReactNode
  labelKey: string
  href: string
}

const navItems: NavItem[] = [
  {
    id: 'free-world',
    icon: <Map className="w-6 h-6" />,
    labelKey: 'mode.free',
    href: '/',
  },
  {
    id: 'worker',
    icon: <Briefcase className="w-6 h-6" />,
    labelKey: 'mode.worker',
    href: '/worker',
  },
  {
    id: 'employer',
    icon: <Building2 className="w-6 h-6" />,
    labelKey: 'mode.employer',
    href: '/employer',
  },
  {
    id: 'profile',
    icon: <User className="w-6 h-6" />,
    labelKey: 'profile.title',
    href: '/profile',
  },
]

export function Navigation() {
  const { language, isRTL } = useUI()
  const { isAuthenticated } = useAuth()
  const { user, setMode } = useConnectorStore()
  const currentMode = user.mode

  const handleNavClick = (item: NavItem) => {
    if (item.id !== 'profile') {
      setMode(item.id as UserMode)
    }
    // Navigation will be handled by Next.js Link in real implementation
    window.location.href = item.href
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white/95 backdrop-blur-lg border-t border-neutral-200',
        'safe-area-pb'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            item.id === 'profile'
              ? false // Profile is never "mode active"
              : currentMode === item.id
          const isProfileActive = item.id === 'profile' && typeof window !== 'undefined' && window.location.pathname.startsWith('/profile')

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'w-16 h-full transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset',
                (isActive || isProfileActive) ? 'text-brand-primary' : 'text-neutral-500'
              )}
            >
              {/* Active indicator */}
              {(isActive || isProfileActive) && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-primary rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  'flex items-center justify-center',
                  (isActive || isProfileActive) && 'text-brand-primary'
                )}
              >
                {item.icon}
              </motion.div>

              {/* Label */}
              <span
                className={cn(
                  'text-xs mt-1 font-medium truncate max-w-[60px]',
                  (isActive || isProfileActive) ? 'text-brand-primary' : 'text-neutral-500'
                )}
              >
                {t(item.labelKey as any, language)}
              </span>

              {/* Notification badge for profile if not authenticated */}
              {item.id === 'profile' && !isAuthenticated && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-2 w-2 h-2 bg-danger rounded-full"
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default Navigation
