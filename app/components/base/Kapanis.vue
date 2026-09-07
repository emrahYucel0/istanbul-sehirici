<script setup>
/**
 * FINAL SIGNAL — "KÂĞIT KAPANIR / OPERASYON BAŞLAR"
 * --------------------------------------------------------------------------
 * Bu blok yeni bilgi öğretmez.
 * Bütün sayfanın görsel olarak kapanıp eyleme dönüştüğü son imzadır.
 *
 * Korunan sözleşmeler:
 * - data-yuzey="koyu" (Navbar ton değişimi için)
 * - baslik prop'u
 * - eylem prop'u
 * - KAPANIS_EYLEMI fallback'i
 * - Site Ayarları'ndan telefon
 * - telefonYolu() E.164 dönüşümü
 * - /iletisim tek birincil rota
 *
 * Tasarım kararı:
 * - sayfanın TEK koyu yüzeyi
 * - kart / panel / form / fiyat kutusu yok
 * - iki eylemden fazlası yok
 *
 * Desktop:
 * - 155vh kısa final sahnesi
 * - kâğıt iki parçaya ayrılıp koyu yüzeyi açar
 * - dev başlık alttan yukarı kilitlenir
 * - tek bakır "signal line" CTA'ya bağlanır
 * - telefon ikincil kayıt olarak finalde görünür
 *
 * Mobil/tablet:
 * - sticky yok
 * - doğrudan güçlü koyu kapanış
 *
 * Ek JS / GSAP yok.
 */

const props = defineProps({
  baslik: { type: String, required: true },
  eylem: { type: String, default: '' },
})

const eylemMetni = computed(() =>
  props.eylem?.trim() || KAPANIS_EYLEMI,
)

const { settings } = await useSiteSettings()

const phone = computed(() =>
  settings.value?.phone ||
  settings.value?.mobilePhone ||
  '',
)

const telHref = computed(() => telefonYolu(phone.value))
</script>

<template>
  <section
    class="fs"
    data-yuzey="koyu"
    aria-labelledby="kapanis-baslik"
  >
    <div class="fs-track">
      <!--
        KÂĞIT KANATLARI.
        Desktop scroll koreografisinde iki yüzey merkezden ayrılır.
        Bilgi taşımaz; mobilde render edilir ama görünmez.
      -->
      <span class="fs-paper fs-paper--top" aria-hidden="true"></span>
      <span class="fs-paper fs-paper--bottom" aria-hidden="true"></span>

      <!-- ana mesaj -->
      <div class="fs-main">
        <span class="fs-pre" aria-hidden="true">
          YETERİNCE GÖRDÜN.
        </span>

        <h2 id="kapanis-baslik" class="fs-h2">
          {{ baslik }}
        </h2>
      </div>

      <!-- final signal -->
      <div class="fs-signal" aria-hidden="true">
        <span class="fs-signal-start"></span>
        <span class="fs-signal-line"></span>
        <span class="fs-signal-end"></span>
      </div>

      <!-- iki eylem -->
      <div class="fs-actions">
        <NuxtLink
          to="/iletisim"
          class="fs-primary"
        >
          <span class="fs-action-main">
            {{ eylemMetni }}
          </span>

          <span class="fs-action-arrow" aria-hidden="true">
            ↗
          </span>
        </NuxtLink>

        <a
          v-if="phone"
          :href="telHref"
          class="fs-phone"
          :aria-label="`Telefonla arayın: ${phone}`"
        >
          <span class="fs-phone-number">
            {{ phone }}
          </span>

          <span class="fs-phone-arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>

    </div>
  </section>
</template>

<style scoped>
/* ==========================================================================
   FINAL SIGNAL
   ======================================================================= */

