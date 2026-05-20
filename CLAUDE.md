# Phòng Khám — Project Instructions

## Mục tiêu
Website giới thiệu dịch vụ phòng khám tư nhân. Chuyên khoa: Siêu âm & Tầm soát Ung bướu.
Mục đích: tạo niềm tin với bệnh nhân, giới thiệu dịch vụ, đội ngũ bác sĩ, và call-to-action đặt lịch.

Thiết kế theo mẫu: https://readdy.cc/preview/e7b44f6a-327f-49f7-8ecb-ad4576666feb/9334374/

---

## Tech Stack
- **Framework**: Next.js (App Router) · JavaScript/JSX
- **Styling**: Tailwind CSS v3
- **Icons**: Remix Icon 4.5.0 (cdnjs) + Font Awesome 6.4.0 (cdnjs)
- **Package manager**: `npm`
- **Deployment**: Vercel
- **Dev command**: `npm run dev`

---

## Design System

### Màu sắc
```
/* Custom tokens — khai báo trong tailwind.config.js */
medical:       #0D9488   /* teal-600 — màu chủ đạo */
medical-dark:  #115E59   /* teal-900 — hover, footer bg */
medical-light: #F0FDFA   /* teal-50  — light background */
primary-50:    #ECFDF5   /* emerald-50 — booking section bg */
primary-100:   #D1FAE5

/* Tailwind defaults dùng trong project */
gray-50:  #F9FAFB   /* section bg xen kẽ */
gray-100: #F3F4F6
gray-200: #E5E7EB   /* border default */
gray-700: #374151   /* body text */
gray-900: #111827   /* heading text */
white:    #FFFFFF
```

### Typography
```
Font chính:   'Inter' (weights: 300, 400, 500, 600, 700)
Font heading: 'Playfair Display' (weights: 400–700) — dùng cho section title
Icons:        Remix Icon (ri-*) cho UI · Font Awesome (fa-*) bổ sung
```

### Tailwind config mở rộng
```js
// tailwind.config.js
extend: {
  colors: {
    medical: '#0D9488',
    'medical-dark': '#115E59',
    'medical-light': '#F0FDFA',
    'primary-50': '#ECFDF5',
    'primary-100': '#D1FAE5',
  },
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
    serif: ['Playfair Display', 'serif'],
  },
}
```

---

## Animations & Transitions

### Keyframes (khai báo trong CSS global)
```css
@keyframes fadeInUp {
  0%   { opacity: 0; transform: translateY(24px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}
```

### Animation classes
```css
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}
```

### Scroll-triggered (IntersectionObserver)
- Mỗi section có class marker: `.hero-animate`, `.service-animate`, `.doctor-animate`, `.testimonial-animate`, `.booking-animate`, `.contact-animate`
- Ban đầu: `opacity-0` (ẩn)
- Khi phần tử vào viewport: thêm class `animate-fade-in-up`
- Stagger delay cho cards:
  - Service cards: `animationDelay = index * 0.1s`
  - Doctor cards: `animationDelay = index * 0.12s`

### Transitions
```
Mặc định: transition-colors duration-300 (hover elements)
Cards:     transition-all duration-300
Image zoom: group-hover:scale-105 duration-500
Easing:    cubic-bezier(0.4, 0, 0.2, 1)
```

---

## Component Patterns

### Navbar
- Desktop: transparent → `bg-white/95 backdrop-blur-sm shadow-sm` khi scroll xuống
- Mobile: hamburger menu, slide-down
- Nav links: `text-gray-700 hover:text-medical transition-colors`
- CTA button: `bg-medical hover:bg-medical-dark text-white rounded-full`

### Buttons
```
Primary:      bg-medical hover:bg-medical-dark text-white rounded-full px-8 py-3.5
Outline dark: border border-white/40 hover:border-white text-white rounded-full (trên hero)
Ghost dark:   bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/30 text-white rounded-full
Outline light: bg-white border-gray-200 text-gray-700 hover:border-medical hover:text-medical rounded-full
```

### Service Cards
```
bg-gray-50 hover:bg-white
rounded-2xl
border border-transparent hover:border-gray-100
hover:shadow-lg
transition-all duration-300
animate-fade-in-up (scroll trigger, stagger 0.1s)
```

