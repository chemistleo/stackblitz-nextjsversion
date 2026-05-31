export const metadata = {
    title: "Vejetaryen Yemek Tarifleri | Menuqo",
    description:
      "Vejetaryen beslenenler için lezzetli ve pratik yemek önerileri.",
  };
  
  export default function VejetaryenYemekTarifleriPage() {
    return (
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        <h1>Vejetaryen Yemek Tarifleri</h1>
        <section
  style={{
    marginTop: "40px",
    padding: "30px",
    backgroundColor: "#F0FDF4",
    borderRadius: "12px",
    textAlign: "center",
  }}
>
  <h2>Haftalık Vejetaryen Menünü Oluştur</h2>

  <p>
    Vejetaryen öğünlerini önceden planlayarak daha dengeli ve çeşitli bir
    beslenme düzeni oluşturabilirsin.
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
    Haftalık Vejetaryen Menünü Oluştur
  </a>
</section>
        <p>
          Vejetaryen beslenme, sebze, bakliyat ve tahılları temel alan dengeli bir
          yaşam tarzıdır. Doğru planlandığında hem sağlıklı hem de doyurucu
          öğünler oluşturmak mümkündür.
        </p>
      </main>
    );
  }