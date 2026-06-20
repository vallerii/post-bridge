import { createClient } from '@/lib/supabase/server'

export async function getConnectedPlatforms() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('connected_platforms')
    .select('platform')
    .eq('is_active', true)
  return (data ?? []).map((r) => r.platform as string)
}

export async function getExpiringPlatforms(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('connected_platforms')
    .select('platform, token_expires_at')
    .eq('user_id', userId)
    .eq('is_active', true)

  const soonIso = new Date(
    new Date().getTime() + 10 * 24 * 60 * 60 * 1000
  ).toISOString()

  return (data ?? [])
    .filter(p => p.token_expires_at && p.token_expires_at < soonIso)
    .map(p => p.platform)
}