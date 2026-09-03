<script setup>
/**
 * BÖLÜM 02 — ŞEHİR PLANI DEĞİŞTİRİR · SIGNATURE #2
 *
 * CMS yalnız içerik sahibidir: etiket, başlık ve açıklamalar HomeSection'dan gelir.
 * Sağdaki üç teknik çizim ise bu bölümün YAPISAL GÖRSEL DİLİDİR ve kodda tutulur.
 * Raster/AI fotoğraf kullanılmaz.
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
  })),
)

/** Coğrafi sayfa ağı açık mı — bkz. composables/useRegionPages.ts. */
const bolgeAgiAcik = useRegionPages()
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
            <p class="ui-sonuc tip-anlati">{{ ilceler.toplam }} ilçe.<br />{{ bolum.closing }}</p>
            <p class="ui-govde tip-govde">{{ bolum.closingNote }}</p>
            <!-- Sonuç cümlesi ve "{{ ilceler.toplam }} ilçe" anlatısı
                 kalıyor; yalnız dizine giden çağrı coğrafi ağa bağlı. -->
            <NuxtLink v-if="bolgeAgiAcik" to="/bolgelerimiz" class="op-bag ui-bag">{{ bolum.ctaLabel }}</NuxtLink>
          </div>
        </div>
      </div>

      <!--
        DİYAGRAM BAŞLIKLARI CMS'TEN. `d.etiket` panelin `label` alanı; çizimin
        kendi terminolojisi ("ARAÇ YAKLAŞIMI", "RANDEVU ROTASI") kodda kalıyor.
        Sabit yazılırsa yönetici etiketi değiştirdiğinde metin sütunu yeni adı,
        çizim eski adı söyler — `test/anasayfa-kaynak.test.ts` bunu kilitliyor.
        SVG metni SARMAZ: panelde çok uzun bir etiket kadrajı taşırabilir.
      -->
      <div class="ui-alan">
        <figure
          v-for="(d, i) in durumlar"
          :key="d.no"
          class="ui-kare"
          :style="`--k:${i}`"
          :aria-label="d.baslik"
        >
          <!-- 01 · DAR SOKAK / ARAÇ YAKLAŞIMI -->
          <svg
            v-if="i === 0"
            class="ui-foto ui-teknik"
            viewBox="0 0 820 520"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <pattern id="ui-hatch-01" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" class="tek-hatch" />
              </pattern>
              <marker id="ui-arrow-01" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 Z" class="tek-signal-fill" />
              </marker>
            </defs>

            <g class="tek-grid">
              <path d="M60 110H760M60 260H760M60 410H760" />
              <path d="M180 60V455M410 60V455M640 60V455" />
            </g>

            <!-- Yapı cepheleri -->
            <g>
              <path class="tek-mimari" fill="url(#ui-hatch-01)" d="M74 94H274V180H238V206H74Z" />
              <path class="tek-mimari" fill="url(#ui-hatch-01)" d="M546 94H746V206H582V180H546Z" />
              <path class="tek-mimari" fill="url(#ui-hatch-01)" d="M74 344H262V426H74Z" />
              <path class="tek-mimari" fill="url(#ui-hatch-01)" d="M558 344H746V426H558Z" />
            </g>

            <!-- Yol ve ölçüler -->
            <path class="tek-strong" d="M82 232H738M82 322H738" />
            <path class="tek-soft tek-dash" d="M82 277H738" />
            <path class="tek-dim" d="M128 452H692M128 444V460M692 444V460" />
            <text x="410" y="474" text-anchor="middle" class="tek-label">GEÇİŞ 3.20 m</text>

            <!-- Araç üst görünüş -->
            <g transform="translate(305 236)">
              <rect x="0" y="7" width="142" height="68" rx="2" class="tek-fill-strong" />
              <rect x="112" y="18" width="42" height="46" rx="10" class="tek-fill-strong" />
              <path class="tek-soft" d="M16 20H104M16 31H104M16 42H104M16 53H104M16 64H104" />
              <circle cx="28" cy="78" r="7" class="tek-ink-fill" />
              <circle cx="122" cy="78" r="7" class="tek-ink-fill" />
            </g>

            <!-- Taşıma rotası -->
            <path
              pathLength="1"
              class="tek-route"
              d="M447 276H546V232H666V180"
              marker-end="url(#ui-arrow-01)"
            />
            <circle cx="447" cy="276" r="4.5" class="tek-signal-fill" />
            <text x="562" y="250" class="tek-label-signal">TAŞIMA MESAFESİ</text>
            <text x="562" y="269" class="tek-label-signal tek-label-big">15 m</text>

            <!-- Teknik notlar -->
            <text x="88" y="72" class="tek-index">01</text>
            <text x="124" y="72" class="tek-title">{{ d.etiket }} / ARAÇ YAKLAŞIMI</text>
            <text x="88" y="496" class="tek-note">ARAÇ 2.20 · YAYA PAYI 1.00 · ADRESE GÖRE KURGU</text>
          </svg>

          <!-- 02 · MERDİVEN / DÖNÜŞ GEOMETRİSİ -->
          <svg
            v-else-if="i === 1"
            class="ui-foto ui-teknik"
            viewBox="0 0 520 760"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <marker id="ui-arrow-02" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" class="tek-signal-fill" />
              </marker>
            </defs>

            <path class="tek-grid-line" d="M70 96H450M70 650H450M90 74V680M430 74V680" />

            <!-- Merdiven kovası -->
            <rect x="112" y="142" width="296" height="470" class="tek-mimari" />
            <path class="tek-strong" d="M130 164V590M260 164V590M390 164V590" />
            <path class="tek-soft" d="M130 214H260M130 264H260M130 314H260M130 364H260M130 414H260M130 464H260M130 514H260M130 564H260" />
            <path class="tek-soft" d="M260 214H390M260 264H390M260 314H390M260 364H390M260 414H390M260 464H390M260 514H390M260 564H390" />

            <!-- Sahanlık -->
            <rect x="130" y="334" width="260" height="108" class="tek-paper-fill" />
            <path class="tek-dim" d="M130 466H390M130 458V474M390 458V474" />
            <text x="260" y="492" text-anchor="middle" class="tek-label">SAHANLIK 1.05 m</text>

            <!-- Eşya dönüş zarfı -->
            <rect x="154" y="176" width="224" height="310" class="tek-signal-soft tek-dash" />
            <g transform="translate(258 332) rotate(43)">
              <rect x="-62" y="-148" width="124" height="296" class="tek-turn" pathLength="1" />
              <path class="tek-signal-soft" d="M-46 -132H46V132H-46Z" />
            </g>
            <path class="tek-route" pathLength="1" d="M338 506A142 142 0 0 0 170 304" marker-end="url(#ui-arrow-02)" />

            <!-- Ölçüler -->
            <path class="tek-dim" d="M94 142V612M86 142H102M86 612H102" />
            <text x="68" y="382" text-anchor="middle" class="tek-label" transform="rotate(-90 68 382)">KAT EKSENİ 2.10 m</text>
            <path class="tek-dim" d="M154 118H378M154 110V126M378 110V126" />
            <text x="266" y="104" text-anchor="middle" class="tek-label-signal tek-label-big">GEREKLİ DÖNÜŞ 2.16 m</text>

            <text x="62" y="58" class="tek-index">02</text>
            <text x="98" y="58" class="tek-title">MERDİVEN / DÖNÜŞ GEOMETRİSİ</text>
            <text x="260" y="704" text-anchor="middle" class="tek-note">KIRILMA NOKTASI · SAHANLIK · EŞYA ZARFI</text>
          </svg>

          <!-- 03 · KONTROLLÜ ERİŞİM / RANDEVU ROTASI -->
          <svg
            v-else
            class="ui-foto ui-teknik"
            viewBox="0 0 840 560"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <marker id="ui-arrow-03" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" class="tek-signal-fill" />
              </marker>
            </defs>

            <!-- Site sınırı -->
            <rect x="90" y="92" width="660" height="374" rx="2" class="tek-strong tek-dash" />
            <path class="tek-grid-line" d="M90 280H750M420 92V466" />

            <!-- Kapı / güvenlik -->
            <path class="tek-strong" d="M90 250V310M78 250H102M78 310H102" />
            <rect x="116" y="244" width="88" height="72" class="tek-paper-fill" />
            <text x="160" y="276" text-anchor="middle" class="tek-label">GÜVENLİK</text>
            <text x="160" y="294" text-anchor="middle" class="tek-note">GİRİŞ</text>

            <!-- Yükleme cebi -->
            <rect x="282" y="220" width="130" height="92" class="tek-signal-soft tek-dash" />
            <rect x="304" y="242" width="86" height="48" class="tek-fill-strong" />
            <text x="347" y="269" text-anchor="middle" class="tek-label">YÜKLEME</text>

            <!-- Bloklar -->
            <g>
              <rect x="500" y="138" width="92" height="84" class="tek-paper-fill tek-mimari" />
              <rect x="620" y="138" width="92" height="84" class="tek-paper-fill tek-mimari" />
              <rect x="500" y="326" width="92" height="84" class="tek-paper-fill tek-mimari" />
              <rect x="620" y="326" width="92" height="84" class="tek-paper-fill tek-mimari" />
              <text x="546" y="187" text-anchor="middle" class="tek-block">A</text>
              <text x="666" y="187" text-anchor="middle" class="tek-block">B</text>
              <text x="546" y="375" text-anchor="middle" class="tek-block tek-block-signal">C</text>
              <text x="666" y="375" text-anchor="middle" class="tek-block">D</text>
            </g>

            <!-- Rota -->
            <path
              pathLength="1"
              class="tek-route"
              d="M72 280H214V266H282V338H430V376H500"
              marker-end="url(#ui-arrow-03)"
            />
            <circle cx="72" cy="280" r="4.5" class="tek-signal-fill" />
            <circle cx="500" cy="376" r="4.5" class="tek-signal-fill" />

            <!-- Randevu işareti -->
            <rect x="516" y="344" width="60" height="48" class="tek-signal-box" />
            <text x="546" y="374" text-anchor="middle" class="tek-label-signal tek-label-big">09:00</text>

            <!-- Ağaç / peyzaj ölçüm izleri -->
            <g class="tek-soft">
              <circle cx="168" cy="394" r="30" />
              <circle cx="206" cy="410" r="18" />
              <circle cx="700" cy="274" r="24" />
              <path d="M168 364V424M138 394H198M700 250V298M676 274H724" />
            </g>

            <text x="72" y="58" class="tek-index">03</text>
            <text x="108" y="58" class="tek-title">{{ d.etiket }} / RANDEVU ROTASI</text>
            <text x="110" y="500" class="tek-label-signal">RANDEVULU ROTA · İZİN ÖNCEDEN</text>
            <text x="110" y="524" class="tek-note">GİRİŞ → YÜKLEME CEBİ → BLOK C · SAAT PENCERESİ</text>
          </svg>

          <figcaption class="ui-kare-no op-kunye" aria-hidden="true">{{ d.no }}</figcaption>
        </figure>

        <span class="ui-eksen ui-eksen--yatay" aria-hidden="true"></span>
        <span class="ui-eksen ui-eksen--dikey" aria-hidden="true"></span>
      </div>
    </div>
  </section>
