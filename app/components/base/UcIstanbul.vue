<script setup>
/**
 * İSTANBUL CONSTRAINT ENGINE — SIGNATURE #3
 *
 * BÖLÜM FİKRİ
 * --------------------------------------------------------------------------
 * "Şehir planı değiştirir" cümlesi artık anlatılan değil, ekranda çalışan
 * bir mekanizma:
 *
 *   01 / DAR SOKAK      → araç yaklaşımı
 *   02 / MERDİVEN       → dönüş geometrisi
 *   03 / KONTROLLÜ GİRİŞ→ randevu rotası
 *
 * Desktop:
 * - 470vh sticky sahne
 * - üç teknik pafta sırayla "inceleme masasına" gelir
 * - bakır operasyon rotaları çizilir
 * - önceki paftalar hafıza katmanı olarak çevreye kilitlenir
 * - finalde üçü tek bir operasyon matrisi oluşturur
 *
 * Tablet / mobil:
 * - pin yok
 * - üç vaka bağımsız editoryal teknik plakalar olarak akar
 *
 * CMS sözleşmesi korunur.
 * Ek JS / GSAP yok.
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

const bolgeAgiAcik = useRegionPages()

</script>

<template>
  <section class="ce" aria-labelledby="constraint-baslik">
    <div class="ce-track sahne-alan">
      <!-- ================================================================
           ÜST KÜNYE
           ================================================================ -->
      <div class="ce-kunye">
        <!-- 02 — 03 DEĞİL. Bölüm numarası burada `03` yazıyordu ve Süreç
             bölümü de `03` basıyordu; ana sayfada aynı numara iki kez
             görünüyordu. Doğru değer uydurulmadı, `pages/index.vue`
             içindeki bölüm kütüğünde zaten yazılı:
               02  ŞEHİR PLANI DEĞİŞTİRİR    UcIstanbul
               03  TAŞIMANIN İÇİNDE          Surec -->
        <span>02 / ŞEHİR PLANI DEĞİŞTİRİR</span>
      </div>

      <!-- ================================================================
           SOL / NARRATIVE RAY
           ================================================================ -->
      <div class="ce-metin">
        <div class="ce-ray">
          <article class="ce-durak ce-durak--giris">
            <h2 id="constraint-baslik" class="ce-h2">
              {{ bolum.heading }}
            </h2>
            <p class="ce-govde">
              {{ bolum.lead }}
            </p>
          </article>

          <article
            v-for="d in durumlar"
            :key="d.no"
            class="ce-durak"
          >
            <div class="ce-vaka-meta">
              <span class="ce-vaka-no">{{ d.no }}</span>
              <span class="ce-vaka-etiket">{{ d.etiket }}</span>
              <span class="ce-vaka-tip">{{ d.tipoloji }}</span>
            </div>

            <h3 class="ce-h3">
              {{ d.baslik }}
            </h3>

            <p class="ce-govde">
              {{ d.metin }}
            </p>

            <div class="ce-vaka-cizgi" aria-hidden="true">
              <span></span>
              <span></span>
            </div>
          </article>

          <article class="ce-durak ce-durak--son">
            <p class="ce-sonuc">
              {{ ilceler.toplam }} ilçe.<br />
              {{ bolum.closing }}
            </p>

            <p class="ce-govde">
              {{ bolum.closingNote }}
            </p>

            <NuxtLink
              v-if="bolgeAgiAcik"
              to="/bolgelerimiz"
              class="ce-bag"
            >
              <span>{{ bolum.ctaLabel }}</span>
              <span aria-hidden="true">↗</span>
            </NuxtLink>
          </article>
        </div>
      </div>

      <!-- ================================================================
           SAĞ / TEKNİK İNCELEME MASASI
           ================================================================ -->
      <div class="ce-masa">
        <!-- merkez hedef / registration mark -->
        <div class="ce-hedef" aria-hidden="true">
          <span></span>
          <span></span>
        </div>

        <!-- pafta numaraları / masa kalibrasyonu -->
        <div class="ce-kalibrasyon" aria-hidden="true">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>

        <figure
          v-for="(d, i) in durumlar"
          :key="`plate-${d.no}`"
          class="ce-pafta"
          :class="`ce-pafta--${i + 1}`"
          :aria-label="d.baslik"
        >
          <!-- ============================================================
               01 / DAR SOKAK — YATAY PLATE
               ============================================================ -->
          <svg
            v-if="i === 0"
            class="ce-cizim"
            viewBox="0 0 900 560"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <pattern
                id="ce-hatch-01"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <line x1="0" y1="0" x2="0" y2="10" class="ce-svg-hatch" />
              </pattern>

              <marker
                id="ce-arrow-01"
                viewBox="0 0 10 10"
                refX="8.3"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M0 0L10 5L0 10Z" class="ce-svg-signal-fill" />
              </marker>
            </defs>

            <!-- grid -->
            <g class="ce-svg-grid">
              <path d="M70 90H830M70 190H830M70 290H830M70 390H830M70 490H830" />
              <path d="M150 55V515M300 55V515M450 55V515M600 55V515M750 55V515" />
            </g>

            <!-- mimari kütleler -->
            <g>
              <path
                class="ce-svg-building"
                fill="url(#ce-hatch-01)"
                d="M88 105H285V205H252V232H88Z"
              />
              <path
                class="ce-svg-building"
                fill="url(#ce-hatch-01)"
                d="M615 105H812V232H648V205H615Z"
              />
              <path
                class="ce-svg-building"
                fill="url(#ce-hatch-01)"
                d="M88 365H275V455H88Z"
              />
              <path
                class="ce-svg-building"
                fill="url(#ce-hatch-01)"
                d="M625 365H812V455H625Z"
              />
            </g>

            <!-- yol -->
            <path class="ce-svg-strong" d="M95 258H805M95 345H805" />
            <path class="ce-svg-soft ce-svg-dash" d="M95 302H805" />

            <!-- araç -->
            <g transform="translate(318 260)">
              <rect x="0" y="8" width="170" height="68" class="ce-svg-fill" />
              <rect x="135" y="19" width="46" height="46" rx="9" class="ce-svg-fill" />
              <path class="ce-svg-soft" d="M18 23H124M18 37H124M18 51H124M18 65H124" />
              <circle cx="35" cy="78" r="7" class="ce-svg-ink-fill" />
              <circle cx="142" cy="78" r="7" class="ce-svg-ink-fill" />
            </g>

            <!-- taşıma rotası -->
            <path
              pathLength="1"
              class="ce-svg-route ce-svg-route--1"
              d="M500 302H610V252H710V195"
              marker-end="url(#ce-arrow-01)"
            />

            <circle cx="500" cy="302" r="5" class="ce-svg-signal-fill" />

            <!-- ölçüler -->
            <path class="ce-svg-dim" d="M145 495H755M145 486V504M755 486V504" />
            <text x="450" y="523" text-anchor="middle" class="ce-svg-label">
              NET GEÇİŞ / 3.20 m
            </text>

            <text x="85" y="62" class="ce-svg-index">01</text>
            <text x="125" y="62" class="ce-svg-title">
              {{ d.etiket }} / ARAÇ YAKLAŞIMI
            </text>

            <text x="620" y="285" class="ce-svg-signal-text">
              TAŞIMA HATTI
            </text>
            <text x="620" y="309" class="ce-svg-signal-big">
              15 m
            </text>
          </svg>

          <!-- ============================================================
               02 / MERDİVEN — DİKEY PLATE
               ============================================================ -->
          <svg
            v-else-if="i === 1"
            class="ce-cizim"
            viewBox="0 0 620 860"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <marker
                id="ce-arrow-02"
                viewBox="0 0 10 10"
                refX="8.3"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M0 0L10 5L0 10Z" class="ce-svg-signal-fill" />
              </marker>
            </defs>

            <g class="ce-svg-grid">
              <path d="M72 105H548M72 425H548M72 745H548" />
              <path d="M105 70V790M310 70V790M515 70V790" />
            </g>

            <rect x="145" y="150" width="330" height="545" class="ce-svg-building" />

            <path class="ce-svg-strong" d="M165 175V670M310 175V670M455 175V670" />

            <g class="ce-svg-soft">
              <path d="M165 225H310M165 275H310M165 325H310M165 375H310" />
              <path d="M165 480H310M165 530H310M165 580H310M165 630H310" />
              <path d="M310 225H455M310 275H455M310 325H455M310 375H455" />
              <path d="M310 480H455M310 530H455M310 580H455M310 630H455" />
            </g>

            <!-- sahanlık -->
            <rect x="165" y="397" width="290" height="82" class="ce-svg-paper" />

            <!-- eşya zarfı -->
            <rect
              x="195"
              y="205"
              width="230"
              height="365"
              class="ce-svg-signal-soft ce-svg-dash"
            />

            <g transform="translate(310 410) rotate(41)">
              <rect
                x="-68"
                y="-165"
                width="136"
                height="330"
                pathLength="1"
                class="ce-svg-route ce-svg-turn"
              />
            </g>

            <path
              pathLength="1"
              class="ce-svg-route ce-svg-route--2"
              d="M395 592A168 168 0 0 0 205 337"
              marker-end="url(#ce-arrow-02)"
            />

            <!-- ölçüler -->
            <path class="ce-svg-dim" d="M124 150V695M114 150H134M114 695H134" />
            <text
              x="96"
              y="430"
              text-anchor="middle"
              class="ce-svg-label"
              transform="rotate(-90 96 430)"
            >
              KAT EKSENİ / 2.10 m
            </text>

            <path class="ce-svg-dim" d="M195 117H425M195 108V126M425 108V126" />
            <text x="310" y="98" text-anchor="middle" class="ce-svg-signal-big">
              DÖNÜŞ ZARFI / 2.16 m
            </text>

            <text x="70" y="58" class="ce-svg-index">02</text>
            <text x="110" y="58" class="ce-svg-title">
              {{ d.etiket }} / DÖNÜŞ GEOMETRİSİ
            </text>
          </svg>

          <!-- ============================================================
               03 / KONTROLLÜ GİRİŞ — YATAY PLATE
               ============================================================ -->
          <svg
            v-else
            class="ce-cizim"
            viewBox="0 0 920 600"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <marker
                id="ce-arrow-03"
                viewBox="0 0 10 10"
                refX="8.3"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M0 0L10 5L0 10Z" class="ce-svg-signal-fill" />
              </marker>
            </defs>

            <g class="ce-svg-grid">
              <path d="M70 100H850M70 300H850M70 500H850" />
              <path d="M150 70V530M460 70V530M770 70V530" />
            </g>

            <!-- site sınırı -->
            <rect
              x="105"
              y="115"
              width="710"
              height="370"
              class="ce-svg-strong ce-svg-dash"
            />

            <!-- güvenlik -->
            <rect x="130" y="250" width="105" height="78" class="ce-svg-paper" />
            <text x="182" y="284" text-anchor="middle" class="ce-svg-label">GÜVENLİK</text>
            <text x="182" y="307" text-anchor="middle" class="ce-svg-note">GİRİŞ 01</text>

            <!-- yükleme cebi -->
            <rect
              x="310"
              y="248"
              width="142"
              height="100"
              class="ce-svg-signal-soft ce-svg-dash"
            />
            <rect x="335" y="274" width="92" height="48" class="ce-svg-fill" />
            <text x="381" y="303" text-anchor="middle" class="ce-svg-label">YÜKLEME</text>

            <!-- bloklar -->
            <g>
              <rect x="555" y="155" width="95" height="92" class="ce-svg-paper ce-svg-building" />
              <rect x="685" y="155" width="95" height="92" class="ce-svg-paper ce-svg-building" />
              <rect x="555" y="355" width="95" height="92" class="ce-svg-paper ce-svg-building" />
              <rect x="685" y="355" width="95" height="92" class="ce-svg-paper ce-svg-building" />

              <text x="602" y="210" text-anchor="middle" class="ce-svg-block">A</text>
              <text x="732" y="210" text-anchor="middle" class="ce-svg-block">B</text>
              <text x="602" y="410" text-anchor="middle" class="ce-svg-block ce-svg-block--signal">C</text>
              <text x="732" y="410" text-anchor="middle" class="ce-svg-block">D</text>
            </g>

            <!-- rota -->
            <path
              pathLength="1"
              class="ce-svg-route ce-svg-route--3"
              d="M80 288H250V298H310V405H500V402H555"
              marker-end="url(#ce-arrow-03)"
            />

            <circle cx="80" cy="288" r="5" class="ce-svg-signal-fill" />
            <circle cx="555" cy="402" r="5" class="ce-svg-signal-fill" />

            <!-- randevu kutusu -->
            <rect x="570" y="370" width="65" height="52" class="ce-svg-signal-box" />
            <text x="602" y="401" text-anchor="middle" class="ce-svg-signal-big">09:00</text>

            <text x="78" y="62" class="ce-svg-index">03</text>
            <text x="118" y="62" class="ce-svg-title">
              {{ d.etiket }} / RANDEVU ROTASI
            </text>

            <text x="130" y="535" class="ce-svg-signal-text">
              İZİN → GİRİŞ → YÜKLEME CEBİ → BLOK C
            </text>
          </svg>

          <!-- pafta alt indeks -->
          <figcaption class="ce-pafta-alt">
            <span>{{ d.no }}</span>
            <span>{{ d.tipoloji }}</span>
          </figcaption>
        </figure>

        <!-- FINAL MATRIX CONNECTORS -->
        <svg
          class="ce-baglanti"
          viewBox="0 0 1000 700"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path class="ce-baglanti-cizgi ce-baglanti-cizgi--1" d="M150 178H500V350" pathLength="1" />
          <path class="ce-baglanti-cizgi ce-baglanti-cizgi--2" d="M850 175H500V350" pathLength="1" />
          <path class="ce-baglanti-cizgi ce-baglanti-cizgi--3" d="M500 350V565" pathLength="1" />
          <circle cx="500" cy="350" r="6" class="ce-baglanti-dugum" />
        </svg>

        <!-- final center label -->
        <div class="ce-final-label" aria-hidden="true">
          <span>ŞEHİR</span>
          <strong>≠</strong>
          <span>TEK PLAN</span>
        </div>

        <!-- eksenler -->
        <span class="ce-eksen ce-eksen--x" aria-hidden="true"></span>
        <span class="ce-eksen ce-eksen--y" aria-hidden="true"></span>
      </div>
    </div>
  </section>
</template>

<style scoped>
/*
   `--ce-pl` SAYISAL olarak enterpole edilmeli; kayitsiz ozel
   ozellikler adim adim degisir ve altyazi telafisi zipplar.
*/
@property --ce-pl {
  syntax: '<number>';
  inherits: true;
  initial-value: 1;
}

