// server/domain/sections/configs/services.config.ts
import prisma from '../../../utils/prisma'
import { createSectionCrudService } from '../section-crud.factory'
import {
  kokAdresleriTopla,
  kokCakismasiniBul,
  kokYolunuNormallestir,
  kokYoluDenetle,
} from '../../shared/root-paths'

export interface ServiceItemInput {
  imagePath?: string
  imageAlt?: string
  title?: string
  subtitle?: string
  description?: string
  order?: number
  // --- Kendi sayfası olan hizmetler --------------------------------------
  // DİKKAT: bu bölüm `deleteStrategy: 'manual'` ile çalışıyor, yani her PUT
  // önce tüm Service satırlarını SİLİP yeniden yaratıyor. Aşağıdaki alanlar
  // hem burada hem server/api/services.ts'deki yup şemasında bulunmak
  // ZORUNDA: validateOrError `stripUnknown: true` ile çalıştığı için şemada
  // olmayan bir alan sessizce düşer ve bir sonraki panel kaydında hizmet
  // sayfalarının içeriği tamamen kaybolur.
  slug?: string | null
  excerpt?: string
  metaTitle?: string
  metaDescription?: string
  content?: string
  includes?: string[]
  faqs?: { question?: string; answer?: string }[]
}

// NOT: Güven bandı (giriş metni + rakamlar) buradan ÇIKARILDI. Kendi bölümü
// ve kendi paneli var: server/domain/sections/configs/trust-bar.config.ts.
// `buttonText`/`buttonLink` de kaldırıldı — ikisi de ana sayfadan kaldırılan
// hizmetler bölümünün düğmesine aitti, hiçbir bileşen okumuyordu.
export interface ServicesInput {
  sectionName?: string
  mainTitle?: string
  description?: string
  services?: ServiceItemInput[]
}

/**
 * YAYIN DURUMU — GÜNCELLEME BOYUNCA TAŞINAN DEĞER.
 *
 * Bu bölüm `deleteStrategy: 'manual'` ile çalışıyor: her PUT tüm `Service`
 * satırlarını SİLİP yeniden yaratıyor. Yayın durumu için bu iki kötü
 * seçenek üretiyordu —
 *
 *   (a) `isActive`i düzenleme gövdesine koymak: panelde bir onay kutusu
 *       yayın kararını verirdi, yani "kaydetmek yayınlamaktır"a geri dönüş.
 *   (b) hiç koymamak: her kayıtta bütün hizmetler taslağa düşerdi.
 *
 * Seçilen üçüncü yol: durum güncelleme ÖNCESİ `slug` bazında okunuyor ve
 * satırlar yeniden yaratılırken geri yazılıyor. Yeni bir slug (yani yeni
 * hizmet) haritada bulunmadığı için taslak başlıyor.
 *
 * ZAMANLAMA — ölçülmüş bir kısıt üzerine kurulu:
 * `servicesCrudService.update()` çağrıldığı anda önce `children` üzerinde
 * dönüyor; bu bölümde `manualNestedCleanup` tanımlı OLMADIĞI için o döngü
 * hiç `await` etmiyor ve `mapCreate` ilk `await`ten ÖNCE, aynı senkron
 * bloğun içinde çalışıyor. Harita bu yüzden çağrıdan hemen önce
 * doldurulduğunda araya başka bir isteğin girmesi mümkün değil.
 */
let yayinDurumu = new Map<string, boolean>()

export const servicesCrudService = createSectionCrudService<any, ServicesInput>(prisma.services, {
  defaultSectionName: 'services',
  include: {
    services: { orderBy: { order: 'asc' } },
  },
  children: [
    {
      relation: 'services',
      mapCreate: (s: ServiceItemInput) => ({
        imagePath: s.imagePath || '',
        imageAlt: s.imageAlt?.trim() || null,
        title: s.title || '',
        subtitle: s.subtitle,
        description: s.description,
        order: s.order || 0,
        // Boş dize DEĞİL null: `slug` sütunu UNIQUE. Sayfası olmayan birden
        // fazla hizmet '' değerini paylaşamaz (çakışma hatası verir), ama
        // NULL değerler UNIQUE kısıtlamasından muaftır.
        slug: s.slug?.trim() || null,
        excerpt: s.excerpt || null,
        metaTitle: s.metaTitle || null,
        metaDescription: s.metaDescription || null,
        content: s.content || null,
        includes: s.includes || [],
        faqs: s.faqs || [],
        // Yayın durumu gövdeden GELMİYOR (bkz. yukarıdaki not): güncelleme
        // öncesi okunan haritadan geri yazılıyor. Slug'ı olmayan ya da
        // haritada bulunmayan (yeni) hizmet taslak başlıyor.
        isActive: yayinDurumu.get(s.slug?.trim() || '') ?? false,
      }),
    },
  ],
  mapParentCreate: (b) => ({
    mainTitle: b.mainTitle || '',
    description: b.description,
  }),
  mapParentUpdate: (b) => ({
    mainTitle: b.mainTitle,
    description: b.description,
  }),
  deleteStrategy: 'manual',
  manualDeleteDelegates: [
    (sectionName) => prisma.service.deleteMany({ where: { services: { sectionName } } }),
  ],
})

