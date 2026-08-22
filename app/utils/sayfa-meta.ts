// app/utils/sayfa-meta.ts
//
// SABİT SAYFALARIN SEO KÜTÜĞÜ — tek kaynak.
//
// NEDEN VAR
// Başlık ve açıklama varsayılanları her sayfanın kendi dosyasında gömülüydü.
// İki sonucu vardı:
//
//   1. Admin panelindeki sayfa listesi elle yazılmıştı ve YALNIZCA 5 anahtar
//      içeriyordu (home, about, region, blog, contact). Hizmetlerimiz
//      (`services`) ve Fiyat Hesaplama (`fiyat-hesaplama`) sayfaları
//      `usePageSeo` çağırdıkları hâlde panelde seçilemiyordu — yani başlıkları
//      ve açıklamaları pratikte sabitti, panelden değiştirilemiyordu.
//   2. Üç politika sayfasının (gizlilik, kullanım şartları, çerez) hiç SEO
//      çağrısı yoktu: ne başlık, ne açıklama, ne canonical üretiyorlardı.
//
// Liste artık burada. Panel dropdown'ını buradan kuruyor, sayfalar
// varsayılanlarını buradan alıyor; ikisi ayrışamaz.
//
// ÖNCELİK SIRASI (usePageSeo içinde uygulanıyor)
//   panelden girilen Meta kaydı  >  buradaki varsayılan  >  Site Ayarları
//
// Buradaki metinler SİLİNMEZ: panelde bir sayfanın kaydı yoksa ya da admin
// alanı boşaltırsa siteye bunlar çıkar. Yani "boş meta" durumu hiç oluşmaz.
//
// MARKA ADI ELLE YAZILMAZ
// Buradaki metinlerde marka adı geçecekse `{marka}` yazılır; gerçek değer
// istek anında Site Ayarları'ndan konur (bkz. composables/usePageSeo.ts).
// Elle yazılırsa panelden ad değiştiğinde o sayfa eski adda kalır.

export interface SayfaMeta {
  /** Meta tablosundaki `page` sütununa yazılan anahtar. DEĞİŞTİRİLMEMELİ —
   *  değişirse o sayfanın panelde girilmiş kaydı kopar. */
  anahtar: string
  /** Panelde görünen Türkçe ad. Admin ham anahtar görmemeli. */
  etiket: string
  /** Sitedeki yolu — panelde "hangi sayfa bu?" sorusunu cevaplıyor. */
  yol: string
  title: string
  description: string
}

