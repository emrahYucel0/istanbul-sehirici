<script setup>
/**
 * BÖLÜM 03 — TAŞIMANIN İÇİNDE NE OLUYOR?  ·  SIGNATURE #3: SÜREKLİLİK
 *
 * FİKİR: kadro sabit, operasyon ilerler.
 * Görsel alan hiç yer değiştirmiyor; içindeki beş kare birbirini
 * GEOMETRİK OLARAK devralıyor. Çıkan kare yukarı doğru kapanıyor, giren
 * kare aynı kenardan açılıyor — çapraz solma yok, yer değiştirme var.
 * Kullanıcı "yeni bölüm" değil "aynı iş ilerledi" görüyor.
 *
 * OPERASYON ÇİZGİSİ BURADA SÜREÇ OMURGASI
 * Bölüm 1'de kadrajı ölçüyordu, Bölüm 2'de mekânsal eksendi. Burada dikey
 * bir omurga ve beş çentik: aktif adımın kolu açılıyor (`uzat`), numarası
 * sinyale dönüyor. İlerleme çubuğu değil — çizgi baştan sona tam çizili,
 * çünkü bir ölçek; değişen şey hangi adımın çağrıldığı.
 *
 * BEŞ KARE, BEŞ AYRI ÖLÇEK
 * Kareler mesafeyi kademeli daraltıyor: geniş sokak → makro ambalaj →
 * oda içinde söküm → kamyon kasası → yerleşim. Aynı işin giderek yakından
 * görünüşü; her kare bir öncekinden daha içeride geçiyor.
 *
 * Not: 02 ve 03 daha önce elde olan iki karenin yapay büyütmesiydi
 * (scale 2.2 ve 1.9). Gerçek makro ve söküm kareleri geldiğinde o
 * büyütmeler kaldırıldı — zorlama kadraj artık gerekmiyor.
 *
 * BU BÖLÜM İKİ ESKİ BÖLÜMÜ İÇİNE ALDI
 *   Kanıt (kamyon içi sabitleme)  → 04. kare
 *   Nefes (kapanış cümlesi)       → 05. karenin payoff'u
 * İkisi de ayrı bölüm olarak sayfada tekrar etmiyor; dosyaları duruyor.
 *
 * SÖZLEŞME: md.1 uzun yazım · md.2 opacity yok, geçişler kırpma ·
 * md.4 kadro sabit · md.5 yuva pencereden uzun · md.6 düzen animasyonu yok ·
 * md.11 navbar ofseti · md.12 kadraj değerleri hesaplandı.
 */
/**
 * ICERIK KAYNAGI — `ProcessSection` / `ProcessStep`.
 *
 * YENI MODEL ACILMADI. Surec icin zaten bir domain modeli ve bir yonetim
 * paneli vardi; eksik olan tek sey bu bolumun ihtiyac duydugu alanlardi
 * (adim etiketi, fotograf, alt metin ve istege bagli baglanti). Onlar
 * `ProcessStep`e eklendi. Yani paneldeki "Surec Adimlari" ekrani artik
 * gercekten ana sayfayi yonetiyor — daha once hicbir public sayfaya bagli
 * degildi.
 *
 * ADIM SAYISI veriden geliyor: omurga centikleri ve kadraj gecisleri
 * `--i` / `--k` uzerinden hesaplaniyor, sabit bese bagli degil.
 *
 * Kare numaralari (01…05) KODDA uretiliyor: sira numarasi kunye dilinin
 * parcasi, yoneticinin yazacagi bir icerik degil.
 */
const props = defineProps({
  surec: { type: Object, required: true },
})

const KARELER = computed(() =>
  (props.surec.steps || []).map((a, i) => ({
    no: String(i + 1).padStart(2, '0'),
    etiket: a.label,
    baslik: a.title,
    metin: a.body,
    gorsel: a.imagePath,
    alt: a.imageAlt,
    bag: a.linkLabel && a.linkHref ? { ad: a.linkLabel, yol: a.linkHref } : null,
  }))
)


/**
 * TEKNİK KATMAN — beş adım, beş çizim.
 *
 * KATMAN ARTIK DEKOR DEĞİL, ADIMIN ANA JESTİ.
 * Önceki sürümde işaretler kadrajın kenarında duran küçük parantezlerdi;
 * fotoğrafı süslüyor ama hiçbir şey söylemiyorlardı. Şimdi her adımın bir
 * ANA ÇİZGİSİ var ve o çizgi kadrajın üçte birini kaplıyor: ölçüm kapısı,
 * koruma zarfı, montaj ekseni, rota, zemin datumu.
 *
 * ANA ÇİZGİ SONRAKİ DEVRİN KESİM HATTI
 * Her adımın ana bakır çizgisi YATAY ve adımın operasyon kotunda duruyor.
 * Adım bittiğinde o çizgi kadraj boyu uzuyor (bkz. `KESIMLER`), sonra
 * fotoğrafın yükselen alt kenarı gelip onu ALIYOR ve ikisi birlikte
 * yukarı çıkıyor. Yeni fotoğraf hattın arkasından, alttan devralıyor.
 * Tek eksen: aşağıdan yukarı.
 *   01 eşik datumu    → y 72
 *   02 bant dikişi    → y 58
 *   03 bağlantı hattı → y 48  (düğümler solda temiz alanda)
 *   04 rotanın son kolu → y 26
 *   05 zemin datumu (y 74) — kesim yok, bölüm burada duruyor.
 *
 * Dikey ve eğik kesim DENENDİ VE BIRAKILDI: dikey bir hattın yatay
 * süpürmesi kaçınılmaz olarak "önce/sonra sürgüsü" gibi okunuyor.
 *
 * HER İŞARET İKİ KEZ ÇİZİLİYOR: altta kâğıt renginde kalın bir KILIF,
 * üstte gerçek renginde ince çizgi. Fotoğraf üzerine konan teknik işaretin
 * standart yöntemi — koyu boşlukta gri çizgi, açık duvarda kâğıt kılıf
 * kayboluyor; ikisi üst üste her zeminde okunuyor. Gölge değil, iki çizgi.
 *
 * KOORDİNATLAR KADRAJA GÖRE, FOTOĞRAF İÇERİĞİNE GÖRE DEĞİL.
 * Fotoğraf `cover` ile kırpılıyor ve kırpma ekran oranına göre kayıyor;
 * ayrıca fotoğraf CMS'ten geliyor. İşareti "kapının koluna" oturtmak
 * yönetici kareyi değiştirdiğinde yanlış yere düşerdi.
 *
 * SAYI YOK, YAZI YOK, HUD YOK. Bu fotoğraflar gerçek bir işten ölçülmedi;
 * üzerlerine metre yazmak uydurma veri olurdu. Katman yalnız geometri
 * taşıyor; nişangâh/arayüz estetiği bilerek dışarıda.
 *
 * `pathLength="100"` — her çizginin gerçek uzunluğu ne olursa olsun çizim
 * animasyonu 100 birimde normalleşiyor; tek bir keyframe seti hepsini
 * sürüyor. Birden çok alt yol taşıyan `d` sırayla çiziliyor.
 *
 * viewBox 160×90 — sahne oranıyla (16:9) birebir.
 */
