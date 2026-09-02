<script setup>
/**
 * 01 / YAZILAR — editoryal kütük.
 *
 * Eski `blog/List.vue` + `blog/Card.vue` ikilisinin yerini alıyor. İkisi de
 * duruyor ama artık kullanılmıyor.
 *
 * ─────────────────────────────────────────────────────────────────────
 * VERİ SÖZLEŞMESİ KORUNDU
 *   uç nokta   GET /api/posts?light=true  (istek sayfa dosyasında)
 *   sıralama   `createdAt` azalan — sunucudaki sıra AYNEN kullanılıyor
 *   sayfalama  `?sayfa=N`, sayfa başına 10 (bkz. SAYFA_BOYU gerekçesi)
 *   detay yolu `/{slug}` — blog yazıları KÖK seviyede yaşıyor
 *              (`/blog/{slug}` diye bir rota yok, ölçüldü: 404)
 *
 * ─────────────────────────────────────────────────────────────────────
 * DÜZELTİLEN ÜÇ HATA
 *
 * 1. UYDURMA YAZAR. Kart, `post.author` boşsa "{marka} Ekibi" yazıyordu.
 *    Ölçüldü: on yazının HİÇBİRİNDE `author` dolu değil — yani ekranda
 *    dokuz kez var olmayan bir yazar adı duruyordu. Alan gerçekten
 *    doldurulursa gösterilir; boşsa satır hiç basılmaz.
 *
 * 2. SAYFALAMA TARANAMIYORDU. Önceki/Sonraki `<button @click>` idi
 *    (ölçüldü: bağlantı 0, düğme 2). Arama motoru ikinci sayfayı bu
 *    yoldan bulamaz. Artık gerçek `<a href>`; sayfa numaraları da
 *    ayrı ayrı bağlantı ve bulunulan sayfa `aria-current="page"`.
 *    Devre dışı sahte bağlantı üretilmiyor — yoksa hiç basılmıyor.
 *
 * 3. BAŞLIK SEVİYESİ. Yazı başlıkları `<h3>` idi çünkü `<h1>` sayfa
 *    bandındaydı ve bölüm başlığı `<h2>` yerini almıştı. Artık `<h2>`.
 *
 * ─────────────────────────────────────────────────────────────────────
 * KALDIRILAN ARAMA KUTUSU — GEREKÇE
 *
 * Dizin on yazı taşıyor ve kütük biçiminde hepsinin başlığı tek ekranda
 * taranabiliyor. On öğeyi istemcide süzmek için arama alanı, durum
 * yönetimi ve ikinci bir boş-durum dalı taşımak bu ölçekte karşılığı
 * olmayan bir maliyet. Yazı sayısı büyürse geri gelmesi gereken ilk şey
 * budur (bkz. rapor).
 *
 * SAYFA YÜKÜ SÜZÜLÜYOR — süzme sayfa dosyasında (bkz. pages/blog.vue).
 */
import { computed } from 'vue'

/**
 * SAYFA BAŞINA YAZI — 9 İDİ, 10 OLDU.
 *
 * ÖLÇÜLEN SORUN: envanterde on yayındaki yazı var. 9'da birinci sayfa dolu,
 * İKİNCİ SAYFADA TEK BİR YAZI kalıyordu. Ziyaretçi "Sonraki →" diyip bir
 * satır görüyor; sayfalama, taşıdığı bilgiden fazlasını vaat ediyordu.
 *
 * A/B ÖLÇÜMÜ (7 genişlik, aynı içerik):
 *
 *              sayfa yük.(1920)  satır  sayfalama  son öğe → kapanış
 *    9              4229           9       var          189 px
 *   10              4398          10       yok          105 px
 *   12              4398          10       yok          105 px
 *
 * · 12, BUGÜN 10 ile birebir aynı çıktıyı veriyor (on kayıt tek sayfaya
 *   sığdığı için). Ayırt edici tek fark gelecekte: 12, mobilde her sayfayı
 *   iki satır (≈900 px) daha uzun yapıyor, karşılığında bugün hiçbir şey
 *   kazandırmıyor.
 * · 10'da liste kütüğün kendi kapanış çizgisiyle bitiyor ve altındaki
 *   boşluk artık bölümün KENDİ dikey payı (105 px / 1920, 57 px / 390) —
 *   yani sitenin geri kalanıyla aynı ritim. 9'daki 189 px, sayfalama
 *   çubuğunun payıydı.
 * · Satır yükseklikleri değişmedi (masaüstü 253/276, mobil 457): kütük
 *   ritmi aynı, yalnız kütük tamamlanıyor.
 *
 * SAYFALAMA ALTYAPISI DURUYOR. On birinci yazı eklendiğinde `toplamSayfa`
 * kendiliğinden 2 oluyor; `rel=prev/next`, sayfalı canonical, `?sayfa=N`
 * ve numaralı bağlantılar olduğu gibi çalışmaya devam ediyor.
 *
 * NOT — GELECEK: on birinci yazıda "ikinci sayfada tek öğe" durumu geri
 * gelir. Kalıcı çözümü sayfa boyunu büyütmek değil, "son sayfada tek öğe
 * kalıyorsa onu bir öncekine ekle" kuralıdır; o kural sayfa SAYISINI ve
 * dolayısıyla canonical/prev/next zincirini etkilediği için ayrı bir tur
 * konusu (bkz. M12 raporu).
 */
