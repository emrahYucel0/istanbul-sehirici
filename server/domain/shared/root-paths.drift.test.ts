// server/domain/shared/root-paths.drift.test.ts
//
// STATİK ROTA LİSTESİ KAYMA DENETİMİ.
//
// `STATIK_KOK_ADRESLER` ELLE tutuluyor ve bu bilinçli: Nuxt rotaları dosya
// sisteminden üretiyor, çalışma zamanında güvenilir biçimde sayılamıyorlar.
// Elle tutulan her listenin riski aynı: kaynak değişir, liste kalır. Burada
// yeni bir kaynak İCAT EDİLMİYOR — test sayfa ağacını GERÇEKTEN okuyup
// listeyle karşılaştırıyor.
//
// YAKALADIĞI HATA: `app/pages/yeni-sayfa.vue` eklenip listeye eklenmezse,
// bir yazı/bölge/hizmet o adresi alabilir ve sayfa erişilemez hâle gelirdi
// — üstelik sitemap onu bildirmeye devam ederdi.
import { describe, expect, it, vi } from 'vitest'
import { readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// Yalnız sabit liste okunuyor; modülün Prisma istemcisi bu test için
// gereksiz ve mock'lanmazsa DATABASE_URL istiyor.
vi.mock('../../utils/prisma.ts', () => ({ default: {} }))

import { STATIK_KOK_ADRESLER } from './root-paths.ts'

const SAYFA_DIZINI = join(process.cwd(), 'app', 'pages')

/**
 * Sayfa ağacından KÖK segmentleri çıkarır.
 *
 *   index.vue          → ''         (ana sayfa)
 *   hakkimizda.vue     → 'hakkimizda'
 *   prototip/surec.vue → 'prototip'  (yalnız ilk segment kök alanı tutar)
 *   [...slug].vue      → atlanıyor   (yakalayıcı rota; ad alanı tutmuyor)
 */
function sayfaKokleri(): string[] {
  const girdiler = readdirSync(SAYFA_DIZINI, { withFileTypes: true })
  const kokler = new Set<string>()

  for (const g of girdiler) {
    if (g.isDirectory()) {
      kokler.add(g.name)
      continue
    }
    if (!g.name.endsWith('.vue')) continue
    const ad = g.name.replace(/\.vue$/, '')
    // Dinamik/yakalayıcı rotalar sabit bir kök adres tutmuyor.
    if (ad.includes('[')) continue
    kokler.add(ad === 'index' ? '' : ad)
  }

  return [...kokler]
}

describe('statik rota kayması', () => {
  it('sayfa dizini okunabiliyor (test kendi varsayımını doğruluyor)', () => {
    expect(existsSync(SAYFA_DIZINI)).toBe(true)
    expect(sayfaKokleri().length).toBeGreaterThan(5)
  })

  it('HER gerçek kök sayfa rezerve listesinde', () => {
    const eksik = sayfaKokleri().filter((k) => !STATIK_KOK_ADRESLER.includes(k))
    expect(eksik).toEqual([])
  })

  it('sunucu rotaları da rezerve', () => {
    // server/routes/yuklemeler → /yuklemeler
    const sunucuDizini = join(process.cwd(), 'server', 'routes')
    const kokler = existsSync(sunucuDizini)
      ? readdirSync(sunucuDizini, { withFileTypes: true })
          .filter((g) => g.isDirectory())
          .map((g) => g.name)
      : []

    expect(kokler.length).toBeGreaterThan(0)
    for (const k of kokler) expect(STATIK_KOK_ADRESLER).toContain(k)
  })

  it('public/ klasörleri de rezerve — statik dosya sunucusu rotayı yutar', () => {
    const publicDizini = join(process.cwd(), 'public')
    const klasorler = readdirSync(publicDizini, { withFileTypes: true })
      .filter((g) => g.isDirectory())
      .map((g) => g.name)

    expect(klasorler.length).toBeGreaterThan(0)
    for (const k of klasorler) expect(STATIK_KOK_ADRESLER).toContain(k)
  })

  it('routeRules ile yönlendirilen kök adresler rezerve', () => {
    // `/istanbul` sayfa DEĞİL ama routeRules onu 301 ile `/`'a taşıyor:
    // o adresi alan bir kayıt hiçbir zaman görüntülenemez.
    expect(STATIK_KOK_ADRESLER).toContain('istanbul')
  })
})
