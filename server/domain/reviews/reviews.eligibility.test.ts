// server/domain/reviews/reviews.eligibility.test.ts
//
// PUBLIC'E UYGUNLUK — TEK KURAL, ÜÇ SORGU.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN AYRI BİR DOSYA
//
// "Hangi yorum herkese açık?" sorusunun ÜÇ ayrı tüketicisi var:
//
//   liste     findPublic / findForHome  → ekranda basılan satırlar
//   sayaç     publicStats._count        → "N yayınlanmış yorum"
//   ortalama  publicStats._avg          → "4,7 / 5"
//
// Üçü aynı kümeyi kullanmazsa sayfa kendi kendisiyle çelişir: üç satır
// gösterip "beş yorum" yazar, ya da hiç yorum göstermeden bir puan
// ortalaması basar. İkinci durum daha kötüsü — gösterilmeyen kayıtlardan
// hesaplanmış bir puan, ziyaretçinin doğrulayamayacağı bir iddiadır.
//
// Diğer test dosyaları servisi repository MOCK'layarak ölçüyor; bu dosya
// tam tersini yapıyor ve repository'nin prisma'ya GERÇEKTE ne gönderdiğine
// bakıyor. Aradaki fark önemli: `where` yanlış olsa servis testleri yine
// geçerdi.
//
// ─────────────────────────────────────────────────────────────────────────
// İKİ ALAN, İKİ AYRI ANLAM
//
//   isApproved   moderasyon kararı — yönetici bu yorumu onayladı mı
//   isActive     yayın durumu      — kayıt sitede gösterilmeye açık mı
//
// Yerel veri tabanındaki üç örnek kayıt tam da bu ayrımın üstünde duruyor:
// `isApproved: true` ama `isActive: false`. "Onaylı" oldukları için yalnız
// onaya bakan bir sorgu onları yayınlardı.
import { beforeEach, describe, expect, it, vi } from 'vitest'

/** Her sorgunun prisma'ya gönderdiği argümanı yakalayan sahte delegate. */
const cagrilar: Record<string, any[]> = { findMany: [], aggregate: [], count: [] }

vi.mock('../../utils/prisma.ts', () => ({
  default: {
    testimonial: {
      findMany: (arg: any) => { cagrilar.findMany.push(arg); return Promise.resolve([]) },
      aggregate: (arg: any) => {
        cagrilar.aggregate.push(arg)
        return Promise.resolve({ _avg: { rating: null }, _count: { _all: 0 } })
      },
      count: (arg: any) => { cagrilar.count.push(arg); return Promise.resolve(0) },
      create: () => Promise.resolve({ id: 1 }),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
    },
    testimonialSection: { findFirst: () => Promise.resolve({ id: 1 }) },
  },
}))

import { reviewsRepository } from './reviews.repository.ts'
import { HERKESE_ACIK_KOSUL, herkeseAcikMi, ANASAYFA_YORUM_SAYISI } from './reviews.public-fields.ts'

beforeEach(() => {
  cagrilar.findMany = []
  cagrilar.aggregate = []
  cagrilar.count = []
})

// ═══════════════════════════════════════════ KOŞULUN KENDİSİ

describe('tek yetkili koşul', () => {
  it('iki alanı da istiyor', () => {
    expect(HERKESE_ACIK_KOSUL).toEqual({ isActive: true, isApproved: true })
  })

  it.each([
    ['onaylı + aktif', { isApproved: true, isActive: true }, true],
    ['onaylı + PASİF (üç örnek kaydın durumu)', { isApproved: true, isActive: false }, false],
    ['ONAYSIZ + aktif (yeni ziyaretçi yorumu)', { isApproved: false, isActive: true }, false],
    ['onaysız + pasif', { isApproved: false, isActive: false }, false],
    ['alanlar eksik', {}, false],
  ])('%s → %s', (_ad, kayit, beklenen) => {
    expect(herkeseAcikMi(kayit)).toBe(beklenen)
  })
})

// ═══════════════════════════════════════════ ÜÇ SORGU AYNI KÜMEDE

