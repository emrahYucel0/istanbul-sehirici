<script setup>
/*
 * GÜNCEL SIRA (yeni tasarım geçişi sürüyor)
 *   Hero+Strip → Vaat → Süreç → Hizmetler → Kapsam  ← yeni, onaylı
 *   Help → Choose → Testimonial → Pricing → Faq → FinalCTA  ← henüz eski
 *
 * Aşağıdaki blok ESKİ kompozisyonu anlatıyor ve artık geçerli değil:
 * TrustBar, Process ve RegionFinder ana sayfadan çıkarıldı (bileşen
 * dosyaları duruyor). Yeni bölümler geldikçe blok tamamen yenilenecek;
 * şimdilik tarihsel kayıt olarak bırakıldı.
 *
 * ---- ESKİ (tarihsel) --------------------------------------------------
 * BÖLÜM SIRASI — ikna yayı
 *   Hero         ne vaat ediyoruz
 *   TrustBar     vaadi destekleyen sayılar (daha kaydırmadan)
 *   RegionFinder bölgenizde var mıyız (ziyaretçinin ilk sorusu)
 *   Help         sizin adınıza neyi üstleniyoruz (neler dahil)
 *   Process     nasıl oluyor (4 adım)
 *   Choose      neden biz (farkımız)
 *   Testimonial iddianın müşteri onayı — Choose'un hemen ardında
 *   Pricing     güven kurulduktan SONRA fiyat
 *   Faq         fiyat itirazının hemen karşılanması (ilk soru zaten fiyat)
 *   FinalCTA    net kapanış
 *
 * Help ile Choose bilerek AYRILDI: ikisi de "büyük görsel + madde listesi"
 * biçiminde ikna bloğu; yan yana geldiklerinde aynı bölüm iki kez
 * gösterilmiş gibi okunuyordu. Process aralarına girince hem tekrar hissi
 * kalkıyor hem de Choose → Testimonial (iddia → kanıt) bitişikliği
 * korunuyor.
 *
 * DİKEY BOŞLUK burada verilmez. Eskiden her bölüme `mb-20 mt-20` ekleniyor,
 * bölümler ayrıca kendi `py`'lerini taşıyordu; iki kaynak breakpoint'lerde
 * birbirini tutmuyordu. Artık tek kaynak UiSection (--space-section).
 *
 * ZEMİN BANTLAMASI dönüşümlü: TrustBar(beyaz) → RegionFinder(gövde) →
 * Help(beyaz) → Process(gövde) → Choose(beyaz) → Testimonial(gövde) →
 * Pricing(beyaz) → Faq(gövde) → FinalCTA(marka). Yan yana aynı zeminli iki
 * bölüm yok; ayırıcı çizgi çizmeye gerek kalmıyor.
 *
 * HİZMETLER BÖLÜMÜ NEDEN KALKTI
 * Hizmetler artık navbar'da kendi girişine ve /hizmetlerimiz altında yedi
 * ayrı sayfaya sahip; ana sayfada aynı kartları tekrarlamak o ekranı ikinci
 * bir menüye çeviriyordu. Yerine gelen RegionFinder iki boşluğu kapatıyor:
 * ziyaretçinin ilk sorusunu ("bölgemde var mısınız") anında cevaplıyor ve
 * ana sayfadan 120 bölge sayfasına giden — daha önce hiç olmayan — iç
 * bağlantıyı kuruyor. (bkz. components/base/RegionFinder.vue)
 */

// Sayfa başlığı/açıklaması artık tek merkezden geliyor: admin panelde bu
// sayfa için ("home") girilen Meta kaydı > aşağıdaki varsayılan > Site
// Ayarları'ndaki site geneli varsayılan. Marka adı ve site URL'i de Site
// Ayarları'ndan (SiteSettings) okunuyor — kodda sabit yazılmıyor.
// Varsayılan başlık/açıklama app/utils/sayfa-meta.ts kütüğünde; panelden
// girilen Meta kaydı varsa o kazanıyor.

