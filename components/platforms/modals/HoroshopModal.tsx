'use client'

import { useState } from 'react'
import { ModalBase } from './ModalBase'
import { StepIndicator } from './StepIndicator'
import { connectPlatform } from '@/lib/platforms/actions'
import { HoroshopFieldsEditor } from './HoroshopFieldsEditor'

interface Props { onClose: () => void; onSuccess: () => void }

type Plan = 'pro' | 'basic' | null

export function HoroshopModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1)
  const [plan, setPlan] = useState<Plan>(null)
  const [domain, setDomain] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalSteps = plan === 'pro' ? 5 : 4
  const successStep = plan === 'pro' ? 5 : 4

  async function handleConnect() {
    setLoading(true)
    setError('')
    try {
      if (plan === 'pro') {
        const testRes = await fetch('/api/horoshop/test-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain, login, password }),
        })
        const testData = await testRes.json()
        if (!testData.ok) throw new Error(testData.error ?? 'Помилка підключення')
        await connectPlatform('horoshop', { domain, login, password, plan: 'pro', custom_fields: JSON.stringify([]) })
        setStep(4)
      } else {
        await connectPlatform('horoshop', { plan: 'basic', custom_fields: JSON.stringify([]) })
        setStep(3)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Помилка')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveFields(fields: string[]) {
    await fetch('/api/horoshop/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_fields: fields }),
    })
  }

  return (
    <ModalBase title="Horoshop" icon="🏪" onClose={onClose}>
      <StepIndicator total={totalSteps} current={step} />

      {/* Крок 1 — Вибір плану */}
      {step === 1 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Крок 1 — Ваш тариф Horoshop</p>
          <div className="text-white font-bold mb-3">Який тариф у вашого магазину?</div>
          <div className="flex flex-col gap-2.5 mb-5">
            <button onClick={() => setPlan('pro')} className={`text-left p-4 rounded-xl border transition-all ${plan === 'pro' ? 'border-[#6C63FF] bg-[#6C63FF]/10' : 'border-[#2A2A32] bg-[#1E1E23] hover:border-zinc-500'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-semibold text-sm">Pro або b2b</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">API</span>
              </div>
              <div className="text-zinc-400 text-xs">Автоматична публікація товарів через API</div>
            </button>
            <button onClick={() => setPlan('basic')} className={`text-left p-4 rounded-xl border transition-all ${plan === 'basic' ? 'border-[#6C63FF] bg-[#6C63FF]/10' : 'border-[#2A2A32] bg-[#1E1E23] hover:border-zinc-500'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-semibold text-sm">Basic або Standard</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-500/20 text-zinc-400 font-semibold">Файл</span>
              </div>
              <div className="text-zinc-400 text-xs">Публікація через CSV файл — завантажуєте вручну в кабінет</div>
            </button>
          </div>

          {plan === 'basic' && (
            <div className="p-4 bg-[#1E1E23] border border-[#2A2A32] rounded-xl mb-2">
              <div className="text-zinc-300 text-sm font-semibold mb-2">📦 Як це працює</div>
              <div className="flex flex-col gap-2">
                {['Заповнюєте картку товару в нашому сервісі', 'Скачуєте CSV файл зі сторінки поста', 'Імпортуєте в кабінеті Horoshop: Товари → Імпорт'].map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="text-zinc-600 shrink-0">{i + 1}.</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[#1E1E23] text-zinc-400 text-sm font-semibold hover:text-white transition-colors">Скасувати</button>
            <button onClick={() => plan === 'pro' ? setStep(2) : handleConnect()} disabled={!plan || loading} className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 text-white text-sm font-semibold transition-colors">
              {loading ? 'Збереження...' : 'Далі →'}
            </button>
          </div>
        </>
      )}

      {/* Крок 2 — Дані API (тільки Pro) */}
      {step === 2 && plan === 'pro' && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Крок 2 — Дані підключення</p>
          <div className="p-3 bg-[#6C63FF]/10 border border-[#6C63FF]/30 rounded-lg text-[#A78BFA] text-sm mb-5">
            📌 Horoshop → Налаштування → API користувачі → створіть API користувача
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-zinc-400 text-sm font-semibold block mb-1.5">URL магазину</label>
              <input className="w-full bg-[#1E1E23] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none" placeholder="myshop.horoshop.ua" value={domain} onChange={e => setDomain(e.target.value.replace(/^https?:\/\//, '').replace(/\/$/, ''))} />
              <p className="text-zinc-500 text-xs mt-1">Без https:// і слешу в кінці</p>
            </div>
            <div>
              <label className="text-zinc-400 text-sm font-semibold block mb-1.5">Логін API користувача</label>
              <input className="w-full bg-[#1E1E23] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none" placeholder="api" value={login} onChange={e => setLogin(e.target.value)} />
            </div>
            <div>
              <label className="text-zinc-400 text-sm font-semibold block mb-1.5">Пароль</label>
              <input type="password" className="w-full bg-[#1E1E23] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          {error && <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg bg-[#1E1E23] text-zinc-400 text-sm font-semibold hover:text-white transition-colors">← Назад</button>
            <button onClick={() => setStep(3)} disabled={!domain || !login || !password} className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 text-white text-sm font-semibold transition-colors">Далі →</button>
          </div>
        </>
      )}

      {/* Крок 3 Pro — Підтвердження підключення */}
      {step === 3 && plan === 'pro' && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Крок 3 — Перевірка підключення</p>
          <div className="p-4 bg-[#1E1E23] border border-[#2A2A32] rounded-xl mb-5">
            <div className="text-zinc-400 text-sm mb-3">Перевіримо підключення до вашого магазину:</div>
            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <div className="flex gap-2"><span className="text-zinc-600 w-16 shrink-0">URL</span><span className="text-zinc-300">{domain}</span></div>
              <div className="flex gap-2"><span className="text-zinc-600 w-16 shrink-0">Логін</span><span className="text-zinc-300">{login}</span></div>
            </div>
          </div>
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg bg-[#1E1E23] text-zinc-400 text-sm font-semibold hover:text-white transition-colors">← Назад</button>
            <button onClick={handleConnect} disabled={loading} className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 text-white text-sm font-semibold transition-colors">
              {loading ? 'Підключення...' : 'Підключити →'}
            </button>
          </div>
        </>
      )}

      {/* Крок характеристик — Basic: step 3, Pro: step 4 */}
      {((plan === 'basic' && step === 3) || (plan === 'pro' && step === 4)) && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Крок {plan === 'pro' ? 4 : 3} — Характеристики товарів
          </p>
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
            ✓ Horoshop підключено! Налаштуйте характеристики які будуть у формі товару.
          </div>
          <HoroshopFieldsEditor initialFields={[]} onSave={handleSaveFields} />
          <div className="flex justify-end mt-4">
            <button onClick={() => setStep(successStep)} className="px-4 py-2 rounded-lg bg-[#1E1E23] text-zinc-400 text-sm font-semibold hover:text-white transition-colors">
              Пропустити →
            </button>
          </div>
        </>
      )}

      {/* Успіх */}
      {step === successStep && (
        <div className="text-center py-4">
          <div className="text-5xl mb-4">🎉</div>
          <div className="text-white font-bold text-lg mb-2">Готово!</div>
          <div className="text-zinc-400 text-sm mb-4">
            {plan === 'pro'
              ? 'Товари будуть публікуватись автоматично через API'
              : 'При публікації поста ви зможете завантажити CSV файл для імпорту в кабінеті Horoshop'}
          </div>
          <button onClick={onSuccess} className="w-full py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/25 transition-colors">Готово ✓</button>
        </div>
      )}
    </ModalBase>
  )
}