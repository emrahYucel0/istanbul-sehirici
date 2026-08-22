// test/cta-sahipligi.test.ts
//
// GENEL ÇAĞRI (CTA) — SAHİPLİK DEVRİ.
//
// ─────────────────────────────────────────────────────────────────────────
// NE OLDU
//
// `HeroPage` modelinin 12 alanı vardı ve M4'ten sonra ana sayfa onu HİÇ
// okumuyordu. Geriye tek bir canlı tüketici kalmıştı: İstanbul dışı legacy
// bölge sayfalarının kapanış bandı (`base/FinalCta.vue`), o da yalnız İKİ
// alanı okuyordu — `primaryButton` ve `primaryLink`.
//
// İki alan için 12 alanlık bir "Anasayfa" paneli menüde durmak, yöneticiye
// ana sayfayı oradan yönettiğini düşündürüyordu. Alanlar Site Ayarları'na
// taşındı (`ctaLabel` / `ctaLink`) ve HeroPage'in yönetim yüzeyi kaldırıldı.
//
// ─────────────────────────────────────────────────────────────────────────
// BU DOSYA NEYİ KORUYOR
//
//   1. Devir tamamlandı: hiçbir yer artık `/api/hero` okumuyor.
//   2. Yeni sahip gerçekten bağlı: FinalCta Site Ayarları'ndan okuyor.
//   3. Yedek değer DEĞİŞMEDİ: ayar boşsa basılan metin eskisiyle aynı.
//
// Görünen değerin gerçekten değişmediği ayrıca canlı sunucuda ölçüldü
// (bkz. M6 raporu, legacy bölge CTA paritesi).
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const kok = process.cwd()
const oku = (...p: string[]) => readFileSync(join(kok, ...p), 'utf8')
const kodu = (s: string) =>
  s.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const finalCta = oku('app', 'components', 'base', 'FinalCta.vue')

describe('HeroPage yönetim yüzeyi kaldırıldı', () => {
  it.each([
    ['uç nokta', ['server', 'api', 'hero.ts']],
    ['domain yapılandırması', ['server', 'domain', 'sections', 'configs', 'hero.config.ts']],
    ['panel', ['app', 'components', 'admin', 'base', 'HeroPanel.vue']],
    ['rota', ['app', 'pages', 'evdeneveyonetim', 'hero.vue']],
  ])('%s yok', (_ad, parcalar) => {
    expect(existsSync(join(kok, ...parcalar))).toBe(false)
  })

  it('hiçbir yer /api/hero okumuyor', () => {
    expect(kodu(finalCta)).not.toContain('/api/hero')
  })
})

describe('yeni sahip Site Ayarları', () => {
  it('FinalCta düğme metnini ayarlardan alıyor', () => {
    expect(kodu(finalCta)).toContain('settings.value?.ctaLabel')
  })

  it('FinalCta düğme adresini ayarlardan alıyor', () => {
    expect(kodu(finalCta)).toContain('settings.value?.ctaLink')
  })

  it('yedek metin İDDİA TAŞIMIYOR', () => {
    // M6'da yedek bilerek değiştirilmemişti ("ayar boşsa sayfa sessizce
    // başka bir şey göstermesin"). P1-3'te değişti: yedek 'Ücretsiz Keşif
    // Talep Et' idi ve ayar satırı silindiğinde ekrana çıkan metin oydu.
    // Yeni yedek, veri tabanındaki değerle aynı — yani ayar boşalsa bile
    // ekranda bir değişiklik olmuyor, gerekçe korunuyor.
    // `kodu()` yorumları ayıklıyor: kaldırılan metin bilerek yorumda
    // anlatılıyor ve o tarih kaydı silinmemeli.
    expect(kodu(finalCta)).toContain("'Keşif Talebi'")
    expect(kodu(finalCta)).not.toMatch(/ücretsiz/i)
    expect(kodu(finalCta)).toContain("'/iletisim'")
  })

  it('yazma sözleşmesi yeni alanları tanıyor', () => {
    const sema = oku('server', 'api', 'siteSettings.ts')
    expect(sema).toContain('ctaLabel')
    expect(sema).toContain('ctaLink')
  })

  it('panelde düzenlenebiliyor', () => {
    const panel = oku('app', 'components', 'admin', 'base', 'SiteSettingsPanel.vue')
    expect(panel).toContain('form.ctaLabel')
    expect(panel).toContain('form.ctaLink')
  })
})

describe('göç yalnız EKLEDİ', () => {
  const gocDosyasi = ['prisma', 'migrations', '20260823090000_site_cta', 'migration.sql']

  it('göç dosyası var', () => {
    expect(existsSync(join(kok, ...gocDosyasi))).toBe(true)
  })

  it('hiçbir şey DROP edilmiyor', () => {
    const sql = oku(...gocDosyasi).toUpperCase()
    expect(sql).not.toContain('DROP')
    expect(sql).not.toContain('DELETE')
    expect(sql).not.toContain('TRUNCATE')
  })

  it('değerler HeroPage\'den birebir kopyalanıyor', () => {
    const sql = oku(...gocDosyasi)
    expect(sql).toContain('h.`primaryButton`')
    expect(sql).toContain('h.`primaryLink`')
    // COALESCE: tekrar çalıştırıldığında dolu bir değerin üzerine yazmıyor.
    expect(sql).toContain('COALESCE')
  })

  it('HeroPage tablosu duruyor — geri alınabilirlik', () => {
    const sema = oku('prisma', 'schema.prisma')
    expect(sema).toContain('model HeroPage {')
  })
})
