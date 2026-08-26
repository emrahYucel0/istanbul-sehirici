<script setup>
/**
 * YORUMLAR — üçüncü ve son `ledger`, ama ikisinin de kopyası değil.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NEDEN VAR VE NEDEN BURADA
 *
 * Ana sayfada yorum bölümü YOKTU; yorum formu yalnız V1'in `Testimonial`
 * bileşeninin içindeydi ve o bileşen hiçbir herkese açık sayfada render
 * edilmiyordu. Yani ziyaretçinin yorum gönderebileceği bir yer aslında
 * hiç yoktu: kayıt tablosu, moderasyon paneli ve API vardı, giriş kapısı
 * yoktu. Bu bölüm o kapı.
 *
 * KONUM: Sorular → YORUMLAR → Kapanış.
 * Sorular ziyaretçinin kendi sorularını bitiriyor; kapanış eylemi
 * istiyor. Başka insanların deneyimi tam ikisinin arasına düşüyor —
 * karardan hemen önce, eylemden hemen önce. Yeni bir kök adres
 * (`/yorumlar`) AÇILMADI: adres alanını büyütmeden ana sayfada bir bölüm
 * yeterli.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * İKİ DEFTERDEN AYRIMLAR (üçü de kasıtlı)
 *
 *   1. NUMARA YOK — Hizmetler'deki asılı rakam dili orada bilgi taşıyordu
 *      (yedi hizmetin sırası); burada yorumların sırası bir bilgi değil.
 *   2. AÇAN ÇİZGİ TEK — Sorular kümeyi iki çizgiyle kapatıyordu. Burada
 *      küme kapanmıyor: altına form geliyor ve form da defterin devamı.
 *   3. KOLON ORANI FARKLI — künye solda dar (1-4), metin sağda (5-13).
 *      Sorular'da soru 1-6 / cevap 7-13 idi.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * SAHTE YEDEK YOK — bu bölümün en önemli kuralı
 *
 * Onaylı yorum yoksa uydurma bir yorum, "5.0 / yüzlerce müşteri" gibi bir
 * özet ya da örnek bir isim GÖSTERİLMİYOR. Liste boş kalıyor, tek bir
 * dürüst cümle yazılıyor ve form yine erişilebilir duruyor. Ortalama ve
 * adet de yalnız gerçek onaylı kayıtlardan geliyor; ikisi de veri
 * tabanında ikinci kez saklanmıyor.
 *
 * ÖZET SATIRI KOŞULLU: `adet` 0 ise hiç basılmıyor. Tek yorumda "5,0
 * ortalama" yazmak istatistiksel olarak boş bir cümle olurdu; bu yüzden
 * ortalama yalnız ÜÇ ve üzeri yorumda görünüyor. Sayı her zaman görünüyor
 * çünkü sayı bir iddia değil, olduğu gibi bir olgu.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PUAN YAPISAL VERİYE DÖNMÜYOR
 *
 * Ekrandaki ortalama, arama sonucundaki yıldız işaretlemesine
 * (Review/AggregateRating) BAĞLANMIYOR. Gerekçe app/pages/index.vue
 * başlığında: kendi yorumlarını kendi kontrol eden işletme sitesi
 * Google'ın review snippet kurallarına göre buna uygun değil.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * DÜZ METİN — `v-html` YOK
 *
 * Yorum ziyaretçiden geliyor; HTML değil, metindir. `{{ }}` ile basılıyor,
 * yani Vue kaçış yapıyor. Sunucuda ikinci bir katman daha var (açılı
 * parantezler eleniyor, bkz. reviews.service → temizMetin). İki katman da
 * duruyor: biri kaldırılırsa diğeri hâlâ tutar.
 */
const props = defineProps({
  /** `HomeSection('yorumlar')` — yalnız editoryal metin. */
  bolum: { type: Object, required: true },
  /** Onaylı yorumlar + türetilmiş özet. */
  yorumlar: { type: Object, required: true },
})

const liste = computed(() => props.yorumlar.items || [])
const adet = computed(() => props.yorumlar.adet || 0)

/** Ortalama yalnız anlamlı olduğu örneklemde görünüyor. */
const ORTALAMA_ESIGI = 3
const ortalama = computed(() =>
  adet.value >= ORTALAMA_ESIGI && props.yorumlar.ortalama ? props.yorumlar.ortalama : null
)

/** "4,8" — Türkçe ondalık ayracı. Yuvarlama sunucuda yapıldı. */
const ortalamaMetni = computed(() =>
  ortalama.value === null ? '' : String(ortalama.value).replace('.', ',')
)

const tarihMetni = (iso) => {
  const t = new Date(iso)
  if (Number.isNaN(t.getTime())) return ''
  return t.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
}
</script>

