import { prisma } from '@/lib/prisma';
import HeroPage from '@/components/HeroPage';

export const revalidate = 60;

async function getSettings() {
  try {
    const rows = await prisma.siteSetting.findMany();
    return Object.fromEntries(rows.map(r => [r.key, r.value]));
  } catch {
    return {};
  }
}

async function getServices() {
  try {
    const rows = await prisma.service.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
    return rows.map(s => ({ icon: s.icon, name: s.name, desc: s.description }));
  } catch {
    return [];
  }
}

async function getDoctors() {
  try {
    const rows = await prisma.doctor.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
    return rows.map(d => ({
      name: d.name,
      specialty: d.specialty,
      bio: d.bio,
      img: d.imageUrl || '',
      tags: JSON.parse(d.tags || '[]'),
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata() {
  const s = await getSettings();
  return {
    title: s.site_name ? `Phòng Khám ${s.site_name} – Siêu Âm & Tầm Soát Ung Bướu` : 'Phòng Khám Siêu Âm & Tầm Soát Ung Bướu An Bình',
    description: s.home_subtitle || 'Chẩn đoán chính xác, tầm soát sớm vì sức khỏe của bạn và gia đình.',
  };
}

export default async function HomePage() {
  const [settings, services, doctors] = await Promise.all([getSettings(), getServices(), getDoctors()]);
  return <HeroPage settings={settings} services={services} doctors={doctors} />;
}
