// server/domain/shared/root-paths.test.ts
//
// KÖK AD ALANI — BİÇİM VE ÇAKIŞMA.
//
// Bu proje adresleri DÜZ tutuyor: yazı, bölge, hizmet ve mahalle sayfaları
// `/blog/...` gibi bir önek almadan doğrudan kökte yayınlanıyor. Çözümleyici
// (`app/pages/[...slug].vue`) aralarında bir SIRA kuruyor — statik → yazı →
// bölge → hizmet → mahalle — ama o bir çözümleme sırası, koruma değil: aynı
// adresi iki kayıt alırsa biri sessizce gölgede kalır ve sitemap ikisini de
// bildirmeye devam eder.
//
// Buradaki testler o çakışmanın YAZMA ANINDA engellenmesini koruyor.
import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  post: { findMany: vi.fn() },
  region: { findMany: vi.fn() },
  service: { findMany: vi.fn() },
  neighborhood: { findMany: vi.fn() },
}))

vi.mock('../../utils/prisma.ts', () => ({ default: prismaMock }))

import {
  DEVREDILMIS_SAHIPLER,
  HERKESE_ACIK_KOK_SAYFALAR,
  IC_KOK_ADRESLER,
  KOK_SLUG_KALIBI,
  STATIK_KOK_ADRESLER,
  kokAdresleriTopla,
  kokCakismasiniBul,
  kokYolunuNormallestir,
  kokYoluDenetle,
  slugBiciminiDenetle,
} from './root-paths.ts'

/** Veri tabanını boş kabul eden varsayılan; testler gerektiğinde eziyor. */
beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.post.findMany.mockResolvedValue([])
  prismaMock.region.findMany.mockResolvedValue([])
  prismaMock.service.findMany.mockResolvedValue([])
  prismaMock.neighborhood.findMany.mockResolvedValue([])
})

// ───────────────────────────────────────────────────────────── biçim

describe('slugBiciminiDenetle — geçerli adresler', () => {
  it.each(['pendik', 'evden-eve-nakliyat', '2026-tasinma-rehberi', 'a1', 'kaynarca-mahallesi'])(
    '"%s" kabul ediliyor',
    (slug) => {
      expect(slugBiciminiDenetle(slug)).toBeNull()
      expect(KOK_SLUG_KALIBI.test(slug)).toBe(true)
    }
  )
})

describe('slugBiciminiDenetle — reddedilenler', () => {
  it.each([
    ['büyük harf', 'Evden-Eve', 'büyük harf'],
    ['boşluk', 'evden eve', 'boşluk'],
    ['Türkçe karakter', 'sisli-şişli', 'Türkçe/aksanlı karakter'],
    ['baştaki tire', '-pendik', 'baştaki tire'],
    ['sondaki tire', 'pendik-', 'sondaki tire'],
    ['art arda iki tire', 'pendik--nakliyat', 'art arda iki tire'],
    ['sorgu dizesi', 'pendik?x=1', ''],
    ['alt çizgi', 'pendik_merkez', ''],
    ['nokta', 'sitemap.xml', ''],
  ])('%s reddediliyor', (_etiket, slug, beklenenNeden) => {
    const hata = slugBiciminiDenetle(slug)
    expect(hata).not.toBeNull()
    if (beklenenNeden) expect(hata).toContain(beklenenNeden)
  })

  it('eğik çizgi reddediliyor — normalleştirme BAŞTAKİNİ atıyor, ortadaki kalıyor', () => {
    // "/pendik" → "pendik": baştaki eğik çizgi bir yol gösterimi, hata değil.
    expect(slugBiciminiDenetle('/pendik')).toBeNull()
    // "pendik/merkez" gerçek bir iç içe adres talebi; düz ad alanında yeri yok.
    expect(slugBiciminiDenetle('pendik/merkez')).toContain('eğik çizgi')
  })

  it('boş adres reddediliyor', () => {
    expect(slugBiciminiDenetle('')).toBe('Adres (slug) boş olamaz.')
    expect(slugBiciminiDenetle('   ')).toBe('Adres (slug) boş olamaz.')
    expect(slugBiciminiDenetle(null)).toBe('Adres (slug) boş olamaz.')
  })

  it('hata metni kuralı söylüyor ve SORUNU adlandırıyor', () => {
    // Sunucu yanlış slug'ı başka bir slug'a ÇEVİRMİYOR, reddediyor;
    // yönetici neyin yanlış olduğunu okuyabilmeli.
    const hata = slugBiciminiDenetle('Evden Eve')
    expect(hata).toContain('küçük harf, rakam')
    expect(hata).toContain('büyük harf')
    expect(hata).toContain('boşluk')
  })

  it('boşluk YANLIŞLIKLA "Türkçe karakter" diye raporlanmıyor', () => {
    // Aksi hâlde yönetici olmayan bir sorunu arardı.
    expect(slugBiciminiDenetle('evden eve')).not.toContain('Türkçe')
    expect(slugBiciminiDenetle('şişli')).toContain('Türkçe')
  })
})

