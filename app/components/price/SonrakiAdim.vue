<script setup>
/**
 * 04 / SONRAKİ ADIM — sayfanın kapanışı.
 *
 * Eski sayfada kapanış, çukur bir kutunun içinde şu cümleydi: "…bu yüzden
 * keşif ücretsizdir ve hiçbir yükümlülük doğurmaz." İki doğrulanmamış
 * iddia taşıyordu ve zaten hesaplayıcının uyarı metnini tekrarlıyordu.
 *
 * Burada çağrı tekrarlanmıyor — hesaplayıcının kendi eylem bağlantısı
 * yukarıda duruyor. Bu bölüm aralığın SONRASINDA ne olduğunu anlatıyor.
 */

/**
 * İÇERİK KAYNAĞI — `InternalPageSection('fiyat', 'sonraki')`.
 * Bağlantı taşıyan cümleler kodda kaldı (rota haritası).
 */
defineProps({
  bolum: { type: Object, default: () => ({}) },
})
</script>

<template>
  <section class="fs-kap" aria-labelledby="sonraki-baslik">
    <div class="fs sahne-alan">
      <p class="fs-kunye op-kunye">04 / SONRAKİ ADIM</p>
      <h2 id="sonraki-baslik" class="fs-h2 tip-anlati">{{ bolum.heading }}</h2>

      <div class="fs-govde">
        <p v-if="bolum.lead" class="fs-metin tip-govde">{{ bolum.lead }}</p>
        <!-- "yazılı olarak veriliyor" ÇIKARILDI: teklifin biçimi
             (yazılı/sözlü) hakkında doğrulanmamış bir taahhüt. Kalan
             cümle süreci anlatıyor, garanti vermiyor. -->
        <p class="fs-metin tip-govde">
          Bu ayrıntıları paylaşırsanız keşif için gün ayırıyoruz; kapsam
          netleştikten sonra tutar paylaşılıyor.
        </p>
      </div>

      <!-- İLETİŞİM BAĞLANTISI BURADAN ÇIKTI: bu bölümün hemen altında ortak
           kapanış imzası duruyor ve "taşınmayı konuşalım" çağrısını
           telefonla birlikte o taşıyor. Kalan bağlantı hizmet dizini —
           farklı hedef, farklı soru. -->
      <p class="fs-yollar tip-govde">
        Hangi hizmetin kapsamına girdiğinizden emin değilseniz
        <NuxtLink to="/hizmetlerimiz" class="op-bag op-bag--sakin fs-bag"
          >nakliyat hizmetleri</NuxtLink
        >
        sayfasına bakabilirsiniz.
      </p>
    </div>
  </section>
</template>

<style scoped>
/* Kapanış çukur yüzeyde — sayfanın bittiği belli oluyor. */
.fs-kap {
  background: rgb(var(--c-paper-sunken));
  color: rgb(var(--c-ink));
  border-top: 1px solid rgb(var(--c-rule));
}
.fs {
  padding-block: var(--sahne-dikey);
}
.fs-kunye {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.fs-h2 {
  max-width: 16ch;
}
.fs-govde {
  margin-top: clamp(1.5rem, 1.25rem + 1vw, 2.5rem);
}
.fs-metin {
  margin: 0;
  max-width: var(--olcu-govde);
}
.fs-metin + .fs-metin {
  margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}
.fs-yollar {
  margin: clamp(1.75rem, 1.5rem + 1vw, 2.5rem) 0 0;
  max-width: var(--olcu-govde);
}

/* `.op-bag`ın 44 px taban yüksekliği cümle içinde alt çizgiyi metinden
   koparıyor (bkz. `.ba-bag`, `.sb-bag`, `.ho-bag`). */
.fs-bag {
  min-height: 0;
  font-size: inherit;
  font-weight: 600;
  padding-bottom: 0.05em;
}

@media (min-width: 1024px) {
  .fs {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .fs-kunye {
    grid-column: 1 / 8;
  }
  .fs-h2 {
    grid-column: 2 / 7;
    grid-row: 2;
  }
  .fs-govde {
    grid-column: 8 / 13;
    grid-row: 2;
    margin-top: 0;
  }
  .fs-yollar {
    grid-column: 8 / 13;
    grid-row: 3;
    margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
  }
}
</style>
