// test/m19b-duzeltme-sozlesmesi.test.ts
//
// M19B — ÖLÇÜLMÜŞ BEŞ KUSURUN GERİ GELMEMESİ.
//
// ─────────────────────────────────────────────────────────────────────────
// BU DOSYA NEYİ KORUYOR
//
// M19A denetimi beş kusuru KANITLA buldu. Beşi de düzeltildi. Hepsinin
// ortak özelliği, geri geldiğinde EKRANDA HATA VERMEMESİ: sayfa çalışır,
// build geçer, kimse fark etmez. Bu yüzden her biri burada kaynaktan
// okunan bir sözleşmeye bağlandı.
//
//   A  Kapanış başlığı mobilde kırpılıyordu (440/390/360'ta 13px).
//      Sebep `15vw` ve `3.2rem` alt sınırıydı.
//   B  Kapanış künyesi bakır/mürekkep 3.13:1 idi (AA eşiği 4.5).
//   C  1280+ azaltılmış harekette Üç İstanbul'un üç açıklama bloğu
//      tamamen kayboluyordu (1228 karakter).
//   D  7 statik rota eğik çizgili biçimde KENDİNE canonical veriyordu.
//   E  Aralık dışı kat, tutarda sıkıştırılıyor ama özette ve devirde
//      ham geçiyordu.
//
// Testler kaynak DOSYALARI okuyor; tarayıcı ölçümleri raporda.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const oku = (...p: string[]) => readFileSync(join(process.cwd(), ...p), 'utf8')
/** Yorumları atar: iddialar KOD için, gerekçe metni için değil. */
const kodu = (k: string) =>
  k.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ')

const kapanis = kodu(oku('app', 'components', 'base', 'Kapanis.vue'))
const tokenlar = kodu(oku('app', 'assets', 'css', 'tokens.css'))

/**
 * Metin bakırının SAYISAL değeri.
 *
 * Başlangıçta `Kapanis.vue` içinde `rgb(209, 100, 56)` olarak yazılıydı ve
 * bu test onu oradan okuyordu. Navbar'daki marka vurgusu aynı basamağı
 * isteyince değer `tokens.css`e `--c-signal-metin` olarak taşındı — aynı
 * sayı iki dosyada durmasın diye. Test bu yüzden artık kanonik tanımı
 * okuyor; ölçtüğü şey DEĞİŞMEDİ: gerçek renk, gerçek kontrast.
 */
const signalMetin = (() => {
  const m = tokenlar.match(/--c-signal-metin:\s*(\d+)\s+(\d+)\s+(\d+)\s*;/)
  if (!m) return null
  return [Number(m[1]), Number(m[2]), Number(m[3])]
})()
const uc = kodu(oku('app', 'components', 'base', 'UcIstanbul.vue'))
const seo = kodu(oku('app', 'composables', 'usePageSeo.ts'))
const fiyat = kodu(oku('app', 'utils', 'fiyat.ts'))
const hesaplayici = kodu(oku('app', 'components', 'price', 'Hesaplayici.vue'))

/** `@media (max-width: 479px)` bloğunun gövdesi. */
const medyaGovdesi = (kaynak: string, kosul: string) => {
  const i = kaynak.indexOf(`@media ${kosul}`)
  expect(i, `@media ${kosul} bulunamadı`).toBeGreaterThan(-1)
  let derinlik = 0
  for (let j = kaynak.indexOf('{', i); j < kaynak.length; j++) {
    if (kaynak[j] === '{') derinlik++
    else if (kaynak[j] === '}') {
      derinlik--
      if (!derinlik) return kaynak.slice(i, j + 1)
    }
  }
  throw new Error(`@media ${kosul} kapanmıyor`)
}

// ═══════════════════════════════════════════════ A — MOBİL KIRPMA

