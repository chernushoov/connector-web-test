import { schedule } from '@netlify/functions'

export const handler = schedule('*/15 * * * *', async () => {
  const siteUrl = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:3000'

  try {
    const response = await fetch(`${siteUrl}/api/cron/moderate`, {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    })
    const data = await response.json()
    console.log('[Cron] Moderate:', data)
  } catch (error) {
    console.error('[Cron] Moderate failed:', error)
  }

  return { statusCode: 200 }
})