/* ==========================================================================
   BASE
   ======================================================================= */

.ce {
  --ce-paper: rgb(var(--c-paper));
  --ce-paper-2: rgb(var(--c-paper-sunken));
  --ce-ink: rgb(var(--c-ink));
  --ce-soft: rgb(var(--c-ink-soft));
  --ce-rule: rgb(var(--c-rule));
  --ce-measure: rgb(var(--c-measure));
  --ce-signal: rgb(var(--c-signal));
  --ce-signal-deep: rgb(var(--c-signal-deep));

  position: relative;
  background: var(--ce-paper);
  color: var(--ce-ink);
  overflow: clip;
}

.ce-track {
  position: relative;
  padding-block: var(--sahne-dikey);
  display: grid;
  gap: clamp(2.5rem, 5vw, 5rem);
}

/* ==========================================================================
   KÜNYE
   ======================================================================= */

.ce-kunye {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--ce-rule);
  font-family: var(--f-mono);
  font-size: 0.625rem;
  letter-spacing: 0.11em;
  line-height: 1.2;
  text-transform: uppercase;
  color: var(--ce-soft);
}

/* ==========================================================================
   METİN / MOBILE NORMAL FLOW
   ======================================================================= */

.ce-metin,
.ce-ray {
  display: contents;
}

