// ============================================
// AI Agent Configuration
// ============================================

import { AgentConfig, ModerationRule } from './types'

// ============================================
// Main Agent Config
// ============================================

export const AGENT_CONFIG: AgentConfig = {
  enabled: true,

  modules: {
    // ============================================
    // Moderation Module
    // ============================================
    moderation: {
      enabled: true,
      autoApprove: false, // require manual approval for now
      autoRejectThreshold: 90, // auto-reject if confidence > 90%
      escalateThreshold: 50, // escalate to human if 50-90%
    },

    // ============================================
    // Notifications Module
    // ============================================
    notifications: {
      enabled: true,
      batchSize: 100, // process 100 notifications at a time
      rateLimitPerUser: 5, // max 5 notifications per user per hour
    },

    // ============================================
    // Fraud Detection Module
    // ============================================
    fraud: {
      enabled: true,
      scanInterval: 4, // scan every 4 hours
      autoRestrictThreshold: 70, // auto-restrict if risk > 70
      autoBanThreshold: 90, // auto-ban if risk > 90
    },

    // ============================================
    // Analytics Module
    // ============================================
    analytics: {
      enabled: true,
      reportTime: '09:00', // send daily report at 9 AM
      telegramChatId: process.env.TELEGRAM_CHAT_ID,
      emailRecipients: process.env.REPORT_EMAILS?.split(','),
    },
  },

  // ============================================
  // OpenAI Settings
  // ============================================
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    maxTokens: 500,
    temperature: 0.3, // lower for more consistent moderation
  },
}

// ============================================
// Moderation Rules (no AI needed)
// ============================================

export const MODERATION_RULES: ModerationRule[] = [
  // Contact information in descriptions
  {
    id: 'phone_in_text',
    name: 'Phone number in text',
    pattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/g,
    action: 'flag',
    reason: 'Contains phone number - possible contact sharing',
    priority: 1,
  },
  {
    id: 'email_in_text',
    name: 'Email in text',
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    action: 'flag',
    reason: 'Contains email address - possible contact sharing',
    priority: 1,
  },
  {
    id: 'whatsapp_link',
    name: 'WhatsApp link',
    pattern: /(wa\.me|whatsapp\.com|ватсап|וואטסאפ)/gi,
    action: 'flag',
    reason: 'Contains WhatsApp reference - possible contact sharing',
    priority: 1,
  },
  {
    id: 'telegram_link',
    name: 'Telegram link',
    pattern: /(t\.me|telegram\.me|телеграм|טלגרם)/gi,
    action: 'flag',
    reason: 'Contains Telegram reference - possible contact sharing',
    priority: 1,
  },

  // Spam patterns
  {
    id: 'excessive_caps',
    name: 'Excessive caps',
    pattern: /[A-ZА-ЯЁ]{20,}/g,
    action: 'flag',
    reason: 'Excessive capitalization - possible spam',
    priority: 2,
  },
  {
    id: 'repeated_chars',
    name: 'Repeated characters',
    pattern: /(.)\1{5,}/g,
    action: 'flag',
    reason: 'Repeated characters - possible spam',
    priority: 2,
  },

  // Suspicious content
  {
    id: 'mlm_keywords',
    name: 'MLM keywords',
    pattern: /(пассивный доход|сетевой маркетинг|работа на дому без вложений|הכנסה פסיבית|passive income|mlm|network marketing)/gi,
    action: 'reject',
    reason: 'MLM/pyramid scheme keywords detected',
    priority: 1,
  },
  {
    id: 'prepayment_scam',
    name: 'Prepayment scam',
    pattern: /(предоплата|внести залог|перевести деньги|העברה מראש|advance payment|deposit required)/gi,
    action: 'flag',
    reason: 'Possible prepayment scam',
    priority: 1,
  },

  // Profanity (basic patterns - AI handles the rest)
  {
    id: 'profanity_ru',
    name: 'Russian profanity',
    pattern: /(бля|хуй|пизд|ебан|сука|нах)/gi,
    action: 'reject',
    reason: 'Profanity detected',
    priority: 1,
  },

  // Unrealistic pay (will be checked against actual numbers)
  {
    id: 'unrealistic_pay',
    name: 'Unrealistic pay',
    pattern: /(\d{3,})\s*(₪|шекел|שקל)\s*(в час|בשעה|per hour)/gi,
    action: 'flag',
    reason: 'Unusually high pay rate - needs verification',
    priority: 2,
  },
]

// ============================================
// Fraud Detection Signals
// ============================================

export const FRAUD_SIGNALS = {
  // Multi-account detection
  multiAccount: {
    sameDevice: 80, // same device fingerprint
    sameIP: 40, // same IP (could be shared network)
    samePhone: 100, // same phone number
    similarName: 30, // similar names
    samePhoto: 90, // same profile photo
  },

  // Activity patterns
  activity: {
    tooManyApplicationsPerDay: { threshold: 50, score: 60 },
    tooManyShiftsPerWeek: { threshold: 20, score: 50 },
    instantReplies: { threshold: 10, score: 40 }, // replies under 5 seconds
    nightActivity: { threshold: 80, score: 20 }, // % of activity at night
  },

  // Profile signals
  profile: {
    noPhoto: 10,
    genericBio: 20,
    tooManySkills: 30, // > 10 skills
    unrealisticExperience: 40, // 20+ years but young
  },

  // Commercial disguise (from research)
  commercial: {
    multipleLocations: 30, // works in many cities
    teamMentions: 20, // mentions team/brigade
    companyNameInProfile: 50,
    highVolume: 40, // > 3 completed shifts per week consistently
  },
}

