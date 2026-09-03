<script setup>
import { istanbulIlcesiMi } from '#shared/utils/istanbul'
import { MAHALLE_EKI, mahalleBasligi } from '#shared/utils/mahalle'
/**
 * YAZI VE BÖLGE DETAY SAYFASI
 *
 * YÖNLENDİRME DEĞİŞMEDİ. Hem blog yazıları hem hizmet bölgeleri KÖK
 * adreste yayınlanıyor — /blog/... veya /bolgelerimiz/... öneki yok:
 *     /evden-eve-nakliyat-fiyatlari-neye-gore-belirlenir
 *     /kadikoy-evden-eve-nakliyat
 * Gelen slug ile iki tabloya birden bakılıyor; hangisi eşleşirse onun
 * görünümü render ediliyor, ikisi de eşleşmezse gerçek bir 404 dönülüyor
 * (soft 404 değil — Search Console bunu hatalı sayfa olarak işaretler).
 *
 * DÜZELTİLEN HATALAR
 *
 * 1. ⚠ SAYFA BAŞLIĞI YANLIŞTI. `<title>` etiketi yazının BAŞLIĞINI değil
 *    ALT BAŞLIĞINI kullanıyordu:
 *        const title = post.value ? data.subtitle : data.shortTitle
 *    Ölçüm (canlı sayfa):
 *        <title>  Poliçeye bakarken görmeniz gereken maddeler ve …
 *        <h1>     Nakliyat Sigortası Neyi Kapsar, Neyi Kapsamaz?
 *    Google arama sonuçlarında gösterdiği metin `<title>`. Yani 15 yazının
 *    tamamı aramada yanlış başlıkla çıkacaktı. Artık başlık gerçek
 *    başlıktan geliyor, marka adı da sonuna ekleniyor.
 *
 * 2. YAPISAL VERİ YOKTU. Yazılar için Article/BlogPosting şeması hiç
 *    üretilmiyordu; blog listesi sayfasında `Blog` şeması var ama
 *    yazıların kendisinde yoktu.
 *
 * 3. HAM HATA MESAJI ZİYARETÇİYE GÖSTERİLİYORDU
 *    ("Post yüklenirken hata: {{ postError.message }}"). Teknik ayrıntı
 *    artık konsola gidiyor.
 *
 * 4. 744 SATIRLIK TEK DOSYA. Yazı ve bölge şablonları, gezinme blokları ve
 *    iki ayrı tipografi tanımı hep buradaydı. Dört bileşene ayrıldı:
 *    article-post-view · article-region-view · article-prose ·
 *    article-pager-nav.
 */
const route = useRoute()
const slug = computed(() => route.params.slug)

const { brandName, siteUrl, ogImage: siteOgImage, mutlakGorsel, settings } = await useSiteSettings()

/**
 * Hizmet/bölge şemalarındaki `provider` düğümü.
 *
 * Önceden yalnızca `name` ve `url` içeriyordu — 130 sayfada işletme
 * düğümü neredeyse boştu. Yerel aramada en çok işe yarayacak sayfalar
 * bunlar; telefon ve adres olmadan Google'a "burada hizmet veren bir
 * firma var" demek dışında bir şey söylemiyorlardı.
 *
 * Boş ayarlar `undefined` bırakılıyor — JSON.stringify onları atıyor.
 */
// İstanbul ilçesi mi? Kural veri ilişkisinden (cities 34 + slug != istanbul)
// ve TEK kaynaktan geliyor; sunucudaki /api/istanbul-ilceler de aynı
// işlevi okuyor. Bkz. shared/utils/istanbul.ts.
const saglayici = computed(() => ({
  '@type': 'MovingCompany',
  name: brandName.value,
  url: siteUrl.value,
  telephone: settings.value?.phone || settings.value?.mobilePhone || undefined,
  email: settings.value?.email || undefined,
  address: settings.value?.address
    ? { '@type': 'PostalAddress', streetAddress: settings.value.address, addressCountry: 'TR' }
    : undefined,
  priceRange: settings.value?.priceRange || undefined,
}))

/**
 * MAHALLE ADAYI — HİÇBİR İSTEK ATMADAN BİLİNİYOR.
 *
 * Adres `-mahallesi` ile bitiyorsa bu bir mahalle kabuğu ADAYI. Karar
 * yalnız slug'a baktığı için ağır liste isteklerinden ÖNCE verilebiliyor
 * ve bu, kabuğun taşıdığı yükü doğrudan belirliyor (aşağıya bakın).
 */
const mahalleAdayi = computed(() => String(slug.value).endsWith(`-${MAHALLE_EKI}`))

/**
 * AĞIR LİSTELER MAHALLE KABUĞUNDA ÇEKİLMİYOR.
 *
 * `?light=true` bölge ve yazı listeleri "ilgili bölgeler" ve önceki/sonraki
 * gezinmesi için var; mahalle kabuğunda ikisi de yok. Ölçüldü: birlikte
 * 43 KB tutuyorlar ve kabuğun ham HTML'inin üçte birinden fazlasıydılar
 * (116 KB → 73 KB). 473 kabuk sayfasının her birinde okunmayan veri.
 *
 * Diğer sayfa ailelerinde HİÇBİR ŞEY DEĞİŞMİYOR: istekler yine aynı
 * paralel turda gidiyor, sıralı bekleme (waterfall) oluşmuyor.
 *
 * Ölçüldü: bugün `-mahallesi` ile biten hiçbir yazı/bölge/hizmet adresi
 * yok. Yine de böyle bir kayıt eklenirse listeler aşağıda ikinci turda
 * çekiliyor — o sayfa gezinme bloklarını kaybetmiyor.
 */
