// server/domain/regions/district.gate.test.ts
//
// İSTANBUL İLÇESİ YAYIN KAPISI.
//
// Kurallar `prisma/ilce-yayina-al.mjs` içindeki ÇALIŞAN koddan (yorum
// başlığından değil) birebir çıkarıldı ve o betik artık bu modülü çağırıyor.
// Testler eşiğin (200 karakter) ve on dört maddelik iddia listesinin
// sessizce değişmemesini koruyor.
import { describe, expect, it } from 'vitest'
import { ilceKapisi, ILCE_IDDIA, type IlceAdayi, type IlceKapiBaglami } from './district.gate.ts'

/** Kapıdan geçen sağlam bir ilçe kaydı. */
const SAGLAM = (): IlceAdayi => ({
  slug: 'pendik',
  title: 'Pendik Evden Eve Nakliyat',
  subtitle: 'Pendik',
  excerpt: 'Pendik’te taşınma planı sokak ve kat durumuna göre kuruluyor.',
  content: `<p>${'Pendik yapı stoku ağırlıkla 2000 sonrası site düzeninde. '.repeat(6)}</p>`,
  metaDescription:
    'Pendik evden eve nakliyat: keşif, ambalajlama ve marangozlu kurulum. Sokak ve kat durumu yerinde ölçülür.',
  imageAlt: 'Pendik’te nakliyat ekibimiz',
  cities: [34],
  neighborhoods: ['Kaynarca', 'Yayalar', 'Kurtköy'],
  faqs: [{ question: 'Asansör yoksa?', answer: 'Yöntem keşifte belirleniyor.' }],
})

const BAGLAM = (ustuneYaz: Partial<IlceKapiBaglami> = {}): IlceKapiBaglami => ({
  aciklamaTekrarEdiyorMu: () => false,
  ...ustuneYaz,
})

const kural = (sonuc: ReturnType<typeof ilceKapisi>, anahtar: string) =>
  sonuc.kurallar.find((k) => k.anahtar === anahtar)

describe('ilceKapisi — geçerli kayıt', () => {
  it('sağlam ilçe kapıdan GEÇİYOR', () => {
    const s = ilceKapisi(SAGLAM(), BAGLAM())
    expect(s.gecti).toBe(true)
    expect(s.hatalar).toEqual([])
  })

  it('her kural için bir satır dönüyor (panel listesi bunu basıyor)', () => {
    const s = ilceKapisi(SAGLAM(), BAGLAM())
    const anahtarlar = s.kurallar.map((k) => k.anahtar)
    expect(anahtarlar).toContain('istanbul-ilcesi')
    expect(anahtarlar).toContain('slug')
    expect(new Set(anahtarlar).size).toBe(anahtarlar.length)
  })
})

describe('ilceKapisi — sınıflandırma', () => {
  it('İSTANBUL DIŞI kayıt reddediliyor', () => {
    const s = ilceKapisi({ ...SAGLAM(), slug: 'nilufer', cities: [16] }, BAGLAM())
    expect(kural(s, 'istanbul-ilcesi')?.gecti).toBe(false)
  })

  it('İSTANBUL İL sayfası ilçe SAYILMIYOR', () => {
    const s = ilceKapisi({ ...SAGLAM(), slug: 'istanbul' }, BAGLAM())
    expect(kural(s, 'istanbul-ilcesi')?.gecti).toBe(false)
  })

  it('yakası bilinmeyen slug reddediliyor', () => {
    // Betikte 1. maddeye BAĞLI DEĞİL: ikisi de her zaman değerlendiriliyor.
    const s = ilceKapisi({ ...SAGLAM(), slug: 'bilinmeyen-ilce' }, BAGLAM())
    expect(kural(s, 'yaka')?.gecti).toBe(false)
    expect(kural(s, 'istanbul-ilcesi')?.gecti).toBe(true)
  })
})

describe('ilceKapisi — zorunlu metin alanları', () => {
  it('title boşsa reddediliyor', () => {
    const s = ilceKapisi({ ...SAGLAM(), title: '   ' }, BAGLAM())
    expect(kural(s, 'title')?.gecti).toBe(false)
    expect(s.hatalar).toContain('title boş (H1 kaynağı)')
  })

  it('subtitle boşsa reddediliyor', () => {
    const s = ilceKapisi({ ...SAGLAM(), subtitle: null }, BAGLAM())
    expect(kural(s, 'subtitle')?.gecti).toBe(false)
  })

  it('gövde 200 karakterin ALTINDAYSA reddediliyor', () => {
    const s = ilceKapisi({ ...SAGLAM(), content: '<p>Kısa metin.</p>' }, BAGLAM())
    expect(kural(s, 'content')?.gecti).toBe(false)
  })

  it('uzunluk ETİKETSİZ metne göre ölçülüyor', () => {
    const etiketDolgusu = `<p>${'<span class="x"></span>'.repeat(40)}kısa</p>`
    const s = ilceKapisi({ ...SAGLAM(), content: etiketDolgusu }, BAGLAM())
    expect(kural(s, 'content')?.gecti).toBe(false)
  })
})

