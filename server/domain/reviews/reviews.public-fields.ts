/**
 * Yorumların herkese açık uçlarda döndürülecek alanları.
 *
 * NEDEN AYRI DOSYA
 * Bu liste bir SÖZLEŞME, veri erişimi değil. Repository'nin içindeyken onu
 * kullanmak isteyen her yer prisma istemcisini de yüklemek zorunda kalıyordu
 * — testler dahil, ki testin veritabanına ihtiyacı yok. Ayrılınca hem
 * yan etkisiz import edilebiliyor hem de "tek kaynak" olduğu görünür oluyor.
 *
 * `email` BİLEREK dışarıda: ziyaretçi doğrulama için bırakabiliyor, ama
 * yayınlanan yorumda görünmesi kişisel veri sızıntısı olurdu.
 *
 * `isApproved` ve `source` da dışarıda: moderasyon durumu ziyaretçiyi
 * ilgilendirmiyor ve hangi yorumun beklemede olduğunu dışarı sızdırırdı.
 *
 * Beyaz liste (izin verilenler) olarak yazılıyor, kara liste olarak değil:
 * modele yeni bir alan eklendiğinde varsayılan davranış "dışarı çıkmasın"
 * olsun diye. Kara liste olsaydı her yeni sütun sessizce herkese açılırdı.
 */
export const HERKESE_ACIK_ALANLAR = {
  id: true,
  customerName: true,
  customerImage: true,
  rating: true,
  comment: true,
  date: true,
  location: true,
  serviceType: true,
  serviceTypeIcon: true,
  isFeatured: true,
  order: true,
} as const

/**
 * PUBLIC'E UYGUNLUK — TEK KOŞUL.
 *
 * Aynı kural bugüne kadar ÜÇ yerde ayrı ayrı yazılıydı: `findPublic`,
 * `publicStats` ve `testimonials-section` yapılandırmasının `getInclude`
 * bloğu. Üçü tesadüfen aynıydı; birinde bir alan değişse diğerleri sessizce
 * ayrışırdı — ve ayrışma yönü her zaman tehlikeli olan yön: onaysız bir
 * yorumun bir uçtan görünmesi.
 *
 * Yönetim paneli de aynı koşulu kullanıyor (bkz. ReviewsPanel), çünkü
 * panelin "yayında" dediği şeyle sitenin gösterdiği şey aynı olmak zorunda.
 * Panel eskiden yalnız `isApproved`e bakıyordu ve `isActive: false` olan üç
 * kaydı "yayında" diye kırmızı alarma sokuyordu — hiçbiri yayında değildi.
 *
 * İKİ ALAN, İKİ AYRI ANLAM:
 *   isApproved  moderasyon kararı — yönetici bu yorumu onayladı mı
 *   isActive    yayın durumu      — kayıt sitede gösterilmeye açık mı
 */
export const HERKESE_ACIK_KOSUL = { isActive: true, isApproved: true } as const

/** Tek kayıt için aynı kuralın bellek içi karşılığı (panel ve testler). */
export const herkeseAcikMi = (kayit: { isActive?: boolean; isApproved?: boolean }): boolean =>
  kayit.isActive === true && kayit.isApproved === true

/**
 * ANA SAYFADA GÖSTERİLEN YORUM SAYISI.
 *
 * Defter biçimindeki bölüm altı satırdan sonra sayfanın kapanışını
 * ezmeye başlıyor. Sayı KODDA ve tek yerde: panelden değiştirilemiyor,
 * `slice` ile bileşenin içine gizlenmiyor. Toplam yorum sayısı bundan
 * BAĞIMSIZ hesaplanıyor — gösterilen liste ile sayaç iki ayrı anlam.
 */
export const ANASAYFA_YORUM_SAYISI = 6
