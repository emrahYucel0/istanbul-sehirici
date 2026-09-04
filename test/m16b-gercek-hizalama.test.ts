// test/m16b-gercek-hizalama.test.ts
//
// SİTE GENELİ İŞ GERÇEĞİ + YASAL GERÇEKLİK SÖZLEŞMESİ.
//
// ─────────────────────────────────────────────────────────────────────────
// NE OLDU
//
// M15B, doğrulanmış iş gerçeği sözleşmesini /hakkimizda ve /iletisim'e
// uyguladı. M16 denetimi aynı taahhüdün ON sayfada daha durduğunu ölçtü —
// ana sayfa 8×, yedi hizmet 2–9×, fiyat aracı 3×, hizmet dizini 3× — ve
// en görünür yerde: ana sayfanın meta açıklamasında.
//
//     "Erişim ve kat durumu keşifte yerinde ölçülür, fiyat yazılı verilir."
//
// Veri tabanında `Meta("home")` kaydı YOK; yani bu satır sessiz bir yedek
// değil, arama sonucunda, OG'de, Twitter kartında ve JSON-LD'de gerçekten
// basılan metindi.
//
// Ayrıca üç yasal metin, bu sitede bulunmayan bir ürünü anlatıyordu:
// Google AdSense, DoubleClick, ilgi alanına dayalı reklam, üyelik hesabı,
// SMS doğrulama, ödeme. Ölçüldü — 11 rotada çerez = 0, localStorage = 0,
// üçüncü taraf istek = 0.
//
// ─────────────────────────────────────────────────────────────────────────
// BU DOSYA NEYİ KORUYOR
//
// Canlı metinlerin çoğu veri tabanında; KANONİK hâlleri hizalama
// betiklerinde ve o betikler depoda. `test/iddia-taramasi.test.ts` ve
// `test/is-gercegi-sozlesmesi.test.ts` ile aynı desen: birim testine DB
// bağlantısı sokulmuyor, betiğin YAZACAĞI metin sınanıyor.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const kok = process.cwd()
const oku = (...p: string[]) => readFileSync(join(kok, ...p), 'utf8')
/** Yorumları atar: iddialar KOD için, gerekçe metni için değil. */
const kodu = (k: string) =>
  k.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ')
/** Türkçe büyük/küçük harf tuzağı: İ→i, I→ı. */
const kucult = (s: string) => s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase()

const m16b = oku('prisma', 'm16b-hizalama.mjs')
const politika = oku('prisma', 'politika-hizalama.mjs')
const meta = kodu(oku('app', 'utils', 'sayfa-meta.ts'))
const sonraki = kodu(oku('app', 'components', 'price', 'SonrakiAdim.vue'))
const hizmetGorunum = kodu(oku('app', 'components', 'article', 'ServiceView.vue'))
const politikaGorunum = oku('app', 'components', 'policy', 'View.vue')

/** Betiğin YAZACAĞI üç yasal metin — kaynak kodu değil, çıktı. */
const POLITIKA_METINLERI = [
  ...politika.matchAll(/^const (GIZLILIK|CEREZ|SARTLAR) = `([\s\S]*?)`$/gm),
].map((m) => m[2])

/** HTML metnini cümlelere böler. */
const cumleleri = (html: string) =>
  html.replaceAll(/<[^<>]*>/g, ' ').split(/(?<=[.?!:])\s+/).map((c) => c.trim()).filter(Boolean)

/** Cümlede bir olumsuzlama işareti var mı? */
const olumsuzMu = (c: string) =>
  ['kullanılmaz', 'yüklenmez', 'paylaşılmaz', 'bulunmaz', 'yoktur', 'yok.', 'gösterilmez',
   'toplanmaz', 'oluşmaz', 'alınmaz', 'istenmez', 'edilmez', 'yapılmaz', 'hiçbiri',
   'değildir', 'yazılmaz', 'kullanmaz', 'eklenmez'].some((o) => kucult(c).includes(o))

