<script setup>
/**
 * MAHALLE SAYFASI — İKİ DURUM, TEK ŞABLON.
 *
 *   PASİF (kabuk)   gezinme katmanı: yol izi, ilçe, ana sayfa, kardeşler.
 *                   `noindex, follow`, sitemap dışı, hizmet şeması yok.
 *   AKTİF (içerik)  aynı iskeletin üstüne bölümler açılıyor.
 *
 * Ayrım DATA-DRIVEN: `mahalle.aktif` ve dolu içerik alanları neyin
 * basılacağını belirliyor. İki ayrı bileşen yazılmadı — pasif sayfa,
 * aktif sayfanın bölümleri boş hâli. 473 sayfanın 463'ü bugün pasif ve
 * içerik üretildikçe tek tek aktifleşecek; iki şablon olsaydı ikisi
 * zamanla ayrışırdı.
 *
 * BÖLÜM NUMARALARI İÇERİKTEN TÜRÜYOR — bir mahallede SSS yoksa numaralar
 * kaymaya devam ediyor, boşlukta "04" görünmüyor.
 *
 * UYDURMA YEREL BİLGİ YOK. "Sokaklar dardır", "park sorunu yoğundur" gibi
 * doğrulanmamış coğrafi iddialar bu sayfalarda üretilmiyor; künye alanı
 * (`facts`) yalnız gerçekten doğrulanmış satırlar için var ve çoğu
 * mahallede boş kalıyor.
 */
import { computed } from 'vue'
import { mahalleBasligi } from '#shared/utils/mahalle'

const props = defineProps({
  /** { yol, ad, ilce, ilceAd, aktif, title, excerpt, content, faqs, facts, … } */
  mahalle: { type: Object, required: true },
  /** Aynı ilçedeki tüm mahalleler (bu dahil): [{ ad, yol, aktif }] */
  kardesler: { type: Array, default: () => [] },
  /** Yedi hizmet kaydı — ilgili hizmet bağlantıları buradan çözülüyor. */
  services: { type: Array, default: () => [] },
})

const adTam = computed(() => mahalleBasligi(props.mahalle.ad))

/**
 * H1 — durum belirliyor.
 *   pasif  → "Kaynarca Mahallesi"                        (kimlik)
 *   aktif  → "Kaynarca Mahallesi Evden Eve Nakliyat"     (ticari niyet)
 * Panelden `title` yazılmışsa o kullanılıyor.
 */
const baslik = computed(() => {
  if (!props.mahalle.aktif) return adTam.value
  return props.mahalle.title?.trim() || `${adTam.value} Evden Eve Nakliyat`
})

/* --------------------------------------------------------- içerik alanları */
const govde = computed(() => (props.mahalle.aktif && props.mahalle.content) || '')
const giris = computed(() => (props.mahalle.aktif && props.mahalle.excerpt) || '')
const kunye = computed(() =>
  props.mahalle.aktif ? parseJsonArray(props.mahalle.facts).filter((x) => x?.label && x?.value) : []
)
const sorular = computed(() =>
  props.mahalle.aktif
    ? parseJsonArray(props.mahalle.faqs).filter((x) => x?.question && x?.answer)
    : []
)

/**
 * İLGİLİ HİZMETLER — mahallenin KENDİ metninden.
 *
 * Yedi hizmeti her mahalleye dökmek 473 sayfalık bir bağlantı çiftliği
 * olurdu. İlçe sayfasındaki desenin aynısı: gövde ve sorular taranıyor,
 * gerçekten geçen hizmetler bağlanıyor. Tavan 4.
 */
const HIZMET_IZLERI = {
  'asansorlu-nakliyat': ['asansör', 'dış cephe'],
  'paketleme-hizmeti': ['ambalaj', 'paketle', 'kırılabilir', 'cam eşya'],
  'parca-esya-tasima': ['parça eşya', 'tek oda', 'öğrenci'],
  'ofis-tasima': ['ofis', 'işyeri', 'atölye', 'dükkân', 'plaza'],
  'esya-depolama': ['depolama', 'ara depo'],
  'sehirler-arasi-nakliyat': ['şehirler arası', 'şehir dışı'],
}
const HIZMET_SINIRI = 4

