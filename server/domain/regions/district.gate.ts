// server/domain/regions/district.gate.ts
//
// İSTANBUL İLÇESİ YAYIN KAPISI — TEK UYGULAMA.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN BURADA
//
// Kurallar yalnız `prisma/ilce-yayina-al.mjs` içindeydi ve oraya erişimi
// olan tek şey komut satırıydı. Panelde ise `RegionPanel`'deki `isActive`
// onay kutusu doğrudan `PUT /api/regions`'a gidiyor, `regionsService.update`
// hiçbir kapı çalıştırmıyordu: yönetici, kapıyı geçemeyecek bir ilçeyi tek
// tıkla yayına — ve sitemap'e — sokabiliyordu.
//
// Kurallar bu yüzden saf bir modüle taşındı. Mahalle kapısıyla (bkz.
// server/domain/neighborhoods/neighborhood.gate.ts) aynı desen; ortak bir
// "kapı motoru" YAPILMADI çünkü iki ailenin koşulları ve eşikleri farklı ve
// ortaklaştırma ikisini birden yanlış yapardı.
//
// ─────────────────────────────────────────────────────────────────────────
// BU MODÜL BAĞIMSIZ
//
// Ne Prisma ne Nitro ne Nuxt alias'ı. Betik (`prisma/*.mjs`) düz Node ile
// çalışıyor ve alias çözemiyor; `shared/` importları bu yüzden göreli ve
// uzantılı.
//
// ─────────────────────────────────────────────────────────────────────────
// KURALLAR BETİKTEN BİREBİR ÇIKARILDI
//
// Kaynak yorum satırları değil, ÇALIŞAN KOD: betikteki `kapidanGecirmeyen()`
// işlevi. Eşikler (200 karakter) ve on dört maddelik iddia listesi aynen
// korundu; hiçbir kural eklenmedi, çıkarılmadı, gevşetilmedi.
//
// DİKKAT — mahalle kapısıyla iki kasıtlı fark:
//   · İddia listesi FARKLI. İlçe listesinde 'türkiye geneli', '12 yıl' ve
//     'kesin fiyat' var, 'en iyi' yok. İki liste birleştirilmedi: her biri
//     kendi ailesinin metinlerine göre yazılmış ve birleştirme, bugün
//     yayında olan sayfaları geriye dönük kapıda bırakabilirdi.
//   · Gövde eşiği 200 karakter (mahallede 400). İlçe metinleri daha kısa
//     ve bu eşikle 39 ilçenin tamamı geçiyor.
import { istanbulIlcesiMi, istanbulYakasi } from '../../../shared/utils/istanbul.ts'

/**
 * Doğrulanmamış ticari iddialar — betikteki liste ile birebir aynı.
 *
 * Yasak kelime listesi değil: hiçbiri için yazılı bir taahhüt yok ve ilçe
 * sayfası yerel gerçeği anlatmadan satış vaadi vermemeli.
 */
export const ILCE_IDDIA = [
  'ücretsiz',
  'sabit fiyat',
  'fiyat garanti',
  '81 il',
  'türkiye genelinde',
  'türkiye geneli',
  '%100',
  '100%',
  '12 yıl',
  'hasarsız',
  'gizli ücret',
  'kesin fiyat',
  'en ucuz',
  'en uygun fiyat',
] as const

/** Gövde metninin (etiketsiz) en az uzunluğu. */
export const ASGARI_ICERIK = 200

const dizi = (v: unknown): any[] => {
  try {
    const x = typeof v === 'string' ? JSON.parse(v) : v
    return Array.isArray(x) ? x : []
  } catch {
    return []
  }
}

const dolu = (v: unknown): boolean => String(v ?? '').trim().length > 0

/** Kapıya giren aday ilçe kaydı. Prisma kaydı bu şekle uyuyor. */
export interface IlceAdayi {
  slug?: string | null
  title?: string | null
  subtitle?: string | null
  excerpt?: string | null
  content?: string | null
  metaDescription?: string | null
  imageAlt?: string | null
  cities?: unknown
  neighborhoods?: unknown
  faqs?: unknown
}

/**
 * Kapının kayıt dışında bilmesi gereken tek şey: arama açıklamasının
 * başka bir ilçede de kullanılıp kullanılmadığı.
 *
 * Küme değil YÜKLEM olarak geliyor — 39 kaydı toplu değerlendiren betik
 * her kayıt için "kendisi hariç" bir küme kursaydı bu O(n²) olurdu.
 * Sayaç tabanlı yüklem tek kayıtta da toplu değerlendirmede de aynı
 * işlev, yani panelle betiğin aynı cevabı vermesi yapısal.
 */
export interface IlceKapiBaglami {
  aciklamaTekrarEdiyorMu: (aciklama: string) => boolean
}

export interface IlceKapiKurali {
  anahtar: string
  etiket: string
  /** `true` geçti, `false` kaldı, `null` bu kayıt için değerlendirilmedi. */
  gecti: boolean | null
  ayrinti?: string
}

export interface IlceKapiSonucu {
  gecti: boolean
  kurallar: IlceKapiKurali[]
  /** Yalnız kalan kuralların ayrıntılı metinleri — CLI raporu bunu basıyor. */
  hatalar: string[]
}

/**
 * Kapıyı çalıştırır. YAN ETKİSİ YOK: hiçbir şey yazmaz, rapor üretir.
 *
 * Kural sırası betikteki `hatalar` dizisinin sırasıyla aynı tutuldu.
 */