const [
  { data: postData, error: postError },
  { data: regionData, error: regionError },
  { data: ilkAllPosts },
  { data: servicesData },
] = await Promise.all([
  useFetch(`/api/posts?slug=${slug.value}`),
  useFetch(`/api/regions?slug=${slug.value}`),
  // "İlgili bölgeler" / gezinme listeleri için sadece slug/başlık/görsel
  // gibi hafif alanlar gerekiyor — ?light=true ağır `content` sütununu
  // sorgudan tamamen çıkarır.
  //
  // İSTEK ORTAK SÖZLEŞMEDEN. Burada ham `useAsyncData('posts-light', …)`
  // vardı ve `pages/blog.vue` aynı anahtarı transform'lu kullanıyordu; iki
  // imza tutmayınca Nuxt önbelleği ikinci çağırana yabancı şekli veriyor ve
  // blog dizini boşalıyordu (NUXT_E3004). Gerekçe ve ölçüm:
  // composables/useLightPosts.ts. Sonuç artık HER İKİ tarafta da HafifYazi[].
  useLightPosts(() => mahalleAdayi.value),
  // Hizmetler tek bir bölüm kaydında toplu geliyor; slug ile ayrı bir uç
  // nokta yok. Kayıt sayısı tek haneli olduğu için tamamını çekip burada
  // eşleştirmek, yeni bir API rotası açmaktan daha sade.
  useFetch('/api/services', { key: 'services-section' }),
])

const post = computed(() => (postData.value?.success ? postData.value.data : null))
const region = computed(() => (regionData.value?.success ? regionData.value.data : null))

/**
 * Hizmet sayfaları da yazılar ve bölgeler gibi KÖK adreste yayınlanıyor
 * (/asansorlu-nakliyat). Eşleşme sırası: yazı → bölge → hizmet.
 *
 * Aynı slug birden fazla türde bulunamaz: yazı ve bölge tablolarında slug
 * zaten UNIQUE, Service.slug sütununa da UNIQUE indeks eklendi. Türler
 * ARASINDA çakışma olursa (ör. "depolama" adlı bir bölge ve bir hizmet)
 * bu sıra hangisinin gösterileceğini belirliyor; böyle bir durumda sayfa
 * sessizce yanlış içeriği göstermek yerine ilk eşleşeni gösterir ve
 * çakışma panelde slug değiştirilerek çözülür.
 */
const service = computed(() => {
  if (post.value || region.value) return null
  const list = servicesData.value?.data?.services || []
  // `route.params.slug` catch-all rotada DİZİ döner (['asansorlu-nakliyat']).
  // Yazı ve bölge sorguları bunu şablon dizesi içinde kullandığı için fark
  // edilmiyordu (dizi otomatik metne çevriliyor); burada doğrudan
  // karşılaştırma yapıldığı için açıkça metne çevrilmesi gerekiyor —
  // aksi hâlde eşleşme hiçbir zaman tutmuyor ve sayfa 404 veriyor.
  const current = String(slug.value)
  return list.find((item) => item.slug && item.slug === current) || null
})

/**
 * MAHALLE ÇÖZÜMÜ — EN SON SIRADA.
 *
 * Öncelik: statik rota → yazı → bölge → hizmet → MAHALLE. Yayındaki hiçbir
 * adres mahalle uğruna el değiştirmiyor; bir mahalle ancak diğer dördü
 * eşleşmediyse çözülüyor.
 *
 * ÖN SÜZGEÇ: adres `-mahallesi` ile bitmiyorsa mahalle kaydı HİÇ çekilmiyor.
 *
 * 473'LÜK DİZİN ARTIK ÇEKİLMİYOR. Eskiden hem ilçe hem mahalle sayfası
 * `/api/istanbul-ilceler?tam=true` ile bütün adres dizinini (~13 KB)
 * taşıyordu; gerekçesi adreslerin çalışma zamanında hesaplanmasıydı.
 * Adresler artık `Neighborhood.canonicalPath` sütununda duruyor, yani her
 * sayfanın yalnız KENDİ ilçesinin kayıtlarına ihtiyacı var.
 */
const istanbulIlcesi = computed(() => istanbulIlcesiMi(region.value))

/**
 * BÖLGE LİSTESİ İKİNCİ DALGADA — YAZI SAYFASINDA HİÇ ÇEKİLMİYOR.
 *
 * `?light=true` bölge listesi (ölçüldü: 35 KB, 70 kayıt) yalnız bölge,
 * ilçe ve mahalle dallarında okunuyor. Yazı sayfasında tek tüketicisi
 * `postRegions` idi; o da bu turda kaldırıldı (şablondan üretilen bağlantı
 * çiftliği). Yani her blog yazısı okunmayan 35 KB taşıyordu.
 *
 * ŞELALE DERİNLİĞİ ARTMIYOR: sayfada zaten bir ikinci dalga var (hemen
 * aşağıdaki `istanbul-mahalle`), bu istek onunla AYNI turda ve paralel
 * gidiyor. Bölge/ilçe sayfaları listeyi eskisi gibi alıyor.
 */
const { data: ilkAllRegions } = await useAsyncData('regions-light', () =>
  mahalleAdayi.value || post.value ? Promise.resolve(null) : $fetch('/api/regions?light=true')
)

/**
 * MAHALLE VERİSİ — DALA GÖRE TEK İSTEK.
 *
 *   ilçe sayfası     → o ilçenin YAYINDAKİ mahalleleri
 *   mahalle sayfası  → kaydın kendisi (kardeşleri aynı yanıtta geliyor)
 *
 * İkisi aynı sayfada asla birlikte olmuyor, o yüzden tek istek yetiyor.
 * Kardeşlerin kayıtla birlikte gelmesi ikinci bir gidiş-dönüşü (şelaleyi)
 * önlüyor: kardeş listesini ayrı çekmek için önce kaydın hangi ilçeye ait
 * olduğunu bilmek gerekirdi.
 */
const { data: mahalleVeri } = await useAsyncData('istanbul-mahalle', async () => {
  const adaySayfa = mahalleAdayi.value && !post.value && !region.value && !service.value

  if (adaySayfa) {
    const kayit = await $fetch(`/api/mahalle?yol=${encodeURIComponent(String(slug.value))}`)
    return { kayit, ilceListesi: null }
  }

  if (istanbulIlcesi.value && region.value) {
    // Süzgeç SUNUCUDA: yanıt yalnız yayındaki mahalleleri taşıyor.
    const ilceListesi = await $fetch(
      `/api/mahalleler?ilce=${encodeURIComponent(region.value.slug)}`
    )
    return { kayit: null, ilceListesi }
  }

  return null
})

