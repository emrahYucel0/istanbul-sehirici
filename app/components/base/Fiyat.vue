<script setup>
/**
 * QUOTE PRESS — "FİYAT SÖYLENMEZ, ÜRETİLİR"
 * --------------------------------------------------------------------------
 * Bölümün ana denklemi:
 *
 *   01
 *   02
 *   03  ──► OPERASYON PLANI ──► FİYAT
 *   04
 *   05
 *
 * Ama bu bir flowchart olarak çizilmez.
 * Desktop'ta beş girdi ayrı baskı şeritleri gibi merkeze girer,
 * merkezdeki "PLAN" plakası onları mekanik olarak toplar ve finalde
 * sağ tarafta dev FİYAT çıktısı açılır.
 *
 * Amaç:
 * "telefonda tek rakam" algısını kırmak;
 * fiyatın, koşulların sentezinden üretildiğini fiziksel olarak göstermek.
 *
 * CMS sözleşmesi korunur:
 * - bolum.heading
 * - bolum.lead
 * - bolum.items[].label
 * - bolum.items[].body
 *
 * Sabit public rotalar korunur:
 * - /fiyat-hesaplama
 * - /iletisim
 *
 * Desktop: 300vh sticky signature scene
 * Tablet / mobil: pin yok, normal akış
 * Ek JS / GSAP yok.
 */

const props = defineProps({
  bolum: { type: Object, required: true },
})

const faktorler = computed(() =>
  (props.bolum.items || []).map((o, i) => ({
    no: String(i + 1).padStart(2, '0'),
    etiket: o.label,
    metin: o.body,
    index: i,
  })),
)

const toplam = computed(() => faktorler.value.length)
</script>

<template>
  <section class="qp" aria-labelledby="fiyat-baslik">
    <div class="qp-track sahne-alan">
      <!-- ================================================================
           HEADER
           ================================================================ -->
      <header class="qp-head">
        <div class="qp-kunye">
          <span>04 / KARAR VERMEDEN ÖNCE</span>
        </div>

        <div class="qp-head-grid">
          <h2 id="fiyat-baslik" class="qp-h2">
            {{ bolum.heading }}
          </h2>

          <p class="qp-lead">
            {{ bolum.lead }}
          </p>
        </div>
      </header>

      <!-- ================================================================
           QUOTE PRESS / DESKTOP MACHINE
           ================================================================ -->
      <div class="qp-machine">
        <!-- sol giriş kayıtları -->
        <dl class="qp-inputs">
          <div
            v-for="f in faktorler"
            :key="f.etiket"
            class="qp-input"
            :class="`qp-input--${f.index + 1}`"
            :style="`--i:${f.index}; --count:${toplam}`"
          >
            <dt class="qp-input-head">
              <span class="qp-input-no" aria-hidden="true">{{ f.no }}</span>
              <span class="qp-input-label">{{ f.etiket }}</span>
            </dt>

            <dd class="qp-input-body">
              {{ f.metin }}
            </dd>

            <!-- desktop feed line -->
            <span class="qp-feed" aria-hidden="true">
              <span></span>
            </span>
          </div>
        </dl>

        <!-- merkez baskı plakası -->
        <div class="qp-press" aria-label="Fiyatın oluşum süreci">
          <span class="qp-press-top" aria-hidden="true"></span>

          <div class="qp-press-plate">
            <span class="qp-press-small">OPERASYON</span>
            <strong class="qp-press-main">PLAN</strong>
          </div>

          <span class="qp-press-bottom" aria-hidden="true"></span>

          <!-- basınç çizgileri -->
          <span class="qp-pressure qp-pressure--1" aria-hidden="true"></span>
          <span class="qp-pressure qp-pressure--2" aria-hidden="true"></span>
          <span class="qp-pressure qp-pressure--3" aria-hidden="true"></span>
        </div>

        <!-- output shaft -->
        <div class="qp-output" aria-hidden="true">
          <span class="qp-output-line"></span>
          <span class="qp-output-arrow">→</span>
        </div>

        <!-- sonuç -->
        <div class="qp-price">
          <strong class="qp-price-word">FİYAT</strong>
          <span class="qp-price-note">KOŞULLARDAN ÜRETİLİR</span>
        </div>

      </div>

      <!-- ================================================================
           CTA / DECISION
           ================================================================ -->
      <div class="qp-actions">
        <p class="qp-actions-copy">
          Yaklaşık bir aralık için hesaplama aracını kullanabilir;
          taşımanın gerçek koşullarını netleştirmek için doğrudan bize
          ulaşabilirsiniz.
        </p>

        <div class="qp-action-links">
          <NuxtLink to="/fiyat-hesaplama" class="qp-action qp-action--primary">
            <span class="qp-action-main">Fiyat hesapla</span>
            <span class="qp-action-arrow" aria-hidden="true">↗</span>
          </NuxtLink>

          <NuxtLink to="/iletisim" class="qp-action">
            <span class="qp-action-main">Koşulları konuş</span>
            <span class="qp-action-arrow" aria-hidden="true">↗</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ==========================================================================
   QUOTE PRESS
   ======================================================================= */

