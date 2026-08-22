<script setup>
/**
 * İLÇE NEDEN FARK EDER — dizinin altındaki kısa açıklama + sonraki adım.
 *
 * NEDEN KISA: bu sayfa bir DİZİN. Buraya bin kelimelik bir SEO metni
 * yazmak, ziyaretçinin tek işi olan "ilçemi bul, tıkla" akışını uzatır.
 * Anlamsal derinlik ilçe ve mahalle sayfalarında yaşıyor.
 *
 * ANA SAYFANIN "ÜÇ İSTANBUL" BÖLÜMÜNÜ TEKRARLAMIYOR. Orada üç koşul birer
 * paragrafla ve fotoğrafla anlatılıyor; burada aynı şey yeniden anlatılsa
 * sayfa ikinci bir ana sayfaya dönerdi. Bu bölüm başka bir soruyu
 * cevaplıyor: ilçe sayfasında NE YAZILI olduğunu.
 */
const MADDELER = [
  {
    etiket: 'SOKAK VE ARAÇ',
    metin: 'Aracın binaya kaç metre yanaşabildiği, sokağın tek yön ya da park dolu olup olmadığı.',
  },
  {
    etiket: 'BİNA GİRİŞİ',
    metin: 'Kapı genişliği, merdiven sahanlığının dönüşü, asansör kabininin iç ölçüsü.',
  },
  {
    etiket: 'KAT',
    metin: 'Asansörsüz her kat, ambalajlı parçanın elde taşındığı ayrı bir mesafe.',
  },
  {
    etiket: 'SİTE VE PLAZA',
    metin: 'Yönetimden alınan giriş izni ve saat kısıtı; randevusuz araç kapıda bekliyor.',
  },
]

/**
 * İÇERİK KAYNAĞI — `InternalPageSection('bolgeler', 'aciklama')`.
 *
 * Başlık ve açıklama paragrafı panelden. KAPANIŞ CÜMLESİ KODDA: içinde iki
 * sayfa içi bağlantı taşıyor, yani rota haritasının parçası.
 */
defineProps({
  bolum: { type: Object, default: () => ({}) },
})
</script>

<template>
  <section class="ba-kap" aria-labelledby="bolge-aciklama-baslik">
    <div class="ba sahne-alan">
      <p class="ba-kunye op-kunye">02 / İLÇE SAYFASINDA NE VAR</p>
      <h2 id="bolge-aciklama-baslik" class="ba-h2 tip-anlati">
        {{ bolum.heading }}
      </h2>

      <p v-if="bolum.lead" class="ba-govde tip-govde">{{ bolum.lead }}</p>

      <dl class="ba-liste">
        <div v-for="m in MADDELER" :key="m.etiket" class="ba-oge">
          <dt class="ba-etiket op-kunye">{{ m.etiket }}</dt>
          <dd class="ba-metin tip-not">{{ m.metin }}</dd>
        </div>
      </dl>

      <p class="ba-kapanis tip-govde">
        <!-- Hedef `/istanbul` idi. İstanbul'un ana otorite sayfası artık
             ana sayfanın kendisi; `/istanbul` oraya yönlendiriliyor ve
             bağlantı zincir üretmemek için doğrudan `/` gösteriyor. -->
        İstanbul'un tamamı için
        <NuxtLink to="/" class="op-bag op-bag--sakin ba-bag">İstanbul evden eve nakliyat</NuxtLink>
        sayfasına, taşımanın kapsamını merak ediyorsanız
        <NuxtLink to="/hizmetlerimiz" class="op-bag op-bag--sakin ba-bag">nakliyat hizmetlerimize</NuxtLink>
        bakabilirsiniz.
      </p>
    </div>
  </section>
</template>

<style scoped>
/* Çukur yüzey: dizinin kâğıt zemininden ayrılıyor, sayfanın sonu olduğu
   belli oluyor. Kart değil — kenarlık, köşe ve gölge yok. */
.ba-kap {
  background: rgb(var(--c-paper-sunken));
  color: rgb(var(--c-ink));
  border-top: 1px solid rgb(var(--c-rule));
}
.ba {
  padding-block: var(--sahne-dikey);
}
.ba-kunye {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.ba-h2 {
  max-width: 18ch;
}
.ba-govde {
  margin: clamp(1.25rem, 1rem + 0.8vw, 2rem) 0 0;
  max-width: var(--olcu-govde);
}

.ba-liste {
  margin: clamp(1.75rem, 1.5rem + 1vw, 2.75rem) 0 0;
  padding: 0;
  display: grid;
  gap: 0;
}
.ba-oge {
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem);
}
.ba-oge:last-child {
  border-bottom: 1px solid rgb(var(--c-rule));
}
.ba-etiket {
  margin: 0;
  color: rgb(var(--c-ink-soft));
}
.ba-metin {
  margin: 0.375rem 0 0;
  max-width: var(--olcu-govde);
}

.ba-kapanis {
  margin: clamp(1.75rem, 1.5rem + 1vw, 2.5rem) 0 0;
  max-width: var(--olcu-govde);
}

/* `.op-bag` tek başına duran bir eylem bağlantısı için tasarlandı: 44px
   taban yüksekliği ve 0,25rem alt boşluk. Cümlenin İÇİNDE kullanılınca o
   ölçüler satır aralığını açıyor ve alt çizgi metinden kopup bir sonraki
   satırın üstünde başıboş bir çizgi gibi duruyordu. Satır içi kullanım
   metnin kendi ölçüsüne dönüyor — dokunma hedefi burada da yeterli çünkü
   bağlantı gövde metni boyunda ve satır yüksekliği 1,7. */
.ba-bag {
  min-height: 0;
  font-size: inherit;
  font-weight: 600;
  padding-bottom: 0.05em;
}

@media (min-width: 1024px) {
  .ba {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .ba-kunye {
    grid-column: 1 / 8;
  }
  .ba-h2 {
    grid-column: 2 / 8;
  }
  .ba-govde {
    grid-column: 2 / 8;
  }
  .ba-liste {
    grid-column: 8 / 13;
    grid-row: 2 / 5;
    margin-top: 0;
  }
  .ba-kapanis {
    grid-column: 2 / 8;
  }
}
</style>
