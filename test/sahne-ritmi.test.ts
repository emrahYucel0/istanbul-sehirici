// test/sahne-ritmi.test.ts
//
// ANA SAYFANIN DİKEY RİTMİ VE KOYU YÜZEY SÖZLEŞMESİ.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN TEST EDİLİYOR
//
// Buradaki iki kural da SESSİZ bozulur:
//
// 1. Dikey ritim. Bölümler kendi `clamp()`ini yazmaya başladığı anda
//    kademeler ayrışır ve perde sınırı ile blok sınırı yeniden birbirine
//    eşitlenir — yani ekranda hiçbir hata görünmez, yalnız ritim ölür.
//    Bu tam olarak düzeltilen durumdu: altı bölüm de aynı `clamp`i hem
//    üstte hem altta kullanıyordu, her dikiş 187px'ti.
//
// 2. Hero metin rayının aritmetiği. Yuva oranı (`grid-auto-rays`) ile
//    keyframe'lerdeki `translateY` değerleri BİRBİRİNE BAĞLI:
//      başlangıç = -(oran - 100) / 2      adım = -oran
//    Biri elle değiştirilip diğeri unutulursa duraklar yuvalarının
//    ortasından kayar; hata ancak sahne yarısına kaydırılınca görünür.
//
// Dosya kaynağı okuyor, tarayıcı çalıştırmıyor: aranan şey SÖZLEŞME.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const oku = (...p: string[]) => readFileSync(join(process.cwd(), ...p), 'utf8')
const sahne = oku('app', 'assets', 'css', 'sahne.css')
const bilesen = (ad: string) => oku('app', 'components', 'base', `${ad}.vue`)

