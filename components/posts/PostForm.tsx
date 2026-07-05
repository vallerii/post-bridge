'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/lib/posts/actions'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MediaUpload } from './MediaUpload'
import type { MediaFile } from '@/lib/storage/upload'
import { PromFields, type PromData } from './PromFields'
import { HoroshopFields } from './HoroshopFields'
import type { HoroshopData } from '@/lib/publishers/types'
import { SharedMarketplaceFields, type SharedMarketplaceData } from './SharedMarketplaceFields'


const PLATFORM_META: Record<string, {
  name: string; icon: string; chipClass: string
  maxChars: number; needsTitle: boolean; needsPrice: boolean
}> = {
  instagram:   { name: 'Instagram',   icon: '📸', chipClass: 'border-pink-500/50 bg-pink-500/10 text-pink-400',     maxChars: 2200, needsTitle: false, needsPrice: false },
  telegram:    { name: 'Telegram',    icon: '✈️', chipClass: 'border-sky-500/50 bg-sky-500/10 text-sky-400',        maxChars: 4096, needsTitle: false, needsPrice: false },
  prom:        { name: 'Prom.ua',     icon: '🛒', chipClass: 'border-[#7b04df]/50 bg-[#7b04df]/10 text-[#7b04df]', maxChars: 9999, needsTitle: true,  needsPrice: true },
  woocommerce: { name: 'WooCommerce', icon: '🌐', chipClass: 'border-purple-500/50 bg-purple-500/10 text-purple-400', maxChars: 9999, needsTitle: true,  needsPrice: true },
  horoshop:    { name: 'Horoshop',    icon: '🏪', chipClass: 'border-[#f6d811]/50 bg-[#f6d811]/10 text-[#f6d811]', maxChars: 9999, needsTitle: true,  needsPrice: true },
}

interface Props {
  connectedPlatforms: string[]
}

