import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ЗАЩИТА ЛИЧНОГО КАБИНЕТА КУРЬЕРА (/dashboard)
  if (pathname.startsWith('/dashboard')) {
    const courierSession = request.cookies.get('courier_session');

    // Если куки нет, отправляем курьера авторизоваться на страницу /login
    if (!courierSession) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. ЗАЩИТА АДМИН-ПАНЕЛИ (/admin)
  if (pathname.startsWith('/admin')) {
    const adminSession = request.cookies.get('admin_session');

    // Если куки админа нет, отправляем на страницу входа
    if (!adminSession) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. ЗАЩИТА ПРИВАТНЫХ API-РОУТОВ
  // Если неавторизованный пользователь стучится в API курьера напрямую
  if (pathname.startsWith('/api/courier') && !pathname.includes('/login')) {
    const courierSession = request.cookies.get('courier_session');
    
    if (!courierSession) {
      return NextResponse.json(
        { error: 'Доступ запрещен: требуется авторизация' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// Конфигурация путей, которые перехватывает Middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/courier/:path*'
  ],
};
