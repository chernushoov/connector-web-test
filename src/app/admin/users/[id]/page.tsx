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
import type { AdminUserView, AdminShiftView, AdminReviewView, AdminDocumentView } from '@/types/admin'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Star,
  Shield,
  ShieldOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageCircle,
  DollarSign,
  Briefcase,
  Flag,
  FileText,
  Activity,
  Eye,
  ExternalLink,
} from 'lucide-react'

// Mock user data
const mockUser: AdminUserView = {
  id: 'u1',
  phone: '+972501234567',
  name: 'Иван Петров',
  email: 'ivan.petrov@email.com',
  photoUrl: undefined,
  role: 'worker',
  isVerified: true,
  verificationStatus: 'verified',
  isBlocked: false,
  shiftsCompleted: 45,
  totalEarned: 28500,
  totalPaid: 0,
  rating: 4.8,
  reviewCount: 32,
  disputeCount: 1,
  createdAt: new Date(Date.now() - 86400000 * 120),
  lastActiveAt: new Date(Date.now() - 3600000),
}

// Mock user's shifts
const mockUserShifts: AdminShiftView[] = [
  {
    id: 'shift_1',
    title: 'Warehouse Helper',
    description: 'Loading and unloading goods',
    status: 'completed',
    employerId: 'e1',
    employerName: 'ABC Logistics',
    employerCompany: 'ABC Logistics Ltd',
    employerRating: 4.5,
    location: { address: 'Industrial Area 5', city: 'Tel Aviv', lat: 32.0, lng: 34.8 },
    date: new Date(Date.now() - 86400000 * 2),
    startTime: '08:00',
    endTime: '16:00',
    baseRate: 55,
    totalEstimate: 440,
    slots: 5,
    filled: 5,
    applicants: 12,
    createdAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: 'shift_2',
    title: 'Event Staff',
    description: 'Event setup and assistance',
    status: 'completed',
    employerId: 'e2',
    employerName: 'Events Plus',
    employerCompany: 'Events Plus Inc',
    employerRating: 4.8,
    location: { address: 'Convention Center', city: 'Haifa', lat: 32.8, lng: 35.0 },
    date: new Date(Date.now() - 86400000 * 7),
    startTime: '10:00',
    endTime: '18:00',
    baseRate: 65,
    totalEstimate: 520,
    slots: 10,
    filled: 10,
    applicants: 25,
    createdAt: new Date(Date.now() - 86400000 * 10),
  },
  {
    id: 'shift_3',
    title: 'Moving Helper',
    description: 'Furniture moving assistance',
    status: 'active',
    employerId: 'e3',
    employerName: 'Quick Move',
    employerCompany: 'Quick Move Services',
    employerRating: 4.2,
    location: { address: 'Residential Area', city: 'Tel Aviv', lat: 32.1, lng: 34.8 },
    date: new Date(Date.now() + 86400000),
    startTime: '09:00',
    endTime: '17:00',
    baseRate: 60,
    totalEstimate: 480,
    slots: 3,
    filled: 2,
    applicants: 8,
    createdAt: new Date(Date.now() - 86400000),
  },
]

// Mock user's reviews
const mockUserReviews: AdminReviewView[] = [
  {
    id: 'rev_1',
    rating: 5,
    comment: 'Excellent worker! Very professional and hardworking. Would definitely hire again.',
    authorId: 'e1',
    authorName: 'ABC Logistics',
    authorRole: 'employer',
    targetId: 'u1',
    targetName: 'Иван Петров',
    targetRole: 'worker',
    shiftId: 'shift_1',
    shiftTitle: 'Warehouse Helper',
    isHidden: false,
    reportCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: 'rev_2',
    rating: 4,
    comment: 'Good worker, arrived on time and completed all tasks. Communication could be better.',
    authorId: 'e2',
    authorName: 'Events Plus',
    authorRole: 'employer',
    targetId: 'u1',
    targetName: 'Иван Петров',
    targetRole: 'worker',
    shiftId: 'shift_2',
    shiftTitle: 'Event Staff',
    isHidden: false,
    reportCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 8),
  },
]

