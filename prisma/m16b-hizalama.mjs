// prisma/m16b-hizalama.mjs
//
//     npm run m16b-hizala -- --dogrula   → yalnız rapor, HİÇBİR ŞEY yazmaz
//     npm run m16b-hizala                → hizalamayı uygular
//
// KOŞULSUZ KEŞİF TAAHHÜDÜNÜN SİTE GENELİ TARAFI.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN AYRI BİR BETİK
//
// `is-gercegi-hizalama.mjs` M15B'nin kapsamını taşıyor: /hakkimizda ve
// /iletisim. Kapsamı dosyanın başlığında yazılı ve testi (
// `test/is-gercegi-sozlesmesi.test.ts`) o kapsama göre kurulu. M16
// denetimi aynı taahhüdün ON sayfada daha durduğunu ölçtü — ana sayfa,
// yedi hizmet, fiyat aracı, hizmet dizini ve site geneli SEO alanları.
// Bunları oraya yığmak iki turun kapsamını birbirine karıştırırdı.
//
// Sözleşme AYNI: tanınan eski kuşak → yeni kuşak, elle yazılmışı ezme,
// ikinci koşuda 0 yazma, `--dogrula` ile kuru koşu.
//
// ─────────────────────────────────────────────────────────────────────────
// İŞ GERÇEĞİ SÖZLEŞMESİ (kullanıcı tarafından doğrulandı)
//
//   1. Her işte keşif yapılıyor mu?                    HAYIR
//   2. Kapsam müşteriye YAZILI veriliyor mu?           EMİN DEĞİL
//   3. Taşıma öncesi SÖZLEŞME imzalanıyor mu?          EMİN DEĞİL
//   4. Taşıma günü tek muhatap oluyor mu?              EVET
//
// Buradaki her yeni metin (1)'e uyuyor: ölçümün YAPILDIĞINI söylemeye
// devam ediyor, o ölçümün MUTLAKA bir keşif ziyaretiyle yapıldığını
// söylemeyi bırakıyor.
//
// ─────────────────────────────────────────────────────────────────────────
// NE DEĞİŞMİYOR
//
// Bölüm sayısı, sıra, numaralandırma, fotoğraf, başlık kademesi, CTA
// mimarisi, fiyat formülü, şema yapısı — hiçbiri. Yalnız cümleler.
//
// TEK KELİME DEĞİŞİMİ YAPILMIYOR: her cümle kendi anlamına göre yeniden
// kuruldu. "gerektiğinde yerinde değerlendirme" kalıbı da bilerek yalnız
// GERÇEKTEN koşullu olan tek yerde (asansörlü nakliyat) kullanıldı;
// her paragrafa serpiştirilseydi yeni bir klişe üretilmiş olurdu.
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/client/client.ts'

const p = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })
const YALNIZ_DOGRULA = process.argv.slice(2).includes('--dogrula')

const norm = (v) => String(v ?? '').replace(/\s+/g, ' ').trim()
const kucult = (s) => String(s).replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase()

// ═══════════════════════════════════════════ TAM ALAN HİZALAMALARI
// Alanın TAMAMI biliniyor: eski metinlerden birine eşitse yenisi yazılır.

