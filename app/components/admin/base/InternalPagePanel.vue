<script setup>
/**
 * İÇ SAYFALAR — KONTROLLÜ İÇERİK.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * SAYFA OLUŞTURUCU DEĞİL
 *
 * Form tamamen SÖZLEŞMEDEN üretiliyor (shared/utils/ic-sayfa.ts):
 *
 *   · sayfa listesi kapalı  → yeni sayfa açılamaz
 *   · bölüm listesi kapalı  → yeni bölüm eklenemez
 *   · bölüm sırası sabit     → sıralama değiştirilemez
 *   · öğe sayısı sabit       → "öğe ekle" düğmesi YOK
 *
 * Sunucu aynı sözleşmeyi bağımsız olarak uyguluyor; panel tek savunma
 * hattı değil.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * HANGİ METNİ NEREDEN DEĞİŞTİRECEĞİM?
 *
 * Her sayfanın başında hangi içeriğin BURADA OLMADIĞI ve nereden geldiği
 * yazılı. En sık karışan üçü: SEO (Meta Taglar), iletişim bilgileri
 * (Site Genel) ve hizmet listesi (Servisler).
 */
import { computed, onMounted, ref } from 'vue'
import { IC_SAYFALAR, IC_SAYFA_ANAHTARLARI, UZUN_ALANLAR, GORSEL_ALANLARI } from '#shared/utils/ic-sayfa'

const veri = ref([])
const seciliSayfa = ref(IC_SAYFA_ANAHTARLARI[0])
const yukleniyor = ref(true)
const kaydediliyor = ref('')
const mesaj = ref('')
const hata = ref('')

const sayfaTanimi = computed(() => IC_SAYFALAR[seciliSayfa.value])

const getir = async () => {
  yukleniyor.value = true
  hata.value = ''
  try {
    const cevap = await $fetch('/api/ic-sayfa?admin=true')
    if (cevap?.success) veri.value = cevap.data
    else hata.value = cevap?.error || 'İçerik alınamadı'
  } catch (e) {
    hata.value = e?.data?.message || e?.message || 'İçerik alınamadı'
  } finally {
    yukleniyor.value = false
  }
}

/** Seçili sayfanın bölümleri — sözleşme sırasıyla, form için hazırlanmış. */
const bolumler = computed(() => {
  const sayfa = veri.value.find((s) => s.pageKey === seciliSayfa.value)
  if (!sayfa) return []

  return Object.entries(sayfaTanimi.value.bolumler).map(([anahtar, tanim]) => {
    const kayit = sayfa.bolumler.find((b) => b.sectionKey === anahtar) ?? {}
    const ogeler = kayit.items ?? []
    return {
      anahtar,
      tanim,
      form: {
        heading: kayit.heading ?? '',
        lead: kayit.lead ?? '',
        note: kayit.note ?? '',
        closing: kayit.closing ?? '',
        imagePath: kayit.imagePath ?? '',
        imageAlt: kayit.imageAlt ?? '',
        // ÖĞE SAYISI SÖZLEŞMEDEN: kayıt eksikse boş satırlar açılıyor,
        // fazlaysa kırpılıyor. Panel hiçbir zaman sunucunun reddedeceği
        // bir sayıda öğe göndermiyor.
        items: Array.from({ length: tanim.ogeSayisi }, (_, i) => ({
          label: ogeler[i]?.label ?? '',
          title: ogeler[i]?.title ?? '',
          body: ogeler[i]?.body ?? '',
          note: ogeler[i]?.note ?? '',
          imagePath: ogeler[i]?.imagePath ?? '',
          imageAlt: ogeler[i]?.imageAlt ?? '',
        })),
      },
    }
  })
})

/** Düzenlenen değerler — bölüm anahtarına göre. */
const taslak = ref({})

const formu = (b) => {
  const k = `${seciliSayfa.value}.${b.anahtar}`
  if (!taslak.value[k]) taslak.value[k] = JSON.parse(JSON.stringify(b.form))
  return taslak.value[k]
}

const kaydet = async (b) => {
  const k = `${seciliSayfa.value}.${b.anahtar}`
  kaydediliyor.value = k
  mesaj.value = ''
  hata.value = ''
  try {
    const cevap = await $fetch('/api/ic-sayfa', {
      method: 'PUT',
      body: {
        pageKey: seciliSayfa.value,
        sectionKey: b.anahtar,
        ...taslak.value[k],
      },
    })
    if (cevap?.success) {
      mesaj.value = cevap.message || 'Kaydedildi.'
      delete taslak.value[k]
      await getir()
    } else {
      hata.value = cevap?.error || 'Kaydedilemedi'
    }
  } catch (e) {
    hata.value = e?.data?.message || e?.message || 'Kaydedilemedi'
  } finally {
    kaydediliyor.value = ''
  }
}

const sayfaDegistir = (anahtar) => {
  seciliSayfa.value = anahtar
  mesaj.value = ''
  hata.value = ''
}

const uzunMu = (alan) => UZUN_ALANLAR.has(alan)
const gorselMi = (alan) => GORSEL_ALANLARI.has(alan)

