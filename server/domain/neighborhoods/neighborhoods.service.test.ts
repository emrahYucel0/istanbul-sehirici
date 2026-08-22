// server/domain/neighborhoods/neighborhoods.service.test.ts
//
// MAHALLE SERVİSİ — domain kurallarının tek sahibi.
//
// Burada korunan davranışlar, panel açıldığı için ilk kez bir yönetici
// tarafından tetiklenebilir hâle geldi:
//   · mahalle yalnız İstanbul ilçesine bağlanabilir
//   · adres türetiliyor, panelden yazılamıyor
//   · yayındaki bir kayıt düzenlemeyle kapının altına düşemez
//   · yayına alma kapıdan geçmeden veri tabanına dokunmuyor
//   · içerik public'e temizlenmiş çıkıyor
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./neighborhoods.repository.ts', () => ({
  neighborhoodsRepository: {
    findByPath: vi.fn(),
    findById: vi.fn(),
    findByDistrictId: vi.fn(),
    findDistricts: vi.fn(),
    findDistrictBySlug: vi.fn(),
    findOtherMetaDescriptions: vi.fn(),
    findAllPaths: vi.fn(),
    findAllWithDistrict: vi.fn(),
    listForAdmin: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    setActive: vi.fn(),
  },
}))

vi.mock('../shared/root-paths.ts', () => ({
  kokAdresleriTopla: vi.fn(),
}))

import { neighborhoodsRepository } from './neighborhoods.repository.ts'
import { kokAdresleriTopla } from '../shared/root-paths.ts'
import { neighborhoodsService } from './neighborhoods.service.ts'

const PENDIK = {
  id: 7,
  slug: 'pendik',
  title: 'Pendik Evden Eve Nakliyat',
  subtitle: 'Pendik',
  cities: [34],
  isActive: true,
  content: '<p>Pendik ilçe metni.</p>',
}

const NILUFER = {
  id: 90,
  slug: 'nilufer',
  title: 'Nilüfer Evden Eve Nakliyat',
  subtitle: 'Nilüfer',
  cities: [16],
  isActive: true,
  content: null,
}

const ISTANBUL_IL = {
  id: 1,
  slug: 'istanbul',
  title: 'İstanbul Evden Eve Nakliyat',
  subtitle: 'İstanbul',
  cities: [34],
  isActive: true,
  content: null,
}

/** Kapıdan geçen içerik — aktif kayıt testlerinde taban olarak kullanılıyor. */
const GECERLI_ICERIK = {
  title: 'Kaynarca Mahallesi Evden Eve Nakliyat',
  excerpt: 'Kaynarca’da taşınma planı sokak ve kat durumuna göre kuruluyor.',
  content: `<p>${'Kaynarca yapı stoku ağırlıkla 2000 sonrası. '.repeat(20)}</p>`,
  metaDescription:
    'Kaynarca Mahallesi evden eve nakliyat: keşif, ambalajlama ve marangozlu kurulum. Sokak ve kat durumu yerinde ölçülür.',
  faqs: [
    { question: 'Asansör yoksa?', answer: 'Yöntem keşifte belirleniyor.' },
    { question: 'Süre ne kadar?', answer: 'Kat ve erişime göre değişiyor.' },
    { question: 'Sigorta var mı?', answer: 'Nakliyat sigortası kapsamında.' },
  ],
  facts: [{ label: 'Yapı dokusu', value: '2000 sonrası site ağırlıklı' }],
}

const kokAdres = (disKaynaklar: string[] = [], mahalleler: string[] = []) => ({
  hepsi: new Set([...disKaynaklar, ...mahalleler]),
  mahalleler: new Set(mahalleler),
  disKaynaklar: new Set(disKaynaklar),
  sahip: new Map(disKaynaklar.map((y) => [y, 'hizmet sayfası'])),
})

