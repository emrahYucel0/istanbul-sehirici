<script setup>
/**
 * BLOG YAZI DETAYI — V2
 *
 * Eski `article/PostView.vue`'nun yerini alıyor. O bileşen duruyor ama artık
 * kullanılmıyor.
 *
 * ADRES DEĞİŞMEDİ: yazılar kök seviyede yayınlanıyor (`/{slug}`).
 * `/blog/{slug}` diye bir rota YOK ve bu turda da açılmadı.
 *
 * İÇERİK DEĞİŞMEDİ: başlık, özet, gövde, tarih, görsel ve alt metin
 * veri tabanından geldiği gibi basılıyor. Bu tur yalnız sunum.
 *
 * ─────────────────────────────────────────────────────────────────────
 * DÜZELTİLEN DÖRT ŞEY
 *
 * 1. UYDURMA YAZAR. Meta satırı "İstanbul Eve Nakliyat Ekibi · 12 Nisan
 *    2026" yazıyordu. Ölçüldü: on Post kaydının HİÇBİRİNDE `author` dolu
 *    değil — yani ad tamamen şablondan geliyordu. Alan gerçekten
 *    doldurulursa gösterilir; boşsa satır hiç basılmaz. Yapısal veriden de
 *    kaldırıldı (aşağıya bakın).
 *
 * 2. COĞRAFİ BAĞLANTI ÇİFTLİĞİ. `article-related-links` her yazının altına
 *    şablondan üretilmiş 3 hizmet ve 10 bölge bağlantısı koyuyordu —
 *    ölçüldü: /kis-aylarinda-tasinmak sayfasında /seyhan, /marmaris,
 *    /nilufer gibi İSTANBUL DIŞI ilçeler dahil. Yazının konusuyla ilgisi
 *    olmayan bir bağlantı çiftliğiydi; kaldırıldı. Yazı metninin KENDİ
 *    içindeki bağlantılar korunuyor (bugün hiç yok, ölçüldü).
 *
 * 3. YOL İZİ YOKTU. Ölçüldü: `BreadcrumbList` = 0. Artık üç kademe var ve
 *    ortadaki kademe gerçek `/blog` bağlantısı — düz adres, hiyerarşiyi
 *    bozmuyor.
 *
 * 4. KAPAK GÖRSELİNİN ÖLÇÜSÜ BİLDİRİLMİYORDU (`width`/`height` = null).
 *    Görsel indirilene kadar yer kaplamadığı için altındaki metin
 *    kayabiliyordu. Yer ayırma eklendi.
 *
 * ─────────────────────────────────────────────────────────────────────
 * M11A — TEKNİK ONARIM (bu tur)
 *
 * a. CLS 0.120 → 0 (390 px, font 1.200 ms geciktirilerek 4/4 tur).
 *    Kök neden yol izindeki `max-width: 34ch` idi; ayrıntı ve deney
 *    tablosu `.yz-yol [aria-current]` kuralının başında.
 *
 * b. Kapaktaki `width="1024" height="576"` KALDIRILDI — on kapağın
 *    onunda da yanlıştı. Yer ayırma artık yalnız CSS `aspect-ratio`.
 *
 * c. `sizes` beş kırılımdan üçe indi; srcset adayı 10 → 6. Doğruluk
 *    kaybı yok (kutu genişlikleri ölçüldü), üretilen aday sayısı azaldı.
 *
 * d. TEKNİK MARJ eklendi: gövdenin sağındaki 641 px'lik ölü şerit,
 *    yazının kendi `<h2>` iskeletiyle dolduruldu (ServiceView'daki
 *    `hz-marj` ile aynı yapı). Uydurma veri yok, bağlantı yok, JS yok.
 *
 * e. Yol izi dokunma alanına DOKUNULMADI — M10'un "20 px" bulgusu
 *    yanlıştı, gerçek hedef zaten 36 px (gerekçe kuralın başında).
 *
 * KAPAK EAGER KALIYOR — ÖLÇÜLDÜ. 412×823 mobil görünümde LCP öğesi
 * gerçekten bu görsel (`article__img`, 77.510 px²). Blog dizininde bunun
 * tersi çıkmıştı (orada ilk kapak katlamanın altındaydı ve `eager`
 * kaldırılmıştı); burada varsayımla değil ölçümle korunuyor.
 *
 * PROSE ORTAK BİLEŞEN. `article-prose` altı ailede kullanılıyor (ilçe,
 * mahalle, hizmet, bölge, politika, yazı) ve V2 sayfalarında olduğu gibi
 * kabul edilmiş durumda. Buradan YENİDEN BİÇİMLENDİRİLMİYOR; yalnız okuma
 * genişliği veriliyor.
 */