/** Yorumları atar: aşağıdaki iddialar KOD için, açıklama metni için değil. */
const kodu = (kaynak: string) => kaynak.replace(/\/\*[\s\S]*?\*\//g, ' ')

// ═══════════════════════════════════════════ KADEMELER

describe('dikey ritim kademeleri', () => {
  it.each([
    '--sahne-dikey-dar',
    '--sahne-dikey',
    '--sahne-perde',
    '--sahne-dikey-genis',
  ])('%s tanımlı', (ad) => {
    expect(kodu(sahne)).toMatch(new RegExp(`${ad}:\\s*clamp\\(`))
  })

  it('perde kademesi dikey ile geniş ARASINDA', () => {
    const deger = (ad: string) => {
      const m = kodu(sahne).match(new RegExp(`${ad}:\\s*clamp\\(([^)]*)\\)`))
      if (!m) throw new Error(`${ad} bulunamadı`)
      // Üst sınırı (üçüncü argüman) rem cinsinden karşılaştırıyoruz.
      const parcalar = m[1].split(',').map((s) => s.trim())
      return Number.parseFloat(parcalar[parcalar.length - 1])
    }
    expect(deger('--sahne-dikey-dar')).toBeLessThan(deger('--sahne-dikey'))
    expect(deger('--sahne-dikey')).toBeLessThan(deger('--sahne-perde'))
    expect(deger('--sahne-perde')).toBeLessThan(deger('--sahne-dikey-genis'))
  })
})

// ═══════════════════════════════════════════ BÖLÜM PAYLARI

describe('durağan bölümler payını kütükten alıyor', () => {
  // [bileşen, dikey payı taşıyan seçici]
  const BOLUMLER: Array<[string, string]> = [
    ['Kapsam', '.kp-alan'],
    ['Hizmetler', '.lg-alan'],
    ['Fiyat', '.fy'],
    ['Sorular', '.ss-alan'],
    ['Yorumlar', '.yr-alan'],
    ['Kapanis', '.cl-alan'],
  ]

  /** İlgili kuralın gövdesini çıkarır (yorumlar atılmış kaynaktan). */
  const kural = (kaynak: string, secici: string) => {
    const k = kodu(kaynak)
    // Bileşik seçicilerde değil, tam kuralın kendisinde arıyoruz.
    const i = k.search(new RegExp(`(^|[\\s,}])${secici.replace('.', '\\.')}\\s*\\{`, 'm'))
    expect(i, `${secici} kuralı bulunamadı`).toBeGreaterThan(-1)
    return k.slice(i, k.indexOf('}', i))
  }

  it.each(BOLUMLER)('%s — dikey pay elle clamp() yazmıyor', (ad, secici) => {
    const govde = kural(bilesen(ad), secici)
    const pay = govde.match(/padding(-block)?:[^;]*/)?.[0] ?? ''
    expect(pay, `${ad}: padding bulunamadı`).not.toBe('')
    // Yatay pay `--sahne-pad` kütüğünden; dikey pay da kütükten gelmeli.
    expect(pay, `${ad}: dikey payda elle clamp() var`).not.toMatch(/clamp\(/)
    expect(pay).toMatch(/--sahne-(dikey|perde)/)
  })

  it('perde KAPANIŞ bloklarında geniş pay var — 01→02 ve 03→04 dikişleri', () => {
    for (const [ad, secici] of [
      ['Kapsam', '.kp-alan'],
      ['Hizmetler', '.lg-alan'],
    ] as Array<[string, string]>) {
      const govde = kural(bilesen(ad), secici)
      expect(govde, `${ad} perde dikişini taşımıyor`).toContain('var(--sahne-perde)')
      expect(govde, `${ad} üst dikişi dar değil`).toContain('var(--sahne-dikey-dar)')
    }
  })

  it('Kapanış iç payı KÜÇÜLTÜLDÜ — eski geniş kademe geri gelmedi', () => {
    const govde = kural(bilesen('Kapanis'), '.cl-alan')
    expect(govde).toContain('var(--sahne-perde)')
    expect(govde).not.toContain('--sahne-dikey-genis')
  })
})

// ═══════════════════════════════════════════ HERO RAY ARİTMETİĞİ

describe('Hero metin rayı: yuva oranı ile keyframe değerleri tutuyor', () => {
  const hero = kodu(bilesen('Hero'))

  const oran = Number.parseFloat(hero.match(/grid-auto-rows:\s*(\d+)%/)?.[1] ?? '0')
  const adimlar = [
    ...hero
      .slice(hero.indexOf('@keyframes hr-ray-kay'))
      .slice(0, 260)
      .matchAll(/translateY\((-?\d+)%\)/g),
  ].map((m) => Number.parseInt(m[1], 10))

  it('yuva oranı ve üç durak okundu', () => {
    expect(oran).toBeGreaterThan(100)
    expect(adimlar).toHaveLength(3)
  })

  it('başlangıç, yuvanın taşan payının yarısı', () => {
    expect(adimlar[0]).toBe(-(oran - 100) / 2)
  })

  it('her adım tam bir yuva', () => {
    expect(adimlar[1] - adimlar[0]).toBe(-oran)
    expect(adimlar[2] - adimlar[1]).toBe(-oran)
  })

  it('alan yüksekliği ekrandan DEĞİL kütükten ölçülüyor', () => {
    // `minmax(0, 1fr)` geri gelirse kolon yine pencereyi doldurur ve
    // ölçülen 230–278px'lik boşluk geri gelir.
    expect(hero).toContain('--hr-alan:')
    expect(hero).toContain('minmax(0, var(--hr-alan))')
  })

  it('md.5 payı korunuyor — yuva, en uzun içerik + pencereyi taşıyor', () => {
    // En uzun durak ölçüldü: 1920'de 375px, pencere en dar hâlinde 422px.
    // Kural: oran/100 × pencere − içerik ≥ pencere
    const pencere = 422
    const icerik = 375
    expect((oran / 100) * pencere - icerik).toBeGreaterThanOrEqual(pencere)
  })
})

// ═══════════════════════════════════════════ KOYU YÜZEY

describe('koyu yüzey sözleşmesi', () => {
  const kapanis = bilesen('Kapanis')
  const navbar = oku('app', 'components', 'fixed', 'Navbar.vue')

  it('Kapanış kendini koyu yüzey olarak işaretliyor', () => {
    expect(kapanis).toContain('data-yuzey="koyu"')
  })

  it('Navbar sınıf listesi değil NİTELİK izliyor', () => {
    expect(navbar).toContain('[data-yuzey="koyu"]')
    // Bileşen adı sabitlenirse yeni koyu bölümler sessizce dışarıda kalır.
    expect(navbar).not.toMatch(/querySelectorAll\(['"]\.cl['"]\)/)
  })

  it('gözlemci kökü barın bandına kırpılıyor', () => {
    expect(navbar).toContain('IntersectionObserver')
    expect(navbar).toContain('rootMargin')
    expect(navbar).toContain('--sahne-navbar')
  })

  it('mobil panel açıkken bar KOYU OLMUYOR — panel zemini kâğıt', () => {
    expect(navbar).toMatch(/koyuYuzey\.value\s*&&\s*!menuAcik\.value/)
  })

  it('odak halkası koyu zeminde kâğıda dönüyor', () => {
    expect(navbar).toContain('on-dark')
  })

  it('koyu tonda bakır METİN olarak kullanılmıyor — AA altı', () => {
    // Yalnız `.nb--koyu` ile başlayan kuralların GÖVDELERİ; aradaki açık
    // ton kuralları (`.nb-link--aktif::after` bakır kolu gibi) sayılmıyor.
    const govdeler = [...kodu(navbar).matchAll(/(\.nb--koyu[^{}]*)\{([^}]*)\}/g)]
    expect(govdeler.length, 'koyu ton kuralı bulunamadı').toBeGreaterThan(4)
    for (const [, secici, govde] of govdeler) {
      expect(govde, `bakır metin: ${secici.trim()}`).not.toContain('--c-signal')
    }
  })

  it('gözlemci sökülüyor — sayfa değişiminde sızıntı yok', () => {
    expect(navbar).toContain('onUnmounted')
    expect(navbar).toContain('gozlemci?.disconnect()')
  })
})
