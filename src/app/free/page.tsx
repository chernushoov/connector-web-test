'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore, useFreeWorld, useAuth } from '@/store'
import { t } from '@/i18n/translations'
import { RoleTabBar, SplitMapLayout } from '@/components/shared'
import { FreeWorldMap, WorkerCard } from '@/components/free-world'
import { BottomSheet, BottomSheetContent } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SearchInput } from '@/components/ui/Input'
import { useAuthGate } from '@/hooks'
import {
  Map,
  Wifi,
  WifiOff,
  Users,
  Briefcase,
  Plus,
  Loader2,
  MapPin,
  Clock,
} from 'lucide-react'
import type { MapMarker, QuickProfile, QuickTaskDB } from '@/types'

type ViewMode = 'all' | 'tasks' | 'workers'

export default function FreeMapPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { isAuthenticated } = useAuth()
  const {
    setMode,
    requestLocation,
    loadTasks,
    toggleOnlineStatus,
  } = useConnectorStore()
  const {
    isAvailable: isOnline,
    tasks,
    isLoadingTasks,
    taskFilters,
  } = useFreeWorld()
  const { requireAuth } = useAuthGate()

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('tasks')
  const [selectedTask, setSelectedTask] = useState<QuickTaskDB | null>(null)

  useEffect(() => {
    setMode('free')
    requestLocation()
    loadTasks()
  }, [setMode, requestLocation, loadTasks])

  // Create markers from tasks
  const taskMarkers: MapMarker[] = useMemo(() =>
    tasks
      .filter((task) => task.status === 'OPEN')
      .map((task) => ({
        id: task.id,
        type: 'shift' as const,
        coordinates: { latitude: task.lat, longitude: task.lng },
        data: task,
        isAvailable: true,
        isPro: false,
      })),
    [tasks]
  )

  // Filter tasks based on search query
  const filteredTasks = useMemo(() =>
    tasks.filter((task) => {
      if (task.status !== 'OPEN') return false
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        task.title.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query) ||
        task.addressText.toLowerCase().includes(query)
      )
    }),
    [tasks, searchQuery]
  )

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    setSelectedTask(marker.data as QuickTaskDB)
  }, [])

  const handleCreateTask = useCallback(() => {
    requireAuth(
      () => router.push('/free/create'),
      { action: 'create_task' }
    )
  }, [requireAuth, router])

  const handleTaskClick = useCallback((task: QuickTaskDB) => {
    router.push(`/free/task/${task.id}`)
  }, [router])

  const formatBudget = (task: QuickTaskDB) => {
    if (task.budgetType === 'NEGOTIABLE') return 'Negotiable'
    if (task.budgetType === 'RANGE' && task.budgetMin && task.budgetMax) return `₪${task.budgetMin} - ${task.budgetMax}`
    if (task.budgetMin) return `₪${task.budgetMin}`
    return 'Not specified'
  }

  const formatSchedule = (task: QuickTaskDB) => {
    switch (task.schedule) {
      case 'NOW': return 'Now'
      case 'TODAY': return 'Today'
      case 'TOMORROW': return 'Tomorrow'
      case 'SCHEDULED':
        return task.scheduledAt
          ? new Date(task.scheduledAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
          : 'Scheduled'
      default: return ''
    }
  }

  // Map content
  const mapContent = (
    <div className="relative w-full h-full">
      <FreeWorldMap
        markers={taskMarkers}
        center={{ latitude: 32.0853, longitude: 34.7818 }}
        zoom={13}
        onMarkerClick={handleMarkerClick}
        showUserLocation
      />

      {/* Online status toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => toggleOnlineStatus()}
        className={cn(
          'absolute top-3 right-3 z-10 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-medium text-sm',
          isOnline
            ? 'bg-success text-white'
            : 'bg-white text-neutral-700'
        )}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            Offline
          </>
        )}
      </motion.button>

      {/* FAB for creating task */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCreateTask}
        className="absolute bottom-4 right-4 z-10 w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  )

  // List content
  const listContent = (
    <div className="px-4 py-4">
      <SearchInput
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <Button
          variant={viewMode === 'tasks' ? 'primary' : 'outline'}
          size="sm"
          leftIcon={<Briefcase className="w-4 h-4" />}
          onClick={() => setViewMode('tasks')}
        >
          Tasks ({filteredTasks.length})
        </Button>
      </div>

      {isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-success/10 border border-success/20 text-success p-3 rounded-xl mb-4 flex items-center gap-3"
        >
          <Wifi className="w-5 h-5" />
          <div className="flex-1">
            <p className="font-medium text-sm">You&apos;re on the map!</p>
            <p className="text-xs opacity-80">Others can see you as an executor</p>
          </div>
        </motion.div>
      )}

      {isLoadingTasks && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
        </div>
      )}

      {!isLoadingTasks && filteredTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">
            Tasks nearby
            <span className="text-sm font-normal text-neutral-500 ml-2">
              ({filteredTasks.length})
            </span>
          </h2>
          <div className="space-y-3">
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-neutral-900 truncate">
                          {task.title}
                        </span>
                        {task.schedule === 'NOW' && (
                          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded flex-shrink-0">
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {task.addressText.split(',')[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatSchedule(task)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-neutral-400 capitalize">
                          {task.category}
                        </span>
                        <span className="font-semibold text-brand-primary">
                          {formatBudget(task)}
                        </span>
                      </div>
                      {task.offersCount !== undefined && task.offersCount > 0 && (
                        <div className="mt-2 text-xs text-neutral-500">
                          {task.offersCount} offers
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!isLoadingTasks && filteredTasks.length === 0 && (
        <div className="text-center py-8">
          <Map className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
          <p className="text-neutral-500">No tasks yet</p>
          <p className="text-sm text-neutral-400 mt-1">
            Be the first — create a task!
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={handleCreateTask}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div
      className={cn('min-h-screen bg-neutral-50')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <SplitMapLayout
        mapContent={mapContent}
        listContent={listContent}
        initialSplit={35}
        minMapHeight={25}
        maxMapHeight={60}
      />

      <RoleTabBar />

      {/* Task detail sheet */}
      <BottomSheet
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
      >
        <BottomSheetContent>
          {selectedTask && (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{selectedTask.title}</h3>
              {selectedTask.description && (
                <p className="text-neutral-600 mb-3">{selectedTask.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-3">
                <MapPin className="w-4 h-4" />
                {selectedTask.addressText}
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-neutral-500 capitalize">
                  {selectedTask.category}
                </span>
                <span className="font-semibold text-lg text-brand-primary">
                  {formatBudget(selectedTask)}
                </span>
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setSelectedTask(null)
                  router.push(`/free/task/${selectedTask.id}`)
                }}
              >
                View Details
              </Button>
            </div>
          )}
        </BottomSheetContent>
      </BottomSheet>
    </div>
  )
}
