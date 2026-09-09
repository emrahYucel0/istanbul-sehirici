<script setup>
/**
 * PRE-MOVE DIAGNOSTIC — "SORU DEĞİL, KARAR TARAMASI"
 * --------------------------------------------------------------------------
 * FAQ burada accordion değildir.
 * Kullanıcı taşınmadan önce belirsizliklerini sırayla çözer.
 *
 * Sol:
 * - İstanbul apartmanı teknik paftası
 * - erişim / lift / araç / rota geometrisi
 * - scroll boyunca ilerleyen tek bakır tarama düzlemi
 *
 * Sağ:
 * - bütün Q/A gerçek HTML'de, her zaman açık
 * - her satır kendi view-timeline'ında "çözülür"
 * - soru numarası, karar çizgisi ve küçük yön oku aktifleşir
 *
 * CMS sözleşmesi korunur:
 * - sorular.heading
 * - sorular.items[].question
 * - sorular.items[].answer
 *
 * Kart, accordion, gölge, radius, WebGL, GSAP yok.
 * Ek JS yok.
 */

const props = defineProps({
  sorular: { type: Object, required: true },
})

const liste = computed(() =>
  (props.sorular.items || []).map((s, i) => ({
    no: String(i + 1).padStart(2, '0'),
    soru: s.question,
    cevap: s.answer,
    index: i,
  })),
)

const toplam = computed(() => liste.value.length)
</script>

