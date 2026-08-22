<template>
  <!--
    ATLAMA BAĞLANTISI (skip link) — klavyeyle gezinen kullanıcı için.
    Sayfaya her girişte 5 menü bağlantısını tek tek geçmek zorunda
    kalınıyordu; artık ilk Tab bu bağlantıyı odaklıyor ve doğrudan içeriğe
    atlıyor (WCAG 2.4.1 "Bypass Blocks"). Yalnızca odaklanınca görünür.

    Hedef sarmalayıcı `<main>` DEĞİL çünkü <main> her sayfada yok;
    burada tanımlanan `#icerik` her düzende garanti.
  -->
  <a href="#icerik" class="skip-link">İçeriğe geç</a>

  <!--
    OKUMA İLERLEME ÇUBUĞU KALDIRILDI (`ui-scroll-progress`).
    Üç sebep, üçü de bu turun konusu:
      · Eski paletle çiziliyordu — `--c-brand-600` → `--c-accent-400`
        gradyanı, yani sayfanın en üstünde kalıcı bir yeşil şerit.
      · Navbar'ın saç teli çizgisinin ÜSTÜNDE duran ikinci bir yatay
        çizgiydi; bar "sınır" olma işini iki çizgiyle yapamaz.
      · Dekoratifti (`aria-hidden`), bilgi taşımıyordu; kaydırma konumunu
        ana sayfanın kendi koreografisi zaten anlatıyor.
    Bileşen dosyası duruyor, yalnız render edilmiyor.
  -->
  <fixed-navbar />

  <div id="icerik" tabindex="-1">
    <slot />
  </div>

  <fixed-footer />
</template>

<style scoped>
/* Klavye kullanıcısının gördüğü İLK yüzey burası. Eskiden eski yeşil
   paletle (`--c-brand-700`), yuvarlak köşeli ve gölgeliydi — yani yeni
   dilin yasakladığı üç şey birden. Şimdi barın diliyle konuşuyor: mürekkep
   zemin, köşe yok, gölge yok. */
.skip-link {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: var(--z-modal);
  padding: 0.75rem 1.25rem;
  background: rgb(var(--c-ink));
  color: rgb(var(--c-paper));
  font-weight: 600;
  /* Ekran dışında bekler; `display: none` DEĞİL çünkü o hâlde
     odaklanamaz ve bağlantı hiç işe yaramaz. */
  transform: translateY(-150%);
  transition: transform var(--dur-fast) var(--ease-out);
}

.skip-link:focus-visible {
  transform: translateY(0);
}

/* Odaklandığı anda görünmesi gereken tek öğe bu olduğu için, sarmalayıcıya
   `tabindex="-1"` yüzünden gelen tarayıcı odak halkası istenmiyor. */
#icerik:focus {
  outline: none;
}
</style>

<!-- <template>
  <a href="#icerik" class="skip-link">İçeriğe geç</a>

  <fixed-navbar />

  <div id="icerik" tabindex="-1">
    <slot />
  </div>

  <div class="footer-reveal">
    <fixed-footer />
  </div>
</template>

<style scoped>
.skip-link {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: var(--z-modal);
  padding: 0.75rem 1.25rem;
  background: rgb(var(--c-ink));
  color: rgb(var(--c-paper));
  font-weight: 600;
  transform: translateY(-150%);
  transition: transform var(--dur-fast) var(--ease-out);
}

.skip-link:focus-visible {
  transform: translateY(0);
}

#icerik:focus {
  outline: none;
}

/* ─────────────────────────────────────────────────────────────
   FOOTER REVEAL
   ───────────────────────────────────────────────────────────── */

#icerik {
  position: relative;
  z-index: 2;
}

.footer-reveal {
  position: sticky;
  bottom: 0;
  z-index: 1;
}
</style> -->