/** Açılan mahalle kaydı — içeriğiyle birlikte (pasifse içerik alanları boş). */
const mahalle = computed(() => {
  if (post.value || region.value || service.value) return null
  return mahalleVeri.value?.kayit?.data || null
})

/**
 * ORTAK KAPANIŞ — hangi ailelerde ve hangi cümleyle.
 *
 * Şablonda değil burada hesaplanıyor: koşul dört dalı birden okuyor ve
 * `final-cta`nın koşuluyla TAM TERS olmak zorunda; ikisi tek yerde yan
 * yana dursun.
 *
 * İstanbul DIŞI bölge sayfaları (`region` var, `istanbulIlcesi` yok)
 * bilerek dışarıda: onların kapanışı hâlâ eski `final-cta` bloğu ve o
 * kayıtların hepsi bugün yayından çekili.
 */
const kapanisVar = computed(() =>
  Boolean(post.value || service.value || istanbulIlcesi.value || mahalle.value)
)
const kapanisMetni = computed(() => (post.value ? KAPANIS_METNI.yazi : KAPANIS_METNI.ana))

/**
 * Aynı ilçedeki mahalleler — kardeş gezinme listesi.
 *
 * Pasif kabuklar DAHİL: bu liste mahalle sayfasında duruyor ve o sayfalar
 * birbirine `noindex, follow` ile bağlanmaya devam ediyor. İlçe sayfasının
 * listesi ise (aşağıda) yalnız yayındakileri gösteriyor.
 */
const mahalleKardesleri = computed(() =>
  (mahalle.value?.kardesler || []).map((k) => ({ ...k, ilce: mahalle.value.ilce }))
)

/**
 * İLÇE SAYFASININ MAHALLE BAĞLANTILARI — YALNIZ YAYINDAKİLER.
 *
 * Sayfası olmayan bir mahalleyi ilçe listesinde göstermek, olmayan bir
 * kapsamı bildirmekti: ziyaretçi tıklanabilir bir ad bekliyor, kabuk
 * sayfa ise içeriksiz. Sayı da aynı listeden geliyor (bkz.
 * IstanbulDistrictView) — ikisinin ayrışması artık mümkün değil.
 */
const ilceMahalleleri = computed(() =>
  istanbulIlcesi.value && region.value
    ? mahalleVeri.value?.ilceListesi?.data?.mahalleler || []
    : []
)

if (postError.value || regionError.value) {
  // Teknik ayrıntı ziyaretçiye GÖSTERİLMEZ.
  console.error('İçerik yüklenemedi:', postError.value || regionError.value)
}

/**
 * COĞRAFİ AĞ KAPALIYKEN BÖLGE VE MAHALLE 404.
 *
 * Yarışma sürümünde `publicRegionPages` kapalı (bkz.
 * composables/useRegionPages.ts). O hâlde bu rota yalnız YAZI ve HİZMET
 * eşleşmelerini karşılıyor; ilçe ve mahalle adresleri kayıt veri
 * tabanında dursa bile ziyaretçiye "Sayfa Bulunamadı" dönüyor.
 *
 * 301 ile ana sayfaya YIĞILMIYOR ve `noindex` ile 200 BIRAKILMIYOR:
 * yarışma sürümünde bu sayfalar gerçekten public ürünün parçası değil,
 * dolayısıyla doğru sözleşme 404. (`/istanbul` istisnası nitro
 * seviyesinde ve ayrı bir karar — bkz. nuxt.config.ts routeRules.)
 */
const bolgeAgiAcik = useRegionPages()
const cozumlendi = Boolean(
  post.value || service.value || (bolgeAgiAcik && (region.value || mahalle.value))
)

if (!cozumlendi) {
  throw createError({ statusCode: 404, statusMessage: 'Sayfa Bulunamadı', fatal: true })
}

/**
 * İKİNCİ TUR — yalnız beklenmeyen durumda.
 *
 * `-mahallesi` ile biten bir adres GERÇEKTEN bir yazı ya da bölge kaydına
 * denk gelirse (bugün böyle bir kayıt yok), yukarıda atlanan listeler
 * burada çekiliyor. Normal akışta bu istek hiç yapılmıyor.
 */
const { data: gecListeler } = await useAsyncData('gec-listeler', async () => {
  if (!mahalleAdayi.value || (!post.value && !region.value)) return null
  const [bolgeler, yazilar] = await Promise.all([
    $fetch('/api/regions?light=true'),
    $fetch('/api/posts?light=true'),
  ])
  // Yazı listesi AYNI kanonik şekle indirgeniyor: bu ikinci tur, yukarıdaki
  // ortak sözleşmenin dışından geliyor ve ham `{ success, data }` bırakırsa
  // aşağıdaki tüketici iki farklı şekille uğraşmak zorunda kalırdı.
  return { bolgeler, yazilar: normalizeLightPosts(yazilar) }
})

const allRegionsData = computed(() => ilkAllRegions.value || gecListeler.value?.bolgeler || null)

/**
 * Hafif yazı listesi — HER ZAMAN DİZİ.
 *
 * Eskiden `allPostsData` ham yanıt nesnesiydi ve tüketici `.data` ile
 * açıyordu. Artık ilk tur boş dizi döndüğünde (mahalle kabuğu) ikinci turun
 * listesine düşülüyor; iki kaynak da aynı şekli veriyor.
 */
const tumYazilar = computed(() =>
  ilkAllPosts.value.length ? ilkAllPosts.value : gecListeler.value?.yazilar || []
)

// ---- Bölge yardımcıları --------------------------------------------------
const allRegions = computed(() => allRegionsData.value?.data || [])

/**
 * BÖLGE AİLESİ İKİYE AYRILDI.
 *
 * `article/IstanbulDistrictView.vue` yalnız İSTANBUL İLÇELERİNİ karşılıyor.
 * Geri kalan 336 kayıt (il sayfaları, Ankara/İzmir ilçeleri, `/istanbul`'un
 * kendisi) eski `article/RegionView.vue` ile render edilmeye devam ediyor —
 * o sayfa ailesi bu turda denetlenmedi, düzeni sessizce değişmemeli.
 * (`istanbulIlcesi` yukarıda, mahalle çözümünden önce tanımlı.)
 *
 * Ayrım slug listesiyle değil, `istanbulIlcesiMi` ile yapılıyor: kayıt
 * `cities` içinde 34 taşıyor VE il sayfası değil.
 */

