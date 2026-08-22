// server/domain/regions/regions.publication.test.ts
//
// İSTANBUL İLÇESİ YAYIN AKIŞI.
//
// Denetimde bulunan somut açık: `RegionPanel`'deki `isActive` onay kutusu
// doğrudan `PUT /api/regions`'a gidiyor ve `regionsService.update` hiçbir
// kapı çalıştırmıyordu — on maddelik kalite kapısı yalnız komut satırında
// anlamlıydı. Buradaki testler o yolun kapalı kalmasını sağlıyor.
//
// İSTANBUL DIŞI 336 legacy kayıt bu akışın DIŞINDA: onların kapısı yok ve
// mevcut davranışları korunuyor.
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Kök ad alanı denetimi burada devre dışı (varsayılan: çakışma yok) —
// bu dosya İLÇE YAYIN KAPISINI test ediyor. Adres çakışması testleri
// regions.rootpath.test.ts içinde.
vi.mock('../shared/root-paths.ts', () => ({
  kokYolunuNormallestir: (v: unknown) => String(v ?? '').trim().replace(/^\/+/, ''),
  kokYoluDenetle: vi.fn(async () => null),
}))

vi.mock('./regions.repository.ts', () => ({
  regionsRepository: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findForGeoIndex: vi.fn(),
    findForDistrictGate: vi.fn(),
    countActiveNeighborhoods: vi.fn(),
    setActive: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

import { regionsRepository } from './regions.repository.ts'
import { regionsService } from './regions.service.ts'

/** Kapıdan geçen bir İstanbul ilçesi. */
const PENDIK = (ustuneYaz: Record<string, any> = {}) => ({
  id: 7,
  slug: 'pendik',
  title: 'Pendik Evden Eve Nakliyat',
  subtitle: 'Pendik',
  excerpt: 'Pendik’te taşınma planı sokak ve kat durumuna göre kuruluyor.',
  content: `<p>${'Pendik yapı stoku ağırlıkla 2000 sonrası site düzeninde. '.repeat(6)}</p>`,
  metaDescription:
    'Pendik evden eve nakliyat: keşif, ambalajlama ve marangozlu kurulum. Sokak ve kat durumu yerinde ölçülür.',
  imageAlt: 'Pendik’te nakliyat ekibimiz',
  cities: [34],
  neighborhoods: ['Kaynarca', 'Yayalar'],
  faqs: [{ question: 'Asansör yoksa?', answer: 'Keşifte belirleniyor.' }],
  isActive: false,
  ...ustuneYaz,
})

/** İstanbul dışı legacy kayıt. */
const NILUFER = (ustuneYaz: Record<string, any> = {}) => ({
  id: 296,
  slug: 'nilufer',
  title: 'Nilüfer Evden Eve Nakliyat',
  subtitle: 'Nilüfer',
  content: '<p>Kısa</p>',
  metaDescription: '',
  cities: [16],
  neighborhoods: [],
  faqs: [],
  isActive: false,
  ...ustuneYaz,
})

beforeEach(() => {
  vi.clearAllMocks()
  ;(regionsRepository.findForDistrictGate as any).mockResolvedValue([PENDIK(), NILUFER()])
  ;(regionsRepository.countActiveNeighborhoods as any).mockResolvedValue(0)
  ;(regionsRepository.setActive as any).mockResolvedValue({})
  ;(regionsRepository.update as any).mockResolvedValue({})
  ;(regionsRepository.create as any).mockImplementation(async (d: any) => d)
})

// ─────────────────────────────────────────────── genel güncelleme bypass'ı

describe('update — genel isActive bypass\'ı kapalı', () => {
  it('İSTANBUL İLÇESİNDE gövdedeki isActive repository\'ye GEÇMİYOR', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(PENDIK())

    await regionsService.update({ slug: 'pendik', title: 'Pendik', isActive: true } as any)

    expect((regionsRepository.update as any).mock.calls[0][1].isActive).toBeUndefined()
  })

  it('LEGACY kayıtta isActive eskisi gibi geçiyor (davranış korundu)', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(NILUFER())

    await regionsService.update({ slug: 'nilufer', title: 'Nilüfer', isActive: true } as any)

    expect((regionsRepository.update as any).mock.calls[0][1].isActive).toBe(true)
  })

  it('olmayan kayıt için hata dönüyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(null)

    const s: any = await regionsService.update({ slug: 'yok', title: 'x' } as any)

    expect(s.success).toBe(false)
    expect(regionsRepository.update).not.toHaveBeenCalled()
  })
})

