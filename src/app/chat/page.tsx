'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, EmptyState, LoadingState } from '@/components/shared'
import {
  MessageCircle,
  Search,
  Send,
  ArrowLeft,
  Phone,
  User,
  Clock,
  Check,
  CheckCheck,
} from 'lucide-react'
import type { Language } from '@/types'

interface ChatRoom {
  id: string
  participantName: string
  participantAvatar: string | null
  participantId: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  isOnline: boolean
}

interface ChatMessage {
  id: string
  content: string
  senderId: string
  createdAt: string
  isRead: boolean
}

export default function ChatPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { showToast } = useConnectorStore()

  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadRooms()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadRooms = async () => {
    setIsLoadingRooms(true)
    try {
      const res = await fetch('/api/chat/rooms')
      if (res.ok) {
        const data = await res.json()
        setRooms(data.rooms || [])
      }
    } catch {
      // Fallback to empty
    } finally {
      setIsLoadingRooms(false)
    }
  }

  const loadMessages = async (roomId: string) => {
    setIsLoadingMessages(true)
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch {
      showToast('Failed to load messages', 'error')
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const openRoom = (room: ChatRoom) => {
    setSelectedRoom(room)
    loadMessages(room.id)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || isSending) return

    setIsSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    // Optimistic update
    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      content,
      senderId: 'me',
      createdAt: new Date().toISOString(),
      isRead: false,
    }
    setMessages(prev => [...prev, optimisticMsg])

    try {
      const res = await fetch(`/api/chat/rooms/${selectedRoom.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev =>
          prev.map(m => m.id === optimisticMsg.id ? data.message : m)
        )
      }
    } catch {
      showToast('Failed to send message', 'error')
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
      setNewMessage(content)
    } finally {
      setIsSending(false)
    }
  }

  const filteredRooms = rooms.filter(r =>
    r.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffH = diffMs / (1000 * 60 * 60)

    if (diffH < 1) return `${Math.floor(diffMs / 60000)}m`
    if (diffH < 24) return `${Math.floor(diffH)}h`
    return date.toLocaleDateString()
  }

  // Chat room view (full screen)
  if (selectedRoom) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Chat header */}
        <div className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
          <button
            onClick={() => setSelectedRoom(null)}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <ArrowLeft className={cn('w-5 h-5 text-neutral-700', isRTL && 'rotate-180')} />
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-brand-primary" />
              </div>
              {selectedRoom.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-neutral-900 truncate">{selectedRoom.participantName}</h3>
              <p className="text-xs text-neutral-500">
                {selectedRoom.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <button
            onClick={() => showToast('Calling...', 'info')}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <Phone className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {isLoadingMessages ? (
            <LoadingState variant="skeleton" />
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === 'me'
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[75%] px-4 py-2.5 rounded-2xl',
                      isMe
                        ? 'bg-brand-primary text-white rounded-br-md'
                        : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-md'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <div className={cn(
                      'flex items-center gap-1 mt-1',
                      isMe ? 'justify-end' : 'justify-start'
                    )}>
                      <span className={cn('text-[10px]', isMe ? 'text-white/60' : 'text-neutral-400')}>
                        {formatTime(msg.createdAt)}
                      </span>
                      {isMe && (
                        msg.isRead
                          ? <CheckCheck className="w-3 h-3 text-white/60" />
                          : <Check className="w-3 h-3 text-white/60" />
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-neutral-200 px-4 py-3 flex items-center gap-3">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-neutral-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className={cn(
              'p-2.5 rounded-full transition-all',
              newMessage.trim()
                ? 'bg-brand-primary text-white hover:bg-brand-primary/90'
                : 'bg-neutral-100 text-neutral-400'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  // Rooms list view
  return (
    <div className="min-h-screen bg-neutral-50 pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header title={t('nav.messages', language as Language) || 'Messages'} showBack showNotifications />

      {/* Search */}
      <div className="px-4 py-3 bg-white border-b border-neutral-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
        </div>
      </div>

      <main className="px-4 py-4">
        {isLoadingRooms ? (
          <LoadingState variant="skeleton" />
        ) : filteredRooms.length === 0 ? (
          <EmptyState
            type="no-results"
            title="No conversations"
            subtitle="Messages with employers and workers will appear here"
            icon={<MessageCircle className="w-16 h-16 text-neutral-300" />}
          />
        ) : (
          <div className="space-y-1">
            {filteredRooms.map((room) => (
              <motion.button
                key={room.id}
                onClick={() => openRoom(room)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white transition-colors text-left"
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-brand-primary" />
                  </div>
                  {room.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-neutral-50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-900 truncate">{room.participantName}</h3>
                    <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">
                      {formatTime(room.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm text-neutral-500 truncate">{room.lastMessage}</p>
                    {room.unreadCount > 0 && (
                      <span className="flex-shrink-0 ml-2 bg-brand-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