// ─────────────────────────────────────────────────────────────────────────
// YAYIN KATMANI
//
// Fabrikanın ürettiği CRUD servisi olduğu gibi kalıyor; aşağıdaki sarmalayıcı
// yalnız yayın durumunu yönetiyor. Genel bir "publication engine" YAPILMADI:
// üç varlığın (yazı, hizmet, ilçe) yayın anlamı farklı ve ortaklaştırma
// hepsini birden yanlış yapardı.

/** Hizmetin herkese açık olabilmesi için gereken asgari alanlar. */
function yayinaHazirMi(hizmet: any): string[] {
  const hatalar: string[] = []
  if (!String(hizmet?.title ?? '').trim()) hatalar.push('başlık boş')
  // Adres YAYIN İÇİN ZORUNLU: slug'ı olmayan hizmetin sayfası yok, yani
  // yayınlanacak bir şeyi de yok.
  if (!String(hizmet?.slug ?? '').trim()) hatalar.push('adres (slug) boş')
  const govde = String(hizmet?.content ?? '').replace(/<[^>]*>/g, '').trim()
  const ozet = String(hizmet?.excerpt ?? '').trim()
  if (!govde && !ozet) hatalar.push('içerik ve özet birlikte boş')
  return hatalar
}

async function get(options: { includeDrafts?: boolean } = {}) {
  const sonuc = await servicesCrudService.get()
  if (!sonuc.success || !sonuc.data) return sonuc
  if (options.includeDrafts) return sonuc

  // HERKESE AÇIK OKUMA: taslak hizmetler yanıttan çıkıyor. Süzgeç burada,
  // tüketicilerde değil — `/hizmetlerimiz`, hizmet detayı, hakkımızda
  // listesi ve sitemap aynı ucu okuduğu için tek yerde süzmek hepsini
  // birden doğru yapıyor.
  const kayit: any = sonuc.data
  return { ...sonuc, data: { ...kayit, services: (kayit.services || []).filter((x: any) => x.isActive) } }
}

/**
 * ADAY KÜMENİN TAMAMINI YIKICI SİLMEDEN ÖNCE DENETLER.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NEDEN TEK TEK DEĞİL, KÜME OLARAK
 *
 * Bu bölüm `deleteStrategy: 'manual'` ile çalışıyor: `servicesCrudService
 * .update()` çağrıldığı anda ÖNCE bütün `Service` satırlarını siliyor,
 * sonra gövdedeki adayları yaratıyor. Denetim araya sıkıştırılamaz —
 * satırlar silindikten sonra bulunan bir çakışma, veriyi geri getirmeden
 * durdurulamaz. Bu yüzden karar TEK BİR NOKTADA, silme başlamadan önce
 * veriliyor ve "kısmi kabul" diye bir şey yok: bir aday bile geçmezse
 * hiçbir satıra dokunulmuyor.
 *
 * DÖRT DENETİM
 *   1. biçim          — her adayın slug'ı kanonik kalıba uymalı
 *   2. küme içi tekrar — iki hizmet aynı adresi paylaşamaz
 *   3. aile dışı çakışma — statik rota, yazı, bölge, mahalle
 *   4. yayındaki adresin kaybı — aşağıdaki nota bakın
 *
 * Kimlik SLUG'DIR, id değil: satırlar her kayıtta yeniden yaratıldığı için
 * `Service.id` kalıcı bir kimlik taşımıyor (yeni id alıyorlar). Yayın
 * durumu da bu yüzden slug ile taşınıyor.
 */
