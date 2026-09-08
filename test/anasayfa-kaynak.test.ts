// test/anasayfa-kaynak.test.ts
//
// TEK KAYNAK DENETİMİ — ANA SAYFA.
//
// ─────────────────────────────────────────────────────────────────────────
// NEYİ KORUYOR
//
// Aynı işletme metninin İKİ kopyası olduğu anda panel sahtedir: yönetici
// metni değiştirir, sayfa eski metni göstermeye devam eder ve kimse
// nedenini anlamaz. Bu yüzden M4'te taşınan metinler bileşenlerden
// TAMAMEN çıkarıldı — "veri gelmezse eski metni göster" biçiminde bir
// çalışma zamanı yedeği bırakılmadı.
//
// Test bileşen DOSYALARINI okuyor. Kırıldığında söylediği şey nettir:
// birisi taşınmış bir metni koda geri yazmış.
//
// ─────────────────────────────────────────────────────────────────────────
// STATİK OLANLAR KAPSAM DIŞI
//
// Künye numaraları ("01 / İSTANBUL'DA TAŞINMAK"), bölüm etiketleri, ızgara
// adları ve gezinme cümleleri BİLEREK kodda. Onlar tasarım dili; işletmenin
// düzenlemesi beklenen içerik değil. Aşağıda yalnız CMS'e taşınan alanlar
// aranıyor.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const oku = (dosya: string) =>
  readFileSync(join(process.cwd(), 'app', 'components', 'base', dosya), 'utf8')

/** Bileşen → artık dosyada BULUNMAMASI gereken metinler. */
const TASINAN: Record<string, string[]> = {
  'Hero.vue': [
    "İstanbul'da taşınmak, ölçülü bir iştir.",
    'Dar sokak, asansörsüz kat, dört katlı apartman.',
    'Her adres, taşınmadan önce dört soruyla ölçülür.',
    'ARAÇ ERİŞİMİ',
    'BİNA GİRİŞİ',
    'EŞYA HACMİ',
    'Aynı taşıma değil.',
    '/images/hero-istanbul.webp',
  ],
  'Kapsam.vue': [
    "İstanbul'un tamamında çalışıyoruz",
    'Erişim, bina ve giriş koşulları ilçeden ilçeye değişiyor.',
    'Beşiktaş',
    'Kadıköy',
    'Başakşehir',
  ],
  'UcIstanbul.vue': [
    'Aynı iş, üç ayrı İstanbul koşulu.',
    'DAR SOKAK',
    'KONTROLLÜ ERİŞİM',
    'Kat değişir. Yöntem değişir.',
    '/images/sahne-kat.webp',
    '/images/sahne-erisim.webp',
  ],
  // Adım etiketleri M5'te güncellendi: "SÖKÜM VE YÜKLEME" → "SÖKÜM & HAZIRLIK"
  // (yükleme 04'ün işi), "KAMYON" → "YÜKLEME & TAŞIMA" (araç bir nesne, adım
  // bir operasyon). Değerler `ProcessStep.label` alanında; liste güncel
  // etiketleri koruyor, eski etiketler de geri yazılmasın diye duruyor.
  'Surec.vue': [
    'Plan, operasyona böyle dönüşür.',
    'KEŞİF',
    'PAKETLEME',
    'SÖKÜM & HAZIRLIK',
    'YÜKLEME & TAŞIMA',
    'SÖKÜM VE YÜKLEME',
    'KAMYON',
    'YERLEŞİM',
    'Önce hareketi değil, koşulları çıkarırız.',
    'Hizmet kapsamımız',
    '/images/sahne-paketleme.webp',
  ],
  'Hizmetler.vue': [
    'Aynı operasyonun altı yetkinliği.',
    'Evden Eve Nakliyat',
    'Parça Eşya Taşıma',
    'Şehirlerarası Taşıma',
    'Mobilya Söküm ve Kurulum',
  ],
  'Fiyat.vue': [
    'Fiyat tek rakamdan başlamaz.',
    'Telefonda verilen rakam bir tahmindir',
    // Doğrulanmamış ticari/süreç iddiaları — geri yazılmasın.
    'Keşif sonrası fiyat yazılı veriliyor.',
    'yazılı olarak verilir',
    'ücretsiz keşif',
    'Ücretsiz keşif',
    'sabit fiyat',
    '%100',
    'ERİŞİM VE KAT',
    'SÖKÜM VE KURULUM',
    'Oda sayısı değil, gerçek hacim.',
  ],
  'Sorular.vue': [
    'Taşınmadan önce sorulanlar.',
    'Keşif şart mı, telefonda fiyat verilemiyor mu?',
    'Eşyalar sigortalı mı?',
    'Taşıma nakliyat sigortası kapsamında yapılıyor.',
  ],
  'Kapanis.vue': ['Adresi biliyorsanız, geri kalanını birlikte çıkarabiliriz.'],
}

