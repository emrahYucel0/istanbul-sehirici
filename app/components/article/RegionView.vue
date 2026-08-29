<script setup>
/**
 * BÖLGE DETAYI — il ve ilçe sayfalarının görünümü.
 *
 * Bu sayfa sitenin ticari olarak en önemli parçası: hedef "istanbul evden
 * eve nakliyat", "bursa evden eve nakliyat", "pendik evden eve nakliyat"
 * gibi aramalarda üst sıralar.
 *
 * SAYFA YAPISI VE ANAHTAR KELİME YERLEŞİMİ
 * Her h2 başlığı, o bölümün gerçekten cevapladığı arama niyetini taşıyor;
 * anahtar kelime doldurmak için değil, başlık zaten o konuyu anlattığı için:
 *     #hizmetler   → "{Yer} Evden Eve Nakliyat Hizmetlerimiz"
 *     #kunye       → "{Yer} Taşınma Künyesi"
 *     #mahalleler  → "Hizmet Verdiğimiz {Yer} Mahalleleri"
 *     #guzergahlar → "{Yer} Çevresinde Sık Taşınılan Güzergâhlar"
 *     #fiyat       → "{Yer} Evden Eve Nakliyat Fiyatını Etkileyen Faktörler"
 *     #sss         → "{Yer} Nakliyat Hakkında Sık Sorulan Sorular"
 * Gövde metninde ayrıca anahtar kelime tekrarı YAPILMIYOR — aynı ifadeyi
 * paragraf aralarına serpiştirmek, Google'ın "keyword stuffing" olarak
 * değerlendirdiği ve cezalandırdığı desendir.
 *
 * ÇAPA (ANCHOR) BAĞLANTILARI
 * İçindekiler bloğu gerçek `<a href="#...">` bağlantıları üretiyor ve her
 * bölüm başlığının kısa, okunur bir `id`'si var (`#fiyat`, `#sss`). Google
 * bu yapıyı arama sonucunda "Şuraya atla" bağlantıları olarak gösterebiliyor.
 * Kimlikler bilinçli olarak KISA: `#kadikoy-evden-eve-nakliyat-fiyatlari`
 * gibi anahtar kelime yüklü bir id ek bir sıralama faydası sağlamıyor,
 * buna karşılık manipülatif görünüyor ve bakımı zor.
 *
 * DÜZELTİLEN ESKİ HATALAR (korunuyor)
 * 1. Çapa id'leri `subtitle`'dan doğrudan üretiliyordu; içinde boşluk olan
 *    bir ilçe adı (`#Küçük Çekmece-...`) kırık bağlantı veriyordu.
 * 2. Çapa id'leri istemci tarafında JavaScript ile enjekte ediliyordu; ilk
 *    sunucu render'ında ve arama motoru için hiç yoktular.
 * 3. `cities` alanı iki farklı şekilde okunuyordu; tek çözümleyiciye indi.
 * 4. Fiyat tablosunda `scope` ve `<caption>` yoktu.
 */
import { computed } from 'vue'

const props = defineProps({
  region: { type: Object, required: true },
  /** Aynı ile bağlı diğer bölgeler (il sayfasında: o ilin ilçeleri). */
  related: { type: Array, default: () => [] },
  /** Güzergâh hedeflerinin bağlantıya çevrilebilmesi için tüm bölgeler. */
  allRegions: { type: Array, default: () => [] },
  previous: { type: Object, default: null },
  next: { type: Object, default: null },
})

const cityIds = computed(() => parseCityIds(props.region?.cities))

const cityNames = computed(() =>
  cityIds.value.map((id) => turkishCities.find((city) => city.id === id)?.name).filter(Boolean)
)

const areaName = computed(() => props.region?.subtitle?.trim() || props.region?.title || '')

/* ------------------------------------------------------ il / ilçe ayrımı */

const isProvince = computed(() => isProvincePage(props.region))

const districts = computed(() =>
  isProvince.value ? props.related.filter((item) => !isProvincePage(item)) : []
)

