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
const kapsam = oku('app', 'components', 'base', 'Kapsam.vue')
const duzen = oku('app', 'layouts', 'default.vue')
const acilis = oku('app', 'components', 'sayfa', 'Acilisi.vue')
const sgGiris = oku('app', 'components', 'service', 'Giris.vue')
const bgGiris = oku('app', 'components', 'blog-index', 'Giris.vue')
const sgDizin = oku('app', 'components', 'service', 'Dizin.vue')
const byListe = oku('app', 'components', 'blog-index', 'YaziListesi.vue')

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
    ['ReviewForm', yorum],
    ['TalepFormu', talep],
  ])('%s birincil eylemi kütükten alıyor', (_ad, kaynak) => {
    expect(kaynak).toContain('op-eylem')
  })

  it('Kapanis birincil eylemi — kütük METNİ, yüzeye özgü ağırlık', () => {
    // M17 pafta: kapanış tek koyu yüzey oldu ve birincil eylemi kendi
    // ağırlığıyla (`.fs-primary`) basıyor; `.op-eylem` kâğıt zemin için
    // ayarlı. Korunan asıl sözleşme İÇERİK sahipliği: eylem etiketi hâlâ
    // ortak kütükten (`utils/kapanis.ts` -> KAPANIS_EYLEMI) geliyor,
    // bileşen kendi çağrısını uydurmuyor.
    expect(kapanis).toContain('KAPANIS_EYLEMI')
    expect(kapanis).toContain('fs-primary')
    // İki eylem: birincil + telefon. Üçüncü bir çağrı eklenmedi.
    expect(kapanis).toContain('fs-phone')
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
    expect(talep).toContain('website: website.value')
    expect(yorum).toContain("'/api/reviews'")
  })

  /**
   * KAYNAK ALANINI M14C2'DE SUNUCU BELİRLİYOR.
   *
   * M14C'de alan istemcide iki sabitten birini alıyordu. Artık istemci
   * yalnız bulunduğu yolu bildiriyor; hesaplayıcıdan gelindiği kararı
   * sunucuda, ham seçimler GERÇEKTEN doğrulandıktan sonra veriliyor.
   * Çivi bu yüzden daha da daraldı: bu dosyada kaynak alanına
   * `route.path` DIŞINDA bir şey yazılamaz.
   */
  it('kaynak alanı istemcide yalnız route.path — kararı sunucu veriyor', () => {
    expect(talep).toContain('sourcePage: route.path')
    // `route.query` bu dosyada hiç okunmuyor: doğrulama sayfada ve
    // sunucuda, tek sözleşmeden.
    expect(talep).not.toContain('route.query')
  })

  /**
   * MESAJ KUTUSU ÖN DOLDURULMUYOR.
   *
   * Kutu düzenlenebilir olduğu için ön dolgu, kaydın doğruluğunu
   * kullanıcının silme kararına bağlıyordu. Kayda giren kanonik özeti
   * artık sunucu üretiyor; kutu kullanıcının kendi notuna ait.
   */
  it('mesaj kutusuna hesaplayıcı metni yazılmıyor', () => {
    expect(talep).not.toContain('initial-values')
    expect(talep).not.toContain('devirMesaji')
  })

  it('ham seçimler gövdeye ekleniyor — metin değil', () => {
    expect(talep).toContain('hesap: props.hesapAlanlari')
    // Tutar/etiket gönderilmiyor.
    for (const yasak of ['alt:', 'ust:', 'odaAdi', 'mesafeAdi', 'aralik']) {
      expect(talep, yasak).not.toContain(yasak)
    }
  })
})

// ═══════════════════════════════════════════ SORULAR: SÜREKLİ HAT

