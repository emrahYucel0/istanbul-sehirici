// composables/useLightPosts.ts
//
// HAFİF YAZI LİSTESİNİN TEK SÖZLEŞMESİ — `GET /api/posts?light=true`.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN VAR
//
// Aynı `posts-light` anahtarı iki sayfada FARKLI sözleşmeyle kullanılıyordu:
//
//   pages/blog.vue          useFetch  + transform → Türkçe görünüm modeli
//   pages/[...slug].vue     useAsyncData, transform YOK → ham { success, data }
//
// Nuxt önbelleği anahtar başına TEK kayıt tutuyor ve `handler` / `transform`
// / `pick` / `getCachedData` / `default` imzalarını karşılaştırıyor
// (nuxt/dist/app/composables/asyncData.js — `createHash`, fonksiyonun KAYNAK
// METNİNİ hash'liyor). İmzalar tutmayınca NUXT_E3004 uyarısı çıkıyor ve —
// asıl zarar — ikinci çağıran, önbellekteki YABANCI şekli olduğu gibi
// alıyor: `transform` yeniden çalışmıyor.
//
// Ölçülen kullanıcı hatası: bir `[...slug]` sayfasından /blog'a SPA ile
// geçildiğinde liste bileşenine dizi yerine nesne gidiyor ve blog dizini
// boşalıyor (1920'de yazı bağlantısı 9 yerine 45 ya da 3, sayfalama
// bağlantısı 2 yerine 0).
//
// ─────────────────────────────────────────────────────────────────────────
// ÇÖZÜM: ANAHTARI DEĞİL SÖZLEŞMEYİ TEKLEŞTİRMEK
//
// İki sayfa GERÇEKTEN aynı veri kümesini istiyor (aynı uç nokta, aynı
// sorgu, aynı kayıtlar); ayrı anahtar vermek uyarıyı susturur ama aynı
// listeyi iki kez indirir. Bunun yerine handler ve transform BURADA bir kez
// tanımlanıyor; iki çağıran da aynı fonksiyon nesnelerini kullandığı için
// hash'ler zorunlu olarak eşit.
//
// KANONİK ŞEKİL: `HafifYazi[]` — API'nin döndürdüğü ham hafif kayıtlar,
// yalnız başlığı ve adresi olanlar. `{ success, data }` sarmalayıcısı
// composable'ın DIŞINA çıkmıyor; `null` yanıt da boş diziye iniyor, yani
// tüketiciler her zaman dizi görüyor (SSR ilk yükleme ve istemci gezinmesi
// aynı sonucu üretiyor).
//
// Türkçe görünüm modeli (baslik/ozet/gorsel…) artık `transform` içinde
// DEĞİL: o blog dizinine özgü bir sunum kararı ve orada `computed` olarak
// türetiliyor. Böylece prev/next gezinmesinin ihtiyaç duyduğu alanlar
// (`shortTitle`, `subtitle`, `createdAt`) listede kalıyor.

/** `/api/posts?light=true` kaydı — `content` sütunu sorguya hiç girmiyor. */
export interface HafifYazi {
  id?: number | string
  title: string
  slug: string
  subtitle?: string | null
  shortTitle?: string | null
  author?: string | null
  excerpt?: string | null
  image?: string | null
  imageAlt?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  isActive?: boolean
  publishedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

interface HafifYaziYaniti {
  success?: boolean
  data?: HafifYazi[] | null
}

/** Önbellek anahtarı — tek yerde yazılı. */
export const LIGHT_POSTS_KEY = 'posts-light'

/**
 * Ham yanıtı kanonik şekle indirger.
 *
 * BOZUK KAYIT LİSTEYİ KIRMIYOR: başlığı ya da adresi olmayan bir yazı
 * atlanıyor. Eskiden bu süzgeç yalnız blog dizinindeydi; artık gezinme de
 * aynı kuralı görüyor — bağlantı üretilemeyen bir kayıt önceki/sonraki
 * olarak da gösterilemiyordu (bkz. BlogPostView `etiket()`).
 */
export function normalizeLightPosts(cevap: HafifYaziYaniti | null | undefined): HafifYazi[] {
  const liste = cevap?.success ? cevap.data || [] : []
  return liste
    .filter((y) => String(y?.title ?? '').trim() && String(y?.slug ?? '').trim())
    .map((y) => ({ ...y, title: String(y.title).trim(), slug: String(y.slug).trim() }))
}

/** Tüketiciler her zaman dizi görsün; `null` kontrolü yayılmasın. */
function bosListe(): HafifYazi[] {
  return []
}

/**
 * Hafif yazı listesi.
 *
 * @param atlansinMi Doğru dönerse istek HİÇ yapılmaz ve boş liste döner.
 *   `[...slug].vue` mahalle kabuklarında bu listeyi okumuyor; 473 sayfada
 *   gereksiz bir sorgu açmamak için o dal atlanıyor. Kapanış BURADA bir
 *   parametre — handler'ın kaynak metni iki çağıranda da aynı kalsın diye.
 */
export function useLightPosts(atlansinMi?: () => boolean) {
  // Genel tür verilmiyor: `transform` çıktısı (HafifYazi[]) ile handler
  // yanıtı (HafifYaziYaniti | null) farklı; ikisini de TS çıkarsıyor.
  return useAsyncData(
    LIGHT_POSTS_KEY,
    () =>
      atlansinMi?.()
        ? Promise.resolve(null)
        : $fetch<HafifYaziYaniti>('/api/posts?light=true'),
    { transform: normalizeLightPosts, default: bosListe }
  )
}
