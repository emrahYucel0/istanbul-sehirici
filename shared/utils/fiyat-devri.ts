// shared/utils/fiyat-devri.ts
//
// HESAPLAYICI → İLETİŞİM DEVRİ — İSTEMCİ VE SUNUCUNUN PAYLAŞTIĞI SÖZLEŞME.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN `shared/`
//
// Devrin doğrulaması İKİ YERDE çalışmak zorunda:
//
//   · istemci  → iletişim sayfası özeti ekrana basmadan önce
//   · SUNUCU   → talep kaydedilirken, çünkü ekrandaki metin kullanıcının
//                elinde ve silinebilir
//
// İki uçta iki ayrı doğrulama yazmak, ikisinin zamanla ayrışması demekti.
// Depoda bunun yeri belli: `server/domain/regions/istanbul.service.ts`
// zaten `#shared/utils/istanbul` okuyor. Aynı desen.
//
// BU DOSYA ÇERÇEVESİZ. Vue, Nuxt, Prisma, tarayıcı API'si yok — yalnız
// saf fonksiyonlar. Fiyat ARİTMETİĞİ de burada değil: sunucunun tutar
// hesaplamaya ihtiyacı yok (bkz. `devirOzeti` notu), aritmetik
// `app/utils/fiyat.ts`te kalıyor.
//
// ─────────────────────────────────────────────────────────────────────────
// ADRESTE NE TAŞINIYOR — YALNIZ GİRDİLER
//
// Alt/üst tutar, ara toplam, taban fiyat ve çarpan TAŞINMIYOR. İstemciden
// gelen bir rakama fiyat diye güvenmek, adres satırını düzenleyen herkese
// ekrandaki tutarı yazdırmak olurdu. Ad, telefon, e-posta, adres ve
// serbest metin de adres satırına ASLA konmuyor.
//
// ─────────────────────────────────────────────────────────────────────────
// HEPSİ YA DA HİÇBİRİ
//
// Sekiz alandan biri eksik ya da geçersizse devir tamamen reddediliyor.
// "Kalanla devam etmek" cazip ama yanlış: eksik `paketleme` "paketleme
// yok" diye okunur ve kullanıcının seçmediği bir yapılandırma görünürdü.

/** Devrin kaynağını işaretleyen değer — allowlist'in kendisi. */
export const DEVIR_KAYNAGI = 'fiyat-hesaplama'

/** Devrin indiği sayfa. */
export const DEVIR_HEDEFI = '/iletisim'

/**
 * Talep kaydına yazılacak kaynak adresi.
 *
 * SABİT: adres satırından gelen hiçbir değer bu alana akmıyor.
 */
export const DEVIR_KAYNAK_SAYFASI = '/fiyat-hesaplama'

/**
 * Kat alanının kabul ettiği aralık — GİRDİ SÖZLEŞMESİ.
 *
 * Üç yer bu iki sayıyı okuyor: formdaki `min`/`max`, hesabın kendi
 * sıkıştırması (`utils/fiyat.ts`) ve devrin doğrulaması (aşağıda). Üçü de
 * buradan okuyor; `fiyat.ts` bunları yeniden dışa veriyor, o yüzden eski
 * içe aktarmalar bozulmadı.
 */
export const KAT_EN_AZ = 0
export const KAT_EN_COK = 30

/** Hesaplayıcının sekiz girdisi. */
export interface DevirGirdisi {
  odaId: number
  mesafeId: number
  cikisKat: number
  cikisAsansor: boolean
  varisKat: number
  varisAsansor: boolean
  paketleme: boolean
  depolama: boolean
}

/** Panelden gelen bir ev büyüklüğü kaydının okunan kısmı. */
export interface DevirOdasi {
  id: number
  ad: string
}

/** Panelden gelen bir mesafe kademesinin okunan kısmı. */
export interface DevirMesafesi {
  id: number
  ad: string
}

/** Etiketleri çözülmüş devir. Tutar BURADA YOK — bkz. dosya başlığı. */
export interface DevirEtiketleri {
  girdi: DevirGirdisi
  odaAdi: string
  mesafeAdi: string
}

/** Adres satırındaki anahtarlar — okuma ve yazma aynı listeyi kullanıyor. */
export const DEVIR_ANAHTARLARI = {
  kaynak: 'kaynak',
  oda: 'oda',
  mesafe: 'mesafe',
  cikisKat: 'cikisKat',
  cikisAsansor: 'cikisAsansor',
  varisKat: 'varisKat',
  varisAsansor: 'varisAsansor',
  paketleme: 'paketleme',
  depolama: 'depolama',
} as const

const A = DEVIR_ANAHTARLARI

