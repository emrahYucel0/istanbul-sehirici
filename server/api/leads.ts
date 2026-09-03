// server/api/leads.ts
//
// İletişim/teklif talepleri.
//
// POST herkese açık (form), diğer metotlar admin.
//
// SIRA ÖNEMLİ: talep ÖNCE veritabanına yazılıyor, mail ONDAN SONRA
// deneniyor. Öncesinde form yalnızca mail atıyordu; SMTP'de bir aksama
// olduğunda (paylaşımlı hosting'de sık) müşteri adayı tamamen kayboluyordu.
// Artık mail patlasa bile talep panelde duruyor ve kayıtta "mail gitmedi"
// bilgisi görünüyor.
import * as yup from 'yup'
import { leadsService, type LeadInput } from '../domain/leads/leads.service'
import { eventsService } from '../domain/events/events.service'
import { talepBildirimiGonder } from '../mail/service'
import { priceEstimatorCrudService } from '../domain/sections/configs/price-estimator.config'
import {
  DEVIR_HEDEFI,
  DEVIR_KAYNAK_SAYFASI,
  devirEtiketleriniCoz,
  devirOzeti,
  devirliMesaj,
  fiyatDevriniOku,
} from '#shared/utils/fiyat-devri'

const leadSchema = yup.object({
  name: yup.string().trim().min(2, 'İsim çok kısa').max(120).required('İsim gerekli'),
  email: yup.string().trim().email('Geçersiz e-posta').max(180).notRequired(),
  phone: yup.string().trim().max(40).notRequired(),
  message: yup.string().trim().max(4000).notRequired(),
  sourcePage: yup.string().trim().max(191).notRequired(),
  // Bal küpü (honeypot): gerçek kullanıcı bu alanı göremez, bot doldurur.
  website: yup.string().trim().max(191).notRequired(),
  /**
   * FİYAT HESAPLAYICININ HAM SEÇİMLERİ — adres satırıyla AYNI biçimde.
   *
   * Dokuz kısa dize; hepsi `#shared/utils/fiyat-devri` içindeki AYNI
   * doğrulayıcıdan geçiyor. Etiket, taban fiyat, çarpan ya da tutar
   * KABUL EDİLMİYOR: şema yalnız bu dokuz anahtarı tanıyor ve
   * `validateOrError` `stripUnknown: true` ile çalıştığı için fazladan
   * gelen her alan sessizce düşüyor.
   */
  hesap: yup
    .object({
      kaynak: yup.string().trim().max(40).notRequired(),
      oda: yup.string().trim().max(8).notRequired(),
      mesafe: yup.string().trim().max(8).notRequired(),
      cikisKat: yup.string().trim().max(8).notRequired(),
      cikisAsansor: yup.string().trim().max(4).notRequired(),
      varisKat: yup.string().trim().max(8).notRequired(),
      varisAsansor: yup.string().trim().max(4).notRequired(),
      paketleme: yup.string().trim().max(4).notRequired(),
      depolama: yup.string().trim().max(4).notRequired(),
    })
    .notRequired()
    .default(undefined),
})

interface LeadBody extends LeadInput {
  website?: string
  hesap?: Record<string, string | undefined>
}

/**
 * HESAPLAYICI BAĞLAMINI SUNUCU ÜRETİYOR.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NEDEN İSTEMCİYE BIRAKILAMAZ
 *
 * Bağlam önce formun mesaj kutusuna ön dolgu olarak konuyordu. Kutu
 * DÜZENLENEBİLİR: kullanıcı metni silerse `ContactLead.message` artık
 * hesaplayıcıda gerçekten ne seçildiğini göstermiyordu. Yani kayıt,
 * kullanıcının silme kararına bağlıydı.
 *
 * Artık istemci yalnız HAM SEÇİMLERİ yolluyor; metni sunucu üretiyor.
 *
 * ÜÇ ŞEYE GÜVENİLMİYOR
 *   1. BİÇİM   — dokuz alan `fiyatDevriniOku`dan geçiyor (adres satırıyla
 *                aynı fonksiyon).
 *   2. GERÇEKLİK — kimlikler veri tabanındaki gerçek `PriceEstimatorSize`
 *                / `PriceEstimatorDistance` kayıtlarına karşı çözülüyor.
 *                Sabit liste yok.
 *   3. ETİKET  — ekrana ve kayda giden adlar İSTEMCİDEN DEĞİL, o
 *                kayıtlardan geliyor.
 *
 * FİYAT YAZILMIYOR. Ne istemciden okunuyor ne sunucuda hesaplanıp kayda
 * konuyor: kayıt bir teklif değil (bkz. shared → `devirOzeti`).
 *
 * GEÇERSİZ BAĞLAM TALEBİ DÜŞÜRMEZ. Doğrulama tutmazsa `null` dönüyor,
 * talep normal bir iletişim talebi olarak kaydediliyor. İstisna yok.
 */
