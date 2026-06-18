import { PostData } from "./types"

interface PromCredentials {
  api_token: string
}

export async function publishToProm(
  post: PostData,
  credentials: Record<string, string>
) {
  if (!post.title) throw new Error('Prom вимагає заголовок')
  if (!post.price) throw new Error('Prom вимагає ціну')
  const { api_token } = credentials
  const res = await fetch('https://my.prom.ua/api/v1/products/edit_products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${api_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      products: [
        {
          name: post.title,
          description: post.description ?? '',
          price: post.price,
          currency: post.currency ?? 'UAH',
          ...(post.image_url ? { images: [{ url: post.image_url }] } : {}),
        },
      ],
    }),
  })

  const data = await res.json()
  if (data.errors) throw new Error(`Prom: ${JSON.stringify(data.errors)}`)
  return data
}