describe('kokYolunuNormallestir', () => {
  it.each([
    ['/pendik', 'pendik'],
    ['//pendik', 'pendik'],
    ['  pendik  ', 'pendik'],
    [' /pendik ', 'pendik'],
    [null, ''],
    [undefined, ''],
  ])('%s → "%s"', (girdi, beklenen) => {
    expect(kokYolunuNormallestir(girdi)).toBe(beklenen)
  })

  it('baştaki eğik çizgi farkı çakışmayı KAÇIRMIYOR', () => {
    // Mahalle `canonicalPath`, diğerleri `slug` tutuyor. İki gösterim tek
    // biçime indirilmezse "/pendik" ile "pendik" ayrı adres sanılırdı.
    const kume = {
      hepsi: new Set(['pendik']),
      mahalleler: new Set<string>(),
      disKaynaklar: new Set(['pendik']),
      sahip: new Map([['pendik', 'bölge sayfası']]),
      etiketler: new Map([['pendik', 'Pendik']]),
    }
    expect(kokCakismasiniBul(kume, '/pendik')).not.toBeNull()
  })
})

// ─────────────────────────────────────────────────── statik rota listesi

describe('statik kök adresler', () => {
  it('herkese açık sayfalar ile iç adresler ÖRTÜŞMÜYOR', () => {
    const kesisim = HERKESE_ACIK_KOK_SAYFALAR.filter((x) => IC_KOK_ADRESLER.includes(x))
    expect(kesisim).toEqual([])
  })

  it('birleşik listede tekrar yok', () => {
    expect(new Set(STATIK_KOK_ADRESLER).size).toBe(STATIK_KOK_ADRESLER.length)
  })

  it('yönetim ve prototip rotaları HERKESE AÇIK listede DEĞİL', () => {
    // §9: bunlar rezerve ama herkese açık içerik sayılmıyorlar.
    for (const ic of ['admin', 'evdeneveyonetim', 'prototip', 'api']) {
      expect(HERKESE_ACIK_KOK_SAYFALAR).not.toContain(ic)
      expect(IC_KOK_ADRESLER).toContain(ic)
    }
  })
})

// ────────────────────────────────────────────────────── küme toplama

