// ============================================
// AI Agent - Moderation Module
// Auto-moderates shifts, profiles, and messages
// ============================================

import {
  ModerationItem,
  ModerationResult,
  TaskResult,
} from '../types'
import { AGENT_CONFIG, MODERATION_RULES } from '../config'
import { getTaskRunner } from '../task-runner'

// ============================================
// Main Moderation Functions
// ============================================

/**
 * Moderate a single item using rules + AI
 */
export async function moderateItem(item: ModerationItem): Promise<ModerationResult> {
  const runner = getTaskRunner()
  const startTime = Date.now()

  // Step 1: Apply rule-based checks first (fast, no API cost)
  const ruleResult = applyRules(item.content)

  if (ruleResult.isViolation && ruleResult.confidence >= AGENT_CONFIG.modules.moderation.autoRejectThreshold) {
    // High confidence rule match - reject without AI
    runner.log('info', 'moderation', `Rule-based rejection: ${ruleResult.reasons.join(', ')}`)
    return {
      itemId: item.id,
      ...ruleResult,
    }
  }

  // Step 2: If rules flagged something but not high confidence, use AI for final decision
  if (ruleResult.isViolation || needsAIReview(item)) {
    const aiResult = await moderateWithAI(item, ruleResult)
    return {
      itemId: item.id,
      ...aiResult,
    }
  }

  // Step 3: No issues found - approve
  return {
    itemId: item.id,
    isViolation: false,
    confidence: 95,
    reasons: [],
    action: AGENT_CONFIG.modules.moderation.autoApprove ? 'approve' : 'flag',
  }
}

/**
 * Moderate multiple items in batch
 */
export async function moderateBatch(items: ModerationItem[]): Promise<{
  results: ModerationResult[]
  taskResult: TaskResult
}> {
  const runner = getTaskRunner()
  const startTime = Date.now()

  const task = runner.createTask(
    'moderation',
    'Batch moderation',
    `Moderating ${items.length} items`,
    'high'
  )

  const results: ModerationResult[] = []
  let approved = 0
  let flagged = 0
  let rejected = 0

  for (const item of items) {
    try {
      const result = await moderateItem(item)
      results.push(result)

      switch (result.action) {
        case 'approve':
          approved++
          break
        case 'flag':
        case 'escalate':
          flagged++
          break
        case 'reject':
          rejected++
          break
      }
    } catch (error) {
      runner.log('error', 'moderation', `Failed to moderate item ${item.id}: ${error}`)
      results.push({
        itemId: item.id,
        isViolation: false,
        confidence: 0,
        reasons: ['Moderation error - flagged for manual review'],
        action: 'flag',
      })
      flagged++
    }
  }

  const duration = Date.now() - startTime
  const taskResult: TaskResult = {
    success: true,
    itemsProcessed: items.length,
    itemsFlagged: flagged,
    itemsApproved: approved,
    itemsRejected: rejected,
    duration,
  }

  runner.updateTaskStatus(task.id, 'completed', taskResult)
  runner.log('info', 'moderation',
    `Batch complete: ${approved} approved, ${flagged} flagged, ${rejected} rejected in ${duration}ms`)

  return { results, taskResult }
}

// ============================================
// Rule-Based Moderation
// ============================================

/**
 * Apply moderation rules to content
 */
function applyRules(content: string): Omit<ModerationResult, 'itemId'> {
  const violations: { reason: string; priority: number; action: ModerationResult['action'] }[] = []

  for (const rule of MODERATION_RULES) {
    const pattern = typeof rule.pattern === 'string'
      ? new RegExp(rule.pattern, 'gi')
      : rule.pattern

    if (pattern.test(content)) {
      violations.push({
        reason: rule.reason,
        priority: rule.priority,
        action: rule.action,
      })
    }
  }

  if (violations.length === 0) {
    return {
      isViolation: false,
      confidence: 0,
      reasons: [],
      action: 'approve',
    }
  }

  // Determine final action based on highest priority violation
  violations.sort((a, b) => a.priority - b.priority)
  const highestPriority = violations[0]

  // Calculate confidence based on number and priority of violations
  const confidence = Math.min(100, 50 + (violations.length * 10) + ((3 - highestPriority.priority) * 15))

  return {
    isViolation: true,
    confidence,
    reasons: violations.map(v => v.reason),
    action: highestPriority.action,
  }
}

