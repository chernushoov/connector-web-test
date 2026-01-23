'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAdminStore, useAdminUI } from '@/store/admin'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  CreditCard,
  Star,
  Shield,
  Bell,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  labelRu: string
  icon: React.ReactNode
  href: string
  children?: NavItem[]
  badge?: number
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    labelRu: 'Дашборд',
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: '/admin',
  },
  {
    id: 'users',
    label: 'Users',
    labelRu: 'Пользователи',
    icon: <Users className="w-5 h-5" />,
    href: '/admin/users',
    children: [
      {
        id: 'all-users',
        label: 'All Users',
        labelRu: 'Все',
        icon: null,
        href: '/admin/users',
      },
      {
        id: 'workers',
        label: 'Workers',
        labelRu: 'Работники',
        icon: null,
        href: '/admin/users/workers',
      },
      {
        id: 'employers',
        label: 'Employers',
        labelRu: 'Работодатели',
        icon: null,
        href: '/admin/users/employers',
      },
    ],
  },
  {
    id: 'shifts',
    label: 'Shifts',
    labelRu: 'Смены',
    icon: <CalendarDays className="w-5 h-5" />,
    href: '/admin/shifts',
    badge: 12,
  },
  {
    id: 'applications',
    label: 'Applications',
    labelRu: 'Заявки',
    icon: <FileText className="w-5 h-5" />,
    href: '/admin/applications',
    children: [
      {
        id: 'all-apps',
        label: 'All',
        labelRu: 'Все',
        icon: null,
        href: '/admin/applications',
      },
      {
        id: 'disputes',
        label: 'Disputes',
        labelRu: 'Споры',
        icon: null,
        href: '/admin/applications/disputes',
        badge: 3,
      },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    labelRu: 'Платежи',
    icon: <CreditCard className="w-5 h-5" />,
    href: '/admin/payments',
    children: [
      {
        id: 'transactions',
        label: 'Transactions',
        labelRu: 'Транзакции',
        icon: null,
        href: '/admin/payments',
      },
      {
        id: 'refunds',
        label: 'Refunds',
        labelRu: 'Возвраты',
        icon: null,
        href: '/admin/payments/refunds',
      },
    ],
  },
  {
    id: 'reviews',
    label: 'Reviews',
    labelRu: 'Отзывы',
    icon: <Star className="w-5 h-5" />,
    href: '/admin/reviews',
    badge: 5,
  },
  {
    id: 'documents',
    label: 'Documents',
    labelRu: 'Документы',
    icon: <Shield className="w-5 h-5" />,
    href: '/admin/documents',
    badge: 24,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    labelRu: 'Уведомления',
    icon: <Bell className="w-5 h-5" />,
    href: '/admin/notifications',
  },
  {
    id: 'settings',
    label: 'Settings',
    labelRu: 'Настройки',
    icon: <Settings className="w-5 h-5" />,
    href: '/admin/settings',
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { language, sidebarCollapsed } = useAdminUI()
  const { toggleSidebar, logoutAdmin } = useAdminStore()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    logoutAdmin()
    window.location.href = '/admin/login'
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-neutral-900 text-white',
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-800">
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center">
              <span className="font-bold text-sm">C</span>
            </div>
            <span className="font-semibold">Admin Panel</span>
          </motion.div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          {sidebarCollapsed ? (
            <Menu className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.id}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                      'transition-colors duration-200',
                      isActive(item.href)
                        ? 'bg-brand-primary text-white'
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    )}
                  >
                    {item.icon}
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left text-sm font-medium">
                          {language === 'ru' ? item.labelRu : item.label}
                        </span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs bg-danger rounded-full">
                            {item.badge}
                          </span>
                        )}
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 transition-transform',
                            expandedItems.includes(item.id) && 'rotate-180'
                          )}
                        />
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedItems.includes(item.id) && !sidebarCollapsed && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-8 mt-1 space-y-1 overflow-hidden"
                      >
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={child.href}
                              className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                                'transition-colors duration-200',
                                pathname === child.href
                                  ? 'text-brand-primary bg-brand-primary/10'
                                  : 'text-neutral-400 hover:text-white'
                              )}
                            >
                              <span>
                                {language === 'ru' ? child.labelRu : child.label}
                              </span>
                              {child.badge && (
                                <span className="px-1.5 py-0.5 text-xs bg-danger rounded-full text-white">
                                  {child.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                    'transition-colors duration-200',
                    isActive(item.href)
                      ? 'bg-brand-primary text-white'
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  )}
                >
                  {item.icon}
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">
                        {language === 'ru' ? item.labelRu : item.label}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs bg-danger rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-800">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg',
            'text-neutral-400 hover:bg-neutral-800 hover:text-white',
            'transition-colors duration-200'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!sidebarCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