describe('kokAdresleriTopla', () => {
  beforeEach(() => {
    prismaMock.post.findMany.mockResolvedValue([{ slug: 'kis-aylarinda-tasinmak', title: 'Kış' }])
    prismaMock.region.findMany.mockResolvedValue([{ slug: 'pendik', title: 'Pendik Nakliyat' }])
    prismaMock.service.findMany.mockResolvedValue([{ slug: 'esya-depolama', title: 'Depolama' }])
    prismaMock.neighborhood.findMany.mockResolvedValue([
      { id: 5, canonicalPath: 'kaynarca-mahallesi', name: 'Kaynarca' },
    ])
  })

  it('dört aileyi ve statik rotaları TEK kümede topluyor', async () => {
    const k = await kokAdresleriTopla()
    for (const yol of ['hakkimizda', 'kis-aylarinda-tasinmak', 'pendik', 'esya-depolama', 'kaynarca-mahallesi']) {
      expect(k.hepsi.has(yol)).toBe(true)
    }
  })

  it('adresi tutan TÜR ve ETİKET raporlanıyor', async () => {
    const k = await kokAdresleriTopla()
    expect(k.sahip.get('pendik')).toBe('bölge sayfası')
    expect(k.etiketler.get('pendik')).toBe('Pendik Nakliyat')
    expect(k.sahip.get('hakkimizda')).toBe('statik sayfa')
    expect(k.etiketler.has('hakkimizda')).toBe(false)
  })

  it('mahalleler `disKaynaklar` DIŞINDA — M1 kapısı bu ayrımı kullanıyor', async () => {
    const k = await kokAdresleriTopla()
    expect(k.disKaynaklar.has('kaynarca-mahallesi')).toBe(false)
    expect(k.mahalleler.has('kaynarca-mahallesi')).toBe(true)
    expect(k.disKaynaklar.has('pendik')).toBe(true)
  })

  it('haricMahalleId verilen kayıt kümeye girmiyor', async () => {
    const k = await kokAdresleriTopla({ haricMahalleId: 5 })
    expect(k.hepsi.has('kaynarca-mahallesi')).toBe(false)
  })

  it('haricHizmetlerinTumu bütün hizmetleri düşürüyor — sorgu bile atılmıyor', async () => {
    const k = await kokAdresleriTopla({ haricHizmetlerinTumu: true })
    expect(k.hepsi.has('esya-depolama')).toBe(false)
    expect(prismaMock.service.findMany).not.toHaveBeenCalled()
  })

  it.each([
    ['haricYaziSlug', { haricYaziSlug: 'kis-aylarinda-tasinmak' }, 'kis-aylarinda-tasinmak'],
    ['haricBolgeSlug', { haricBolgeSlug: 'pendik' }, 'pendik'],
    ['haricHizmetSlug', { haricHizmetSlug: 'esya-depolama' }, 'esya-depolama'],
  ])('%s kendi kaydını kümeden çıkarıyor', async (_e, secenek, yol) => {
    const k = await kokAdresleriTopla(secenek)
    expect(k.hepsi.has(yol)).toBe(false)
  })
})

describe('kokAdresleriTopla — TASLAKLAR DA REZERVE', () => {
  it('yayında olmayan kayıtlar da kümede — sorgularda isActive süzgeci YOK', async () => {
    // §10: taslak bir kaydın adresi bugün 404 verse bile rezerve. Aksi
    // hâlde iki taslak aynı adresi alır, ilki yayına girdiğinde ikincisi
    // sessizce erişilemez olurdu.
    await kokAdresleriTopla()

    for (const cagri of [
      prismaMock.post.findMany,
      prismaMock.region.findMany,
      prismaMock.service.findMany,
      prismaMock.neighborhood.findMany,
    ]) {
      const arg = cagri.mock.calls[0][0]
      expect(arg).not.toHaveProperty('where')
    }
  })
})

describe('TASLAK ADRESLER AİLELER ARASINDA DA REZERVE', () => {
  // Gerçek `kokAdresleriTopla` + gerçek `kokCakismasiniBul` birlikte:
  // taslak bir kaydın adresini BAŞKA bir ailenin alamadığını uçtan uca
  // gösteriyor. Yayın durumu hiçbir sorguya girmediği için taslak ile
  // yayındaki kayıt arasında fark yok.
  it('taslak YAZI adresini hizmet/bölge/mahalle alamıyor', async () => {
    prismaMock.post.findMany.mockResolvedValue([{ slug: 'depolama-rehberi', title: 'Taslak' }])
    const k = await kokAdresleriTopla()
    expect(kokCakismasiniBul(k, 'depolama-rehberi')?.conflictingType).toBe('blog yazısı')
  })

  it('taslak HİZMET adresini bölge alamıyor', async () => {
    prismaMock.service.findMany.mockResolvedValue([{ slug: 'paketleme-hizmeti', title: 'Paketleme' }])
    const k = await kokAdresleriTopla()
    expect(kokCakismasiniBul(k, 'paketleme-hizmeti')?.conflictingType).toBe('hizmet sayfası')
  })

  it('pasif BÖLGE adresini yazı alamıyor — 305 pasif legacy kayıt da rezerve', async () => {
    prismaMock.region.findMany.mockResolvedValue([{ slug: 'adana', title: 'Adana' }])
    const k = await kokAdresleriTopla()
    expect(kokCakismasiniBul(k, 'adana')?.conflictingType).toBe('bölge sayfası')
  })

  it('pasif MAHALLE adresini diğer aileler alamıyor — 463 pasif kayıt da rezerve', async () => {
    prismaMock.neighborhood.findMany.mockResolvedValue([
      { id: 1, canonicalPath: 'moda-mahallesi', name: 'Moda' },
    ])
    const k = await kokAdresleriTopla()
    expect(kokCakismasiniBul(k, 'moda-mahallesi')?.conflictingType).toBe('mahalle sayfası')
  })

  it('yeni kayıt /istanbul adresini alamıyor — hangi aile olursa olsun', async () => {
    const k = await kokAdresleriTopla()
    expect(kokCakismasiniBul(k, 'istanbul')?.code).toBe('KOK_ADRES_CAKISMASI')
  })
})

