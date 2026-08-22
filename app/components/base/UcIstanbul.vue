<script setup>
/**
 * BÖLÜM 02 — ŞEHİR PLANI DEĞİŞTİRİR  ·  SIGNATURE #2: ÜÇ İSTANBUL
 *
 * FİKİR: koşul değişince KOMPOZİSYONUN GEOMETRİSİ değişir.
 * Slider değil, carousel değil, üç ayrı bölüm değil. Tek master
 * kompozisyon üç İstanbul koşuluna uyum sağlıyor ve uyum sağlarken
 * ŞEKLİ koşulu anlatıyor:
 *
 *   A  DAR SOKAK          kadraj yatay bir yarığa SIKIŞIR
 *   B  KAT                kadraj dikey bir sütuna DÖNER
 *   C  KONTROLLÜ ERİŞİM   kadraj AÇILIR, nefes alır
 *
 * Yani içerik "sokak dar" derken düzen gerçekten daralıyor; "kat çıkılıyor"
 * derken dikeyleşiyor; "erişim önceden netleşiyor" derken açılıyor. Hareket
 * dekor değil, cümlenin kendisi.
 *
 * OPERASYON ÇİZGİSİ BURADA MEKÂNSAL EKSEN
 * Bölüm 1'de kadrajı ölçüyordu. Burada koşulun eksenini çiziyor: A'da yatay
 * (sokak ekseni), B'de dikey (kat ekseni), C'de ikisi de kısalıp giriş
 * noktasını işaretleyen kısa bir ölçüye dönüyor. `uzat` fiili.
 *
 * ÜÇ KOŞUL, ÜÇ FOTOĞRAF — ve geçiş de kompozisyonun parçası
 * Her koşulun kendi karesi var: sokak seviyesi, merdiven boşluğu, site
 * giriş kapısı. Kareler birbirine SOLMA ile değil, ORTAYA SIKIŞARAK
 * devrediyor: çıkan kare `inset(0 50% 0 50%)` ile merkezde bir çizgiye
 * kapanıyor. Bu, kadrajın kendi hareketiyle üst üste biniyor — kadraj
 * dikey sütuna dönerken eski kare tam o merkezde kapanıyor, yeni kare
 * sütunun içinde açılıyor. Yani "koşul değişti" ile "geometri değişti"
 * aynı anda ve aynı yerde oluyor.
 *
 * Bölüm 3'teki devir YUKARI kapanıyor; burada MERKEZE sıkışıyor. İki
 * signature aynı aracı kullanmıyor: orada sıra, burada sıkışma.
 *
 * SÖZLEŞME: md.1 uzun yazım · md.2 opacity yok · md.3 opt-in · md.5 yuva
 * pencereden uzun · md.6 düzen animasyonu yok (kutu sabit, kırpma değişiyor)
 * · md.11 navbar ofseti.
 */

/**
 * İÇERİK KAYNAĞI — `HomeSection('uc-istanbul')`.
 *
 * Üç sahnenin etiketi, tipolojisi, başlığı, metni, fotoğrafı ve alt metni
 * panelden geliyor. SAHNE SAYISI koddan: üç sahne kompozisyonun kendisi
 * (yatay yarık / dikey sütun / açılma), dördüncüsü geometriyi bozardı —
 * sunucu tarafı da tam üç öğe olmayan kaydı reddediyor.
 *
 * SIRA NUMARALARI (01 / 02 / 03) da kodda: künye numaralandırması tasarım
 * dilinin parçası, işletme içeriği değil.
 */
const props = defineProps({
  bolum: { type: Object, required: true },
  ilceler: { type: Object, required: true },
})

const durumlar = computed(() =>
  (props.bolum.items || []).map((o, i) => ({
    no: String(i + 1).padStart(2, '0'),
    etiket: o.label,
    tipoloji: o.subLabel,
    baslik: o.title,
    metin: o.body,
    gorsel: o.imagePath,
    alt: o.imageAlt,
  }))
)
</script>

