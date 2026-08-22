<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
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
// Sınıflandırma TEK KAYNAKTAN: aynı işlevi sunucu (istanbul.service,
// neighborhoods.service) ve public sayfa da okuyor. Panelde ikinci bir
// "39 ilçe" listesi tutulmuyor.
import { istanbulIlcesiMi } from '#shared/utils/istanbul'

// Türkiye illeri listesi artık utils/turkishCities.ts'de tek bir yerde
// tanımlı (önceden burada ve pages/[...slug].vue'da birbirinden bağımsız
// iki kopya olarak duruyordu — üstelik pages/[...slug].vue'daki kopyada
// id 47 yanlışlıkla "Karaman" olarak etiketlenmişti, doğrusu "Mardin"dir;
// 70 zaten doğru şekilde "Karaman"dı).

/**
 * ÇALIŞMA KAPSAMI — AYNI TABLO, İKİ FARKLI İŞ.
 *
 * `Region` tablosunda 375 kayıt var ve ikisi yönetimde aynı iş değil:
 *
 *   İSTANBUL İLÇELERİ (39)  M2 kalite kapısı, açık yayınla/geri çek eylemi,
 *                           aktif mahalle koruması, mahalle yönetimi bağı.
 *   LEGACY BÖLGELER (336)   Eski markadan devralınan kayıtlar; eski yayın
 *                           davranışı, İstanbul kapısı UYGULANMIYOR.
 *
 * Panel eskiden tek bir 375 satırlık karma liste basıyordu: İstanbul'un 39
 * ilçesi, 336 eski kaydın arasında kayboluyordu — oysa günlük işin tamamı o
 * 39 kayıtta.
 *
 * SÜZGEÇ SUNUCUDA. Kapsam değişince liste yeniden isteniyor; 375 kaydı
 * çekip istemcide ayırmak her açılışta gereksiz veri taşımak olurdu.
 * Varsayılan İSTANBUL: bu bir İstanbul projesi.
 */
const kapsam = ref('istanbul')
const istanbulKapsami = computed(() => kapsam.value === 'istanbul')

const { form: region, message, items: allRegions, isSaving, isDeleting, isLoadingItem, resetForm: resetFormBase, selectItem, save, remove, replaceItem } = useListCrud('regions', {
  id: null,
  title: '',
  subtitle: '',
  shortTitle: '',
  slug: '',
  content: '',
  excerpt: '',
  metaTitle: '',
  metaDescription: '',
  image: '',
  imageAlt: '',
  isActive: false,
  cities: [],
  priceFactorsTitle: 'Fiyatını Etkileyen Faktörler',
  // `priceFactorsImage` varsayılanı KALDIRILDI: cdn.armut.com adresindeki
  // bir görsele işaret ediyordu. Armut rakip bir firma; hem başkasının
  // sunucusundan görsel çekmek doğru değil hem de bu alan adı CSP'nin
  // img-src listesinde olmadığı için görsel üretimde zaten engelleniyordu
  // (bkz. server/middleware/security.ts).
  priceFactorsImage: '',
  priceFactors: [],
  // Derinlik alanları — bkz. prisma/schema.prisma → Region
  neighborhoods: [],
  facts: [],
  faqs: [],
  routes: [],
}, { listQuery: () => `?admin=true&kapsam=${kapsam.value}` })

// --- Fiyat Faktörü Girişi (form dışı, panel-özel yardımcı state) ---
const priceFactorInput = ref({
  factor: '',
  min: '',
  max: ''
})

// Fiyat faktörü ekleme fonksiyonu
const addPriceFactor = () => {
  if (!priceFactorInput.value.factor) {
    alert('Faktör adı zorunludur')
    return
  }

  // Boş bırakılan sütun '0 TL' olarak kaydediliyordu; tabloda artık fiyat
  // değil KOŞUL yazdığı için bu değer hem anlamsız hem yanıltıcı ("0 TL"
  // ücretsiz taşıma gibi okunuyor). Boş kalan hücre sitede "—" gösteriliyor.
  region.priceFactors.push({
    factor: priceFactorInput.value.factor,
    min: priceFactorInput.value.min || '',
    max: priceFactorInput.value.max || ''
  })

  // Input'ları temizle
  priceFactorInput.value = {
    factor: '',
    min: '',
    max: ''
  }
}

// Fiyat faktörü silme fonksiyonu
const removePriceFactor = (index) => {
  region.priceFactors.splice(index, 1)
}

/**
 * Düzenlenen kayıt bir İSTANBUL İLÇESİ mi?
 *
 * Mahalle yönetimi ilçelerde artık bu panelde DEĞİL. Karar slug listesiyle
 * değil `istanbulIlcesiMi` ile veriliyor; sunucu ve public sayfa da aynı
 * işlevi okuyor.
 */
const istanbulIlcesiKaydi = computed(() => istanbulIlcesiMi(region))

// --- İstanbul ilçesi yayın akışı ------------------------------------------
//
// NEDEN AYRI
// Buradaki `isActive` onay kutusu doğrudan `PUT /api/regions`'a gidiyor ve
// `regionsService.update` hiçbir kapı çalıştırmıyordu: on maddelik kalite
// kapısı yalnız komut satırında anlamlıydı, panelden tek tıkla atlanıyordu.
//
// İstanbul ilçelerinde onay kutusu artık YOK — yerine durum rozeti, kapı
// listesi ve iki eylem var. İstanbul DIŞI 336 legacy kayıtta onay kutusu
// aynen duruyor: onların bir kapısı yok ve davranışları değişmedi.
const ilceKapi = ref(null)
const ilceYayinIsleniyor = ref(false)

const ilceKapisiniGetir = async (slug) => {
  ilceKapi.value = null
  if (!slug) return
  try {
    const cevap = await $fetch(`/api/regions-kapi?slug=${encodeURIComponent(slug)}`)
    if (cevap?.success) ilceKapi.value = cevap.data
  } catch {
    // Kapı raporu alınamazsa panel çalışmaya devam eder; liste basılmaz.
    ilceKapi.value = null
  }
}

const ilceYayinDegistir = async (yayinda) => {
  if (!region.slug) return
  ilceYayinIsleniyor.value = true
  try {
    const cevap = await $fetch('/api/regions-yayin', {
      method: 'POST',
      body: { slug: region.slug, yayinda },
    })
    if (cevap?.success === false) {
      if (cevap.kapi) ilceKapi.value = cevap.kapi
      throw new Error(cevap.error || 'İşlem tamamlanamadı')
    }
    // Yayın durumu KAYITTA yaşıyor; formdaki değeri de eşitliyoruz ki
    // rozet anında doğru görünsün.
    region.isActive = yayinda
    message.value = cevap.message || 'Güncellendi.'
    await ilceKapisiniGetir(region.slug)
  } catch (e) {
    message.value = e?.data?.message || e?.message || 'İşlem tamamlanamadı'
  } finally {
    ilceYayinIsleniyor.value = false
  }
}

