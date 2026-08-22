// server/domain/regions/regions.service.ts
import { getSafeErrorMessage } from '../../utils/prismaError.ts'
import { ok, fail, type ServiceResult } from '../shared/response.ts'
import { regionsRepository } from './regions.repository.ts'
import { sanitizeContentFields } from '../../utils/sanitizeHtml.ts'
// Sınıflandırmanın tek kaynağı; public sayfa ve mahalle servisi de aynı
// işlevi okuyor. Göreli ve uzantılı yol: `prisma/ilce-yayina-al.mjs` bu
// servisi doğrudan import ediyor ve düz Node alias çözemiyor.
import {
  istanbulIlcesiMi,
  ISTANBUL_PLAKA,
  ISTANBUL_IL_SLUG,
} from '../../../shared/utils/istanbul.ts'
import { ilceKapisi, type IlceKapiSonucu } from './district.gate.ts'
import { kokYolunuNormallestir, kokYoluDenetle } from '../shared/root-paths.ts'

export interface PriceFactorInput {
  factor?: string
  min?: string
  max?: string
}

export interface RegionInput {
  /**
   * Düzenlenen kaydın birincil anahtarı — YALNIZ güncellemede.
   * Adres değişebildiği için kimlik slug olamaz (bkz. posts.service.ts'teki
   * aynı gerekçe).
   */
  id?: number
  title?: string
  subtitle?: string
  shortTitle?: string
  slug: string
  content?: string
  excerpt?: string
  metaTitle?: string
  metaDescription?: string
  image?: string
  imageAlt?: string
  isActive?: boolean
  cities?: number[]
  priceFactorsTitle?: string
  priceFactorsImage?: string
  priceFactors?: PriceFactorInput[]
  /** Mahalle adları — yerel arama karşılığı için. */
  neighborhoods?: string[]
  /** Bölge künyesi satırları. */
  facts?: { label?: string; value?: string }[]
  /** Bölgeye özgü sık sorulanlar; FAQPage yapısal verisini besler. */
  faqs?: { question?: string; answer?: string }[]
  /** Sık taşınılan güzergâhlar; hedef slug'ı render sırasında çözülür. */
  routes?: { to?: string; note?: string }[]
}

/**
 * YÖNETİM KAPSAMI — AYNI TABLO, İKİ FARKLI İŞ.
 *
 * `Region` tablosu iki ayrı şeyi taşıyor ve yönetimde ikisi aynı iş değil:
 *
 *   istanbul  39 İstanbul ilçesi. M2 sonrası kalite kapısı, açık
 *             yayınla/geri çek eylemi ve aktif mahalle koruması var.
 *   legacy    Eski markadan devralınan 336 kayıt (335 şehir/bölge + İL
 *             sayfasının kendisi). Eski yayın davranışını kullanıyorlar.
 *
 * Panelde tek bir 375 satırlık karma liste, İstanbul ilçelerini eski
 * kayıtların içinde gömüyordu. Süzgeç SUNUCUDA: 375 kaydı istemciye çekip
 * orada ayırmak, her açılışta gereksiz veri taşımak olurdu.
 */
export type RegionKapsam = 'istanbul' | 'legacy'

export interface RegionGetOptions {
  slug?: string
  cityId?: number
  includeInactive: boolean
  light?: boolean
  page?: number
  pageSize?: number
  kapsam?: RegionKapsam
}

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

/**
 * Güncellemede bir METİN alanının nasıl yazılacağını belirler:
 *
 *   alan istekte YOKSA   → undefined  (Prisma dokunmaz, mevcut veri korunur)
 *   BOŞ gönderildiyse    → null       (alan temizlenir)
 *   dolu gönderildiyse   → değerin kendisi (kırpılmadan)
 *
 * Önceden burada `?? null` vardı ve bu, ALANI HİÇ TAŞIMAYAN kısmi bir PUT'un
 * metin alanlarını sessizce silmesine yol açıyordu — nitekim bir kez sildi.
 * Panel her zaman tam form gönderdiği için canlı davranış değişmiyor: panel
 * temizlenen alanı '' olarak yolluyor, o da aşağıda null'a çevriliyor.
 *
 * Boşu '' değil null'a çevirmenin sebebi: kayıtların geri kalanı ve tohum
 * betikleri null kullanıyor. İki gösterim bir arada durursa "boş mu?" diye
 * soran her kodun ikisini de bilmesi gerekir.
 */
