// shared/utils/istanbul.ts
//
// İSTANBUL İLÇE SINIFLANDIRMASI — TEK KAYNAK.
//
// Bu dosya `shared/` altında çünkü kuralı HEM istemci (sayfa hangi görünümü
// basacak?) HEM sunucu (`/api/istanbul-ilceler` hangi kayıtları döndürecek?)
// okuyor. İki tarafa iki kopya yazılsaydı, biri değiştiğinde diğeri sessizce
// eskir ve bir ilçe iki yerde farklı sınıflandırılırdı.
//
// ─────────────────────────────────────────────────────────────────────────
// SINIFLANDIRMA SLUG LİSTESİNE DAYANMIYOR
//
// Bir kaydın İstanbul ilçesi olup olmadığı VERİ İLİŞKİSİNDEN çıkıyor:
//
//     cities dizisi 34'ü içeriyor   VE   slug 'istanbul' değil
//
// `Region` modelinde il/ilçe ayrımını tutan bir sütun yok; il sayfasının
// slug'ı ilin adının slug'ıdır (bkz. schema.prisma → Region, ve
// app/utils/turkishCities.ts → isProvincePage). Yani `slug !== 'istanbul'`
// bir tahmin değil, modelin bu ayrımı tutan tek kuralının İstanbul'a
// uygulanmış hâli.
//
// Aşağıdaki 39 slug'lık yaka listesi SINIFLANDIRMA İÇİN KULLANILMIYOR;
// yalnızca sınıflandırılmış bir ilçenin hangi yakada olduğunu söylüyor.
// Listede olmayan bir İstanbul ilçesi eklenirse kayıt yine ilçe sayılır,
// sadece yakası "bilinmiyor" döner ve arayüz onu "Diğer" başlığı altında
// gösterir — sessizce kaybolmaz.

/** İstanbul'un plaka kodu — `Region.cities` bu kodları tutuyor. */
export const ISTANBUL_PLAKA = 34

/** İl sayfasının slug'ı. Bu kayıt ilçe DEĞİL. */
export const ISTANBUL_IL_SLUG = 'istanbul'

export interface IstanbulYaka {
  anahtar: 'avrupa' | 'anadolu'
  ad: string
  sluglar: string[]
}

/**
 * Yaka eşlemesi.
 *
 * Nakliyatta gerçekten fark yaratan bir bilgi: yakalar arası taşımada
 * köprü güzergâhı, geçiş ücreti ve süre değişiyor. Anahtar olarak slug
 * kullanılıyor — ilçe adı serbest metin alanından geliyor ve yazımı
 * değişebilir, slug ise benzersiz ve sabit.
 */
export const istanbulYakalari: IstanbulYaka[] = [
  {
    anahtar: 'avrupa',
    ad: 'Avrupa Yakası',
    sluglar: [
      'arnavutkoy', 'avcilar', 'bagcilar', 'bahcelievler', 'bakirkoy',
      'basaksehir', 'bayrampasa', 'besiktas', 'beylikduzu', 'beyoglu',
      'buyukcekmece', 'catalca', 'esenler', 'esenyurt', 'eyupsultan',
      'fatih', 'gaziosmanpasa', 'gungoren', 'kagithane', 'kucukcekmece',
      'sariyer', 'silivri', 'sultangazi', 'sisli', 'zeytinburnu',
    ],
  },
  {
    anahtar: 'anadolu',
    ad: 'Anadolu Yakası',
    sluglar: [
      'adalar', 'atasehir', 'beykoz', 'cekmekoy', 'kadikoy', 'kartal',
      'maltepe', 'pendik', 'sancaktepe', 'sultanbeyli', 'sile', 'tuzla',
      'umraniye', 'uskudar',
    ],
  },
]

/** `Region.cities` alanını güvenle plaka dizisine çevirir. */
const plakalar = (deger: unknown): unknown[] => {
  if (Array.isArray(deger)) return deger
  if (typeof deger !== 'string') return []
  try {
    const cozulen = JSON.parse(deger)
    return Array.isArray(cozulen) ? cozulen : []
  } catch {
    return []
  }
}

/** Kayıt bir İSTANBUL İLÇESİ mi? (il sayfası ve İstanbul dışı kayıtlar hariç) */
export const istanbulIlcesiMi = (kayit?: { slug?: string; cities?: unknown } | null): boolean =>
  Boolean(kayit?.slug) &&
  kayit!.slug !== ISTANBUL_IL_SLUG &&
  plakalar(kayit!.cities).includes(ISTANBUL_PLAKA)

/** İlçenin yakası; eşlemede yoksa `null`. */
export const istanbulYakasi = (slug?: string): IstanbulYaka | null =>
  istanbulYakalari.find((yaka) => slug && yaka.sluglar.includes(slug)) || null
