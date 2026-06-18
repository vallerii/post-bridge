import { createClient } from '@/lib/supabase/client'

export type MediaFile = {
  url: string
  type: 'image' | 'video'
  name: string
  size: number
}

const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEOS = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi', 'video/webm']
const MAX_IMAGE_SIZE = 20 * 1024 * 1024  // 20MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024 // 200MB

export function validateFile(file: File): string | null {
  const isImage = ALLOWED_IMAGES.includes(file.type)
  const isVideo = ALLOWED_VIDEOS.includes(file.type)

  if (!isImage && !isVideo) {
    return `${file.name}: непідтримуваний формат. Дозволено JPG, PNG, WebP, GIF, MP4, MOV, AVI`
  }
  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return `${file.name}: зображення більше 20MB`
  }
  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return `${file.name}: відео більше 200MB`
  }
  return null
}

export async function uploadFile(
  file: File,
  userId: string,
  onProgress?: (percent: number) => void
): Promise<MediaFile> {
  const supabase = createClient()

  const ext = file.name.split('.').pop()
  const type = ALLOWED_IMAGES.includes(file.type) ? 'image' : 'video'
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  onProgress?.(10)

  const { error } = await supabase.storage
    .from('post-media')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw new Error(`Помилка завантаження: ${error.message}`)

  onProgress?.(90)

  const { data: { publicUrl } } = supabase.storage
    .from('post-media')
    .getPublicUrl(path)

  onProgress?.(100)

  return { url: publicUrl, type, name: file.name, size: file.size }
}

export async function deleteFile(url: string): Promise<void> {
  const supabase = createClient()
  // витягуємо path з публічного URL
  const path = url.split('/post-media/')[1]
  if (!path) return
  await supabase.storage.from('post-media').remove([path])
}