import type { PostData } from './types'

async function getToken(domain: string, login: string, password: string): Promise<string> {
  const res = await fetch(`https://${domain}/api/auth/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  })
  const data = await res.json()
  if (data.status !== 'OK') throw new Error('Horoshop auth failed')
  return data.response.token
}

export async function publishToHoroshop(
  post: PostData,
  credentials: Record<string, string>
) {
  if (!post.title) throw new Error('Horoshop вимагає заголовок')

  const { domain, login, password } = credentials
  const token = await getToken(domain, login, password)

  const product: Record<string, unknown> = {
    article: `SKU-${Date.now()}`,
    'title.ua': post.title,
    'description.ua': post.description ?? '',
    price: Number(post.price) || 0,
    presence: 'В наявності',
    ...(post.media_urls?.length
      ? { images: post.media_urls.filter((_, i) => post.media_types?.[i] !== 'video') }
      : {}),
  }

  const res = await fetch(`https://${domain}/api/catalog/import/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, products: [product] }),
  })

  const text = await res.text()
  console.log('[HOROSHOP] status:', res.status, 'response:', text.substring(0, 300))

  let data
  try { data = JSON.parse(text) } catch {
    throw new Error(`Horoshop повернув не JSON: ${text.substring(0, 100)}`)
  }

  if (data.status !== 'OK') throw new Error(`Horoshop: ${JSON.stringify(data)}`)
  return data
}