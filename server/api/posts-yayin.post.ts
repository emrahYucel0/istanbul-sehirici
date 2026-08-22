// server/api/posts-yayin.post.ts
//
// YAZIYI YAYINA ALMA / YAYINDAN KALDIRMA.
//
//     POST /api/posts-yayin  { slug: "kis-aylarinda-tasinmak", yayinda: true }
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN GENEL GÜNCELLEMEDEN AYRI
//
// `isActive` düzenleme gövdesinin bir alanı olsaydı "kaydetmek" ile
// "yayınlamak" aynı eylem olurdu — bu milestone'un kapattığı sorunun ta
// kendisi. Alan `PostInput` sözleşmesinde YOK ve yup şeması
// `stripUnknown: true` ile çalıştığı için gövdede gönderilse bile servise
// ulaşmıyor.
//
// Mahalle yayın ucuyla (server/api/mahalle-yayin.post.ts) aynı desen;
// anahtar orada `id`, burada `slug` çünkü yazının kimliği zaten slug
// (repository'nin update/delete metotları da slug ile çalışıyor).
import * as yup from 'yup'
import { postsService } from '../domain/posts/posts.service'

const schema = yup.object({
  slug: yup.string().trim().required(),
  yayinda: yup.boolean().required(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const v = await validateOrError<{ slug: string; yayinda: boolean }>(schema, await readBody(event))
  if (!v.success) return v

  return v.data.yayinda
    ? postsService.publish(v.data.slug)
    : postsService.unpublish(v.data.slug)
})
