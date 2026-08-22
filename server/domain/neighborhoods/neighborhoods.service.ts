//
// MAHALLE DOMAIN KATMANI.
//
// Sayfa üç şey soruyor:
//   1. "/kaynarca-mahallesi" hangi mahalle?   → getByPath
//   2. o mahallenin kardeşleri kimler?        → getByPath (aynı yanıtta)
//   3. bu ilçenin YAYINDAKİ mahalleleri?      → listByDistrictSlug
//
// Panel dört şey yapıyor: listeler, oluşturur, düzenler, yayına alır.
//
// ─────────────────────────────────────────────────────────────────────────
// KURALLARIN TEK SAHİBİ BURASI
//
// API rotaları yalnız HTTP + yup + `requireAdmin` taşıyor, panel yalnız
// arayüz. "Kim yayına girebilir", "adres nasıl üretilir", "hangi ilçe
// ebeveyn olabilir" sorularının cevabı BU dosyada ve tek kopya.
//
// ─────────────────────────────────────────────────────────────────────────
// `isActive` GENEL GÜNCELLEMEDE YOK — BİLİNÇLİ
//
// `update()` yayın durumuna dokunmuyor ve girdi sözleşmesinde böyle bir
// alan yok. Olsaydı, panelde bir onay kutusu kalite kapısının on bir
// maddesini tek tıkla geçersiz kılardı. Yayın ayrı bir eylem:
// `publish()` / `unpublish()`.
// `#shared` ALIAS'I DEĞİL göreli yol: `prisma/mahalle-yayina-al.mjs` bu
// servisi doğrudan import ediyor ve düz Node alias çözemiyor.
import { istanbulIlcesiMi } from '../../../shared/utils/istanbul.ts'
import { ok, fail, type ServiceResult } from '../shared/response.ts'
import { getSafeErrorMessage, isUniqueConstraintError } from '../../utils/prismaError.ts'
import { sanitizeContentFields } from '../../utils/sanitizeHtml.ts'
import { kokAdresleriTopla } from '../shared/root-paths.ts'
import { mahalleKimligi } from './neighborhood.identity.ts'
import { mahalleKapisi, type KapiKurali, type KapiSonucu } from './neighborhood.gate.ts'
import { neighborhoodsRepository, type PanelSuzgeci } from './neighborhoods.repository.ts'

// --- sözleşmeler ----------------------------------------------------------

export interface NeighborhoodDetail {
  yol: string
  ad: string
  ilce: string
  ilceAd: string
  aktif: boolean
  title: string | null
  excerpt: string | null
  content: string | null
  metaTitle: string | null
  metaDescription: string | null
  faqs: unknown
  facts: unknown
  imagePath: string | null
  imageAlt: string | null
  /** Aynı ilçedeki mahalleler (bu dahil) — kardeş gezinmesi için. */
  kardesler: { ad: string; yol: string; aktif: boolean }[]
}

/**
 * Panelden yazılabilen alanlar.
 *
 * `slug`, `canonicalPath` ve `isActive` BİLEREK YOK: ilk ikisi addan ve
 * ilçeden türetiliyor (bkz. neighborhood.identity.ts), üçüncüsü ayrı bir
 * eylem. Panelden gelen bir gövde bu üçünü taşısa bile yup şeması
 * `stripUnknown` ile atıyor, buraya hiç ulaşmıyorlar.
 */
export interface NeighborhoodInput {
  districtId: number
  name: string
  title?: string | null
  excerpt?: string | null
  content?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  faqs?: unknown
  facts?: unknown
  imagePath?: string | null
  imageAlt?: string | null
}

export interface NeighborhoodUpdateInput extends NeighborhoodInput {
  id: number
}

