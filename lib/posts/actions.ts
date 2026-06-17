'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: {
  title: string
  description: string
  price: string
  currency: string
  targets: string[]
  status: 'draft' | 'published'
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      title: formData.title || null,
      description: formData.description || null,
      price: formData.price ? parseFloat(formData.price) : null,
      currency: formData.currency,
      targets: formData.targets,
      status: formData.status,
      published_at: formData.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/posts')
  revalidatePath('/dashboard')

  if (formData.status === 'published') {
    // тут буде виклик реальних API платформ
    await publishToPlatforms(data.id, formData.targets)
  }

  redirect('/posts')
}

async function publishToPlatforms(postId: string, _targets: string[]) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error ?? 'Publish failed')
  }

  return res.json()
}