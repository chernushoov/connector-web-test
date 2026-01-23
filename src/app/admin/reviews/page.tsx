'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAdminUI, useAdminStore } from '@/store/admin'
import { DataTable, Column, RowAction } from '@/components/admin/data'
import { MetricCard } from '@/components/admin/charts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { exportToCSV, generateExportFilename } from '@/lib/export'
import type { AdminReviewView } from '@/types/admin'
import {
  Search,
  Download,
  Eye,
  EyeOff,
  Star,
  Flag,
  Trash2,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  User,
  Briefcase,
} from 'lucide-react'

// Mock data
const mockReviews: AdminReviewView[] = [
  {
    id: 'rev_1',
    rating: 5,
    comment: 'Excellent worker! Very professional and hardworking. Would definitely hire again.',
    authorId: 'e1',
    authorName: 'ABC Logistics',
    authorRole: 'employer',
    targetId: 'w1',
    targetName: 'Иван Петров',
    targetRole: 'worker',
    shiftId: 'shift_1',
    shiftTitle: 'Warehouse Helper',
    isHidden: false,
    reportCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'rev_2',
    rating: 4,
    comment: 'Good worker, arrived on time and completed all tasks. Communication could be better.',
    authorId: 'e2',
    authorName: 'Events Plus',
    authorRole: 'employer',
    targetId: 'w2',
    targetName: 'Мария Сидорова',
    targetRole: 'worker',
    shiftId: 'shift_2',
    shiftTitle: 'Event Staff',
    isHidden: false,
    reportCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: 'rev_3',
    rating: 1,
    comment: 'Terrible experience! Worker was rude and unprofessional. Never again!',
    authorId: 'e3',
    authorName: 'Fine Dining Co',
    authorRole: 'employer',
    targetId: 'w3',
    targetName: 'Алексей Козлов',
    targetRole: 'worker',
    shiftId: 'shift_3',
    shiftTitle: 'Restaurant Server',
    isHidden: false,
    reportCount: 3,
    createdAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: 'rev_4',
    rating: 5,
    comment: 'Great employer! Clear instructions and fair payment. Highly recommend.',
    authorId: 'w4',
    authorName: 'Елена Новикова',
    authorRole: 'worker',
    targetId: 'e4',
    targetName: 'Build It Ltd',
    targetRole: 'employer',
    shiftId: 'shift_4',
    shiftTitle: 'Construction Helper',
    isHidden: false,
    reportCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 7),
  },
  {
    id: 'rev_5',
    rating: 2,
    comment: 'This review contains inappropriate language that was reported.',
    authorId: 'w5',
    authorName: 'Дмитрий Иванов',
    authorRole: 'worker',
    targetId: 'e5',
    targetName: 'Clean Pro',
    targetRole: 'employer',
    shiftId: 'shift_5',
    shiftTitle: 'Cleaning Staff',
    isHidden: true,
    reportCount: 5,
    createdAt: new Date(Date.now() - 86400000 * 10),
  },
  {
    id: 'rev_6',
    rating: 3,
    comment: 'Average experience. Nothing special but got the job done.',
    authorId: 'e6',
    authorName: 'Fast Delivery',
    authorRole: 'employer',
    targetId: 'w6',
    targetName: 'Анна Смирнова',
    targetRole: 'worker',
    shiftId: 'shift_6',
    shiftTitle: 'Delivery Driver',
    isHidden: false,
    reportCount: 0,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'rev_7',
    rating: 4,
    comment: 'Good shift, payment was on time. Would work here again.',
    authorId: 'w7',
    authorName: 'Сергей Кузнецов',
    authorRole: 'worker',
    targetId: 'e7',
    targetName: 'Safe Guard',
    targetRole: 'employer',
    shiftId: 'shift_7',
    shiftTitle: 'Security Guard',
    isHidden: false,
    reportCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 4),
  },
  {
    id: 'rev_8',
    rating: 5,
    comment: 'Amazing worker, went above and beyond. Will definitely hire again!',
    authorId: 'e8',
    authorName: 'Tech Corp',
    authorRole: 'employer',
    targetId: 'w8',
    targetName: 'Ольга Федорова',
    targetRole: 'worker',
    shiftId: 'shift_8',
    shiftTitle: 'Office Assistant',
    isHidden: false,
    reportCount: 0,
    createdAt: new Date(Date.now() - 3600000 * 5),
  },
]

