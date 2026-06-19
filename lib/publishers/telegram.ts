import { PostData } from "./types"

export async function publishToTelegram(
  post: PostData,
  credentials: Record<string, string>
) {
  const bot_token = process.env.TELEGRAM_BOT_TOKEN!
  const { chat_id } = credentials

  const parts: string[] = []
  if (post.title) parts.push(`*${post.title}*`)
  if (post.description) parts.push(post.description)
  if (post.price) parts.push(`\n💰 ${post.price} ${post.currency ?? 'UAH'}`)
  const caption = parts.join('\n\n')

  const media = post.media_urls ?? []

  // Якщо є медіа — відправляємо як mediaGroup
  if (media.length > 0) {
    const mediaTypes = post.media_types ?? []

    // Telegram mediaGroup — максимум 10 файлів
    const mediaGroup = media.slice(0, 10).map((url, i) => {
      const isVideo = mediaTypes[i] === 'video'
      return {
        type: isVideo ? 'video' : 'photo',
        media: url,
        // caption тільки на першому елементі
        ...(i === 0 ? { caption, parse_mode: 'Markdown' } : {}),
      }
    })

    const res = await fetch(
      `https://api.telegram.org/bot${bot_token}/sendMediaGroup`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, media: mediaGroup }),
      }
    )
    const data = await res.json()
    if (!data.ok) throw new Error(`Telegram error: ${data.description}`)
    return data
  }

  // Якщо медіа немає — просто текст
  const res = await fetch(
    `https://api.telegram.org/bot${bot_token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text: caption, parse_mode: 'Markdown' }),
    }
  )
  const data = await res.json()
  if (!data.ok) throw new Error(`Telegram error: ${data.description}`)
  return data
}