const TAM_ALANLAR = [
  // ── Site Ayarları (yalnız iki açıklama alanı; başka alana dokunulmuyor)
  {
    tablo: 'siteSettings',
    alan: 'siteDescription',
    neden: 'koşulsuz keşif ("keşifte yerinde ölçülür")',
    eski: [
      "İstanbul'da evden eve nakliyat, ofis taşıma, parça eşya, ambalajlama ve marangozlu söküm-kurulum. Erişim ve kat koşulları keşifte yerinde ölçülür.",
    ],
    yeni:
      "İstanbul'da evden eve nakliyat, ofis taşıma, parça eşya, ambalajlama ve marangozlu söküm-kurulum. Plan, iki adresin erişim ve kat koşullarına göre kuruluyor.",
  },
  {
    tablo: 'siteSettings',
    alan: 'metaDescription',
    neden: 'koşulsuz keşif ("kat keşifte ölçülüyor")',
    eski: [
      "İstanbul'un 39 ilçesinde evden eve nakliyat. Araç erişimi, bina girişi ve kat keşifte ölçülüyor; fiyat ve yöntem buna göre planlanıyor.",
    ],
    yeni:
      "İstanbul'un 39 ilçesinde evden eve nakliyat. Fiyat ve yöntem; araç erişimi, bina girişi ve kat durumuna göre planlanıyor.",
  },

  // ── Ana sayfa: süreç defteri
  {
    tablo: 'processStep',
    // Arama anahtarı `order`, `label` DEĞİL: label'ın kendisi değişen alan.
    // `{ label: 'KEŞİF' }` ile arasaydık ikinci koşuda kayıt bulunamaz ve
    // "atlandı" raporlanırdı — oysa iş bitmiş olurdu.
    nerede: { order: 0 },
    alan: 'label',
    neden: 'ZORUNLU SÜREÇ AŞAMASI — keşif her işte yapılmıyor, defterin 01 adımı olamaz',
    eski: ['KEŞİF'],
    yeni: 'ÖN DEĞERLENDİRME',
  },
  {
    tablo: 'processStep',
    nerede: { order: 0 },
    alan: 'description',
    neden: 'koşulsuz ev ziyareti ("Eve gelip … yerinde ölçüyoruz")',
    eski: [
      'Eve gelip hacmi, katı, asansör kabinini ve aracın durabileceği noktayı yerinde ölçüyoruz. Ne taşınacağı kadar nereden çıkarılacağı da plana giriyor; ikisi ayrı sorular değil.',
    ],
    yeni:
      'Hacim, kat, asansör kabini ve aracın durabileceği nokta taşıma gününden önce çıkarılıyor; koşullar telefonda netleşmiyorsa adres yerinde değerlendiriliyor. Ne taşınacağı kadar nereden çıkarılacağı da plana giriyor; ikisi ayrı sorular değil.',
  },
  {
    tablo: 'processStep',
    nerede: { order: 1 },
    alan: 'description',
    neden: 'koşulsuz keşif ("keşifte belirleniyor")',
    eski: [
      'Ahşap yüzey battaniyeye, cam ve tablo sert köşe korumasına, beyaz eşya streç ve bantla sabitlemeye gidiyor. Hangi parçanın hangi malzemeyle sarılacağı keşifte belirleniyor; taşıma günü seçilmiyor.',
    ],
    yeni:
      'Ahşap yüzey battaniyeye, cam ve tablo sert köşe korumasına, beyaz eşya streç ve bantla sabitlemeye gidiyor. Hangi parçanın hangi malzemeyle sarılacağı önceden belirleniyor; taşıma günü seçilmiyor.',
  },

  // ── Ana sayfa: bölüm metinleri
  {
    tablo: 'homeSection',
    nerede: { sectionKey: 'uc-istanbul' },
    alan: 'closingNote',
    neden: 'koşulsuz keşif ("keşiften sonra netleşiyor")',
    eski: [
      'Hangi koşulun geçerli olduğunu adres belirler; ilçe yalnız ipucu verir. Bu yüzden fiyat da yöntem de keşiften sonra netleşiyor.',
    ],
    yeni:
      'Hangi koşulun geçerli olduğunu adres belirler; ilçe yalnız ipucu verir. Bu yüzden fiyat da yöntem de bu koşullar netleştikten sonra çıkıyor.',
  },
  {
    tablo: 'homeSectionItem',
    nerede: { label: 'DAR SOKAK' },
    alan: 'body',
    neden: 'koşulsuz keşif ("Keşifte ölçtüğümüz şey")',
    eski: [
      'Araç bina önüne yanaşamadığında yük, kamyonun durabildiği noktadan kapıya kadar elden taşınır. Bu mesafe on metre de olabilir yetmiş metre de; ekip sayısını ve süreyi doğrudan değiştirir. Keşifte ölçtüğümüz şey sokağın genişliği değil, aracın durabileceği en yakın nokta ile bina girişi arasındaki gerçek yürüme mesafesi.',
    ],
    yeni:
      'Araç bina önüne yanaşamadığında yük, kamyonun durabildiği noktadan kapıya kadar elden taşınır. Bu mesafe on metre de olabilir yetmiş metre de; ekip sayısını ve süreyi doğrudan değiştirir. Burada ölçülen şey sokağın genişliği değil, aracın durabileceği en yakın nokta ile bina girişi arasındaki gerçek yürüme mesafesi.',
  },
  {
    tablo: 'homeSection',
    nerede: { sectionKey: 'fiyat' },
    alan: 'lead',
    neden: 'koşulsuz keşif ("keşifte ölçülen beş değişken")',
    eski: [
      'Telefonda verilen rakam bir tahmindir; keşifte ölçülen beş değişken onu gerçek fiyata çevirir. Aşağıdakiler, aynı büyüklükteki iki evin neden aynı tutmadığını açıklıyor.',
    ],
    yeni:
      'Telefonda verilen rakam bir tahmindir; aşağıdaki beş değişken onu gerçek fiyata çevirir. Aynı büyüklükteki iki evin neden aynı tutmadığını bunlar açıklıyor.',
  },

  // ── Hizmet dizini
  {
    tablo: 'internalPageSection',
    nerede: { pageKey: 'hizmetler', sectionKey: 'birlikte' },
    alan: 'lead',
    neden: 'koşulsuz keşif ("keşifte en sık karşımıza çıkan")',
    eski: [
      'Hizmetler birbirinin alternatifi değil. Aşağıdaki üç durum, keşifte en sık karşımıza çıkan birleşimler.',
    ],
    yeni:
      'Hizmetler birbirinin alternatifi değil. Aşağıdaki üç durum, sahada en sık karşımıza çıkan birleşimler.',
  },
  {
    tablo: 'internalPageItem',
    nerede: { label: 'ERİŞİM' },
    alan: 'body',
    neden: 'koşulsuz keşif ("Keşifte … ölçülüyor")',
    eski: [
      'Taşımanın kendisi standart ilerlerken yalnız o parçalar için dış cephe asansörü kuruluyor. Keşifte hangi parçanın merdivenden geçmediği ölçülüyor.',
    ],
    yeni:
      'Taşımanın kendisi standart ilerlerken yalnız o parçalar için dış cephe asansörü kuruluyor. Hangi parçanın merdivenden geçmediği önceden ölçülüyor.',
  },

  // ── Fiyat aracı
  {
    tablo: 'internalPageSection',
    nerede: { pageKey: 'fiyat', sectionKey: 'giris' },
    alan: 'lead',
    neden: 'koşulsuz keşif ("onlar keşifte ölçülüyor")',
    // ─────────────────────────────────────────────────────────────────
    // BU CÜMLENİN UZUNLUĞU ÖLÇÜLDÜ — KISALTMA KEYFİ DEĞİL.
    //
    // İlk M16B denemesi cümleyi uzatmıştı ("tutar bu koşullar
    // değerlendirildikten sonra netleşiyor", 291 karakter). Ölçüldü, 5
    // koşuda sıfır sapmayla:
    //
    //   uzunluk   CLS @834   CLS @1024
    //   260 (eski)  0,1312     0,1432   ← M16 taban çizgisi
    //   291         0,2205     0,1369
    //   263–267     0,1312     0,1973
    //   259 (yeni)  0,1312     0,1432   ← tabanla birebir
    //
    // Paragraf, iki genişlikte de satır sarma sınırının hemen dibinde
    // duruyor: bir satır eklendiğinde font takası sırasında altındaki
    // hesaplayıcı bölümü daha fazla kayıyor. Bu, bilinen font metrik
    // borcunun kendisi — bu turda ÇÖZÜLMÜYOR, ama BÜYÜTÜLMÜYOR da.
    // Yeni cümle eskisiyle aynı uzunluk sınıfında ve aynı şeyi söylüyor:
    // o koşullar hesaba girmiyor, ayrıca ölçülüyor.
    eski: [
      'Bu araç altı bilgiyle bir aralık üretiyor: ev büyüklüğü, mesafe, iki adresin katı ve asansör durumu, paketleme ve depolama. Adresin kendi koşulları — sokak genişliği, aracın binaya yanaşması, asansör kabininin ölçüsü — hesaba girmiyor; onlar keşifte ölçülüyor.',
      'Bu araç altı bilgiyle bir aralık üretiyor: ev büyüklüğü, mesafe, iki adresin katı ve asansör durumu, paketleme ve depolama. Adresin kendi koşulları — sokak genişliği, aracın binaya yanaşması, asansör kabininin ölçüsü — hesaba girmiyor; tutar bu koşullar değerlendirildikten sonra netleşiyor.',
      'Bu araç altı bilgiyle bir aralık üretiyor: ev büyüklüğü, mesafe, iki adresin katı ve asansör durumu, paketleme ve depolama. Adresin kendi koşulları — sokak genişliği, aracın binaya yanaşması, asansör kabininin ölçüsü — hesaba girmiyor; onlar ayrıca değerlendiriliyor.',
    ],
    yeni:
      'Bu araç altı bilgiyle bir aralık üretiyor: ev büyüklüğü, mesafe, iki adresin katı ve asansör durumu, paketleme ve depolama. Adresin kendi koşulları — sokak genişliği, aracın binaya yanaşması, asansör kabininin ölçüsü — hesaba girmiyor; onlar ayrıca ölçülüyor.',
  },
  {
    tablo: 'internalPageSection',
    nerede: { pageKey: 'fiyat', sectionKey: 'disarida' },
    alan: 'lead',
    neden: 'koşulsuz keşif ("hepsi keşifte ölçülüyor")',
    eski: [
      'Aşağıdakiler tutarı gerçekten değiştiriyor ama bir formüle sığmıyor; hepsi keşifte ölçülüyor. Aralık ile kesinleşen tutar arasındaki fark çoğunlukla buradan doğuyor.',
    ],
    yeni:
      'Aşağıdakiler tutarı gerçekten değiştiriyor ama bir formüle sığmıyor; hepsi adrese özel. Aralık ile kesinleşen tutar arasındaki fark çoğunlukla buradan doğuyor.',
  },

  // ── SSS (yalnız aktif olan; #82 DOKUNULMUYOR, cevabı zaten koşullu)
  {
    tablo: 'faqItem',
    nerede: { question: 'Binada asansör yoksa ne oluyor?' },
    alan: 'answer',
    neden: 'koşulsuz keşif ("keşifte belirleniyor" + "keşif sırasında yansıyor")',
    eski: [
      'Yöntem keşifte belirleniyor: merdivenle taşıma, dış cephe asansörü ya da ikisinin birlikte kullanımı. Hangisinin gerekeceği fiyata keşif sırasında yansıyor.',
    ],
    yeni:
      'Yöntem binanın ve sokağın erişim koşullarına göre belirleniyor: merdivenle taşıma, dış cephe asansörü ya da ikisinin birlikte kullanımı. Hangisinin gerekeceği fiyata doğrudan yansıyor.',
  },

  // ── Hizmet: tek cümlelik alanlar
  {
    tablo: 'service',
    nerede: { slug: 'evden-eve-nakliyat' },
    alan: 'excerpt',
    neden: 'keşif süreç başlangıcı olarak sunuluyor (dizinde ve ilgili hizmetlerde basılıyor)',
    eski: [
      'Keşiften yerleştirmeye kadar taşınmanın bütün aşamaları. Hangi adımda ne yapıldığını ve neyin size, neyin bize ait olduğunu baştan biliyorsunuz.',
    ],
    yeni:
      'İlk görüşmeden yerleştirmeye kadar taşınmanın bütün aşamaları. Hangi adımda ne yapıldığını ve neyin size, neyin bize ait olduğunu baştan biliyorsunuz.',
  },
  {
    tablo: 'service',
    nerede: { slug: 'sehirler-arasi-nakliyat' },
    alan: 'description',
    neden: 'koşulsuz keşif ("keşifte belirleniyor")',
    eski: [
      'İstanbul çıkışlı şehirler arası taşımalarda güzergâh, teslim günü ve ambalaj standardı keşifte belirleniyor.',
    ],
    yeni:
      'İstanbul çıkışlı şehirler arası taşımalarda güzergâh, teslim günü ve ambalaj standardı önceden belirleniyor.',
  },
]

