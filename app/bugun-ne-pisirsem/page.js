export const metadata = {
    title: "Bugün Ne Pişirsem? Yemek Önerileri ve Menü Fikirleri | Menuqo",
    description:
      "Bugün ne pişirsem diye düşünüyorsanız, kahvaltıdan akşam yemeğine kadar pratik ve lezzetli yemek önerilerini keşfedin.",
  };
  
export default function BugunNePisirsemPage() {
    return (
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        <h1>Bugün Ne Pişirsem?</h1>
  
        <p>
          Her gün aynı soru: Bugün ne pişirsem? Eğer siz de akşam yemeği için
          fikir arıyorsanız doğru yerdesiniz. Menuqo, bütçenize ve tercihlerinize
          göre haftalık yemek planı oluşturmanıza yardımcı olur.
        </p>
  
        <h2>Akşam Yemeği İçin Öneriler</h2>
  
        <ul>
          <li>Tavuklu Salata</li>
          <li>Mercimek Çorbası</li>
          <li>Sebzeli Omlet</li>
          <li>Kuru Fasulye</li>
          <li>Izgara Tavuk</li>
        </ul>
  
        <h2>Sağlıklı Yemek Seçenekleri</h2>
  
        <p>
          Dengeli beslenmek isteyenler için protein, sebze ve tam tahıllardan
          oluşan öğünler uzun süre tok kalmanıza yardımcı olabilir.
        </p>
  
        <h2>Haftalık Menü Planlamanın Avantajları</h2>
  
        <p>
          Haftalık planlama yapmak hem zamandan hem de bütçeden tasarruf
          etmenizi sağlar. Ayrıca ne pişireceğinizi düşünmek için harcadığınız
          zamanı azaltır.
        </p>
      </main>
    );
  }