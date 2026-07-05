'use client'

import { useState, useEffect } from 'react'
import { ModalBase } from './ModalBase'
import { HoroshopFieldsEditor } from './HoroshopFieldsEditor'
import { HOROSHOP_RESERVED_FIELDS } from '@/lib/horoshop/reserved-fields'

interface Props {
  onClose: () => void
}

export function HoroshopSettingsModal({ onClose }: Props) {
  const [initialFields, setInitialFields] = useState<string[]>([])
  const [initialCategories, setInitialCategories] = useState<string[]>([])
  const [plan, setPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/horoshop/settings')
      .then(r => r.json())
      .then(data => {
        setInitialFields(data.custom_fields ?? [])
        setInitialCategories(data.categories ?? [])
        setPlan(data.plan ?? null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(fields: string[]) {
    await fetch('/api/horoshop/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_fields: fields }),
    })
  }

  async function handleSaveCategories(categories: string[]) {
    await fetch('/api/horoshop/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories }),
    })
  }

  return (
    <ModalBase title="Horoshop — Налаштування" icon="🏪" onClose={onClose}>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
        Характеристики товарів
      </p>

      {loading ? (
        <div className="text-zinc-500 text-sm py-4 text-center">Завантаження...</div>
      ) : (
        <HoroshopFieldsEditor
          initialFields={initialFields}
          onSave={handleSave}
          reservedNames={HOROSHOP_RESERVED_FIELDS}
        />
      )}

      {/* Розділи каталогу — тільки для Basic/Standard: для Pro вони підтягуються
          напряму з магазину через API при створенні поста. */}
      {!loading && plan !== 'pro' && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4 mt-6 pt-6 border-t border-[#2A2A32]">
            Розділи каталогу
          </p>
          <HoroshopFieldsEditor
            initialFields={initialCategories}
            onSave={handleSaveCategories}
            hint="Розділи, які будуть доступні для вибору при створенні поста. Можна не заповнювати заздалегідь — при першому вводі нової назви в пості вона теж збережеться сюди."
            placeholder="Наприклад: Взуття → Enter щоб додати"
            emptyLabel="Розділів поки немає"
            saveLabel="Зберегти розділи"
          />
        </>
      )}

      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-[#1E1E23] text-zinc-400 text-sm font-semibold hover:text-white transition-colors"
        >
          Закрити
        </button>
      </div>
    </ModalBase>
  )
}