/**
 * Kapı raporu taşıyabilen yanıt zarfı.
 *
 * Standart `ServiceResult` yalnız `error` metnini taşıyor; panelin
 * "YAYINA HAZIRLIK" listesini basabilmesi için kuralların TAMAMI gerekiyor
 * — yalnız kalanlar değil, geçenler de. Zarf bu yüzden `kapi` alanıyla
 * genişletildi. Alan OPSİYONEL: kapıyla ilgisi olmayan hatalar (kayıt yok,
 * ilçe geçersiz) eskisi gibi düz metin dönüyor.
 */
export type KapiliSonuc<T> =
  | { success: true; data: T; message?: string; kapi?: KapiSonucu }
  | { success: false; error: string; kapi?: KapiSonucu }

const metin = (v: unknown): string | null => {
  const t = String(v ?? '').trim()
  return t ? t : null
}

const jsonListesi = (v: unknown): any[] => {
  if (Array.isArray(v)) return v
  if (typeof v !== 'string' || !v.trim()) return []
  try {
    const x = JSON.parse(v)
    return Array.isArray(x) ? x : []
  } catch {
    return []
  }
}

// --- ortak yardımcılar ----------------------------------------------------

/** İlçe adının görünen hâli — kayıtta üç alan var, sırası sabit. */
const ilceAdi = (ilce: any): string =>
  String(ilce?.subtitle || ilce?.shortTitle || ilce?.title || ilce?.slug || '').trim()

/**
 * Kapıyı bir aday kayıt için çalıştırır ve kök adres çakışmasını EK bir
 * kural satırı olarak ekler.
 *
 * Çakışma denetimi kapı modülünün İÇİNDE değil çünkü o modül bilerek
 * veri tabanından bağımsız (betik de onu import ediyor). Sonuç yine tek
 * listede birleşiyor, panel ikisini ayırt etmek zorunda kalmıyor.
 */
interface KapiBaglamKaynagi {
  /** Adres → o adresi taşıyan mahalle adedi. 1'den büyükse tekrar var. */
  yolSayaci: Map<string, number>
  /** Arama açıklaması → adet. */
  aciklamaSayaci: Map<string, number>
  /** Mahalle DIŞINDAKİ kök adresler: statik rota, yazı, bölge, hizmet. */
  disKaynaklar: Set<string>
  /** Adresi kimin tuttuğunu söyleyen harita — hata metni için. */
  sahip: Map<string, string>
}

/**
 * Kapı bağlamını BİR KEZ yükler.
 *
 * Sayaç tabanlı olması bilinçli: "kendisi hariç" bir küme kurmak yerine
 * adedin 1'den büyük olup olmadığına bakılıyor. Böylece hem tek kayıt hem
 * 473 kayıt aynı bağlamla değerlendirilebiliyor ve betik kayıt başına
 * sorgu atmak zorunda kalmıyor.
 */
async function kapiBaglaminiYukle(): Promise<KapiBaglamKaynagi> {
  const [aciklamalar, kokAdresler, mahalleYollari] = await Promise.all([
    neighborhoodsRepository.findOtherMetaDescriptions(),
    kokAdresleriTopla(),
    neighborhoodsRepository.findAllPaths(),
  ])

  const aciklamaSayaci = new Map<string, number>()
  for (const x of aciklamalar as any[]) {
    const a = String(x.metaDescription ?? '').trim()
    if (a) aciklamaSayaci.set(a, (aciklamaSayaci.get(a) || 0) + 1)
  }

  const yolSayaci = new Map<string, number>()
  for (const m of mahalleYollari as any[]) {
    yolSayaci.set(m.canonicalPath, (yolSayaci.get(m.canonicalPath) || 0) + 1)
  }

  return {
    yolSayaci,
    aciklamaSayaci,
    disKaynaklar: kokAdresler.disKaynaklar,
    sahip: kokAdresler.sahip,
  }
}

