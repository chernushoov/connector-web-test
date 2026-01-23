'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  useAdminDashboard,
  useAdminStore,
  useAdminModeration,
  useAdminUI,
} from '@/store/admin'
import { MetricCard } from '@/components/admin/charts'
import { AIInsightsCard } from '@/components/admin/analytics'
import { FraudAlertCard } from '@/components/admin/security'
import { Card } from '@/components/ui/Card'
import {
  Users,
  DollarSign,
  Briefcase,
  AlertTriangle,
  TrendingUp,
  Clock,
  Star,
  Shield,
  FileText,
  ArrowRight,
  CheckCircle,
  UserPlus,
  CreditCard,
  MessageSquare,
} from 'lucide-react'

// Mock data for calculating real stats
const mockUsers = [
  { id: 'u1', name: 'User 1', role: 'worker', createdAt: new Date(), isVerified: true },
  { id: 'u2', name: 'User 2', role: 'employer', createdAt: new Date(), isVerified: true },
  { id: 'u3', name: 'User 3', role: 'worker', createdAt: new Date(Date.now() - 86400000), isVerified: false },
  { id: 'u4', name: 'User 4', role: 'worker', createdAt: new Date(Date.now() - 172800000), isVerified: true },
  { id: 'u5', name: 'User 5', role: 'employer', createdAt: new Date(Date.now() - 86400000 * 3), isVerified: true },
  { id: 'u6', name: 'User 6', role: 'both', createdAt: new Date(Date.now() - 86400000 * 5), isVerified: true },
  { id: 'u7', name: 'User 7', role: 'worker', createdAt: new Date(Date.now() - 86400000 * 7), isVerified: false },
  { id: 'u8', name: 'User 8', role: 'worker', createdAt: new Date(Date.now() - 86400000 * 10), isVerified: true },
  { id: 'u9', name: 'User 9', role: 'employer', createdAt: new Date(Date.now() - 86400000 * 14), isVerified: true },
  { id: 'u10', name: 'User 10', role: 'worker', createdAt: new Date(Date.now() - 86400000 * 21), isVerified: true },
  { id: 'u11', name: 'User 11', role: 'worker', createdAt: new Date(Date.now() - 86400000 * 28), isVerified: true },
  { id: 'u12', name: 'User 12', role: 'employer', createdAt: new Date(Date.now() - 86400000 * 30), isVerified: true },
]

const mockShifts = [
  { id: 's1', status: 'active', title: 'Warehouse Helper', createdAt: new Date(), completedAt: null },
  { id: 's2', status: 'pending', title: 'Event Staff', createdAt: new Date(), completedAt: null },
  { id: 's3', status: 'active', title: 'Restaurant Server', createdAt: new Date(Date.now() - 86400000), completedAt: null },
  { id: 's4', status: 'completed', title: 'Cleaning Staff', createdAt: new Date(Date.now() - 86400000 * 2), completedAt: new Date() },
  { id: 's5', status: 'completed', title: 'Moving Helper', createdAt: new Date(Date.now() - 86400000 * 3), completedAt: new Date(Date.now() - 86400000) },
  { id: 's6', status: 'pending', title: 'Delivery Driver', createdAt: new Date(Date.now() - 3600000), completedAt: null },
  { id: 's7', status: 'active', title: 'Security Guard', createdAt: new Date(Date.now() - 7200000), completedAt: null },
  { id: 's8', status: 'cancelled', title: 'Office Assistant', createdAt: new Date(Date.now() - 86400000 * 5), completedAt: null },
  { id: 's9', status: 'pending', title: 'Retail Cashier', createdAt: new Date(Date.now() - 1800000), completedAt: null },
  { id: 's10', status: 'completed', title: 'Construction Helper', createdAt: new Date(Date.now() - 86400000 * 4), completedAt: new Date(Date.now() - 86400000 * 2) },
]

