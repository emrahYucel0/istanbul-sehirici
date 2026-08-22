<script setup>
/**
 * BÖLÜM 03 — TAŞIMANIN İÇİNDE NE OLUYOR?  ·  SIGNATURE #3: SÜREKLİLİK
 *
 * FİKİR: kadro sabit, operasyon ilerler.
 * Görsel alan hiç yer değiştirmiyor; içindeki beş kare birbirini
 * GEOMETRİK OLARAK devralıyor. Çıkan kare yukarı doğru kapanıyor, giren
 * kare aynı kenardan açılıyor — çapraz solma yok, yer değiştirme var.
 * Kullanıcı "yeni bölüm" değil "aynı iş ilerledi" görüyor.
 *
 * OPERASYON ÇİZGİSİ BURADA SÜREÇ OMURGASI
 * Bölüm 1'de kadrajı ölçüyordu, Bölüm 2'de mekânsal eksendi. Burada dikey
 * bir omurga ve beş çentik: aktif adımın kolu açılıyor (`uzat`), numarası
 * sinyale dönüyor. İlerleme çubuğu değil — çizgi baştan sona tam çizili,
 * çünkü bir ölçek; değişen şey hangi adımın çağrıldığı.
 *
 * BEŞ KARE, BEŞ AYRI ÖLÇEK
 * Kareler mesafeyi kademeli daraltıyor: geniş sokak → makro ambalaj →
 * oda içinde söküm → kamyon kasası → yerleşim. Aynı işin giderek yakından
 * görünüşü; her kare bir öncekinden daha içeride geçiyor.
 *
 * Not: 02 ve 03 daha önce elde olan iki karenin yapay büyütmesiydi
 * (scale 2.2 ve 1.9). Gerçek makro ve söküm kareleri geldiğinde o
 * büyütmeler kaldırıldı — zorlama kadraj artık gerekmiyor.
 *
 * BU BÖLÜM İKİ ESKİ BÖLÜMÜ İÇİNE ALDI
 *   Kanıt (kamyon içi sabitleme)  → 04. kare
 *   Nefes (kapanış cümlesi)       → 05. karenin payoff'u
 * İkisi de ayrı bölüm olarak sayfada tekrar etmiyor; dosyaları duruyor.
 *
 * SÖZLEŞME: md.1 uzun yazım · md.2 opacity yok, geçişler kırpma ·
 * md.4 kadro sabit · md.5 yuva pencereden uzun · md.6 düzen animasyonu yok ·
 * md.11 navbar ofseti · md.12 kadraj değerleri hesaplandı.
 */
/**
 * ICERIK KAYNAGI — `ProcessSection` / `ProcessStep`.
 *
 * YENI MODEL ACILMADI. Surec icin zaten bir domain modeli ve bir yonetim
 * paneli vardi; eksik olan tek sey bu bolumun ihtiyac duydugu alanlardi
 * (adim etiketi, fotograf, alt metin ve istege bagli baglanti). Onlar
 * `ProcessStep`e eklendi. Yani paneldeki "Surec Adimlari" ekrani artik
 * gercekten ana sayfayi yonetiyor — daha once hicbir public sayfaya bagli
 * degildi.
 *
 * ADIM SAYISI veriden geliyor: omurga centikleri ve kadraj gecisleri
 * `--i` / `--k` uzerinden hesaplaniyor, sabit bese bagli degil.
 *
 * Kare numaralari (01…05) KODDA uretiliyor: sira numarasi kunye dilinin
 * parcasi, yoneticinin yazacagi bir icerik degil.
 */
const props = defineProps({
  surec: { type: Object, required: true },
})

const KARELER = computed(() =>
  (props.surec.steps || []).map((a, i) => ({
    no: String(i + 1).padStart(2, '0'),
    etiket: a.label,
    baslik: a.title,
    metin: a.body,
    gorsel: a.imagePath,
    alt: a.imageAlt,
    bag: a.linkLabel && a.linkHref ? { ad: a.linkLabel, yol: a.linkHref } : null,
  }))
)
</script>

