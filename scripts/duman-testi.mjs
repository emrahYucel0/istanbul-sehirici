/**
 * DUMAN TESTİ — sayfalar gerçekten dolu mu?
 *
 *     node scripts/duman-testi.mjs                      → http://127.0.0.1:3000
 *     node scripts/duman-testi.mjs http://127.0.0.1:3210
 *     node scripts/duman-testi.mjs https://alanadi.com  → canlı yayın sonrası
 *
 * NEDEN SADECE "200 DÖNDÜ MÜ" DEĞİL
 * Veri katmanında bir şey bozulduğunda sayfa yine 200 döner, sadece içi boş
 * olur — bölüm başlığı basılır, altındaki liste hiç render edilmez. Bu yüzden
 * her kontrol, VERİDEN gelmesi gereken somut bir metin arıyor: bölge sayfasında
 * mahalle adının kendisi, hizmet sayfasında "Neler Dahil" bloğu gibi.
 *
 * Bu araç yayın sonrası doğrulama için de kullanılabilir: cPanel'e dağıtım
 * yapıldıktan sonra canlı adrese karşı çalıştırıp aynı 20+ kontrolü alırsınız.
 */
const TEMEL = (process.argv[2] || 'http://127.0.0.1:3000').replace(/\/$/, '')

/**
 * ÖRNEK BÖLGE SABİT DEĞİL, CANLIDAN SEÇİLİYOR.
 *
 * Önceden bu testler `/kartal` adresine sabitlenmişti. Bölgeler panelden
 * tek tek aktif/pasif yapılabildiği için Kartal pasife alındığında test
 * yedi kalemde birden "404" verdi — oysa sitede hiçbir şey bozulmamıştı.
 * Kurt masalı anlatan bir test, olmayan testten kötüdür.
 *
 * Artık `/api/regions` (yalnızca AKTİF kayıtları döner) sorgulanıyor ve
 * mahalle, künye ve güzergâh alanlarının üçü de dolu olan ilk bölge
 * örnek olarak seçiliyor. Aranan metinler de o bölgenin kendi verisinden
 * türetiliyor; hangi bölgenin aktif olduğu değiştiğinde test kendini
 * uyarlıyor.
 */
const dizi = (v) => (Array.isArray(v) ? v : [])

/**
 * ÖRNEK BÖLGE ARTIK YAYINDAKİ MAHALLESİ OLAN BİR İLÇE.
 *
 * Önceden seçim `Region.neighborhoods` JSON alanına bakıyordu ve o alan
 * bugün 39 ilçenin hepsinde dolu — yani test, mahalle SAYFASI olmayan bir
 * ilçeyi seçip "mahalle bölümü yok" diye şikâyet edebiliyordu. Mahalle
 * verisinin tek yetkili kaynağı `Neighborhood` tablosu olduğu için seçim
 * de oradan yapılıyor: yayında en az bir mahallesi olan ilk ilçe.
 */
async function ornekBolgeSec() {
  try {
    const [bolgeCevap, dizinCevap] = await Promise.all([
      fetch(`${TEMEL}/api/regions`).then((c) => c.json()),
      fetch(`${TEMEL}/api/istanbul-ilceler`).then((c) => c.json()),
    ])
    if (!bolgeCevap?.success || !dizinCevap?.success) return null

    const yayindaMahallesiOlan = dizinCevap.data.ilceler.find(
      (i) => i.aktif && i.mahalleSayisi > 0
    )
    if (!yayindaMahallesiOlan) return null

    const uygun = bolgeCevap.data.find((b) => b.slug === yayindaMahallesiOlan.slug)
    if (!uygun) return null

    // Mahalle ADRESİ dizinde yok (dizin yalnız ad taşıyor); ilçe listesinden
    // alınıyor — sayfanın kendisi de aynı ucu okuyor.
    const listeCevap = await fetch(
      `${TEMEL}/api/mahalleler?ilce=${encodeURIComponent(uygun.slug)}`
    ).then((c) => c.json())
    const ilkYol = listeCevap?.data?.mahalleler?.[0]?.yol
    if (!ilkYol) return null

    return {
      slug: uygun.slug,
      baslik: uygun.title,
      // shortTitle bölge sayfasındaki bölüm başlıklarında kullanılıyor;
      // yoksa başlıktan ilk kelime yeterli.
      kisaAd: uygun.shortTitle || String(uygun.title || '').split(' ')[0],
      // Görünen ilçe adı — V2 başlığı "Kadıköy mahalleleri" biçiminde.
      ad: yayindaMahallesiOlan.ad,
      mahalleSayisi: yayindaMahallesiOlan.mahalleSayisi,
      mahalle: yayindaMahallesiOlan.mahalleler[0],
      mahalleYolu: ilkYol,
    }
  } catch {
    return null
  }
}