// ═══════════════════════════════════════════ PARÇA HİZALAMALARI
// Hizmet `content` alanları uzun HTML. Tamamını kütüğe kopyalamak hem
// okunmaz olurdu hem de yazının kalan %98'ini bu betiğe bağımlı kılardı.
// Bu yüzden yalnız CÜMLE değiştiriliyor; eşleşme tam dize üzerinden.

const PARCALAR = [
  {
    slug: 'evden-eve-nakliyat',
    alan: 'content',
    degisim: [
      {
        eski: 'Keşifte iki adres ayrı ayrı not ediliyor:',
        yeni: 'İki adres ayrı ayrı not ediliyor:',
      },
      {
        eski: 'bu yüzden keşifte oda oda liste çıkarılıyor',
        yeni: 'bu yüzden oda oda liste çıkarılıyor',
      },
      {
        eski: 'Hangi parçanın hangi malzemeye gideceği keşifte belirleniyor, taşıma sabahı seçilmiyor.',
        yeni: 'Hangi parçanın hangi malzemeye gideceği önceden belirleniyor, taşıma sabahı seçilmiyor.',
      },
      {
        eski: 'Paketlemenin ne kadarını sizin, ne kadarını ekibin yapacağı keşifte konuşuluyor.',
        yeni: 'Paketlemenin ne kadarını sizin, ne kadarını ekibin yapacağı baştan konuşuluyor.',
      },
    ],
  },
  {
    slug: 'asansorlu-nakliyat',
    alan: 'content',
    degisim: [
      {
        eski: 'Keşifte tek bir ölçü değil, birkaç koşul birlikte okunuyor:',
        yeni: 'Tek bir ölçü değil, birkaç koşul birlikte okunuyor:',
      },
      {
        // BU CÜMLE ZATEN KOŞULLU ("gerektirebilecek adreslerde") ve
        // sözleşmenin İZİN verdiği "gerektiğinde yerinde değerlendirme"
        // alanına giriyor. Anlam korunuyor, yalnız yüklü kelime çıkıyor.
        eski: 'Bu yüzden asansör gerektirebilecek adreslerde keşif fotoğraf üzerinden değil yerinde yapılıyor.',
        yeni: 'Bu yüzden asansör gerektirebilecek adreslerde erişim fotoğraf üzerinden değil yerinde değerlendiriliyor.',
      },
    ],
  },
  {
    slug: 'parca-esya-tasima',
    alan: 'content',
    degisim: [
      {
        eski: 'Gün netliği ile maliyet arasında seçim yapmanız gerekiyorsa bunu keşifte açıkça konuşuyoruz.',
        yeni: 'Gün netliği ile maliyet arasında seçim yapmanız gerekiyorsa bunu baştan açıkça konuşuyoruz.',
      },
    ],
  },
  {
    slug: 'esya-depolama',
    alan: 'content',
    degisim: [
      {
        eski: 'Keşifte bakılan şey şu:',
        yeni: 'Burada bakılan şey şu:',
      },
    ],
  },
  {
    slug: 'sehirler-arasi-nakliyat',
    alan: 'content',
    degisim: [
      {
        eski: 'ikisi de keşifte açıkça konuşuluyor.',
        yeni: 'ikisi de baştan açıkça konuşuluyor.',
      },
    ],
  },
]

