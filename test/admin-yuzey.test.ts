// test/admin-yuzey.test.ts
//
// YÖNETİM YÜZEYİ — ÖLÜ EKRAN GERİ GELMESİN.
//
// ─────────────────────────────────────────────────────────────────────────
// NEYİ KORUYOR
//
// M6'da yedi yönetim ekranı kaldırıldı. Hepsinin ortak özelliği aynıydı:
// yönetici düzenliyor, kaydediyor, veri tabanına yazılıyor ve sitede
// hiçbir şey değişmiyordu. Bu testler üç şeyi koruyor:
//
//   1. Kaldırılan ekranların dosyaları geri gelmesin.
//   2. Menüdeki her bağlantının karşılığında GERÇEK bir sayfa olsun
//      (kırık yönetim bağlantısı = 0).
//   3. Her yönetim sayfasının karşılığında bir panel olsun (boş ekran yok).
//
// Testler DOSYA SİSTEMİNİ okuyor: "şu dosya duruyor" iddiası değil,
// ölçüm.
import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const kok = process.cwd()
const yolu = (...p: string[]) => join(kok, ...p)
const oku = (...p: string[]) => readFileSync(yolu(...p), 'utf8')

const SIDEBAR = oku('app', 'components', 'admin', 'fixed', 'Sidebar.vue')
const ROTA_DIZINI = yolu('app', 'pages', 'evdeneveyonetim')

/** Menüdeki bağlantılar — yorum satırlarındaki adresler sayılmıyor. */
const menuYollari = () => {
  const kod = SIDEBAR.replace(/<!--[\s\S]*?-->/g, '')
  return [...kod.matchAll(/to="\/evdeneveyonetim\/([a-z-]+)"/g)].map((m) => m[1])
}

// ═══════════════════════════════════════════ KALDIRILANLAR

/** [ekran adı, rota, panel, uç nokta] */
const KALDIRILAN = [
  ['Hero / Anasayfa', 'hero', 'HeroPanel', 'hero'],
  ['Güven Bandı', 'trust-bar', 'TrustBarPanel', 'trust-bar'],
  ['Neden Biz', 'choose', 'ChoosePanel', 'why-choose-us'],
  ['We Help', 'help', 'HelpPanel', 'we-help-section'],
  ['Fiyatlar', 'price', 'PricePanel', 'pricing-section'],
  ['Yorumlar bölümü', 'testimonial', 'TestimonialPanel', 'testimonials-section'],
  ['İletişim Form', 'quote', 'QuotePanel', 'quote'],
  ['Footer', 'footer', 'FooterPanel', 'footer'],
] as const

describe('kaldırılan yönetim ekranları geri gelmedi', () => {
  it.each(KALDIRILAN)('%s — rotası yok', (_ad, rota) => {
    expect(existsSync(yolu('app', 'pages', 'evdeneveyonetim', `${rota}.vue`))).toBe(false)
  })

  it.each(KALDIRILAN)('%s — paneli yok', (_ad, _rota, panel) => {
    expect(existsSync(yolu('app', 'components', 'admin', 'base', `${panel}.vue`))).toBe(false)
  })

  it.each(KALDIRILAN)('%s — yazma ucu yok', (_ad, _rota, _panel, uc) => {
    expect(existsSync(yolu('server', 'api', `${uc}.ts`))).toBe(false)
  })

  it.each(KALDIRILAN)('%s — menüde bağlantısı yok', (_ad, rota) => {
    expect(menuYollari()).not.toContain(rota)
  })
})

// ═══════════════════════════════════════════ MENÜ BÜTÜNLÜĞÜ

