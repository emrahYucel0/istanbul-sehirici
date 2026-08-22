<script setup>
/**
 * İLETİŞİM — SAYFA GİRİŞİ.
 *
 * `fixed/PageHeader.vue` bandının yerini alıyor. Bant duruyor ve /blog onu
 * kullanmaya devam ediyor; bu sayfa kendi girişine geçti — service/Giris,
 * region/BolgeGiris ve about/Giris ile aynı kademede.
 *
 * DÜZELTİLEN İKİ BORÇ
 *   1. <h1> `<main>` DIŞINDAYDI. Bant `<main>`den önce basılıyordu, yani
 *      sayfanın ana bölgesinde hiç başlık yoktu (ölçüldü: main h1 = 0).
 *   2. Bandın alt başlığı "Ücretsiz keşif talebi, yazılı sabit fiyat
 *      teklifi…" diyordu — iki doğrulanmamış iddia, sayfanın en görünür
 *      yerinde.
 *
 * GÖRSEL YOK (bilinçli). Bu sayfanın işi bir sahne kurmak değil, bir
 * eylemi kolaylaştırmak. Diğer V2 girişlerinde duran fotoğraf burada
 * telefonu ve formu aşağı iterdi.
 */

/** İç sayfa içeriği — bkz. shared/utils/ic-sayfa.ts */
defineProps({
  bolum: { type: Object, default: () => ({}) },
})
</script>

<template>
  <section class="ig-kap" aria-labelledby="iletisim-baslik">
    <div class="ig sahne-alan">
      <nav class="ig-yol" aria-label="Yol izi">
        <ol class="ig-yol-liste" itemscope itemtype="https://schema.org/BreadcrumbList">
          <li
            class="ig-yol-oge"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <NuxtLink to="/" itemprop="item"><span itemprop="name">Ana sayfa</span></NuxtLink>
            <meta itemprop="position" content="1" />
          </li>
          <li
            class="ig-yol-oge"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <span itemprop="name" aria-current="page">İletişim</span>
            <meta itemprop="position" content="2" />
          </li>
        </ol>
      </nav>

      <p class="ig-kunye op-kunye">İSTANBUL / İLETİŞİM</p>

      <h1 id="iletisim-baslik" class="ig-h1 tip-baslik">
        {{ bolum.heading }}
      </h1>

      <p v-if="bolum.lead" class="ig-giris tip-giris">{{ bolum.lead }}</p>
    </div>
  </section>
</template>

<style scoped>
.ig-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
  border-bottom: 1px solid rgb(var(--c-rule));
}
.ig {
  padding-block: var(--sahne-dikey-dar) var(--sahne-dikey);
}

/* ---- Yol izi ----------------------------------------------------------- */
.ig-yol-liste {
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
.ig-yol-oge + .ig-yol-oge::before {
  content: '/';
  margin-right: 0.5rem;
  color: rgb(var(--c-measure));
}
.ig-yol a {
  color: rgb(var(--c-ink-soft));
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.ig-yol a:hover {
  color: rgb(var(--c-ink));
  border-bottom-color: rgb(var(--c-ink));
}
.ig-yol [aria-current='page'] {
  color: rgb(var(--c-ink));
}

.ig-kunye {
  margin-top: clamp(2rem, 1.5rem + 2vw, 3.5rem);
}
.ig-h1 {
  margin-top: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
  max-width: 18ch;
}
.ig-giris {
  margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}

@media (min-width: 1024px) {
  .ig {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }
  .ig-yol {
    grid-column: 1 / 9;
  }
  .ig-kunye {
    grid-column: 2 / 8;
  }
  .ig-h1 {
    grid-column: 2 / 8;
  }
  /* Giriş metni D alanında: başlıkla aynı hizada başlıyor, sayfanın üst
     bandı boş kalmıyor ve telefon bir ekran aşağı itilmiyor. */
  .ig-giris {
    grid-column: 8 / 13;
    grid-row: 3 / 5;
    align-self: end;
    margin-top: 0;
  }
}
</style>
