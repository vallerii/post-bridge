import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPosts } from '@/lib/posts/get-posts'
import { PostList } from '@/components/posts/PostList'
import Link from 'next/link'

export default async function PostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const posts = await getPosts()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Публікації</h1>
          <p className="mt-1 text-sm text-zinc-400">Всі пости та чернетки</p>
        </div>
        <Link
          href="/posts/new"
          className="bg-[#6C63FF] hover:bg-[#7B74FF] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          ✏️ Новий пост
        </Link>
      </div>

      <PostList posts={posts} />
    </div>
  )
}