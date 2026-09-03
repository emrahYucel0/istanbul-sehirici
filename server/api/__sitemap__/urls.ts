import { defineSitemapEventHandler } from '#imports';

// posts ve regions fetch'leri birbirinden bağımsız try/catch'lere sahip:
// önceden tek bir try/catch ikisini de sarıyordu, yani regions çekimi
// başarısız olduğunda (geçici bir hata bile olsa) başarıyla çekilmiş
// posts verisi de sessizce sitemap'ten düşüyordu. Artık bir kaynağın
// hatası diğerini etkilemiyor.
async function fetchPostUrls() {
  try {
    const postsResponse = await $fetch('/api/posts');
    return postsResponse.success
      ? postsResponse.data.map((p: any) => ({ url: `/${p.slug}`, lastmod: p.createdAt }))
      : [];
  } catch (error) {
    console.error('Sitemap: posts verisi çekilirken hata oluştu:', error);
    return [];
  }
}

// `/istanbul` SİTEMAP'TEN ÇIKARILDI.
// Sitenin İstanbul otorite sayfası artık ana sayfanın kendisi; `/istanbul`
// kalıcı olarak `/` adresine yönlendiriliyor (nuxt.config.ts → routeRules).
// Yönlendirilen bir adresi sitemap'te bildirmek Search Console'da
// "Sitemap'te yönlendirme var" uyarısı üretir.
const YONLENDIRILEN = new Set(['istanbul']);

async function fetchRegionUrls() {
  try {
    const regionsResponse = await $fetch('/api/regions');
    return regionsResponse.success
      ? regionsResponse.data
          .filter((r: any) => !YONLENDIRILEN.has(r.slug))
          .map((r: any) => ({ url: `/${r.slug}`, lastmod: r.createdAt }))
      : [];
  } catch (error) {
    console.error('Sitemap: regions verisi çekilirken hata oluştu:', error);
    return [];
  }
}

// Hizmetler tek bir bölüm kaydında toplu geliyor. Yalnızca `slug` verilmiş
// olanların kendi sayfası var; slug'sız hizmetler yalnızca kart olarak
// görünüyor ve sitemap'e girmemeli (var olmayan adres bildirmek Search
// Console'da hataya yol açar).
async function fetchServiceUrls() {
  try {
    const response = await $fetch('/api/services');
    const services = response?.data?.services || [];
    return services
      .filter((s: any) => s.slug)
      .map((s: any) => ({ url: `/${s.slug}` }));
  } catch (error) {
    console.error('Sitemap: hizmet verisi çekilirken hata oluştu:', error);
    return [];
  }
}

// MAHALLELER — YALNIZ YAYINDA OLANLAR.
//
// 473 mahalle rotasının hepsi çözülüyor ama çoğu henüz içeriksiz kabuk ve
// `noindex` taşıyor. Sitemap'e yalnız yayın kapısından geçmiş (isActive)
// kayıtlar giriyor: `noindex` bir sayfayı sitemap'te bildirmek Search
// Console'da "Submitted URL marked noindex" uyarısı üretir.
async function fetchNeighborhoodUrls() {
  try {
    const response = await $fetch('/api/mahalleler?aktif=true');
    return response?.success
      ? response.data.map((m: any) => ({ url: `/${m.canonicalPath}`, lastmod: m.updatedAt }))
      : [];
  } catch (error) {
    console.error('Sitemap: mahalle verisi çekilirken hata oluştu:', error);
    return [];
  }
}

export default defineSitemapEventHandler(async (event) => {
  /*
   * COĞRAFİ AĞ KAPALIYKEN BÖLGE VE MAHALLE SİTEMAP'E GİRMİYOR.
   *
   * Yarışma sürümünde o rotalar 404 dönüyor (bkz.
   * app/composables/useRegionPages.ts). 404 veren bir adresi sitemap'te
   * bildirmek Search Console'da doğrudan hata üretir; iki karar birlikte
   * verilmek zorunda.
   *
   * İstekleri de HİÇ ATMIYORUZ: kapalıyken `/api/regions` ve
   * `/api/mahalleler` çağrıları yapılmıyor, sonuç boş dizi.
   *
   * Bayrak açıldığında eski davranış aynen dönüyor — aşağıdaki iki
   * getirici hiç değişmedi.
   */
  const bolgeAgiAcik = Boolean(useRuntimeConfig(event).public.publicRegionPages);

  const [posts, regions, services, neighborhoods] = await Promise.all([
    fetchPostUrls(),
    bolgeAgiAcik ? fetchRegionUrls() : Promise.resolve([]),
    fetchServiceUrls(),
    bolgeAgiAcik ? fetchNeighborhoodUrls() : Promise.resolve([]),
  ]);
  return [...posts, ...regions, ...services, ...neighborhoods];
});