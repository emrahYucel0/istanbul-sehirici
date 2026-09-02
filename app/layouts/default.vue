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

  <!--
    ALT BİLGİ NORMAL AKIŞTA — SARMALAYICI YOK.

    Sayfa yapısı: #icerik → (içeriğin son bloğu: ortak kapanış imzası) →
    alt bilgi. Alt bilgiye ancak sayfanın sonuna gerçekten kaydırılarak
    ulaşılıyor; içeriğin arkasından "açılan" bir perde YOK.

    Buraya sarmalayıcı bir <div> EKLEMEYİN. İki kez denendi, ikisinde de
    aynı hatayı üretti; gerekçe ve ölçümler stil bloğunda.
  -->
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

/* ═══════════════════════════════════════════════════════════════════════
   ALT BİLGİ PERDESİ KALDIRILDI — İKİ KEZ. Ölçülmüş sebep.
   -----------------------------------------------------------------------
   Burada, yalnız ≥1024px için, şu kural vardı:

       .ft-perde { position: sticky; bottom: 0; z-index: 0 }
       #icerik   { position: relative; z-index: 1; background: paper }

   Alt bilgi pencerenin dibine yapışıyor, içerik onun üstünden kayıyor ve
   sayfanın sonunda "perde açılıyordu".

   İKİNCİ DENEME de kaldırıldı. Mekanizma bir kez `.footer-reveal` adıyla,
   breakpoint sınırı olmadan geri getirildi. Ölçüldü: davranış birebir
   aynıydı — 1920'de footer.top=381 / vh=960, 390'da 138 / 844, yani alt
   bilgi yine her sayfada ve her an viewport'un içindeydi. O turda piksel
   sızıntısı 0 çıkmıştı (13.824 nokta), ama SIFIR OLMASININ SEBEBİ her
   sayfanın ilk bölümünün kendi opak zeminiydi; zeminsiz tek bir bölüm
   eklendiği gün sessizce bozulacaktı. Ada bakılmaz, mekanizmaya bakılır:
   viewport'a bağlı alt bilgi bu düzende kullanılmıyor.

   NEDEN KALDIRILDI
   Yapışkan alt bilgi HER SAYFADA, HER AN viewport'un içindeydi; yalnızca
   opak `#icerik` onu örttüğü için görünmüyordu. Ölçüldü (1920×960,
   /bolgelerimiz, TAM SAYFA YÜKLEME, scrollY = 0):

       footer.getBoundingClientRect().top = 381
       innerHeight                        = 960
       viewport ile kesişim               = 579 px

   Yani sayfanın en başındayken bile alt bilgi ekranın alt yarısındaydı.
   Rota değişiminde yeni sayfanın `#icerik` kutusu bir an pencereden kısa
   kaldığında örtü kalkıyor ve alt bilgi doğrudan görünüyordu — kullanıcının
   videoda gördüğü davranış buydu.

   NEDEN scrollY TESTİ BUNU KAÇIRDI
   Kaydırma gerçekten 0'a iniyordu; sorun kaydırmada değil YERLEŞİMDE ve
   boyama sırasındaydı. `scrollY === 0` tek başına geçerli bir ölçüt değil;
   artık `footerRect.top >= innerHeight` de ölçülüyor.

   ŞİMDİ
   Alt bilgi normal akışta: içerik → ortak kapanış imzası → alt bilgi. Ona
   ancak sayfanın sonuna gerçekten kaydırıldığında ulaşılıyor. Sayfanın
   koyu kapanışı zaten alt bilgiden önce net bir sınır çiziyor; perdenin
   anlatmaya çalıştığı "anlatı bitti" duygusunu o taşıyor.

   BİRLİKTE GİDENLER — hepsi YALNIZ perdeyi beslemek için vardı
   · `#icerik { position: relative; z-index; background }`. Zemin de
     gereksiz: gövde zemini zaten `--c-surface-muted` ve o
     `var(--c-paper)`a bağlı (tokens.css). Perde yokken `#icerik`in
     örtme görevi de yok.
   · `:focus-within { z-index }` — klavye odağının perdenin ARKASINDA
     kalmasını önlüyordu. Alt bilgi artık hiçbir şeyin arkasında değil,
     odak doğal olarak görünür. Erişilebilirlik geriye gitmiyor: bu kural
     perdenin açtığı bir yarayı kapatıyordu, kendi başına bir kazanım
     değildi.
   · `#icerik` id'si ve `tabindex="-1"` DURUYOR — atlama bağlantısının
     hedefi ve Navbar.vue:88 mobil menüde `inert` için onu seçiyor.
     `#icerik:focus { outline: none }` de duruyor, o skip-link'e ait.
   ═══════════════════════════════════════════════════════════════════════ */
</style>