/** Yayındaki İstanbul ilçeleri — güzergâh, komşu ve dizin bağlantıları. */
const istanbulIlceleri = computed(() =>
  istanbulIlcesi.value ? allRegions.value.filter((x) => x.isActive && istanbulIlcesiMi(x)) : []
)

/** Yedi hizmet kaydı — ilçe sayfası ilgili hizmetleri buradan çözüyor. */
const tumHizmetler = computed(() => servicesData.value?.data?.services || [])

const relatedRegions = computed(() => {
  if (!region.value) return []
  const currentCities = parseCityIds(region.value.cities)
  if (!currentCities.length) return []

  return allRegions.value.filter((other) => {
    if (other.slug === region.value.slug || !other.isActive) return false
    return parseCityIds(other.cities).some((cityId) => currentCities.includes(cityId))
  })
})

// ---- Önceki / sonraki ----------------------------------------------------
const byDate = (list) =>
  [...(list || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

const adjacent = (currentSlug, items) => {
  const index = items.findIndex((item) => item.slug === currentSlug)
  return {
    previous: index > 0 ? items[index - 1] : null,
    next: index >= 0 && index < items.length - 1 ? items[index + 1] : null,
  }
}

const postNav = computed(() =>
  post.value ? adjacent(post.value.slug, byDate(tumYazilar.value)) : {}
)
const regionNav = computed(() =>
  region.value ? adjacent(region.value.slug, byDate(allRegions.value)) : {}
)

// ---- Meta ----------------------------------------------------------------
const content = computed(() => post.value || region.value || service.value)
// Mahalle kabuğunun `content` kaydı YOK (veri tabanında ayrı bir kayıt
// değil, ilçenin `neighborhoods` dizisinden çözülüyor). `content.slug`
// boş kaldığı için canonical ana sayfayı gösteriyordu — sayfa kendi
// adresini bildirmiyordu. Adres artık mahalle girdisinden alınıyor.
const canonical = computed(
  () => `${siteUrl.value}/${mahalle.value?.yol || content.value?.slug || ''}`
)
/**
 * PAYLAŞIM GÖRSELİ — MUTLAK VE MAHALLEYİ DE KAPSIYOR.
 *
 * İki şey değişti:
 *
 * 1. Değer artık `mutlakGorsel`den geçiyor. Kayıtlardaki yollar göreli
 *    (`/yuklemeler/…`) ve `og:image` göreli adres kabul etmiyor — paylaşım
 *    önizlemesi görselsiz çıkıyordu.
 *
 * 2. `mahalle` dalı eklendi. Mahalle kabuğunun `content` kaydı yok, bu
 *    yüzden görsel çözümü hiç çalışmıyordu ve on mahalle sayfası
 *    `og:image` ETİKETİNİ HİÇ BASMIYORDU. Kendi görseli varsa o, yoksa
 *    Site Ayarları'ndaki genel paylaşım görseli kullanılıyor.
 *
 * Hizmet kaydında alan adı `image` değil `imagePath`; ikisi de deneniyor.
 */
const shareImage = computed(
  () =>
    mutlakGorsel(
      content.value?.image ||
        content.value?.imagePath ||
        mahalle.value?.imagePath ||
        mahalle.value?.image
    ) || siteOgImage.value
)

/**
 * Hizmet sayfasında bağlantı verilecek bölgeler. Türkiye genelinde 120
 * bölge var; hepsini listelemek sayfayı bir dizine çevirirdi. Bunun yerine
 * İstanbul ilçelerinden ve büyük illerden sınırlı bir seçki gösteriliyor,
 * altında da tüm bölgeler dizinine bağlantı var.
 */
/**
 * Hizmetler arası önceki/sonraki gezinmesi. Yazılarda tarih, bölgelerde de
 * tarih sırası kullanılıyor; hizmetlerde ise panelde belirlenen `order`
 * anlamlı olan tek sıra (hizmetler kronolojik bir akış değil, bir menü).
 */
const serviceNav = computed(() => {
  if (!service.value) return {}
  const list = [...(servicesData.value?.data?.services || [])]
    .filter((item) => item.slug)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const index = list.findIndex((item) => item.slug === service.value.slug)

  /**
   * Yalnızca `slug` ve `title` aktarılıyor — kaydın tamamı DEĞİL.
   * article-pager-nav etiketi `shortTitle → subtitle → title` sırasıyla
   * seçiyor. Hizmetlerde `subtitle` bir slogan ("Dar merdiven ve yüksek
   * katlar için"), kısa ad değil; kaydın tamamı geçilseydi gezinme
   * düğmesinde hizmetin adı yerine sloganı görünürdü.
   */
  const etiketle = (item) => (item ? { slug: item.slug, title: item.title } : null)

  return {
    previous: etiketle(index > 0 ? list[index - 1] : null),
    next: etiketle(index >= 0 && index < list.length - 1 ? list[index + 1] : null),
  }
})

/*
 * KALDIRILDI — `postServices` ve `postRegions`.
 *
 * Bu iki hesaplama, her blog yazısının altına ŞABLONDAN 3 hizmet ve 10
 * bölge bağlantısı üretiyordu (`article/RelatedLinks.vue`). Gerekçesi
 * "yazılar konu otoritesi üretip hiçbir yere aktarmıyordu" idi; ama sonuç
 * ölçüldüğünde bağlantıların yazının konusuyla ilgisi yoktu:
 *
 *     /kis-aylarinda-tasinmak → /seyhan · /marmaris · /nilufer · /silivri …
 *
 * Bölge listesi yazının slug'ından türetilen bir başlangıç noktasıyla
 * kaydırılıyordu, yani "ilgili" değil yalnızca dağıtılmış bağlantılardı —
 * üstelik İSTANBUL DIŞI ilçeler de dahil. Kış aylarında taşınmayı anlatan
 * bir yazının altında Seyhan ve Marmaris bağlantısı bir bağlantı
 * çiftliğidir.
 *
 * Yazı metninin KENDİ içindeki bağlantılar korunuyor (bugün on yazının
 * hiçbirinde yok — ölçüldü). Yazıdan çıkış yolları artık yol izi
 * (`/blog`), önceki/sonraki yazı ve kapanış cümlesi.
 *
 * `article/RelatedLinks.vue` bu değişiklikle yetim kaldı; SİLİNMEDİ.
 */

/**
 * Hizmet sayfasındaki bölge bağlantıları — YALNIZ İSTANBUL İLÇELERİ.
 *
 * Önceden 12 ilçe + 12 İL basılıyordu (Ankara, İzmir, Bodrum, Bornova…) ve
 * bölüm başlığı "Bu hizmeti Türkiye genelinde veriyoruz" diyordu. İkisi de
 * sitenin İstanbul konumlandırmasıyla çelişiyordu; üstelik 24 rozet bir
 * bağlantı çiftliğiydi. İl sayfaları silinmedi — `/bolgelerimiz` hub'ından
 * erişilebilir kalıyorlar; hizmet detayından yalnız ilçelere bağlanıyoruz.
 *
 * `.slice(0, 12)` KALDIRILDI — ölçülmüş bir kusurdu.
 * ─────────────────────────────────────────────────────────────────────
 * Liste alfabetik sıralanıp ilk 12'si alınıyordu. Sonuç: YEDİ hizmet
 * sayfası da AYNI on iki ilçeyi bağlıyordu (Adalar → Beylikdüzü) ve geri
 * kalan 27 ilçe — Kadıköy, Üsküdar, Şişli, Beyoğlu, Maltepe, Pendik
 * dahil — hiçbir hizmet sayfasından bağlantı almıyordu. Yani kesme
 * noktası bir seçim değil, alfabenin yan etkisiydi.
 *
 * NEDEN "DAHA İYİ 12" SEÇİLMEDİ
 * Kontrollü bir sıralama alanı YOK: `Region` modelinde `order`,
 * `priority` ya da `featured` bulunmuyor (ölçüldü). Var olan sinyaller de
 * seçim için kullanılamadı:
 *   · içerik derinliği — 39 ilçenin 39'u da aynı (content + facts + faqs
 *     + routes + priceFactors tamamı dolu)
 *   · `createdAt` sırası — öncelik değil COĞRAFYA (önce Anadolu yakası,
 *     sonra Avrupa); ilk 12'si tek yakadan çıkıyordu
 *   · `routes` (gerçek talep sinyali) — liste yükünde bilerek YOK,
 *     `light` modunda atılan ağır sütunlardan biri
 * Uydurulmuş bir sıra ya da hizmet slug'ına göre döndürme, olmayan bir iş
 * kuralını varmış gibi göstermek olurdu.
 *
 * BUNUN YERİNE: SEÇİM YOK, TAM DİZİN.
 * Bölümün kendi işi zaten "kendi ilçenizi bulun" — bunun için doğru
 * arayüz keyfi bir on iki değil, var olan sayfaların eksiksiz listesi.
 * Sınırı veri çiziyor: yalnız AKTİF İstanbul ilçeleri; il sayfaları ve
 * İstanbul dışı kayıtlar filtrede eleniyor. Yani liste büyüyen bir
 * bağlantı yığını değil, kapalı ve doğrulanabilir bir dizin.
 *
 * Küratörlü bir "öne çıkan 12" istenirse gereken şey `Region` modeline
 * kontrollü bir sıralama alanı eklemek; bu tur şablon turu olduğu için
 * yapılmadı.
 */
const serviceRegions = computed(() => {
  if (!service.value) return []
  const collator = new Intl.Collator('tr-TR')
  return allRegions.value
    .filter((item) => item.isActive && !isProvincePage(item))
    .sort((a, b) => collator.compare(a.subtitle || a.title || '', b.subtitle || b.title || ''))
})

/**
 * Sayfa sonundaki "birlikte sık gereken hizmetler".
 *
 * Rastgele ya da sıradaki iki hizmet DEĞİL: keşifte gerçekten birlikte
 * çıkan eşleşmeler. Yedi hizmet olduğu için elle yazılmış eşleme, üretilmiş
 * bir benzerlik puanından hem daha doğru hem daha okunur. Eşleşme
 * bulunamazsa bölüm hiç basılmıyor (boş bölüm üretilmiyor).
 */
const ILGILI_HIZMET = {
  'evden-eve-nakliyat': ['paketleme-hizmeti', 'asansorlu-nakliyat', 'esya-depolama'],
  'asansorlu-nakliyat': ['evden-eve-nakliyat', 'parca-esya-tasima'],
  'parca-esya-tasima': ['evden-eve-nakliyat', 'paketleme-hizmeti'],
  'ofis-tasima': ['paketleme-hizmeti', 'esya-depolama'],
  'esya-depolama': ['evden-eve-nakliyat', 'ofis-tasima'],
  'sehirler-arasi-nakliyat': ['evden-eve-nakliyat', 'paketleme-hizmeti'],
  'paketleme-hizmeti': ['evden-eve-nakliyat', 'ofis-tasima'],
}

const serviceRelated = computed(() => {
  if (!service.value) return []
  const hepsi = servicesData.value?.data?.services || []
  return (ILGILI_HIZMET[service.value.slug] || [])
    .map((slug) => hepsi.find((h) => h.slug === slug))
    .filter(Boolean)
    .map((h) => ({ slug: h.slug, title: h.title, subtitle: h.subtitle }))
})

useHead(() => {
  /**
   * MAHALLE — ROBOTS DURUMA BAĞLI.
   *
   *   pasif kabuk  → `noindex, follow`  (henüz özgün içerik yok; 473 ince
   *                  sayfayı dizine sokmak sitenin tamamının kalite
   *                  sinyalini düşürürdü. `follow` KORUNUYOR: sayfa
   *                  taranmasa da ilçe/ana sayfa/kardeş bağlantıları
   *                  izlenmeye devam ediyor.)
   *   aktif        → `index, follow`  (yayın kapısından geçmiş, gerçek
   *                  içerik taşıyan pilot sayfalar)
   *
   * Karar VERİDEN geliyor (`isActive`), kodda sayfa listesi tutulmuyor.
   * Canonical iki durumda da kendi adresi — aktifleşince adres değişmiyor.
   */
  if (mahalle.value) {
    const adTam = mahalleBasligi(mahalle.value.ad)
    const h1 = mahalle.value.aktif
      ? mahalle.value.title?.trim() || `${adTam} Evden Eve Nakliyat`
      : adTam
    const aramaBasligi =
      mahalle.value.metaTitle?.trim() ||
      (mahalle.value.aktif
        ? `${h1} | ${brandName.value}`
        : `${adTam} — ${mahalle.value.ilceAd} | ${brandName.value}`)
    const aciklama =
      mahalle.value.metaDescription?.trim() ||
      mahalle.value.excerpt?.trim() ||
      `${adTam}, ${mahalle.value.ilceAd}. İstanbul'da hizmet verdiğimiz bölgeler.`

    /**
     * PAYLAŞIM ETİKETLERİ — BU DALDA HİÇ YOKTU.
     *
     * Mahalle sayfaları `og:` ve `twitter:` etiketlerinin TAMAMINI
     * atlıyordu; ölçüldü (M8): on mahalle sayfasının onunda da `og:image`
     * boştu. Yalnız görseli eklemek yetmezdi — başlıksız bir kart
     * paylaşımda yine bozuk görünürdü. Bu yüzden aşağıdaki küme,
     * kardeş daldaki (bölge/hizmet/yazı) etiketlerle AYNI biçimde.
     *
     * `robots` durumu değişmiyor: pasif kabuk hâlâ `noindex, follow`.
     * Paylaşım etiketi dizine girmeyi etkilemiyor; bir bağlantı
     * WhatsApp'ta paylaşıldığında kartın boş çıkmamasını sağlıyor.
     */
    return {
      title: aramaBasligi,
      meta: [
        { name: 'description', content: aciklama },
        { name: 'robots', content: mahalle.value.aktif ? 'index, follow' : 'noindex, follow' },
        { property: 'og:title', content: h1 },
        { property: 'og:description', content: aciklama },
        { property: 'og:image', content: shareImage.value },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: canonical.value },
        { property: 'og:site_name', content: brandName.value },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: shareImage.value },
      ],
      link: [{ rel: 'canonical', href: canonical.value }],
    }
  }

  const data = content.value
  if (!data) return {}

  /**
   * ARAMA AÇIKLAMASI — `metaDescription` > `excerpt`.
   *
   * `excerpt` dört işi birden yapıyordu: sayfanın giriş paragrafı, kart
   * metni, arama açıklaması ve paylaşım açıklaması. İlk ikisi doğal
   * okunmak ister, son ikisi tıklanma üretmek. Ölçüldü: 120 bölge
   * excerpt'inin HİÇBİRİNDE "evden eve nakliyat" geçmiyordu — yani arama
   * sonucunda ne hizmetin adı ne de tıklamak için bir sebep vardı.
   *
   * Artık ayrı bir alan var; boşsa `excerpt`e düşülüyor, böylece
   * doldurulmamış sayfa açıklamasız kalmıyor.
   */
  const aramaAciklamasi = data.metaDescription || data.excerpt || undefined

  /**
   * ARAMA BAŞLIĞI — panelden girilebilir, girilmezse otomatik.
   *
   * Otomatik biçim `başlık | marka` üç tür için de makul bir varsayılan
   * üretiyor ("Yenimahalle Evden Eve Nakliyat | Marka"), ama iki durumda
   * yetmiyor:
   *
   *   1. Uzun yazı başlıkları. "Taşınırken Eşya Sadeleştirme: Neyi
   *      Götürmeli, Neyi Bırakmalı?" zaten 60 karakteri aşıyor; markayı
   *      eklemek Google'ın kesme noktasını başlığın ortasına düşürüyor.
   *   2. Anahtar kelime sırası. Sayfadaki H1 doğal okunmak ister, arama
   *      başlığı ise aranan ifadeyi başa almak ister; ikisi her zaman aynı
   *      cümle olmuyor.
   *
   * `metaTitle` doldurulmuşsa OLDUĞU GİBİ kullanılıyor — markayı ekleyip
   * eklememek de yöneticinin kararı. Yarı otomatik bir birleştirme
   * (örneğin markayı yine sona eklemek) alanın varlık sebebini ortadan
   * kaldırırdı: karakter bütçesinin tamamı panelde görünmeli.
   */
  const aramaBasligi = data.metaTitle?.trim() || `${data.title} | ${brandName.value}`

  return {
    title: aramaBasligi,
    meta: [
      { name: 'description', content: aramaAciklamasi },
      { name: 'author', content: brandName.value },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: data.title },
      { property: 'og:description', content: aramaAciklamasi },
      { property: 'og:image', content: shareImage.value },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: canonical.value },
      { property: 'og:site_name', content: brandName.value },
      { name: 'twitter:card', content: 'summary_large_image' },
      // `twitter:image` EKSİKTİ. X, yoksa `og:image`e düşüyor — yani
      // görünür bir hata değildi; ama `usePageSeo` ile basılan on sabit
      // sayfa ikisini birden veriyor. İki emitter aynı etiket kümesini
      // versin diye eklendi.
      { name: 'twitter:image', content: shareImage.value },
    ],
    link: [{ rel: 'canonical', href: canonical.value }],
  }
})

