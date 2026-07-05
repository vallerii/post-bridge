'use client'

import { useState, useEffect } from 'react'
import { ModalBase } from './ModalBase'
import { HoroshopFieldsEditor } from './HoroshopFieldsEditor'

interface Props {
  onClose: () => void
}

export function HoroshopSettingsModal({ onClose }: Props) {
  const [initialFields, setInitialFields] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/horoshop/settings')
      .then(r => r.json())
      .then(data => setInitialFields(data.custom_fields ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(fields: string[]) {
    await fetch('/api/horoshop/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_fields: fields }),
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
        <HoroshopFieldsEditor initialFields={initialFields} onSave={handleSave} />
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