<script setup>
/**
 * 02 / NASIL ÇALIŞIYORUZ — anlatı + karar kütüğü.
 *
 * Eski `about/Story.vue`'nun yerini alıyor. O bileşen aynı üç metni
 * yuvarlak numara madalyonları ve aralarına çizilen dikey rayla
 * gösteriyordu; sayfanın geri kalanında olmayan bir görsel dil.
 *
 * KÜTÜK NEDEN BURADA
 * Sayfanın "biz kimiz" sorusuna verdiği asıl cevap bu dört karar. Anlatı
 * bu kararların nereden çıktığını söylüyor; kütük ne olduklarını.
 *
 * ANA SAYFANIN SÜREÇ BÖLÜMÜNÜ KOPYALAMIYOR (bilinçli). Orada beş
 * OPERASYON adımı var: KEŞİF · PAKETLEME · SÖKÜM VE YÜKLEME · KAMYON ·
 * YERLEŞİM — yani taşıma gününün fiziksel sırası. Buradaki dört madde
 * fiziksel bir sıra değil, her işte tekrarlanan KARAR sırası. İkisi aynı
 * şeyi anlatsaydı iki sayfa da değer kaybederdi.
 */
const props = defineProps({
  /** `AboutSection` kaydı — tarihçe metninin TEK sahibi. */
  veri: { type: Object, default: null },
  /** `InternalPageSection('hakkimizda', 'yontem')` — vurgu ve fotoğraf. */
  bolum: { type: Object, default: () => ({}) },
})

// YEDEK BAŞLIK KALDIRILDI (M7) — gerekçe about/Giris.vue içinde: aynı
// cümlenin ikinci bir çalışma zamanı kaynağı olmamalı.
const baslik = computed(() => props.veri?.historyTitle?.trim() || '')
const paragraflar = computed(() =>
  [props.veri?.historyText1, props.veri?.historyText2, props.veri?.historyText3]
    .map((m) => String(m ?? '').trim())
    .filter(Boolean)
)

/**
 * Kütük panelden düzenlenmiyor — `AboutSection` şemasında bunun için alan
 * yok ve yalnız bu bölüm için tablo açmak (migration) bu turun kapsamı
 * dışında. Metinler burada duruyor.
 */
const KARARLAR = [
  {
    no: '01',
    etiket: 'ÖNCE ADRES, SONRA RAKAM',
    metin:
      'Teklif eşya listesinden değil, iki adresin koşullarından çıkıyor. Görülmemiş bir adres için verilen rakam tahmin oluyor; tahmin de taşıma günü düzeltiliyor.',
  },
  {
    no: '02',
    etiket: 'KAPSAMI AYIR',
    metin:
      'Hangi işin bize, hangisinin size ait olduğu baştan ayrılıyor. Ambalaj malzemesi, söküm, yerleştirme ve kutulama ayrı ayrı konuşuluyor — "her şey dahil" tek başına bir kapsam değil.',
  },
  {
    no: '03',
    etiket: 'KISITI ÖNCEDEN ÇÖZ',
    metin:
      'Site yönetiminden alınan giriş izni, araç kabul saati ve yük asansörü tahsisi taşıma gününe bırakılmıyor. Randevusuz gelen araç kapıda beklerken ekip de bekliyor.',
  },
  /**
   * 04'ün ETİKETİ VE SON CÜMLESİ DEĞİŞTİ — İŞ GERÇEĞİ HİZALAMASI.
   *
   * Eskiden "DEĞİŞENİ YAZ" ve "…kayda geçiyor, sözlü kalmıyor" diyordu.
   * İkisi de kapsamın YAZILI verildiğini ima ediyor; kullanıcı bunu
   * doğrulayamadı (bkz. M15B iş gerçeği matrisi). Kararın kendisi —
   * değişikliğin sebebiyle birlikte açıkça konuşulması — korunuyor;
   * kaldırılan tek şey belge taahhüdü. Yapı, sıra ve numaralandırma
   * değişmedi.
   */
  {
    no: '04',
    etiket: 'DEĞİŞENİ AÇIKÇA SÖYLE',
    metin:
      'Plan sahada değişebiliyor: kapıdan geçmeyen bir parça çıkıyor, asansör arızalı oluyor. Değiştiğinde neyin neden değiştiği o anda konuşuluyor, sonraya bırakılmıyor.',
  },
]

</script>