describe('ilceKapisi — arama açıklaması', () => {
  it('boşsa reddediliyor ve benzersizlik DEĞERLENDİRİLMİYOR', () => {
    // Betikteki `else if` semantiği.
    const s = ilceKapisi({ ...SAGLAM(), metaDescription: '' }, BAGLAM())
    expect(kural(s, 'meta-dolu')?.gecti).toBe(false)
    expect(kural(s, 'meta-benzersiz')?.gecti).toBe(null)
  })

  it('başka ilçeyle AYNI açıklama reddediliyor', () => {
    const s = ilceKapisi(SAGLAM(), BAGLAM({ aciklamaTekrarEdiyorMu: () => true }))
    expect(kural(s, 'meta-benzersiz')?.gecti).toBe(false)
  })

  it('UZUNLUK KURALI YOK — mahalle kapısındaki 70-175 sınırı buraya taşınmadı', () => {
    const s = ilceKapisi({ ...SAGLAM(), metaDescription: 'Kısa.' }, BAGLAM())
    expect(s.kurallar.find((k) => k.anahtar === 'meta-uzunluk')).toBeUndefined()
    expect(s.gecti).toBe(true)
  })
})

describe('ilceKapisi — doğrulanmamış iddia', () => {
  it.each([
    ['ücretsiz', 'Keşif ücretsiz yapılıyor.'],
    ['türkiye geneli', 'Türkiye geneli hizmet veriyoruz.'],
    ['12 yıl', '12 yıl deneyimle çalışıyoruz.'],
    ['kesin fiyat', 'Kesin fiyat veriyoruz.'],
    ['en ucuz', 'En ucuz biziz.'],
  ])('"%s" ifadesi reddediliyor', (_etiket, cumle) => {
    const aday = SAGLAM()
    const s = ilceKapisi({ ...aday, excerpt: `${aday.excerpt} ${cumle}` }, BAGLAM())
    expect(kural(s, 'iddia')?.gecti).toBe(false)
  })

  it('iddia taraması imageAlt alanını da kapsıyor', () => {
    const s = ilceKapisi({ ...SAGLAM(), imageAlt: 'Hasarsız taşıma' }, BAGLAM())
    expect(kural(s, 'iddia')?.gecti).toBe(false)
  })

  it('büyük/küçük harf farkı iddiayı gizleyemiyor', () => {
    const s = ilceKapisi({ ...SAGLAM(), title: 'EN UCUZ Pendik Nakliyat' }, BAGLAM())
    expect(kural(s, 'iddia')?.gecti).toBe(false)
  })

  it('liste betikteki on dört ifadeyi taşıyor', () => {
    // Mahalle listesiyle KARIŞTIRILMAMALI: bu listede 'en iyi' yok,
    // 'türkiye geneli' / '12 yıl' / 'kesin fiyat' var.
    expect(ILCE_IDDIA).toHaveLength(14)
    expect(ILCE_IDDIA).toContain('türkiye geneli')
    expect(ILCE_IDDIA).toContain('12 yıl')
    expect(ILCE_IDDIA).toContain('kesin fiyat')
    expect(ILCE_IDDIA).not.toContain('en iyi')
  })
})

describe('ilceKapisi — mahalle listesi ve SSS', () => {
  it('mahalle listesi boşsa reddediliyor ve ad denetimi ATLANIYOR', () => {
    const s = ilceKapisi({ ...SAGLAM(), neighborhoods: [] }, BAGLAM())
    expect(kural(s, 'mahalle-listesi')?.gecti).toBe(false)
    expect(kural(s, 'mahalle-adlari')?.gecti).toBe(null)
  })

  it('listede boş ad varsa reddediliyor', () => {
    const s = ilceKapisi({ ...SAGLAM(), neighborhoods: ['Kaynarca', '  '] }, BAGLAM())
    expect(kural(s, 'mahalle-adlari')?.gecti).toBe(false)
  })

  it('JSON DİZESİ olarak gelen alanlar da çözülüyor', () => {
    const aday = SAGLAM()
    const s = ilceKapisi(
      { ...aday, neighborhoods: JSON.stringify(aday.neighborhoods), faqs: JSON.stringify(aday.faqs) },
      BAGLAM()
    )
    expect(s.gecti).toBe(true)
  })

  it('cevabı boş SSS öğesi reddediliyor', () => {
    const s = ilceKapisi({ ...SAGLAM(), faqs: [{ question: 'Soru?', answer: '' }] }, BAGLAM())
    expect(kural(s, 'sss-tam')?.gecti).toBe(false)
  })

  it('ASGARİ SSS SAYISI YOK — boş liste kabul ediliyor', () => {
    // Mahalle kapısındaki "en az 3 soru" kuralı buraya TAŞINMADI.
    const s = ilceKapisi({ ...SAGLAM(), faqs: [] }, BAGLAM())
    expect(kural(s, 'sss-tam')?.gecti).toBe(true)
    expect(s.gecti).toBe(true)
  })
})

describe('ilceKapisi — adres', () => {
  it('geçersiz karakterli slug reddediliyor', () => {
    const s = ilceKapisi({ ...SAGLAM(), slug: 'Pendik_Merkez' }, BAGLAM())
    expect(kural(s, 'slug')?.gecti).toBe(false)
  })
})