.ce-durak {
  display: grid;
  gap: 0;
  min-width: 0;
}

.ce-indeks,
.ce-vaka-meta {
  font-family: var(--f-mono);
  text-transform: uppercase;
}

.ce-indeks {
  margin-bottom: 0.8rem;
  font-size: 0.625rem;
  letter-spacing: 0.11em;
  color: var(--ce-signal);
}

.ce-h2,
.ce-h3,
.ce-sonuc {
  font-family: var(--f-display, var(--f-sans));
}

.ce-h2 {
  margin: 0;
  max-width: 13ch;
  font-size: clamp(2.8rem, 12vw, 5.5rem);
  line-height: 0.91;
  font-weight: 780;
  letter-spacing: -0.06em;
  text-wrap: balance;
}

.ce-h3 {
  margin: 0.7rem 0 0;
  max-width: 17ch;
  font-size: clamp(2rem, 8.5vw, 3.4rem);
  line-height: 0.94;
  font-weight: 720;
  letter-spacing: -0.045em;
  text-wrap: balance;
}

.ce-govde {
  margin: 1rem 0 0;
  max-width: 50ch;
  font-size: clamp(0.95rem, 0.9rem + 0.25vw, 1.075rem);
  line-height: 1.55;
  color: var(--ce-soft);
  text-wrap: pretty;
}

.ce-vaka-meta {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.15rem 0.7rem;
  align-items: baseline;
  font-size: 0.6rem;
  letter-spacing: 0.09em;
}

.ce-vaka-no {
  grid-row: 1 / 3;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 0.85;
  color: var(--ce-signal);
}

.ce-vaka-etiket {
  color: var(--ce-ink);
}

.ce-vaka-tip {
  color: var(--ce-soft);
}

.ce-vaka-cizgi {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1.2rem;
}

.ce-vaka-cizgi span:first-child {
  width: 3rem;
  height: 1px;
  background: var(--ce-signal);
}

.ce-vaka-cizgi span:last-child {
  width: 4px;
  height: 4px;
  background: var(--ce-signal);
}

.ce-sonuc {
  margin: 0;
  max-width: 11ch;
  font-size: clamp(3rem, 12vw, 5.8rem);
  font-weight: 780;
  line-height: 0.88;
  letter-spacing: -0.06em;
}

.ce-bag {
  width: fit-content;
  min-height: 48px;
  margin-top: 1.5rem;
  padding: 0.65rem 0 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  border-top: 1px solid var(--ce-signal);
  color: var(--ce-ink);
  text-decoration: none;
  font-weight: 650;
}

