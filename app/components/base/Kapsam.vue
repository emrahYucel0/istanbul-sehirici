<script setup>
/**
 * KAPSAM — `scope` kompozisyonu.
 *
 * GÖREVİ İKİ CÜMLEYİ AYNI ANDA KURMAK
 *   A. İstanbul'un tamamında çalışıyoruz.
 *   B. Tamamını aynı yer saymıyoruz.
 * Sonra üçüncüsü: isteyen gerçek bölge navigasyonuna geçebilsin.
 *
 * NEDEN 39 İLÇE LİSTELENMİYOR
 * Ana sayfanın işi dizin olmak değil. Tam liste, ilçe ve mahalle mimarisi
 * `/bolgelerimiz` ve İstanbul landing sayfasının işi. Burada 39 sayısı
 * SAYISAL KAPSAM KANITI olarak kullanılıyor, isim listesi olarak değil.
 * Bu bileşen bilerek "sonra içine 39 ilçe basarız" mantığıyla KURULMADI —
 * öyle kurulsaydı yanlış soyutlama olurdu.
 *
 * KOMPOZİSYON — ledger değil, quiet değil
 * Ledger'ın `numara | isim | açıklama` omurgası tekrar edilmiyor. Buranın
 * kendi grameri bir SAYIM (tally): iki yaka üst üste, altlarında toplam
 * çizgisi, altında toplam. Muhasebe defterinin toplam sütunu. Yatay
 * ayraç yok, kutu yok; tek yapısal çizgi gerçek bir işi yapıyor —
 * 25 + 14 = 39 ilişkisini kuruyor.
 *
 * SAYILAR TAHMİN DEĞİL AMA PROJE VERİSİNDEN DE GELMİYOR — bkz. rapor.
 * İstanbul'un resmî ilçe dağılımı: Avrupa 25, Anadolu 14, toplam 39.
 * Projedeki Region tablosu bu bilgiyi TÜRETMEYE UYGUN DEĞİL (45 aktif
 * kaydın yalnız 14'ü İstanbul ilçesi, kalanı eski markanın şehirleri).
 * Bu yüzden değerler burada sabit; gerçek veri kaynağı kurulduğunda
 * oradan türetilmeli.
 *
 * GÖRSEL YOK, HARİTA YOK
 * Hero ve Stage zaten güçlü fotoğraf taşıyor. Harita da eklenmedi: kapsamı
 * anlamak için kullanıcıya kazanç sağlamıyor, dekoratif SVG olurdu.
 *
 * HAREKET YOK
 * Scrubbed timeline Stage'in işi. Üç örnek için stagger zaten gereksiz.
 */

/**
 * İÇERİK KAYNAĞI — `HomeSection('kapsam')` + TÜRETİLMİŞ SAYIM.
 *
 * Başlık, koşul notu ve üç örnek ilçe panelden geliyor.
 *
 * SAYILAR ARTIK SABİT DEĞİL. Yukarıdaki eski not "Region tablosu bu bilgiyi
 * türetmeye uygun değil" diyordu ve o gün doğruydu: aktif kayıtların çoğu
 * eski markanın şehirleriydi. Bugün 39 İstanbul ilçesi kaydı var ve
 * sınıflandırmanın tek kaynağı `shared/utils/istanbul.ts`. Sayım sunucuda
 * o kayıtlardan yapılıyor; burada da, veri tabanında da ikinci kez
 * saklanmıyor.
 */
const props = defineProps({
  bolum: { type: Object, required: true },
  ilceler: { type: Object, required: true },
})

/**
 * ÖRNEK İLÇELER ARTIK EKRANDA DEĞİL.
 *
 * Bölümün altındaki üç örnek (Beşiktaş / Kadıköy / Başakşehir) yerini
 * İstanbul haritasına bıraktı — sayım + harita ikilisi "İstanbul'un
 * tamamı" cümlesini üç isimden daha doğrudan kuruyor, üstelik aynı üç
 * tipoloji zaten 02. bölümde (Üç İstanbul) kendi kareleriyle anlatılıyor.
 *
 * KAYIT SİLİNMEDİ. `HomeSection('kapsam').items` veri tabanında duruyor;
 * yalnız bu bileşen basmıyor. RAPORLANMASI GEREKEN AÇIK BİR DURUM: panelde
 * o üç maddeyi düzenleyen bir yönetici sayfada karşılığını göremez.
 * Kalıcı karar verilirse kayıtlar panelden temizlenmeli.
 */

