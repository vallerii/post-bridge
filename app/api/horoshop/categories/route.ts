import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getHoroshopToken } from '@/lib/publishers/horoshop'

interface HoroshopPage {
  id: number
  parent: number
  title: Record<string, string>
}

// Захист від надто великих/глибоких каталогів — цього достатньо для
// переважної більшості магазинів, і запит не висітиме нескінченно.
const MAX_NODES = 800
const MAX_DEPTH = 6

async function fetchPages(domain: string, token: string, parent: number): Promise<HoroshopPage[]> {
  const res = await fetch(`https://${domain}/api/pages/export/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, parent }),
  })
  const data = await res.json()
  if (data.status === 'EMPTY') return []
  if (data.status !== 'OK') throw new Error(`Horoshop pages/export: ${JSON.stringify(data)}`)
  return data.response?.pages ?? []
}

function pageName(p: HoroshopPage): string {
  return p.title?.ua || p.title?.ru || Object.values(p.title ?? {})[0] || `#${p.id}`
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: platform } = await supabase
    .from('connected_platforms')
    .select('credentials')
    .eq('user_id', user.id)
    .eq('platform', 'horoshop')
    .eq('is_active', true)
    .single()

  if (!platform) return NextResponse.json({ error: 'Horoshop not connected' }, { status: 400 })

  const credentials = platform.credentials as Record<string, string>
  if (credentials.plan !== 'pro') {
    return NextResponse.json({ error: 'Розділи каталогу підтягуються тільки для тарифу Pro/b2b (є API)' }, { status: 400 })
  }

  const { domain, login, password } = credentials
  if (!domain || !login || !password) {
    return NextResponse.json({ error: 'Немає даних підключення до API Horoshop' }, { status: 400 })
  }

  try {
    const token = await getHoroshopToken(domain, login, password)

    // Рекурсивно обходимо дерево розділів, починаючи з кореня (parent = 0).
    const byId = new Map<number, HoroshopPage>()
    let frontier = [0]
    let depth = 0

    while (frontier.length > 0 && byId.size < MAX_NODES && depth < MAX_DEPTH) {
      const results = await Promise.all(frontier.map(id => fetchPages(domain, token, id)))
      const nextFrontier: number[] = []
      for (const pages of results) {
        for (const p of pages) {
          if (!byId.has(p.id)) {
            byId.set(p.id, p)
            nextFrontier.push(p.id)
          }
        }
      }
      frontier = nextFrontier
      depth += 1
    }

    function buildPath(p: HoroshopPage): string {
      const parent = byId.get(p.parent)
      if (!parent) return pageName(p)
      return `${buildPath(parent)} / ${pageName(p)}`
    }

    const categories = Array.from(byId.values()).map(p => ({
      id: String(p.id),
      name: pageName(p),
      fullPath: buildPath(p),
    }))

    return NextResponse.json({ categories })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Не вдалось завантажити розділи Horoshop' }, { status: 500 })
  }
}