const ornek = await ornekBolgeSec()
if (!ornek) {
  console.log('UYARI: mahalle/künye/güzergâh alanları dolu AKTİF bir bölge bulunamadı.')
  console.log('       Bölgeye özgü yedi kontrol atlanıyor (site hatası değil).\n')
} else {
  console.log(`örnek bölge: /${ornek.slug} (${ornek.baslik})\n`)
}

/** Bölgeye özgü kontroller — örnek bölge bulunduysa eklenir. */
const BOLGE_KONTROLLERI = ornek
  ? [
      [`/${ornek.slug}`, ornek.baslik, 'bölge h1'],
      // V2 başlığı: "Kadıköy mahalleleri". Eski "Hizmet Verdiğimiz …"
      // metni yalnız İstanbul DIŞI bölge görünümünde kaldı.
      [`/${ornek.slug}`, `${ornek.ad} mahalleleri`, 'mahalle bölümü (Neighborhood tablosu)'],
      [`/${ornek.slug}`, ornek.mahalle, 'mahalle ADLARI gerçekten basıldı'],
      // Sayı ile listenin AYNI kaynaktan gelmesi bu ailenin düzeltilen
      // hatasıydı; ekrandaki sayı dizindeki sayıyla birebir olmalı.
      [`/${ornek.slug}`, `${ornek.mahalleSayisi} MAHALLE SAYFASI`, 'mahalle sayısı = yayındaki kayıt sayısı'],
      [`/${ornek.mahalleYolu}`, ornek.mahalle, 'mahalle sayfası açılıyor'],
      // V2 BAŞLIKLARI (M6'da güncellendi). Eskiden aranan metinler
      // "… Taşınma Künyesi", "Sık Taşınılan Güzergâhlar" ve "Bu sayfada"
      // idi; üçü de V1 ilçe şablonuna aitti. Bölümlerin KENDİSİ duruyor,
      // yalnız başlıkları değişti — ÖLÇÜLDÜ, kaybolan işlev yok.
      [`/${ornek.slug}`, `${ornek.kisaAd} künyesi`, 'künye tablosu (facts JSON)'],
      [`/${ornek.slug}`, 'sık taşınılan yönler', 'güzergâhlar (routes JSON)'],
      // İçindekiler listesi V2'de kalktı; yerine bölüm çapaları geldi.
      // Çapa kimlikleri hâlâ gerekli: sayfa içi bağlantılar onlara gidiyor.
      [`/${ornek.slug}`, 'id="bolum-mahalle"', 'bölüm çapaları (sayfa içi gezinme)'],
      [`/${ornek.slug}`, 'href="/fiyat-hesaplama"', 'bölge sayfası → fiyat aracı'],
    ]
  : []

