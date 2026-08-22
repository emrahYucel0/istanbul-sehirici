<script setup>
// NOT: Güven bandı (giriş metni + rakamlar) artık BURADA DEĞİL — kendi bölümü
// ve kendi paneli var: Admin > Güven Bandı. Ana sayfadaki hizmetler bölümü
// kaldırıldıktan sonra ikisinin aynı ekranda durması için bir sebep kalmamıştı.
// `buttonText`/`buttonLink` de kaldırıldı: o düğme kaldırılan bölüme aitti.
const { form, message, showDeleteModal, recordId, isSaving, isDeleting, load, save, remove } = useSectionCrud(
  'services',
  'services',
  {
    mainTitle: '',
    description: '',
    services: [],
  },
  // `?admin=true` OLMADAN bu panel yalnız YAYINDAKİ hizmetleri görürdü:
  // taslaklar herkese açık okumadan süzülüyor (bkz. services.config.ts).
  // Panelin var olma sebebi tam olarak taslakları da yönetmek.
  { loadQuery: '?admin=true' }
);

// --- Yayın durumu ---------------------------------------------------------
//
// "Tümünü Güncelle" İÇERİĞİ kaydeder, yayın durumuna DOKUNMAZ. Yayın ayrı
// bir eylem (bkz. server/api/services-yayin.post.ts): genel kaydetme
// gövdesinde bir onay kutusu olsaydı, hizmet oluşturmak onu anında public
// yapmaya devam ederdi.
//
// Kaydedilmemiş bir hizmet (henüz slug'ı DB'de yok) yayına alınamaz —
// düğme o durumda gizleniyor ve kullanıcıya sırası söyleniyor.
const yayinIsleniyor = ref('')

const yayinDegistir = async (slug, yayinda) => {
  if (!slug) return
  yayinIsleniyor.value = slug
  try {
    const cevap = await $fetch('/api/services-yayin', {
      method: 'POST',
      body: { slug, yayinda },
    })
    if (cevap?.success === false) throw new Error(cevap.error || 'İşlem tamamlanamadı')
    message.value = cevap.message || 'Güncellendi.'
    // Listeyi sunucudan tazele: yayın durumu formda değil kayıtta yaşıyor.
    await load()
  } catch (e) {
    message.value = e?.data?.message || e?.message || 'İşlem tamamlanamadı'
  } finally {
    yayinIsleniyor.value = ''
  }
};

const updateServiceImageUrl = (url, index) => {
  form.services[index].imagePath = url
  message.value = 'Servis görseli başarıyla güncellendi! Lütfen "Tümünü Güncelle" butonuna tıklayarak kaydedin.'
}

// Yeni bir servis ekler
const addService = () => {
  form.services.push({
    imagePath: '',
    imageAlt: '',
    title: '',
    subtitle: '',
    description: '',
    order: form.services.length,
    // Yeni hizmet TASLAK başlar. Bu alan sunucuya GÖNDERİLMİYOR (yup şeması
    // atıyor); yalnız panelde rozeti doğru göstermek için duruyor.
    isActive: false,
    // Kendi sayfası olan hizmetler için. `slug` boş bırakılırsa hizmet
    // yalnızca kart olarak görünür, ayrı sayfası açılmaz.
    slug: '',
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
    content: '',
    includes: [],
    faqs: [],
  })
}

// Bir servisi listeden siler
const removeService = (index) => {
  form.services.splice(index, 1)
  form.services.forEach((service, i) => service.order = i)
}

// --- Detay sayfası alanları -------------------------------------------------
// `includes` ve `faqs` veritabanında JSON dizisi olarak duruyor. Panelde
// düzenlenebilmeleri için basit ekle/sil yardımcıları:

const addInclude = (index) => {
  if (!Array.isArray(form.services[index].includes)) form.services[index].includes = []
  form.services[index].includes.push('')
}
const removeInclude = (index, i) => form.services[index].includes.splice(i, 1)

const addFaq = (index) => {
  if (!Array.isArray(form.services[index].faqs)) form.services[index].faqs = []
  form.services[index].faqs.push({ question: '', answer: '' })
}
const removeFaq = (index, i) => form.services[index].faqs.splice(i, 1)

