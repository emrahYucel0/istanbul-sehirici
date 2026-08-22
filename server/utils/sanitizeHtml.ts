// server/utils/sanitizeHtml.ts
//
// SUNUCU TARAFINA TAŞINDI — sebebi ölçüldü.
//
// Bu dosya önce `app/utils/` altındaydı ve `sanitizeHtml()` doğrudan Vue
// şablonlarında çağrılıyordu (`v-html="sanitizeHtml(html)"`). Şablonda
// çağrılınca kod hem sunucuda hem TARAYICIDA çalışıyor; tarayıcıda
// çalışabilmesi için de `sanitize-html` + `htmlparser2` paketlerinin tamamı
// istemci paketine giriyordu.
//
// Ölçüm (canlı derleme): bu tek parça 234 KB ve /iletisim dahil HER sayfada
// ön yükleniyordu — bölge sayfasında ön yüklenen JS'in %45'i. Oysa temizlik
// işi sunucuda zaten bir kez yapılıyor; tarayıcı aynı işi ikinci kez
// yapıyordu.
//
// Artık içerik API'den ÇIKARKEN temizleniyor, tarayıcıya temiz geliyor ve
// kütüphane istemci paketine hiç girmiyor (server/ istemci için paketlenmez).
//
// Yönetici paneli de aynı uçları kullandığı için düzenleyicide görünen metin
// artık ziyaretçinin gördüğüyle birebir aynı. Bu bilinçli: izin listesi
// dışında kalan bir etiket zaten sitede hiç render edilmiyordu, yalnızca
// veritabanında görünmez biçimde duruyordu.
// v-html ile render edilen tüm admin-yazılabilir CMS alanları (blog/bölge
// içeriği, istatistik ikonları, başlıklar vb.) burada geçmeli — aksi halde
// depolanan XSS'e açık olurlar (bkz. 2026-07-29 güvenlik denetimi bulgu #2).
//
// `sanitize-html` kasıtlı seçildi: saf JS (htmlparser2 tabanlı), jsdom
// gerektirmiyor. `isomorphic-dompurify` denendi ama jsdom'un
// @asamuzakjp/css-color -> @csstools/css-calc zincirindeki ESM/CJS
// uyumsuzluğu SSR'de tüm siteyi 500'e düşürdü (require() ile ESM-only
// modül çağrılıyor) — bu yüzden jsdom'suz bir alternatife geçildi.
import sanitizeHtmlLib from 'sanitize-html'

// TipTap zengin metin editörünün (StarterKit varsayılanları + Heading/
// Bold/Italic/Underline/BulletList/OrderedList/Image eklentileri) ürettiği
// etiketler + admin panellerdeki basit "başlıkta vurgu" span'leri için
// yeterli, script/iframe/on* gibi tehlikeli her şeyi dışarıda bırakan
// bir allowlist.
const ALLOWED_TAGS = [
  'p', 'br', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'h1', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li',
  'a', 'img',
  'blockquote', 'code', 'pre', 'hr',
]

const ALLOWED_ATTRIBUTES = {
  '*': ['class'],
  a: ['href', 'target', 'rel', 'title'],
  img: ['src', 'alt', 'title'],
}

export function sanitizeHtml(dirty: unknown): string {
  if (typeof dirty !== 'string' || !dirty) return ''
  return sanitizeHtmlLib(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    disallowedTagsMode: 'discard',
  })
}

/**
 * Bir kaydın (ya da kayıt listesinin) HTML taşıyan alanlarını temizler.
 *
 * NEDEN TEK YARDIMCI
 * Temizlik artık okuma anında yapılıyor ve okuma yollarında birden çok
 * dönüş noktası var (tekil kayıt, sayfalı liste, hafif liste). Her dönüşe
 * ayrı ayrı çağrı serpiştirmek, birini atlamanın XSS açığı demek olduğu bir
 * yerde kabul edilemez bir desen. Tek yardımcı, tek davranış.
 *
 * Yalnızca `content` alanı geçiyor: herkese açık tarafta `v-html` ile
 * basılan tek veritabanı alanı o (diğer `v-html` kullanımları başlık
 * vurgusu ve kaçış tabanlı — bkz. app/utils/vurgulu-baslik.ts).
 *
 * Girdi olduğu gibi DEĞİŞTİRİLMİYOR; kopya dönüyor. Prisma sonuçları
 * başka yerlerde de kullanılabildiği için yerinde değiştirmek sürprizli
 * olurdu.
 */
const HTML_FIELDS = ['content'] as const

export function sanitizeContentFields<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeContentFields(item)) as unknown as T
  }
  if (!data || typeof data !== 'object') return data

  if (data instanceof Date) return data

  const record = data as Record<string, unknown>
  let degisti = false
  const kopya: Record<string, unknown> = { ...record }

  // HTML alanları
  for (const alan of HTML_FIELDS) {
    if (typeof kopya[alan] === 'string' && kopya[alan]) {
      kopya[alan] = sanitizeHtml(kopya[alan])
      degisti = true
    }
  }

  // İÇ İÇE DİZİLER — atlanmamalı. Bölüm kayıtları içeriği çocuk listelerde
  // taşıyor: hizmetler `{ services: [...] }`, sayfalı listeler
  // `{ items: [...] }` biçiminde geliyor. Yalnız üst seviyeye bakmak
  // hizmet sayfalarının içeriğini temizlenmemiş bırakırdı.
  for (const [anahtar, deger] of Object.entries(record)) {
    if (Array.isArray(deger)) {
      kopya[anahtar] = sanitizeContentFields(deger)
      degisti = true
    }
  }

  return (degisti ? kopya : data) as T
}
