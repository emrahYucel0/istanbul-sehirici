// test/paylasim-gorseli.test.ts
//
// PAYLAŞIM GÖRSELİ SÖZLEŞMESİ — KAYNAK KODU TARAFI.
//
// Çalışma zamanı davranışı canlı taramayla ölçülüyor (76 sayfa). Bu dosya
// o ölçümün dayandığı YAPIYI çiviliyor: kaç emitter var, hepsi aynı
// çözümleyiciden mi geçiyor, ve SEO sahipliği bölünmüş mü.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const oku = (...p: string[]) => readFileSync(join(process.cwd(), ...p), 'utf8')
const kodu = (s: string) =>
  s
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^\s*\/\/.*$/gm, ' ')

const seoComposable = oku('app', 'composables', 'usePageSeo.ts')
const ayarComposable = oku('app', 'composables', 'useSiteSettings.ts')
const slugSayfasi = oku('app', 'pages', '[...slug].vue')
const anaSayfa = oku('app', 'pages', 'index.vue')

// ═══════════════════════════════════════════ TEK SAHİP

describe('SEO sahipliği bölünmedi', () => {
  it('useSeoMeta yalnız usePageSeo içinde çağrılıyor', () => {
    const cagiranlar = ['app/pages', 'app/components']
      .flatMap((d) => dosyalar(d))
      .filter((y) => /useSeoMeta\s*\(/.test(kodu(oku(y))))
    expect(cagiranlar).toEqual([])
  })

  it('meta etiketi basan tam İKİ yer var', () => {
    // 1) usePageSeo → 10 sabit sayfa
    // 2) [...slug].vue → yazı/bölge/hizmet/mahalle
    expect(kodu(seoComposable)).toContain('useSeoMeta(')
    expect((kodu(slugSayfasi).match(/property: 'og:image'/g) || []).length).toBe(2)
  })

  it('site kökünün tek sahibi useSiteSettings', () => {
    expect(kodu(ayarComposable)).toContain('const siteUrl = computed(')
    expect(kodu(seoComposable)).not.toContain('DEFAULT_SITE_URL')
    expect(kodu(slugSayfasi)).not.toContain('DEFAULT_SITE_URL')
  })
})

function dosyalar(dizin: string, toplanan: string[] = []): string[] {
  const { readdirSync, statSync } = require('node:fs') as typeof import('node:fs')
  for (const ad of readdirSync(join(process.cwd(), dizin))) {
    const yol = `${dizin}/${ad}`
    if (statSync(join(process.cwd(), yol)).isDirectory()) dosyalar(yol, toplanan)
    else if (ad.endsWith('.vue')) toplanan.push(yol)
  }
  return toplanan
}

// ═══════════════════════════════════════════ ÇÖZÜMLEYİCİ

describe('görsel her yolda çözümleyiciden geçiyor', () => {
  it('useSiteSettings çözümleyiciyi dışa veriyor', () => {
    expect(kodu(ayarComposable)).toContain('const mutlakGorsel = (yol: unknown) => mutlakUrl(yol, siteUrl.value)')
    expect(kodu(ayarComposable)).toContain('mutlakGorsel,')
  })

  it('site geneli ogImage mutlak', () => {
    expect(kodu(ayarComposable)).toContain('mutlakGorsel(data.value?.ogImage)')
    expect(kodu(ayarComposable)).toContain('mutlakGorsel(DEFAULT_OG_IMAGE)')
  })

  it('usePageSeo görselini çözümleyiciden geçiriyor', () => {
    expect(kodu(seoComposable)).toContain('mutlakGorsel(fallback.image) || siteOgImage.value')
  })

  it('usePageSeo og ve twitter görselini AYNI değerden basıyor', () => {
    expect(kodu(seoComposable)).toContain('ogImage: image')
    expect(kodu(seoComposable)).toContain('twitterImage: image')
  })

  it('[...slug] shareImage çözümleyiciden geçiyor', () => {
    expect(kodu(slugSayfasi)).toContain('mutlakGorsel(')
    expect(kodu(slugSayfasi)).toContain('|| siteOgImage.value')
  })

  it('MovingCompany şeması aynı değeri kullanıyor', () => {
    expect(kodu(anaSayfa)).toContain('image: paylasimGorseli.value || undefined')
    expect(kodu(anaSayfa)).toContain('mutlakUrl(settings.value?.logo, siteUrl.value)')
  })

  it('hiçbir yerde elle dize birleştirmesiyle mutlaklaştırma yok', () => {
    for (const [ad, kaynak] of [
      ['usePageSeo', seoComposable],
      ['[...slug].vue', slugSayfasi],
      ['index.vue', anaSayfa],
    ] as const) {
      expect(kodu(kaynak), ad).not.toMatch(/\$\{siteUrl\.value\}\$\{[^}]*[Ii]mage/)
    }
  })
})

// ═══════════════════════════════════════════ MAHALLE DALI

describe('mahalle dalı paylaşım etiketlerini basıyor', () => {
  const mahalleDali = (() => {
    const k = kodu(slugSayfasi)
    const bas = k.indexOf('if (mahalle.value) {')
    return k.slice(bas, k.indexOf('const data = content.value', bas))
  })()

  it.each([
    "property: 'og:image'",
    "property: 'og:title'",
    "property: 'og:url'",
    "name: 'twitter:card'",
    "name: 'twitter:image'",
  ])('%s var', (parca) => {
    expect(mahalleDali).toContain(parca)
  })

  it('görsel shareImage üzerinden geliyor', () => {
    expect(mahalleDali).toContain('content: shareImage.value')
  })

  it('robots davranışı DEĞİŞMEDİ', () => {
    expect(mahalleDali).toContain("mahalle.value.aktif ? 'index, follow' : 'noindex, follow'")
  })

  it('canonical hâlâ kendi adresi', () => {
    expect(mahalleDali).toContain("link: [{ rel: 'canonical', href: canonical.value }]")
  })

  it('shareImage mahalle görselini de deniyor', () => {
    expect(kodu(slugSayfasi)).toContain('mahalle.value?.imagePath')
  })
})
