'use client'

import { useState } from 'react'
import { ModalBase } from './ModalBase'
import { StepIndicator } from './StepIndicator'
import { CheckQuestion } from './CheckQuestion'
import { connectPlatform } from '@/lib/platforms/actions'

interface Props { onClose: () => void; onSuccess: () => void }

export function InstagramModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1)
  const [q1, setQ1] = useState<'yes'|'no'|null>(null)
  const [q2, setQ2] = useState<'yes'|'no'|null>(null)
  const [accountId, setAccountId] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConnect() {
    if (!accountId || !token) return
    setLoading(true)
    setError('')
    try {
      await connectPlatform('instagram', { account_id: accountId, access_token: token })
      setStep(3)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Помилка підключення')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalBase title="Instagram" icon="📸" onClose={onClose}>
      <StepIndicator total={3} current={step} />

      {step === 1 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Крок 1 — Перевірка вимог
          </p>
          <CheckQuestion
            title="У вас є Instagram Business або Creator акаунт?"
            desc="Особистий акаунт не підтримує API. Переключити можна безкоштовно в налаштуваннях Instagram → Акаунт → Перейти до бізнес-акаунту."
            value={q1}
            onChange={setQ1}
            alertNo="Перейдіть до бізнес-акаунту перш ніж продовжити. Це займає 1 хвилину."
          />

          {q1 === 'yes' && (
            <>
              <div className="h-px bg-[#2A2A32] my-4" />
              <CheckQuestion
                title="Акаунт пов'язаний зі сторінкою Facebook?"
                desc="Meta API вимагає зв'язку Instagram ↔ Facebook Page. Без цього публікація неможлива."
                value={q2}
                onChange={setQ2}
                alertNo="Facebook → Створити сторінку → Instagram → Налаштування → Пов'язані акаунти."
                alertYes="Відмінно! Переходимо до введення токену."
              />
            </>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[#1E1E23] text-zinc-400 text-sm font-semibold hover:text-white transition-colors">
              Скасувати
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={q1 !== 'yes' || q2 !== 'yes'}
              className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 text-white text-sm font-semibold transition-colors"
            >
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
          <div className="p-3 bg-[#6C63FF]/10 border border-[#6C63FF]/30 rounded-lg text-[#A78BFA] text-sm mb-5">
            📌 Токен отримайте в Meta Developer Console → Graph API Explorer
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-zinc-400 text-sm font-semibold block mb-1.5">Instagram Account ID</label>
              <input
                className="w-full bg-[#1E1E23] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-colors"
                placeholder="17841400000000000"
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm font-semibold block mb-1.5">Access Token</label>
              <input
                type="password"
                className="w-full bg-[#1E1E23] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-colors"
                placeholder="EAAxxxxx..."
                value={token}
                onChange={e => setToken(e.target.value)}
              />
            </div>
          </div>
          {error && <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg bg-[#1E1E23] text-zinc-400 text-sm font-semibold hover:text-white transition-colors">
              ← Назад
            </button>
            <button
              onClick={handleConnect}
              disabled={!accountId || !token || loading}
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
          <div className="text-white font-bold text-lg mb-2">Instagram підключено!</div>
          <div className="text-zinc-400 text-sm mb-6">Тепер можна публікувати пости з PostBridge</div>
          <button onClick={onSuccess} className="w-full py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/25 transition-colors">
            Готово ✓
          </button>
        </div>
      )}
    </ModalBase>
  )
}