.qp {
  --qp-paper: rgb(var(--c-paper));
  --qp-paper-2: rgb(var(--c-paper-sunken));
  --qp-ink: rgb(var(--c-ink));
  --qp-soft: rgb(var(--c-ink-soft));
  --qp-rule: rgb(var(--c-rule));
  --qp-measure: rgb(var(--c-measure));
  --qp-signal: rgb(var(--c-signal));
  --qp-signal-deep: rgb(var(--c-signal-deep));

  position: relative;
  overflow: clip;
  background: var(--qp-paper);
  color: var(--qp-ink);
}

.qp-track {
  position: relative;
  padding-block: var(--sahne-dikey);
  display: grid;
  gap: clamp(2.5rem, 5vw, 5rem);
}

/* ==========================================================================
   HEADER
   ======================================================================= */

.qp-head {
  display: grid;
  gap: clamp(1.6rem, 3.5vw, 3rem);
}

.qp-kunye {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--qp-rule);
  font-family: var(--f-mono);
  font-size: 0.625rem;
  line-height: 1.2;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--qp-soft);
}

.qp-kunye span:last-child {
  text-align: right;
}

.qp-head-grid {
  display: grid;
  gap: 1.6rem;
}

.qp-h2 {
  margin: 0;
  max-width: 11ch;
  font-family: var(--f-display, var(--f-sans));
  font-size: clamp(3rem, 12.5vw, 6rem);
  font-weight: 790;
  line-height: 0.89;
  letter-spacing: -0.065em;
  text-wrap: balance;
}

.qp-lead {
  margin: 0;
  max-width: 52ch;
  font-size: clamp(1rem, 0.95rem + 0.3vw, 1.15rem);
  line-height: 1.56;
  color: var(--qp-soft);
  text-wrap: pretty;
}

/* ==========================================================================
   MOBILE / DEFAULT MACHINE
   ======================================================================= */

.qp-machine {
  position: relative;
  display: grid;
  gap: 2rem;
}

.qp-inputs {
  margin: 0;
  padding: 0;
}

.qp-input {
  position: relative;
  padding: 1.3rem 0 1.5rem;
  border-top: 1px solid var(--qp-rule);
}

.qp-input:last-child {
  border-bottom: 1px solid var(--qp-rule);
}

