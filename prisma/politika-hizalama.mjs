// prisma/politika-hizalama.mjs
//
//     npm run politika-hizala -- --dogrula   → yalnız rapor, HİÇBİR ŞEY yazmaz
//     npm run politika-hizala                → hizalamayı uygular
//
// ÜÇ YASAL METNİN GERÇEK SİTEYLE HİZALANMASI.
//
// ─────────────────────────────────────────────────────────────────────────
// BU DOSYA HUKUKİ TAVSİYE ÜRETMİYOR
//
// Burada yeni bir sorumluluk hükmü, yetki şartı, saklama süresi ya da
// tüketici hakkı YAZILMIYOR. Yapılan tek şey, metinlerin anlattığı ÜRÜN
// DAVRANIŞINI siteyle eşitlemek: var olmayan özellikleri çıkarmak, gerçek
// veri akışını yazmak. Hukuki yeterlilik için uzman incelemesi gerekiyor;
// bu betik onun yerine geçmiyor.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN — M16 DENETİMİNDE ÖLÇÜLENLER
//
// ÇEREZ POLİTİKASI, sitede bulunmayan bir reklam ve analitik altyapısını
// anlatıyordu: Google AdSense, DoubleClick DART, üçüncü taraf reklam
// şirketleri, ilgi alanına dayalı reklam, performans analitiği, yorum
// verisi ve kullanıcı medyası saklama süreleri.
//
// Ölçüldü — 11 rekabete açık rota, sayfa sonuna kaydırıldıktan sonra:
//     çerez = 0 · localStorage = 0 · sessionStorage = 0
//     document.cookie = "" · üçüncü taraf ağ isteği = 0
//     gtag / dataLayer / fbq / _hjSettings / clarity / ttq / adsbygoogle = yok
// Kodda da sıfır: `SiteSettings` içindeki üç analitik kimliği null ve
// hiçbir yerde tüketilmiyor (panelden M6'da kaldırılmışlar).
//
// GİZLİLİK POLİTİKASI, pazaryeri şablonundan kalmıştı: hissedarlar,
// reklam verenler, üye firmalar, mobil uygulamalar, kullanıcı adı-şifreli
// sayfalar, reklam tercihi analizi, acil durumda konum tespiti, yarışma
// ve oyunlar, yurt dışına aktarım. Bunların hiçbiri bu sitede yok.
//
// KULLANIM ŞARTLARI, hesap oluşturma, e-posta/SMS doğrulama, şifre
// sorumluluğu, hesap aktivasyonu ve "son 12 ayda ödenen ücretler"
// anlatıyordu. Sitede ziyaretçi hesabı ve ödeme akışı yok.
//
// ─────────────────────────────────────────────────────────────────────────
// GEÇMİŞE DÖNÜK GARANTİ VERİLMİYOR
//
// "Hiçbir koşulda çerez kullanılmaz" gibi geleceğe dönük mutlak bir
// taahhüt YOK. Metin, YÜRÜRLÜKTEKİ SÜRÜM için ne olduğunu söylüyor.
//
// Yönetim paneli oturum çerezi ziyaretçi çerezi gibi sunulmuyor: ayrı
// paragrafta, yönetim alanı bağlamında anlatılıyor.
//
// ─────────────────────────────────────────────────────────────────────────
// GÜVENLİ YAZMA
//
// Her metin yalnız BİLİNEN eski kuşağın parmak iziyle eşleşirse yazılıyor.
// Parmak izi = o kuşakta bulunan, yenisinde bulunmayan ayırt edici dizeler.
// Panelden elle değiştirilmiş metin EZİLMİYOR. İkinci koşu 0 yazma üretir.
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/client/client.ts'

const p = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })
const YALNIZ_DOGRULA = process.argv.slice(2).includes('--dogrula')

/**
 * GÜNCELLEME TARİHİ — proje yereli.
 *
 * Metinler bu koşuda gerçekten değiştiği için tarih de gerçekten bugün.
 * Uydurma geçmiş tarih yok; eskiler (15.01.2024 / 23.03.2025 / 09.10.2024)
 * içerikten önceydi ve gizlilik metni 2026'da eklenen hesaplayıcı→talep
 * akışından daha eskiydi.
 */
const BUGUN = new Date()

