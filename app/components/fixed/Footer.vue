<script setup>

/**

 * SITE REGISTER — GLOBAL FOOTER

 * --------------------------------------------------------------------------

 * Footer satış bölümü değildir.

 * Final Signal dönüşümü yaptı; burası sitenin resmi kayıt katmanı:

 *

 *   KİMLİK

 *   İLETİŞİM

 *   NAVİGASYON

 *   SOSYAL

 *   YASAL / TELİF

 *

 * Kapanış koyu; footer tekrar KÂĞIT yüzeye döner.

 * Bu renk değişimi anlatının bittiğini ve utility katmanının başladığını

 * fiziksel olarak gösterir.

 *

 * Korunan veri sözleşmeleri:

 * - useSiteSettings()

 * - brandName

 * - footerText

 * - address

 * - workingHours

 * - phone / mobilePhone

 * - email

 * - whatsAppNumber

 * - social URLs

 * - useRegionPages()

 * - gerçek birincil rotalar

 *

 * Kart / panel / accordion / CTA banner yok.

 * Ek JS / GSAP yok.

 */

const { settings, brandName } = await useSiteSettings()

const isletmeTanimi = computed(() =>

  settings.value?.footerText?.trim() || '',

)

const adres = computed(() =>

  settings.value?.address?.trim() || '',

)

const eposta = computed(() =>

  settings.value?.email?.trim() || '',

)

const telefon = computed(() =>

  settings.value?.phone?.trim() ||

  settings.value?.mobilePhone?.trim() ||

  '',

)

const telHref = computed(() => telefonYolu(telefon.value))

