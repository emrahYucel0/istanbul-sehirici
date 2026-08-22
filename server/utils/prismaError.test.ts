import { Prisma } from '../../prisma/generated/client/client.ts'
import { describe, expect, it, vi } from 'vitest'
import { getErrorMessage, getSafeErrorMessage, isRecordNotFoundError, isUniqueConstraintError } from './prismaError'

function makePrismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('test error', { code, clientVersion: '6.4.1' })
}

describe('isUniqueConstraintError', () => {
  it('P2002 kodunda true döner', () => {
    expect(isUniqueConstraintError(makePrismaError('P2002'))).toBe(true)
  })

  it('başka bir Prisma kodunda false döner', () => {
    expect(isUniqueConstraintError(makePrismaError('P2025'))).toBe(false)
  })

  it('Prisma hatası olmayan bir değerde false döner', () => {
    expect(isUniqueConstraintError(new Error('sıradan hata'))).toBe(false)
    expect(isUniqueConstraintError('string')).toBe(false)
    expect(isUniqueConstraintError(null)).toBe(false)
  })
})

describe('isRecordNotFoundError', () => {
  it('P2025 kodunda true döner', () => {
    expect(isRecordNotFoundError(makePrismaError('P2025'))).toBe(true)
  })

  it('başka bir Prisma kodunda false döner', () => {
    expect(isRecordNotFoundError(makePrismaError('P2002'))).toBe(false)
  })
})

describe('getSafeErrorMessage', () => {
  it('production dışında ham hata mesajını döner', () => {
    vi.stubEnv('NODE_ENV', 'development')
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(getSafeErrorMessage(new Error('tablo X bulunamadı'))).toBe('tablo X bulunamadı')
    spy.mockRestore()
  })

  it('production ortamında jenerik mesaj döner, ham detay sızdırılmaz', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const message = getSafeErrorMessage(new Error('SELECT * FROM users WHERE password=...'))
    expect(message).toBe('Beklenmeyen bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.')
    expect(message).not.toContain('SELECT')
    spy.mockRestore()
    vi.unstubAllEnvs()
  })

  it('hatayı sunucu loguna yazar (client mesajı jenerik olsa bile detay kaybolmaz)', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const err = new Error('detaylı hata')
    getSafeErrorMessage(err)
    // Kayıt artık ham nesne değil, YAPILANDIRILMIŞ TEK SATIR (zaman damgası +
    // kod + mesaj + yığının ilk iki satırı). Testin derdi biçim değil niyet:
    // client'a jenerik mesaj gitse bile detay sunucu logunda duruyor mu.
    const satir = spy.mock.calls.at(0)?.at(0) as string
    expect(satir).toContain('detaylı hata')
    expect(satir).toMatch(/^\[hata\] \d{4}-\d{2}-\d{2}T/)
    spy.mockRestore()
    vi.unstubAllEnvs()
  })
})

describe('getErrorMessage', () => {
  it('Error örneğinden message döner', () => {
    expect(getErrorMessage(new Error('mesaj'))).toBe('mesaj')
  })

  it('Error olmayan değeri stringe çevirir', () => {
    expect(getErrorMessage('ham metin')).toBe('ham metin')
    expect(getErrorMessage(42)).toBe('42')
  })
})
