// test/bolge-gorunurlugu.test.ts
//
// COĞRAFİ SAYFA AĞI — GÖRÜNÜRLÜK BAYRAĞI SÖZLEŞMESİ.
//
// ─────────────────────────────────────────────────────────────────────────
// NE OLDU
//
// Yarışma sürümünde `/bolgelerimiz`, 39 İstanbul ilçesi ve 473 mahalle
// rotası ziyaretçiye kapatıldı. Kapatma bir İÇERİK kararı değil: hiçbir
// kayıt silinmedi, pasifleşmedi, `isActive` değişmedi. Kapanan tek şey
// public görünürlük — rota, sitemap ve dahili bağlantılar.
//
// ─────────────────────────────────────────────────────────────────────────
// BU DOSYA NEYİ KORUYOR
//
//   1. TEK BAYRAK, TEK OKUYUCU. Bayrak `nuxt.config.ts` içinde tanımlı ve
//      uygulama tarafında YALNIZ `useRegionPages()` üzerinden okunuyor.
//      İkinci bir okuma noktası doğarsa bir yer açık bir yer kapalı
//      kalabilir.
//   2. SİTEMAP İLE ROTA AYNI ANAHTARA BAĞLI. Sitemap 404 veren bir adresi
//      bildirmemeli; ikisi ayrı değerden beslenirse tam olarak bu olur.
//   3. KAPATMA İÇERİK DEĞİL. Bayrak hiçbir yerde `isActive` ya da bir DB
//      yazımıyla birlikte kullanılmıyor.
//   4. GERİ AÇMA TEK HAMLE. Bayrak bir ortam değişkeninden türetiliyor;
//      kod değiştirmeden açılabiliyor.
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const kok = process.cwd()
const oku = (...p: string[]) => readFileSync(join(kok, ...p), 'utf8')
/** Yorumları atar: iddialar KOD için, gerekçe metni için değil. */
const kodu = (k: string) =>
  k.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ')

const config = oku('nuxt.config.ts')
const composable = oku('app', 'composables', 'useRegionPages.ts')
const sitemap = oku('server', 'api', '__sitemap__', 'urls.ts')

// ═══════════════════════════════════════════ BAYRAK

