<script setup>
/**
 * HAKKIMIZDA — SAYFA GİRİŞİ.
 *
 * `fixed/PageHeader.vue` bandının (koyu zemin, noktalı desen, beyaz
 * başlık) yerini alıyor. Bant duruyor ve /iletisim, /blog, politika
 * sayfaları onu kullanmaya devam ediyor; yalnız bu sayfa kendi girişine
 * geçti — `service/Giris.vue` ve `region/BolgeGiris.vue` ile aynı kademede.
 *
 * ESKİDE İKİ SORUN VARDI
 *   1. <h1> banttaydı ve yalnızca "Hakkımızda" yazıyordu. Sayfanın ne
 *      söylediğini değil, menüdeki adını tekrar ediyordu.
 *   2. Bandın alt başlığı "On iki yıldır evden eve nakliyat yapıyoruz"
 *      diyordu — doğrulanmamış bir kuruluş süresi, üstelik sayfanın en
 *      görünür yerinde.
 *
 * BAŞLIK VERİDEN GELİYOR. `mainTitle` panelden düzenlenebiliyor; yedeği
 * burada duruyor ki kayıt boşalsa bile sayfa <h1>'siz kalmasın.
 *
 * YOL İZİ BURADA: görünen liste ile `BreadcrumbList` işaretlemesi tek
 * kaynaktan. Bant kalkınca ikisi de buraya taşındı.
 */
const props = defineProps({
  /** `AboutSection` kaydı — başlık ve giriş paragrafının TEK sahibi. */
  veri: { type: Object, default: null },
  /** `InternalPageSection('hakkimizda', 'giris')` — yalnız fotoğraf. */
  bolum: { type: Object, default: () => ({}) },
})

/*
 * YEDEK METİNLER KALDIRILDI (M7).
 *
 * Burada `YEDEK_BASLIK` ve `YEDEK_GIRIS` diye iki tam metin kopyası vardı
 * ve veri gelmezse onlar basılıyordu. Yani aynı cümlenin İKİ çalışma zamanı
 * kaynağı vardı: panel ve bileşen. Yönetici panelden metni değiştirse bile,
 * kayıt bir sebeple boş kalırsa sayfa eski cümleyi göstermeye devam eder ve
 * kimse nedenini anlamazdı — M4'te ana sayfa için kapatılan tuzağın aynısı.
 *
 * Artık tek kaynak `AboutSection`. Alan boşsa hiç basılmıyor.
 */
const baslik = computed(() => props.veri?.mainTitle?.trim() || '')
const giris = computed(() => props.veri?.description1?.trim() || '')

/**
 * Ana sayfadaki "asansörsüz kat" karesi. Bu sayfanın konusu taşımanın
 * gününden önce çözülen koşullar; merdiven karesi tam olarak onu
 * gösteriyor. Yeni görsel ÜRETİLMEDİ (bkz. rapor: görsel borcu).
 *
 * "Ekibimiz" fotoğrafı KALDIRILDI: sentetik bir görsel gerçek ekip diye
 * sunuluyordu ("Güler yüzlü nakliyat ekibimiz modern araçlarımızla
 * beraber"). Kayıt silinmedi, yalnız basılmıyor.
 */
</script>

<template>
  <section class="hg-kap" aria-labelledby="hakkimizda-baslik">
    <div class="hg sahne-alan">
      <nav class="hg-yol" aria-label="Yol izi">
        <ol class="hg-yol-liste" itemscope itemtype="https://schema.org/BreadcrumbList">
          <li
            class="hg-yol-oge"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <NuxtLink to="/" itemprop="item"><span itemprop="name">Ana sayfa</span></NuxtLink>
            <meta itemprop="position" content="1" />
          </li>
          <li
            class="hg-yol-oge"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <span itemprop="name" aria-current="page">Hakkımızda</span>
            <meta itemprop="position" content="2" />
          </li>
        </ol>
      </nav>

      <p class="hg-kunye op-kunye">İSTANBUL / HAKKIMIZDA</p>

      <h1 id="hakkimizda-baslik" class="hg-h1 tip-baslik">{{ baslik }}</h1>

      <p class="hg-giris tip-giris">{{ giris }}</p>

      <figure v-if="bolum.imagePath" class="hg-gorsel">
        <NuxtImg
          :src="bolum.imagePath"
          :alt="bolum.imageAlt || ''"
          class="hg-foto"
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
.hg-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
  border-bottom: 1px solid rgb(var(--c-rule));
}
.hg {
  padding-block: var(--sahne-dikey-dar) var(--sahne-dikey);
}

/* ---- Yol izi ----------------------------------------------------------- */
.hg-yol-liste {
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
.hg-yol-oge + .hg-yol-oge::before {
  content: '/';
  margin-right: 0.5rem;
  color: rgb(var(--c-measure));
}
.hg-yol a {
  color: rgb(var(--c-ink-soft));
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.hg-yol a:hover {
  color: rgb(var(--c-ink));
  border-bottom-color: rgb(var(--c-ink));
}
.hg-yol [aria-current='page'] {
  color: rgb(var(--c-ink));
}

.hg-kunye {
  margin-top: clamp(2rem, 1.5rem + 2vw, 3.5rem);
}
.hg-h1 {
  margin-top: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
  max-width: 17ch;
}
.hg-giris {
  margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}

.hg-gorsel {
  margin: clamp(2rem, 1.5rem + 1.5vw, 3rem) 0 0;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgb(var(--c-paper-sunken));
}
.hg-foto {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 45%;
}

/* ===========================================================================
   MASAÜSTÜ — künye/başlık/giriş B ekseninde, görsel D alanında
   ======================================================================== */
@media (min-width: 1024px) {
  .hg {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }
  .hg-yol {
    grid-column: 1 / 8;
  }
  .hg-kunye {
    grid-column: 2 / 8;
  }
  .hg-h1 {
    grid-column: 2 / 8;
  }
  .hg-giris {
    grid-column: 2 / 8;
  }
  .hg-gorsel {
    grid-column: 8 / 13;
    grid-row: 1 / 5;
    align-self: stretch;
    margin: 0;
    aspect-ratio: auto;
    min-height: 24rem;
  }
}
</style>
