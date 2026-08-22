<script setup>
/**
 * MAHALLELER paneli.
 *
 * NEDEN VAR
 * Mahalle kayıtları bugüne kadar YALNIZ komut satırından yönetiliyordu
 * (`npm run mahalle-aktar`, `npm run mahalle-yayin`). Yani içerik üretmek
 * geliştirici gerektiriyordu ve 473 rotanın 463'ü içeriksiz kabuk olarak
 * bekliyordu. Bu panel o bağımlılığı kaldırıyor.
 *
 * PANEL İŞ KURALI UYGULAMIYOR
 * Adres türetme, ilçe geçerliliği, kalite kapısı ve yayın kararı
 * `server/domain/neighborhoods/` altında. Burada yalnız form, liste ve
 * kapı raporunun gösterimi var. Bir kural burada tekrarlansaydı, komut
 * satırıyla panelin farklı cevap verdiği bir durum üretilebilirdi.
 *
 * ADRES DÜZENLENEMİYOR — BİLİNÇLİ
 * `canonicalPath` addan ve ilçeden türetiliyor ve salt okunur gösteriliyor.
 * Serbest bırakılsaydı panelden başka bir sayfanın adresi ele geçirilebilir
 * ya da `-mahallesi` eki olmayan bir adres üretilebilirdi.
 *
 * YAYIN AYRI DÜĞME
 * "Kaydet" içeriği yazıyor, "Yayına al" kapıdan geçiriyor. Tek bir onay
 * kutusu olsaydı kapı anlamsızlaşırdı.
 */
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const BOS_FORM = () => ({
  id: null,
  districtId: '',
  name: '',
  title: '',
  excerpt: '',
  content: '',
  metaTitle: '',
  metaDescription: '',
  faqs: [],
  facts: [],
  imagePath: '',
  imageAlt: '',
})

const ilceler = ref([])
const mahalleler = ref([])
const filtre = ref({ ilce: '', aktif: '', arama: '' })

const form = ref(BOS_FORM())
const seciliKayit = ref(null) // { canonicalPath, isActive, ilceAd, ilceAktif }
const kapi = ref(null)
const editor = ref(null)

const yukleniyor = ref(true)
const kaydediliyor = ref(false)
const yayinIsleniyor = ref(false)
const durum = ref('')
const hata = ref('')
const formAcik = ref(false)

const duzenlemeModu = computed(() => Boolean(form.value.id))

const mesajlariTemizle = () => {
  durum.value = ''
  hata.value = ''
}

const hataMetni = (e, yedek) => e?.data?.message || e?.message || yedek

// --- liste ----------------------------------------------------------------

/**
 * Süzgeçler SUNUCUYA gönderiliyor.
 *
 * 473 kaydı tarayıcıya indirip burada filtrelemek hem gereksiz yük hem de
 * kaydırılamaz bir liste demekti. Sorgu `districtId` ve `isActive`
 * sütunları üzerinden çalışıyor (ikisi de indeksli).
 */
const listeyiGetir = async () => {
  yukleniyor.value = true
  try {
    const parametre = new URLSearchParams()
    if (filtre.value.ilce) parametre.set('ilce', filtre.value.ilce)
    if (filtre.value.aktif) parametre.set('aktif', filtre.value.aktif)
    if (filtre.value.arama.trim()) parametre.set('arama', filtre.value.arama.trim())

    const cevap = await $fetch(`/api/mahalle-yonetim?${parametre.toString()}`)
    if (cevap?.success === false) throw new Error(cevap.error)
    ilceler.value = cevap.data.ilceler
    mahalleler.value = cevap.data.mahalleler
  } catch (e) {
    hata.value = hataMetni(e, 'Liste alınamadı')
  } finally {
    yukleniyor.value = false
  }
}

const suzgecDegisti = () => listeyiGetir()

