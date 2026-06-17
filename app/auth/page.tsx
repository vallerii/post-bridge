'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError('')
    setLoading(true)

    if (mode === 'register') {
      if (password.length < 6) {
        setError('Пароль мінімум 6 символів')
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('Невірний email або пароль'); setLoading(false); return }
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#17171A] border border-[#2A2A32] rounded-2xl p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl  flex items-center justify-center text-2xl mx-auto mb-3">
            <Image src="/post-bridge-logo.png" alt="Logo" width={80} height={80} />
          </div>
          <div className="text-white text-xl font-bold">
            Post<span className="text-[#A78BFA]">Bridge</span>
          </div>
          <div className="text-[#5E5C75] text-sm mt-1">Один пост — усі платформи</div>
        </div>

        {/* Title */}
        <h1 className="text-white text-lg font-bold mb-5">
          {mode === 'login' ? 'Вхід в акаунт' : 'Реєстрація'}
        </h1>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          {mode === 'register' && (
            <div>
              <label className="text-[#9997B0] text-sm font-semibold block mb-1.5">
                {"Ім'я або назва бізнесу"}
              </label>
              <input
                className="w-full bg-[#1E1E23] border border-[#2A2A32] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#6C63FF] transition-colors"
                placeholder="ФОП Іваненко / Магазин Весна"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="text-[#9997B0] text-sm font-semibold block mb-1.5">Email</label>
            <input
              type="email"
              className="w-full bg-[#1E1E23] border border-[#2A2A32] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#6C63FF] transition-colors"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div>
            <label className="text-[#9997B0] text-sm font-semibold block mb-1.5">Пароль</label>
            <input
              type="password"
              className="w-full bg-[#1E1E23] border border-[#2A2A32] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#6C63FF] transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-5 w-full bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? 'Завантаження...' : mode === 'login' ? 'Увійти' : 'Створити акаунт'}
        </button>

        {/* Switch */}
        <div className="mt-4 text-center text-sm text-[#5E5C75]">
          {mode === 'login' ? (
            <>Немає акаунту?{' '}
              <button onClick={() => { setMode('register'); setError('') }} className="text-[#A78BFA] hover:underline">
                Зареєструватися
              </button>
            </>
          ) : (
            <>Вже є акаунт?{' '}
              <button onClick={() => { setMode('login'); setError('') }} className="text-[#A78BFA] hover:underline">
                Увійти
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}