</template>

<style scoped>

/* ===========================================================================

   VARSAYILAN / MOBİL — normal belge akışı, pin yok.

   ======================================================================== */

.ui-kap {

  background: rgb(var(--c-paper));

  color: rgb(var(--c-ink));

}

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

.ui-durak:nth-child(1) { order: 1; }

.ui-durak:nth-child(2) { order: 3; }

.ui-durak:nth-child(3) { order: 5; }

.ui-durak:nth-child(4) { order: 7; }

.ui-durak:nth-child(5) { order: 8; }

.ui-kare {

  margin: 0;

  width: 86%;

  max-width: 46rem;

  aspect-ratio: 4 / 3;

  overflow: hidden;

  position: relative;

  background: transparent;
  border-top: 1px solid rgb(var(--c-rule));
  border-bottom: 1px solid rgb(var(--c-rule));

}

.ui-kare:nth-child(1) {

  aspect-ratio: 16 / 9;

  order: 2;

}

.ui-kare:nth-child(2) {

  aspect-ratio: 3 / 4;

  width: 62%;

  max-width: 26rem;

  order: 4;

}

.ui-kare:nth-child(3) {

  order: 6;

}

/*

   `cover` DEĞİL `contain`: karelerdeki görsel artık fotoğraf değil TEKNİK

   ÇİZİM (bkz. scripts/kesit-cizimleri.mjs). Kırpılmış bir ölçü çizgisi ya da

   yarısı kesilmiş bir etiket çizimi anlamsız kılar; fotoğrafta kadraj

   tercihiydi, burada bilgi kaybı olurdu.

   Odak noktaları da kalktı: `contain` ile çizimin TAMAMI görünüyor, kadrajda

   seçilecek bir bölge yok. Mikro parallax (scale 1.10'a kadar) duruyor —

   çizimler %8 güvenli payla üretiliyor, azami ölçek her kenardan %5.25

   yediği için etiketler kırpılmıyor. Bu pay betikte DENETLENİYOR.

*/

