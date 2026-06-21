import type { PostData } from './types'
import type { PromData } from '@/components/posts/PromFields'

export async function publishToProm(
  post: PostData,
  credentials: Record<string, string>
) {
  if (!post.title) throw new Error('Prom вимагає заголовок')

  const promData = post.prom_data as PromData | undefined

  const presenceMap: Record<string, string> = {
    in_stock: 'available',
    order: 'order',
    not_available: 'not_available',
  }

  const product: Record<string, unknown> = {
    name: post.title,
    description: post.description ?? '',
    price: Number(post.price) || 0,
    currency: post.currency ?? 'UAH',
    status: 'on_display',
    presence: presenceMap[promData?.availability ?? 'in_stock'] ?? 'available',
    ...(promData?.keywords?.length
      ? { keywords: promData.keywords.join(', ') }
      : {}),
    ...(promData?.quantity
      ? { quantity_in_stock: Number(promData.quantity) }
      : {}),
    ...(promData?.old_price
      ? { oldprice: Number(promData.old_price) }
      : {}),
    ...(promData?.category_id
      ? { group_id: Number(promData.category_id) }
      : {}),
    ...(promData?.sku
      ? { sku: promData.sku }
      : { sku: `SKU-${Date.now()}` }),
  }

  // Спочатку створюємо товар
  const createRes = await fetch('https://my.prom.ua/api/v1/products/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.api_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  })

  const createText = await createRes.text()
  console.log('[PROM CREATE] status:', createRes.status)
  console.log('[PROM CREATE] response:', createText.substring(0, 500))

  let createData
  try {
    createData = JSON.parse(createText)
  } catch {
    throw new Error(`Prom повернув не JSON (${createRes.status}): ${createText.substring(0, 100)}`)
  }

  if (createData.error) throw new Error(`Prom: ${JSON.stringify(createData.error)}`)
  if (createData.errors) throw new Error(`Prom: ${JSON.stringify(createData.errors)}`)

  const productId = createData.id

  // Якщо є фото — додаємо окремим запитом
  if (productId && post.media_urls?.length) {
    const photoRes = await fetch(
      `https://my.prom.ua/api/v1/products/${productId}/photos`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.api_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos: post.media_urls
            .filter((_, i) => post.media_types?.[i] !== 'video')
            .map(url => ({ url })),
        }),
      }
    )
    const photoText = await photoRes.text()
    console.log('[PROM PHOTOS] status:', photoRes.status)
    console.log('[PROM PHOTOS] response:', photoText.substring(0, 200))
  }

  return createData
}