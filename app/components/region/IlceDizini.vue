<script setup>
/**
 * İLÇE DİZİNİ — `/bolgelerimiz` gövdesi.
 *
 * KANONİK HİYERARŞİ
 *     İSTANBUL → 39 İLÇE → MAHALLELER
 * Bu bileşen ORTA katmanı gösteriyor. Mahalle keşfi ilçe sayfasında yaşıyor;
 * burada yalnız "bu ilçenin altında mahalle kırılımı var" bilgisi ve birkaç
 * örnek ad var. Yüzlerce mahalle bağlantısını tek duvara basmak dizini
 * gezilemez hâle getirir ve gezinme sırasını bozar.
 *
 * NEDEN KART DEĞİL, KÜTÜK
 * Eski sayfa il başına yuvarlak köşeli kart basıyordu. 39 eş kart, 39 eş
 * ağırlık demek — göz hiçbirine tutunamaz. Kütükte numara, ad ve mahalle
 * örnekleri ayrı eksenlerde; göz tek sütunda aşağı inip ilçe adlarını
 * tarıyor. `/hizmetlerimiz` dizinindeki dille aynı.
 *
 * ARAMA KUTUSU YOK — ÖLÇÜLDÜ, GEREKMEDİ
 * 39 kayıt iki yakaya bölünüp Türkçe alfabetik sıraya girdiğinde en uzun
 * grup 25 satır. Bu, kaydırmadan taranabilir bir uzunluk. Sırf modern
 * görünsün diye istemci JS'i eklemek, sayfanın tek işini (yönlendirme)
 * yavaşlatmaktan başka bir şey yapmıyordu.
 *
 * PASİF İLÇE SATIRLARI
 * 39 ilçe kaydının tamamı var ve içerikçe eşit dolu. Yayında olmayan bir
 * ilçenin rotası 404 olduğu için BAĞLANTI VERİLMİYOR —
 * uydurma rota üretmektense satır bağlantısız duruyor ve durumu mono
 * etiketle açıkça söylüyor. Bağlantı verilip verilmeyeceği veriden
 * (`aktif`) okunuyor: kayıtlar aktifleştirildiği an dizin kod değişmeden
 * 39/39 bağlantılı hâle geliyor.
 *
 * YAKA EŞLEMESİ TEK YERDE
 * `Region` modelinde yaka alanı yok. Eşleme `shared/utils/istanbul.ts`
 * içindeki `istanbulYakalari`nda — sunucu da aynı listeyi okuyor, bu
 * bileşene kopyalanmadı. Eşlemede
 * bulunmayan bir kayıt SESSİZCE DÜŞMÜYOR, "Diğer" başlığı altında
 * görünüyor; aksi hâlde yanlış yazılmış tek bir slug bir ilçeyi dizinden
 * tamamen silerdi.
 */
const props = defineProps({
  /** `InternalPageSection('bolgeler', 'dizin')` — yalnız editoryal metin.
      İlçe listesi ve sayıları bölge kayıtlarından geliyor. */
  bolum: { type: Object, default: () => ({}) },

  ilceler: { type: Array, default: () => [] },
  /** Yayındaki (kendi sayfası olan) mahallelerin toplamı. */
  mahalleKaydi: { type: Number, default: 0 },
})

const siralayici = new Intl.Collator('tr-TR')

/** Yakalar + eşlemede olmayan kayıtlar için emniyet grubu. */
const yakalar = computed(() => {
  const kalan = new Map(props.ilceler.map((i) => [i.slug, i]))

  const gruplar = istanbulYakalari.map((yaka) => {
    const uyeler = []
    yaka.sluglar.forEach((slug) => {
      const kayit = kalan.get(slug)
      if (!kayit) return
      uyeler.push(kayit)
      kalan.delete(slug)
    })
    return { anahtar: yaka.anahtar, ad: yaka.ad, ilceler: uyeler }
  })

  if (kalan.size) {
    gruplar.push({ anahtar: 'diger', ad: 'Diğer İlçeler', ilceler: [...kalan.values()] })
  }

  return gruplar
    .filter((g) => g.ilceler.length)
    .map((g) => ({
      ...g,
      ilceler: [...g.ilceler]
        .sort((a, b) => siralayici.compare(a.ad, b.ad))
        .map((ilce, i) => ({ ...ilce, no: String(i + 1).padStart(2, '0') })),
    }))
})

/** Üstteki sayı bandı — hepsi veriden, hiçbiri elle yazılmıyor. */
const olcumler = computed(() => [
  { deger: props.ilceler.length, etiket: 'İLÇE' },
  ...yakalar.value.map((y) => ({ deger: y.ilceler.length, etiket: y.ad.toLocaleUpperCase('tr-TR') })),
  { deger: props.mahalleKaydi, etiket: 'MAHALLE SAYFASI' },
])
</script>