async function adaySetiniDenetle(body: ServicesInput): Promise<string | null> {
  const adaylar = body.services || []

  // Adres taşımayan hizmetler (yalnız ana sayfa kartı) denetim dışı: kök
  // adreste bir sayfaları yok.
  const adresliler = adaylar
    .map((s, sira) => ({ sira, yol: kokYolunuNormallestir(s.slug), baslik: s.title }))
    .filter((x) => x.yol !== '')

  // 2. Küme içi tekrar — çakışma kümesinden bağımsız, önce bakılıyor ki
  //    hata mesajı "kendisiyle çakışıyor" gibi kafa karıştırıcı olmasın.
  const gorulen = new Set<string>()
  for (const a of adresliler) {
    if (gorulen.has(a.yol)) {
      return `Aynı adres iki hizmette birden kullanılmış: /${a.yol}. Her hizmetin adresi benzersiz olmalı.`
    }
    gorulen.add(a.yol)
  }

  // 1 + 3. Küme BİR KEZ toplanıyor; bütün hizmet satırları dışarıda
  //        bırakılıyor çünkü aday küme onların yerine geçiyor.
  const kume = await kokAdresleriTopla({ haricHizmetlerinTumu: true })
  for (const a of adresliler) {
    const cakisma = kokCakismasiniBul(kume, a.yol)
    if (cakisma) {
      const kimlik = a.baslik ? `"${a.baslik}" hizmeti` : `${a.sira + 1}. hizmet`
      return `${kimlik} kaydedilemedi: ${cakisma.message}`
    }
  }

  // 4. YAYINDAKİ HİZMETİN ADRESİ KÜMEDEN DÜŞEMEZ.
  //
  //    Senaryo: /esya-depolama yayında; panelde slug /depolama yapılıyor.
  //    Yıkıcı yeniden yaratma eski satırı siler, yenisi haritada
  //    bulunmadığı için TASLAK doğar — yani canlı bir URL sessizce
  //    kaybolur, üstelik "kaydedildi" mesajıyla. Yeniden adlandırma da
  //    silme de aynı sonucu verdiği için ikisi birden reddediliyor.
  const yayindakiler = await prisma.service.findMany({
    where: { isActive: true },
    select: { slug: true, title: true },
  })
  for (const y of yayindakiler) {
    const yol = kokYolunuNormallestir(y.slug)
    if (!yol || gorulen.has(yol)) continue
    return (
      `Yayındaki hizmetin adresi doğrudan değiştirilemez veya silinemez: /${yol}` +
      `${y.title ? ` ("${y.title}")` : ''}. Önce hizmeti yayından kaldırın.`
    )
  }

  return null
}

async function update(body: ServicesInput) {
  // DENETİM YIKICI SİLMEDEN ÖNCE. Reddedilirse veri tabanına HİÇ
  // dokunulmuyor: ne satır siliniyor, ne yayın durumu değişiyor, ne sıra.
  const hata = await adaySetiniDenetle(body)
  if (hata) return { success: false as const, error: hata }

  // Durum önce okunuyor; `mapCreate` bunu geri yazacak.
  const mevcut = await prisma.service.findMany({ select: { slug: true, isActive: true } })
  yayinDurumu = new Map(
    mevcut.filter((x) => x.slug).map((x) => [String(x.slug), x.isActive])
  )
  return servicesCrudService.update(body)
}

async function publish(slug: string) {
  const hizmet = await prisma.service.findUnique({ where: { slug } })
  if (!hizmet) return { success: false as const, error: 'Hizmet bulunamadı' }

  const hatalar = yayinaHazirMi(hizmet)
  // KAYIT DEĞİŞMİYOR: eksik bir hizmetin yayın denemesi veri tabanına
  // dokunmuyor.
  if (hatalar.length) return { success: false as const, error: `Yayına alınamadı: ${hatalar.join(' · ')}` }

  // KÖK ADRES SON KAPI. Hizmet taslak hâlde kaydedildikten sonra başka bir
  // varlık aynı adresi almış olabilir; kendi satırı kümeden çıkarılıyor.
  const cakisma = await kokYoluDenetle(hizmet.slug, { haric: { haricHizmetSlug: hizmet.slug } })
  if (cakisma) return { success: false as const, error: `Yayına alınamadı: ${cakisma.message}` }

  const guncel = await prisma.service.update({ where: { slug }, data: { isActive: true } })
  return { success: true as const, data: guncel, message: 'Yayına alındı.' }
}

async function unpublish(slug: string) {
  const hizmet = await prisma.service.findUnique({ where: { slug } })
  if (!hizmet) return { success: false as const, error: 'Hizmet bulunamadı' }

  const guncel = await prisma.service.update({ where: { slug }, data: { isActive: false } })
  return { success: true as const, data: guncel, message: 'Yayından kaldırıldı. Adres artık 404 döndürüyor.' }
}

/**
 * Uç noktaların çağırdığı servis.
 *
 * `create`/`remove` fabrikadan doğrudan geçiyor: bölüm kaydı bir kez
 * oluşturuluyor ve silinmesi zaten olağan dışı bir işlem.
 */
export const servicesSectionService = {
  get,
  create: servicesCrudService.create,
  update,
  remove: servicesCrudService.remove,
  publish,
  unpublish,
}