import { computed } from 'vue'

const props = defineProps({
  post: { type: Object, required: true },
  previous: { type: Object, default: null },
  next: { type: Object, default: null },
})

/** Yazar alanı boşsa satır hiç basılmıyor — yedek ad ÜRETİLMİYOR. */
const yazar = computed(() => String(props.post.author ?? '').trim())

const tarih = computed(() => {
  if (!props.post.createdAt) return ''
  const t = new Date(props.post.createdAt)
  if (Number.isNaN(t.getTime())) return ''
  return t.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
})
const tarihIso = computed(() => {
  if (!props.post.createdAt) return undefined
  const t = new Date(props.post.createdAt)
  return Number.isNaN(t.getTime()) ? undefined : t.toISOString()
})

/** Panelden girilen alt metin varsa o; yoksa başlıktan türetilen açıklama. */
const gorselAlt = computed(() => {
  const elle = props.post.imageAlt?.trim()
  if (elle) return elle
  const kisa = props.post.shortTitle?.trim() || props.post.title?.trim()
  return kisa ? `${kisa} konulu yazının kapak görseli` : 'Yazının kapak görseli'
})

/**
 * YAZININ KENDİ İSKELETİ — gövdedeki `<h2>` başlıkları, sırayla.
 *
 * ServiceView'daki `adimlar` ile aynı yöntem: içeriğe yeni alan eklenmiyor,
 * yazının zaten yazdığı bölüm başlıkları okunuyor. Doğrusal tarama; geri
 * izlemeli düzenli ifade YOK (uzun gövdede maliyeti öngörülemez).
 *
 * Üçten az başlık varsa liste hiç üretilmiyor: iki maddelik bir iskelet
 * okura hiçbir şey söylemez.
 */
const bolumler = computed(() => {
  const html = String(props.post?.content || '')
  const bulunan = []
  let i = html.indexOf('<h2')
  while (i !== -1) {
    const acilisSonu = html.indexOf('>', i)
    const kapanis = acilisSonu === -1 ? -1 : html.indexOf('</h2', acilisSonu)
    if (acilisSonu === -1 || kapanis === -1) break
    const metin = html
      .slice(acilisSonu + 1, kapanis)
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (metin) bulunan.push(metin)
    i = html.indexOf('<h2', kapanis)
  }
  return bulunan.length >= 3 ? bulunan : []
})

const etiket = (y) =>
  y?.shortTitle?.trim() || y?.subtitle?.trim() || y?.title?.trim() || ''

const oncekiYazi = computed(() =>
  props.previous && etiket(props.previous)
    ? { slug: props.previous.slug, ad: etiket(props.previous) }
    : null
)
const sonrakiYazi = computed(() =>
  props.next && etiket(props.next) ? { slug: props.next.slug, ad: etiket(props.next) } : null
)
</script>

