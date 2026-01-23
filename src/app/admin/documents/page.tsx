'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAdminUI, useAdminStore } from '@/store/admin'
import { DataTable, Column, RowAction } from '@/components/admin/data'
import { MetricCard } from '@/components/admin/charts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { DocumentViewerModal } from '@/components/admin/moderation'
import { exportToCSV, generateExportFilename } from '@/lib/export'
import type { AdminDocumentView } from '@/types/admin'
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Shield,
  Clock,
  FileText,
  User,
} from 'lucide-react'

// Mock data
const mockDocuments: AdminDocumentView[] = [
  {
    id: '1',
    type: 'passport',
    imageUrl: '/placeholder.jpg',
    userId: 'u1',
    userName: 'Иван Петров',
    userPhone: '+972501234567',
    status: 'pending',
    uploadedAt: new Date(),
  },
  {
    id: '2',
    type: 'work_permit',
    imageUrl: '/placeholder.jpg',
    userId: 'u2',
    userName: 'Мария Сидорова',
    userPhone: '+972502345678',
    status: 'pending',
    uploadedAt: new Date(Date.now() - 86400000),
  },
  {
    id: '3',
    type: 'driver_license',
    imageUrl: '/placeholder.jpg',
    userId: 'u3',
    userName: 'Алексей Козлов',
    userPhone: '+972503456789',
    status: 'verified',
    verifiedAt: new Date(),
    verifiedBy: 'admin_1',
    uploadedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: '4',
    type: 'passport',
    imageUrl: '/placeholder.jpg',
    userId: 'u4',
    userName: 'Елена Новикова',
    userPhone: '+972504567890',
    status: 'pending',
    uploadedAt: new Date(Date.now() - 3600000),
  },
  {
    id: '5',
    type: 'work_permit',
    imageUrl: '/placeholder.jpg',
    userId: 'u5',
    userName: 'Дмитрий Иванов',
    userPhone: '+972505678901',
    status: 'rejected',
    rejectionReason: 'Document expired',
    uploadedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: '6',
    type: 'passport',
    imageUrl: '/placeholder.jpg',
    userId: 'u6',
    userName: 'Анна Смирнова',
    userPhone: '+972506789012',
    status: 'verified',
    verifiedAt: new Date(Date.now() - 86400000),
    verifiedBy: 'admin_1',
    uploadedAt: new Date(Date.now() - 86400000 * 4),
  },
  {
    id: '7',
    type: 'driver_license',
    imageUrl: '/placeholder.jpg',
    userId: 'u7',
    userName: 'Сергей Кузнецов',
    userPhone: '+972507890123',
    status: 'pending',
    uploadedAt: new Date(Date.now() - 7200000),
  },
]

