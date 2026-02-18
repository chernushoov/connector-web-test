'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import {
  List,
  Zap,
  Clock,
  Star,
  CheckSquare,
  User,
  LayoutGrid,
  Shield,
  Map,
  Briefcase,
  PlusCircle,
  Activity,
  FileText,
  Users,
  MessageCircle,
} from 'lucide-react'
import type { TabConfig, UserMode } from '@/types'
import { FREE_TABS, WORKER_TABS, EMPLOYER_TABS } from '@/types'

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  List,
  Zap,
  Clock,
  Star,
  CheckSquare,
  User,
  LayoutGrid,
  Shield,
  Map,
  Briefcase,
  PlusCircle,
  Activity,
  FileText,
  Users,
  MessageCircle,
}

export function RoleTabBar({ mode }: { mode?: UserMode } = {}) {
  const pathname = usePathname()
  const { language, isRTL } = useUI()

  // Determine tabs based on mode
  const resolvedMode = mode || (
    pathname.startsWith('/worker') ? 'worker' :
    pathname.startsWith('/employer') ? 'employer' : 'free-world'
  )
  const tabs = resolvedMode === 'worker' ? WORKER_TABS
    : resolvedMode === 'employer' ? EMPLOYER_TABS
    : FREE_TABS

  // Determine active tab based on pathname
  const getIsActive = (href: string) => {
    if (href === '/profile' || href.endsWith('/profile')) {
      return pathname.startsWith('/profile') || pathname.endsWith('/profile')
    }
    if (href === '/free' || href === '/worker' || href === '/employer') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white/95 backdrop-blur-lg border-t border-neutral-200',
        'pb-safe'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const isActive = getIsActive(tab.href)
          const IconComponent = iconMap[tab.icon]

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'flex-1 h-full transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset',
                isActive ? 'text-brand-primary' : 'text-neutral-500'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-primary rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative flex items-center justify-center"
              >
                {IconComponent && (
                  <IconComponent
                    className={cn(
                      'w-5 h-5',
                      isActive && 'text-brand-primary'
                    )}
                  />
                )}
              </motion.div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] mt-1 font-medium truncate max-w-[56px]',
                  isActive ? 'text-brand-primary' : 'text-neutral-500'
                )}
              >
                {t(tab.labelKey as any, language)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default RoleTabBar
