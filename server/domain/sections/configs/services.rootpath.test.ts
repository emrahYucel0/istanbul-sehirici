// server/domain/sections/configs/services.rootpath.test.ts
//
// HİZMET — KÖK ADRES KORUMASI VE YIKICI KAYDIN GÜVENLİĞİ.
//
// ─────────────────────────────────────────────────────────────────────────
// BU AİLE NEDEN AYRI
//
// Hizmetler normal CRUD değil: bölüm kaydı `deleteStrategy: 'manual'` ile
// çalışıyor ve her PUT bütün `Service` satırlarını SİLİP yeniden yaratıyor.
// İki sonucu var —
//
//   1. Denetim satırlar silindikten SONRA yapılamaz: o noktada bulunan bir
//      çakışma veriyi geri getirmeden durdurulamaz. Karar tek noktada,
//      silmeden önce veriliyor ve kısmi kabul yok.
//
//   2. Kimlik SLUG'dır, id değil: satırlar yeni id alarak yeniden doğuyor.
//      Yayın durumu da bu yüzden slug ile taşınıyor (M2). Bir hizmetin
//      slug'ı panelde değiştirilirse eski satır silinir, yenisi haritada
//      bulunmadığı için TASLAK doğar — yani canlı bir URL "kaydedildi"
//      mesajıyla birlikte sessizce kaybolur.
import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  services: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  service: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
}))

const kokMock = vi.hoisted(() => ({
  kokAdresleriTopla: vi.fn(),
  kokCakismasiniBul: vi.fn(),
  kokYoluDenetle: vi.fn(),
}))

vi.mock('../../../utils/prisma', () => ({ default: prismaMock }))

vi.mock('../../shared/root-paths', () => ({
  kokYolunuNormallestir: (v: unknown) => String(v ?? '').trim().replace(/^\/+/, ''),
  kokAdresleriTopla: kokMock.kokAdresleriTopla,
  kokCakismasiniBul: kokMock.kokCakismasiniBul,
  kokYoluDenetle: kokMock.kokYoluDenetle,
}))

import { servicesSectionService } from './services.config'

const BOS_KUME = {
  hepsi: new Set<string>(),
  mahalleler: new Set<string>(),
  disKaynaklar: new Set<string>(),
  sahip: new Map<string, string>(),
  etiketler: new Map<string, string>(),
}

const CAKISMA = {
  code: 'KOK_ADRES_CAKISMASI' as const,
  path: '/pendik',
  conflictingType: 'bölge sayfası',
  conflictingLabel: 'Pendik Evden Eve Nakliyat',
  message: '/pendik adresi zaten bölge sayfası tarafından kullanılıyor ("Pendik Evden Eve Nakliyat").',
}

const HIZMET = (slug: string, ustuneYaz: Record<string, any> = {}) => ({
  slug,
  title: slug,
  order: 0,
  ...ustuneYaz,
})

/** `prisma.service.findMany` iki farklı amaçla çağrılıyor; ayırt ediliyor. */
function findManyKur(yayindakiler: any[], hepsi: any[] = yayindakiler) {
  prismaMock.service.findMany.mockImplementation(async (arg: any) =>
    arg?.where?.isActive === true ? yayindakiler : hepsi
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  kokMock.kokAdresleriTopla.mockResolvedValue(BOS_KUME)
  kokMock.kokCakismasiniBul.mockReturnValue(null)
  kokMock.kokYoluDenetle.mockResolvedValue(null)
  prismaMock.services.update.mockResolvedValue({ id: 1, services: [] })
  prismaMock.service.update.mockImplementation(async ({ where, data }: any) => ({ ...where, ...data }))
  findManyKur([])
})

// ──────────────────────────── denetim yıkıcı yazmadan ÖNCE (§16/§37)