.fs {
  --fs-paper: rgb(var(--c-paper));
  --fs-ink: rgb(var(--c-ink));
  --fs-soft: rgb(var(--c-rule));
  --fs-measure: rgb(var(--c-measure));
  --fs-signal: rgb(var(--c-signal));

  /* METİN İÇİN AYRI BAKIR — WCAG 1.4.3
     Ölçüldü: --c-signal rgb(180,68,28), koyu yüzey rgb(27,26,24) üzerinde
     3.13:1. `.fs-pre` 10px/400 normal metin olduğu için AA eşiği 4.5.
     Grafik katmanı (signal çizgisi ve uçları) AYNI kalıyor: onlar için
     geçerli eşik 1.4.11'in 3:1'i ve 3.13 zaten geçiyor. Bu yüzden token
     global DEĞİL, yalnız metin için ayrıldı — hairline'ın tonu korunuyor. */
  --fs-signal-metin: rgb(209, 100, 56);

  position: relative;
  overflow: clip;
  background: var(--fs-ink);
  color: var(--fs-paper);
}

.fs-track {
  position: relative;
  isolation: isolate;

  max-width: var(--container-wide);
  margin: 0 auto;

  min-height: clamp(34rem, 105vw, 48rem);

  padding:
    var(--sahne-perde)
    var(--sahne-pad);

  display: grid;
  grid-template-rows:
    auto
    minmax(0, 1fr)
    auto
    auto;

  gap:
    clamp(1.5rem, 4vw, 3rem);

  align-content: stretch;
}

/* ==========================================================================
   PAPER WINGS
   ======================================================================= */

.fs-paper {
  display: none;
}

/* ==========================================================================
   KÜNYE
   ======================================================================= */

.fs-kunye {
  position: relative;
  z-index: 8;

  display: flex;
  justify-content: space-between;
  gap: 1rem;

  font-family: var(--f-mono);
  font-size: 0.5625rem;
  line-height: 1.2;
  letter-spacing: 0.1em;
  text-transform: uppercase;

  color: rgb(var(--c-rule));
}

.fs-kunye span:last-child {
  text-align: right;
}

/* ==========================================================================
   MAIN
   ======================================================================= */

.fs-main {
  position: relative;
  z-index: 7;

  align-self: end;
}

.fs-pre {
  display: block;

  margin-bottom:
    clamp(0.85rem, 2vw, 1.35rem);

  font-family: var(--f-mono);
  font-size: 0.625rem;
  line-height: 1.2;
  letter-spacing: 0.12em;
  text-transform: uppercase;

  color: var(--fs-signal-metin);
}

.fs-h2 {
  margin: 0;

  max-width: 12ch;

  font-family: var(--f-display, var(--f-sans));
  font-size:
    clamp(3.5rem, 14.5vw, 7.2rem);

  font-weight: 790;
  line-height: 0.84;
  letter-spacing: -0.07em;

  text-wrap: balance;
}

/* ==========================================================================
   SIGNAL
   ======================================================================= */

.fs-signal {
  position: relative;
  z-index: 8;

  display: grid;
  grid-template-columns:
    auto
    1fr
    auto;

  align-items: center;
  gap: 0.45rem;

  width: 100%;
}

.fs-signal-start,
.fs-signal-end {
  display: block;

  width: 0.45rem;
  height: 0.45rem;

  border: 1px solid var(--fs-signal);
}

.fs-signal-start {
  background: var(--fs-signal);
}

.fs-signal-end {
  transform: rotate(45deg);
}

.fs-signal-line {
  display: block;
  height: 1px;
  background: var(--fs-signal);
}

/* ==========================================================================
   ACTIONS
   ======================================================================= */

.fs-actions {
  position: relative;
  z-index: 10;

  display: grid;

  border-top:
    1px solid rgb(var(--c-rule) / 0.28);
}

.fs-primary,
.fs-phone {
  min-height: 5.8rem;

  padding: 1rem 0;

  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    auto;

  grid-template-areas:
    "main arrow";

  align-items: center;
  column-gap: 1rem;
  row-gap: 0;

  border-bottom:
    1px solid rgb(var(--c-rule) / 0.28);

  color: var(--fs-paper);
  text-decoration: none;

  transition:
    padding-inline 340ms cubic-bezier(0.16, 1, 0.3, 1),
    background-color 280ms ease-out;
}

.fs-action-meta {
  grid-area: meta;

  font-family: var(--f-mono);
  font-size: 0.52rem;
  line-height: 1;
  letter-spacing: 0.09em;
  text-transform: uppercase;

  color: rgb(var(--c-rule));
}

