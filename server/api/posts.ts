import * as yup from 'yup'
import { postsService, type PostInput } from '../domain/posts/posts.service'

const postSchema = yup.object({
  // KİMLİK — güncellemede adres değişebildiği için gerekli.
  //
  // Panel bu alanı zaten gönderiyordu ama şemada olmadığı için
  // `stripUnknown` sessizce atıyordu. `nullable`: yeni kayıt formunda
  // değeri `null` (bkz. PostPanel initialShape).
  id: yup.number().integer().positive().nullable().notRequired(),
  title: yup.string().trim().required(),
  subtitle: yup.string().trim().notRequired(),
  shortTitle: yup.string().trim().notRequired(),
  author: yup.string().trim().notRequired(),
  slug: yup.string().trim().required(),
  content: yup.string().notRequired(),
  excerpt: yup.string().notRequired(),
  metaTitle: yup.string().notRequired(),
  metaDescription: yup.string().notRequired(),
  image: yup.string().trim().notRequired(),
  imageAlt: yup.string().trim().notRequired(),
})

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const { admin } = getQuery(event)

  // TASLAKLARI GÖRMEK YETKİ İSTER.
  //
  // `?admin=true` yalnız yönetim panelinin kullandığı mod: taslak yazıları
  // da döndürüyor. Bölge ucundaki (server/api/regions.ts) aynı desen —
  // `requireAdmin` try/catch DIŞINDA çağrılıyor ki 401 gerçekten 401 olarak
  // dönsün, servis katmanı tarafından 200 + success:false'a çevrilmesin.
  const isAdminMode = admin === 'true' || admin === true

  if (method !== 'GET' || isAdminMode) {
    requireAdmin(event)
  }

  if (method === 'GET') {
    const { slug, light, page, pageSize } = getQuery(event)
    return postsService.get(
      slug ? String(slug) : undefined,
      light === 'true',
      page ? { page: Number(page), pageSize: pageSize ? Number(pageSize) : undefined } : undefined,
      { includeDrafts: isAdminMode }
    )
  }

  if (method === 'POST') {
    const validation = await validateOrError<PostInput>(postSchema, await readBody(event))
    if (!validation.success) return validation
    return postsService.create(validation.data)
  }

  if (method === 'PUT') {
    const validation = await validateOrError<PostInput>(postSchema, await readBody(event))
    if (!validation.success) return validation
    return postsService.update(validation.data)
  }

  if (method === 'DELETE') {
    const { slug } = getQuery(event)
    return postsService.remove(String(slug))
  }

  return { success: false, error: `HTTP ${method} yöntemi desteklenmiyor.` }
})
