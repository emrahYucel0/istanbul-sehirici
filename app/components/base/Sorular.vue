<script setup>
/**
 * SORULAR — TEKNİK PAFTA / CONTINUOUS-LINE HİBRİDİ · FINAL POLISH
 *
 * AMAÇ
 * - FaqSection / FaqItem CMS sözleşmesini korur.
 * - Solda daha mimari ve ölçülebilir bir teknik pafta, sağda gerçek HTML Q/A.
 * - Teknik pafta bilgi taşımaz; sahte ölçü, sayı, label veya AI metni yoktur.
 * - Hareket yalnız mevcut bakır okuma imlecindedir.
 * - Başlık, soru ve cevaplar hareket etmez.
 * - Kart, gölge, radius, accordion, GSAP ve opacity animasyonu yoktur.
 *
 * NOT
 * Doğrulanabilir işletme süreçleri bu component'te hardcode edilmez.
 * Soru/cevap metinleri CMS'te düzenlenir.
 */

const props = defineProps({
  sorular: { type: Object, required: true },
})

const liste = computed(() => props.sorular.items || [])

const centikler = computed(() => {
  const n = liste.value.length
  return liste.value.map((_, i) => i / Math.max(n - 1, 1))
})
</script>

<template>
  <section class="ss" aria-labelledby="sorular-baslik">
    <div class="ss-alan">
      <p class="ss-kunye op-kunye">05 / TAŞINMADAN ÖNCE</p>

      <aside class="ss-pafta">
        <h2 id="sorular-baslik" class="ss-h2 tip-anlati">{{ sorular.heading }}</h2>

        <div class="ss-cizim" aria-hidden="true">
          <svg
            class="ss-svg"
            viewBox="0 0 560 620"
            preserveAspectRatio="xMidYMid meet"
            focusable="false"
          >
            <!-- Mimari grid: sakin, çizimin arkasında. -->
            <g class="ss-grid">
              <path d="M36 58 H524 M36 134 H524 M36 210 H524 M36 286 H524 M36 362 H524 M36 438 H524 M36 514 H524" />
              <path d="M74 34 V566 M150 34 V566 M226 34 V566 M302 34 V566 M378 34 V566 M454 34 V566" />
            </g>

            <!-- Zemin / referans düzlemi. -->
            <g class="ss-zemin">
              <path d="M94 452 L280 566 L470 456" />
              <path d="M112 430 L280 534 L452 434" />
              <path d="M148 478 H424" />
            </g>

            <!-- Ana yapı: eski İstanbul apartmanı / konut kütlesi. -->
            <g class="ss-yapi">
              <!-- çatı ana kütlesi -->
              <path d="M142 184 L286 104 L424 184 L278 270 Z" />
              <path d="M164 184 L286 124 L402 184 L278 254 Z" />
              <path d="M142 184 L278 270 L424 184" />
              <path d="M176 168 L286 118 L392 170" />

              <!-- saçak / cephe -->
              <path d="M142 184 V398 L278 486 V270" />
              <path d="M278 270 V486 L424 398 V184" />
              <path d="M156 208 L278 282 L410 208" />

              <!-- kat çizgileri -->
              <path d="M156 276 L278 348 L410 278" />
              <path d="M156 344 L278 416 L410 346" />

              <!-- sol cephe pencereleri -->
              <path d="M178 224 L222 250 V300 L178 274 Z" />
              <path d="M236 258 L264 274 V324 L236 308 Z" />
              <path d="M178 308 L222 334 V384 L178 358 Z" />
              <path d="M236 342 L264 358 V408 L236 392 Z" />

              <!-- sağ cephe pencereleri -->
              <path d="M304 268 L348 244 V296 L304 320 Z" />
              <path d="M364 234 L398 216 V268 L364 286 Z" />
              <path d="M304 354 L348 330 V382 L304 406 Z" />
              <path d="M364 320 L398 302 V354 L364 372 Z" />

              <!-- giriş / eşik -->
              <path d="M246 404 L278 422 V482 L246 462 Z" />
              <path d="M238 466 L278 490 L326 466" />

              <!-- yapısal kesit vurguları -->
              <path d="M278 270 V486" />
              <path d="M142 184 L142 398" />
              <path d="M424 184 L424 398" />
            </g>

            <!-- Erişim ölçüm geometri: rakam yok, yalnız datum/eksen. -->
            <g class="ss-olcum">
              <path d="M106 166 V416" />
              <path d="M96 166 H116 M96 416 H116" />
              <path d="M110 294 H146" />
              <path d="M448 170 V410" />
              <path d="M438 170 H458 M438 410 H458" />
              <path d="M132 424 H228" />
              <path d="M132 416 V432 M228 416 V432" />
            </g>

            <!-- Düşey taşıma / asansör geometrisi. -->
            <g class="ss-lift">
              <path d="M474 196 V388" />
              <path d="M462 196 H486 M462 388 H486" />
              <path d="M466 238 H482 V328 H466 Z" />
              <path d="M474 214 V236 M474 330 V366" />
              <path d="M458 282 H490" />
            </g>

            <!-- Araç yaklaşımı: teknik siluet. -->
            <g class="ss-arac">
              <path d="M40 470 H142 L180 494 H218 V536 H34 V494 H40 Z" />
              <path d="M142 470 V494 H178" />
              <path d="M54 482 H124" />
              <circle cx="80" cy="536" r="14" />
              <circle cx="176" cy="536" r="14" />
            </g>

            <!-- Operasyon rotası: tek bakır jest. -->
            <g class="ss-rota">
              <path d="M216 514 C244 506 252 490 272 470 C300 442 324 434 352 420 C382 406 404 386 422 356" />
              <path d="M422 356 l-12 3 M422 356 l-4 11" />
            </g>
          </svg>

          <!-- Mevcut continuous-line dili: paftanın sağında okuma ölçeği. -->
          <div class="ss-omurga">
            <span class="ss-omurga-cizgi"></span>
            <span
              v-for="(t, i) in centikler"
              :key="i"
              class="ss-centik"
              :style="{ '--t': t }"
            ></span>
            <span class="ss-imlec"></span>
          </div>
        </div>
      </aside>

      <dl class="ss-liste">
        <div v-for="s in liste" :key="s.question" class="ss-oge">
          <dt class="ss-soru">{{ s.question }}</dt>
          <dd class="ss-cevap">{{ s.answer }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.ss {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}

.ss-alan {
  max-width: var(--container-wide);
  margin: 0 auto;
  padding: var(--sahne-dikey) var(--sahne-pad) var(--sahne-dikey-dar);
}

.ss-kunye {
  margin: 0 0 clamp(1.5rem, 1rem + 1.5vw, 2.5rem);
}

.ss-pafta {
  min-width: 0;
}

.ss-h2 {
  max-width: 15ch;
  margin: 0;
}

.ss-cizim {
  position: relative;
  margin-top: clamp(1.5rem, 1rem + 1.5vw, 2.75rem);
  width: min(100%, 34rem);
  aspect-ratio: 14 / 15.5;
}

.ss-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.ss-svg path,
.ss-svg rect,
.ss-svg circle {
  fill: none;
  vector-effect: non-scaling-stroke;
}

.ss-grid path {
  stroke: rgb(var(--c-rule));
  stroke-width: 0.65;
}

.ss-zemin path {
  stroke: rgb(var(--c-rule));
  stroke-width: 0.8;
}

.ss-yapi path {
  stroke: rgb(var(--c-ink-soft));
  stroke-width: 1.05;
  stroke-linecap: square;
  stroke-linejoin: miter;
}

.ss-olcum path,
.ss-lift path,
.ss-arac path,
.ss-arac circle {
  stroke: rgb(var(--c-measure));
  stroke-width: 0.9;
  stroke-linecap: square;
  stroke-linejoin: miter;
}

.ss-rota path {
  stroke: rgb(var(--c-signal));
  stroke-width: 1.25;
  stroke-linecap: square;
  stroke-linejoin: miter;
}

.ss-omurga {
  display: none;
}

/* ========================================================================== */
/* SORU / CEVAP                                                               */
/* ========================================================================== */

.ss-liste {
  margin: clamp(2.5rem, 2rem + 2vw, 4rem) 0 0;
  padding: 0;
  border-top: 1px solid rgb(var(--c-measure));
  border-bottom: 1px solid rgb(var(--c-rule));
}

.ss-oge {
  position: relative;
  padding: clamp(1.75rem, 1.3rem + 1vw, 2.5rem) 0;
}

.ss-oge + .ss-oge {
  border-top: 1px solid rgb(var(--c-rule));
}

.ss-soru {
  font-size: clamp(1.125rem, 1.02rem + 0.45vw, 1.375rem);
  line-height: 1.3;
  letter-spacing: -0.012em;
  font-weight: 600;
  max-width: 32ch;
  text-wrap: balance;
}

.ss-cevap {
  margin: 0.75rem 0 0;
  font-size: clamp(0.875rem, 0.84rem + 0.16vw, 0.9375rem);
  line-height: 1.65;
  color: rgb(var(--c-ink-soft));
  max-width: 58ch;
  text-wrap: pretty;
}

/* ========================================================================== */
/* DESKTOP — PAFTA + AÇIK FAQ                                                 */
/* ========================================================================== */

@media (min-width: 1024px) {
  .ss-alan {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }

  .ss-kunye {
    grid-column: 1 / 13;
  }

  .ss-pafta {
    grid-column: 1 / 6;
    position: sticky;
    top: calc(var(--sahne-navbar) + 1.5rem);
    align-self: start;
  }

  .ss-h2 {
    font-size: clamp(2rem, 1.3rem + 2.1vw, 3.4rem);
    line-height: 1.02;
    letter-spacing: -0.035em;
    font-weight: 700;
  }

  /* Önceki turdaki fazla boşluğu azalt: pafta başlığa yaklaşır ve optik
     olarak sağa kayarak Q/A sistemiyle daha sıkı bir bütün olur. */
  .ss-cizim {
    width: min(100%, 30rem);
    margin-top: clamp(1.25rem, 0.75rem + 1.25vw, 2.25rem);
    margin-left: clamp(0.75rem, 0.35rem + 0.8vw, 1.5rem);
  }

  .ss-omurga {
    display: block;
    position: absolute;
    top: 12%;
    right: -1rem;
    width: 1.5rem;
    height: min(40vh, 18rem);
  }

  .ss-omurga-cizgi {
    position: absolute;
    right: 0.75rem;
    top: 0;
    bottom: 0;
    width: 1px;
    background: rgb(var(--c-measure));
  }

  .ss-centik {
    position: absolute;
    right: 0;
    top: calc(var(--t) * 100%);
    width: 1.5rem;
    height: 1px;
    background: rgb(var(--c-measure));
  }

  .ss-imlec {
    position: absolute;
    right: calc(0.75rem - 1px);
    top: 0;
    width: 3px;
    height: 2.5rem;
    background: rgb(var(--c-signal));
  }

  .ss-liste {
    grid-column: 6 / 13;
    margin: 0;
  }

  .ss-oge {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
    padding-left: clamp(1.25rem, 0.5rem + 1.2vw, 2rem);
  }

  .ss-oge::before {
    content: "";
    position: absolute;
    left: 0;
    top: calc(clamp(1.75rem, 1.3rem + 1vw, 2.5rem) + 0.85rem);
    width: 0.9rem;
    height: 1px;
    background: rgb(var(--c-rule));
  }

  .ss-soru {
    grid-column: 1 / 4;
    max-width: none;
  }

  .ss-cevap {
    grid-column: 4 / 8;
    margin-top: 0;
    max-width: none;
  }

  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .ss {
        view-timeline-name: --ss-hat;
        view-timeline-axis: block;
      }

      .ss-imlec {
        animation-name: ss-imlec-in;
        animation-duration: auto;
        animation-timing-function: linear;
        animation-fill-mode: both;
        animation-timeline: --ss-hat;
        animation-range: cover 18% cover 82%;
      }

      @keyframes ss-imlec-in {
        0% {
          transform: translateY(0);
        }

        100% {
          transform: translateY(calc(min(40vh, 18rem) - 2.5rem));
        }
      }
    }
  }
}

/* Mobil/tablet: pin yok; teknik pafta sadeleşir, Q/A normal akıştadır. */
@media (max-width: 1023px) {
  .ss-cizim {
    max-width: 29rem;
  }

  .ss-grid,
  .ss-lift {
    display: none;
  }
}

@media (max-width: 640px) {
  .ss-cizim {
    width: min(100%, 23rem);
    aspect-ratio: 5 / 4;
    overflow: hidden;
  }

  .ss-svg {
    transform: scale(1.06) translateY(-2%);
    transform-origin: center top;
  }

  .ss-oge {
    padding-block: 1.5rem;
  }
}
</style>
