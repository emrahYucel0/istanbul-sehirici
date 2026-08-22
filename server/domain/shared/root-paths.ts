// server/domain/shared/root-paths.ts
//
// KÖK AD ALANI — YETKİLİ DENETİM NOKTASI.
//
// ─────────────────────────────────────────────────────────────────────────
// SORUN
//
// Beş farklı kaynak aynı kök adresi paylaşıyor: statik rotalar, `Post`,
// `Region`, `Service` ve `Neighborhood`. Çözümleyici (`app/pages/[...slug].vue`)
// arasında bir SIRA kuruyor — statik → yazı → bölge → hizmet → mahalle — ama
// bu bir çözümleme sırası, koruma değil. Aynı adresi iki kayıt alırsa biri
// sessizce gölgede kalıyor; üstelik sitemap ikisini de bildirmeye devam
// ediyor, yani Search Console'a var olmayan bir içerik bildiriliyor.
//
// ─────────────────────────────────────────────────────────────────────────
// KAPSAM
//
// M1'de bu yardımcı BİLEREK dar tutulmuştu: yalnız mahalle yazma yolu
// çağırıyordu. Artık dört ailenin de (yazı, bölge, hizmet, mahalle) yazma ve
// yayına alma uçları buradan geçiyor. İKİNCİ bir çakışma sistemi kurulmadı;
// var olan genişletildi.
//
// GENEL BİR CMS ÇERÇEVESİ DEĞİL: burada rota kaydı, iş akışı motoru ya da
// yönlendirme geçmişi yok. Sorumluluk beş maddeyle sınırlı —
//   1. adresi normalleştir
//   2. slug biçimini denetle
//   3. dolu adresleri topla (statik + dört tablo)
//   4. gerektiğinde kaydın KENDİ adresini hariç tut
//   5. çakışmayı okunur bir raporla dön
//
// Yazma YOK: bu modül veri tabanına yalnız okur.
import prisma from '../../utils/prisma.ts'

/**
 * KANONİK SLUG BİÇİMİ.
 *
 *   küçük harf + rakam, aralarında TEK tire
 *
 * GEÇERLİ : pendik · evden-eve-nakliyat · 2026-tasinma-rehberi
 * GEÇERSİZ: Pendik · "evden eve" · şişli · -pendik · pendik- · a--b · /pendik
 *
 * Ölçüldü: mevcut 865 kök adresin (10 yazı + 375 bölge + 7 hizmet +
 * 473 mahalle) TAMAMI bu kalıba uyuyor, yani kural hiçbir kaydı geriye
 * dönük geçersiz kılmıyor ve toplu normalleştirmeye gerek yok.
 */
export const KOK_SLUG_KALIBI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Herkese açık statik kök sayfalar — `app/pages/*.vue` karşılıkları.
 *
 * ELLE TUTULUYOR ve bu bilinçli: rotalar dosya sisteminden geliyor,
 * çalışma zamanında güvenilir biçimde sayılamıyorlar. Kaymayı
 * `root-paths.drift.test.ts` yakalıyor: test sayfa ağacını gerçekten
 * okuyup bu listeyle karşılaştırıyor.
 */
export const HERKESE_ACIK_KOK_SAYFALAR: readonly string[] = [
  '', // app/pages/index.vue
  'blog',
  'bolgelerimiz',
  'cerez-politikasi',
  'fiyat-hesaplama',
  'gizlilik-politikasi',
  'hakkimizda',
  'hizmetlerimiz',
  'iletisim',
  'kullanim-sartlari',
]