.ui-foto {

  display: block;

  width: 100%;

  height: 100%;

  object-fit: contain;

  object-position: center center;

}

/* ===========================================================================
   INLINE TEKNİK ÇİZİM SİSTEMİ
   Fotoğraf yok. Üç çizim aynı mühendislik sözlüğünü kullanıyor.
   ======================================================================== */
.ui-teknik {
  overflow: visible;
  color: rgb(var(--c-ink));
  shape-rendering: geometricPrecision;
}

.ui-teknik :is(path, line, rect, circle, polyline, polygon) {
  vector-effect: non-scaling-stroke;
}

.tek-grid {
  fill: none;
  stroke: rgb(var(--c-rule) / 0.58);
  stroke-width: 0.7;
}

.tek-grid-line {
  fill: none;
  stroke: rgb(var(--c-rule) / 0.72);
  stroke-width: 0.8;
}

.tek-hatch {
  stroke: rgb(var(--c-measure) / 0.45);
  stroke-width: 0.65;
}

.tek-mimari {
  stroke: rgb(var(--c-ink-soft));
  stroke-width: 1.25;
}

.tek-strong {
  fill: none;
  stroke: rgb(var(--c-ink));
  stroke-width: 1.55;
}

.tek-soft {
  fill: none;
  stroke: rgb(var(--c-measure));
  stroke-width: 0.85;
}

