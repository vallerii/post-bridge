'use client'

import { useState } from 'react'

interface Props {
  initialFields: string[]
  onSave: (fields: string[]) => Promise<void>
  hint?: string
  placeholder?: string
  emptyLabel?: string
  saveLabel?: string
  // Назви, які не можна додати як власну характеристику (напр. базові колонки CSV
  // Horoshop типу "Кількість" — інакше вийде дублікат колонки і Horoshop не прийме файл).
  reservedNames?: string[]
}

export function HoroshopFieldsEditor({
  initialFields,
  onSave,
  hint = 'Додайте характеристики які будуть з’являтись у формі при заповненні товару для Horoshop. Наприклад: Колір, Матеріал, Розмір.',
  placeholder = 'Наприклад: Колір → Enter щоб додати',
  emptyLabel = 'Характеристик поки немає',
  saveLabel = 'Зберегти характеристики',
  reservedNames = [],
}: Props) {
  const [fields, setFields] = useState<string[]>(initialFields)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [warning, setWarning] = useState('')

  function addField(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      const trimmed = input.trim()
      const isReserved = reservedNames.some(
        r => r.toLowerCase() === trimmed.toLowerCase()
      )
      if (isReserved) {
        setWarning(`«${trimmed}» вже є стандартним полем Horoshop — не можна додати як окрему характеристику`)
        return
      }
      if (!fields.some(f => f.toLowerCase() === trimmed.toLowerCase())) {
        setFields(prev => [...prev, trimmed])
      }
      setWarning('')
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
        {hint}
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
          {emptyLabel}
        </div>
      )}

      {/* Додати */}
      <input
        className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none"
        placeholder={placeholder}
        value={input}
        onChange={e => { setInput(e.target.value); setWarning('') }}
        onKeyDown={addField}
      />
      {warning && (
        <div className="text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 -mt-2">
          ⚠️ {warning}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          saved
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
            : 'bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 text-white'
        }`}
      >
        {saving ? 'Збереження...' : saved ? '✓ Збережено' : saveLabel}
      </button>
    </div>
  )
}