const ISARETLER = [
  // 01 · GİRİŞ ÖLÇÜM KAPISI — iki düşey ölçüm rayı + eşik datumu (kesim y 72)
  {
    parcalar: [
      { d: 'M42 8 V72 M36 8 H48 M36 72 H48', rol: 'i', h: 'r1' },
      { d: 'M118 8 V72 M112 8 H124 M112 72 H124', rol: 'i', h: 'r2' },
      { d: 'M18 72 H142 M18 66 V78 M142 66 V78', rol: 'v', h: 'dt' },
    ],
  },
  // 02 · KORUMA ZARFI — dört AÇIK köşe guard, ince bağlayıcılar, tek dikiş
  //      (kesim y 58). Kapalı sekizgen kaldırıldı: kadrajı çerçeveleyen
  //      kapalı bir çokgen, koruma zarfı değil arayüz gibi okunuyordu.
  {
    parcalar: [
      { d: 'M44 31 V20 H55 M105 20 H116 V31 M116 65 V76 H105 M55 76 H44 V65', rol: 'i', h: 'zk' },
      { d: 'M68 20 H92 M68 76 H92 M44 41 V52 M116 41 V52', rol: 'i', h: 'zb' },
      { d: 'M26 64 L32 58 H128 L134 64', rol: 'v', h: 'sm' },
    ],
  },
  // 03 · BAĞLANTI — üç düğüm ortak hat üzerinde ayrışıyor (kesim y 48).
  //      Kutu/kapak görünümü kaldırıldı; anlatılan şey parçalar ARASINDAKİ
  //      ilişki: her düğümün kendi montaj ekseni var, hat üçünü bağlıyor.
  //
  //      DÜĞÜMLER KADRAJIN TEMİZ NEGATİF ALANINA ALINDI (x 8–50).
  //      Önce x 52/80/108'deydiler; ekranda ölçüldüğünde 80 ayakta duran
  //      çalışanın gövdesine, 108 çömelen çalışanın başına düşüyordu.
  //      Kare, eksen ve düğümün insan figürünün üzerinde durması teknik
  //      çizim değil "insan takibi / nişan arayüzü" gibi okunuyor.
  //      Fotoğrafın solundaki düz duvar (x 0–55, y 8–78) boş; diyagram
  //      oraya taşındı. Bakır bağlantı hattı ise uzun kalıyor: dolabın ve
  //      çalışanın üstünden geçerek diyagramı asıl işe bağlıyor — çizgi,
  //      kesim hattının kendisi zaten kadrajı boydan boya geçiyor.
  {
    parcalar: [
      { d: 'M12 22 V42 M8 22 H16 M9 45 H15 V51 H9 Z M12 54 V68 M8 68 H16', rol: 'i', h: 'd1' },
      { d: 'M29 22 V42 M25 22 H33 M26 45 H32 V51 H26 Z M29 54 V68 M25 68 H33', rol: 'i', h: 'd2' },
      { d: 'M46 22 V42 M42 22 H50 M43 45 H49 V51 H43 Z M46 54 V68 M42 68 H50', rol: 'i', h: 'd3' },
      { d: 'M4 48 H126', rol: 'v', h: 'bh' },
    ],
  },
  // 04 · ROTA — kesikli plan altta, çizilen bakır rota üstte. Son kol artık
  //      YATAY (y 26): rota kendi vardığı hat üzerinde bitiyor ve o hat
  //      bir sonraki devrin kesim hattına dönüşüyor.
  {
    parcalar: [
      { d: 'M14 78 H44 L68 54 H100 L124 26 H148', rol: 'i', h: 'rp', kesik: true },
      { d: 'M14 72 V84 M152 20 V32', rol: 'i', h: 'rn' },
      { d: 'M14 78 H44 L68 54 H100 L124 26 H148', rol: 'v', h: 'rt' },
      { d: 'M148 26 l-7 -2.6 M148 26 l-7 2.6', rol: 'v', h: 'rb' },
    ],
  },
  // 05 · YERLEŞİM — zemin datumu + iki hizalama ekseni + üç oturma noktası.
  //      Eksenler dışarıdan içeri hizalanıyor, noktalar sırayla datuma
  //      iniyor. Nişangâh yok, sıçrama yok.
  {
    parcalar: [
      { d: 'M40 14 V74', rol: 'i', h: 'a1' },
      { d: 'M120 14 V74', rol: 'i', h: 'a2' },
      { d: 'M28 44 H132', rol: 'i', h: 'ah' },
      { d: 'M16 74 H144', rol: 'v', h: 'fd' },
      { d: 'M46 68 H58 M52 68 V74', rol: 'v', h: 'n1' },
      { d: 'M74 68 H86 M80 68 V74', rol: 'v', h: 'n2' },
      { d: 'M102 68 H114 M108 68 V74', rol: 'v', h: 'n3' },
    ],
  },
]

/**
 * KESİM HATLARI — kareden BAĞIMSIZ, sahne katmanında.
 *
 * Önce bu hatlar karenin kendi SVG'sinin içindeydi; kare kırpılınca hat da
 * onunla birlikte kırpılıyordu, yani "fotoğrafı kesen çizgi" tam kestiği
 * anda kayboluyordu. Ekran görüntüsünde görüldü.
 *
 * Şimdi hat beş karenin ÜSTÜNDE ayrı bir katmanda ve iki hareketi var:
 *   1) kendi kotunda kadraj boyu ÇİZİLİYOR (`stroke-dashoffset` 100 → 0),
 *   2) fotoğrafın yükselen alt kenarı hattın kotuna VARDIĞINDA hat
 *      kenarla birlikte yukarı çıkıyor (`transform: translateY`).
 *
 * İkisinin buluşma anı ve sonraki hız hesapla bulundu, göz kararıyla
 * değil. Kenarın ekrandaki konumu = (100 − b) − 10·p  (b: alttan kırpma
 * yüzdesi, p: ilerleme, 10: karenin yukarı ötelenmesi). İkisi de DOĞRUSAL
 * olduğu için hat, buluşmadan sonra kenarla birebir örtüşüyor. Bıçak sabit
 * hızda, fotoğraf ise farklı hızda çekiliyor — "wipe" hissini kıran şey bu.
 *
 * Dördü de bir önceki adımın ANA çizgisinin kadraj boyu uzatılmışı (md.12).
 */
const KESIMLER = [
  'M-2 72 H162',
  'M-2 58 H162',
  'M-2 48 H162',
  'M-2 26 H162',
]

/** Bir parçanın sınıf listesi; `kilif` alt kopya için true. */
const parcaSinif = (p, kilif) => [
  p.rol === 'i' ? 'sr-ik' : 'sr-vu',
  p.kesik ? 'sr-kesik' : '',
  `sr-h-${p.h}`,
  kilif ? 'sr-kilif' : '',
]
</script>

