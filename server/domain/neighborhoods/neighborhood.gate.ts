// server/domain/neighborhoods/neighborhood.gate.ts
//
// MAHALLE YAYIN KAPISI — TEK UYGULAMA.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN BURADA
//
// Kurallar önce yalnız `prisma/mahalle-yayina-al.mjs` içindeydi ve oraya
// erişimi olan tek şey komut satırıydı. Panel açılınca aynı kuralların
// ikinci bir kopyası gerekecekti; iki kopya demek, biri değiştiğinde
// CLI'ın yayına aldığı bir kaydı panelin reddetmesi (ya da tersi) demek.
// Kurallar bu yüzden saf bir modüle taşındı: hem servis hem betik BURAYI
// çağırıyor, kopya yok.
//
// ─────────────────────────────────────────────────────────────────────────
// BU MODÜL BİLEREK BAĞIMSIZ
//
// Ne Prisma ne Nitro ne de Nuxt alias'ı kullanıyor. Sebebi tek: betik
// (`prisma/*.mjs`) düz Node ile çalışıyor ve `#shared` gibi bir alias'ı
// çözemiyor. `shared/` importları bu yüzden göreli ve UZANTILI yazılmış —
// Node'un ESM çözümleyicisi uzantısız göreli yolu bulamıyor.
//
// ─────────────────────────────────────────────────────────────────────────
// KURALLAR DEĞİŞTİRİLMEDİ
//
// Aşağıdaki koşullar betikteki `kapi()` işlevinden BİREBİR çıkarıldı;
// eşikler (400 karakter, 70-175 karakter, 3 SSS) ve iddia listesi aynen
// korundu. Tek EKLEME `adres-benzersiz`: betiğin başlığı bu maddeyi
// sayıyordu ama gövdesi uygulamıyordu (sütun UNIQUE olduğu için yazma
// anında zaten patlıyordu). Panelde hata mesajı yerine okunur bir kural
// satırı görünmesi gerektiği için açıkça denetleniyor. Kural GEVŞETİLMEDİ,
// yalnızca görünür oldu.
import { istanbulIlcesiMi } from '../../../shared/utils/istanbul.ts'
import { MAHALLE_EKI } from '../../../shared/utils/mahalle.ts'

/**
 * Doğrulanmamış ticari iddialar.
 *
 * Bunlar "yasak kelime" listesi değil: hiçbiri için elimizde yazılı bir
 * taahhüt yok ve mahalle sayfası bir satış vaadi vermeden önce yerel
 * gerçeği anlatmalı. Betikteki liste ile birebir aynı.
 */
export const IDDIA = [
  'ücretsiz',
  'sabit fiyat',
  'fiyat garanti',
  '%100',
  '100%',
  'en iyi',
  'en ucuz',
  'en uygun fiyat',
  'hasarsız',
  'gizli ücret',
  '81 il',
  'türkiye genelinde',
] as const

/** Gövde metninin (etiketsiz) en az uzunluğu. */
export const ASGARI_ICERIK = 400
/** Arama açıklamasının kabul edilen aralığı. */
export const META_ALT = 70
export const META_UST = 175
/** En az kaç sık sorulan soru gerekiyor. */
export const ASGARI_SSS = 3
/** Kopya sayılabilmesi için bir paragrafın en az uzunluğu. */
export const PARAGRAF_ESIGI = 60

// --- yardımcılar (betikteki karşılıklarıyla aynı davranış) ----------------

export const dizi = (v: unknown): any[] => {
  try {
    const x = typeof v === 'string' ? JSON.parse(v) : v
    return Array.isArray(x) ? x : []
  } catch {
    return []
  }
}

export const dolu = (v: unknown): boolean => String(v ?? '').trim().length > 0

