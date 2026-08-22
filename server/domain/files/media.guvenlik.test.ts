// server/domain/files/media.guvenlik.test.ts
//
// MEDYA KÜTÜPHANESİ — SİLME GÜVENLİĞİ.
//
// ─────────────────────────────────────────────────────────────────────────
// NEYİ KORUYOR
//
// Bir silme ucu, yanlış yazıldığında dosya sisteminin tamamına açılan bir
// kapıdır. Bu dosya üç şeyi koruyor:
//
//   1. Silme KİMLİKTEN başlıyor; istemciden gelen serbest bir yol asla
//      doğrudan `unlink` edilmiyor.
//   2. Kullanımdaki bir görsel silinemiyor — ve varyant meselesi doğru
//      çözülüyor: `-320` varyantı da "kullanımda" sayılıyor.
//   3. Kaynak koddaki `/images/...` varlıkları kütüphaneye ait değil.
import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Kütük prisma'yı modül seviyesinde import ediyor; bu dosyanın ölçtüğü
// şeyler SAF yardımcılar ve kaynak kodu — veri tabanına ihtiyaç yok.
vi.mock('../../utils/prisma.ts', () => ({ default: {} }))

import { mantiksalAd, yoldanAd, YUKLEME_ONEKI } from './media.registry.ts'

const kok = process.cwd()
const oku = (...p: string[]) => readFileSync(join(kok, ...p), 'utf8')

// ═══════════════════════════════════════════ VARYANT GRUPLAMA

describe('mantıksal görsel — varyantlar tek gruba düşüyor', () => {
  it.each([
    ['foto-320.webp', 'foto'],
    ['foto-640.webp', 'foto'],
    ['foto-1024.webp', 'foto'],
    ['foto-2048.webp', 'foto'],
    ['foto.webp', 'foto'],
  ])('%s → %s', (ad, beklenen) => {
    expect(mantiksalAd(ad)).toBe(beklenen)
  })

  it('dört varyant AYNI anahtarı veriyor', () => {
    const anahtarlar = ['a-320.webp', 'a-640.webp', 'a-1024.webp', 'a-2048.webp'].map(mantiksalAd)
    expect(new Set(anahtarlar).size).toBe(1)
  })

  it('farklı görseller karışmıyor', () => {
    expect(mantiksalAd('kadikoy-1024.webp')).not.toBe(mantiksalAd('besiktas-1024.webp'))
  })

  it('adın içindeki rakamlar boyut eki sanılmıyor', () => {
    // Yalnız SONDAKİ `-{2-4 basamak}` atılıyor.
    expect(mantiksalAd('sahne-2-kat-1024.webp')).toBe('sahne-2-kat')
  })
})

describe('yoldan ad çıkarma', () => {
  it.each([
    ['/yuklemeler/foto-1024.webp', 'foto-1024.webp'],
    ['/yuklemeler/foto-1024.webp?v=2', 'foto-1024.webp'],
    ['/images/sahne-kat.webp', 'sahne-kat.webp'],
    ['/yuklemeler/bo%C5%9Fluk.webp', 'boşluk.webp'],
  ])('%s → %s', (yol, beklenen) => {
    expect(yoldanAd(yol)).toBe(beklenen)
  })
})

// ═══════════════════════════════════════════ KAYNAK KODU DENETİMİ

