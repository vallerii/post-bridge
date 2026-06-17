import Link from "next/link";
import { EmptyState } from "./EmptyState";

interface Props {
  posts: {
    id: string;
    title: string | null;
    status: string;
    created_at: string;
  }[];
}

export function RecentPosts({ posts }: Props) {
  if (!posts.length) {
    return (
      <EmptyState
        emoji="📭"
        title="No posts yet"
        description="Create your first publication"
        buttonLabel="Create Post"
        href="/posts/new"
      />
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        Recent Posts
      </h2>

      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-violet-500"
          >
            <div className="font-medium">
              {post.title || "Untitled post"}
            </div>

            <div className="mt-1 text-xs text-zinc-500">
              {new Date(
                post.created_at
              ).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}