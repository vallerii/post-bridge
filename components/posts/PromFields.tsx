'use client'

import { useState, useEffect } from 'react'

interface PromGroup {
  id: number
  name: string
  parent_group_id: number | null
}

export interface PromData {
  group_id: string               // група на сайті (необов'язково)
  group_name: string             // ВЛАСНА назва цієї групи (без шляху!) для YML
  // Батьківська група (якщо є) — потрібна для тега parentId в YML, щоб Prom розпізнавав
  // саме цю вкладену групу за id+parentId, а не створював нову через розбіжність назви.
  group_parent_id: string
  old_price: string
  availability: 'in_stock' | 'order' | 'not_available'
  quantity: string
  unit: string
  sku: string
  keywords: string[]
  vendor: string
  condition: 'new' | 'used'
  color: string
  material: string
  custom_fields: Record<string, string>  // власні характеристики, налаштовані в /platforms
  // Посилання на категорію маркетплейсу Prom.ua (необов'язково). Якщо не вказано —
  // Prom сам автоматично визначає категорію за назвою/описом/ціною товару (офіційно
  // задокументована поведінка), тому спеціальний пошук/API тут не потрібен.
  category_url: string
}

interface Props {
  value: PromData
  onChange: (data: PromData) => void
}

function buildGroupPath(group: PromGroup, all: PromGroup[]): string {
  if (!group.parent_group_id) return group.name
  const parent = all.find(g => g.id === group.parent_group_id)
  if (!parent) return group.name
  return `${buildGroupPath(parent, all)} → ${group.name}`
}

export function PromFields({ value, onChange }: Props) {
  const [groups, setGroups] = useState<PromGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [groupSearch, setGroupSearch] = useState('')
  const [customFieldNames, setCustomFieldNames] = useState<string[]>([])

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
        }
      })
      .catch(() => {
        if (!cancelled) setError('Не вдалось завантажити дані з Prom')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    fetch('/api/prom/settings')
      .then(r => r.json())
      .then(data => { if (!cancelled) setCustomFieldNames(data.custom_fields ?? []) })
      .catch(() => {})

    return () => { cancelled = true }
  }, [])

  function setCustomField(key: string, val: string) {
    onChange({
      ...value,
      custom_fields: { ...value.custom_fields, [key]: val },
    })
  }

  // Групи з повним шляхом для відображення
  const groupsWithPath = groups.map(g => ({
    ...g,
    fullPath: buildGroupPath(g, groups),
  }))

  const filteredGroups = groupsWithPath.filter(g =>
    g.fullPath.toLowerCase().includes(groupSearch.toLowerCase())
  )

  const selectedGroup = groupsWithPath.find(g => String(g.id) === value.group_id)

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#1E1E23] rounded-xl border border-[#2A2A32]">
      <div className="text-xs font-semibold uppercase tracking-wider text-[#7b04df]">
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
            <span className="text-zinc-600">(лише підказка — не передається в Prom)</span>
          </label>
          <div className="text-amber-500/80 text-xs mb-2">
            ⚠️ Спроба автоматично прив&apos;язати товар до групи через YML призводила до
            дублікатів груп в кабінеті Prom, тому це поле більше нічого нікуди не надсилає —
            це просто нагадування собі, до якої групи потім вручну прикріпити товар в
            кабінеті Prom.
          </div>

          {selectedGroup && (
            <div className="mb-2 flex items-center justify-between text-xs text-[#7b04df] bg-[#7b04df]/10 border border-[#7b04df]/20 rounded-lg px-2.5 py-1.5">
              <span>✓ {selectedGroup.fullPath}</span>
              <button
                onClick={() => { onChange({ ...value, group_id: '', group_parent_id: '' }); setGroupSearch('') }}
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
                      // ВАЖЛИВО: в group_name зберігаємо ВЛАСНУ назву групи (g.name), а не
                      // повний шлях (g.fullPath, який показуємо тільки в UI для орієнтації).
                      // Раніше сюди писався fullPath ("Батько → Дитина"), і оскільки такого
                      // тексту нема серед реальних назв груп в акаунті Prom, Prom не міг
                      // розпізнати це як вже існуючу групу за іменем — і при кожному імпорті
                      // створював нову групу-дублікат з тим самим id, замість перевикористання.
                      onChange({
                        ...value,
                        group_id: String(g.id),
                        group_name: g.name,
                        group_parent_id: g.parent_group_id ? String(g.parent_group_id) : '',
                      })
                      setGroupSearch('')
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#2A2A32] transition-colors
                      ${value.group_id === String(g.id) ? 'text-[#7b04df]' : 'text-zinc-300'}`}
                  >
                    {g.fullPath}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Категорія на маркетплейсі */}
      <div>
        <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
          Категорія на маркетплейсі{' '}
          <span className="text-zinc-600">(необов&apos;язково)</span>
        </label>
        <input
          className="w-full bg-[#17171A] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2 text-white text-sm outline-none"
          placeholder="Посилання на категорію з сайту Prom.ua"
          value={value.category_url}
          onChange={e => onChange({ ...value, category_url: e.target.value })}
        />
        <div className="text-zinc-600 text-xs mt-1">
          Визначає категорію розміщення вашого товару в каталозі Prom.ua. Відкрийте потрібну
          категорію на prom.ua і вставте сюди посилання з адресного рядка. Якщо не вказати —
          Prom.ua спробує визначити категорію сама за назвою, описом і ціною товару (іноді
          вгадує неправильно — тоді категорію можна змінити вручну в кабінеті Prom).
        </div>
      </div>

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

      {/* Одиниця виміру (Кількість — спільне поле, див. блок "Спільні поля" вище) */}
      <div>
        <label className="text-zinc-400 text-sm font-semibold block mb-1.5">Одиниця виміру</label>
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

      {/* Кастомні характеристики (налаштовуються в /platforms) */}
      {customFieldNames.length > 0 && (
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
                onChange={e => setCustomField(fieldName, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {customFieldNames.length === 0 && (
        <div className="text-zinc-600 text-xs pt-2 border-t border-[#2A2A32]">
          Характеристики не налаштовані —{' '}
          <a href="/platforms" className="text-[#A78BFA] hover:underline">
            налаштувати в платформах
          </a>
        </div>
      )}

      {/* Підказка про мову імпорту */}
      <div className="text-zinc-600 text-xs pt-2 border-t border-[#2A2A32]">
        💡 Назва/Опис/Пошукові запити заповнюються однаково і в українську, і в російську
        версію товару на Prom (щоб українська версія на сайті точно не була порожньою). Якщо
        після імпорту хочете саме російський переклад — на сторінці товару в кабінеті Prom
        буде помітка «Перекласти українською/російською», її треба натиснути вручну на
        кожному товарі (автоматичного перекладу під час імпорту файлу немає).
      </div>
    </div>
  )
}