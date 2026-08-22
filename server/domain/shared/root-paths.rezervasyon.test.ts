// server/domain/shared/root-paths.rezervasyon.test.ts
//
// KÖK REZERVASYONU — PASİF KAYIT ADRESİNİ TUTMAYA DEVAM EDİYOR MU?
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN BU DOSYA VAR
//
// M8 denetim raporu "pasif kayıt 404 döndürüyor, adres serbest kalıyor"
// yazmıştı. Bu YANLIŞTI ve tehlikeli bir yanlıştı: doğru olsaydı, bu turda
// yayından çekilen 30 eski bölgenin adresi (ankara, izmir, bursa…) yarın
// başka bir yazı ya da hizmet tarafından alınabilir, kayıt geri
// döndürüldüğünde iki varlık aynı adresi paylaşırdı.
//
// Kod aksini söylüyor: `kokAdresleriTopla()` dört tabloyu da `isActive`
// FİLTRESİ OLMADAN okuyor. Ölçüldü — pasif bir bölgenin ve pasif bir
// mahallenin adresi kümede duruyor ve yeni bir kayıt onları alamıyor.
//
// Bu dosya o davranışı testle çiviliyor ki bir daha yorum satırına ya da
// rapora güvenmek zorunda kalmayalım.
import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const bolgeler = [
  { slug: 'kadikoy', title: 'Kadıköy Evden Eve Nakliyat', isActive: true },
  { slug: 'ankara', title: 'Ankara Evden Eve Nakliyat', isActive: false },
  { slug: 'sakarya', title: 'Sakarya Evden Eve Nakliyat', isActive: false },
]
const yazilar = [{ slug: 'kis-aylarinda-tasinmak', title: 'Kış aylarında taşınmak', isActive: false }]
const hizmetler = [{ slug: 'evden-eve-nakliyat', title: 'Evden Eve Nakliyat', isActive: false }]
const mahalleler = [
  { id: 1, canonicalPath: 'moda-mahallesi', name: 'Moda', isActive: true },
  { id: 2, canonicalPath: 'fenerbahce-mahallesi', name: 'Fenerbahçe', isActive: false },
]

// Sorgular `select` ile geliyor; sahte istemci `isActive` alanını hiç
// döndürmüyor — çünkü ASIL MESELE bu: gerçek kod onu SORMUYOR bile.
vi.mock('../../utils/prisma.ts', () => ({
  default: {
    post: { findMany: vi.fn(async () => yazilar.map(({ slug, title }) => ({ slug, title }))) },
    region: { findMany: vi.fn(async () => bolgeler.map(({ slug, title }) => ({ slug, title }))) },
    service: { findMany: vi.fn(async () => hizmetler.map(({ slug, title }) => ({ slug, title }))) },
    neighborhood: {
      findMany: vi.fn(async () => mahalleler.map(({ id, canonicalPath, name }) => ({ id, canonicalPath, name }))),
    },
  },
}))

import prisma from '../../utils/prisma.ts'
import { kokAdresleriTopla, kokYoluDenetle, IC_KOK_ADRESLER } from './root-paths.ts'

// ═══════════════════════════════════════════ SORGU ŞEKLİ

describe('adres toplama yayın durumuna BAKMIYOR', () => {
  it('dört sorgunun hiçbirinde isActive süzgeci yok', async () => {
    await kokAdresleriTopla()
    for (const model of ['post', 'region', 'service', 'neighborhood'] as const) {
      const cagri = (prisma as any)[model].findMany.mock.calls.at(-1)?.[0]
      expect(cagri, model).toBeDefined()
      expect(cagri.where, `${model}.where`).toBeUndefined()
      expect(JSON.stringify(cagri), model).not.toContain('isActive')
    }
  })

  it('kaynak kodda da isActive süzgeci yok', () => {
    const kaynak = readFileSync(join(process.cwd(), 'server', 'domain', 'shared', 'root-paths.ts'), 'utf8')
    const toplama = kaynak.slice(kaynak.indexOf('export async function kokAdresleriTopla'))
    const govde = toplama.slice(0, toplama.indexOf('\n}'))
    expect(govde).not.toContain('isActive')
  })
})

