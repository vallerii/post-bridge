'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import Image from 'next/image'

const NAV = [
  { href: '/dashboard', icon: '📊', label: 'Дашборд' },
  { href: '/platforms', icon: '🔌', label: 'Платформи' },
  { href: '/posts/new', icon: '✏️', label: 'Новий пост' },
  { href: '/posts',     icon: '📋', label: 'Публікації' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <aside className="fixed top-0 left-0 bottom-0 min-w-[220px] bg-[#17171A] border-r border-[#2A2A32] flex flex-col px-3 py-6 z-40">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <Image src="/post-bridge-logobig.png" alt="Logo" width={190} height={40} />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ href, icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-[#6C63FF]/15 text-[#A78BFA]'
                  : 'text-[#9997B0] hover:bg-[#1E1E23] hover:text-white'
              )}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#9997B0] hover:bg-[#1E1E23] hover:text-white transition-colors w-full mt-2"
      >
        <span className="text-base w-5 text-center">🚪</span>
        Вийти
      </button>

    </aside>
  )
}