const GIZLILIK = `<p>Bu metin, istanbulevenakliyat.com üzerinden paylaştığınız kişisel verilerin nasıl işlendiğini açıklar. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında hazırlanmıştır.</p>

<h2>1. Hangi verileri topluyoruz</h2>
<p>Sitede ziyaretçi kaydı, üyelik ya da şifreli giriş yoktur. Kişisel veri yalnızca iletişim formunu doldurduğunuzda toplanır:</p>
<ul>
<li><strong>Ad</strong> — size nasıl hitap edeceğimizi bilmek için.</li>
<li><strong>Telefon</strong> — talebinizi konuşmak için.</li>
<li><strong>E-posta</strong> — yazışmayı tercih ederseniz.</li>
<li><strong>Mesajınız</strong> — taşımanın kapsamına dair anlattıklarınız.</li>
<li><strong>Formun gönderildiği sayfa</strong> — hangi içeriğin işinize yaradığını anlamak için.</li>
<li><strong>Gönderim zamanı</strong> ve talebin okunup okunmadığı bilgisi.</li>
</ul>
<p>Fiyat hesaplama aracını kullandıktan sonra iletişim sayfasına geçerseniz, seçtiğiniz taşıma koşulları (ev büyüklüğü, mesafe, kat ve asansör durumu, paketleme ve depolama tercihi) sunucu tarafında doğrulanır ve talebinizin özetine eklenir. Bu özet, mesaj kutusuna kendi yazdıklarınızın yerini almaz; ikisi birlikte saklanır.</p>
<p>Ayrıca formun gönderim durumu ile e-posta iletiminin başarılı olup olmadığı gibi işletimsel bilgiler kaydedilir.</p>

<h2>2. Neleri toplamıyoruz</h2>
<p>Şeffaflık açısından, sitenin yürürlükteki sürümünde <strong>yapılmayanları</strong> da yazıyoruz:</p>
<ul>
<li>Ziyaretçi tarafında analitik veya reklam çerezi kullanılmaz; ayrıntısı <a href="/cerez-politikasi">Çerez Politikası</a> sayfasındadır.</li>
<li>Tarayıcı ve cihaz bilgileriniz (user-agent) kaydedilmez.</li>
<li>Konum bilginiz toplanmaz.</li>
<li>Site üzerinden ödeme alınmaz; kart veya banka bilgisi istenmez.</li>
<li>Reklam tercihi analizi, profilleme ve otomatik karar verme yapılmaz.</li>
</ul>
<p>IP adresiniz veri tabanına yazılmaz. Yalnızca formun kötüye kullanımını önlemek için, kısa bir zaman penceresinde gönderim sayısını saymak amacıyla geçici olarak tutulur ve pencere dolduğunda düşer.</p>

<h2>3. Hangi amaçla işliyoruz</h2>
<ul>
<li>Taşıma talebinizi değerlendirmek ve size dönüş yapmak.</li>
<li>Hizmetin planlanması ve yürütülmesi.</li>
<li>Talep edilmesi hâlinde yetkili kamu kurumlarına ve mahkemelere bilgi vermek.</li>
</ul>
<p>Verileriniz pazarlama listesine eklenmez ve üçüncü kişilere satılmaz.</p>

<h2>4. Kimlerle paylaşıyoruz</h2>
<p>Form içeriği, talebi görebilmemiz için işletmenin kendi e-posta adresine iletilir. Bunun dışında kişisel verileriniz;</p>
<ul>
<li>hizmeti sunmak için zorunlu olduğu ölçüde çalıştığımız taşıma ekipleriyle,</li>
<li>yasal yükümlülük hâlinde yetkili kurumlarla</li>
</ul>
<p>paylaşılabilir. Reklam verenlerle, veri simsarlarıyla veya pazarlama ağlarıyla paylaşılmaz.</p>

<h2>5. Ne kadar süre saklıyoruz</h2>
<p>Talep kayıtları, hizmetin yürütülmesi ve olası sorulara cevap verebilmek için saklanır ve yönetim panelinden silinebilir. Sitede bugün <strong>otomatik silme mekanizması bulunmamaktadır</strong>; kayıtlar elle silinene kadar durur. Verilerinizin silinmesini istediğinizde aşağıdaki adrese yazmanız yeterlidir.</p>

<h2>6. Güvenlik</h2>
<p>Yönetim paneline erişim şifreyle korunur ve oturum bilgisi imzalı bir çerezle taşınır. Site, tarayıcı ile sunucu arasındaki trafiği koruyan güvenlik başlıklarıyla sunulur. Kişisel verilerin yasal olmayan yollarla elde edildiği tespit edilirse, ilgili düzenlemelere uygun olarak Kişisel Verileri Koruma Kurulu'na bildirim yapılır.</p>

<h2>7. KVKK kapsamındaki haklarınız</h2>
<p>6698 sayılı Kanun'un 11. maddesi uyarınca:</p>
<ul>
<li>Kişisel verinizin işlenip işlenmediğini öğrenme,</li>
<li>İşlenmişse buna ilişkin bilgi talep etme,</li>
<li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
<li>Verilerin aktarıldığı üçüncü kişileri bilme,</li>
<li>Eksik veya yanlış işlenen verilerin düzeltilmesini isteme,</li>
<li>Verilerin silinmesini veya yok edilmesini talep etme,</li>
<li>Düzeltme veya silme işleminin aktarılan üçüncü kişilere bildirilmesini isteme,</li>
<li>Kanuna aykırı işlenme sebebiyle uğradığınız zararın giderilmesini talep etme</li>
</ul>
<p>haklarına sahipsiniz.</p>

<h2>8. Başvuru</h2>
<p>Taleplerinizi <a href="mailto:info@istanbulevenakliyat.com">info@istanbulevenakliyat.com</a> adresine iletebilirsiniz. Başvurularınız en geç 30 gün içinde sonuçlandırılır.</p>
<p>Bu metin, sitenin yürürlükteki sürümündeki uygulamayı anlatır. Veri işleme biçimi değiştiğinde metin de güncellenir ve güncelleme tarihi sayfanın başında görünür.</p>`

