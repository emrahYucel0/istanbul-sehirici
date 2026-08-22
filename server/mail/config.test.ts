import { describe, it, expect } from 'vitest'
import { mailAyariniOku } from './config'

// Bu testler `process.env`'e HİÇ dokunmuyor: `mailAyariniOku` ortamı parametre
// olarak alıyor. Böylece testler birbirinin ortamını kirletmiyor ve gerçek
// `.env` değerleri teste sızmıyor.
const TAM = {
  MAIL_HOST: 'smtp.ornek.test',
  MAIL_PORT: '587',
  MAIL_SECURE: 'false',
  MAIL_USER: 'kullanici@ornek.test',
  MAIL_PASSWORD: 'sahte-parola',
  MAIL_FROM: 'gonderen@ornek.test',
  MAIL_TO: 'alici@ornek.test',
} as NodeJS.ProcessEnv

describe('mailAyariniOku', () => {
  it('eksiksiz ortamı okur', () => {
    const sonuc = mailAyariniOku(TAM)
    expect(sonuc.tamam).toBe(true)
    if (!sonuc.tamam) return
    expect(sonuc.ayar).toEqual({
      host: 'smtp.ornek.test',
      port: 587,
      secure: false,
      user: 'kullanici@ornek.test',
      pass: 'sahte-parola',
      from: 'gonderen@ornek.test',
      to: 'alici@ornek.test',
    })
  })

  it('eksik alanları FIRLATMADAN adlarıyla bildirir', () => {
    const sonuc = mailAyariniOku({ ...TAM, MAIL_PASSWORD: '', MAIL_HOST: '' })
    expect(sonuc.tamam).toBe(false)
    if (sonuc.tamam) return
    expect(sonuc.eksik).toContain('MAIL_PASSWORD')
    expect(sonuc.eksik).toContain('MAIL_HOST')
  })

  it('MAIL_FROM boşsa kimlik doğrulanan hesaba düşer', () => {
    const sonuc = mailAyariniOku({ ...TAM, MAIL_FROM: '' })
    expect(sonuc.tamam).toBe(true)
    if (!sonuc.tamam) return
    expect(sonuc.ayar.from).toBe('kullanici@ornek.test')
  })

  // Port bir ortam değişkeni, yani metin. Geçersiz değer sessizce NaN olup
  // nodemailer'a geçseydi bağlantı anlaşılmaz bir hatayla düşerdi.
  it.each(['', 'abc', '0', '70000', '-1'])('geçersiz portu (%s) eksik sayar', (port) => {
    const sonuc = mailAyariniOku({ ...TAM, MAIL_PORT: port })
    expect(sonuc.tamam).toBe(false)
    if (sonuc.tamam) return
    expect(sonuc.eksik).toContain('MAIL_PORT')
  })

  it('portu sayıya çevirir', () => {
    const sonuc = mailAyariniOku({ ...TAM, MAIL_PORT: '465' })
    expect(sonuc.tamam).toBe(true)
    if (!sonuc.tamam) return
    expect(sonuc.ayar.port).toBe(465)
  })

  // Porttan ÇIKARIM YAPILMIYOR: 465 tek başına `secure` demek değil,
  // yapılandırılan değer neyse o okunuyor.
  it('secure değerini porttan türetmez', () => {
    const sonuc = mailAyariniOku({ ...TAM, MAIL_PORT: '465', MAIL_SECURE: 'false' })
    expect(sonuc.tamam).toBe(true)
    if (!sonuc.tamam) return
    expect(sonuc.ayar.secure).toBe(false)
  })

  it.each([
    ['true', true],
    ['TRUE', true],
    [' true ', true],
    ['false', false],
    ['1', false],
    ['', false],
  ])('MAIL_SECURE=%j → %s', (ham, beklenen) => {
    const sonuc = mailAyariniOku({ ...TAM, MAIL_SECURE: ham })
    expect(sonuc.tamam).toBe(true)
    if (!sonuc.tamam) return
    expect(sonuc.ayar.secure).toBe(beklenen)
  })

  it('değerlerin baştaki/sondaki boşluğunu kırpar', () => {
    const sonuc = mailAyariniOku({ ...TAM, MAIL_HOST: '  smtp.ornek.test  ' })
    expect(sonuc.tamam).toBe(true)
    if (!sonuc.tamam) return
    expect(sonuc.ayar.host).toBe('smtp.ornek.test')
  })
})
