<script setup>
/**
 * MÜŞTERİ YORUMLARI — moderasyon.
 *
 * Siteden gelen yorumlar `isApproved: false` ile kaydediliyor ve buradan
 * onaylanana kadar hiçbir yerde görünmüyor.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MODERASYON = ONAY / YAYINDAN KALDIRMA. YENİDEN YAZMA DEĞİL.
 *
 * Bu ekranda ziyaretçinin adını, puanını ya da yorumunu düzenleyecek bir
 * alan YOK ve bilerek yok. Bir müşterinin cümlesini işletme adına yeniden
 * yazıp altında onun adıyla yayınlamak, yorumu uydurma yorum hâline
 * getirir. Karar iki yönlü: yayınla ya da yayınlama.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * "YAYINDA" NE DEMEK — İKİ ALAN, İKİ ANLAM
 *
 * Panel eskiden yalnız `isApproved`e bakıyordu ve yanlış bilgi veriyordu:
 * `isActive: false` olan üç örnek kaydı "yayında" sayıp kırmızı alarma
 * sokuyordu, oysa hiçbiri sitede görünmüyordu. Artık sitenin kullandığı
 * koşulun AYNISI kullanılıyor (bkz. server/domain/reviews →
 * HERKESE_ACIK_KOSUL): onaylı VE aktif.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * YAPISAL VERİ (tarihsel not)
 *
 * Buradaki eski açıklama "yorumlar Review/AggregateRating yapısal verisini
 * besleyecek" diyordu. Beslemiyor: o işaretleme ana sayfadan tamamen
 * kaldırıldı, çünkü kendi yorumlarını kendi yayınlayan işletme sitesi
 * Google'ın review snippet kuralına uygun değil (gerekçe
 * app/pages/index.vue başlığında). Moderasyonun gerekçesi bu yüzden
 * değişmedi, sadeleşti: yayınlanan yorum gerçek olmalı.
 */
import { computed, onMounted, ref } from 'vue'

const yorumlar = ref([])
const bekleyen = ref(0)
const sadeceBekleyen = ref(true)
const yukleniyor = ref(true)
const hata = ref('')

/**
 * Sitede GERÇEKTEN görünüyor mu?
 *
 * Sunucudaki koşulun bire bir karşılığı. Panelin "yayında" dediği şeyle
 * sitenin gösterdiği şey ayrışmasın diye tek bir yerde duruyor.
 */
const yayindaMi = (y) => y.isApproved === true && y.isActive === true

const durumEtiketi = (y) => {
  if (!y.isApproved) return { metin: 'onay bekliyor', sinif: 'bg-amber-500 text-white' }
  if (!y.isActive) return { metin: 'onaylı · pasif, sitede görünmüyor', sinif: 'bg-gray-500 text-white' }
  return { metin: 'yayında', sinif: 'bg-green-600 text-white' }
}

const tarih = (d) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })

const getir = async () => {
  yukleniyor.value = true
  hata.value = ''
  try {
    const cevap = await $fetch(`/api/reviews?admin=1&pending=${sadeceBekleyen.value ? '1' : '0'}`)
    if (cevap?.success) {
      yorumlar.value = cevap.data.items
      bekleyen.value = cevap.data.pending
    }
  } catch (e) {
    hata.value = e?.data?.message || e?.message || 'Yorumlar alınamadı'
  } finally {
    yukleniyor.value = false
  }
}

const onayla = async (y, deger) => {
  await $fetch('/api/reviews', { method: 'PATCH', body: { id: y.id, isApproved: deger } })
  await getir()
}

/**
 * YAYIN DURUMU — onaydan AYRI eylem (M6).
 *
 * M5 sonunda "onaylı ama pasif" bir kaydı yayına almanın panelde hiçbir
 * yolu yoktu; kayıt o durumda kilitleniyordu. Eylem yalnız ZİYARETÇİDEN
 * gelen yorumlarda görünüyor: panelden girilmiş eski/örnek kayıtların
 * yayına alınmasını kolaylaştırmak M5'in tam tersi olurdu (sunucu da
 * reddediyor).
 */
