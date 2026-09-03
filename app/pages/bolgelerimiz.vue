<script setup>
/*
 * COĞRAFİ AĞ KAPALIYKEN BU SAYFA YOK.
 *
 * Yarışma sürümünde `publicRegionPages` kapalı (bkz.
 * composables/useRegionPages.ts). Koruma dosyanın EN BAŞINDA: aşağıdaki
 * ilçe dizini ve içerik istekleri hiç yapılmıyor.
 *
 * 301 değil 404: sayfa ana sayfaya yığılmıyor, `noindex` ile 200 da
 * bırakılmıyor. Bayrak açıldığında bu blok devre dışı kalıyor ve sayfa
 * hiçbir değişiklik olmadan geri geliyor.
 */
if (!useRegionPages()) {
  throw createError({ statusCode: 404, statusMessage: 'Sayfa Bulunamadı', fatal: true })
}

/**
 * /bolgelerimiz — İSTANBUL COĞRAFİ HUB'I
 *
 * ESKİ BİLGİ MİMARİSİ (Ege Eşya devri):
 *     Türkiye → 81 İl → İlçeler
 * Sayfa 18 il kartı basıyor, coğrafi bölge süzgeci ve arama kutusu
 * sunuyordu. Yapısal veride `areaServed` kayıtlı tüm illerden türetiliyordu.
 *
 * YENİ KANONİK YAPI:
 *     İSTANBUL → 39 İLÇE → MAHALLELER
 * Site İstanbul odaklı. Bu sayfa artık Türkiye dizini değil; tek bir ilin
 * coğrafi hub'ı. Veri tabanındaki 335 İstanbul dışı kayıt SİLİNMEDİ,
 * yalnızca bu sunumda gösterilmiyor (kendi rotalarından erişilebilir
 * durumdalar).
 *
 * KALDIRILANLAR VE SEBEPLERİ
 *   · `fixed-page-header`  — koyu yeşil zemin + noktalı desen; V2 dili
 *                            yeşil hero kullanmıyor (region/BolgeGiris.vue)
 *   · `region-list`        — 18 yuvarlak köşeli il kartı, arama kutusu,
 *                            hap biçimli süzgeç şeridi. Bileşen duruyor,
 *                            bu sayfa artık kullanmıyor.
 *   · `base-post-carousel` — coğrafi dizinde blog kaydırağı; hem eski kart
 *                            dili hem konu dışı
 *   · `base-final-cta`     — eski CTA bloğu; kapanış artık cümle içinde
 *                            (region/BolgeAciklama.vue)
 *   · `?ara` / `?bolge`    — arama ve süzgeç kalktı, dolayısıyla arama
 *                            adreslerine özel `noindex` kuralı da gereksiz;
 *                            eski adresleri canonical zaten konsolide ediyor
 *   · `Service` yapısal verisi — `areaServed` olarak kayıtlı TÜM iller
 *                            bildiriliyordu (Türkiye geneli). Bir dizin
 *                            sayfasının kendisi bir "Service" değil; yerini
 *                            gerçekten sayfada duran listenin işaretlemesi
 *                            (`ItemList`) aldı.
 */
const { data: yanit } = await useFetch('/api/istanbul-ilceler', { key: 'istanbul-ilceler' })

const dizin = computed(() =>
  yanit.value?.success
    ? yanit.value.data
    : { ilceler: [], toplam: 0, aktif: 0, mahalleKaydi: 0 }
)

await usePageSeo('region', sayfaMetasi('region'))

const { siteUrl } = await useSiteSettings()

/**
 * YAPISAL VERİ — yalnız `ItemList`.
 *
 * Yol izi `BolgeGiris.vue` içinde Microdata olarak, GÖRÜNEN listeyle aynı
 * kaynaktan işaretleniyor; burada tekrarlanmıyor.
 *
 * Listede 39 ilçenin TAMAMI var çünkü ekranda da 39'u duruyor — işaretleme
 * ile görünen içerik ayrışamaz. `url` yalnız sayfası yayında olan ilçelere
 * yazılıyor; olmayan için uydurma adres üretmektense alan hiç konmuyor.
 */
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: "İstanbul'da hizmet bölgelerimiz",
          numberOfItems: dizin.value.ilceler.length,
          itemListOrder: 'https://schema.org/ItemListUnordered',
          itemListElement: dizin.value.ilceler.map((ilce, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: ilce.ad,
            ...(ilce.aktif ? { url: `${siteUrl.value}/${ilce.slug}` } : {}),
          })),
        }),
    },
  ],
})

/**
 * SAYFANIN EDİTORYAL ÇERÇEVESİ — TEK İSTEK.
 *
 * Bölümler ayrı ayrı istek atmıyor; içerik sayfa seviyesinde bir kez alınıp
 * prop olarak geçiliyor (M4'teki ana sayfa deseni).
 */
const { data: icerikYanit } = await useFetch('/api/ic-sayfa?page=bolgeler', {
  key: 'ic-bolgeler',
})

/** Bölüm anahtarına göre kontrollü içerik; kayıt yoksa boş nesne. */
const bolum = (ad) => icerikYanit.value?.data?.[ad] ?? {}

/** Ortak kapanış imzasının bu ailedeki cümlesi — bkz. utils/kapanis.ts. */
const kapanisMetni = KAPANIS_METNI.ana

</script>

<template>
  <main>
    <region-bolge-giris :ilce-sayisi="dizin.toplam" :bolum="bolum('giris')" />
    <region-ilce-dizini
      :ilceler="dizin.ilceler"
      :mahalle-kaydi="dizin.mahalleKaydi"
      :bolum="bolum('dizin')"
    />
    <region-bolge-aciklama :bolum="bolum('aciklama')" />
    <!-- Bölge ailesinin kapanışı: ilçe ve mahalle sayfalarıyla aynı blok,
         aynı cümle. Sayfanın kendi kapanış paragrafı (`bolge-aciklama`)
         iletişime değil `/` ve `/hizmetlerimiz`e bağlanıyor; çakışma yok. -->
    <lazy-base-kapanis :baslik="kapanisMetni" :hydrate-on-visible="{ rootMargin: '300px' }" />
  </main>
</template>
