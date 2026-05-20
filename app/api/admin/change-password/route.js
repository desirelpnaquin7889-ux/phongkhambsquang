import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAuth } from '@/lib/admin-auth';

export async function POST(request) {
  const deny = await requireAuth();
  if (deny) return deny;
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Mật khẩu mới phải có ít nhất 8 ký tự' }, { status: 400 });
    }

    const admin = await prisma.adminUser.findFirst();
    if (!admin) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Mật khẩu hiện tại không đúng' }, { status: 401 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
