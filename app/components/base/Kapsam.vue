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

const ornekler = computed(() => props.bolum.items || [])

/**
 * Yaka satırları. Yaka eşlemesinde olmayan bir ilçe varsa "DİĞER" satırı
 * ekleniyor — sessizce kaybolmuyor, ama hiç yoksa boş satır da basılmıyor.
 */
const yakalar = computed(() => [
  { yaka: 'AVRUPA YAKASI', adet: props.ilceler.avrupa },
  { yaka: 'ANADOLU YAKASI', adet: props.ilceler.anadolu },
  ...(props.ilceler.digerleri ? [{ yaka: 'DİĞER', adet: props.ilceler.digerleri }] : []),
])
</script>

<template>
  <section class="kp" aria-labelledby="kapsam-baslik">
    <div class="kp-alan">
      <h2 id="kapsam-baslik" class="kp-h2">{{ bolum.heading }}</h2>

      <!-- SAYIM — terim/değer ilişkisi olduğu için `dl`. Görsel düzen için
           seçilmedi: "Avrupa Yakası" gerçekten bir terim, "25" onun
           karşılığı. Toplam çizgisi süs değil, toplama işlemini kuruyor. -->
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

      <p class="kp-not">{{ bolum.note }}</p>

      <dl class="kp-ornek">
        <div v-for="o in ornekler" :key="o.label" class="kp-ornek-oge">
          <dt>{{ o.label }}</dt>
          <dd>{{ o.body }}</dd>
        </div>
      </dl>

      <!-- TEK GEÇİŞ. `/istanbul` için ikinci bir eşit aksiyon eklenmedi:
           o adres bugün eski içerik modelindeki bir bölge kaydına düşüyor,
           brief'te tarif edilen İstanbul landing sayfası değil. İki eşit
           aksiyon bölümü zayıflatırdı. -->
      <NuxtLink to="/bolgelerimiz" class="kp-bag">Bölgelerimizi incele</NuxtLink>
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

.kp-h2 {
  font-size: clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
  font-weight: 700;
  margin: 0;
  max-width: 22ch;
  text-wrap: balance;
}

/* ---- SAYIM ------------------------------------------------------------- */
.kp-sayim {
  margin: clamp(2rem, 1.5rem + 1.5vw, 3rem) 0 0;
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
  /* `--c-measure` DEĞİL. Hero'nun eyebrow'u ve Ledger'ın sıra numaraları o
     tonu kullanıyor çünkü oralarda anlamı asıl metin taşıyor; onlar
     dekoratif. Burada durum tersi: 25 / 14 / 39 sayılarının NE OLDUĞUNU
     söyleyen tek şey bu etiketler. Ölçü tonu kâğıt üzerinde 3,51:1 —
     UI çizgisi için yeterli, METİN için değil. `--c-ink-soft` 6,54:1. */
  color: rgb(var(--c-ink-soft));
}
.kp-yaka dd {
  margin: 0;
  font-size: clamp(1.25rem, 1.1rem + 0.6vw, 1.75rem);
  font-weight: 600;
  line-height: 1.4;
  font-variant-numeric: tabular-nums; /* sayılar sağda hizalansın */
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

/* ---- Destek cümlesi ---------------------------------------------------- */
.kp-not {
  font-size: clamp(1rem, 0.95rem + 0.35vw, 1.1875rem);
  line-height: 1.55;
  color: rgb(var(--c-ink-soft));
  margin: clamp(2.5rem, 1.75rem + 2vw, 3.5rem) 0 0;
  max-width: 40ch;
  text-wrap: pretty;
}

/* ---- Örnekler — kutu yok, ayraç yok, yalnız boşluk --------------------- */
.kp-ornek {
  margin: clamp(2rem, 1.5rem + 1.5vw, 3rem) 0 0;
  display: grid;
  gap: clamp(1.5rem, 1.25rem + 1vw, 2rem);
}
.kp-ornek-oge dt {
  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.kp-ornek-oge dd {
  margin: 0.375rem 0 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgb(var(--c-ink-soft));
  max-width: 34ch;
  text-wrap: pretty;
}

/* ---- Geçiş — Hero'nun çerçevesiz/altı çizgili dili, farklı yerleşim ---- */
.kp-bag {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin-top: clamp(2.25rem, 1.75rem + 1.5vw, 3rem);
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
.kp-bag:hover {
  color: rgb(var(--c-signal-deep));
  border-bottom-color: rgb(var(--c-signal-deep));
}
.kp-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}

/* ===========================================================================
   MASAÜSTÜ — sayım kendi ekseninde, örnekler yatay banda dönüyor
   ======================================================================== */
@media (min-width: 1024px) {
  .kp-alan {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: clamp(1rem, 0.5rem + 1.5vw, 2rem);
    row-gap: 0; /* dikey ritim margin ile; iki kaynak olmasın */
    align-items: start;
  }

  /* ═══════════════════════════════════════════════════════════════════
     EKSEN TERSİNE ÇEVRİLDİ — ARDIŞIK TEKRARI KIRMAK İÇİN
     ───────────────────────────────────────────────────────────────────
     Kapsam iki yapışkan sahnenin (Hero 01, Üç İstanbul 02) ARASINDA
     duruyor ve önceki yerleşimi ikisiyle aynı cümleyi kuruyordu:
     büyük tipografi solda (kol 2'den), ikincil blok sağda. Üç ekran
     üst üste aynı silüet — sayfanın ritmi değil, tek şablonun tekrarı.

     Yeni yerleşim aynı içerikle ekseni TERSİNE çeviriyor: okuma SAYIMLA
     başlıyor (kol 1, A ekseni), başlık ve destek cümlesi sağ tarafta
     kuruluyor. Perde 01'in kapanışı bir CÜMLE değil bir ÖLÇÜ ile
     açılıyor; 25 + 14 = 39 zaten bölümün asıl argümanı.

     Örnekler bandı kol 1'den başlayarak tam genişlik: üstteki iki
     sütunlu baştan sonra üçüncü bir kayıt, aynı sol eksene oturuyor.
     ═══════════════════════════════════════════════════════════════════ */

  /* Sayım artık bölümün GİRİŞİ. Küçük üst payı, mono etiketin optik
     olarak H2'nin ilk satırına oturması için. */
  .kp-sayim {
    grid-column: 1 / 4;
    grid-row: 1 / 3;
    margin-top: 0.5rem;
  }

  .kp-h2 {
    grid-column: 5 / 12;
    grid-row: 1;
    max-width: 18ch;
  }

  .kp-not {
    grid-column: 5 / 11;
    grid-row: 2;
  }

  /* Ledger yatay çizgilerle bölüyordu; burada bölen şey yalnız BOŞLUK.
     Aynı çizgi dili, farklı eksen — ve burada çizgi hiç yok. */
  .kp-ornek {
    grid-column: 1 / 13;
    grid-row: 3;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(1.5rem, 0.5rem + 2.5vw, 3.5rem);
  }

  .kp-bag {
    /* Çıkış da A ekseninde: sol kolon sayımla açıyor, bağlantıyla
       kapatıyor. */
    grid-column: 1 / 5;
    grid-row: 4;
    /* Izgara öğesi varsayılan olarak sütunu doldurur ve alt çizgi metnin
       değil hücrenin genişliğinde çizilirdi (ölçüldü: 540px). Alt çizgi
       metne ait; `start` onu metne geri bağlıyor. */
    justify-self: start;
  }
}
</style>
