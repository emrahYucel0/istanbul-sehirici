// server/domain/files/media.registry.ts
//
// GÖRSEL REFERANS KÜTÜĞÜ — "bu dosya nerede kullanılıyor?"
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN TEK YERDE
//
// Silme güvenliği bu listeye dayanıyor. Liste iki yerde yazılsaydı biri
// eksik kaldığında kullanımdaki bir dosya silinebilirdi — ve kaybolan şey
// yayındaki bir sayfanın görseli olurdu.
//
// LİSTE ŞEMADAN ÇIKARILDI, TAHMİN EDİLMEDİ: her satır, `prisma/schema.prisma`
// içinde gerçekten var olan bir görsel alanına karşılık geliyor.
//
// ─────────────────────────────────────────────────────────────────────────
// VARYANT MESELESİ — BU DOSYANIN EN ÖNEMLİ KISMI
//
// `FileUploader` tarayıcıda varyant üretiyor: `foto-320.webp`,
// `foto-640.webp`, `foto-1024.webp`, `foto-2048.webp`. Her varyant AYRI bir
// `StoredFile` satırı olarak kaydediliyor (ölçüldü: 377 satır ≈ 95 mantıksal
// görsel) ve içerik alanına yalnız EN BÜYÜK varyantın adresi yazılıyor.
//
// Dolayısıyla satır satır referans araması YANILTICI olurdu: `-320` varyantı
// hiçbir içerik alanında geçmiyor, ama yayındaki bir görselin parçası. Onu
// "kullanılmıyor" diye silmek, sayfanın küçük ekran görselini yok etmek
// demek.
//
// Bu yüzden kütük MANTIKSAL GÖRSEL üzerinden çalışıyor: ad, boyut ekinden
// arındırılıp gruplanıyor ve grup içindeki HERHANGİ bir varyanta referans
// varsa grubun tamamı "kullanımda" sayılıyor.
import prisma from '../../utils/prisma.ts'

/** Yönetilen yükleme kökü. Bunun dışındaki hiçbir yol kütüğe ait değil. */
export const YUKLEME_ONEKI = '/yuklemeler/'

/**
 * Bir dosya adından boyut ekini atar.
 *
 *   foto-1024.webp → foto
 *   foto.webp      → foto
 *
 * Ek yalnız SONDA ve 2–4 basamaklı olduğunda atılıyor; "sahne-2024.webp"
 * gibi meşru bir ad da aynı desene uyuyor ama bu yalnız gruplamayı
 * etkiliyor, silme kararını değil (grup gene tek dosya olur).
 */
export const mantiksalAd = (dosyaAdi: string): string =>
  String(dosyaAdi)
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/-\d{2,4}$/, '')

/** URL'den dosya adı — sorgu ve kodlama temizlenmiş. */
export const yoldanAd = (yol: string): string => {
  const temiz = String(yol ?? '').split('?')[0].split('#')[0]
  const parca = temiz.slice(temiz.lastIndexOf('/') + 1)
  try {
    return decodeURIComponent(parca)
  } catch {
    return parca
  }
}

export interface ReferansKaydi {
  /** Yöneticinin tanıyacağı tür adı. */
  tur: string
  /** Kaydı bulmasına yarayan etiket (slug, başlık, bölüm adı). */
  etiket: string
  /** Hangi alan. */
  alan: string
  /** Değerin kendisi. */
  yol: string
}

/**
 * ŞEMADAN ÇIKARILMIŞ GÖRSEL ALANLARI.
 *
 * Yeni bir görsel alanı eklendiğinde buraya da eklenmeli. Bu bilinçli bir
 * el işi: otomatik sütun taraması, adı "image" geçen ama görsel olmayan
 * alanları da toplar ve silme kararını tahmine dayandırırdı.
 */
