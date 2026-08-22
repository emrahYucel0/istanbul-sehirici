// test/iddia-taramasi.test.ts
//
// DOĞRULANMAMIŞ TİCARİ İDDİA TARAYICISI — KAYNAK KODU TARAFI.
//
// ─────────────────────────────────────────────────────────────────────────
// NE YAPIYOR, NE YAPMIYOR
//
// Bu test herkese açık Vue bileşenlerinin ve SEO kütüğünün ÇALIŞAN kodunu
// tarıyor. Yorum satırları ayıklanıyor: bu depoda kaldırılan iddialar
// bilerek yorumda anlatılıyor ("eski metin şunu diyordu") ve o tarih
// kaydını silmek, aynı hatanın tekrar yapılmasını kolaylaştırırdı.
//
// TARAMA VERİ TABANINI KAPSAMIYOR. İçerik metinleri (Region, Post,
// FaqItem…) çalışma zamanında geliyor; onların denetimi canlı tarama ile
// yapıldı. Burada çivilenen şey, bir iddianın KODA geri sızmaması.
//
// Eğitim içeriği ile şirket taahhüdü ayrımı bilinçli: "Nakliyat Sigortası
// Neyi Kapsar?" başlıklı bir yazı sigortayı ANLATIYOR, "tüm taşımalarımız
// sigortalıdır" ise TAAHHÜT. Bu dosya yalnız ikinciyi arıyor.
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const kok = process.cwd()
const oku = (...p: string[]) => readFileSync(join(kok, ...p), 'utf8')

/**
 * Yorumları ve `<style>` bloklarını ayıklar.
 *
 * `<style>` ÖNCE atılıyor ve bu bir ayrıntı değil: CSS gradyan durakları
 * (`0% 100%`) `%\s?100` kalıbına eşleşiyor. M8 denetiminde tam olarak bu
 * yanlış pozitif otuz sayfada "%100 iddiası" göstermişti. Ölçülen şey
 * metin olmalı, stil değil.
 */
const kodu = (s: string): string =>
  s
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^\s*\/\/.*$/gm, ' ')

function dosyalar(dizin: string, uzanti: string[], toplanan: string[] = []): string[] {
  for (const ad of readdirSync(join(kok, dizin))) {
    const yol = join(dizin, ad)
    if (statSync(join(kok, yol)).isDirectory()) dosyalar(yol, uzanti, toplanan)
    // Windows'ta `join` ters eğik çizgi üretiyor; karşılaştırmalar tek
    // biçimde kalsın diye normalleştiriliyor.
    else if (uzanti.some((u) => ad.endsWith(u))) toplanan.push(yol.split(sep).join('/'))
  }
  return toplanan
}

/**
 * HERKESE AÇIK YÜZEY. Yönetim paneli bilerek dışarıda: oradaki metin
 * ziyaretçiye çıkmıyor ve yer tutucular ayrı bir sınıf.
 */
const HERKESE_ACIK = [
  ...dosyalar('app/components', ['.vue']).filter((y) => !y.includes('admin')),
  ...dosyalar('app/pages', ['.vue']).filter((y) => !y.includes('evdeneveyonetim')),
  'app/utils/sayfa-meta.ts',
  'app/composables/usePageSeo.ts',
  'app/composables/useSiteSettings.ts',
]

/** Şirket taahhüdü sayılan kalıplar. */
const IDDIALAR: [RegExp, string][] = [
  [/ücretsiz\s+keşif/i, 'ücretsiz keşif'],
  [/ücretsiz\s+ekspertiz/i, 'ücretsiz ekspertiz'],
  [/sabit\s+fiyat/i, 'sabit fiyat'],
  [/fiyat\s+garantisi/i, 'fiyat garantisi'],
  [/garantili\s+fiyat/i, 'garantili fiyat'],
  [/gizli\s+ücret/i, 'gizli ücret yok'],
  [/hasarsız\s+garanti/i, 'hasarsız garanti'],
  [/zarar\s+görmez/i, 'zarar görmez'],
  [/aynı\s+gün\s+(teslim|garanti)/i, 'aynı gün teslim garantisi'],
  [/%\s?100\b/, '%100'],
  [/\b12\s?\+\s?yıl/i, '12+ yıl'],
  [/8[.,]500\s?\+/, '8.500+'],
  [/\b81\s?il\b/i, '81 il'],
  [/sigortalı\s+taşıma/i, 'sigortalı taşıma'],
  [/tüm\s+taşımalarımız\s+sigortal/i, 'tüm taşımalarımız sigortalı'],
]

// ═══════════════════════════════════════════ GENEL TARAMA

