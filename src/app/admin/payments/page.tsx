'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdminUI, useAdminStore } from '@/store/admin'
import { DataTable, Column, RowAction } from '@/components/admin/data'
import { MetricCard } from '@/components/admin/charts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { exportToCSV, generateExportFilename } from '@/lib/export'
import type { AdminPaymentView } from '@/types/admin'
import type { PaymentStatus } from '@/types'
import {
  Search,
  Download,
  Eye,
  DollarSign,
  CreditCard,
  RefreshCw,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Wallet,
  TrendingUp,
} from 'lucide-react'

// Mock data
const mockPayments: AdminPaymentView[] = [
  {
    id: 'pay_1',
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
    status: 'escrowed',
    createdAt: new Date(),
    escrowedAt: new Date(),
  },
  {
    id: 'pay_2',
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
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'pay_3',
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
    status: 'released',
    createdAt: new Date(Date.now() - 86400000),
    escrowedAt: new Date(Date.now() - 86400000),
    releasedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'pay_4',
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
    status: 'escrowed',
    createdAt: new Date(Date.now() - 172800000),
    escrowedAt: new Date(Date.now() - 172800000),
  },
  {
    id: 'pay_5',
    shiftId: 'shift_5',
    shiftTitle: 'Cleaning Staff',
    workerId: 'w5',
    workerName: 'Дмитрий Иванов',
    workerPhone: '+972505678901',
    employerId: 'e5',
    employerName: 'Clean Pro',
    employerCompany: 'Clean Pro Services',
    amount: 180,
    platformFee: 18,
    workerPayout: 162,
    status: 'released',
    createdAt: new Date(Date.now() - 259200000),
    escrowedAt: new Date(Date.now() - 259200000),
    releasedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'pay_6',
    shiftId: 'shift_6',
    shiftTitle: 'Delivery Driver',
    workerId: 'w6',
    workerName: 'Анна Смирнова',
    workerPhone: '+972506789012',
    employerId: 'e6',
    employerName: 'Fast Delivery',
    employerCompany: 'Fast Delivery Inc',
    amount: 480,
    platformFee: 48,
    workerPayout: 432,
    status: 'disputed',
    createdAt: new Date(Date.now() - 345600000),
    escrowedAt: new Date(Date.now() - 345600000),
  },
  {
    id: 'pay_7',
    shiftId: 'shift_7',
    shiftTitle: 'Security Guard',
    workerId: 'w7',
    workerName: 'Сергей Кузнецов',
    workerPhone: '+972507890123',
    employerId: 'e7',
    employerName: 'Safe Guard',
    employerCompany: 'Safe Guard Security',
    amount: 440,
    platformFee: 44,
    workerPayout: 396,
    status: 'failed',
    createdAt: new Date(Date.now() - 432000000),
    refundReason: 'Payment method declined',
  },
  {
    id: 'pay_8',
    shiftId: 'shift_8',
    shiftTitle: 'Office Assistant',
    workerId: 'w8',
    workerName: 'Ольга Федорова',
    workerPhone: '+972508901234',
    employerId: 'e8',
    employerName: 'Tech Corp',
    employerCompany: 'Tech Corporation',
    amount: 350,
    platformFee: 35,
    workerPayout: 315,
    status: 'escrowed',
    createdAt: new Date(Date.now() - 7200000),
    escrowedAt: new Date(Date.now() - 7200000),
  },
  {
    id: 'pay_9',
    shiftId: 'shift_9',
    shiftTitle: 'Retail Cashier',
    workerId: 'w9',
    workerName: 'Михаил Попов',
    workerPhone: '+972509012345',
    employerId: 'e9',
    employerName: 'Super Store',
    employerCompany: 'Super Store Chain',
    amount: 280,
    platformFee: 28,
    workerPayout: 252,
    status: 'processing',
    createdAt: new Date(Date.now() - 1800000),
  },
  {
    id: 'pay_10',
    shiftId: 'shift_10',
    shiftTitle: 'Moving Helper',
    workerId: 'w10',
    workerName: 'Андрей Волков',
    workerPhone: '+972500123456',
    employerId: 'e10',
    employerName: 'Quick Move',
    employerCompany: 'Quick Move Services',
    amount: 620,
    platformFee: 62,
    workerPayout: 558,
    status: 'released',
    createdAt: new Date(Date.now() - 518400000),
    escrowedAt: new Date(Date.now() - 518400000),
    releasedAt: new Date(Date.now() - 432000000),
  },
]

