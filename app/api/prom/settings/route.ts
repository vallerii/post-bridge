import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// custom_fields зберігається в credentials як JSON-рядок (той самий підхід, що і для
// Horoshop — див. app/api/horoshop/settings/route.ts), тому завжди парсимо на випадок
// якщо десь колись потрапить "голий" масив.
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
  if (!user) return NextResponse.json({ custom_fields: [] })

  const { data } = await supabase
    .from('connected_platforms')
    .select('credentials')
    .eq('user_id', user.id)
    .eq('platform', 'prom')
    .eq('is_active', true)
    .single()

  if (!data) return NextResponse.json({ custom_fields: [] })

  const credentials = data.credentials as Record<string, unknown>
  return NextResponse.json({
    custom_fields: parseList(credentials.custom_fields),
  })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { custom_fields?: string[] }

  const { data } = await supabase
    .from('connected_platforms')
    .select('credentials')
    .eq('user_id', user.id)
    .eq('platform', 'prom')
    .eq('is_active', true)
    .single()

  if (!data) return NextResponse.json({ error: 'Prom not connected' }, { status: 400 })

  const credentials = data.credentials as Record<string, unknown>

  const updatedCredentials: Record<string, unknown> = { ...credentials }
  if (body.custom_fields !== undefined) {
    updatedCredentials.custom_fields = JSON.stringify(body.custom_fields)
  }

  const { error } = await supabase
    .from('connected_platforms')
    .update({ credentials: updatedCredentials })
    .eq('user_id', user.id)
    .eq('platform', 'prom')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
