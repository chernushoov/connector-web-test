'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAdminUI, useAdminStore } from '@/store/admin'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { Dispute, DisputeMessage, DisputeStatus, DisputeType } from '@/types/admin'
import {
  ArrowLeft,
  Send,
  User,
  Building,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  ExternalLink,
  Flag,
  Shield,
} from 'lucide-react'

// Mock dispute data
const mockDispute: Dispute = {
  id: 'disp_1',
  type: 'payment',
  status: 'open',
  shiftId: 'shift_1',
  shiftTitle: 'Warehouse Helper',
  taskFlowId: 'tf_1',
  initiatorId: 'w1',
  initiatorName: 'Иван Петров',
  initiatorRole: 'worker',
  respondentId: 'e1',
  respondentName: 'ABC Logistics',
  description: 'Worker claims payment was not received after shift completion. Employer confirms work was completed satisfactorily but payment is delayed due to banking issues.',
  evidence: ['/evidence/1.jpg', '/evidence/2.jpg'],
  messages: [
    {
      id: 'm1',
      authorId: 'w1',
      authorName: 'Иван Петров',
      authorRole: 'worker',
      content: 'I completed the shift on time but haven\'t received my payment yet. It\'s been 3 days since the shift ended.',
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      id: 'm2',
      authorId: 'e1',
      authorName: 'ABC Logistics',
      authorRole: 'employer',
      content: 'We apologize for the delay. We processed the payment on our end but there seems to be an issue with the bank transfer. Please check with your bank or wait another 24 hours.',
      createdAt: new Date(Date.now() - 86400000 * 1.5),
    },
    {
      id: 'm3',
      authorId: 'w1',
      authorName: 'Иван Петров',
      authorRole: 'worker',
      content: 'I checked with my bank and they confirmed no incoming transfer. Can you please provide the transaction reference number?',
      createdAt: new Date(Date.now() - 86400000),
    },
  ],
  createdAt: new Date(Date.now() - 86400000 * 3),
  updatedAt: new Date(Date.now() - 86400000),
  priority: 'high',
}

type ResolutionOutcome = 'initiator_favor' | 'respondent_favor' | 'split' | 'dismissed'

