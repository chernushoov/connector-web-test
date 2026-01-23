'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdminUI } from '@/store/admin'
import { DataTable, Column, RowAction } from '@/components/admin/data'
import { MetricCard } from '@/components/admin/charts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { AdminPaymentView } from '@/types/admin'
import {
  Search,
  Download,
  Eye,
  ArrowLeft,
  RefreshCw,
  DollarSign,
  TrendingDown,
  Calendar,
} from 'lucide-react'

// Mock refund data (payments that have been refunded)
const mockRefunds: (AdminPaymentView & { refundedAmount: number })[] = [
  {
    id: 'pay_ref_1',
    shiftId: 'shift_1',
    shiftTitle: 'Warehouse Helper',
    workerId: 'w1',
    workerName: 'Иван Петров',
    workerPhone: '+972501234567',
    employerId: 'e1',
    employerName: 'ABC Logistics',
    employerCompany: 'ABC Logistics Ltd',
    amount: 440,
    platformFee: 44,
    workerPayout: 396,
    status: 'failed',
    createdAt: new Date(Date.now() - 604800000),
    escrowedAt: new Date(Date.now() - 604800000),
    refundedAt: new Date(Date.now() - 518400000),
    refundReason: 'Worker no-show',
    refundedBy: 'admin_1',
    refundedAmount: 440,
  },
  {
    id: 'pay_ref_2',
    shiftId: 'shift_2',
    shiftTitle: 'Event Staff',
    workerId: 'w2',
    workerName: 'Мария Сидорова',
    workerPhone: '+972502345678',
    employerId: 'e2',
    employerName: 'Events Plus',
    employerCompany: 'Events Plus Inc',
    amount: 520,
    platformFee: 52,
    workerPayout: 468,
    status: 'failed',
    createdAt: new Date(Date.now() - 1209600000),
    escrowedAt: new Date(Date.now() - 1209600000),
    refundedAt: new Date(Date.now() - 1123200000),
    refundReason: 'Shift cancelled by employer',
    refundedBy: 'admin_1',
    refundedAmount: 520,
  },
  {
    id: 'pay_ref_3',
    shiftId: 'shift_3',
    shiftTitle: 'Restaurant Server',
    workerId: 'w3',
    workerName: 'Алексей Козлов',
    workerPhone: '+972503456789',
    employerId: 'e3',
    employerName: 'Fine Dining Co',
    employerCompany: 'Fine Dining Restaurant',
    amount: 300,
    platformFee: 30,
    workerPayout: 270,
    status: 'failed',
    createdAt: new Date(Date.now() - 2419200000),
    escrowedAt: new Date(Date.now() - 2419200000),
    refundedAt: new Date(Date.now() - 2332800000),
    refundReason: 'Quality issues - partial refund',
    refundedBy: 'admin_1',
    refundedAmount: 150,
  },
  {
    id: 'pay_ref_4',
    shiftId: 'shift_4',
    shiftTitle: 'Construction Helper',
    workerId: 'w4',
    workerName: 'Елена Новикова',
    workerPhone: '+972504567890',
    employerId: 'e4',
    employerName: 'Build It Ltd',
    employerCompany: 'Build It Construction',
    amount: 560,
    platformFee: 56,
    workerPayout: 504,
    status: 'failed',
    createdAt: new Date(Date.now() - 86400000 * 5),
    escrowedAt: new Date(Date.now() - 86400000 * 5),
    refundedAt: new Date(Date.now() - 86400000 * 4),
    refundReason: 'Dispute resolved in employer favor',
    refundedBy: 'admin_1',
    refundedAmount: 560,
  },
]

