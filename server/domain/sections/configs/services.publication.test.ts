// server/domain/sections/configs/services.publication.test.ts
//
// HİZMET YAYIN DURUMU.
//
// `slug` verilen her hizmet anında canlıydı: kök adreste sayfa açılıyor,
// `/hizmetlerimiz` dizinine giriyor ve sitemap'e ekleniyordu. Yeni bir
// hizmet taslak hâlde hazırlanamıyordu.
//
// Buradaki en kırılgan davranış, bölüm kaydının her PUT'ta `Service`
// satırlarını SİLİP YENİDEN YARATMASI: yayın durumu güncelleme boyunca
// taşınmazsa her kayıtta bütün hizmetler taslağa düşer.
import { beforeEach, describe, expect, it, vi } from 'vitest'

// `vi.mock` dosyanın en üstüne kaldırılıyor (hoisting); sahte istemci bu
// yüzden `vi.hoisted` içinde kuruluyor, aksi hâlde fabrika çağrıldığında
// değişken henüz tanımlı olmuyor.
const prismaMock = vi.hoisted(() => ({
  services: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  service: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
}))

vi.mock('../../../utils/prisma', () => ({ default: prismaMock }))

// Kök ad alanı denetimi burada devre dışı (varsayılan: çakışma yok) — bu
// dosya YAYIN DURUMUNU test ediyor. Aday kümenin çakışma denetimi ve yıkıcı
// silmeden önce durdurulması services.rootpath.test.ts içinde.
vi.mock('../../shared/root-paths', () => ({
  kokYolunuNormallestir: (v: unknown) => String(v ?? '').trim().replace(/^\/+/, ''),
  kokAdresleriTopla: vi.fn(async () => ({
    hepsi: new Set<string>(),
    mahalleler: new Set<string>(),
    disKaynaklar: new Set<string>(),
    sahip: new Map<string, string>(),
    etiketler: new Map<string, string>(),
  })),
  kokCakismasiniBul: vi.fn(() => null),
  kokYoluDenetle: vi.fn(async () => null),
}))

import { servicesSectionService } from './services.config'

const HIZMET = (ustuneYaz: Record<string, any> = {}) => ({
  id: 66,
  slug: 'esya-depolama',
  title: 'Eşya Depolama',
  excerpt: 'Kısa süreli ve uzun süreli depolama.',
  content: '<p>Depolama süreci</p>',
  order: 4,
  isActive: false,
  ...ustuneYaz,
})

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.service.update.mockImplementation(async ({ where, data }: any) => ({ ...where, ...data }))
})

// ───────────────────────────────────────────────── herkese açık süzgeç

describe('get — taslak sızıntısı yok', () => {
  const BOLUM = {
    id: 1,
    mainTitle: 'Hizmetler',
    services: [
      HIZMET({ slug: 'evden-eve-nakliyat', isActive: true, order: 0 }),
      HIZMET({ slug: 'esya-depolama', isActive: false, order: 4 }),
      HIZMET({ slug: 'paketleme-hizmeti', isActive: true, order: 6 }),
    ],
  }

  it('herkese açık okuma TASLAK hizmetleri çıkarıyor', async () => {
    prismaMock.services.findFirst.mockResolvedValue(BOLUM)

    const s: any = await servicesSectionService.get()

    expect(s.data.services.map((x: any) => x.slug)).toEqual([
      'evden-eve-nakliyat',
      'paketleme-hizmeti',
    ])
  })

  it('yönetici okuması taslakları da görüyor', async () => {
    prismaMock.services.findFirst.mockResolvedValue(BOLUM)

    const s: any = await servicesSectionService.get({ includeDrafts: true })

    expect(s.data.services).toHaveLength(3)
  })

  it('süzme SIRAYI bozmuyor — kalanlar mevcut order ile geliyor', async () => {
    prismaMock.services.findFirst.mockResolvedValue(BOLUM)

    const s: any = await servicesSectionService.get()

    expect(s.data.services.map((x: any) => x.order)).toEqual([0, 6])
  })

  it('bölüm kaydı yoksa yanıt olduğu gibi geçiyor', async () => {
    prismaMock.services.findFirst.mockResolvedValue(null)

    const s: any = await servicesSectionService.get()

    expect(s.data).toBe(null)
  })
})

// ───────────────────────────────────────────── güncelleme boyunca koruma

