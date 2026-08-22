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

</script>

<template>
  <main>
    <contact-giris :bolum="bolum('giris')" />
    <contact-kanallar :bolum="bolum('kanallar')" />
    <contact-talep-formu :bolum="bolum('form')" />
    <contact-yollar />
  </main>
</template>