/**
 * ANA SAYFA İÇERİĞİ — TEK İSTEK.
 *
 * Dokuz bölümün her biri kendi verisini çekseydi sunucu tarafında dokuz
 * turlu bir şelale oluşurdu; üstelik ilçe sayımı, hizmet defteri, SSS ve
 * yorumlar ayrı ayrı istenirdi. `/api/anasayfa` hepsini tek yanıtta veriyor:
 *
 *   bolumler   kontrollü içerik  (HomeSection)
 *   ilceler    türetilmiş sayım  (Region kayıtlarından)
 *   hizmetler  yayındaki hizmet defteri (Service)
 *   surec      ProcessSection / ProcessStep
 *   sorular    FaqSection / FaqItem (yalnız aktif)
 *   yorumlar   Testimonial (yalnız onaylı) + türetilmiş ortalama/adet
 *
 * Bileşenler artık sunum katmanı: veriyi prop olarak alıyorlar, kendi
 * istekleri yok. Tek istisna yorum FORMU — o bir gönderim (POST), okuma
 * değil; sayfa yüklenirken çalışmıyor. Site Ayarları (telefon) BİLEREK ayrı kaldı — o istek
 * zaten sayfa düzeni tarafından da yapılıyor ve anahtarla paylaşılıyor.
 */
/**
 * İKİ İSTEK PARALEL — ŞELALE YOK.
 *
 * `usePageSeo` ile ana sayfa içeriği birbirinden bağımsız. Sırayla `await`
 * edilselerdi sunucu tarafında iki turlu bir şelale oluşurdu; ikisi de aynı
 * turda gidiyor. (Composable'lar kurulum sırasında SENKRON çağrılıyor,
 * `await` yalnız sonuçları bekliyor.)
 *
 * ÜÇÜNCÜ İSTEK KALDIRILDI. Burada ayrıca `/api/reviews` çağrılıyordu; o veri
 * artık `/api/anasayfa` yanıtının içinde geliyor (bkz. domain/home). Yorum
 * bölümü eklenirken istek sayısı ARTMADI, azaldı.
 */
const [seo, anasayfaYanit] = await Promise.all([
  usePageSeo("home", sayfaMetasi("home")),
  useFetch("/api/anasayfa", { key: "anasayfa" }),
]);

const { settings, brandName, siteUrl, socialLinks, description } = seo;

const icerik = computed(() => anasayfaYanit.data.value?.data ?? null);

/** Bölüm anahtarına göre kontrollü içerik; kayıt yoksa boş nesne. */
const bolum = (anahtar) => icerik.value?.bolumler?.[anahtar] ?? {};

const ilceler = computed(
  () => icerik.value?.ilceler ?? { avrupa: 0, anadolu: 0, digerleri: 0, toplam: 0 }
);
const hizmetler = computed(() => icerik.value?.hizmetler ?? []);
const surec = computed(() => icerik.value?.surec ?? { heading: null, steps: [] });
const sorular = computed(() => icerik.value?.sorular ?? { heading: null, items: [] });
const yorumlar = computed(
  () => icerik.value?.yorumlar ?? { items: [], ortalama: null, adet: 0 }
);

/** Serbest metin çalışma saatlerinin schema.org karşılığı; çözülemezse boş. */
const acilisSaatleri = computed(() => calismaSaatleriSemasi(settings.value?.workingHours));

/**
 * YORUM YAPISAL VERİSİ — BİLEREK ÜRETİLMİYOR.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * KALDIRILDI: `aggregateRating` VE `review` DÜĞÜMLERİ
 *
 * Burada, aşağıdaki MovingCompany işaretlemesine eklenen iki blok vardı:
 * onaylı yorumlardan hesaplanan bir `aggregateRating` ve ilk beş yorumdan
 * üretilen `Review` düğümleri. İkisi de kaldırıldı.
 *
 * GEREKÇE — GOOGLE REVIEW SNIPPET KURALI
 * Bir işletme, KENDİ sitesinde KENDİ hakkındaki yorumları işaretleyemiyor.
 * Google bunu "self-serving review" sayıyor: yorumları toplayan, saklayan,
 * onaylayan ve yayınlayan taraf ile hakkında yorum yapılan taraf aynı
 * olduğunda yıldız işaretlemesi geçerli değil. Kural LocalBusiness ve
 * Organization için açıkça yazılı ve `MovingCompany` bir LocalBusiness alt
 * tipi.
 *
 * YORUMLARI GÖRÜNÜR YAPMAK BUNU DEĞİŞTİRMİYOR. M5 ile ziyaretçi yorumları
 * ana sayfada gerçekten görünüyor — ama görünürlük, işaretleme hakkı
 * doğurmuyor. Sayfadaki ortalama ve adet YALNIZ EKRAN İÇİN; hiçbir yapısal
 * veriye dönüşmüyorlar.
 *
 * ESKİ EŞİK NOTU (tarihsel): en az üç yorum şartı vardı, "eksik veri
 * göndermektense hiç göndermemek daha güvenli" diye. Doğru bir içgüdüydü
 * ama yanlış sorunu çözüyordu: sorun örneklemin küçüklüğü değil,
 * işaretlemenin en baştan bu siteye ait olmaması.
 *
 * FAQPage ve MovingCompany'nin geri kalanı AYNEN DURUYOR: ikisi de bu
 * kuralın kapsamında değil.
 */