beforeEach(() => {
  vi.clearAllMocks()
  ;(neighborhoodsRepository.findDistricts as any).mockResolvedValue([PENDIK, NILUFER, ISTANBUL_IL])
  ;(neighborhoodsRepository.findDistrictBySlug as any).mockImplementation(async (slug: string) =>
    [PENDIK, NILUFER, ISTANBUL_IL].find((x) => x.slug === slug) ?? null
  )
  ;(neighborhoodsRepository.findOtherMetaDescriptions as any).mockResolvedValue([])
  ;(neighborhoodsRepository.findAllPaths as any).mockResolvedValue([])
  ;(kokAdresleriTopla as any).mockResolvedValue(kokAdres())
  ;(neighborhoodsRepository.create as any).mockImplementation(async (data: any) => ({ id: 1, ...data }))
  ;(neighborhoodsRepository.update as any).mockImplementation(async (id: number, data: any) => ({ id, ...data }))
  ;(neighborhoodsRepository.setActive as any).mockResolvedValue({})
})

// ─────────────────────────────────────────────────────────── ilçe ilişkisi

describe('create — ilçe ilişkisi', () => {
  it('geçerli İstanbul ilçesiyle kayıt oluşturuyor', async () => {
    const s: any = await neighborhoodsService.create({ districtId: 7, name: 'Kaynarca' })

    expect(s.success).toBe(true)
    expect(neighborhoodsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        districtId: 7,
        name: 'Kaynarca',
        slug: 'kaynarca',
        canonicalPath: 'kaynarca-mahallesi',
        isActive: false,
      })
    )
  })

  it('İSTANBUL DIŞI bölge ebeveyn olarak REDDEDİLİYOR', async () => {
    const s: any = await neighborhoodsService.create({ districtId: 90, name: 'Ataevler' })

    expect(s.success).toBe(false)
    expect(s.error).toContain('İstanbul ilçesi değil')
    expect(neighborhoodsRepository.create).not.toHaveBeenCalled()
  })

  it('İSTANBUL İL sayfası ebeveyn olarak REDDEDİLİYOR', async () => {
    const s: any = await neighborhoodsService.create({ districtId: 1, name: 'Moda' })

    expect(s.success).toBe(false)
    expect(neighborhoodsRepository.create).not.toHaveBeenCalled()
  })

  it('olmayan ilçe REDDEDİLİYOR', async () => {
    const s: any = await neighborhoodsService.create({ districtId: 999, name: 'Moda' })

    expect(s.success).toBe(false)
    expect(s.error).toContain('bulunamadı')
  })

  it('yeni kayıt HER ZAMAN pasif başlıyor', async () => {
    await neighborhoodsService.create({ districtId: 7, name: 'Kaynarca' })
    expect(neighborhoodsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false })
    )
  })

  it('eksik içerikli taslak KAYDEDİLEBİLİYOR', async () => {
    const s: any = await neighborhoodsService.create({ districtId: 7, name: 'Kaynarca' })
    expect(s.success).toBe(true)
  })
})

// ─────────────────────────────────────────────────────── kimlik ve çakışma

describe('create — kök adres çakışması', () => {
  it('STATİK rotayla çakışan adres yedeğe düşüyor', async () => {
    ;(kokAdresleriTopla as any).mockResolvedValue(kokAdres(['hakkimizda-mahallesi']))

    await neighborhoodsService.create({ districtId: 7, name: 'Hakkımızda' })

    expect(neighborhoodsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ canonicalPath: 'pendik-hakkimizda-mahallesi' })
    )
  })

  it('HİZMET slug\'ıyla çakışan adres o sayfayı gölgeleyemiyor', async () => {
    ;(kokAdresleriTopla as any).mockResolvedValue(kokAdres(['depolama-mahallesi']))

    await neighborhoodsService.create({ districtId: 7, name: 'Depolama' })

    expect(neighborhoodsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ canonicalPath: 'pendik-depolama-mahallesi' })
    )
  })

  it('MEVCUT MAHALLE adresiyle çakışma yedeğe düşüyor', async () => {
    ;(kokAdresleriTopla as any).mockResolvedValue(kokAdres([], ['merkez-mahallesi']))

    await neighborhoodsService.create({ districtId: 7, name: 'Merkez' })

    expect(neighborhoodsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ canonicalPath: 'pendik-merkez-mahallesi' })
    )
  })

  it('taban ve yedek doluysa kayıt OLUŞTURULMUYOR', async () => {
    ;(kokAdresleriTopla as any).mockResolvedValue(
      kokAdres([], ['merkez-mahallesi', 'pendik-merkez-mahallesi'])
    )

    const s: any = await neighborhoodsService.create({ districtId: 7, name: 'Merkez' })

    expect(s.success).toBe(false)
    expect(neighborhoodsRepository.create).not.toHaveBeenCalled()
  })

  it('adres panelden GÖNDERİLEMİYOR — her zaman türetiliyor', async () => {
    await neighborhoodsService.create({
      districtId: 7,
      name: 'Kaynarca',
      // Sözleşmede yok; TypeScript de engelliyor, yine de gövdede gelse
      // servis kendi türettiğini yazıyor.
      ...({ canonicalPath: 'ele-gecirilen-adres' } as any),
    })

    expect(neighborhoodsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ canonicalPath: 'kaynarca-mahallesi' })
    )
  })
})