/** İlçe sayfasında bir üst kırılım: bağlı olduğu ilin sayfası (varsa). */
const provinceRegion = computed(() => {
  if (isProvince.value) return null
  const provinceSlug = slugify(cityNames.value[0] || '')
  return props.allRegions.find((item) => item.slug === provinceSlug) || null
})

/* --------------------------------------------------------- içerik alanları */

const facts = computed(() =>
  parseJsonArray(props.region?.facts).filter((item) => item?.label && item?.value)
)
const neighborhoods = computed(() =>
  parseJsonArray(props.region?.neighborhoods).filter((name) => String(name || '').trim())
)
const faqs = computed(() =>
  parseJsonArray(props.region?.faqs).filter((item) => item?.question && item?.answer)
)
const priceFactors = computed(() =>
  parseJsonArray(props.region?.priceFactors).filter((item) => item?.factor)
)

/**
 * Güzergâh hedefleri bağlantıya çevrilir.
 *
 * Hedefin slug'ı veritabanında SAKLANMIYOR; burada bölge adından çözülüyor.
 * Eşleşen kayıt yoksa bağlantı üretilmiyor, satır düz metin olarak kalıyor —
 * hedef bölge silinse ya da adı değişse bile 404 veren bir iç bağlantı
 * oluşmuyor. (Kırık iç bağlantı, tarama bütçesini boşa harcayan ve Search
 * Console'da hata olarak görünen bir durumdur.)
 */
const routes = computed(() => {
  const bySlug = new Map(props.allRegions.map((item) => [item.slug, item]))
  return parseJsonArray(props.region?.routes)
    .filter((item) => item?.to)
    .map((item) => {
      const target = bySlug.get(slugify(item.to))
      return {
        to: item.to,
        note: item.note || '',
        slug: target && target.slug !== props.region.slug ? target.slug : null,
      }
    })
})

/* ------------------------------------------------------------ içindekiler */

/**
 * İçindekiler yalnızca GERÇEKTEN var olan bölümleri listeler. Boş bir
 * bölüme bağlantı vermek, tıklayanı sayfanın rastgele bir yerine götürür.
 */
/**
 * Etiket listesi bir İLÇE sayfasında mahalleleri, bir İL sayfasında ise
 * ilçeleri gösteriyor. Aynı başlığı ("… Mahalleleri") ikisinde de kullanmak
 * il sayfasında yanlış olurdu: Nilüfer bir mahalle değil ilçe.
 *
 * İstisna: ilin altında zaten ilçe kartları varsa (İstanbul) etiketler
 * gerçekten merkez mahalleleri olur, o zaman "Mahalleleri" doğru kalır.
 */
const showsDistrictNames = computed(() => isProvince.value && districts.value.length === 0)

const neighborhoodHeading = computed(() =>
  showsDistrictNames.value
    ? `Hizmet Verdiğimiz ${areaName.value} İlçeleri`
    : `Hizmet Verdiğimiz ${areaName.value} Mahalleleri`
)

const neighborhoodLead = computed(() =>
  showsDistrictNames.value
    ? `${areaName.value} genelinde çalışıyoruz; aşağıdaki ilçelerde düzenli taşıma yapıyoruz. Listede göremediğiniz bir adres için de keşif veriyoruz.`
    : `${areaName.value} genelinde çalışıyoruz; aşağıdaki mahallelerde düzenli taşıma yapıyoruz. Listede göremediğiniz bir adres için de keşif veriyoruz.`
)

const sections = computed(() =>
  [
    { id: 'hizmetler', label: 'Hizmetlerimiz', show: Boolean(props.region?.content) },
    { id: 'kunye', label: 'Taşınma künyesi', show: facts.value.length > 0 },
    {
      id: 'mahalleler',
      label: showsDistrictNames.value ? 'İlçeler' : 'Mahalleler',
      show: neighborhoods.value.length > 0,
    },
    { id: 'guzergahlar', label: 'Güzergâhlar', show: routes.value.length > 0 },
    { id: 'fiyat', label: 'Fiyat faktörleri', show: priceFactors.value.length > 0 },
    { id: 'ilceler', label: 'İlçeler', show: districts.value.length > 0 },
    { id: 'sss', label: 'Sık sorulanlar', show: faqs.value.length > 0 },
  ].filter((section) => section.show)
)