<template>
  <article class="yz">
    <!-- ---- GİRİŞ ------------------------------------------------------ -->
    <section class="yz-giris-kap">
      <div class="yz-giris sahne-alan">
        <nav class="yz-yol" aria-label="Yol izi">
          <ol class="yz-yol-liste" itemscope itemtype="https://schema.org/BreadcrumbList">
            <li
              class="yz-yol-oge"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
            >
              <NuxtLink to="/" itemprop="item"><span itemprop="name">Ana sayfa</span></NuxtLink>
              <meta itemprop="position" content="1" />
            </li>
            <li
              class="yz-yol-oge"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
            >
              <NuxtLink to="/blog" itemprop="item"><span itemprop="name">Blog</span></NuxtLink>
              <meta itemprop="position" content="2" />
            </li>
            <li
              class="yz-yol-oge"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
            >
              <span itemprop="name" aria-current="page">{{ post.title }}</span>
              <meta itemprop="position" content="3" />
            </li>
          </ol>
        </nav>

        <p class="yz-kunye op-kunye">
          BİLGİ / BLOG<span v-if="tarih"> / <time :datetime="tarihIso">{{ tarih }}</time></span>
        </p>

        <h1 id="yazi-baslik" class="yz-h1 tip-baslik">{{ post.title }}</h1>

        <p v-if="post.excerpt" class="yz-ozet tip-giris">{{ post.excerpt }}</p>

        <!-- Yazar alanı gerçekten doluysa basılır. Bugün on kaydın
             hiçbirinde dolu değil, yani bu satır ekranda görünmüyor. -->
        <p v-if="yazar" class="yz-yazar op-kunye">{{ yazar }}</p>

        <figure v-if="post.image" class="yz-kapak">
          <NuxtImg
            :src="post.image"
            :alt="gorselAlt"
            class="yz-foto"
            format="webp"
            quality="72"
            sizes="xs:92vw lg:62vw xl:900px"
            loading="eager"
            fetchpriority="high"
            preload
            decoding="async"
          />
        </figure>
      </div>
    </section>

    <!-- ---- GÖVDE ------------------------------------------------------ -->
    <section class="yz-govde-kap" aria-labelledby="yazi-baslik">
      <div class="yz-govde sahne-alan" :class="{ 'yz-govde--marjli': bolumler.length }">
        <article-prose :html="post.content" class="yz-metin" />

        <!--
          TEKNİK MARJ — yazının kendi bölüm başlıkları, sağ marjda.
          Süs değil: makalenin iskeletini okurken görünür tutuyor.
          Bağlantı YOK, numara YOK, JS YOK, animasyon YOK. Ekran okuyucu
          için tekrar olurdu (aynı başlıklar gövdede zaten var), o yüzden
          `aria-hidden`. Mobil/tablette hiç basılmıyor.
        -->
        <aside v-if="bolumler.length" class="yz-marj" aria-hidden="true">
          <div class="yz-marj-ic">
            <p class="yz-marj-kunye op-kunye">BU YAZIDA</p>
            <ol class="yz-marj-liste">
              <li v-for="b in bolumler" :key="b" class="yz-marj-oge">{{ b }}</li>
            </ol>
          </div>
        </aside>
      </div>
    </section>

    <!-- ---- KAPANIŞ ---------------------------------------------------- -->
    <section class="yz-son-kap" aria-label="Yazı sonu">
      <div class="yz-son sahne-alan">
        <p class="yz-son-kunye op-kunye">SONRAKİ</p>

        <ol v-if="oncekiYazi || sonrakiYazi" class="yz-komsu">
          <li v-if="oncekiYazi" class="yz-komsu-oge">
            <p class="yz-komsu-yon op-kunye">← ÖNCEKİ YAZI</p>
            <p class="yz-komsu-ad tip-alt">
              <NuxtLink :to="`/${oncekiYazi.slug}`" class="yz-komsu-bag">{{
                oncekiYazi.ad
              }}</NuxtLink>
            </p>
          </li>
          <li v-if="sonrakiYazi" class="yz-komsu-oge yz-komsu-oge--sag">
            <p class="yz-komsu-yon op-kunye">SONRAKİ YAZI →</p>
            <p class="yz-komsu-ad tip-alt">
              <NuxtLink :to="`/${sonrakiYazi.slug}`" class="yz-komsu-bag">{{
                sonrakiYazi.ad
              }}</NuxtLink>
            </p>
          </li>
        </ol>

        <!-- Dönüşüm hero'su YOK: yazıyı bitiren okuyucu ikinci bir hero
             değil, sakin bir yön görüyor. -->
        <!-- İLETİŞİM CÜMLESİ BURADAN ÇIKTI: sayfanın en sonunda ortak
             kapanış imzası duruyor ve aynı işi telefonuyla birlikte
             yapıyor. Kalan yön okuma niyetine ait — dizine dönüş. -->
        <p class="yz-kapanis tip-govde">
          Diğer yazılar
          <NuxtLink to="/blog" class="op-bag op-bag--sakin yz-bag">blog dizininde</NuxtLink>.
        </p>
      </div>
    </section>
  </article>