export const SAYFA_METALARI: SayfaMeta[] = [
  {
    anahtar: 'home',
    etiket: 'Ana Sayfa',
    yol: '/',
    // Marka adı BİLİNÇLİ OLARAK yok. Önceki başlık markayla başlıyordu
    // ("EveNakliyatEvden | …") ve arama hacmi sıfır olan bir ifade,
    // başlığın en değerli ilk 16 karakterini harcıyordu. İç sayfalarda
    // zaten doğru yapılıyor: anahtar kelime başta, marka sonda.
    //
    // "Ucuz" da çıkarıldı: sitenin tüm konumlandırması (yazılı sabit fiyat,
    // sigortalı taşıma, marangozlu söküm-montaj) bunun zıddı. Fiyat avcısı
    // çeken, dönüşmeyen bir kelimeydi.
    //
    // "İstanbul" eklendi: işletme adresi Pendik/İstanbul ve yerel sinyal
    // ana sayfada karşılık buluyor. 80 il sayfası zaten kendi illerini
    // hedefliyor, ana sayfanın onlarla yarışmasına gerek yok.
    title: 'Evden Eve Nakliyat İstanbul | Sigortalı Taşıma, Yazılı Fiyat',
    // AÇIKLAMA YENİLENDİ (ana sayfa yeni tasarıma geçtikten sonra):
    //   · "Ücretsiz keşif" ÇIKARILDI — doğrulanmış bir iş kuralı değil ve
    //     sayfadaki hiçbir bölüm bunu söylemiyor.
    //   · "İstanbul" ve "39 ilçe" eklendi: sayfanın Kapsam bölümünün
    //     gerçekten söylediği şey bu.
    //   · Sayılan hizmetler ana sayfadaki Hizmetler defteriyle eşleşiyor;
    //     depolama gibi burada sunulmayan bir şey yazmıyor.
    description:
      "İstanbul'un 39 ilçesinde evden eve nakliyat. Erişim ve kat durumu keşifte yerinde ölçülür, fiyat yazılı verilir. Ambalajlama, marangozlu söküm ve kurulum dahil.",
  },
  {
    anahtar: 'about',
    etiket: 'Hakkımızda',
    yol: '/hakkimizda',
    // `{marka}`: canlı marka adı istek anında yerleştiriliyor
    // (bkz. composables/usePageSeo.ts). Elle yazılmıyor — panelden ad
    // değişince bu sayfa eski adda kalırdı.
    title: 'Hakkımızda | {marka}',
    // ESKİ METİN: "… Ücretsiz keşif, yazılı sabit fiyat ve sigortalı
    // taşımacılık anlayışımız." Üç iddia da doğrulanmamıştı. Bu satır
    // yalnız panelde Meta kaydı YOKKEN basılıyor — yani sessiz bir yedek.
    // Sessiz olması, iddia taramasından kaçması anlamına gelmemeli.
    description:
      "İstanbul'da evden eve, ofis ve parça eşya taşıması. Nasıl çalıştığımız, keşifte neyi ölçtüğümüz ve kapsamı nasıl belirlediğimiz.",
  },
  {
    anahtar: 'services',
    etiket: 'Hizmetlerimiz',
    yol: '/hizmetlerimiz',
    // 69 KARAKTERDİ — canlıda ölçüldü, Google sonuçlarında kesiliyordu.
    // Sınır yaklaşık 60 karakter (aslında ~580 piksel genişlik). "Hizmetlerimiz"
    // yerine "Hizmetleri" ve listeden "Parça Eşya" çıkarılarak 59'a indirildi;
    // asıl anahtar kelime "evden eve nakliyat" başta korundu.
    title: 'Evden Eve Nakliyat Hizmetleri | Asansörlü, Ofis, Parça Eşya',
    // "Ücretsiz keşif." ÇIKARILDI — doğrulanmış bir iş kuralı değil ve
    // sayfadaki hiçbir bölüm bunu söylemiyor.
    //
    // Bu satır BUGÜN EKRANA ÇIKMIYOR: panelde `Meta(services)` kaydı var ve
    // öncelik sırası onu kullanıyor. Ama kayıt silinir ya da alan boşaltılırsa
    // yedek devreye girer ve iddia doğrudan arama sonucuna döner. Görünmeyen
    // metin, iddia taramasından muaf değil.
    description:
      "İstanbul'da evden eve, asansörlü, parça eşya, ofis taşıma, depolama, paketleme ve şehirler arası nakliyat. Her hizmetin kapsamı ve planı ayrı ayrı.",
  },
  {
    anahtar: 'region',
    etiket: 'Bölgelerimiz',
    yol: '/bolgelerimiz',
    // DEVİR: eski başlık/açıklama sayfayı Türkiye dizini olarak tanıtıyordu
    // ("Türkiye genelindeki illerde") ve doğrulanmamış bir iddia taşıyordu
    // ("Ücretsiz keşif"). Sayfa artık İstanbul coğrafi hub'ı; meta da öyle.
    title: 'İstanbul Nakliyat Bölgeleri | 39 İlçe ve Mahalleleri',
    description:
      "İstanbul'da hizmet verdiğimiz 39 ilçe ve ilçelerin mahalleleri. Taşıma planı ilçeye, sokağa ve bina erişimine göre değişiyor.",
  },
  {
    anahtar: 'blog',
    etiket: 'Blog',
    yol: '/blog',
    title: 'Blog | Nakliyat Rehberi ve Taşınma İpuçları',
    // AÇIKLAMA KAYITLI YAZILARA GÖRE DÜZELTİLDİ. Eski metin "asansörlü
    // nakliyat ve depolama" vaat ediyordu; on yazının hiçbiri bu iki konuda
    // değil. Aşağıdakiler gerçekten var: fiyatın neye göre belirlendiği,
    // hazırlık planı, paketleme, sigorta kapsamı, taşınma günü.
    description:
      'Taşınma hazırlığı, paketleme, fiyatı neyin belirlediği, sigortanın kapsamı ve taşınma günü üzerine sahadan çıkmış rehberler.',
  },
  {
    anahtar: 'contact',
    etiket: 'İletişim',
    yol: '/iletisim',
    // ESKİ BAŞLIK: "İletişim | Ücretsiz Keşif ve Teklif" — iddia doğrudan
    // arama sonucunda görünüyordu. ESKİ AÇIKLAMA: "… ücretsiz keşif talebi.
    // … yazılı ve sabit fiyat teklifimizi sunalım." Panelde `Meta(contact)`
    // kaydı YOK, yani bu satırlar sessiz bir yedek değil — sayfanın
    // gerçekten bastığı metinlerdi.
    title: 'İletişim | {marka}',
    description:
      "İstanbul'da evden eve, ofis ve parça eşya taşıması. Telefon, WhatsApp ve e-posta ile ulaşın ya da taşınmanızı formda anlatın.",
  },
  {
    anahtar: 'fiyat-hesaplama',
    etiket: 'Fiyat Hesaplama',
    yol: '/fiyat-hesaplama',
    // ESKİ AÇIKLAMA: "… Kesin fiyat ücretsiz keşiften sonra netleşir."
    // İki iddia da doğrulanmamıştı ve panelde `Meta(fiyat-hesaplama)` kaydı
    // olmadığı için bu satırlar sessiz bir yedek değil, sayfanın gerçekten
    // bastığı metinlerdi.
    title: 'Nakliyat Fiyat Hesaplama | {marka}',
    description:
      'Ev büyüklüğü, mesafe, kat ve asansör durumuna göre tahmini bir aralık görün. Adres koşulları hesaba girmiyor; onlar keşifte ölçülüyor.',
  },
  {
    anahtar: 'gizlilik-politikasi',
    etiket: 'Gizlilik Politikası',
    yol: '/gizlilik-politikasi',
    title: 'Gizlilik Politikası | Kişisel Verilerin Korunması',
    description:
      'Nakliyat hizmetlerimiz kapsamında topladığımız kişisel verilerin hangi amaçla işlendiği, ne kadar süre saklandığı ve KVKK kapsamındaki haklarınız.',
  },
  {
    anahtar: 'kullanim-sartlari',
    etiket: 'Kullanım Şartları',
    yol: '/kullanim-sartlari',
    title: 'Kullanım Şartları | Hizmet ve Teklif Koşulları',
    description:
      'Sitemizin kullanımına, teklif ve rezervasyon sürecine, taşıma sırasındaki sorumluluklara, iptal ve uyuşmazlık koşullarına ilişkin esaslar.',
  },
  {
    anahtar: 'cerez-politikasi',
    etiket: 'Çerez Politikası',
    yol: '/cerez-politikasi',
    title: 'Çerez Politikası | Sitemizde Kullanılan Çerezler',
    description:
      'Sitemizde hangi çerezlerin kullanıldığı, ne amaçla tutuldukları, ne kadar süre saklandıkları ve tarayıcınızdan nasıl kapatabileceğiniz.',
  },
]

/**
 * Anahtara göre varsayılanı verir.
 *
 * Bilinmeyen anahtarda HATA FIRLATIR, sessizce boş dönmez: bir sayfa
 * kütüğe eklenmeden `usePageSeo` çağırırsa bu, o sayfanın başlıksız
 * yayına çıkması demek olurdu. Geliştirme sırasında patlaması daha iyi.
 */
export const sayfaMetasi = (anahtar: string): SayfaMeta => {
  const kayit = SAYFA_METALARI.find((s) => s.anahtar === anahtar)
  if (!kayit) {
    throw new Error(
      `sayfa-meta: "${anahtar}" anahtarı kütükte yok. app/utils/sayfa-meta.ts içine ekleyin.`
    )
  }
  return kayit
}