// Panelden girilen metin varsa o kullanılır. 120 bölgenin çoğunda bu alan
// bilinçli olarak boş kalıyor (bkz. schema.prisma → Region.imageAlt).
const imageAlt = computed(() => {
  const elleYazilan = props.region?.imageAlt?.trim()
  if (elleYazilan) return elleYazilan

  return areaName.value ? `${areaName.value} evden eve nakliyat çalışmamız` : 'Bölge görseli'
})
</script>

<template>
  <ui-section tone="surface" labelledby="bolge-baslik">
    <article class="region">
      <!--
        Görünür kırılım yolu. Yapısal veri karşılığı (BreadcrumbList) sayfa
        seviyesinde üretiliyor; Google arama sonucunda URL yerine bu yolu
        gösterebiliyor.
      -->
      <nav class="region__breadcrumb" aria-label="Kırılım yolu">
        <ol>
          <li><NuxtLink to="/">Ana sayfa</NuxtLink></li>
          <li><NuxtLink to="/bolgelerimiz">Bölgelerimiz</NuxtLink></li>
          <li v-if="provinceRegion">
            <NuxtLink :to="`/${provinceRegion.slug}`">{{ provinceRegion.subtitle }}</NuxtLink>
          </li>
          <li aria-current="page">{{ areaName }}</li>
        </ol>
      </nav>

      <header class="region__header">
        <h1 id="bolge-baslik" class="text-h1 text-ink">{{ region.title }}</h1>

        <p v-if="region.excerpt" class="mt-4 text-pretty text-lead text-ink-muted">
          {{ region.excerpt }}
        </p>
      </header>

      <figure v-if="region.image" class="region__figure">
        <NuxtImg
          format="webp"
          quality="78"
          :src="region.image"
          :alt="imageAlt"
          class="region__img"
          sizes="xs:100vw lg:900px"
          loading="eager"
          fetchpriority="high"
          preload
          decoding="async"
        />
      </figure>

      <!-- İçindekiler — çapa bağlantıları -->
      <nav v-if="sections.length > 1" class="region__toc" aria-label="Bu sayfada">
        <p class="region__toc-title">Bu sayfada</p>
        <ul>
          <li v-for="section in sections" :key="section.id">
            <a :href="`#${section.id}`">{{ section.label }}</a>
          </li>
        </ul>
      </nav>

      <template v-if="region.content">
        <h2 id="hizmetler" class="region__section-title">
          {{ areaName }} Evden Eve Nakliyat Hizmetlerimiz
        </h2>
        <article-prose :html="region.content" class="region__body" />
      </template>

      <region-facts
        :items="facts"
        :title="`${areaName} Taşınma Künyesi`"
        heading-id="kunye"
      />

      <!-- Mahalleler: yerel arama karşılığı ve gerçekten hizmet sınırı bilgisi -->
      <section v-if="neighborhoods.length" class="region__block" aria-labelledby="mahalleler">
        <h2 id="mahalleler" class="region__section-title">{{ neighborhoodHeading }}</h2>
        <p class="region__block-lead">{{ neighborhoodLead }}</p>
        <ul class="region__chips">
          <li v-for="name in neighborhoods" :key="name" class="region__chip">{{ name }}</li>
        </ul>
      </section>

      <!-- Güzergâhlar: hem bilgi hem iç bağlantı ağı -->
      <section v-if="routes.length" class="region__block" aria-labelledby="guzergahlar">
        <h2 id="guzergahlar" class="region__section-title">
          {{ areaName }} Çevresinde Sık Taşınılan Güzergâhlar
        </h2>
        <ul class="region__routes">
          <li v-for="route in routes" :key="route.to" class="region__route">
            <span class="region__route-head">
              <span class="region__route-from">{{ areaName }}</span>
              <ui-icon name="arrow-right" :size="15" aria-hidden="true" />
              <NuxtLink v-if="route.slug" :to="`/${route.slug}`" class="region__route-to">
                {{ route.to }}
              </NuxtLink>
              <span v-else class="region__route-to">{{ route.to }}</span>
            </span>
            <span v-if="route.note" class="region__route-note">{{ route.note }}</span>
          </li>
        </ul>
      </section>

      <!-- Fiyatı etkileyen faktörler -->
      <section v-if="priceFactors.length" class="region__block" aria-labelledby="fiyat">
        <h2 id="fiyat" class="region__section-title">
          {{ areaName }} Evden Eve Nakliyat Fiyatını Etkileyen Faktörler
        </h2>

        <!--
          FİYAT FAKTÖRÜ GÖRSELİ — panelden yükleniyor, isteğe bağlı.
          Alan yıllardır veritabanına yazılıyordu ama HİÇBİR YERDE
          basılmıyordu: yönetici görseli yüklüyor, kaydediyor, sitede
          hiçbir şey değişmiyordu. Bağlantı burada kuruldu.

          alt="" (dekoratif) BİLİNÇLİ: bölümün taşıdığı bilgi hemen
          altındaki tabloda satır satır yazıyor. Fotoğraf görsel nefes
          veriyor, bilgi eklemiyor — dekoratif görselin doğru alt'ı boştur.
          DİKKAT: buraya rakam/yazı içeren bir İNFOGRAFİK konursa bu artık
          doğru olmaz; o durumda metni taşıyacak bir alan gerekir.
        -->
        <figure v-if="region.priceFactorsImage" class="region__figure region__figure--inline">
          <NuxtImg
            format="webp"
            quality="72"
            :src="region.priceFactorsImage"
            alt=""
            class="region__img"
            sizes="xs:100vw lg:900px"
            loading="lazy"
            decoding="async"
          />
        </figure>

        <div class="region__table-wrap">
          <table class="region__table">
            <caption class="sr-only">
              {{ areaName }} bölgesinde evden eve nakliyat fiyatını etkileyen faktörler
            </caption>
            <!--
              Başlıklar "En düşük / En yüksek" idi ama sütunlarda fiyat
              değil KOŞUL yazıyor ("Cadde üstü", "Asansörsüz 5. kat").
              "En düşük: Cadde üstü" anlamsız bir satır üretiyordu; doğru
              okunuş faktörün fiyatı hangi yönde değiştirdiği.

              Rakam yazılmamasının sebebi: taşıma fiyatı adres görülmeden
              belirlenemiyor ve siteye yazılan bir tutar kısa sürede
              geçersizleşip yanlış beklenti yaratıyor.
            -->
            <thead>
              <tr>
                <th scope="col">Faktör</th>
                <th scope="col">Fiyatı düşüren durum</th>
                <th scope="col">Fiyatı artıran durum</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(factor, index) in priceFactors" :key="index">
                <th scope="row">{{ factor.factor }}</th>
                <td>{{ factor.min || '—' }}</td>
                <td>{{ factor.max || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!--
          "ÜCRETSİZ" KALDIRILDI — DOĞRULANMAMIŞ TİCARİ İDDİA.

          Cümle "Kesin fiyat, ücretsiz keşif sonrasında yazılı olarak
          verilir" idi. Keşfin ücretsiz olduğunu gösteren bir iş kaydı
          depoda yok; aynı gerekçeyle Site Ayarları'ndaki eylem düğmesi de
          "Ücretsiz Keşif"ten "Keşif Talebi"ne çekildi.

          Bu şablon bugün yalnız İstanbul DIŞI bölge kayıtlarını basıyor ve
          onların hepsi yayından çekildi (yayında kalan tek kayıt
          `/istanbul` ve o da `/`'a yönlendiriliyor). Yani cümle şu an
          hiçbir ziyaretçiye görünmüyor. Yine de bırakılmadı: burası yeniden
          kullanılabilir bir şablon ve bir kayıt yarın yayına dönerse iddia
          onunla birlikte geri gelirdi.

          Anlam korundu — çıkarılan tek şey ücret iddiası.
        -->
        <p class="mt-4 text-sm text-ink-muted">
          Tablodaki değerler tahminidir. Kesin fiyat, adres görüldükten sonra netleşir.
        </p>

      </section>

      <!--
        FİYAT ARACINA KÖPRÜ — koşulsuz.
        Başta yukarıdaki fiyat faktörleri bölümünün içine konmuştu, ama o bölüm
        yalnızca ilgili alan doluyken görünüyor ve ölçüldü: 120 bölgeden yalnızca
        birinde dolu. Bağlantı tek sayfada kalıyordu. Kendi bloğuna alındı;
        artık her bölge sayfasından araca bağlantı var.
      -->
      <p class="region__hesap-kutu">
        <base-price-link :label="`${areaName} için tahmini taşınma fiyatını hesaplayın`" />
      </p>
    </article>

    <!--
      İL SAYFASINDA İLÇE IZGARASI — okuma sütununun DIŞINDA.
      `.region` 52rem ile sınırlı; 39 kart orada 3 sütuna sıkışıp 13 satır
      eder. Bölüm genişliğinde 5 sütun çıkıyor ve aynı liste 8 satıra iniyor.
    -->
    <region-district-grid
      v-if="districts.length"
      :city-name="areaName"
      :districts="districts"
    />

    <div class="region__footer">
      <region-faq
        :items="faqs"
        :title="`${areaName} Nakliyat Hakkında Sık Sorulan Sorular`"
        heading-id="sss"
      />

      <!-- İlçe sayfasında: yakındaki diğer bölgeler, kompakt liste -->
      <section v-if="!districts.length && related.length" class="region__related">
        <h2 class="text-h3 text-ink">Yakındaki Diğer Bölgeler</h2>
        <p class="mt-2 text-ink-muted">
          {{ cityNames.join(', ') }} {{ cityNames.length > 1 ? 'illerinde' : 'ilinde' }}
          hizmet verdiğimiz diğer bölgeler.
        </p>

        <ul class="region__related-grid">
          <li v-for="item in related" :key="item.slug">
            <NuxtLink :to="`/${item.slug}`" class="region__related-card">
              <span class="region__related-icon" aria-hidden="true">
                <ui-icon name="map-pin" :size="18" />
              </span>
              <span class="min-w-0">
                <span class="region__related-title">{{ item.shortTitle || item.title }}</span>
                <span v-if="item.subtitle" class="region__related-sub">{{ item.subtitle }}</span>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <article-pager-nav :previous="previous" :next="next" kind="bölge" />
    </div>
  </ui-section>
</template>

<style scoped>
.region {
  --okuma-genisligi: 68ch;
  margin: 0 auto;
  max-width: 52rem;
}

/* İlçe ızgarası makalenin dışına taşındığı için alt blok da okuma
   sütunuyla aynı hizada tutuluyor. */
.region__footer {
  margin: 0 auto;
  max-width: 52rem;
}

.region__breadcrumb ol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.875rem;
  color: rgb(var(--c-ink-muted));
}

.region__breadcrumb li + li::before {
  content: '›';
  margin-right: 0.375rem;
  color: rgb(var(--c-ink-subtle));
}

.region__breadcrumb a {
  color: rgb(var(--c-brand-700));
  font-weight: 500;
}

.region__breadcrumb a:hover {
  text-decoration: underline;
}

.region__breadcrumb [aria-current='page'] {
  color: rgb(var(--c-ink));
  font-weight: 600;
}

.region__header {
  margin-top: 1.5rem;
  max-width: var(--okuma-genisligi);
}

.region__figure {
  margin: 2.5rem 0;
  overflow: hidden;
  border-radius: var(--r-2xl);
  box-shadow: var(--shadow-lg);
}

/* Bölüm içi görsel — sayfanın BAŞINDAKİ ana görselden bilinçli olarak daha
   sönük. Aynı ölçüde ve aynı gölgeyle basılsaydı iki görsel eşit ağırlıkta
   okunur, sayfanın hiyerarşisi bozulurdu.
   21/9: 16/9 kaynaktan dikeyde ~%24 kırpar — panelde verilen "konuyu dikey
   ortadaki %75'te tut" kuralıyla aynı pay. */
.region__figure--inline {
  margin: 1.5rem 0 2rem;
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-md);
}

.region__figure--inline .region__img {
  aspect-ratio: 21 / 9;
}

.region__img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

/* --- İçindekiler --- */

.region__toc {
  margin-bottom: 2.5rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid rgb(var(--c-line));
  border-radius: var(--r-xl);
  background: rgb(var(--c-surface-muted));
}

.region__toc-title {
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--c-ink-muted));
}

