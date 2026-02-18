'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore, useFreeWorld, useAuth } from '@/store'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  ArrowLeft,
  Send,
  User,
  Loader2,
} from 'lucide-react'
import type { Message } from '@/types'

interface Props {
  params: Promise<{ threadId: string }>
}

export default function ChatPage({ params }: Props) {
  const { threadId } = use(params)
  const router = useRouter()
  const { isRTL } = useUI()
  const { userId } = useAuth()
  const { loadMessages, sendMessage, markMessagesRead } = useConnectorStore() as any
  const { messages, activeThread, isLoadingChat } = useFreeWorld() as any
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const threadMessages = messages?.[threadId] || []

  // Load messages on mount
  useEffect(() => {
    loadMessages?.(threadId)
    markMessagesRead?.(threadId)
  }, [threadId, loadMessages, markMessagesRead])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadMessages])

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const text = newMessage.trim()
    setNewMessage('')

    try {
      await sendMessage?.(threadId, text)
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    return d.toLocaleDateString('en', { day: 'numeric', month: 'long' })
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = []
  let currentDate = ''

  threadMessages.forEach((msg: Message) => {
    const msgDate = formatDate(msg.createdAt)
    if (msgDate !== currentDate) {
      currentDate = msgDate
      groupedMessages.push({ date: msgDate, messages: [] })
    }
    groupedMessages[groupedMessages.length - 1].messages.push(msg)
  })

  return (
    <div
      className={cn('flex flex-col h-screen bg-neutral-50')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b flex items-center gap-3 shrink-0">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-neutral-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-brand-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-neutral-900 truncate">
            {activeThread?.task?.title || 'Chat'}
          </h1>
          <p className="text-xs text-neutral-500">
            {activeThread ? 'Task discussion' : 'Loading...'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoadingChat && threadMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        ) : threadMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neutral-400">
            <p>No messages. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <span className="px-3 py-1 bg-neutral-200/60 rounded-full text-xs text-neutral-500">
                    {group.date}
                  </span>
                </div>

                {/* Messages */}
                <div className="space-y-2">
                  {group.messages.map((msg, msgIndex) => {
                    const isOwn = msg.senderId === userId
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: msgIndex * 0.02 }}
                        className={cn(
                          'flex',
                          isOwn ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] px-4 py-2 rounded-2xl',
                            isOwn
                              ? 'bg-brand-primary text-white rounded-br-md'
                              : 'bg-white border rounded-bl-md'
                          )}
                        >
                          {!isOwn && msg.sender?.name && (
                            <p className="text-xs font-medium text-brand-primary mb-1">
                              {msg.sender.name}
                            </p>
                          )}
                          <p className={cn(
                            'text-sm whitespace-pre-wrap break-words',
                            isOwn ? 'text-white' : 'text-neutral-900'
                          )}>
                            {msg.text}
                          </p>
                          <p className={cn(
                            'text-xs mt-1',
                            isOwn ? 'text-white/70' : 'text-neutral-400'
                          )}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="shrink-0"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
