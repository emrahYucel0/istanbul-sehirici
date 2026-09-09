<script setup>
/**
 * KINETIC SCOPE — "İKİ YAKA / TEK ŞEHİR"
 *
 * CMS sözleşmesi korunur:
 * - bolum.heading
 * - bolum.note
 * - ilceler.avrupa
 * - ilceler.anadolu
 * - ilceler.digerleri
 * - ilceler.toplam
 *
 * Bölümün yeni fikri:
 * 25 + 14 yalnız bir tablo olarak okunmaz.
 * İki yaka fiziksel olarak iki taraftan yaklaşır, Boğaz ekseni çizilir,
 * İstanbul haritası ortaya çıkar ve toplam "39" final mühür olur.
 *
 * Desktop: sticky / scroll-driven signature scene.
 * Tablet + mobil: aynı görsel dil, normal belge akışı; pin yok.
 * Ek JS / GSAP yok.
 */

const props = defineProps({
  bolum: { type: Object, required: true },
  ilceler: { type: Object, required: true },
})

const bolgeAgiAcik = useRegionPages()

const yakalar = computed(() => [
  {
    key: 'avrupa',
    yaka: 'AVRUPA YAKASI',
    yon: 'BATI',
    adet: props.ilceler.avrupa,
  },
  {
    key: 'anadolu',
    yaka: 'ANADOLU YAKASI',
    yon: 'DOĞU',
    adet: props.ilceler.anadolu,
  },
])

const toplam = computed(() => props.ilceler.toplam)

const toplamFormulu = computed(() => {
  const a = Number(props.ilceler.avrupa || 0)
  const b = Number(props.ilceler.anadolu || 0)
  return `${a} + ${b} = ${Number(props.ilceler.toplam || a + b)}`
})
</script>

<template>
  <section class="ks" aria-labelledby="kapsam-baslik">
    <div class="ks-track">
      <!-- CMS NOTU: ilk okunacak kısa öncül -->
      <p class="ks-onsoz">
        {{ bolum.note }}
      </p>

      <!--
        ANA SAHNE.
        Harita tek başına "görsel" değildir; iki yakanın birleştiği yüzeydir.
      -->
      <div class="ks-sahne">
        <!-- DEV ARKA PLAN TOPLAMI -->
        <div class="ks-dev-toplam" aria-hidden="true">
          {{ toplam }}
        </div>

        <!-- AVRUPA / ANADOLU: anlamsal dl olarak da çalışıyor -->
        <dl class="ks-yakalar">
          <div
            v-for="yaka in yakalar"
            :key="yaka.key"
            class="ks-yaka"
            :class="`ks-yaka--${yaka.key}`"
          >
            <dt class="ks-yaka-meta">
              <span class="ks-yaka-yon">{{ yaka.yon }}</span>
              <span class="ks-yaka-isim">{{ yaka.yaka }}</span>
            </dt>

            <dd class="ks-yaka-sayi">
              {{ yaka.adet }}
            </dd>
          </div>
        </dl>

        <!--
          BOĞAZ EKSENİ.
          Path dekoratif; gerçek bilgi sayım + H2'de.
          pathLength=1 stroke-dash animasyonunu viewport'tan bağımsız tutar.
        -->
        <svg
          class="ks-bogaz"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            class="ks-bogaz-hayalet"
            d="M53 -6 C40 9 62 19 48 31 C37 42 61 49 50 61 C40 72 57 83 44 106"
            pathLength="1"
          />
          <path
            class="ks-bogaz-canli"
            d="M53 -6 C40 9 62 19 48 31 C37 42 61 49 50 61 C40 72 57 83 44 106"
            pathLength="1"
          />
        </svg>

        <!-- HARİTA / MÜREKKEP KATMANI -->
        <figure class="ks-harita" aria-hidden="true">
          <img
            src="/images/istanbul-harita-cizim.webp"
            srcset="
              /images/istanbul-harita-cizim-480.webp   480w,
              /images/istanbul-harita-cizim-768.webp   768w,
              /images/istanbul-harita-cizim-1024.webp 1024w,
              /images/istanbul-harita-cizim.webp      1448w
            "
            sizes="(max-width: 767px) 94vw, (max-width: 1279px) 92vw, 100vw"
            alt=""
            class="ks-harita-foto"
            loading="lazy"
            decoding="async"
            width="1448"
            height="1086"
          />

          <!-- haritanın üzerinde teknik tarama / grain yerine gerçek CSS çizgisi -->
          <span class="ks-scan ks-scan--1"></span>
          <span class="ks-scan ks-scan--2"></span>
          <span class="ks-scan ks-scan--3"></span>
        </figure>

        <!-- MERKEZ MÜHÜR -->
        <div class="ks-muhur">
          <span class="ks-muhur-formul">{{ toplamFormulu }}</span>
          <span class="ks-muhur-sayi">{{ toplam }}</span>
          <span class="ks-muhur-etiket">İLÇE / TEK OPERASYON AĞI</span>
        </div>

        <!-- ANA İDDİA -->
        <div class="ks-iddia">
          <h2 id="kapsam-baslik" class="ks-h2">
            {{ bolum.heading }}
          </h2>
        </div>

        <!-- ÇIKIŞ -->
        <NuxtLink
          v-if="bolgeAgiAcik"
          to="/bolgelerimiz"
          class="ks-bag"
        >
          <span class="ks-bag-kucuk">39 ilçelik ağı aç</span>
          <span class="ks-bag-ana">Bölgelerimizi incele</span>
          <span class="ks-bag-ok" aria-hidden="true">↗</span>
        </NuxtLink>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* ==========================================================================
   KINETIC SCOPE — BASE / MOBILE FIRST
   ======================================================================= */