/**
 * Herkese açık sayfa OLMAYAN ama kök ad alanını yine de tutan adresler.
 *
 * Bunlar dizine sunulmuyor (yönetim panelleri `noindex`, `api` ve
 * `yuklemeler` sunucu rotaları, `fonts`/`images` statik dosya klasörleri) —
 * yani bir içerik sayfası sayılmazlar ve herkese açık envantere girmiyorlar.
 * Ama bir kayıt bu adreslerden birini alırsa sayfası HİÇBİR ZAMAN
 * görüntülenemez: istek Nitro seviyesinde karşılanıp Vue rotasına hiç
 * ulaşmaz. Bu yüzden REZERVE.
 *
 * `istanbul` gerçek bir sayfa değil: `nuxt.config.ts` routeRules onu kalıcı
 * olarak `/`'a yönlendiriyor. Devredilmiş sahibi için bkz.
 * `DEVREDILMIS_SAHIPLER`.
 */
export const IC_KOK_ADRESLER: readonly string[] = [
  'admin',
  'api',
  'evdeneveyonetim',
  'fonts', // public/fonts
  'images', // public/images
  'istanbul', // routeRules → 301 /
  'prototip',
  'robots.txt',
  'sitemap.xml',
  'yuklemeler', // server/routes/yuklemeler
]

/** Kod tarafından sahiplenilen bütün kök adresler. */
export const STATIK_KOK_ADRESLER: readonly string[] = [
  ...HERKESE_ACIK_KOK_SAYFALAR,
  ...IC_KOK_ADRESLER,
]

/**
 * REZERVE OLMASINA RAĞMEN BUGÜN BİR KAYDIN ELİNDE OLAN ADRESLER.
 *
 * Tek üye: `/istanbul`. Region#122 ("İstanbul Evden Eve Nakliyat") bu slug'ı
 * tutuyor ve kayıt bilerek silinmedi; adres routeRules ile `/`'a
 * yönlendiriliyor (bkz. nuxt.config.ts). Ölçüldü: ön denetimde bulunan TEK
 * statik çakışma bu.
 *
 * BU BİR GENEL İSTİSNA DEĞİL. Çalışma zamanı kuralı "statik çakışmalara izin
 * ver" değil, `kokCakismasiniBul()` içindeki tek satır: bir kayıt KENDİ
 * mevcut adresini koruyabilir. Sonuçları —
 *   · Region#122 slug'ına dokunmayan güncellemeler eskisi gibi geçiyor.
 *   · Yeni bir yazı/bölge/hizmet/mahalle `istanbul` adresini ALAMIYOR.
 *   · Region#122 slug'ı başka bir değere taşınırsa muafiyet geri
 *     KAZANILAMIYOR — adres o anda sıradan bir statik rezerve dönüyor.
 *
 * Liste yalnız belgeleme ve test amaçlı; karar buna bakmıyor.
 */
export const DEVREDILMIS_SAHIPLER: readonly { yol: string; tur: string }[] = [
  { yol: 'istanbul', tur: 'bölge sayfası' },
]

/** Baştaki eğik çizgileri ve boşlukları atar: "/Pendik " → "Pendik". */
export function kokYolunuNormallestir(deger: unknown): string {
  return String(deger ?? '')
    .trim()
    .replace(/^\/+/, '')
}

/**
 * Slug biçimini denetler; kusur varsa YÖNETİCİYE GÖSTERİLECEK metni döner.
 *
 * SESSİZ DÜZELTME YOK: geçersiz bir adres başka bir adrese çevrilmiyor,
 * işlem reddediliyor. Panelde başlıktan adres önerisi üretmek istemci
 * tarafının işi; sunucuda bu bir değişmez.
 */
