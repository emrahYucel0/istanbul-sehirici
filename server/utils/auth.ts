import type { H3Event } from 'h3'
import { createHmac, timingSafeEqual } from 'node:crypto'

interface AuthCookiePayload {
  id: number
  role: string
}

/**
 * İMZALAMA ANAHTARI — İKİ KAYNAK, İKİSİ DE ÇALIŞMA ZAMANI.
 *
 * `runtimeConfig.authSecret` artık derlemede BOŞ (bkz. nuxt.config.ts).
 * Değeri gömen `process.env.AUTH_SECRET` varsayılanı kaldırıldı, çünkü
 * derleme çıktısında gerçek anahtarın düz metin durduğu ölçüldü.
 *
 * Sıra bilinçli:
 *   1. `NUXT_AUTH_SECRET` → Nuxt bunu çalışma zamanında runtimeConfig'e
 *      yazıyor. Dağıtım notunun kullandığı ad; kırılmadı.
 *   2. `AUTH_SECRET`      → `.env` ile çalışan yerel geliştirme.
 *
 * İkisi de boşsa istek 500 ile düşüyor — sessizce boş anahtarla imzalamak,
 * herkesin üretebileceği bir oturum çerezi demek olurdu.
 */
function getAuthSecret(event: H3Event): string {
  const secret = useRuntimeConfig(event).authSecret || process.env.AUTH_SECRET || ''

  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'AUTH_SECRET tanımlı değil' })
  }

  return secret
}

function sign(encodedPayload: string, secret: string): string {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url')
}

export function signAuthPayload(payload: AuthCookiePayload, event: H3Event): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = sign(encodedPayload, getAuthSecret(event))
  return `${encodedPayload}.${signature}`
}

function verifyAuthCookie(raw: string | undefined, event: H3Event): AuthCookiePayload | null {
  if (!raw) return null

  const separatorIndex = raw.lastIndexOf('.')
  if (separatorIndex === -1) return null

  const encodedPayload = raw.slice(0, separatorIndex)
  const signature = raw.slice(separatorIndex + 1)
  const expectedSignature = sign(encodedPayload, getAuthSecret(event))

  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null
  }

  try {
    return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'))
  } catch {
    return null
  }
}

export function getAuthUser(event: H3Event): AuthCookiePayload | null {
  return verifyAuthCookie(getCookie(event, 'auth'), event)
}

export function requireAdmin(event: H3Event): AuthCookiePayload {
  const user = getAuthUser(event)

  if (!user || user.role !== 'admin') {
    throw createError({ statusCode: 401, statusMessage: 'Yetkisiz erişim' })
  }

  return user
}
