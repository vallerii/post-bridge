// app/api/prom/groups/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: platform } = await supabase
    .from('connected_platforms')
    .select('credentials')
    .eq('user_id', user.id)
    .eq('platform', 'prom')
    .eq('is_active', true)
    .single()

  if (!platform) return NextResponse.json({ error: 'Prom not connected' }, { status: 400 })

  const token = (platform.credentials as Record<string, string>).api_token

  const groupsRes = await fetch('https://my.prom.ua/api/v1/groups/list', {
    headers: { Authorization: `Bearer ${token}` },
  })

  // Перевіряємо що відповідь — JSON а не HTML (помилка авторизації)
  const contentType = groupsRes.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ error: 'Невірний токен або немає доступу до Prom API' }, { status: 401 })
  }

  const groups = await groupsRes.json()
  if (groups.errors) {
    return NextResponse.json({ error: JSON.stringify(groups.errors) }, { status: 400 })
  }

  return NextResponse.json({
    groups: groups.groups ?? [],
    categories: [], // Prom не надає публічний endpoint для категорій маркетплейсу
  })
}