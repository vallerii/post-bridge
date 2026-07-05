'use client'

import { useState } from 'react'

interface Props {
  initialFields: string[]
  onSave: (fields: string[]) => Promise<void>
}

export function HoroshopFieldsEditor({ initialFields, onSave }: Props) {
  const [fields, setFields] = useState<string[]>(initialFields)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function addField(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      const trimmed = input.trim()
      if (!fields.includes(trimmed)) {
        setFields(prev => [...prev, trimmed])
      }
      setInput('')
    }
  }

  function removeField(f: string) {
    setFields(prev => prev.filter(x => x !== f))
  }

  function moveUp(i: number) {
    if (i === 0) return
    const next = [...fields]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    setFields(next)
  }

  function moveDown(i: number) {
    if (i === fields.length - 1) return
    const next = [...fields]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    setFields(next)
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await onSave(fields)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-zinc-400 text-sm">
        Додайте характеристики які будуть з&apos;являтись у формі при заповненні товару для Horoshop.
        Наприклад: Колір, Матеріал, Розмір.
      </div>

      {/* Список */}
      {fields.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {fields.map((f, i) => (
            <div
              key={f}
              className="flex items-center gap-2 bg-[#17171A] border border-[#2A2A32] rounded-lg px-3 py-2"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  className="text-zinc-600 hover:text-zinc-300 disabled:opacity-20 text-xs leading-none"
                >▲</button>
                <button
                  onClick={() => moveDown(i)}
                  disabled={i === fields.length - 1}
                  className="text-zinc-600 hover:text-zinc-300 disabled:opacity-20 text-xs leading-none"
                >▼</button>
              </div>
              <span className="flex-1 text-white text-sm">{f}</span>
              <button
                onClick={() => removeField(f)}
                className="text-zinc-600 hover:text-red-400 transition-colors text-sm"
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {fields.length === 0 && (
        <div className="text-zinc-600 text-sm text-center py-4 border border-dashed border-[#2A2A32] rounded-lg">
          Характеристик поки немає
        </div>
      )}

      {/* Додати */}
      <input
        className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none"
        placeholder="Наприклад: Колір → Enter щоб додати"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={addField}
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          saved
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
            : 'bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 text-white'
        }`}
      >
        {saving ? 'Збереження...' : saved ? '✓ Збережено' : 'Зберегти характеристики'}
      </button>
    </div>
  )
}