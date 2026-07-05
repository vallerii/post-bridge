import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateHoroshopCsv } from '@/lib/generators/horoshop-csv'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Пост
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!post.targets?.includes('horoshop')) {
    return NextResponse.json({ error: 'Post not targeted at Horoshop' }, { status: 400 })
  }

  // Отримуємо custom_fields з налаштувань платформи
  const { data: platform } = await supabase
    .from('connected_platforms')
    .select('credentials')
    .eq('user_id', user.id)
    .eq('platform', 'horoshop')
    .eq('is_active', true)
    .single()

  const credentials = (platform?.credentials ?? {}) as Record<string, unknown>
  const customFieldNames = (credentials.custom_fields as string[]) ?? []

  const csv = generateHoroshopCsv(
    {
      title: post.title,
      description: post.description,
      price: post.price,
      currency: post.currency,
      media_urls: post.media_urls ?? [],
      horoshop_data: post.horoshop_data ?? null,
    },
    customFieldNames
  )

  const filename = `horoshop-${id.slice(0, 8)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}