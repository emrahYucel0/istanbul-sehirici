<script setup>
/**
 * BÖLÜM 01 — İSTANBUL'DA TAŞINMAK · SIGNATURE #1 / TEKNİK POSTER
 *
 * YENİ İLK KARE:
 *   İSTANBUL                 ← HTML / CMS heading'den türetilir
 *   teknik taşıma çizimi     ← CMS imagePath
 *   EVDEN EVE NAKLİYAT      ← aynı semantic H1'in ikinci görsel satırı
 *   açıklama                 ← CMS lead
 *
 * Tek semantic H1 korunur. Görselin içine yazı gömülmez.
 * Desktop'ta poster → takeover → nefes → ölçüm bandı → panel akışı sürer.
 * Tablet/mobilde pin yok; normal belge akışı.
 */
const props = defineProps({
  bolum: { type: Object, required: true },
})

const kosullar = computed(() => props.bolum.items || [])

const baslikParcalari = computed(() => {
  const tam = String(props.bolum.heading || '').trim()
  const eslesme = tam.match(/^(İstanbul|Istanbul)\s+(.+)$/u)

  if (!eslesme) {
    return {
      sehir: '',
      alt: tam,
    }
  }

  return {
    sehir: eslesme[1] === 'Istanbul' ? 'İstanbul' : eslesme[1],
    alt: eslesme[2].trim(),
  }
})

const kapanisSatirlari = computed(() =>
  String(props.bolum.closing || '').split('\n'),
)
</script>

<template>
  <section class="jr-hero" aria-labelledby="hero-baslik">
    <div class="jr-sahne sahne-alan">
      <!--
        TEK semantic H1. İki ayrı görsel satır aynı H1'in parçalarıdır:
        "İstanbul" + "Evden Eve Nakliyat".
      -->
      <h1 id="hero-baslik" class="jr-h1">
        <span v-if="baslikParcalari.sehir" class="jr-h1-sehir">
          {{ baslikParcalari.sehir }}
        </span>
        <span class="jr-h1-alt">
          {{ baslikParcalari.alt }}
        </span>
      </h1>

      <div class="jr-meta">
        <p class="op-kunye">01 / İSTANBUL'DA TAŞINMAK</p>
      </div>

      <!--
        Teknik artwork ayrı bir görsel katman.
        Metin görsele gömülü değil; CMS imagePath yalnız çizimi taşır.
      -->
      <figure class="jr-gorsel">
        <div class="jr-kadraj">
          <!--
            `preload` — ÖLÇÜLEN BİR GECİKMENİN KARŞILIĞI, süs değil.

            Lighthouse mobil koşusunda LCP bu görsel ve dökümü şöyleydi:
            TTFB %12 · YÜKLEME GECİKMESİ %38 (1387 ms) · indirme %25 ·
            render %25. En büyük dilim, tarayıcının görseli ancak HTML'i
            ayrıştırıp bu etikete gelince keşfetmesi.

            `preload`, `srcset`/`sizes` ile BİREBİR aynı bağlantıyı başa
            koyuyor; ikinci bir istek doğurmuyor (ölçüldü). `eager` ve
            `fetchpriority` zaten vardı — onlar sıraya girdikten SONRAKİ
            önceliği belirliyor, keşfi öne almıyor.

            `sizes` SONUNDAKİ `xxl:100vw` DE ÖLÇÜMDEN GELİYOR. Aday
            listesi her kırılım noktasının 1x ve 2x katından üretiliyor;
            en büyük kırılım `xl` (1280) olduğu için tavan 2560w'de
            kalıyordu ve 3440/3840 ekranlarda 2560'lık dosya 1,5 kat
            büyütülerek gösteriliyordu (ölçüldü). `xxl` (1536) eklenince
            liste 3072w kazanıyor ve o da yüklenmiş 3840 varyantına
            düşüyor. Küçük ekranlarda seçim DEĞİŞMİYOR: 390 hâlâ 640,
            1920 hâlâ 2048, 2560 hâlâ 2560 — tek tek doğrulandı.
            Değer yalnız hangi DOSYANIN indirileceğini söylüyor; düzen,
            kadraj ve kompozisyon aynı.
          -->
          <NuxtImg
            :src="bolum.imagePath"
            :alt="bolum.imageAlt"
            class="jr-foto"
            format="webp"
            sizes="xs:94vw sm:94vw md:92vw lg:100vw xl:100vw xxl:100vw"
            loading="eager"
            fetchpriority="high"
            preload
            decoding="async"
            width="1588"
            height="893"
          />

          <span class="jr-olcu jr-olcu--ust" aria-hidden="true"></span>
          <span class="jr-olcu jr-olcu--alt" aria-hidden="true"></span>
        </div>
      </figure>

      <p class="jr-aciklama tip-govde">{{ bolum.lead }}</p>

      <div class="jr-olcum-paneli">
        <div class="jr-olcum-bas">
          <p class="jr-olcum-baslik">{{ bolum.note }}</p>
          <p v-if="bolum.closingNote" class="jr-olcum-not tip-not">
            {{ bolum.closingNote }}
          </p>
        </div>

        <dl class="jr-kosullar">
          <div v-for="(k, i) in kosullar" :key="k.label" class="jr-kosul">
            <dt>
              <span>{{ String(i + 1).padStart(2, '0') }}</span>
              {{ k.label }}
            </dt>
            <dd>{{ k.body }}</dd>
          </div>
        </dl>
      </div>

      <p class="jr-kapanis">
        <template v-for="(satir, i) in kapanisSatirlari" :key="i">
          <br v-if="i" />{{ satir }}
        </template>
      </p>
    </div>
  </section>
