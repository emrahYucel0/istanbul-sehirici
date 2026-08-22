// utils/turkishCities.ts

// Türkiye illeri (plaka koduna göre id). Daha önce pages/[...slug].vue ve
// components/admin/base/RegionPanel.vue içinde birbirinden bağımsız iki
// kopya olarak (81 satırlık inline dizi literalleri) tutuluyordu — hem
// gereksiz kod tekrarı hem de her bileşen render'ında (SSR dahil) yeniden
// oluşturulan bir dizi anlamına geliyordu. `utils/` Nuxt tarafından otomatik
// import edildiği için named export'lar doğrudan kullanılabiliyor.
export const turkishCities = [
  { id: 1, name: 'Adana' },
  { id: 6, name: 'Ankara' },
  { id: 7, name: 'Antalya' },
  { id: 34, name: 'İstanbul' },
  { id: 35, name: 'İzmir' },
  { id: 16, name: 'Bursa' },
  { id: 26, name: 'Eskişehir' },
  { id: 55, name: 'Samsun' },
  { id: 10, name: 'Balıkesir' },
  { id: 38, name: 'Kayseri' },
  { id: 46, name: 'Kahramanmaraş' },
  { id: 42, name: 'Konya' },
  { id: 21, name: 'Diyarbakır' },
  { id: 61, name: 'Trabzon' },
  { id: 25, name: 'Erzurum' },
  { id: 27, name: 'Gaziantep' },
  { id: 33, name: 'Mersin' },
  { id: 40, name: 'Kırşehir' },
  { id: 41, name: 'Kocaeli' },
  { id: 45, name: 'Manisa' },
  { id: 48, name: 'Muğla' },
  { id: 49, name: 'Muş' },
  { id: 51, name: 'Niğde' },
  { id: 52, name: 'Ordu' },
  { id: 54, name: 'Sakarya' },
  { id: 60, name: 'Tokat' },
  { id: 63, name: 'Şanlıurfa' },
  { id: 65, name: 'Van' },
  { id: 66, name: 'Yozgat' },
  { id: 67, name: 'Zonguldak' },
  { id: 2, name: 'Adıyaman' },
  { id: 3, name: 'Afyonkarahisar' },
  { id: 4, name: 'Ağrı' },
  { id: 5, name: 'Amasya' },
  { id: 8, name: 'Artvin' },
  { id: 9, name: 'Aydın' },
  { id: 11, name: 'Bilecik' },
  { id: 12, name: 'Bingöl' },
  { id: 13, name: 'Bitlis' },
  { id: 14, name: 'Bolu' },
  { id: 15, name: 'Burdur' },
  { id: 17, name: 'Çanakkale' },
  { id: 18, name: 'Çankırı' },
  { id: 19, name: 'Çorum' },
  { id: 20, name: 'Denizli' },
  { id: 22, name: 'Edirne' },
  { id: 23, name: 'Elazığ' },
  { id: 24, name: 'Erzincan' },
  { id: 28, name: 'Giresun' },
  { id: 29, name: 'Gümüşhane' },
  { id: 30, name: 'Hakkari' },
  { id: 31, name: 'Hatay' },
  { id: 32, name: 'Isparta' },
  { id: 36, name: 'Kars' },
  { id: 37, name: 'Kastamonu' },
  { id: 39, name: 'Kırklareli' },
  { id: 43, name: 'Kütahya' },
  { id: 44, name: 'Malatya' },
  { id: 47, name: 'Mardin' },
  { id: 50, name: 'Nevşehir' },
  { id: 53, name: 'Rize' },
  { id: 56, name: 'Siirt' },
  { id: 57, name: 'Sinop' },
  { id: 58, name: 'Sivas' },
  { id: 59, name: 'Tekirdağ' },
  { id: 62, name: 'Tunceli' },
  { id: 64, name: 'Uşak' },
  { id: 68, name: 'Aksaray' },
  { id: 69, name: 'Bayburt' },
  { id: 70, name: 'Karaman' },
  { id: 71, name: 'Kırıkkale' },
  { id: 72, name: 'Batman' },
  { id: 73, name: 'Şırnak' },
  { id: 74, name: 'Bartın' },
  { id: 75, name: 'Ardahan' },
  { id: 76, name: 'Iğdır' },
  { id: 77, name: 'Yalova' },
  { id: 78, name: 'Karabük' },
  { id: 79, name: 'Kilis' },
  { id: 80, name: 'Osmaniye' },
  { id: 81, name: 'Düzce' },
]

/**
 * Region.cities alanını güvenle plaka kodu dizisine çevirir.
 *
 * Çözümlemenin kendisi utils/json.ts'te (aynı iş bölgenin faqs/facts/
 * neighborhoods/routes alanları için de gerekiyor); burada yalnızca alanın
 * anlamını taşıyan bir ad veriliyor.
 */
