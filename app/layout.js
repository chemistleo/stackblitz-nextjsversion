import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Haftalık Yemek Menüsü Planlayıcı & Akıllı Alışveriş Listesi | Menuqo',
  description: 'Haftalık yemek menüsü oluşturun, otomatik alışveriş listesi çıkarın. Klasik, sporcu, sağlıklı ve vejetaryen seçenekler. Bütçenize göre kişiselleştirilmiş 7 günlük menü — ücretsiz.',
  keywords: 'haftalık yemek menüsü, yemek planı, haftalık menü planlayıcı, alışveriş listesi, diyet menüsü, sporcu menüsü, vejetaryen menü, ekonomik yemek listesi, 7 günlük yemek planı, sağlıklı beslenme planı',
  metadataBase: new URL('https://menuqo.com.tr'),
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: 'https://menuqo.com.tr',
    siteName: 'Menuqo',
    locale: 'tr_TR',
    title: 'Haftalık Yemek Menüsü Planlayıcı | Menuqo',
    description: 'Bütçenize ve beslenme tarzınıza göre 7 günlük yemek menüsü oluşturun, alışveriş listesini otomatik çıkarın.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Menuqo - Haftalık Yemek Menüsü Planlayıcı' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Haftalık Yemek Menüsü Planlayıcı | Menuqo',
    description: '7 günlük yemek planı + otomatik alışveriş listesi.',
    images: ['/og-image.png'],
  },
  verification: { google: 'x7YNFr7pTpUBE50p7iueAcfSFceZurZTbWCZmo8n8iA' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://dhfozktljvsvwphburez.supabase.co" />
        <link rel="dns-prefetch" href="https://dhfozktljvsvwphburez.supabase.co" />
        <meta name="theme-color" content="#059669" />
      </head>
      <body className="bg-gray-50 text-gray-800 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
