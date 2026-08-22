// server/domain/home/home.repository.ts
import prisma from '../../utils/prisma.ts'
import { reviewsRepository } from '../reviews/reviews.repository.ts'

const OGE_SIRASI = { order: 'asc' as const }

export const homeRepository = {
  /** Bütün ana sayfa bölümleri, öğeleriyle. Tek sorgu. */
  findAllSections: () =>
    prisma.homeSection.findMany({ include: { items: { orderBy: OGE_SIRASI } } }),

  findSection: (sectionKey: string) =>
    prisma.homeSection.findUnique({
      where: { sectionKey },
      include: { items: { orderBy: OGE_SIRASI } },
    }),

  /**
   * Bölümü ve öğelerini tek işlemde yazar.
   *
   * TEK TRANSACTION: öğeler silinip yeniden yaratılıyor (bölüm CRUD
   * fabrikasındaki desen). Silme ile yaratma arasında bir hata olursa
   * bölüm öğesiz kalırdı; `$transaction` bunu engelliyor.
   */
  upsertSection: (
    sectionKey: string,
    govde: Record<string, unknown>,
    ogeler: Record<string, unknown>[]
  ) =>
    prisma.$transaction(async (tx) => {
      const bolum = await tx.homeSection.upsert({
        where: { sectionKey },
        create: { sectionKey, ...govde },
        update: govde,
      })

      await tx.homeSectionItem.deleteMany({ where: { sectionId: bolum.id } })
      if (ogeler.length) {
        await tx.homeSectionItem.createMany({
          data: ogeler.map((o, i) => ({ ...o, order: i, sectionId: bolum.id })),
        })
      }

      return tx.homeSection.findUnique({
        where: { id: bolum.id },
        include: { items: { orderBy: OGE_SIRASI } },
      })
    }),

  /**
   * Ana sayfa hizmet defteri — YALNIZ YAYINDAKİLER.
   *
   * Süzgeç veri tabanında: taslak hizmetleri çekip istemcide ayıklamak,
   * yayınlanmamış içeriği ağdan geçirmek olurdu (M2'deki aynı gerekçe).
   * Yalnız defterin bastığı dört sütun seçiliyor; `content` ve `faqs`
   * ana sayfaya hiç taşınmıyor.
   */
  findActiveServices: () =>
    prisma.service.findMany({
      where: { isActive: true, slug: { not: null } },
      select: { slug: true, title: true, excerpt: true, order: true },
      orderBy: { order: 'asc' },
    }),

  /** Kapsam sayımının kaynağı: bütün bölge kayıtlarının slug + il bilgisi. */
  findRegionsForScope: () =>
    prisma.region.findMany({ select: { slug: true, cities: true } }),

  /** V2 Süreç bölümünün kaynağı. */
  findProcess: () =>
    prisma.processSection.findFirst({ include: { steps: { orderBy: OGE_SIRASI } } }),

  /**
   * V2 Yorumlar bölümünün kaynağı.
   *
   * SORGU BURADA TEKRARLANMIYOR. Yorumların "public'e uygun" tanımı tek
   * yerde (server/domain/reviews) ve ana sayfa onu OKUYOR. İkinci bir
   * `where` yazılsaydı moderasyon kuralı iki kaynaklı olurdu ve ayrışma
   * yönü her zaman tehlikeli olan yön olurdu.
   */
  findReviews: () =>
    Promise.all([reviewsRepository.findForHome(), reviewsRepository.publicStats()]),

  /** V2 Sorular bölümünün kaynağı — yalnız aktif sorular. */
  findFaq: () =>
    prisma.faqSection.findFirst({
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: OGE_SIRASI,
          select: { question: true, answer: true },
        },
      },
    }),
}
