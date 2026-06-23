import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

const PLATFORM_META: Record<string, { icon: string; name: string; color: string }> = {
  instagram:   { icon: '📸', name: 'Instagram',   color: 'bg-pink-500/15 text-pink-400' },
  telegram:    { icon: '✈️', name: 'Telegram',    color: 'bg-sky-500/15 text-sky-400' },
  prom:        { icon: '🛒', name: 'Prom.ua',     color: 'bg-orange-500/15 text-orange-400' },
  woocommerce: { icon: '🌐', name: 'WooCommerce', color: 'bg-purple-500/15 text-purple-400' },
  horoshop:    { icon: '🏪', name: 'Horoshop',    color: 'bg-red-500/15 text-red-400' },
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!post) notFound()

  const hasProm = post.targets?.includes('prom')
  const hasHoroshop = post.targets?.includes('horoshop')
  const hasFileDownload = hasProm || hasHoroshop

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/posts"
          className="text-zinc-400 hover:text-white text-sm transition-colors"
        >
          ← Назад
        </Link>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
          ${post.status === 'published'
            ? 'bg-emerald-500/15 text-emerald-400'
            : post.status === 'partial'
            ? 'bg-amber-500/15 text-amber-400'
            : 'bg-zinc-700/50 text-zinc-400'
          }`}>
          {post.status === 'published' ? '✓ Опубліковано'
            : post.status === 'partial' ? '⚠ Частково'
            : 'Чернетка'}
        </span>
      </div>

      {/* Content */}
      <div className="bg-[#17171A] border border-[#2A2A32] rounded-xl p-6 flex flex-col gap-4">
        {post.title && (
          <h1 className="text-white text-xl font-bold">{post.title}</h1>
        )}
        {post.description && (
          <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
            {post.description}
          </p>
        )}
        {post.price && (
          <div className="text-emerald-400 font-semibold">
            💰 {post.price} {post.currency ?? 'UAH'}
          </div>
        )}
      </div>

      {/* Media */}
      {post.media_urls?.length > 0 && (
        <div className="bg-[#17171A] border border-[#2A2A32] rounded-xl p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
            Медіафайли
          </div>
          <div className="grid grid-cols-3 gap-2">
            {post.media_urls.map((url: string, i: number) => (
              <div key={url} className="aspect-square rounded-lg overflow-hidden bg-[#1E1E23]">
                {post.media_types?.[i] === 'video' ? (
                  <video src={url} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platforms */}
      <div className="bg-[#17171A] border border-[#2A2A32] rounded-xl p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
          Платформи
        </div>
        <div className="flex flex-wrap gap-2">
          {(post.targets ?? []).map((t: string) => {
            const m = PLATFORM_META[t]
            return m ? (
              <span key={t} className={`text-sm font-semibold px-3 py-1.5 rounded-full ${m.color}`}>
                {m.icon} {m.name}
              </span>
            ) : null
          })}
        </div>
      </div>

      {/* Завантаження файлів для імпорту */}
      {hasFileDownload && (
        <div className="bg-[#17171A] border border-[#2A2A32] rounded-xl p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Файли для імпорту
          </div>
          <p className="text-zinc-500 text-xs mb-4">
            Завантажте файл і імпортуйте його вручну в кабінеті маркетплейсу
          </p>
          <div className="flex flex-col gap-3">

            {hasProm && (
              <div className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                <div>
                  <div className="text-white text-sm font-semibold">🛒 Prom.ua</div>
                  <div className="text-zinc-500 text-xs mt-0.5">
                    YML файл → Кабінет Prom → Товари → Імпорт
                  </div>
                </div>
                <a
                  href={`/api/posts/${id}/download/prom`}
                  download
                  className="px-4 py-2 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-sm font-semibold hover:bg-orange-500/25 transition-colors whitespace-nowrap"
                >
                  ↓ Завантажити YML
                </a>
              </div>
            )}

            {hasHoroshop && (
              <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <div>
                  <div className="text-white text-sm font-semibold">🏪 Horoshop</div>
                  <div className="text-zinc-500 text-xs mt-0.5">
                    CSV файл → Кабінет Horoshop → Товари → Імпорт
                  </div>
                </div>
                <a
                  href={`/api/posts/${id}/download/horoshop`}
                  download
                  className="px-4 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-colors whitespace-nowrap"
                >
                  ↓ Завантажити CSV
                </a>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Meta */}
      <div className="text-zinc-500 text-xs">
        Створено: {new Date(post.created_at).toLocaleString('uk-UA')}
        {post.published_at && (
          <> · Опубліковано: {new Date(post.published_at).toLocaleString('uk-UA')}</>
        )}
      </div>

    </div>
  )
}