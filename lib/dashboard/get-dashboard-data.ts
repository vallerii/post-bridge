import { createClient } from "@/lib/supabase/server";

export async function getDashboardData() {
  const supabase = await createClient();

  const [
    postsResult,
    platformsResult,
    recentPostsResult,
    connectedPlatformsResult,
  ] = await Promise.all([
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("connected_platforms")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),

    supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("connected_platforms")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
  ]);

  return {
    stats: {
      posts: postsResult.count ?? 0,
      platforms: platformsResult.count ?? 0,
    },

    recentPosts: recentPostsResult.data ?? [],

    platforms: connectedPlatformsResult.data ?? [],
  };
}