/** Vue Router `query` değeri: dizi de gelebilir. */
export type SorguDegeri = string | (string | null)[] | null | undefined

/** Diziyi düzleştirip tek dize verir; birden çok değer geldiyse İLKİ. */
const tekDeger = (v: SorguDegeri): string | null => {
  const d = Array.isArray(v) ? v[0] : v
  return typeof d === 'string' ? d : null
}

/**
 * Tam sayı okuma — sıkı.
 *
 * `Number()` bilerek kullanılmadı: boş dize 0, "1e9" 1000000000, " 3 " 3
 * veriyor. Kabul edilen tek biçim işaretsiz ondalık basamaklar.
 */
const tamSayi = (v: SorguDegeri, enAz: number, enCok: number): number | null => {
  const d = tekDeger(v)
  if (d === null || !/^\d{1,3}$/.test(d)) return null
  const n = Number(d)
  return n >= enAz && n <= enCok ? n : null
}

/** Mantıksal okuma — yalnız "1" ve "0". "true"/"on"/"" kabul edilmiyor. */
const mantik = (v: SorguDegeri): boolean | null => {
  const d = tekDeger(v)
  if (d === '1') return true
  if (d === '0') return false
  return null
}

/**
 * Adres satırını (ya da aynı biçimdeki bir gövde nesnesini) GİRDİYE
 * çevirir — biçim doğrulaması.
 *
 * Kimlik değerlerinin GERÇEKTEN var olup olmadığına burada bakılmıyor; o
 * panelin listesini gerektiriyor ve `devirEtiketleriniCoz`ün işi. Ayrım
 * bilinçli: biçim doğrulaması katsayı gerektirmeden test edilebiliyor ve
 * sunucuda da aynı fonksiyon çalışıyor.
 *
 * TANIMADIĞI ANAHTARI HİÇ OKUMUYOR (allowlist). Nesne birleştirme yok,
 * dolayısıyla prototip kirlenmesi de yok.
 */
export function fiyatDevriniOku(
  sorgu: Record<string, SorguDegeri> | null | undefined
): DevirGirdisi | null {
  if (!sorgu || typeof sorgu !== 'object') return null
  if (tekDeger(sorgu[A.kaynak]) !== DEVIR_KAYNAGI) return null

  // Kimlikler yalnız pozitif tam sayı; üst sınır kaydın olabileceğinden
  // bol ama sınırsız değil.
  const odaId = tamSayi(sorgu[A.oda], 1, 999)
  const mesafeId = tamSayi(sorgu[A.mesafe], 1, 999)
  const cikisKat = tamSayi(sorgu[A.cikisKat], KAT_EN_AZ, KAT_EN_COK)
  const varisKat = tamSayi(sorgu[A.varisKat], KAT_EN_AZ, KAT_EN_COK)
  const cikisAsansor = mantik(sorgu[A.cikisAsansor])
  const varisAsansor = mantik(sorgu[A.varisAsansor])
  const paketleme = mantik(sorgu[A.paketleme])
  const depolama = mantik(sorgu[A.depolama])

  if (
    odaId === null ||
    mesafeId === null ||
    cikisKat === null ||
    varisKat === null ||
    cikisAsansor === null ||
    varisAsansor === null ||
    paketleme === null ||
    depolama === null
  ) {
    return null
  }

  return { odaId, mesafeId, cikisKat, cikisAsansor, varisKat, varisAsansor, paketleme, depolama }
}

/**
 * Girdiyi panelin GERÇEK listesine karşı doğrular ve etiketleri çözer.
 *
 * Bilinmeyen bir `odaId` ya da `mesafeId` devri tamamen geçersiz kılıyor:
 * etiketi olmayan bir seçimi "?" diye göstermek ya da ilk seçeneğe düşmek,
 * kullanıcının yapmadığı bir seçimi ona göstermek olurdu.
 *
 * ETİKET İSTEMCİDEN ALINMIYOR. Sunucu bu fonksiyonu kendi veri tabanı
 * kaydıyla çağırıyor; istemcinin gönderdiği hiçbir metne güvenilmiyor.
 */
export function devirEtiketleriniCoz(
  girdi: DevirGirdisi | null,
  odalar: DevirOdasi[] | null | undefined,
  mesafeler: DevirMesafesi[] | null | undefined
): DevirEtiketleri | null {
  if (!girdi) return null
  const oda = odalar?.find((o) => o.id === girdi.odaId)
  const mesafe = mesafeler?.find((m) => m.id === girdi.mesafeId)
  if (!oda || !mesafe) return null
  return { girdi, odaAdi: oda.ad, mesafeAdi: mesafe.ad }
}

