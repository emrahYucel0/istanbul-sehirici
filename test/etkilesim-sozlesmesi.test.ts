// test/etkilesim-sozlesmesi.test.ts
//
// ETKİLEŞİM SÖZLEŞMESİ — EYLEM AĞIRLIKLARI, FORM DİLİ, HAREKET SINIRLARI.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN TEST EDİLİYOR
//
// Bu turda düzeltilen dört şeyin dördü de "tek kaynak" kuralına dayanıyor
// ve dördü de sessizce bozulur:
//
//   1. Birincil eylem görünümü İKİ yerde ayrı ayrı yazılıydı (Kapanış ve
//      yorum formu). Üçüncü bir yere kopyalanırsa kimse fark etmez.
//   2. İletişim formu kutulu, yorum formu çizgiliydi — aynı sitede iki
//      form dili. Yeni bir alan `border: 1px solid` ile eklenirse eski
//      ayrışma geri gelir.
//   3. Hareket kuralları (opaklık yok, `@supports` + reduced-motion
//      koruması) bir bölüm eklendiğinde unutulur.
//   4. Ölü etkileşim borcu (magnetic/countUp) geri sızabilir.
//
// Dosya kaynağı okuyor; tarayıcı ölçümleri raporda.
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const yol = (...p: string[]) => join(process.cwd(), ...p)
const oku = (...p: string[]) => readFileSync(yol(...p), 'utf8')

const sahne = oku('app', 'assets', 'css', 'sahne.css')
const talep = oku('app', 'components', 'contact', 'TalepFormu.vue')
const yorum = oku('app', 'components', 'base', 'ReviewForm.vue')
const kapanis = oku('app', 'components', 'base', 'Kapanis.vue')
const hero = oku('app', 'components', 'base', 'Hero.vue')
const sorular = oku('app', 'components', 'base', 'Sorular.vue')
const fiyat = oku('app', 'components', 'base', 'Fiyat.vue')
const dizin = oku('app', 'components', 'region', 'IlceDizini.vue')
const hizmetler = oku('app', 'components', 'base', 'Hizmetler.vue')
const duzen = oku('app', 'layouts', 'default.vue')

/** Yorumları atar: iddialar KOD için, açıklama metni için değil. */
const kodu = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/<!--[\s\S]*?-->/g, ' ')

// ═══════════════════════════════════════════ EYLEM AĞIRLIKLARI

