const { Telegraf, Markup } = require('telegraf');

// Твой личный токен от @BotFather
const BOT_TOKEN = '8653805854:AAHoAngkcdhErgGCmoHn7ja-lsx1VYN_wIQ'; 

const bot = new Telegraf(BOT_TOKEN);

console.log('🤖 Telegram-бот EBIKE-RENT запущен в режиме безопасных инлайн-ссылок!');

bot.start((ctx) => {
  const username = ctx.from.first_name || 'курьер';
  const chatId = ctx.from.id;

  // Убираем http://localhost из строки, чтобы Telegram API пропустил ссылку без ошибок!
  // MiniApp автоматически поймет, куда слать данные, используя стандартный порт 3040.
  const secureUrl = "https://vercel.app" + chatId;

  return ctx.reply(
    "👋 Привет, " + username + "!\n\nДобро пожаловать в систему уведомлений *EBIKE-RENT*.\n\nЧтобы привязать этот аккаунт Telegram к твоему профилю шеринга и получать автоматические напоминания о списаниях, нажмите на инлайн-кнопку ниже 👇",
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('📱 Привязать профиль в 1 клик', secureUrl)]
      ])
    }
  );
});

bot.launch().catch(err => console.error('Ошибка старта бота:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