</template>

<style scoped>
/* ---- Giriş -------------------------------------------------------------- */
.yz-giris-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}
.yz-giris {
  padding-block: var(--sahne-dikey-dar) 0;
}

.yz-yol-liste {
  list-style: none;
  display: flex;
  /*
   * `wrap` DEĞİL — bkz. [aria-current] altındaki gerekçe. Sarma açıkken
   * satır sayısı yazı tipi ölçüsüne bağlı kalıyordu. Kapalıyken son öğe
   * sarmak yerine kısalıyor: kademe sayısı üç, hepsi tek satırda.
   */
  flex-wrap: nowrap;
  align-items: baseline;
  gap: 0 0.5rem;
  margin: 0;
  padding: 0;
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  color: rgb(var(--c-ink-soft));
}
/* İlk iki kademe kısa ve sabit; kısalması gereken yalnız başlık. */
.yz-yol-oge {
  flex: 0 0 auto;
  white-space: nowrap;
}
/* Son kademe kendi içinde de esnek: ayraç sabit, başlık kısalan taraf. */
.yz-yol-oge:last-child {
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  align-items: baseline;
}
.yz-yol-oge + .yz-yol-oge::before {
  content: '/';
  margin-right: 0.5rem;
  color: rgb(var(--c-measure));
}
/*
 * DOKUNMA ALANI — ÖLÇÜLDÜ, MÜDAHALE EDİLMEDİ.
 *
 * M10 raporu buraya ServiceView'daki `::after { inset }` tekniğini
 * öneriyordu; gerekçe "hedef 20 px, 24 px eşiğinin altında" idi. O sayı
 * YANLIŞTI: `getBoundingClientRect().height` bağlantının GÖRSEL kutusu,
 * işaretçi hedefi değil. Gerçek hedef `elementFromPoint` ile taranınca
 *     mevcut hâli          36 × 74 px   ✔
 *     `::after` eklenince  28 × 74 px   ✗ (daha KÜÇÜK)
 * çıkıyor: mutlak konumlu katman satır kutusunun kendi hedef alanını
 * örtüp kırpıyor. Eklenen kod ölçümde durumu kötüleştirdiği için geri
 * alındı. Satır içi bağlantı, satır yüksekliği boyunca zaten hedeflenebilir.
 */
