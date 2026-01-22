// ============================================
// AI Agent - Test Script
// Run: npx ts-node --esm src/lib/agent/test-agent.ts
// Or: npx tsx src/lib/agent/test-agent.ts
// ============================================

import { getAgent, getTaskRunner } from './index'
import { ModerationModule } from './modules/moderation'
import { NotificationsModule } from './modules/notifications'
import { FraudDetectionModule } from './modules/fraud-detection'
import { ReportsModule } from './modules/reports'
import type { ModerationItem, DailyMetrics } from './types'

// ============================================
// Test Helpers
// ============================================

let passed = 0
let failed = 0

function assert(condition: boolean, name: string) {
  if (condition) {
    console.log(`  ✓ ${name}`)
    passed++
  } else {
    console.error(`  ✗ ${name}`)
    failed++
  }
}

function section(name: string) {
  console.log(`\n━━━ ${name} ━━━`)
}

// ============================================
// Test: Moderation Module
// ============================================

async function testModeration() {
  section('Moderation Module')

  // Test 1: Clean content should pass
  const cleanItem: ModerationItem = {
    id: 'test-1',
    type: 'shift',
    content: 'Требуется помощник на склад. Работа с 9:00 до 18:00. Оплата 50₪/час.',
    authorId: 'user-1',
    createdAt: new Date(),
  }
  const cleanResult = await ModerationModule.moderateItem(cleanItem)
  assert(!cleanResult.isViolation, 'Clean content passes moderation')
  assert(cleanResult.action === 'approve' || cleanResult.action === 'flag', 'Clean content approved/flagged')

  // Test 2: Phone number should be flagged
  const phoneItem: ModerationItem = {
    id: 'test-2',
    type: 'shift',
    content: 'Ищу рабочих, звоните 054-123-4567 для подробностей',
    authorId: 'user-2',
    createdAt: new Date(),
  }
  const phoneResult = await ModerationModule.moderateItem(phoneItem)
  assert(phoneResult.isViolation, 'Phone number detected as violation')
  assert(phoneResult.reasons.some(r => r.includes('phone')), 'Reason mentions phone')

  // Test 3: WhatsApp link should be flagged
  const waItem: ModerationItem = {
    id: 'test-3',
    type: 'message',
    content: 'Напишите мне в ватсап для обсуждения деталей',
    authorId: 'user-3',
    createdAt: new Date(),
  }
  const waResult = await ModerationModule.moderateItem(waItem)
  assert(waResult.isViolation, 'WhatsApp reference detected')

  // Test 4: MLM should be rejected
  const mlmItem: ModerationItem = {
    id: 'test-4',
    type: 'shift',
    content: 'Пассивный доход! Сетевой маркетинг! Заработок без вложений!',
    authorId: 'user-4',
    createdAt: new Date(),
  }
  const mlmResult = await ModerationModule.moderateItem(mlmItem)
  assert(mlmResult.isViolation, 'MLM content detected')
  assert(mlmResult.action === 'reject', 'MLM content rejected')

  // Test 5: Profanity should be rejected
  const profanityItem: ModerationItem = {
    id: 'test-5',
    type: 'message',
    content: 'Этот работодатель полный мудак блять',
    authorId: 'user-5',
    createdAt: new Date(),
  }
  const profanityResult = await ModerationModule.moderateItem(profanityItem)
  assert(profanityResult.isViolation, 'Profanity detected')

  // Test 6: Batch moderation
  const batchItems: ModerationItem[] = [cleanItem, phoneItem, mlmItem]
  const batchResult = await ModerationModule.moderateBatch(batchItems)
  assert(batchResult.results.length === 3, 'Batch processes all items')
  assert(batchResult.taskResult.itemsProcessed === 3, 'Task result tracks count')

  // Test 7: Shift moderation helper
  const shiftResult = await ModerationModule.moderateShift({
    id: 'shift-1',
    title: 'Уборщик в офис',
    description: 'Требуется уборщик. График: пн-пт. Напишите на wa.me/123456',
    hourlyRate: 45,
    employerId: 'emp-1',
    createdAt: new Date(),
  })
  assert(shiftResult.isViolation, 'Shift with WhatsApp link flagged')
}