const SAYFA_BOYU = 10

const props = defineProps({
  /**
   * Süzülmüş yazı listesi. İstek SAYFA DOSYASINDA bir kez yapılıyor: giriş
   * bölümü de aynı veriyi okuyor ve iki bileşen kendi `useFetch`ini açsaydı
   * (aynı anahtar, farklı `transform`) biri diğerinin şeklini alırdı.
   */
  yazilar: { type: Array, default: () => [] },
  /** Liste çekilemedi mi — kullanıcıya boş liste yerine sebep gösteriliyor. */
  hata: { type: Boolean, default: false },
})

const route = useRoute()

const yazilar = computed(() => props.yazilar)

const toplamSayfa = computed(() => Math.max(1, Math.ceil(yazilar.value.length / SAYFA_BOYU)))

/** Sayfa numarası route'tan TÜRETİLİYOR; geri/ileri tuşları çalışsın diye. */
const sayfa = computed(() => {
  const ham = Number(route.query.sayfa)
  if (!Number.isFinite(ham) || ham < 1) return 1
  return Math.min(Math.trunc(ham), toplamSayfa.value)
})

const gorunen = computed(() => {
  const bas = (sayfa.value - 1) * SAYFA_BOYU
  return yazilar.value.slice(bas, bas + SAYFA_BOYU)
})

const sayfaYolu = (n) => (n > 1 ? { path: '/blog', query: { sayfa: n } } : { path: '/blog' })
const sayfaNumaralari = computed(() =>
  Array.from({ length: toplamSayfa.value }, (_, i) => i + 1)
)

/** Kütük numarası sayfalar boyunca devam ediyor: 2. sayfa 10'dan başlar. */
const kutukNo = (i) => String((sayfa.value - 1) * SAYFA_BOYU + i + 1).padStart(2, '0')

const tarihMetni = (ham) => {
  if (!ham) return ''
  const t = new Date(ham)
  if (Number.isNaN(t.getTime())) return ''
  return t.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}
const tarihIso = (ham) => {
  if (!ham) return undefined
  const t = new Date(ham)
  return Number.isNaN(t.getTime()) ? undefined : t.toISOString().slice(0, 10)
}

const { siteUrl } = await useSiteSettings()

/**
 * Canonical ve prev/next BURADA — sayfalama mantığı burada olduğu için.
 * Sayfa dosyası `skipCanonical` ile bunu devrediyor (mevcut davranış).
 */
useHead({
  link: [
    {
      rel: 'canonical',
      href: () =>
        sayfa.value > 1 ? `${siteUrl.value}/blog?sayfa=${sayfa.value}` : `${siteUrl.value}/blog`,
    },
    {
      rel: 'prev',
      href: () =>
        sayfa.value > 1
          ? sayfa.value - 1 === 1
            ? `${siteUrl.value}/blog`
            : `${siteUrl.value}/blog?sayfa=${sayfa.value - 1}`
          : undefined,
    },
    {
      rel: 'next',
      href: () =>
        sayfa.value < toplamSayfa.value
          ? `${siteUrl.value}/blog?sayfa=${sayfa.value + 1}`
          : undefined,
    },
  ],
})

