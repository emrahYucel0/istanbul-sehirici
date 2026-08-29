<script setup>
/**
 * BÖLÜM 04 — KARAR VERMEDEN ÖNCE · fiyat derinliği
 *
 * GÖREV:
 * "Fiyat neden tek bir telefon rakamından ibaret değil?"
 *
 * Beş CMS faktörü tek bir operasyon hesabının girdileri olarak okunur:
 * FAKTÖRLER → PLAN → FİYAT
 *
 * Metin hareket etmez. Hareket yalnız yapısal çizgilerde.
 * Kart, gölge, radius, WebGL, GSAP ve opacity animasyonu yok.
 */

const props = defineProps({
  bolum: { type: Object, required: true },
})

const faktorler = computed(() =>
  (props.bolum.items || []).map((o, i) => ({
    no: String(i + 1).padStart(2, '0'),
    etiket: o.label,
    metin: o.body,
  }))
)
</script>

<template>
  <section class="fy-kap" aria-labelledby="fiyat-baslik">
    <div class="fy sahne-alan">
      <p class="fy-kunye op-kunye">04 / KARAR VERMEDEN ÖNCE</p>

      <div class="fy-ust">
        <h2 id="fiyat-baslik" class="fy-h2 tip-anlati">{{ bolum.heading }}</h2>
        <p class="fy-giris tip-govde">{{ bolum.lead }}</p>
      </div>

      <div class="fy-sistem">
        <dl class="fy-faktorler">
          <div
            v-for="f in faktorler"
            :key="f.etiket"
            class="fy-oge"
          >
            <dt class="fy-etiket">
              <span class="fy-no" aria-hidden="true">{{ f.no }}</span>
              <span>{{ f.etiket }}</span>
            </dt>

            <dd class="fy-metin tip-not">{{ f.metin }}</dd>

            <span class="fy-baglanti" aria-hidden="true"></span>
          </div>

          <span class="fy-bus" aria-hidden="true"></span>
        </dl>

        <div class="fy-sonuc" aria-label="Fiyatın oluşum akışı">
          <span class="fy-sonuc-giris" aria-hidden="true"></span>

          <div class="fy-sonuc-dugum">
            <span class="fy-sonuc-kunye op-kunye">OPERASYON</span>
            <strong class="fy-sonuc-deger">PLAN</strong>
          </div>

          <span class="fy-sonuc-cikis" aria-hidden="true"></span>

          <div class="fy-sonuc-dugum fy-sonuc-dugum--fiyat">
            <span class="fy-sonuc-kunye op-kunye">SONUÇ</span>
            <strong class="fy-sonuc-deger">FİYAT</strong>
          </div>
        </div>
      </div>

      <p class="fy-kapanis tip-govde">
        Yaklaşık bir aralık için
        <NuxtLink to="/fiyat-hesaplama" class="op-bag op-bag--sakin fy-bag">fiyat hesaplama aracını</NuxtLink>
        kullanabilir; taşımanın koşullarını netleştirmek için
        <NuxtLink to="/iletisim" class="op-bag op-bag--sakin fy-bag">iletişime geçebilirsiniz</NuxtLink>.
      </p>
    </div>
  </section>
</template>

<style scoped>
.fy-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}

.fy {
  padding-block: var(--sahne-dikey-dar);
}

.fy-kunye {
  margin-bottom: clamp(1.5rem, 1rem + 1.5vw, 2.5rem);
}

.fy-h2 {
  max-width: 18ch;
}

.fy-giris {
  max-width: 52ch;
  margin: clamp(1rem, 0.85rem + 0.6vw, 1.5rem) 0 0;
}

/* ========================================================================== 
   OPERASYON HESABI — MOBILE / DEFAULT
   ========================================================================== */

.fy-sistem {
  margin-top: clamp(2.75rem, 2rem + 2vw, 4.5rem);
}

.fy-faktorler {
  list-style: none;
  margin: 0;
  padding: 0;
}

.fy-oge {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.5rem;
  padding: 1.25rem 0 1.5rem;
  border-top: 1px solid rgb(var(--c-rule));
}

.fy-oge:last-of-type {
  border-bottom: 1px solid rgb(var(--c-rule));
}

.fy-etiket {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin: 0;
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  color: rgb(var(--c-ink-soft));
}

.fy-no {
  color: rgb(var(--c-signal));
  min-width: 2.25em;
}

.fy-metin {
  margin: 0;
  max-width: 58ch;
}

.fy-baglanti {
  display: block;
  width: min(12rem, 42vw);
  height: 1px;
  margin-top: 0.25rem;
  background: rgb(var(--c-measure));
  transform-origin: left center;
}

.fy-bus {
  display: none;
}

.fy-sonuc {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.9rem;
  margin-top: 2rem;
}

.fy-sonuc-giris {
  display: none;
}

.fy-sonuc-cikis {
  position: relative;
  display: block;
  width: clamp(2.5rem, 12vw, 5rem);
  height: 1px;
  background: rgb(var(--c-signal));
  transform-origin: left center;
}

.fy-sonuc-cikis::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  width: 0.45rem;
  height: 0.45rem;
  border-top: 1px solid rgb(var(--c-signal));
  border-right: 1px solid rgb(var(--c-signal));
  transform: translateY(-50%) rotate(45deg);
  transform-origin: center;
}

.fy-sonuc-dugum {
  min-width: 0;
}

.fy-sonuc-dugum--fiyat {
  text-align: right;
}

.fy-sonuc-kunye {
  display: block;
  margin: 0 0 0.35rem;
  color: rgb(var(--c-ink-soft));
}