const CEREZ = `<p>Bu sayfa, istanbulevenakliyat.com'un yürürlükteki sürümünde çerezlerin nasıl kullanıldığını açıklar. <a href="/gizlilik-politikasi">Gizlilik Politikası</a>'nın bir parçasıdır.</p>

<h2>Çerez nedir?</h2>
<p>Çerez, bir web sitesini ziyaret ettiğinizde cihazınıza (bilgisayar, telefon, tablet) kaydedilen küçük bir metin dosyasıdır. Siteler çerezleri genellikle oturum yönetimi, tercih hatırlama, ölçümleme ve reklam için kullanır.</p>

<h2>Bu sitede durum</h2>
<p>Ziyaretçi olarak sitede gezerken <strong>tarayıcınıza çerez yazılmaz</strong>. Sayfalar; <code>localStorage</code>, <code>sessionStorage</code> ve benzeri tarayıcı depolama alanlarını da kullanmaz.</p>
<p>Bunun pratik sonucu şu: bu sitede kapatmanız gereken bir çerez ayarı ve onaylamanız gereken bir çerez bildirimi yoktur.</p>

<h2>Kullanılmayan araçlar</h2>
<p>Yürürlükteki sürümde aşağıdakilerin hiçbiri siteye yüklenmez:</p>
<ul>
<li>Google Analytics ve Google Tag Manager</li>
<li>Google AdSense ve reklam ağı çerezleri</li>
<li>Meta (Facebook) Pixel</li>
<li>Hotjar, Microsoft Clarity ve benzeri davranış izleme araçları</li>
<li>TikTok, LinkedIn ve diğer platformların dönüşüm etiketleri</li>
</ul>
<p>İlgi alanına dayalı reklam gösterilmez ve reklam amaçlı profil oluşturulmaz.</p>

<h2>Üçüncü taraf içerik</h2>
<p>Sayfalarda gömülü harita, video veya sosyal medya bileşeni bulunmaz; yazı tipleri ve görseller sitenin kendi sunucusundan gelir. Bu nedenle sayfayı açtığınızda tarayıcınız başka bir siteye istek göndermez.</p>
<p>Metin içinde başka sitelere bağlantı verilebilir. Böyle bir bağlantıya tıkladığınızda gittiğiniz sitenin kendi çerez uygulaması geçerli olur.</p>

<h2>Yönetim alanı</h2>
<p>Sitenin yönetim paneline giriş yapan yetkili kullanıcılar için oturumu taşıyan teknik bir çerez kullanılır. Bu çerez yalnızca giriş yapıldığında oluşur, oturumun sürmesi için zorunludur ve ziyaretçi trafiğiyle ilgisi yoktur. Siteyi ziyaret eden hiç kimsede oluşmaz.</p>

<h2>Formla paylaştığınız bilgiler</h2>
<p>İletişim formunu doldurduğunuzda yazdıklarınız çerezle değil, doğrudan gönderim yoluyla bize ulaşır. Hangi verilerin toplandığı ve ne kadar saklandığı <a href="/gizlilik-politikasi">Gizlilik Politikası</a> sayfasında açıklanmıştır.</p>

<h2>Tarayıcınızdan çerez yönetimi</h2>
<p>Bu sitede kapatılacak bir çerez bulunmasa da, tarayıcınızın çerez ayarlarını genel olarak şu sayfalardan yönetebilirsiniz:</p>
<ul>
<li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
<li><a href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
<li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
<li><a href="https://support.microsoft.com/tr-tr/microsoft-edge/microsoft-edge-de-tanimlama-bilgilerini-silme-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
</ul>

<h2>Değişiklik</h2>
<p>Bu metin sitenin bugünkü sürümünü anlatır. İleride ölçümleme veya benzeri bir araç eklenirse, bu sayfa eklenmeden önce güncellenir ve gerekiyorsa onayınız istenir.</p>`