// ═══════════════════════════════════════════ HİZMET SSS'LERİ (JSON alan)
//
// `Service.faqs` bir JSON sütunu; ilk envanterde string alanlar tarandığı
// için gözden kaçtı ve SSR sayımında ortaya çıktı. Bu cevaplar sayfada
// görünmekle kalmıyor, hizmet detayının `FAQPage` JSON-LD'sini de
// besliyor — yani iddia arama sonucunda da yer alıyordu.

const SSS_DEGISIMLERI = [
  {
    slug: 'evden-eve-nakliyat',
    degisim: [
      {
        eski: 'Ne kadarının kimde kaldığı keşifte konuşuluyor.',
        yeni: 'Ne kadarının kimde kaldığı baştan konuşuluyor.',
      },
      {
        eski: 'Kırılabilir ve yüksek değerli parçalar keşifte ayrı listeleniyor, ambalajları ayrı yapılıyor.',
        yeni: 'Kırılabilir ve yüksek değerli parçalar önceden ayrı listeleniyor, ambalajları ayrı yapılıyor.',
      },
      {
        eski: 'Keşifte gördüğümüz koşullar değişmediği sürece hayır.',
        yeni: 'Baştan konuşulan koşullar değişmediği sürece hayır.',
      },
    ],
  },
  {
    slug: 'asansorlu-nakliyat',
    degisim: [
      {
        // "keşifte belirtiliyor" düştü; kalemin teklifte ayrı gösterildiği
        // bilgisi — asıl cevap — aynen duruyor.
        eski: 'Asansör gerekiyorsa keşifte belirtiliyor ve teklifte ayrı kalem olarak gösteriliyor.',
        yeni: 'Asansör gerekiyorsa teklifte ayrı kalem olarak gösteriliyor.',
      },
    ],
  },
  {
    slug: 'parca-esya-tasima',
    degisim: [
      {
        eski: 'karar keşifte veriliyor.',
        yeni: 'karar erişim koşullarına göre veriliyor.',
      },
    ],
  },
  {
    slug: 'ofis-tasima',
    degisim: [
      {
        eski: 'Kesin rakam yerinde keşif sonrası netleşiyor.',
        yeni: 'Kesin rakam, taşıma koşulları değerlendirildikten sonra netleşiyor.',
      },
    ],
  },
  {
    slug: 'sehirler-arasi-nakliyat',
    degisim: [
      {
        eski: 'Yol ve mevsim koşullarının plana nasıl girdiğini keşifte birlikte çıkarıyoruz.',
        yeni: 'Yol ve mevsim koşullarının plana nasıl girdiğini önceden birlikte çıkarıyoruz.',
      },
    ],
  },
  {
    slug: 'paketleme-hizmeti',
    degisim: [
      {
        eski: 'Ne kadar malzeme gerektiğini eşya listesine göre keşifte hesaplıyoruz.',
        yeni: 'Ne kadar malzeme gerektiğini eşya listesine göre önceden hesaplıyoruz.',
      },
    ],
  },
]