// --- Bölge Seçimi ---
// selectItem artık listeden değil, doğrudan API'den (slug ile) tek kayıt
// çekiyor (bkz. useListCrud.ts) — bu yüzden async. Not: bu panel bilinçli
// olarak paginated:false kalıyor (bkz. useListCrud çağrısı) çünkü aşağıdaki
// istatistik paneli ve arama/filtre (searchQuery/statusFilter) tüm bölge
// listesinin bellekte olmasına bağımlı — sayfalama bunları (yanlış toplam
// sayılar, sadece görünen sayfada arama) sessizce bozardı.
const selectRegion = async (slug) => {
  const selected = await selectItem(slug)
  // Kapı raporu yalnız İstanbul ilçelerinde anlamlı; legacy kayıtlarda
  // istek hiç atılmıyor.
  ilceKapi.value = null
  if (selected) {
    // Json? sütunları dizi de olabilir, dizi yazılmış metin de; çözümleme
    // utils/json.ts'te tek yerde (önceden burada elle yazılmıştı).
    region.priceFactors = parseJsonArray(selected.priceFactors)
    region.neighborhoods = parseJsonArray(selected.neighborhoods)
    region.facts = parseJsonArray(selected.facts)
    region.faqs = parseJsonArray(selected.faqs)
    region.routes = parseJsonArray(selected.routes)

    region.priceFactorsTitle = selected.priceFactorsTitle || 'Fiyatını Etkileyen Faktörler'
    region.priceFactorsImage = selected.priceFactorsImage || ''

    if (editor.value) {
      editor.value.commands.setContent(selected.content)
    }
    showEditModal.value = true

    // Kapı raporu forma yüklendikten SONRA çekiliyor: `istanbulIlcesiKaydi`
    // `region.cities`'e bakıyor ve o değer ancak burada dolu.
    if (istanbulIlcesiKaydi.value) await ilceKapisiniGetir(selected.slug)
  }
}

// --- İl Arama Filtresi ---
const citySearchQuery = ref('')

// --- Filtrelenmiş İller ---
const filteredCities = computed(() => {
  if (!citySearchQuery.value.trim()) {
    return turkishCities
  }
  
  const query = citySearchQuery.value.toLowerCase().trim()
  return turkishCities.filter(city => 
    city.name.toLowerCase().includes(query) || 
    city.id.toString().includes(query)
  )
})

// --- İl Seçim/Deseçim Fonksiyonları ---
const toggleCitySelection = (cityId) => {
  const index = region.cities.indexOf(cityId)

  if (index > -1) {
    // Eğer il zaten seçiliyse kaldır
    region.cities.splice(index, 1)
  } else {
    // İl seçili değilse ekle
    region.cities.push(cityId)
  }
}

const selectAllCities = () => {
  region.cities = turkishCities.map(city => city.id)
}

const clearAllCities = () => {
  region.cities = []
}

// --- Seçili İlleri İsimleriyle Getir ---
const selectedCityNames = computed(() => {
  return region.cities.map(cityId => {
    const city = turkishCities.find(c => c.id === cityId)
    return city ? city.name : ''
  }).filter(name => name !== '')
})

// --- Arama ve Sayfalama Değişkenleri ---
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(9)
const pageGroupSize = ref(10)

// --- Filtreleme Değişkenleri ---
const statusFilter = ref('all') // 'all', 'active', 'inactive'
const imageFilter = ref('all')  // 'all', 'with-image', 'without-image'
const cityFilter = ref('all')   // 'all' veya il id'si (sayı)

// --- İl Kırılımı ---
// Amaç: "Denizli'nin hangi ilçeleri var?" sorusunun cevabını panelin DIŞINDA
// aramak zorunda kalmamak. Bölge kaydında zaten `cities` (il id dizisi) var —
// tüm 286 kaydın tamamında tek bir il atanmış durumda (kontrol edildi), yani
// gruplama için ek veri veya API değişikliği gerekmiyor.
const bolgeninIlleri = (bolge) => parseCityIds(bolge.cities)

const ilAdlari = computed(() => new Map(turkishCities.map((il) => [il.id, il.name])))

/** Kartta gösterilecek il adı; il atanmamışsa boş döner (rozet render edilmez). */
const bolgeninIlAdi = (bolge) => {
  const [ilkIl] = bolgeninIlleri(bolge)
  return ilkIl === undefined ? '' : ilAdlari.value.get(ilkIl) || ''
}

/** Her il için toplam/aktif bölge sayısı — açılır listede etiket olarak gösteriliyor. */
const ilKirilimi = computed(() => {
  const sayac = new Map()
  for (const bolge of allRegions.value) {
    for (const ilId of bolgeninIlleri(bolge)) {
      const kayit = sayac.get(ilId) || { toplam: 0, aktif: 0 }
      kayit.toplam += 1
      if (bolge.isActive) kayit.aktif += 1
      sayac.set(ilId, kayit)
    }
  }
  return [...sayac.entries()]
    .map(([id, k]) => ({ id, ad: ilAdlari.value.get(id) || `İl #${id}`, ...k }))
    // Türkçe sıralama: varsayılan sıralama 'İ'yi 'I'dan sonraya atıyor,
    // localeCompare('tr') alfabede doğru yere koyuyor.
    .sort((a, b) => a.ad.localeCompare(b.ad, 'tr'))
})

/** Seçili ilin kırılımı — liste başlığındaki özet için. */
const seciliIl = computed(() =>
  cityFilter.value === 'all' ? null : ilKirilimi.value.find((il) => il.id === cityFilter.value) || null
)

// --- Karakter Dönüşüm Fonksiyonu ---
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
  const title = region.title
  let slug = sanitizeText(title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  region.slug = slug
}

// --- Tiptap Editor Instance ---
const editor = ref(null)
onMounted(() => {
  editor.value = new Editor({
    content: region.content,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      // Seviye 1 ve 2 kasıtlı olarak dışarıda.
      // H1: sayfa şablonu içeriğin üstünde zaten kendi
      //     <h1>{{ region.title }}</h1>'ini basıyor.
      // H2: bölge sayfasındaki BÖLÜM başlıkları H2 ("... Evden Eve Nakliyat
      //     Hizmetlerimiz", "... Taşınma Künyesi", "... Sık Sorulan
      //     Sorular"). Gövde metni bu bölümlerin ALTINDA yer aldığı için
      //     buradaki başlıklar H3'ten başlamalı; H2 seçilebilir kalsaydı
      //     hiyerarşi düz bir h2 listesine dönerdi.
      Heading.configure({
        levels: [3, 4],
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
      region.content = editor.value.getHTML()
    }
  })
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

/**
 * KAPSAM SAYILARI — GERÇEK VERİ TABANINDAN.
 *
 * Sekme rozetlerindeki sayılar sabit yazılmıyor: ikisi de tek bir hafif
 * (`light=true`) sorguyla sunucudan sayılıyor. Sabit "39 / 336" yazmak,
 * bir ilçe eklendiği gün sessizce yanlış olurdu.
 */
const kapsamSayilari = ref({ istanbul: 0, legacy: 0 })

const kapsamSayilariniGetir = async () => {
  try {
    const [ist, leg] = await Promise.all([
      $fetch('/api/regions?admin=true&light=true&kapsam=istanbul'),
      $fetch('/api/regions?admin=true&light=true&kapsam=legacy'),
    ])
    kapsamSayilari.value = {
      istanbul: Array.isArray(ist?.data) ? ist.data.length : 0,
      legacy: Array.isArray(leg?.data) ? leg.data.length : 0,
    }
  } catch {
    // Sayaç alınamazsa panel çalışmaya devam eder; rozet 0 kalır.
  }
}

onMounted(kapsamSayilariniGetir)

/** Sekme değişimi: liste sunucudan yeniden geliyor, form kapanıyor. */
const kapsamDegistir = (yeni) => {
  if (kapsam.value === yeni) return
  kapsam.value = yeni
  currentPage.value = 1
  searchQuery.value = ''
  // Açık bir düzenleme formu varsa kapat: seçili kayıt artık listede
  // olmayabilir ve "hangi kaydı düzenliyorum" belirsizleşir.
  showEditModal.value = false
}

// --- İstatistik Hesaplamaları ---
const statistics = computed(() => {
  const stats = {
    total: allRegions.value.length,
    active: allRegions.value.filter(r => r.isActive).length,
    inactive: allRegions.value.filter(r => !r.isActive).length,
    withImage: allRegions.value.filter(r => r.image && r.image.trim() !== '').length,
    withoutImage: allRegions.value.filter(r => !r.image || r.image.trim() === '').length
  }
  
  stats.activePercentage = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0
  stats.withImagePercentage = stats.total > 0 ? Math.round((stats.withImage / stats.total) * 100) : 0
  
  return stats
})

// --- Filtreleme Hesaplamaları ---
const filteredRegions = computed(() => {
  let filtered = allRegions.value
  
  // Metin arama filtresi
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(region => 
      region.title?.toLowerCase().includes(query) ||
      region.subtitle?.toLowerCase().includes(query) ||
      region.excerpt?.toLowerCase().includes(query) ||
      region.slug?.toLowerCase().includes(query)
    )
  }
  
  // Durum filtresi
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(region => 
      statusFilter.value === 'active' ? region.isActive : !region.isActive
    )
  }
  
  // Resim filtresi
  if (imageFilter.value !== 'all') {
    filtered = filtered.filter(region => {
      const hasImage = region.image && region.image.trim() !== ''
      return imageFilter.value === 'with-image' ? hasImage : !hasImage
    })
  }

  // İl filtresi
  if (cityFilter.value !== 'all') {
    filtered = filtered.filter(region => bolgeninIlleri(region).includes(cityFilter.value))
    // Bir il seçiliyken sıralama alfabetik değil ANLAMLI olmalı: önce ilin
    // kendi sayfası (Denizli), sonra ilçeleri. Böylece "bu ilin ilçeleri
    // neydi" sorusu listenin kendisinden okunuyor.
    filtered = [...filtered].sort((a, b) => {
      const ilFarki = Number(isProvincePage(b)) - Number(isProvincePage(a))
      return ilFarki !== 0 ? ilFarki : (a.title || '').localeCompare(b.title || '', 'tr')
    })
  }

  return filtered
})

// --- Filtre İstatistikleri ---
const filterStatistics = computed(() => {
  const activeCount = filteredRegions.value.filter(r => r.isActive).length
  const withImageCount = filteredRegions.value.filter(r => r.image && r.image.trim() !== '').length
  
  return {
    filteredCount: filteredRegions.value.length,
    activeInFilter: activeCount,
    withImageInFilter: withImageCount,
    activePercentageInFilter: filteredRegions.value.length > 0 
      ? Math.round((activeCount / filteredRegions.value.length) * 100) 
      : 0,
    withImagePercentageInFilter: filteredRegions.value.length > 0 
      ? Math.round((withImageCount / filteredRegions.value.length) * 100) 
      : 0
  }
})

// --- Sayfalama Hesaplamaları ---
const paginatedRegions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredRegions.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredRegions.value.length / itemsPerPage.value)
})

