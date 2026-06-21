'use server'

import { createClient } from '@/lib/supabase/server'

export async function syncPromCategories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Беремо токен з БД
  const { data: platform } = await supabase
    .from('connected_platforms')
    .select('credentials')
    .eq('user_id', user.id)
    .eq('platform', 'prom')
    .eq('is_active', true)
    .single()

  if (!platform) throw new Error('Prom не підключено')

  const token = (platform.credentials as Record<string, string>).api_token

  const res = await fetch('https://my.prom.ua/api/v1/groups/list', {
    headers: { 'Authorization': `Bearer ${token}` },
  })

  const data = await res.json()
  if (data.errors) throw new Error(JSON.stringify(data.errors))

  const groups = data.groups ?? []

  // Будуємо flat список з повним шляхом
  function buildPath(group: Record<string, unknown>, all: Record<string, unknown>[]): string {
    if (!group.parent_group_id) return group.name as string
    const parent = all.find(g => g.id === group.parent_group_id)
    if (!parent) return group.name as string
    return `${buildPath(parent, all)} → ${group.name}`
  }

  const rows = groups.map((g: Record<string, unknown>) => ({
    user_id: user.id,
    platform: 'prom',
    external_id: String(g.id),
    name: g.name as string,
    parent_id: g.parent_group_id ? String(g.parent_group_id) : null,
    full_path: buildPath(g, groups),
    synced_at: new Date().toISOString(),
  }))

  // Upsert батчами по 100
  for (let i = 0; i < rows.length; i += 100) {
    await supabase
      .from('marketplace_categories')
      .upsert(rows.slice(i, i + 100), { onConflict: 'user_id,platform,external_id' })
  }

  return { synced: rows.length }
}