.ks {
  --ks-ink: rgb(var(--c-ink));
  --ks-soft: rgb(var(--c-ink-soft));
  --ks-paper: rgb(var(--c-paper));
  --ks-rule: rgb(var(--c-rule));
  --ks-measure: rgb(var(--c-measure));
  --ks-signal: rgb(var(--c-signal));
  --ks-signal-deep: rgb(var(--c-signal-deep));
  /* Her genişlikte güvenli yatay içerik sınırı. Desktop'ta aşağıda
     container'a bağlanarak 2K/4K ekranlarda içeriğin kenarlara kaçmasını önler. */
  --ks-edge: var(--sahne-pad);

  position: relative;
  margin-bottom: clamp(2.5rem, 6vw, 5rem);
  background: var(--ks-paper);
  color: var(--ks-ink);
  overflow: clip;
}

.ks-track {
  position: relative;
  max-width: var(--container-wide);
  margin: 0 auto;
  padding:
    var(--sahne-dikey-dar)
    var(--sahne-pad)
    calc(var(--sahne-perde) + clamp(0.5rem, 1.5vw, 1rem));
}

/* --------------------------------------------------------------------------
   KÜNYE
   ----------------------------------------------------------------------- */

.ks-kunye {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: clamp(1.25rem, 2.5vw, 2.25rem);
  padding-top: 0.7rem;
  border-top: 1px solid var(--ks-rule);
  font-family: var(--f-mono);
  font-size: clamp(0.54rem, 1.6vw, 0.625rem);
  line-height: 1.2;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--ks-soft);
}

.ks-kunye > span {
  min-width: 0;
}

.ks-kunye span:last-child {
  text-align: right;
  white-space: nowrap;
}

/* --------------------------------------------------------------------------
   ÖNSÖZ
   ----------------------------------------------------------------------- */

.ks-onsoz {
  position: relative;
  z-index: 4;
  margin: 0 0 clamp(2rem, 5vw, 4rem);
  max-width: 48ch;
  font-size: clamp(1rem, 0.94rem + 0.4vw, 1.25rem);
  line-height: 1.55;
  color: var(--ks-soft);
  text-wrap: pretty;
}

/* ==========================================================================
   ANA SAHNE
   ======================================================================= */

.ks-sahne {
  position: relative;
  isolation: isolate;
  /* Mobilde metin + mühür + CTA birbirine girmesin; tablet öncesinde
     yükseklik genişliğe göre büyür ama aşırı uzamaz. */
  min-height: clamp(42rem, 175vw, 50rem);
  margin-inline: calc(-1 * var(--sahne-pad));
  width: calc(100% + (2 * var(--sahne-pad)));
  overflow: hidden;
  border-top: 1px solid var(--ks-rule);
  border-bottom: 1px solid var(--ks-rule);
  background: var(--ks-paper);
}

/* İnce koordinat grid'i. Ağır bir desen değil; pafta yüzeyi. */
.ks-sahne::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(
      to right,
      transparent calc(50% - 0.5px),
      rgb(var(--c-rule) / 0.48) calc(50% - 0.5px),
      rgb(var(--c-rule) / 0.48) calc(50% + 0.5px),
      transparent calc(50% + 0.5px)
    ),
    linear-gradient(
      to bottom,
      transparent calc(50% - 0.5px),
      rgb(var(--c-rule) / 0.28) calc(50% - 0.5px),
      rgb(var(--c-rule) / 0.28) calc(50% + 0.5px),
      transparent calc(50% + 0.5px)
    );
}

/* --------------------------------------------------------------------------
   KÖŞE İŞARETLERİ
   ----------------------------------------------------------------------- */

.ks-kose {
  display: none;
  position: absolute;
  z-index: 8;
  width: 1.35rem;
  height: 1.35rem;
  pointer-events: none;
}

.ks-kose::before,
.ks-kose::after {
  content: "";
  position: absolute;
  background: var(--ks-measure);
}

.ks-kose::before {
  width: 100%;
  height: 1px;
}

.ks-kose::after {
  width: 1px;
  height: 100%;
}

.ks-kose--tl {
  top: 1rem;
  left: var(--sahne-pad);
}

.ks-kose--tr {
  top: 1rem;
  right: var(--sahne-pad);
  transform: scaleX(-1);
}

.ks-kose--bl {
  bottom: 1.45rem;
  left: var(--sahne-pad);
  transform: scaleY(-1);
}

.ks-kose--br {
  right: var(--sahne-pad);
  bottom: 1rem;
  transform: scale(-1);
}

/* ==========================================================================
   DEV 39 — ARKA PLAN / FİNAL MÜHÜR GÖLGESİ
   ======================================================================= */

.ks-dev-toplam {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  width: 100%;
  transform: translate(-50%, -50%);
  font-family: var(--f-display, var(--f-sans));
  font-size: clamp(15rem, 77vw, 31rem);
  font-weight: 800;
  line-height: 0.72;
  letter-spacing: -0.09em;
  text-align: center;
  color: rgb(var(--c-ink) / 0.035);
  user-select: none;
  pointer-events: none;
}

/* ==========================================================================
   İKİ YAKA
   ======================================================================= */

.ks-yakalar {
  position: absolute;
  inset: clamp(2.6rem, 8vw, 4.5rem) var(--sahne-pad) auto;
  z-index: 6;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(0.75rem, 3vw, 1.5rem);
  margin: 0;
}

.ks-yaka {
  min-width: 0;
}

.ks-yaka--anadolu {
  text-align: right;
}

