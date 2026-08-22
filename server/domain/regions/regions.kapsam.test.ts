// server/domain/regions/regions.kapsam.test.ts
//
// BÖLGE KAPSAMI — AYNI TABLO, İKİ FARKLI İŞ.
//
// ─────────────────────────────────────────────────────────────────────────
// NEYİ KORUYOR
//
// `Region` tablosunda 375 kayıt var: 39 İstanbul ilçesi, 336 legacy
// (335 eski şehir/bölge + İstanbul il sayfasının kendisi). Yönetimde ikisi
// aynı iş DEĞİL — ilçelerde M2 kalite kapısı ve açık yayın eylemi var,
// legacy kayıtlarda yok.
//
// Süzgeç SUNUCUDA olmalı: 375 kaydı istemciye çekip orada ayırmak her
// panel açılışında gereksiz veri taşımak olurdu. Bu testler süzgecin
// gerçekten `where` ürettiğini ve iki kümenin ÖRTÜŞMEDİĞİNİ koruyor.
//
// Prisma mock'lanıyor: ölçülen şey sorgunun KENDİSİ.
import { beforeEach, describe, expect, it, vi } from 'vitest'

const cagrilar: any[] = []

vi.mock('../../utils/prisma.ts', () => ({
  default: {
    region: {
      findMany: (arg: any) => { cagrilar.push(arg); return Promise.resolve([]) },
      count: (arg: any) => { cagrilar.push(arg); return Promise.resolve(0) },
      findUnique: () => Promise.resolve(null),
      findFirst: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
    },
    neighborhood: { count: () => Promise.resolve(0), findMany: () => Promise.resolve([]) },
  },
}))

// Kök adres denetimi veri tabanına gidiyor; bu dosyanın konusu o değil.
vi.mock('../shared/root-paths.ts', () => ({
  kokYoluDenetle: () => Promise.resolve(null),
  kokYolunuNormallestir: (y: string) => String(y ?? '').trim().toLowerCase(),
}))

import { regionsService } from './regions.service.ts'
import { ISTANBUL_PLAKA, ISTANBUL_IL_SLUG } from '../../../shared/utils/istanbul.ts'

/** Son `findMany` çağrısının `where` bloğu. */
const sonWhere = () => cagrilar[cagrilar.length - 1]?.where

beforeEach(() => {
  cagrilar.length = 0
})

describe('kapsam süzgeci sunucuda', () => {
  it('kapsam verilmezse süzgeç EKLENMİYOR — mevcut davranış korunuyor', async () => {
    await regionsService.get({ includeInactive: true })
    const w = sonWhere()
    expect(w.cities).toBeUndefined()
    expect(w.NOT).toBeUndefined()
  })

  it('istanbul kapsamı: 34 içeren VE il sayfası olmayan', async () => {
    await regionsService.get({ includeInactive: true, kapsam: 'istanbul' })
    expect(sonWhere()).toEqual({
      cities: { array_contains: ISTANBUL_PLAKA },
      slug: { not: ISTANBUL_IL_SLUG },
    })
  })

  it('legacy kapsamı: İstanbul ilçesi OLMAYAN her şey', async () => {
    await regionsService.get({ includeInactive: true, kapsam: 'legacy' })
    expect(sonWhere()).toEqual({
      NOT: {
        AND: [
          { cities: { array_contains: ISTANBUL_PLAKA } },
          { slug: { not: ISTANBUL_IL_SLUG } },
        ],
      },
    })
  })

  it('iki kapsam birbirinin TAM TÜMLEYENİ — kayıp veya çift sayım yok', async () => {
    // `legacy` koşulu, `istanbul` koşulunun mantıksal değili. Bu yüzden
    // 39 + 336 = 375 oluyor ve hiçbir kayıt iki listede birden görünmüyor.
    await regionsService.get({ includeInactive: true, kapsam: 'istanbul' })
    const ist = sonWhere()
    cagrilar.length = 0
    await regionsService.get({ includeInactive: true, kapsam: 'legacy' })
    const leg = sonWhere()

    expect(leg.NOT.AND).toEqual([{ cities: ist.cities }, { slug: ist.slug }])
  })

  it('İL SAYFASI legacy tarafında — ilçe değil', async () => {
    await regionsService.get({ includeInactive: true, kapsam: 'istanbul' })
    // İstanbul kapsamı il sayfasını AÇIKÇA dışarıda bırakıyor.
    expect(sonWhere().slug).toEqual({ not: ISTANBUL_IL_SLUG })
  })
})

describe('kapsam yayın süzgecini EZMİYOR', () => {
  it('herkese açık istekte kapsam ile birlikte isActive de duruyor', async () => {
    await regionsService.get({ includeInactive: false, kapsam: 'istanbul' })
    const w = sonWhere()
    // M2 yayın bütünlüğü kuralı kapsam süzgeciyle birlikte KAYBOLMUYOR.
    expect(w.isActive).toBe(true)
    expect(w.cities).toEqual({ array_contains: ISTANBUL_PLAKA })
  })

  it('yönetim isteğinde pasif kayıtlar da geliyor', async () => {
    await regionsService.get({ includeInactive: true, kapsam: 'istanbul' })
    expect(sonWhere().isActive).toBeUndefined()
  })
})
