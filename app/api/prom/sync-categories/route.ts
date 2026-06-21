import { NextResponse } from 'next/server'
import { syncPromCategories } from '@/lib/prom/sync-categories'

export async function POST() {
  try {
    const result = await syncPromCategories()
    return NextResponse.json(result)
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}