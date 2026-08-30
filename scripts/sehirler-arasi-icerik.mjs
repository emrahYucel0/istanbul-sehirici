// ŞEHİRLER ARASI NAKLİYAT (#78) — İÇERİK OTORİTESİ TURU
//
// NEDEN
// M4 denetimi bu sayfayı 8.0 verdi. Tezi ("belirleyici olan mesafe değil,
// eşyanın yolda geçirdiği süre") ailenin en iyi açılışlarından biriydi ama
// üç sorun ölçülmüştü:
//
//   1. "VARIŞTA" PARAGRAFI GENERIC — marka adı çıkarılınca herhangi bir
//      nakliyat sitesine aynen taşınabiliyordu.
//   2. SİGORTA FAQ CEVABI #73 İLE BİREBİR AYNIYDI — yedi hizmet arasında
//      ölçülen tek metin tekrarı buydu.
//   3. COĞRAFİ DOLGU — "Zigana ve Pozantı" örnekleri İstanbul çıkışlı bir
//      firmanın karar mantığına katkı sağlamıyor, dağınık coğrafya
//      okunuyordu (aynı sorunun bir başka biçimi #74'te temizlenmişti).
//
// NÖTRLEŞTİRİLENLER
//   · "Özel araçla yapılan taşımalarda teslim günü NET VERİLİYOR"
//     → "plan tek bir teslim gününe bağlanabiliyor" (kesinlik → imkân)
//   · "Osmangazi Köprüsü süreyi BELİRGİN kısaltıyor ve köprü ücreti
//     teklifte ayrı kalem olarak gösteriliyor"
//     → belirli bir köprünün kullanıldığı ve etkisinin büyüklüğü iddiası
//       çıktı; kalan bilgi "ücretli geçiş kullanılıyorsa ücreti ayrı kalem
//       olarak görünüyor" — koşullu ve doğrulanabilir
//   · "yolda kalmaktansa bir gün beklemek HER ZAMAN daha doğru"
//     → kategorik ifade çıktı
//   · "çoğu güzergâh TEK GÜNDE tamamlanıyor, uzak mesafelerde teslim
//     ERTESİ GÜNE kalabiliyor"
//     → gün sayısı çıktı; süreyi neyin belirlediği kaldı
//   · "iki saat / ON SAAT araçta kalıyor"
//     → uydurulmuş süre sayıları çıktı; "birkaç saat / saatlerce" kaldı
//   · includes "Parsiyel (paylaşımlı) EKONOMİK seçenek"
//     → "Özel araç ya da paylaşımlı sefer seçeneği" (#75 ile tutarlı)
//   · imageAlt "Nakliyat aracımız yolda il dışı taşıma gerçekleştirirken"
//     → bozuk dilbilgisi düzeldi, karede gerçekten olan yazıldı
//
// AKTARMA — BİLEREK YAZILMADI
// Şehirler arası bir işte yükün yol üzerinde araç değiştirip
// değiştirmediği CMS'te HİÇBİR YERDE geçmiyor (yedi hizmet kaydı tarandı;
// tek "aktarma" isabeti #73'teki dar sokak servisi ve #79'daki askılık
// kutusu). Bu yüzden "aktarma olur" da "olmaz" da yazılmadı; paylaşımlı
// seferin plana etkisi, kaydın kendi ifadesiyle sınırlı tutuldu ("araç
// güzergâh üzerindeki başka duraklara da uğruyor").
//
// İKİNCİ TURDA ÜÇ MİKRO DÜZELTME
//   · "bekleyen BİR GÜN, yolda kalan bir araçtan DAHA AZ SORUN ÇIKARIYOR"
//     → iki ayrı sorun vardı: yazıyla yazılmış bir süre ("bir gün") ve
//       ölçülmemiş bir karşılaştırma. İkisi de çıktı; cümlenin amacı
//       (olumsuz koşulda hareket zamanının yeniden planlanabilmesi) kaldı.
//   · "Ahşap birleşim yerleri GEVŞİYOR, cam ve ayna yüzeyleri baskıya daha
//     duyarlı HÂLE GELİYOR" → "gevşeyebiliyor" / "olabiliyor". Her uzun
//     yolda kesin olarak olan bir şey gibi okunuyordu; oysa parçaya,
//     ambalaja ve yola göre değişiyor. Yeni teknik iddia eklenmedi,
//     yalnız kip koşullu yapıldı.
//   · metaDescription "teslim KARARI" → "teslim PLANI".
//
// YAZIYLA YAZILMIŞ SÜRELER — bilerek belirsiz bırakılanlar
// "birkaç saat", "bütün gün", "saatlerce", "saatler boyunca" ifadeleri
// KALDI. Bunlar bir taahhüt değil, uzun yol ile şehir içi arasındaki
// büyüklük farkını anlatan karşılaştırmalar; sayı vermemek için bilerek
// böyle yazıldılar ("iki saat / on saat" onların yerini almıştı).
//
// "YAZIL-" KÖKÜ BİLEREK HİÇ KULLANILMADI
// "yükleme sırasına baştan YAZILIYOR" cümlesi teknik olarak yanlış pozitif
// (fiil, taahhüt değil) ama bu sayfada "yazılı teslim" M2'de temizlenmiş
// gerçek bir iddiaydı. Kelime "işleniyor" ile değiştirildi ki gelecekteki
// taramalar bu kayıtta hiç isabet vermesin.
//
// "AYNI EKİP" KULLANILMADI
// Varış bölümünde doğal görünen "sökülen mobilya aynı ekip tarafından
// kuruluyor" ifadesi bilerek yazılmadı: aynı ifade M2'de #77'den
// doğrulanamadığı için çıkarılmıştı.
//
// NE DEĞİŞMİYOR ve NEDEN
//   title / H1     bozulmuyor
//   metaTitle      M2'de kurulan niyet ayrımı korunuyor
//   subtitle       "İstanbul çıkışlı, planlı teslim" — /hizmetlerimiz
//                  dizininde de basılıyor, o sayfa FREEZE
//   excerpt        ÖLÇÜLDÜ: dizin ve ana sayfa hizmet kartında görünüyor
//   description    herkese açık hiçbir yerde basılmıyor
//   imagePath      görsel uygun; yalnız alt metni düzeliyor
//
// KULLANIM
//   node --env-file=.env scripts/sehirler-arasi-icerik.mjs          (uygula)
//   node --env-file=.env scripts/sehirler-arasi-icerik.mjs --geri   (eskiye dön)
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../prisma/generated/client/client.ts'

