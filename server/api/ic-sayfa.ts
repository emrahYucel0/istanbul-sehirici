// server/api/ic-sayfa.ts
//
// İç sayfa editoryal içeriği. GET herkese açık (sayfalar SSR'da okuyor),
// `?admin=true` ve PUT yalnız yöneticiye.
//
// Ana sayfanın karşılığı `/api/anasayfa`; bu onun iç sayfa eşi.
import * as yup from 'yup'
import { internalPageService, type IcBolumGirdisi } from '../domain/internal-page/internal-page.service'

const ogeSchema = yup.object({
  label: yup.string().trim().notRequired(),
  title: yup.string().trim().notRequired(),
  body: yup.string().trim().notRequired(),
  note: yup.string().trim().notRequired(),
  imagePath: yup.string().trim().max(255).notRequired(),
  imageAlt: yup.string().trim().notRequired(),
})

const bolumSchema = yup.object({
  pageKey: yup.string().trim().required(),
  sectionKey: yup.string().trim().required(),
  heading: yup.string().trim().notRequired(),
  lead: yup.string().trim().notRequired(),
  note: yup.string().trim().notRequired(),
  closing: yup.string().trim().notRequired(),
  imagePath: yup.string().trim().max(255).notRequired(),
  imageAlt: yup.string().trim().notRequired(),
  items: yup.array().of(ogeSchema).notRequired(),
})

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const q = getQuery(event)

    // Yönetim okuması: bütün sayfalar tek yanıtta.
    if (q.admin) {
      requireAdmin(event)
      return internalPageService.getForAdmin()
    }

    // Herkese açık okuma: TEK sayfa. `page` zorunlu — bütün iç sayfaların
    // içeriğini tek istekte dökmek, her sayfaya kendi işine yaramayan
    // içeriği taşımak olurdu.
    const sayfa = String(q.page ?? '')
    return internalPageService.getPage(sayfa)
  }

  // Buradan sonrası admin.
  requireAdmin(event)

  if (method === 'PUT') {
    const v = await validateOrError<IcBolumGirdisi>(bolumSchema, await readBody(event))
    if (!v.success) return v
    return internalPageService.update(v.data)
  }

  throw createError({ statusCode: 405, message: 'Desteklenmeyen metot' })
})