<template>
  <section class="sr-kap" aria-labelledby="surec-baslik">
    <div class="sr sahne-alan">
      <p class="sr-kunye op-kunye">03 / TAŞIMANIN İÇİNDE NE OLUYOR?</p>
      <h2 id="surec-baslik" class="sr-h2 tip-anlati">{{ surec.heading }}</h2>

      <!-- SÜREÇ OMURGASI — bilgi gerçek başlıklarda olduğu için `aria-hidden`. -->
      <div class="sr-omurga" aria-hidden="true">
        <span class="sr-omurga-cizgi" />
        <span v-for="(k, i) in KARELER" :key="k.no" class="sr-centik" :style="`--i:${i}`">
          <span class="sr-centik-kol" />
          <span class="sr-centik-no">{{ k.no }}</span>
        </span>
      </div>

      <!-- GÖRSEL ALAN — beş kare üst üste, kutu hiç değişmiyor.
           Hepsi ilk HTML'de; hiçbiri eklenip çıkarılmıyor (md.4). -->
      <div class="sr-alan">
        <figure v-for="(k, i) in KARELER" :key="k.no" class="sr-gorsel" :style="`--k:${i}`">
          <NuxtImg
            :src="k.gorsel"
            :alt="k.alt"
            class="sr-foto"
            format="webp"
            sizes="xs:90vw sm:90vw md:90vw lg:52vw xl:52vw"
            loading="lazy"
            decoding="async"
            width="1448"
            height="1086"
          />

          <!--
            TEKNİK KATMAN — fotoğrafın ÜSTÜNDE, fotoğrafın İÇİNDE değil.
            Görsele hiçbir yazı basılmıyor; katman ayrı bir SVG ve kâğıt
            kadrajına göre konumlanıyor. Geometri `ISARETLER` tablosunda,
            gerekçesi orada yazılı.

            ÜÇ KATMAN, SIRAYLA: önce bütün işaretlerin kâğıt KILIFI, sonra
            gerçek çizgiler, en üstte devir anında uzayan KESİM hattı.
            `aria-hidden`: bilgi metinde, katman dekoratif.
          -->
          <svg
            v-if="ISARETLER[i]"
            class="sr-ov"
            viewBox="0 0 160 90"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            focusable="false"
          >
            <path
              v-for="(p, n) in ISARETLER[i].parcalar"
              :key="`k${n}`"
              :d="p.d"
              pathLength="100"
              :class="parcaSinif(p, true)"
            />
            <path
              v-for="(p, n) in ISARETLER[i].parcalar"
              :key="`c${n}`"
              :d="p.d"
              pathLength="100"
              :class="parcaSinif(p, false)"
            />
          </svg>
        </figure>

        <!-- KESİM KATMANI — beş karenin üstünde, hiçbirinin içinde değil.
             Devir anında ilgili hat kadraj boyu çiziliyor, fotoğraf tam o
             hattın üzerinden ayrılıyor, sonra hat kendi yönünde ilerleyip
             sahneden çıkıyor. Karenin içinde olsaydı kesilen parçayla
             birlikte kaybolurdu. -->
        <svg
          class="sr-ov sr-kesim"
          viewBox="0 0 160 90"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
        >
          <path
            v-for="(d, n) in KESIMLER"
            :key="`kk${n}`"
            :d="d"
            pathLength="100"
            :class="['sr-kilif', `sr-h-k${n + 1}`]"
          />
          <path
            v-for="(d, n) in KESIMLER"
            :key="`kc${n}`"
            :d="d"
            pathLength="100"
            :class="['sr-vu', `sr-h-k${n + 1}`]"
          />
        </svg>
      </div>

      <!-- METİN RAYI — beş adım, hepsi ilk HTML'de, sırayla. -->
      <div class="sr-metin">
        <ol class="sr-ray">
          <li v-for="k in KARELER" :key="k.no" class="sr-durak">
            <p class="sr-etiket op-kunye">{{ k.no }} / {{ k.etiket }}</p>
            <h3 class="sr-h3 tip-alt">{{ k.baslik }}</h3>
            <p class="sr-govde tip-govde">{{ k.metin }}</p>
            <NuxtLink v-if="k.bag" :to="k.bag.yol" class="op-bag op-bag--sakin sr-bag">
              {{ k.bag.ad }}
            </NuxtLink>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ===========================================================================
   VARSAYILAN DÜZEN — normal akış, hareket yok.
   Beş kare ve beş metin okunur; hiçbir içerik gizli değil.
   ======================================================================== */
.sr-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}
/* MOBİL/VARSAYILAN — her kare KENDİ adımının başında.
   Beş kareyi tek kutuda film şeridi olarak oynatmak ölçüldüğünde koptu:
   kutu listenin en üstünde ve yalnız ~263px yüksekliğinde olduğu için,
   okuyucu 01. adımı okurken şerit çoktan 04'e gelmiş oluyordu — kamyon
   karesi "keşif" metninin yanında duruyordu. Kare ile adım arasındaki
   bağ, sıranın kendisiyle kuruluyor: görsel alan ve metin rayı kutu
   üretmiyor, kareler ve duraklar aynı ızgarada birbirine geçiyor. */
.sr {
  padding-block: var(--sahne-dikey);
  display: grid;
  gap: clamp(2.25rem, 1.75rem + 1.5vw, 3.25rem);
}
.sr-kunye { margin-bottom: 0; order: 0; }
.sr-h2 { max-width: 20ch; order: 1; }

.sr-omurga { display: none; }

.sr-alan,
.sr-metin,
.sr-ray {
  display: contents;
}
.sr-gorsel:nth-child(1) { order: 2; }
.sr-durak:nth-child(1)  { order: 3; }
.sr-gorsel:nth-child(2) { order: 4; }
.sr-durak:nth-child(2)  { order: 5; }
.sr-gorsel:nth-child(3) { order: 6; }
.sr-durak:nth-child(3)  { order: 7; }
.sr-gorsel:nth-child(4) { order: 8; }
.sr-durak:nth-child(4)  { order: 9; }
.sr-gorsel:nth-child(5) { order: 10; }
.sr-durak:nth-child(5)  { order: 11; }

.sr-gorsel {
  margin: 0;
  /* Teknik katman kareyle birlikte kırpılsın ve taşınsın diye kare
     konumlandırılmış kap oldu. */
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: rgb(var(--c-paper-sunken));
}

/* ---- TEKNİK KATMAN ------------------------------------------------------
   Fotoğrafın üstünde çizgi katmanı. Kutu, gölge, dolgu yok; yalnız çizgi.
   Kalınlık kadraj biriminde — gerekçesi aşağıda.

   SIRA ÖNEMLİ: `.sr-kilif` renk kurallarından SONRA yazıldı; kılıf kopyası
   hem `.sr-ik`/`.sr-vu` hem `.sr-kilif` taşıdığı için eşit özgüllükte son
   yazılan kazanıyor. `.sr-kesik` en sonda: kesikli çizginin kılıfı da
   kesikli olmalı, yoksa altta düz beyaz bir hat kalıyor. */
