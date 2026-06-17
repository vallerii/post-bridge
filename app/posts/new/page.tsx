import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getConnectedPlatforms } from '@/lib/platforms/get-platforms'
import { PostForm } from '@/components/posts/PostForm'

export default async function NewPostPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const connectedPlatforms = await getConnectedPlatforms()

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Новий пост</h1>
        <p className="mt-1 text-sm text-zinc-400">Заповніть один раз — опублікуйте скрізь</p>
      </div>

      <PostForm connectedPlatforms={connectedPlatforms} />
    </div>
  )
}