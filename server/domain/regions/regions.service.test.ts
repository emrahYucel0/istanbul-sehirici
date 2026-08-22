import { beforeEach, describe, expect, it, vi } from 'vitest'

// Kök ad alanı yardımcısı mock'lanıyor: Prisma'yı modül yüklenirken içeri
// alıyor ve bu dosya adres çakışmasını değil, sorgu/alan davranışını test
// ediyor. Çakışma testleri regions.rootpath.test.ts ve root-paths.test.ts.
vi.mock('../shared/root-paths.ts', () => ({
  kokYolunuNormallestir: (v: unknown) => String(v ?? '').trim().replace(/^\/+/, ''),
  kokYoluDenetle: vi.fn(async () => null),
}))

vi.mock('./regions.repository', () => ({
  regionsRepository: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    findForDistrictGate: vi.fn(),
    countActiveNeighborhoods: vi.fn(),
    setActive: vi.fn(),
  },
}))

import { regionsRepository } from './regions.repository'
import { regionsService } from './regions.service'

describe('regionsService.get — whereClause oluşturma (geriye dönük uyumluluk)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('varsayılan (public) istekte sadece isActive:true filtrelenir', async () => {
    ;(regionsRepository.findMany as any).mockResolvedValue([])

    await regionsService.get({ includeInactive: false })

    expect(regionsRepository.findMany).toHaveBeenCalledWith({ isActive: true }, { light: undefined })
  })

  it('includeInactive:true (admin modu) iken isActive filtresi hiç eklenmez', async () => {
    ;(regionsRepository.findMany as any).mockResolvedValue([])

    await regionsService.get({ includeInactive: true })

    expect(regionsRepository.findMany).toHaveBeenCalledWith({}, { light: undefined })
  })

  it('cityId verilmişse array_contains filtresi isActive ile birlikte eklenir', async () => {
    ;(regionsRepository.findMany as any).mockResolvedValue([])

    await regionsService.get({ cityId: 34, includeInactive: false })

    expect(regionsRepository.findMany).toHaveBeenCalledWith(
      { cities: { array_contains: 34 }, isActive: true },
      { light: undefined }
    )
  })

  it('slug verilmişse bulunamayan kayıt için anlaşılır bir hata döner', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(null)

    const result: any = await regionsService.get({ slug: 'olmayan-bolge', includeInactive: false })

    expect(result).toEqual({ success: false, error: 'Bölge bulunamadı veya erişim izni yok' })
  })
})

describe('regionsService.get — sayfalama', () => {
  beforeEach(() => vi.clearAllMocks())

  it('page verilmezse bare dizi döner', async () => {
    ;(regionsRepository.findMany as any).mockResolvedValue([{ id: 1 }])

    const result = await regionsService.get({ includeInactive: false })

    expect(result).toEqual({ success: true, data: [{ id: 1 }] })
    expect(regionsRepository.count).not.toHaveBeenCalled()
  })

  it('page verildiğinde {items,total,page,pageSize,totalPages} zarfı döner', async () => {
    ;(regionsRepository.findMany as any).mockResolvedValue([{ id: 1 }, { id: 2 }])
    ;(regionsRepository.count as any).mockResolvedValue(33)

    const result: any = await regionsService.get({ includeInactive: false, page: 1, pageSize: 10 })

    expect(result.data).toEqual({
      items: [{ id: 1 }, { id: 2 }],
      total: 33,
      page: 1,
      pageSize: 10,
      totalPages: 4, // ceil(33/10)
    })
    expect(regionsRepository.findMany).toHaveBeenCalledWith(
      { isActive: true },
      { light: undefined, take: 10, skip: 0 }
    )
  })

  it('count() aynı whereClause ile (isActive dahil) çağrılır — toplam sayı filtrelenmiş kayıt sayısı olmalı', async () => {
    ;(regionsRepository.findMany as any).mockResolvedValue([])
    ;(regionsRepository.count as any).mockResolvedValue(0)

    await regionsService.get({ cityId: 6, includeInactive: false, page: 1, pageSize: 10 })

    expect(regionsRepository.count).toHaveBeenCalledWith({ cities: { array_contains: 6 }, isActive: true })
  })
})

