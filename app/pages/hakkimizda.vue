<script setup>
/**
 * /HAKKIMIZDA — V2
 *
 * ESKİ SAYFA (bu turda değiştirildi)
 *   · `fixed-page-header`: koyu bant + noktalı desen; <h1> yalnız
 *     "Hakkımızda" yazıyordu ve alt başlık "On iki yıldır evden eve
 *     nakliyat yapıyoruz" diyordu — doğrulanmamış bir kuruluş süresi,
 *     sayfanın en görünür yerinde.
 *   · `about-intro`: metin + "ekibimiz" fotoğrafı + dört rakam kutusu
 *     (12+ yıl · 8.500+ taşıma · 81 il · %100 sigortalı). Dördü de kayıtla
 *     desteklenmiyor; fotoğraf da gerçek ekip değil.
 *   · `about-story`: yuvarlak numara madalyonları ve dikey rayla anlatı.
 *   · `about-expertise`: altı yuvarlak köşeli kart, 48 px ikonlar ve
 *     hizmetlerin /hizmetlerimiz'den kopyalanmış açıklamaları.
 *   · `base-final-cta`: eski dilde ikinci bir dev çağrı bloğu; alt
 *     bilgideki iletişim katmanının üstüne biniyordu.
 *
 * Üç eski bileşen (`about/Intro.vue`, `about/Story.vue`,
 * `about/Expertise.vue`) SİLİNMEDİ, yalnız kullanılmıyor. `base-final-cta`
 * da yerinde duruyor ve diğer sayfalar kullanmaya devam ediyor.
 *
 * VERİ TEK YERDEN, İKİ KAYNAKTAN
 *   · `/api/about-section` → anlatı metinleri (panelden düzenlenebilir)
 *   · `/api/services`      → hizmet adları, ana sayfayla AYNI kayıt
 *
 * İkinci istekten yalnız yedi ad ve slug taşınıyor. `transform` sunucuda
 * çalıştığı için 30 KB'lık hizmet yanıtının tamamı değil, süzülmüş hâli
 * sayfa yüküne giriyor — mahalle turunda ölçülen "okunmayan veri taşıma"
 * hatasının tekrarlanmaması için.
 *
 * BOŞ DURUM: ziyaretçiye yönetim paneli talimatı GÖSTERİLMEZ. Kayıt
 * boşsa bölümler kendiliğinden düşüyor; giriş ise kod içindeki yedek
 * metinle basılıyor, böylece sayfa hiçbir koşulda <h1>'siz kalmıyor.
 */
/**
 * SAYFAYA YALNIZ BASILAN ALANLAR İNİYOR.
 *
 * `transform` sunucuda çalışıyor; Nuxt yüküne kaydın tamamı değil, süzülmüş
 * hâli giriyor. İki sebep var, ikincisi asıl olan:
 *
 *   1. Kayıt `services` (6 satır) ve `stats` (4 satır) taşıyor. Hiçbiri
 *      basılmıyor — süzülmeseydi her istekte boşuna gönderilirdi.
 *   2. `teamImageAlt` alanı "Güler yüzlü nakliyat ekibimiz modern
 *      araçlarımızla beraber" yazıyor ve görsel sentetik. Ekranda
 *      basmamak yetmiyordu: alan HTML kaynağına gömülü gidiyordu. Gerçek
 *      ekip diye sunulmuş bir görsel, sayfanın hiçbir yerinde durmamalı.
 *      (Alanlar veri tabanında SİLİNMEDİ; panelden görünüyorlar.)
 */
const ALANLAR = [
  'mainTitle',
  'description1',
  'description2',
  'description3',
  'historyTitle',
  'historyText1',
  'historyText2',
  'historyText3',
]

