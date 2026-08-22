// server/api/mahalleler.get.ts
//
// İKİ MOD — ikisi de salt okuma, ikisi de herkese açık.
//
//     /api/mahalleler?aktif=true          → sitemap: yayındaki tüm adresler
//     /api/mahalleler?ilce=pendik         → ilçe sayfası: o ilçenin YAYINDAKİ
//                                           mahalleleri (ad + adres)
//     /api/mahalleler?ilce=pendik&aktif=false
//                                         → mahalle sayfası kardeş listesi:
//                                           pasif kabuklar dahil
//
// `ilce` verilmeden `aktif=true` sitemap biçimini (`canonicalPath` +
// `updatedAt`) döndürüyor; bu davranış DEĞİŞMEDİ.
//
// Parametresiz çağrı hâlâ reddediliyor: 473 kaydın tamamını dışa açan bir
// uç noktaya ihtiyaç yok ve gereksiz yüzey açmıyoruz.
import { neighborhoodsRepository } from '../domain/neighborhoods/neighborhoods.repository'
import { neighborhoodsService } from '../domain/neighborhoods/neighborhoods.service'
import { ok, fail } from '../domain/shared/response'
import { getSafeErrorMessage } from '../utils/prismaError'

export default defineEventHandler(async (event) => {
  const { ilce, aktif } = getQuery(event)

  if (ilce) {
    // Varsayılan YAYINDAKİLER. Kardeş listesi için açıkça `aktif=false`
    // isteniyor — ilçe sayfası hiçbir koşulda pasif mahalle listelemiyor.
    return neighborhoodsService.listByDistrictSlug(String(ilce), {
      aktifSadece: aktif !== 'false',
    })
  }

  if (aktif !== 'true') {
    return fail('aktif=true ya da ilce parametresi zorunludur')
  }

  try {
    return ok(await neighborhoodsRepository.findActive())
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
})
