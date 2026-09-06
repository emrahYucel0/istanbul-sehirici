<script setup>
/**
 * İLETİŞİM — AÇILIŞ
 * --------------------------------------------------------------------------
 * M18D: ortak açılış yapısı `sayfa/Acilisi.vue`ye taşındı (12 kuralın 7'si
 * ilkelle birebir aynıydı).
 *
 * Giriş metni sağ kolonda (`yan`): sayfanın üst bandı boş kalmıyor ve
 * telefon bir ekran aşağı itilmiyor — sitenin en sakin işlevsel sayfası.
 */

defineProps({
  bolum: { type: Object, default: () => ({}) },
})
</script>

<template>
  <SayfaAcilisi
    baslik-id="iletisim-baslik"
    kunye="İSTANBUL / İLETİŞİM"
    yol="İletişim"
    :baslik="bolum.heading"
    :giris="bolum.lead"
    giris-yeri="yan"
  />
</template>