export function slugBiciminiDenetle(ham: unknown): string | null {
  const yol = kokYolunuNormallestir(ham)
  if (!yol) return 'Adres (slug) boş olamaz.'
  if (KOK_SLUG_KALIBI.test(yol)) return null

  const nedenler: string[] = []
  if (/[A-Z]/.test(yol)) nedenler.push('büyük harf')
  if (/\s/.test(yol)) nedenler.push('boşluk')
  if (yol.includes('/')) nedenler.push('eğik çizgi')
  if (/^-/.test(yol)) nedenler.push('baştaki tire')
  if (/-$/.test(yol)) nedenler.push('sondaki tire')
  if (yol.includes('--')) nedenler.push('art arda iki tire')
  // Boşluk yukarıda ayrıca bildirildiği için ASCII aralığı boşluğu İÇERİYOR;
  // aksi hâlde "Evden Eve" hem "boşluk" hem "Türkçe karakter" diye
  // raporlanır ve yönetici olmayan bir sorunu arardı.
  if (/[^\x20-\x7e]/.test(yol)) nedenler.push('Türkçe/aksanlı karakter')

  const ayrinti = nedenler.length ? ` Sorun: ${nedenler.join(', ')}.` : ''
  return (
    `"${yol}" geçerli bir adres değil.${ayrinti} ` +
    'Adres yalnız küçük harf, rakam ve aralarında tek tire içerebilir (ör. evden-eve-nakliyat).'
  )
}

export interface KokAdresSecenek {
  /**
   * Bu id'ye sahip mahalle kaydının kendi adresi kümeye EKLENMEZ.
   * (M1'den beri var; mahalle adres üretimi bunu kullanıyor.)
   */
  haricMahalleId?: number
  /**
   * Bu slug'a sahip yazı/bölge/hizmet kümeye EKLENMEZ.
   *
   * YAYIN ANI DENETİMİ için: kayıt kendi adresini zaten tutuyor, soru
   * "adresimi BAŞKASI da tutuyor mu?" Kendini çıkarmadan sorulursa cevap
   * her zaman "evet" olur.
   */
  haricYaziSlug?: string
  haricBolgeSlug?: string
  haricHizmetSlug?: string
  /**
   * BÜTÜN hizmet satırları kümeden çıkarılır.
   *
   * Hizmet bölümü `deleteStrategy: 'manual'` ile çalışıyor: her PUT tüm
   * `Service` satırlarını silip yeniden yaratıyor. Yani aday küme mevcut
   * kümenin YERİNE geçiyor; mevcut satırları "dolu" saymak, hizmetlerin
   * kendi adreslerine çakışması demek olurdu.
   */
  haricHizmetlerinTumu?: boolean
}

export interface KokAdresKumesi {
  /** Bütün dolu adresler — adres üretimi bu kümeye bakıyor. */
  hepsi: Set<string>
  /** Yalnız mahalleler. */
  mahalleler: Set<string>
  /**
   * Mahalle DIŞINDAKİ kaynaklar: statik rota, yazı, bölge, hizmet.
   *
   * Kapı bunu kullanıyor: bir mahallenin kendi adresini "dolu" saymadan
   * başka bir varlığı gölgeleyip gölgelemediğini sorabilmek için mahalle
   * kümesinin dışarıda kalması gerekiyor.
   */
  disKaynaklar: Set<string>
  /** Bir adresin hangi TÜR tarafından tutulduğunu söyler; hata metni için. */
  sahip: Map<string, string>
  /** Adresi tutan kaydın görünen ADI ("Pendik Evden Eve Nakliyat"). */
  etiketler: Map<string, string>
}

/**
 * Kök ad alanındaki bütün dolu adresleri toplar.
 *
 * DÖRT HAFİF SORGU: her biri yalnız adres ve başlık sütunlarını çekiyor.
 * Toplam kayıt bugün 865; tek seferde okunup küme hâline getiriliyor. Adres
 * başına ayrı sorgu (N+1) BİLEREK yapılmıyor — yazma işlemleri seyrek ve bir
 * yazma sırasında birden çok adres adayı denetleniyor (mahallede taban +
 * yedek, hizmette aday kümenin tamamı).
 *
 * TASLAKLAR DA SAYILIYOR. Yayında olmayan bir kaydın adresi bugün 404 verse
 * bile REZERVE: aksi hâlde iki taslak aynı adresi alır, ilki yayına
 * girdiğinde ikincisi sessizce erişilemez hâle gelirdi. Çakışmayı yayın
 * anına ertelemek, sorunu en pahalı yerde patlatmak olurdu.
 */
