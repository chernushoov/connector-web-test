'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  AlertTriangle,
  AlertOctagon,
  Eye,
  Ban,
  CheckCircle,
  RefreshCw,
  ChevronRight,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface FraudFlag {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high'
  description: string
}

interface FraudResult {
  userId: string
  userName?: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  flags: FraudFlag[]
  recommendation: 'allow' | 'monitor' | 'review' | 'block'
}

interface FraudAlertCardProps {
  language?: 'ru' | 'en'
  onUserAction?: (userId: string, action: 'review' | 'block' | 'allow') => void
}

// Mock suspicious users for demo
const mockSuspiciousUsers: FraudResult[] = [
  {
    userId: 'u123',
    userName: 'suspicious_user_1',
    riskScore: 85,
    riskLevel: 'critical',
    flags: [
      { id: 'phone-sharing', type: 'policy-violation', severity: 'high', description: 'Sharing contact information to bypass platform' },
      { id: 'new-account-spam', type: 'spam', severity: 'high', description: 'New account with unusually high message volume' },
    ],
    recommendation: 'block',
  },
  {
    userId: 'u456',
    userName: 'new_employer_22',
    riskScore: 55,
    riskLevel: 'high',
    flags: [
      { id: 'suspicious-employer', type: 'suspicious', severity: 'medium', description: 'New employer posting many shifts quickly' },
      { id: 'multiple-ips', type: 'suspicious', severity: 'medium', description: 'Account accessed from 7 different IPs' },
    ],
    recommendation: 'review',
  },
  {
    userId: 'u789',
    userName: 'worker_alex',
    riskScore: 30,
    riskLevel: 'medium',
    flags: [
      { id: 'user-reports', type: 'reported', severity: 'low', description: 'Reported by 1 user(s)' },
    ],
    recommendation: 'monitor',
  },
]

export function FraudAlertCard({ language = 'ru', onUserAction }: FraudAlertCardProps) {
  const [users, setUsers] = useState<FraudResult[]>(mockSuspiciousUsers)
  const [isLoading, setIsLoading] = useState(false)

  const t = {
    ru: {
      title: 'Безопасность',
      subtitle: 'AI-мониторинг подозрительной активности',
      refresh: 'Обновить',
      critical: 'Критические',
      high: 'Высокий риск',
      medium: 'Средний риск',
      review: 'Проверить',
      block: 'Заблокировать',
      allow: 'Разрешить',
      noAlerts: 'Подозрительная активность не обнаружена',
      riskScore: 'Риск',
      flags: 'Флаги',
    },
    en: {
      title: 'Security',
      subtitle: 'AI monitoring of suspicious activity',
      refresh: 'Refresh',
      critical: 'Critical',
      high: 'High risk',
      medium: 'Medium risk',
      review: 'Review',
      block: 'Block',
      allow: 'Allow',
      noAlerts: 'No suspicious activity detected',
      riskScore: 'Risk',
      flags: 'Flags',
    },
  }[language]

  const handleAction = useCallback((userId: string, action: 'review' | 'block' | 'allow') => {
    if (action === 'block' || action === 'allow') {
      setUsers(prev => prev.filter(u => u.userId !== userId))
    }
    onUserAction?.(userId, action)
  }, [onUserAction])

  const getRiskColor = (level: FraudResult['riskLevel']) => {
    switch (level) {
      case 'critical': return 'text-danger bg-danger/10 border-danger/20'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-warning bg-warning/10 border-warning/20'
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200'
    }
  }

  const getRiskIcon = (level: FraudResult['riskLevel']) => {
    switch (level) {
      case 'critical': return <AlertOctagon className="w-5 h-5 text-danger" />
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-600" />
      default: return <Shield className="w-5 h-5 text-warning" />
    }
  }

  const criticalCount = users.filter(u => u.riskLevel === 'critical').length
  const highCount = users.filter(u => u.riskLevel === 'high').length

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className={`p-4 border-b ${criticalCount > 0 ? 'bg-danger/5 border-danger/20' : 'bg-neutral-50 border-neutral-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${criticalCount > 0 ? 'bg-danger/10' : 'bg-brand-primary/10'}`}>
              <Shield className={`w-5 h-5 ${criticalCount > 0 ? 'text-danger' : 'text-brand-primary'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                {t.title}
                {criticalCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium text-white bg-danger rounded-full">
                    {criticalCount} {t.critical.toLowerCase()}
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-500">{t.subtitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* refresh */}}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            {t.refresh}
          </Button>
        </div>

        {/* Risk summary */}
        {users.length > 0 && (
          <div className="flex items-center gap-4 mt-3">
            {criticalCount > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <AlertOctagon className="w-4 h-4 text-danger" />
                <span className="text-danger font-medium">{criticalCount} {t.critical.toLowerCase()}</span>
              </div>
            )}
            {highCount > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-orange-600 font-medium">{highCount} {t.high.toLowerCase()}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="divide-y divide-neutral-100">
        {users.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
            <p className="text-neutral-500">{t.noAlerts}</p>
          </div>
        ) : (
          users.slice(0, 5).map((user) => (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getRiskIcon(user.riskLevel)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900">{user.userName || user.userId}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getRiskColor(user.riskLevel)}`}>
                        {t.riskScore}: {user.riskScore}%
                      </span>
                    </div>
                    <div className="mt-1 space-y-1">
                      {user.flags.map((flag) => (
                        <p key={flag.id} className="text-xs text-neutral-500">
                          • {flag.description}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(user.userId, 'review')}
                    className="p-1.5 text-neutral-500 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                    title={t.review}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAction(user.userId, 'allow')}
                    className="p-1.5 text-neutral-500 hover:text-success hover:bg-success/10 rounded-lg transition-colors"
                    title={t.allow}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAction(user.userId, 'block')}
                    className="p-1.5 text-neutral-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    title={t.block}
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  )
}
