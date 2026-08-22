<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Image from '@tiptap/extension-image'

const {
  form: post,
  message,
  items: posts,
  isSaving,
  isDeleting,
  isLoadingItem,
  page,
  total,
  totalPages,
  goToPage,
  refresh,
  resetForm,
  selectItem,
  save,
  remove,
} = useListCrud(
  'posts',
  {
    id: null,
    title: '',
    subtitle: '',
    shortTitle: '',
    author: '',
    slug: '',
    content: '',
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
    image: '',
    imageAlt: '',
  },
  {
    paginated: true,
    pageSize: 12,
    // `?admin=true` OLMADAN bu panel yalnız YAYINDAKİ yazıları görürdü:
    // taslaklar herkese açık okumadan süzülüyor (bkz. posts.service.ts).
    // Panelin var olma sebebi tam olarak taslakları yönetmek.
    listQuery: '?admin=true',
  }
)

// --- Yayın durumu ---------------------------------------------------------
//
// "Kaydet" ile "Yayına Al" AYRI eylemler. Yayın durumu düzenleme gövdesinde
// taşınmıyor (bkz. server/api/posts-yayin.post.ts): bir onay kutusu olsaydı
// kaydetmek yayınlamak demeye devam ederdi.
const yayinIsleniyor = ref('')

const yayinDegistir = async (slug, yayinda) => {
  yayinIsleniyor.value = slug
  try {
    const cevap = await $fetch('/api/posts-yayin', {
      method: 'POST',
      body: { slug, yayinda },
    })
    if (cevap?.success === false) throw new Error(cevap.error || 'İşlem tamamlanamadı')
    message.value = cevap.message || 'Güncellendi.'
    await refresh()
  } catch (e) {
    message.value = e?.data?.message || e?.message || 'İşlem tamamlanamadı'
  } finally {
    yayinIsleniyor.value = ''
  }
}

// --- Karakter Dönüşüm Fonksiyonu ---
// Bu fonksiyon, slug ve resim URL'si oluştururken Türkçe karakterleri dönüştürmek için kullanılır.
const sanitizeText = (text) => {
  const charMap = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u'
  }
  return text.split('').map(char => charMap[char] || char).join('')
}