.qp-input-head {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: baseline;
  margin: 0;
  font-family: var(--f-mono);
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.qp-input-no {
  color: var(--qp-signal);
}

.qp-input-label {
  color: var(--qp-ink);
}

.qp-input-body {
  margin: 0.55rem 0 0;
  max-width: 54ch;
  font-size: 0.92rem;
  line-height: 1.52;
  color: var(--qp-soft);
}

.qp-feed {
  display: block;
  width: min(13rem, 48vw);
  height: 1px;
  margin-top: 0.75rem;
  background: var(--qp-measure);
}

.qp-feed > span {
  display: block;
  width: 26%;
  height: 1px;
  background: var(--qp-signal);
}

/* ==========================================================================
   PRESS
   ======================================================================= */

.qp-press {
  position: relative;
  min-height: 15rem;
  display: grid;
  place-items: center;
  border-top: 1px solid var(--qp-rule);
  border-bottom: 1px solid var(--qp-rule);
}

.qp-press-top,
.qp-press-bottom {
  position: absolute;
  left: 50%;
  width: 1px;
  height: 2.5rem;
  background: var(--qp-measure);
}

.qp-press-top {
  top: 0;
}

.qp-press-bottom {
  bottom: 0;
}

.qp-press-plate {
  position: relative;
  z-index: 2;
  width: min(12rem, 48vw);
  aspect-ratio: 1;
  display: grid;
  place-content: center;
  justify-items: center;
  border: 1px solid var(--qp-signal);
  background: var(--qp-paper);
  text-align: center;
}

.qp-press-small,
.qp-press-code {
  font-family: var(--f-mono);
  text-transform: uppercase;
}

.qp-press-small {
  font-size: 0.56rem;
  letter-spacing: 0.1em;
  color: var(--qp-soft);
}

.qp-press-main {
  margin-top: 0.4rem;
  font-family: var(--f-display, var(--f-sans));
  font-size: clamp(3rem, 15vw, 5.5rem);
  line-height: 0.78;
  letter-spacing: -0.07em;
}

.qp-press-code {
  margin-top: 0.65rem;
  font-size: 0.5rem;
  letter-spacing: 0.09em;
  color: var(--qp-signal);
}

.qp-pressure {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  height: 1px;
  background: var(--qp-rule);
}

.qp-pressure--1 {
  width: 70%;
  top: 33%;
}

.qp-pressure--2 {
  width: 85%;
  top: 50%;
}

.qp-pressure--3 {
  width: 70%;
  top: 67%;
}

/* ==========================================================================
   OUTPUT / PRICE
   ======================================================================= */

.qp-output {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qp-output-line {
  flex: 1;
  height: 1px;
  background: var(--qp-signal);
}

.qp-output-arrow {
  color: var(--qp-signal);
  font-size: 1.5rem;
  line-height: 1;
}

.qp-price {
  padding-block: 1rem 0;
  border-top: 1px solid var(--qp-signal);
}

.qp-price-kunye,
.qp-price-note {
  display: block;
  font-family: var(--f-mono);
  font-size: 0.56rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.qp-price-kunye {
  color: var(--qp-signal);
}

.qp-price-word {
  display: block;
  margin-top: 0.5rem;
  font-family: var(--f-display, var(--f-sans));
  font-size: clamp(5.2rem, 24vw, 10rem);
  font-weight: 800;
  line-height: 0.72;
  letter-spacing: -0.08em;
}

.qp-price-note {
  margin-top: 0.8rem;
  color: var(--qp-soft);
}

.qp-equation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--qp-rule);
  font-family: var(--f-mono);
  font-size: 0.5rem;
  letter-spacing: 0.08em;
  color: var(--qp-soft);
}

.qp-equation span:nth-child(2),
.qp-equation span:nth-child(4) {
  color: var(--qp-signal);
}

.qp-mark {
  display: none;
}

/* ==========================================================================
   ACTIONS
   ======================================================================= */

.qp-actions {
  display: grid;
  gap: 1.5rem;
  padding-top: clamp(2rem, 4vw, 3.5rem);
  border-top: 1px solid var(--qp-rule);
}

.qp-actions-copy {
  margin: 0;
  max-width: 48ch;
  font-size: clamp(1rem, 0.95rem + 0.3vw, 1.125rem);
  line-height: 1.55;
  color: var(--qp-soft);
}

.qp-action-links {
  display: grid;
  gap: 0;
  border-top: 1px solid var(--qp-measure);
}

.qp-action {
  position: relative;
  min-height: 5.5rem;
  padding: 1rem 0;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "meta arrow"
    "main arrow";
  align-items: center;
  gap: 0.15rem 1rem;
  border-bottom: 1px solid var(--qp-rule);
  color: inherit;
  text-decoration: none;
}

.qp-action-meta {
  grid-area: meta;
  font-family: var(--f-mono);
  font-size: 0.54rem;
  letter-spacing: 0.09em;
  color: var(--qp-soft);
}

.qp-action-main {
  grid-area: main;
  font-size: clamp(1.15rem, 1rem + 0.7vw, 1.45rem);
  font-weight: 650;
}

.qp-action-arrow {
  grid-area: arrow;
  color: var(--qp-signal);
  font-size: 1.6rem;
  transition: transform 180ms ease-out;
}

.qp-action:hover .qp-action-arrow,
.qp-action:focus-visible .qp-action-arrow {
  transform: translate(0.25rem, -0.25rem);
}

.qp-action:focus-visible {
  outline: 2px solid var(--qp-ink);
  outline-offset: 4px;
}

/* ==========================================================================
   TABLET
   ======================================================================= */

@media (min-width: 768px) and (max-width: 1279px) {
  .qp-head-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: end;
  }

  .qp-h2 {
    grid-column: 1 / 8;
    font-size: clamp(4.5rem, 8vw, 7rem);
  }

  .qp-lead {
    grid-column: 8 / 13;
    align-self: end;
    margin-bottom: 0.4rem;
  }

  .qp-machine {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }

  .qp-inputs {
    grid-column: 1 / 7;
  }

  .qp-press {
    grid-column: 8 / 13;
    min-height: 100%;
  }

  .qp-output {
    grid-column: 7 / 9;
    align-self: center;
  }

  .qp-price {
    grid-column: 9 / 13;
    align-self: center;
  }

  /*
    "FİYAT" PUNTOSU BU BANTTA KENDİ YUVASINA GÖRE — ÖLÇÜLEREK.

    Bu aralıkta (768–1279) `.qp-price` on iki kolonun son DÖRDÜNE
    yerleşiyor, yani makinenin yaklaşık %29'una. Punto ise taban
    (mobil) kuralından geliyordu: `clamp(5.2rem, 24vw, 10rem)` burada
    tavana çarpıp 160px'de sabitleniyor — oysa o değer tek kolonlu
    mobil yerleşim için ayarlı.

    Ölçüldü (kelimenin kendi kabından taşması):
      768  → yuva 222px, glif 409px → 156px TAŞMA ✖
      834  → yuva 242px, glif 409px → 134px TAŞMA ✖
      1000 → yuva 293px, glif 409px →  78px TAŞMA ✖
      1024 → yuva 300px, glif 409px →  70px TAŞMA ✖
      1100 → yuva 323px, glif 409px →  45px TAŞMA ✖
    Belge yatay taşması 0 olduğu için otomatik denetim bunu görmüyordu;
    kırpılma bileşenin KENDİ kabında oluyordu.

    Yuva ≈ 0,29 × viewport ve glif ≈ 2,56 × punto olduğundan yuvaya
    oturan punto ≈ 11vw. Kelime küçültülmedi, YUVASINA getirildi:
    bu bantta hâlâ bölümün en büyük tipografik öğesi.

    ≤767 (tek kolon) ve ≥1280 (geniş makine ızgarası) kuralları
    DEĞİŞMEDİ; ikisi de zaten sığıyordu.
  */
  .qp-price-word {
    font-size: clamp(5rem, 11vw, 9.5rem);
  }

  .qp-equation {
    grid-column: 1 / 13;
  }

  .qp-actions {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }

  .qp-actions-copy {
    grid-column: 1 / 6;
  }

  .qp-action-links {
    grid-column: 7 / 13;
  }
}

/* ==========================================================================
   DESKTOP STATIC FALLBACK
   ======================================================================= */

