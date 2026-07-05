import { NextResponse, NextRequest} from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ custom_fields: [] })

  const { data } = await supabase
    .from('connected_platforms')
    .select('credentials')
    .eq('user_id', user.id)
    .eq('platform', 'horoshop')
    .eq('is_active', true)
    .single()

  if (!data) return NextResponse.json({ custom_fields: [] })

  const credentials = data.credentials as Record<string, unknown>
  // custom_fields зберігається як JSON рядок або масив
  let customFields: string[] = []
  try {
    const raw = credentials.custom_fields
    customFields = typeof raw === 'string' ? JSON.parse(raw) : (raw as string[]) ?? []
  } catch { customFields = [] }
  return NextResponse.json({ custom_fields: customFields })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { custom_fields } = await req.json() as { custom_fields: string[] }

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

  const { error } = await supabase
    .from('connected_platforms')
    .update({
      credentials: { ...credentials, custom_fields: JSON.stringify(custom_fields) },
    })
    .eq('user_id', user.id)
    .eq('platform', 'horoshop')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}