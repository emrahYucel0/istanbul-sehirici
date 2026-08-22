// server/domain/internal-page/internal-page.service.test.ts
//
// İÇ SAYFA CMS — KONTROLLÜ KALIYOR MU?
//
// Bu testler M4'te ana sayfa için konan iki değişmezi iç sayfalarda
// koruyor: kapalı anahtar kümesi ve sabit öğe sayısı. İkisi de panelin bir
// sayfa oluşturucuya dönüşmesini engelliyor.
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./internal-page.repository.ts', () => ({
  internalPageRepository: {
    findPage: vi.fn(),
    findAll: vi.fn(),
    upsertSection: vi.fn(),
  },
}))

import { internalPageRepository } from './internal-page.repository.ts'
import { internalPageService } from './internal-page.service.ts'
import { IC_SAYFALAR, IC_SAYFA_ANAHTARLARI } from '../../../shared/utils/ic-sayfa.ts'

beforeEach(() => {
  vi.clearAllMocks()
  ;(internalPageRepository.findPage as any).mockResolvedValue([])
  ;(internalPageRepository.findAll as any).mockResolvedValue([])
  ;(internalPageRepository.upsertSection as any).mockResolvedValue({ id: 1 })
})

// ═══════════════════════════════════════════ KAPALI KÜME

describe('sayfa anahtarı KAPALI küme', () => {
  it('altı sayfa var', () => {
    expect([...IC_SAYFA_ANAHTARLARI]).toEqual([
      'hizmetler', 'bolgeler', 'hakkimizda', 'iletisim', 'fiyat', 'blog',
    ])
  })

  it.each([...IC_SAYFA_ANAHTARLARI])('%s okunabiliyor', async (sayfa) => {
    const s: any = await internalPageService.getPage(sayfa)
    expect(s.success).toBe(true)
  })

  it.each(['uydurma', 'HIZMETLER', 'hizmetler ', '', 'anasayfa'])(
    '%s reddediliyor',
    async (sayfa) => {
      const s: any = await internalPageService.getPage(sayfa)
      expect(s.success).toBe(false)
      expect(s.error).toContain('Bilinmeyen sayfa')
    }
  )

  it('bilinmeyen sayfaya YAZILAMIYOR', async () => {
    const s: any = await internalPageService.update({ pageKey: 'uydurma', sectionKey: 'giris' })
    expect(s.success).toBe(false)
    expect(internalPageRepository.upsertSection).not.toHaveBeenCalled()
  })

  it('var olan sayfaya UYDURMA bölüm yazılamıyor', async () => {
    const s: any = await internalPageService.update({ pageKey: 'blog', sectionKey: 'uydurma-bolum' })
    expect(s.success).toBe(false)
    expect(s.error).toContain('diye bir bölüm yok')
    expect(internalPageRepository.upsertSection).not.toHaveBeenCalled()
  })

  it('bir sayfanın bölümü BAŞKA sayfaya yazılamıyor', async () => {
    // `sahne` yalnız hizmetler sayfasında var.
    const s: any = await internalPageService.update({ pageKey: 'blog', sectionKey: 'sahne' })
    expect(s.success).toBe(false)
  })
})

// ═══════════════════════════════════════════ ÖĞE SAYISI

