<script setup>
/**
 * HİZMETLER — `ledger` kompozisyonu.
 *
 * ANA FİKİR
 * Hizmetler ayrı ürün kartları değil, aynı operasyonun farklı yetkinlikleri.
 * Bu yüzden her hizmet bir "kart" değil, aynı defterdeki bir SATIR. Kutu,
 * ikon, gölge, yarıçap, rozet, satır başına buton — hiçbiri yok. Ayırma
 * işini yalnız çizgi, boşluk, hizalama, sıra numarası ve tipografi yapıyor.
 *
 * DEFTER HİSSİNİ VEREN ŞEY: ASILI RAKAM
 * Sıra numarası hizmet adının solunda, KENDİ SÜTUNUNDA duruyor; ad sütunu
 * boyunca kesintisiz bir omurga oluşuyor. Basılı defterdeki asılı rakam
 * düzeni bu. Rakamlar çizgilerin İÇİNDE kaldığı için marj notu gibi değil,
 * kaydın parçası gibi okunuyor.
 *
 * NEDEN TABLO GİBİ DURMUYOR
 *   · dikey çizgi YOK — hücre ızgarası kurulmuyor
 *   · yatay çizgiler tek ağırlıkta değil: defteri AÇAN çizgi bir tık koyu
 *     (--c-measure), satır ayraçları en açık ton (--c-rule). Yedi çizginin
 *     hepsi aynı olsaydı elektronik tablo olurdu.
 *   · açıklama sütunu sağ kenara kadar gitmiyor; 12. kolon boş bırakılıyor
 *
 * RENK — aksan kıtlığı
 * Bakır (--c-signal) bu bölümde HİÇ kullanılmıyor. Altı sıra numarasının
 * hepsi bakır olsaydı Hero'daki tek vurgunun değeri düşerdi. Numaralar
 * ölçü tonunda; bölümün karakterini renk değil ölçek ve çizgi kuruyor.
 *
 * HAREKET YOK
 * `yerleş` fiili düşünüldü ve kullanılmadı. Altı satırın sırayla gelmesi
 * tam olarak sözleşmenin ve brief'in yasakladığı "ritim olsun diye
 * stagger". Sıra numaraları zaten okuma sırasını veriyor; hareketin
 * ekleyeceği bir anlam yok. Sayfanın koreografi bütçesi `stage`'de.
 *
 * LİNKLENEBİLİRLİK
 * Hizmet başına detay rotası HENÜZ YOK (yalnız tekil /hizmetlerimiz var),
 * bu yüzden sahte URL eklenmedi. Yapı buna hazır: her satırın içi tek bir
 * başlık + tek bir paragraf, iç içe etkileşimli öğe yok. Rota geldiğinde
 * `.lg-ic` sarmalayıcısını `<NuxtLink>` yapmak yeterli — satırın tamamı
 * tek bir bağlantı olur, hover/focus stilleri o zaman eklenir.
 *
 * İÇERİK
 * DEĞERLENDİRME METNİdir. Final hizmet envanteri, SEO metni ve service
 * architecture kararı bu turda VERİLMEDİ.
 */

/**
 * ICERIK KAYNAGI — `Service` TABLOSU. TEK ENVANTER.
 *
 * Bu bolumde alti hizmet SABIT YAZILIYDI ve veri tabanindaki hizmet
 * kayitlarindan bagimsizdi: ikisi (asansorlu nakliyat, esya depolama)
 * burada hic gorunmuyordu, biri (mobilya sokum ve kurulum) ise hicbir
 * hizmet kaydina karsilik gelmiyordu. Yani ana sayfa kendi hizmet
 * envanterini tasiyordu ve /hizmetlerimiz ile sessizce ayrismisti.
 *
 * Artik defter YAYINDAKI hizmetleri oldugu gibi listeliyor. Taslak hizmet
 * girmiyor (suzgec sunucuda), `slice(0, 6)` gibi gizli bir is kurali yok:
 * yonetici hangi hizmetin ana sayfada oldugunu Hizmetler panelindeki yayin
 * durumundan goruyor.
 *
 * BAGLANTI BORCU KAPANDI. Eski notta "hizmet basina detay rotasi henuz yok,
 * bu yuzden sahte URL eklenmedi" yaziyordu; rotalar var (kok adresler:
 * /evden-eve-nakliyat gibi) ve satirin adi artik bir baglanti.
 */
const props = defineProps({
  bolum: { type: Object, required: true },
  hizmetler: { type: Array, required: true },
})

const satirlar = computed(() =>
  props.hizmetler.map((h, i) => ({
    no: String(i + 1).padStart(2, '0'),
    ad: h.title,
    acik: h.excerpt,
    yol: `/${h.slug}`,
  }))
)
</script>

