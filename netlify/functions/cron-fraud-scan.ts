import { schedule } from '@netlify/functions'

export const handler = schedule('0 */4 * * *', async () => {
  const siteUrl = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:3000'

  try {
    const response = await fetch(`${siteUrl}/api/cron/fraud-scan`, {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    })
    const data = await response.json()
    console.log('[Cron] Fraud scan:', data)
  } catch (error) {
    console.error('[Cron] Fraud scan failed:', error)
  }

  return { statusCode: 200 }
})