/** Hesaplayıcının CTA adresi. Sekiz alan da HER ZAMAN yazılıyor. */
export function fiyatDevriYolu(girdi: DevirGirdisi): string {
  return `${DEVIR_HEDEFI}?${new URLSearchParams(devirAlanlari(girdi)).toString()}`
}

/**
 * Devrin adres/gövde biçimi — dizeler.
 *
 * Talep gönderimi bu nesneyi OLDUĞU GİBİ yolluyor, yani sunucu adres
 * satırıyla BİREBİR aynı biçimi ve aynı doğrulayıcıyı görüyor. İki uçta
 * iki ayrı kodlama olsaydı biri diğerinden sessizce ayrışabilirdi.
 */
export function devirAlanlari(girdi: DevirGirdisi): Record<string, string> {
  return {
    [A.kaynak]: DEVIR_KAYNAGI,
    [A.oda]: String(girdi.odaId),
    [A.mesafe]: String(girdi.mesafeId),
    [A.cikisKat]: String(girdi.cikisKat),
    [A.cikisAsansor]: girdi.cikisAsansor ? '1' : '0',
    [A.varisKat]: String(girdi.varisKat),
    [A.varisAsansor]: girdi.varisAsansor ? '1' : '0',
    [A.paketleme]: girdi.paketleme ? '1' : '0',
    [A.depolama]: girdi.depolama ? '1' : '0',
  }
}

/** "2. kat · asansör var" — özet, mesaj ve kayıt aynı cümleyi kullanıyor. */
export const katCumlesi = (kat: number, asansor: boolean): string =>
  `${kat}. kat · ${asansor ? 'asansör var' : 'asansör yok'}`

/** Seçilen ek hizmetler; hiçbiri seçilmediyse boş dizi. */
export const ekHizmetler = (girdi: DevirGirdisi): string[] => {
  const liste: string[] = []
  if (girdi.paketleme) liste.push('paketleme')
  if (girdi.depolama) liste.push('depolama')
  return liste
}

/** Talep kaydındaki iki bölümün başlıkları. */
export const OZET_BASLIGI = 'Fiyat hesaplama özeti'
export const NOT_BASLIGI = 'Kullanıcı notu'

/**
 * TALEP KAYDINA YAZILAN KANONİK ÖZET.
 *
 * ─────────────────────────────────────────────────────────────────────
 * SUNUCU ÜRETİYOR, İSTEMCİ DEĞİL.
 *
 * Önce bu metin formun mesaj kutusuna ön dolgu olarak konuyordu ve
 * doğruydu — ta ki kullanıcı onu silene kadar. Kutu düzenlenebilir
 * olduğu için `ContactLead.message` kullanıcının gerçekten NE SEÇTİĞİNİ
 * garanti etmiyordu. Artık metni sunucu, doğrulanmış girdilerden ve
 * kendi veri tabanı etiketlerinden üretiyor; kullanıcının kutuya ne
 * yazdığından bağımsız.
 *
 * TUTAR YAZILMIYOR — bilinçli. Kayıt bir TEKLİF değil; tutar zamanla
 * değişen katsayılara bağlı ve kayda düşmüş bir rakam ileride "verilmiş
 * fiyat" gibi okunurdu. Aralık yalnız ekranda, o anki katsayılarla
 * yeniden hesaplanmış hâliyle duruyor.
 */
export function devirOzeti(etiketler: DevirEtiketleri): string {
  const g = etiketler.girdi
  const satirlar = [
    OZET_BASLIGI,
    `- Ev: ${etiketler.odaAdi}`,
    `- Mesafe: ${etiketler.mesafeAdi}`,
    `- Çıkış: ${katCumlesi(g.cikisKat, g.cikisAsansor)}`,
    `- Varış: ${katCumlesi(g.varisKat, g.varisAsansor)}`,
  ]
  const ek = ekHizmetler(g)
  if (ek.length) satirlar.push(`- Ek hizmet: ${ek.join(', ')}`)
  return satirlar.join('\n')
}

/**
 * Kanonik özet ile kullanıcının kendi notunu TEK metne birleştirir.
 *
 * Kullanıcının yazdığı hiçbir şey EZİLMİYOR ve kırpılmıyor; yalnız
 * başına başlığıyla birlikte kanonik özet ekleniyor. Not boşsa o bölüm
 * hiç yazılmıyor — panelde boş bir "Kullanıcı notu" başlığı durmasın.
 */
export function devirliMesaj(ozet: string, kullaniciNotu: string): string {
  const not = String(kullaniciNotu ?? '').trim()
  return not ? `${ozet}\n\n${NOT_BASLIGI}\n${not}` : ozet
}