// ═══════════════════════════════════════════ ÖN KONTROL

const YASAKLI = [
  'keşif', 'keşfi', 'keşfe', 'keşift', 'keşiften',
  'yazılı', 'yazıya dök', 'sözleşme',
  'ücretsiz', 'garanti', 'sigortal', 'kesin fiyat', 'sabit fiyat', '%100',
  '7/24', 'kesinlikle', 'her koşulda',
]

console.log('═══ ÖN KONTROL — yeni metinlerde doğrulanmamış iddia')
let kirli = 0
const yeniler = [
  ...TAM_ALANLAR.map((k) => [k.alan, k.yeni]),
  ...PARCALAR.flatMap((s) => s.degisim.map((d) => [`${s.slug}.${s.alan}`, d.yeni])),
  ...SSS_DEGISIMLERI.flatMap((s) => s.degisim.map((d) => [`${s.slug}.faqs`, d.yeni])),
]
for (const [ad, metin] of yeniler) {
  const iz = YASAKLI.filter((y) => kucult(metin).includes(kucult(y)))
  if (iz.length) { kirli++; console.log(`  ⚑ ${ad}: ${iz.join(', ')}`) }
}
console.log(kirli ? `  ${kirli} alanda iz var — YAZILMAYACAK` : `  temiz (${yeniler.length} metin)`)
if (kirli) { await p.$disconnect(); process.exit(1) }