.fs-action-main,
.fs-phone-number {
  grid-area: main;

  font-family: var(--f-display, var(--f-sans));
  font-size:
    clamp(1.25rem, 4.5vw, 1.8rem);

  font-weight: 650;
  line-height: 1;
  letter-spacing: -0.025em;
}

.fs-action-arrow,
.fs-phone-arrow {
  grid-area: arrow;

  align-self: center;

  font-size:
    clamp(1.6rem, 5vw, 2.2rem);

  line-height: 1;

  transition:
    transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
}

.fs-action-arrow {
  color: var(--fs-signal);
}

.fs-phone-number {
  font-family: var(--f-mono);
  font-size:
    clamp(1rem, 3.6vw, 1.35rem);

  letter-spacing: 0.035em;

  color: rgb(var(--c-rule));
}

.fs-phone-arrow {
  color: rgb(var(--c-rule));
}

/* ==========================================================================
   ACTION INTERACTION
   ======================================================================= */

@media (hover: hover) and (pointer: fine) {
  .fs-primary:hover,
  .fs-primary:focus-visible {
    padding-inline:
      clamp(0.8rem, 1.6vw, 1.4rem);

    background:
      rgb(var(--c-paper) / 0.055);
  }

  .fs-phone:hover,
  .fs-phone:focus-visible {
    padding-inline:
      clamp(0.8rem, 1.6vw, 1.4rem);

    background:
      rgb(var(--c-paper) / 0.035);
  }

  .fs-primary:hover .fs-action-arrow,
  .fs-primary:focus-visible .fs-action-arrow {
    transform:
      translate(0.45rem, -0.45rem);
  }

  .fs-phone:hover .fs-phone-arrow,
  .fs-phone:focus-visible .fs-phone-arrow {
    transform:
      translateX(0.45rem);
  }
}

.fs-primary:focus-visible,
.fs-phone:focus-visible {
  outline: 2px solid var(--fs-paper);
  outline-offset: -4px;
}

/* ==========================================================================
   GHOST WORD
   ======================================================================= */

.fs-ghost {
  position: absolute;
  z-index: 1;

  left: 50%;
  top: 49%;

  transform:
    translate(-50%, -50%);

  width: 120%;

  font-family: var(--f-display, var(--f-sans));
  font-size:
    clamp(14rem, 58vw, 33rem);

  font-weight: 800;
  line-height: 0.68;
  letter-spacing: -0.09em;

  text-align: center;
  white-space: nowrap;

  color:
    rgb(var(--c-paper) / 0.025);

  user-select: none;
  pointer-events: none;
}

/* ==========================================================================
   FOOT
   ======================================================================= */

.fs-foot {
  position: absolute;
  z-index: 8;

  right: var(--sahne-pad);
  bottom: 0.9rem;
  left: var(--sahne-pad);

  display: flex;
  align-items: center;
  gap: 0.6rem;

  font-family: var(--f-mono);
  font-size: 0.46rem;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  color:
    rgb(var(--c-rule) / 0.7);
}

.fs-foot-line {
  flex: 1;
  height: 1px;

  background:
    rgb(var(--c-rule) / 0.22);
}

/* ==========================================================================
   MARKS
   ======================================================================= */

.fs-mark {
  position: absolute;
  z-index: 9;

  width: 1rem;
  height: 1rem;

  pointer-events: none;
}

.fs-mark::before,
.fs-mark::after {
  content: "";

  position: absolute;

  background:
    rgb(var(--c-rule) / 0.55);
}

.fs-mark::before {
  width: 100%;
  height: 1px;
}

.fs-mark::after {
  width: 1px;
  height: 100%;
}

.fs-mark--tl {
  top: 1rem;
  left: var(--sahne-pad);
}

.fs-mark--tr {
  top: 1rem;
  right: var(--sahne-pad);
  transform: scaleX(-1);
}

.fs-mark--bl {
  bottom: 1rem;
  left: var(--sahne-pad);
  transform: scaleY(-1);
}

.fs-mark--br {
  right: var(--sahne-pad);
  bottom: 1rem;
  transform: scale(-1);
}

/* ==========================================================================
   TABLET
   ======================================================================= */

