// test/yorum-kaynak.test.ts
//
// YORUM DÖNGÜSÜNÜN KAYNAK DENETİMİ.
//
// ─────────────────────────────────────────────────────────────────────────
// ÜÇ ŞEYİ KORUYOR
//
//   1. SAHTE YEDEK YOK. Onaylı yorum yoksa sayfada uydurma isim, uydurma
//      puan ya da "5,0 / yüzlerce müşteri" gibi bir yedek görünmemeli.
//      Boş liste dürüst; sahte liste değil.
//   2. KENDİ YORUMUMUZDAN YILDIZ İŞARETLEMESİ YOK. Kendi sitesinde kendi
//      hakkındaki yorumları toplayan/onaylayan işletme, Google'ın review
//      snippet kuralına göre buna uygun değil. `aggregateRating` ve
//      `Review` düğümleri kaldırıldı ve geri gelmemeli.
//   3. ZİYARETÇİ METNİ HTML DEĞİL. Yorum hiçbir yerde `v-html` ile
//      basılmamalı.
//
// Test dosyaları OKUYOR. Kırıldığında söylediği şey nettir: biri bu üç
// kuraldan birini geri almış.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const oku = (...parcalar: string[]) =>
  readFileSync(join(process.cwd(), ...parcalar), 'utf8')

/** Yorum satırlarını atar — gerekçe metinleri eşleşme üretmesin. */
const kodu = (kaynak: string) =>
  kaynak
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/<!--[\s\S]*?-->/g, '')

const anasayfa = oku('app', 'pages', 'index.vue')
const bolum = oku('app', 'components', 'base', 'Yorumlar.vue')
const form = oku('app', 'components', 'base', 'ReviewForm.vue')

// ═══════════════════════════════════════════════ 1. YAPISAL VERİ

describe('kendi işletmemiz için Review/AggregateRating yapısal verisi YOK', () => {
  const kod = kodu(anasayfa)

  it.each(['aggregateRating', 'AggregateRating', '"@type": "Review"', 'reviewRating', 'reviewBody'])(
    '%s ana sayfa kodunda yok',
    (parca) => {
      expect(kod).not.toContain(parca)
    }
  )

  it('ratingValue / reviewCount alanları da üretilmiyor', () => {
    expect(kod).not.toContain('ratingValue')
    expect(kod).not.toContain('reviewCount')
  })

  it('kaldırma gerekçesi kodda YAZILI — bir sonraki kişi geri almasın', () => {
    // Gerekçesiz kaldırılan bir şey, ilk "yıldız neden yok?" sorusunda
    // geri gelir. Neden yazılı olmasa bu test de anlamsız olurdu.
    expect(anasayfa).toContain('self-serving review')
  })

  it('MovingCompany işaretlemesi DURUYOR — kural onu kapsamıyor', () => {
    expect(kod).toContain('"@type": "MovingCompany"')
    expect(kod).toContain('openingHoursSpecification')
    expect(kod).toContain('areaServed')
  })

  it('FAQPage işaretlemesi DURUYOR', () => {
    expect(kod).toContain('"@type": "FAQPage"')
    expect(kod).toContain('acceptedAnswer')
  })
})

// ═══════════════════════════════════════════════ 2. SAHTE YEDEK

