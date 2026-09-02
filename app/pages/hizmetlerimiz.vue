<script setup>
/**
 * HİZMETLER DİZİNİ SAYFASI
 *
 * Hedef terim: "evden eve nakliyat hizmetleri". Ana hizmeti burada tam
 * olarak anlatıyoruz; ayrıca bir /evden-eve-nakliyat sayfası AÇILMADI
 * (bkz. components/service/List.vue — anahtar kelime yamyamlığı notu).
 *
 * Veri, ana sayfadaki hizmetler bölümüyle AYNI kayıttan geliyor: tek bir
 * `Services` bölümü ve ona bağlı `Service` satırları. Böylece panelden bir
 * hizmet eklendiğinde hem ana sayfa kartlarına hem bu dizine hem de (slug
 * verilmişse) kendi sayfasına aynı anda yansıyor; iki ayrı yerde güncel
 * tutulması gereken kopya veri oluşmuyor.
 */
/**
 * İKİ İSTEK PARALEL — ŞELALE YOK.
 *
 * Hizmet envanteri (`/api/services`) ile sayfanın editoryal çerçevesi
 * (`/api/ic-sayfa`) birbirinden bağımsız. Sırayla `await` edilselerdi
 * sunucu tarafında iki turlu bir şelale oluşurdu; ikisi de aynı turda
 * gidiyor.
 *
 * Bölümler ayrı ayrı istek atmıyor: içerik sayfa seviyesinde TEK istekle
 * alınıp prop olarak geçiliyor (M4'teki ana sayfa deseni).
 */
const [hizmetYanit, icerikYanit] = await Promise.all([
  useFetch('/api/services', { key: 'services-section' }),
  useFetch('/api/ic-sayfa?page=hizmetler', { key: 'ic-hizmetler' }),
])

/** Bölüm anahtarına göre kontrollü içerik; kayıt yoksa boş nesne. */
const bolum = (anahtar) => icerikYanit.data.value?.data?.[anahtar] ?? {}

/** Ortak kapanış imzasının bu ailedeki cümlesi — bkz. utils/kapanis.ts. */
const kapanisMetni = KAPANIS_METNI.ana

/**
 * `useFetch` bir REF DEĞİL, `AsyncData` nesnesi döndürüyor: `{ data, pending,
 * error, refresh, ... }`. Yani gövdeye `yanit.data.value` ile inilir.
 *
 * Burada `response.value?.data` yazılıydı — `AsyncData.value` diye bir alan
 * olmadığı için sonuç HER ZAMAN `undefined`, `section` her zaman `null` ve
 * `services` her zaman boş diziydi. Sayfa hata vermiyordu: dizin `<ol>`u
 * basılıyor, içine hiç satır girmiyordu. `hd-satir` sayısı SSR çıktısında
 * 0 ölçüldü, JSON-LD `ItemList` de boş çıkıyordu.
 *
 * Hatayı saklayan şey isimlendirme asimetrisiydi: hemen üstteki satır
 * (`icerikYanit`) doğru yazılmışken bu değişkenin adı `response` idi ve iki
 * satır yan yana okunduğunda aynı şeyi yaptıkları görünmüyordu. Ad da
 * `hizmetYanit` olarak hizalandı; artık ikisi aynı kalıpta.
 *
 * Uç noktanın gövdesi `{ success, data: { ...bölüm, services: [...] } }` —
 * o yüzden `.data.value?.data`. Veri kaynağı, şekil ve bileşen sözleşmesi
 * değişmedi; yalnız erişim düzeltildi.
 */
const section = computed(() => hizmetYanit.data.value?.data || null)
const services = computed(() => section.value?.services || [])

/** Yalnızca kendi sayfası olan hizmetler yapısal veriye giriyor. */
const linkedServices = computed(() => services.value.filter((s) => s.slug))

const { brandName, siteUrl } = await usePageSeo('services', sayfaMetasi('services'))

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () =>
        JSON.stringify({
          '@context': 'https://schema.org',
          // NOT: Yol izi (BreadcrumbList) BURADA DEĞİL — `service/Giris.vue`
          // onu Microdata olarak, ekranda GÖRÜNEN yol izinin aynı kaynağından
          // üretiyor. (Önceden bu işi eski koyu bant yapıyordu; bant V2'de
          // kalktı, işaretleme yeni girişe taşındı.) Tek kaynak kuralı
          // sürüyor: burada ikinci bir bildirim açılmıyor.
          '@graph': [
            {
              // Hizmetleri sıralı bir liste olarak bildirmek, Google'ın bu
              // sayfanın bir dizin olduğunu ve alt sayfalara işaret ettiğini
              // anlamasına yardımcı oluyor.
              '@type': 'ItemList',
              name: 'Nakliyat hizmetleri',
              itemListElement: linkedServices.value.map((service, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: service.title,
                url: `${siteUrl.value}/${service.slug}`,
              })),
            },
            {
              '@type': 'Organization',
              name: brandName.value,
              url: siteUrl.value,
            },
          ],
        }),
    },
  ],
})
</script>

<template>
  <!--
    V2 İÇ SAYFA. Değişenler ve gerekçeleri:

    · `fixed-page-header` (koyu yeşil zemin + noktalı desen + beyaz başlık)
      KALDIRILDI. Bant hâlâ duruyor ve diğer iç sayfalar onu kullanmaya
      devam ediyor — yalnız bu sayfa kendi editoryal girişine geçti.
    · `service-list` (yedi eş yuvarlak kart + yedi eski görsel) yerine
      `service-dizin` kütüğü geldi. Kartlar taranamıyordu: hepsi aynı
      ağırlıkta, aynı yükseklikteydi.
    · `base-final-cta` KALDIRILDI: eski aksan paletiyle çizilen ikinci bir
      dev CTA bloğuydu ve alt bilgideki iletişim katmanıyla üst üste
      biniyordu. Sonraki adım artık `service-birlikte` içinde, cümlenin
      içinde veriliyor.
  -->
  <main>
    <service-giris :bolum="bolum('giris')" />

    <service-dizin
      :hizmetler="services"
      :giris="section?.description || ''"
      :bolum="bolum('dizin')"
    />

    <service-birlikte :bolum="bolum('birlikte')" :sahne="bolum('sahne')" />
    <!-- Hizmet dizini de ortak kapanış imzasını alıyor: altındaki yedi
         hizmet detayının hepsinde aynı blok var, hub'ın dışarıda kalması
         sistemi yarım bırakıyordu. `service-birlikte`nin son cümlesindeki
         keşif talebi bağlantısı buraya devredildi; fiyat aracı bağlantısı
         farklı bir hedef olduğu için orada kaldı. -->
    <lazy-base-kapanis :baslik="kapanisMetni" :hydrate-on-visible="{ rootMargin: '300px' }" />
  </main>
</template>
