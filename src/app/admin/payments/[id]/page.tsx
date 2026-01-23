'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAdminUI, useAdminStore } from '@/store/admin'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import type { AdminPaymentView } from '@/types/admin'
import type { PaymentStatus } from '@/types'
import {
  ArrowLeft,
  DollarSign,
  User,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  FileText,
} from 'lucide-react'

// Mock payment data
const mockPayment: AdminPaymentView = {
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
}

export default function PaymentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useAdminUI()
  const { releaseEscrow, refundPayment } = useAdminStore()
  const { showToast } = useToast()

  const [payment, setPayment] = useState<AdminPaymentView | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // Refund modal state
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  const t = {
    back: language === 'ru' ? 'Назад к платежам' : 'Back to Payments',
    paymentDetails: language === 'ru' ? 'Детали платежа' : 'Payment Details',
    shiftInfo: language === 'ru' ? 'Информация о смене' : 'Shift Information',
    workerInfo: language === 'ru' ? 'Информация о работнике' : 'Worker Information',
    employerInfo: language === 'ru' ? 'Информация о работодателе' : 'Employer Information',
    paymentInfo: language === 'ru' ? 'Платежная информация' : 'Payment Information',
    timeline: language === 'ru' ? 'История' : 'Timeline',
    amount: language === 'ru' ? 'Сумма' : 'Amount',
    platformFee: language === 'ru' ? 'Комиссия платформы' : 'Platform Fee',
    workerPayout: language === 'ru' ? 'Выплата работнику' : 'Worker Payout',
    status: language === 'ru' ? 'Статус' : 'Status',
    releaseEscrow: language === 'ru' ? 'Выплатить работнику' : 'Release to Worker',
    refund: language === 'ru' ? 'Вернуть средства' : 'Refund',
    viewShift: language === 'ru' ? 'Открыть смену' : 'View Shift',
    viewWorker: language === 'ru' ? 'Открыть профиль' : 'View Profile',
    viewEmployer: language === 'ru' ? 'Открыть профиль' : 'View Profile',
    pending: language === 'ru' ? 'Ожидание' : 'Pending',
    processing: language === 'ru' ? 'В обработке' : 'Processing',
    escrowed: language === 'ru' ? 'На эскроу' : 'Escrowed',
    released: language === 'ru' ? 'Выплачено' : 'Released',
    disputed: language === 'ru' ? 'Оспорено' : 'Disputed',
    failed: language === 'ru' ? 'Ошибка' : 'Failed',
    created: language === 'ru' ? 'Создан' : 'Created',
    escrowedAt: language === 'ru' ? 'Зачислено на эскроу' : 'Escrowed',
    releasedAt: language === 'ru' ? 'Выплачено' : 'Released',
    refundedAt: language === 'ru' ? 'Возвращено' : 'Refunded',
    refundPayment: language === 'ru' ? 'Возврат платежа' : 'Refund Payment',
    refundAmountLabel: language === 'ru' ? 'Сумма возврата' : 'Refund Amount',
    refundReasonLabel: language === 'ru' ? 'Причина возврата' : 'Refund Reason',
    refundReasonPlaceholder: language === 'ru' ? 'Укажите причину возврата...' : 'Enter refund reason...',
    cancel: language === 'ru' ? 'Отмена' : 'Cancel',
    confirmRefund: language === 'ru' ? 'Подтвердить возврат' : 'Confirm Refund',
    escrowReleasedSuccess: language === 'ru' ? 'Средства выплачены работнику' : 'Funds released to worker',
    refundSuccess: language === 'ru' ? 'Возврат выполнен' : 'Refund processed',
    errorReleasing: language === 'ru' ? 'Ошибка при выплате' : 'Error releasing escrow',
    errorRefunding: language === 'ru' ? 'Ошибка при возврате' : 'Error processing refund',
    notFound: language === 'ru' ? 'Платеж не найден' : 'Payment not found',
  }

  useEffect(() => {
    // Simulate loading payment data
    setIsLoading(true)
    setTimeout(() => {
      // In real app, fetch payment by params.id
      setPayment({ ...mockPayment, id: params.id as string })
      setIsLoading(false)
    }, 500)
  }, [params.id])

  const handleReleaseEscrow = async () => {
    if (!payment) return

    setIsProcessing(true)
    try {
      await releaseEscrow(payment.id)
      setPayment(prev => prev ? { ...prev, status: 'released' as PaymentStatus, releasedAt: new Date() } : null)
      showToast(t.escrowReleasedSuccess, 'success')
    } catch (error) {
      showToast(t.errorReleasing, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRefund = async () => {
    if (!payment || !refundReason.trim()) return

    const amount = parseFloat(refundAmount)
    if (isNaN(amount) || amount <= 0 || amount > payment.amount) {
      showToast(language === 'ru' ? 'Неверная сумма возврата' : 'Invalid refund amount', 'error')
      return
    }

    setIsProcessing(true)
    try {
      await refundPayment(payment.id, amount, refundReason)
      setPayment(prev => prev ? {
        ...prev,
        status: 'failed' as PaymentStatus,
        refundReason,
        refundedAt: new Date()
      } : null)
      showToast(t.refundSuccess, 'success')
      setRefundModalOpen(false)
    } catch (error) {
      showToast(t.errorRefunding, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-neutral-100 text-neutral-600',
      processing: 'bg-blue-100 text-blue-600',
      escrowed: 'bg-warning/10 text-warning',
      released: 'bg-success/10 text-success',
      disputed: 'bg-danger/10 text-danger',
      failed: 'bg-danger/10 text-danger',
    }
    return colors[status] || ''
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: t.pending,
      processing: t.processing,
      escrowed: t.escrowed,
      released: t.released,
      disputed: t.disputed,
      failed: t.failed,
    }
    return labels[status] || status
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded-lg w-48 animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4 animate-pulse" />
              <div className="space-y-3">
                <div className="h-3 bg-neutral-200 rounded animate-pulse" />
                <div className="h-3 bg-neutral-200 rounded w-3/4 animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-neutral-900">{t.notFound}</h2>
        <Link href="/admin/payments">
          <Button variant="outline" className="mt-4" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            {t.back}
          </Button>
        </Link>
      </div>
    )
  }

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
            <h1 className="text-2xl font-bold text-neutral-900">{t.paymentDetails}</h1>
            <p className="text-neutral-500">ID: {payment.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-xl text-sm font-medium ${getStatusColor(payment.status)}`}>
            {getStatusLabel(payment.status)}
          </span>
          {payment.status === 'escrowed' && (
            <>
              <Button
                variant="primary"
                leftIcon={<ArrowUpRight className="w-4 h-4" />}
                onClick={handleReleaseEscrow}
                isLoading={isProcessing}
              >
                {t.releaseEscrow}
              </Button>
              <Button
                variant="outline"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={() => {
                  setRefundAmount(payment.amount.toString())
                  setRefundReason('')
                  setRefundModalOpen(true)
                }}
                className="text-danger border-danger hover:bg-danger/5"
              >
                {t.refund}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Payment Info */}
        <Card className="p-6 col-span-2">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {t.paymentInfo}
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-neutral-50 rounded-xl p-4 text-center">
              <p className="text-sm text-neutral-500 mb-1">{t.amount}</p>
              <p className="text-2xl font-bold text-neutral-900">₪{payment.amount.toLocaleString()}</p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-4 text-center">
              <p className="text-sm text-neutral-500 mb-1">{t.platformFee}</p>
              <p className="text-2xl font-bold text-brand-primary">₪{payment.platformFee}</p>
              <p className="text-xs text-neutral-400">(10%)</p>
            </div>
            <div className="bg-success/5 rounded-xl p-4 text-center">
              <p className="text-sm text-neutral-500 mb-1">{t.workerPayout}</p>
              <p className="text-2xl font-bold text-success">₪{payment.workerPayout.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-6">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t.timeline}
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-neutral-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">{t.created}</p>
                <p className="text-xs text-neutral-500">
                  {payment.createdAt.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}
                </p>
              </div>
            </div>
            {payment.escrowedAt && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{t.escrowedAt}</p>
                  <p className="text-xs text-neutral-500">
                    {payment.escrowedAt.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}
                  </p>
                </div>
              </div>
            )}
            {payment.releasedAt && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{t.releasedAt}</p>
                  <p className="text-xs text-neutral-500">
                    {payment.releasedAt.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}
                  </p>
                </div>
              </div>
            )}
            {payment.refundedAt && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-4 h-4 text-danger" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{t.refundedAt}</p>
                  <p className="text-xs text-neutral-500">
                    {payment.refundedAt.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}
                  </p>
                  {payment.refundReason && (
                    <p className="text-xs text-danger mt-1">{payment.refundReason}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Related entities */}
      <div className="grid grid-cols-3 gap-6">
        {/* Shift */}
        <Card className="p-6">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t.shiftInfo}
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-500">{language === 'ru' ? 'Название' : 'Title'}</p>
              <p className="font-medium text-neutral-900">{payment.shiftTitle}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">ID</p>
              <p className="text-sm text-neutral-600">{payment.shiftId}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ExternalLink className="w-4 h-4" />}
              className="w-full mt-2"
              onClick={() => router.push(`/admin/shifts/${payment.shiftId}`)}
            >
              {t.viewShift}
            </Button>
          </div>
        </Card>

        {/* Worker */}
        <Card className="p-6">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            {t.workerInfo}
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-500">{language === 'ru' ? 'Имя' : 'Name'}</p>
              <p className="font-medium text-neutral-900">{payment.workerName}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">{language === 'ru' ? 'Телефон' : 'Phone'}</p>
              <p className="text-sm text-neutral-600">{payment.workerPhone}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ExternalLink className="w-4 h-4" />}
              className="w-full mt-2"
              onClick={() => router.push(`/admin/users/${payment.workerId}`)}
            >
              {t.viewWorker}
            </Button>
          </div>
        </Card>

        {/* Employer */}
        <Card className="p-6">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5" />
            {t.employerInfo}
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-500">{language === 'ru' ? 'Имя' : 'Name'}</p>
              <p className="font-medium text-neutral-900">{payment.employerName}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">{language === 'ru' ? 'Компания' : 'Company'}</p>
              <p className="text-sm text-neutral-600">{payment.employerCompany}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ExternalLink className="w-4 h-4" />}
              className="w-full mt-2"
              onClick={() => router.push(`/admin/users/${payment.employerId}`)}
            >
              {t.viewEmployer}
            </Button>
          </div>
        </Card>
      </div>

      {/* Refund Modal */}
      <Modal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title={t.refundPayment}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">{t.amount}</span>
              <span className="font-semibold text-neutral-900">₪{payment.amount.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t.refundAmountLabel} <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">₪</span>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={payment.amount}
                min={0}
                className="w-full pl-8 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t.refundReasonLabel} <span className="text-danger">*</span>
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder={t.refundReasonPlaceholder}
              rows={3}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>
        </div>

        <ModalFooter>
          <button
            onClick={() => setRefundModalOpen(false)}
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
