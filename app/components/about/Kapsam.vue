<script setup>
/**
 * 04 / HİZMET ALANLARI — kapsamın adları ve kendi sayfalarına bağlantı.
 *
 * Eski `about/Expertise.vue`'nun yerini alıyor. O bileşen altı yuvarlak
 * köşeli kart basıyordu; her kartta 48 piksellik bir ikon ve hizmetin
 * TAM AÇIKLAMASI vardı — yani /hizmetlerimiz sayfasının kısaltılmış bir
 * kopyası. Üstelik kart açıklamaları "Türkiye genelinde 81 ile taşıma"
 * diyordu.
 *
 * VERİ KAYNAĞI DEĞİŞTİ — SEBEBİ ÖNEMLİ
 * Eski kartlar `AboutSection.services` tablosundan geliyordu: gerçek
 * hizmet kayıtlarının İKİNCİ bir kopyası. İki liste zamanla ayrışmıştı —
 * about kopyasında "Asansörlü Nakliyat" yoktu, olmayan bir "Ambalaj,
 * Demontaj ve Montaj" kalemi vardı ve hiçbirinin slug'ı olmadığı için
 * kendi sayfasına bağlanamıyorlardı.
 *
 * Artık liste, ana sayfanın ve /hizmetlerimiz'in okuduğu AYNI kayıttan
 * geliyor. Bir hizmet eklendiğinde burada da beliriyor; adı değiştiğinde
 * burada da değişiyor. Eski `AboutSection.services` satırları silinmedi,
 * yalnız basılmıyor (bkz. rapor: kalan borç).
 *
 * BURADA HİZMET ANLATILMIYOR (bilinçli). Açıklamalar /hizmetlerimiz'de ve
 * yedi hizmet sayfasında yazılı; tekrar edilseydi iki sayfa aynı metni
 * paylaşırdı. Bu bölüm yalnız kapsamın SINIRINI gösteriyor.
 */
defineProps({
  /** İç sayfa içeriği — bkz. shared/utils/ic-sayfa.ts */
  bolum: { type: Object, default: () => ({}) },

  /** `{ ad, slug }` — yalnız kendi sayfası olan hizmetler. */
  hizmetler: { type: Array, default: () => [] },
})
</script>

<template>
  <section v-if="hizmetler.length" class="hk-kap" aria-labelledby="kapsam-baslik">
    <div class="hk sahne-alan">
      <p class="hk-kunye op-kunye">04 / HİZMET ALANLARI</p>

      <h2 id="kapsam-baslik" class="hk-h2 tip-anlati">{{ bolum.heading }}</h2>

      <p v-if="bolum.lead" class="hk-giris tip-giris">{{ bolum.lead }}</p>

      <ol class="hk-liste">
        <li v-for="(h, i) in hizmetler" :key="h.slug" class="hk-oge">
          <p class="hk-no op-kunye">{{ String(i + 1).padStart(2, '0') }}</p>
          <p class="hk-ad tip-alt">
            <NuxtLink :to="`/${h.slug}`" class="hk-bag">{{ h.ad }}</NuxtLink>
          </p>
        </li>
      </ol>

      <p class="hk-kapanis tip-govde">
        Her birinin kapsamı, hangi durumda gerektiği ve neyi içermediği
        <NuxtLink to="/hizmetlerimiz" class="op-bag op-bag--sakin hk-satir-bag"
          >nakliyat hizmetleri</NuxtLink
        >
        sayfasında ayrı ayrı yazılı.
      </p>
    </div>
  </section>
</template>

<style scoped>
.hk-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
  border-top: 1px solid rgb(var(--c-rule));
}
.hk {
  padding-block: var(--sahne-dikey);
}
.hk-kunye {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.hk-h2 {
  max-width: 18ch;
}
.hk-giris {
  margin: clamp(1rem, 0.85rem + 0.6vw, 1.5rem) 0 0;
}

.hk-liste {
  list-style: none;
  margin: clamp(1.75rem, 1.5rem + 1vw, 2.75rem) 0 0;
  padding: 0;
  border-bottom: 1px solid rgb(var(--c-rule));
}
.hk-oge {
  position: relative;
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  gap: 0 clamp(0.75rem, 0.5rem + 1vw, 1.5rem);
  align-items: baseline;
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem);
}
.hk-no {
  margin: 0;
  color: rgb(var(--c-ink-soft));
  font-variant-numeric: tabular-nums;
}
.hk-ad {
  margin: 0;
}
.hk-bag {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.hk-bag:hover {
  border-bottom-color: rgb(var(--c-signal));
}
.hk-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}
/* Dokunma hedefi satırın tamamı. Yalnız metin tıklanabilir olsaydı hedef
   ~140×24 px kalırdı; 44 px kuralı satır yüksekliğiyle karşılanıyor.
   (Aynı düzeltme `region/IlceDizini.vue`'da ölçülerek yapılmıştı.) */
.hk-bag::after {
  content: '';
  position: absolute;
  inset: 0;
}

.hk-kapanis {
  margin: clamp(1.75rem, 1.5rem + 1vw, 2.5rem) 0 0;
  max-width: var(--olcu-govde);
}
/* `.op-bag` tek başına duran eylem bağlantısı için tasarlandı (44 px taban
   yüksekliği). Cümlenin içinde o ölçü satır aralığını açıyor ve alt çizgi
   metinden kopuyor; satır içi kullanım metnin kendi ölçüsüne dönüyor. */
.hk-satir-bag {
  min-height: 0;
  font-size: inherit;
  font-weight: 600;
  padding-bottom: 0.05em;
}

@media (min-width: 1024px) {
  .hk {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .hk-kunye {
    grid-column: 1 / 8;
  }
  .hk-h2 {
    grid-column: 2 / 7;
  }
  .hk-giris {
    grid-column: 8 / 13;
    align-self: end;
    margin: 0;
  }
  /* Yedi satır tek sütunda uzun bir şerit olurdu; iki sütuna bölünüyor
     ama sıralama SÜTUN yönünde akıyor (01–04 solda, 05–07 sağda). */
  .hk-liste {
    grid-column: 2 / 13;
    columns: 2;
    column-gap: var(--sahne-kolon-arasi);
    border-bottom: 0;
  }
  .hk-oge {
    break-inside: avoid;
    border-bottom: 1px solid rgb(var(--c-rule));
    border-top: 0;
  }
  .hk-kapanis {
    grid-column: 2 / 8;
  }
}
</style>
