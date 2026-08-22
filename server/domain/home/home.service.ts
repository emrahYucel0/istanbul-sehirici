// server/domain/home/home.service.ts
//
// ANA SAYFA İÇERİĞİ — TEK OKUMA, TEK YAZMA.
//
// ─────────────────────────────────────────────────────────────────────────
// ÜÇ KAYNAK, TEK YANIT
//
// Ana sayfa üç ayrı yerden besleniyor ve bu ayrım bilinçli:
//
//   KONTROLLÜ İÇERİK   `HomeSection` — yalnız bu sayfaya ait editoryal
//                      metin ve görseller.
//   DOMAIN KAYNAĞI     `Service` (hizmet defteri), `ProcessSection`
//                      (süreç), `FaqSection` (sorular). Bunların kendi
//                      panelleri ve kendi anlamları var; ana sayfa
//                      onları OKUYOR, kopyalamıyor.
//   TÜRETİLMİŞ         İlçe sayıları — `Region` kayıtlarından hesaplanıyor,
//                      hiçbir yerde ikinci kez saklanmıyor. Yorum sayısı ve
//                      puan ortalaması da öyle: onaylı `Testimonial`
//                      kayıtlarından her istekte hesaplanıyorlar.
//   ZİYARETÇİ İÇERİĞİ  `Testimonial` — moderasyondan geçmiş yorumlar. Bu
//                      bölümü ana sayfa YAZMIYOR, yalnız okuyor; yazan
//                      taraf ziyaretçi formu ve Müşteri Yorumları paneli.
//
// Yanıt TEK uç noktadan dönüyor: dokuz bileşen ayrı ayrı istek atsaydı
// sunucu tarafında dokuz turlu bir şelale oluşurdu.
import { getSafeErrorMessage } from '../../utils/prismaError.ts'
import { ok, fail, type ServiceResult } from '../shared/response.ts'
import { homeRepository } from './home.repository.ts'
import { istanbulIlcesiMi, istanbulYakasi } from '../../../shared/utils/istanbul.ts'
import {
  ANASAYFA_ANAHTARLARI,
  ANASAYFA_BOLUMLERI,
  anasayfaAnahtariMi,
  type AnasayfaAnahtari,
} from '../../../shared/utils/anasayfa.ts'

export interface AnasayfaOgesi {
  label: string | null
  subLabel: string | null
  title: string | null
  body: string | null
  imagePath: string | null
  imageAlt: string | null
}

export interface AnasayfaBolumu {
  heading: string | null
  lead: string | null
  note: string | null
  closing: string | null
  closingNote: string | null
  ctaLabel: string | null
  imagePath: string | null
  imageAlt: string | null
  items: AnasayfaOgesi[]
}

export interface IlceSayimi {
  avrupa: number
  anadolu: number
  digerleri: number
  toplam: number
}

export interface AnasayfaHizmeti {
  slug: string
  title: string
  excerpt: string | null
}

export interface AnasayfaSureci {
  heading: string | null
  steps: {
    label: string | null
    title: string
    body: string
    imagePath: string | null
    imageAlt: string | null
    linkLabel: string | null
    linkHref: string | null
  }[]
}

export interface AnasayfaSorulari {
  heading: string | null
  items: { question: string; answer: string }[]
}

/**
 * YORUM BÖLÜMÜ — GÖSTERİLEN LİSTE VE SAYAÇ AYRI.
 *
 * `items` ana sayfada basılan sınırlı liste; `adet` public'e uygun
 * kayıtların TAMAMI. İkisini tek sayıya indirmek "6 yorum" gibi yanlış bir
 * ifade üretirdi. `ortalama` yalnız ekran için — hiçbir yapısal veriye
 * dönüşmüyor (bkz. app/pages/index.vue).
 */
export interface AnasayfaYorumlari {
  items: { id: number; ad: string; puan: number; metin: string; tarih: string }[]
  ortalama: number | null
  adet: number
}

export interface AnasayfaVerisi {
  bolumler: Record<AnasayfaAnahtari, AnasayfaBolumu>
  ilceler: IlceSayimi
  hizmetler: AnasayfaHizmeti[]
  surec: AnasayfaSureci
  sorular: AnasayfaSorulari
  yorumlar: AnasayfaYorumlari
}

/** Boş bölüm — kayıt yoksa bileşen `v-if` ile alanı atlıyor. */
const BOS_BOLUM = (): AnasayfaBolumu => ({
  heading: null,
  lead: null,
  note: null,
  closing: null,
  closingNote: null,
  ctaLabel: null,
  imagePath: null,
  imageAlt: null,
  items: [],
})

const metin = (deger: unknown): string | null => {
  const s = String(deger ?? '').trim()
  return s === '' ? null : s
}

