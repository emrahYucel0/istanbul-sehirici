// prisma/politika-tohum.mjs
//
// Politika metinlerini Vue şablonlarından veritabanına taşır.
//
// TEK SEFERLİK DEĞİL, TEKRAR ÇALIŞTIRILABİLİR: kayıt varsa DOKUNMAZ.
// Admin metni panelden düzenledikten sonra bu betiğin yeniden çalışması
// (örneğin yeni bir kurulumda) düzenlemeyi ezmemeli.
//
// Metinler kaynak bileşenlerden birebir alındı. Kaldırılanlar:
//   - Kullanım Şartları'ndaki "Okudum, kabul ediyorum" kutusu: butonu
//     yalnızca console.log yapıyordu, hiçbir kaydı yoktu. Çalışmayan bir
//     yasal onay, olmamasından daha kötü.
//   - Çerez Politikası'ndaki "Güncelleme Geçmişi" (v1.0 - 25/03/2025):
//     sayfanın kendi "Son Güncellenme: 09/10/2024" tarihiyle çelişiyordu.
//   - Yazdır butonu: tarayıcının kendi yazdırma işlevinin kopyası.
//
// EKLENEN: Çerez Politikası'nda "Kullanım Amaçları" ve "Toplanan Veriler"
// bölümlerinin başlıkları vardı ama içeriklerini besleyen diziler
// (usagePurposes, dataItems) hiç tanımlanmamıştı — iki bölüm canlıda boş
// başlık olarak duruyordu. İçerikleri sayfanın geri kalanıyla tutarlı
// şekilde yazıldı; hukuk danışmanınıza doğrulatın.
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/client/client.ts'

