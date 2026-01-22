import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import { ru, he, enUS, ar } from 'date-fns/locale'
import type { Language, Coordinates } from '@/types'

// ============================================
// CLASS NAMES
// ============================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// DATE & TIME
// ============================================

const locales = {
  ru,
  he,
  en: enUS,
  ar,
}

export function formatDate(date: Date | string, lang: Language = 'ru'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd MMM yyyy', { locale: locales[lang] })
}

export function formatTime(time: string): string {
  return time
}

export function formatDateTime(date: Date | string, lang: Language = 'ru'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd MMM, HH:mm', { locale: locales[lang] })
}

export function formatRelativeTime(date: Date | string, lang: Language = 'ru'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: locales[lang] })
}

export function getDayLabel(date: Date, lang: Language = 'ru'): string {
  if (isToday(date)) {
    return lang === 'ru' ? 'Сегодня' : lang === 'he' ? 'היום' : lang === 'ar' ? 'اليوم' : 'Today'
  }
  if (isTomorrow(date)) {
    return lang === 'ru' ? 'Завтра' : lang === 'he' ? 'מחר' : lang === 'ar' ? 'غدًا' : 'Tomorrow'
  }
  return formatDate(date, lang)
}

// ============================================
// MONEY
// ============================================

export function formatMoney(amount: number, currency: string = '₪'): string {
  return `${currency}${amount.toLocaleString()}`
}

export function formatRate(rate: number, currency: string = '₪'): string {
  return `${currency}${rate}/h`
}

export function calculateTotalEarnings(rate: number, hours: number): number {
  return Math.round(rate * hours)
}

// ============================================
// DISTANCE & LOCATION
// ============================================

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(point2.latitude - point1.latitude)
  const dLon = toRad(point2.longitude - point1.longitude)
  const lat1 = toRad(point1.latitude)
  const lat2 = toRad(point2.latitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// ============================================
// RATING
// ============================================

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-success'
  if (rating >= 4.0) return 'text-brand-primary'
  if (rating >= 3.5) return 'text-warning'
  return 'text-danger'
}

// ============================================
// PHONE
// ============================================

export function formatPhone(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  return cleaned
}

export function getWhatsAppUrl(phone: string, message?: string): string {
  const cleanPhone = formatPhone(phone).replace('+', '')
  const encodedMessage = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`
}

export function getPhoneUrl(phone: string): string {
  return `tel:${formatPhone(phone)}`
}

// ============================================
// STRINGS
// ============================================

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function pluralize(
  count: number,
  one: string,
  few: string,
  many: string,
  lang: Language = 'ru'
): string {
  if (lang === 'en') {
    return count === 1 ? one : many
  }

  // Russian pluralization rules
  const n = Math.abs(count) % 100
  const n1 = n % 10

  if (n > 10 && n < 20) return many
  if (n1 > 1 && n1 < 5) return few
  if (n1 === 1) return one
  return many
}

// ============================================
// VALIDATION
// ============================================

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 9 && cleaned.length <= 15
}

export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// ============================================
// RANDOM & IDS
// ============================================

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'CN'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// ============================================
// ARRAYS
// ============================================

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key])
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
      return groups
    },
    {} as Record<string, T[]>
  )
}

// ============================================
// DEBOUNCE & THROTTLE
// ============================================

export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: Parameters<T>) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// ============================================
// LOCAL STORAGE
// ============================================

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue

  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore errors
  }
}

// ============================================
// PSYCHOLOGY HELPERS
// ============================================

export function getUrgencyLevel(
  slots: number,
  filled: number
): 'low' | 'medium' | 'high' | 'critical' {
  const remaining = slots - filled
  const ratio = remaining / slots

  if (remaining <= 1) return 'critical'
  if (ratio <= 0.25) return 'high'
  if (ratio <= 0.5) return 'medium'
  return 'low'
}

export function getCompetitionMessage(
  applicants: number,
  lang: Language = 'ru'
): string | null {
  if (applicants === 0) return null

  const messages = {
    ru: `${applicants} ${pluralize(applicants, 'человек', 'человека', 'человек', lang)} уже откликнулись`,
    he: `${applicants} אנשים כבר הגישו`,
    en: `${applicants} people already applied`,
    ar: `${applicants} أشخاص تقدموا بالفعل`,
  }

  return messages[lang]
}

export function getScarcityMessage(
  slots: number,
  filled: number,
  lang: Language = 'ru'
): string | null {
  const remaining = slots - filled
  if (remaining > 3) return null

  const messages = {
    ru: `Осталось ${remaining} ${pluralize(remaining, 'место', 'места', 'мест', lang)} из ${slots}`,
    he: `נותרו ${remaining} מקומות מתוך ${slots}`,
    en: `Only ${remaining} of ${slots} spots left`,
    ar: `متبقي ${remaining} من ${slots} مكان`,
  }

  return messages[lang]
}

export function getPotentialEarnings(rate: number, hours: number = 8): number {
  return rate * hours
}

export function getLossMessage(
  amount: number,
  lang: Language = 'ru'
): string {
  const messages = {
    ru: `Вы теряете до ${formatMoney(amount)} в день`,
    he: `אתה מפסיד עד ${formatMoney(amount)} ביום`,
    en: `You're missing out on ${formatMoney(amount)}/day`,
    ar: `أنت تخسر حتى ${formatMoney(amount)} في اليوم`,
  }

  return messages[lang]
}
