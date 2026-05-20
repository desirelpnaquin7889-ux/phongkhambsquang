import "./globals.css";

export const metadata = {
  title: "Phòng Khám Siêu Âm & Tầm Soát Ung Bướu An Bình",
  description: "Chẩn đoán chính xác, tầm soát sớm vì sức khỏe của bạn và gia đình.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.5.0/remixicon.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
