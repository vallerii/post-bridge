import Link from 'next/link'

const PLATFORM_META: Record<string, { icon: string; name: string; color: string }> = {
  instagram:   { icon: '📸', name: 'Instagram',    color: 'bg-pink-500/15 text-pink-400' },
  telegram:    { icon: '✈️', name: 'Telegram',     color: 'bg-sky-500/15 text-sky-400' },
  prom:        { icon: '🛒', name: 'Prom.ua',      color: 'bg-orange-500/15 text-orange-400' },
  woocommerce: { icon: '🌐', name: 'WooCommerce',  color: 'bg-purple-500/15 text-purple-400' },
}

interface Post {
  id: string
  title: string | null
  description: string | null
  status: string
  targets: string[]
  created_at: string
  price: number | null
  currency: string | null
}

interface Props {
  posts: Post[]
}

export function PostList({ posts }: Props) {
  if (!posts.length) {
    return (
      <div className="bg-[#17171A] border border-[#2A2A32] rounded-xl p-12 text-center">
        <div className="text-4xl mb-3">📋</div>
        <div className="text-white font-bold mb-2">Публікацій ще немає</div>
        <div className="text-zinc-400 text-sm mb-5">Створіть перший пост</div>
        <Link
          href="/posts/new"
          className="inline-block bg-[#6C63FF] hover:bg-[#7B74FF] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          Новий пост
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <Link key={post.id} href={`/posts/${post.id}`}>
          <div
            className="bg-[#17171A] border border-[#2A2A32] hover:border-[#6C63FF]/50 rounded-xl p-4 flex items-start gap-4 transition-colors"
          >
            {/* icon */}
            <div className="w-12 h-12 rounded-lg bg-[#1E1E23] flex items-center justify-center text-2xl shrink-0">
              {post.targets?.[0] ? PLATFORM_META[post.targets[0]]?.icon ?? '📝' : '📝'}
            </div>

            {/* content */}
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold truncate">
                {post.title || post.description?.substring(0, 60) || 'Без назви'}
              </div>
              <div className="text-zinc-500 text-xs mt-1">
                {new Date(post.created_at).toLocaleDateString('uk-UA')}
                {post.price ? ` • ${post.price} ${post.currency ?? 'UAH'}` : ''}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(post.targets ?? []).map((t) => {
                  const m = PLATFORM_META[t]
                  return m ? (
                    <span key={t} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.color}`}>
                      {m.icon} {m.name}
                    </span>
                  ) : null
                })}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                  ${post.status === 'published'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-zinc-700/50 text-zinc-400'
                  }`}>
                  {post.status === 'published' ? '✓ Опубліковано' : 'Чернетка'}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}