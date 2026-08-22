// server/domain/home/home.service.test.ts
//
// ANA SAYFA KONTROLLÜ CMS.
//
// Ana sayfanın işletme metinleri V2 bileşenlerinin İÇİNDE sabit yazılıydı:
// yönetici H1'i, ölçülen dört koşulu, hizmet defterini ya da soruları
// panelden değiştiremiyordu. Buradaki testler içeriğin veri tabanından
// gelmesini ve kontrollü kalmasını — yani panelin bir sayfa oluşturucuya
// dönüşmemesini — koruyor.
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./home.repository.ts', () => ({
  homeRepository: {
    findAllSections: vi.fn(),
    findSection: vi.fn(),
    upsertSection: vi.fn(),
    findActiveServices: vi.fn(),
    findRegionsForScope: vi.fn(),
    findProcess: vi.fn(),
    findFaq: vi.fn(),
    findReviews: vi.fn(),
  },
}))

import { homeRepository } from './home.repository.ts'
import { homeService } from './home.service.ts'

const BOLUM = (sectionKey: string, ustuneYaz: Record<string, any> = {}) => ({
  id: 1,
  sectionKey,
  heading: null,
  lead: null,
  note: null,
  closing: null,
  closingNote: null,
  ctaLabel: null,
  imagePath: null,
  imageAlt: null,
  items: [],
  ...ustuneYaz,
})

/** İki yakadan üç ilçe + bir İstanbul dışı kayıt + il sayfasının kendisi. */
const BOLGELER = [
  { slug: 'besiktas', cities: [34] },
  { slug: 'bakirkoy', cities: [34] },
  { slug: 'kadikoy', cities: [34] },
  { slug: 'istanbul', cities: [34] }, // İL sayfası — ilçe DEĞİL
  { slug: 'adana', cities: [1] }, // İstanbul dışı
]

beforeEach(() => {
  vi.clearAllMocks()
  ;(homeRepository.findAllSections as any).mockResolvedValue([])
  ;(homeRepository.findActiveServices as any).mockResolvedValue([])
  ;(homeRepository.findRegionsForScope as any).mockResolvedValue([])
  ;(homeRepository.findProcess as any).mockResolvedValue(null)
  ;(homeRepository.findFaq as any).mockResolvedValue(null)
  // Varsayılan: hiç onaylı yorum yok. Sahte yedek üretilmediğini gösteren
  // durum da bu, testlerin çoğunda gürültü yapmadan duruyor.
  ;(homeRepository.findReviews as any).mockResolvedValue([
    [],
    { _avg: { rating: null }, _count: { _all: 0 } },
  ])
})

// ─────────────────────────────────────────────────────── herkese açık okuma

describe('get — bölümler', () => {
  it('YEDİ bölümün hepsi yanıtta, kayıt olmasa bile', async () => {
    const s: any = await homeService.get()

    expect(Object.keys(s.data.bolumler)).toEqual([
      'hero',
      'kapsam',
      'uc-istanbul',
      'hizmetler',
      'fiyat',
      'yorumlar',
      'kapanis',
    ])
  })

  it('kayıt yoksa bölüm BOŞ dönüyor — sayfa çökmüyor', async () => {
    const s: any = await homeService.get()
    expect(s.data.bolumler.hero).toEqual({
      heading: null, lead: null, note: null, closing: null,
      closingNote: null, ctaLabel: null, imagePath: null, imageAlt: null, items: [],
    })
  })

  it('bölüm alanları ve öğeleri yanıta geçiyor', async () => {
    ;(homeRepository.findAllSections as any).mockResolvedValue([
      BOLUM('hero', {
        heading: "İstanbul'da taşınmak, ölçülü bir iştir.",
        imagePath: '/images/hero-istanbul.webp',
        imageAlt: 'İki nakliyeci',
        items: [{ label: 'ARAÇ ERİŞİMİ', subLabel: null, title: null, body: 'Kamyon yanaşabiliyor mu?', imagePath: null, imageAlt: null }],
      }),
    ])

    const s: any = await homeService.get()

    expect(s.data.bolumler.hero.heading).toBe("İstanbul'da taşınmak, ölçülü bir iştir.")
    expect(s.data.bolumler.hero.imageAlt).toBe('İki nakliyeci')
    expect(s.data.bolumler.hero.items[0]).toEqual({
      label: 'ARAÇ ERİŞİMİ', subLabel: null, title: null,
      body: 'Kamyon yanaşabiliyor mu?', imagePath: null, imageAlt: null,
    })
  })

  it('BİLİNMEYEN anahtar yanıttan düşüyor', async () => {
    // Tabloya elle bir satır eklenirse ana sayfa onu görmezden geliyor;
    // karşılığı olan bileşen zaten yok.
    ;(homeRepository.findAllSections as any).mockResolvedValue([BOLUM('uydurma-bolum', { heading: 'X' })])

    const s: any = await homeService.get()

    expect(s.data.bolumler).not.toHaveProperty('uydurma-bolum')
    expect(Object.keys(s.data.bolumler)).toHaveLength(7)
  })

  it('boş dize null\'a çevriliyor — bileşen "boş mu?" sorusunu tek biçimde soruyor', async () => {
    ;(homeRepository.findAllSections as any).mockResolvedValue([BOLUM('kapanis', { heading: '   ' })])
    const s: any = await homeService.get()
    expect(s.data.bolumler.kapanis.heading).toBeNull()
  })
})