// --- Slug Oluşturma ---
const generateSlug = () => {
  const title = post.title
  let slug = sanitizeText(title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  post.slug = slug
}

// --- TipTap Editor Instance ---
const editor = ref(null)
onMounted(() => {
  editor.value = new Editor({
    content: post.content,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      // Seviye 1 kasıtlı olarak dışarıda: sayfa şablonu içeriğin üstünde
      // zaten kendi <h1>{{ post.title }}</h1>'ini basıyor; içerik gövdesinde
      // de bir H1 seçilebilirse aynı sayfada birden fazla H1 oluşur (SEO
      // başlık hiyerarşisi bozulur).
      Heading.configure({
        levels: [2, 3],
      }),
      Bold,
      Italic,
      Underline,
      BulletList,
      OrderedList,
      ListItem,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    onUpdate: () => {
      post.content = editor.value.getHTML()
    }
  })
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

// --- Modal Kontrolleri ---
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedSlug = ref('')

// --- Yeni Post Ekleme Modalını Aç ---
const openAddForm = () => {
  resetForm()
  if (editor.value) {
    editor.value.commands.clearContent()
  }
  showEditModal.value = true
}

// --- Post Seçimi ---
// selectItem artık listeden değil, doğrudan API'den (slug ile) tek kayıt
// çekiyor (bkz. useListCrud.ts) — bu yüzden async.
const selectPost = async (slug) => {
  const selected = await selectItem(slug)
  if (selected) {
    if (editor.value) {
      editor.value.commands.setContent(selected.content)
    }
    showEditModal.value = true
  }
}

// --- Resim Ekleme Fonksiyonu ---
// Resim URL'sini almadan önce sanitizeText fonksiyonuyla dönüştürüyoruz.
const addImage = () => {
  let url = prompt("Eklemek istediğiniz resmin URL'sini giriniz:")
  if (url && editor.value) {
    url = sanitizeText(url)
    editor.value.chain().focus().setImage({ src: url }).run()
  }
}

// --- Post Silme ---
const deletePost = async () => {
  const result = await remove(selectedSlug.value)
  showDeleteModal.value = false
  if (!result.success) {
    alert('Post silinirken hata oluştu.')
  }
}

const closeModal = () => {
  showEditModal.value = false
  resetForm()
  if (editor.value) {
    editor.value.commands.clearContent()
  }
}

const submitForm = async () => {
  const result = await save()
  if (result.success) {
    closeModal()
  } else {
    alert('İşlem başarısız: ' + (result.error || 'Bilinmeyen hata'))
  }
}

// --- FileUploader'dan Gelen Event'i İşle ---
const updateImageUrl = (url) => {
  post.image = url
}

// Sayım GÖRÜNEN SAYFAYA ait: `total` sunucudan gelen genel toplam,
// kırılım ise o sayfadaki kayıtlardan. Sunucudan ayrı bir sayım istemek
// için ikinci bir uç gerekirdi; panelde bu ayrıntı o maliyete değmiyor.
const yayindaSayisi = computed(() => posts.value.filter((x) => x.isActive).length)
const taslakSayisi = computed(() => posts.value.filter((x) => !x.isActive).length)
</script>

<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- Başlık ve Ekleme Butonu -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold">
        Post Yönetim Paneli
        <span class="text-base font-normal text-gray-500">
          ({{ total }} yazı — {{ yayindaSayisi }} yayında, {{ taslakSayisi }} taslak)
        </span>
      </h1>
      <button
        @click="openAddForm"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Yeni Post Ekle
      </button>
    </div>

    <!-- Post Listesi -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="p in posts"
        :key="p.id"
        class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <img
          :src="p.image"
          :alt="p.title"
          class="w-full h-48 object-cover mb-4 rounded"
        >
        <div class="mb-2 flex items-center gap-2">
          <span
            v-if="p.isActive"
            class="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
          >YAYINDA</span>
          <span v-else class="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
            TASLAK
          </span>
          <span v-if="p.publishedAt" class="text-xs text-gray-500">
            {{ new Date(p.publishedAt).toLocaleDateString('tr-TR') }}
          </span>
        </div>
        <h3 class="text-xl font-semibold mb-2">{{ p.title }}</h3>
        <p class="text-gray-600 text-sm mb-4">{{ p.excerpt }}</p>
        <div class="flex flex-wrap gap-2">
          <button
            @click="selectPost(p.slug)"
            :disabled="isLoadingItem"
            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Düzenle
          </button>
          <button
            v-if="!p.isActive"
            @click="yayinDegistir(p.slug, true)"
            :disabled="yayinIsleniyor === p.slug"
            class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {{ yayinIsleniyor === p.slug ? 'İşleniyor…' : 'Yayına Al' }}
          </button>
          <button
            v-else
            @click="yayinDegistir(p.slug, false)"
            :disabled="yayinIsleniyor === p.slug"
            class="px-3 py-1 border border-amber-500 text-amber-800 rounded hover:bg-amber-50 disabled:opacity-50"
          >
            {{ yayinIsleniyor === p.slug ? 'İşleniyor…' : 'Yayından Kaldır' }}
          </button>
          <button
            @click="selectedSlug = p.slug; showDeleteModal = true"
            class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sil
          </button>
        </div>
      </div>
    </div>

    <!-- Sayfalama -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 mt-8">
      <button
        @click="goToPage(page - 1)"
        :disabled="page <= 1"
        class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Önceki
      </button>
      <span class="text-gray-600">Sayfa {{ page }} / {{ totalPages }}</span>
      <button
        @click="goToPage(page + 1)"
        :disabled="page >= totalPages"
        class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sonraki
      </button>
    </div>

    <!-- Düzenleme/Ekleme Modalı -->
    <div 
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">{{ post.id ? 'Post Düzenle' : 'Yeni Post Ekle' }}</h2>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- Temel Bilgiler -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 font-medium">Başlık</label>
              <input 
                v-model="post.title" 
                @input="generateSlug"
                type="text" 
                class="w-full p-2 border rounded"
                required
              >
            </div>
            <div>
              <label class="block mb-2 font-medium">Slug</label>
              <input 
                v-model="post.slug" 
                type="text" 
                class="w-full p-2 border rounded"
                required
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 font-medium">Alt Başlık</label>
              <input 
                v-model="post.subtitle" 
                type="text" 
                class="w-full p-2 border rounded"
              >
            </div>
            <div>
              <label class="block mb-2 font-medium">Kısa Başlık</label>
              <input 
                v-model="post.shortTitle" 
                type="text" 
                class="w-full p-2 border rounded"
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 font-medium">Yazar</label>
              <input 
                v-model="post.author" 
                type="text" 
                class="w-full p-2 border rounded"
                required
              >
            </div>
            <div>
              <label class="block mb-2 font-medium">Görsel URL</label>
              <input 
                v-model="post.image" 
                type="text" 
                class="w-full p-2 border rounded"
                readonly
              >
            </div>
            <div class="col-span-1">
              <FileUploader @file-uploaded="updateImageUrl" />
            </div>

            <div class="col-span-1 md:col-span-2">
              <label class="block mb-2 font-medium">Görsel Açıklaması (alt metni)</label>
              <input
                v-model="post.imageAlt"
                type="text"
                maxlength="125"
                class="w-full p-2 border rounded"
                placeholder="Örn: Karton kutulara yapıştırılmış oda etiketleri yakın plan"
              >
              <p class="mt-1 text-xs text-gray-500">
                Ne <strong>görüldüğünü</strong> anlatın, yazının konusunu değil.
                Google görsel aramada ve ekran okuyucularda bu metin kullanılır.
                Boş bırakılırsa başlıktan otomatik bir metin üretilir.
              </p>
            </div>
          </div>

          <!-- İçerik Editörü -->
          <div>
            <label class="block mb-2 font-medium">İçerik</label>
            <div class="border rounded p-2 min-h-[200px]">
              <div v-if="editor" class="editor-toolbar">
                <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
                  H2
                </button>
                <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
                  H3
                </button>
                <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
                  Kalın
                </button>
                <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
                  İtalik
                </button>
                <button @click="editor.chain().focus().toggleUnderline().run()" :class="{ 'is-active': editor.isActive('underline') }">
                  Altı Çizili
                </button>
                <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
                  Madde Listesi
                </button>
                <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }">
                  Numara Listesi
                </button>
                <button @click="addImage" type="button">
                  Resim Ekle
                </button>
              </div>
              <editor-content :editor="editor" class="prose max-w-none" />
            </div>
          </div>

          <!-- Kısa Açıklama -->
          <div>
            <label class="block mb-2 font-medium">Kısa Açıklama (Kartlarda Gösterilecek)</label>
            <textarea
              v-model="post.excerpt"
              class="w-full p-2 border rounded"
              rows="3"
              maxlength="160"
            ></textarea>
          </div>

          <!--
            ARAMA BAŞLIĞI — yazı başlığından AYRI ve boş bırakılabilir.
            Blogda bu alan en çok işe yarayan yer: yazı başlıkları doğal
            olarak uzun ("Taşınırken Eşya Sadeleştirme: Neyi Götürmeli,
            Neyi Bırakmalı?") ve sonuna marka eklenince Google kesme
            noktasını cümlenin ortasına düşürüyor. Buraya kısaltılmış hâli
            yazılırsa aramada tam görünür.
          -->
          <div>
            <label for="pst-metatitle" class="block mb-2 font-medium">Google Arama Başlığı</label>
            <input
              id="pst-metatitle"
              v-model="post.metaTitle"
              type="text"
              class="w-full p-2 border rounded"
              maxlength="70"
              placeholder="Taşınırken Eşya Sadeleştirme Rehberi"
            />
            <p class="text-xs mt-1" :class="(post.metaTitle || '').length > 60 ? 'text-amber-700' : 'text-gray-500'">
              {{ (post.metaTitle || '').length }} / 60 karakter —
              60 üstü Google sonuçlarında kesilir.
              Boş bırakılırsa otomatik üretilir: <strong>yazı başlığı | marka</strong>
            </p>
          </div>

          <!--
            ARAMA AÇIKLAMASI — kısa açıklamadan ayrı.
            Blog yazıları BİLGİLENDİRİCİ içerik: buraya satış cümlesi değil,
            yazının cevapladığı sorunun vaadi yazılmalı. "Ücretsiz keşif"
            gibi bir çağrı, bilgi arayan kişide tıklanmayı DÜŞÜRÜR.
          -->
          <div>
            <label for="pst-meta" class="block mb-2 font-medium">Google Arama Açıklaması</label>
            <textarea
              id="pst-meta"
              v-model="post.metaDescription"
              class="w-full p-2 border rounded"
              rows="3"
              maxlength="165"
              placeholder="Yazının cevapladığı soruyu vaat edin. Satış cümlesi kullanmayın."
            ></textarea>
            <p class="text-xs mt-1" :class="(post.metaDescription || '').length > 155 ? 'text-amber-700' : 'text-gray-500'">
              {{ (post.metaDescription || '').length }} / 155 karakter — hedef 140-155.
              Boş bırakılırsa yukarıdaki kısa açıklama kullanılır.
            </p>
          </div>

          <!-- Form Butonları -->
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              İptal
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              :aria-busy="isSaving"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSaving ? 'Kaydediliyor...' : (post.id ? 'Güncelle' : 'Oluştur') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Silme Onay Modalı -->
    <div 
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6">
        <h3 class="text-lg font-bold mb-4">Postu Sil</h3>
        <p class="mb-4">Bu postu kalıcı olarak silmek istediğinize emin misiniz?</p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            :disabled="isDeleting"
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            İptal
          </button>
          <button
            @click="deletePost"
            :disabled="isDeleting"
            :aria-busy="isDeleting"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isDeleting ? 'Siliniyor...' : 'Sil' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.ProseMirror {
  min-height: 200px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.ProseMirror:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.ProseMirror p {
  margin-bottom: 1em;
}

.editor-toolbar {
  @apply flex flex-wrap gap-2 p-2 border-b;
}

.editor-toolbar button {
  @apply px-3 py-1 bg-gray-100 rounded hover:bg-gray-200;
}

.editor-toolbar button.is-active {
  @apply bg-blue-100 text-blue-600;
}
</style>