.yz-yol a {
  color: rgb(var(--c-ink-soft));
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.yz-yol a:hover {
  color: rgb(var(--c-ink));
  border-bottom-color: rgb(var(--c-ink));
}
.yz-yol [aria-current='page'] {
  color: rgb(var(--c-ink));
  /*
   * `max-width: 34ch` KALDIRILDI — CLS 0.237'nin kök nedeni buydu.
   *
   * `ch`, o anki yazı tipinin "0" genişliğidir. `.yz-yol-liste`
   * `--f-mono` kullanıyor ve `--f-sans`ın aksine mono'nun ölçü
   * eşleştirilmiş yedeği YOK (bkz. fonts.css: "Inter Fallback" yalnız
   * gövde yazı tipi için var). JetBrains Mono yüklendiği anda `34ch`
   * 206 px'ten 224 px'e çıkıyor, üçüncü öğe 390 px'te satıra sığmıyor
   * ve `flex-wrap: wrap` onu ikinci satıra atıyor: yol izi 20 px'ten
   * 40 px'e büyüyor ve ALTINDAKİ BÜTÜN MAKALEYİ kaydırıyor.
   *
   * Deneyle ayrıldı (raporda tablo): yalnız mono engellendiğinde
   * CLS 0.237 → 0; yalnız Archivo engellendiğinde 0.237 (değişmiyor).
   *
   * Çözüm semptomu gizlemek değil, SEBEBİ kaldırmak: satır sayısı artık
   * yazı tipi ölçüsünden bağımsız. Liste sarmıyor, son öğe kalan alana
   * göre kısalıyor. Üç nokta davranışı aynen duruyor.
   */
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yz-kunye {
  margin-top: clamp(1.75rem, 1.25rem + 2vw, 3rem);
}
.yz-h1 {
  margin-top: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
  max-width: 22ch;
}
.yz-ozet {
  margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
  max-width: var(--olcu-govde);
}
.yz-yazar {
  margin-top: clamp(0.75rem, 0.6rem + 0.5vw, 1.125rem);
  color: rgb(var(--c-ink-soft));
}

.yz-kapak {
  margin: clamp(2rem, 1.5rem + 1.5vw, 3rem) 0 0;
  background: rgb(var(--c-paper-sunken));
}
.yz-foto {
  display: block;
  width: 100%;
  height: auto;
  /*
   * YER AYIRMA TEK KAYNAKTAN: CSS.
   *
   * Önce `width="1024" height="576"` nitelikleri de yazılıydı ve
   * ONLARIN HİÇBİRİ DOĞRU DEĞİLDİ — on kapağın gerçek ölçüleri ölçüldü:
   *     7 × 1024×559 (1.832)   2 × 1024×1024 (1.000)   1 × 1024×687 (1.491)
   * Yani 576 yüksekliği on dosyanın onunda da yanlıştı. Yanlış intrinsik
   * bildirim tarayıcının srcset/sizes hesabını da besliyor.
   *
   * Nitelikler kaldırıldı; yer ayırma buradaki `aspect-ratio` ile
   * yapılıyor (ServiceView'ın M2'de aldığı kararla aynı yöntem: rezervasyon
   * CSS'te, dosya hakkında yanlış beyan yok). CLS 0 kalıyor.
   *
   * ORAN 16/9 KALIYOR — ölçümle: on kapakta ortalama kırpma
   *     16/9 %12,4   ·   16/10 %17,0   ·   3/2 %19,4   ·   4/3 %25,1
   * Çoğunluk (7/10) zaten 1.832 olduğu için oranı "yumuşatmak" toplam
   * kırpmayı ARTIRIYOR. İki kare kapağın kırpımı ayrıca gözle denetlendi:
   * konu ikisinde de kadrajda kalıyor (rapor).
   */
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

/* ---- Gövde -------------------------------------------------------------- */
.yz-govde-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}
.yz-govde {
  padding-block: var(--sahne-dikey) var(--sahne-dikey-dar);
}
/*
 * OKUMA GENİŞLİĞİ ~64ch. Prose bileşeninin KENDİ tipografisi
 * DEĞİŞTİRİLMİYOR — altı ailede ortak ve V2 sayfalarında zaten kabul
 * edilmiş durumda. Buradan yalnız ölçü veriliyor; 1920 px'te de metin
 * 1000 px'e yayılmıyor.
 */
.yz-metin {
  max-width: 64ch;
}

/* Teknik marj yalnız masaüstünde var; mobil/tablette normal akış bozulmuyor. */
.yz-marj {
  display: none;
}

/* ---- Kapanış ------------------------------------------------------------ */
.yz-son-kap {
  background: rgb(var(--c-paper-sunken));
  color: rgb(var(--c-ink));
  border-top: 1px solid rgb(var(--c-rule));
}
.yz-son {
  padding-block: var(--sahne-dikey);
}
.yz-son-kunye {
  margin: 0 0 clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
  color: rgb(var(--c-ink-soft));
}

.yz-komsu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
  border-bottom: 1px solid rgb(var(--c-rule));
}
.yz-komsu-oge {
  position: relative;
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem);
}
.yz-komsu-yon {
  margin: 0;
  color: rgb(var(--c-ink-soft));
}
.yz-komsu-ad {
  margin: 0.375rem 0 0;
  max-width: 34ch;
}
.yz-komsu-bag {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.yz-komsu-bag:hover {
  border-bottom-color: rgb(var(--c-signal));
}
.yz-komsu-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}
/* Dokunma hedefi satırın tamamı (aynı desen: region/IlceDizini.vue). */
.yz-komsu-bag::after {
  content: '';
  position: absolute;
  inset: 0;
}