const SARTLAR = `<p>Bu Kullanım Şartları, istanbulevenakliyat.com sitesinin kullanımını düzenler. Siteyi kullanarak bu şartları ve <a href="/gizlilik-politikasi">Gizlilik Politikası</a> ile <a href="/cerez-politikasi">Çerez Politikası</a>'nı kabul etmiş sayılırsınız.</p>

<h2>1. Sitenin kapsamı</h2>
<p>Site, sunulan nakliyat hizmetlerini tanıtır ve iletişim kurmanızı sağlar. Sitede üyelik, hesap oluşturma ve çevrim içi ödeme bulunmaz. Site üzerinden yapılan tek işlem, iletişim formuyla talep iletmenizdir.</p>

<h2>2. Fiyat hesaplama aracı</h2>
<p>Sitedeki fiyat hesaplama aracı, girdiğiniz bilgilere göre <strong>tahmini bir aralık</strong> üretir. Bu aralık bir teklif değildir ve bağlayıcı değildir. Sokak genişliği, aracın binaya yanaşması ve asansör kabininin ölçüsü gibi adrese özgü koşullar hesaba girmez; tutar, taşıma koşulları değerlendirildikten sonra netleşir.</p>

<h2>3. Talep göndermek</h2>
<ul>
<li>Formda paylaştığınız bilgilerin doğru olması, size doğru dönüş yapabilmemiz için gereklidir.</li>
<li>Form yalnızca kendi taşıma talebiniz için kullanılmalıdır; başkası adına bilgi paylaşıyorsanız bunun için gerekli izne sahip olmalısınız.</li>
<li>Formun otomatik araçlarla toplu biçimde gönderilmesi, sistemin işleyişini bozacak şekilde kullanılması kabul edilmez; bu tür kullanımlar teknik olarak sınırlanır.</li>
</ul>
<p>Talep göndermeniz tek başına bir taşıma sözleşmesi kurmaz. Taşımanın kapsamı, tarihi ve tutarı karşılıklı görüşmeyle belirlenir.</p>

<h2>4. İçeriğin kullanımı</h2>
<ul>
<li>Sitedeki metinler, görseller, tasarım ve yazılım site işletmecisine aittir.</li>
<li>İçeriğin izinsiz kopyalanması, çoğaltılması veya başka bir yerde yayımlanması uygun değildir.</li>
<li>Fikri mülkiyet hakkınızın ihlal edildiğini düşünüyorsanız <a href="mailto:info@istanbulevenakliyat.com">info@istanbulevenakliyat.com</a> adresine bildirebilirsiniz.</li>
</ul>

<h2>5. Bilgilerin güncelliği</h2>
<p>Sitedeki hizmet açıklamaları ve rehber yazıları genel bilgilendirme amacıyla hazırlanmıştır. İçerikler güncel tutulmaya çalışılır; yine de sizin taşımanız için geçerli koşullar, karşılıklı görüşmede paylaşılan bilgilerle netleşir.</p>
<p>Site kesintisiz ve hatasız çalışacak şekilde tasarlanmıştır; buna rağmen bakım, teknik arıza veya sağlayıcı kaynaklı sorunlar nedeniyle geçici erişim kesintileri yaşanabilir.</p>

<h2>6. Değişiklikler</h2>
<p>Bu şartlar zaman içinde güncellenebilir. Güncel metin bu sayfada yayımlanır ve güncelleme tarihi sayfanın başında görünür.</p>

<h2>7. Uygulanacak hukuk</h2>
<p>Bu şartlar Türkiye Cumhuriyeti mevzuatına tabidir.</p>

<h2>İletişim</h2>
<p>Sorularınız için: <a href="mailto:info@istanbulevenakliyat.com">info@istanbulevenakliyat.com</a></p>`