.tek-dim {
  fill: none;
  stroke: rgb(var(--c-measure));
  stroke-width: 0.95;
}

.tek-dash {
  stroke-dasharray: 7 6;
}

.tek-paper-fill {
  fill: rgb(var(--c-paper));
  stroke: rgb(var(--c-measure));
  stroke-width: 1;
}

.tek-fill-strong {
  fill: rgb(var(--c-paper-sunken));
  stroke: rgb(var(--c-ink));
  stroke-width: 1.3;
}

.tek-ink-fill {
  fill: rgb(var(--c-ink));
}

.tek-signal-fill {
  fill: rgb(var(--c-signal));
}

.tek-route,
.tek-turn {
  fill: none;
  stroke: rgb(var(--c-signal));
  stroke-width: 2;
  stroke-linecap: square;
  stroke-linejoin: miter;
}

.tek-signal-soft {
  fill: none;
  stroke: rgb(var(--c-signal));
  stroke-width: 1.05;
}

.tek-signal-box {
  fill: rgb(var(--c-paper));
  stroke: rgb(var(--c-signal));
  stroke-width: 1.35;
}

.tek-index,
.tek-title,
.tek-label,
.tek-label-signal,
.tek-note,
.tek-block {
  font-family: var(--f-mono);
}

.tek-index {
  fill: rgb(var(--c-signal));
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.08em;
}

