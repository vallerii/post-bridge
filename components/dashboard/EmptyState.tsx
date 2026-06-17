import Link from "next/link";

interface Props {
  emoji: string;
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
}

export function EmptyState({
  emoji,
  title,
  description,
  buttonLabel,
  href,
}: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
      <div className="mb-4 text-5xl">
        {emoji}
      </div>

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-zinc-400">
        {description}
      </p>

      <Link
        href={href}
        className="mt-5 inline-flex rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500"
      >
        {buttonLabel}
      </Link>
    </div>
  );
}