.region__toc ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.region__toc a {
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgb(var(--c-brand-700));
}

.region__toc a:hover {
  text-decoration: underline;
}

/* --- Bölüm başlıkları --- */

.region__section-title {
  max-width: var(--okuma-genisligi);
  margin-bottom: 1.25rem;
  font-size: clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.018em;
  color: rgb(var(--c-ink));
  /* Yapışkan menünün altında kalmasın diye çapa hedefine üst boşluk. */
  scroll-margin-top: 6rem;
}

.region__body {
  max-width: var(--okuma-genisligi);
}

.region__block {
  margin-top: var(--space-block);
}

.region__block-lead {
  max-width: var(--okuma-genisligi);
  margin-bottom: 1.25rem;
  color: rgb(var(--c-ink-muted));
  line-height: 1.75;
  text-wrap: pretty;
}

/* --- Mahalle etiketleri --- */

.region__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.region__chip {
  padding: 0.4375rem 0.875rem;
  border: 1px solid rgb(var(--c-line));
  border-radius: var(--r-full);
  background: rgb(var(--c-surface));
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--c-ink));
}

/* --- Güzergâhlar --- */

.region__routes {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
  grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
}

.region__route {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  height: 100%;
  padding: 1rem 1.125rem;
  border: 1px solid rgb(var(--c-line));
  border-radius: var(--r-lg);
  background: rgb(var(--c-surface));
}

