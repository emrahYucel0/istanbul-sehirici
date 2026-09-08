/**
 * Panelden yüklenen görsellerin servisi — /yuklemeler/<dosya>
 *
 * Neden ayrı bir rota: Nitro'nun statik varlık mekanizması (publicAssets)
 * derleme zamanında çıkarılan bir manifest kullanıyor, dolayısıyla ÇALIŞMA
 * ANINDA yazılan dosyaları servis edemiyor — denendi, dosya .output/public
 * içine elle konsa bile 404 dönüyor.
 *
 * Bu rota, yerini aldığı eski `/api/files/...` rotasının üç eksiğini kapatıyor:
 *   1. ETag + Last-Modified  → tekrar ziyarette 304, sıfır bayt iner.
 *                              Eskiden yalnızca Content-Type gönderiliyordu,
 *                              yani görsel her sayfa görüntülemede baştan
 *                              indiriliyordu.
 *   2. Cache-Control          → bir yıl. Dosya adı varyant genişliğini ve
 *                              yüklemeye özgü rastgele bir eki içerdiği için
 *                              aynı ad farklı içeriğe işaret edemez.
 *   3. Veritabanı sorgusu YOK → eskiden her görsel isteği en az bir Prisma
 *                              sorgusu çalıştırıyordu.
 *
 * cPanel'de `/yuklemeler/` yolunu .htaccess ile doğrudan Apache'ye verirsen
 * bu rota hiç çağrılmaz ve Node tamamen devreden çıkar.
 */
import { createReadStream, promises as fs } from 'node:fs'
import path from 'node:path'
import { STORAGE_PATH } from '../../domain/files/files.service'

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

const BIR_YIL = 60 * 60 * 24 * 365

export default defineEventHandler(async (event) => {
  /**
   * HEAD DE KARŞILANIYOR — dosya adı `.get.ts` idi ve YALNIZ GET'e bağlıydı.
   *
   * ÖLÇÜLEN SORUN. Canlıda paylaşım görseli GET ile 200 dönerken HEAD ile
   * 404 dönüyordu:
   *
   *   GET  /yuklemeler/…-og.jpg → 200 · image/jpeg
   *   HEAD /yuklemeler/…-og.jpg → 404 · text/html   ← Nuxt 404 sayfası
   *
   * Sosyal tarayıcılar (WhatsApp, Twitter, Facebook) görseli indirmeden
   * ÖNCE çoğunlukla HEAD atıp boyutunu ve tipini doğruluyor. 404 alınca
   * "görsel yok" deyip kartı görselsiz basıyorlar — etiketler kusursuz
   * olsa bile. WhatsApp'ta görselin bir türlü çıkmamasının sebebi buydu.
   *
   * Derleme varlıkları (`/favicon.ico`, `/images/…`) Nitro'nun kendi statik
   * katmanından geldiği için HEAD'e zaten 200 dönüyordu; eksik yalnız
   * panelden yüklenenlerdeydi, yani tam da paylaşım görselinde.
   *
   * Dosya `[...ad].ts` oldu (tüm metotlar) ve izin GET/HEAD ile
   * sınırlandırıldı; kalanlar 405. HEAD'de başlıkların tamamı — özellikle
   * `Content-Length` — gönderiliyor, gövde gönderilmiyor.
   */
  const metot = (event.node.req.method || 'GET').toUpperCase()
  if (metot !== 'GET' && metot !== 'HEAD') {
    throw createError({ statusCode: 405, message: 'Yalnız GET ve HEAD' })
  }

  const ham = getRouterParam(event, 'ad') || ''
  const istenen = decodeURIComponent(ham)

  // YOL KAÇIŞI KORUMASI. İstemciden gelen ad diskte dosya açacağı için
  // `..`, `/`, `\` ve sürücü harfi içeren her şey reddediliyor; ayrıca
  // çözümlenen mutlak yolun klasörün İÇİNDE kaldığı ayrıca doğrulanıyor.
  if (!istenen || istenen.includes('..') || /[\\/]/.test(istenen)) {
    throw createError({ statusCode: 400, message: 'Geçersiz dosya adı' })
  }

  const uzanti = path.extname(istenen).toLowerCase()
  const contentType = CONTENT_TYPES[uzanti]
  if (!contentType) {
    throw createError({ statusCode: 415, message: 'Desteklenmeyen dosya tipi' })
  }

  const dosyaYolu = path.join(STORAGE_PATH, istenen)
  if (!path.resolve(dosyaYolu).startsWith(path.resolve(STORAGE_PATH) + path.sep)) {
    throw createError({ statusCode: 400, message: 'Geçersiz dosya adı' })
  }

  let bilgi
  try {
    bilgi = await fs.stat(dosyaYolu)
  } catch {
    throw createError({ statusCode: 404, message: 'Dosya bulunamadı' })
  }
  if (!bilgi.isFile()) {
    throw createError({ statusCode: 404, message: 'Dosya bulunamadı' })
  }

  // Boyut + değişiklik zamanından türetilen zayıf ETag; dosya içeriği
  // değişmeden aynı kalıyor, değişince farklılaşıyor.
  const etag = `W/"${bilgi.size.toString(16)}-${bilgi.mtimeMs.toString(16)}"`
  const sonDegisiklik = bilgi.mtime.toUTCString()

  setHeader(event, 'Content-Type', contentType)
  setHeader(event, 'Cache-Control', `public, max-age=${BIR_YIL}, immutable`)
  setHeader(event, 'ETag', etag)
  setHeader(event, 'Last-Modified', sonDegisiklik)

  // Tarayıcı elindekini soruyorsa gövde göndermeden 304 dön.
  const gelenEtag = getHeader(event, 'if-none-match')
  const gelenTarih = getHeader(event, 'if-modified-since')
  if (gelenEtag === etag || (gelenTarih && gelenTarih === sonDegisiklik)) {
    setResponseStatus(event, 304)
    return null
  }

  setHeader(event, 'Content-Length', bilgi.size)

  /**
   * HEAD: başlıklar yukarıda tamam, gövde yok. Akış açılmıyor ki dosya
   * boşuna okunmasın.
   *
   * `return null` KULLANILAMAZ: h3 bunu "No Content" sayıp yanıtı 204'e
   * çeviriyor ve `Content-Length` başlığını düşürüyor (ölçüldü). Sosyal
   * tarayıcılar HEAD'de `Content-Length` taşıyan bir 200 bekliyor —
   * görselin boyutunu oradan öğreniyorlar. Bu yüzden yanıt doğrudan
   * kapatılıyor; durum 200 kalıyor, başlıklar korunuyor.
   */
  if (metot === 'HEAD') {
    setResponseStatus(event, 200)
    event.node.res.end()
    return
  }

  return sendStream(event, createReadStream(dosyaYolu))
})