describe('update — yayın durumu satır yeniden yaratılırken KORUNUYOR', () => {
  beforeEach(() => {
    prismaMock.services.update.mockResolvedValue({ id: 1, services: [] })
  })

  it('yayındaki hizmet güncelleme sonrası yayında kalıyor', async () => {
    prismaMock.service.findMany.mockResolvedValue([
      { slug: 'evden-eve-nakliyat', isActive: true },
      { slug: 'esya-depolama', isActive: false },
    ])

    await servicesSectionService.update({
      services: [
        { slug: 'evden-eve-nakliyat', title: 'Evden Eve Nakliyat', order: 0 },
        { slug: 'esya-depolama', title: 'Eşya Depolama', order: 4 },
      ],
    })

    const yazilan = prismaMock.services.update.mock.calls[0][0].data.services.create
    expect(yazilan.find((x: any) => x.slug === 'evden-eve-nakliyat').isActive).toBe(true)
    expect(yazilan.find((x: any) => x.slug === 'esya-depolama').isActive).toBe(false)
  })

  it('YENİ hizmet (haritada olmayan slug) taslak başlıyor', async () => {
    prismaMock.service.findMany.mockResolvedValue([{ slug: 'evden-eve-nakliyat', isActive: true }])

    await servicesSectionService.update({
      services: [
        { slug: 'evden-eve-nakliyat', title: 'Evden Eve Nakliyat', order: 0 },
        { slug: 'yeni-hizmet', title: 'Yeni Hizmet', order: 1 },
      ],
    })

    const yazilan = prismaMock.services.update.mock.calls[0][0].data.services.create
    expect(yazilan.find((x: any) => x.slug === 'yeni-hizmet').isActive).toBe(false)
  })

  it('gövdedeki isActive DİKKATE ALINMIYOR — durum yalnız kayıttan geliyor', async () => {
    prismaMock.service.findMany.mockResolvedValue([{ slug: 'esya-depolama', isActive: false }])

    await servicesSectionService.update({
      services: [
        { slug: 'esya-depolama', title: 'Eşya Depolama', order: 4, ...({ isActive: true } as any) },
      ],
    })

    const yazilan = prismaMock.services.update.mock.calls[0][0].data.services.create
    expect(yazilan[0].isActive).toBe(false)
  })

  it('slug\'ı olmayan hizmet taslak yaratılıyor', async () => {
    prismaMock.service.findMany.mockResolvedValue([])

    await servicesSectionService.update({
      services: [{ title: 'Yalnız kart', order: 0 }],
    })

    const yazilan = prismaMock.services.update.mock.calls[0][0].data.services.create
    expect(yazilan[0].isActive).toBe(false)
    expect(yazilan[0].slug).toBe(null)
  })
})

// ───────────────────────────────────────────────────── yayın eylemleri

describe('publish / unpublish', () => {
  it('geçerli hizmeti yayına alıyor', async () => {
    prismaMock.service.findUnique.mockResolvedValue(HIZMET())

    const s: any = await servicesSectionService.publish('esya-depolama')

    expect(s.success).toBe(true)
    expect(prismaMock.service.update).toHaveBeenCalledWith({
      where: { slug: 'esya-depolama' },
      data: { isActive: true },
    })
  })

  it('başlığı boş hizmet yayına alınamıyor ve KAYIT DEĞİŞMİYOR', async () => {
    prismaMock.service.findUnique.mockResolvedValue(HIZMET({ title: '  ' }))

    const s: any = await servicesSectionService.publish('esya-depolama')

    expect(s.success).toBe(false)
    expect(s.error).toContain('başlık boş')
    expect(prismaMock.service.update).not.toHaveBeenCalled()
  })

  it('içerik ve özet birlikte boşsa yayına alınamıyor', async () => {
    prismaMock.service.findUnique.mockResolvedValue(HIZMET({ content: '', excerpt: '' }))

    const s: any = await servicesSectionService.publish('esya-depolama')

    expect(s.success).toBe(false)
    expect(s.error).toContain('içerik ve özet')
    expect(prismaMock.service.update).not.toHaveBeenCalled()
  })

  it('özet varsa gövde boş olsa da yayına alınabiliyor', async () => {
    prismaMock.service.findUnique.mockResolvedValue(HIZMET({ content: '' }))

    const s: any = await servicesSectionService.publish('esya-depolama')

    expect(s.success).toBe(true)
  })

  it('olmayan hizmet için hata dönüyor', async () => {
    prismaMock.service.findUnique.mockResolvedValue(null)

    const s: any = await servicesSectionService.publish('olmayan')

    expect(s.success).toBe(false)
    expect(prismaMock.service.update).not.toHaveBeenCalled()
  })

  it('yayından kaldırıyor', async () => {
    prismaMock.service.findUnique.mockResolvedValue(HIZMET({ isActive: true }))

    const s: any = await servicesSectionService.unpublish('esya-depolama')

    expect(s.success).toBe(true)
    expect(prismaMock.service.update).toHaveBeenCalledWith({
      where: { slug: 'esya-depolama' },
      data: { isActive: false },
    })
  })

  it('yayından kaldırma içerik denetimi İSTEMİYOR', async () => {
    prismaMock.service.findUnique.mockResolvedValue(HIZMET({ isActive: true, title: '', content: '' }))

    const s: any = await servicesSectionService.unpublish('esya-depolama')

    expect(s.success).toBe(true)
  })
})