// ============================================
// Test: Notifications Module
// ============================================

async function testNotifications() {
  section('Notifications Module')

  // Test 1: Build notification from template
  const { title, body } = NotificationsModule.buildNotification('new_application', 'ru', {
    workerName: 'Иван Петров',
    shiftTitle: 'Грузчик на склад',
  })
  assert(title === 'Новый отклик!', 'Russian template title correct')
  assert(body.includes('Иван Петров'), 'Template interpolates workerName')
  assert(body.includes('Грузчик на склад'), 'Template interpolates shiftTitle')

  // Test 2: English template
  const en = NotificationsModule.buildNotification('new_application', 'en', {
    workerName: 'John',
    shiftTitle: 'Warehouse helper',
  })
  assert(en.title === 'New application!', 'English template works')

  // Test 3: Hebrew template
  const he = NotificationsModule.buildNotification('application_approved', 'he', {
    employerName: 'חברה',
    shiftTitle: 'משמרת',
  })
  assert(he.title.includes('התקבלת'), 'Hebrew template works')

  // Test 4: Send single notification (mock)
  const sendResult = await NotificationsModule.sendNotification({
    userId: 'user-1',
    type: 'new_application',
    title: 'Test',
    body: 'Test body',
    channels: ['push'],
    language: 'ru',
  })
  assert(sendResult.sent === true, 'Mock notification sent successfully')
  assert(sendResult.channels.push?.success === true, 'Push channel succeeded')

  // Test 5: Rate limiting
  const results = []
  for (let i = 0; i < 7; i++) {
    const r = await NotificationsModule.sendNotification({
      userId: 'rate-limit-user',
      type: 'new_shift',
      title: 'Test',
      body: 'Test',
      channels: ['push'],
      language: 'ru',
    })
    results.push(r)
  }
  const sentCount = results.filter(r => r.sent).length
  assert(sentCount <= 5, `Rate limiting works (${sentCount}/7 sent, max 5)`)

  // Test 6: Batch notifications
  const payloads = Array.from({ length: 10 }, (_, i) => ({
    userId: `batch-user-${i}`,
    type: 'new_shift' as const,
    title: 'New shift',
    body: 'Check it out',
    channels: ['push'] as ('push' | 'email' | 'sms')[],
    language: 'ru' as const,
  }))
  const batchResult = await NotificationsModule.sendBatch(payloads)
  assert(batchResult.results.length === 10, 'Batch sent all notifications')
  assert(batchResult.taskResult.success, 'Batch task succeeded')

  // Test 7: Convenience functions
  const appResult = await NotificationsModule.notifyNewApplication(
    'emp-1', 'Иван', 'Уборщик', 'ru'
  )
  assert(appResult.sent, 'notifyNewApplication works')
}

// ============================================
// Test: Fraud Detection Module
// ============================================

