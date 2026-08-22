<script setup>
/**
 * MEDYA KÜTÜPHANESİ.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NEYİN SAHİBİ, NEYİN DEĞİL
 *
 * Bu ekran YALNIZ yönetici yüklemelerinin (`yuklemeler/` + `StoredFile`)
 * sahibi. Kaynak koddaki `/images/...` varlıkları burada görünmüyor ve
 * buradan silinemiyor — onlar sürümle gelen dosyalar.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NEDEN "GÖRSEL" SAYISI DOSYA SAYISINDAN AZ
 *
 * Yükleyici her genişlik için ayrı bir dosya üretiyor (320/640/1024/2048) ve
 * her biri veri tabanında ayrı satır. Bu ekran onları MANTIKSAL GÖRSEL
 * olarak grupluyor: tek kart, tek kullanım durumu, tek silme işlemi.
 *
 * Aksi hâlde yayındaki bir görselin küçük varyantı "kullanılmıyor" görünür
 * ve silinebilirdi.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * SİLME BİR KULLANICI EYLEMİ
 *
 * Otomatik "yetim temizliği" YOK. "Veri tabanında referansı yok" her zaman
 * "dosya gereksiz" demek değil; karar yöneticinin.
 */
import { computed, onMounted, ref, watch } from 'vue'

const gorseller = ref([])
const ozet = ref({ gorsel: 0, dosya: 0, kullanilan: 0, kullanilmayan: 0, boyut: 0 })
const sayfa = ref(1)
const sayfaSayisi = ref(1)
const toplam = ref(0)
const arama = ref('')
const suzgec = ref('hepsi')
const yukleniyor = ref(true)
const hata = ref('')
const mesaj = ref('')
const secili = ref(null)