/**
 * HİZALAMA KÜTÜĞÜ.
 *
 * `izler`: tanınan ESKİ kuşağın parmak izi. Hepsi mevcut metinde varsa o
 * kuşak tanınmış demektir ve yazma güvenlidir. Yenisinde bunların hiçbiri
 * bulunmaz — bu yüzden ikinci koşuda eşleşme olmaz ve 0 yazma üretilir.
 */
const POLITIKALAR = [
  {
    slug: 'gizlilik-politikasi',
    baslik: 'Gizlilik Politikası',
    altBaslik:
      'Formla paylaştığınız bilgilerin nasıl işlendiğini, ne kadar saklandığını ve haklarınızı açıklar.',
    neden: 'sitede olmayan faaliyetler (hissedar, reklam veren, üye firma, mobil uygulama, şifreli hesap, konum, yurt dışı aktarım)',
    izler: ['ana hissedarlarımız', 'mobil uygulamalarındaki formlar', 'Reklam tercihlerini analiz etmek'],
    icerik: GIZLILIK,
  },
  {
    slug: 'cerez-politikasi',
    baslik: 'Çerez Politikası',
    altBaslik: 'Sitenin yürürlükteki sürümünde çerez ve izleme araçlarının durumu.',
    neden: 'ölçülen gerçekle çelişen reklam/analitik anlatımı (AdSense, DoubleClick, ilgi alanına dayalı reklam, yorum verisi)',
    izler: ['Google AdSense', 'DoubleClick DART', 'Yorum verileri'],
    icerik: CEREZ,
  },
  {
    slug: 'kullanim-sartlari',
    baslik: 'Kullanım Şartları',
    altBaslik: 'Siteyi ve iletişim formunu kullanırken geçerli olan koşullar.',
    neden: 'sitede olmayan ürün davranışı (hesap oluşturma, SMS doğrulama, şifre sorumluluğu, ödenen ücretler)',
    izler: ['Hesap Oluşturma Süreci', 'E-posta veya SMS ile doğrulama', 'son 12 ayda ödenen ücretlerle'],
    icerik: SARTLAR,
  },
]

// ═══════════════════════════════════════════ ÖN KONTROL

const kucult = (s) => String(s).replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase()

/**
 * HİÇBİR BİÇİMDE GEÇEMEZ.
 *
 * Bunların olumsuzlanmış meşru bir kullanımı yok: ya uydurulmuş bir tüzel
 * kişilik ya da doğrulanmamış ticari iddia.
 */
const KESIN_YASAK = [
  'ltd. şti', 'ltd.şti', 'a.ş.', 'mersis', 'vergi no', 'ticaret sicil',
  'ücretsiz keşif', 'yazılı ve kesin', 'sabit fiyat', 'kesin fiyat',
  'son 12 ayda', 'hesap aktivasyonu', 'sms ile doğrulama',
]

/**
 * YALNIZ OLUMSUZLAMA İÇİNDE GEÇEBİLİR.
 *
 * Metnin işi, sitede OLMAYAN özellikleri açıkça saymak — "Google AdSense
 * yüklenmez" demek, "Google AdSense kullanıyoruz" demenin tam tersi.
 * Kör bir kelime yasağı ikisini ayıramaz ve doğru cümleyi de reddeder;
 * ilk sürümünde tam olarak bu oldu. Kural şu: bu terimlerin geçtiği HER
 * cümlede bir olumsuzlama işareti bulunmalı.
 */
const YALNIZ_OLUMSUZ = [
  'adsense', 'doubleclick', 'dart', 'ilgi alanına dayalı',
  'hissedar', 'reklam veren', 'üye firma', 'mobil uygulama',
  'kullanıcı adı ve şifre', 'yorum verileri', 'medya dosyaları',
  'pixel', 'hotjar', 'clarity', 'tag manager', 'analytics',
]
const OLUMSUZ_IZ = [
  'kullanılmaz', 'yüklenmez', 'paylaşılmaz', 'bulunmaz', 'yoktur', 'yok.',
  'gösterilmez', 'toplanmaz', 'oluşmaz', 'alınmaz', 'istenmez', 'edilmez',
  'yapılmaz', 'hiçbiri', 'değildir', 'yazılmaz', 'kullanmaz', 'eklenmez',
]