.ce-bag span:last-child {
  color: var(--ce-signal);
  font-size: 1.4rem;
  transition: transform 170ms ease-out;
}

.ce-bag:hover span:last-child {
  transform: translate(0.18rem, -0.18rem);
}

/* ==========================================================================
   MASA / MOBILE
   ======================================================================= */

.ce-masa {
  position: relative;
  display: contents;
}

.ce-pafta {
  position: relative;
  margin: 0;
  width: 100%;
  overflow: hidden;
  background: var(--ce-paper);
  border-top: 1px solid var(--ce-rule);
  border-bottom: 1px solid var(--ce-rule);
}

.ce-pafta--1,
.ce-pafta--3 {
  aspect-ratio: 16 / 10;
}

.ce-pafta--2 {
  width: min(72%, 27rem);
  aspect-ratio: 3 / 4;
}

.ce-cizim {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  shape-rendering: geometricPrecision;
}

.ce-cizim :is(path, line, rect, circle, polyline, polygon) {
  vector-effect: non-scaling-stroke;
}

/* semantic ordering on mobile */
.ce-durak--giris { order: 1; }
.ce-pafta--1     { order: 3; }
.ce-ray > .ce-durak:nth-child(2) { order: 2; }
.ce-pafta--2     { order: 5; }
.ce-ray > .ce-durak:nth-child(3) { order: 4; }
.ce-pafta--3     { order: 7; }
.ce-ray > .ce-durak:nth-child(4) { order: 6; }
.ce-durak--son   { order: 8; }

/* ==========================================================================
   SVG SYSTEM
   ======================================================================= */

.ce-svg-grid {
  fill: none;
  stroke: rgb(var(--c-rule) / 0.55);
  stroke-width: 0.7;
}

.ce-svg-hatch {
  stroke: rgb(var(--c-measure) / 0.42);
  stroke-width: 0.65;
}

.ce-svg-building {
  stroke: var(--ce-soft);
  stroke-width: 1.2;
  fill: none;
}

.ce-svg-strong {
  fill: none;
  stroke: var(--ce-ink);
  stroke-width: 1.55;
}

.ce-svg-soft,
.ce-svg-dim {
  fill: none;
  stroke: var(--ce-measure);
}

.ce-svg-soft { stroke-width: 0.9; }
.ce-svg-dim  { stroke-width: 0.95; }

.ce-svg-dash {
  stroke-dasharray: 7 6;
}

.ce-svg-paper {
  fill: var(--ce-paper);
  stroke: var(--ce-measure);
  stroke-width: 1;
}

.ce-svg-fill {
  fill: var(--ce-paper-2);
  stroke: var(--ce-ink);
  stroke-width: 1.3;
}

.ce-svg-ink-fill {
  fill: var(--ce-ink);
}

.ce-svg-signal-fill {
  fill: var(--ce-signal);
}

.ce-svg-route {
  fill: none;
  stroke: var(--ce-signal);
  stroke-width: 2;
  stroke-linecap: square;
  stroke-linejoin: miter;
}

.ce-svg-signal-soft {
  fill: none;
  stroke: var(--ce-signal);
  stroke-width: 1.05;
}

.ce-svg-signal-box {
  fill: var(--ce-paper);
  stroke: var(--ce-signal);
  stroke-width: 1.3;
}

.ce-svg-index,
.ce-svg-title,
.ce-svg-label,
.ce-svg-note,
.ce-svg-signal-text,
.ce-svg-signal-big,
.ce-svg-block {
  font-family: var(--f-mono);
}

.ce-svg-index {
  fill: var(--ce-signal);
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.08em;
}

.ce-svg-title {
  fill: var(--ce-ink);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.095em;
}

.ce-svg-label {
  fill: var(--ce-soft);
  font-size: 11px;
  letter-spacing: 0.08em;
}

.ce-svg-note {
  fill: var(--ce-measure);
  font-size: 10px;
  letter-spacing: 0.08em;
}

.ce-svg-signal-text {
  fill: var(--ce-signal);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.085em;
}

.ce-svg-signal-big {
  fill: var(--ce-signal);
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.06em;
}

.ce-svg-block {
  fill: var(--ce-ink);
  font-size: 17px;
  font-weight: 700;
}

.ce-svg-block--signal {
  fill: var(--ce-signal);
}

/* ==========================================================================
   PAFTA FOOTER
   ======================================================================= */

.ce-pafta-alt {
  position: absolute;
  right: 0.7rem;
  bottom: 0.5rem;
  left: 0.7rem;
  display: flex;
  justify-content: space-between;
  gap: 0.7rem;
  font-family: var(--f-mono);
  font-size: 0.5rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ce-soft);
}

.ce-pafta-alt span:first-child {
  color: var(--ce-signal);
}

/* desktop-only structure hidden in normal flow */
.ce-hedef,
.ce-kalibrasyon,
.ce-baglanti,
.ce-final-label,
.ce-eksen {
  display: none;
}

/* ==========================================================================
   MOBILE MICRO MOTION
   ======================================================================= */

@supports (animation-timeline: view()) {
  @media (max-width: 1279px) and (prefers-reduced-motion: no-preference) {
    .ce-pafta {
      view-timeline-name: --ce-card;
      view-timeline-axis: block;
      animation-name: ce-mobile-plate;
      animation-duration: auto;
      animation-fill-mode: both;
      animation-timing-function: linear;
      animation-timeline: --ce-card;
      animation-range: entry 82% cover 58%;
    }

    @keyframes ce-mobile-plate {
      from {
        clip-path: inset(8% 0 8% 0);
        transform: translateY(1.2rem);
      }
      to {
        clip-path: inset(0);
        transform: translateY(0);
      }
    }
  }
}

/* ==========================================================================
   TABLET
   ======================================================================= */

@media (min-width: 768px) and (max-width: 1279px) {
  .ce-track {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }

  .ce-kunye {
    grid-column: 1 / 13;
  }

  .ce-durak {
    grid-column: 1 / 7;
  }

  .ce-pafta {
    grid-column: 6 / 13;
  }

  .ce-pafta--2 {
    grid-column: 7 / 12;
    width: 100%;
  }

  .ce-h2 {
    font-size: clamp(4rem, 7.5vw, 6.4rem);
  }

  .ce-h3 {
    font-size: clamp(2.7rem, 4.8vw, 4rem);
  }

  .ce-sonuc {
    font-size: clamp(4rem, 7vw, 6rem);
  }
}

