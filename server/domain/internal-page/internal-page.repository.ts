// server/domain/internal-page/internal-page.repository.ts
import prisma from '../../utils/prisma.ts'

const OGE_SIRASI = { order: 'asc' as const }

export const internalPageRepository = {
  /** Tek sayfanın bütün bölümleri, öğeleriyle. */
  findPage: (pageKey: string) =>
    prisma.internalPageSection.findMany({
      where: { pageKey },
      include: { items: { orderBy: OGE_SIRASI } },
    }),

  /** Yönetim ekranı için: bütün sayfalar tek sorguda. */
  findAll: () =>
    prisma.internalPageSection.findMany({
      include: { items: { orderBy: OGE_SIRASI } },
    }),

  /**
   * Bölümü ve öğelerini tek işlemde yazar.
   *
   * TEK TRANSACTION: öğeler silinip yeniden yaratılıyor (M4'teki desen).
   * Silme ile yaratma arasında bir hata olursa bölüm öğesiz kalırdı.
   */
  upsertSection: (
    pageKey: string,
    sectionKey: string,
    govde: Record<string, unknown>,
    ogeler: Record<string, unknown>[]
  ) =>
    prisma.$transaction(async (tx) => {
      const bolum = await tx.internalPageSection.upsert({
        where: { pageKey_sectionKey: { pageKey, sectionKey } },
        create: { pageKey, sectionKey, ...govde },
        update: govde,
      })

      await tx.internalPageItem.deleteMany({ where: { sectionId: bolum.id } })
      if (ogeler.length) {
        await tx.internalPageItem.createMany({
          data: ogeler.map((o, i) => ({ ...o, order: i, sectionId: bolum.id })),
        })
      }

      return tx.internalPageSection.findUnique({
        where: { id: bolum.id },
        include: { items: { orderBy: OGE_SIRASI } },
      })
    }),
}
