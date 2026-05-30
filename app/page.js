// app/page.js — SERVER COMPONENT
// Bu dosya Google tarafından statik HTML olarak okunur.
// İnteraktif kısımlar MealPlanner.jsx içinde (client component).

import MealPlanner from '@/components/MealPlanner';

// ── Schema.org yapısal verisi ──────────────────────────────────────────────
const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Menuqo - Haftalık Yemek Menüsü Planlayıcı',
  url: 'https://menuqo.com.tr',
  description:
    'Bütçenize ve beslenme tarzınıza göre haftalık yemek menüsü oluşturun. Bugün ne pişirsem, sağlıklı yemek tarifleri, sağlıklı yemek tarifleri. Klasik, sporcu, sağlıklı ve vejetaryen seçenekler. Otomatik alışveriş listesi.',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web',
  inLanguage: 'tr',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
  publisher: { '@type': 'Organization', name: 'Menuqo', url: 'https://menuqo.com.tr' },
  featureList: [
    'Haftalık yemek menüsü oluşturma',
    'Otomatik alışveriş listesi',
    'Bütçeye göre filtreleme',
    'Kalori hedefi belirleme',
    'Klasik, sporcu, sağlıklı ve vejetaryen menü seçenekleri',
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Haftalık yemek menüsü nasıl oluşturulur?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Menuqo'da kişi sayısını, beslenme tarzını ve bütçe segmentini seçin. 'Haftalık Planımı Oluştur' butonuna tıklayın; 7 günlük menünüz ve alışveriş listesi otomatik hazırlanır.",
      },
    },
    {
      '@type': 'Question',
      name: 'Menuqo ücretsiz mi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Evet, Menuqo tamamen ücretsizdir. Kayıt gerektirmeden haftalık yemek menüsü ve alışveriş listesi oluşturabilirsiniz. Bugün ne pişirsem diye sormanıza gerek yok. Yapay zeka asistanımız sizin için kriterlerinize göre otomatik olarak haftalık yemek listesi oluşturuyoz.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kalori hesabı yapıyor mu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Evet. Günlük kalori hedefinizi girerek her öğüne düşen kalori miktarını otomatik olarak hesaplayabilirsiniz. Böylelikle ne kadar kalori harcadığınızı sistem üzerinden takip edebilirsiniz.',
      },
    },
    {
      '@type': 'Question',
      name: 'Vejetaryen menü seçeneği var mı?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Evet. Menuqo'da klasik, sporcu, sağlıklı ve vejetaryen beslenme tarzlarına uygun haftalık menüler oluşturabilirsiniz.Üstelik bütçenize göre menü hazırlıyoruz.Dolabınızda bulunmayan ürünler için de size alışveriş listesi çıkartıyoruz.",
      },
    },
  ],
};

// ── Sayfa ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      {/* JSON-LD — Google Rich Results için */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Ekranda görünmeyen ama Google'ın okuduğu statik metin */}
      <div className="sr-only" aria-hidden="true">
        <h1>Haftalık Yemek Menüsü Planlayıcı</h1>
        <p>
          Menuqo ile kişi sayısına, bütçenize ve beslenme tarzınıza uygun haftalık yemek menüsü
          oluşturun. Klasik, sporcu, sağlıklı ve vejetaryen seçenekler. Bugün ne pişirsem diye düşünme. Sağlıklı yemekler, sporcu yemek tarifleri. 7 günlük yemek planınız
          hazırlandığında otomatik alışveriş listesi de oluşturulur.
        </p>
      </div>

      {/* İnteraktif uygulama — client component */}
      <MealPlanner />
    </>
  );
}
