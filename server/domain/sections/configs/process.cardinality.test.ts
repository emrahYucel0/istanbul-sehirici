// server/domain/sections/configs/process.cardinality.test.ts
//
// SÜREÇ ADIM SAYISI — BEŞTE SABİT.
//
// Ana sayfadaki Süreç bölümünün kaydırma koreografisi adım başına AYRI
// yazılmış: `nth-child(1…5)` devir animasyonları ve kare başına hesaplanmış
// kadrajlar. Altıncı adım hiçbir animasyon adı almaz, dördüncüsü silinirse
// boşta bir devir kalır. Panel eskiden "Yeni Adım Ekle" düğmesi
// gösteriyordu ve bölüm o gün hiçbir public sayfaya bağlı olmadığı için
// bunun bir sonucu yoktu — artık var.
//
// Denetim, bölümün YIKICI güncellemesinden önce çalışıyor: `update()`
// çağrıldığı anda bütün adım satırları siliniyor.
import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  processSection: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  processStep: { deleteMany: vi.fn() },
}))

vi.mock('../../../utils/prisma', () => ({ default: prismaMock }))

import { processSectionService, SUREC_ADIM_SAYISI } from './process.config'

const ADIM = (i: number) => ({
  title: `Adım ${i}`,
  description: 'Metin',
  label: 'ETİKET',
  imagePath: '/images/stage-a.webp',
  imageAlt: 'Alt metin',
  order: i,
})
const ADIMLAR = (adet: number) => Array.from({ length: adet }, (_, i) => ADIM(i))

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.processSection.findFirst.mockResolvedValue({ id: 1, sectionName: 'process-section', steps: [] })
  prismaMock.processSection.update.mockResolvedValue({ id: 1, steps: [] })
  prismaMock.processSection.create.mockResolvedValue({ id: 1, steps: [] })
})

describe('adım sayısı denetimi', () => {
  it(`tam ${SUREC_ADIM_SAYISI} adım kabul ediliyor`, async () => {
    const s: any = await processSectionService.update({ steps: ADIMLAR(SUREC_ADIM_SAYISI) })
    expect(s.success).not.toBe(false)
  })

  it.each([0, 1, 4, 6, 10])('%i adım REDDEDİLİYOR', async (adet) => {
    const s: any = await processSectionService.update({ steps: ADIMLAR(adet) })

    expect(s.success).toBe(false)
    expect(s.error).toContain(`tam ${SUREC_ADIM_SAYISI} adım taşır`)
  })

  it('adım listesi hiç gönderilmezse de reddediliyor', async () => {
    const s: any = await processSectionService.update({ mainTitle: 'X' })
    expect(s.success).toBe(false)
  })

  it('RED, YIKICI SİLMEDEN ÖNCE — hiçbir satır silinmiyor', async () => {
    await processSectionService.update({ steps: ADIMLAR(3) })

    expect(prismaMock.processStep.deleteMany).not.toHaveBeenCalled()
    expect(prismaMock.processSection.update).not.toHaveBeenCalled()
  })

  it('oluşturma da aynı kuralla korunuyor', async () => {
    prismaMock.processSection.findFirst.mockResolvedValue(null)
    const s: any = await processSectionService.create({ steps: ADIMLAR(2) })
    expect(s.success).toBe(false)
  })
})

describe('V2 alanları yazılıyor', () => {
  it('etiket, fotoğraf ve alt metin kaydediliyor', async () => {
    await processSectionService.update({ steps: ADIMLAR(SUREC_ADIM_SAYISI) })

    const yazilan = prismaMock.processSection.update.mock.calls[0][0].data.steps.create
    expect(yazilan[0].label).toBe('ETİKET')
    expect(yazilan[0].imagePath).toBe('/images/stage-a.webp')
    expect(yazilan[0].imageAlt).toBe('Alt metin')
  })

  it('bağlantı YALNIZ etiket ve adres BİRLİKTE doluysa yazılıyor', async () => {
    // Yalnız etiketi olan bağlantı tıklanamaz, yalnız adresi olan görünmez.
    const adimlar = ADIMLAR(SUREC_ADIM_SAYISI)
    adimlar[0] = { ...adimlar[0], linkLabel: 'Hizmet kapsamımız' } as any
    adimlar[1] = { ...adimlar[1], linkHref: '/hizmetlerimiz' } as any
    adimlar[2] = { ...adimlar[2], linkLabel: 'Hizmet kapsamımız', linkHref: '/hizmetlerimiz' } as any

    await processSectionService.update({ steps: adimlar })

    const yazilan = prismaMock.processSection.update.mock.calls[0][0].data.steps.create
    expect(yazilan[0].linkLabel).toBeNull()
    expect(yazilan[1].linkHref).toBeNull()
    expect(yazilan[2].linkLabel).toBe('Hizmet kapsamımız')
    expect(yazilan[2].linkHref).toBe('/hizmetlerimiz')
  })
})
