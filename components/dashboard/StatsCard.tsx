interface Props {
  title: string;
  value: string | number;
  subtitle: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
}: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </p>

      <div className="mt-2 text-3xl font-bold">
        {value}
      </div>

      <p className="mt-1 text-xs text-zinc-400">
        {subtitle}
      </p>
    </div>
  );
}