describe('M19B/A — Kapanış başlığı mobilde kırpılmıyor', () => {
  const mobil = medyaGovdesi(kapanis, '(max-width: 479px)')

  it('güvensiz 15vw geri gelmedi', () => {
    // Ölçüldü: 15vw'de en uzun kelimenin min-content'i satır kutusunu
    // aşıyor ve `.fs` overflow:clip olduğu için 13px GERÇEKTEN kesiliyor.
    expect(mobil).not.toMatch(/font-size:\s*clamp\([^)]*\b15vw/)
  })

  it('.fs-h2 vw terimi ölçülen 13.375vw tavanının altında', () => {
    const m = mobil.match(/\.fs-h2\s*\{[^}]*font-size:\s*clamp\(([^)]*)\)/)
    expect(m, '.fs-h2 mobil font-size kuralı yok').not.toBeNull()
    const terimler = m![1].split(',').map((t) => t.trim())
    expect(terimler).toHaveLength(3)
    const vw = Number.parseFloat(terimler[1])
    expect(terimler[1]).toMatch(/vw$/)
    // Dokuz genişlikte (320-479) ikili aramayla ölçülen azami: 13.375vw.
    expect(vw).toBeGreaterThan(0)
    expect(vw).toBeLessThanOrEqual(13.375)
  })

  it('clamp alt sınırı da güvenli: 320pxde vw terimini bastırmıyor', () => {
    // 3.2rem (51.2px) TEK BAŞINA taşma üretiyordu: 320'de güvenli azami
    // 42.8px. Alt sınır, en dar genişlikteki vw karşılığını geçmemeli.
    const m = mobil.match(/\.fs-h2\s*\{[^}]*font-size:\s*clamp\(([^)]*)\)/)
    const terimler = m![1].split(',').map((t) => t.trim())
    const altRem = Number.parseFloat(terimler[0])
    const vw = Number.parseFloat(terimler[1])
    expect(terimler[0]).toMatch(/rem$/)
    expect(altRem * 16).toBeLessThanOrEqual((vw / 100) * 320)
  })

  it('kırpma gizlenerek çözülmedi', () => {
    // `.fs` klipi, sahnenin kendi tasarımı — kaldırılmamalı.
    expect(kapanis).toMatch(/\.fs\s*\{[^}]*overflow:\s*clip/)
    // Sahte çözümler: metni yatay sıkıştırma ya da negatif kaydırma.
    expect(mobil).not.toMatch(/scaleX\(/)
    expect(mobil).not.toMatch(/\.fs-h2\s*\{[^}]*transform:\s*translate/)
  })

  it('>=480 kuralına dokunulmadı', () => {
    // Taban kural (480-767 dahil) ölçülen değerinde duruyor: orada kelime
    // yalnız sağ dolguyu yiyor, klip sınırını aşmıyor.
    expect(kapanis).toMatch(/\.fs-h2\s*\{[\s\S]*?font-size:\s*clamp\(3\.5rem,\s*14\.5vw,\s*7\.2rem\)/)
  })
})

// ═══════════════════════════════════════════════ B — KONTRAST

describe('M19B/B — Kapanış künyesi WCAG AA kontrastında', () => {
  const kanal = (v: number) => {
    const x = v / 255
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  }
  const parlaklik = ([r, g, b]: number[]) => 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b)
  const oran = (a: number[], b: number[]) => {
    const [x, y] = [parlaklik(a), parlaklik(b)].sort((p, q) => q - p)
    return (x + 0.05) / (y + 0.05)
  }

  it('.fs-pre rengi genel signal tokenından AYRILDI', () => {
    // Grafik katmanı (`.fs-signal-*`) 1.4.11 kapsamında ve 3.13 zaten
    // 3:1'i geçiyor; global token değiştirilirse hairline'ın tonu bozulur.
    expect(kapanis).toMatch(/\.fs-pre\s*\{[^}]*color:\s*var\(--fs-signal-metin\)/)
    expect(kapanis).toMatch(/--fs-signal:\s*rgb\(var\(--c-signal\)\)/)
    expect(kapanis).toMatch(/border:\s*1px solid var\(--fs-signal\)/)
  })

  it('Kapanış metin bakırı kanonik tokena BAĞLI — sayı burada tekrar edilmiyor', () => {
    // Değer `tokens.css`e taşındı (ikinci tüketici: Navbar marka vurgusu).
    // Bileşen kendi sayısını yazarsa ikisi zamanla ayrışır; bu iddia o
    // kopmayı yakalıyor.
    expect(kapanis).toMatch(/--fs-signal-metin:\s*rgb\(var\(--c-signal-metin\)\)/)
    expect(signalMetin, '--c-signal-metin tokens.css içinde tanımlı değil').not.toBeNull()
  })

  it('metin bakırı koyu yüzeyde >= 4.5:1', () => {
    const zemin = [27, 26, 24] // rgb(var(--c-ink)) — ölçüldü
    expect(oran(signalMetin!, zemin)).toBeGreaterThanOrEqual(4.5)
  })

  it('metin bakırı KÂĞIT üstünde kullanılmamalı — orada AA altı', () => {
    // Bu basamak koyu zemin için. Açık zeminde 3.42:1 veriyor, yani
    // `--c-signal` ile yer değiştirilemez; ikisi iki ayrı zeminin karşılığı.
    expect(oran(signalMetin!, [247, 244, 239])).toBeLessThan(4.5)
  })

  it('hâlâ bakır: turuncu/neona kaçmadı', () => {
    const [r, g, b] = signalMetin!
    expect(r).toBeGreaterThan(g)
    expect(g).toBeGreaterThan(b)
    // Ton açısı orijinal bakıra (≈16°) yakın kalmalı.
    const ton = (60 * (g - b)) / (r - b)
    expect(ton).toBeGreaterThan(8)
    expect(ton).toBeLessThan(26)
  })

  it('kontrast, punto büyütülerek çözülmedi', () => {
    expect(kapanis).toMatch(/\.fs-pre\s*\{[^}]*font-size:\s*0\.625rem/)
  })
})