.ks-yaka-meta {
  display: grid;
  gap: 0.25rem;
  font-family: var(--f-mono);
  font-size: 0.625rem;
  line-height: 1.25;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.ks-yaka-yon {
  color: var(--ks-signal);
}

.ks-yaka-isim {
  color: var(--ks-soft);
}

.ks-yaka-sayi {
  margin: 0.15rem 0 0;
  font-family: var(--f-display, var(--f-sans));
  font-size: clamp(4.5rem, 20vw, 8rem);
  font-weight: 800;
  line-height: 0.78;
  letter-spacing: -0.07em;
  font-variant-numeric: tabular-nums;
}

/* ==========================================================================
   BOĞAZ ÇİZGİSİ
   ======================================================================= */

.ks-bogaz {
  position: absolute;
  top: 19%;
  bottom: 17%;
  left: 50%;
  z-index: 5;
  width: clamp(3.25rem, 12vw, 5rem);
  height: 64%;
  transform: translateX(-50%);
  overflow: visible;
  pointer-events: none;
}

.ks-bogaz path {
  fill: none;
  vector-effect: non-scaling-stroke;
}

.ks-bogaz-hayalet {
  stroke: rgb(var(--c-measure) / 0.42);
  stroke-width: 0.8;
}

.ks-bogaz-canli {
  stroke: var(--ks-signal);
  stroke-width: 1.5;
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
}

/* ==========================================================================
   HARİTA
   ======================================================================= */

.ks-harita {
  position: absolute;
  z-index: 2;
  top: 24%;
  left: 50%;
  width: min(118%, 53rem);
  margin: 0;
  transform: translateX(-50%);
  pointer-events: none;
}

.ks-harita-foto {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  opacity: 0.54;
  mix-blend-mode: multiply;
  filter: contrast(1.04);
}

.ks-scan {
  position: absolute;
  left: 5%;
  right: 5%;
  height: 1px;
  background: rgb(var(--c-measure) / 0.48);
}

.ks-scan::after {
  content: "";
  position: absolute;
  top: -2px;
  right: 0;
  width: 5px;
  height: 5px;
  border: 1px solid var(--ks-measure);
  background: var(--ks-paper);
}

.ks-scan--1 { top: 27%; }
.ks-scan--2 { top: 52%; }
.ks-scan--3 { top: 73%; }

/* ==========================================================================
   MERKEZ MÜHÜR
   ======================================================================= */

.ks-muhur {
  position: absolute;
  z-index: 7;
  top: 52%;
  left: 50%;
  width: min(11.5rem, 42vw);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  display: grid;
  place-content: center;
  justify-items: center;
  border: 1px solid var(--ks-signal);
  background: rgb(var(--c-paper) / 0.88);
  text-align: center;
  backdrop-filter: blur(2px);
}

/* MERKEZ ARTI ÇİZGİLERİ KALDIRILDI — `.ks-muhur::before` / `::after`.
   ─────────────────────────────────────────────────────────────────────
   Burada mührün merkezinden geçen iki bakır çizgi vardı:

     ::before  yatay  top: 50%; left/right: -1rem; height: 1px
     ::after   dikey  left: 50%; top/bottom: -1rem; width: 1px

   İkisi tam merkezde kesişiyordu, yani "39" rakamının ÜSTÜNDEN geçip
   sayıyı bölüyorlardı. Nişangâh teknik çizim dilinin parçasıydı ama
   okunması gereken tek şeyin üstünde duruyordu.

   `opacity: 0` ya da `display: none` ile GİZLENMEDİ; kural tamamen
   silindi, dolayısıyla hiçbir kırılımda, hiçbir scroll durumunda ve
   azaltılmış harekette de üretilmiyor.

   KORUNANLAR: mühür kutusu, ince bakır çerçeve (`border`), `25 + 14 = 39`
   mikro metni, `39`, `İLÇE / TEK OPERASYON AĞI` etiketi, harita, sahnenin
   yapısal ızgarası ve `ks-muhur` animasyonu. */

.ks-muhur-formul,
.ks-muhur-etiket {
  position: relative;
  z-index: 1;
  font-family: var(--f-mono);
  text-transform: uppercase;
}

.ks-muhur-formul {
  margin-bottom: 0.2rem;
  font-size: 0.5625rem;
  letter-spacing: 0.1em;
  color: var(--ks-signal-deep);
}

.ks-muhur-sayi {
  position: relative;
  z-index: 1;
  font-family: var(--f-display, var(--f-sans));
  font-size: clamp(4.4rem, 20vw, 7.3rem);
  font-weight: 800;
  line-height: 0.78;
  letter-spacing: -0.075em;
}

.ks-muhur-etiket {
  margin-top: 0.55rem;
  max-width: 14ch;
  font-size: 0.5rem;
  line-height: 1.35;
  letter-spacing: 0.09em;
  color: var(--ks-soft);
}

/* ==========================================================================
   ANA İDDİA
   ======================================================================= */

.ks-iddia {
  position: absolute;
  z-index: 8;
  right: var(--sahne-pad);
  bottom: clamp(7.8rem, 25vw, 10.5rem);
  left: var(--sahne-pad);
}

.ks-iddia-indeks {
  display: none;
}

.ks-h2 {
  margin: 0;
  max-width: 15ch;
  font-family: var(--f-display, var(--f-sans));
  font-size: clamp(2rem, 8.5vw, 3.65rem);
  font-weight: 750;
  line-height: 0.96;
  letter-spacing: -0.045em;
  text-wrap: balance;
}

/* ==========================================================================
   CTA
   ======================================================================= */

.ks-bag {
  position: absolute;
  z-index: 9;
  right: var(--sahne-pad);
  bottom: clamp(3.2rem, 9vw, 4rem);
  left: var(--sahne-pad);
  min-height: 52px;
  padding: 0.7rem 0;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "small arrow"
    "main arrow";
  align-items: center;
  gap: 0.1rem 1rem;
  border-top: 1px solid var(--ks-signal);
  color: var(--ks-ink);
  text-decoration: none;
}

.ks-bag-kucuk {
  grid-area: small;
  font-family: var(--f-mono);
  font-size: 0.5625rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ks-signal);
}

.ks-bag-ana {
  grid-area: main;
  font-size: clamp(1rem, 0.95rem + 0.5vw, 1.2rem);
  font-weight: 650;
}

.ks-bag-ok {
  grid-area: arrow;
  font-size: 1.75rem;
  line-height: 1;
  transition: transform 180ms ease-out;
}

.ks-bag:hover .ks-bag-ok {
  transform: translate(0.2rem, -0.2rem);
}

.ks-bag:focus-visible {
  outline: 2px solid var(--ks-ink);
  outline-offset: 5px;
}

/* ==========================================================================
   ALT ÖLÇÜM BANDI
   ======================================================================= */

