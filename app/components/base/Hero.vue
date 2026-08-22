<script setup>
/**
 * BÖLÜM 01 — İSTANBUL'DA TAŞINMAK  ·  SIGNATURE #1: ŞEHRİ OKUMAK
 *
 * FİKİR: fotoğraf ÖLÇÜLÜR.
 * Sayfa açıldığında klasik bir hero var — solda tipografi, sağda büyük
 * fotoğraf. Kaydırma başlayınca fotoğraf çıkıp gitmiyor: iki ölçü çizgisi
 * kadrajın içine iniyor ve fotoğrafı bir ÖLÇÜM BANDINA indiriyor. Mimari
 * çizimde bir cepheyi ölçmek gibi. Aynı anda metin rayı kayıyor ve ölçülen
 * dört koşul (araç erişimi, bina girişi, kat, eşya hacmi) banda hizalanıyor.
 *
 * Bölümün sonunda fotoğraf KAPANMIYOR — dar bir bant olarak kalıyor ve bir
 * sonraki bölüme aynı geometriyle devrediyor. "Hero bitti" hissi yok.
 *
 * SÖZLEŞME UYUMU
 *   md.1  `animation` kısayolu yok, hepsi uzun yazım.
 *   md.2  Şeffaflıkla hareket yok. Etiketler opacity ile BELİRMİYOR;
 *         kendi yuvalarının dışından içeri kayıyorlar (`otur`).
 *   md.3  Bütün sahne `@supports` + `prefers-reduced-motion` içinde.
 *         Desteklemeyen tarayıcı ve hareket istemeyen kullanıcı üç durağın
 *         ÜÇÜNÜ DE normal akışta okunur biçimde alıyor.
 *   md.5  Metin rayı yuvası pencereden uzun (%160): geçiş ortasında iki
 *         metin birden görünmüyor.
 *   md.6  Kırpma düzen geometrisini değiştirmiyor; figür her durumda tam
 *         kutu, metin sütunu hiç kaymıyor.
 *   md.11 Yapışkan çerçeve navbar yüksekliği kadar aşağıdan başlıyor.
 *   md.12 `kadraj` değerleri hesaplandı: iki nakliyeci ve ambalajlı koltuk
 *         kaynak karede %38–%72 dikey bandında; bant daraldıkça ölçek
 *         onları kadrajda tutuyor, aksi hâlde bant yalnız asfalt gösterirdi.
 *
 * LCP: fotoğraf ilk ekranda, `eager` + `fetchpriority=high` + preload.
 * %0'da hiçbir dönüşüm uygulanmıyor — ilk render harekete bağımlı değil.
 */
/**
 * İÇERİK KAYNAĞI — `HomeSection('hero')`.
 *
 * Başlık, giriş cümlesi, ölçülen dört koşul, kapanış ve fotoğraf artık bu
 * dosyada SABİT DEĞİL: ana sayfa tek istekle çekiyor (`/api/anasayfa`) ve
 * prop olarak veriyor. Bileşende ikinci bir kopya BIRAKILMADI — yedek
 * metin tutmak paneli yeniden sahte hâle getirirdi: yönetici metni
 * değiştirir, sayfada eski metin görünmeye devam ederdi.
 *
 * KODDA KALAN: künye numarası, ölçüm koreografisi, kadraj değerleri,
 * ızgara ve erişilebilirlik yapısı. Bunlar tasarım, içerik değil.
 *
 * TELEFON hâlâ Site Ayarları'ndan geliyor — ikinci kez saklanmıyor.
 */
const props = defineProps({
  bolum: { type: Object, required: true },
})

const { settings } = await useSiteSettings()

const phone = computed(() => settings.value?.phone || settings.value?.mobilePhone || '')
const telHref = computed(() => `tel:${String(phone.value).replace(/[^\d+]/g, '')}`)

/** Ölçülen koşullar — sıra veriden geliyor (keşifte bakılan sırayla). */
const kosullar = computed(() => props.bolum.items || [])

