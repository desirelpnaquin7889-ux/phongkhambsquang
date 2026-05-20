'use client';
import { useEffect, useRef, useState } from 'react';
import BookingForm from './BookingForm';

const SERVICES = [
  { icon: 'ri-heart-pulse-line', name: 'Siêu âm tổng quát', desc: 'Siêu âm bụng, gan, mật, tụy, lách, thận, bàng quang với máy siêu âm 4D thế hệ mới nhất.' },
  { icon: 'ri-parent-line', name: 'Siêu âm thai sản', desc: 'Theo dõi thai kỳ, siêu âm 4D thai nhi, sàng lọc dị tật bẩm sinh sớm với độ chính xác cao.' },
  { icon: 'ri-microscope-line', name: 'Tầm soát ung thư', desc: 'Phát hiện sớm ung thư gan, tuyến giáp, vú, buồng trứng, cổ tử cung qua siêu âm và xét nghiệm marker.' },
  { icon: 'ri-scan-2-line', name: 'Siêu âm tim mạch', desc: 'Đánh giá chức năng tim, van tim, mạch máu ngoại biên bằng siêu âm Doppler màu chuyên sâu.' },
  { icon: 'ri-test-tube-line', name: 'Xét nghiệm sinh hóa', desc: 'Xét nghiệm máu, marker ung thư (CEA, AFP, CA125, PSA), sinh hóa toàn diện — kết quả trong ngày.' },
  { icon: 'ri-user-heart-line', name: 'Tư vấn chuyên khoa', desc: 'Tư vấn trực tiếp với bác sĩ chuyên khoa, phân tích kết quả và lên kế hoạch theo dõi sức khỏe.' },
];

