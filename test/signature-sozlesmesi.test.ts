// test/signature-sozlesmesi.test.ts
//
// İKİ SIGNATURE ANI — TAŞINAN KOREOGRAFİNİN SÖZLEŞMESİ.
//
// ─────────────────────────────────────────────────────────────────────────
// BU DOSYA NEYİ KORUYOR
//
// PASS C2'de Hero ve Üç İstanbul koreografileri yan projedeki onaylı
// uygulamadan taşındı. Taşınan şey yalnız "bir efekt" değil, SAYILAR:
// sahne uzunlukları, takeover ölçek rampası, ölçüm sıkıştırma adımları,
// panelin gecikmesi ve karelerin çekilme konumları. Bunlardan biri elle
// değiştirilirse ekranda hata çıkmaz — yalnız hareket referanstan ayrışır
// ve bunu fark etmek için iki dosyayı yan yana açmak gerekir.
//
// Ayrıca üretime özgü DÖRT uyarlama var; onlar da geri alınmamalı:
//   1. içerik CMS'ten geliyor (referans sabit metin/görsel taşıyordu)
//   2. H1 iki parçalı ama TEK etiket: tam CMS başlığı sr-only, görünen
//      display satırı aria-hidden (artwork "İSTANBUL" kelimesini taşıyor)
//   3. LCP kurulumu (eager + fetchpriority) korunuyor
//   4. kadraj odakları ÜRETİM kaynaklarından okunuyor (referansın kareleri
//      farklı; `97% 50%` bizim karemizde boş duvara denk geliyor)
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const oku = (...p: string[]) => readFileSync(join(process.cwd(), ...p), 'utf8')
const hero = oku('app', 'components', 'base', 'Hero.vue')
const uc = oku('app', 'components', 'base', 'UcIstanbul.vue')

/** Yorumları atar: iddialar KOD için, açıklama metni için değil. */
const kodu = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/<!--[\s\S]*?-->/g, ' ')

/** Bir keyframes bloğunun gövdesini döndürür. */
const kare = (kaynak: string, ad: string) => {
  const k = kodu(kaynak)
  const i = k.indexOf(`@keyframes ${ad} {`)
  expect(i, `${ad} bulunamadı`).toBeGreaterThan(-1)
  let derinlik = 0
  for (let j = k.indexOf('{', i); j < k.length; j++) {
    if (k[j] === '{') derinlik++
    else if (k[j] === '}') {
      derinlik--
      if (!derinlik) return k.slice(i, j + 1)
    }
  }
  throw new Error(`${ad} kapanmıyor`)
}

const sayilar = (govde: string, kalip: RegExp) =>
  [...govde.matchAll(kalip)].map((m) => Number.parseFloat(m[1]))

/**
 * Bir seçicinin gövdesini döndürür. Aynı seçici mobil / tablet / masaüstü
 * bloklarında birden çok kez geçtiği için ARANAN ÖZELLİĞİ taşıyan kural
 * seçilir; yoksa iddia sessizce yanlış bloğa bakar.
 */
const kural = (kaynak: string, secici: string, ozellik: string) => {
  const k = kodu(kaynak)
  const re = new RegExp(String.raw`(^|[\s,}])` + secici.replace('.', String.raw`\.`) + String.raw`\s*\{`, 'gm')
  for (const m of k.matchAll(re)) {
    const bas = k.indexOf('{', m.index!)
    const son = k.indexOf('}', bas)
    const govde = k.slice(bas, son)
    if (govde.includes(ozellik)) return govde
  }
  throw new Error(`${secici} içinde "${ozellik}" taşıyan kural yok`)
}

// ═══════════════════════════════════════════ SIGNATURE #1 · HERO

