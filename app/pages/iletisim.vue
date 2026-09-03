<script setup>
/**
 * /ILETISIM — V2
 *
 * DÖNÜŞÜM UCU. Ana sayfa, hizmetler, yedi hizmet sayfası, /bolgelerimiz,
 * 39 ilçe, mahalleler ve /hakkimizda — hepsinin kapanışı buraya işaret
 * ediyor. Zincirin son halkası olarak en eski sayfa buydu.
 *
 * ESKİ SAYFA (bu turda değiştirildi)
 *   · `fixed-page-header`: koyu bant; <h1> `<main>` DIŞINDA kalıyordu
 *     (ölçüldü: `main h1` = 0). Alt başlığı "Ücretsiz keşif talebi, yazılı
 *     sabit fiyat teklifi…" diyordu.
 *   · `ui-heading` "Teklif Alın, Sorularınızı Sorun" + açıklamasında
 *     "yazılı ve taşıma gününe kadar sabit kalan bir fiyat".
 *   · `contact-form`: yuvarlak köşeli kart, "Ücretsiz Keşif ve Teklif"
 *     başlığı, `required` niteliği olmayan dört alan.
 *   · `contact-info`: üç yuvarlak kart, üç ikon karesi.
 *   · Harita bölümü: `googleMapsEmbed` alanı BOŞ olduğu için hiç
 *     basılmıyordu — ölü dal.
 *   · `base-final-cta`: iletişim sayfasında ikinci bir "bize ulaşın"
 *     çağrısı.
 *
 * Eski `contact/Form.vue` ve `contact/Info.vue` SİLİNMEDİ, yalnız
 * kullanılmıyor. `fixed/PageHeader.vue` ve `base/FinalCta.vue` da yerinde;
 * /blog ve diğer sayfalar kullanmaya devam ediyor.
 *
 * KALDIRILAN İSTEK: `/api/quote`.
 * Eski sayfa her istekte bu kaydı çekip telefonu önce oradan okuyordu.
 * Ölçüldü — kayıt veri tabanında YOK (`data: null`), yani dal hiç
 * çalışmıyordu ama sorgu her seferinde yapılıyordu. Telefonun tek kaynağı
 * artık Site Ayarları; navbar ve alt bilgi de oradan okuyor.
 */
const { brandName, settings } = await usePageSeo('contact', sayfaMetasi('contact'))

/**
 * YAPISAL VERİ — `ContactPage` + iletişim noktası.
 *
 * Yol izi `contact/Giris.vue` içinde Microdata olarak, ekranda görünen
 * listeyle aynı kaynaktan işaretleniyor; burada tekrarlanmıyor (eski koyu
 * bant onu kendisi basıyordu).
 *
 * `LocalBusiness` BURADA AÇILMIYOR: işletme kimliği ana sayfada bildiriliyor,
 * ikinci bir işletme düğümü aynı işletmeyi iki kez tanımlar.
 *
 * `areaServed` ESKİDEN 'TR' İDİ. Site artık Türkiye dizini değil; kanonik
 * yapı İSTANBUL → 39 İLÇE → MAHALLELER. Şehirler arası taşımada da çıkış ya
 * da varış adresi İstanbul oluyor (bkz. /hakkimizda 05).
 */
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'İletişim',
          description: `${brandName.value} iletişim bilgileri ve taşıma talebi formu.`,
          publisher: {
            '@type': 'Organization',
            name: brandName.value,
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: settings.value?.phone || settings.value?.mobilePhone || undefined,
              contactType: 'customer service',
              email: settings.value?.email || undefined,
              areaServed: 'İstanbul',
              availableLanguage: 'Turkish',
            },
          },
        }),
    },
  ],
})

/**
 * SAYFANIN EDİTORYAL ÇERÇEVESİ — TEK İSTEK.
 *
 * TELEFON, WHATSAPP, E-POSTA VE ADRES BURADAN GELMİYOR: onların tek sahibi
 * Site Ayarları ve bileşenler onu kendi paylaşılan isteğinden okuyor.
 * Form alan etiketleri ve doğrulama metinleri de kodda — onlar arayüz
 * metni, işletme içeriği değil.
 */
