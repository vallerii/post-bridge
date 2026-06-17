import { createClient } from '@/lib/supabase/server'

export async function getPosts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}