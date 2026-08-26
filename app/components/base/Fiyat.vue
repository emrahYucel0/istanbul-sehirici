<script setup>
/**
 * BÖLÜM 04 — KARAR VERMEDEN ÖNCE  ·  fiyat derinliği
 *
 * GÖREVİ tek soruyu cevaplamak:
 *   "Fiyat neden tek bir telefon rakamından ibaret değil?"
 *
 * Klasik SEO makalesi değil, kart ızgarası da değil. Beş faktör; her biri
 * kendi ölçü çizgisiyle açıklamasına bağlanıyor. OPERASYON ÇİZGİSİ burada
 * dördüncü görevini üstleniyor: AÇIKLAMA ÇİZGİSİ — etiketi değerine
 * bağlayan annotation.
 *
 * HAREKET: YALNIZ AÇIKLAMA ÇİZGİSİ. Sayfanın motion yoğunluğu finale
 * doğru düşüyor; üç signature 01–03 bölümlerinde harcandı. Burası
 * okunacak yer — metin hiç kıpırdamıyor. Kıpırdayan tek şey bölümün
 * kendi yapısal aracı, yani annotation çizgisinin çizilmesi
 * (gerekçe ve ölçüler stil bloğunun sonunda).
 *
 * DOĞRULANMAMIŞ İDDİA YOK: "ücretsiz keşif", "sabit fiyat garantisi",
 * "gizli ücret yok", "en uygun fiyat" — hiçbiri geçmiyor. Metin yalnız
 * fiyatı NEYİN değiştirdiğini anlatıyor.
 */

/**
 * ICERIK KAYNAGI — `HomeSection('fiyat')`.
 *
 * Baslik, giris ve bes faktor panelden geliyor. Faktor SAYISI beste sabit:
 * her faktorun kendi aciklama cizgisi var ve sayi kompozisyonun parcasi.
 *
 * FIYAT HESAPLAMA ARACININ KATSAYILARIYLA ILGISI YOK. Buradaki metinler
 * fiyati NEYIN degistirdigini anlatiyor; hesap PriceEstimator bolumunde ve
 * o katsayilara bu turda DOKUNULMADI.
 *
 * KAPANIS PARAGRAFI KODDA KALDI — bilincli. Icinde iki ic baglanti var
 * (/fiyat-hesaplama ve /iletisim) ve cumle onlarin etrafina orulmus.
 * Panele tasimak icin ya cumleyi uc parcaya bolmek (yoneticinin
 * kullanamayacagi bir form) ya da HTML girisi acmak gerekirdi; ikisi de
 * kazandigindan cok gotururdu. Bu bir gezinme cumlesi, isletme metni degil.
 */
const props = defineProps({
  bolum: { type: Object, required: true },
})

const faktorler = computed(() =>
  (props.bolum.items || []).map((o) => ({ etiket: o.label, metin: o.body }))
)
</script>

<template>
  <section class="fy-kap" aria-labelledby="fiyat-baslik">
    <div class="fy sahne-alan">
      <p class="fy-kunye op-kunye">04 / KARAR VERMEDEN ÖNCE</p>

      <div class="fy-ust">
        <h2 id="fiyat-baslik" class="fy-h2 tip-anlati">{{ bolum.heading }}</h2>
        <p class="fy-giris tip-govde">{{ bolum.lead }}</p>
      </div>

      <!-- Terim/karşılık ilişkisi: faktör ve onu açan metin. Kart değil;
           her satırın kendi açıklama çizgisi var. -->
      <dl class="fy-liste">
        <div v-for="f in faktorler" :key="f.etiket" class="fy-oge">
          <dt class="fy-etiket">
            <span class="fy-cizgi op-cizgi op-cizgi--yatay" aria-hidden="true" />
            {{ f.etiket }}
          </dt>
          <dd class="fy-metin tip-not">{{ f.metin }}</dd>
        </div>
      </dl>

      <p class="fy-kapanis tip-govde">
        Keşif sonrası fiyat yazılı veriliyor. Kaba bir aralık için
        <NuxtLink to="/fiyat-hesaplama" class="op-bag op-bag--sakin fy-bag">fiyat hesaplama aracını</NuxtLink>
        kullanabilir, kesin rakam için
        <NuxtLink to="/iletisim" class="op-bag op-bag--sakin fy-bag">keşif talebi</NuxtLink>
        bırakabilirsiniz.
      </p>
    </div>
  </section>
</template>

<style scoped>
.fy-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}
/* Perde 04'ün AÇILIŞ bloğu. Üstteki perde dikişini Hizmetler'in geniş alt
   payı taşıyor; burada tekrar etmiyor. (bkz. assets/css/sahne.css) */
.fy {
  padding-block: var(--sahne-dikey-dar);
}
.fy-kunye {
  margin-bottom: clamp(1.5rem, 1rem + 1.5vw, 2.5rem);
}
.fy-h2 {
  max-width: 18ch;
}
.fy-giris {
  max-width: 52ch;
  margin: clamp(1rem, 0.85rem + 0.6vw, 1.5rem) 0 0;
}

.fy-liste {
  margin: clamp(2.5rem, 2rem + 2vw, 4rem) 0 0;
  display: grid;
  gap: clamp(1.75rem, 1.5rem + 1vw, 2.5rem);
}
.fy-etiket {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  color: rgb(var(--c-ink-soft));
}
/* AÇIKLAMA ÇİZGİSİ — etiketi soldaki eksene bağlıyor. Mobilde kısa bir
   işaret, masaüstünde kolon boyunca uzanıp metne kadar gidiyor. */