export default function ReviewsPage() {
  const router = useRouter()
  const { language } = useAdminUI()
  const { showToast } = useToast()

  const [reviews, setReviews] = useState<AdminReviewView[]>(mockReviews)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  // Modal states
  const [hideModalOpen, setHideModalOpen] = useState(false)
  const [reviewToHide, setReviewToHide] = useState<AdminReviewView | null>(null)
  const [hideReason, setHideReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const t = {
    title: language === 'ru' ? 'Отзывы' : 'Reviews',
    subtitle: language === 'ru' ? 'Модерация отзывов пользователей' : 'Moderate user reviews',
    all: language === 'ru' ? 'Все' : 'All',
    visible: language === 'ru' ? 'Видимые' : 'Visible',
    hidden: language === 'ru' ? 'Скрытые' : 'Hidden',
    reported: language === 'ru' ? 'С жалобами' : 'Reported',
    totalReviews: language === 'ru' ? 'Всего отзывов' : 'Total Reviews',
    avgRating: language === 'ru' ? 'Средний рейтинг' : 'Avg Rating',
    reportedReviews: language === 'ru' ? 'С жалобами' : 'Reported',
    hiddenReviews: language === 'ru' ? 'Скрытые' : 'Hidden',
    view: language === 'ru' ? 'Просмотр' : 'View',
    hide: language === 'ru' ? 'Скрыть' : 'Hide',
    unhide: language === 'ru' ? 'Показать' : 'Show',
    delete: language === 'ru' ? 'Удалить' : 'Delete',
    hideReview: language === 'ru' ? 'Скрыть отзыв' : 'Hide Review',
    hideReason: language === 'ru' ? 'Причина скрытия' : 'Hide Reason',
    hideReasonPlaceholder: language === 'ru' ? 'Укажите причину...' : 'Enter reason...',
    cancel: language === 'ru' ? 'Отмена' : 'Cancel',
    confirm: language === 'ru' ? 'Подтвердить' : 'Confirm',
    reviewHidden: language === 'ru' ? 'Отзыв скрыт' : 'Review hidden',
    reviewShown: language === 'ru' ? 'Отзыв показан' : 'Review shown',
    searchPlaceholder: language === 'ru' ? 'Поиск по автору, получателю или тексту...' : 'Search by author, target or text...',
    export: language === 'ru' ? 'Экспорт' : 'Export',
    exportSuccess: language === 'ru' ? 'Экспорт завершен' : 'Export completed',
    exportError: language === 'ru' ? 'Ошибка экспорта' : 'Export failed',
    reports: language === 'ru' ? 'жалоб' : 'reports',
    worker: language === 'ru' ? 'Работник' : 'Worker',
    employer: language === 'ru' ? 'Работодатель' : 'Employer',
    stars: language === 'ru' ? 'звезд' : 'stars',
    allRatings: language === 'ru' ? 'Все оценки' : 'All Ratings',
  }

  // Calculate stats
  const stats = {
    total: reviews.length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0',
    reported: reviews.filter(r => r.reportCount > 0).length,
    hidden: reviews.filter(r => r.isHidden).length,
  }

  // Handle hide review
  const handleHideReview = async () => {
    if (!reviewToHide) return

    setIsProcessing(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setReviews(prev => prev.map(r =>
        r.id === reviewToHide.id ? { ...r, isHidden: true } : r
      ))
      showToast(t.reviewHidden, 'success')
      setHideModalOpen(false)
      setReviewToHide(null)
      setHideReason('')
    } catch {
      showToast('Error', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle unhide review
  const handleUnhideReview = async (review: AdminReviewView) => {
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setReviews(prev => prev.map(r =>
        r.id === review.id ? { ...r, isHidden: false } : r
      ))
      showToast(t.reviewShown, 'success')
    } catch {
      showToast('Error', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // Open hide modal
  const openHideModal = (review: AdminReviewView) => {
    setReviewToHide(review)
    setHideReason('')
    setHideModalOpen(true)
  }

  // Handle export
  const handleExport = () => {
    try {
      const dataToExport = filteredReviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        authorId: review.authorId,
        authorName: review.authorName,
        authorRole: review.authorRole,
        targetId: review.targetId,
        targetName: review.targetName,
        targetRole: review.targetRole,
        shiftId: review.shiftId,
        shiftTitle: review.shiftTitle,
        isHidden: review.isHidden,
        reportCount: review.reportCount,
        createdAt: review.createdAt,
      }))

      const columns = [
        { key: 'id' as const, header: 'Review ID' },
        { key: 'rating' as const, header: language === 'ru' ? 'Оценка' : 'Rating' },
        { key: 'comment' as const, header: language === 'ru' ? 'Текст' : 'Comment' },
        { key: 'authorName' as const, header: language === 'ru' ? 'Автор' : 'Author' },
        { key: 'authorRole' as const, header: language === 'ru' ? 'Роль автора' : 'Author Role' },
        { key: 'targetName' as const, header: language === 'ru' ? 'Получатель' : 'Target' },
        { key: 'targetRole' as const, header: language === 'ru' ? 'Роль получателя' : 'Target Role' },
        { key: 'shiftTitle' as const, header: language === 'ru' ? 'Смена' : 'Shift' },
        { key: 'isHidden' as const, header: language === 'ru' ? 'Скрыт' : 'Hidden' },
        { key: 'reportCount' as const, header: language === 'ru' ? 'Жалобы' : 'Reports' },
        { key: 'createdAt' as const, header: language === 'ru' ? 'Дата' : 'Date' },
      ]

      exportToCSV(dataToExport, columns, generateExportFilename('reviews'))
      showToast(t.exportSuccess, 'success')
    } catch {
      showToast(t.exportError, 'error')
    }
  }

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    // Status filter
    if (statusFilter === 'visible' && review.isHidden) return false
    if (statusFilter === 'hidden' && !review.isHidden) return false
    if (statusFilter === 'reported' && review.reportCount === 0) return false
    // Rating filter
    if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) return false
    // Search filter
    const query = localSearchQuery.toLowerCase()
    if (query) {
      const matchesAuthor = review.authorName.toLowerCase().includes(query)
      const matchesTarget = review.targetName.toLowerCase().includes(query)
      const matchesComment = review.comment.toLowerCase().includes(query)
      const matchesShift = review.shiftTitle.toLowerCase().includes(query)
      if (!matchesAuthor && !matchesTarget && !matchesComment && !matchesShift) return false
    }
    return true
  })

  const columns: Column<AdminReviewView>[] = [
    {
      id: 'rating',
      header: 'Rating',
      headerRu: 'Оценка',
      cell: (review) => (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= review.rating ? 'text-warning fill-warning' : 'text-neutral-200'
              }`}
            />
          ))}
        </div>
      ),
    },
    {
      id: 'comment',
      header: 'Comment',
      headerRu: 'Отзыв',
      cell: (review) => (
        <p className="text-sm text-neutral-700 max-w-[300px] truncate" title={review.comment}>
          {review.comment}
        </p>
      ),
    },
    {
      id: 'author',
      header: 'Author',
      headerRu: 'Автор',
      cell: (review) => (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            review.authorRole === 'worker' ? 'bg-brand-primary/10' : 'bg-success/10'
          }`}>
            {review.authorRole === 'worker' ? (
              <User className={`w-4 h-4 text-brand-primary`} />
            ) : (
              <Briefcase className={`w-4 h-4 text-success`} />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">{review.authorName}</p>
            <p className="text-xs text-neutral-500">
              {review.authorRole === 'worker' ? t.worker : t.employer}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'target',
      header: 'Target',
      headerRu: 'Получатель',
      cell: (review) => (
        <div>
          <p className="text-sm font-medium text-neutral-900">{review.targetName}</p>
          <p className="text-xs text-neutral-500">
            {review.targetRole === 'worker' ? t.worker : t.employer}
          </p>
        </div>
      ),
    },
    {
      id: 'shift',
      header: 'Shift',
      headerRu: 'Смена',
      cell: (review) => (
        <p className="text-sm text-neutral-600">{review.shiftTitle}</p>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      headerRu: 'Статус',
      cell: (review) => (
        <div className="flex items-center gap-2">
          {review.isHidden ? (
            <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium flex items-center gap-1">
              <EyeOff className="w-3 h-3" />
              {t.hidden}
            </span>
          ) : (
            <span className="px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {t.visible}
            </span>
          )}
          {review.reportCount > 0 && (
            <span className="px-2 py-1 bg-danger/10 text-danger rounded-full text-xs font-medium flex items-center gap-1">
              <Flag className="w-3 h-3" />
              {review.reportCount}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      headerRu: 'Дата',
      sortable: true,
      cell: (review) => (
        <span className="text-sm text-neutral-500">
          {review.createdAt.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
        </span>
      ),
    },
  ]

  const actions: RowAction<AdminReviewView>[] = [
    {
      id: 'view',
      label: t.view,
      labelRu: 'Просмотр',
      icon: <Eye className="w-4 h-4" />,
      onClick: (review) => {
        router.push(`/admin/users/${review.targetId}`)
      },
    },
    {
      id: 'hide',
      label: t.hide,
      labelRu: 'Скрыть',
      icon: <EyeOff className="w-4 h-4" />,
      onClick: openHideModal,
      show: (review) => !review.isHidden,
    },
    {
      id: 'unhide',
      label: t.unhide,
      labelRu: 'Показать',
      icon: <Eye className="w-4 h-4" />,
      onClick: handleUnhideReview,
      show: (review) => review.isHidden,
    },
  ]

  const statusFilters = [
    { key: 'all', label: t.all },
    { key: 'visible', label: t.visible },
    { key: 'hidden', label: t.hidden },
    { key: 'reported', label: t.reported },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-warning" />
            {t.title}
          </h1>
          <p className="text-neutral-500">{t.subtitle}</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={handleExport}>
          {t.export}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title={t.totalReviews}
          value={stats.total}
          icon={<MessageSquare className="w-5 h-5" />}
        />
        <MetricCard
          title={t.avgRating}
          value={stats.avgRating}
          icon={<Star className="w-5 h-5" />}
          variant="primary"
        />
        <MetricCard
          title={t.reportedReviews}
          value={stats.reported}
          icon={<Flag className="w-5 h-5" />}
          variant={stats.reported > 0 ? 'warning' : 'default'}
        />
        <MetricCard
          title={t.hiddenReviews}
          value={stats.hidden}
          icon={<EyeOff className="w-5 h-5" />}
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
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">{t.allRatings}</option>
            <option value="5">5 {t.stars}</option>
            <option value="4">4 {t.stars}</option>
            <option value="3">3 {t.stars}</option>
            <option value="2">2 {t.stars}</option>
            <option value="1">1 {t.stars}</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <DataTable
        data={filteredReviews}
        columns={columns}
        actions={actions}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(review) => review.id}
        page={page}
        pageSize={20}
        total={filteredReviews.length}
        onPageChange={setPage}
        isLoading={isLoading || isProcessing}
      />

      {/* Hide Review Modal */}
      <Modal
        isOpen={hideModalOpen}
        onClose={() => {
          setHideModalOpen(false)
          setReviewToHide(null)
          setHideReason('')
        }}
        title={t.hideReview}
        subtitle={reviewToHide ? `${t.worker}: ${reviewToHide.targetName}` : ''}
        size="md"
      >
        {reviewToHide && (
          <div className="space-y-4">
            {/* Review preview */}
            <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= reviewToHide.rating ? 'text-warning fill-warning' : 'text-neutral-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-neutral-700">{reviewToHide.comment}</p>
              <p className="text-xs text-neutral-500">
                {language === 'ru' ? 'От' : 'By'}: {reviewToHide.authorName}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t.hideReason}
              </label>
              <textarea
                value={hideReason}
                onChange={(e) => setHideReason(e.target.value)}
                placeholder={t.hideReasonPlaceholder}
                rows={3}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              />
            </div>

            {/* Quick reasons */}
            <div className="flex flex-wrap gap-2">
              {[
                language === 'ru' ? 'Оскорбительный контент' : 'Offensive content',
                language === 'ru' ? 'Спам' : 'Spam',
                language === 'ru' ? 'Ложная информация' : 'False information',
                language === 'ru' ? 'Нарушение правил' : 'Policy violation',
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setHideReason(reason)}
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
              setHideModalOpen(false)
              setReviewToHide(null)
              setHideReason('')
            }}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleHideReview}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl font-semibold text-white bg-danger hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing && (
              <motion.span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            )}
            {t.confirm}
          </button>
        </ModalFooter>
      </Modal>
    </motion.div>
  )
}