/**
 * KOMPOZİSYON — ÖNSÖZ + TEK POSTER
 *
 * ÖNCE: dört ayrı blok alt alta duruyordu — sayım | başlık+not, sonra tam
 * genişlikte harita, sonra bağlantı. Ölçüldü (1440): harita 600px yüksekti
 * ve üstündeki metinden 53px uzaktaydı; bağlantı haritanın 48px altında,
 * ekranın dışında kalıyordu. Sonuç: harita kendi başına bir ekranı dolduran
 * dekor, geçiş ise ayrı bir kuyruk.
 *
 * SONRA: koşul cümlesi kendi kompakt bloğuna çekildi (önsöz); sayım, iddia
 * cümlesi ve geçiş TEK posterin içinde haritanın ÜSTÜNE yerleşti. Harita
 * artık zemin — hiçbir viewport'ta yalnız kalamaz, geçiş de kompozisyonun
 * dışına düşemez.
 *
 * Kutu, gölge, radius, cam yok. Yeni scroll/pin hareketi yok.
 */

/**
 * Yaka satırları. Yaka eşlemesinde olmayan bir ilçe varsa "DİĞER" satırı
 * ekleniyor — sessizce kaybolmuyor, ama hiç yoksa boş satır da basılmıyor.
 */
const yakalar = computed(() => [
  { yaka: 'AVRUPA YAKASI', adet: props.ilceler.avrupa },
  { yaka: 'ANADOLU YAKASI', adet: props.ilceler.anadolu },
  ...(props.ilceler.digerleri ? [{ yaka: 'DİĞER', adet: props.ilceler.digerleri }] : []),
])

/** Coğrafi sayfa ağı açık mı — bkz. composables/useRegionPages.ts. */
const bolgeAgiAcik = useRegionPages()
</script>

<template>
  <section class="kp" aria-labelledby="kapsam-baslik">
    <div class="kp-alan">
      <!--
        ÖNSÖZ — KOMPAKT, BAĞIMSIZ EDİTORYAL BLOK.
        Koşul cümlesi eskiden başlığın altına iliştirilmişti ve ikisi birlikte
        "sağ kolon" adında belirsiz bir blok kuruyordu. Artık kendi ölçüsünde,
        kendi üst çizgisiyle duruyor: posterin ÖNCÜLÜ. Poster o öncülün
        kanıtını veriyor (25 + 14 = 39 ve haritanın kendisi).
      -->
      <p class="kp-onsoz">{{ bolum.note }}</p>

      <!--
        POSTER — TEK KOMPOZİSYON.
        Sayım, cümle, harita ve geçiş AYRI bloklar değil; harita ZEMİN,
        diğer üçü onun üstünde duran ölçü katmanı. Bunun sebebi biçimsel
        değil: harita tek başına bırakıldığında (eski hâl) bir ekranı
        dolduran dekor oluyordu ve "İstanbul'un tamamı" cümlesiyle bağı
        kopuyordu. Zemin olduğunda hiçbir viewport'ta yalnız kalamıyor.

        Kutu/gölge/radius/cam YOK: poster kâğıdın kendisi, sınırını
        haritanın kadrajı çiziyor.
      -->
      <div class="kp-poster">
        <!--
          HARİTA DEKORATİF: `aria-hidden` + `alt=""`. Argüman sayımda ve
          cümlede; harita onların zemini. Üzerinde ilçe adı ya da
          tıklanabilir alan yok — dizin `/bolgelerimiz`in işi.

          Kare elde çizilmedi: `scripts/harita-cizimi.mjs` depodaki gerçek
          İstanbul haritasını sayfanın mürekkep diline çeviriyor.

          DÜZ `<img>` — `NuxtImg` DEĞİL. Ölçüldü: IPX bu saydam WebP'yi
          yeniden kodlarken 1440px'lik kutuya 814px'lik render veriyor ve
          çizgiler bulanıklaşıyor.

          VARYANTLAR YİNE DE VAR. Tek dosya kalınca 390px'lik ekrana
          1448px'lik 253 KB iniyordu ve Lighthouse mobil koşusunda sayfanın
          EN BÜYÜK kaynağıydı — hero'nun on katı. Basamaklar çalışma anında
          değil, `scripts/harita-cizimi.mjs` içinde aynı mürekkep
          tamponundan üretiliyor; yani IPX gerekçesi bozulmadan bayt
          düşüyor. `sizes` ölçülen render genişliklerinden: 1440'a kadar
          tam genişlik, üstünde kutu 1980px'te duruyor.

          `width`/`height` DEĞİŞMEDİ — oran aynı, CLS payı aynı. Görünen
          kompozisyon birebir aynı dosyayla aynı.
        -->
        <figure class="kp-harita" aria-hidden="true">
          <img
            src="/images/istanbul-harita-cizim.webp"
            srcset="
              /images/istanbul-harita-cizim-480.webp   480w,
              /images/istanbul-harita-cizim-768.webp   768w,
              /images/istanbul-harita-cizim-1024.webp 1024w,
              /images/istanbul-harita-cizim.webp      1448w
            "
            sizes="(max-width: 1440px) 100vw, 1980px"
            alt=""
            class="kp-harita-foto"
            loading="lazy"
            decoding="async"
            width="1448"
            height="1086"
          />
        </figure>

        <!-- SAYIM — terim/değer ilişkisi olduğu için `dl`. Toplam çizgisi
             süs değil, 25 + 14 = 39 işlemini kuruyor. -->
        <dl class="kp-sayim">
          <div v-for="y in yakalar" :key="y.yaka" class="kp-yaka">
            <dt>{{ y.yaka }}</dt>
            <dd>{{ y.adet }}</dd>
          </div>
          <div class="kp-toplam">
            <dt>TOPLAM İLÇE</dt>
            <dd>{{ ilceler.toplam }}</dd>
          </div>
        </dl>

        <h2 id="kapsam-baslik" class="kp-h2">{{ bolum.heading }}</h2>

        <!-- TEK GEÇİŞ ve poster kompozisyonunun İÇİNDE. Dışarı alındığında
             haritadan kopuyor ve "bölüm bitti, bir de link var" gibi
             okunuyordu. Ok dekoratif: erişilebilir ad "Bölgelerimizi
             incele" olarak kalıyor. -->
        <!--
          CREATIVE FREEZE KORUNUYOR: harita, 25/14/39 sayımı ve başlık
          coğrafi ağ kapalıyken de AYNEN duruyor — kapsam anlatısı bu
          bölümün kendi işi. Kalkan tek şey dizine giden BAĞLANTI; hedefi
          404 verdiği için. Harita zaten `aria-hidden` ve tıklanamaz,
          yani anlatı katmanı el değmeden kalıyor.
        -->
        <NuxtLink v-if="bolgeAgiAcik" to="/bolgelerimiz" class="kp-bag">
          Bölgelerimizi incele<span class="kp-ok" aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kp {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}

