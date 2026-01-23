// ============================================
// AI Support Chat API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { AI_CONFIG, findRelevantKnowledge, formatKnowledgeContext } from '@/lib/ai'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  language?: 'ru' | 'en' | 'he'
}

export interface ChatResponse {
  message: string
  shouldEscalate: boolean
  escalationReason?: string
}

// Check if message should be escalated to human
function checkEscalation(message: string): { shouldEscalate: boolean; reason?: string } {
  const lowerMessage = message.toLowerCase()

  for (const keyword of AI_CONFIG.support.escalationKeywords) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      return {
        shouldEscalate: true,
        reason: `User requested: ${keyword}`
      }
    }
  }

  return { shouldEscalate: false }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, language = 'ru' } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      )
    }

    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      )
    }

    // Check for escalation keywords
    const escalation = checkEscalation(lastUserMessage.content)
    if (escalation.shouldEscalate) {
      const escalationResponses = {
        ru: 'Понимаю, что вам нужна помощь специалиста. Я передаю ваш запрос нашей команде поддержки. Они свяжутся с вами в ближайшее время. Вы также можете написать на support@connector.app',
        en: 'I understand you need help from a specialist. I\'m forwarding your request to our support team. They will contact you soon. You can also email support@connector.app',
        he: 'אני מבין שאתה צריך עזרה ממומחה. אני מעביר את הבקשה שלך לצוות התמיכה שלנו. הם יצרו איתך קשר בקרוב. ניתן גם לכתוב ל-support@connector.app'
      }

      return NextResponse.json({
        message: escalationResponses[language],
        shouldEscalate: true,
        escalationReason: escalation.reason
      })
    }

    // Find relevant knowledge base items
    const relevantKnowledge = findRelevantKnowledge(lastUserMessage.content, language)
    const knowledgeContext = formatKnowledgeContext(relevantKnowledge, language)

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      // Fallback to knowledge base only response
      if (relevantKnowledge.length > 0) {
        const answer = language === 'en' ? relevantKnowledge[0].answerEn :
                       language === 'he' ? relevantKnowledge[0].answerHe :
                       relevantKnowledge[0].answer
        return NextResponse.json({
          message: answer,
          shouldEscalate: false
        })
      }

      // Default response when no API key and no knowledge match
      const defaultResponses = {
        ru: 'К сожалению, я не могу найти ответ на ваш вопрос. Пожалуйста, свяжитесь с нашей командой поддержки: support@connector.app',
        en: 'Unfortunately, I cannot find an answer to your question. Please contact our support team: support@connector.app',
        he: 'לצערי, לא מצאתי תשובה לשאלתך. אנא פנה לצוות התמיכה שלנו: support@connector.app'
      }

      return NextResponse.json({
        message: defaultResponses[language],
        shouldEscalate: false
      })
    }

    // Prepare messages for OpenAI
    const systemMessage: ChatMessage = {
      role: 'system',
      content: AI_CONFIG.support.systemPrompt + knowledgeContext
    }

    // Keep only last N messages for context
    const recentMessages = messages.slice(-AI_CONFIG.support.maxHistoryMessages)

    const openaiMessages = [
      systemMessage,
      ...recentMessages
    ]

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.openai.model,
        messages: openaiMessages,
        max_tokens: AI_CONFIG.openai.maxTokens,
        temperature: AI_CONFIG.openai.temperature,
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', errorData)

      // Fallback to knowledge base
      if (relevantKnowledge.length > 0) {
        const answer = language === 'en' ? relevantKnowledge[0].answerEn :
                       language === 'he' ? relevantKnowledge[0].answerHe :
                       relevantKnowledge[0].answer
        return NextResponse.json({
          message: answer,
          shouldEscalate: false
        })
      }

      throw new Error('OpenAI API request failed')
    }

    const data = await response.json()
    const assistantMessage = data.choices?.[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response from OpenAI')
    }

    return NextResponse.json({
      message: assistantMessage,
      shouldEscalate: false
    })

  } catch (error) {
    console.error('Chat API error:', error)

    return NextResponse.json({
      message: 'Произошла ошибка. Пожалуйста, попробуйте позже или свяжитесь с support@connector.app',
      shouldEscalate: false
    }, { status: 500 })
  }
}