const yayinDegistir = async (y, deger) => {
  const cevap = await $fetch('/api/reviews', {
    method: 'PATCH',
    body: { id: y.id, isActive: deger },
  })
  if (cevap?.success === false) hata.value = cevap.error
  await getir()
}

const sil = async (y) => {
  if (!confirm(`"${y.customerName}" adlı kişinin yorumu silinecek. Bu işlem geri alınamaz.`)) return
  await $fetch('/api/reviews', { method: 'DELETE', body: { id: y.id } })
  await getir()
}

const filtreDegistir = async () => {
  sadeceBekleyen.value = !sadeceBekleyen.value
  await getir()
}

const baslik = computed(() => (sadeceBekleyen.value ? 'Onay bekleyenler' : 'Tüm yorumlar'))

/**
 * Yayında olup "örnek/test/lorem" ibaresi taşıyan yorumlar.
 *
 * Uydurma bir yorumu gerçek müşteri yorumu gibi yayınlamak, ziyaretçiye
 * yanlış bilgi vermek demek. Risk panelde görünür olmalı ki yayına
 * çıkmadan fark edilsin.
 *
 * DÜZELTME: burada `/\börnek\b/i` kullanılıyordu ve HİÇ ÇALIŞMIYORDU —
 * JavaScript'te `\b` sınırı `\w`ye ([A-Za-z0-9_]) dayalı, "ö" ise `\w`
 * değil; "(örnek)" içindeki kelimeyi hiçbir zaman yakalamıyordu. Yani
 * tam da uyarması gereken üç kaydı görmüyordu. Kontrol artık Unicode
 * harf sınırı kullanan ortak yardımcıda (bkz. app/utils/yer-tutucu.ts).
 */
const sahteGorunenler = computed(() =>
  yorumlar.value.filter((y) => yayindaMi(y) && yerTutucuIceriyorMu(y.customerName, y.comment))
)

/** Yayında olmayan ama örnek/test izi taşıyan kayıtlar — bilgi, alarm değil. */
const sahteBekleyenler = computed(() =>
  yorumlar.value.filter((y) => !yayindaMi(y) && yerTutucuIceriyorMu(y.customerName, y.comment))
)

onMounted(getir)
</script>

