// server/domain/files/media.service.ts
//
// MEDYA KÜTÜPHANESİ — YÖNETİLEN YÜKLEMELERİN YÖNETİM YÜZEYİ.
//
// ─────────────────────────────────────────────────────────────────────────
// KÜTÜPHANE NEYİN SAHİBİ, NEYİN DEĞİL
//
// SAHİBİ      `yuklemeler/` altındaki, `StoredFile` kaydı olan dosyalar.
// DEĞİL       `public/images/...` — bunlar kaynak kodun parçası, sürümle
//             birlikte geliyorlar ve bir yönetim ekranından silinemezler.
//             İçerik alanı `/images/sahne-kat.webp` taşıyabilir; bu bir
//             `StoredFile` DEĞİLDİR ve kütüphane onun sahibi değildir.
//
// ─────────────────────────────────────────────────────────────────────────
// MANTIKSAL GÖRSEL — SATIR DEĞİL
//
// Yükleyici her genişlik için ayrı bir `StoredFile` satırı yaratıyor
// (`foto-320`, `foto-640`, `foto-1024`, `foto-2048`) ve içerik alanına
// yalnız en büyüğünün adresi yazılıyor. Kütüphane bu satırları MANTIKSAL
// GÖRSEL olarak grupluyor:
//
//   · listede tek kart görünüyor (dört satır değil)
//   · kullanım durumu grup için hesaplanıyor
//   · silme grubun TAMAMINI kaldırıyor
//
// Aksi hâlde yönetici, yayındaki bir görselin `-320` varyantını
// "kullanılmıyor" sanıp silebilirdi.
import fs from 'node:fs/promises'
import path from 'node:path'
import prisma from '../../utils/prisma.ts'
import { ok, fail, type ServiceResult } from '../shared/response.ts'
import { getSafeErrorMessage } from '../../utils/prismaError.ts'
import { STORAGE_PATH } from './files.service.ts'
import {
  referansHaritasi,
  mantiksalAd,
  YUKLEME_ONEKI,
  type ReferansKaydi,
} from './media.registry.ts'

export interface MedyaVaryanti {
  id: string
  storedName: string
  size: number
  yol: string
  /** Ad sonundaki genişlik eki; yoksa null. */
  genislik: number | null
}

export interface MedyaOgesi {
  /** Mantıksal ad — grubun kimliği. */
  anahtar: string
  originalName: string
  mimeType: string | null
  /** En büyük varyantın adresi — önizleme ve seçim bunu kullanıyor. */
  yol: string
  /** Grubun toplam boyutu. */
  toplamBoyut: number
  createdAt: Date | null
  varyantlar: MedyaVaryanti[]
  kullanimSayisi: number
  kullanimlar: ReferansKaydi[]
}

const genislikCoz = (ad: string): number | null => {
  const m = /-(\d{2,4})\.[a-z0-9]+$/i.exec(ad)
  return m ? Number(m[1]) : null
}

/**
 * Bütün yüklemeleri mantıksal görsellere gruplar.
 *
 * Sunucu tarafında gruplama yapılıyor çünkü grup kimliği ad üzerinden
 * hesaplanıyor ve veri tabanında böyle bir sütun yok. 377 satır için bu
 * ucuz; binlerce dosyada sayfalama zaten satır sayısını sınırlıyor.
 */