@media (min-width: 1280px) {
  .qp-track {
    min-height: calc(100vh - var(--sahne-navbar));
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-rows: auto minmax(0, 1fr) auto;
    column-gap: var(--sahne-kolon-arasi);
    row-gap: clamp(1rem, 2vh, 1.6rem);
    align-items: stretch;
  }

  .qp-head {
    grid-column: 1 / 13;
    grid-row: 1;
  }

  .qp-head-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: end;
  }

  .qp-h2 {
    grid-column: 1 / 7;
    max-width: 9ch;
    font-size: clamp(4rem, 5vw, 6.5rem);
  }

  .qp-lead {
    grid-column: 8 / 13;
    align-self: end;
    margin-bottom: 0.4rem;
  }

  .qp-machine {
    grid-column: 1 / 13;
    grid-row: 2;
    position: relative;
    display: grid;
    grid-template-columns:
      minmax(0, 5.2fr)
      minmax(12rem, 2.2fr)
      minmax(3rem, 0.8fr)
      minmax(0, 3.8fr);
    column-gap: clamp(1.5rem, 2.6vw, 3.2rem);
    align-items: stretch;
    min-height: 0;
  }

  .qp-inputs {
    position: relative;
    display: grid;
    grid-template-rows: repeat(5, minmax(0, 1fr));
    min-height: 0;
  }

  .qp-input {
    min-height: 0;
    padding: 0.65rem 0;
    display: grid;
    grid-template-columns: minmax(8rem, 0.8fr) minmax(0, 1.4fr);
    gap: 1.1rem;
    align-items: center;
    border-top: 1px solid var(--qp-rule);
  }

  .qp-input-body {
    margin: 0;
    max-width: 36ch;
    font-size: 0.84rem;
  }

  .qp-feed {
    position: absolute;
    top: 50%;
    left: 100%;
    width: clamp(1.5rem, 2.6vw, 3.2rem);
    margin: 0;
    transform: translateY(-50%);
    background: var(--qp-measure);
  }

  .qp-feed > span {
    width: 100%;
  }

  .qp-press {
    min-height: 0;
    height: 100%;
    border: 0;
  }

  .qp-press-plate {
    width: min(100%, 13rem);
  }

  .qp-output {
    align-self: center;
    display: flex;
  }

  .qp-price {
    align-self: center;
    border-top: 0;
    padding: 0;
  }

  .qp-price-word {
    font-size: clamp(7rem, 9vw, 12rem);
  }

  .qp-equation {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0.15rem;
    padding-top: 0.55rem;
  }

  .qp-mark {
    display: block;
    position: absolute;
    width: 1rem;
    height: 1rem;
    pointer-events: none;
  }

  .qp-mark::before,
  .qp-mark::after {
    content: "";
    position: absolute;
    background: var(--qp-measure);
  }

  .qp-mark::before {
    top: 0;
    left: 0;
    width: 100%;
    height: 1px;
  }

  .qp-mark::after {
    top: 0;
    left: 0;
    width: 1px;
    height: 100%;
  }

  .qp-mark--tl { top: 0; left: 0; }
  .qp-mark--tr { top: 0; right: 0; transform: scaleX(-1); }
  .qp-mark--bl { bottom: 0; left: 0; transform: scaleY(-1); }
  .qp-mark--br { right: 0; bottom: 0; transform: scale(-1); }

  .qp-actions {
    grid-column: 1 / 13;
    grid-row: 3;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    padding-top: 1rem;
  }

  .qp-actions-copy {
    grid-column: 1 / 6;
    align-self: start;
  }

  .qp-action-links {
    grid-column: 7 / 13;
  }

  .qp-action {
    min-height: 4.5rem;
  }
}

/* ==========================================================================
   DESKTOP SIGNATURE MOTION
   5 inputs feed → press closes → plan locks → price prints
   ======================================================================= */

