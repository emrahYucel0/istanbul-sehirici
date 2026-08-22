<script setup>
/**
 * ANA SAYFA PANELİ — KONTROLLÜ CMS.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * BU BİR SAYFA OLUŞTURUCU DEĞİL
 *
 * Panel bölüm ekleyemiyor, silemiyor, sıralarını değiştiremiyor, ızgara ya
 * da koreografi seçemiyor. Sayfanın altı bölümü sabit ve her birinin
 * karşılığı olan bileşen kodda duruyor; burada yalnız o bileşenlerin
 * BEKLEDİĞİ metin ve görseller yönetiliyor.
 *
 * Form kod tarafından yazılmıyor: hangi bölümün hangi alanları var ve kaç
 * öğe taşıyor, `shared/utils/anasayfa.ts` içindeki sözleşmeden okunuyor.
 * Sunucu da aynı sözleşmeyi denetliyor — panelin gösterdiği form ile
 * sunucunun kabul ettiği gövde ayrışamıyor.
 *
 * ÖĞE SAYISI SABİT: "öğe ekle" düğmesi YOK. Üç sahne üç sahnedir; dördüncüsü
 * düzeni bozar ve sunucu zaten reddeder.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * BURADAN YÖNETİLMEYENLER
 *
 * Ana sayfada görünen her şey bu ekranda değil ve bu bilinçli: süreç
 * adımları, hizmet defteri ve sorular kendi domain modellerinde yaşıyor ve
 * başka sayfalarda da kullanılabiliyorlar. Aşağıdaki yönlendirme kutusu
 * yöneticiye hangi ekranın ana sayfayı etkilediğini açıkça söylüyor.
 */
import { ref, computed, onMounted } from 'vue'
import {
  ANASAYFA_BOLUMLERI,
  ANASAYFA_ANAHTARLARI,
  UZUN_ALANLAR,
  GORSEL_ALANLARI,
} from '#shared/utils/anasayfa'

const bolumler = ref([])
const mesaj = ref('')
const hataVar = ref(false)
const yukleniyor = ref(true)
const kaydedilen = ref('')

/** Ana sayfada canlı olan, ama başka panellerden yönetilen alanlar. */
const DIS_KAYNAKLAR = [
  {
    ad: 'Süreç adımları',
    yol: '/evdeneveyonetim/process',
    not: 'Beş kare: etiket, başlık, metin, fotoğraf ve alt metin.',
  },
  {
    ad: 'Hizmet defteri',
    yol: '/evdeneveyonetim/services',
    not: 'Ana sayfa YAYINDAKİ hizmetleri listeliyor. Bir hizmeti listeden çıkarmak için yayından kaldırın.',
  },
  {
    ad: 'Sorular (SSS)',
    yol: '/evdeneveyonetim/faq',
    not: 'Ana sayfa yalnız AKTİF soruları basıyor; aynı kayıt arama motoru işaretlemesini de besliyor.',
  },
  {
    ad: 'Telefon ve marka',
    yol: '/evdeneveyonetim/site',
    not: 'Hero ve Kapanış bölümlerindeki telefon Site Ayarları’ndan geliyor.',
  },
]

const tanim = (anahtar) => ANASAYFA_BOLUMLERI[anahtar]
const uzunMu = (alan) => UZUN_ALANLAR.has(alan)
const gorselMi = (alan) => GORSEL_ALANLARI.has(alan)

/** Sunucudan gelen kaydı forma çeviriyor; eksik öğeleri boşla tamamlıyor. */
function formaCevir(kayit) {
  const t = tanim(kayit.sectionKey)
  const ogeler = [...(kayit.items || [])]
  // Kayıt yeni ya da eksikse boş öğeler ekleniyor: form her zaman tam
  // sayıda satır gösteriyor, sunucu da tam sayıda bekliyor.
  while (ogeler.length < t.ogeSayisi) ogeler.push({})
  return {
    sectionKey: kayit.sectionKey,
    heading: kayit.heading || '',
    lead: kayit.lead || '',
    note: kayit.note || '',
    closing: kayit.closing || '',
    closingNote: kayit.closingNote || '',
    ctaLabel: kayit.ctaLabel || '',
    imagePath: kayit.imagePath || '',
    imageAlt: kayit.imageAlt || '',
    items: ogeler.slice(0, t.ogeSayisi).map((o) => ({
      label: o.label || '',
      subLabel: o.subLabel || '',
      title: o.title || '',
      body: o.body || '',
      imagePath: o.imagePath || '',
      imageAlt: o.imageAlt || '',
    })),
  }
}