.fy-cizgi {
  width: 1.5rem;
  flex: 0 0 auto;
}
.fy-metin {
  margin: 0.5rem 0 0;
  max-width: 58ch;
}

.fy-kapanis {
  margin: clamp(2.5rem, 2rem + 2vw, 4rem) 0 0;
  max-width: 56ch;
}
/* Cümle içindeki bağlantılar satır yüksekliğini bozmasın. */
.fy-bag {
  min-height: 0;
  font-size: inherit;
  font-weight: 600;
  padding-bottom: 0.05em;
}

/* ===========================================================================
   MASAÜSTÜ — İKİ SÜTUNLU FAKTÖR ALANI
   ---------------------------------------------------------------------------
   ÖNCEKİ YERLEŞİM NEDEN DEĞİŞTİ (ölçüldü, 1440)

   Fiyat, Hizmetler defteri ile Sorular listesinin ARASINDA duruyor ve
   üçü de aynı silüeti çiziyordu: tam genişlik, satır satır, solda kısa
   etiket sağda açıklama. Üst üste üç ekran aynı tabakayı tekrarlıyordu.
   Üstelik faktörler tek sütunda dizilince sağ üçte bir tamamen boş
   kalıyordu (~450×900px kâğıt).

   Yeni yerleşim aynı içerikle silüeti değiştiriyor: beş faktör İKİ
   SÜTUNLU bir alana giriyor, blok kısalıyor ve boş kalan kâğıt kullanıma
   dönüyor. Açıklama çizgisi kaldırılmadı — Fiyat'ın kendi aracı o —
   yalnız artık kendi yarım kolonunun sağ kenarına kadar uzanıyor.

   Başlık kol 2 yerine KOL 1'den başlıyor: Hero ve Üç İstanbul kol 2'den
   başlıyor; perde 04 sayfanın kenarından açılarak onlardan ayrılıyor.
   ======================================================================== */
@media (min-width: 1024px) {
  .fy {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    row-gap: 0;
  }
  .fy-kunye { grid-column: 1 / 13; }
  .fy-ust {
    grid-column: 1 / 13;
    display: contents;
  }
  .fy-h2 { grid-column: 1 / 6; }
  .fy-giris { grid-column: 7 / 12; margin-top: 0.5rem; max-width: none; }

  .fy-liste {
    grid-column: 1 / 13;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: clamp(2rem, 0.5rem + 4vw, 5rem);
    row-gap: var(--sahne-dikey-dar);
  }
  /* Öge artık yatay değil DİKEY kuruluyor: etiket + çizgi üstte, açıklama
     altta. Yatay kurgu tam genişlikte anlamlıydı; yarım kolonda metni
     ~20 karaktere düşürüyordu. */
  .fy-oge {
    display: block;
  }
  .fy-etiket {
    gap: 0;
  }
  /* Çizgi etiketten sonra başlayıp yarım kolonun sağ kenarına kadar
     gidiyor: hâlâ gerçek bir annotation, yalnız ölçtüğü alan değişti. */
  .fy-cizgi {
    width: auto;
    flex: 1 1 auto;
    margin-left: 1rem;
    order: 1;
  }
  .fy-metin {
    margin-top: 0.625rem;
    max-width: none;
  }
  /* Beş faktör iki sütunda 3 satır yapıyor; son satırın sağ hücresi boş
     kalıyor. Kapanış cümlesi o boşluğun altına, sağ yarıya iniyor —
     alan tek parça okunuyor. */
  .fy-kapanis { grid-column: 7 / 13; }
}

/* ═══════════════════════════════════════════════════════════════════════
   AÇIKLAMA ÇİZGİSİ ÇİZİLİYOR — YAPIYI ANLATAN TEK HAREKET
   -----------------------------------------------------------------------
   Bu bölümün kendi aracı, etiketi metne bağlayan yatay çizgi. Hareket de
   o aracın kendisi: satır görünüme girerken çizgi SOLDAN SAĞA çiziliyor,
   yani "bu etiket şu açıklamaya bağlanıyor" cümlesi gözün önünde
   kuruluyor.

   NE YAPILMADI
     · başlık/gövde reveal yok — metin hiç kıpırdamıyor
     · opaklık kullanılmıyor (md.2)
     · her satır için gecikme/stagger yok; her çizgi KENDİ satırının
       görünürlüğüne bağlı, sıralı bir gösteri değil

   MOTOR: native CSS scroll-driven animation. Zaman çizelgesi her `.fy-oge`
   kendi görünürlüğü; JS, kaydırma dinleyicisi ve kütüphane yok.

   YEDEK: `@supports` desteklemeyen tarayıcı ve hareket azaltma isteyen
   kullanıcı çizgiyi TAM BOYDA ve durağan görüyor — yapı kaybolmuyor.
   ═══════════════════════════════════════════════════════════════════════ */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .fy-oge {
      view-timeline-name: --fy-oge;
      view-timeline-axis: block;
    }
    .fy-cizgi {
      transform-origin: left center;
      animation-name: fy-ciz;
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --fy-oge;
      animation-range: entry 75% entry 100%;
    }
    @keyframes fy-ciz {
      0%   { transform: scaleX(0); }
      100% { transform: scaleX(1); }
    }
  }
}
</style>
