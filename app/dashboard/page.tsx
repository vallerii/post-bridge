import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentPosts } from "@/components/dashboard/RecentPosts";
import { ConnectedPlatforms } from "@/components/dashboard/ConnectedPlatforms";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";
export interface DashboardStats {
  posts: number;
  platforms: number;
}

export interface Post {
  id: string;
  title: string | null;
  description: string | null;
  status: string;
  created_at: string;
  targets: string[];
}

export interface Platform {
  id: string;
  platform: string;
  is_active: boolean;
  created_at: string;
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />

      <DashboardStats stats={data.stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentPosts posts={data.recentPosts} />

        <ConnectedPlatforms
          platforms={data.platforms}
        />
      </div>
    </div>
  );
}