import { beforeEach, describe, expect, it, vi } from 'vitest'

// KÖK AD ALANI YARDIMCISI MOCK'LANIYOR.
//
// Servis artık yazma yollarında `kokYoluDenetle()` çağırıyor; yardımcı
// Prisma istemcisini modül yüklenirken içeri alıyor, yani mock'suz bu
// dosya DATABASE_URL istemeye başlar. Çakışma mantığının KENDİ testleri
// server/domain/shared/root-paths.test.ts içinde; burada varsayılan
// "çakışma yok" davranışı kuruluyor ki bu dosyadaki testler ilgilendikleri
// şeyi test etmeye devam etsin.
vi.mock('../shared/root-paths', () => ({
  kokYolunuNormallestir: (v: unknown) => String(v ?? '').trim().replace(/^\/+/, ''),
  kokYoluDenetle: vi.fn(async () => null),
}))

vi.mock('./posts.repository', () => ({
  postsRepository: {
    findBySlug: vi.fn(),
    findActiveBySlug: vi.fn(),
    findAll: vi.fn(),
    setPublication: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

import { postsRepository } from './posts.repository'
import { postsService } from './posts.service'

describe('postsService.get — geriye dönük uyumluluk (pagination yok)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('page verilmezse bare dizi döner (carousel/navbar/admin tam liste davranışı)', async () => {
    ;(postsRepository.findAll as any).mockResolvedValue([{ id: 1 }, { id: 2 }])

    const result = await postsService.get(undefined, false)

    expect(result).toEqual({ success: true, data: [{ id: 1 }, { id: 2 }] })
    expect(postsRepository.count).not.toHaveBeenCalled()
    expect(postsRepository.findAll).toHaveBeenCalledWith({ light: false, includeDrafts: false })
  })
})

describe('postsService.get — sayfalama (page verildiğinde)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('page verildiğinde {items,total,page,pageSize,totalPages} zarfı döner', async () => {
    ;(postsRepository.findAll as any).mockResolvedValue([{ id: 21 }, { id: 22 }])
    ;(postsRepository.count as any).mockResolvedValue(45)

    const result: any = await postsService.get(undefined, false, { page: 2, pageSize: 20 })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      items: [{ id: 21 }, { id: 22 }],
      total: 45,
      page: 2,
      pageSize: 20,
      totalPages: 3, // ceil(45/20)
    })
  })

  it('2. sayfa için doğru skip hesaplanır (sayfa 2, pageSize 20 → skip 20)', async () => {
    ;(postsRepository.findAll as any).mockResolvedValue([])
    ;(postsRepository.count as any).mockResolvedValue(0)

    await postsService.get(undefined, false, { page: 2, pageSize: 20 })

    expect(postsRepository.findAll).toHaveBeenCalledWith({ light: false, take: 20, skip: 20, includeDrafts: false })
  })

  it('pageSize verilmezse varsayılan 20 kullanılır', async () => {
    ;(postsRepository.findAll as any).mockResolvedValue([])
    ;(postsRepository.count as any).mockResolvedValue(0)

    await postsService.get(undefined, false, { page: 1 })

    expect(postsRepository.findAll).toHaveBeenCalledWith({ light: false, take: 20, skip: 0, includeDrafts: false })
  })

  it('page 0 veya negatifse 1. sayfaya sabitlenir', async () => {
    ;(postsRepository.findAll as any).mockResolvedValue([])
    ;(postsRepository.count as any).mockResolvedValue(0)

    await postsService.get(undefined, false, { page: -5, pageSize: 10 })

    expect(postsRepository.findAll).toHaveBeenCalledWith({ light: false, take: 10, skip: 0, includeDrafts: false })
  })

  it('pageSize üst sınırı (100) aşılamaz — kötüye kullanımla tüm tablo tek seferde çekilemez', async () => {
    ;(postsRepository.findAll as any).mockResolvedValue([])
    ;(postsRepository.count as any).mockResolvedValue(0)

    await postsService.get(undefined, false, { page: 1, pageSize: 999999 })

    expect(postsRepository.findAll).toHaveBeenCalledWith({ light: false, take: 100, skip: 0, includeDrafts: false })
  })

  it('kayıt yokken totalPages en az 1 olur (0/x = 0 değil)', async () => {
    ;(postsRepository.findAll as any).mockResolvedValue([])
    ;(postsRepository.count as any).mockResolvedValue(0)

    const result: any = await postsService.get(undefined, false, { page: 1, pageSize: 20 })

    expect(result.data.totalPages).toBe(1)
  })

  it('slug verilmişse sayfalama parametresi tamamen yok sayılır', async () => {
    ;(postsRepository.findActiveBySlug as any).mockResolvedValue({ id: 1, slug: 'test-yazi' })

    const result: any = await postsService.get('test-yazi', false, { page: 2 })

    expect(result.data).toEqual({ id: 1, slug: 'test-yazi' })
    expect(postsRepository.findAll).not.toHaveBeenCalled()
  })
})