/* ==========================================================================
   DESKTOP STATIC FALLBACK
   ======================================================================= */

@media (min-width: 1280px) {
  .ce {
    min-height: calc(100vh - var(--sahne-navbar));
  }

  .ce-track {
    min-height: calc(100vh - var(--sahne-navbar));
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-rows: auto 1fr;
    column-gap: var(--sahne-kolon-arasi);
    row-gap: 1.2rem;
    align-items: stretch;
  }

  .ce-kunye {
    grid-column: 1 / 13;
    grid-row: 1;
  }

  .ce-metin {
    display: block;
    grid-column: 1 / 5;
    grid-row: 2;
    overflow: hidden;
    position: relative;
  }

  .ce-ray {
    display: block;
    height: 100%;
  }

  .ce-durak {
    display: none;
  }

  .ce-durak--son {
    display: grid;
    position: absolute;
    bottom: 1rem;
    left: 0;
    width: 100%;
  }

  .ce-masa {
    display: block;
    grid-column: 5 / 13;
    grid-row: 2;
    position: relative;
    min-height: 0;
    overflow: hidden;
    isolation: isolate;
  }

  .ce-pafta {
    position: absolute;
    margin: 0;
    width: auto;
    background: var(--ce-paper);
  }

  .ce-pafta--1 {
    width: 45%;
    height: 31%;
    left: 2%;
    top: 8%;
  }

  .ce-pafta--2 {
    width: 27%;
    height: 47%;
    left: 60%;
    top: 5%;
  }

  .ce-pafta--3 {
    width: 46%;
    height: 33%;
    left: 26%;
    top: 58%;
  }

  .ce-cizim {
    object-fit: contain;
  }

  .ce-hedef,
  .ce-kalibrasyon,
  .ce-baglanti,
  .ce-final-label,
  .ce-eksen {
    display: block;
  }

  .ce-hedef {
    position: absolute;
    z-index: 2;
    left: 50%;
    top: 50%;
    width: 5.5rem;
    height: 5.5rem;
    transform: translate(-50%, -50%);
    border: 1px solid rgb(var(--c-rule) / 0.8);
    border-radius: 50%;
  }

  .ce-hedef::before,
  .ce-hedef::after,
  .ce-hedef span::before,
  .ce-hedef span::after {
    content: "";
    position: absolute;
    background: var(--ce-measure);
  }

  .ce-hedef::before {
    width: 1px;
    top: -2rem;
    bottom: -2rem;
    left: 50%;
  }

  .ce-hedef::after {
    height: 1px;
    left: -2rem;
    right: -2rem;
    top: 50%;
  }

  .ce-hedef span:first-child::before {
    width: 0.4rem;
    height: 0.4rem;
    border: 1px solid var(--ce-signal);
    background: var(--ce-paper);
    left: calc(50% - 0.2rem);
    top: calc(50% - 0.2rem);
  }

  .ce-kalibrasyon {
    position: absolute;
    z-index: 1;
    right: 0.8rem;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-family: var(--f-mono);
    font-size: 0.48rem;
    color: var(--ce-measure);
  }

  .ce-baglanti {
    position: absolute;
    z-index: 1;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .ce-baglanti-cizgi {
    fill: none;
    stroke: var(--ce-measure);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }

  .ce-baglanti-dugum {
    fill: var(--ce-paper);
    stroke: var(--ce-signal);
    stroke-width: 1.5;
    vector-effect: non-scaling-stroke;
  }

  .ce-final-label {
    position: absolute;
    z-index: 8;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 0.8rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.65rem;
    background: var(--ce-paper);
    border: 1px solid var(--ce-signal);
    font-family: var(--f-mono);
    font-size: 0.62rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .ce-final-label strong {
    color: var(--ce-signal);
    font-size: 1.3rem;
    line-height: 1;
  }

  .ce-eksen {
    position: absolute;
    z-index: 0;
    background: rgb(var(--c-rule) / 0.65);
  }

  .ce-eksen--x {
    left: 3%;
    right: 3%;
    top: 50%;
    height: 1px;
  }

  .ce-eksen--y {
    top: 3%;
    bottom: 3%;
    left: 50%;
    width: 1px;
  }
}

/* ==========================================================================
   DESKTOP SIGNATURE MOTION
   ======================================================================= */

@supports (animation-timeline: view()) {
  @media (min-width: 1280px) and (prefers-reduced-motion: no-preference) {
    .ce {
      height: 470vh;
      width: 100vw;
      max-width: none;
      margin-inline: calc(50% - 50vw);
      view-timeline-name: --ce;
      view-timeline-axis: block;
    }

    .ce-track {
      position: sticky;
      top: var(--sahne-navbar);
      width: 100vw;
      max-width: none;
      height: calc(100vh - var(--sahne-navbar));
      min-height: 0;
      padding:
        clamp(1.1rem, 2.1vh, 1.8rem)
        var(--sahne-pad)
        clamp(1rem, 2vh, 1.5rem);
      overflow: hidden;
    }

    .ce-metin {
      height: 100%;
    }

    .ce-ray {
      display: grid;
      height: 100%;
      grid-auto-rows: 155%;
      animation-name: ce-ray-move;
    }

    .ce-durak {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 0;
    }

    .ce-durak--son {
      position: static;
      width: auto;
    }

    .ce-h2 {
      max-width: 8ch;
      font-size: clamp(4.5rem, 5.7vw, 7rem);
    }

    .ce-h3 {
      max-width: 12ch;
      font-size: clamp(3.4rem, 4.3vw, 5.4rem);
    }

    .ce-sonuc {
      font-size: clamp(4.6rem, 5.3vw, 6.7rem);
    }

    /*
      PLAKA GEOMETRİSİ ARTIK DÜZEN DEĞİL, TRANSFORM — ÖLÇÜLEN SEBEP.

      M18B ön uçuşunda ölçüldü: kareler `width/height/left/top`
      canlandırdığı için Chrome her kaydırma karesinde `layout-shift`
      kaydediyordu. Yükleme anı CLS'i 0 olmasına rağmen sayfa yaşam
      döngüsü CLS'i:

        1920x1080 -> 0.269 (programatik) / 0.158 (gerçek tekerlek)
        1440x900  -> 0.238 (programatik) / 0.167 (gerçek tekerlek)
        <=1024    -> 0.000   (masaüstü koreografisi yok)
        azaltılmış hareket -> 0.000   (kaynak münhasıran bu katman)

      Kaymalar `hadRecentInput` ile DIŞLANMIYORDU (dışlanan toplam 0).
      Kaynak düğümler: FIGURE.ce-pafta--2 ve --3.

      Çözüm: her plakanın DÜZEN kutusu sabitleniyor (aşağıdaki referans
      değerler = eski karelerdeki `scale(1)` durumu) ve tüm hareket
      `transform`a taşınıyor. Kompozisyon değişmiyor; kareler birebir
      aynı görsel durumları üretiyor (bkz. @keyframes içindeki türetme).

      `--ce-pl` plakanın o andaki ölçeği; altyazının fiziksel puntosunu
      sabit tutmak için kullanılıyor (aşağıya bak).
    */
    .ce-pafta {
      transform-origin: 50% 50%;
      /*
        KENAR: bilerek telafi EDİLMEDİ.

        Plaka çerçevesi eskiden her durumda 1px'ti; `scale()` altında
        ölçekle inceliyor (ölçüldü: en küçük durumda 0,47px, ortalarda
        0,56–0,93px). Kenar kalınlığını ölçeğe bölerek
        telafi etmek DENENDİ ve GERİ ALINDI: üç plakanın yalnız birinde
        tutarlı çalıştı ve 1440x900'de yüklemede 0,004'lük yeni bir
        kayma doğurdu (kenar kalınlığı içerik kutusunu, o da SVG'yi
        yeniden boyutlandırıyor).

        Kalan fark: saç teli çerçevenin küçük durumlarda bir tık daha
        açık görünmesi. Kompozisyon, konum, ölçek ve altyazı puntosu
        birebir korunuyor.
      */
    }

    /* ACTIVE PLATE 1 ---------------------------------------------------- */
    .ce-pafta--1 {
      z-index: 5;
      width: 78%;
      height: 54%;
      left: 11%;
      top: 23%;
      animation-name: ce-plate-1;
    }

    /* ACTIVE PLATE 2 ---------------------------------------------------- */
    .ce-pafta--2 {
      z-index: 6;
      width: 47%;
      height: 76%;
      left: 27%;
      top: 10%;
      animation-name: ce-plate-2;
    }

    /* ACTIVE PLATE 3 ---------------------------------------------------- */
    .ce-pafta--3 {
      z-index: 7;
      width: 80%;
      height: 56%;
      left: 10%;
      top: 22%;
      animation-name: ce-plate-3;
    }

    /*
      ALTYAZI TELAFİSİ.

      Eski davranışta kutu küçülürken altyazı puntosu 8px'te SABİT
      kalıyordu (ölçüldü: 16 ilerleme noktasının hepsinde 8px).
      Plaka artık `scale()` ile küçüldüğü için altyazı da küçülürdü —
      en küçük durumda 8px yerine 3,8px. Bu yüzden altyazının yerel
      puntosu ve iç boşlukları ölçeğe BÖLÜNÜYOR: `scale()` sonrası
      fiziksel değer yine 8px ve 0,7rem oluyor.
    */
    .ce-pafta-alt {
      font-size: calc(0.5rem / var(--ce-pl, 1));
      right: calc(0.7rem / var(--ce-pl, 1));
      bottom: calc(0.5rem / var(--ce-pl, 1));
      left: calc(0.7rem / var(--ce-pl, 1));
      gap: calc(0.7rem / var(--ce-pl, 1));
      letter-spacing: calc(0.08em);
    }

    /* inner drawing micro-motion */
    .ce-pafta--1 .ce-cizim { animation-name: ce-drawing-1; }
    .ce-pafta--2 .ce-cizim { animation-name: ce-drawing-2; }
    .ce-pafta--3 .ce-cizim { animation-name: ce-drawing-3; }

    /* route drawing */
    .ce-svg-route,
    .ce-svg-turn {
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
    }

    .ce-pafta--1 .ce-svg-route--1 {
      animation-name: ce-route;
      animation-range: contain 12% contain 28%;
    }

    .ce-pafta--2 :is(.ce-svg-route--2, .ce-svg-turn) {
      animation-name: ce-route;
      animation-range: contain 34% contain 50%;
    }

    .ce-pafta--3 .ce-svg-route--3 {
      animation-name: ce-route;
      animation-range: contain 56% contain 72%;
    }

    .ce-baglanti-cizgi--1 { animation-name: ce-connect-1; }
    .ce-baglanti-cizgi--2 { animation-name: ce-connect-2; }
    .ce-baglanti-cizgi--3 { animation-name: ce-connect-3; }

    .ce-baglanti-dugum {
      animation-name: ce-node;
    }

    .ce-final-label {
      animation-name: ce-final-label;
    }

    .ce-hedef {
      animation-name: ce-target;
    }

    .ce-eksen--x {
      transform: scaleX(0);
      animation-name: ce-axis-x;
    }

    .ce-eksen--y {
      transform: scaleY(0);
      animation-name: ce-axis-y;
    }

    .ce-ray,
    .ce-pafta,
    .ce-cizim,
    .ce-baglanti-cizgi,
    .ce-baglanti-dugum,
    .ce-final-label,
    .ce-hedef,
    .ce-eksen--x,
    .ce-eksen--y {
      animation-duration: auto;
      animation-fill-mode: both;
      animation-timing-function: linear;
      animation-timeline: --ce;
      animation-range: contain 0% contain 100%;
    }

    /* route range overrides above need these too */
    .ce-svg-route,
    .ce-svg-turn {
      animation-duration: auto;
      animation-fill-mode: both;
      animation-timing-function: linear;
      animation-timeline: --ce;
    }

    /* ------------------------------------------------------------------
       TIMELINE
       0–10   intro / empty table
       10–30  case 01
       30–52  case 02
       52–74  case 03
       74–92  final matrix assembly
       92–100 hold
       ---------------------------------------------------------------- */

    @keyframes ce-ray-move {
      0%, 6%    { transform: translate3d(0, -28%, 0); }
      17%, 27%  { transform: translate3d(0, -183%, 0); }
      38%, 49%  { transform: translate3d(0, -338%, 0); }
      59%, 71%  { transform: translate3d(0, -493%, 0); }
      84%, 100% { transform: translate3d(0, -648%, 0); }
    }

    /* PLAKA 1 - referans kutu 78% x 54% @ 11%,23% */
    @keyframes ce-plate-1 {
      0%, 7% {
        --ce-pl: 0.8308;
        opacity: 0;
        clip-path: inset(50% 0 50% 0);
        transform: translate3d(-7.385%, 9.130%, 0) rotate(-1.5deg) scale(0.8308, 0.8167);
      }
      14% {
        --ce-pl: 0.9292;
        opacity: 1;
        clip-path: inset(22% 0 22% 0);
        transform: translate3d(-1.936%, 3.080%, 0) rotate(-0.5deg) scale(0.9292, 0.9230);
      }
      19%, 29% {
        --ce-pl: 1.0000;
        opacity: 1;
        clip-path: inset(0);
        transform: translate3d(0.000%, 0.000%, 0) scale(1.0000, 1.0000);
      }
      38% {
        --ce-pl: 0.6031;
        opacity: 0.8;
        transform: translate3d(-25.641%, -44.444%, 0) rotate(-2deg) scale(0.6031, 0.5911);
      }
      53%, 73% {
        --ce-pl: 0.5769;
        opacity: 0.42;
        transform: translate3d(-32.692%, -49.074%, 0) rotate(-3deg) scale(0.5769, 0.5741);
      }
      84%, 100% {
        --ce-pl: 0.4744;
        opacity: 1;
        transform: translate3d(-36.538%, -55.556%, 0) rotate(-2deg) scale(0.4744, 0.4815);
      }
    }

    /* PLAKA 2 - referans kutu 47% x 76% @ 27%,10% */
    @keyframes ce-plate-2 {
      0%, 28% {
        --ce-pl: 0.7774;
        opacity: 0;
        clip-path: inset(50% 0 50% 0);
        transform: translate3d(9.447%, 7.263%, 0) rotate(1.5deg) scale(0.7774, 0.7670);
      }
      35% {
        --ce-pl: 0.9034;
        opacity: 1;
        clip-path: inset(24% 0 24% 0);
        transform: translate3d(3.375%, 2.802%, 0) rotate(0.6deg) scale(0.9034, 0.8981);
      }
      41%, 51% {
        --ce-pl: 1.0000;
        opacity: 1;
        clip-path: inset(0);
        transform: translate3d(0.000%, 0.000%, 0) scale(1.0000, 1.0000);
      }
      61% {
        --ce-pl: 0.7234;
        opacity: 0.74;
        transform: translate3d(62.766%, -21.711%, 0) rotate(2deg) scale(0.7234, 0.7237);
      }
      74% {
        --ce-pl: 0.5957;
        opacity: 0.38;
        transform: translate3d(67.021%, -25.658%, 0) rotate(3deg) scale(0.5957, 0.6184);
      }
      84%, 100% {
        --ce-pl: 0.5106;
        opacity: 1;
        transform: translate3d(71.277%, -28.947%, 0) rotate(2deg) scale(0.5106, 0.5263);
      }
    }

    /* PLAKA 3 - referans kutu 80% x 56% @ 10%,22% */
    @keyframes ce-plate-3 {
      0%, 49% {
        --ce-pl: 0.8213;
        opacity: 0;
        clip-path: inset(50% 0 50% 0);
        transform: translate3d(0.625%, 11.750%, 0) rotate(-1deg) scale(0.8213, 0.8196);
      }
      56% {
        --ce-pl: 0.9212;
        opacity: 1;
        clip-path: inset(25% 0 25% 0);
        transform: translate3d(0.288%, 3.978%, 0) rotate(-0.4deg) scale(0.9212, 0.9204);
      }
      62%, 73% {
        --ce-pl: 1.0000;
        opacity: 1;
        clip-path: inset(0);
        transform: translate3d(0.000%, 0.000%, 0) scale(1.0000, 1.0000);
      }
      82% {
        --ce-pl: 0.6750;
        opacity: 0.88;
        transform: translate3d(0.000%, 46.429%, 0) rotate(-1deg) scale(0.6750, 0.6786);
      }
      90%, 100% {
        --ce-pl: 0.5500;
        opacity: 1;
        transform: translate3d(0.000%, 49.107%, 0) rotate(-0.5deg) scale(0.5500, 0.5536);
      }
    }

    @keyframes ce-drawing-1 {
      0%, 10%  { transform: scale(1.04) translate3d(0, 1%, 0); }
      24%      { transform: scale(1.09) translate3d(-0.8%, -0.5%, 0); }
      50%      { transform: scale(1.06) translate3d(0, 0, 0); }
      100%     { transform: scale(1.03); }
    }

    @keyframes ce-drawing-2 {
      0%, 31%  { transform: scale(1.035) translate3d(0, 1%, 0); }
      46%      { transform: scale(1.085) translate3d(0.5%, -0.6%, 0); }
      70%      { transform: scale(1.055); }
      100%     { transform: scale(1.025); }
    }

    @keyframes ce-drawing-3 {
      0%, 52%  { transform: scale(1.04) translate3d(0, 1.2%, 0); }
      67%      { transform: scale(1.095) translate3d(-0.5%, -0.6%, 0); }
      82%      { transform: scale(1.05); }
      100%     { transform: scale(1.025); }
    }

    @keyframes ce-route {
      from { stroke-dashoffset: 1; }
      to   { stroke-dashoffset: 0; }
    }

    @keyframes ce-connect-1 {
      0%, 75% { stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; }
      84%, 100% { stroke-dasharray: 1; stroke-dashoffset: 0; opacity: 1; }
    }

    @keyframes ce-connect-2 {
      0%, 78% { stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; }
      87%, 100% { stroke-dasharray: 1; stroke-dashoffset: 0; opacity: 1; }
    }

    @keyframes ce-connect-3 {
      0%, 81% { stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; }
      90%, 100% { stroke-dasharray: 1; stroke-dashoffset: 0; opacity: 1; }
    }

    @keyframes ce-node {
      0%, 82% {
        opacity: 0;
        transform: scale(0);
        transform-origin: center;
      }
      90%, 100% {
        opacity: 1;
        transform: scale(1);
        transform-origin: center;
      }
    }

    @keyframes ce-final-label {
      0%, 82% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.74);
      }
      90% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.06);
      }
      95%, 100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes ce-target {
      0%, 12% {
        opacity: 0.22;
        transform: translate(-50%, -50%) scale(1.3) rotate(0deg);
      }
      52% {
        opacity: 0.45;
        transform: translate(-50%, -50%) scale(1) rotate(90deg);
      }
      82%, 100% {
        opacity: 0.16;
        transform: translate(-50%, -50%) scale(0.76) rotate(180deg);
      }
    }

    @keyframes ce-axis-x {
      0%, 73% { transform: scaleX(0); }
      87%, 100% { transform: scaleX(1); }
    }

    @keyframes ce-axis-y {
      0%, 76% { transform: scaleY(0); }
      90%, 100% { transform: scaleY(1); }
    }
  }
}

