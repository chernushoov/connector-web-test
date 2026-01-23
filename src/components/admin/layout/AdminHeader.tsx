'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAdminStore, useAdminAuth, useAdminUI } from '@/store/admin'
import {
  Search,
  Bell,
  ChevronRight,
  Home,
  User,
  Settings,
  LogOut,
  Globe,
} from 'lucide-react'

// Breadcrumb mappings
const pathLabels: Record<string, { en: string; ru: string }> = {
  admin: { en: 'Admin', ru: 'Админ' },
  users: { en: 'Users', ru: 'Пользователи' },
  workers: { en: 'Workers', ru: 'Работники' },
  employers: { en: 'Employers', ru: 'Работодатели' },
  shifts: { en: 'Shifts', ru: 'Смены' },
  pending: { en: 'Pending', ru: 'На модерации' },
  applications: { en: 'Applications', ru: 'Заявки' },
  disputes: { en: 'Disputes', ru: 'Споры' },
  payments: { en: 'Payments', ru: 'Платежи' },
  refunds: { en: 'Refunds', ru: 'Возвраты' },
  reviews: { en: 'Reviews', ru: 'Отзывы' },
  reported: { en: 'Reported', ru: 'Жалобы' },
  documents: { en: 'Documents', ru: 'Документы' },
  notifications: { en: 'Notifications', ru: 'Уведомления' },
  campaigns: { en: 'Campaigns', ru: 'Кампании' },
  templates: { en: 'Templates', ru: 'Шаблоны' },
  settings: { en: 'Settings', ru: 'Настройки' },
}

export function AdminHeader() {
  const pathname = usePathname()
  const { admin } = useAdminAuth()
  const { language, searchQuery } = useAdminUI()
  const { setSearchQuery, setLanguage, logoutAdmin } = useAdminStore()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Generate breadcrumbs from pathname
  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => {
      const href = '/' + arr.slice(0, index + 1).join('/')
      const labels = pathLabels[segment] || { en: segment, ru: segment }
      return {
        label: language === 'ru' ? labels.ru : labels.en,
        href,
        isLast: index === arr.length - 1,
      }
    })

  const handleLogout = () => {
    logoutAdmin()
    window.location.href = '/admin/login'
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/admin"
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-neutral-300" />
              {crumb.isLast ? (
                <span className="font-medium text-neutral-900">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ru' ? 'Поиск...' : 'Search...'}
              className="w-64 pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>

          {/* Language switcher */}
          <button
            onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            title={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
          >
            <Globe className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-neutral-100">
                    <h3 className="font-semibold text-neutral-900">
                      {language === 'ru' ? 'Уведомления' : 'Notifications'}
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-neutral-500 text-center py-4">
                      {language === 'ru'
                        ? 'Нет новых уведомлений'
                        : 'No new notifications'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-medium">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              {admin && (
                <span className="text-sm font-medium text-neutral-700 hidden md:block">
                  {admin.name}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden"
                >
                  <div className="p-3 border-b border-neutral-100">
                    <p className="font-medium text-neutral-900">{admin?.name}</p>
                    <p className="text-xs text-neutral-500">{admin?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>
                        {language === 'ru' ? 'Настройки' : 'Settings'}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{language === 'ru' ? 'Выйти' : 'Logout'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
