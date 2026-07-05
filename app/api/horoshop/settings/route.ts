import { NextResponse, NextRequest} from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { filterReservedHoroshopFields } from '@/lib/horoshop/reserved-fields'

// custom_fields / categories зберігаються в credentials як JSON-рядок (легасі рішення),
// тому завжди парсимо на випадок якщо десь колись потрапить "голий" масив.
function parseList(raw: unknown): string[] {
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : (raw as string[]) ?? []
  } catch {
    return []
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ custom_fields: [], categories: [], plan: null })

  const { data } = await supabase
    .from('connected_platforms')
    .select('credentials')
    .eq('user_id', user.id)
    .eq('platform', 'horoshop')
    .eq('is_active', true)
    .single()

  if (!data) return NextResponse.json({ custom_fields: [], categories: [], plan: null })

  const credentials = data.credentials as Record<string, unknown>
  return NextResponse.json({
    // filterReservedHoroshopFields — на випадок якщо в даних лишився дублікат базової
    // колонки (напр. "Кількість"), збережений до того, як з'явилась ця перевірка.
    custom_fields: filterReservedHoroshopFields(parseList(credentials.custom_fields)),
    // Розділи, які юзер сам ввів вручну — актуально тільки для Basic/Standard (нема API).
    categories: parseList(credentials.categories),
    plan: (credentials.plan as string) ?? null,
  })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { custom_fields?: string[]; categories?: string[] }

  // Отримуємо поточні credentials
  const { data } = await supabase
    .from('connected_platforms')
    .select('credentials')
    .eq('user_id', user.id)
    .eq('platform', 'horoshop')
    .eq('is_active', true)
    .single()

  if (!data) return NextResponse.json({ error: 'Horoshop not connected' }, { status: 400 })

  const credentials = data.credentials as Record<string, unknown>

  const updatedCredentials: Record<string, unknown> = { ...credentials }
  if (body.custom_fields !== undefined) {
    // Не даємо зберегти характеристику з назвою, яка збігається з базовою колонкою CSV
    // (напр. "Кількість") — інакше в файлі буде дублікат і Horoshop відхилить імпорт.
    updatedCredentials.custom_fields = JSON.stringify(filterReservedHoroshopFields(body.custom_fields))
  }
  if (body.categories !== undefined) {
    updatedCredentials.categories = JSON.stringify(body.categories)
  }

  const { error } = await supabase
    .from('connected_platforms')
    .update({ credentials: updatedCredentials })
    .eq('user_id', user.id)
    .eq('platform', 'horoshop')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}