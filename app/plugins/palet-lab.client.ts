/**
 * PALET LABORATUVARI — GEÇİCİ KARŞILAŞTIRMA ARACI.
 *
 * `?palette=navy` gibi bir sorgu parametresi varsa `<html>` üzerine
 * `data-palette` yazıyor; `assets/css/palet-lab.css` o niteliğe bağlı
 * blokları devreye sokuyor. Parametre yoksa HİÇBİR ŞEY yapmıyor — yani
 * normal ziyaretçi için bu dosya ölü kod.
 *
 * NEDEN GÖRÜNÜR BİR SEÇİCİ YOK
 * Palet seçici üretim arayüzünün parçası olmamalı. Sorgu parametresi hem
 * paylaşılabilir (aynı adres aynı paleti açıyor) hem de ekranda hiçbir şey
 * göstermiyor.
 *
 * NEDEN KALICI DEĞİL
 * Veritabanına, ayarlara, çereze ya da localStorage'a yazmıyor. Sayfa
 * yenilendiğinde parametre yoksa kanonik palete dönüyor. Tema mimarisi
 * değil; yalnız görsel karşılaştırma.
 *
 * KALDIRMA: bu dosyayı ve `assets/css/palet-lab.css`'i sil, `nuxt.config.ts`
 * css dizisinden ilgili satırı çıkar.
 */
const GECERLI = ['current', 'navy', 'stone', 'petrol', 'swiss', 'turquoise']

export default defineNuxtPlugin(() => {
  const route = useRoute()

  const uygula = (deger: unknown) => {
    const ad = String(deger ?? '').trim().toLowerCase()
    // Bilinmeyen değer sessizce yok sayılıyor: `?palette=xyz` kanonik
    // paleti bozmasın.
    if (!GECERLI.includes(ad)) return
    document.documentElement.dataset.palette = ad
  }

  uygula(route.query.palette)
  // Rotalar arasında gezinirken parametre taşınıyorsa palet korunuyor.
  watch(() => route.query.palette, uygula)
})
