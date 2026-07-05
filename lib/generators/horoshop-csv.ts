import { HoroshopData } from "../publishers/types"
import { HOROSHOP_RESERVED_FIELDS, filterReservedHoroshopFields } from "../horoshop/reserved-fields"

interface PostForCsv {
  id: string
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

const CONDITION_MAP = {
  new: 'Новий',
  used: 'Вживаний',
}

export function generateHoroshopCsv(post: PostForCsv, customFieldNames: string[]): string {
  const h = post.horoshop_data

  // Базові колонки (єдине джерело правди — HOROSHOP_RESERVED_FIELDS, щоб порядок і
  // назви завжди збігались з перевіркою дублікатів у налаштуваннях характеристик).
  const baseHeaders = HOROSHOP_RESERVED_FIELDS

  // Відсікаємо характеристики, які юзер міг зберегти з такою ж назвою, як базова колонка
  // (напр. свою "Кількість") — інакше в CSV буде дві однакові колонки і Horoshop
  // відмовиться імпортувати файл. Основний захист — при збереженні в налаштуваннях
  // (app/api/horoshop/settings/route.ts), тут — підстраховка на випадок старих даних.
  const safeCustomFieldNames = filterReservedHoroshopFields(customFieldNames)

  const headers = [...baseHeaders, ...safeCustomFieldNames]

  // Значення
  const availabilityLabel = AVAILABILITY_MAP[h?.availability ?? 'in_stock']
  const photos = (post.media_urls ?? [])
    .filter(url => !url.match(/\.(mp4|mov|avi|webm)$/i))
    .join('; ')

  // Артикул обов'язковий для імпорту в Horoshop. Якщо юзер не вказав — генеруємо
  // стабільний код на основі id поста (той самий пост завжди дасть той самий артикул,
  // навіть якщо файл перезавантажити кілька разів).
  const sku = h?.sku?.trim() || `HRSH-${post.id.slice(0, 8).toUpperCase()}`

  const baseValues = [
    post.title ?? '',
    h?.category_name ?? '',
    sku,
    String(post.price ?? ''),
    h?.old_price ?? '',
    post.currency ?? 'UAH',
    availabilityLabel,
    h?.quantity ?? '',
    CONDITION_MAP[h?.condition ?? 'new'],
    h?.color ?? '',
    h?.material ?? '',
    post.description ?? '',
    photos,
    h?.keywords?.join(', ') ?? '',
  ]

  const customValues = safeCustomFieldNames.map(name => h?.custom_fields?.[name] ?? '')

  const values = [...baseValues, ...customValues]

  const headerRow = headers.map(escapeCsv).join(',')
  const dataRow = values.map(escapeCsv).join(',')

  return `\uFEFF${headerRow}\n${dataRow}\n`
  // \uFEFF — BOM для коректного відкриття в Excel з UTF-8
}