### Doctor Cards
```
bg-white rounded-2xl border border-gray-100
hover:shadow-xl transition-all duration-300
Image: group-hover:scale-105 duration-500
Hover overlay: linear-gradient(to top, black/30, transparent)
animate-fade-in-up (scroll trigger, stagger 0.12s)
```

### Form Inputs
```
border border-gray-200 rounded-xl
focus:border-medical focus:ring-2 focus:ring-medical/20
```

### Testimonial Slider
- Dots: active = `w-8 bg-medical rounded-full`, inactive = `w-2 bg-gray-300 hover:bg-gray-400`

---

## Gradients

| Vị trí | Gradient |
|---|---|
| Hero overlay | `linear-gradient(to right, black/70, black/50, black/40)` |
| Doctor card hover | `linear-gradient(to top, black/30, transparent)` |
| Booking section bg | `bg-gradient-to-b from-primary-50 to-white` |

---

## Cấu trúc Trang

| Section | ID | Background |
|---|---|---|
| Navbar | — | transparent → `bg-white/95` on scroll |
| Hero | `#hero` | full-screen ảnh + gradient overlay |
| Dịch vụ | `#services` | `bg-white` |
| Bác sĩ | `#doctors` | `bg-gray-50` |
| Phản hồi | `#testimonials` | `bg-white` |
| Đặt lịch | `#booking` | `bg-gradient-to-b from-primary-50 to-white` |
| Liên hệ | `#contact` | `bg-white` |
| Footer | — | `bg-medical-dark text-white` |

### Hero section
- Full-screen (`min-h-screen`)
- Background ảnh phòng khám + `linear-gradient(to right, black/70 → black/40)`
- Nội dung căn trái trong container max-w-7xl:
  - Badge nhỏ uppercase (`backdrop-blur-md bg-white/10 border-white/30`)
  - H1: Playfair Display, text-white, font-bold
  - Subtext: text-white/80
  - 2 CTA: Primary button + Ghost button
- Stats bar (4 chỉ số): nằm trong hero, bottom area

### Footer
- Background: `bg-medical-dark` (`#115E59`)
- 4 cột: Logo + tagline | Dịch vụ | Thông tin | Liên hệ + giờ làm
- Social icons: hover `text-medical`

---

## Box Shadows
```
shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05)
shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1)
shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1)
Cards: shadow-none → shadow-lg/xl on hover
```

---

## Border Radius
```
Buttons:  rounded-full
Cards:    rounded-2xl (1rem)
Inputs:   rounded-xl (0.75rem)
Badges:   rounded-full
```

---

## Nội dung Mặc định (cần xác nhận với user)

| Field | Placeholder |
|---|---|
| Tên phòng khám | [Chưa xác định] |
| Địa chỉ | [Chưa xác định] |
| Điện thoại | [Chưa xác định] |
| Email | [Chưa xác định] |
| Giờ làm việc | T2–T7: 7:00–17:00 |
| Stats | [Số liệu thực của phòng khám] |

---

## Quy tắc code

- Không hardcode màu hex — dùng Tailwind token (`text-medical`, `bg-medical-dark`)
- Semantic HTML: `<nav>`, `<main>`, `<section id="...">`, `<footer>`
- `alt` text đầy đủ cho mọi ảnh
- Dùng `next/image` cho tất cả ảnh (lazy load)
- IntersectionObserver cho scroll animation — không dùng thư viện animation ngoài
- Mobile-first — breakpoints: `md` (768px), `lg` (1024px)

## Không làm
- Không dùng Framer Motion / GSAP / AOS — chỉ CSS animation + IntersectionObserver thuần
- Không dùng component library (MUI, Chakra, shadcn)
- Không tạo trang login/auth — website tĩnh giới thiệu dịch vụ
- Không thêm CMS trừ khi được yêu cầu rõ ràng

## Confirm trước khi làm
- Đổi tên thương hiệu / màu primary
- Thêm trang mới ngoài single-page structure
- Tích hợp booking system bên thứ 3
- Deploy production
