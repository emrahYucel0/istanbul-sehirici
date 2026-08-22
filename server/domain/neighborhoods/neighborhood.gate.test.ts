// server/domain/neighborhoods/neighborhood.gate.test.ts
//
// YAYIN KAPISI.
//
// Kurallar `prisma/mahalle-yayina-al.mjs` içinden çıkarıldı ve o betik
// artık bu modülü çağırıyor. Testler eşiklerin (400 karakter, 70-175
// karakter, 3 SSS) ve iddia listesinin sessizce değişmemesini koruyor —
// gevşeyen bir kural, ince içerikli sayfaların dizine girmesi demek.
import { describe, expect, it } from 'vitest'
import { mahalleKapisi, type KapiAdayi, type KapiBaglami } from './neighborhood.gate.ts'

/** Kapıdan geçen sağlam bir aday — testler bunun üstüne tek alan bozuyor. */
const SAGLAM = (): KapiAdayi => ({
  canonicalPath: 'kaynarca-mahallesi',
  title: 'Kaynarca Mahallesi Evden Eve Nakliyat',
  excerpt: 'Kaynarca’da taşınma planı sokak genişliği ve kat durumuna göre kuruluyor.',
  content: `<p>${'Kaynarca yapı stoku ağırlıkla 2000 sonrası. '.repeat(20)}</p>`,
  metaDescription:
    'Kaynarca Mahallesi evden eve nakliyat: keşif, ambalajlama ve marangozlu kurulum. Sokak ve kat durumu yerinde ölçülür.',
  faqs: [
    { question: 'Asansör yoksa?', answer: 'Yöntem keşifte belirleniyor.' },
    { question: 'Süre ne kadar?', answer: 'Kat ve erişime göre değişiyor.' },
    { question: 'Sigorta var mı?', answer: 'Nakliyat sigortası kapsamında.' },
  ],
  facts: [{ label: 'Yapı dokusu', value: '2000 sonrası site ağırlıklı' }],
})

const ILCE = {
  slug: 'pendik',
  cities: [34],
  isActive: true,
  content: '<p>Pendik ilçe sayfasının kendi paragrafı, mahalleye kopyalanmamalı ve yeterince uzun.</p>',
}

const BAGLAM = (ustuneYaz: Partial<KapiBaglami> = {}): KapiBaglami => ({
  ilce: ILCE,
  aciklamaTekrarEdiyorMu: () => false,
  adresTekrarEdiyorMu: () => false,
  ...ustuneYaz,
})

/** Belirli bir kuralın durumunu okumak için. */
const kural = (sonuc: ReturnType<typeof mahalleKapisi>, anahtar: string) =>
  sonuc.kurallar.find((k) => k.anahtar === anahtar)

describe('mahalleKapisi — geçerli kayıt', () => {
  it('sağlam kayıt kapıdan GEÇİYOR', () => {
    const s = mahalleKapisi(SAGLAM(), BAGLAM())
    expect(s.gecti).toBe(true)
    expect(s.hatalar).toEqual([])
  })

  it('her kural için bir satır dönüyor (panel listesi bunu basıyor)', () => {
    const s = mahalleKapisi(SAGLAM(), BAGLAM())
    const anahtarlar = s.kurallar.map((k) => k.anahtar)
    expect(anahtarlar).toContain('parent-istanbul')
    expect(anahtarlar).toContain('ilce-kopya')
    expect(new Set(anahtarlar).size).toBe(anahtarlar.length) // tekrar yok
  })
})

describe('mahalleKapisi — ebeveyn', () => {
  it('İSTANBUL DIŞI ebeveyn reddediliyor', () => {
    const s = mahalleKapisi(SAGLAM(), BAGLAM({ ilce: { slug: 'nilufer', cities: [16], isActive: true } }))
    expect(s.gecti).toBe(false)
    expect(kural(s, 'parent-istanbul')?.gecti).toBe(false)
  })

  it('İSTANBUL İL sayfası ebeveyn OLAMIYOR', () => {
    // `slug === 'istanbul'` il sayfası; ilçe değil.
    const s = mahalleKapisi(SAGLAM(), BAGLAM({ ilce: { slug: 'istanbul', cities: [34], isActive: true } }))
    expect(kural(s, 'parent-istanbul')?.gecti).toBe(false)
  })

  it('ebeveyn geçersizken yayın durumu DEĞERLENDİRİLMİYOR', () => {
    // Betikteki `else if` semantiği: iki hata birden gösterilmiyor.
    const s = mahalleKapisi(SAGLAM(), BAGLAM({ ilce: { slug: 'nilufer', cities: [16], isActive: false } }))
    expect(kural(s, 'parent-aktif')?.gecti).toBe(null)
  })

  it('PASİF ilçe reddediliyor', () => {
    const s = mahalleKapisi(SAGLAM(), BAGLAM({ ilce: { ...ILCE, isActive: false } }))
    expect(s.gecti).toBe(false)
    expect(kural(s, 'parent-aktif')?.gecti).toBe(false)
  })

  it('ebeveyn yoksa reddediliyor', () => {
    const s = mahalleKapisi(SAGLAM(), BAGLAM({ ilce: null }))
    expect(s.gecti).toBe(false)
  })
})

