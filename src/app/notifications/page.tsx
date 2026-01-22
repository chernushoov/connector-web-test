'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, LoadingState, EmptyState } from '@/components/shared'
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

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'application',
    title: 'Application Approved!',
    body: 'Your application for Warehouse Helper at FastLogistics has been approved. Start tomorrow at 8:00 AM.',
    createdAt: new Date(Date.now() - 3600000),
    isRead: false,
    actionUrl: '/worker/my-tasks',
    metadata: {
      shiftId: 'shift1',
      shiftTitle: 'Warehouse Helper',
      employerName: 'FastLogistics Ltd',
    },
  },
  {
    id: '2',
    type: 'shift',
    title: 'New shift matches your skills!',
    body: 'Event Setup Crew needed in Herzliya. ₪65/hr, 6 spots available.',
    createdAt: new Date(Date.now() - 7200000),
    isRead: false,
    actionUrl: '/worker/shifts/2',
    metadata: {
      shiftId: 'shift2',
      shiftTitle: 'Event Setup Crew',
    },
  },
  {
    id: '3',
    type: 'message',
    title: 'New message from EventPro',
    body: 'Please confirm your attendance for tomorrow\'s event.',
    createdAt: new Date(Date.now() - 14400000),
    isRead: true,
    metadata: {
      employerName: 'EventPro',
    },
  },
  {
    id: '4',
    type: 'review',
    title: 'New 5-star review!',
    body: 'FastLogistics rated you 5 stars: "Excellent work, very reliable!"',
    createdAt: new Date(Date.now() - 86400000),
    isRead: true,
    actionUrl: '/profile/reviews',
    metadata: {
      employerName: 'FastLogistics Ltd',
      rating: 5,
    },
  },
  {
    id: '5',
    type: 'promo',
    title: 'Complete 5 more shifts this week',
    body: 'Earn a ₪100 bonus! You\'ve completed 3/5 shifts.',
    createdAt: new Date(Date.now() - 172800000),
    isRead: true,
  },
  {
    id: '6',
    type: 'system',
    title: 'Profile verification complete',
    body: 'Your documents have been verified. You now have full access to all features.',
    createdAt: new Date(Date.now() - 259200000),
    isRead: true,
    actionUrl: '/profile/documents',
  },
  {
    id: '7',
    type: 'shift',
    title: 'Urgent: Workers needed today!',
    body: 'Moving Assistant in Ramat Gan. ₪60/hr, starts in 3 hours.',
    createdAt: new Date(Date.now() - 432000000),
    isRead: true,
    actionUrl: '/worker/shifts/3',
    metadata: {
      shiftId: 'shift3',
      shiftTitle: 'Moving Assistant',
    },
  },
]

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
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  useEffect(() => {
    const load = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setNotifications(mockNotifications)
      setIsLoading(false)
    }
    load()
  }, [])

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
    if (confirm('Clear all notifications?')) {
      setNotifications([])
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = notification.createdAt.toDateString()
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    let groupKey = date
    if (date === today) groupKey = 'Today'
    else if (date === yesterday) groupKey = 'Yesterday'
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
            className="p-2 hover:bg-neutral-100 rounded-full"
          >
            <Settings className="w-5 h-5 text-neutral-600" />
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="bg-white border-b border-neutral-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'shifts', label: 'Shifts' },
            { id: 'messages', label: 'Messages' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FilterTab)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
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
              Mark all as read
            </Button>
          </div>
        )}
      </div>

      <main className="px-4 py-4">
        {isLoading ? (
          <LoadingState variant="skeleton" />
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={activeTab === 'unread' ? <CheckCheck className="w-16 h-16" /> : <Bell className="w-16 h-16" />}
            title={activeTab === 'unread'
              ? 'All caught up!'
              : t('notifications.empty', language as Language)
            }
            subtitle={activeTab === 'unread'
              ? 'You have no unread notifications'
              : 'You\'ll see shift updates, messages, and more here'
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
                Clear all notifications
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
                <Zap className="w-3 h-3 mr-1" />
                Urgent
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
          <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-4 bg-gradient-to-l from-white via-white to-transparent pl-8">
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