/**
 * Check if item needs AI review (beyond rule-based)
 */
function needsAIReview(item: ModerationItem): boolean {
  // Items that should always be reviewed by AI
  if (item.type === 'message') return true // Messages need context understanding

  // Long content might contain subtle violations
  if (item.content.length > 500) return true

  // New users' first posts
  if (item.metadata?.isFirstPost) return true

  return false
}

// ============================================
// AI-Based Moderation
// ============================================

/**
 * Use AI to moderate content
 */
async function moderateWithAI(
  item: ModerationItem,
  ruleResult: Omit<ModerationResult, 'itemId'>
): Promise<Omit<ModerationResult, 'itemId'>> {
  const runner = getTaskRunner()

  // Check if API key is configured
  if (!AGENT_CONFIG.openai.apiKey) {
    runner.log('warn', 'moderation', 'No OpenAI API key - using rule-based result only')
    return ruleResult.isViolation ? ruleResult : {
      isViolation: false,
      confidence: 60,
      reasons: [],
      action: 'flag', // Flag for manual review when AI unavailable
    }
  }

  try {
    const prompt = buildModerationPrompt(item, ruleResult)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AGENT_CONFIG.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: AGENT_CONFIG.openai.model,
        messages: [
          { role: 'system', content: getModerationSystemPrompt() },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.2, // Low temperature for consistent moderation
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      throw new Error('Empty AI response')
    }

    return parseAIResponse(aiResponse, ruleResult)

  } catch (error) {
    runner.log('error', 'moderation', `AI moderation failed: ${error}`)

    // Fallback to rule-based result or flag for manual review
    if (ruleResult.isViolation) {
      return ruleResult
    }

    return {
      isViolation: false,
      confidence: 50,
      reasons: ['AI review failed - flagged for manual review'],
      action: 'flag',
    }
  }
}

/**
 * Build prompt for AI moderation
 */
function buildModerationPrompt(
  item: ModerationItem,
  ruleResult: Omit<ModerationResult, 'itemId'>
): string {
  let prompt = `Analyze this ${item.type} for content policy violations:\n\n`
  prompt += `"""${item.content}"""\n\n`

  if (ruleResult.reasons.length > 0) {
    prompt += `Rule-based checks found these potential issues:\n`
    ruleResult.reasons.forEach(r => prompt += `- ${r}\n`)
    prompt += `\n`
  }

  prompt += `Determine if this content should be:\n`
  prompt += `- APPROVE: No violations, safe to publish\n`
  prompt += `- FLAG: Needs human review (borderline cases)\n`
  prompt += `- REJECT: Clear violation, do not publish\n`
  prompt += `- ESCALATE: Serious violation, needs immediate attention\n\n`
  prompt += `Response format:\n`
  prompt += `ACTION: [approve/flag/reject/escalate]\n`
  prompt += `CONFIDENCE: [0-100]\n`
  prompt += `REASONS: [list reasons if violation, or "none" if clean]\n`

  return prompt
}

/**
 * Get system prompt for moderation AI
 */
function getModerationSystemPrompt(): string {
  return `You are a content moderation AI for Connector, a job marketplace platform in Israel.

Your job is to review shifts (job postings), worker profiles, and messages for policy violations.

VIOLATIONS TO DETECT:
1. Contact information sharing (phone numbers, emails, WhatsApp, Telegram) - trying to bypass the platform
2. Spam and duplicate content
3. Profanity and inappropriate language
4. Scams (prepayment requests, MLM, too-good-to-be-true offers)
5. Discrimination (by nationality, religion, gender, etc.)
6. Fake or misleading information
7. Unrealistic pay rates (e.g., 500₪/hour for basic work)

IMPORTANT:
- Be strict about contact sharing - this is a major policy violation
- Consider cultural context (Hebrew, Russian, Arabic content)
- Legitimate job details (addresses, company names) are OK
- When in doubt, FLAG for human review rather than reject

Respond ONLY in the specified format, nothing else.`
}

