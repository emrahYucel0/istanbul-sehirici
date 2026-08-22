// server/domain/neighborhoods/neighborhood.identity.ts
//
// TEK KAYIT İÇİN ADRES TÜRETME.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN AYRI BİR İŞLEV — TOPLU DİZİN YETMİYOR
//
// `shared/utils/mahalle.ts` içindeki `mahalleDizini()` 39 ilçenin TAMAMINI
// birden alıp adresleri topluca dağıtıyor. Aktarım betiği için doğru olan
// bu: elinde bütün küme varken hangi adın kaç ilçede geçtiğini görebiliyor
// ve çakışan grubun TAMAMINI ilçe önekli yedeğe indiriyor.
//
// Panelden tek kayıt eklerken o toplu karar VERİLEMEZ. Sebep, dizinin kendi
// yorumunda yazılı olan gerekçenin tersi değil, aynısı: yayındaki bir adres
// başka bir kayıt uğruna EL DEĞİŞTİREMEZ. Panelden Küçükçekmece'ye "Fatih"
// eklendiğinde, Sultanbeyli'nin yayındaki `/fatih-mahallesi` adresini
// yeniden yazmak; canlı bir URL'yi sessizce taşımak demek olurdu.
//
// ─────────────────────────────────────────────────────────────────────────
// ARTIMLI POLİTİKA
//
//   1. Taban adres (`slugify(ad)-mahallesi`) boştaysa → taban verilir.
//   2. Taban doluysa → ilçe önekli yedek (`pendik-fatih-mahallesi`).
//   3. Yedek de doluysa → ADRES ÜRETİLMEZ, işlem reddedilir.
//
// "Dolu" yalnız başka mahalleler değil: kök ad alanındaki her adres (statik
// rota, yazı, bölge, hizmet) dolu sayılıyor. Karar veren küme dışarıdan
// geliyor; bu modül veri tabanına hiç bakmıyor.
//
// ADRESİN ŞEKLİ HÂLÂ TEK KAYNAKTAN: taban ve yedek biçimini
// `mahalleTabanYolu` / `mahalleYedekYolu` üretiyor. Burada üretilen tek şey
// İKİSİ ARASINDAKİ SEÇİM.
//
// Bu modül bilerek bağımsız (Prisma/Nitro/alias yok) — betikten de
// çağrılabilsin diye; `shared/` importları göreli ve uzantılı.
import { slugify } from '../../../shared/utils/slugify.ts'
import { mahalleTabanYolu, mahalleYedekYolu } from '../../../shared/utils/mahalle.ts'

export interface KimlikGirdisi {
  /** Görünen mahalle adı, ek olmadan: "Kaynarca". */
  ad: string
  /** Bağlı olduğu ilçenin slug'ı: "pendik". */
  ilceSlug: string
  /**
   * Kök ad alanında ZATEN kullanılan adresler.
   * Düzenlenen kaydın KENDİ adresi bu kümede olmamalı — aksi hâlde kayıt
   * kendi adresine çakışır.
   */
  doluYollar: Set<string>
}

export type KimlikSonucu =
  | {
      basarili: true
      /** İlçe içi kimlik: "kaynarca". Adres DEĞİL. */
      slug: string
      /** Yayındaki tam adres: "kaynarca-mahallesi" | "pendik-fatih-mahallesi". */
      canonicalPath: string
      /** Çakışma yüzünden ilçe önekli yedeğe mi düşüldü? */
      yedek: boolean
    }
  | { basarili: false; hata: string }

/**
 * Tek bir mahalle için slug ve kanonik adres üretir.
 *
 * DETERMİNİSTİK: aynı ad + ilçe + dolu küme her zaman aynı sonucu verir.
 */
export function mahalleKimligi(girdi: KimlikGirdisi): KimlikSonucu {
  const ad = String(girdi.ad ?? '').trim()
  if (!ad) return { basarili: false, hata: 'Mahalle adı boş olamaz.' }

  const slug = slugify(ad)
  // Ad tamamen noktalama ya da desteklenmeyen karakterden ibaretse slug boş
  // kalıyor ve adres `/-mahallesi` olurdu. Böyle bir kayıt oluşmamalı.
  if (!slug) {
    return {
      basarili: false,
      hata: `"${ad}" adından geçerli bir adres üretilemedi. Latin harf ya da rakam içeren bir ad girin.`,
    }
  }

  const ilceSlug = String(girdi.ilceSlug ?? '').trim()
  if (!ilceSlug) return { basarili: false, hata: 'İlçe seçilmeden adres üretilemez.' }

  const taban = mahalleTabanYolu(ad)
  if (!girdi.doluYollar.has(taban)) {
    return { basarili: true, slug, canonicalPath: taban, yedek: false }
  }

  const yedek = mahalleYedekYolu(ilceSlug, ad)
  if (!girdi.doluYollar.has(yedek)) {
    return { basarili: true, slug, canonicalPath: yedek, yedek: true }
  }

  return {
    basarili: false,
    hata:
      `"${ad}" için adres üretilemedi: /${taban} ve /${yedek} adreslerinin ikisi de kullanımda. ` +
      'Kaydı oluşturmak için mahalle adını ayırt edici hâle getirin.',
  }
}
