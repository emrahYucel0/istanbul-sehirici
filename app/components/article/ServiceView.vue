<script setup>
/**
 * HİZMET DETAYI — V2. Yedi hizmetin TEK şablonu (/asansorlu-nakliyat gibi
 * kök adreslerde yayınlanıyor).
 *
 * ROL AYRIMI
 *   Ana sayfa      sinematik      — üç imza, yapışkan sahneler
 *   /hizmetlerimiz editoryal dizin — keşif, tarama, yönlendirme
 *   BU SAYFA       operasyonel açıklayıcı — anlama ve karar
 * Ana sayfanın imzaları burada tekrar EDİLMİYOR: pin yok, uzun sahne yok,
 * scrub yok. Sayfanın kalitesi hareketten değil bilgiden geliyor.
 *
 * IZGARA: ana sayfanın eksenleriyle akraba ama her bölüm 12 kolon gösterisi
 * değil. Künye A ekseninde, metin B'de, yardımcı alan D'de; okuma metni
 * `--olcu-govde` ile 58ch'de tutuluyor — 1920'de bile satır uzamıyor.
 *
 * ESKİ ŞABLONDAN ÇIKARILANLAR ve gerekçeleri
 *   · ✓ işaretli "neler dahil" listesi — SaaS özellik listesi diliydi;
 *     yerine ölçü çizgisiyle açılan kütük satırları geldi.
 *   · Yuvarlak köşeli görsel ve kart yüzeyleri — `--r-*` / `--shadow-*`
 *     token'ları duruyor (başka sayfalar kullanıyor) ama bu family artık
 *     kullanmıyor.
 *   · "Bu hizmeti Türkiye genelinde veriyoruz" + 24 il/ilçe rozeti —
 *     hem bağlantı çiftliğiydi hem de İstanbul konumlandırmasıyla
 *     çelişiyordu. Yerine ölçülü bir İstanbul ilçe satırı geldi.
 *   · "Bu sayfada" içindekiler menüsü — dört bölümlük bir sayfada
 *     gezinme yardımı değil, gürültüydü.
 *   · Önceki/sonraki hizmet gezinmesi (`article-pager-nav`) — yuvarlak
 *     köşeli kenarlıklı bir kart olarak çiziliyordu ve sıralaması
 *     panel `order` alanına bağlıydı, yani içerik ilişkisi taşımıyordu.
 *     Yerini "birlikte sık gereken hizmetler" aldı: elle kurulmuş,
 *     gerçek eşleşmeler. Bileşen duruyor; yazı ve bölge sayfaları
 *     kullanmaya devam ediyor.
 */
import { computed } from 'vue'

const props = defineProps({
  service: { type: Object, required: true },
  /** Bağlantı verilecek İstanbul ilçeleri (hafif kayıtlar). */
  regions: { type: Array, default: () => [] },
  /** Aynı ailedeki diğer hizmetler — sayfa sonu keşfi için. */
  related: { type: Array, default: () => [] },
})

const includes = computed(() =>
  parseJsonArray(props.service?.includes).filter((item) => String(item || '').trim())
)

const faqs = computed(() =>
  parseJsonArray(props.service?.faqs).filter((item) => item?.question && item?.answer)
)

/**
 * Bölüm numaraları İÇERİĞE göre üretiliyor, sabit yazılmıyor: bir hizmette
 * `content` boşsa numaralar 01–02–03 diye kaymaya devam ediyor, boşlukta
 * "02" görünmüyor. Şablon içeriği zorlamıyor, içerik şablonu diziyor.
 */
const bolumler = computed(() => {
  const liste = []
  if (includes.value.length) liste.push({ anahtar: 'kapsam', etiket: 'KAPSAM' })
  if (props.service?.content) liste.push({ anahtar: 'nasil', etiket: 'NASIL YAPILIYOR' })
  if (props.regions.length) liste.push({ anahtar: 'bolge', etiket: 'İSTANBUL' })
  if (faqs.value.length) liste.push({ anahtar: 'sss', etiket: 'SORULAR' })
  liste.push({ anahtar: 'adim', etiket: 'SONRAKİ ADIM' })
  return Object.fromEntries(liste.map((b, i) => [b.anahtar, { ...b, no: String(i + 1).padStart(2, '0') }]))
})