const GIZLILIK = `
<p>istanbulevenakliyat.com olarak kişisel verilerinizin güvenliği hususuna azami hassasiyet göstermekteyiz. Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK)'na uygun olarak işlenmekte ve saklanmaktadır.</p>

<h2>1. Kişisel Verilerin İşlenmesi</h2>
<p>KVKK uyarınca, istanbulevenakliyat.com ile paylaştığınız kişisel veriler, tamamen veya kısmen, otomatik olarak veya herhangi bir veri kayıt sisteminin parçası olmak kaydıyla otomatik olmayan yollarla elde edilerek, kaydedilerek, depolanarak, değiştirilerek, yeniden düzenlenerek; yani veriler üzerinde gerçekleştirilen her türlü işlem "kişisel verilerin işlenmesi" olarak kabul edilmektedir.</p>

<h2>2. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepleri</h2>
<p>Paylaştığınız kişisel veriler, aşağıdaki amaçlarla işlenmektedir:</p>
<ul>
<li>Müşterilerimize verdiğimiz hizmetlerin gereklerini yerine getirmek, sözleşmenin ve teknolojinin gereklerine uygun hizmet sunmak, ürün ve hizmetlerimizi geliştirmek;</li>
<li>Kamu güvenliğine ilişkin hususlarda ve hukuki uyuşmazlıklarda, talep halinde savcılıklara, mahkemelere ve ilgili kamu görevlilerine bilgi verebilmek;</li>
<li>Üyelerimize çeşitli imkânlar sunabilmek veya bu imkânları sunabilecek kişi/kurumlarla yasal çerçevede paylaşım yapabilmek;</li>
<li>Reklam tercihlerini analiz etmek.</li>
</ul>
<p>Tüm işlemler, 6698 sayılı KVKK ve ilgili ikincil düzenlemelere uygun olarak gerçekleştirilmektedir.</p>

<h2>3. Üçüncü Kişilere Aktarım ve Çerez Politikası</h2>
<p>KVKK kapsamındaki amaçlarla, istanbulevenakliyat.com ile paylaştığınız kişisel verileriniz, ana hissedarlarımız, hissedarlarımız, reklam verenler, yurt içi/yurt dışı iştiraklerimiz; altyapımızı kullanan üye firmalar ve hizmetimizle ilişkili diğer kişi ve kuruluşlarla paylaşılabilir.</p>
<p>Ayrıca, reklam amaçlı kullanılacak çerezler <a href="/cerez-politikasi">Çerez Politikası</a> kapsamında değerlendirilmekte ve bu gizlilik politikasının bir parçası olarak uygulanmaktadır.</p>

<h2>4. Kişisel Verilerin Toplanma Şekli</h2>
<p>Kişisel verileriniz aşağıdaki yollarla toplanmaktadır:</p>
<ul>
<li>istanbulevenakliyat.com internet sitesi ve mobil uygulamalarındaki formlar aracılığıyla (ad, soyad, adres, telefon, iş veya özel e-posta gibi);</li>
<li>Kullanıcı adı ve şifre ile giriş yapılan sayfalarda, tercihlerin, IP kayıtlarının, çerez verilerinin, gezinme süresi ve detaylarının toplanması;</li>
<li>Ticari ilişki kurma, iş başvurusu, teklif verme gibi amaçlarla, kartvizit, özgeçmiş, teklif vb. yollarla sağlanan veriler;</li>
<li>Farklı kanallardan (web siteleri, bloglar, yarışmalar, anketler, oyunlar, kampanyalar, sosyal medya) dolaylı olarak elde edilen veriler.</li>
</ul>

<h2>5. KVKK Yürürlüğe Girmeden Önce Elde Edilen Veriler</h2>
<p>istanbulevenakliyat.com, KVKK'nın yürürlük tarihi olan 7 Nisan 2016'dan önce yayım hayatına başlamadığı için bu tarihten önce depolanan herhangi bir kişisel veri bulunmamaktadır.</p>

<h2>6. Kişisel Verilerin Aktarılması</h2>
<p>Türkiye'de işlenerek veya Türkiye dışında işlenip muhafaza edilmek üzere toplanan kişisel verileriniz, KVKK kapsamında kalmak koşuluyla, sözleşme amaçlarına uygun olarak yurtdışında bulunan ve yeterli korumanın sağlandığı ülkelere aktarılabilir.</p>
<p>Kişisel verileriniz aşağıdaki durumlarda aktarılabilir:</p>
<ul>
<li>Ürün ve hizmetlerin sunulması ve tanıtılması için işbirliği yapılan/hizmet alınan iş ortaklarımıza,</li>
<li>Acil yardım çağrısı halinde konumunuzu tespit edecek yetkili mercilere,</li>
<li>Düzenleyici ve denetleyici kurumlar, mahkeme ve icra müdürlükleri gibi resmi kuruluşlara,</li>
<li>istanbulevenakliyat.com ile ticari ilişki içinde bulunan ve telefon numaranıza sahip tüzel kişilere,</li>
<li>Gerekli görüldüğü durumlarda diğer üçüncü şahıslara.</li>
</ul>

<h2>7. Kişisel Verilerin Saklanması ve Korunması</h2>
<p>istanbulevenakliyat.com, kişisel verilerinizin bulunduğu sistem ve veri tabanlarını, KVKK'nın 12. maddesi gereği, yetkisiz erişimleri engellemek, hukuka aykırı işlenmelerin önüne geçmek amacıyla hash, şifreleme, işlem kaydı, erişim yönetimi gibi yazılımsal tedbirlerin yanı sıra fiziksel güvenlik önlemleriyle korumaktadır.</p>
<p>Kişisel verilerin yasal olmayan yollarla elde edilmesinin tespit edilmesi durumunda, derhal yasal düzenlemelere uygun olarak Kişisel Verileri Koruma Kurulu'na bildirilecektir.</p>

<h2>8. Kişisel Verilerin Güncel ve Doğru Tutulması</h2>
<p>KVKK'nın 4. maddesi uyarınca, istanbulevenakliyat.com'un kişisel verilerinizi doğru ve güncel tutma yükümlülüğü bulunmaktadır. Bu kapsamda, üyelerimizin doğru ve güncel verilerini paylaşması veya web sitesi/mobil uygulama üzerinden güncellemesi gerekmektedir.</p>

<h2>9. 6698 Sayılı KVKK Uyarınca Kişisel Veri Sahibinin Hakları</h2>
<p>6698 sayılı KVKK'nın 11. maddesi 07 Ekim 2016 tarihinde yürürlüğe girmiş olup, kişisel veri sahibi aşağıdaki haklara sahiptir:</p>
<ul>
<li>Kişisel veri işlenip işlenmediğini öğrenme,</li>
<li>İşlenmişse buna ilişkin bilgi talep etme,</li>
<li>Verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
<li>Yurt içi veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme,</li>
<li>Eksik veya yanlış işlenen verilerin düzeltilmesini isteme,</li>
<li>KVKK'nın 7. maddesi çerçevesinde verilerin silinmesini veya yok edilmesini talep etme,</li>
<li>Silme veya düzeltilen verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
<li>Otomatik sistemler vasıtasıyla analiz sonucu ortaya çıkan kendinize zarar veren sonuçlara itiraz etme,</li>
<li>Kanuna aykırı işlenme sebebiyle uğradığınız zararın giderilmesini talep etme.</li>
</ul>

<h2>10. İletişim ve Başvuru Yöntemi</h2>
<p>istanbulevenakliyat.com tarafından atanacak Veri Sorumlusu Temsilcisi, yasal altyapı sağlandığında Veri Sorumluları Sicilinde ve bu belgenin bulunduğu internet adresinde ilan edilecektir.</p>
<p>Kişisel veri sahipleri, sorularını, görüşlerini veya taleplerini <a href="mailto:info@istanbulevenakliyat.com">info@istanbulevenakliyat.com</a> adresine yöneltebilirler.</p>
<p>Taleplerinize, gerekçeli olmak ve 30 gün içerisinde yanıt vermek kaydıyla yazılı veya dijital ortamda olumlu/olumsuz bildirim yapılacaktır. İşlemlerin ücretsiz olması esas olmakla birlikte, maliyet gerektiren durumlarda ücret talep etme hakkı saklıdır. Bu ücretler, Kişisel Verilerin Korunması Kurulu'nun belirlediği tarife üzerinden hesaplanır.</p>
<p>Web sayfamız, uygulamalarımız ve diğer kanallar üzerinden kişisel verilerinizi paylaşarak, Gizlilik ve Kişisel Verilerin Korunması Politikamızı kabul ettiğinizi beyan etmiş olursunuz.</p>
`.trim()