/* ==========================================================================
   ULTRAWIDE
   ======================================================================= */

@media (min-width: 1280px) and (min-aspect-ratio: 2 / 1) {
  .ce-track {
    padding-inline:
      max(var(--sahne-pad), calc((100vw - 1840px) / 2));
  }

  .ce-h2 {
    font-size: clamp(4rem, 4.8vw, 6.4rem);
  }

  .ce-h3 {
    font-size: clamp(3.1rem, 3.7vw, 4.8rem);
  }

  .ce-masa {
    max-width: 1220px;
    width: 100%;
    justify-self: end;
  }
}

/* ==========================================================================
   MASAÜSTÜ İÇERİK YEDEĞİ  —  1280+ / sahne çalışmadığında
   --------------------------------------------------------------------------
   ÖLÇÜLEN KUSUR (M19A):

     >=1280 normal hareket   .ce metni 1760 karakter, üç durak görünür
     >=1280 azaltılmış       .ce metni  547 karakter, .ce-durak kutusu 0x0
                             sayfanın main metni 7902 -> 6674 (1228 karakter)

   SEBEBİ: `@media (min-width: 1280px)` bloğu `.ce-durak { display: none }`
   diyor ve duraklar YALNIZCA
   `@supports (animation-timeline: view())` + `no-preference` içinde geri
   geliyordu. Yani hem azaltılmış hareket seçen kullanıcı hem de
   scroll-driven animation desteklemeyen tarayıcı üç açıklama bloğunu
   tamamen kaybediyordu.

   ÇÖZÜM: sahne kurulamadığında >=768 için zaten çalışan STATİK akışa
   dönülüyor — `.ce-metin/.ce-ray/.ce-masa` yeniden `display: contents`
   oluyor, duraklar ve paftalar `.ce-track` ızgarasının doğrudan ögesi
   olarak anlamlı sırayla (durak -> pafta -> durak -> pafta ...) diziliyor.

   BU BLOK YALNIZ EKLEMEDİR: yukarıdaki hiçbir kural değiştirilmedi.
   Koşullar `no-preference` + `supports` dalıyla karşılıklı dışlayıcı
   olduğu için normal hareket koreografisi ve 5510af9 CLS düzeltmesi
   bu bloktan hiç etkilenmiyor. Bedeli, iki koşulu CSS'te VEYA ile
   birleştirmek mümkün olmadığı için kural listesinin iki kez yazılması.
   ======================================================================= */

