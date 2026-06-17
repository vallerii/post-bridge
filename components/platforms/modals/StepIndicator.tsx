interface Props {
  total: number
  current: number
}

export function StepIndicator({ total, current }: Props) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
            ${i + 1 < current ? 'bg-emerald-500 text-black'
            : i + 1 === current ? 'bg-[#6C63FF] text-white'
            : 'bg-[#1E1E23] text-zinc-500'}`}>
            {i + 1 < current ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-[2px] flex-1 transition-all ${i + 1 < current ? 'bg-emerald-500' : 'bg-[#2A2A32]'}`} />
          )}
        </div>
      ))}
    </div>
  )
}