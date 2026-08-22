<script setup>
/**
 * ÜST MENÜ — YALNIZ MARKA ETİKETİ.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NE KALDIRILDI (M6)
 *
 * Bu ekran "Sosyal Bağlantılar" ve "İletişim Bilgileri" listelerini de
 * yönetiyordu. ÖLÇÜLDÜ: `components/fixed/Navbar.vue` bu kayıttan tek bir
 * alan okuyor — `logo`. Sosyal bağlantılar ve iletişim satırları hiçbir
 * yerde basılmıyordu.
 *
 * Üstelik ikisi de İKİNCİ KAYNAKTI: navbar'daki telefon ve WhatsApp Site
 * Ayarları'ndan geliyor, sosyal hesaplar da öyle. Yönetici buraya farklı
 * bir numara yazsa sitede hiçbir şey değişmiyor, ama değiştiğini sanıyordu.
 *
 * Tablolar ve kayıtlar DURUYOR (NavbarSocialLink: 0, NavbarContacts: 1).
 */
const { form, message, showDeleteModal, recordId, isSaving, isDeleting, save, remove } = useSectionCrud('navbar', 'navbars', {
  logo: '',
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
    <admin-base-panel-durumu
      durum="canli"
      nerede="Marka etiketi sitenin üst menüsünde görünüyor. Boş bırakılırsa Site Ayarları'ndaki marka adı kullanılır."
    />
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Üst Menü Yönetimi</h1>

    <p v-if="message" :class="['mt-4 p-3 rounded', message.includes('hata') || message.includes('sorun') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700']">
      {{ message }}
    </p>

    <form @submit.prevent="save" class="space-y-6 bg-white p-6 shadow rounded-lg">
      <div>
        <label for="logo" class="block font-medium text-gray-700 mb-1">Marka etiketi</label>
        <input id="logo" v-model="form.logo" type="text" class="w-full p-3 border border-gray-300 rounded-lg" placeholder="İstanbul Eve Nakliyat" />
        <p class="mt-2 text-sm text-gray-500">
          Üst menüde solda görünen yazı. Boş bırakılırsa Site Ayarları'ndaki
          marka adı kullanılır.
        </p>
      </div>

      <!-- "SOSYAL BAĞLANTILAR" VE "İLETİŞİM BİLGİLERİ" LİSTELERİ
           KALDIRILDI (M6) — gerekçe script bloğunda. Telefon, WhatsApp ve
           sosyal hesaplar tek yerden yönetiliyor:
           <NuxtLink to="/evdeneveyonetim/site" class="font-semibold underline">Site Genel</NuxtLink>. -->

      <div class="flex space-x-4 pt-6 border-t mt-6">
        <button type="submit" :disabled="isSaving" :aria-busy="isSaving" class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50">
          {{ recordId ? 'Güncelle' : 'Oluştur' }}
        </button>
        <button v-if="recordId" type="button" @click="showDeleteModal = true" :disabled="isSaving" class="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold disabled:opacity-50">
          Kaydı Sil
        </button>
      </div>
    </form>

    <AdminModalDynamicDeleteModal
      :show="showDeleteModal"
      :loading="isDeleting"
      title="Üst Menü Kaydını Sil"
      message="Marka etiketi silinecek; üst menüde Site Ayarları'ndaki marka adı görünür. Emin misiniz?"
      confirmText="Evet, Kaydı Sil"
      cancelText="İptal Et"
      @confirm="remove"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>