/** Hizalama betiklerinin YAZACAĞI metinler. */
const yeniMetinler = (kaynak: string) =>
  [...kaynak.matchAll(/\n\s*yeni:\s*\n?\s*(['"])([\s\S]*?)\1,\n/g)].map((m) => m[2])

/** Doğrulanmamış süreç taahhüdü sözcükleri. */
const KESIF_IZLERI = ['keşif', 'keşfi', 'keşfe', 'keşift', 'keşiften']
const YAZILI_IZLERI = ['yazılı olarak', 'yazılı verilir', 'yazıya dök', 'yazılı ve kesin']

// ═══════════════════════════════════════════ SEO KÜTÜĞÜ

describe('sayfa-meta kütüğü — arama sonucunda görünen metin', () => {
  /** Bir anahtarın kaydını kütükten kesip alır. */
  const kayit = (anahtar: string) => {
    const i = meta.indexOf(`anahtar: '${anahtar}'`)
    expect(i, `${anahtar} kütükte yok`).toBeGreaterThan(-1)
    const j = meta.indexOf("anahtar: '", i + 12)
    return meta.slice(i, j === -1 ? undefined : j)
  }

  it('ana sayfa koşulsuz keşif SÖYLEMİYOR', () => {
    // `Meta("home")` DB kaydı YOK → bu satır gerçekten basılıyor.
    const k = kucult(kayit('home'))
    for (const iz of KESIF_IZLERI) expect(k, iz).not.toContain(iz)
  })

  it('ana sayfa YAZILI FİYAT taahhüdü vermiyor', () => {
    const k = kucult(kayit('home'))
    for (const iz of YAZILI_IZLERI) expect(k, iz).not.toContain(iz)
    expect(k).not.toContain('fiyat yazılı')
  })

  it('ana sayfa tezini KORUYOR — yerine boşluk konmadı', () => {
    // İddia kaldırıldı diye sayfa kimliksiz kalmamalı: İstanbul ve
    // "koşullar fiyatı belirler" tezi duruyor.
    const k = kayit('home')
    expect(k).toContain('39 ilçesinde')
    expect(kucult(k)).toContain('koşulları belirliyor')
  })

  it('fiyat hesaplama açıklaması koşulsuz keşif söylemiyor', () => {
    const k = kucult(kayit('fiyat-hesaplama'))
    for (const iz of KESIF_IZLERI) expect(k, iz).not.toContain(iz)
  })

  it('hakkımızda yedeği de temiz (M15B korunuyor)', () => {
    const k = kucult(kayit('about'))
    for (const iz of KESIF_IZLERI) expect(k, iz).not.toContain(iz)
  })

  it('HİÇBİR sayfa varsayılanında doğrulanmamış iddia yok', () => {
    const t = kucult(meta)
    for (const yasak of [
      'ücretsiz keşif', 'sabit fiyat', 'kesin fiyat', 'fiyat garantisi',
      '%100', 'garantili', 'sigortalı taşıma', '7/24', 'en iyi',
    ]) {
      expect(t, yasak).not.toContain(yasak)
    }
  })
})

// ═══════════════════════════════════════════ KODA YAZILI METİNLER

describe('bileşenlerdeki süreç taahhütleri', () => {
  it('fiyat sayfası kapanışı keşif için gün AYIRMIYOR', () => {
    expect(sonraki).not.toContain('keşif için gün ayırıyoruz')
    for (const iz of KESIF_IZLERI) expect(kucult(sonraki), iz).not.toContain(iz)
  })

  it('fiyat kapanışı doğrulanmış ikiziyle aynı sözleşmeyi kullanıyor', () => {
    // `iletisim.form.note` M15B'de şu dile getirilmişti: tutarın NE ZAMAN
    // netleştiğini söyle, hangi ARAÇLA netleştiğini değil.
    expect(sonraki).toContain('taşıma koşulları değerlendirildikten sonra netleşiyor')
    // Bölüm yapısı korunuyor: künye, başlık, hizmet dizini bağlantısı.
    expect(sonraki).toContain('04 / SONRAKİ ADIM')
    expect(sonraki).toContain('/hizmetlerimiz')
  })

  it('hizmet detayı kapanışı zorunlu keşif vaat etmiyor', () => {
    // Bu cümle YEDİ hizmet sayfasının hepsinde basılıyor.
    for (const iz of KESIF_IZLERI) expect(kucult(hizmetGorunum), iz).not.toContain(iz)
    expect(hizmetGorunum).toContain('koşullar\n          konuşulduktan sonra netleşiyor')
  })
})

// ═══════════════════════════════════════════ SİTE GENELİ HİZALAMA BETİĞİ

describe('m16b hizalama betiği — yazılacak metinler', () => {
  const yeniler = yeniMetinler(m16b)

  it('kütük okunabildi', () => {
    expect(yeniler.length).toBeGreaterThanOrEqual(15)
    for (const m of yeniler) expect(m.length).toBeGreaterThan(2)
  })

  it('hiçbir yeni metin keşif taahhüdü taşımıyor', () => {
    for (const m of yeniler) {
      for (const iz of KESIF_IZLERI) expect(kucult(m), `${iz} → ${m.slice(0, 50)}`).not.toContain(iz)
    }
  })

  it('yerine yeni bir iddia konmadı', () => {
    for (const m of yeniler) {
      for (const yasak of [
        'yazılı', 'sözleşme', 'ücretsiz', 'garanti', 'sigortal',
        'kesin fiyat', 'sabit fiyat', '%100', '7/24', 'kesinlikle', 'her koşulda',
      ]) {
        expect(kucult(m), `${yasak} → ${m.slice(0, 46)}`).not.toContain(yasak)
      }
    }
  })

  it('süreç defterinin 01 adımı ZORUNLU KEŞİF değil', () => {
    // Keşif her işte yapılmıyor; beş adımlık operasyon defterinin ilk
    // adımı olarak durması onu zorunlu bir aşama gibi gösteriyordu.
    expect(m16b).toContain("yeni: 'ÖN DEĞERLENDİRME'")
    expect(m16b).toContain("eski: ['KEŞİF']")
  })

  it('01 adımı KOŞULLU dil kullanıyor — yerinde değerlendirme kapalı değil', () => {
    // Sözleşme "gerektiğinde yerinde değerlendirme"ye İZİN veriyor.
    const adim = yeniler.find((m) => m.includes('Hacim, kat, asansör kabini'))
    expect(adim).toBeDefined()
    expect(adim).toContain('netleşmiyorsa')
    expect(adim).toContain('yerinde değerlendiriliyor')
    // Ama koşulsuz ev ziyareti YOK.
    expect(kucult(adim!)).not.toContain('eve gelip')
  })

  it('"gerektiğinde yerinde değerlendirme" YENİ BİR KLİŞE olmadı', () => {
    // Her paragrafa serpiştirilseydi bir kalıp üretilmiş olurdu.
    const kac = yeniler.filter((m) => kucult(m).includes('yerinde değerlendir')).length
    expect(kac).toBeLessThanOrEqual(2)
  })

  it('kütükte tek kelime değişimi yapılmadı — cümleler yeniden kuruldu', () => {
    // "keşifte" → "önceden" gibi kör bir ikame, cümleyi anlamsız
    // bırakabilirdi. En az birkaç metnin yapısı gerçekten değişmeli.
    expect(m16b).toContain('TEK KELİME DEĞİŞİMİ YAPILMIYOR')
  })

  it('betik kendi ön kontrolünü taşıyor', () => {
    expect(m16b).toContain('ÖN KONTROL')
    expect(m16b).toContain('const YASAKLI')
    expect(m16b).toContain('process.exit(1)')
  })

  it('güvenli yazma: eski kuşak tanınmadan yazmıyor', () => {
    expect(m16b).toContain('ELLE YAZILMIŞ — EZİLMEDİ')
    expect(m16b).toContain('--dogrula')
    expect(m16b).toContain('YALNIZ_DOGRULA')
  })

  it('hizmet SSS cevapları da kapsamda — FAQPage şemasını besliyorlar', () => {
    expect(m16b).toContain('SSS_DEGISIMLERI')
    expect(m16b).toContain('FAQPage')
    // Yedi hizmetin altısında SSS cevabı düzeltildi.
    expect(m16b).toContain("slug: 'ofis-tasima'")
    expect(m16b).toContain("slug: 'paketleme-hizmeti'")
  })

  it('DOKUNULMAYANLAR kütükte yazılı', () => {
    expect(m16b).toContain('DOKUNULMAYAN')
    // Cevabı zaten koşullu olan SSS korunuyor.
    expect(m16b).toContain('SSS#82')
  })

  it('fiyat girişi cümlesinin uzunluğu ÖLÇÜLEREK seçildi', () => {
    // Uzatıldığında 834px'te satır ekliyor ve bilinen font metrik CLS
    // borcunu büyütüyor. Ölçüm tablosu kütükte duruyor ki ileride
    // "biraz daha açıklayıcı yapalım" denince sebep görünsün.
    expect(m16b).toContain('CLS @834')
    expect(m16b).toContain('BÜYÜTÜLMÜYOR')
  })
})

// ═══════════════════════════════════════════ YASAL METİNLER

describe('politika hizalama betiği — yasal gerçeklik', () => {
  it('hukuki tavsiye üretmediğini açıkça söylüyor', () => {
    expect(politika).toContain('HUKUKİ TAVSİYE ÜRETMİYOR')
    expect(politika).toContain('uzman incelemesi')
  })

  it('UYDURMA TÜZEL KİŞİLİK yok', () => {
    // Ticari unvan, vergi no, MERSİS, sicil BİLİNMİYOR.
    // YAZILACAK METİNLERDE aranıyor, betiğin kaynağında değil: betiğin
    // kendi `KESIN_YASAK` listesi bu kelimeleri zaten içeriyor ve orada
    // bulunmaları DOĞRU.
    for (const g of POLITIKA_METINLERI) {
      for (const yasak of ['ltd. şti', 'ltd.şti', 'a.ş.', 'mersis', 'vergi no', 'ticaret sicil']) {
        expect(kucult(g), yasak).not.toContain(yasak)
      }
    }
  })

  it('olmayan ürün davranışı YALNIZ olumsuzlama içinde geçiyor', () => {
    // Metnin amacı sitede OLMAYANI açıkça saymak ("hesap oluşturma …
    // bulunmaz"). Kör bir kelime yasağı bu doğru cümleyi de reddederdi —
    // betiğin kendi ön kontrolünde de aynı ayrım var.
    for (const g of POLITIKA_METINLERI) {
      for (const yasak of [
        'hesap oluştur', 'sms ile doğrulama', 'hesap aktivasyonu',
        'son 12 ayda', 'şifrenizin güvenliği', 'üye firma', 'hissedar',
        'yorum verileri', 'medya dosyaları', 'acil yardım',
      ]) {
        for (const c of cumleleri(g)) {
          if (!kucult(c).includes(yasak)) continue
          expect(olumsuzMu(c), `"${yasak}" olumsuzlamasız: ${c.slice(0, 90)}`).toBe(true)
        }
      }
    }
  })

  it('izleme araçları YALNIZ olumsuzlama içinde geçebilir', () => {
    // Metnin işi sitede OLMAYANI saymak; kör kelime yasağı bunu da
    // reddederdi. Betik bu ayrımı kendi ön kontrolünde yapıyor.
    expect(politika).toContain('YALNIZ_OLUMSUZ')
    expect(politika).toContain('OLUMSUZ_IZ')
    expect(politika).toContain('OLUMSUZLAMASIZ geçiyor')
  })

  it('geleceğe dönük MUTLAK garanti verilmiyor', () => {
    // Betikte bu kontrolün kendisi var…
    expect(politika).toContain('MUTLAK')
    // …ve YAZILACAK metinlerde mutlak taahhüt yok.
    for (const g of POLITIKA_METINLERI) {
      for (const m of ['hiçbir koşulda çerez', 'asla çerez', 'hiçbir zaman çerez']) {
        expect(kucult(g), m).not.toContain(m)
      }
    }
    // Metin yürürlükteki sürümden konuşuyor.
    expect(politika).toContain('yürürlükteki sürüm')
  })

  it('çerez metni ölçülen gerçeği anlatıyor', () => {
    const cerez = (politika.match(/^const CEREZ = `([\s\S]*?)`$/m) || [])[1] ?? ''
    expect(cerez).toContain('tarayıcınıza çerez yazılmaz')
    expect(cerez).toContain('localStorage')
    // Ölçülen sıfır izleme: araçlar ADIYLA sayılıyor ki iddia denetlenebilsin.
    for (const arac of ['Google Analytics', 'AdSense', 'Meta (Facebook) Pixel', 'Hotjar']) {
      expect(cerez, arac).toContain(arac)
    }
    expect(cerez).toContain('hiçbiri siteye yüklenmez')
  })

  it('yönetim çerezi ziyaretçi çerezi gibi sunulmuyor', () => {
    const cerez = (politika.match(/^const CEREZ = `([\s\S]*?)`$/m) || [])[1] ?? ''
    expect(cerez).toContain('Yönetim alanı')
    expect(cerez).toContain('Siteyi ziyaret eden hiç kimsede oluşmaz')
  })

  it('gizlilik metni GERÇEK veri akışını yazıyor', () => {
    const g = (politika.match(/^const GIZLILIK = `([\s\S]*?)`$/m) || [])[1] ?? ''
    // ContactLead sütunları
    for (const alan of ['Ad', 'Telefon', 'E-posta', 'Mesajınız']) expect(g, alan).toContain(alan)
    // M14C2 sunucu tarafı hesap özeti
    expect(g).toContain('sunucu tarafında doğrulanır')
    // IP yalnız hız sınırı
    expect(g).toContain('IP adresiniz veri tabanına yazılmaz')
    // Toplanmayanlar
    expect(g).toContain('user-agent')
  })

  it('UYGULANMAYAN saklama süresi YAZILMIYOR', () => {
    const g = (politika.match(/^const GIZLILIK = `([\s\S]*?)`$/m) || [])[1] ?? ''
    // Eski çerez metni "İletişim formları — 6 ay" diyordu; otomatik silme
    // işi YOK. Uygulanmayan süre taahhüt edilmemeli.
    expect(g).not.toMatch(/\b6 ay\b/)
    expect(g).toContain('otomatik silme mekanizması bulunmamaktadır')
  })

  it('güncelleme tarihi UYDURULMUYOR — gerçek koşu tarihi', () => {
    expect(politika).toContain('const BUGUN = new Date()')
    expect(politika).toContain('lastUpdated: BUGUN')
  })

  it('güvenli yazma: parmak izi tanınmadan ezmiyor', () => {
    expect(politika).toContain('TANINMAYAN METİN — EZİLMEDİ')
    expect(politika).toContain('izler:')
    expect(politika).toContain('--dogrula')
  })

  it('üç politikanın üçü de kütükte', () => {
    for (const s of ['gizlilik-politikasi', 'cerez-politikasi', 'kullanim-sartlari']) {
      expect(politika, s).toContain(`slug: '${s}'`)
    }
  })
})

// ═══════════════════════════════════════════ YASAL SAYFA KABUĞU

describe('politika görünümü — site diliyle aynı', () => {
  it('okuma ölçüsü site standardına çekildi', () => {
    // Eskisi 52rem (832px = 85ch); donmuş blog yazısı 623px basıyor.
    expect(politikaGorunum).toContain('max-width: 39rem')
    expect(politikaGorunum).not.toContain('max-width: 52rem')
  })

  it('ölçü biriminin NEDEN rem olduğu yazılı', () => {
    // `ch` kabın punto bağlamında çözülüyordu ve 64ch → 60ch metin veriyordu.
    expect(politikaGorunum).toContain('BİRİM NEDEN `ch` DEĞİL')
  })

  it('bölüm künyesi var ve mono', () => {
    expect(politikaGorunum).toContain('op-kunye')
    expect(politikaGorunum).toContain('YASAL /')
  })

  it('künye Türkçe versal kuralını uyguluyor', () => {
    // Varsayılan toUpperCase "Gizlilik" → "GIZLILIK" yapardı.
    expect(politikaGorunum).toContain("toLocaleUpperCase('tr-TR')")
  })

  it('başlık ortak tipografi kademesini kullanıyor', () => {
    expect(politikaGorunum).toContain('tip-baslik')
    // Sitede başka hiçbir başlıkta olmayan 800 ağırlığı kalktı.
    // Yorumlar atılıyor: kaldırıldığını ANLATAN satır da bu diziyi içeriyor.
    expect(kodu(politikaGorunum)).not.toContain('font-weight: 800')
  })

  it('tarih editoryal künye olarak basılıyor', () => {
    expect(politikaGorunum).toContain('SON GÜNCELLEME')
    expect(politikaGorunum).toContain('<time :datetime="sayfa.lastUpdated">')
  })

  it('kart / gölge / yuvarlaklık / gradyan EKLENMEDİ', () => {
    const stil = politikaGorunum.slice(politikaGorunum.indexOf('<style'))
    for (const yasak of ['box-shadow', 'border-radius', 'gradient', 'backdrop-filter']) {
      expect(stil, yasak).not.toContain(yasak)
    }
  })

  it('pazarlama CTA eklenmedi', () => {
    expect(politikaGorunum).not.toContain('op-eylem')
    expect(kucult(politikaGorunum)).not.toContain('teklif al')
  })
})

// ═══════════════════════════════════════════ ROTA SÖZLEŞMESİ

describe('yasal rota sözleşmesi korunuyor', () => {
  it('üç sayfa dosyası ve tek ortak görünüm', () => {
    for (const s of ['gizlilik-politikasi', 'kullanim-sartlari', 'cerez-politikasi']) {
      const sayfa = oku('app', 'pages', `${s}.vue`)
      expect(sayfa, s).toContain(`policy-view slug="${s}"`)
      expect(sayfa, s).toContain(`usePageSeo('${s}'`)
    }
  })

  it('sunucu yalnız bu üç slug\'ı kabul ediyor', () => {
    const servis = oku('server', 'domain', 'policies', 'policies.service.ts')
    expect(servis).toContain('GECERLI_SLUGLAR')
    for (const s of ['gizlilik-politikasi', 'kullanim-sartlari', 'cerez-politikasi']) {
      expect(servis, s).toContain(`'${s}'`)
    }
  })

  it('üçü de footer ve kök ad alanı kütüğünde', () => {
    const kokler = oku('server', 'domain', 'shared', 'root-paths.ts')
    for (const s of ['gizlilik-politikasi', 'kullanim-sartlari', 'cerez-politikasi']) {
      expect(kokler, s).toContain(`'${s}'`)
    }
  })
})
