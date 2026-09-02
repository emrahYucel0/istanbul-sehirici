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

/**
 * İKİ İSTEK AYNI SETUP TURUNDA — ŞELALE DE YOK, UYARI DA.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ESKİ SIRA
 *
 *   await useSiteSettings()                   ← 1. await
 *   await useAsyncData(`meta-${pageKey}`, …)  ← 2. istek, İLK AWAIT'İN ARDINDA
 *
 * ÖLÇÜLEN SORUN: her SPA gezinmesinde tam bir NUXT_E3003. Kaynağı yığın
 * iziyle buraya kadar izlendi (usePageSeo → useAsyncData).
 *
 * GERÇEK TETİKLEYİCİ `isMounted` DEĞİL, `!instance`. Nuxt'un kontrolü
 * (nuxt/dist/app/composables/asyncData.js):
 *
 *   if (dev && !isHydrating && !_processingMiddleware && (!instance || instance?.isMounted))
 *
 * `<script setup>` içindeki `await`leri Vue derleyicisi `withAsyncContext()`
 * ile sarıyor ve `currentInstance` await'ten sonra geri geliyor. BURASI düz
 * bir `.ts` composable'ı; öyle bir sarmalayıcı yok, ilk `await`ten sonra
 * `getCurrentInstance()` null. Bu yüzden sayfaların kendi `await usePageSeo()`
 * çağrısından SONRAKİ `useAsyncData`ları uyarı üretmiyor da bu üretiyordu.
 *
 * Uyarı tek başına kozmetik değil: instance yokken Nuxt isteği bileşenin
 * yaşam döngüsüne bağlayamıyor (`instance.sp` / `onBeforeMount` dalları
 * atlanıyor). İlk yüklemede `isHydrating` doğru olduğu için görünmüyordu.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * YENİ SIRA
 *
 * İki iş de İLK AWAIT'TEN ÖNCE, aynı senkron turda başlatılıyor:
 * `useSiteSettings()` bir `async` fonksiyon ama gövdesi ilk `await`e kadar
 * senkron çalışıyor, yani içindeki `useAsyncData('site-settings')` de bu
 * turda kaydediliyor. `useRoute()` de yukarı alındı — o da instance'a
 * bakabilen bir çağrı ve await'in ardında durmasının bir sebebi yoktu.
 *
 * BAĞIMLILIK YOK: meta isteği yalnız `pageKey`e bakıyor, Site Ayarları'ndan
 * hiçbir değer okumuyor. Ayarlardan gelenlerin hepsi ref/computed ve yalnız
 * aşağıdaki `computed` gövdelerinde okunuyor — senkron değere ihtiyaç yok.
 *
 * YAN KAZANÇ: iki istek artık paralel. Eskiden meta isteği ayarlar
 * dönmeden BAŞLAMIYORDU; sunucu tarafında iki turlu bir şelaleydi.
 * İstek SAYISI değişmiyor — ikisi de anahtarla paylaşılıyor.
 *
 * Anahtar (`meta-${pageKey}`), handler ve `server`/`lazy`/`immediate`
 * varsayılanları AYNEN korundu; önbellek davranışı değişmedi.
 */
export async function usePageSeo(pageKey: string, fallback: PageSeoFallback, options: PageSeoOptions = {}) {
  const route = useRoute()

  const [
    { settings, brandName, siteUrl, ogImage: siteOgImage, mutlakGorsel, metaDescriptionDefault, socialLinks },
    { data: metaResponse },
  ] = await Promise.all([
    useSiteSettings(),
    useAsyncData(
      `meta-${pageKey}`,
      async () => {
        const response = await $fetch<{ success: boolean; data: { title?: string; description?: string } | null }>(
          `/api/meta?page=${pageKey}`
        )
        return response?.data ?? null
      },
      {
        /*
         * İSTEK SAYISI ARTMASIN — ölçülmüş ve gerekli.
         *
         * Sıra düzeltilince `getCurrentInstance()` artık dolu; yani Nuxt bu
         * kaydı gerçekten bileşenin yaşam döngüsüne bağlıyor. Bunun bir yan
         * etkisi var: rota değişiminde kapsam kapanıyor, `_deps` sıfıra
         * iniyor ve `_off()` çalışıyor:
         *
         *   if (purgeCachedData && !hasCustomGetCachedData)
         *     nextTick(() => clearNuxtDataByKey(nuxtApp, key))
         *
         * Yani `payload.data['meta-<sayfa>']` siliniyor ve aynı sayfaya geri
         * dönüldüğünde meta YENİDEN indiriliyor. Ölçüldü (3 tekrar, / →
         * /hakkimizda → / → /hakkimizda): düzeltme öncesi 1/0/0, sonrası
         * 1/1/1 istek.
         *
         * ÖNCESİNDEKİ "SIFIR İSTEK" BİR ÖNBELLEK DEĞİL, SIZINTIYDI: instance
         * olmadığı için kayıt hiç temizlenmiyor, oturum boyunca ölü bir
         * girdi olarak duruyordu. Şimdi temizlik doğru çalışıyor ve
         * önbelleği BİLEREK kuruyoruz.
         *
         * `getCachedData` verilmesi iki işi birden yapıyor — Nuxt'un kendi
         * sözleşmesi: özel bir `getCachedData` varken `_off()` artık veriyi
         * silmiyor (`hasCustomGetCachedData`), ve geri dönüşte değer
         * buradan okunuyor. Sonuç: anahtar başına oturumda TEK istek, yani
         * düzeltme öncesiyle aynı sayı — ama sızıntısız.
         *
         * SSR ETKİLENMİYOR: `nuxtApp` sunucuda istek başına kuruluyor,
         * `payload.data` boş başlıyor, istek normal şekilde yapılıyor.
         */
        getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
      }
    ),
  ])

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

  // `useRoute()` yukarı, ilk await'in ÖNÜNE taşındı (gerekçe başta).
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