describe('Signature #1 — afiş → takeover → ölçüm bandı', () => {
  const k = kodu(hero)
  const kadraj = kare(hero, 'jr-kadraj-sikisma')

  it('sahne 440vh ve koreografi %88’de bitiyor — kalanı final HOLD', () => {
    // 440 × %88 ≈ 387vh: referans koreografinin hızı korunuyor. Son %12,
    // panel tam yerleşmeden sonraki bölümün sahneye girmesini engelliyor.
    expect(k).toContain('height: 420vh')
    expect(k).toContain('animation-range: contain 0% contain 93.5%')
  })

  it('AFİŞ tam sahne: görsel navbar altından kenardan kenara', () => {
    const g = kural(hero, '.jr-gorsel', 'width: 100vw')
    expect(g).toContain('position: absolute')
    expect(g).toContain('inset: 0')
    expect(g).toContain('height: 100%')
    expect(kural(hero, '.jr-sahne', 'position: sticky')).toContain('top: var(--sahne-navbar)')
  })

  it('ÖLÇÜM sıkıştırması dört adım — genişlik korunuyor, yalnız dikey kırpma', () => {
    // Kırpma SİMETRİK DEĞİL: alt kenar bandı panele bağlıyor (8/18/28/36),
    // üst kenar daha az kırpılıyor (6/13/19/22) — simetrikken sahnenin üst
    // %36'sı boş kâğıt kalıyordu (1920×958'de 322px).
    const ust = sayilar(kadraj, /inset\((\d+)% 0 \d+% 0\)/g)
    const alt = sayilar(kadraj, /inset\(\d+% 0 (\d+)% 0\)/g)
    expect(ust).toEqual([6, 13, 19, 22])
    expect(alt).toEqual([8, 18, 28, 36])
    // Üst kırpma HER adımda alttan küçük olmalı; tersi boşluğu geri getirir.
    ust.forEach((u, i) => expect(u).toBeLessThan(alt[i]))
    // Yatay kırpma YOK: bant her zaman sahne genişliğinde.
    expect(kadraj).not.toMatch(/inset\(\d+% [1-9]/)
  })

  it('sıkıştırma metin çıktıktan SONRA başlıyor — üst üste binmiyor', () => {
    expect(kadraj).toMatch(/0%,\s*70%/)
    // İki başlık satırı zıt yönlere çıkıyor; ikisi de %56'da sahneyi terk
    // ediyor, sıkıştırma %70'te başlıyor. Aradaki %14 "artwork tek başına".
    expect(kare(hero, 'jr-sehir-kay')).toMatch(/56%,\s*100%/)
    expect(kare(hero, 'jr-alt-baslik-kay')).toMatch(/56%,\s*100%/)
  })

  it('kadraj nefesi yumuşak: ölçek tek yönlü ve küçük', () => {
    const olcek = sayilar(kare(hero, 'jr-foto-kadraj'), /scale\(([\d.]+)\)/g)
    expect(olcek).toEqual([1, 1.025, 1.055])
    for (let i = 1; i < olcek.length; i++) expect(olcek[i]).toBeGreaterThan(olcek[i - 1])
  })

  it('ölçü çizgileri kadrajın kenarlarını izliyor', () => {
    // Her çizgi KENDİ kenarını izliyor; asimetrik kırpmada bu ayrım şart.
    expect(sayilar(kare(hero, 'jr-olcu-ust'), /top:\s*(\d+)%/g)).toEqual([6, 13, 19, 22])
    expect(sayilar(kare(hero, 'jr-olcu-alt'), /bottom:\s*(\d+)%/g)).toEqual([8, 18, 28, 36])
  })

  it('panel kadrajdan SONRA geliyor — tek darbe değil', () => {
    const panel = kare(hero, 'jr-panel-kay')
    expect(panel).toMatch(/0%,\s*90%/)
    expect(sayilar(panel, /translate3d\(0, ([\d.]+)%, 0\)/g)).toEqual([105, 38])
    expect(panel).toMatch(/99%,\s*100%\s*\{\s*transform:\s*translate3d\(0, 0, 0\)/)
  })

  it('kapanış satırı en sonda bağlanıyor', () => {
    expect(kare(hero, 'jr-kapanis-kay')).toMatch(/0%,\s*93%/)
  })

  it('opaklıkla belirme YOK', () => {
    expect(k).not.toMatch(/opacity/)
  })

  it('iki katmanlı koruma yerinde', () => {
    expect(hero).toContain('@supports (animation-timeline: view())')
    expect(hero).toContain('prefers-reduced-motion: no-preference')
  })

  it('mobilde pin YOK — yapışkanlık yalnız ≥1280 sorgusunda', () => {
    expect(k.indexOf('position: sticky')).toBeGreaterThan(k.indexOf('@media (min-width: 1280px)'))
  })

  // ---- ÖLÇÜLMÜŞ İKİ HATANIN KİLİDİ ----

  it('MOBİL ölçek hareketi masaüstüne SIZMIYOR', () => {
    // Sorgusuz hâlinde bu kural masaüstünde de geçerliydi: `.jr-gorsel`
    // kendi `--jr-mobil` çizelgesinde scale(0.9467)'te donuyor, tam sahne
    // afişin ve final bandın her yanında kâğıt payı kalıyordu
    // (ölçüldü: 1920'de 51px, 1440'ta 38px).
    expect(k).toContain('@media (max-width: 1279px) and (prefers-reduced-motion: no-preference)')
    const i = k.indexOf('animation-name: jr-mobil-gorsel')
    const sorgu = k.lastIndexOf('@media (max-width: 1279px)', i)
    expect(sorgu, 'jr-mobil-gorsel genişlik sorgusu dışında kalmış').toBeGreaterThan(-1)
  })

  it('NAVBAR PAYI: hero sayfanın ilk bölümü, başlık navbarın altında kalmıyor', () => {
    // `#icerik` y=0'dan başlıyor ve sticky navbar ilk 56–57px'i boyuyor.
    // Pay olmadan "İSTANBUL" navbarın ALTINDA kalıyordu (ölçüldü: 390'da
    // 48px, 834'te 54px görünmez). Diğer sayfalarda sorun yok.
    expect(kural(hero, '.jr-sahne', 'padding:')).toContain('var(--sahne-navbar)')
  })

  it('SATIR PAYI: iki H1 satırı çakışmıyor', () => {
    // `line-height: 0.76` satır kutusunu mürekkepten kısa yapıyor; pay
    // olmadan iki satır üst üste biniyordu (390'da 11px, 1024'te 28px).
    expect(kural(hero, '.jr-h1-sehir', 'line-height: 0.76')).toContain('margin-bottom: 0.2em')
  })

  it('BÜYÜK BAŞLIK mobilde içerik kutusuna sığıyor', () => {
    // `white-space: nowrap` sarmayı engelliyor; katsayı ölçülen orandan
    // türetildi (21vw'de 390'da 77px taşıyordu).
    expect(kodu(hero)).toContain('clamp(3.4rem, 16.5vw, 6.4rem)')
  })

  it('boyanamayan ayraç geri gelmedi', () => {
    // `.jr-hero` `overflow: clip`; negatif `bottom` ile konan `::after`
    // saç çizgisi hiç boyanmıyordu. Ayrım perde payının kendisi.
    expect(k).not.toContain('.jr-hero::after')
    expect(k).toContain('margin-bottom: var(--sahne-perde)')
  })

  // ---- üretim uyarlamaları ----

  it('TEK semantik H1 — iki görsel satır, tek etiket', () => {
    // "İstanbul" + "Evden Eve Nakliyat" aynı H1'in iki parçası. İkisi de
    // CMS başlığından TÜRETİLİYOR; sr-only kopya ya da ikinci H1 yok.
    expect((hero.match(/<h1/g) || []).length).toBe(1)
    expect(hero).toContain('id="hero-baslik"')
    expect(hero).toContain('class="jr-h1-sehir"')
    expect(hero).toContain('class="jr-h1-alt"')
    expect(hero).toContain('{{ baslikParcalari.sehir }}')
    expect(hero).toContain('{{ baslikParcalari.alt }}')
    expect(kodu(hero)).not.toContain('aria-hidden="true">{{')
  })

  it('içerik CMS sahipli — sabit metin/görsel yok', () => {
    // Başlık `bolum.heading`den TÜRETİLİYOR (ikiye bölünüyor); gövde, görsel
    // ve ölçülen koşullar doğrudan CMS'ten. Bileşende sabit yol / yedek metin
    // yok — panelde değişen şey ekranda da değişir.
    expect(hero).toContain('props.bolum.heading')
    expect(hero).toContain(':src="bolum.imagePath"')
    expect(hero).toContain(':alt="bolum.imageAlt"')
    expect(hero).toContain('props.bolum.items')
    expect(hero).toContain('{{ bolum.lead }}')
    expect(k).not.toContain('/images/')
    expect(k).not.toContain('/yuklemeler/')
  })

  it('LCP kurulumu korunuyor', () => {
    expect(hero).toContain('loading="eager"')
    expect(hero).toContain('fetchpriority="high"')
    expect(hero).toMatch(/sizes="[^"]*xl:100vw/)
  })
})

// ═══════════════════════════════════════════ SIGNATURE #2 · ÜÇ İSTANBUL
//
// Bölüm 02 oturum dışında yeniden yazıldı: üç koşul artık dış görselle değil,
// bileşene GÖMÜLÜ vektör diyagramlarla anlatılıyor. Aşağıdaki iddialar o yeni
// gerçeği koruyor — eski `imagePath` sözleşmesi geçersiz.

describe('Signature #2 — üç koşul, gömülü diyagram', () => {
  it('içerik CMS sahipli — metin kodda kopyalanmıyor', () => {
    // 02 artık dış görsel KULLANMIYOR: üç koşul bileşenin içine gömülü
    // vektör diyagramlarla anlatılıyor (oturum dışında değiştirildi).
    // Görsel gitse de METİN sahipliği aynı kalmalı.
    expect(uc).toContain('{{ bolum.heading }}')
    expect(uc).toContain('{{ bolum.lead }}')
    expect(uc).toContain('o.label')
    expect(uc).toContain('o.title')
    expect(uc).toContain('o.body')
    expect(uc).toContain('{{ ilceler.toplam }}')
  })

  it('dış görsel bağımlılığı yok — diyagramlar gömülü vektör', () => {
    // Gömülü SVG rasterin üç sorununu birden kaldırıyor: 4K'da net,
    // bayt yok, kırık dosya yolu riski yok.
    expect(uc).toContain('<svg')
    expect(kodu(uc)).not.toContain('/yuklemeler/')
    expect(kodu(uc)).not.toContain('.webp')
  })

  it('sahne sayısı ÜÇ — kompozisyon dördüncüyü kaldırmaz', () => {
    const k = kodu(uc)
    for (const n of [1, 2, 3]) expect(k).toContain(`.ui-alan .ui-kare:nth-child(${n})`)
    expect(k).not.toContain('.ui-alan .ui-kare:nth-child(4)')
  })
})