/**
 * Bölge panelindeki "Mahalleleri Yönet" bağlantısı ilçeyi SLUG ile
 * gönderiyor (`?ilce=pendik`); süzgeç ise id ile çalışıyor. Eşleme ilk
 * yüklemeden sonra bir kez yapılıyor — panel kendi ilçe listesini
 * tutmadığı için slug→id karşılığı ancak sunucudan gelen listede var.
 */
const route = useRoute()

const adrestenIlceSec = async () => {
  const slug = String(route.query.ilce || '').trim()
  if (!slug) return
  const ilce = ilceler.value.find((i) => i.slug === slug)
  if (!ilce) return
  filtre.value.ilce = String(ilce.id)
  await listeyiGetir()
}

// --- form -----------------------------------------------------------------

const editoreYaz = (html) => editor.value?.commands.setContent(html || '', false)

const yeniKayit = () => {
  mesajlariTemizle()
  form.value = BOS_FORM()
  // Süzgeçte bir ilçe seçiliyse yeni kayıt onunla açılıyor — art arda
  // mahalle girerken her seferinde ilçe seçmek gerekmesin.
  if (filtre.value.ilce) form.value.districtId = Number(filtre.value.ilce)
  seciliKayit.value = null
  kapi.value = null
  editoreYaz('')
  formAcik.value = true
}

const kaydiAc = async (id) => {
  mesajlariTemizle()
  try {
    const cevap = await $fetch(`/api/mahalle-yonetim?id=${id}`)
    if (cevap?.success === false) throw new Error(cevap.error)
    const k = cevap.data.kayit
    form.value = {
      id: k.id,
      districtId: k.districtId,
      name: k.name,
      title: k.title || '',
      excerpt: k.excerpt || '',
      content: k.content || '',
      metaTitle: k.metaTitle || '',
      metaDescription: k.metaDescription || '',
      faqs: k.faqs || [],
      facts: k.facts || [],
      imagePath: k.imagePath || '',
      imageAlt: k.imageAlt || '',
    }
    seciliKayit.value = {
      canonicalPath: k.canonicalPath,
      isActive: k.isActive,
      ilceAd: k.ilceAd,
      ilceAktif: k.ilceAktif,
    }
    kapi.value = cevap.data.kapi
    editoreYaz(k.content)
    formAcik.value = true
  } catch (e) {
    hata.value = hataMetni(e, 'Kayıt açılamadı')
  }
}

const formuKapat = () => {
  formAcik.value = false
  seciliKayit.value = null
  kapi.value = null
  form.value = BOS_FORM()
}

const govde = () => ({
  districtId: Number(form.value.districtId),
  name: form.value.name.trim(),
  title: form.value.title,
  excerpt: form.value.excerpt,
  content: form.value.content,
  metaTitle: form.value.metaTitle,
  metaDescription: form.value.metaDescription,
  faqs: form.value.faqs,
  facts: form.value.facts,
  imagePath: form.value.imagePath,
  imageAlt: form.value.imageAlt,
})

const kaydet = async () => {
  mesajlariTemizle()
  if (!form.value.name.trim()) {
    hata.value = 'Mahalle adı zorunludur.'
    return
  }
  if (!form.value.districtId) {
    hata.value = 'Bağlı olduğu ilçeyi seçin.'
    return
  }

  kaydediliyor.value = true
  try {
    const cevap = duzenlemeModu.value
      ? await $fetch('/api/mahalle-yonetim', { method: 'PUT', body: { id: form.value.id, ...govde() } })
      : await $fetch('/api/mahalle-yonetim', { method: 'POST', body: govde() })

    if (cevap?.success === false) {
      // Yayındaki bir kayıt kapının altına düşürüldüyse yanıt kural
      // listesini de taşıyor; kullanıcı neyin kaldığını görsün.
      if (cevap.kapi) kapi.value = cevap.kapi
      throw new Error(cevap.error)
    }

    durum.value = cevap.message || 'Kaydedildi.'
    await listeyiGetir()
    await kaydiAc(cevap.data.id)
  } catch (e) {
    hata.value = hataMetni(e, 'Kaydedilemedi')
  } finally {
    kaydediliyor.value = false
  }
}