// ---- Yapısal veri --------------------------------------------------------
//
// Bölge sayfalarında üç şema birden üretiliyor ve hepsi TEK bir @graph
// içinde veriliyor. Ayrı ayrı <script> etiketleri de geçerli olurdu, ama
// @graph düğümler arasında `@id` ile ilişki kurmayı mümkün kılıyor ve
// Google'ın Zengin Sonuç Testi'nde tek bir bütün olarak görünüyor.

/** Bölgenin il/ilçe kırılımı — BreadcrumbList için. */
const regionProvince = computed(() => {
  if (!region.value || isProvincePage(region.value)) return null
  const cityId = parseCityIds(region.value.cities)[0]
  const cityName = turkishCities.find((city) => city.id === cityId)?.name
  if (!cityName) return null
  return allRegions.value.find((item) => item.slug === slugify(cityName)) || null
})

const breadcrumbItems = computed(() => {
  const trail = [
    { name: 'Ana sayfa', url: siteUrl.value || '/' },
    { name: 'Bölgelerimiz', url: `${siteUrl.value}/bolgelerimiz` },
  ]
  if (regionProvince.value) {
    trail.push({
      name: regionProvince.value.subtitle || regionProvince.value.title,
      url: `${siteUrl.value}/${regionProvince.value.slug}`,
    })
  }
  trail.push({ name: region.value?.subtitle || region.value?.title, url: canonical.value })
  return trail
})

