// composables/usePageSeo.ts
// Sayfa seviyesinde meta/OG/canonical yönetiminin TEK giriş noktası.
//
// Neden bu composable var: bölüm bileşenleri (Pricing.vue, Testimonial.vue,
// navbar/About.vue vb.) daha önce kendi useHead/useSeoMeta çağrılarını
// yapıyordu. Vue/unhead tekil etiketleri (title, meta[name=description])
// "son kayıt kazanır" mantığıyla çözdüğü için, sayfanın KENDİ meta verisi
// alt bileşenler tarafından sessizce eziliyordu — admin panelden girilen
// başlık/açıklama hiçbir zaman siteye yansımıyordu. Kural: useSeoMeta/useHead
// SADECE `pages/*.vue` içinden, SADECE bu composable üzerinden çağrılmalı.
//
// Öncelik sırası (en yükseğe en düşük): admin panelden bu sayfa için
// girilen Meta kaydı > çağıranın verdiği sayfaya özgü varsayılan >
// Site Ayarları'ndaki site geneli varsayılan.
export interface PageSeoFallback {
  title: string
  description: string
  image?: string
}

export interface PageSeoOptions {
  /** Paylaşılan bölüm bileşeni (örn. Region.vue) kendi canonical/prev/next
   * mantığını yönetiyorsa, çakışmaması için burada canonical atlanır. */
  skipCanonical?: boolean
}

/**
 * Marka adı yer tutucusu.
 *
 * NEDEN VAR: sabit sayfa metinleri (utils/sayfa-meta.ts) modül seviyesinde
 * yükleniyor, yani canlı marka adına erişemiyor. Önceden çözüm marka adını
 * metne ELLE YAZMAKTI ("Hakkımızda | EveNakliyatEvden") — panelden ad
 * değiştirildiğinde o sayfa eski adı göstermeye devam ediyordu ve kimse
 * fark etmiyordu.
 *
 * Artık sabit metin `{marka}` yazıyor, gerçek değer burada, istek anında
 * yerleştiriliyor. Panelden girilen Meta kaydı için de çalışıyor: yönetici
 * başlığa `{marka}` yazabilir.
 */
export const MARKA_YER_TUTUCU = /\{marka\}/g

const markayiYerlestir = (metin: string, marka: string) =>
  metin.replace(MARKA_YER_TUTUCU, marka)

export async function usePageSeo(pageKey: string, fallback: PageSeoFallback, options: PageSeoOptions = {}) {
  const { settings, brandName, siteUrl, ogImage: siteOgImage, mutlakGorsel, metaDescriptionDefault, socialLinks } =
    await useSiteSettings()

  const { data: metaResponse } = await useAsyncData(`meta-${pageKey}`, async () => {
    const response = await $fetch<{ success: boolean; data: { title?: string; description?: string } | null }>(
      `/api/meta?page=${pageKey}`
    )
    return response?.data ?? null
  })

  const title = computed(() =>
    markayiYerlestir(metaResponse.value?.title || fallback.title, brandName.value)
  )
  const description = computed(() =>
    markayiYerlestir(
      metaResponse.value?.description || fallback.description || metaDescriptionDefault.value,
      brandName.value
    )
  )
  /**
   * PAYLAŞIM GÖRSELİ — MUTLAK.
   *
   * `fallback.image` sayfa kütüğünden göreli gelebiliyor; `siteOgImage`
   * zaten mutlak. İkisi de aynı çözümleyiciden geçiyor ki iki dal aynı
   * biçimi üretsin. Öncelik sırası değişmedi.
   */
  const image = computed(() => mutlakGorsel(fallback.image) || siteOgImage.value)

  const route = useRoute()
  const canonicalUrl = computed(() => `${siteUrl.value}${route.path}`)

  useSeoMeta({
    title,
    description,
    keywords: () => settings.value?.metaKeywords || undefined,
    author: brandName,
    ogType: 'website',
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogUrl: canonicalUrl,
    ogSiteName: brandName,
    ogLocale: 'tr_TR',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    robots: 'index, follow',
  })

  if (!options.skipCanonical) {
    useHead({
      link: [{ rel: 'canonical', href: canonicalUrl }],
    })
  }

  return { settings, brandName, siteUrl, title, description, image, canonicalUrl, socialLinks }
}
