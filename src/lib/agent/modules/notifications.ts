// ============================================
// AI Agent - Notifications Module
// Sends push, email, and SMS notifications
// ============================================

import {
  NotificationPayload,
  NotificationResult,
  TaskResult,
} from '../types'
import { AGENT_CONFIG, NOTIFICATION_TEMPLATES } from '../config'
import { getTaskRunner } from '../task-runner'

// ============================================
// Rate Limiting
// ============================================

// In-memory rate limit tracking (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const limit = AGENT_CONFIG.modules.notifications.rateLimitPerUser
  const windowMs = 60 * 60 * 1000 // 1 hour

  const userLimit = rateLimitMap.get(userId)

  if (!userLimit || userLimit.resetAt < now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (userLimit.count >= limit) {
    return false
  }

  userLimit.count++
  return true
}

// ============================================
// Main Notification Functions
// ============================================

/**
 * Send a single notification
 */
export async function sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const runner = getTaskRunner()

  // Check rate limit
  if (!checkRateLimit(payload.userId)) {
    runner.log('warn', 'notifications', `Rate limit exceeded for user ${payload.userId}`)
    return {
      userId: payload.userId,
      sent: false,
      channels: {},
    }
  }

  const result: NotificationResult = {
    userId: payload.userId,
    sent: false,
    channels: {},
  }

  // Send to each requested channel
  for (const channel of payload.channels) {
    try {
      switch (channel) {
        case 'push':
          result.channels.push = await sendPushNotification(payload)
          break
        case 'email':
          result.channels.email = await sendEmailNotification(payload)
          break
        case 'sms':
          result.channels.sms = await sendSMSNotification(payload)
          break
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      result.channels[channel] = { success: false, error: errorMsg }
      runner.log('error', 'notifications', `Failed to send ${channel} to ${payload.userId}: ${errorMsg}`)
    }
  }

  // Mark as sent if at least one channel succeeded
  result.sent = Object.values(result.channels).some(c => c?.success)

  if (result.sent) {
    runner.log('info', 'notifications', `Notification sent to ${payload.userId}: ${payload.type}`)
  }

  return result
}

/**
 * Send notifications in batch
 */
