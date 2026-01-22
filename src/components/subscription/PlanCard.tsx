'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Check, Crown, Zap, Building2 } from 'lucide-react'
import type { PricingPlan, SubscriptionPlan } from '@/types'

interface PlanCardProps {
  plan: PricingPlan
  isCurrentPlan?: boolean
  onSelect: (plan: SubscriptionPlan) => void
  isLoading?: boolean
}

const planIcons: Record<SubscriptionPlan, typeof Crown> = {
  free: Zap,
  pro: Crown,
  business: Building2,
}

export function PlanCard({ plan, isCurrentPlan, onSelect, isLoading }: PlanCardProps) {
  const Icon = planIcons[plan.id]

  return (
    <motion.div
      whileHover={!isCurrentPlan ? { scale: 1.02, y: -4 } : undefined}
      className={cn(
        'relative rounded-3xl p-6 transition-all duration-300',
        plan.isPopular
          ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/25'
          : 'bg-white border-2 border-neutral-200 hover:border-neutral-300',
        isCurrentPlan && 'ring-2 ring-green-500 ring-offset-2'
      )}
    >
      {/* Popular badge */}
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 text-xs font-bold px-4 py-1 rounded-full shadow-lg">
          MOST POPULAR
        </div>
      )}

      {/* Current plan badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          CURRENT
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          'w-12 h-12 rounded-2xl flex items-center justify-center',
          plan.isPopular ? 'bg-white/20' : 'bg-neutral-100'
        )}>
          <Icon className={cn(
            'w-6 h-6',
            plan.isPopular ? 'text-white' : 'text-neutral-700'
          )} />
        </div>
        <div>
          <h3 className={cn(
            'text-xl font-bold',
            plan.isPopular ? 'text-white' : 'text-neutral-900'
          )}>
            {plan.name}
          </h3>
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className={cn(
            'text-4xl font-bold',
            plan.isPopular ? 'text-white' : 'text-neutral-900'
          )}>
            {plan.price === 0 ? 'Free' : `₪${plan.price}`}
          </span>
          {plan.price > 0 && (
            <span className={cn(
              'text-sm',
              plan.isPopular ? 'text-white/70' : 'text-neutral-500'
            )}>
              /{plan.period === 'month' ? 'mo' : 'yr'}
            </span>
          )}
        </div>
        {plan.savings && plan.savings > 0 && (
          <p className={cn(
            'text-sm mt-1',
            plan.isPopular ? 'text-green-300' : 'text-green-600'
          )}>
            Save ₪{plan.savings}/year
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <div className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
              plan.isPopular ? 'bg-white/20' : 'bg-green-100'
            )}>
              <Check className={cn(
                'w-3 h-3',
                plan.isPopular ? 'text-white' : 'text-green-600'
              )} />
            </div>
            <span className={cn(
              'text-sm',
              plan.isPopular ? 'text-white/90' : 'text-neutral-700'
            )}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* Limitations for free plan */}
      {plan.limitations && plan.limitations.length > 0 && (
        <ul className="space-y-2 mb-6 pt-4 border-t border-neutral-200">
          {plan.limitations.map((limitation) => (
            <li key={limitation} className="flex items-start gap-3 text-sm text-neutral-500">
              <span className="text-neutral-300">•</span>
              <span>{limitation}</span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA Button */}
      <Button
        variant={plan.isPopular ? 'outline-white' : isCurrentPlan ? 'ghost' : 'primary'}
        size="lg"
        className="w-full"
        onClick={() => onSelect(plan.id)}
        disabled={isCurrentPlan || isLoading}
        isLoading={isLoading}
      >
        {isCurrentPlan
          ? 'Current Plan'
          : plan.price === 0
            ? 'Stay Free'
            : 'Get Started'
        }
      </Button>
    </motion.div>
  )
}

export default PlanCard
