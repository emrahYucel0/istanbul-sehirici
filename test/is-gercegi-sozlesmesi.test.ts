// test/is-gercegi-sozlesmesi.test.ts
//
// DOĞRULANMIŞ İŞ GERÇEĞİ SÖZLEŞMESİ.
//
// ─────────────────────────────────────────────────────────────────────────
// NE OLDU
//
// M15 denetimi /hakkimizda ve /iletisim metinlerinde üç süreç taahhüdü
// buldu; kullanıcı hepsini tek tek cevapladı:
//
//   her işte keşif yapılıyor mu?                 HAYIR
//   kapsam YAZILI olarak veriliyor mu?           EMİN DEĞİL
//   taşıma öncesi SÖZLEŞME imzalanıyor mu?       EMİN DEĞİL
//   taşıma günü tek muhatap oluyor mu?           EVET
//
// M15B bu üçünü metinden çıkardı, dördüncüyü korudu.
//
// ─────────────────────────────────────────────────────────────────────────
// BU DOSYA NEYİ KORUYOR
//
// Canlı metinlerin çoğu veri tabanında; ama KANONİK hâlleri
// `prisma/is-gercegi-hizalama.mjs` içinde yazılı ve o dosya depoda. Aynı
// desen `test/iddia-taramasi.test.ts` içinde fiyat notu için kullanılıyor:
// birim testine DB bağlantısı sokulmuyor, tohumun yazacağı metin
// sınanıyor. Böylece iddia oraya geri sızarsa burada yakalanıyor.
//
// Ek olarak: taahhüdün KODA yazılmış hâlleri (dört karar kütüğü, bölüm
// künyesi, SEO yedeği) doğrudan taranıyor.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const kok = process.cwd()
const oku = (...p: string[]) => readFileSync(join(kok, ...p), 'utf8')
/** Yorumları atar: iddialar KOD için, gerekçe metni için değil. */
const kodu = (k: string) =>
  k.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ')

const tohum = oku('prisma', 'is-gercegi-hizalama.mjs')
const yontem = kodu(oku('app', 'components', 'about', 'Yontem.vue'))
const saha = kodu(oku('app', 'components', 'about', 'Saha.vue'))
const meta = kodu(oku('app', 'utils', 'sayfa-meta.ts'))

/** Türkçe büyük/küçük harf tuzağı: İ→i, I→ı. */
const kucult = (s: string) => s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase()