export default function PaymentsPage() {
  const router = useRouter()
  const { language } = useAdminUI()
  const { releaseEscrow, refundPayment } = useAdminStore()
  const { showToast } = useToast()

  const [payments, setPayments] = useState<AdminPaymentView[]>(mockPayments)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  // Refund modal state
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [paymentToRefund, setPaymentToRefund] = useState<AdminPaymentView | null>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const t = {
    title: language === 'ru' ? 'Платежи' : 'Payments',
    subtitle: language === 'ru' ? 'Управление платежами и выплатами' : 'Manage payments and payouts',
    all: language === 'ru' ? 'Все' : 'All',
    pending: language === 'ru' ? 'Ожидают' : 'Pending',
    processing: language === 'ru' ? 'В обработке' : 'Processing',
    escrowed: language === 'ru' ? 'На эскроу' : 'Escrowed',
    released: language === 'ru' ? 'Выплачено' : 'Released',
    disputed: language === 'ru' ? 'Оспорено' : 'Disputed',
    failed: language === 'ru' ? 'Ошибка' : 'Failed',
    totalVolume: language === 'ru' ? 'Общий объем' : 'Total Volume',
    platformFees: language === 'ru' ? 'Комиссия' : 'Platform Fees',
    pendingRelease: language === 'ru' ? 'К выплате' : 'Pending Release',
    disputedAmount: language === 'ru' ? 'Оспорено' : 'In Dispute',
    view: language === 'ru' ? 'Подробнее' : 'View Details',
    releaseEscrow: language === 'ru' ? 'Выплатить' : 'Release Escrow',
    refund: language === 'ru' ? 'Возврат' : 'Refund',
    refundPayment: language === 'ru' ? 'Возврат платежа' : 'Refund Payment',
    refundAmount: language === 'ru' ? 'Сумма возврата' : 'Refund Amount',
    refundReason: language === 'ru' ? 'Причина возврата' : 'Refund Reason',
    refundReasonPlaceholder: language === 'ru' ? 'Укажите причину возврата...' : 'Enter refund reason...',
    cancel: language === 'ru' ? 'Отмена' : 'Cancel',
    confirmRefund: language === 'ru' ? 'Подтвердить возврат' : 'Confirm Refund',
    escrowReleased: language === 'ru' ? 'Платеж выплачен' : 'Escrow released successfully',
    paymentRefunded: language === 'ru' ? 'Платеж возвращен' : 'Payment refunded',
    errorReleasing: language === 'ru' ? 'Ошибка при выплате' : 'Error releasing escrow',
    errorRefunding: language === 'ru' ? 'Ошибка при возврате' : 'Error processing refund',
    searchPlaceholder: language === 'ru' ? 'Поиск по смене, работнику или работодателю...' : 'Search by shift, worker or employer...',
    fullRefund: language === 'ru' ? 'Полный возврат' : 'Full Refund',
    partialRefund: language === 'ru' ? 'Частичный возврат' : 'Partial Refund',
    export: language === 'ru' ? 'Экспорт' : 'Export',
    viewRefunds: language === 'ru' ? 'История возвратов' : 'Refund History',
    exportSuccess: language === 'ru' ? 'Экспорт завершен' : 'Export completed',
    exportError: language === 'ru' ? 'Ошибка экспорта' : 'Export failed',
  }

  // Calculate stats
  const stats = {
    totalVolume: payments.reduce((sum, p) => sum + p.amount, 0),
    platformFees: payments.reduce((sum, p) => sum + p.platformFee, 0),
    pendingRelease: payments.filter(p => p.status === 'escrowed').reduce((sum, p) => sum + p.workerPayout, 0),
    disputedAmount: payments.filter(p => p.status === 'disputed').reduce((sum, p) => sum + p.amount, 0),
  }

  // Handle export
  const handleExport = () => {
    try {
      const dataToExport = filteredPayments.map((payment) => ({
        id: payment.id,
        shiftId: payment.shiftId,
        shiftTitle: payment.shiftTitle,
        workerId: payment.workerId,
        workerName: payment.workerName,
        workerPhone: payment.workerPhone,
        employerId: payment.employerId,
        employerName: payment.employerName,
        amount: payment.amount,
        fee: payment.platformFee,
        payout: payment.workerPayout,
        status: payment.status,
        createdAt: payment.createdAt,
        releasedAt: payment.releasedAt || '',
      }))

      const columns = [
        { key: 'id' as const, header: 'Payment ID' },
        { key: 'shiftId' as const, header: 'Shift ID' },
        { key: 'shiftTitle' as const, header: language === 'ru' ? 'Смена' : 'Shift' },
        { key: 'workerId' as const, header: 'Worker ID' },
        { key: 'workerName' as const, header: language === 'ru' ? 'Работник' : 'Worker' },
        { key: 'workerPhone' as const, header: language === 'ru' ? 'Телефон' : 'Phone' },
        { key: 'employerId' as const, header: 'Employer ID' },
        { key: 'employerName' as const, header: language === 'ru' ? 'Работодатель' : 'Employer' },
        { key: 'amount' as const, header: language === 'ru' ? 'Сумма (₪)' : 'Amount (₪)' },
        { key: 'fee' as const, header: language === 'ru' ? 'Комиссия (₪)' : 'Fee (₪)' },
        { key: 'payout' as const, header: language === 'ru' ? 'Выплата (₪)' : 'Payout (₪)' },
        { key: 'status' as const, header: language === 'ru' ? 'Статус' : 'Status' },
        { key: 'createdAt' as const, header: language === 'ru' ? 'Создано' : 'Created' },
        { key: 'releasedAt' as const, header: language === 'ru' ? 'Выплачено' : 'Released' },
      ]

      exportToCSV(dataToExport, columns, generateExportFilename('payments'))
      showToast(t.exportSuccess, 'success')
    } catch {
      showToast(t.exportError, 'error')
    }
  }

  // Handle release escrow
  const handleReleaseEscrow = async (payment: AdminPaymentView) => {
    setIsProcessing(true)
    try {
      await releaseEscrow(payment.id)
      setPayments(prev => prev.map(p =>
        p.id === payment.id
          ? { ...p, status: 'released' as PaymentStatus, releasedAt: new Date() }
          : p
      ))
      showToast(t.escrowReleased, 'success')
    } catch (error) {
      showToast(t.errorReleasing, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // Open refund modal
  const openRefundModal = (payment: AdminPaymentView) => {
    setPaymentToRefund(payment)
    setRefundAmount(payment.amount.toString())
    setRefundReason('')
    setRefundModalOpen(true)
  }

  // Handle refund
  const handleRefund = async () => {
    if (!paymentToRefund || !refundReason.trim()) return

    const amount = parseFloat(refundAmount)
    if (isNaN(amount) || amount <= 0 || amount > paymentToRefund.amount) {
      showToast(language === 'ru' ? 'Неверная сумма возврата' : 'Invalid refund amount', 'error')
      return
    }

    setIsProcessing(true)
    try {
      await refundPayment(paymentToRefund.id, amount, refundReason)
      setPayments(prev => prev.map(p =>
        p.id === paymentToRefund.id
          ? { ...p, status: 'failed' as PaymentStatus, refundReason, refundedAt: new Date() }
          : p
      ))
      showToast(t.paymentRefunded, 'success')
      setRefundModalOpen(false)
      setPaymentToRefund(null)
    } catch (error) {
      showToast(t.errorRefunding, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    // Status filter
    if (statusFilter !== 'all' && payment.status !== statusFilter) return false
    // Search filter
    const query = localSearchQuery.toLowerCase()
    if (query) {
      const matchesShift = payment.shiftTitle.toLowerCase().includes(query)
      const matchesWorker = payment.workerName.toLowerCase().includes(query)
      const matchesEmployer = payment.employerName.toLowerCase().includes(query) ||
        payment.employerCompany.toLowerCase().includes(query)
      if (!matchesShift && !matchesWorker && !matchesEmployer) return false
    }
    return true
  })

  const columns: Column<AdminPaymentView>[] = [
    {
      id: 'shift',
      header: 'Shift',
      headerRu: 'Смена',
      sortable: true,
      cell: (payment) => (
        <div>
          <p className="font-medium text-neutral-900">{payment.shiftTitle}</p>
          <p className="text-xs text-neutral-500">ID: {payment.shiftId}</p>
        </div>
      ),
    },
    {
      id: 'worker',
      header: 'Worker',
      headerRu: 'Работник',
      cell: (payment) => (
        <div>
          <p className="text-sm font-medium text-neutral-900">{payment.workerName}</p>
          <p className="text-xs text-neutral-500">{payment.workerPhone}</p>
        </div>
      ),
    },
    {
      id: 'employer',
      header: 'Employer',
      headerRu: 'Работодатель',
      cell: (payment) => (
        <div>
          <p className="text-sm font-medium text-neutral-900">{payment.employerName}</p>
          <p className="text-xs text-neutral-500">{payment.employerCompany}</p>
        </div>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      headerRu: 'Сумма',
      sortable: true,
      cell: (payment) => (
        <div>
          <p className="font-semibold text-neutral-900">₪{payment.amount.toLocaleString()}</p>
          <p className="text-xs text-neutral-500">
            {language === 'ru' ? 'Комиссия' : 'Fee'}: ₪{payment.platformFee}
          </p>
        </div>
      ),
    },
    {
      id: 'payout',
      header: 'Worker Payout',
      headerRu: 'К выплате',
      cell: (payment) => (
        <span className="font-medium text-success">₪{payment.workerPayout.toLocaleString()}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      headerRu: 'Статус',
      cell: (payment) => {
        const statusColors: Record<string, string> = {
          pending: 'bg-neutral-100 text-neutral-600',
          processing: 'bg-blue-100 text-blue-600',
          escrowed: 'bg-warning/10 text-warning',
          released: 'bg-success/10 text-success',
          disputed: 'bg-danger/10 text-danger',
          failed: 'bg-danger/10 text-danger',
        }
        const statusLabels: Record<string, string> = {
          pending: t.pending,
          processing: t.processing,
          escrowed: t.escrowed,
          released: t.released,
          disputed: t.disputed,
          failed: t.failed,
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[payment.status] || ''}`}>
            {statusLabels[payment.status] || payment.status}
          </span>
        )
      },
    },
    {
      id: 'date',
      header: 'Date',
      headerRu: 'Дата',
      sortable: true,
      cell: (payment) => (
        <span className="text-sm text-neutral-500">
          {payment.createdAt.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
        </span>
      ),
    },
  ]

  const actions: RowAction<AdminPaymentView>[] = [
    {
      id: 'view',
      label: t.view,
      labelRu: 'Подробнее',
      icon: <Eye className="w-4 h-4" />,
      onClick: (payment) => {
        router.push(`/admin/payments/${payment.id}`)
      },
    },
    {
      id: 'release',
      label: t.releaseEscrow,
      labelRu: 'Выплатить',
      icon: <ArrowUpRight className="w-4 h-4" />,
      onClick: handleReleaseEscrow,
      show: (payment) => payment.status === 'escrowed',
    },
    {
      id: 'refund',
      label: t.refund,
      labelRu: 'Возврат',
      icon: <RefreshCw className="w-4 h-4" />,
      variant: 'danger',
      onClick: openRefundModal,
      show: (payment) => payment.status === 'escrowed' || payment.status === 'released',
    },
  ]

  const statusFilters: { key: string; label: string }[] = [
    { key: 'all', label: t.all },
    { key: 'pending', label: t.pending },
    { key: 'escrowed', label: t.escrowed },
    { key: 'released', label: t.released },
    { key: 'disputed', label: t.disputed },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
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
          <Link href="/admin/payments/refunds">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />}>
              {t.viewRefunds}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title={t.totalVolume}
          value={stats.totalVolume}
          format="currency"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard
          title={t.platformFees}
          value={stats.platformFees}
          format="currency"
          icon={<TrendingUp className="w-5 h-5" />}
          variant="success"
        />
        <MetricCard
          title={t.pendingRelease}
          value={stats.pendingRelease}
          format="currency"
          icon={<Wallet className="w-5 h-5" />}
          variant="warning"
        />
        <MetricCard
          title={t.disputedAmount}
          value={stats.disputedAmount}
          format="currency"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="danger"
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
            {statusFilters.map((status) => (
              <button
                key={status.key}
                onClick={() => setStatusFilter(status.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status.key
                    ? 'bg-brand-primary text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <DataTable
        data={filteredPayments}
        columns={columns}
        actions={actions}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(payment) => payment.id}
        page={page}
        pageSize={20}
        total={filteredPayments.length}
        onPageChange={setPage}
        isLoading={isLoading || isProcessing}
      />

      {/* Refund Modal */}
      <Modal
        isOpen={refundModalOpen}
        onClose={() => {
          setRefundModalOpen(false)
          setPaymentToRefund(null)
        }}
        title={t.refundPayment}
        subtitle={paymentToRefund ? `${paymentToRefund.shiftTitle} - ${paymentToRefund.workerName}` : ''}
        size="md"
      >
        {paymentToRefund && (
          <div className="space-y-4">
            <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">{language === 'ru' ? 'Общая сумма' : 'Total Amount'}</span>
                <span className="font-semibold text-neutral-900">₪{paymentToRefund.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">{language === 'ru' ? 'Комиссия' : 'Platform Fee'}</span>
                <span className="text-sm text-neutral-600">₪{paymentToRefund.platformFee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">{language === 'ru' ? 'К выплате работнику' : 'Worker Payout'}</span>
                <span className="text-sm font-medium text-success">₪{paymentToRefund.workerPayout.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t.refundAmount} <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">₪</span>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={paymentToRefund.amount}
                  min={0}
                  step={0.01}
                  className="w-full pl-8 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setRefundAmount(paymentToRefund.amount.toString())}
                  className="px-3 py-1 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  {t.fullRefund}
                </button>
                <button
                  onClick={() => setRefundAmount((paymentToRefund.amount / 2).toString())}
                  className="px-3 py-1 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  50%
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t.refundReason} <span className="text-danger">*</span>
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder={t.refundReasonPlaceholder}
                rows={3}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              />
            </div>

            {/* Quick reasons */}
            <div className="flex flex-wrap gap-2">
              {[
                language === 'ru' ? 'Работник не вышел' : 'Worker no-show',
                language === 'ru' ? 'Смена отменена' : 'Shift cancelled',
                language === 'ru' ? 'Проблемы с качеством' : 'Quality issues',
                language === 'ru' ? 'По запросу клиента' : 'Customer request',
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setRefundReason(reason)}
                  className="px-3 py-1.5 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        )}

        <ModalFooter>
          <button
            onClick={() => {
              setRefundModalOpen(false)
              setPaymentToRefund(null)
            }}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleRefund}
            disabled={isProcessing || !refundReason.trim() || !refundAmount}
            className="px-4 py-2 rounded-xl font-semibold text-white bg-danger hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing && (
              <motion.span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            )}
            {t.confirmRefund}
          </button>
        </ModalFooter>
      </Modal>
    </motion.div>
  )
}
