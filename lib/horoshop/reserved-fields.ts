// Назви колонок, які CSV-імпорт Horoshop вже містить як вбудовані базові поля
// (див. lib/generators/horoshop-csv.ts). Якщо юзер додасть "характеристику" з такою ж
// назвою (наприклад "Кількість"), в CSV вийде дві однакові колонки — Horoshop відмовляється
// імпортувати такий файл. Тому цей список — єдине джерело правди для перевірки, і
// використовується і при збереженні характеристик в налаштуваннях, і при генерації CSV.
export const HOROSHOP_RESERVED_FIELDS = [
  'Назва',
  'Розділ',
  'Артикул',
  'Ціна',
  'Стара ціна',
  'Валюта',
  'Наявність',
  'Кількість',
  'Стан',
  'Колір',
  'Матеріал',
  'Опис',
  'Фото',
  'SEO ключові слова',
]

export function isReservedHoroshopField(name: string): boolean {
  const normalized = name.trim().toLowerCase()
  return HOROSHOP_RESERVED_FIELDS.some(f => f.toLowerCase() === normalized)
}

export function filterReservedHoroshopFields(names: string[]): string[] {
  return names.filter(n => !isReservedHoroshopField(n))
}
