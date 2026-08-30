// EVDEN EVE NAKLİYAT (#73) — İÇERİK OTORİTESİ TURU
//
// NEDEN
// M1 denetiminde ölçüldü: sayfanın 527 kelimelik public metninde "İstanbul"
// SIFIR kez geçiyordu, hacim/m³ bilgisi hiç yoktu ve `content`in yaklaşık
// %35'i marka adı çıkarıldığında herhangi bir nakliyat sitesine oturan
// jenerik süreç anlatımıydı. Daha da ters olanı: ana sayfanın SÜREÇ bölümü
// ("hacmi, katı, asansör kabinini ve aracın durabileceği noktayı ölçüyoruz")
// hizmetin KENDİ sayfasından daha zengindi.
//
// NE DEĞİŞİYOR
//   content         yeniden yazıldı — altı adım korundu, içerik değişti
//   includes        altı madde somutlaştırıldı (dördü değişti, ikisi kaldı)
//   faqs            beş soru; ikisi değişti, üçü kısaltıldı
//   metaDescription sayfanın tezini söyleyecek biçimde yenilendi
//
// NE DEĞİŞMİYOR ve NEDEN
//   title / H1      SEO için bozulmuyor
//   metaTitle       M2'de kurulan niyet ayrımı korunuyor
//                   (ana sayfa = coğrafi/ticari, detay = bilgi)
//   subtitle        /hizmetlerimiz dizininde ve ana sayfada da görünüyor;
//                   ikisi de FREEZE
//   excerpt         AYNI GEREKÇE — üç yerde birden basılıyor (detay girişi,
//                   dizin satırı, ana sayfa hizmet kartı). Dondurulmuş iki
//                   sayfanın görünen metnini değiştirmemek için elleniyor.
//   description     herkese açık hiçbir yerde basılmıyor (yalnız JSON-LD
//                   yedeği, o da `excerpt`in arkasında). Ölü veriyi
//                   değiştirmek gürültü olurdu.
//   imagePath/Alt   görsel bu turun konusu değil
//
// YAZIM KURALLARI (her paragrafta uygulandı)
//   · Ana sayfa SÜREÇ ve FİYAT cümleleri KOPYALANMADI. Aynı konular
//     (hacim, erişim, ambalaj, istif) orada FİYATI açıklıyor; burada
//     PLANIN nasıl kurulduğunu açıklıyor.
//   · Genelleme yok: "koşula göre", "gerekiyorsa", "bazı adreslerde".
//     İstanbul'da her bina aynı değil ve metin öyle davranmıyor.
//   · Taahhüt yok: yazılı teklif/sözleşme, sabit fiyat, %100 sigorta,
//     hasarsız taşıma, ücretsiz keşif, kesin süre — hiçbiri geçmiyor.
//   · Sektör kalıbı yok: "profesyonel ekip", "müşteri memnuniyeti",
//     "kaliteli hizmet", "uzman kadro", "güvenilir nakliyat" — hiçbiri yok.
//
// BAŞLIK UZUNLUĞU BİR TASARIM KISITI
// `ServiceView` şablonundaki sağ teknik marj, gövdenin `<h3>` başlıklarını
// okuyor (M2). Başlıklar 26 karakteri geçmiyor ki 1024'te marj sütununda
// ikinci satıra taşmasın.
//
// KULLANIM
//   node --env-file=.env scripts/evden-eve-icerik.mjs          (uygula)
//   node --env-file=.env scripts/evden-eve-icerik.mjs --geri   (eskiye dön)
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../prisma/generated/client/client.ts'

const YEDEK = 'scripts/.evden-eve-icerik-onceki.json'
const SLUG = 'evden-eve-nakliyat'

