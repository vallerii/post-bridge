import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { publishToTelegram } from '@/lib/publishers/telegram'
import { publishToInstagram } from '@/lib/publishers/instagram'
import { publishToWooCommerce } from '@/lib/publishers/woocommerce'

const PUBLISHERS: Record<string, Function> = {
  telegram: publishToTelegram,
  instagram: publishToInstagram,
  woocommerce: publishToWooCommerce,
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { postId } = await req.json()
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

  // Берём пост из БД
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .eq('user_id', user.id)
    .single()

  if (postError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // Берём credentials всех нужных платформ
  const { data: platforms } = await supabase
    .from('connected_platforms')
    .select('platform, credentials')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .in('platform', post.targets ?? [])

  if (!platforms?.length) {
    return NextResponse.json({ error: 'No connected platforms found' }, { status: 400 })
  }

  // Публикуем параллельно на все платформы
  const results = await Promise.allSettled(
    platforms.map(async ({ platform, credentials }) => {
      const publish = PUBLISHERS[platform]
      if (!publish) throw new Error(`No publisher for ${platform}`)
      await publish(post, credentials)
      return platform
    })
  )

  // Собираем результат
  const succeeded: string[] = []
  const failed: { platform: string; error: string }[] = []

  results.forEach((result, i) => {
    const platform = platforms[i].platform
    if (result.status === 'fulfilled') {
      succeeded.push(platform)
    } else {
      failed.push({ platform, error: result.reason?.message ?? 'Unknown error' })
    }
  })

  // Обновляем статус поста
  await supabase
    .from('posts')
    .update({
      status: failed.length === 0 ? 'published' : succeeded.length > 0 ? 'partial' : 'failed',
      published_at: succeeded.length > 0 ? new Date().toISOString() : null,
    })
    .eq('id', postId)

  return NextResponse.json({ succeeded, failed })
}