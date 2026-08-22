// server/domain/internal-page/internal-page.service.ts
//
// İÇ SAYFA İÇERİĞİ — TEK OKUMA, TEK YAZMA.
//
// Ana sayfanın M4'teki karşılığıyla (server/domain/home) aynı desen. Fark:
// burada birden çok sayfa var, o yüzden okuma `pageKey` ile daraltılıyor.
//
// İKİ DEĞİŞMEZ:
//
//   1. ANAHTAR KAPALI KÜME. Bilinmeyen `pageKey`/`sectionKey` reddediliyor.
//      Aksi hâlde panel üzerinden yeni "sayfa" ya da "bölüm" üretilebilirdi;
//      karşılığı olan bileşen kodda yoksa kayıt hiçbir şey yapmaz, yalnız
//      yanıltıcı bir yönetim yüzeyi olur.
//
//   2. ÖĞE SAYISI SABİT. Dört ölçüm dört ölçümdür; beşincisi ızgarayı
//      bozar. Fazlası KIRPILMIYOR, işlem REDDEDİLİYOR — sessiz kırpma
//      yöneticiye "kaydedildi" der ve girdiğini göstermez.
import { getSafeErrorMessage } from '../../utils/prismaError.ts'
import { ok, fail, type ServiceResult } from '../shared/response.ts'
import { internalPageRepository } from './internal-page.repository.ts'
import {
  IC_SAYFALAR,
  IC_SAYFA_ANAHTARLARI,
  icSayfaAnahtariMi,
  icBolumAnahtariMi,
  type IcSayfaAnahtari,
} from '../../../shared/utils/ic-sayfa.ts'

export interface IcBolumOgesi {
  label: string | null
  title: string | null
  body: string | null
  note: string | null
  imagePath: string | null
  imageAlt: string | null
}

export interface IcBolum {
  heading: string | null
  lead: string | null
  note: string | null
  closing: string | null
  imagePath: string | null
  imageAlt: string | null
  items: IcBolumOgesi[]
}

/** Kayıt yoksa boş bölüm — bileşen `v-if` ile alanı atlıyor. */
const BOS_BOLUM = (): IcBolum => ({
  heading: null,
  lead: null,
  note: null,
  closing: null,
  imagePath: null,
  imageAlt: null,
  items: [],
})

const metin = (deger: unknown): string | null => {
  const s = String(deger ?? '').trim()
  return s === '' ? null : s
}

const bolumeCevir = (kayit: any): IcBolum => ({
  heading: metin(kayit.heading),
  lead: metin(kayit.lead),
  note: metin(kayit.note),
  closing: metin(kayit.closing),
  imagePath: metin(kayit.imagePath),
  imageAlt: metin(kayit.imageAlt),
  items: (kayit.items ?? []).map((o: any) => ({
    label: metin(o.label),
    title: metin(o.title),
    body: metin(o.body),
    note: metin(o.note),
    imagePath: metin(o.imagePath),
    imageAlt: metin(o.imageAlt),
  })),
})

/**
 * Tek sayfanın içeriği — TEK sorgu.
 *
 * Yanıt her zaman sözleşmedeki BÜTÜN bölümleri taşıyor; kaydı olmayan bölüm
 * boş dönüyor. Böylece bileşen "alan var mı" diye tek biçimde sorabiliyor ve
 * eksik kayıt sayfayı çökertmiyor.
 *
 * BİLİNMEYEN ANAHTAR YANITTAN DÜŞÜYOR: tabloya elle bir satır eklenirse
 * sayfa onu görmezden geliyor — bileşeni yok zaten.
 */
async function getPage(pageKey: string): Promise<ServiceResult<Record<string, IcBolum>>> {
  try {
    if (!icSayfaAnahtariMi(pageKey)) {
      return fail(
        `Bilinmeyen sayfa: "${pageKey}". Geçerli sayfalar: ${IC_SAYFA_ANAHTARLARI.join(', ')}.`
      )
    }

    const kayitlar = await internalPageRepository.findPage(pageKey)
    const tanim = IC_SAYFALAR[pageKey]

    const bolumler = Object.fromEntries(
      Object.keys(tanim.bolumler).map((anahtar) => {
        const kayit = kayitlar.find((k) => k.sectionKey === anahtar)
        return [anahtar, kayit ? bolumeCevir(kayit) : BOS_BOLUM()]
      })
    )

    return ok(bolumler)
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

/** Yönetim panelinin okuması — bütün sayfalar, sözleşme sırasıyla. */
async function getForAdmin(): Promise<ServiceResult<any>> {
  try {
    const kayitlar = await internalPageRepository.findAll()

    // Sıra sözleşmedeki gerçek sıra: panelde sayfalar ve bölümler sayfayı
    // okur gibi görünüyor, id sırasına göre değil.
    const sayfalar = IC_SAYFA_ANAHTARLARI.map((sayfa) => ({
      pageKey: sayfa,
      bolumler: Object.keys(IC_SAYFALAR[sayfa].bolumler).map((bolum) => {
        const kayit = kayitlar.find((k) => k.pageKey === sayfa && k.sectionKey === bolum)
        return kayit ?? { pageKey: sayfa, sectionKey: bolum, items: [] }
      }),
    }))

    return ok(sayfalar)
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

export interface IcBolumGirdisi {
  pageKey: string
  sectionKey: string
  heading?: string
  lead?: string
  note?: string
  closing?: string
  imagePath?: string
  imageAlt?: string
  items?: {
    label?: string
    title?: string
    body?: string
    note?: string
    imagePath?: string
    imageAlt?: string
  }[]
}

async function update(body: IcBolumGirdisi): Promise<ServiceResult<any>> {
  try {
    if (!icSayfaAnahtariMi(body.pageKey)) {
      return fail(
        `Bilinmeyen sayfa: "${body.pageKey}". Geçerli sayfalar: ${IC_SAYFA_ANAHTARLARI.join(', ')}.`
      )
    }
    if (!icBolumAnahtariMi(body.pageKey, body.sectionKey)) {
      const gecerli = Object.keys(IC_SAYFALAR[body.pageKey as IcSayfaAnahtari].bolumler)
      return fail(
        `"${IC_SAYFALAR[body.pageKey as IcSayfaAnahtari].ad}" sayfasında ` +
          `"${body.sectionKey}" diye bir bölüm yok. Geçerli bölümler: ${gecerli.join(', ')}.`
      )
    }

    const tanim = IC_SAYFALAR[body.pageKey as IcSayfaAnahtari].bolumler[body.sectionKey]
    const ogeler = body.items ?? []

    if (ogeler.length !== tanim.ogeSayisi) {
      return fail(
        `"${tanim.ad}" bölümü tam ${tanim.ogeSayisi} öğe taşır; ${ogeler.length} öğe gönderildi. ` +
          'Öğe sayısı tasarımın parçası ve panelden değiştirilemez.'
      )
    }

    const kayit = await internalPageRepository.upsertSection(
      body.pageKey,
      body.sectionKey,
      {
        heading: metin(body.heading),
        lead: metin(body.lead),
        note: metin(body.note),
        closing: metin(body.closing),
        imagePath: metin(body.imagePath),
        imageAlt: metin(body.imageAlt),
      },
      ogeler.map((o) => ({
        label: metin(o.label),
        title: metin(o.title),
        body: metin(o.body),
        note: metin(o.note),
        imagePath: metin(o.imagePath),
        imageAlt: metin(o.imageAlt),
      }))
    )

    return ok(kayit, `"${tanim.ad}" bölümü güncellendi.`)
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

export const internalPageService = { getPage, getForAdmin, update }
