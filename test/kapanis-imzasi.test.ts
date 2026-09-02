// test/kapanis-imzasi.test.ts
//
// ORTAK KAPANIŞ İMZASI — SÖZLEŞME.
//
// ─────────────────────────────────────────────────────────────────────────
// NE OLDU
//
// Ana sayfanın alt bilgi üstündeki koyu kapanış bloğu (`base/Kapanis.vue`)
// sitenin ORTAK kapanışı hâline getirildi. Aynı blok artık hizmet
// detaylarında, blog yazılarında, blog dizininde, bölge ailesinde,
// hakkımızda ve fiyat sayfasında da basılıyor.
//
// Bu dosya iki şeyi koruyor:
//
//   1. TEK BLOK. İkinci bir kapanış CTA'sı doğmasın. Blok eklenen her
//      sayfada, o sayfanın ESKİ iletişim kapanışı kaldırılmış olmalı —
//      yoksa sayfa sonunda aynı çağrı iki kez çıkar.
//   2. KAPSAM. `/iletisim`, hukuki metinler ve 404 bilerek DIŞARIDA;
//      biri sessizce içeri girerse test kırılır.
//
// Test kaynak DOSYALARI okuyor. Tarayıcı ölçümleri raporda.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const oku = (...p: string[]) => readFileSync(join(process.cwd(), ...p), 'utf8')
/** Yorumları atar: iddialar KOD için, gerekçe metni için değil. */
const kodu = (k: string) =>
  k.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ')

const kapanis = oku('app', 'components', 'base', 'Kapanis.vue')
const kutuk = oku('app', 'utils', 'kapanis.ts')

// ═══════════════════════════════════════════ BİLEŞEN SÖZLEŞMESİ

describe('ortak kapanış bileşeni', () => {
  it('başlık PROP — metin bileşene gömülü değil', () => {
    expect(kodu(kapanis)).toContain('baslik:')
    expect(kodu(kapanis)).toContain('{{ baslik }}')
  })

  it('kendi isteğini atmıyor — yalnız telefon Site Ayarları\'ndan', () => {
    expect(kodu(kapanis)).not.toContain('useFetch(')
    expect(kodu(kapanis)).toContain('useSiteSettings()')
  })

  it('YENİ H1 ÜRETMİYOR — sayfanın başlık hiyerarşisi bozulmuyor', () => {
    expect(kodu(kapanis)).not.toContain('<h1')
    expect(kodu(kapanis)).toContain('<h2')
  })

  it('JS gerektirmiyor — hareket, gözlemci, kaydırma yok', () => {
    const k = kodu(kapanis)
    expect(k).not.toContain('IntersectionObserver')
    expect(k).not.toContain('gsap')
    expect(k).not.toContain('useReveal')
    expect(k).not.toContain('data-reveal')
    expect(k).not.toContain('@scroll')
  })

  it('kart/gölge/yuvarlak köşe dili girmiyor', () => {
    const k = kodu(kapanis)
    expect(k).not.toMatch(/border-radius:\s*(?!0)/)
    expect(k).not.toContain('box-shadow')
    expect(k).not.toContain('backdrop-filter')
  })

  it('telefon E.164 — kütükteki tek çeviriciden', () => {
    expect(kodu(kapanis)).toContain('telefonYolu(')
    expect(kutuk).toContain("tel:+90")
  })

  it('üç varyant tek kütükte', () => {
    for (const anahtar of ['ana:', 'yazi:', 'fiyat:']) expect(kutuk).toContain(anahtar)
  })

  it('düğme etiketinin yedeği TEK kaynakta', () => {
    // Ana sayfa etiketi panelden (`HomeSection('kapanis').ctaLabel`)
    // geliyor; sayfa yalnız null'ı boş dizeye çeviriyor, kendi yedek
    // METNİNİ yazmıyor. Yedek yalnız burada.
    expect(kutuk).toContain('KAPANIS_EYLEMI')
    expect(kodu(kapanis)).toContain('|| KAPANIS_EYLEMI')
    expect(kodu(oku('app', 'pages', 'index.vue'))).not.toMatch(/ctaLabel\s*\|\|/)
  })
})

