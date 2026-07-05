'use client'

import { useState } from 'react'

export interface SharedMarketplaceData {
  old_price: string
  quantity: string
  availability: 'in_stock' | 'order' | 'not_available'
  keywords: string[]
  condition: 'new' | 'used'
  color: string
  material: string
}

interface Props {
  value: SharedMarketplaceData
  onChange: (data: SharedMarketplaceData) => void
}

const AVAILABILITY_OPTIONS = [
  { value: 'in_stock',      label: '✅ В наявності' },
  { value: 'order',         label: '🔄 Під замовлення' },
  { value: 'not_available', label: '❌ Немає в наявності' },
]

const CONDITION_OPTIONS = [
  { value: 'new',  label: '✨ Новий' },
  { value: 'used', label: '♻️ Вживаний' },
]

// Поля, однакові для Prom і Horoshop — щоб не заповнювати їх двічі,
// коли обрані обидві платформи. Значення підставляються в prom_data
// і horoshop_data однаково при відправці (PostForm.tsx).
export function SharedMarketplaceFields({ value, onChange }: Props) {
  const [keywordInput, setKeywordInput] = useState('')

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

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#1E1E23] rounded-xl border border-[#2A2A32]">
      <div className="text-xs font-semibold uppercase tracking-wider text-[#A78BFA]">
        🔗 Спільні поля для Prom.ua та Horoshop
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
              onClick={() => onChange({ ...value, availability: opt.value as SharedMarketplaceData['availability'] })}
              className={`text-left px-3 py-2 rounded-lg border text-sm transition-all
                ${value.availability === opt.value
                  ? 'border-[#6C63FF]/50 bg-[#6C63FF]/10 text-[#A78BFA]'
                  : 'border-[#2A2A32] text-zinc-400 hover:border-zinc-500'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Кількість */}
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

      {/* Стан */}
      <div>
        <label className="text-zinc-400 text-sm font-semibold block mb-1.5">Стан</label>
        <div className="flex gap-1.5">
          {CONDITION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...value, condition: opt.value as SharedMarketplaceData['condition'] })}
              className={`flex-1 text-center px-3 py-2 rounded-lg border text-sm transition-all
                ${value.condition === opt.value
                  ? 'border-[#6C63FF]/50 bg-[#6C63FF]/10 text-[#A78BFA]'
                  : 'border-[#2A2A32] text-zinc-400 hover:border-zinc-500'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Колір */}
      <div>
        <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
          Колір <span className="text-zinc-600">(необов&apos;язково)</span>
        </label>
        <input
          className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none"
          placeholder="Наприклад: червоний"
          value={value.color}
          onChange={e => onChange({ ...value, color: e.target.value })}
        />
      </div>

      {/* Матеріал */}
      <div>
        <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
          Матеріал <span className="text-zinc-600">(необов&apos;язково)</span>
        </label>
        <input
          className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none"
          placeholder="Наприклад: бавовна"
          value={value.material}
          onChange={e => onChange({ ...value, material: e.target.value })}
        />
      </div>

      {/* Ключові слова */}
      <div>
        <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
          Пошукові запити (теги){' '}
          <span className="text-zinc-600">(для Prom — keywords, для Horoshop — SEO ключові слова)</span>
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