describe('update — DENETİM YIKICI SİLMEDEN ÖNCE', () => {
  it('çakışan aday kümede HİÇBİR SATIR SİLİNMİYOR', async () => {
    findManyKur([])
    kokMock.kokCakismasiniBul.mockReturnValue(CAKISMA)

    const s: any = await servicesSectionService.update({
      services: [HIZMET('evden-eve-nakliyat'), HIZMET('pendik')],
    })

    expect(s.success).toBe(false)
    expect(s.error).toContain('/pendik adresi zaten bölge sayfası')
    // KRİTİK KABUL: bölüm güncellemesi hiç başlamıyor, yani ne silme ne
    // yeniden yaratma çalışıyor.
    expect(prismaMock.services.update).not.toHaveBeenCalled()
    expect(prismaMock.service.deleteMany).not.toHaveBeenCalled()
  })

  it('hata mesajı HANGİ hizmetin sorunlu olduğunu söylüyor', async () => {
    kokMock.kokCakismasiniBul.mockImplementation((_k: any, yol: string) =>
      yol === 'pendik' ? CAKISMA : null
    )

    const s: any = await servicesSectionService.update({
      services: [HIZMET('evden-eve-nakliyat'), HIZMET('pendik', { title: 'Pendik Taşıma' })],
    })

    expect(s.error).toContain('"Pendik Taşıma" hizmeti')
  })

  it('başlıksız hizmette SIRA NUMARASI veriliyor', async () => {
    kokMock.kokCakismasiniBul.mockReturnValue(CAKISMA)

    const s: any = await servicesSectionService.update({
      services: [HIZMET('pendik', { title: undefined })],
    })

    expect(s.error).toContain('1. hizmet')
  })

  it('küme BİR KEZ toplanıyor — aday başına sorgu atılmıyor', async () => {
    await servicesSectionService.update({
      services: [HIZMET('a-hizmeti'), HIZMET('b-hizmeti'), HIZMET('c-hizmeti')],
    })

    expect(kokMock.kokAdresleriTopla).toHaveBeenCalledTimes(1)
    expect(kokMock.kokCakismasiniBul).toHaveBeenCalledTimes(3)
  })

  it('BÜTÜN hizmet satırları kümeden çıkarılıyor — aday küme onların YERİNE geçiyor', async () => {
    await servicesSectionService.update({ services: [HIZMET('evden-eve-nakliyat')] })

    expect(kokMock.kokAdresleriTopla).toHaveBeenCalledWith({ haricHizmetlerinTumu: true })
  })

  it('temiz aday küme kaydediliyor', async () => {
    const s: any = await servicesSectionService.update({
      services: [HIZMET('evden-eve-nakliyat'), HIZMET('esya-depolama')],
    })

    expect(s.success).not.toBe(false)
    expect(prismaMock.services.update).toHaveBeenCalled()
  })
})

// ────────────────────────────────────────────── küme içi tekrar (§32)

describe('update — aynı adres iki hizmette', () => {
  it('küme içi tekrar reddediliyor', async () => {
    const s: any = await servicesSectionService.update({
      services: [HIZMET('depolama'), HIZMET('depolama', { title: 'İkinci' })],
    })

    expect(s.success).toBe(false)
    expect(s.error).toContain('Aynı adres iki hizmette birden kullanılmış: /depolama')
    expect(prismaMock.services.update).not.toHaveBeenCalled()
  })

  it('tekrar denetimi ÇAKIŞMA denetiminden önce — mesaj kafa karıştırmıyor', async () => {
    await servicesSectionService.update({
      services: [HIZMET('depolama'), HIZMET('depolama')],
    })

    expect(kokMock.kokAdresleriTopla).not.toHaveBeenCalled()
  })

  it('ADRESSİZ hizmetler denetim dışı — kök adreste sayfaları yok', async () => {
    const s: any = await servicesSectionService.update({
      services: [
        { title: 'Yalnız kart', order: 0 },
        { title: 'Başka kart', order: 1, slug: null },
        { title: 'Üçüncü kart', order: 2, slug: '  ' },
      ],
    })

    expect(s.success).not.toBe(false)
    expect(prismaMock.services.update).toHaveBeenCalled()
  })
})

// ───────────────────────── yayındaki hizmetin adresi kaybolamaz (§17)