async function gruplariGetir(): Promise<MedyaOgesi[]> {
  const [satirlar, harita] = await Promise.all([
    prisma.storedFile.findMany({ orderBy: { createdAt: 'desc' } }),
    referansHaritasi(),
  ])

  const gruplar = new Map<string, MedyaOgesi>()

  for (const s of satirlar) {
    const anahtar = mantiksalAd(s.storedName)
    const varyant: MedyaVaryanti = {
      id: String(s.id),
      storedName: s.storedName,
      size: s.size ?? 0,
      yol: YUKLEME_ONEKI + s.storedName,
      genislik: genislikCoz(s.storedName),
    }

    const mevcut = gruplar.get(anahtar)
    if (mevcut) {
      mevcut.varyantlar.push(varyant)
      mevcut.toplamBoyut += varyant.size
      continue
    }

    gruplar.set(anahtar, {
      anahtar,
      originalName: s.originalName ?? s.storedName,
      mimeType: s.mimeType,
      yol: varyant.yol,
      toplamBoyut: varyant.size,
      createdAt: s.createdAt ?? null,
      varyantlar: [varyant],
      kullanimSayisi: 0,
      kullanimlar: [],
    })
  }

  for (const grup of gruplar.values()) {
    // En büyük varyant temsilci: içerik alanlarına yazılan adres o.
    grup.varyantlar.sort((a, b) => (b.genislik ?? 0) - (a.genislik ?? 0))
    grup.yol = grup.varyantlar[0].yol

    const kullanimlar = harita.get(grup.anahtar) ?? []
    grup.kullanimlar = kullanimlar
    grup.kullanimSayisi = kullanimlar.length
  }

  return [...gruplar.values()].sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
  )
}

export interface ListeSecenek {
  arama?: string
  /** 'hepsi' | 'kullanilan' | 'kullanilmayan' */
  suzgec?: string
  sayfa?: number
  sayfaBoyu?: number
}

const VARSAYILAN_SAYFA_BOYU = 24
const AZAMI_SAYFA_BOYU = 96

/**
 * Kütüphane listesi — SAYFALI.
 *
 * Binlerce dosyayı tek yanıtta göndermek hem ağı hem tarayıcıyı boşuna
 * yorar; üstelik yönetici zaten ilk ekranda aradığını buluyor.
 */
