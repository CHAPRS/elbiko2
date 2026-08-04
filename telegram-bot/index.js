const { Telegraf } = require('telegraf');

// Рабочий токен авторизации вашего бота
const finalToken = '8653805854:AAHoAngkcdhErgGCmoHn7ja-lsx1VYN_wIQ';

// Вставьте сюда ID вашей административной группы менеджеров (Обязательно со знаком минус)
const ADMIN_CHAT_ID = -1002381920381; // <-- ЗАМЕНИТЕ ЭТО ЧИСЛО НА ВАШ ID ГРУППЫ

console.log('Попытка авторизации бота...');
const bot = new Telegraf(finalToken);

// Функция отправки лида менеджерам
function sendLeadToManagers(ctx, name, phone, bike) {
  ctx.reply(
    '🎉 Спасибо! Ваша заявка на аренду Elbiko успешно принята.\n\n' +
    'Наш менеджер уже проверяет данные и свяжется с вами в течение 10 минут!'
  );

  const targetChat = (ADMIN_CHAT_ID && ADMIN_CHAT_ID !== -1002381920381) ? ADMIN_CHAT_ID : ctx.chat.id;

  bot.telegram.sendMessage(
    targetChat,
    '🔥 ПОСТУПИЛА НОВАЯ ЗАЯВКА ИЗ WEB APP:\n' +
    '────────────────────────\n' +
    '👤 Клиент: ' + name + '\n' +
    '📞 Телефон: ' + phone + '\n' +
    '🚲 Велосипед: ' + bike + '\n' +
    '────────────────────────\n' +
    '👤 Аккаунт курьера: @' + (ctx.from.username || 'скрыт') + '\n' +
    '🆔 ID чата курьера: ' + ctx.from.id
  );
}

// 1. Обработчик для старых диплинков (из обычного внешнего браузера)
bot.start((ctx) => {
  const payload = ctx.startPayload;
  if (payload) {
    try {
      const decoded = decodeURIComponent(payload);
      const name = decoded.match(/Имя_(.*?)_Тел_/)?.[1] || 'Не указано';
      const phone = decoded.match(/_Тел_(.*?)_Байк_/)?.[1] || 'Не указано';
      const bike = decoded.split('_Байк_')[1] || 'Электровелосипед';
      sendLeadToManagers(ctx, name, phone, bike);
    } catch (e) {
      console.error(e);
    }
   } else {
    ctx.reply(
      '👋 Приветствуем в Elbiko Eco-Sharing!\n\n' +
      'Нажмите кнопку ниже, чтобы открыть наш каталог прямо внутри Telegram и арендовать байк:',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Открыть каталог Elbiko', web_app: { url: 'https://nasty-animals-swim.loca.lt' } }]
          ]
        }
      }
    );
  }

});

// 2. ОБРАБОТЧИК НАПРЯМУЮ ИЗ ИНТЕРФЕЙСА (Web App Data)
bot.on('web_app_data', (ctx) => {
  try {
    // Получаем и парсим пришедший JSON с сайта
    const data = JSON.parse(ctx.message.web_app_data.data);
    
    if (data.name && data.phone) {
      sendLeadToManagers(ctx, data.name, data.phone, data.bike);
    }
  } catch (error) {
    console.error('Ошибка разбора данных WebApp:', error);
  }
});

bot.launch().then(() => {
  console.log('🚀 Бот запущен в режиме ультра-стабильного WebApp каталога!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