useHead({
  script: [
    {
      type: "application/ld+json",
      // MovingCompany (schema.org'da LocalBusiness alt tipi) — jenerik
      // Organization yerine kullanılıyor; bir nakliyat firması için yerel
      // aramalarda ("İstanbul evden eve nakliyat" vb.) görünürlüğü doğrudan
      // etkileyen adres/telefon gibi alanları destekliyor.
      innerHTML: () =>
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MovingCompany",
          name: brandName.value,
          url: siteUrl.value,
          logo: settings.value?.logo || undefined,
          image: settings.value?.ogImage || undefined,
          telephone: settings.value?.phone || undefined,
          email: settings.value?.email || undefined,
          address: settings.value?.address
            ? {
                "@type": "PostalAddress",
                streetAddress: settings.value.address,
                addressCountry: "TR",
              }
            : undefined,
          description: description.value || undefined,
          // "TR" idi — bütün Türkiye demek. Sayfanın Kapsam bölümü
          // İstanbul'un 39 ilçesini anlatıyor; şema onunla çelişmemeli.
          areaServed: { "@type": "City", name: "İstanbul" },
          // BOŞ DİZİ GÖNDERİLMİYOR. Panelde hiçbir sosyal hesap girilmemiş
          // olduğu için `sameAs: []` basılıyordu; boş alan Google'a bilgi
          // vermez, yalnız gürültü üretir.
          sameAs: socialLinks.value?.length ? socialLinks.value : undefined,
          priceRange: settings.value?.priceRange || undefined,
          // Koordinat UYDURULMAZ: ikisi de girilmemişse alan hiç eklenmez.
          // Yanlış konum, işletmeyi haritada başka yerde gösterir.
          geo:
            settings.value?.latitude != null && settings.value?.longitude != null
              ? {
                  "@type": "GeoCoordinates",
                  latitude: settings.value.latitude,
                  longitude: settings.value.longitude,
                }
              : undefined,
          // Serbest metin saatlerden türetiliyor; ayrıştırılamayan satır
          // atlanıyor, hiçbiri çözülemezse alan eklenmiyor.
          openingHoursSpecification: acilisSaatleri.value.length
            ? acilisSaatleri.value
            : undefined,
          // `aggregateRating` ve `review` BİLEREK YOK — gerekçe yukarıda.
        }),
    },
  ],
});

/**
 * SSS YAPISAL VERİSİ — SORULAR BÖLÜMÜYLE AYNI KAYNAKTAN.
 *
 * Ana sayfada bugüne kadar FAQPage işaretlemesi hiç yoktu: altı soru
 * bileşenin içinde sabit yazılıydı ve hiçbir yerden okunamıyordu. Sorular
 * veri tabanına bağlandığı anda işaretleme de ÜCRETSİZ hâle geldi — ve
 * kritik olan şu: ekrandaki soru ile Google'a bildirilen soru AYNI
 * kayıttan geliyor. İkinci bir SSS dizisi yok, yani ikisi hiçbir zaman
 * ayrışamaz.
 *
 * Ayrı bir `useHead` çağrısı: soru yoksa etiket HİÇ basılmıyor. Boş bir
 * `FAQPage` yazmak Google'a "burada SSS var" deyip hiçbir şey vermek olur.
 */
useHead(
  computed(() => {
    const liste = sorular.value.items;
    if (!liste.length) return {};
    return {
      script: [
        {
          type: "application/ld+json",
          key: "anasayfa-sss",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: liste.map((s) => ({
              "@type": "Question",
              name: s.question,
              acceptedAnswer: { "@type": "Answer", text: s.answer },
            })),
          }),
        },
      ],
    };
  })
);
</script>

