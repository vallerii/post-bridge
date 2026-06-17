interface Platform {
  id: string
  name: string
  icon: string
  desc: string
  color: string
}

interface Props {
  platform: Platform
  isConnected: boolean
  onConnect: () => void
}

export function PlatformCard({ platform, isConnected, onConnect }: Props) {
  return (
    <div
      className={`relative bg-[#17171A] border rounded-xl p-5 transition-all cursor-pointer overflow-hidden
        ${isConnected
          ? 'border-emerald-500/50 hover:border-emerald-400'
          : 'border-[#2A2A32] hover:border-[#6C63FF]'
        }`}
      onClick={onConnect}
    >
      {/* top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${platform.color}`} />

      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{platform.icon}</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
          ${isConnected
            ? 'bg-emerald-500/15 text-emerald-400'
            : 'bg-[#1E1E23] text-zinc-500'
          }`}>
          {isConnected ? '✓ Підключено' : 'Не підключено'}
        </span>
      </div>

      <div className="text-white font-bold text-base mb-1">{platform.name}</div>
      <div className="text-zinc-400 text-sm leading-relaxed">{platform.desc}</div>

      <div className="mt-4">
        <span className={`text-sm font-semibold
          ${isConnected ? 'text-emerald-400' : 'text-[#A78BFA]'}`}>
          {isConnected ? 'Переналаштувати →' : 'Підключити →'}
        </span>
      </div>
    </div>
  )
}