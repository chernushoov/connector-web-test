'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAdminUI } from '@/store/admin'
import { DataTable, Column, RowAction } from '@/components/admin/data'
import { MetricCard } from '@/components/admin/charts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Dispute, DisputeStatus, DisputeType } from '@/types/admin'
import {
  Search,
  Download,
  Eye,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Flag,
  TrendingUp,
  Users,
} from 'lucide-react'

// Mock disputes data
const mockDisputes: Dispute[] = [
  {
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
    description: 'Worker claims payment was not received after shift completion. Employer confirms work was completed satisfactorily.',
    evidence: ['/evidence/1.jpg', '/evidence/2.jpg'],
    messages: [
      {
        id: 'm1',
        authorId: 'w1',
        authorName: 'Иван Петров',
        authorRole: 'worker',
        content: 'I completed the shift but haven\'t received my payment yet. It\'s been 3 days.',
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        id: 'm2',
        authorId: 'e1',
        authorName: 'ABC Logistics',
        authorRole: 'employer',
        content: 'We processed the payment on our end. Please check with your bank.',
        createdAt: new Date(Date.now() - 86400000),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 86400000),
    priority: 'high',
  },
  {
    id: 'disp_2',
    type: 'quality',
    status: 'investigating',
    shiftId: 'shift_2',
    shiftTitle: 'Event Staff',
    taskFlowId: 'tf_2',
    initiatorId: 'e2',
    initiatorName: 'Events Plus',
    initiatorRole: 'employer',
    respondentId: 'w2',
    respondentName: 'Мария Сидорова',
    description: 'Employer reports worker left 2 hours early without notice. Worker claims there was an emergency.',
    messages: [
      {
        id: 'm3',
        authorId: 'e2',
        authorName: 'Events Plus',
        authorRole: 'employer',
        content: 'The worker left 2 hours before the shift ended without any notice. This caused significant issues.',
        createdAt: new Date(Date.now() - 172800000),
      },
    ],
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 86400000),
    priority: 'medium',
    assignedTo: 'admin_1',
  },
  {
    id: 'disp_3',
    type: 'no_show',
    status: 'open',
    shiftId: 'shift_3',
    shiftTitle: 'Restaurant Server',
    taskFlowId: 'tf_3',
    initiatorId: 'e3',
    initiatorName: 'Fine Dining Co',
    initiatorRole: 'employer',
    respondentId: 'w3',
    respondentName: 'Алексей Козлов',
    description: 'Worker did not show up for scheduled shift. No communication received.',
    messages: [],
    createdAt: new Date(Date.now() - 43200000),
    updatedAt: new Date(Date.now() - 43200000),
    priority: 'urgent',
  },
  {
    id: 'disp_4',
    type: 'harassment',
    status: 'escalated',
    shiftId: 'shift_4',
    shiftTitle: 'Construction Helper',
    taskFlowId: 'tf_4',
    initiatorId: 'w4',
    initiatorName: 'Елена Новикова',
    initiatorRole: 'worker',
    respondentId: 'e4',
    respondentName: 'Build It Ltd',
    description: 'Worker reports inappropriate behavior from site supervisor. Requesting immediate investigation.',
    evidence: ['/evidence/3.jpg'],
    messages: [
      {
        id: 'm4',
        authorId: 'w4',
        authorName: 'Елена Новикова',
        authorRole: 'worker',
        content: 'I experienced inappropriate comments from the supervisor. I have screenshots.',
        createdAt: new Date(Date.now() - 259200000),
      },
      {
        id: 'm5',
        authorId: 'admin_1',
        authorName: 'Admin',
        authorRole: 'admin',
        content: 'Thank you for reporting this. We are escalating this case for immediate review.',
        createdAt: new Date(Date.now() - 172800000),
      },
    ],
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 86400000),
    priority: 'urgent',
    assignedTo: 'admin_1',
  },
  {
    id: 'disp_5',
    type: 'payment',
    status: 'resolved',
    shiftId: 'shift_5',
    shiftTitle: 'Cleaning Staff',
    taskFlowId: 'tf_5',
    initiatorId: 'w5',
    initiatorName: 'Дмитрий Иванов',
    initiatorRole: 'worker',
    respondentId: 'e5',
    respondentName: 'Clean Pro',
    description: 'Dispute over overtime pay. Worker claims 2 extra hours worked.',
    resolution: {
      outcome: 'split',
      description: 'After reviewing evidence, both parties agreed to split the disputed amount. Worker receives payment for 1 additional hour.',
      refundAmount: 50,
      resolvedBy: 'admin_1',
      resolvedAt: new Date(Date.now() - 432000000),
    },
    messages: [],
    createdAt: new Date(Date.now() - 604800000),
    updatedAt: new Date(Date.now() - 432000000),
    priority: 'low',
  },
  {
    id: 'disp_6',
    type: 'other',
    status: 'open',
    shiftId: 'shift_6',
    shiftTitle: 'Delivery Driver',
    taskFlowId: 'tf_6',
    initiatorId: 'e6',
    initiatorName: 'Fast Delivery',
    initiatorRole: 'employer',
    respondentId: 'w6',
    respondentName: 'Анна Смирнова',
    description: 'Dispute over damaged goods during delivery. Worker claims items were already damaged.',
    messages: [],
    createdAt: new Date(Date.now() - 21600000),
    updatedAt: new Date(Date.now() - 21600000),
    priority: 'medium',
  },
]

