<script setup>
/**
 * 01B / HESAPLAMA ÖZETİ — yalnız fiyat hesaplayıcıdan gelindiğinde.
 *
 * ─────────────────────────────────────────────────────────────────────
 * NE İŞE YARIYOR
 *
 * Kullanıcı /fiyat-hesaplama'da sekiz alanla taşımasını yapılandırdı ve
 * buraya geldi. Bu blok "seni hatırlıyorum" diyor: hangi seçimlerle
 * gelindiğini gösteriyor ve aynı seçimler aşağıdaki mesaj kutusuna da
 * hazır yazılmış oluyor. Kullanıcı aynı işi ikinci kez anlatmıyor.
 *
 * ─────────────────────────────────────────────────────────────────────
 * YENİ HERO DEĞİL, KART DEĞİL
 *
 * Kutu, gölge, yarıçap, cam, gradyan, rozet yığını ve gösterge paneli
 * görünümü YOK. Tek yapısal araç sitenin ölçü çizgisi; mono katmanı
 * yalnız gerçek metadata'da (etiketler ve tutar). Zemin çukur kâğıt —
 * formdan önce gelen bir ARA yüzey olduğu belli olsun diye.
 *
 * ─────────────────────────────────────────────────────────────────────
 * TUTAR EKRANDA, ADRESTE DEĞİL
 *
 * Aralık adres satırından OKUNMUYOR; doğrulanmış girdilerden ve panelin
 * kendi katsayılarından sunucuda yeniden hesaplanıyor
 * (bkz. utils/fiyat-devri.ts → `fiyatDevriniCoz`). Katsayı okunamazsa
 * rakam hiç basılmıyor — yapılandırma yine görünüyor.
 *
 * Kimlik (id) kullanıcıya GÖSTERİLMİYOR; "true/false" de yazılmıyor.
 * Etiketler panelin kendi metinleri, kat cümlesi doğal Türkçe.
 *
 * ODAK ÇALINMIYOR: otomatik odak yok, otomatik kaydırma yok.
 */
import { tlYaz } from '~/utils/fiyat'
import { katCumlesi, ekHizmetler } from '~/utils/fiyat-devri'

const props = defineProps({
  /** `fiyatDevriniCoz` çıktısı — geçersiz devirde bu bileşen basılmıyor. */
  cozum: { type: Object, required: true },
  /**
   * Sonucun altındaki uyarı. Panelden geliyor; hesaplayıcıdaki cümlenin
   * AYNISI, çünkü kaynak da aynı (`PriceEstimator.note`). İkinci kez
   * yazılmıyor.
   */
  uyari: { type: String, default: '' },
})

/** Ekrana basılan kütük — kimlik değil, panelin kendi etiketleri. */
const satirlar = computed(() => {
  const g = props.cozum.girdi
  const liste = [
    { etiket: 'EV', deger: props.cozum.odaAdi },
    { etiket: 'MESAFE', deger: props.cozum.mesafeAdi },
    { etiket: 'ÇIKIŞ', deger: katCumlesi(g.cikisKat, g.cikisAsansor) },
    { etiket: 'VARIŞ', deger: katCumlesi(g.varisKat, g.varisAsansor) },
  ]
  const ek = ekHizmetler(g)
  if (ek.length) liste.push({ etiket: 'EK HİZMET', deger: ek.join(' · ') })
  return liste
})
</script>