const { data: icerikYanit } = await useFetch('/api/ic-sayfa?page=iletisim', {
  key: 'ic-iletisim',
})

const bolum = (ad) => icerikYanit.value?.data?.[ad] ?? {}

/**
 * FİYAT HESAPLAYICIDAN DEVİR.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ADRES SATIRINA GÜVENİLMİYOR — İKİ KADEME
 *
 *   1. BİÇİM. `fiyatDevriniOku` yalnız beklenen sekiz alanı, beklenen
 *      biçimde okuyor: kimlikler ondalık basamak, katlar 0–30, mantıksal
 *      alanlar yalnız "1"/"0". Fazladan gelen hiçbir anahtar okunmuyor
 *      (allowlist), nesne birleştirme yok.
 *   2. GERÇEKLİK. `fiyatDevriniCoz` kimlikleri panelin GERÇEK listesine
 *      karşı doğruluyor; olmayan bir oda ya da mesafe kimliği devri
 *      tamamen geçersiz kılıyor.
 *
 * Biri bile tutmazsa `devir` `null` kalıyor ve sayfa NORMAL /iletisim
 * olarak açılıyor: özet basılmıyor, form birebir eski hâlinde. Hata
 * fırlatılmıyor, 500 üretilmiyor.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * KATSAYI SORGUSU YALNIZ DEVİR VARSA
 *
 * Doğrudan gelen ziyaretçide `/api/price-estimator` HİÇ çağrılmıyor
 * (`atlansinMi`). Anahtar ve dönüşüm hesaplayıcıyla ORTAK — ayrı yazılsa
 * aynı anahtar iki farklı imzayla kullanılır ve NUXT_E3004 doğardı
 * (bkz. composables/useFiyatKatsayilari.ts).
 *
 * TUTAR ADRESTEN OKUNMUYOR: aralık burada, doğrulanmış girdilerden ve
 * panelin katsayılarından yeniden hesaplanıyor.
 */
const route = useRoute()
const devirGirdisi = computed(() => fiyatDevriniOku(route.query))

const { data: fiyatKatsayilari } = await useFiyatKatsayilari(() => !devirGirdisi.value)

const devir = computed(() => fiyatDevriniCoz(devirGirdisi.value, fiyatKatsayilari.value))

/**
 * FORMLA BİRLİKTE GÖNDERİLEN HAM SEÇİMLER.
 *
 * Metin DEĞİL, seçimlerin kendisi gidiyor — adres satırıyla birebir aynı
 * biçimde. Talep kaydındaki özeti sunucu bu dokuz alandan, kendi veri
 * tabanı etiketleriyle üretiyor (bkz. server/api/leads.ts).
 *
 * MESAJ KUTUSU ARTIK ÖN DOLDURULMUYOR. Yapılandırma zaten yukarıdaki
 * "Hesaplama özeti" bloğunda okunuyor; kutuya da yazmak aynı metni
 * ekranda iki kez göstermek olurdu. Daha önemlisi: kutu düzenlenebilir
 * olduğu için kayıt kullanıcının silme kararına bağlı kalıyordu. Artık
 * kutu kullanıcının KENDİ notuna ait, kayıt ise sunucunun.
 */
const hesapAlanlari = computed(() =>
  devirGirdisi.value ? devirAlanlari(devirGirdisi.value) : null
)
</script>

<template>
  <main>
    <contact-giris :bolum="bolum('giris')" />
    <contact-kanallar :bolum="bolum('kanallar')" />
    <!-- Yalnız geçerli devirde. Normal /iletisim'de bu blok DOM'a hiç
         girmiyor; sayfanın eski hâli birebir korunuyor. -->
    <contact-hesap-ozeti
      v-if="devir"
      :cozum="devir"
      :uyari="fiyatKatsayilari?.not || ''"
    />
    <contact-talep-formu :bolum="bolum('form')" :hesap-alanlari="hesapAlanlari" />
    <contact-yollar />
  </main>
</template>