describe('sahte yorum / uydurma puan yok', () => {
  const kod = kodu(bolum) + kodu(form)

  it.each([
    'binlerce',
    'yüzlerce',
    'mutlu müşteri',
    '%100',
    'memnuniyet',
    '5 yıldız',
    'en çok tercih',
  ])('doğrulanmamış iddia "%s" bölümde yok', (iddia) => {
    expect(kod.toLowerCase()).not.toContain(iddia.toLowerCase())
  })

  it('yedek puan sabiti yok — "5.0" / "5,0" hiçbir yerde yazılı değil', () => {
    expect(kod).not.toMatch(/["'>]\s*5[.,]0\s*["'<]/)
  })

  it('gömülü yorumcu adı yok — liste yalnız veriden geliyor', () => {
    // Sabit bir isim dizisi olsaydı bölüm veri gelmediğinde onu basardı.
    // Formdaki boş başlangıç değeri (`customerName: ''`) elbette serbest;
    // aranan şey DOLU bir isim, yani büyük harfle başlayan sabit bir dize.
    expect(kod).not.toMatch(/customerName\s*:\s*['"]\s*\p{Lu}/u)
    expect(kod).not.toMatch(/\bad\s*:\s*['"]\s*\p{Lu}/u)
  })

  it('boş durumda tek dürüst cümle var, uydurma yorum değil', () => {
    expect(bolum).toContain('Bu bölümde henüz yayınlanmış yorum yok.')
  })

  /**
   * ANA SAYFADA BOŞ BÖLÜM BASILMIYOR.
   *
   * Yukarıdaki cümle bileşenin kendi savunması ve orada KALIYOR: bölüm bir
   * gün başka bir yerden basılırsa uydurma yorum yerine dürüst bir cümle
   * görünsün. Ama ana sayfada basılması ayrı bir hata: ziyaretçiye bitmemiş
   * bir site gösteriyordu. Karar RENDER seviyesinde, bileşenin içinde değil.
   *
   * Koşul `items` uzunluğuna bağlı, `adet` sayacına değil — biri ekranda
   * basılan liste, diğeri uygun kayıtların tamamı; render kararı render
   * edilecek şeye bakmalı.
   */
  it('ana sayfa yorum bölümünü koşullu basıyor — yayınlanmış yorum yoksa hiç yok', () => {
    const kod = kodu(anasayfa)
    const i = kod.indexOf('<lazy-base-yorumlar')
    expect(i).toBeGreaterThan(-1)
    expect(kod.slice(i, kod.indexOf('/>', i))).toContain('v-if="yorumVar"')
    expect(kod).toMatch(/const yorumVar = computed\(\(\) =>[^)]*items/)
  })

  it('ortalama ve adet PROP olarak geliyor, bileşende hesaplanmıyor', () => {
    // İki yerde hesaplanan bir sayı zamanla ayrışır.
    expect(kodu(bolum)).not.toContain('reduce(')
    expect(kodu(bolum)).toContain('props.yorumlar.ortalama')
  })
})

// ═══════════════════════════════════════════════ 3. DÜZ METİN

describe('ziyaretçi metni düz metin olarak basılıyor', () => {
  // Gerekçe yorumları kuralın ADINI anıyor ("`v-html` kullanılmıyor");
  // aranan şey KODDA kullanımı, o yüzden yorumlar ayıklanıyor.
  it('yorum bölümünde `v-html` YOK', () => {
    expect(kodu(bolum)).not.toContain('v-html')
  })

  it('formda `v-html` YOK', () => {
    expect(kodu(form)).not.toContain('v-html')
  })

  it('yorum metni `{{ }}` ile basılıyor — Vue kaçış yapıyor', () => {
    expect(bolum).toContain('{{ y.metin }}')
  })

  it('ana sayfada `v-html` hiçbir yerde yok', () => {
    expect(kodu(anasayfa)).not.toContain('v-html')
  })
})

// ═══════════════════════════════════════════════ 4. TEK KAYNAK

describe('tek domain kaynağı', () => {
  it('bölüm kendi isteğini atmıyor — veri sayfa seviyesinden geliyor', () => {
    expect(bolum).not.toContain('useFetch(')
    expect(bolum).not.toContain('useAsyncData(')
  })

  it('form yalnız GÖNDERİM yapıyor, okuma değil', () => {
    expect(form).not.toContain('useFetch(')
    expect(form).toContain("method: 'POST'")
  })

  it('ana sayfa artık ayrı bir yorum isteği atmıyor — tek uçtan geliyor', () => {
    const kod = kodu(anasayfa)
    expect(kod).not.toContain('/api/reviews')
    expect(kod).toContain('/api/anasayfa')
  })

  it('gizli kırpma kuralı yok — liste sınırı `slice` ile saklanmıyor', () => {
    expect(kodu(bolum)).not.toMatch(/slice\(\s*0\s*,/)
    expect(kodu(anasayfa)).not.toMatch(/slice\(\s*0\s*,/)
  })
})

// ═══════════════════════════════════════════════ 5. FORM SÖZLEŞMESİ

describe('form ziyaretçiye doğru şeyi söylüyor', () => {
  it('"yayınlandı" DEMİYOR — moderasyon mesajı veriyor', () => {
    expect(form).toContain('Yorumunuz alındı ve yayınlanmadan önce incelenecek.')
    expect(kodu(form)).not.toContain('Yorumunuz yayınlandı')
  })

  it('çift gönderim engelli', () => {
    expect(form).toContain('if (gonderiliyor.value) return')
    expect(form).toContain(':disabled="gonderiliyor"')
  })

  it('hata durumunda alanlar SIFIRLANMIYOR', () => {
    // Sıfırlama yalnız başarı dalında; `catch` içinde form'a dokunulmuyor.
    const govde = kodu(form)
    const catchBlogu = govde.slice(govde.indexOf('} catch'), govde.indexOf('} finally'))
    expect(catchBlogu).not.toContain('form.value')
  })

  it('puan gerçek radio grubu — klavyeyle gezilebilir', () => {
    expect(form).toContain('type="radio"')
    expect(form).toContain('<fieldset')
    expect(kodu(form)).not.toContain('aria-pressed')
  })

  it('her alanın etiketi bağlı', () => {
    for (const id of ['yf-ad', 'yf-metin', 'yf-eposta']) {
      expect(form).toContain(`for="${id}"`)
      expect(form).toContain(`id="${id}"`)
    }
  })

  it('e-posta İSTEĞE BAĞLI ve yayınlanmadığı yazılı', () => {
    expect(form).toContain('isteğe bağlı, yayınlanmaz')
    // `required` yalnız ad ve yorumda.
    const epostaBloku = form.slice(form.indexOf('id="yf-eposta"'), form.indexOf('id="yf-eposta"') + 260)
    expect(epostaBloku).not.toContain('required')
  })
})

// ═══════════════════════════════════════════════ 6. GİZLİ ALAN

describe('özel alanlar public bileşene hiç gelmiyor', () => {
  it.each(['email', 'isApproved', 'source', 'location', 'serviceType', 'customerImage'])(
    '%s yorum bölümünde kullanılmıyor',
    (alan) => {
      expect(kodu(bolum)).not.toContain(alan)
    }
  )
})

// ═══════════════════════════════════════════════ 7. CANLI BÖLGE
//
// Gerçek tarayıcıda ölçüldü: `<output>` `v-if` ile korunuyordu, yani
// gönderim anında DOM'da HİÇ yoktu. Ekran okuyucular canlı bölgeyi içerik
// değiştiğinde okur; bölge o anda yaratılıyorsa değişimi kaçırabiliyorlar.
// Görsel kullanıcı "alındı" mesajını görüyor, ekran okuyucu kullanıcısı
// hiçbir şey duymuyordu.
describe('geri bildirim ekran okuyucuya ulaşıyor', () => {
  it('durum bölgesi koşulsuz basılıyor — `v-if` ile gizlenmiyor', () => {
    expect(form).toContain('<output class="yf-durum" aria-live="polite">')
    expect(form).not.toContain('<output v-if')
  })

  it('hata bölgesi de koşulsuz', () => {
    expect(form).toContain('<p class="yf-hata" role="alert">')
    expect(form).not.toContain('<p v-if="hata"')
  })

  it('boş bölgeler düzende yer kaplamıyor', () => {
    expect(form).toContain('.yf-durum:empty')
    expect(form).toContain('.yf-hata:empty')
  })
})

// ═══════════════════════════════════════════════ 8. BOŞ DURUM
//
// Public'e uygun yorum yoksa sayfada bir özet satırı, bir puan ya da bir
// örnek yorum GÖRÜNMEMELİ. Bölüm bunu üç ayrı koşulla sağlıyor ve üçü de
// burada korunuyor.
describe('boş durumda uydurma özet basılmıyor', () => {
  it('özet satırı yalnız `adet` doluyken basılıyor', () => {
    expect(bolum).toContain('<p v-if="adet" class="yr-ozet">')
  })

  it('liste yalnız kayıt varken basılıyor, yoksa boş durum cümlesi', () => {
    expect(bolum).toContain('<ul v-if="liste.length"')
    expect(bolum).toContain('<p v-else class="yr-bos">')
  })

  it('ortalama eşiği kodda ve tek yerde', () => {
    expect(bolum).toContain('const ORTALAMA_ESIGI = 3')
  })

  it('ortalama `adet` eşiğin altındayken null', () => {
    // Metin olarak: `adet >= ORTALAMA_ESIGI && props.yorumlar.ortalama`.
    expect(bolum).toContain('adet.value >= ORTALAMA_ESIGI && props.yorumlar.ortalama')
  })

  it('form boş durumda da basılıyor — liste koşulunun DIŞINDA', () => {
    const sablon = bolum.slice(bolum.indexOf('<template>'), bolum.indexOf('</template>'))
    const formSatiri = sablon.indexOf('<base-review-form')
    const bosSatiri = sablon.indexOf('class="yr-bos"')
    // Form, boş durum cümlesinden SONRA ve hiçbir `v-if`in içinde değil.
    expect(formSatiri).toBeGreaterThan(bosSatiri)
    expect(sablon.slice(formSatiri, formSatiri + 120)).not.toContain('v-if')
  })
})