export async function kokAdresleriTopla(
  secenek: KokAdresSecenek = {}
): Promise<KokAdresKumesi> {
  const [yazilar, bolgeler, hizmetler, mahalleler] = await Promise.all([
    prisma.post.findMany({ select: { slug: true, title: true } }),
    prisma.region.findMany({ select: { slug: true, title: true } }),
    secenek.haricHizmetlerinTumu
      ? Promise.resolve([] as { slug: string | null; title: string | null }[])
      : prisma.service.findMany({ select: { slug: true, title: true } }),
    prisma.neighborhood.findMany({ select: { id: true, canonicalPath: true, name: true } }),
  ])

  const hepsi = new Set<string>()
  const mahalleKumesi = new Set<string>()
  const disKaynaklar = new Set<string>()
  const sahip = new Map<string, string>()
  const etiketler = new Map<string, string>()

  const ekle = (yol: unknown, tur: string, etiket?: unknown) => {
    const temiz = kokYolunuNormallestir(yol)
    if (!temiz && tur !== 'statik sayfa') return
    hepsi.add(temiz)
    // İlk sahip korunuyor: bir adres zaten doluysa onu kimin tuttuğunu
    // bilmek, sonradan geleni saymaktan daha yararlı.
    if (!sahip.has(temiz)) {
      sahip.set(temiz, tur)
      const ad = String(etiket ?? '').trim()
      if (ad) etiketler.set(temiz, ad)
    }
  }

  const disEkle = (yol: unknown, tur: string, etiket?: unknown) => {
    const temiz = kokYolunuNormallestir(yol)
    if (!temiz && tur !== 'statik sayfa') return
    ekle(temiz, tur, etiket)
    disKaynaklar.add(temiz)
  }

  // Hariç tutulan slug'lar normalleştirilmiş biçimde karşılaştırılıyor;
  // `undefined` hiçbir kayda eşleşmesin diye ayrı bayrakla kontrol ediliyor.
  const haricEsler = (slug: string | undefined, aday: unknown) =>
    slug !== undefined && kokYolunuNormallestir(slug) === kokYolunuNormallestir(aday)

  for (const yol of STATIK_KOK_ADRESLER) disEkle(yol, 'statik sayfa')
  for (const y of yazilar) {
    if (haricEsler(secenek.haricYaziSlug, y.slug)) continue
    disEkle(y.slug, 'blog yazısı', y.title)
  }
  for (const b of bolgeler) {
    if (haricEsler(secenek.haricBolgeSlug, b.slug)) continue
    disEkle(b.slug, 'bölge sayfası', b.title)
  }
  for (const h of hizmetler) {
    if (haricEsler(secenek.haricHizmetSlug, h.slug)) continue
    disEkle(h.slug, 'hizmet sayfası', h.title)
  }

  for (const m of mahalleler) {
    if (secenek.haricMahalleId !== undefined && m.id === secenek.haricMahalleId) continue
    ekle(m.canonicalPath, 'mahalle sayfası', m.name)
    mahalleKumesi.add(m.canonicalPath)
  }

  return { hepsi, mahalleler: mahalleKumesi, disKaynaklar, sahip, etiketler }
}

/** Panelin gösterebileceği yapılandırılmış çakışma raporu. */
export interface KokCakismasi {
  code: 'GECERSIZ_ADRES' | 'KOK_ADRES_CAKISMASI'
  /** Baştaki eğik çizgiyle: "/pendik". */
  path: string
  /** Adresi tutan tür: "bölge sayfası" · "statik sayfa" … */
  conflictingType?: string
  /** Adresi tutan kaydın görünen adı; statik rotalarda yok. */
  conflictingLabel?: string
  /** Yöneticiye gösterilecek tam cümle. */
  message: string
}

