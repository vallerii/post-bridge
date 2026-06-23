'use client'

import { useState } from 'react'
import { ModalBase } from './ModalBase'
import { StepIndicator } from './StepIndicator'
import { connectPlatform } from '@/lib/platforms/actions'

interface Props { onClose: () => void; onSuccess: () => void }

export function HoroshopModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1)
  const [domain, setDomain] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConnect() {
    setLoading(true)
    setError('')
    try {
      // Перевіряємо з'єднання — отримуємо токен
      const testRes = await fetch('/api/horoshop/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, login, password }),
      })
      const testData = await testRes.json()
      if (!testData.ok) throw new Error(testData.error ?? 'Помилка підключення')

      await connectPlatform('horoshop', { domain, login, password })
      setStep(3)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Помилка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalBase title="Horoshop" icon="🏪" onClose={onClose}>
      <StepIndicator total={3} current={step} />

      {step === 1 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Крок 1 — Перевірка
          </p>

          <div className="text-white font-bold mb-2">Перед підключенням перевірте:</div>

          <div className="flex flex-col gap-3 mb-5">
            <div className="flex items-start gap-2.5 text-sm text-zinc-300">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span>Тариф магазину <span className="text-white font-semibold">Pro або b2b</span> — Basic і Standard не підтримують API</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-zinc-300">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span>Знаєте логін і пароль від <span className="text-white font-semibold">адмін панелі</span> магазину</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-zinc-300">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span>URL магазину — наприклад <span className="font-mono text-white">myshop.horoshop.ua</span></span>
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
            ⚠️ Якщо тариф Basic або Standard — зверніться в підтримку Horoshop для підключення API
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[#1E1E23] text-zinc-400 text-sm font-semibold hover:text-white transition-colors">
              Скасувати
            </button>
            <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#7B74FF] text-white text-sm font-semibold transition-colors">
              Далі →
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Крок 2 — Дані підключення
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
                URL магазину
              </label>
              <input
                className="w-full bg-[#1E1E23] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-colors"
                placeholder="myshop.horoshop.ua"
                value={domain}
                onChange={e => setDomain(e.target.value.replace(/^https?:\/\//, '').replace(/\/$/, ''))}
              />
              <p className="text-zinc-500 text-xs mt-1">Без https:// і слешу в кінці</p>
            </div>
            <div>
              <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
                Логін API користувача
              </label>
              <input
                className="w-full bg-[#1E1E23] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-colors"
                placeholder="api"
                value={login}
                onChange={e => setLogin(e.target.value)}
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm font-semibold block mb-1.5">
                Пароль
              </label>
              <input
                type="password"
                className="w-full bg-[#1E1E23] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg bg-[#1E1E23] text-zinc-400 text-sm font-semibold hover:text-white transition-colors">
              ← Назад
            </button>
            <button
              onClick={handleConnect}
              disabled={!domain || !login || !password || loading}
              className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 text-white text-sm font-semibold transition-colors"
            >
              {loading ? 'Перевірка...' : 'Підключити →'}
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <div className="text-center py-4">
          <div className="text-5xl mb-4">🎉</div>
          <div className="text-white font-bold text-lg mb-2">Horoshop підключено!</div>
          <div className="text-zinc-400 text-sm mb-6">Тепер можна публікувати товари</div>
          <button onClick={onSuccess} className="w-full py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/25 transition-colors">
            Готово ✓
          </button>
        </div>
      )}
    </ModalBase>
  )
}