@supports (animation-timeline: view()) {
  @media (min-width: 1280px) and (prefers-reduced-motion: no-preference) {
    .qp {
      height: 300vh;
      width: 100vw;
      max-width: none;
      margin-inline: calc(50% - 50vw);
      view-timeline-name: --qp;
      view-timeline-axis: block;
    }

    .qp-track {
      position: sticky;
      top: var(--sahne-navbar);
      width: 100vw;
      max-width: none;
      height: calc(100vh - var(--sahne-navbar));
      min-height: 0;
      /*
        GÜVENLİ ALAN — M17D'de ÖLÇÜLEN SEBEP.

        Sahnenin tipografisi `vw` ile (ve `vw`'ye bağlı kök puntoyla)
        ölçekleniyor; dikey bütçe ise `vh`. Ekran genişledikçe genişliğe
        bağlı ölçek yükseklik bütçesini yiyor. M17D'de pinli karede
        ölçülen üst nefes:

          3440x1440 -> 22px    2560x1440 -> 22px
          1920x1080 -> 16px    1440x900  -> 13px

        Yani başlık, navbar'ın 22px altından başlıyordu: 1440px'lik bir
        ekranda %1,5. Bu bir tasarım kararı değil, eski
        `clamp(0.9rem, 1.6vh, 1.3rem)` değerinin artığıydı. Navbar'ın
        gerçek yüksekliğindeki en ufak sapma (daha uzun marka satırı,
        alt piksel yuvarlama) künyeyi ve başlığın ilk satırını barın
        altına sokuyordu.

        Yeni değer güvenli alanı YALNIZ bütçe olan yerde büyütür.
        `calc(6vh - 40px)` düz `vh` değil; kısa ekranda sıfıra yakın,
        uzun ekranda cömert:

          1440 -> 46px   1200 -> 32px   1080 -> 25px   900 -> 14px

        900px'de eski değerle (14,4px) neredeyse aynı kalıyor; çünkü
        orada makinenin verecek yeri yok — ölçüldü: `.qp-inputs` 900'de
        zaten 10px taşıyordu, oradan yer çalmak kırpmayı büyütürdü.
        Uzun ekranda kazanılan yer `.qp-input` satır yoğunluğundan
        karşılanıyor (aşağıya bak), makine satırı içerik ihtiyacının
        altına düşmüyor.

        Kareler, bölüm yüksekliği, `animation-range`, PLAN -> FİYAT
        koreografisi ve tipografi ailesi DEĞİŞMEDİ.
      */
      padding:
        clamp(0.9rem, calc(6vh - 40px), 3.4rem)
        var(--sahne-pad)
        clamp(0.8rem, calc(5vh - 33px), 2.8rem);
      overflow: hidden;
    }

    /*
      Güvenli alanın bütçesi buradan geliyor. Statik masaüstünde satır
      dolgusu 0.65rem; pinli sahnede kök punto `vw` ile büyüdüğü için bu
      3440'ta satır başına 28,6px'e çıkıyor ve beş satır 143px yiyordu.
      Ölçülen satır içi ihtiyaç 139px'e karşı satır yüksekliği 140px'ti —
      yani makinede tek piksel bile pay yoktu (1440x900'de `.qp-inputs`
      zaten 11px taşıyordu).

      Dolgu artık yüksekliğe bağlı: 3440x1440'ta 10,4px, 1920x1080'de
      7,8px. Kazanılan yer güvenli alana gidiyor, satır metni kırpılmıyor.
    */
    /*
      KISA EKRAN: yatay yeri dikey yere çevir.

      Satır metni `36ch` ile sınırlıydı. Ölçüldü — 3440x1200'de gövde
      yuvası 470px, metin ise 335px'te kesiliyordu: 135px yatay yer boş
      dururken metin BEŞ satıra çıkıp bir alt parametrenin üstüne
      biniyordu. Ekran görüntüsüyle doğrulandı: "ekip sayısını
      belirliyor." ile "Aracın bina önüne yanaşıp yanaşamaması,"
      üst üste basılıyordu.

      Ölçülen satır taşması (M17D öncesi):
        3440x1200 -> 34px   2560x1080 -> 26px   1280x800 -> 28px
        1920x900  -> 18px   1440x900  -> 12px
        1440+ boyunda taşma yok.

      Bu yüzden koşul yüksekliğe bağlı: dikey bütçe 1200px'in altına
      indiğinde `36ch` kapağı kalkıyor, metin kendi yuvasını kullanıyor
      ve satır sayısı düşüyor. Punto, satır aralığı, metin ve kolon
      yapısı değişmiyor.
    */
    @media (max-height: 1200px) {
      .qp-input {
        grid-template-columns: minmax(7rem, 0.62fr) minmax(0, 1.85fr);
      }

      .qp-input-body {
        max-width: none;
      }
    }

    /*
      ÇOK KISA EKRAN (<=900px) — SATIRLAR EŞİT DEĞİL, İÇERİK KADAR.

      M17E'de ölçüldü. Beş satır `repeat(5, minmax(0, 1fr))` ile eşit
      bölünüyordu; oysa ihtiyaçları eşit değil:

        1280x800 -> satır boyu 66px. Dördü 67px istiyor, ama 2. satır
                    ("ERİŞİM VE KAT") gövdesi DÖRT satıra çıktığı için
                    87px istiyor. Açık 24px ve tamamı tek satırda.
        1366x768 -> beş satırın beşi 67px istiyor, 58px alıyor. Açık 47px.
        1440x900 / 1920x900 -> zaten temiz (-4 / -6 px pay).

      Yani 1280'de sorun yoğunluk değil, EŞİT BÖLÜŞÜM. `auto` satır +
      `space-between` ile uzun satır ihtiyacı kadar yer alıyor, kısa
      satırlar kalanı geri veriyor; pay varken görünüm değişmiyor
      (mevcut paylar 1-2px, yani bu ölçülerde davranış aynı).

      Açığın kalanı yoğunluktan kapatılıyor: satır dolgusu ve iz satır
      boşluğu. Gövde puntosuna (13,44px) ve satır aralığına (20,43px)
      DOKUNULMADI — okunabilirlik düşürülmedi. M17D'nin güvenli alanı
      (`padding`) da korundu.
    */
    @media (max-height: 900px) {
      /*
        `auto` DEĞİL `max-content` — ölçülmüş sebep.

        `.qp-input`ta `min-height: 0` var; bu, ızgara ögesinin otomatik
        asgari boyunu sıfırlıyor. Dolayısıyla `auto` bir iz (track)
        içeriğinin ALTINA inebiliyor: 1280x800'de `repeat(5, auto)`
        denendi ve satırlar yine 70/70/70/70/71 çıktı — yani 2. satır
        94px'lik içeriğiyle 70px'e sıkışmaya devam etti.
        `max-content` ile ölçülen sonuç: 74/94/74/74/75.
      */
      .qp-inputs {
        grid-template-rows: repeat(5, max-content);
        align-content: space-between;
      }

      .qp-input {
        padding-block: clamp(0.15rem, 0.45vh, 0.35rem);
      }

      .qp-track {
        row-gap: clamp(0.4rem, 0.85vh, 1rem);
      }

      /*
        Beş satırın içerik boyu 1280x800'de 385px; makineye 358px
        düşüyordu. Kalan 27px buradan geliyor: iki eylem bağlantısı
        78px'lik boyuyla bloğu 174px'e çıkarıyordu.

        Tek başına `min-height`i düşürmek İŞE YARAMADI — ölçüldü:
        bağlantı boyu `min-height`ten değil `padding: 1rem 0`dan
        geliyordu, 78px olarak kaldı. İkisi birlikte iniyor: hedef
        ~60px'e düşüyor, WCAG'in 44px eşiğinin hâlâ epey üstünde.
        Metin, rota, ok, hover ve odak davranışı aynı.
      */
      .qp-action {
        min-height: 3.4rem;
        padding-block: 0.45rem;
      }
    }

    .qp-head {
      gap: 0.65rem;
    }

    .qp-kunye {
      padding-top: 0;
      border-top: 0;
    }

    .qp-h2 {
      font-size: clamp(3.4rem, 4.4vw, 5.8rem);
    }

    .qp-lead {
      font-size: 0.95rem;
      line-height: 1.45;
    }

    .qp-machine {
      overflow: hidden;
    }

    /* INPUTS enter one-by-one toward press */
    .qp-input--1 { animation-name: qp-input-1; }
    .qp-input--2 { animation-name: qp-input-2; }
    .qp-input--3 { animation-name: qp-input-3; }
    .qp-input--4 { animation-name: qp-input-4; }
    .qp-input--5 { animation-name: qp-input-5; }

    .qp-input {
      transform-origin: right center;
      padding-block: clamp(0.2rem, 0.72vh, 0.5rem);
    }

    .qp-input .qp-feed > span {
      transform: scaleX(0);
      transform-origin: left center;
    }

    .qp-input--1 .qp-feed > span { animation-name: qp-feed-1; }
    .qp-input--2 .qp-feed > span { animation-name: qp-feed-2; }
    .qp-input--3 .qp-feed > span { animation-name: qp-feed-3; }
    .qp-input--4 .qp-feed > span { animation-name: qp-feed-4; }
    .qp-input--5 .qp-feed > span { animation-name: qp-feed-5; }

    /* PRESS */
    .qp-press-plate {
      animation-name: qp-press-lock;
    }

    .qp-press-top {
      animation-name: qp-press-top;
    }

    .qp-press-bottom {
      animation-name: qp-press-bottom;
    }

    .qp-pressure--1 { animation-name: qp-pressure-1; }
    .qp-pressure--2 { animation-name: qp-pressure-2; }
    .qp-pressure--3 { animation-name: qp-pressure-3; }

    /* OUTPUT */
    .qp-output-line {
      transform: scaleX(0);
      transform-origin: left center;
      animation-name: qp-output-line;
    }

    .qp-output-arrow {
      animation-name: qp-output-arrow;
    }

    .qp-price-word {
      animation-name: qp-price-print;
    }

    .qp-price-kunye,
    .qp-price-note {
      animation-name: qp-price-meta;
    }

    .qp-equation {
      animation-name: qp-equation-in;
    }

    /* ACTIONS settle after machine */
    .qp-actions {
      animation-name: qp-actions-in;
    }

    .qp-input,
    .qp-feed > span,
    .qp-press-plate,
    .qp-press-top,
    .qp-press-bottom,
    .qp-pressure,
    .qp-output-line,
    .qp-output-arrow,
    .qp-price-word,
    .qp-price-kunye,
    .qp-price-note,
    .qp-equation,
    .qp-actions {
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --qp;
      /*
        ARALIK `contain` DEĞİL — ÖLÇÜLEN SEBEP.

        `contain`, öznenin scrollport'a TAM SIĞDIĞI aralıktır. Buradaki
        özne `.qp` ve boyu 300vh; 100vh'lik bir scrollport'a hiçbir zaman
        sığmıyor. Yani aralık dejenere: ilerleme pratikte hiç yürümüyor.

        M17A'da ölçüldü — `.qp-price-word` ("FİYAT"):
          2560 → inset(0 100% 0 0)      hiç açılmadı
          1920 → inset(0 100% 0 0)      hiç açılmadı
          1440 → inset(0 11.67% 0 0)    hiç tamamlanmadı
        Yani bölümün SONUÇ okuması masaüstünde hiç basılmıyordu.

        `entry 100% → exit 0%` yapışkan yolun kendisidir:
          entry 100% = öznenin üst kenarı scrollport üstüne oturur
                       (track tam o anda pinlenir)
          exit 0%    = öznenin alt kenarı scrollport altına gelir
                       (track tam o anda pinden çıkar)
        Özne scrollport'tan uzun olduğu sürece bu aralık HER ZAMAN
        pozitif ve tam olarak 300vh - 100vh = 200vh'lik gerçek kaydırma
        mesafesine eşit. Viewport boyundan bağımsız çalışır.

        Kareler (`@keyframes`), bölüm yüksekliği, yapışkan metafor,
        metin, renk ve tipografi DEĞİŞMEDİ; yalnız ilerlemenin
        okunduğu aralık düzeltildi.
      */
      animation-range: entry 100% exit 0%;
    }

    /*
      Timeline:
      0–12   machine quiet
      12–48  five factors feed in
      48–66  press closes / PLAN locks
      66–82  output line prints
      82–92  FİYAT emerges
      92–100 final hold
    */

    @keyframes qp-input-1 {
      0%, 10% { transform: translateX(-7%) scaleX(0.96); }
      18%,100% { transform: translateX(0) scaleX(1); }
    }

    @keyframes qp-input-2 {
      0%, 16% { transform: translateX(-7%) scaleX(0.96); }
      24%,100% { transform: translateX(0) scaleX(1); }
    }

    @keyframes qp-input-3 {
      0%, 22% { transform: translateX(-7%) scaleX(0.96); }
      30%,100% { transform: translateX(0) scaleX(1); }
    }

    @keyframes qp-input-4 {
      0%, 28% { transform: translateX(-7%) scaleX(0.96); }
      36%,100% { transform: translateX(0) scaleX(1); }
    }

    @keyframes qp-input-5 {
      0%, 34% { transform: translateX(-7%) scaleX(0.96); }
      42%,100% { transform: translateX(0) scaleX(1); }
    }

    @keyframes qp-feed-1 {
      0%, 12% { transform: scaleX(0); }
      20%,100% { transform: scaleX(1); }
    }

    @keyframes qp-feed-2 {
      0%, 18% { transform: scaleX(0); }
      26%,100% { transform: scaleX(1); }
    }

    @keyframes qp-feed-3 {
      0%, 24% { transform: scaleX(0); }
      32%,100% { transform: scaleX(1); }
    }

    @keyframes qp-feed-4 {
      0%, 30% { transform: scaleX(0); }
      38%,100% { transform: scaleX(1); }
    }

    @keyframes qp-feed-5 {
      0%, 36% { transform: scaleX(0); }
      44%,100% { transform: scaleX(1); }
    }

    @keyframes qp-press-lock {
      0%, 44% {
        transform: scale(0.92);
      }
      54% {
        transform: scale(1.06);
      }
      62%,100% {
        transform: scale(1);
      }
    }

    @keyframes qp-press-top {
      0%, 46% { transform: translateY(-2.5rem); }
      58%,100% { transform: translateY(0); }
    }

    @keyframes qp-press-bottom {
      0%, 46% { transform: translateY(2.5rem); }
      58%,100% { transform: translateY(0); }
    }

    @keyframes qp-pressure-1 {
      0%, 46% { transform: translateX(-50%) scaleX(1); }
      58%,100% { transform: translateX(-50%) scaleX(0.58); }
    }

    @keyframes qp-pressure-2 {
      0%, 46% { transform: translateX(-50%) scaleX(1); }
      60%,100% { transform: translateX(-50%) scaleX(0.42); }
    }

    @keyframes qp-pressure-3 {
      0%, 46% { transform: translateX(-50%) scaleX(1); }
      58%,100% { transform: translateX(-50%) scaleX(0.58); }
    }

    @keyframes qp-output-line {
      0%, 62% { transform: scaleX(0); }
      78%,100% { transform: scaleX(1); }
    }

    @keyframes qp-output-arrow {
      0%, 67% { transform: translateX(-1rem); }
      79%,100% { transform: translateX(0); }
    }

    /*
      DİKEY KIRPMA PAYI — "FİYAT"IN NOKTASI (U+0130) İÇİN. ÖLÇÜLEN SEBEP.

      `clip-path: inset(0)` KENAR KUTUSUNA kırpar. Burada
      `line-height: 0.72` olduğu için kenar kutusu, harfin mürekkebinden
      alçak: M17E'de 3440x1440'ta ölçüldü —

        punto 198px, kenar kutusu 143px
        "I"  taban üstü mürekkep 136px
        "İ"  taban üstü mürekkep 175px   -> nokta payı 39px
        satır kutusu 683->899, kenar kutusu 720->862
        yani noktanın yaşadığı 37px'lik şerit kutunun DIŞINDA

      Sonuç: masaüstünde kelime "FIYAT" olarak basılıyordu. Kaynak metin
      her zaman doğruydu (F U+0130 Y A T) ve beş glifin beşi de
      Archivo'dan geliyordu; kayıp harf değil, kırpma kutusuydu.
      <=1279'da animasyon yok, `clip-path: none`, nokta görünüyordu —
      "mobil/iPad doğru, masaüstü yanlış" tablosunun sebebi tam olarak bu.

      Düzeltme YATAY silmeye dokunmuyor: sağ/sol değerleri (100% -> 0)
      birebir aynı. Yalnız dikey paylar negatife alındı, böylece kırpma
      dikeyde hiçbir zaman mürekkebi kesmiyor. 0.25em, ölçülen 37px'lik
      şeridi her puntoda oransal olarak kapsıyor (198px'te 49,5px).
      CSS ile nokta ÇİZİLMİYOR: ::before/::after, gölge, SVG, arka plan
      veya `content` yok — glif fontun kendi glifi.
    */
    @keyframes qp-price-print {
      0%, 73% {
        clip-path: inset(-0.25em 100% -0.06em 0);
        transform: translateX(-1.5rem);
      }
      86% {
        clip-path: inset(-0.25em 0 -0.06em 0);
        transform: translateX(0.5rem);
      }
      90%,100% {
        clip-path: inset(-0.25em 0 -0.06em 0);
        transform: translateX(0);
      }
    }

    @keyframes qp-price-meta {
      0%, 80% {
        clip-path: inset(0 100% 0 0);
        transform: translateX(-0.6rem);
      }
      91%,100% {
        clip-path: inset(0);
        transform: translateX(0);
      }
    }

    @keyframes qp-equation-in {
      0%, 84% {
        clip-path: inset(0 100% 0 0);
      }
      96%,100% {
        clip-path: inset(0);
      }
    }

    @keyframes qp-actions-in {
      0%, 86% {
        transform: translateY(2rem);
        clip-path: inset(100% 0 0 0);
      }
      96%,100% {
        transform: translateY(0);
        clip-path: inset(0);
      }
    }
  }
}

