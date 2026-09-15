import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Некорректная ссылка' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: 'Ссылка недействительна' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, alreadyVerified: true });
    }

    if (!user.emailVerificationTokenExpiresAt || new Date() > user.emailVerificationTokenExpiresAt) {
      return NextResponse.json({ error: 'Ссылка истекла' }, { status: 410 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      },
    });

    return NextResponse.json({ success: true, alreadyVerified: false });
  } catch (error) {
    console.error('Ошибка подтверждения email:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