/**
 * İLÇE SAYIMI — TÜRETİLMİŞ, SAKLANMIYOR.
 *
 * Kapsam bölümü "25 / 14 / 39" basıyordu ve sayılar bileşende sabitti.
 * Bileşenin kendi yorumu sebebini yazıyordu: o gün `Region` tablosu bu
 * bilgiyi türetmeye uygun değildi (aktif kayıtların çoğu eski markanın
 * şehirleriydi). M1'den sonra durum değişti — 39 İstanbul ilçesi kaydı
 * var ve `istanbulIlcesiMi` sınıflandırmanın tek kaynağı.
 *
 * SEMANTİK: YAYIN DURUMUNA BAKILMIYOR.
 *
 * Sayı bir KAPSAM iddiası ("İstanbul'un tamamında çalışıyoruz"), yayındaki
 * sayfa sayısı değil. `/bolgelerimiz` dizini de aynı semantiği kullanıyor:
 * 39 ilçenin tamamını gösteriyor, yayında olmayanları bağlantısız basıyor.
 * Yayına göre süzülseydi bir ilçe yayından kaldırıldığında ana sayfadaki
 * kapsam iddiası sessizce küçülürdü.
 */
function ilceleriSay(bolgeler: { slug: string | null; cities: unknown }[]): IlceSayimi {
  const ilceler = bolgeler.filter((b) => istanbulIlcesiMi(b as any))
  let avrupa = 0
  let anadolu = 0
  let digerleri = 0

  for (const ilce of ilceler) {
    const yaka = istanbulYakasi(ilce.slug ?? undefined)
    if (yaka?.anahtar === 'avrupa') avrupa += 1
    else if (yaka?.anahtar === 'anadolu') anadolu += 1
    // Yaka eşlemesinde olmayan bir ilçe SESSİZCE KAYBOLMUYOR: toplama
    // giriyor ve ayrı sayılıyor (bkz. shared/utils/istanbul.ts).
    else digerleri += 1
  }

  return { avrupa, anadolu, digerleri, toplam: ilceler.length }
}

