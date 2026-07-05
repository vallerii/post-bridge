'use client'

import { useState } from 'react'
import { PlatformCard } from './PlatformCard'
import { InstagramModal } from './modals/InstagramModal'
import { TelegramModal } from './modals/TelegramModal'
import { PromModal } from './modals/PromModal'
import { WooModal } from './modals/WooModal'
import { HoroshopModal } from './modals/HoroshopModal'
import { HoroshopSettingsModal } from './modals/HoroshopSettingsModal'
import { PromSettingsModal } from './modals/PromSettingsModal'

const PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    desc: 'Пости в стрічку. Потрібен бізнес-акаунт пов\'язаний з Facebook.',
    color: 'from-[#F56040] to-[#833AB4]',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    desc: 'Постинг у канал або групу через бота.',
    color: 'from-[#229ED9] to-[#1A7FB5]',
  },
  {
    id: 'prom',
    name: 'Prom.ua',
    icon: '🛒',
    desc: 'Завантажуйте товари через YML файл.',
    color: 'from-[#7b04df] to-[#5a02a3]',
  },
  // {
  //   id: 'woocommerce',
  //   name: 'WooCommerce',
  //   icon: '🌐',
  //   desc: 'Синхронізація товарів з WordPress-магазином.',
  //   color: 'from-[#7F54B3] to-[#5B3A8A]',
  // },
  {
    id: 'horoshop',
    name: 'Horoshop',
    icon: '🏪',
    desc: 'Публікуйте товари через API або CSV файл.',
    color: 'from-[#f6d811] to-[#d9bc0a]',
  },
]

const MODALS: Record<string, React.ComponentType<{ onClose: () => void; onSuccess: () => void }>> = {
  instagram: InstagramModal,
  telegram: TelegramModal,
  prom: PromModal,
  woocommerce: WooModal,
  horoshop: HoroshopModal,
}

interface Props {
  connected: string[]
  expiringPlatforms: string[]
}

export function PlatformList({ connected, expiringPlatforms }: Props) {
  const [connectedList, setConnectedList] = useState<string[]>(connected)
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [showHoroshopSettings, setShowHoroshopSettings] = useState(false)
  const [showPromSettings, setShowPromSettings] = useState(false)

  const ActiveModal = openModal ? MODALS[openModal] : null

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PLATFORMS.map((p) => (
          <div key={p.id} className="flex flex-col gap-2">
            <PlatformCard
              platform={p}
              isConnected={connectedList.includes(p.id)}
              onConnect={() => setOpenModal(p.id)}
              tokenExpiresSoon={expiringPlatforms.includes(p.id)}
            />
            {/* Кнопка налаштувань характеристик — тільки для Horoshop/Prom якщо підключено */}
            {p.id === 'horoshop' && connectedList.includes('horoshop') && (
              <button
                onClick={() => setShowHoroshopSettings(true)}
                className="w-full py-2 rounded-lg bg-[#1E1E23] border border-[#2A2A32] hover:border-zinc-500 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
              >
                ⚙️ Налаштувати характеристики товарів
              </button>
            )}
            {p.id === 'prom' && connectedList.includes('prom') && (
              <button
                onClick={() => setShowPromSettings(true)}
                className="w-full py-2 rounded-lg bg-[#1E1E23] border border-[#2A2A32] hover:border-zinc-500 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
              >
                ⚙️ Налаштувати характеристики товарів
              </button>
            )}
          </div>
        ))}
      </div>

      {ActiveModal && openModal && (
        <ActiveModal
          onClose={() => setOpenModal(null)}
          onSuccess={() => {
            setConnectedList((prev) =>
              prev.includes(openModal) ? prev : [...prev, openModal]
            )
            setOpenModal(null)
          }}
        />
      )}

      {showHoroshopSettings && (
        <HoroshopSettingsModal onClose={() => setShowHoroshopSettings(false)} />
      )}

      {showPromSettings && (
        <PromSettingsModal onClose={() => setShowPromSettings(false)} />
      )}
    </>
  )
}