function metinAlani(deger?: string | null): string | null | undefined {
  if (deger === undefined) return undefined
  if (deger === null) return null
  return deger.trim() === '' ? null : deger
}

// page verilmezse (mevcut tüm tüketiciler) davranış öncekiyle birebir aynı
// kalır — bare bir dizi döner. Sadece `page` açıkça istendiğinde
// {items,total,page,pageSize,totalPages} zarfına geçilir (bkz. posts.service.ts
// içindeki aynı gerekçe).
async function get(options: RegionGetOptions): Promise<ServiceResult<any>> {
  try {
    if (options.slug) {
      const whereClause: any = { slug: options.slug }
      if (!options.includeInactive) whereClause.isActive = true
      const region = await regionsRepository.findUnique(whereClause)
      if (!region) return fail('Bölge bulunamadı veya erişim izni yok')
      return ok(sanitizeContentFields(region))
    }

    const whereClause: any = {}
    if (options.cityId !== undefined) {
      // NOT: orijinal kodda burada `path: ['cities']` vardı (PostgreSQL sözdizimi) —
      // ama `cities` alanının kendisi zaten dizi, MySQL'de bu path'i vermek
      // Prisma hatası fırlatıyordu ("Expected String, provided (String)"), yani
      // bu filtre hiç çalışmıyordu. `path` olmadan `array_contains` MySQL'de
      // JSON dizi alanının kökünde doğru şekilde çalışıyor (canlı doğrulandı).
      whereClause.cities = { array_contains: options.cityId }
    }
    if (!options.includeInactive) whereClause.isActive = true

    // KAPSAM SÜZGECİ — sınıflandırma TEK KAYNAKTAN.
    //
    // `istanbulIlcesiMi` kuralı "cities dizisi 34 içeriyor VE slug
    // 'istanbul' değil". İlk yarısı veri tabanında süzülebiliyor
    // (`array_contains`), ikinci yarısı ise slug karşılaştırması —
    // ikisi birlikte tek `where` içinde ifade ediliyor. Panelde ayrı bir
    // "39 ilçe" listesi TUTULMUYOR; kural sunucu, public sayfa ve panel
    // için aynı yerden geliyor (bkz. shared/utils/istanbul.ts).
    if (options.kapsam === 'istanbul') {
      whereClause.cities = { array_contains: ISTANBUL_PLAKA }
      whereClause.slug = { not: ISTANBUL_IL_SLUG }
    } else if (options.kapsam === 'legacy') {
      // Legacy = İstanbul ilçesi OLMAYAN her şey. İL sayfasının kendisi de
      // buraya giriyor: o bir ilçe değil ve M2 kapısı ona uygulanmıyor.
      whereClause.NOT = {
        AND: [
          { cities: { array_contains: ISTANBUL_PLAKA } },
          { slug: { not: ISTANBUL_IL_SLUG } },
        ],
      }
    }

    if (options.page) {
      const page = Math.max(1, options.page)
      const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, options.pageSize || DEFAULT_PAGE_SIZE))
      const [items, total] = await Promise.all([
        regionsRepository.findMany(whereClause, { light: options.light, take: pageSize, skip: (page - 1) * pageSize }),
        regionsRepository.count(whereClause),
      ])
      return ok(sanitizeContentFields({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }))
    }

    return ok(sanitizeContentFields(await regionsRepository.findMany(whereClause, { light: options.light })))
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function create(body: RegionInput): Promise<ServiceResult<any>> {
  try {
    // KÖK AD ALANI DENETİMİ. Yeni bölge pasif başlasa da adres rezerve
    // ediliyor (bkz. root-paths.ts) — bu yüzden denetim yayın anına
    // ertelenmiyor.
    const cakisma = await kokYoluDenetle(body.slug)
    if (cakisma) return fail(cakisma.message)

    const region = await regionsRepository.create({
      title: body.title,
      subtitle: body.subtitle || null,
      shortTitle: body.shortTitle || null,
      slug: body.slug,
      content: body.content || null,
      excerpt: body.excerpt || null,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      image: body.image || null,
      imageAlt: body.imageAlt || null,
      // Yeni bir İstanbul ilçesi HER ZAMAN pasif başlar: yayın kapıdan
      // geçer. Legacy kayıtlarda mevcut davranış (varsayılan false) aynen
      // korunuyor.
      isActive: istanbulIlcesiMi({ slug: body.slug, cities: body.cities }) ? false : body.isActive ?? false,
      cities: body.cities || [],
      priceFactorsTitle: body.priceFactorsTitle || null,
      priceFactorsImage: body.priceFactorsImage || null,
      priceFactors: body.priceFactors || [],
      neighborhoods: body.neighborhoods || [],
      facts: body.facts || [],
      faqs: body.faqs || [],
      routes: body.routes || [],
    })
    return ok(region)
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function update(body: RegionInput): Promise<KapiliBolgeSonucu<any>> {
  try {
    // İSTANBUL İLÇESİ Mİ — kayıt üzerinden, gövdeye güvenmeden.
    // Kimlik `id` ise adres değişikliği ifade edilebiliyor; `id` yoksa
    // (eski çağrılar) davranış öncekiyle aynı: slug hem kimlik hem adres.
    const mevcut: any = body.id
      ? await regionsRepository.findUnique({ id: body.id })
      : await regionsRepository.findUnique({ slug: body.slug })
    if (!mevcut) return fail(`'${body.slug}' için kayıt bulunamadı.`)

    const ilce = istanbulIlcesiMi(mevcut)

    const yeniYol = kokYolunuNormallestir(body.slug)
    const adresDegisti = yeniYol !== mevcut.slug

    if (adresDegisti) {
      // YAYINDAKİ ADRES DEĞİŞTİRİLEMEZ — İSTANBUL İLÇESİ YA DA LEGACY,
      // FARK ETMEZ. İkisi de kök adreste yayınlanıyor; yönlendirme sistemi
      // olmadığı için değişiklik canlı bir URL'yi 404'e düşürür.
      if (mevcut.isActive) {
        return fail(
          'Yayındaki bir bölgenin adresi doğrudan değiştirilemez. ' +
            `Önce yayından kaldırın, sonra /${mevcut.slug} adresini değiştirin.`
        )
      }

      const cakisma = await kokYoluDenetle(yeniYol, { mevcutYol: mevcut.slug })
      if (cakisma) return fail(cakisma.message)
    }

    if (ilce && mevcut.isActive) {
      // YAYINDAKİ İLÇE KORUMASI.
      //
      // Aksi hâlde "önce geçerli içerikle yayına al, sonra metaDescription'ı
      // boşalt" yolu kapıyı tamamen anlamsız kılardı. Sessiz yayından
      // kaldırma YAPILMIYOR: yönetici neyin kaldığını görüp düzeltsin.
      const aday = { ...mevcut, ...temizGovde(body) }
      const kapi = await ilceKapisiniCalistir(aday)
      if (!kapi.gecti) {
        return {
          success: false,
          error:
            'Bu ilçe yayında ve değişiklik kalite kapısının altına düşürüyor: ' +
            kapi.hatalar.join(' · '),
          kapi,
        }
      }
    }

    const region = await regionsRepository.update(mevcut.slug, {
      // Adres yalnız gerçekten değiştiyse yazılıyor.
      ...(adresDegisti ? { slug: yeniYol } : {}),
      title: body.title,
      subtitle: metinAlani(body.subtitle),
      shortTitle: metinAlani(body.shortTitle),
      content: metinAlani(body.content),
      excerpt: metinAlani(body.excerpt),
      metaTitle: metinAlani(body.metaTitle),
      metaDescription: metinAlani(body.metaDescription),
      image: metinAlani(body.image),
      imageAlt: metinAlani(body.imageAlt),
      // YAYIN DURUMU İSTANBUL İLÇELERİNDE GÖVDEDEN YAZILMIYOR.
      //
      // Panelde bir onay kutusu on maddelik kalite kapısını tek tıkla
      // geçersiz kılıyordu. İlçe yayını artık ayrı bir eylem
      // (POST /api/regions-yayin). İstanbul DIŞI 336 legacy kayıtta
      // davranış DEĞİŞMEDİ: onların kapısı yok ve mevcut onay kutusu
      // çalışmaya devam ediyor.
      isActive: ilce ? undefined : body.isActive ?? undefined,
      cities: body.cities ?? undefined,
      priceFactorsTitle: metinAlani(body.priceFactorsTitle),
      priceFactorsImage: metinAlani(body.priceFactorsImage),
      priceFactors: body.priceFactors ?? undefined,
      // `?? undefined` bilinçli: panel bu alanları göndermezse mevcut veri
      // KORUNUR. `?? null` yazılsaydı, bu alanları taşımayan eski bir istek
      // (ör. başka bir panel bölümünden gelen kısmi güncelleme) doldurduğumuz
      // tüm derinlik içeriğini sessizce silerdi.
      neighborhoods: body.neighborhoods ?? undefined,
      facts: body.facts ?? undefined,
      faqs: body.faqs ?? undefined,
      routes: body.routes ?? undefined,
    })
    return ok(region)
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

/**
 * Kapı raporu taşıyabilen yanıt zarfı — mahalle servisindeki `KapiliSonuc`
 * ile aynı gerekçe: panel "yayın başarısız" değil, hangi kuralın kaldığını
 * görmeli.
 */
export type KapiliBolgeSonucu<T> =
  | { success: true; data: T; message?: string; kapi?: IlceKapiSonucu }
  | { success: false; error: string; kapi?: IlceKapiSonucu }

/** Güncelleme gövdesinden kapının okuduğu alanlar — tanımsızlar atlanıyor. */
function temizGovde(body: RegionInput): Record<string, unknown> {
  const alanlar = ['title', 'subtitle', 'excerpt', 'content', 'metaDescription', 'imageAlt', 'neighborhoods', 'faqs'] as const
  const cikti: Record<string, unknown> = {}
  for (const alan of alanlar) {
    const deger = (body as any)[alan]
    if (deger !== undefined) cikti[alan] = deger
  }
  return cikti
}

/**
 * Kapı bağlamını bir kez yükler ve adayı değerlendirir.
 *
 * Benzersizlik sayaç tabanlı: kaydın kendi açıklaması sayaca dahil olduğu
 * için aday aynı açıklamayı koruyorsa bir tanesi kendisidir.
 */
async function ilceKapisiniCalistir(aday: any): Promise<IlceKapiSonucu> {
  const hepsi = (await regionsRepository.findForDistrictGate()) as any[]
  const sayac = new Map<string, number>()
  for (const r of hepsi) {
    if (!istanbulIlcesiMi(r)) continue
    const a = String(r.metaDescription ?? '').trim()
    if (a) sayac.set(a, (sayac.get(a) || 0) + 1)
  }
  const kendiAciklamasi = String(
    hepsi.find((r) => r.slug === aday.slug)?.metaDescription ?? ''
  ).trim()

  return ilceKapisi(aday, {
    aciklamaTekrarEdiyorMu: (a) => (sayac.get(a) || 0) > (a === kendiAciklamasi ? 1 : 0),
  })
}

/** Tek ilçenin kapı durumu — panel "YAYINA HAZIRLIK" listesini bundan basıyor. */
async function districtGateStatus(slug: string): Promise<ServiceResult<IlceKapiSonucu>> {
  try {
    const kayit: any = await regionsRepository.findUnique({ slug })
    if (!kayit) return fail('Bölge bulunamadı')
    return ok(await ilceKapisiniCalistir(kayit))
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

/**
 * BÜTÜN İstanbul ilçelerinin kapı durumu — TEK bağlam yüklemesiyle.
 *
 * `prisma/ilce-yayina-al.mjs` bunu çağırıyor. İlçe başına
 * `districtGateStatus()` çağrılsaydı 39 ek sorgu olurdu.
 */
async function districtGateStatusAll(): Promise<
  ServiceResult<{ slug: string; isActive: boolean; kapi: IlceKapiSonucu }[]>
> {
  try {
    const hepsi = (await regionsRepository.findForDistrictGate()) as any[]
    const ilceler = hepsi.filter((r) => istanbulIlcesiMi(r))

    const sayac = new Map<string, number>()
    for (const r of ilceler) {
      const a = String(r.metaDescription ?? '').trim()
      if (a) sayac.set(a, (sayac.get(a) || 0) + 1)
    }

    return ok(
      ilceler.map((r) => {
        const kendi = String(r.metaDescription ?? '').trim()
        return {
          slug: r.slug,
          isActive: Boolean(r.isActive),
          kapi: ilceKapisi(r, {
            aciklamaTekrarEdiyorMu: (a) => (sayac.get(a) || 0) > (a === kendi ? 1 : 0),
          }),
        }
      })
    )
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function publishDistrict(slug: string): Promise<KapiliBolgeSonucu<any>> {
  try {
    const kayit: any = await regionsRepository.findUnique({ slug })
    if (!kayit) return fail('Bölge bulunamadı')
    if (!istanbulIlcesiMi(kayit)) {
      return fail(`'${slug}' bir İstanbul ilçesi değil. Bu eylem yalnız İstanbul ilçeleri için.`)
    }

    const kapi = await ilceKapisiniCalistir(kayit)
    if (!kapi.gecti) {
      // KAYIT DEĞİŞMİYOR.
      return { success: false, error: `Yayına alınamadı: ${kapi.hatalar.join(' · ')}`, kapi }
    }

    // KÖK ADRES SON KAPI. Kaydetme anındaki denetimden bu yana başka bir
    // varlık aynı adresi almış olabilir; kendi kaydı kümeden çıkarılıyor.
    const cakisma = await kokYoluDenetle(kayit.slug, {
      haric: { haricBolgeSlug: kayit.slug },
    })
    if (cakisma) return { success: false, error: `Yayına alınamadı: ${cakisma.message}`, kapi }

    if (!kayit.isActive) await regionsRepository.setActive(slug, true)
    return ok({ slug, aktif: true, kapi }, 'Yayına alındı.')
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function unpublishDistrict(slug: string): Promise<KapiliBolgeSonucu<any>> {
  try {
    const kayit: any = await regionsRepository.findUnique({ slug })
    if (!kayit) return fail('Bölge bulunamadı')
    if (!istanbulIlcesiMi(kayit)) {
      return fail(`'${slug}' bir İstanbul ilçesi değil. Bu eylem yalnız İstanbul ilçeleri için.`)
    }

    // BAĞLI YAYINDAKİ MAHALLELER.
    //
    // Mahalle yayın kapısının ikinci maddesi "ebeveyn ilçe yayında" diyor.
    // İlçe sessizce yayından kaldırılsaydı, o ilçenin yayındaki mahalleleri
    // kapıyı artık geçemeyecekleri hâlde yayında kalırdı — M1'de kurulan
    // değişmez bozulurdu. Sessiz zincirleme kaldırma da YAPILMIYOR: hangi
    // sayfanın dizinden çıkacağına yönetici karar vermeli.
    const aktifMahalle = await regionsRepository.countActiveNeighborhoods(kayit.id)
    if (aktifMahalle > 0) {
      return fail(
        `Bu ilçede ${aktifMahalle} yayındaki mahalle var. Önce mahalleleri yayından kaldırın.`
      )
    }

    if (kayit.isActive) await regionsRepository.setActive(slug, false)
    return ok({ slug, aktif: false }, 'Yayından kaldırıldı. İlçe sayfası artık 404 döndürüyor.')
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function remove(slug: string): Promise<ServiceResult<any>> {
  try {
    const region = await regionsRepository.remove(slug)
    return ok(region, 'Bölge başarıyla silindi')
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

export const regionsService = {
  get,
  create,
  update,
  remove,
  districtGateStatus,
  districtGateStatusAll,
  publishDistrict,
  unpublishDistrict,
}