export default function RefundsPage() {
  const router = useRouter()
  const { language } = useAdminUI()

  const [refunds] = useState(mockRefunds)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<string>('all')

  const t = {
    title: language === 'ru' ? 'История возвратов' : 'Refund History',
    subtitle: language === 'ru' ? 'Все возвраты и компенсации' : 'All refunds and compensations',
    back: language === 'ru' ? 'Назад к платежам' : 'Back to Payments',
    all: language === 'ru' ? 'Все' : 'All Time',
    today: language === 'ru' ? 'Сегодня' : 'Today',
    week: language === 'ru' ? 'Неделя' : 'This Week',
    month: language === 'ru' ? 'Месяц' : 'This Month',
    totalRefunds: language === 'ru' ? 'Всего возвратов' : 'Total Refunds',
    totalAmount: language === 'ru' ? 'Общая сумма' : 'Total Amount',
    avgRefund: language === 'ru' ? 'Средний возврат' : 'Average Refund',
    refundsThisMonth: language === 'ru' ? 'В этом месяце' : 'This Month',
    view: language === 'ru' ? 'Подробнее' : 'View Details',
    searchPlaceholder: language === 'ru' ? 'Поиск по смене, работнику или работодателю...' : 'Search by shift, worker or employer...',
    export: language === 'ru' ? 'Экспорт' : 'Export',
  }

  // Calculate stats
  const stats = {
    totalRefunds: refunds.length,
    totalAmount: refunds.reduce((sum, r) => sum + r.refundedAmount, 0),
    avgRefund: refunds.length > 0 ? Math.round(refunds.reduce((sum, r) => sum + r.refundedAmount, 0) / refunds.length) : 0,
    thisMonth: refunds.filter(r => {
      const now = new Date()
      const refundDate = r.refundedAt ? new Date(r.refundedAt) : null
      return refundDate && refundDate.getMonth() === now.getMonth() && refundDate.getFullYear() === now.getFullYear()
    }).length,
  }

  // Filter refunds
  const filteredRefunds = refunds.filter((refund) => {
    // Date filter
    if (dateFilter !== 'all' && refund.refundedAt) {
      const now = new Date()
      const refundDate = new Date(refund.refundedAt)
      if (dateFilter === 'today') {
        if (refundDate.toDateString() !== now.toDateString()) return false
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        if (refundDate < weekAgo) return false
      } else if (dateFilter === 'month') {
        if (refundDate.getMonth() !== now.getMonth() || refundDate.getFullYear() !== now.getFullYear()) return false
      }
    }
    // Search filter
    const query = localSearchQuery.toLowerCase()
    if (query) {
      const matchesShift = refund.shiftTitle.toLowerCase().includes(query)
      const matchesWorker = refund.workerName.toLowerCase().includes(query)
      const matchesEmployer = refund.employerName.toLowerCase().includes(query) ||
        refund.employerCompany.toLowerCase().includes(query)
      const matchesReason = refund.refundReason?.toLowerCase().includes(query)
      if (!matchesShift && !matchesWorker && !matchesEmployer && !matchesReason) return false
    }
    return true
  })

  const columns: Column<typeof mockRefunds[0]>[] = [
    {
      id: 'shift',
      header: 'Shift',
      headerRu: 'Смена',
      cell: (refund) => (
        <div>
          <p className="font-medium text-neutral-900">{refund.shiftTitle}</p>
          <p className="text-xs text-neutral-500">ID: {refund.shiftId}</p>
        </div>
      ),
    },
    {
      id: 'parties',
      header: 'Parties',
      headerRu: 'Стороны',
      cell: (refund) => (
        <div>
          <p className="text-sm text-neutral-900">{refund.workerName}</p>
          <p className="text-xs text-neutral-500">{refund.employerCompany}</p>
        </div>
      ),
    },
    {
      id: 'originalAmount',
      header: 'Original',
      headerRu: 'Оригинал',
      cell: (refund) => (
        <span className="text-sm text-neutral-600">₪{refund.amount.toLocaleString()}</span>
      ),
    },
    {
      id: 'refundedAmount',
      header: 'Refunded',
      headerRu: 'Возвращено',
      cell: (refund) => (
        <span className="font-semibold text-danger">₪{refund.refundedAmount.toLocaleString()}</span>
      ),
    },
    {
      id: 'reason',
      header: 'Reason',
      headerRu: 'Причина',
      cell: (refund) => (
        <p className="text-sm text-neutral-600 max-w-[200px] truncate" title={refund.refundReason}>
          {refund.refundReason || '-'}
        </p>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      headerRu: 'Дата',
      sortable: true,
      cell: (refund) => (
        <span className="text-sm text-neutral-500">
          {refund.refundedAt?.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
        </span>
      ),
    },
  ]

  const actions: RowAction<typeof mockRefunds[0]>[] = [
    {
      id: 'view',
      label: t.view,
      labelRu: 'Подробнее',
      icon: <Eye className="w-4 h-4" />,
      onClick: (refund) => {
        router.push(`/admin/payments/${refund.id}`)
      },
    },
  ]

  const dateFilters = [
    { key: 'all', label: t.all },
    { key: 'today', label: t.today },
    { key: 'week', label: t.week },
    { key: 'month', label: t.month },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/payments">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t.back}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <RefreshCw className="w-6 h-6 text-danger" />
              {t.title}
            </h1>
            <p className="text-neutral-500">{t.subtitle}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
          {t.export}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title={t.totalRefunds}
          value={stats.totalRefunds}
          format="number"
          icon={<RefreshCw className="w-5 h-5" />}
        />
        <MetricCard
          title={t.totalAmount}
          value={stats.totalAmount}
          format="currency"
          icon={<TrendingDown className="w-5 h-5" />}
          variant="danger"
        />
        <MetricCard
          title={t.avgRefund}
          value={stats.avgRefund}
          format="currency"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard
          title={t.refundsThisMonth}
          value={stats.thisMonth}
          format="number"
          icon={<Calendar className="w-5 h-5" />}
          variant="warning"
        />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            {dateFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setDateFilter(filter.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateFilter === filter.key
                    ? 'bg-brand-primary text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <DataTable
        data={filteredRefunds}
        columns={columns}
        actions={actions}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(refund) => refund.id}
        page={page}
        pageSize={20}
        total={filteredRefunds.length}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </motion.div>
  )
}
