<script setup>
/**
 * SUREC ADIMLARI — ANA SAYFANIN 03. BOLUMU.
 *
 * Bu ekran daha once hicbir herkese acik sayfaya bagli degildi: kayit
 * yaziliyordu, sitede hicbir sey degismiyordu. Artik ana sayfadaki Surec
 * bolumunu dogrudan besliyor.
 *
 * ADIM SAYISI SABIT — BES. Bolumun kaydirma koreografisi adim basina ayri
 * yazilmis (nth-child(1..5) devirleri, kare basina kadraj). Bu yuzden
 * "adim ekle" ve "adim sil" dugmeleri KALDIRILDI; sunucu da bes disinda
 * bir sayiyi reddediyor.
 */
const { form, message, showDeleteModal, recordId, isSaving, isDeleting, save, remove } = useSectionCrud('process', 'process-section', {
  mainTitle: '',
  description: '',
  steps: [],
});

/** Adim gorseli FileUploader'dan geldiginde ilgili satira yaziliyor. */
const gorselAta = (url, index) => {
  form.steps[index].imagePath = url
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
    <admin-base-panel-durumu durum="canli" nerede="Ana sayfadaki Süreç bölümünü besliyor (03 / TAŞIMANIN İÇİNDE NE OLUYOR). Adım etiketi, başlık, metin, fotoğraf ve alt metin doğrudan sayfaya çıkıyor." />
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Taşınma Sürecimiz Bölümü Yönetimi ⚙️</h1>

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

      <h2 class="text-xl font-semibold border-b pb-2 text-primary pt-4">Süreç Adımları</h2>
      <p class="text-sm text-gray-500">
        Sıralaması yukarıdan aşağıya doğru gösterim sırasıdır (1. adım, 2. adım…).
        <strong>Adım sayısı beşte sabit:</strong> bölümün kaydırma koreografisi adım başına ayrı
        yazıldığı için ekleme/çıkarma yok.
      </p>

      <div class="space-y-4">
        <div
          v-for="(step, index) in form.steps"
          :key="'step-' + (step.id || index)"
          class="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-150"
        >
          <div class="mb-2">
            <h4 class="font-bold text-lg text-gray-700">Adım #{{ index + 1 }}</h4>
          </div>

          <div class="space-y-2">
            <div>
              <label :for="'step-label-' + index" class="block text-sm font-medium text-gray-600">Adım etiketi (künye)</label>
              <input v-model="step.label" :id="'step-label-' + index" type="text" class="w-full p-2 border rounded" placeholder="Örn: KEŞİF" />
            </div>
            <div>
              <label :for="'step-title-' + index" class="block text-sm font-medium text-gray-600">Başlık</label>
              <input v-model="step.title" :id="'step-title-' + index" type="text" class="w-full p-2 border rounded" placeholder="Örn: Önce hareketi değil, koşulları çıkarırız." required />
            </div>
            <div>
              <label :for="'step-desc-' + index" class="block text-sm font-medium text-gray-600">Açıklama</label>
              <textarea v-model="step.description" :id="'step-desc-' + index" rows="3" class="w-full p-2 border rounded" placeholder="Adımın anlatımı" required></textarea>
            </div>

            <div class="pt-2 border-t border-gray-200">
              <FileUploader :label="`${index + 1}. adımın fotoğrafını yükle`" @file-uploaded="(url) => gorselAta(url, index)" />
              <label :for="'step-image-' + index" class="block text-sm font-medium text-gray-600 mt-2">Fotoğraf yolu</label>
              <input v-model="step.imagePath" :id="'step-image-' + index" type="text" class="w-full p-2 border rounded" placeholder="/images/stage-a.webp" />
            </div>
            <div>
              <label :for="'step-alt-' + index" class="block text-sm font-medium text-gray-600">Fotoğrafın alt metni</label>
              <textarea v-model="step.imageAlt" :id="'step-alt-' + index" rows="2" class="w-full p-2 border rounded" placeholder="Karede gerçekten ne olduğunu yazın"></textarea>
            </div>

            <div class="grid gap-2 md:grid-cols-2 pt-2 border-t border-gray-200">
              <div>
                <label :for="'step-linklabel-' + index" class="block text-sm font-medium text-gray-600">Bağlantı etiketi (isteğe bağlı)</label>
                <input v-model="step.linkLabel" :id="'step-linklabel-' + index" type="text" class="w-full p-2 border rounded" placeholder="Örn: Hizmet kapsamımız" />
              </div>
              <div>
                <label :for="'step-linkhref-' + index" class="block text-sm font-medium text-gray-600">Bağlantı adresi</label>
                <input v-model="step.linkHref" :id="'step-linkhref-' + index" type="text" class="w-full p-2 border rounded" placeholder="/hizmetlerimiz" />
              </div>
              <p class="md:col-span-2 text-xs text-gray-500">Bağlantı ancak İKİSİ de doluysa görünür.</p>
            </div>
          </div>
        </div>
      </div>



      <div class="flex space-x-4 pt-6 border-t mt-6">
        <button type="submit" :disabled="isSaving" :aria-busy="isSaving" class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600 transition duration-150 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isSaving ? 'Kaydediliyor...' : (recordId ? 'Tümünü Güncelle' : 'Oluştur') }}
        </button>
        <button v-if="recordId" type="button" @click="showDeleteModal = true" :disabled="isSaving" class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          Kaydı Sil
        </button>
      </div>
    </form>

    <AdminModalDynamicDeleteModal
      :show="showDeleteModal"
      :loading="isDeleting"
      title="Süreç Bölümü Kaydını Sil"
      message="Bu bölümdeki tüm verileri (ana metinler ve tüm adımlar) silmek istediğinize emin misiniz? Bu işlem geri alınamaz!"
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