const SARTLAR = `
<p>Bu Kullanım Şartları, istanbulevenakliyat.com tarafından sunulan web sitesi, mobil uygulama ve ilgili hizmetlerin ("Hizmet") kullanımını düzenler. Hizmeti kullanarak, bu Şartları ve ek politikalarımızı (<a href="/gizlilik-politikasi">Gizlilik Politikası</a>, <a href="/cerez-politikasi">Çerez Politikası</a> vb.) kabul etmiş sayılırsınız.</p>

<h2>1. Şartların Kabulü</h2>
<ul>
<li>Şartlar, Hizmet'e erişim sağladığınız anda yürürlüğe girer.</li>
<li>Şartları kabul etmiyorsanız, Hizmet'i kullanamazsınız.</li>
<li>Site işletmecisi, Şartları dilediği zaman güncelleme hakkını saklı tutar; güncellemeler web sitemizde yayınlandığında geçerli olur.</li>
</ul>
<blockquote><p><strong>Önemli Not:</strong> Bu Şartlar bir yasal sözleşme niteliğindedir ve dikkatle okunmalıdır.</p></blockquote>

<h2>2. Hesap Yükümlülükleri</h2>
<p>Hizmet'i tam olarak kullanabilmek için bir hesap oluşturmanız gerekebilir. Hesap oluştururken ve kullanırken aşağıdaki yükümlülüklere uymalısınız:</p>
<ul>
<li>Kullanıcılar, gerçek, doğru ve güncel bilgiler sağlamakla yükümlüdür (ad, soyad, e-posta vb.).</li>
<li>Sahte veya yanıltıcı profiller oluşturmak kesinlikle yasaktır.</li>
<li>Hesap şifrenizin güvenliğinden ve hesabınız üzerinden yapılan tüm faaliyetlerden siz sorumlusunuz.</li>
<li>Hesabınızın yetkisiz kullanımı durumunda derhal <a href="mailto:info@istanbulevenakliyat.com">destek ekibimize</a> bildirimde bulunmalısınız.</li>
<li>18 yaşından küçük kullanıcılar Hizmet'i yalnızca yasal vasi izniyle kullanabilir.</li>
</ul>
<h3>Hesap Oluşturma Süreci</h3>
<ol>
<li><strong>Kayıt Formu</strong> — Bilgilerinizi girin.</li>
<li><strong>Doğrulama</strong> — E-posta veya SMS ile doğrulama yapın.</li>
<li><strong>Hesap Aktivasyonu</strong> — Hesabınız kullanıma hazır.</li>
</ol>

<h2>3. Kabul Edilebilir Kullanım</h2>
<p>Hizmet'i kullanırken aşağıdaki kurallara uymalısınız. Aksi takdirde hesabınız askıya alınabilir veya sonlandırılabilir:</p>
<ul>
<li>Hizmet'i yasa dışı amaçlarla kullanmak yasaktır (ör. dolandırıcılık, hacking).</li>
<li>Başka kullanıcılara zarar verebilecek içerik yüklemek, paylaşmak veya yaymak yasaktır (ör. virüs, kötü amaçlı yazılım).</li>
<li>Telif hakkı, ticari marka veya diğer fikri mülkiyet haklarını ihlal eden içerikler paylaşamazsınız.</li>
<li>Spam, taciz, tehdit veya ayrımcı davranışlar sergileyemezsiniz.</li>
<li>Hizmet'in altyapısına zarar verebilecek şekilde aşırı yükleme veya kötüye kullanım yapamazsınız.</li>
</ul>
<blockquote><p><strong>Yaptırımlar:</strong> Kurallara uymayan kullanıcıların hesapları haber verilmeksizin sonlandırılabilir.</p></blockquote>

<h2>4. Fikri Mülkiyet Hakları</h2>
<p>Hizmet'teki tüm içerikler (metinler, logolar, tasarımlar, kodlar vb.) site işletmecisine veya lisans verenlerine aittir ve fikri mülkiyet yasalarıyla korunmaktadır.</p>
<ul>
<li>Hizmet içeriğini izinsiz kopyalamak, dağıtmak veya değiştirmek yasaktır.</li>
<li>Kullanıcılar, Hizmet'e yükledikleri içeriklerin sahipliğini korur ancak site işletmecisine bu içerikleri kullanma, saklama ve görüntüleme için sınırlı, geri alınabilir bir lisans verir.</li>
<li>Fikri mülkiyet ihlali iddiaları için <a href="mailto:info@istanbulevenakliyat.com">info@istanbulevenakliyat.com</a> adresine bildirimde bulunabilirsiniz.</li>
</ul>

<h2>5. Hizmetin Sonlandırılması</h2>
<p>Site işletmecisi, aşağıdaki durumlarda Hizmet'i sonlandırma veya hesabınızı kapatma hakkını saklı tutar:</p>
<ul>
<li>Şartların ihlali durumunda.</li>
<li>Yasal gereklilikler veya mahkeme kararı doğrultusunda.</li>
<li>Hizmet'in genel olarak sona ermesi durumunda (ör. platformun kapanması).</li>
</ul>
<p>Kullanıcılar da diledikleri zaman hesaplarını kapatma hakkına sahiptir.</p>

<h2>6. Sorumluluğun Sınırlandırılması</h2>
<p>Hizmet "olduğu gibi" sağlanır ve site işletmecisi, aşağıdaki durumlar için sorumluluk kabul etmez:</p>
<ul>
<li>Hizmet'teki kesintiler, hatalar veya veri kayıpları.</li>
<li>Kullanıcıların Hizmet'i yanlış veya yasa dışı kullanımı.</li>
<li>Üçüncü taraf sistemlerinden kaynaklanan sorunlar (ör. internet sağlayıcıları).</li>
</ul>
<p>Site işletmecisinin toplam sorumluluğu, kullanıcı tarafından son 12 ayda ödenen ücretlerle sınırlıdır.</p>

<h2>7. Geçerli Hukuk ve Uyuşmazlık Çözümü</h2>
<p>Bu Şartlar, Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlık durumunda aşağıdaki kurallar geçerlidir:</p>
<ul>
<li>Taraflar, uyuşmazlıkları dostane yollarla çözmeye çalışacaktır.</li>
<li>Çözülemeyen uyuşmazlıklar için İstanbul Merkez Mahkemeleri ve İcra Daireleri yetkilidir.</li>
</ul>

<h2>İletişim</h2>
<p>Sorularınız için: <a href="mailto:info@istanbulevenakliyat.com">info@istanbulevenakliyat.com</a></p>
`.trim()

