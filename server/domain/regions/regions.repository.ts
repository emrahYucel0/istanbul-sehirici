// server/domain/regions/regions.repository.ts
import prisma from '../../utils/prisma.ts'

/**
 * `light` modunda ATILAN sütunlar.
 *
 * ÖNCEDEN yalnızca `content` atılıyordu ve bu yetersizdi: 120 bölgenin
 * SSS'leri (kayıt başına ~1.1 KB), künye tabloları, güzergâhları ve mahalle
 * listeleri hâlâ geliyordu. Ölçüldü — `/api/regions?light=true` yanıtı
 * 277 KB'tı ve bu JSON, listeyi çeken HER sayfanın HTML'ine gömülüyordu:
 * ana sayfa 437 KB, /bolgelerimiz 465 KB, bölge sayfaları ~425 KB.
 * Sayfaların yaklaşık 130'u bu yükü taşıyordu.
 *
 * Listeyi tüketen beş yerin (RegionFinder, RegionCarousel, region/List,
 * bolgelerimiz, [...slug]) hiçbiri bu alanları OKUMUYOR — tek tek
 * doğrulandı. Ağır alanlar zaten tekil bölge kaydından geliyor
 * (RegionView `props.region` üzerinden okuyor), listeden değil.
 *
 * `excerpt`, `image` ve `cities` KALIYOR: kartlar, arama süzgeci ve
 * il/ilçe kırılımı bunları kullanıyor. `createdAt` de kalıyor —
 * bölgeler arası önceki/sonraki gezinmesi tarihe göre sıralıyor.
 *
 * `imageAlt` de KALIYOR: bölge kartları görsel gösteriyor, alt metnini de
 * oradan okuyorlar. Alan 120 bölgenin neredeyse tamamında NULL kalacak
 * (bkz. schema.prisma → Region.imageAlt'taki gerekçe), yani listeye
 * eklediği yük ~2 KB ham / ~0.2 KB sıkıştırılmış. Atılsaydı, öne çıkan bir
 * bölgeye elle metin yazıldığında kart eski otomatik metni, detay sayfası
 * yeni metni gösterirdi.
 */
const AGIR_SUTUNLAR = {
  content: true,
  // Yalnızca detay sayfasının <head>'inde kullanılıyor (o da findUnique ile
  // çekiliyor). Listeye konsaydı 120 × ~150 bayt boşuna taşınırdı.
  metaTitle: true,
  metaDescription: true,
  faqs: true,
  facts: true,
  routes: true,
  neighborhoods: true,
  priceFactors: true,
  priceFactorsTitle: true,
  priceFactorsImage: true,
} as const

export const regionsRepository = {
  findUnique: (where: any) => prisma.region.findUnique({ where }),
  // `light`: liste/gezinme amaçlı tüketiciler (bölge bulucu, carousel,
  // ilgili bölge gezinmesi) ağır içerik sütunlarına ihtiyaç duymuyor.
  // Admin panelinin liste görünümü (useListCrud) düzenleme formunu
  // doğrudan bu listeden doldurduğu için ORADA hepsi gerekli — bu yüzden
  // varsayılan davranış değişmedi, yalnızca `light: true` geçildiğinde
  // sütunlar düşürülüyor.
  findMany: (where: any, options: { light?: boolean; take?: number; skip?: number } = {}) =>
    prisma.region.findMany({
      where,
      orderBy: { title: 'asc' },
      ...(options.light ? { omit: AGIR_SUTUNLAR } : {}),
      ...(options.take !== undefined ? { take: options.take, skip: options.skip ?? 0 } : {}),
    }),
  count: (where: any) => prisma.region.count({ where }),

  /**
   * `/bolgelerimiz` coğrafi dizini için ham satırlar.
   *
   * NEDEN AYRI BİR OKUMA GEREKTİ — mevcut `findMany` yetmiyor: genel liste
   * yalnız AKTİF kayıtları döndürüyor, dizin ise 39 İstanbul ilçesinin
   * TAMAMINI göstermek zorunda (pasif olanlar bağlantısız).
   *
   * Tam kayıt yerine yalnız dizinin okuduğu altı sütun seçiliyor: 375 kaydın
   * `content`/`faqs`/`facts`/`routes` alanları hiç okunmuyor.
   *
   * `neighborhoods` SÜTUNU ARTIK OKUNMUYOR. Mahalle sayısı ve önizleme
   * adları `Neighborhood` tablosundan geliyor (bkz. istanbul.service.ts);
   * iki kaynak, ekrandaki sayı ile listenin ayrışmasına yol açıyordu.
   */
  findForGeoIndex: () =>
    prisma.region.findMany({
      select: {
        // `id` mahalle kayıtlarını ilçeye bağlamak için gerekiyor
        // (Neighborhood.districtId → Region.id).
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        shortTitle: true,
        isActive: true,
        cities: true,
      },
      orderBy: { title: 'asc' },
    }),

  /**
   * Kapının arama açıklaması benzersizlik denetimi için: İstanbul
   * ilçelerinin açıklamaları.
   *
   * Betik bu kümeyi `slug IN (39 yaka slug'ı)` ile kuruyordu; burada
   * `cities` üzerinden çekilip `istanbulIlcesiMi` ile süzülüyor. Ölçüldü:
   * iki yol da aynı 39 kaydı veriyor. `istanbulIlcesiMi` tercih edildi
   * çünkü sınıflandırmanın tek kaynağı o — yaka listesi yalnız hangi
   * yakada olduğunu söylüyor.
   */
  findForDistrictGate: () =>
    prisma.region.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        excerpt: true,
        content: true,
        metaDescription: true,
        imageAlt: true,
        cities: true,
        neighborhoods: true,
        faqs: true,
        isActive: true,
      },
    }),

  /** Bu ilçeye bağlı YAYINDAKİ mahalle adedi — yayından kaldırma denetimi. */
  countActiveNeighborhoods: (districtId: number) =>
    prisma.neighborhood.count({ where: { districtId, isActive: true } }),

  setActive: (slug: string, isActive: boolean) =>
    prisma.region.update({ where: { slug }, data: { isActive } }),

  create: (data: any) => prisma.region.create({ data }),
  update: (slug: string, data: any) => prisma.region.update({ where: { slug }, data }),
  remove: (slug: string) => prisma.region.delete({ where: { slug } }),
}
