<script setup>
/**
 * 404 / HATA SAYFASI — EDİTORYAL YÜZEY.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NEDEN YENİDEN YAZILDI
 *
 * Bu dosya sitenin son Tailwind adasıydı: `rounded-3xl` kutu, `shadow-2xl`,
 * eski yeşil `bg-primary`, hover'da büyüyen yuvarlak ikon. Yani yeni dilin
 * yasakladığı ne varsa (kart, gölge, yarıçap, eski palet) hepsi tek
 * ekrandaydı.
 *
 * Marjinal bir yüzey olduğu sürece bu bir borçtu. Yarışma sürümünde coğrafi
 * sayfa ağı kapatılınca BİRİNCİ SINIF yüzey oldu: `/bolgelerimiz`, 39 ilçe
 * ve 473 mahalle adresi buraya iniyor (bkz. composables/useRegionPages.ts).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * METİN NEDEN DEĞİŞTİ
 *
 * Eski cümle "Aradığınız içerik kaldırılmış veya taşınmış olabilir" diyordu.
 * Coğrafi sayfalar SİLİNMEDİ, TAŞINMADI da — kayıtlar, CMS ve rotalar
 * yerinde, yalnız public görünürlük kapalı. Yanlış bilgi vermemek için
 * cümle nötrleştirildi: adresin bu sürümde kullanılmadığını söylüyor,
 * sebebini anlatmıyor.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * KOMPOZİSYON — SOLDA CÜMLE, SAĞDA KAYIT
 *
 * Sağ kolon dekor değil: gerçekten istenen adresi ve dönen durum kodunu
 * yazan bir KAYIT FİŞİ. Mono katmanı sitede yalnız gerçek metadata için
 * kullanılıyor (bkz. assets/css/sahne.css → `.op-kunye`); burada tam olarak
 * o iş yapılıyor. Yeni görsel üretilmedi, yeni renk üretilmedi; tek yapısal
 * araç sitenin ölçü çizgisi.
 *
 * KART / GÖLGE / YARIÇAP / CAM YOK. JS animasyonu yok.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NAVBAR VE ALT BİLGİ BİLEREK YOK — DAVRANIŞ DEĞİŞMEDİ
 *
 * `error.vue` düzenin (layout) dışında render ediliyor; bu dosya
 * `<NuxtLayout>` sarmalamıyor, yani eskisi gibi kendi başına bir yüzey.
 * Bilerek böyle bırakıldı:
 *   · Düzen sarmalanırsa alt bilgi bu yüzeye de gelir; alt bilginin
 *     yerleşimi az önce ölçülerek düzeltilmiş bir konu (bkz.
 *     layouts/default.vue) ve hata yüzeyi o mekanizmayı sınamak için
 *     doğru yer değil.
 *   · Alt bilgi ~15 bağlantı ve bir telefon taşıyor. Bu sayfanın işi
 *     ziyaretçiyi İKİ net çıkışa yönlendirmek; onun altına bir bağlantı
 *     ızgarası koymak kararı sulandırırdı.
 * Sonuç: sayfa tek ekranlık bir sahne, iki çıkışı var.
 */
const props = defineProps({
  error: {
    type: Object,
    required: true,
  },
});

const durum = computed(() => Number(props.error?.statusCode) || 500);
const is404 = computed(() => durum.value === 404);

/**
 * İSTENEN ADRES — kayıt fişinin tek gerçek verisi.
 *
 * Kaynak `error.url`; sunucu tarafında bu alan yoksa geçerli rota.
 * Yüzde kodlaması çözülüyor (okunabilirlik), çözülemezse ham hâli
 * kullanılıyor. Uzun adresler kırpılıyor: kırpılmasaydı elle yazılmış
 * çok uzun bir adres sağ kolonu sayfanın dışına taşırdı.
 *
 * Metin Vue tarafından kaçırılıyor (escape); adres ekrana yalnız METİN
 * olarak yazılıyor, bağlantıya çevrilmiyor.
 */
const rota = useRoute();
const adres = computed(() => {
  const ham = String(props.error?.url || rota.fullPath || "/");
  let metin = ham;
  try {
    metin = decodeURI(ham);
  } catch {
    /* bozuk yüzde kodlaması: ham hâli yazılır */
  }
  return metin.length > 48 ? `${metin.slice(0, 47)}…` : metin;
});

const kunye = computed(() =>
  is404.value ? "404 / ROTA BULUNAMADI" : `${durum.value} / İSTEK TAMAMLANAMADI`,
);

const baslik = computed(() =>
  is404.value ? "Bu adres şu anda açık değil." : "Sayfa şu anda görüntülenemiyor.",
);

const aciklama = computed(() =>
  is404.value
    ? "Aradığınız sayfa bu sürümde kullanılmıyor. Ana sayfadan devam edebilir veya hizmetleri inceleyebilirsiniz."
    : "Beklenmeyen bir hata oluştu. Birkaç dakika sonra tekrar deneyebilirsiniz.",
);

