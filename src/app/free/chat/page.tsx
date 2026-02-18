'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore, useFreeWorld, useAuth } from '@/store'
import { t } from '@/i18n/translations'
import { RoleTabBar } from '@/components/shared'
import { Card } from '@/components/ui/Card'
import { SearchInput } from '@/components/ui/Input'
import {
  MessageCircle,
  User,
  Loader2,
  Search,
} from 'lucide-react'
import type { ChatThread } from '@/types'

export default function ChatListPage() {
  const router = useRouter()
  const { language, isRTL } = useUI()
  const { userId } = useAuth()
  const { loadChatThreads, setActiveThread } = useConnectorStore()
  const { chatThreads, isLoadingChat } = useFreeWorld() as any

  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadChatThreads?.()
  }, [loadChatThreads])

  const threads = chatThreads || []

  // Filter threads by search
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads
    const q = searchQuery.toLowerCase()
    return threads.filter((thread: ChatThread) => {
      const otherName = getOtherParticipantName(thread, userId)
      const taskTitle = thread.task?.title || ''
      const lastMsg = thread.lastMessage?.text || ''
      return (
        otherName.toLowerCase().includes(q) ||
        taskTitle.toLowerCase().includes(q) ||
        lastMsg.toLowerCase().includes(q)
      )
    })
  }, [threads, searchQuery, userId])

  const handleThreadClick = (thread: ChatThread) => {
    setActiveThread?.(thread)
    router.push(`/free/chat/${thread.id}`)
  }

  const totalUnread = threads.reduce((sum: number, t: ChatThread) => sum + (t.unreadCount || 0), 0)

  return (
    <div
      className={cn('min-h-screen bg-neutral-50 pb-20')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-neutral-900">
            {t('tabs.chat', language)}
          </h1>
          {totalUnread > 0 && (
            <span className="px-2.5 py-0.5 bg-brand-primary text-white text-sm font-medium rounded-full">
              {totalUnread}
            </span>
          )}
        </div>

        {/* Search */}
        <SearchInput
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Loading */}
        {isLoadingChat && threads.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        )}

        {/* Empty state */}
        {!isLoadingChat && filteredThreads.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-neutral-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              No conversations yet
            </h2>
            <p className="text-neutral-500 text-sm max-w-xs mx-auto">
              Start a conversation by responding to a task
            </p>
          </div>
        )}

        {/* Thread list */}
        {filteredThreads.length > 0 && (
          <div className="space-y-2">
            {filteredThreads.map((thread: ChatThread, index: number) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                userId={userId}
                index={index}
                language={language}
                onClick={() => handleThreadClick(thread)}
              />
            ))}
          </div>
        )}
      </div>

      <RoleTabBar />
    </div>
  )
}

// Thread Card

function ThreadCard({
  thread,
  userId,
  index,
  language,
  onClick,
}: {
  thread: ChatThread
  userId: string | null
  index: number
  language: string
  onClick: () => void
}) {
  const otherName = getOtherParticipantName(thread, userId)
  const lastMessage = thread.lastMessage
  const unread = thread.unreadCount || 0
  const isOwn = lastMessage?.senderId === userId

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
            unread > 0 ? "bg-brand-primary/10" : "bg-neutral-100"
          )}>
            <span className={cn(
              "text-lg font-bold",
              unread > 0 ? "text-brand-primary" : "text-neutral-400"
            )}>
              {otherName.charAt(0).toUpperCase() || '?'}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className={cn(
                "font-semibold text-neutral-900 truncate",
                unread > 0 && "text-neutral-900"
              )}>
                {otherName}
              </span>
              <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">
                {formatThreadDate(thread.lastMessageAt || thread.createdAt, language)}
              </span>
            </div>

            {/* Task title */}
            {thread.task?.title && (
              <p className="text-xs text-brand-primary truncate mb-0.5">
                {thread.task.title}
              </p>
            )}

            {/* Last message */}
            <div className="flex items-center justify-between">
              <p className={cn(
                "text-sm truncate",
                unread > 0 ? "text-neutral-900 font-medium" : "text-neutral-500"
              )}>
                {isOwn && lastMessage ? 'You: ' : ''}
                {lastMessage?.text || 'No messages'}
              </p>

              {/* Unread badge */}
              {unread > 0 && (
                <span className="ml-2 flex-shrink-0 w-5 h-5 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Helpers

function getOtherParticipantName(thread: ChatThread, userId: string | null): string {
  if (thread.participantAId === userId) {
    return thread.participantB?.name || 'User'
  }
  return thread.participantA?.name || 'User'
}

function formatThreadDate(date: Date | string | undefined, language: string): string {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString(language === 'he' ? 'he-IL' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }

  return d.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
    day: 'numeric',
    month: 'short',
  })
}
