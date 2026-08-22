<script setup>
const { form, message, showDeleteModal, recordId, isSaving, isDeleting, save, remove } = useSectionCrud('about-section', 'about-section', {
  mainTitle: '',
  description1: '',
  description2: '',
  description3: '',
  historyTitle: '',
  historyText1: '',
  historyText2: '',
  historyText3: '',
  // seoTitle / seoDescription / teamImage / teamImageAlt / services / stats
  // BİLEREK YOK — hiçbiri cephede okunmuyor. SEO'nun tek sahibi
  // Meta("about") kaydı (bkz. composables/usePageSeo.ts). Yazma yolu M6'da
  // sunucu tarafında da kapatıldı, yani bu alanlar artık uç noktaya
  // gönderilse bile kabul edilmiyor.
});

</script>

<template>
  <div class="max-w-6xl mx-auto p-4">
    <admin-base-panel-durumu
      durum="canli"
      nerede="Bu sekiz alan /hakkimizda sayfasında görünüyor. Sayfanın SEO başlığı ve açıklaması BURADA DEĞİL — Meta Taglar ekranındaki 'about' kaydından geliyor."
    />
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Hakkımızda Bölümü Yönetimi ⚙️</h1>

    <p v-if="message" :class="['mt-4 p-3 rounded', message.includes('hata') || message.includes('sorun') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700']">
      {{ message }}
    </p>

    <form @submit.prevent="save" class="space-y-8 bg-white p-6 shadow-lg rounded-lg">

      <h2 class="text-2xl font-semibold border-b pb-2 text-primary mb-6">Başlık ve Tanıtım</h2>

      <div>
        <label for="mainTitle" class="block font-medium text-gray-700 mb-1">Ana Başlık</label>
        <input id="mainTitle" v-model="form.mainTitle" type="text" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <div>
        <label for="description1" class="block font-medium text-gray-700 mb-1">1. Paragraf</label>
        <textarea id="description1" v-model="form.description1" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"></textarea>
      </div>

      <div>
        <label for="description2" class="block font-medium text-gray-700 mb-1">2. Paragraf</label>
        <textarea id="description2" v-model="form.description2" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"></textarea>
      </div>

      <div>
        <label for="description3" class="block font-medium text-gray-700 mb-1">3. Paragraf</label>
        <textarea id="description3" v-model="form.description3" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"></textarea>
      </div>

      <!-- "TAKIM FOTOĞRAFI" BÖLÜMÜ KALDIRILDI (M6).

           Fotoğraf ve alt metni sayfadan çıkarılmıştı: görsel sentetikti ve
           "gerçek ekibimiz" diye sunuluyordu. Panelde kalması, olmayan bir
           görseli yönetiyormuş izlenimi veriyordu. Sütunlar ve değerler
           veri tabanında duruyor. -->

      <h2 class="text-2xl font-semibold border-b pb-2 text-primary pt-6">Şirket Tarihçesi</h2>

      <div>
        <label for="historyTitle" class="block font-medium text-gray-700 mb-1">Tarihçe Başlığı</label>
        <input id="historyTitle" v-model="form.historyTitle" type="text" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <div>
        <label for="historyText1" class="block font-medium text-gray-700 mb-1">Tarihçe 1. Paragraf</label>
        <textarea id="historyText1" v-model="form.historyText1" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"></textarea>
      </div>

      <div>
        <label for="historyText2" class="block font-medium text-gray-700 mb-1">Tarihçe 2. Paragraf</label>
        <textarea id="historyText2" v-model="form.historyText2" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"></textarea>
      </div>

      <div>
        <label for="historyText3" class="block font-medium text-gray-700 mb-1">Tarihçe 3. Paragraf</label>
        <textarea id="historyText3" v-model="form.historyText3" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"></textarea>
      </div>

      <!-- "HİZMET DETAYLARI" VE "İSTATİSTİKLER" BÖLÜMLERİ KALDIRILDI (M6).

           Altı hizmet kartı ve dört istatistik kaydı bu ekrandan
           düzenlenebiliyordu ama Hakkımızda sayfası ikisini de BASMIYOR:
           sayfa okuduğu alanları açık bir beyaz listeyle seçiyor ve
           `services`/`stats` o listede yok.

           Ayrıca gizli bir veri kaybı riski vardı: uç nokta her kaydetmede
           `aboutService.deleteMany` + `aboutStat.deleteMany` çalıştırıp
           gövdeden yeniden yaratıyordu. Yazma yolu sunucuda kapatıldı;
           kayıtlara artık hiç dokunulmuyor.

           TABLOLAR VE VERİLER DURUYOR: AboutService (6) ve AboutStat (4)
           kayıtlarının hiçbiri silinmedi. -->

      <!-- "SEO Ayarları" (SEO Başlığı / SEO Açıklaması) KALDIRILDI.
           Bu iki alan hiçbir sayfada okunmuyordu: Hakkımızda sayfasının
           başlığı ve açıklaması Meta/SEO panelinden ("about" kaydı)
           geliyor (bkz. composables/usePageSeo.ts). Burada durdukları
           sürece "SEO metnini değiştirdim ama Google'da bir şey
           değişmiyor" durumu üretiyor, üstelik aynı bilgi için ikinci ve
           çelişebilecek bir kaynak oluşturuyorlardı. Veritabanı sütunları
           yerinde; bu form artık o alanları göndermiyor. -->

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
      title="Hakkımızda Kaydını Sil"
      message="Bu bölümdeki tüm verileri (metinler, hizmetler ve istatistikler) silmek istediğinize emin misiniz? Bu işlem geri alınamaz!"
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
