import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePromYml } from '@/lib/generators/prom-yml'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!post.targets?.includes('prom')) {
    return NextResponse.json({ error: 'Post not targeted at Prom' }, { status: 400 })
  }

  const yml = generatePromYml({
    id: post.id,
    title: post.title,
    description: post.description,
    price: post.price,
    currency: post.currency,
    media_urls: post.media_urls ?? [],
    prom_data: post.prom_data ?? null,
  })

  const filename = `prom-${id.slice(0, 8)}.yml`

  return new NextResponse(yml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}