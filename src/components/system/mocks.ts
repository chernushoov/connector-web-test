import type { WorkerCardProps, EmployerCardProps } from '@/types/system-card'

// ────────────────────────────────────
// WORKER MOCKS
// ────────────────────────────────────

export const MOCK_WORKERS: WorkerCardProps[] = [
  {
    id: 'ID 28491',
    role: 'Electrician',
    location: 'Tel Aviv, Sector 7',
    state: 'AVAILABLE',
    trust: {
      reliability: 82,
      latency: 91,
      silenceRatio: 12,
    },
    systemNote: 'System confidence: high',
  },
  {
    id: 'ID 31205',
    role: 'Welder',
    location: 'Haifa, Industrial Zone',
    state: 'RESERVED',
    stateMeta: {
      timeLeft: 1800,
      escrowStatus: 'FUNDED',
    },
    trust: {
      reliability: 74,
      latency: 68,
      silenceRatio: 25,
    },
    systemNote: 'Reserved by employer ID 10042',
    allowedAction: {
      label: 'Send presence signal',
      event: 'worker.presence.ping',
    },
  },
  {
    id: 'ID 19874',
    role: 'Plumber',
    location: 'Jerusalem',
    state: 'ACTIVE',
    stateMeta: {
      escrowStatus: 'FUNDED',
    },
    trust: {
      reliability: 95,
      latency: 88,
      silenceRatio: 4,
    },
    systemNote: 'Active engagement: 2h 14m elapsed',
  },
  {
    id: 'ID 44210',
    role: 'General Labor',
    state: 'OBSERVED',
    trust: {
      reliability: 56,
      latency: 43,
      silenceRatio: 38,
    },
    systemNote: 'Recent silence detected',
  },
  {
    id: 'ID 10093',
    role: 'Painter',
    location: 'Beer Sheva',
    state: 'FAILED',
    trust: {
      reliability: 31,
      latency: 22,
      silenceRatio: 67,
      penaltyActive: true,
    },
    systemNote: 'Penalty expires in 3 days',
  },
  {
    id: 'ID 55012',
    role: 'HVAC Technician',
    state: 'ARCHIVED',
    trust: {
      reliability: 60,
      latency: 55,
      silenceRatio: 45,
    },
    systemNote: 'Archived: inactivity threshold exceeded',
  },
]

// ────────────────────────────────────
// EMPLOYER MOCKS
// ────────────────────────────────────

export const MOCK_EMPLOYERS: EmployerCardProps[] = [
  {
    id: 'ID 10042',
    sector: 'Construction',
    company: 'BuildTech Ltd',
    location: 'Tel Aviv',
    state: 'ACTIVE',
    stateMeta: {
      escrowStatus: 'FUNDED',
      activeWorkers: 3,
    },
    trust: {
      paymentReliability: 94,
      disputeRatio: 6,
      responseTime: 87,
    },
    systemNote: '3 active engagements',
  },
  {
    id: 'ID 10088',
    sector: 'Maintenance',
    company: 'CleanPro Services',
    location: 'Haifa',
    state: 'POSTING',
    trust: {
      paymentReliability: 78,
      disputeRatio: 15,
      responseTime: 62,
    },
    systemNote: 'System confidence: moderate',
    allowedAction: {
      label: 'Escalate verification',
      event: 'employer.verification.escalate',
    },
  },
  {
    id: 'ID 10155',
    sector: 'Manufacturing',
    location: 'Ashdod, Port Zone',
    state: 'OBSERVING',
    trust: {
      paymentReliability: 88,
      disputeRatio: 9,
      responseTime: 71,
    },
    systemNote: 'Observing 4 available workers',
  },
  {
    id: 'ID 10201',
    sector: 'Logistics',
    company: 'FastMove',
    state: 'RESERVED',
    stateMeta: {
      timeLeft: 900,
      escrowStatus: 'HOLD',
    },
    trust: {
      paymentReliability: 82,
      disputeRatio: 12,
      responseTime: 79,
    },
    systemNote: 'Awaiting worker confirmation',
  },
  {
    id: 'ID 10310',
    sector: 'Renovation',
    company: 'HomeFirst',
    state: 'DISPUTED',
    trust: {
      paymentReliability: 55,
      disputeRatio: 34,
      responseTime: 45,
      penaltyActive: true,
    },
    systemNote: 'Dispute under review',
  },
  {
    id: 'ID 10400',
    sector: 'Agriculture',
    state: 'ARCHIVED',
    trust: {
      paymentReliability: 70,
      disputeRatio: 20,
      responseTime: 50,
    },
    systemNote: 'Archived: account suspended',
  },
]
