import type { PostData } from './types'

export async function getHoroshopToken(domain: string, login: string, password: string): Promise<string> {
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
  const token = await getHoroshopToken(domain, login, password)

  const h = post.horoshop_data

  // Значення наявності, які очікує Horoshop API (див. документацію catalog/import).
  const PRESENCE_MAP = {
    in_stock: 'у наявності',
    order: 'очікується',
    not_available: 'немає в наявності',
  }

  // Артикул обов'язковий для Horoshop. Якщо юзер не вказав — генеруємо стабільний код
  // на основі id поста (той самий пост завжди дасть той самий артикул), як і в CSV
  // (lib/generators/horoshop-csv.ts), щоб не плодити випадкові значення при повторних спробах.
  const sku = h?.sku?.trim() || (post.id ? `HRSH-${post.id.slice(0, 8).toUpperCase()}` : `SKU-${Date.now()}`)

  const product: Record<string, unknown> = {
    article: sku,
    'title.ua': post.title,
    'description.ua': post.description ?? '',
    price: Number(post.price) || 0,
    currency: post.currency ?? 'UAH',
    presence: PRESENCE_MAP[h?.availability ?? 'in_stock'],
    // parent — обов'язковий для НОВИХ товарів. Беремо id розділу, який юзер обрав
    // через живий пошук по каталогу Horoshop (див. /api/horoshop/categories).
    ...(h?.category_id ? { parent: { id: h.category_id } } : {}),
    ...(h?.old_price ? { price_old: Number(h.old_price) } : {}),
    ...(h?.keywords?.length ? { seo_keywords: h.keywords.join(', ') } : {}),
    // Колір/матеріал/стан — за наявною (не офіційно підтвердженою на 100%) документацією
    // Horoshop API. Якщо після реальної публікації виявиться, що назви полів інші —
    // це єдине місце, яке треба поправити.
    ...(h?.color ? { color: h.color } : {}),
    ...(h?.material ? { characteristics: { material: h.material } } : {}),
    ...(h?.condition === 'used' ? { condition: 'б/в' } : {}),
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