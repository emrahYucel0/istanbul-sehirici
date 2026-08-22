// server/domain/regions/legacy.temizlik.test.ts
//
// İSTANBUL DIŞI BÖLGE SİLME BETİĞİ — GÜVENLİK ÇİTLERİ.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN AYRI BİR DOSYA
//
// `legacy.emeklilik.test.ts` yayından çekmeyi koruyor; o işlem geri
// alınabilir. Bu betik SATIR VE DOSYA SİLİYOR. Geri dönüş yalnız yedekten
// mümkün, dolayısıyla korunması gereken şey de farklı: burada test edilen
// "doğru kayıtları buldu mu" değil, "yanlış bir şeyi silmesi MÜMKÜN mü".
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { istanbulIlcesiMi, ISTANBUL_IL_SLUG } from '../../../shared/utils/istanbul.ts'

const oku = (...p: string[]) => readFileSync(join(process.cwd(), ...p), 'utf8')
const betik = oku('prisma', 'legacy-bolge-temizligi.mjs')
const kod = betik.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ')

/** Betikteki hedef kuralının birebir kopyası. */
const silinecekMi = (k: { slug: string; cities: unknown }) =>
  !istanbulIlcesiMi(k) && k.slug !== ISTANBUL_IL_SLUG

// ═══════════════════════════════════════════ HEDEF KURALI

describe('silme kümesi', () => {
  it.each([
    ['kadikoy', [34]],
    ['pendik', [34]],
    ['silivri', [34]],
    ['adalar', [34]],
  ])('İstanbul ilçesi %s SİLİNMİYOR', (slug, cities) => {
    expect(silinecekMi({ slug, cities })).toBe(false)
  })

  it('özel `istanbul` kaydı SİLİNMİYOR', () => {
    expect(silinecekMi({ slug: ISTANBUL_IL_SLUG, cities: [34] })).toBe(false)
  })

  it.each([
    ['ankara', [6]],
    ['izmir', [35]],
    ['bornova', [35]],
    ['gebze', [41]],
  ])('İstanbul dışı %s siliniyor', (slug, cities) => {
    expect(silinecekMi({ slug, cities })).toBe(true)
  })

  it('yayın durumu kümeye GİRMİYOR — kapsam kararı, yayın kararı değil', () => {
    // Kümeyi kuran SÜZGEÇ satırı okunuyor; raporlama satırlarındaki
    // `isActive` sayımları (kaç aktif / kaç pasif) hedefi etkilemiyor.
    const suzgec = kod.split('\n').find((s) => s.includes('.filter((r) => !istanbulIlcesiMi(r)'))
    expect(suzgec, 'hedef süzgeci bulunamadı').toBeDefined()
    expect(suzgec).toContain("r.slug !== ISTANBUL_IL_SLUG")
    expect(suzgec).not.toContain('isActive')
  })
})

// ═══════════════════════════════════════════ ÇİTLER

describe('betik yanlış bir şeyi silemiyor', () => {
  it('yedek olmadan çalışmayı reddediyor', () => {
    expect(kod).toContain('yedekTaze')
    expect(kod).toContain('son 24 saatte alınmış yedek yok')
  })

  it('İstanbul ilçesi sayısı 39 değilse duruyor', () => {
    expect(kod).toContain('ilceler.length !== 39')
  })

  it('özel `istanbul` kaydı tek değilse duruyor', () => {
    expect(kod).toContain('ilKaydi.length !== 1')
  })

  it('bağlı mahalle varsa duruyor — sessiz cascade yok', () => {
    expect(kod).toContain('bagliMahalle.length')
    expect(kod).toContain('cascade veri kaybı')
  })

  it('engel varsa --uygula bile silmiyor', () => {
    const i = kod.indexOf('Engeller var; silme YAPILMADI')
    const j = kod.indexOf('prisma.region.deleteMany')
    expect(i).toBeGreaterThan(-1)
    expect(j).toBeGreaterThan(i)
  })

  it('varsayılan KURU ÇALIŞTIRMA', () => {
    expect(kod).toContain("includes('--uygula')")
    expect(kod).toContain('if (!uygula)')
  })
})

// ═══════════════════════════════════════════ MEDYA KANITI

describe('görsel yalnız KANITLA siliniyor', () => {
  it('referans kütüğünü kullanıyor — ikinci tarama yazılmamış', () => {
    expect(kod).toContain('referansHaritasi')
    expect(kod).toContain('mantiksalAd')
  })

  it('yalnız /yuklemeler önekli yollar aday', () => {
    expect(kod).toContain('y.startsWith(YUKLEME_ONEKI)')
  })

  it('silme sonrası referans SIFIR değilse görsel korunuyor', () => {
    expect(kod).toContain('kalan.length === 0')
    expect(kod).toContain('korunacakGorsel.push')
  })

  it('kök kilidi var — depo dışına çıkamıyor', () => {
    expect(kod).toContain('path.resolve(DEPO, d)')
    expect(kod).toContain('hedefYol.startsWith(path.resolve(DEPO) + path.sep)')
  })

  it('/images statik varlıklarına dokunmuyor', () => {
    // Silme yolu YALNIZ DEPO'dan türüyor; `public` hiç anılmıyor.
    expect(kod).not.toContain("'public'")
    expect(kod).not.toContain('public/images')
  })

  it('sıra doğru: dosya → StoredFile → Region', () => {
    const iDosya = kod.indexOf('fs.unlinkSync')
    const iSatir = kod.indexOf('prisma.storedFile.deleteMany')
    const iBolge = kod.indexOf('prisma.region.deleteMany')
    expect(iDosya).toBeGreaterThan(-1)
    expect(iSatir).toBeGreaterThan(iDosya)
    expect(iBolge).toBeGreaterThan(iSatir)
  })

  it('silme sonrası kayıp görsel denetimi yapıyor', () => {
    expect(kod).toContain('referansı olup dosyası KAYIP görsel')
  })
})

// ═══════════════════════════════════════════ İZ KAYDI

describe('yapılan iş kayıt altında', () => {
  it('plan dosyası kuru çalıştırmada yazılıyor', () => {
    expect(kod).toContain('legacy-bolge-temizligi-plan.json')
  })

  it('silme kaydı yazılıyor', () => {
    expect(kod).toContain('legacy-bolge-temizligi-kayit.json')
  })

  it('kayıt dosyası depoda ve hangi yedeğe dönüleceğini söylüyor', () => {
    const yol = join(process.cwd(), 'prisma', 'legacy-bolge-temizligi-kayit.json')
    if (!existsSync(yol)) return // henüz çalıştırılmamış kurulumda geç
    const kayit = JSON.parse(readFileSync(yol, 'utf8'))
    expect(kayit.yedek).toMatch(/\.sql$/)
    expect(kayit.silinenBolge).toBeGreaterThan(0)
    expect(kayit.sluglar).toHaveLength(kayit.silinenBolge)
    expect(kayit.sluglar).not.toContain('kadikoy')
    expect(kayit.sluglar).not.toContain(ISTANBUL_IL_SLUG)
  })
})