async function testFraudDetection() {
  section('Fraud Detection Module')

  // Test 1: Clean user - low risk
  const cleanResult = await FraudDetectionModule.checkUser(
    {
      id: 'user-1',
      phone: '+972541234567',
      name: 'Алексей Иванов',
      about: 'Опытный работник склада, ищу подработку',
      skills: ['warehouse', 'packing'],
    },
    {
      userId: 'user-1',
      applicationsPerDay: 3,
      shiftsPerWeek: 2,
      avgResponseTimeSeconds: 300,
      nightActivityPercent: 5,
      citiesWorkedIn: ['Tel Aviv'],
      completedShiftsPerWeek: 2,
      reportsReceived: 0,
    },
  )
  assert(cleanResult.riskScore < 30, `Clean user low risk (score: ${cleanResult.riskScore})`)

  // Test 2: Suspicious user - high activity
  const suspiciousResult = await FraudDetectionModule.checkUser(
    {
      id: 'user-2',
      phone: '+972541234567',
      name: 'A',
      about: '',
      skills: Array(12).fill('skill'),
    },
    {
      userId: 'user-2',
      applicationsPerDay: 60,
      shiftsPerWeek: 25,
      avgResponseTimeSeconds: 3,
      nightActivityPercent: 90,
      citiesWorkedIn: ['Tel Aviv', 'Haifa', 'Jerusalem', 'Beer Sheva', 'Netanya'],
      completedShiftsPerWeek: 5,
      reportsReceived: 3,
    },
  )
  assert(suspiciousResult.riskScore >= 30, `Suspicious user flagged (score: ${suspiciousResult.riskScore})`)
  assert(suspiciousResult.signals.length > 0, 'Fraud signals detected')

  // Test 3: Contact sharing detection
  const contactSignal = FraudDetectionModule.detectContactSharing(
    'Привет, напишите мне на почту test@gmail.com или в телеграм @myname'
  )
  assert(contactSignal !== null, 'Contact sharing detected in text')
  assert(contactSignal!.type === 'contact_sharing', 'Signal type is contact_sharing')

  // Test 4: Clean text - no contact sharing
  const cleanText = FraudDetectionModule.detectContactSharing(
    'Ищу работу грузчиком в Тель-Авиве. Есть опыт 2 года.'
  )
  assert(cleanText === null, 'No false positive on clean text')

  // Test 5: Batch scan
  const users = [
    {
      profile: { id: 'u1', phone: '+1', name: 'User 1', about: 'Normal worker' },
      activity: { userId: 'u1', applicationsPerDay: 2, shiftsPerWeek: 1, avgResponseTimeSeconds: 600, nightActivityPercent: 0, citiesWorkedIn: ['TA'], completedShiftsPerWeek: 1, reportsReceived: 0 },
    },
    {
      profile: { id: 'u2', phone: '+2', name: 'B', about: '', skills: Array(15).fill('x') },
      activity: { userId: 'u2', applicationsPerDay: 100, shiftsPerWeek: 30, avgResponseTimeSeconds: 1, nightActivityPercent: 95, citiesWorkedIn: ['A', 'B', 'C', 'D', 'E', 'F'], completedShiftsPerWeek: 10, reportsReceived: 5 },
    },
  ]
  const scanResult = await FraudDetectionModule.scanUsers(users)
  assert(scanResult.results.length === 2, 'Batch scan processes all users')
  assert(scanResult.taskResult.success, 'Scan task succeeded')
}

// ============================================
// Test: Reports Module
// ============================================

async function testReports() {
  section('Reports Module')

  const today: DailyMetrics = {
    date: '2024-01-15',
    registrations: { total: 50, workers: 40, employers: 10, bySource: { organic: 30, referral: 20 } },
    shifts: { created: 30, filled: 24, cancelled: 2, avgTimeToFill: 4 },
    applications: { sent: 100, approved: 60, rejected: 20, avgResponseTime: 12 },
    engagement: { dau: 200, wau: 500, mau: 800, avgSessionDuration: 15 },
    revenue: { total: 5000, subscriptions: 3000, commissions: 2000, newPaidUsers: 8 },
  }

  const yesterday: DailyMetrics = {
    date: '2024-01-14',
    registrations: { total: 30, workers: 22, employers: 8, bySource: { organic: 20, referral: 10 } },
    shifts: { created: 25, filled: 15, cancelled: 3, avgTimeToFill: 6 },
    applications: { sent: 70, approved: 40, rejected: 15, avgResponseTime: 24 },
    engagement: { dau: 180, wau: 480, mau: 750, avgSessionDuration: 12 },
    revenue: { total: 4000, subscriptions: 2500, commissions: 1500, newPaidUsers: 3 },
  }

  // Test 1: Generate report with comparison
  const report = await ReportsModule.generateDailyReport(today, yesterday)
  assert(report.date === '2024-01-15', 'Report has correct date')
  assert(report.metrics === today, 'Report includes metrics')
  assert(report.insights.length > 0, `Report has insights (${report.insights.length})`)
  assert(report.summary.length > 0, 'Report has summary')

  // Test 2: Summary format
  assert(report.summary.includes('Daily Report'), 'Summary has title')
  assert(report.summary.includes('DAU'), 'Summary shows DAU')
  assert(report.summary.includes('Revenue'), 'Summary shows revenue')

  // Test 3: Growth detected
  const regInsight = report.insights.find(i => i.metric === 'registrations')
  assert(regInsight !== undefined, 'Registration insight generated')
  assert(regInsight?.type === 'growth', 'Registration growth detected')

  // Test 4: Report without yesterday (first day)
  const firstDayReport = await ReportsModule.generateDailyReport(today)
  assert(firstDayReport.insights.length === 0, 'No insights without comparison')
  assert(firstDayReport.summary.length > 0, 'Summary still generated')

  // Test 5: Alerts generated
  const alertReport = await ReportsModule.generateDailyReport(today, yesterday)
  const successAlert = alertReport.alerts.find(a => a.type === 'success')
  assert(successAlert !== undefined, 'Positive alert for new paid users')

  // Test 6: Telegram send (will fail without token, should return false)
  const sent = await ReportsModule.sendToTelegram(report)
  assert(sent === false, 'Telegram returns false without token (expected)')
}