export default function DisputesPage() {
  const router = useRouter()
  const { language } = useAdminUI()

  const [disputes] = useState<Dispute[]>(mockDisputes)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  const t = {
    title: language === 'ru' ? 'Споры' : 'Disputes',
    subtitle: language === 'ru' ? 'Управление спорами и жалобами' : 'Manage disputes and complaints',
    all: language === 'ru' ? 'Все' : 'All',
    open: language === 'ru' ? 'Открытые' : 'Open',
    investigating: language === 'ru' ? 'На рассмотрении' : 'Investigating',
    resolved: language === 'ru' ? 'Решенные' : 'Resolved',
    escalated: language === 'ru' ? 'Эскалированы' : 'Escalated',
    payment: language === 'ru' ? 'Оплата' : 'Payment',
    quality: language === 'ru' ? 'Качество' : 'Quality',
    no_show: language === 'ru' ? 'Неявка' : 'No-show',
    harassment: language === 'ru' ? 'Домогательство' : 'Harassment',
    other: language === 'ru' ? 'Другое' : 'Other',
    totalDisputes: language === 'ru' ? 'Всего споров' : 'Total Disputes',
    openDisputes: language === 'ru' ? 'Открытые споры' : 'Open Disputes',
    urgentDisputes: language === 'ru' ? 'Срочные' : 'Urgent',
    resolvedThisWeek: language === 'ru' ? 'Решено за неделю' : 'Resolved This Week',
    view: language === 'ru' ? 'Открыть' : 'View',
    searchPlaceholder: language === 'ru' ? 'Поиск по ID, участнику или описанию...' : 'Search by ID, participant or description...',
    export: language === 'ru' ? 'Экспорт' : 'Export',
    messages: language === 'ru' ? 'сообщ.' : 'msg',
    low: language === 'ru' ? 'Низкий' : 'Low',
    medium: language === 'ru' ? 'Средний' : 'Medium',
    high: language === 'ru' ? 'Высокий' : 'High',
    urgent: language === 'ru' ? 'Срочный' : 'Urgent',
  }

  // Calculate stats
  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    urgent: disputes.filter(d => d.priority === 'urgent').length,
    resolvedThisWeek: disputes.filter(d => {
      if (d.status !== 'resolved' || !d.resolution?.resolvedAt) return false
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return new Date(d.resolution.resolvedAt) > weekAgo
    }).length,
  }

  // Filter disputes
  const filteredDisputes = disputes.filter((dispute) => {
    // Status filter
    if (statusFilter !== 'all' && dispute.status !== statusFilter) return false
    // Type filter
    if (typeFilter !== 'all' && dispute.type !== typeFilter) return false
    // Search filter
    const query = localSearchQuery.toLowerCase()
    if (query) {
      const matchesId = dispute.id.toLowerCase().includes(query)
      const matchesInitiator = dispute.initiatorName.toLowerCase().includes(query)
      const matchesRespondent = dispute.respondentName.toLowerCase().includes(query)
      const matchesDescription = dispute.description.toLowerCase().includes(query)
      const matchesShift = dispute.shiftTitle.toLowerCase().includes(query)
      if (!matchesId && !matchesInitiator && !matchesRespondent && !matchesDescription && !matchesShift) return false
    }
    return true
  })

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

  const columns: Column<Dispute>[] = [
    {
      id: 'id',
      header: 'ID',
      headerRu: 'ID',
      cell: (dispute) => (
        <span className="text-sm font-mono text-neutral-600">{dispute.id}</span>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      headerRu: 'Тип',
      cell: (dispute) => {
        const typeColors: Record<DisputeType, string> = {
          payment: 'bg-blue-100 text-blue-600',
          quality: 'bg-warning/10 text-warning',
          no_show: 'bg-neutral-100 text-neutral-600',
          harassment: 'bg-danger/10 text-danger',
          other: 'bg-neutral-100 text-neutral-600',
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[dispute.type]}`}>
            {getTypeLabel(dispute.type)}
          </span>
        )
      },
    },
    {
      id: 'parties',
      header: 'Parties',
      headerRu: 'Стороны',
      cell: (dispute) => (
        <div>
          <p className="text-sm font-medium text-neutral-900">
            {dispute.initiatorName}
            <span className="text-xs text-neutral-400 ml-1">({dispute.initiatorRole === 'worker' ? 'W' : 'E'})</span>
          </p>
          <p className="text-xs text-neutral-500">
            vs {dispute.respondentName}
          </p>
        </div>
      ),
    },
    {
      id: 'shift',
      header: 'Shift',
      headerRu: 'Смена',
      cell: (dispute) => (
        <p className="text-sm text-neutral-600 max-w-[150px] truncate" title={dispute.shiftTitle}>
          {dispute.shiftTitle}
        </p>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      headerRu: 'Статус',
      cell: (dispute) => {
        const statusColors: Record<DisputeStatus, string> = {
          open: 'bg-warning/10 text-warning',
          investigating: 'bg-blue-100 text-blue-600',
          resolved: 'bg-success/10 text-success',
          escalated: 'bg-danger/10 text-danger',
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[dispute.status]}`}>
            {getStatusLabel(dispute.status)}
          </span>
        )
      },
    },
    {
      id: 'priority',
      header: 'Priority',
      headerRu: 'Приоритет',
      cell: (dispute) => {
        const priorityColors: Record<string, string> = {
          low: 'text-neutral-500',
          medium: 'text-warning',
          high: 'text-orange-500',
          urgent: 'text-danger font-semibold',
        }
        return (
          <div className="flex items-center gap-1">
            {dispute.priority === 'urgent' && <AlertTriangle className="w-4 h-4 text-danger" />}
            <span className={`text-sm ${priorityColors[dispute.priority]}`}>
              {getPriorityLabel(dispute.priority)}
            </span>
          </div>
        )
      },
    },
    {
      id: 'messages',
      header: 'Messages',
      headerRu: 'Сообщения',
      cell: (dispute) => (
        <div className="flex items-center gap-1 text-neutral-500">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">{dispute.messages.length}</span>
        </div>
      ),
    },
    {
      id: 'created',
      header: 'Created',
      headerRu: 'Создан',
      sortable: true,
      cell: (dispute) => (
        <span className="text-sm text-neutral-500">
          {dispute.createdAt.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
        </span>
      ),
    },
  ]

  const actions: RowAction<Dispute>[] = [
    {
      id: 'view',
      label: t.view,
      labelRu: 'Открыть',
      icon: <Eye className="w-4 h-4" />,
      onClick: (dispute) => {
        router.push(`/admin/applications/disputes/${dispute.id}`)
      },
    },
  ]

  const statusFilters = [
    { key: 'all', label: t.all },
    { key: 'open', label: t.open },
    { key: 'investigating', label: t.investigating },
    { key: 'escalated', label: t.escalated },
    { key: 'resolved', label: t.resolved },
  ]

  const typeFilters = [
    { key: 'all', label: t.all },
    { key: 'payment', label: t.payment },
    { key: 'quality', label: t.quality },
    { key: 'no_show', label: t.no_show },
    { key: 'harassment', label: t.harassment },
    { key: 'other', label: t.other },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Flag className="w-6 h-6 text-warning" />
            {t.title}
          </h1>
          <p className="text-neutral-500">{t.subtitle}</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
          {t.export}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title={t.totalDisputes}
          value={stats.total}
          format="number"
          icon={<Flag className="w-5 h-5" />}
        />
        <MetricCard
          title={t.openDisputes}
          value={stats.open}
          format="number"
          icon={<AlertCircle className="w-5 h-5" />}
          variant="warning"
        />
        <MetricCard
          title={t.urgentDisputes}
          value={stats.urgent}
          format="number"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="danger"
        />
        <MetricCard
          title={t.resolvedThisWeek}
          value={stats.resolvedThisWeek}
          format="number"
          icon={<CheckCircle className="w-5 h-5" />}
          variant="success"
        />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">{language === 'ru' ? 'Статус:' : 'Status:'}</span>
              {statusFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === filter.key
                      ? 'bg-brand-primary text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">{language === 'ru' ? 'Тип:' : 'Type:'}</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {typeFilters.map((filter) => (
                  <option key={filter.key} value={filter.key}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <DataTable
        data={filteredDisputes}
        columns={columns}
        actions={actions}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(dispute) => dispute.id}
        page={page}
        pageSize={20}
        total={filteredDisputes.length}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </motion.div>
  )
}
