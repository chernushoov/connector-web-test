// ============================================
// AI Content Moderation API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { AI_CONFIG } from '@/lib/ai'

export interface ModerationRequest {
  content: string
  type: 'shift' | 'profile' | 'review' | 'message'
  metadata?: {
    title?: string
    rate?: number
    userId?: string
  }
}

export interface ModerationResult {
  isViolation: boolean
  confidence: number
  reasons: string[]
  action: 'approve' | 'flag' | 'reject'
  details?: {
    hasContactInfo: boolean
    hasProfanity: boolean
    isSpam: boolean
    isSuspiciousRate: boolean
    categories: string[]
  }
}

// Quick rule-based checks (fast, no API needed)
function quickModeration(content: string, type: string, metadata?: ModerationRequest['metadata']): Partial<ModerationResult> {
  const reasons: string[] = []
  const details = {
    hasContactInfo: false,
    hasProfanity: false,
    isSpam: false,
    isSuspiciousRate: false,
    categories: [] as string[],
  }

  const contentLower = content.toLowerCase()

  // Check for contact information
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}/g
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const telegramRegex = /@[a-zA-Z][a-zA-Z0-9_]{4,}/g
  const whatsappRegex = /whatsapp|вотсап|ватсап|вотс\s*ап/gi

  if (phoneRegex.test(content) || emailRegex.test(content) || telegramRegex.test(content) || whatsappRegex.test(content)) {
    reasons.push('Contains contact information')
    details.hasContactInfo = true
    details.categories.push('contact_info')
  }

  // Check for profanity (basic list)
  const profanityPatterns = [
    /бля[дть]?/gi, /хуй/gi, /пизд/gi, /ебат/gi, /сук[аи]/gi,
    /fuck/gi, /shit/gi, /bitch/gi, /asshole/gi,
    /זונה/g, /כוס/g, // Hebrew profanity
  ]

  for (const pattern of profanityPatterns) {
    if (pattern.test(content)) {
      reasons.push('Contains inappropriate language')
      details.hasProfanity = true
      details.categories.push('profanity')
      break
    }
  }

  // Check for spam patterns
  const spamPatterns = [
    /зарабо(тай|ток)/gi, /лёгкие деньги/gi, /пассивный доход/gi,
    /работа на дому.*без опыта/gi, /млм|mlm|сетевой маркетинг/gi,
    /earn money fast/gi, /work from home.*no experience/gi,
    /make \$\d+/gi, /easy money/gi,
    /казино|casino|ставки|betting/gi,
    /криптовалют|crypto|bitcoin|btc/gi,
  ]

  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      reasons.push('Potential spam or scam content')
      details.isSpam = true
      details.categories.push('spam')
      break
    }
  }

  // Check for suspicious payment rate (only for shifts)
  if (type === 'shift' && metadata?.rate) {
    // In Israel, minimum wage is ~30 ILS/hour, suspicious if >200 ILS/hour
    if (metadata.rate > 200) {
      reasons.push('Unusually high payment rate')
      details.isSuspiciousRate = true
      details.categories.push('suspicious_rate')
    }
  }

  // Check for discrimination patterns
  const discriminationPatterns = [
    /только (мужчин|женщин|русск|араб)/gi,
    /men only|women only/gi,
    /no (arabs|russians|jews)/gi,
    /без (арабов|русских)/gi,
  ]

  for (const pattern of discriminationPatterns) {
    if (pattern.test(content)) {
      reasons.push('Contains potentially discriminatory content')
      details.categories.push('discrimination')
      break
    }
  }

  return { reasons, details }
}

// Determine action based on quick moderation results
function determineAction(quickResult: Partial<ModerationResult>): ModerationResult {
  const { reasons = [], details } = quickResult

  // High severity - auto reject
  if (details?.hasProfanity || details?.isSpam) {
    return {
      isViolation: true,
      confidence: 95,
      reasons,
      action: 'reject',
      details,
    }
  }

  // Medium severity - flag for human review
  if (reasons.length > 0) {
    return {
      isViolation: true,
      confidence: 80,
      reasons,
      action: 'flag',
      details,
    }
  }

  // No issues found
  return {
    isViolation: false,
    confidence: 90,
    reasons: [],
    action: 'approve',
    details,
  }
}

// AI-powered moderation (for complex cases)
async function aiModeration(content: string, type: string, quickResult: Partial<ModerationResult>): Promise<ModerationResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    // Fall back to quick moderation only
    return determineAction(quickResult)
  }

  try {
    const prompt = `Проверь следующий контент на нарушения правил платформы:

Тип контента: ${type}
Контент: "${content}"

Предварительная проверка выявила: ${quickResult.reasons?.join(', ') || 'ничего'}

${AI_CONFIG.moderation.systemPrompt}

Ответь ТОЛЬКО в формате JSON без markdown.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.3, // Lower temperature for more consistent results
      }),
    })

    if (!response.ok) {
      console.error('OpenAI moderation API error')
      return determineAction(quickResult)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      return determineAction(quickResult)
    }

    // Parse AI response
    try {
      // Remove potential markdown code blocks
      const cleanJson = aiResponse.replace(/```json\n?|\n?```/g, '').trim()
      const aiResult = JSON.parse(cleanJson) as ModerationResult

      // Merge with quick moderation details
      const mergedDetails = {
        hasContactInfo: quickResult.details?.hasContactInfo || aiResult.details?.hasContactInfo || false,
        hasProfanity: quickResult.details?.hasProfanity || aiResult.details?.hasProfanity || false,
        isSpam: quickResult.details?.isSpam || aiResult.details?.isSpam || false,
        isSuspiciousRate: quickResult.details?.isSuspiciousRate || aiResult.details?.isSuspiciousRate || false,
        categories: [...(quickResult.details?.categories || []), ...(aiResult.details?.categories || [])],
      }

      return {
        ...aiResult,
        details: mergedDetails,
      }
    } catch (parseError) {
      console.error('Failed to parse AI moderation response:', parseError)
      return determineAction(quickResult)
    }

  } catch (error) {
    console.error('AI moderation error:', error)
    return determineAction(quickResult)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ModerationRequest = await request.json()
    const { content, type, metadata } = body

    if (!content || !type) {
      return NextResponse.json(
        { error: 'Content and type are required' },
        { status: 400 }
      )
    }

    // Quick rule-based moderation
    const quickResult = quickModeration(content, type, metadata)

    // If quick moderation found clear violations, return immediately
    if (quickResult.details?.hasProfanity || quickResult.details?.isSpam) {
      return NextResponse.json(determineAction(quickResult))
    }

    // For ambiguous cases, use AI moderation
    if ((quickResult.reasons?.length ?? 0) > 0) {
      const aiResult = await aiModeration(content, type, quickResult)
      return NextResponse.json(aiResult)
    }

    // Content looks clean
    return NextResponse.json(determineAction(quickResult))

  } catch (error) {
    console.error('Moderation API error:', error)
    return NextResponse.json(
      { error: 'Moderation failed' },
      { status: 500 }
    )
  }
}