async function hesapOzetiniCoz(hesap?: Record<string, string | undefined>): Promise<string | null> {
  const girdi = fiyatDevriniOku(hesap)
  if (!girdi) return null

  try {
    const kayit = await priceEstimatorCrudService.get()
    const veri = kayit?.success ? kayit.data : null
    if (!veri) return null

    const etiketler = devirEtiketleriniCoz(
      girdi,
      (veri.sizes || []).map((o: { id: number; label: string }) => ({ id: o.id, ad: o.label })),
      (veri.distances || []).map((m: { id: number; label: string }) => ({ id: m.id, ad: m.label }))
    )
    return etiketler ? devirOzeti(etiketler) : null
  } catch (error) {
    // Katsayı okunamadıysa bağlam yazılmıyor — ama talep kaybolmuyor.
    console.error('Hesaplayıcı bağlamı çözülemedi:', error)
    return null
  }
}

/**
 * `sourcePage` SİTE İÇİ BİR YOL OLMAK ZORUNDA.
 *
 * Alan istemciden geliyor ve panelde `<code>` olarak basılıyor. İstemci
 * bugün yalnız iki değer yazıyor — geçerli rota ya da hesaplayıcıdan
 * gelindiğinde `/fiyat-hesaplama` sabiti — ama alanın kendisi serbest
 * metindi: dışarıdan bir POST buraya tam bir dış adres ya da bir
 * `javascript:` dizesi yazabilirdi.
 *
 * Kural dar ve TARAFI BELLİ: `/` ile başlayan, ASCII yol karakterleri
 * taşıyan, en fazla 191 karakterlik bir yol. Sorgu satırı da dışarıda —
 * hesap devrinin parametreleri kaynak alanına sızmıyor.
 *
 * REDDETMİYOR, DÜŞÜRÜYOR: uymayan değer `undefined` oluyor ve talep yine
 * kaydediliyor. Kaynak bilgisi için bir müşteri adayını kaybetmek yanlış
 * takas olurdu.
 */
const GUVENLI_YOL = /^\/[A-Za-z0-9\-._~/]{0,190}$/

const yoluSuz = (deger?: string): string | undefined => {
  const y = String(deger ?? '').trim()
  return GUVENLI_YOL.test(y) ? y : undefined
}

