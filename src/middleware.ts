import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSessionToken } from "@/lib/session";

const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.ALLOWED_ORIGIN ||
  "*";

function setCorsHeaders(response: NextResponse, origin: string | null) {
  const corsOrigin = allowedOrigin === "*" ? origin || "*" : allowedOrigin;
  response.headers.set("Access-Control-Allow-Origin", corsOrigin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie"
  );
  if (allowedOrigin !== "*") {
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return response;
}

function preflightResponse(request: NextRequest) {
  const origin = request.headers.get("origin");
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response, origin);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  // 1. CORS + защита API
  if (pathname.startsWith("/api")) {
    // Preflight-запросы
    if (request.method === "OPTIONS") {
      return preflightResponse(request);
    }

    // Админские API закрыты подписанной сессионной кукой
    if (pathname.startsWith("/api/admin")) {
      const adminSession = request.cookies.get("admin_session")?.value;
      const isValid = await verifyAdminSessionToken(adminSession);
      if (!isValid) {
        const response = NextResponse.json(
          { error: "Требуется авторизация администратора" },
          { status: 401 }
        );
        return setCorsHeaders(response, origin);
      }
      const response = NextResponse.next();
      return setCorsHeaders(response, origin);
    }

    // Публичные API — добавляем CORS-заголовки
    const response = NextResponse.next();
    return setCorsHeaders(response, origin);
  }

  // 2. Позволяем свободно загружать системные файлы Next.js, картинки и главную
  if (
    pathname.startsWith("/_next") ||
    pathname === "/" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 3. Читаем сессионные куки
  const hasCourierSession = request.cookies.has("courier_session");
  const adminSession = request.cookies.get("admin_session")?.value;

  // 4. ЗАЩИТА ОТ ЦИКЛА: Если пользователь УЖЕ идет на страницу логина, не трогаем его
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

  // 5. Защита панели администратора
  if (pathname.startsWith("/admin")) {
    const isAdminValid = await verifyAdminSessionToken(adminSession);
    if (!isAdminValid) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 6. Защита личного кабинета курьера
  if (pathname.startsWith("/dashboard")) {
    if (!hasCourierSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // CORS + защита срабатывает на /admin, /dashboard и всех API
  matcher: ["/admin/:path*", "/dashboard/:path*", "/api/:path*"],
};