const CEREZ = `
<p>Çerez Politikamız, <a href="/gizlilik-politikasi">Gizlilik Politikamızın</a> bir parçasını oluşturur.</p>

<h2>Çerez (Cookie) Nedir?</h2>
<p>Günümüzde neredeyse her web sitesi çerez kullanmaktadır. Size daha iyi, hızlı ve güvenli bir deneyim sağlamak için, çoğu internet sitesi gibi biz de çerezler kullanıyoruz. Çerez, bir web sitesini ziyaret ettiğinizde cihazınıza (örneğin; bilgisayar veya cep telefonu) depolanan küçük bir metin dosyasıdır.</p>

<h2>Çerez Türleri</h2>
<ul>
<li><strong>Oturum Çerezleri</strong> — Sayfalar arası geçiş ve kullanıcı bilgilerinin hatırlanması.</li>
<li><strong>Performans Çerezleri</strong> — Site performans analizi ve iyileştirmeler.</li>
<li><strong>Fonksiyonel Çerezler</strong> — Kullanıcı tercihlerinin kaydedilmesi.</li>
<li><strong>Reklam Çerezleri</strong> — Hedefli reklam ve pazarlama faaliyetleri.</li>
</ul>

<h2>Kullanım Amaçları</h2>
<p>Çerezleri aşağıdaki amaçlarla kullanıyoruz:</p>
<ul>
<li><strong>Sitenin çalışması</strong> — Form gönderimi, oturum yönetimi ve güvenlik doğrulaması gibi temel işlevlerin yerine getirilmesi.</li>
<li><strong>Tercihlerin hatırlanması</strong> — Seçtiğiniz bölge, görüntüleme tercihleri ve benzeri ayarların sonraki ziyaretinizde korunması.</li>
<li><strong>Performans ölçümü</strong> — Hangi sayfaların ne kadar görüntülendiğinin anonim olarak ölçülmesi ve yavaş çalışan bölümlerin tespiti.</li>
<li><strong>Hizmet geliştirme</strong> — Ziyaretçilerin sitede nasıl gezindiğini anlayarak içerik ve hizmetlerimizi iyileştirmek.</li>
<li><strong>Reklam</strong> — İlgi alanlarınıza uygun reklamların gösterilmesi.</li>
</ul>

<h2>Reklam Amaçlı Çerez Kullanımımız</h2>
<p>Sitemizde Google AdSense ve üçüncü taraf çerezler kullanılmaktadır.</p>
<ul>
<li>DoubleClick DART çerezleri</li>
<li>Üçüncü taraf reklam şirketleri</li>
<li>İlgi alanına dayalı reklamlar</li>
</ul>

<h2>Çerezleri Kontrol Etme ve Silme</h2>
<p>Çerezleri tarayıcınızın ayarlarından yönetebilir veya silebilirsiniz:</p>
<ul>
<li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
<li><a href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
<li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
<li><a href="https://support.microsoft.com/tr-tr/microsoft-edge/microsoft-edge-de-tanimlama-bilgilerini-silme-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
</ul>
<p>Çerezleri tamamen engellemeniz durumunda sitenin bazı bölümleri beklendiği gibi çalışmayabilir.</p>

<h2>Toplanan Veriler</h2>
<p>Çerezler aracılığıyla toplanan başlıca veriler şunlardır:</p>
<ul>
<li><strong>Teknik veriler</strong> — IP adresi, tarayıcı türü ve sürümü, işletim sistemi, ekran çözünürlüğü.</li>
<li><strong>Gezinme verileri</strong> — Ziyaret ettiğiniz sayfalar, sayfada geçirilen süre, siteye hangi bağlantıdan geldiğiniz.</li>
<li><strong>Tercih verileri</strong> — Site üzerinde yaptığınız seçimler ve ayarlar.</li>
<li><strong>Form verileri</strong> — Teklif ve iletişim formlarında tarafınızca girilen bilgiler.</li>
</ul>
<p>Bu veriler, <a href="/gizlilik-politikasi">Gizlilik Politikamızda</a> belirtilen esaslar çerçevesinde işlenir.</p>

<h2>Gömülü İçerik</h2>
<p>Diğer sitelerden gömülen içerikler (harita, video vb.) kendi çerez politikalarına tabidir.</p>

<h2>Veri Saklama</h2>
<ul>
<li><strong>Yorum verileri</strong> — Süresiz</li>
<li><strong>Medya dosyaları</strong> — 2 yıl</li>
<li><strong>İletişim formları</strong> — 6 ay</li>
<li><strong>Analiz verileri</strong> — 3 yıl</li>
</ul>

<h2>Haklarınız</h2>
<ul>
<li><strong>Erişim Hakkı</strong> — Kişisel verilerinize erişim talep etme hakkı.</li>
<li><strong>Düzeltme Hakkı</strong> — Yanlış verilerin düzeltilmesini isteme hakkı.</li>
</ul>
<p>Haklarınızın tamamı ve başvuru yöntemi için <a href="/gizlilik-politikasi">Gizlilik Politikamıza</a> bakabilirsiniz.</p>

<h2>Yasal Dayanak</h2>
<ul>
<li>KVKK Madde 10 — Aydınlatma Yükümlülüğü</li>
<li>GDPR Madde 13 — Bilgilendirme Yükümlülüğü</li>
</ul>
`.trim()