// ────────────────────────────────────────────────────────── ilçe değişimi

describe('update — ilçe ve ad değişimi', () => {
  const pasifKayit = {
    id: 5,
    districtId: 7,
    name: 'Kaynarca',
    slug: 'kaynarca',
    canonicalPath: 'kaynarca-mahallesi',
    isActive: false,
    metaDescription: null,
    district: PENDIK,
  }

  it('ilçe değişince adres YENİDEN HESAPLANIYOR', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue(pasifKayit)
    ;(kokAdresleriTopla as any).mockResolvedValue(kokAdres([], ['kaynarca-mahallesi']))

    // Not: pasif kayıtta kendi adresi hariç tutulmuyor (mock), bu yüzden
    // taban dolu görünüyor ve yedeğe düşüyor — kural budur.
    await neighborhoodsService.update({ id: 5, districtId: 7, name: 'Kaynarca Yeni' })

    expect(neighborhoodsRepository.update).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ canonicalPath: 'kaynarca-yeni-mahallesi', slug: 'kaynarca-yeni' })
    )
  })

  it('İSTANBUL DIŞI ilçeye taşıma REDDEDİLİYOR', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue(pasifKayit)

    const s: any = await neighborhoodsService.update({ id: 5, districtId: 90, name: 'Kaynarca' })

    expect(s.success).toBe(false)
    expect(s.error).toContain('İstanbul ilçesi değil')
    expect(neighborhoodsRepository.update).not.toHaveBeenCalled()
  })

  it('yeni adres çakışıyorsa güncelleme REDDEDİLİYOR', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue(pasifKayit)
    ;(kokAdresleriTopla as any).mockResolvedValue(
      kokAdres([], ['merkez-mahallesi', 'pendik-merkez-mahallesi'])
    )

    const s: any = await neighborhoodsService.update({ id: 5, districtId: 7, name: 'Merkez' })

    expect(s.success).toBe(false)
    expect(neighborhoodsRepository.update).not.toHaveBeenCalled()
  })

  it('ad ve ilçe aynıysa adres DOKUNULMUYOR', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue(pasifKayit)

    await neighborhoodsService.update({ id: 5, districtId: 7, name: 'Kaynarca', title: 'Yeni başlık' })

    expect(neighborhoodsRepository.update).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ canonicalPath: 'kaynarca-mahallesi' })
    )
    // Adres hesaplanmadığı için kök adres taraması da yapılmıyor.
    expect(kokAdresleriTopla).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────── aktif kayıt koruması

