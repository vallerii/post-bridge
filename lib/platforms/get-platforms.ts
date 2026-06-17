import { createClient } from '@/lib/supabase/server'

export async function getConnectedPlatforms() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('connected_platforms')
    .select('platform')
    .eq('is_active', true)
  return (data ?? []).map((r) => r.platform as string)
}