<script setup>
/**
 * KAPANIŞ ÇAĞRISI — sayfanın son bandı.
 *
 * NEDEN VAR
 * Ana sayfa daha önce SSS'nin ardından doğrudan footer'a düşüyordu: 10
 * bölüm boyunca kurulan güvenin sonunda net bir "şimdi şunu yapın" cümlesi
 * yoktu. Hero'daki çağrıyı gören ama o an harekete geçmeyen ziyaretçi,
 * sayfanın sonuna geldiğinde ikinci bir fırsat bulamıyordu.
 *
 * VERİ KAYNAĞI — M6'DA DEĞİŞTİ
 * Buton metni ve hedefi eskiden `HeroPage.primaryButton`/`primaryLink`
 * alanlarından geliyordu. HeroPage'in kalan 10 alanının herkese açık
 * tüketicisi yoktu; iki alan için 12 alanlık bir "Hero" paneli canlıymış
 * gibi duruyor ve yöneticiye ana sayfayı oradan yönettiğini
 * düşündürüyordu — oysa ana sayfa M4'ten beri HeroPage'i hiç okumuyor.
 *
 * Alanlar Site Ayarları'na taşındı (`ctaLabel` / `ctaLink`). Doğal sahip
 * orası: telefon, WhatsApp ve adres de orada duruyor. Değerler birebir
 * kopyalandı, görünen metin ve adres DEĞİŞMEDİ.
 *
 * İSTEK SAYISI DA AZALDI: bu bileşen artık `/api/hero` çağırmıyor; Site
 * Ayarları isteği zaten sayfa düzeni tarafından yapılıyor ve anahtarla
 * paylaşılıyor.
 *
 * İKİNCİ BUTON — koşullu
 * SSS bölümünün yapışkan kartı da "Bize Ulaşın" diyerek /iletisim'e
 * gidiyor. İki bölüm arka arkaya AYNI eylemi tekrarlamasın diye buradaki
 * ikinci buton doğrudan ARAMA eylemi: Site Ayarları'nda telefon girildiği
 * anda görünür, girilmediğinde hiç render edilmez (çalışmayan bir tel:
 * bağlantısı göstermek yerine).
 */
import { computed } from 'vue'

const { settings, brandName } = await useSiteSettings()

// YEDEK METİN DEĞİŞTİ — İDDİA TAŞIYORDU.
//
// Eskisi 'Ücretsiz Keşif Talep Et' idi. M6'da devir yapılırken yedeğin
// bilerek DEĞİŞTİRİLMEDİĞİ not düşülmüştü: ayar boşalırsa sayfa sessizce
// başka bir şey göstermesin diye. O gerekçe hâlâ doğru, ama yedek metnin
// kendisi doğrulanmamış bir ücret taahhüdü taşıyordu — ve yedek, ayar
// satırı silindiği anda gerçekten ekrana çıkan metin oluyor.
//
// Yeni yedek, Site Ayarları'ndaki yeni değerle AYNI: iki yol da aynı şeyi
// söylüyor, yani ayar boşalsa bile ekranda bir değişiklik olmuyor. İkinci
// bir metin kaynağı üretilmedi; bu hâlâ tek satırlık bir yedek.
const buttonText = computed(() => settings.value?.ctaLabel || 'Keşif Talebi')
const buttonLink = computed(() => settings.value?.ctaLink || '/iletisim')

const phone = computed(() => settings.value?.phone || settings.value?.mobilePhone || '')
/** tel: bağlantısı için boşluk/parantez temizliği. */
const phoneHref = computed(() => `tel:${phone.value.replace(/[^\d+]/g, '')}`)

const sectionRef = ref(null)
useReveal(sectionRef)
</script>

<template>
  <!-- Koyu zeminde odak halkasını beyaza çeviren `on-dark` sınıfı burada elle
       yazılıyordu; artık `tone="brand"` ile birlikte geliyor
       (bkz. ui/Section.vue) — unutulma ihtimali kalmasın diye tona taşındı. -->
  <ui-section
    ref="sectionRef"
    tone="brand"
    labelledby="kapanis-baslik"
    class="final-cta"
  >
    <div class="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h2 id="kapanis-baslik" data-reveal="blur" class="text-h2">
        Taşınma gününüzü bugünden planlayalım
      </h2>

      <!--
        ÜÇ İDDİA ÇIKARILDI. Eski metin şuydu:
        "Ücretsiz keşifle eşyalarınızı yerinde görüyor, size yazılı ve kesin
         bir fiyat veriyoruz. Teklif taşıma gününe kadar geçerli kalır."

        · "Ücretsiz keşif"          — ücret taahhüdü
        · "kesin bir fiyat"         — fiyat garantisi
        · "taşıma gününe kadar geçerli" — fiyat kilidi

        Üçünü de destekleyen bir iş kaydı depoda yok. Kalan cümle yalnız
        yapılan işi anlatıyor: keşifte eşya yerinde görülüyor ve çıkan plan
        yazıya dökülüyor.

        Bu bölüm bugün YALNIZ İstanbul dışı bölge sayfalarında basılıyor
        (bkz. pages/[...slug].vue) ve o sayfaların tamamı yayından çekildi.
        Yani metin şu an kimseye görünmüyor — ama şablon yeniden
        kullanılabilir olduğu için iddia burada bırakılmadı.
      -->
      <p data-reveal class="mt-5 text-pretty text-lead text-white/75">
        Keşifte eşyalarınızı yerinde görüyor, taşıma planını ve fiyatı
        yazılı olarak paylaşıyoruz.
      </p>

      <div data-reveal-group class="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <ui-button
          data-reveal
          :to="buttonLink"
          variant="secondary"
          size="lg"
          magnetic
          trailing-icon="arrow-right"
        >
          {{ buttonText }}
        </ui-button>

        <!-- Numara ETİKETİN BAŞINDA: butonun görünen yazısı da o. Önce marka
             adı geliyordu; eşleşme çalışıyordu ama sesle kontrol kullanan
             kişi komutunu söylerken gereksiz gecikme oluşuyordu. -->
        <ui-button
          v-if="phone"
          data-reveal
          :href="phoneHref"
          variant="white-outline"
          size="lg"
          icon="phone"
          :aria-label="`${phone} numarasını ara — ${brandName}`"
        >
          {{ phone }}
        </ui-button>
      </div>
    </div>
  </ui-section>
</template>

<style scoped>
/* Düz koyu bir dikdörtgen yerine merkezden dışa açılan yumuşak bir ışık.
   Tek bir radial-gradient; hareket eden ya da dikkat dağıtan bir öğe yok. */
.final-cta {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.final-cta::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(60% 80% at 50% 0%, rgb(var(--c-brand-600) / 0.45), transparent 70%),
    radial-gradient(40% 60% at 85% 100%, rgb(var(--c-accent-400) / 0.12), transparent 70%);
}
</style>