/**
 * FAQPage — yalnızca gerçekten soru-cevap varsa.
 *
 * Boş bir FAQPage ya da soru/cevabı eksik bir öğe, Search Console'da
 * yapısal veri hatası üretir ve zengin sonuç hakkını tümden kaybettirir.
 * Bu yüzden hem burada hem görünümde aynı filtre uygulanıyor.
 */
const regionFaqs = computed(() =>
  parseJsonArray(region.value?.faqs).filter((item) => item?.question && item?.answer)
)

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => {
        /**
         * MAHALLE ŞEMASI — YALNIZ AKTİF SAYFADA.
         *
         * Pasif kabukta hizmet açıklaması ya da soru yok; boş bir `Service`
         * işaretlemek anlamsız olurdu. Aktif sayfada `Service` + varsa
         * `FAQPage` üretiliyor. `BreadcrumbList` iki durumda da bileşen
         * içinde Microdata olarak, GÖRÜNEN listeyle aynı kaynaktan.
         *
         * `LocalBusiness` HİÇBİR durumda yok: 473 mahalle 473 şube değil.
         * Uydurma adres, koordinat, puan/yorum basılmıyor; `provider` tek
         * ve gerçek işletme kaydı.
         */
        if (mahalle.value) {
          if (!mahalle.value.aktif) return '{}'

          const adTam = mahalleBasligi(mahalle.value.ad)
          const grafik = [
            {
              '@type': 'Service',
              '@id': `${canonical.value}#hizmet`,
              name: mahalle.value.title?.trim() || `${adTam} Evden Eve Nakliyat`,
              serviceType: 'Evden eve nakliyat',
              description: mahalle.value.excerpt || undefined,
              provider: saglayici.value,
              // Kapsanan yer üç kademeli: mahalle → ilçe → şehir. Koordinat
              // ya da mahalleye ait adres YAZILMIYOR; elimizde doğrulanmış
              // böyle bir veri yok.
              areaServed: {
                '@type': 'AdministrativeArea',
                name: adTam,
                containedInPlace: {
                  '@type': 'AdministrativeArea',
                  name: mahalle.value.ilceAd,
                  containedInPlace: { '@type': 'City', name: 'İstanbul' },
                },
              },
            },
          ]

          const sorular = parseJsonArray(mahalle.value.faqs).filter(
            (i) => i?.question && i?.answer
          )
          if (sorular.length) {
            grafik.push({
              '@type': 'FAQPage',
              '@id': `${canonical.value}#sss`,
              mainEntity: sorular.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: { '@type': 'Answer', text: item.answer },
              })),
            })
          }

          return JSON.stringify({ '@context': 'https://schema.org', '@graph': grafik })
        }

        const data = content.value
        if (!data) return '{}'

        const shared = {
          headline: data.title,
          description: data.excerpt || undefined,
          image: shareImage.value,
          url: canonical.value,
          publisher: { '@type': 'Organization', name: brandName.value },
        }

        if (post.value) {
          return JSON.stringify({
            '@context': 'https://schema.org',
            ...shared,
            '@type': 'BlogPosting',
            // `author` BİLİNÇLİ OLARAK YOK. Öncesinde `data.author ||
            // brandName` yazıyordu; on kaydın hiçbirinde `author` dolu
            // olmadığı için pratikte HER YAZI markayı yazar olarak
            // bildiriyordu. Doğrulayıcıyı memnun etmek için olmayan bir
            // yazar üretmek, ekranda göstermekten daha kalıcı bir yanlış.
            // Alan gerçekten doldurulursa buraya geri eklenebilir.
            datePublished: data.createdAt || undefined,
            dateModified: data.updatedAt || data.createdAt || undefined,
            mainEntityOfPage: { '@type': 'WebPage', '@id': canonical.value },
          })
        }

        // --- Hizmet sayfası ---
        if (service.value) {
          const serviceGraph = [
            {
              '@type': 'Service',
              '@id': `${canonical.value}#hizmet`,
              name: data.title,
              serviceType: data.title,
              description: data.excerpt || data.description || undefined,
              provider: saglayici.value,
              // 'Country: Türkiye' idi — ana sayfanın şeması ve sitenin
              // konumlandırması İstanbul; hizmet şeması onunla çelişmemeli.
              areaServed: { '@type': 'City', name: 'İstanbul' },
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${canonical.value}#kirilim`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Ana sayfa', item: siteUrl.value },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Hizmetlerimiz',
                  item: `${siteUrl.value}/hizmetlerimiz`,
                },
                { '@type': 'ListItem', position: 3, name: data.title, item: canonical.value },
              ],
            },
          ]

          const serviceFaqs = parseJsonArray(data.faqs).filter((i) => i?.question && i?.answer)
          if (serviceFaqs.length) {
            serviceGraph.push({
              '@type': 'FAQPage',
              '@id': `${canonical.value}#sss`,
              mainEntity: serviceFaqs.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: { '@type': 'Answer', text: item.answer },
              })),
            })
          }

          return JSON.stringify({ '@context': 'https://schema.org', '@graph': serviceGraph })
        }

        const areaName = data.subtitle || data.title

        const graph = [
          {
            '@type': 'Service',
            '@id': `${canonical.value}#hizmet`,
            name: data.title,
            serviceType: 'Evden eve nakliyat',
            description: data.excerpt || undefined,
            provider: saglayici.value,
            // İstanbul ilçesinde kapsanan yer AÇIKÇA bildiriliyor: ilçe bir
            // şehir değil, İstanbul'un idari bir parçası. Koordinat ya da
            // ilçeye ait bir adres YAZILMIYOR — elimizde doğrulanmış böyle
            // bir veri yok ve uydurulanı 39 şube izlenimi yaratırdı.
            areaServed: istanbulIlcesi.value
              ? {
                  '@type': 'AdministrativeArea',
                  name: areaName,
                  containedInPlace: { '@type': 'City', name: 'İstanbul' },
                }
              : { '@type': 'Place', name: areaName },
          },
        ]

        /**
         * YOL İZİ — İSTANBUL İLÇESİNDE BURADA ÜRETİLMİYOR.
         *
         * V2 ilçe görünümü kırılım yolunu EKRANDA gösteriyor ve aynı listeyi
         * Microdata (`BreadcrumbList`) ile işaretliyor. Buraya bir de JSON-LD
         * düğümü konsaydı sayfada AYNI yol iki kez bildirilirdi; iki kaynak
         * zamanla ayrışır ve hangisinin doğru olduğu belirsizleşir.
         * İstanbul dışı bölge sayfalarının görünen yolunda işaretleme yok,
         * onlarda JSON-LD tek kaynak olarak kalıyor.
         */
        if (!istanbulIlcesi.value) {
          graph.push({
            '@type': 'BreadcrumbList',
            '@id': `${canonical.value}#kirilim`,
            itemListElement: breadcrumbItems.value.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: item.name,
              item: item.url,
            })),
          })
        }

        if (regionFaqs.value.length) {
          graph.push({
            '@type': 'FAQPage',
            '@id': `${canonical.value}#sss`,
            mainEntity: regionFaqs.value.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          })
        }

        return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
      },
    },
  ],
})
</script>

