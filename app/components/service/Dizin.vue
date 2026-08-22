<script setup>
/**
 * HİZMET DİZİNİ — `/hizmetlerimiz` V2 gövdesi.
 *
 * ANA SAYFA SİNEMATİK, İÇ SAYFA EDİTORYAL.
 * Burada pin yok, 300vh sahne yok, signature koreografi yok. Ana sayfanın
 * üç imzası ona özel kalmalı; bu sayfanın işi kullanıcının yedi hizmeti
 * hızla tarayıp doğru detay sayfasına geçmesi.
 *
 * NEDEN KART DEĞİL, KÜTÜK (ledger)
 * Eski sayfa yedi eş kart basıyordu: her kart aynı ağırlıkta, aynı görsel,
 * aynı yükseklik — yani hiçbiri diğerinden ayrışmıyordu ve tarama
 * yapılamıyordu. Kütük düzeninde numara, ad ve operasyonel maddeler ayrı
 * eksenlerde duruyor; göz tek sütunda aşağı inip başlıkları tarıyor,
 * ayrıntıya ancak istediğinde giriyor. Ana sayfadaki Hizmetler kütüğüyle
 * aynı dil, ama burada her satır kendi maddeleriyle açılıyor.
 *
 * VERİ TEK KAYNAKTAN
 * Başlık, alt başlık, özet, maddeler ve slug panelden geliyor
 * (`/api/services`). Metin bileşene gömülmüyor; panelden bir hizmet
 * eklendiğinde burası da, ana sayfa da, detay sayfası da birlikte değişiyor.
 *
 * MADDELER NEDEN 4 İLE SINIRLI
 * `includes` alanında hizmet başına 6 madde var. Altısını da basmak dizini
 * yeniden bir metin duvarına çeviriyordu; dizinin işi ikna değil YÖNLENDİRME.
 * Kalan maddeler detay sayfasında zaten tam listeleniyor.
 */
const props = defineProps({
  hizmetler: { type: Array, default: () => [] },
  giris: { type: String, default: '' },
  /** `InternalPageSection('hizmetler', 'dizin')` — yalnız başlık. */
  bolum: { type: Object, default: () => ({}) },
})

const MADDE_SINIRI = 4

const satirlar = computed(() =>
  props.hizmetler.map((h, i) => ({
    no: String(i + 1).padStart(2, '0'),
    baslik: h.title,
    ustBaslik: h.subtitle || '',
    ozet: (h.excerpt || h.description || '').trim(),
    maddeler: (Array.isArray(h.includes) ? h.includes : []).slice(0, MADDE_SINIRI),
    yol: h.slug ? `/${h.slug}` : null,
  }))
)
</script>

<template>
  <section class="hd-kap" aria-labelledby="hizmet-dizini-baslik">
    <div class="hd sahne-alan">
      <p class="hd-kunye op-kunye">01 / HİZMET DİZİNİ</p>
      <h2 id="hizmet-dizini-baslik" class="hd-h2 tip-anlati">
        {{ bolum.heading }}
      </h2>
      <p v-if="giris" class="hd-giris tip-giris">{{ giris }}</p>

      <ol class="hd-liste">
        <li v-for="s in satirlar" :key="s.baslik" class="hd-satir">
          <p class="hd-no op-kunye">{{ s.no }}</p>

          <div class="hd-govde">
            <h3 class="hd-h3 tip-alt">{{ s.baslik }}</h3>
            <p v-if="s.ustBaslik" class="hd-etiket op-kunye">{{ s.ustBaslik }}</p>
            <p v-if="s.ozet" class="hd-ozet tip-not">{{ s.ozet }}</p>
            <NuxtLink v-if="s.yol" :to="s.yol" class="op-bag op-bag--sakin hd-bag">
              {{ s.baslik }} ayrıntıları
            </NuxtLink>
          </div>

          <!-- Kapsam maddeleri: terim listesi değil, gerçekten yapılan işler.
               `ul` çünkü sıra taşımıyorlar. -->
          <ul v-if="s.maddeler.length" class="hd-maddeler">
            <li v-for="m in s.maddeler" :key="m" class="hd-madde tip-not">{{ m }}</li>
          </ul>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.hd-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}
.hd {
  padding-block: var(--sahne-dikey);
}
.hd-kunye {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.hd-h2 {
  max-width: 18ch;
}
.hd-giris {
  margin: clamp(1rem, 0.85rem + 0.6vw, 1.5rem) 0 0;
  max-width: var(--olcu-govde);
}

.hd-liste {
  list-style: none;
  margin: clamp(2.5rem, 2rem + 2vw, 4rem) 0 0;
  padding: 0;
}
/* Satır ayracı ÜSTTE: son satırdan sonra boşta kalan bir çizgi olmuyor. */
.hd-satir {
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(1.75rem, 1.5rem + 1vw, 2.5rem);
}
.hd-satir:last-child {
  border-bottom: 1px solid rgb(var(--c-rule));
}

.hd-no {
  color: rgb(var(--c-ink-soft));
}
.hd-h3 {
  margin: 0.5rem 0 0;
}
.hd-etiket {
  margin: 0.375rem 0 0;
  letter-spacing: 0.1em;
}
.hd-ozet {
  margin: 0.875rem 0 0;
  max-width: var(--olcu-govde);
}
.hd-bag {
  margin-top: 1rem;
}

.hd-maddeler {
  list-style: none;
  margin: 1.25rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}
/* Madde işareti nokta değil ÖLÇÜ ÇİZGİSİ — sayfanın çizgi diliyle aynı. */
.hd-madde {
  position: relative;
  padding-left: 1.5rem;
  margin: 0;
}
.hd-madde::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.7em;
  width: 0.75rem;
  height: 1px;
  background: rgb(var(--c-measure));
}

/* ===========================================================================
   MASAÜSTÜ — üç eksen: numara (A) · ad ve özet (B) · kapsam (D)
   ======================================================================== */
@media (min-width: 1024px) {
  .hd {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .hd-kunye { grid-column: 1 / 8; }
  .hd-h2 { grid-column: 2 / 8; }
  .hd-giris { grid-column: 9 / 13; align-self: end; margin: 0; }
  .hd-liste { grid-column: 1 / 13; }

  .hd-satir {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }
  .hd-no { grid-column: 1 / 2; padding-top: 0.5rem; }
  .hd-govde { grid-column: 2 / 8; }
  .hd-maddeler { grid-column: 8 / 13; margin-top: 0.5rem; }
  .hd-h3 { margin-top: 0; }
}
</style>
