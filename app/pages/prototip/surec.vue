<script setup>
/**
 * KONTROLLÜ PROTOTİP — "Süreç" sahne bölümü.
 *
 * BU SAYFA ÜRÜNÜN PARÇASI DEĞİL. Paylaşılan hiçbir bileşene, token'a veya
 * ana sayfaya dokunmuyor; tamamen kendi içinde. Amacı final UI üretmek değil,
 * sekiz hipotezi sınamak (bkz. rapor).
 *
 * Palet, tipografi ve kompozisyon burada YERELDİR — `assets/css/tokens.css`
 * değiştirilmedi, çünkü o dosya canlı sitenin tasarımını taşıyor.
 *
 * TİPOGRAFİ NOTU: prototipte Archivo/JetBrains Mono yüklenmiyor. Karakter
 * katmanı sistem monospace yığınıyla sınanıyor — test edilen şey fontun
 * kendisi değil, ölçü/etiket dilinin DOĞRU YOĞUNLUKTA olup olmadığı. Font
 * kararı ayrı ve sonra.
 *
 * İÇERİK NOTU: veritabanındaki adım açıklamaları ~400 karakter. Bir sahne
 * yuvasına sığmıyorlar. Prototipte her adımın GİRİŞ CÜMLESİ kullanılıyor.
 * Bu, raporda ayrıca değerlendirilmesi gereken bir bulgu: ya sahne "giriş +
 * altında tam metin" olarak kurulur, ya da bu içerik için sahne yanlış
 * kompozisyondur.
 */
definePageMeta({ layout: false })