.tek-title {
  fill: rgb(var(--c-ink));
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.tek-label {
  fill: rgb(var(--c-ink-soft));
  font-size: 11px;
  letter-spacing: 0.08em;
}

.tek-label-signal {
  fill: rgb(var(--c-signal));
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.09em;
}

.tek-label-big {
  font-size: 13px;
}

.tek-note {
  fill: rgb(var(--c-measure));
  font-size: 9.5px;
  letter-spacing: 0.08em;
}

.tek-block {
  fill: rgb(var(--c-ink));
  font-size: 16px;
  font-weight: 700;
}

.tek-block-signal {
  fill: rgb(var(--c-signal));
}


/* Numara eskiden koyu fotoğrafın üstünde TERS bloktu. Çizimin zemini kâğıt;

   aynı blok orada kirli bir yama gibi durur ve ölçü çizgilerini örter.

   Kutunun DIŞINA da alınamıyor: `.ui-kare` `overflow: hidden` (devir

   koreografisi kırpmayla çalışıyor), dışarı konan künye kırpılıyordu.

   Bu yüzden içeride, çizimlerin boş bıraktığı sağ üst köşede. */

.ui-kare-no {

  position: absolute;

  right: 0.7rem;

  top: 0.6rem;

  bottom: auto;

  padding: 0;

  color: rgb(var(--c-ink-soft));

  background: none;

}

.ui-eksen {

  display: none;

}

.ui-h2 {

  max-width: 20ch;

}

.ui-h3 {

  max-width: 26ch;

  margin: 0.5rem 0 0;

}

.ui-etiket {

  color: rgb(var(--c-ink-soft));

}

.ui-govde {

  max-width: 52ch;

  margin: 0.875rem 0 0;

}

.ui-sonuc {

  max-width: 14ch;

}

.ui-bag {

  margin-top: 1.5rem;

}

/* ===========================================================================

   İYİLEŞTİRME KATMANI — SCROLL-DRIVEN EDITORYAL KOREOGRAFİ

   ======================================================================== */

@supports (animation-timeline: view()) {

  @media (prefers-reduced-motion: no-preference) {

    /* Mobil: yalnız giriş kırpması. */

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

    @media (min-width: 1024px) {

      .ui-kap {

        height: 500vh;

        overflow: clip;

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

        grid-template-rows: auto minmax(0, 1fr);

        column-gap: var(--sahne-kolon-arasi);

        row-gap: clamp(1rem, 0.5rem + 1.5vw, 2rem);

        align-content: center;

      }

      .ui-metin {

        display: block;

        grid-column: 1 / 6;

        grid-row: 2;

        height: 100%;

        overflow: hidden;

        position: relative;

        z-index: 20;

      }

      .ui-ray {

        display: grid;

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

        order: 0;

      }

      .ui-kunye {

        grid-column: 1 / 7;

        grid-row: 1;

        margin-bottom: 0;

        position: relative;

        z-index: 30;

      }

      .ui-alan {

        display: block;

        grid-column: 6 / 13;

        grid-row: 1 / 3;

        position: relative;

        height: 100%;

        min-height: 0;

        overflow: visible;

        isolation: isolate;

      }

      .ui-alan .ui-kare {

        position: absolute;

        margin: 0;

        max-width: none;

        view-timeline-name: none;

        order: 0;

        background: rgb(var(--c-paper));
        border-top-color: rgb(var(--c-rule));
        border-bottom-color: rgb(var(--c-rule));
        will-change: transform, clip-path;

      }

      /* 01 / yatay editoryal kare */

      .ui-alan .ui-kare:nth-child(1) {
        /* Optik ölçek ×1.10 — 76→83.6, 52→57.2; merkez 53% / 51% sabit.
           Kadraj mantığı, oran ve koreografi aynı. */

        width: 83.6%;

        height: 57.2%;

        left: 11.2%;

        top: 22.4%;

        aspect-ratio: auto;

        z-index: 3;

        animation-name: ui-kare-1;

      }

      /* 02 / portre kare */

      .ui-alan .ui-kare:nth-child(2) {
        /* Optik ölçek ×1.10 — 44→48.4, 74→81.4; merkez 51% / 49% sabit.
           Kadraj mantığı, oran ve koreografi aynı. */

        width: 48.4%;

        height: 81.4%;

        left: 26.8%;

        top: 8.3%;

        aspect-ratio: auto;

        z-index: 4;

        animation-name: ui-kare-2;

      }

      /* 03 / açık yatay kare */

      .ui-alan .ui-kare:nth-child(3) {
        /* Optik ölçek ×1.10 — 78→85.8, 58→63.8; merkez 50% / 51% sabit.
           Kadraj mantığı, oran ve koreografi aynı. */

        width: 85.8%;

        height: 63.8%;

        left: 7.1%;

        top: 19.1%;

        aspect-ratio: auto;

        z-index: 5;

        animation-name: ui-kare-3;

      }

      /* TEKNİK PAFTA KUTU İÇİ HAREKETİ — raster kadrajı yok.

         Referans başka kareler kullanıyor (`/images/sahne-kat.webp` vb.);

         bizim `eski-apartman` karemizde `97% 50%` karenin en sağındaki BOŞ

         DUVARA denk geliyor (ekran görüntüsüyle doğrulandı). Koreografi

         birebir taşındı, kadraj değerleri kaynağa göre okundu. */

      .ui-alan .ui-kare:nth-child(1) .ui-foto { animation-name: ui-foto-1; }

      .ui-alan .ui-kare:nth-child(2) .ui-foto { animation-name: ui-foto-2; }

      .ui-alan .ui-kare:nth-child(3) .ui-foto { animation-name: ui-foto-3; }

      .ui-eksen {

        display: block;

        position: absolute;

        pointer-events: none;

        z-index: 2;

        background: rgb(var(--c-rule));

        transform-origin: center;

      }

      .ui-eksen--yatay {

        width: 82%;

        height: 1px;

        left: 9%;

        top: 50%;

        transform: scaleX(0);

        animation-name: ui-final-yatay;

      }

      .ui-eksen--dikey {

        width: 1px;

        height: 70%;

        left: 50%;

        top: 15%;

        transform: scaleY(0);

        animation-name: ui-final-dikey;

      }

      .ui-ray,

      .ui-alan .ui-kare,

      .ui-alan .ui-foto,

      .ui-eksen--yatay,

      .ui-eksen--dikey {

        animation-duration: auto;

        animation-timing-function: linear;

        animation-fill-mode: both;

        animation-timeline: --ui;

        animation-range: contain 0% contain 100%;

      }

      /*

       * Beş metin durağı: giriş / 01 / 02 / 03 / sonuç.

       * 160% yuva yüksekliği sayesinde geçişte iki metin aynı anda okunmuyor.

       */

      @keyframes ui-ray-kay {

        0%, 5%    { transform: translate3d(0, -30%, 0); }

        17%, 28%  { transform: translate3d(0, -190%, 0); }

        42%, 48%  { transform: translate3d(0, -350%, 0); }

        62%, 68%  { transform: translate3d(0, -510%, 0); }

        84%, 100% { transform: translate3d(0, -670%, 0); }

      }

      /*

       * 01: merkezde açılır → 02 gelince sol-üstte küçük bir “hatıra” kareye

       * dönüşür → finalde orada kalır.

       */

      @keyframes ui-kare-1 {

        0%, 4% {

          clip-path: inset(50% 0% 50% 0%);

          transform: translate3d(0, 18%, 0) scale(0.86);

        }

        11% {

          clip-path: inset(24% 0% 24% 0%);

          transform: translate3d(0, 9%, 0) scale(0.93);

        }

        17%, 29% {

          clip-path: inset(0% 0% 0% 0%);

          transform: translate3d(0, 0, 0) scale(1);

        }

        36% {

          clip-path: inset(0% 0% 0% 0%);

          transform: translate3d(-12%, -12%, 0) scale(0.84);

        }

        46% {

          clip-path: inset(0% 0% 0% 0%);

          transform: translate3d(-30%, -31%, 0) scale(0.61);

        }

        56%, 78% {

          clip-path: inset(0% 0% 0% 0%);

          transform: translate3d(-36%, -37%, 0) scale(0.54);

        }

        88%, 100% {

          clip-path: inset(0% 0% 0% 0%);

          transform: translate3d(-39%, -39%, 0) scale(0.50);

        }

      }

      /*

       * 02 bir anda “açılıp sonra kaçmıyor”. 01 hâlâ hareket ederken açılmaya

       * başlıyor; iki hareket yaklaşık %10-12 scroll boyunca üst üste biniyor.

       */

      @keyframes ui-kare-2 {

        0%, 27% {

          clip-path: inset(50% 0% 50% 0%);

          transform: translate3d(0, 16%, 0) scale(0.84);

        }

        34% {

          clip-path: inset(27% 0% 27% 0%);

          transform: translate3d(0, 9%, 0) scale(0.91);

        }

        42%, 49% {

          clip-path: inset(0% 0% 0% 0%);

          transform: translate3d(0, 0, 0) scale(1);

        }

        56% {

          clip-path: inset(0% 0% 0% 0%);

          transform: translate3d(19%, -8%, 0) scale(0.86);

        }

        66% {

          clip-path: inset(0% 0% 0% 0%);

          transform: translate3d(52%, -20%, 0) scale(0.68);

        }

        74%, 82% {

          clip-path: inset(0% 0% 0% 0%);

          transform: translate3d(64%, -24%, 0) scale(0.62);

        }

        90%, 100% {

          clip-path: inset(0% 0% 0% 0%);

          transform: translate3d(70%, -27%, 0) scale(0.58);

        }

      }

      /*

       * 03, 02 kenara giderken açılıyor. Final küçülmesi de tek sıçrama yerine

       * iki ara duraktan geçiyor; böylece son kompozisyon “yerine akıyor”.

       */

      @keyframes ui-kare-3 {

        0%, 47% {

          clip-path: inset(50% 0% 50% 0%);

          transform: translate3d(0, 18%, 0) scale(0.88);

        }

        55% {

          clip-path: inset(28% 0% 28% 0%);

          transform: translate3d(0, 10%, 0) scale(0.93);

        }

        63%, 72% {

          clip-path: inset(0% 0% 0% 0%);

          transform: translate3d(0, 0, 0) scale(1);

        }

        80% {

          clip-path: inset(0% 0% 0% 0%);

          transform: translate3d(1.5%, 13%, 0) scale(0.86);

        }

        90% {

          clip-path: inset(0% 0% 0% 0%);

          transform: translate3d(3%, 27%, 0) scale(0.74);

        }

        96%, 100% {

          clip-path: inset(0% 0% 0% 0%);

          transform: translate3d(4%, 34%, 0) scale(0.68);

        }

      }

      /* Teknik paftanın kutu içindeki mikro hareketi — parallax kadar hafif. */

      @keyframes ui-foto-1 {

        0%       { transform: scale(1.045) translate3d(0, 1.5%, 0); }

        22%      { transform: scale(1.095) translate3d(0, -0.5%, 0); }

        46%      { transform: scale(1.105) translate3d(-0.6%, -0.8%, 0); }

        72%      { transform: scale(1.085) translate3d(-0.3%, 0, 0); }

        100%     { transform: scale(1.07) translate3d(0, 0.4%, 0); }

      }

      @keyframes ui-foto-2 {

        0%       { transform: scale(1.035) translate3d(0, 1.5%, 0); }

        42%      { transform: scale(1.075) translate3d(0, -0.6%, 0); }

        64%      { transform: scale(1.085) translate3d(0.4%, -0.8%, 0); }

        82%      { transform: scale(1.06) translate3d(0.2%, 0, 0); }

        100%     { transform: scale(1.045) translate3d(0, 0.3%, 0); }

      }

      @keyframes ui-foto-3 {

        0%       { transform: scale(1.035) translate3d(0, 1.5%, 0); }

        63%      { transform: scale(1.075) translate3d(0, -0.6%, 0); }

        78%      { transform: scale(1.09) translate3d(-0.4%, -0.8%, 0); }

        92%      { transform: scale(1.06) translate3d(-0.2%, 0, 0); }

        100%     { transform: scale(1.045) translate3d(0, 0.3%, 0); }

      }


      /*
       * İç çizgi hareketi yalnız OPERASYON ROTASINDA.
       * Fade yok; stroke çizimi cümlenin fiziksel karşılığı.
       * reduced-motion'da rotalar baştan sona görünür.
       */
      .ui-alan .tek-route,
      .ui-alan .tek-turn {
        stroke-dasharray: 1;
        stroke-dashoffset: 1;
        animation-duration: auto;
        animation-timing-function: linear;
        animation-fill-mode: both;
        animation-timeline: --ui;
      }

      .ui-alan .ui-kare:nth-child(1) .tek-route {
        animation-name: tek-rota-ciz;
        animation-range: contain 12% contain 29%;
      }

      .ui-alan .ui-kare:nth-child(2) .tek-route,
      .ui-alan .ui-kare:nth-child(2) .tek-turn {
        animation-name: tek-rota-ciz;
        animation-range: contain 34% contain 50%;
      }

      .ui-alan .ui-kare:nth-child(3) .tek-route {
        animation-name: tek-rota-ciz;
        animation-range: contain 54% contain 71%;
      }

      @keyframes tek-rota-ciz {
        0%   { stroke-dashoffset: 1; }
        100% { stroke-dashoffset: 0; }
      }

      /* Finalde yapısal çizgiler üç kareyi tek sistem gibi bağlıyor. */

      @keyframes ui-final-yatay {

        0%, 78%   { transform: scaleX(0); }

        88%       { transform: scaleX(0.72); }

        96%, 100% { transform: scaleX(1); }

      }

      @keyframes ui-final-dikey {

        0%, 82%   { transform: scaleY(0); }

        91%       { transform: scaleY(0.68); }

        98%, 100% { transform: scaleY(1); }

      }

    }

  }

}

</style>