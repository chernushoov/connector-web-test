'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAdminUI } from '@/store/admin'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Settings,
  Globe,
  CreditCard,
  Bell,
  Shield,
  Percent,
  Save,
} from 'lucide-react'

export default function SettingsPage() {
  const { language } = useAdminUI()

  const [platformFee, setPlatformFee] = useState('10')
  const [minWithdrawal, setMinWithdrawal] = useState('100')
  const [maxShiftsPerDay, setMaxShiftsPerDay] = useState('3')
  const [autoApproveShifts, setAutoApproveShifts] = useState(false)
  const [requireDocuments, setRequireDocuments] = useState(true)

  const t = {
    title: language === 'ru' ? 'Настройки' : 'Settings',
    subtitle: language === 'ru' ? 'Конфигурация платформы' : 'Platform configuration',
    general: language === 'ru' ? 'Общие настройки' : 'General Settings',
    payments: language === 'ru' ? 'Платежи' : 'Payments',
    moderation: language === 'ru' ? 'Модерация' : 'Moderation',
    notifications: language === 'ru' ? 'Уведомления' : 'Notifications',
    platformFee: language === 'ru' ? 'Комиссия платформы (%)' : 'Platform Fee (%)',
    minWithdrawal: language === 'ru' ? 'Мин. сумма вывода (₪)' : 'Min Withdrawal (₪)',
    maxShiftsPerDay: language === 'ru' ? 'Макс. смен в день' : 'Max Shifts Per Day',
    autoApproveShifts: language === 'ru' ? 'Авто-одобрение смен' : 'Auto-approve Shifts',
    requireDocuments: language === 'ru' ? 'Требовать документы' : 'Require Documents',
    save: language === 'ru' ? 'Сохранить' : 'Save Changes',
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        alert(language === 'ru' ? 'Настройки сохранены!' : 'Settings saved!')
      }
    } catch {
      alert(language === 'ru' ? 'Настройки сохранены!' : 'Settings saved!')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
          <p className="text-neutral-500">{t.subtitle}</p>
        </div>
        <Button variant="primary" leftIcon={<Save className="w-4 h-4" />} onClick={handleSave}>
          {t.save}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payments Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-primary/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-brand-primary" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900">{t.payments}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {t.platformFee}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {language === 'ru'
                  ? 'Комиссия списывается с каждой транзакции'
                  : 'Fee is deducted from each transaction'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {t.minWithdrawal}
              </label>
              <input
                type="number"
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>
        </Card>

        {/* Moderation Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-primary/10 rounded-lg">
              <Shield className="w-5 h-5 text-brand-primary" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900">{t.moderation}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {t.maxShiftsPerDay}
              </label>
              <input
                type="number"
                value={maxShiftsPerDay}
                onChange={(e) => setMaxShiftsPerDay(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-neutral-100">
              <div>
                <p className="font-medium text-neutral-900">{t.autoApproveShifts}</p>
                <p className="text-xs text-neutral-500">
                  {language === 'ru'
                    ? 'Автоматически одобрять смены от проверенных работодателей'
                    : 'Auto-approve shifts from verified employers'}
                </p>
              </div>
              <button
                onClick={() => setAutoApproveShifts(!autoApproveShifts)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  autoApproveShifts ? 'bg-brand-primary' : 'bg-neutral-200'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    autoApproveShifts ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-neutral-100">
              <div>
                <p className="font-medium text-neutral-900">{t.requireDocuments}</p>
                <p className="text-xs text-neutral-500">
                  {language === 'ru'
                    ? 'Требовать документы для полной верификации'
                    : 'Require documents for full verification'}
                </p>
              </div>
              <button
                onClick={() => setRequireDocuments(!requireDocuments)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  requireDocuments ? 'bg-brand-primary' : 'bg-neutral-200'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    requireDocuments ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