// ═══════════════════════════════════════════ KAPSAM

const EKLENEN: Array<[string, string[]]> = [
  ['ana sayfa', ['app', 'pages', 'index.vue']],
  ['blog dizini', ['app', 'pages', 'blog.vue']],
  ['bölgelerimiz', ['app', 'pages', 'bolgelerimiz.vue']],
  ['hakkımızda', ['app', 'pages', 'hakkimizda.vue']],
  ['fiyat hesaplama', ['app', 'pages', 'fiyat-hesaplama.vue']],
  ['hizmet dizini', ['app', 'pages', 'hizmetlerimiz.vue']],
  // Hizmet detayı · blog yazısı · ilçe · mahalle — dördü de burada.
  ['yakalayıcı rota', ['app', 'pages', '[...slug].vue']],
]

const DISARIDA: Array<[string, string[]]> = [
  ['iletişim — sayfanın kendisi zaten iletişim', ['app', 'pages', 'iletisim.vue']],
  ['gizlilik politikası', ['app', 'pages', 'gizlilik-politikasi.vue']],
  ['çerez politikası', ['app', 'pages', 'cerez-politikasi.vue']],
  ['kullanım şartları', ['app', 'pages', 'kullanim-sartlari.vue']],
  ['hukuki metin şablonu', ['app', 'components', 'policy', 'View.vue']],
  ['404 — kendi yönlendirmesi', ['app', 'error.vue']],
]

describe('kapanış hangi sayfalarda', () => {
  it.each(EKLENEN)('%s: var', (_ad, parcalar) => {
    expect(kodu(oku(...parcalar))).toContain('lazy-base-kapanis')
  })

  it.each(DISARIDA)('%s: YOK', (_ad, parcalar) => {
    expect(kodu(oku(...parcalar))).not.toContain('base-kapanis')
  })
})

// ═══════════════════════════════════════════ TEK KAPANIŞ

describe('sayfa sonunda TEK iletişim kapanışı', () => {
  // Blok eklenen ailelerin eski kapanış paragraflarındaki `/iletisim`
  // çağrısı kaldırıldı. Kalan bağlantılar (fiyat aracı, hizmet dizini,
  // blog dizini, komşu sayfalar) BAŞKA hedefler — tekrar değil.
  it.each([
    ['blog yazısı', ['app', 'components', 'article', 'BlogPostView.vue']],
    ['hizmet detayı', ['app', 'components', 'article', 'ServiceView.vue']],
    ['İstanbul ilçesi', ['app', 'components', 'article', 'IstanbulDistrictView.vue']],
    ['hakkımızda odak', ['app', 'components', 'about', 'Odak.vue']],
    ['fiyat sonraki adım', ['app', 'components', 'price', 'SonrakiAdim.vue']],
    ['hizmet dizini birlikte', ['app', 'components', 'service', 'Birlikte.vue']],
  ])('%s: ikinci iletişim çağrısı kalmadı', (_ad, parcalar) => {
    expect(kodu(oku(...parcalar))).not.toContain('to="/iletisim"')
  })

  it('hizmet detayı ikinci bir telefon yüzeyi taşımıyor', () => {
    // Numara sayfa sonunda ortak blokta; cümle içinde ikinci kez değil.
    const k = kodu(oku('app', 'components', 'article', 'ServiceView.vue'))
    expect(k).not.toContain('tel:')
    expect(k).not.toContain('useSiteSettings()')
  })

  it('eski FinalCta ile ortak kapanış aynı anda çıkamaz', () => {
    // İkisinin koşulu tam ters: biri dört ailenin YOKLUĞUNU, öteki en az
    // birinin VARLIĞINI arıyor.
    const slug = kodu(oku('app', 'pages', '[...slug].vue'))
    expect(slug).toContain('v-if="!post && !service && !istanbulIlcesi && !mahalle"')
    expect(slug).toContain('v-if="kapanisVar"')
    expect(slug).toContain(
      'Boolean(post.value || service.value || istanbulIlcesi.value || mahalle.value)'
    )
  })
})
