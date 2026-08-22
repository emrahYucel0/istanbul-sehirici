<script setup>
const { form, message, showDeleteModal, recordId, isSaving, isDeleting, save, remove } = useSectionCrud('faq-section', 'faq-section', {
  mainTitle: '',
  // ÖLÜ ALANLAR KALDIRILDI (M6): description, ctaTitle, ctaButtonText,
  // ctaButtonLink, statsCards, images ve soru içindeki `details`. Hiçbirinin
  // herkese açık tüketicisi yoktu.
  //
  // `statsCards` burada eskiden "veri korunsun diye" taşınıyordu: bölüm
  // fabrikası her PUT'ta çocukları silip yeniden yarattığı için alanı
  // göndermeyi bırakmak kayıtları silerdi. Bu tur o düğümü sunucu tarafında
  // çözdü — uç nokta artık o kayıtlara HİÇ dokunmuyor, dolayısıyla panelin
  // ölü bir alanı ayakta tutma zorunluluğu da bitti.
  faqs: [],
});

// ------------------------------------
// DİNAMİK LİSTE İŞLEMLERİ (FAQ)
// ------------------------------------

const addFaq = () => {
  form.faqs.push({
    question: '',
    answer: '',
    order: form.faqs.length,
    isActive: true,
  })
}

const removeFaq = (index) => {
  form.faqs.splice(index, 1)
  form.faqs.forEach((faq, i) => faq.order = i)
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-4">
    <admin-base-panel-durumu durum="canli" nerede="Başlık ve AKTİF sorular ana sayfadaki Sorular bölümünde ve arama motoru SSS işaretlemesinde görünüyor. Pasif sorular hiçbir yerde görünmez." />
    <h1 class="text-3xl font-bold mb-6 text-gray-800">FAQ Section Yönetimi ❓</h1>

    <p v-if="message" :class="['mt-4 p-3 rounded', message.includes('hata') || message.includes('sorun') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700']">
      {{ message }}
    </p>

    <form @submit.prevent="save" class="space-y-8 bg-white p-6 shadow-lg rounded-lg">

      <h2 class="text-xl font-semibold border-b pb-2 text-primary">Temel İçerik</h2>

      <div>
        <label for="mainTitle" class="block font-medium text-gray-700 mb-1">Ana Başlık</label>
        <input id="mainTitle" v-model="form.mainTitle" type="text" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <!-- AÇIKLAMA VE CTA ALANLARI KALDIRILDI (M6).
           Dördünü de yalnız eski `Faq.vue` okuyordu; o bileşen hiçbir
           sayfada render edilmiyordu ve bu turda silindi. Ana sayfanın
           Sorular bölümü yalnız başlığı ve aktif soruları kullanıyor.
           Veri tabanı sütunları ve içindeki metinler DURUYOR. -->

      <!-- FAQ'lar Listesi -->
      <h2 class="text-xl font-semibold border-b pb-2 text-primary pt-4">Sıkça Sorulan Sorular</h2>

      <div class="space-y-6">
        <div
          v-for="(faq, index) in form.faqs"
          :key="'faq-' + (faq.id || index)"
          class="p-4 border-2 border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-150"
        >
          <div class="flex justify-between items-start mb-3">
            <h4 class="font-bold text-lg text-gray-700">Soru #{{ index + 1 }}</h4>
            <button :aria-label="`${index + 1}. Soruyu sil`" type="button" @click="removeFaq(index)" class="text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center transition duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label :for="'faq-question-' + index" class="block text-sm font-medium text-gray-600">Soru</label>
              <input v-model="faq.question" :id="'faq-question-' + index" type="text" class="w-full p-2 border rounded" placeholder="Nakliye öncesi eşyalarımı nasıl hazırlamalıyım?" required />
            </div>

            <div>
              <label :for="'faq-answer-' + index" class="block text-sm font-medium text-gray-600">Cevap</label>
              <textarea v-model="faq.answer" :id="'faq-answer-' + index" rows="3" class="w-full p-2 border rounded" placeholder="Detaylı cevap..." required></textarea>
            </div>

            <div class="flex items-center">
              <input v-model="faq.isActive" :id="'faq-active-' + index" type="checkbox" class="mr-2" />
              <label :for="'faq-active-' + index" class="text-sm text-gray-600">Aktif</label>
            </div>

            <!-- "Detaylar (Madde İşaretli Liste)" bloğu KALDIRILDI (M6):
                 `FaqDetail` kayıtlarını hiçbir herkese açık sayfa okumuyor. -->
          </div>
        </div>
      </div>

      <button type="button" @click="addFaq" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-150 flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        <span>Yeni Soru Ekle</span>
      </button>

      <!-- İSTATİSTİK KARTLARI VE GÖRSELLER BÖLÜMLERİ KALDIRILDI (M6).

           İstatistik kartları daha önce cepheden çıkarılmış ama panelde
           "veri korunsun" gerekçesiyle taşınmaya devam ediyordu. Görseller
           ise hâlâ düzenlenebiliyordu: yönetici görsel yüklüyor, alt metin
           yazıyor, kaydediyor — ve hiçbir sayfada görünmüyordu.

           İkisinin de tek tüketicisi silinen `Faq.vue` idi. Yazma yolu
           sunucu tarafında da kapatıldı (faq-section.config.ts), yani uç
           nokta bu kayıtlara artık DOKUNMUYOR; panelin onları ayakta
           tutması da gerekmiyor.

           TABLOLAR VE VERİLER DURUYOR: FaqStatsCard, FaqImage ve FaqDetail
           kayıtlarının hiçbiri silinmedi. -->

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
      title="FAQ Section Kaydını Sil"
      message="Bu bölümün başlığı ve SORULARI silinecek. Ana sayfadaki Sorular bölümü boşalır. Emin misiniz?"
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