// ────────────────────────────────────────────────────────── çakışma

/** Belirtilen adresleri belirtilen türün tuttuğu bir küme kurar. */
const kume = (girdiler: [string, string, string?][]) => ({
  hepsi: new Set(girdiler.map(([y]) => y)),
  mahalleler: new Set(girdiler.filter(([, t]) => t === 'mahalle sayfası').map(([y]) => y)),
  disKaynaklar: new Set(girdiler.filter(([, t]) => t !== 'mahalle sayfası').map(([y]) => y)),
  sahip: new Map(girdiler.map(([y, t]) => [y, t])),
  etiketler: new Map(girdiler.filter(([, , e]) => e).map(([y, , e]) => [y, e as string])),
})

describe('kokCakismasiniBul — statik rota', () => {
  it.each(['hakkimizda', 'iletisim', 'blog', 'bolgelerimiz', 'fiyat-hesaplama'])(
    '/%s alınamıyor',
    (yol) => {
      const c = kokCakismasiniBul(kume([[yol, 'statik sayfa']]), yol)
      expect(c?.code).toBe('KOK_ADRES_CAKISMASI')
      expect(c?.conflictingType).toBe('statik sayfa')
      expect(c?.message).toBe(`/${yol} sistem tarafından ayrılmış bir adrestir.`)
    }
  )

  it('yönetim rotası da alınamıyor — sayfa hiç görüntülenemezdi', () => {
    // İstek Nitro seviyesinde karşılanır, Vue rotasına ulaşmaz.
    expect(kokCakismasiniBul(kume([['evdeneveyonetim', 'statik sayfa']]), 'evdeneveyonetim')).not.toBeNull()
  })
})

describe('kokCakismasiniBul — aileler arası', () => {
  it.each([
    ['blog yazısı', 'Kış aylarında taşınmak'],
    ['bölge sayfası', 'Pendik Evden Eve Nakliyat'],
    ['hizmet sayfası', 'Eşya Depolama'],
    ['mahalle sayfası', 'Kaynarca'],
  ])('%s tarafından tutulan adres alınamıyor ve SAHİBİ söyleniyor', (tur, etiket) => {
    const c = kokCakismasiniBul(kume([['depolama', tur, etiket]]), 'depolama')
    expect(c?.code).toBe('KOK_ADRES_CAKISMASI')
    expect(c?.conflictingType).toBe(tur)
    expect(c?.conflictingLabel).toBe(etiket)
    expect(c?.message).toContain(`/depolama adresi zaten ${tur} tarafından kullanılıyor`)
    expect(c?.message).toContain(etiket)
  })

  it('boş adres kümede olsa bile önce BİÇİM hatası dönüyor', () => {
    const c = kokCakismasiniBul(kume([['', 'statik sayfa']]), '')
    expect(c?.code).toBe('GECERSIZ_ADRES')
  })

  it('serbest adres için null dönüyor', () => {
    expect(kokCakismasiniBul(kume([['pendik', 'bölge sayfası']]), 'tuzla')).toBeNull()
  })
})