const ilgiliHizmetler = computed(() => {
  if (!props.mahalle.aktif) return []
  const havuz = new Map(props.services.map((h) => [h.slug, h]))
  const metin = [props.mahalle.content, props.mahalle.excerpt, JSON.stringify(props.mahalle.faqs || '')]
    .join(' ')
    .toLocaleLowerCase('tr')

  const secilen = ['evden-eve-nakliyat']
  for (const [slug, izler] of Object.entries(HIZMET_IZLERI)) {
    if (secilen.length >= HIZMET_SINIRI) break
    if (izler.some((iz) => metin.includes(iz))) secilen.push(slug)
  }
  return secilen
    .map((slug) => havuz.get(slug))
    .filter(Boolean)
    .map((h) => ({ slug: h.slug, baslik: h.title, altBaslik: h.subtitle || '' }))
})

/* ------------------------------------------------------------------ bölümler */
const bolumler = computed(() => {
  const liste = []
  if (govde.value) liste.push({ anahtar: 'tasima', etiket: 'BU MAHALLEDE TAŞIMA' })
  if (kunye.value.length) liste.push({ anahtar: 'planlama', etiket: 'PLANLAMA' })
  if (ilgiliHizmetler.value.length) liste.push({ anahtar: 'hizmet', etiket: 'HİZMETLER' })
  if (sorular.value.length) liste.push({ anahtar: 'soru', etiket: 'SORULAR' })
  liste.push({
    anahtar: 'kardes',
    etiket: `${props.mahalle.ilceAd.toLocaleUpperCase('tr-TR')} MAHALLELERİ`,
  })
  return Object.fromEntries(
    liste.map((b, i) => [b.anahtar, { ...b, no: String(i + 1).padStart(2, '0') }])
  )
})

const siralayici = new Intl.Collator('tr-TR')
const kardesSirali = computed(() =>
  [...props.kardesler]
    .sort((a, b) => siralayici.compare(a.ad, b.ad))
    .map((m, i) => ({ ...m, no: String(i + 1).padStart(2, '0'), bu: m.yol === props.mahalle.yol }))
)
</script>