<template>
  <section class="lg" aria-labelledby="hizmetler-baslik">
    <div class="lg-alan">
      <h2 id="hizmetler-baslik" class="lg-h2">{{ bolum.heading }}</h2>

      <!--
        `ul` — `ol` DEĞİL. Sıra numaraları bir sıralama iddiası taşımıyor
        (ne öncelik ne adım sırası); defter kaydı numarasıdır, yani görsel
        bir araç. Bu yüzden numaralar `aria-hidden`: ekran okuyucuya
        "01 Evden Eve Nakliyat" diye okunmalarının bir faydası yok.

        `role="list"` gerekli: `list-style: none` verilen listelerde Safari
        + VoiceOver liste anlamını düşürüyor.
      -->
      <ul class="lg-liste" role="list">
        <li v-for="h in satirlar" :key="h.yol" class="lg-satir">
          <span class="lg-no" aria-hidden="true">{{ h.no }}</span>
          <h3 class="lg-ad"><NuxtLink :to="h.yol" class="lg-bag">{{ h.ad }}</NuxtLink></h3>
          <p class="lg-acik">{{ h.acik }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.lg {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}

.lg-alan {
  /* Ölçekler tek yerde: numaranın ve açıklamanın dikey konumu hizmet adının
     punto/satır yüksekliğinden HESAPLANIYOR. Elle px verilmiyor. */
  --lg-ad-punto: clamp(1.3125rem, 1.05rem + 1vw, 1.875rem);
  --lg-ad-satir: 1.15;
  --lg-no-punto: 0.75rem;
  --lg-no-satir: 1.4;
  --lg-acik-punto: clamp(0.875rem, 0.84rem + 0.16vw, 0.9375rem);
  --lg-acik-satir: 1.6;

  max-width: var(--container-wide);
  margin: 0 auto;
  padding: clamp(3.5rem, 2.25rem + 4vw, 6.5rem) clamp(1.25rem, 0.5rem + 3vw, 4rem);
}

.lg-h2 {
  font-size: clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
  font-weight: 700;
  margin: 0 0 clamp(1.75rem, 1.25rem + 1.6vw, 3rem);
  max-width: 20ch;
  text-wrap: balance;
}

/* ---- Defter ------------------------------------------------------------
   AÇAN çizgi bir tık koyu: defterin başladığı yeri işaretliyor, yani bilgi
   taşıyor. Satır ayraçları en açık tonda ve hepsi eşit — ritim buradan
   geliyor, bakışı hizmet adlarından çalmıyorlar. */
.lg-liste {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid rgb(var(--c-measure));
}

.lg-satir {
  border-bottom: 1px solid rgb(var(--c-rule));
  padding: clamp(1.125rem, 0.85rem + 0.9vw, 1.75rem) 0;

  /* MOBİL — asılı rakam korunuyor ama açıklama adın ALTINA iniyor.
     Masaüstünün daraltılmışı değil: orada açıklama kendi sütununda, adın
     sağında duruyor. Rakamı kendi satırına almak altı satırda ~130px
     boşa gidiyordu; asılı düzen hem daha sıkı hem daha okunur. */
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: clamp(0.75rem, 0.5rem + 1vw, 1.25rem);
}

.lg-no {
  grid-column: 1;
  grid-row: 1;
  font-family: var(--f-mono);
  font-size: var(--lg-no-punto);
  line-height: var(--lg-no-satir);
  letter-spacing: 0.1em;
  /* DENETİM DÜZELTMESİ: metin olarak 3,5:1 yetmiyordu → 6,54:1.
     Çizgi sistemi (`--c-measure` açan çizgi, `--c-rule` ayraçlar) aynen
     duruyor. */
  color: rgb(var(--c-ink-soft));
  /* Adın ilk satırının optik ortasına iniyor. */
  margin-top: calc(
    (var(--lg-ad-punto) * var(--lg-ad-satir) - var(--lg-no-punto) * var(--lg-no-satir)) / 2
  );
}

.lg-ad {
  grid-column: 2;
  grid-row: 1;
  font-size: var(--lg-ad-punto);
  line-height: var(--lg-ad-satir);
  letter-spacing: -0.018em;
  /* 600 — Hero H1 ve Vaat H2 700. Güçlü ama onlarla yarışmıyor. */
  font-weight: 600;
  margin: 0;
}

/* HİZMET ADI ARTIK BAĞLANTI.
   Defterin sakinliği bozulmasın diye durağan hâlde hiçbir işaret yok:
   renk mürekkep tonunda, alt çizgi yok. Ayrım imleç üstüne gelince ve
   klavyeyle odaklanınca çıkıyor — ikisi de kalıcı bir görsel gürültü
   eklemeden bağlantıyı bulunabilir kılıyor. */
.lg-bag {
  color: inherit;
  text-decoration: none;
}
.lg-bag:hover,
.lg-bag:focus-visible {
  text-decoration: underline;
  text-underline-offset: 0.18em;
  text-decoration-thickness: 1px;
}

.lg-acik {
  grid-column: 2;
  grid-row: 2;
  font-size: var(--lg-acik-punto);
  line-height: var(--lg-acik-satir);
  color: rgb(var(--c-ink-soft));
  margin: 0.5rem 0 0;
  max-width: 52ch;
  text-wrap: pretty;
}

/* ===========================================================================
   MASAÜSTÜ — açıklama kendi sütununa geçiyor, satır tek hizaya oturuyor
   ======================================================================== */
@media (min-width: 1024px) {
  .lg-h2 {
    /* Ad sütunuyla aynı sol kenarda değil: başlık defterin dışında,
       sayfa kenarında duruyor. Defteri açan çizgi ikisini ayırıyor. */
    max-width: 24ch;
  }

  .lg-satir {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: clamp(1rem, 0.5rem + 1.5vw, 2rem);
    align-items: start;
  }
  .lg-no {
    grid-column: 1;
    /* Rakam kendi sütununun SAĞINA yaslanıyor. Sola yaslandığında sütunun
       94px'lik ölü boşluğu rakamı adın uzağına atıyor ve sayfa numarası
       gibi okunuyordu; envanter kaydında numara girdinin önüne yapışır. */
    justify-self: end;
  }
  .lg-ad {
    grid-column: 2 / 7;
  }
  .lg-acik {
    grid-column: 7 / 12; /* 12. kolon boş — sağ kenar nefes alıyor */
    grid-row: 1;
    margin-top: calc(
      (var(--lg-ad-punto) * var(--lg-ad-satir) - var(--lg-acik-punto) * var(--lg-acik-satir)) / 2
    );
  }
}
</style>