// Bu blok gerçek bir veri kaybını koruma altına alıyor: yalnızca {slug, image}
// taşıyan kısmi bir PUT, istekte olmayan metin alanlarını null'lamış ve bir
// bölgenin içeriğini silmişti. Kural: YOK ≠ BOŞ.
describe('regionsService.update — kısmi istekte veri kaybı olmamalı', () => {
  // `update` artık önce kaydı okuyor: İstanbul ilçesi mi, yayında mı?
  // Bu blok İSTANBUL DIŞI (legacy) bir kayıt üzerinden çalışıyor, yani
  // kalite kapısı devreye girmiyor ve buradaki davranış M2'den önceki
  // hâliyle birebir aynı kalıyor.
  beforeEach(() => {
    vi.clearAllMocks()
    ;(regionsRepository.findUnique as any).mockResolvedValue({
      id: 500,
      slug: 'esenler',
      // `cities` İSTANBUL DIŞI (16 = Bursa): bu blok kısmi güncellemenin
      // veri kaybı üretmemesini test ediyor, sınıflandırmayı değil.
      // İstanbul ilçelerine özgü yayın davranışı ayrı dosyada
      // (regions.publication.test.ts).
      cities: [16],
      isActive: false,
    })
  })

  const yazilanVeri = () => (regionsRepository.update as any).mock.calls[0][1]

  it('istekte olmayan metin alanlarına hiç dokunmaz (undefined geçer)', async () => {
    ;(regionsRepository.update as any).mockResolvedValue({ id: 1 })

    await regionsService.update({ slug: 'esenler', image: '' })

    const veri = yazilanVeri()
    for (const alan of ['subtitle', 'shortTitle', 'content', 'excerpt', 'metaDescription', 'imageAlt', 'priceFactorsTitle', 'priceFactorsImage']) {
      expect(veri[alan], `${alan} korunmalıydı`).toBeUndefined()
    }
  })

  it('boş gönderilen metin alanını null yapar (panelden temizleme çalışsın)', async () => {
    ;(regionsRepository.update as any).mockResolvedValue({ id: 1 })

    await regionsService.update({ slug: 'esenler', image: '', excerpt: '   ' })

    expect(yazilanVeri().image).toBeNull()
    expect(yazilanVeri().excerpt).toBeNull()
  })

  it('dolu değeri kırpmadan aynen yazar', async () => {
    ;(regionsRepository.update as any).mockResolvedValue({ id: 1 })

    await regionsService.update({ slug: 'esenler', content: '<p>Metin</p>\n', image: '/yuklemeler/a.webp' })

    expect(yazilanVeri().content).toBe('<p>Metin</p>\n')
    expect(yazilanVeri().image).toBe('/yuklemeler/a.webp')
  })

  it('JSON derinlik alanları istekte yoksa yine korunur (mevcut davranış)', async () => {
    ;(regionsRepository.update as any).mockResolvedValue({ id: 1 })

    await regionsService.update({ slug: 'esenler', image: '' })

    const veri = yazilanVeri()
    for (const alan of ['cities', 'priceFactors', 'neighborhoods', 'facts', 'faqs', 'routes', 'isActive']) {
      expect(veri[alan], `${alan} korunmalıydı`).toBeUndefined()
    }
  })

  it('tam form gönderen panel isteğinde davranış değişmez', async () => {
    ;(regionsRepository.update as any).mockResolvedValue({ id: 1 })

    await regionsService.update({
      slug: 'esenler',
      title: 'Esenler Evden Eve Nakliyat',
      subtitle: 'Esenler',
      content: '<p>İçerik</p>',
      image: '',
      isActive: true,
      facts: [{ label: 'Otogar', value: 'yakın' }],
    })

    const veri = yazilanVeri()
    expect(veri.title).toBe('Esenler Evden Eve Nakliyat')
    expect(veri.subtitle).toBe('Esenler')
    expect(veri.content).toBe('<p>İçerik</p>')
    expect(veri.image).toBeNull()
    expect(veri.isActive).toBe(true)
    expect(veri.facts).toEqual([{ label: 'Otogar', value: 'yakın' }])
  })
})
