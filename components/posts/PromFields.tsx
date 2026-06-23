'use client'

import { useState, useEffect } from 'react'

interface PromGroup {
  id: number
  name: string
  parent_group_id: number | null
}

interface PromCategory {
  id: number
  caption: string
}

export interface PromData {
  group_id: string               // група на сайті (необов'язково)
  group_name: string             // назва групи для YML
  marketplace_category_id: string // категорія маркетплейсу (необов'язково)
  old_price: string
  availability: 'in_stock' | 'order' | 'not_available'
  quantity: string
  unit: string
  sku: string
  keywords: string[]
  vendor: string
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

function buildGroupPath(group: PromGroup, all: PromGroup[]): string {
  if (!group.parent_group_id) return group.name
  const parent = all.find(g => g.id === group.parent_group_id)
  if (!parent) return group.name
  return `${buildGroupPath(parent, all)} → ${group.name}`
}

export function PromFields({ value, onChange }: Props) {
  const [groups, setGroups] = useState<PromGroup[]>([])
  const [categories, setCategories] = useState<PromCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [groupSearch, setGroupSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')
  const [keywordInput, setKeywordInput] = useState('')

  useEffect(() => {
    let cancelled = false

    fetch('/api/prom/groups')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        if (data.error) {
          setError(data.error)
        } else {
          setGroups(data.groups ?? [])
          setCategories(data.categories ?? [])
        }
      })
      .catch(() => {
        if (!cancelled) setError('Не вдалось завантажити дані з Prom')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

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

  // Групи з повним шляхом для відображення
  const groupsWithPath = groups.map(g => ({
    ...g,
    fullPath: buildGroupPath(g, groups),
  }))

  const filteredGroups = groupsWithPath.filter(g =>
    g.fullPath.toLowerCase().includes(groupSearch.toLowerCase())
  )

  const filteredCategories = categories.filter(c =>
    c.caption.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const selectedGroup = groupsWithPath.find(g => String(g.id) === value.group_id)
  const selectedCategory = categories.find(c => String(c.id) === value.marketplace_category_id)

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#1E1E23] rounded-xl border border-[#2A2A32]">
      <div className="text-xs font-semibold uppercase tracking-wider text-orange-400">
        🛒 Додаткові поля Prom.ua
      </div>

      {loading && (
        <div className="text-zinc-500 text-sm">Завантаження груп і категорій...</div>
      )}

      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          ⚠️ {error}
        </div>
      )}

      {/* Група на сайті */}
      {!loading && !error && (
        <div>
          <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
            Група на сайті{' '}
            <span className="text-zinc-600">(необов&apos;язково)</span>
          </label>

          {selectedGroup && (
            <div className="mb-2 flex items-center justify-between text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-2.5 py-1.5">
              <span>✓ {selectedGroup.fullPath}</span>
              <button
                onClick={() => { onChange({ ...value, group_id: '' }); setGroupSearch('') }}
                className="text-zinc-500 hover:text-red-400 ml-2"
              >✕</button>
            </div>
          )}

          <input
            className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none mb-1"
            placeholder={groups.length === 0 ? 'Групи відсутні в акаунті' : 'Пошук групи...'}
            value={groupSearch}
            onChange={e => setGroupSearch(e.target.value)}
            disabled={groups.length === 0}
          />

          {groupSearch && (
            <div className="max-h-40 overflow-y-auto border border-[#2A2A32] rounded-lg bg-[#17171A]">
              {filteredGroups.length === 0 ? (
                <div className="p-3 text-zinc-500 text-sm">Нічого не знайдено</div>
              ) : (
                filteredGroups.slice(0, 30).map(g => (
                  <div
                    key={g.id}
                    onClick={() => {
                      onChange({ ...value, group_id: String(g.id), group_name: g.fullPath })
                      setGroupSearch('')
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#2A2A32] transition-colors
                      ${value.group_id === String(g.id) ? 'text-orange-400' : 'text-zinc-300'}`}
                  >
                    {g.fullPath}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Категорія маркетплейсу */}
      {!loading && !error && (
        <div>
          <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
            Категорія маркетплейсу{' '}
            <span className="text-zinc-600">(необов&apos;язково — можна вибрати при імпорті)</span>
          </label>

          {selectedCategory && (
            <div className="mb-2 flex items-center justify-between text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-2.5 py-1.5">
              <span>✓ {selectedCategory.caption}</span>
              <button
                onClick={() => { onChange({ ...value, marketplace_category_id: '' }); setCategorySearch('') }}
                className="text-zinc-500 hover:text-red-400 ml-2"
              >✕</button>
            </div>
          )}

          <input
            className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none mb-1"
            placeholder={categories.length === 0 ? 'Категорії недоступні' : 'Пошук категорії...'}
            value={categorySearch}
            onChange={e => setCategorySearch(e.target.value)}
            disabled={categories.length === 0}
          />

          {categorySearch && (
            <div className="max-h-40 overflow-y-auto border border-[#2A2A32] rounded-lg bg-[#17171A]">
              {filteredCategories.length === 0 ? (
                <div className="p-3 text-zinc-500 text-sm">Нічого не знайдено</div>
              ) : (
                filteredCategories.slice(0, 30).map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onChange({ ...value, marketplace_category_id: String(c.id) })
                      setCategorySearch('')
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#2A2A32] transition-colors
                      ${value.marketplace_category_id === String(c.id) ? 'text-orange-400' : 'text-zinc-300'}`}
                  >
                    {c.caption}
                  </div>
                ))
              )}
            </div>
          )}

          {categories.length === 0 && !loading && (
            <div className="text-zinc-600 text-xs mt-1">
              Можна вибрати категорію вручну при імпорті в кабінеті Prom
            </div>
          )}
        </div>
      )}

      {/* Виробник */}
      <div>
        <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
          Виробник <span className="text-zinc-600">(необов&apos;язково)</span>
        </label>
        <input
          className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none"
          placeholder="Samsung, Apple, Nike..."
          value={value.vendor}
          onChange={e => onChange({ ...value, vendor: e.target.value })}
        />
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
            {['шт','кг','г','м','см','л','мл','пара','комплект'].map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SKU */}
      <div>
        <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
          Артикул (SKU){' '}
          <span className="text-zinc-600">(необов&apos;язково)</span>
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
                >✕</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}