<template>
  <section class="sr-kap" aria-labelledby="surec-baslik">
    <div class="sr sahne-alan">
      <p class="sr-kunye op-kunye">03 / TAŞIMANIN İÇİNDE NE OLUYOR?</p>
      <h2 id="surec-baslik" class="sr-h2 tip-anlati">{{ surec.heading }}</h2>

      <!-- SÜREÇ OMURGASI — bilgi gerçek başlıklarda olduğu için `aria-hidden`. -->
      <div class="sr-omurga" aria-hidden="true">
        <span class="sr-omurga-cizgi" />
        <span v-for="(k, i) in KARELER" :key="k.no" class="sr-centik" :style="`--i:${i}`">
          <span class="sr-centik-kol" />
          <span class="sr-centik-no">{{ k.no }}</span>
        </span>
      </div>

      <!-- GÖRSEL ALAN — beş kare üst üste, kutu hiç değişmiyor.
           Hepsi ilk HTML'de; hiçbiri eklenip çıkarılmıyor (md.4). -->
      <div class="sr-alan">
        <figure v-for="(k, i) in KARELER" :key="k.no" class="sr-gorsel" :style="`--k:${i}`">
          <NuxtImg
            :src="k.gorsel"
            :alt="k.alt"
            class="sr-foto"
            format="webp"
            sizes="xs:90vw sm:90vw md:90vw lg:52vw xl:52vw"
            loading="lazy"
            decoding="async"
            width="1448"
            height="1086"
          />
        </figure>
      </div>

      <!-- METİN RAYI — beş adım, hepsi ilk HTML'de, sırayla. -->
      <div class="sr-metin">
        <ol class="sr-ray">
          <li v-for="k in KARELER" :key="k.no" class="sr-durak">
            <p class="sr-etiket op-kunye">{{ k.no }} / {{ k.etiket }}</p>
            <h3 class="sr-h3 tip-alt">{{ k.baslik }}</h3>
            <p class="sr-govde tip-govde">{{ k.metin }}</p>
            <NuxtLink v-if="k.bag" :to="k.bag.yol" class="op-bag op-bag--sakin sr-bag">
              {{ k.bag.ad }}
            </NuxtLink>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ===========================================================================
   VARSAYILAN DÜZEN — normal akış, hareket yok.
   Beş kare ve beş metin okunur; hiçbir içerik gizli değil.
   ======================================================================== */
.sr-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}
/* MOBİL/VARSAYILAN — her kare KENDİ adımının başında.
   Beş kareyi tek kutuda film şeridi olarak oynatmak ölçüldüğünde koptu:
   kutu listenin en üstünde ve yalnız ~263px yüksekliğinde olduğu için,
   okuyucu 01. adımı okurken şerit çoktan 04'e gelmiş oluyordu — kamyon
   karesi "keşif" metninin yanında duruyordu. Kare ile adım arasındaki
   bağ, sıranın kendisiyle kuruluyor: görsel alan ve metin rayı kutu
   üretmiyor, kareler ve duraklar aynı ızgarada birbirine geçiyor. */
.sr {
  padding-block: var(--sahne-dikey);
  display: grid;
  gap: clamp(2.25rem, 1.75rem + 1.5vw, 3.25rem);
}
.sr-kunye { margin-bottom: 0; order: 0; }
.sr-h2 { max-width: 20ch; order: 1; }

.sr-omurga { display: none; }

.sr-alan,
.sr-metin,
.sr-ray {
  display: contents;
}
.sr-gorsel:nth-child(1) { order: 2; }
.sr-durak:nth-child(1)  { order: 3; }
.sr-gorsel:nth-child(2) { order: 4; }
.sr-durak:nth-child(2)  { order: 5; }
.sr-gorsel:nth-child(3) { order: 6; }
.sr-durak:nth-child(3)  { order: 7; }
.sr-gorsel:nth-child(4) { order: 8; }
.sr-durak:nth-child(4)  { order: 9; }
.sr-gorsel:nth-child(5) { order: 10; }
.sr-durak:nth-child(5)  { order: 11; }

.sr-gorsel {
  margin: 0;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: rgb(var(--c-paper-sunken));
}
/* Geniş ekranda bu düzen yalnız yedek katmanda görünüyor (hareket azaltma
   ya da `animation-timeline` desteklemeyen tarayıcı). Kapaksız bırakılınca
   kareler 1.338px'e çıkıp metni eziyordu; Bölüm 2'nin yedek karelerine
   verilen ölçünün aynısına bağlanıyor. Mobilde etkisi yok — orada kare
   zaten tam genişlik, Bölüm 2'nin dar eklerinden ayrışması da bilinçli. */