/** Metni cümlelere böler (HTML etiketleri sınır sayılır). */
const cumleler = (html) =>
  html.replaceAll(/<[^<>]*>/g, ' ').split(/(?<=[.?!:])\s+/).map((c) => c.trim()).filter(Boolean)

console.log('═══ ÖN KONTROL — yanlış ürün davranışı / uydurma kimlik')
let kirli = 0
for (const k of POLITIKALAR) {
  const tam = kucult(k.icerik + ' ' + k.altBaslik)

  const kesin = KESIN_YASAK.filter((y) => tam.includes(kucult(y)))
  if (kesin.length) { kirli++; console.log(`  ⚑ ${k.slug}: KESİN YASAK → ${kesin.join(', ')}`) }

  for (const terim of YALNIZ_OLUMSUZ) {
    for (const c of cumleler(k.icerik)) {
      const kc = kucult(c)
      if (!kc.includes(kucult(terim))) continue
      if (OLUMSUZ_IZ.some((o) => kc.includes(kucult(o)))) continue
      kirli++
      console.log(`  ⚑ ${k.slug}: "${terim}" OLUMSUZLAMASIZ geçiyor`)
      console.log(`      ${c.slice(0, 120)}`)
    }
  }
}
console.log(kirli ? `  ${kirli} sorun — YAZILMAYACAK` : '  temiz')
if (kirli) { await p.$disconnect(); process.exit(1) }

// Mutlak gelecek taahhüdü verilmediğini de sınıyoruz.
const MUTLAK = ['hiçbir koşulda çerez', 'asla çerez', 'hiçbir zaman çerez']
for (const k of POLITIKALAR) {
  for (const m of MUTLAK) {
    if (kucult(k.icerik).includes(kucult(m))) {
      console.log(`  ⚑ ${k.slug}: geleceğe dönük mutlak taahhüt ("${m}") — YAZILMAYACAK`)
      await p.$disconnect(); process.exit(1)
    }
  }
}

// ═══════════════════════════════════════════ YAZMA

let yazilan = 0, atlanan = 0, korunan = 0

for (const k of POLITIKALAR) {
  const kayit = await p.policyPage.findFirst({ where: { slug: k.slug } })
  console.log(`\n═══ ${k.slug}`)
  if (!kayit) { atlanan++; console.log('  kayıt yok — atlandı'); continue }

  const mevcut = String(kayit.content ?? '')
  if (mevcut.trim() === k.icerik.trim()) { korunan++; console.log('  zaten güncel'); continue }

  const bulunan = k.izler.filter((i) => mevcut.includes(i))
  if (bulunan.length !== k.izler.length) {
    atlanan++
    console.log('  TANINMAYAN METİN — EZİLMEDİ (panelden elle değiştirilmiş olabilir)')
    console.log(`    beklenen ${k.izler.length} parmak izinden ${bulunan.length} tanesi bulundu`)
    continue
  }

  console.log(`  ${k.neden}`)
  console.log(`    içerik : ${mevcut.length} → ${k.icerik.length} karakter`)
  console.log(`    başlık : ${kayit.title} → ${k.baslik}`)
  console.log(`    alt    : ${k.altBaslik}`)
  console.log(`    tarih  : ${kayit.lastUpdated ? new Date(kayit.lastUpdated).toLocaleDateString('tr-TR') : '—'} → ${BUGUN.toLocaleDateString('tr-TR')}`)
  if (!YALNIZ_DOGRULA) {
    await p.policyPage.update({
      where: { id: kayit.id },
      data: {
        title: k.baslik,
        subtitle: k.altBaslik,
        content: k.icerik,
        lastUpdated: BUGUN,
        isActive: true,
      },
    })
  }
  yazilan++
}

console.log(
  `\n═══ SONUÇ  ${YALNIZ_DOGRULA ? 'yazılacak' : 'yazıldı'}: ${yazilan} · zaten güncel: ${korunan} · atlanan: ${atlanan}`
)
console.log('DOKUNULMAYAN: rota listesi, slug\'lar, sayfa dosyaları, footer bağlantıları, SEO kütüğü')
console.log('NOT: ticari unvan / vergi no / MERSİS / sicil BİLİNMİYOR — metinlere KONMADI.')
console.log('     Hukuki yeterlilik için uzman incelemesi önerilir.')

await p.$disconnect()
