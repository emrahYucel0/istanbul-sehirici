// composables/useSiteSettings.ts
// Admin panelinden (Site Ayarları) girilen marka/iletişim/SEO varsayılanlarının
// TEK merkezi kaynağı. Sayfa/bileşenler marka adını, domaini veya varsayılan
// meta açıklamasını kendi içlerinde tekrar tekrar sabitlemek yerine buradan
// okur — böylece admin panelden bir değer girildiğinde tüm site aynı anda
// güncellenir.
//
// useAsyncData'nın sabit anahtarı ('site-settings') sayesinde aynı istek
// (SSR render) içinde bu composable'ı çağıran her bileşen tek bir gerçek
// API çağrısını paylaşır (Nuxt'un yerleşik payload dedup davranışı).
export interface SiteSettingsData {
  brandName?: string | null
  siteName?: string | null
  siteDescription?: string | null
  logo?: string | null
  favicon?: string | null
  ogImage?: string | null
  phone?: string | null
  mobilePhone?: string | null
  whatsAppNumber?: string | null
  email?: string | null
  address?: string | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  twitterUrl?: string | null
  linkedinUrl?: string | null
  youtubeUrl?: string | null
  githubUrl?: string | null
  footerText?: string | null
  copyrightText?: string | null
  workingHours?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string | null
  /** Genel çağrı — M6'da HeroPage'den devralındı (bkz. base/FinalCta.vue). */
  ctaLabel?: string | null
  ctaLink?: string | null
}

// Marka adı BURAYA YAZILMIYOR. Yedek, nuxt.config'teki `site.name`
// alanından geliyor (o da `NUXT_SITE_NAME` ortam değişkeniyle ezilebilir).
// Önceden burada `'EveNakliyatEvden'` sabiti duruyordu: panelden ad
// değiştirilse bile ayar satırı okunamadığı anlarda eski ad geri geliyordu
// ve marka adı fiilen İKİ kaynaktan besleniyordu.
const DEFAULT_SITE_URL = 'https://istanbulevenakliyat.com'
// Eskiden `/img/ege-ozenle-tasima.jpg` idi: hem devralınan Ege markasının
// dosya adını taşıyordu hem de `public/img/` klasörü artık yok — yani
// paylaşım kartı yedeği 404 veriyordu. Yerine gerçekten var olan ve
// derleme öncesi üretilen kahraman kare kullanılıyor.
const DEFAULT_OG_IMAGE = '/images/hero-istanbul-1024.webp'

export async function useSiteSettings() {
  const { data } = await useAsyncData<SiteSettingsData | null>(
    'site-settings',
    async () => {
      const response = await $fetch<{ success: boolean; data: SiteSettingsData | null }>('/api/siteSettings')
      return response?.data ?? null
    }
  )

  // useSiteConfig() Nuxt instance context'ine ihtiyaç duyduğu için burada,
  // setup sırasında EAGER (istekli) olarak bir kere çağrılıyor — bir
  // computed getter'ının içine konursa (lazy), değer daha sonra context
  // dışında bir anda hesaplanmaya çalışılıp hataya yol açar.
  const siteConfig = useSiteConfig()
  const configuredSiteUrl = siteConfig.url || DEFAULT_SITE_URL
  const configuredSiteName = siteConfig.name || 'Nakliyat'

  const brandName = computed(
    () => data.value?.brandName || data.value?.siteName || configuredSiteName
  )
  const siteUrl = computed(() => configuredSiteUrl)
  const ogImage = computed(() => data.value?.ogImage || `${siteUrl.value}${DEFAULT_OG_IMAGE}`)
  const metaDescriptionDefault = computed(() => data.value?.metaDescription || data.value?.siteDescription || '')

  const socialLinks = computed(() =>
    [
      data.value?.facebookUrl,
      data.value?.instagramUrl,
      data.value?.twitterUrl,
      data.value?.linkedinUrl,
      data.value?.youtubeUrl,
    ].filter((url): url is string => !!url && url.trim() !== '')
  )

  return { settings: data, brandName, siteUrl, ogImage, metaDescriptionDefault, socialLinks }
}
