export default function sitemap() {
    return [
      {
        url: 'https://menuqo.com.tr',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: 'https://menuqo.com.tr/bugun-ne-pisirsem',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: 'https://menuqo.com.tr/saglikli-yemek-tarifleri',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: 'https://menuqo.com.tr/vejetaryen-yemek-tarifleri',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ];
  }