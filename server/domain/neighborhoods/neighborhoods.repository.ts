// server/domain/neighborhoods/neighborhoods.repository.ts
import prisma from '../../utils/prisma.ts'

/**
 * Dizin okuması — İÇERİK SÜTUNLARI ALINMIYOR.
 *
 * İlçe sayfası ve kardeş listesi yalnız ad + adres + yayın durumu okuyor.
 * `content`/`faqs`/`facts` 473 kayıt için taşınsaydı dizin ~10 KB yerine
 * yüzlerce KB olurdu; içerik yalnız açılan tek mahallede gerekiyor.
 */
const DIZIN_SUTUNLARI = {
  districtId: true,
  name: true,
  canonicalPath: true,
  isActive: true,
} as const

/**
 * Panel listesi — gövde metni YOK.
 *
 * 473 kaydın `content`i panelde liste görünümünde hiç okunmuyor; yalnız
 * "içerik var mı" bilgisi gerekiyor ve onu `excerpt`/`title` doluluğu ile
 * kapı özeti veriyor. Gövde tek kayıt açıldığında çekiliyor.
 */
const PANEL_SUTUNLARI = {
  id: true,
  districtId: true,
  name: true,
  slug: true,
  canonicalPath: true,
  isActive: true,
  title: true,
  excerpt: true,
  metaDescription: true,
  imagePath: true,
  updatedAt: true,
} as const

/** Kapının ebeveyn hakkında bilmesi gereken her şey. */
const ILCE_SUTUNLARI = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  cities: true,
  isActive: true,
  content: true,
} as const

export interface PanelSuzgeci {
  districtId?: number
  isActive?: boolean
  /** Ada göre serbest metin araması (küçük/büyük harf duyarsız). */
  arama?: string
}

export const neighborhoodsRepository = {
  /** Tüm mahalleler, dizin sütunlarıyla. Sıra: ilçe içinde ada göre. */
  findForIndex: () =>
    prisma.neighborhood.findMany({
      select: DIZIN_SUTUNLARI,
      orderBy: [{ districtId: 'asc' }, { name: 'asc' }],
    }),

  /**
   * Yalnız YAYINDAKİ mahalleler, dizin sütunlarıyla.
   *
   * `/bolgelerimiz` sayımı ve önizlemesi bunu okuyor. Tek sorgu: ilçe başına
   * ayrı sorgu (N+1) yerine tüm aktifler bir kez çekilip bellekte
   * gruplanıyor — bugün 10, tavanda 473 kayıt.
   */
  findActiveForIndex: () =>
    prisma.neighborhood.findMany({
      where: { isActive: true },
      select: DIZIN_SUTUNLARI,
      orderBy: [{ districtId: 'asc' }, { name: 'asc' }],
    }),

  /** Bir ilçenin mahalleleri. `aktifSadece` ile yayındakilere daralır. */
  findByDistrictId: (districtId: number, aktifSadece = false) =>
    prisma.neighborhood.findMany({
      where: aktifSadece ? { districtId, isActive: true } : { districtId },
      select: DIZIN_SUTUNLARI,
      orderBy: { name: 'asc' },
    }),

  /** Tek mahalle — tüm alanlarıyla; ilçesi de birlikte geliyor. */
  findByPath: (canonicalPath: string) =>
    prisma.neighborhood.findUnique({
      where: { canonicalPath },
      include: {
        district: { select: { id: true, slug: true, title: true, subtitle: true, cities: true } },
      },
    }),

  /** Tek mahalle, id ile — kapı için ilçenin içeriği ve yayın durumu da geliyor. */
  findById: (id: number) =>
    prisma.neighborhood.findUnique({
      where: { id },
      include: { district: { select: ILCE_SUTUNLARI } },
    }),

  count: () => prisma.neighborhood.count(),

  /** Sitemap ve yayın kapısı için: yalnız yayındakiler. */
  findActive: () =>
    prisma.neighborhood.findMany({
      where: { isActive: true },
      select: { canonicalPath: true, updatedAt: true },
      orderBy: { canonicalPath: 'asc' },
    }),

  // --- panel -------------------------------------------------------------

  listForAdmin: (suzgec: PanelSuzgeci = {}) =>
    prisma.neighborhood.findMany({
      where: {
        ...(suzgec.districtId === undefined ? {} : { districtId: suzgec.districtId }),
        ...(suzgec.isActive === undefined ? {} : { isActive: suzgec.isActive }),
        ...(suzgec.arama ? { name: { contains: suzgec.arama } } : {}),
      },
      select: PANEL_SUTUNLARI,
      orderBy: [{ districtId: 'asc' }, { name: 'asc' }],
    }),

  /**
   * Tek ilçe, slug ile — ilçe sayfasının mahalle listesi için.
   *
   * `findDistricts()` KULLANILMIYOR: o 375 bölgenin tamamını çekiyor,
   * oysa burada tek bir kaydın id'si ve İstanbul sınıflandırması yeterli.
   * `slug` sütunu UNIQUE, yani bu indeksli tek satırlık bir okuma.
   */
  findDistrictBySlug: (slug: string) =>
    prisma.region.findUnique({
      where: { slug },
      select: { id: true, slug: true, title: true, subtitle: true, shortTitle: true, cities: true, isActive: true },
    }),

  /** Panel listesinde ilçe adını göstermek için: id → ilçe. */
  findDistricts: () =>
    prisma.region.findMany({
      select: { id: true, slug: true, title: true, subtitle: true, shortTitle: true, cities: true, isActive: true },
      orderBy: { slug: 'asc' },
    }),

  // --- kapı bağlamı ------------------------------------------------------

  /**
   * Kapının `metaDescription` benzersizlik denetimi için: BAŞKA kayıtların
   * açıklamaları. `haricId` düzenlenen kaydı dışarıda bırakıyor, aksi hâlde
   * her kayıt kendi açıklamasına çakışırdı.
   */
  findOtherMetaDescriptions: (haricId?: number) =>
    prisma.neighborhood.findMany({
      where: {
        metaDescription: { not: null },
        ...(haricId === undefined ? {} : { id: { not: haricId } }),
      },
      select: { metaDescription: true },
    }),

  /** Kapının adres tekrarı denetimi için: tüm kanonik adresler. */
  findAllPaths: () => prisma.neighborhood.findMany({ select: { canonicalPath: true } }),

  /** Toplu kapı değerlendirmesi (betik) için: tüm kayıtlar + ilçeleri. */
  findAllWithDistrict: () =>
    prisma.neighborhood.findMany({
      include: { district: { select: ILCE_SUTUNLARI } },
      orderBy: { canonicalPath: 'asc' },
    }),

  // --- yazma -------------------------------------------------------------

  create: (data: any) => prisma.neighborhood.create({ data }),

  update: (id: number, data: any) => prisma.neighborhood.update({ where: { id }, data }),

  /**
   * Yayın durumu AYRI metot: `update` üzerinden `isActive` yazılabilseydi
   * genel düzenleme çağrısı kapıyı atlayabilirdi. Bu metodu yalnız
   * servisin publish/unpublish akışı çağırıyor.
   */
  setActive: (id: number, isActive: boolean) =>
    prisma.neighborhood.update({ where: { id }, data: { isActive } }),
}