onMounted(getir)
</script>

<template>
  <section class="p-6">
    <admin-base-panel-durumu
      durum="canli"
      nerede="Buradaki metin ve görseller doğrudan ilgili herkese açık sayfada görünüyor."
    />

    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">İç Sayfalar</h1>
      <p class="mt-1 text-sm text-gray-500">
        Sayfaların editoryal metni ve sahne fotoğrafları. Sayfa yapısı, bölüm
        sırası ve künye numaraları koddadır; buradan değiştirilemez.
      </p>
    </header>

    <!-- SAYFA SEÇİCİ — kapalı küme. -->
    <div class="mb-6 flex flex-wrap gap-1 border-b border-gray-200" role="tablist" aria-label="İç sayfalar">
      <button
        v-for="anahtar in IC_SAYFA_ANAHTARLARI"
        :key="anahtar"
        type="button"
        role="tab"
        :aria-selected="seciliSayfa === anahtar"
        class="-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition"
        :class="
          seciliSayfa === anahtar
            ? 'border-blue-600 text-blue-700'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        "
        @click="sayfaDegistir(anahtar)"
      >
        {{ IC_SAYFALAR[anahtar].ad }}
      </button>
    </div>

    <p class="mb-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      <strong>{{ sayfaTanimi.yol }}</strong> — {{ sayfaTanimi.aciklama }}
    </p>

    <p v-if="mesaj" class="mb-4 rounded bg-green-50 p-3 text-sm text-green-800">{{ mesaj }}</p>
    <p v-if="hata" class="mb-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">{{ hata }}</p>
    <p v-if="yukleniyor" class="py-10 text-center text-gray-500">Yükleniyor…</p>

    <div v-else class="space-y-8">
      <form
        v-for="b in bolumler"
        :key="b.anahtar"
        class="rounded-lg border bg-white p-5 shadow-sm"
        @submit.prevent="kaydet(b)"
      >
        <h2 class="text-lg font-bold text-gray-900">{{ b.tanim.ad }}</h2>
        <p class="mb-4 mt-1 text-sm text-gray-500">{{ b.tanim.aciklama }}</p>

        <div class="space-y-4">
          <div v-for="alan in b.tanim.alanlar" :key="alan">
            <label :for="`${b.anahtar}-${alan}`" class="mb-1 block text-sm font-medium text-gray-700">
              {{ b.tanim.etiketler[alan] || alan }}
            </label>

            <admin-base-image-field
              v-if="gorselMi(alan)"
              :id="`${b.anahtar}-${alan}`"
              v-model="formu(b)[alan]"
            />
            <textarea
              v-else-if="uzunMu(alan)"
              :id="`${b.anahtar}-${alan}`"
              v-model="formu(b)[alan]"
              rows="3"
              class="w-full rounded border border-gray-300 p-2 text-sm"
            />
            <input
              v-else
              :id="`${b.anahtar}-${alan}`"
              v-model="formu(b)[alan]"
              type="text"
              class="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
        </div>

        <!-- ÖĞELER — sayı sabit, "ekle"/"sil" düğmesi YOK. -->
        <div v-if="b.tanim.ogeSayisi" class="mt-6 border-t pt-4">
          <h3 class="mb-3 text-sm font-bold text-gray-800">
            {{ b.tanim.ogeBasligi || 'Öğeler' }}
            <span class="font-normal text-gray-500">
              — {{ b.tanim.ogeSayisi }} adet, sayı tasarımın parçası
            </span>
          </h3>

          <div
            v-for="(oge, i) in formu(b).items"
            :key="i"
            class="mb-4 rounded border border-gray-200 bg-gray-50 p-3"
          >
            <p class="mb-2 text-xs font-bold text-gray-500">#{{ i + 1 }}</p>
            <div class="space-y-3">
              <div v-for="alan in b.tanim.ogeAlanlari" :key="alan">
                <label :for="`${b.anahtar}-${i}-${alan}`" class="mb-1 block text-xs font-medium text-gray-600">
                  {{ b.tanim.ogeEtiketleri[alan] || alan }}
                </label>
                <admin-base-image-field
                  v-if="gorselMi(alan)"
                  :id="`${b.anahtar}-${i}-${alan}`"
                  v-model="oge[alan]"
                />
                <textarea
                  v-else-if="uzunMu(alan)"
                  :id="`${b.anahtar}-${i}-${alan}`"
                  v-model="oge[alan]"
                  rows="2"
                  class="w-full rounded border border-gray-300 p-2 text-sm"
                />
                <input
                  v-else
                  :id="`${b.anahtar}-${i}-${alan}`"
                  v-model="oge[alan]"
                  type="text"
                  class="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          :disabled="kaydediliyor === `${seciliSayfa}.${b.anahtar}`"
          class="mt-4 rounded bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {{ kaydediliyor === `${seciliSayfa}.${b.anahtar}` ? 'Kaydediliyor…' : 'Bu bölümü kaydet' }}
        </button>
      </form>
    </div>
  </section>
</template>