useHead({
  title: 'Prototip — Süreç sahnesi',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

/**
 * Görsel yolları DEĞİŞKENDE tutuluyor, şablonda düz metin olarak değil.
 * Sebebi: `/yuklemeler/` derleme zamanında var olan bir klasör değil —
 * dosyalar çalışma anında bir Nitro rotasıyla sunuluyor. Şablona düz
 * `src="/yuklemeler/…"` yazıldığında Vite bunu statik bir varlık import'u
 * sanıp çözmeye çalışıyor ve derleme UNRESOLVED_IMPORT ile kırılıyor.
 * Bağlamalı `:src` bu çözümlemeyi devre dışı bırakıyor.
 */
const FOTO_A = '/yuklemeler/evden-eve-asansorlu-nakliyat-hizmeti-gorseli-2ad1d9-1024.webp'
const FOTO_B = '/yuklemeler/anasayfa-mobilya-nakliyat-gorseli-8267b1-1024.webp'

/**
 * GEÇİCİ TEŞHİS MODU — kaldırılacak.
 *
 * `?durum=0|62|100` ile kompozisyon scroll'dan BAĞIMSIZ olarak sabitlenir.
 * Amaç, "tasarlanan geometri" ile "tarayıcının çizdiği geometri" arasındaki
 * farkı ayırmak: sabit durumlar doğruysa sorun zaman ekseninde, değilse
 * geometri/clip kurgusundadır.
 *
 * `clip-path` DÜZEN GEOMETRİSİNİ DEĞİŞTİRMEZ — figure her durumda tam kutu
 * kalır, yalnız boyanan alan değişir. Bu yüzden `getBoundingClientRect`
 * ile ölçmek işe yaramaz; doğrulama ekran görüntüsüyle yapılıyor.
 */
const route = useRoute()

const teshisDurumu = computed(() => {
  const d = String(route.query.durum ?? '')
  return ['0', '62', '100'].includes(d) ? d : null
})

// Gerçek içerikten alınan giriş cümleleri (prototipte kısaltılmış hâl).
//
// İLK ADIMIN BAŞLIĞI DEĞİŞTİ. Eskiden "Ücretsiz Keşif ve Planlama"
// diyordu. Bu sayfa `noindex` ve sitemap dışında ama adresi bilen herkese
// açık; doğrulanmamış bir ücret taahhüdünün burada durmasının bir sebebi
// yok. Sayfa bir HAREKET referansı, metin onun konusu değil.
//
// AYNI GEREKÇEYLE 04'TEKİ "hasarsız" ÇIKARILDI: teslimde neyin kontrol
// edildiğini anlatmak başka, hasarsız geldiğini taahhüt etmek başka.
const adimlar = [
  {
    no: '01',
    baslik: 'Keşif ve Planlama',
    metin:
      'Süreç, telefonda veya WhatsApp üzerinden bize ulaşmanızla başlar. Kısa bir görüşmenin ardından taşınacağınız eve bir uzmanımız gelir; hacmi, kat durumunu ve özel taşıma gerektiren eşyaları yerinde inceler.',
  },
  {
    no: '02',
    baslik: 'Profesyonel Paketleme',
    metin:
      'Taşıma tarihine birkaç gün kala paketleme ekibimiz evinize gelir. Kırılacak eşyalar köpük dolgu ve özel kutularla paketlenir; her kutu hangi odaya ait olduğunu gösterecek şekilde etiketlenir.',
  },
  {
    no: '03',
    baslik: 'Yükleme ve Taşıma',
    metin:
      'Taşıma günü ekip ve araç anlaşılan saatte adresinizde olur. Eşyalar sistematik bir sırayla ve sabitlenerek yüklenir. Yüksek katlı binalarda gerekiyorsa asansörlü nakliyat sistemi devreye girer.',
  },
  {
    no: '04',
    baslik: 'Teslimat ve Yerleştirme',
    metin:
      'Yeni adresinize ulaşıldığında eşyalar etiketlere göre ilgili odalara taşınır, demonte edilen mobilyalar tekrar monte edilir. Teslimde eşyaların sayımı ve durumu birlikte kontrol edilir.',
  },
]
</script>

<template>
  <main class="pr" :class="teshisDurumu ? `pr--sabit pr--d${teshisDurumu}` : null">
    <!-- ── Minimum bağlam: sahneyi tek başına değil, akış içinde görebilmek için ── -->
    <header class="pr-ust">
      <p class="pr-kunye">PROTOTİP / SAHNE 01 / SÜREÇ</p>
      <h1 class="pr-h1">Kadro sabit, yerleşim değişir.</h1>
      <p class="pr-giris">
        Aşağıdaki bölüm bir değerlendirme prototipidir. Sahnedeki parçalar
        baştan sona aynıdır; hiçbiri dışarıdan gelmez, yalnızca ağırlık yer
        değiştirir.
      </p>
    </header>

    <!-- ── SAHNE ──────────────────────────────────────────────────────────
         Yapı üç katmanda:
           .pr-sahne-kap   scroll mesafesini taşıyan uzun kap (masaüstünde)
           .pr-sahne       yapışkan çerçeve
           içindekiler     RAY · GÖRSEL · METİN

         VARSAYILAN DÜZEN NORMAL AKIŞTIR. Sahne davranışı yalnızca
         `@supports` + `prefers-reduced-motion: no-preference` altında
         devreye giriyor. Yani desteklemeyen tarayıcı, hareket istemeyen
         kullanıcı ve JS'siz durum aynı okunabilir listeyi alıyor —
         iyileştirme opt-in, gizleme opt-out değil.
    -->
    <section class="pr-sahne-kap" aria-labelledby="surec-baslik">
      <div class="pr-sahne">
        <h2 id="surec-baslik" class="pr-h2">Taşınma sürecimiz nasıl işliyor?</h2>

        <!-- ÖLÇÜ RAYI — karakter katmanı.
             İlerleme çubuğu DEĞİL: çizgi her zaman tam çizili, çünkü bir
             ölçek. Değişen şey hangi basamağın "çağrıldığı" — aktif
             basamakta mimari ölçü çizgisi gibi yatay bir kol açılıyor.
             Bilgiyi metin zaten taşıdığı için dekoratif sayılıyor. -->
        <div class="pr-ray" aria-hidden="true">
          <span class="pr-ray-cizgi"></span>
          <span v-for="(a, i) in adimlar" :key="a.no" class="pr-ray-tik" :style="`--i:${i}`">
            <span class="pr-ray-kol"></span>
            <span class="pr-ray-no">{{ a.no }}</span>
          </span>
        </div>

        <!-- GÖRSEL ALANI — sabit kutu, içindeki iki fotoğrafın payı değişiyor.
             A: cephede dikey hareket (çıkış) · B: yatay taşıma (varış).
             İkisi de %0'da mevcut; B başlangıçta dar bir dilim. -->
        <div class="pr-gorsel">
          <figure class="pr-a">
            <img
              :src="FOTO_A"
              alt="Asansörlü sistemle bina cephesinden eşya indirilmesi"
              width="1024"
              height="687"
              decoding="async"
            />
          </figure>
          <figure class="pr-b">
            <img
              :src="FOTO_B"
              alt="Üniformalı iki nakliyeci mobilyayı yeni adrese yerleştiriyor"
              width="1024"
              height="572"
              decoding="async"
            />
          </figure>
        </div>

        <!-- METİN — dört adımın tamamı DOM'da, sırayla, her zaman.
             Sahne modunda kolon kayar; varsayılan modda normal liste. -->
        <div class="pr-metin">
          <ol class="pr-liste">
            <li v-for="a in adimlar" :key="a.no" class="pr-adim">
              <span class="pr-adim-no">{{ a.no }}</span>
              <h3 class="pr-h3">{{ a.baslik }}</h3>
              <p class="pr-p">{{ a.metin }}</p>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- ── Sahne sonrası: sakin şerit ("Süreç Sonrası Destek" buraya taşındı) ── -->
    <section class="pr-serit">
      <p class="pr-kunye">05 / SÜREÇ SONRASI</p>
      <p class="pr-serit-metin">
        Taşıma tamamlandıktan sonra da yanınızdayız — unutulan bir eşya,
        ek bir soru ya da nadiren yaşanabilecek bir hasar için.
      </p>
    </section>

    <footer class="pr-alt">
      <p class="pr-kunye">PROTOTİP SONU</p>
    </footer>
  </main>
</template>

<style scoped>
/* ===========================================================================
   PROTOTİP PALETİ — yerel. Değerler WCAG 2.1 AA'ya karşı hesaplandı:
     ana metin/kâğıt 15,85 · ikincil 6,54 · sinyal 5,06 · ölçü çizgisi 3,51
   ======================================================================== */
.pr {
  --kagit: #f7f4ef;
  --kagit-cukur: #ede8df;
  --murekkep: #1b1a18;
  --murekkep-solgun: #5c574e;
  --cizgi: #d6cec1;
  --olcu: #8a8170;
  --sinyal: #b4441c;

  --mono: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace;

  background: var(--kagit);
  color: var(--murekkep);
  min-height: 100vh;
}

/* ---- Ortak tipografi -------------------------------------------------- */
.pr-kunye {
  font-family: var(--mono);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  color: var(--olcu);
  margin: 0;
}
.pr-h1 {
  font-size: clamp(2.25rem, 1.6rem + 2.8vw, 4rem);
  line-height: 1.03;
  letter-spacing: -0.03em;
  font-weight: 700;
  margin: 1rem 0 0;
  max-width: 16ch;
}
.pr-h2 {
  font-size: clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-weight: 700;
  margin: 0;
}
.pr-h3 {
  font-size: clamp(1.125rem, 1rem + 0.6vw, 1.5rem);
  line-height: 1.2;
  letter-spacing: -0.015em;
  font-weight: 650;
  margin: 0.5rem 0 0;
}
.pr-p {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--murekkep-solgun);
  margin: 0.75rem 0 0;
  max-width: 46ch;
}
.pr-giris {
  font-size: 1rem;
  line-height: 1.65;
  color: var(--murekkep-solgun);
  max-width: 52ch;
  margin: 1.25rem 0 0;
}

/* ---- Sayfa çerçevesi -------------------------------------------------- */
.pr-ust,
.pr-serit,
.pr-alt {
  padding: clamp(3rem, 2rem + 5vw, 7rem) clamp(1.25rem, 0.5rem + 3vw, 4rem);
}
.pr-serit {
  border-top: 1px solid var(--cizgi);
  border-bottom: 1px solid var(--cizgi);
  display: grid;
  gap: 0.75rem;
}
.pr-serit-metin {
  font-size: clamp(1.125rem, 1rem + 0.8vw, 1.75rem);
  line-height: 1.35;
  letter-spacing: -0.015em;
  max-width: 34ch;
  margin: 0;
}

/* ===========================================================================
   VARSAYILAN DÜZEN — normal akış.
   Desteklemeyen tarayıcı, reduced-motion ve JS'siz durum bunu görür.
   Hiçbir içerik gizli değil, hiçbir şey üst üste binmiyor.
   ======================================================================== */
.pr-sahne {
  padding: clamp(2rem, 1rem + 4vw, 5rem) clamp(1.25rem, 0.5rem + 3vw, 4rem);
  display: grid;
  gap: clamp(2rem, 1rem + 3vw, 3.5rem);
}
.pr-ray {
  display: none; /* varsayılanda gereksiz: numaralar zaten listede */
}
.pr-gorsel {
  display: grid;
  gap: 1rem;
}
.pr-a,
.pr-b {
  margin: 0;
  overflow: hidden;
}
.pr-a img,
.pr-b img {
  display: block;
  width: 100%;
  height: auto;
}
.pr-liste {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: clamp(2rem, 1rem + 2vw, 3rem);
}
.pr-adim-no {
  font-family: var(--mono);
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: var(--sinyal);
}

/* ===========================================================================
   İYİLEŞTİRME KATMANI
   Yalnızca: tarayıcı scroll-timeline destekliyor VE kullanıcı hareket
   istemiyor değilse.
   ======================================================================== */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    /* ---- MOBİL (varsayılan genişlik) — PIN YOK, 3 durum ----------------
       Bölüm normal akıyor. Yer değiştiren tek şey görsel alanı: A yukarı
       çekilirken B aşağıdan yerine oturuyor. Metin kolonu KAYMIYOR —
       küçük ekranda kayan metin okuma yükü. */
    .pr-gorsel {
      position: relative;
      aspect-ratio: 4 / 3;
      gap: 0;
      view-timeline-name: --gorsel-mobil;
      view-timeline-axis: block;
      /* Masaüstündeki ALAN'ın aynısı — boşalan hücre burada da görünmeli,
         yoksa hareket "iki fotoğraf sırayla" gibi okunur. */
      background: var(--kagit-cukur);
      background-image:
        linear-gradient(to right, var(--cizgi) 1px, transparent 1px),
        linear-gradient(to bottom, var(--cizgi) 1px, transparent 1px);
      background-size: 25% 33.333%;
    }
    .pr-a,
    .pr-b {
      position: absolute;
      inset: 0;
      animation-timeline: --gorsel-mobil;
      animation-range: entry 70% exit 30%;
    }
    .pr-a { z-index: 2; animation-name: mobil-a;
animation-duration: auto;
animation-timing-function: linear;
animation-fill-mode: both; }
    .pr-b { z-index: 1; animation-name: mobil-b;
animation-duration: auto;
animation-timing-function: linear;
animation-fill-mode: both; }
    .pr-a img,
    .pr-b img {
      height: 100%;
      object-fit: cover;
      animation-timeline: --gorsel-mobil;
      animation-range: entry 70% exit 30%;
    }
    .pr-a img { animation-name: mobil-icerik-a;
animation-duration: auto;
animation-timing-function: linear;
animation-fill-mode: both; }
    .pr-b img { animation-name: mobil-icerik-b;
animation-duration: auto;
animation-timing-function: linear;
animation-fill-mode: both; }

    /* MASAÜSTÜNÜN SADELEŞTİRİLMİŞ KARŞILIĞI — dört perde değil üç, ama
       aynı hareket: A köşeye çekilir, ortada boş hücre görünür, B alanı
       kapatır. Tek eksenli bir silme DEĞİL; dikey ekranda transfer
       üst→alt yönünde okunuyor. */
    @keyframes mobil-a {
      0%, 30%   { clip-path: inset(0% 0% 22% 0%); }
      62%       { clip-path: inset(0% 46% 48% 0%); }
      88%, 100% { clip-path: inset(0% 74% 76% 0%); }
    }
    @keyframes mobil-b {
      0%, 30%   { clip-path: inset(80% 0% 0% 0%); }
      62%       { clip-path: inset(52% 0% 0% 0%); }
      88%, 100% { clip-path: inset(0% 0% 0% 0%); }
    }
    @keyframes mobil-icerik-a {
      0%, 30%   { transform: scale(1) translate(0, 0); }
      62%       { transform: scale(1.24) translate(-5%, -3%); }
      88%, 100% { transform: scale(1.5) translate(-11%, -7%); }
    }
    @keyframes mobil-icerik-b {
      0%, 30%   { transform: scale(1.4) translate(0, 14%); }
      62%       { transform: scale(1.16) translate(0, 6%); }
      88%, 100% { transform: scale(1) translate(0, 0); }
    }

    /* ---- MASAÜSTÜ — yapışkan sahne, 4 perde --------------------------- */
    @media (min-width: 1024px) {
      .pr-sahne-kap {
        /* Scroll mesafesi: 4 perde için 300vh. Bu sayı prototipin
           sınadığı şeylerden biri — doğal mı, uzun mu? */
        height: 300vh;
        view-timeline-name: --surec;
        view-timeline-axis: block;
      }
      .pr-sahne {
        position: sticky;
        top: 0;
        height: 100vh;
        display: grid;
        grid-template-columns: 4rem minmax(0, 7fr) minmax(0, 5fr);
        grid-template-rows: auto minmax(0, 1fr);
        column-gap: clamp(1.5rem, 0.5rem + 2vw, 3.5rem);
        row-gap: 2rem;
        align-content: center;
        padding-block: clamp(3rem, 2rem + 3vw, 5rem);
      }
      .pr-h2 {
        grid-column: 2 / -1;
        grid-row: 1;
      }

      /* ---- ÖLÇÜ RAYI ---------------------------------------------- */
      .pr-ray {
        display: block;
        position: relative;
        grid-column: 1;
        grid-row: 2;
      }
      .pr-ray-cizgi {
        position: absolute;
        left: 0.75rem;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--olcu);
      }
      .pr-ray-tik {
        position: absolute;
        left: 0;
        top: calc(var(--i) * 30% + 6%);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .pr-ray-kol {
        display: block;
        width: 1.5rem;
        height: 1px;
        background: var(--olcu);
        transform-origin: left center;
        transform: scaleX(0.45);
      }
      .pr-ray-no {
        font-family: var(--mono);
        font-size: 0.6875rem;
        letter-spacing: 0.1em;
        color: var(--olcu);
      }
      /* Aktif basamak "çağrılır": kol tam açılır, numara sinyale döner.
         Dördü de ayrı aralıkta — `uzat` fiili. */
      .pr-ray-tik:nth-child(2) .pr-ray-kol { animation-name: kol-1; animation-duration: auto; animation-timing-function: linear; animation-fill-mode: both; }
      .pr-ray-tik:nth-child(3) .pr-ray-kol { animation-name: kol-2; animation-duration: auto; animation-timing-function: linear; animation-fill-mode: both; }
      .pr-ray-tik:nth-child(4) .pr-ray-kol { animation-name: kol-3; animation-duration: auto; animation-timing-function: linear; animation-fill-mode: both; }
      .pr-ray-tik:nth-child(5) .pr-ray-kol { animation-name: kol-4; animation-duration: auto; animation-timing-function: linear; animation-fill-mode: both; }
      .pr-ray-tik:nth-child(2) .pr-ray-no { animation-name: no-1; animation-duration: auto; animation-timing-function: linear; animation-fill-mode: both; }
      .pr-ray-tik:nth-child(3) .pr-ray-no { animation-name: no-2; animation-duration: auto; animation-timing-function: linear; animation-fill-mode: both; }
      .pr-ray-tik:nth-child(4) .pr-ray-no { animation-name: no-3; animation-duration: auto; animation-timing-function: linear; animation-fill-mode: both; }
      .pr-ray-tik:nth-child(5) .pr-ray-no { animation-name: no-4; animation-duration: auto; animation-timing-function: linear; animation-fill-mode: both; }
      .pr-ray-kol,
      .pr-ray-no {
        animation-timeline: --surec;
        animation-range: contain 0% contain 100%;
      }
      @keyframes kol-1 { 0%,18% { transform: scaleX(1); } 26%,100% { transform: scaleX(0.45); } }
      @keyframes kol-2 { 0%,18% { transform: scaleX(0.45); } 26%,42% { transform: scaleX(1); } 50%,100% { transform: scaleX(0.45); } }
      @keyframes kol-3 { 0%,42% { transform: scaleX(0.45); } 50%,66% { transform: scaleX(1); } 74%,100% { transform: scaleX(0.45); } }
      @keyframes kol-4 { 0%,66% { transform: scaleX(0.45); } 74%,100% { transform: scaleX(1); } }
      @keyframes no-1 { 0%,18% { color: var(--sinyal); } 26%,100% { color: var(--olcu); } }
      @keyframes no-2 { 0%,18% { color: var(--olcu); } 26%,42% { color: var(--sinyal); } 50%,100% { color: var(--olcu); } }
      @keyframes no-3 { 0%,42% { color: var(--olcu); } 50%,66% { color: var(--sinyal); } 74%,100% { color: var(--olcu); } }
      @keyframes no-4 { 0%,66% { color: var(--olcu); } 74%,100% { color: var(--sinyal); } }

      /* ---- GÖRSEL ALANI — ağırlık transferi ------------------------
         REVİZYON. Önceki sürüm iki fotoğrafı aynı kutuda tek bir DİKEY
         BÖLME ÇİZGİSİYLE ayırıyordu; tanımı gereği bir before/after
         slider'dı ve metafor okunmuyordu. Üç eksik vardı:

           1. Parçalar ayrı hücrelerde durmuyordu — ikisi de tam kutuydu.
           2. Hiçbir şey YER DEĞİŞTİRMİYORDU; yalnız örtü kayıyordu.
           3. Boşalan alan hiç görünmüyordu — oysa "biri yer açar, diğeri
              doldurur" metaforunun kalbi o boşluğun GÖRÜLMESİ.

         Şimdi transfer İKİ EKSENDE oluyor: A hem daralıyor hem yukarı
         çekiliyor, B hem genişliyor hem aşağı yayılıyor. Denge anında sol
         altta gerçek bir BOŞ HÜCRE açığa çıkıyor — taşınmanın "ara" hâli.
         Finalde B o boşluğu da kapatıyor; A köşede küçük bir iz olarak
         kalıyor. Yani başlangıç ve bitiş yine ayna, ama arada bir "yerleşme"
         var, düz bir geçiş değil. */
      .pr-gorsel {
        grid-column: 2;
        grid-row: 2;
        position: relative;
        aspect-ratio: auto;
        height: 100%;
        view-timeline-name: none;
        /* ALAN görünür oldu. Kadroya yeni parça EKLENMEDİ — `ALAN` baştan
           beri sabit kadronun üyesiydi, yalnızca görünmezdi. Boşalan hücre
           ancak bir zemin varsa okunur. */
        background: var(--kagit-cukur);
        background-image:
          linear-gradient(to right, var(--cizgi) 1px, transparent 1px),
          linear-gradient(to bottom, var(--cizgi) 1px, transparent 1px);
        background-size: 16.666% 50%;
      }
      .pr-a,
      .pr-b {
        position: absolute;
        inset: 0;
        animation-timeline: --surec;
        animation-range: contain 0% contain 100%;
      }
      /* A üstte: finalde B tüm alanı kaplarken A onun üzerinde küçük bir
         karo olarak kalabilsin diye. */
      .pr-a { z-index: 2; animation-name: agirlik-a;
animation-duration: auto;
animation-timing-function: linear;
animation-fill-mode: both; }
      .pr-b { z-index: 1; animation-name: agirlik-b;
animation-duration: auto;
animation-timing-function: linear;
animation-fill-mode: both; }
      .pr-a img,
      .pr-b img {
        height: 100%;
        object-fit: cover;
        animation-timeline: --surec;
        animation-range: contain 0% contain 100%;
      }
      /* İÇERİK DE HAREKET EDİYOR. Yalnız pencere değişseydi fotoğraf
         yerinde duran bir duvar gibi görünürdü; parçanın kendisinin
         taşındığı hissi buradan geliyor. */
      .pr-a img { animation-name: icerik-a;
animation-duration: auto;
animation-timing-function: linear;
animation-fill-mode: both; }
      .pr-b img { animation-name: icerik-b;
animation-duration: auto;
animation-timing-function: linear;
animation-fill-mode: both; }

      /* A: sol tam boy → sol üst hücre → sol üst köşede küçük karo */
      @keyframes agirlik-a {
        0%, 20%   { clip-path: inset(0% 18% 0% 0%); }
        40%       { clip-path: inset(0% 18% 0% 0%); }
        62%       { clip-path: inset(0% 52% 46% 0%); }
        85%, 100% { clip-path: inset(0% 82% 74% 0%); }
      }
      /* B: sağda dar dilim → sağ yarı → TÜM ALAN (boşluğu kapatır) */
      @keyframes agirlik-b {
        0%, 20%   { clip-path: inset(0% 0% 0% 84%); }
        40%       { clip-path: inset(0% 0% 0% 84%); }
        62%       { clip-path: inset(0% 0% 0% 56%); }
        85%, 100% { clip-path: inset(0% 0% 0% 0%); }
      }
      /* Pencere küçüldükçe A'nın içeriği yaklaşıyor — küçük karoda anlamsız
         bir kırpıntı değil, tanınır bir detay kalsın diye. */
      @keyframes icerik-a {
        0%, 20%   { transform: scale(1) translate(0, 0); }
        40%       { transform: scale(1.06) translate(-1%, 0); }
        62%       { transform: scale(1.28) translate(-6%, -3%); }
        85%, 100% { transform: scale(1.5) translate(-9%, -19%); }
      }
      /* B tersine: dar dilimde yakın, alan büyüdükçe tam kadraja açılıyor. */
      @keyframes icerik-b {
        0%, 20%   { transform: scale(1.45) translate(11%, 0); }
        40%       { transform: scale(1.45) translate(11%, 0); }
        62%       { transform: scale(1.18) translate(5%, 0); }
        85%, 100% { transform: scale(1) translate(0, 0); }
      }

      /* ---- METİN — kolon kayar, dört adım DOM'da kalır -------------- */
      .pr-metin {
        grid-column: 3;
        grid-row: 2;
        overflow: hidden;
        height: 100%;
        position: relative;
      }
      /* Her adım kabın TAM yüksekliği kadar bir yuva kaplıyor; böylece
         `translateY` tam olarak bir adım kaydırıyor ve JS ile yükseklik
         ölçmeye gerek kalmıyor.

         YUVA PENCEREDEN UZUN (%160) — ara karelerde iki metnin birden
         görünmesini engelleyen şey bu. Yuva pencereyle aynı yükseklikteyken
         geçişin ortasında çıkan metnin altı ile giren metnin üstü aynı anda
         pencerede kalıyordu. Metin yuvanın ORTASINA yerleşince, geçiş
         ortasında her ikisi de pencerenin dışına çıkıyor; görünen tek şey
         yuvaların boş payı oluyor. Şeffaflık kullanılmıyor — sınır tamamen
         kırpma ile kuruluyor.

         Başlangıç kaydırması -%30: yuvanın pencereden taşan payının yarısı
         ((160-100)/2). Bu olmadan metin pencerenin altında kalırdı. */
      .pr-liste {
        gap: 0;
        height: 100%;
        grid-auto-rows: 160%;
        animation-name: metin-kay;
animation-duration: auto;
animation-timing-function: linear;
animation-fill-mode: both;
        animation-timeline: --surec;
        animation-range: contain 0% contain 100%;
      }
      .pr-adim {
        min-height: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      /* `otur` — dört durak, aralarda geçiş. */
      @keyframes metin-kay {
        0%, 18%   { transform: translateY(-30%); }
        26%, 42%  { transform: translateY(-190%); }
        50%, 66%  { transform: translateY(-350%); }
        74%, 100% { transform: translateY(-510%); }
      }

      /* ===== GEÇİCİ TEŞHİS — `?durum=` ile üç kanonik durum sabitlenir.
         Sorunu zaman ekseninden ayırmak için; doğrulama bitince silinecek. */
      /* Teşhis görünümünde sahne EKRANIN TAMAMINI kaplasın: scroll 0'da
         yapışkan kap henüz devreye girmediği için sahnenin yalnızca üst
         kısmı görünüyordu ve geometri değerlendirilemiyordu. */
      .pr--sabit .pr-ust,
      .pr--sabit .pr-serit,
      .pr--sabit .pr-alt { display: none; }
      .pr--sabit .pr-sahne-kap { height: 100vh; }

      .pr--sabit .pr-a,
      .pr--sabit .pr-b,
      .pr--sabit .pr-a img,
      .pr--sabit .pr-b img,
      .pr--sabit .pr-liste,
      .pr--sabit .pr-ray-kol,
      .pr--sabit .pr-ray-no { animation: none !important; }
      /* Animasyon kapalıyken listenin başlangıç ofseti elle veriliyor,
         yoksa metin pencerenin altında kalır. */
      .pr--sabit .pr-liste { transform: translateY(-30%); }

      .pr--d0 .pr-a      { clip-path: inset(0% 18% 0% 0%); }
      .pr--d0 .pr-b      { clip-path: inset(0% 0% 0% 84%); }
      .pr--d0 .pr-a img  { transform: scale(1) translate(0, 0); }
      .pr--d0 .pr-b img  { transform: scale(1.45) translate(11%, 0); }

      .pr--d62 .pr-a     { clip-path: inset(0% 52% 46% 0%); }
      .pr--d62 .pr-b     { clip-path: inset(0% 0% 0% 56%); }
      .pr--d62 .pr-a img { transform: scale(1.28) translate(-6%, -3%); }
      .pr--d62 .pr-b img { transform: scale(1.18) translate(5%, 0); }

      .pr--d100 .pr-a     { clip-path: inset(0% 82% 74% 0%); }
      .pr--d100 .pr-b     { clip-path: inset(0% 0% 0% 0%); }
      .pr--d100 .pr-a img { transform: scale(1.5) translate(-9%, -19%); }
      .pr--d100 .pr-b img { transform: scale(1) translate(0, 0); }
    }
  }
}
</style>
