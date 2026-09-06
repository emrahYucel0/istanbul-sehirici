<script setup>
/**
 * SAYFA AÇILIŞI — DİZİN SAYFALARININ ORTAK SİCİLİ
 * --------------------------------------------------------------------------
 * M18A'da ölçüldü: beş `Giris.vue` bileşeni aynı açılışı beş kez kuruyordu
 * (normalize şablon benzerliği %59–96, ortalama ~%78; toplam ~21.500 karakter,
 * bunun ~8.950'si CSS). Yapı birebir aynıydı:
 *
 *   XX-kap > XX sahne-alan > XX-yol (yol izi) > XX-kunye > XX-h1 > XX-giris
 *
 * Bu bileşen YALNIZ o ortak yapıyı sahipleniyor. Sayfa ailelerinin
 * birbirinden görsel olarak ayrılmasına izin veren iki nokta var:
 *   - `girisYeri` — giriş metni başlığın altında mı, sağ kolonda mı
 *   - `gorsel` yuvası — fotoğraf yalnız anlamlı olduğu sayfada
 *
 * Prop kalabalığı yerine yuva tercih edildi; bu bir sayfa kurucusu DEĞİL.
 *
 * M18B1 kapsamı: yalnız `/hizmetlerimiz` ve `/blog`. Detay sayfalarının
 * bunu devralıp devralmayacağına Pack B karar verecek.
 *
 * KORUNAN SÖZLEŞMELER
 * - Yol izi işaretlemesi (BreadcrumbList mikroverisi) birebir aynı
 * - `aria-labelledby` için başlık kimliği dışarıdan veriliyor
 * - Tek `<h1>`; künye `op-kunye`, başlık `tip-baslik`, giriş `tip-giris`
 *   ortak tipografi kütüğünden geliyor
 */

defineProps({
  /** `aria-labelledby` hedefi. Sayfada tek `<h1>` olduğu için zorunlu. */
  baslikId: { type: String, required: true },

  /** Mono sicil satırı — sayfanın tipini söyler. */
  kunye: { type: String, required: true },

  /** Yol izinin son (geçerli sayfa) adı. */
  yol: { type: String, required: true },

  baslik: { type: String, default: '' },

  giris: { type: String, default: '' },

  /**
   * 'alt'  → giriş metni başlığın altında (görselli açılış)
   * 'yan'  → giriş metni sağ kolonda, tabana hizalı (görselsiz açılış)
   */
  girisYeri: { type: String, default: 'alt' },
})
</script>

<template>
  <section class="sa-kap" :aria-labelledby="baslikId">
    <div class="sa sahne-alan">
      <!-- Yol izi — ekranda görünen ve işaretlenen aynı liste. -->
      <nav class="sa-yol" aria-label="Yol izi">
        <ol class="sa-yol-liste" itemscope itemtype="https://schema.org/BreadcrumbList">
          <li
            class="sa-yol-oge"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <NuxtLink to="/" itemprop="item"><span itemprop="name">Ana sayfa</span></NuxtLink>
            <meta itemprop="position" content="1" />
          </li>
          <li
            class="sa-yol-oge"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <span itemprop="name" aria-current="page">{{ yol }}</span>
            <meta itemprop="position" content="2" />
          </li>
        </ol>
      </nav>

      <!-- Sicil çizgisi: açılışı "kayıt" gibi kuran ince yapı çizgisi. -->
      <span class="sa-cizgi" aria-hidden="true"></span>

      <p class="sa-kunye op-kunye">{{ kunye }}<slot name="kunye" /></p>

      <h1 :id="baslikId" class="sa-h1 tip-baslik">{{ baslik }}</h1>

      <p v-if="giris" class="sa-giris tip-giris" :class="`sa-giris--${girisYeri}`">
        {{ giris }}
      </p>

      <slot name="gorsel" />
    </div>
  </section>
</template>

<style scoped>
/* ==========================================================================
   AÇILIŞ SİCİLİ
   ======================================================================= */

.sa-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
  border-bottom: 1px solid rgb(var(--c-rule));
}

.sa {
  padding-block: var(--sahne-dikey-dar) var(--sahne-dikey);
}

/* ---- Yol izi ------------------------------------------------------------ */

.sa-yol-liste {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.5rem;
  margin: 0;
  padding: 0;
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  color: rgb(var(--c-ink-soft));
}

.sa-yol-oge + .sa-yol-oge::before {
  content: '/';
  margin-right: 0.5rem;
  color: rgb(var(--c-measure));
}

.sa-yol a {
  color: rgb(var(--c-ink-soft));
  text-decoration: none;
  border-bottom: 1px solid transparent;
}

.sa-yol a:hover,
.sa-yol a:focus-visible {
  color: rgb(var(--c-ink));
  border-bottom-color: rgb(var(--c-ink));
}

.sa-yol [aria-current='page'] {
  color: rgb(var(--c-ink));
}

/* ---- Sicil çizgisi ------------------------------------------------------ */

.sa-cizgi {
  display: block;
  height: 1px;
  margin-top: clamp(1.1rem, 0.9rem + 0.8vw, 1.8rem);
  background: rgb(var(--c-rule));
  transform-origin: left center;
}

/* ---- Künye / başlık / giriş --------------------------------------------- */

.sa-kunye {
  margin-top: clamp(1.4rem, 1.1rem + 1.2vw, 2.4rem);
}

/*
  DİZİN AÇILIŞININ OTORİTESİ.

  M18A'da ölçüldü: bütün ikincil açılışlar 56px başlıkta eşitleniyordu
  ve sayfa rolü ayrımı yoktu. Bu ölçek `tip-baslik`in üstüne YALNIZ dizin
  açılışı için biniyor — ortak tipografi kütüğü değişmiyor. Ana sayfanın
  gösterişli açılışı taklit edilmiyor: orada başlık çok daha büyük ve
  koreografiye bağlı; burada durağan bir editoryal sicil var.
*/
.sa-h1 {
  margin-top: clamp(0.6rem, 0.4rem + 0.7vw, 1.1rem);
  max-width: 16ch;
  font-size: clamp(2.6rem, 1.6rem + 3.4vw, 5.2rem);
}

.sa-giris {
  margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}

/* ==========================================================================
   MASAÜSTÜ — ASİMETRİK SİCİL IZGARASI
   ======================================================================= */

@media (min-width: 1024px) {
  .sa {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }

  .sa-yol { grid-column: 1 / 9; }

  .sa-cizgi { grid-column: 1 / 13; }

  .sa-kunye { grid-column: 2 / 8; }

  .sa-h1 { grid-column: 2 / 9; }

  .sa-giris--alt { grid-column: 2 / 8; }

  .sa-giris--yan {
    grid-column: 9 / 13;
    grid-row: 4 / 6;
    align-self: end;
    margin-top: 0;
  }
}

/* ==========================================================================
   MİKRO HAREKET — YALNIZ SİCİL ÇİZGİSİ
   ======================================================================= */

/*
  Aile A hareket politikası: MICRO. Tek hareket, sicil çizgisinin
  çizilmesi. Yapışkan anlatı, 300vh, JS kaydırma motoru yok.
  Azaltılmış harekette çizgi tam boyda ve içerik eksiksiz.
*/
@supports (animation-timeline: view()) {
  @media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
    .sa-cizgi {
      animation: sa-cizgi-ciz linear both;
      animation-timeline: view();
      animation-range: entry 10% entry 85%;
    }

    @keyframes sa-cizgi-ciz {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }
  }
}
</style>