<template>
  <section class="hy-kap" aria-labelledby="yontem-baslik">
    <div class="hy sahne-alan">
      <p class="hy-kunye op-kunye">02 / NASIL ÇALIŞIYORUZ</p>

      <h2 id="yontem-baslik" class="hy-h2 tip-anlati">{{ baslik }}</h2>

      <div v-if="paragraflar.length" class="hy-govde">
        <p v-for="(metin, i) in paragraflar" :key="i" class="hy-metin tip-govde">{{ metin }}</p>
      </div>

      <ol class="hy-kutuk">
        <li v-for="k in KARARLAR" :key="k.no" class="hy-oge">
          <p class="hy-no op-kunye">{{ k.no }}</p>
          <div class="hy-icerik">
            <p class="hy-etiket op-kunye">{{ k.etiket }}</p>
            <p class="hy-aciklama tip-not">{{ k.metin }}</p>
          </div>
        </li>
      </ol>

      <figure v-if="bolum.imagePath" class="hy-gorsel">
        <NuxtImg
          :src="bolum.imagePath"
          :alt="bolum.imageAlt || ''"
          class="hy-foto"
          format="webp"
          sizes="xs:90vw sm:90vw md:90vw lg:42vw xl:42vw"
          loading="lazy"
          decoding="async"
          width="1448"
          height="1086"
        />
        <figcaption v-if="bolum.note" class="hy-not op-kunye">{{ bolum.note }}</figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
/* Çukur yüzey: sayfanın omurgası burada, bir kademe alçak zeminle
   ayrılıyor. Kart değil — kenarlık, köşe yarıçapı ve gölge yok. */
.hy-kap {
  background: rgb(var(--c-paper-sunken));
  color: rgb(var(--c-ink));
  border-block: 1px solid rgb(var(--c-rule));
}
.hy {
  padding-block: var(--sahne-dikey);
}
.hy-kunye {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.hy-h2 {
  max-width: 22ch;
}
.hy-govde {
  margin-top: clamp(1.25rem, 1rem + 0.8vw, 2rem);
}
.hy-metin {
  margin: 0;
  max-width: var(--olcu-govde);
}
.hy-metin + .hy-metin {
  margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}

/* ---- Karar kütüğü ------------------------------------------------------ */
.hy-kutuk {
  list-style: none;
  margin: clamp(2rem, 1.5rem + 1.5vw, 3rem) 0 0;
  padding: 0;
  /* Alt çizgi kapsayıcıda: ızgara boşlukları çizgiyi parçalara bölmesin
     diye (aynı düzeltme `article/IstanbulDistrictView.vue`'da yapılmıştı). */
  border-bottom: 1px solid rgb(var(--c-rule));
}
.hy-oge {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  gap: 0 clamp(0.75rem, 0.5rem + 1vw, 1.5rem);
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}
/* `--c-measure` metin olarak kullanılmıyor: kâğıtta 3,51:1, AA eşiği 4,5:1.
   Numara bir metin, `--c-ink-soft` ile 6,34:1. */
.hy-no {
  margin: 0;
  color: rgb(var(--c-ink-soft));
  font-variant-numeric: tabular-nums;
}
.hy-etiket {
  margin: 0;
  color: rgb(var(--c-ink));
}
.hy-aciklama {
  margin: 0.375rem 0 0;
  max-width: var(--olcu-govde);
}

.hy-gorsel {
  margin: clamp(2rem, 1.5rem + 1.5vw, 3rem) 0 0;
}
.hy-foto {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  background: rgb(var(--c-paper));
}
.hy-not {
  margin: 0.75rem 0 0;
  color: rgb(var(--c-ink-soft));
}

/* ===========================================================================
   MASAÜSTÜ — anlatı B ekseninde, kütük altta tam genişlik, görsel D'de
   ======================================================================== */
@media (min-width: 1024px) {
  .hy {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .hy-kunye {
    grid-column: 1 / 8;
  }
  .hy-h2 {
    grid-column: 2 / 8;
  }
  .hy-govde {
    grid-column: 2 / 8;
  }
  .hy-gorsel {
    grid-column: 9 / 13;
    grid-row: 2 / 5;
    align-self: start;
    margin-top: 0;
  }
  .hy-foto {
    aspect-ratio: 3 / 4;
  }
  /* Kütük 11. sütunda bitiyor: üçüncü sütun `1fr` olduğu için 13'e kadar
     uzatılsaydı metin 58ch'te durur, çizgi 440 px daha devam ederdi. */
  .hy-kutuk {
    grid-column: 2 / 11;
  }
  .hy-oge {
    grid-template-columns: 3rem minmax(0, 22ch) minmax(0, 1fr);
  }
  .hy-icerik {
    display: contents;
  }
  .hy-aciklama {
    margin-top: 0;
  }
}
</style>