describe('liste · sayaç · ortalama aynı kümeyi kullanıyor', () => {
  it('herkese açık liste sorgusu', async () => {
    await reviewsRepository.findPublic()
    expect(cagrilar.findMany[0].where).toEqual(HERKESE_ACIK_KOSUL)
  })

  it('ana sayfa liste sorgusu', async () => {
    await reviewsRepository.findForHome()
    expect(cagrilar.findMany[0].where).toEqual(HERKESE_ACIK_KOSUL)
  })

  it('sayaç ve ortalama sorgusu', async () => {
    await reviewsRepository.publicStats()
    expect(cagrilar.aggregate[0].where).toEqual(HERKESE_ACIK_KOSUL)
    expect(cagrilar.aggregate[0]._count).toEqual({ _all: true })
    expect(cagrilar.aggregate[0]._avg).toEqual({ rating: true })
  })

  it('üç sorgu da AYNI nesneyi gönderiyor — kopya değil', async () => {
    await reviewsRepository.findPublic()
    await reviewsRepository.findForHome()
    await reviewsRepository.publicStats()
    const kosullar = [
      cagrilar.findMany[0].where,
      cagrilar.findMany[1].where,
      cagrilar.aggregate[0].where,
    ]
    // Referans eşitliği: ayrı ayrı yazılmış üç nesne olsaydı `toBe`
    // geçmezdi. Aynı sabiti kullandıkları buradan anlaşılıyor.
    expect(kosullar[1]).toBe(kosullar[0])
    expect(kosullar[2]).toBe(kosullar[0])
  })
})

// ═══════════════════════════════════════════ SAYAÇ KIRPILMIYOR

describe('gösterilen liste ile sayaç ayrı anlam', () => {
  it('ana sayfa listesi sınırlı', async () => {
    await reviewsRepository.findForHome()
    expect(cagrilar.findMany[0].take).toBe(ANASAYFA_YORUM_SAYISI)
  })

  it('sayaç sorgusunda `take` YOK — uygun kayıtların tamamını sayıyor', async () => {
    await reviewsRepository.publicStats()
    // `take` verilseydi "6 yayınlanmış yorum" tavanı oluşurdu ve 40 yorumu
    // olan bir işletme sayfada hep 6 görürdü.
    expect(cagrilar.aggregate[0]).not.toHaveProperty('take')
  })

  it('ana sayfa listesi en yeniden eskiye — yönetici sıralaması değil', async () => {
    await reviewsRepository.findForHome()
    // `isFeatured`/`order` burada kullanılsaydı "seçilmiş yorum" anlamına
    // gelirdi; ana sayfada sıralama bir editoryal karar olmamalı.
    expect(cagrilar.findMany[0].orderBy).toEqual([{ date: 'desc' }, { id: 'desc' }])
  })
})

// ═══════════════════════════════════════════ YÖNETİM AYRI

describe('yönetim sorgusu public koşulunu KULLANMIYOR', () => {
  it('tüm liste süzgeçsiz — yönetici onaylıyı da bekleyeni de görüyor', async () => {
    await reviewsRepository.findForAdmin(false)
    expect(cagrilar.findMany[0].where).toEqual({})
  })

  it('kuyruk görünümü yalnız onay bekleyenler', async () => {
    await reviewsRepository.findForAdmin(true)
    expect(cagrilar.findMany[0].where).toEqual({ isApproved: false })
  })

  it('yönetim listesi alan beyaz listesi KULLANMIYOR — e-posta yönetici için gerekli', async () => {
    await reviewsRepository.findForAdmin(false)
    expect(cagrilar.findMany[0]).not.toHaveProperty('select')
  })
})

// ═══════════════════════════════════════════ ZİYARETÇİ KAYDI

describe('ziyaretçi yorumu doğru durumla doğuyor', () => {
  it('onaysız ama aktif — yani onay tek eşik', async () => {
    let yazilan: any = null
    const sahte = { ...reviewsRepository }
    // create'in gövdesini doğrudan ölçmek için prisma sahtesini kullanıyoruz.
    const prisma = (await import('../../utils/prisma.ts')).default as any
    prisma.testimonial.create = (arg: any) => { yazilan = arg.data; return Promise.resolve({ id: 1 }) }

    await sahte.create({
      customerName: 'Ad', rating: 5, comment: 'metin',
      serviceType: '', testimonialSectionId: 1,
    })

    expect(yazilan.isApproved).toBe(false)
    expect(yazilan.isActive).toBe(true)
    expect(yazilan.source).toBe('site')
    // Bu ikisi birlikte şu anlama geliyor: yönetici "Onayla" dediğinde kayıt
    // GERÇEKTEN yayına giriyor, ikinci bir "yayınla" eylemi gerekmiyor.
    expect(herkeseAcikMi({ ...yazilan, isApproved: true })).toBe(true)
  })
})
