// server/api/medya.ts
//
// MEDYA KÜTÜPHANESİ — YALNIZ YÖNETİCİ.
//
// GÜVENLİK:
//   · Bütün metotlar `requireAdmin`. Herkese açık bir envanter ucu YOK:
//     ziyaretçi yalnız zaten seçilmiş varlık adreslerini görür, dosya
//     adlarını ve yönetim üstverisini değil.
//   · Silme YOL ile değil KİMLİK ile çalışıyor; gerçek dosya adı sunucuda
//     veri tabanından okunuyor (bkz. media.service → remove).
import { mediaService } from '../domain/files/media.service'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const method = event.method

  if (method === 'GET') {
    const q = getQuery(event)

    // Tek görselin kullanım raporu.
    if (q.kullanim) return mediaService.usage(String(q.kullanim))

    return mediaService.list({
      arama: q.arama ? String(q.arama) : undefined,
      suzgec: q.suzgec ? String(q.suzgec) : undefined,
      sayfa: q.sayfa ? Number(q.sayfa) : undefined,
      sayfaBoyu: q.sayfaBoyu ? Number(q.sayfaBoyu) : undefined,
    })
  }

  if (method === 'DELETE') {
    const body = await readBody(event)
    // `anahtar` bir MANTIKSAL GÖRSEL adı (boyut eki olmadan), dosya yolu
    // değil. Servis onu veri tabanındaki satırlarla eşleştiriyor; eşleşme
    // yoksa hiçbir şey silinmiyor.
    return mediaService.remove(String(body?.anahtar ?? ''))
  }

  throw createError({ statusCode: 405, message: 'Desteklenmeyen metot' })
})