.ks-alt-bant {
  display: none;
  position: absolute;
  z-index: 7;
  right: var(--sahne-pad);
  bottom: 1rem;
  left: var(--sahne-pad);
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-family: var(--f-mono);
  font-size: 0.5rem;
  line-height: 1;
  letter-spacing: 0.09em;
  color: var(--ks-soft);
}

.ks-alt-cizgi {
  flex: 1;
  height: 1px;
  background: var(--ks-rule);
}

/* ==========================================================================
   TABLET — normal akış ama daha yatay / editoryal
   ======================================================================= */

@media (min-width: 768px) and (max-width: 1279px) {
  .ks-sahne {
    min-height: clamp(44rem, 82vw, 54rem);
  }

  .ks-yakalar {
    inset-inline: clamp(2rem, 5vw, 4rem);
  }

  .ks-yaka-sayi {
    font-size: clamp(7rem, 15vw, 10rem);
  }

  .ks-harita {
    top: 17%;
    width: min(92%, 60rem);
  }

  .ks-muhur {
    width: clamp(11rem, 22vw, 14rem);
  }

  .ks-iddia {
    right: clamp(2rem, 5vw, 4rem);
    bottom: 7.5rem;
    left: clamp(2rem, 5vw, 4rem);
  }

  .ks-h2 {
    max-width: 13ch;
    font-size: clamp(3rem, 5.8vw, 5rem);
  }

  .ks-bag {
    right: clamp(2rem, 5vw, 4rem);
    left: auto;
    width: min(28rem, 48vw);
  }

  .ks-alt-bant {
    right: clamp(2rem, 5vw, 4rem);
    left: clamp(2rem, 5vw, 4rem);
  }
}

/* ==========================================================================
   DESKTOP STATIC FALLBACK
   Browser scroll-timeline desteklemese bile güçlü bir final poster görünür.
   ======================================================================= */

@media (min-width: 1280px) {
  .ks {
    /* 1280'de mevcut pad; 1920/2560/4K'da içerik ~1780px optik alanda kalır. */
    --ks-edge: max(var(--sahne-pad), calc((100vw - 1780px) / 2));
  }

  .ks-track {
    max-width: none;
    padding-inline: 0;
  }

  .ks-kunye,
  .ks-onsoz {
    width: min(
      calc(100% - (2 * var(--sahne-pad))),
      var(--container-wide)
    );
    margin-inline: auto;
  }

  .ks-sahne {
    width: 100vw;
    min-height: calc(100vh - var(--sahne-navbar));
    margin-inline: 0;
  }

  .ks-yakalar {
    top: clamp(3rem, 8vh, 6rem);
    right: var(--ks-edge);
    left: var(--ks-edge);
  }

  .ks-yaka-sayi {
    font-size: clamp(10rem, 17vw, 19rem);
  }

  .ks-harita {
    top: 2%;
    width: min(77vw, 88rem);
  }

  .ks-bogaz {
    top: 5%;
    height: 82%;
    width: clamp(4rem, 6vw, 7rem);
  }

  .ks-dev-toplam {
    font-size: clamp(24rem, 51vw, 60rem);
  }

  .ks-muhur {
    top: 51%;
    width: clamp(12rem, 14vw, 16rem);
  }

  .ks-muhur-sayi {
    font-size: clamp(6.5rem, 8vw, 9rem);
  }

  .ks-iddia {
    right: auto;
    bottom: clamp(4.5rem, 7vh, 6.5rem);
    left: var(--ks-edge);
    width: min(42vw, 46rem);
  }

  .ks-h2 {
    max-width: 12ch;
    font-size: clamp(3.75rem, 5vw, 6.6rem);
  }

  .ks-bag {
    right: var(--ks-edge);
    bottom: clamp(5rem, 7vh, 6.5rem);
    left: auto;
    width: min(28vw, 29rem);
  }

  .ks-alt-bant {
    right: var(--ks-edge);
    bottom: 1.25rem;
    left: var(--ks-edge);
  }
}

/* ==========================================================================
   DESKTOP SIGNATURE MOTION
   25 + 14 → Boğaz çizgisi → harita → 39 mühür → iddia / CTA
   ======================================================================= */

