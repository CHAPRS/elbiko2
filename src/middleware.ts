import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверяем, авторизован ли пользователь (ищем нашу сессионную куку)
  const isAuthenticated = request.cookies.get('elbiko_admin_session');

  // Если пользователь пытается зайти в админку или закрытый API без куки — отправляем на логин
  if ((pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) && !isAuthenticated) {
    // Делаем редирект на страницу входа
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Если все хорошо или страница общедоступная — пропускаем запрос дальше
  return NextResponse.next();
}

// Указываем Middleware, какие именно роуты нужно сканировать и защищать
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
