'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore } from '@/store'
import { Header, Navigation, EmptyState, LoadingState } from '@/components/shared'
import { Button } from '@/components/ui/Button'
import {
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle2,
  Search,
  ChevronRight,
  ArrowLeft,
  Send,
  Shield,
  AlertCircle,
  XCircle,
  User,
  Briefcase,
  Scale,
} from 'lucide-react'
import type { Language } from '@/types'

interface Dispute {
  id: string
  type: 'payment' | 'quality' | 'no_show' | 'harassment' | 'other'
  status: 'open' | 'investigating' | 'resolved' | 'escalated'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  shiftTitle: string
  initiatorName: string
  respondentName: string
  description: string
  resolution?: {
    outcome: string
    description: string
    refundAmount?: number
  }
  messagesCount: number
  createdAt: string
  updatedAt: string
}

interface DisputeDetail extends Dispute {
  initiatorRole: 'worker' | 'employer'
  evidence: string[]
  messages: DisputeMessage[]
}

interface DisputeMessage {
  id: string
  authorId: string
  authorName: string
  authorRole: 'worker' | 'employer' | 'admin'
  content: string
  attachments: string[]
  createdAt: string
}

type FilterStatus = 'all' | 'open' | 'investigating' | 'escalated' | 'resolved'

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  open: { label: 'Open', color: 'bg-amber-100 text-amber-700', icon: Clock },
  investigating: { label: 'Investigating', color: 'bg-blue-100 text-blue-700', icon: Search },
  escalated: { label: 'Escalated', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
}

const typeLabels: Record<string, string> = {
  payment: 'Payment',
  quality: 'Quality',
  no_show: 'No Show',
  harassment: 'Harassment',
  other: 'Other',
}

const priorityColors: Record<string, string> = {
  low: 'text-neutral-500',
  medium: 'text-amber-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
}