// ============================================
// Notification Templates
// ============================================

export const NOTIFICATION_TEMPLATES = {
  new_application: {
    ru: {
      title: 'Новый отклик!',
      body: '{{workerName}} откликнулся на вашу смену "{{shiftTitle}}"',
    },
    en: {
      title: 'New application!',
      body: '{{workerName}} applied to your shift "{{shiftTitle}}"',
    },
    he: {
      title: 'מועמד חדש!',
      body: '{{workerName}} הגיש מועמדות למשמרת "{{shiftTitle}}"',
    },
    ar: {
      title: 'طلب جديد!',
      body: '{{workerName}} تقدم لوردية "{{shiftTitle}}"',
    },
  },

  application_approved: {
    ru: {
      title: 'Вас приняли! 🎉',
      body: 'Работодатель "{{employerName}}" принял ваш отклик на смену "{{shiftTitle}}"',
    },
    en: {
      title: 'You\'re hired! 🎉',
      body: 'Employer "{{employerName}}" accepted your application for "{{shiftTitle}}"',
    },
    he: {
      title: 'התקבלת! 🎉',
      body: 'המעסיק "{{employerName}}" אישר את המועמדות שלך למשמרת "{{shiftTitle}}"',
    },
    ar: {
      title: 'تم قبولك! 🎉',
      body: 'قبل صاحب العمل "{{employerName}}" طلبك لوردية "{{shiftTitle}}"',
    },
  },

  application_rejected: {
    ru: {
      title: 'К сожалению, отказ',
      body: 'Работодатель выбрал другого кандидата на смену "{{shiftTitle}}". Не расстраивайтесь, ищите новые возможности!',
    },
    en: {
      title: 'Application declined',
      body: 'The employer chose another candidate for "{{shiftTitle}}". Don\'t worry, keep looking!',
    },
    he: {
      title: 'לא התקבלת הפעם',
      body: 'המעסיק בחר מועמד אחר למשמרת "{{shiftTitle}}". אל תתייאש, המשך לחפש!',
    },
    ar: {
      title: 'للأسف لم يتم القبول',
      body: 'اختار صاحب العمل مرشحًا آخر لوردية "{{shiftTitle}}". لا تقلق، واصل البحث!',
    },
  },

  new_shift: {
    ru: {
      title: 'Новая смена рядом!',
      body: '{{shiftTitle}} — {{hourlyRate}}₪/час в {{city}}',
    },
    en: {
      title: 'New shift nearby!',
      body: '{{shiftTitle}} — {{hourlyRate}}₪/hour in {{city}}',
    },
    he: {
      title: 'משמרת חדשה באזורך!',
      body: '{{shiftTitle}} — {{hourlyRate}}₪ לשעה ב{{city}}',
    },
    ar: {
      title: 'وردية جديدة قريبة!',
      body: '{{shiftTitle}} — {{hourlyRate}}₪/ساعة في {{city}}',
    },
  },

  trial_ending: {
    ru: {
      title: 'Пробный период заканчивается',
      body: 'Осталось {{daysLeft}} дней бесплатного доступа. Оформите подписку, чтобы продолжить пользоваться всеми функциями.',
    },
    en: {
      title: 'Trial ending soon',
      body: '{{daysLeft}} days left in your free trial. Subscribe to keep all features.',
    },
    he: {
      title: 'תקופת הניסיון מסתיימת',
      body: 'נותרו {{daysLeft}} ימים לתקופת הניסיון. הירשם כמנוי כדי להמשיך ליהנות מכל התכונות.',
    },
    ar: {
      title: 'تنتهي الفترة التجريبية قريبًا',
      body: 'باقي {{daysLeft}} أيام في الفترة التجريبية. اشترك للاحتفاظ بجميع الميزات.',
    },
  },

  shift_reminder: {
    ru: {
      title: 'Напоминание о смене',
      body: 'Завтра в {{startTime}} у вас смена "{{shiftTitle}}" по адресу: {{address}}',
    },
    en: {
      title: 'Shift reminder',
      body: 'Tomorrow at {{startTime}} you have "{{shiftTitle}}" at {{address}}',
    },
    he: {
      title: 'תזכורת למשמרת',
      body: 'מחר ב-{{startTime}} יש לך משמרת "{{shiftTitle}}" בכתובת: {{address}}',
    },
    ar: {
      title: 'تذكير بالوردية',
      body: 'غدًا الساعة {{startTime}} لديك وردية "{{shiftTitle}}" في: {{address}}',
    },
  },
}

// ============================================
// Analytics Thresholds
// ============================================

export const ANALYTICS_THRESHOLDS = {
  // Trigger alerts when:
  alerts: {
    registrationDropPercent: 30, // registrations dropped > 30%
    applicationDropPercent: 40, // applications dropped > 40%
    revenueDropPercent: 20, // revenue dropped > 20%
    errorRatePercent: 5, // error rate > 5%
    avgResponseTimeHours: 48, // avg response time > 48h
  },

  // Highlight as positive when:
  highlights: {
    registrationGrowthPercent: 20,
    applicationGrowthPercent: 30,
    revenueGrowthPercent: 15,
    fillRatePercent: 80, // fill rate > 80%
  },
}