describe('create — yeni İstanbul ilçesi taslak başlıyor', () => {
  it('gövde isActive:true gönderse bile pasif yaratılıyor', async () => {
    await regionsService.create({
      slug: 'yeni-ilce',
      title: 'Yeni',
      cities: [34],
      isActive: true,
    } as any)

    expect((regionsRepository.create as any).mock.calls[0][0].isActive).toBe(false)
  })

  it('LEGACY kayıtta mevcut davranış korunuyor', async () => {
    await regionsService.create({
      slug: 'yeni-legacy',
      title: 'Yeni',
      cities: [16],
      isActive: true,
    } as any)

    expect((regionsRepository.create as any).mock.calls[0][0].isActive).toBe(true)
  })
})

// ────────────────────────────────────────── yayındaki ilçe düzenleme koruması

describe('update — yayındaki ilçe kapının altına düşürülemiyor', () => {
  it('metaDescription boşaltma REDDEDİLİYOR', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(PENDIK({ isActive: true }))

    const s: any = await regionsService.update({
      slug: 'pendik',
      title: 'Pendik',
      metaDescription: '',
    } as any)

    expect(s.success).toBe(false)
    expect(s.error).toContain('kalite kapısının altına')
    expect(regionsRepository.update).not.toHaveBeenCalled()
  })

  it('içerik kısaltma REDDEDİLİYOR', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(PENDIK({ isActive: true }))

    const s: any = await regionsService.update({
      slug: 'pendik',
      title: 'Pendik',
      content: '<p>Kısa.</p>',
    } as any)

    expect(s.success).toBe(false)
    expect(regionsRepository.update).not.toHaveBeenCalled()
  })

  it('SESSİZ yayından kaldırma YAPILMIYOR — kural listesi dönüyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(PENDIK({ isActive: true }))

    const s: any = await regionsService.update({ slug: 'pendik', title: '' } as any)

    expect(s.success).toBe(false)
    expect(regionsRepository.setActive).not.toHaveBeenCalled()
    expect(s.kapi.kurallar.find((k: any) => k.anahtar === 'title').gecti).toBe(false)
  })

  it('geçerli düzenleme KABUL ediliyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(PENDIK({ isActive: true }))

    const s: any = await regionsService.update({
      slug: 'pendik',
      title: 'Pendik Evden Eve Nakliyat',
    } as any)

    expect(s.success).toBe(true)
    expect(regionsRepository.update).toHaveBeenCalled()
  })

  it('PASİF ilçede kapı çalışmıyor — taslak eksik içerikle kaydedilebiliyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(PENDIK({ isActive: false }))

    const s: any = await regionsService.update({ slug: 'pendik', title: '', content: '' } as any)

    expect(s.success).toBe(true)
    expect(regionsRepository.update).toHaveBeenCalled()
  })

  it('LEGACY kayıt İstanbul kapısından GEÇİRİLMİYOR', async () => {
    // Nilüfer kaydı kapıyı geçemezdi (meta boş, içerik kısa, mahalle yok)
    // ama o kapı ona hiç uygulanmıyor.
    ;(regionsRepository.findUnique as any).mockResolvedValue(NILUFER({ isActive: true }))

    const s: any = await regionsService.update({ slug: 'nilufer', title: 'Nilüfer' } as any)

    expect(s.success).toBe(true)
    expect(regionsRepository.update).toHaveBeenCalled()
  })
})

// ────────────────────────────────────────────────────── yayın eylemleri