/**
 * YAPISAL VERİ — `CollectionPage` + `ItemList`.
 *
 * Liste EKRANDA GÖRÜNENLE aynı: aynı sıra, aynı adet, gerçek yazı
 * adresleri. Bu yüzden burada üretiliyor — sayfa dosyasına taşınsaydı
 * sayfalama mantığından kopar ve 2. sayfada 1. sayfanın listesini
 * bildirebilirdi.
 *
 * Uydurma `author`, `aggregateRating`, `review` ve `offer` YOK. Kayıtlı on
 * yazının hiçbirinde yazar alanı dolu değil; olmayan bir yazarı yapısal
 * veride bildirmek, ekranda göstermekten daha kalıcı bir yanlış olurdu.
 */
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Blog',
          url: sayfa.value > 1 ? `${siteUrl.value}/blog?sayfa=${sayfa.value}` : `${siteUrl.value}/blog`,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: gorunen.value.length,
            itemListOrder: 'https://schema.org/ItemListOrderDescending',
            itemListElement: gorunen.value.map((y, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: y.baslik,
              url: `${siteUrl.value}/${y.slug}`,
            })),
          },
        }),
    },
  ],
})
</script>

<template>
  <!-- Bölüm başlığı `aria-label` ile veriliyor, ekranda gizli bir <h2> ile
       DEĞİL: tek <h2> seviyesi yazı başlıklarına ait olsun diye. Gizli bir
       bölüm başlığı, on yazı başlığıyla aynı kademede duran on birinci bir
       <h2> üretirdi. -->
  <section class="by-kap" aria-label="Yazılar">
    <div class="by sahne-alan">
      <p class="by-kunye op-kunye">01 / YAZILAR</p>

      <p v-if="hata" class="by-durum tip-govde">
        Yazılar yüklenirken bir sorun oluştu.
      </p>

      <p v-else-if="!yazilar.length" class="by-durum tip-govde">
        Henüz yayımlanmış bir yazı bulunmuyor.
      </p>

      <template v-else>
        <ol class="by-liste">
          <li v-for="(y, i) in gorunen" :key="y.id" class="by-satir">
            <article class="by-yazi">
              <!-- Numara SÜS: sıralı listenin kendi anlamı zaten var,
                   ekran okuyucuya iki kez sayı okutmanın anlamı yok. -->
              <p class="by-no op-kunye" aria-hidden="true">{{ kutukNo(i) }}</p>

              <div class="by-govde">
                <p v-if="tarihMetni(y.tarih)" class="by-tarih op-kunye">
                  <time :datetime="tarihIso(y.tarih)">{{ tarihMetni(y.tarih) }}</time>
                </p>

                <h2 class="by-baslik tip-alt">
                  <!-- Satırın TEK bağlantısı. Görsel ve "yazıyı oku" ayrı
                       birer bağlantı yapılsaydı aynı hedefe üç kez giden
                       bağlantı olurdu; tıklama alanı `::after` ile satırın
                       tamamına yayılıyor. -->
                  <NuxtLink :to="`/${y.slug}`" class="by-bag">{{ y.baslik }}</NuxtLink>
                </h2>

                <p v-if="y.ozet" class="by-ozet tip-not">{{ y.ozet }}</p>

                <p class="by-oku op-kunye" aria-hidden="true">YAZIYI OKU →</p>
              </div>

              <!--
                Görseli olmayan yazı boş çerçeve ya da yer tutucu ALMAZ:
                satır metin olarak zaten tamam.

                YALNIZ İLK SATIRIN KAPAĞI ÖNCELİKLİ — ölçülmüş, dar kapsamlı.

                TARİHÇE. Bir dönem ilk kapak `eager` + `fetchpriority="high"`
                idi ("listenin ilk görseli LCP olur" varsayımıyla), sonra
                412×823 ölçümüyle HEPSİ tembele çekildi: o görünümde ilk
                kapak katlamanın altında kalıyor ve LCP giriş paragrafı
                oluyordu. O ölçüm doğruydu — ama tek bir genişlikteydi.

                YENİDEN ÖLÇÜLDÜ (kısıtlı ağ: 1,6 Mbps / 150 ms RTT, 3 tekrar,
                medyan). Tablet genişliğinde tablo başka:

                    390 × 844    LCP p.bg-giris    7544 ms
                    834 × 1112   LCP img.by-foto   8552 ms   ← kapak LCP
                    1024 × 960   LCP p.bg-giris    7504 ms
                    1440 × 960   LCP h1.bg-h1      7544 ms

                834'te ilk kapağın üst kenarı 746 px, yani 1112 px'lik
                pencerede KATLAMANIN ÜSTÜNDE ve gerçekten LCP öğesi; tembel
                yükleme onu ~1 sn geciktiriyordu.

                Öncelik YALNIZ ilk satıra ve YALNIZ ilk sayfaya veriliyor.
                Diğer dokuz kapak tembel kalıyor — hepsini eager yapmak
                kısıtlı ağda LCP'yi belirleyen yazı tipiyle yarışan dokuz
                istek demekti.

                `width`/`height` her görselde duruyor: oran baştan bilindiği
                için tembel yükleme düzen kaymasına yol açmıyor (CLS 0).
              -->
              <figure v-if="y.gorsel" class="by-gorsel">
                <NuxtImg
                  :src="y.gorsel"
                  :alt="y.gorselAlt || y.baslik"
                  class="by-foto"
                  format="webp"
                  quality="70"
                  sizes="xs:320px sm:320px md:40vw lg:20vw xl:18vw"
                  :loading="i === 0 && sayfa === 1 ? 'eager' : 'lazy'"
                  :fetchpriority="i === 0 && sayfa === 1 ? 'high' : undefined"
                  decoding="async"
                  width="640"
                  height="400"
                />
              </figure>
            </article>
          </li>
        </ol>

        <!--
          Sayfalama: gerçek bağlantılar (eskiden `<button @click>` idi ve
          arama motoru ikinci sayfayı bulamıyordu).

          `aria-current="false"` HER BAĞLANTIDA AÇIKÇA VERİLİYOR.
          Sebebi ölçüldü: Vue Router'ın etkin-bağlantı karşılaştırması SORGU
          DİZESİNİ YOK SAYIYOR. 2. sayfadayken `/blog` hedefli bağlantılar
          ("← Önceki" ve "1") yol olarak eşleştikleri için NuxtLink'ten
          kendiliğinden `aria-current="page"` alıyor, yani ekran okuyucuya
          aynı anda üç öğe "bulunduğunuz sayfa" diyordu. Açık değer bunu
          eziyor; gerçek bulunulan sayfa zaten bağlantı değil, `<span>`.
        -->
        <nav v-if="toplamSayfa > 1" class="by-sayfalama" aria-label="Sayfalar">
          <NuxtLink
            v-if="sayfa > 1"
            :to="sayfaYolu(sayfa - 1)"
            rel="prev"
            aria-current="false"
            class="by-sayfa-bag by-sayfa-bag--yon"
            >← Önceki</NuxtLink
          >

          <ol class="by-sayfa-liste">
            <li v-for="n in sayfaNumaralari" :key="n">
              <NuxtLink
                v-if="n !== sayfa"
                :to="sayfaYolu(n)"
                aria-current="false"
                class="by-sayfa-bag"
                :aria-label="`Sayfa ${n}`"
                >{{ n }}</NuxtLink
              >
              <span v-else class="by-sayfa-bag by-sayfa-bag--simdi" aria-current="page">
                {{ n }}
              </span>
            </li>
          </ol>

          <NuxtLink
            v-if="sayfa < toplamSayfa"
            :to="sayfaYolu(sayfa + 1)"
            rel="next"
            aria-current="false"
            class="by-sayfa-bag by-sayfa-bag--yon"
            >Sonraki →</NuxtLink
          >
        </nav>
      </template>
    </div>
  </section>