describe('bayrak tek yerde tanımlı', () => {
  it('runtimeConfig.public içinde', () => {
    expect(kodu(config)).toContain('publicRegionPages')
    expect(kodu(config)).toContain('public: {')
  })

  it('ortam değişkeninden türetiliyor — kod değiştirmeden açılabiliyor', () => {
    expect(kodu(config)).toContain('NUXT_PUBLIC_PUBLIC_REGION_PAGES')
  })

  it('yarışma sürümünde KAPALI', () => {
    // Değer env yokken `false` olmalı: karşılaştırma `=== "true"`.
    expect(kodu(config)).toMatch(/NUXT_PUBLIC_PUBLIC_REGION_PAGES\s*===\s*["']true["']/)
  })

  it('sitemap dışlaması AYNI değeri okuyor', () => {
    // İki ayrı sabit olsaydı biri açık biri kapalı kalabilir ve sitemap
    // 404 veren bir adres bildirebilirdi.
    //
    // Burada HAM kaynağa bakılıyor, `kodu()` süzgecine değil: nuxt.config
    // yorum yoğun bir dosya ve blok yorum ayıklaması bu satırı da
    // yutuyor. Aranan şey zaten yapısal — iki alanın aynı sabiti okuması.
    const i = config.indexOf('exclude:')
    expect(i).toBeGreaterThan(-1)
    expect(config.slice(i, i + 200)).toContain('BOLGE_AGI_ACIK')
    expect(config).toContain('publicRegionPages: BOLGE_AGI_ACIK')
  })
})

// ═══════════════════════════════════════════ TEK OKUMA NOKTASI

describe('uygulama tarafında tek okuyucu', () => {
  const dosyalar: string[] = []
  const gez = (dizin: string) => {
    for (const ad of readdirSync(dizin)) {
      const yol = join(dizin, ad)
      if (statSync(yol).isDirectory()) gez(yol)
      else if (/\.(vue|ts)$/.test(ad)) dosyalar.push(yol)
    }
  }
  gez(join(kok, 'app'))

  it('composable dışında hiçbir dosya bayrağı doğrudan okumuyor', () => {
    const kacaklar = dosyalar
      .filter((y) => !y.endsWith('useRegionPages.ts'))
      .filter((y) => kodu(readFileSync(y, 'utf8')).includes('publicRegionPages'))
      .map((y) => y.slice(kok.length + 1).replace(/\\/g, '/'))
    expect(kacaklar).toEqual([])
  })

  it('composable runtimeConfig okuyor ve boolean döndürüyor', () => {
    const k = kodu(composable)
    expect(k).toContain('useRuntimeConfig().public.publicRegionPages')
    expect(k).toContain('Boolean(')
  })
})

// ═══════════════════════════════════════════ KAPSAM

describe('bayrağa bağlanan yüzeyler', () => {
  it.each([
    ['bölgeler hub sayfası', ['app', 'pages', 'bolgelerimiz.vue']],
    ['ilçe ve mahalle yakalayıcısı', ['app', 'pages', '[...slug].vue']],
    ['navbar', ['app', 'components', 'fixed', 'Navbar.vue']],
    ['alt bilgi', ['app', 'components', 'fixed', 'Footer.vue']],
    ['iletişim — diğer yollar', ['app', 'components', 'contact', 'Yollar.vue']],
    ['hakkımızda odağı', ['app', 'components', 'about', 'Odak.vue']],
    ['ana sayfa kapsam bölümü', ['app', 'components', 'base', 'Kapsam.vue']],
    ['ana sayfa üç İstanbul bölümü', ['app', 'components', 'base', 'UcIstanbul.vue']],
    ['hizmet detayı', ['app', 'components', 'article', 'ServiceView.vue']],
  ])('%s bayrağı okuyor', (_ad, parcalar) => {
    expect(kodu(oku(...parcalar))).toContain('useRegionPages()')
  })

  it('iki rota ailesi 404 sözleşmesi kullanıyor — 301 ya da noindex DEĞİL', () => {
    for (const yol of [
      ['app', 'pages', 'bolgelerimiz.vue'],
      ['app', 'pages', '[...slug].vue'],
    ] as string[][]) {
      const k = kodu(oku(...yol))
      expect(k).toContain('statusCode: 404')
      // Ana sayfaya yığma ya da gizli 200 bırakma yok.
      expect(k).not.toMatch(/navigateTo\(\s*['"]\/['"]/)
      expect(k).not.toMatch(/robots:\s*['"]noindex/)
    }
  })

  it('sitemap bölge ve mahalle getiricilerini bayrağa bağlıyor', () => {
    const k = kodu(sitemap)
    expect(k).toContain('publicRegionPages')
    expect(k).toContain('bolgeAgiAcik ? fetchRegionUrls() : Promise.resolve([])')
    expect(k).toContain('bolgeAgiAcik ? fetchNeighborhoodUrls() : Promise.resolve([])')
  })
})

// ═══════════════════════════════════════════ İÇERİK DOKUNULMADI

describe('görünürlük bayrağı bir İÇERİK durumu değil', () => {
  it('bayrak hiçbir yerde isActive ile birlikte kullanılmıyor', () => {
    // Kapatma kaydı pasifleştirmiyor: `isActive` bir yayın kararı,
    // bayrak ise yalnız public görünürlük.
    for (const yol of [
      ['app', 'composables', 'useRegionPages.ts'],
      ['app', 'pages', 'bolgelerimiz.vue'],
      ['app', 'pages', '[...slug].vue'],
    ] as string[][]) {
      const k = kodu(oku(...yol))
      if (!k.includes('useRegionPages')) continue
      const satirlar = k.split('\n').filter((s) => s.includes('useRegionPages'))
      for (const s of satirlar) expect(s).not.toContain('isActive')
    }
  })

  it('Region ve Neighborhood modelleri şemada duruyor', () => {
    const sema = oku('prisma', 'schema.prisma')
    expect(sema).toContain('model Region {')
    expect(sema).toContain('model Neighborhood {')
  })

  it('panel yüzeyleri kaldırılmadı', () => {
    for (const p of [
      ['app', 'components', 'admin', 'base', 'RegionPanel.vue'],
      ['app', 'components', 'admin', 'base', 'NeighborhoodPanel.vue'],
    ] as string[][]) {
      expect(() => oku(...p)).not.toThrow()
    }
  })
})