<template>
  <!--
    GECİKMELİ HİDRASYON — ölçülmüş bir soruna karşılık.

    Canlı Lighthouse'ta 2.040 ms'de başlayan 727 ms'lik tek bir uzun görev
    vardı: sayfadaki ON bölümün HEPSİNİN aynı anda hidrate edilmesi. Oysa
    mobilde ilk ekranda yalnızca hero var; kalan dokuzunun JS'i, kullanıcı
    oraya kaydırana kadar hiç çalışmak zorunda değil.

    `Lazy` öneki bileşeni ayrı bir parçaya alıyor, `hydrate-on-visible` ise
    hidrasyonu görünürlüğe bağlıyor. SUNUCU ÇIKTISI DEĞİŞMİYOR: HTML yine
    eksiksiz basılıyor, SEO ve JS-kapalı davranışı aynı kalıyor. Değişen
    tek şey "ne zaman canlanacağı".

    `rootMargin: 300px` KEYFİ DEĞİL: bu bölümlerin hepsi `useReveal`
    kullanıyor ve o, `onMounted`'da `.is-hidden` sınıfını ekliyor. Hidrasyon
    tam görünürlük anında olsaydı sıra şöyle işlerdi — eleman görünür →
    hidrate olur → gizlenir → animasyonla geri gelir; yani göz kırpma.
    300px erken hidrate edilince gizleme, eleman daha ekrana girmeden
    yapılıyor ve animasyon normal akışında oynuyor.

    Hero BİLEREK dışarıda: ilk ekranda ve parallax'ı imleci hemen izlemeli.
  -->
  <main class="flex flex-col">
    <!-- =====================================================================
         ANA SAYFA V2 — DÖRT ANLATI BÖLÜMÜ
         ---------------------------------------------------------------------
         Bağımsız section yığını değil; tek bir anlatının dört perdesi.
         Ortak eksen sistemi `assets/css/sahne.css` içinde: dört eksen
         (künye · metin · menteşe · görsel alan) ve tek tekrar eden yapısal
         araç (operasyon çizgisi). Her bölüm aynı ızgaranın başka bir DURUMU.

         01  İSTANBUL'DA TAŞINMAK      Hero          SIGNATURE #1  ölçüm
             nefes                     Kapsam        25 / 14 / 39
         02  ŞEHİR PLANI DEĞİŞTİRİR    UcIstanbul    SIGNATURE #2  uyum
         03  TAŞIMANIN İÇİNDE          Surec         SIGNATURE #3  süreklilik
             hizmet dizini             Hizmetler
         04  KARAR VERMEDEN ÖNCE       Fiyat · Sorular · Yorumlar · Kapanış

         YORUMLAR M5'te eklendi ve public yapının BİLİNÇLİ bir
         değişikliği: ziyaretçinin yorum gönderebileceği tek yer burası.

         HAREKET YOĞUNLUĞU finale doğru azalıyor: Signature'lar 01-03'te,
         son bölümde hiç scroll koreografisi yok.

         MOTOR: native CSS scroll-driven animation (view-timeline + sticky).
         GSAP kullanılmadı — gerekçesi ve ölçümü raporda.

         ESKİ RENDER'LAR KALDIRILDI, DOSYALARI DURUYOR:
           base-vaat   → Signature #1'in kapanışı aynı işi yapıyor
           base-kanit  → Süreç'in 04. karesine taşındı (kamyon içi)
           base-nefes  → Süreç'in 05. karesine taşındı (kapanış cümlesi)
    ===================================================================== -->

    <!-- ── BÖLÜM 01 ─────────────────────────────────────────────────── -->
    <base-hero :bolum="bolum('hero')" />
    <!-- Nefes anı: Signature #1'den hemen sonra ikinci bir büyük etkileşim
         başlatılmıyor. Sakin editoryal durum + kapsam sayımı. -->
    <lazy-base-kapsam
      :bolum="bolum('kapsam')"
      :ilceler="ilceler"
      :hydrate-on-visible="{ rootMargin: '300px' }"
    />

    <!-- ── BÖLÜM 02 ─────────────────────────────────────────────────── -->
    <lazy-base-uc-istanbul :bolum="bolum('uc-istanbul')" :ilceler="ilceler" hydrate-never />

    <!-- ── BÖLÜM 03 ─────────────────────────────────────────────────── -->
    <lazy-base-surec :surec="surec" hydrate-never />
    <lazy-base-hizmetler :bolum="bolum('hizmetler')" :hizmetler="hizmetler" hydrate-never />

    <!-- ── BÖLÜM 04 ─────────────────────────────────────────────────── -->
    <lazy-base-fiyat :bolum="bolum('fiyat')" hydrate-never />
    <lazy-base-sorular :sorular="sorular" hydrate-never />
    <!-- Yorumlar TEK HİDRATE EDİLEN geç bölüm: içindeki form etkileşimli.
         `hydrate-never` verilseydi düğme hiç çalışmazdı. Liste yine SSR'da
         basılı geliyor; hidrasyon yalnız formu canlandırıyor. -->
    <lazy-base-yorumlar
      :bolum="bolum('yorumlar')"
      :yorumlar="yorumlar"
      :hydrate-on-visible="{ rootMargin: '300px' }"
    />
    <lazy-base-kapanis :bolum="bolum('kapanis')" :hydrate-on-visible="{ rootMargin: '300px' }" />
  </main>
</template>