const CONTENT = `<p>Bir ev taşıması tek bir hareket değil, iki ayrı adresin aynı gün üst üste çözülmesi. Çıkıştaki koşul girişte tekrar etmiyor: dar bir sokaktan çıkıp geniş otoparklı bir siteye giren taşıma ile tersi, aynı eşyayla bile aynı işi gerektirmiyor. İstanbul'da bu farkı büyüten şey de mesafe değil, iki adresin erişim koşulları oluyor. Aşağıda planın hangi kararlardan geçtiğini ve hangi bilginin ne zaman gerektiğini anlatıyoruz.</p>

<h3>1. İki adresi ayrı okumak</h3>
<p>Keşifte iki adres ayrı ayrı not ediliyor: aracın kapıya kaç metre yaklaşabildiği, giriş kapısı ile koridorun ölçüsü, kat, asansör kabininin iç derinliği ve merdiven sahanlığının dönüş payı. Bu altı başlık iki adreste nadiren aynı çıkıyor.</p>
<p>Fark, işin hangi uçta ağırlaştığını belirliyor. Zemin kattan asansörsüz dördüncü kata taşınan bir evde yükün büyük kısmı giriş adresinde toplanıyor; tersi durumda çıkış adresi belirleyici oluyor. Ekip sayısı ve gün içindeki saat dağılımı buna göre kuruluyor.</p>

<h3>2. Hacim ve büyük parçalar</h3>
<p>Eşya hacmi oda sayısından çıkmıyor. Dolapların doluluğu, balkon ve depo, mutfak ile kitap miktarı toplamı belirliyor; bu yüzden keşifte oda oda liste çıkarılıyor ve gardırop, köşe takımı, ranza, piyano gibi büyük parçalar ayrıca işaretleniyor.</p>
<p>Hacim ambalajdan sonra büyüyor: koli, battaniye ve köşe koruması eklendiğinde toplam artıyor, o yüzden araç ambalajlı hacme göre seçiliyor. Toplam küçük olsa bile tek bir büyük parça araç tipini değiştirebiliyor — iki metrelik bir köşe takımı, aynı hacimdeki kolilerden daha zor yerleşiyor.</p>
<p>Hacim tek başına fiyat demek değil. Erişim, kat, iki adres arasındaki mesafe ve söküm gerektiren parça sayısı onunla birlikte okunuyor; kaba bir aralık için <a href="/fiyat-hesaplama">fiyat hesaplama aracı</a> bu değişkenleri birlikte alıyor.</p>

<h3>3. Erişim yöntemi</h3>
<p>Eşyanın binadan nasıl çıkacağı üç seçenekten birine iniyor: merdiven, bina asansörü ya da dış cephe asansörü. Kararı kat değil geometri veriyor. Asansör kabininin derinliği ve merdiven sahanlığının dönüş payı, hangi parçanın geçip geçmeyeceğini belirliyor; kapıdan rahat geçen bir gardırop sahanlıkta dönemeyebiliyor.</p>
<p>Merdiven boşluğuna sığmayan parçalar için <a href="/asansorlu-nakliyat">dış cephe asansörü</a> gerekiyor. Bu durumda aracın ve asansörün duracağı alanın taşıma saatinde boş olması gerekiyor — İstanbul'un dar sokaklı ve çift sıra parkın yoğun olduğu semtlerinde bu, taşımanın kendisi kadar plan istiyor.</p>
<p>Sitelerde ayrıca yönetimin verdiği taşınma saati ve yük asansörü sırası var. İkisi de gün içindeki pencereyi daraltabildiği için tarih verilirken hesaba katılıyor.</p>

<h3>4. Ambalaj ve söküm planı</h3>
<p>Ambalaj standardı eve göre değil parçaya göre değişiyor: cam, tablo ve mermer sert köşe koruması, ahşap yüzey battaniye, beyaz eşya sabitleme istiyor. Hangi parçanın hangi malzemeye gideceği keşifte belirleniyor, taşıma sabahı seçilmiyor.</p>
<p>Söküm listesi de geometriden çıkıyor: kapıdan ya da sahanlıktan geçmeyen gardırop, köşe takımı ve ranza sökülüyor, vidaları kendi parçasının torbasında etiketleniyor. Listedeki her parça varışta kurulum süresi demek; bu yüzden söküm listesi hem günün uzunluğunu hem ekip sayısını etkiliyor.</p>
<p>Paketlemenin ne kadarını sizin, ne kadarını ekibin yapacağı keşifte konuşuluyor. Yalnız kırılabilirler bize kalabiliyor ya da <a href="/paketleme-hizmeti">paketlemenin tamamı</a> plana girebiliyor.</p>

<h3>5. Araç ve yükleme sırası</h3>
<p>Araç, ambalajlı hacme ve en büyük parçanın ölçüsüne göre seçiliyor. Aracın adrese yanaşamadığı yerlerde kapı ile araç arasındaki yürüme mesafesi de hesaba giriyor; bazı dar sokaklarda büyük araç girmediği için eşya küçük araçla ana caddeye aktarılıyor ve bu, günü eşya miktarından daha çok uzatabiliyor.</p>
<p>Yükleme sırası varış adresine göre kuruluyor: yeni evde ilk açılması gereken oda en son yükleniyor. Tek seferde sığmayan taşımalarda ikinci seferin neyi taşıyacağı da baştan belli oluyor, böylece ilk akşam oturulabilir bir ev bırakılıyor.</p>

<h3>6. Yeni adreste yerleşim</h3>
<p>Boşaltma taşımanın sonu değil. Koliler etiketine göre odasına giriyor, sökülen mobilya yeniden kuruluyor ve ambalaj atığı toplanıyor. Kurulum süresi doğrudan söküm listesinin uzunluğuna bağlı; sekiz parça sökülmüşse yerleşim taşımanın kendisinden uzun sürebiliyor.</p>
<p>İlk gün açılması gereken kutular — mutfakta temel takım, yatak takımı, ilaç ve şarj aletleri — ayrı işaretlenip ayrı bir yere konuyor. Çıkış ve giriş tarihleriniz aynı güne denk gelmiyorsa eşyanın <a href="/esya-depolama">aradaki sürede ambalajlı beklemesi</a> de plana yazılabiliyor.</p>

<h3>Neyin size ait olduğu</h3>
<p>Bizden bağımsız kalan birkaç iş var ve bunları baştan söylüyoruz. Site ya da apartman yönetiminden taşınma günü onayı almak, varsa aidat ve depozito işlemlerini kapatmak, iki adresin anahtar ve giriş kartlarının taşıma saatinde hazır olması sizin tarafınızda kalıyor. Bunlar tamamlanmadığında ekip ve araç geldiği hâlde binaya giriş yapılamıyor.</p>
<p>Kişisel evrak, takı, ilaç ve küçük kıymetli parçaları kendinizde tutmanızı öneriyoruz. Yönetimle görüşmeyi isterseniz biz üstlenebiliyoruz; ama sonuç bizim elimizde olmadığı için sürecin sizde kalan kısmını gizlemiyoruz.</p>`

