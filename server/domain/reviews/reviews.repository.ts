// server/domain/reviews/reviews.repository.ts
import prisma from '../../utils/prisma.ts'

import {
  HERKESE_ACIK_ALANLAR,
  HERKESE_ACIK_KOSUL,
  ANASAYFA_YORUM_SAYISI,
} from './reviews.public-fields.ts'

export { HERKESE_ACIK_ALANLAR, HERKESE_ACIK_KOSUL }

export const reviewsRepository = {
  /** Sitede gösterilecek yorumlar: hem aktif hem ONAYLI olanlar. */
  findPublic: (take = 60) =>
    prisma.testimonial.findMany({
      where: HERKESE_ACIK_KOSUL,
      select: HERKESE_ACIK_ALANLAR,
      orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }, { date: 'desc' }],
      take,
    }),

  /**
   * ANA SAYFA LİSTESİ — en yeni onaylı yorumlar, sınırlı.
   *
   * `findPublic`ten iki farkı var ve ikisi de kasıtlı:
   *   1. SIRA. Burada yalnız tarih: en yeni önce. `isFeatured`/`order`
   *      yönetici sıralaması demek ve ana sayfada bir yorumu öne almak
   *      "seçilmiş yorum" anlamına gelirdi.
   *   2. SAYI. Bölüm altı satır taşıyor; tablonun tamamı ana sayfa
   *      yanıtına konmuyor.
   */
  findForHome: (take = ANASAYFA_YORUM_SAYISI) =>
    prisma.testimonial.findMany({
      where: HERKESE_ACIK_KOSUL,
      select: { id: true, customerName: true, rating: true, comment: true, date: true },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      take,
    }),

  /**
   * Ortalama puan ve adet — YALNIZ EKRAN İÇİN.
   *
   * Bu değerler hiçbir yapısal veriye (Review/AggregateRating) dönmüyor;
   * gerekçesi app/pages/index.vue başlığında. Veri tabanına da ikinci kez
   * yazılmıyorlar: her istekte public'e uygun kayıtlardan hesaplanıyorlar.
   *
   * `take` UYGULANMIYOR: sayaç GÖSTERİLEN listeyi değil, uygun kayıtların
   * TAMAMINI sayıyor. İkisi ayrı anlam.
   */
  publicStats: () =>
    prisma.testimonial.aggregate({
      where: HERKESE_ACIK_KOSUL,
      _avg: { rating: true },
      _count: { _all: true },
    }),

  create: (data: {
    customerName: string
    rating: number
    comment: string
    location?: string | null
    serviceType: string
    email?: string | null
    testimonialSectionId: number
  }) =>
    prisma.testimonial.create({
      data: {
        ...data,
        date: new Date(),
        // Siteden gelen yorum ONAYSIZ başlar; yönetici onaylayana kadar
        // hiçbir yerde görünmez.
        isApproved: false,
        source: 'site',
        isActive: true,
        isFeatured: false,
        order: 0,
      },
    }),

  /**
   * Yönetim listesi — e-posta dahil TÜM alanlar.
   *
   * `isActive` de dönüyor: panel "yayında" ile "onaylı ama pasif" durumunu
   * ayırt edebilsin diye. Yalnız onaya bakan bir panel yanlış bilgi verir.
   */
  findForAdmin: (onlyPending: boolean, take = 100) =>
    prisma.testimonial.findMany({
      where: onlyPending ? { isApproved: false } : {},
      orderBy: [{ isApproved: 'asc' }, { date: 'desc' }],
      take,
    }),

  countPending: () => prisma.testimonial.count({ where: { isApproved: false } }),

  findById: (id: number) => prisma.testimonial.findUnique({ where: { id } }),

  /** Moderasyon kararı — yorum yayınlanmaya uygun mu. */
  setApproved: (id: number, isApproved: boolean) =>
    prisma.testimonial.update({ where: { id }, data: { isApproved } }),

  /** Yayın durumu — şu anda sitede görünüyor mu. Onaydan AYRI alan. */
  setActive: (id: number, isActive: boolean) =>
    prisma.testimonial.update({ where: { id }, data: { isActive } }),

  remove: (id: number) => prisma.testimonial.delete({ where: { id } }),

  /** Yorumların bağlanacağı bölüm; yoksa null. */
  defaultSectionId: async () =>
    (await prisma.testimonialSection.findFirst({ select: { id: true } }))?.id ?? null,
}
