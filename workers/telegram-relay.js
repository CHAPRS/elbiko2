export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const secret = request.headers.get('X-Relay-Secret') || '';
    if (env.RELAY_SECRET && secret !== env.RELAY_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    const { text, parse_mode = 'HTML' } = body;
    if (!text || typeof text !== 'string') {
      return new Response('Missing text', { status: 400 });
    }

    if (!env.BOT_TOKEN || !env.ADMIN_CHAT_ID) {
      return new Response('Worker not configured', { status: 500 });
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.ADMIN_CHAT_ID,
          text,
          parse_mode,
        }),
      }
    );

    if (!telegramResponse.ok) {
      const details = await telegramResponse.text();
      return new Response(`Telegram error: ${details}`, { status: 502 });
    }

    return new Response('OK');
  },
};
