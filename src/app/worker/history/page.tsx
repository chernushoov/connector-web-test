'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, DollarSign, Star, TrendingUp, MapPin } from 'lucide-react'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { cn } from '@/lib/utils'

interface WorkerStats {
  totalEarned: number
  totalHours: number
  totalShifts: number
  avgRating: number
  activeTasks: number
}

export default function WorkerHistoryPage() {
  const { language, isRTL } = useUI()
  const [stats, setStats] = useState<WorkerStats | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/worker/stats').then(r => r.json()),
      fetch('/api/worker/history').then(r => r.json()),
    ]).then(([statsRes, historyRes]) => {
      setStats(statsRes.data)
      setHistory(historyRes.data || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-neutral-900">{t('tabs.history', language)}</h1>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="px-4 py-3 grid grid-cols-2 gap-3">
          <StatCard icon={<DollarSign className="w-5 h-5 text-green-600" />} label="Earned" value={`₪${stats.totalEarned}`} color="bg-green-50" />
          <StatCard icon={<Clock className="w-5 h-5 text-blue-600" />} label="Hours" value={`${stats.totalHours}`} color="bg-blue-50" />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-purple-600" />} label="Shifts" value={`${stats.totalShifts}`} color="bg-purple-50" />
          <StatCard icon={<Star className="w-5 h-5 text-amber-600" />} label="Rating" value={`${stats.avgRating}★`} color="bg-amber-50" />
        </div>
      )}

      {/* Completed Shifts */}
      <div className="px-4 py-3">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">Completed Shifts</h2>
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-24" />
            ))
          ) : history.length === 0 ? (
            <p className="text-center text-neutral-400 py-10">No completed shifts yet</p>
          ) : (
            history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{item.shift?.title}</h3>
                    <p className="text-sm text-neutral-500">{item.shift?.employerName}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                      <MapPin className="w-3 h-3" />
                      <span>{item.shift?.cityCode}</span>
                      <span>•</span>
                      <span>{item.shift?.startTime}–{item.shift?.endTime}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ₪{item.totalAmount || Math.round((item.hoursWorked || 8) * item.agreedRate)}
                    </div>
                    {item.employerRating && (
                      <div className="text-xs text-amber-600">{item.employerRating}★</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className={cn('rounded-2xl p-4', color)}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className="text-2xl font-bold text-neutral-900">{value}</div>
      <div className="text-xs text-neutral-500 mt-0.5">{label}</div>
    </div>
  )
}