// ═══════════════════════════════════════════════ C — AZALTILMIŞ HAREKET

describe('M19B/C — 1280+ sahnesiz durumda içerik tam', () => {
  it('azaltılmış hareket dalı duraklara görünür kutu veriyor', () => {
    const dal = medyaGovdesi(uc, '(min-width: 1280px) and (prefers-reduced-motion: reduce)')
    expect(dal).toMatch(/\.ce-durak\s*\{[^}]*display:\s*grid/)
    expect(dal).not.toMatch(/\.ce-durak\s*\{[^}]*display:\s*none/)
    // Duraklar ve paftalar tekrar normal akışa dönüyor.
    expect(dal).toMatch(/\.ce-metin,\s*\.ce-ray,\s*\.ce-masa\s*\{\s*display:\s*contents/)
    expect(dal).toMatch(/\.ce-pafta\s*\{[^}]*position:\s*relative/)
  })

  it('animation-timeline desteklenmeyen tarayıcı için de yedek var', () => {
    // `@supports not` dalı olmadan Firefox/Safari eski sürümleri aynı
    // içeriği kaybederdi — ölçülen kusurun ikinci kapısı.
    const i = uc.indexOf('@supports not (animation-timeline: view())')
    expect(i, '@supports not dalı yok').toBeGreaterThan(-1)
    const kuyruk = uc.slice(i)
    expect(kuyruk).toMatch(/@media \(min-width: 1280px\)/)
    expect(kuyruk.slice(0, 2200)).toMatch(/\.ce-durak\s*\{[^}]*display:\s*grid/)
  })

  it('normal hareket koreografisi olduğu gibi duruyor', () => {
    // Gelişmiş dal `no-preference` + `supports` ile kapılı KALMALI;
    // yedek dallar onunla karşılıklı dışlayıcı olduğu için normal
    // hareket bu turdan hiç etkilenmiyor.
    expect(uc).toMatch(
      /@supports \(animation-timeline: view\(\)\) \{\s*@media \(min-width: 1280px\) and \(prefers-reduced-motion: no-preference\)/
    )
    expect(uc).toMatch(/\.ce-ray\s*\{[^}]*animation-name:\s*ce-ray-move/)
    expect(uc).toMatch(/view-timeline-name:\s*--ce/)
  })

  it('yedek dal koreografi çalıştırmıyor', () => {
    const dal = medyaGovdesi(uc, '(min-width: 1280px) and (prefers-reduced-motion: reduce)')
    expect(dal).not.toMatch(/animation-name/)
    expect(dal).not.toMatch(/view-timeline/)
    expect(dal).not.toMatch(/position:\s*sticky/)
  })

  it('CLS düzeltmesi (5510af9) korunuyor: plakalar transformla hareket ediyor', () => {
    // Yedek dal düzen özelliklerini canlandırmaya dönmemeli.
    for (const ad of ['ce-plate-1', 'ce-plate-2', 'ce-plate-3']) {
      const i = uc.indexOf(`@keyframes ${ad} {`)
      expect(i, `${ad} yok`).toBeGreaterThan(-1)
      const govde = uc.slice(i, uc.indexOf('@keyframes', i + 10) + 1 || undefined).slice(0, 1400)
      expect(govde, `${ad} düzen özelliği canlandırıyor`).not.toMatch(/^\s*(width|height|left|top):/m)
      expect(govde).toMatch(/transform:\s*translate3d/)
    }
    expect(uc).toMatch(/@property\s+--ce-pl/)
  })
})

// ═══════════════════════════════════════════════ D — CANONICAL

describe('M19B/D — canonical sonda eğik çizgi taşımıyor', () => {
  it('tek merkezde normalleştiriliyor', () => {
    expect(seo).toMatch(/route\.path\.replace\(\/\\\/\+\$\/, ''\)\s*\|\|\s*'\/'/)
  })

  it('canonical ve og:url aynı normalleştirilmiş yolu kullanıyor', () => {
    expect(seo).toMatch(/const canonicalUrl = computed\(\(\) => `\$\{siteUrl\.value\}\$\{canonicalPath\.value\}`\)/)
    expect(seo).toMatch(/ogUrl: canonicalUrl/)
    expect(seo).toMatch(/rel: 'canonical', href: canonicalUrl/)
  })

  it('ham route.path artık canonicalda kullanılmıyor', () => {
    expect(seo).not.toMatch(/canonicalUrl = computed\(\(\) => `\$\{siteUrl\.value\}\$\{route\.path\}`\)/)
  })

  it('kök yol "/" olarak kalıyor', () => {
    const normalle = (yol: string) => yol.replace(/\/+$/, '') || '/'
    expect(normalle('/')).toBe('/')
    expect(normalle('//')).toBe('/')
    expect(normalle('/iletisim/')).toBe('/iletisim')
    expect(normalle('/iletisim')).toBe('/iletisim')
    expect(normalle('/hizmetlerimiz///')).toBe('/hizmetlerimiz')
  })

  it('yönlendirme eklenmedi: rotalama davranışı aynı', () => {
    expect(seo).not.toMatch(/navigateTo|sendRedirect|createError/)
  })
})

// ═══════════════════════════════════════════════ E — KAT NORMALLEŞTİRME

describe('M19B/E — kat değeri hesap/özet/devirde aynı', () => {
  it('tek sıkıştırma tanımı var ve dışa veriliyor', () => {
    expect(fiyat).toMatch(/export function guvenliKat\(kat: unknown\): number/)
    expect(fiyat).toMatch(/sinirla\(Math\.floor\(sayiya\(kat, 0\)\), KAT_EN_AZ, KAT_EN_COK\)/)
    // Hesap da aynı tanımı kullanıyor — ikinci uygulama doğmasın.
    expect(fiyat).toMatch(/katEki\([\s\S]{0,220}guvenliKat\(kat\)/)
  })

  it('bileşen kendi sıkıştırmasını yeniden yazmıyor', () => {
    expect(hesaplayici).toMatch(/import \{[^}]*guvenliKat[^}]*\} from '~\/utils\/fiyat'/)
    expect(hesaplayici).not.toMatch(/Math\.min\(Math\.max\(Math\.floor\(/)
  })

  it('özet normalleştirilmiş katı gösteriyor', () => {
    expect(hesaplayici).toMatch(/const cikisKatiGuvenli = computed\(\(\) => guvenliKat\(form\.value\.cikisKat\)\)/)
    expect(hesaplayici).toMatch(/const varisKatiGuvenli = computed\(\(\) => guvenliKat\(form\.value\.varisKat\)\)/)
    expect(hesaplayici).toMatch(/etiket: 'ÇIKIŞ', deger: kat\(cikisKatiGuvenli\.value/)
    expect(hesaplayici).toMatch(/etiket: 'VARIŞ', deger: kat\(varisKatiGuvenli\.value/)
  })

  it('devir yükü normalleştirilmiş katı taşıyor', () => {
    const i = hesaplayici.indexOf('const eylemYolu = computed(')
    expect(i).toBeGreaterThan(-1)
    const govde = hesaplayici.slice(i, i + 620)
    expect(govde).toMatch(/cikisKat: cikisKatiGuvenli\.value/)
    expect(govde).toMatch(/varisKat: varisKatiGuvenli\.value/)
    expect(govde).not.toMatch(/cikisKat: form\.value\.cikisKat/)
    expect(govde).not.toMatch(/varisKat: form\.value\.varisKat/)
  })

  it('0..30 iş sınırı ve formül değişmedi', () => {
    expect(fiyat).toMatch(/export \{ KAT_EN_AZ, KAT_EN_COK \} from '#shared\/utils\/fiyat-devri'/)
    // Kat eki kuralı: asansör varsa 0, yoksa max(0, kat-1) × ücret.
    expect(fiyat).toMatch(/if \(asansorVar\) return 0/)
    expect(fiyat).toMatch(/Math\.max\(0, guvenliKat\(kat\) - 1\) \* ucret/)
  })

  it('istemcide fiyat saklanmıyor', () => {
    expect(hesaplayici).not.toMatch(/localStorage|sessionStorage/)
  })
})
