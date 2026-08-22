// server/api/anasayfa.ts
//
// ANA SAYFA İÇERİĞİ.
//
//     GET  /api/anasayfa              herkese açık — sayfanın tek isteği
//     GET  /api/anasayfa?admin=true   yönetici — ham bölüm listesi
//     PUT  /api/anasayfa              yönetici — tek bölümü günceller
//
// GENEL BİR SAYFA API'Sİ DEĞİL: yol sabit, bölüm anahtarları kapalı küme
// (bkz. shared/utils/anasayfa.ts). Başka bir sayfa bu uçtan yönetilemiyor.
import * as yup from 'yup'
import { homeService, type AnasayfaBolumGirdisi } from '../domain/home/home.service'

const ogeSemasi = yup.object({
  label: yup.string().trim().notRequired(),
  subLabel: yup.string().trim().notRequired(),
  title: yup.string().trim().notRequired(),
  body: yup.string().notRequired(),
  imagePath: yup.string().trim().notRequired(),
  imageAlt: yup.string().trim().notRequired(),
})

// `sectionKey` burada serbest metin: kapalı kümeye ait olup olmadığını
// servis katmanı denetliyor ve okunur bir hata dönüyor. Şemaya `oneOf`
// yazılsaydı yönetici "sectionKey geçersiz" gibi ham bir doğrulama hatası
// görürdü; hangi anahtarların geçerli olduğunu söyleyen cümle servis
// tarafında.
const bolumSemasi = yup.object({
  sectionKey: yup.string().trim().required(),
  heading: yup.string().notRequired(),
  lead: yup.string().notRequired(),
  note: yup.string().notRequired(),
  closing: yup.string().notRequired(),
  closingNote: yup.string().notRequired(),
  ctaLabel: yup.string().trim().notRequired(),
  imagePath: yup.string().trim().notRequired(),
  imageAlt: yup.string().trim().notRequired(),
  items: yup.array().of(ogeSemasi).notRequired(),
})

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    // Yönetici modu ham bölüm kayıtlarını döndürüyor (boş bölümler dahil);
    // herkese açık okuma ise bileşenlerin beklediği birleştirilmiş yanıtı.
    // `requireAdmin` try/catch DIŞINDA çağrılıyor ki 401 gerçekten 401
    // olsun (bkz. server/api/posts.ts'teki aynı desen).
    const yoneticiModu = String(getQuery(event).admin ?? '') === 'true'
    if (yoneticiModu) {
      requireAdmin(event)
      return homeService.getForAdmin()
    }
    return homeService.get()
  }

  requireAdmin(event)

  if (method === 'PUT') {
    const v = await validateOrError<AnasayfaBolumGirdisi>(bolumSemasi, await readBody(event))
    if (!v.success) return v
    return homeService.update(v.data)
  }

  return { success: false, error: `HTTP ${method} yöntemi desteklenmiyor.` }
})
