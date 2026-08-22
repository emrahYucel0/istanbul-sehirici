/**
 * Panelden gelen düz başlık metnine küçük işaretleme ekler.
 *
 * NEDEN AYRI BİR YARDIMCI VAR
 * Üç bölüm (Choose, Help, Testimonial) başlığa minik HTML katıyordu:
 * satır sonunu `<br>` yapmak, `**kalın**` kısmı renkli `<span>` yapmak.
 * Sonuç `v-html` ile basıldığı için de tam bir HTML temizleyicisinden
 * geçiriliyordu — ve o temizleyici (`sanitize-html` + `htmlparser2`) her
 * ziyaretçinin tarayıcısına 234 KB olarak iniyordu.
 *
 * Oysa burada ayrıştırılacak bir HTML yok: elimizde YÖNETİCİNİN YAZDIĞI
 * DÜZ METİN var ve ona BİZİM eklediğimiz iki etiket. Doğru çözüm metni
 * ayrıştırıp tehlikeliyi ayıklamak değil, metni tamamen KAÇIRIP (escape)
 * sonra yalnızca kendi etiketimizi koymak.
 *
 * Bu hem daha ucuz (kütüphane yok) hem daha güvenli: izin listesi kavramı
 * yok, çünkü metnin içinden HİÇBİR etiket geçmiyor. Yönetici başlığa
 * `<script>` yazsa ekranda o metin görünür, çalışmaz.
 *
 * Zengin metin içeriği (blog/bölge gövdesi) bu yoldan GEÇMEZ — orada
 * gerçekten HTML var ve sunucuda temizleniyor
 * (bkz. server/utils/sanitizeHtml.ts).
 */

/** HTML'de anlam taşıyan beş karakteri zararsız hâle getirir. */
const kacir = (metin: string): string =>
  metin
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

/**
 * Satır sonlarını dar ekranda kırılma noktasına çevirir.
 * Satır sonu yoksa boş döner — çağıran taraf o zaman düz metni basıyor.
 */
export function satirSonlariniAyir(baslik: unknown): string {
  if (typeof baslik !== 'string' || !baslik.includes('\n')) return ''
  return kacir(baslik).replaceAll('\n', '<br class="block lg:hidden" />')
}

/**
 * `**kalın**` ya da `<span>…</span>` ile işaretlenmiş kısmı marka rengine
 * boyar. İkisi de destekleniyor çünkü panelde her iki yazım da kullanılmış.
 *
 * `<span>` yazımında bile metin ÖNCE kaçırılıyor; işaretleme kaçırılmış
 * metin üzerinde aranıyor. Yani yöneticinin yazdığı `<span>` gerçek bir
 * etiket olarak DEĞİL, yalnızca "burayı vurgula" işareti olarak okunuyor.
 */
export function vurguyuBoya(baslik: unknown): string {
  if (typeof baslik !== 'string' || !baslik) return ''
  const guvenli = kacir(baslik)

  const spanli = /&lt;span[^&]*&gt;(.*?)&lt;\/span&gt;/gi
  if (spanli.test(guvenli)) {
    return guvenli.replace(spanli, '<span class="text-brand-600">$1</span>')
  }
  if (guvenli.includes('**')) {
    return guvenli.replace(/\*\*(.*?)\*\*/g, '<span class="text-brand-600">$1</span>')
  }
  return ''
}
