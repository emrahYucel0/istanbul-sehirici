// server/domain/sections/configs/process.config.ts
import prisma from '../../../utils/prisma'
import { createSectionCrudService } from '../section-crud.factory'

export interface ProcessStepInput {
  title?: string
  description?: string
  iconPath?: string
  order?: number
  /** V2 alanları — bkz. schema.prisma → ProcessStep. */
  label?: string
  imagePath?: string
  imageAlt?: string
  linkLabel?: string
  linkHref?: string
}

export interface ProcessSectionInput {
  sectionName?: string
  mainTitle?: string
  description?: string
  steps?: ProcessStepInput[]
}

/**
 * ADIM SAYISI SABİT — BEŞ.
 *
 * Ana sayfadaki Süreç bölümünün kaydırma koreografisi adım başına AYRI
 * yazılmış: `nth-child(1…5)` devir animasyonları, kare başına hesaplanmış
 * `object-position` kadrajları ve omurga çentikleri. Altıncı adım hiçbir
 * animasyon adı almaz ve kadrajı ayarlanmamış bir fotoğrafla gelir;
 * dördüncüsü silinirse boşta kalan bir devir kalır.
 *
 * Bu yüzden sayı panelden değiştirilemiyor. Sessizce kırpmak da YOK: işlem
 * reddediliyor ve sebebi söyleniyor — kırpılsaydı yönetici "kaydedildi"
 * mesajını alır, girdiği adımı bir daha göremezdi.
 */
export const SUREC_ADIM_SAYISI = 5

export const processCrudService = createSectionCrudService<any, ProcessSectionInput>(prisma.processSection, {
  defaultSectionName: 'process-section',
  include: { steps: { orderBy: { order: 'asc' } } },
  children: [
    {
      relation: 'steps',
      mapCreate: (s: ProcessStepInput) => ({
        title: s.title || '',
        description: s.description || '',
        iconPath: s.iconPath,
        order: s.order,
        label: s.label || null,
        imagePath: s.imagePath || null,
        imageAlt: s.imageAlt || null,
        // Bağlantı ÇİFT olarak anlamlı: yalnız etiketi olan bir bağlantı
        // tıklanamaz, yalnız adresi olan görünmez. Biri eksikse ikisi de
        // yazılmıyor ve bileşen bağlantıyı hiç basmıyor.
        linkLabel: s.linkLabel && s.linkHref ? s.linkLabel : null,
        linkHref: s.linkLabel && s.linkHref ? s.linkHref : null,
      }),
    },
  ],
  mapParentCreate: (b) => ({
    mainTitle: b.mainTitle || '',
    description: b.description,
  }),
  mapParentUpdate: (b) => ({
    mainTitle: b.mainTitle,
    description: b.description,
  }),
  deleteStrategy: 'manual',
  manualDeleteDelegates: [
    (sectionName) => prisma.processStep.deleteMany({ where: { processSection: { sectionName } } }),
  ],
})

/** Adım sayısını denetler; kusur varsa yöneticiye gösterilecek metni döner. */
function adimSayisiniDenetle(body: ProcessSectionInput): string | null {
  const adet = body.steps?.length ?? 0
  if (adet === SUREC_ADIM_SAYISI) return null
  return (
    `Süreç bölümü tam ${SUREC_ADIM_SAYISI} adım taşır; ${adet} adım gönderildi. ` +
    'Adım sayısı ana sayfadaki kaydırma koreografisinin parçası ve panelden değiştirilemez.'
  )
}

/**
 * Yazma sarmalayıcısı.
 *
 * Denetim, fabrikanın YIKICI güncellemesinden ÖNCE: bu bölüm de
 * `deleteStrategy: 'manual'` ile çalışıyor, yani `update()` çağrıldığı anda
 * bütün adım satırlarını siliyor. Reddedilen bir istekte hiçbir satıra
 * dokunulmuyor.
 */
async function update(body: ProcessSectionInput) {
  const hata = adimSayisiniDenetle(body)
  if (hata) return { success: false as const, error: hata }
  return processCrudService.update(body)
}

async function create(body: ProcessSectionInput) {
  const hata = adimSayisiniDenetle(body)
  if (hata) return { success: false as const, error: hata }
  return processCrudService.create(body)
}

export const processSectionService = {
  get: processCrudService.get,
  create,
  update,
  remove: processCrudService.remove,
}