async function tumReferanslar(): Promise<ReferansKaydi[]> {
  const kayitlar: ReferansKaydi[] = []
  const ekle = (tur: string, etiket: string, alan: string, yol: unknown) => {
    const y = String(yol ?? '').trim()
    if (y) kayitlar.push({ tur, etiket, alan, yol: y })
  }

  const [
    anasayfaBolumleri,
    anasayfaOgeleri,
    icBolumler,
    icOgeler,
    surecAdimlari,
    hizmetler,
    bolgeler,
    yazilar,
    mahalleler,
    ayarlar,
    yorumlar,
  ] = await Promise.all([
    prisma.homeSection.findMany({ select: { sectionKey: true, imagePath: true } }),
    prisma.homeSectionItem.findMany({
      select: { id: true, imagePath: true, section: { select: { sectionKey: true } } },
    }),
    prisma.internalPageSection.findMany({
      select: { pageKey: true, sectionKey: true, imagePath: true },
    }),
    prisma.internalPageItem.findMany({
      select: {
        id: true,
        imagePath: true,
        section: { select: { pageKey: true, sectionKey: true } },
      },
    }),
    prisma.processStep.findMany({ select: { title: true, imagePath: true } }),
    prisma.service.findMany({ select: { slug: true, title: true, imagePath: true } }),
    prisma.region.findMany({ select: { slug: true, image: true, priceFactorsImage: true } }),
    prisma.post.findMany({ select: { slug: true, image: true } }),
    prisma.neighborhood.findMany({ select: { slug: true, imagePath: true } }),
    prisma.siteSettings.findMany({ select: { logo: true, ogImage: true, favicon: true } }),
    prisma.testimonial.findMany({ select: { customerName: true, customerImage: true } }),
  ])

  for (const b of anasayfaBolumleri) ekle('Ana sayfa', b.sectionKey, 'bölüm görseli', b.imagePath)
  for (const o of anasayfaOgeleri) ekle('Ana sayfa', o.section?.sectionKey ?? '?', 'öğe görseli', o.imagePath)
  for (const b of icBolumler) ekle('İç sayfa', `${b.pageKey} / ${b.sectionKey}`, 'bölüm görseli', b.imagePath)
  for (const o of icOgeler) {
    ekle('İç sayfa', `${o.section?.pageKey ?? '?'} / ${o.section?.sectionKey ?? '?'}`, 'öğe görseli', o.imagePath)
  }
  for (const a of surecAdimlari) ekle('Süreç adımı', a.title, 'adım görseli', a.imagePath)
  for (const h of hizmetler) ekle('Hizmet', h.title || h.slug || '?', 'hizmet görseli', h.imagePath)
  for (const b of bolgeler) {
    ekle('Bölge', b.slug ?? '?', 'bölge görseli', b.image)
    ekle('Bölge', b.slug ?? '?', 'fiyat faktörü görseli', b.priceFactorsImage)
  }
  for (const y of yazilar) ekle('Yazı', y.slug ?? '?', 'kapak görseli', y.image)
  for (const m of mahalleler) ekle('Mahalle', m.slug ?? '?', 'mahalle görseli', m.imagePath)
  for (const a of ayarlar) {
    ekle('Site Ayarları', 'genel', 'logo', a.logo)
    ekle('Site Ayarları', 'genel', 'paylaşım görseli', a.ogImage)
    ekle('Site Ayarları', 'genel', 'favicon', a.favicon)
  }
  for (const y of yorumlar) ekle('Yorum', y.customerName, 'müşteri görseli', y.customerImage)

  return kayitlar
}

/**
 * Mantıksal görsel adı → o adı kullanan içerik kayıtları.
 *
 * Yalnız `/yuklemeler/` altındaki yollar dönüyor: `/images/...` kaynak
 * kodun parçası ve medya kütüphanesine ait DEĞİL (bkz. safe-delete).
 */
export async function referansHaritasi(): Promise<Map<string, ReferansKaydi[]>> {
  const harita = new Map<string, ReferansKaydi[]>()
  for (const r of await tumReferanslar()) {
    if (!r.yol.startsWith(YUKLEME_ONEKI)) continue
    const anahtar = mantiksalAd(yoldanAd(r.yol))
    const mevcut = harita.get(anahtar)
    if (mevcut) mevcut.push(r)
    else harita.set(anahtar, [r])
  }
  return harita
}

/** Tek bir mantıksal görselin referansları. */
export async function referanslariBul(mantiksal: string): Promise<ReferansKaydi[]> {
  return (await referansHaritasi()).get(mantiksal) ?? []
}
