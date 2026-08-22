<script setup>
const { form, message, showDeleteModal, recordId, isSaving, isDeleting, save, remove } = useSectionCrud('siteSettings', 'site-settings', {
  brandName: '',
  siteName: '',
  siteDescription: '',
  phone: '',
  mobilePhone: '',
  whatsAppNumber: '',
  email: '',
  address: '',
  facebookUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  githubUrl: '',
  // ANALİTİK ALANLARI KALDIRILDI (M6) — gerekçe şablondaki nota yazılı.
  // Formda bulunmadıkları için istek gövdesine de girmiyorlar; sunucu
  // şeması da artık onları tanımıyor. Veri tabanı sütunları duruyor.
  ctaLabel: '',
  ctaLink: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  footerText: '',
  workingHours: '',
  latitude: null,
  longitude: null,
  priceRange: '',
  googleMapsEmbed: '',
  logo: '',
  favicon: '',
  ogImage: '',
});

const updateLogoUrl = (url) => {
  form.logo = url
  message.value = 'Logo başarıyla yüklendi! Lütfen "Tümünü Güncelle" butonuna tıklayarak kaydedin.'
}

const updateFaviconUrl = (url) => {
  form.favicon = url
  message.value = 'Favicon başarıyla yüklendi! Lütfen "Tümünü Güncelle" butonuna tıklayarak kaydedin.'
}

const updateOgImageUrl = (url) => {
  form.ogImage = url
  message.value = 'OG görseli başarıyla yüklendi! Lütfen "Tümünü Güncelle" butonuna tıklayarak kaydedin.'
}
</script>

