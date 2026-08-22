// server/domain/policies/policies.service.ts
//
// Politika sayfası metinleri. `slug` ile anahtarlanan tekil kayıt deseni —
// Meta ile aynı şekil, section-crud.factory'ye uymuyor (sectionName yok).
import {
  isUniqueConstraintError,
  isRecordNotFoundError,
  getSafeErrorMessage,
} from '../../utils/prismaError'
import { ok, fail, type ServiceResult } from '../shared/response'
import { policiesRepository } from './policies.repository'
import { sanitizeContentFields } from '../../utils/sanitizeHtml'

export interface PolicyInput {
  slug: string
  title: string
  subtitle?: string
  content: string
  lastUpdated?: string | Date | null
  isActive?: boolean
}

/**
 * Yalnızca bu üç adres kabul edilir.
 *
 * Serbest slug'a izin verilseydi admin, var olmayan bir adres için kayıt
 * oluşturup metnin yayında olduğunu sanabilirdi — sayfa dosyası olmadan
 * kayıt hiçbir yerde görünmez. Yeni bir politika sayfası eklemek hem
 * buraya hem app/pages/ altına dokunmayı gerektiriyor; bilinçli bir engel.
 */
export const GECERLI_SLUGLAR = [
  'gizlilik-politikasi',
  'kullanim-sartlari',
  'cerez-politikasi',
] as const

const slugGecerliMi = (slug: string) =>
  (GECERLI_SLUGLAR as readonly string[]).includes(slug)

/** `lastUpdated` boş string gelirse null'a çevrilir; geçersiz tarih reddedilir. */
const tariheCevir = (deger: unknown): Date | null | undefined => {
  if (deger === undefined) return undefined
  if (deger === null || deger === '') return null
  const t = new Date(deger as string)
  return Number.isNaN(t.getTime()) ? undefined : t
}

async function get(slug?: string): Promise<ServiceResult<any>> {
  try {
    if (!slug) return ok(sanitizeContentFields(await policiesRepository.findAll()))
    const kayit = await policiesRepository.findBySlug(slug)
    if (!kayit) return fail(`'${slug}' için politika metni bulunamadı.`)
    return ok(sanitizeContentFields(kayit))
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function create(body: PolicyInput): Promise<ServiceResult<any>> {
  if (!slugGecerliMi(body.slug)) return fail(`'${body.slug}' geçerli bir politika sayfası değil.`)
  try {
    return ok(
      await policiesRepository.create({
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle ?? null,
        content: body.content,
        lastUpdated: tariheCevir(body.lastUpdated) ?? null,
        isActive: body.isActive ?? true,
      })
    )
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return fail(`'${body.slug}' için kayıt zaten var. Güncelleme (PUT) kullanın.`)
    }
    return fail(getSafeErrorMessage(error))
  }
}

async function update(body: PolicyInput): Promise<ServiceResult<any>> {
  if (!slugGecerliMi(body.slug)) return fail(`'${body.slug}' geçerli bir politika sayfası değil.`)
  try {
    const tarih = tariheCevir(body.lastUpdated)
    return ok(
      await policiesRepository.update(body.slug, {
        title: body.title,
        // `?? undefined` (title/content ile aynı davranış): alan istekte yoksa
        // mevcut veri korunur. `?? null` iken, subtitle taşımayan kısmi bir PUT
        // alt başlığı sessizce siliyordu. Panel temizlenen alanı '' gönderiyor,
        // o hâlâ '' olarak yazılıyor — yani panelden temizleme çalışmaya devam eder.
        subtitle: body.subtitle ?? undefined,
        content: body.content,
        ...(tarih === undefined ? {} : { lastUpdated: tarih }),
        ...(body.isActive === undefined ? {} : { isActive: body.isActive }),
      })
    )
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return fail(`'${body.slug}' için kayıt bulunamadı. Önce oluşturun.`)
    }
    return fail(getSafeErrorMessage(error))
  }
}

export const policiesService = { get, create, update }