/** Bileşen → dosyada KALMASI gereken statik tasarım metinleri. */
const STATIK_KALAN: Record<string, string[]> = {
  'Hero.vue': ["01 / İSTANBUL'DA TAŞINMAK"],
  // M17 pafta: sayaç etiketi "TOPLAM İLÇE" yerini "İLÇE / TEK OPERASYON AĞI"
  // künyesine bıraktı. Sözleşme aynı: bu metinler KODDA, CMS'te değil.
  'Kapsam.vue': ['AVRUPA YAKASI', 'ANADOLU YAKASI', 'İLÇE / TEK OPERASYON AĞI', 'Bölgelerimizi incele'],
  /**
   * KÜNYE NUMARALARI BENZERSİZ OLMALI — burada değildi.
   *
   * Yukarıdaki not "M17 pafta: bölüm sırası değişince künye numarası
   * 02 → 03 oldu" diyordu. Değişiklik UcIstanbul'a uygulanmış ama diziye
   * yayılmamış: Süreç de `03` basmaya devam etti, yani ana sayfada aynı
   * numara İKİ bölümde birden göründü.
   *
   * Doğru değer uydurulmadı, üç kaynak da aynı yeri gösteriyor:
   *   · `pages/index.vue` bölüm kütüğü → "02 ŞEHİR PLANI DEĞİŞTİRİR"
   *   · sayfadaki gerçek sıra (ölçüldü) → Hero · Kapsam · UcIstanbul ·
   *     Süreç · Hizmetler · Fiyat · Sorular
   *   · numaralı dizi 01, ?, 03, 04, 05 — boşluğa oturan tek değer 02
   *
   * Süreç'i 04'e kaydırmak da diziyi düzeltirdi ama Fiyat/Sorular'ı da
   * kaydırmayı gerektirirdi; en küçük ve kütükle uyumlu düzeltme bu.
   */
  'UcIstanbul.vue': ['02 / ŞEHİR PLANI DEĞİŞTİRİR'],
  'Surec.vue': ['03 / TAŞIMANIN İÇİNDE NE OLUYOR?'],
  // "Keşif sonrası fiyat yazılı veriliyor." BURADAN ÇIKARILDI, silinmedi:
  // aşağıdaki TASINAN listesine geçti. Cümle doğrulanmamış bir süreç
  // taahhüdüydü (teklifin her zaman YAZILI verildiği iddiası) ve bileşenden
  // kaldırıldı; korunması gereken şey artık geri gelmemesi.
  'Fiyat.vue': ['04 / KARAR VERMEDEN ÖNCE'],
}

describe('ana sayfa — taşınan içeriğin ikinci kopyası YOK', () => {
  for (const [dosya, metinler] of Object.entries(TASINAN)) {
    describe(dosya, () => {
      const kaynak = oku(dosya)
      // Dosyanın başındaki gerekçe yorumları taşınan metinlerden bahsedebiliyor
      // (ör. "eski başlık şuydu"); arama YALNIZ `<template>` bloğunda ve
      // script'in yorum dışı satırlarında yapılıyor.
      const govde = kaynak
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/<!--[\s\S]*?-->/g, '')

      it.each(metinler)('"%s" koda geri yazılmamış', (metin) => {
        expect(govde).not.toContain(metin)
      })
    })
  }
})

describe('ana sayfa — statik tasarım metinleri KODDA kaldı', () => {
  for (const [dosya, metinler] of Object.entries(STATIK_KALAN)) {
    it.each(metinler)(`${dosya}: "%s"`, (metin) => {
      expect(oku(dosya)).toContain(metin)
    })
  }
})

