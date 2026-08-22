// server/domain/posts/posts.repository.ts
import prisma from '../../utils/prisma'

/**
 * HERKESE AÇIK SIRA — `publishedAt` azalan.
 *
 * Önceden sıra veri tabanının DOĞAL sırasıydı: sorguda hiç `orderBy` yoktu.
 * Ekranda ters kronolojik görünüyordu ama bu tesadüftü — on yazı en yeniden
 * eskiye doğru eklendiği için `id` artışı tarih azalışıyla örtüşüyordu.
 * Panelden eklenen yeni bir yazı en büyük id'yi alır ve listenin SONUNA,
 * yani "en eski" konumuna düşerdi.
 *
 * `createdAt` ikincil anahtar: `publishedAt` eşit ya da (taslakta) boş
 * olduğunda sıra yine deterministik kalıyor.
 */
const YAYIN_SIRASI = [{ publishedAt: 'desc' as const }, { createdAt: 'desc' as const }]

/**
 * PANEL SIRASI — `id` artan.
 *
 * Panelin bugünkü görünen sırası bu; açıkça yazılması davranışı
 * değiştirmiyor, yalnız veri tabanının doğal sırasına güvenmeyi bırakıyor.
 * Yayın sırası KULLANILMIYOR: taslakların `publishedAt`i boş olduğu için
 * hepsi listenin sonuna toplanırdı — oysa panelde en çok ilgilenilen kayıt
 * taslak olan.
 */
const PANEL_SIRASI = [{ id: 'asc' as const }]

export const postsRepository = {
  findBySlug: (slug: string) => prisma.post.findUnique({ where: { slug } }),

  /**
   * KİMLİK OKUMASI — güncellemede adresin kendisi değişebildiği için.
   *
   * `findBySlug` ile aranırsa adres değiştiren bir istek "kayıt yok"
   * cevabını alır ve yeniden adlandırma ile yeni kayıt birbirinden
   * ayırt edilemez. Birincil anahtar bu ayrımı kesin yapıyor.
   */
  findById: (id: number) => prisma.post.findUnique({ where: { id } }),

  /** Yalnız yayındaki yazı — herkese açık detay okuması. */
  findActiveBySlug: (slug: string) =>
    prisma.post.findFirst({ where: { slug, isActive: true } }),
  // `light`: liste/gezinme amaçlı tüketiciler (navbar, carousel, ilgili
  // yazı gezinmesi) `content` alanına (tam zengin metin HTML gövdesi,
  // yazı başına onlarca KB olabilir) hiç ihtiyaç duymuyor ama önceden her
  // istek TÜM sütunlarla TÜM satırları çekiyordu. Admin panelinin liste
  // görünümü (useListCrud) düzenleme formunu doğrudan bu listeden
  // doldurduğu için `content` hâlâ gerekli — bu yüzden varsayılan davranış
  // değişmedi, sadece `light: true` geçildiğinde devre dışı bırakılıyor.
  // `take`/`skip` verilmişse (sayfalama aktif) sonuçlar en yeni ilk sırada
  // gelecek şekilde sabit bir orderBy uygulanır — sayfalar arası tutarlılık
  // için deterministik bir sıra şart. Verilmemişse (mevcut tüm tüketiciler:
  // carousel'ler, navbar, admin'in tam liste görünümü) davranış öncekiyle
  // birebir aynı kalır, orderBy eklenmez.
  findAll: (options: { light?: boolean; take?: number; skip?: number; includeDrafts?: boolean } = {}) =>
    prisma.post.findMany({
      // SÜZGEÇ VERİ TABANINDA. Taslakları çekip istemcide ayıklamak,
      // yayınlanmamış içeriği ağdan geçirmek demek olurdu.
      ...(options.includeDrafts ? {} : { where: { isActive: true } }),
      ...(options.light ? { omit: { content: true } } : {}),
      orderBy: options.includeDrafts ? PANEL_SIRASI : YAYIN_SIRASI,
      ...(options.take !== undefined ? { take: options.take, skip: options.skip ?? 0 } : {}),
    }),

  count: (options: { includeDrafts?: boolean } = {}) =>
    prisma.post.count(options.includeDrafts ? {} : { where: { isActive: true } }),

  /**
   * Yayın durumu AYRI metot: `update` üzerinden `isActive` yazılabilseydi
   * genel düzenleme çağrısı yayın kararını verebilirdi. Bunu yalnız
   * servisin publish/unpublish akışı çağırıyor.
   */
  setPublication: (slug: string, data: { isActive: boolean; publishedAt?: Date }) =>
    prisma.post.update({ where: { slug }, data }),
  create: (data: Record<string, any>) => prisma.post.create({ data }),
  update: (slug: string, data: Record<string, any>) => prisma.post.update({ where: { slug }, data }),
  remove: (slug: string) => prisma.post.delete({ where: { slug } }),
}