describe('menüdeki her bağlantının karşılığı var', () => {
  it('kırık yönetim bağlantısı = 0', () => {
    const kirik = menuYollari().filter(
      (r) => !existsSync(yolu('app', 'pages', 'evdeneveyonetim', `${r}.vue`))
    )
    expect(kirik).toEqual([])
  })

  it('menüde tekrar eden bağlantı yok', () => {
    const yollar = menuYollari()
    expect(yollar.length).toBe(new Set(yollar).size)
  })

  it('menü 18 ekran gösteriyor (M6 öncesi 24, M6 sonu 16)', () => {
    // Sayı bilerek sabit: menüye sessizce yeni bir ölü ekran eklenirse
    // burası kırılsın ve gerekçesi yazılsın.
    //
    // M7'de İKİ ekran eklendi ve ikisi de canlı: "İç Sayfalar" (iç
    // sayfaların editoryal içeriği) ve "Medya Kütüphanesi" (yönetici
    // yüklemelerinin envanteri).
    expect(menuYollari()).toHaveLength(18)
  })
})

describe('her yönetim sayfasının bir paneli var', () => {
  const sayfalar = readdirSync(ROTA_DIZINI).filter((f) => f.endsWith('.vue'))

  it('boş yönetim sayfası yok', () => {
    // `index.vue` giriş ekranı, `dashboard.vue` kendi bileşenini kullanıyor.
    const bosSayfalar = sayfalar.filter((f) => {
      if (f === 'index.vue') return false
      const icerik = readFileSync(join(ROTA_DIZINI, f), 'utf8')
      return !/<admin-[a-z-]+/.test(icerik)
    })
    expect(bosSayfalar).toEqual([])
  })

  it('menüsüz kalan yönetim sayfası yok — index ve dashboard hariç', () => {
    const menude = new Set(menuYollari())
    const yetim = sayfalar
      .map((f) => f.replace(/\.vue$/, ''))
      .filter((r) => r !== 'index' && !menude.has(r))
    expect(yetim).toEqual([])
  })
})

// ═══════════════════════════════════════════ ÖLÜ BİLEŞENLER

describe('ölü herkese açık bileşenler silindi', () => {
  it.each([
    'Choose.vue', 'Faq.vue', 'Help.vue', 'Kanit.vue', 'Logo.vue', 'Nefes.vue',
    'PostCarousel.vue', 'Pricing.vue', 'Process.vue', 'RegionFinder.vue',
    'SocialIcon.vue', 'Testimonial.vue', 'TrustBar.vue', 'Vaat.vue', 'EmptyState.vue',
  ])('base/%s yok', (dosya) => {
    expect(existsSync(yolu('app', 'components', 'base', dosya))).toBe(false)
  })

  it.each(['Heading.vue', 'ScrollProgress.vue', 'StatValue.vue'])('ui/%s yok', (dosya) => {
    // Üçü de yalnız yukarıdaki ölü bileşenlerden çağrılıyordu.
    expect(existsSync(yolu('app', 'components', 'ui', dosya))).toBe(false)
  })

  it('silinen bileşenlere kalan referans yok', () => {
    const hedefler = [
      'BaseChoose', 'base-choose', 'BaseFaq', 'base-faq', 'BaseHelp', 'base-help',
      'BasePricing', 'base-pricing', 'BaseProcess', 'base-process',
      'BaseRegionFinder', 'base-region-finder', 'BaseTestimonial', 'base-testimonial',
      'BaseTrustBar', 'base-trust-bar', 'UiHeading', 'ui-heading',
      'UiStatValue', 'ui-stat-value', 'BaseEmptyState', 'base-empty-state',
    ]
    const dosyalar: string[] = []
    const gez = (d: string) => {
      for (const ad of readdirSync(d, { withFileTypes: true })) {
        if (ad.isDirectory()) gez(join(d, ad.name))
        else if (/\.(vue|ts)$/.test(ad.name)) dosyalar.push(join(d, ad.name))
      }
    }
    gez(yolu('app'))

    const kalan: string[] = []
    for (const f of dosyalar) {
      const kod = readFileSync(f, 'utf8')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
      for (const h of hedefler) {
        if (new RegExp('<\\s*' + h.replace(/-/g, '\\-') + '(\\s|/|>)').test(kod)) {
          kalan.push(`${f} → ${h}`)
        }
      }
    }
    expect(kalan).toEqual([])
  })
})

