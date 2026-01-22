// ============================================
// AI Agent - Fraud Detection Module
// Detects multi-accounts, commercial disguise, suspicious activity
// ============================================

import { FraudCheckResult, FraudSignal, TaskResult } from '../types'
import { AGENT_CONFIG, FRAUD_SIGNALS } from '../config'
import { getTaskRunner } from '../task-runner'

interface UserProfile {
  id: string
  phone: string
  name: string
  deviceFingerprint?: string
  ipAddress?: string
  photoUrl?: string
  about?: string
  skills?: string[]
}

interface UserActivity {
  userId: string
  applicationsPerDay: number
  shiftsPerWeek: number
  avgResponseTimeSeconds: number
  nightActivityPercent: number
  citiesWorkedIn: string[]
  completedShiftsPerWeek: number
  reportsReceived: number
}

export async function checkUser(
  profile: UserProfile,
  activity: UserActivity,
  allUsers?: UserProfile[]
): Promise<FraudCheckResult> {
  const runner = getTaskRunner()
  const signals: FraudSignal[] = []

  if (allUsers) signals.push(...detectMultiAccount(profile, allUsers))
  signals.push(...analyzeActivity(activity))
  signals.push(...analyzeProfile(profile))
  signals.push(...detectCommercialDisguise(profile, activity))

  const riskScore = calculateRiskScore(signals)
  const recommendedAction = riskScore >= 90 ? 'ban' : riskScore >= 70 ? 'restrict' : riskScore >= 30 ? 'flag' : 'none'

  runner.log('info', 'fraud', `User ${profile.id}: risk=${riskScore}, signals=${signals.length}`)

  return { userId: profile.id, isSuspicious: riskScore >= 30, riskScore, signals, recommendedAction }
}

export async function scanUsers(
  users: Array<{ profile: UserProfile; activity: UserActivity }>
): Promise<{ results: FraudCheckResult[]; taskResult: TaskResult }> {
  const runner = getTaskRunner()
  const startTime = Date.now()
  const task = runner.createTask('fraud', 'Fraud scan', `Scanning ${users.length} users`, 'high')

  const allProfiles = users.map(u => u.profile)
  const results: FraudCheckResult[] = []
  let flagged = 0

  for (const { profile, activity } of users) {
    const result = await checkUser(profile, activity, allProfiles)
    results.push(result)
    if (result.isSuspicious) flagged++
  }

  const duration = Date.now() - startTime
  const taskResult: TaskResult = {
    success: true, itemsProcessed: users.length,
    itemsFlagged: flagged, itemsApproved: users.length - flagged,
    itemsRejected: 0, duration
  }

  runner.updateTaskStatus(task.id, 'completed', taskResult)
  return { results, taskResult }
}

function detectMultiAccount(user: UserProfile, allUsers: UserProfile[]): FraudSignal[] {
  const signals: FraudSignal[] = []
  for (const other of allUsers) {
    if (other.id === user.id) continue
    if (user.deviceFingerprint && user.deviceFingerprint === other.deviceFingerprint) {
      signals.push({ type: 'multi_account', severity: 'high', confidence: 80, evidence: [`Same device as ${other.id}`] })
    }
    if (user.phone && user.phone === other.phone) {
      signals.push({ type: 'multi_account', severity: 'critical', confidence: 100, evidence: [`Same phone as ${other.id}`] })
    }
    if (user.photoUrl && user.photoUrl === other.photoUrl && user.photoUrl !== '') {
      signals.push({ type: 'multi_account', severity: 'high', confidence: 90, evidence: [`Same photo as ${other.id}`] })
    }
  }
  return signals
}

function analyzeActivity(activity: UserActivity): FraudSignal[] {
  const signals: FraudSignal[] = []
  if (activity.applicationsPerDay > 50) {
    signals.push({ type: 'suspicious_activity', severity: 'medium', confidence: 60, evidence: [`${activity.applicationsPerDay} applications/day`] })
  }
  if (activity.shiftsPerWeek > 20) {
    signals.push({ type: 'commercial_disguise', severity: 'medium', confidence: 50, evidence: [`${activity.shiftsPerWeek} shifts/week`] })
  }
  if (activity.avgResponseTimeSeconds < 5 && activity.applicationsPerDay > 10) {
    signals.push({ type: 'suspicious_activity', severity: 'high', confidence: 40, evidence: ['Bot-like response speed'] })
  }
  return signals
}

function analyzeProfile(profile: UserProfile): FraudSignal[] {
  const signals: FraudSignal[] = []
  if (!profile.photoUrl) signals.push({ type: 'fake_profile', severity: 'low', confidence: 10, evidence: ['No photo'] })
  if (!profile.about || profile.about.length < 20) signals.push({ type: 'fake_profile', severity: 'low', confidence: 20, evidence: ['Short bio'] })
  if (profile.skills && profile.skills.length > 10) signals.push({ type: 'fake_profile', severity: 'low', confidence: 30, evidence: [`${profile.skills.length} skills`] })
  return signals
}

function detectCommercialDisguise(profile: UserProfile, activity: UserActivity): FraudSignal[] {
  const signals: FraudSignal[] = []
  if (activity.citiesWorkedIn.length > 3) {
    signals.push({ type: 'commercial_disguise', severity: 'medium', confidence: 30, evidence: [`Works in ${activity.citiesWorkedIn.length} cities`] })
  }
  if (profile.about) {
    if (/бригад|команд|team|brigade|צוות|فريق/gi.test(profile.about)) {
      signals.push({ type: 'commercial_disguise', severity: 'medium', confidence: 20, evidence: ['Team mentions in bio'] })
    }
  }
  if (profile.name && /ООО|Ltd|LLC|בע"מ|חברת|شركة|агентство|студия/gi.test(profile.name)) {
    signals.push({ type: 'commercial_disguise', severity: 'high', confidence: 50, evidence: ['Company name in profile'] })
  }
  if (activity.completedShiftsPerWeek > 3) {
    signals.push({ type: 'commercial_disguise', severity: 'medium', confidence: 40, evidence: [`${activity.completedShiftsPerWeek} shifts/week`] })
  }
  return signals
}

export function detectContactSharing(content: string): FraudSignal | null {
  const patterns = [
    /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/g,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    /(wa\.me|whatsapp|ватсап|וואטסאפ|t\.me|telegram|телеграм|טלגרם)/gi,
  ]
  const found = patterns.some(p => p.test(content))
  if (!found) return null
  return { type: 'contact_sharing', severity: 'high', confidence: 85, evidence: ['Contact info in message'] }
}

function calculateRiskScore(signals: FraudSignal[]): number {
  if (signals.length === 0) return 0
  const weights = { low: 0.5, medium: 1, high: 1.5, critical: 2 }
  let sum = 0
  for (const s of signals) sum += s.confidence * weights[s.severity]
  return Math.min(100, Math.round(sum / signals.length))
}

export const FraudDetectionModule = { checkUser, scanUsers, detectContactSharing }
