// server/domain/regions/regions.rootpath.test.ts
//
// BÖLGE — KÖK ADRES KORUMASI.
//
// Bölgeler de kök adreste yayınlanıyor (`/pendik`), yani yazılar, hizmetler,
// mahalleler ve statik sayfalarla aynı ad alanını paylaşıyorlar. 375 kayıtla
// bu ailenin ad alanındaki payı en büyüğü.
//
// İKİ AİLE, TEK KORUMA: 39 İstanbul ilçesinin M2'de kurulmuş kalite kapısı
// var, 336 legacy kaydın yok. Adres koruması ikisinde de AYNI çalışıyor
// çünkü ikisi de aynı kök adresi tutuyor; ayrılan tek şey yayın anlamı.
import { beforeEach, describe, expect, it, vi } from 'vitest'

const kokMock = vi.hoisted(() => ({ kokYoluDenetle: vi.fn() }))

vi.mock('../shared/root-paths.ts', () => ({
  kokYolunuNormallestir: (v: unknown) => String(v ?? '').trim().replace(/^\/+/, ''),
  kokYoluDenetle: kokMock.kokYoluDenetle,
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

const CAKISMA = {
  code: 'KOK_ADRES_CAKISMASI' as const,
  path: '/esya-depolama',
  conflictingType: 'hizmet sayfası',
  conflictingLabel: 'Eşya Depolama',
  message: '/esya-depolama adresi zaten hizmet sayfası tarafından kullanılıyor ("Eşya Depolama").',
}

/** Kalite kapısından geçen bir İstanbul ilçesi. */
const ILCE = (ustuneYaz: Record<string, any> = {}) => ({
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
  neighborhoods: ['Kaynarca'],
  faqs: [{ question: 'Asansör yoksa?', answer: 'Yöntem keşifte belirleniyor.' }],
  isActive: false,
  ...ustuneYaz,
})

/** İstanbul DIŞI legacy kayıt — kapısı yok. */
const LEGACY = (ustuneYaz: Record<string, any> = {}) => ({
  id: 300,
  slug: 'adana',
  title: 'Adana Evden Eve Nakliyat',
  cities: [1],
  isActive: false,
  ...ustuneYaz,
})

beforeEach(() => {
  vi.clearAllMocks()
  kokMock.kokYoluDenetle.mockResolvedValue(null)
  ;(regionsRepository.create as any).mockImplementation(async (d: any) => ({ id: 1, ...d }))
  ;(regionsRepository.update as any).mockImplementation(async (_s: string, d: any) => d)
  ;(regionsRepository.findForDistrictGate as any).mockResolvedValue([])
  ;(regionsRepository.countActiveNeighborhoods as any).mockResolvedValue(0)
})

// ─────────────────────────────────────────────────────────── oluşturma

describe('create — kök adres denetimi', () => {
  it('dolu adres reddediliyor ve KAYIT YARATILMIYOR', async () => {
    kokMock.kokYoluDenetle.mockResolvedValue(CAKISMA)

    const s: any = await regionsService.create({ slug: 'esya-depolama', title: 'Depolama Bölgesi' })

    expect(s.success).toBe(false)
    expect(s.error).toBe(CAKISMA.message)
    expect(regionsRepository.create).not.toHaveBeenCalled()
  })

  it('statik rota reddediliyor', async () => {
    kokMock.kokYoluDenetle.mockResolvedValue({
      code: 'KOK_ADRES_CAKISMASI',
      path: '/iletisim',
      conflictingType: 'statik sayfa',
      message: '/iletisim sistem tarafından ayrılmış bir adrestir.',
    })

    const s: any = await regionsService.create({ slug: 'iletisim', title: 'İletişim Bölgesi' })

    expect(s.success).toBe(false)
    expect(s.error).toContain('sistem tarafından ayrılmış')
    expect(regionsRepository.create).not.toHaveBeenCalled()
  })

  it('serbest adres yaratılıyor', async () => {
    const s: any = await regionsService.create({ slug: 'sancaktepe', title: 'Sancaktepe', cities: [34] })
    expect(s.success).toBe(true)
    expect(regionsRepository.create).toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────── kendi kaydı ve yayın (§15)

describe('update — kendi adresini koruyan kayıt', () => {
  it('adres değişmediğinde denetim ÇAĞRILMIYOR', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(LEGACY())

    const s: any = await regionsService.update({ id: 300, slug: 'adana', title: 'Adana' })

    expect(s.success).toBe(true)
    expect(kokMock.kokYoluDenetle).not.toHaveBeenCalled()
  })

  it('adres sütununa dokunulmuyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(LEGACY())

    await regionsService.update({ id: 300, slug: 'adana', title: 'Adana' })

    expect((regionsRepository.update as any).mock.calls[0][1]).not.toHaveProperty('slug')
  })

  it('/istanbul kaydı slug\'ına dokunmadan güncellenebiliyor', async () => {
    // §20: mevcut sahibin mevcut adresi korunuyor. Adres değişmediği için
    // denetim hiç çalışmıyor — devredilmiş adres bu yolla ayakta kalıyor.
    ;(regionsRepository.findUnique as any).mockResolvedValue(
      LEGACY({ id: 122, slug: 'istanbul', title: 'İstanbul Evden Eve Nakliyat', isActive: true })
    )

    const s: any = await regionsService.update({
      id: 122,
      slug: 'istanbul',
      title: 'İstanbul Evden Eve Nakliyat',
      excerpt: 'Güncellenmiş özet',
    })

    expect(s.success).toBe(true)
    expect(kokMock.kokYoluDenetle).not.toHaveBeenCalled()
  })
})

describe('update — YAYINDAKİ adres değiştirilemiyor', () => {
  it('yayındaki İSTANBUL İLÇESİ reddediliyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(ILCE({ isActive: true }))

    const s: any = await regionsService.update({ id: 7, slug: 'pendik-merkez', title: 'Pendik' })

    expect(s.success).toBe(false)
    expect(s.error).toContain('Yayındaki bir bölgenin adresi doğrudan değiştirilemez')
    expect(regionsRepository.update).not.toHaveBeenCalled()
  })

  it('yayındaki LEGACY kayıt da reddediliyor — ikisi de kök adres tutuyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(LEGACY({ isActive: true }))

    const s: any = await regionsService.update({ id: 300, slug: 'adana-nakliyat', title: 'Adana' })

    expect(s.success).toBe(false)
    expect(s.error).toContain('Yayındaki bir bölgenin adresi doğrudan değiştirilemez')
    expect(regionsRepository.update).not.toHaveBeenCalled()
  })

  it('red, KALİTE KAPISINDAN ÖNCE geliyor — ilçe kapısı hiç yüklenmiyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(ILCE({ isActive: true }))

    await regionsService.update({ id: 7, slug: 'pendik-merkez', title: 'Pendik' })

    expect(regionsRepository.findForDistrictGate).not.toHaveBeenCalled()
  })

  it('PASİF kayıt serbest adrese taşınabiliyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(LEGACY({ isActive: false }))

    const s: any = await regionsService.update({ id: 300, slug: 'adana-merkez', title: 'Adana' })

    expect(s.success).toBe(true)
    expect(kokMock.kokYoluDenetle).toHaveBeenCalledWith('adana-merkez', { mevcutYol: 'adana' })
    const [anahtar, veri] = (regionsRepository.update as any).mock.calls[0]
    expect(anahtar).toBe('adana')
    expect(veri.slug).toBe('adana-merkez')
  })

  it('PASİF kayıt DOLU adrese taşınamıyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(LEGACY({ isActive: false }))
    kokMock.kokYoluDenetle.mockResolvedValue(CAKISMA)

    const s: any = await regionsService.update({ id: 300, slug: 'esya-depolama', title: 'Adana' })

    expect(s.success).toBe(false)
    expect(s.error).toBe(CAKISMA.message)
    expect(regionsRepository.update).not.toHaveBeenCalled()
  })

  it('kimlik `id` — adres değişse bile kayıt bulunuyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(LEGACY())

    await regionsService.update({ id: 300, slug: 'adana-merkez', title: 'Adana' })

    expect(regionsRepository.findUnique).toHaveBeenCalledWith({ id: 300 })
  })

  it('`id` yoksa eski davranış korunuyor — slug ile aranıyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(LEGACY())

    await regionsService.update({ slug: 'adana', title: 'Adana' })

    expect(regionsRepository.findUnique).toHaveBeenCalledWith({ slug: 'adana' })
  })
})