let yazilan = 0
let atlanan = 0
let korunan = 0

// ═══════════════════════════════════════════ TAM ALANLAR

console.log('\n═══ TAM ALAN HİZALAMALARI')
for (const k of TAM_ALANLAR) {
  const model = p[k.tablo]
  const kayit = k.nerede
    ? await model.findFirst({ where: k.nerede })
    : await model.findFirst()
  const ad = `${k.tablo}${k.nerede ? '(' + Object.values(k.nerede).join(',').slice(0, 34) + ')' : ''}.${k.alan}`
  if (!kayit) { atlanan++; console.log(`  ${ad}: kayıt yok — atlandı`); continue }

  const simdi = norm(kayit[k.alan])
  if (simdi === norm(k.yeni)) { korunan++; console.log(`  ${ad}: zaten güncel`); continue }
  if (!k.eski.some((e) => norm(e) === simdi)) {
    atlanan++
    console.log(`  ${ad}: ELLE YAZILMIŞ — EZİLMEDİ`)
    console.log(`    mevcut: ${simdi.slice(0, 110)}…`)
    continue
  }
  console.log(`  ${ad}: ${k.neden}`)
  console.log(`    ÖNCE : ${simdi}`)
  console.log(`    SONRA: ${norm(k.yeni)}`)
  if (!YALNIZ_DOGRULA) await model.update({ where: { id: kayit.id }, data: { [k.alan]: k.yeni } })
  yazilan++
}