<template>
  <section class="pd" aria-labelledby="sorular-baslik">
    <div class="pd-alan">
      <!-- ================================================================
           HEADER
           ================================================================ -->
      <header class="pd-head">
        <div class="pd-kunye">
          <span>05 / TAŞINMADAN ÖNCE</span>
        </div>

        <h2 id="sorular-baslik" class="pd-h2">
          {{ sorular.heading }}
        </h2>
      </header>

      <!-- ================================================================
           LEFT / DIAGNOSTIC PLATE
           ================================================================ -->
      <aside class="pd-pafta" aria-label="Taşınma öncesi teknik değerlendirme görseli">
        <div class="pd-pafta-frame">
          <svg
            class="pd-svg"
            viewBox="0 0 620 700"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            focusable="false"
          >
            <!-- GRID -->
            <g class="pd-grid">
              <path d="M44 70H576M44 150H576M44 230H576M44 310H576M44 390H576M44 470H576M44 550H576M44 630H576" />
              <path d="M92 42V654M172 42V654M252 42V654M332 42V654M412 42V654M492 42V654" />
            </g>

            <!-- ZEMİN -->
            <g class="pd-ground">
              <path d="M96 520L310 652L526 524" />
              <path d="M120 494L310 612L500 498" />
              <path d="M158 548H474" />
            </g>

            <!-- ANA YAPI -->
            <g class="pd-building">
              <path d="M158 208L318 118L472 210L310 306Z" />
              <path d="M182 208L318 140L448 208L310 286Z" />
              <path d="M158 208L310 306L472 210" />

              <path d="M158 208V454L310 548V306" />
              <path d="M310 306V548L472 454V210" />

              <path d="M174 236L310 318L456 236" />
              <path d="M174 316L310 398L456 318" />
              <path d="M174 396L310 478L456 398" />

              <!-- windows left -->
              <path d="M198 252L244 279V334L198 307Z" />
              <path d="M260 288L294 307V362L260 343Z" />
              <path d="M198 350L244 377V432L198 405Z" />
              <path d="M260 386L294 405V460L260 441Z" />

              <!-- windows right -->
              <path d="M338 304L386 277V333L338 360Z" />
              <path d="M402 268L438 248V304L402 324Z" />
              <path d="M338 402L386 375V431L338 458Z" />
              <path d="M402 366L438 346V402L402 422Z" />

              <!-- entrance -->
              <path d="M276 454L310 474V542L276 522Z" />
              <path d="M266 524L310 552L362 524" />
            </g>

            <!-- ACCESS DATUM -->
            <g class="pd-access">
              <path d="M116 190V472" />
              <path d="M104 190H128M104 472H128" />
              <path d="M120 334H158" />

              <path d="M500 194V466" />
              <path d="M488 194H512M488 466H512" />

              <path d="M144 482H254" />
              <path d="M144 472V492M254 472V492" />
            </g>

            <!-- LIFT -->
            <g class="pd-lift">
              <path d="M536 224V444" />
              <path d="M522 224H550M522 444H550" />
              <rect x="527" y="272" width="18" height="104" />
              <path d="M536 244V268M536 380V420" />
              <path d="M518 324H554" />
            </g>

            <!-- VEHICLE -->
            <g class="pd-vehicle">
              <path d="M46 546H158L202 574H244V624H38V574H46Z" />
              <path d="M158 546V574H202" />
              <path d="M62 560H138" />
              <circle cx="92" cy="624" r="15" />
              <circle cx="196" cy="624" r="15" />
            </g>

            <!-- ROUTE -->
            <g class="pd-route">
              <path
                pathLength="1"
                d="M242 600C270 590 280 570 302 548C330 520 358 508 386 492C418 474 442 452 460 416"
              />
              <path d="M460 416l-13 3M460 416l-4 12" />
            </g>

            <!-- CHECK NODES -->
            <g class="pd-checks">
              <circle cx="121" cy="334" r="5" />
              <circle cx="536" cy="324" r="5" />
              <circle cx="202" cy="574" r="5" />
              <circle cx="386" cy="492" r="5" />
              <circle cx="310" cy="552" r="5" />
            </g>
          </svg>

          <!-- Scroll scan plane -->
          <div class="pd-scan" aria-hidden="true">
            <span class="pd-scan-line"></span>
          </div>

          <!-- right calibration -->
          <div class="pd-scale" aria-hidden="true">
            <span v-for="i in Math.max(toplam, 2)" :key="i"></span>
          </div>

        </div>
      </aside>

      <!-- ================================================================
           RIGHT / Q&A REGISTER
           ================================================================ -->
      <dl class="pd-list">
        <div
          v-for="s in liste"
          :key="s.soru"
          class="pd-row"
          :style="`--i:${s.index}; --count:${toplam}`"
        >
          <dt class="pd-question">
            <span class="pd-no" aria-hidden="true">{{ s.no }}</span>
            <span class="pd-question-text">{{ s.soru }}</span>
            <span class="pd-question-arrow" aria-hidden="true">↘</span>
          </dt>

          <dd class="pd-answer">
            {{ s.cevap }}
          </dd>

          <span class="pd-resolve" aria-hidden="true">
            <span></span>
          </span>
        </div>
      </dl>

      <!-- ================================================================
           CLOSE
           ================================================================ -->
      <footer class="pd-close">
        <span class="pd-close-kicker">BELİRSİZLİK AZALDIKÇA PLAN NETLEŞİR.</span>
        <span class="pd-close-line"></span>
      </footer>
    </div>
  </section>
</template>

<style scoped>
/* ==========================================================================
   PRE-MOVE DIAGNOSTIC
   ======================================================================= */

.pd {
  --pd-paper: rgb(var(--c-paper));
  --pd-paper-2: rgb(var(--c-paper-sunken));
  --pd-ink: rgb(var(--c-ink));
  --pd-soft: rgb(var(--c-ink-soft));
  --pd-rule: rgb(var(--c-rule));
  --pd-measure: rgb(var(--c-measure));
  --pd-signal: rgb(var(--c-signal));
  --pd-signal-deep: rgb(var(--c-signal-deep));

  position: relative;
  overflow: clip;
  background: var(--pd-paper);
  color: var(--pd-ink);
}

.pd-alan {
  max-width: var(--container-wide);
  margin: 0 auto;
  padding:
    var(--sahne-dikey)
    var(--sahne-pad)
    var(--sahne-dikey-dar);
}

