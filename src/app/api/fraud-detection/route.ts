// ============================================
// AI Fraud Detection API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server'

export interface UserActivity {
  userId: string
  email?: string
  phone?: string
  registrationDate: Date
  lastActive: Date
  totalMessages: number
  totalShiftsPosted: number
  totalApplications: number
  reportedCount: number
  ipAddresses: string[]
  devices: string[]
  // Behavioral patterns
  avgMessageLength?: number
  containsExternalLinks: number
  containsPhoneNumbers: number
  duplicateContentCount: number
}

export interface FraudCheckResult {
  userId: string
  riskScore: number // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  flags: FraudFlag[]
  recommendation: 'allow' | 'monitor' | 'review' | 'block'
}

export interface FraudFlag {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high'
  description: string
}

// Fraud detection rules
function detectFraud(activity: UserActivity): FraudCheckResult {
  const flags: FraudFlag[] = []
  let riskScore = 0

  const now = new Date()
  const accountAge = (now.getTime() - new Date(activity.registrationDate).getTime()) / (1000 * 60 * 60 * 24)

  // Rule 1: New account with high activity
  if (accountAge < 7 && activity.totalMessages > 50) {
    flags.push({
      id: 'new-account-spam',
      type: 'spam',
      severity: 'high',
      description: 'New account with unusually high message volume',
    })
    riskScore += 30
  }

  // Rule 2: Multiple IP addresses
  if (activity.ipAddresses.length > 5) {
    flags.push({
      id: 'multiple-ips',
      type: 'suspicious',
      severity: 'medium',
      description: `Account accessed from ${activity.ipAddresses.length} different IPs`,
    })
    riskScore += 15
  }

  // Rule 3: Contains external links in messages
  if (activity.containsExternalLinks > 5) {
    flags.push({
      id: 'external-links',
      type: 'spam',
      severity: 'medium',
      description: 'Messages contain multiple external links',
    })
    riskScore += 20
  }

  // Rule 4: Contains phone numbers in messages (trying to bypass platform)
  if (activity.containsPhoneNumbers > 3) {
    flags.push({
      id: 'phone-sharing',
      type: 'policy-violation',
      severity: 'high',
      description: 'Sharing contact information to bypass platform',
    })
    riskScore += 35
  }

  // Rule 5: Duplicate content
  if (activity.duplicateContentCount > 3) {
    flags.push({
      id: 'duplicate-content',
      type: 'spam',
      severity: 'medium',
      description: 'Posting duplicate content multiple times',
    })
    riskScore += 25
  }

  // Rule 6: Has been reported
  if (activity.reportedCount > 0) {
    const severity = activity.reportedCount >= 3 ? 'high' : activity.reportedCount >= 2 ? 'medium' : 'low'
    flags.push({
      id: 'user-reports',
      type: 'reported',
      severity,
      description: `Reported by ${activity.reportedCount} user(s)`,
    })
    riskScore += activity.reportedCount * 15
  }

  // Rule 7: Low activity but many shifts posted (potential fake employer)
  if (activity.totalShiftsPosted > 10 && accountAge < 14) {
    flags.push({
      id: 'suspicious-employer',
      type: 'suspicious',
      severity: 'medium',
      description: 'New employer posting many shifts quickly',
    })
    riskScore += 20
  }

  // Rule 8: High application rate with no hires (potential scam)
  if (activity.totalApplications > 30 && accountAge < 7) {
    flags.push({
      id: 'mass-applications',
      type: 'suspicious',
      severity: 'medium',
      description: 'Mass applications from new account',
    })
    riskScore += 15
  }

  // Normalize risk score
  riskScore = Math.min(100, riskScore)

  // Determine risk level and recommendation
  let riskLevel: FraudCheckResult['riskLevel']
  let recommendation: FraudCheckResult['recommendation']

  if (riskScore >= 70) {
    riskLevel = 'critical'
    recommendation = 'block'
  } else if (riskScore >= 50) {
    riskLevel = 'high'
    recommendation = 'review'
  } else if (riskScore >= 25) {
    riskLevel = 'medium'
    recommendation = 'monitor'
  } else {
    riskLevel = 'low'
    recommendation = 'allow'
  }

  return {
    userId: activity.userId,
    riskScore,
    riskLevel,
    flags,
    recommendation,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: { activity: UserActivity } = await request.json()
    const { activity } = body

    if (!activity || !activity.userId) {
      return NextResponse.json(
        { error: 'User activity data is required' },
        { status: 400 }
      )
    }

    const result = detectFraud(activity)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Fraud detection error:', error)
    return NextResponse.json(
      { error: 'Fraud detection failed' },
      { status: 500 }
    )
  }
}

// Batch check endpoint
export async function PUT(request: NextRequest) {
  try {
    const body: { activities: UserActivity[] } = await request.json()
    const { activities } = body

    if (!activities || !Array.isArray(activities)) {
      return NextResponse.json(
        { error: 'Activities array is required' },
        { status: 400 }
      )
    }

    const results = activities.map(detectFraud)

    // Sort by risk score (highest first)
    results.sort((a, b) => b.riskScore - a.riskScore)

    return NextResponse.json({
      total: results.length,
      critical: results.filter(r => r.riskLevel === 'critical').length,
      high: results.filter(r => r.riskLevel === 'high').length,
      medium: results.filter(r => r.riskLevel === 'medium').length,
      low: results.filter(r => r.riskLevel === 'low').length,
      results,
    })

  } catch (error) {
    console.error('Batch fraud detection error:', error)
    return NextResponse.json(
      { error: 'Batch fraud detection failed' },
      { status: 500 }
    )
  }
}
