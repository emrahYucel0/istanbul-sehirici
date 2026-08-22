// server/api/mahalle-yonetim.ts
//
// MAHALLE PANELİNİN UCU — tamamı yönetici.
//
//     GET  /api/mahalle-yonetim                   liste + ilçe seçenekleri
//     GET  /api/mahalle-yonetim?id=12             tek kayıt + kapı raporu
//     GET  /api/mahalle-yonetim?id=12&kapi=true   yalnız kapı raporu
//     POST /api/mahalle-yonetim                   yeni mahalle (pasif başlar)
//     PUT  /api/mahalle-yonetim                   düzenle
//
// Yayına alma BURADA DEĞİL: `POST /api/mahalle-yayin`. Ayrı olmasının
// sebebi, `isActive`'in genel düzenleme gövdesinde taşınmaması — bir onay
// kutusu kalite kapısını geçersiz kılamamalı.
//
// DİKKAT: `validateOrError` `stripUnknown: true` ile çalışıyor, yani
// şemada olmayan alan sessizce düşer. Bu burada bir ÖZELLİK: panel yanlışlıkla
// `isActive` ya da `canonicalPath` gönderse bile servise ulaşmıyorlar.
import * as yup from 'yup'
import {
  neighborhoodsService,
  type NeighborhoodInput,
  type NeighborhoodUpdateInput,
} from '../domain/neighborhoods/neighborhoods.service'

const faqSchema = yup.object({
  question: yup.string().trim().notRequired(),
  answer: yup.string().trim().notRequired(),
})

const factSchema = yup.object({
  label: yup.string().trim().notRequired(),
  value: yup.string().trim().notRequired(),
})

/** Ortak alanlar — create ve update aynı gövdeyi taşıyor, farkı `id`. */
const ortakAlanlar = {
  districtId: yup.number().integer().positive().required(),
  name: yup.string().trim().required(),
  title: yup.string().notRequired(),
  excerpt: yup.string().notRequired(),
  content: yup.string().notRequired(),
  metaTitle: yup.string().notRequired(),
  metaDescription: yup.string().notRequired(),
  faqs: yup.array().of(faqSchema).notRequired(),
  facts: yup.array().of(factSchema).notRequired(),
  imagePath: yup.string().trim().notRequired(),
  imageAlt: yup.string().trim().notRequired(),
}

const createSchema = yup.object({ ...ortakAlanlar })
const updateSchema = yup.object({ id: yup.number().integer().positive().required(), ...ortakAlanlar })

export default defineEventHandler(async (event) => {
  // Panelin tamamı yönetici işi — okuma dahil. Pasif kabukların içeriği ve
  // kapı raporu herkese açık bir yüzey değil.
  requireAdmin(event)

  const method = event.node.req.method

  if (method === 'GET') {
    const { id, kapi, ilce, aktif, arama } = getQuery(event)

    if (id) {
      const sayi = Number(id)
      if (!Number.isInteger(sayi) || sayi <= 0) return { success: false, error: 'Geçersiz id' }
      return kapi === 'true'
        ? neighborhoodsService.gateStatus(sayi)
        : neighborhoodsService.getForAdmin(sayi)
    }

    // Süzgeçler SUNUCUDA uygulanıyor: 473 kaydı panele gönderip tarayıcıda
    // filtrelemek hem gereksiz yük hem de sayfalama önünde engel olurdu.
    const districtId = ilce ? Number(ilce) : undefined
    if (ilce && (!Number.isInteger(districtId) || (districtId as number) <= 0)) {
      return { success: false, error: 'Geçersiz ilçe' }
    }

    return neighborhoodsService.listForAdmin({
      ...(districtId === undefined ? {} : { districtId }),
      ...(aktif === undefined || aktif === '' ? {} : { isActive: aktif === 'true' }),
      ...(arama ? { arama: String(arama).trim() } : {}),
    })
  }

  if (method === 'POST') {
    const v = await validateOrError<NeighborhoodInput>(createSchema, await readBody(event))
    if (!v.success) return v
    return neighborhoodsService.create(v.data)
  }

  if (method === 'PUT') {
    const v = await validateOrError<NeighborhoodUpdateInput>(updateSchema, await readBody(event))
    if (!v.success) return v
    return neighborhoodsService.update(v.data)
  }

  // DELETE BİLEREK YOK.
  //
  // Yayına girmiş bir mahalle adresi Google'ın dizininde ve dış
  // bağlantılarda yaşayabilir; kaydı silmek o adresi 404'e çevirir ve
  // geri dönüşü olmaz. "Yayından kaldır" (isActive=false) aynı işi
  // geri alınabilir biçimde yapıyor: sayfa dizinden çıkıyor, adres
  // `noindex` bir kabuk olarak ayakta kalıyor.
  throw createError({ statusCode: 405, message: 'Desteklenmeyen metot' })
})
