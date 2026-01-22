import { schedule } from '@netlify/functions'

export const handler = schedule('0 6 * * *', async () => {
  const siteUrl = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:3000'

  try {
    const response = await fetch(`${siteUrl}/api/cron/daily-report`, {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    })
    const data = await response.json()
    console.log('[Cron] Daily report:', data)
  } catch (error) {
    console.error('[Cron] Daily report failed:', error)
  }

  return { statusCode: 200 }
})
