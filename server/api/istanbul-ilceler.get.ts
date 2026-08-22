// server/api/istanbul-ilceler.get.ts
//
// `/bolgelerimiz` coğrafi dizininin tek veri kaynağı: 39 İstanbul ilçesi,
// ilçe başına ad + aktiflik + YAYINDAKİ mahalle sayısı + ilk beş mahalle adı.
//
// NEDEN `/api/regions` YETMEDİ:
//   · genel liste yalnız AKTİF kayıtları döndürüyor; dizin 39'un tamamını
//     göstermek zorunda
//   · light olmayan çağrı 375 kaydın tüm gövdesini taşıyor (~277 KB)
//
// `?tam=true` MODU KALDIRILDI.
//
// O mod 473 mahallenin adres dizinini taşıyordu ve tek gerekçesi bir
// mahallenin adresinin, adının 473'ün tamamı içinde çakışıp çakışmadığına
// bağlı olmasıydı. Adresler artık çalışma zamanında hesaplanmıyor:
// `Neighborhood.canonicalPath` sütununda duruyorlar. İlçe sayfası kendi
// mahallelerini `/api/mahalleler?ilce=<slug>` ile, mahalle sayfası
// kardeşlerini `/api/mahalle?yol=` yanıtının içinde alıyor — ikisi de
// yalnız kendi ilçesinin kayıtlarını taşıyor.
import { istanbulService } from '../domain/regions/istanbul.service'

export default defineEventHandler(() => istanbulService.getIndex())