/**
 * Bir adayı kapıdan geçirir ve kök adres çakışmasını EK bir kural satırı
 * olarak ekler.
 *
 * Çakışma denetimi kapı modülünün İÇİNDE değil çünkü o modül bilerek veri
 * tabanından bağımsız. Sonuç yine tek listede birleşiyor; panel ikisini
 * ayırt etmek zorunda kalmıyor.
 *
 * `kendiYolu`: düzenlenen/incelenen kaydın veri tabanındaki mevcut adresi.
 * Aday adres bununla aynıysa sayaçtaki bir tane KENDİSİDİR, çakışma değil.
 */
function kapiyiDegerlendir(
  aday: any,
  ilce: any,
  baglam: KapiBaglamKaynagi,
  kendiYolu?: string | null,
  kendiAciklamasi?: string | null
): KapiSonucu {
  const kendiAciklama = String(kendiAciklamasi ?? '').trim()

  const sonuc = mahalleKapisi(aday, {
    ilce,
    aciklamaTekrarEdiyorMu: (a) => {
      const adet = baglam.aciklamaSayaci.get(a) || 0
      // Kaydın kendi açıklaması sayaca dahil; aday aynı açıklamayı
      // koruyorsa bir tanesi kendisidir.
      return adet > (a === kendiAciklama ? 1 : 0)
    },
    adresTekrarEdiyorMu: (yol) => {
      const adet = baglam.yolSayaci.get(yol) || 0
      return adet > (yol === kendiYolu ? 1 : 0)
    },
  })

  const yol = String(aday.canonicalPath ?? '')
  const disCakisma = Boolean(yol) && baglam.disKaynaklar.has(yol)
  const ekKural: KapiKurali = {
    anahtar: 'kok-cakisma',
    etiket: 'Adres başka bir sayfayı gölgelemiyor',
    gecti: !disCakisma,
    ...(disCakisma
      ? { ayrinti: `/${yol} adresi zaten kullanımda (${baglam.sahip.get(yol) ?? 'bilinmeyen kayıt'}).` }
      : {}),
  }

  const kurallar = [...sonuc.kurallar, ekKural]
  const hatalar = kurallar.filter((k) => k.gecti === false).map((k) => k.ayrinti || k.etiket)
  return { gecti: hatalar.length === 0, kurallar, hatalar }
}

/** Tek kayıt için: bağlamı yükle, değerlendir. */
async function kapiyiCalistir(aday: any, ilce: any, kendiYolu?: string | null, kendiAciklamasi?: string | null): Promise<KapiSonucu> {
  const baglam = await kapiBaglaminiYukle()
  return kapiyiDegerlendir(aday, ilce, baglam, kendiYolu, kendiAciklamasi)
}

/** Kayıt + ilçe → kapının beklediği aday şekli. */
const adayYap = (kayit: any) => ({
  canonicalPath: kayit.canonicalPath,
  title: kayit.title,
  excerpt: kayit.excerpt,
  content: kayit.content,
  metaDescription: kayit.metaDescription,
  faqs: kayit.faqs,
  facts: kayit.facts,
})

// --- herkese açık okuma ---------------------------------------------------

