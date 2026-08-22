// server/mail/config.ts
//
// SMTP YAPILANDIRMASI — ÇALIŞMA ZAMANINDA OKUNUR.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN BURADA, NEDEN `nuxt.config.ts`'te DEĞİL
//
// Yapılandırma eskiden `nuxt.config.ts` → `runtimeConfig.mail` içindeydi:
//
//     pass: process.env.MAIL_PASSWORD || ""
//
// `nuxt.config.ts` DERLEME ANINDA çalışıyor. Bu satır, derlemeyi yapan
// makinedeki `.env` dosyasının gerçek SMTP parolasını okuyup çıktının içine
// LİTERAL olarak yazıyordu (ölçüldü: `.output/server/chunks/_/nitro.mjs`).
// İki somut sonucu vardı:
//
//   1. Derleme çıktısını paylaşan parolayı da paylaşıyordu.
//   2. Çalışma zamanında `MAIL_PASSWORD` değiştirmek hiçbir şeyi
//      değiştirmiyordu — değer artık ortamdan değil gömülü metinden
//      geliyordu. Bir QA turunda `MAIL_PASSWORD=""` ile başlatılan sunucu
//      yine de gerçek bir e-posta gönderdi.
//
// Bu dosya yalnız sunucu tarafında ve YALNIZ ÇAĞRILDIĞI AN `process.env`'i
// okuyor. Derleme çıktısında değil, sunucu sürecinin ortamında yaşıyor.
//
// ─────────────────────────────────────────────────────────────────────────
// DEĞİŞKEN ADLARI DEĞİŞMEDİ
//
// `.env`, `scripts/yayina-hazir-mi.mjs` ve panelin yardım metni zaten
// `MAIL_*` adlarını kullanıyor; hepsi korundu. `NUXT_MAIL_SMTP_*` adları
// ARTIK ÇALIŞMIYOR (o adlar Nuxt'un runtimeConfig ezme mekanizmasına aitti,
// mekanizma da kalktı). Dağıtım notu buna göre güncellendi —
// bkz. deploy/YAYIN-ADIMLARI.md.

export interface MailAyari {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
  to: string
}

export type MailAyarSonucu =
  | { tamam: true; ayar: MailAyari }
  | { tamam: false; eksik: string[] }

const metin = (deger: string | undefined): string => String(deger ?? '').trim()

/**
 * `MAIL_PORT` bir ortam değişkeni, yani her zaman metin. Geçersiz bir değer
 * sessizce `NaN` olup nodemailer'a geçseydi bağlantı anlaşılmaz bir hatayla
 * düşerdi; burada eksik sayılıyor ve sebebi adıyla raporlanıyor.
 */
const portuCoz = (ham: string): number | null => {
  if (!ham) return null
  const sayi = Number.parseInt(ham, 10)
  if (!Number.isInteger(sayi) || sayi < 1 || sayi > 65535) return null
  return sayi
}

/**
 * `MAIL_SECURE` YAPILANDIRILDIĞI GİBİ okunuyor; porttan çıkarım YAPILMIYOR.
 * "465 ise secure'dur" varsayımı yaygın ama yanlış olabilir (bazı sunucular
 * 587'de örtük TLS sunuyor). Eski kural tam eşleşmeydi (`=== "true"`);
 * buradaki tek genişletme boşluk kırpma ve büyük/küçük harf duyarsızlığı —
 * `MAIL_SECURE=TRUE` yazan biri sessizce şifresiz bağlantı almasın diye.
 */
const guvenliMi = (ham: string): boolean => ham.trim().toLowerCase() === 'true'

/**
 * SMTP ayarını ortamdan okur. HİÇBİR ZAMAN FIRLATMAZ — eksik yapılandırma
 * uygulamayı düşürmemeli; talep zaten veri tabanına yazılmış oluyor.
 */
export function mailAyariniOku(ortam: NodeJS.ProcessEnv = process.env): MailAyarSonucu {
  const host = metin(ortam.MAIL_HOST)
  const port = portuCoz(metin(ortam.MAIL_PORT))
  const user = metin(ortam.MAIL_USER)
  const pass = metin(ortam.MAIL_PASSWORD)
  // Gönderici bir E-POSTA ADRESİ olmalı. `MAIL_FROM` tanımsızsa kimlik
  // doğrulanan hesaba düşülüyor — çoğu SMTP sunucusu zaten göndericinin o
  // hesapla aynı olmasını istiyor.
  const from = metin(ortam.MAIL_FROM) || user
  const to = metin(ortam.MAIL_TO)

  const eksik: string[] = []
  if (!host) eksik.push('MAIL_HOST')
  if (port === null) eksik.push('MAIL_PORT')
  if (!user) eksik.push('MAIL_USER')
  if (!pass) eksik.push('MAIL_PASSWORD')
  if (!from) eksik.push('MAIL_FROM')
  if (!to) eksik.push('MAIL_TO')

  if (eksik.length) return { tamam: false, eksik }

  return {
    tamam: true,
    ayar: { host, port: port as number, secure: guvenliMi(metin(ortam.MAIL_SECURE)), user, pass, from, to },
  }
}