<template>
  <section class="id-kap" aria-labelledby="ilce-dizini-baslik">
    <div class="id sahne-alan">
      <p class="id-kunye op-kunye">01 / COĞRAFİ DİZİN</p>
      <h2 id="ilce-dizini-baslik" class="id-h2 tip-anlati">{{ bolum.heading }}</h2>
      <p v-if="bolum.lead" class="id-giris tip-giris">{{ bolum.lead }}</p>

      <!-- Sayı bandı: coğrafi kapsamı tek bakışta veren yapısal an. -->
      <dl class="id-olcum">
        <div v-for="o in olcumler" :key="o.etiket" class="id-olcum-oge">
          <dt class="id-olcum-etiket op-kunye">{{ o.etiket }}</dt>
          <dd class="id-olcum-deger tip-alt">{{ o.deger }}</dd>
        </div>
      </dl>

      <div class="id-yakalar">
        <section
          v-for="yaka in yakalar"
          :key="yaka.anahtar"
          class="id-yaka"
          :aria-labelledby="`yaka-${yaka.anahtar}`"
        >
          <div class="id-yaka-bas">
            <h3 :id="`yaka-${yaka.anahtar}`" class="id-yaka-ad tip-alt">{{ yaka.ad }}</h3>
            <p class="id-yaka-sayi op-kunye">{{ yaka.ilceler.length }} İLÇE</p>
          </div>

          <!--
            İlçe adları BAŞLIK DEĞİL, liste öğesi. 39 başlık, sayfanın başlık
            hiyerarşisini gerçek bölümlerin okunamayacağı kadar şişirirdi;
            bağlantı dizini için sıralı liste zaten doğru semantik.
          -->
          <ol class="id-liste">
            <li
              v-for="ilce in yaka.ilceler"
              :key="ilce.slug"
              class="id-satir"
              :class="{ 'id-satir--pasif': !ilce.aktif }"
            >
              <p class="id-no op-kunye">{{ ilce.no }}</p>

              <div class="id-govde">
                <p class="id-ad tip-alt">
                  <NuxtLink v-if="ilce.aktif" :to="`/${ilce.slug}`" class="id-bag">{{
                    ilce.ad
                  }}</NuxtLink>
                  <span v-else>{{ ilce.ad }}</span>
                </p>
                <p class="id-durum op-kunye">
                  <span v-if="ilce.mahalleSayisi">{{ ilce.mahalleSayisi }} MAHALLE SAYFASI</span>
                  <span v-if="!ilce.aktif" class="id-bekleyen">SAYFA HAZIRLANIYOR</span>
                </p>
              </div>

              <p v-if="ilce.mahalleler.length" class="id-mahalle tip-not">
                {{ ilce.mahalleler.join(' · ') }}
              </p>
            </li>
          </ol>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.id-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}
