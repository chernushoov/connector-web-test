'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { AdminDocumentView } from '@/types/admin'
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Calendar,
  FileText,
  ExternalLink,
} from 'lucide-react'

interface DocumentViewerModalProps {
  isOpen: boolean
  onClose: () => void
  document: AdminDocumentView | null
  onVerify: (doc: AdminDocumentView) => Promise<void>
  onReject: (doc: AdminDocumentView, reason: string) => Promise<void>
  language: 'ru' | 'en' | 'he' | 'ar'
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  document,
  onVerify,
  onReject,
  language,
}: DocumentViewerModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const t = {
    documentViewer: language === 'ru' ? 'Просмотр документа' : 'Document Viewer',
    userInfo: language === 'ru' ? 'Информация о пользователе' : 'User Information',
    documentInfo: language === 'ru' ? 'Информация о документе' : 'Document Information',
    userName: language === 'ru' ? 'Имя' : 'Name',
    phone: language === 'ru' ? 'Телефон' : 'Phone',
    registeredAt: language === 'ru' ? 'Дата регистрации' : 'Registration Date',
    documentType: language === 'ru' ? 'Тип документа' : 'Document Type',
    uploadedAt: language === 'ru' ? 'Дата загрузки' : 'Upload Date',
    status: language === 'ru' ? 'Статус' : 'Status',
    verify: language === 'ru' ? 'Подтвердить документ' : 'Verify Document',
    reject: language === 'ru' ? 'Отклонить' : 'Reject',
    cancel: language === 'ru' ? 'Отмена' : 'Cancel',
    close: language === 'ru' ? 'Закрыть' : 'Close',
    rejectDocument: language === 'ru' ? 'Отклонить документ' : 'Reject Document',
    rejectReasonLabel: language === 'ru' ? 'Причина отклонения' : 'Rejection Reason',
    rejectReasonPlaceholder: language === 'ru' ? 'Укажите причину отклонения...' : 'Enter rejection reason...',
    confirmReject: language === 'ru' ? 'Подтвердить отклонение' : 'Confirm Rejection',
    back: language === 'ru' ? 'Назад' : 'Back',
    viewUser: language === 'ru' ? 'Просмотреть профиль' : 'View Profile',
    passport: language === 'ru' ? 'Паспорт' : 'Passport',
    workPermit: language === 'ru' ? 'Разрешение на работу' : 'Work Permit',
    driverLicense: language === 'ru' ? 'Водительские права' : 'Driver License',
    other: language === 'ru' ? 'Другое' : 'Other',
    pending: language === 'ru' ? 'На проверке' : 'Pending',
    verified: language === 'ru' ? 'Подтвержден' : 'Verified',
    rejected: language === 'ru' ? 'Отклонен' : 'Rejected',
    unverified: language === 'ru' ? 'Не проверен' : 'Unverified',
    zoomIn: language === 'ru' ? 'Увеличить' : 'Zoom In',
    zoomOut: language === 'ru' ? 'Уменьшить' : 'Zoom Out',
    rotate: language === 'ru' ? 'Повернуть' : 'Rotate',
    download: language === 'ru' ? 'Скачать' : 'Download',
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

  const getStatusName = (status: string) => {
    const names: Record<string, string> = {
      pending: t.pending,
      verified: t.verified,
      rejected: t.rejected,
      unverified: t.unverified,
    }
    return names[status] || status
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    verified: 'bg-success/10 text-success',
    rejected: 'bg-danger/10 text-danger',
    unverified: 'bg-neutral-100 text-neutral-600',
  }

  const handleVerify = async () => {
    if (!document) return
    setIsProcessing(true)
    try {
      await onVerify(document)
      onClose()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!document || !rejectReason.trim()) return
    setIsProcessing(true)
    try {
      await onReject(document, rejectReason)
      setIsRejecting(false)
      setRejectReason('')
      onClose()
    } finally {
      setIsProcessing(false)
    }
  }

  const resetView = () => {
    setZoom(1)
    setRotation(0)
    setIsRejecting(false)
    setRejectReason('')
  }

  const handleClose = () => {
    resetView()
    onClose()
  }

  if (!document) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t.documentViewer}
      size="2xl"
    >
      <div className="grid grid-cols-2 gap-6">
        {/* Left side - Document Image */}
        <div className="space-y-4">
          {/* Image controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
                title={t.zoomIn}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
                title={t.zoomOut}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotation(r => (r + 90) % 360)}
                className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
                title={t.rotate}
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-neutral-500">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Image viewer */}
          <div className="relative bg-neutral-100 rounded-xl overflow-hidden h-[400px] flex items-center justify-center">
            <motion.div
              className="relative"
              animate={{
                scale: zoom,
                rotate: rotation,
              }}
              transition={{ type: 'spring', damping: 20 }}
            >
              {/* Placeholder for document image */}
              <div className="w-[280px] h-[360px] bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-dashed border-neutral-300">
                <div className="text-center p-6">
                  <FileText className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-500 text-sm">
                    {document.imageUrl === '/placeholder.jpg'
                      ? (language === 'ru' ? 'Изображение документа' : 'Document Image')
                      : document.imageUrl
                    }
                  </p>
                  <p className="text-neutral-400 text-xs mt-2">
                    {getDocTypeName(document.type)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Download button */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            className="w-full"
          >
            {t.download}
          </Button>
        </div>

        {/* Right side - Info & Actions */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!isRejecting ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* User Info */}
                <div className="bg-neutral-50 rounded-xl p-4">
                  <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t.userInfo}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500">{t.userName}</span>
                      <span className="text-sm font-medium text-neutral-900">{document.userName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500">{t.phone}</span>
                      <span className="text-sm font-medium text-neutral-900">{document.userPhone}</span>
                    </div>
                    <button
                      onClick={() => window.open(`/admin/users/${document.userId}`, '_blank')}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t.viewUser}
                    </button>
                  </div>
                </div>

                {/* Document Info */}
                <div className="bg-neutral-50 rounded-xl p-4">
                  <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {t.documentInfo}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500">{t.documentType}</span>
                      <span className="text-sm font-medium text-neutral-900">{getDocTypeName(document.type)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500">{t.uploadedAt}</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {document.uploadedAt.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500">{t.status}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[document.status] || ''}`}>
                        {getStatusName(document.status)}
                      </span>
                    </div>
                    {document.rejectionReason && (
                      <div className="pt-2 border-t border-neutral-200">
                        <p className="text-sm text-danger">{document.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                {document.status === 'pending' && (
                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      size="lg"
                      leftIcon={<CheckCircle className="w-5 h-5" />}
                      className="w-full"
                      onClick={handleVerify}
                      isLoading={isProcessing}
                    >
                      {t.verify}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      leftIcon={<XCircle className="w-5 h-5" />}
                      className="w-full text-danger border-danger hover:bg-danger/5"
                      onClick={() => setIsRejecting(true)}
                    >
                      {t.reject}
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="reject"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
                  <h3 className="font-semibold text-danger mb-2 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    {t.rejectDocument}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {document.userName} - {getDocTypeName(document.type)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {t.rejectReasonLabel} <span className="text-danger">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t.rejectReasonPlaceholder}
                    rows={4}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-danger/20 focus:border-danger resize-none"
                  />
                </div>

                {/* Quick rejection reasons */}
                <div className="flex flex-wrap gap-2">
                  {[
                    language === 'ru' ? 'Нечитаемый документ' : 'Unreadable document',
                    language === 'ru' ? 'Истёк срок действия' : 'Document expired',
                    language === 'ru' ? 'Неверный тип документа' : 'Wrong document type',
                    language === 'ru' ? 'Данные не совпадают' : 'Data mismatch',
                  ].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setRejectReason(reason)}
                      className="px-3 py-1.5 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <Button
                    variant="danger"
                    size="lg"
                    leftIcon={<XCircle className="w-5 h-5" />}
                    className="w-full"
                    onClick={handleReject}
                    isLoading={isProcessing}
                    disabled={!rejectReason.trim()}
                  >
                    {t.confirmReject}
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setIsRejecting(false)
                      setRejectReason('')
                    }}
                  >
                    {t.back}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>
          {t.close}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
