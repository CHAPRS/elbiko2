import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { verifyAdminSessionToken } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const adminToken = cookieStore.get('admin_session')?.value;
    const admin = await verifyAdminSessionToken(adminToken);

    if (!admin.valid) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 401 });
    }

    const { phone, password } = await request.json();

    if (!phone || !password || password.length < 6) {
      return NextResponse.json(
        { error: 'Укажите телефон и пароль от 6 символов' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      return NextResponse.json({ error: 'Курьер не найден' }, { status: 404 });
    }

    const hashed = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetCode: null,
        passwordResetCodeExpiresAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка установки пароля админом:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