</template>

<style scoped>
.by-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}
.by {
  padding-block: var(--sahne-dikey);
}
.by-kunye {
  margin-bottom: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}
.by-durum {
  margin: 0;
  max-width: var(--olcu-govde);
  color: rgb(var(--c-ink-soft));
}

/* ---- Kütük ------------------------------------------------------------- */
.by-liste {
  list-style: none;
  margin: 0;
  padding: 0;
  /* Alt çizgi kapsayıcıda: ızgara boşlukları çizgiyi bölmesin. */
  border-bottom: 1px solid rgb(var(--c-rule));
}
.by-satir {
  border-top: 1px solid rgb(var(--c-rule));
}
.by-yazi {
  position: relative;
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  gap: 0 clamp(0.75rem, 0.5rem + 1vw, 1.5rem);
  padding-block: clamp(1.5rem, 1.25rem + 1vw, 2.25rem);
}
/* `--c-measure` metin olarak kullanılmıyor (kâğıtta 3,51:1, AA eşiği 4,5:1);
   numara bir metin, `--c-ink-soft` ile 6,34:1. */
.by-no {
  margin: 0;
  color: rgb(var(--c-ink-soft));
  font-variant-numeric: tabular-nums;
}
.by-govde {
  min-width: 0;
}
.by-tarih {
  margin: 0;
  color: rgb(var(--c-ink-soft));
}
.by-baslik {
  margin: 0.375rem 0 0;
  max-width: 34ch;
}
.by-bag {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.by-bag:hover {
  border-bottom-color: rgb(var(--c-signal));
}
.by-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}
/* Tıklama alanı satırın tamamı; odak halkası yine yalnız başlığın
   etrafında çiziliyor, klavye kullanıcısı nereye bastığını görüyor. */