const mockDocuments = [
  { id: 'd1', status: 'pending', type: 'passport', uploadedAt: new Date() },
  { id: 'd2', status: 'pending', type: 'work_permit', uploadedAt: new Date(Date.now() - 86400000) },
  { id: 'd3', status: 'verified', type: 'passport', uploadedAt: new Date(Date.now() - 86400000 * 2) },
  { id: 'd4', status: 'pending', type: 'driver_license', uploadedAt: new Date(Date.now() - 3600000) },
  { id: 'd5', status: 'verified', type: 'work_permit', uploadedAt: new Date(Date.now() - 86400000 * 5) },
  { id: 'd6', status: 'rejected', type: 'passport', uploadedAt: new Date(Date.now() - 86400000 * 3) },
  { id: 'd7', status: 'pending', type: 'passport', uploadedAt: new Date(Date.now() - 7200000) },
]

const mockDisputes = [
  { id: 'disp1', status: 'open', type: 'payment', createdAt: new Date() },
  { id: 'disp2', status: 'investigating', type: 'quality', createdAt: new Date(Date.now() - 86400000) },
  { id: 'disp3', status: 'open', type: 'no_show', createdAt: new Date(Date.now() - 43200000) },
  { id: 'disp4', status: 'resolved', type: 'payment', createdAt: new Date(Date.now() - 86400000 * 5) },
]

const mockPayments = [
  { id: 'p1', amount: 440, fee: 44, status: 'released', createdAt: new Date() },
  { id: 'p2', amount: 520, fee: 52, status: 'escrowed', createdAt: new Date(Date.now() - 86400000) },
  { id: 'p3', amount: 300, fee: 30, status: 'released', createdAt: new Date(Date.now() - 86400000 * 2) },
  { id: 'p4', amount: 560, fee: 56, status: 'released', createdAt: new Date(Date.now() - 86400000 * 3) },
  { id: 'p5', amount: 180, fee: 18, status: 'released', createdAt: new Date(Date.now() - 86400000 * 4) },
  { id: 'p6', amount: 480, fee: 48, status: 'escrowed', createdAt: new Date(Date.now() - 86400000 * 5) },
  { id: 'p7', amount: 620, fee: 62, status: 'released', createdAt: new Date(Date.now() - 86400000 * 6) },
]

// Mock activity feed
const mockActivity = [
  { id: 'a1', type: 'user_registered', user: 'Мария Иванова', action: 'зарегистрировалась', actionEn: 'registered', timestamp: new Date(Date.now() - 300000) },
  { id: 'a2', type: 'shift_completed', user: 'Иван Петров', action: 'завершил смену', actionEn: 'completed shift', timestamp: new Date(Date.now() - 1800000) },
  { id: 'a3', type: 'payment_released', user: 'ABC Logistics', action: 'выплатил ₪440', actionEn: 'released ₪440', timestamp: new Date(Date.now() - 3600000) },
  { id: 'a4', type: 'document_verified', user: 'Алексей Смирнов', action: 'верифицирован паспорт', actionEn: 'passport verified', timestamp: new Date(Date.now() - 7200000) },
  { id: 'a5', type: 'shift_created', user: 'Events Plus', action: 'создал новую смену', actionEn: 'created new shift', timestamp: new Date(Date.now() - 10800000) },
  { id: 'a6', type: 'dispute_resolved', user: 'Admin', action: 'решил спор #123', actionEn: 'resolved dispute #123', timestamp: new Date(Date.now() - 14400000) },
  { id: 'a7', type: 'user_verified', user: 'Елена Козлова', action: 'прошла верификацию', actionEn: 'got verified', timestamp: new Date(Date.now() - 18000000) },
]

// Mock chart data
const userGrowthData = [
  { day: 'Mon', users: 45 },
  { day: 'Tue', users: 52 },
  { day: 'Wed', users: 48 },
  { day: 'Thu', users: 61 },
  { day: 'Fri', users: 55 },
  { day: 'Sat', users: 67 },
  { day: 'Sun', users: 72 },
]

const revenueData = [
  { day: 'Mon', revenue: 12500 },
  { day: 'Tue', revenue: 18200 },
  { day: 'Wed', revenue: 15800 },
  { day: 'Thu', revenue: 22100 },
  { day: 'Fri', revenue: 19500 },
  { day: 'Sat', revenue: 25800 },
  { day: 'Sun', revenue: 21300 },
]

type DateFilter = 'today' | 'week' | 'month'