describe('eylem ağırlıkları tek kütükte', () => {
  it('birincil kademe `.op-eylem` sahne kütüğünde tanımlı', () => {
    expect(sahne).toMatch(/\.op-eylem\s*\{/)
    expect(sahne).toMatch(/\.op-eylem--ters\s*\{/)
    expect(sahne).toContain('border-bottom: 2px solid rgb(var(--c-signal))')
  })

  // Hero LİSTEDE DEĞİL: ilk sahnede eylem satırı yok (bkz. bir alttaki
  // iddia). Kütük yalnız eylem GÖSTEREN yüzeyleri bağlar.
  it.each([
    ['Kapanis', kapanis],
    ['ReviewForm', yorum],
    ['TalepFormu', talep],
  ])('%s birincil eylemi kütükten alıyor', (_ad, kaynak) => {
    expect(kaynak).toContain('op-eylem')
  })

  it('eski kopyalar geri gelmedi', () => {
    expect(kodu(kapanis)).not.toMatch(/\.cl-birincil\s*\{/)
    expect(kodu(yorum)).not.toMatch(/\.yf-gonder\s*\{[^}]*border-bottom:\s*2px/)
  })

  it('Hero eylemsiz — ilk sahnede rakip çağrı yok', () => {
    // Hero'da bir zamanlar iki eylem vardı (birincil + telefon). Yeni
    // koreografide ilk sahne yalnız görsel + başlık + açıklama; eylem
    // hiyerarşisi Kapanış'ta ve formlarda kuruluyor. Kritik olan şu:
    // Hero'ya EYLEM GERİ GELİRSE kütükten (`op-eylem` / `op-bag`) gelmeli,
    // bileşen içinde yeni bir düğme dili doğmamalı.
    const k = kodu(hero)
    expect(k).not.toMatch(/<button/)
    expect(k).not.toMatch(/<NuxtLink/)
    expect(k).not.toMatch(/\.jr-eylem\s*\{/)
    expect(k).not.toMatch(/\.jr-bag[^\s]*\s*\{/)
  })

  it('bekleme durumu opaklıkla anlatılmıyor — kontrast AA altına düşmesin', () => {
    const blok = sahne.slice(sahne.indexOf('.op-eylem:disabled'), sahne.indexOf('.op-eylem:disabled') + 220)
    expect(blok).toContain('--c-ink-soft')
    expect(blok).not.toContain('opacity')
  })
})

// ═══════════════════════════════════════════ FORM DİLİ

describe('iki form da ÇİZGİ tabanlı', () => {
  const alanKurali = (kaynak: string, secici: string) => {
    const k = kodu(kaynak)
    const i = k.indexOf(secici + ' {')
    expect(i, `${secici} bulunamadı`).toBeGreaterThan(-1)
    return k.slice(i, k.indexOf('}', i))
  }

  it.each([
    ['iletişim formu', talep, '.if-girdi'],
    ['yorum formu', yorum, '.yf-girdi'],
  ])('%s alanı kutu değil', (_ad, kaynak, secici) => {
    const govde = alanKurali(kaynak, secici)
    expect(govde).toContain('border: 0')
    expect(govde).toContain('border-bottom')
    // Dolgulu zemin yok.
    expect(govde).toMatch(/background:\s*(none|transparent)/)
  })

  it.each([
    ['iletişim formu', talep, '.if-girdi'],
    ['yorum formu', yorum, '.yf-girdi'],
  ])('%s dokunma hedefi 44px — dolgu 0,625rem', (_ad, kaynak, secici) => {
    expect(alanKurali(kaynak, secici)).toContain('0.625rem')
  })

  it('etiketler künye katmanında (mono + versal)', () => {
    for (const [ad, kaynak, secici] of [
      ['iletişim', talep, '.if-etiket'],
      ['yorum', yorum, '.yf-etiket'],
    ] as Array<[string, string, string]>) {
      const govde = alanKurali(kaynak, secici)
      expect(govde, ad).toContain('var(--f-mono)')
      expect(govde, ad).toContain('text-transform: uppercase')
    }
  })

  it('dolgulu gönder düğmesi kalktı — sitede hap/blok düğme yok', () => {
    const govde = alanKurali(talep, '.if-gonder')
    expect(govde).not.toContain('background: rgb(var(--c-ink))')
    expect(talep).toContain('class="op-eylem if-gonder"')
  })

  it('durum bildirimleri iki formda da AYNI dilde — çizgiyle işaretli cümle', () => {
    expect(alanKurali(talep, '.if-durum')).toContain('border-left')
    expect(alanKurali(talep, '.if-durum')).not.toContain('--c-paper-sunken')
    expect(alanKurali(yorum, '.yf-durum')).toContain('border-left')
  })

  it('hata yalnız RENKLE anlatılmıyor', () => {
    // Çizgi kalınlaşıyor + alan altında metin + aria-invalid.
    expect(alanKurali(talep, '.if-girdi.is-hatali')).toContain('border-bottom-width: 2px')
    expect(talep).toContain('aria-invalid')
    expect(talep).toContain('ErrorMessage')
  })

  it('bekleme taraması hareket azaltmada DURAĞAN ama görünür', () => {
    expect(talep).toContain('.if-tarama')
    const i = talep.indexOf('@media (prefers-reduced-motion: no-preference)')
    expect(i).toBeGreaterThan(-1)
    // Animasyon SADECE koruma içinde tanımlı.
    const disarisi = talep.slice(0, i)
    expect(disarisi).not.toContain('animation: if-tara')
  })

  it('lead akışı DEĞİŞMEDİ — uç nokta, gövde ve bal küpü aynı', () => {
    expect(talep).toContain("'/api/leads'")
    expect(talep).toContain('sourcePage: route.path')
    expect(talep).toContain('website: website.value')
    expect(yorum).toContain("'/api/reviews'")
  })
})

// ═══════════════════════════════════════════ SORULAR: SÜREKLİ HAT

describe('Sorular sürekli hattı', () => {
  it('Süreç ile sınıf çakışması yok — ayrı önek', () => {
    // İkisi de `.sr-` kullanıyordu; scoped CSS ayırıyordu ama seçici
    // çakışması gerçek bir tuzak (ölçüm betikleri yanlış öğeyi buluyordu).
    expect(sorular).not.toMatch(/class="sr[\s"-]/)
    expect(sorular).toContain('class="ss"')
  })

  it('dört parça da var: hat · çentik · imleç · Q/A çizgisi', () => {
    expect(sorular).toContain('ss-omurga-cizgi')
    expect(sorular).toContain('ss-centik')
    expect(sorular).toContain('ss-imlec')
    expect(kodu(sorular)).toContain('.ss-oge::before')
  })

  // Seçici `.ss-eksen` → `.ss-pafta` olarak yeniden adlandırıldı (bölüm
  // dışarıda yeniden düzenlendi). Aranan davranış AYNI: sol sütun masaüstünde
  // yapışkan. Test gevşetilmedi, adı güncellendi.
  it('sol pafta masaüstünde yapışkan', () => {
    const k = kodu(sorular)
    // `.ss-pafta` iki kez tanımlı: taban kural ve masaüstü kuralı. Aranan
    // şey "en az bir tanesinde `position: sticky` var" — hangisinde
    // olduğunu bir alttaki test (yalnız masaüstünde) zaten bağlıyor.
    const govdeler = [...k.matchAll(/\.ss-pafta\s*\{([^}]*)\}/g)].map((m) => m[1])
    expect(govdeler.length).toBeGreaterThan(0)
    expect(govdeler.some((g) => g.includes('position: sticky'))).toBe(true)
  })

  it('mobilde omurga YOK — pin ve koreografi yok', () => {
    const k = kodu(sorular)
    const i = k.indexOf('.ss-omurga {')
    expect(k.slice(i, k.indexOf('}', i))).toContain('display: none')
    // Yapışkan kural yalnız masaüstü sorgusunun içinde.
    const masaustu = k.indexOf('@media (min-width: 1024px)')
    expect(k.indexOf('position: sticky')).toBeGreaterThan(masaustu)
  })

  it('opaklık ile belirme YOK', () => {
    expect(kodu(sorular)).not.toMatch(/opacity/)
  })

  it('hareket iki katmanla korunuyor', () => {
    expect(sorular).toContain('@supports (animation-timeline: view())')
    expect(sorular).toContain('@media (prefers-reduced-motion: no-preference)')
  })

  it('CMS sahipliği duruyor — sorular hâlâ FaqItem\'dan', () => {
    expect(sorular).toContain('props.sorular.items')
    expect(sorular).toContain('{{ s.question }}')
    expect(sorular).toContain('{{ s.answer }}')
  })
})

// ═══════════════════════════════════════════ FİYAT: YAPISAL HAREKET

describe('Fiyat hareketi yapıyı anlatıyor', () => {
  // Bölüm dışarıda yeniden düzenlendi: tek `fy-ciz` yerine üç yapısal
  // hareket var (bağlantı, dikey bus, yatay sonuç çizgileri). Kural
  // DEĞİŞMEDİ: kıpırdayan her şey bir ÇİZGİ, hiçbiri metin değil. Liste
  // kapalı tutuluyor ki yeni bir hareket sessizce eklenemesin.
  it('kıpırdayan her şey yapısal çizgi — metin değil', () => {
    const k = kodu(fiyat)
    const adlar = [...k.matchAll(/animation-name:\s*([\w-]+)/g)].map((m) => m[1])
    expect(adlar).toEqual(['fy-baglanti', 'fy-bus', 'fy-yatay', 'fy-yatay'])
  })

  it('metin hareket etmiyor, opaklık kullanılmıyor', () => {
    expect(kodu(fiyat)).not.toMatch(/opacity/)
    const k = kodu(fiyat)
    // Yalnız çizgi dönüşüyor.
    expect(k).toContain('transform: scaleX(0)')
    expect(k).not.toMatch(/\.fy-h2[^}]*transform/)
    expect(k).not.toMatch(/\.fy-metin[^}]*transform/)
  })

  it('iki katmanlı koruma', () => {
    expect(fiyat).toContain('@supports (animation-timeline: view())')
    expect(fiyat).toContain('@media (prefers-reduced-motion: no-preference)')
  })

  it('stagger/gecikme yok — hareket zaman eksenine bağlı', () => {
    expect(kodu(fiyat)).not.toMatch(/animation-delay/)
    // `--fy-oge` → `--fy-sistem`: sistem tek bir zaman ekseninden sürülüyor.
    expect(kodu(fiyat)).toContain('view-timeline-name: --fy-sistem')
    expect(kodu(fiyat)).toContain('animation-timeline: --fy-sistem')
  })
})

// ═══════════════════════════════════════════ ALT BİLGİ PERDESİ

/*
 * ALT BİLGİ NORMAL AKIŞTA — eski "perde" sözleşmesinin yerini alan testler.
 *
 * Buradaki dört test daha önce `.ft-perde { position: sticky; bottom: 0 }`
 * kuralının VARLIĞINI şart koşuyordu. O kural kaldırıldı: yapışkan alt bilgi
 * her sayfada, her an viewport'un içindeydi (1920×960'ta scrollY=0 iken
 * footer.top = 381, kesişim 579 px) ve rota değişiminde içerik örtüsü bir an
 * kalktığında doğrudan görünüyordu.
 *
 * Testler silinmedi, TERSİNE ÇEVRİLDİ: artık alt bilginin viewport'a
 * bağlanmadığını kilitliyorlar. Kural geri gelirse bu testler kırılır.
 */
describe('alt bilgi normal akışta', () => {
  const k = kodu(duzen)

  // TARİHÇE — İDDİALAR NEDEN ADA DEĞİL MEKANİZMAYA BAKIYOR.
  // Yapışkan alt bilgi perdesi iki kez kaldırıldı: önce `.ft-perde`,
  // sonra aynı mekanizma `.footer-reveal` adıyla geri gelince yeniden.
  // Sınıf adını yasaklamak yetmiyor; üçüncü bir ad her şeyi baştan
  // kırardı. Bu yüzden aşağıdaki iddialar KURALLARA bakıyor.

  it('düzende yapışkan/sabit konumlu öğe yok — skip-link dışında', () => {
    // `.skip-link` fixed olmak ZORUNDA (klavye atlama bağlantısı ekranın
    // dışında bekliyor); onun dışında düzen katmanında konumlandırma
    // kalmamalı. Ad ne olursa olsun kural yakalanıyor.
    const kurallar = k.split('}').filter((b) => /position:\s*(sticky|fixed)/.test(b))
    for (const kural of kurallar) expect(kural).toContain('.skip-link')
  })

  it('alt bilgi sarmalayıcısız — doğrudan düzenin çocuğu', () => {
    // Perde her iki denemede de `<fixed-footer />`i bir <div> içine
    // almıştı. Sarmalayıcı yoksa ona kural da yazılamaz.
    expect(duzen).toMatch(/<fixed-footer\s*\/>/)
    expect(duzen).not.toMatch(/<div[^>]*>\s*<fixed-footer/)
    // Ada KODDA bakılıyor: yorumdaki tarihçe iki ismi de anıyor ve
    // silinmemeli — kaldırma gerekçesi orada yazılı.
    expect(k).not.toContain('ft-perde')
    expect(k).not.toContain('footer-reveal')
  })

  it('#icerik perde için opaklaştırılmıyor', () => {
    // `#icerik {` KURALINI arıyoruz — şablondaki `href="#icerik"` değil.
    // Bu üçlü (position/z-index/background) yalnız perdeyi örtmek için
    // vardı; perde yokken üçü de gereksiz.
    const i = k.indexOf('#icerik {')
    if (i === -1) return // kural hiç yoksa zaten geçer
    const govde = k.slice(i, k.indexOf('}', i))
    expect(govde).not.toContain('z-index')
    expect(govde).not.toContain('background')
    expect(govde).not.toContain('position')
  })

  it('katman kurgusu yok — düzen z-index dağıtmıyor', () => {
    // Tek istisna skip-link'in modal katmanı.
    const zKurallari = k.split('}').filter((b) => /z-index/.test(b))
    for (const kural of zKurallari) expect(kural).toContain('.skip-link')
  })

  it('alt bilgi şablonda içerikten SONRA geliyor', () => {
    const icerik = duzen.indexOf('id="icerik"')
    const footer = duzen.indexOf('<fixed-footer')
    expect(icerik).toBeGreaterThan(-1)
    expect(footer).toBeGreaterThan(icerik)
  })

  it('atlama bağlantısının hedefi korunuyor', () => {
    // Perde temizliği erişilebilirliği geri götürmemeli.
    expect(duzen).toContain('href="#icerik"')
    expect(duzen).toContain('id="icerik"')
    expect(duzen).toContain('tabindex="-1"')
    expect(k).toContain('#icerik:focus')
  })

  it('eski yorum satırındaki deneme kaldırıldı', () => {
    expect(duzen).not.toContain('<!-- <template>')
  })
})

// ═══════════════════════════════════════════ DOKUNMA HEDEFLERİ

describe('dokunma hedefleri', () => {
  it('hizmet defteri bağlantısı kaplamayla 44px\'e çıkıyor', () => {
    expect(kodu(hizmetler)).toContain('.lg-bag::after')
    expect(kodu(hizmetler)).toContain('inset: -1rem 0 -0.375rem 0')
  })

  it('ilçe dizini kaplaması dikey pay taşıyor', () => {
    expect(kodu(dizin)).toContain('inset: -0.5rem 0')
  })

  it('görünen punto BÜYÜTÜLMEDİ — hedef kaplamayla çözüldü', () => {
    // Ad puntosu kütükten geliyor; bileşen kendi clamp'ini yazmıyor.
    expect(kodu(hizmetler)).toContain('--lg-ad-punto: clamp(1.3125rem, 1.05rem + 1vw, 1.875rem)')
  })
})

// ═══════════════════════════════════════════ DİZİN BAĞLANTI DİLİ

describe('/bolgelerimiz bağlantı dili', () => {
  const k = kodu(dizin)

  it('kalıcı alt çizgi kalktı', () => {
    const i = k.indexOf('.id-bag {')
    const govde = k.slice(i, k.indexOf('}', i))
    expect(govde).not.toContain('border-bottom')
    expect(govde).toContain('text-decoration: none')
  })

  it('hover VE odak aynı davranıyor', () => {
    expect(k).toMatch(/\.id-bag:hover,\s*\.id-bag:focus-visible/)
  })

  it('işaret renkten ibaret değil — ikinci sinyal satır numarası', () => {
    expect(k).toContain('.id-satir:has(.id-bag:hover) .id-no')
    expect(k).toContain('--c-signal')
  })

  it('yeni veri EKLENMEDİ — mahalle sayısı zaten vardı, artırılmadı', () => {
    const alanlar = [...dizin.matchAll(/ilce\.(\w+)/g)].map((m) => m[1])
    expect(new Set(alanlar)).toEqual(
      new Set(['aktif', 'slug', 'ad', 'no', 'mahalleSayisi', 'mahalleler'])
    )
  })
})

// ═══════════════════════════════════════════ ESKİ ETKİLEŞİM BORCU

describe('ölü etkileşim borcu temizlendi', () => {
  it.each(['useMagnetic.ts', 'useCountUp.ts'])('%s silindi', (dosya) => {
    expect(existsSync(yol('app', 'composables', dosya))).toBe(false)
  })

  it('hiçbir dosya bunlara başvurmuyor', () => {
    // Yorumlar atılıyor: Button.vue prop'un NEDEN kaldırıldığını anlatan
    // bir blok taşıyor ve o metin bir kullanım değil, bir kayıt.
    const buton = kodu(oku('app', 'components', 'ui', 'Button.vue'))
    expect(buton).not.toContain('useMagnetic')
    expect(buton).not.toContain('magnetic')
  })

  it('useReveal varsayılanı artık BİR KEZ', () => {
    const reveal = oku('app', 'composables', 'useReveal.ts')
    expect(reveal).toContain('once = true')
    expect(reveal).not.toContain('once = false')
  })
})

// ═══════════════════════════════════════════ ÇOK BÜYÜK EKRAN

describe('çok büyük ekran ölçeği', () => {
  const tipo = oku('app', 'assets', 'css', 'tipografi.css')

  it('kök punto 1920 üstünde ölçekleniyor', () => {
    expect(tipo).toContain('@media (min-width: 1920px)')
    expect(tipo).toMatch(/font-size:\s*clamp\(1rem,/)
  })

  it('KULLANICI TERCİHİ ezilmiyor — sabit px yok', () => {
    const i = tipo.indexOf('@media (min-width: 1920px)')
    const blok = tipo.slice(i)
    expect(blok).not.toMatch(/font-size:\s*clamp\(\s*\d+px/)
    expect(blok).toContain('1rem')
  })

  it('kap `rem` cinsinden — ölçek onu da büyütüyor', () => {
    expect(oku('app', 'assets', 'css', 'tokens.css')).toContain('--container-wide: 90rem')
  })
})
