// server/api/regions-kapi.get.ts
//
//     GET /api/regions-kapi?slug=avcilar
//
// Tek bir İstanbul ilçesinin kalite kapısı raporu. Panel bunu düzenleme
// ekranını açarken çekiyor: yönetici "yayınlanamadı" yerine hangi maddenin
// kaldığını satır satır görüyor.
//
// Yönetici işi: kapı raporu pasif bir ilçenin eksiklerini anlatıyor ve
// herkese açık bir yüzey değil.
import { regionsService } from '../domain/regions/regions.service'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const slug = String(getQuery(event).slug || '').trim()
  if (!slug) return { success: false, error: 'slug parametresi zorunludur' }

  return regionsService.districtGateStatus(slug)
})
