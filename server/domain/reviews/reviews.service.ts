// server/domain/reviews/reviews.service.ts
import { getSafeErrorMessage } from '../../utils/prismaError.ts'
import { ok, fail, type ServiceResult } from '../shared/response.ts'
import { reviewsRepository } from './reviews.repository.ts'
import { ANASAYFA_YORUM_SAYISI } from './reviews.public-fields.ts'

export interface ReviewInput {
  customerName: string
  rating: number
  comment: string
  location?: string
  serviceType?: string
  email?: string
}

/** Formda seçilebilecek hizmet türleri — serbest metin KABUL EDİLMİYOR. */
export const HIZMET_TURLERI = [
  'Evden Eve Nakliyat',
  'Şehirler Arası Nakliyat',
  'Ofis Taşıma',
  'Parça Eşya Taşıma',
  'Asansörlü Nakliyat',
  'Eşya Depolama',
  'Paketleme ve Ambalajlama',
] as const

/**
 * Ziyaretçiden gelen metni temizler.
 *
 * Yorum ekranda `{{ }}` ile basılıyor, yani Vue zaten kaçış yapıyor ve
 * `v-html` hiçbir yerde kullanılmıyor. Buradaki temizlik ikinci savunma
 * katmanı: veritabanına etiket girmesin ki ileride bir yerde ham basılırsa
 * ya da dışa aktarılırsa sorun çıkmasın.
 *
 * Yaklaşım "kötü olanı sil" değil, "yalnızca izin verileni bırak":
 * açılı parantezler tamamen eleniyor, kontrol karakterleri düşüyor,
 * ardışık boşluklar tekleniyor.
 */
export const temizMetin = (deger: unknown, azamiUzunluk: number): string =>
  String(deger ?? '')
    .replace(/[<>]/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, azamiUzunluk)

