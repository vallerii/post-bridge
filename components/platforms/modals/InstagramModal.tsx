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
            Крок 2 — Авторизація
          </p>
          <div className="p-3 bg-[#6C63FF]/10 border border-[#6C63FF]/30 rounded-lg text-[#A78BFA] text-sm mb-6">
            📌 Ви будете перенаправлені на Instagram для підтвердження доступу. Після авторизації повернетесь автоматично.
          </div>
          <a
            href={`https://www.instagram.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID}&redirect_uri=${process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI}&response_type=code&scope=instagram_business_basic,instagram_business_content_publish,instagram_business_manage_comments,instagram_business_manage_messages`}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-[#F56040] to-[#833AB4] text-white text-sm font-semibold text-center block hover:opacity-90 transition-opacity"
          >
            📸 Увійти через Instagram
          </a>
          <div className="flex justify-start mt-4">
            <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg bg-[#1E1E23] text-zinc-400 text-sm font-semibold hover:text-white transition-colors">
              ← Назад
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