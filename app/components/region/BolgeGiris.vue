<script setup>
/**
 * BÖLGELERİMİZ — SAYFA GİRİŞİ.
 *
 * `fixed/PageHeader.vue` bandının (koyu yeşil zemin, noktalı desen, beyaz
 * başlık) yerini alıyor. Bant duruyor ve diğer iç sayfalar kullanmaya devam
 * ediyor; bu sayfa kendi girişine geçti — `service/Giris.vue` ile aynı
 * kademede: `.tip-baslik`, tek görsel, yapışkan sahne yok.
 *
 * KÜNYE VERİDEN GELİYOR. "39 İLÇE" elle yazılmıyor; dizinin okuduğu aynı
 * kayıttan sayılıyor. Bir ilçe eklendiğinde/çıkarıldığında burası da
 * kendiliğinden değişiyor — sayfa her mahalle eklendiğinde elle
 * güncellenmek zorunda kalmasın diye.
 *
 * YOL İZİ BURADA: görünen liste ile `BreadcrumbList` işaretlemesi tek
 * kaynaktan, ayrışamazlar.
 */
defineProps({
  /** `InternalPageSection('bolgeler', 'giris')` — H1 ve giriş paragrafı.
      İlçe SAYISI buradan gelmiyor; bölge kayıtlarından hesaplanıyor. */
  bolum: { type: Object, default: () => ({}) },
  /** Dizindeki ilçe adedi — künye satırı bunu yazıyor. */
  ilceSayisi: { type: Number, default: 0 },
})

// Ana sayfadaki "kontrollü erişim" karesi. Bu sayfanın konusu tam olarak
// erişim koşulunun adrese göre değişmesi; başka bir kare aynı şeyi
// söylemiyor. (Aynı desen: /hizmetlerimiz girişi de Süreç'in paketleme
// karesini kullanıyor.)
const GORSEL = '/images/sahne-erisim.webp'
</script>

<template>
  <section class="blg-kap" aria-labelledby="bolgeler-baslik">
    <div class="blg sahne-alan">
      <nav class="blg-yol" aria-label="Yol izi">
        <ol class="blg-yol-liste" itemscope itemtype="https://schema.org/BreadcrumbList">
          <li
            class="blg-yol-oge"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <NuxtLink to="/" itemprop="item"><span itemprop="name">Ana sayfa</span></NuxtLink>
            <meta itemprop="position" content="1" />
          </li>
          <li
            class="blg-yol-oge"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <span itemprop="name" aria-current="page">Bölgelerimiz</span>
            <meta itemprop="position" content="2" />
          </li>
        </ol>
      </nav>

      <p class="blg-kunye op-kunye">
        İSTANBUL<span v-if="ilceSayisi"> / {{ ilceSayisi }} İLÇE</span>
      </p>

      <h1 id="bolgeler-baslik" class="blg-h1 tip-baslik">{{ bolum.heading }}</h1>

      <p v-if="bolum.lead" class="blg-giris tip-giris">{{ bolum.lead }}</p>

      <figure class="blg-gorsel">
        <NuxtImg
          :src="GORSEL"
          alt="Site girişinde kapalı bariyer ve güvenlik kulübesi; nakliye kamyonu araç kabul noktasında bekliyor"
          class="blg-foto"
          format="webp"
          sizes="xs:90vw sm:90vw md:90vw lg:42vw xl:42vw"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          width="1448"
          height="1086"
        />
      </figure>
    </div>
  </section>
</template>

<style scoped>
.blg-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
  border-bottom: 1px solid rgb(var(--c-rule));
}
.blg {
  padding-block: var(--sahne-dikey-dar) var(--sahne-dikey);
}

/* ---- Yol izi ----------------------------------------------------------- */
.blg-yol-liste {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.5rem;
  margin: 0;
  padding: 0;
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  color: rgb(var(--c-ink-soft));
}
.blg-yol-oge + .blg-yol-oge::before {
  content: '/';
  margin-right: 0.5rem;
  color: rgb(var(--c-measure));
}
.blg-yol a {
  color: rgb(var(--c-ink-soft));
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.blg-yol a:hover {
  color: rgb(var(--c-ink));
  border-bottom-color: rgb(var(--c-ink));
}
.blg-yol [aria-current='page'] {
  color: rgb(var(--c-ink));
}

.blg-kunye {
  margin-top: clamp(2rem, 1.5rem + 2vw, 3.5rem);
}
.blg-h1 {
  margin-top: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
  max-width: 15ch;
}
.blg-giris {
  margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}

.blg-gorsel {
  margin: clamp(2rem, 1.5rem + 1.5vw, 3rem) 0 0;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgb(var(--c-paper-sunken));
}
.blg-foto {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 55%;
}

/* ===========================================================================
   MASAÜSTÜ — künye ve başlık B ekseninde, görsel D alanında
   ======================================================================== */
@media (min-width: 1024px) {
  .blg {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }
  .blg-yol {
    grid-column: 1 / 8;
  }
  .blg-kunye {
    grid-column: 2 / 8;
  }
  .blg-h1 {
    grid-column: 2 / 8;
  }
  .blg-giris {
    grid-column: 2 / 8;
  }
  .blg-gorsel {
    grid-column: 8 / 13;
    grid-row: 1 / 5;
    align-self: stretch;
    margin: 0;
    aspect-ratio: auto;
    min-height: 22rem;
  }
}
</style>
