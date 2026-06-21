import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ categories: [] })

  const { data } = await supabase
    .from('marketplace_categories')
    .select('external_id, name, full_path')
    .eq('user_id', user.id)
    .eq('platform', 'prom')
    .order('full_path')

  return NextResponse.json({ categories: data ?? [] })
}