// ───────────────────────────────────────────────────────── türetilmiş sayım

describe('get — ilçe sayımı TÜRETİLMİŞ', () => {
  it('yaka dağılımı bölge kayıtlarından hesaplanıyor', async () => {
    ;(homeRepository.findRegionsForScope as any).mockResolvedValue(BOLGELER)

    const s: any = await homeService.get()

    expect(s.data.ilceler).toEqual({ avrupa: 2, anadolu: 1, digerleri: 0, toplam: 3 })
  })

  it('İL sayfası ve İstanbul dışı kayıtlar sayıma GİRMİYOR', async () => {
    ;(homeRepository.findRegionsForScope as any).mockResolvedValue(BOLGELER)
    const s: any = await homeService.get()
    expect(s.data.ilceler.toplam).toBe(3)
  })

  it('YAYIN DURUMUNA BAKILMIYOR — sayı bir kapsam iddiası', async () => {
    // Sorgu `isActive` seçmiyor bile: kapsam "İstanbul'un tamamında
    // çalışıyoruz" demek, "kaç sayfa yayında" demek değil. /bolgelerimiz
    // dizini de 39 ilçenin tamamını gösteriyor.
    await homeService.get()
    const arg = (homeRepository.findRegionsForScope as any).mock.calls[0]
    expect(arg).toEqual([])
  })

  it('yaka eşlemesinde olmayan ilçe SESSİZCE kaybolmuyor', async () => {
    ;(homeRepository.findRegionsForScope as any).mockResolvedValue([
      { slug: 'kadikoy', cities: [34] },
      { slug: 'yeni-ilce', cities: [34] },
    ])

    const s: any = await homeService.get()

    expect(s.data.ilceler).toEqual({ avrupa: 0, anadolu: 1, digerleri: 1, toplam: 2 })
  })
})

// ───────────────────────────────────────────────────────── hizmet defteri

