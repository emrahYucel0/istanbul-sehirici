// server/domain/posts/posts.rootpath.test.ts
//
// YAZI — KÖK ADRES KORUMASI.
//
// Yazılar kök adreste yayınlanıyor (`/kis-aylarinda-tasinmak`), yani aynı ad
// alanını statik sayfalar, bölgeler, hizmetler ve mahallelerle paylaşıyorlar.
// Denetimde ölçülen açık: panelden `slug: "hakkimizda"` ile bir yazı
// kaydedilebiliyordu. Sayfa erişilemez oluyordu (çözümleyici statik rotayı
// önce buluyor) ama sitemap onu bildirmeye devam ediyordu.
//
// Çakışma mantığının kendi testleri `server/domain/shared/root-paths.test.ts`
// içinde; burada test edilen şey SERVİSİN o denetimi doğru yerde, doğru
// bağımsız değişkenlerle ve YAZMADAN ÖNCE çağırması.
import { beforeEach, describe, expect, it, vi } from 'vitest'

const kokMock = vi.hoisted(() => ({ kokYoluDenetle: vi.fn() }))

vi.mock('../shared/root-paths', () => ({
  kokYolunuNormallestir: (v: unknown) => String(v ?? '').trim().replace(/^\/+/, ''),
  kokYoluDenetle: kokMock.kokYoluDenetle,
}))

