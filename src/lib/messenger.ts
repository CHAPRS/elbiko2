import { User } from '@prisma/client';

export interface MessengerUser {
  telegramChatId?: string | null;
  maxChatId?: string | null;
  preferredMessenger?: string | null;
}

function getMaxSendUrl(): string | undefined {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_MAX_SEND_URL;
  }
  return process.env.MAX_SEND_URL || process.env.NEXT_PUBLIC_MAX_SEND_URL;
}

export function buildMaxLink(user: MessengerUser): string | null {
  const baseUrl = getMaxSendUrl();
  const chatId = user.maxChatId || user.preferredMessenger === 'MAX' ? user.maxChatId : null;
  if (!baseUrl || !chatId) return null;

  const encoded = encodeURIComponent(chatId);
  if (baseUrl.includes('{{chatId}}')) {
    return baseUrl.replace(/{{chatId}}/g, encoded);
  }
  if (baseUrl.includes('{{phone}}')) {
    return baseUrl.replace(/{{phone}}/g, encoded);
  }

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}to=${encoded}`;
}

export async function sendNotification(
  user: MessengerUser,
  text: string
): Promise<void> {
  const prefersMax = !user.preferredMessenger || user.preferredMessenger === 'MAX';

  if (prefersMax && user.maxChatId) {
    const maxApiUrl = process.env.MAX_API_URL;
    const maxApiToken = process.env.MAX_API_TOKEN;

    if (!maxApiUrl || !maxApiToken) {
      console.warn('MAX API not configured. Skipping MAX notification.');
      return;
    }

    try {
      const res = await fetch(maxApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${maxApiToken}`,
        },
        body: JSON.stringify({ chatId: user.maxChatId, text }),
      });

      if (!res.ok) {
        console.error('MAX send failed:', await res.text());
      }
    } catch (err) {
      console.error('MAX send error:', err);
    }

    return;
  }

  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

  if (user.telegramChatId && telegramBotToken) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: user.telegramChatId,
            text,
          }),
        }
      );

      if (!res.ok) {
        console.error('Telegram send failed:', await res.text());
      }
    } catch (err) {
      console.error('Telegram send error:', err);
    }

    return;
  }

  console.warn('No messenger configured for user, notification skipped.');
}