const SAYFALAR = [
  {
    slug: 'gizlilik-politikasi',
    title: 'Gizlilik Politikası',
    subtitle: 'Kişisel verilerinizi hangi amaçla işlediğimizi, ne kadar süre sakladığımızı ve haklarınızı açıklar.',
    content: GIZLILIK,
    lastUpdated: new Date('2024-01-15'),
  },
  {
    slug: 'kullanim-sartlari',
    title: 'Kullanım Şartları',
    subtitle: 'Sitemizi ve hizmetlerimizi kullanırken geçerli olan koşullar.',
    content: SARTLAR,
    lastUpdated: new Date('2025-03-23'),
  },
  {
    slug: 'cerez-politikasi',
    title: 'Çerez Politikası',
    subtitle: 'Sitemizde kullanılan çerezler, amaçları ve nasıl yönetebileceğiniz.',
    content: CEREZ,
    lastUpdated: new Date('2024-10-09'),
  },
]

const p = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

let eklenen = 0
let atlanan = 0
for (const sayfa of SAYFALAR) {
  const mevcut = await p.policyPage.findUnique({ where: { slug: sayfa.slug } })
  if (mevcut) {
    console.log(`  atlandı  ${sayfa.slug} (kayıt zaten var, üzerine yazılmadı)`)
    atlanan++
    continue
  }
  await p.policyPage.create({ data: sayfa })
  console.log(`  eklendi  ${sayfa.slug}  (${sayfa.content.length} karakter)`)
  eklenen++
}

console.log(`\n${eklenen} eklendi, ${atlanan} atlandı.`)
await p.$disconnect()
