// server/domain/neighborhoods/neighborhood.identity.test.ts
//
// TEK KAYIT ADRES TÜRETİMİ.
//
// Bu işlev panelden gelen her oluşturma ve her ad/ilçe değişikliğinde
// çalışıyor; ürettiği değer doğrudan bir public URL oluyor. Yanlış bir
// karar ya var olan bir sayfayı gölgeler ya da adresi olmayan bir kayıt
// üretir.
import { describe, expect, it } from 'vitest'
import { mahalleKimligi } from './neighborhood.identity.ts'

const bos = () => new Set<string>()

describe('mahalleKimligi — taban adres', () => {
  it('adres boştaysa TABAN adresi veriyor', () => {
    const s = mahalleKimligi({ ad: 'Kaynarca', ilceSlug: 'pendik', doluYollar: bos() })
    expect(s).toEqual({
      basarili: true,
      slug: 'kaynarca',
      canonicalPath: 'kaynarca-mahallesi',
      yedek: false,
    })
  })

  it('Türkçe adı doğru normalize ediyor', () => {
    const s = mahalleKimligi({ ad: 'Çınardere', ilceSlug: 'pendik', doluYollar: bos() })
    expect(s).toMatchObject({ basarili: true, slug: 'cinardere', canonicalPath: 'cinardere-mahallesi' })
  })
})

describe('mahalleKimligi — çakışma', () => {
  it('taban doluysa İLÇE ÖNEKLİ yedeğe düşüyor', () => {
    const s = mahalleKimligi({
      ad: 'Fatih',
      ilceSlug: 'kucukcekmece',
      doluYollar: new Set(['fatih-mahallesi']),
    })
    expect(s).toEqual({
      basarili: true,
      slug: 'fatih',
      canonicalPath: 'kucukcekmece-fatih-mahallesi',
      yedek: true,
    })
  })

  it('MAHALLE OLMAYAN bir adres de çakışma sayılıyor', () => {
    // Kök ad alanı ortak: bir hizmet ya da yazı o adresi tutuyorsa mahalle
    // onu ele geçiremez.
    const s = mahalleKimligi({
      ad: 'Depolama',
      ilceSlug: 'pendik',
      doluYollar: new Set(['depolama-mahallesi']),
    })
    expect(s).toMatchObject({ basarili: true, canonicalPath: 'pendik-depolama-mahallesi' })
  })

  it('taban ve yedek İKİSİ DE doluysa REDDEDİYOR', () => {
    const s = mahalleKimligi({
      ad: 'Merkez',
      ilceSlug: 'pendik',
      doluYollar: new Set(['merkez-mahallesi', 'pendik-merkez-mahallesi']),
    })
    expect(s.basarili).toBe(false)
    if (!s.basarili) expect(s.hata).toContain('adres üretilemedi')
  })

  it('yayındaki bir adresi ASLA yeniden atamıyor', () => {
    // Sessiz URL devri bu ailenin en pahalı hatası olurdu.
    const dolu = new Set(['kaynarca-mahallesi'])
    const s = mahalleKimligi({ ad: 'Kaynarca', ilceSlug: 'kartal', doluYollar: dolu })
    expect(s).toMatchObject({ basarili: true, canonicalPath: 'kartal-kaynarca-mahallesi' })
    expect(dolu.has('kaynarca-mahallesi')).toBe(true)
  })
})

describe('mahalleKimligi — savunmacı davranış', () => {
  it('boş ad reddediliyor', () => {
    const s = mahalleKimligi({ ad: '   ', ilceSlug: 'pendik', doluYollar: bos() })
    expect(s.basarili).toBe(false)
  })

  it('yalnız noktalamadan oluşan ad reddediliyor (/-mahallesi üretmiyor)', () => {
    const s = mahalleKimligi({ ad: '---', ilceSlug: 'pendik', doluYollar: bos() })
    expect(s.basarili).toBe(false)
    if (!s.basarili) expect(s.hata).toContain('geçerli bir adres üretilemedi')
  })

  it('ilçe slug\'ı boşsa reddediliyor', () => {
    const s = mahalleKimligi({ ad: 'Kaynarca', ilceSlug: '', doluYollar: bos() })
    expect(s.basarili).toBe(false)
  })

  it('DETERMİNİSTİK: aynı girdi iki kez aynı çıktı', () => {
    const girdi = { ad: 'Fevzi Çakmak', ilceSlug: 'pendik', doluYollar: bos() }
    expect(mahalleKimligi(girdi)).toEqual(mahalleKimligi(girdi))
  })
})
