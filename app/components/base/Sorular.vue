<script setup>
/**
 * SORULAR — ikinci `ledger`, ama Hizmetler'in kopyası değil.
 *
 * GÖREVİ
 * Teklif öncesi gerçek belirsizlikleri azaltmak. SEO için soru yığmak değil;
 * altı soru, hepsi İstanbul'da taşınacak birinin karar verirken gerçekten
 * takıldığı yerler.
 *
 * HİZMETLER LEDGER'INDAN AYRIMLAR (dördü de kasıtlı):
 *   1. NUMARA YOK. Asılı rakam dili orada kullanıldı; burada tekrarı
 *      dekorasyon olurdu. Numaranın taşıyacağı bir bilgi de yok.
 *   2. ÇİZGİ SİSTEMİ FARKLI. Hizmetler'de yedi tam genişlik ayraç vardı.
 *      Burada İKİ çizgi var ve işleri farklı: kümeyi açıp kapatıyorlar
 *      (grup sınırı). Satır araları yalnız boşlukla ayrılıyor.
 *   3. KOLON ORANI FARKLI. Hizmetler 1 | 2-7 | 7-12. Burada soru 1-5,
 *      cevap 7-12; sol kenar sayfa içerik kenarında, ara kolon boş.
 *   4. AĞIRLIK İLİŞKİSİ TERS. Hizmetler'de ad kısa ve güçlü, açıklama
 *      uzundu. Burada soru sarmalı bir blok, cevap sakin bir blok.
 *
 * AÇILIR KAPANIR YOK — gerekçe ölçüldü
 * Cevaplar 1-2 cümle (130-190 karakter). Bu uzunlukta gizleme, kullanıcıya
 * bilgi kazandırmadan tıklama maliyeti bindirir. Açık cevaplar SSR'da
 * doğrudan var, arama motoru için doğrudan okunur, JS maliyeti sıfır.
 * `<details>` ancak cevaplar düzeni bozacak kadar uzun olsaydı gerekirdi.
 *
 * VERİ KAYNAĞI — bilinçli olarak CMS'e BAĞLANMADI (bkz. rapor)
 * `/api/faq-section` içinde dokuz soru var ama cevapları 432-624 karakter,
 * yani bu kompozisyonun hedefinin 3-5 katı; ayrıca sorular eski markanın
 * genel SEO setine ait. Aynen taşımak ana sayfayı ikinci bir blog yazısına
 * çevirirdi. İçerik modeli (`FaqSection`/`FaqItem`) bu bölümü besleyebilir;
 * içerik yeniden yazıldığında bağlanacak.
 *
 * DOĞRULANMAMIŞ İDDİA YOK
 * "%100 sigortalı", "ücretsiz keşif", "aynı gün teslim", "hasarsız taşıma
 * garantisi", "12 yıl deneyim", "8.500 taşıma", "81 il" — hiçbiri yok.
 * Süre sorusu bile bir süre TAAHHÜT ETMİYOR; süreyi neyin belirlediğini
 * anlatıyor. Sigorta cevabı yalnız mekanizmayı tarif ediyor (beyan → eksper),
 * kapsam oranı veya garanti sözü vermiyor.
 *
 * BAĞLANTI YOK. Bölüm dönüşüm bölümü değil; kapanış CLOSE/CTA'nın işi.
 *
 * "MONO YOK, BAKIR YOK, HAREKET YOK" NOTU ARTIK GEÇERLİ DEĞİL — gerekçesi
 * aşağıdaki SÜREKLİ HAT bölümünde.
 */

/**
 * ICERIK KAYNAGI — `FaqSection` / `FaqItem`.
 *
 * Yukaridaki eski not "icerik modeli bu bolumu besleyebilir; icerik yeniden
 * yazildiginda baglanacak" diyordu. Icerik yeniden yazildi ve baglandi: bu
 * alti soru artik veri tabaninda ve panelden duzenlenebiliyor.
 *
 * ESKI DOKUZ SORU GERI GELMIYOR. Eski markanin 432-624 karakterlik SEO
 * cevaplari kayitta duruyor ama PASIF; sunucu yalniz aktif olanlari
 * donduruyor. Silinmediler — geri alinamaz bir karar bu turun isi degil.
 *
 * Semantik: `<dl>`. Soru gercekten bir terim, cevap onun karsiligi.
 * `h3` yapilmadi — alti soru sayfanin baslik agacina alti dugum daha
 * eklerdi ve hicbiri bolum basligi degil.
 */
const props = defineProps({
  sorular: { type: Object, required: true },
})

const liste = computed(() => props.sorular.items || [])

