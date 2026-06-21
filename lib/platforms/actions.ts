'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { syncPromCategories } from '../prom/sync-categories'

export async function connectPlatform(
  platform: string,
  credentials: Record<string, string>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('connected_platforms')
    .upsert(
      { user_id: user.id, platform, credentials, is_active: true },
      { onConflict: 'user_id,platform' }
    )

  if (error) throw new Error(error.message)

  // Автосинхронізація категорій при підключенні Prom
  if (platform === 'prom') {
    try {
      await syncPromCategories()
    } catch (e) {
      console.error('Auto sync categories failed:', e)
      // Не кидаємо помилку — підключення пройшло успішно
    }
  }

  revalidatePath('/platforms')
}

export async function disconnectPlatform(platform: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('connected_platforms')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('platform', platform)

  if (error) throw new Error(error.message)
  revalidatePath('/platforms')
}