<template>
  <main class="mh-sayfa">
    <!-- ============================== GİRİŞ ============================== -->
    <section class="mh-giris-kap" aria-labelledby="mahalle-baslik">
      <div class="mh-giris sahne-alan">
        <nav class="mh-yol" aria-label="Yol izi">
          <ol class="mh-yol-liste" itemscope itemtype="https://schema.org/BreadcrumbList">
            <li
              class="mh-yol-oge"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
            >
              <NuxtLink to="/" itemprop="item"><span itemprop="name">Ana sayfa</span></NuxtLink>
              <meta itemprop="position" content="1" />
            </li>
            <li
              class="mh-yol-oge"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
            >
              <NuxtLink to="/bolgelerimiz" itemprop="item">
                <span itemprop="name">Bölgelerimiz</span>
              </NuxtLink>
              <meta itemprop="position" content="2" />
            </li>
            <li
              class="mh-yol-oge"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
            >
              <NuxtLink :to="`/${mahalle.ilce}`" itemprop="item">
                <span itemprop="name">{{ mahalle.ilceAd }}</span>
              </NuxtLink>
              <meta itemprop="position" content="3" />
            </li>
            <li
              class="mh-yol-oge"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
            >
              <span itemprop="name" aria-current="page">{{ adTam }}</span>
              <meta itemprop="position" content="4" />
            </li>
          </ol>
        </nav>

        <p class="mh-kunye op-kunye">
          {{ mahalle.ilceAd.toLocaleUpperCase('tr-TR') }} / MAHALLE
        </p>

        <h1 id="mahalle-baslik" class="mh-h1 tip-baslik">{{ baslik }}</h1>

        <p v-if="giris" class="mh-lead tip-giris">{{ giris }}</p>

        <!-- Üst kademeler: ilçe ve İstanbul ana sayfası. Yol izindeki
             bağlantıların gövde içindeki karşılığı; yol izi 11px mono ve
             tek başına yeterince görünür bir gezinme yolu değil. -->
        <ul class="mh-ustler">
          <li class="mh-ust">
            <p class="mh-ust-etiket op-kunye">BAĞLI OLDUĞU İLÇE</p>
            <NuxtLink :to="`/${mahalle.ilce}`" class="mh-ust-bag tip-alt">
              {{ mahalle.ilceAd }} Evden Eve Nakliyat
            </NuxtLink>
          </li>
          <li class="mh-ust">
            <p class="mh-ust-etiket op-kunye">ŞEHİR</p>
            <NuxtLink to="/" class="mh-ust-bag tip-alt">İstanbul Evden Eve Nakliyat</NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <!-- ====================== 01 — BU MAHALLEDE TAŞIMA ==================== -->
    <section
      v-if="bolumler.tasima"
      class="mh-bolum mh-bolum--kagit"
      aria-labelledby="bolum-tasima"
    >
      <div class="mh-ic sahne-alan">
        <p class="mh-no op-kunye">{{ bolumler.tasima.no }} / {{ bolumler.tasima.etiket }}</p>
        <!--
          Başlıkta TÜRKÇE EK KULLANILMIYOR. "Mahallesi'nde" çoğu adda doğru
          ama "Yenimahalle" gibi zaten -mahalle ile biten adlarda bozuluyor
          ("Yenimahalle'nde"). 473 ad için ünlü uyumu + ünsüz sertleşmesi
          çözen bir ek üreticisi yazmak yerine, ek gerektirmeyen bir kalıp
          seçildi.
        -->
        <h2 id="bolum-tasima" class="mh-h2 tip-anlati">
          {{ adTam }} için taşıma nasıl planlanıyor?
        </h2>
        <article-prose :html="mahalle.content" class="mh-govde" />
      </div>
    </section>

    <!-- ========================== 02 — PLANLAMA ========================== -->
    <section
      v-if="bolumler.planlama"
      class="mh-bolum mh-bolum--cukur"
      aria-labelledby="bolum-planlama"
    >
      <div class="mh-ic sahne-alan">
        <p class="mh-no op-kunye">{{ bolumler.planlama.no }} / {{ bolumler.planlama.etiket }}</p>
        <h2 id="bolum-planlama" class="mh-h2 tip-anlati">Keşifte ölçülenler</h2>
        <!-- Yalnız DOĞRULANMIŞ satırlar. Mahalleye dair kaynaksız fiziksel
             iddia bu alana yazılmıyor. -->
        <dl class="mh-kunye-liste">
          <div v-for="k in kunye" :key="k.label" class="mh-kunye-oge">
            <dt class="mh-kunye-etiket op-kunye">{{ k.label.toLocaleUpperCase('tr-TR') }}</dt>
            <dd class="mh-kunye-deger tip-not">{{ k.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- ========================== 03 — HİZMETLER ========================= -->
    <section
      v-if="bolumler.hizmet"
      class="mh-bolum mh-bolum--kagit"
      aria-labelledby="bolum-hizmet"
    >
      <div class="mh-ic sahne-alan">
        <p class="mh-no op-kunye">{{ bolumler.hizmet.no }} / {{ bolumler.hizmet.etiket }}</p>
        <h2 id="bolum-hizmet" class="mh-h2 tip-anlati">{{ adTam }} için ilgili hizmetler</h2>
        <ul class="mh-hizmet-liste">
          <li v-for="h in ilgiliHizmetler" :key="h.slug" class="mh-hizmet">
            <NuxtLink :to="`/${h.slug}`" class="mh-hizmet-bag tip-alt">{{ h.baslik }}</NuxtLink>
            <p v-if="h.altBaslik" class="mh-hizmet-alt op-kunye">{{ h.altBaslik }}</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- =========================== 04 — SORULAR ========================== -->
    <section v-if="bolumler.soru" class="mh-bolum mh-bolum--cukur" aria-labelledby="bolum-soru">
      <div class="mh-ic sahne-alan">
        <p class="mh-no op-kunye">{{ bolumler.soru.no }} / {{ bolumler.soru.etiket }}</p>
        <h2 id="bolum-soru" class="mh-h2 tip-anlati">{{ adTam }} için sık sorulanlar</h2>
        <dl class="mh-sss">
          <div v-for="s in sorular" :key="s.question" class="mh-sss-oge">
            <dt class="mh-soru tip-alt">{{ s.question }}</dt>
            <dd class="mh-cevap tip-not">{{ s.answer }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- ================== AYNI İLÇEDEKİ DİĞER MAHALLELER ================== -->
    <section
      v-if="kardesSirali.length > 1"
      class="mh-bolum mh-bolum--kagit"
      aria-labelledby="kardes-baslik"
    >
      <div class="mh-ic sahne-alan">
        <p class="mh-no op-kunye">{{ bolumler.kardes.no }} / {{ bolumler.kardes.etiket }}</p>
        <!--
          "Yakındaki mahalleler" DEĞİL: elimizde coğrafi komşuluk verisi yok,
          bu liste yalnız aynı ilçeye bağlı olanlar. Başlık da tam olarak
          bunu söylüyor.
        -->
        <!--
          "{İlçe}'teki" YANLIŞTI: bulunma eki ünlü uyumuna ve ünsüz
          sertleşmesine bağlı ("Pendik'teki" doğru, "Kadıköy'deki",
          "Beşiktaş'taki"). Sabit ek 39 ilçe adının çoğunda hatalı çıkıyordu.
          "içindeki" ayrı bir sözcük olduğu için hiçbir adda bozulmuyor.
        -->
        <h2 id="kardes-baslik" class="mh-h2 tip-anlati">
          {{ mahalle.ilceAd }} içindeki diğer mahalleler
        </h2>

        <ol class="mh-kardes-liste">
          <li v-for="k in kardesSirali" :key="k.yol" class="mh-kardes-oge">
            <span class="mh-kardes-no op-kunye">{{ k.no }}</span>
            <!-- Bulunulan mahalle listede GÖRÜNÜR ama kendine bağlantı
                 vermiyor; devre dışı sahte bağlantı da basılmıyor. -->
            <span v-if="k.bu" class="mh-kardes-bu tip-not" aria-current="page">
              {{ mahalleBasligi(k.ad) }}
              <span class="mh-kardes-etiket op-kunye">BU SAYFA</span>
            </span>
            <NuxtLink v-else :to="`/${k.yol}`" class="mh-kardes-bag tip-not">
              {{ mahalleBasligi(k.ad) }}
            </NuxtLink>
          </li>
        </ol>

        <p class="mh-geri tip-govde">
          Tüm İstanbul ilçeleri için
          <NuxtLink to="/bolgelerimiz" class="op-bag op-bag--sakin mh-bag">bölgelerimiz</NuxtLink>
          sayfasına bakabilirsiniz.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.mh-sayfa {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}

/* ============================== GİRİŞ ============================== */
.mh-giris-kap {
  border-bottom: 1px solid rgb(var(--c-rule));
}
.mh-giris {
  padding-block: var(--sahne-dikey-dar) var(--sahne-dikey);
}
.mh-yol-liste {
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
.mh-yol-oge + .mh-yol-oge::before {
  content: '/';
  margin-right: 0.5rem;
  color: rgb(var(--c-measure));
}
.mh-yol a {
  color: rgb(var(--c-ink-soft));
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.mh-yol a:hover {
  color: rgb(var(--c-ink));
  border-bottom-color: rgb(var(--c-ink));
}
.mh-yol [aria-current='page'] {
  color: rgb(var(--c-ink));
}

.mh-kunye {
  margin-top: clamp(2rem, 1.5rem + 2vw, 3.5rem);
}
.mh-h1 {
  margin-top: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
  max-width: 16ch;
}
.mh-lead {
  margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}

.mh-ustler {
  list-style: none;
  margin: clamp(2rem, 1.75rem + 1.5vw, 3.5rem) 0 0;
  padding: 0;
  display: grid;
  gap: 0;
}
.mh-ust {
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(1rem, 0.85rem + 0.6vw, 1.375rem);
}
.mh-ust:last-child {
  border-bottom: 1px solid rgb(var(--c-rule));
}
.mh-ust-etiket {
  margin: 0 0 0.375rem;
  color: rgb(var(--c-ink-soft));
}
.mh-ust-bag {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid rgb(var(--c-measure));
}
.mh-ust-bag:hover {
  border-bottom-color: rgb(var(--c-ink));
}
.mh-ust-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}

/* =========================== ORTAK BÖLÜM =========================== */
.mh-bolum--kagit {
  background: rgb(var(--c-paper));
}
.mh-bolum--cukur {
  background: rgb(var(--c-paper-sunken));
  border-block: 1px solid rgb(var(--c-rule));
}
.mh-ic {
  padding-block: var(--sahne-dikey);
}
.mh-no {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.mh-h2 {
  margin: 0;
  max-width: 18ch;
}

/* ---- 01 gövde ---- */
.mh-govde {
  margin-top: clamp(1.5rem, 1.25rem + 1vw, 2.5rem);
  max-width: var(--olcu-govde);
}

/* ---- 02 künye ---- */
.mh-kunye-liste {
  margin: clamp(1.5rem, 1.25rem + 1vw, 2.5rem) 0 0;
  padding: 0;
}
.mh-kunye-oge {
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem);
}
.mh-kunye-oge:last-child {
  border-bottom: 1px solid rgb(var(--c-rule));
}
.mh-kunye-etiket {
  margin: 0;
  color: rgb(var(--c-ink-soft));
}
.mh-kunye-deger {
  margin: 0.375rem 0 0;
  max-width: var(--olcu-govde);
}

/* ---- 03 hizmetler ---- */
.mh-hizmet-liste {
  list-style: none;
  margin: clamp(1.5rem, 1.25rem + 1vw, 2.5rem) 0 0;
  padding: 0;
}
.mh-hizmet {
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}
.mh-hizmet:last-child {
  border-bottom: 1px solid rgb(var(--c-rule));
}
.mh-hizmet-bag {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid rgb(var(--c-measure));
}
.mh-hizmet-bag:hover {
  border-bottom-color: rgb(var(--c-ink));
}
.mh-hizmet-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}
.mh-hizmet-alt {
  margin: 0.5rem 0 0;
  color: rgb(var(--c-ink-soft));
}

/* ---- 04 sorular ---- */
.mh-sss {
  margin: clamp(1.5rem, 1.25rem + 1vw, 2.5rem) 0 0;
  padding: 0;
}
.mh-sss-oge {
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(1.25rem, 1rem + 0.8vw, 1.75rem);
}
.mh-sss-oge:last-child {
  border-bottom: 1px solid rgb(var(--c-rule));
}
.mh-soru {
  margin: 0;
}
.mh-cevap {
  margin: 0.625rem 0 0;
  max-width: var(--olcu-govde);
  color: rgb(var(--c-ink-soft));
}

/* ========================= KARDEŞ MAHALLELER ========================= */
.mh-kardes-liste {
  list-style: none;
  margin: clamp(1.5rem, 1.25rem + 1vw, 2.5rem) 0 0;
  padding: 0;
  columns: 1;
}
.mh-kardes-oge {
  display: flex;
  gap: 0.875rem;
  align-items: baseline;
  break-inside: avoid;
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: 0.6875rem;
}
.mh-kardes-no {
  color: rgb(var(--c-ink-soft));
  font-variant-numeric: tabular-nums;
}
.mh-kardes-bag {
  margin: 0;
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid rgb(var(--c-measure));
}
.mh-kardes-bag:hover {
  border-bottom-color: rgb(var(--c-ink));
}
.mh-kardes-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}
.mh-kardes-bu {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 0.625rem;
  color: rgb(var(--c-ink-soft));
}
.mh-kardes-etiket {
  color: rgb(var(--c-ink-soft));
}

.mh-geri {
  margin: clamp(2rem, 1.75rem + 1vw, 3rem) 0 0;
  max-width: var(--olcu-govde);
}
/* `.op-bag` tek başına duran eylem bağlantısı için (44px taban); cümle
   içinde metnin kendi ölçüsüne dönüyor. */
.mh-bag {
  min-height: 0;
  font-size: inherit;
  font-weight: 600;
  padding-bottom: 0.05em;
}

/* ============================= MASAÜSTÜ ============================= */
@media (min-width: 1024px) {
  .mh-giris,
  .mh-ic {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }
  .mh-yol {
    grid-column: 1 / 9;
  }
  .mh-kunye,
  .mh-h1,
  .mh-lead {
    grid-column: 2 / 8;
  }
  .mh-ustler {
    grid-column: 8 / 13;
    grid-row: 2 / 6;
    margin-top: 0;
  }

  .mh-no {
    grid-column: 1 / 8;
  }
  .mh-h2 {
    grid-column: 2 / 7;
  }
  .mh-govde,
  .mh-kunye-liste,
  .mh-hizmet-liste,
  .mh-sss {
    grid-column: 7 / 13;
    margin-top: 0;
  }
  .mh-kardes-liste {
    grid-column: 7 / 13;
    grid-row: 2 / 4;
    margin-top: 0;
    columns: 2;
    column-gap: var(--sahne-kolon-arasi);
  }
  .mh-geri {
    grid-column: 2 / 7;
    margin-top: clamp(1.5rem, 1.25rem + 1vw, 2.25rem);
  }
}
</style>