/* ==========================================================================
   ULTRAWIDE
   ======================================================================= */

@media (min-width: 1280px) and (min-aspect-ratio: 2 / 1) {
  .qp-track {
    padding-inline:
      max(var(--sahne-pad), calc((100vw - 1840px) / 2));
  }

  .qp-h2 {
    font-size: clamp(3.2rem, 3.8vw, 5.2rem);
  }

  /*
    FİYAT kelimesi kendi kolonuna sığmalı — ÖLÇÜLEN SEBEP.

    Ultrawide'da punto `10rem`e (3440'ta 220px) çıkıyordu; makinenin
    dördüncü kolonu ise sabit 516px. Kelimenin gerçek glif genişliği
    562px olduğu için son "T" `.qp-machine`ın `overflow: hidden`ı
    tarafından 46px kesiliyordu. Ekran görüntüsüyle doğrulandı ve
    M17D öncesi/sonrası ölçümde birebir aynı çıktı: bu, M17D'nin
    getirdiği bir gerileme değil, ultrawide'da baştan beri var olan
    bir kırpma.

    Tavan kolonun taşıyabildiği değere çekildi (9rem -> 198px, glif
    505px). Kelime bölümün en büyük tipografik ögesi olmaya devam
    ediyor; `clip-path` açılımı, kareler ve sıralama değişmedi.
  */
  .qp-price-word {
    font-size: clamp(7rem, 7.5vw, 9rem);
  }
}

