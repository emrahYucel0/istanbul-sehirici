// shared/utils/slugify.ts
//
// TÜRKÇE'YE DUYARLI SLUG ÜRETİCİ
//
// NEDEN `shared/` ALTINDA
// Dosya `app/utils/` içindeydi, yani yalnız istemci tarafında otomatik
// içe aktarılıyordu. Mahalle adresleri hem sunucuda (rota çözümü) hem
// istemcide (ilçe sayfasındaki bağlantılar) aynı kuralla üretilmek
// zorunda; iki kopya tutmak "Çınardere" için iki farklı adres üretme
// riski demekti. `shared/` her iki tarafa da otomatik geliyor, dolayısıyla
// mevcut çağrılar (`slugify(...)`) hiç değişmeden çalışmaya devam ediyor.
//
// NEDEN AYRI BİR DOSYA
// Bu mantık daha önce yalnızca components/article/RegionView.vue içinde,
// başlık çıpaları (anchor) için yerel bir yardımcı olarak duruyordu. Aynı
// dönüşüm bölge/yazı slug'ları üretilirken de gerekiyor; iki ayrı kopya
// tutmak, birindeki hatanın diğerine sızmaması gibi yanlış bir güvenlik
// hissi veriyor. `utils/` Nuxt tarafından otomatik import edilir.
//
// DÜZELTİLEN HATA (ciddi)
// Önceki sürüm önce `toLocaleLowerCase('tr-TR')` çağırıyor, sonra ASCII
// olmayan karakterleri siliyordu. Türkçe yerelinde büyük "I" harfinin küçüğü
// NOKTASIZ "ı"dır; "ı" ASCII olmadığı için bir sonraki adımda tamamen
// siliniyordu. Sonuç:
//     "Isparta" -> "sparta"      (baştaki harf yok oldu)
//     "Iğdır"   -> "gdir"        (baştaki harf yok oldu)
// Bu iki il sayfası yanlış URL'de yayınlanmıştı.
//
// ÇÖZÜM
// Türkçe'ye özgü harfler küçültme İŞLEMİNDEN ÖNCE ASCII karşılıklarına
// çevriliyor; büyük "I" bu haritada açıkça "i" olarak yer alıyor. Tüm
// Türkçe karakterler zaten ASCII'ye indiği için sonrasında yerelden
// bağımsız düz `toLowerCase()` yeterli ve güvenli.

/** Türkçe (ve düzeltme işaretli) harflerin ASCII karşılıkları. */
const TR_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  I: 'i', // KRİTİK: tr-TR küçültmesi bunu noktasız "ı" yapar, sonra silinir.
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
  â: 'a',
  Â: 'a',
  î: 'i',
  Î: 'i',
  û: 'u',
  Û: 'u',
}

/**
 * Bir metni URL ve HTML `id` değeri olarak kullanılabilir hâle getirir.
 * Yalnızca [a-z0-9-] döner; baştaki/sondaki tireler kırpılır.
 *
 * @example slugify('Iğdır')        // 'igdir'
 * @example slugify('Kahramanmaraş') // 'kahramanmaras'
 */
export const slugify = (value: unknown): string =>
  String(value ?? '')
    .replace(/[çÇğĞıIİöÖşŞüÜâÂîÎûÛ]/g, (char) => TR_MAP[char] ?? char)
    .toLowerCase()
    // Haritada olmayan bileşik karakterler için (é, ñ …) ayrıştır ve
    // birleştirici aksan işaretlerini at.
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
