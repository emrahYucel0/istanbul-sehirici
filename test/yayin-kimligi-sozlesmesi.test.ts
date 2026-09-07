// test/yayin-kimligi-sozlesmesi.test.ts
//
// YAYIN KİMLİĞİ VE ŞEHİR İÇİ KONUMLANDIRMA — SÖZLEŞME.
//
// ─────────────────────────────────────────────────────────────────────────
// NE OLDU
//
// Site ilk kez şu kimlikle yayınlanacak:
//
//     alan adı  https://istanbulsehirici.com
//     marka     Ege Kent Nakliyat
//     e-posta   info@istanbulsehirici.com
//
// Aynı turda "Şehirler Arası Nakliyat" hizmeti "Şehir İçi Nakliyat" ile
// değiştirildi (aynı yuva, yedi hizmet korunuyor).
//
// Bu dosyanın koruduğu şey, geri geldiğinde EKRANDA HATA VERMEYEN türden:
// eski bir alan adı bir yardımcıda kalır, bir tohum betiği eski e-postayı
// geri yazar, ya da kuruluş `@id`si düşer ve yapısal veri yeniden birbirini
// tanımayan düğümlere ayrılır. Hiçbiri build'i kırmaz.
//
// KAPSAM NOTU: içerik metinleri veritabanında ve üretime DÖKÜMLE gidiyor
// (bkz. deploy/YAYIN-ADIMLARI.md §1.1). Burada kodun ve tohum betiklerinin
// sözleşmesi test ediliyor; render edilen 26 rotanın ölçümü raporda.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const kok = process.cwd()
const oku = (...p: string[]) => readFileSync(join(kok, ...p), 'utf8')

const ESKI_ALAN = 'istanbulevenakliyat.com'
const YENI_ALAN = 'istanbulsehirici.com'
const YENI_POSTA = 'info@istanbulsehirici.com'
const MARKA = 'Ege Kent Nakliyat'

const config = oku('nuxt.config.ts')
const ayarlar = oku('app', 'composables', 'useSiteSettings.ts')
const guvenlik = oku('server', 'middleware', 'security.ts')
const sayfaMeta = oku('app', 'utils', 'sayfa-meta.ts')
const kurulus = oku('shared', 'utils', 'kurulus.ts')
const hizalama = oku('prisma', 'm19b3-kimlik-ve-sehir-ici.mjs')

// ═══════════════════════════════════════════ ALAN ADI