describe('mahalleKapisi — adres', () => {
  it('geçersiz karakter reddediliyor', () => {
    const s = mahalleKapisi({ ...SAGLAM(), canonicalPath: 'Kaynarca_Mahallesi' }, BAGLAM())
    expect(kural(s, 'adres-karakter')?.gecti).toBe(false)
  })

  it('`-mahallesi` eki olmayan adres reddediliyor', () => {
    const s = mahalleKapisi({ ...SAGLAM(), canonicalPath: 'kaynarca' }, BAGLAM())
    expect(kural(s, 'adres-eki')?.gecti).toBe(false)
  })

  it('başka mahalleyle aynı adres reddediliyor', () => {
    const s = mahalleKapisi(SAGLAM(), BAGLAM({ adresTekrarEdiyorMu: () => true }))
    expect(kural(s, 'adres-benzersiz')?.gecti).toBe(false)
  })
})

describe('mahalleKapisi — içerik', () => {
  it('title boşsa reddediliyor', () => {
    const s = mahalleKapisi({ ...SAGLAM(), title: '   ' }, BAGLAM())
    expect(kural(s, 'title')?.gecti).toBe(false)
    expect(s.hatalar).toContain('title boş')
  })

  it('excerpt boşsa reddediliyor', () => {
    const s = mahalleKapisi({ ...SAGLAM(), excerpt: null }, BAGLAM())
    expect(kural(s, 'excerpt')?.gecti).toBe(false)
  })

  it('gövde 400 karakterin ALTINDAYSA reddediliyor', () => {
    const s = mahalleKapisi({ ...SAGLAM(), content: '<p>Kısa bir metin.</p>' }, BAGLAM())
    expect(kural(s, 'content')?.gecti).toBe(false)
  })

  it('uzunluk ETİKETSİZ metne göre ölçülüyor', () => {
    // 400 karakterlik HTML etiketi içeriği doldurmuş sayılmamalı.
    const etiketDolgusu = `<p>${'<span class="x"></span>'.repeat(50)}kısa</p>`
    const s = mahalleKapisi({ ...SAGLAM(), content: etiketDolgusu }, BAGLAM())
    expect(kural(s, 'content')?.gecti).toBe(false)
  })
})

describe('mahalleKapisi — arama açıklaması', () => {
  it('boşsa reddediliyor ve diğer iki alt kural DEĞERLENDİRİLMİYOR', () => {
    const s = mahalleKapisi({ ...SAGLAM(), metaDescription: '' }, BAGLAM())
    expect(kural(s, 'meta-dolu')?.gecti).toBe(false)
    expect(kural(s, 'meta-benzersiz')?.gecti).toBe(null)
    expect(kural(s, 'meta-uzunluk')?.gecti).toBe(null)
  })

  it('başka mahalleyle AYNI açıklama reddediliyor', () => {
    const s = mahalleKapisi(SAGLAM(), BAGLAM({ aciklamaTekrarEdiyorMu: () => true }))
    expect(kural(s, 'meta-benzersiz')?.gecti).toBe(false)
  })

  it('70 karakterden kısa açıklama reddediliyor', () => {
    const s = mahalleKapisi({ ...SAGLAM(), metaDescription: 'Kaynarca nakliyat.' }, BAGLAM())
    expect(kural(s, 'meta-uzunluk')?.gecti).toBe(false)
  })

  it('175 karakterden uzun açıklama reddediliyor', () => {
    const s = mahalleKapisi({ ...SAGLAM(), metaDescription: 'a'.repeat(176) }, BAGLAM())
    expect(kural(s, 'meta-uzunluk')?.gecti).toBe(false)
  })
})

