'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdminUI, useAdminStore } from '@/store/admin'
import { DataTable, Column, RowAction } from '@/components/admin/data'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { ModerationBadge } from '@/components/admin/moderation'
import { useModeration, type ModerationResult } from '@/hooks'
import type { AdminShiftView } from '@/types/admin'
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  AlertTriangle,
  Bot,
  Sparkles,
} from 'lucide-react'

// Mock pending shifts data
const mockPendingShifts: AdminShiftView[] = [
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
]

export default function PendingShiftsPage() {
  const router = useRouter()
  const { language } = useAdminUI()
  const { approveShift, rejectShift } = useAdminStore()
  const { showToast } = useToast()

  const [shifts, setShifts] = useState<AdminShiftView[]>(mockPendingShifts)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [shiftToReject, setShiftToReject] = useState<AdminShiftView | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  // AI Moderation state
  const { moderate, isLoading: isModerating } = useModeration()
  const [moderationResults, setModerationResults] = useState<Record<string, ModerationResult>>({})
  const [isAIProcessing, setIsAIProcessing] = useState(false)

  const t = {
    title: language === 'ru' ? 'Смены на модерации' : 'Pending Shifts',
    subtitle: language === 'ru' ? 'Смены, ожидающие проверки' : 'Shifts awaiting review',
    backToShifts: language === 'ru' ? 'Назад к сменам' : 'Back to Shifts',
    view: language === 'ru' ? 'Просмотр' : 'View',
    approve: language === 'ru' ? 'Одобрить' : 'Approve',
    reject: language === 'ru' ? 'Отклонить' : 'Reject',
    approveSelected: language === 'ru' ? 'Одобрить выбранные' : 'Approve Selected',
    rejectShift: language === 'ru' ? 'Отклонить смену' : 'Reject Shift',
    rejectReasonLabel: language === 'ru' ? 'Причина отклонения' : 'Rejection Reason',
    rejectReasonPlaceholder: language === 'ru' ? 'Укажите причину отклонения...' : 'Enter rejection reason...',
    cancel: language === 'ru' ? 'Отмена' : 'Cancel',
    confirmReject: language === 'ru' ? 'Подтвердить отклонение' : 'Confirm Rejection',
    shiftApproved: language === 'ru' ? 'Смена одобрена' : 'Shift approved successfully',
    shiftsApproved: language === 'ru' ? 'Смены одобрены' : 'Shifts approved successfully',
    shiftRejected: language === 'ru' ? 'Смена отклонена' : 'Shift rejected',
    errorApproving: language === 'ru' ? 'Ошибка при одобрении смены' : 'Error approving shift',
    errorRejecting: language === 'ru' ? 'Ошибка при отклонении смены' : 'Error rejecting shift',
    reasonRequired: language === 'ru' ? 'Укажите причину отклонения' : 'Please provide a rejection reason',
    noPendingShifts: language === 'ru' ? 'Нет смен на модерации' : 'No pending shifts',
    allClear: language === 'ru' ? 'Все смены проверены!' : 'All shifts have been reviewed!',
    searchPlaceholder: language === 'ru' ? 'Поиск смен...' : 'Search shifts...',
    aiCheck: language === 'ru' ? 'AI Проверка' : 'AI Check',
    aiCheckAll: language === 'ru' ? 'AI Проверить все' : 'AI Check All',
    aiChecking: language === 'ru' ? 'AI проверяет...' : 'AI checking...',
    aiSuggests: language === 'ru' ? 'AI рекомендует' : 'AI suggests',
  }

  // Handle approve shift
  const handleApproveShift = async (shift: AdminShiftView) => {
    setIsProcessing(true)
    try {
      await approveShift(shift.id)
      setShifts(prev => prev.filter(s => s.id !== shift.id))
      showToast(t.shiftApproved, 'success')
    } catch (error) {
      showToast(t.errorApproving, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle approve selected shifts
  const handleApproveSelected = async () => {
    if (selectedIds.length === 0) return

    setIsProcessing(true)
    try {
      for (const id of selectedIds) {
        await approveShift(id)
      }
      setShifts(prev => prev.filter(s => !selectedIds.includes(s.id)))
      setSelectedIds([])
      showToast(t.shiftsApproved, 'success')
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
      setShifts(prev => prev.filter(s => s.id !== shiftToReject.id))
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

  // Filter shifts
  const filteredShifts = shifts.filter((shift) => {
    const query = localSearchQuery.toLowerCase()
    if (query) {
      const matchesTitle = shift.title.toLowerCase().includes(query)
      const matchesCompany = shift.employerCompany.toLowerCase().includes(query)
      const matchesCity = shift.location.city.toLowerCase().includes(query)
      if (!matchesTitle && !matchesCompany && !matchesCity) return false
    }
    return true
  })

  // AI Moderation functions
  const handleAICheck = useCallback(async (shift: AdminShiftView) => {
    const content = `${shift.title}\n${shift.description}\n${shift.employerCompany}`
    const result = await moderate(content, 'shift', { rate: shift.baseRate })
    if (result) {
      setModerationResults(prev => ({ ...prev, [shift.id]: result }))
    }
  }, [moderate])

  const handleAICheckAll = useCallback(async () => {
    setIsAIProcessing(true)
    for (const shift of filteredShifts) {
      if (!moderationResults[shift.id]) {
        await handleAICheck(shift)
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    setIsAIProcessing(false)
  }, [filteredShifts, moderationResults, handleAICheck])

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
      id: 'applicants',
      header: 'Applicants',
      headerRu: 'Заявки',
      cell: (shift) => (
        <span className="text-sm font-medium text-brand-primary">
          {shift.applicants}
        </span>
      ),
    },
    {
      id: 'aiStatus',
      header: 'AI Check',
      headerRu: 'AI Проверка',
      cell: (shift) => {
        const result = moderationResults[shift.id]
        if (result) {
          return <ModerationBadge result={result} size="sm" language={language === 'ru' ? 'ru' : 'en'} />
        }
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAICheck(shift)
            }}
            disabled={isModerating}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-primary bg-brand-primary/10 rounded-full hover:bg-brand-primary/20 transition-colors disabled:opacity-50"
          >
            <Bot className="w-3 h-3" />
            {t.aiCheck}
          </button>
        )
      },
    },
    {
      id: 'createdAt',
      header: 'Submitted',
      headerRu: 'Отправлено',
      sortable: true,
      cell: (shift) => (
        <span className="text-sm text-neutral-500">
          {shift.createdAt.toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
  ]

  const actions: RowAction<AdminShiftView>[] = [
    {
      id: 'aiCheck',
      label: t.aiCheck,
      labelRu: 'AI Проверка',
      icon: <Bot className="w-4 h-4" />,
      onClick: handleAICheck,
    },
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
    },
    {
      id: 'reject',
      label: t.reject,
      labelRu: 'Отклонить',
      icon: <XCircle className="w-4 h-4" />,
      variant: 'danger',
      onClick: openRejectModal,
    },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/shifts">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t.backToShifts}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
              {t.title}
            </h1>
            <p className="text-neutral-500">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={handleAICheckAll}
            isLoading={isAIProcessing}
            disabled={filteredShifts.length === 0}
          >
            {isAIProcessing ? t.aiChecking : t.aiCheckAll}
          </Button>
          {selectedIds.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle className="w-4 h-4" />}
              onClick={handleApproveSelected}
              isLoading={isProcessing}
            >
              {t.approveSelected} ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </Card>

      {/* Empty State */}
      {filteredShifts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">{t.noPendingShifts}</h3>
          <p className="text-neutral-500 mb-4">{t.allClear}</p>
          <Link href="/admin/shifts">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t.backToShifts}
            </Button>
          </Link>
        </Card>
      ) : (
        /* Table */
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
          isLoading={isProcessing}
        />
      )}

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
