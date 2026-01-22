'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { ChevronLeft, ChevronRight, Bell, Search, Menu, X } from 'lucide-react'
import { IconButton } from '@/components/ui/Button'
import { TrialBadge } from '@/components/subscription'

export interface HeaderProps {
  title?: string
  titleKey?: string
  showBack?: boolean
  showSearch?: boolean
  showNotifications?: boolean
  showMenu?: boolean
  showTrialBadge?: boolean
  onBack?: () => void
  onSearch?: () => void
  onNotifications?: () => void
  onMenu?: () => void
  transparent?: boolean
  className?: string
  rightContent?: React.ReactNode
  leftContent?: React.ReactNode
}

export function Header({
  title,
  titleKey,
  showBack = false,
  showSearch = false,
  showNotifications = false,
  showMenu = false,
  showTrialBadge = false,
  onBack,
  onSearch,
  onNotifications,
  onMenu,
  transparent = false,
  className,
  rightContent,
  leftContent,
}: HeaderProps) {
  const { language, isRTL, unreadCount } = useUI()

  const displayTitle = titleKey ? t(titleKey as any, language) : title

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      window.history.back()
    }
  }

  const BackIcon = isRTL ? ChevronRight : ChevronLeft

  return (
    <header
      className={cn(
        'sticky top-0 z-40',
        'h-14 px-4',
        'flex items-center justify-between gap-3',
        transparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-lg border-b border-neutral-100',
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Left section */}
      <div className="flex items-center gap-2 min-w-[60px]">
        {leftContent}

        {showBack && (
          <IconButton
            icon={<BackIcon className="w-6 h-6" />}
            variant="ghost"
            size="icon-sm"
            onClick={handleBack}
            aria-label={t('common.back', language)}
          />
        )}

        {showMenu && (
          <IconButton
            icon={<Menu className="w-6 h-6" />}
            variant="ghost"
            size="icon-sm"
            onClick={onMenu}
            aria-label="Menu"
          />
        )}
      </div>

      {/* Title */}
      {displayTitle && (
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 text-center font-semibold text-lg text-neutral-900 truncate"
        >
          {displayTitle}
        </motion.h1>
      )}

      {/* Right section */}
      <div className="flex items-center gap-2 min-w-[60px] justify-end">
        {showTrialBadge && (
          <TrialBadge variant="compact" />
        )}

        {showSearch && (
          <IconButton
            icon={<Search className="w-5 h-5" />}
            variant="ghost"
            size="icon-sm"
            onClick={onSearch}
            aria-label={t('common.search', language)}
          />
        )}

        {showNotifications && (
          <div className="relative">
            <IconButton
              icon={<Bell className="w-5 h-5" />}
              variant="ghost"
              size="icon-sm"
              onClick={onNotifications}
              aria-label="Notifications"
            />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  'absolute -top-1 -right-1',
                  'min-w-[18px] h-[18px] px-1',
                  'flex items-center justify-center',
                  'bg-danger text-white text-xs font-bold rounded-full'
                )}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </div>
        )}

        {rightContent}
      </div>
    </header>
  )
}

export default Header
