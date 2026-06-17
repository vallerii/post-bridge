interface Post {
  title: string | null
  description: string | null
  price: number | null
  currency: string | null
}

interface TelegramCredentials {
  bot_token: string
  chat_id: string
}

export async function publishToTelegram(
  post: Post,
  credentials: TelegramCredentials
) {
  const { bot_token, chat_id } = credentials

  // Формируем текст
  const parts: string[] = []
  if (post.title) parts.push(`*${post.title}*`)
  if (post.description) parts.push(post.description)
  if (post.price) parts.push(`\n💰 ${post.price} ${post.currency ?? 'UAH'}`)
  const text = parts.join('\n\n')

  const res = await fetch(
    `https://api.telegram.org/bot${bot_token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        text,
        parse_mode: 'Markdown',
      }),
    }
  )

  const data = await res.json()
  if (!data.ok) throw new Error(`Telegram error: ${data.description}`)
  return data
}