export const duzMetin = (html: unknown): string =>
  String(html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Paragraf karşılaştırması için gürültüden arındırılmış anahtar. */
export const paragrafAnahtari = (metin: string): string =>
  metin
    .toLocaleLowerCase('tr')
    .replace(/[^\p{L}\p{N} ]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()

export const paragraflar = (html: unknown): string[] =>
  String(html ?? '')
    .split(/<\/p>|<\/h[23]>/i)
    .map((x) => paragrafAnahtari(duzMetin(x)))
    .filter((x) => x.length > PARAGRAF_ESIGI)

// --- sözleşme -------------------------------------------------------------

/** Kapıya giren aday kayıt. Prisma kaydı da bu şekle uyuyor. */
export interface KapiAdayi {
  canonicalPath?: string | null
  title?: string | null
  excerpt?: string | null
  content?: string | null
  metaDescription?: string | null
  faqs?: unknown
  facts?: unknown
}

/**
 * Kapının kayıt dışında bilmek zorunda olduğu bağlam.
 *
 * Benzersizlik soruları KÜME DEĞİL, YÜKLEM olarak geliyor. Sebebi ölçülebilir:
 * 473 kaydı toplu değerlendiren betik, her kayıt için "kendisi hariç" bir
 * küme kursaydı bu O(n²) olurdu. Yüklem sayaç tabanlı çalışıyor ve tek
 * kayıt da toplu değerlendirme de aynı işlevi çağırıyor — yani panelle
 * betiğin aynı cevabı vermesi bir yorum değil, yapısal.
 */
export interface KapiBaglami {
  /** Bağlı olduğu ilçe kaydı — sınıflandırma ve yayın durumu için. */
  ilce: { slug?: string | null; cities?: unknown; isActive?: boolean | null; content?: string | null } | null
  /** Bu arama açıklaması BAŞKA bir mahallede de kullanılıyor mu? */
  aciklamaTekrarEdiyorMu: (aciklama: string) => boolean
  /** Bu adres BAŞKA bir mahallede de kullanılıyor mu? */
  adresTekrarEdiyorMu: (yol: string) => boolean
}

export interface KapiKurali {
  /** Programatik anahtar — testler ve arayüz bunu kullanıyor. */
  anahtar: string
  /** Panelde görünen okunur etiket. */
  etiket: string
  /** `true` geçti, `false` kaldı, `null` bu kayıt için değerlendirilmedi. */
  gecti: boolean | null
  /** Neden kaldığını anlatan kısa ek bilgi (varsa). */
  ayrinti?: string
}

export interface KapiSonucu {
  gecti: boolean
  kurallar: KapiKurali[]
  /** Yalnız kalan kuralların ayrıntılı metinleri — CLI raporu bunu basıyor. */
  hatalar: string[]
}

/**
 * Kapıyı çalıştırır. YAN ETKİSİ YOK: hiçbir şey yazmaz, yalnız rapor üretir.
 *
 * Kural sırası betikteki sırayla aynı tutuldu; CLI'ın "ilk sebep bazında"
 * gruplayan raporu bu sıraya bağlı.
 */
export function mahalleKapisi(aday: KapiAdayi, baglam: KapiBaglami): KapiSonucu {
  const kurallar: KapiKurali[] = []
  const ekle = (anahtar: string, etiket: string, gecti: boolean | null, ayrinti?: string) =>
    kurallar.push(ayrinti === undefined ? { anahtar, etiket, gecti } : { anahtar, etiket, gecti, ayrinti })

  // 1-2. Ebeveyn. Betikteki `else if` semantiği korunuyor: ebeveyn İstanbul
  // ilçesi değilse yayın durumu HİÇ değerlendirilmiyor.
  const istanbulIlcesi = istanbulIlcesiMi(baglam.ilce)
  ekle('parent-istanbul', 'Bağlı olduğu kayıt gerçek bir İstanbul ilçesi', istanbulIlcesi,
    istanbulIlcesi ? undefined : 'ebeveyn İstanbul ilçesi değil')

  if (!istanbulIlcesi) {
    ekle('parent-aktif', 'İlçe sayfası yayında', null, 'ebeveyn geçersiz olduğu için değerlendirilmedi')
  } else {
    const ilceAktif = Boolean(baglam.ilce?.isActive)
    ekle('parent-aktif', 'İlçe sayfası yayında', ilceAktif,
      ilceAktif ? undefined : 'ebeveyn ilçe yayında değil')
  }

  // 3-4. Adres biçimi.
  const yol = String(aday.canonicalPath ?? '')
  const karakterTamam = /^[a-z0-9-]+$/.test(yol)
  ekle('adres-karakter', 'Adres yalnız küçük harf, rakam ve tire içeriyor', karakterTamam,
    karakterTamam ? undefined : 'adres geçersiz karakter içeriyor')

  const ekTamam = yol.endsWith(`-${MAHALLE_EKI}`)
  ekle('adres-eki', `Adres \`-${MAHALLE_EKI}\` ile bitiyor`, ekTamam,
    ekTamam ? undefined : 'adres `-mahallesi` ile bitmiyor')

  // 4b. Adres benzersizliği — betiğin başlığında sayılı, gövdesinde
  // uygulanmıyordu (sütun UNIQUE). Panelde okunur bir satır gerektiği için
  // açıkça denetleniyor.
  const yolBenzersiz = Boolean(yol) && !baglam.adresTekrarEdiyorMu(yol)
  ekle('adres-benzersiz', 'Adres başka bir mahallede kullanılmıyor', yolBenzersiz,
    yolBenzersiz ? undefined : 'adres başka bir mahalleyle aynı')

  // 5-6. Zorunlu metin alanları.
  const baslikTamam = dolu(aday.title)
  ekle('title', 'Sayfa başlığı girilmiş', baslikTamam, baslikTamam ? undefined : 'title boş')

  const ozetTamam = dolu(aday.excerpt)
  ekle('excerpt', 'Giriş özeti girilmiş', ozetTamam, ozetTamam ? undefined : 'excerpt boş')

  // 7. Gövde uzunluğu.
  const govde = duzMetin(aday.content)
  const govdeTamam = govde.length >= ASGARI_ICERIK
  ekle('content', `Gövde metni en az ${ASGARI_ICERIK} karakter`, govdeTamam,
    govdeTamam ? undefined : `content çok kısa (${govde.length} karakter)`)

  // 8. Arama açıklaması — dolu, benzersiz, makul uzunlukta.
  const aciklama = String(aday.metaDescription ?? '').trim()
  if (!aciklama) {
    ekle('meta-dolu', 'Arama açıklaması girilmiş', false, 'metaDescription boş')
    ekle('meta-benzersiz', 'Arama açıklaması başka mahalleyle aynı değil', null, 'açıklama boş olduğu için değerlendirilmedi')
    ekle('meta-uzunluk', `Arama açıklaması ${META_ALT}-${META_UST} karakter`, null, 'açıklama boş olduğu için değerlendirilmedi')
  } else {
    ekle('meta-dolu', 'Arama açıklaması girilmiş', true)

    const benzersiz = !baglam.aciklamaTekrarEdiyorMu(aciklama)
    ekle('meta-benzersiz', 'Arama açıklaması başka mahalleyle aynı değil', benzersiz,
      benzersiz ? undefined : 'metaDescription başka mahalleyle aynı')

    const uzunlukTamam = aciklama.length >= META_ALT && aciklama.length <= META_UST
    ekle('meta-uzunluk', `Arama açıklaması ${META_ALT}-${META_UST} karakter`, uzunlukTamam,
      uzunlukTamam ? undefined : `metaDescription uzunluğu uygun değil (${aciklama.length})`)
  }

  // 9. Sık sorulanlar.
  const sorular = dizi(aday.faqs)
  const sssSayiTamam = sorular.length >= ASGARI_SSS
  ekle('sss-sayi', `En az ${ASGARI_SSS} sık sorulan soru`, sssSayiTamam,
    sssSayiTamam ? undefined : `SSS sayısı yetersiz (${sorular.length})`)

  const sssTam = !sorular.some((f: any) => !dolu(f?.question) || !dolu(f?.answer))
  ekle('sss-tam', 'Her sorunun cevabı dolu', sssTam,
    sssTam ? undefined : 'eksik SSS öğesi (soru ya da cevap boş)')

  // 10. Doğrulanmamış iddia taraması.
  const metin = [
    aday.title,
    aday.excerpt,
    aciklama,
    govde,
    JSON.stringify(aday.faqs || ''),
    JSON.stringify(aday.facts || ''),
  ]
    .join(' ')
    .toLocaleLowerCase('tr')
  const bulunan = IDDIA.filter((i) => metin.includes(i))
  ekle('iddia', 'Doğrulanmamış iddia içermiyor', bulunan.length === 0,
    bulunan.length ? `iddia: ${bulunan.join(', ')}` : undefined)

  // 11. İlçe sayfasından paragraf kopyası.
  const ilceKumesi = new Set(paragraflar(baglam.ilce?.content))
  const kopya = paragraflar(aday.content).filter((x) => ilceKumesi.has(x))
  ekle('ilce-kopya', 'İlçe sayfasından kopyalanmış paragraf yok', kopya.length === 0,
    kopya.length ? `ilçe sayfasından ${kopya.length} paragraf kopyası` : undefined)

  const hatalar = kurallar
    .filter((k) => k.gecti === false)
    .map((k) => k.ayrinti || k.etiket)

  return { gecti: hatalar.length === 0, kurallar, hatalar }
}