async function yukle() {
  yukleniyor.value = true
  try {
    const cevap = await $fetch('/api/anasayfa?admin=true')
    if (!cevap?.success) throw new Error(cevap?.error || 'Veri alınamadı')
    // Sıra sunucudan geliyor (sayfadaki gerçek sıra); yine de bilinmeyen
    // bir anahtar gelirse form basılmıyor.
    bolumler.value = cevap.data
      .filter((k) => ANASAYFA_ANAHTARLARI.includes(k.sectionKey))
      .map(formaCevir)
  } catch (e) {
    hataVar.value = true
    mesaj.value = `Yükleme hatası: ${e?.data?.message || e?.message || 'bilinmeyen'}`
  } finally {
    yukleniyor.value = false
  }
}

async function kaydet(bolum) {
  kaydedilen.value = bolum.sectionKey
  hataVar.value = false
  try {
    const cevap = await $fetch('/api/anasayfa', { method: 'PUT', body: bolum })
    if (!cevap?.success) {
      hataVar.value = true
      mesaj.value = `Kaydetme hatası: ${cevap?.error || 'bilinmeyen'}`
      return
    }
    mesaj.value = cevap.message || 'Kaydedildi.'
  } catch (e) {
    hataVar.value = true
    mesaj.value = `Kaydetme hatası: ${e?.data?.message || e?.message || 'bilinmeyen'}`
  } finally {
    kaydedilen.value = ''
  }
}

/** Hizmetler bölümünün başlığındaki sayı elle yazılıyor; sayaç gösteriliyor. */
const yayindakiHizmet = ref(null)
onMounted(async () => {
  await yukle()
  try {
    const cevap = await $fetch('/api/anasayfa')
    yayindakiHizmet.value = cevap?.data?.hizmetler?.length ?? null
  } catch {
    yayindakiHizmet.value = null
  }
})
</script>

