// test/hafif-yazi-sozlesmesi.test.ts
//
// HAFİF YAZI LİSTESİ — TEK SÖZLEŞME.
//
// ─────────────────────────────────────────────────────────────────────────
// NE OLDU
//
// `posts-light` anahtarı iki sayfada farklı seçeneklerle kullanılıyordu:
// blog dizini `transform` veriyordu, yakalayıcı rota vermiyordu. Nuxt
// önbelleği anahtar başına TEK kayıt tutuyor ve seçenekleri karşılaştırıyor
// (`nuxt/dist/app/composables/asyncData.js` → `createHash`: handler,
// transform, pick, getCachedData fonksiyonlarının KAYNAK METNİ hash'leniyor,
// `default` ise `toString()` ile kıyaslanıyor). İmzalar tutmayınca
// NUXT_E3004 çıkıyor ve ikinci çağıran önbellekteki yabancı şekli olduğu
// gibi alıyordu: blog dizini boşalıyordu.
//
// ─────────────────────────────────────────────────────────────────────────
// BU DOSYA NEYİ KORUYOR
//
//   1. Kanonik şekil: her durumda `HafifYazi[]`. Sarmalayıcı nesne dışarı
//      sızmıyor, `null` boş diziye iniyor.
//   2. Gezinmenin okuduğu alanlar (shortTitle / subtitle / createdAt)
//      listede kalıyor — eski `transform` bunları atıyordu.
//   3. ASIL KORUMA: iki çağrı da AYNI fonksiyon nesnelerini kullanıyor.
//      Nuxt'un karşılaştırdığı şey tam olarak bu; farklılaşırsa E3004 geri
//      gelir. İddia metne değil, fonksiyon kimliğine bakıyor.
//   4. Anahtar tek yerde yazılı: yeni bir tüketici kendi seçeneklerini
//      tanımlayarak çakışmayı yeniden açamıyor.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** `useAsyncData` çağrılarının yakalandığı yer. */
let cagrilar: Array<{ key: string; handler: () => unknown; options: any }> = []
let sonFetch: string | null = null

vi.stubGlobal('useAsyncData', (key: string, handler: () => unknown, options: any) => {
  cagrilar.push({ key, handler, options })
  return { data: { value: [] }, error: { value: null } }
})
vi.stubGlobal('$fetch', (url: string) => {
  sonFetch = url
  return Promise.resolve({ success: true, data: [{ title: 'A', slug: 'a' }] })
})

const { useLightPosts, normalizeLightPosts, LIGHT_POSTS_KEY } = await import(
  '~/composables/useLightPosts'
)

beforeEach(() => {
  cagrilar = []
  sonFetch = null
})

// ═══════════════════════════════════════════ KANONİK ŞEKİL

describe('kanonik şekil — her zaman dizi', () => {
  const yanit = (data: any) => ({ success: true, data })

  it('sarmalayıcı nesne dışarı sızmıyor', () => {
    const sonuc = normalizeLightPosts(yanit([{ title: 'Kış', slug: 'kis' }]))
    expect(Array.isArray(sonuc)).toBe(true)
    expect(sonuc).toHaveLength(1)
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['başarısız yanıt', { success: false, data: null }],
    ['boş veri', { success: true, data: null }],
  ])('%s → boş dizi', (_ad, girdi) => {
    expect(normalizeLightPosts(girdi as any)).toEqual([])
  })

  it('başlığı ya da adresi olmayan kayıt atlanıyor — bağlantı üretilemez', () => {
    const sonuc = normalizeLightPosts(
      yanit([
        { title: 'Tam', slug: 'tam' },
        { title: '   ', slug: 'bassiz' },
        { title: 'Adressiz', slug: '' },
        { title: 'Yok' },
      ])
    )
    expect(sonuc.map((y) => y.slug)).toEqual(['tam'])
  })

  it('başlık ve adres kırpılıyor — eşleşme boşluğa takılmasın', () => {
    const [y] = normalizeLightPosts(yanit([{ title: '  Kış  ', slug: '  kis  ' }]))
    expect(y.title).toBe('Kış')
    expect(y.slug).toBe('kis')
  })

  it('GEZİNMENİN OKUDUĞU ALANLAR KORUNUYOR', () => {
    // Eski `transform` bunları atıyordu; önceki/sonraki bağlantısı
    // `shortTitle`/`subtitle` etiketini ve `createdAt` sırasını okuyor.
    const [y] = normalizeLightPosts(
      yanit([
        {
          title: 'Uzun başlık',
          slug: 'uzun',
          shortTitle: 'Kısa',
          subtitle: 'Alt',
          createdAt: '2026-01-01T00:00:00.000Z',
          excerpt: 'özet',
        },
      ])
    )
    expect(y.shortTitle).toBe('Kısa')
    expect(y.subtitle).toBe('Alt')
    expect(y.createdAt).toBe('2026-01-01T00:00:00.000Z')
    expect(y.excerpt).toBe('özet')
  })
})