export function PostForm({ connectedPlatforms }: Props) {
  const router = useRouter()
  const [targets, setTargets] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('UAH')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [media, setMedia] = useState<MediaFile[]>([])
  const [userId, setUserId] = useState<string>('')
  const [promData, setPromData] = useState<PromData>({
    group_id: '',
    group_name: '',
    group_parent_id: '',
    old_price: '',
    availability: 'in_stock',
    quantity: '',
    unit: 'шт',
    sku: '',
    keywords: [],
    vendor: '',
    custom_fields: {},
    category_url: '',
  })
  const [horoshopData, setHoroshopData] = useState<HoroshopData>({
    sku: '',
    old_price: '',
    availability: 'in_stock',
    quantity: '',
    custom_fields: {},
    category_id: '',
    category_name: '',
  })
  // Поля, спільні для Prom і Horoshop (щоб не заповнювати їх двічі, коли обрані обидві
  // платформи) — підставляються в promData/horoshopData перед відправкою в handleSubmit.
  const [sharedData, setSharedData] = useState<SharedMarketplaceData>({
    old_price: '',
    quantity: '',
    availability: 'in_stock',
    keywords: [],
    condition: 'new',
    color: '',
    material: '',
  })

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  function toggleTarget(p: string) {
    setTargets(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  const needsPrice = targets.some(t => PLATFORM_META[t]?.needsPrice)
  const needsTitle = targets.some(t => PLATFORM_META[t]?.needsTitle)

  function getValidation(p: string) {
    const m = PLATFORM_META[p]
    const errors: string[] = []
    const warns: string[] = []
    if (m.needsTitle && !title.trim()) errors.push('потрібен заголовок')
    if (!desc.trim() && !title.trim()) errors.push('потрібен текст')
    if (m.needsPrice && !price) warns.push('немає ціни')
    if (desc.length > m.maxChars) errors.push(`текст > ${m.maxChars} символів`)
    // Horoshop (CSV-імпорт для Basic/Standard) вимагає розділ каталогу як обов'язкове
    // поле для нового товару — без нього імпорт цього рядка впаде з помилкою. Для Pro
    // (публікація напряму через API) це не так критично, але попередження не завадить.
    if (p === 'horoshop' && !horoshopData.category_name) warns.push('не вказано розділ каталогу')
    return { ok: errors.length === 0, errors, warns }
  }

  const canPublish = targets.length > 0 && targets.every(t => getValidation(t).ok)

  async function handleSubmit(status: 'draft' | 'published') {
    setLoading(true)
    setError('')
    try {
      // Спільні поля (стара ціна / наявність / кількість / теги) підставляються
      // однаково в обидва об'єкти — юзер заповнює їх один раз для обох платформ.
      const finalPromData: PromData = { ...promData, ...sharedData }
      const finalHoroshopData: HoroshopData = { ...horoshopData, ...sharedData }

      const result = await createPost({
        title,
        description: desc,
        price,
        currency,
        targets,
        status,
        media_urls: media.map(f => f.url),
        media_types: media.map(f => f.type),
        prom_data: targets.includes('prom') ? finalPromData : null,
        horoshop_data: targets.includes('horoshop') ? finalHoroshopData : null,
      })
      router.push(`/posts/${result.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Помилка')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* 1. Вибір платформ */}
      <div className="bg-[#17171A] border border-[#2A2A32] rounded-xl p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
          1. Вибір платформ
        </div>

        {connectedPlatforms.length === 0 ? (
          <div className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            ⚠️ Немає підключених платформ.{' '}
            <a href="/platforms" className="underline">Підключити →</a>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {connectedPlatforms.map((p) => {
              const m = PLATFORM_META[p]
              const selected = targets.includes(p)
              return (
                <button
                  key={p}
                  onClick={() => toggleTarget(p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all
                    ${selected ? m.chipClass : 'border-[#2A2A32] bg-[#1E1E23] text-zinc-400 hover:border-zinc-500'}`}
                >
                  {m.icon} {m.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 2. Контент */}
      <div className="bg-[#17171A] border border-[#2A2A32] rounded-xl p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
          2. Контент
        </div>
        <div>
          <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
            Медіафайли
          </label>
          {userId && (
            <MediaUpload
              userId={userId}
              value={media}
              onChange={setMedia}
            />
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
              Заголовок{' '}
              {needsTitle && <span className="text-red-400">*</span>}
              {!needsTitle && <span className="text-zinc-600">({"обов'язково для Prom / WooCommerce"})</span>}
            </label>
            <input
              className="w-full bg-[#1E1E23] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-colors"
              placeholder="Назва товару або послуги"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm font-semibold block mb-1.5">Опис / текст поста</label>
            <textarea
              rows={5}
              className="w-full bg-[#1E1E23] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-colors resize-none"
              placeholder="Опишіть товар або послугу..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
            <div className={`text-xs text-right mt-1 ${desc.length > 2200 && targets.includes('instagram') ? 'text-amber-400' : 'text-zinc-600'}`}>
              {desc.length} символів
            </div>
          </div>

          {needsPrice && (
            <div>
              <label className="text-zinc-400 text-sm font-semibold block mb-1.5">Ціна</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="flex-1 bg-[#1E1E23] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-colors"
                  placeholder="0.00"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
                <select
                  className="bg-[#1E1E23] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-colors"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                >
                  <option>UAH</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
              </div>
            </div>
          )}

          {(targets.includes('prom') || targets.includes('horoshop')) && (
            <SharedMarketplaceFields value={sharedData} onChange={setSharedData} />
          )}

          {targets.includes('prom') && (
            <PromFields value={promData} onChange={setPromData} />
          )}

          {targets.includes('horoshop') && (
            <HoroshopFields value={horoshopData} onChange={setHoroshopData} />
          )}
        </div>
      </div>

      {/* 3. Валідація */}
      {targets.length > 0 && (
        <div className="bg-[#17171A] border border-[#2A2A32] rounded-xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
            3. Перевірка по платформах
          </div>
          <div className="flex flex-col divide-y divide-[#2A2A32]">
            {targets.map((p) => {
              const m = PLATFORM_META[p]
              const { ok, errors, warns } = getValidation(p)
              const icon = !ok ? '❌' : warns.length ? '⚠️' : '✅'
              const msg = !ok ? errors.join(', ') : warns.length ? warns.join(', ') : 'готово до публікації'
              const msgColor = !ok ? 'text-red-400' : warns.length ? 'text-amber-400' : 'text-emerald-400'
              return (
                <div key={p} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span>{icon}</span>
                  <span className="text-white text-sm font-semibold w-28 shrink-0">{m.name}</span>
                  <span className={`text-sm ${msgColor}`}>{msg}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => handleSubmit('draft')}
          disabled={loading || (!title.trim() && !desc.trim())}
          className="px-4 py-2.5 rounded-lg bg-[#1E1E23] border border-[#2A2A32] hover:border-zinc-500 text-zinc-300 text-sm font-semibold transition-colors disabled:opacity-40"
        >
          💾 Зберегти чернетку
        </button>
        <button
          onClick={() => handleSubmit('published')}
          disabled={loading || !canPublish}
          className="flex-1 py-2.5 rounded-lg bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 text-white text-sm font-semibold transition-colors"
        >
          {loading ? 'Публікуємо...' : '🚀 Опублікувати'}
        </button>
      </div>
    </div>
  )
}