<template>
  <section class="ui-kap" aria-labelledby="uc-istanbul-baslik">
    <div class="ui sahne-alan">
      <p class="ui-kunye op-kunye">02 / ŞEHİR PLANI DEĞİŞTİRİR</p>

      <div class="ui-metin">
        <div class="ui-ray">
          <div class="ui-durak">
            <h2 id="uc-istanbul-baslik" class="ui-h2 tip-anlati">{{ bolum.heading }}</h2>
            <p class="ui-govde tip-govde">{{ bolum.lead }}</p>
          </div>

          <div v-for="d in durumlar" :key="d.no" class="ui-durak">
            <p class="ui-etiket op-kunye">{{ d.no }} / {{ d.etiket }} · {{ d.tipoloji }}</p>
            <h3 class="ui-h3 tip-alt">{{ d.baslik }}</h3>
            <p class="ui-govde tip-govde">{{ d.metin }}</p>
          </div>

          <div class="ui-durak">
            <!-- İlk satırdaki sayı TÜRETİLMİŞ: ilçe kayıtlarından geliyor,
                 metinle birlikte saklanmıyor. -->
            <p class="ui-sonuc tip-anlati">{{ ilceler.toplam }} ilçe.<br />{{ bolum.closing }}</p>
            <p class="ui-govde tip-govde">{{ bolum.closingNote }}</p>
            <!-- Hedef `/istanbul` idi. O adres artık ayrı bir sayfa değil (ana
                 sayfaya kalıcı yönlendiriliyor); bağlantının niyeti zaten
                 "çalıştığımız bölgeler", yani ilçe dizini. -->
            <NuxtLink to="/bolgelerimiz" class="op-bag ui-bag">{{ bolum.ctaLabel }}</NuxtLink>
          </div>
        </div>
      </div>

      <!-- ── GÖRSEL ALAN — kutu sabit, KADRAJ koşula uyuyor ───────────
           Kutu hiç değişmiyor (düzen animasyonu yok); değişen yalnız
           kırpma. Üç kare ilk HTML'de üst üste duruyor; hiçbiri sonradan
           eklenip çıkarılmıyor. Mekânsal eksen çizgileri kadrajın içinde
           koşulun yönünü çiziyor. -->
      <div class="ui-alan">
        <figure v-for="(d, i) in durumlar" :key="d.no" class="ui-kare" :style="`--k:${i}`">
          <!-- `sizes` ÖLÇÜLEN kutuya göre, tahmine göre değil (ölçüm: mobilde
               350px = %90vw, masaüstünde 540px = %38vw). Üstüne yalnız o
               karenin kendi zumu ekleniyor: 01 dar sokak yarığında 1,42
               büyüyor (%38 × 1,42 ≈ %54), 02 ve 03 neredeyse büyümüyor
               (%38 × 1,06 ≈ %40). Hepsine 01'in bütçesini vermek 02 ve
               03'te boşuna bayt demekti. -->
          <NuxtImg
            :src="d.gorsel"
            :alt="d.alt"
            class="ui-foto"
            format="webp"
            :sizes="i === 0
              ? 'xs:78vw sm:78vw md:78vw lg:56vw xl:56vw'
              : 'xs:78vw sm:78vw md:78vw lg:42vw xl:42vw'"
            loading="lazy"
            decoding="async"
            width="1448"
            height="1086"
          />
        </figure>
        <span class="ui-eksen ui-eksen--yatay" aria-hidden="true" />
        <span class="ui-eksen ui-eksen--dikey" aria-hidden="true" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ===========================================================================
   VARSAYILAN DÜZEN — normal akış, hareket yok.
   Beş durağın hepsi okunur; fotoğraf tam kadrajda.
   ======================================================================== */
.ui-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}
/* MOBİL/VARSAYILAN — masaüstünün küçültülmüşü DEĞİL, ayrı kurgu.
   Üç fotoğraf tek kutuya yığılmıyor; her koşulun karesi KENDİ metninin
   hemen ardında duruyor. Bunun için `.ui-metin`, `.ui-ray` ve `.ui-alan`
   kutu üretmiyor (`display: contents`), kareler ile duraklar aynı
   ızgaranın kardeşleri oluyor ve `order` ile birbirine geçiyor.

   Yan kazanç ölçüldü: üç kare aynı yerde üst üste dururken tarayıcı
   `loading="lazy"` eşiğine (~3000px) hepsini birden sokuyordu — ilk
   yüklemede 78 KB fazladan iniyordu. Sayfaya yayılınca yalnız ilki o
   pencereye giriyor. */