// ============================================
// Test: Agent Orchestrator
// ============================================

async function testOrchestrator() {
  section('Agent Orchestrator')

  const agent = getAgent()

  // Test 1: Start/stop
  agent.start()
  assert(agent.isRunning, 'Agent starts')

  agent.stop()
  assert(!agent.isRunning, 'Agent stops')

  // Test 2: Methods return null when stopped
  const stoppedResult = await agent.moderateMessage({
    id: 'msg-1', content: 'test', senderId: 'u1', createdAt: new Date()
  })
  assert(stoppedResult === null, 'Returns null when agent stopped')

  // Test 3: Methods work when running
  agent.start()
  const runningResult = await agent.moderateMessage({
    id: 'msg-2', content: 'Нормальное сообщение', senderId: 'u1', createdAt: new Date()
  })
  assert(runningResult !== null, 'Returns result when agent running')

  // Test 4: Stats
  const stats = agent.getStats()
  assert(stats.total > 0, `Stats tracked (${stats.total} tasks total)`)
  assert(stats.completed > 0, 'Completed tasks counted')

  // Test 5: Logs
  const logs = agent.getLogs()
  assert(logs.length > 0, `Logs captured (${logs.length} entries)`)

  // Test 6: Cleanup
  agent.cleanup(0) // Clean everything
  agent.stop()
}

// ============================================
// Test: TaskRunner
// ============================================

async function testTaskRunner() {
  section('TaskRunner')

  const runner = getTaskRunner()

  // Test 1: Create task
  const task = runner.createTask('moderation', 'Test task', 'Testing', 'medium')
  assert(task.id.length > 0, 'Task has ID')
  assert(task.status === 'pending', 'Task starts as pending')

  // Test 2: Update status
  runner.updateTaskStatus(task.id, 'running')
  const updated = runner.getTask(task.id)
  assert(updated?.status === 'running', 'Status updated to running')

  // Test 3: Run task
  const result = await runner.runTask(task, async () => 'done')
  assert(result.success, 'Task execution succeeds')
  assert(result.result === 'done', 'Task returns result')

  // Test 4: Priority ordering
  const low = runner.createTask('notifications', 'Low', 'Low priority', 'low')
  const high = runner.createTask('fraud', 'High', 'High priority', 'high')
  const critical = runner.createTask('moderation', 'Critical', 'Critical priority', 'critical')
  const pending = runner.getPendingTasks()
  const criticalIdx = pending.findIndex(t => t.id === critical.id)
  const highIdx = pending.findIndex(t => t.id === high.id)
  const lowIdx = pending.findIndex(t => t.id === low.id)
  assert(criticalIdx < highIdx && highIdx < lowIdx, 'Tasks ordered by priority')
}

// ============================================
// Run All Tests
// ============================================

async function main() {
  console.log('╔══════════════════════════════════════╗')
  console.log('║   Connector AI Agent - Test Suite    ║')
  console.log('╚══════════════════════════════════════╝')

  try {
    await testTaskRunner()
    await testModeration()
    await testNotifications()
    await testFraudDetection()
    await testReports()
    await testOrchestrator()

    console.log('\n══════════════════════════════════════')
    console.log(`Results: ${passed} passed, ${failed} failed`)
    console.log('══════════════════════════════════════')

    if (failed > 0) {
      process.exit(1)
    } else {
      console.log('\nAll tests passed! Agent is ready for integration.')
    }
  } catch (error) {
    console.error('\nTest suite crashed:', error)
    process.exit(1)
  }
}

main()