/* ==========================================================================
   HEADER
   ======================================================================= */

.pd-head {
  margin-bottom: clamp(2rem, 4vw, 4rem);
}

.pd-kunye {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--pd-rule);
  font-family: var(--f-mono);
  font-size: 0.625rem;
  line-height: 1.2;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--pd-soft);
}

.pd-kunye span:last-child {
  text-align: right;
}

.pd-h2 {
  margin: clamp(1.6rem, 3vw, 2.8rem) 0 0;
  max-width: 10ch;
  font-family: var(--f-display, var(--f-sans));
  font-size: clamp(3rem, 12vw, 6rem);
  font-weight: 790;
  line-height: 0.89;
  letter-spacing: -0.065em;
  text-wrap: balance;
}

/* ==========================================================================
   PLATE / MOBILE
   ======================================================================= */

.pd-pafta {
  min-width: 0;
}

.pd-pafta-frame {
  position: relative;
  width: min(100%, 36rem);
  margin: 0;
  aspect-ratio: 31 / 35;
  overflow: hidden;
  border-top: 1px solid var(--pd-rule);
  border-bottom: 1px solid var(--pd-rule);
}

.pd-pafta-top,
.pd-pafta-foot {
  position: absolute;
  z-index: 8;
  left: 0.7rem;
  right: 0.7rem;
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  font-family: var(--f-mono);
  font-size: 0.5rem;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pd-soft);
}

.pd-pafta-top {
  top: 0.7rem;
}

.pd-pafta-foot {
  bottom: 0.7rem;
}

.pd-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.pd-svg :is(path, rect, circle) {
  fill: none;
  vector-effect: non-scaling-stroke;
  stroke-linecap: square;
  stroke-linejoin: miter;
}

.pd-grid path {
  stroke: rgb(var(--c-rule) / 0.72);
  stroke-width: 0.65;
}

.pd-ground path {
  stroke: var(--pd-rule);
  stroke-width: 0.8;
}

.pd-building path {
  stroke: var(--pd-soft);
  stroke-width: 1.05;
}

.pd-access :is(path, rect),
.pd-lift :is(path, rect),
.pd-vehicle :is(path, circle) {
  stroke: var(--pd-measure);
  stroke-width: 0.9;
}

.pd-route path {
  stroke: var(--pd-signal);
  stroke-width: 1.35;
}

.pd-checks circle {
  fill: var(--pd-paper);
  stroke: var(--pd-signal);
  stroke-width: 1.2;
}

/* ==========================================================================
   SCAN
   ======================================================================= */

.pd-scan {
  position: absolute;
  z-index: 10;
  left: 4%;
  right: 4%;
  top: 14%;
  pointer-events: none;
}

.pd-scan-line {
  display: block;
  width: 100%;
  height: 1px;
  background: var(--pd-signal);
}

.pd-scan-line::before,
.pd-scan-line::after {
  content: "";
  position: absolute;
  top: -3px;
  width: 7px;
  height: 7px;
  border: 1px solid var(--pd-signal);
  background: var(--pd-paper);
}

.pd-scan-line::before {
  left: 0;
}

.pd-scan-line::after {
  right: 0;
}

.pd-scan-label {
  display: block;
  margin-top: 0.35rem;
  font-family: var(--f-mono);
  font-size: 0.48rem;
  letter-spacing: 0.08em;
  color: var(--pd-signal);
}