/* ==========================================================================
   KISA EKRAN — BAŞLIĞIN DİKEY TAVANI
   ======================================================================= */

/*
  Başlık yalnız `vw` ile ölçekleniyordu. 3440x1200'de bu, 1136px'lik
  yapışkan sahnenin 336px'ini (%30) tek başına başlığa veriyor; geriye
  kalan yer beş parametre satırına bölününce satır 91px'e düşüyor,
  metnin ihtiyacı ise 121px oluyordu — satırlar birbirinin üstüne
  biniyordu (ekran görüntüsüyle doğrulandı).

  `min()` ile başlığa dikey bir tavan konuyor: genişlik ölçeği aynı,
  ama sahne kısaldığında başlık sahne boyunun %8,4'ünü geçemiyor.
  1440 ve üzeri boyda tavan hiç devreye girmiyor — o ekranlarda ölçülen
  değer zaten tavanın altında, yani 3440x1440 / 2560x1440 görünümü
  bit bazında değişmiyor.
*/
@media (min-width: 1280px) and (max-height: 1200px) {
  .qp-h2 {
    font-size: min(clamp(3.2rem, 4.4vw, 5.8rem), 8.4vh);
  }
}

/*
  <=820px BOYDA BAŞLIK TAVANI DAHA SIKI.

  M17D'nin `8.4vh` tavanı 1366x768'de 64,5px veriyor; başlık ise
  genişlikten gelen 60,1px'te kalıyor — yani tavan orada hiç devreye
  girmiyor ve üç satırlık başlık 704px'lik iznin 183px'ini yiyor.
  Beş parametre satırı için gereken 47px'in yarısı buradan çıkıyor.

  820px eşiği ölçülmüş: 900px boyda sahne zaten temiz (satır payı
  -4/-6px), 800 ve 768'de değil. Tipografi ailesi ve gövde puntosu
  değişmiyor; yalnız display başlığın dikey tavanı sahne boyuna
  bağlanıyor.
*/
@media (min-width: 1280px) and (max-height: 820px) {
  .qp-h2 {
    font-size: min(clamp(3.2rem, 4.4vw, 5.8rem), 6.6vh);
  }
}

/* ==========================================================================
   REDUCED MOTION
   ======================================================================= */

@media (prefers-reduced-motion: reduce) {
  .qp-action-arrow {
    transition: none;
  }

  .qp-action:hover .qp-action-arrow,
  .qp-action:focus-visible .qp-action-arrow {
    transform: none;
  }
}
</style>