describe('silme yolu güvenli yazılmış', () => {
  const servisHam = oku('server', 'domain', 'files', 'media.service.ts')
  const servis = servisHam

  it('istemciden gelen yol doğrudan silinmiyor', () => {
    // `remove` bir ANAHTAR alıyor; dosya adları veri tabanından geliyor.
    expect(servis).toContain('async function remove(anahtar: string)')
    expect(servis).toContain('gruplar.find((g) => g.anahtar === temizAnahtar)')
  })

  it('çözümlenmiş yol yönetilen kökün altında mı diye kontrol ediliyor', () => {
    expect(servis).toContain('path.resolve(STORAGE_PATH, v.storedName)')
    expect(servis).toContain('hedef.startsWith(kok + path.sep)')
  })

  it('referans kontrolü silmeden ÖNCE', () => {
    const iRef = servis.indexOf('grup.kullanimSayisi > 0')
    const iSil = servis.indexOf('fs.unlink')
    expect(iRef).toBeGreaterThan(-1)
    expect(iSil).toBeGreaterThan(iRef)
  })

  it('yarım silme bırakılmıyor — atlanan varsa DB kaydı korunuyor', () => {
    const iAtlanan = servis.indexOf('if (atlanan.length)')
    const iDbSil = servis.indexOf('prisma.storedFile.deleteMany')
    expect(iAtlanan).toBeGreaterThan(-1)
    expect(iDbSil).toBeGreaterThan(iAtlanan)
  })

  it('yalnız yönetilen kök siliniyor', () => {
    expect(YUKLEME_ONEKI).toBe('/yuklemeler/')

    // Yorumlar ayıklanıyor: dosyanın başındaki gerekçe bloğu "kütüphane
    // /images/... dosyalarının sahibi DEĞİL" diye açıklıyor, yani sınıfın
    // adını anıyor. Aranan şey KODDA bir kullanım.
    const kod = servisHam
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
    expect(kod).not.toContain("'public'")
    expect(kod).not.toContain('/images/')

    // Silinecek yol YALNIZ yönetilen depodan türetiliyor.
    expect(kod).toContain('path.resolve(STORAGE_PATH, v.storedName)')
  })
})

describe('referans kütüğü tek kaynak', () => {
  const kutuk = oku('server', 'domain', 'files', 'media.registry.ts')

  it('yalnız yönetilen yükleme yolları kütüğe giriyor', () => {
    expect(kutuk).toContain('if (!r.yol.startsWith(YUKLEME_ONEKI)) continue')
  })

  it.each([
    'homeSection', 'homeSectionItem', 'internalPageSection', 'internalPageItem',
    'processStep', 'service', 'region', 'post', 'neighborhood', 'siteSettings', 'testimonial',
  ])('%s alanları kütükte', (model) => {
    expect(kutuk).toContain(`prisma.${model}.findMany`)
  })

  it('bölge kaydının İKİ görsel alanı da sayılıyor', () => {
    expect(kutuk).toContain("'bölge görseli'")
    expect(kutuk).toContain("'fiyat faktörü görseli'")
  })
})

// ═══════════════════════════════════════════ UÇ NOKTA GÜVENLİĞİ

describe('medya ucu yalnız yöneticiye açık', () => {
  const uc = oku('server', 'api', 'medya.ts')

  it('her metot requireAdmin arkasında', () => {
    // `requireAdmin` metot dallarından ÖNCE, koşulsuz çağrılıyor.
    const i = uc.indexOf('requireAdmin(event)')
    const j = uc.indexOf("method === 'GET'")
    expect(i).toBeGreaterThan(-1)
    expect(i).toBeLessThan(j)
  })

  it('herkese açık envanter ucu yok', () => {
    expect(uc).not.toContain('if (q.public')
  })
})

// ═══════════════════════════════════════════ ARAYÜZ XSS

describe('dosya adı düz metin basılıyor', () => {
  const kodu = (s: string) =>
    s.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

  it('kütüphane panelinde v-html YOK', () => {
    expect(kodu(oku('app', 'components', 'admin', 'base', 'MediaPanel.vue'))).not.toContain('v-html')
  })

  it('görsel seçicide v-html YOK', () => {
    expect(kodu(oku('app', 'components', 'admin', 'base', 'ImageField.vue'))).not.toContain('v-html')
  })

  it('dosya adı `{{ }}` ile basılıyor', () => {
    expect(oku('app', 'components', 'admin', 'base', 'MediaPanel.vue')).toContain('{{ g.originalName }}')
  })
})
