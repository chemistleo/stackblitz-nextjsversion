export const metadata = {
  title: "Sağlıklı Yemek Tarifleri | Menuqo",
  description:
    "Sağlıklı yemek önerileri ve dengeli beslenme için pratik tarif fikirlerini keşfedin.",
};

export default function SaglikliYemekTarifleriPage() {
  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <h1>Sağlıklı Yemek Tarifleri</h1>

      <p>
        Sağlıklı beslenmek isteyenler için dengeli ve besleyici yemekler günlük
        yaşam kalitesini artırabilir. Protein, sebze ve tam tahıllardan oluşan
        öğünler hem daha uzun süre tok kalmanıza yardımcı olur hem de enerji
        seviyenizi destekler.
      </p>

      <h2>Sağlıklı Beslenmenin Önemi</h2>

      <p>
        Düzenli ve dengeli beslenme, vücudun ihtiyaç duyduğu besin öğelerini
        almasını sağlar. Sağlıklı yemek seçimleri uzun vadede yaşam kalitesine
        katkıda bulunabilir.
      </p>

      <h2>Örnek Sağlıklı Yemekler</h2>

      <ul>
        <li>Izgara Tavuk ve Salata</li>
        <li>Mercimek Çorbası</li>
        <li>Sebzeli Omlet</li>
        <li>Yoğurtlu Kinoa Salatası</li>
        <li>Fırında Sebze</li>
      </ul>

      <section
        style={{
          marginTop: "40px",
          padding: "30px",
          backgroundColor: "#F0FDF4",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <h2>Haftalık Sağlıklı Yemek Menünü Oluştur</h2>

        <p>
          Sağlıklı beslenmeyi kolaylaştırmak için haftalık yemek planını
          önceden oluşturabilir ve her gün ne yiyeceğini düşünmek zorunda
          kalmazsın.
        </p>

        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: "15px",
            padding: "12px 24px",
            backgroundColor: "#16A34A",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          Haftalık Sağlıklı Yemek Menünü Oluştur
        </a>
      </section>
    </main>
  );
} 