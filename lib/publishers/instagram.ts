interface Post {
  title: string | null
  description: string | null
  price: number | null
  currency: string | null
  image_url: string | null
}

interface InstagramCredentials {
  account_id: string
  access_token: string
}

export async function publishToInstagram(
  post: Post,
  credentials: InstagramCredentials
) {
  const { account_id, access_token } = credentials

  if (!post.image_url) {
    throw new Error('Instagram вимагає зображення')
  }

  // Формируем caption
  const parts: string[] = []
  if (post.title) parts.push(post.title)
  if (post.description) parts.push(post.description)
  if (post.price) parts.push(`💰 ${post.price} ${post.currency ?? 'UAH'}`)
  const caption = parts.join('\n\n').substring(0, 2200)

  // Шаг 1 — создаём media container
  const containerRes = await fetch(
    `https://graph.facebook.com/v19.0/${account_id}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: post.image_url,
        caption,
        access_token,
      }),
    }
  )

  const container = await containerRes.json()
  if (container.error) throw new Error(`Instagram: ${container.error.message}`)

  // Шаг 2 — публикуем
  const publishRes = await fetch(
    `https://graph.facebook.com/v19.0/${account_id}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: container.id,
        access_token,
      }),
    }
  )

  const result = await publishRes.json()
  if (result.error) throw new Error(`Instagram publish: ${result.error.message}`)
  return result
}