describe('update — yayındaki kayıt koruması', () => {
  const aktifKayit = {
    id: 9,
    districtId: 7,
    name: 'Kaynarca',
    slug: 'kaynarca',
    canonicalPath: 'kaynarca-mahallesi',
    isActive: true,
    metaDescription: GECERLI_ICERIK.metaDescription,
    district: PENDIK,
  }

  it('geçerli içerikle güncelleme KABUL ediliyor', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue(aktifKayit)

    const s: any = await neighborhoodsService.update({
      id: 9,
      districtId: 7,
      name: 'Kaynarca',
      ...GECERLI_ICERIK,
    })

    expect(s.success).toBe(true)
    expect(neighborhoodsRepository.update).toHaveBeenCalled()
  })

  it('İÇERİK SİLİNİRSE güncelleme REDDEDİLİYOR', async () => {
    // "Önce geçerli içerikle yayına al, sonra içeriği sil" yolu kapıyı
    // tamamen anlamsız kılardı.
    ;(neighborhoodsRepository.findById as any).mockResolvedValue(aktifKayit)

    const s: any = await neighborhoodsService.update({
      id: 9,
      districtId: 7,
      name: 'Kaynarca',
      ...GECERLI_ICERIK,
      content: '<p>Kısa.</p>',
    })

    expect(s.success).toBe(false)
    expect(s.error).toContain('kalite kapısının altına')
    expect(neighborhoodsRepository.update).not.toHaveBeenCalled()
  })

  it('SSS sayısı 3\'ün altına düşerse REDDEDİLİYOR', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue(aktifKayit)

    const s: any = await neighborhoodsService.update({
      id: 9,
      districtId: 7,
      name: 'Kaynarca',
      ...GECERLI_ICERIK,
      faqs: GECERLI_ICERIK.faqs.slice(0, 2),
    })

    expect(s.success).toBe(false)
    expect(neighborhoodsRepository.update).not.toHaveBeenCalled()
  })

  it('SESSİZ yayından kaldırma YAPILMIYOR — kural listesi dönüyor', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue(aktifKayit)

    const s: any = await neighborhoodsService.update({
      id: 9,
      districtId: 7,
      name: 'Kaynarca',
      ...GECERLI_ICERIK,
      title: '',
    })

    expect(s.success).toBe(false)
    expect(neighborhoodsRepository.setActive).not.toHaveBeenCalled()
    expect(s.kapi.kurallar.find((k: any) => k.anahtar === 'title').gecti).toBe(false)
  })

  it('YAYINDAKİ kaydın adı değiştirilemiyor (adres taşınmasın)', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue(aktifKayit)

    const s: any = await neighborhoodsService.update({
      id: 9,
      districtId: 7,
      name: 'Kaynarca Yeni',
      ...GECERLI_ICERIK,
    })

    expect(s.success).toBe(false)
    expect(s.error).toContain('Yayından kaldır')
    expect(neighborhoodsRepository.update).not.toHaveBeenCalled()
  })

  it('PASİF kaydın eksik içerikle kaydedilmesi SERBEST', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue({ ...aktifKayit, isActive: false })

    const s: any = await neighborhoodsService.update({ id: 9, districtId: 7, name: 'Kaynarca' })

    expect(s.success).toBe(true)
    expect(neighborhoodsRepository.update).toHaveBeenCalled()
  })
})

// ────────────────────────────────────────────────────── yayın eylemleri

