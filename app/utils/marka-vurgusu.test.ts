// app/utils/marka-vurgusu.test.ts
import { describe, expect, it } from 'vitest'
import { markaParcalari } from './marka-vurgusu.ts'

const birlestir = (ad: unknown) => markaParcalari(ad).map((p) => p.metin).join('')
const vurgulu = (ad: unknown) => markaParcalari(ad).filter((p) => p.vurgulu).map((p) => p.metin.trim())

describe('gerçek marka adı', () => {
  it('üç parçaya bölünüyor ve yalnız ortadaki vurgulanıyor', () => {
    expect(markaParcalari('Ege Kent Nakliyat')).toEqual([
      { metin: 'Ege ', vurgulu: false },
      { metin: 'Kent ', vurgulu: true },
      { metin: 'Nakliyat', vurgulu: false },
    ])
  })

  it('son parçada boşluk YOK — yazının sonunda boşluk kalmıyor', () => {
    const parcalar = markaParcalari('Ege Kent Nakliyat')
    expect(parcalar.at(-1)!.metin.endsWith(' ')).toBe(false)
  })
})

describe('metin korunuyor — bu işlev bölüyor, değiştirmiyor', () => {
  it.each([
    'Ege Kent Nakliyat',
    'Kent',
    'Nakliyat',
    'Ege Kent Nakliyat Taşımacılık Limited Şirketi',
  ])('%s birebir geri geliyor', (ad) => {
    expect(birlestir(ad)).toBe(ad)
  })

  it('fazla boşluk sadeleşiyor ama kelimeler bozulmuyor', () => {
    expect(birlestir('  Ege   Kent \n Nakliyat  ')).toBe('Ege Kent Nakliyat')
  })
})

describe('büyük/küçük harf — Türkçe yerel ayarıyla', () => {
  it.each(['KENT', 'kent', 'Kent', 'kENT'])('%s vurgulanıyor', (yazim) => {
    expect(vurgulu(`Ege ${yazim} Nakliyat`)).toEqual([yazim])
  })
})

describe('marka adı değişirse sessizce bozulmuyor', () => {
  it('Kent geçmeyen adda vurgu YOK ama metin tam basılıyor', () => {
    const parcalar = markaParcalari('Ege Şehir İçi Nakliyat')
    expect(parcalar.some((p) => p.vurgulu)).toBe(false)
    expect(parcalar.map((p) => p.metin).join('')).toBe('Ege Şehir İçi Nakliyat')
  })

  it('"Kent" bir kelimenin PARÇASIYSA vurgulanmıyor', () => {
    // Tam kelime eşleşmesi: "Kentsel" vurgulanırsa marka adının ortasında
    // beklenmedik bir renk çıkardı.
    expect(vurgulu('Ege Kentsel Nakliyat')).toEqual([])
  })

  it('birden çok Kent geçerse hepsi vurgulanıyor', () => {
    expect(vurgulu('Kent Kent')).toEqual(['Kent', 'Kent'])
  })
})

describe('geçersiz girdi', () => {
  it.each([[null], [undefined], [42], [{}], [''], ['   ']])('%s → boş dizi', (ad) => {
    expect(markaParcalari(ad)).toEqual([])
  })
})
