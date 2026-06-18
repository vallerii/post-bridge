'use client'

import { useState } from 'react'
import { ModalBase } from './ModalBase'
import { StepIndicator } from './StepIndicator'
import { CheckQuestion } from './CheckQuestion'
import { connectPlatform } from '@/lib/platforms/actions'

interface Props { onClose: () => void; onSuccess: () => void }

export function TelegramModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1)
  const [chatType, setChatType] = useState<'channel'|'group'|null>(null)
  const [isAdmin, setIsAdmin] = useState<'yes'|'no'|null>(null)
  const [chatId, setChatId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConnect() {
    setLoading(true); setError('')
    try {
      await connectPlatform('telegram', { chat_id: chatId, chat_type: chatType! })
      setStep(3)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Помилка підключення')
    } finally { setLoading(false) }
  }

  return (
    <ModalBase title="Telegram" icon="✈️" onClose={onClose}>
      <StepIndicator total={3} current={step} />

      {step === 1 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Крок 1 — Тип чату</p>
          <div className="text-white font-bold mb-2">Куди публікуватимете?</div>
          <div className="flex gap-2 mb-5">
            {(['channel', 'group'] as const).map((t) => (
              <button key={t} onClick={() => setChatType(t)}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all
                  ${chatType === t ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#A78BFA]' : 'border-[#2A2A32] bg-[#1E1E23] text-zinc-400 hover:border-[#6C63FF]'}`}>
                {t === 'channel' ? '📢 Канал' : '👥 Група'}
              </button>
            ))}
          </div>

          {chatType && (
            <>
              <div className="h-px bg-[#2A2A32] my-4" />
              <CheckQuestion
                title="Бот доданий адміністратором?"
                desc="Без прав адміна бот не зможе відправляти повідомлення в канал або групу."
                value={isAdmin}
                onChange={setIsAdmin}
                alertNo="Відкрийте канал/групу → Адміністратори → Додати → знайдіть вашого бота."
              />
            </>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[#1E1E23] text-zinc-400 text-sm font-semibold hover:text-white transition-colors">Скасувати</button>
            <button onClick={() => setStep(2)} disabled={!chatType || isAdmin !== 'yes'}
              className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 text-white text-sm font-semibold transition-colors">
              Далі →
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Крок 2 — Chat ID
          </p>
          <div className="p-3 bg-[#6C63FF]/10 border border-[#6C63FF]/30 rounded-lg text-[#A78BFA] text-sm mb-5">
            📌 Додайте <b>@PostBridgeAssistantBot</b> в групу/канал як адміністратора — 
            бот автоматично надішле Chat ID в чат
          </div>
          <div>
            <label className="text-zinc-400 text-sm font-semibold block mb-1.5">Chat ID</label>
            <input
              className="w-full bg-[#1E1E23] border border-[#2A2A32] focus:border-[#6C63FF] rounded-lg px-3 py-2.5 text-white text-sm outline-none font-mono transition-colors"
              placeholder="-1001234567890"
              value={chatId}
              onChange={e => setChatId(e.target.value)}
            />
            <p className="text-zinc-500 text-xs mt-1">
              Бот надішле ID автоматично коли ви його додасте в групу
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg bg-[#1E1E23] text-zinc-400 text-sm font-semibold hover:text-white transition-colors">
              ← Назад
            </button>
            <button
              onClick={handleConnect}
              disabled={!chatId || loading}
              className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 text-white text-sm font-semibold transition-colors"
            >
              {loading ? 'Підключення...' : 'Підключити →'}
            </button>
          </div>
        </>
      )}


      {step === 3 && (
        <div className="text-center py-4">
          <div className="text-5xl mb-4">🎉</div>
          <div className="text-white font-bold text-lg mb-2">Telegram підключено!</div>
          <div className="text-zinc-400 text-sm mb-6">Бот готовий до публікацій</div>
          <button onClick={onSuccess} className="w-full py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/25 transition-colors">Готово ✓</button>
        </div>
      )}
    </ModalBase>
  )
}