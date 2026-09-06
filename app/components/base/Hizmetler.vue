<script setup>
/**
 * CAPABILITY WALL — "BİR OPERASYON / ÇOK YETKİNLİK"
 * --------------------------------------------------------------------------
 * Hizmetler kart değil.
 * Hizmetler, taşımanın farklı noktalarda devreye giren operasyon yetenekleri.
 *
 * Önceki bölümler uzun scroll koreografileri taşıyor.
 * Burada bilinçli olarak YENİ bir sticky/pin sahne yok:
 * ritim hızlanıyor, kullanıcı seçim yapmaya başlıyor.
 *
 * Ana jest:
 * - tam genişlik hizmet satırları
 * - dev isim / asılı kayıt numarası
 * - satır hover/focus olduğunda "mürekkep baskı" yüzeyi soldan açılır
 * - açıklama kendi ekseninde yaklaşır
 * - sağdaki yön oku fiziksel olarak dışarı çıkar
 * - satırın arkasında hizmet adı büyük bir baskı izi olarak görünür
 *
 * Mobile/tablet:
 * - aynı tipografik sertlik
 * - hover gerektirmeyen okunabilir normal akış
 * - her satır minimum 48px etkileşim alanından çok daha büyük
 *
 * CMS / veri sözleşmesi korunur:
 * - bolum.heading
 * - hizmetler[].title
 * - hizmetler[].excerpt
 * - hizmetler[].slug
 *
 * Bütün satır tek bağlantıdır.
 * Ek JS / GSAP yok.
 */

const props = defineProps({
  bolum: { type: Object, required: true },
  hizmetler: { type: Array, required: true },
})

const satirlar = computed(() =>
  props.hizmetler.map((h, i) => ({
    no: String(i + 1).padStart(2, '0'),
    ad: h.title,
    acik: h.excerpt,
    yol: `/${h.slug}`,
    index: i,
  })),
)

const toplam = computed(() => satirlar.value.length)
</script>

<template>
  <section class="cw" aria-labelledby="hizmetler-baslik">
    <div class="cw-alan">
      <!-- ================================================================
           SECTION HEADER
           ================================================================ -->
      <header class="cw-head">
        <div class="cw-head-grid">
          <h2 id="hizmetler-baslik" class="cw-h2">
            {{ bolum.heading }}
          </h2>

          <p class="cw-manifesto" aria-hidden="true">
            BİR<br />
            OPERASYON
            <span>→</span>
            ÇOK<br />
            YETKİNLİK
          </p>
        </div>
      </header>

      <!-- ================================================================
           CAPABILITY INDEX
           ================================================================ -->
      <ul class="cw-liste" role="list">
        <li
          v-for="h in satirlar"
          :key="h.yol"
          class="cw-satir"
          :style="`--i:${h.index}; --count:${toplam}`"
          :data-name="h.ad"
        >
          <NuxtLink :to="h.yol" class="cw-link">
            <!-- kayıt rayı -->
            <span class="cw-no" aria-hidden="true">
              {{ h.no }}
            </span>

            <!-- ana hizmet adı -->
            <h3 class="cw-ad">
              {{ h.ad }}
            </h3>

            <!-- açıklama -->
            <p class="cw-acik">
              {{ h.acik }}
            </p>

            <!-- çıkış işareti -->
            <span class="cw-cikis" aria-hidden="true">
              <span class="cw-ok">↗</span>
            </span>

            <!-- mekanik tab çizgisi -->
            <span class="cw-ray" aria-hidden="true">
              <span></span>
            </span>
          </NuxtLink>
        </li>
      </ul>

    </div>
  </section>
</template>

<style scoped>
/* ==========================================================================
   CAPABILITY WALL
   ======================================================================= */

.cw {
  --cw-paper: rgb(var(--c-paper));
  --cw-paper-2: rgb(var(--c-paper-sunken));
  --cw-ink: rgb(var(--c-ink));
  --cw-soft: rgb(var(--c-ink-soft));
  --cw-rule: rgb(var(--c-rule));
  --cw-measure: rgb(var(--c-measure));
  --cw-signal: rgb(var(--c-signal));
  --cw-signal-deep: rgb(var(--c-signal-deep));

  position: relative;
  overflow: clip;
  background: var(--cw-paper);
  color: var(--cw-ink);
}