// ═══════════════════════════════════════════ PARÇALAR

console.log('\n═══ HİZMET METNİ İÇİ CÜMLE HİZALAMALARI')
for (const s of PARCALAR) {
  const kayit = await p.service.findFirst({ where: { slug: s.slug } })
  if (!kayit) { atlanan++; console.log(`  ${s.slug}: kayıt yok — atlandı`); continue }

  let govde = kayit[s.alan]
  let degisti = 0
  for (const d of s.degisim) {
    if (govde.includes(d.eski)) {
      govde = govde.split(d.eski).join(d.yeni)
      degisti++
      console.log(`  ${s.slug}: "${d.eski.slice(0, 62)}…"`)
      console.log(`         → "${d.yeni.slice(0, 62)}…"`)
    } else if (govde.includes(d.yeni)) {
      korunan++
    } else {
      atlanan++
      console.log(`  ${s.slug}: CÜMLE BULUNAMADI — elle değiştirilmiş olabilir, EZİLMEDİ`)
      console.log(`         aranan: "${d.eski.slice(0, 72)}…"`)
    }
  }
  if (degisti && !YALNIZ_DOGRULA) {
    await p.service.update({ where: { id: kayit.id }, data: { [s.alan]: govde } })
  }
  if (degisti) yazilan += degisti
}

// ═══════════════════════════════════════════ HİZMET SSS'LERİ

console.log('\n═══ HİZMET SSS CEVAPLARI (JSON alan — FAQPage şemasını da besliyor)')
for (const s of SSS_DEGISIMLERI) {
  const kayit = await p.service.findFirst({ where: { slug: s.slug } })
  if (!kayit) { atlanan++; console.log(`  ${s.slug}: kayıt yok — atlandı`); continue }

  // JSON sütunu: metni dize üzerinde değiştirip yapıyı geri kuruyoruz.
  // Böylece soru sırası, anahtar adları ve diğer alanlar aynen kalıyor.
  const ham = JSON.stringify(kayit.faqs ?? null)
  let yeniHam = ham
  let degisti = 0
  for (const d of s.degisim) {
    // JSON içinde tırnak kaçışları olabileceği için kaçırılmış hâli aranıyor.
    const eskiJson = JSON.stringify(d.eski).slice(1, -1)
    const yeniJson = JSON.stringify(d.yeni).slice(1, -1)
    if (yeniHam.includes(eskiJson)) {
      yeniHam = yeniHam.split(eskiJson).join(yeniJson)
      degisti++
      console.log(`  ${s.slug}: "${d.eski.slice(0, 60)}…"`)
      console.log(`         → "${d.yeni.slice(0, 60)}…"`)
    } else if (yeniHam.includes(yeniJson)) {
      korunan++
    } else {
      atlanan++
      console.log(`  ${s.slug}: CÜMLE BULUNAMADI — EZİLMEDİ`)
      console.log(`         aranan: "${d.eski.slice(0, 70)}…"`)
    }
  }
  if (degisti && !YALNIZ_DOGRULA) {
    await p.service.update({ where: { id: kayit.id }, data: { faqs: JSON.parse(yeniHam) } })
  }
  if (degisti) yazilan += degisti
}

console.log(
  `\n═══ SONUÇ  ${YALNIZ_DOGRULA ? 'yazılacak' : 'yazıldı'}: ${yazilan} · zaten güncel: ${korunan} · atlanan: ${atlanan}`
)
console.log('DOKUNULMAYAN: SSS#82 (cevabı zaten koşullu), ctaLabel, bölge metinleri (yarışmada 404),')
console.log('              blog yazıları, fiyat formülü, bölüm sayısı/sırası, görseller, CTA mimarisi')

await p.$disconnect()
