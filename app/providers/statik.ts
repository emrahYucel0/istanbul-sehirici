/**
 * @nuxt/image SAĞLAYICISI — "statik"
 *
 * Sunucuda HİÇBİR görsel işleme yapmaz. Yalnızca istenen genişliğe en uygun,
 * önceden üretilmiş dosyayı seçer.
 *
 * NEDEN VARSAYILAN IPX DEĞİL
 * Site paylaşımlı cPanel hosting'de çalışacak. IPX her istekte sharp'ı
 * çağırır; orada bu üç duvara toslar: bellek limiti, CPU kotası ve
 * platforma özgü ikili dosya (Windows'ta derlenen sharp Linux'ta yüklenmez).
 * Bu sağlayıcı sayesinde sharp dağıtım paketine hiç girmiyor.
 *
 * Varyantları `node scripts/gorsel-hazirla.mjs uygula` üretir ve aynı komut
 * bu dosyanın okuduğu haritayı yazar. Yeni görsel eklendiğinde o komutun
 * yeniden çalıştırılması gerekir.
 *
 * HARİTADA OLMAYAN KAYNAKLAR (SVG, panelden yüklenen görseller, dış adresler)
 * olduğu gibi geçirilir — bozulmaz, sadece optimize edilmez.
 *
 * NOT: @nuxt/image 2 sağlayıcıları `defineProvider` ile VARSAYILAN dışa
 * aktarım bekliyor; yalnızca `export const getImage` yazmak
 * "MISSING_EXPORT: default" ile derlemeyi kırıyor. `defineProvider` de
 * yalnızca `@nuxt/image/runtime` üzerinden alınabiliyor — paketin exports
 * haritası `utils/provider` yoluna izin vermiyor.
 */
import { defineProvider } from '@nuxt/image/runtime'
import varyantlar from './gorsel-varyantlar.json'

interface Varyant {
  taban: string
  genislikler: number[]
  onEk: string
}

const HARITA = varyantlar as Record<string, Varyant>

/** İstenen genişliğe yetecek EN KÜÇÜK varyantı seçer; yoksa en büyüğü. */
const uygunGenislik = (mevcut: number[], istenen?: number): number | null => {
  if (mevcut.length === 0) return null
  if (!istenen) return mevcut[mevcut.length - 1]
  return mevcut.find((g) => g >= istenen) ?? mevcut[mevcut.length - 1]
}

/**
 * Panelden yüklenen görsellerin merdiveni (FileUploader.vue ile aynı olmalı).
 *
 * Bu dosyalar `/yuklemeler/foto-1024.webp` biçiminde, STATİK servis ediliyor —
 * yani var olmayan bir genişlik istenirse 404 gelir, kırık görsel çıkar.
 * Sunucu tarafında "en yakınını bul" gibi bir kurtarma yok ve olmasına da
 * gerek yok, çünkü:
 *   - yükleyici merdivenin kaynağa sığan BAŞTAN İTİBAREN kesintisiz bölümünü
 *     üretiyor (1024 varsa 320 ve 640 da kesin var),
 *   - kaydedilen adres EN BÜYÜK varyantı gösteriyor.
 * Dolayısıyla adresteki sayı bir tavan; onun altındaki basamaklar garanti var.
 */
// 2560 basamağı, tavanı 3840 olan yüklemeler için gerekli: yoksa 2048'den
// doğrudan 3840'a atlanır. Tavanı 2560 olan eski dosyalarda davranış aynı —
// `filter(g < tavan)` onu zaten eliyor, tavan da sonda ekleniyor.
const YUKLEME_MERDIVENI = [320, 640, 1024, 2048, 2560]
const YUKLEME_DESENI = /^(.*)-(\d+)\.webp$/i

export default defineProvider({
  getImage: (src: string, { modifiers = {} }: { modifiers?: Record<string, unknown> } = {}) => {
    const ham = modifiers.width
    const sayi = ham ? Number(ham) : undefined
    const istenen = Number.isFinite(sayi) ? sayi : undefined

    // 1) public/images — derleme öncesi üretilen varyantlar (harita ile)
    const kayit = HARITA[src]
    if (kayit) {
      const secilen = uygunGenislik(kayit.genislikler, istenen)
      // Genişlik istenmemişse veya varyant yoksa taban dosya (her tarayıcıda açılır)
      if (!secilen) return { url: kayit.taban }
      return { url: `${kayit.onEk}${secilen}.webp` }
    }

    // 2) Panelden yüklenenler — adresteki genişliği değiştir.
    //    Adresteki sayı TAVAN: üretilmiş en büyük varyant. Onun üstünü istemek
    //    404 demek olurdu, o yüzden merdiven tavanla sınırlanıyor.
    const eslesme = YUKLEME_DESENI.exec(src)
    if (eslesme) {
      const tavan = Number(eslesme[2])

      // Tavanın KENDİSİ de geçerli bir varyant — adres zaten onu gösteriyor.
      // Merdivene dahil edilmezse şöyle bir kayıp olur: varyantlar
      // 320/640/1024/1536 iken 1400px istenirse merdivenden 1024 seçilir ve
      // var olan 1536 hiç kullanılmaz.
      const kullanilabilir = [...YUKLEME_MERDIVENI.filter((g) => g < tavan), tavan]

      const secilen = uygunGenislik(kullanilabilir, istenen)
      if (secilen) return { url: `${eslesme[1]}-${secilen}.webp` }
    }

    // 3) SVG, dış adres, eski kayıtlar — dokunma
    return { url: src }
  },
})
