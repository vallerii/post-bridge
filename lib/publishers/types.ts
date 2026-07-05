export interface PostData {
  id?: string
  title: string | null
  description: string | null
  price: number | null
  currency: string | null
  image_url?: string | null
  media_urls?: string[]
  media_types?: string[]
  prom_data?: unknown
  horoshop_data?: HoroshopData | null
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
  keywords?: string[] // SEO ключові слова / пошукові теги
  condition?: 'new' | 'used'
  color?: string
  material?: string
  custom_fields: Record<string, string> // { "Колір": "червоний", "Матеріал": "тканина" }
  // Розділ каталогу.
  // Pro (є API): category_id — реальний id розділу з Horoshop (pages/export), category_name — його шлях для показу.
  // Basic/Standard (нема API): category_id відсутній, category_name — назва, яку юзер ввів/вибрав вручну.
  category_id?: string
  category_name?: string
}