.pd-scale {
  position: absolute;
  z-index: 9;
  top: 14%;
  right: 0.55rem;
  bottom: 12%;
  width: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.pd-scale span {
  display: block;
  width: 100%;
  height: 1px;
  background: var(--pd-measure);
}

.pd-lock {
  position: absolute;
  z-index: 12;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(0.84);
  min-width: 8rem;
  padding: 0.65rem 0.8rem;
  background: var(--pd-paper);
  border: 1px solid var(--pd-signal);
  text-align: center;
  opacity: 0;
}

.pd-lock span,
.pd-lock strong {
  display: block;
  font-family: var(--f-mono);
  text-transform: uppercase;
}

.pd-lock span {
  font-size: 0.48rem;
  letter-spacing: 0.09em;
  color: var(--pd-soft);
}

.pd-lock strong {
  margin-top: 0.2rem;
  font-size: 0.72rem;
  letter-spacing: 0.11em;
  color: var(--pd-signal);
}

/* ==========================================================================
   Q/A LIST
   ======================================================================= */

.pd-list {
  margin: clamp(2.5rem, 5vw, 4.5rem) 0 0;
  padding: 0;
  border-top: 1px solid var(--pd-measure);
}

.pd-row {
  position: relative;
  padding:
    clamp(1.6rem, 4vw, 2.35rem)
    0
    clamp(1.8rem, 4.5vw, 2.6rem);
  border-bottom: 1px solid var(--pd-rule);
}

.pd-question {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: clamp(0.7rem, 2vw, 1.2rem);
  align-items: start;
}

.pd-no {
  margin-top: 0.3rem;
  font-family: var(--f-mono);
  font-size: 0.625rem;
  letter-spacing: 0.1em;
  color: var(--pd-soft);
}

.pd-question-text {
  max-width: 25ch;
  font-family: var(--f-display, var(--f-sans));
  font-size: clamp(1.35rem, 5.5vw, 2.2rem);
  font-weight: 650;
  line-height: 1.08;
  letter-spacing: -0.025em;
  text-wrap: balance;
}

.pd-question-arrow {
  color: var(--pd-signal);
  font-size: 1.1rem;
  line-height: 1;
}

.pd-answer {
  margin: 0.9rem 0 0;
  padding-left: calc(2.1rem + clamp(0.7rem, 2vw, 1.2rem));
  max-width: 62ch;
  font-size: clamp(0.9rem, 0.86rem + 0.18vw, 0.98rem);
  line-height: 1.65;
  color: var(--pd-soft);
  text-wrap: pretty;
}

.pd-resolve {
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 100%;
  height: 1px;
  pointer-events: none;
}

.pd-resolve > span {
  display: block;
  width: 100%;
  height: 1px;
  background: var(--pd-signal);
  transform: scaleX(0);
  transform-origin: left center;
}

/* ==========================================================================
   CLOSE
   ======================================================================= */

.pd-close {
  margin-top: clamp(1.5rem, 3vw, 2.5rem);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--f-mono);
  font-size: 0.5rem;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pd-soft);
}

.pd-close-line {
  flex: 1;
  height: 1px;
  background: var(--pd-rule);
}

.pd-close-code {
  white-space: nowrap;
}

/* ==========================================================================
   MOBILE MOTION
   ======================================================================= */

@supports (animation-timeline: view()) {
  @media (max-width: 1023px) and (prefers-reduced-motion: no-preference) {
    .pd-row {
      view-timeline-name: --pd-row;
      view-timeline-axis: block;
    }

    .pd-question,
    .pd-answer,
    .pd-resolve > span {
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --pd-row;
    }

    .pd-question {
      animation-name: pd-mobile-q;
      animation-range: entry 90% cover 40%;
    }

    .pd-answer {
      animation-name: pd-mobile-a;
      animation-range: entry 82% cover 44%;
    }

    .pd-resolve > span {
      animation-name: pd-mobile-line;
      animation-range: entry 82% cover 48%;
    }

    @keyframes pd-mobile-q {
      from {
        transform: translateY(0.8rem);
        clip-path: inset(0 0 20% 0);
      }
      to {
        transform: translateY(0);
        clip-path: inset(0);
      }
    }

    @keyframes pd-mobile-a {
      from {
        transform: translateY(0.6rem);
        clip-path: inset(0 0 18% 0);
      }
      to {
        transform: translateY(0);
        clip-path: inset(0);
      }
    }

    @keyframes pd-mobile-line {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }
  }
}