.ui {
  padding-block: var(--sahne-dikey);
  display: grid;
  gap: clamp(2.5rem, 2rem + 2vw, 4rem);
}
.ui-kunye {
  margin-bottom: 0;
  order: 0;
}
.ui-metin,
.ui-ray,
.ui-alan {
  display: contents;
}
.ui-durak:nth-child(1) { order: 1; }   /* giriş */
.ui-durak:nth-child(2) { order: 3; }   /* 01 DAR SOKAK */
.ui-durak:nth-child(3) { order: 5; }   /* 02 KAT */
.ui-durak:nth-child(4) { order: 7; }   /* 03 KONTROLLÜ ERİŞİM */
.ui-durak:nth-child(5) { order: 8; }   /* sonuç */

/* Mobilde koşulun geometrisini KUTUNUN KENDİSİ söylüyor.
   Masaüstünde tek çerçeve şekil değiştirerek anlatıyor; mobilde pin
   olmadığı için aynı cümleyi karelerin ORANI ve GENİŞLİĞİ kuruyor:

     01 DAR SOKAK        16:9, geniş   → yatay sıkışma
     02 KAT              3:4,  dar     → dikeyleşme
     03 KONTROLLÜ        4:3,  geniş   → açılma

   Kareler tam genişlik değil: bunlar metnin içine giren birer EK, Bölüm
   3'ün tam genişlik film şeridi gibi bir beyan değil — iki bölüm mobilde
   de birbirine benzemiyor. Ölçüldü: dar kutu bir alt varyant basamağını
   seçiyor (768 yerine 640), ilk yükleme penceresinde ~30 KB fark ediyor.
   `max-width` yalnız yedek katmanda iş görüyor (hareket azaltma ya da
   `animation-timeline` desteklemeyen tarayıcı geniş ekranda bu düzeni
   görüyor); orada oran metnin okuma genişliğine bağlanıyor. */
.ui-kare {
  margin: 0;
  width: 86%;
  max-width: 46rem;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: rgb(var(--c-paper-sunken));
}
.ui-kare:nth-child(1) { aspect-ratio: 16 / 9; order: 2; }
.ui-kare:nth-child(2) {
  aspect-ratio: 3 / 4;
  width: 62%;
  max-width: 26rem;
  order: 4;
}
.ui-kare:nth-child(3) { order: 6; }
/* Mekânsal eksen çizgileri yalnız masaüstü sahnesinin aracı; mobilde
   kadraj zaten her karenin kendi şekliyle konuşuyor. `.ui-alan` kutu
   üretmediği için mutlak konumlanacakları kap da yok. */