/* DİKEY RİTİM — perde yapısına göre, simetrik değil.
   Kapsam PERDE 01'in kapanış bloğu: Hero sahnesiyle AYNI perdede olduğu
   için üstteki dikiş dar; altındaki dikiş perde 02'ye geçtiği için geniş.
   (Kademelerin gerekçesi: assets/css/sahne.css → `--sahne-perde`.) */
.kp-alan {
  max-width: var(--container-wide);
  margin: 0 auto;
  padding: var(--sahne-dikey-dar) var(--sahne-pad) var(--sahne-perde);
}

/* ---- ÖNSÖZ — kompakt bağımsız blok ------------------------------------- */
.kp-onsoz {
  margin: 0 0 clamp(2.25rem, 1.75rem + 2vw, 3.5rem);
  max-width: 46ch;
  padding-top: clamp(0.85rem, 0.7rem + 0.5vw, 1.15rem);
  border-top: 1px solid rgb(var(--c-rule));
  font-size: clamp(1rem, 0.95rem + 0.35vw, 1.1875rem);
  line-height: 1.55;
  color: rgb(var(--c-ink-soft));
  text-wrap: pretty;
}

/* ---- POSTER ------------------------------------------------------------
   Kabın oluğunu iki yandan AŞIYOR ama pencereyi aşmıyor: `100vw`
   kullanılmadı, kaydırma çubuğu genişliği yatay taşma yapardı. */
.kp-poster {
  position: relative;
  isolation: isolate;
  margin-inline: calc(-1 * var(--sahne-pad));
  width: calc(100% + 2 * var(--sahne-pad));
  padding: clamp(1.75rem, 1.4rem + 1.6vw, 2.75rem) var(--sahne-pad);
  overflow: hidden;
  display: grid;
  gap: clamp(1.5rem, 1.1rem + 1.8vw, 2.5rem);
  align-content: space-between;
  min-height: clamp(25rem, 82vw, 34rem);
}

.kp-harita {
  position: absolute;
  inset: 0;
  z-index: 0;
  margin: 0;
  overflow: hidden;
  pointer-events: none;
}