const { data: hakkimizda } = await useFetch('/api/about-section', {
  key: 'about-section',
  /**
   * `/api/about-section` kayıt yokken de doldurulmuş bir varsayılan nesne
   * döndürüyor (bkz. server/domain/sections/about-section.service.ts). Bu
   * yüzden "veri var mı?" sorusunun cevabı nesnenin varlığı değil, içinde
   * gerçekten metin olup olmadığı.
   */
  transform: (yanit) => {
    const kayit = yanit?.data
    if (!kayit) return null
    const suzulmus = Object.fromEntries(
      ALANLAR.map((alan) => [alan, String(kayit[alan] ?? '').trim()])
    )
    const doluMu = suzulmus.mainTitle || suzulmus.description1 || suzulmus.historyText1
    return doluMu ? suzulmus : null
  },
})

const { data: hizmetler } = await useFetch('/api/services', {
  key: 'about-hizmetler',
  transform: (yanit) =>
    (yanit?.data?.services || [])
      .filter((h) => h.slug && h.title)
      .map((h) => ({ ad: h.title, slug: h.slug })),
})

const { brandName } = await usePageSeo('about', sayfaMetasi('about'))

/**
 * YAPISAL VERİ — yalnız `AboutPage`.
 *
 * Yol izi `about/Giris.vue` içinde Microdata olarak, GÖRÜNEN listeyle aynı
 * kaynaktan işaretleniyor; burada tekrarlanmıyor (eski koyu bant onu
 * kendisi basıyordu, bant kalkınca işaretleme girişe taşındı).
 *
 * `foundingDate`, `numberOfEmployees`, `award` ve `aggregateRating`
 * BİLİNÇLİ OLARAK YOK: hiçbiri için doğrulanmış kayıt yok. Uydurulmuş bir
 * kuruluş yılı, yapısal veride sayfadaki metinden daha kalıcı olurdu.
 */
useHead({
  link: [{ rel: 'apple-touch-icon', href: '/favicon.ico', sizes: '180x180' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'Hakkımızda',
          description: hakkimizda.value?.description1 || undefined,
          publisher: { '@type': 'Organization', name: brandName.value },
        }),
    },
  ],
})

/**
 * SAYFANIN GÖRSEL VE EK BÖLÜM İÇERİĞİ.
 *
 * ANLATI METİNLERİ BURADA DEĞİL: başlık, giriş ve tarihçe paragrafları
 * `AboutSection` kaydından geliyor ve M6'da o panel yalnız gerçekten canlı
 * sekiz alana indirilmişti — o karar KORUNUYOR, alanlar ikinci kez
 * yazılmıyor.
 *
 * Buradaki istek yalnız `AboutSection`ın taşımadığı şeyler için: iki sahne
 * fotoğrafı ve üç bölümün editoryal metni.
 */
const { data: icerikYanit } = await useFetch('/api/ic-sayfa?page=hakkimizda', {
  key: 'ic-hakkimizda',
})

const bolum = (ad) => icerikYanit.value?.data?.[ad] ?? {}

/** Ortak kapanış imzasının bu ailedeki cümlesi — bkz. utils/kapanis.ts. */
const kapanisMetni = KAPANIS_METNI.ana

</script>

<template>
  <main>
    <about-giris :veri="hakkimizda" :bolum="bolum('giris')" />
    <about-anlayis :veri="hakkimizda" />
    <about-yontem :veri="hakkimizda" :bolum="bolum('yontem')" />
    <about-saha :bolum="bolum('saha')" />
    <about-kapsam :hizmetler="hizmetler || []" :bolum="bolum('kapsam')" />
    <about-odak :bolum="bolum('odak')" />
    <!-- `about-odak` içindeki "SONRAKİ ADIM" kutusunun iletişim cümlesi
         buraya devredildi; orada kalan fiyat aracı bağlantısı farklı bir
         hedef, tekrar değil. -->
    <lazy-base-kapanis :baslik="kapanisMetni" :hydrate-on-visible="{ rootMargin: '300px' }" />
  </main>
</template>