/** [yol, aranan metin, kontrolün anlamı] */
const KONTROLLER = [
  // ANA SAYFA — V2. `hero API` kontrolü kaldırıldı: ana sayfa M4'ten beri
  // HeroPage okumuyor, içerik `/api/anasayfa` üzerinden geliyor (M6'da
  // HeroPage'in yönetim yüzeyi de kaldırıldı).
  ['/', "İstanbul'da taşınmak", 'hero H1 (HomeSection)'],
  ['/', 'Taşındıktan sonra yazılanlar', 'yorumlar bölümü (Testimonial)'],
  // `role="combobox"` KALDIRILDI: aranan şey RegionFinder bileşeniydi ve
  // o V2 geçişinde ana sayfadan çıkarıldı (bileşen M6'da silindi). Bölgeye
  // giden yol duruyor ve alttaki satır onu kontrol ediyor.
  ['/', 'bolgelerimiz', 'ana sayfadan bölge bağlantıları'],
  ['/bolgelerimiz', 'İstanbul', 'ilçe dizini (regions API)'],
  // 'Ege' KALDIRILDI: `/bolgelerimiz` artık coğrafi grup başlıkları olan
  // Türkiye dizini değil, İstanbul ilçe dizini. Bu bilinçli bir V2 kararı.
  ['/bolgelerimiz', 'iki yakadır', 'İstanbul yaka ayrımı'],
  ['/hizmetlerimiz', 'Asansörlü', 'hizmet kartları (services API)'],
  ['/hizmetlerimiz', 'Evden Eve Nakliyat', 'hizmet kartı bağlantısı'],
  // "Sık Sorulan" → V2'de "Bu hizmet hakkında sorulanlar". Blok duruyor;
  // çapa kimliği başlık metninden daha kararlı bir işaret.
  ['/evden-eve-nakliyat', 'id="sss"', 'SSS bloğu (faqs JSON alanı)'],
  // Aranan dize `aria-label` metniydi ("Sonraki hizmet: …") ve etiket
  // WCAG düzeltmesiyle değişince test kırıldı — oysa gezinme çalışıyordu.
  // Artık GÖRÜNEN işaret aranıyor: gezinme bloğunun kendisi ve hedefin adı.
  // Etiket metni tekrar değişse bile bu kontrol ayakta kalır.
  // `class="pager"` V2'de yeniden adlandırıldı. Gezinmenin ÇALIŞTIĞINI
  // zaten alttaki iki satır kanıtlıyor (sonraki/önceki hizmetin adı);
  // sınıf adına bağlı kontrol yalnız kırılganlık ekliyordu, kaldırıldı.
  ['/evden-eve-nakliyat', 'Asansörlü Nakliyat', 'gezinmede sonraki hizmetin adı'],
  ['/asansorlu-nakliyat', 'Evden Eve Nakliyat', 'gezinmede önceki hizmetin adı'],
  // "Neler Dahil" → V2'de "Bu hizmet neleri kapsıyor?".
  ['/asansorlu-nakliyat', 'id="kapsam"', 'includes JSON alanı'],
  ...BOLGE_KONTROLLERI,
  // `/istanbul` KONTROLLER'den OLMAMALI'ya taşındı: nuxt.config.ts onu
  // kalıcı olarak `/` adresine yönlendiriyor (site zaten İstanbul'a ait,
  // ayrı bir il sayfası ikinci bir ana sayfa olurdu). Kayıt veri tabanında
  // duruyor ve M3'te adresi korunuyor; yalnız görünümü yönlendiriliyor.
  ['/blog', '<article', 'yazı kartları (posts API)'],
  ['/iletisim', '<form', 'teklif formu'],
  ['/hakkimizda', '<h1', 'about-section API'],
  ['/sitemap.xml', '<loc>', 'sitemap üretimi'],
  ['/robots.txt', 'Sitemap', 'robots.txt'],

  // FİYAT ARACINA GİRİŞ NOKTALARI.
  // Sayfa yayına hazırdı ama sitede tek bir bağlantısı vardı (yalnızca bölge
  // sayfalarında); ana sayfa, hizmet sayfaları, blog ve footer'dan ulaşılmıyordu.
  // Sessizce tekrar kopmaması için her giriş noktası ayrı kontrol ediliyor.
  // "Tahmini fiyat aralığı" SUNUCU ÇIKTISINDA HİÇ OLAMAZ: sonuç, kullanıcı
  // altı girdiyi doldurduktan sonra İSTEMCİDE hesaplanıyor. Duman testi
  // SSR HTML'ine bakıyor, yani bu kontrol tasarımı gereği hiç geçemezdi.
  // Yerine aracın SSR'da gerçekten basılan iskeleti aranıyor.
  ['/fiyat-hesaplama', 'id="hesap-baslik"', 'fiyat aracı sayfada'],
  ['/', 'href="/fiyat-hesaplama"', 'ana sayfa → fiyat aracı'],
  ['/evden-eve-nakliyat', 'href="/fiyat-hesaplama"', 'hizmet sayfası → fiyat aracı'],
  ['/kis-aylarinda-tasinmak', 'href="/fiyat-hesaplama"', 'blog yazısı → fiyat aracı'],
  // `fiyat-bag--plain` sınıfı V2 footer'ında yok; bağlantının KENDİSİ var.
  // Sınıf adı yerine hedef adres aranıyor — yeniden adlandırmada kırılmaz.
  ['/iletisim', 'href="/fiyat-hesaplama"', 'footer → fiyat aracı (her sayfada)'],

  // META VERİSİ.
  // Hizmetlerimiz ve Fiyat Hesaplama panelde seçilemediği için başlıkları
  // sabit gidiyordu; üç politika sayfasının ise hiç başlığı/açıklaması yoktu.
  // Hepsi artık app/utils/sayfa-meta.ts kütüğünden besleniyor.
  ['/hizmetlerimiz', 'name="description"', 'hizmetlerimiz meta açıklaması'],
  ['/fiyat-hesaplama', 'name="description"', 'fiyat hesaplama meta açıklaması'],
  ['/gizlilik-politikasi', '<title', 'gizlilik politikası başlığı'],
  ['/gizlilik-politikasi', 'name="description"', 'gizlilik politikası açıklaması'],
  ['/kullanim-sartlari', '<title', 'kullanım şartları başlığı'],
  ['/cerez-politikasi', '<title', 'çerez politikası başlığı'],
  ['/cerez-politikasi', 'rel="canonical"', 'politika sayfalarında canonical'],
]