export function ilceKapisi(aday: IlceAdayi, baglam: IlceKapiBaglami): IlceKapiSonucu {
  const kurallar: IlceKapiKurali[] = []
  const ekle = (anahtar: string, etiket: string, gecti: boolean | null, ayrinti?: string) =>
    kurallar.push(ayrinti === undefined ? { anahtar, etiket, gecti } : { anahtar, etiket, gecti, ayrinti })

  // 1. Gerçekten bir İstanbul ilçesi mi.
  const ilceMi = istanbulIlcesiMi(aday)
  ekle('istanbul-ilcesi', 'Kayıt bir İstanbul ilçesi', ilceMi, ilceMi ? undefined : 'İstanbul ilçesi değil')

  // 2. Yakası biliniyor mu. Betikte 1. maddeye BAĞLI DEĞİL — ikisi de her
  //    zaman değerlendiriliyor.
  const yaka = Boolean(istanbulYakasi(String(aday.slug ?? '')))
  ekle('yaka', 'Yakası biliniyor (Avrupa / Anadolu)', yaka, yaka ? undefined : 'yakası bilinmiyor')

  // 3-4. H1 kaynağı ve görünen ilçe adı.
  const baslik = dolu(aday.title)
  ekle('title', 'Başlık girilmiş (H1 kaynağı)', baslik, baslik ? undefined : 'title boş (H1 kaynağı)')

  const altBaslik = dolu(aday.subtitle)
  ekle('subtitle', 'Görünen ilçe adı girilmiş', altBaslik, altBaslik ? undefined : 'subtitle boş (görünen ilçe adı)')

  // 5. Arama açıklaması. Betikte `else if`: boşsa benzersizlik HİÇ
  //    değerlendirilmiyor.
  const aciklama = String(aday.metaDescription ?? '').trim()
  if (!aciklama) {
    ekle('meta-dolu', 'Arama açıklaması girilmiş', false, 'metaDescription boş')
    ekle('meta-benzersiz', 'Arama açıklaması başka ilçeyle aynı değil', null, 'açıklama boş olduğu için değerlendirilmedi')
  } else {
    ekle('meta-dolu', 'Arama açıklaması girilmiş', true)
    const benzersiz = !baglam.aciklamaTekrarEdiyorMu(aciklama)
    ekle('meta-benzersiz', 'Arama açıklaması başka ilçeyle aynı değil', benzersiz,
      benzersiz ? undefined : 'metaDescription başka ilçeyle aynı')
  }

  // 6. Doğrulanmamış iddia taraması — betikteki alan listesiyle aynı.
  const metin = [aday.title, aday.subtitle, aday.excerpt, aday.content, aciklama, aday.imageAlt]
    .join(' ')
    .toLocaleLowerCase('tr')
  const bulunan = ILCE_IDDIA.filter((i) => metin.includes(i))
  ekle('iddia', 'Doğrulanmamış iddia içermiyor', bulunan.length === 0,
    bulunan.length ? `iddia: ${bulunan.join(', ')}` : undefined)

  // 7. Gövde uzunluğu.
  const govdeUzunluk = String(aday.content ?? '').replace(/<[^>]*>/g, '').trim().length
  const govdeTamam = govdeUzunluk >= ASGARI_ICERIK
  ekle('content', `Gövde metni en az ${ASGARI_ICERIK} karakter`, govdeTamam,
    govdeTamam ? undefined : `content çok kısa (<${ASGARI_ICERIK} karakter)`)

  // 8. Mahalle listesi. Betikte `else if`: liste boşsa boş ad denetimi
  //    yapılmıyor.
  //
  //    NOT — bu kural `Region.neighborhoods` JSON alanını okuyor.
  //    M1 o alanı herkese açık okuma yolundan çıkardı ama KAPI GİRDİSİ
  //    olarak bıraktı; kuralı `Neighborhood` tablosuna çevirmek onu yeniden
  //    yorumlamak olurdu (bkz. modül başındaki not). 39 ilçenin tamamında
  //    dolu, yani davranış bugün için birebir aynı.
  const mahalleler = dizi(aday.neighborhoods)
  if (!mahalleler.length) {
    ekle('mahalle-listesi', 'Mahalle listesi dolu', false, 'mahalle listesi boş')
    ekle('mahalle-adlari', 'Mahalle adlarının hepsi dolu', null, 'liste boş olduğu için değerlendirilmedi')
  } else {
    ekle('mahalle-listesi', 'Mahalle listesi dolu', true)
    const adlarTamam = !mahalleler.some((m: unknown) => !String(m ?? '').trim())
    ekle('mahalle-adlari', 'Mahalle adlarının hepsi dolu', adlarTamam,
      adlarTamam ? undefined : 'boş mahalle adı var')
  }

  // 9. SSS — betikte ASGARİ SAYI YOK, yalnız eksik öğe denetleniyor.
  //    Mahalle kapısındaki "en az 3 soru" kuralı buraya TAŞINMADI.
  const sorular = dizi(aday.faqs)
  const sssTamam = !sorular.some((f: any) => !dolu(f?.question) || !dolu(f?.answer))
  ekle('sss-tam', 'Her sorunun cevabı dolu', sssTamam,
    sssTamam ? undefined : 'eksik SSS öğesi (soru ya da cevap boş)')

  // 10. Adres biçimi.
  const slugTamam = /^[a-z0-9-]+$/.test(String(aday.slug ?? ''))
  ekle('slug', 'Adres yalnız küçük harf, rakam ve tire içeriyor', slugTamam,
    slugTamam ? undefined : 'slug adres olarak geçersiz')

  const hatalar = kurallar.filter((k) => k.gecti === false).map((k) => k.ayrinti || k.etiket)
  return { gecti: hatalar.length === 0, kurallar, hatalar }
}
