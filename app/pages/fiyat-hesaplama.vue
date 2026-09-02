<script setup>
/**
 * /FIYAT-HESAPLAMA — V2
 *
 * NEDEN AYRI SAYFA (değişmedi)
 * Nakliyat aramalarının büyük kısmı fiyat niyetli. Ayrı sayfa olarak kendi
 * başına sıralanabiliyor, dışarıdan bağlantı alabiliyor ve bölge
 * sayfalarının hepsinden bağlanabilecek bir hedef oluyor.
 *
 * ESKİ SAYFA (bu turda değiştirildi)
 *   · `ui-heading` açıklaması: "Kesin fiyat, ücretsiz keşif sonrasında
 *     netleşir" — iki doğrulanmamış iddia.
 *   · YOL İZİ HİÇ YOKTU (ölçüldü: 0 `BreadcrumbList`).
 *   · Dört yuvarlak köşeli kart, hesaba giren ve girmeyen faktörleri aynı
 *     kefeye koyuyordu.
 *   · Kapanış notu "keşif ücretsizdir ve hiçbir yükümlülük doğurmaz"
 *     diyordu.
 *   · `base-price-estimator`: koyu kutu içinde tutar, hap biçimli
 *     "Ücretsiz keşif talep edin" düğmesi, gizli varsayılan seçim ve
 *     sınırlanmamış kat alanı.
 *
 * Eski `base/PriceEstimator.vue` SİLİNMEDİ, yalnız kullanılmıyor.
 *
 * HESAP MANTIĞI DEĞİŞMEDİ. Formül `app/utils/fiyat.ts`'e taşındı ve test
 * edildi; iş katsayıları (taban tutarlar, çarpanlar, kat ücreti, aralık
 * yüzdesi) yine panelden geliyor ve HİÇBİRİ değiştirilmedi.
 */
await usePageSeo('fiyat-hesaplama', sayfaMetasi('fiyat-hesaplama'))

/**
 * YAPISAL VERİ — yalnız yol izi, o da bileşende.
 *
 * `WebApplication` + `Offer{price:"0"}` düğümü KALDIRILDI. İki sorunu vardı:
 *   1. Sayfanın ürettiği tutar tamamen kullanıcı girdisine bağlı; sabit bir
 *      `Offer` bildirmek arama motoruna yanlış bilgi vermek olurdu.
 *   2. `price: "0"` aracın ücretsizliğini bildiriyordu — sitenin geri
 *      kalanından kaldırılan "ücretsiz" dilinin yapısal veride kalmış hâli.
 *
 * Yol izi `price/Giris.vue` içinde Microdata olarak, ekranda görünen
 * listeyle aynı kaynaktan işaretleniyor. `AggregateRating` ve `Review` yok.
 */

/**
 * SAYFANIN EDİTORYAL ÇERÇEVESİ — TEK İSTEK.
 *
 * Hesaplama katsayıları BURADAN GELMİYOR: onları `price/Hesaplayici`
 * kendi ucundan (`/api/price-estimator`) okuyor ve tek sahibi orası.
 * Buradaki istek yalnız aracın etrafındaki metin için.
 */
const { data: icerikYanit } = await useFetch('/api/ic-sayfa?page=fiyat', {
  key: 'ic-fiyat',
})

const bolum = (ad) => icerikYanit.value?.data?.[ad] ?? {}

/** Ortak kapanış imzasının bu ailedeki cümlesi — bkz. utils/kapanis.ts. */
const kapanisMetni = KAPANIS_METNI.fiyat

</script>

<template>
  <main>
    <price-giris :bolum="bolum('giris')" />
    <price-hesaplayici :bolum="bolum('arac')" />
    <price-faktorler :girenler="bolum('girenler')" :disarida="bolum('disarida')" />
    <price-sonraki-adim :bolum="bolum('sonraki')" />
    <!--
      DUPLICATION AUDIT — bu sayfada üç ayrı çağrı vardı:
        · hesap sonucu panelindeki `.fh-cta` (02. bölüm, YALNIZ sonuç
          çıktığında görünür) — bağlamsal, sayfanın ortasında, KALIYOR
        · `price-sonraki-adim` son paragrafındaki iletişim bağlantısı
          → ortak imzaya devredildi, oradan çıkarıldı
        · kapanış — artık bu blok
      Sayfa sonunda tek ana iletişim kapanışı var.
    -->
    <lazy-base-kapanis :baslik="kapanisMetni" :hydrate-on-visible="{ rootMargin: '300px' }" />
  </main>
</template>
