import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSessionToken } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Админские API закрыты подписанной сессионной кукой
  if (pathname.startsWith("/api/admin")) {
    const adminSession = request.cookies.get("admin_session")?.value;
    const isValid = await verifyAdminSessionToken(adminSession);
    if (!isValid) {
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
  const adminSession = request.cookies.get("admin_session")?.value;

  // 2. ЗАЩИТА ОТ ЦИКЛА: Если пользователь УЖЕ идет на страницу логина, не трогаем его
  if (pathname === "/login") {
    if (hasCourierSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    const isAdminValid = await verifyAdminSessionToken(adminSession);
    if (isAdminValid) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // 3. Защита панели администратора
  if (pathname.startsWith("/admin")) {
    const isAdminValid = await verifyAdminSessionToken(adminSession);
    if (!isAdminValid) {
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
  // Защита срабатывает на /admin, /dashboard и админских API
  matcher: ['/admin/:path*', '/dashboard/:path*', '/api/admin/:path*'],
};
