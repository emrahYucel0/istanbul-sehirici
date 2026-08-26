<script setup>
/**
 * UiButton — tek buton bileşeni; bağlantı mı düğme mi olduğuna prop'lardan
 * karar verir.
 *
 *   <ui-button to="/iletisim" variant="primary">Teklif Al</ui-button>
 *   <ui-button href="tel:+90…" variant="outline" icon="phone">Ara</ui-button>
 *   <ui-button @click="submit" :loading="pending">Gönder</ui-button>
 *
 * Neden ayrı bir component: görsel stil zaten `.btn` sınıflarında (bkz.
 * assets/css/main.css) ama doğru ETİKETİ seçmek (NuxtLink / <a> / <button>),
 * ikon yerleşimi ve yükleniyor durumu her kullanımda elle tekrarlanıyordu.
 *
 * `magnetic` PROP'U KALDIRILDI. İmleci takip eden düğme, V2'nin ölçülü
 * editoryal dilinde karşılığı olmayan bir efektti; sayfadaki hiçbir eylem
 * artık düğme kutusu bile değil (bkz. `.op-eylem`, assets/css/sahne.css).
 * Tek kullanıcısı bu bileşendi, bileşenin tek kullanıcısı da render
 * edilmeyen `base/FinalCta.vue`; yani efekt hiçbir canlı sayfada
 * çalışmıyordu. `composables/useMagnetic.ts` bu turda silindi.
 *
 * Erişilebilirlik: yükleniyor durumunda `aria-busy` ve `disabled`; dış
 * bağlantılarda otomatik `rel="noopener noreferrer"`.
 */
import { computed, ref } from 'vue'

const props = defineProps({
  /** Uygulama içi rota — NuxtLink üretir */
  to: { type: [String, Object], default: undefined },
  /** Dış bağlantı / tel: / mailto: — <a> üretir */
  href: { type: String, default: undefined },
  variant: {
    type: String,
    default: 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'white-outline' | 'dark'
    validator: (v) =>
      ['primary', 'secondary', 'outline', 'ghost', 'white-outline', 'dark'].includes(v),
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md' | 'lg'
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  /** UiIcon adı — metnin soluna yerleşir */
  icon: { type: String, default: '' },
  /** UiIcon adı — metnin sağına yerleşir, hover'da hafifçe ilerler */
  trailingIcon: { type: String, default: '' },
  /** İmleci hafifçe takip etsin (yalnızca fare + reduced-motion kapalıysa) */
  block: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})

const el = ref(null)

const tag = computed(() => {
  if (props.to) return resolveComponent('NuxtLink')
  if (props.href) return 'a'
  return 'button'
})

/**
 * DİKKAT — sınıf adları burada AÇIKÇA yazılmalı.
 * Daha önce `btn-${props.variant}` şeklinde şablon dizesi kullanılıyordu;
 * Tailwind kaynak dosyaları düz metin olarak tarar ve çalışma zamanında
 * birleşen bu adları GÖREMEZ, dolayısıyla `.btn-secondary` gibi kurallar
 * üretilen CSS'e hiç girmiyordu (butonlar varsayılan koyu renkte
 * kalıyordu). Eşleme tablosu bu sınıfları taranabilir kılar.
 */
const VARIANT_CLASS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  'white-outline': 'btn-white-outline',
  dark: '',
}

const SIZE_CLASS = { sm: 'btn-sm', md: '', lg: 'btn-lg' }

const classes = computed(() => [
  'btn group',
  VARIANT_CLASS[props.variant],
  SIZE_CLASS[props.size],
  props.block && 'w-full',
  (props.disabled || props.loading) && 'pointer-events-none opacity-60',
])

const isExternal = computed(
  () => !!props.href && /^https?:\/\//i.test(props.href)
)

const attrs = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) {
    return {
      href: props.href,
      ...(isExternal.value ? { rel: 'noopener noreferrer', target: '_blank' } : {}),
    }
  }
  return {
    type: props.type,
    disabled: props.disabled || props.loading,
    'aria-busy': props.loading ? 'true' : undefined,
  }
})
</script>

<template>
  <component :is="tag" ref="el" v-bind="attrs" :class="classes">
    <ui-icon v-if="loading" name="clock" :size="18" class="animate-spin" />
    <ui-icon v-else-if="icon" :name="icon" :size="18" />

    <span><slot /></span>

    <ui-icon
      v-if="trailingIcon"
      :name="trailingIcon"
      :size="18"
      class="nudge-x"
    />
  </component>
</template>