@media (min-width: 1024px) {
  .sr-gorsel { max-width: 46rem; }
}
.sr-foto {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sr-ray {
  list-style: none;
  margin: 0;
  padding: 0;
}
.sr-etiket { color: rgb(var(--c-ink-soft)); }
.sr-h3 { max-width: 26ch; margin: 0.5rem 0 0; }
.sr-govde { max-width: 54ch; margin: 0.75rem 0 0; }
.sr-bag { margin-top: 1rem; }

/* ===========================================================================
   İYİLEŞTİRME KATMANI — SIGNATURE #3
   ======================================================================== */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    /* ---- MOBİL: PIN YOK ------------------------------------------------
       Kareler adımlarının arasına girdiği için "hangi görsel hangi adım"
       sorusu düzenle çözülüyor; şeride gerek kalmadı. Kalan tek hareket
       DEVİR DİLİ: kare alt kenarından yukarı doğru açılıyor — masaüstünde
       kareler yukarı kapanarak devrediyor, mobilde aynı yön açılışta
       tekrar ediyor (md.7). */
    .sr-gorsel {
      view-timeline-name: --sr-kare;
      view-timeline-axis: block;
      animation-name: sr-m-ac;
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --sr-kare;
      animation-range: entry 80% entry 100%;
    }
    @keyframes sr-m-ac {
      0%   { clip-path: inset(0% 0% 16% 0%); }
      100% { clip-path: inset(0% 0% 0% 0%); }
    }

    /* ---- MASAÜSTÜ: yapışkan sahne, beş kare --------------------------- */
    @media (min-width: 1024px) {
      .sr-kap {
        height: 480vh;
        view-timeline-name: --sr;
        view-timeline-axis: block;
      }
      .sr {
        position: sticky;
        top: var(--sahne-navbar);
        height: calc(100vh - var(--sahne-navbar));
        padding-block: clamp(2rem, 1.25rem + 2vw, 3.5rem);
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        column-gap: var(--sahne-kolon-arasi);
        grid-template-rows: auto auto minmax(0, 1fr);
        row-gap: clamp(0.75rem, 0.5rem + 1vw, 1.5rem);
        align-content: center;
      }
      .sr-kunye { grid-column: 1 / 8; grid-row: 1; margin-bottom: 0; }
      .sr-h2 { grid-column: 2 / 8; grid-row: 2; }

      /* EKSEN A — süreç omurgası. */
      .sr-omurga {
        display: block;
        position: relative;
        grid-column: 1;
        grid-row: 3;
      }
      .sr-omurga-cizgi {
        position: absolute;
        left: 0.75rem;
        top: 0;
        bottom: 0;
        width: 1px;
        background: rgb(var(--c-measure));
      }
      .sr-centik {
        position: absolute;
        left: 0;
        top: calc(var(--i) * 22% + 6%);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .sr-centik-kol {
        display: block;
        width: 1.5rem;
        height: 1px;
        background: rgb(var(--c-measure));
        transform-origin: left center;
        transform: scaleX(0.45);
      }
      .sr-centik-no {
        font-family: var(--f-mono);
        font-size: 0.6875rem;
        letter-spacing: 0.1em;
        color: rgb(var(--c-ink-soft));
      }

      /* EKSEN D — görsel alan, menteşeden sağa. */
      .sr-alan {
        grid-column: 7 / 13;
        grid-row: 1 / 4;
        position: relative;
        display: block;
        margin: 0;
        height: 100%;
        aspect-ratio: auto;
        overflow: hidden;
        view-timeline-name: none;
        background: rgb(var(--c-paper-sunken));
      }
      /* Seçici `.sr-alan .sr-gorsel` — sade sınıf değil: mobil sıra
         kuralları `:nth-child` ile yazıldığı için daha özgül. */
      .sr-alan .sr-gorsel {
        position: absolute;
        inset: 0;
        max-width: none;
        aspect-ratio: auto;
        z-index: calc(10 - var(--k));
        view-timeline-name: none;
        order: 0;
      }

      /* EKSEN B — metin. Mobildeki iç içe geçme geri alınıyor. */
      .sr-metin {
        display: block;
        grid-column: 2 / 7;
        grid-row: 3;
        overflow: hidden;
        height: 100%;
      }
      .sr-ray {
        display: grid;
        gap: 0;
        margin: 0;
        height: 100%;
        grid-auto-rows: 160%;
        animation-name: sr-ray-kay;
      }
      .sr-ray .sr-durak { order: 0; }
      .sr-durak {
        min-height: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      /* --- Zaman ekseni bağlantıları --------------------------------- */
      .sr-ray,
      .sr-gorsel,
      .sr-foto,
      .sr-centik-kol,
      .sr-centik-no {
        animation-duration: auto;
        animation-timing-function: linear;
        animation-fill-mode: both;
        animation-timeline: --sr;
        animation-range: contain 0% contain 100%;
      }

      /* `otur` — beş durak. */
      @keyframes sr-ray-kay {
        0%, 12%   { transform: translateY(-30%); }
        20%, 34%  { transform: translateY(-190%); }
        42%, 56%  { transform: translateY(-350%); }
        64%, 78%  { transform: translateY(-510%); }
        86%, 100% { transform: translateY(-670%); }
      }

      /* --- DEVİR: her kare yukarı kapanıp altındakini açığa çıkarıyor.
         Şeffaflık yok; sınır tamamen kırpma (md.2). */
      .sr-gorsel:nth-child(1) { animation-name: sr-devir-1; }
      .sr-gorsel:nth-child(2) { animation-name: sr-devir-2; }
      .sr-gorsel:nth-child(3) { animation-name: sr-devir-3; }
      .sr-gorsel:nth-child(4) { animation-name: sr-devir-4; }
      .sr-gorsel:nth-child(5) { animation-name: none; }
      @keyframes sr-devir-1 { 0%,12% { clip-path: inset(0 0 0 0); } 20%,100% { clip-path: inset(0 0 100% 0); } }
      @keyframes sr-devir-2 { 0%,34% { clip-path: inset(0 0 0 0); } 42%,100% { clip-path: inset(0 0 100% 0); } }
      @keyframes sr-devir-3 { 0%,56% { clip-path: inset(0 0 0 0); } 64%,100% { clip-path: inset(0 0 100% 0); } }
      @keyframes sr-devir-4 { 0%,78% { clip-path: inset(0 0 0 0); } 86%,100% { clip-path: inset(0 0 100% 0); } }

      /* `kadraj` — her kare kendi ölçeğinde duruyor. Beşi de kendi
         mesafesinde çekilmiş olduğu için yapay büyütmeye gerek kalmadı;
         kalan değerler yalnız özneyi dikey kutunun ortasına getiriyor
         (md.12). */
      .sr-gorsel:nth-child(1) .sr-foto { object-position: 50% 45%; }
      .sr-gorsel:nth-child(2) .sr-foto { object-position: 46% 50%; transform: scale(1.06); }
      .sr-gorsel:nth-child(3) .sr-foto { object-position: 42% 52%; transform: scale(1.04); }
      .sr-gorsel:nth-child(4) .sr-foto { object-position: 50% 50%; }
      .sr-gorsel:nth-child(5) .sr-foto { object-position: 50% 50%; transform: scale(1.04); }
      .sr-foto { animation-name: none; }

      /* `uzat` — aktif adımın kolu açılıyor, numarası sinyale dönüyor.
         Aynı anda tek numara bakır: aksan kıtlığı korunuyor. */
      .sr-centik:nth-child(2) .sr-centik-kol { animation-name: sr-kol-1; }
      .sr-centik:nth-child(3) .sr-centik-kol { animation-name: sr-kol-2; }
      .sr-centik:nth-child(4) .sr-centik-kol { animation-name: sr-kol-3; }
      .sr-centik:nth-child(5) .sr-centik-kol { animation-name: sr-kol-4; }
      .sr-centik:nth-child(6) .sr-centik-kol { animation-name: sr-kol-5; }
      .sr-centik:nth-child(2) .sr-centik-no { animation-name: sr-no-1; }
      .sr-centik:nth-child(3) .sr-centik-no { animation-name: sr-no-2; }
      .sr-centik:nth-child(4) .sr-centik-no { animation-name: sr-no-3; }
      .sr-centik:nth-child(5) .sr-centik-no { animation-name: sr-no-4; }
      .sr-centik:nth-child(6) .sr-centik-no { animation-name: sr-no-5; }
      @keyframes sr-kol-1 { 0%,12% { transform: scaleX(1); } 20%,100% { transform: scaleX(0.45); } }
      @keyframes sr-kol-2 { 0%,12% { transform: scaleX(0.45); } 20%,34% { transform: scaleX(1); } 42%,100% { transform: scaleX(0.45); } }
      @keyframes sr-kol-3 { 0%,34% { transform: scaleX(0.45); } 42%,56% { transform: scaleX(1); } 64%,100% { transform: scaleX(0.45); } }
      @keyframes sr-kol-4 { 0%,56% { transform: scaleX(0.45); } 64%,78% { transform: scaleX(1); } 86%,100% { transform: scaleX(0.45); } }
      @keyframes sr-kol-5 { 0%,78% { transform: scaleX(0.45); } 86%,100% { transform: scaleX(1); } }
      @keyframes sr-no-1 { 0%,12% { color: rgb(var(--c-signal)); } 20%,100% { color: rgb(var(--c-ink-soft)); } }
      @keyframes sr-no-2 { 0%,12% { color: rgb(var(--c-ink-soft)); } 20%,34% { color: rgb(var(--c-signal)); } 42%,100% { color: rgb(var(--c-ink-soft)); } }
      @keyframes sr-no-3 { 0%,34% { color: rgb(var(--c-ink-soft)); } 42%,56% { color: rgb(var(--c-signal)); } 64%,100% { color: rgb(var(--c-ink-soft)); } }
      @keyframes sr-no-4 { 0%,56% { color: rgb(var(--c-ink-soft)); } 64%,78% { color: rgb(var(--c-signal)); } 86%,100% { color: rgb(var(--c-ink-soft)); } }
      @keyframes sr-no-5 { 0%,78% { color: rgb(var(--c-ink-soft)); } 86%,100% { color: rgb(var(--c-signal)); } }
    }
  }
}
</style>