.kp-harita-foto {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Boğaz ve Haliç kadrajın ortasında kalsın. */
  object-position: 50% 46%;
  /* Zemin olduğu için mürekkep yükü düşürüldü — ama fazla düşürülünce
     harita İstanbul olmaktan çıkıp dokuya dönüyordu. 0.55 iki isteği
     birden karşılıyor: kıyı çizgisi ve Boğaz okunuyor, üstündeki 6,5pt
     mono etiketler haritanın yol ağıyla yarışmıyor. */
  opacity: 0.55;
}

/* Metin katmanı zeminin üstünde. */
.kp-sayim,
.kp-h2,
.kp-bag {
  position: relative;
  z-index: 1;
}

.kp-h2 {
  font-size: clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
  font-weight: 700;
  margin: 0;
  max-width: 20ch;
  text-wrap: balance;
}

/* ---- SAYIM ------------------------------------------------------------- */
.kp-sayim {
  margin: 0;
  max-width: 22rem;
}
.kp-yaka,
.kp-toplam {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}
.kp-yaka dt,
.kp-toplam dt {
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  /* `--c-measure` DEĞİL. 25 / 14 / 39 sayılarının NE OLDUĞUNU söyleyen tek
     şey bu etiketler; ölçü tonu kâğıt üzerinde 3,51:1 — UI çizgisi için
     yeterli, METİN için değil. `--c-ink-soft` 6,54:1. */
  color: rgb(var(--c-ink-soft));
}
.kp-yaka dd {
  margin: 0;
  font-size: clamp(1.25rem, 1.1rem + 0.6vw, 1.75rem);
  font-weight: 600;
  line-height: 1.4;
  font-variant-numeric: tabular-nums;
}
.kp-yaka + .kp-yaka {
  margin-top: 0.375rem;
}
/* TOPLAM ÇİZGİSİ — tek yapısal çizgi, gerçek işi var: 25 + 14 = 39. */
.kp-toplam {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgb(var(--c-measure));
}
.kp-toplam dd {
  margin: 0;
  font-size: clamp(2.75rem, 1.9rem + 3.4vw, 4.5rem);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

/* ---- Geçiş — Hero'nun çerçevesiz/altı çizgili dili ---------------------- */
.kp-bag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  justify-self: start;
  font-size: 1rem;
  font-weight: 550;
  /* Bölümdeki TEK bakır öğe. 39 bilerek mürekkep kaldı: 72px'lik bakır bir
     rakam veri değil pazarlama rozeti gibi okunurdu. */
  color: rgb(var(--c-signal));
  text-decoration: none;
  border-bottom: 1px solid rgb(var(--c-signal));
  padding-bottom: 0.25rem;
  transition: color 0.15s ease-out, border-color 0.15s ease-out;
}
.kp-ok {
  transition: transform 0.15s ease-out;
}
.kp-bag:hover {
  color: rgb(var(--c-signal-deep));
  border-bottom-color: rgb(var(--c-signal-deep));
}
.kp-bag:hover .kp-ok {
  transform: translateX(3px);
}
@media (prefers-reduced-motion: reduce) {
  .kp-ok {
    transition: none;
  }
  .kp-bag:hover .kp-ok {
    transform: none;
  }
}
.kp-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}

/* ===========================================================================
   MASAÜSTÜ — POSTERİN ÇAPRAZ OKUMASI
   ───────────────────────────────────────────────────────────────────────
   Sayım sol üstte (ölçü), cümle orta sağda (iddia), geçiş sol altta
   (çıkış). Üçü haritanın üstünde tek bir çapraz kuruyor; kompozisyon
   ne üst blok + alt görsel, ne de yan yana iki sütun.
   ======================================================================== */
@media (min-width: 1024px) {
  .kp-poster {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-rows: auto minmax(0, 1fr) auto;
    column-gap: clamp(1rem, 0.5rem + 1.5vw, 2rem);
    row-gap: clamp(1.5rem, 1rem + 2vw, 3rem);
    align-content: stretch;
    padding-block: clamp(2.25rem, 1.6rem + 2vw, 3.5rem);
    min-height: clamp(28rem, 46vw, 42rem);
  }

  .kp-sayim {
    grid-column: 1 / 4;
    grid-row: 1;
  }

  .kp-h2 {
    grid-column: 6 / 13;
    grid-row: 2;
    align-self: center;
    max-width: 18ch;
  }

  .kp-bag {
    grid-column: 1 / 6;
    grid-row: 3;
    align-self: end;
  }

  .kp-onsoz {
    max-width: 52ch;
  }
}
</style>