<template>
  <section class="yr" aria-labelledby="yorumlar-baslik">
    <div class="yr-alan">
      <h2 id="yorumlar-baslik" class="yr-h2">{{ bolum.heading }}</h2>
      <p v-if="bolum.lead" class="yr-giris">{{ bolum.lead }}</p>

      <!-- Özet: türetilmiş, saklanmıyor. Yorum yoksa hiç basılmıyor. -->
      <p v-if="adet" class="yr-ozet">
        <span v-if="ortalamaMetni" class="yr-ozet-parca">
          <span class="sr-only">Ortalama puan </span>{{ ortalamaMetni }} / 5
        </span>
        <span class="yr-ozet-parca">{{ adet }} yayınlanmış yorum</span>
      </p>

      <ul v-if="liste.length" class="yr-liste">
        <li v-for="y in liste" :key="y.id" class="yr-satir">
          <p class="yr-kunye">
            <span class="yr-ad">{{ y.ad }}</span>
            <span class="yr-puan"><span class="sr-only">Puanı </span>{{ y.puan }} / 5</span>
            <span class="yr-tarih">{{ tarihMetni(y.tarih) }}</span>
          </p>
          <!-- Ziyaretçi metni: DÜZ METİN. `v-html` kullanılmıyor. -->
          <p class="yr-metin">{{ y.metin }}</p>
        </li>
      </ul>

      <!-- Boş durum: sahte yorum yerine tek dürüst cümle. -->
      <p v-else class="yr-bos">Bu bölümde henüz yayınlanmış yorum yok.</p>

      <base-review-form :davet="bolum.note || 'Deneyiminizi yazın'" />
    </div>
  </section>
</template>

<style scoped>
.yr {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}

/* Perde 04'ün üçüncü bloğu; alt dikişi Kapanış'ın geniş payı taşıyor.
   (bkz. assets/css/sahne.css) */
.yr-alan {
  max-width: var(--container-wide);
  margin: 0 auto;
  padding: var(--sahne-dikey) var(--sahne-pad) var(--sahne-dikey-dar);
}

.yr-h2 {
  font-size: clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
  font-weight: 700;
  margin: 0;
  max-width: 24ch;
  text-wrap: balance;
}

.yr-giris {
  margin: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem) 0 0;
  font-size: clamp(0.9375rem, 0.9rem + 0.2vw, 1.0625rem);
  line-height: 1.6;
  color: rgb(var(--c-ink-soft));
  max-width: 52ch;
  text-wrap: pretty;
}

/* Özet künye dilinde: gerçek teknik veri, dekoratif etiket değil. */
.yr-ozet {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin: clamp(1.5rem, 1.25rem + 1vw, 2.25rem) 0 0;
  font-family: var(--f-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--c-ink-soft));
}

.yr-ozet-parca + .yr-ozet-parca::before {
  content: "·";
  margin-right: 1.25rem;
  color: rgb(var(--c-measure));
}

/* TEK AÇAN ÇİZGİ — küme kapanmıyor, altında form var. */
.yr-liste {
  list-style: none;
  margin: clamp(1.75rem, 1.25rem + 1.6vw, 2.75rem) 0 0;
  padding: 0;
  border-top: 1px solid rgb(var(--c-measure));
}

.yr-satir {
  border-bottom: 1px solid rgb(var(--c-rule));
  padding: clamp(1.5rem, 1.15rem + 1.2vw, 2.25rem) 0;
}

/* SON SATIRIN ALT ÇİZGİSİ YOK — İKİ ÇİZGİ ÜST ÜSTE GELİYORDU.
   Ekran görüntüsünde ölçüldü: listeyi kapatan çizginin hemen altında
   formu açan çizgi vardı, yani birkaç piksel arayla iki paralel kural.
   Bölümün kendi kuralı "küme kapanmıyor, altında form var" diyor; ayıraç
   tek olmalı ve o ayıracı form açıyor. */
.yr-satir:last-child {
  border-bottom: 0;
}

.yr-kunye {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.375rem 1rem;
  margin: 0;
}

.yr-ad {
  font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: -0.012em;
}

.yr-puan,
.yr-tarih {
  font-family: var(--f-mono);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: rgb(var(--c-ink-soft));
}

.yr-tarih {
  text-transform: uppercase;
  color: rgb(var(--c-measure));
}

.yr-metin {
  margin: 0.75rem 0 0;
  font-size: clamp(0.9375rem, 0.9rem + 0.16vw, 1rem);
  line-height: 1.65;
  color: rgb(var(--c-ink-soft));
  max-width: 60ch;
  text-wrap: pretty;
  /* Ziyaretçi satır sonu bırakmışsa korunuyor; sunucu zaten ardışık
     boşlukları tekliyor, yani düzen bozulmuyor. */
  white-space: pre-line;
}

.yr-bos {
  margin: clamp(1.75rem, 1.25rem + 1.6vw, 2.75rem) 0 0;
  padding-top: clamp(1.5rem, 1.15rem + 1.2vw, 2.25rem);
  border-top: 1px solid rgb(var(--c-measure));
  font-size: 0.9375rem;
  line-height: 1.65;
  color: rgb(var(--c-ink-soft));
}

/* ===========================================================================
   MASAÜSTÜ — künye solda dar sütun, metin sağda
   ======================================================================== */
@media (min-width: 1024px) {
  .yr-satir {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: clamp(1rem, 0.5rem + 1.5vw, 2rem);
    align-items: start;
  }
  .yr-kunye {
    grid-column: 1 / 5;
    /* Künye alt alta: dar sütunda tek satır olamaz. */
    flex-direction: column;
    gap: 0.25rem;
  }
  .yr-metin {
    grid-column: 5 / 13;
    margin-top: 0;
    max-width: none;
  }
}
</style>