/** Herkese açık ana sayfa verisi — tek çağrı, altı paralel sorgu. */
async function get(): Promise<ServiceResult<AnasayfaVerisi>> {
  try {
    const [bolumKayitlari, hizmetler, bolgeler, surec, sss, [yorumKayitlari, yorumSayimi]] =
      await Promise.all([
        homeRepository.findAllSections(),
        homeRepository.findActiveServices(),
        homeRepository.findRegionsForScope(),
        homeRepository.findProcess(),
        homeRepository.findFaq(),
        homeRepository.findReviews(),
      ])

    // BİLİNMEYEN ANAHTAR YANITTAN DÜŞÜYOR. Tabloya elle bir satır
    // eklenirse ana sayfa onu görmezden geliyor; bileşeni yok zaten.
    const bolumler = Object.fromEntries(
      ANASAYFA_ANAHTARLARI.map((anahtar) => {
        const kayit = bolumKayitlari.find((b) => b.sectionKey === anahtar)
        if (!kayit) return [anahtar, BOS_BOLUM()]
        return [
          anahtar,
          {
            heading: metin(kayit.heading),
            lead: metin(kayit.lead),
            note: metin(kayit.note),
            closing: metin(kayit.closing),
            closingNote: metin(kayit.closingNote),
            ctaLabel: metin(kayit.ctaLabel),
            imagePath: metin(kayit.imagePath),
            imageAlt: metin(kayit.imageAlt),
            items: kayit.items.map((o) => ({
              label: metin(o.label),
              subLabel: metin(o.subLabel),
              title: metin(o.title),
              body: metin(o.body),
              imagePath: metin(o.imagePath),
              imageAlt: metin(o.imageAlt),
            })),
          },
        ]
      })
    ) as Record<AnasayfaAnahtari, AnasayfaBolumu>

    return ok({
      bolumler,
      ilceler: ilceleriSay(bolgeler),
      hizmetler: hizmetler
        .filter((h) => h.slug)
        .map((h) => ({ slug: String(h.slug), title: h.title, excerpt: metin(h.excerpt) })),
      surec: {
        heading: metin(surec?.mainTitle),
        steps: (surec?.steps ?? []).map((a) => ({
          label: metin(a.label),
          title: a.title,
          body: a.description,
          imagePath: metin(a.imagePath),
          imageAlt: metin(a.imageAlt),
          linkLabel: metin(a.linkLabel),
          linkHref: metin(a.linkHref),
        })),
      },
      sorular: {
        heading: metin(sss?.mainTitle),
        items: (sss?.faqs ?? []).map((s) => ({ question: s.question, answer: s.answer })),
      },
      /**
       * YALNIZ EKRANDA GÖRÜNEN ALANLAR TAŞINIYOR.
       *
       * `email`, `isApproved`, `source`, `location`, `serviceType` ve
       * `customerImage` bu yanıta HİÇ girmiyor. İlk üçü zaten herkese açık
       * beyaz listede yok; kalanlar var ama ana sayfa onları basmıyor —
       * basılmayan alanı ağdan geçirmenin tek etkisi sızma yüzeyini
       * büyütmek olurdu.
       *
       * Tarih ISO metne çevriliyor: yanıt JSON, `Date` zaten metne
       * dönüşecek; burada dönüştürmek sözleşmeyi açık hâle getiriyor.
       */
      yorumlar: {
        items: yorumKayitlari.map((y) => ({
          id: y.id,
          ad: y.customerName,
          puan: y.rating,
          metin: y.comment,
          tarih: y.date.toISOString(),
        })),
        ortalama: yorumSayimi._avg.rating ? Number(yorumSayimi._avg.rating.toFixed(1)) : null,
        adet: yorumSayimi._count._all,
      },
    })
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

export interface AnasayfaBolumGirdisi {
  sectionKey: string
  heading?: string
  lead?: string
  note?: string
  closing?: string
  closingNote?: string
  ctaLabel?: string
  imagePath?: string
  imageAlt?: string
  items?: {
    label?: string
    subLabel?: string
    title?: string
    body?: string
    imagePath?: string
    imageAlt?: string
  }[]
}

/** Yönetim panelinin okuması — süzgeç yok, ham bölüm listesi. */
async function getForAdmin(): Promise<ServiceResult<any[]>> {
  try {
    const kayitlar = await homeRepository.findAllSections()
    // Sıra sayfadaki gerçek sırayla: panelde bölümler sayfayı okur gibi
    // görünüyor, id sırasına göre değil.
    const sirali = ANASAYFA_ANAHTARLARI.map((anahtar) => {
      const kayit = kayitlar.find((b) => b.sectionKey === anahtar)
      return kayit ?? { sectionKey: anahtar, items: [] }
    })
    return ok(sirali)
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

/**
 * Tek bölümü günceller.
 *
 * İKİ DEĞİŞMEZ BURADA KORUNUYOR:
 *
 *   1. ANAHTAR KAPALI KÜME. Bilinmeyen `sectionKey` reddediliyor — aksi
 *      hâlde panel üzerinden yeni "bölüm" üretilebilir, yani bir sayfa
 *      oluşturucuya dönüşürdü. Bölümün karşılığı olan bileşen kodda yoksa
 *      kayıt hiçbir şey yapmaz, yalnız yanıltıcı bir yönetim yüzeyi olur.
 *
 *   2. ÖĞE SAYISI SABİT. Üç sahne üç sahnedir; dördüncüsü ızgarayı bozar.
 *      Fazlası kırpılmıyor, işlem REDDEDİLİYOR — sessiz kırpma yöneticiye
 *      "kaydedildi" der ve girdiğini göstermez.
 */
async function update(body: AnasayfaBolumGirdisi): Promise<ServiceResult<any>> {
  try {
    if (!anasayfaAnahtariMi(body.sectionKey)) {
      return fail(
        `Bilinmeyen ana sayfa bölümü: "${body.sectionKey}". ` +
          `Geçerli bölümler: ${ANASAYFA_ANAHTARLARI.join(', ')}.`
      )
    }

    const tanim = ANASAYFA_BOLUMLERI[body.sectionKey]
    const ogeler = body.items ?? []

    if (ogeler.length !== tanim.ogeSayisi) {
      return fail(
        `"${tanim.ad}" bölümü tam ${tanim.ogeSayisi} öğe taşır; ${ogeler.length} öğe gönderildi. ` +
          'Öğe sayısı tasarımın parçası ve panelden değiştirilemez.'
      )
    }

    const kayit = await homeRepository.upsertSection(
      body.sectionKey,
      {
        heading: metin(body.heading),
        lead: metin(body.lead),
        note: metin(body.note),
        closing: metin(body.closing),
        closingNote: metin(body.closingNote),
        ctaLabel: metin(body.ctaLabel),
        imagePath: metin(body.imagePath),
        imageAlt: metin(body.imageAlt),
      },
      ogeler.map((o) => ({
        label: metin(o.label),
        subLabel: metin(o.subLabel),
        title: metin(o.title),
        body: metin(o.body),
        imagePath: metin(o.imagePath),
        imageAlt: metin(o.imageAlt),
      }))
    )

    return ok(kayit, `"${tanim.ad}" bölümü güncellendi.`)
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

export const homeService = { get, getForAdmin, update }