describe('publish / unpublish', () => {
  const hazir = {
    id: 3,
    districtId: 7,
    name: 'Kaynarca',
    slug: 'kaynarca',
    canonicalPath: 'kaynarca-mahallesi',
    isActive: false,
    district: PENDIK,
    ...GECERLI_ICERIK,
  }

  it('kapıdan geçen kayıt yayına alınıyor', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue(hazir)

    const s: any = await neighborhoodsService.publish(3)

    expect(s.success).toBe(true)
    expect(neighborhoodsRepository.setActive).toHaveBeenCalledWith(3, true)
  })

  it('kapıdan geçemeyen kayıtta VERİ TABANINA DOKUNULMUYOR', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue({ ...hazir, title: null })

    const s: any = await neighborhoodsService.publish(3)

    expect(s.success).toBe(false)
    expect(neighborhoodsRepository.setActive).not.toHaveBeenCalled()
    expect(s.kapi.hatalar).toContain('title boş')
  })

  it('PASİF ebeveyn yayına almayı engelliyor', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue({
      ...hazir,
      district: { ...PENDIK, isActive: false },
    })

    const s: any = await neighborhoodsService.publish(3)

    expect(s.success).toBe(false)
    expect(neighborhoodsRepository.setActive).not.toHaveBeenCalled()
  })

  it('İSTANBUL DIŞI ebeveyn yayına almayı engelliyor', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue({ ...hazir, district: NILUFER })

    const s: any = await neighborhoodsService.publish(3)

    expect(s.success).toBe(false)
  })

  it('BAŞKA BİR SAYFAYI gölgeleyen adres yayına alınamıyor', async () => {
    // Kayıt zaten oluşmuşsa (ör. aktarım betiğinden) yayın anında ikinci
    // kez denetleniyor.
    ;(neighborhoodsRepository.findById as any).mockResolvedValue(hazir)
    ;(kokAdresleriTopla as any).mockResolvedValue(kokAdres(['kaynarca-mahallesi']))

    const s: any = await neighborhoodsService.publish(3)

    expect(s.success).toBe(false)
    expect(s.kapi.kurallar.find((k: any) => k.anahtar === 'kok-cakisma').gecti).toBe(false)
    expect(neighborhoodsRepository.setActive).not.toHaveBeenCalled()
  })

  it('kendi adresi çakışma SAYILMIYOR', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue(hazir)
    ;(neighborhoodsRepository.findAllPaths as any).mockResolvedValue([
      { canonicalPath: 'kaynarca-mahallesi' },
    ])

    const s: any = await neighborhoodsService.publish(3)

    expect(s.success).toBe(true)
  })

  it('unpublish yayından kaldırıyor', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue({ ...hazir, isActive: true })

    const s: any = await neighborhoodsService.unpublish(3)

    expect(s.success).toBe(true)
    expect(neighborhoodsRepository.setActive).toHaveBeenCalledWith(3, false)
  })

  it('unpublish KAPIDAN GEÇMEYİ GEREKTİRMİYOR', async () => {
    // Bozuk içerikli bir sayfayı yayından çekebilmek her zaman mümkün olmalı.
    ;(neighborhoodsRepository.findById as any).mockResolvedValue({
      ...hazir,
      isActive: true,
      title: null,
    })

    const s: any = await neighborhoodsService.unpublish(3)

    expect(s.success).toBe(true)
    expect(neighborhoodsRepository.setActive).toHaveBeenCalledWith(3, false)
  })

  it('olmayan kayıt için hata dönüyor', async () => {
    ;(neighborhoodsRepository.findById as any).mockResolvedValue(null)
    const s: any = await neighborhoodsService.publish(404)
    expect(s.success).toBe(false)
  })
})

// ──────────────────────────────────────────────────────── public okuma