describe('mahalleKapisi — sık sorulanlar', () => {
  it('3\'ten az soru reddediliyor', () => {
    const s = mahalleKapisi(
      { ...SAGLAM(), faqs: [{ question: 'Soru?', answer: 'Cevap.' }] },
      BAGLAM()
    )
    expect(kural(s, 'sss-sayi')?.gecti).toBe(false)
  })

  it('cevabı boş soru reddediliyor', () => {
    const aday = SAGLAM()
    const s = mahalleKapisi(
      { ...aday, faqs: [...(aday.faqs as any[]).slice(0, 2), { question: 'Soru?', answer: '' }] },
      BAGLAM()
    )
    expect(kural(s, 'sss-tam')?.gecti).toBe(false)
  })

  it('JSON DİZESİ olarak gelen faqs de çözülüyor', () => {
    // MariaDB sürücüsü Json sütununu kimi zaman dize döndürüyor.
    const aday = SAGLAM()
    const s = mahalleKapisi({ ...aday, faqs: JSON.stringify(aday.faqs) }, BAGLAM())
    expect(kural(s, 'sss-sayi')?.gecti).toBe(true)
  })
})

describe('mahalleKapisi — doğrulanmamış iddia', () => {
  it.each([
    ['ücretsiz', 'Taşıma ücretsiz keşifle başlıyor.'],
    ['en ucuz', 'İstanbul’un en ucuz nakliyecisiyiz.'],
    ['%100', '%100 hasarsız taşıma.'],
    ['türkiye genelinde', 'Türkiye genelinde hizmet veriyoruz.'],
  ])('"%s" ifadesi reddediliyor', (_etiket, cumle) => {
    const aday = SAGLAM()
    const s = mahalleKapisi({ ...aday, excerpt: `${aday.excerpt} ${cumle}` }, BAGLAM())
    expect(kural(s, 'iddia')?.gecti).toBe(false)
  })

  it('iddia taraması SSS ve künye alanlarını da kapsıyor', () => {
    const aday = SAGLAM()
    const s = mahalleKapisi(
      { ...aday, facts: [{ label: 'Fiyat', value: 'Sabit fiyat garantisi' }] },
      BAGLAM()
    )
    expect(kural(s, 'iddia')?.gecti).toBe(false)
  })

  it('büyük/küçük harf farkı iddiayı gizleyemiyor', () => {
    const aday = SAGLAM()
    const s = mahalleKapisi({ ...aday, title: 'EN UCUZ Kaynarca Nakliyat' }, BAGLAM())
    expect(kural(s, 'iddia')?.gecti).toBe(false)
  })
})

describe('mahalleKapisi — ilçe paragrafı kopyası', () => {
  it('ilçe sayfasından birebir paragraf kopyası reddediliyor', () => {
    // Bu ailenin en gerçek riski: mahalle sayfası ilçenin adı değiştirilmiş
    // kopyası olursa iki sayfa da değer kaybeder.
    const ilcePara =
      '<p>Pendik ilçe sayfasının kendi paragrafı, mahalleye kopyalanmamalı ve yeterince uzun.</p>'
    const aday = SAGLAM()
    const s = mahalleKapisi(
      { ...aday, content: `${ilcePara}${aday.content}` },
      BAGLAM({ ilce: { ...ILCE, content: ilcePara } })
    )
    expect(kural(s, 'ilce-kopya')?.gecti).toBe(false)
  })

  it('noktalama farkı kopyayı gizleyemiyor', () => {
    const ilcePara =
      '<p>Pendik ilçe sayfasının kendi paragrafı, mahalleye kopyalanmamalı ve yeterince uzun.</p>'
    const aday = SAGLAM()
    const bozulmus =
      '<p>Pendik ilçe sayfasının kendi paragrafı — mahalleye kopyalanmamalı ve yeterince uzun!</p>'
    const s = mahalleKapisi(
      { ...aday, content: `${bozulmus}${aday.content}` },
      BAGLAM({ ilce: { ...ILCE, content: ilcePara } })
    )
    expect(kural(s, 'ilce-kopya')?.gecti).toBe(false)
  })

  it('60 karakterden kısa ortak cümle kopya SAYILMIYOR', () => {
    // "Keşif ücretsizdir." gibi kısa ortak ifadeler yanlış pozitif üretirdi.
    const kisa = '<p>Kısa ortak cümle.</p>'
    const aday = SAGLAM()
    const s = mahalleKapisi(
      { ...aday, content: `${kisa}${aday.content}` },
      BAGLAM({ ilce: { ...ILCE, content: kisa } })
    )
    expect(kural(s, 'ilce-kopya')?.gecti).toBe(true)
  })
})