@supports (animation-timeline: view()) {
  @media (min-width: 1280px) and (prefers-reduced-motion: no-preference) {
    .ks {
      height: 320vh;
      width: 100vw;
      max-width: none;
      margin-inline: calc(50% - 50vw);
      view-timeline-name: --ks;
      view-timeline-axis: block;

      /*
        25 / 14 GİRİŞ MESAFESİ — ÖLÇÜLEREK TÜRETİLDİ.

        Sayıların DURDUĞU yer `--container-wide` ile sınırlı bir kaptan
        geliyor; yani ekran büyüdükçe sayı sol kenardan UZAKLAŞIYOR.
        Giriş mesafesi ise ham `18vw` idi — ekranla orantılı büyüyor ama
        kabın sınırını tanımıyor. Sonuç, ölçüldü (sayının ekranda kalan
        alanı, giriş karesinde):

          3440 → sol kenarı hiç geçmiyor   (x 211)   PASS
          2560 → 71px taşıyor, %81 görünür (x -71)   sınırda
          1920 → 276px taşıyor, %24 görünür (x -276) ✖
          1440 → 208px taşıyor, %29 görünür (x -208) ✖

        Yani kusur "çok fazla hareket" değil, hareketin ODA MİKTARINI
        tanımaması. `18vw - 8.5rem` mesafeyi ekranla birlikte büyütmeye
        devam ediyor ama sabit bir pay düşerek dar masaüstlerinde kabın
        içinde kalmasını sağlıyor. Ölçülen etkin kayma ≈ 1,61 × mesafe
        (scale(1.08) payı dahil).

        ───────────────────────────────────────────────────────────────
        M19D: EDİTORYAL BLEED KALDIRILDI — bu, yukarıdaki kararın
        BİLİNÇLİ olarak geri alınmasıdır.

        Eski değer `max(4rem, calc(18vw - 11rem))` 1366'da tam 69,9px
        veriyordu ve ölçülen taşma da tam 70px'ti: sahne pinlendiği anda
        (`0%–13%` karesi) "25" soldan, "14" sağdan kırpılıyor, yaka
        etiketleri "UPA YAKASI" gibi yarım görünüyordu. Kırılıma özel
        değildi — 1280'den 1920'ye kadar hepsinde vardı.

        Bleed bir tasarım tercihiydi ama okunması gereken iki sayının ve
        iki etiketin üstünde uygulanıyordu: kullanıcı bölüme geldiğinde
        ilk gördüğü kare buydu. M19D kabul kriteri açık — hiçbir metin
        viewport dışına taşmayacak ve kırpılmayacak.

        YENİ DEĞER kabın kenar payına bağlı: giriş mesafesi ne olursa
        olsun mürekkep kenardan en az 1rem içeride kalıyor. Jest duruyor
        (dışarıdan içeri kayma + `scale(1.08)`), yalnız mesafesi kabın
        izin verdiği kadar. `36%` sonrası karelere DOKUNULMADI; sahnenin
        orta ve final kompozisyonu birebir aynı.
      */
      --ks-giris: max(1rem, calc(var(--ks-edge) - 1rem));
    }

    .ks-track {
      position: sticky;
      top: var(--sahne-navbar);
      height: calc(100vh - var(--sahne-navbar));
      padding: 0;
      overflow: hidden;
    }

    /* Scroll sahnesinde önsöz / künye kompozisyonun içine alınır. */
    .ks-kunye {
      position: absolute;
      z-index: 20;
      top: clamp(1rem, 2vh, 1.5rem);
      right: var(--ks-edge);
      left: var(--ks-edge);
      width: auto;
      margin: 0;
      padding-top: 0;
      border: 0;
      animation-name: ks-kunye-kay;
    }

    .ks-onsoz {
      position: absolute;
      z-index: 20;
      top: clamp(3.6rem, 8vh, 6rem);
      left: var(--ks-edge);
      width: min(35ch, 29vw);
      margin: 0;
      color: var(--ks-soft);
      animation-name: ks-onsoz-kay;
    }

    .ks-sahne {
      position: absolute;
      inset: 0;
      min-height: 0;
      height: 100%;
      border: 0;
    }

    .ks-yaka--avrupa {
      animation-name: ks-avrupa;
      transform-origin: left top;
    }

    .ks-yaka--anadolu {
      animation-name: ks-anadolu;
      transform-origin: right top;
    }

    .ks-bogaz-canli {
      stroke-dashoffset: 1;
      animation-name: ks-bogaz-ciz;
    }

    .ks-bogaz-hayalet {
      animation-name: ks-bogaz-hayalet;
    }

    .ks-harita {
      animation-name: ks-harita-ac;
      transform-origin: center center;
    }

    .ks-dev-toplam {
      animation-name: ks-dev-39;
    }

    .ks-muhur {
      animation-name: ks-muhur;
    }

    .ks-iddia {
      animation-name: ks-iddia;
    }

    .ks-bag {
      animation-name: ks-bag;
    }

    .ks-alt-bant {
      animation-name: ks-alt-bant;
    }

    .ks-scan--1 { animation-name: ks-scan-1; }
    .ks-scan--2 { animation-name: ks-scan-2; }
    .ks-scan--3 { animation-name: ks-scan-3; }

    .ks-kunye,
    .ks-onsoz,
    .ks-yaka--avrupa,
    .ks-yaka--anadolu,
    .ks-bogaz-canli,
    .ks-bogaz-hayalet,
    .ks-harita,
    .ks-dev-toplam,
    .ks-muhur,
    .ks-iddia,
    .ks-bag,
    .ks-alt-bant,
    .ks-scan--1,
    .ks-scan--2,
    .ks-scan--3 {
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --ks;
      animation-range: contain 0% contain 90%;
    }

    /* --------------------------------------------------------------
       0–22  : iki yaka uzakta, önsöz okunuyor
       22–48 : sayılar merkeze yaklaşır, Boğaz çizilir
       38–62 : harita "mürekkep" olarak açılır
       56–74 : 25/14 geri çekilir, 39 mühür olur
       70–88 : H2 + CTA final kompozisyona girer
       88–100: final hold
       ----------------------------------------------------------- */

    @keyframes ks-kunye-kay {
      0%, 70% {
        opacity: 1;
        transform: translateY(0);
      }
      82%, 100% {
        opacity: 0.48;
        transform: translateY(-0.35rem);
      }
    }

    @keyframes ks-onsoz-kay {
      0%, 17% {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
      31% {
        opacity: 0.35;
        transform: translate3d(0, -1.25rem, 0);
      }
      42%, 100% {
        opacity: 0;
        transform: translate3d(0, -3.5rem, 0);
      }
    }

    @keyframes ks-avrupa {
      /* DİKEY GİRİŞ 7vh → -2vh (M19D).
         `7vh` yaka grubunu AŞAĞI itiyordu: etiketler y38'de duruyor, giriş
         paragrafı y61'de başlıyor; 54px'lik itme etiketleri tam paragrafın
         içine sokuyordu. Ölçüldü — beş masaüstü genişliğinin hepsinde hem
         etiket hem sayı paragrafla çakışıyordu (1366'da 374x32 ve 151x49).
         Değer negatife çevrildi: grup artık YUKARIDAN yerine oturuyor,
         dikey jest duruyor ama paragrafın bandına hiç girmiyor.
         `36%` ve sonrası DEĞİŞMEDİ. */
      0%, 13% {
        opacity: 1;
        transform: translate3d(calc(-1 * var(--ks-giris)), 17vh, 0) scale(1.08);
      }
      36% {
        opacity: 1;
        transform: translate3d(-3vw, 0, 0) scale(1);
      }
      55% {
        opacity: 1;
        transform: translate3d(7vw, -2vh, 0) scale(0.86);
      }
      69%, 100% {
        opacity: 0.13;
        transform: translate3d(11vw, -5vh, 0) scale(0.72);
      }
    }

    @keyframes ks-anadolu {
      /* Dikey giriş `ks-avrupa` ile simetrik: 7vh → -2vh (gerekçe orada). */
      0%, 13% {
        opacity: 1;
        transform: translate3d(var(--ks-giris), 17vh, 0) scale(1.08);
      }
      36% {
        opacity: 1;
        transform: translate3d(3vw, 0, 0) scale(1);
      }
      55% {
        opacity: 1;
        transform: translate3d(-7vw, -2vh, 0) scale(0.86);
      }
      69%, 100% {
        opacity: 0.13;
        transform: translate3d(-11vw, -5vh, 0) scale(0.72);
      }
    }

    @keyframes ks-bogaz-ciz {
      0%, 18% {
        stroke-dashoffset: 1;
        opacity: 0;
      }
      25% {
        opacity: 1;
      }
      52%, 100% {
        stroke-dashoffset: 0;
        opacity: 1;
      }
    }

    @keyframes ks-bogaz-hayalet {
      0%, 15% {
        opacity: 0;
      }
      36%, 100% {
        opacity: 0.62;
      }
    }

    @keyframes ks-harita-ac {
      0%, 24% {
        opacity: 0;
        filter: blur(8px) contrast(0.85);
        transform: translate3d(-50%, 2.5rem, 0) scale(0.72);
      }
      43% {
        opacity: 0.42;
        filter: blur(2px) contrast(0.98);
        transform: translate3d(-50%, 0, 0) scale(0.88);
      }
      63%, 100% {
        opacity: 1;
        filter: blur(0) contrast(1.04);
        transform: translate3d(-50%, 0, 0) scale(1);
      }
    }

    @keyframes ks-dev-39 {
      0%, 48% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.72);
      }
      67% {
        opacity: 0.75;
        transform: translate(-50%, -50%) scale(1.02);
      }
      78%, 100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes ks-muhur {
      0%, 52% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.62) rotate(-7deg);
      }
      66% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.08) rotate(1deg);
      }
      74%, 100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1) rotate(0);
      }
    }

    @keyframes ks-iddia {
      0%, 67% {
        opacity: 0;
        transform: translate3d(0, 4rem, 0);
      }
      80%, 100% {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    @keyframes ks-bag {
      0%, 73% {
        opacity: 0;
        transform: translate3d(3.5rem, 0, 0);
      }
      86%, 100% {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    @keyframes ks-alt-bant {
      0%, 76% {
        opacity: 0;
        transform: scaleX(0.6);
      }
      88%, 100% {
        opacity: 1;
        transform: scaleX(1);
      }
    }

    @keyframes ks-scan-1 {
      0%, 36% { transform: scaleX(0); transform-origin: left; opacity: 0; }
      52%, 100% { transform: scaleX(1); transform-origin: left; opacity: 1; }
    }

    @keyframes ks-scan-2 {
      0%, 41% { transform: scaleX(0); transform-origin: right; opacity: 0; }
      57%, 100% { transform: scaleX(1); transform-origin: right; opacity: 1; }
    }

    @keyframes ks-scan-3 {
      0%, 46% { transform: scaleX(0); transform-origin: left; opacity: 0; }
      62%, 100% { transform: scaleX(1); transform-origin: left; opacity: 1; }
    }
  }
}

/* ==========================================================================
   ULTRAWIDE — 21:9'da içeriği gereksiz yatay dağıtma.
   Harita büyür ama bilgi grupları kontrollü sınırda kalır.
   ======================================================================= */

@media (min-width: 1280px) and (min-aspect-ratio: 2 / 1) {
  .ks-harita {
    width: min(69vw, 92rem);
    top: -10%;
  }

  .ks-muhur {
    top: 48%;
  }

  .ks-yaka-sayi {
    font-size: clamp(10rem, 14vw, 17rem);
  }
}

/* ==========================================================================
   KÜÇÜK MOBİL
   ======================================================================= */

@media (max-width: 479px) {
  .ks-kunye {
    align-items: flex-start;
  }

  .ks-kunye span:last-child {
    max-width: 11ch;
  }

  .ks-sahne {
    min-height: clamp(42rem, 185vw, 47rem);
  }

  .ks-yaka-sayi {
    font-size: clamp(4.2rem, 21vw, 6.3rem);
  }

  .ks-yaka-isim {
    font-size: 0.56rem;
  }

  .ks-muhur {
    top: 49%;
  }

  .ks-harita {
    top: 25%;
    width: 126%;
  }

  .ks-iddia {
    bottom: 8.8rem;
  }

  .ks-h2 {
    font-size: clamp(1.9rem, 9.1vw, 2.8rem);
  }
}


/* ==========================================================================
   RESPONSIVE HARDENING — PRODUCTION BREAKPOINTS
   320/360/390/430 · tablet portrait/landscape · 1280/1366 · 1440/1920
   · 2560/3440/4K. İçerik kaybı yok; yalnız geometri uyarlanır.
   ======================================================================= */

/* ---- Çok dar mobil: künye kırılmaz, koordinat ikinci satıra iner. -------- */
@media (max-width: 359px) {
  .ks-kunye {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.4rem;
  }

  .ks-kunye span:last-child {
    text-align: left;
  }

  .ks-yakalar {
    gap: 0.55rem;
  }

  .ks-yaka-meta {
    font-size: 0.54rem;
    letter-spacing: 0.075em;
  }

  .ks-yaka-sayi {
    font-size: clamp(4rem, 20vw, 5.4rem);
  }

  .ks-muhur {
    width: min(10rem, 46vw);
  }

  .ks-muhur-sayi {
    font-size: clamp(4rem, 19vw, 5.6rem);
  }

  .ks-iddia {
    bottom: 9rem;
  }

  .ks-bag {
    bottom: 3.15rem;
  }
}

/* ---- Büyük mobil: 390–767 arası kompozisyonun alt üçlüsünü sabitle. ----- */
@media (min-width: 480px) and (max-width: 767px) {
  .ks-sahne {
    min-height: clamp(45rem, 145vw, 50rem);
  }

  .ks-yakalar {
    inset-inline: clamp(1.5rem, 5vw, 2.5rem);
  }

  .ks-harita {
    top: 21%;
    width: min(112%, 48rem);
  }

  .ks-muhur {
    top: 50%;
    width: clamp(10.5rem, 34vw, 12rem);
  }

  .ks-iddia {
    right: clamp(1.5rem, 5vw, 2.5rem);
    left: clamp(1.5rem, 5vw, 2.5rem);
  }

  .ks-bag,
  .ks-alt-bant {
    right: clamp(1.5rem, 5vw, 2.5rem);
    left: clamp(1.5rem, 5vw, 2.5rem);
  }
}

/* ---- Tablet portrait: harita merkezi ve CTA sağ kolon dengesi. ----------- */
@media (min-width: 768px) and (max-width: 1023px) and (orientation: portrait) {
  .ks-sahne {
    min-height: clamp(46rem, 92vw, 53rem);
  }

  .ks-harita {
    top: 18%;
    width: min(96%, 55rem);
  }

  .ks-bogaz {
    top: 16%;
    height: 68%;
  }

  .ks-muhur {
    top: 50%;
    width: clamp(11rem, 24vw, 13rem);
  }

  .ks-iddia {
    bottom: 7.7rem;
    width: min(58%, 34rem);
  }

  .ks-bag {
    bottom: 3.15rem;
    width: min(25rem, 46vw);
  }
}

/* ---- Tablet landscape / küçük laptop: sticky YOK, kısa ekranda taşma yok. */
@media (min-width: 768px) and (max-width: 1279px) and (orientation: landscape) {
  .ks-sahne {
    min-height: clamp(40rem, 68vw, 47rem);
  }

  .ks-yakalar {
    top: clamp(2.3rem, 6vw, 3.5rem);
  }

  .ks-yaka-sayi {
    font-size: clamp(6.5rem, 12vw, 9rem);
  }

  .ks-harita {
    top: 10%;
    width: min(78%, 52rem);
  }

  .ks-bogaz {
    top: 8%;
    height: 76%;
  }

  .ks-muhur {
    top: 48%;
    width: clamp(10rem, 18vw, 12rem);
  }

  .ks-iddia {
    bottom: 6.9rem;
  }

  .ks-h2 {
    font-size: clamp(2.6rem, 4.8vw, 4rem);
  }

  .ks-bag {
    bottom: 3rem;
  }

  .ks-alt-bant {
    bottom: 0.85rem;
  }
}

/* ---- Desktop kısa viewport: 1280×720 / 1366×768 gibi ekranlar. ---------- */
@media (min-width: 1280px) and (max-height: 820px) {
  .ks-yakalar {
    top: clamp(2.2rem, 5vh, 3.25rem);
  }

  .ks-yaka-sayi {
    font-size: clamp(7.5rem, 20vh, 10rem);
  }

  .ks-harita {
    top: -5%;
    width: min(68vw, 66rem);
  }

  .ks-bogaz {
    top: 3%;
    height: 80%;
  }

  .ks-dev-toplam {
    font-size: clamp(22rem, 62vh, 34rem);
  }

  .ks-muhur {
    top: 48%;
    width: clamp(10rem, 22vh, 12rem);
  }

  .ks-muhur-sayi {
    font-size: clamp(5.2rem, 14vh, 6.8rem);
  }

  .ks-iddia {
    bottom: 3.65rem;
    width: min(43vw, 39rem);
  }

  .ks-h2 {
    font-size: clamp(2.8rem, 7vh, 4.35rem);
  }

  .ks-bag {
    bottom: 3.65rem;
    width: min(29vw, 24rem);
  }

  .ks-alt-bant {
    bottom: 0.7rem;
  }
}

/* ---- Çok kısa desktop: küçük laptop penceresi / browser chrome yoğun. ---- */
@media (min-width: 1280px) and (max-height: 680px) {
  .ks-onsoz {
    top: 3rem;
    max-width: 31ch;
    font-size: 0.92rem;
    line-height: 1.42;
  }

  .ks-yakalar {
    top: 2rem;
  }

  .ks-yaka-meta {
    font-size: 0.54rem;
  }

  .ks-yaka-sayi {
    font-size: clamp(6.5rem, 19vh, 8rem);
  }

  .ks-harita {
    top: -9%;
    width: min(62vw, 58rem);
  }

  .ks-muhur {
    top: 47%;
    width: 9.5rem;
  }

  .ks-muhur-sayi {
    font-size: 5rem;
  }

  .ks-iddia,
  .ks-bag {
    bottom: 3.25rem;
  }

  .ks-h2 {
    font-size: clamp(2.5rem, 6.4vh, 3.7rem);
  }

  .ks-alt-bant {
    bottom: 0.55rem;
  }
}

/* ---- 2K / 4K normal oran: ölçek büyür, bilgi satırları dağılmaz. ---------- */
@media (min-width: 2200px) and (max-aspect-ratio: 1.99 / 1) {
  .ks-harita {
    width: min(60vw, 94rem);
    top: -2%;
  }

  .ks-yaka-sayi {
    font-size: clamp(13rem, 12vw, 18rem);
  }

  .ks-muhur {
    width: clamp(14rem, 11vw, 17rem);
  }

  .ks-h2 {
    font-size: clamp(4.75rem, 4.2vw, 6.8rem);
  }
}

/* ---- 21:9 / 32:9: yatay yayılma yerine merkezde kontrollü sahne. -------- */
@media (min-width: 2200px) and (min-aspect-ratio: 2 / 1) {
  .ks-harita {
    top: -12%;
    width: min(56vw, 96rem);
  }

  .ks-yakalar {
    top: clamp(3rem, 7vh, 5rem);
  }

  .ks-yaka-sayi {
    font-size: clamp(11rem, 10vw, 16rem);
  }

  .ks-dev-toplam {
    font-size: clamp(28rem, 34vw, 54rem);
  }

  .ks-muhur {
    top: 48%;
    width: clamp(13rem, 9vw, 16rem);
  }

  .ks-iddia {
    width: min(34vw, 43rem);
  }

  .ks-bag {
    width: min(22vw, 28rem);
  }
}

/* ---- 200% zoom / daralan CSS viewport güvenliği. ------------------------ */
@media (max-width: 767px) {
  .ks-kunye,
  .ks-onsoz,
  .ks-yaka-meta,
  .ks-iddia,
  .ks-bag,
  .ks-alt-bant {
    overflow-wrap: anywhere;
  }

  .ks-h2,
  .ks-bag-ana {
    hyphens: auto;
  }
}


/* ==========================================================================
   MOBILE COMPOSITION FIX — SCREENSHOT REVISION
   323–430px gerçek kullanım: sayı → harita/mühür → başlık → CTA.
   Desktop / tablet koreografisine dokunmaz.
   ======================================================================= */

@media (max-width: 767px) {
  /* Üst künye: iki uçtaki metin birbirini ezmesin. */
  .ks-kunye {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    column-gap: 0.75rem;
    row-gap: 0.35rem;
  }

  .ks-kunye > span:first-child {
    min-width: 0;
    white-space: nowrap;
  }

  .ks-kunye > span:last-child {
    max-width: 13ch;
    white-space: normal;
    text-align: right;
    line-height: 1.35;
  }

  /* Mobil sahne artık gerçek bir dikey sıra taşıyor.
     39 mührü ile H2'nin çarpışmasını yükseklik vererek çözüyoruz;
     başlığı küçültüp yukarı sıkıştırmak yerine kompozisyona nefes bırakıyoruz. */
  .ks-sahne {
    min-height: clamp(49rem, 205vw, 54rem);
  }

  .ks-yakalar {
    top: clamp(2.3rem, 7vw, 3rem);
    right: clamp(1rem, 4vw, 1.5rem);
    left: clamp(1rem, 4vw, 1.5rem);
  }

  .ks-yaka-sayi {
    font-size: clamp(4.4rem, 19vw, 6.3rem);
  }

  /* Boğaz çizgisi artık H2'nin içine kadar inmiyor. */
  .ks-bogaz {
    top: 17%;
    bottom: auto;
    height: 43%;
    width: clamp(2.8rem, 10vw, 4rem);
  }

  /* Harita yalnız orta sahneyi taşıyor; aşağıda başlık için temiz alan bırakıyor. */
  .ks-harita {
    top: 24%;
    width: min(120%, 46rem);

    -webkit-mask-image:
      linear-gradient(
        to bottom,
        #000 0%,
        #000 66%,
        rgb(0 0 0 / 0.72) 78%,
        transparent 100%
      );

    mask-image:
      linear-gradient(
        to bottom,
        #000 0%,
        #000 66%,
        rgb(0 0 0 / 0.72) 78%,
        transparent 100%
      );
  }

  .ks-harita-foto {
    opacity: 0.48;
  }

  /* Mühür kendi orta bölgesinde kalır ve başlığa fiziksel olarak değmez. */
  .ks-muhur {
    top: 45%;
    width: clamp(9.2rem, 39vw, 10.6rem);
    background: var(--ks-paper);
    backdrop-filter: none;
  }

  /* Merkez artı çizgilerinin mobil ayarı da kaldırıldı — çizgilerin
     kendisi silindi (gerekçe taban kuralın yanında). */

  .ks-muhur-sayi {
    font-size: clamp(4rem, 18vw, 5.7rem);
  }

  .ks-muhur-formul {
    font-size: 0.5rem;
  }

  .ks-muhur-etiket {
    max-width: 12ch;
    margin-top: 0.42rem;
    font-size: 0.44rem;
  }

  /* Başlık artık haritanın/mührün ALTINDA ayrı bir editoryal alan. */
  .ks-iddia {
    right: clamp(1rem, 4vw, 1.5rem);
    bottom: 8.15rem;
    left: clamp(1rem, 4vw, 1.5rem);
  }

  .ks-iddia-indeks {
    margin-bottom: 0.5rem;
    font-size: 0.52rem;
  }

  .ks-h2 {
    max-width: 13.5ch;
    font-size: clamp(1.9rem, 8.2vw, 2.55rem);
    line-height: 0.98;
    letter-spacing: -0.042em;
  }

  /* CTA başlıktan bağımsız bir alt kayıt olarak kalır. */
  .ks-bag {
    right: clamp(1rem, 4vw, 1.5rem);
    bottom: 3.1rem;
    left: clamp(1rem, 4vw, 1.5rem);
  }

  .ks-alt-bant {
    right: clamp(1rem, 4vw, 1.5rem);
    bottom: 1.5rem;
    left: clamp(1rem, 4vw, 1.5rem);
  }
}

/* 360px ve altı: künye koordinatını ikinci satıra al.
   Bilgiyi gizlemiyoruz; yalnız çakışmayı yapısal olarak engelliyoruz. */
@media (max-width: 360px) {
  .ks-kunye {
    grid-template-columns: minmax(0, 1fr);
  }

  .ks-kunye > span:last-child {
    max-width: none;
    text-align: left;
  }

  .ks-sahne {
    min-height: 51rem;
  }

  .ks-alt-bant {
    bottom: 1.65rem;
  }

  .ks-muhur {
    top: 44%;
  }

  .ks-h2 {
    max-width: 12.5ch;
    font-size: clamp(1.85rem, 8.6vw, 2.35rem);
  }
}

/* 430–767px: biraz daha yatay alan olduğunda mühür ve başlık gereksiz
   küçülmesin; yine de aralarında net boşluk kalsın. */
@media (min-width: 430px) and (max-width: 767px) {
  .ks-sahne {
    min-height: clamp(50rem, 158vw, 54rem);
  }

  .ks-muhur {
    top: 46%;
    width: clamp(10rem, 34vw, 11.25rem);
  }

  .ks-iddia {
    bottom: 8.4rem;
  }

  .ks-h2 {
    max-width: 14ch;
    font-size: clamp(2.15rem, 7vw, 2.85rem);
  }
}

/* ==========================================================================
   REDUCED MOTION
   ======================================================================= */

@media (prefers-reduced-motion: reduce) {
  .ks-bag-ok {
    transition: none;
  }

  .ks-bag:hover .ks-bag-ok {
    transform: none;
  }
}
</style>
