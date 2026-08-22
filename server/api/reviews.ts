// server/api/reviews.ts
//
// Müşteri yorumları. GET ve POST herkese açık, diğerleri admin.
//
// GÜVENLİK — ziyaretçiden gelen her alan düşman kabul ediliyor:
//   1. MODERASYON  Siteden gelen yorum `isApproved: false` ile kaydediliyor ve
//                  onaylanana kadar hiçbir uçtan dönmüyor. Spam önlemenin
//                  ötesinde bir gereklilik: yorumlar ileride Review/
//                  AggregateRating yapısal verisini besleyecek ve Google
//                  doğrulanmamış yorum işaretlemesini ihlal sayıyor.
//   2. TEMİZLİK    Açılı parantez ve kontrol karakterleri sunucuda eleniyor
//                  (reviews.service.ts → temizMetin). Ekranda zaten `{{ }}` ile
//                  basılıyor, yani Vue kaçış yapıyor; bu ikinci katman.
//   3. BEYAZ LİSTE Hizmet türü serbest metin değil, sabit listeden.
//                  Puan tam sayı ve 1–5 aralığında.
//   4. HIZ SINIRI  server/middleware/mailRateLimit.ts üzerinden IP başına.
//   5. BAL KÜPÜ    Gizli alan doluysa sessizce başarılı dönülüyor.
//   6. E-POSTA     Kaydediliyor ama herkese açık uçtan ASLA dönmüyor
//                  (repository'de beyaz liste ile alan seçimi).
import * as yup from 'yup'
import { reviewsService, HIZMET_TURLERI, type ReviewInput } from '../domain/reviews/reviews.service'
import { eventsService } from '../domain/events/events.service'

const reviewSchema = yup.object({
  customerName: yup.string().trim().min(2, 'Adınızı giriniz').max(60).required('Adınızı giriniz'),
  rating: yup.number().integer().min(1).max(5).required('Puan veriniz'),
  comment: yup.string().trim().min(15, 'Yorumunuz çok kısa').max(1000).required('Yorumunuzu yazınız'),
  location: yup.string().trim().max(60).notRequired(),
  serviceType: yup.string().trim().oneOf([...HIZMET_TURLERI]).notRequired(),
  email: yup.string().trim().email('Geçersiz e-posta').max(120).notRequired(),
  // Bal küpü — gerçek kullanıcı göremez.
  website: yup.string().trim().max(191).notRequired(),
})

interface ReviewBody extends ReviewInput {
  website?: string
}

export default defineEventHandler(async (event) => {
  const method = event.method

  // ---------------- Herkese açık: onaylı yorumları oku ----------------
  if (method === 'GET') {
    const q = getQuery(event)
    if (!q.admin) return reviewsService.listPublic()

    // ?admin=1 yalnızca yöneticiye; onay bekleyenler de burada.
    requireAdmin(event)
    return reviewsService.listForAdmin(q.pending === '1')
  }

  // ---------------- Herkese açık: yorum gönder ----------------
  if (method === 'POST') {
    const v = await validateOrError<ReviewBody>(reviewSchema, await readBody(event))
    if (!v.success) return v

    // Bota hangi alanın tuzak olduğunu öğretmemek için sessizce başarı.
    if (v.data.website) return { success: true, data: { id: null } }

    const sonuc = await reviewsService.submit(v.data)
    if (!sonuc.success) return sonuc

    await eventsService.record('form', getRequestHeader(event, 'referer')?.replace(/^https?:\/\/[^/]+/, '') || null)
    return { success: true, data: { id: sonuc.data.id } }
  }

  // ---------------- Buradan sonrası admin ----------------
  requireAdmin(event)

  // PATCH iki AYRI eylemi taşıyor ve hangisi olduğu gövdeden anlaşılıyor.
  // Tek bir alanda birleştirilmediler çünkü iki farklı soruyu cevaplıyorlar:
  //   isApproved  moderasyon kararı — yayınlanmaya uygun mu
  //   isActive    yayın durumu      — şu anda görünüyor mu
  if (method === 'PATCH') {
    const body = await readBody(event)
    const id = Number(body?.id)
    if (!Number.isInteger(id)) return { success: false, error: 'Geçersiz id' }

    if (body?.isActive !== undefined) {
      return reviewsService.setActive(id, Boolean(body.isActive))
    }
    return reviewsService.setApproved(id, Boolean(body?.isApproved))
  }

  if (method === 'DELETE') {
    const body = await readBody(event)
    const id = Number(body?.id)
    if (!Number.isInteger(id)) return { success: false, error: 'Geçersiz id' }
    return reviewsService.remove(id)
  }

  throw createError({ statusCode: 405, message: 'Desteklenmeyen metot' })
})