const YEDEK = 'scripts/.sehirler-arasi-icerik-onceki.json'
const SLUG = 'sehirler-arasi-nakliyat'

const CONTENT = `<p>Şehirler arası taşımada belirleyici olan mesafe değil, eşyanın yolda geçirdiği süre ve o süre boyunca maruz kaldığı koşullar. Aynı eşya şehir içinde birkaç saat, uzun yolda bütün gün araçta kalabiliyor; titreşim ve sıcaklık değişimi bu sürede birikiyor. Plan da mesafeye değil bu süreye göre kuruluyor.</p>

<h3>Yolda geçen süre</h3>
<p>Şehir içi bir taşımada eşya araca giriyor ve kısa süre sonra iniyor. Uzun yolda ise aynı eşya saatlerce sürekli bir titreşimin ve gün içinde değişen sıcaklığın altında kalıyor. Ahşap birleşim yerleri gevşeyebiliyor, cam ve ayna yüzeyleri baskıya daha duyarlı olabiliyor.</p>
<p>Bu yüzden şehirler arası bir işte hazırlık, taşımanın kendisi kadar yer tutuyor. Araca yükleme başlamadan önce hangi parçanın nasıl korunacağı ve araç içinde nereye geleceği belli oluyor; yolda düzeltme şansı yok.</p>

<h3>Ambalajda ne değişiyor</h3>
<p>Mobilya köşeleri ek koruma alıyor, cam ve ayna yüzeyleri çift kat sarılıyor, kutular araç içinde birbirine yaslanacak biçimde istifleniyor. Boşluk kalan yerler dolduruluyor: yolda kayan bir kutu saatler boyunca yanındaki parçaya vuruyor.</p>
<p>Sabitleme de şehir içine göre farklı. Yük, tek bir frenlemeye değil yolun sürekli titreşimine göre bağlanıyor; kemer sayısı ve bağlama noktaları buna göre artıyor. Hangi parçanın hangi malzemeye gideceği eşya listesi çıktıktan sonra belirleniyor — <a href="/paketleme-hizmeti">paketleme</a> tarafında ayrıntılı anlatılıyor.</p>

<h3>Araç ve teslim planı</h3>
<p>İki model var. Özel araçta araç yalnız sizin işinize göre planlanıyor; plan tek bir teslim gününe bağlanabiliyor.</p>
<p>Paylaşımlı seferde ise araç güzergâh üzerindeki başka duraklara da uğruyor. Bu durumda tek gün yerine gün aralığı bildiriliyor, çünkü takvim yalnız sizin adresinize bağlı değil.</p>
<p>Hangisini seçtiğiniz hem maliyeti hem tarih netliğini etkiliyor ve ikisi de keşifte açıkça konuşuluyor. Taşınacak şey bir evin tamamı değil de birkaç parçaysa <a href="/parca-esya-tasima">parça eşya taşıma</a> tarafındaki paylaşımlı sefer mantığı da geçerli oluyor.</p>

<h3>Güzergâh ve mevsim</h3>
<p>Güzergâh yalnız mesafeye göre değil yol koşullarına göre seçiliyor. İstanbul çıkışında ücretli geçiş kullanmak süreyi kısaltabiliyor; kullanılıyorsa geçiş ücreti teklifte ayrı kalem olarak görünüyor, toplam rakamın içinde kaybolmuyor.</p>
<p>Kış aylarında Bolu Dağı gibi rakımlı geçitlerde yol durumu çıkıştan önce kontrol ediliyor. Koşullar uygun değilse hareket zamanı yeniden planlanıyor ve bu önceden bildiriliyor; yola çıkma kararı yol ve hava durumuna göre veriliyor.</p>

<h3>İki adres, iki koşul</h3>
<p>Çıkış ve varış adresinin erişim koşulları ayrı ayrı soruluyor: kat, asansör kabininin ölçüsü, merdiven ve aracın kapıya ne kadar yaklaşabildiği. Şehirler arası işte bu ikisi çoğu zaman birbirinden çok farklı çıkıyor — İstanbul'da dar sokaklı bir apartmandan çıkan ev, varışta geniş otoparklı bir siteye girebiliyor ya da tersi.</p>
<p>Fark yalnız süreyi değil yükleme sırasını da değiştiriyor. Varışta önce inmesi gereken parça çıkışta en son yükleniyor; varış adresinde asansör yoksa ağır parçaların sırası da buna göre kuruluyor. Bu karar İstanbul'da, araç yüklenirken veriliyor.</p>

<h3>Varışta ne oluyor</h3>
<p>Boşaltma, varış adresinin koşuluna göre planlanıyor. Aracın kapıya yanaşamadığı bir adreste boşaltma daha uzun sürüyor ve bu, çıkıştaki yükleme sırasına baştan işleniyor — uzun yolun sonunda sürpriz çıkmasın diye.</p>
<p>Sökülen mobilya varışta yeniden kuruluyor, eşya odalara göre yerleştiriliyor ve ambalaj atıkları toplanıp götürülüyor. Yeni şehirde ayrıca marangoz ya da montajcı aramanız gerekmiyor; taşınmanın yorucu kısmı çoğu zaman burada başlıyor.</p>`

