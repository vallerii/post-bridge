import { HoroshopData } from "../publishers/types"

interface PostForCsv {
  title: string | null
  description: string | null
  price: number | null
  currency: string | null
  media_urls?: string[]
  horoshop_data: HoroshopData | null
}

function escapeCsv(val: string): string {
  if (val.includes('"') || val.includes(',') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

const AVAILABILITY_MAP = {
  in_stock: 'Є в наявності',
  order: 'Під замовлення',
  not_available: 'Немає в наявності',
}

export function generateHoroshopCsv(post: PostForCsv, customFieldNames: string[]): string {
  const h = post.horoshop_data

  // Базові колонки
  const baseHeaders = [
    'Назва',
    'Артикул',
    'Ціна',
    'Стара ціна',
    'Валюта',
    'Наявність',
    'Кількість',
    'Опис',
    'Фото',
  ]

  const headers = [...baseHeaders, ...customFieldNames]

  // Значення
  const availabilityLabel = AVAILABILITY_MAP[h?.availability ?? 'in_stock']
  const photos = (post.media_urls ?? [])
    .filter(url => !url.match(/\.(mp4|mov|avi|webm)$/i))
    .join('; ')

  const baseValues = [
    post.title ?? '',
    h?.sku ?? '',
    String(post.price ?? ''),
    h?.old_price ?? '',
    post.currency ?? 'UAH',
    availabilityLabel,
    h?.quantity ?? '',
    post.description ?? '',
    photos,
  ]

  const customValues = customFieldNames.map(name => h?.custom_fields?.[name] ?? '')

  const values = [...baseValues, ...customValues]

  const headerRow = headers.map(escapeCsv).join(',')
  const dataRow = values.map(escapeCsv).join(',')

  return `\uFEFF${headerRow}\n${dataRow}\n`
  // \uFEFF — BOM для коректного відкриття в Excel з UTF-8
}