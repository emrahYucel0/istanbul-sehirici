import { Prisma } from '../../prisma/generated/client/client.ts'

// P2002: unique constraint ihlali (örn. sectionName zaten var)
export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

// P2025: update/delete hedeflenen kayıt bulunamadı
export function isRecordNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

// Beklenmeyen hatalarda (Prisma hata kodu eşleşmeyen durumlar) client'a ham
// hata mesajı (tablo/sütun adları, sorgu detayları) sızdırılmasın diye:
// sunucu loguna tam detay yazılır, client'a sadece jenerik bir mesaj döner.
// Geliştirme ortamında (NODE_ENV production değilken) hata ayıklamayı
// kolaylaştırmak için ham mesaj döndürülmeye devam eder.
export function getSafeErrorMessage(error: unknown): string {
  // YAPILANDIRILMIŞ TEK SATIR — eskiden `console.error(error)` idi.
  //
  // Ham nesneyi dökmek üç şeyi eksik bırakıyordu: zaman damgası yok
  // (hatanın ne zaman olduğu bilinmiyor), tek hata onlarca satır kaplıyor
  // ve `grep` ile aranamıyordu. cPanel'in uygulama günlüğünde bu, gerçek
  // hatayı gürültü içinde görünmez kılıyordu.
  //
  // Bu yol ÖNEMLİ: servis katmanı hataları burada yakalanıp `fail()`
  // yanıtına dönüşüyor, yani Nitro'nun hata kancasına HİÇ ulaşmıyorlar
  // (bkz. server/plugins/hata-kaydi.ts). Üretimdeki veritabanı sorunları
  // pratikte yalnızca buradan görünür.
  const e = error as { code?: string; message?: string; stack?: string }
  const yigin = String(e?.stack ?? '').split('\n').slice(1, 3).join(' | ')
  console.error(
    `[hata] ${new Date().toISOString()} servis :: ${e?.code ?? '-'} :: ` +
      `${e?.message ?? String(error)} :: ${yigin}`
  )
  if (process.env.NODE_ENV !== 'production') {
    return getErrorMessage(error)
  }
  return 'Beklenmeyen bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.'
}
