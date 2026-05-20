import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import {
  getClientIP, isRateLimited, recordFailedLogin,
  clearLoginAttempts, remainingLockout,
} from '@/lib/admin-auth';

export async function POST(request) {
  const ip = getClientIP(request);

  if (isRateLimited(ip)) {
    const mins = remainingLockout(ip);
    return NextResponse.json(
      { error: `Quá nhiều lần thử. Vui lòng đợi ${mins} phút.` },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await request.json();

    const user = await prisma.adminUser.findUnique({ where: { username } });
    if (!user) {
      recordFailedLogin(ip);
      return NextResponse.json({ error: 'Sai tên đăng nhập hoặc mật khẩu' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      recordFailedLogin(ip);
      return NextResponse.json({ error: 'Sai tên đăng nhập hoặc mật khẩu' }, { status: 401 });
    }

    clearLoginAttempts(ip);

    const cookieStore = await cookies();
    cookieStore.set('admin_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_auth');
  return NextResponse.json({ success: true });
}