export default function DisputeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useAdminUI()
  const { resolveDispute } = useAdminStore()
  const { showToast } = useToast()

  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  // Resolution state
  const [showResolutionPanel, setShowResolutionPanel] = useState(false)
  const [resolutionOutcome, setResolutionOutcome] = useState<ResolutionOutcome>('split')
  const [resolutionDescription, setResolutionDescription] = useState('')
  const [refundAmount, setRefundAmount] = useState('')

  const t = {
    back: language === 'ru' ? 'Назад к спорам' : 'Back to Disputes',
    disputeDetails: language === 'ru' ? 'Детали спора' : 'Dispute Details',
    initiator: language === 'ru' ? 'Инициатор' : 'Initiator',
    respondent: language === 'ru' ? 'Ответчик' : 'Respondent',
    shiftInfo: language === 'ru' ? 'Информация о смене' : 'Shift Information',
    description: language === 'ru' ? 'Описание' : 'Description',
    evidence: language === 'ru' ? 'Доказательства' : 'Evidence',
    messages: language === 'ru' ? 'Переписка' : 'Messages',
    resolution: language === 'ru' ? 'Решение' : 'Resolution',
    resolveDispute: language === 'ru' ? 'Решить спор' : 'Resolve Dispute',
    sendMessage: language === 'ru' ? 'Отправить' : 'Send',
    messagePlaceholder: language === 'ru' ? 'Введите сообщение...' : 'Type a message...',
    status: language === 'ru' ? 'Статус' : 'Status',
    priority: language === 'ru' ? 'Приоритет' : 'Priority',
    created: language === 'ru' ? 'Создан' : 'Created',
    updated: language === 'ru' ? 'Обновлен' : 'Updated',
    type: language === 'ru' ? 'Тип' : 'Type',
    worker: language === 'ru' ? 'Работник' : 'Worker',
    employer: language === 'ru' ? 'Работодатель' : 'Employer',
    admin: language === 'ru' ? 'Администратор' : 'Admin',
    open: language === 'ru' ? 'Открыт' : 'Open',
    investigating: language === 'ru' ? 'На рассмотрении' : 'Investigating',
    resolved: language === 'ru' ? 'Решен' : 'Resolved',
    escalated: language === 'ru' ? 'Эскалирован' : 'Escalated',
    payment: language === 'ru' ? 'Оплата' : 'Payment',
    quality: language === 'ru' ? 'Качество' : 'Quality',
    no_show: language === 'ru' ? 'Неявка' : 'No-show',
    harassment: language === 'ru' ? 'Домогательство' : 'Harassment',
    other: language === 'ru' ? 'Другое' : 'Other',
    low: language === 'ru' ? 'Низкий' : 'Low',
    medium: language === 'ru' ? 'Средний' : 'Medium',
    high: language === 'ru' ? 'Высокий' : 'High',
    urgent: language === 'ru' ? 'Срочный' : 'Urgent',
    notFound: language === 'ru' ? 'Спор не найден' : 'Dispute not found',
    viewShift: language === 'ru' ? 'Открыть смену' : 'View Shift',
    viewUser: language === 'ru' ? 'Открыть профиль' : 'View Profile',
    resolutionPanel: language === 'ru' ? 'Панель решения' : 'Resolution Panel',
    outcome: language === 'ru' ? 'Результат' : 'Outcome',
    initiator_favor: language === 'ru' ? 'В пользу инициатора' : 'Initiator Favor',
    respondent_favor: language === 'ru' ? 'В пользу ответчика' : 'Respondent Favor',
    split: language === 'ru' ? 'Компромисс' : 'Split',
    dismissed: language === 'ru' ? 'Отклонено' : 'Dismissed',
    resolutionDesc: language === 'ru' ? 'Описание решения' : 'Resolution Description',
    resolutionDescPlaceholder: language === 'ru' ? 'Опишите решение и обоснование...' : 'Describe the resolution and reasoning...',
    refundAmount: language === 'ru' ? 'Сумма возврата' : 'Refund Amount',
    cancel: language === 'ru' ? 'Отмена' : 'Cancel',
    confirmResolution: language === 'ru' ? 'Подтвердить решение' : 'Confirm Resolution',
    changeStatus: language === 'ru' ? 'Изменить статус' : 'Change Status',
    markInvestigating: language === 'ru' ? 'Взять в работу' : 'Start Investigation',
    escalate: language === 'ru' ? 'Эскалировать' : 'Escalate',
    messageSent: language === 'ru' ? 'Сообщение отправлено' : 'Message sent',
    disputeResolved: language === 'ru' ? 'Спор решен' : 'Dispute resolved',
    statusChanged: language === 'ru' ? 'Статус изменен' : 'Status changed',
    error: language === 'ru' ? 'Произошла ошибка' : 'An error occurred',
  }

  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setDispute({ ...mockDispute, id: params.id as string })
      setIsLoading(false)
    }, 500)
  }, [params.id])

  const handleSendMessage = async () => {
    if (!dispute || !newMessage.trim()) return

    const message: DisputeMessage = {
      id: `m_${Date.now()}`,
      authorId: 'admin_1',
      authorName: 'Admin',
      authorRole: 'admin',
      content: newMessage,
      createdAt: new Date(),
    }

    setDispute(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
      updatedAt: new Date(),
    } : null)
    setNewMessage('')
    showToast(t.messageSent, 'success')
  }

  const handleChangeStatus = (newStatus: DisputeStatus) => {
    if (!dispute) return

    setDispute(prev => prev ? {
      ...prev,
      status: newStatus,
      updatedAt: new Date(),
      assignedTo: newStatus === 'investigating' ? 'admin_1' : prev.assignedTo,
    } : null)
    showToast(t.statusChanged, 'success')
  }

  const handleResolve = async () => {
    if (!dispute || !resolutionDescription.trim()) return

    setIsProcessing(true)
    try {
      const resolution = {
        outcome: resolutionOutcome,
        description: resolutionDescription,
        refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
        resolvedBy: 'admin_1',
        resolvedAt: new Date(),
      }

      await resolveDispute(dispute.id, resolution)
      setDispute(prev => prev ? {
        ...prev,
        status: 'resolved' as DisputeStatus,
        resolution,
        updatedAt: new Date(),
      } : null)
      setShowResolutionPanel(false)
      showToast(t.disputeResolved, 'success')
    } catch (error) {
      showToast(t.error, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const getTypeLabel = (type: DisputeType) => {
    const labels: Record<DisputeType, string> = {
      payment: t.payment,
      quality: t.quality,
      no_show: t.no_show,
      harassment: t.harassment,
      other: t.other,
    }
    return labels[type] || type
  }

  const getStatusLabel = (status: DisputeStatus) => {
    const labels: Record<DisputeStatus, string> = {
      open: t.open,
      investigating: t.investigating,
      resolved: t.resolved,
      escalated: t.escalated,
    }
    return labels[status] || status
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: t.low,
      medium: t.medium,
      high: t.high,
      urgent: t.urgent,
    }
    return labels[priority] || priority
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      worker: t.worker,
      employer: t.employer,
      admin: t.admin,
    }
    return labels[role] || role
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

  if (!dispute) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-neutral-900">{t.notFound}</h2>
        <Link href="/admin/applications/disputes">
          <Button variant="outline" className="mt-4" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            {t.back}
          </Button>
        </Link>
      </div>
    )
  }

  const statusColors: Record<DisputeStatus, string> = {
    open: 'bg-warning/10 text-warning',
    investigating: 'bg-blue-100 text-blue-600',
    resolved: 'bg-success/10 text-success',
    escalated: 'bg-danger/10 text-danger',
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-neutral-100 text-neutral-600',
    medium: 'bg-warning/10 text-warning',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-danger/10 text-danger',
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/applications/disputes">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t.back}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <Flag className="w-6 h-6 text-warning" />
              {t.disputeDetails}
            </h1>
            <p className="text-neutral-500">ID: {dispute.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-xl text-sm font-medium ${statusColors[dispute.status]}`}>
            {getStatusLabel(dispute.status)}
          </span>
          <span className={`px-3 py-1.5 rounded-xl text-sm font-medium ${priorityColors[dispute.priority]}`}>
            {dispute.priority === 'urgent' && <AlertTriangle className="w-4 h-4 inline mr-1" />}
            {getPriorityLabel(dispute.priority)}
          </span>
          {dispute.status !== 'resolved' && (
            <>
              {dispute.status === 'open' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangeStatus('investigating')}
                >
                  {t.markInvestigating}
                </Button>
              )}
              {dispute.status !== 'escalated' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-danger border-danger hover:bg-danger/5"
                  onClick={() => handleChangeStatus('escalated')}
                >
                  {t.escalate}
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle className="w-4 h-4" />}
                onClick={() => setShowResolutionPanel(true)}
              >
                {t.resolveDispute}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left column - Info */}
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <Card className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t.description}
            </h3>
            <p className="text-neutral-600 leading-relaxed">{dispute.description}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {t.created}: {dispute.createdAt.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {t.updated}: {dispute.updatedAt.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
              </span>
            </div>
          </Card>

          {/* Messages */}
          <Card className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {t.messages} ({dispute.messages.length})
            </h3>

            <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
              {dispute.messages.map((message) => {
                const isAdmin = message.authorRole === 'admin'
                const isInitiator = message.authorId === dispute.initiatorId

                return (
                  <div
                    key={message.id}
                    className={`p-4 rounded-xl ${
                      isAdmin
                        ? 'bg-brand-primary/5 border border-brand-primary/20'
                        : isInitiator
                        ? 'bg-blue-50 border border-blue-100'
                        : 'bg-neutral-50 border border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isAdmin
                            ? 'bg-brand-primary/10 text-brand-primary'
                            : isInitiator
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{message.authorName}</p>
                          <p className="text-xs text-neutral-500">{getRoleLabel(message.authorRole)}</p>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-400">
                        {message.createdAt.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}
                      </span>
                    </div>
                    <p className="text-neutral-600 text-sm">{message.content}</p>
                  </div>
                )
              })}
            </div>

            {/* New message input */}
            {dispute.status !== 'resolved' && (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t.messagePlaceholder}
                  className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  variant="primary"
                  leftIcon={<Send className="w-4 h-4" />}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  {t.sendMessage}
                </Button>
              </div>
            )}
          </Card>

          {/* Resolution (if resolved) */}
          {dispute.resolution && (
            <Card className="p-6 border-success/30 bg-success/5">
              <h3 className="font-semibold text-success mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {t.resolution}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">{t.outcome}</span>
                  <span className="text-sm font-medium text-neutral-900">
                    {t[dispute.resolution.outcome as keyof typeof t] || dispute.resolution.outcome}
                  </span>
                </div>
                {dispute.resolution.refundAmount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">{t.refundAmount}</span>
                    <span className="text-sm font-medium text-success">₪{dispute.resolution.refundAmount}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-success/20">
                  <p className="text-sm text-neutral-600">{dispute.resolution.description}</p>
                </div>
                <div className="text-xs text-neutral-400">
                  {language === 'ru' ? 'Решено' : 'Resolved'}: {dispute.resolution.resolvedAt.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right column - Parties & Info */}
        <div className="space-y-6">
          {/* Initiator */}
          <Card className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              {t.initiator}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-neutral-900">{dispute.initiatorName}</p>
                <p className="text-sm text-neutral-500">{getRoleLabel(dispute.initiatorRole)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ExternalLink className="w-4 h-4" />}
                className="w-full"
                onClick={() => router.push(`/admin/users/${dispute.initiatorId}`)}
              >
                {t.viewUser}
              </Button>
            </div>
          </Card>

          {/* Respondent */}
          <Card className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-orange-500" />
              {t.respondent}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-neutral-900">{dispute.respondentName}</p>
                <p className="text-sm text-neutral-500">
                  {dispute.initiatorRole === 'worker' ? t.employer : t.worker}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ExternalLink className="w-4 h-4" />}
                className="w-full"
                onClick={() => router.push(`/admin/users/${dispute.respondentId}`)}
              >
                {t.viewUser}
              </Button>
            </div>
          </Card>

          {/* Shift */}
          <Card className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t.shiftInfo}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-neutral-900">{dispute.shiftTitle}</p>
                <p className="text-sm text-neutral-500">ID: {dispute.shiftId}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ExternalLink className="w-4 h-4" />}
                className="w-full"
                onClick={() => router.push(`/admin/shifts/${dispute.shiftId}`)}
              >
                {t.viewShift}
              </Button>
            </div>
          </Card>

          {/* Dispute Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">
              {language === 'ru' ? 'Информация' : 'Information'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">{t.type}</span>
                <span className="text-sm font-medium text-neutral-900">{getTypeLabel(dispute.type)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">{t.status}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[dispute.status]}`}>
                  {getStatusLabel(dispute.status)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">{t.priority}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[dispute.priority]}`}>
                  {getPriorityLabel(dispute.priority)}
                </span>
              </div>
              {dispute.assignedTo && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">{language === 'ru' ? 'Назначен' : 'Assigned'}</span>
                  <span className="text-sm text-neutral-600">{dispute.assignedTo}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Resolution Panel Modal */}
      {showResolutionPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">{t.resolutionPanel}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">{t.outcome}</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['initiator_favor', 'respondent_favor', 'split', 'dismissed'] as ResolutionOutcome[]).map((outcome) => (
                    <button
                      key={outcome}
                      onClick={() => setResolutionOutcome(outcome)}
                      className={`p-3 rounded-xl text-sm font-medium border transition-colors ${
                        resolutionOutcome === outcome
                          ? 'bg-brand-primary text-white border-brand-primary'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-primary'
                      }`}
                    >
                      {t[outcome as keyof typeof t] || outcome}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">{t.refundAmount}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">₪</span>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t.resolutionDesc} <span className="text-danger">*</span>
                </label>
                <textarea
                  value={resolutionDescription}
                  onChange={(e) => setResolutionDescription(e.target.value)}
                  placeholder={t.resolutionDescPlaceholder}
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-100">
              <Button variant="ghost" onClick={() => setShowResolutionPanel(false)}>
                {t.cancel}
              </Button>
              <Button
                variant="primary"
                leftIcon={<CheckCircle className="w-4 h-4" />}
                onClick={handleResolve}
                isLoading={isProcessing}
                disabled={!resolutionDescription.trim()}
              >
                {t.confirmResolution}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
