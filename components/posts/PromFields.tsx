'use client'

import { useState, useEffect, useCallback } from 'react'

interface Category {
  external_id: string
  name: string
  full_path: string
}

export interface PromData {
  category_id: string
  old_price: string
  availability: 'in_stock' | 'order' | 'not_available'
  quantity: string
  unit: string
  sku: string
  keywords: string[]
}

interface Props {
  value: PromData
  onChange: (data: PromData) => void
}

const AVAILABILITY_OPTIONS = [
  { value: 'in_stock',      label: '✅ В наявності' },
  { value: 'order',         label: '🔄 Під замовлення' },
  { value: 'not_available', label: '❌ Немає в наявності' },
]

export function PromFields({ value, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')

  const loadCategories = useCallback(async () => {
    const res = await fetch('/api/prom/categories')
    const data = await res.json()
    setCategories(data.categories ?? [])
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const res = await fetch('/api/prom/categories')
      const data = await res.json()
      if (!cancelled) setCategories(data.categories ?? [])
    }

    load()
    return () => { cancelled = true }
  }, [])

  async function handleSync() {
    setSyncing(true)
    try {
      await fetch('/api/prom/sync-categories', { method: 'POST' })
      await loadCategories()
    } finally {
      setSyncing(false)
    }
  }

  function addKeyword(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault()
      if (!value.keywords.includes(keywordInput.trim())) {
        onChange({ ...value, keywords: [...value.keywords, keywordInput.trim()] })
      }
      setKeywordInput('')
    }
  }

  function removeKeyword(kw: string) {
    onChange({ ...value, keywords: value.keywords.filter(k => k !== kw) })
  }

  const filtered = categories.filter(c =>
    c.full_path.toLowerCase().includes(search.toLowerCase())
  )

  const selectedCategory = categories.find(c => c.external_id === value.category_id)

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#1E1E23] rounded-xl border border-[#2A2A32]">
      <div className="text-xs font-semibold uppercase tracking-wider text-orange-400">
        🛒 Додаткові поля Prom.ua
      </div>

      {/* Категорія */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-zinc-400 text-sm font-semibold">
            Категорія <span className="text-red-400">*</span>
          </label>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="text-xs text-[#A78BFA] hover:underline disabled:opacity-50"
          >
            {syncing ? 'Оновлення...' : '🔄 Оновити категорії'}
          </button>
        </div>

        {selectedCategory && (
          <div className="mb-2 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-2.5 py-1.5">
            ✓ {selectedCategory.full_path}
          </div>
        )}

        <input
          className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none mb-1"
          placeholder="Пошук категорії..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {search && (
          <div className="max-h-48 overflow-y-auto border border-[#2A2A32] rounded-lg bg-[#17171A]">
            {filtered.length === 0 ? (
              <div className="p-3 text-zinc-500 text-sm">Нічого не знайдено</div>
            ) : (
              filtered.slice(0, 30).map(c => (
                <div
                  key={c.external_id}
                  onClick={() => {
                    onChange({ ...value, category_id: c.external_id })
                    setSearch('')
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#2A2A32] transition-colors
                    ${value.category_id === c.external_id ? 'text-orange-400' : 'text-zinc-300'}`}
                >
                  {c.full_path}
                </div>
              ))
            )}
          </div>
        )}

        {categories.length === 0 && (
          <div className="text-zinc-500 text-xs mt-1">
            Категорії не завантажені —{' '}
            <button onClick={handleSync} className="text-[#A78BFA] hover:underline">
              завантажити
            </button>
          </div>
        )}
      </div>

      {/* Стара ціна */}
      <div>
        <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
          Стара ціна <span className="text-zinc-600">(необов&apos;язково)</span>
        </label>
        <input
          type="number"
          className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none"
          placeholder="0.00"
          value={value.old_price}
          onChange={e => onChange({ ...value, old_price: e.target.value })}
        />
      </div>

      {/* Наявність */}
      <div>
        <label className="text-zinc-400 text-sm font-semibold block mb-1.5">Наявність</label>
        <div className="flex flex-col gap-1.5">
          {AVAILABILITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...value, availability: opt.value as PromData['availability'] })}
              className={`text-left px-3 py-2 rounded-lg border text-sm transition-all
                ${value.availability === opt.value
                  ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
                  : 'border-[#2A2A32] text-zinc-400 hover:border-zinc-500'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Кількість та одиниця */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-zinc-400 text-sm font-semibold block mb-1.5">Кількість</label>
          <input
            type="number"
            className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none"
            placeholder="0"
            value={value.quantity}
            onChange={e => onChange({ ...value, quantity: e.target.value })}
          />
        </div>
        <div>
          <label className="text-zinc-400 text-sm font-semibold block mb-1.5">Одиниця</label>
          <select
            className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none"
            value={value.unit}
            onChange={e => onChange({ ...value, unit: e.target.value })}
          >
            <option value="шт">шт</option>
            <option value="кг">кг</option>
            <option value="г">г</option>
            <option value="м">м</option>
            <option value="см">см</option>
            <option value="л">л</option>
            <option value="мл">мл</option>
            <option value="пара">пара</option>
            <option value="комплект">комплект</option>
          </select>
        </div>
      </div>

      {/* SKU */}
      <div>
        <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
          Артикул (SKU){' '}
          <span className="text-zinc-600">({"необов'язково — згенерується автоматично"})</span>
        </label>
        <input
          className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none font-mono"
          placeholder="ABC-123"
          value={value.sku}
          onChange={e => onChange({ ...value, sku: e.target.value })}
        />
      </div>

      {/* Ключові слова */}
      <div>
        <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
          Пошукові запити (теги)
        </label>
        <input
          className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none"
          placeholder="Введіть тег і натисніть Enter"
          value={keywordInput}
          onChange={e => setKeywordInput(e.target.value)}
          onKeyDown={addKeyword}
        />
        {value.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {value.keywords.map(kw => (
              <span
                key={kw}
                className="flex items-center gap-1 bg-[#2A2A32] text-zinc-300 text-xs px-2 py-1 rounded-full"
              >
                {kw}
                <button
                  onClick={() => removeKeyword(kw)}
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}