// --- Sayfa Gruplama Hesaplamaları ---
const currentPageGroup = computed(() => {
  return Math.ceil(currentPage.value / pageGroupSize.value)
})

const totalPageGroups = computed(() => {
  return Math.ceil(totalPages.value / pageGroupSize.value)
})

const pageGroupStart = computed(() => {
  return (currentPageGroup.value - 1) * pageGroupSize.value + 1
})

const pageGroupEnd = computed(() => {
  const end = currentPageGroup.value * pageGroupSize.value
  return end > totalPages.value ? totalPages.value : end
})

const visiblePages = computed(() => {
  const pages = []
  for (let i = pageGroupStart.value; i <= pageGroupEnd.value; i++) {
    pages.push(i)
  }
  return pages
})

// --- Sayfa Navigasyonu ---
const navigatePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const navigateFirstPage = () => {
  currentPage.value = 1
}

const navigateLastPage = () => {
  currentPage.value = totalPages.value
}

const navigatePreviousGroup = () => {
  const newPage = pageGroupStart.value - pageGroupSize.value
  if (newPage >= 1) {
    currentPage.value = newPage
  } else {
    navigateFirstPage()
  }
}

const navigateNextGroup = () => {
  const newPage = pageGroupEnd.value + 1
  if (newPage <= totalPages.value) {
    currentPage.value = newPage
  } else {
    navigateLastPage()
  }
}

// Filtre değiştiğinde ilk sayfaya dön
watch([searchQuery, statusFilter, imageFilter, cityFilter], () => {
  navigateFirstPage()
})

// --- Modal Kontrolleri ---
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedSlug = ref('')

// --- Filtreleri Sıfırla ---
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'all'
  imageFilter.value = 'all'
  cityFilter.value = 'all'
}

/** Bir filtre uygulanmış mı — "Sıfırla" düğmesi ve boş liste mesajı bunu kullanıyor. */
const filtreVarMi = computed(
  () => searchQuery.value !== '' || statusFilter.value !== 'all' || imageFilter.value !== 'all' || cityFilter.value !== 'all'
)

// --- Resim Ekleme Fonksiyonu ---
const addImage = () => {
  let url = prompt("Eklemek istediğiniz resmin URL'sini giriniz:")
  if (url && editor.value) {
    url = sanitizeText(url)
    editor.value.chain().focus().setImage({ src: url }).run()
  }
}

// --- Bölge Silme ---
const deleteRegion = async () => {
  const result = await remove(selectedSlug.value)
  showDeleteModal.value = false
  if (!result.success) {
    alert('Bölge silinirken hata oluştu.')
  }
}

// --- Bölge Durumunu Değiştir ---
const toggleRegionStatus = async (slug, currentStatus) => {
  try {
    const regionToUpdate = allRegions.value.find(r => r.slug === slug)
    if (!regionToUpdate) return

    const updatedRegion = await $fetch('/api/regions', {
      method: 'PUT',
      body: {
        ...regionToUpdate,
        isActive: !currentStatus
      }
    })

    replaceItem({ ...regionToUpdate, isActive: updatedRegion.data.isActive })
  } catch (error) {
    console.error('Durum güncelleme hatası:', error)
    alert('Durum güncellenirken hata oluştu: ' + error.message)
  }
}

// --- Yeni Bölge Ekleme Modalını Aç ---
const openAddForm = () => {
  resetForm()
  showEditModal.value = true
}

// --- Form Gönderimi ---
const submitForm = async () => {
  const result = await save()
  if (result.success) {
    showEditModal.value = false
    resetForm()
  } else {
    alert('İşlem başarısız: ' + (result.error || 'Bilinmeyen hata'))
  }
}

// --- Formu Sıfırla ---
const resetForm = () => {
  resetFormBase()
  priceFactorInput.value = {
    factor: '',
    min: '',
    max: ''
  }
  if (editor.value) {
    editor.value.commands.clearContent()
  }
}

// --- FileUploader'dan Gelen Event'i İşle ---
const updateImageUrl = (url) => {
  region.image = url
}

// Fiyat faktörü bölümünün görseli. Önceden burada elle yazılan bir URL
// kutusu vardı; dışarıdaki bir adrese işaret etmek hem CSP tarafından
// engellenebiliyor hem de yükleyicinin ürettiği çoklu boyutlardan
// (320/640/1024/2048 webp) yararlanamıyordu — tek büyük dosya iniyordu.
const updatePriceFactorsImageUrl = (url) => {
  region.priceFactorsImage = url
}
</script>