export const parseCityIds = (value: unknown): number[] => parseJsonArray<number>(value)

// ---------------------------------------------------------------------------
// COĞRAFİ BÖLGELER
// ---------------------------------------------------------------------------
//
// NEDEN EKLENDİ
// Bölgeler dizini illeri `cities[0]` alanına göre grupluyordu. Elimizde 81
// ilin her biri için BİRER sayfa olduğundan bu, "altında tek bir bağlantı
// bulunan 80 ayrı başlık" üretiyordu — taranması imkânsız bir liste.
// İlleri Türkiye'nin yedi coğrafi bölgesine ayırmak, 80 başlığı 7 anlamlı
// başlığa indiriyor ve sayfanın adıyla ("Bölgelerimiz") de örtüşüyor.
//
// Sıralama nakliyat hacmine göre: Marmara ve Ege en çok taşıma yaptığımız
// bölgeler, alfabetik sıra burada ziyaretçiye bir fayda sağlamıyor.

export interface GeographicRegion {
  key: string
  name: string
  /** Plaka kodları (turkishCities[].id ile aynı) */
  cityIds: number[]
}

export const geographicRegions: GeographicRegion[] = [
  {
    key: 'marmara',
    name: 'Marmara Bölgesi',
    cityIds: [34, 41, 54, 16, 77, 59, 22, 39, 17, 10, 11],
  },
  {
    key: 'ege',
    name: 'Ege Bölgesi',
    cityIds: [35, 45, 9, 48, 20, 3, 43, 64],
  },
  {
    key: 'akdeniz',
    name: 'Akdeniz Bölgesi',
    cityIds: [7, 33, 1, 31, 46, 80, 32, 15],
  },
  {
    key: 'ic-anadolu',
    name: 'İç Anadolu Bölgesi',
    cityIds: [6, 42, 26, 38, 58, 50, 68, 51, 70, 40, 71, 18, 66],
  },
  {
    key: 'karadeniz',
    name: 'Karadeniz Bölgesi',
    cityIds: [55, 61, 53, 52, 28, 67, 74, 78, 14, 81, 37, 57, 5, 19, 60, 8, 29, 69],
  },
  {
    key: 'dogu-anadolu',
    name: 'Doğu Anadolu Bölgesi',
    cityIds: [25, 24, 36, 75, 76, 4, 65, 13, 49, 12, 62, 23, 44, 30],
  },
  {
    key: 'guneydogu-anadolu',
    name: 'Güneydoğu Anadolu Bölgesi',
    cityIds: [27, 63, 21, 47, 72, 56, 73, 2, 79],
  },
]

/**
 * Kayıt, bağlı olduğu ilin GENEL sayfası mı yoksa o ile ait bir ilçe
 * sayfası mı?
 *
 * Veri modelinde bu ayrımı tutan bir alan yok — hem "İstanbul" hem "Kadıköy"
 * kaydı `cities: [34]` taşıyor. Ayrım slug üzerinden yapılıyor: il sayfasının
 * slug'ı, ilin adının slug'ıyla birebir aynıdır (İstanbul → "istanbul").
 * Şemaya yeni bir sütun eklemeden, panelden girilen veriyle kendiliğinden
 * doğru çalışan bir kural.
 */
export const isProvincePage = (region: { slug?: string; cities?: unknown }): boolean => {
  const cityId = parseCityIds(region?.cities)[0]
  const cityName = turkishCities.find((city) => city.id === cityId)?.name
  return Boolean(cityName && region?.slug === slugify(cityName))
}

/** Plaka kodundan coğrafi bölgeye hızlı erişim (O(1)). */
export const cityIdToGeographicRegion: Record<number, GeographicRegion> =
  geographicRegions.reduce(
    (map, region) => {
      region.cityIds.forEach((id) => {
        map[id] = region
      })
      return map
    },
    {} as Record<number, GeographicRegion>
  )

// ---------------------------------------------------------------------------
// İSTANBUL — YAKA AYRIMI  →  TAŞINDI
// ---------------------------------------------------------------------------
//
// `istanbulDistrictSides` buradan `shared/utils/istanbul.ts`e taşındı ve
// `istanbulYakalari` adını aldı. Sebep: aynı eşlemeyi artık SUNUCU da
// okuyor (`server/domain/regions/istanbul.service.ts`) ve bu dosya yalnız
// istemci tarafında otomatik içe aktarılıyor. İki kopya tutulsaydı biri
// değiştiğinde bir ilçe iki yerde farklı sınıflandırılırdı.
//
// Aynı modülde İstanbul ilçesi olup olmadığını söyleyen `istanbulIlcesiMi`
// de var; yukarıdaki `isProvincePage` ile aynı kuralın (il sayfasının
// slug'ı = ilin adının slug'ı) İstanbul'a uygulanmış hâli.
