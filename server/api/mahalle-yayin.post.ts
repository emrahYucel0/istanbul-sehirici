// server/api/mahalle-yayin.post.ts
//
// YAYINA ALMA / YAYINDAN KALDIRMA — ayrı bir eylem ucu.
//
//     POST /api/mahalle-yayin  { id: 12, yayinda: true }
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN GENEL GÜNCELLEMEDEN AYRI
//
// `isActive` düzenleme gövdesinin bir alanı olsaydı, panelde bir onay
// kutusu kalite kapısının on iki maddesini tek tıkla geçersiz kılardı ve
// kapı yalnız komut satırında anlamlı kalırdı. Ayrı uç, ayrı niyet: burada
// gelen her istek kapıdan geçiyor.
//
// Kapıdan geçemeyen istek veri tabanına DOKUNMUYOR; yanıt kural listesini
// (`kapi.kurallar`) taşıyor, panel onu "YAYINA HAZIRLIK" olarak basıyor.
import * as yup from 'yup'
import { neighborhoodsService } from '../domain/neighborhoods/neighborhoods.service'

const schema = yup.object({
  id: yup.number().integer().positive().required(),
  yayinda: yup.boolean().required(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const v = await validateOrError<{ id: number; yayinda: boolean }>(schema, await readBody(event))
  if (!v.success) return v

  return v.data.yayinda
    ? neighborhoodsService.publish(v.data.id)
    : neighborhoodsService.unpublish(v.data.id)
})