/**
 * Parse AI response into ModerationResult
 */
function parseAIResponse(
  response: string,
  ruleResult: Omit<ModerationResult, 'itemId'>
): Omit<ModerationResult, 'itemId'> {
  const lines = response.split('\n')
  let action: ModerationResult['action'] = 'flag'
  let confidence = 50
  let reasons: string[] = []

  for (const line of lines) {
    const upperLine = line.toUpperCase()

    if (upperLine.includes('ACTION:')) {
      const actionText = line.split(':')[1]?.trim().toLowerCase()
      if (['approve', 'flag', 'reject', 'escalate'].includes(actionText)) {
        action = actionText as ModerationResult['action']
      }
    }

    if (upperLine.includes('CONFIDENCE:')) {
      const confText = line.split(':')[1]?.trim()
      const parsed = parseInt(confText, 10)
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        confidence = parsed
      }
    }

    if (upperLine.includes('REASONS:')) {
      const reasonText = line.split(':')[1]?.trim()
      if (reasonText && reasonText.toLowerCase() !== 'none') {
        reasons = reasonText.split(',').map(r => r.trim()).filter(Boolean)
      }
    }
  }

  // Combine with rule-based reasons
  if (ruleResult.reasons.length > 0) {
    reasons = Array.from(new Set([...ruleResult.reasons, ...reasons]))
  }

  return {
    isViolation: action === 'reject' || action === 'escalate' || (action === 'flag' && reasons.length > 0),
    confidence,
    reasons,
    action,
  }
}

// ============================================
// Specialized Moderation Functions
// ============================================

/**
 * Moderate a shift/job posting
 */
export async function moderateShift(shift: {
  id: string
  title: string
  description: string
  requirements?: string
  hourlyRate: number
  employerId: string
  createdAt: Date
}): Promise<ModerationResult> {
  // Combine all text fields
  const content = [
    shift.title,
    shift.description,
    shift.requirements || '',
  ].join('\n\n')

  // Add metadata about the shift
  const metadata: Record<string, unknown> = {
    hourlyRate: shift.hourlyRate,
    employerId: shift.employerId,
  }

  // Check for unrealistic pay
  if (shift.hourlyRate > 200) {
    metadata.highPay = true
  }

  return moderateItem({
    id: shift.id,
    type: 'shift',
    content,
    authorId: shift.employerId,
    createdAt: shift.createdAt,
    metadata,
  })
}

/**
 * Moderate a user profile
 */
export async function moderateProfile(profile: {
  id: string
  name: string
  about?: string
  specialization?: string
  userId: string
  createdAt: Date
  isFirstPost?: boolean
}): Promise<ModerationResult> {
  const content = [
    profile.name,
    profile.about || '',
    profile.specialization || '',
  ].join('\n\n')

  return moderateItem({
    id: profile.id,
    type: 'profile',
    content,
    authorId: profile.userId,
    createdAt: profile.createdAt,
    metadata: { isFirstPost: profile.isFirstPost },
  })
}

/**
 * Moderate a chat message
 */
export async function moderateMessage(message: {
  id: string
  content: string
  senderId: string
  createdAt: Date
}): Promise<ModerationResult> {
  return moderateItem({
    id: message.id,
    type: 'message',
    content: message.content,
    authorId: message.senderId,
    createdAt: message.createdAt,
  })
}

// ============================================
// Export
// ============================================

export const ModerationModule = {
  moderateItem,
  moderateBatch,
  moderateShift,
  moderateProfile,
  moderateMessage,
  applyRules,
}