describe('yayın alan adı tek kaynaktan', () => {
  it('nuxt.config site.url yeni alan adı', () => {
    expect(config).toContain(`process.env.NUXT_SITE_URL || "https://${YENI_ALAN}"`)
  })

  it('site.name marka adı — konu ifadesi DEĞİL', () => {
    expect(config).toContain(`process.env.NUXT_SITE_NAME || "${MARKA}"`)
    // "İstanbul Şehir İçi Nakliyat" bir HİZMET/KONU; şirket adı değil.
    expect(config).not.toMatch(/NUXT_SITE_NAME \|\| "İstanbul Şehir İçi/)
  })

  it('composable yedeği de yeni alan adı', () => {
    expect(ayarlar).toContain(`const DEFAULT_SITE_URL = 'https://${YENI_ALAN}'`)
  })

  it('CSP görsel kaynağı yeni alan adı', () => {
    expect(guvenlik).toContain(`https://${YENI_ALAN}`)
    expect(guvenlik).not.toContain(ESKI_ALAN)
  })

  it('NuxtImg izinli alan adları güncel', () => {
    expect(config).toContain(`domains: ["${YENI_ALAN}", "cdn.${YENI_ALAN}"]`)
  })
})

describe('eski alan adı çalışma zamanı kaynağında YOK', () => {
  const CALISMA_ZAMANI = [
    ['nuxt.config.ts'],
    ['app', 'composables', 'useSiteSettings.ts'],
    ['app', 'utils', 'sayfa-meta.ts'],
    ['app', 'utils', 'mutlak-url.ts'],
    ['server', 'middleware', 'security.ts'],
    ['app', 'pages', 'index.vue'],
    ['app', 'pages', 'iletisim.vue'],
    ['app', 'pages', 'hakkimizda.vue'],
    ['app', 'pages', 'hizmetlerimiz.vue'],
    ['app', 'pages', '[...slug].vue'],
  ]
  it.each(CALISMA_ZAMANI)('%s — eski alan adı yok', (...p: string[]) => {
    expect(oku(...p)).not.toContain(ESKI_ALAN)
  })

  it('tohum betikleri eski kimliği GERİ YAZMIYOR', () => {
    // Bu betikler `npm run …` ile tekrar çalıştırılabiliyor; hedef değerleri
    // eski kimlikte kalsaydı bir çalıştırma yayın kimliğini geri alırdı.
    for (const dosya of ['politika-tohum.mjs', 'politika-hizalama.mjs', 'ayar-metinleri-tohum.mjs']) {
      expect(oku('prisma', dosya), dosya).not.toContain(ESKI_ALAN)
    }
  })

  it('devir betiği eski kimliği YALNIZ kaynak taraf olarak tanıyor', () => {
    // m19b3 betiğinde eski alan adı geçiyor — ama arama değeri olarak.
    expect(hizalama).toContain(`const ESKI_ALAN = '${ESKI_ALAN}'`)
    expect(hizalama).toContain(`const YENI_ALAN = '${YENI_ALAN}'`)
    expect(hizalama).toContain(`const YENI_POSTA = '${YENI_POSTA}'`)
  })
})

// ═══════════════════════════════════════════ META KÜTÜĞÜ

describe('sayfa meta kütüğü konu hiyerarşisine oturmuş', () => {
  it('ana sayfa birincil konuyu ve markayı taşıyor', () => {
    expect(sayfaMeta).toContain("title: 'İstanbul Şehir İçi Evden Eve Nakliyat | Ege Kent Nakliyat',")
  })

  it('hizmet dizini ikincil konuyu taşıyor', () => {
    expect(sayfaMeta).toContain("title: 'İstanbul Şehir İçi Nakliyat Hizmetleri | {marka}',")
  })

  it('marka yer tutucusu elle yazılmamış', () => {
    // `{marka}` istek anında canlı marka adıyla doldruluyor; sabit yazılırsa
    // panelden ad değişince sayfa eski adda kalır.
    for (const anahtar of ['about', 'contact', 'fiyat-hesaplama']) {
      const i = sayfaMeta.indexOf(`anahtar: '${anahtar}'`)
      expect(i, anahtar).toBeGreaterThan(-1)
      const blok = sayfaMeta.slice(i, i + 900)
      expect(blok, anahtar).toContain('{marka}')
    }
  })

  it('başlıklar benzersiz', () => {
    const basliklar = [...sayfaMeta.matchAll(/^\s{4}title: '([^']+)',$/gm)].map((m) => m[1])
    expect(basliklar.length).toBeGreaterThanOrEqual(10)
    expect(new Set(basliklar).size).toBe(basliklar.length)
  })

  it('hiçbir başlık 60 karakteri aşmıyor (marka çözülmüş hâliyle)', () => {
    const basliklar = [...sayfaMeta.matchAll(/^\s{4}title: '([^']+)',$/gm)]
      .map((m) => m[1].replace('{marka}', MARKA))
    for (const b of basliklar) expect(b.length, b).toBeLessThanOrEqual(60)
  })

  it('açıklamalar 160 karakteri aşmıyor', () => {
    const bloklar = sayfaMeta.split("anahtar: '").slice(1)
    for (const b of bloklar) {
      const m = b.match(/description:\s*\n?\s*(['"])([\s\S]*?)\1,/)
      if (!m) continue
      const metin = m[2].replace(/\\'/g, "'").replace(/\{marka\}/g, MARKA)
      expect(metin.length, metin.slice(0, 40)).toBeLessThanOrEqual(160)
    }
  })
})

// ═══════════════════════════════════════════ ŞEHİR İÇİ HİZMET DEVRİ

describe('şehir içi nakliyat hizmeti devri', () => {
  it('devir betiği yeni slugu ve konumlandırmayı tanımlıyor', () => {
    expect(hizalama).toContain("slug: 'sehir-ici-nakliyat'")
    expect(hizalama).toContain("title: 'Şehir İçi Nakliyat'")
    expect(hizalama).toContain("metaTitle: 'İstanbul Şehir İçi Nakliyat | Ege Kent Nakliyat'")
  })

  it('yeni kayıt AÇILMIYOR — mevcut yuva yerinde dönüşüyor', () => {
    // `create` kullanılsaydı sekizinci bir hizmet doğar ve /hizmetlerimiz
    // yedi hizmet sözleşmesini kırardı.
    expect(hizalama).toContain("where: { slug: 'sehirler-arasi-nakliyat' }")
    expect(hizalama).toMatch(/p\.service\.update\(/)
    expect(hizalama).not.toMatch(/p\.service\.create\(/)
  })

  it('eski adres için YÖNLENDİRME kurulmuyor', () => {
    // Site hiç yayınlanmadı; korunacak SEO geçmişi yok. Yönlendirme, olmayan
    // bir geçmişi taşımak için gereksiz bir sıçrama olurdu.
    expect(config).not.toContain('sehirlerarasi-nakliyat')
    expect(config).not.toContain('sehirler-arasi-nakliyat')
  })

  it('devir betiği tekrar çalıştırılabilir', () => {
    // İkinci çalıştırmada hiçbir şey yapmamalı: yeni slug varsa çıkıyor.
    expect(hizalama).toContain("await p.service.findUnique({ where: { slug: YENI_HIZMET.slug } })")
    expect(hizalama).toContain("'devir zaten yapılmış'")
  })

  it('doğrulanmamış vaat yok', () => {
    const YASAK = [/ücretsiz keşif/i, /sabit fiyat/i, /%\s?100/, /7\s?[/x]\s?24/, /garanti ed/i, /sıfır hasar/i]
    for (const re of YASAK) expect(hizalama, String(re)).not.toMatch(re)
  })

  it('evden eve alt başlığı artık şehirler arası duyurmuyor', () => {
    expect(hizalama).toContain("'Şehir İçi & Şehirler Arası'")
    expect(hizalama).toContain("'İstanbul içinde planlı taşınma'")
  })
})

// ═══════════════════════════════════════════ KURULUŞ VARLIĞI

describe('yapısal veride tek kuruluş varlığı', () => {
  it('kimlik site kökünden türetiliyor', () => {
    expect(kurulus).toContain('#organization')
    expect(kurulus).toContain('export const kurulusKimligi')
    // Alan adı BURAYA yazılmıyor: site kökü değişince kimlik de değişsin.
    expect(kurulus).not.toContain(YENI_ALAN)
    expect(kurulus).not.toContain(ESKI_ALAN)
  })

  const SAHIPLER: [string, string[]][] = [
    ['ana sayfa', ['app', 'pages', 'index.vue']],
    ['hizmet/yazı', ['app', 'pages', '[...slug].vue']],
    ['hizmet dizini', ['app', 'pages', 'hizmetlerimiz.vue']],
    ['hakkımızda', ['app', 'pages', 'hakkimizda.vue']],
    ['iletişim', ['app', 'pages', 'iletisim.vue']],
  ]
  it.each(SAHIPLER)('%s — aynı kimliği kullanıyor', (_ad, yol) => {
    const s = oku(...yol)
    expect(s).toContain("from '#shared/utils/kurulus'")
    expect(s).toContain('kurulusKimligi(siteUrl.value)')
  })

  it('uydurma alan eklenmedi', () => {
    // Doğrulanmamış kurumsal alanlar yapısal veride metinden daha kalıcı olur.
    // YORUMLAR AYIKLANIYOR: iki dosya bu alanların NEDEN yok olduğunu
    // gerekçesiyle yazıyor; aranan şey o gerekçe değil, KOD.
    const kodu = (k: string) =>
      k.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ')
    for (const yol of [['app', 'pages', 'index.vue'], ['app', 'pages', 'hakkimizda.vue']]) {
      const s = kodu(oku(...yol))
      expect(s, yol.join('/')).not.toContain('aggregateRating')
      expect(s, yol.join('/')).not.toContain('foundingDate')
      expect(s, yol.join('/')).not.toContain('numberOfEmployees')
    }
  })
})

// ═══════════════════════════════════════════ YÖNETİM ROTASI DOKUNULMADI

describe('yönetim erişimi bu turdan etkilenmedi', () => {
  it('giriş rotası ve noindex kuralı yerinde', () => {
    expect(config).toContain('"/sehiriciyonetim": { robots: "noindex, nofollow" }')
    expect(oku('app', 'middleware', 'auth.global.ts')).toContain("const GIRIS_YOLU = '/sehiriciyonetim'")
  })

  it('yönetim kimliği herkese açık meta/şemaya sızmadı', () => {
    // Yönetici e-postası herkese açık iletişim adresinden BAĞIMSIZ ve
    // yalnız gitignore'lu `.env` ile veritabanında duruyor. Burada
    // yönetici alan adı YAZILMIYOR: yazsaydık bu dosya onu depoya
    // taşırdı. Onun yerine kural şu — bu iki dosyada geçen tek e-posta
    // adresi herkese açık olan olabilir.
    const EPOSTA = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi
    for (const yol of [['app', 'utils', 'sayfa-meta.ts'], ['prisma', 'm19b3-kimlik-ve-sehir-ici.mjs']]) {
      const s = oku(...yol)
      const yabanci = [...new Set(s.match(EPOSTA) || [])].filter(
        (e) => !e.endsWith(`@${YENI_ALAN}`) && !e.endsWith('@istanbulevenakliyat.com')
      )
      expect(yabanci, yol.join('/')).toEqual([])
      expect(s, yol.join('/')).not.toContain('SEED_ADMIN')
      expect(s, yol.join('/')).not.toContain('AUTH_SECRET')
    }
  })
})
