<script setup>
/**
 * BLOG DİZİNİ — AÇILIŞ
 * --------------------------------------------------------------------------
 * M18B1: ortak açılış yapısı `sayfa/Acilisi.vue`ye taşındı. Burada yalnız
 * bu sayfaya ait olan kalıyor: künyeye eklenen yazı sayısı.
 *
 * Giriş metni sağ kolonda ve tabana hizalı (`giris-yeri="yan"`) — blog
 * açılışında fotoğraf yok, o yüzden sağ kolon metne bırakılıyor.
 * Hizmetler açılışıyla aynı sicil, farklı ağırlık dağılımı.
 */

defineProps({
  bolum: { type: Object, default: () => ({}) },

  yaziSayisi: { type: Number, default: 0 },
})
</script>

<template>
  <SayfaAcilisi
    baslik-id="blog-baslik"
    kunye="BİLGİ / BLOG"
    yol="Blog"
    :baslik="bolum.heading"
    :giris="bolum.lead"
    giris-yeri="yan"
  >
    <template #kunye>
      <span v-if="yaziSayisi"> / {{ yaziSayisi }} YAZI</span>
    </template>
  </SayfaAcilisi>
</template>