/* ==========================================================================
   DESKTOP
   ======================================================================= */

@media (min-width: 1024px) {
  .pd-alan {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }

  .pd-head {
    grid-column: 1 / 13;
  }

  .pd-h2 {
    max-width: 9ch;
    font-size: clamp(4rem, 5vw, 6.6rem);
  }

  .pd-pafta {
    grid-column: 1 / 6;
    position: sticky;
    top: calc(var(--sahne-navbar) + clamp(1rem, 2vh, 1.5rem));
    align-self: start;
  }

  .pd-pafta-frame {
    width: min(100%, 31rem);
  }

  .pd-list {
    grid-column: 6 / 13;
    margin: 0;
  }

  .pd-row {
    min-height: clamp(9rem, 13vh, 12rem);
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-content: center;
    padding:
      clamp(1.45rem, 2.1vw, 2.1rem)
      0;
  }

  .pd-question {
    grid-column: 1 / 4;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: start;
  }

  .pd-question-arrow {
    display: none;
  }

  .pd-question-text {
    max-width: none;
    font-size: clamp(1.4rem, 1.5vw, 2rem);
  }

  .pd-answer {
    grid-column: 4 / 8;
    margin: 0;
    padding-left: 0;
    align-self: start;
  }

  .pd-row::before {
    content: "";
    position: absolute;
    left: -1.2rem;
    top: 50%;
    width: 0.7rem;
    height: 1px;
    background: var(--pd-rule);
  }

  .pd-close {
    grid-column: 6 / 13;
  }
}

/* ==========================================================================
   DESKTOP SCROLL DIAGNOSTIC
   ======================================================================= */

