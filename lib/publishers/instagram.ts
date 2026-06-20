import type { PostData } from './types'

export async function publishToInstagram(
  post: PostData,
  credentials: Record<string, string>
) {
  const { account_id, access_token } = credentials

  const mediaUrls = post.media_urls ?? []
  const mediaTypes = post.media_types ?? []

  if (mediaUrls.length === 0) {
    throw new Error('Instagram вимагає хоча б одне зображення')
  }

  const parts: string[] = []
  if (post.title) parts.push(post.title)
  if (post.description) parts.push(post.description)
  if (post.price) parts.push(`💰 ${post.price} ${post.currency ?? 'UAH'}`)
  const caption = parts.join('\n\n').substring(0, 2200)

  // Одне фото — звичайна публікація
  if (mediaUrls.length === 1) {
    const isVideo = mediaTypes[0] === 'video'

    const containerRes = await fetch(
      `https://graph.instagram.com/v22.0/${account_id}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isVideo
            ? { video_url: mediaUrls[0], media_type: 'REELS' }
            : { image_url: mediaUrls[0] }
          ),
          caption,
          access_token,
        }),
      }
    )

    const container = await containerRes.json()
    if (container.error) throw new Error(`Instagram: ${container.error.message}`)

    const publishRes = await fetch(
      `https://graph.instagram.com/v22.0/${account_id}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: container.id, access_token }),
      }
    )

    const result = await publishRes.json()
    if (result.error) throw new Error(`Instagram publish: ${result.error.message}`)
    return result
  }

  // Кілька файлів — карусель (максимум 10)
  const items = mediaUrls.slice(0, 10)

  // Крок 1 — створюємо container для кожного елементу
  const childIds: string[] = []

  for (let i = 0; i < items.length; i++) {
    const isVideo = mediaTypes[i] === 'video'

    const childRes = await fetch(
      `https://graph.instagram.com/v22.0/${account_id}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isVideo
            ? { video_url: items[i], media_type: 'VIDEO' }
            : { image_url: items[i] }
          ),
          is_carousel_item: true,
          access_token,
        }),
      }
    )

    const child = await childRes.json()
    if (child.error) throw new Error(`Instagram carousel item ${i + 1}: ${child.error.message}`)
    childIds.push(child.id)
  }

  // Крок 2 — створюємо carousel container
  const carouselRes = await fetch(
    `https://graph.instagram.com/v22.0/${account_id}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'CAROUSEL',
        children: childIds.join(','),
        caption,
        access_token,
      }),
    }
  )

  const carousel = await carouselRes.json()
  if (carousel.error) throw new Error(`Instagram carousel: ${carousel.error.message}`)

  // Крок 3 — публікуємо
  const publishRes = await fetch(
    `https://graph.instagram.com/v22.0/${account_id}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: carousel.id, access_token }),
    }
  )

  const result = await publishRes.json()
  if (result.error) throw new Error(`Instagram carousel publish: ${result.error.message}`)
  return result
}