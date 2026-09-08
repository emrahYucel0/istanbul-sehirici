// server/utils/sosyal-gorsel.ts
//
// PAYLAŞIM KARTI GÖRSELİNİ SEÇER — webp yerine jpeg, VARSA.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN VAR
//
// WhatsApp'ta bağlantı paylaşıldığında başlık ve açıklama çıkıyor, görsel
// çıkmıyordu. Canlıdan ölçüldü: `og:image` erişilebilir (HTTP 200, 110 KB)
// ama `image/webp`. WhatsApp link önizlemesinde WebP çizmiyor — JPEG/PNG
// bekliyor. Yani hata yüklemede değil, FORMATTA.
//
// Panelden çözülemiyordu: yükleyici her rasteri webp'ye çeviriyor, çünkü
// sunucuda `sharp` yok (paylaşımlı hosting) ve dönüşüm tarayıcıda yapılıyor.
//
// ÇÖZÜM: yükleyici artık webp merdiveninin yanına bir de `-og.jpg` yazıyor
// (bkz. app/components/FileUploader.vue). Bu dosya onu SEÇİYOR.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN SUNUCUDA, NEDEN "VARSA"
//
// Kayıtlı adres webp olarak KALIYOR — sitedeki görsel o. Yalnız sosyal kart
// jpeg'e bakıyor. Seçim sunucuda yapılıyor çünkü karar diskte dosya var mı
// sorusuna bağlı ve bunu yalnız sunucu bilebilir.
//
// "Varsa" koşulu geçiş için şart: bu değişiklikten ÖNCE yüklenmiş
// görsellerin `-og.jpg`si yok. Koşulsuz çevirseydik onların hepsi 404
// verirdi — yani bugün hiç görsel göstermeyen WhatsApp'ı düzeltirken
// çalışan bütün platformları (Twitter, LinkedIn, Telegram) kırardık.
// Eski bir görsel panelden bir kez yeniden yüklendiğinde kendiliğinden
// jpeg'li hâle geliyor.
import { existsSync } from 'node:fs'
import path from 'node:path'
import { STORAGE_PATH } from '../domain/files/files.service'

/** `/yuklemeler/foto-1024.webp` → `foto-og.jpg` (yalnız dosya adı). */
const ogAdi = (yol: string): string | null => {
  const eslesme = /^\/yuklemeler\/(.+)-\d+\.webp$/i.exec(yol)
  return eslesme ? `${eslesme[1]}-og.jpg` : null
}

/**
 * Sosyal kart için kullanılacak adresi döndürür.
 *
 * Panelden yüklenmemiş adresler (derleme varlıkları, dış adresler, SVG)
 * olduğu gibi geçer — onların merdiveni ve adlandırma kuralı yok.
 */
export function sosyalGorsel(yol: unknown): unknown {
  if (typeof yol !== 'string' || !yol) return yol

  const ad = ogAdi(yol.trim())
  if (!ad) return yol

  // Yol kaçışına karşı: çözülen dosya depo klasörünün İÇİNDE kalmalı.
  const tam = path.join(STORAGE_PATH, ad)
  if (path.dirname(tam) !== STORAGE_PATH) return yol

  return existsSync(tam) ? `/yuklemeler/${ad}` : yol
}
