// test/politika-kimlik.test.ts
//
// HUKUKİ METİN KİMLİĞİ — TOHUM VE GÜNCELLEME BETİĞİ AYRIŞMASIN.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN TEST EDİLİYOR
//
// Kimlik iki yerde yaşıyor: `politika-tohum.mjs` (yeni kurulum) ve
// veritabanındaki satırlar (mevcut kurulum). İkincisini
// `politika-kimlik.mjs` düzeltiyor. Biri güncellenip diğeri unutulursa
// hata sessiz olur — eski kimlik yalnız BAZI kurulumlarda geri gelir ve
// bunu fark etmek için hukuki sayfaları elle okumak gerekir.
//
// Bu dosya iki tarafı da tarıyor. Veritabanına bakmıyor (test ortamında
// bağlantı yok); baktığı şey KAYNAK: tohum metni ve dönüşüm tablosu.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const oku = (...p: string[]) => readFileSync(join(process.cwd(), ...p), 'utf8')
const tohum = oku('prisma', 'politika-tohum.mjs')
const betik = oku('prisma', 'politika-kimlik.mjs')

const ESKI_ALAN = /evenakliyatevden\.com/g
const ESKI_POSTA = /info@evenakliyatevden\.com/g
const YENI_ALAN = /istanbulevenakliyat\.com/g
const YENI_POSTA = /info@istanbulevenakliyat\.com/g

/** Tohumdaki üç politika metnini şablon değişmezlerinden çıkarır. */
const metinler = (() => {
  const cikar = (ad: string) => {
    const bas = tohum.indexOf('const ' + ad + ' = `')
    if (bas === -1) return ''
    const govdeBas = tohum.indexOf('`', bas) + 1
    return tohum.slice(govdeBas, tohum.indexOf('`', govdeBas))
  }
  return { GIZLILIK: cikar('GIZLILIK'), SARTLAR: cikar('SARTLAR'), CEREZ: cikar('CEREZ') }
})()

// ═══════════════════════════════════════════ TOHUM

describe('tohum metinleri', () => {
  it('üç politika metni de bulundu', () => {
    for (const [ad, m] of Object.entries(metinler)) {
      expect(m.length, ad).toBeGreaterThan(1500)
    }
  })

  it.each(Object.keys(metinler))('%s — eski alan adı YOK', (ad) => {
    expect(metinler[ad as keyof typeof metinler].match(ESKI_ALAN)).toBeNull()
  })

  it.each(Object.keys(metinler))('%s — eski e-posta YOK', (ad) => {
    expect(metinler[ad as keyof typeof metinler].match(ESKI_POSTA)).toBeNull()
  })

  it('dosyanın tamamında eski kimlik YOK — yorumlar dahil', () => {
    // Burada yorumlar da sayılıyor: tohum dosyası hukuki METNİN kendisi,
    // içinde "eskiden şöyleydi" diye bir kayıt tutmuyor.
    expect(tohum.match(ESKI_ALAN)).toBeNull()
  })

  it('yeni kimlik yerinde', () => {
    expect((tohum.match(YENI_ALAN) || []).length).toBeGreaterThan(10)
    expect((tohum.match(YENI_POSTA) || []).length).toBeGreaterThan(3)
  })

  it('kayıt varsa üzerine YAZMIYOR — panelden yapılan düzeltme ezilmiyor', () => {
    expect(tohum).toContain('kayıt zaten var, üzerine yazılmadı')
    const iBul = tohum.indexOf('policyPage.findUnique')
    const iYaz = tohum.indexOf('policyPage.create')
    expect(iBul).toBeGreaterThan(-1)
    expect(iYaz).toBeGreaterThan(iBul)
  })
})

// ═══════════════════════════════════════════ TANIMSIZ UNVAN

describe('uydurma ticari unvan yok', () => {
  it('tanımsız "Şirket" terimi tohumdan kalktı', () => {
    expect(tohum.match(/Şirket/g)).toBeNull()
  })

  it('yerine nötr sıfat kondu', () => {
    expect((tohum.match(/[Ss]ite işletmecisi/g) || []).length).toBe(6)
  })

  it.each([
    'A.Ş.',
    'Ltd. Şti.',
    'Limited Şirketi',
    'Anonim Şirketi',
    'Nakliyat Ltd',
  ])('uydurma unvan biçimi "%s" YOK', (unvan) => {
    expect(tohum).not.toContain(unvan)
  })

  it('vergi/Mersis numarası uydurulmamış', () => {
    expect(tohum).not.toMatch(/mersis/i)
    expect(tohum).not.toMatch(/vergi\s*(no|numarası|kimlik)/i)
  })
})

// ═══════════════════════════════════════════ DÖNÜŞÜM TABLOSU

describe('güncelleme betiği tohumla aynı dönüşümü yapıyor', () => {
  it('kimlik tablosu doğru sırada — e-posta ÖNCE', () => {
    const iPosta = betik.indexOf("'info@evenakliyatevden.com'")
    const iAlan = betik.indexOf("['evenakliyatevden.com'")
    expect(iPosta).toBeGreaterThan(-1)
    expect(iAlan).toBeGreaterThan(iPosta)
  })

  it('altı unvan dönüşümünün altısı da tabloda', () => {
    const blok = betik.slice(betik.indexOf('export const UNVAN'), betik.indexOf('const donustur'))
    expect((blok.match(/\['?"?<?[^\n]*Şirket/g) || []).length).toBe(6)
  })

  it('varsayılan KURU ÇALIŞTIRMA', () => {
    expect(betik).toContain("includes('--uygula')")
    expect(betik).toContain('if (!uygula)')
  })

  it('yeniden çalıştırılabilir — temizse yazmıyor', () => {
    expect(betik).toContain('metinler zaten temiz')
  })

  it('madde sayısını doğruluyor — hüküm eklenip çıkarılmadığının kanıtı', () => {
    expect(betik).toContain('<h2>')
    expect(betik).toContain('<li>')
    expect(betik).toContain('madde sayısı DEĞİŞMEZ')
  })

  it('hukuki hükmü yeniden yazmadığı yazılı', () => {
    expect(betik).toContain('hukuki hükümlerin anlamını değiştirmiyor')
  })
})

// ═══════════════════════════════════════════ SAYFA META

describe('politika sayfalarının SEO metinleri de temiz', () => {
  const meta = oku('app', 'utils', 'sayfa-meta.ts')
  const politikalar = ['gizlilik-politikasi', 'kullanim-sartlari', 'cerez-politikasi']

  it.each(politikalar)('%s kütükte var', (anahtar) => {
    expect(meta).toContain(`anahtar: '${anahtar}'`)
  })

  it('SEO kütüğünde eski kimlik yok', () => {
    expect(meta.match(ESKI_ALAN)).toBeNull()
    expect(meta.match(ESKI_POSTA)).toBeNull()
  })
})