async function getByPath(canonicalPath: string): Promise<ServiceResult<NeighborhoodDetail | null>> {
  try {
    const kayit = await neighborhoodsRepository.findByPath(canonicalPath)
    if (!kayit) return ok(null)

    // Ebeveyn İSTANBUL İLÇESİ değilse mahalle sayfası açılmıyor. Veri
    // tabanı bunu zorlayamıyor (aynı tabloda hem il hem ilçe var), kural
    // burada ve yayın kapısında uygulanıyor.
    if (!istanbulIlcesiMi(kayit.district)) return ok(null)

    // Kardeşler AYNI YANITTA: mahalle sayfası ikisini birden kullanıyor ve
    // ayrı bir uç nokta ikinci bir gidiş-dönüş (şelale) demek olurdu.
    // Pasif kardeşler de geliyor — bu liste mahalle sayfasında duruyor,
    // ilçe sayfasında değil; kabuklar birbirine `noindex, follow` ile
    // bağlanmaya devam ediyor.
    const kardesler = await neighborhoodsRepository.findByDistrictId(kayit.districtId)

    // İçerik `article/Prose.vue` içinde `v-html` ile basılıyor. Temizlik
    // diğer içerik ailelerindeki gibi OKUMA anında, tek yardımcıyla
    // yapılıyor (bkz. server/utils/sanitizeHtml.ts).
    return ok(
      sanitizeContentFields({
        yol: kayit.canonicalPath,
        ad: kayit.name,
        ilce: kayit.district.slug,
        ilceAd: ilceAdi(kayit.district),
        aktif: kayit.isActive,
        title: kayit.title,
        excerpt: kayit.excerpt,
        content: kayit.content,
        metaTitle: kayit.metaTitle,
        metaDescription: kayit.metaDescription,
        faqs: kayit.faqs,
        facts: kayit.facts,
        imagePath: kayit.imagePath,
        imageAlt: kayit.imageAlt,
        kardesler: kardesler.map((k: any) => ({ ad: k.name, yol: k.canonicalPath, aktif: k.isActive })),
      })
    )
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

/**
 * Bir ilçenin YAYINDAKİ mahalleleri — ilçe sayfasının listesi ve sayısı.
 *
 * Liste ile sayı TEK sorgudan çıkıyor: ikisi ayrı kaynaktan gelseydi
 * (sayı JSON'dan, liste tablodan) ekranda "17 MAHALLE" yazıp üç satır
 * göstermek mümkün olurdu — bu ailenin tam olarak düzeltilen hatası.
 */
async function listByDistrictSlug(
  ilceSlug: string,
  secenek: { aktifSadece?: boolean } = {}
): Promise<ServiceResult<{ ilce: string; mahalleler: { ad: string; yol: string; aktif: boolean }[] }>> {
  try {
    const ilce = await neighborhoodsRepository.findDistrictBySlug(ilceSlug)
    // İstanbul dışı bir kayıt ya da il sayfası mahalle listelemiyor.
    if (!ilce || !istanbulIlcesiMi(ilce)) return ok({ ilce: ilceSlug, mahalleler: [] })

    const kayitlar = await neighborhoodsRepository.findByDistrictId(
      ilce.id,
      secenek.aktifSadece !== false
    )
    return ok({
      ilce: ilce.slug,
      mahalleler: kayitlar.map((k: any) => ({ ad: k.name, yol: k.canonicalPath, aktif: k.isActive })),
    })
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

// --- panel okuma ----------------------------------------------------------

async function listForAdmin(suzgec: PanelSuzgeci = {}): Promise<ServiceResult<any>> {
  try {
    const [kayitlar, bolgeler] = await Promise.all([
      neighborhoodsRepository.listForAdmin(suzgec),
      neighborhoodsRepository.findDistricts(),
    ])
    const ilceler = bolgeler.filter((b: any) => istanbulIlcesiMi(b))
    const idyeGore = new Map(ilceler.map((i: any) => [i.id, i]))

    return ok({
      // İlçe seçeneği kaynağı BURASI: panel kendi 39'luk listesini
      // tutmuyor, `istanbulIlcesiMi` ile süzülmüş Region kayıtlarını
      // kullanıyor. İkinci bir İstanbul ilçe listesi oluşmuyor.
      ilceler: ilceler.map((i: any) => ({
        id: i.id,
        slug: i.slug,
        ad: ilceAdi(i),
        aktif: Boolean(i.isActive),
      })),
      mahalleler: kayitlar.map((k: any) => {
        const ilce: any = idyeGore.get(k.districtId)
        return {
          id: k.id,
          districtId: k.districtId,
          ilceSlug: ilce?.slug ?? null,
          ilceAd: ilce ? ilceAdi(ilce) : null,
          ad: k.name,
          slug: k.slug,
          yol: k.canonicalPath,
          aktif: k.isActive,
          baslikVar: Boolean(k.title),
          ozetVar: Boolean(k.excerpt),
          metaVar: Boolean(k.metaDescription),
          gorselVar: Boolean(k.imagePath),
          guncellendi: k.updatedAt,
        }
      }),
    })
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

/** Tek kayıt + o kaydın güncel kapı durumu — düzenleme ekranı için. */
async function getForAdmin(id: number): Promise<ServiceResult<any>> {
  try {
    const kayit = await neighborhoodsRepository.findById(id)
    if (!kayit) return fail('Mahalle kaydı bulunamadı.')

    const kapi = await kapiyiCalistir(adayYap(kayit), kayit.district, kayit.canonicalPath, kayit.metaDescription)

    return ok({
      kayit: {
        id: kayit.id,
        districtId: kayit.districtId,
        ilceSlug: kayit.district.slug,
        ilceAd: ilceAdi(kayit.district),
        ilceAktif: Boolean(kayit.district.isActive),
        name: kayit.name,
        slug: kayit.slug,
        canonicalPath: kayit.canonicalPath,
        isActive: kayit.isActive,
        title: kayit.title,
        excerpt: kayit.excerpt,
        content: kayit.content,
        metaTitle: kayit.metaTitle,
        metaDescription: kayit.metaDescription,
        faqs: jsonListesi(kayit.faqs),
        facts: jsonListesi(kayit.facts),
        imagePath: kayit.imagePath,
        imageAlt: kayit.imageAlt,
      },
      kapi,
    })
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

// --- yazma ----------------------------------------------------------------

/** Ebeveyn adayını doğrular; geçerliyse ilçe kaydını döner. */
async function ilceyiCoz(districtId: number): Promise<{ ilce: any } | { hata: string }> {
  const bolgeler = await neighborhoodsRepository.findDistricts()
  const ilce = bolgeler.find((b: any) => b.id === districtId)
  if (!ilce) return { hata: 'Seçilen ilçe bulunamadı.' }
  if (!istanbulIlcesiMi(ilce)) {
    return {
      hata: `"${ilceAdi(ilce)}" bir İstanbul ilçesi değil. Mahalle yalnız İstanbul ilçesine bağlanabilir.`,
    }
  }
  return { ilce }
}

async function create(body: NeighborhoodInput): Promise<ServiceResult<any>> {
  try {
    const ebeveyn = await ilceyiCoz(body.districtId)
    if ('hata' in ebeveyn) return fail(ebeveyn.hata)

    const kokAdresler = await kokAdresleriTopla()
    const kimlik = mahalleKimligi({
      ad: body.name,
      ilceSlug: ebeveyn.ilce.slug,
      doluYollar: kokAdresler.hepsi,
    })
    if (!kimlik.basarili) return fail(kimlik.hata)

    // YENİ KAYIT HER ZAMAN PASİF. İçerik eksik olabilir; taslak mantığı
    // `isActive` üzerinden yürüyor ve yayına alma ayrı bir eylem.
    const kayit = await neighborhoodsRepository.create({
      districtId: ebeveyn.ilce.id,
      name: body.name.trim(),
      slug: kimlik.slug,
      canonicalPath: kimlik.canonicalPath,
      isActive: false,
      title: metin(body.title),
      excerpt: metin(body.excerpt),
      content: metin(body.content),
      metaTitle: metin(body.metaTitle),
      metaDescription: metin(body.metaDescription),
      faqs: jsonListesi(body.faqs),
      facts: jsonListesi(body.facts),
      imagePath: metin(body.imagePath),
      imageAlt: metin(body.imageAlt),
    })

    return ok(
      { id: kayit.id, canonicalPath: kayit.canonicalPath, yedekAdres: kimlik.yedek },
      kimlik.yedek
        ? `Mahalle oluşturuldu. Bu ad başka ilçede de kullanıldığı için adres ilçe önekli verildi: /${kimlik.canonicalPath}`
        : 'Mahalle oluşturuldu. Yayına almak için kalite kapısını geçmesi gerekiyor.'
    )
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return fail('Bu ad bu ilçede zaten kayıtlı ya da adres kullanımda.')
    }
    return fail(getSafeErrorMessage(error))
  }
}

async function update(body: NeighborhoodUpdateInput): Promise<KapiliSonuc<any>> {
  try {
    const mevcut = await neighborhoodsRepository.findById(body.id)
    if (!mevcut) return fail('Mahalle kaydı bulunamadı.')

    const ebeveyn = await ilceyiCoz(body.districtId)
    if ('hata' in ebeveyn) return fail(ebeveyn.hata)

    const adDegisti = body.name.trim() !== mevcut.name
    const ilceDegisti = ebeveyn.ilce.id !== mevcut.districtId

    let slug = mevcut.slug
    let canonicalPath = mevcut.canonicalPath

    if (adDegisti || ilceDegisti) {
      const kokAdresler = await kokAdresleriTopla({ haricMahalleId: mevcut.id })
      const kimlik = mahalleKimligi({
        ad: body.name,
        ilceSlug: ebeveyn.ilce.slug,
        doluYollar: kokAdresler.hepsi,
      })
      if (!kimlik.basarili) return fail(kimlik.hata)

      // YAYINDAKİ BİR ADRES DEĞİŞTİRİLMİYOR.
      //
      // Ad ya da ilçe değişince adres de değişiyor; kayıt yayındaysa bu,
      // canlı bir URL'nin sessizce 404'e düşmesi demek. Yönlendirme
      // sistemi bu turda kurulmadığı için işlem reddediliyor ve yöneticiye
      // sıra söyleniyor: önce yayından kaldır, sonra değiştir.
      if (mevcut.isActive && kimlik.canonicalPath !== mevcut.canonicalPath) {
        return fail(
          `Bu mahalle yayında ve değişiklik adresini /${mevcut.canonicalPath} yerine ` +
            `/${kimlik.canonicalPath} yapardı. Yayındaki bir adres sessizce taşınmıyor: ` +
            'önce "Yayından kaldır", sonra adı/ilçeyi değiştirin.'
        )
      }

      slug = kimlik.slug
      canonicalPath = kimlik.canonicalPath
    }

    const aday = {
      canonicalPath,
      title: metin(body.title),
      excerpt: metin(body.excerpt),
      content: metin(body.content),
      metaDescription: metin(body.metaDescription),
      faqs: jsonListesi(body.faqs),
      facts: jsonListesi(body.facts),
    }

    // AKTİF KAYIT KORUMASI.
    //
    // Yayındaki bir sayfa düzenlemeyle kapının altına düşemez. Aksi hâlde
    // "önce geçerli içerikle yayına al, sonra içeriği sil" yolu kapıyı
    // tamamen anlamsız kılardı. Sessiz yayından kaldırma YAPILMIYOR:
    // yönetici neyin kaldığını görüp düzeltsin.
    if (mevcut.isActive) {
      const kapi = await kapiyiCalistir(aday, ebeveyn.ilce, mevcut.canonicalPath, mevcut.metaDescription)
      if (!kapi.gecti) {
        return {
          success: false,
          error:
            'Bu mahalle yayında ve değişiklik kalite kapısının altına düşürüyor: ' +
            kapi.hatalar.join(' · '),
          // Kural listesi zarfta gidiyor ki panel neyin kaldığını
          // satır satır gösterebilsin.
          kapi,
        }
      }
    }

    await neighborhoodsRepository.update(mevcut.id, {
      districtId: ebeveyn.ilce.id,
      name: body.name.trim(),
      slug,
      canonicalPath,
      title: aday.title,
      excerpt: aday.excerpt,
      content: aday.content,
      metaTitle: metin(body.metaTitle),
      metaDescription: aday.metaDescription,
      faqs: aday.faqs,
      facts: aday.facts,
      imagePath: metin(body.imagePath),
      imageAlt: metin(body.imageAlt),
    })

    return ok({ id: mevcut.id, canonicalPath }, 'Kaydedildi.')
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return fail('Bu ad bu ilçede zaten kayıtlı ya da adres kullanımda.')
    }
    return fail(getSafeErrorMessage(error))
  }
}

/**
 * BÜTÜN kayıtların kapı durumu — TEK bağlam yüklemesiyle.
 *
 * `prisma/mahalle-yayina-al.mjs` bunu çağırıyor. Kayıt başına
 * `gateStatus()` çağrılsaydı 473 × 6 sorgu olurdu; burada bağlam bir kez
 * yükleniyor ve değerlendirme bellekte yapılıyor.
 *
 * Panelin tek kayıt için gördüğü sonuçla birebir aynı işlevden geçiyor —
 * "CLI ve panel aynı cevabı verir" bir yorum değil, tek kod yolu.
 */
async function gateStatusAll(): Promise<
  ServiceResult<{ id: number; canonicalPath: string; isActive: boolean; kapi: KapiSonucu }[]>
> {
  try {
    const [kayitlar, baglam] = await Promise.all([
      neighborhoodsRepository.findAllWithDistrict(),
      kapiBaglaminiYukle(),
    ])

    return ok(
      (kayitlar as any[]).map((k) => ({
        id: k.id,
        canonicalPath: k.canonicalPath,
        isActive: k.isActive,
        kapi: kapiyiDegerlendir(adayYap(k), k.district, baglam, k.canonicalPath, k.metaDescription),
      }))
    )
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

/** Kapı raporu — panel "YAYINA HAZIRLIK" listesini bundan basıyor. */
async function gateStatus(id: number): Promise<ServiceResult<KapiSonucu>> {
  try {
    const kayit = await neighborhoodsRepository.findById(id)
    if (!kayit) return fail('Mahalle kaydı bulunamadı.')
    return ok(await kapiyiCalistir(adayYap(kayit), kayit.district, kayit.canonicalPath, kayit.metaDescription))
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function publish(id: number): Promise<KapiliSonuc<any>> {
  try {
    const kayit = await neighborhoodsRepository.findById(id)
    if (!kayit) return fail('Mahalle kaydı bulunamadı.')

    const kapi = await kapiyiCalistir(adayYap(kayit), kayit.district, kayit.canonicalPath, kayit.metaDescription)
    if (!kapi.gecti) {
      // KAYIT DEĞİŞMİYOR. Kapıdan geçemeyen bir yayın denemesi veri
      // tabanına dokunmuyor; yalnız rapor dönüyor.
      return { success: false, error: `Yayına alınamadı: ${kapi.hatalar.join(' · ')}`, kapi }
    }

    if (!kayit.isActive) await neighborhoodsRepository.setActive(kayit.id, true)
    return ok({ id: kayit.id, canonicalPath: kayit.canonicalPath, aktif: true, kapi }, 'Yayına alındı.')
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function unpublish(id: number): Promise<ServiceResult<any>> {
  try {
    const kayit = await neighborhoodsRepository.findById(id)
    if (!kayit) return fail('Mahalle kaydı bulunamadı.')
    if (kayit.isActive) await neighborhoodsRepository.setActive(kayit.id, false)
    return ok(
      { id: kayit.id, canonicalPath: kayit.canonicalPath, aktif: false },
      'Yayından kaldırıldı. Adres açık kalır ama arama motoruna kapanır.'
    )
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

export const neighborhoodsService = {
  getByPath,
  listByDistrictSlug,
  listForAdmin,
  getForAdmin,
  create,
  update,
  gateStatus,
  gateStatusAll,
  publish,
  unpublish,
}