.yz-kapanis {
  margin: clamp(1.75rem, 1.5rem + 1vw, 2.5rem) 0 0;
  max-width: var(--olcu-govde);
}
/* `.op-bag`ın 44 px taban yüksekliği cümle içinde alt çizgiyi metinden
   koparıyor (bkz. `.ba-bag`, `.sb-bag`, `.ho-bag`, `.fs-bag`, `.bk-bag`). */
.yz-bag {
  min-height: 0;
  font-size: inherit;
  font-weight: 600;
  padding-bottom: 0.05em;
}

/* ===========================================================================
   MASAÜSTÜ — okuma sürekliliği önce gelir: gövde tek sütun, zikzak yok.
   ======================================================================== */
@media (min-width: 1024px) {
  .yz-giris {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }
  .yz-yol {
    grid-column: 1 / 10;
  }
  .yz-kunye,
  .yz-h1,
  .yz-ozet,
  .yz-yazar {
    grid-column: 2 / 10;
  }
  /*
   * KAPAK METİN SÜTUNUYLA AYNI EKSENDE — ölçülmüş sebep.
   * Önce 2/12 idi: 1440 px'te kutu 1.110 px oluyordu ama en büyük görsel
   * varyantı 1.024 px, yani tarayıcı görseli %8 büyütüyordu. 2/10'da kutu
   * ~888 px'e iniyor, varyant yetiyor ve kapak okuma sütunundan taşmıyor —
   * kullanıcı okumaya daha erken başlıyor (dev hero değil).
   */
  .yz-kapak {
    grid-column: 2 / 10;
  }

  .yz-govde {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  /* Gövde B–C ekseninde, başlıkla aynı hizada başlıyor. */
  .yz-metin {
    grid-column: 2 / 10;
  }

  /*
     TEKNİK MARJ — D ekseni (10–13), ServiceView'daki `hz-marj` ile aynı
     yapı. `position: sticky` sabit bir ızgara satırının içinde: bölüm
     kaymaya devam ediyor, yalnız marj kendi alanında kalıyor. Pin sahnesi
     DEĞİL — kaydırma zaman çizelgesi, animasyon, JS yok; hareket eden bir
     şey olmadığı için `prefers-reduced-motion` davranışı da değişmiyor.
  */
  .yz-govde--marjli .yz-metin {
    grid-row: 1;
  }
  .yz-marj {
    display: block;
    grid-column: 10 / 13;
    grid-row: 1;
    align-self: stretch;
    border-left: 1px solid rgb(var(--c-rule));
    padding-left: clamp(1rem, 0.75rem + 0.8vw, 1.75rem);
  }
  .yz-marj-ic {
    position: sticky;
    top: calc(var(--sahne-navbar) + 3.5rem);
  }
  /* Marjın başladığı yeri işaretleyen tek bakır datum. */
  .yz-marj-kunye {
    position: relative;
    padding-bottom: 0.75rem;
  }
  .yz-marj-kunye::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 1.25rem;
    height: 1px;
    background: rgb(var(--c-signal));
  }
  .yz-marj-liste {
    list-style: none;
    margin: 1rem 0 0;
    padding: 0;
    display: grid;
    gap: 0.7rem;
  }
  /* Madde işareti nokta değil ölçü çizgisi — sitenin kütük dili. */
  .yz-marj-oge {
    position: relative;
    padding-left: 1.75rem;
    font-family: var(--f-mono);
    font-size: 0.75rem;
    line-height: 1.45;
    color: rgb(var(--c-ink-soft));
  }
  .yz-marj-oge::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.55em;
    width: 1rem;
    height: 1px;
    background: rgb(var(--c-measure));
  }

  .yz-son {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .yz-son-kunye {
    grid-column: 1 / 8;
  }
  .yz-komsu {
    grid-column: 2 / 12;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .yz-komsu-oge--sag {
    text-align: right;
  }
  .yz-komsu-oge--sag .yz-komsu-ad {
    margin-left: auto;
  }
  .yz-kapanis {
    grid-column: 2 / 10;
  }
}
</style>