</template>

<style scoped>
/* ==========================================================================
   FALLBACK / MOBILE — okunabilir normal belge akışı
   ======================================================================= */
.jr-hero {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
  overflow: clip;
}

.jr-sahne {
  min-width: 0;
  /* ÜST PAY NAVBARI DA KAPSIYOR. `#icerik` y=0'dan başlıyor ve navbar
     (sticky, z-50) ilk 56–57px'i boyuyor. Anasayfa hero'su sayfanın İLK
     bölümü olduğu için "İSTANBUL" satırı navbarın ALTINDA kalıyordu —
     ölçüldü: 390'da 48px, 834'te 54px görünmüyordu. Diğer sayfalarda sorun
     yok (ilk H1 navbardan 115px aşağıda), yani bu yalnız hero'nun payı.
     Masaüstü koreografide bu kural ezildiği için (padding: 0) etkisiz. */
  padding: calc(var(--sahne-navbar) + clamp(1.25rem, 3vw, 2.5rem))
    var(--sahne-pad) var(--sahne-dikey);
  display: grid;
  gap: clamp(1.35rem, 2.4vw, 2.5rem);
}

.jr-h1 {
  margin: 0;
  min-width: 0;
  max-width: 100%;
  font-family: var(--f-display, var(--f-sans));
  font-weight: 800;
  letter-spacing: -0.06em;
}

.jr-h1-sehir,
.jr-h1-alt {
  display: block;
}

.jr-h1-sehir {
  font-size: clamp(4.2rem, 20vw, 8rem);
  line-height: 0.76;
  text-transform: uppercase;
  white-space: nowrap;
  /* `line-height: 0.76` satır kutusunu mürekkepten KISA yapıyor: harfin altı
     kutunun dışına taşıyor ve alttaki "Evden Eve Nakliyat" satırının üstüne
     biniyordu (ölçüldü: 390'da 11px, 834'te 22px, 1024'te 28px çakışma).
     Pay kendi em'inde: font büyüdükçe düzeltme de büyüyor, her genişlikte
     ~5px'lik aynı boşluk kalıyor. Sıkı satır aralığı korundu.
     Masaüstü posterde bu kural etkisiz — orada satır mutlak konumlanıyor. */
  margin-bottom: 0.2em;
}

.jr-h1-alt {
  margin-top: 0.35rem;
  font-size: clamp(2.35rem, 11vw, 4.75rem);
  line-height: 0.9;
  text-wrap: balance;
}

.jr-meta {
  font-family: var(--f-mono);
  font-size: 0.625rem;
  line-height: 1.2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--c-ink-soft));
}

.jr-meta p {
  margin: 0;
}

.jr-gorsel {
  margin: 0;
  min-width: 0;
  width: 100%;
}