// Mock user's documents
const mockUserDocuments: AdminDocumentView[] = [
  {
    id: 'doc_1',
    type: 'passport',
    imageUrl: '/placeholder.jpg',
    userId: 'u1',
    userName: 'Иван Петров',
    userPhone: '+972501234567',
    status: 'verified',
    verifiedAt: new Date(Date.now() - 86400000 * 100),
    verifiedBy: 'admin_1',
    uploadedAt: new Date(Date.now() - 86400000 * 115),
  },
  {
    id: 'doc_2',
    type: 'work_permit',
    imageUrl: '/placeholder.jpg',
    userId: 'u1',
    userName: 'Иван Петров',
    userPhone: '+972501234567',
    status: 'verified',
    verifiedAt: new Date(Date.now() - 86400000 * 90),
    verifiedBy: 'admin_1',
    uploadedAt: new Date(Date.now() - 86400000 * 95),
  },
]

// Mock activity log
const mockActivity = [
  { id: 'a1', action: 'shift_completed', description: 'Completed shift "Warehouse Helper"', timestamp: new Date(Date.now() - 86400000 * 2) },
  { id: 'a2', action: 'payment_received', description: 'Received payment ₪440', timestamp: new Date(Date.now() - 86400000 * 2) },
  { id: 'a3', action: 'review_received', description: 'Received 5-star review from ABC Logistics', timestamp: new Date(Date.now() - 86400000 * 3) },
  { id: 'a4', action: 'shift_applied', description: 'Applied for "Moving Helper"', timestamp: new Date(Date.now() - 86400000 * 4) },
  { id: 'a5', action: 'shift_completed', description: 'Completed shift "Event Staff"', timestamp: new Date(Date.now() - 86400000 * 7) },
  { id: 'a6', action: 'profile_updated', description: 'Updated profile information', timestamp: new Date(Date.now() - 86400000 * 30) },
  { id: 'a7', action: 'document_verified', description: 'Work permit verified', timestamp: new Date(Date.now() - 86400000 * 90) },
  { id: 'a8', action: 'document_verified', description: 'Passport verified', timestamp: new Date(Date.now() - 86400000 * 100) },
  { id: 'a9', action: 'registered', description: 'Account created', timestamp: new Date(Date.now() - 86400000 * 120) },
]

