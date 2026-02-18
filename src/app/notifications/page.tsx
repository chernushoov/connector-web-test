'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Briefcase,
  MessageCircle,
  Star,
  AlertCircle,
  Gift,
  Zap,
  Clock,
  Trash2,
  Settings
} from 'lucide-react'
import type { Language } from '@/types'

interface Notification {
  id: string
  type: 'shift' | 'application' | 'message' | 'review' | 'system' | 'promo'
  title: string
  body: string
  createdAt: Date
  isRead: boolean
  actionUrl?: string
  metadata?: {
    shiftId?: string
    shiftTitle?: string
    employerName?: string
    workerName?: string
    rating?: number
  }
}

const notificationIcons: Record<Notification['type'], React.ReactNode> = {
  shift: <Briefcase className="w-5 h-5" />,
  application: <Check className="w-5 h-5" />,
  message: <MessageCircle className="w-5 h-5" />,
  review: <Star className="w-5 h-5" />,
  system: <AlertCircle className="w-5 h-5" />,
  promo: <Gift className="w-5 h-5" />,
}

const notificationColors: Record<Notification['type'], string> = {
  shift: 'bg-brand-primary/10 text-brand-primary',
  application: 'bg-success/10 text-success',
  message: 'bg-info/10 text-info',
  review: 'bg-brand-accent/10 text-brand-accent',
  system: 'bg-neutral-100 text-neutral-600',
  promo: 'bg-warning/10 text-warning',
}

type FilterTab = 'all' | 'unread' | 'shifts' | 'messages'

export default function NotificationsPage() {
  const { language, isRTL } = useUI()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(
          (data.notifications || []).map((n: Record<string, unknown>) => ({
            ...n,
            createdAt: new Date(n.createdAt as string || n.created_at as string),
            isRead: n.isRead ?? n.read ?? false,
          }))
        )
      }
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const filteredNotifications = notifications.filter(n => {
    switch (activeTab) {
      case 'unread':
        return !n.isRead
      case 'shifts':
        return n.type === 'shift' || n.type === 'application'
      case 'messages':
        return n.type === 'message'
      default:
        return true
    }
  })

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    )
  }

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleClearAll = () => {
    if (confirm(t('confirm.clearNotifications', language as Language))) {
      setNotifications([])
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes} ${t('time.minutesAgo', language as Language)}`
    if (hours < 24) return `${hours} ${t('time.hoursAgo', language as Language)}`
    if (days < 7) return `${days} ${t('time.daysAgo', language as Language)}`
    return date.toLocaleDateString()
  }

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = notification.createdAt.toDateString()
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    let groupKey = date
    if (date === today) groupKey = t('time.today', language as Language)
    else if (date === yesterday) groupKey = t('time.yesterday', language as Language)
    else groupKey = notification.createdAt.toLocaleDateString()

    if (!groups[groupKey]) groups[groupKey] = []
    groups[groupKey].push(notification)
    return groups
  }, {} as Record<string, Notification[]>)

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        title={t('notifications.title', language as Language)}
        showBack
        rightContent={
          <button
            onClick={() => window.location.href = '/profile/settings'}
            aria-label="Settings"
            className="p-2 hover:bg-neutral-100 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <Settings className="w-5 h-5 text-neutral-600" />
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="bg-white border-b border-neutral-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: t('tabs.all', language as Language) },
            { id: 'unread', label: `${t('tabs.unread', language as Language)} (${unreadCount})` },
            { id: 'shifts', label: t('tabs.shifts', language as Language) },
            { id: 'messages', label: t('tabs.messages', language as Language) },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FilterTab)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50',
                activeTab === tab.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick actions */}
        {unreadCount > 0 && (
          <div className="flex gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              leftIcon={<CheckCheck className="w-4 h-4" />}
            >
              {t('notifications.markAllRead', language as Language)}
            </Button>
          </div>
        )}
      </div>

      <main className="px-4 py-4">
        {isLoading ? (
          <LoadingState variant="skeleton" />
        ) : error ? (
          <ErrorState type="network" onRetry={fetchNotifications} />
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={activeTab === 'unread' ? <CheckCheck className="w-16 h-16" /> : <Bell className="w-16 h-16" />}
            title={activeTab === 'unread'
              ? t('empty.allCaughtUp', language as Language)
              : t('notifications.empty', language as Language)
            }
            subtitle={activeTab === 'unread'
              ? t('empty.noUnread', language as Language)
              : t('empty.noNotifications.subtitle', language as Language)
            }
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([date, items]) => (
              <section key={date}>
                <h3 className="text-sm font-medium text-neutral-500 mb-3">
                  {date}
                </h3>
                <div className="space-y-2">
                  <AnimatePresence>
                    {items.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={() => handleMarkAsRead(notification.id)}
                        onDelete={() => handleDelete(notification.id)}
                        formatTime={formatTime}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            ))}

            {/* Clear all button */}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                fullWidth
                onClick={handleClearAll}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="text-neutral-500"
              >
                {t('notifications.clearAll', language as Language)}
              </Button>
            )}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}

function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  formatTime
}: {
  notification: Notification
  onMarkAsRead: () => void
  onDelete: () => void
  formatTime: (date: Date) => string
}) {
  const { language } = useUI()
  const [showActions, setShowActions] = useState(false)

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead()
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
    >
      <Card
        className={cn(
          'relative overflow-hidden',
          !notification.isRead && 'bg-brand-primary/5 border-brand-primary/20'
        )}
        interactive={!!notification.actionUrl}
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
            notificationColors[notification.type]
          )}>
            {notificationIcons[notification.type]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={cn(
                'font-medium text-neutral-900',
                !notification.isRead && 'font-semibold'
              )}>
                {notification.title}
              </h4>
              <span className="text-xs text-neutral-400 whitespace-nowrap">
                {formatTime(notification.createdAt)}
              </span>
            </div>
            <p className="text-sm text-neutral-600 mt-0.5 line-clamp-2">
              {notification.body}
            </p>

            {/* Rating badge for reviews */}
            {notification.type === 'review' && notification.metadata?.rating && (
              <div className="flex items-center gap-1 mt-2">
                {[...Array(notification.metadata.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-brand-accent fill-brand-accent" />
                ))}
              </div>
            )}

            {/* Urgency indicator for shift notifications */}
            {notification.type === 'shift' && notification.title.includes('Urgent') && (
              <Badge variant="danger" size="sm" className="mt-2">
                <Zap className="w-3 h-3 me-1" />
                {t('common.urgent', language as Language)}
              </Badge>
            )}
          </div>

          {/* Unread indicator */}
          {!notification.isRead && (
            <div className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0 mt-2" />
          )}
        </div>

        {/* Swipe actions or menu (simplified for now) */}
        {showActions && (
          <div className="absolute inset-y-0 end-0 flex items-center gap-2 pe-4 bg-gradient-to-l from-white via-white to-transparent ps-8">
            {!notification.isRead && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkAsRead()
                }}
                className="p-2 bg-brand-primary text-white rounded-full"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-2 bg-danger text-white rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
