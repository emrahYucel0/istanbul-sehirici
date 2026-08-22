<script setup>
/**
 * 03 / DİĞER YOLLAR — sayfanın kapanışı.
 *
 * ESKİ `base-final-cta` BURADAN ÇIKARILDI. O bileşen koyu bir bant üzerine
 * "Taşınma gününüzü bugünden planlayalım" başlığı ve bir "Bize ulaşın"
 * çağrısı basıyordu — ZATEN iletişim sayfasındayken ikinci kez iletişime
 * çağırıyordu. Bileşen SİLİNMEDİ, diğer sayfalar kullanmaya devam ediyor.
 *
 * Yerine geçen bu bölüm çağrı yapmıyor, YÖNLENDİRİYOR: buraya gelip
 * "henüz yazacak kadar netleşmedim" diyen kullanıcının gidebileceği üç yer.
 *
 * 39 İLÇE DÖKÜLMÜYOR: bölge dizini kendi sayfasında.
 */
const YOLLAR = [
  {
    yol: '/fiyat-hesaplama',
    ad: 'Fiyat hesaplama',
    metin: 'Eşya listesi üzerinden kaba bir aralık görmek için.',
  },
  {
    yol: '/hizmetlerimiz',
    ad: 'Nakliyat hizmetleri',
    metin: 'Hangi hizmetin kapsamına girdiğinizden emin değilseniz.',
  },
  {
    yol: '/bolgelerimiz',
    ad: 'Hizmet bölgelerimiz',
    metin: 'İlçenizde ne tür bir yapı dokusuyla çalıştığımızı okumak için.',
  },
]
</script>

<template>
  <section class="iy-kap" aria-labelledby="yollar-baslik">
    <div class="iy sahne-alan">
      <p class="iy-kunye op-kunye">03 / DİĞER YOLLAR</p>

      <h2 id="yollar-baslik" class="iy-h2 tip-anlati">Henüz yazmaya hazır değilseniz</h2>

      <ol class="iy-liste">
        <li v-for="(y, i) in YOLLAR" :key="y.yol" class="iy-oge">
          <p class="iy-no op-kunye">{{ String(i + 1).padStart(2, '0') }}</p>
          <div class="iy-govde">
            <p class="iy-ad tip-alt">
              <NuxtLink :to="y.yol" class="iy-bag">{{ y.ad }}</NuxtLink>
            </p>
            <p class="iy-metin tip-not">{{ y.metin }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.iy-kap {
  background: rgb(var(--c-paper-sunken));
  color: rgb(var(--c-ink));
  border-top: 1px solid rgb(var(--c-rule));
}
.iy {
  padding-block: var(--sahne-dikey);
}
.iy-kunye {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.iy-h2 {
  max-width: 20ch;
}

.iy-liste {
  list-style: none;
  margin: clamp(1.75rem, 1.5rem + 1vw, 2.75rem) 0 0;
  padding: 0;
  /* Alt çizgi kapsayıcıda: ızgara boşlukları çizgiyi bölmesin. */
  border-bottom: 1px solid rgb(var(--c-rule));
}
.iy-oge {
  position: relative;
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  gap: 0 clamp(0.75rem, 0.5rem + 1vw, 1.5rem);
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem);
}
/* `--c-measure` metin olarak kullanılmıyor (kâğıtta 3,51:1, AA eşiği 4,5:1);
   numara bir metin, `--c-ink-soft` ile 6,34:1. */
.iy-no {
  margin: 0;
  color: rgb(var(--c-ink-soft));
  font-variant-numeric: tabular-nums;
}
.iy-govde {
  min-width: 0;
}
.iy-ad {
  margin: 0;
}
.iy-bag {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.iy-bag:hover {
  border-bottom-color: rgb(var(--c-signal));
}
.iy-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}
/* Dokunma hedefi satırın tamamı: yalnız metin tıklanabilir olsaydı hedef
   ~170×24 px kalırdı. (Aynı düzeltme region/IlceDizini.vue'da ölçülmüştü.) */
.iy-bag::after {
  content: '';
  position: absolute;
  inset: 0;
}
.iy-metin {
  margin: 0.25rem 0 0;
  max-width: var(--olcu-govde);
}

@media (min-width: 1024px) {
  .iy {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .iy-kunye {
    grid-column: 1 / 8;
  }
  .iy-h2 {
    grid-column: 2 / 7;
  }
  .iy-liste {
    grid-column: 8 / 13;
    grid-row: 2 / 4;
    margin-top: 0;
  }
}
</style>