/**
 * Aday adresi dolu adres kümesiyle karşılaştırır. SAF: veri tabanına
 * bakmaz, kümeyi çağıran verir.
 *
 * `mevcutYol` — kaydın BUGÜNKÜ adresi. Aday adres buna eşitse adres zaten
 * kendisinindir ve çakışma aranmaz (kendini hariç tutma). Bu tek satır
 * `/istanbul` devrini de karşılıyor: mevcut sahibi adresini koruyabiliyor,
 * ama adresten çıkınca muafiyet geri kazanılamıyor (bkz.
 * `DEVREDILMIS_SAHIPLER`).
 */
export function kokCakismasiniBul(
  kume: KokAdresKumesi,
  aday: unknown,
  mevcutYol?: string | null
): KokCakismasi | null {
  const yol = kokYolunuNormallestir(aday)

  const bicimHatasi = slugBiciminiDenetle(yol)
  if (bicimHatasi) return { code: 'GECERSIZ_ADRES', path: `/${yol}`, message: bicimHatasi }

  if (mevcutYol !== undefined && mevcutYol !== null && kokYolunuNormallestir(mevcutYol) === yol) {
    return null
  }

  if (!kume.hepsi.has(yol)) return null

  const tur = kume.sahip.get(yol) ?? 'bilinmeyen kayıt'
  const etiket = kume.etiketler.get(yol)
  return {
    code: 'KOK_ADRES_CAKISMASI',
    path: `/${yol}`,
    conflictingType: tur,
    conflictingLabel: etiket,
    message:
      tur === 'statik sayfa'
        ? `/${yol} sistem tarafından ayrılmış bir adrestir.`
        : `/${yol} adresi zaten ${tur} tarafından kullanılıyor${etiket ? ` ("${etiket}")` : ''}.`,
  }
}

export interface KokDenetimSecenek {
  /** Kaydın bugünkü adresi; aday buna eşitse denetim geçer. */
  mevcutYol?: string | null
  /** Küme toplanırken uygulanacak hariç tutmalar. */
  haric?: KokAdresSecenek
}

/**
 * Tek adres için biçim + çakışma denetimi; kümeyi kendisi topluyor.
 *
 * Yazı ve bölge uçları bunu çağırıyor. Hizmet bölümü aday kümenin TAMAMINI
 * birden denetlediği için kümeyi bir kez toplayıp `kokCakismasiniBul()`u
 * doğrudan kullanıyor.
 */
export async function kokYoluDenetle(
  aday: unknown,
  secenek: KokDenetimSecenek = {}
): Promise<KokCakismasi | null> {
  const bicimHatasi = slugBiciminiDenetle(aday)
  if (bicimHatasi) {
    return {
      code: 'GECERSIZ_ADRES',
      path: `/${kokYolunuNormallestir(aday)}`,
      message: bicimHatasi,
    }
  }

  // Adres değişmiyorsa sorgu bile atılmıyor: en sık yol (başlık/metin
  // düzenleme) dört ek sorgu ödemesin.
  if (
    secenek.mevcutYol !== undefined &&
    secenek.mevcutYol !== null &&
    kokYolunuNormallestir(secenek.mevcutYol) === kokYolunuNormallestir(aday)
  ) {
    return null
  }

  const kume = await kokAdresleriTopla(secenek.haric ?? {})
  return kokCakismasiniBul(kume, aday, secenek.mevcutYol)
}

/** Adres doluysa kim tuttuğunu anlatan okunur bir metin; boşsa `null`. */
export function cakismaMetni(kume: KokAdresKumesi, yol: string): string | null {
  if (!kume.hepsi.has(yol)) return null
  return `/${yol} adresi zaten kullanımda (${kume.sahip.get(yol) ?? 'bilinmeyen kayıt'}).`
}