/** Hizmeti sırada yukarı/aşağı taşır. */
const moveService = (index, delta) => {
  const hedef = index + delta
  if (hedef < 0 || hedef >= form.services.length) return
  const [s] = form.services.splice(index, 1)
  form.services.splice(hedef, 0, s)
  form.services.forEach((x, i) => (x.order = i))
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Servisler Bölümü Yönetimi 🚚</h1>

    <p v-if="message" :class="['mt-4 p-3 rounded', message.includes('hata') || message.includes('sorun') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700']">
      {{ message }}
    </p>

    <form @submit.prevent="save" class="space-y-8 bg-white p-6 shadow-lg rounded-lg">
      <h2 class="text-xl font-semibold border-b pb-2 text-primary">Temel İçerik</h2>

      <div>
        <label for="mainTitle" class="block font-medium text-gray-700 mb-1">Ana Başlık</label>
        <input id="mainTitle" v-model="form.mainTitle" type="text" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <div>
        <label for="description" class="block font-medium text-gray-700 mb-1">Açıklama Paragrafı</label>
        <textarea id="description" v-model="form.description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"></textarea>
      </div>

      <!-- SERVİSLER BÖLÜMÜ -->
      <h2 class="text-xl font-semibold border-b pb-2 text-primary pt-4">Hizmetler</h2>
      <p class="text-sm text-gray-500">
        Kart bilgileri ve — adres verilirse — hizmetin kendi detay sayfası.
      </p>

      <div class="space-y-6">
        <div
          v-for="(service, index) in form.services"
          :key="'service-' + (service.id || index)"
          class="p-6 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-150"
        >
          <div class="flex justify-between items-start mb-4 gap-3 flex-wrap">
            <h4 class="font-bold text-lg text-gray-700">
              Hizmet #{{ index + 1 }}
              <span
                v-if="service.isActive"
                class="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 align-middle"
              >YAYINDA</span>
              <span
                v-else
                class="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 align-middle"
              >TASLAK</span>
            </h4>

            <div class="flex items-center gap-2">
              <!-- Yayın düğmesi yalnız KAYDEDİLMİŞ hizmetlerde: yayın
                   kayıttaki slug üzerinden yürüyor, formdaki metin üzerinden
                   değil. -->
              <template v-if="service.id && service.slug">
                <button
                  v-if="!service.isActive"
                  type="button"
                  @click="yayinDegistir(service.slug, true)"
                  :disabled="yayinIsleniyor === service.slug"
                  class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {{ yayinIsleniyor === service.slug ? 'İşleniyor…' : 'Yayına Al' }}
                </button>
                <button
                  v-else
                  type="button"
                  @click="yayinDegistir(service.slug, false)"
                  :disabled="yayinIsleniyor === service.slug"
                  class="px-3 py-1 text-sm border border-amber-500 text-amber-800 rounded hover:bg-amber-50 disabled:opacity-50"
                >
                  {{ yayinIsleniyor === service.slug ? 'İşleniyor…' : 'Yayından Kaldır' }}
                </button>
              </template>
              <span v-else class="text-xs text-gray-500">
                Önce “Tümünü Güncelle” ile kaydedin, sonra yayına alın.
              </span>

              <button :aria-label="`${index + 1}. Hizmeti sil`" type="button" @click="removeService(index)" class="text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center transition duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          <!-- Görsel Yönetimi -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-white rounded-lg border">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">Hizmet Görsel URL</label>
              <input
                :value="service.imagePath"
                type="text"
                class="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                placeholder="URL otomatik olarak dolacak"
                readonly
              />
              <p v-if="service.imagePath" class="mt-2 text-sm text-gray-500">
                Mevcut Görsel:
                <a :href="service.imagePath" target="_blank" class="text-blue-500 hover:underline truncate inline-block max-w-full">
                  {{ service.imagePath }}
                </a>
              </p>
              <p v-else class="mt-2 text-sm text-red-500">Mevcut Görsel Yok.</p>
            </div>
            <div>
              <FileUploader
                @file-uploaded="(url) => updateServiceImageUrl(url, index)"
                :label="'Hizmet Görseli Yükle #' + (index + 1)"
              />
            </div>

            <div class="md:col-span-2">
              <label :for="'service-alt-' + index" class="block text-sm font-medium text-gray-600 mb-1">
                Görsel Açıklaması (alt metni)
              </label>
              <input
                :id="'service-alt-' + index"
                v-model="service.imageAlt"
                type="text"
                maxlength="125"
                class="w-full p-2 border border-gray-300 rounded"
                placeholder="Örn: Nakliyeci gardırobu koruyucu battaniyeye sarıyor"
              />
              <p class="mt-1 text-xs text-gray-500">
                Ne <strong>görüldüğünü</strong> anlatın, hizmet adını değil —
                hizmet adı zaten başlıkta yazıyor. Google görsel aramada bu metin
                kullanılır. Boş bırakılırsa
                “<em>{{ service.title || 'Hizmet' }} çalışmamız</em>” üretilir.
              </p>
            </div>
          </div>

          <!-- Servis Detayları -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label :for="'service-title-' + index" class="block text-sm font-medium text-gray-600">Başlık</label>
              <input v-model="service.title" :id="'service-title-' + index" type="text" class="w-full p-2 border rounded" placeholder="Örn: Evden Eve Nakliyat" required />
            </div>
            <div>
              <label :for="'service-subtitle-' + index" class="block text-sm font-medium text-gray-600">Alt Başlık</label>
              <input v-model="service.subtitle" :id="'service-subtitle-' + index" type="text" class="w-full p-2 border rounded" placeholder="Örn: Şehir İçi & Şehirlerarası" />
            </div>
            <div class="md:col-span-2">
              <label :for="'service-desc-' + index" class="block text-sm font-medium text-gray-600">Kısa Açıklama (kartta görünür)</label>
              <textarea v-model="service.description" :id="'service-desc-' + index" rows="2" class="w-full p-2 border rounded" placeholder="Hizmet detayları"></textarea>
            </div>
          </div>

          <!-- ================= DETAY SAYFASI ================= -->
          <div class="mt-6 rounded-lg border border-blue-200 bg-blue-50/40 p-4">
            <h5 class="font-semibold text-gray-800">Detay Sayfası</h5>
            <p class="mt-1 mb-4 text-sm text-gray-600">
              Adres alanı <strong>boş bırakılırsa</strong> bu hizmetin ayrı sayfası açılmaz,
              yalnızca kart olarak görünür. Doldurulursa
              <code>site.com/adres</code> şeklinde kendi sayfası yayınlanır.
            </p>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label :for="'service-slug-' + index" class="block text-sm font-medium text-gray-600">
                  Sayfa Adresi (slug)
                </label>
                <input
                  v-model="service.slug"
                  :id="'service-slug-' + index"
                  type="text"
                  class="w-full rounded border p-2"
                  placeholder="asansorlu-nakliyat"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Sadece küçük harf, rakam ve tire. Türkçe karakter kullanmayın.
                </p>
              </div>
              <div>
                <label :for="'service-order-' + index" class="block text-sm font-medium text-gray-600">Sıra</label>
                <input
                  v-model.number="service.order"
                  :id="'service-order-' + index"
                  type="number"
                  min="0"
                  class="w-full rounded border p-2"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Kart sırası ve detay sayfalarındaki önceki/sonraki gezinmesi bu sıraya göre.
                </p>
              </div>
            </div>

            <div class="mt-4">
              <label :for="'service-excerpt-' + index" class="block text-sm font-medium text-gray-600">
                Özet (sayfa girişi ve kart metni)
              </label>
              <textarea
                v-model="service.excerpt"
                :id="'service-excerpt-' + index"
                rows="2"
                class="w-full rounded border p-2"
                placeholder="Bir-iki cümlelik özet"
              ></textarea>
            </div>

            <!--
              ARAMA BAŞLIĞI — hizmet adından AYRI, boş bırakılabilir.
              Boşken `hizmet adı | marka` üretiliyor. Hizmet sayfalarında
              elle girmenin değeri, aranan ifadeyi başa alabilmek: sayfadaki
              başlık "Parça Eşya Taşıma" iken aramada "Parça Eşya Taşıma
              Fiyatları" daha çok tıklanabilir.
            -->
            <div class="mt-4">
              <label :for="'service-metatitle-' + index" class="block text-sm font-medium text-gray-600">
                Google Arama Başlığı
              </label>
              <input
                v-model="service.metaTitle"
                :id="'service-metatitle-' + index"
                type="text"
                maxlength="70"
                class="w-full rounded border p-2"
                placeholder="Parça Eşya Taşıma | Marka"
              />
              <p
                class="mt-1 text-xs"
                :class="(service.metaTitle || '').length > 60 ? 'text-amber-700' : 'text-gray-500'"
              >
                {{ (service.metaTitle || '').length }} / 60 karakter — 60 üstü aramada kesilir.
                Boşsa <strong>hizmet adı | marka</strong> üretilir.
              </p>
            </div>

            <!--
              ARAMA AÇIKLAMASI — özetten ayrı. Özet sayfada okunuyor
              (doğal olmalı), bu ise arama sonucunda tıklanma üretiyor.
              Hizmet sayfaları TİCARİ niyet taşıdığı için burada eylem
              çağrısı yerinde.
            -->
            <div class="mt-4">
              <label :for="'service-meta-' + index" class="block text-sm font-medium text-gray-600">
                Google Arama Açıklaması
              </label>
              <textarea
                v-model="service.metaDescription"
                :id="'service-meta-' + index"
                rows="2"
                maxlength="165"
                class="w-full rounded border p-2"
                placeholder="Hizmet adı + kapsam + eylem çağrısı"
              ></textarea>
              <p
                class="mt-1 text-xs"
                :class="(service.metaDescription || '').length > 155 ? 'text-amber-700' : 'text-gray-500'"
              >
                {{ (service.metaDescription || '').length }} / 155 karakter — hedef 140-155.
                Boşsa yukarıdaki özet kullanılır.
              </p>
            </div>

            <div class="mt-4">
              <label :for="'service-content-' + index" class="block text-sm font-medium text-gray-600">
                Sayfa İçeriği (HTML)
              </label>
              <textarea
                v-model="service.content"
                :id="'service-content-' + index"
                rows="10"
                class="w-full rounded border p-2 font-mono text-sm"
                placeholder="&lt;p&gt;Paragraf&lt;/p&gt; &lt;h3&gt;Ara başlık&lt;/h3&gt;"
              ></textarea>
            </div>

            <!-- Neler dahil -->
            <div class="mt-5">
              <div class="mb-2 flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-600">Hizmete Neler Dahil</label>
                <button type="button" class="rounded bg-gray-700 px-2 py-1 text-xs text-white" @click="addInclude(index)">
                  + Madde ekle
                </button>
              </div>
              <p v-if="!service.includes || !service.includes.length" class="text-sm text-gray-500">
                Madde yok.
              </p>
              <div v-for="(m, i) in service.includes || []" :key="'inc-' + index + '-' + i" class="mb-2 flex gap-2">
                <input v-model="service.includes[i]" type="text" class="w-full rounded border p-2" placeholder="Ambalaj malzemesinin tamamı" />
                <button type="button" class="shrink-0 rounded border border-red-300 px-3 text-sm text-red-700" @click="removeInclude(index, i)">Sil</button>
              </div>
            </div>

            <!-- SSS -->
            <div class="mt-5">
              <div class="mb-2 flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-600">Sık Sorulan Sorular</label>
                <button type="button" class="rounded bg-gray-700 px-2 py-1 text-xs text-white" @click="addFaq(index)">
                  + Soru ekle
                </button>
              </div>
              <p v-if="!service.faqs || !service.faqs.length" class="text-sm text-gray-500">Soru yok.</p>
              <div v-for="(f, i) in service.faqs || []" :key="'faq-' + index + '-' + i" class="mb-3 rounded border bg-white p-3">
                <input v-model="f.question" type="text" class="mb-2 w-full rounded border p-2" placeholder="Soru" />
                <textarea v-model="f.answer" rows="3" class="w-full rounded border p-2" placeholder="Cevap"></textarea>
                <button type="button" class="mt-2 rounded border border-red-300 px-3 py-1 text-sm text-red-700" @click="removeFaq(index, i)">
                  Soruyu sil
                </button>
              </div>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <button type="button" class="rounded border border-gray-300 px-2 py-1 text-sm" :disabled="index === 0" @click="moveService(index, -1)">↑</button>
            <button type="button" class="rounded border border-gray-300 px-2 py-1 text-sm" :disabled="index === form.services.length - 1" @click="moveService(index, 1)">↓</button>
          </div>
        </div>
      </div>

      <button type="button" @click="addService" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-150 flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        <span>Yeni Hizmet Ekle</span>
      </button>

      <div class="flex space-x-4 pt-6 border-t mt-6">
        <button type="submit" :disabled="isSaving" :aria-busy="isSaving" class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600 transition duration-150 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          {{ recordId ? 'Tümünü Güncelle' : 'Oluştur' }}
        </button>
        <button v-if="recordId" type="button" @click="showDeleteModal = true" :disabled="isSaving" class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          Kaydı Sil
        </button>
      </div>
    </form>

    <AdminModalDynamicDeleteModal
      :show="showDeleteModal"
      :loading="isDeleting"
      title="Bölüm Kaydını Sil"
      message="Bu bölümdeki tüm verileri (ana metinler, hizmetler ve istatistikler) silmek istediğinize emin misiniz? Bu işlem geri alınamaz!"
      confirmText="Evet, Kaydı Sil"
      cancelText="İptal Et"
      @confirm="remove"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<style scoped>
.bg-primary {
  background-color: #3b82f6;
}
.hover\:bg-green-600:hover {
  background-color: #10b981;
}
.text-primary {
  color: #3b82f6;
}
</style>
