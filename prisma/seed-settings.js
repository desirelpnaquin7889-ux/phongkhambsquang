const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const dbPath = 'file:' + path.join(__dirname, '..', 'dev.db').replace(/\\/g, '/');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

const defaults = [
  { key: 'site_name',              value: 'An Bình' },
  { key: 'home_title',             value: 'Chẩn đoán chính xác, Tầm soát sớm vì sức khỏe của bạn' },
  { key: 'home_subtitle',          value: 'Đội ngũ bác sĩ chuyên khoa, thiết bị siêu âm thế hệ mới, kết quả chính xác — vì sức khỏe của bạn và gia đình.' },
  { key: 'contact_address',        value: '[Địa chỉ phòng khám], TP. Hồ Chí Minh' },
  { key: 'contact_phone',          value: '028 1234 5678' },
  { key: 'contact_email',          value: '[Email liên hệ]' },
  { key: 'contact_hours_weekday',  value: 'Thứ 2 – Thứ 7: 7:00 – 17:00' },
  { key: 'contact_hours_sunday',   value: 'Chủ nhật: 7:00 – 12:00' },
  { key: 'contact_open_time',      value: '07:00' },
  { key: 'contact_close_time',     value: '17:00' },
  { key: 'contact_maps_embed',     value: '' },
  { key: 'contact_maps_link',      value: 'https://maps.google.com' },
];

async function main() {
  for (const s of defaults) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`✓ Seeded ${defaults.length} site settings`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