// ═══════════════════════════════════════════ DAVRANIŞ

describe('pasif kayıt adresini REZERVE TUTUYOR', () => {
  it.each([
    ['pasif bölge', 'ankara'],
    ['pasif bölge', 'sakarya'],
    ['pasif yazı', 'kis-aylarinda-tasinmak'],
    ['pasif hizmet', 'evden-eve-nakliyat'],
    ['pasif mahalle', 'fenerbahce-mahallesi'],
  ])('%s adresi (%s) dolu kümede', async (_ad, yol) => {
    const kume = await kokAdresleriTopla()
    expect(kume.hepsi.has(yol)).toBe(true)
  })

  it.each(['ankara', 'sakarya', 'fenerbahce-mahallesi'])(
    'yeni bir kayıt %s adresini ALAMIYOR',
    async (yol) => {
      const cakisma = await kokYoluDenetle(yol)
      expect(cakisma).not.toBeNull()
      expect(cakisma!.code).toBe('KOK_ADRES_CAKISMASI')
    }
  )

  it('boşta olan bir adres alınabiliyor — kural her şeyi reddetmiyor', async () => {
    expect(await kokYoluDenetle('henuz-kimsenin-almadigi-adres')).toBeNull()
  })

  it('kayıt kendi adresini koruyabiliyor', async () => {
    expect(await kokYoluDenetle('ankara', { mevcutYol: 'ankara' })).toBeNull()
  })
})

// ═══════════════════════════════════════════ EMEKLİ EDİLEN 30 ADRES

// ═══════════════════════════════════════════ REZERVASYONUN SINIRI

describe('rezervasyon SATIRA bağlı — satır giderse adres serbest kalır', () => {
  /**
   * BU AYRIM ÖNEMLİ VE İKİ AYRI KARARIN SONUCU.
   *
   *   pasifleştirme → satır DURUYOR  → adres REZERVE  (aşağıdaki ilk test)
   *   silme         → satır YOK      → adres SERBEST  (ikinci test)
   *
   * P1-3'ün ilk turunda 30 eski bölge yalnız pasifleştirilmişti ve
   * adresleri rezerve kalıyordu. Kapsam düzeltmesiyle 335 İstanbul dışı
   * kayıt tamamen silindi (bkz. prisma/legacy-bolge-temizligi.mjs) —
   * yani `/ankara`, `/izmir`, `/bursa` gibi adresler artık boşta.
   *
   * Bu bir regresyon DEĞİL: kural değişmedi, kuralın beslendiği veri
   * değişti. Yeni bir kayıt o adresleri alabilir ve kök çakışma denetimi
   * o anda yine devreye girer.
   */
  it('PASİF satır adresini tutuyor', async () => {
    const cakisma = await kokYoluDenetle('ankara')
    expect(cakisma?.conflictingType).toBe('bölge sayfası')
    expect(cakisma?.conflictingLabel).toBe('Ankara Evden Eve Nakliyat')
  })

  it('SİLİNMİŞ satırın adresi serbest', async () => {
    // Sahte istemcide olmayan bir slug: satırı silinmiş bir kaydı temsil
    // ediyor. Kural onu "dolu" saymıyor.
    expect(await kokYoluDenetle('mersin')).toBeNull()
    expect(await kokYoluDenetle('trabzon')).toBeNull()
  })

  it('`istanbul` statik rezerve — kayıt yayında olsa da olmasa da', async () => {
    expect(IC_KOK_ADRESLER).toContain('istanbul')
    const cakisma = await kokYoluDenetle('istanbul')
    expect(cakisma?.conflictingType).toBe('statik sayfa')
  })
})
