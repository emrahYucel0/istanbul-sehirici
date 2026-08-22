// server/domain/regions/istanbul.service.ts
//
// `/bolgelerimiz` COĞRAFİ DİZİNİNİN VERİ KAYNAĞI.
//
// Sitenin kanonik coğrafi hiyerarşisi artık:
//
//     İSTANBUL → 39 İLÇE → MAHALLELER
//
// Eski model (Türkiye → il → ilçe) veri tabanında hâlâ duruyor — 375 bölge
// kaydının 336'sı İstanbul dışı. O kayıtlara DOKUNULMUYOR; bu servis yalnız
// İstanbul dalını okuyor, dizin de yalnız onu gösteriyor.
//
// ─────────────────────────────────────────────────────────────────────────
// PASİF İLÇELER DE DÖNÜYOR — BİLİNÇLİ
//
// Dizin 39'un tamamını gösteriyor: ziyaretçi "ilçem listede yok" sonucuna
// varmasın diye. Aktif olmayan satır BAĞLANTI ALMIYOR — uydurma rota
// üretilmiyor. `aktif` alanı bu yüzden yanıtta: bağlantı verilip
// verilmeyeceğini istemci veriden okuyor, elle tutulan bir listeden değil.
//
// ─────────────────────────────────────────────────────────────────────────
// MAHALLE SAYISI ARTIK `Neighborhood` TABLOSUNDAN — VE YALNIZ YAYINDAKİLER
//
// Önceden sayı `Region.neighborhoods` JSON'undan, bağlantılar ise
// `Neighborhood` tablosundan geliyordu. İki kaynak demek, ekranda
// "17 MAHALLE" yazıp üç bağlantı göstermek demekti; panelden JSON'a bir ad
// eklendiğinde sayı artıyor ama hiçbir sayfa oluşmuyordu.
//
// Artık ikisi de tek sorgudan: yayındaki mahalleler. Sayfası olmayan bir
// mahalleyi saymak, olmayan bir kapsamı bildirmekti.
import { istanbulIlcesiMi } from '#shared/utils/istanbul'
import { ok, type ServiceResult } from '../shared/response'
import { getSafeErrorMessage } from '../../utils/prismaError'
import { neighborhoodsRepository } from '../neighborhoods/neighborhoods.repository'
import { regionsRepository } from './regions.repository'

// SINIFLANDIRMA BURADA TANIMLI DEĞİL. `istanbulIlcesiMi` shared/ altında ve
// aynı işlevi istemci tarafı da (app/pages/[...slug].vue, hangi görünümün
// basılacağına karar verirken) okuyor. İki kopya tutulsaydı biri
// değiştiğinde bir ilçe iki yerde farklı sınıflandırılırdı.

/** İlçe satırında gösterilen örnek mahalle adedi. */
const ONIZLEME = 5

export interface IstanbulDistrictRow {
  slug: string
  /** Temiz ilçe adı ("Kadıköy"); `title` "Kadıköy Evden Eve Nakliyat". */
  ad: string
  /** Sayfası yayında mı — bağlantı yalnız bunda veriliyor. */
  aktif: boolean
  /** YAYINDAKİ mahalle adedi. Kayıtlı ama yayına girmemiş olanlar sayılmıyor. */
  mahalleSayisi: number
  /** Yayındaki mahalle adlarından ilk birkaçı — satır önizlemesi. */
  mahalleler: string[]
}

export interface IstanbulIndex {
  ilceler: IstanbulDistrictRow[]
  toplam: number
  aktif: number
  /** Yayındaki mahalle sayfalarının toplamı. */
  mahalleKaydi: number
}

export const istanbulService = {
  /**
   * İstanbul ilçelerinin dizin satırları — aktif ve pasif, hepsi.
   *
   * Sıralama YAPILMIYOR: yaka gruplaması ve Türkçe alfabetik sıra sunum
   * kararı, istemci tarafında (components/region/IlceDizini.vue) yaka
   * eşlemesiyle birlikte tek yerde duruyor.
   *
   * İKİ SORGU, N+1 YOK: ilçeler bir kez, yayındaki mahalleler bir kez
   * okunuyor; eşleme bellekte yapılıyor. İlçe başına sorgu atmak 39 sorgu
   * demek olurdu.
   */
  async getIndex(): Promise<ServiceResult<IstanbulIndex>> {
    try {
      const [hepsi, yayindakiMahalleler] = await Promise.all([
        regionsRepository.findForGeoIndex(),
        neighborhoodsRepository.findActiveForIndex(),
      ])

      const ilceyeGore = new Map<number, string[]>()
      for (const m of yayindakiMahalleler as any[]) {
        if (!ilceyeGore.has(m.districtId)) ilceyeGore.set(m.districtId, [])
        ilceyeGore.get(m.districtId)!.push(m.name)
      }

      const ilceler = hepsi
        .filter((k: any) => istanbulIlcesiMi(k))
        .map((k: any): IstanbulDistrictRow => {
          const adlar = ilceyeGore.get(k.id) || []
          return {
            slug: k.slug,
            ad: (k.subtitle || k.shortTitle || k.title || k.slug).trim(),
            aktif: Boolean(k.isActive),
            mahalleSayisi: adlar.length,
            mahalleler: adlar.slice(0, ONIZLEME),
          }
        })

      return ok({
        ilceler,
        toplam: ilceler.length,
        aktif: ilceler.filter((i) => i.aktif).length,
        mahalleKaydi: ilceler.reduce((t, i) => t + i.mahalleSayisi, 0),
      })
    } catch (error) {
      return { success: false, error: getSafeErrorMessage(error) }
    }
  },
}