async function list(secenek: ListeSecenek = {}): Promise<ServiceResult<any>> {
  try {
    let gruplar = await gruplariGetir()

    const arama = String(secenek.arama ?? '').trim().toLowerCase()
    if (arama) {
      gruplar = gruplar.filter(
        (g) =>
          g.anahtar.toLowerCase().includes(arama) ||
          g.originalName.toLowerCase().includes(arama)
      )
    }

    if (secenek.suzgec === 'kullanilan') gruplar = gruplar.filter((g) => g.kullanimSayisi > 0)
    else if (secenek.suzgec === 'kullanilmayan') gruplar = gruplar.filter((g) => g.kullanimSayisi === 0)

    const toplam = gruplar.length
    const sayfaBoyu = Math.min(AZAMI_SAYFA_BOYU, Math.max(1, secenek.sayfaBoyu || VARSAYILAN_SAYFA_BOYU))
    const sayfa = Math.max(1, secenek.sayfa || 1)
    const dilim = gruplar.slice((sayfa - 1) * sayfaBoyu, sayfa * sayfaBoyu)

    return ok({
      items: dilim,
      toplam,
      sayfa,
      sayfaBoyu,
      sayfaSayisi: Math.max(1, Math.ceil(toplam / sayfaBoyu)),
      // Süzgeçten BAĞIMSIZ genel sayım — panelin üst şeridi için.
      ozet: await ozetHesapla(),
    })
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

async function ozetHesapla() {
  const gruplar = await gruplariGetir()
  return {
    gorsel: gruplar.length,
    dosya: gruplar.reduce((t, g) => t + g.varyantlar.length, 0),
    kullanilan: gruplar.filter((g) => g.kullanimSayisi > 0).length,
    kullanilmayan: gruplar.filter((g) => g.kullanimSayisi === 0).length,
    boyut: gruplar.reduce((t, g) => t + g.toplamBoyut, 0),
  }
}

/**
 * GÜVENLİ SİLME.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ÜÇ KORUMA
 *
 *   1. KİMLİKTEN BAŞLIYOR. İstemci yol göndermiyor, `StoredFile` kimliği
 *      gönderiyor; gerçek dosya adı veri tabanından okunuyor. İstemciden
 *      gelen serbest bir yolu `unlink` etmek path traversal demek olurdu.
 *
 *   2. KÖK KİLİDİ. Silinecek her yol `yuklemeler/` altında olmak zorunda ve
 *      bu `path.resolve` sonrası kontrol ediliyor — `../` ile dışarı çıkan
 *      bir ad çözümlendikten sonra yakalanıyor.
 *
 *   3. REFERANS KONTROLÜ. Grup herhangi bir içerik alanında kullanılıyorsa
 *      silme REDDEDİLİYOR ve nerede kullanıldığı okunabilir biçimde
 *      dönüyor.
 *
 * `/images/...` altındaki statik varlıklar buraya HİÇ GİRMİYOR: onların
 * `StoredFile` kaydı yok, dolayısıyla kimlikle çağrılamıyorlar.
 */
async function remove(anahtar: string): Promise<ServiceResult<any>> {
  try {
    const temizAnahtar = String(anahtar ?? '').trim()
    if (!temizAnahtar) return fail('Görsel belirtilmedi')

    const gruplar = await gruplariGetir()
    const grup = gruplar.find((g) => g.anahtar === temizAnahtar)
    if (!grup) return fail('Görsel bulunamadı')

    if (grup.kullanimSayisi > 0) {
      // NEREDE kullanıldığı mesaja YAZILIYOR: panel zaten listede de
      // gösteriyor ama silme denemesinin cevabı kendi başına anlaşılır
      // olmalı — "silinemez" deyip nedenini başka ekrana bırakmak,
      // yöneticiyi tahmin etmeye zorlar.
      const nerede = grup.kullanimlar
        .slice(0, 6)
        .map((k) => `${k.tur}: ${k.etiket} (${k.alan})`)
        .join(' · ')
      const fazlasi = grup.kullanimlar.length > 6 ? ` ve ${grup.kullanimlar.length - 6} yer daha` : ''
      return fail(
        `Bu görsel ${grup.kullanimSayisi} yerde kullanılıyor, silinemez. ` +
          `Önce kullanıldığı yerlerden kaldırın — ${nerede}${fazlasi}.`
      )
    }

    const silinen: string[] = []
    const atlanan: string[] = []

    for (const v of grup.varyantlar) {
      const hedef = path.resolve(STORAGE_PATH, v.storedName)
      const kok = path.resolve(STORAGE_PATH)

      // KÖK KİLİDİ — çözümlenmiş yol yönetilen klasörün altında mı?
      if (hedef !== kok && !hedef.startsWith(kok + path.sep)) {
        atlanan.push(v.storedName)
        continue
      }

      try {
        await fs.unlink(hedef)
        silinen.push(v.storedName)
      } catch (e: any) {
        // Dosya zaten yoksa kayıt yine de temizlenmeli: yarım kalmış bir
        // silmede DB satırı sonsuza kadar kalırdı.
        if (e?.code === 'ENOENT') silinen.push(v.storedName)
        else atlanan.push(v.storedName)
      }
    }

    if (atlanan.length) {
      return fail(
        `Bazı dosyalar silinemedi (${atlanan.length}). Hiçbir kayıt kaldırılmadı; ` +
          'yarım bir silme bırakmamak için işlem durduruldu.'
      )
    }

    await prisma.storedFile.deleteMany({
      where: { id: { in: grup.varyantlar.map((v) => v.id) } },
    })

    return ok(
      { anahtar: grup.anahtar, silinenDosya: silinen.length },
      `"${grup.originalName}" ve ${silinen.length} varyantı silindi.`
    )
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

/** Tek görselin kullanım raporu — silme öncesi panelin sorduğu soru. */
async function usage(anahtar: string): Promise<ServiceResult<any>> {
  try {
    const grup = (await gruplariGetir()).find((g) => g.anahtar === String(anahtar ?? '').trim())
    if (!grup) return fail('Görsel bulunamadı')
    return ok({
      anahtar: grup.anahtar,
      kullanimSayisi: grup.kullanimSayisi,
      kullanimlar: grup.kullanimlar,
      silinebilir: grup.kullanimSayisi === 0,
    })
  } catch (error) {
    return fail(getSafeErrorMessage(error))
  }
}

export const mediaService = { list, remove, usage, gruplariGetir }