.by-bag::after {
  content: '';
  position: absolute;
  inset: 0;
}
.by-ozet {
  margin: 0.625rem 0 0;
  max-width: var(--olcu-govde);
}
.by-oku {
  margin: 0.875rem 0 0;
  color: rgb(var(--c-ink-soft));
}
.by-satir:hover .by-oku {
  color: rgb(var(--c-signal));
}

/*
 * MOBİLDE GENİŞLİK SINIRLI — ÖLÇÜLMÜŞ SEBEP.
 *
 * Önce görsel mobilde sütunu tamamen dolduruyordu (`sizes` 88vw). 412 px'lik
 * bir ekranda bu 363 CSS px demek; 1,75–2 DPR ile tarayıcının aradığı
 * genişlik 635–726 aygıt pikseli oluyordu. Üretilen srcset'in en büyük ara
 * adayı 614w (640 dosyası), bir sonraki 1126w (1024 dosyası) — yani tarayıcı
 * her seferinde 1024'e çıkıyordu. Lighthouse mobil koşusunda ölçüldü:
 * yalnız görseller 562 KB.
 *
 * 20rem (320 px) sınırı, 1,75 DPR'de gereken genişliği 560'a indiriyor ve
 * 563w adayı — yani 640 dosyası — seçiliyor. Görsel yine de metinden büyük
 * kaldığı için ilk satırın kapağı LCP öğesi olmayı sürdürüyor; 288 px'e
 * indirildiğinde LCP giriş paragrafına geçmiş ve yazı tipi yüklenmesine
 * bağlı hâle gelerek 2,0 sn'den 3,2 sn'ye çıkmıştı (ölçüldü). 3 DPR'li
 * cihazlar hâlâ 1024 alıyor; bu satırlar tembel yüklendiği için kabul
 * edilebilir bir kalıntı (bkz. rapor).
 */
.by-gorsel {
  margin: clamp(1rem, 0.85rem + 0.6vw, 1.5rem) 0 0;
  grid-column: 2;
  max-width: 20rem;
  background: rgb(var(--c-paper-sunken));
}
.by-foto {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

/* ---- Sayfalama --------------------------------------------------------- */
.by-sayfalama {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: clamp(0.75rem, 0.5rem + 1vw, 1.5rem);
  margin-top: clamp(1.75rem, 1.5rem + 1vw, 2.5rem);
}
.by-sayfa-liste {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
}
.by-sayfa-bag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding-inline: 0.75rem;
  font-family: var(--f-mono);
  font-size: 0.8125rem;
  letter-spacing: 0.08em;
  color: rgb(var(--c-ink-soft));
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.by-sayfa-bag:hover {
  color: rgb(var(--c-ink));
  border-bottom-color: rgb(var(--c-ink));
}
.by-sayfa-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 2px;
}
.by-sayfa-bag--simdi {
  color: rgb(var(--c-ink));
  border-bottom-color: rgb(var(--c-signal));
}

/* ===========================================================================
   MASAÜSTÜ — numara (A) · metin (B/C) · görsel (D)
   ======================================================================== */
@media (min-width: 1024px) {
  .by {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .by-kunye {
    grid-column: 1 / 8;
  }
  .by-durum {
    grid-column: 2 / 9;
  }
  .by-liste {
    grid-column: 1 / 13;
  }
  .by-sayfalama {
    grid-column: 2 / 13;
  }
  .by-yazi {
    grid-template-columns: 2.5rem minmax(0, 1fr) minmax(0, 15rem);
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }
  .by-gorsel {
    grid-column: 3;
    margin-top: 0;
    max-width: none;
  }
  .by-foto {
    aspect-ratio: 4 / 3;
  }
}
</style>
