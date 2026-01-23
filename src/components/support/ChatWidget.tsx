'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Loader2,
  Phone,
} from 'lucide-react'
import { useSupportStore } from '@/store/support'
import { useUI } from '@/store'

export function ChatWidget() {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    messages,
    isOpen,
    isLoading,
    isMinimized,
    isEscalated,
    openChat,
    closeChat,
    toggleChat,
    minimizeChat,
    maximizeChat,
    sendMessage,
    language,
    setLanguage,
  } = useSupportStore()

  const { language: appLanguage } = useUI()

  // Sync language with app language
  useEffect(() => {
    if (appLanguage && appLanguage !== language) {
      setLanguage(appLanguage as 'ru' | 'en' | 'he')
    }
  }, [appLanguage, language, setLanguage])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const message = inputValue.trim()
    setInputValue('')
    await sendMessage(message)
  }

  const t = {
    ru: {
      title: 'Поддержка',
      subtitle: 'AI-ассистент',
      placeholder: 'Введите сообщение...',
      escalated: 'Запрос передан команде поддержки',
      callSupport: 'Позвонить в поддержку',
    },
    en: {
      title: 'Support',
      subtitle: 'AI Assistant',
      placeholder: 'Type a message...',
      escalated: 'Request forwarded to support team',
      callSupport: 'Call support',
    },
    he: {
      title: 'תמיכה',
      subtitle: 'עוזר AI',
      placeholder: 'הקלד הודעה...',
      escalated: 'הבקשה הועברה לצוות התמיכה',
      callSupport: 'התקשר לתמיכה',
    },
  }[language]

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(
      language === 'ru' ? 'ru-RU' : language === 'he' ? 'he-IL' : 'en-US',
      { hour: '2-digit', minute: '2-digit' }
    )
  }

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={openChat}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-primary/90 transition-colors"
            aria-label="Open support chat"
          >
            <MessageCircle className="w-6 h-6" />
            {/* Notification dot */}
            <span className="absolute top-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : '500px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 z-50 w-[360px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-neutral-200 ${
              language === 'he' ? 'rtl' : 'ltr'
            }`}
          >
            {/* Header */}
            <div className="bg-brand-primary text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="text-xs text-white/80">{t.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={isMinimized ? maximizeChat : minimizeChat}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={closeChat}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Escalation Banner */}
            {isEscalated && !isMinimized && (
              <div className="bg-warning/10 border-b border-warning/20 px-4 py-2">
                <div className="flex items-center gap-2 text-sm text-warning-dark">
                  <Phone className="w-4 h-4" />
                  <span>{t.escalated}</span>
                </div>
              </div>
            )}

            {/* Messages */}
            {!isMinimized && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[85%] ${
                        message.role === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user'
                            ? 'bg-brand-primary text-white'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>

                      {/* Message bubble */}
                      <div
                        className={`px-4 py-2.5 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-brand-primary text-white rounded-br-md'
                            : 'bg-white text-neutral-800 shadow-sm border border-neutral-100 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            message.role === 'user'
                              ? 'text-white/60'
                              : 'text-neutral-400'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-neutral-600" />
                    </div>
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-neutral-100">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input */}
            {!isMinimized && (
              <form
                onSubmit={handleSubmit}
                className="p-3 bg-white border-t border-neutral-100"
              >
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={t.placeholder}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-neutral-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
