'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { publishToTelegram } from '@/lib/publishers/telegram'
import { publishToInstagram } from '@/lib/publishers/instagram'
import { publishToWooCommerce } from '@/lib/publishers/woocommerce'
import type { Publisher } from '@/lib/publishers/types'
import type {PromData}  from '@/components/posts/PromFields'
import type { HoroshopData } from '@/lib/publishers/types'
import { publishToHoroshop } from '../publishers/horoshop'

const PUBLISHERS: Record<string, Publisher> = {
  telegram: publishToTelegram,
  instagram: publishToInstagram,
  woocommerce: publishToWooCommerce,
  horoshop: publishToHoroshop,
}

export async function createPost(formData: {
  title: string
  description: string
  price: string
  currency: string
  targets: string[]
  status: 'draft' | 'published'
  media_urls: string[]
  media_types: string[]
  prom_data?: PromData | null
  horoshop_data?: HoroshopData | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      title: formData.title || null,
      description: formData.description || null,
      price: formData.price ? parseFloat(formData.price) : null,
      currency: formData.currency,
      targets: formData.targets,
      status: formData.status,
      media_urls: formData.media_urls,
      media_types: formData.media_types,
      published_at: formData.status === 'published' ? new Date().toISOString() : null,
      prom_data: formData.prom_data ?? null,
      horoshop_data: formData.horoshop_data ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (formData.status === 'published') {
    // Берём credentials платформ напрямую — без HTTP запроса
    const { data: platforms } = await supabase
      .from('connected_platforms')
      .select('platform, credentials')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .in('platform', formData.targets)

    if (platforms?.length) {
      // Розділяємо цілі на ті, що реально публікуються автоматично через API,
      // і ті, для яких є тільки файл для ручного імпорту. Prom — завжди файл
      // (нема публічного API для створення товарів). Horoshop — файл тільки
      // якщо тариф Basic/Standard (нема API); якщо Pro — публікується через API.
      const isFileOnly = (platform: string, credentials: Record<string, unknown>) => {
        if (platform === 'prom') return true
        if (platform === 'horoshop') return credentials.plan !== 'pro'
        return false
      }

      const autoPlatforms = platforms.filter(
        ({ platform, credentials }) => !isFileOnly(platform, credentials as Record<string, unknown>)
      )

      if (autoPlatforms.length === 0) {
        // Жодного реального запиту нікуди не пішло — тільки файли для ручного
        // імпорту. "Опубліковано" тут вводило б в оману.
        await supabase
          .from('posts')
          .update({ status: 'ready_for_import' })
          .eq('id', post.id)
      } else {
        const results = await Promise.allSettled(
          autoPlatforms.map(({ platform, credentials }) => {
            const publish = PUBLISHERS[platform]
            if (!publish) {
              return Promise.resolve()
            }

            console.log(`[PUBLISH] ${platform} credentials:`, JSON.stringify({
              account_id: (credentials as Record<string, string>).account_id,
              token_start: (credentials as Record<string, string>).access_token?.substring(0, 20),
            }))

            return publish(post, credentials)
          })
        )

        const failed = results.filter(r => r.status === 'rejected')

        // Логуємо всі результати
        results.forEach((result, i) => {
          const platform = autoPlatforms[i].platform
          if (result.status === 'rejected') {
            console.error(`[PUBLISH ERROR] ${platform}:`, result.reason?.message)
          } else {
            console.log(`[PUBLISH OK] ${platform}`)
          }
        })
        // Обновляем статус
        await supabase
          .from('posts')
          .update({
            status: failed.length === 0 ? 'published' : 'partial',
          })
          .eq('id', post.id)

        // Если все упали — показываем ошибку
        if (failed.length === results.length) {
          const reason = (failed[0] as PromiseRejectedResult).reason?.message
          throw new Error(`Помилка публікації: ${reason}`)
        }
      }
    }
  }

  revalidatePath('/posts')
  revalidatePath('/dashboard')
  // Навмисно НЕ використовуємо redirect() тут: цей server action викликається
  // з клієнта через await у try/catch (PostForm.tsx), а redirect() кидає
  // спеціальну NEXT_REDIRECT-помилку, яку такий catch перехоплює як звичайну
  // помилку (юзер бачив би "NEXT_REDIRECT" замість реального переходу).
  // Тому просто повертаємо id, а навігацію робить клієнт через router.push().
  return { id: post.id }
}

export async function deletePost(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // eq('user_id', user.id) — щоб юзер не міг видалити чужий пост, підмінивши id
  const { error, count } = await supabase
    .from('posts')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  if (!count) throw new Error('Пост не знайдено або немає прав на видалення')

  revalidatePath('/posts')
  revalidatePath('/dashboard')
}