.cw-alan {
  max-width: var(--container-wide);
  margin: 0 auto;
  padding:
    var(--sahne-dikey-dar)
    var(--sahne-pad)
    var(--sahne-perde);
}

/* ==========================================================================
   HEADER
   ======================================================================= */

.cw-head {
  margin-bottom: clamp(2.2rem, 5vw, 5rem);
}


.cw-head-grid {
  margin-top: clamp(1.5rem, 3.5vw, 3.2rem);
  display: grid;
  gap: 2rem;
}

.cw-h2 {
  margin: 0;
  max-width: 11ch;
  font-family: var(--f-display, var(--f-sans));
  font-size: clamp(3.2rem, 13vw, 6.2rem);
  font-weight: 790;
  line-height: 0.88;
  letter-spacing: -0.065em;
  text-wrap: balance;
}

.cw-manifesto {
  display: none;
}

/* ==========================================================================
   LIST
   ======================================================================= */

.cw-liste {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--cw-measure);
}

.cw-satir {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-bottom: 1px solid var(--cw-rule);
}

/*
 * Arka baskı izi.
 * Kullanıcı satıra odaklandığında görünür.
 * Tekrar eden dekor değil: aktif hizmetin adını mekânsal olarak büyütüyor.
 */
.cw-satir::before {
  content: attr(data-name);
  position: absolute;
  z-index: -1;
  left: 50%;
  top: 50%;
  width: 130%;
  transform: translate(-48%, -48%) scale(0.96);
  font-family: var(--f-display, var(--f-sans));
  font-size: clamp(7rem, 25vw, 18rem);
  font-weight: 800;
  line-height: 0.72;
  letter-spacing: -0.08em;
  white-space: nowrap;
  color: rgb(var(--c-paper) / 0.055);
  opacity: 0;
  pointer-events: none;
  user-select: none;
  transition:
    opacity 240ms ease-out,
    transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

/*
 * Mürekkep yüzey.
 * width animasyonu yerine scaleX: layout yok, compositing dostu.
 */
.cw-satir::after {
  content: "";
  position: absolute;
  z-index: -2;
  inset: 0;
  background: var(--cw-ink);
  transform: scaleX(0);
  transform-origin: left center;
  transition:
    transform 460ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* ==========================================================================
   WHOLE-ROW LINK
   ======================================================================= */

.cw-link {
  position: relative;
  z-index: 2;
  min-height: clamp(8.2rem, 26vw, 11rem);
  padding:
    clamp(1.45rem, 4vw, 2.2rem)
    0
    clamp(1.35rem, 3.5vw, 2rem);

  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    "no title"
    ". desc"
    ". exit";
  column-gap: clamp(0.8rem, 3vw, 1.25rem);
  row-gap: 0.65rem;

  color: inherit;
  text-decoration: none;
  outline: none;

  transition:
    color 260ms ease-out;
}

/* ==========================================================================
   INDEX
   ======================================================================= */

.cw-no {
  grid-area: no;
  align-self: start;
  margin-top: 0.15em;
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  line-height: 1;
  letter-spacing: 0.11em;
  color: var(--cw-soft);
  transition:
    color 240ms ease-out,
    transform 380ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* ==========================================================================
   TITLE
   ======================================================================= */

.cw-ad {
  grid-area: title;
  min-width: 0;
  margin: 0;
  max-width: 17ch;

  font-family: var(--f-display, var(--f-sans));
  font-size: clamp(2rem, 8.8vw, 4.1rem);
  font-weight: 720;
  line-height: 0.9;
  letter-spacing: -0.052em;
  text-wrap: balance;

  transition:
    transform 440ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* ==========================================================================
   DESCRIPTION
   ======================================================================= */

.cw-acik {
  grid-area: desc;
  margin: 0;
  max-width: 50ch;

  font-size: clamp(0.9rem, 0.86rem + 0.2vw, 1rem);
  line-height: 1.52;
  color: var(--cw-soft);
  text-wrap: pretty;

  transition:
    color 260ms ease-out,
    transform 460ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* ==========================================================================
   EXIT
   ======================================================================= */

.cw-cikis {
  grid-area: exit;
  margin-top: 0.3rem;
  min-height: 2rem;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  border-top: 1px solid var(--cw-rule);
  padding-top: 0.55rem;

  transition:
    border-color 260ms ease-out,
    transform 460ms cubic-bezier(0.16, 1, 0.3, 1);
}

.cw-cikis-kod {
  font-family: var(--f-mono);
  font-size: 0.52rem;
  line-height: 1;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--cw-soft);
  transition: color 260ms ease-out;
}

.cw-ok {
  font-size: 1.5rem;
  line-height: 1;
  color: var(--cw-signal);
  transition:
    transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* ==========================================================================
   INTERNAL RAIL
   ======================================================================= */

.cw-ray {
  position: absolute;
  z-index: 3;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  pointer-events: none;
}

.cw-ray > span {
  display: block;
  width: 18%;
  height: 1px;
  background: var(--cw-signal);
  transform: scaleX(0);
  transform-origin: left center;
  transition:
    transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* ==========================================================================
   HOVER / KEYBOARD FOCUS
   ======================================================================= */

@media (hover: hover) and (pointer: fine) {
  .cw-satir:hover::before,
  .cw-satir:focus-within::before {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  .cw-satir:hover::after,
  .cw-satir:focus-within::after {
    transform: scaleX(1);
  }

  .cw-satir:hover .cw-link,
  .cw-satir:focus-within .cw-link {
    color: var(--cw-paper);
  }

  .cw-satir:hover .cw-no,
  .cw-satir:focus-within .cw-no {
    color: var(--cw-signal);
    transform: translateX(0.35rem);
  }

  .cw-satir:hover .cw-ad,
  .cw-satir:focus-within .cw-ad {
    transform: translateX(clamp(0.5rem, 1.2vw, 1rem));
  }

  .cw-satir:hover .cw-acik,
  .cw-satir:focus-within .cw-acik {
    color: rgb(var(--c-paper) / 0.72);
    transform: translateX(clamp(0.35rem, 0.8vw, 0.7rem));
  }

  .cw-satir:hover .cw-cikis,
  .cw-satir:focus-within .cw-cikis {
    border-color: rgb(var(--c-paper) / 0.22);
    transform: translateX(clamp(0.25rem, 0.5vw, 0.5rem));
  }

  .cw-satir:hover .cw-cikis-kod,
  .cw-satir:focus-within .cw-cikis-kod {
    color: rgb(var(--c-paper) / 0.62);
  }

  .cw-satir:hover .cw-ok,
  .cw-satir:focus-within .cw-ok {
    transform: translate(0.45rem, -0.45rem) scale(1.08);
  }

  .cw-satir:hover .cw-ray > span,
  .cw-satir:focus-within .cw-ray > span {
    transform: scaleX(5.6);
  }
}

.cw-link:focus-visible {
  outline: 2px solid var(--cw-signal);
  outline-offset: -4px;
}

/* ==========================================================================
   MOBILE / TOUCH — no hover dependency
   ======================================================================= */

@media (hover: none), (pointer: coarse) {
  .cw-cikis {
    border-color: var(--cw-measure);
  }

  .cw-ok {
    transform: translate(0.1rem, -0.1rem);
  }
}

/* ==========================================================================
   SCROLL ENTRY — subtle, meaningful
   Each register line prints into the ledger as it enters.
   No stagger timer; every row owns its own view timeline.
   ======================================================================= */

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .cw-satir {
      view-timeline-name: --cw-row;
      view-timeline-axis: block;
    }

    .cw-link {
      animation-name: cw-row-print;
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --cw-row;
      animation-range: entry 88% cover 72%;
    }

    .cw-no {
      animation-name: cw-no-print;
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --cw-row;
      animation-range: entry 91% cover 76%;
    }

    @keyframes cw-row-print {
      from {
        clip-path: inset(0 0 18% 0);
        transform: translateY(0.9rem);
      }

      to {
        clip-path: inset(0);
        transform: translateY(0);
      }
    }

    @keyframes cw-no-print {
      from {
        transform: translateX(-0.8rem);
      }

      to {
        transform: translateX(0);
      }
    }
  }
}

/* ==========================================================================
   TABLET
   ======================================================================= */

@media (min-width: 768px) {
  .cw-head-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: end;
  }

  .cw-h2 {
    grid-column: 1 / 9;
    max-width: 10ch;
    font-size: clamp(4.8rem, 9vw, 8rem);
  }

  .cw-manifesto {
    grid-column: 10 / 13;
    display: block;
    justify-self: end;
    margin: 0 0 0.3rem;
    font-family: var(--f-mono);
    font-size: 0.62rem;
    line-height: 1.45;
    letter-spacing: 0.1em;
    text-align: right;
    color: var(--cw-soft);
  }

  .cw-manifesto span {
    display: block;
    margin-block: 0.25rem;
    color: var(--cw-signal);
    font-size: 1rem;
  }

  .cw-link {
    min-height: clamp(9.5rem, 20vw, 13rem);
    grid-template-columns:
      minmax(3rem, 0.75fr)
      minmax(0, 6fr)
      minmax(0, 5fr);
    grid-template-areas:
      "no title desc"
      "no title exit";
    column-gap: clamp(1rem, 2vw, 2rem);
    row-gap: 0.65rem;
    align-items: start;
  }

  .cw-no {
    justify-self: end;
    margin-top: 0.4rem;
  }

  .cw-ad {
    align-self: center;
    max-width: 12ch;
    font-size: clamp(2.8rem, 5.4vw, 5.5rem);
  }

  .cw-acik {
    align-self: end;
    margin-top: 0.25rem;
    max-width: 43ch;
  }

  .cw-cikis {
    align-self: end;
    margin-top: 0;
  }
}

/* ==========================================================================
   DESKTOP
   ======================================================================= */

@media (min-width: 1024px) {
  .cw-alan {
    max-width: none;
    padding-inline: 0;
  }

  .cw-head,
  .cw-foot {
    width: min(
      calc(100% - (2 * var(--sahne-pad))),
      var(--container-wide)
    );
    margin-inline: auto;
  }

  .cw-liste {
    width: 100vw;
    margin-inline: calc(50% - 50vw);
  }

  .cw-link {
    width: min(
      calc(100% - (2 * var(--sahne-pad))),
      var(--container-wide)
    );
    margin-inline: auto;
    padding-block:
      clamp(1.65rem, 2.4vw, 2.6rem);

    grid-template-columns:
      minmax(3.4rem, 0.8fr)
      minmax(0, 6.4fr)
      minmax(0, 4.8fr)
      minmax(3.7rem, 0.8fr);

    grid-template-areas:
      "no title desc exit";
    align-items: center;
  }

  .cw-ad {
    font-size: clamp(3.1rem, 4.8vw, 6rem);
  }

  .cw-acik {
    align-self: center;
    margin: 0;
  }

  .cw-cikis {
    align-self: center;
    justify-self: stretch;
    margin: 0;
    padding: 0;
    border: 0;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.45rem;
  }

  .cw-cikis-kod {
    order: 2;
  }

  .cw-ok {
    order: 1;
    font-size: clamp(1.7rem, 2.4vw, 2.4rem);
  }

  .cw-satir::before {
    font-size: clamp(12rem, 19vw, 24rem);
  }
}

/* ==========================================================================
   LARGE / ULTRAWIDE
   ======================================================================= */

@media (min-width: 1800px) {
  .cw-link {
    width: min(
      calc(100% - (2 * max(var(--sahne-pad), calc((100vw - 1840px) / 2)))),
      1840px
    );
  }

  .cw-head,
  .cw-foot {
    width: min(
      calc(100% - (2 * max(var(--sahne-pad), calc((100vw - 1840px) / 2)))),
      1840px
    );
  }

  .cw-ad {
    font-size: clamp(4rem, 4.3vw, 6.8rem);
  }
}

/* ==========================================================================
   FOOT
   ======================================================================= */

.cw-foot {
  margin-top: clamp(1.25rem, 2vw, 2rem);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--f-mono);
  font-size: 0.5rem;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cw-soft);
}

.cw-foot-line {
  flex: 1;
  height: 1px;
  background: var(--cw-rule);
}

/* ==========================================================================
   REDUCED MOTION
   ======================================================================= */

@media (prefers-reduced-motion: reduce) {
  .cw-satir::before,
  .cw-satir::after,
  .cw-link,
  .cw-no,
  .cw-ad,
  .cw-acik,
  .cw-cikis,
  .cw-cikis-kod,
  .cw-ok,
  .cw-ray > span {
    transition: none;
  }
}
</style>