.jr-kadraj {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.jr-foto {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  object-position: center center;
}

.jr-olcu {
  display: none;
}

.jr-aciklama {
  margin: 0;
  max-width: 54ch;
  color: rgb(var(--c-ink-soft));
}

.jr-olcum-paneli {
  margin-top: clamp(1rem, 2vw, 2rem);
  border-top: 1px solid rgb(var(--c-rule));
  padding-top: 1.25rem;
}

.jr-olcum-baslik {
  margin: 0;
  max-width: 32ch;
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  line-height: 1.05;
  font-weight: 650;
}

.jr-olcum-not {
  margin: 0.5rem 0 0;
  max-width: 46ch;
  color: rgb(var(--c-ink-soft));
}

.jr-kosullar {
  margin: 1.5rem 0 0;
  display: grid;
  gap: 0;
}

.jr-kosul {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 1rem;
  padding-block: 0.8rem;
  border-top: 1px solid rgb(var(--c-rule));
}

.jr-kosul dt {
  font-family: var(--f-mono);
  font-size: 0.625rem;
  line-height: 1.25;
  letter-spacing: 0.08em;
}

.jr-kosul dt span {
  display: inline-block;
  width: 2.1rem;
  color: rgb(var(--c-signal));
}

.jr-kosul dd {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.35;
  color: rgb(var(--c-ink-soft));
}

.jr-kapanis {
  margin: 0;
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  line-height: 1.5;
  letter-spacing: 0.08em;
  color: rgb(var(--c-ink-soft));
}

/* Mobilde pin yok; yalnız artwork çok hafif oturur. */
@supports (animation-timeline: view()) {
  @media (max-width: 1279px) and (prefers-reduced-motion: no-preference) {
    .jr-gorsel {
      view-timeline-name: --jr-mobil;
      view-timeline-axis: block;
      animation-name: jr-mobil-gorsel;
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --jr-mobil;
      animation-range: entry 85% cover 65%;
    }

    @keyframes jr-mobil-gorsel {
      0% { transform: scale(0.96); }
      100% { transform: scale(1); }
    }
  }
}

@media (min-width: 768px) and (max-width: 1279px) {
  .jr-sahne {
    padding-inline: clamp(1.5rem, 4vw, 3rem);
  }

  .jr-h1-sehir {
    font-size: clamp(7rem, 16vw, 11rem);
  }

  .jr-h1-alt {
    max-width: 14ch;
    font-size: clamp(3.5rem, 7vw, 6rem);
  }

  .jr-gorsel {
    max-width: 68rem;
    justify-self: center;
  }
}

@media (max-width: 767px) {
  .jr-sahne,
  .jr-h1,
  .jr-gorsel,
  .jr-kadraj,
  .jr-foto,
  .jr-olcum-paneli,
  .jr-kosullar {
    min-width: 0;
    max-width: 100%;
  }

  .jr-h1-sehir {
    font-size: clamp(3.4rem, 16.5vw, 6.4rem);
  }

  .jr-h1-alt {
    font-size: clamp(2.25rem, 11.5vw, 3.6rem);
  }

  .jr-kosul {
    grid-template-columns: 1fr;
  }
}

/* ==========================================================================
   DESKTOP SIGNATURE — TEKNİK POSTER → TAKEOVER → ÖLÇÜM
   ======================================================================= */
@supports (animation-timeline: view()) {
  @media (min-width: 1280px) and (prefers-reduced-motion: no-preference) {
    .jr-hero {
      /*
       * 440 → 420vh ve aralık %88 → %93.5.
       *
       * Koreografinin MUTLAK uzunluğu SABİT: önce 340vh'lik contain
       * aralığının %88'i = 299.2vh, şimdi 320vh'nin %93.5'i = 299.2vh.
       * İlk kare, metnin çıkışı ve artwork-only sahnesi hem konum hem
       * zamanlama olarak birebir aynı noktada kalıyor.
       *
       * Kısalan tek şey SONDAKİ HOLD: panel yerleştikten sonra ekran donmuş
       * hâlde 40.8vh kaydırılıyordu (958px pencerede ~390px). Şimdi 20.8vh —
       * kapanış payı duruyor, gereksiz bekleme yarıya indi.
       */
      height: 420vh;
      width: 100vw;
      max-width: none;
      margin-inline: calc(50% - 50vw);
      margin-bottom: var(--sahne-perde);
      padding: 0;
      overflow: clip;
      background: rgb(var(--c-paper));
      position: relative;
      view-timeline-name: --jr;
      view-timeline-axis: block;
    }

    .jr-sahne {
      position: sticky;
      top: var(--sahne-navbar);
      left: 50%;
      width: 100vw;
      min-width: 100vw;
      max-width: none;
      height: calc(100vh - var(--sahne-navbar));
      margin: 0 0 0 -50vw;
      padding: 0;
      display: block;
      overflow: hidden;
      isolation: isolate;
    }

    /*
     * 1) ÜST DEV BAŞLIK — referanstaki poster oranı.
     *    Görselin parçası değil; HTML/CMS.
     */
    .jr-h1 {
      position: absolute;
      inset: 0;
      z-index: 6;
      margin: 0;
      pointer-events: none;
    }

    .jr-h1-sehir {
      position: absolute;
      left: 50%;
      /* `line-height: 0.80` satır kutusunu harf boyundan KISA yapıyor:
         mürekkep, öğenin üst kenarının ~0.098em üstünden başlıyor. Sahne
         `overflow: hidden` olduğu için "İ"nin noktası kesiliyordu — ölçüldü:
         1280'de 19px, 1440'ta 21px, 2560'ta 33px, 3440'ta 39px.
         Pay em cinsinden: font büyüdükçe düzeltme de büyüyor, her genişlikte
         aynı küçük boşluk kalıyor. Konum ve tipografi değişmedi. */
      top: calc(clamp(0.35rem, 1.2vh, 0.9rem) + 0.115em);
      width: min(95vw, 108rem);
      transform: translate3d(-50%, 0, 0);
      font-size: clamp(8.25rem, 15.2vw, 17.5rem);
      line-height: 0.80;
      letter-spacing: -0.072em;
      text-align: center;
      text-transform: uppercase;
      white-space: nowrap;
      color: rgb(var(--c-ink));
      animation-name: jr-sehir-kay;
    }

    /*
     * 2) ALT DEV BAŞLIK — merkezde, artwork'ün hemen altında.
     */
    .jr-h1-alt {
      position: absolute;
      left: 50%;
      bottom: clamp(4.8rem, 9.2vh, 7.6rem);
      width: min(92vw, 80rem);
      margin: 0;
      transform: translate3d(-50%, 0, 0);
      font-size: clamp(3.9rem, 5.5vw, 7.1rem);
      line-height: 0.84;
      letter-spacing: -0.06em;
      text-align: center;
      white-space: nowrap;
      color: rgb(var(--c-ink));
      animation-name: jr-alt-baslik-kay;
    }

    /*
     * 3) TEKNİK ARTWORK — sahnenin tamamını kullanan görünmez bir canvas.
     *    İlk karede scale(.72) ile iki tipografi satırı arasında "pafta" gibi;
     *    takeover'da layout değiştirmeden GPU transform ile büyür.
     */
    .jr-gorsel {
      position: absolute;
      inset: 0;
      left: 0;
      right: 0;
      z-index: 3;
      width: 100vw;
      min-width: 100vw;
      max-width: none;
      height: 100%;
      margin: 0;
      transform: none;
      transform-origin: center center;
    }

    .jr-kadraj {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      clip-path: inset(0);
      will-change: clip-path;
      animation-name: jr-kadraj-sikisma;
    }

    .jr-foto {
      display: block;
      width: 100vw;
      height: 100%;
      max-width: none;
      object-fit: cover;
      object-position: center center;
      transform-origin: center center;
      will-change: transform;
      animation-name: jr-foto-kadraj;
    }

    /*
     * ULTRAWIDE (21:9) — KADRAJ AŞAĞI SABİTLENİR.
     *
     * SORUN: sahne 3440×1376'da 2.50 oranında; artwork 16:9. `cover` genişliğe
     * göre ölçeklendiği için dikeyde %28.9 kesiliyor ve kesme ORTADAN
     * yapıldığı için artwork'ün ALT boş bandı gidiyor. Sonuç: "Evden Eve
     * Nakliyat" kamyonun ve binanın üstüne biniyordu.
     *
     * ÖLÇÜM (kaynak 2560×1440, satır başına mürekkep oranı):
     *   satır    0– 360   %0.0–0.9   → boş gökyüzü, kesilebilir
     *   satır  360– 440   %7.9–9.4   → çatı/minare tepeleri
     *   satır 1040–1140   %32–67     → zemin çizgisi ve kamyon
     *   satır 1140–1440   %0.1–4.0   → ALT BOŞ BANT (tipografinin yeri)
     *
     * ÇÖZÜM: kadrajı alta sabitlemek. Böylece kesme üstteki boş gökyüzünden
     * yapılıyor (416 satır; bunun 360'ı zaten boş) ve alt boş bant sahnede
     * kalıyor — H1'in altında temiz kâğıt oluyor.
     *
     * Tek bildirim: full-bleed, H1 konumu, keyframe'ler ve koreografi
     * DEĞİŞMEDİ. 21:9 altındaki bütün oranlar (1.72–1.89) bu kuralı hiç
     * görmüyor; 1440/1920/2560/3840'ta tek piksel fark yok.
     */

    /*
     * Künye referanstaki gibi poster başlığının hemen alt ekseninde.
     * Takeover başladıktan sonra da sahnenin sol üstünde kalır.
     */
    .jr-meta {
      position: absolute;
      left: var(--sahne-pad);
      top: clamp(10.4rem, 23vh, 15.8rem);
      z-index: 7;
      color: rgb(var(--c-ink-soft));
      animation-name: jr-meta-kay;
    }

    .jr-aciklama {
      position: absolute;
      left: 50%;
      bottom: clamp(1rem, 2.1vh, 1.65rem);
      z-index: 7;
      width: min(54ch, 56vw);
      margin: 0;
      transform: translate3d(-50%, 0, 0);
      font-size: clamp(0.8125rem, 0.84vw, 0.9375rem);
      line-height: 1.45;
      text-align: center;
      color: rgb(var(--c-ink));
      font-weight: 500;
      animation-name: jr-aciklama-kay;
    }

    /* Ölçüm çizgileri yalnız compression başladığında görünür. */
    .jr-olcu {
      display: block;
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background: rgb(var(--c-measure));
      z-index: 4;
    }

    .jr-olcu--ust { animation-name: jr-olcu-ust; }
    .jr-olcu--alt { animation-name: jr-olcu-alt; }

    .jr-olcum-paneli {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      min-height: 30vh;
      padding: clamp(1.25rem, 2vw, 2rem) var(--sahne-pad);
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      column-gap: var(--sahne-kolon-arasi);
      border-top: 1px solid rgb(var(--c-rule));
      background: rgb(var(--c-paper));
      z-index: 5;
      transform: translateY(105%);
      animation-name: jr-panel-kay;
    }

    .jr-olcum-bas {
      grid-column: 1 / 4;
      align-self: start;
    }

    .jr-olcum-baslik {
      font-size: clamp(1.4rem, 2vw, 2.1rem);
    }

    .jr-kosullar {
      grid-column: 5 / 13;
      margin: 0;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: var(--sahne-kolon-arasi);
    }

    .jr-kosul {
      grid-template-columns: 1fr;
      gap: 0.5rem;
      align-content: start;
      min-height: 7rem;
      padding: 0.55rem 0 1rem;
    }

    .jr-kosul dd {
      max-width: 26ch;
    }

    .jr-kapanis {
      position: absolute;
      right: var(--sahne-pad);
      bottom: 0.65rem;
      text-align: right;
      z-index: 6;
      transform: translateY(180%);
      animation-name: jr-kapanis-kay;
    }

    .jr-h1-sehir,
    .jr-h1-alt,
    .jr-meta,
    .jr-kadraj,
    .jr-foto,
    .jr-aciklama,
    .jr-olcum-paneli,
    .jr-kapanis,
    .jr-olcu--ust,
    .jr-olcu--alt {
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --jr;
      animation-range: contain 0% contain 93.5%;
    }

    @media (min-aspect-ratio: 2 / 1) {
      .jr-foto {
        object-position: center bottom;
      }

      /*
       * Künye de yukarı alınıyor. Kadraj alta sabitlenince çatı yükseliyor
       * ve künye onun üstüne biniyordu — "01 / İSTANB…" sonrası okunmuyordu.
       * Ölçüm (künyenin kapladığı kaynak şeridi, x 30–240): sahne satır 290'a
       * kadar mürekkep %0, 301'de %12.9, 328'de %39. Yeni değer o temiz
       * bandın içinde kalıyor (3440×1440'ta 198px, 2560×1080'de 151px).
       * `jr-meta-kay` keyframe'ine DOKUNULMADI; yalnız başlangıç konumu.
       */
      .jr-meta {
        top: clamp(6rem, 14vh, 9rem);
      }
    }

    /*
     * ZAMANLAMA
     *  0–42  FULL-STAGE: artwork ekranı doğrudan kaplar + İSTANBUL + alt başlık
     * 42–58  iki büyük başlık sahneden TAMAMEN çıkar
     * 58–70  artwork tek başına full-stage nefes alır
     * 70–100 artwork genişliği koruyarak dikeyde küçülür + ölçüm paneli
     * 88% sonrası final state hero bitene kadar hold
     */

    @keyframes jr-sehir-kay {
      0%, 42% {
        transform: translate3d(-50%, 0, 0);
        animation-timing-function: cubic-bezier(0.42, 0, 0.32, 1);
      }
      49% {
        transform: translate3d(-50%, -42%, 0);
      }
      56%, 100% {
        transform: translate3d(-50%, -145vh, 0);
      }
    }

    @keyframes jr-alt-baslik-kay {
      0%, 42% {
        transform: translate3d(-50%, 0, 0);
        animation-timing-function: cubic-bezier(0.42, 0, 0.32, 1);
      }
      49% {
        transform: translate3d(-50%, 34%, 0);
      }
      56%, 100% {
        transform: translate3d(-50%, 145vh, 0);
      }
    }

    @keyframes jr-meta-kay {
      0%, 42% {
        transform: translate3d(0, 0, 0);
      }
      52%, 100% {
        top: clamp(0.85rem, 1.4vh, 1.25rem);
        transform: translate3d(0, 0, 0);
      }
    }


    @keyframes jr-aciklama-kay {
      0%, 42% {
        transform: translate3d(-50%, 0, 0);
        animation-timing-function: cubic-bezier(0.42, 0, 0.32, 1);
      }
      49% {
        transform: translate3d(-50%, 30%, 0);
      }
      56%, 100% {
        transform: translate3d(-50%, 145vh, 0);
      }
    }

    /*
     * SIKIŞTIRMA SİMETRİK DEĞİL — üst kırpma alttan az.
     *
     * Simetrikken (36/36) final karede sahnenin ÜST %36'sı boş kâğıt
     * kalıyordu: 1920×958'de 322px, sahnenin üçte biri. Bant 250px,
     * altındaki panel 289px — ekranın en büyük parçası hiçbir şey
     * söylemeyen boşluktu.
     *
     * ALT kırpma AYNEN duruyor (8/18/28/36): bandın alt kenarı ve panelle
     * arasındaki 33px'lik mesafe değişmedi. Yalnız üst kenar yukarı çıktı —
     * boşluk 322 → 197px, bant 250 → 375px. Kadraj, odak, asset, ölçek ve
     * zamanlama aynı; ilk kare ve artwork-only sahnesi bu kuralı görmüyor
     * (%70'e kadar inset(0)).
     */
    @keyframes jr-kadraj-sikisma {
      0%, 70% {
        clip-path: inset(0 0 0 0);
        animation-timing-function: cubic-bezier(0.45, 0, 0.55, 1);
      }
      78% { clip-path: inset(6% 0 8% 0); }
      86% { clip-path: inset(13% 0 18% 0); }
      93% { clip-path: inset(19% 0 28% 0); }
      100% { clip-path: inset(22% 0 36% 0); }
    }

    @keyframes jr-foto-kadraj {
      0%, 42% {
        transform: scale(1) translate3d(0, 0, 0);
      }
      58%, 70% {
        transform: scale(1.025) translate3d(0, -0.5%, 0);
      }
      100% {
        transform: scale(1.055) translate3d(0, -2%, 0);
      }
    }

    @keyframes jr-panel-kay {
      0%, 90% {
        transform: translate3d(0, 105%, 0);
        animation-timing-function: cubic-bezier(0.22, 0.72, 0.28, 1);
      }
      95% { transform: translate3d(0, 38%, 0); }
      99%, 100% { transform: translate3d(0, 0, 0); }
    }

    @keyframes jr-kapanis-kay {
      0%, 93% {
        transform: translate3d(0, 180%, 0);
        animation-timing-function: cubic-bezier(0.22, 0.72, 0.28, 1);
      }
      99%, 100% {
        transform: translate3d(0, 0, 0);
      }
    }

    @keyframes jr-olcu-ust {
      0%, 70% {
        top: 0;
        transform: scaleX(0);
        transform-origin: left center;
      }
      78% {
        top: 6%;
        transform: scaleX(1);
      }
      86% {
        top: 13%;
        transform: scaleX(1);
      }
      93% {
        top: 19%;
        transform: scaleX(1);
      }
      100% {
        top: 22%;
        transform: scaleX(1);
      }
    }

    @keyframes jr-olcu-alt {
      0%, 70% {
        bottom: 0;
        transform: scaleX(0);
        transform-origin: left center;
      }
      78% {
        bottom: 8%;
        transform: scaleX(1);
      }
      86% {
        bottom: 18%;
        transform: scaleX(1);
      }
      93% {
        bottom: 28%;
        transform: scaleX(1);
      }
      100% {
        bottom: 36%;
        transform: scaleX(1);
      }
    }
  }
}
</style>
