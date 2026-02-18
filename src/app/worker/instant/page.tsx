'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Sparkles, ChevronDown, ChevronUp, MapPin, Clock } from 'lucide-react'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { cn } from '@/lib/utils'

interface MatchDetail {
  name: string
  nameKey: string
  icon: string
  matched: boolean
  weight: number
  score: number
  detail: string
}

interface InstantShiftData {
  shift: {
    id: string
    title: string
    employerName: string | null
    cityCode: string
    startTime: string
    endTime: string
    baseRate: number
    surgeMultiplier: number
    isInstant: boolean
    urgency: string
    specialization: string
    slots: number
    filled: number
  }
  match: {
    matchPercent: number
    matchDetails: MatchDetail[]
  } | null
}

export default function InstantMatchPage() {
  const { language, isRTL } = useUI()
  const [data, setData] = useState<InstantShiftData[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'matched'>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/shifts/instant')
        const json = await res.json()
        setData(json.data || [])
      } catch (e) {
        console.error('Failed to fetch instant shifts:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = tab === 'matched'
    ? data.filter(d => d.match && d.match.matchPercent >= 60)
    : data

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-neutral-200 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-bold text-neutral-900">Instant Match</h1>
        </div>
        <div className="flex gap-2">
          {(['all', 'matched'] as const).map(tabVal => (
            <button
              key={tabVal}
              onClick={() => setTab(tabVal)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                tab === tabVal ? 'bg-brand-primary text-white' : 'bg-neutral-100 text-neutral-600'
              )}
            >
              {tabVal === 'all' ? 'All Urgent' : 'Best Matches'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-32" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No instant shifts available</p>
          </div>
        ) : (
          filtered.map((item, index) => (
            <motion.div
              key={item.shift.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <SmartMatchCardInline item={item} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

function SmartMatchCardInline({ item }: { item: InstantShiftData }) {
  const [expanded, setExpanded] = useState(false)
  const { shift, match } = item
  const effectiveRate = Math.round(shift.baseRate * shift.surgeMultiplier)
  const percent = match?.matchPercent || 0

  const matchColor = percent >= 80 ? 'text-green-600 bg-green-50 border-green-200'
    : percent >= 60 ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-neutral-500 bg-neutral-50 border-neutral-200'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
      {match && (
        <div className={cn('px-4 py-2 flex items-center justify-between border-b', matchColor)}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Match {percent}%</span>
          </div>
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {shift.isInstant && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">⚡</span>
              )}
              <h3 className="font-semibold text-neutral-900 truncate">{shift.title}</h3>
            </div>
            <p className="text-sm text-neutral-500">{shift.employerName || 'Employer'}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{shift.cityCode}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{shift.startTime}–{shift.endTime}</span>
            </div>
          </div>
          <div className="text-right ml-3">
            <div className="text-lg font-bold text-brand-primary">₪{effectiveRate}</div>
            <div className="text-xs text-neutral-400">/hr</div>
          </div>
        </div>
      </div>

      {expanded && match && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-4 pb-4 border-t border-neutral-100"
        >
          <div className="pt-3 space-y-2">
            {match.matchDetails.map((criteria) => (
              <div key={criteria.name} className="flex items-center gap-3">
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-xs',
                  criteria.matched ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'
                )}>
                  {criteria.matched ? '✓' : '–'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">{criteria.name}</span>
                    <span className="text-xs text-neutral-400">{Math.round(criteria.score * 100)}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1 mt-1">
                    <div
                      className={cn('h-1 rounded-full', criteria.matched ? 'bg-green-500' : 'bg-neutral-300')}
                      style={{ width: `${criteria.score * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