describe('herkese açık kodda doğrulanmamış ticari iddia yok', () => {
  const bulgular: string[] = []
  for (const yol of HERKESE_ACIK) {
    const kaynak = kodu(oku(yol))
    for (const [kalip, ad] of IDDIALAR) {
      const m = kaynak.match(kalip)
      if (m) bulgular.push(`${yol} → ${ad} ("${m[0]}")`)
    }
  }

  it('taranan dosya sayısı beklenen aralıkta', () => {
    // Tarama sessizce boşalırsa test her zaman geçer. Alt sınır bunu yakalar.
    expect(HERKESE_ACIK.length).toBeGreaterThan(40)
  })

  it('bulgu YOK', () => {
    expect(bulgular).toEqual([])
  })
})

// ═══════════════════════════════════════════ NOKTASAL ÇİVİLER

describe('ana sayfa başlığı', () => {
  const meta = oku('app', 'utils', 'sayfa-meta.ts')
  const home = meta.slice(meta.indexOf("anahtar: 'home'"), meta.indexOf("anahtar: 'about'"))
  const baslik = home.match(/title:\s*'([^']+)'/)?.[1] ?? ''

  it('sigorta iddiası yok', () => {
    expect(baslik.toLowerCase()).not.toContain('sigortal')
  })

  it('ana anahtar kelime duruyor', () => {
    expect(baslik).toContain('İstanbul Evden Eve Nakliyat')
  })

  it('doğrulanmamış değer önermesi eklenmemiş', () => {
    for (const kelime of ['en iyi', 'garantili', 'profesyonel', 'lider', 'ucuz', 'ücretsiz']) {
      expect(baslik.toLowerCase(), kelime).not.toContain(kelime)
    }
  })

  it('SEO uzunluk sınırında', () => {
    expect(baslik.length).toBeGreaterThan(25)
    expect(baslik.length).toBeLessThanOrEqual(60)
  })

  it('ana sayfa açıklaması da iddiasız', () => {
    const aciklama = home.match(/description:\s*\n?\s*["'`]([\s\S]*?)["'`],/)?.[1] ?? ''
    expect(aciklama.length).toBeGreaterThan(50)
    expect(aciklama.toLowerCase()).not.toContain('sigortal')
    expect(aciklama.toLowerCase()).not.toContain('ücretsiz')
  })
})

describe('eylem düğmesi tek sahipli ve iddiasız', () => {
  const finalCta = oku('app', 'components', 'base', 'FinalCta.vue')

  it('metin Site Ayarları\'ndan geliyor', () => {
    expect(kodu(finalCta)).toContain('settings.value?.ctaLabel')
  })

  it('yedek metin iddia taşımıyor', () => {
    expect(kodu(finalCta)).toContain("'Keşif Talebi'")
    expect(kodu(finalCta)).not.toMatch(/ücretsiz/i)
  })

  it('ikinci bir yedek metin kaynağı yok', () => {
    const sayfalar = HERKESE_ACIK.filter((y) => y.endsWith('.vue'))
    const ctaYazanlar = sayfalar.filter((y) => /ctaLabel\s*\|\|/.test(kodu(oku(y))))
    expect(ctaYazanlar).toEqual(['app/components/base/FinalCta.vue'])
  })
})

describe('eski bölge şablonunda gömülü iddia yok', () => {
  const rv = kodu(oku('app', 'components', 'article', 'RegionView.vue'))

  it('"ücretsiz keşif" geçmiyor', () => {
    expect(rv).not.toMatch(/ücretsiz/i)
  })

  it('fiyat tablosu uyarısı hâlâ basılıyor — cümle silinmedi', () => {
    expect(rv).toContain('Tablodaki değerler tahminidir')
  })
})

describe('İstanbul ilçe şablonu temiz kaldı', () => {
  const idv = kodu(oku('app', 'components', 'article', 'IstanbulDistrictView.vue'))

  it.each(['ücretsiz', 'sigortal', 'sabit fiyat', '%100'])('%s geçmiyor', (kelime) => {
    expect(idv.toLowerCase()).not.toContain(kelime.toLowerCase())
  })
})

// ═══════════════════════════════════════════ KAPI LİSTELERİ KORUNDU

describe('kalite kapıları aynı kelimeleri engellemeye devam ediyor', () => {
  it.each([
    ['server/domain/regions/district.gate.ts', 'ilçe'],
    ['server/domain/neighborhoods/neighborhood.gate.ts', 'mahalle'],
  ])('%s yasak listesi duruyor', (yol) => {
    const kaynak = oku(yol)
    for (const kelime of ['sabit fiyat', '%100', 'hasarsız', 'gizli ücret']) {
      expect(kaynak, kelime).toContain(kelime)
    }
  })
})
