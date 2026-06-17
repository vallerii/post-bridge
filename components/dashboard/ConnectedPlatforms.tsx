import { EmptyState } from "./EmptyState";

const platformMeta = {
  instagram: {
    icon: "📸",
    name: "Instagram",
  },
  telegram: {
    icon: "✈️",
    name: "Telegram",
  },
  prom: {
    icon: "🛒",
    name: "Prom.ua",
  },
  woocommerce: {
    icon: "🌐",
    name: "WooCommerce",
  },
};

interface Props {
  platforms: {
    id: string;
    platform: string;
  }[];
}

export function ConnectedPlatforms({
  platforms,
}: Props) {
  if (!platforms.length) {
    return (
      <EmptyState
        emoji="🔌"
        title="No connected platforms"
        description="Connect Instagram, Telegram, Prom or WooCommerce"
        buttonLabel="Connect Platform"
        href="/platforms"
      />
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        Connected Platforms
      </h2>

      <div className="space-y-3">
        {platforms.map((platform) => {
          const meta =
            platformMeta[
              platform.platform as keyof typeof platformMeta
            ];

          return (
            <div
              key={platform.id}
              className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <span className="text-2xl">
                {meta?.icon ?? "🔌"}
              </span>

              <div>
                <div className="font-medium">
                  {meta?.name ??
                    platform.platform}
                </div>

                <div className="text-xs text-emerald-400">
                  Connected
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}