// server/middleware/mailRateLimit.test.ts
//
// HERKESE AÇIK YAZMA UÇLARININ IP SINIRI.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN BURADA TEST EDİLİYOR
//
// `/api/reviews` POST bilinçli olarak kimlik doğrulaması İSTEMİYOR:
// ziyaretçi yorum bırakabilmeli. Sınırsız bırakıldığında bir betik
// moderasyon kuyruğunu saniyeler içinde doldurabilir — yönetici gerçek
// yorumu sahtelerin arasında bulamaz hâle gelir. Sınır bu yüzden var ve
// çalıştığı ölçülmeli; "middleware dosyası duruyor" bir kanıt değil.
//
// Nitro global'leri (getRequestURL, getRequestIP, setHeader,
// defineEventHandler) gerçek bir sunucu dışında yok; testin ihtiyaç
// duyduğu davranışı üreten en küçük sahteleri burada enjekte ediyoruz.
// `createError` ve `useStorage` zaten test/setup.ts içinde mevcut.
import { beforeEach, describe, expect, it, vi } from 'vitest'

const basliklar: Record<string, string> = {}

vi.stubGlobal('defineEventHandler', (fn: any) => fn)
vi.stubGlobal('getRequestURL', (event: any) => new URL(`http://test${event.path}`))
vi.stubGlobal('getRequestIP', (event: any) => event.ip)
vi.stubGlobal('setHeader', (_event: any, ad: string, deger: string) => {
  basliklar[ad] = deger
})

// `isRateLimited` / `recordFailedAttempt` de Nitro auto-import'u; burada
// GERÇEK uygulamaları global'e konuyor — sahte bir sayaç yazmak testin
// kendi kendine doğru cevap vermesi olurdu. (server/utils/rateLimit.ts,
// test/setup.ts'in bellek içi unstorage sürücüsünü kullanıyor.)
const sayac = await import('../utils/rateLimit.ts')
vi.stubGlobal('isRateLimited', sayac.isRateLimited)
vi.stubGlobal('recordFailedAttempt', sayac.recordFailedAttempt)

const { testStorage } = await import('../../test/setup.ts')
const { default: rateLimit } = await import('./mailRateLimit.ts')

/** Sahte istek. `path` ve `ip` middleware'in okuduğu tek iki şey. */
const istek = (path: string, ip: string, method = 'POST') => ({ path, ip, method })

/** Sınıra takılırsa fırlatılan hatayı yakalar; takılmazsa null döner. */
const gonder = async (event: any) => {
  try {
    await rateLimit(event)
    return null
  } catch (e: any) {
    return e
  }
}

beforeEach(async () => {
  await testStorage.clear()
  for (const k of Object.keys(basliklar)) delete basliklar[k]
})

describe('/api/reviews — IP başına gönderim sınırı', () => {
  it('sınır 3 ve ZAYIFLATILMADI', async () => {
    const kaynak = await import('node:fs').then((fs) =>
      fs.readFileSync(new URL('./mailRateLimit.ts', import.meta.url), 'utf8')
    )
    expect(kaynak).toContain("'/api/reviews': { anahtar: 'yorum', sinir: 3")
  })

  it('ilk üç gönderim geçiyor, DÖRDÜNCÜSÜ 429', async () => {
    const ip = '203.0.113.10'
    for (const sira of [1, 2, 3]) {
      const hata = await gonder(istek('/api/reviews', ip))
      expect(hata, `${sira}. gönderim engellenmemeliydi`).toBeNull()
    }

    const dorduncu = await gonder(istek('/api/reviews', ip))
    expect(dorduncu).not.toBeNull()
    expect(dorduncu.statusCode).toBe(429)
    expect(dorduncu.statusMessage).toContain('Çok fazla yorum')
  })

  it('429 ile birlikte Retry-After başlığı gidiyor', async () => {
    const ip = '203.0.113.11'
    for (let i = 0; i < 4; i++) await gonder(istek('/api/reviews', ip))
    expect(Number(basliklar['Retry-After'])).toBeGreaterThan(0)
  })

  it('sayaç IP BAŞINA — bir ziyaretçi diğerini kilitlemiyor', async () => {
    for (let i = 0; i < 4; i++) await gonder(istek('/api/reviews', '203.0.113.12'))
    // Başka bir IP hâlâ yorum gönderebilmeli.
    expect(await gonder(istek('/api/reviews', '203.0.113.13'))).toBeNull()
  })

  it('okuma isteği sayaca GİRMİYOR — sayfayı açmak hakkı tüketmiyor', async () => {
    const ip = '203.0.113.14'
    for (let i = 0; i < 20; i++) await gonder(istek('/api/reviews', ip, 'GET'))
    expect(await gonder(istek('/api/reviews', ip))).toBeNull()
  })

  it('yorum sayacı iletişim formunun sayacından ayrı', async () => {
    const ip = '203.0.113.15'
    for (let i = 0; i < 4; i++) await gonder(istek('/api/reviews', ip))
    // Yorum sınırına takılan biri hâlâ teklif isteyebilmeli.
    expect(await gonder(istek('/api/leads', ip))).toBeNull()
  })

  it('sınırlı listede olmayan yol etkilenmiyor', async () => {
    for (let i = 0; i < 10; i++) {
      expect(await gonder(istek('/api/anasayfa', '203.0.113.16'))).toBeNull()
    }
  })
})
