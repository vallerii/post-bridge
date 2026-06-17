import { StatsCard } from "./StatsCard";

interface Props {
  stats: {
    posts: number;
    platforms: number;
  };
}

export function DashboardStats({ stats }: Props) {
  return (
    <div className="grid gap-6 md:gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        title="Posts"
        value={stats.posts}
        subtitle="this month"
      />

      <StatsCard
        title="Platforms"
        value={stats.platforms}
        subtitle="connected"
      />

      <StatsCard
        title="Reach"
        value="—"
        subtitle="coming soon"
      />

      <StatsCard
        title="Products"
        value="—"
        subtitle="synced"
      />
    </div>
  );
}