const kb = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`)
const tarih = (d) =>
  d ? new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const getir = async () => {
  yukleniyor.value = true
  hata.value = ''
  try {
    const q = new URLSearchParams({
      sayfa: String(sayfa.value),
      suzgec: suzgec.value,
    })
    if (arama.value.trim()) q.set('arama', arama.value.trim())

    const cevap = await $fetch(`/api/medya?${q}`)
    if (cevap?.success) {
      gorseller.value = cevap.data.items
      ozet.value = cevap.data.ozet
      sayfaSayisi.value = cevap.data.sayfaSayisi
      toplam.value = cevap.data.toplam
    } else {
      hata.value = cevap?.error || 'Kütüphane alınamadı'
    }
  } catch (e) {
    hata.value = e?.data?.message || e?.message || 'Kütüphane alınamadı'
  } finally {
    yukleniyor.value = false
  }
}

/** Arama yazarken her tuşta istek atmamak için küçük gecikme. */
let zamanlayici = null
watch(arama, () => {
  clearTimeout(zamanlayici)
  zamanlayici = setTimeout(() => {
    sayfa.value = 1
    getir()
  }, 350)
})

watch(suzgec, () => {
  sayfa.value = 1
  getir()
})

const sayfaDegistir = (yon) => {
  const yeni = sayfa.value + yon
  if (yeni < 1 || yeni > sayfaSayisi.value) return
  sayfa.value = yeni
  getir()
}

const sil = async (g) => {
  mesaj.value = ''
  hata.value = ''
  if (g.kullanimSayisi > 0) return
  if (!confirm(`"${g.originalName}" ve ${g.varyantlar.length} varyantı kalıcı olarak silinecek. Emin misiniz?`)) return

  try {
    const cevap = await $fetch('/api/medya', { method: 'DELETE', body: { anahtar: g.anahtar } })
    if (cevap?.success) {
      mesaj.value = cevap.message || 'Silindi.'
      secili.value = null
      await getir()
    } else {
      hata.value = cevap?.error || 'Silinemedi'
    }
  } catch (e) {
    hata.value = e?.data?.message || e?.message || 'Silinemedi'
  }
}

onMounted(getir)

const bosMu = computed(() => !yukleniyor.value && gorseller.value.length === 0)
</script>

<template>
  <section class="p-6">
    <admin-base-panel-durumu
      durum="canli"
      nerede="Buradaki dosyalar site genelinde içerik görsellerinde kullanılıyor. Kullanımdaki bir görsel silinemez."
    />

    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Medya Kütüphanesi</h1>
      <p class="mt-1 text-sm text-gray-500">
        Panelden yüklenmiş görseller. Kaynak kodla gelen
        <code class="rounded bg-gray-100 px-1">/images/…</code> dosyaları burada
        görünmez ve buradan silinemez.
      </p>
    </header>

    <!-- ÖZET — süzgeçten bağımsız genel sayım. -->
    <div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
      <div class="rounded border bg-white p-3">
        <div class="text-xs text-gray-500">Görsel</div>
        <div class="text-xl font-bold">{{ ozet.gorsel }}</div>
      </div>
      <div class="rounded border bg-white p-3">
        <div class="text-xs text-gray-500">Dosya (varyantlarla)</div>
        <div class="text-xl font-bold">{{ ozet.dosya }}</div>
      </div>
      <div class="rounded border bg-white p-3">
        <div class="text-xs text-gray-500">Kullanılıyor</div>
        <div class="text-xl font-bold text-green-700">{{ ozet.kullanilan }}</div>
      </div>
      <div class="rounded border bg-white p-3">
        <div class="text-xs text-gray-500">Kullanılmıyor</div>
        <div class="text-xl font-bold text-gray-600">{{ ozet.kullanilmayan }}</div>
      </div>
      <div class="rounded border bg-white p-3">
        <div class="text-xs text-gray-500">Toplam boyut</div>
        <div class="text-xl font-bold">{{ kb(ozet.boyut) }}</div>
      </div>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-3">
      <input
        v-model="arama"
        type="search"
        placeholder="Dosya adında ara…"
        class="w-64 rounded border border-gray-300 p-2 text-sm"
        aria-label="Görsellerde ara"
      />
      <select v-model="suzgec" class="rounded border border-gray-300 p-2 text-sm" aria-label="Kullanım süzgeci">
        <option value="hepsi">Hepsi</option>
        <option value="kullanilan">Yalnız kullanılanlar</option>
        <option value="kullanilmayan">Yalnız kullanılmayanlar</option>
      </select>
      <span class="text-sm text-gray-500">{{ toplam }} sonuç</span>
    </div>

    <p v-if="mesaj" class="mb-4 rounded bg-green-50 p-3 text-sm text-green-800">{{ mesaj }}</p>
    <p v-if="hata" class="mb-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">{{ hata }}</p>
    <p v-if="yukleniyor" class="py-10 text-center text-gray-500">Yükleniyor…</p>
    <p v-else-if="bosMu" class="rounded border bg-white py-10 text-center text-gray-500">
      Bu süzgeçle görsel bulunamadı.
    </p>

    <div v-else class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
      <div
        v-for="g in gorseller"
        :key="g.anahtar"
        class="overflow-hidden rounded border bg-white"
        :class="g.kullanimSayisi ? 'border-green-300' : 'border-gray-200'"
      >
        <button
          type="button"
          class="block w-full bg-gray-50"
          :aria-label="`${g.originalName} önizlemesini aç`"
          @click="secili = secili?.anahtar === g.anahtar ? null : g"
        >
          <img :src="g.yol" :alt="''" class="h-28 w-full object-cover" loading="lazy" />
        </button>

        <div class="p-2">
          <!-- DOSYA ADI DÜZ METİN. Ad kullanıcı denetiminde; `v-html` YOK. -->
          <p class="truncate text-xs font-semibold text-gray-800" :title="g.originalName">
            {{ g.originalName }}
          </p>
          <p class="mt-1 text-[11px] text-gray-500">
            {{ kb(g.toplamBoyut) }} · {{ g.varyantlar.length }} boyut · {{ tarih(g.createdAt) }}
          </p>
          <p class="mt-1">
            <span
              class="rounded px-1.5 py-0.5 text-[11px]"
              :class="g.kullanimSayisi ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
            >
              {{ g.kullanimSayisi ? `${g.kullanimSayisi} yerde kullanılıyor` : 'kullanılmıyor' }}
            </span>
          </p>

          <button
            type="button"
            class="mt-2 w-full rounded border px-2 py-1 text-xs"
            :class="
              g.kullanimSayisi
                ? 'cursor-not-allowed border-gray-200 text-gray-400'
                : 'border-red-300 text-red-700 hover:bg-red-50'
            "
            :disabled="g.kullanimSayisi > 0"
            :title="g.kullanimSayisi ? 'Kullanımdaki görsel silinemez' : 'Görseli ve varyantlarını sil'"
            @click="sil(g)"
          >
            Sil
          </button>
        </div>
      </div>
    </div>

    <!-- SEÇİLİ GÖRSEL — önizleme ve kullanım raporu. -->
    <div v-if="secili" class="mt-6 rounded border-2 border-blue-300 bg-blue-50 p-4">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          <h2 class="font-bold text-gray-900">{{ secili.originalName }}</h2>
          <p class="mt-1 break-all text-xs text-gray-600">{{ secili.yol }}</p>
          <p class="mt-2 text-xs text-gray-600">
            {{ secili.mimeType }} · {{ kb(secili.toplamBoyut) }} ·
            {{ secili.varyantlar.length }} varyant
          </p>
          <ul class="mt-2 space-y-0.5 text-[11px] text-gray-500">
            <li v-for="v in secili.varyantlar" :key="v.id">
              {{ v.genislik ? `${v.genislik}px` : 'ölçüsüz' }} · {{ kb(v.size) }} · {{ v.storedName }}
            </li>
          </ul>
        </div>
        <img :src="secili.yol" :alt="''" class="max-h-40 rounded border bg-white" />
      </div>

      <div class="mt-4">
        <h3 class="text-sm font-semibold text-gray-800">
          Nerede kullanılıyor? ({{ secili.kullanimSayisi }})
        </h3>
        <p v-if="!secili.kullanimSayisi" class="mt-1 text-sm text-gray-600">
          Hiçbir içerikte kullanılmıyor — silinebilir.
        </p>
        <ul v-else class="mt-1 space-y-1 text-sm text-gray-700">
          <li v-for="(k, i) in secili.kullanimlar" :key="i">
            <strong>{{ k.tur }}</strong> · {{ k.etiket }} <span class="text-gray-500">({{ k.alan }})</span>
          </li>
        </ul>
      </div>

      <button type="button" class="mt-3 text-sm text-blue-800 underline" @click="secili = null">Kapat</button>
    </div>

    <div v-if="sayfaSayisi > 1" class="mt-6 flex items-center justify-center gap-4">
      <button
        type="button"
        class="rounded border px-3 py-1 text-sm disabled:opacity-40"
        :disabled="sayfa <= 1"
        @click="sayfaDegistir(-1)"
      >
        Önceki
      </button>
      <span class="text-sm text-gray-600">{{ sayfa }} / {{ sayfaSayisi }}</span>
      <button
        type="button"
        class="rounded border px-3 py-1 text-sm disabled:opacity-40"
        :disabled="sayfa >= sayfaSayisi"
        @click="sayfaDegistir(1)"
      >
        Sonraki
      </button>
    </div>
  </section>
</template>