export default function DocumentsPage() {
  const { language } = useAdminUI()
  const { verifyDocument, rejectDocument } = useAdminStore()
  const { showToast } = useToast()
  const [documents, setDocuments] = useState<AdminDocumentView[]>(mockDocuments)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  // Modal state
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<AdminDocumentView | null>(null)

  const t = {
    title: language === 'ru' ? 'Верификация документов' : 'Document Verification',
    subtitle: language === 'ru' ? 'Проверка документов пользователей' : 'Verify user documents',
    all: language === 'ru' ? 'Все' : 'All',
    pending: language === 'ru' ? 'На проверке' : 'Pending',
    verified: language === 'ru' ? 'Проверены' : 'Verified',
    rejected: language === 'ru' ? 'Отклонены' : 'Rejected',
    totalDocs: language === 'ru' ? 'Всего документов' : 'Total Documents',
    pendingReview: language === 'ru' ? 'На проверке' : 'Pending Review',
    verifiedToday: language === 'ru' ? 'Проверено сегодня' : 'Verified Today',
    rejectedToday: language === 'ru' ? 'Отклонено сегодня' : 'Rejected Today',
    view: language === 'ru' ? 'Просмотр' : 'View',
    verify: language === 'ru' ? 'Подтвердить' : 'Verify',
    reject: language === 'ru' ? 'Отклонить' : 'Reject',
    passport: language === 'ru' ? 'Паспорт' : 'Passport',
    workPermit: language === 'ru' ? 'Разрешение на работу' : 'Work Permit',
    driverLicense: language === 'ru' ? 'Водительские права' : 'Driver License',
    other: language === 'ru' ? 'Другое' : 'Other',
    searchPlaceholder: language === 'ru' ? 'Поиск по имени пользователя...' : 'Search by user name...',
    documentVerified: language === 'ru' ? 'Документ подтвержден' : 'Document verified',
    documentRejected: language === 'ru' ? 'Документ отклонен' : 'Document rejected',
    errorVerifying: language === 'ru' ? 'Ошибка при подтверждении документа' : 'Error verifying document',
    errorRejecting: language === 'ru' ? 'Ошибка при отклонении документа' : 'Error rejecting document',
    export: language === 'ru' ? 'Экспорт' : 'Export',
    exportSuccess: language === 'ru' ? 'Экспорт завершен' : 'Export completed',
    exportError: language === 'ru' ? 'Ошибка экспорта' : 'Export failed',
  }

  // Handle verify document
  const handleVerifyDocument = async (doc: AdminDocumentView) => {
    try {
      await verifyDocument(doc.id)
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id ? { ...d, status: 'verified' as const, verifiedAt: new Date() } : d
        )
      )
      showToast(t.documentVerified, 'success')
    } catch (error) {
      showToast(t.errorVerifying, 'error')
    }
  }

  // Handle reject document
  const handleRejectDocument = async (doc: AdminDocumentView, reason: string) => {
    try {
      await rejectDocument(doc.id, reason)
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id ? { ...d, status: 'rejected' as const, rejectionReason: reason } : d
        )
      )
      showToast(t.documentRejected, 'success')
    } catch (error) {
      showToast(t.errorRejecting, 'error')
    }
  }

  // Open document viewer
  const openViewer = (doc: AdminDocumentView) => {
    setSelectedDocument(doc)
    setViewerOpen(true)
  }

  // Handle export
  const handleExport = () => {
    try {
      const dataToExport = filteredDocs.map((doc) => ({
        id: doc.id,
        userId: doc.userId,
        userName: doc.userName,
        userPhone: doc.userPhone,
        type: doc.type,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
        verifiedAt: doc.verifiedAt || '',
        rejectionReason: doc.rejectionReason || '',
      }))

      const columns = [
        { key: 'id' as const, header: 'Document ID' },
        { key: 'userId' as const, header: 'User ID' },
        { key: 'userName' as const, header: language === 'ru' ? 'Пользователь' : 'User Name' },
        { key: 'userPhone' as const, header: language === 'ru' ? 'Телефон' : 'Phone' },
        { key: 'type' as const, header: language === 'ru' ? 'Тип' : 'Type' },
        { key: 'status' as const, header: language === 'ru' ? 'Статус' : 'Status' },
        { key: 'uploadedAt' as const, header: language === 'ru' ? 'Загружен' : 'Uploaded' },
        { key: 'verifiedAt' as const, header: language === 'ru' ? 'Верифицирован' : 'Verified' },
        { key: 'rejectionReason' as const, header: language === 'ru' ? 'Причина отклонения' : 'Rejection Reason' },
      ]

      exportToCSV(dataToExport, columns, generateExportFilename('documents'))
      showToast(t.exportSuccess, 'success')
    } catch {
      showToast(t.exportError, 'error')
    }
  }

  const getDocTypeName = (type: string) => {
    const names: Record<string, string> = {
      passport: t.passport,
      work_permit: t.workPermit,
      driver_license: t.driverLicense,
      other: t.other,
    }
    return names[type] || type
  }

  const filteredDocs = documents.filter((doc) => {
    // Status filter
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false
    // Search filter
    const query = localSearchQuery.toLowerCase()
    if (query) {
      const matchesName = doc.userName.toLowerCase().includes(query)
      const matchesPhone = doc.userPhone.includes(query)
      if (!matchesName && !matchesPhone) return false
    }
    return true
  })

  const columns: Column<AdminDocumentView>[] = [
    {
      id: 'user',
      header: 'User',
      headerRu: 'Пользователь',
      cell: (doc) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-neutral-900">{doc.userName}</p>
            <p className="text-xs text-neutral-500">{doc.userPhone}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      headerRu: 'Тип',
      cell: (doc) => (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-full text-xs font-medium">
          <FileText className="w-3 h-3" />
          {getDocTypeName(doc.type)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      headerRu: 'Статус',
      cell: (doc) => {
        const statusColors: Record<string, string> = {
          pending: 'bg-warning/10 text-warning',
          verified: 'bg-success/10 text-success',
          rejected: 'bg-danger/10 text-danger',
          unverified: 'bg-neutral-100 text-neutral-600',
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[doc.status] || ''}`}>
            {doc.status}
          </span>
        )
      },
    },
    {
      id: 'uploadedAt',
      header: 'Uploaded',
      headerRu: 'Загружен',
      cell: (doc) => (
        <span className="text-sm text-neutral-500">
          {doc.uploadedAt.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
        </span>
      ),
    },
  ]

  const actions: RowAction<AdminDocumentView>[] = [
    {
      id: 'view',
      label: t.view,
      labelRu: 'Просмотр',
      icon: <Eye className="w-4 h-4" />,
      onClick: openViewer,
    },
    {
      id: 'verify',
      label: t.verify,
      labelRu: 'Подтвердить',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: handleVerifyDocument,
      show: (doc) => doc.status === 'pending',
    },
    {
      id: 'reject',
      label: t.reject,
      labelRu: 'Отклонить',
      icon: <XCircle className="w-4 h-4" />,
      variant: 'danger',
      onClick: openViewer, // Open viewer to add rejection reason
      show: (doc) => doc.status === 'pending',
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
        <Button variant="outline" size="sm" leftIcon={<FileText className="w-4 h-4" />} onClick={handleExport}>
          {t.export}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title={t.totalDocs} value={documents.length} icon={<FileText className="w-5 h-5" />} />
        <MetricCard
          title={t.pendingReview}
          value={documents.filter((d) => d.status === 'pending').length}
          icon={<Clock className="w-5 h-5" />}
          variant="warning"
        />
        <MetricCard
          title={t.verifiedToday}
          value={documents.filter((d) => d.status === 'verified').length}
          icon={<CheckCircle className="w-5 h-5" />}
          variant="success"
        />
        <MetricCard
          title={t.rejectedToday}
          value={documents.filter((d) => d.status === 'rejected').length}
          icon={<XCircle className="w-5 h-5" />}
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
            {['all', 'pending', 'verified', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-brand-primary text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {status === 'all' ? t.all : status === 'pending' ? t.pending : status === 'verified' ? t.verified : t.rejected}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <DataTable
        data={filteredDocs}
        columns={columns}
        actions={actions}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(doc) => doc.id}
        page={page}
        pageSize={20}
        total={filteredDocs.length}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={viewerOpen}
        onClose={() => {
          setViewerOpen(false)
          setSelectedDocument(null)
        }}
        document={selectedDocument}
        onVerify={handleVerifyDocument}
        onReject={handleRejectDocument}
        language={language as 'ru' | 'en' | 'he' | 'ar'}
      />
    </motion.div>
  )
}