.sr-ov {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
/* ÇİZGİ KALINLIĞI KADRAJ BİRİMİNDE, EKRAN PİKSELİNDE DEĞİL.
   Önce `vector-effect: non-scaling-stroke` vardı; çizgi her ekranda aynı
   incelikte kalsın diye. Ölçüldüğünde bunun `pathLength` ile ÇAKIŞTIĞI
   görüldü: `pathLength` yolu 100 kullanıcı birimine normalleştiriyor,
   non-scaling-stroke ise `stroke-dasharray`yı EKRAN pikseli sayıyor.
   Sonuç: 128 birimlik zemin datumu 602px'lik bir yol oluyor ve
   "100px dolu / 100px boş" desenine düşüyor — çizim yerine üç parçalı
   kesikli bir çizgi. Ekranda ölçüldü, tahmin değil.
   Çözüm: kalınlık kadraj biriminde. 1920'de kadraj 752px (ölçek 4.70),
   3840'ta 1034px (6.46) — çizgi geniş ekranda %37 kalınlaşıyor, bu da
   büyüyen kadrajda doğru davranış. Dar ekran ayrıca telafi ediliyor. */
.sr-ov path {
  fill: none;
  stroke-linecap: square;
  stroke-linejoin: miter;
}
.sr-ov .sr-ik {
  stroke: rgb(var(--c-ink-soft));
  stroke-width: 0.3px;
}
/* Bakır yalnız her adımın ANA çizgisinde — aksan kıtlığı korunuyor. */
.sr-ov .sr-vu {
  stroke: rgb(var(--c-signal));
  stroke-width: 0.43px;
}
.sr-ov .sr-kilif {
  stroke: rgb(var(--c-paper));
  stroke-width: 0.55px;
  stroke-linecap: round;
}
.sr-ov .sr-kesik {
  stroke-dasharray: 1.6 1.2;
  stroke-linecap: butt;
}
/* 04'te rota iki kez var: kesikli PLAN (gri) ve üstünde çizilen bakır
   GİDİLEN hat. Plan daha ince — okuma sırası plan → gerçek. */
.sr-ov .sr-h-rt { stroke-width: 0.56px; }
.sr-ov .sr-h-rp { stroke-width: 0.24px; }
/* KESİM KATMANI yalnız devir anında var; statik okumada (mobil, hareket
   azaltma, desteklemeyen tarayıcı) kadrajı boydan boya kesen bir çizgi
   anlamsız olurdu. */
.sr-kesim { display: none; }
/* SADELEŞTİRME — dar ekranda yalnız adımın ana çizgisi kalıyor. Kare
   350px'e düştüğünde ölçüm rayları, zarf ve eksenler birbirine giriyor.
   Kılıf kopyası da aynı sınıfı taşıdığı için onunla birlikte gidiyor. */
@media (max-width: 1023px) {
  .sr-ov .sr-ik { display: none; }
}
/* DAR EKRAN TELAFİSİ — kadraj 390'da ~350px'e (ölçek 2.19) düşüyor;
   kalınlık kadraj birimine bağlı olduğu için çizgi kıl gibi kalırdı.
   Çarpan ölçekten hesaplandı: 4.70 / 2.19 ≈ 2.15. */
@media (max-width: 640px) {
  .sr-ov .sr-vu { stroke-width: 0.92px; }
  .sr-ov .sr-kilif { stroke-width: 1.18px; }
  .sr-ov .sr-h-rt { stroke-width: 1.2px; }
  .sr-ov .sr-kesik { stroke-dasharray: 3.4 2.6; }
}
/* Geniş ekranda bu düzen yalnız yedek katmanda görünüyor (hareket azaltma
   ya da `animation-timeline` desteklemeyen tarayıcı). Kapaksız bırakılınca
   kareler 1.338px'e çıkıp metni eziyordu; Bölüm 2'nin yedek karelerine
   verilen ölçünün aynısına bağlanıyor. Mobilde etkisi yok — orada kare
   zaten tam genişlik, Bölüm 2'nin dar eklerinden ayrışması da bilinçli. */
@media (min-width: 1024px) {
  .sr-gorsel { max-width: 46rem; }
}
.sr-foto {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sr-ray {
  list-style: none;
  margin: 0;
  padding: 0;
}
.sr-etiket { color: rgb(var(--c-ink-soft)); }
.sr-h3 { max-width: 26ch; margin: 0.5rem 0 0; }
.sr-govde { max-width: 54ch; margin: 0.75rem 0 0; }
.sr-bag { margin-top: 1rem; }

/* ===========================================================================
   İYİLEŞTİRME KATMANI — SIGNATURE #3
   ======================================================================== */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    /* ---- MOBİL: PIN YOK ------------------------------------------------
       Kareler adımlarının arasına girdiği için "hangi görsel hangi adım"
       sorusu düzenle çözülüyor; şeride gerek kalmadı. Kalan tek hareket
       DEVİR DİLİ: kare alt kenarından yukarı doğru açılıyor — masaüstünde
       kareler yukarı kapanarak devrediyor, mobilde aynı yön açılışta
       tekrar ediyor (md.7). */
    .sr-gorsel {
      view-timeline-name: --sr-kare;
      view-timeline-axis: block;
      animation-name: sr-m-ac;
      animation-duration: auto;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --sr-kare;
      animation-range: entry 80% entry 100%;
    }
    @keyframes sr-m-ac {
      0%   { clip-path: inset(0% 0% 16% 0%); }
      100% { clip-path: inset(0% 0% 0% 0%); }
    }

    /* ---- MASAÜSTÜ: yapışkan sahne, beş kare --------------------------- */
    @media (min-width: 1024px) {
      .sr-kap {
        /* 480 → 440vh. Beş adım × ~%20 durak + dört devir; contain aralığı
           340vh, adım başına ~48vh okuma, devir başına ~27vh. Kısaltmanın
           sebebi ölçüm: 480vh'de son durak 53vh boyunca hiçbir şey
           yapmadan bekliyordu — "animasyon bitsin diye bekleme" hissi
           oradan geliyordu. Teknik katman güçlendirilirken bölüm
           UZATILMADI: çizim, durağın zaten var olan okuma payına yazıldı. */
        height: 440vh;
        view-timeline-name: --sr;
        view-timeline-axis: block;
      }
      .sr {
        position: sticky;
        top: var(--sahne-navbar);
        height: calc(100vh - var(--sahne-navbar));
        padding-block: clamp(2rem, 1.25rem + 2vw, 3.5rem);
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        column-gap: var(--sahne-kolon-arasi);
        grid-template-rows: auto auto minmax(0, 1fr);
        row-gap: clamp(0.75rem, 0.5rem + 1vw, 1.5rem);
        align-content: center;
      }
      .sr-kunye { grid-column: 1 / 6; grid-row: 1; margin-bottom: 0; }
      .sr-h2 { grid-column: 2 / 6; grid-row: 2; }

      /* EKSEN A — süreç omurgası. */
      .sr-omurga {
        display: block;
        position: relative;
        grid-column: 1;
        grid-row: 3;
      }
      .sr-omurga-cizgi {
        position: absolute;
        left: 0.75rem;
        top: 0;
        bottom: 0;
        width: 1px;
        background: rgb(var(--c-measure));
      }
      .sr-centik {
        position: absolute;
        left: 0;
        top: calc(var(--i) * 22% + 6%);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .sr-centik-kol {
        display: block;
        width: 1.5rem;
        height: 1px;
        background: rgb(var(--c-measure));
        transform-origin: left center;
        transform: scaleX(0.45);
      }
      .sr-centik-no {
        font-family: var(--f-mono);
        font-size: 0.6875rem;
        letter-spacing: 0.1em;
        color: rgb(var(--c-ink-soft));
      }

      /* EKSEN D — görsel alan, menteşeden sağa. */
      .sr-alan {
        grid-column: 6 / 13;
        grid-row: 1 / 4;
        position: relative;
        display: block;
        margin: 0;
        /* SAHNE 16:9. Önce sütunun tüm yüksekliğini kaplıyordu ve kadraj
           ekran oranına göre değişiyordu (1440'ta 1.9, 3840'ta 1.4) —
           aynı fotoğraf her ekranda başka kırpılıyordu. Sabit oran hem
           kadrajı öngörülebilir yapıyor hem teknik katmanın koordinatlarını
           anlamlı kılıyor: katmanın viewBox'ı da 16:9. */
        width: 100%;
        height: auto;
        aspect-ratio: 16 / 9;
        align-self: center;
        overflow: hidden;
        view-timeline-name: none;
        background: rgb(var(--c-paper-sunken));
      }
      /* Seçici `.sr-alan .sr-gorsel` — sade sınıf değil: mobil sıra
         kuralları `:nth-child` ile yazıldığı için daha özgül. */
      .sr-alan .sr-gorsel {
        position: absolute;
        inset: 0;
        max-width: none;
        aspect-ratio: auto;
        z-index: calc(10 - var(--k));
        view-timeline-name: none;
        order: 0;
      }

      /* EKSEN B — METİN. Beş blok ÜST ÜSTE, sırayla değil.
         Önce beş durak 160% yükseklikte bir rayda kayıyordu; devir sırasında
         kutunun içinde bir adımın alt yarısı ile sonrakinin üst yarısı aynı
         anda görünüyordu — yarım başlık, arada da boş kolon. Ölçüldü.
         Şimdi her blok kendi kutusunda duruyor ve devir, blokların
         KENDİSİ üzerinden oluyor (aşağıda `sr-metin-*`). */
      .sr-metin {
        display: block;
        grid-column: 2 / 6;
        grid-row: 3;
        overflow: hidden;
        height: 100%;
      }
      .sr-ray {
        display: block;
        position: relative;
        margin: 0;
        height: 100%;
      }
      .sr-ray .sr-durak {
        order: 0;
        position: absolute;
        inset: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      /* --- Zaman ekseni bağlantıları --------------------------------- */
      .sr-durak,
      .sr-gorsel,
      .sr-foto,
      .sr-ov path,
      .sr-centik-kol,
      .sr-centik-no {
        animation-duration: auto;
        animation-timing-function: linear;
        animation-fill-mode: both;
        animation-timeline: --sr;
        animation-range: contain 0% contain 100%;
      }

      /* ---- METİN DEVRİ: BLOK BÜTÜN GELİR, BÜTÜN GİDER ----------------
         Üç kural:
           1. Çıkan blok devrin %73'üne kadar TAM okunur kalıyor.
           2. Sonra bloğun tamamı hafifçe yukarı kalkıyor (%4) ve
              `steps(1)` ile TEK KAREDE kapanıyor — kırpma kenarı başlığın
              içinden geçmiyor, yani yarım başlık matematiksel olarak
              imkânsız.
           3. Aynı karede yeni blok BÜTÜN olarak açılıyor (%3,5 aşağıdan)
              ve yerine oturuyor. Kolon hiçbir anda boş kalmıyor.
         Opaklık yok. `clip-path` kullanıldı, `visibility` değil: kırpılan
         metin erişilebilirlik ağacında kalıyor, gizlenen metin kalmazdı.

         Yumuşatma turunda okuma payı uzatıldı (%65 → %73), takas 0,4 puan
         geciktirildi ve oturma mesafesi %5 → %3,5'e indirildi. */
      .sr-durak:nth-child(1) { animation-name: sr-metin-1; }
      .sr-durak:nth-child(2) { animation-name: sr-metin-2; }
      .sr-durak:nth-child(3) { animation-name: sr-metin-3; }
      .sr-durak:nth-child(4) { animation-name: sr-metin-4; }
      .sr-durak:nth-child(5) { animation-name: sr-metin-5; }

      @keyframes sr-metin-1 {
        0%, 17.6% {
          clip-path: inset(0 0 0 0);
          transform: translateY(0);
          animation-timing-function: cubic-bezier(0.5, 0, 0.3, 1);
        }
        19% {
          clip-path: inset(0 0 0 0);
          transform: translateY(-4%);
          animation-timing-function: steps(1, end);
        }
        19.1%, 100% { clip-path: inset(0 0 100% 0); transform: translateY(-4%); }
      }
      @keyframes sr-metin-2 {
        0%, 19% {
          clip-path: inset(0 0 100% 0);
          transform: translateY(3.5%);
          animation-timing-function: steps(1, end);
        }
        19.1% {
          clip-path: inset(0 0 0 0);
          transform: translateY(3.5%);
          animation-timing-function: cubic-bezier(0.2, 0, 0.2, 1);
        }
        20%, 39.6% {
          clip-path: inset(0 0 0 0);
          transform: translateY(0);
          animation-timing-function: cubic-bezier(0.5, 0, 0.3, 1);
        }
        41% {
          clip-path: inset(0 0 0 0);
          transform: translateY(-4%);
          animation-timing-function: steps(1, end);
        }
        41.1%, 100% { clip-path: inset(0 0 100% 0); transform: translateY(-4%); }
      }
      @keyframes sr-metin-3 {
        0%, 41% {
          clip-path: inset(0 0 100% 0);
          transform: translateY(3.5%);
          animation-timing-function: steps(1, end);
        }
        41.1% {
          clip-path: inset(0 0 0 0);
          transform: translateY(3.5%);
          animation-timing-function: cubic-bezier(0.2, 0, 0.2, 1);
        }
        42%, 61.6% {
          clip-path: inset(0 0 0 0);
          transform: translateY(0);
          animation-timing-function: cubic-bezier(0.5, 0, 0.3, 1);
        }
        63% {
          clip-path: inset(0 0 0 0);
          transform: translateY(-4%);
          animation-timing-function: steps(1, end);
        }
        63.1%, 100% { clip-path: inset(0 0 100% 0); transform: translateY(-4%); }
      }
      @keyframes sr-metin-4 {
        0%, 63% {
          clip-path: inset(0 0 100% 0);
          transform: translateY(3.5%);
          animation-timing-function: steps(1, end);
        }
        63.1% {
          clip-path: inset(0 0 0 0);
          transform: translateY(3.5%);
          animation-timing-function: cubic-bezier(0.2, 0, 0.2, 1);
        }
        64%, 83.6% {
          clip-path: inset(0 0 0 0);
          transform: translateY(0);
          animation-timing-function: cubic-bezier(0.5, 0, 0.3, 1);
        }
        85% {
          clip-path: inset(0 0 0 0);
          transform: translateY(-4%);
          animation-timing-function: steps(1, end);
        }
        85.1%, 100% { clip-path: inset(0 0 100% 0); transform: translateY(-4%); }
      }
      @keyframes sr-metin-5 {
        0%, 85% {
          clip-path: inset(0 0 100% 0);
          transform: translateY(3.5%);
          animation-timing-function: steps(1, end);
        }
        85.1% {
          clip-path: inset(0 0 0 0);
          transform: translateY(3.5%);
          animation-timing-function: cubic-bezier(0.2, 0, 0.2, 1);
        }
        86%, 100% { clip-path: inset(0 0 0 0); transform: translateY(0); }
      }

      /* ---- DEVİR: TEK OPERASYON HAREKETİ ------------------------------
         Sıra her devirde aynı ve tek eksende — aşağıdan yukarı:

           1) Adımın bakır ana çizgisi kendi kotunda kadraj boyu çizilir.
           2) Çıkan karenin alt kenarı kadrajın dibinden yükselmeye başlar;
              yeni fotoğraf bu kenarın ARKASINDAN devralır. Hat bu sırada
              çizimin kendi hattıyla birlikte hareket eder.
           3) Kenar hatta VARIR — burada çok kısa bir optik duruş var
              (0,5 puan ≈ 1,7vh) — sonra hat ile kenar birlikte kadrajın
              üstüne çıkar.

         "Wipe" hissini kıran şey hızların ayrı olması: kenar ve hat SABİT
         hızda (bıçak mekanik), çıkan fotoğrafın kendisi farklı hızda geri
         çekilirken, giren kare aşağıdan yumuşak bir eğriyle oturuyor.
         Üç ayrı hız = üç ayrı cisim; sürgü değil, devir.

         Dikey ve eğik kesim denendi ve bırakıldı: dikey bir hattın yatay
         süpürmesi kaçınılmaz olarak önce/sonra sürgüsü gibi okunuyor.

         YUMUŞATMA TURU — bölüm UZAMADAN sertlik alındı:
           devir penceresi   8   → 9 puan   (duraklardan alındı, 440vh aynı)
           çıkan kare        −%10 → −%6,5
           giren kare        +%5  → +%3,5   ·  ölçek 1,13 → 1,08
           buluşmada duruş   yok  → 0,5 puan

         Giren karede %8 taşma, %3,5 kayma: devir boyunca kadrajda boş
         zemin görünmüyor. `.sr-alan` `overflow: hidden` — taşma sızmıyor. */
      .sr-gorsel:nth-child(1) { animation-name: sr-devir-1; }
      .sr-gorsel:nth-child(2) { animation-name: sr-devir-2; }
      .sr-gorsel:nth-child(3) { animation-name: sr-devir-3; }
      .sr-gorsel:nth-child(4) { animation-name: sr-devir-4; }
      .sr-gorsel:nth-child(5) { animation-name: sr-devir-5; }

      @keyframes sr-devir-1 {
        0%, 13.2% { clip-path: inset(0 0 0 0); transform: translate(0, 0) scale(1); }
        14.46%, 14.96% { clip-path: inset(0 0 20% 0); transform: translate(0, -1.3%) scale(1); }
        20%, 100% { clip-path: inset(0 0 100% 0); transform: translate(0, -6.5%) scale(1); }
      }
      @keyframes sr-devir-2 {
        0%, 13.2% {
          clip-path: inset(0 0 0 0);
          transform: translate(0, 3.5%) scale(1.08);
          animation-timing-function: cubic-bezier(0.22, 0, 0.12, 1);
        }
        20%, 35.2% {
          clip-path: inset(0 0 0 0);
          transform: translate(0, 0) scale(1);
          animation-timing-function: linear;
        }
        37.44%, 37.94% { clip-path: inset(0 0 35.56% 0); transform: translate(0, -2.31%) scale(1); }
        42%, 100% { clip-path: inset(0 0 100% 0); transform: translate(0, -6.5%) scale(1); }
      }
      @keyframes sr-devir-3 {
        0%, 35.2% {
          clip-path: inset(0 0 0 0);
          transform: translate(0, 3.5%) scale(1.08);
          animation-timing-function: cubic-bezier(0.22, 0, 0.12, 1);
        }
        42%, 57.2% {
          clip-path: inset(0 0 0 0);
          transform: translate(0, 0) scale(1);
          animation-timing-function: linear;
        }
        60.14%, 60.64% { clip-path: inset(0 0 46.67% 0); transform: translate(0, -3.03%) scale(1); }
        64%, 100% { clip-path: inset(0 0 100% 0); transform: translate(0, -6.5%) scale(1); }
      }
      @keyframes sr-devir-4 {
        0%, 57.2% {
          clip-path: inset(0 0 0 0);
          transform: translate(0, 3.5%) scale(1.08);
          animation-timing-function: cubic-bezier(0.22, 0, 0.12, 1);
        }
        64%, 79.2% {
          clip-path: inset(0 0 0 0);
          transform: translate(0, 0) scale(1);
          animation-timing-function: linear;
        }
        83.68%, 84.18% { clip-path: inset(0 0 71.11% 0); transform: translate(0, -4.62%) scale(1); }
        86%, 100% { clip-path: inset(0 0 100% 0); transform: translate(0, -6.5%) scale(1); }
      }
      @keyframes sr-devir-5 {
        0%, 79.2% {
          clip-path: inset(0 0 0 0);
          transform: translate(0, 3.5%) scale(1.08);
          animation-timing-function: cubic-bezier(0.22, 0, 0.12, 1);
        }
        86%, 100% { clip-path: inset(0 0 0 0); transform: translate(0, 0) scale(1); }
      }

      /* `kadraj` — her kare kendi ölçeğinde duruyor. Beşi de kendi
         mesafesinde çekilmiş olduğu için yapay büyütmeye gerek kalmadı;
         kalan değerler yalnız özneyi dikey kutunun ortasına getiriyor
         (md.12). */
      .sr-gorsel:nth-child(1) .sr-foto { object-position: 50% 45%; }
      .sr-gorsel:nth-child(2) .sr-foto { object-position: 46% 50%; transform: scale(1.06); }
      .sr-gorsel:nth-child(3) .sr-foto { object-position: 42% 52%; transform: scale(1.04); }
      .sr-gorsel:nth-child(4) .sr-foto { object-position: 50% 50%; }
      .sr-gorsel:nth-child(5) .sr-foto { object-position: 50% 50%; transform: scale(1.04); }
      .sr-foto { animation-name: none; }

      /* ---- KESİM HATLARI ----------------------------------------------
         Hat dört aşamada yaşıyor:
           1) kendi kotunda ÇİZİLİYOR,
           2) BULUŞMAYA KADAR çizimin kendi hattıyla birlikte hareket
              ediyor (çıkan kare yukarı çekilirken katman da onunla
              gidiyor; hat sabit dursaydı ekranda İKİ paralel bakır çizgi
              olurdu — ölçüldü, 03'te 20px ayrılıyordu),
           3) fotoğrafın yükselen alt kenarı hatta VARIYOR: 0,5 puanlık
              kısa bir optik duruş — göz hattı ve kenarı aynı yerde
              yakalıyor,
           4) hat kenara kenetli olarak birlikte kadrajın üstüne çıkıyor.
              Aynı anda çizimin kendi hattı kenarın altında kalıp
              kırpılıyor — devir tam da bu noktada el değiştiriyor.

         Buluşma noktası aritmetikle. Çizimin hattı y = D − 5,85·p,
         kenar y = 90 − 95,85·p (p: kenar ilerlemesi, −%6,5 kare ötelemesi
         dahil). Eşitlik → P = 1 − D/90 — kare ötelemesinden bağımsız.
         Öteleme 2. aşamada −5,85·p, 4. aşamada 90 − 95,85·p − D kullanıcı
         birimi; ikisi P'de birebir örtüşüyor. Dördü de kadrajın 5,85
         birim üstünde bitiyor, yani sahneden tam çıkıyor (md.12).

           01  D 72  P 0,200  →  %14,46   ara −1,17   son −77,9
           02  D 58  P 0,356  →  %37,44   ara −2,08   son −63,9
           03  D 48  P 0,467  →  %60,14   ara −2,73   son −53,9
           04  D 26  P 0,711  →  %83,68   ara −4,16   son −31,9 */
      .sr-h-k1 { animation-name: sr-k1; }
      .sr-h-k2 { animation-name: sr-k2; }
      .sr-h-k3 { animation-name: sr-k3; }
      .sr-h-k4 { animation-name: sr-k4; }
      @keyframes sr-k1 {
        0%, 11% {
          stroke-dashoffset: 100;
          transform: translate(0, 0);
          animation-timing-function: cubic-bezier(0.45, 0, 0.1, 1);
        }
        13.2% { stroke-dashoffset: 0; transform: translate(0, 0); animation-timing-function: linear; }
        14.46%, 14.96% { transform: translate(0, -1.17px); animation-timing-function: linear; }
        20%, 100% { transform: translate(0, -77.9px); }
      }
      @keyframes sr-k2 {
        0%, 33% {
          stroke-dashoffset: 100;
          transform: translate(0, 0);
          animation-timing-function: cubic-bezier(0.45, 0, 0.1, 1);
        }
        35.2% { stroke-dashoffset: 0; transform: translate(0, 0); animation-timing-function: linear; }
        37.44%, 37.94% { transform: translate(0, -2.08px); animation-timing-function: linear; }
        42%, 100% { transform: translate(0, -63.9px); }
      }
      @keyframes sr-k3 {
        0%, 55% {
          stroke-dashoffset: 100;
          transform: translate(0, 0);
          animation-timing-function: cubic-bezier(0.45, 0, 0.1, 1);
        }
        57.2% { stroke-dashoffset: 0; transform: translate(0, 0); animation-timing-function: linear; }
        60.14%, 60.64% { transform: translate(0, -2.73px); animation-timing-function: linear; }
        64%, 100% { transform: translate(0, -53.9px); }
      }
      @keyframes sr-k4 {
        0%, 77% {
          stroke-dashoffset: 100;
          transform: translate(0, 0);
          animation-timing-function: cubic-bezier(0.45, 0, 0.1, 1);
        }
        79.2% { stroke-dashoffset: 0; transform: translate(0, 0); animation-timing-function: linear; }
        83.68%, 84.18% { transform: translate(0, -4.16px); animation-timing-function: linear; }
        86%, 100% { transform: translate(0, -31.9px); }
      }

      /* ---- TEKNİK KATMANIN ÇİZİLMESİ ---------------------------------
         Her çizgi `pathLength="100"` taşıyor; gerçek uzunluğu ne olursa
         olsun `stroke-dasharray: 100` + `stroke-dashoffset: 100 → 0` onu
         baştan sona ÇİZİYOR. Opaklık kullanılmadı (md.2): görünür olan
         şey çizginin uzunluğu, saydamlığı değil.

         Kesikli PLAN rotası (04) dışarıda: o zaten "önceden çizilmiş
         plan", karenin gelişiyle birlikte orada olması doğru. Çizilen
         şey planın üstündeki bakır GİDİLEN hat.

         Çizim payları adımın kendi okuma durağına yazıldı; bölüm
         uzatılmadı. */
      .sr-ov path { transform-box: view-box; }
      .sr-ov path:not(.sr-kesik) { stroke-dasharray: 100; }
      .sr-kesim { display: block; z-index: 20; }

      /* 01 · GİRİŞ ÖLÇÜM KAPISI — raylar merkezden açılıp yerine oturuyor,
         sonra eşik datumu boydan boya çiziliyor. */
      .sr-h-r1 { animation-name: sr-01-r1; }
      .sr-h-r2 { animation-name: sr-01-r2; }
      .sr-h-dt { animation-name: sr-01-dt; }
      @keyframes sr-01-r1 {
        0% {
          stroke-dashoffset: 100;
          transform: translate(24px, 0);
          animation-timing-function: cubic-bezier(0.3, 0, 0.1, 1);
        }
        9%, 100% { stroke-dashoffset: 0; transform: translate(0, 0); }
      }
      @keyframes sr-01-r2 {
        0% {
          stroke-dashoffset: 100;
          transform: translate(-24px, 0);
          animation-timing-function: cubic-bezier(0.3, 0, 0.1, 1);
        }
        9%, 100% { stroke-dashoffset: 0; transform: translate(0, 0); }
      }
      @keyframes sr-01-dt {
        0%, 4% { stroke-dashoffset: 100; animation-timing-function: cubic-bezier(0.3, 0, 0.1, 1); }
        10%, 100% { stroke-dashoffset: 0; }
      }

      /* 02 · KORUMA ZARFI — önce dört açık köşe guard oturuyor, sonra
         onları ilişkilendiren ince bağlayıcılar, en son tek bakır bant
         dikişi soldan sağa geçiyor. Kapalı bir kutu hiç çizilmiyor. */
      .sr-h-zk { animation-name: sr-02-zk; }
      .sr-h-zb { animation-name: sr-02-zb; }
      .sr-h-sm { animation-name: sr-02-sm; }
      @keyframes sr-02-zk {
        0%, 21% { stroke-dashoffset: 100; animation-timing-function: cubic-bezier(0.3, 0, 0.1, 1); }
        27%, 100% { stroke-dashoffset: 0; }
      }
      @keyframes sr-02-zb {
        0%, 25% { stroke-dashoffset: 100; animation-timing-function: cubic-bezier(0.3, 0, 0.1, 1); }
        30%, 100% { stroke-dashoffset: 0; }
      }
      @keyframes sr-02-sm {
        0%, 26% { stroke-dashoffset: 100; animation-timing-function: cubic-bezier(0.3, 0, 0.1, 1); }
        32%, 100% { stroke-dashoffset: 0; }
      }

      /* 03 · BAĞLANTI — üç düğüm önce merkezde toplu, sonra kendi montaj
         eksenleriyle birlikte ±10 birim ayrışıyor. Bakır bağlantı hattı bu
         ayrışmanın üstüne, ana hareket olarak çiziliyor: anlatılan şey
         parçaların kendisi değil, aralarındaki ilişki. */
      .sr-h-d1 { animation-name: sr-03-d1; }
      .sr-h-d2 { animation-name: sr-03-d2; }
      .sr-h-d3 { animation-name: sr-03-d3; }
      .sr-h-bh { animation-name: sr-03-bh; }
      @keyframes sr-03-d1 {
        0%, 43% {
          stroke-dashoffset: 100;
          transform: translate(10px, 0);
          animation-timing-function: cubic-bezier(0.3, 0, 0.1, 1);
        }
        48% {
          stroke-dashoffset: 0;
          transform: translate(10px, 0);
          animation-timing-function: cubic-bezier(0.35, 0, 0.15, 1);
        }
        54%, 100% { stroke-dashoffset: 0; transform: translate(0, 0); }
      }
      @keyframes sr-03-d2 {
        0%, 43% { stroke-dashoffset: 100; animation-timing-function: cubic-bezier(0.3, 0, 0.1, 1); }
        48%, 100% { stroke-dashoffset: 0; }
      }
      @keyframes sr-03-d3 {
        0%, 43% {
          stroke-dashoffset: 100;
          transform: translate(-10px, 0);
          animation-timing-function: cubic-bezier(0.3, 0, 0.1, 1);
        }
        48% {
          stroke-dashoffset: 0;
          transform: translate(-10px, 0);
          animation-timing-function: cubic-bezier(0.35, 0, 0.15, 1);
        }
        54%, 100% { stroke-dashoffset: 0; transform: translate(0, 0); }
      }
      @keyframes sr-03-bh {
        0%, 45% { stroke-dashoffset: 100; animation-timing-function: cubic-bezier(0.25, 0, 0.2, 1); }
        54%, 100% { stroke-dashoffset: 0; }
      }

      /* 04 · ROTA — bölümün en güçlü bakır kullanımı. Kesikli plan kareyle
         birlikte orada; gidilen hat kadrajın yatayda %84'ünü kat ederek
         gerçekten ÇİZİLİYOR ve son yatay kolunda duruyor. Ok ucu oturunca
         o kol bir sonraki devrin kesim hattı oluyor. */
      .sr-h-rn { animation-name: sr-04-rn; }
      .sr-h-rt { animation-name: sr-04-rt; }
      .sr-h-rb { animation-name: sr-04-rb; }
      @keyframes sr-04-rn {
        0%, 65% { stroke-dashoffset: 100; animation-timing-function: cubic-bezier(0.3, 0, 0.1, 1); }
        68%, 100% { stroke-dashoffset: 0; }
      }
      @keyframes sr-04-rt {
        0%, 66% { stroke-dashoffset: 100; animation-timing-function: cubic-bezier(0.25, 0, 0.2, 1); }
        75%, 100% { stroke-dashoffset: 0; }
      }
      @keyframes sr-04-rb {
        0%, 74.5% { stroke-dashoffset: 100; animation-timing-function: cubic-bezier(0.3, 0, 0.1, 1); }
        76.5%, 100% { stroke-dashoffset: 0; }
      }

      /* 05 · YERLEŞİM — nişangâh yok. Zemin datumu çiziliyor, iki hizalama
         ekseni dışarıdan içeri hizalanıyor, üç oturma noktası sırayla
         datuma iniyor. Sıçrama yok; son nokta %96,5'te yerini alıyor ve
         kalan pay kısa bir duruş. */
      .sr-h-fd { animation-name: sr-05-fd; }
      .sr-h-a1 { animation-name: sr-05-a1; }
      .sr-h-a2 { animation-name: sr-05-a2; }
      .sr-h-ah { animation-name: sr-05-ah; }
      .sr-h-n1 { animation-name: sr-05-n1; }
      .sr-h-n2 { animation-name: sr-05-n2; }
      .sr-h-n3 { animation-name: sr-05-n3; }
      @keyframes sr-05-fd {
        0%, 87% { stroke-dashoffset: 100; animation-timing-function: cubic-bezier(0.3, 0, 0.1, 1); }
        91%, 100% { stroke-dashoffset: 0; }
      }
      @keyframes sr-05-a1 {
        0%, 87% {
          stroke-dashoffset: 100;
          transform: translate(-7px, -4px);
          animation-timing-function: cubic-bezier(0.3, 0, 0.1, 1);
        }
        92%, 100% { stroke-dashoffset: 0; transform: translate(0, 0); }
      }
      @keyframes sr-05-a2 {
        0%, 87% {
          stroke-dashoffset: 100;
          transform: translate(7px, -4px);
          animation-timing-function: cubic-bezier(0.3, 0, 0.1, 1);
        }
        92%, 100% { stroke-dashoffset: 0; transform: translate(0, 0); }
      }
      @keyframes sr-05-ah {
        0%, 88% { stroke-dashoffset: 100; animation-timing-function: cubic-bezier(0.3, 0, 0.1, 1); }
        93%, 100% { stroke-dashoffset: 0; }
      }
      @keyframes sr-05-n1 {
        0%, 91% {
          stroke-dashoffset: 100;
          transform: translate(0, -7px);
          animation-timing-function: cubic-bezier(0.3, 0, 0.15, 1);
        }
        93.5%, 100% { stroke-dashoffset: 0; transform: translate(0, 0); }
      }
      @keyframes sr-05-n2 {
        0%, 92.5% {
          stroke-dashoffset: 100;
          transform: translate(0, -7px);
          animation-timing-function: cubic-bezier(0.3, 0, 0.15, 1);
        }
        95%, 100% { stroke-dashoffset: 0; transform: translate(0, 0); }
      }
      @keyframes sr-05-n3 {
        0%, 94% {
          stroke-dashoffset: 100;
          transform: translate(0, -7px);
          animation-timing-function: cubic-bezier(0.3, 0, 0.15, 1);
        }
        96.5%, 100% { stroke-dashoffset: 0; transform: translate(0, 0); }
      }

      /* `uzat` — aktif adımın kolu açılıyor, numarası sinyale dönüyor.
         Aynı anda tek numara bakır: aksan kıtlığı korunuyor. */
      .sr-centik:nth-child(2) .sr-centik-kol { animation-name: sr-kol-1; }
      .sr-centik:nth-child(3) .sr-centik-kol { animation-name: sr-kol-2; }
      .sr-centik:nth-child(4) .sr-centik-kol { animation-name: sr-kol-3; }
      .sr-centik:nth-child(5) .sr-centik-kol { animation-name: sr-kol-4; }
      .sr-centik:nth-child(6) .sr-centik-kol { animation-name: sr-kol-5; }
      .sr-centik:nth-child(2) .sr-centik-no { animation-name: sr-no-1; }
      .sr-centik:nth-child(3) .sr-centik-no { animation-name: sr-no-2; }
      .sr-centik:nth-child(4) .sr-centik-no { animation-name: sr-no-3; }
      .sr-centik:nth-child(5) .sr-centik-no { animation-name: sr-no-4; }
      .sr-centik:nth-child(6) .sr-centik-no { animation-name: sr-no-5; }
      @keyframes sr-kol-1 { 0%,11% { transform: scaleX(1); } 20%,100% { transform: scaleX(0.45); } }
      @keyframes sr-kol-2 { 0%,11% { transform: scaleX(0.45); } 20%,33% { transform: scaleX(1); } 42%,100% { transform: scaleX(0.45); } }
      @keyframes sr-kol-3 { 0%,33% { transform: scaleX(0.45); } 42%,55% { transform: scaleX(1); } 64%,100% { transform: scaleX(0.45); } }
      @keyframes sr-kol-4 { 0%,55% { transform: scaleX(0.45); } 64%,77% { transform: scaleX(1); } 86%,100% { transform: scaleX(0.45); } }
      @keyframes sr-kol-5 { 0%,77% { transform: scaleX(0.45); } 86%,100% { transform: scaleX(1); } }
      @keyframes sr-no-1 { 0%,11% { color: rgb(var(--c-signal)); } 20%,100% { color: rgb(var(--c-ink-soft)); } }
      @keyframes sr-no-2 { 0%,11% { color: rgb(var(--c-ink-soft)); } 20%,33% { color: rgb(var(--c-signal)); } 42%,100% { color: rgb(var(--c-ink-soft)); } }
      @keyframes sr-no-3 { 0%,33% { color: rgb(var(--c-ink-soft)); } 42%,55% { color: rgb(var(--c-signal)); } 64%,100% { color: rgb(var(--c-ink-soft)); } }
      @keyframes sr-no-4 { 0%,55% { color: rgb(var(--c-ink-soft)); } 64%,77% { color: rgb(var(--c-signal)); } 86%,100% { color: rgb(var(--c-ink-soft)); } }
      @keyframes sr-no-5 { 0%,77% { color: rgb(var(--c-ink-soft)); } 86%,100% { color: rgb(var(--c-signal)); } }
    }
  }
}
</style>