describe('get — hizmet defteri', () => {
  it('hizmetler `Service` kaydından geliyor', async () => {
    ;(homeRepository.findActiveServices as any).mockResolvedValue([
      { slug: 'evden-eve-nakliyat', title: 'Evden Eve Nakliyat', excerpt: 'Özet', order: 0 },
    ])

    const s: any = await homeService.get()

    expect(s.data.hizmetler).toEqual([
      { slug: 'evden-eve-nakliyat', title: 'Evden Eve Nakliyat', excerpt: 'Özet' },
    ])
  })

  it('taslak süzgeci VERİ TABANINDA — servis ek bir süzme yapmıyor', async () => {
    // Yayınlanmamış içeriği çekip istemcide ayıklamak, onu ağdan geçirmek
    // olurdu (M2'deki aynı gerekçe).
    await homeService.get()
    expect(homeRepository.findActiveServices).toHaveBeenCalledTimes(1)
  })

  it('BAŞLIK hizmet sayısından BAĞIMSIZ — liste değişince başlık değişmiyor', async () => {
    // Başlık `HomeSection('hizmetler')` alanından, liste `Service`
    // tablosundan geliyor. İkisi ayrı kaynak olduğu için bir hizmet
    // yayından kaldırıldığında başlık dokunulmadan kalıyor — başlıkta
    // sayı olsaydı tam burada eskirdi.
    ;(homeRepository.findAllSections as any).mockResolvedValue([
      BOLUM('hizmetler', { heading: 'Aynı operasyonun farklı yetkinlikleri.' }),
    ])

    const yediyle = [
      'evden-eve-nakliyat', 'asansorlu-nakliyat', 'parca-esya-tasima', 'ofis-tasima',
      'esya-depolama', 'sehirler-arasi-nakliyat', 'paketleme-hizmeti',
    ].map((slug, i) => ({ slug, title: slug, excerpt: null, order: i }))

    ;(homeRepository.findActiveServices as any).mockResolvedValue(yediyle)
    const yedi: any = await homeService.get()

    ;(homeRepository.findActiveServices as any).mockResolvedValue(yediyle.slice(0, 6))
    const alti: any = await homeService.get()

    expect(yedi.data.hizmetler).toHaveLength(7)
    expect(alti.data.hizmetler).toHaveLength(6)
    // Aynı başlık, iki durumda da doğru.
    expect(alti.data.bolumler.hizmetler.heading).toBe(yedi.data.bolumler.hizmetler.heading)
    expect(alti.data.bolumler.hizmetler.heading).not.toMatch(/\d|yedi|altı/i)
  })

  it('slug\'ı olmayan hizmet defterde yer ALMIYOR — sayfası yok', async () => {
    ;(homeRepository.findActiveServices as any).mockResolvedValue([
      { slug: null, title: 'Yalnız kart', excerpt: null, order: 0 },
      { slug: 'ofis-tasima', title: 'Ofis Taşıma', excerpt: null, order: 1 },
    ])

    const s: any = await homeService.get()

    expect(s.data.hizmetler.map((h: any) => h.slug)).toEqual(['ofis-tasima'])
  })
})

// ───────────────────────────────────────────────────── süreç ve sorular

describe('get — süreç ve sorular mevcut modellerden', () => {
  it('süreç adımları ProcessStep\'ten geliyor', async () => {
    ;(homeRepository.findProcess as any).mockResolvedValue({
      mainTitle: 'Plan, operasyona böyle dönüşür.',
      steps: [
        {
          label: 'KEŞİF', title: 'Önce koşullar.', description: 'Metin',
          imagePath: '/images/stage-a.webp', imageAlt: 'Alt',
          linkLabel: 'Hizmet kapsamımız', linkHref: '/hizmetlerimiz',
        },
      ],
    })

    const s: any = await homeService.get()

    expect(s.data.surec.heading).toBe('Plan, operasyona böyle dönüşür.')
    expect(s.data.surec.steps[0]).toEqual({
      label: 'KEŞİF', title: 'Önce koşullar.', body: 'Metin',
      imagePath: '/images/stage-a.webp', imageAlt: 'Alt',
      linkLabel: 'Hizmet kapsamımız', linkHref: '/hizmetlerimiz',
    })
  })

  it('sorular FaqItem\'dan geliyor', async () => {
    ;(homeRepository.findFaq as any).mockResolvedValue({
      mainTitle: 'Taşınmadan önce sorulanlar.',
      faqs: [{ question: 'Keşif şart mı?', answer: 'Evet.' }],
    })

    const s: any = await homeService.get()

    expect(s.data.sorular.heading).toBe('Taşınmadan önce sorulanlar.')
    expect(s.data.sorular.items).toEqual([{ question: 'Keşif şart mı?', answer: 'Evet.' }])
  })

  it('süreç/SSS kaydı yoksa boş dönüyor', async () => {
    const s: any = await homeService.get()
    expect(s.data.surec).toEqual({ heading: null, steps: [] })
    expect(s.data.sorular).toEqual({ heading: null, items: [] })
  })
})

// ─────────────────────────────────────────────────────────────── yazma

