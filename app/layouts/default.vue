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

  <div class="ft-perde">
    <fixed-footer />
  </div>
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

/* ═══════════════════════════════════════════════════════════════════════
   ALT BİLGİ PERDESİ
   -----------------------------------------------------------------------
   NE YAPIYOR
   Alt bilgi pencerenin dibine yapışıyor ve içerik onun ÜSTÜNDEN kayıyor;
   sayfanın sonuna gelindiğinde içeriğin alt kenarı yükselip alt bilgiyi
   açığa çıkarıyor. Perde etkisi buradan geliyor — hiçbir şey animasyonla
   belirmiyor, yalnız iki katman birbirinin önünden geçiyor.

   KAPANIŞ İLE UYUMU
   Kapanış bloğu sayfanın tek koyu yüzeyi ve `#icerik`in son elemanı;
   yani açılan şey mürekkep bir perdenin altındaki kâğıt. Navbar'ın koyu
   tonu (PASS A) bundan etkilenmiyor: bar `<header>` içinde, `#icerik`in
   KARDEŞİ — yeni yığın bağlamının dışında kalıyor ve z-index 50 ile
   ikisinin de üstünde.

   ÜÇ ÇİT
   1. `#icerik` OPAK OLMAK ZORUNDA. Bölümler kendi zeminlerini veriyor ama
      aralarında kalan 1px'lik yuvarlama farkları bile alttaki alt bilgiyi
      sızdırırdı.
   2. KLAVYE ODAĞI. Alt bilgi kaydırma boyunca pencerenin dibinde duruyor
      ama içeriğin ARKASINDA; oradaki bir bağlantıya Tab'la gelindiğinde
      tarayıcı "zaten görünür" sayıp sayfayı kaydırmaz ve odak görünmez
      kalırdı. `:focus-within` odak alt bilgiye girdiği anda onu öne
      alıyor. JS gerekmiyor.
   3. YALNIZ ≥1024px. Mobilde pin yok (hareket sözleşmesi md.7); ayrıca
      iOS Safari'de adres çubuğu daralıp genişlerken yapışkan alt kenar
      titriyor. Dar ekranda alt bilgi normal akışta, bugünkü gibi.

   KISA SAYFA
   `sticky` bir öğeyi doğal konumunun YUKARISINA taşımaz. İçerik pencereden
   kısaysa alt bilgi olduğu yerde kalıyor; boşluk da bugünküyle aynı.
   ═══════════════════════════════════════════════════════════════════════ */
@media (min-width: 1024px) {
  #icerik {
    position: relative;
    z-index: 1;
    background: rgb(var(--c-paper));
  }
  .ft-perde {
    position: sticky;
    bottom: 0;
    z-index: 0;
  }
  /* `:focus-within` — `:has(:focus-visible)` DEĞİL. İkincisi yalnız klavye
     odağında tetikleniyor; fare ile tıklanan bir bağlantı da odak alıyor ve
     o an perde öne gelmezse tıklanan öğe içeriğin arkasında kalabiliyor.
     `:focus-within` ikisini de kapsıyor ve `:has()` gerektirmiyor. */
  .ft-perde:focus-within {
    z-index: 2;
  }
}
</style>
