export interface PostData {
  title: string | null
  description: string | null
  price: number | null
  currency: string | null
  image_url?: string | null
  media_urls?: string[]
  media_types?: string[]
}

export type Publisher = (
  post: PostData,
  credentials: Record<string, string>
) => Promise<unknown>