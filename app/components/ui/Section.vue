<script setup>
/**
 * UiSection — sayfa ritmini tek noktadan yöneten kap.
 *
 * ÇÖZDÜĞÜ SORUN
 * Önceden dikey boşluk İKİ yerden geliyordu: pages/index.vue her bölüme
 * `mb-20 mt-20` veriyordu, bölümlerin kendisi de ayrıca `py-16 md:py-24`
 * taşıyordu. Bu ikisi breakpoint'lerde birbirini tutmuyordu ve Hero'da
 * `-mt-10` gibi düzeltme hack'leri gerekiyordu.
 *
 * Artık kural net: dikey boşluk YALNIZCA bu component'ten gelir
 * (--space-section token'ı, akışkan clamp değeri).
 *
 * ERİŞİLEBİLİRLİK
 * `labelledby` verildiğinde <section aria-labelledby> üretilir; ekran
 * okuyucu bölümü başlığıyla anons eder. Başlık yoksa `label` ile düz metin
 * etiket verilebilir.
 */
import { computed } from 'vue'

const props = defineProps({
  /**
   * Bölüm zemini. Ana sayfada bölümler dönüşümlü olarak 'default' (gövde
   * zemini) ve 'surface' (beyaz) kullanır; bu bantlama, ayırıcı çizgi
   * çizmeye gerek kalmadan bölümleri birbirinden ayırır.
   */
  tone: {
    type: String,
    default: 'default', // 'default' | 'surface' | 'sunken' | 'brand' | 'none'
    validator: (v) => ['default', 'surface', 'sunken', 'brand', 'none'].includes(v),
  },
  /** Dikey boşluk ölçüsü */
  size: {
    type: String,
    default: 'default', // 'default' | 'compact' | 'flush'
    validator: (v) => ['default', 'compact', 'flush'].includes(v),
  },
  /** İçerik genişliği */
  width: {
    type: String,
    default: 'container', // 'container' | 'wide' | 'full'
    validator: (v) => ['container', 'wide', 'full'].includes(v),
  },
  /** aria-labelledby için başlık elemanının id'si */
  labelledby: { type: String, default: undefined },
  /** Başlık yoksa kullanılacak düz metin etiket */
  label: { type: String, default: undefined },
})

const toneClass = computed(
  () =>
    ({
      default: '',
      surface: 'bg-surface',
      sunken: 'bg-surface-sunken',
      // `on-dark` TONA DAHİL: global odak halkası marka yeşili ve koyu zeminde
      // görünmüyor. Öncesinde bunu her çağıran ayrıca eklemek zorundaydı
      // (FinalCta ekliyordu, unutan bir bölüm sessizce erişilemez olurdu).
      brand: 'bg-brand-900 text-ink-inverse on-dark',
      none: '',
    })[props.tone]
)

const sizeClass = computed(
  () =>
    ({
      default: 'py-section',
      compact: 'py-section-sm',
      flush: '',
    })[props.size]
)

const widthClass = computed(
  () =>
    ({
      container: 'container',
      wide: 'mx-auto w-full max-w-wide px-gutter',
      full: 'w-full',
    })[props.width]
)
</script>

<template>
  <!-- `data-yuzey` TONDAN TÜRETİLİYOR, elle yazılmıyor.
       `brand` tonunun zemini `--c-brand-900` (34 32 29) — pratikte
       mürekkep. Yapışkan bar kâğıt zeminli olduğu için bu bölümlerin
       üstüne geldiğinde açık bir şerit olarak kalıyordu; bar niteliği
       görüp tonunu alıyor (bkz. components/fixed/Navbar.vue).
       Ana sayfanın Kapanış bloğu aynı niteliği kendi şablonunda
       taşıyor — o bileşen ui-section kullanmıyor. -->
  <section
    :class="[toneClass, sizeClass]"
    :data-yuzey="tone === 'brand' ? 'koyu' : undefined"
    :aria-labelledby="labelledby"
    :aria-label="labelledby ? undefined : label"
  >
    <div :class="widthClass">
      <slot />
    </div>
  </section>
</template>