const INCLUDES = [
  'İki adresin erişim ve hacim çıkarımı',
  'Parçaya göre koruyucu ambalaj ve malzemesi',
  'Kapıdan geçmeyen mobilyanın sökümü ve kurulumu',
  'Yükleme, araç içi yerleşim ve boşaltma',
  'Yeni adreste odalara göre yerleştirme',
  'Ambalaj atıklarının toplanması',
]

/**
 * Beş soru. Değişenler ve gerekçeleri:
 *
 *   ÇIKAN  "Keşif ne kadar sürüyor?"  — karar anında bir belirsizliği
 *          çözmüyor; keşfin süresi değil sonucu ilgilendiriyor.
 *   ÇIKAN  "Taşınmadan önce ne hazırlamalıyım?" — cevabındaki asıl bilgi
 *          (yönetim onayı, kişisel eşya) artık gövdedeki "Neyin size ait
 *          olduğu" bloğunda ve orada daha ayrıntılı.
 *   GİREN  "Dış cephe asansörü gerekir mi?" — keşif öncesi en sık sorulan
 *          ve maliyeti değiştiren karar.
 *   GİREN  "Paketlemeyi ben mi yapmalıyım?" — kapsamın müşteri tarafından
 *          seçilebilen tek büyük kalemi.
 *
 * Kalan üçü konu olarak korundu, cevapları 100–220 karakter bandına
 * çekildi ve taahhüt taşımadıkları yeniden doğrulandı.
 */
