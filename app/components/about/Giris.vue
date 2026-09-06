<script setup>
/**
 * HAKKIMIZDA — AÇILIŞ
 * --------------------------------------------------------------------------
 * M18D: ortak açılış yapısı `sayfa/Acilisi.vue`ye taşındı. Bu sayfada
 * fotoğraf var, o yüzden giriş metni başlığın altında (`alt`) ve sağ kolon
 * fotoğrafa bırakılıyor — /hizmetlerimiz açılışıyla aynı karar.
 *
 * Başlık ve giriş metni CMS'ten (`veri`) geliyor; alan adları değişmedi.
 */

const props = defineProps({
  veri: { type: Object, default: null },
  bolum: { type: Object, default: () => ({}) },
})

const baslik = computed(() => props.veri?.mainTitle?.trim() || '')
const giris = computed(() => props.veri?.description1?.trim() || '')
</script>

<template>
  <SayfaAcilisi
    baslik-id="hakkimizda-baslik"
    kunye="İSTANBUL / HAKKIMIZDA"
    yol="Hakkımızda"
    :baslik="baslik"
    :giris="giris"
    giris-yeri="alt"
  >
    <template #gorsel>
      <figure v-if="bolum.imagePath" class="hg-gorsel">
        <NuxtImg
          :src="bolum.imagePath"
          :alt="bolum.imageAlt || ''"
          class="hg-foto"
          format="webp"
          sizes="xs:90vw sm:90vw md:90vw lg:42vw xl:42vw"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          width="1448"
          height="1086"
        />
      </figure>
    </template>
  </SayfaAcilisi>
</template>

<style scoped>
.hg-gorsel {
  margin: clamp(2rem, 1.5rem + 1.5vw, 3rem) 0 0;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgb(var(--c-paper-sunken));
}

.hg-foto {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 45%;
}

@media (min-width: 1024px) {
  .hg-gorsel {
    /* Üst kenar künye satırıyla hizalı — sicil çizgisinin altından
       başlıyor, açılışın üstünde yüzen dikdörtgen değil. */
    grid-column: 9 / 13;
    grid-row: 3 / 7;
    align-self: stretch;
    margin: 0;
    aspect-ratio: auto;
    min-height: 24rem;
  }
}
</style>