/**
 * Altı madde. Beşi olduğu gibi kaldı; sırf farklı olsun diye hiçbiri
 * değiştirilmedi.
 *
 * 5. maddeden "ekonomik" çıktı: doğrulanmamış bir maliyet iddiasıydı ve
 * aynı ifade #75'te de temizlenmişti. Yerine gerçekten sunulan şey yazıldı.
 */
const INCLUDES = [
  'İstanbul çıkışlı tek yön ya da gidiş-dönüş',
  'Uzun yol için yükseltilmiş ambalaj standardı',
  'Teslim günü ya da gün aralığı planı',
  'Güzergâh ve mola planı',
  'Özel araç ya da paylaşımlı sefer seçeneği',
  'Varışta yerleştirme ve montaj',
]

/**
 * Beş soru. İkisi konu olarak korundu, ikisi yeniden yazıldı, biri değişti:
 *
 *   YENİDEN  "kaç gün sürüyor?" — cevaptaki "tek günde / ertesi güne"
 *            gün sayıları çıktı; süreyi NEYİN belirlediği kaldı.
 *   YENİDEN  "sigortalı mı?" — cevabı #73 ile BİREBİR AYNIYDI. Artık uzun
 *            yolun kendi risk koşulundan başlıyor; sigorta kapsamı ya da
 *            garanti iddiası eklenmedi.
 *   ÇIKAN    "Varışta eşyalarımı yerleştiriyor musunuz?" — cevabı gövdedeki
 *            varış bölümünün kısaltılmışıydı, yeni bilgi taşımıyordu.
 *   GİREN    "Uzun yolda ambalaj neden farklı?" — sayfanın tezinin doğrudan
 *            karşılığı ve keşif öncesi gerçekten sorulan soru.
 *   Kış sorusunda Zigana ve Pozantı ile "her zaman" çıkarıldı.
 */
