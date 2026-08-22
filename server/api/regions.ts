import * as yup from 'yup'
import { regionsService, type RegionInput } from '../domain/regions/regions.service'

const priceFactorSchema = yup.object({
  factor: yup.string().trim().notRequired(),
  min: yup.string().trim().notRequired(),
  max: yup.string().trim().notRequired(),
})

// --- Derinlik alanları -------------------------------------------------
// Bölge sayfalarının ince içerik riskini azaltan yapılandırılmış bölümler.
// Hepsi opsiyonel: boş bırakılan bölüm sayfada hiç render edilmiyor.

const factSchema = yup.object({
  label: yup.string().trim().notRequired(),
  value: yup.string().trim().notRequired(),
})

const faqSchema = yup.object({
  question: yup.string().trim().notRequired(),
  answer: yup.string().trim().notRequired(),
})

/**
 * Güzergâhta hedefin SLUG'I saklanmıyor, yalnızca adı. Bağlantı render
 * sırasında bölge adından çözülüyor; böylece panelden yanlış slug girmek
 * mümkün değil ve hedef bölge silinirse bağlantı kırılmıyor.
 */
const routeSchema = yup.object({
  to: yup.string().trim().notRequired(),
  note: yup.string().trim().notRequired(),
})

const depthFields = {
  neighborhoods: yup.array().of(yup.string().trim()).notRequired(),
  facts: yup.array().of(factSchema).notRequired(),
  faqs: yup.array().of(faqSchema).notRequired(),
  routes: yup.array().of(routeSchema).notRequired(),
}

const regionCreateSchema = yup.object({
  title: yup.string().trim().required(),
  subtitle: yup.string().trim().notRequired(),
  shortTitle: yup.string().trim().notRequired(),
  slug: yup.string().trim().required(),
  content: yup.string().notRequired(),
  excerpt: yup.string().notRequired(),
  metaTitle: yup.string().notRequired(),
  metaDescription: yup.string().notRequired(),
  image: yup.string().trim().notRequired(),
  imageAlt: yup.string().trim().notRequired(),
  isActive: yup.boolean().notRequired(),
  cities: yup.array().of(yup.number()).notRequired(),
  priceFactorsTitle: yup.string().trim().notRequired(),
  priceFactorsImage: yup.string().trim().notRequired(),
  priceFactors: yup.array().of(priceFactorSchema).notRequired(),
  ...depthFields,
})

const regionUpdateSchema = yup.object({
  // KİMLİK — adres artık değişebildiği için gerekli; panel zaten
  // gönderiyordu ama şemada olmadığı için `stripUnknown` atıyordu.
  id: yup.number().integer().positive().nullable().notRequired(),
  title: yup.string().trim().notRequired(),
  subtitle: yup.string().trim().notRequired(),
  shortTitle: yup.string().trim().notRequired(),
  slug: yup.string().trim().required(),
  content: yup.string().notRequired(),
  excerpt: yup.string().notRequired(),
  metaTitle: yup.string().notRequired(),
  metaDescription: yup.string().notRequired(),
  image: yup.string().trim().notRequired(),
  imageAlt: yup.string().trim().notRequired(),
  isActive: yup.boolean().notRequired(),
  cities: yup.array().of(yup.number()).notRequired(),
  priceFactorsTitle: yup.string().trim().notRequired(),
  priceFactorsImage: yup.string().trim().notRequired(),
  priceFactors: yup.array().of(priceFactorSchema).notRequired(),
  ...depthFields,
})

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const { admin } = getQuery(event)

  // Admin modunda mı? (tüm bölgeler gelsin) — bu modu sadece giriş yapmış admin isteyebilir
  const isAdminMode = admin === 'true' || admin === true

  // requireAdmin'i try/catch'in DIŞINDA çağırıyoruz ki 401 gerçekten 401 olarak dönsün,
  // servis katmanı tarafından 200 + success:false'a çevrilmesin.
  if (method !== 'GET' || isAdminMode) {
    requireAdmin(event)
  }

  if (method === 'GET') {
    const { slug, city, light, page, pageSize, kapsam } = getQuery(event)

    // KAPSAM yalnız yöneticiye açık ve kapalı küme. Herkese açık uçların
    // böyle bir ayrımı yok: ziyaretçi tarafında bölge bölgedir.
    const kapsamDegeri =
      isAdminMode && (kapsam === 'istanbul' || kapsam === 'legacy')
        ? (kapsam as 'istanbul' | 'legacy')
        : undefined
    const isLight = light === 'true'
    const pageNum = page ? Number(page) : undefined
    const pageSizeNum = pageSize ? Number(pageSize) : undefined

    if (city) {
      const cityId = parseInt(city as string)
      if (isNaN(cityId)) {
        return { success: false, error: 'Geçersiz şehir ID' }
      }
      return regionsService.get({ cityId, includeInactive: isAdminMode, light: isLight, page: pageNum, pageSize: pageSizeNum, kapsam: kapsamDegeri })
    }

    return regionsService.get({
      slug: slug ? String(slug) : undefined,
      includeInactive: isAdminMode,
      light: isLight,
      page: pageNum,
      pageSize: pageSizeNum,
      kapsam: kapsamDegeri,
    })
  }

  if (method === 'POST') {
    const validation = await validateOrError<RegionInput>(regionCreateSchema, await readBody(event))
    if (!validation.success) return validation
    return regionsService.create(validation.data)
  }

  if (method === 'PUT') {
    const validation = await validateOrError<RegionInput>(regionUpdateSchema, await readBody(event))
    if (!validation.success) return validation
    return regionsService.update(validation.data)
  }

  if (method === 'DELETE') {
    const { slug } = getQuery(event)
    if (!slug) {
      return { success: false, error: 'Slug parametresi zorunludur' }
    }
    return regionsService.remove(String(slug))
  }

  return { success: false, error: `HTTP ${method} yöntemi desteklenmiyor` }
})
