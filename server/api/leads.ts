// server/api/leads.ts
//
// İletişim/teklif talepleri.
//
// POST herkese açık (form), diğer metotlar admin.
//
// SIRA ÖNEMLİ: talep ÖNCE veritabanına yazılıyor, mail ONDAN SONRA
// deneniyor. Öncesinde form yalnızca mail atıyordu; SMTP'de bir aksama
// olduğunda (paylaşımlı hosting'de sık) müşteri adayı tamamen kayboluyordu.
// Artık mail patlasa bile talep panelde duruyor ve kayıtta "mail gitmedi"
// bilgisi görünüyor.
import * as yup from 'yup'
import { leadsService, type LeadInput } from '../domain/leads/leads.service'
import { eventsService } from '../domain/events/events.service'
import { talepBildirimiGonder } from '../mail/service'

const leadSchema = yup.object({
  name: yup.string().trim().min(2, 'İsim çok kısa').max(120).required('İsim gerekli'),
  email: yup.string().trim().email('Geçersiz e-posta').max(180).notRequired(),
  phone: yup.string().trim().max(40).notRequired(),
  message: yup.string().trim().max(4000).notRequired(),
  sourcePage: yup.string().trim().max(191).notRequired(),
  // Bal küpü (honeypot): gerçek kullanıcı bu alanı göremez, bot doldurur.
  website: yup.string().trim().max(191).notRequired(),
})

interface LeadBody extends LeadInput {
  website?: string
}

export default defineEventHandler(async (event) => {
  const method = event.method

  // ---------------- Herkese açık: form gönderimi ----------------
  if (method === 'POST') {
    const validation = await validateOrError<LeadBody>(leadSchema, await readBody(event))
    if (!validation.success) return validation

    const veri = validation.data

    // Bal küpü doluysa sessizce başarılı dön: bota hata göstermek, hangi
    // alanın tuzak olduğunu öğretmek demek.
    if (veri.website) return { success: true, data: { id: null } }

    const kayit = await leadsService.create(veri)
    if (!kayit.success) return kayit

    // Talep güvende; buradan sonrası "en iyi çaba".
    //
    // Marka adı Site Ayarları'ndan okunuyor, koda GÖMÜLMÜYOR: panelden ad
    // değiştirildiğinde bildirim e-postasının konusu da onunla değişsin.
    // Okuma başarısız olursa mail yine gitsin diye sessizce yedeğe düşüyor —
    // bir ayar sorgusu yüzünden müşteri adayı bildirimi kaybedilmez.
    const mailSonuc = await talepBildirimiGonder(veri, await markaAdiniOku())
    await leadsService.mailSonucunuIsle(kayit.data.id, mailSonuc.ok, mailSonuc.hata)

    // Form gönderimi bir dönüşüm olayı olarak da kaydediliyor ki panelde
    // telefon/WhatsApp tıklamalarıyla aynı grafikte karşılaştırılabilsin.
    await eventsService.record('form', veri.sourcePage)

    // Mail gitmese bile kullanıcıya başarı dönülüyor — talep alındı, mesaj
    // kaydedildi. Kullanıcıya SMTP sorunu göstermenin bir faydası yok.
    return { success: true, data: { id: kayit.data.id } }
  }

  // ---------------- Buradan sonrası admin ----------------
  requireAdmin(event)

  if (method === 'GET') {
    const q = getQuery(event)
    return leadsService.list(Number(q.page) || 1, Number(q.pageSize) || 50)
  }

  if (method === 'PATCH') {
    const body = await readBody(event)
    const id = Number(body?.id)
    if (!Number.isInteger(id)) return { success: false, error: 'Geçersiz id' }
    return leadsService.setRead(id, Boolean(body?.isRead))
  }

  if (method === 'DELETE') {
    const body = await readBody(event)
    const id = Number(body?.id)
    if (!Number.isInteger(id)) return { success: false, error: 'Geçersiz id' }
    return leadsService.remove(id)
  }

  throw createError({ statusCode: 405, message: 'Desteklenmeyen metot' })
})
