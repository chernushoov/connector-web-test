/**
 * Export utilities for admin dashboard
 * Provides functions to export data to CSV and JSON formats
 */

type ExportableValue = string | number | boolean | Date | null | undefined

interface ExportColumn<T> {
  key: keyof T | string
  header: string
  formatter?: (value: ExportableValue, row: T) => string
}

/**
 * Convert data array to CSV string
 */
export function convertToCSV<T extends Record<string, ExportableValue>>(
  data: T[],
  columns: ExportColumn<T>[]
): string {
  if (data.length === 0) return ''

  // Header row
  const headers = columns.map((col) => `"${col.header}"`)
  const headerRow = headers.join(',')

  // Data rows
  const dataRows = data.map((row) => {
    return columns
      .map((col) => {
        const keyStr = String(col.key)
        const value = keyStr.includes('.')
          ? getNestedValue(row, keyStr)
          : row[col.key as keyof T]

        if (col.formatter) {
          return `"${escapeCSV(col.formatter(value as ExportableValue, row))}"`
        }

        return `"${escapeCSV(formatValue(value))}"`
      })
      .join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined
  }, obj as unknown)
}

/**
 * Escape special characters for CSV
 */
function escapeCSV(value: string): string {
  return value.replace(/"/g, '""')
}

/**
 * Format value for CSV output
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  const BOM = '\uFEFF' // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Download JSON file
 */
export function downloadJSON<T>(data: T[], filename: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export data to CSV and download
 */
export function exportToCSV<T extends Record<string, ExportableValue>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  const csv = convertToCSV(data, columns)
  downloadCSV(csv, filename)
}

/**
 * Generate filename with timestamp
 */
export function generateExportFilename(prefix: string): string {
  const now = new Date()
  const date = now.toISOString().split('T')[0]
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-')
  return `${prefix}_${date}_${time}`
}

// Pre-defined column configurations for common exports

export const userExportColumns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'phone', header: 'Phone' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status' },
  { key: 'rating', header: 'Rating' },
  { key: 'completedShifts', header: 'Completed Shifts' },
  { key: 'totalEarnings', header: 'Total Earnings' },
  { key: 'isVerified', header: 'Verified', formatter: (v: ExportableValue) => (v ? 'Yes' : 'No') },
  { key: 'createdAt', header: 'Registration Date', formatter: (v: ExportableValue) => (v instanceof Date ? v.toLocaleDateString() : String(v || '')) },
]

export const shiftExportColumns = [
  { key: 'id', header: 'ID' },
  { key: 'title', header: 'Title' },
  { key: 'employer', header: 'Employer' },
  { key: 'location', header: 'Location' },
  { key: 'date', header: 'Date' },
  { key: 'startTime', header: 'Start Time' },
  { key: 'endTime', header: 'End Time' },
  { key: 'rate', header: 'Rate (₪/hr)' },
  { key: 'workers', header: 'Workers Needed' },
  { key: 'status', header: 'Status' },
  { key: 'createdAt', header: 'Created', formatter: (v: ExportableValue) => (v instanceof Date ? v.toLocaleDateString() : String(v || '')) },
]

export const paymentExportColumns = [
  { key: 'id', header: 'Payment ID' },
  { key: 'shiftId', header: 'Shift ID' },
  { key: 'workerId', header: 'Worker ID' },
  { key: 'workerName', header: 'Worker Name' },
  { key: 'employerId', header: 'Employer ID' },
  { key: 'employerName', header: 'Employer Name' },
  { key: 'amount', header: 'Amount (₪)' },
  { key: 'fee', header: 'Platform Fee (₪)' },
  { key: 'status', header: 'Status' },
  { key: 'createdAt', header: 'Created', formatter: (v: ExportableValue) => (v instanceof Date ? v.toLocaleDateString() : String(v || '')) },
  { key: 'releasedAt', header: 'Released', formatter: (v: ExportableValue) => (v instanceof Date ? v.toLocaleDateString() : String(v || '')) },
]

export const documentExportColumns = [
  { key: 'id', header: 'Document ID' },
  { key: 'userId', header: 'User ID' },
  { key: 'userName', header: 'User Name' },
  { key: 'userPhone', header: 'User Phone' },
  { key: 'type', header: 'Document Type' },
  { key: 'status', header: 'Status' },
  { key: 'uploadedAt', header: 'Uploaded', formatter: (v: ExportableValue) => (v instanceof Date ? v.toLocaleDateString() : String(v || '')) },
  { key: 'verifiedAt', header: 'Verified', formatter: (v: ExportableValue) => (v instanceof Date ? v.toLocaleDateString() : String(v || '')) },
  { key: 'rejectionReason', header: 'Rejection Reason' },
]

export const disputeExportColumns = [
  { key: 'id', header: 'Dispute ID' },
  { key: 'type', header: 'Type' },
  { key: 'status', header: 'Status' },
  { key: 'priority', header: 'Priority' },
  { key: 'shiftId', header: 'Shift ID' },
  { key: 'reporterId', header: 'Reporter ID' },
  { key: 'reporterName', header: 'Reporter Name' },
  { key: 'reportedId', header: 'Reported ID' },
  { key: 'reportedName', header: 'Reported Name' },
  { key: 'description', header: 'Description' },
  { key: 'createdAt', header: 'Created', formatter: (v: ExportableValue) => (v instanceof Date ? v.toLocaleDateString() : String(v || '')) },
  { key: 'resolvedAt', header: 'Resolved', formatter: (v: ExportableValue) => (v instanceof Date ? v.toLocaleDateString() : String(v || '')) },
]
