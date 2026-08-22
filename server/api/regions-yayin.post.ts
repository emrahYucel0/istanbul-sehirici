// server/api/regions-yayin.post.ts
//
// İSTANBUL İLÇESİNİ YAYINA ALMA / YAYINDAN KALDIRMA.
//
//     POST /api/regions-yayin  { slug: "avcilar", yayinda: true }
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN AYRI UÇ
//
// `RegionPanel`'deki `isActive` onay kutusu doğrudan `PUT /api/regions`'a
// gidiyordu ve `regionsService.update` hiçbir kapı çalıştırmıyordu — yani
// on maddelik kalite kapısı yalnız komut satırında anlamlıydı. Yayın artık
// bu uçtan geçiyor ve buraya gelen her istek kapıdan geçiyor.
//
// Kapıdan geçemeyen istek veri tabanına DOKUNMUYOR; yanıt kural listesini
// (`kapi.kurallar`) taşıyor, panel onu "YAYINA HAZIRLIK" olarak basıyor.
//
// YALNIZ İSTANBUL İLÇELERİ. İstanbul dışı 336 legacy kayıt bu ucu
// kullanmıyor; onların yayın durumu eskisi gibi `PUT /api/regions`
// gövdesindeki `isActive` ile yönetiliyor (bkz. regions.service.ts).
import * as yup from 'yup'
import { regionsService } from '../domain/regions/regions.service'

const schema = yup.object({
  slug: yup.string().trim().required(),
  yayinda: yup.boolean().required(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const v = await validateOrError<{ slug: string; yayinda: boolean }>(schema, await readBody(event))
  if (!v.success) return v

  return v.data.yayinda
    ? regionsService.publishDistrict(v.data.slug)
    : regionsService.unpublishDistrict(v.data.slug)
})