// Hata sayfasının BAŞLIĞI YOKTU: tarayıcı sekmesinde ve yer imlerinde boş
// görünüyordu. `noindex` de ekleniyor — 404 durum kodu zaten dizine
// eklenmesini engelliyor ama 500 gibi diğer hatalarda bu güvence kalmıyor.
// CANONICAL VE YAPISAL VERİ YOK: hata yüzeyi dizine girecek bir sayfa
// değil, kendini başka bir adresin kanoniği ilan edemez.
useHead({
  title: computed(() => (is404.value ? "Sayfa Bulunamadı" : "Bir Hata Oluştu")),
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

/**
 * Hata durumu TEMİZLENEREK gidiliyor.
 *
 * `NuxtLink` kullanılmadı: hata durumu Nuxt'ta uygulama seviyesinde tutuluyor
 * ve yalnız `clearError` onu düşürüyor. Yine de gerçek `href` yazılı —
 * bağlantı klavyeyle odaklanabiliyor, yeni sekmede açılabiliyor ve JS
 * çalışmadan da hedefine gidiyor.
 */
const git = (yol) => clearError({ redirect: yol });
</script>

<template>
  <div class="ht">
    <main class="ht-alan sahne-alan">
      <p class="ht-kunye op-kunye">{{ kunye }}</p>

      <div class="ht-metin">
        <h1 class="ht-h1 tip-baslik">{{ baslik }}</h1>
        <p class="ht-giris tip-giris">{{ aciklama }}</p>

        <!-- İKİ ÇIKIŞ, DAHA FAZLASI DEĞİL. İletişim üçüncü düğme olarak
             eklenmedi: hata yüzeyinin işi yönlendirmek, dönüşüm değil. -->
        <div class="ht-eylem">
          <a href="/" class="op-eylem" @click.prevent="git('/')">Ana sayfaya dön</a>
          <a
            href="/hizmetlerimiz"
            class="op-bag op-bag--sakin"
            @click.prevent="git('/hizmetlerimiz')"
            >Hizmetleri incele</a
          >
        </div>
      </div>

      <!-- KAYIT FİŞİ — terim/değer ilişkisi olduğu için `dl`.
           Üst çizgi `--c-measure`: bilgi taşıyan çizgi dekoratif tonda
           çizilmez (bkz. assets/css/tokens.css). -->
      <dl class="ht-kayit">
        <div class="ht-satir">
          <dt>İSTENEN ADRES</dt>
          <dd class="ht-adres">{{ adres }}</dd>
        </div>
        <div class="ht-satir ht-satir--durum">
          <dt>DURUM</dt>
          <dd class="ht-durum">{{ durum }}</dd>
        </div>
      </dl>
    </main>
  </div>
</template>

<style scoped>
.ht {
  min-height: 100svh;
  display: grid;
  /* Dikeyde ortalanıyor ama içerik ekrandan uzunsa kutu büyüyor —
     360px'te kırpılma olmuyor. */
  align-content: center;
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}

.ht-alan {
  /* Tek ekranlık sahne: dikey pay perde ölçüsünde DEĞİL, bir kademe
     altında. Ortalanmış kısa bir kompozisyonda perde ölçüsü içeriği
     ekranın dışına itiyordu. */
  padding-block: var(--sahne-dikey);
  width: 100%;
}

.ht-kunye {
  margin-bottom: clamp(1.25rem, 1rem + 1vw, 2rem);
}

.ht-h1 {
  max-width: 15ch;
}

.ht-giris {
  margin: clamp(1.25rem, 1rem + 0.8vw, 1.75rem) 0 0;
}

.ht-eylem {
  margin-top: clamp(2rem, 1.5rem + 1.6vw, 3rem);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  /* Satır atladığında iki eylem birbirine yapışmasın. */
  gap: clamp(1.25rem, 0.9rem + 1.4vw, 2.5rem);
}

/* ---- KAYIT FİŞİ --------------------------------------------------------
   Mono katmanı: sitede yalnız gerçek metadata için. Burada yazılan iki
   değer de gerçek — istenen adres ve dönen durum kodu. */
.ht-kayit {
  margin: clamp(2.5rem, 2rem + 2vw, 4rem) 0 0;
  max-width: 26rem;
  padding-top: clamp(0.85rem, 0.7rem + 0.5vw, 1.15rem);
  border-top: 1px solid rgb(var(--c-measure));
}

.ht-satir + .ht-satir {
  margin-top: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem);
  padding-top: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem);
  border-top: 1px solid rgb(var(--c-rule));
}

.ht-satir dt {
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  /* `--c-measure` DEĞİL: kâğıt üzerinde 3,51 — UI çizgisi için yeterli,
     METİN için değil. `--c-ink-soft` 6,54. (Aynı gerekçe: Kapsam.vue) */
  color: rgb(var(--c-ink-soft));
}

.ht-satir dd {
  margin: 0.375rem 0 0;
  font-family: var(--f-mono);
  font-size: 0.9375rem;
  line-height: 1.5;
  color: rgb(var(--c-ink));
}

/* Elle yazılmış uzun bir adres kabı yarmasın; kırpma zaten script
   tarafında var, bu ikinci güvence. */
.ht-adres {
  overflow-wrap: anywhere;
}

.ht-satir--durum {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}
.ht-satir--durum dd {
  margin-top: 0;
}
.ht-durum {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}

/* ===========================================================================
   MASAÜSTÜ — künye üstte, cümle solda, kayıt sağda
   ───────────────────────────────────────────────────────────────────────
   Sahne ekseni korunuyor: metin B ekseninden (kol 2) başlıyor, kayıt
   D alanına (kol 9–13) düşüyor.
   ======================================================================== */
@media (min-width: 1024px) {
  .ht-alan {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    row-gap: clamp(2rem, 1.5rem + 2vw, 3.5rem);
    align-items: start;
  }

  .ht-kunye {
    grid-column: 1 / 13;
    grid-row: 1;
    margin-bottom: 0;
  }

  .ht-metin {
    grid-column: 2 / 8;
    grid-row: 2;
  }

  .ht-kayit {
    grid-column: 9 / 13;
    grid-row: 2;
    margin-top: 0;
    max-width: none;
  }
}
</style>