describe('Sorular sürekli hattı', () => {
  // M17 pafta: bölüm `ss-` önekinden `pd-` önekine geçti ve omurga bir
  // "tarama bandı"na dönüştü. SÖZLEŞMELER AYNI kaldı; aşağıdakiler artık
  // seçici adını değil DAVRANIŞI bağlıyor.
  it('Süreç ile sınıf çakışması yok — ayrı önek', () => {
    // İkisi de `.sr-` kullanıyordu; scoped CSS ayırıyordu ama seçici
    // çakışması gerçek bir tuzak (ölçüm betikleri yanlış öğeyi buluyordu).
    expect(sorular).not.toMatch(/class="sr[\s"-]/)
    expect(sorular).toContain('class="pd"')
  })

  it('dört yapısal parça da var: pafta · tarama · kilit · çözüm çizgisi', () => {
    expect(sorular).toContain('pd-pafta-frame')
    expect(sorular).toContain('pd-scan-line')
    expect(sorular).toContain('pd-lock')
    expect(sorular).toContain('pd-resolve')
  })

  it('sol pafta masaüstünde yapışkan', () => {
    const k = kodu(sorular)
    const govdeler = [...k.matchAll(/\.pd-pafta\s*\{([^}]*)\}/g)].map((m) => m[1])
    expect(govdeler.length).toBeGreaterThan(0)
    expect(govdeler.some((g) => g.includes('position: sticky'))).toBe(true)
  })

  it('mobilde pin YOK — yapışkanlık yalnız masaüstü sorgusunda', () => {
    const k = kodu(sorular)
    // Taban kuralda yapışkanlık yok: mobilde pafta akışta kalıyor.
    const i = k.indexOf('.pd-pafta {')
    expect(k.slice(i, k.indexOf('}', i))).not.toContain('position: sticky')
    // Tek `position: sticky` masaüstü sorgusunun İÇİNDE.
    const masaustu = k.indexOf('@media (min-width: 1024px)')
    expect(masaustu).toBeGreaterThan(-1)
    expect(k.indexOf('position: sticky')).toBeGreaterThan(masaustu)
  })

  it('METİN opaklıkla belirmiyor — sönük kalma riski yok', () => {
    // Eski sözleşme "hiç opacity yok" diyordu. Pafta tasarımında tek bir
    // DEKORATİF damga (`.pd-lock`, aria-hidden) opaklıkla basılıyor.
    // Korunması gereken asıl kural: METİN taşıyan hiçbir öğe opaklıkla
    // belirmiyor — animasyon takılırsa yazı okunamaz kalırdı.
    const k = kodu(sorular)
    for (const kural of [...k.matchAll(/([.#][\w-]+)\s*\{([^}]*opacity[^}]*)\}/g)]) {
      expect(kural[1], kural[1] + ' opaklıkla beliriyor').toMatch(/pd-lock/)
    }
    expect(sorular).toContain('pd-lock')
    expect(sorular).toContain('aria-hidden')
  })

  it('hareket iki katmanla korunuyor', () => {
    expect(sorular).toContain('@supports (animation-timeline: view())')
    // Guard artık genişlik sorgusuyla BİRLEŞİK yazılıyor
    // (`@media (min-width: …) and (prefers-reduced-motion: no-preference)`),
    // bu yüzden tam dize yerine iki koşulun varlığı aranıyor.
    expect(sorular).toContain('prefers-reduced-motion: no-preference')
    // Ve tersi katman: hareket kapalıyken sıfırlama kuralı duruyor.
    expect(sorular).toContain('prefers-reduced-motion: reduce')
  })

  it('CMS sahipliği duruyor — sorular hâlâ FaqItem kaydından', () => {
    // Şablon artık türetilmiş bir listeden basıyor; kaynak yine CMS.
    expect(sorular).toContain('props.sorular.items')
    expect(sorular).toContain('s.question')
    expect(sorular).toContain('s.answer')
  })
})

// ═══════════════════════════════════════════ FİYAT: YAPISAL HAREKET

describe('Fiyat hareketi yapıyı anlatıyor', () => {
  // M17 pafta: bölüm `fy-` önekinden `qp-` önekine geçti ve tek bir
  // "fiyat presi" sahnesine dönüştü. Hareket listesi kapalı tutuluyor ki
  // yeni bir hareket sessizce eklenemesin.
  it('hareket listesi kapalı — sessizce yeni hareket eklenemez', () => {
    const k = kodu(fiyat)
    const adlar = [...new Set([...k.matchAll(/animation-name:\s*([\w-]+)/g)].map((m) => m[1]))].sort()
    expect(adlar).toEqual([
      'qp-actions-in', 'qp-equation-in',
      'qp-feed-1', 'qp-feed-2', 'qp-feed-3', 'qp-feed-4', 'qp-feed-5',
      'qp-input-1', 'qp-input-2', 'qp-input-3', 'qp-input-4', 'qp-input-5',
      'qp-output-arrow', 'qp-output-line',
      'qp-press-bottom', 'qp-press-lock', 'qp-press-top',
      'qp-pressure-1', 'qp-pressure-2', 'qp-pressure-3',
      'qp-price-meta', 'qp-price-print',
    ])
  })

  it('başlık ve giriş metni HAREKET ETMİYOR', () => {
    // Pafta tasarımında makinenin ÇIKTISI (fiyat kelimesi) bilerek
    // basılıyor; ama bölümün okunması gereken başlığı ve girişi sabit.
    const k = kodu(fiyat)
    for (const c of ['qp-h2', 'qp-lead', 'qp-input-label', 'qp-actions-copy']) {
      const i = k.indexOf('.' + c + ' {')
      if (i === -1) continue
      expect(k.slice(i, k.indexOf('}', i)), c + ' hareket ediyor').not.toContain('animation-name')
    }
  })

  it('iki katmanlı koruma', () => {
    expect(fiyat).toContain('@supports (animation-timeline: view())')
    // Guard artık genişlik sorgusuyla BİRLEŞİK yazılıyor
    // (`@media (min-width: …) and (prefers-reduced-motion: no-preference)`),
    // bu yüzden tam dize yerine iki koşulun varlığı aranıyor.
    expect(fiyat).toContain('prefers-reduced-motion: no-preference')
    // Ve tersi katman: hareket kapalıyken sıfırlama kuralı duruyor.
    expect(fiyat).toContain('prefers-reduced-motion: reduce')
  })

  it('stagger/gecikme yok — hareket tek zaman ekseninden sürülüyor', () => {
    const k = kodu(fiyat)
    expect(k).not.toMatch(/animation-delay/)
    expect(k).toContain('view-timeline-name: --qp')
    expect(k).toContain('animation-timeline: --qp')
    const eksenler = [...new Set([...k.matchAll(/animation-timeline:\s*(--[\w-]+)/g)].map((m) => m[1]))]
    expect(eksenler).toEqual(['--qp'])
  })

  it('ARALIK dejenere DEĞİL — yapışkan raya rağmen ilerliyor', () => {
    // M17A blocker: `.qp` 300vh, scrollport 100vh. `contain` aralığı
    // öznenin scrollport'a TAM sığdığı aralıktır ve bu geometride hiç
    // oluşmaz — "FİYAT" kelimesi 1920/2560'ta hiç basılmıyordu.
    // `entry 100% -> exit 0%` yapışkan yolun kendisi ve her viewport
    // boyunda pozitif. Geri alınırsa bölüm yine sessizce boş kalır.
    const k = kodu(fiyat)
    expect(k).toContain('animation-range: entry 100% exit 0%')
    expect(k).not.toMatch(/animation-range:\s*contain/)
  })

  it('"FİYAT" tablet bandında KENDİ yuvasına göre ölçekleniyor', () => {
    // M17C: 768–1279 aralığında `.qp-price` on iki kolonun son dördüne
    // oturuyor (yuva ≈ %29 genişlik) ama punto taban (mobil) kuralından
    // geliyordu: `clamp(5.2rem, 24vw, 10rem)` orada 160px'e sabitlenip
    // kelimeyi yuvasının ~2 katı yapıyordu. Belge yatay taşması 0 olduğu
    // için otomatik denetim görmüyordu; kırpılma bileşenin KENDİ kabındaydı.
    const k = kodu(fiyat)
    const i = k.indexOf('@media (min-width: 768px) and (max-width: 1279px)')
    expect(i, 'tablet bandı sorgusu yok').toBeGreaterThan(-1)
    const blok = k.slice(i, k.indexOf('\n}', i))
    expect(blok, 'tablet bandında qp-price-word punto kuralı yok').toContain('.qp-price-word')
    // Punto viewport'a bağlı ve taban kuralın 24vw'sinden belirgin küçük.
    const m = blok.match(/\.qp-price-word\s*\{[^}]*font-size:\s*clamp\([^,]+,\s*([\d.]+)vw/)
    expect(m, 'punto vw tabanlı değil').not.toBeNull()
    expect(Number.parseFloat(m![1])).toBeLessThan(16)
  })
})

// ═══════════════════════════════════════════ M17C GEOMETRİ SÖZLEŞMELERİ

describe('pafta geçiş geometrisi — ölçülmüş kusurlar geri gelmesin', () => {
  it('Kapsam 25/14 girişi ODA MİKTARINA duyarlı, ham vw değil', () => {
    // Sayıların DURDUĞU yer `--container-wide` ile sınırlı; giriş mesafesi
    // ham `18vw` olduğunda dar masaüstlerinde glif ekranın dışına taşıyordu
    // (ölçüldü: 1920'de %24, 1440'ta %29 görünür kalıyordu).
    const k = kodu(kapsam)
    expect(k).toContain('--ks-giris')
    // Sabit bir pay düşülüyor: mesafe ekranla büyüyor ama kabı tanıyor.
    expect(k).toMatch(/--ks-giris:\s*max\([^;]*calc\([\d.]+vw\s*-\s*[\d.]+rem\)/)
    // Keyframe artık ham vw yazmıyor.
    expect(k).not.toMatch(/translate3d\(-?18vw/)
  })

  it('Kapanış perdesi GİRİŞ sırasında açılmaya başlıyor', () => {
    // M17C: perde `entry 100%`te açılmaya başlayınca, `.fs` ekrana tam
    // girene kadar (bir tam ekran boyu) kapalı kalıyor ve kullanıcı boş
    // kâğıt kaydırıyordu (ölçüldü: 1,13 ekran). Açılış girişin içine
    // alınınca 0,75 ekrana indi ve koyu yüzey son SSS satırı hâlâ
    // ekrandayken beliriyor.
    const k = kodu(kapanis)
    const m = k.match(/animation-range:\s*entry\s+([\d.]+)%\s+exit\s+0%/)
    expect(m, 'kapanış aralığı entry/exit tabanlı değil').not.toBeNull()
    expect(Number.parseFloat(m![1]), 'perde girişin sonunda açılıyor').toBeLessThan(100)
    expect(k).not.toMatch(/animation-range:\s*contain/)
  })
})

// ═══════════════════════════════════════════ M17D GÜVENLİ ALAN SÖZLEŞMESİ

describe('Fiyat yapışkan sahnesi navbar güvenli alanını tanıyor', () => {
  it('yapışkan izin dikey dolgusu ekran boyuna bağlı, sabit artık değil', () => {
    // M17D'de ölçüldü: eski `clamp(0.9rem, 1.6vh, 1.3rem)` ile başlığın
    // navbar'a olan mesafesi 3440x1440'ta 22px, 1920x1080'de 16px'ti —
    // 1440px'lik bir ekranda %1,5. Navbar yüksekliğindeki en ufak sapma
    // künyeyi ve başlığın ilk satırını barın altına sokuyordu.
    const k = kodu(fiyat)
    const i = k.indexOf('top: var(--sahne-navbar);')
    expect(i, 'yapışkan .qp-track kuralı bulunamadı').toBeGreaterThan(-1)
    const blok = k.slice(i, i + 1800)
    // Dolgu yüksekliğe bağlı bir ifade içermeli (düz rem sabiti değil).
    expect(blok, 'yapışkan izin dolgusu vh ile ölçeklenmiyor').toMatch(/padding:\s*[^;]*vh/)
    // Ve `calc(...vh - ...px)` biçiminde: kısa ekranda sıfıra yaklaşan,
    // uzun ekranda cömert bir güvenli alan. Düz `Nvh` bunu veremez —
    // 900px'de makinenin verecek yeri olmadığı ölçüldü.
    expect(blok).toMatch(/calc\(\s*[\d.]+vh\s*-\s*[\d.]+px\s*\)/)
    // Eski sabit artık geri gelemez.
    expect(blok).not.toContain('clamp(0.9rem, 1.6vh, 1.3rem)')
  })

  it('kısa ekranda parametre satırları yatay yeri dikey yere çeviriyor', () => {
    // 3440x1200'de gövde yuvası 470px iken metin 36ch'te kesiliyor,
    // beş satıra çıkıp alttaki parametrenin üstüne biniyordu (ölçülen
    // satır taşması 26px; ekran görüntüsüyle doğrulandı).
    const k = kodu(fiyat)
    const i = k.indexOf('@media (max-height: 1200px)')
    expect(i, 'kısa ekran bandı yok').toBeGreaterThan(-1)
    const blok = k.slice(i, i + 400)
    expect(blok).toContain('.qp-input-body')
    expect(blok, '36ch kapağı kısa ekranda kalkmıyor').toMatch(/max-width:\s*none/)
  })

  it('FİYAT kelimesi ultrawide kolonuna sığıyor', () => {
    // Ultrawide tavanı `10rem` iken (3440'ta 220px) kelimenin glif
    // genişliği 562px, kolon ise 516px'ti: son "T" `.qp-machine`ın
    // `overflow: hidden`ı tarafından 46px kesiliyordu.
    const k = kodu(fiyat)
    const i = k.indexOf('min-aspect-ratio: 2 / 1')
    expect(i, 'ultrawide bandı yok').toBeGreaterThan(-1)
    const blok = k.slice(i)
    const m = blok.match(/\.qp-price-word\s*\{[^}]*font-size:\s*clamp\([^,]+,[^,]+,\s*([\d.]+)rem\s*\)/)
    expect(m, 'ultrawide FİYAT punto kuralı yok').not.toBeNull()
    expect(Number.parseFloat(m![1]), 'FİYAT tavanı kolonun taşıyabildiğini aşıyor').toBeLessThanOrEqual(9)
  })
})

// ═══════════════════════════════════════════ M17E TÜRKÇE HARF + KISA EKRAN

describe('FİYAT gerçek Türkçe harfle yazılıyor', () => {
  it('kaynak metin U+0130 taşıyor, ASCII I değil', () => {
    // M17E: masaüstünde kelime "FIYAT" basılıyordu. Kaynak metin her
    // zaman doğruydu; kırpma kutusu noktayı kesiyordu (aşağıdaki teste
    // bak). Yine de yetkili görünen dize burada kilitleniyor.
    const k = kodu(fiyat)
    const m = k.match(/<strong class="qp-price-word">([^<]+)<\/strong>/)
    expect(m, 'qp-price-word metni bulunamadı').not.toBeNull()
    const kelime = m![1].trim()
    expect(kelime).toBe('FİYAT')
    expect([...kelime].map((c) => c.codePointAt(0))).toEqual([0x46, 0x130, 0x59, 0x41, 0x54])
    // ASCII I ve noktasız ı geçmemeli.
    expect(kelime).not.toContain('I')
    expect(kelime).not.toContain('ı')
  })

  it('nokta CSS ile ÇİZİLMİYOR — sahte nokta yasağı', () => {
    // Nokta fontun kendi glifi olmalı. Bu test, ileride birinin
    // ::before/::after, gölge, SVG veya `content` ile nokta eklemesini
    // engelliyor.
    const k = kodu(fiyat)
    const i = k.indexOf('<style')
    const stil = k.slice(i)
    expect(stil).not.toMatch(/\.qp-price-word\s*::?(before|after)/)
    expect(stil).not.toMatch(/\.qp-price-word[^{]*\{[^}]*text-shadow/)
    expect(stil).not.toMatch(/\.qp-price-word[^{]*\{[^}]*content\s*:/)
    // Şablonda da ayrı bir dekoratif nokta ögesi yok.
    expect(k.slice(0, i)).not.toMatch(/qp-price-nokta|qp-price-dot/)
  })

  it('kırpma dikeyde mürekkebi kesmiyor, yatay silme aynı', () => {
    // Ölçüldü (3440x1440): punto 198px, kenar kutusu 143px,
    // "İ" taban üstü mürekkep 175px. `inset(0)` kutuya kırptığı için
    // noktanın yaşadığı 37px'lik şerit siliniyordu.
    const k = kodu(fiyat)
    const i = k.indexOf('@keyframes qp-price-print')
    expect(i, 'qp-price-print kareleri yok').toBeGreaterThan(-1)
    const blok = k.slice(i, k.indexOf('@keyframes', i + 10))
    // Dikey paylar negatif olmalı.
    const kareler = [...blok.matchAll(/clip-path:\s*inset\(([^)]+)\)/g)].map((m) => m[1].trim())
    expect(kareler.length).toBeGreaterThanOrEqual(3)
    for (const kare of kareler) {
      expect(kare, 'dikey kırpma payı negatif değil: ' + kare).toMatch(/^-[\d.]+em/)
    }
    // Yatay silme korunuyor: bir kare tam kapalı (100%), sonrakiler açık.
    expect(kareler.some((v) => v.includes('100%'))).toBe(true)
    expect(kareler.some((v) => /^-[\d.]+em\s+0\s/.test(v))).toBe(true)
  })
})

describe('kısa ekranda parametre satırları içeriğe göre boyutlanıyor', () => {
  it('satırlar max-content — `auto` min-height:0 yüzünden yetmiyor', () => {
    // 1280x800'de 2. satır ("ERİŞİM VE KAT") gövdesi dört satıra çıkıp
    // 94px istiyor; eşit 1fr bölüşümde 66px alıyor ve alttaki satırın
    // üstüne biniyordu. `auto` da yetmedi: `.qp-input`taki
    // `min-height: 0` otomatik asgari boyu sıfırladığı için iz
    // içeriğinin altına inebiliyor (ölçüldü: yine 70px).
    const k = kodu(fiyat)
    const i = k.indexOf('@media (max-height: 900px)')
    expect(i, 'kısa ekran bandı yok').toBeGreaterThan(-1)
    const blok = k.slice(i, i + 1400)
    expect(blok).toMatch(/\.qp-inputs\s*\{[^}]*grid-template-rows:\s*repeat\(5,\s*max-content\)/)
  })

  it('gövde puntosu kısa ekranda küçültülmedi', () => {
    // Açık, yoğunluktan ve sabit yükseklikli eylem bloğundan kapatıldı;
    // okunabilirlik düşürülmedi.
    const k = kodu(fiyat)
    const i = k.indexOf('@media (max-height: 900px)')
    const blok = k.slice(i, i + 1400)
    expect(blok).not.toMatch(/\.qp-input-body\s*\{[^}]*font-size/)
  })

  it('kısa ekran eylem hedefi 44px eşiğinin üstünde', () => {
    const k = kodu(fiyat)
    const i = k.indexOf('@media (max-height: 900px)')
    const blok = k.slice(i, i + 1400)
    const m = blok.match(/\.qp-action\s*\{[^}]*min-height:\s*([\d.]+)rem/)
    expect(m, 'kısa ekran qp-action min-height yok').not.toBeNull()
    expect(Number.parseFloat(m![1]) * 16).toBeGreaterThanOrEqual(44)
  })
})


// ═══════════════════════════════════════════ M18B1 EDİTORYAL DİZİN

describe('dizin açılışları tek sicilden geliyor', () => {
  it('ortak açılış ilkeli var ve iki dizin de onu kullanıyor', () => {
    // M18A'da ölçüldü: beş Giris bileşeni aynı açılışı kuruyordu
    // (normalize şablon benzerliği ort. ~%78). Bu tur yalnız iki dizin
    // taşındı; detay sayfaları Pack B'nin kararı.
    expect(kodu(acilis)).toContain('BreadcrumbList')
    for (const [ad, kaynak] of [['hizmetler', sgGiris], ['blog', bgGiris]] as Array<[string, string]>) {
      expect(kodu(kaynak), `${ad} açılışı ilkeli kullanmıyor`).toContain('<SayfaAcilisi')
      // Kopyalanmış yol izi işaretlemesi geri gelmemeli.
      expect(kodu(kaynak), `${ad} açılışı yol izini yeniden kuruyor`).not.toContain('BreadcrumbList')
    }
  })

  it('yol izi anlambilimi ilkelde korunuyor', () => {
    const k = kodu(acilis)
    expect(k).toContain('itemtype="https://schema.org/ListItem"')
    expect(k).toContain('aria-current="page"')
    expect(k).toContain('aria-label="Yol izi"')
    // Tek h1 ve dışarıdan verilen kimlik.
    expect((k.match(/<h1/g) || []).length).toBe(1)
    expect(k).toContain(':id="baslikId"')
  })

  it('dizin açılışı ana sayfa gösterisini kopyalamıyor', () => {
    // Açılış otoritesi punto ile geliyor; yapışkan sahne, 300vh ya da
    // kaydırmaya bağlı uzun koreografi YOK.
    const k = kodu(acilis)
    expect(k).not.toMatch(/position:\s*sticky/)
    expect(k).not.toMatch(/height:\s*\d{3}vh/)
    expect(k).not.toMatch(/addEventListener|IntersectionObserver|requestAnimationFrame|gsap/)
  })
})

describe('dizin sayfaları kart diline dönmüyor', () => {
  it.each([
    ['açılış ilkeli', 'acilis'],
    ['hizmet dizini', 'sgDizin'],
    ['blog listesi', 'byListe'],
  ])('%s yuvarlatma/gölge taşımıyor', (_ad, anahtar) => {
    const harita: Record<string, string> = { acilis, sgDizin, byListe }
    const k = kodu(harita[anahtar])
    expect(k).not.toMatch(/border-radius:\s*(?!0)/)
    expect(k).not.toMatch(/box-shadow:\s*(?!none)/)
  })
})

describe('blog görsel politikası duyarlı, sabit küçük resim değil', () => {
  it('masaüstü görsel kolonu viewport ile ölçekleniyor ama üstten sınırlı', () => {
    // M18A: 1440'ta da 1024'te de 240x180 sabitti — katalog küçük resmi.
    // Artık `clamp` ile ölçekleniyor; üst sınır px cinsinden çünkü kök
    // punto akışkan (rem tavanı 3440'ta 440px'e çıkıyordu, ölçüldü) ve
    // 320px'i aşınca `sizes` bir üst adaya geçip aktarımı büyütüyor.
    const k = kodu(byListe)
    expect(k).toMatch(/grid-template-columns:[^;]*clamp\([^)]*vw[^)]*\)/)
    expect(k).toMatch(/clamp\([^)]*,\s*\d+px\)/)
    expect(k).not.toMatch(/minmax\(0,\s*15rem\)/)
  })

  it('oran kaynağın kendi oranı — kırpma yok', () => {
    const k = kodu(byListe)
    expect(k).toContain('aspect-ratio: 16 / 10')
    expect(k).not.toMatch(/aspect-ratio:\s*4\s*\/\s*3/)
  })

  it('katlama altındaki kapaklar tembel, yalnız ilk satır öncelikli', () => {
    const k = kodu(byListe)
    expect(k).toContain("i === 0 && sayfa === 1 ? 'eager' : 'lazy'")
    expect(k).toMatch(/width="640"/)
    expect(k).toMatch(/height="400"/)
  })
})

describe('blog sayfalama sözleşmesi korunuyor', () => {
  it('gerçek bağlantılar ve ?sayfa=N', () => {
    const k = kodu(byListe)
    expect(k).toContain('sayfaYolu(')
    expect(k).toContain("rel=\"prev\"")
    expect(k).toContain("rel=\"next\"")
    // Düğmeye geri dönülmemeli: arama motoru ikinci sayfayı bulamıyordu.
    expect(k).not.toMatch(/<button[^>]*@click="[^"]*sayfa/)
    expect(k).toContain('aria-current="false"')
  })
})

describe('dizin ailesi hareketi MİKRO kalıyor', () => {
  it.each([
    ['açılış', 'acilis'],
    ['blog listesi', 'byListe'],
  ])('%s azaltılmış hareket koruması taşıyor', (_ad, anahtar) => {
    const harita: Record<string, string> = { acilis, byListe }
    const k = harita[anahtar]
    expect(k).toMatch(/prefers-reduced-motion/)
    // Uzun kaydırma koreografisi yok.
    expect(kodu(k)).not.toMatch(/height:\s*\d{3}vh/)
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
    // M17 pafta: defter satırı küçük bir bağlantı olmaktan çıkıp tam
    // satır yüzeyine dönüştü. Kaplama hâlâ var (`.cw-satir::after`) ama
    // asıl hedef satırın kendi yüksekliği.
    const k = kodu(hizmetler)
    expect(k).toContain('.cw-satir::after')
    const i = k.indexOf('.cw-link {')
    const govde = k.slice(i, k.indexOf('}', i))
    const m = govde.match(/min-height:\s*clamp\(([\d.]+)rem/)
    expect(m, 'cw-link min-height bulunamadı').not.toBeNull()
    expect(Number.parseFloat(m![1]) * 16).toBeGreaterThanOrEqual(44)
  })

  it('ilçe dizini kaplaması dikey pay taşıyor', () => {
    expect(kodu(dizin)).toContain('inset: -0.5rem 0')
  })

  it('görünen punto BÜYÜTÜLMEDİ — hedef kaplamayla çözüldü', () => {
    // Ad puntosu kütükten geliyor; bileşen kendi clamp'ini yazmıyor.
    // M17 pafta: hedef artık satır yüzeyinden geliyor, ayrı bir punto
    // tokenına gerek kalmadı. Korunan kural: bileşen dokunma hedefi için
    // puntoyu ŞİŞİRMİYOR — ad puntosu okuma kademesinde kalıyor.
    const kh = kodu(hizmetler)
    const j = kh.indexOf('.cw-ad {')
    const adGovde = kh.slice(j, kh.indexOf('}', j))
    const mm = adGovde.match(/font-size:\s*clamp\(([\d.]+)rem/)
    if (mm) expect(Number.parseFloat(mm[1])).toBeLessThan(3)
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
