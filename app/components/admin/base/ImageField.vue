<script setup>
/**
 * GÖRSEL ALANI — İKİ YOL: YENİ YÜKLE ya da KÜTÜPHANEDEN SEÇ.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NEDEN İKİNCİ BİR YÜKLEYİCİ YAZILMADI
 *
 * Yükleme zinciri zaten var ve çalışıyor: `FileUploader` tarayıcıda varyant
 * üretiyor, `POST /api/files` onları kaydediyor. Bu bileşen o zincire
 * DOKUNMUYOR — yanına ikinci bir yol ekliyor: daha önce yüklenmiş bir
 * görseli tekrar seçmek.
 *
 * Kazanılan şey somut: aynı fotoğrafı iki ayrı sayfada kullanmak için
 * ikinci kez yüklemek gerekmiyor. Önceden her kullanım yeni dosya, yeni
 * varyant seti ve yeni disk alanı demekti.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ALT METİN BURADA YOK — BİLEREK
 *
 * Kütüphane DOSYA seçer, alt metni içerik sahibi saklar. Aynı fotoğraf ana
 * sayfada başka, hakkımızda sayfasında başka bir şey anlatabilir; tek bir
 * global alt metni her yere kopyalamak yanlış olurdu. Alt metin alanı
 * içeriğin yanında, bu bileşenin dışında duruyor.
 */
import { computed, ref } from 'vue'

const props = defineProps({
  id: { type: String, default: '' },
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const kutuphaneAcik = ref(false)
const gorseller = ref([])
const arama = ref('')
const yukleniyor = ref(false)
const hata = ref('')

const deger = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

/** Kaynak koddaki statik varlık mı? Kütüphane onun sahibi değil. */
const statikMi = computed(() => String(props.modelValue || '').startsWith('/images/'))

const kutuphaneyiGetir = async () => {
  yukleniyor.value = true
  hata.value = ''
  try {
    const q = new URLSearchParams({ sayfaBoyu: '48' })
    if (arama.value.trim()) q.set('arama', arama.value.trim())
    const cevap = await $fetch(`/api/medya?${q}`)
    if (cevap?.success) gorseller.value = cevap.data.items
    else hata.value = cevap?.error || 'Kütüphane alınamadı'
  } catch (e) {
    hata.value = e?.data?.message || e?.message || 'Kütüphane alınamadı'
  } finally {
    yukleniyor.value = false
  }
}

const kutuphaneyiAc = async () => {
  kutuphaneAcik.value = true
  if (!gorseller.value.length) await kutuphaneyiGetir()
}

const sec = (g) => {
  deger.value = g.yol
  kutuphaneAcik.value = false
}

const yuklendi = (url) => {
  deger.value = url
}
</script>

<template>
  <div class="rounded border border-gray-200 bg-gray-50 p-3">
    <div class="flex flex-wrap items-start gap-3">
      <img
        v-if="deger"
        :src="deger"
        alt=""
        class="h-20 w-28 rounded border bg-white object-cover"
      />
      <div
        v-else
        class="flex h-20 w-28 items-center justify-center rounded border border-dashed bg-white text-xs text-gray-400"
      >
        görsel yok
      </div>

      <div class="min-w-0 flex-1">
        <!-- Yol DÜZ METİN gösteriliyor; elle de düzenlenebiliyor. -->
        <input
          :id="id"
          v-model="deger"
          type="text"
          class="w-full rounded border border-gray-300 p-2 text-xs"
          placeholder="/images/… veya /yuklemeler/…"
        />
        <p v-if="statikMi" class="mt-1 text-[11px] text-gray-500">
          Bu, kaynak kodla gelen sabit bir görsel. Medya kütüphanesi onu
          silemez; değiştirmek isterseniz kütüphaneden başka bir görsel seçin.
        </p>

        <div class="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded border border-blue-300 px-3 py-1 text-xs text-blue-700 hover:bg-blue-50"
            @click="kutuphaneyiAc"
          >
            Kütüphaneden seç
          </button>
          <button
            v-if="deger"
            type="button"
            class="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
            @click="deger = ''"
          >
            Kaldır
          </button>
        </div>
      </div>
    </div>

    <!-- MEVCUT YÜKLEYİCİ — değiştirilmedi, yalnız yanına seçim eklendi. -->
    <div class="mt-3 border-t border-gray-200 pt-3">
      <FileUploader @file-uploaded="yuklendi" />
    </div>

    <!-- KÜTÜPHANE SEÇİCİ -->
    <div v-if="kutuphaneAcik" class="mt-3 rounded border border-blue-300 bg-white p-3">
      <div class="mb-3 flex items-center gap-2">
        <input
          v-model="arama"
          type="search"
          placeholder="Ara…"
          class="flex-1 rounded border border-gray-300 p-2 text-xs"
          @keyup.enter="kutuphaneyiGetir"
        />
        <button type="button" class="rounded border px-3 py-1 text-xs" @click="kutuphaneyiGetir">Ara</button>
        <button type="button" class="rounded border px-3 py-1 text-xs" @click="kutuphaneAcik = false">
          Kapat
        </button>
      </div>

      <p v-if="hata" class="mb-2 text-xs text-red-700">{{ hata }}</p>
      <p v-if="yukleniyor" class="py-6 text-center text-xs text-gray-500">Yükleniyor…</p>
      <p v-else-if="!gorseller.length" class="py-6 text-center text-xs text-gray-500">
        Görsel bulunamadı.
      </p>

      <div v-else class="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto md:grid-cols-6">
        <button
          v-for="g in gorseller"
          :key="g.anahtar"
          type="button"
          class="overflow-hidden rounded border text-left hover:border-blue-500"
          :class="deger === g.yol ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'"
          @click="sec(g)"
        >
          <img :src="g.yol" alt="" class="h-16 w-full object-cover" loading="lazy" />
          <!-- Dosya adı DÜZ METİN. `v-html` YOK. -->
          <span class="block truncate p-1 text-[10px] text-gray-600" :title="g.originalName">
            {{ g.originalName }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
