// server/domain/posts/posts.publication.test.ts
//
// YAZI YAYIN DURUMU.
//
// Bu modelde yayın durumu diye bir kavram YOKTU: panelde bir yazıya
// başlanıp yarım bırakıldığı anda o yazı canlıydı — kök adreste açılıyor,
// `/blog` listesinde görünüyor, sitemap'e giriyor ve `index, follow`
// etiketiyle dizine sunuluyordu. Buradaki testler o davranışın geri
// gelmesini engelliyor.
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Kök ad alanı denetimi burada devre dışı (varsayılan: çakışma yok) —
// bu dosya YAYIN DURUMUNU test ediyor. Adres çakışmasının yayını
// engellediği durumlar server/domain/posts/posts.rootpath.test.ts içinde.
vi.mock('../shared/root-paths', () => ({
  kokYolunuNormallestir: (v: unknown) => String(v ?? '').trim().replace(/^\/+/, ''),
  kokYoluDenetle: vi.fn(async () => null),
}))

vi.mock('./posts.repository', () => ({
  postsRepository: {
    findBySlug: vi.fn(),
    findActiveBySlug: vi.fn(),
    findAll: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    setPublication: vi.fn(),
    remove: vi.fn(),
  },
}))

import { postsRepository } from './posts.repository'
import { postsService } from './posts.service'

/** Yayına alınabilir asgari yazı. */
const YAZI = (ustuneYaz: Record<string, any> = {}) => ({
  id: 1,
  slug: 'kis-aylarinda-tasinmak',
  title: 'Kış aylarında taşınmak',
  content: '<p>Kışın taşınmanın planlaması yazdan farklı işliyor.</p>',
  isActive: false,
  publishedAt: null,
  ...ustuneYaz,
})

beforeEach(() => {
  vi.clearAllMocks()
  ;(postsRepository.create as any).mockImplementation(async (data: any) => ({ id: 9, ...data }))
  ;(postsRepository.setPublication as any).mockImplementation(async (slug: string, data: any) => ({
    slug,
    ...data,
  }))
})

// ─────────────────────────────────────────────────────────── oluşturma

describe('create — kaydetmek yayınlamak DEĞİL', () => {
  it('yeni yazı TASLAK başlıyor', async () => {
    await postsService.create({ title: 'Yeni', slug: 'yeni-yazi', content: '<p>metin</p>' })

    expect(postsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false, publishedAt: null })
    )
  })

  it('gövdede isActive gönderilse bile taslak kalıyor', async () => {
    // Sözleşmede (`PostInput`) böyle bir alan YOK; yup şeması da
    // `stripUnknown` ile atıyor. Servis yine de kendi değerini yazıyor.
    await postsService.create({
      title: 'Yeni',
      slug: 'yeni-yazi',
      content: '<p>metin</p>',
      ...({ isActive: true, publishedAt: new Date() } as any),
    })

    expect(postsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false, publishedAt: null })
    )
  })
})

describe('update — genel düzenleme yayın durumunu DEĞİŞTİRMİYOR', () => {
  it('güncelleme gövdesinde isActive alanı repository\'ye hiç geçmiyor', async () => {
    // M3: `update` artık kaydı ÖNCE okuyor (adres değişip değişmediğini
    // anlamak için). Kaydın var olması gerektiği bu yüzden mock'landı;
    // testin ölçtüğü şey değişmedi.
    ;(postsRepository.findBySlug as any).mockResolvedValue(YAZI())
    ;(postsRepository.update as any).mockResolvedValue({})

    await postsService.update({
      title: 'Güncel',
      slug: 'kis-aylarinda-tasinmak',
      content: '<p>metin</p>',
      ...({ isActive: true } as any),
    })

    const yazilan = (postsRepository.update as any).mock.calls[0][1]
    expect(yazilan).not.toHaveProperty('isActive')
    expect(yazilan).not.toHaveProperty('publishedAt')
  })
})

// ─────────────────────────────────────────────────────── herkese açık okuma