const imageAlt = computed(
  () => props.service?.imageAlt?.trim() || `${props.service?.title || 'Hizmet'} çalışması`
)
</script>

<template>
  <article class="hz">
    <!-- ══ GİRİŞ ══════════════════════════════════════════════════════ -->
    <section class="hz-giris-kap" aria-labelledby="hizmet-baslik">
      <div class="hz-giris sahne-alan">
        <nav class="hz-yol" aria-label="Yol izi">
          <ol class="hz-yol-liste" itemscope itemtype="https://schema.org/BreadcrumbList">
            <li class="hz-yol-oge" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
              <NuxtLink to="/" itemprop="item"><span itemprop="name">Ana sayfa</span></NuxtLink>
              <meta itemprop="position" content="1" />
            </li>
            <li class="hz-yol-oge" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
              <NuxtLink to="/hizmetlerimiz" itemprop="item"><span itemprop="name">Hizmetlerimiz</span></NuxtLink>
              <meta itemprop="position" content="2" />
            </li>
            <li class="hz-yol-oge" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
              <span itemprop="name" aria-current="page">{{ service.title }}</span>
              <meta itemprop="position" content="3" />
            </li>
          </ol>
        </nav>

        <p class="hz-kunye op-kunye">HİZMET / İSTANBUL</p>
        <h1 id="hizmet-baslik" class="hz-h1 tip-baslik">{{ service.title }}</h1>
        <p v-if="service.subtitle" class="hz-etiket op-kunye">{{ service.subtitle }}</p>
        <p v-if="service.excerpt" class="hz-giris-metin tip-giris">{{ service.excerpt }}</p>

        <figure v-if="service.imagePath" class="hz-gorsel">
          <NuxtImg
            :src="service.imagePath"
            :alt="imageAlt"
            class="hz-foto"
            format="webp"
            sizes="xs:90vw sm:90vw md:90vw lg:44vw xl:44vw"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
        </figure>
      </div>
    </section>

    <!-- ══ KAPSAM ═════════════════════════════════════════════════════
         Kütük satırları. Onay işareti YOK: bunlar satılan özellikler
         değil, yapılan işler. Her satır ölçü çizgisiyle açılıyor —
         sayfanın çizgi diliyle aynı. -->
    <section v-if="includes.length" class="hz-bolum" aria-labelledby="kapsam">
      <div class="hz-alan sahne-alan">
        <p class="hz-no op-kunye">{{ bolumler.kapsam.no }} / {{ bolumler.kapsam.etiket }}</p>
        <h2 id="kapsam" class="hz-h2 tip-anlati">Bu hizmet neleri kapsıyor?</h2>
        <ul class="hz-kapsam">
          <li v-for="item in includes" :key="item" class="hz-madde tip-govde">{{ item }}</li>
        </ul>
      </div>
    </section>

    <!-- ══ NASIL YAPILIYOR ════════════════════════════════════════════
         Panelden gelen HTML. Ölçü 58ch'de sabit; 1920'de satır uzamıyor. -->
    <section v-if="service.content" class="hz-bolum hz-bolum--cukur" aria-labelledby="nasil">
      <div class="hz-alan sahne-alan">
        <p class="hz-no op-kunye">{{ bolumler.nasil.no }} / {{ bolumler.nasil.etiket }}</p>
        <h2 id="nasil" class="hz-h2 tip-anlati">{{ service.title }} nasıl planlanıyor?</h2>
        <article-prose :html="service.content" class="hz-govde" />
      </div>
    </section>

    <!-- ══ İSTANBUL ═══════════════════════════════════════════════════
         Eski sürümde burası "Türkiye genelinde veriyoruz" başlığıyla 24
         il/ilçe rozeti basıyordu. Artık yalnız İstanbul ilçeleri ve
         rozet değil, ölçü çizgisiyle ayrılmış düz bağlantı satırı. -->
    <section v-if="regions.length" class="hz-bolum" aria-labelledby="bolge">
      <div class="hz-alan sahne-alan">
        <p class="hz-no op-kunye">{{ bolumler.bolge.no }} / {{ bolumler.bolge.etiket }}</p>
        <h2 id="bolge" class="hz-h2 tip-anlati">Hangi ilçede nasıl çalışıyoruz?</h2>
        <p class="hz-bolum-giris tip-govde">
          Erişim koşulları ilçeden ilçeye değişiyor. Adresinizin bulunduğu
          ilçenin sayfasında orada neyin plana girdiğini okuyabilirsiniz.
        </p>
        <ul class="hz-ilceler">
          <li v-for="r in regions" :key="r.slug" class="hz-ilce">
            <NuxtLink :to="`/${r.slug}`">{{ r.subtitle || r.shortTitle || r.title }}</NuxtLink>
          </li>
        </ul>
        <NuxtLink to="/bolgelerimiz" class="op-bag op-bag--sakin hz-bag">Tüm hizmet bölgeleri</NuxtLink>
      </div>
    </section>

    <!-- ══ SORULAR ════════════════════════════════════════════════════
         Akordeon değil: dört-beş soruyu gizlemek için JS yüklemenin
         karşılığı yok. Soru/cevap ilişkisi olduğu için `dl`; hepsi ilk
         HTML'de, tarayıcıya da ekran okuyucuya da açık. -->
    <section v-if="faqs.length" class="hz-bolum hz-bolum--cukur" aria-labelledby="sss">
      <div class="hz-alan sahne-alan">
        <p class="hz-no op-kunye">{{ bolumler.sss.no }} / {{ bolumler.sss.etiket }}</p>
        <h2 id="sss" class="hz-h2 tip-anlati">Bu hizmet hakkında sorulanlar</h2>
        <dl class="hz-sss">
          <div v-for="f in faqs" :key="f.question" class="hz-sss-oge">
            <dt class="hz-soru tip-alt">{{ f.question }}</dt>
            <dd class="hz-cevap tip-govde">{{ f.answer }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- ══ SONRAKİ ADIM ═══════════════════════════════════════════════
         Eski `FinalCta` bloğu bu family'de artık render edilmiyor; onun
         yerine cümlenin içinde iki gerçek yol ve iki-üç ilgili hizmet. -->
    <section class="hz-bolum" aria-labelledby="adim">
      <div class="hz-alan sahne-alan">
        <p class="hz-no op-kunye">{{ bolumler.adim.no }} / {{ bolumler.adim.etiket }}</p>
        <h2 id="adim" class="hz-h2 tip-anlati">Kapsamı birlikte çıkaralım.</h2>
        <p class="hz-kapanis tip-govde">
          Bu hizmetin sizin adresinizde ne kadarını gerektirdiği keşifte
          netleşiyor. Kaba bir aralık için
          <NuxtLink to="/fiyat-hesaplama" class="op-bag op-bag--sakin hz-satirbag">fiyat hesaplama aracını</NuxtLink>
          kullanabilir, kesin kapsam için
          <NuxtLink to="/iletisim" class="op-bag op-bag--sakin hz-satirbag">keşif talebi</NuxtLink>
          bırakabilirsiniz.
        </p>

        <div v-if="related.length" class="hz-ilgili">
          <p class="hz-ilgili-baslik op-kunye">BİRLİKTE SIK GEREKEN HİZMETLER</p>
          <ul class="hz-ilgili-liste">
            <li v-for="r in related" :key="r.slug" class="hz-ilgili-oge">
              <NuxtLink :to="`/${r.slug}`" class="hz-ilgili-bag">
                <span class="hz-ilgili-ad tip-alt">{{ r.title }}</span>
                <span v-if="r.subtitle" class="hz-ilgili-not tip-not">{{ r.subtitle }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </article>
</template>

<style scoped>
.hz {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}

/* ---- Giriş ------------------------------------------------------------- */
.hz-giris-kap {
  border-bottom: 1px solid rgb(var(--c-rule));
}
.hz-giris {
  padding-block: var(--sahne-dikey-dar) var(--sahne-dikey);
}
.hz-yol-liste {
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
.hz-yol-oge + .hz-yol-oge::before {
  content: '/';
  margin-right: 0.5rem;
  color: rgb(var(--c-measure));
}
.hz-yol a {
  color: rgb(var(--c-ink-soft));
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.hz-yol a:hover {
  color: rgb(var(--c-ink));
  border-bottom-color: rgb(var(--c-ink));
}
.hz-yol [aria-current='page'] { color: rgb(var(--c-ink)); }

.hz-kunye { margin-top: clamp(2rem, 1.5rem + 2vw, 3.5rem); }
.hz-h1 { margin-top: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem); max-width: 18ch; }
.hz-etiket { margin-top: 0.75rem; letter-spacing: 0.1em; }
.hz-giris-metin { margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem); }

.hz-gorsel {
  margin: clamp(2rem, 1.5rem + 1.5vw, 3rem) 0 0;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: rgb(var(--c-paper-sunken));
}
.hz-foto {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ---- Ortak bölüm ------------------------------------------------------- */
.hz-bolum {
  background: rgb(var(--c-paper));
}
/* Tek renk değişimi: anlatı bölümleri bir kademe çukurda. Kart değil,
   yüzey — kenarlık, köşe ve gölge yok. */
.hz-bolum--cukur {
  background: rgb(var(--c-paper-sunken));
}
.hz-alan {
  padding-block: var(--sahne-dikey);
}
.hz-no { margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem); }
.hz-h2 { max-width: 22ch; }
.hz-bolum-giris {
  margin: clamp(1rem, 0.85rem + 0.6vw, 1.5rem) 0 0;
  max-width: var(--olcu-govde);
}

/* ---- Kapsam kütüğü ----------------------------------------------------- */
.hz-kapsam {
  list-style: none;
  margin: clamp(2rem, 1.5rem + 1.5vw, 3rem) 0 0;
  padding: 0;
  display: grid;
  gap: 0;
}
.hz-madde {
  position: relative;
  margin: 0;
  padding: clamp(0.875rem, 0.75rem + 0.5vw, 1.125rem) 0 clamp(0.875rem, 0.75rem + 0.5vw, 1.125rem) 2.25rem;
  border-top: 1px solid rgb(var(--c-rule));
  color: rgb(var(--c-ink));
  max-width: none;
}
.hz-madde:last-child { border-bottom: 1px solid rgb(var(--c-rule)); }
/* Madde işareti nokta ya da onay değil, ölçü çizgisi. */
.hz-madde::before {
  content: '';
  position: absolute;
  left: 0;
  top: 1.6em;
  width: 1.25rem;
  height: 1px;
  background: rgb(var(--c-measure));
}

/* ---- Gövde metni ------------------------------------------------------- */
.hz-govde {
  margin-top: clamp(1.5rem, 1.25rem + 1vw, 2.25rem);
  max-width: var(--olcu-govde);
}

/* ---- İlçe satırı ------------------------------------------------------- */
.hz-ilceler {
  list-style: none;
  margin: clamp(1.5rem, 1.25rem + 1vw, 2.25rem) 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0 clamp(1rem, 0.75rem + 1vw, 1.75rem);
}
.hz-ilce a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: 0.9375rem;
  color: rgb(var(--c-ink));
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.hz-ilce a:hover { border-bottom-color: rgb(var(--c-ink)); }
.hz-bag { margin-top: 1rem; }

/* ---- Sorular ----------------------------------------------------------- */
.hz-sss {
  margin: clamp(2rem, 1.5rem + 1.5vw, 3rem) 0 0;
}
.hz-sss-oge {
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(1.5rem, 1.25rem + 1vw, 2.25rem);
}
.hz-sss-oge:last-child { border-bottom: 1px solid rgb(var(--c-rule)); }
.hz-soru { max-width: 34ch; }
.hz-cevap {
  margin: 0.75rem 0 0;
  max-width: var(--olcu-govde);
}

/* ---- Sonraki adım ------------------------------------------------------ */
.hz-kapanis {
  margin: clamp(1.5rem, 1.25rem + 1vw, 2.25rem) 0 0;
  max-width: var(--olcu-govde);
}
.hz-satirbag {
  min-height: 0;
  font-size: inherit;
  font-weight: 600;
  padding-bottom: 0.05em;
}

.hz-ilgili {
  margin-top: clamp(2.5rem, 2rem + 2vw, 4rem);
  border-top: 1px solid rgb(var(--c-rule));
  padding-top: clamp(1.25rem, 1rem + 0.8vw, 1.75rem);
}
.hz-ilgili-liste {
  list-style: none;
  margin: 1.25rem 0 0;
  padding: 0;
  display: grid;
  gap: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}
.hz-ilgili-bag {
  display: block;
  text-decoration: none;
  color: rgb(var(--c-ink));
}
.hz-ilgili-ad {
  display: block;
  border-bottom: 1px solid rgb(var(--c-measure));
  padding-bottom: 0.25rem;
}
.hz-ilgili-bag:hover .hz-ilgili-ad { border-bottom-color: rgb(var(--c-ink)); }
.hz-ilgili-not { display: block; margin-top: 0.5rem; }


/* ===========================================================================
   MASAÜSTÜ — künye A ekseninde, metin B'de, yardımcı alan D'de
   ======================================================================== */
@media (min-width: 1024px) {
  .hz-giris {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }
  .hz-yol { grid-column: 1 / 8; }
  .hz-kunye,
  .hz-h1,
  .hz-etiket,
  .hz-giris-metin { grid-column: 2 / 8; }
  .hz-gorsel {
    grid-column: 8 / 13;
    grid-row: 1 / 6;
    align-self: stretch;
    margin: 0;
    aspect-ratio: auto;
    min-height: 24rem;
  }

  .hz-alan {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .hz-no { grid-column: 1 / 8; }
  .hz-h2 { grid-column: 2 / 8; }
  .hz-bolum-giris { grid-column: 9 / 13; margin: 0; align-self: end; }

  /* Kapsam ve sorular tam ölçüde; metin kendi max-width'i ile duruyor. */
  .hz-kapsam,
  .hz-sss,
  .hz-ilceler,
  .hz-bag,
  .hz-ilgili { grid-column: 1 / 13; }
  .hz-govde,
  .hz-kapanis { grid-column: 2 / 9; }

  /* Kapsam maddeleri iki sütun: altı madde tek sütunda gereksiz uzuyordu. */
  .hz-kapsam {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: clamp(2rem, 1.5rem + 2vw, 4rem);
  }

  /* SORU SOLDA, CEVAP SAĞDA — ana sayfadaki SSS kütüğüyle aynı düzen.
     Soru ve cevabı üst üste yığmak sağ yarıyı boş bırakıyordu ve iki
     bölüm aynı sistemin parçası gibi durmuyordu. */
  .hz-sss-oge {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }
  .hz-soru { grid-column: 1 / 7; }
  .hz-cevap { grid-column: 7 / 13; margin: 0; }
  /* İki sütunda "son çocuk" alt çizgisi yanlış satıra düşüyor; alt kenarlık
     yerine üst kenarlık düzeni zaten her satırı ayırıyor. */
  .hz-madde:last-child { border-bottom: 0; }
  .hz-kapsam { border-bottom: 1px solid rgb(var(--c-rule)); }

  .hz-ilgili-liste { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
