// server/domain/posts/posts.service.ts
import { getSafeErrorMessage } from '../../utils/prismaError'
import { ok, fail, type ServiceResult } from '../shared/response'
import { postsRepository } from './posts.repository'
import { sanitizeContentFields } from '../../utils/sanitizeHtml'
import { kokYolunuNormallestir, kokYoluDenetle } from '../shared/root-paths'

export interface PostInput {
  /**
   * Düzenlenen kaydın birincil anahtarı — YALNIZ güncellemede.
   *
   * Adres artık değişebildiği için kimlik slug olamaz: "adresi değiştir"
   * ile "yeni kayıt" aynı isteğe benzerdi. Panel bu alanı zaten gönderiyor
   * (useListCrud PUT/POST kararını `id` doluluğuna göre veriyor); daha önce
   * yup şemasında olmadığı için `stripUnknown` tarafından atılıyordu.
   */
  id?: number
  title: string
  subtitle?: string
  shortTitle?: string
  author?: string
  slug: string
  content?: string
  excerpt?: string
  metaTitle?: string
  metaDescription?: string
  image?: string
  imageAlt?: string
}

export interface PaginationInput {
  page?: number
  pageSize?: number
}

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

// page/pageSize verilmezse (mevcut tüm tüketiciler: carousel'ler, navbar,
// admin'in bugüne kadarki tam liste görünümü) davranış öncekiyle birebir
// aynı kalır — bare bir dizi döner. Sadece `page` açıkça istendiğinde
// {items,total,page,pageSize,totalPages} zarfına geçilir; bu yüzden bu
// geriye dönük tam uyumlu, isteğe bağlı (opt-in) bir davranış.
/**
 * `includeDrafts` YALNIZ yönetici çağrılarında true olabilir.
 *
 * Uç nokta (`server/api/posts.ts`) bu bayrağı `?admin=true` istendiğinde
 * ve ancak `requireAdmin` geçildikten sonra veriyor. Kimliksiz bir istek
 * taslak veriyi hiçbir yoldan göremiyor: liste süzülüyor, sayım süzülüyor,
 * tekil okuma yayında olmayan kaydı bulmuyor.
 */
