'use client'

import { useState } from 'react'
import { cn, formatMoney } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Copy, Share2, Gift, Users, Check } from 'lucide-react'
import { Card } from '@/components/ui/Card'

// ============================================
// REFERRAL CARD PROPS
// ============================================

export interface ReferralCardProps {
  code: string
  totalReferred: number
  totalBonus: number
  className?: string
}

// ============================================
// REFERRAL CARD COMPONENT
// ============================================

export function ReferralCard({
  code,
  totalReferred,
  totalBonus,
  className,
}: ReferralCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select text
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Connector',
          text: `Use my referral code ${code} to sign up on Connector and get a bonus!`,
        })
      } catch {
        // User cancelled
      }
    } else {
      handleCopy()
    }
  }

  return (
    <Card
      variant="gradient"
      className={cn('relative overflow-hidden', className)}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-white/80" />
          <h3 className="font-semibold text-white">Invite Friends</h3>
        </div>

        {/* Referral code box */}
        <div className="flex items-center gap-2 bg-white/15 rounded-xl p-3 backdrop-blur-sm">
          <span className="flex-1 font-mono text-lg font-bold text-white tracking-wider text-center">
            {code}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={handleCopy}
            className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        {copied && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-white/80 mt-1 text-center"
          >
            Copied to clipboard!
          </motion.p>
        )}

        {/* Share button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleShare}
          className={cn(
            'w-full flex items-center justify-center gap-2 mt-3 py-2.5 rounded-xl',
            'bg-white text-brand-primary font-semibold',
            'hover:bg-white/90 transition-colors'
          )}
        >
          <Share2 className="w-4 h-4" />
          Share Referral Link
        </motion.button>

        {/* Stats */}
        <div className="flex items-center justify-around mt-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center text-white/70">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs">Referred</span>
            </div>
            <p className="text-xl font-bold text-white mt-0.5">{totalReferred}</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center text-white/70">
              <Gift className="w-3.5 h-3.5" />
              <span className="text-xs">Bonus Earned</span>
            </div>
            <p className="text-xl font-bold text-white mt-0.5">
              {formatMoney(totalBonus)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ReferralCard
