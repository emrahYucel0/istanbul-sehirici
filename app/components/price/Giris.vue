<script setup>
/**
 * FİYAT HESAPLAMA — SAYFA GİRİŞİ.
 *
 * DÜZELTİLEN İKİ BORÇ
 *   1. YOL İZİ HİÇ YOKTU. Bu sayfa `fixed/PageHeader.vue` kullanmıyordu
 *      (diğer iç sayfaların aksine), dolayısıyla ne görünen yol izi ne de
 *      `BreadcrumbList` işaretlemesi vardı — ölçüldü: 0.
 *   2. BAŞLIK İDDİA TAŞIYORDU. `ui-heading` açıklaması "Kesin fiyat,
 *      ücretsiz keşif sonrasında netleşir" diyordu.
 *
 * GÖRSEL YOK (bilinçli). Bu sayfanın ana öğesi hesaplayıcının kendisi;
 * fotoğraf aracı ekranın aşağısına iter.
 */
/**
 * İÇERİK KAYNAĞI — `InternalPageSection('fiyat', 'giris')`.
 * Hesaplama KATSAYILARI burada değil; onların sahibi PriceEstimator.
 */
defineProps({
  bolum: { type: Object, default: () => ({}) },
})
</script>

<template>
  <section class="fg-kap" aria-labelledby="fiyat-baslik">
    <div class="fg sahne-alan">
      <nav class="fg-yol" aria-label="Yol izi">
        <ol class="fg-yol-liste" itemscope itemtype="https://schema.org/BreadcrumbList">
          <li
            class="fg-yol-oge"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <NuxtLink to="/" itemprop="item"><span itemprop="name">Ana sayfa</span></NuxtLink>
            <meta itemprop="position" content="1" />
          </li>
          <li
            class="fg-yol-oge"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <span itemprop="name" aria-current="page">Fiyat hesaplama</span>
            <meta itemprop="position" content="2" />
          </li>
        </ol>
      </nav>

      <p class="fg-kunye op-kunye">İSTANBUL / FİYAT HESAPLAMA</p>

      <h1 id="fiyat-baslik" class="fg-h1 tip-baslik">
        {{ bolum.heading }}
      </h1>

      <p v-if="bolum.lead" class="fg-giris tip-giris">{{ bolum.lead }}</p>
    </div>
  </section>
</template>

<style scoped>
.fg-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
  border-bottom: 1px solid rgb(var(--c-rule));
}
.fg {
  padding-block: var(--sahne-dikey-dar) var(--sahne-dikey);
}

/* ---- Yol izi ----------------------------------------------------------- */
.fg-yol-liste {
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
.fg-yol-oge + .fg-yol-oge::before {
  content: '/';
  margin-right: 0.5rem;
  color: rgb(var(--c-measure));
}
.fg-yol a {
  color: rgb(var(--c-ink-soft));
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.fg-yol a:hover {
  color: rgb(var(--c-ink));
  border-bottom-color: rgb(var(--c-ink));
}
.fg-yol [aria-current='page'] {
  color: rgb(var(--c-ink));
}

.fg-kunye {
  margin-top: clamp(2rem, 1.5rem + 2vw, 3.5rem);
}
.fg-h1 {
  margin-top: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
  max-width: 18ch;
}
.fg-giris {
  margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}

@media (min-width: 1024px) {
  .fg {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }
  .fg-yol {
    grid-column: 1 / 9;
  }
  .fg-kunye {
    grid-column: 2 / 8;
  }
  .fg-h1 {
    grid-column: 2 / 8;
  }
  /* Giriş D alanında: hesaplayıcı bir ekran aşağı itilmiyor. */
  .fg-giris {
    grid-column: 8 / 13;
    grid-row: 3 / 5;
    align-self: end;
    margin-top: 0;
  }
}
</style>
