import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Админские API закрыты той же сессией, что и страницы админки
  if (pathname.startsWith("/api/admin")) {
    if (!request.cookies.has("admin_session")) {
      return NextResponse.json({ error: "Требуется авторизация администратора" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 1. Позволяем свободно загружать системные файлы Next.js, картинки, API и главную
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api") || 
    pathname === "/" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Читаем сессионные куки
  const hasCourierSession = request.cookies.has("courier_session");
  const hasAdminSession = request.cookies.has("admin_session");

  // 2. ЗАЩИТА ОТ ЦИКЛА: Если пользователь УЖЕ идет на страницу логина, не трогаем его
  if (pathname === "/login") {
    // Если он уже авторизован, можно сразу перекинуть в ЛК
    if (hasCourierSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (hasAdminSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // 3. Защита панели администратора
  if (pathname.startsWith("/admin")) {
    if (!hasAdminSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 4. Защита личного кабинета курьера
  if (pathname.startsWith("/dashboard")) {
    if (!hasCourierSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Конфигурируем перехватчик для всех путей
export const config = {
  // Защита будет срабатывать ТОЛЬКО на папки /admin и /dashboard
  // Главная страница сайта (/) теперь полностью открыта для всех курьеров!
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};