describe('update — YAYINDAKİ hizmetin adresi korunuyor', () => {
  it('yayındaki hizmetin slug\'ı DEĞİŞTİRİLİRSE işlem reddediliyor', async () => {
    // Senaryo: /esya-depolama yayında, panelde /depolama yapılıyor.
    findManyKur([{ slug: 'esya-depolama', title: 'Eşya Depolama' }])

    const s: any = await servicesSectionService.update({
      services: [HIZMET('depolama', { title: 'Depolama' })],
    })

    expect(s.success).toBe(false)
    expect(s.error).toContain('Yayındaki hizmetin adresi doğrudan değiştirilemez')
    expect(s.error).toContain('/esya-depolama')
    expect(s.error).toContain('Önce hizmeti yayından kaldırın')
    expect(prismaMock.services.update).not.toHaveBeenCalled()
  })

  it('yayındaki hizmet kümeden SİLİNİRSE de reddediliyor', async () => {
    findManyKur([{ slug: 'esya-depolama', title: 'Eşya Depolama' }])

    const s: any = await servicesSectionService.update({
      services: [HIZMET('evden-eve-nakliyat')],
    })

    expect(s.success).toBe(false)
    expect(s.error).toContain('/esya-depolama')
  })

  it('yayındaki hizmet kümede DURUYORSA kayıt geçiyor', async () => {
    findManyKur([{ slug: 'esya-depolama', title: 'Eşya Depolama' }])

    const s: any = await servicesSectionService.update({
      services: [HIZMET('esya-depolama', { title: 'Eşya Depolama — güncel' }), HIZMET('yeni-hizmet')],
    })

    expect(s.success).not.toBe(false)
    expect(prismaMock.services.update).toHaveBeenCalled()
  })

  it('TASLAK hizmetin slug\'ı serbestçe değişebiliyor', async () => {
    // Yayında hiçbir şey yok; taslak yeniden adlandırma canlı URL kaybı
    // üretmiyor.
    findManyKur([], [{ slug: 'eski-taslak', isActive: false }])

    const s: any = await servicesSectionService.update({
      services: [HIZMET('yeni-taslak')],
    })

    expect(s.success).not.toBe(false)
    expect(prismaMock.services.update).toHaveBeenCalled()
  })
})

// ─────────────────────────────────── yayın anı yeniden denetim (§18)

describe('publish — kök adres YENİDEN denetleniyor', () => {
  const TAM = {
    slug: 'esya-depolama',
    title: 'Eşya Depolama',
    content: '<p>Depolama süreci</p>',
    excerpt: 'Kısa süreli depolama.',
    isActive: false,
  }

  it('çakışma yayını durduruyor ve KAYIT DEĞİŞMİYOR', async () => {
    prismaMock.service.findUnique.mockResolvedValue(TAM)
    kokMock.kokYoluDenetle.mockResolvedValue(CAKISMA)

    const s: any = await servicesSectionService.publish('esya-depolama')

    expect(s.success).toBe(false)
    expect(s.error).toContain('Yayına alınamadı')
    expect(prismaMock.service.update).not.toHaveBeenCalled()
  })

  it('denetim KENDİ satırını hariç tutuyor', async () => {
    prismaMock.service.findUnique.mockResolvedValue(TAM)

    await servicesSectionService.publish('esya-depolama')

    expect(kokMock.kokYoluDenetle).toHaveBeenCalledWith('esya-depolama', {
      haric: { haricHizmetSlug: 'esya-depolama' },
    })
  })

  it('içerik denetimi ÖNCE — eksik hizmet için adres sorgusu yok', async () => {
    prismaMock.service.findUnique.mockResolvedValue({ ...TAM, title: '  ' })

    const s: any = await servicesSectionService.publish('esya-depolama')

    expect(s.success).toBe(false)
    expect(kokMock.kokYoluDenetle).not.toHaveBeenCalled()
  })

  it('YAYINDAN KALDIRMA adres denetimi istemiyor', async () => {
    prismaMock.service.findUnique.mockResolvedValue({ ...TAM, isActive: true })

    const s: any = await servicesSectionService.unpublish('esya-depolama')

    expect(s.success).toBe(true)
    expect(kokMock.kokYoluDenetle).not.toHaveBeenCalled()
  })
})