<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- Başlık ve Ekleme Butonu -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Bölge Yönetim Paneli</h1>
      <button
        @click="openAddForm"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Yeni Bölge Ekle
      </button>
    </div>

    <!--
      ÇALIŞMA KAPSAMI — iki ayrı iş, iki ayrı liste.

      Aynı tabloda duruyorlar ama yönetimde aynı iş değiller: İstanbul
      ilçelerinde kalite kapısı ve açık yayınla/geri çek eylemi var, legacy
      kayıtlarda yok. Süzgeç sunucuda; sekme değişince liste yeniden
      isteniyor.
    -->
    <div class="mb-6 border-b border-gray-200">
      <div class="flex gap-1" role="tablist" aria-label="Bölge çalışma kapsamı">
        <button
          type="button"
          role="tab"
          :aria-selected="istanbulKapsami"
          class="px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition"
          :class="istanbulKapsami ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="kapsamDegistir('istanbul')"
        >
          İstanbul İlçeleri
          <span class="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">{{ kapsamSayilari.istanbul }}</span>
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="!istanbulKapsami"
          class="px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition"
          :class="!istanbulKapsami ? 'border-gray-700 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="kapsamDegistir('legacy')"
        >
          Legacy Bölgeler
          <span class="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700">{{ kapsamSayilari.legacy }}</span>
        </button>
      </div>
    </div>

    <p
      v-if="istanbulKapsami"
      class="mb-6 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900"
    >
      <strong>İstanbul ilçeleri.</strong> Yayına alma açık bir eylem ve kalite
      kapısından geçiyor; yayındaki bir ilçenin altında aktif mahalle varsa
      geri çekilemiyor. Mahalleler
      <NuxtLink to="/evdeneveyonetim/neighborhood" class="font-semibold underline">Mahalleler</NuxtLink>
      ekranından yönetiliyor.
    </p>
    <p
      v-else
      class="mb-6 rounded border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700"
    >
      <strong>Legacy bölgeler.</strong> Eski markadan devralınan kayıtlar ve
      İstanbul il sayfası. Bu kayıtlarda İstanbul kalite kapısı
      <strong>çalışmıyor</strong>; yayın durumu doğrudan kaydın kendi
      onay kutusundan yönetiliyor.
    </p>

    <!-- İstatistik Kartları -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow border">
        <div class="text-sm text-gray-500 mb-1">Toplam Bölge</div>
        <div class="text-2xl font-bold">{{ statistics.total }}</div>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow border">
        <div class="text-sm text-gray-500 mb-1">Aktif Bölge</div>
        <div class="text-2xl font-bold text-green-600">{{ statistics.active }}</div>
        <div class="text-xs text-gray-500">{{ statistics.activePercentage }}%</div>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow border">
        <div class="text-sm text-gray-500 mb-1">Pasif Bölge</div>
        <div class="text-2xl font-bold text-red-600">{{ statistics.inactive }}</div>
        <div class="text-xs text-gray-500">{{ 100 - statistics.activePercentage }}%</div>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow border">
        <div class="text-sm text-gray-500 mb-1">Resimli</div>
        <div class="text-2xl font-bold text-blue-600">{{ statistics.withImage }}</div>
        <div class="text-xs text-gray-500">{{ statistics.withImagePercentage }}%</div>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow border">
        <div class="text-sm text-gray-500 mb-1">Resimsiz</div>
        <div class="text-2xl font-bold text-yellow-600">{{ statistics.withoutImage }}</div>
        <div class="text-xs text-gray-500">{{ 100 - statistics.withImagePercentage }}%</div>
      </div>
    </div>

    <!-- Filtreleme Paneli -->
    <div class="bg-white p-6 rounded-lg shadow border mb-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Filtreleme</h3>
        <button 
          @click="resetFilters"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-600"
          :disabled="!filtreVarMi"
          :class="{ 'opacity-50 cursor-not-allowed': !filtreVarMi }"
        >
          Filtreleri Sıfırla
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <!-- Metin Arama -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Metin Ara</label>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Başlık, açıklama, slug..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- İl Filtresi -->
        <!-- Etiketlerde "aktif/toplam" yazıyor: liste açıldığında hangi ilde
             kaç ilçenin yayında olduğu tek bakışta görünüyor, ayrıca bakmaya
             gerek kalmıyor. -->
        <div>
          <label for="bolge-il-filtresi" class="block text-sm font-medium text-gray-700 mb-2">İl</label>
          <select
            id="bolge-il-filtresi"
            v-model="cityFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">Tüm iller ({{ statistics.total }} bölge)</option>
            <option v-for="il in ilKirilimi" :key="il.id" :value="il.id">
              {{ il.ad }} — {{ il.aktif }}/{{ il.toplam }} aktif
            </option>
          </select>
        </div>

        <!-- Durum Filtresi -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Durum</label>
          <div class="flex flex-wrap gap-2">
            <button
              @click="statusFilter = 'all'"
              :class="[
                'px-3 py-1.5 text-sm rounded transition-colors',
                statusFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              ]"
            >
              Tümü ({{ statistics.total }})
            </button>
            <button
              @click="statusFilter = 'active'"
              :class="[
                'px-3 py-1.5 text-sm rounded transition-colors',
                statusFilter === 'active' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 hover:bg-green-200 text-green-700'
              ]"
            >
              Aktif ({{ statistics.active }})
            </button>
            <button
              @click="statusFilter = 'inactive'"
              :class="[
                'px-3 py-1.5 text-sm rounded transition-colors',
                statusFilter === 'inactive' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              ]"
            >
              Pasif ({{ statistics.inactive }})
            </button>
          </div>
        </div>
        
        <!-- Resim Filtresi -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Resim Durumu</label>
          <div class="flex flex-wrap gap-2">
            <button
              @click="imageFilter = 'all'"
              :class="[
                'px-3 py-1.5 text-sm rounded transition-colors',
                imageFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              ]"
            >
              Tümü ({{ statistics.total }})
            </button>
            <button
              @click="imageFilter = 'with-image'"
              :class="[
                'px-3 py-1.5 text-sm rounded transition-colors',
                imageFilter === 'with-image' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
              ]"
            >
              Resimli ({{ statistics.withImage }})
            </button>
            <button
              @click="imageFilter = 'without-image'"
              :class="[
                'px-3 py-1.5 text-sm rounded transition-colors',
                imageFilter === 'without-image' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
              ]"
            >
              Resimsiz ({{ statistics.withoutImage }})
            </button>
          </div>
        </div>
      </div>
      
      <!-- Filtre Sonuçları Bilgisi -->
      <div class="mt-4 pt-4 border-t">
        <div class="flex items-center justify-between">
          <div class="text-sm">
            <span class="font-medium text-gray-700">{{ filterStatistics.filteredCount }}</span>
            <span class="text-gray-600"> bölge bulundu</span>
            <template v-if="filterStatistics.filteredCount > 0">
              <span class="mx-2">•</span>
              <span class="text-green-600 font-medium">{{ filterStatistics.activeInFilter }}</span>
              <span class="text-gray-600"> aktif (</span>
              <span class="font-medium">{{ filterStatistics.activePercentageInFilter }}%</span>
              <span class="text-gray-600">)</span>
              <span class="mx-2">•</span>
              <span class="text-blue-600 font-medium">{{ filterStatistics.withImageInFilter }}</span>
              <span class="text-gray-600"> resimli (</span>
              <span class="font-medium">{{ filterStatistics.withImagePercentageInFilter }}%</span>
              <span class="text-gray-600">)</span>
            </template>
          </div>
          
          <div class="text-sm text-gray-500">
            Filtrelenmiş: {{ filterStatistics.filteredCount }} / {{ statistics.total }}
          </div>
        </div>
      </div>
    </div>

    <!-- Sayfalama Kontrolleri - ÜST -->
    <div v-if="totalPages > 1" class="mb-6">
      <div class="bg-white p-4 rounded-lg shadow border">
        <!-- Hızlı Navigasyon Butonları -->
        <div class="flex flex-wrap items-center justify-center gap-2 mb-3">
          <!-- İlk Sayfa -->
          <button
            @click="navigateFirstPage"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="İlk sayfaya git"
          >
            &laquo;&laquo; İlk
          </button>
          
          <!-- Önceki 10 Sayfa -->
          <button
            @click="navigatePreviousGroup"
            :disabled="currentPageGroup === 1"
            class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Önceki 10 sayfaya git"
          >
            &laquo; Önceki 10
          </button>
          
          <!-- Önceki Sayfa -->
          <button
            @click="navigatePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Önceki sayfa"
          >
            &laquo; Önceki
          </button>

          <!-- Sayfa Numaraları ve Grup Bilgisi -->
          <div class="flex items-center px-3">
            <span class="text-sm font-medium text-gray-700">
              Sayfalar {{ pageGroupStart }}-{{ pageGroupEnd }} / {{ totalPages }}
            </span>
          </div>

          <!-- Sonraki Sayfa -->
          <button
            @click="navigatePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Sonraki sayfa"
          >
            Sonraki &raquo;
          </button>
          
          <!-- Sonraki 10 Sayfa -->
          <button
            @click="navigateNextGroup"
            :disabled="currentPageGroup === totalPageGroups"
            class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Sonraki 10 sayfaya git"
          >
            Sonraki 10 &raquo;
          </button>
          
          <!-- Son Sayfa -->
          <button
            @click="navigateLastPage"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Son sayfaya git"
          >
            Son &raquo;&raquo;
          </button>
        </div>

        <!-- Sayfa Numaraları -->
        <div class="flex flex-wrap justify-center gap-1 mb-2">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="navigatePage(page)"
            :class="[
              'w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
            ]"
            :title="`${page}. sayfaya git`"
          >
            {{ page }}
          </button>
        </div>

        <!-- Aktif Sayfa ve Toplam Sayfa -->
        <div class="text-center text-sm text-gray-600 mt-2">
          <span class="font-medium">Aktif Sayfa:</span> {{ currentPage }} / {{ totalPages }}
          <span class="mx-2">•</span>
          <span class="font-medium">Sayfa Grubu:</span> {{ currentPageGroup }} / {{ totalPageGroups }}
        </div>
      </div>
    </div>

    <!-- Seçili İl Özeti -->
    <!-- İl seçildiğinde listenin başında o ilin durumu yazıyor; hangi ilçelerin
         yayında olmadığını görmek için kartları saymaya gerek kalmıyor. -->
    <div v-if="seciliIl" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
      <div class="text-sm text-blue-900">
        <span class="font-semibold text-base">{{ seciliIl.ad }}</span>
        <span class="mx-2 text-blue-300">•</span>
        {{ seciliIl.toplam }} bölge kaydı
        <span class="mx-2 text-blue-300">•</span>
        <span class="font-medium text-green-700">{{ seciliIl.aktif }} aktif</span>
        <span class="mx-2 text-blue-300">•</span>
        <span class="font-medium text-gray-600">{{ seciliIl.toplam - seciliIl.aktif }} pasif</span>
      </div>
      <div class="flex gap-2">
        <button
          v-if="statusFilter !== 'inactive'"
          @click="statusFilter = 'inactive'"
          class="px-3 py-1.5 text-sm bg-white border border-blue-300 rounded hover:bg-blue-100 text-blue-800"
        >
          Sadece pasifleri göster
        </button>
        <button
          @click="cityFilter = 'all'"
          class="px-3 py-1.5 text-sm bg-white border border-blue-300 rounded hover:bg-blue-100 text-blue-800"
        >
          İl seçimini kaldır
        </button>
      </div>
    </div>

    <!-- Bölge Listesi -->
    <div v-if="paginatedRegions.length === 0" class="text-center py-12 bg-white rounded-lg shadow border">
      <p class="text-gray-500 text-lg">
        {{ filtreVarMi ? 'Filtrelere uygun bölge bulunamadı' : 'Henüz bölge eklenmemiş' }}
      </p>
      <button 
        v-if="filtreVarMi"
        @click="resetFilters"
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Filtreleri Temizle
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="regionItem in paginatedRegions" 
        :key="regionItem.id"
        :class="[
          'bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 relative',
          regionItem.isActive ? 'border-green-500' : 'border-gray-300'
        ]"
      >
        <!-- Resim Durumu Göstergesi -->
        <div 
          v-if="!regionItem.image || regionItem.image.trim() === ''"
          class="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full"
          title="Resim yok"
        >
          📷 Yok
        </div>
        
        <!-- Durum Göstergesi -->
        <div class="flex justify-between items-start mb-2">
          <span 
            :class="[
              'px-2 py-1 text-xs font-semibold rounded-full',
              regionItem.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            ]"
          >
            {{ regionItem.isActive ? 'Aktif' : 'Pasif' }}
          </span>

          <!-- Bağlı olduğu il — filtre uygulanmasa da kartta görünsün.
               Tıklayınca o ile filtreliyor: bir ilçeyi görüp "bu ilin
               diğerleri ne durumda?" demek tek tık. -->
          <button
            v-if="bolgeninIlAdi(regionItem)"
            type="button"
            @click="cityFilter = bolgeninIlleri(regionItem)[0]"
            class="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
            :title="`${bolgeninIlAdi(regionItem)} bölgelerini listele`"
          >
            {{ bolgeninIlAdi(regionItem) }}
          </button>
        </div>

        <div class="relative overflow-hidden rounded-lg mb-4 bg-gray-100" style="height: 192px;">
          <img 
            v-if="regionItem.image && regionItem.image.trim() !== ''"
            :src="regionItem.image" 
            :alt="regionItem.title"
            class="w-full h-full object-cover"
            :onerror="`this.src='/img/default-region.jpg'; this.onerror=null;`"
          />
          <div 
            v-else
            class="w-full h-full flex flex-col items-center justify-center text-gray-400"
          >
            <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span class="text-sm">Resim Yok</span>
          </div>
        </div>
        
        <h3 class="text-xl font-semibold mb-2">{{ regionItem.title }}</h3>
        <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ regionItem.excerpt }}</p>
        
        <div class="flex flex-wrap gap-2">
          <!-- Durum Değiştir Butonu -->
          <button 
            @click="toggleRegionStatus(regionItem.slug, regionItem.isActive)"
            :class="[
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              regionItem.isActive
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            ]"
          >
            {{ regionItem.isActive ? 'Pasif Yap' : 'Aktif Yap' }}
          </button>
          
          <!-- Düzenle Butonu -->
          <button
            @click="selectRegion(regionItem.slug)"
            :disabled="isLoadingItem"
            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Düzenle
          </button>
          
          <!-- Sil Butonu -->
          <button 
            @click="selectedSlug = regionItem.slug; showDeleteModal = true"
            class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors"
          >
            Sil
          </button>
        </div>
        
        <!-- Bölge Bilgileri -->
        <div class="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <div class="flex justify-between mb-1">
            <span>Slug: {{ regionItem.slug }}</span>
            <span>{{ regionItem.image && regionItem.image.trim() !== '' ? '📷 Var' : '📷 Yok' }}</span>
          </div>
          <!-- İl bilgisi -->
          <div v-if="regionItem.cities && Array.isArray(regionItem.cities) && regionItem.cities.length > 0">
            <div class="mt-1">
              <span class="font-medium text-gray-700">Bağlı İller:</span>
              <div class="flex flex-wrap gap-1 mt-1">
                <span 
                  v-for="cityId in regionItem.cities.slice(0, 3)" 
                  :key="cityId"
                  class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {{ turkishCities.find(c => c.id === cityId)?.name || cityId }}
                </span>
                <span 
                  v-if="regionItem.cities.length > 3"
                  class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  +{{ regionItem.cities.length - 3 }} il
                </span>
              </div>
            </div>
          </div>
          <div v-else class="mt-1 text-gray-400 text-xs">
            <span>İl bağlantısı yok</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sayfalama Kontrolleri - ALT -->
    <div v-if="totalPages > 1" class="mt-8">
      <div class="bg-white p-4 rounded-lg shadow border">
        <!-- Hızlı Navigasyon Butonları -->
        <div class="flex flex-wrap items-center justify-center gap-2 mb-3">
          <!-- İlk Sayfa -->
          <button
            @click="navigateFirstPage"
            :disabled="currentPage === 1"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="İlk sayfaya git"
          >
            &laquo;&laquo;
          </button>
          
          <!-- Önceki 10 Sayfa -->
          <button
            @click="navigatePreviousGroup"
            :disabled="currentPageGroup === 1"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Önceki 10 sayfaya git"
          >
            -10
          </button>
          
          <!-- Önceki Sayfa -->
          <button
            @click="navigatePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Önceki sayfa"
          >
            &laquo;
          </button>

          <!-- Sayfa Numaraları -->
          <div class="flex items-center space-x-1 mx-2">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="navigatePage(page)"
              :class="[
                'min-w-[40px] h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors',
                page === currentPage
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
              ]"
              :title="`${page}. sayfaya git`"
            >
              {{ page }}
            </button>
          </div>

          <!-- Sonraki Sayfa -->
          <button
            @click="navigatePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Sonraki sayfa"
          >
            &raquo;
          </button>
          
          <!-- Sonraki 10 Sayfa -->
          <button
            @click="navigateNextGroup"
            :disabled="currentPageGroup === totalPageGroups"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Sonraki 10 sayfaya git"
          >
            +10
          </button>
          
          <!-- Son Sayfa -->
          <button
            @click="navigateLastPage"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Son sayfaya git"
          >
            &raquo;&raquo;
          </button>
        </div>

        <!-- Sayfa Bilgisi -->
        <div class="text-center">
          <div class="inline-flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg">
            <div class="text-sm">
              <span class="font-medium text-gray-700">Sayfa:</span>
              <input
                type="number"
                :value="currentPage"
                @input="navigatePage(parseInt($event.target.value) || 1)"
                @keyup.enter="$event.target.blur()"
                min="1"
                :max="totalPages"
                class="ml-2 w-16 px-2 py-1 border border-gray-300 rounded text-center"
              />
              <span class="mx-2">/</span>
              <span class="font-medium">{{ totalPages }}</span>
            </div>
            
            <div class="text-sm">
              <span class="font-medium text-gray-700">Grp:</span>
              <span class="ml-2">{{ currentPageGroup }} / {{ totalPageGroups }}</span>
            </div>
            
            <div class="text-sm">
              <span class="font-medium text-gray-700">Gösterilen:</span>
              <span class="ml-2">{{ paginatedRegions.length }}</span>
            </div>
            
            <div class="text-sm">
              <span class="font-medium text-gray-700">Toplam:</span>
              <span class="ml-2">{{ filterStatistics.filteredCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Düzenleme/Ekleme Modalı -->
    <div 
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">{{ region.id ? 'Bölge Düzenle' : 'Yeni Bölge Ekle' }}</h2>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- Temel Bilgiler -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 font-medium">Başlık <span class="text-red-500">*</span></label>
              <input 
                v-model="region.title" 
                @input="generateSlug"
                type="text" 
                class="w-full p-2 border rounded"
                required
              >
            </div>
            <div>
              <label class="block mb-2 font-medium">Slug <span class="text-red-500">*</span></label>
              <input 
                v-model="region.slug" 
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
                v-model="region.subtitle" 
                type="text" 
                class="w-full p-2 border rounded"
              >
            </div>
            <div>
              <label class="block mb-2 font-medium">Kısa Başlık</label>
              <input 
                v-model="region.shortTitle" 
                type="text" 
                class="w-full p-2 border rounded"
              >
            </div>
          </div>

          <!-- İl Seçimi Bölümü -->
          <div class="border rounded-lg p-4">
            <div class="flex justify-between items-center mb-4">
              <label class="block font-medium">
                Bağlı Olduğu İller (Zorunlu değil)
                <span class="text-sm font-normal text-gray-500 ml-2">
                  (Birden fazla il seçilebilir)
                </span>
              </label>
              <div class="flex gap-2">
                <button 
                  type="button"
                  @click="selectAllCities"
                  class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Tümünü Seç
                </button>
                <button 
                  type="button"
                  @click="clearAllCities"
                  class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Temizle
                </button>
              </div>
            </div>

            <!-- Seçili İller Göstergesi -->
            <div v-if="selectedCityNames.length > 0" class="mb-4 p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-medium text-gray-700">
                  Seçilen İller ({{ region.cities.length }}):
                </span>
                <span class="text-sm text-blue-600 font-medium">
                  {{ selectedCityNames.slice(0, 5).join(', ') }}
                  <span v-if="selectedCityNames.length > 5"> ve {{ selectedCityNames.length - 5 }} il daha</span>
                </span>
              </div>
            </div>

            <!-- İl Arama -->
            <div class="mb-4">
              <input
                v-model="citySearchQuery"
                type="text"
                placeholder="İl ara..."
                class="w-full p-2 border rounded-lg"
              />
            </div>

            <!-- İl Listesi -->
            <div class="max-h-60 overflow-y-auto border rounded-lg">
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-3">
                <div
                  v-for="city in filteredCities"
                  :key="city.id"
                  @click="toggleCitySelection(city.id)"
                  :class="[
                    'flex items-center p-3 border rounded-lg cursor-pointer transition-colors',
                    region.cities.includes(city.id)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  ]"
                >
                  <input
                    type="checkbox"
                    :checked="region.cities.includes(city.id)"
                    class="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    readonly
                  />
                  <div>
                    <div class="font-medium">{{ city.name }}</div>
                    <div class="text-xs text-gray-500">Plaka: {{ city.id }}</div>
                  </div>
                </div>
              </div>
              
              <div v-if="filteredCities.length === 0" class="p-4 text-center text-gray-500">
                İl bulunamadı
              </div>
            </div>

            <!-- Bilgilendirme -->
            <div class="mt-4 text-sm text-gray-500">
              <p>📌 <strong>Not:</strong> İl seçimi zorunlu değildir. </p>
              <p class="mt-1">Örneğin Pendik için İstanbul'u seçerseniz, ön yüzde İstanbul sayfasında Pendik de gözükecektir.</p>
            </div>
          </div>

          <!-- Görsel Yükleme -->
          <div>
            <label class="block mb-2 font-medium">Görsel URL <span class="text-red-500">*</span></label>
            <div class="flex gap-2">
              <input 
                v-model="region.image" 
                type="text" 
                class="flex-1 p-2 border rounded"
                required
                placeholder="https://example.com/image.jpg"
              >
              <button
                type="button"
                @click="region.image = ''"
                class="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                v-if="region.image"
              >
                Temizle
              </button>
            </div>
            <div class="mt-2">
              <FileUploader @file-uploaded="updateImageUrl" />
            </div>
            <div class="text-xs text-gray-500 mt-1">
              📷 Resim yüklerseniz bölge kartlarında görünecektir
            </div>
          </div>

          <!-- Alt metni: 120 bölgenin ÇOĞUNDA boş kalması beklenen bir alan;
               metin bunu açıkça söylüyor ki gereksiz doldurma olmasın. -->
          <div>
            <label class="block mb-2 font-medium">
              Görsel Açıklaması (alt metni)
              <span class="font-normal text-gray-500">— isteğe bağlı</span>
            </label>
            <input
              v-model="region.imageAlt"
              type="text"
              maxlength="125"
              class="w-full p-2 border rounded"
              placeholder="Boş bırakabilirsiniz"
            >
            <p class="mt-1 text-xs text-gray-500">
              Bu bölgeye <strong>özel</strong> bir fotoğraf koyduysanız ne
              görüldüğünü yazın. Diğer bölgelerle aynı stok görseli
              kullanıyorsanız <strong>boş bırakın</strong> — aynı fotoğraf için
              her bölgede farklı açıklama yazmak yanıltıcı olur ve Google bunu
              anahtar kelime doldurması sayar. Boşken
              “<em>{{ (region.subtitle || region.shortTitle || region.title || 'Bölge') }}
              evden eve nakliyat çalışmamız</em>” otomatik üretilir.
            </p>
          </div>

          <!--
            YAYIN DURUMU — İKİ AYRI DAVRANIŞ.

            İstanbul ilçesi: kalite kapısı var, yayın ayrı bir eylem.
            İstanbul dışı legacy kayıt: kapı yok, mevcut onay kutusu duruyor.
            Ayrım slug listesiyle değil `istanbulIlcesiMi` ile yapılıyor.
          -->
          <div v-if="istanbulIlcesiKaydi" class="rounded-lg border-2 border-gray-200 p-4">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-700">Yayın durumu:</span>
                <span
                  v-if="region.isActive"
                  class="rounded bg-green-100 px-2 py-0.5 text-sm font-medium text-green-800"
                >YAYINDA</span>
                <span v-else class="rounded bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-900">
                  TASLAK
                </span>
              </div>

              <div class="flex gap-2">
                <button
                  v-if="!region.isActive"
                  type="button"
                  @click="ilceYayinDegistir(true)"
                  :disabled="ilceYayinIsleniyor || !region.id"
                  class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {{ ilceYayinIsleniyor ? 'İşleniyor…' : 'Yayına Al' }}
                </button>
                <button
                  v-else
                  type="button"
                  @click="ilceYayinDegistir(false)"
                  :disabled="ilceYayinIsleniyor"
                  class="px-4 py-2 border border-amber-500 text-amber-800 rounded hover:bg-amber-50 disabled:opacity-50"
                >
                  {{ ilceYayinIsleniyor ? 'İşleniyor…' : 'Yayından Kaldır' }}
                </button>
              </div>
            </div>

            <p class="mt-2 text-sm text-gray-600">
              İlçe sayfaları kalite kapısından geçmeden yayına alınamaz.
              “Kaydet” içeriği yazar, yayın durumuna dokunmaz.
            </p>

            <!-- Kapı listesi: "yayınlanamadı" değil, hangi madde kaldı. -->
            <div v-if="ilceKapi" class="mt-4 rounded border bg-white p-3">
              <div class="mb-2 flex items-center justify-between">
                <h4 class="font-semibold text-gray-800">Yayına hazırlık</h4>
                <span
                  :class="ilceKapi.gecti ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'"
                  class="rounded px-2 py-0.5 text-xs font-medium"
                >{{ ilceKapi.gecti ? 'Kapıdan geçti' : 'Eksik var' }}</span>
              </div>
              <ul class="space-y-1 text-sm">
                <li v-for="k in ilceKapi.kurallar" :key="k.anahtar" class="flex items-start gap-2">
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
          </div>

          <!-- Aktif/Pasif Switch — YALNIZ İstanbul dışı legacy kayıtlar -->
          <div v-else class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="region.isActive"
              id="isActive"
              class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            >
            <label for="isActive" class="font-medium text-gray-700">
              Bölgeyi Aktif Et
            </label>
            <span class="text-sm text-gray-500">
              (Aktif edilen bölgeler ön yüzde görünecektir)
            </span>
          </div>

                <!-- Fiyat Faktörleri Bölümü -->
      <!--
        DERİNLİK BÖLÜMLERİ
        Bu dört liste, bölge sayfasının ince içerik riskini azaltmak için
        eklendi (bölge metinlerinin medyanı 135 kelimeydi). Hepsi opsiyonel:
        boş bırakılan bölüm sitede hiç görünmüyor.
      -->
      <!--
        MAHALLE YÖNETİMİ İSTANBUL İLÇELERİNDE BURADA DEĞİL.

        Bu alan (`Region.neighborhoods`) bir ad listesiydi ve mahalle
        sayfalarını üretmiyordu. Sayfalar `Neighborhood` tablosundan geliyor;
        ikisi birlikte durduğu sürece panelde bir ad eklemek ekranda sayıyı
        artırıyor ama hiçbir sayfa oluşturmuyordu — silmek ise yayındaki bir
        sayfayı hiç etkilemiyordu. Yani bu editör ilçelerde YANLIŞ BİLGİ
        veriyordu.

        Alan veri tabanında silinmedi (aktarım geçmişi orada duruyor), ama
        İstanbul ilçelerinde artık düzenlenmiyor ve public taraf onu hiç
        okumuyor. İstanbul DIŞI 336 legacy kayıtta editör aynen kalıyor:
        o sayfalarda mahalle adları hâlâ yalnız etiket olarak basılıyor ve
        `Neighborhood` tablosunda karşılıkları yok.
      -->
      <div v-if="istanbulIlcesiKaydi" class="border rounded-lg p-4 mt-6 bg-gray-50">
        <h3 class="text-lg font-semibold mb-1">Mahalleler</h3>
        <p class="text-sm text-gray-600">
          Bu bir İstanbul ilçesi. Mahalleler kendi sayfalarına ve yayın
          durumuna sahip; buradan değil <strong>Mahalleler</strong> ekranından
          yönetiliyorlar.
        </p>
        <NuxtLink
          :to="`/evdeneveyonetim/neighborhood?ilce=${region.slug}`"
          class="mt-3 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Mahalleleri Yönet →
        </NuxtLink>
      </div>

      <admin-base-list-editor
        v-else
        v-model="region.neighborhoods"
        title="Mahalleler"
        hint="Bu bölgede hizmet verdiğiniz mahalleler. Sayfada etiket olarak listelenir; “Moda evden eve nakliyat” gibi mahalle aramalarında karşılık üretir."
        :fields="[{ key: 'name', label: 'Mahalle adı', placeholder: 'Örn: Moda' }]"
      />

      <admin-base-list-editor
        v-model="region.facts"
        title="Taşınma Künyesi"
        hint="Bölgenin taşınmayı etkileyen özellikleri. Ziyaretçinin en çok merak ettiği şeyler: asansör durumu, sokak genişliği, araç yanaşma, park sorunu."
        :fields="[
          { key: 'label', label: 'Başlık', placeholder: 'Örn: Yapı dokusu' },
          { key: 'value', label: 'Açıklama', placeholder: 'Örn: 1960-80 arası apartman ağırlıklı, asansör oranı düşük' },
        ]"
        required-key="label"
      />

      <admin-base-list-editor
        v-model="region.routes"
        title="Sık Taşınılan Güzergâhlar"
        hint="Bu bölgeden en çok nereye taşınılıyor. Hedef bir bölge sayfasıysa otomatik bağlantı verilir — slug yazmanıza gerek yok, il/ilçe adını yazmanız yeterli."
        :fields="[
          { key: 'to', label: 'Hedef bölge', placeholder: 'Örn: Ataşehir' },
          { key: 'note', label: 'Not', placeholder: 'Örn: Yaka değişmediği için tek günde tamamlanıyor', type: 'textarea' },
        ]"
        required-key="to"
      />

      <admin-base-list-editor
        v-model="region.faqs"
        title="Sık Sorulan Sorular"
        hint="Bölgeye özgü sorular. Google’a FAQPage yapısal verisi olarak da gönderilir; arama sonucunda açılır soru-cevap olarak görünebilir. Genel sorular yerine o bölgeye özel olanları yazın."
        :fields="[
          { key: 'question', label: 'Soru', placeholder: 'Örn: Kadıköy’de asansörsüz binada taşınma nasıl yapılıyor?' },
          { key: 'answer', label: 'Cevap', placeholder: 'Kısa ve doğrudan bir cevap yazın.', type: 'textarea' },
        ]"
        required-key="question"
      />

      <div class="border rounded-lg p-4 mt-6 bg-gray-50">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
          <span class="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">₺</span>
          Fiyatı Etkileyen Faktörler Tablosu
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block mb-2 font-medium">Tablo Başlığı</label>
            <input 
              v-model="region.priceFactorsTitle" 
              type="text" 
              class="w-full p-2 border rounded"
              placeholder="Örn: İzmir Evden Eve Nakliyat Fiyatını Etkileyen Faktörler"
            >
          </div>
          <!-- Bölüm görseli — elle URL DEĞİL, yükleyici.
               Yükleyici tarayıcıda 320/640/1024/2048 webp üretip sunucuya
               atıyor; sayfa hangi ekrandaysa o boyutu indiriyor. Elle
               yazılan bir adres bu merdivenden yararlanamıyordu. -->
          <div>
            <label class="block mb-2 font-medium">
              Bölüm Görseli
              <span class="font-normal text-gray-500">— isteğe bağlı</span>
            </label>

            <input
              :value="region.priceFactorsImage"
              type="text"
              class="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
              placeholder="Görsel yüklendiğinde adres burada görünür"
              readonly
            >

            <div class="mt-2 flex items-start gap-3">
              <div class="flex-1">
                <FileUploader @file-uploaded="updatePriceFactorsImageUrl" />
              </div>
              <button
                v-if="region.priceFactorsImage"
                type="button"
                class="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 shrink-0"
                @click="region.priceFactorsImage = ''"
              >
                Kaldır
              </button>
            </div>

            <p class="mt-1 text-xs text-gray-500">
              Tablonun üstünde <strong>21/9</strong> banner olarak basılır; 16:9
              yüklerseniz dikeyde %24 kırpılır, konuyu ortada tutun.
              <strong>Yalnızca fiyat faktörü tablosu dolu olan bölgelerde görünür.</strong>
            </p>
          </div>
        </div>
        
        <!-- Faktör Ekleme Formu -->
        <div class="bg-white p-4 rounded-lg border mb-4">
          <h4 class="font-medium mb-3">Yeni Faktör Ekle</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Faktör Adı</label>
              <input 
                v-model="priceFactorInput.factor" 
                type="text" 
                class="w-full p-2 border rounded"
                placeholder="Örn: Kaç odalı ev eşyası taşınacak?"
              >
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Fiyatı Düşüren Durum</label>
              <input 
                v-model="priceFactorInput.min" 
                type="text" 
                class="w-full p-2 border rounded"
                placeholder="Örn: Yük asansörü var"
              >
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Fiyatı Artıran Durum</label>
              <input 
                v-model="priceFactorInput.max" 
                type="text" 
                class="w-full p-2 border rounded"
                placeholder="Örn: Asansörsüz 5. kat"
              >
            </div>
          </div>
          <button 
            type="button"
            @click="addPriceFactor"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Faktör Ekle
          </button>
        </div>
        
        <!-- Faktör Listesi Tablosu -->
        <div v-if="region.priceFactors.length > 0" class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-2 text-left border">Faktör</th>
                <th class="p-2 text-left border">Fiyatı düşüren</th>
                <th class="p-2 text-left border">Fiyatı artıran</th>
                <th class="p-2 text-center border w-20">İşlem</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in region.priceFactors" :key="index">
                <td class="p-2 border">{{ item.factor }}</td>
                <td class="p-2 border">{{ item.min }}</td>
                <td class="p-2 border">{{ item.max }}</td>
                <td class="p-2 border text-center">
                  <button :aria-label="`${index + 1}. Fiyat faktörünü sil`" 
                    type="button"
                    @click="removePriceFactor(index)"
                    class="text-red-600 hover:text-red-800"
                    title="Sil"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-gray-500 italic p-4 bg-white rounded border">
          Henüz fiyat faktörü eklenmemiş.
        </p>
        
        <!-- Önizleme -->
        <div class="mt-4 p-4 bg-white rounded-lg border">
          <h4 class="font-medium mb-2">Önizleme:</h4>
          <div class="border rounded-lg p-4 bg-gray-50">
            <h5 class="font-semibold text-lg mb-2">{{ region.priceFactorsTitle || 'Fiyatı Etkileyen Faktörler' }}</h5>
            <div class="flex flex-col md:flex-row gap-4">
              <div v-if="region.priceFactorsImage" class="md:w-1/4">
                <img
                  :src="region.priceFactorsImage"
                  class="w-full h-auto max-h-32 object-contain"
                  alt="Faktörler"
                >
              </div>
              <div class="flex-1">
                <table class="w-full border-collapse">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="p-2 text-left border"></th>
                      <th class="p-2 text-left border">Fiyatı düşüren</th>
                      <th class="p-2 text-left border">Fiyatı artıran</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in region.priceFactors" :key="index">
                      <td class="p-2 border">{{ item.factor }}</td>
                      <td class="p-2 border">{{ item.min }}</td>
                      <td class="p-2 border">{{ item.max }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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
            <label class="block mb-2 font-medium">Kısa Açıklama (Kartlarda Gösterilecek) <span class="text-red-500">*</span></label>
            <textarea
              v-model="region.excerpt"
              class="w-full p-2 border rounded"
              rows="3"
              maxlength="160"
              required
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">Maksimum 160 karakter</p>
          </div>

          <!--
            ARAMA BAŞLIĞI — sayfadaki H1'den AYRI ve BOŞ BIRAKILABİLİR.
            Boşken uygulama `başlık | marka` biçimini üretiyor, yani hiçbir
            sayfa başlıksız kalmıyor. Elle girmenin iki sebebi var: uzun
            başlıklarda markayı eklemek Google'ın kesme noktasını cümlenin
            ortasına düşürüyor, ve aramada öne çıkması gereken kelime
            H1'dekiyle her zaman aynı sırada olmuyor.
            Girildiğinde OLDUĞU GİBİ kullanılır — marka eklenip eklenmemesi
            de buradaki yazıya bağlı.
          -->
          <div>
            <label for="rg-metatitle" class="block mb-2 font-medium">
              Google Arama Başlığı
            </label>
            <input
              id="rg-metatitle"
              v-model="region.metaTitle"
              type="text"
              class="w-full p-2 border rounded"
              maxlength="70"
              placeholder="Yenimahalle Evden Eve Nakliyat | Marka"
            />
            <p class="text-xs mt-1" :class="(region.metaTitle || '').length > 60 ? 'text-amber-700' : 'text-gray-500'">
              {{ (region.metaTitle || '').length }} / 60 karakter —
              60 üstü Google sonuçlarında kesilir.
              Boş bırakılırsa otomatik üretilir: <strong>başlık | marka</strong>
            </p>
          </div>

          <!--
            ARAMA AÇIKLAMASI — kısa açıklamadan AYRI.
            İkisinin işi farklı: yukarıdaki sayfada okunur (doğal olmalı),
            bu ise Google sonucunda tıklanma üretir (hizmet ifadesi +
            farklılaştırıcı + eylem çağrısı). Boş bırakılırsa yukarıdaki
            kullanılır, yani sayfa hiçbir zaman açıklamasız kalmaz.
          -->
          <div>
            <label for="rg-meta" class="block mb-2 font-medium">
              Google Arama Açıklaması
            </label>
            <textarea
              id="rg-meta"
              v-model="region.metaDescription"
              class="w-full p-2 border rounded"
              rows="3"
              maxlength="165"
              placeholder="İstanbul'dan Tokat'a evden eve nakliyat. Sigortalı taşıma, marangozlu montaj, yazılı sabit fiyat. Ücretsiz keşif."
            ></textarea>
            <p class="text-xs mt-1" :class="(region.metaDescription || '').length > 155 ? 'text-amber-700' : 'text-gray-500'">
              {{ (region.metaDescription || '').length }} / 155 karakter —
              hedef 140-155. Boş bırakılırsa yukarıdaki kısa açıklama kullanılır.
            </p>
            <p class="text-xs text-gray-500 mt-1">
              Kalıp: <strong>[konum + hizmet]</strong> + <strong>[3 farklılaştırıcı]</strong> + <strong>[eylem çağrısı]</strong>.
              Uzak iller için "İstanbul'dan X'e" ile başlayın.
            </p>
          </div>

          <!-- Form Butonları -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button 
              type="button"
              @click="showEditModal = false; resetForm()"
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
              {{ isSaving ? 'Kaydediliyor...' : (region.id ? 'Güncelle' : 'Oluştur') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Silme Onay Modalı -->
    <div 
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-bold mb-4">Bölgeyi Sil</h3>
        <p class="mb-4 text-gray-600">Bu bölgeyi kalıcı olarak silmek istediğinize emin misiniz?</p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            :disabled="isDeleting"
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            İptal
          </button>
          <button
            @click="deleteRegion"
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>