// server/mail/service.ts
//
// TALEP BİLDİRİMİ GÖNDERİMİ.
//
// Tek SMTP sağlayıcısı var; sağlayıcı arayüzü + adaptör + fabrika KURULMADI.
// Buradaki tek soyutlama, testin gerçek SMTP'ye bağlanmaması için gereken
// enjeksiyon noktası.
//
// ─────────────────────────────────────────────────────────────────────────
// SÖZLEŞME: FIRLATMAZ
//
// Talep ÖNCE veri tabanına yazılıyor, mail SONRA deneniyor. Bu fonksiyonun
// fırlatması, kaydedilmiş bir müşteri talebinin isteği düşürmesi demek
// olurdu. Her yol `{ ok, hata }` döner.
//
// ─────────────────────────────────────────────────────────────────────────
// GÜNLÜKTE KİMLİK BİLGİSİ YOK
//
// Eskiden hata `String(error?.message || error)` ile alınıp doğrudan
// kaydediliyordu. Nodemailer hataları `response`, `command` ve bazı
// sürümlerde kimlik doğrulama ayrıntısı taşıyabiliyor; bu metin de
// `ContactLead.mailError` sütununa yazılıp PANELDE gösteriliyor.
// Aşağıdaki `hatayiTemizle`, ayıklanan metinden yapılandırmadaki parolayı
// ve kullanıcı adını çıkarıyor. Taşıyıcı yapılandırması hiçbir yere
// basılmıyor.
import nodemailer from 'nodemailer'
import { mailAyariniOku, type MailAyari } from './config'

export interface TalepVerisi {
  name: string
  email?: string | null
  phone?: string | null
  message?: string | null
  sourcePage?: string | null
}

export interface MailSonucu {
  ok: boolean
  hata?: string
}

/** Test/enjeksiyon noktası: gerçek nodemailer yerine sahte gönderici verilebilir. */
export interface Gonderici {
  sendMail(secenekler: Record<string, unknown>): Promise<unknown>
}

export type GondericiUretici = (ayar: MailAyari) => Gonderici

const varsayilanUretici: GondericiUretici = (ayar) =>
  nodemailer.createTransport({
    host: ayar.host,
    port: ayar.port,
    secure: ayar.secure,
    auth: { user: ayar.user, pass: ayar.pass },
  })

/** Hata metninden kimlik bilgilerini çıkarır ve uzunluğu sınırlar. */
export function hatayiTemizle(hata: unknown, ayar?: Pick<MailAyari, 'user' | 'pass'>): string {
  const e = hata as { message?: string; code?: string; responseCode?: number } | undefined
  const parcalar = [e?.code, e?.responseCode, e?.message].filter(Boolean)
  let metin = parcalar.length ? parcalar.join(' — ') : String(hata)

  // Parola metinde geçiyorsa tamamen çıkarılıyor. Kullanıcı adı da
  // maskeleniyor: panelde SMTP hesabının tamamı görünmesin.
  if (ayar?.pass) metin = metin.split(ayar.pass).join('***')
  if (ayar?.user) metin = metin.split(ayar.user).join('***')

  return metin.slice(0, 500)
}

/**
 * Talep bildirimini gönderir.
 *
 * @param uretici  Verilmezse gerçek nodemailer kullanılır. Testler kendi
 *                 sahte üreticisini geçirir; böylece "test modu" diye bir
 *                 üretim bayrağına gerek kalmıyor.
 * @param ortam    Verilmezse `process.env`. Testler kendi ortamını geçirir.
 */
export async function talepBildirimiGonder(
  veri: TalepVerisi,
  markaAdi: string,
  uretici: GondericiUretici = varsayilanUretici,
  ortam: NodeJS.ProcessEnv = process.env
): Promise<MailSonucu> {
  const sonuc = mailAyariniOku(ortam)

  if (!sonuc.tamam) {
    // Yapılandırma eksikse SMTP'ye HİÇ bağlanılmıyor. Talep kaydı zaten
    // atıldı; panelde neyin eksik olduğu adıyla görünüyor.
    return { ok: false, hata: `SMTP yapılandırması eksik: ${sonuc.eksik.join(', ')}` }
  }

  const ayar = sonuc.ayar

  try {
    const gonderici = uretici(ayar)
    await gonderici.sendMail({
      from: ayar.from,
      to: ayar.to,
      replyTo: veri.email || undefined,
      subject: `${markaAdi} — Yeni teklif talebi`,
      text: [
        `İsim   : ${veri.name}`,
        `E-posta: ${veri.email || '-'}`,
        `Telefon: ${veri.phone || '-'}`,
        `Sayfa  : ${veri.sourcePage || '-'}`,
        '',
        'Mesaj:',
        veri.message || '-',
      ].join('\n'),
    })
    return { ok: true }
  } catch (error) {
    return { ok: false, hata: hatayiTemizle(error, ayar) }
  }
}