describe('get — taslak sızıntısı yok', () => {
  it('herkese açık liste yalnız yayındakileri istiyor', async () => {
    ;(postsRepository.findAll as any).mockResolvedValue([])

    await postsService.get(undefined, true)

    expect(postsRepository.findAll).toHaveBeenCalledWith({ light: true, includeDrafts: false })
  })

  it('yönetici listesi taslakları da istiyor', async () => {
    ;(postsRepository.findAll as any).mockResolvedValue([])

    await postsService.get(undefined, true, undefined, { includeDrafts: true })

    expect(postsRepository.findAll).toHaveBeenCalledWith({ light: true, includeDrafts: true })
  })

  it('herkese açık SAYIM da yalnız yayındakileri kapsıyor', async () => {
    ;(postsRepository.findAll as any).mockResolvedValue([])
    ;(postsRepository.count as any).mockResolvedValue(0)

    await postsService.get(undefined, false, { page: 1 })

    expect(postsRepository.count).toHaveBeenCalledWith({ includeDrafts: false })
  })

  it('yönetici sayımı taslakları içeriyor', async () => {
    ;(postsRepository.findAll as any).mockResolvedValue([])
    ;(postsRepository.count as any).mockResolvedValue(0)

    await postsService.get(undefined, false, { page: 1 }, { includeDrafts: true })

    expect(postsRepository.count).toHaveBeenCalledWith({ includeDrafts: true })
  })

  it('herkese açık tekil okuma YAYINDAKİ kaydı arıyor', async () => {
    ;(postsRepository.findActiveBySlug as any).mockResolvedValue(YAZI({ isActive: true }))

    await postsService.get('kis-aylarinda-tasinmak')

    expect(postsRepository.findActiveBySlug).toHaveBeenCalledWith('kis-aylarinda-tasinmak')
    expect(postsRepository.findBySlug).not.toHaveBeenCalled()
  })

  it('taslak yazı herkese açık okumada BULUNAMIYOR (sayfa 404 olur)', async () => {
    ;(postsRepository.findActiveBySlug as any).mockResolvedValue(null)

    const s: any = await postsService.get('yarim-kalan-yazi')

    expect(s.success).toBe(false)
    // "yayında değil" demek kaydın var olduğunu söylemek olurdu.
    expect(s.error).toBe('Post bulunamadı')
  })

  it('yönetici tekil okumada taslağı görebiliyor', async () => {
    ;(postsRepository.findBySlug as any).mockResolvedValue(YAZI())

    const s: any = await postsService.get('kis-aylarinda-tasinmak', false, undefined, {
      includeDrafts: true,
    })

    expect(s.success).toBe(true)
    expect(postsRepository.findBySlug).toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────── yayın eylemleri

describe('publish', () => {
  it('geçerli yazıyı yayına alıyor ve İLK yayın anını yazıyor', async () => {
    ;(postsRepository.findBySlug as any).mockResolvedValue(YAZI())

    const s: any = await postsService.publish('kis-aylarinda-tasinmak')

    expect(s.success).toBe(true)
    const [slug, data] = (postsRepository.setPublication as any).mock.calls[0]
    expect(slug).toBe('kis-aylarinda-tasinmak')
    expect(data.isActive).toBe(true)
    expect(data.publishedAt).toBeInstanceOf(Date)
  })

  it('YENİDEN yayına alma özgün yayın tarihini KORUYOR', async () => {
    const ilkYayin = new Date('2026-03-16T12:00:00.000Z')
    ;(postsRepository.findBySlug as any).mockResolvedValue(
      YAZI({ isActive: false, publishedAt: ilkYayin })
    )

    const s: any = await postsService.publish('kis-aylarinda-tasinmak')

    expect(s.success).toBe(true)
    expect((postsRepository.setPublication as any).mock.calls[0][1].publishedAt).toBe(ilkYayin)
    expect(s.message).toContain('Yeniden')
  })

  it('başlığı boş yazı yayına alınamıyor ve KAYIT DEĞİŞMİYOR', async () => {
    ;(postsRepository.findBySlug as any).mockResolvedValue(YAZI({ title: '   ' }))

    const s: any = await postsService.publish('kis-aylarinda-tasinmak')

    expect(s.success).toBe(false)
    expect(s.error).toContain('başlık boş')
    expect(postsRepository.setPublication).not.toHaveBeenCalled()
  })

  it('içeriği boş yazı yayına alınamıyor', async () => {
    ;(postsRepository.findBySlug as any).mockResolvedValue(YAZI({ content: '<p>  </p>' }))

    const s: any = await postsService.publish('kis-aylarinda-tasinmak')

    expect(s.success).toBe(false)
    expect(s.error).toContain('içerik boş')
    expect(postsRepository.setPublication).not.toHaveBeenCalled()
  })

  it('olmayan yazı için hata dönüyor', async () => {
    ;(postsRepository.findBySlug as any).mockResolvedValue(null)

    const s: any = await postsService.publish('olmayan')

    expect(s.success).toBe(false)
    expect(postsRepository.setPublication).not.toHaveBeenCalled()
  })
})

describe('unpublish', () => {
  it('yayından kaldırıyor', async () => {
    ;(postsRepository.findBySlug as any).mockResolvedValue(
      YAZI({ isActive: true, publishedAt: new Date('2026-03-16') })
    )

    const s: any = await postsService.unpublish('kis-aylarinda-tasinmak')

    expect(s.success).toBe(true)
    expect(postsRepository.setPublication).toHaveBeenCalledWith('kis-aylarinda-tasinmak', {
      isActive: false,
    })
  })

  it('publishedAt SİLİNMİYOR — yayın geçmişi korunuyor', async () => {
    ;(postsRepository.findBySlug as any).mockResolvedValue(
      YAZI({ isActive: true, publishedAt: new Date('2026-03-16') })
    )

    await postsService.unpublish('kis-aylarinda-tasinmak')

    const yazilan = (postsRepository.setPublication as any).mock.calls[0][1]
    expect(yazilan).not.toHaveProperty('publishedAt')
  })

  it('yayından kaldırma İÇERİK DENETİMİ İSTEMİYOR', async () => {
    // Bozuk içerikli bir sayfayı dizinden çekebilmek her zaman mümkün olmalı.
    ;(postsRepository.findBySlug as any).mockResolvedValue(
      YAZI({ isActive: true, title: null, content: null })
    )

    const s: any = await postsService.unpublish('kis-aylarinda-tasinmak')

    expect(s.success).toBe(true)
    expect(postsRepository.setPublication).toHaveBeenCalled()
  })
})