<template>
  <div class="p-4 md:p-6">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Ana Sayfa</h1>
      <p class="mt-2 max-w-3xl text-sm text-gray-600">
        Ana sayfanın yapısı, sırası ve hareketi kodda; burada o yapının içindeki
        metinler ve görseller yönetiliyor. Bölüm ekleme, silme ve sıralama
        bilerek yok.
      </p>
    </header>

    <!-- YÖNLENDİRME — "düzenledim ama değişmedi" durumunu önlüyor. -->
    <section class="mb-8 rounded border border-amber-300 bg-amber-50 p-4">
      <h2 class="mb-2 text-sm font-bold uppercase tracking-wide text-amber-800">
        Ana sayfada canlı, ama başka ekrandan yönetiliyor
      </h2>
      <ul class="space-y-2">
        <li v-for="d in DIS_KAYNAKLAR" :key="d.yol" class="text-sm text-gray-700">
          <NuxtLink :to="d.yol" class="font-semibold text-amber-900 underline">{{ d.ad }}</NuxtLink>
          — {{ d.not }}
        </li>
      </ul>
    </section>

    <p
      v-if="mesaj"
      :class="[
        'mb-6 rounded p-3 text-sm',
        hataVar ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700',
      ]"
    >
      {{ mesaj }}
    </p>

    <p v-if="yukleniyor" class="text-gray-500">Yükleniyor…</p>

    <div v-else class="space-y-10">
      <section
        v-for="bolum in bolumler"
        :key="bolum.sectionKey"
        class="rounded border border-gray-200 bg-white p-4 md:p-6"
      >
        <div class="mb-4 border-b border-gray-100 pb-3">
          <h2 class="text-lg font-bold text-gray-800">{{ tanim(bolum.sectionKey).ad }}</h2>
          <p class="mt-1 text-sm text-gray-500">{{ tanim(bolum.sectionKey).aciklama }}</p>
          <p
            v-if="bolum.sectionKey === 'hizmetler' && yayindakiHizmet !== null"
            class="mt-2 text-sm text-gray-700"
          >
            Şu anda <strong>{{ yayindakiHizmet }}</strong> yayındaki hizmet listeleniyor.
            <strong>Başlığa sayı yazmayın:</strong> bir hizmet yayından kaldırıldığında
            liste kısalır, başlıktaki rakam ise eskir.
          </p>
        </div>

        <!-- ── BÖLÜM ALANLARI ─────────────────────────────────────── -->
        <div class="grid gap-4 md:grid-cols-2">
          <div
            v-for="alan in tanim(bolum.sectionKey).alanlar"
            :key="alan"
            :class="uzunMu(alan) || gorselMi(alan) ? 'md:col-span-2' : ''"
          >
            <label
              :for="`${bolum.sectionKey}-${alan}`"
              class="mb-1 block text-sm font-medium text-gray-600"
            >
              {{ tanim(bolum.sectionKey).etiketler[alan] || alan }}
            </label>

            <template v-if="gorselMi(alan)">
              <FileUploader
                :label="`${tanim(bolum.sectionKey).ad} görseli yükle`"
                @file-uploaded="(url) => (bolum[alan] = url)"
              />
              <input
                :id="`${bolum.sectionKey}-${alan}`"
                v-model="bolum[alan]"
                type="text"
                class="mt-2 w-full rounded border border-gray-300 p-2 text-sm"
              />
            </template>

            <textarea
              v-else-if="uzunMu(alan)"
              :id="`${bolum.sectionKey}-${alan}`"
              v-model="bolum[alan]"
              rows="3"
              class="w-full rounded border border-gray-300 p-2 text-sm"
            />

            <input
              v-else
              :id="`${bolum.sectionKey}-${alan}`"
              v-model="bolum[alan]"
              type="text"
              class="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
        </div>

        <!-- ── ÖĞELER — SAYISI SABİT ──────────────────────────────── -->
        <div v-if="tanim(bolum.sectionKey).ogeSayisi" class="mt-6">
          <h3 class="mb-1 text-sm font-bold uppercase tracking-wide text-gray-700">
            {{ tanim(bolum.sectionKey).ogeBasligi }}
          </h3>
          <p class="mb-3 text-xs text-gray-500">
            Bu bölüm tam {{ tanim(bolum.sectionKey).ogeSayisi }} öğe taşır. Sayı tasarımın
            parçası; ekleme ve çıkarma yok.
          </p>

          <div
            v-for="(oge, i) in bolum.items"
            :key="i"
            class="mb-4 rounded border border-gray-100 bg-gray-50 p-3"
          >
            <p class="mb-2 text-xs font-bold text-gray-500">{{ i + 1 }}. öğe</p>
            <div class="grid gap-3 md:grid-cols-2">
              <div
                v-for="alan in tanim(bolum.sectionKey).ogeAlanlari"
                :key="alan"
                :class="uzunMu(alan) || gorselMi(alan) ? 'md:col-span-2' : ''"
              >
                <label
                  :for="`${bolum.sectionKey}-${i}-${alan}`"
                  class="mb-1 block text-xs font-medium text-gray-600"
                >
                  {{ tanim(bolum.sectionKey).ogeEtiketleri[alan] || alan }}
                </label>

                <template v-if="gorselMi(alan)">
                  <FileUploader
                    :label="`${i + 1}. öğenin görselini yükle`"
                    @file-uploaded="(url) => (oge[alan] = url)"
                  />
                  <input
                    :id="`${bolum.sectionKey}-${i}-${alan}`"
                    v-model="oge[alan]"
                    type="text"
                    class="mt-2 w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </template>

                <textarea
                  v-else-if="uzunMu(alan)"
                  :id="`${bolum.sectionKey}-${i}-${alan}`"
                  v-model="oge[alan]"
                  rows="3"
                  class="w-full rounded border border-gray-300 p-2 text-sm"
                />

                <input
                  v-else
                  :id="`${bolum.sectionKey}-${i}-${alan}`"
                  v-model="oge[alan]"
                  type="text"
                  class="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 flex justify-end">
          <button
            type="button"
            :disabled="kaydedilen === bolum.sectionKey"
            class="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            @click="kaydet(bolum)"
          >
            {{ kaydedilen === bolum.sectionKey ? 'Kaydediliyor…' : 'Bölümü Kaydet' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