<template>
  <div class="max-w-7xl mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Site Genel Ayarları ⚙️</h1>

    <p v-if="message" :class="['mt-4 p-3 rounded', message.includes('hata') || message.includes('Hata') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700']">
      {{ message }}
    </p>

    <form @submit.prevent="save" class="space-y-8 bg-white p-6 shadow-lg rounded-lg">

      <!-- 1. TEMEL BİLGİLER -->
      <div class="border rounded-lg p-4">
        <h2 class="text-xl font-semibold text-primary mb-4">🏢 Temel Bilgiler</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block font-medium text-gray-700 mb-1">Marka Adı</label>
            <input v-model="form.brandName" type="text" class="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label class="block font-medium text-gray-700 mb-1">Site Adı</label>
            <input v-model="form.siteName" type="text" class="w-full p-3 border rounded-lg" />
          </div>
        </div>
        <div class="mt-4">
          <label class="block font-medium text-gray-700 mb-1">Site Açıklaması</label>
          <textarea v-model="form.siteDescription" rows="3" class="w-full p-3 border rounded-lg"></textarea>
        </div>
      </div>

      <!-- 2. İLETİŞİM BİLGİLERİ -->
      <div class="border rounded-lg p-4">
        <h2 class="text-xl font-semibold text-primary mb-4">📞 İletişim Bilgileri</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label>Telefon</label><input v-model="form.phone" type="tel" class="w-full p-3 border rounded-lg" /></div>
          <div><label>Cep Telefonu</label><input v-model="form.mobilePhone" type="tel" class="w-full p-3 border rounded-lg" /></div>
          <div><label>WhatsApp Numarası</label><input v-model="form.whatsAppNumber" type="tel" class="w-full p-3 border rounded-lg" /></div>
          <div><label>E-posta</label><input v-model="form.email" type="email" class="w-full p-3 border rounded-lg" /></div>
        </div>
        <div class="mt-4">
          <label>Adres</label>
          <textarea v-model="form.address" rows="2" class="w-full p-3 border rounded-lg"></textarea>
        </div>
      </div>

      <!-- 3. SOSYAL MEDYA -->
      <div class="border rounded-lg p-4">
        <h2 class="text-xl font-semibold text-primary mb-4">🌐 Sosyal Medya</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label>Facebook</label><input v-model="form.facebookUrl" type="url" class="w-full p-3 border rounded-lg" /></div>
          <div><label>Instagram</label><input v-model="form.instagramUrl" type="url" class="w-full p-3 border rounded-lg" /></div>
          <div><label>Twitter/X</label><input v-model="form.twitterUrl" type="url" class="w-full p-3 border rounded-lg" /></div>
          <div><label>LinkedIn</label><input v-model="form.linkedinUrl" type="url" class="w-full p-3 border rounded-lg" /></div>
          <div><label>YouTube</label><input v-model="form.youtubeUrl" type="url" class="w-full p-3 border rounded-lg" /></div>
          <div><label>GitHub</label><input v-model="form.githubUrl" type="url" class="w-full p-3 border rounded-lg" /></div>
        </div>
      </div>

      <!-- 4. GENEL ÇAĞRI (CTA) -->
      <div class="border rounded-lg p-4">
        <h2 class="text-xl font-semibold text-primary mb-4">📣 Genel Çağrı Düğmesi</h2>
        <p class="mb-4 text-sm text-gray-600">
          İstanbul dışı bölge sayfalarının kapanış bandındaki düğme.
          <strong>Ana sayfanın kapanış düğmesi burada değil</strong> —
          o, Ana Sayfa ekranındaki “Kapanış” bölümünden yönetiliyor.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="ss-cta-label">Düğme metni</label>
            <input id="ss-cta-label" v-model="form.ctaLabel" maxlength="60" class="w-full p-3 border rounded-lg" placeholder="Ücretsiz Keşif" />
          </div>
          <div>
            <label for="ss-cta-link">Düğme adresi</label>
            <input id="ss-cta-link" v-model="form.ctaLink" maxlength="191" class="w-full p-3 border rounded-lg" placeholder="/iletisim" />
          </div>
        </div>
      </div>

      <!--
        ANALİTİK & TAKİP KODLARI BÖLÜMÜ KALDIRILDI (M6).

        Burada üç alan vardı: Google Analytics ID, Google Tag Manager ID ve
        Google AdSense ID. Üçünün de herkese açık tüketicisi ölçüldü ve
        SIFIR çıktı: projede gtag, GTM ya da dataLayer yükleyen tek bir
        satır kod yok. Yani yönetici bu alanları dolduruyor, kaydediyor,
        veri tabanına yazılıyor ve hiçbir şey olmuyordu.

        Böyle bir alanı panelde tutmak yalnız işe yaramamakla kalmıyor,
        aktif olarak yanlış bilgi veriyor: işletme ölçüm yaptığını sanıp
        gerçekte hiçbir veri toplamıyor.

        NEDEN "ÇALIŞIR HÂLE GETİRMEK" SEÇİLMEDİ: projede rıza (consent)
        altyapısı yok. Üçüncü taraf analitik betiğini rızasız yüklemek bu
        turun işi değil ve uydurma bir çerez onayı ürünü icat etmek de
        değil. Alanlar geri geldiğinde önce rıza altyapısı gerekiyor.

        Site içi ölçüm ETKİLENMEDİ: `SiteEvent` / `/api/events` akışı
        (plugins/donusum-takibi.client.ts) aynen çalışıyor ve Talepler
        ekranındaki istatistikleri o besliyor.

        Veri tabanı sütunları SİLİNMEDİ.
      -->
      <div class="border border-gray-300 bg-gray-50 rounded-lg p-4">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">📊 Analitik</h2>
        <p class="text-sm text-gray-600">
          Google Analytics / Tag Manager / AdSense alanları bu ekrandan
          <strong>kaldırıldı</strong>: sitede bu betikleri yükleyen bir kod ve
          çerez onayı altyapısı yok, dolayısıyla girilen kimlikler hiçbir şey
          yapmıyordu. Ziyaretçi ve dönüşüm sayıları
          <NuxtLink to="/evdeneveyonetim/leads" class="font-semibold underline">Talepler &amp; İstatistik</NuxtLink>
          ekranında, site içi ölçümden geliyor.
        </p>
      </div>

      <!-- 5. SEO & META
           Bu üç alanın davranışı birbirinden ÇOK farklı; etiketler bunu
           söylemediği için admin üçünü de eşit önemde sanıyordu. Sayfaların
           kendi başlık/açıklamaları Admin > Sayfa Başlık ve Açıklamaları
           ekranında yönetiliyor — burası yalnızca son çare yedeği. -->
      <div class="border rounded-lg p-4">
        <h2 class="text-xl font-semibold text-primary mb-4">🔍 SEO & Meta Etiketleri</h2>
        <p class="text-sm text-gray-500 mb-4">
          Sayfa bazlı başlık ve açıklamalar
          <strong>Sayfa Başlık ve Açıklamaları</strong> ekranındadır. Buradakiler
          yalnızca orada hiçbir metin bulunamazsa devreye girer.
        </p>

        <div>
          <label for="ss-meta-title">Meta Başlık</label>
          <input id="ss-meta-title" v-model="form.metaTitle" class="w-full p-3 border rounded-lg" />
          <p class="mt-1 text-xs text-amber-700">
            Bu alan şu anda hiçbir yerde kullanılmıyor — her sayfanın başlığı kendi
            kaydından geliyor. Doldurmanız gerekmez.
          </p>
        </div>

        <div class="mt-4">
          <label for="ss-meta-desc">Meta Açıklama</label>
          <textarea id="ss-meta-desc" v-model="form.metaDescription" rows="2" maxlength="165" class="w-full p-3 border rounded-lg"></textarea>
          <p class="mt-1 text-xs" :class="(form.metaDescription || '').length > 155 ? 'text-amber-700' : 'text-gray-500'">
            {{ (form.metaDescription || '').length }} / 155 karakter — site geneli son yedek açıklama.
          </p>
        </div>

        <div class="mt-4">
          <label for="ss-meta-kw">Meta Anahtar Kelimeler</label>
          <input id="ss-meta-kw" v-model="form.metaKeywords" class="w-full p-3 border rounded-lg" placeholder="kelime1, kelime2, kelime3" />
          <p class="mt-1 text-xs text-amber-700">
            Google bu etiketi 2009'dan beri tamamen yok sayıyor; sıralamaya etkisi
            yoktur. Boş bırakabilirsiniz.
          </p>
        </div>
      </div>

      <!-- 6. ALT BİLGİ -->
      <div class="border rounded-lg p-4">
        <h2 class="text-xl font-semibold text-primary mb-4">📄 Alt Bilgi</h2>
        <div>
          <label for="ss-footer-text">İşletme tanımı</label>
          <textarea
            id="ss-footer-text"
            v-model="form.footerText"
            rows="2"
            class="w-full p-3 border rounded-lg"
            placeholder="İstanbul'da evden eve nakliyat, ofis taşıma, parça eşya…"
          ></textarea>
          <p class="mt-1 text-sm text-gray-600">
            Alt bilgide marka adının altında, <strong>her sayfada</strong> görünen
            tek cümle. Boş bırakılırsa hiç basılmaz.
          </p>
        </div>

        <!--
          "COPYRIGHT METNİ" ALANI KALDIRILDI (M7).

          Alt bilgi telif satırını `© {yıl} {marka adı}` olarak kendisi
          üretiyor ve bu alanı HİÇ okumuyor — ölçüldü. Panelde durduğu
          sürece "değiştirdim ama sitede bir şey olmadı" üretiyordu; M6'da
          kapatılan hata sınıfının aynısı. Veri tabanı sütunu duruyor.
        -->
      </div>

      <!-- 7. DİĞER BİLGİLER (Çalışma Saatleri, Harita) -->
      <div class="border rounded-lg p-4">
        <h2 class="text-xl font-semibold text-primary mb-4">🕒 Diğer Bilgiler</h2>
        <div>
          <label>Çalışma Saatleri</label>
          <textarea v-model="form.workingHours" rows="2" class="w-full p-3 border rounded-lg" placeholder="Pazartesi - Cuma: 09:00 - 18:00"></textarea>
        </div>
        <div class="mt-4">
          <label>Google Maps Embed Kodu</label>
          <textarea v-model="form.googleMapsEmbed" rows="3" class="w-full p-3 border rounded-lg" placeholder="<iframe src='...'></iframe>"></textarea>
        </div>
      </div>

      <!--
        YAPISAL VERİ — Google'ın yerel işletme sonuçlarında kullandığı alanlar.
        Boş bırakılanlar şemaya HİÇ eklenmez; yanlış/uydurma değer göndermek
        eksik göndermekten kötüdür.
      -->
      <div class="border rounded-lg p-4">
        <h2 class="text-xl font-semibold text-primary mb-4">📍 Google İşletme Bilgileri</h2>
        <p class="text-sm text-gray-500 mb-4">
          Arama sonuçlarında işletme kartınızı besleyen alanlar. Boş bırakabilirsiniz;
          o zaman bu bilgiler Google'a hiç gönderilmez.
        </p>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="ss-lat">Enlem (latitude)</label>
            <input id="ss-lat" v-model="form.latitude" type="number" step="0.000001" min="-90" max="90" class="w-full p-3 border rounded-lg" placeholder="40.877200" />
          </div>
          <div>
            <label for="ss-lng">Boylam (longitude)</label>
            <input id="ss-lng" v-model="form.longitude" type="number" step="0.000001" min="-180" max="180" class="w-full p-3 border rounded-lg" placeholder="29.258900" />
          </div>
        </div>
        <p class="mt-2 text-xs text-gray-500">
          Google Haritalar'da işletmenize sağ tıklayın; en üstteki iki sayı sırasıyla enlem ve boylamdır.
        </p>
        <div class="mt-4">
          <label for="ss-fiyat">Fiyat aralığı</label>
          <input id="ss-fiyat" v-model="form.priceRange" type="text" class="w-full p-3 border rounded-lg" placeholder="6.000 - 21.000 TL" />
          <p class="mt-1 text-xs text-gray-500">Serbest metin. "₺₺" gibi sembolik bir gösterim de kullanılabilir.</p>
        </div>
      </div>

      <!-- 8. GÖRSEL YÖNETİMİ -->
      <div class="border rounded-lg p-4">
        <h2 class="text-xl font-semibold text-primary mb-4">🖼️ Görsel Yönetimi</h2>

        <!-- Logo -->
        <div class="mb-6 p-3 bg-gray-50 rounded">
          <label class="font-semibold block mb-2">Logo</label>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <input :value="form.logo" type="text" readonly class="w-full p-2 border rounded bg-gray-100" />
              <p v-if="form.logo" class="text-sm mt-1">
                <a :href="form.logo" target="_blank" class="text-blue-500">Görüntüle</a>
              </p>
            </div>
            <FileUploader @file-uploaded="updateLogoUrl" label="Logo Yükle (JPG, PNG, WEBP)" />
          </div>
        </div>

        <!-- Favicon -->
        <div class="mb-6 p-3 bg-gray-50 rounded">
          <label class="font-semibold block mb-2">Favicon</label>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <input :value="form.favicon" type="text" readonly class="w-full p-2 border rounded bg-gray-100" />
              <p v-if="form.favicon" class="text-sm mt-1">
                <a :href="form.favicon" target="_blank" class="text-blue-500">Görüntüle</a>
              </p>
            </div>
            <FileUploader @file-uploaded="updateFaviconUrl" label="Favicon Yükle (ICO, PNG)" />
          </div>
        </div>

        <!-- Open Graph Görseli -->
        <div class="p-3 bg-gray-50 rounded">
          <label class="font-semibold block mb-2">OG Görseli (Sosyal Medya Paylaşım)</label>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <input :value="form.ogImage" type="text" readonly class="w-full p-2 border rounded bg-gray-100" />
              <p v-if="form.ogImage" class="text-sm mt-1">
                <a :href="form.ogImage" target="_blank" class="text-blue-500">Görüntüle</a>
              </p>
            </div>
            <FileUploader @file-uploaded="updateOgImageUrl" label="OG Görseli Yükle (JPG, PNG, WEBP)" />
          </div>
        </div>
      </div>

      <div class="flex space-x-4 pt-4 border-t">
        <button type="submit" :disabled="isSaving" :aria-busy="isSaving" class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          {{ recordId ? 'Tümünü Güncelle' : 'Oluştur' }}
        </button>
        <button v-if="recordId" type="button" @click="showDeleteModal = true" :disabled="isSaving" class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          Tüm Ayarları Sil
        </button>
      </div>
    </form>

    <AdminModalDynamicDeleteModal
      :show="showDeleteModal"
      :loading="isDeleting"
      title="Site Ayarlarını Sil"
      message="Tüm site ayarları silinecek. Bu işlem geri alınamaz! Emin misiniz?"
      confirmText="Evet, Sil"
      cancelText="Vazgeç"
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
