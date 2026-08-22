// server/api/services-yayin.post.ts
//
// HİZMETİ YAYINA ALMA / YAYINDAN KALDIRMA.
//
//     POST /api/services-yayin  { slug: "esya-depolama", yayinda: true }
//
// Anahtar `slug`: bölüm kaydı her PUT'ta `Service` satırlarını silip
// yeniden yarattığı için `id` KALICI DEĞİL. Slug ise hem kalıcı hem de
// hizmetin herkese açık kimliği; adresi olmayan bir hizmetin yayınlanacak
// bir sayfası da yok.
import * as yup from 'yup'
import { servicesSectionService } from '../domain/sections/configs/services.config'

const schema = yup.object({
  slug: yup.string().trim().required(),
  yayinda: yup.boolean().required(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const v = await validateOrError<{ slug: string; yayinda: boolean }>(schema, await readBody(event))
  if (!v.success) return v

  return v.data.yayinda
    ? servicesSectionService.publish(v.data.slug)
    : servicesSectionService.unpublish(v.data.slug)
})