// ═══════════════════════════════════════════ SEÇENEK KİMLİĞİ

describe('iki çağıran AYNI seçenekleri paylaşıyor', () => {
  // Nuxt'un E3004 kontrolü tam olarak bunlara bakıyor. Metin karşılaştırması
  // değil, fonksiyon KİMLİĞİ karşılaştırılıyor: composable dışında yeniden
  // tanımlanan her seçenek bu iddiaları düşürür.
  it('aynı anahtar', () => {
    useLightPosts()
    useLightPosts(() => true)
    expect(cagrilar).toHaveLength(2)
    expect(cagrilar[0].key).toBe(LIGHT_POSTS_KEY)
    expect(cagrilar[1].key).toBe(LIGHT_POSTS_KEY)
  })

  it('aynı transform ve default fonksiyonu', () => {
    useLightPosts()
    useLightPosts(() => true)
    expect(cagrilar[0].options.transform).toBe(cagrilar[1].options.transform)
    expect(cagrilar[0].options.default).toBe(cagrilar[1].options.default)
    expect(cagrilar[0].options.transform).toBe(normalizeLightPosts)
  })

  it('handler kaynak metni atlama parametresinden BAĞIMSIZ', () => {
    // Nuxt handler'ı `Function.prototype.toString` ile hash'liyor. Atlama
    // kararı bir PARAMETRE olduğu için kaynak metin iki çağrıda da aynı.
    useLightPosts()
    useLightPosts(() => true)
    expect(cagrilar[0].handler.toString()).toBe(cagrilar[1].handler.toString())
  })

  it('pick / getCachedData verilmiyor — karşılaştırılan diğer iki seçenek', () => {
    useLightPosts()
    expect(cagrilar[0].options.pick).toBeUndefined()
    expect(cagrilar[0].options.getCachedData).toBeUndefined()
  })

  it('varsayılan HER ÇAĞRIDA YENİ dizi — paylaşılan dizi sızmıyor', () => {
    useLightPosts()
    const d = cagrilar[0].options.default
    expect(d()).toEqual([])
    expect(d()).not.toBe(d())
  })
})

// ═══════════════════════════════════════════ ATLAMA DALI

describe('atlama dalı', () => {
  it('atlanmıyorsa hafif uç noktaya tek istek', async () => {
    useLightPosts()
    const sonuc = await cagrilar[0].handler()
    expect(sonFetch).toBe('/api/posts?light=true')
    expect(normalizeLightPosts(sonuc as any)).toHaveLength(1)
  })

  it('atlanıyorsa istek HİÇ yapılmıyor ve sonuç boş dizi', async () => {
    useLightPosts(() => true)
    const sonuc = await cagrilar[0].handler()
    expect(sonFetch).toBeNull()
    expect(normalizeLightPosts(sonuc as any)).toEqual([])
  })
})

// ═══════════════════════════════════════════ TEK KAYNAK

describe('anahtar tek yerde tanımlı', () => {
  const kok = process.cwd()
  const kodu = (k: string) =>
    k.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ')

  const dosyalar: string[] = []
  const gez = (dizin: string) => {
    for (const ad of readdirSync(dizin)) {
      const yol = join(dizin, ad)
      if (statSync(yol).isDirectory()) gez(yol)
      else if (/\.(vue|ts)$/.test(ad)) dosyalar.push(yol)
    }
  }
  gez(join(kok, 'app'))

  it('composable dışında hiçbir dosya anahtarı yazmıyor', () => {
    const yazanlar = dosyalar
      .filter((y) => !y.endsWith('useLightPosts.ts'))
      .filter((y) => kodu(readFileSync(y, 'utf8')).includes(LIGHT_POSTS_KEY))
      .map((y) => y.slice(kok.length + 1).replace(/\\/g, '/'))
    expect(yazanlar).toEqual([])
  })

  it('hafif uç noktayı çağıran her yer ya composable ya da kanonikleştirici kullanıyor', () => {
    // Tek istisna `[...slug].vue` içindeki ikinci tur: oradaki ham `$fetch`
    // sonucu `normalizeLightPosts` ile aynı şekle indiriliyor.
    const kacaklar = dosyalar
      .filter((y) => !y.endsWith('useLightPosts.ts'))
      .filter((y) => {
        const k = kodu(readFileSync(y, 'utf8'))
        if (!k.includes('/api/posts?light=true')) return false
        return !k.includes('useLightPosts') && !k.includes('normalizeLightPosts')
      })
      .map((y) => y.slice(kok.length + 1).replace(/\\/g, '/'))
    expect(kacaklar).toEqual([])
  })

  it('iki tüketici de composable üzerinden geçiyor', () => {
    for (const yol of ['app/pages/blog.vue', 'app/pages/[...slug].vue']) {
      expect(kodu(readFileSync(join(kok, yol), 'utf8')), yol).toContain('useLightPosts(')
    }
  })
})
