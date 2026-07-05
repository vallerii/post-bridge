'use client'

import { HoroshopData } from '@/lib/publishers/types'
import { useState, useEffect } from 'react'

interface Props {
  value: HoroshopData
  onChange: (data: HoroshopData) => void
}

const AVAILABILITY_OPTIONS = [
  { value: 'in_stock',      label: '✅ В наявності' },
  { value: 'order',         label: '🔄 Під замовлення' },
  { value: 'not_available', label: '❌ Немає в наявності' },
]

export function HoroshopFields({ value, onChange }: Props) {
  const [customFieldNames, setCustomFieldNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/horoshop/settings')
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setCustomFieldNames(data.custom_fields ?? [])
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  function setField(key: string, val: string) {
    onChange({
      ...value,
      custom_fields: { ...value.custom_fields, [key]: val },
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#1E1E23] rounded-xl border border-[#2A2A32]">
      <div className="text-xs font-semibold uppercase tracking-wider text-red-400">
        🏪 Додаткові поля Horoshop
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
              onClick={() => onChange({ ...value, availability: opt.value as HoroshopData['availability'] })}
              className={`text-left px-3 py-2 rounded-lg border text-sm transition-all
                ${value.availability === opt.value
                  ? 'border-red-500/50 bg-red-500/10 text-red-400'
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

      {/* Артикул */}
      <div>
        <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
          Артикул (SKU) <span className="text-zinc-600">(необов&apos;язково)</span>
        </label>
        <input
          className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none font-mono"
          placeholder="ABC-123"
          value={value.sku}
          onChange={e => onChange({ ...value, sku: e.target.value })}
        />
      </div>

      {/* Кастомні характеристики */}
      {!loading && customFieldNames.length > 0 && (
        <div className="flex flex-col gap-3 pt-2 border-t border-[#2A2A32]">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Характеристики
          </div>
          {customFieldNames.map(fieldName => (
            <div key={fieldName}>
              <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
                {fieldName}
              </label>
              <input
                className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none"
                placeholder={fieldName}
                value={value.custom_fields[fieldName] ?? ''}
                onChange={e => setField(fieldName, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && customFieldNames.length === 0 && (
        <div className="text-zinc-600 text-xs pt-2 border-t border-[#2A2A32]">
          Характеристики не налаштовані —{' '}
          <a href="/platforms" className="text-[#A78BFA] hover:underline">
            налаштувати в платформах
          </a>
        </div>
      )}
    </div>
  )
}