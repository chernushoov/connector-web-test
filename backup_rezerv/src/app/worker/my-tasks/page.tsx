'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useWorker, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, EmptyState, LoadingState } from '@/components/shared'
import { TaskFlowCard } from '@/components/worker'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, Clock, Play, Star } from 'lucide-react'
import type { TaskFlow, TaskFlowStatus } from '@/types'

type TabFilter = 'all' | 'active' | 'completed' | 'pending'

// Mock data
const mockTasks: TaskFlow[] = [
  {
    id: 'task1',
    shiftId: 'shift1',
    shift: {
      id: 'shift1',
      title: 'Warehouse Helper',
      description: 'Loading and unloading goods',
      employer: {
        id: 'emp1',
        name: 'Alex Cohen',
        company: 'FastLogistics Ltd',
        phone: '+972501234567',
        rating: 4.8,
        reviewCount: 156,
        totalPaid: 125000,
        isVerified: true,
      },
      location: { latitude: 32.0853, longitude: 34.7818, address: 'Tel Aviv Port' },
      city: 'Tel Aviv',
      date: new Date(),
      startTime: '08:00',
      endTime: '16:00',
      urgency: 'instant',
      baseRate: 55,
      surgeMultiplier: 1.0,
      totalEstimate: 440,
      paymentGuarantee: true,
      slots: 5,
      filled: 4,
      applicants: 15,
      requirements: { needsCar: false, needsTools: false, needsTeam: 0, minExperience: 0, minRating: 3.5 },
      requiredSkills: ['warehouse'],
      status: 'in_progress',
      isInstant: true,
      acceptsTeams: false,
      hasEscrow: true,
      hasInsurance: true,
      workplaceRating: 4.5,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 45,
    },
    workerId: 'worker1',
    status: 'in_progress',
    appliedAt: new Date(Date.now() - 86400000),
    approvedAt: new Date(Date.now() - 43200000),
    startedAt: new Date(Date.now() - 3600000),
    agreedRate: 55,
    paymentStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task2',
    shiftId: 'shift2',
    shift: {
      id: 'shift2',
      title: 'Moving Assistant',
      description: 'Help with apartment moving',
      employer: {
        id: 'emp2',
        name: 'David Levi',
        company: 'QuickMove',
        phone: '+972509876543',
        rating: 4.6,
        reviewCount: 89,
        totalPaid: 78000,
        isVerified: true,
      },
      location: { latitude: 32.0753, longitude: 34.7918, address: 'Ramat Gan' },
      city: 'Ramat Gan',
      date: new Date(Date.now() + 86400000),
      startTime: '09:00',
      endTime: '17:00',
      urgency: 'today',
      baseRate: 60,
      surgeMultiplier: 1.0,
      totalEstimate: 480,
      paymentGuarantee: true,
      slots: 3,
      filled: 2,
      applicants: 7,
      requirements: { needsCar: true, needsTools: false, needsTeam: 2, minExperience: 1, minRating: 4.0 },
      requiredSkills: ['moving', 'driving'],
      status: 'matched',
      isInstant: false,
      acceptsTeams: true,
      hasEscrow: true,
      hasInsurance: false,
      workplaceRating: 4.2,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 23,
    },
    workerId: 'worker1',
    status: 'approved',
    appliedAt: new Date(Date.now() - 172800000),
    approvedAt: new Date(Date.now() - 86400000),
    agreedRate: 60,
    paymentStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task3',
    shiftId: 'shift3',
    shift: {
      id: 'shift3',
      title: 'Event Setup',
      description: 'Corporate event setup',
      employer: {
        id: 'emp3',
        name: 'Marina Events',
        company: 'Marina Events Co',
        phone: '+972505551234',
        rating: 4.9,
        reviewCount: 234,
        totalPaid: 340000,
        isVerified: true,
      },
      location: { latitude: 32.1053, longitude: 34.8018, address: 'Herzliya' },
      city: 'Herzliya',
      date: new Date(Date.now() - 172800000),
      startTime: '06:00',
      endTime: '14:00',
      urgency: 'scheduled',
      baseRate: 70,
      surgeMultiplier: 1.0,
      totalEstimate: 560,
      paymentGuarantee: true,
      slots: 10,
      filled: 10,
      applicants: 18,
      requirements: { needsCar: false, needsTools: false, needsTeam: 0, minExperience: 0, minRating: 3.0 },
      requiredSkills: ['events'],
      status: 'completed',
      isInstant: false,
      acceptsTeams: true,
      hasEscrow: true,
      hasInsurance: true,
      workplaceRating: 4.8,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 67,
    },
    workerId: 'worker1',
    status: 'paid',
    appliedAt: new Date(Date.now() - 259200000),
    approvedAt: new Date(Date.now() - 216000000),
    startedAt: new Date(Date.now() - 172800000),
    completedAt: new Date(Date.now() - 144000000),
    paidAt: new Date(Date.now() - 86400000),
    agreedRate: 70,
    hoursWorked: 8,
    totalAmount: 560,
    workerRating: 5,
    employerRating: 5,
    paymentStatus: 'released',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function MyTasksPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { myTasks, isLoadingTasks } = useWorker()
  const { loadMyTasks, cancelApplication, showToast } = useConnectorStore()

  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [displayTasks, setDisplayTasks] = useState<TaskFlow[]>(mockTasks)

  useEffect(() => {
    loadMyTasks()
  }, [loadMyTasks])

  useEffect(() => {
    if (myTasks.length > 0) {
      setDisplayTasks(myTasks)
    }
  }, [myTasks])

  const filteredTasks = displayTasks.filter((task) => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return ['in_progress', 'approved', 'upcoming'].includes(task.status)
    if (activeTab === 'completed') return ['completed', 'paid', 'reviewed'].includes(task.status)
    if (activeTab === 'pending') return ['applied', 'reviewing'].includes(task.status)
    return true
  })

  const tabs: { id: TabFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All', icon: null },
    { id: 'active', label: 'Active', icon: <Play className="w-4 h-4" /> },
    { id: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
    { id: 'completed', label: 'Completed', icon: <CheckCircle2 className="w-4 h-4" /> },
  ]

  const handleTaskAction = async (taskId: string, action: string) => {
    const task = displayTasks.find(t => t.id === taskId)

    switch (action) {
      case 'start':
        showToast('Shift started!', 'success')
        setDisplayTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'in_progress' as const, startedAt: new Date() } : t
        ))
        break
      case 'complete':
        showToast('Shift completed!', 'success')
        setDisplayTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'completed' as const, completedAt: new Date() } : t
        ))
        break
      case 'cancel':
        if (confirm('Are you sure you want to cancel this application?')) {
          await cancelApplication(taskId)
          setDisplayTasks(prev => prev.filter(t => t.id !== taskId))
        }
        break
      case 'message':
        if (task?.shift?.employer?.phone) {
          window.open(`tel:${task.shift.employer.phone}`, '_blank')
        } else {
          showToast('Contact info not available', 'warning')
        }
        break
      case 'view':
        router.push(`/shift/${task?.shiftId}`)
        break
      case 'review':
        router.push(`/review/${taskId}`)
        break
      default:
        showToast('Action not implemented', 'info')
    }
  }

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        title="My Tasks"
        showBack
        showNotifications
      />

      {/* Tabs */}
      <div className="px-4 py-3 bg-white border-b border-neutral-100">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full',
                'text-sm font-medium whitespace-nowrap',
                'transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-4">
        {isLoadingTasks ? (
          <LoadingState variant="skeleton" />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            type="no-tasks"
            title="No tasks yet"
            subtitle="Apply to shifts to see your tasks here"
            action={{
              label: 'Browse shifts',
              onClick: () => router.push('/worker')
            }}
          />
        ) : (
          <motion.div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TaskFlowCard
                    task={task}
                    onAction={(action) => handleTaskAction(task.id, action)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