// ────────────────────────────────── yayın anı yeniden denetim (§18/§36)

describe('publishDistrict — kök adres YENİDEN denetleniyor', () => {
  it('çakışma yayını durduruyor ve KAYIT DEĞİŞMİYOR', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(ILCE())
    kokMock.kokYoluDenetle.mockResolvedValue(CAKISMA)

    const s: any = await regionsService.publishDistrict('pendik')

    expect(s.success).toBe(false)
    expect(s.error).toContain('Yayına alınamadı')
    expect(regionsRepository.setActive).not.toHaveBeenCalled()
  })

  it('denetim KENDİ kaydını hariç tutuyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(ILCE())

    await regionsService.publishDistrict('pendik')

    expect(kokMock.kokYoluDenetle).toHaveBeenCalledWith('pendik', {
      haric: { haricBolgeSlug: 'pendik' },
    })
  })

  it('KALİTE KAPISI önce çalışıyor — kapıyı geçemeyen ilçe için adres sorgusu yok', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(ILCE({ metaDescription: '' }))

    const s: any = await regionsService.publishDistrict('pendik')

    expect(s.success).toBe(false)
    expect(s.error).toContain('metaDescription')
    expect(kokMock.kokYoluDenetle).not.toHaveBeenCalled()
  })

  it('temiz kayıt yayına alınıyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(ILCE())

    const s: any = await regionsService.publishDistrict('pendik')

    expect(s.success).toBe(true)
    expect(regionsRepository.setActive).toHaveBeenCalledWith('pendik', true)
  })

  it('YAYINDAN KALDIRMA adres denetimi istemiyor', async () => {
    ;(regionsRepository.findUnique as any).mockResolvedValue(ILCE({ isActive: true }))

    const s: any = await regionsService.unpublishDistrict('pendik')

    expect(s.success).toBe(true)
    expect(kokMock.kokYoluDenetle).not.toHaveBeenCalled()
  })
})