// ═══════════════════════════════════════════ ANALİTİK

describe('analitik ayarı "doldur ama hiçbir şey olmuyor" değil', () => {
  const panel = oku('app', 'components', 'admin', 'base', 'SiteSettingsPanel.vue')
  const sema = oku('server', 'api', 'siteSettings.ts')

  it.each(['googleAnalyticsId', 'googleTagManagerId', 'googleAdsenseId'])(
    '%s panelde düzenlenemiyor',
    (alan) => {
      const kod = panel.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
      expect(kod).not.toContain(alan)
    }
  )

  it.each(['googleAnalyticsId', 'googleTagManagerId', 'googleAdsenseId'])(
    '%s yazma şemasında da yok',
    (alan) => {
      const kod = sema.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
      expect(kod).not.toContain(alan)
    }
  )

  it('sitede üçüncü taraf analitik betiği yüklenmiyor', () => {
    const dosyalar: string[] = []
    const gez = (d: string) => {
      for (const ad of readdirSync(d, { withFileTypes: true })) {
        if (ad.isDirectory()) gez(join(d, ad.name))
        else if (/\.(vue|ts)$/.test(ad.name)) dosyalar.push(join(d, ad.name))
      }
    }
    gez(yolu('app'))

    const yukleyen = dosyalar.filter((f) => {
      const kod = readFileSync(f, 'utf8')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
      return /gtag\(|dataLayer|googletagmanager\.com|googlesyndication/.test(kod)
    })
    // Rıza altyapısı yokken üçüncü taraf betik yüklemek bu turun işi değil.
    expect(yukleyen).toEqual([])
  })

  it('CSP de o hostlara izin vermiyor', () => {
    const csp = oku('server', 'middleware', 'security.ts')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
    expect(csp).not.toContain('googletagmanager.com')
    expect(csp).not.toContain('google-analytics.com')
    expect(csp).not.toContain('googlesyndication')
  })

  it('site içi ölçüm (SiteEvent) BOZULMADI', () => {
    expect(existsSync(yolu('app', 'plugins', 'donusum-takibi.client.ts'))).toBe(true)
    expect(existsSync(yolu('server', 'api', 'events.post.ts'))).toBe(true)
  })
})

// ═══════════════════════════════════════════ SEO TEK SAHİP

describe('sayfa SEO\'sunun tek sahibi var', () => {
  it('Hakkımızda panelinde ikinci bir SEO yüzeyi yok', () => {
    const panel = oku('app', 'components', 'admin', 'base', 'AboutPanel.vue')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
    expect(panel).not.toContain('seoTitle')
    expect(panel).not.toContain('seoDescription')
  })

  it('yazma şeması da kabul etmiyor', () => {
    const sema = oku('server', 'api', 'about-section.ts')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
    expect(sema).not.toContain('seoTitle')
    expect(sema).not.toContain('seoDescription')
  })

  it('Hakkımızda sayfası SEO\'yu Meta kaydından alıyor', () => {
    expect(oku('app', 'pages', 'hakkimizda.vue')).toContain("usePageSeo('about'")
  })
})

// ═══════════════════════════════════════════ TEK İLETİŞİM KAYNAĞI

describe('iletişim bilgisinin tek sahibi Site Ayarları', () => {
  const footer = oku('app', 'components', 'fixed', 'Footer.vue')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

  it('Footer artık ikinci bir kaynaktan okumuyor', () => {
    expect(footer).not.toContain('/api/footer')
    expect(footer).not.toContain('footer.value')
  })

  it('adres, e-posta ve telefon Site Ayarları\'ndan geliyor', () => {
    expect(footer).toContain('settings.value?.address')
    expect(footer).toContain('settings.value?.email')
    expect(footer).toContain('settings.value?.phone')
  })

  it('üst menü de aynı kaynağı kullanıyor', () => {
    const navbar = oku('app', 'components', 'fixed', 'Navbar.vue')
    expect(navbar).toContain('settings.value?.phone')
  })
})
