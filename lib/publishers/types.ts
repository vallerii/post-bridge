export interface PostData {
  title: string | null
  description: string | null
  price: number | null
  currency: string | null
  image_url?: string | null
  media_urls?: string[]
  media_types?: string[]
  prom_data?: unknown
}

export type Publisher = (
  post: PostData,
  credentials: Record<string, string>
) => Promise<unknown>

export interface HoroshopData {
  sku: string
  old_price: string
  availability: 'in_stock' | 'order' | 'not_available'
  quantity: string
  custom_fields: Record<string, string> // { "Колір": "червоний", "Матеріал": "тканина" }
}