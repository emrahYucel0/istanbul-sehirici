import { describe, it, expect, vi } from 'vitest'
import { talepBildirimiGonder, hatayiTemizle } from './service'

/**
 * GERÇEK SMTP'YE BAĞLANILMIYOR.
 *
 * `talepBildirimiGonder` gönderici üreticisini parametre olarak alıyor;
 * testler kendi sahtesini geçiriyor, dolayısıyla `nodemailer.createTransport`
 * hiç çağrılmıyor ve hiçbir soket açılmıyor. Üretim kodunda "test modu" diye
 * bir bayrak YOK — güvenlik enjeksiyondan geliyor.
 *
 * Ortam da parametre: gerçek `.env` değerleri teste sızmıyor.
 */
const TAM = {
  MAIL_HOST: 'smtp.ornek.test',
  MAIL_PORT: '587',
  MAIL_SECURE: 'false',
  MAIL_USER: 'kullanici@ornek.test',
  MAIL_PASSWORD: 'sahte-parola',
  MAIL_FROM: 'gonderen@ornek.test',
  MAIL_TO: 'alici@ornek.test',
} as NodeJS.ProcessEnv

const TALEP = {
  name: 'Deneme Kullanıcı',
  email: 'deneme@ornek.test',
  phone: '0500 000 00 00',
  message: 'Kadıköy Moda, 3. kat, asansörsüz.',
  sourcePage: '/iletisim',
}

describe('talepBildirimiGonder', () => {
  // A — yapılandırma tam, sahte gönderici başarılı
  it('yapılandırma tamken gönderir ve doğru zarfı kurar', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'x' })
    const uretici = vi.fn(() => ({ sendMail }))

    const sonuc = await talepBildirimiGonder(TALEP, 'Marka Adı', uretici, TAM)

    expect(sonuc).toEqual({ ok: true })
    expect(uretici).toHaveBeenCalledTimes(1)
    expect(uretici).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'smtp.ornek.test', port: 587, secure: false })
    )

    const zarf = sendMail.mock.calls[0][0]
    expect(zarf.from).toBe('gonderen@ornek.test')
    expect(zarf.to).toBe('alici@ornek.test')
    // Yanıtlama adresi talebi bırakan kişi olmalı, gönderen hesap değil.
    expect(zarf.replyTo).toBe('deneme@ornek.test')
    expect(zarf.subject).toBe('Marka Adı — Yeni teklif talebi')
    expect(zarf.text).toContain('Deneme Kullanıcı')
    expect(zarf.text).toContain('/iletisim')
    expect(zarf.text).toContain('Kadıköy Moda')
  })

  // B — sahte gönderici hata veriyor
  it('gönderim hatasında FIRLATMAZ, hatayı döner', async () => {
    const uretici = () => ({
      sendMail: vi.fn().mockRejectedValue(Object.assign(new Error('Invalid login'), { code: 'EAUTH' })),
    })

    const sonuc = await talepBildirimiGonder(TALEP, 'Marka Adı', uretici, TAM)

    expect(sonuc.ok).toBe(false)
    expect(sonuc.hata).toContain('EAUTH')
  })

  // C — MAIL_PASSWORD eksik
  it('MAIL_PASSWORD eksikse SMTP’ye HİÇ bağlanmaz', async () => {
    const uretici = vi.fn(() => ({ sendMail: vi.fn() }))

    const sonuc = await talepBildirimiGonder(TALEP, 'Marka Adı', uretici, {
      ...TAM,
      MAIL_PASSWORD: '',
    })

    expect(sonuc.ok).toBe(false)
    expect(sonuc.hata).toBe('SMTP yapılandırması eksik: MAIL_PASSWORD')
    // Asıl güvence bu satır: taşıyıcı hiç kurulmadı, yani soket de açılmadı.
    expect(uretici).not.toHaveBeenCalled()
  })

  it('yapılandırma tamamen boşken de çökmez', async () => {
    const uretici = vi.fn(() => ({ sendMail: vi.fn() }))
    const sonuc = await talepBildirimiGonder(TALEP, 'Marka Adı', uretici, {} as NodeJS.ProcessEnv)

    expect(sonuc.ok).toBe(false)
    expect(sonuc.hata).toContain('MAIL_HOST')
    expect(uretici).not.toHaveBeenCalled()
  })

  it('e-posta yoksa replyTo göndermez', async () => {
    const sendMail = vi.fn().mockResolvedValue({})
    const sonuc = await talepBildirimiGonder(
      { ...TALEP, email: null },
      'Marka Adı',
      () => ({ sendMail }),
      TAM
    )
    expect(sonuc.ok).toBe(true)
    expect(sendMail.mock.calls[0][0].replyTo).toBeUndefined()
  })
})

describe('hatayiTemizle', () => {
  // Bu metin `ContactLead.mailError` sütununa yazılıp PANELDE gösteriliyor.
  // Nodemailer hataları sunucu yanıtını taşıyabiliyor; kimlik bilgisi
  // oraya sızmamalı.
  it('parolayı ve kullanıcı adını maskeler', () => {
    const hata = new Error('535 auth failed for kullanici@ornek.test with sahte-parola')
    const temiz = hatayiTemizle(hata, { user: 'kullanici@ornek.test', pass: 'sahte-parola' })

    expect(temiz).not.toContain('sahte-parola')
    expect(temiz).not.toContain('kullanici@ornek.test')
    expect(temiz).toContain('***')
  })

  it('kod ve mesajı birleştirir', () => {
    const temiz = hatayiTemizle(Object.assign(new Error('Connection timeout'), { code: 'ETIMEDOUT' }))
    expect(temiz).toBe('ETIMEDOUT — Connection timeout')
  })

  it('uzunluğu sınırlar', () => {
    const temiz = hatayiTemizle(new Error('x'.repeat(2000)))
    expect(temiz.length).toBeLessThanOrEqual(500)
  })

  it('gönderim yolunda maskeleme gerçekten uygulanıyor', async () => {
    const uretici = () => ({
      sendMail: vi.fn().mockRejectedValue(new Error('rejected: sahte-parola')),
    })
    const sonuc = await talepBildirimiGonder(TALEP, 'Marka', uretici, TAM)
    expect(sonuc.hata).not.toContain('sahte-parola')
  })
})
