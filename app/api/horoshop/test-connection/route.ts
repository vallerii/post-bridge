import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { domain, login, password } = await req.json()

  try {
    const res = await fetch(`https://${domain}/api/auth/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    })

    const data = await res.json()

    if (data.status !== 'OK') {
      return NextResponse.json({ ok: false, error: 'Невірний логін або пароль' })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Не вдалось підключитись до магазину' })
  }
}