/**
 * Kapanış vurgusu iki satır. Metin `\n` ile saklanıyor ve burada satırlara
 * bölünüyor; `v-html` KULLANILMIYOR — panelden gelen metnin HTML olarak
 * yorumlanması gereken hiçbir alan yok.
 */
const kapanisSatirlari = computed(() => String(props.bolum.closing || '').split('\n'))
</script>

<template>
  <section class="hr-kap" aria-labelledby="hero-baslik">
    <div class="hr sahne-alan">
      <p class="hr-kunye op-kunye">01 / İSTANBUL'DA TAŞINMAK</p>

      <!-- ── METİN RAYI — üç durak, üçü de ilk HTML'de ────────────────
           Hareketsiz düzende üçü alt alta normal akışta okunuyor; sahne
           modunda kolon kayıyor. -->
      <div class="hr-metin">
        <div class="hr-ray">
          <div class="hr-durak">
            <h1 id="hero-baslik" class="hr-h1">{{ bolum.heading }}</h1>
            <p class="hr-satir tip-govde">{{ bolum.lead }}</p>
            <div class="hr-eylem">
              <a :href="telHref" class="op-bag hr-bag--tel">{{ phone || 'Telefonla ara' }}</a>
              <NuxtLink to="/iletisim" class="op-bag op-bag--sakin">{{ bolum.ctaLabel }}</NuxtLink>
            </div>
          </div>

          <div class="hr-durak">
            <p class="hr-alt tip-alt">{{ bolum.note }}</p>
            <!-- Terim/karşılık ilişkisi olduğu için `dl`; görsel düzen için
                 değil. "ARAÇ ERİŞİMİ" gerçekten bir terim. -->
            <dl class="hr-kosul">
              <div v-for="k in kosullar" :key="k.label" class="hr-kosul-oge">
                <dt class="hr-kosul-etiket">{{ k.label }}</dt>
                <dd class="hr-kosul-not tip-not">{{ k.body }}</dd>
              </div>
            </dl>
          </div>

          <div class="hr-durak">
            <p class="hr-kapanis tip-anlati"><template v-for="(satir, i) in kapanisSatirlari" :key="i"><br v-if="i" />{{ satir }}</template></p>
            <p class="hr-satir tip-govde">{{ bolum.closingNote }}</p>
          </div>
        </div>
      </div>

      <!-- ── GÖRSEL ALAN — ölçülen kadraj ────────────────────────────
           İki ölçü çizgisi kadrajın içine iniyor; fotoğraf ikisinin
           arasındaki banda kırpılıyor. Çizgiler dekor değil, bandın
           kenarını TANIMLIYORLAR — kırpma sınırının kendisi onlar. -->
      <figure class="hr-gorsel">
        <NuxtImg
          :src="bolum.imagePath"
          :alt="bolum.imageAlt"
          class="hr-foto"
          format="webp"
          sizes="xs:90vw sm:90vw md:90vw lg:52vw xl:52vw"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          width="1448"
          height="1086"
        />
        <span class="hr-olcu hr-olcu--ust" aria-hidden="true" />
        <span class="hr-olcu hr-olcu--alt" aria-hidden="true" />
      </figure>
    </div>
  </section>
</template>

<style scoped>
/* ===========================================================================
   VARSAYILAN DÜZEN — normal akış, sıfır hareket.
   Desteklemeyen tarayıcı, reduced-motion ve JS'siz durum bunu görür.
   Üç durak da okunur, hiçbir içerik gizli değil.
   ======================================================================== */
.hr-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}
/* MOBİL/VARSAYILAN — fotoğrafın yeri metnin İÇİNDE.
   Fotoğraf üç metin durağının ARDINA düşerse ilk ekranda hiç görsel
   kalmıyor (ölçüldü: kadraj ~1.900px aşağıdaydı, ilk ekran tamamen
   metindi). Kareyi ilk durağın hemen ardına almak için duraklar ve
   kadraj aynı ızgaranın kardeşi oluyor: `.hr-metin` ve `.hr-ray` kutu
   üretmiyor, sıra `order` ile kuruluyor.
   `order` tek başına yetmiyordu — `.hr` mobilde flex/grid değildi, o
   yüzden eski `order: -1` hiçbir şey yapmıyordu. */
