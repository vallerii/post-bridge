import type { PromData } from '@/components/posts/PromFields'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/'/g, '&apos;')
}

interface PostForYml {
  title: string | null
  description: string | null
  price: number | null
  currency: string | null
  media_urls?: string[]
  prom_data: PromData | null
}

export function generatePromYml(post: PostForYml): string {
  const p = post.prom_data
  const offerId = p?.sku || `post-${Date.now()}`
  const name = escapeXml(post.title ?? 'Товар')
  const description = escapeXml(post.description ?? '')
  const price = post.price ?? 0
  const currency = post.currency ?? 'UAH'

  // Availability
  const availabilityMap = {
    in_stock: 'true',
    order: 'false',
    not_available: 'false',
  }
  const available = availabilityMap[p?.availability ?? 'in_stock']

  // Зображення — перше медіа
  const images = (post.media_urls ?? [])
    .filter(url => !url.match(/\.(mp4|mov|avi|webm)$/i))
    .map(url => `      <picture>${escapeXml(url)}</picture>`)
    .join('\n')

  // Група на сайті
  const hasGroup = p?.group_id && p.group_id !== ''
  const groupBlock = hasGroup
    ? `  <categories>\n    <category id="${p!.group_id}">${escapeXml(p!.group_name || 'Група товарів')}</category>\n  </categories>\n`
    : ''

  const categoryId = hasGroup ? p!.group_id : '1'

  // Категорія маркетплейсу
  const marketplaceCat = p?.marketplace_category_id
    ? `\n      <categoryId>${p.marketplace_category_id}</categoryId>`
    : ''

  // Необов'язкові поля
  const oldPrice = p?.old_price ? `\n      <oldprice>${p.old_price}</oldprice>` : ''
  const vendor = p?.vendor ? `\n      <vendor>${escapeXml(p.vendor)}</vendor>` : ''
  const unit = p?.unit ? `\n      <unit>${escapeXml(p.unit)}</unit>` : ''
  const quantity = p?.quantity ? `\n      <quantity_in_stock>${p.quantity}</quantity_in_stock>` : ''
  const keywords = p?.keywords?.length
    ? `\n      <keywords>${escapeXml(p.keywords.join(', '))}</keywords>`
    : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE yml_catalog SYSTEM "shops.dtd">
<yml_catalog date="${new Date().toISOString()}">
  <shop>
${groupBlock}    <offers>
      <offer id="${offerId}" available="${available}">
        <name>${name}</name>
        <name_ua>${name}</name_ua>
        <description>${description}</description>
        <description_ua>${description}</description_ua>
        <price>${price}</price>
        <currencyId>${currency}</currencyId>
        <categoryId>${categoryId}</categoryId>${marketplaceCat}${oldPrice}${vendor}${unit}${quantity}${keywords}
${images ? images + '\n' : ''}      </offer>
    </offers>
  </shop>
</yml_catalog>`
}