export default defineEventHandler(async (event) => {
  const method = event.method

  // ---------------- Herkese açık: form gönderimi ----------------
  if (method === 'POST') {
    const validation = await validateOrError<LeadBody>(leadSchema, await readBody(event))
    if (!validation.success) return validation

    const veri = validation.data

    // Bal küpü doluysa sessizce başarılı dön: bota hata göstermek, hangi
    // alanın tuzak olduğunu öğretmek demek.
    if (veri.website) return { success: true, data: { id: null } }

    /**
     * HESAPLAYICI BAĞLAMI — KAYDIN BAŞINA, SUNUCU ELİYLE.
     *
     * Kullanıcının yazdığı metin EZİLMİYOR: kanonik özet onun ÜSTÜNE
     * ekleniyor ve not olduğu gibi altta duruyor. Kullanıcı formdaki
     * kutuyu tamamen boş bıraksa bile özet kayda giriyor.
     *
     * KAYNAK DA BURADAN BELİRLENİYOR. İstemcinin ne yazdığına
     * bakılmıyor: bağlam GERÇEKTEN doğrulandıysa kaynak sabit
     * `/fiyat-hesaplama`, doğrulanmadıysa istemcinin bildirdiği yol
     * (süzgeçten geçmiş hâliyle). Böylece sorgu parametresi ekleyerek
     * kaydı hesaplayıcıdan gelmiş gibi göstermek mümkün değil.
     */
    const hesapOzeti = await hesapOzetiniCoz(veri.hesap)
    if (hesapOzeti) {
      veri.message = devirliMesaj(hesapOzeti, veri.message ?? '')
      veri.sourcePage = DEVIR_KAYNAK_SAYFASI
    } else if (veri.sourcePage?.trim() === DEVIR_KAYNAK_SAYFASI) {
      /**
       * `/fiyat-hesaplama` BU ALANDA SUNUCUYA AYRILMIŞ BİR DEĞER.
       *
       * Talep formu yalnız `/iletisim`de duruyor; gerçek bir gönderimde
       * istemcinin bildirdiği yol hiçbir zaman `/fiyat-hesaplama` olamaz.
       * Ölçüldü: elle hazırlanmış bir POST bu dizeyi yazarak, hiç
       * hesaplayıcı bağlamı göndermeden kaydı araçtan gelmiş gibi
       * gösterebiliyordu. Doğrulanmış bağlam yoksa değer düşürülüyor.
       *
       * `sourcePage` genelinde bir allowlist YOK ve olmamalı: alanın işi
       * 39 ilçe ve 473 mahalle sayfasından hangisinin müşteri getirdiğini
       * bildirmek. Rezerve edilen tek değer bu.
       */
      veri.sourcePage = DEVIR_HEDEFI
    }
    // `hesap` kayda GİRMİYOR; yalnız metni üretmek için okundu.
    delete veri.hesap

    // Kaynak yolu tek noktada süzülüyor: hem kayıt hem dönüşüm olayı aynı
    // temizlenmiş değeri görüyor.
    veri.sourcePage = yoluSuz(veri.sourcePage)

    const kayit = await leadsService.create(veri)
    if (!kayit.success) return kayit

    // Talep güvende; buradan sonrası "en iyi çaba".
    //
    // Marka adı Site Ayarları'ndan okunuyor, koda GÖMÜLMÜYOR: panelden ad
    // değiştirildiğinde bildirim e-postasının konusu da onunla değişsin.
    // Okuma başarısız olursa mail yine gitsin diye sessizce yedeğe düşüyor —
    // bir ayar sorgusu yüzünden müşteri adayı bildirimi kaybedilmez.
    const mailSonuc = await talepBildirimiGonder(veri, await markaAdiniOku())
    await leadsService.mailSonucunuIsle(kayit.data.id, mailSonuc.ok, mailSonuc.hata)

    // Form gönderimi bir dönüşüm olayı olarak da kaydediliyor ki panelde
    // telefon/WhatsApp tıklamalarıyla aynı grafikte karşılaştırılabilsin.
    await eventsService.record('form', veri.sourcePage)

    // Mail gitmese bile kullanıcıya başarı dönülüyor — talep alındı, mesaj
    // kaydedildi. Kullanıcıya SMTP sorunu göstermenin bir faydası yok.
    return { success: true, data: { id: kayit.data.id } }
  }

  // ---------------- Buradan sonrası admin ----------------
  requireAdmin(event)

  if (method === 'GET') {
    const q = getQuery(event)
    return leadsService.list(Number(q.page) || 1, Number(q.pageSize) || 50)
  }

  if (method === 'PATCH') {
    const body = await readBody(event)
    const id = Number(body?.id)
    if (!Number.isInteger(id)) return { success: false, error: 'Geçersiz id' }
    return leadsService.setRead(id, Boolean(body?.isRead))
  }

  if (method === 'DELETE') {
    const body = await readBody(event)
    const id = Number(body?.id)
    if (!Number.isInteger(id)) return { success: false, error: 'Geçersiz id' }
    return leadsService.remove(id)
  }

  throw createError({ statusCode: 405, message: 'Desteklenmeyen metot' })
})
