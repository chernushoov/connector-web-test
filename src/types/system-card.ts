// ============================================
// SYSTEM CARD TYPES — CONNECTOR 2036
// State-machine-driven card data models
// ============================================

// ────────────────────────────────────
// SHARED TYPES
// ────────────────────────────────────

export type EntityState =
  | 'AVAILABLE'
  | 'OBSERVED'
  | 'RESERVED'
  | 'ACTIVE'
  | 'FAILED'
  | 'ARCHIVED'

export type EmployerState =
  | 'POSTING'
  | 'OBSERVING'
  | 'RESERVED'
  | 'ACTIVE'
  | 'DISPUTED'
  | 'ARCHIVED'

export type EscrowStatus = 'FUNDED' | 'HOLD' | 'NONE'

export type CardContext = 'map' | 'profile'

export interface StateMeta {
  timeLeft?: number // seconds remaining
  escrowStatus?: EscrowStatus
}

export interface AllowedAction {
  label: string  // e.g. "Send presence signal"
  event: string  // emitted system event ID
}

// ────────────────────────────────────
// WORKER CARD
// ────────────────────────────────────

export interface WorkerTrust {
  reliability: number    // 0–100
  latency: number        // 0–100
  silenceRatio: number   // 0–100 (%)
  penaltyActive?: boolean
}

export interface WorkerCardProps {
  id: string              // e.g. "ID 28491"
  role: string            // e.g. "Electrician"
  location?: string

  state: EntityState
  stateMeta?: StateMeta

  trust: WorkerTrust

  systemNote?: string     // system-generated sentence
  allowedAction?: AllowedAction

  context?: CardContext   // map | profile
  onAction?: (event: string) => void
}

// ────────────────────────────────────
// EMPLOYER CARD
// ────────────────────────────────────

export interface EmployerTrust {
  paymentReliability: number  // 0–100
  disputeRatio: number        // 0–100 (lower = better)
  responseTime: number        // 0–100
  penaltyActive?: boolean
}

export interface EmployerStateMeta extends StateMeta {
  activeWorkers?: number
}

export interface EmployerCardProps {
  id: string              // e.g. "ID 10042"
  sector: string          // e.g. "Construction"
  company?: string
  location?: string

  state: EmployerState
  stateMeta?: EmployerStateMeta

  trust: EmployerTrust

  systemNote?: string
  allowedAction?: AllowedAction

  context?: CardContext
  onAction?: (event: string) => void
}

// ────────────────────────────────────
// STATE CONFIG (visual mapping)
// ────────────────────────────────────

export interface StateVisualConfig {
  color: string          // tailwind color class
  glowColor: string      // rgba for box-shadow
  animation: 'pulse' | 'countdown' | 'stable' | 'muted' | 'fadeout' | 'none'
  label: string
}

export const WORKER_STATE_CONFIG: Record<EntityState, StateVisualConfig> = {
  AVAILABLE: {
    color: 'from-cyan-400/80 to-cyan-500/60',
    glowColor: 'rgba(34, 211, 238, 0.4)',
    animation: 'pulse',
    label: 'Available',
  },
  OBSERVED: {
    color: 'from-amber-400/80 to-amber-500/60',
    glowColor: 'rgba(251, 191, 36, 0.3)',
    animation: 'pulse',
    label: 'Observed',
  },
  RESERVED: {
    color: 'from-violet-400/80 to-violet-500/60',
    glowColor: 'rgba(167, 139, 250, 0.4)',
    animation: 'countdown',
    label: 'Reserved',
  },
  ACTIVE: {
    color: 'from-emerald-400/80 to-emerald-500/60',
    glowColor: 'rgba(52, 211, 153, 0.4)',
    animation: 'stable',
    label: 'Active',
  },
  FAILED: {
    color: 'from-neutral-500/60 to-neutral-600/40',
    glowColor: 'rgba(115, 115, 115, 0.2)',
    animation: 'muted',
    label: 'Failed',
  },
  ARCHIVED: {
    color: 'from-neutral-400/40 to-neutral-500/20',
    glowColor: 'rgba(163, 163, 163, 0.1)',
    animation: 'fadeout',
    label: 'Archived',
  },
}

export const EMPLOYER_STATE_CONFIG: Record<EmployerState, StateVisualConfig> = {
  POSTING: {
    color: 'from-cyan-400/80 to-cyan-500/60',
    glowColor: 'rgba(34, 211, 238, 0.4)',
    animation: 'pulse',
    label: 'Posting',
  },
  OBSERVING: {
    color: 'from-amber-400/80 to-amber-500/60',
    glowColor: 'rgba(251, 191, 36, 0.3)',
    animation: 'pulse',
    label: 'Observing',
  },
  RESERVED: {
    color: 'from-violet-400/80 to-violet-500/60',
    glowColor: 'rgba(167, 139, 250, 0.4)',
    animation: 'countdown',
    label: 'Reserved',
  },
  ACTIVE: {
    color: 'from-emerald-400/80 to-emerald-500/60',
    glowColor: 'rgba(52, 211, 153, 0.4)',
    animation: 'stable',
    label: 'Active',
  },
  DISPUTED: {
    color: 'from-red-400/60 to-red-500/40',
    glowColor: 'rgba(248, 113, 113, 0.3)',
    animation: 'pulse',
    label: 'Disputed',
  },
  ARCHIVED: {
    color: 'from-neutral-400/40 to-neutral-500/20',
    glowColor: 'rgba(163, 163, 163, 0.1)',
    animation: 'fadeout',
    label: 'Archived',
  },
}
