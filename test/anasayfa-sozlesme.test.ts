// test/anasayfa-sozlesme.test.ts
//
// ANA SAYFA BÖLÜM SÖZLEŞMESİ.
//
// Sözleşme `shared/` altında çünkü İKİ taraf okuyor: sunucu (hangi anahtar
// geçerli, kaç öğe) ve panel (hangi form basılacak). Buradaki testler ikisi
// arasındaki tek kaynağı ve kapalı kümeyi koruyor — anahtar kümesi
// büyüdüğü an panel sayfa oluşturucuya dönüşmeye başlar.
import { describe, expect, it } from 'vitest'
import {
  ANASAYFA_ANAHTARLARI,
  ANASAYFA_BOLUMLERI,
  anasayfaAnahtariMi,
  GORSEL_ALANLARI,
  UZUN_ALANLAR,
} from '../shared/utils/anasayfa.ts'

describe('bölüm anahtarları KAPALI küme', () => {
  it('yedi bölüm var ve sıra sayfadaki sırayla aynı', () => {
    // `yorumlar` M5'te eklendi ve yeri kasıtlı: Sorular (kendi anahtarı yok,
    // FaqSection'dan geliyor) ile Kapanış arasında.
    expect([...ANASAYFA_ANAHTARLARI]).toEqual([
      'hero',
      'kapsam',
      'uc-istanbul',
      'hizmetler',
      'fiyat',
      'yorumlar',
      'kapanis',
    ])
  })

  it.each([...ANASAYFA_ANAHTARLARI])('"%s" geçerli', (anahtar) => {
    expect(anasayfaAnahtariMi(anahtar)).toBe(true)
  })

  it.each(['yeni-bolum', 'HERO', 'hero ', '', 'about', null, undefined, 42, {}])(
    '%s geçersiz',
    (deger) => {
      expect(anasayfaAnahtariMi(deger)).toBe(false)
    }
  )

  it('her anahtarın bir tanımı var', () => {
    for (const anahtar of ANASAYFA_ANAHTARLARI) {
      expect(ANASAYFA_BOLUMLERI[anahtar]).toBeDefined()
    }
    expect(Object.keys(ANASAYFA_BOLUMLERI)).toHaveLength(ANASAYFA_ANAHTARLARI.length)
  })
})

describe('öğe sayıları SABİT — tasarımın parçası', () => {
  it.each([
    ['hero', 4, 'ölçülen dört koşul'],
    ['kapsam', 3, 'üç örnek ilçe'],
    ['uc-istanbul', 3, 'üç koşul sahnesi'],
    ['hizmetler', 0, 'defter Service tablosundan geliyor'],
    ['fiyat', 5, 'beş fiyat faktörü'],
    ['yorumlar', 0, 'öğesi yok — yorumlar ziyaretçiden geliyor'],
    ['kapanis', 0, 'öğesi yok'],
  ])('%s → %i öğe (%s)', (anahtar, adet) => {
    expect(ANASAYFA_BOLUMLERI[anahtar as never].ogeSayisi).toBe(adet)
  })
})

describe('alan tanımları tutarlı', () => {
  it('her gövde alanının panelde bir etiketi var', () => {
    for (const [anahtar, tanim] of Object.entries(ANASAYFA_BOLUMLERI)) {
      for (const alan of tanim.alanlar) {
        expect(tanim.etiketler[alan], `${anahtar}.${alan}`).toBeTruthy()
      }
    }
  })

  it('her öğe alanının panelde bir etiketi var', () => {
    for (const [anahtar, tanim] of Object.entries(ANASAYFA_BOLUMLERI)) {
      for (const alan of tanim.ogeAlanlari) {
        expect(tanim.ogeEtiketleri[alan], `${anahtar}.item.${alan}`).toBeTruthy()
      }
    }
  })

  it('öğesi olan bölümlerin öğe başlığı var', () => {
    for (const tanim of Object.values(ANASAYFA_BOLUMLERI)) {
      if (tanim.ogeSayisi > 0) expect(tanim.ogeBasligi).toBeTruthy()
    }
  })

  it('öğesiz bölümlerin öğe alanı YOK', () => {
    for (const tanim of Object.values(ANASAYFA_BOLUMLERI)) {
      if (tanim.ogeSayisi === 0) expect(tanim.ogeAlanlari).toEqual([])
    }
  })

  it('görsel taşıyan her yerde ALT METİN alanı da var', () => {
    // Alt metin otomatik üretilmiyor: yönetici yazıyor. Görsel alanı olup
    // alt metin alanı olmayan bir bölüm, erişilebilirlik borcu üretirdi.
    for (const [anahtar, tanim] of Object.entries(ANASAYFA_BOLUMLERI)) {
      if (tanim.alanlar.includes('imagePath')) {
        expect(tanim.alanlar, anahtar).toContain('imageAlt')
      }
      if (tanim.ogeAlanlari.includes('imagePath')) {
        expect(tanim.ogeAlanlari, `${anahtar}.item`).toContain('imageAlt')
      }
    }
  })

  it('görsel alanları panelde yükleyici basıyor', () => {
    expect(GORSEL_ALANLARI.has('imagePath')).toBe(true)
    expect(GORSEL_ALANLARI.has('imageAlt')).toBe(false)
  })

  it('uzun metin alanları textarea basıyor', () => {
    for (const alan of ['lead', 'note', 'closing', 'closingNote', 'body', 'imageAlt']) {
      expect(UZUN_ALANLAR.has(alan), alan).toBe(true)
    }
    // Başlık ve düğme etiketi tek satır: uzun kutu, yöneticiyi paragraf
    // yazmaya davet ederdi.
    expect(UZUN_ALANLAR.has('heading')).toBe(false)
    expect(UZUN_ALANLAR.has('ctaLabel')).toBe(false)
  })
})

describe('sözleşme sayfa oluşturucuya dönüşmüyor', () => {
  it('bölüm sırası, yerleşim ve görünürlük alanı YOK', () => {
    // Bunlardan biri eklendiği an panel tasarımı değiştirebilir hâle gelir.
    for (const tanim of Object.values(ANASAYFA_BOLUMLERI)) {
      const alanlar = [...tanim.alanlar, ...tanim.ogeAlanlari]
      for (const yasak of ['order', 'isActive', 'layout', 'grid', 'component', 'className']) {
        expect(alanlar).not.toContain(yasak)
      }
    }
  })
})
