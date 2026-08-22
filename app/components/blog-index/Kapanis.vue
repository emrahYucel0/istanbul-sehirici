<script setup>
/**
 * BLOG DİZİNİ — KAPANIŞ.
 *
 * ESKİ SAYFANIN ALTINDA `base-region-carousel` VARDI VE KALDIRILDI.
 * O bileşen `/api/regions?light=true` çekiyordu: ölçüldü, **35 KB** ve
 * 70 kayıt — sayfanın tek en büyük yükü. Blog dizininin işi yazıları
 * taratmak; altına 70 bölge kaydı taşıyan bir kaydırak koymak hem konu
 * dışıydı hem de o kayıtların pazarlama metinlerini ("uzman ekibimizle",
 * "profesyonel nakliye hizmeti") blog sayfasına taşıyordu.
 *
 * Bileşen SİLİNMEDİ; yalnız bu sayfa kullanmayı bıraktı (başka kullanan
 * sayfa da yoktu — bkz. rapor).
 *
 * BÜYÜK KAPANIŞ ÇAĞRISI YOK. Kullanıcı dokuz yazıyı taradıktan sonra ikinci
 * bir hero görmemeli; kapanış tek cümle.
 */
</script>

<template>
  <section class="bk-kap" aria-labelledby="blog-kapanis">
    <div class="bk sahne-alan">
      <p id="blog-kapanis" class="bk-metin tip-govde">
        Yazılar genel durumları anlatıyor; sizin taşınmanızın koşulları
        adrese göre değişiyor. Kendi taşınmanızı konuşmak için
        <NuxtLink to="/iletisim" class="op-bag op-bag--sakin bk-bag">iletişim</NuxtLink>
        sayfasını kullanabilirsiniz.
      </p>
    </div>
  </section>
</template>

<style scoped>
.bk-kap {
  background: rgb(var(--c-paper-sunken));
  color: rgb(var(--c-ink));
  border-top: 1px solid rgb(var(--c-rule));
}
.bk {
  padding-block: var(--sahne-dikey);
}
.bk-metin {
  margin: 0;
  max-width: var(--olcu-govde);
}

/* `.op-bag`ın 44 px taban yüksekliği cümle içinde alt çizgiyi metinden
   koparıyor (bkz. `.ba-bag`, `.sb-bag`, `.ho-bag`, `.fs-bag`). */
.bk-bag {
  min-height: 0;
  font-size: inherit;
  font-weight: 600;
  padding-bottom: 0.05em;
}

@media (min-width: 1024px) {
  .bk {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .bk-metin {
    grid-column: 2 / 8;
  }
}
</style>
