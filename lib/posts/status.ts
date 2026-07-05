export interface StatusMeta {
  label: string
  className: string
}

// Єдина мапа статусів поста, щоб бейджі в списку постів і на сторінці поста
// завжди показували однакове й не розходились між собою.
//
// ready_for_import — коли серед обраних платформ жодна не публікується реально
// через API (тільки файли для ручного імпорту: Prom — завжди, Horoshop — коли
// тариф Basic/Standard без API). "Опубліковано" в цьому випадку вводило б в
// оману, бо жодного запиту нікуди не пішло.
export function getStatusMeta(status: string): StatusMeta {
  switch (status) {
    case 'published':
      return { label: '✓ Опубліковано', className: 'bg-emerald-500/15 text-emerald-400' }
    case 'partial':
      return { label: '⚠ Частково', className: 'bg-amber-500/15 text-amber-400' }
    case 'ready_for_import':
      return { label: '📦 Готово до імпорту', className: 'bg-sky-500/15 text-sky-400' }
    case 'failed':
      return { label: '✕ Помилка', className: 'bg-red-500/15 text-red-400' }
    default:
      return { label: 'Чернетка', className: 'bg-zinc-700/50 text-zinc-400' }
  }
}
