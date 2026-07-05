'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { deletePost } from '@/lib/posts/actions'

interface Props {
  id: string
  // На сторінці поста після видалення треба піти на /posts.
  // В списку постів — просто лишитись на місці і оновити список.
  redirectAfter?: boolean
  className?: string
}

// Підтвердження в два кліки замість window.confirm() —
// щоб не використовувати блокуючий нативний діалог браузера,
// який виглядає чужорідно на фоні темного інтерфейсу застосунку.
const CONFIRM_TIMEOUT_MS = 3000

export function DeletePostButton({ id, redirectAfter = false, className }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirming) {
      setConfirming(true)
      timeoutRef.current = setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT_MS)
      return
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setLoading(true)
    try {
      await deletePost(id)
      if (redirectAfter) {
        router.push('/posts')
      } else {
        router.refresh()
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Не вдалося видалити пост')
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        title="Натисніть ще раз, щоб підтвердити"
        className="text-red-400 bg-red-500/15 border border-red-500/40 hover:bg-red-500/25 rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-40 whitespace-nowrap"
      >
        {loading ? '…' : 'Точно видалити?'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Видалити пост"
      aria-label="Видалити пост"
      className={
        className ??
        'text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg p-2 transition-colors'
      }
    >
      🗑️
    </button>
  )
}
