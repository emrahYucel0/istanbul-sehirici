<script setup>
/**
 * HİZMETLER BİRLİKTE ÇALIŞIR.
 *
 * İÇERİK KAYNAĞI — `InternalPageSection('hizmetler', 'birlikte')` ve
 * `('hizmetler', 'sahne')`.
 *
 * M7'ye kadar üç örnek durum, iki sahne fotoğrafı ve alt metinleri bu
 * dosyada sabit dizilerdi. Üçü de işletmenin değiştirmesi beklenen içerik;
 * panelden yönetiliyor.
 *
 * ÜÇ VE İKİ SAYISI KODDA KALIYOR: ızgara üç sütuna, fotoğraf bandı iki
 * kareye göre kurulu. Sözleşme öğe sayısını sabitliyor
 * (shared/utils/ic-sayfa.ts) ve sunucu fazlasını REDDEDİYOR.
 *
 * KAPANIŞ CÜMLESİ KODDA: içinde iki sayfa içi bağlantı taşıyor. Onu CMS'e
 * almak ya bağlantıları düşürmek ya da panele HTML sokmak olurdu.
 *
 * HİZMET ADLARI (`hizmetler` rozetleri) örnek durumun parçası; hizmet
 * ENVANTERİ değil. Envanterin tek sahibi `Service` ve bu bileşen onu
 * okumuyor.
 */
const props = defineProps({
  bolum: { type: Object, default: () => ({}) },
  sahne: { type: Object, default: () => ({}) },
})

const ornekler = computed(() => props.bolum.items || [])
const gorseller = computed(() => props.sahne.items || [])
</script>

<template>
  <section class="sb-kap" aria-labelledby="birlikte-baslik">
    <div class="sb sahne-alan">
      <p class="sb-kunye op-kunye">02 / HİZMETLER BİRLİKTE ÇALIŞIR</p>
      <h2 id="birlikte-baslik" class="sb-h2 tip-anlati">
        {{ bolum.heading }}
      </h2>
      <p v-if="bolum.lead" class="sb-giris tip-giris">{{ bolum.lead }}</p>

      <dl class="sb-liste">
        <div v-for="(o, i) in ornekler" :key="i" class="sb-oge">
          <dt class="sb-etiket op-kunye">{{ o.label }}</dt>
          <dd class="sb-icerik">
            <p class="sb-h3 tip-alt">{{ o.title }}</p>
            <p class="sb-metin tip-not">{{ o.body }}</p>
            <p v-if="o.note" class="sb-cift op-kunye">{{ o.note }}</p>
          </dd>
        </div>
      </dl>

      <div class="sb-kareler">
        <figure v-for="(g, i) in gorseller" :key="i" class="sb-kare">
          <NuxtImg
            :src="g.imagePath"
            :alt="g.imageAlt || ''"
            class="sb-foto"
            format="webp"
            sizes="xs:90vw sm:90vw md:90vw lg:44vw xl:44vw"
            loading="lazy"
            decoding="async"
            width="1448"
            height="1086"
          />
          <figcaption class="sb-not op-kunye">{{ g.body }}</figcaption>
        </figure>
      </div>

      <!-- KEŞİF TALEBİ BAĞLANTISI BURADAN ÇIKTI: bu bölümün hemen altında
           sitenin ortak kapanış imzası duruyor ve aynı çağrıyı telefonuyla
           birlikte o taşıyor. Fiyat aracı farklı bir hedef, kalıyor. -->
      <p class="sb-kapanis tip-govde">
        Hangi hizmetlerin birleşeceği adres görülmeden netleşmiyor. Kaba bir
        aralık için
        <NuxtLink to="/fiyat-hesaplama" class="op-bag op-bag--sakin sb-bag">fiyat hesaplama aracını</NuxtLink>
        kullanabilirsiniz.
      </p>
    </div>
  </section>
</template>

<style scoped>
/* Bu bölüm ÇUKUR yüzeyde: dizin kâğıt, burası bir kademe alçak. Sayfada
   tek renk değişimi bu — bölümün anlatı olduğunu, dizin olmadığını söylüyor. */
.sb-kap {
  background: rgb(var(--c-paper-sunken));
  color: rgb(var(--c-ink));
}
.sb {
  padding-block: var(--sahne-dikey);
}
.sb-kunye {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.sb-h2 {
  max-width: 20ch;
}
.sb-giris {
  margin: clamp(1rem, 0.85rem + 0.6vw, 1.5rem) 0 0;
}

.sb-liste {
  margin: clamp(2.5rem, 2rem + 2vw, 4rem) 0 0;
  display: grid;
  gap: clamp(1.75rem, 1.5rem + 1vw, 2.5rem);
}
.sb-etiket {
  color: rgb(var(--c-ink-soft));
}
.sb-icerik {
  margin: 0.5rem 0 0;
}
.sb-metin {
  margin: 0.625rem 0 0;
  max-width: var(--olcu-govde);
}
/* Hangi iki hizmetin birleştiği — mono, çünkü bu bir etiket çifti. */
.sb-cift {
  margin: 0.875rem 0 0;
  color: rgb(var(--c-ink-soft));
}

.sb-kareler {
  margin: clamp(2.5rem, 2rem + 2vw, 4rem) 0 0;
  display: grid;
  gap: clamp(1.5rem, 1.25rem + 1vw, 2.5rem);
}
.sb-kare {
  margin: 0;
}
.sb-foto {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  background: rgb(var(--c-paper));
}
.sb-not {
  margin-top: 0.75rem;
  letter-spacing: 0.1em;
}

.sb-kapanis {
  margin: clamp(2.5rem, 2rem + 2vw, 4rem) 0 0;
  max-width: var(--olcu-govde);
}
.sb-bag {
  min-height: 0;
  font-size: inherit;
  font-weight: 600;
  padding-bottom: 0.05em;
}

/* ===========================================================================
   MASAÜSTÜ
   ======================================================================== */
@media (min-width: 1024px) {
  .sb {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .sb-kunye { grid-column: 1 / 8; }
  .sb-h2 { grid-column: 2 / 8; }
  .sb-giris { grid-column: 9 / 13; align-self: end; margin: 0; }
  .sb-liste { grid-column: 1 / 13; }

  .sb-oge {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }
  .sb-etiket { grid-column: 1 / 3; padding-top: 0.35rem; }
  .sb-icerik { grid-column: 3 / 9; margin: 0; }

  .sb-kareler {
    grid-column: 1 / 13;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .sb-kapanis { grid-column: 2 / 9; }
}
</style>