const DOCTORS = [
  { name: 'TS. BS. Nguyễn Văn Minh', specialty: 'Siêu âm Tổng quát & Tim mạch', bio: 'Hơn 15 năm kinh nghiệm tại BV Chợ Rẫy, chuyên gia siêu âm can thiệp tim mạch và tổng quát.', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80', tags: ['Siêu âm 4D', 'Tim mạch'] },
  { name: 'PGS. BS. Trần Thị Lan', specialty: 'Ung bướu & Nội tiết', bio: 'Nguyên trưởng khoa Ung bướu BV Ung Bướu TP.HCM, 20 năm kinh nghiệm tầm soát và điều trị.', img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&q=80', tags: ['Ung bướu', 'Tầm soát sớm'] },
  { name: 'BS. CKI. Lê Hoàng Nam', specialty: 'Sản phụ khoa & Thai sản', bio: 'Chuyên gia siêu âm thai 4D, sàng lọc trước sinh, theo dõi thai kỳ nguy cơ cao tại BV Từ Dũ.', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80', tags: ['Thai 4D', 'Sàng lọc thai'] },
];

const TESTIMONIALS = [
  { name: 'Chị Nguyễn Thị Lan', role: 'Bệnh nhân tầm soát ung thư', initials: 'NL', stars: 5, text: '"Dịch vụ tuyệt vời, bác sĩ tận tình và chuyên nghiệp. Kết quả siêu âm chi tiết, được giải thích cặn kẽ. Tôi rất yên tâm khi khám tại đây."' },
  { name: 'Chị Trần Phương Thảo', role: 'Bệnh nhân siêu âm thai sản', initials: 'PT', stars: 5, text: '"Phòng khám sạch sẽ, hiện đại, không phải chờ lâu. Bác sĩ rất nhiệt tình giải thích kết quả siêu âm thai, tôi hiểu rõ tình trạng sức khỏe của con."' },
  { name: 'Anh Phạm Minh Hoàng', role: 'Bệnh nhân tầm soát định kỳ', initials: 'MH', stars: 4, text: '"Phát hiện sớm khối u nhờ tầm soát định kỳ tại đây. Cảm ơn đội ngũ bác sĩ. Dịch vụ đáng tin cậy, tôi luôn giới thiệu cho người thân."' },
];

const TITLE_SIZE_CLS = {
  '1': 'text-[1.35rem] md:text-[2.4rem] lg:text-[2.8rem]',
  '2': 'text-[1.55rem] md:text-[2.8rem] lg:text-[3.2rem]',
  '3': 'text-[1.75rem] md:text-[3.2rem] lg:text-[3.6rem]',
  '4': 'text-[2rem]    md:text-[3.7rem] lg:text-[4.1rem]',
  '5': 'text-[2.2rem]  md:text-[4.1rem] lg:text-[4.6rem]',
};
const SUBTITLE_SIZE_CLS = {
  '1': 'text-xs md:text-sm',
  '2': 'text-sm md:text-base',
  '3': 'text-[15px] md:text-lg',
  '4': 'text-base md:text-xl',
  '5': 'text-lg md:text-2xl',
};

export default function HeroPage({ settings = {}, services: servicesProp = [], doctors: doctorsProp = [], testimonials: testimonialsProp = [] }) {
  const SERVICES_DATA     = servicesProp.length > 0 ? servicesProp : SERVICES;
  const DOCTORS_DATA      = doctorsProp.length  > 0 ? doctorsProp  : DOCTORS;
  const TESTIMONIALS_DATA = testimonialsProp.length > 0 ? testimonialsProp : TESTIMONIALS;

  const s = settings;
  const siteName      = s.site_name      || 'An Bình';
  const homeTitle     = s.home_title     || 'Chẩn đoán chính xác, Tầm soát sớm vì sức khỏe của bạn';
  const homeSubtitle  = s.home_subtitle  || 'Đội ngũ bác sĩ chuyên khoa, thiết bị siêu âm thế hệ mới, kết quả chính xác — vì sức khỏe của bạn và gia đình.';
  const phone         = s.contact_phone  || '028 1234 5678';
  const address       = s.contact_address || '[Địa chỉ phòng khám], TP. Hồ Chí Minh';
  const email         = s.contact_email  || '[Email liên hệ]';
  const hoursWeekday  = s.contact_hours_weekday || 'Thứ 2 – Thứ 7: 7:00 – 17:00';
  const hoursSunday   = s.contact_hours_sunday  || 'Chủ nhật: 7:00 – 12:00';
  const openTime      = s.contact_open_time     || '07:00';
  const closeTime     = s.contact_close_time    || '17:00';
  const mapsLink      = s.contact_maps_link     || 'https://maps.google.com';
  const mapsEmbed     = s.contact_maps_embed    || '';
  const siteTagline   = s.site_tagline          || 'Phòng Khám Siêu Âm';
  const heroImage     = s.hero_image            || 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=1920&q=85';
  const titleSizeCls    = TITLE_SIZE_CLS[s.home_title_size]    || TITLE_SIZE_CLS['3'];
  const subtitleSizeCls = SUBTITLE_SIZE_CLS[s.home_subtitle_size] || SUBTITLE_SIZE_CLS['3'];

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [contactTab, setContactTab] = useState('map'); // 'map' | 'message'
  const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });
  const [contactState, setContactState] = useState('idle'); // idle | loading | success | error
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef(null);

  // compute open/closed status
  useEffect(() => {
    function check() {
      const now = new Date();
      const hm = now.getHours() * 60 + now.getMinutes();
      const [oh, om] = openTime.split(':').map(Number);
      const [ch, cm] = closeTime.split(':').map(Number);
      const opens = oh * 60 + om;
      const closes = ch * 60 + cm;
      // Sun = 0, check if sunday hours differ; simplify: open Mon-Sun per open/close time
      setIsOpen(hm >= opens && hm < closes);
    }
    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
  }, [openTime, closeTime]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = el.dataset.delay || '0s';
        el.style.animationDelay = delay;
        el.classList.add('anim-in');
        observerRef.current.unobserve(el);
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.will-anim').forEach(el => {
      el.style.opacity = '0';
      observerRef.current.observe(el);
    });

    document.querySelectorAll('.hero-el').forEach((el, i) => {
      el.style.opacity = '0';
      setTimeout(() => { el.style.opacity = ''; el.classList.add('anim-in'); }, 200 + i * 180);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % TESTIMONIALS_DATA.length), 5500);
    return () => clearInterval(t);
  }, []);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .anim-in { animation: fadeInUp 0.8s ease-out forwards; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent', backdropFilter: scrolled ? 'blur(8px)' : 'none', boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.08)' : 'none' }}
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-center justify-between h-[70px] md:h-20">
            <button onClick={() => scrollTo('hero')} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#0D9488' }}>
                <i className="ri-heart-pulse-fill text-white" style={{ fontSize: 17 }}></i>
              </div>
              <div className="leading-tight">
                <span className={`block font-bold text-base ${scrolled ? 'text-teal-600' : 'text-white'} transition-colors duration-300`}>{siteName}</span>
                <span className={`block text-[10px] uppercase tracking-wide ${scrolled ? 'text-gray-400' : 'text-white/65'} transition-colors duration-300`}>{siteTagline}</span>
              </div>
            </button>

            <div className="hidden md:flex items-center gap-7">
              {['services','doctors','testimonials','booking','contact'].map(id => (
                <button key={id} onClick={() => scrollTo(id)}
                  className={`text-[13.5px] font-medium transition-colors duration-200 ${scrolled ? 'text-gray-600 hover:text-teal-600' : 'text-white/85 hover:text-white'}`}>
                  {{ services:'Dịch vụ', doctors:'Đội ngũ', testimonials:'Phản hồi', booking:'Đặt lịch', contact:'Liên hệ' }[id]}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <a href={`tel:${phone.replace(/\s/g,'')}`} className={`flex items-center gap-1.5 text-sm transition-colors ${scrolled ? 'text-gray-500 hover:text-teal-600' : 'text-white/75 hover:text-white'}`}>
                <i className="ri-phone-line"></i>{phone}
              </a>
              <button onClick={() => scrollTo('booking')} className="text-white text-sm font-semibold rounded-full px-5 py-2.5 transition-colors duration-300" style={{ background: '#0D9488' }}>
                Đặt lịch ngay
              </button>
            </div>

            <button onClick={() => setMenuOpen(o => !o)} className="md:hidden p-1">
              <i className={`${menuOpen ? 'ri-close-line' : 'ri-menu-3-line'} text-2xl ${scrolled ? 'text-gray-700' : 'text-white'}`}></i>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg px-5 py-4 space-y-1">
            {['services','doctors','testimonials','booking','contact'].map(id => (
              <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-teal-600 font-medium text-sm">
                {{ services:'Dịch vụ', doctors:'Đội ngũ', testimonials:'Phản hồi', booking:'Đặt lịch', contact:'Liên hệ' }[id]}
              </button>
            ))}
            <button onClick={() => scrollTo('booking')} className="block w-full text-center text-white rounded-full px-5 py-3 text-sm font-semibold mt-2" style={{ background: '#0D9488' }}>
              Đặt lịch ngay
            </button>
          </div>
        )}
      </nav>

      <main>
        {/* ── HERO ── */}
        <section id="hero" className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: '#0a1f1e' }}>
          {/* Background image */}
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-top md:object-center"
            style={{ zIndex: 0 }}
          />
          {/* Gradient — desktop: horizontal; mobile: bottom-up darker */}
          <div className="absolute inset-0 hidden md:block" style={{ background: 'linear-gradient(to right,rgba(0,0,0,.72),rgba(0,0,0,.52),rgba(0,0,0,.28))', zIndex: 1 }} />
          <div className="absolute inset-0 md:hidden" style={{ background: 'linear-gradient(to top,rgba(0,0,0,.90) 0%,rgba(0,0,0,.65) 45%,rgba(0,0,0,.25) 100%)', zIndex: 1 }} />

          <div className="relative flex-1 flex items-end md:items-center pb-2 md:pb-0" style={{ zIndex: 2 }}>
            <div className="max-w-7xl mx-auto px-5 lg:px-8 w-full pt-24 md:pt-28 pb-8 md:pb-10">
              <div className="md:max-w-[600px] hero-el">
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 md:mb-7 border border-white/25" style={{ background: 'rgba(255,255,255,.10)', backdropFilter: 'blur(12px)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                  <span className="text-white/90 text-xs font-medium tracking-widest uppercase">Phòng khám chuyên khoa uy tín</span>
                </div>
                <h1 className={`font-serif ${titleSizeCls} font-bold text-white leading-tight md:leading-[1.18] mb-4 md:mb-6`}>
                  {homeTitle}
                </h1>
                <p className={`text-white/75 ${subtitleSizeCls} leading-relaxed mb-7 md:mb-10 md:max-w-[480px]`}>
                  {homeSubtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => scrollTo('booking')} className="flex items-center justify-center gap-2 text-white font-semibold rounded-full px-8 py-3.5 transition-colors duration-300" style={{ background: '#0D9488' }}>
                    <i className="ri-calendar-check-line"></i> Đặt lịch khám
                  </button>
                  <button onClick={() => scrollTo('services')} className="flex items-center justify-center gap-2 text-white font-semibold rounded-full px-8 py-3.5 transition-all duration-300 border border-white/30 hover:bg-white/20">
                    <i className="ri-stethoscope-line"></i> Xem dịch vụ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="relative border-t border-white/10" style={{ background: 'rgba(0,0,0,.28)', backdropFilter: 'blur(4px)', zIndex: 2 }}>
            <div className="max-w-7xl mx-auto px-5 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4">
                {[['20+','Năm chuyên môn'],['8+','Bác sĩ chuyên khoa'],['30K+','Ca siêu âm / năm'],['98%','Bệnh nhân hài lòng']].map(([val,lab],i) => (
                  <div key={lab} className={[
                    'py-4 md:py-6 px-3 sm:px-5 md:px-8 text-center hero-el',
                    i % 2 === 1 ? 'border-l border-white/15' : '',
                    i >= 2 ? 'border-t border-white/10 md:border-t-0' : '',
                    i === 2 ? 'md:border-l md:border-white/15' : '',
                  ].filter(Boolean).join(' ')}>
                    <div className="text-2xl md:text-3xl font-bold text-white">{val}</div>
                    <div className="text-white/60 text-[10px] md:text-xs mt-0.5 md:mt-1 uppercase tracking-wider leading-snug">{lab}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section id="services" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-5 lg:px-8">
            <div className="text-center mb-16 will-anim">
              <span className="text-xs font-semibold uppercase tracking-[.15em]" style={{ color: '#0D9488' }}>Dịch vụ của chúng tôi</span>
              <h2 className="font-serif text-3xl md:text-[2.4rem] font-bold text-gray-900 mt-3 mb-4">Dịch vụ Siêu âm &amp; Tầm soát Ung bướu</h2>
              <p className="text-gray-500 max-w-xl mx-auto text-[15px] leading-relaxed">Đầy đủ các dịch vụ chẩn đoán hình ảnh và tầm soát ung thư với công nghệ tiên tiến nhất.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {SERVICES_DATA.map((s, i) => (
                <div key={s.name} className="will-anim group bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-lg rounded-2xl p-8 transition-all duration-300 cursor-default" data-delay={`${i * 0.1}s`}>
                  <div className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-teal-600" style={{ background: '#F0FDFA' }}>
                    <i className={`${s.icon} text-[26px] group-hover:text-white transition-colors duration-300`} style={{ color: '#0D9488' }}></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-[17px] mb-3">{s.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DOCTORS ── */}
        <section id="doctors" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-5 lg:px-8">
            <div className="text-center mb-16 will-anim">
              <span className="text-xs font-semibold uppercase tracking-[.15em]" style={{ color: '#0D9488' }}>Đội ngũ bác sĩ</span>
              <h2 className="font-serif text-3xl md:text-[2.4rem] font-bold text-gray-900 mt-3 mb-4">Chuyên gia Siêu âm &amp; Ung bướu</h2>
              <p className="text-gray-500 max-w-xl mx-auto text-[15px]">Đội ngũ bác sĩ được đào tạo chuyên sâu, nhiều năm kinh nghiệm tại các bệnh viện hàng đầu.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {DOCTORS_DATA.map((d, i) => (
                <div key={d.name} className="will-anim bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group" data-delay={`${i * 0.12}s`}>
                  <div className="relative aspect-3/4 overflow-hidden">
                    {d.img ? (
                      <img
                        src={d.img}
                        alt={d.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                        <i className="ri-user-3-line text-5xl"></i>
                      </div>
                    )}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top,rgba(0,0,0,.32),transparent)' }}></div>
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#0D9488' }}>{d.specialty}</p>
                    <h3 className="font-semibold text-gray-900 text-[17px] mb-3">{d.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{d.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {d.tags.map(t => <span key={t} className="text-xs rounded-full px-3 py-1 font-medium" style={{ background: '#F0FDFA', color: '#0D9488' }}>{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimonials" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-5 lg:px-8">
            <div className="text-center mb-14 will-anim">
              <span className="text-xs font-semibold uppercase tracking-[.15em]" style={{ color: '#0D9488' }}>Phản hồi bệnh nhân</span>
              <h2 className="font-serif text-3xl md:text-[2.4rem] font-bold text-gray-900 mt-3 mb-4">Bệnh nhân nói gì về chúng tôi</h2>
            </div>
            <div className="max-w-2xl mx-auto will-anim">
              <div className="bg-gray-50 rounded-2xl p-10 text-center">
                <div className="flex justify-center gap-0.5 mb-5 text-yellow-400 text-lg">
                  {Array.from({ length: TESTIMONIALS_DATA[slide].stars }).map((_, i) => <i key={i} className="ri-star-fill"></i>)}
                </div>
                <p className="text-gray-600 text-[1.05rem] leading-relaxed italic mb-8">{TESTIMONIALS_DATA[slide].text}</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-sm" style={{ background: '#F0FDFA', color: '#0D9488' }}>
                    {TESTIMONIALS_DATA[slide].initials}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 text-sm">{TESTIMONIALS_DATA[slide].name}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{TESTIMONIALS_DATA[slide].role}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-7">
                {TESTIMONIALS_DATA.map((_, i) => (
                  <button key={i} onClick={() => setSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === slide ? 'w-8' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                    style={i === slide ? { background: '#0D9488' } : {}} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── BOOKING ── */}
        <section id="booking" className="py-24" style={{ background: 'linear-gradient(to bottom,#ECFDF5,#ffffff)' }}>
          <div className="max-w-7xl mx-auto px-5 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div className="will-anim">
                <span className="text-xs font-semibold uppercase tracking-[.15em]" style={{ color: '#0D9488' }}>Đặt lịch khám</span>
                <h2 className="font-serif text-3xl md:text-[2.2rem] font-bold text-gray-900 mt-3 mb-4 leading-snug">Đặt lịch nhanh chóng,<br />khám đúng giờ</h2>
                <p className="text-gray-500 leading-relaxed mb-8 text-[15px]">Chúng tôi xác nhận lịch hẹn trong vòng 30 phút. Bệnh nhân được ưu tiên theo giờ hẹn, không phải chờ đợi.</p>
                <ul className="space-y-4 mb-10">
                  {['Xác nhận lịch trong 30 phút','Kết quả trả trong ngày','Tư vấn sau khám miễn phí',`Hỗ trợ đặt lịch qua điện thoại ${phone}`].map(item => (
                    <li key={item} className="flex items-center gap-3 text-gray-600 text-[15px]">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold" style={{ background: '#0D9488' }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#0D9488' }}>
                    <i className="ri-phone-fill text-white text-xl"></i>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Hotline đặt lịch</div>
                    <div className="text-xl font-bold text-gray-900 mt-0.5">{phone}</div>
                  </div>
                </div>
              </div>
              <div className="will-anim bg-white rounded-2xl border border-gray-100 shadow-xl p-8">
                <h3 className="font-semibold text-gray-900 text-xl mb-6">Thông tin đặt lịch</h3>
                <BookingForm services={SERVICES_DATA} />
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-5 lg:px-8">
            <div className="text-center mb-14 will-anim">
              <span className="text-xs font-semibold uppercase tracking-[.15em]" style={{ color: '#0D9488' }}>Thông tin liên hệ</span>
              <h2 className="font-serif text-3xl md:text-[2.4rem] font-bold text-gray-900 mt-3 mb-4">Liên hệ &amp; Tìm kiếm</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 will-anim">
              {/* ── Cột trái ── */}
              <div className="space-y-5">
                {/* Status badge */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 ${isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-400'}`}></span>
                    {isOpen ? 'Đang mở cửa' : 'Đóng cửa'}
                  </span>
                  <span className="text-gray-400 text-xs">{isOpen ? `Đóng cửa lúc ${closeTime}` : `Mở cửa lúc ${openTime}`}</span>
                </div>

                {/* Giờ làm việc */}
                <div className="rounded-2xl p-5" style={{ background: '#F0FDFA' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <i className="ri-time-line text-lg" style={{ color: '#0D9488' }}></i>
                    <span className="font-semibold text-gray-900 text-sm">Giờ làm việc</span>
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    <li className="flex items-center justify-between">
                      <span className="text-gray-500">Thứ 2 – Thứ 7</span>
                      <span className="font-medium text-gray-900">{hoursWeekday.replace(/^.*?:\s*/, '')}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-500">Chủ nhật</span>
                      <span className="font-medium text-gray-900">{hoursSunday.replace(/^.*?:\s*/, '')}</span>
                    </li>
                  </ul>
                </div>

                {/* Contact list */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#F0FDFA' }}>
                      <i className="ri-map-pin-2-line text-sm" style={{ color: '#0D9488' }}></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Địa chỉ</p>
                      <p className="text-sm text-gray-700">{address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#F0FDFA' }}>
                      <i className="ri-phone-line text-sm" style={{ color: '#0D9488' }}></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Điện thoại</p>
                      <a href={`tel:${phone.replace(/\s/g,'')}`} className="text-sm font-semibold" style={{ color: '#0D9488' }}>{phone}</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#F0FDFA' }}>
                      <i className="ri-mail-line text-sm" style={{ color: '#0D9488' }}></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Email</p>
                      <a href={`mailto:${email}`} className="text-sm text-gray-700 hover:text-teal-600 transition-colors">{email}</a>
                    </div>
                  </div>
                </div>

                {/* Directions button */}
                <a href={mapsLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full text-white font-semibold text-sm rounded-full py-3.5 transition-colors"
                  style={{ background: '#0D9488' }}>
                  <i className="ri-map-2-line"></i> Chỉ đường qua Google Maps
                </a>
              </div>

              {/* ── Cột phải ── */}
              <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                {/* Tab switcher */}
                <div className="flex border-b border-gray-100 bg-white">
                  {[['map','ri-map-2-line','Xem bản đồ'],['message','ri-message-3-line','Gửi tin nhắn']].map(([tab, icon, label]) => (
                    <button key={tab} onClick={() => setContactTab(tab)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${contactTab === tab ? 'border-b-2 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                      style={contactTab === tab ? { borderBottomColor: '#0D9488' } : {}}>
                      <i className={icon}></i> {label}
                    </button>
                  ))}
                </div>

                {/* Map tab */}
                {contactTab === 'map' && (
                  <div className="h-[420px]">
                    {mapsEmbed ? (
                      <iframe
                        src={mapsEmbed}
                        width="100%" height="100%"
                        style={{ border: 0, filter: 'saturate(1.1) contrast(0.95)' }}
                        allowFullScreen loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400 p-8">
                        <i className="ri-map-pin-2-line text-4xl"></i>
                        <p className="text-sm text-center">Chưa có bản đồ.<br />Thêm Google Maps embed URL trong <strong>Admin → Cài đặt</strong>.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Message tab */}
                {contactTab === 'message' && (
                  <div className="p-6">
                    {contactState === 'success' ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2" style={{ background: '#F0FDFA' }}>
                          <i className="ri-check-line text-2xl" style={{ color: '#0D9488' }}></i>
                        </div>
                        <p className="font-semibold text-gray-900">Đã gửi thành công!</p>
                        <p className="text-gray-500 text-sm">Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.</p>
                        <button onClick={() => { setContactState('idle'); setContactForm({ name:'',phone:'',message:'' }); }}
                          className="mt-2 text-teal-600 text-sm font-medium hover:underline">Gửi tin khác</button>
                      </div>
                    ) : (
                      <form onSubmit={async e => {
                        e.preventDefault();
                        setContactState('loading');
                        try {
                          const res = await fetch('/api/contact', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(contactForm),
                          });
                          if (res.ok) setContactState('success');
                          else setContactState('error');
                        } catch {
                          setContactState('error');
                        }
                      }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                          <input type="text" required placeholder="Nguyễn Văn A" value={contactForm.name}
                            onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                          <input type="tel" required placeholder="0901 234 567" value={contactForm.phone}
                            onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung</label>
                          <textarea rows={4} placeholder="Nội dung cần liên hệ, câu hỏi hoặc yêu cầu..." value={contactForm.message}
                            onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all resize-none bg-white" />
                        </div>
                        {contactState === 'error' && (
                          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                            Có lỗi xảy ra, vui lòng thử lại.
                          </div>
                        )}
                        <button type="submit" disabled={contactState === 'loading'}
                          className="w-full text-white font-semibold text-sm rounded-full py-3 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                          style={{ background: contactState === 'loading' ? '#9CA3AF' : '#0D9488' }}>
                          {contactState === 'loading'
                            ? <><i className="ri-loader-4-line animate-spin"></i> Đang gửi...</>
                            : <><i className="ri-send-plane-line"></i> Gửi tin nhắn</>}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#115E59' }} className="text-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#0D9488' }}>
                  <i className="ri-heart-pulse-fill text-white" style={{ fontSize: 17 }}></i>
                </div>
                <div><span className="block font-bold text-[17px]">{siteName}</span><span className="block text-[10px] text-white/50 uppercase tracking-wide">{siteTagline}</span></div>
              </div>
              <p className="text-white/55 text-sm leading-relaxed mb-6">Chẩn đoán chính xác, tầm soát sớm — vì sức khỏe của bạn và gia đình.</p>
              <div className="flex gap-2.5">
                {['ri-facebook-fill','ri-youtube-fill','ri-tiktok-fill','ri-instagram-line'].map(ic => (
                  <a key={ic} href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-teal-600" style={{ background: 'rgba(255,255,255,.10)' }}>
                    <i className={`${ic} text-sm`}></i>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[.12em] text-white/60 mb-4">Dịch vụ</h4>
              <ul className="space-y-2.5 text-sm text-white/55">
                {SERVICES_DATA.map(s => <li key={s.name}><button onClick={() => scrollTo('services')} className="hover:text-white transition-colors">{s.name}</button></li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[.12em] text-white/60 mb-4">Thông tin</h4>
              <ul className="space-y-2.5 text-sm text-white/55">
                {['Giới thiệu phòng khám','Đội ngũ bác sĩ','Thiết bị & Công nghệ','Tin tức sức khỏe','Câu hỏi thường gặp'].map(t => (
                  <li key={t}><a href="#" className="hover:text-white transition-colors">{t}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[.12em] text-white/60 mb-4">Liên hệ</h4>
              <ul className="space-y-3 text-sm text-white/55">
                <li className="flex items-start gap-2.5"><i className="ri-map-pin-2-line mt-0.5 shrink-0" style={{ color: '#0D9488' }}></i>{address}</li>
                <li className="flex items-center gap-2.5"><i className="ri-phone-line shrink-0" style={{ color: '#0D9488' }}></i>{phone}</li>
                <li className="flex items-center gap-2.5"><i className="ri-mail-line shrink-0" style={{ color: '#0D9488' }}></i>{email}</li>
                <li className="flex items-start gap-2.5"><i className="ri-time-line mt-0.5 shrink-0" style={{ color: '#0D9488' }}></i><span>{hoursWeekday}<br />{hoursSunday}</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-white/40 text-xs">© {new Date().getFullYear()} Phòng Khám {siteName}. All rights reserved.</p>
            <p className="text-white/30 text-xs">Giấy phép hoạt động: [Số giấy phép] | Bộ Y tế</p>
          </div>
        </div>
      </footer>
    </>
  );
}
