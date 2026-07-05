'use client'

import { useState } from 'react'
import { ModalBase } from './ModalBase'
import { StepIndicator } from './StepIndicator'
import { CheckQuestion } from './CheckQuestion'
import { connectPlatform } from '@/lib/platforms/actions'

interface Props { onClose: () => void; onSuccess: () => void }

export function PromModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1)
  const [hasShop, setHasShop] = useState<'yes'|'no'|null>(null)
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConnect() {
    setLoading(true); setError('')
    try {
      await connectPlatform('prom', { api_token: token })
      setStep(3)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Помилка підключення')
    } finally { setLoading(false) }
  }

  return (
    <ModalBase title="Prom.ua" icon="🛒" onClose={onClose}>
      <StepIndicator total={3} current={step} />

      {step === 1 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Крок 1 — Перевірка</p>

          {/* Як працює інтеграція */}
          <div className="mb-5 p-4 bg-[#7b04df]/8 border border-[#7b04df]/20 rounded-xl">
            <div className="text-[#7b04df] text-xs font-semibold uppercase tracking-wider mb-3">
              📦 Як працює публікація на Prom
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5 text-sm text-zinc-300">
                <span className="text-zinc-500 shrink-0 mt-0.5">1.</span>
                <span>Заповнюєте картку товару в нашому сервісі</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-zinc-300">
                <span className="text-zinc-500 shrink-0 mt-0.5">2.</span>
                <span>Скачуєте готовий <span className="text-white font-semibold">YML файл</span> зі сторінки поста</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-zinc-300">
                <span className="text-zinc-500 shrink-0 mt-0.5">3.</span>
                <span>Імпортуєте файл у кабінеті Prom: <span className="text-zinc-400">Товари → Імпорт</span></span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#7b04df]/15 text-zinc-500 text-xs">
              API Prom не дозволяє створювати товари напряму — тільки через імпорт файлу
            </div>
          </div>

          <CheckQuestion
            title="Є активний магазин на Prom.ua?"
            desc="API токен потрібен для завантаження ваших груп товарів при заповненні картки."
            value={hasShop} onChange={setHasShop}
            alertNo="Зареєструйтесь на Prom.ua як продавець та активуйте тариф. Потім поверніться."
          />
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[#1E1E23] text-zinc-400 text-sm font-semibold hover:text-white transition-colors">Скасувати</button>
            <button onClick={() => setStep(2)} disabled={hasShop !== 'yes'}
              className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 text-white text-sm font-semibold transition-colors">
              Далі →
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Крок 2 — API Token</p>
          <div className="p-3 bg-[#6C63FF]/10 border border-[#6C63FF]/30 rounded-lg text-[#A78BFA] text-sm mb-5">
            📌 Кабінет Prom.ua → Мій профіль → Налаштування → API → Згенерувати токен
          </div>
          <div>
            <label className="text-zinc-400 text-sm font-semibold block mb-1.5">API Token</label>
            <input type="password"
              className="w-full bg-[#1E1E23] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-colors"
              placeholder="Вставте ваш API токен" value={token} onChange={e => setToken(e.target.value)} />
          </div>
          {error && <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg bg-[#1E1E23] text-zinc-400 text-sm font-semibold hover:text-white transition-colors">← Назад</button>
            <button onClick={handleConnect} disabled={token.length < 10 || loading}
              className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 text-white text-sm font-semibold transition-colors">
              {loading ? 'Перевірка...' : 'Підключити →'}
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <div className="text-center py-4">
          <div className="text-5xl mb-4">🎉</div>
          <div className="text-white font-bold text-lg mb-2">Prom.ua підключено!</div>
          <div className="text-zinc-400 text-sm mb-4">
            При публікації поста ви зможете завантажити готовий YML файл для імпорту в кабінеті Prom
          </div>
          <button onClick={onSuccess} className="w-full py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/25 transition-colors">Готово ✓</button>
        </div>
      )}
    </ModalBase>
  )
}