/**
 * Omurga üzerindeki çentik konumları — 0 ile 1 arasında oran.
 *
 * CSS'te `calc(var(--i) * 100% / var(--n))` yazmak yerine oran BURADA
 * hesaplanıyor: bölme işleminin sağ tarafındaki değerin sayı olarak
 * çözülmesi tarayıcıdan tarayıcıya güvenilmez, oran ise düz bir sayı.
 * Tek soru varsa bölme sıfıra düşmesin diye payda en az 1.
 */
const centikler = computed(() => {
  const n = liste.value.length
  return liste.value.map((_, i) => i / Math.max(n - 1, 1))
})
</script>

<template>
  <section class="ss" aria-labelledby="sorular-baslik">
    <div class="ss-alan">
      <!-- SOL EKSEN — masaustunde yapiskan, mobilde duz akis.
           Basligin id'si ve metni degismedi; yalniz sarmalayici geldi. -->
      <div class="ss-eksen">
        <h2 id="sorular-baslik" class="ss-h2">{{ sorular.heading }}</h2>

        <!--
          SUREKLI HAT — bilgi gercek sorularda oldugu icin `aria-hidden`.
          Ekran okuyucuya "6 cizgi" okutmanin faydasi yok; hat gorsel bir
          olcek, icerik degil.
        -->
        <div class="ss-omurga" aria-hidden="true">
          <span class="ss-omurga-cizgi" />
          <span
            v-for="(t, i) in centikler"
            :key="i"
            class="ss-centik"
            :style="{ '--t': t }"
          />
          <span class="ss-imlec" />
        </div>
      </div>

      <dl class="ss-liste">
        <!-- Her Q/A'nin kendi kucuk yatay cizgisi `::before` ile geliyor:
             `<dl><div>` icinde yalniz `dt`/`dd` bulunabilir, araya `span`
             koymak isaretlemeyi gecersiz kilardi. -->
        <div v-for="s in liste" :key="s.question" class="ss-oge">
          <dt class="ss-soru">{{ s.question }}</dt>
          <dd class="ss-cevap">{{ s.answer }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.ss {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}

/* Perde 04'ün ikinci bloğu: üstte blok dikişi, altta dar pay —
   Yorumlar da aynı perdede. (bkz. assets/css/sahne.css) */
.ss-alan {
  max-width: var(--container-wide);
  margin: 0 auto;
  padding: var(--sahne-dikey) var(--sahne-pad) var(--sahne-dikey-dar);
}

.ss-h2 {
  font-size: clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
  font-weight: 700;
  margin: 0 0 clamp(1.75rem, 1.25rem + 1.6vw, 3rem);
  /* 20ch başlığı üç kelime için iki satıra kırıyordu; tek satır daha sakin. */
  max-width: 30ch;
  text-wrap: balance;
}

/* İKİ ÇİZGİ — kümeyi açıyor ve kapatıyor. Hizmetler'deki satır ayraçları
   sistemi DEĞİL: aradaki ayrım yalnız boşlukla kuruluyor. */
.ss-liste {
  margin: 0;
  padding: clamp(1.75rem, 1.25rem + 1.6vw, 2.75rem) 0;
  border-top: 1px solid rgb(var(--c-measure));
  border-bottom: 1px solid rgb(var(--c-rule));
  display: grid;
  gap: clamp(2.25rem, 1.75rem + 1.5vw, 3.25rem);
}

.ss-soru {
  font-size: clamp(1.125rem, 1.02rem + 0.45vw, 1.375rem);
  line-height: 1.3;
  letter-spacing: -0.012em;
  font-weight: 600;
  max-width: 30ch;
  text-wrap: balance;
}

.ss-cevap {
  margin: 0.625rem 0 0;
  font-size: clamp(0.875rem, 0.84rem + 0.16vw, 0.9375rem);
  line-height: 1.65;
  color: rgb(var(--c-ink-soft));
  max-width: 52ch;
  text-wrap: pretty;
}

/* Omurga MOBİLDE YOK. Dar ekranda soru/cevap zaten tek sütun; ölçek
   çizmek için ayrılacak yatay yer de yok, pin de yok (md.7). */
.ss-omurga {
  display: none;
}

/* ===========================================================================
   MASAÜSTÜ — SÜREKLİ HAT
   ---------------------------------------------------------------------------
   NEDEN EKLENDİ
   Bölüm sayfanın en hareketsiz üç ekranından biriydi: yalnız iki grup
   çizgisi ve altı blok. Süreç bölümünün omurgası (`base/Surec.vue`) bu
   sitede zaten onaylı bir araç; Sorular'a yeni bir desen icat etmek
   yerine AYNI dil uyarlandı.

   HAT NE ANLATIYOR
     · tek sürekli dikey çizgi     → kümenin bütünü
     · soru başına bir çentik      → kaç soru olduğu, tek bakışta
     · bakır imleç                 → okumanın nerede olduğu
     · her Q/A'nın kendi kısa hattı → satırı eksene bağlayan bağ

   HAREKETİN SINIRI
   Kıpırdayan TEK şey imleç ve o da bir konum bildiriyor. Metin, başlık ve
   cevaplar hiç hareket etmiyor; opaklık hiçbir yerde kullanılmıyor.
   Motor native CSS scroll-driven animation — JS yok, kaydırma dinleyicisi
   yok, kütüphane yok.
   ======================================================================== */
@media (min-width: 1024px) {
  .ss-alan {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: clamp(1rem, 0.5rem + 1.5vw, 2rem);
    align-items: start;
  }

  /* Sol eksen yapışkan: liste kayarken başlık ve ölçek yerinde kalıyor.
     `align-self: start` olmadan ızgara öğesi kolonu doldurur ve `sticky`
     hiçbir şey yapmaz. */
  .ss-eksen {
    grid-column: 1 / 5;
    position: sticky;
    top: calc(var(--sahne-navbar) + 2.5rem);
    align-self: start;
  }
  .ss-h2 {
    max-width: 14ch;
    margin-bottom: clamp(1.5rem, 1rem + 1.5vw, 2.5rem);
  }

  .ss-omurga {
    display: block;
    position: relative;
    /* Ölçek yüksekliği pencereye bağlı ama sınırlı: yapışkan kolon
       navbar'ın altından başlıyor, ekranı taşmamalı. */
    height: min(42vh, 20rem);
    padding-left: 0.125rem;
  }
  .ss-omurga-cizgi {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background: rgb(var(--c-measure));
  }
  /* Çentik: eksenden sağa uzanan kısa kol. Süreç'teki `.sr-centik-kol`
     ile aynı ölçü. */
  .ss-centik {
    position: absolute;
    left: 0;
    top: calc(var(--t) * 100%);
    width: 1.25rem;
    height: 1px;
    background: rgb(var(--c-measure));
  }
  /* İmleç: eksen üzerinde duran kısa BAKIR parça. Varsayılan konumu
     tepesi — hareket desteklenmese de ölçek okunur kalıyor. */
  .ss-imlec {
    position: absolute;
    left: -1px;
    top: 0;
    width: 3px;
    height: 2.5rem;
    background: rgb(var(--c-signal));
  }

  .ss-liste {
    grid-column: 5 / 13;
  }

  .ss-oge {
    position: relative;
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    column-gap: clamp(1rem, 0.5rem + 1.5vw, 2rem);
    align-items: start;
    padding-left: 2.5rem;
  }
  /* Q/A'nın kendi kısa yatay çizgisi — satırı sol eksene bağlıyor.
     Sorunun ilk satırının optik ortasına oturuyor. */
  .ss-oge::before {
    content: '';
    position: absolute;
    left: 0;
    top: calc(1.375rem * 1.3 / 2);
    width: 1.5rem;
    height: 1px;
    background: rgb(var(--c-rule));
  }
  .ss-soru {
    grid-column: 1 / 4;
    max-width: none;
  }
  .ss-cevap {
    /* 4. kolon boş: soru ile cevap arasında gerçek bir aralık var. */
    grid-column: 5 / 9;
    /* Cevabın ilk satırı sorunun ilk satırının optik ortasına hizalanıyor;
       iki farklı punto aynı yatay banda oturuyor. */
    margin-top: calc((1.375rem * 1.3 - 0.9375rem * 1.65) / 2);
  }

  /* ---- İMLECİN HAREKETİ ------------------------------------------------
     `cover 20% → cover 80%`: bölümün pencereden geçişinin ORTA yüzde
     altmışı. `contain` denendi ve elendi — bölüm 1024px, pencere 900px
     olduğu için o aralık yalnız 124px'lik kaydırmaya karşılık geliyordu,
     imleç bir anda aşağı fırlıyordu. `cover` ile aynı yolculuk ~1150px'e
     yayılıyor. */
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .ss {
        view-timeline-name: --ss-hat;
        view-timeline-axis: block;
      }
      .ss-imlec {
        animation-name: ss-imlec-in;
        animation-duration: auto;
        animation-timing-function: linear;
        animation-fill-mode: both;
        animation-timeline: --ss-hat;
        animation-range: cover 20% cover 80%;
      }
      @keyframes ss-imlec-in {
        0%   { transform: translateY(0); }
        100% { transform: translateY(calc(min(42vh, 20rem) - 2.5rem)); }
      }
    }
  }
}
</style>
