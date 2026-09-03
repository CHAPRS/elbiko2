const TELEGRAM_API = 'https://api.telegram.org';

function getBotToken(): string | undefined {
  return process.env.TELEGRAM_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
}

function getAdminChatId(): string | undefined {
  return process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
}

function getRelayUrl(): string | undefined {
  return process.env.TELEGRAM_RELAY_URL;
}

function getRelaySecret(): string | undefined {
  return process.env.TELEGRAM_RELAY_SECRET;
}

export async function sendTelegramMessage(
  chatId: string | number,
  message: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<boolean> {
  const relayUrl = getRelayUrl();

  if (relayUrl) {
    try {
      const response = await fetch(relayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Relay-Secret': getRelaySecret() || '',
        },
        body: JSON.stringify({
          text: message,
          parse_mode: parseMode,
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        console.error('Telegram relay responded with an error:', details);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to send Telegram notification via relay:', error);
      return false;
    }
  }

  const botToken = getBotToken();

  if (!botToken) {
    console.warn('TELEGRAM_TOKEN is not configured in .env');
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('Telegram API responded with an error:', details);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}

export async function sendTelegramNotification(
  message: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<boolean> {
  const chatId = getAdminChatId();

  if (!chatId) {
    console.warn('TELEGRAM_ADMIN_CHAT_ID is not configured in .env');
    return false;
  }

  return sendTelegramMessage(chatId, message, parseMode);
}
