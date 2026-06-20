import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  // Захист від випадкових викликів
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Знаходимо токени які закінчуються через 10 днів
  const soon = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()

  const { data: platforms } = await supabase
    .from('connected_platforms')
    .select('id, credentials, token_expires_at')
    .eq('platform', 'instagram')
    .eq('is_active', true)
    .lt('token_expires_at', soon)

  if (!platforms?.length) {
    return NextResponse.json({ refreshed: 0 })
  }

  let refreshed = 0

  for (const p of platforms) {
    try {
      const oldToken = (p.credentials as Record<string, string>).access_token

      const res = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${oldToken}`
      )
      const data = await res.json()

      if (data.access_token) {
        await supabase
          .from('connected_platforms')
          .update({
            credentials: {
              ...(p.credentials as object),
              access_token: data.access_token,
            },
            token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('id', p.id)

        refreshed++
      }
    } catch (e) {
      console.error('Token refresh failed for platform', p.id, e)
    }
  }

  return NextResponse.json({ refreshed })
}