<script setup>
/**
 * HİZMETLER SAYFASI GİRİŞİ.
 *
 * İÇERİK KAYNAĞI — `InternalPageSection('hizmetler', 'giris')`.
 *
 * M7'ye kadar H1, giriş paragrafı ve fotoğrafın adresi/alt metni bu
 * dosyanın içinde sabitti; işletme bir kelimeyi değiştirmek için kod
 * değişikliği istemek zorundaydı. Artık panelden yönetiliyor.
 *
 * YEDEK METİN YOK. Kayıt gelmezse alan basılmıyor — bileşende ikinci bir
 * tam metin kopyası bırakmak, panelin sahte olması demek olurdu (M4'te
 * ana sayfa için konan kural).
 *
 * KODDA KALANLAR — bilerek:
 *   · yol izi (breadcrumb) ve işaretlemesi   rota haritası
 *   · "HİZMETLER / İSTANBUL" künyesi          tasarım dili
 *   · görselin boyut/yükleme öznitelikleri    performans kararı
 */
defineProps({
  bolum: { type: Object, required: true },
})
</script>

<template>
  <section class="sg-kap" aria-labelledby="hizmetler-baslik">
    <div class="sg sahne-alan">
      <!-- Yol izi — ekranda görünen ve işaretlenen aynı liste. -->
      <nav class="sg-yol" aria-label="Yol izi">
        <ol class="sg-yol-liste" itemscope itemtype="https://schema.org/BreadcrumbList">
          <li
            class="sg-yol-oge"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <NuxtLink to="/" itemprop="item"><span itemprop="name">Ana sayfa</span></NuxtLink>
            <meta itemprop="position" content="1" />
          </li>
          <li
            class="sg-yol-oge"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <span itemprop="name" aria-current="page">Hizmetlerimiz</span>
            <meta itemprop="position" content="2" />
          </li>
        </ol>
      </nav>

      <p class="sg-kunye op-kunye">HİZMETLER / İSTANBUL</p>

      <h1 id="hizmetler-baslik" class="sg-h1 tip-baslik">{{ bolum.heading }}</h1>

      <p v-if="bolum.lead" class="sg-giris tip-giris">{{ bolum.lead }}</p>

      <figure class="sg-gorsel">
        <NuxtImg
          v-if="bolum.imagePath"
          :src="bolum.imagePath"
          :alt="bolum.imageAlt || ''"
          class="sg-foto"
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
.sg-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
  border-bottom: 1px solid rgb(var(--c-rule));
}
.sg {
  padding-block: var(--sahne-dikey-dar) var(--sahne-dikey);
}

/* ---- Yol izi ----------------------------------------------------------- */
.sg-yol-liste {
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
.sg-yol-oge + .sg-yol-oge::before {
  content: '/';
  margin-right: 0.5rem;
  color: rgb(var(--c-measure));
}
.sg-yol a {
  color: rgb(var(--c-ink-soft));
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.sg-yol a:hover {
  color: rgb(var(--c-ink));
  border-bottom-color: rgb(var(--c-ink));
}
.sg-yol [aria-current='page'] {
  color: rgb(var(--c-ink));
}

.sg-kunye {
  margin-top: clamp(2rem, 1.5rem + 2vw, 3.5rem);
}
.sg-h1 {
  margin-top: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
  max-width: 16ch;
}
.sg-giris {
  margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}

.sg-gorsel {
  margin: clamp(2rem, 1.5rem + 1.5vw, 3rem) 0 0;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgb(var(--c-paper-sunken));
}
.sg-foto {
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
  .sg {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }
  .sg-yol { grid-column: 1 / 8; }
  .sg-kunye { grid-column: 2 / 8; }
  .sg-h1 { grid-column: 2 / 8; }
  .sg-giris { grid-column: 2 / 8; }
  .sg-gorsel {
    grid-column: 8 / 13;
    grid-row: 1 / 5;
    align-self: stretch;
    margin: 0;
    /* Sağ alan metin sütununun yüksekliğini alıyor; oran serbest. */
    aspect-ratio: auto;
    min-height: 22rem;
  }
}
</style>
