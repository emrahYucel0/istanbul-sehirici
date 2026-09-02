// app/utils/kapanis.ts
//
// ORTAK KAPANIŞ — sayfa ailesine göre TEK cümle.
//
// Ana sayfanın kapanış başlığı ve düğme etiketi PANELDEN geliyor
// (HomeSection 'kapanis'). Buradaki metinler ana sayfa için değil; aynı
// bloğun ana sayfa DIŞINDAKİ ailelerde kullandığı sabitler.
//
// NEDEN CMS DEĞİL
// Üç cümle için üç yeni yönetilebilir alan açmak, panelde bakılacak bir
// yüzey daha üretirdi ve o alanlar boş bırakıldığında sayfa sonunda boş
// bir koyu bant kalırdı. Blok yapısal; metni de yapısal.
//
// AÇIKÇA SÖYLENİYOR: `ana` cümlesi bugün panelde duran ana sayfa
// başlığıyla AYNI. Panelden ana sayfa başlığı değiştirilirse bölge ve
// hizmet aileleri bu cümleyle kalır — ikisi ayrışabilir. Bilinçli takas.

export const KAPANIS_METNI = {
  /** Bölge ailesi · hizmet detayı · hakkımızda — asıl cümle. */
  ana: 'Adresi biliyorsanız, geri kalanını birlikte çıkarabiliriz.',
  /** Blog: okur bilgi almaya geldi, satın almaya değil; cümle de öyle. */
  yazi: 'Taşınma planınız varsa, koşulları birlikte netleştirebiliriz.',
  /** Fiyat aracı: hesabın dışında kalan koşullar sayfanın kendi konusu. */
  fiyat: 'Koşullar hesabın dışında kalıyorsa, birlikte netleştirebiliriz.',
} as const

/** Panelde `ctaLabel` boşsa basılan etiket. */
export const KAPANIS_EYLEMI = 'Taşınmayı konuşalım'

/**
 * `tel:` adresi — E.164.
 *
 * Panelde numara yerel biçimde tutuluyor ("0535 529 81 92") ve şimdiye
 * kadar yalnız rakam dışı karakterler atılıyordu: `tel:05355298192`.
 * Türkiye'de çalışıyor ama yurt dışı SIM'inde ve bazı masaüstü
 * uygulamalarında çevrilemiyor. Baştaki 0 ülke koduna çevriliyor; zaten
 * `+` ile ya da `90` ile başlayan numaralar olduğu gibi geçiyor.
 */
export function telefonYolu(numara: string): string {
  const ham = String(numara || '').replace(/[^\d+]/g, '')
  if (!ham) return ''
  if (ham.startsWith('+')) return `tel:${ham}`
  if (ham.startsWith('0')) return `tel:+90${ham.slice(1)}`
  if (ham.startsWith('90')) return `tel:+${ham}`
  return `tel:+90${ham}`
}