describe('kokCakismasiniBul — kendini hariç tutma', () => {
  it('kayıt KENDİ adresini koruyabiliyor', () => {
    const k = kume([['pendik', 'bölge sayfası', 'Pendik']])
    expect(kokCakismasiniBul(k, 'pendik', 'pendik')).toBeNull()
  })

  it('kendi adresi normalleştirilerek karşılaştırılıyor', () => {
    const k = kume([['pendik', 'bölge sayfası']])
    expect(kokCakismasiniBul(k, 'pendik', '/pendik')).toBeNull()
  })

  it('BAŞKA bir adrese taşınmak yine denetleniyor', () => {
    const k = kume([
      ['pendik', 'bölge sayfası'],
      ['tuzla', 'bölge sayfası', 'Tuzla'],
    ])
    expect(kokCakismasiniBul(k, 'tuzla', 'pendik')).not.toBeNull()
  })

  it('kendi adresi bile olsa BİÇİM denetimi atlanmıyor', () => {
    const k = kume([['Bozuk-Slug', 'bölge sayfası']])
    expect(kokCakismasiniBul(k, 'Bozuk-Slug', 'Bozuk-Slug')?.code).toBe('GECERSIZ_ADRES')
  })
})

// ───────────────────────────────────────────────── /istanbul devri

describe('/istanbul — devredilmiş sahip', () => {
  const ISTANBUL = kume([['istanbul', 'statik sayfa']])

  it('belgelenmiş TEK istisna bu', () => {
    expect(DEVREDILMIS_SAHIPLER).toHaveLength(1)
    expect(DEVREDILMIS_SAHIPLER[0]).toEqual({ yol: 'istanbul', tur: 'bölge sayfası' })
  })

  it('mevcut sahibi adresini KORUYABİLİYOR', () => {
    // Region#122 slug'ına dokunmayan güncellemeler eskisi gibi geçiyor.
    expect(kokCakismasiniBul(ISTANBUL, 'istanbul', 'istanbul')).toBeNull()
  })

  it('YENİ hiçbir kayıt bu adresi alamıyor', () => {
    // Yeni kayıtta `mevcutYol` yok — istisna doğmuyor.
    const c = kokCakismasiniBul(ISTANBUL, 'istanbul')
    expect(c?.code).toBe('KOK_ADRES_CAKISMASI')
    expect(c?.message).toContain('sistem tarafından ayrılmış')
  })

  it('adresten çıkan sahip muafiyeti GERİ KAZANAMIYOR', () => {
    // Slug "istanbul-tasima"ya taşındıktan sonra geri dönmek isterse:
    expect(kokCakismasiniBul(ISTANBUL, 'istanbul', 'istanbul-tasima')).not.toBeNull()
  })

  it('istisna GENEL DEĞİL — başka statik rotaya sıçramıyor', () => {
    const k = kume([['hakkimizda', 'statik sayfa']])
    expect(kokCakismasiniBul(k, 'hakkimizda')).not.toBeNull()
  })
})

// ──────────────────────────────────────────── async sarmalayıcı

describe('kokYoluDenetle', () => {
  it('adres DEĞİŞMİYORSA veri tabanına hiç gitmiyor', async () => {
    const c = await kokYoluDenetle('pendik', { mevcutYol: 'pendik' })
    expect(c).toBeNull()
    expect(prismaMock.post.findMany).not.toHaveBeenCalled()
  })

  it('biçim hatası kümeyi TOPLAMADAN dönüyor', async () => {
    const c = await kokYoluDenetle('Bozuk Slug')
    expect(c?.code).toBe('GECERSIZ_ADRES')
    expect(prismaMock.post.findMany).not.toHaveBeenCalled()
  })

  it('dolu adres için çakışma raporu dönüyor', async () => {
    prismaMock.region.findMany.mockResolvedValue([{ slug: 'pendik', title: 'Pendik' }])
    const c = await kokYoluDenetle('pendik')
    expect(c?.code).toBe('KOK_ADRES_CAKISMASI')
    expect(c?.path).toBe('/pendik')
  })

  it('hariç tutma seçeneği kümeye geçiyor — yayın anı denetimi buna dayanıyor', async () => {
    prismaMock.post.findMany.mockResolvedValue([{ slug: 'rehber', title: 'Rehber' }])
    expect(await kokYoluDenetle('rehber')).not.toBeNull()
    expect(await kokYoluDenetle('rehber', { haric: { haricYaziSlug: 'rehber' } })).toBeNull()
  })
})