.id {
  padding-block: var(--sahne-dikey);
}
.id-kunye {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.id-h2 {
  max-width: 16ch;
}
.id-giris {
  margin: clamp(1rem, 0.85rem + 0.6vw, 1.5rem) 0 0;
  max-width: var(--olcu-govde);
}

/* ---- Sayı bandı -------------------------------------------------------- */
.id-olcum {
  margin: clamp(2.5rem, 2rem + 2vw, 4rem) 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem clamp(1rem, 0.5rem + 2vw, 3rem);
}
.id-olcum-oge {
  border-top: 1px solid rgb(var(--c-rule));
  padding-top: 0.75rem;
}
.id-olcum-etiket {
  margin: 0;
  color: rgb(var(--c-ink-soft));
}
.id-olcum-deger {
  margin: 0.25rem 0 0;
  font-variant-numeric: tabular-nums;
}

/* ---- Yaka grupları ----------------------------------------------------- */
.id-yakalar {
  margin-top: clamp(3rem, 2.25rem + 3vw, 5.5rem);
  display: grid;
  gap: clamp(3rem, 2.25rem + 3vw, 5rem);
}
.id-yaka-bas {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgb(var(--c-ink));
}
.id-yaka-ad {
  margin: 0;
}
.id-yaka-sayi {
  margin: 0;
  color: rgb(var(--c-ink-soft));
  white-space: nowrap;
}

/* ---- İlçe satırları ---------------------------------------------------- */
.id-liste {
  list-style: none;
  margin: 0;
  padding: 0;
}
/* Ayraç ÜSTTE değil ALTTA: yaka başlığının kalın çizgisi zaten ilk satırın
   üstünü kapatıyor, üstte olsaydı iki çizgi üst üste binerdi. */
/* YOĞUNLUK ÖLÇÜLDÜ. 39 satır tek sütunda dizildiği için satır başına
   düşen her piksel 39 kez tekrarlıyor; dizin 1440'ta 3.2 metreye yakın
   sürüyordu. Dikey pay ve ad/durum arası daraltıldı — punto ve dokunma
   hedefi (aşağıdaki `::after` kaplaması) korunarak. */
.id-satir {
  position: relative;
  border-bottom: 1px solid rgb(var(--c-rule));
  padding-block: clamp(0.875rem, 0.75rem + 0.45vw, 1.1875rem);
}

/* `--c-measure` METİN OLARAK KULLANILMIYOR: kâğıt üzerinde 3,51:1 veriyor,
   AA eşiği 4,5:1. (Aynı tuzağa navbar'da da düşülmüştü.) O token yalnız
   çizgi/ayraç rengi; sayı bir metin, `--c-ink-soft` ile 6,34:1. */
.id-no {
  margin: 0;
  color: rgb(var(--c-ink-soft));
  font-variant-numeric: tabular-nums;
}
/* Ad + mahalle sayısı hücresi bağlantının dokunma hedefi (aşağıdaki
   `::after`). Konumlandırma referansı burada. */
.id-govde {
  position: relative;
}
.id-ad {
  margin: 0.25rem 0 0;
}
/* Bağlantı ilçe ADININ KENDİSİ — ok işareti değil, ok işaretleri hem küçük
   hem de ekran okuyucuda adsız kalıyor. */
/* KALICI ALT ÇİZGİ KALKTI.
   39 satırın 39'u da durağan hâlde altı çizili duruyordu; dizin bir
   bağlantı listesinden çok işaretlenmiş bir metne benziyordu ve sayfanın
   en yoğun görsel gürültüsü buydu. Hizmetler defteri (`.lg-bag`) aynı
   soruyu zaten çözmüştü: durağan hâlde işaret yok, ayrım imleç ve klavye
   ile geliyor. Dizin o dile hizalandı.

   İŞARET RENKTEN İBARET DEĞİL (WCAG 1.4.1): hover/odakta hem adın altı
   çiziliyor hem satır numarası bakıra dönüyor — iki ayrı sinyal. Satırın
   tamamı zaten tıklanabilir (aşağıdaki kaplama), yani hedefi bulmak için
   çizgiye ihtiyaç yok. */
.id-bag {
  color: inherit;
  text-decoration: none;
  transition: color var(--dur-fast) var(--ease-out);
}
/*
  DOKUNMA HEDEFİ — ölçüldü: ad metni 390px'te 71×21px, yani parmak için
  gereken 44px'in yarısı. Alt çizgi metne ait olduğu için bağlantıya dikey
  iç boşluk vermek çizgiyi metinden koparıyordu.

  Çözüm: bağlantının tıklanabilir alanı, adın ve mahalle sayısının
  bulunduğu hücrenin TAMAMINA yayılıyor — görünüş hiç değişmeden. Kaplama
  yalnız hücreyi örtüyor, mahalle örneklerini değil: o metin seçilebilir
  kalıyor. Pasif satırlarda `.id-bag` hiç basılmadığı için kaplama da yok.

  DİKEY PAY EKLENDİ (`inset: -0.5rem 0`). Hücrenin kendisi her satırda
  55px değil: 39 ilçenin 36'sında "N MAHALLE SAYFASI" satırı hiç
  basılmıyor ve hücre yalnız addan ibaret kalıyor. Ölçüldü — kaplamasız
  hâlde 1440'ta 34px, 390'da 28px. 8px'lik pay ikisini de 44px'in üstüne
  çıkarıyor ve satırın kendi dikey payının (≥14px) içinde kaldığı için
  komşu satırın metnini örtmüyor.
*/
.id-bag::after {
  content: '';
  position: absolute;
  inset: -0.5rem 0;
}
.id-bag:hover,
.id-bag:focus-visible {
  text-decoration: underline;
  text-underline-offset: 0.18em;
  text-decoration-thickness: 1px;
}
/* İkinci sinyal: satırın numarası. `:has()` desteklenmeyen bir tarayıcıda
   yalnız bu vurgu düşer, alt çizgi yerinde kalır. */
.id-satir:has(.id-bag:hover) .id-no,
.id-satir:has(.id-bag:focus-visible) .id-no {
  color: rgb(var(--c-signal));
}
.id-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}

.id-durum {
  margin: 0.25rem 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.75rem;
  color: rgb(var(--c-ink-soft));
}
/* Durum etiketi rengine DEĞİL, ayrı bir sözcüğe dayanıyor: renk körlüğünde
   de "hazırlanıyor" okunuyor. */
.id-bekleyen::before {
  content: '·';
  margin-right: 0.75rem;
  color: rgb(var(--c-measure));
}
.id-satir--pasif .id-ad {
  color: rgb(var(--c-ink-soft));
}

.id-mahalle {
  margin: 0.5rem 0 0;
  color: rgb(var(--c-ink-soft));
}

/* ===========================================================================
   MASAÜSTÜ — numara (A) · ad ve durum (B) · mahalle örnekleri (D)
   ======================================================================== */
@media (min-width: 1024px) {
  .id {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .id-kunye {
    grid-column: 1 / 8;
  }
  .id-h2 {
    grid-column: 2 / 8;
  }
  .id-giris {
    grid-column: 9 / 13;
    align-self: end;
    margin: 0;
  }
  .id-olcum {
    grid-column: 1 / 13;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .id-yakalar {
    grid-column: 1 / 13;
  }

  .id-satir {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: baseline;
  }
  .id-no {
    grid-column: 1 / 2;
  }
  .id-govde {
    grid-column: 2 / 7;
  }
  .id-mahalle {
    grid-column: 7 / 13;
    margin-top: 0;
  }
  .id-ad {
    margin-top: 0;
  }
}
</style>