/** Tohumun YAZACAĞI metinler — `yeni:` alanlarının değerleri. */
const yeniMetinler = [...tohum.matchAll(/\n\s*yeni:\s*\n?\s*(['"])([\s\S]*?)\1,\n/g)].map((m) => m[2])

// ═══════════════════════════════════════════ TOHUMUN YAZACAĞI METİN

describe('veri tabanına yazılacak metinler', () => {
  it('dokuz alanın metni okunabildi', () => {
    // Biçim değişirse iddia sessizce boşalmasın.
    expect(yeniMetinler.length).toBe(9)
    for (const m of yeniMetinler) expect(m.length).toBeGreaterThan(10)
  })

  it('KOŞULSUZ KEŞİF taahhüdü yok', () => {
    // "Her işte keşif yapılıyor mu?" → HAYIR.
    for (const m of yeniMetinler) expect(kucult(m), m.slice(0, 50)).not.toContain('keşif')
  })

  it('YAZILI KAPSAM taahhüdü yok', () => {
    // "Kapsam yazılı olarak veriliyor mu?" → EMİN DEĞİL.
    for (const m of yeniMetinler) {
      expect(kucult(m), m.slice(0, 50)).not.toContain('yazılı')
      expect(kucult(m), m.slice(0, 50)).not.toContain('yazıya dök')
    }
  })

  it('SÖZLEŞME taahhüdü yok', () => {
    // "Sözleşme imzalanıyor mu?" → EMİN DEĞİL.
    for (const m of yeniMetinler) expect(kucult(m), m.slice(0, 50)).not.toContain('sözleşme')
  })

  it('yerine yeni bir iddia konmadı', () => {
    for (const m of yeniMetinler) {
      const alan = kucult(m)
      for (const yasak of [
        'ücretsiz', 'garanti', 'sigortal', 'kesin fiyat', 'sabit fiyat',
        '%100', 'kesinlikle', 'her koşulda', '7/24', 'en iyi', 'en uygun',
      ]) {
        expect(alan, `${yasak} → ${m.slice(0, 46)}`).not.toContain(yasak)
      }
    }
  })

  it('tohum kendi ön kontrolünü taşıyor', () => {
    // Betik yazmadan önce yeni metinleri kendisi tarıyor; bu kilit,
    // ileride eklenen bir alanın taramadan kaçmasını engelliyor.
    expect(tohum).toContain('ÖN KONTROL')
    expect(tohum).toContain('const YASAKLI')
  })

  it('tanınan eski metinler kütükte duruyor — güvenli yazma bozulmasın', () => {
    // Eski kuşaklar silinirse tohum "elle yazılmış" sanıp hiçbir şey
    // yazmaz ve iddia sessizce ekranda kalır.
    expect(tohum).toContain('Keşifte ne kayda geçiyor?')
    expect(tohum).toContain('sözleşmede belirtiliyor')
    expect(tohum).toContain('yazıya dökmek')
  })
})

// ═══════════════════════════════════════════ KODA YAZILI TAAHHÜTLER

describe('bileşenlerdeki taahhütler', () => {
  it('dört karar kütüğünde yazılı kayıt taahhüdü yok', () => {
    // 04'ün YAPISI korunuyor; kalkan tek şey belge iması.
    expect(yontem).not.toContain('sözlü kalmıyor')
    expect(yontem).not.toContain('DEĞİŞENİ YAZ')
    // Dört karar duruyor.
    for (const e of ['ÖNCE ADRES, SONRA RAKAM', 'KAPSAMI AYIR', 'KISITI ÖNCEDEN ÇÖZ']) {
      expect(yontem).toContain(e)
    }
    expect((yontem.match(/no: '0\d'/g) || []).length).toBe(4)
  })

  it('bölüm künyesi yerinde ziyaret ima etmiyor', () => {
    expect(saha).not.toContain('SAHADA NEYE BAKIYORUZ')
    expect(saha).toContain('03 / ')
  })

  it('SEO yedeği de koşulsuz keşif söylemiyor', () => {
    // Panelde Meta kaydı yoksa bu satır arama sonucuna çıkıyor.
    const i = meta.indexOf("anahtar: 'about'")
    const j = meta.indexOf("anahtar: 'services'")
    expect(i).toBeGreaterThan(-1)
    expect(kucult(meta.slice(i, j))).not.toContain('keşif')
  })
})

// ═══════════════════════════════════════════ KORUNAN GERÇEK

describe('doğrulanmış gerçek korunuyor', () => {
  it('"tek muhatap" tohumda DEĞİŞTİRİLMİYOR', () => {
    // `description3` hizalama kütüğünde HİÇ yok: dokunulmuyor.
    expect(tohum).not.toContain("alan: 'description3'")
    expect(tohum).toContain('tek muhatabınız')
  })

  it('dört ölçüm kalemi hizalama kütüğünde yok — yapı korunuyor', () => {
    // Etiketler aranıyor, `items` anahtarı değil: o kelime betiğin kendi
    // "DOKUNULMAYAN" satırında geçiyor ve orada geçmesi DOĞRU.
    for (const etiket of ['EŞYA ENVANTERİ', 'ERİŞİM ÖLÇÜSÜ', 'ÖZEL PARÇA', 'TAKVİM KISITI']) {
      expect(tohum, etiket).not.toContain(etiket)
    }
    // Kütükteki alan adları yalnız metin alanları; `items` yazılmıyor.
    expect(tohum).not.toMatch(/alan:\s*'items'/)
  })
})

// ═══════════════════════════════════════════ TELEFON ADRESİ

describe('tel: adresi tek kaynaktan — E.164', () => {
  const AKTIF = [
    ['navbar', ['app', 'components', 'fixed', 'Navbar.vue']],
    ['alt bilgi', ['app', 'components', 'fixed', 'Footer.vue']],
    ['iletişim kanalları', ['app', 'components', 'contact', 'Kanallar.vue']],
    ['talep formu', ['app', 'components', 'contact', 'TalepFormu.vue']],
    ['kapanış imzası', ['app', 'components', 'base', 'Kapanis.vue']],
  ] as Array<[string, string[]]>

  it.each(AKTIF)('%s kanonik yardımcıyı kullanıyor', (_ad, parcalar) => {
    expect(kodu(oku(...parcalar))).toContain('telefonYolu(')
  })

  it.each(AKTIF)('%s satır içi normalizasyon KOPYALAMIYOR', (_ad, parcalar) => {
    // Eski desen `tel:${...replace(/[^\d+]/g, '')}` yerel biçim üretiyordu
    // (`tel:05355298192`) ve yurt dışı SIM'inde çevrilemiyordu.
    expect(kodu(oku(...parcalar))).not.toMatch(/`tel:\$\{/)
  })

  it('yardımcı E.164 üretiyor ve tek yerde tanımlı', () => {
    const k = oku('app', 'utils', 'kapanis.ts')
    expect(k).toContain('export function telefonYolu')
    expect(k).toContain("return `tel:+90${ham.slice(1)}`")
  })
})

// ═══════════════════════════════════════════ FORM SINIRLARI

describe('mesaj alanı sınırı istemci ve sunucuda AYNI', () => {
  const form = kodu(oku('app', 'components', 'contact', 'TalepFormu.vue'))
  const uc = kodu(oku('server', 'api', 'leads.ts'))

  it('istemci 4000 karakterde durduruyor', () => {
    expect(form).toMatch(/\.max\(4000,/)
    expect(form).toContain('maxlength="4000"')
  })

  it('sunucu sınırı DEĞİŞMEDİ', () => {
    expect(uc).toContain('message: yup.string().trim().max(4000)')
  })

  it('hata mevcut mekanizmadan geçiyor — yeni canlı bölge yok', () => {
    expect(form).toContain('aria-invalid')
    expect(form).toContain('hataliyaOdaklan')
    // `<output>` ya da ikinci bir aria-live eklenmedi.
    expect((form.match(/aria-live/g) || []).length).toBe(1)
  })
})

describe('gönderim yeniden giriş koruması', () => {
  const form = kodu(oku('app', 'components', 'contact', 'TalepFormu.vue'))

  it('devam eden gönderimde erken dönüyor', () => {
    expect(form).toContain('if (isSubmitting.value) return')
  })

  it('kilit KALICI değil — finally serbest bırakıyor', () => {
    expect(form).toMatch(/finally\s*\{[\s\S]*?isSubmitting\.value = false/)
  })
})

// ═══════════════════════════════════════════ HAZIRLIK KÜTÜĞÜ

describe('hazırlık kütüğü devirde tekrar istemiyor', () => {
  const form = kodu(oku('app', 'components', 'contact', 'TalepFormu.vue'))

  it('bilinen madde devirde listeden düşüyor', () => {
    expect(form).toContain("const DEVIRDE_BILINEN = 'KAT VE ASANSÖR'")
    expect(form).toContain('props.hesapAlanlari ? HAZIRLIK.filter')
  })

  it('normal ziyarette beş maddenin beşi de var', () => {
    for (const e of ['ÇIKIŞ ADRESİ', 'VARIŞ ADRESİ', 'KAT VE ASANSÖR', 'EŞYA KAPSAMI', 'TAŞINMA TARİHİ']) {
      expect(form, e).toContain(e)
    }
  })

  it('rozet / onay kutusu / "alındı" durumu eklenmedi', () => {
    for (const yasak of ['alındı', 'rozet', 'badge', 'checkbox']) {
      expect(kucult(form), yasak).not.toContain(kucult(yasak))
    }
  })
})