.hr {
  padding-block: var(--sahne-dikey-dar) var(--sahne-dikey);
  display: grid;
  gap: clamp(2.5rem, 2rem + 2vw, 4rem);
}
.hr-kunye {
  margin-bottom: 0;
  order: 0;
}
.hr-metin,
.hr-ray {
  display: contents;
}
.hr-durak:nth-child(1) { order: 1; }   /* H1 + alt satır + eylem */
.hr-durak:nth-child(2) { order: 3; }   /* dört koşul */
.hr-durak:nth-child(3) { order: 4; }   /* kapanış */

.hr-gorsel {
  margin: 0;
  order: 2;                            /* ilk ekranda görünen kare */
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}
.hr-foto {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 42%;
}
/* Ölçü çizgileri hareketsiz hâlde de var: kadrajın üst ve alt kenarını
   işaretliyorlar, yani statik durumda da bir ölçüm çizimi gibi duruyor. */
.hr-olcu {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgb(var(--c-paper) / 0.85);
}
.hr-olcu--ust { top: 0; }
.hr-olcu--alt { bottom: 0; }

.hr-h1 {
  font-size: clamp(2.125rem, 1.4rem + 3.2vw, 4.25rem);
  line-height: 1.04;
  letter-spacing: -0.032em;
  font-weight: 700;
  margin: 0;
  text-wrap: balance;
}
.hr-satir {
  max-width: 42ch;
  margin: 1.25rem 0 0;
}
.hr-eylem {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  margin-top: 1.75rem;
}
.hr-bag--tel {
  font-family: var(--f-mono);
  letter-spacing: 0.02em;
}
.hr-alt {
  max-width: 30ch;
}
.hr-kosul {
  margin: clamp(1.25rem, 1rem + 0.8vw, 1.75rem) 0 0;
  display: grid;
  gap: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}
.hr-kosul-etiket {
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  color: rgb(var(--c-ink-soft));
}
.hr-kosul-not {
  margin: 0.25rem 0 0;
  max-width: 46ch;
}
.hr-kapanis {
  max-width: 18ch;
}