.fy-sonuc-deger {
  display: block;
  margin: 0;
  font-family: var(--f-mono);
  font-size: clamp(1.25rem, 1rem + 1vw, 2rem);
  font-weight: 500;
  letter-spacing: 0.06em;
  line-height: 1;
}

.fy-kapanis {
  margin: clamp(2.75rem, 2rem + 2vw, 4.5rem) 0 0;
  max-width: 58ch;
}

.fy-bag {
  min-height: 0;
  font-size: inherit;
  font-weight: 600;
  padding-bottom: 0.05em;
}

/* ========================================================================== 
   DESKTOP — 5 GİRDİ → TOPLAYICI → PLAN → FİYAT
   ========================================================================== */

@media (min-width: 1024px) {
  .fy {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    row-gap: 0;
  }

  .fy-kunye {
    grid-column: 1 / 13;
  }

  .fy-ust {
    grid-column: 1 / 13;
    display: contents;
  }

  .fy-h2 {
    grid-column: 1 / 6;
  }

  .fy-giris {
    grid-column: 7 / 12;
    margin-top: 0.5rem;
    max-width: none;
  }

  .fy-sistem {
    grid-column: 1 / 13;
    display: grid;
    grid-template-columns: minmax(0, 8fr) minmax(18rem, 4fr);
    column-gap: clamp(4.5rem, 4vw + 2rem, 7.5rem);
    align-items: stretch;
    position: relative;
  }

  .fy-faktorler {
    position: relative;
    display: grid;
    grid-template-rows: repeat(5, minmax(5.25rem, auto));
  }

  .fy-oge {
    position: relative;
    grid-template-columns: minmax(10rem, 0.8fr) minmax(0, 1.65fr);
    column-gap: clamp(1.5rem, 1rem + 1.5vw, 2.75rem);
    align-items: center;
    padding: 1rem 0;
    border-top: 1px solid rgb(var(--c-rule));
  }

  .fy-oge:last-of-type {
    border-bottom: 1px solid rgb(var(--c-rule));
  }

  .fy-etiket {
    align-self: center;
  }

  .fy-metin {
    margin: 0;
    max-width: 46ch;
  }

  .fy-baglanti {
    position: absolute;
    left: 100%;
    top: 50%;
    width: calc(clamp(4.5rem, 4vw + 2rem, 7.5rem) / 2);
    margin: 0;
    background: rgb(var(--c-measure));
    transform-origin: left center;
  }

  .fy-bus {
    display: block;
    position: absolute;
    top: calc(10% + 0.5rem);
    right: calc(clamp(4.5rem, 4vw + 2rem, 7.5rem) / -2);
    bottom: calc(10% + 0.5rem);
    width: 1px;
    background: rgb(var(--c-measure));
    transform-origin: center top;
  }

  .fy-sonuc {
    margin: 0;
    display: grid;
    grid-template-columns: max-content minmax(5rem, 1fr) max-content;
    grid-template-rows: 1fr;
    column-gap: clamp(0.75rem, 0.35rem + 0.7vw, 1.25rem);
    align-items: center;
    position: relative;
  }

  .fy-sonuc-giris {
    display: block;
    position: absolute;
    left: calc(clamp(4.5rem, 4vw + 2rem, 7.5rem) / -2);
    top: 50%;
    width: calc(clamp(4.5rem, 4vw + 2rem, 7.5rem) / 2);
    height: 1px;
    background: rgb(var(--c-signal));
    transform-origin: left center;
  }

  .fy-sonuc-dugum {
    grid-column: 1;
    grid-row: 1;
    justify-self: start;
    align-self: center;
    position: relative;
  }

  .fy-sonuc-dugum--fiyat {
    grid-column: 3;
    grid-row: 1;
    align-self: center;
    justify-self: end;
    text-align: right;
    margin-top: 0;
    transform: translateY(0.4rem);
  }

  .fy-sonuc-cikis {
    grid-column: 2;
    grid-row: 1;
    justify-self: stretch;
    align-self: center;
    width: 100%;
    min-width: 5rem;
    margin: 0;
    background: rgb(var(--c-signal));
    transform-origin: left center;
  }

  .fy-sonuc-deger {
    font-size: clamp(1.75rem, 1.2rem + 1.5vw, 3rem);
  }

  .fy-kapanis {
    grid-column: 7 / 13;
  }
}

/* ========================================================================== 
   HAREKET — YALNIZ YAPISAL ÇİZGİLER
   ========================================================================== */

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .fy-sistem {
      view-timeline-name: --fy-sistem;
      view-timeline-axis: block;
    }

    .fy-baglanti,
    .fy-bus,
    .fy-sonuc-giris,
    .fy-sonuc-cikis {
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --fy-sistem;
    }

    .fy-baglanti {
      animation-name: fy-baglanti;
      animation-range: entry 70% cover 20%;
    }

    .fy-bus {
      animation-name: fy-bus;
      animation-range: entry 60% cover 30%;
    }

    .fy-sonuc-giris {
      animation-name: fy-yatay;
      animation-range: entry 50% cover 40%;
    }

    .fy-sonuc-cikis {
      animation-name: fy-yatay;
      animation-range: entry 48% cover 58%;
    }

    @keyframes fy-baglanti {
      0% { transform: scaleX(0); }
      100% { transform: scaleX(1); }
    }

    @keyframes fy-bus {
      0% { transform: scaleY(0); }
      100% { transform: scaleY(1); }
    }

    @keyframes fy-yatay {
      0% { transform: scaleX(0); }
      100% { transform: scaleX(1); }
    }
  }
}

@media (max-width: 1023px) {
  .fy-baglanti,
  .fy-sonuc-cikis {
    transform: none;
  }
}
</style>