const FAQS = [
  {
    question: 'Şehirler arası taşıma ne kadar sürüyor?',
    answer:
      'Süreyi mesafe kadar araç modeli belirliyor. Özel araçta plan tek bir teslim gününe bağlanabiliyor; paylaşımlı seferde gün aralığı veriliyor. Kesin planı güzergâh ve araç tipi belli olduktan sonra çıkarıyoruz.',
  },
  {
    question: 'Hangi illere taşıma yapıyorsunuz?',
    answer:
      'Taşımalar İstanbul çıkışlı planlanıyor; varış ili güzergâha göre değerlendiriliyor. Yol ve mevsim koşullarının plana nasıl girdiğini keşifte birlikte çıkarıyoruz.',
  },
  {
    question: 'Uzun yolda ambalaj neden farklı?',
    answer:
      'Eşya araçta çok daha uzun süre kalıyor ve sürekli titreşime maruz oluyor. Köşe koruması artıyor, cam yüzeyler çift kat sarılıyor, yük boşluk kalmayacak biçimde istiflenip kemerle bağlanıyor.',
  },
  {
    question: 'Eşyalarım sigortalı mı taşınıyor?',
    answer:
      'Uzun yolun risk koşulları şehir içinden farklı: yük araçta daha uzun kalıyor ve sürekli titreşim altında. Sorumluluğumuzun kapsamını taşımadan önce netleştiriyoruz; yüksek değerli parçalar ayrı listeleniyor.',
  },
  {
    question: 'Kış aylarında uzun yol taşıması yapılıyor mu?',
    answer:
      'Yapılıyor. Bolu Dağı gibi rakımlı geçitlerde yol durumu çıkıştan önce kontrol ediliyor. Koşullar uygun değilse tarih öteleniyor ve bu önceden bildiriliyor.',
  },
]

/**
 * 154 karakter. Eski açıklama ne yapıldığını sayıyordu ("ambalaj standardı
 * yükseliyor, teslim günü bir aralık olarak bildiriliyor"); bu, sayfanın
 * tezini söylüyor. "İstanbul çıkışlı" konumlandırması korundu.
 */