const FAQS = [
  {
    question: 'Taşınma bir günde biter mi?',
    answer:
      'Şehir içi taşımaların büyük kısmı tek günde bitiyor. Süreyi eşya miktarından çok kat, asansör durumu ve aracın binaya yanaşabildiği mesafe belirliyor; gerçekçi süre eşya listesi çıktıktan sonra netleşiyor.',
  },
  {
    question: 'Dış cephe asansörü gerekir mi?',
    answer:
      'Kararı kat değil geometri veriyor: asansör kabininin derinliği ve merdiven sahanlığının dönüş payı. Gardırop ya da köşe takımı bunlardan geçmiyorsa dış cephe asansörü gündeme geliyor.',
  },
  {
    question: 'Paketlemeyi ben mi yapmalıyım?',
    answer:
      'İkisi de mümkün. Cam, tablo ve elektronik gibi parçaların ambalajını ekip yapıyor; kitap ve tekstil kolilerini isterseniz siz hazırlayabiliyorsunuz. Ne kadarının kimde kaldığı keşifte konuşuluyor.',
  },
  {
    question: 'Eşyalarım sigortalı mı taşınıyor?',
    answer:
      'Taşıma sırasındaki hasarlara karşı sorumluluğumuzun kapsamını taşımadan önce sizinle netleştiriyoruz. Kırılabilir ve yüksek değerli parçalar keşifte ayrı listeleniyor, ambalajları ayrı yapılıyor.',
  },
  {
    question: 'Fiyat sonradan değişir mi?',
    answer:
      'Keşifte gördüğümüz koşullar değişmediği sürece hayır. Listeye sonradan eklenen eşya ya da değişen bir adres koşulu olursa fark önceden bildirilip onayınız alınıyor.',
  },
]

const META_DESCRIPTION =
  'Bir ev taşıması iki adresin ayrı ayrı çözülmesidir: araç erişimi, kat, asansör geometrisi, eşya hacmi ve yerleşim sırası. İstanbul’da planın nasıl kurulduğu.'

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
  }
  writeFileSync(YEDEK, JSON.stringify({ id: kayit.id, slug: kayit.slug, eski }, null, 1), 'utf8')

  await db.service.update({
    where: { id: kayit.id },
    data: { content: CONTENT, includes: INCLUDES, faqs: FAQS, metaDescription: META_DESCRIPTION },
  })

  const kelime = (s) => String(s).replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
  console.log(`#${kayit.id} ${kayit.slug} güncellendi`)
  console.log(`  content          ${String(eski.content).length} → ${CONTENT.length} kar · ${kelime(eski.content)} → ${kelime(CONTENT)} kelime`)
  console.log(`  h3 sayısı        ${(String(eski.content).match(/<h3/g) || []).length} → ${(CONTENT.match(/<h3/g) || []).length}`)
  console.log(`  en uzun h3       ${Math.max(...[...CONTENT.matchAll(/<h3[^>]*>([^<]*)</g)].map((m) => m[1].length))} kar`)
  console.log(`  includes         ${eski.includes.length} → ${INCLUDES.length}`)
  console.log(`  faqs             ${eski.faqs.length} → ${FAQS.length} · cevap ${Math.min(...FAQS.map((f) => f.answer.length))}–${Math.max(...FAQS.map((f) => f.answer.length))} kar`)
  console.log(`  metaDescription  ${String(eski.metaDescription).length} → ${META_DESCRIPTION.length} kar`)
  console.log(`\nEski değerler ${YEDEK} içine yazıldı.`)
  console.log('Geri almak için: node --env-file=.env scripts/evden-eve-icerik.mjs --geri')
}

await db.$disconnect()
