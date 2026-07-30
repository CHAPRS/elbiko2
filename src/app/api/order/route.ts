import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Настройка почтового сервера с жестким принуждением к IPv4
const transporter = nodemailer.createTransport({
  // Прямой IPv4 адрес сервера smtp.yandex.ru для обхода ошибки ETIMEDOUT
  host: '87.250.250.38', 
  port: 465,
  secure: true, 
  connectionTimeout: 5000, // таймаут на подключение 5 секунд
  greetingTimeout: 5000,
  socketTimeout: 5000,
  dnsjs: false, // Отключаем внутренний DNS Node.js
  auth: {
    user: 'your-email@yandex.ru', // ВАША ПОЧТА (отправитель)
    pass: 'your-app-password',   // ПАРОЛЬ ПРИЛОЖЕНИЯ
  },
  // Принудительно заставляем сокет использовать только IPv4
  tls: {
    servername: 'smtp.yandex.ru' // Обязательно для SSL сертификата Яндекса
  }
} as any);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, bikeName } = body;

    if (!name || !phone || !bikeName) {
      return NextResponse.json({ error: 'Пожалуйста, заполните имя и телефон' }, { status: 400 });
    }

    const mailOptions = {
      from: 'your-email@yandex.ru', // Должно совпадать с user
      to: 'manager-email@yandex.ru', // КУДА присылать заявки
      subject: `⚡ Новая заявка на аренду: ${bikeName}`,
      html: `
        <h2>Новая заявка на бронирование велосипеда</h2>
        <p><b>Выбранная модель:</b> ${bikeName}</p>
        <p><b>Имя клиента:</b> ${name}</p>
        <p><b>Телефон для связи:</b> ${phone}</p>
        <br />
        <p><i>Необходимо связаться с клиентом в течение 5 минут!</i></p>
      `,
    };

    // Отправляем через IPv4 сокет
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('Ошибка отправки почты:', error.message);
    
    // Если забыли поменять почту/пароль, выводим понятную подсказку
    if (error.message.includes('auth')) {
      return NextResponse.json({ error: 'Ошибка авторизации почты. Проверьте логин и пароль приложения в route.ts' }, { status: 500 });
    }
    
    return NextResponse.json({ error: `Сбой IPv4 шлюза: ${error.message}` }, { status: 500 });
  }
}