describe('update — KAPALI KÜME', () => {
  beforeEach(() => {
    ;(homeRepository.upsertSection as any).mockResolvedValue({ id: 1 })
  })

  it('bilinmeyen bölüm anahtarı REDDEDİLİYOR', async () => {
    const s: any = await homeService.update({ sectionKey: 'yeni-bolum', items: [] })

    expect(s.success).toBe(false)
    expect(s.error).toContain('Bilinmeyen ana sayfa bölümü')
    // Geçerli anahtarlar hataya yazılıyor: yönetici ne yazabileceğini görüyor.
    expect(s.error).toContain('hero')
    expect(homeRepository.upsertSection).not.toHaveBeenCalled()
  })

  it.each([
    ['hero', 4],
    ['kapsam', 3],
    ['uc-istanbul', 3],
    ['fiyat', 5],
  ])('%s bölümü tam %i öğe kabul ediyor', async (anahtar, adet) => {
    const s: any = await homeService.update({
      sectionKey: anahtar,
      items: Array.from({ length: adet }, (_, i) => ({ label: `${i}` })),
    })
    expect(s.success).toBe(true)
  })

  it.each([
    ['uc-istanbul', 4, 'dördüncü sahne'],
    ['uc-istanbul', 2, 'eksik sahne'],
    ['hero', 5, 'fazla koşul'],
    ['fiyat', 0, 'boş faktör listesi'],
  ])('%s bölümüne %i öğe reddediliyor (%s)', async (anahtar, adet) => {
    const s: any = await homeService.update({
      sectionKey: anahtar,
      items: Array.from({ length: adet }, () => ({})),
    })

    expect(s.success).toBe(false)
    expect(s.error).toContain('tasarımın parçası')
    expect(homeRepository.upsertSection).not.toHaveBeenCalled()
  })

  it('SESSİZ KIRPMA YOK — fazla öğe atılmıyor, işlem reddediliyor', async () => {
    // Kırpılsaydı yönetici "kaydedildi" mesajını alır, girdiği öğeyi bir
    // daha göremezdi.
    const s: any = await homeService.update({
      sectionKey: 'kapsam',
      items: [{ label: 'A' }, { label: 'B' }, { label: 'C' }, { label: 'D' }],
    })
    expect(s.success).toBe(false)
  })

  it('öğesiz bölümler öğe kabul etmiyor', async () => {
    for (const anahtar of ['hizmetler', 'kapanis']) {
      const s: any = await homeService.update({ sectionKey: anahtar, items: [{ label: 'X' }] })
      expect(s.success).toBe(false)
    }
  })

  it('öğe SIRASI gövdedeki sırayla yazılıyor', async () => {
    await homeService.update({
      sectionKey: 'kapsam',
      items: [{ label: 'Beşiktaş' }, { label: 'Kadıköy' }, { label: 'Başakşehir' }],
    })

    const [, , ogeler] = (homeRepository.upsertSection as any).mock.calls[0]
    expect(ogeler.map((o: any) => o.label)).toEqual(['Beşiktaş', 'Kadıköy', 'Başakşehir'])
  })

  it('boş alanlar null yazılıyor', async () => {
    await homeService.update({ sectionKey: 'kapanis', heading: '  ', items: [] })
    const [, govde] = (homeRepository.upsertSection as any).mock.calls[0]
    expect(govde.heading).toBeNull()
  })
})

describe('getForAdmin', () => {
  it('bölümler SAYFA SIRASIYLA dönüyor, id sırasıyla değil', async () => {
    ;(homeRepository.findAllSections as any).mockResolvedValue([
      BOLUM('kapanis', { id: 1 }),
      BOLUM('hero', { id: 9 }),
    ])

    const s: any = await homeService.getForAdmin()

    expect(s.data.map((b: any) => b.sectionKey)).toEqual([
      'hero', 'kapsam', 'uc-istanbul', 'hizmetler', 'fiyat', 'yorumlar', 'kapanis',
    ])
  })

  it('kaydı olmayan bölüm de listede — panel formu her zaman tam', async () => {
    const s: any = await homeService.getForAdmin()
    expect(s.data).toHaveLength(7)
    expect(s.data[0]).toEqual({ sectionKey: 'hero', items: [] })
  })
})