const whatsApp = computed(() => {

  const ham = (settings.value?.whatsAppNumber || '').trim()

  if (!ham) return ''

  if (/^https?:\/\//i.test(ham)) return ham

  const rakam = ham.replace(/\D/g, '')

  return rakam ? `https://wa.me/${rakam}` : ''

})

const saatler = computed(() =>

  (settings.value?.workingHours || '')

    .split('/')

    .map((s) => s.replace(/\s+/g, ' ').trim())

    .filter(Boolean),

)

const gezinme = [

  { ad: 'Hizmetler', yol: '/hizmetlerimiz' },

  ...(useRegionPages()

    ? [{ ad: 'Bölgeler', yol: '/bolgelerimiz' }]

    : []),

  { ad: 'Fiyat hesaplama', yol: '/fiyat-hesaplama' },

  { ad: 'Hakkımızda', yol: '/hakkimizda' },

  { ad: 'İletişim', yol: '/iletisim' },

]

const yasal = [

  { ad: 'Gizlilik Politikası', yol: '/gizlilik-politikasi' },

  { ad: 'Kullanım Şartları', yol: '/kullanim-sartlari' },

  { ad: 'Çerez Politikası', yol: '/cerez-politikasi' },

]

const sosyal = computed(() =>

  [

    { ad: 'Instagram', url: settings.value?.instagramUrl },

    { ad: 'Facebook', url: settings.value?.facebookUrl },

    { ad: 'YouTube', url: settings.value?.youtubeUrl },

    { ad: 'LinkedIn', url: settings.value?.linkedinUrl },

  ].filter((s) => (s.url || '').trim()),

)

const yil = new Date().getFullYear()

</script>

<template>

  <footer class="fr">

    <div class="fr-alan">
<!-- ================================================================

           BRAND / IDENTITY

           ================================================================ -->

      <section class="fr-kimlik" aria-label="İşletme bilgileri">

        <!-- Marka adı kelimelere bölünüp basılıyor: "Kent" bakır renkte.
             Bölmeyi `markaParcalari` yapıyor (app/utils/marka-vurgusu.ts);
             ad yine panelden geliyor, burada sabitlenmiyor. Ayırıcı boşluk
             parçanın metnine dahil — Vue, etiketler arasındaki satır sonlu
             boşluğu derlemede siliyor. -->
        <p class="fr-marka">

          <span
            v-for="(parca, i) in markaParcalari(brandName)"
            :key="i"
            :class="parca.vurgulu ? 'fr-marka-kent' : null"
          >{{ parca.metin }}</span>

        </p>

        <p

          v-if="isletmeTanimi"

          class="fr-tanim"

        >

          {{ isletmeTanimi }}

        </p>

        <address class="fr-adres">

          <span v-if="adres">

            {{ adres }}

          </span>

          <span

            v-for="s in saatler"

            :key="s"

            class="fr-saat"

          >

            {{ s }}

          </span>

        </address>

      </section>

      <!-- ================================================================

           CONTACT RAIL

           ================================================================ -->

      <section

        class="fr-iletisim"

        aria-label="İletişim kanalları"

      >

        <span class="fr-bolum-no" aria-hidden="true">

          01

        </span>

        <div class="fr-iletisim-icerik">

          <a

            v-if="telefon"

            :href="telHref"

            class="fr-tel"

          >
<span class="fr-link-main">{{ telefon }}</span>

            <span class="fr-link-arrow" aria-hidden="true">→</span>

          </a>

          <a

            v-if="whatsApp"

            :href="whatsApp"

            target="_blank"

            rel="noopener"

            class="fr-bag"

          >
<span class="fr-link-main">WhatsApp</span>

            <span class="fr-link-arrow" aria-hidden="true">↗</span>

          </a>

          <a

            v-if="eposta"

            :href="`mailto:${eposta}`"

            class="fr-bag"

          >
<span class="fr-link-main">{{ eposta }}</span>

            <span class="fr-link-arrow" aria-hidden="true">↗</span>

          </a>

        </div>

      </section>

      <!-- ================================================================

           PRIMARY NAV / RUNNING INDEX

           ================================================================ -->

      <nav

        class="fr-gezinme"

        aria-label="Alt bilgi bağlantıları"

      >

        <span class="fr-bolum-no" aria-hidden="true">

          02

        </span>

        <div class="fr-nav-list">

          <NuxtLink

            v-for="(g, i) in gezinme"

            :key="g.yol"

            :to="g.yol"

            class="fr-nav-link"

          >

            <span class="fr-nav-no" aria-hidden="true">

              {{ String(i + 1).padStart(2, '0') }}

            </span>

            <span class="fr-nav-label">

              {{ g.ad }}

            </span>

            <span class="fr-nav-arrow" aria-hidden="true">

              ↗

            </span>

          </NuxtLink>

        </div>

      </nav>

      <!-- ================================================================

           SOCIAL

           ================================================================ -->

      <nav

        v-if="sosyal.length"

        class="fr-sosyal"

        aria-label="Sosyal medya"

      >

        <span class="fr-bolum-no" aria-hidden="true">

          03

        </span>

        <div class="fr-sosyal-list">

          <a

            v-for="s in sosyal"

            :key="s.ad"

            :href="s.url"

            target="_blank"

            rel="noopener"

            class="fr-sosyal-link"

          >

            <span>{{ s.ad }}</span>

            <span aria-hidden="true">↗</span>

          </a>

        </div>

      </nav>

      <!-- ================================================================

           META / LEGAL

           ================================================================ -->

      <div class="fr-meta">

        <p class="fr-telif">

          © {{ yil }} {{ brandName }}

        </p>

        <nav

          class="fr-yasal"

          aria-label="Yasal bilgiler"

        >

          <NuxtLink

            v-for="y in yasal"

            :key="y.yol"

            :to="y.yol"

            class="fr-yasal-link"

          >

            {{ y.ad }}

          </NuxtLink>

        </nav>
</div>

    </div>

  </footer>

</template>

<style scoped>

/* ==========================================================================

   SITE REGISTER

   ======================================================================= */

.fr {

  --fr-paper: rgb(var(--c-paper));

  --fr-paper-2: rgb(var(--c-paper-sunken));

  --fr-ink: rgb(var(--c-ink));

  --fr-soft: rgb(var(--c-ink-soft));

  --fr-rule: rgb(var(--c-rule));

  --fr-measure: rgb(var(--c-measure));

  --fr-signal: rgb(var(--c-signal));

  position: relative;

  overflow: clip;

  background: var(--fr-paper);

  color: var(--fr-ink);

  border-top:

    1px solid var(--fr-measure);

}

.fr-alan {

  max-width: var(--container-wide);

  margin: 0 auto;

  padding:

    clamp(2.8rem, 6vw, 5rem)

    var(--sahne-pad)

    clamp(1.6rem, 3vw, 2.6rem);

  display: grid;

  gap:

    clamp(2.2rem, 5vw, 4rem);

}

/* ==========================================================================

   REGISTER HEADER

   ======================================================================= */

.fr-kunye {

  display: flex;

  justify-content: space-between;

  gap: 1rem;

  padding-bottom:

    clamp(0.75rem, 1.5vw, 1rem);

  border-bottom:

    1px solid var(--fr-rule);

  font-family: var(--f-mono);

  font-size: 0.5625rem;

  line-height: 1.2;

  letter-spacing: 0.1em;

  text-transform: uppercase;

  color: var(--fr-soft);

}

.fr-kunye span:last-child {

  text-align: right;

}

/* ==========================================================================

   IDENTITY

   ======================================================================= */

.fr-kimlik {

  display: grid;

  gap: 0;

}

.fr-marka {

  margin: 0;

  max-width: 12ch;

  font-family: var(--f-display, var(--f-sans));

  font-size:

    clamp(3.2rem, 14vw, 6.5rem);

  font-weight: 790;

  line-height: 0.82;

  letter-spacing: -0.07em;

  text-wrap: balance;

}

/* Marka adındaki "Kent" — bakır.

   RENK TOKEN'DAN, SABİT DEĞİL. `--fr-signal` footer'ın kendi sinyal
   token'ı ve `--c-signal`e (180 68 28) bağlı. Footer KÂĞIT zeminde
   olduğu için kanonik sinyal doğru olan: açık zeminde daha kontrastlı.
   Logo ve sekme ikonu MÜREKKEP zeminde durduğu için orada bir tık daha
   parlak bakır (#C0592A) kullanılıyor — aynı ailenin iki zemine göre
   ayarlanmış iki basamağı, iki ayrı renk değil.

   Yalnız renk değişiyor: punto, ağırlık ve harf aralığı ortak, çünkü
   vurgu ayrı bir kelime gibi değil AYNI yazının bir parçası gibi
   okunmalı. */
.fr-marka-kent {

  color: var(--fr-signal);

}

.fr-tanim {

  margin:

    clamp(1.2rem, 2.4vw, 1.8rem)

    0

    0;

  max-width: 46ch;

  font-size:

    clamp(0.95rem, 0.91rem + 0.2vw, 1.05rem);

  line-height: 1.58;

  color: var(--fr-soft);

  text-wrap: pretty;

}

.fr-adres {

  margin:

    clamp(1.3rem, 2.6vw, 2rem)

    0

    0;

  display: grid;

  gap: 0.3rem;

  max-width: 44ch;

  font-style: normal;

  font-family: var(--f-mono);

  font-size: 0.72rem;

  line-height: 1.5;

  letter-spacing: 0.03em;

  color: var(--fr-soft);

}

.fr-saat {

  font-variant-numeric: tabular-nums;

}

/* ==========================================================================

   SECTION INDEX

   ======================================================================= */

.fr-bolum-no {

  font-family: var(--f-mono);

  font-size: 0.625rem;

  line-height: 1;

  letter-spacing: 0.1em;

  color: var(--fr-signal);

}

/* ==========================================================================

   CONTACT

   ======================================================================= */

.fr-iletisim {

  display: grid;

  grid-template-columns:

    auto

    minmax(0, 1fr);

  gap:

    clamp(0.8rem, 2vw, 1.3rem);

}

.fr-iletisim-icerik {

  display: grid;

  border-top:

    1px solid var(--fr-measure);

}

.fr-tel,

.fr-bag {

  position: relative;

  min-height: 4.6rem;

  padding:

    0.85rem

    0;

  display: grid;

  grid-template-columns:

    minmax(0, 1fr)
    auto;

  gap:

    clamp(0.7rem, 2vw, 1.2rem);

  align-items: center;

  border-bottom:

    1px solid var(--fr-rule);

  color: inherit;

  text-decoration: none;

}

.fr-link-meta {

  font-family: var(--f-mono);

  font-size: 0.52rem;

  letter-spacing: 0.08em;

  color: var(--fr-soft);

}

.fr-link-main {

  min-width: 0;

  font-size:

    clamp(1rem, 0.94rem + 0.4vw, 1.25rem);

  font-weight: 620;

  overflow-wrap: anywhere;

}

.fr-tel .fr-link-main {

  font-family: var(--f-mono);

  letter-spacing: 0.025em;

}

.fr-link-arrow {

  color: var(--fr-signal);

  font-size: 1.25rem;

  line-height: 1;

  transition:

    transform 180ms ease-out;

}

.fr-tel:hover .fr-link-arrow,

.fr-tel:focus-visible .fr-link-arrow {

  transform:

    translateX(0.25rem);

}

.fr-bag:hover .fr-link-arrow,

.fr-bag:focus-visible .fr-link-arrow {

  transform:

    translate(0.2rem, -0.2rem);

}

/* ==========================================================================

   NAVIGATION

   ======================================================================= */

.fr-gezinme {

  display: grid;

  grid-template-columns:

    auto

    minmax(0, 1fr);

  gap:

    clamp(0.8rem, 2vw, 1.3rem);

}

.fr-nav-list {

  border-top:

    1px solid var(--fr-measure);

}

.fr-nav-link {

  min-height:

    clamp(4.2rem, 12vw, 5.7rem);

  padding:

    0.8rem

    0;

  display: grid;

  grid-template-columns:

    minmax(0, 1fr)
    auto;

  gap:

    clamp(0.7rem, 2vw, 1.1rem);

  align-items: center;

  border-bottom:

    1px solid var(--fr-rule);

  color: inherit;

  text-decoration: none;

}

.fr-nav-no {

  font-family: var(--f-mono);

  font-size: 0.52rem;

  letter-spacing: 0.08em;

  color: var(--fr-soft);

}

.fr-nav-label {

  font-family: var(--f-display, var(--f-sans));

  font-size:

    clamp(1.4rem, 5vw, 2rem);

  font-weight: 650;

  line-height: 1;

  letter-spacing: -0.03em;

}

.fr-nav-arrow {

  color: var(--fr-signal);

  font-size: 1.2rem;

  transition:

    transform 180ms ease-out;

}

.fr-nav-link:hover .fr-nav-arrow,

.fr-nav-link:focus-visible .fr-nav-arrow {

  transform:

    translate(0.22rem, -0.22rem);

}

/* ==========================================================================

   SOCIAL

   ======================================================================= */

.fr-sosyal {

  display: grid;

  grid-template-columns:

    auto

    minmax(0, 1fr);

  gap:

    clamp(0.8rem, 2vw, 1.3rem);

}

.fr-sosyal-list {

  display: flex;

  flex-wrap: wrap;

  gap:

    0

    clamp(1rem, 2.5vw, 2rem);

  padding-top:

    0.45rem;

  border-top:

    1px solid var(--fr-measure);

}

.fr-sosyal-link {

  min-height: 44px;

  display: inline-flex;

  align-items: center;

  gap: 0.4rem;

  color: var(--fr-ink);

  text-decoration: none;

  font-size: 0.9rem;

}

.fr-sosyal-link span:last-child {

  color: var(--fr-signal);

  transition:

    transform 180ms ease-out;

}

.fr-sosyal-link:hover span:last-child,

.fr-sosyal-link:focus-visible span:last-child {

  transform:

    translate(0.18rem, -0.18rem);

}

/* ==========================================================================

   META

   ======================================================================= */

.fr-meta {

  padding-top:

    clamp(1rem, 2vw, 1.4rem);

  border-top:

    1px solid var(--fr-rule);

  display: grid;

  gap:

    0.75rem;

}

.fr-telif {

  margin: 0;

  font-family: var(--f-mono);

  font-size: 0.7rem;

  letter-spacing: 0.05em;

  color: var(--fr-soft);

}

.fr-yasal {

  display: flex;

  flex-wrap: wrap;

  gap:

    0

    clamp(0.9rem, 2vw, 1.4rem);

}

.fr-yasal-link {

  min-height: 44px;

  display: inline-flex;

  align-items: center;

  font-size: 0.78rem;

  color: var(--fr-soft);

  text-decoration: none;

  border-bottom:

    1px solid transparent;

  transition:

    color 150ms ease-out,

    border-color 150ms ease-out;

}

.fr-yasal-link:hover {

  color: var(--fr-ink);

  border-bottom-color:

    var(--fr-ink);

}

.fr-meta-code {

  font-family: var(--f-mono);

  font-size: 0.48rem;

  letter-spacing: 0.08em;

  text-transform: uppercase;

  color: var(--fr-measure);

}

/* ==========================================================================

   FOCUS

   ======================================================================= */

.fr-tel:focus-visible,

.fr-bag:focus-visible,

.fr-nav-link:focus-visible,

.fr-sosyal-link:focus-visible,

.fr-yasal-link:focus-visible {

  outline:

    2px solid var(--fr-ink);

  outline-offset:

    4px;

}

/* ==========================================================================

   VIEW-ENTRY — SUBTLE ONLY

   Footer utility layer; no choreography.

   ======================================================================= */

@supports (animation-timeline: view()) {

  @media (prefers-reduced-motion: no-preference) {

    .fr {

      view-timeline-name:

        --fr;

      view-timeline-axis:

        block;

    }

    .fr-kunye,

    .fr-kimlik,

    .fr-iletisim,

    .fr-gezinme,

    .fr-sosyal,

    .fr-meta {

      animation-duration:

        auto;

      animation-fill-mode:

        both;

      animation-timing-function:

        linear;

      animation-timeline:

        --fr;

    }
.fr-kimlik {

      animation-name:

        fr-print-main;

      animation-range:

        entry 86%

        cover 25%;

    }

    .fr-iletisim {

      animation-name:

        fr-print-row;

      animation-range:

        entry 78%

        cover 36%;

    }

    .fr-gezinme {

      animation-name:

        fr-print-row;

      animation-range:

        entry 67%

        cover 52%;

    }

    .fr-sosyal {

      animation-name:

        fr-print-row;

      animation-range:

        entry 56%

        cover 66%;

    }

    .fr-meta {

      animation-name:

        fr-print-row;

      animation-range:

        entry 46%

        cover 80%;

    }

    @keyframes fr-print-top {

      from {

        clip-path:

          inset(0 100% 0 0);

      }

      to {

        clip-path:

          inset(0);

      }

    }

    @keyframes fr-print-main {

      from {

        transform:

          translateY(1rem);

        clip-path:

          inset(0 0 12% 0);

      }

      to {

        transform:

          translateY(0);

        clip-path:

          inset(0);

      }

    }

    @keyframes fr-print-row {

      from {

        transform:

          translateY(0.7rem);

        clip-path:

          inset(0 0 10% 0);

      }

      to {

        transform:

          translateY(0);

        clip-path:

          inset(0);

      }

    }

  }

}

/* ==========================================================================

   TABLET

   ======================================================================= */

@media (min-width: 768px) {

  .fr-alan {

    grid-template-columns:

      repeat(12, minmax(0, 1fr));

    column-gap:

      var(--sahne-kolon-arasi);

  }

  .fr-kunye {

    grid-column:

      1 / 13;

  }

  .fr-kimlik {

    grid-column:

      1 / 7;

  }

  .fr-iletisim {

    grid-column:

      8 / 13;

    align-self:

      start;

  }

  .fr-gezinme {

    grid-column:

      1 / 13;

  }

  .fr-sosyal {

    grid-column:

      1 / 13;

  }

  .fr-meta {

    grid-column:

      1 / 13;

  }

  .fr-marka {

    max-width:

      10ch;

    font-size:

      clamp(4.5rem, 9vw, 7.5rem);

  }

  .fr-nav-list {

    display: grid;

    grid-template-columns:

      repeat(2, minmax(0, 1fr));

    column-gap:

      var(--sahne-kolon-arasi);

  }

  .fr-nav-link {

    min-height:

      5.2rem;

  }

  .fr-nav-link:nth-child(odd) {

    border-right:

      1px solid var(--fr-rule);

    padding-right:

      clamp(1rem, 2vw, 1.5rem);

  }

  .fr-nav-link:nth-child(even) {

    padding-left:

      clamp(1rem, 2vw, 1.5rem);

  }

  .fr-meta {

    grid-template-columns:

      auto
      minmax(0, 1fr);

    align-items:

      center;

    column-gap:

      1.5rem;

  }

  .fr-yasal {

    justify-content:

      center;

  }
}

/* ==========================================================================

   DESKTOP

   ======================================================================= */

@media (min-width: 1024px) {

  .fr-alan {

    padding-top:

      clamp(3.5rem, 6vh, 5.5rem);

    padding-bottom:

      clamp(1.8rem, 3vh, 2.6rem);

    row-gap:

      clamp(2.8rem, 5vh, 4.5rem);

  }

  .fr-kimlik {

    grid-column:

      1 / 8;

  }

  .fr-iletisim {

    grid-column:

      9 / 13;

    margin-top:

      0.2rem;

  }

  .fr-marka {

    max-width:

      9ch;

    font-size:

      clamp(5.5rem, 7vw, 9rem);

  }

  .fr-nav-list {

    grid-template-columns:

      repeat(3, minmax(0, 1fr));

  }

  .fr-nav-link:nth-child(odd),

  .fr-nav-link:nth-child(even) {

    padding-left:

      clamp(0.8rem, 1.2vw, 1rem);

    padding-right:

      clamp(0.8rem, 1.2vw, 1rem);

    border-right:

      1px solid var(--fr-rule);

  }

  .fr-nav-link:nth-child(3n) {

    border-right:

      0;

  }

  .fr-nav-label {

    font-size:

      clamp(1.5rem, 1.8vw, 2.15rem);

  }

  .fr-sosyal {

    align-items:

      start;

  }

}

/* ==========================================================================

   ULTRAWIDE

   ======================================================================= */

@media (min-width: 1800px) {

  .fr-alan {

    max-width:

      1840px;

  }

  .fr-marka {

    font-size:

      clamp(6rem, 6vw, 9.5rem);

  }

  .fr-nav-label {

    font-size:

      clamp(1.6rem, 1.55vw, 2.25rem);

  }

}

/* ==========================================================================

   REDUCED MOTION

   ======================================================================= */

@media (prefers-reduced-motion: reduce) {

  .fr-link-arrow,

  .fr-nav-arrow,

  .fr-sosyal-link span:last-child {

    transition:

      none;

  }

  .fr-tel:hover .fr-link-arrow,

  .fr-tel:focus-visible .fr-link-arrow,

  .fr-bag:hover .fr-link-arrow,

  .fr-bag:focus-visible .fr-link-arrow,

  .fr-nav-link:hover .fr-nav-arrow,

  .fr-nav-link:focus-visible .fr-nav-arrow,

  .fr-sosyal-link:hover span:last-child,

  .fr-sosyal-link:focus-visible span:last-child {

    transform:

      none;

  }

}

</style>