@media (min-width: 1280px) and (prefers-reduced-motion: reduce) {
  .ce { min-height: auto; }

  .ce-track {
    min-height: auto;
    grid-template-rows: auto;
    align-items: start;
  }

  .ce-metin,
  .ce-ray,
  .ce-masa { display: contents; }

  .ce-durak {
    display: grid;
    grid-column: 1 / 7;
  }

  .ce-durak--son {
    position: static;
    width: auto;
    grid-column: 1 / 7;
  }

  .ce-pafta {
    position: relative;
    width: 100%;
    height: auto;
    inset: auto;
    grid-column: 6 / 13;
  }

  .ce-pafta--2 { grid-column: 7 / 12; }

  /* Sahneye bağlı SVG katmanı: mutlak konumlu, sahnesiz anlamı yok. */
  .ce-hedef,
  .ce-kalibrasyon,
  .ce-baglanti,
  .ce-final-label,
  .ce-eksen { display: none; }

  .ce-h2 { font-size: clamp(4rem, 5vw, 6.4rem); }
  .ce-h3 { font-size: clamp(2.7rem, 3.4vw, 4rem); }
  .ce-sonuc { font-size: clamp(4rem, 4.6vw, 6rem); }
}

@supports not (animation-timeline: view()) {
  @media (min-width: 1280px) {
    .ce { min-height: auto; }

    .ce-track {
      min-height: auto;
      grid-template-rows: auto;
      align-items: start;
    }

    .ce-metin,
    .ce-ray,
    .ce-masa { display: contents; }

    .ce-durak {
      display: grid;
      grid-column: 1 / 7;
    }

    .ce-durak--son {
      position: static;
      width: auto;
      grid-column: 1 / 7;
    }

    .ce-pafta {
      position: relative;
      width: 100%;
      height: auto;
      inset: auto;
      grid-column: 6 / 13;
    }

    .ce-pafta--2 { grid-column: 7 / 12; }

    .ce-hedef,
    .ce-kalibrasyon,
    .ce-baglanti,
    .ce-final-label,
    .ce-eksen { display: none; }

    .ce-h2 { font-size: clamp(4rem, 5vw, 6.4rem); }
    .ce-h3 { font-size: clamp(2.7rem, 3.4vw, 4rem); }
    .ce-sonuc { font-size: clamp(4rem, 4.6vw, 6rem); }
  }
}

/* ==========================================================================
   REDUCED MOTION
   ======================================================================= */

@media (prefers-reduced-motion: reduce) {
  .ce-bag span:last-child {
    transition: none;
  }

  .ce-bag:hover span:last-child {
    transform: none;
  }
}
</style>