const yayinDegistir = async (yayinda) => {
  if (!form.value.id) return
  mesajlariTemizle()
  yayinIsleniyor.value = true
  try {
    const cevap = await $fetch('/api/mahalle-yayin', {
      method: 'POST',
      body: { id: form.value.id, yayinda },
    })
    if (cevap?.success === false) {
      if (cevap.kapi) kapi.value = cevap.kapi
      throw new Error(cevap.error)
    }
    if (cevap.data?.kapi) kapi.value = cevap.data.kapi
    durum.value = cevap.message || 'Güncellendi.'
    await listeyiGetir()
    await kaydiAc(form.value.id)
  } catch (e) {
    hata.value = hataMetni(e, 'İşlem tamamlanamadı')
  } finally {
    yayinIsleniyor.value = false
  }
}

const gorselYuklendi = (url) => {
  form.value.imagePath = url
}

// --- editör ---------------------------------------------------------------

onMounted(async () => {
  editor.value = new Editor({
    content: '',
    // H1 KASITLI OLARAK DIŞARIDA: sayfa şablonu başlığı kendisi `<h1>`
    // olarak basıyor, içerikte de H1 seçilebilseydi aynı sayfada iki H1
    // olurdu. PostPanel/PoliciesPanel ile aynı kurulum.
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [2, 3] }),
      Bold,
      Italic,
      Underline,
      BulletList,
      OrderedList,
      ListItem,
    ],
    onUpdate: () => {
      form.value.content = editor.value.getHTML()
    },
  })
  await listeyiGetir()
  await adrestenIlceSec()
})

onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <section class="p-6">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Mahalleler</h1>
      <p class="mt-1 text-sm text-gray-500">
        İstanbul ilçelerine bağlı mahalle sayfaları. Bir mahalle ancak kalite
        kapısını geçtiğinde yayına alınabilir.
      </p>
    </header>

    <p v-if="hata" class="mb-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">{{ hata }}</p>
    <output v-if="durum" class="mb-4 block rounded bg-green-50 p-3 text-sm text-green-700">{{ durum }}</output>

    <!-- ── Süzgeçler ────────────────────────────────────────────────── -->
    <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
      <div>
        <label for="mh-ilce-filtre" class="mb-1 block text-sm font-medium text-gray-600">İlçe</label>
        <select
          id="mh-ilce-filtre"
          v-model="filtre.ilce"
          class="w-full rounded border p-2"
          @change="suzgecDegisti"
        >
          <option value="">Tüm ilçeler</option>
          <option v-for="i in ilceler" :key="i.id" :value="i.id">{{ i.ad }}</option>
        </select>
      </div>

      <div>
        <label for="mh-durum-filtre" class="mb-1 block text-sm font-medium text-gray-600">Durum</label>
        <select
          id="mh-durum-filtre"
          v-model="filtre.aktif"
          class="w-full rounded border p-2"
          @change="suzgecDegisti"
        >
          <option value="">Hepsi</option>
          <option value="true">Yayında</option>
          <option value="false">Yayında değil</option>
        </select>
      </div>

      <div class="md:col-span-2">
        <label for="mh-arama" class="mb-1 block text-sm font-medium text-gray-600">Mahalle adı</label>
        <input
          id="mh-arama"
          v-model="filtre.arama"
          type="search"
          class="w-full rounded border p-2"
          placeholder="Örn: Kaynarca"
          @keyup.enter="suzgecDegisti"
          @search="suzgecDegisti"
        >
      </div>
    </div>

    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm text-gray-600">
        <template v-if="yukleniyor">Yükleniyor…</template>
        <template v-else>{{ mahalleler.length }} kayıt listeleniyor</template>
      </p>
      <button
        type="button"
        class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        @click="yeniKayit"
      >
        + Yeni mahalle
      </button>
    </div>

    <!-- ── Liste ────────────────────────────────────────────────────── -->
    <div class="mb-8 overflow-x-auto rounded border">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            <th class="p-3">Mahalle</th>
            <th class="p-3">Bağlı ilçe</th>
            <th class="p-3">Adres</th>
            <th class="p-3">Durum</th>
            <th class="p-3">İçerik</th>
            <th class="p-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in mahalleler" :key="m.id" class="border-t hover:bg-gray-50">
            <td class="p-3 font-medium text-gray-800">{{ m.ad }}</td>
            <td class="p-3 text-gray-600">{{ m.ilceAd || '—' }}</td>
            <td class="p-3">
              <code class="text-xs text-gray-500">/{{ m.yol }}</code>
            </td>
            <td class="p-3">
              <span
                v-if="m.aktif"
                class="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
              >Yayında</span>
              <span v-else class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Taslak</span>
            </td>
            <td class="p-3 text-xs text-gray-500">
              <span :class="m.baslikVar ? 'text-green-700' : 'text-gray-400'">başlık</span> ·
              <span :class="m.ozetVar ? 'text-green-700' : 'text-gray-400'">özet</span> ·
              <span :class="m.metaVar ? 'text-green-700' : 'text-gray-400'">meta</span>
            </td>
            <td class="p-3 text-right">
              <button type="button" class="text-blue-600 hover:underline" @click="kaydiAc(m.id)">
                Düzenle
              </button>
            </td>
          </tr>
          <tr v-if="!yukleniyor && !mahalleler.length">
            <td colspan="6" class="p-6 text-center italic text-gray-500">
              Bu süzgeçlerle kayıt bulunamadı.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Form ─────────────────────────────────────────────────────── -->
    <div v-if="formAcik" class="rounded-lg border-2 border-blue-200 bg-blue-50/20 p-6">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-800">
            {{ duzenlemeModu ? form.name : 'Yeni mahalle' }}
          </h2>
          <p v-if="seciliKayit" class="mt-1 text-sm text-gray-600">
            Yayındaki adres:
            <code class="rounded bg-white px-1">/{{ seciliKayit.canonicalPath }}</code>
            <a
              :href="`/${seciliKayit.canonicalPath}`"
              target="_blank"
              rel="noopener"
              class="ml-2 text-blue-600 hover:underline"
            >sayfayı aç →</a>
          </p>
        </div>
        <button type="button" class="text-sm text-gray-500 hover:text-gray-800" @click="formuKapat">
          Kapat
        </button>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label for="mh-ad" class="mb-1 block font-medium">
            Mahalle adı <span class="text-red-500">*</span>
          </label>
          <input
            id="mh-ad"
            v-model="form.name"
            type="text"
            class="w-full rounded border p-2"
            placeholder="Örn: Kaynarca"
          >
          <p class="mt-1 text-xs text-gray-500">
            Ek yazmayın — “Mahallesi” başlıkta otomatik ekleniyor.
          </p>
        </div>

        <div>
          <label for="mh-ilce" class="mb-1 block font-medium">
            Bağlı olduğu ilçe <span class="text-red-500">*</span>
          </label>
          <select id="mh-ilce" v-model="form.districtId" class="w-full rounded border p-2">
            <option value="">İlçe seçin…</option>
            <option v-for="i in ilceler" :key="i.id" :value="i.id">
              {{ i.ad }}<template v-if="!i.aktif"> — ilçe sayfası yayında değil</template>
            </option>
          </select>
          <p class="mt-1 text-xs text-gray-500">
            Yalnız İstanbul’un {{ ilceler.length }} ilçesi listeleniyor.
          </p>
        </div>
      </div>

      <!-- Adres: türetilmiş, salt okunur. -->
      <div class="mt-4 rounded border border-gray-200 bg-white p-3">
        <p class="text-sm font-medium text-gray-700">Public adres</p>
        <p class="mt-1 text-sm text-gray-600">
          <code v-if="seciliKayit">/{{ seciliKayit.canonicalPath }}</code>
          <span v-else class="italic text-gray-400">kayıtla birlikte üretilecek</span>
        </p>
        <p class="mt-1 text-xs text-gray-500">
          Adres mahalle adından ve ilçeden türetiliyor, elle değiştirilemez. Aynı ad
          birden fazla ilçede geçiyorsa ilçe önekli adres verilir
          (<code>/pendik-fevzi-cakmak-mahallesi</code>).
        </p>
      </div>

      <div class="mt-4">
        <label for="mh-baslik" class="mb-1 block font-medium">Sayfa başlığı (H1)</label>
        <input
          id="mh-baslik"
          v-model="form.title"
          type="text"
          class="w-full rounded border p-2"
          placeholder="Örn: Kaynarca Mahallesi Evden Eve Nakliyat"
        >
      </div>

      <div class="mt-4">
        <label for="mh-ozet" class="mb-1 block font-medium">Giriş özeti</label>
        <textarea
          id="mh-ozet"
          v-model="form.excerpt"
          rows="3"
          class="w-full rounded border p-2"
          placeholder="Sayfanın ilk paragrafı. Mahalleye özgü, doğrulanmış bilgi."
        />
      </div>

      <div class="mt-4">
        <p class="mb-1 font-medium">Gövde metni</p>
        <div class="rounded border bg-white">
          <EditorContent :editor="editor" class="admin-editor p-3" />
        </div>
        <p class="mt-1 text-xs text-gray-500">
          Yayın kapısı en az 400 karakter (etiketsiz) istiyor ve ilçe sayfasından
          birebir paragraf kopyasını reddediyor.
        </p>
      </div>

      <admin-base-list-editor
        v-model="form.faqs"
        title="Sık Sorulanlar"
        hint="Yayın kapısı en az 3 soru istiyor ve her sorunun cevabı dolu olmalı. FAQPage yapısal verisini besliyor."
        :fields="[
          { key: 'question', label: 'Soru', placeholder: 'Örn: Kaynarca’da asansörsüz binada taşınma nasıl yapılıyor?' },
          { key: 'answer', label: 'Cevap', placeholder: 'Kısa ve doğrudan bir cevap yazın.', type: 'textarea' },
        ]"
      />

      <admin-base-list-editor
        v-model="form.facts"
        title="Mahalle Künyesi"
        hint="Yalnız doğrulanmış bilgi girin. “Sokaklar dardır” gibi kaynaksız yerel iddia bu alana yazılmaz."
        :fields="[
          { key: 'label', label: 'Başlık', placeholder: 'Örn: Yapı dokusu' },
          { key: 'value', label: 'Açıklama', placeholder: 'Örn: 2000 sonrası site ağırlıklı, yük asansörü yaygın' },
        ]"
        required-key="label"
      />

      <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p class="mb-1 font-medium">Görsel</p>
          <input
            :value="form.imagePath"
            type="text"
            readonly
            class="w-full cursor-not-allowed rounded border bg-gray-100 p-2 text-sm"
            placeholder="Henüz görsel yok"
          >
          <FileUploader class="mt-2" @file-uploaded="gorselYuklendi" />
        </div>
        <div>
          <label for="mh-gorsel-alt" class="mb-1 block font-medium">Görsel alt metni</label>
          <input
            id="mh-gorsel-alt"
            v-model="form.imageAlt"
            type="text"
            class="w-full rounded border p-2"
            placeholder="Fotoğrafta ne olduğunu yazın"
          >
          <p class="mt-1 text-xs text-gray-500">Görsel zorunlu değil; yayın kapısı görsel istemiyor.</p>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label for="mh-metatitle" class="mb-1 block font-medium">Arama başlığı</label>
          <input
            id="mh-metatitle"
            v-model="form.metaTitle"
            type="text"
            class="w-full rounded border p-2"
            placeholder="Boş bırakılırsa başlıktan üretilir"
          >
        </div>
        <div>
          <label for="mh-metadesc" class="mb-1 block font-medium">Arama açıklaması</label>
          <textarea
            id="mh-metadesc"
            v-model="form.metaDescription"
            rows="3"
            class="w-full rounded border p-2"
            placeholder="70-175 karakter. Her mahallede farklı olmalı."
          />
          <p class="mt-1 text-xs text-gray-500">
            {{ (form.metaDescription || '').length }} karakter
          </p>
        </div>
      </div>

      <!-- ── Yayına hazırlık ────────────────────────────────────────── -->
      <div v-if="kapi" class="mt-6 rounded border bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="font-semibold text-gray-800">Yayına hazırlık</h3>
          <span
            :class="kapi.gecti ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'"
            class="rounded px-2 py-0.5 text-xs font-medium"
          >
            {{ kapi.gecti ? 'Kapıdan geçti' : 'Eksik var' }}
          </span>
        </div>
        <ul class="space-y-1 text-sm">
          <li v-for="k in kapi.kurallar" :key="k.anahtar" class="flex items-start gap-2">
            <span
              class="w-4 shrink-0 text-center font-bold"
              :class="k.gecti === true ? 'text-green-600' : k.gecti === false ? 'text-red-600' : 'text-gray-400'"
            >{{ k.gecti === true ? '✓' : k.gecti === false ? '✗' : '–' }}</span>
            <span :class="k.gecti === false ? 'text-gray-800' : 'text-gray-600'">
              {{ k.etiket }}
              <span v-if="k.ayrinti && k.gecti !== true" class="text-gray-500">— {{ k.ayrinti }}</span>
            </span>
          </li>
        </ul>
      </div>

      <div v-else-if="!duzenlemeModu" class="mt-6 rounded border border-dashed bg-white p-4 text-sm text-gray-500">
        Kayıt oluşturulduktan sonra yayın kapısının durumu burada listelenir.
        Yeni kayıtlar taslak olarak başlar.
      </div>

      <!-- ── Eylemler ──────────────────────────────────────────────── -->
      <div class="mt-6 flex flex-wrap items-center gap-3 border-t pt-4">
        <button
          type="button"
          class="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          :disabled="kaydediliyor"
          @click="kaydet"
        >
          {{ kaydediliyor ? 'Kaydediliyor…' : 'Kaydet' }}
        </button>

        <template v-if="duzenlemeModu">
          <button
            v-if="!seciliKayit?.isActive"
            type="button"
            class="rounded bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            :disabled="yayinIsleniyor"
            @click="yayinDegistir(true)"
          >
            {{ yayinIsleniyor ? 'İşleniyor…' : 'Yayına al' }}
          </button>
          <button
            v-else
            type="button"
            class="rounded border border-amber-500 px-5 py-2 text-amber-800 hover:bg-amber-50 disabled:opacity-50"
            :disabled="yayinIsleniyor"
            @click="yayinDegistir(false)"
          >
            {{ yayinIsleniyor ? 'İşleniyor…' : 'Yayından kaldır' }}
          </button>
        </template>

        <p v-if="seciliKayit?.isActive" class="text-xs text-gray-500">
          Yayındaki kayıtlarda ad ve ilçe değişikliği reddedilir — önce yayından kaldırın.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* TipTap gövdesi: panel içinde okunur bir yükseklik ve temel blok arası
   boşluk. Site tipografisi buraya taşınmıyor — editör sitenin görünümünü
   taklit etmiyor, yalnız yapıyı gösteriyor. */
.admin-editor :deep(.ProseMirror) {
  min-height: 14rem;
  outline: none;
}
.admin-editor :deep(.ProseMirror p) {
  margin-bottom: 0.75rem;
}
.admin-editor :deep(.ProseMirror h2),
.admin-editor :deep(.ProseMirror h3) {
  font-weight: 700;
  margin: 1rem 0 0.5rem;
}
.admin-editor :deep(.ProseMirror ul),
.admin-editor :deep(.ProseMirror ol) {
  padding-left: 1.25rem;
  margin-bottom: 0.75rem;
}
.admin-editor :deep(.ProseMirror ul) {
  list-style: disc;
}
.admin-editor :deep(.ProseMirror ol) {
  list-style: decimal;
}
</style>