@supports (animation-timeline: view()) {
  @media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
    .pd {
      view-timeline-name: --pd-section;
      view-timeline-axis: block;
    }

    /* whole-plate scan follows the FAQ section */
    .pd-scan {
      animation-name: pd-scan-move;
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --pd-section;
      animation-range: cover 12% cover 88%;
    }

    .pd-route path:first-child {
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      animation-name: pd-route-draw;
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --pd-section;
      animation-range: cover 22% cover 72%;
    }

    .pd-checks circle {
      transform-box: fill-box;
      transform-origin: center;
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --pd-section;
    }

    .pd-checks circle:nth-child(1) {
      animation-name: pd-check-1;
      animation-range: cover 14% cover 32%;
    }

    .pd-checks circle:nth-child(2) {
      animation-name: pd-check-2;
      animation-range: cover 28% cover 46%;
    }

    .pd-checks circle:nth-child(3) {
      animation-name: pd-check-3;
      animation-range: cover 42% cover 60%;
    }

    .pd-checks circle:nth-child(4) {
      animation-name: pd-check-4;
      animation-range: cover 56% cover 74%;
    }

    .pd-checks circle:nth-child(5) {
      animation-name: pd-check-5;
      animation-range: cover 70% cover 88%;
    }

    .pd-lock {
      animation-name: pd-lock-in;
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --pd-section;
      animation-range: cover 76% cover 94%;
    }

    /* each Q/A resolves on its own viewport time */
    .pd-row {
      view-timeline-name: --pd-row;
      view-timeline-axis: block;
    }

    .pd-no,
    .pd-question-text,
    .pd-answer,
    .pd-resolve > span {
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --pd-row;
    }

    /* REVEAL BİTİŞLERİ ÖNE ÇEKİLDİ (M19D) — başlangıçlar aynı.
       ─────────────────────────────────────────────────────────────────
       ÖLÇÜLEN SORUN (1440x900): son cevabın `clip-path`i ancak
       scrollY≈20950'de tam çözülüyordu. SSS bölümü y21457'de bitiyor,
       yani o anda görünümün altı 21850 — SONRAKİ BÖLÜM zaten ~390px
       içerideydi, ekranın %44'ü. Kullanıcı son maddeyi okumak için bir
       alt bölüme geçmek zorunda kalıyordu.

       Bitişler `cover 55/58/64/70` → `40/43/47/52`. Başlangıçlar
       (`entry 92/88/84/82`) ve keyframe'ler DEĞİŞMEDİ; kademe sırası da
       aynı, yani hareketin karakteri korunuyor. Değişen tek şey satırın
       çözülmeyi ne kadar erken bitirdiği. Mobil kademe de aynı oranda
       öne alındı (62/66/70 → 46/50/54). */
    .pd-no {
      animation-name: pd-no-resolve;
      animation-range: entry 92% cover 40%;
    }

    .pd-question-text {
      animation-name: pd-q-resolve;
      animation-range: entry 88% cover 43%;
    }

    .pd-answer {
      animation-name: pd-a-resolve;
      animation-range: entry 84% cover 47%;
    }

    .pd-resolve > span {
      animation-name: pd-line-resolve;
      animation-range: entry 82% cover 52%;
    }

    @keyframes pd-scan-move {
      0% {
        transform: translateY(0);
      }

      100% {
        transform: translateY(520%);
      }
    }

    @keyframes pd-route-draw {
      from { stroke-dashoffset: 1; }
      to   { stroke-dashoffset: 0; }
    }

    @keyframes pd-check-1 { from { transform: scale(0); } to { transform: scale(1); } }
    @keyframes pd-check-2 { from { transform: scale(0); } to { transform: scale(1); } }
    @keyframes pd-check-3 { from { transform: scale(0); } to { transform: scale(1); } }
    @keyframes pd-check-4 { from { transform: scale(0); } to { transform: scale(1); } }
    @keyframes pd-check-5 { from { transform: scale(0); } to { transform: scale(1); } }

    @keyframes pd-lock-in {
      0%, 45% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.78);
      }

      76% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.06);
      }

      100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes pd-no-resolve {
      from {
        color: var(--pd-soft);
        transform: translateX(-0.5rem);
      }

      to {
        color: var(--pd-signal);
        transform: translateX(0);
      }
    }

    @keyframes pd-q-resolve {
      from {
        transform: translateX(-0.6rem);
        clip-path: inset(0 8% 0 0);
      }

      to {
        transform: translateX(0);
        clip-path: inset(0);
      }
    }

    @keyframes pd-a-resolve {
      from {
        transform: translateX(0.8rem);
        clip-path: inset(0 0 0 8%);
      }

      to {
        transform: translateX(0);
        clip-path: inset(0);
      }
    }

    @keyframes pd-line-resolve {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }
  }
}

/* ==========================================================================
   MOBILE SIMPLIFICATION
   ======================================================================= */

@media (max-width: 767px) {
  .pd-grid,
  .pd-lift {
    display: none;
  }

  .pd-pafta-frame {
    width: min(100%, 24rem);
    aspect-ratio: 5 / 4;
  }

  .pd-svg {
    transform: scale(0.93) translateY(-5%);
    transform-origin: center top;
  }

  .pd-scan {
    top: 20%;
  }

  .pd-scale {
    top: 20%;
    bottom: 14%;
  }

  .pd-lock {
    display: none;
  }
}

/* ==========================================================================
   ULTRAWIDE
   ======================================================================= */

@media (min-width: 1800px) {
  .pd-alan {
    max-width: 1840px;
  }

  .pd-pafta-frame {
    width: min(100%, 34rem);
  }

  .pd-question-text {
    font-size: clamp(1.5rem, 1.4vw, 2.15rem);
  }
}

/* ==========================================================================
   REDUCED MOTION
   ======================================================================= */

@media (prefers-reduced-motion: reduce) {
  .pd-scan {
    top: 62%;
  }

  .pd-route path:first-child {
    stroke-dasharray: none;
    stroke-dashoffset: 0;
  }

  .pd-lock {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
