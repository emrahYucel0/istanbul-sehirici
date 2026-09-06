<script setup>
/**
 * FİYAT HESAPLAMA — AÇILIŞ
 * --------------------------------------------------------------------------
 * M18D: ortak açılış yapısı `sayfa/Acilisi.vue`ye taşındı. Ölçüldü —
 * bu bileşenin 12 açılış kuralının 7'si ilkelle BİREBİR aynıydı, kalanı
 * `girisYeri` propunun zaten karşıladığı yerleşim farkıydı.
 *
 * Giriş metni sağ kolonda (`yan`): hesaplayıcı bir ekran aşağı itilmiyor.
 * Bu sayfada açılış fotoğrafı yok — sayfa göreve odaklı.
 */

defineProps({
  bolum: { type: Object, default: () => ({}) },
})
</script>

<template>
  <SayfaAcilisi
    baslik-id="fiyat-baslik"
    kunye="İSTANBUL / FİYAT HESAPLAMA"
    yol="Fiyat hesaplama"
    :baslik="bolum.heading"
    :giris="bolum.lead"
    giris-yeri="yan"
  />
</template>
