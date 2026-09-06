<script setup>
/**
 * HİZMETLER DİZİNİ — AÇILIŞ
 * --------------------------------------------------------------------------
 * M18B1: ortak açılış yapısı `sayfa/Acilisi.vue`ye taşındı (yol izi,
 * künye, başlık, giriş, sicil çizgisi ve ızgara geometrisi). Burada
 * yalnız BU sayfaya ait olan kalıyor: künye metni ve açılış fotoğrafı.
 *
 * Fotoğraf kart değil kompozisyon ögesi: sağ kolonu baştan sona dolduruyor,
 * yuvarlatma/gölge yok, kırpma niyetli (`object-position` üst gövdeye
 * yakın tutuluyor).
 *
 * CMS sözleşmesi korunur: bolum.heading / lead / imagePath / imageAlt.
 */

defineProps({
  bolum: { type: Object, required: true },
})
</script>

<template>
  <SayfaAcilisi
    baslik-id="hizmetler-baslik"
    kunye="HİZMETLER / İSTANBUL"
    yol="Hizmetlerimiz"
    :baslik="bolum.heading"
    :giris="bolum.lead"
    giris-yeri="alt"
  >
    <template #gorsel>
      <figure class="sg-gorsel">
        <NuxtImg
          v-if="bolum.imagePath"
          :src="bolum.imagePath"
          :alt="bolum.imageAlt || ''"
          class="sg-foto"
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
.sg-gorsel {
  margin: clamp(2rem, 1.5rem + 1.5vw, 3rem) 0 0;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgb(var(--c-paper-sunken));
}

.sg-foto {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 55%;
}

@media (min-width: 1024px) {
  .sg-gorsel {
    /* Üst kenar künye satırıyla hizalı: fotoğraf sicil çizgisinin ALTINDAN
       başlıyor, böylece açılışın üstünde yüzen bir dikdörtgen değil,
       kompozisyonun sağ kolonu oluyor. */
    grid-column: 9 / 13;
    grid-row: 3 / 7;
    align-self: stretch;
    margin: 0;
    aspect-ratio: auto;
    min-height: 24rem;
  }
}
</style>
