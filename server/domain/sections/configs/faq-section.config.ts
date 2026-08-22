// server/domain/sections/configs/faq-section.config.ts
import prisma from '../../../utils/prisma'
import { createSectionCrudService } from '../section-crud.factory'

export interface FaqItemInput {
  question?: string
  answer?: string
  order?: number
  isActive?: boolean
}

export interface FaqSectionInput {
  sectionName?: string
  mainTitle?: string
  faqs?: FaqItemInput[]
}

/*
 * `details`, `statsCards` ve `images` YAZMA YOLUNDAN ÇIKARILDI (M6).
 *
 * Üçünün de herkese açık tüketicisi ölçüldü: SIFIR. Ana sayfanın Sorular
 * bölümü (`/api/anasayfa` → home.repository.findFaq) yalnız `mainTitle` ve
 * AKTİF `faqs`in `question`/`answer` alanlarını okuyor. Eski `Faq.vue`
 * bileşeni bu üçünü kullanıyordu ama o bileşen hiçbir sayfada render
 * edilmiyordu ve M6'da silindi.
 *
 * Panelde durdukları sürece iki ayrı sorun üretiyorlardı:
 *   1. Yönetici istatistik kartı ve görsel düzenliyor, hiçbir yerde
 *      görünmüyordu.
 *   2. Bölüm fabrikası her PUT'ta çocukları silip yeniden yarattığı için,
 *      panelin bu alanları GÖNDERMEYİ BIRAKMASI kayıtları silerdi. Bu
 *      yüzden panelde ölü alanları "veri korunsun diye" taşımak zorunda
 *      kalınmıştı — ölü bir alanı ayakta tutmak için yazılmış bir kod.
 *
 * Çocuk listesinden çıkarılınca ikisi de çözülüyor: uç nokta bu kayıtlara
 * artık DOKUNMUYOR, dolayısıyla panel de onları taşımak zorunda değil.
 * Tablolar ve veriler DURUYOR.
 */

export const faqSectionCrudService = createSectionCrudService<any, FaqSectionInput>(prisma.faqSection, {
  defaultSectionName: 'faq-section',
  // Yanıt yalnız canlı olanı taşıyor: bölüm başlığı + soru listesi.
  include: {
    faqs: { orderBy: { order: 'asc' } },
  },
  children: [
    {
      relation: 'faqs',
      mapCreate: (faq: FaqItemInput) => ({
        question: faq.question || '',
        answer: faq.answer || '',
        order: faq.order || 0,
        isActive: faq.isActive !== undefined ? faq.isActive : true,
      }),
    },
  ],
  // `description` / `ctaTitle` / `ctaButtonText` / `ctaButtonLink` da aynı
  // gerekçeyle yazma yolundan çıktı: dördünü de yalnız silinen `Faq.vue`
  // okuyordu. Sütunlar ve değerleri veri tabanında duruyor.
  mapParentCreate: (b) => ({
    mainTitle: b.mainTitle || '',
  }),
  mapParentUpdate: (b) => ({
    mainTitle: b.mainTitle,
  }),
  // 'cascade' KALDI ama artık yalnız `faqs`i kapsıyor: bölüm kaydı
  // silinirse sorular da gider. statsCards/images ilişkisi yazma yolunda
  // olmadığı için bu işlemden ETKİLENMİYOR.
  deleteStrategy: 'cascade',
})