.region__route-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: rgb(var(--c-ink));
}

.region__route-head svg {
  flex-shrink: 0;
  color: rgb(var(--c-brand-600));
}

.region__route-to {
  color: rgb(var(--c-brand-700));
}

a.region__route-to:hover {
  text-decoration: underline;
}

.region__route-note {
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgb(var(--c-ink-muted));
  text-wrap: pretty;
}

/* --- Fiyat tablosu --- */

.region__hesap-kutu {
  margin: var(--space-block) 0 0;
}

.region__table-wrap {
  overflow-x: auto;
}

.region__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}

.region__table th,
.region__table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgb(var(--c-line));
}

.region__table thead th {
  font-weight: 600;
  color: rgb(var(--c-ink));
  border-bottom-width: 2px;
  white-space: nowrap;
}

.region__table tbody th {
  font-weight: 500;
  color: rgb(var(--c-ink));
}

.region__table tbody td {
  color: rgb(var(--c-ink-muted));
  white-space: nowrap;
}

/* --- Yakındaki bölgeler --- */

.region__related {
  margin-top: var(--space-block);
}

.region__related-grid {
  display: grid;
  gap: 0.75rem;
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
}

.region__related-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  height: 100%;
  padding: 1rem;
  border: 1px solid rgb(var(--c-line));
  border-radius: var(--r-lg);
  background: rgb(var(--c-surface));
  transition:
    border-color var(--dur-base) var(--ease-soft),
    box-shadow var(--dur-base) var(--ease-soft),
    transform var(--dur-base) var(--ease-out);
}

.region__related-card:hover {
  border-color: rgb(var(--c-brand-600) / 0.4);
  box-shadow: var(--shadow-sm);
  transform: translateY(var(--lift));
}

.region__related-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--r-md);
  background: rgb(var(--c-brand-600) / 0.1);
  color: rgb(var(--c-brand-600));
}

.region__related-title {
  display: block;
  font-weight: 600;
  color: rgb(var(--c-ink));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.region__related-sub {
  display: block;
  font-size: 0.8125rem;
  color: rgb(var(--c-ink-muted));
}
</style>