<template>
  <section class="p-6">
    <admin-base-panel-durumu
      durum="canli"
      nerede="Ana sayfa > Yorumlar bölümü. Onayladığınız yorum, ziyaretçilere burada görünür ve gösterilen puan ortalamasına girer."
    />
    <header class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Müşteri Yorumları</h1>
        <p class="mt-1 text-sm text-gray-500">
          Siteden gelen yorumlar <strong>onaylanana kadar yayınlanmaz</strong>.
        </p>
      </div>
      <div class="flex gap-2">
        <button class="rounded border border-gray-300 px-3 py-2 text-sm" @click="filtreDegistir">
          {{ sadeceBekleyen ? 'Tümünü göster' : 'Sadece bekleyenler' }}
        </button>
        <button class="rounded bg-gray-800 px-4 py-2 text-sm text-white" @click="getir">Yenile</button>
      </div>
    </header>

    <p v-if="bekleyen > 0" class="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      <strong>{{ bekleyen }}</strong> yorum onay bekliyor.
    </p>

    <!-- Yayında örnek/test yorum varsa uyar: ziyaretçi bunları gerçek
         müşteri yorumu sanır. -->
    <div
      v-if="sahteGorunenler.length"
      class="mb-4 rounded border-2 border-red-400 bg-red-50 p-4"
      role="alert"
    >
      <p class="font-semibold text-red-900">
        Dikkat: yayında {{ sahteGorunenler.length }} adet örnek/test yorum var.
      </p>
      <p class="mt-1 text-sm text-red-800">
        Bu kayıtlar ana sayfadaki <strong>Yorumlar</strong> bölümünde ziyaretçiye
        gerçek müşteri yorumu gibi görünüyor ve gösterilen yorum sayısı ile puan
        ortalamasına giriyor. <strong>Onayı kaldırın.</strong>
      </p>
      <ul class="mt-2 list-inside list-disc text-sm text-red-800">
        <li v-for="y in sahteGorunenler" :key="y.id">{{ y.customerName }}</li>
      </ul>
    </div>

    <!-- Yayında OLMAYAN örnek kayıtlar: bilgi notu, alarm değil. Silinmeleri
         gerekmiyor; yalnız onaylanıp yayına alınmamaları gerekiyor. -->
    <p
      v-if="sahteBekleyenler.length"
      class="mb-4 rounded border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700"
    >
      Yayında olmayan <strong>{{ sahteBekleyenler.length }}</strong> örnek/test kaydı var
      ({{ sahteBekleyenler.map((y) => y.customerName).join(', ') }}).
      Bunlar gerçek müşteri yorumu değil; <strong>yayına almayın</strong>.
    </p>

    <p v-if="hata" class="mb-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">{{ hata }}</p>
    <p v-if="yukleniyor" class="py-10 text-center text-gray-500">Yükleniyor…</p>

    <template v-else>
      <h2 class="mb-3 font-semibold text-gray-700">{{ baslik }} ({{ yorumlar.length }})</h2>

      <p v-if="!yorumlar.length" class="rounded border border-gray-200 bg-white py-10 text-center text-gray-500">
        {{ sadeceBekleyen ? 'Onay bekleyen yorum yok.' : 'Henüz yorum yok.' }}
      </p>

      <ul v-else class="space-y-3">
        <li
          v-for="y in yorumlar"
          :key="y.id"
          class="rounded-lg border bg-white p-4"
          :class="yayindaMi(y) ? 'border-gray-200' : 'border-amber-300 bg-amber-50/40'"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900">
                {{ y.customerName }}
                <span class="ml-2 text-amber-500">{{ '★'.repeat(y.rating) }}<span class="text-gray-300">{{ '★'.repeat(5 - y.rating) }}</span></span>
                <span class="ml-2 rounded px-2 py-0.5 text-xs" :class="durumEtiketi(y).sinif">{{ durumEtiketi(y).metin }}</span>
                <span v-if="y.source === 'site'" class="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">siteden</span>
              </p>
              <p class="mt-2 whitespace-pre-line text-sm text-gray-700">{{ y.comment }}</p>
              <p class="mt-2 text-xs text-gray-500">
                {{ tarih(y.date) }}
                <template v-if="y.location"> · {{ y.location }}</template>
                <template v-if="y.serviceType"> · {{ y.serviceType }}</template>
                <template v-if="y.email"> · <a :href="`mailto:${y.email}`" class="text-blue-700">{{ y.email }}</a></template>
              </p>
            </div>

            <div class="flex shrink-0 gap-2">
              <button
                v-if="!y.isApproved"
                class="rounded bg-green-600 px-3 py-1 text-sm text-white"
                @click="onayla(y, true)"
              >
                Onayla
              </button>
              <button
                v-else
                class="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700"
                @click="onayla(y, false)"
              >
                Onayı kaldır
              </button>
              <!-- Yayın durumu yalnız ziyaretçi yorumlarında ve yalnız
                   onaylanmış kayıtlarda anlamlı: onaysız bir yorumu
                   "yayına almak" zaten mümkün değil. -->
              <button
                v-if="y.source === 'site' && y.isApproved"
                class="rounded border px-3 py-1 text-sm"
                :class="y.isActive ? 'border-gray-300 text-gray-700' : 'border-blue-400 text-blue-700'"
                @click="yayinDegistir(y, !y.isActive)"
              >
                {{ y.isActive ? 'Pasife al' : 'Yayına aç' }}
              </button>
              <button class="rounded border border-red-300 px-3 py-1 text-sm text-red-700" @click="sil(y)">Sil</button>
            </div>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>
