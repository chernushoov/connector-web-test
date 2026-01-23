// ============================================
// Support Chat Store
// ============================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isEscalated?: boolean
}

interface SupportState {
  // Chat state
  messages: ChatMessage[]
  isOpen: boolean
  isLoading: boolean
  isMinimized: boolean

  // User info
  userEmail?: string
  userName?: string

  // Escalation
  isEscalated: boolean
  escalationReason?: string

  // Settings
  language: 'ru' | 'en' | 'he'
}

interface SupportActions {
  // Chat actions
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  minimizeChat: () => void
  maximizeChat: () => void

  // Message actions
  sendMessage: (content: string) => Promise<void>
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearMessages: () => void

  // User actions
  setUserInfo: (name?: string, email?: string) => void

  // Settings
  setLanguage: (language: 'ru' | 'en' | 'he') => void
}

type SupportStore = SupportState & SupportActions

const generateId = () => Math.random().toString(36).substring(2, 9)

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: 'Привет! 👋 Я AI-ассистент Connector. Чем могу помочь?\n\nHi! I\'m Connector\'s AI assistant. How can I help you?',
    timestamp: new Date(),
  }
]

export const useSupportStore = create<SupportStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      messages: initialMessages,
      isOpen: false,
      isLoading: false,
      isMinimized: false,
      isEscalated: false,
      language: 'ru',

      // Chat actions
      openChat: () => set((state) => {
        state.isOpen = true
        state.isMinimized = false
      }),

      closeChat: () => set((state) => {
        state.isOpen = false
      }),

      toggleChat: () => set((state) => {
        state.isOpen = !state.isOpen
        if (state.isOpen) {
          state.isMinimized = false
        }
      }),

      minimizeChat: () => set((state) => {
        state.isMinimized = true
      }),

      maximizeChat: () => set((state) => {
        state.isMinimized = false
      }),

      // Message actions
      addMessage: (message) => set((state) => {
        state.messages.push({
          ...message,
          id: generateId(),
          timestamp: new Date(),
        })
      }),

      sendMessage: async (content: string) => {
        const { messages, language, addMessage } = get()

        // Add user message
        addMessage({ role: 'user', content })

        set((state) => {
          state.isLoading = true
        })

        try {
          // Prepare messages for API (convert to simple format)
          const apiMessages = messages
            .slice(-10) // Last 10 messages for context
            .map(m => ({
              role: m.role,
              content: m.content,
            }))

          // Add current message
          apiMessages.push({ role: 'user' as const, content })

          // Call chat API
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: apiMessages,
              language,
            }),
          })

          const data = await response.json()

          // Add assistant response
          addMessage({
            role: 'assistant',
            content: data.message,
            isEscalated: data.shouldEscalate,
          })

          // Handle escalation
          if (data.shouldEscalate) {
            set((state) => {
              state.isEscalated = true
              state.escalationReason = data.escalationReason
            })
          }

        } catch (error) {
          console.error('Failed to send message:', error)

          // Add error message
          addMessage({
            role: 'assistant',
            content: language === 'ru'
              ? 'Извините, произошла ошибка. Попробуйте ещё раз или напишите на support@connector.app'
              : language === 'he'
              ? 'סליחה, אירעה שגיאה. נסה שוב או כתוב ל-support@connector.app'
              : 'Sorry, an error occurred. Please try again or email support@connector.app',
          })
        } finally {
          set((state) => {
            state.isLoading = false
          })
        }
      },

      clearMessages: () => set((state) => {
        state.messages = initialMessages
        state.isEscalated = false
        state.escalationReason = undefined
      }),

      // User actions
      setUserInfo: (name, email) => set((state) => {
        state.userName = name
        state.userEmail = email
      }),

      // Settings
      setLanguage: (language) => set((state) => {
        state.language = language
      }),
    })),
    {
      name: 'connector-support-chat',
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Keep last 50 messages
        language: state.language,
        userName: state.userName,
        userEmail: state.userEmail,
      }),
    }
  )
)

// Selector hooks
export const useChatMessages = () => useSupportStore((state) => state.messages)
export const useChatOpen = () => useSupportStore((state) => state.isOpen)
export const useChatLoading = () => useSupportStore((state) => state.isLoading)
