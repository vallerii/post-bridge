import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL('/platforms?error=instagram_denied', req.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/platforms?error=no_code', req.url)
    )
  }

  try {
    const tokenRes = await fetch(
      'https://api.instagram.com/oauth/access_token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.INSTAGRAM_APP_ID!,
          client_secret: process.env.INSTAGRAM_APP_SECRET!,
          grant_type: 'authorization_code',
          redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
          code,
        }),
      }
    )

    const tokenData = await tokenRes.json()
    if (tokenData.error_type) throw new Error(tokenData.error_message)

    const shortToken = tokenData.access_token
    const igUserId = tokenData.user_id

    console.log('[INSTAGRAM CALLBACK] tokenData:', JSON.stringify(tokenData))

    // Short-lived → Long-lived (60 днів)
    const longRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${shortToken}`
    )
    const longData = await longRes.json()
    console.log('[INSTAGRAM CALLBACK] longData:', JSON.stringify(longData))

    const longToken = longData.access_token ?? shortToken

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/auth', req.url))

    await supabase
      .from('connected_platforms')
      .upsert(
        {
          user_id: user.id,
          platform: 'instagram',
          credentials: {
            access_token: longToken,
            account_id: String(igUserId),
          },
          is_active: true,
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: 'user_id,platform' }
      )

    return NextResponse.redirect(
      new URL('/platforms?success=instagram', req.url)
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.redirect(
      new URL(`/platforms?error=${encodeURIComponent(msg)}`, req.url)
    )
  }
}