describe('ana sayfa — bileşenler kendi isteğini atmıyor', () => {
  // Sekiz bölüm ayrı ayrı `useFetch` çağırsaydı sunucu tarafında şelale
  // oluşurdu; veri sayfa seviyesinde TEK istekle alınıp prop olarak
  // geçiliyor.
  it.each(Object.keys(TASINAN))('%s içinde useFetch yok', (dosya) => {
    expect(oku(dosya)).not.toContain('useFetch(')
  })

  it('yalnız Site Ayarları bileşen içinden okunuyor (telefon)', () => {
    // Telefon ikinci kez saklanmıyor; ayarlar isteği anahtarla paylaşılıyor.
    expect(oku('Kapanis.vue')).toContain('useSiteSettings()')
  })

  it('Hero telefon YÜZEYİ değil — numara ne okunuyor ne de gömülü', () => {
    // Hero ilk sahnede sakin tutuluyor: eylem satırı yok. Kural şu ki
    // numara BİR YERDEN gelmeli; Hero onu göstermediği için ayarları da
    // okumuyor. Asıl korunan şey, numaranın koda kaçmaması.
    const hero = oku('Hero.vue')
    expect(hero).not.toContain('useSiteSettings()')
    expect(hero).not.toMatch(/0\d{3}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/)
    expect(hero).not.toContain('tel:')
  })
})

describe('ana sayfa — hizmet defteri tek envanterden', () => {
  const kaynak = oku('Hizmetler.vue')
  // Yorumlar hariç: dosyanın gerekçe bloğu kaldırılan kuralın adını anıyor.
  const kod = kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

  it('gizli iş kuralı yok — slice ile kırpma yapılmıyor', () => {
    // `slice(0, 6)` yazılsaydı yönetici hangi hizmetin neden görünmediğini
    // hiçbir ekranda göremezdi.
    expect(kod).not.toMatch(/slice\(\s*0\s*,/)
  })

  it('her satır gerçek detay rotasına bağlanıyor', () => {
    expect(kaynak).toContain('`/${h.slug}`')
    expect(kaynak).toContain('<NuxtLink :to="h.yol"')
  })
})

// ─────────────────────────────────────────────────────────────────────────
// HİZMET SAYISINA BAĞLI SABİT SAYI YOK
//
// Defter artık YAYINDAKİ hizmetleri listeliyor, yani satır sayısı veriyle
// değişiyor. Başlıkta ("… yedi yetkinliği") ya da bileşende bir rakam
// kalsaydı, bir hizmet yayından kaldırıldığı anda liste 7'den 6'ya
// inerken başlık eskir ve sayfa kendi kendisiyle çelişirdi. Sayı ne
// başlıkta ne kodda: hiçbir yerde.

/** Sayıyı metinle ifade eden Türkçe sözcükler ve rakamlar. */
const SAYI_SOZCUKLERI = [
  'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on',
  'onbir', 'on bir', 'yedisi', 'altısı',
]

/** Tohum betiğindeki bölüm başlıkları — içeriğin kanonik kaynağı. */
function tohumBasligi(sectionKey: string): string {
  const tohum = readFileSync(join(process.cwd(), 'prisma', 'anasayfa-icerik-tohum.mjs'), 'utf8')
  // İlgili bölüm bloğunu bulup içindeki ilk `heading` değerini al.
  const blok = tohum.slice(tohum.indexOf(`sectionKey: '${sectionKey}'`))
  const m = /heading:\s*'([^']*)'/.exec(blok)
  if (!m) throw new Error(`${sectionKey} bölümünün başlığı bulunamadı`)
  return m[1]
}