type TabType = 'overview' | 'shifts' | 'reviews' | 'documents' | 'activity'

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useAdminUI()
  const { blockUser, unblockUser, verifyUser } = useAdminStore()
  const { showToast } = useToast()

  const [user, setUser] = useState<AdminUserView | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isProcessing, setIsProcessing] = useState(false)

  // Block modal state
  const [blockModalOpen, setBlockModalOpen] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [blockDuration, setBlockDuration] = useState<string>('permanent')

  const t = {
    back: language === 'ru' ? 'Назад к пользователям' : 'Back to Users',
    userDetails: language === 'ru' ? 'Профиль пользователя' : 'User Profile',
    worker: language === 'ru' ? 'Работник' : 'Worker',
    employer: language === 'ru' ? 'Работодатель' : 'Employer',
    both: language === 'ru' ? 'Работник + Работодатель' : 'Worker + Employer',
    verified: language === 'ru' ? 'Верифицирован' : 'Verified',
    unverified: language === 'ru' ? 'Не верифицирован' : 'Unverified',
    blocked: language === 'ru' ? 'Заблокирован' : 'Blocked',
    shiftsCompleted: language === 'ru' ? 'Смен выполнено' : 'Shifts Completed',
    totalEarned: language === 'ru' ? 'Заработано' : 'Total Earned',
    rating: language === 'ru' ? 'Рейтинг' : 'Rating',
    disputes: language === 'ru' ? 'Споры' : 'Disputes',
    overview: language === 'ru' ? 'Обзор' : 'Overview',
    shifts: language === 'ru' ? 'Смены' : 'Shifts',
    reviews: language === 'ru' ? 'Отзывы' : 'Reviews',
    documents: language === 'ru' ? 'Документы' : 'Documents',
    activity: language === 'ru' ? 'Активность' : 'Activity',
    verify: language === 'ru' ? 'Верифицировать' : 'Verify',
    block: language === 'ru' ? 'Заблокировать' : 'Block',
    unblock: language === 'ru' ? 'Разблокировать' : 'Unblock',
    contact: language === 'ru' ? 'Связаться' : 'Contact',
    phone: language === 'ru' ? 'Телефон' : 'Phone',
    email: language === 'ru' ? 'Email' : 'Email',
    registeredAt: language === 'ru' ? 'Дата регистрации' : 'Registration Date',
    lastActive: language === 'ru' ? 'Последняя активность' : 'Last Active',
    notFound: language === 'ru' ? 'Пользователь не найден' : 'User not found',
    blockUser: language === 'ru' ? 'Заблокировать пользователя' : 'Block User',
    blockReason: language === 'ru' ? 'Причина блокировки' : 'Block Reason',
    blockReasonPlaceholder: language === 'ru' ? 'Укажите причину блокировки...' : 'Enter block reason...',
    blockDuration: language === 'ru' ? 'Длительность' : 'Duration',
    permanent: language === 'ru' ? 'Навсегда' : 'Permanent',
    oneWeek: language === 'ru' ? '1 неделя' : '1 Week',
    oneMonth: language === 'ru' ? '1 месяц' : '1 Month',
    threeMonths: language === 'ru' ? '3 месяца' : '3 Months',
    cancel: language === 'ru' ? 'Отмена' : 'Cancel',
    confirmBlock: language === 'ru' ? 'Подтвердить блокировку' : 'Confirm Block',
    userVerified: language === 'ru' ? 'Пользователь верифицирован' : 'User verified',
    userBlocked: language === 'ru' ? 'Пользователь заблокирован' : 'User blocked',
    userUnblocked: language === 'ru' ? 'Пользователь разблокирован' : 'User unblocked',
    error: language === 'ru' ? 'Произошла ошибка' : 'An error occurred',
    noShifts: language === 'ru' ? 'Нет смен' : 'No shifts',
    noReviews: language === 'ru' ? 'Нет отзывов' : 'No reviews',
    noDocuments: language === 'ru' ? 'Нет документов' : 'No documents',
    noActivity: language === 'ru' ? 'Нет активности' : 'No activity',
    viewShift: language === 'ru' ? 'Открыть смену' : 'View Shift',
    passport: language === 'ru' ? 'Паспорт' : 'Passport',
    workPermit: language === 'ru' ? 'Разрешение на работу' : 'Work Permit',
    driverLicense: language === 'ru' ? 'Водительские права' : 'Driver License',
    other: language === 'ru' ? 'Другое' : 'Other',
    pending: language === 'ru' ? 'На проверке' : 'Pending',
    rejected: language === 'ru' ? 'Отклонен' : 'Rejected',
  }

  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setUser({ ...mockUser, id: params.id as string })
      setIsLoading(false)
    }, 500)
  }, [params.id])

  const handleVerify = async () => {
    if (!user) return

    setIsProcessing(true)
    try {
      await verifyUser(user.id)
      setUser(prev => prev ? { ...prev, isVerified: true, verificationStatus: 'verified' } : null)
      showToast(t.userVerified, 'success')
    } catch (error) {
      showToast(t.error, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBlock = async () => {
    if (!user || !blockReason.trim()) return

    setIsProcessing(true)
    try {
      const duration = blockDuration === 'permanent' ? undefined :
        blockDuration === 'oneWeek' ? 7 :
        blockDuration === 'oneMonth' ? 30 :
        blockDuration === 'threeMonths' ? 90 : undefined

      await blockUser(user.id, blockReason, duration)
      setUser(prev => prev ? {
        ...prev,
        isBlocked: true,
        blockReason,
        blockedAt: new Date(),
        blockedUntil: duration ? new Date(Date.now() + duration * 86400000) : undefined,
      } : null)
      setBlockModalOpen(false)
      showToast(t.userBlocked, 'success')
    } catch (error) {
      showToast(t.error, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnblock = async () => {
    if (!user) return

    setIsProcessing(true)
    try {
      await unblockUser(user.id)
      setUser(prev => prev ? {
        ...prev,
        isBlocked: false,
        blockReason: undefined,
        blockedAt: undefined,
        blockedUntil: undefined,
      } : null)
      showToast(t.userUnblocked, 'success')
    } catch (error) {
      showToast(t.error, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const openWhatsApp = () => {
    if (!user) return
    const phone = user.phone.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${phone}`, '_blank')
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = { worker: t.worker, employer: t.employer, both: t.both }
    return labels[role] || role
  }

  const getDocTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      passport: t.passport,
      work_permit: t.workPermit,
      driver_license: t.driverLicense,
      other: t.other,
    }
    return labels[type] || type
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded-lg w-48 animate-pulse" />
        <Card className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-neutral-200 rounded-full animate-pulse" />
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-neutral-200 rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded w-1/4 animate-pulse" />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-neutral-900">{t.notFound}</h2>
        <Link href="/admin/users">
          <Button variant="outline" className="mt-4" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            {t.back}
          </Button>
        </Link>
      </div>
    )
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'overview', label: t.overview },
    { key: 'shifts', label: t.shifts },
    { key: 'reviews', label: t.reviews },
    { key: 'documents', label: t.documents },
    { key: 'activity', label: t.activity },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            {t.back}
          </Button>
        </Link>
      </div>

      {/* User header card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-brand flex items-center justify-center text-white text-3xl font-bold">
              {user.name.charAt(0)}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-neutral-900">{user.name}</h1>
                {user.isVerified && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    {t.verified}
                  </span>
                )}
                {user.isBlocked && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-danger/10 text-danger text-xs font-medium rounded-full">
                    <ShieldOff className="w-3 h-3" />
                    {t.blocked}
                  </span>
                )}
              </div>
              <p className="text-neutral-500 mb-3">{getRoleLabel(user.role)} · ID: {user.id}</p>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {user.phone}
                </span>
                {user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!user.isVerified && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Shield className="w-4 h-4" />}
                onClick={handleVerify}
                isLoading={isProcessing}
              >
                {t.verify}
              </Button>
            )}
            {user.isBlocked ? (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ShieldOff className="w-4 h-4" />}
                onClick={handleUnblock}
                isLoading={isProcessing}
              >
                {t.unblock}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ShieldOff className="w-4 h-4" />}
                onClick={() => setBlockModalOpen(true)}
                className="text-danger border-danger hover:bg-danger/5"
              >
                {t.block}
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<MessageCircle className="w-4 h-4" />}
              onClick={openWhatsApp}
            >
              {t.contact}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-neutral-900">{user.shiftsCompleted}</p>
            <p className="text-sm text-neutral-500">{t.shiftsCompleted}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">₪{user.totalEarned.toLocaleString()}</p>
            <p className="text-sm text-neutral-500">{t.totalEarned}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-warning fill-warning" />
              <p className="text-2xl font-bold text-neutral-900">{user.rating.toFixed(1)}</p>
            </div>
            <p className="text-sm text-neutral-500">{t.rating} ({user.reviewCount})</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-neutral-900">{user.disputeCount}</p>
            <p className="text-sm text-neutral-500">{t.disputes}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-brand-primary'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">{language === 'ru' ? 'Информация профиля' : 'Profile Information'}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">{t.phone}</span>
                  <span className="text-sm font-medium text-neutral-900">{user.phone}</span>
                </div>
                {user.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">{t.email}</span>
                    <span className="text-sm font-medium text-neutral-900">{user.email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">{t.registeredAt}</span>
                  <span className="text-sm font-medium text-neutral-900">
                    {user.createdAt.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">{t.lastActive}</span>
                  <span className="text-sm font-medium text-neutral-900">
                    {user.lastActiveAt.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">{language === 'ru' ? 'Статус верификации' : 'Verification Status'}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">{language === 'ru' ? 'Статус' : 'Status'}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.verificationStatus === 'verified' ? 'bg-success/10 text-success' :
                    user.verificationStatus === 'pending' ? 'bg-warning/10 text-warning' :
                    user.verificationStatus === 'rejected' ? 'bg-danger/10 text-danger' :
                    'bg-neutral-100 text-neutral-600'
                  }`}>
                    {user.verificationStatus === 'verified' ? t.verified :
                     user.verificationStatus === 'pending' ? t.pending :
                     user.verificationStatus === 'rejected' ? t.rejected : t.unverified}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">{language === 'ru' ? 'Документы' : 'Documents'}</span>
                  <span className="text-sm font-medium text-neutral-900">{mockUserDocuments.length}</span>
                </div>
              </div>
            </Card>

            {user.isBlocked && user.blockReason && (
              <Card className="p-6 col-span-2 border-danger/30 bg-danger/5">
                <h3 className="font-semibold text-danger mb-4 flex items-center gap-2">
                  <ShieldOff className="w-5 h-5" />
                  {language === 'ru' ? 'Информация о блокировке' : 'Block Information'}
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-600">{user.blockReason}</p>
                  {user.blockedAt && (
                    <p className="text-xs text-neutral-500">
                      {language === 'ru' ? 'Заблокирован' : 'Blocked'}: {user.blockedAt.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                    </p>
                  )}
                  {user.blockedUntil && (
                    <p className="text-xs text-neutral-500">
                      {language === 'ru' ? 'До' : 'Until'}: {user.blockedUntil.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'shifts' && (
          <div className="space-y-4">
            {mockUserShifts.length === 0 ? (
              <Card className="p-12 text-center">
                <Briefcase className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">{t.noShifts}</p>
              </Card>
            ) : (
              mockUserShifts.map((shift) => (
                <Card key={shift.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        shift.status === 'completed' ? 'bg-success/10' :
                        shift.status === 'active' ? 'bg-brand-primary/10' :
                        'bg-neutral-100'
                      }`}>
                        <Briefcase className={`w-5 h-5 ${
                          shift.status === 'completed' ? 'text-success' :
                          shift.status === 'active' ? 'text-brand-primary' :
                          'text-neutral-500'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{shift.title}</p>
                        <p className="text-sm text-neutral-500">{shift.employerCompany}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-success">₪{shift.totalEstimate}</p>
                        <p className="text-xs text-neutral-500">
                          {shift.date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        shift.status === 'completed' ? 'bg-success/10 text-success' :
                        shift.status === 'active' ? 'bg-brand-primary/10 text-brand-primary' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {shift.status}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye className="w-4 h-4" />}
                        onClick={() => router.push(`/admin/shifts/${shift.id}`)}
                      >
                        {t.viewShift}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {mockUserReviews.length === 0 ? (
              <Card className="p-12 text-center">
                <Star className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">{t.noReviews}</p>
              </Card>
            ) : (
              mockUserReviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? 'text-warning fill-warning' : 'text-neutral-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-neutral-500">
                          {language === 'ru' ? 'от' : 'from'} {review.authorName}
                        </span>
                      </div>
                      <p className="text-neutral-600">{review.comment}</p>
                      <p className="text-xs text-neutral-400 mt-2">
                        {review.shiftTitle} · {review.createdAt.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="grid grid-cols-2 gap-4">
            {mockUserDocuments.length === 0 ? (
              <Card className="p-12 text-center col-span-2">
                <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">{t.noDocuments}</p>
              </Card>
            ) : (
              mockUserDocuments.map((doc) => (
                <Card key={doc.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      doc.status === 'verified' ? 'bg-success/10' :
                      doc.status === 'pending' ? 'bg-warning/10' :
                      'bg-neutral-100'
                    }`}>
                      <FileText className={`w-6 h-6 ${
                        doc.status === 'verified' ? 'text-success' :
                        doc.status === 'pending' ? 'text-warning' :
                        'text-neutral-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{getDocTypeLabel(doc.type)}</p>
                      <p className="text-xs text-neutral-500">
                        {language === 'ru' ? 'Загружен' : 'Uploaded'}: {doc.uploadedAt.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'verified' ? 'bg-success/10 text-success' :
                      doc.status === 'pending' ? 'bg-warning/10 text-warning' :
                      'bg-danger/10 text-danger'
                    }`}>
                      {doc.status === 'verified' ? t.verified :
                       doc.status === 'pending' ? t.pending : t.rejected}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <Card className="p-6">
            {mockActivity.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">{t.noActivity}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.action.includes('completed') || activity.action.includes('verified') ? 'bg-success/10' :
                      activity.action.includes('payment') ? 'bg-brand-primary/10' :
                      activity.action.includes('review') ? 'bg-warning/10' :
                      'bg-neutral-100'
                    }`}>
                      {activity.action.includes('completed') || activity.action.includes('verified') ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : activity.action.includes('payment') ? (
                        <DollarSign className="w-4 h-4 text-brand-primary" />
                      ) : activity.action.includes('review') ? (
                        <Star className="w-4 h-4 text-warning" />
                      ) : activity.action.includes('applied') ? (
                        <Briefcase className="w-4 h-4 text-neutral-500" />
                      ) : activity.action.includes('registered') ? (
                        <User className="w-4 h-4 text-neutral-500" />
                      ) : (
                        <Activity className="w-4 h-4 text-neutral-500" />
                      )}
                    </div>
                    <div className="flex-1 pb-4 border-b border-neutral-100 last:border-0">
                      <p className="text-sm text-neutral-700">{activity.description}</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {activity.timestamp.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Block Modal */}
      <Modal
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        title={t.blockUser}
        subtitle={user.name}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t.blockReason} <span className="text-danger">*</span>
            </label>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder={t.blockReasonPlaceholder}
              rows={3}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-danger/20 focus:border-danger resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">{t.blockDuration}</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'oneWeek', label: t.oneWeek },
                { key: 'oneMonth', label: t.oneMonth },
                { key: 'threeMonths', label: t.threeMonths },
                { key: 'permanent', label: t.permanent },
              ].map((duration) => (
                <button
                  key={duration.key}
                  onClick={() => setBlockDuration(duration.key)}
                  className={`p-3 rounded-xl text-sm font-medium border transition-colors ${
                    blockDuration === duration.key
                      ? 'bg-danger text-white border-danger'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-danger'
                  }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick reasons */}
          <div className="flex flex-wrap gap-2">
            {[
              language === 'ru' ? 'Нарушение правил' : 'Policy violation',
              language === 'ru' ? 'Мошенничество' : 'Fraud',
              language === 'ru' ? 'Неприемлемое поведение' : 'Inappropriate behavior',
              language === 'ru' ? 'Неявка на смены' : 'No-show pattern',
            ].map((reason) => (
              <button
                key={reason}
                onClick={() => setBlockReason(reason)}
                className="px-3 py-1.5 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        <ModalFooter>
          <button
            onClick={() => setBlockModalOpen(false)}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleBlock}
            disabled={isProcessing || !blockReason.trim()}
            className="px-4 py-2 rounded-xl font-semibold text-white bg-danger hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing && (
              <motion.span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            )}
            {t.confirmBlock}
          </button>
        </ModalFooter>
      </Modal>
    </motion.div>
  )
}