/* ===========================================================================
   İYİLEŞTİRME KATMANI — SIGNATURE #1
   ======================================================================== */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    /* ---- MOBİL: PIN YOK ------------------------------------------------
       Koreografi yerine tek okunur davranış: fotoğraf görünüme girerken
       ölçüm bandına iniyor. Metin normal akışta kalıyor — dar ekranda
       kayan metin okuma yükü (md.7). */
    .hr-gorsel {
      view-timeline-name: --hr-mobil;
      view-timeline-axis: block;
      animation-name: hr-m-kadraj;
    }
    .hr-olcu--ust { animation-name: hr-m-olcu-ust; }
    .hr-olcu--alt { animation-name: hr-m-olcu-alt; }
    .hr-gorsel,
    .hr-olcu--ust,
    .hr-olcu--alt {
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --hr-mobil;
      animation-range: entry 85% exit 15%;
    }

    @keyframes hr-m-kadraj {
      0%, 35% { clip-path: inset(0% 0% 0% 0%); }
      100%    { clip-path: inset(12% 0% 12% 0%); }
    }
    @keyframes hr-m-olcu-ust {
      0%, 35% { top: 0%; }
      100%    { top: 12%; }
    }
    @keyframes hr-m-olcu-alt {
      0%, 35% { bottom: 0%; }
      100%    { bottom: 12%; }
    }

    /* ---- MASAÜSTÜ: yapışkan sahne ------------------------------------- */
    @media (min-width: 1024px) {
      .hr-kap {
        /* Üç durak için 220vh. İlk durak scroll 0'da tam görünür. */
        height: 220vh;
        view-timeline-name: --hr;
        view-timeline-axis: block;
      }
      .hr {
        position: sticky;
        top: var(--sahne-navbar);
        height: calc(100vh - var(--sahne-navbar));
        padding-block: clamp(2rem, 1.25rem + 2vw, 3.5rem);
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        column-gap: var(--sahne-kolon-arasi);
        grid-template-rows: auto minmax(0, 1fr);
        row-gap: clamp(1rem, 0.5rem + 1.5vw, 2rem);
        align-content: center;
      }
      /* Mobildeki iç içe geçme geri alınıyor: metin kendi kutusunu yeniden
         üretiyor, ray yapışkan sahnenin kayan kolonu oluyor. */
      .hr-metin { display: block; }
      .hr-ray {
        display: grid;
        gap: clamp(2.5rem, 2rem + 2vw, 4rem);
      }
      /* `.hr-ray .hr-durak` — sade sınıf değil: mobil sıra kuralları
         `:nth-child` ile yazıldığı için daha özgül, sade sınıfla
         sıfırlanmıyordu. */
      .hr-ray .hr-durak { order: 0; }

      .hr-kunye {
        grid-column: 1 / 8;
        grid-row: 1;
        margin-bottom: 0;
      }
      /* EKSEN B — ana metin. */
      .hr-metin {
        grid-column: 2 / 8;
        grid-row: 2;
        overflow: hidden;
        height: 100%;
        position: relative;
      }
      /* EKSEN D — görsel alan, menteşeden sağa. */
      .hr-gorsel {
        grid-column: 8 / 13;
        grid-row: 1 / 3;
        order: 0;
        margin: 0;
        aspect-ratio: auto;
        height: 100%;
        view-timeline-name: none;
      }

      /* --- Metin rayı: üç durak, pencereden uzun yuvalar -------------- */
      .hr-ray {
        gap: 0;
        height: 100%;
        grid-auto-rows: 160%;
        animation-name: hr-ray-kay;
      }
      .hr-durak {
        min-height: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      /* `otur` — üç durak, aralarda geçiş. Başlangıç -%30: yuvanın
         pencereden taşan payının yarısı ((160-100)/2). */
      @keyframes hr-ray-kay {
        0%, 24%   { transform: translateY(-30%); }
        38%, 62%  { transform: translateY(-190%); }
        76%, 100% { transform: translateY(-350%); }
      }

      /* --- `kadraj`: fotoğraf ölçüm bandına iniyor -------------------- */
      .hr-gorsel { animation-name: hr-kadraj; }
      .hr-foto { animation-name: hr-icerik; }
      .hr-olcu--ust { animation-name: hr-olcu-ust; }
      .hr-olcu--alt { animation-name: hr-olcu-alt; }
      .hr-ray,
      .hr-gorsel,
      .hr-foto,
      .hr-olcu--ust,
      .hr-olcu--alt {
        animation-duration: auto;
        animation-timing-function: linear;
        animation-fill-mode: both;
        animation-timeline: --hr;
        animation-range: contain 0% contain 100%;
      }

      @keyframes hr-kadraj {
        0%, 24%   { clip-path: inset(0% 0% 0% 0%); }
        62%       { clip-path: inset(16% 0% 16% 0%); }
        76%, 100% { clip-path: inset(27% 0% 27% 0%); }
      }
      @keyframes hr-icerik {
        0%, 24%   { transform: scale(1) translateY(0); }
        62%       { transform: scale(1.16) translateY(-3%); }
        76%, 100% { transform: scale(1.34) translateY(-5%); }
      }
      @keyframes hr-olcu-ust {
        0%, 24%   { top: 0%; }
        62%       { top: 16%; }
        76%, 100% { top: 27%; }
      }
      @keyframes hr-olcu-alt {
        0%, 24%   { bottom: 0%; }
        62%       { bottom: 16%; }
        76%, 100% { bottom: 27%; }
      }
    }
  }
}
</style>