describe('öğe sayısı SABİT — sessiz kırpma yok', () => {
  const ogeler = (n: number) => Array.from({ length: n }, (_, i) => ({ label: String(i) }))

  it.each([
    ['hizmetler', 'birlikte', 3],
    ['hizmetler', 'sahne', 2],
    ['hakkimizda', 'saha', 4],
    ['fiyat', 'girenler', 6],
    ['fiyat', 'disarida', 6],
  ])('%s/%s tam %i öğe kabul ediyor', async (sayfa, bolum, adet) => {
    const s: any = await internalPageService.update({
      pageKey: sayfa, sectionKey: bolum, items: ogeler(adet),
    })
    expect(s.success).toBe(true)
  })

  it.each([
    ['hizmetler', 'birlikte', 4],
    ['hizmetler', 'birlikte', 2],
    ['hizmetler', 'sahne', 3],
    ['hakkimizda', 'saha', 0],
    ['fiyat', 'disarida', 7],
  ])('%s/%s bölümüne %i öğe REDDEDİLİYOR', async (sayfa, bolum, adet) => {
    const s: any = await internalPageService.update({
      pageKey: sayfa, sectionKey: bolum, items: ogeler(adet),
    })
    expect(s.success).toBe(false)
    expect(s.error).toContain('tasarımın parçası')
    expect(internalPageRepository.upsertSection).not.toHaveBeenCalled()
  })

  it('öğesiz bölüme öğe gönderilemiyor', async () => {
    const s: any = await internalPageService.update({
      pageKey: 'blog', sectionKey: 'giris', items: ogeler(1),
    })
    expect(s.success).toBe(false)
  })
})

// ═══════════════════════════════════════════ OKUMA SÖZLEŞMESİ

describe('okuma her zaman tam sözleşmeyi döndürüyor', () => {
  it('kayıt olmasa bile bütün bölümler yanıtta', async () => {
    const s: any = await internalPageService.getPage('fiyat')
    expect(Object.keys(s.data)).toEqual(Object.keys(IC_SAYFALAR.fiyat.bolumler))
  })

  it('kaydı olmayan bölüm BOŞ dönüyor — sayfa çökmüyor', async () => {
    const s: any = await internalPageService.getPage('blog')
    expect(s.data.giris).toEqual({
      heading: null, lead: null, note: null, closing: null,
      imagePath: null, imageAlt: null, items: [],
    })
  })

  it('BİLİNMEYEN anahtar yanıttan düşüyor', async () => {
    ;(internalPageRepository.findPage as any).mockResolvedValue([
      { sectionKey: 'giris', heading: 'A', items: [] },
      { sectionKey: 'tabloya-elle-eklenmis', heading: 'B', items: [] },
    ])
    const s: any = await internalPageService.getPage('blog')
    expect(s.data).not.toHaveProperty('tabloya-elle-eklenmis')
    expect(s.data.giris.heading).toBe('A')
  })

  it('boş dize null\'a çevriliyor — bileşen tek biçimde soruyor', async () => {
    ;(internalPageRepository.findPage as any).mockResolvedValue([
      { sectionKey: 'giris', heading: '   ', lead: '', items: [] },
    ])
    const s: any = await internalPageService.getPage('blog')
    expect(s.data.giris.heading).toBeNull()
    expect(s.data.giris.lead).toBeNull()
  })
})

// ═══════════════════════════════════════════ SAHİPLİK SINIRLARI

describe('başka sahiplerin verisi buraya KOPYALANMIYOR', () => {
  const alanlar = new Set<string>()
  for (const sayfa of Object.values(IC_SAYFALAR)) {
    for (const bolum of Object.values(sayfa.bolumler)) {
      bolum.alanlar.forEach((a) => alanlar.add(a))
      bolum.ogeAlanlari.forEach((a) => alanlar.add(a))
    }
  }

  it.each(['metaTitle', 'metaDescription', 'phone', 'email', 'address', 'workingHours'])(
    '%s sözleşmede YOK',
    (alan) => {
      expect(alanlar.has(alan)).toBe(false)
    }
  )

  it('sözleşme yalnız editoryal yuvalar taşıyor', () => {
    expect([...alanlar].sort()).toEqual(
      ['body', 'closing', 'heading', 'imageAlt', 'imagePath', 'lead', 'label', 'note', 'title'].sort()
    )
  })

  it('hiçbir bölüm türetilmiş ilçe sayısı tutmuyor', () => {
    const metin = JSON.stringify(IC_SAYFALAR)
    // 25 / 14 / 39 gibi türetilmiş sayılar sözleşmede yer almamalı.
    expect(metin).not.toMatch(/"(25|14|39)"/)
  })
})
