'use client'

import { useState } from 'react'
import { PlatformCard } from './PlatformCard'
import { InstagramModal } from './modals/InstagramModal'
import { TelegramModal } from './modals/TelegramModal'
import { PromModal } from './modals/PromModal'
import { WooModal } from './modals/WooModal'

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
    desc: 'Створюйте картки товарів через офіційний API.',
    color: 'from-[#FF6600] to-[#CC4400]',
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    icon: '🌐',
    desc: 'Синхронізація товарів з WordPress-магазином.',
    color: 'from-[#7F54B3] to-[#5B3A8A]',
  },
]

const MODALS: Record<string, React.ComponentType<{ onClose: () => void; onSuccess: () => void }>> = {
  instagram: InstagramModal,
  telegram: TelegramModal,
  prom: PromModal,
  woocommerce: WooModal,
}

interface Props {
  connected: string[]
  expiringPlatforms: string[]
}

export function PlatformList({ connected, expiringPlatforms }: Props) {
  const [connectedList, setConnectedList] = useState<string[]>(connected)
  const [openModal, setOpenModal] = useState<string | null>(null)

  const ActiveModal = openModal ? MODALS[openModal] : null

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PLATFORMS.map((p) => (
          <PlatformCard
            key={p.id}
            platform={p}
            isConnected={connectedList.includes(p.id)}
            onConnect={() => setOpenModal(p.id)}
            tokenExpiresSoon={expiringPlatforms.includes(p.id)}
          />
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
    </>
  )
}