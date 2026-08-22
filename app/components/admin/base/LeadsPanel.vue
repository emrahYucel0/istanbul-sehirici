<script setup>
/**
 * TALEPLER & İSTATİSTİK paneli.
 *
 * İki bölümden oluşuyor:
 *   1. Özet kartlar — telefon/WhatsApp tıklamaları ve talep sayıları
 *   2. Talep listesi — okundu işaretleme, silme, mail durumu
 *
 * Ziyaretçi sayısı BURADA YOK ve bu bilinçli: o iş Google Analytics'in.
 * Her sayfa görüntülemesini MySQL'e yazmak paylaşımlı hosting'de en pahalı
 * seçenek olurdu. Burada yalnızca düşük hacimli, yüksek değerli veriler var.
 */
import { computed, onMounted, ref } from 'vue'

const ozet = ref(null)
const talepler = ref([])
const toplam = ref(0)
const okunmamis = ref(0)
const sayfa = ref(1)
const toplamSayfa = ref(1)
const yukleniyor = ref(true)
const hata = ref('')

const tarihBicimle = (deger) =>
  new Date(deger).toLocaleString('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

const ozetGetir = async () => {
  const cevap = await $fetch('/api/stats')
  if (cevap?.success) ozet.value = cevap.data
}

const talepleriGetir = async () => {
  const cevap = await $fetch(`/api/leads?page=${sayfa.value}&pageSize=25`)
  if (cevap?.success) {
    talepler.value = cevap.data.items
    toplam.value = cevap.data.total
    okunmamis.value = cevap.data.unread
    toplamSayfa.value = cevap.data.totalPages
  }
}

const yenile = async () => {
  yukleniyor.value = true
  hata.value = ''
  try {
    await Promise.all([ozetGetir(), talepleriGetir()])
  } catch (e) {
    hata.value = e?.data?.message || e?.message || 'Veriler alınamadı'
  } finally {
    yukleniyor.value = false
  }
}

const okunduDegistir = async (talep) => {
  const yeni = !talep.isRead
  await $fetch('/api/leads', { method: 'PATCH', body: { id: talep.id, isRead: yeni } })
  talep.isRead = yeni
  okunmamis.value += yeni ? -1 : 1
}

const sil = async (talep) => {
  if (!confirm(`"${talep.name}" adlı talebi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return
  await $fetch('/api/leads', { method: 'DELETE', body: { id: talep.id } })
  await yenile()
}

const sayfaDegistir = async (yon) => {
  const hedef = sayfa.value + yon
  if (hedef < 1 || hedef > toplamSayfa.value) return
  sayfa.value = hedef
  await talepleriGetir()
}

/** Özet kartlar — tek yerden üretiliyor ki şablon tekrar etmesin. */
const kartlar = computed(() => {
  if (!ozet.value) return []
  const o = ozet.value.olaylar
  const t = ozet.value.talepler
  return [
    { baslik: 'Telefon tıklaması', bugun: o.bugun.telefon, hafta: o.hafta.telefon, ay: o.ay.telefon },
    { baslik: 'WhatsApp tıklaması', bugun: o.bugun.whatsapp, hafta: o.hafta.whatsapp, ay: o.ay.whatsapp },
    { baslik: 'Form gönderimi', bugun: o.bugun.form, hafta: o.hafta.form, ay: o.ay.form },
    { baslik: 'Kayıtlı talep', bugun: t.bugun, hafta: t.hafta, ay: t.ay },
  ]
})

/** SMTP bozuksa panelde görünsün — sessiz kalıp müşteri kaybetmeyelim. */
const mailSorunlu = computed(() => talepler.value.filter((t) => t.mailStatus === 'basarisiz').length)


onMounted(yenile)
</script>

<template>
  <section class="p-6">
    <header class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Talepler &amp; İstatistik</h1>
        <p class="mt-1 text-sm text-gray-500">
          Son 30 günün dönüşüm verileri. Ziyaretçi sayısı ve trafik kaynağı için Google Analytics'i kullanın.
        </p>
      </div>
      <button class="rounded bg-gray-800 px-4 py-2 text-sm font-medium text-white" @click="yenile">
        Yenile
      </button>
    </header>

    <p v-if="hata" class="mb-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">{{ hata }}</p>

    <p v-if="yukleniyor" class="py-10 text-center text-gray-500">Yükleniyor…</p>

    <template v-else>
      <!-- SMTP uyarısı: mail gitmemiş talep varsa öne çıksın -->
      <div v-if="mailSorunlu > 0" class="mb-6 rounded border border-amber-300 bg-amber-50 p-4">
        <p class="font-semibold text-amber-900">
          {{ mailSorunlu }} talebin e-postası gönderilemedi.
        </p>
        <!--
          Metin iki sebeple değişti:

          1. ".env içindeki MAIL_PASSWORD" YANLIŞ HALE GELDİ. Mail ayarı artık
             derlemeye gömülü değil, sunucunun ORTAM DEĞİŞKENLERİNDEN okunuyor
             (server/mail/config.ts). Üretimde `.env` yüklenmiyor; değerler
             hosting panelinden geliyor.
          2. Bu bileşen istemci paketine giriyor. Değişken ADI bir sır değil
             ama yapılandırma ayrıntısının herkese açık pakette dolaşmasına
             gerek yok; yönetici için "hangi ayar" bilgisi yeterli.
        -->
        <p class="mt-1 text-sm text-amber-800">
          Talepler kaydedildi, aşağıdaki listede duruyorlar — kaybolmadılar. Ama e-posta
          bildirimi çalışmıyor: sunucudaki SMTP ayarlarını (adres, port, hesap, parola)
          kontrol edin.
        </p>
      </div>

      <!-- Özet kartlar -->
      <div class="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="k in kartlar" :key="k.baslik" class="rounded-lg border border-gray-200 bg-white p-4">
          <p class="text-sm font-medium text-gray-500">{{ k.baslik }}</p>
          <p class="mt-2 text-3xl font-bold text-gray-900">{{ k.ay }}</p>
          <p class="mt-1 text-xs text-gray-500">
            bugün <strong>{{ k.bugun }}</strong> · 7 gün <strong>{{ k.hafta }}</strong> · 30 gün
          </p>
        </div>
      </div>

      <!-- Sayfa bazında dağılım: hangi içerik dönüşüm getiriyor -->
      <div class="mb-8 grid gap-6 lg:grid-cols-2">
        <div class="rounded-lg border border-gray-200 bg-white p-4">
          <h2 class="mb-1 font-semibold text-gray-800">En çok tıklama alan sayfalar</h2>
          <p class="mb-3 text-xs text-gray-500">Son 30 gün · telefon ve WhatsApp tıklamaları</p>
          <p v-if="!ozet?.sayfaBazindaOlay?.length" class="py-4 text-sm text-gray-500">Henüz veri yok.</p>
          <ul v-else class="divide-y divide-gray-100">
            <li v-for="s in ozet.sayfaBazindaOlay" :key="s.sayfa" class="flex justify-between py-2 text-sm">
              <span class="truncate text-gray-700">{{ s.sayfa }}</span>
              <strong class="ml-3 shrink-0 text-gray-900">{{ s.adet }}</strong>
            </li>
          </ul>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4">
          <h2 class="mb-1 font-semibold text-gray-800">En çok talep getiren sayfalar</h2>
          <p class="mb-3 text-xs text-gray-500">Son 30 gün · form gönderimleri</p>
          <p v-if="!ozet?.sayfaBazindaTalep?.length" class="py-4 text-sm text-gray-500">Henüz veri yok.</p>
          <ul v-else class="divide-y divide-gray-100">
            <li v-for="s in ozet.sayfaBazindaTalep" :key="s.sayfa" class="flex justify-between py-2 text-sm">
              <span class="truncate text-gray-700">{{ s.sayfa }}</span>
              <strong class="ml-3 shrink-0 text-gray-900">{{ s.adet }}</strong>
            </li>
          </ul>
        </div>
      </div>

      <!-- Talep listesi -->
      <h2 class="mb-3 font-semibold text-gray-800">
        Gelen talepler
        <span class="ml-2 text-sm font-normal text-gray-500">
          toplam {{ toplam }}<template v-if="okunmamis"> · {{ okunmamis }} okunmamış</template>
        </span>
      </h2>

      <p v-if="!talepler.length" class="rounded border border-gray-200 bg-white py-10 text-center text-gray-500">
        Henüz talep yok.
      </p>

      <ul v-else class="space-y-3">
        <li
          v-for="t in talepler"
          :key="t.id"
          class="rounded-lg border bg-white p-4"
          :class="t.isRead ? 'border-gray-200' : 'border-blue-300 bg-blue-50/40'"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900">
                {{ t.name }}
                <span v-if="!t.isRead" class="ml-2 rounded bg-blue-600 px-2 py-0.5 text-xs text-white">yeni</span>
                <span v-if="t.mailStatus === 'basarisiz'" class="ml-2 rounded bg-amber-500 px-2 py-0.5 text-xs text-white">
                  mail gitmedi
                </span>
              </p>
              <p class="mt-1 text-sm text-gray-600">
                <a v-if="t.phone" :href="`tel:${t.phone}`" class="text-blue-700 hover:underline">{{ t.phone }}</a>
                <span v-if="t.phone && t.email" class="mx-2 text-gray-300">|</span>
                <a v-if="t.email" :href="`mailto:${t.email}`" class="text-blue-700 hover:underline">{{ t.email }}</a>
              </p>
              <p v-if="t.message" class="mt-2 whitespace-pre-line text-sm text-gray-700">{{ t.message }}</p>

              <!--
                MAİL HATASININ NEDENİ — M6'da görünür oldu.

                `mailError` veri tabanına yazılıyordu ama panelde hiçbir
                yerde basılmıyordu: yönetici "mail gitmedi" rozetini
                görüyor, NEDEN gitmediğini öğrenemiyordu. Yanlış SMTP
                parolası ile dolu gelen kutusu aynı görünüyordu.

                KAPALI BAŞLIYOR (`<details>`): normal listede teknik metin
                gürültü yapmasın, gerektiğinde açılsın.

                DÜZ METİN. `v-html` YOK: bu dize bir dış kütüphaneden
                geliyor, HTML değil. `break-all` + `whitespace-pre-wrap`
                uzun SMTP satırlarını kutunun dışına taşırmadan sarıyor.
              -->
              <details v-if="t.mailError" class="mt-2">
                <summary class="cursor-pointer text-xs font-semibold text-amber-800">
                  Mail neden gitmedi?
                </summary>
                <pre class="mt-2 max-w-full overflow-x-auto whitespace-pre-wrap break-all rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">{{ t.mailError }}</pre>
                <p class="mt-1 text-xs text-gray-500">
                  Bu metin e-posta sunucusundan geliyor. Talep kaydı güvende —
                  yalnız bildirim e-postası gönderilemedi.
                </p>
              </details>
              <p class="mt-2 text-xs text-gray-500">
                {{ tarihBicimle(t.createdAt) }}
                <template v-if="t.sourcePage"> · geldiği sayfa: <code>{{ t.sourcePage }}</code></template>
              </p>
            </div>

            <div class="flex shrink-0 gap-2">
              <button
                class="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700"
                @click="okunduDegistir(t)"
              >
                {{ t.isRead ? 'Okunmadı yap' : 'Okundu' }}
              </button>
              <button class="rounded border border-red-300 px-3 py-1 text-sm text-red-700" @click="sil(t)">
                Sil
              </button>
            </div>
          </div>
        </li>
      </ul>

      <div v-if="toplamSayfa > 1" class="mt-4 flex items-center justify-center gap-4">
        <button
          class="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
          :disabled="sayfa <= 1"
          @click="sayfaDegistir(-1)"
        >
          Önceki
        </button>
        <span class="text-sm text-gray-600">{{ sayfa }} / {{ toplamSayfa }}</span>
        <button
          class="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
          :disabled="sayfa >= toplamSayfa"
          @click="sayfaDegistir(1)"
        >
          Sonraki
        </button>
      </div>
    </template>
  </section>
</template>