.ui-eksen { display: none; }
.ui-foto {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* 02 portre kutuda `cover` yatay kırpıyor; kadraj kaynağın sağ yarısına
   oturuyor (küpeşte, korkuluk, basamaklar). Aynı zamanda kaynaktaki
   siteye ait olmayan üniforma yazısını kadraj dışında bırakıyor. */
.ui-kare:nth-child(2) .ui-foto { object-position: 97% 50%; }
.ui-h2 { max-width: 20ch; }
.ui-h3 { max-width: 26ch; margin: 0.5rem 0 0; }
.ui-etiket { color: rgb(var(--c-ink-soft)); }
.ui-govde { max-width: 52ch; margin: 0.875rem 0 0; }
.ui-sonuc { max-width: 14ch; }
.ui-bag { margin-top: 1.5rem; }

/* ===========================================================================
   İYİLEŞTİRME KATMANI — SIGNATURE #2
   ======================================================================== */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    /* ---- MOBİL: PIN YOK ------------------------------------------------
       Koşulun geometrisini kutunun oranı söylüyor (yukarıda). Buraya bir
       de koşul biçiminde kırpma koymak aynı cümleyi iki kez kurmak olurdu
       — üstelik 3:4 kutuda yatay kırpma ince bir dilime düşüyordu. Kalan
       tek hareket, karenin görünüme girerken oturması: kadraj kenardan
       açılıyor, o kadar (md.7). */
    .ui-kare {
      view-timeline-name: --ui-kare;
      view-timeline-axis: block;
      animation-name: ui-m-otur;
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --ui-kare;
      animation-range: entry 80% entry 100%;
    }
    @keyframes ui-m-otur {
      0%   { clip-path: inset(9% 0% 9% 0%); }
      100% { clip-path: inset(0% 0% 0% 0%); }
    }

    /* ---- MASAÜSTÜ: yapışkan sahne, beş durak --------------------------- */
    @media (min-width: 1024px) {
      .ui-kap {
        height: 420vh;
        view-timeline-name: --ui;
        view-timeline-axis: block;
      }
      .ui {
        position: sticky;
        top: var(--sahne-navbar);
        height: calc(100vh - var(--sahne-navbar));
        padding-block: clamp(2rem, 1.25rem + 2vw, 3.5rem);
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        column-gap: var(--sahne-kolon-arasi);
        grid-template-rows: auto minmax(0, 1fr);
        row-gap: clamp(1rem, 0.5rem + 1.5vw, 2rem);
        align-content: center;
      }
      /* Mobildeki iç içe geçme geri alınıyor: metin ve görsel alan yeniden
         kendi kutularını üretiyor, kareler tek sabit çerçevede yığılıyor. */
      .ui-metin { display: block; }
      .ui-ray { display: grid; }
      .ui-alan { display: block; }
      .ui-eksen { display: block; position: absolute; background: rgb(var(--c-paper) / 0.9); }
      .ui-eksen--yatay {
        left: 6%; right: 6%; top: 50%; height: 1px;
        transform: scaleX(0); transform-origin: left center;
      }
      .ui-eksen--dikey {
        top: 6%; bottom: 6%; left: 50%; width: 1px;
        transform: scaleY(0); transform-origin: center top;
      }
      .ui-durak, .ui-kare { order: 0; }

      .ui-kunye { grid-column: 1 / 8; grid-row: 1; margin-bottom: 0; }
      .ui-metin {
        grid-column: 2 / 8;
        grid-row: 2;
        overflow: hidden;
        height: 100%;
      }
      .ui-alan {
        grid-column: 8 / 13;
        grid-row: 1 / 3;
        position: relative;
        margin: 0;
        height: 100%;
        overflow: hidden;
      }
      /* Seçici `.ui-alan .ui-kare` — sade `.ui-kare` DEĞİL. Mobil düzendeki
         kare-başına kurallar (`.ui-kare:nth-child(2)`) daha özgül; sade
         sınıfla sıfırlamak yetmiyordu ve kareler masaüstünde birbirini
         örtmeyip üç ayrı dikdörtgen hâlinde üst üste biniyordu (ölçüldü).
         Burada özgüllük eşit, sıra sonra — sıfırlama tutuyor. */
      .ui-alan .ui-kare {
        position: absolute;
        inset: 0;
        width: auto;
        max-width: none;
        aspect-ratio: auto;
        z-index: calc(10 - var(--k));
        view-timeline-name: none;
        order: 0;
      }

      /* --- Metin rayı: beş durak ------------------------------------- */
      .ui-ray {
        gap: 0;
        height: 100%;
        grid-auto-rows: 160%;
        animation-name: ui-ray-kay;
      }
      .ui-durak {
        min-height: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      @keyframes ui-ray-kay {
        0%, 12%   { transform: translateY(-30%); }
        20%, 34%  { transform: translateY(-190%); }
        42%, 56%  { transform: translateY(-350%); }
        64%, 78%  { transform: translateY(-510%); }
        86%, 100% { transform: translateY(-670%); }
      }

      /* --- KADRAJ: sıkışır → dikeyleşir → açılır --------------------- */
      .ui-alan { animation-name: ui-kadraj; }
      .ui-eksen--yatay { animation-name: ui-eksen-yatay; }
      .ui-eksen--dikey { animation-name: ui-eksen-dikey; }
      .ui-ray,
      .ui-alan,
      .ui-kare,
      .ui-foto,
      .ui-eksen--yatay,
      .ui-eksen--dikey {
        animation-duration: auto;
        animation-timing-function: linear;
        animation-fill-mode: both;
        animation-timeline: --ui;
        animation-range: contain 0% contain 100%;
      }

      /* Giriş tam kadraj → A yatay yarık → B dikey sütun → C açık →
         kapanışta ölçülü bir bant olarak duruyor.

         YATAY DEĞERLER SIFIR. Ölçüldü: %3/%7/%10'luk yan kırpmalarla
         kadrajın sağ kenarı 1373 → 1351 → 1335 px arasında geziniyordu,
         oysa Hero ve Süreç'in görsel alanı sayfa boyunca 1389'da duruyor.
         Kenar her durakta başka bir yere düşünce ızgara gerekçesiz
         görünüyordu. Şimdi kadraj yalnız DİKEY sıkışıyor; tek yatay
         kırpma dikey sütun — orada darlık zaten cümlenin kendisi. */
      @keyframes ui-kadraj {
        0%, 12%   { clip-path: inset(4% 0% 4% 0%); }
        20%, 34%  { clip-path: inset(31% 0% 31% 0%); }   /* DAR SOKAK */
        42%, 56%  { clip-path: inset(2% 33% 2% 33%); }   /* KAT */
        64%, 78%  { clip-path: inset(7% 0% 7% 0%); }     /* KONTROLLÜ */
        86%, 100% { clip-path: inset(14% 0% 14% 0%); }
      }

      /* --- DEVİR: çıkan kare MERKEZE sıkışıp kapanıyor ----------------
         Kapanma anları kadrajın geçiş anlarıyla çakışıyor: 34→42 arasında
         kadraj yarıktan sütuna dönerken 01 tam o merkezde kapanıyor, 02
         sütunun içinde açılıyor. 56→64 arasında kadraj sütundan açılırken
         02 kapanıp 03'ü bırakıyor. Şeffaflık yok (md.2). */
      .ui-kare:nth-child(1) { animation-name: ui-devir-1; }
      .ui-kare:nth-child(2) { animation-name: ui-devir-2; }
      .ui-kare:nth-child(3) { animation-name: none; }
      @keyframes ui-devir-1 { 0%,34% { clip-path: inset(0 0 0 0); } 42%,100% { clip-path: inset(0 50% 0 50%); } }
      @keyframes ui-devir-2 { 0%,56% { clip-path: inset(0 0 0 0); } 64%,100% { clip-path: inset(0 50% 0 50%); } }

      /* `kadraj` — her kare kendi kadrajında duruyor (md.12).
         01 iki durak boyunca görünüyor (açık kadraj → yatay yarık), o
         yüzden tek animasyonlu kare o. 02 yalnız dikey sütunda, 03 yalnız
         açık kadrajda görünüyor; ikisi de sabit. */
      .ui-kare:nth-child(1) .ui-foto { animation-name: ui-icerik-1; }
      /* 02 dikey sütunda görünüyor. Kutu portre, kaynak 4:3 → `cover`
         yalnız YATAY kırpıyor (dikey artık yok, bu yüzden `object-position`
         y bileşeninin etkisi yok).

         %97 sütunu kaynağın x∈[%62,%81] bandına oturtuyor: yukarıda pencere
         ışığı, ortada eşyayı tutan kişi, altta oymalı küpeşte, demir
         korkuluk ve mermer basamaklar. Dikey sütun boyunca gerçek bir
         merdiven boşluğu okunuyor.

         İki değer denendi ve elendi: %36'da alt kattaki kişinin sırtındaki
         "İSTANBUL NAKLİYAT" yazısı okunacak kadar görünüyordu (bu marka
         siteye ait değil), %52'de sütun yalnız kanepe kütlesine düşüp
         "merdiven" okunmuyordu. */
      .ui-kare:nth-child(2) .ui-foto {
        object-position: 97% 50%;
        transform: scale(1.02);
      }
      .ui-kare:nth-child(3) .ui-foto {
        object-position: 32% 58%;
        transform: scale(1.06);
      }
      @keyframes ui-icerik-1 {
        0%, 12%   { transform: scale(1) translate(0, 0); }
        20%, 100% { transform: scale(1.42) translate(-2%, 2%); }
      }
      /* `uzat` — koşulun ekseni çiziliyor, diğeri geri çekiliyor. */
      @keyframes ui-eksen-yatay {
        0%, 12%   { transform: scaleX(0); }
        20%, 34%  { transform: scaleX(1); }
        42%, 100% { transform: scaleX(0); }
      }
      @keyframes ui-eksen-dikey {
        0%, 34%   { transform: scaleY(0); }
        42%, 56%  { transform: scaleY(1); }
        64%, 100% { transform: scaleY(0); }
      }
    }
  }
}
</style>