describe('hizmet sayısı hiçbir metne gömülmemiş', () => {
  const baslik = tohumBasligi('hizmetler')

  it('başlık tohumdan okunabiliyor (test kendi varsayımını doğruluyor)', () => {
    expect(baslik.length).toBeGreaterThan(10)
  })

  it('başlıkta RAKAM yok', () => {
    expect(baslik).not.toMatch(/\d/)
  })

  it.each(SAYI_SOZCUKLERI)('başlıkta "%s" sayı sözcüğü yok', (sozcuk) => {
    // Sözcük sınırıyla: "birlikte" ya da "onarım" gibi kelimeler yanlış
    // alarm vermesin.
    const kalip = new RegExp(`(^|[^\\p{L}])${sozcuk}([^\\p{L}]|$)`, 'iu')
    expect(kalip.test(baslik)).toBe(false)
  })

  it('bileşen şablonunda hizmet sayısına bağlı sabit metin yok', () => {
    const kaynak = oku('Hizmetler.vue')
    const sablon = kaynak.slice(kaynak.indexOf('<template>'), kaynak.indexOf('</template>'))
    const metin = sablon.replace(/<!--[\s\S]*?-->/g, '')

    // Şablonda basılan tek metin `{{ }}` içinden geliyor; düz yazı yok.
    expect(metin).not.toMatch(/yetkinli/)
    for (const sozcuk of ['altı', 'yedi', 'sekiz']) {
      expect(metin.toLowerCase()).not.toContain(sozcuk)
    }
  })

  it('başlık bölümün kendi gerekçesiyle aynı şeyi söylüyor', () => {
    // Metin zayıflatılmadı: bileşenin açılış yorumu zaten "aynı operasyonun
    // farklı yetkinlikleri" diyor. Başlık o cümleye döndü.
    expect(baslik).toContain('yetkinlikleri')
    // M17 pafta: bileşenin açılış yorumu aynı fikri yeni dilde söylüyor —
    // "BİR OPERASYON / ÇOK YETKİNLİK". Aranan şey cümlenin harfi harfine
    // hâli değil, başlığın bölümün kendi gerekçesiyle aynı şeyi söylemesi.
    const kaynakHizmetler = oku('Hizmetler.vue')
    expect(kaynakHizmetler).toContain('ÇOK YETKİNLİK')
    expect(kaynakHizmetler).toContain('operasyon yetenekleri')
  })
})

// ═══════════════════════════════════════════ KÜNYE NUMARALARI

/**
 * ANA SAYFADA AYNI BÖLÜM NUMARASI İKİ KEZ GÖRÜNEMEZ.
 *
 * Yaşandı: M17'de bölüm sırası değişince UcIstanbul'un künyesi 02'den
 * 03'e alındı ama Süreç de 03 basmaya devam etti. Ekranda hata yok,
 * derleme geçiyor, test geçiyordu — yalnız sayfayı okuyan biri aynı
 * numarayı iki bölümde görüyordu.
 *
 * Yukarıdaki `STATIK_KALAN` listesi her künyeyi TEK TEK sabitliyor; bu
 * iddia ise aralarındaki İLİŞKİYİ koruyor. Biri güncellenip diğeri
 * unutulursa burada kırılır.
 */
describe('bölüm künye numaraları benzersiz', () => {
  const NUMARALI = ['Hero.vue', 'UcIstanbul.vue', 'Surec.vue', 'Fiyat.vue', 'Sorular.vue']

  const numara = (dosya: string) => {
    // Şablondaki "NN / ETİKET" künyesi; yorum satırları elenmiş kaynakta.
    const kaynak = oku(dosya).replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ')
    const m = kaynak.match(/>\s*(\d{2}) \/ [^<]+</)
    return m ? m[1] : null
  }

  it.each(NUMARALI)('%s künyesini basıyor', (dosya) => {
    expect(numara(dosya), `${dosya}: künye numarası bulunamadı`).not.toBeNull()
  })

  it('numaralar tekrar etmiyor', () => {
    const bulunan = NUMARALI.map((d) => [d, numara(d)] as const)
    const sayilar = bulunan.map(([, n]) => n)
    const tekrar = sayilar.filter((n, i) => sayilar.indexOf(n) !== i)
    expect(tekrar, `tekrar eden numara: ${tekrar.join(', ')} — ${bulunan.map(([d, n]) => d + '=' + n).join(' · ')}`).toEqual([])
  })

  it('numaralar sayfa sırasını izliyor — artan', () => {
    // Dizi, bölümlerin sayfadaki gerçek sırası (ölçüldü).
    const sayilar = NUMARALI.map((d) => Number(numara(d)))
    for (let i = 1; i < sayilar.length; i++) {
      expect(sayilar[i], `${NUMARALI[i]} önceki bölümden küçük ya da eşit`).toBeGreaterThan(sayilar[i - 1]!)
    }
  })
})