describe('getByPath — public okuma', () => {
  const kayitTemel = {
    id: 3,
    districtId: 7,
    name: 'Kaynarca',
    canonicalPath: 'kaynarca-mahallesi',
    isActive: true,
    title: 'Kaynarca Mahallesi',
    excerpt: 'Özet',
    metaTitle: null,
    metaDescription: null,
    faqs: [],
    facts: [],
    imagePath: null,
    imageAlt: null,
    district: { id: 7, slug: 'pendik', title: 'Pendik Evden Eve Nakliyat', subtitle: 'Pendik', cities: [34] },
  }

  beforeEach(() => {
    ;(neighborhoodsRepository.findByDistrictId as any).mockResolvedValue([
      { name: 'Kaynarca', canonicalPath: 'kaynarca-mahallesi', isActive: true },
      { name: 'Yayalar', canonicalPath: 'yayalar-mahallesi', isActive: false },
    ])
  })

  it('kardeşler AYNI YANITTA geliyor (şelale yok)', async () => {
    ;(neighborhoodsRepository.findByPath as any).mockResolvedValue({
      ...kayitTemel,
      content: '<p>Metin</p>',
    })

    const s: any = await neighborhoodsService.getByPath('kaynarca-mahallesi')

    expect(s.success).toBe(true)
    expect(s.data.kardesler).toHaveLength(2)
    expect(s.data.ilceAd).toBe('Pendik')
  })

  it('İSTANBUL DIŞI ebeveynde sayfa AÇILMIYOR', async () => {
    ;(neighborhoodsRepository.findByPath as any).mockResolvedValue({
      ...kayitTemel,
      district: { ...kayitTemel.district, cities: [16], slug: 'nilufer' },
    })

    const s: any = await neighborhoodsService.getByPath('kaynarca-mahallesi')

    expect(s.data).toBe(null)
  })

  it('SAKLANAN XSS: script etiketi public\'e ULAŞMIYOR', async () => {
    ;(neighborhoodsRepository.findByPath as any).mockResolvedValue({
      ...kayitTemel,
      content: '<p>Metin</p><script>alert(1)</script>',
    })

    const s: any = await neighborhoodsService.getByPath('kaynarca-mahallesi')

    expect(s.data.content).not.toContain('<script')
    expect(s.data.content).not.toContain('alert(1)')
  })

  it('SAKLANAN XSS: satır içi olay işleyicisi TEMİZLENİYOR', async () => {
    ;(neighborhoodsRepository.findByPath as any).mockResolvedValue({
      ...kayitTemel,
      content: '<p onclick="steal()">Metin</p><img src="x" onerror="steal()">',
    })

    const s: any = await neighborhoodsService.getByPath('kaynarca-mahallesi')

    expect(s.data.content).not.toContain('onclick')
    expect(s.data.content).not.toContain('onerror')
  })

  it('SAKLANAN XSS: javascript: bağlantısı TEMİZLENİYOR', async () => {
    ;(neighborhoodsRepository.findByPath as any).mockResolvedValue({
      ...kayitTemel,
      content: '<p><a href="javascript:steal()">bağlantı</a></p>',
    })

    const s: any = await neighborhoodsService.getByPath('kaynarca-mahallesi')

    expect(s.data.content).not.toContain('javascript:')
  })

  it('meşru biçimlendirme KORUNUYOR', async () => {
    ;(neighborhoodsRepository.findByPath as any).mockResolvedValue({
      ...kayitTemel,
      content: '<h2>Başlık</h2><p><strong>kalın</strong> ve <a href="/pendik">bağlantı</a></p>',
    })

    const s: any = await neighborhoodsService.getByPath('kaynarca-mahallesi')

    expect(s.data.content).toContain('<h2>Başlık</h2>')
    expect(s.data.content).toContain('<strong>kalın</strong>')
    expect(s.data.content).toContain('href="/pendik"')
  })
})

describe('listByDistrictSlug — ilçe listesi', () => {
  it('varsayılan olarak YALNIZ YAYINDAKİLERİ istiyor', async () => {
    ;(neighborhoodsRepository.findByDistrictId as any).mockResolvedValue([])

    await neighborhoodsService.listByDistrictSlug('pendik')

    expect(neighborhoodsRepository.findByDistrictId).toHaveBeenCalledWith(7, true)
  })

  it('kardeş listesi için pasifler de istenebiliyor', async () => {
    ;(neighborhoodsRepository.findByDistrictId as any).mockResolvedValue([])

    await neighborhoodsService.listByDistrictSlug('pendik', { aktifSadece: false })

    expect(neighborhoodsRepository.findByDistrictId).toHaveBeenCalledWith(7, false)
  })

  it('İSTANBUL DIŞI bölge için boş liste dönüyor', async () => {
    const s: any = await neighborhoodsService.listByDistrictSlug('nilufer')

    expect(s.data.mahalleler).toEqual([])
    expect(neighborhoodsRepository.findByDistrictId).not.toHaveBeenCalled()
  })

  it('BAŞKA İLÇENİN kayıtları sorguya girmiyor (sızıntı yok)', async () => {
    ;(neighborhoodsRepository.findByDistrictId as any).mockResolvedValue([])

    await neighborhoodsService.listByDistrictSlug('pendik')

    // Süzgeç sunucuda ve districtId ile: bir ilçenin listesi başka bir
    // ilçenin kaydını hiç görmüyor.
    expect(neighborhoodsRepository.findByDistrictId).toHaveBeenCalledWith(7, true)
    expect(neighborhoodsRepository.findByDistrictId).not.toHaveBeenCalledWith(90, expect.anything())
  })
})