<template>
  <section class="oz-kap" aria-labelledby="hesap-ozeti-baslik">
    <div class="oz sahne-alan">
      <p class="oz-kunye op-kunye">FİYAT HESAPLAMA SAYFASINDAN</p>

      <!-- H2: sayfanın tek H1'i girişte, bu blok onun altında bir bölüm. -->
      <h2 id="hesap-ozeti-baslik" class="oz-h2 tip-alt">Hesaplama özeti</h2>

      <div class="oz-govde">
        <!-- Terim/değer ilişkisi olduğu için `dl`. -->
        <dl class="oz-kutuk">
          <div v-for="s in satirlar" :key="s.etiket" class="oz-satir">
            <dt class="oz-etiket op-kunye">{{ s.etiket }}</dt>
            <dd class="oz-deger">{{ s.deger }}</dd>
          </div>
        </dl>

        <div class="oz-tutar-alan">
          <p class="oz-tutar-etiket op-kunye">TAHMİNİ ARALIK</p>
          <!-- CANLI BÖLGE DEĞİL: bu sayfada hesap değişmiyor, değer
               sayfayla birlikte geliyor. Hesaplayıcıdaki `<output>` orada
               kalıyor; burada ikinci bir canlı bölge açılmıyor.
               Tutar ile uyarı `aria-describedby` ile bağlı. -->
          <p v-if="cozum.aralik" class="oz-tutar" aria-describedby="oz-uyari">
            {{ tlYaz(cozum.aralik.alt) }} – {{ tlYaz(cozum.aralik.ust) }}
            <span class="oz-birim">TL</span>
          </p>
          <p v-if="uyari" id="oz-uyari" class="oz-uyari tip-not">{{ uyari }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.oz-kap {
  background: rgb(var(--c-paper-sunken));
  color: rgb(var(--c-ink));
  border-top: 1px solid rgb(var(--c-rule));
}
/* Dar dikey ritim: bu blok kendi başına bir sahne değil, formun önsözü. */
.oz {
  padding-block: var(--sahne-dikey-dar);
}
.oz-kunye {
  margin-bottom: clamp(0.5rem, 0.4rem + 0.4vw, 0.875rem);
}
.oz-h2 {
  margin: 0;
}
.oz-govde {
  margin-top: clamp(1.25rem, 1rem + 0.8vw, 1.75rem);
  display: grid;
  gap: clamp(1.25rem, 1rem + 0.8vw, 1.75rem);
  max-width: 30rem;
}

/* ---- Kütük -------------------------------------------------------------- */
.oz-kutuk {
  margin: 0;
  padding-top: clamp(0.75rem, 0.6rem + 0.4vw, 1rem);
  /* Bilgi taşıyan çizgi — dekoratif ton değil (bkz. tokens.css). */
  border-top: 1px solid rgb(var(--c-measure));
}
.oz-satir {
  display: grid;
  grid-template-columns: minmax(6.5rem, auto) 1fr;
  gap: 0.5rem 1rem;
  align-items: baseline;
  padding-block: clamp(0.4rem, 0.35rem + 0.2vw, 0.55rem);
}
.oz-satir + .oz-satir {
  border-top: 1px solid rgb(var(--c-rule));
}
.oz-etiket {
  /* `--c-measure` DEĞİL: kâğıt üzerinde 3,5:1 ve METİN için AA'yı
     geçmiyor (aynı gerekçe: Kapsam.vue, Hesaplayici.vue). */
  color: rgb(var(--c-ink-soft));
}
.oz-deger {
  margin: 0;
  font-size: clamp(0.9375rem, 0.9rem + 0.25vw, 1.0625rem);
  line-height: 1.5;
  color: rgb(var(--c-ink));
}

/* ---- Tutar -------------------------------------------------------------- */
.oz-tutar-etiket {
  margin: 0;
}
/* Hesaplayıcının sonucuyla aynı dil — ama bir kademe küçük: burada tutar
   sayfanın kahramanı değil, gelinen yerin kaydı. */
.oz-tutar {
  margin: 0.375rem 0 0;
  font-family: var(--f-mono);
  font-variant-numeric: tabular-nums;
  font-size: clamp(1.375rem, 1.1rem + 1.2vw, 2rem);
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: rgb(var(--c-ink));
}
.oz-birim {
  font-size: 0.5em;
  letter-spacing: 0.12em;
  color: rgb(var(--c-ink-soft));
}
.oz-uyari {
  margin: clamp(0.625rem, 0.5rem + 0.4vw, 0.875rem) 0 0;
  max-width: var(--olcu-govde);
}

@media (min-width: 1024px) {
  .oz {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .oz-kunye {
    grid-column: 1 / 13;
    grid-row: 1;
  }
  .oz-h2 {
    grid-column: 2 / 8;
    grid-row: 2;
  }
  .oz-govde {
    grid-column: 2 / 8;
    grid-row: 3;
    max-width: none;
  }
}
</style>
