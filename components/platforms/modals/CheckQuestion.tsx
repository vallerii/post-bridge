interface Props {
  title: string
  desc: string
  value: 'yes' | 'no' | null
  onChange: (v: 'yes' | 'no') => void
  alertNo?: string
  alertYes?: string
}

export function CheckQuestion({ title, desc, value, onChange, alertNo, alertYes }: Props) {
  return (
    <div className="mb-4">
      <div className="text-white font-bold mb-1">{title}</div>
      <div className="text-zinc-400 text-sm leading-relaxed mb-3">{desc}</div>
      <div className="flex gap-2">
        <button
          onClick={() => onChange('yes')}
          className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all
            ${value === 'yes'
              ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#A78BFA]'
              : 'border-[#2A2A32] bg-[#1E1E23] text-zinc-400 hover:border-[#6C63FF] hover:text-white'
            }`}
        >
          ✅ Так
        </button>
        <button
          onClick={() => onChange('no')}
          className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all
            ${value === 'no'
              ? 'border-red-500/50 bg-red-500/10 text-red-400'
              : 'border-[#2A2A32] bg-[#1E1E23] text-zinc-400 hover:border-red-500/50 hover:text-white'
            }`}
        >
          ❌ Ні
        </button>
      </div>
      {value === 'no' && alertNo && (
        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
          {alertNo}
        </div>
      )}
      {value === 'yes' && alertYes && (
        <div className="mt-3 p-3 bg-[#6C63FF]/10 border border-[#6C63FF]/30 rounded-lg text-[#A78BFA] text-sm">
          {alertYes}
        </div>
      )}
    </div>
  )
}