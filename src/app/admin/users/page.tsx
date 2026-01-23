'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAdminUI, useAdminStore } from '@/store/admin'
import { DataTable, Column, RowAction } from '@/components/admin/data'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { AdminUserView } from '@/types/admin'
import {
  Search,
  Filter,
  Download,
  Eye,
  Ban,
  CheckCircle,
  MessageCircle,
  RefreshCw,
  Users,
  Briefcase,
  Building2,
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { exportToCSV, generateExportFilename } from '@/lib/export'

// Mock data for users
const mockUsers: AdminUserView[] = [
  {
    id: '1',
    phone: '+972501234567',
    name: 'Иван Петров',
    email: 'ivan@example.com',
    photoUrl: undefined,
    role: 'worker',
    isVerified: true,
    verificationStatus: 'verified',
    isBlocked: false,
    shiftsCompleted: 45,
    totalEarned: 12500,
    totalPaid: 0,
    rating: 4.8,
    reviewCount: 32,
    disputeCount: 0,
    createdAt: new Date('2024-01-15'),
    lastActiveAt: new Date(),
  },
  {
    id: '2',
    phone: '+972502345678',
    name: 'ABC Logistics',
    email: 'contact@abc.com',
    photoUrl: undefined,
    role: 'employer',
    isVerified: true,
    verificationStatus: 'verified',
    isBlocked: false,
    shiftsCompleted: 120,
    totalEarned: 0,
    totalPaid: 85000,
    rating: 4.5,
    reviewCount: 98,
    disputeCount: 2,
    createdAt: new Date('2023-11-20'),
    lastActiveAt: new Date(),
  },
  {
    id: '3',
    phone: '+972503456789',
    name: 'Мария Сидорова',
    email: 'maria@example.com',
    photoUrl: undefined,
    role: 'worker',
    isVerified: false,
    verificationStatus: 'pending',
    isBlocked: false,
    shiftsCompleted: 12,
    totalEarned: 3200,
    totalPaid: 0,
    rating: 4.2,
    reviewCount: 8,
    disputeCount: 1,
    createdAt: new Date('2024-02-01'),
    lastActiveAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: '4',
    phone: '+972504567890',
    name: 'XYZ Services',
    email: 'info@xyz.com',
    photoUrl: undefined,
    role: 'employer',
    isVerified: true,
    verificationStatus: 'verified',
    isBlocked: true,
    blockReason: 'Нарушение условий использования',
    blockedAt: new Date('2024-03-01'),
    shiftsCompleted: 45,
    totalEarned: 0,
    totalPaid: 28000,
    rating: 3.2,
    reviewCount: 15,
    disputeCount: 8,
    createdAt: new Date('2023-08-15'),
    lastActiveAt: new Date('2024-03-01'),
  },
]

export default function UsersPage() {
  const router = useRouter()
  const { language, searchQuery } = useAdminUI()
  const { setSearchQuery, blockUser, unblockUser, verifyUser } = useAdminStore()
  const { showToast } = useToast()

  const [users, setUsers] = useState<AdminUserView[]>(mockUsers)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sortColumn, setSortColumn] = useState<string>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [roleFilter, setRoleFilter] = useState<'all' | 'worker' | 'employer'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'blocked'>('all')

  const t = {
    title: language === 'ru' ? 'Пользователи' : 'Users',
    subtitle: language === 'ru' ? 'Управление пользователями платформы' : 'Manage platform users',
    search: language === 'ru' ? 'Поиск по имени или телефону...' : 'Search by name or phone...',
    export: language === 'ru' ? 'Экспорт' : 'Export',
    refresh: language === 'ru' ? 'Обновить' : 'Refresh',
    all: language === 'ru' ? 'Все' : 'All',
    workers: language === 'ru' ? 'Работники' : 'Workers',
    employers: language === 'ru' ? 'Работодатели' : 'Employers',
    verified: language === 'ru' ? 'Верифицированы' : 'Verified',
    pending: language === 'ru' ? 'На проверке' : 'Pending',
    blocked: language === 'ru' ? 'Заблокированы' : 'Blocked',
    name: language === 'ru' ? 'Имя' : 'Name',
    phone: language === 'ru' ? 'Телефон' : 'Phone',
    role: language === 'ru' ? 'Роль' : 'Role',
    status: language === 'ru' ? 'Статус' : 'Status',
    rating: language === 'ru' ? 'Рейтинг' : 'Rating',
    shifts: language === 'ru' ? 'Смены' : 'Shifts',
    registered: language === 'ru' ? 'Регистрация' : 'Registered',
    view: language === 'ru' ? 'Просмотр' : 'View',
    block: language === 'ru' ? 'Заблокировать' : 'Block',
    unblock: language === 'ru' ? 'Разблокировать' : 'Unblock',
    verify: language === 'ru' ? 'Верифицировать' : 'Verify',
    contact: language === 'ru' ? 'Связаться' : 'Contact',
    worker: language === 'ru' ? 'Работник' : 'Worker',
    employer: language === 'ru' ? 'Работодатель' : 'Employer',
    exportSuccess: language === 'ru' ? 'Экспорт завершен' : 'Export completed',
    exportError: language === 'ru' ? 'Ошибка экспорта' : 'Export failed',
  }

  // Filter users
  const filteredUsers = users.filter((user) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !user.name.toLowerCase().includes(query) &&
        !user.phone.includes(query) &&
        !user.email?.toLowerCase().includes(query)
      ) {
        return false
      }
    }

    // Role filter
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false
    }

    // Status filter
    if (statusFilter === 'verified' && user.verificationStatus !== 'verified') {
      return false
    }
    if (statusFilter === 'pending' && user.verificationStatus !== 'pending') {
      return false
    }
    if (statusFilter === 'blocked' && !user.isBlocked) {
      return false
    }

    return true
  })

  const columns: Column<AdminUserView>[] = [
    {
      id: 'name',
      header: t.name,
      headerRu: 'Имя',
      sortable: true,
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-medium">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-neutral-900">{user.name}</p>
            <p className="text-xs text-neutral-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'phone',
      header: t.phone,
      headerRu: 'Телефон',
      accessor: 'phone',
    },
    {
      id: 'role',
      header: t.role,
      headerRu: 'Роль',
      cell: (user) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            user.role === 'worker'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-purple-100 text-purple-700'
          }`}
        >
          {user.role === 'worker' ? (
            <Briefcase className="w-3 h-3" />
          ) : (
            <Building2 className="w-3 h-3" />
          )}
          {user.role === 'worker' ? t.worker : t.employer}
        </span>
      ),
    },
    {
      id: 'status',
      header: t.status,
      headerRu: 'Статус',
      cell: (user) => {
        if (user.isBlocked) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-danger/10 text-danger">
              <Ban className="w-3 h-3" />
              {t.blocked}
            </span>
          )
        }
        if (user.verificationStatus === 'verified') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
              <CheckCircle className="w-3 h-3" />
              {t.verified}
            </span>
          )
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            {t.pending}
          </span>
        )
      },
    },
    {
      id: 'rating',
      header: t.rating,
      headerRu: 'Рейтинг',
      sortable: true,
      cell: (user) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">{user.rating.toFixed(1)}</span>
          <span className="text-neutral-400 text-xs">({user.reviewCount})</span>
        </div>
      ),
    },
    {
      id: 'shifts',
      header: t.shifts,
      headerRu: 'Смены',
      sortable: true,
      accessor: 'shiftsCompleted',
    },
    {
      id: 'createdAt',
      header: t.registered,
      headerRu: 'Регистрация',
      sortable: true,
      cell: (user) => (
        <span className="text-neutral-500">
          {user.createdAt.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
        </span>
      ),
    },
  ]

  const actions: RowAction<AdminUserView>[] = [
    {
      id: 'view',
      label: t.view,
      labelRu: 'Просмотр',
      icon: <Eye className="w-4 h-4" />,
      onClick: (user) => router.push(`/admin/users/${user.id}`),
    },
    {
      id: 'verify',
      label: t.verify,
      labelRu: 'Верифицировать',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: async (user) => {
        await verifyUser(user.id)
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, verificationStatus: 'verified' as const, isVerified: true } : u
          )
        )
      },
      show: (user) => user.verificationStatus !== 'verified',
    },
    {
      id: 'contact',
      label: t.contact,
      labelRu: 'Связаться',
      icon: <MessageCircle className="w-4 h-4" />,
      onClick: (user) => {
        window.open(`https://wa.me/${user.phone.replace(/\D/g, '')}`, '_blank')
      },
    },
    {
      id: 'block',
      label: t.block,
      labelRu: 'Заблокировать',
      icon: <Ban className="w-4 h-4" />,
      variant: 'danger',
      onClick: async (user) => {
        await blockUser(user.id, 'Admin action')
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isBlocked: true } : u))
        )
      },
      show: (user) => !user.isBlocked,
    },
    {
      id: 'unblock',
      label: t.unblock,
      labelRu: 'Разблокировать',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: async (user) => {
        await unblockUser(user.id)
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isBlocked: false } : u))
        )
      },
      show: (user) => user.isBlocked,
    },
  ]

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column)
    setSortDirection(direction)
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsLoading(false)
  }

  const handleExport = () => {
    try {
      const dataToExport = filteredUsers.map((user) => ({
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email || '',
        role: user.role,
        status: user.isBlocked ? 'blocked' : user.verificationStatus,
        rating: user.rating,
        completedShifts: user.shiftsCompleted,
        totalEarnings: user.totalEarned,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      }))

      const columns = [
        { key: 'id' as const, header: 'ID' },
        { key: 'name' as const, header: language === 'ru' ? 'Имя' : 'Name' },
        { key: 'phone' as const, header: language === 'ru' ? 'Телефон' : 'Phone' },
        { key: 'email' as const, header: 'Email' },
        { key: 'role' as const, header: language === 'ru' ? 'Роль' : 'Role' },
        { key: 'status' as const, header: language === 'ru' ? 'Статус' : 'Status' },
        { key: 'rating' as const, header: language === 'ru' ? 'Рейтинг' : 'Rating' },
        { key: 'completedShifts' as const, header: language === 'ru' ? 'Смены' : 'Shifts' },
        { key: 'totalEarnings' as const, header: language === 'ru' ? 'Заработок' : 'Earnings' },
        { key: 'isVerified' as const, header: language === 'ru' ? 'Верифицирован' : 'Verified' },
        { key: 'createdAt' as const, header: language === 'ru' ? 'Дата регистрации' : 'Registration Date' },
      ]

      exportToCSV(dataToExport, columns, generateExportFilename('users'))
      showToast(t.exportSuccess, 'success')
    } catch {
      showToast(t.exportError, 'error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
          <p className="text-neutral-500">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={handleExport}>
            {t.export}
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
          >
            {t.refresh}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'all'
                  ? 'bg-brand-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t.all}
            </button>
            <button
              onClick={() => setRoleFilter('worker')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'worker'
                  ? 'bg-brand-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t.workers}
            </button>
            <button
              onClick={() => setRoleFilter('employer')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'employer'
                  ? 'bg-brand-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t.employers}
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t.all}
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'verified'
                  ? 'bg-success text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t.verified}
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-warning text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t.pending}
            </button>
            <button
              onClick={() => setStatusFilter('blocked')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'blocked'
                  ? 'bg-danger text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t.blocked}
            </button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-neutral-500">{t.all}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === 'worker').length}
              </p>
              <p className="text-sm text-neutral-500">{t.workers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === 'employer').length}
              </p>
              <p className="text-sm text-neutral-500">{t.employers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-danger/10 rounded-lg">
              <Ban className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.isBlocked).length}
              </p>
              <p className="text-sm text-neutral-500">{t.blocked}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        actions={actions}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(user) => user.id}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        page={page}
        pageSize={20}
        total={filteredUsers.length}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </motion.div>
  )
}