@media (min-width: 768px) {
  .fs-track {
    min-height:
      clamp(39rem, 76vw, 53rem);
  }

  .fs-h2 {
    max-width: 10ch;
    font-size:
      clamp(5.5rem, 10vw, 9rem);
  }

  .fs-actions {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .fs-primary {
    border-right:
      1px solid rgb(var(--c-rule) / 0.28);
  }

  .fs-primary,
  .fs-phone {
    padding-inline:
      clamp(1rem, 2vw, 1.5rem);
  }
}

/* ==========================================================================
   DESKTOP STATIC
   ======================================================================= */

@media (min-width: 1024px) {
  .fs-track {
    max-width: none;

    min-height:
      calc(100vh - var(--sahne-navbar));

    padding:
      clamp(2rem, 4vh, 3.5rem)
      var(--sahne-pad)
      clamp(2.6rem, 5vh, 4rem);

    grid-template-columns:
      repeat(12, minmax(0, 1fr));

    grid-template-rows:
      minmax(0, 1fr)
      auto;

    column-gap:
      var(--sahne-kolon-arasi);

    row-gap:
      clamp(1.5rem, 3vh, 2.5rem);
  }

  .fs-kunye {
    grid-column: 1 / 13;
    grid-row: 1;
  }

  .fs-main {
    grid-column: 1 / 9;
    grid-row: 1;

    align-self: center;
  }

  .fs-h2 {
    max-width: 9ch;

    font-size:
      clamp(6rem, 8vw, 10rem);
  }

  .fs-signal {
    position: absolute;

    z-index: 9;

    left: var(--sahne-pad);
    right: var(--sahne-pad);

    top: 58%;

    width: auto;
  }

  .fs-actions {
    grid-column: 8 / 13;
    grid-row: 1;

    align-self: end;

    grid-template-columns: 1fr;

    border-top:
      1px solid rgb(var(--c-rule) / 0.28);
  }

  .fs-primary {
    border-right: 0;
  }

  .fs-primary,
  .fs-phone {
    min-height:
      clamp(5.4rem, 9vh, 7rem);

    padding-inline: 0;
  }

  .fs-action-main {
    font-size:
      clamp(1.5rem, 2vw, 2.15rem);
  }

  .fs-ghost {
    top: 53%;

    font-size:
      clamp(25rem, 43vw, 54rem);
  }
}

/* ==========================================================================
   DESKTOP SIGNATURE MOTION
   "paper closes / dark opens / title locks / signal runs / action remains"
   ======================================================================= */

@supports (animation-timeline: view()) {
  @media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
    .fs {
      height: 155vh;

      width: 100vw;
      max-width: none;

      margin-inline:
        calc(50% - 50vw);

      view-timeline-name: --fs;
      view-timeline-axis: block;
    }

    .fs-track {
      position: sticky;

      top: var(--sahne-navbar);

      width: 100vw;
      height:
        calc(100vh - var(--sahne-navbar));

      max-width: none;
      min-height: 0;

      overflow: hidden;
    }

    /* ---------------------------------------------------------------
       PAPER SPLIT
       ------------------------------------------------------------ */

    .fs-paper {
      display: block;

      position: absolute;
      z-index: 100;

      left: 0;
      right: 0;

      height: 50%;

      background: var(--fs-paper);

      pointer-events: none;
    }

    .fs-paper--top {
      top: 0;

      transform-origin:
        center bottom;

      animation-name:
        fs-paper-top;
    }

    .fs-paper--bottom {
      bottom: 0;

      transform-origin:
        center top;

      animation-name:
        fs-paper-bottom;
    }

    /* ---------------------------------------------------------------
       TYPOGRAPHY
       ------------------------------------------------------------ */

    .fs-pre {
      animation-name:
        fs-pre-in;
    }

    .fs-h2 {
      animation-name:
        fs-title-in;

      transform-origin:
        left bottom;
    }

    /* ---------------------------------------------------------------
       SIGNAL
       ------------------------------------------------------------ */

    .fs-signal-line {
      transform:
        scaleX(0);

      transform-origin:
        left center;

      animation-name:
        fs-signal-run;
    }

    .fs-signal-start {
      animation-name:
        fs-signal-start;
    }

    .fs-signal-end {
      animation-name:
        fs-signal-end;
    }

    /* ---------------------------------------------------------------
       ACTIONS
       ------------------------------------------------------------ */

    .fs-actions {
      animation-name:
        fs-actions-in;
    }

    .fs-primary {
      animation-name:
        fs-primary-in;
    }

    .fs-phone {
      animation-name:
        fs-phone-in;
    }

    /* ---------------------------------------------------------------
       BIND TO VIEW TIMELINE
       ------------------------------------------------------------ */

    .fs-paper--top,
    .fs-paper--bottom,
    .fs-pre,
    .fs-h2,
    .fs-signal-line,
    .fs-signal-start,
    .fs-signal-end,
    .fs-actions,
    .fs-primary,
    .fs-phone {
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --fs;
      /*
        ARALIK `contain` DEĞİL — SSS→KAPANIŞ "ÖLÜ KÂĞIT" KUSURUNUN SEBEBİ.

        `contain`, öznenin scrollport'a TAM SIĞDIĞI aralıktır. Burada özne
        `.fs` ve boyu 155vh; yapışkan ray ise ~100vh. 155vh'lik bir özne
        100vh'lik bir scrollport'a hiçbir zaman sığmıyor → aralık dejenere
        → ilerleme yürümüyor.

        Sonuç ekranda şuydu: `.fs-paper--top/bottom` perdeleri (her biri
        %50 yükseklik, z-index 100) `translateY(0)` başlangıcında TAKILI
        kalıyor ve koyu yüzeyi örtüyordu. Kullanıcı son SSS'den sonra
        neredeyse boş bir KÂĞIT ekran boyunca kaydırıyor, siyah bölüm
        gecikmeli açılıyordu. Ölçüldü (1920×1080): son satırın altından
        ilk koyu piksele 830px+ boş kâğıt.

        `entry 100% → exit 0%` yapışkan yolun kendisi: özne scrollport'tan
        uzun olduğu sürece her zaman pozitif ve tam olarak 155vh − 100vh
        = 55vh'lik gerçek kaydırma mesafesine eşit. M17B'de Fiyat bölümü
        için aynı düzeltme uygulanmıştı; kök neden aynı aileden.

        Kareler, bölüm yüksekliği, perde metaforu, tipografi, renk ve
        eylemler DEĞİŞMEDİ; yalnız ilerlemenin okunduğu aralık düzeltildi.
        `<1024` (mobil/tablet) bu bloğun dışında — orada perde hiç yok.
      */
      animation-range: entry 55% exit 0%;
    }

    /*
      0–22   paper splits
      16–42  dark field + title appear
      36–64  signal runs
      52–78  actions lock
      78–100 final hold
    */

    @keyframes fs-paper-top {
      0%, 4% {
        transform:
          translateY(0);
      }

      28%, 100% {
        transform:
          translateY(-104%);
      }
    }

    @keyframes fs-paper-bottom {
      0%, 4% {
        transform:
          translateY(0);
      }

      28%, 100% {
        transform:
          translateY(104%);
      }
    }


    @keyframes fs-pre-in {
      0%, 17% {
        clip-path:
          inset(0 100% 0 0);

        transform:
          translateX(-1rem);
      }

      36%, 100% {
        clip-path:
          inset(0);

        transform:
          translateX(0);
      }
    }

    @keyframes fs-title-in {
      0%, 18% {
        clip-path:
          inset(100% 0 0 0);

        transform:
          translateY(10%)
          scaleY(0.94);
      }

      38% {
        clip-path:
          inset(0);

        transform:
          translateY(-1%)
          scaleY(1.015);
      }

      45%, 100% {
        clip-path:
          inset(0);

        transform:
          translateY(0)
          scaleY(1);
      }
    }

    @keyframes fs-signal-run {
      0%, 37% {
        transform:
          scaleX(0);
      }

      64%, 100% {
        transform:
          scaleX(1);
      }
    }

    @keyframes fs-signal-start {
      0%, 34% {
        transform:
          scale(0);
      }

      42%, 100% {
        transform:
          scale(1);
      }
    }

    @keyframes fs-signal-end {
      0%, 57% {
        transform:
          rotate(45deg)
          scale(0);
      }

      68% {
        transform:
          rotate(45deg)
          scale(1.25);
      }

      75%, 100% {
        transform:
          rotate(45deg)
          scale(1);
      }
    }

    @keyframes fs-actions-in {
      0%, 48% {
        clip-path:
          inset(100% 0 0 0);

        transform:
          translateY(2.5rem);
      }

      72%, 100% {
        clip-path:
          inset(0);

        transform:
          translateY(0);
      }
    }

    @keyframes fs-primary-in {
      0%, 53% {
        transform:
          translateX(1.2rem);
      }

      73%, 100% {
        transform:
          translateX(0);
      }
    }

    @keyframes fs-phone-in {
      0%, 60% {
        transform:
          translateX(1.2rem);
      }

      79%, 100% {
        transform:
          translateX(0);
      }
    }


  }
}