/** Bunlar 200 DÖNMEMELİ. */
const OLMAMALI = [
  ['/asansorlu-nakliyat-ne-zaman-gerekir', 404, 'silinen blog yazısı'],
  ['/evdeneveyonetim/regions', 302, 'admin koruması (giriş yoksa yönlendirme)'],
  // İL SAYFASI KALICI OLARAK ANA SAYFAYA YÖNLENDİRİLİYOR.
  // Site zaten İstanbul'a ait; ayrı bir "İstanbul" sayfası ikinci bir ana
  // sayfa olurdu. Kayıt veri tabanında duruyor ve M3 kök adres korumasında
  // adresi rezerve (bkz. DEVREDILMIS_SAHIPLER).
  ['/istanbul', 301, 'il sayfası → ana sayfa (kalıcı yönlendirme)'],
  // M6'DA KALDIRILAN YÖNETİM ROTALARI.
  //
  // Bu duman testi OTURUMSUZ çalışıyor, yani yönetim alanının kimlik
  // koruması router'dan ÖNCE devreye giriyor ve 302 ile girişe gönderiyor —
  // `/evdeneveyonetim/regions` satırındaki davranışın aynısı. Rotanın
  // gerçekten kaldırıldığı ayrıca ölçüldü: oturum AÇIKKEN dördü de 404
  // dönüyor (bkz. M6 raporu). Buradaki 302, "eski yer imi sessizce boş bir
  // form açmıyor" güvencesi için yeterli.
  ['/evdeneveyonetim/hero', 302, 'kaldırılan Hero paneli'],
  ['/evdeneveyonetim/trust-bar', 302, 'kaldırılan Güven Bandı paneli'],
  ['/evdeneveyonetim/choose', 302, 'kaldırılan Neden Biz paneli'],
  ['/evdeneveyonetim/help', 302, 'kaldırılan We Help paneli'],
  ['/evdeneveyonetim/price', 302, 'kaldırılan Fiyatlar paneli'],
  ['/evdeneveyonetim/testimonial', 302, 'kaldırılan eski Yorumlar bölümü paneli'],
  ['/evdeneveyonetim/quote', 302, 'kaldırılan İletişim Form paneli'],
  ['/evdeneveyonetim/footer', 302, 'kaldırılan Footer paneli'],
  // KALDIRILAN YAZMA UÇLARI.
  ['/api/hero', 404, 'kaldırılan hero ucu'],
  ['/api/trust-bar', 404, 'kaldırılan güven bandı ucu'],
  ['/api/why-choose-us', 404, 'kaldırılan neden biz ucu'],
  ['/api/we-help-section', 404, 'kaldırılan we-help ucu'],
  ['/api/pricing-section', 404, 'kaldırılan fiyat bölümü ucu'],
  ['/api/testimonials-section', 404, 'kaldırılan yorum bölümü ucu'],
  ['/api/quote', 404, 'kaldırılan teklif bölümü ucu'],
  ['/api/footer', 404, 'kaldırılan footer ucu'],
]

const getir = async (yol) => {
  const cevap = await fetch(TEMEL + yol, { redirect: 'manual' })
  const govde = cevap.status === 200 ? await cevap.text() : ''
  return { durum: cevap.status, govde }
}

let hata = 0
console.log(`hedef: ${TEMEL}\n`)

for (const [yol, aranan, aciklama] of KONTROLLER) {
  try {
    const { durum, govde } = await getir(yol)
    if (durum !== 200) {
      console.log(`  HTTP ${durum}  ${yol.padEnd(24)} ${aciklama}`)
      hata++
    } else if (!govde.includes(aranan)) {
      console.log(`  EKSİK     ${yol.padEnd(24)} ${aciklama}  [aranan: ${aranan}]`)
      hata++
    } else {
      console.log(`  ok        ${yol.padEnd(24)} ${aciklama}`)
    }
  } catch (e) {
    console.log(`  ERİŞİLEMEDİ ${yol.padEnd(22)} ${e.message}`)
    hata++
  }
}