async function get(
  slug?: string,
  light?: boolean,
  pagination?: PaginationInput,
  options: { includeDrafts?: boolean } = {}
): Promise<ServiceResult<any>> {
  const includeDrafts = options.includeDrafts === true
  try {
    if (slug) {
      const post = includeDrafts
        ? await postsRepository.findBySlug(slug)
        : await postsRepository.findActiveBySlug(slug)
      // Taslak için "bulunamadı" dönüyor — "yayında değil" demek, var
      // olduğunu söylemek olurdu. Sayfa bunu 404'e çeviriyor.
      if (!post) return fail('Post bulunamadı')
      return ok(sanitizeContentFields(post))
    }

    if (pagination?.page) {
      const page = Math.max(1, pagination.page)
      const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, pagination.pageSize || DEFAULT_PAGE_SIZE))
      const [items, total] = await Promise.all([
        postsRepository.findAll({ light, take: pageSize, skip: (page - 1) * pageSize, includeDrafts }),
        postsRepository.count({ includeDrafts }),
      ])
      return ok(sanitizeContentFields({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }))
    }

    return ok(sanitizeContentFields(await postsRepository.findAll({ light, includeDrafts })))
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function create(body: PostInput): Promise<ServiceResult<any>> {
  try {
    // KÖK AD ALANI DENETİMİ — TASLAK OLSA BİLE.
    //
    // Yeni yazı taslak başlıyor, yani adres bugün 404 veriyor. Yine de
    // burada denetleniyor: adres taslakken de REZERVE (bkz. root-paths.ts).
    // Denetim yayın anına ertelenseydi iki taslak aynı adresi alabilir,
    // ilki yayına girdiğinde ikincisi sessizce erişilemez olurdu.
    const cakisma = await kokYoluDenetle(body.slug)
    if (cakisma) return fail(cakisma.message)

    const post = await postsRepository.create({
      title: body.title,
      subtitle: body.subtitle,
      shortTitle: body.shortTitle,
      author: body.author,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      image: body.image,
      imageAlt: body.imageAlt,
      // YENİ YAZI TASLAK BAŞLAR. Şema varsayılanı da `false` ama burada
      // açıkça yazılıyor: "kaydetmek yayınlamak değildir" bu ailenin en
      // önemli davranışı ve varsayılana gizlenmemeli.
      isActive: false,
      publishedAt: null,
    })
    return ok(post, 'Taslak olarak kaydedildi. Yayına almak ayrı bir adım.')
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function update(body: PostInput): Promise<ServiceResult<any>> {
  try {
    // Kimlik: `id` varsa o, yoksa slug. Panel her zaman `id` gönderiyor;
    // `id`siz çağrı (eski betikler, doğrudan API kullanımı) eski davranışı
    // koruyor — o durumda adres değişikliği zaten ifade EDİLEMİYOR.
    const mevcut = body.id
      ? await postsRepository.findById(body.id)
      : await postsRepository.findBySlug(body.slug)
    if (!mevcut) return fail('Güncellenecek yazı bulunamadı.')

    const yeniYol = kokYolunuNormallestir(body.slug)
    const adresDegisti = yeniYol !== mevcut.slug

    if (adresDegisti) {
      // YAYINDAKİ ADRES DEĞİŞTİRİLEMEZ.
      //
      // Yönlendirme/geçmiş sistemi YOK: eski adres kaydedilmiyor, yani
      // değişiklik canlı bir URL'yi kalıcı 404'e düşürür ve dizindeki
      // bağlantılar kırılır. Mahalle tarafında M1'de kurulan kural ile
      // aynı; sıra da aynı: önce yayından kaldır, sonra değiştir.
      if (mevcut.isActive) {
        return fail(
          'Yayındaki bir yazının adresi doğrudan değiştirilemez. ' +
            `Önce yayından kaldırın, sonra /${mevcut.slug} adresini değiştirin.`
        )
      }

      const cakisma = await kokYoluDenetle(yeniYol, { mevcutYol: mevcut.slug })
      if (cakisma) return fail(cakisma.message)
    }

    const post = await postsRepository.update(mevcut.slug, {
      // Adres yalnız gerçekten değiştiyse yazılıyor: değişmeyen istekler
      // sütuna hiç dokunmuyor.
      ...(adresDegisti ? { slug: yeniYol } : {}),
      title: body.title,
      subtitle: body.subtitle,
      shortTitle: body.shortTitle,
      author: body.author,
      content: body.content,
      excerpt: body.excerpt,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      image: body.image,
      imageAlt: body.imageAlt,
    })
    return ok(post)
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

/**
 * YAYINA ALINABİLİRLİK — asgari, yeni editoryal kural YOK.
 *
 * Burada bir blog kalite kapısı kurulmuyor (kelime sayısı, SSS adedi,
 * zorunlu görsel gibi kurallar İCAT EDİLMEDİ). Yalnız sayfanın herkese
 * açık olarak ayakta durabilmesi için gereken üç alan denetleniyor: başlık
 * (H1 ve arama başlığı kaynağı), adres (rotanın kendisi) ve gövde (sayfanın
 * içeriği). Üçü de mevcut on yazının hepsinde dolu, yani bu denetim hiçbir
 * yayındaki yazıyı etkilemiyor.
 */
function yayinaHazirMi(post: any): string[] {
  const hatalar: string[] = []
  if (!String(post?.title ?? '').trim()) hatalar.push('başlık boş')
  if (!String(post?.slug ?? '').trim()) hatalar.push('adres (slug) boş')
  if (!String(post?.content ?? '').replace(/<[^>]*>/g, '').trim()) hatalar.push('içerik boş')
  return hatalar
}

async function publish(slug: string): Promise<ServiceResult<any>> {
  try {
    const post = await postsRepository.findBySlug(slug)
    if (!post) return fail('Post bulunamadı')

    const hatalar = yayinaHazirMi(post)
    if (hatalar.length) {
      // KAYIT DEĞİŞMİYOR: eksik bir yazının yayın denemesi veri tabanına
      // dokunmuyor.
      return fail(`Yayına alınamadı: ${hatalar.join(' · ')}`)
    }

    // KÖK ADRES YENİDEN DENETLENİYOR — SON KAPI.
    //
    // Adres taslak kaydedilirken zaten denetlenmişti, ama arada zaman
    // geçiyor: o sırada başka bir varlık (bölge, hizmet, mahalle) aynı
    // adresi almış olabilir. Kaydetme anındaki denetime güvenmek, yayına
    // giren sayfanın gölgede kalmasına izin vermek olurdu.
    //
    // Kaydın KENDİSİ kümeden çıkarılıyor: soru "adresim dolu mu?" değil,
    // "adresimi başkası da tutuyor mu?".
    const cakisma = await kokYoluDenetle(post.slug, {
      haric: { haricYaziSlug: post.slug },
    })
    if (cakisma) return fail(`Yayına alınamadı: ${cakisma.message}`)

    // İLK yayın anı bir kez yazılıyor. Yeniden yayına alma özgün tarihi
    // KORUYOR — "ne zaman yayımlandı" sorusunun cevabı ilk yayındır.
    const ilkYayin = post.publishedAt ?? new Date()
    const guncel = await postsRepository.setPublication(slug, {
      isActive: true,
      publishedAt: ilkYayin,
    })
    return ok(guncel, post.publishedAt ? 'Yeniden yayına alındı.' : 'Yayına alındı.')
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function unpublish(slug: string): Promise<ServiceResult<any>> {
  try {
    const post = await postsRepository.findBySlug(slug)
    if (!post) return fail('Post bulunamadı')

    // `publishedAt` SİLİNMİYOR: yayın geçmişi korunuyor, yazı geri
    // alındığında özgün tarihini kaybetmiyor.
    const guncel = await postsRepository.setPublication(slug, { isActive: false })
    return ok(guncel, 'Yayından kaldırıldı. Adres artık 404 döndürüyor.')
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function remove(slug: string): Promise<ServiceResult<any>> {
  try {
    const post = await postsRepository.remove(slug)
    return ok(post, 'Post başarıyla silindi')
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

export const postsService = { get, create, update, publish, unpublish, remove }