export default function AdminDashboardPage() {
  const { language } = useAdminUI()
  const { stats, isLoadingStats } = useAdminDashboard()
  const { pendingDocuments, pendingShifts, disputes } = useAdminModeration()
  const { loadDashboardStats, loadPendingDocuments, loadPendingShifts } =
    useAdminStore()

  const [dateFilter, setDateFilter] = useState<DateFilter>('week')

  useEffect(() => {
    loadDashboardStats()
    loadPendingDocuments()
    loadPendingShifts()
  }, [loadDashboardStats, loadPendingDocuments, loadPendingShifts])

  // Calculate real stats from mock data
  const calculateStats = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const filterDate = dateFilter === 'today' ? today :
                       dateFilter === 'week' ? weekAgo : monthAgo

    const filteredUsers = mockUsers.filter(u => new Date(u.createdAt) >= filterDate)
    const filteredShifts = mockShifts.filter(s => new Date(s.createdAt) >= filterDate)
    const filteredPayments = mockPayments.filter(p => new Date(p.createdAt) >= filterDate)

    return {
      totalUsers: mockUsers.length,
      newUsers: filteredUsers.length,
      activeShifts: mockShifts.filter(s => s.status === 'active').length,
      pendingShifts: mockShifts.filter(s => s.status === 'pending').length,
      completedShifts: mockShifts.filter(s => s.status === 'completed').length,
      openDisputes: mockDisputes.filter(d => d.status === 'open' || d.status === 'investigating').length,
      pendingDocuments: mockDocuments.filter(d => d.status === 'pending').length,
      totalRevenue: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
      platformFees: filteredPayments.reduce((sum, p) => sum + p.fee, 0),
      avgRating: 4.7,
      conversionRate: 34.5,
      avgResponseTime: 4.2,
    }
  }

  const calculatedStats = calculateStats()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const t = {
    title: language === 'ru' ? 'Дашборд' : 'Dashboard',
    subtitle: language === 'ru' ? 'Обзор платформы' : 'Platform overview',
    lastUpdated: language === 'ru' ? 'Обновлено:' : 'Last updated:',
    totalUsers: language === 'ru' ? 'Всего пользователей' : 'Total Users',
    revenueToday: language === 'ru' ? 'Выручка' : 'Revenue',
    activeShifts: language === 'ru' ? 'Активные смены' : 'Active Shifts',
    openDisputes: language === 'ru' ? 'Открытые споры' : 'Open Disputes',
    conversionRate: language === 'ru' ? 'Конверсия' : 'Conversion Rate',
    avgResponseTime: language === 'ru' ? 'Время ответа' : 'Avg Response Time',
    avgRating: language === 'ru' ? 'Средний рейтинг' : 'Avg Rating',
    pendingDocs: language === 'ru' ? 'Документы на проверке' : 'Pending Verification',
    actionRequired: language === 'ru' ? 'Требуется действие' : 'Action Required',
    documentsAwaiting:
      language === 'ru'
        ? 'документов ожидают проверки'
        : 'documents awaiting verification',
    shiftsPending:
      language === 'ru'
        ? 'смен на модерации'
        : 'shifts pending moderation',
    disputesNeed:
      language === 'ru'
        ? 'споров требуют внимания'
        : 'disputes need attention',
    quickActions: language === 'ru' ? 'Быстрые действия' : 'Quick Actions',
    viewAllUsers: language === 'ru' ? 'Все пользователи' : 'View All Users',
    moderateShifts: language === 'ru' ? 'Модерация смен' : 'Moderate Shifts',
    verifyDocs: language === 'ru' ? 'Проверка документов' : 'Verify Documents',
    viewDisputes: language === 'ru' ? 'Смотреть споры' : 'View Disputes',
    userGrowth: language === 'ru' ? 'Рост пользователей' : 'User Growth',
    revenue: language === 'ru' ? 'Выручка' : 'Revenue',
    recentActivity: language === 'ru' ? 'Последняя активность' : 'Recent Activity',
    vsLastWeek: language === 'ru' ? 'vs прошлая неделя' : 'vs last week',
    vsYesterday: language === 'ru' ? 'vs вчера' : 'vs yesterday',
    today: language === 'ru' ? 'Сегодня' : 'Today',
    thisWeek: language === 'ru' ? 'Неделя' : 'This Week',
    thisMonth: language === 'ru' ? 'Месяц' : 'This Month',
    newUsers: language === 'ru' ? 'Новые пользователи' : 'New Users',
    platformFees: language === 'ru' ? 'Комиссия' : 'Platform Fees',
    last7Days: language === 'ru' ? 'Последние 7 дней' : 'Last 7 days',
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <UserPlus className="w-4 h-4 text-brand-primary" />
      case 'shift_completed':
        return <CheckCircle className="w-4 h-4 text-success" />
      case 'payment_released':
        return <CreditCard className="w-4 h-4 text-success" />
      case 'document_verified':
        return <Shield className="w-4 h-4 text-success" />
      case 'shift_created':
        return <Briefcase className="w-4 h-4 text-brand-primary" />
      case 'dispute_resolved':
        return <AlertTriangle className="w-4 h-4 text-warning" />
      case 'user_verified':
        return <CheckCircle className="w-4 h-4 text-success" />
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return language === 'ru' ? `${diffMins} мин назад` : `${diffMins}m ago`
    } else if (diffHours < 24) {
      return language === 'ru' ? `${diffHours} ч назад` : `${diffHours}h ago`
    } else {
      return language === 'ru' ? `${diffDays} дн назад` : `${diffDays}d ago`
    }
  }

  // Simple bar chart component
  const SimpleBarChart = ({ data, dataKey, color }: { data: Array<{ day: string; [key: string]: string | number }>, dataKey: string, color: string }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey] as number))

    return (
      <div className="flex items-end justify-between h-48 gap-2 px-2">
        {data.map((item, index) => {
          const value = item[dataKey] as number
          const height = (value / maxValue) * 100

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`w-full rounded-t-md ${color}`}
                style={{ minHeight: 4 }}
              />
              <span className="text-xs text-neutral-500 mt-2">{item.day}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
          <p className="text-neutral-500">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Date filter */}
          <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
            {(['today', 'week', 'month'] as DateFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  dateFilter === filter
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {filter === 'today' ? t.today : filter === 'week' ? t.thisWeek : t.thisMonth}
              </button>
            ))}
          </div>
          <div className="text-sm text-neutral-500">
            {t.lastUpdated} {new Date().toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <MetricCard
          title={t.totalUsers}
          value={calculatedStats.totalUsers}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 12.5, label: t.vsLastWeek }}
        />
        <MetricCard
          title={t.revenueToday}
          value={calculatedStats.totalRevenue}
          format="currency"
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: 8.2, label: t.vsYesterday }}
          variant="primary"
        />
        <MetricCard
          title={t.activeShifts}
          value={calculatedStats.activeShifts}
          icon={<Briefcase className="w-5 h-5" />}
          trend={{ value: 5.0, label: t.vsLastWeek }}
        />
        <MetricCard
          title={t.openDisputes}
          value={calculatedStats.openDisputes}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={calculatedStats.openDisputes > 10 ? 'danger' : 'default'}
        />
      </motion.div>

      {/* Secondary Metrics */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <MetricCard
          title={t.conversionRate}
          value={calculatedStats.conversionRate}
          format="percent"
          icon={<TrendingUp className="w-5 h-5" />}
          size="sm"
        />
        <MetricCard
          title={t.avgResponseTime}
          value={`${calculatedStats.avgResponseTime}h`}
          icon={<Clock className="w-5 h-5" />}
          size="sm"
        />
        <MetricCard
          title={t.avgRating}
          value={calculatedStats.avgRating}
          icon={<Star className="w-5 h-5" />}
          size="sm"
        />
        <MetricCard
          title={t.pendingDocs}
          value={calculatedStats.pendingDocuments}
          icon={<Shield className="w-5 h-5" />}
          size="sm"
          variant={calculatedStats.pendingDocuments > 20 ? 'warning' : 'default'}
        />
      </motion.div>

      {/* Alerts & Actions */}
      {(calculatedStats.pendingDocuments > 0 ||
        calculatedStats.pendingShifts > 0 ||
        calculatedStats.openDisputes > 0) && (
        <motion.div variants={itemVariants}>
          <Card className="p-4 border-l-4 border-warning bg-warning/5">
            <h3 className="font-semibold text-neutral-900 mb-3">
              {t.actionRequired}
            </h3>
            <div className="space-y-2 text-sm">
              {calculatedStats.pendingDocuments > 0 && (
                <Link
                  href="/admin/documents"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Shield className="w-4 h-4 text-warning" />
                    <span>
                      {calculatedStats.pendingDocuments} {t.documentsAwaiting}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                </Link>
              )}
              {calculatedStats.pendingShifts > 0 && (
                <Link
                  href="/admin/shifts/pending"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Briefcase className="w-4 h-4 text-warning" />
                    <span>
                      {calculatedStats.pendingShifts} {t.shiftsPending}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                </Link>
              )}
              {calculatedStats.openDisputes > 0 && (
                <Link
                  href="/admin/applications/disputes"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-2 text-neutral-600">
                    <AlertTriangle className="w-4 h-4 text-danger" />
                    <span>
                      {calculatedStats.openDisputes} {t.disputesNeed}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                </Link>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h3 className="font-semibold text-neutral-900 mb-3">{t.quickActions}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-neutral-100 group"
          >
            <Users className="w-6 h-6 text-brand-primary mb-2" />
            <p className="font-medium text-neutral-900 group-hover:text-brand-primary transition-colors">
              {t.viewAllUsers}
            </p>
          </Link>
          <Link
            href="/admin/shifts/pending"
            className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-neutral-100 group"
          >
            <FileText className="w-6 h-6 text-brand-primary mb-2" />
            <p className="font-medium text-neutral-900 group-hover:text-brand-primary transition-colors">
              {t.moderateShifts}
            </p>
          </Link>
          <Link
            href="/admin/documents"
            className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-neutral-100 group"
          >
            <Shield className="w-6 h-6 text-brand-primary mb-2" />
            <p className="font-medium text-neutral-900 group-hover:text-brand-primary transition-colors">
              {t.verifyDocs}
            </p>
          </Link>
          <Link
            href="/admin/applications/disputes"
            className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-neutral-100 group"
          >
            <AlertTriangle className="w-6 h-6 text-brand-primary mb-2" />
            <p className="font-medium text-neutral-900 group-hover:text-brand-primary transition-colors">
              {t.viewDisputes}
            </p>
          </Link>
        </div>
      </motion.div>

      {/* Charts Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">{t.userGrowth}</h3>
            <span className="text-xs text-neutral-500">{t.last7Days}</span>
          </div>
          <SimpleBarChart data={userGrowthData} dataKey="users" color="bg-brand-primary" />
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">{t.revenue}</h3>
            <span className="text-xs text-neutral-500">{t.last7Days}</span>
          </div>
          <SimpleBarChart data={revenueData} dataKey="revenue" color="bg-success" />
        </Card>
      </motion.div>

      {/* AI Analytics & Security Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <AIInsightsCard
          metrics={{
            totalUsers: calculatedStats.totalUsers,
            newUsersToday: calculatedStats.newUsers,
            newUsersThisWeek: calculatedStats.newUsers,
            activeUsersDaily: Math.floor(calculatedStats.totalUsers * 0.3),
            activeShifts: calculatedStats.activeShifts,
            pendingShifts: calculatedStats.pendingShifts,
            completedShiftsToday: calculatedStats.completedShifts,
            completedShiftsThisWeek: calculatedStats.completedShifts,
            revenueToday: calculatedStats.totalRevenue,
            revenueThisWeek: calculatedStats.totalRevenue,
            platformFeesCollected: calculatedStats.platformFees,
            openDisputes: calculatedStats.openDisputes,
            avgResponseTimeHours: calculatedStats.avgResponseTime,
            avgRating: calculatedStats.avgRating,
            conversionRate: calculatedStats.conversionRate,
          }}
          language={language === 'ru' ? 'ru' : 'en'}
        />
        <FraudAlertCard language={language === 'ru' ? 'ru' : 'en'} />
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">
            {t.recentActivity}
          </h3>
          <div className="space-y-3">
            {mockActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 py-2 border-b border-neutral-100 last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-700">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {language === 'ru' ? activity.action : activity.actionEn}
                  </p>
                  <p className="text-xs text-neutral-400">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