async function submit(input: ReviewInput): Promise<ServiceResult<{ id: number }>> {
  try {
    // TAM SAYI KIRPILMIYOR, REDDEDİLİYOR.
    //
    // Burada `Math.trunc` vardı: 4,7 sessizce 4'e düşüyordu. HTTP katmanı
    // (yup `.integer()`) böyle bir değeri zaten reddediyor, yani kırpma
    // hiç çalışmayan bir yoldu — ama çalışsaydı ziyaretçinin vermediği bir
    // puanı onun adına yazmış olurduk. Sessiz normalleştirme yerine açık
    // ret: iki katman da aynı şeyi söylüyor.
    const puan = Number(input.rating)
    if (!Number.isInteger(puan) || puan < 1 || puan > 5) {
      return fail('Puan 1 ile 5 arasında tam sayı olmalı')
    }

    const ad = temizMetin(input.customerName, 60)
    if (ad.length < 2) return fail('Adınızı giriniz')

    const yorum = temizMetin(input.comment, 1000)
    if (yorum.length < 15) return fail('Yorumunuz çok kısa (en az 15 karakter)')

    // HİZMET TÜRÜ BEYAZ LİSTEDEN — VE UYDURULMUYOR.
    //
    // Eskiden eşleşmeyen/boş değer sessizce `HIZMET_TURLERI[0]`e ("Evden Eve
    // Nakliyat") düşüyordu. Yani ziyaretçinin hiç söylemediği bir hizmet
    // türü onun yorumuna iliştirilip veri tabanına yazılıyordu. Form artık
    // bu alanı sormuyor (bkz. components/base/ReviewForm.vue); sorulmayan
    // bir şeyi varsaymak yerine boş bırakılıyor.
    const tur = (HIZMET_TURLERI as readonly string[]).includes(String(input.serviceType))
      ? String(input.serviceType)
      : ''

    const bolumId = await reviewsRepository.defaultSectionId()
    if (!bolumId) return fail('Yorum bölümü bulunamadı')

    const kayit = await reviewsRepository.create({
      customerName: ad,
      rating: puan,
      comment: yorum,
      location: temizMetin(input.location, 60) || null,
      serviceType: tur,
      email: temizMetin(input.email, 120) || null,
      testimonialSectionId: bolumId,
    })

    return ok({ id: kayit.id })
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function listPublic(): Promise<ServiceResult<any>> {
  try {
    const [items, stats] = await Promise.all([
      reviewsRepository.findPublic(),
      reviewsRepository.publicStats(),
    ])
    return ok({
      items,
      // AggregateRating için: yalnızca ONAYLI yorumların ortalaması.
      ortalama: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : null,
      adet: stats._count._all,
    })
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

/**
 * ANA SAYFA BÖLÜMÜ — liste + sayaç.
 *
 * `listPublic` ile aynı public'e uygunluk koşulunu kullanıyor (tek kaynak,
 * bkz. reviews.public-fields). Fark yalnız sıralama ve sayıda.
 *
 * SAHTE YEDEK YOK: onaylı yorum yoksa `items` boş dizi, `ortalama` null ve
 * `adet` 0 dönüyor. Bölüm bu durumda puan satırını hiç basmıyor.
 */
async function listForHome(): Promise<
  ServiceResult<{
    items: { id: number; customerName: string; rating: number; comment: string; date: Date }[]
    ortalama: number | null
    adet: number
    gosterilen: number
  }>
> {
  try {
    const [items, stats] = await Promise.all([
      reviewsRepository.findForHome(),
      reviewsRepository.publicStats(),
    ])
    return ok({
      items,
      ortalama: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : null,
      // Uygun kayıtların TAMAMI — gösterilen liste değil.
      adet: stats._count._all,
      gosterilen: ANASAYFA_YORUM_SAYISI,
    })
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function listForAdmin(onlyPending: boolean): Promise<ServiceResult<any>> {
  try {
    const [items, pending] = await Promise.all([
      reviewsRepository.findForAdmin(onlyPending),
      reviewsRepository.countPending(),
    ])
    return ok({ items, pending })
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

/**
 * YAYIN DURUMU — ONAYDAN AYRI EYLEM (M6).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NEDEN İKİNCİ BİR EYLEM GEREKTİ
 *
 * M5 sonunda panelde tek eylem vardı: onayla / onayı kaldır. Ziyaretçi
 * yorumu `isActive: true` doğduğu için onay tek başına yayınlamaya
 * yetiyordu ve akış çalışıyordu.
 *
 * Ama `isActive: false` olan bir kaydı YAYINA ALMANIN hiçbir yolu yoktu.
 * Yönetici bir yorumu geçici olarak yayından çıkarıp sonra geri getirmek
 * isterse panelde karşılığı yoktu — kayıt "onaylı ama pasif" durumunda
 * kilitleniyordu.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NEDEN ONAYLA BİRLEŞTİRİLMEDİ
 *
 * İki alan iki ayrı soruyu cevaplıyor:
 *   isApproved  bu yorum yayınlanmaya UYGUN mu (moderasyon kararı)
 *   isActive    şu anda yayında mı (yayın durumu)
 *
 * Tek düğmede birleştirilseydi, "onayı kaldır"ın moderasyon kararını mı
 * yoksa görünürlüğü mü değiştirdiği belirsizleşirdi.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ÖRNEK/DEMO KAYITLARIN YAYINA ALINMASI KOLAYLAŞMIYOR
 *
 * Bu eylem yalnız ZİYARETÇİDEN GELEN yorumlarda (`source: 'site'`)
 * çalışıyor. Yerel veri tabanındaki üç örnek kayıt `source: 'admin'` ve
 * `isActive: false`; onları yayına almak hâlâ mümkün değil. Uydurma bir
 * yorumun yayına gitmesini kolaylaştırmak M5'in tam tersi olurdu.
 */
async function setActive(id: number, isActive: boolean): Promise<ServiceResult<any>> {
  try {
    const kayit = await reviewsRepository.findById(id)
    if (!kayit) return fail('Yorum bulunamadı')

    if (kayit.source !== 'site') {
      return fail(
        'Bu yorum ziyaretçi formundan gelmemiş (panelden girilmiş eski bir kayıt). ' +
          'Yayın durumu yalnız ziyaretçi yorumları için değiştirilebilir.'
      )
    }

    return ok(await reviewsRepository.setActive(id, isActive))
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function setApproved(id: number, isApproved: boolean): Promise<ServiceResult<any>> {
  try {
    return ok(await reviewsRepository.setApproved(id, isApproved))
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function remove(id: number): Promise<ServiceResult<null>> {
  try {
    await reviewsRepository.remove(id)
    return ok(null, 'Yorum silindi')
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

export const reviewsService = {
  submit,
  listPublic,
  listForHome,
  listForAdmin,
  setApproved,
  setActive,
  remove,
}
