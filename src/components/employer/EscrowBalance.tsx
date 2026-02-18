'use client'

import { cn, formatMoney } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Shield, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'

// ============================================
// ESCROW BALANCE PROPS
// ============================================

export interface EscrowBalanceProps {
  balance: number
  currency?: string
  className?: string
}

// ============================================
// ESCROW BALANCE COMPONENT
// ============================================

export function EscrowBalance({
  balance,
  currency = '₪',
  className,
}: EscrowBalanceProps) {
  const formattedBalance = balance.toLocaleString()

  return (
    <Card
      variant="default"
      className={cn(
        'relative overflow-hidden',
        className
      )}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-success/5" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Escrow Balance</h3>
            <p className="text-xs text-neutral-500">Funds held securely</p>
          </div>
        </div>

        {/* Balance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4"
        >
          <span className="text-sm text-neutral-500">{currency}</span>
          <p className="text-4xl font-bold text-neutral-900 mt-1">
            {formattedBalance}
          </p>
        </motion.div>

        {/* Secure indicator */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-success pt-2 border-t border-neutral-100">
          <Shield className="w-3.5 h-3.5" />
          <span>Protected by Connector Escrow</span>
        </div>
      </div>
    </Card>
  )
}

export default EscrowBalance
