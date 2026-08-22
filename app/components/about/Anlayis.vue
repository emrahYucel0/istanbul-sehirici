<script setup>
/**
 * 01 / BİZİM İÇİN TAŞIMA NE DEMEK — sayfanın ilk anlatı bölümü.
 *
 * Eski `about/Intro.vue`'nun yerini alıyor. O bileşen aynı metinleri
 * basıyordu ama yanına dört rakam kutusu (12+ yıl, 8.500+ taşıma, 81 il,
 * %100 sigortalı) ve "ekibimiz" fotoğrafı koyuyordu. Dördü de kayıtla
 * desteklenmiyor, fotoğraf da gerçek ekip değil — hepsi kalktı.
 *
 * METİN PANELDEN. `description2` ve `description3` alanları; boş olanlar
 * süzülüyor, bölüm tamamen boşalırsa hiç basılmıyor (§ boş bölüm üretme).
 *
 * BAŞLIK VERİDEN DEĞİL. `mainTitle` <h1> olarak yukarıda kullanıldı;
 * buradaki <h2> bölümün SORUSUNU soruyor ve sabit — panelden değişen bir
 * metnin başlığı olamaz, çünkü başlık o metne söz veriyor.
 */
const props = defineProps({
  veri: { type: Object, default: null },
})

const paragraflar = computed(() =>
  [props.veri?.description2, props.veri?.description3]
    .map((m) => String(m ?? '').trim())
    .filter(Boolean)
)
</script>

<template>
  <section v-if="paragraflar.length" class="ha-kap" aria-labelledby="anlayis-baslik">
    <div class="ha sahne-alan">
      <p class="ha-kunye op-kunye">01 / BİZİM İÇİN TAŞIMA NE DEMEK</p>

      <h2 id="anlayis-baslik" class="ha-h2 tip-anlati">
        Zor olan kaldırmak değil, günü kurgulamak.
      </h2>

      <div class="ha-govde">
        <p v-for="(metin, i) in paragraflar" :key="i" class="ha-metin tip-govde">{{ metin }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ha-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}
.ha {
  padding-block: var(--sahne-dikey);
}
.ha-kunye {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.ha-h2 {
  max-width: 20ch;
}
.ha-govde {
  margin-top: clamp(1.5rem, 1.25rem + 1vw, 2.5rem);
}
.ha-metin {
  margin: 0;
  max-width: var(--olcu-govde);
}
.ha-metin + .ha-metin {
  margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}

@media (min-width: 1024px) {
  .ha {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .ha-kunye {
    grid-column: 1 / 8;
  }
  .ha-h2 {
    grid-column: 2 / 7;
    grid-row: 2;
  }
  /* Anlatı D alanında: başlık solda durur, metin sağda akar. Blog
     sütununa dönmemesi için ölçü yine 58ch'te sınırlı. */
  .ha-govde {
    grid-column: 8 / 13;
    grid-row: 2;
    margin-top: 0;
  }
}
</style>
