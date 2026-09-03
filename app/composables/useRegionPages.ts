// composables/useRegionPages.ts
//
// COĞRAFİ SAYFA AĞININ TEK OKUMA NOKTASI.
//
// ─────────────────────────────────────────────────────────────────────────
// NE YAPIYOR
//
// `/bolgelerimiz`, 39 İstanbul ilçesi ve 473 mahalle rotasının ziyaretçiye
// AÇIK olup olmadığını söyler. Değer `nuxt.config.ts` →
// `runtimeConfig.public.publicRegionPages` alanından geliyor; yarışma
// sürümünde `false`.
//
// Neden composable: bayrak sekiz ayrı yerde okunuyor (iki rota koruması,
// navbar, alt bilgi, iletişim yolları, hakkımızda, ana sayfanın iki
// bölümü, hizmet detayı). `useRuntimeConfig().public.publicRegionPages`
// ifadesini sekiz kez yazmak yerine tek bir yer var — kapatma kararının
// gerekçesi de burada duruyor. Bunun ötesinde bir "özellik bayrağı
// altyapısı" KURULMADI: tek boolean, tek okuyucu.
//
// ─────────────────────────────────────────────────────────────────────────
// BU BİR İÇERİK DURUMU DEĞİL
//
// Kapalıyken hiçbir Region/Neighborhood kaydı silinmiyor, pasifleşmiyor,
// `isActive` değeri değişmiyor. Panelden yönetim de açık kalıyor. Kapanan
// tek şey PUBLIC GÖRÜNÜRLÜK: rota, sitemap ve dahili bağlantılar.
//
// Sunucu tarafında (sitemap gibi Nitro uçlarında) bu composable
// kullanılamaz; orada `useRuntimeConfig(event).public.publicRegionPages`
// doğrudan okunuyor — aynı alan, aynı değer.

/**
 * Coğrafi sayfa ağı ziyaretçiye açık mı?
 *
 * @example
 *   if (!useRegionPages()) throw createError({ statusCode: 404, fatal: true })
 */
export function useRegionPages(): boolean {
  return Boolean(useRuntimeConfig().public.publicRegionPages)
}