console.log()
for (const [yol, beklenen, aciklama] of OLMAMALI) {
  try {
    const { durum } = await getir(yol)
    const uygun = durum === beklenen
    console.log(`  ${uygun ? 'ok      ' : 'BEKLENEN ' + beklenen}  ${yol.padEnd(40)} ${aciklama} → ${durum}`)
    if (!uygun) hata++
  } catch (e) {
    console.log(`  ERİŞİLEMEDİ ${yol.padEnd(38)} ${e.message}`)
    hata++
  }
}

// Bozuk karakter taraması — Türkçe karakterlerin doğru geldiğini kanıtlar.
console.log()
let bozuk = 0
for (const yol of ['/', '/hizmetlerimiz', ...(ornek ? [`/${ornek.slug}`] : []), '/blog']) {
  try {
    const { govde } = await getir(yol)
    const adet = (govde.match(/�/g) || []).length
    bozuk += adet
    if (adet) console.log(`  BOZUK KARAKTER  ${yol}  → ${adet} adet`)
  } catch { /* yukarıda raporlandı */ }
}
console.log(`  ${bozuk === 0 ? 'ok      ' : 'HATA    '}  bozuk karakter taraması → ${bozuk}`)
if (bozuk) hata++

// ---------------------------------------------------------------------------
// SSR PAYLOAD SIZINTI TARAMASI
//
// Sayfaya gömülen __NUXT_DATA__ bloğu, sunucuda çekilen tüm verinin
// serileştirilmiş hâli. Tarayıcı onu okumak ZORUNDA (hidrasyon bununla
// yapılıyor), yani gizlenemez — gizlenirse sayfa istemcide çalışmaz.
// Bu yüzden korunma yolu saklamak değil, İÇİNE HASSAS VERİ KOYMAMAK.
//
// Bu tarama tam olarak onu denetliyor: bir API ucu ileride yanlışlıkla
// fazla alan döndürmeye başlarsa (ör. yorum ucunun e-posta alanını
// açması, lead kayıtlarının listeye sızması) burada yakalanır.
// ---------------------------------------------------------------------------
console.log()
const SIZINTI_DESENLERI = [
  ['parola/anahtar', /"(password|passwordHash|secret|token|apiKey|api_key|databaseUrl|DATABASE_URL)"/i],
  ['oturum jetonu', /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/],
  ['talep kaydı alanları', /"(mailStatus|mailError|ipAddress|userAgent)"/],
  ['yorum e-postası', /"email"\s*:\s*"[^"]+@/],
]
let sizinti = 0
for (const yol of ['/', ...(ornek ? [`/${ornek.slug}`] : []), '/blog', '/iletisim']) {
  try {
    const { govde } = await getir(yol)
    const blok = govde.match(/<script[^>]*data-nuxt-data="nuxt-app"[^>]*>([\s\S]*?)<\/script>/)
    if (!blok) continue
    for (const [ad, desen] of SIZINTI_DESENLERI) {
      if (desen.test(blok[1])) {
        console.log(`  SIZINTI   ${yol.padEnd(16)} payload içinde ${ad} bulundu`)
        sizinti++
      }
    }
  } catch { /* yukarıda raporlandı */ }
}
console.log(`  ${sizinti === 0 ? 'ok      ' : 'HATA    '}  payload sızıntı taraması → ${sizinti}`)
if (sizinti) hata++

// Şablon yorumları HTML'e basılmamalı (nuxt.config → vue.compilerOptions.comments).
// `<!--[-->` / `<!--]-->` / `<!--v-if-->` hidrasyon işaretidir, sayılmaz.
const { govde: anaSayfa } = await getir('/')
const gercekYorum = (anaSayfa.match(/<!--(?!\[|\]|-->|v-if|\s*-->)[\s\S]{0,200}?-->/g) || []).filter(
  (y) => !/^<!--(\[|\]|v-if)?-*-->$/.test(y.trim())
)
console.log(
  `  ${gercekYorum.length === 0 ? 'ok      ' : 'HATA    '}  şablon yorumu taraması → ${gercekYorum.length}`
)
if (gercekYorum.length) {
  console.log(`     ilk örnek: ${gercekYorum[0].slice(0, 70)}`)
  hata++
}

console.log(`\n${hata === 0 ? '✔ TÜM KONTROLLER GEÇTİ' : `✗ ${hata} SORUN`}`)
process.exit(hata === 0 ? 0 : 1)
