<script setup>
/**
 * 05 / İSTANBUL ODAĞI — konumlandırma + sonraki adım.
 *
 * BU BÖLÜM BİR DÜZELTME.
 * Eski sayfa üç ayrı yerde "Türkiye genelinde 81 ilde hizmet veriyoruz"
 * diyordu: giriş paragrafında, tarihçede ve bir hizmet kartında. Ayrıca
 * "81 / İlde hizmet ağı" diye bir rakam kutusu vardı. Site artık bir
 * Türkiye dizini değil — kanonik yapı İSTANBUL → 39 İLÇE → MAHALLELER.
 * Konumlandırmayı sessizce silmek yetmezdi; sayfanın bunu açıkça
 * SÖYLEMESİ gerekiyordu.
 *
 * 39 SAYISI ELLE YAZILMIYOR. `shared/utils/istanbul.ts` içindeki yaka
 * tanımından sayılıyor — sitenin ilçe sınıflandırmasını yapan aynı kaynak.
 * Ağ isteği yok: /api/istanbul-ilceler yanıtı 5,8 KB ve buraya yalnız bir
 * sayı için gömülmesi gerekirdi.
 *
 * /BOLGELERIMIZ'İ TEKRARLAMIYOR: orası dizin ("ilçemi bul, tıkla"), burası
 * gerekçe ("neden yalnız bir şehir"). 39 ilçe BURADA DÖKÜLMÜYOR.
 */
import { istanbulYakalari } from '#shared/utils/istanbul'

const ilceSayisi = istanbulYakalari.reduce((toplam, yaka) => toplam + yaka.sluglar.length, 0)

/** İç sayfa içeriği — bkz. shared/utils/ic-sayfa.ts */
defineProps({
  bolum: { type: Object, default: () => ({}) },
})

/** Coğrafi sayfa ağı açık mı — bkz. composables/useRegionPages.ts. */
const bolgeAgiAcik = useRegionPages()
</script>

<template>
  <section class="ho-kap" aria-labelledby="odak-baslik">
    <div class="ho sahne-alan">
      <p class="ho-kunye op-kunye">05 / İSTANBUL ODAĞI</p>

      <h2 id="odak-baslik" class="ho-h2 tip-anlati">{{ bolum.heading }}</h2>

      <div class="ho-govde">
        <p v-if="bolum.lead" class="ho-metin tip-govde">{{ bolum.lead }}</p>
        <p class="ho-metin tip-govde">
          İstanbul'un {{ ilceSayisi }} ilçesinin tamamı için ayrı sayfa
          tutuyoruz; ilçe sayfalarından mahallelere iniliyor. Şehirler arası
          taşıma da yapıyoruz — ama bu, İstanbul dışında da yerel bir ekibimiz
          olduğu anlamına gelmiyor: o işlerde çıkış ya da varış adresi
          İstanbul oluyor.
        </p>
      </div>

      <!-- Cümlenin tamamı coğrafi ağa bağlı: tek bilgisi "o sayfada ilçe
           ilçe yazılı" olduğu için bağlantıyı çıkarıp cümleyi bırakmak
           olmayan bir yere işaret etmek olurdu. Ağ açıldığında geri
           geliyor (bkz. composables/useRegionPages.ts). -->
      <p v-if="bolgeAgiAcik" class="ho-bolge tip-govde">
        Hangi ilçede ne tür bir yapı dokusuyla karşılaştığımız
        <NuxtLink to="/bolgelerimiz" class="op-bag op-bag--sakin ho-bag"
          >hizmet bölgelerimiz</NuxtLink
        >
        sayfasında ilçe ilçe yazılı.
      </p>

      <!-- İLETİŞİM CÜMLESİ BURADAN ÇIKTI. Bu kutunun hemen altında artık
           sitenin ortak kapanış imzası var ve adresleri konuşma çağrısını
           o taşıyor; ikisi birlikte kalsaydı aynı sayfa sonunda iki kez
           "iletişim sayfasını kullanın" yazacaktı. -->
      <div class="ho-adim">
        <p class="ho-adim-kunye op-kunye">SONRAKİ ADIM</p>
        <p class="ho-adim-metin tip-govde">
          Taşınma tarihi yaklaşıyorsa sıradaki iş adresleri konuşmak. Eşya
          listesi üzerinden kaba bir aralık görmek için
          <NuxtLink to="/fiyat-hesaplama" class="op-bag op-bag--sakin ho-bag"
            >fiyat hesaplama</NuxtLink
          >
          sayfasını kullanabilirsiniz.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Sayfanın kapanışı çukur yüzeyde — bittiği belli oluyor. */
.ho-kap {
  background: rgb(var(--c-paper-sunken));
  color: rgb(var(--c-ink));
  border-top: 1px solid rgb(var(--c-rule));
}
.ho {
  padding-block: var(--sahne-dikey);
}
.ho-kunye {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.ho-h2 {
  max-width: 16ch;
}
.ho-govde {
  margin-top: clamp(1.5rem, 1.25rem + 1vw, 2.5rem);
}
.ho-metin {
  margin: 0;
  max-width: var(--olcu-govde);
}
.ho-metin + .ho-metin {
  margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}
.ho-bolge {
  margin: clamp(1.5rem, 1.25rem + 1vw, 2.25rem) 0 0;
  max-width: var(--olcu-govde);
}

.ho-adim {
  margin-top: clamp(2rem, 1.5rem + 1.5vw, 3rem);
  padding-top: clamp(1.25rem, 1rem + 1vw, 2rem);
  border-top: 1px solid rgb(var(--c-rule));
}
.ho-adim-kunye {
  margin: 0;
  color: rgb(var(--c-ink-soft));
}
.ho-adim-metin {
  margin: clamp(0.5rem, 0.4rem + 0.4vw, 0.875rem) 0 0;
  max-width: var(--olcu-govde);
}

/* Satır içi bağlantı: `.op-bag`ın 44 px taban yüksekliği cümle içinde
   alt çizgiyi metinden koparıyor (bkz. `.ba-bag`, `.sb-bag`). */
.ho-bag {
  min-height: 0;
  font-size: inherit;
  font-weight: 600;
  padding-bottom: 0.05em;
}

@media (min-width: 1024px) {
  .ho {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .ho-kunye {
    grid-column: 1 / 8;
  }
  .ho-h2 {
    grid-column: 2 / 7;
    grid-row: 2;
  }
  .ho-govde {
    grid-column: 8 / 13;
    grid-row: 2;
    margin-top: 0;
  }
  .ho-bolge {
    grid-column: 8 / 13;
    grid-row: 3;
    margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
  }
  .ho-adim {
    grid-column: 2 / 13;
    grid-row: 4;
  }
}
</style>