const META_DESCRIPTION =
  'Şehirler arası taşımada belirleyici olan yalnız mesafe değil, eşyanın yolda geçirdiği süre. İstanbul çıkışlı planda ambalaj, araç modeli ve teslim planı.'

/**
 * Görsele bakılarak yazıldı: alacakaranlıkta otoyolda ilerleyen kapalı kasa
 * araç, üstünde mavi yön levhası gantrisi, arka planda dağ silüeti.
 * Reklam sıfatı yok, karede olmayan yok.
 */
const IMAGE_ALT = 'Kapalı kasa nakliyat aracı şehirler arası otoyolda, arkasında yön levhaları ve dağ silüeti'

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })
const bolum = await db.services.findFirst({ include: { services: true } })
if (!bolum) throw new Error('Services bölümü bulunamadı')
const kayit = bolum.services.find((s) => s.slug === SLUG)
if (!kayit) throw new Error(`#${SLUG} kaydı bulunamadı`)

if (process.argv.includes('--geri')) {
  if (!existsSync(YEDEK)) throw new Error(`Yedek yok: ${YEDEK}`)
  const y = JSON.parse(readFileSync(YEDEK, 'utf8'))
  await db.service.update({ where: { id: y.id }, data: y.eski })
  console.log(`geri  #${y.id} ${y.slug} — ${Object.keys(y.eski).join(', ')}`)
} else {
  const eski = {
    content: kayit.content,
    includes: kayit.includes,
    faqs: kayit.faqs,
    metaDescription: kayit.metaDescription,
    imageAlt: kayit.imageAlt,
  }
  // Yedek BİR KEZ yazılıyor: betik ikinci kez çalıştırılırsa güncellenmiş
  // değerler orijinalin üstüne yazılmasın diye.
  if (!existsSync(YEDEK)) {
    writeFileSync(YEDEK, JSON.stringify({ id: kayit.id, slug: kayit.slug, eski }, null, 1), 'utf8')
    console.log(`Eski değerler ${YEDEK} içine yazıldı.`)
  } else {
    console.log(`Yedek zaten var, korunuyor: ${YEDEK}`)
  }

  await db.service.update({
    where: { id: kayit.id },
    data: {
      content: CONTENT,
      includes: INCLUDES,
      faqs: FAQS,
      metaDescription: META_DESCRIPTION,
      imageAlt: IMAGE_ALT,
    },
  })

  const kelime = (s) => String(s).replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
  const h3 = [...CONTENT.matchAll(/<h3[^>]*>([^<]*)<\/h3>/g)].map((m) => m[1])
  console.log(`\n#${kayit.id} ${kayit.slug} güncellendi`)
  console.log(`  content          ${String(eski.content).length} → ${CONTENT.length} kar · ${kelime(eski.content)} → ${kelime(CONTENT)} kelime`)
  console.log(`  h3               ${(String(eski.content).match(/<h3/g) || []).length} → ${h3.length} · en uzun ${Math.max(...h3.map((x) => x.length))} kar`)
  console.log(`  paragraf         ${(String(eski.content).match(/<p>/g) || []).length} → ${(CONTENT.match(/<p>/g) || []).length}`)
  console.log(`  includes         ${eski.includes.length} → ${INCLUDES.length}`)
  console.log(`  faqs             ${eski.faqs.length} → ${FAQS.length} · cevap ${Math.min(...FAQS.map((f) => f.answer.length))}–${Math.max(...FAQS.map((f) => f.answer.length))} kar`)
  console.log(`  metaDescription  ${String(eski.metaDescription).length} → ${META_DESCRIPTION.length} kar`)
  console.log(`  imageAlt         ${String(eski.imageAlt).length} → ${IMAGE_ALT.length} kar`)
  console.log('\nGeri almak için: node --env-file=.env scripts/sehirler-arasi-icerik.mjs --geri')
}

await db.$disconnect()
