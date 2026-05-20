const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash: hash },
  });

  // Services
  const services = [
    { id: 1, name: 'Siêu âm tổng quát', description: 'Siêu âm bụng, gan, mật, tụy, lách, thận, bàng quang với máy 4D thế hệ mới', icon: 'ri-heart-pulse-line', order: 1 },
    { id: 2, name: 'Siêu âm thai sản', description: 'Theo dõi thai kỳ, siêu âm 4D thai nhi, sàng lọc dị tật bẩm sinh', icon: 'ri-parent-line', order: 2 },
    { id: 3, name: 'Tầm soát ung thư', description: 'Phát hiện sớm ung thư gan, tuyến giáp, vú, buồng trứng, cổ tử cung', icon: 'ri-microscope-line', order: 3 },
    { id: 4, name: 'Siêu âm tim mạch', description: 'Đánh giá chức năng tim, van tim, mạch máu ngoại biên bằng Doppler màu', icon: 'ri-scan-2-line', order: 4 },
    { id: 5, name: 'Xét nghiệm sinh hóa', description: 'Xét nghiệm máu, marker ung thư (CEA, AFP, CA125, PSA), kết quả trong ngày', icon: 'ri-test-tube-line', order: 5 },
    { id: 6, name: 'Tư vấn chuyên khoa', description: 'Tư vấn trực tiếp với bác sĩ, phân tích kết quả và kế hoạch theo dõi', icon: 'ri-user-heart-line', order: 6 },
  ];
  for (const s of services) {
    await prisma.service.upsert({ where: { id: s.id }, update: s, create: s });
  }

  // Doctors
  const doctors = [
    { id: 1, name: 'TS. BS. Nguyễn Văn Minh', credentials: 'Tiến sĩ Y khoa', specialty: 'Siêu âm Tổng quát & Tim mạch', bio: 'Hơn 15 năm kinh nghiệm tại BV Chợ Rẫy, chuyên gia siêu âm can thiệp tim mạch.', imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80', tags: JSON.stringify(['Siêu âm 4D', 'Tim mạch']), order: 1 },
    { id: 2, name: 'PGS. BS. Trần Thị Lan', credentials: 'Phó Giáo sư, Tiến sĩ', specialty: 'Ung bướu & Nội tiết', bio: 'Nguyên trưởng khoa Ung bướu BV Ung Bướu TP.HCM, 20 năm kinh nghiệm.', imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&q=80', tags: JSON.stringify(['Ung bướu', 'Tầm soát sớm']), order: 2 },
    { id: 3, name: 'BS. CKI. Lê Hoàng Nam', credentials: 'Bác sĩ Chuyên khoa I', specialty: 'Sản phụ khoa & Thai sản', bio: 'Chuyên gia siêu âm thai 4D, sàng lọc trước sinh tại BV Từ Dũ TP.HCM.', imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80', tags: JSON.stringify(['Thai 4D', 'Sàng lọc thai']), order: 3 },
  ];
  for (const d of doctors) {
    await prisma.doctor.upsert({ where: { id: d.id }, update: d, create: d });
  }

  // Sample appointments
  const existing = await prisma.appointment.count();
  if (existing === 0) {
    await prisma.appointment.createMany({
      data: [
        { patientName: 'Nguyễn Thị Lan', phone: '0901234567', service: 'Siêu âm tổng quát', date: '2025-05-22', timeSlot: 'Sáng (7:00 – 12:00)', notes: 'Đau bụng vùng gan', status: 'confirmed' },
        { patientName: 'Trần Văn Bình', phone: '0912345678', service: 'Tầm soát ung thư', date: '2025-05-22', timeSlot: 'Chiều (13:00 – 17:00)', notes: '', status: 'pending' },
        { patientName: 'Lê Thị Hoa', phone: '0923456789', service: 'Siêu âm thai sản', date: '2025-05-23', timeSlot: 'Sáng (7:00 – 12:00)', notes: 'Thai 28 tuần', status: 'pending' },
      ],
    });
  }

  console.log('✓ Seed completed');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
