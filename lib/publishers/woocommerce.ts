import { PostData } from "./types"

interface WooCredentials {
  site_url: string
  consumer_key: string
  consumer_secret: string
}

export async function publishToWooCommerce(
  post: PostData,
  credentials: Record<string, string>
) {
  if (!post.title) throw new Error('WooCommerce вимагає заголовок')

  const { site_url, consumer_key, consumer_secret } = credentials
  const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64')

  const res = await fetch(`${site_url}/wp-json/wc/v3/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: post.title,
      description: post.description ?? '',
      regular_price: post.price?.toString() ?? '0',
      status: 'publish',
      ...(post.image_url
        ? { images: [{ src: post.image_url }] }
        : {}),
    }),
  })

  const data = await res.json()
  if (data.code) throw new Error(`WooCommerce: ${data.message}`)
  return data
}