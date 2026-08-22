// server/domain/regions/legacy.emeklilik.test.ts
//
// ESKİ TÜRKİYE BÖLGELERİNİN EMEKLİLİĞİ — SINIFLANDIRMA VE SINIRLAR.
//
// ─────────────────────────────────────────────────────────────────────────
// NEYİ KORUYOR
//
// Emeklilik kararı bir slug listesine değil, çalışma anında hesaplanan bir
// kurala dayanıyor. Bu dosya o kuralın üç sınırını çiviliyor:
//
//   1. Kapalı küme `istanbulIlcesiMi` ile türetiliyor — ikinci bir
//      sınıflandırma kuralı yok.
//   2. 39 İstanbul ilçesi kümenin DIŞINDA.
//   3. Özel `istanbul` kaydı kümenin DIŞINDA — adresi `/`'a yönlendiriliyor
//      ve o devir bu turda değişmedi.
//
// Ayrıca betiğin kendisi denetleniyor: elle yazılmış slug listesi kullanmıyor
// ve silme çağrısı içermiyor.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { istanbulIlcesiMi, ISTANBUL_IL_SLUG } from '../../../shared/utils/istanbul.ts'

const oku = (...p: string[]) => readFileSync(join(process.cwd(), ...p), 'utf8')

/** Betikteki kuralın birebir kopyası — testin kendi doğruluk kaynağı. */
const emekliAdayiMi = (k: { slug: string; cities: unknown; isActive: boolean }) =>
  k.isActive && !istanbulIlcesiMi(k) && k.slug !== ISTANBUL_IL_SLUG

// ═══════════════════════════════════════════ KAPALI KÜME KURALI

describe('kapalı küme türetimi', () => {
  const ilce = (slug: string) => ({ slug, cities: [34], isActive: true })
  const baskaIl = (slug: string, plaka: number) => ({ slug, cities: [plaka], isActive: true })

  it.each([
    ['kadikoy', 34],
    ['pendik', 34],
    ['arnavutkoy', 34],
    ['silivri', 34],
  ])('İstanbul ilçesi %s kümeye GİRMİYOR', (slug) => {
    expect(emekliAdayiMi(ilce(slug))).toBe(false)
  })

  it.each([
    ['ankara', 6],
    ['izmir', 35],
    ['bursa', 16],
    ['adana', 1],
    ['bornova', 35],
    ['cankaya', 6],
    ['nilufer', 16],
    ['gebze', 41],
  ])('İstanbul dışı %s kümeye GİRİYOR', (slug, plaka) => {
    expect(emekliAdayiMi(baskaIl(slug, plaka))).toBe(true)
  })

  it('özel `istanbul` kaydı kümeye GİRMİYOR', () => {
    expect(emekliAdayiMi({ slug: ISTANBUL_IL_SLUG, cities: [34], isActive: true })).toBe(false)
  })

  it('zaten pasif olan legacy kayıt kümeye GİRMİYOR — idempotent', () => {
    expect(emekliAdayiMi({ slug: 'sakarya', cities: [54], isActive: false })).toBe(false)
  })

  it('cities boşsa kayıt İstanbul ilçesi sayılmıyor, yani legacy', () => {
    expect(emekliAdayiMi({ slug: 'bilinmeyen', cities: [], isActive: true })).toBe(true)
  })

  it('cities metin olarak saklanmışsa da doğru çözümleniyor', () => {
    expect(emekliAdayiMi({ slug: 'kadikoy', cities: '[34]', isActive: true })).toBe(false)
  })
})

// ═══════════════════════════════════════════ BETİK DENETİMİ

describe('emeklilik betiği', () => {
  const betik = oku('prisma', 'legacy-bolge-emeklilik.mjs')
  const kod = betik.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

  it('sınıflandırmayı `istanbulIlcesiMi` ile yapıyor', () => {
    expect(kod).toContain('istanbulIlcesiMi')
    expect(kod).toContain('ISTANBUL_IL_SLUG')
  })

  it('elle yazılmış slug listesi YOK', () => {
    // Kod içinde art arda tırnaklı şehir adları geçmemeli.
    expect(kod).not.toMatch(/'ankara'/i)
    expect(kod).not.toMatch(/'izmir'/i)
    expect(kod).not.toMatch(/'bursa'/i)
  })

  it('silme çağrısı YOK', () => {
    expect(kod).not.toContain('delete')
    expect(kod).not.toContain('deleteMany')
    expect(kod).not.toMatch(/\bdrop\b/i)
    expect(kod).not.toMatch(/\btruncate\b/i)
  })

  it('toplu Prisma güncellemesi YOK — servis sözleşmesinden geçiyor', () => {
    expect(kod).not.toContain('updateMany')
    expect(kod).toContain('regionsService.update')
  })

  it('varsayılan KURU ÇALIŞTIRMA', () => {
    expect(kod).toContain("includes('--uygula')")
    // Bayrak yoksa yazma bloğuna girilmiyor.
    expect(kod).toContain('if (!uygula')
  })

  it('geri alınabilir', () => {
    expect(kod).toContain("includes('--geri-al')")
    expect(kod).toContain('legacy-bolge-emeklilik-kayit.json')
  })

  it('İstanbul tarafını sonradan doğruluyor', () => {
    expect(kod).toContain('ilceAktif === 39')
    expect(kod).toContain('ilAktif === 1')
  })
})

// ═══════════════════════════════════════════ /istanbul DEVRİ

describe('`/istanbul` semantiği değişmedi', () => {
  it('routeRules 301 yönlendirmesi duruyor', () => {
    const cfg = oku('nuxt.config.ts')
    expect(cfg).toContain('"/istanbul": { redirect: { to: "/", statusCode: 301 } }')
  })

  it('kök ad alanında rezerve', () => {
    const kok = oku('server', 'domain', 'shared', 'root-paths.ts')
    expect(kok).toContain("'istanbul', // routeRules → 301 /")
  })

  it('devredilmiş sahip kaydı duruyor', () => {
    const kok = oku('server', 'domain', 'shared', 'root-paths.ts')
    expect(kok).toContain('DEVREDILMIS_SAHIPLER')
    expect(kok).toContain("{ yol: 'istanbul', tur: 'bölge sayfası' }")
  })
})
