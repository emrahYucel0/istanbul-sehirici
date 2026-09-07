// shared/utils/kurulus.ts
//
// KURULUŞ VARLIĞININ TEK KİMLİĞİ.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN GEREKLİ
//
// Yapısal veride kuruluş beş ayrı yerde bildiriliyor:
//
//   /                       MovingCompany
//   hizmet sayfaları        Service.provider → MovingCompany
//   /hizmetlerimiz          Organization
//   /hakkimizda             AboutPage.publisher → Organization
//   /iletisim               ContactPage.publisher → Organization
//   yazı sayfaları          BlogPosting.publisher → Organization
//
// Hepsinin `name` alanı aynı ("Ege Kent Nakliyat") ama ölçüldüğünde
// hiçbirinde KİMLİK bağı yoktu: arama motoru için bunlar aynı adı taşıyan
// altı AYRI düğüm. `@id` verilince altısı da tek varlığa işaret ediyor —
// yeni bir alan uydurulmadan, yalnız var olan düğümler bağlanarak.
//
// Değer site kökünden türetiliyor; alan adı `nuxt.config.ts → site.url`
// üzerinden değişirse kimlik de kendiliğinden onu takip ediyor.

/**
 * Kuruluş düğümünün kararlı `@id` değeri.
 *
 * Fragment (`#organization`) bilinçli: gerçek bir sayfa adresi DEĞİL,
 * yalnız grafikteki düğümü adlandıran bir tanıtıcı. Böylece 404 veren bir
 * adres bildirilmiş olmuyor.
 */
export const kurulusKimligi = (siteKoku: unknown): string | undefined => {
  const kok = typeof siteKoku === 'string' ? siteKoku.trim().replace(/\/+$/, '') : ''
  return kok ? `${kok}/#organization` : undefined
}
