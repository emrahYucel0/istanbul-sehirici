<script setup>
/**
 * /BLOG — DİZİN, V2
 *
 * BU TUR YALNIZ DİZİN. Yazı detayları kök seviyede yaşıyor (`/{slug}`;
 * `/blog/{slug}` diye bir rota YOK — ölçüldü: 404) ve bu turda hiç
 * değiştirilmedi.
 *
 * ESKİ SAYFA (bu turda değiştirildi)
 *   · `fixed-page-header`: koyu bant; `<h1>` `<main>` DIŞINDA kalıyordu
 *     (ölçüldü: `main h1` = 0) ve yazı başlıkları `<h3>`ten başlıyordu.
 *   · `blog-list` + `blog-card`: dokuz yuvarlak köşeli kart (45 yuvarlak
 *     öğe, 21 gölge), her kartta uydurma bir yazar satırı, taranamayan
 *     sayfalama düğmeleri ve on yazı için bir arama kutusu.
 *   · `base-region-carousel`: 70 bölge kaydı (35 KB) taşıyan konu dışı
 *     kaydırak.
 *
 * Eski `blog/List.vue`, `blog/Card.vue`, `fixed/PageHeader.vue` ve
 * `base/RegionCarousel.vue` SİLİNMEDİ — kullanım denetimi raporda.
 *
 * YAZI İÇERİKLERİNE DOKUNULMADI: başlık, slug, özet, tarih, görsel ve
 * metinlerin hiçbiri değişmedi. Bu tur yalnız sunum.
 *
 * ─────────────────────────────────────────────────────────────────────
 * TEK İSTEK, TEK SÜZME.
 *
 * Liste ve giriş aynı veriye ihtiyaç duyuyor. İkisi de kendi `useFetch`ini
 * açsaydı — aynı anahtarla ama farklı `transform` ile — Nuxt anahtarı
 * paylaştığı için ikisinden biri diğerinin şeklini alırdı. İstek burada bir
 * kez yapılıp ikisine de prop olarak geçiliyor.
 *
 * SÜZME: `?light=true` zaten `content` alanını atıyor (30,5 KB → 8,7 KB);
 * `transform` de dizinin okumadığı alanları atıyor (subtitle, shortTitle,
 * metaTitle, metaDescription, author, updatedAt).
 *
 * BOZUK KAYIT LİSTEYİ KIRMIYOR: başlığı ya da slug'ı olmayan bir yazı
 * atlanıyor — bağlantısı olmayan bir satır basmak yerine.
 *
 * CANONICAL ve prev/next `blog-index/YaziListesi.vue` içinde; sayfalama
 * mantığı orada. `skipCanonical` o devri koruyor (mevcut davranış).
 */
await usePageSeo('blog', sayfaMetasi('blog'), { skipCanonical: true })

/*
 * İSTEK ORTAK SÖZLEŞMEDEN — `composables/useLightPosts.ts`.
 *
 * Burada `useFetch('/api/posts?light=true', { key: 'posts-light', transform })`
 * vardı. Aynı anahtarı `pages/[...slug].vue` transform'suz kullanıyordu;
 * Nuxt önbelleği anahtar başına tek kayıt tuttuğu için bir hizmet ya da
 * yazı sayfasından buraya SPA ile gelindiğinde bu transform HİÇ çalışmıyor,
 * liste bileşenine dizi yerine ham `{ success, data }` nesnesi gidiyor ve
 * dizin boşalıyordu (NUXT_E3004). Ayrıntı ve ölçüm composable'ın başında.
 *
 * GÖRÜNÜM MODELİ ARTIK `transform` DEĞİL, TÜRETME. Kanonik şekil ham hafif
 * kayıt dizisi; aşağıdaki Türkçe eşleme yalnız bu dizine ait bir sunum
 * kararı ve prev/next gezinmesinin okuduğu alanları (shortTitle, subtitle,
 * createdAt) listede bırakıyor.
 */
const { data: hamYazilar, error } = await useLightPosts()

const yazilar = computed(() =>
  hamYazilar.value.map((y) => ({
    id: y.id,
    slug: y.slug,
    baslik: y.title,
    ozet: String(y.excerpt ?? '').trim(),
    gorsel: String(y.image ?? '').trim(),
    gorselAlt: String(y.imageAlt ?? '').trim(),
    // Modelde ayrı bir yayın tarihi alanı YOK; `createdAt` kaydın
    // oluşturulma anı ve bu iş akışında yayın tarihine karşılık geliyor
    // (bkz. rapor: tarih anlamı).
    tarih: y.createdAt ?? null,
    // Alan modelde var ama on kaydın hiçbirinde dolu değil. Boşsa
    // satır hiç basılmıyor — eskisi gibi "{marka} Ekibi" uydurulmuyor.
    yazar: String(y.author ?? '').trim(),
  }))
)

/**
 * SAYFANIN EDİTORYAL ÇERÇEVESİ — TEK İSTEK.
 *
 * Bölümler ayrı ayrı istek atmıyor; içerik sayfa seviyesinde bir kez alınıp
 * prop olarak geçiliyor (M4'teki ana sayfa deseni).
 */
const { data: icerikYanit } = await useFetch('/api/ic-sayfa?page=blog', {
  key: 'ic-blog',
})

/** Bölüm anahtarına göre kontrollü içerik; kayıt yoksa boş nesne. */
const bolum = (ad) => icerikYanit.value?.data?.[ad] ?? {}

/** Ortak kapanış imzasının bu ailedeki cümlesi — bkz. utils/kapanis.ts. */
const kapanisMetni = KAPANIS_METNI.yazi

</script>

<template>
  <main>
    <!-- `|| []` yedeklerine gerek kalmadı: sözleşme her durumda dizi
         döndürüyor (istek atlansa da, yanıt boş gelse de). -->
    <blog-index-giris :yazi-sayisi="yazilar.length" :bolum="bolum('giris')" />
    <blog-index-yazi-listesi :yazilar="yazilar" :hata="Boolean(error)" />
    <!--
      `blog-index-kapanis` YERİNİ ORTAK İMZAYA BIRAKTI.
      O bileşen tek bir paragraftı ve tek işi iletişim sayfasına
      yönlendirmekti — yani sitenin geri kalanında artık ortak blokla
      yapılan iş. Cümlesi de yeni başlıkta yaşıyor: yazılar genel
      durumları anlatıyor, koşullar konuşulunca netleşiyor.
      Dosya silinmedi, yalnız render edilmiyor.
    -->
    <lazy-base-kapanis :baslik="kapanisMetni" :hydrate-on-visible="{ rootMargin: '300px' }" />
  </main>
</template>
