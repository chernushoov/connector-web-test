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
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { exportToCSV, generateExportFilename } from '@/lib/export'
import type { AdminShiftView } from '@/types/admin'
import {
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'

// Mock data
const mockShifts: AdminShiftView[] = [
  {
    id: '1',
    title: 'Warehouse Helper',
    description: 'Loading and unloading goods',
    status: 'active',
    employerId: 'e1',
    employerName: 'ABC Logistics',
    employerCompany: 'ABC Logistics Ltd',
    employerRating: 4.5,
    location: { address: 'Industrial Area 5', city: 'Tel Aviv', lat: 32.0, lng: 34.8 },
    date: new Date(),
    startTime: '08:00',
    endTime: '16:00',
    baseRate: 55,
    totalEstimate: 440,
    slots: 5,
    filled: 3,
    applicants: 12,
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Event Staff',
    description: 'Event setup and assistance',
    status: 'pending',
    employerId: 'e2',
    employerName: 'Events Plus',
    employerCompany: 'Events Plus Inc',
    employerRating: 4.8,
    location: { address: 'Convention Center', city: 'Haifa', lat: 32.8, lng: 35.0 },
    date: new Date(Date.now() + 86400000),
    startTime: '10:00',
    endTime: '18:00',
    baseRate: 65,
    totalEstimate: 520,
    slots: 10,
    filled: 0,
    applicants: 25,
    createdAt: new Date(),
  },
  {
    id: '3',
    title: 'Restaurant Server',
    description: 'Serving guests and table management',
    status: 'pending',
    employerId: 'e3',
    employerName: 'Fine Dining Co',
    employerCompany: 'Fine Dining Restaurant',
    employerRating: 4.2,
    location: { address: 'Beach Road 12', city: 'Netanya', lat: 32.3, lng: 34.9 },
    date: new Date(Date.now() + 172800000),
    startTime: '17:00',
    endTime: '23:00',
    baseRate: 50,
    totalEstimate: 300,
    slots: 3,
    filled: 0,
    applicants: 8,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: '4',
    title: 'Construction Helper',
    description: 'General construction assistance',
    status: 'active',
    employerId: 'e4',
    employerName: 'Build It Ltd',
    employerCompany: 'Build It Construction',
    employerRating: 4.0,
    location: { address: 'New District 7', city: 'Jerusalem', lat: 31.8, lng: 35.2 },
    date: new Date(),
    startTime: '07:00',
    endTime: '15:00',
    baseRate: 70,
    totalEstimate: 560,
    slots: 8,
    filled: 6,
    applicants: 20,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: '5',
    title: 'Cleaning Staff',
    description: 'Office cleaning after hours',
    status: 'completed',
    employerId: 'e5',
    employerName: 'Clean Pro',
    employerCompany: 'Clean Pro Services',
    employerRating: 4.6,
    location: { address: 'Business Center', city: 'Tel Aviv', lat: 32.1, lng: 34.8 },
    date: new Date(Date.now() - 86400000),
    startTime: '18:00',
    endTime: '22:00',
    baseRate: 45,
    totalEstimate: 180,
    slots: 2,
    filled: 2,
    applicants: 5,
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: '6',
    title: 'Delivery Driver',
    description: 'Local package delivery',
    status: 'pending',
    employerId: 'e6',
    employerName: 'Fast Delivery',
    employerCompany: 'Fast Delivery Inc',
    employerRating: 3.9,
    location: { address: 'Logistics Hub', city: 'Ashdod', lat: 31.8, lng: 34.6 },
    date: new Date(Date.now() + 259200000),
    startTime: '09:00',
    endTime: '17:00',
    baseRate: 60,
    totalEstimate: 480,
    slots: 4,
    filled: 0,
    applicants: 15,
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: '7',
    title: 'Security Guard',
    description: 'Night shift security',
    status: 'cancelled',
    employerId: 'e7',
    employerName: 'Safe Guard',
    employerCompany: 'Safe Guard Security',
    employerRating: 4.3,
    location: { address: 'Industrial Zone', city: 'Haifa', lat: 32.8, lng: 35.0 },
    date: new Date(Date.now() + 86400000),
    startTime: '22:00',
    endTime: '06:00',
    baseRate: 55,
    totalEstimate: 440,
    slots: 2,
    filled: 0,
    applicants: 3,
    createdAt: new Date(Date.now() - 259200000),
    rejectionReason: 'Event cancelled by employer',
  },
]

export default function ShiftsPage() {
  const router = useRouter()
  const { language, searchQuery } = useAdminUI()
  const { approveShift, rejectShift } = useAdminStore()
  const { showToast } = useToast()

  const [shifts, setShifts] = useState<AdminShiftView[]>(mockShifts)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [shiftToReject, setShiftToReject] = useState<AdminShiftView | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const t = {
    title: language === 'ru' ? 'Смены' : 'Shifts',
    subtitle: language === 'ru' ? 'Управление объявлениями о сменах' : 'Manage shift postings',
    all: language === 'ru' ? 'Все' : 'All',
    active: language === 'ru' ? 'Активные' : 'Active',
    pending: language === 'ru' ? 'На модерации' : 'Pending',
    completed: language === 'ru' ? 'Завершенные' : 'Completed',
    cancelled: language === 'ru' ? 'Отмененные' : 'Cancelled',
    totalShifts: language === 'ru' ? 'Всего смен' : 'Total Shifts',
    activeShifts: language === 'ru' ? 'Активные' : 'Active',
    pendingModeration: language === 'ru' ? 'На модерации' : 'Pending Moderation',
    completedToday: language === 'ru' ? 'Завершено сегодня' : 'Completed Today',
    view: language === 'ru' ? 'Просмотр' : 'View',
    approve: language === 'ru' ? 'Одобрить' : 'Approve',
    reject: language === 'ru' ? 'Отклонить' : 'Reject',
    rejectShift: language === 'ru' ? 'Отклонить смену' : 'Reject Shift',
    rejectReasonLabel: language === 'ru' ? 'Причина отклонения' : 'Rejection Reason',
    rejectReasonPlaceholder: language === 'ru' ? 'Укажите причину отклонения...' : 'Enter rejection reason...',
    cancel: language === 'ru' ? 'Отмена' : 'Cancel',
    confirmReject: language === 'ru' ? 'Подтвердить отклонение' : 'Confirm Rejection',
    shiftApproved: language === 'ru' ? 'Смена одобрена' : 'Shift approved successfully',
    shiftRejected: language === 'ru' ? 'Смена отклонена' : 'Shift rejected',
    errorApproving: language === 'ru' ? 'Ошибка при одобрении смены' : 'Error approving shift',
    errorRejecting: language === 'ru' ? 'Ошибка при отклонении смены' : 'Error rejecting shift',
    reasonRequired: language === 'ru' ? 'Укажите причину отклонения' : 'Please provide a rejection reason',
    exportSuccess: language === 'ru' ? 'Экспорт завершен' : 'Export completed',
    exportError: language === 'ru' ? 'Ошибка экспорта' : 'Export failed',
    export: language === 'ru' ? 'Экспорт' : 'Export',
  }

  // Handle approve shift
  const handleApproveShift = async (shift: AdminShiftView) => {
    setIsProcessing(true)
    try {
      await approveShift(shift.id)
      setShifts(prev => prev.map(s =>
        s.id === shift.id
          ? { ...s, status: 'active' as const, moderatedAt: new Date() }
          : s
      ))
      showToast(t.shiftApproved, 'success')
    } catch (error) {
      showToast(t.errorApproving, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // Open reject modal
  const openRejectModal = (shift: AdminShiftView) => {
    setShiftToReject(shift)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  // Handle reject shift
  const handleRejectShift = async () => {
    if (!shiftToReject) return

    if (!rejectReason.trim()) {
      showToast(t.reasonRequired, 'warning')
      return
    }

    setIsProcessing(true)
    try {
      await rejectShift(shiftToReject.id, rejectReason)
      setShifts(prev => prev.map(s =>
        s.id === shiftToReject.id
          ? { ...s, status: 'rejected' as const, rejectionReason: rejectReason, moderatedAt: new Date() }
          : s
      ))
      showToast(t.shiftRejected, 'success')
      setRejectModalOpen(false)
      setShiftToReject(null)
      setRejectReason('')
    } catch (error) {
      showToast(t.errorRejecting, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // Calculate stats from actual data
  const stats = {
    total: shifts.length,
    active: shifts.filter(s => s.status === 'active').length,
    pending: shifts.filter(s => s.status === 'pending').length,
    completedToday: shifts.filter(s =>
      s.status === 'completed' &&
      new Date(s.date).toDateString() === new Date().toDateString()
    ).length,
  }

  // Handle export
  const handleExport = () => {
    try {
      const dataToExport = filteredShifts.map((shift) => ({
        id: shift.id,
        title: shift.title,
        employer: shift.employerCompany,
        location: `${shift.location.city}, ${shift.location.address}`,
        date: shift.date.toISOString().split('T')[0],
        startTime: shift.startTime,
        endTime: shift.endTime,
        rate: shift.baseRate,
        workers: shift.slots,
        filled: shift.filled,
        applicants: shift.applicants,
        status: shift.status,
        createdAt: shift.createdAt,
      }))

      const columns = [
        { key: 'id' as const, header: 'ID' },
        { key: 'title' as const, header: language === 'ru' ? 'Название' : 'Title' },
        { key: 'employer' as const, header: language === 'ru' ? 'Работодатель' : 'Employer' },
        { key: 'location' as const, header: language === 'ru' ? 'Локация' : 'Location' },
        { key: 'date' as const, header: language === 'ru' ? 'Дата' : 'Date' },
        { key: 'startTime' as const, header: language === 'ru' ? 'Начало' : 'Start' },
        { key: 'endTime' as const, header: language === 'ru' ? 'Конец' : 'End' },
        { key: 'rate' as const, header: language === 'ru' ? 'Ставка (₪/ч)' : 'Rate (₪/hr)' },
        { key: 'workers' as const, header: language === 'ru' ? 'Мест' : 'Slots' },
        { key: 'filled' as const, header: language === 'ru' ? 'Заполнено' : 'Filled' },
        { key: 'applicants' as const, header: language === 'ru' ? 'Откликов' : 'Applicants' },
        { key: 'status' as const, header: language === 'ru' ? 'Статус' : 'Status' },
        { key: 'createdAt' as const, header: language === 'ru' ? 'Создано' : 'Created' },
      ]

      exportToCSV(dataToExport, columns, generateExportFilename('shifts'))
      showToast(t.exportSuccess, 'success')
    } catch {
      showToast(t.exportError, 'error')
    }
  }

  const filteredShifts = shifts.filter((shift) => {
    // Status filter
    if (statusFilter !== 'all' && shift.status !== statusFilter) return false
    // Search filter
    const query = localSearchQuery.toLowerCase()
    if (query) {
      const matchesTitle = shift.title.toLowerCase().includes(query)
      const matchesCompany = shift.employerCompany.toLowerCase().includes(query)
      const matchesCity = shift.location.city.toLowerCase().includes(query)
      if (!matchesTitle && !matchesCompany && !matchesCity) return false
    }
    return true
  })

  const columns: Column<AdminShiftView>[] = [
    {
      id: 'title',
      header: 'Title',
      headerRu: 'Название',
      sortable: true,
      cell: (shift) => (
        <div>
          <p className="font-medium text-neutral-900">{shift.title}</p>
          <p className="text-xs text-neutral-500">{shift.employerCompany}</p>
        </div>
      ),
    },
    {
      id: 'location',
      header: 'Location',
      headerRu: 'Локация',
      cell: (shift) => (
        <div className="flex items-center gap-1 text-neutral-600">
          <MapPin className="w-3 h-3" />
          <span className="text-sm">{shift.location.city}</span>
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      headerRu: 'Дата',
      sortable: true,
      cell: (shift) => (
        <div className="flex items-center gap-1 text-neutral-600">
          <Calendar className="w-3 h-3" />
          <span className="text-sm">
            {shift.date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
          </span>
        </div>
      ),
    },
    {
      id: 'time',
      header: 'Time',
      headerRu: 'Время',
      cell: (shift) => (
        <div className="flex items-center gap-1 text-neutral-600">
          <Clock className="w-3 h-3" />
          <span className="text-sm">{shift.startTime} - {shift.endTime}</span>
        </div>
      ),
    },
    {
      id: 'rate',
      header: 'Rate',
      headerRu: 'Ставка',
      sortable: true,
      cell: (shift) => (
        <span className="font-medium text-success">₪{shift.baseRate}/h</span>
      ),
    },
    {
      id: 'slots',
      header: 'Slots',
      headerRu: 'Места',
      cell: (shift) => (
        <span className="text-sm">
          {shift.filled}/{shift.slots} ({shift.applicants} applied)
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      headerRu: 'Статус',
      cell: (shift) => {
        const statusColors: Record<string, string> = {
          active: 'bg-success/10 text-success',
          pending: 'bg-warning/10 text-warning',
          completed: 'bg-neutral-100 text-neutral-600',
          cancelled: 'bg-danger/10 text-danger',
          rejected: 'bg-danger/10 text-danger',
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[shift.status] || ''}`}>
            {shift.status}
          </span>
        )
      },
    },
  ]

  const actions: RowAction<AdminShiftView>[] = [
    {
      id: 'view',
      label: t.view,
      labelRu: 'Просмотр',
      icon: <Eye className="w-4 h-4" />,
      onClick: (shift) => {
        router.push(`/admin/shifts/${shift.id}`)
      },
    },
    {
      id: 'approve',
      label: t.approve,
      labelRu: 'Одобрить',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: handleApproveShift,
      show: (shift) => shift.status === 'pending',
    },
    {
      id: 'reject',
      label: t.reject,
      labelRu: 'Отклонить',
      icon: <XCircle className="w-4 h-4" />,
      variant: 'danger',
      onClick: openRejectModal,
      show: (shift) => shift.status === 'pending',
    },
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
          <Link href="/admin/shifts/pending">
            <Button variant="primary" size="sm" leftIcon={<AlertTriangle className="w-4 h-4" />}>
              {t.pendingModeration} ({stats.pending})
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title={t.totalShifts} value={stats.total} icon={<Calendar className="w-5 h-5" />} />
        <MetricCard title={t.activeShifts} value={stats.active} icon={<CheckCircle className="w-5 h-5" />} variant="success" />
        <MetricCard title={t.pendingModeration} value={stats.pending} icon={<Clock className="w-5 h-5" />} variant="warning" />
        <MetricCard title={t.completedToday} value={stats.completedToday} icon={<CheckCircle className="w-5 h-5" />} />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder={language === 'ru' ? 'Поиск смен...' : 'Search shifts...'}
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'active', 'pending', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-brand-primary text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <DataTable
        data={filteredShifts}
        columns={columns}
        actions={actions}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(shift) => shift.id}
        page={page}
        pageSize={20}
        total={filteredShifts.length}
        onPageChange={setPage}
        isLoading={isLoading || isProcessing}
      />

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false)
          setShiftToReject(null)
          setRejectReason('')
        }}
        title={t.rejectShift}
        subtitle={shiftToReject ? `${shiftToReject.title} - ${shiftToReject.employerCompany}` : ''}
        size="md"
      >
        <div className="space-y-4">
          {shiftToReject && (
            <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <MapPin className="w-4 h-4" />
                <span>{shiftToReject.location.city}, {shiftToReject.location.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Calendar className="w-4 h-4" />
                <span>{shiftToReject.date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Clock className="w-4 h-4" />
                <span>{shiftToReject.startTime} - {shiftToReject.endTime}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t.rejectReasonLabel} <span className="text-danger">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t.rejectReasonPlaceholder}
              rows={3}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>
        </div>

        <ModalFooter>
          <button
            onClick={() => {
              setRejectModalOpen(false)
              setShiftToReject(null)
              setRejectReason('')
            }}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleRejectShift}
            disabled={isProcessing || !rejectReason.trim()}
            className="px-4 py-2 rounded-xl font-semibold text-white bg-danger hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing && (
              <motion.span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            )}
            {t.confirmReject}
          </button>
        </ModalFooter>
      </Modal>
    </motion.div>
  )
}