describe('publishDistrict', () => {
  it('kapıdan geçen ilçeyi yayına alıyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(PENDIK())

    const s: any = await regionsService.publishDistrict('pendik')

    expect(s.success).toBe(true)
    expect(regionsRepository.setActive).toHaveBeenCalledWith('pendik', true)
  })

  it('kapıdan geçemeyen ilçede VERİ TABANINA DOKUNULMUYOR', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(PENDIK({ metaDescription: '' }))

    const s: any = await regionsService.publishDistrict('pendik')

    expect(s.success).toBe(false)
    expect(regionsRepository.setActive).not.toHaveBeenCalled()
    expect(s.kapi.hatalar).toContain('metaDescription boş')
  })

  it('AYNI açıklamayı taşıyan iki ilçe kapıda kalıyor', async () => {
    const ayni = 'Aynı açıklama iki ilçede.'
    ;(regionsRepository.findForDistrictGate as any).mockResolvedValue([
      PENDIK({ metaDescription: ayni }),
      PENDIK({ id: 8, slug: 'kartal', metaDescription: ayni }),
    ])
    ;(regionsRepository.findUnique as any).mockResolvedValue(PENDIK({ metaDescription: ayni }))

    const s: any = await regionsService.publishDistrict('pendik')

    expect(s.success).toBe(false)
    expect(s.kapi.hatalar).toContain('metaDescription başka ilçeyle aynı')
  })

  it('İSTANBUL DIŞI kayıt bu eylemi kullanamıyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(NILUFER())

    const s: any = await regionsService.publishDistrict('nilufer')

    expect(s.success).toBe(false)
    expect(s.error).toContain('İstanbul ilçesi değil')
    expect(regionsRepository.setActive).not.toHaveBeenCalled()
  })
})

describe('unpublishDistrict', () => {
  it('yayından kaldırıyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(PENDIK({ isActive: true }))

    const s: any = await regionsService.unpublishDistrict('pendik')

    expect(s.success).toBe(true)
    expect(regionsRepository.setActive).toHaveBeenCalledWith('pendik', false)
  })

  it('YAYINDAKİ MAHALLESİ olan ilçe yayından kaldırılamıyor', async () => {
    // Mahalle kapısının 2. maddesi "ebeveyn ilçe yayında" diyor; ilçe
    // sessizce kaldırılsaydı çocukları kapıyı geçemedikleri hâlde yayında
    // kalırdı (M1 değişmezi).
    ;(regionsRepository.findUnique as any).mockResolvedValue(PENDIK({ isActive: true }))
    ;(regionsRepository.countActiveNeighborhoods as any).mockResolvedValue(3)

    const s: any = await regionsService.unpublishDistrict('pendik')

    expect(s.success).toBe(false)
    expect(s.error).toContain('3 yayındaki mahalle')
    expect(regionsRepository.setActive).not.toHaveBeenCalled()
  })

  it('SESSİZ zincirleme kaldırma YAPILMIYOR', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(PENDIK({ isActive: true }))
    ;(regionsRepository.countActiveNeighborhoods as any).mockResolvedValue(1)

    await regionsService.unpublishDistrict('pendik')

    expect(regionsRepository.setActive).not.toHaveBeenCalled()
  })

  it('yayından kaldırma KAPIDAN GEÇMEYİ GEREKTİRMİYOR', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(
      PENDIK({ isActive: true, title: null, content: null })
    )

    const s: any = await regionsService.unpublishDistrict('pendik')

    expect(s.success).toBe(true)
    expect(regionsRepository.setActive).toHaveBeenCalledWith('pendik', false)
  })

  it('İSTANBUL DIŞI kayıt bu eylemi kullanamıyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(NILUFER({ isActive: true }))

    const s: any = await regionsService.unpublishDistrict('nilufer')

    expect(s.success).toBe(false)
    expect(regionsRepository.setActive).not.toHaveBeenCalled()
  })
})

describe('districtGateStatusAll — CLI ile panel aynı sonucu üretiyor', () => {
  it('yalnız İstanbul ilçelerini değerlendiriyor', async () => {
    const s: any = await regionsService.districtGateStatusAll()

    expect(s.success).toBe(true)
    expect(s.data.map((x: any) => x.slug)).toEqual(['pendik'])
  })

  it('tek kayıt raporu ile toplu rapor AYNI sonucu veriyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(PENDIK())

    const tekil: any = await regionsService.districtGateStatus('pendik')
    const toplu: any = await regionsService.districtGateStatusAll()

    expect(tekil.data.gecti).toBe(toplu.data[0].kapi.gecti)
    expect(tekil.data.kurallar.map((k: any) => [k.anahtar, k.gecti])).toEqual(
      toplu.data[0].kapi.kurallar.map((k: any) => [k.anahtar, k.gecti])
    )
  })

  it('kaydın KENDİ açıklaması çakışma sayılmıyor', async () => {
    const s: any = await regionsService.districtGateStatusAll()
    const metaKural = s.data[0].kapi.kurallar.find((k: any) => k.anahtar === 'meta-benzersiz')
    expect(metaKural.gecti).toBe(true)
  })
})
