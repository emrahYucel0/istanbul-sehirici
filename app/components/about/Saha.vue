<script setup>
/**
 * 03 / SAHADA NEYE BAKIYORUZ — keşifte kayda geçenler + kapsam dili.
 *
 * NEDEN AYRI BİR BÖLÜM
 * 02 "hangi kararları veriyoruz" diyor; burada o kararların dayandığı
 * ÖLÇÜMLER var. Sayfanın "neye göre karar veriyoruz" sorusuna verdiği
 * somut cevap bu.
 *
 * /BOLGELERIMIZ'İ TEKRARLAMIYOR (bilinçli). Orada dört madde var ama
 * eksen başka: "ilçe değişince planı ne değiştirir" (sokak, bina girişi,
 * kat, site izni). Burada eksen "keşifte ne KAYDA GEÇİYOR" — envanter,
 * erişim ölçüsü, özel parça, takvim kısıtı. Aynı liste iki sayfada
 * duramaz.
 *
 * KAPANIŞ PARAGRAFI — İDDİA POLİTİKASI
 * Eski sayfa burada "ücretsiz keşif", "yazılı ve net fiyat … sabit
 * kalıyor" ve "tüm taşımalarımız sigortalı" diyordu. Üçü de kaldırıldı.
 * Yerine söz değil, süreç yazıldı:
 *   · kapsam yazılı  →  doğrulanabilir bir işleyiş
 *   · kapsam değişirse teklif de değişir  →  taahhüt değil, bildirim
 *   · sorumluluğun sınırı sözleşmede  →  koşulsuz teminat DEĞİL
 */
const olcumler = computed(() => props.bolum.items || [])
/** İç sayfa içeriği — bkz. shared/utils/ic-sayfa.ts */
const props = defineProps({
  bolum: { type: Object, default: () => ({}) },
})
</script>

<template>
  <section class="hs-kap" aria-labelledby="saha-baslik">
    <div class="hs sahne-alan">
      <p class="hs-kunye op-kunye">03 / SAHADA NEYE BAKIYORUZ</p>

      <h2 id="saha-baslik" class="hs-h2 tip-anlati">{{ bolum.heading }}</h2>

      <p v-if="bolum.lead" class="hs-giris tip-giris">{{ bolum.lead }}</p>

      <dl class="hs-liste">
        <div v-for="(o, i) in olcumler" :key="i" class="hs-oge">
          <dt class="hs-etiket op-kunye">{{ o.label }}</dt>
          <dd class="hs-icerik">
            <p class="hs-metin tip-not">{{ o.body }}</p>
            <p class="hs-neden tip-not">{{ o.title }}</p>
          </dd>
        </div>
      </dl>

      <p v-if="bolum.closing" class="hs-kapanis tip-govde">{{ bolum.closing }}</p>
    </div>
  </section>
</template>

<style scoped>
.hs-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}
.hs {
  padding-block: var(--sahne-dikey);
}
.hs-kunye {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.hs-h2 {
  max-width: 16ch;
}
.hs-giris {
  margin: clamp(1rem, 0.85rem + 0.6vw, 1.5rem) 0 0;
}

.hs-liste {
  margin: clamp(1.75rem, 1.5rem + 1vw, 2.75rem) 0 0;
  padding: 0;
  border-bottom: 1px solid rgb(var(--c-rule));
}
.hs-oge {
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem);
}
.hs-etiket {
  margin: 0;
  color: rgb(var(--c-ink-soft));
}
.hs-icerik {
  margin: 0;
}
.hs-metin {
  margin: 0.375rem 0 0;
  max-width: var(--olcu-govde);
}
/* İkinci satır "neden" — aynı ölçüde ama yumuşak. Ayrı bir sütun gibi
   okunması için masaüstünde D alanına geçiyor. */
.hs-neden {
  margin: 0.375rem 0 0;
  color: rgb(var(--c-ink-soft));
  max-width: var(--olcu-govde);
}

.hs-kapanis {
  margin: clamp(1.75rem, 1.5rem + 1vw, 2.5rem) 0 0;
  max-width: var(--olcu-govde);
}

@media (min-width: 1024px) {
  .hs {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .hs-kunye {
    grid-column: 1 / 8;
  }
  .hs-h2 {
    grid-column: 2 / 7;
  }
  .hs-giris {
    grid-column: 8 / 13;
    align-self: end;
    margin: 0;
  }
  .hs-liste {
    grid-column: 2 / 13;
  }
  /* Üç sütun: etiket · ölçüm · neden. 02'deki kütükten farklı bir ritim —
     orada numara + tek metin var, burada ölçümün karşılığı yanında. */
  .hs-oge {
    display: grid;
    grid-template-columns: minmax(0, 14ch) minmax(0, 1.35fr) minmax(0, 1fr);
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }
  .hs-icerik {
    display: contents;
  }
  .hs-metin,
  .hs-neden {
    margin-top: 0;
  }
  .hs-kapanis {
    grid-column: 2 / 8;
  }
}
</style>
