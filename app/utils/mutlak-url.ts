// app/utils/mutlak-url.ts
//
// PAYLAŞIM GÖRSELİNİ MUTLAK ADRESE ÇEVİRİR.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN GEREKLİ
//
// `og:image` ve `twitter:image` GÖRELİ YOL KABUL ETMİYOR. Facebook,
// WhatsApp, LinkedIn ve X etiketi okurken sayfanın adresini bilmiyor;
// `/yuklemeler/foto.webp` gördüklerinde onu çözemiyor ve önizleme
// görselsiz çıkıyor.
//
// Ölçüldü (M8): 76 sayfanın 66'sında `og:image` göreli, 10 mahalle
// sayfasında hiç yoktu. Yani sitenin hiçbir sayfası paylaşıldığında
// görsel çıkmıyordu.
//
// `og:url` ve `canonical` zaten mutlaktı — çünkü onlar `siteUrl` ile
// birleştiriliyordu. Görsel o adımdan geçmiyordu; tek eksik buydu.
//
// ─────────────────────────────────────────────────────────────────────────
// SORUMLULUK SINIRI
//
// Bu SAF bir dize işlemi. Meta etiketi yazmıyor, ayar okumuyor, ağa
// çıkmıyor. SEO sahipliği değişmiyor: `usePageSeo` ve `[...slug].vue`
// etiketleri eskisi gibi kendileri basıyor, yalnız görsel değerini
// buradan geçiriyorlar.
//
// ─────────────────────────────────────────────────────────────────────────
// DOKUNULMAYANLAR
//
// Zaten mutlak olan adres (`https://…`), protokolsüz adres (`//cdn/…`) ve
// gömülü veri (`data:image/…`) OLDUĞU GİBİ dönüyor. Aksi hâlde
// `https://site.com/https://cdn/...` gibi bozuk adresler üretirdik ve
// bugün ayarlarda tam adres yazan bir kurulum bozulurdu.

/** Adres zaten kendi başına çözülebiliyor mu? */
const kendiBasinaCozulur = (deger: string): boolean =>
  /^[a-z][a-z0-9+.-]*:/i.test(deger) || deger.startsWith('//')

/**
 * Göreli bir varlık yolunu site kökü ile birleştirir.
 *
 * @param yol      `/yuklemeler/foto.webp` · `images/a.webp` · `https://…` · boş
 * @param siteKoku `https://istanbulevenakliyat.com` (sondaki eğik çizgi önemsiz)
 * @returns        Mutlak adres; çözülemiyorsa boş dize.
 */
export function mutlakUrl(yol: unknown, siteKoku: unknown): string {
  // YALNIZ DİZE kabul ediliyor. `String(0)` → "0", `String(false)` →
  // "false"; ikisi de geçerli bir yol gibi görünüp
  // `https://site.com/false` üretirdi. Bu alanlar şemada `String?`, yani
  // sayı/boolean gelmesi bir hata belirtisi — sessizce adres uydurmak
  // yerine boş dönülüyor ve çağıran yedeğine düşüyor.
  if (typeof yol !== 'string') return ''
  const temiz = yol.trim()
  if (!temiz) return ''
  if (kendiBasinaCozulur(temiz)) return temiz

  // Eğik çizgi kırpma DÜZENLİ İFADESİZ: `/\/+$/` ve `/\/*$/` biçimleri
  // geri izleme uyarısı üretiyor ve buradaki iş zaten tek geçişte yapılıyor.
  const kirp = (metin: string, bastan: boolean): string => {
    let s = metin
    if (bastan) while (s.startsWith('/')) s = s.slice(1)
    else while (s.endsWith('/')) s = s.slice(0, -1)
    return s
  }

  const kok = kirp((typeof siteKoku === 'string' ? siteKoku : '').trim(), false)
  // Site kökü bilinmiyorsa göreli yolu OLDUĞU GİBİ döndürmek, uydurma bir
  // alan adı yazmaktan iyidir: yanlış bir mutlak adres, göreli bir adresten
  // daha zararlı olurdu (paylaşımda başka bir siteye işaret ederdi).
  if (!kok) return temiz

  return `${kok}/${kirp(temiz, true)}`
}
