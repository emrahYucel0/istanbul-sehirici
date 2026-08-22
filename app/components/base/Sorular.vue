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
 * MONO YOK, BAKIR YOK, HAREKET YOK, BAĞLANTI YOK.
 * Bölüm dönüşüm bölümü değil; kapanış CLOSE/CTA'nın işi.
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
</script>

<template>
  <section class="sr" aria-labelledby="sorular-baslik">
    <div class="sr-alan">
      <h2 id="sorular-baslik" class="sr-h2">{{ sorular.heading }}</h2>

      <dl class="sr-liste">
        <div v-for="s in liste" :key="s.question" class="sr-oge">
          <dt class="sr-soru">{{ s.question }}</dt>
          <dd class="sr-cevap">{{ s.answer }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.sr {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}

.sr-alan {
  max-width: var(--container-wide);
  margin: 0 auto;
  padding: clamp(3.5rem, 2.25rem + 4vw, 6.5rem) clamp(1.25rem, 0.5rem + 3vw, 4rem);
}

.sr-h2 {
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
.sr-liste {
  margin: 0;
  padding: clamp(1.75rem, 1.25rem + 1.6vw, 2.75rem) 0;
  border-top: 1px solid rgb(var(--c-measure));
  border-bottom: 1px solid rgb(var(--c-rule));
  display: grid;
  gap: clamp(2.25rem, 1.75rem + 1.5vw, 3.25rem);
}

.sr-soru {
  font-size: clamp(1.125rem, 1.02rem + 0.45vw, 1.375rem);
  line-height: 1.3;
  letter-spacing: -0.012em;
  font-weight: 600;
  max-width: 30ch;
  text-wrap: balance;
}

.sr-cevap {
  margin: 0.625rem 0 0;
  font-size: clamp(0.875rem, 0.84rem + 0.16vw, 0.9375rem);
  line-height: 1.65;
  color: rgb(var(--c-ink-soft));
  max-width: 52ch;
  text-wrap: pretty;
}

/* ===========================================================================
   MASAÜSTÜ — soru solda blok, cevap sağda; aradaki kolon boş
   ======================================================================== */
@media (min-width: 1024px) {
  .sr-oge {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: clamp(1rem, 0.5rem + 1.5vw, 2rem);
    align-items: start;
  }
  .sr-soru {
    /* Sayfanın içerik kenarından başlıyor (Hizmetler'de 2. kolondaydı). */
    grid-column: 1 / 6;
    max-width: none;
  }
  .sr-cevap {
    /* 6. kolon boş: soru ile cevap arasında gerçek bir aralık var. */
    grid-column: 7 / 13;
    margin-top: 0;
    /* Cevabın ilk satırı sorunun ilk satırının optik ortasına hizalanıyor;
       iki farklı punto aynı yatay banda oturuyor. */
    margin-top: calc((1.375rem * 1.3 - 0.9375rem * 1.65) / 2);
  }
}
</style>