/* ==========================================================================
   ULTRAWIDE
   ======================================================================= */

@media (min-width: 1800px) {
  .fs-track {
    padding-inline:
      max(
        var(--sahne-pad),
        calc((100vw - 1840px) / 2)
      );
  }

  .fs-signal,
  .fs-foot {
    left:
      max(
        var(--sahne-pad),
        calc((100vw - 1840px) / 2)
      );

    right:
      max(
        var(--sahne-pad),
        calc((100vw - 1840px) / 2)
      );
  }

  .fs-mark--tl,
  .fs-mark--bl {
    left:
      max(
        var(--sahne-pad),
        calc((100vw - 1840px) / 2)
      );
  }

  .fs-mark--tr,
  .fs-mark--br {
    right:
      max(
        var(--sahne-pad),
        calc((100vw - 1840px) / 2)
      );
  }

  .fs-h2 {
    font-size:
      clamp(7rem, 7.2vw, 10.8rem);
  }
}

/* ==========================================================================
   SMALL MOBILE
   ======================================================================= */

@media (max-width: 479px) {
  .fs-track {
    min-height:
      37rem;
  }

  .fs-kunye {
    align-items: flex-start;
  }

  .fs-kunye span:last-child {
    max-width: 12ch;
  }

  /* KIRPMA DÜZELTMESİ — ölçümle belirlendi, tercihle değil.
     15vw'de en uzun kelime ("netleştirebiliriz.") satır kutusuna sığmıyordu;
     `.fs` overflow:clip olduğu için taşan kısım GERÇEKTEN kesiliyordu:
     440'ta ink 453 / klip 440, 390'da 403/390, 360'ta 373/360 — üçünde de
     13px. Görünen zarar: başlığın son noktası kayboluyor, "z" yarım kalıyor,
     iki ↗ oku üçte iki oranında kesiliyor.

     En uzun kelimenin min-content'i ile `.fs-track` içerik kutusu dokuz
     genişlikte ikili aramayla karşılaştırıldı; hepsinde geçerli azami değer
     13.375vw çıktı (en dar nokta 320px). 13vw en dar yerde 1.2px, en geniş
     yerde 4.1px pay bırakıyor.

     Alt sınır da düşürüldü: 3.2rem (51.2px) 375px'in altında TEK BAŞINA
     taşma üretiyordu (320'de güvenli azami 42.8px). 2.4rem 320-479
     aralığında hiç devreye girmiyor, yalnız 320 altı için güvenlik payı.

     >=480 DOKUNULMADI: orada kelime yalnız sağ dolguyu yiyor, klip sınırını
     aşmıyor (767'de ink 758.5 / klip 767). */
  .fs-h2 {
    font-size:
      clamp(2.4rem, 13vw, 5.3rem);
  }

  .fs-ghost {
    top: 47%;
  }
}

/* ==========================================================================
   REDUCED MOTION
   ======================================================================= */

@media (prefers-reduced-motion: reduce) {
  .fs-primary,
  .fs-phone,
  .fs-action-arrow,
  .fs-phone-arrow {
    transition: none;
  }

  .fs-primary:hover .fs-action-arrow,
  .fs-primary:focus-visible .fs-action-arrow,
  .fs-phone:hover .fs-phone-arrow,
  .fs-phone:focus-visible .fs-phone-arrow {
    transform: none;
  }
}
</style>
