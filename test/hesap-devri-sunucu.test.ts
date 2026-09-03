// test/hesap-devri-sunucu.test.ts
//
// HESAPLAYICI BAĞLAMININ SAHİBİ SUNUCU — SÖZLEŞME.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN VAR
//
// Bağlam önce formun mesaj kutusuna ön dolgu olarak konuyordu. Kutu
// DÜZENLENEBİLİR: kullanıcı metni silerse `ContactLead.message` artık
// hesaplayıcıda gerçekten ne seçildiğini göstermiyordu — yani kaydın
// doğruluğu kullanıcının silme kararına bağlıydı.
//
// Artık istemci yalnız HAM SEÇİMLERİ yolluyor ve kayda giren metni sunucu
// üretiyor. Bu dosya o mimarinin geri kaymasını engelliyor.
//
// NİTELİK: rota dosyası Nitro global'lerine bağlı olduğu için burada
// ÇALIŞTIRILMIYOR (aynı gerekçe vitest.config.ts başlığında yazılı);
// sınanan şey kaynak sözleşmesi. Davranışın kendisi `#shared` birim
// testleriyle (app/utils/fiyat-devri.test.ts) ve gerçek POST QA'siyle
// doğrulandı.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const kok = process.cwd()
const oku = (...p: string[]) => readFileSync(join(kok, ...p), 'utf8')
/** Yorumları atar: iddialar KOD için, gerekçe metni için değil. */
const kodu = (k: string) =>
  k.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ')

const rota = oku('server', 'api', 'leads.ts')
const k = kodu(rota)
const paylasilan = oku('shared', 'utils', 'fiyat-devri.ts')
const form = kodu(oku('app', 'components', 'contact', 'TalepFormu.vue'))
const sayfa = kodu(oku('app', 'pages', 'iletisim.vue'))

// ═══════════════════════════════════════════ TEK SÖZLEŞME

describe('doğrulama tek yerden — istemci ve sunucu aynı fonksiyonu çağırıyor', () => {
  it('sunucu paylaşılan doğrulayıcıyı içe aktarıyor', () => {
    expect(k).toContain("from '#shared/utils/fiyat-devri'")
    expect(k).toContain('fiyatDevriniOku')
    expect(k).toContain('devirEtiketleriniCoz')
    expect(k).toContain('devirOzeti')
  })

  it('sunucuda ikinci bir ayrıştırıcı YOK', () => {
    // Sayı/mantık okuma paylaşılan dosyada; burada tekrar yazılırsa iki
    // uç zamanla ayrışır.
    expect(k).not.toMatch(/parseInt\s*\(/)
    expect(k).not.toMatch(/cikisAsansor\s*===\s*'1'/)
  })

  it('paylaşılan dosya çerçevesiz — sunucuda çalışabilir', () => {
    for (const yasak of ["from 'vue'", "from '#app'", 'useRoute(', 'document.', 'window.']) {
      expect(paylasilan, yasak).not.toContain(yasak)
    }
  })

  it('sabit oda/mesafe listesi yok — kimlikler veri tabanından çözülüyor', () => {
    expect(k).toContain('priceEstimatorCrudService.get()')
    expect(k).toContain('veri.sizes')
    expect(k).toContain('veri.distances')
  })
})

// ═══════════════════════════════════════════ GÜVEN SINIRI

describe('istemciden gelen hiçbir metne güvenilmiyor', () => {
  it('şema yalnız dokuz ham alanı tanıyor', () => {
    const i = k.indexOf('hesap: yup')
    expect(i).toBeGreaterThan(-1)
    const blok = k.slice(i, i + 900)
    for (const alan of [
      'kaynak',
      'oda',
      'mesafe',
      'cikisKat',
      'cikisAsansor',
      'varisKat',
      'varisAsansor',
      'paketleme',
      'depolama',
    ]) {
      expect(blok, alan).toContain(`${alan}:`)
    }
    // Etiket ve tutar şemada YOK; `stripUnknown` onları zaten düşürüyor.
    for (const yasak of ['odaAdi', 'mesafeAdi', 'label', 'alt:', 'ust:', 'taban', 'carpan']) {
      expect(blok, yasak).not.toContain(yasak)
    }
  })

  it('kayda FİYAT yazılmıyor — sunucu tutar hesaplamıyor', () => {
    expect(k).not.toContain('tahminiAralik')
    expect(k).not.toContain('tlYaz')
    expect(paylasilan).not.toContain('tahminiAralik')
  })

  it('ham seçimler kayda girmiyor', () => {
    expect(k).toContain('delete veri.hesap')
  })

  it('kanonik özet kullanıcının notunun ÜSTÜNE ekleniyor, ezmiyor', () => {
    expect(k).toContain('devirliMesaj(hesapOzeti, veri.message ?? \'\')')
  })

  it('geçersiz bağlam talebi düşürmüyor, istisna atmıyor', () => {
    // `hesapOzetiniCoz` null dönüyor; akış devam ediyor.
    expect(k).toContain('return null')
    expect(k).not.toMatch(/hesap[\s\S]{0,200}throw createError/)
  })
})

// ═══════════════════════════════════════════ KAYNAK ATFI

describe('kaynak alanı', () => {
  it('doğrulanmış bağlamda sunucu sabiti yazılıyor', () => {
    expect(k).toContain('veri.sourcePage = DEVIR_KAYNAK_SAYFASI')
  })

  it('/fiyat-hesaplama istemciden geldiğinde düşürülüyor', () => {
    // Talep formu yalnız /iletisim'de; bu değeri istemci meşru olarak
    // bildiremez. Elle hazırlanmış POST ile ölçüldü.
    expect(k).toContain("veri.sourcePage?.trim() === DEVIR_KAYNAK_SAYFASI")
    expect(k).toContain('veri.sourcePage = DEVIR_HEDEFI')
  })

  it('yol süzgeci duruyor', () => {
    expect(k).toContain('yoluSuz(veri.sourcePage)')
    expect(k).toContain('GUVENLI_YOL')
  })

  it('istemci kaynağı seçmiyor — yalnız bulunduğu yolu bildiriyor', () => {
    expect(form).toContain('sourcePage: route.path')
    expect(form).not.toContain('DEVIR_KAYNAK_SAYFASI')
  })
})

// ═══════════════════════════════════════════ MESAJ KUTUSU

describe('mesaj kutusu kullanıcının kendi notuna ait', () => {
  it('ön dolgu YOK', () => {
    expect(form).not.toContain('initial-values')
    expect(sayfa).not.toContain('devirMesaji')
  })

  it('forma sekiz yeni alan eklenmedi', () => {
    for (const yasak of ['name="oda"', 'name="mesafe"', 'name="cikisKat"', 'name="paketleme"']) {
      expect(form, yasak).not.toContain(yasak)
    }
  })

  it('sayfa ham alanları geçiriyor, metin değil', () => {
    expect(sayfa).toContain('devirAlanlari(')
    expect(form).toContain('hesap: props.hesapAlanlari')
  })
})