vi.mock('./posts.repository', () => ({
  postsRepository: {
    findBySlug: vi.fn(),
    findById: vi.fn(),
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

const CAKISMA = {
  code: 'KOK_ADRES_CAKISMASI' as const,
  path: '/pendik',
  conflictingType: 'bölge sayfası',
  conflictingLabel: 'Pendik Evden Eve Nakliyat',
  message: '/pendik adresi zaten bölge sayfası tarafından kullanılıyor ("Pendik Evden Eve Nakliyat").',
}

const YAZI = (ustuneYaz: Record<string, any> = {}) => ({
  id: 12,
  slug: 'kis-aylarinda-tasinmak',
  title: 'Kış aylarında taşınmak',
  content: '<p>Metin</p>',
  isActive: false,
  publishedAt: null,
  ...ustuneYaz,
})

const GOVDE = (ustuneYaz: Record<string, any> = {}) => ({
  id: 12,
  title: 'Kış aylarında taşınmak',
  slug: 'kis-aylarinda-tasinmak',
  content: '<p>Metin</p>',
  ...ustuneYaz,
})

beforeEach(() => {
  vi.clearAllMocks()
  kokMock.kokYoluDenetle.mockResolvedValue(null)
  ;(postsRepository.create as any).mockImplementation(async (d: any) => ({ id: 9, ...d }))
  ;(postsRepository.update as any).mockImplementation(async (_s: string, d: any) => d)
  ;(postsRepository.setPublication as any).mockImplementation(async (s: string, d: any) => ({ slug: s, ...d }))
})

// ─────────────────────────────────────────────────────────── oluşturma

describe('create — kök adres denetimi', () => {
  it('adres denetleniyor ve TASLAK OLSA BİLE reddedilebiliyor', async () => {
    kokMock.kokYoluDenetle.mockResolvedValue(CAKISMA)

    const s: any = await postsService.create(GOVDE({ slug: 'pendik' }))

    expect(s.success).toBe(false)
    expect(s.error).toBe(CAKISMA.message)
    // YAZMA YOK: reddedilen istek veri tabanına dokunmuyor.
    expect(postsRepository.create).not.toHaveBeenCalled()
  })

  it('denetim yeni kayıt için HARİÇ TUTMASIZ çağrılıyor', async () => {
    await postsService.create(GOVDE({ slug: 'yeni-yazi' }))
    expect(kokMock.kokYoluDenetle).toHaveBeenCalledWith('yeni-yazi')
  })

  it('serbest adres oluşturuluyor', async () => {
    const s: any = await postsService.create(GOVDE({ slug: 'yeni-yazi' }))
    expect(s.success).toBe(true)
    expect(postsRepository.create).toHaveBeenCalled()
  })

  it('geçersiz biçim reddediliyor — hata metni yöneticiye geçiyor', async () => {
    kokMock.kokYoluDenetle.mockResolvedValue({
      code: 'GECERSIZ_ADRES',
      path: '/Kış Yazısı',
      message: '"Kış Yazısı" geçerli bir adres değil. Sorun: büyük harf, boşluk.',
    })

    const s: any = await postsService.create(GOVDE({ slug: 'Kış Yazısı' }))

    expect(s.success).toBe(false)
    expect(s.error).toContain('geçerli bir adres değil')
    expect(postsRepository.create).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────── kendi kaydı (§34)

describe('update — kendi kaydı çakışma SAYILMIYOR', () => {
  it('adres değişmediğinde denetim HİÇ çağrılmıyor', async () => {
    ;(postsRepository.findById as any).mockResolvedValue(YAZI({ isActive: true }))

    const s: any = await postsService.update(GOVDE({ title: 'Yeni başlık' }))

    expect(s.success).toBe(true)
    expect(kokMock.kokYoluDenetle).not.toHaveBeenCalled()
  })

  it('YAYINDAKİ yazının içeriği serbestçe düzenlenebiliyor', async () => {
    ;(postsRepository.findById as any).mockResolvedValue(YAZI({ isActive: true }))

    const s: any = await postsService.update(GOVDE({ content: '<p>Gözden geçirildi</p>' }))

    expect(s.success).toBe(true)
    expect(postsRepository.update).toHaveBeenCalled()
  })

  it('adres sütununa DOKUNULMUYOR — değişmeyen istek slug yazmıyor', async () => {
    ;(postsRepository.findById as any).mockResolvedValue(YAZI())

    await postsService.update(GOVDE())

    expect((postsRepository.update as any).mock.calls[0][1]).not.toHaveProperty('slug')
  })

  it('baştaki eğik çizgi adres DEĞİŞTİ sanılmıyor', async () => {
    ;(postsRepository.findById as any).mockResolvedValue(YAZI())

    await postsService.update(GOVDE({ slug: '/kis-aylarinda-tasinmak' }))

    expect(kokMock.kokYoluDenetle).not.toHaveBeenCalled()
  })
})

// ────────────────────────────────────── yayındaki adres değişmez (§13)

describe('update — YAYINDAKİ adres değiştirilemiyor', () => {
  it('yayındaki yazının adresi reddediliyor', async () => {
    ;(postsRepository.findById as any).mockResolvedValue(YAZI({ isActive: true }))

    const s: any = await postsService.update(GOVDE({ slug: 'yeni-adres' }))

    expect(s.success).toBe(false)
    expect(s.error).toContain('Yayındaki bir yazının adresi doğrudan değiştirilemez')
    expect(s.error).toContain('Önce yayından kaldırın')
    expect(postsRepository.update).not.toHaveBeenCalled()
  })

  it('red, çakışma OLMASA BİLE geçerli — sebep yönlendirme sisteminin yokluğu', async () => {
    ;(postsRepository.findById as any).mockResolvedValue(YAZI({ isActive: true }))
    kokMock.kokYoluDenetle.mockResolvedValue(null) // adres bomboş

    const s: any = await postsService.update(GOVDE({ slug: 'bos-adres' }))

    expect(s.success).toBe(false)
    // Denetime hiç gerek kalmadan reddediliyor.
    expect(kokMock.kokYoluDenetle).not.toHaveBeenCalled()
  })

  it('TASLAK yazının adresi serbest bir adrese taşınabiliyor', async () => {
    ;(postsRepository.findById as any).mockResolvedValue(YAZI({ isActive: false }))

    const s: any = await postsService.update(GOVDE({ slug: 'yeni-adres' }))

    expect(s.success).toBe(true)
    expect(kokMock.kokYoluDenetle).toHaveBeenCalledWith('yeni-adres', {
      mevcutYol: 'kis-aylarinda-tasinmak',
    })
    // Eski adres anahtar, yeni adres yazılan değer.
    const [anahtar, veri] = (postsRepository.update as any).mock.calls[0]
    expect(anahtar).toBe('kis-aylarinda-tasinmak')
    expect(veri.slug).toBe('yeni-adres')
  })

  it('TASLAK yazı DOLU bir adrese taşınamıyor', async () => {
    ;(postsRepository.findById as any).mockResolvedValue(YAZI({ isActive: false }))
    kokMock.kokYoluDenetle.mockResolvedValue(CAKISMA)

    const s: any = await postsService.update(GOVDE({ slug: 'pendik' }))

    expect(s.success).toBe(false)
    expect(s.error).toBe(CAKISMA.message)
    expect(postsRepository.update).not.toHaveBeenCalled()
  })
})

describe('update — kimlik', () => {
  it('kimlik `id` — adres değişse bile kayıt bulunuyor', async () => {
    ;(postsRepository.findById as any).mockResolvedValue(YAZI())

    await postsService.update(GOVDE({ slug: 'yeni-adres' }))

    expect(postsRepository.findById).toHaveBeenCalledWith(12)
    expect(postsRepository.findBySlug).not.toHaveBeenCalled()
  })

  it('`id` yoksa eski davranış — slug hem kimlik hem adres', async () => {
    ;(postsRepository.findBySlug as any).mockResolvedValue(YAZI())

    const govde: any = GOVDE()
    delete govde.id
    await postsService.update(govde)

    expect(postsRepository.findBySlug).toHaveBeenCalledWith('kis-aylarinda-tasinmak')
    expect(postsRepository.findById).not.toHaveBeenCalled()
  })

  it('olmayan kayıt için okunur hata dönüyor', async () => {
    ;(postsRepository.findById as any).mockResolvedValue(null)

    const s: any = await postsService.update(GOVDE())

    expect(s.success).toBe(false)
    expect(s.error).toBe('Güncellenecek yazı bulunamadı.')
  })
})

// ──────────────────────────────────────── yayın anı yeniden denetim (§12)

describe('publish — kök adres YENİDEN denetleniyor', () => {
  it('taslak kaydedildikten sonra oluşan çakışma yayını DURDURUYOR', async () => {
    ;(postsRepository.findBySlug as any).mockResolvedValue(YAZI({ slug: 'pendik' }))
    kokMock.kokYoluDenetle.mockResolvedValue(CAKISMA)

    const s: any = await postsService.publish('pendik')

    expect(s.success).toBe(false)
    expect(s.error).toContain('Yayına alınamadı')
    expect(s.error).toContain('bölge sayfası tarafından kullanılıyor')
    // YAYIN DURUMU DEĞİŞMİYOR.
    expect(postsRepository.setPublication).not.toHaveBeenCalled()
  })

  it('denetim KENDİ kaydını hariç tutuyor — yoksa her yayın reddedilirdi', async () => {
    ;(postsRepository.findBySlug as any).mockResolvedValue(YAZI())

    await postsService.publish('kis-aylarinda-tasinmak')

    expect(kokMock.kokYoluDenetle).toHaveBeenCalledWith('kis-aylarinda-tasinmak', {
      haric: { haricYaziSlug: 'kis-aylarinda-tasinmak' },
    })
  })

  it('çakışma yoksa yayına alınıyor', async () => {
    ;(postsRepository.findBySlug as any).mockResolvedValue(YAZI())

    const s: any = await postsService.publish('kis-aylarinda-tasinmak')

    expect(s.success).toBe(true)
    expect(postsRepository.setPublication).toHaveBeenCalled()
  })

  it('içerik denetimi ÖNCE çalışıyor — eksik yazı için adres sorgusu atılmıyor', async () => {
    ;(postsRepository.findBySlug as any).mockResolvedValue(YAZI({ title: '  ' }))

    const s: any = await postsService.publish('kis-aylarinda-tasinmak')

    expect(s.success).toBe(false)
    expect(s.error).toContain('başlık boş')
    expect(kokMock.kokYoluDenetle).not.toHaveBeenCalled()
  })

  it('YAYINDAN KALDIRMA adres denetimi İSTEMİYOR', async () => {
    // Çakışan bir sayfayı dizinden çekebilmek her zaman mümkün olmalı.
    ;(postsRepository.findBySlug as any).mockResolvedValue(YAZI({ isActive: true }))

    const s: any = await postsService.unpublish('kis-aylarinda-tasinmak')

    expect(s.success).toBe(true)
    expect(kokMock.kokYoluDenetle).not.toHaveBeenCalled()
  })
})
