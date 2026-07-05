'use client'

import { HoroshopData } from '@/lib/publishers/types'
import { useState, useEffect } from 'react'

interface Props {
  value: HoroshopData
  onChange: (data: HoroshopData) => void
}

interface LiveCategory {
  id: string
  name: string
  fullPath: string
}

export function HoroshopFields({ value, onChange }: Props) {
  const [customFieldNames, setCustomFieldNames] = useState<string[]>([])
  const [plan, setPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Basic/Standard (без API) — свій список розділів, який юзер наповнює сам
  const [savedCategories, setSavedCategories] = useState<string[]>([])
  const [categorySearch, setCategorySearch] = useState('')

  // Pro (є API) — живий пошук по каталогу Horoshop, як "Група на сайті" в Prom
  const [liveCategories, setLiveCategories] = useState<LiveCategory[]>([])
  const [liveLoading, setLiveLoading] = useState(false)
  const [liveError, setLiveError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/horoshop/settings')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        setCustomFieldNames(data.custom_fields ?? [])
        setSavedCategories(data.categories ?? [])
        setPlan(data.plan ?? null)
        if (data.plan === 'pro') {
          setLiveLoading(true)
          fetch('/api/horoshop/categories')
            .then(r => r.json())
            .then(catData => {
              if (cancelled) return
              if (catData.error) setLiveError(catData.error)
              else setLiveCategories(catData.categories ?? [])
            })
            .catch(() => { if (!cancelled) setLiveError('Не вдалось завантажити розділи Horoshop') })
            .finally(() => { if (!cancelled) setLiveLoading(false) })
        }
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

  // Додати нову назву розділу в свій збережений список (Basic/Standard),
  // щоб наступного разу вона вже була в списку для вибору.
  function addSavedCategory(name: string) {
    if (savedCategories.includes(name)) return
    const next = [...savedCategories, name]
    setSavedCategories(next)
    fetch('/api/horoshop/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: next }),
    }).catch(() => {})
  }

  const filteredSaved = savedCategories.filter(c =>
    c.toLowerCase().includes(categorySearch.toLowerCase())
  )
  const exactMatchExists = savedCategories.some(
    c => c.toLowerCase() === categorySearch.trim().toLowerCase()
  )

  const liveCategoriesFiltered = liveCategories.filter(c =>
    c.fullPath.toLowerCase().includes(categorySearch.toLowerCase())
  )
  const selectedLiveCategory = liveCategories.find(c => c.id === value.category_id)

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#1E1E23] rounded-xl border border-[#2A2A32]">
      <div className="text-xs font-semibold uppercase tracking-wider text-[#f6d811]">
        🏪 Додаткові поля Horoshop
      </div>

      {/* Розділ каталогу */}
      {!loading && plan === 'pro' && (
        <div>
          <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
            Розділ каталогу{' '}
            <span className="text-zinc-600">(необов&apos;язково)</span>
          </label>

          {selectedLiveCategory && (
            <div className="mb-2 flex items-center justify-between text-xs text-[#f6d811] bg-[#f6d811]/10 border border-[#f6d811]/20 rounded-lg px-2.5 py-1.5">
              <span>✓ {selectedLiveCategory.fullPath}</span>
              <button
                onClick={() => { onChange({ ...value, category_id: '', category_name: '' }); setCategorySearch('') }}
                className="text-zinc-500 hover:text-red-400 ml-2"
              >✕</button>
            </div>
          )}

          {liveLoading && (
            <div className="text-zinc-500 text-sm mb-1">Завантаження розділів з Horoshop...</div>
          )}

          {liveError && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-1">
              ⚠️ {liveError}
            </div>
          )}

          {!liveLoading && !liveError && (
            <>
              <input
                className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none mb-1"
                placeholder={liveCategories.length === 0 ? 'Розділи відсутні в магазині' : 'Пошук розділу...'}
                value={categorySearch}
                onChange={e => setCategorySearch(e.target.value)}
                disabled={liveCategories.length === 0}
              />
              {categorySearch && (
                <div className="max-h-40 overflow-y-auto border border-[#2A2A32] rounded-lg bg-[#17171A]">
                  {liveCategoriesFiltered.length === 0 ? (
                    <div className="p-3 text-zinc-500 text-sm">Нічого не знайдено</div>
                  ) : (
                    liveCategoriesFiltered.slice(0, 30).map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onChange({ ...value, category_id: c.id, category_name: c.fullPath })
                          setCategorySearch('')
                        }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#2A2A32] transition-colors
                          ${value.category_id === c.id ? 'text-[#f6d811]' : 'text-zinc-300'}`}
                      >
                        {c.fullPath}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!loading && plan !== 'pro' && (
        <div>
          <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
            Розділ каталогу{' '}
            <span className="text-amber-500">
              (обов&apos;язково для імпорту CSV — Horoshop вимагає Артикул, Назву і Розділ
              для нового товару; без розділу імпорт цього рядка завершиться помилкою)
            </span>
          </label>

          {value.category_name && (
            <div className="mb-2 flex items-center justify-between text-xs text-[#f6d811] bg-[#f6d811]/10 border border-[#f6d811]/20 rounded-lg px-2.5 py-1.5">
              <span>✓ {value.category_name}</span>
              <button
                onClick={() => { onChange({ ...value, category_name: '' }); setCategorySearch('') }}
                className="text-zinc-500 hover:text-red-400 ml-2"
              >✕</button>
            </div>
          )}

          <input
            className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none mb-1"
            placeholder="Почніть вводити назву розділу..."
            value={categorySearch}
            onChange={e => setCategorySearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && categorySearch.trim()) {
                e.preventDefault()
                const name = categorySearch.trim()
                onChange({ ...value, category_name: name })
                addSavedCategory(name)
                setCategorySearch('')
              }
            }}
          />

          {categorySearch && (
            <div className="max-h-40 overflow-y-auto border border-[#2A2A32] rounded-lg bg-[#17171A]">
              {filteredSaved.length === 0 && exactMatchExists === false && (
                <div
                  onClick={() => {
                    const name = categorySearch.trim()
                    onChange({ ...value, category_name: name })
                    addSavedCategory(name)
                    setCategorySearch('')
                  }}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-[#2A2A32] transition-colors text-[#A78BFA]"
                >
                  + Додати новий розділ «{categorySearch.trim()}»
                </div>
              )}
              {filteredSaved.map(c => (
                <div
                  key={c}
                  onClick={() => {
                    onChange({ ...value, category_name: c })
                    setCategorySearch('')
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#2A2A32] transition-colors
                    ${value.category_name === c ? 'text-[#f6d811]' : 'text-zinc-300'}`}
                >
                  {c}
                </div>
              ))}
            </div>
          )}

          <div className="text-zinc-600 text-xs mt-1">
            Назва має точно збігатися з назвою розділу в кабінеті Horoshop. Введені розділи
            запам&apos;ятовуються — наступного разу можна буде просто вибрати зі списку.
          </div>
        </div>
      )}

      {/* Артикул */}
      <div>
        <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
          Артикул (SKU){' '}
          <span className="text-zinc-600">(необов&apos;язково — якщо не вказати, згенерується автоматично)</span>
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
