'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAdminUI } from '@/store/admin'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MetricCard } from '@/components/admin/charts'
import {
  Bell,
  Send,
  Users,
  Briefcase,
  Building2,
  MessageSquare,
  Smartphone,
  Mail,
} from 'lucide-react'

export default function NotificationsPage() {
  const { language } = useAdminUI()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetAudience, setTargetAudience] = useState<'all' | 'workers' | 'employers'>('all')
  const [channels, setChannels] = useState<string[]>(['push'])
  const [isSending, setIsSending] = useState(false)

  const t = {
    title: language === 'ru' ? 'Уведомления' : 'Notifications',
    subtitle: language === 'ru' ? 'Отправка уведомлений пользователям' : 'Send notifications to users',
    compose: language === 'ru' ? 'Создать уведомление' : 'Compose Notification',
    notificationTitle: language === 'ru' ? 'Заголовок' : 'Title',
    notificationBody: language === 'ru' ? 'Сообщение' : 'Message',
    targetAudience: language === 'ru' ? 'Целевая аудитория' : 'Target Audience',
    all: language === 'ru' ? 'Все пользователи' : 'All Users',
    workers: language === 'ru' ? 'Работники' : 'Workers',
    employers: language === 'ru' ? 'Работодатели' : 'Employers',
    channels: language === 'ru' ? 'Каналы доставки' : 'Delivery Channels',
    push: language === 'ru' ? 'Push' : 'Push',
    sms: language === 'ru' ? 'SMS' : 'SMS',
    email: language === 'ru' ? 'Email' : 'Email',
    send: language === 'ru' ? 'Отправить' : 'Send',
    estimatedReach: language === 'ru' ? 'Охват' : 'Estimated Reach',
    recentCampaigns: language === 'ru' ? 'Последние рассылки' : 'Recent Campaigns',
    totalSent: language === 'ru' ? 'Отправлено' : 'Total Sent',
    delivered: language === 'ru' ? 'Доставлено' : 'Delivered',
    opened: language === 'ru' ? 'Открыто' : 'Opened',
  }

  const toggleChannel = (channel: string) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    )
  }

  const handleSend = async () => {
    if (!title || !body) return

    setIsSending(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSending(false)

    setTitle('')
    setBody('')
    alert('Notification sent!')
  }

  const getEstimatedReach = () => {
    switch (targetAudience) {
      case 'workers':
        return 8234
      case 'employers':
        return 4613
      default:
        return 12847
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
        <p className="text-neutral-500">{t.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard title={t.totalSent} value={1256} icon={<Send className="w-5 h-5" />} />
        <MetricCard title={t.delivered} value="98.5%" icon={<Bell className="w-5 h-5" />} variant="success" />
        <MetricCard title={t.opened} value="45.2%" icon={<MessageSquare className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">{t.compose}</h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {t.notificationTitle}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === 'ru' ? 'Введите заголовок...' : 'Enter title...'}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {t.notificationBody}
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={language === 'ru' ? 'Введите сообщение...' : 'Enter message...'}
                  rows={4}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t.targetAudience}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTargetAudience('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      targetAudience === 'all'
                        ? 'bg-brand-primary text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    {t.all}
                  </button>
                  <button
                    onClick={() => setTargetAudience('workers')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      targetAudience === 'workers'
                        ? 'bg-brand-primary text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    {t.workers}
                  </button>
                  <button
                    onClick={() => setTargetAudience('employers')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      targetAudience === 'employers'
                        ? 'bg-brand-primary text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    {t.employers}
                  </button>
                </div>
              </div>

              {/* Channels */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t.channels}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleChannel('push')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      channels.includes('push')
                        ? 'bg-success text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    {t.push}
                  </button>
                  <button
                    onClick={() => toggleChannel('sms')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      channels.includes('sms')
                        ? 'bg-success text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    {t.sms}
                  </button>
                  <button
                    onClick={() => toggleChannel('email')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      channels.includes('email')
                        ? 'bg-success text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    {t.email}
                  </button>
                </div>
              </div>

              {/* Send Button */}
              <div className="pt-4 border-t border-neutral-100">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={<Send className="w-4 h-4" />}
                  onClick={handleSend}
                  isLoading={isSending}
                  disabled={!title || !body || channels.length === 0}
                >
                  {t.send}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estimated Reach */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-neutral-500 mb-2">{t.estimatedReach}</h3>
            <p className="text-3xl font-bold text-neutral-900">
              {getEstimatedReach().toLocaleString()}
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              {language === 'ru' ? 'пользователей получат уведомление' : 'users will receive notification'}
            </p>
          </Card>

          {/* Recent Campaigns */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-neutral-500 mb-4">{t.recentCampaigns}</h3>
            <div className="space-y-3">
              {[
                { title: 'New feature announcement', sent: 12500, opened: 5600 },
                { title: 'Weekly digest', sent: 8900, opened: 3200 },
                { title: 'Special offer', sent: 4500, opened: 2100 },
              ].map((campaign, index) => (
                <div key={index} className="p-3 bg-neutral-50 rounded-lg">
                  <p className="font-medium text-neutral-900 text-sm">{campaign.title}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500">
                    <span>{campaign.sent.toLocaleString()} sent</span>
                    <span>{Math.round((campaign.opened / campaign.sent) * 100)}% opened</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
