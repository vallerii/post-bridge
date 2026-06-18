import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const message = body.message

  if (!message) return NextResponse.json({ ok: true })

  const chatId = message.chat.id
  const chatType = message.chat.type // 'group', 'supergroup', 'channel', 'private'
  const chatTitle = message.chat.title ?? 'чат'

  // Бота добавили в группу/канал
  if (message.new_chat_members) {
    const botAdded = message.new_chat_members.some((m: { is_bot: boolean }) => m.is_bot)
    if (botAdded) {
      await sendMessage(chatId,
        `👋 <b>PostBridge Bot підключено!</b>\n\n` +
        `📋 Назва: <b>${chatTitle}</b>\n` +
        `🔑 Ваш Chat ID:\n\n` +
        `<code>${chatId}</code>\n\n` +
        `Скопіюйте цей ID та вставте в PostBridge при підключенні Telegram.`
      )
    }
  }

  // Команда /start или /id
  if (message.text === '/start' || message.text === '/id') {
    if (chatType === 'private') {
      await sendMessage(chatId,
        `👋 <b>Привіт!</b>\n\n` +
        `Додайте мене в групу або канал, і я автоматично надішлю Chat ID.\n\n` +
        `Або перешліть мені будь-яке повідомлення з вашої групи — я дам її ID.`
      )
    } else {
      await sendMessage(chatId,
        `🔑 Chat ID цього чату:\n\n<code>${chatId}</code>\n\n` +
        `Скопіюйте та вставте в PostBridge.`
      )
    }
  }

  return NextResponse.json({ ok: true })
}