export default function DisputesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, isRTL } = useUI()
  const { showToast } = useConnectorStore()

  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')

  // Detail view
  const [selectedDispute, setSelectedDispute] = useState<DisputeDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadDisputes()
  }, [filter])

  useEffect(() => {
    // If coming from escrow page with escrow_id, could pre-fill a dispute form
    const escrowId = searchParams.get('escrow_id')
    if (escrowId) {
      showToast('Create a dispute for this escrow payment', 'info')
    }
  }, [searchParams, showToast])

  useEffect(() => {
    if (selectedDispute) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedDispute?.messages.length])

  const loadDisputes = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter)
      const res = await fetch(`/api/disputes?${params}`)
      if (res.ok) {
        const data = await res.json()
        setDisputes(data.disputes || [])
      }
    } catch {
      // empty
    } finally {
      setIsLoading(false)
    }
  }

  const openDispute = async (id: string) => {
    setIsLoadingDetail(true)
    try {
      const [disputeRes, messagesRes] = await Promise.all([
        fetch(`/api/disputes/${id}`),
        fetch(`/api/disputes/${id}/messages`),
      ])
      if (disputeRes.ok) {
        const disputeData = await disputeRes.json()
        const messagesData = messagesRes.ok ? await messagesRes.json() : { messages: [] }
        setSelectedDispute({
          ...disputeData.dispute,
          messages: messagesData.messages || [],
        })
      }
    } catch {
      showToast('Failed to load dispute', 'error')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedDispute || isSending) return
    setIsSending(true)
    try {
      const res = await fetch(`/api/disputes/${selectedDispute.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setSelectedDispute(prev =>
          prev ? { ...prev, messages: [...prev.messages, data.message] } : null
        )
        setNewMessage('')
      }
    } catch {
      showToast('Failed to send message', 'error')
    } finally {
      setIsSending(false)
    }
  }

  const escalateDispute = async () => {
    if (!selectedDispute) return
    if (!confirm('Escalate this dispute to urgent priority?')) return
    try {
      const res = await fetch(`/api/disputes/${selectedDispute.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'escalate' }),
      })
      if (res.ok) {
        showToast('Dispute escalated', 'success')
        setSelectedDispute(prev =>
          prev ? { ...prev, status: 'escalated', priority: 'urgent' } : null
        )
      }
    } catch {
      showToast('Failed to escalate', 'error')
    }
  }

  const cancelDispute = async () => {
    if (!selectedDispute) return
    if (!confirm('Cancel this dispute? This action cannot be undone.')) return
    try {
      const res = await fetch(`/api/disputes/${selectedDispute.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      if (res.ok) {
        showToast('Dispute cancelled', 'success')
        setSelectedDispute(null)
        loadDisputes()
      }
    } catch {
      showToast('Failed to cancel', 'error')
    }
  }

  // Detail view
  if (selectedDispute || isLoadingDetail) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Detail Header */}
        <div className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSelectedDispute(null)}
            className="p-1.5 hover:bg-neutral-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-neutral-900 truncate">
              {selectedDispute ? `Dispute #${selectedDispute.id.slice(0, 8)}` : 'Loading...'}
            </h1>
            {selectedDispute && (
              <p className="text-xs text-neutral-500">
                {typeLabels[selectedDispute.type]} &middot; {statusConfig[selectedDispute.status]?.label}
              </p>
            )}
          </div>
          {selectedDispute && selectedDispute.status !== 'resolved' && (
            <div className="flex gap-1">
              {selectedDispute.status !== 'escalated' && (
                <button
                  onClick={escalateDispute}
                  className="p-2 hover:bg-red-50 rounded-full"
                  title="Escalate"
                >
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </button>
              )}
              <button
                onClick={cancelDispute}
                className="p-2 hover:bg-neutral-100 rounded-full"
                title="Cancel dispute"
              >
                <XCircle className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          )}
        </div>

        {isLoadingDetail ? (
          <div className="flex-1 px-4 py-8">
            <LoadingState variant="skeleton" />
          </div>
        ) : selectedDispute ? (
          <>
            {/* Dispute info */}
            <div className="px-4 py-3 bg-white border-b border-neutral-100">
              <h3 className="font-medium text-neutral-900 mb-1">{selectedDispute.shiftTitle}</h3>
              <p className="text-sm text-neutral-600 mb-2">{selectedDispute.description}</p>
              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium',
                  statusConfig[selectedDispute.status]?.color
                )}>
                  {statusConfig[selectedDispute.status]?.label}
                </span>
                <span className={priorityColors[selectedDispute.priority]}>
                  {selectedDispute.priority.toUpperCase()}
                </span>
                <span>{new Date(selectedDispute.createdAt).toLocaleDateString()}</span>
              </div>

              {selectedDispute.resolution && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Resolution</span>
                  </div>
                  <p className="text-sm text-green-700">{selectedDispute.resolution.description}</p>
                  {selectedDispute.resolution.refundAmount != null && selectedDispute.resolution.refundAmount > 0 && (
                    <p className="text-sm font-medium text-green-800 mt-1">
                      Refund: {selectedDispute.resolution.refundAmount} ILS
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {selectedDispute.messages.length === 0 ? (
                <p className="text-center text-sm text-neutral-400 py-8">No messages yet</p>
              ) : (
                selectedDispute.messages.map((msg) => {
                  const isAdmin = msg.authorRole === 'admin'
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'max-w-[85%] rounded-2xl p-3',
                        isAdmin
                          ? 'mx-auto bg-amber-50 border border-amber-200 max-w-[95%]'
                          : msg.authorRole === 'worker'
                            ? 'bg-white border border-neutral-200'
                            : 'bg-brand-primary/10 ml-auto'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {isAdmin ? (
                          <Shield className="w-3.5 h-3.5 text-amber-600" />
                        ) : msg.authorRole === 'worker' ? (
                          <User className="w-3.5 h-3.5 text-neutral-500" />
                        ) : (
                          <Briefcase className="w-3.5 h-3.5 text-brand-primary" />
                        )}
                        <span className={cn(
                          'text-xs font-medium',
                          isAdmin ? 'text-amber-700' : 'text-neutral-600'
                        )}>
                          {isAdmin ? 'Admin' : msg.authorName}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-800">{msg.content}</p>
                    </motion.div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            {selectedDispute.status !== 'resolved' && (
              <div className="bg-white border-t border-neutral-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-neutral-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary/30"
                    disabled={isSending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className={cn(
                      'p-2.5 rounded-full transition-colors',
                      newMessage.trim()
                        ? 'bg-brand-primary text-white'
                        : 'bg-neutral-100 text-neutral-400'
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    )
  }

  // List view
  const filteredDisputes = disputes
  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'investigating', label: 'In Review' },
    { key: 'escalated', label: 'Escalated' },
    { key: 'resolved', label: 'Resolved' },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header title="My Disputes" showBack showNotifications />

      {/* Filter tabs */}
      <div className="px-4 py-3 bg-white border-b border-neutral-100">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                filter === tab.key
                  ? 'bg-brand-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-4">
        {isLoading ? (
          <LoadingState variant="skeleton" />
        ) : filteredDisputes.length === 0 ? (
          <EmptyState
            type="no-results"
            title="No disputes"
            subtitle="Disputes you open or receive will appear here"
            icon={<Shield className="w-16 h-16 text-neutral-300" />}
          />
        ) : (
          <motion.div className="space-y-3">
            {filteredDisputes.map((dispute, i) => {
              const config = statusConfig[dispute.status]
              const StatusIcon = config?.icon || Clock
              return (
                <motion.div
                  key={dispute.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => openDispute(dispute.id)}
                  className="bg-white rounded-2xl border border-neutral-200 p-4 cursor-pointer hover:border-neutral-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-neutral-900">{dispute.shiftTitle}</h3>
                      <p className="text-sm text-neutral-500">
                        vs {dispute.respondentName}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400 mt-0.5" />
                  </div>

                  <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                    {dispute.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                        config?.color
                      )}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config?.label}
                      </span>
                      <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                        {typeLabels[dispute.type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      {dispute.messagesCount > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {dispute.messagesCount}
                        </span>
                      )}
                      <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
