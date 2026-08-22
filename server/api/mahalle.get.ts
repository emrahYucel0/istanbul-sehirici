// server/api/mahalle.get.ts
//
//     /api/mahalle?yol=kaynarca-mahallesi
//
// Tek mahalle kaydı, içeriğiyle. Dizin (`/api/istanbul-ilceler?tam=true`)
// içerik sütunlarını taşımıyor — 473 kaydın gövdesi her ilçe sayfasında
// boşuna gezmesin diye. İçerik yalnız açılan mahallede çekiliyor.
import { neighborhoodsService } from '../domain/neighborhoods/neighborhoods.service'

export default defineEventHandler((event) => {
  const yol = String(getQuery(event).yol || '').trim()
  if (!yol) return { success: false, error: 'yol parametresi zorunludur' }
  return neighborhoodsService.getByPath(yol)
})