export async function sendBatch(payloads: NotificationPayload[]): Promise<{
  results: NotificationResult[]
  taskResult: TaskResult
}> {
  const runner = getTaskRunner()
  const startTime = Date.now()

  const task = runner.createTask(
    'notifications',
    'Batch notifications',
    `Sending ${payloads.length} notifications`,
    'medium'
  )

  const results: NotificationResult[] = []
  let sent = 0

  // Process in batches to avoid overwhelming services
  const batchSize = AGENT_CONFIG.modules.notifications.batchSize
  for (let i = 0; i < payloads.length; i += batchSize) {
    const batch = payloads.slice(i, i + batchSize)
    const batchPromises = batch.map(payload => sendNotification(payload))
    const batchResults = await Promise.all(batchPromises)

    results.push(...batchResults)
    sent += batchResults.filter(r => r.sent).length

    // Small delay between batches
    if (i + batchSize < payloads.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const duration = Date.now() - startTime
  const taskResult: TaskResult = {
    success: true,
    itemsProcessed: payloads.length,
    itemsFlagged: 0,
    itemsApproved: sent,
    itemsRejected: payloads.length - sent,
    duration,
  }

  runner.updateTaskStatus(task.id, 'completed', taskResult)
  runner.log('info', 'notifications', `Batch complete: ${sent}/${payloads.length} sent in ${duration}ms`)

  return { results, taskResult }
}

// ============================================
// Channel-Specific Senders
// ============================================

/**
 * Send push notification (Firebase Cloud Messaging)
 */
async function sendPushNotification(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  // In production, integrate with Firebase Cloud Messaging
  // For now, we'll simulate the call

  const runner = getTaskRunner()

  // Check if we have the user's FCM token (would come from database)
  // const fcmToken = await getUserFCMToken(payload.userId)
  // if (!fcmToken) {
  //   return { success: false, error: 'No FCM token for user' }
  // }

  // Simulate FCM API call
  runner.log('debug', 'notifications', `[MOCK] Push notification to ${payload.userId}: ${payload.title}`)

  // In production:
  // const response = await fetch('https://fcm.googleapis.com/v1/projects/YOUR_PROJECT/messages:send', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     message: {
  //       token: fcmToken,
  //       notification: { title: payload.title, body: payload.body },
  //       data: payload.data,
  //     },
  //   }),
  // })

  return { success: true }
}

/**
 * Send email notification
 */
async function sendEmailNotification(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  const runner = getTaskRunner()

  // In production, integrate with email service (SendGrid, Postmark, etc.)
  runner.log('debug', 'notifications', `[MOCK] Email to ${payload.userId}: ${payload.title}`)

  // In production:
  // await sendgrid.send({
  //   to: userEmail,
  //   from: 'noreply@connector.app',
  //   subject: payload.title,
  //   text: payload.body,
  //   html: renderEmailTemplate(payload),
  // })

  return { success: true }
}

/**
 * Send SMS notification
 */
async function sendSMSNotification(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  const runner = getTaskRunner()

  // In production, integrate with SMS service (Twilio, etc.)
  runner.log('debug', 'notifications', `[MOCK] SMS to ${payload.userId}: ${payload.body.substring(0, 50)}...`)

  // In production:
  // await twilio.messages.create({
  //   body: payload.body,
  //   to: userPhone,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  // })

  return { success: true }
}

// ============================================
// Templated Notifications
// ============================================

/**
 * Build notification from template
 */
export function buildNotification(
  type: NotificationPayload['type'],
  language: NotificationPayload['language'],
  data: Record<string, string>
): { title: string; body: string } {
  const templates = NOTIFICATION_TEMPLATES as Record<string, Record<string, { title: string; body: string }>>
  const template = templates[type]?.[language]

  if (!template) {
    // Fallback to Russian if template not found
    const fallback = templates[type]?.ru
    if (!fallback) {
      return { title: type, body: '' }
    }
    return interpolate(fallback, data)
  }

  return interpolate(template, data)
}

/**
 * Interpolate variables in template
 */
function interpolate(
  template: { title: string; body: string },
  data: Record<string, string>
): { title: string; body: string } {
  let title = template.title
  let body = template.body

  for (const [key, value] of Object.entries(data)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    title = title.replace(pattern, value)
    body = body.replace(pattern, value)
  }

  return { title, body }
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Notify about new application
 */
export async function notifyNewApplication(
  employerId: string,
  workerName: string,
  shiftTitle: string,
  language: NotificationPayload['language'] = 'ru'
): Promise<NotificationResult> {
  const { title, body } = buildNotification('new_application', language, {
    workerName,
    shiftTitle,
  })

  return sendNotification({
    userId: employerId,
    type: 'new_application',
    title,
    body,
    channels: ['push'],
    language,
    data: { workerName, shiftTitle },
  })
}

/**
 * Notify worker about application approval
 */
export async function notifyApplicationApproved(
  workerId: string,
  employerName: string,
  shiftTitle: string,
  language: NotificationPayload['language'] = 'ru'
): Promise<NotificationResult> {
  const { title, body } = buildNotification('application_approved', language, {
    employerName,
    shiftTitle,
  })

  return sendNotification({
    userId: workerId,
    type: 'application_approved',
    title,
    body,
    channels: ['push', 'email'],
    language,
    data: { employerName, shiftTitle },
  })
}

/**
 * Notify worker about application rejection
 */
export async function notifyApplicationRejected(
  workerId: string,
  shiftTitle: string,
  language: NotificationPayload['language'] = 'ru'
): Promise<NotificationResult> {
  const { title, body } = buildNotification('application_rejected', language, {
    shiftTitle,
  })

  return sendNotification({
    userId: workerId,
    type: 'application_rejected',
    title,
    body,
    channels: ['push'],
    language,
    data: { shiftTitle },
  })
}

/**
 * Notify workers about new shift matching their profile
 */
export async function notifyNewShift(
  workerIds: string[],
  shiftTitle: string,
  hourlyRate: number,
  city: string,
  language: NotificationPayload['language'] = 'ru'
): Promise<NotificationResult[]> {
  const { title, body } = buildNotification('new_shift', language, {
    shiftTitle,
    hourlyRate: hourlyRate.toString(),
    city,
  })

  const payloads: NotificationPayload[] = workerIds.map(userId => ({
    userId,
    type: 'new_shift' as const,
    title,
    body,
    channels: ['push'] as const,
    language,
    data: { shiftTitle, hourlyRate: hourlyRate.toString(), city },
  }))

  const { results } = await sendBatch(payloads)
  return results
}

/**
 * Notify about trial ending
 */
export async function notifyTrialEnding(
  userId: string,
  daysLeft: number,
  language: NotificationPayload['language'] = 'ru'
): Promise<NotificationResult> {
  const { title, body } = buildNotification('trial_ending', language, {
    daysLeft: daysLeft.toString(),
  })

  return sendNotification({
    userId,
    type: 'trial_ending',
    title,
    body,
    channels: ['push', 'email'],
    language,
    data: { daysLeft: daysLeft.toString() },
  })
}

/**
 * Send shift reminder (day before)
 */
export async function notifyShiftReminder(
  workerId: string,
  shiftTitle: string,
  startTime: string,
  address: string,
  language: NotificationPayload['language'] = 'ru'
): Promise<NotificationResult> {
  const { title, body } = buildNotification('shift_reminder', language, {
    shiftTitle,
    startTime,
    address,
  })

  return sendNotification({
    userId: workerId,
    type: 'shift_reminder',
    title,
    body,
    channels: ['push', 'sms'],
    language,
    data: { shiftTitle, startTime, address },
  })
}

// ============================================
// Export
// ============================================

export const NotificationsModule = {
  sendNotification,
  sendBatch,
  buildNotification,
  notifyNewApplication,
  notifyApplicationApproved,
  notifyApplicationRejected,
  notifyNewShift,
  notifyTrialEnding,
  notifyShiftReminder,
}
