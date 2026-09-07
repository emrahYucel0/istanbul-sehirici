// app/utils/marka-vurgusu.ts
//
// MARKA ADINDAKİ "KENT" KELİMESİNİ AYRI PARÇA OLARAK VERİR.
//
// ─────────────────────────────────────────────────────────────────────────
// NE İŞE YARIYOR
//
// Footer'daki dev marka yazısında "Ege Kent Nakliyat"ın ORTA kelimesi
// bakır renkte. Renk bir <span> gerektiriyor, <span> de metnin kelimelere
// bölünmesini. Bu dosya o bölmeyi yapıyor; boyama işini bileşen üstleniyor.
//
// ─────────────────────────────────────────────────────────────────────────
// MARKA ADI HÂLÂ VERİTABANINDAN GELİYOR — burada ad SABİTLENMİYOR
//
// Bu ayrım önemli, çünkü tam tersi bir hata daha önce yaşandı:
// `useSiteSettings.ts` içinde `'EveNakliyatEvden'` sabiti duruyordu ve
// panelden ad değiştirilse bile eski ad geri geliyordu.
//
// Burada yapılan o değil. Ad yine `useSiteSettings().brandName`'den, yani
// panelden geliyor. Bu dosya yalnızca ŞUNU söylüyor: "gelen adın içinde
// `Kent` kelimesi varsa, vurgu onun." Panelden ad tamamen değiştirilirse
// eşleşme olmaz ve yazı bütünüyle mürekkep renginde çıkar — kırılma yok,
// eski ad geri gelmez.
//
// NEDEN "KENT"
// Site "İstanbul ŞEHİR İÇİ nakliyat" üzerine kurulu ve `kesit-cizimleri.mjs`
// ile başlayan çizim dilinde bakır, "ölçülen asıl şeyi" işaretliyor. Marka
// adında o şey kent. Yani vurgu dekorasyon değil, sitenin kendi kuralının
// marka adına uygulanması.
//
// ─────────────────────────────────────────────────────────────────────────
// TÜRKÇE BÜYÜK/KÜÇÜK TUZAĞI
//
// Karşılaştırma `toLocaleUpperCase('tr')` ile yapılıyor, JavaScript'in
// `/i` bayrağıyla DEĞİL. Sebebi bu projede ölçüldü: `/i` Türkçenin
// noktalı İ'sini (U+0130) `i` ile eşleştirmiyor, dolayısıyla `/i` tabanlı
// bir arama Türkçe metinlerde sessizce 0 sonuç döndürebiliyor.
// "Kent" kelimesinde İ/I geçmiyor ama kural dosyanın tamamı için geçerli
// olsun diye baştan doğru kuruldu.

/** Vurgulanacak kelime — büyük harfe çevrilmiş biçimde karşılaştırılıyor. */
const VURGULU_KELIME = 'KENT'

export interface MarkaParcasi {
  /**
   * Kelimenin kendisi. SON PARÇA DIŞINDA sonuna bir boşluk eklenir.
   *
   * Boşluk neden metnin içinde: parçalar şablonda `v-for` ile ayrı
   * <span>'lere basılıyor ve Vue, aralarında yalnızca satır sonu bulunan
   * boşluk düğümlerini derleme sırasında siliyor (whitespace: 'condense').
   * Yani <span>EGE</span> ile <span>KENT</span> arasına şablonda konan
   * boşluğa güvenilemez — kelimeler bitişik çıkardı. Boşluk metnin
   * parçası olunca hem görünüyor hem de satır kırılması normal çalışıyor.
   */
  metin: string
  /** Bakır renge boyanacak mı. */
  vurgulu: boolean
}

/**
 * Marka adını kelimelere böler ve "Kent" olan(lar)ı işaretler.
 *
 * Parçaların `metin` alanları birleştirildiğinde, boşlukları sadeleştirilmiş
 * marka adı birebir geri gelir — yani bu işlev metni değiştirmez, yalnız
 * parçalara ayırır. (Test bu değişmezi doğruluyor.)
 *
 * Ad boş / dizge değilse boş dizi döner; çağıran taraf o zaman hiçbir şey
 * basmaz.
 */
export function markaParcalari(ad: unknown): MarkaParcasi[] {
  if (typeof ad !== 'string') return []

  const kelimeler = ad.trim().split(/\s+/).filter(Boolean)
  if (kelimeler.length === 0) return []

  return kelimeler.map((kelime, i) => ({
    metin: i < kelimeler.length - 1 ? `${kelime} ` : kelime,
    vurgulu: kelime.toLocaleUpperCase('tr') === VURGULU_KELIME,
  }))
}