<template>
  <!--
    ÜÇ GÖRÜNÜMÜN YALNIZ BİRİ KULLANILIYOR, ÜÇÜ BİRDEN İNİYORDU.

    Bu dosya blog yazısı, bölge ve hizmet sayfalarının üçünü birden karşılıyor
    ve `v-if` ile hangisinin basılacağına karar veriyor. Ama otomatik içe
    aktarılan bileşenler STATİK olarak paketlendiği için istemci, hangi
    sayfada olursa olsun üçünün de kodunu indiriyordu. Ölçüldü: /kadikoy,
    /parca-esya-tasima ve bir blog yazısının üçünde de ön yüklenen JS
    birebir aynıydı — 535 KB.

    `Lazy` öneki bunu koşula bağlıyor: yalnız `v-if`i tutan dal indiriliyor.
    Sunucu çıktısı değişmiyor, sayfa yine eksiksiz HTML olarak basılıyor.

    Bu üçü sayfanın ANA İÇERİĞİ, o yüzden `hydrate-on-visible` VERİLMİYOR —
    zaten ilk ekranda görünüyorlar. Yalnız kapanış çağrısı ekranın altında,
    onda görünürlük ölçütü var (ana sayfadakiyle aynı 300px payı: `useReveal`
    gizlemeyi eleman ekrana girmeden yapabilsin diye).
  -->
  <main>
    <!-- YAZI → V2 okuma sayfası.
         `author-fallback` KALDIRILDI: on Post kaydının hiçbirinde `author`
         dolu değil, yani o yedek ad ekranda uydurma bir yazar üretiyordu.
         `related-services` / `related-regions` de KALDIRILDI: şablondan
         üretilen 3 hizmet + 10 bölge bağlantısı yazının konusuyla ilgili
         değildi (İstanbul dışı ilçeler dahil). -->
    <lazy-article-blog-post-view
      v-if="post"
      :post="post"
      :previous="postNav.previous"
      :next="postNav.next"
    />

    <!-- İSTANBUL İLÇESİ → V2 yerel operasyon rehberi -->
    <lazy-article-istanbul-district-view
      v-else-if="region && istanbulIlcesi"
      :district="region"
      :districts="istanbulIlceleri"
      :services="tumHizmetler"
      :mahalleler="ilceMahalleleri"
    />

    <!-- İSTANBUL DIŞI (il sayfaları, diğer illerin ilçeleri) → eski görünüm -->
    <lazy-article-region-view
      v-else-if="region"
      :region="region"
      :related="relatedRegions"
      :all-regions="allRegions"
      :previous="regionNav.previous"
      :next="regionNav.next"
    />

    <lazy-article-service-view
      v-else-if="service"
      :service="service"
      :regions="serviceRegions"
      :related="serviceRelated"
    />

    <!-- MAHALLE → pasifse gezinme kabuğu, aktifse içerik sayfası -->
    <lazy-article-istanbul-neighborhood-view
      v-else-if="mahalle"
      :mahalle="mahalle"
      :kardesler="mahalleKardesleri"
      :services="tumHizmetler"
    />

    <!-- Yalnız İSTANBUL DIŞI bölge sayfaları kullanıyor. Hizmet detayı,
         İstanbul ilçesi, mahalle ve artık YAZI sayfaları kendi ölçülü
         kapanışlarına geçti; eski blok onlarla üst üste biniyor ve yeni
         dille çelişiyordu. Bileşen silinmedi. -->
    <lazy-base-final-cta
      v-if="!post && !service && !istanbulIlcesi && !mahalle"
      :hydrate-on-visible="{ rootMargin: '300px' }"
    />

    <!--
      ORTAK KAPANIŞ İMZASI — dört aile, tek blok.

      Yukarıdaki `final-cta` ile BİRLİKTE ÇIKAMAZ: onun koşulu bu dördünün
      hepsinin YOK olması, buranınki en az birinin VAR olması. İki koyu
      kapanış üst üste binmiyor.

      METİN AİLEYE GÖRE. Yazı sayfasında okur bilgi almaya geldi; hizmet ve
      bölge sayfalarında adres zaten konuşuluyor. `utils/kapanis.ts`.

      Bu dört ailenin kendi kapanış paragrafları DURUYOR ama iletişim
      cümleleri onlardan çıkarıldı: sayfa sonunda tek ana iletişim kapanışı
      var. Kalan bağlantılar (fiyat aracı, blog dizini, komşu sayfalar)
      farklı hedefler, tekrar değil.
    -->
    <lazy-base-kapanis
      v-if="kapanisVar"
      :baslik="kapanisMetni"
      :hydrate-on-visible="{ rootMargin: '300px' }"
    />
  </main>
</template>
