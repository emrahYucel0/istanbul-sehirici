// BLOG — ESKİ DOMAIN'DEN AYRIŞTIRMA VE OTORİTE TURU (M11B)
//
// ─────────────────────────────────────────────────────────────────────
// NEDEN BU TUR VAR
//
// İstanbul sitesindeki on Post kaydı, evenakliyatevden.com'daki yazıların
// BİREBİR kopyasıydı. Varsayım değil, ölçüm: üç yazı eski adresten
// read-only çekildi ve H1, h2 dizisi ve paragraf metinleri harfi harfine
// aynı çıktı (rapor: cross-domain baseline).
//
// Ayrıştırma EŞ ANLAMLI KELİME DEĞİŞTİREREK yapılmadı. Her yazıda değişen
// şey tez ve bölüm organizasyonu: hangi soruyu sorduğu, bilgiyi hangi
// eksene göre dizdiği. Bazı teknik gerçekler (nakliye vidası, kompresör
// yağı, tabakların dik dizilmesi, kedinin taşıma kabına alıştırılması)
// KASITLI OLARAK korundu — onlar doğru bilgi; ayrıştırma doğruyu atmak
// değil, aynı doğruyu farklı bir editoryal çalışmayla anlatmaktır.
//
// ─────────────────────────────────────────────────────────────────────
// UZUNLUK KASITLI OLARAK EŞİTLENMEDİ
//
// Yedi hizmet sayfası 700–900 kelimeye çıktı diye blog uzatılmadı
// (M8'de konan kural). Yazıların çoğu 370–470 kelime; #4 gerçek bir
// otorite yeniden yazımı olduğu için ~560. Her paragrafın yeni bir karar
// bilgisi taşıması ölçü olarak alındı, kelime sayısı değil.
//
// ─────────────────────────────────────────────────────────────────────
// KAPATILAN İDDİALAR (M10 claim scan · C1–C8)
//
//   C1  #1  "keşif ücretsizdir"                      → cümle kaldırıldı
//   C2  #2  "ücretsiz keşif randevusu alın"          → cümle kaldırıldı
//   C3  #12 "en sakin ve en uygun fiyatlı dönem"     → tez değişti, iddia yok
//   C4  #12 "Kuvvetli rüzgârda ... kullanılmaz"      → koşullu, saha kararı
//   C5  #14 "anlaşmazlıkların neredeyse tamamı"      → istatistik kaldırıldı
//   C6  #14 "Depozitoyu Eksiksiz Almanın Yolu"       → başlık taahhütsüz
//   C7  #15 "sorunu tamamen ortadan kaldırıyor"      → excerpt yeniden
//   C8  #3  "Ağır alta, hafif üste" mutlak kuralı    → denge olarak anlatıldı
//   C9  #4  sigorta çerçevesi                        → genel tüketici rehberi
//
// #4'te KASITLI OLARAK VERİLMEYENLER: bildirim süresi, parasal limit,
// eksper zorunluluğu, kapsam listesi. Hiçbiri işletmeden doğrulanmadı.
// Yazı "şunlar kapsam dışıdır" demiyor, "şu başlıkları kontrol edin" diyor
// ve sonunda açık çerçeve cümlesi taşıyor.
//
// ─────────────────────────────────────────────────────────────────────
// İSTANBUL BAĞLAMI — SEMT ADI DOLGUSU YOK
//
// Bağlam yalnız kararı değiştirdiği yerde: aracın yanaşma noktası (#1),
// yük asansörü izni ve kabin ölçüsü (#2, #10), yol durumunun güzergâhı
// etkilemesi (#12). #13 ve #14 İstanbul operasyonuyla doğrudan ilgili
// olmadığı için oralarda İstanbul HİÇ GEÇMİYOR — zorlanmadı.
//
// ─────────────────────────────────────────────────────────────────────
// DEĞİŞMEYENLER
//   slug            on kayıtta da aynı (kök adres mimarisi dondurulmuş)
//   image/imagePath dokunulmadı (asset borçları raporda, ayrı tur)
//   isActive        dokunulmadı
//   publishedAt     dokunulmadı — ilk yayın tarihi geçmiştir, düzenleme onu
//                   değiştirmez (bkz. şema yorumu)
//   shortTitle      prev/next etiketlerini besliyor, ellenmedi
//   title           yalnız ÜÇ kayıtta değişti (#10, #12, #14) ve üçünde de
//                   sebep içerikle uyum: #10 artık "6 hata" değil, #12
//                   "avantaj" iddiasını taşımıyor, #14 sonuç vaadi vermiyor
//   imageAlt        yalnız iki kayıtta "Profesyonel" reklam sıfatı çıktı
//
// KULLANIM
//   node --env-file=.env scripts/blog-istanbul-authority.mjs          (uygula)
//   node --env-file=.env scripts/blog-istanbul-authority.mjs --geri   (eskiye dön)
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../prisma/generated/client/client.ts'

const YEDEK = 'scripts/.blog-istanbul-authority-onceki.json'

/** Yedeklenen/yazılan alanlar. slug, image, isActive, publishedAt YOK. */
const ALANLAR = ['title', 'subtitle', 'excerpt', 'metaTitle', 'metaDescription', 'imageAlt', 'content']

const YAZILAR = {
  // ══════════════════════════════════════════════════════════════════
  // #1 — /fiyat-hesaplama ile niyet ayrımı.
  // Eski yapı: numaralı altı kalem + karşılaştırma listesi.
  // Yeni yapı: "neden" ekseni. İKİNCİ BİR KESİN ALTILI LİSTE ÜRETİLMEDİ —
  // hesaplayıcı zaten "altı girdi" diyor ve "başka değişken girmiyor"
  // taahhüdünde bulunuyor; blog o listeyi tekrarlasaydı iki farklı "altı"
  // ortaya çıkardı.
  // ══════════════════════════════════════════════════════════════════
  'evden-eve-nakliyat-fiyatlari-neye-gore-belirlenir': {
    subtitle: 'Aynı ev, iki farklı teklif: aradaki farkı yapan koşullar',
    metaTitle: 'Nakliyat Fiyatını Ne Belirler? Koşulların Etkisi',
    metaDescription:
      'Nakliyat teklifini değiştiren şey ev büyüklüğü değil, iki adresin erişim koşulları. Hangi koşulun fiyata nasıl yansıdığını örneklerle açıklıyoruz.',
    excerpt:
      'Aynı ev için gelen iki teklif neden tutmuyor? Hacim, iki adresin erişimi, aracın durabildiği nokta ve özel parçalar fiyatı nasıl değiştiriyor, tek tek bakıyoruz.',
    content: `<p>Aynı büyüklükteki iki daire için gelen iki teklif birbirini tutmuyorsa bunun sebebi genellikle firmalar değil, o iki taşımanın aynı iş olmamasıdır. Fiyatı belirleyen şey eşyanın kendisi kadar, o eşyanın iki adres arasında nasıl hareket edeceğidir.</p>

<h2>Hacim bir sayı değil, bir yerleşim sorusu</h2>
<p>Fiyatın temelini metreküp belirler ama metreküp oda sayısından çıkmaz. Kitaplığı ve arşivi olan bir 2+1, seyrek döşenmiş bir 3+1'den fazla yer tutabilir. Sayılan şey oda değil, araca yerleşecek kutu ve mobilyadır. Bu yüzden "kaç oda" sorusunun cevabı bir tahmin verir, teklif vermez.</p>
<p>Hacim aynı zamanda araç kararını belirler. İki küçük sefer mi, tek büyük araç mı sorusu; ekip sayısını, işte geçen saati ve şehir içinde güzergâhın kaç kez kat edileceğini birlikte değiştirir.</p>

<h2>İki adres ayrı ayrı fiyatlanır</h2>
<p>Taşımanın iki ucu var ve ikisi de süreye giriyor. Yük asansörü olan bir binadan çıkmak ile beşinci kata merdivenle çıkmak aynı iş değildir; çıkış adresi kolay, varış adresi zor olduğunda teklif kolay olandan değil zor olandan etkilenir.</p>
<p>Asansörün varlığı tek başına da yetmiyor. Kabin ölçüsü, kanepenin, gardırop gövdesinin ya da buzdolabının geçip geçmeyeceğini belirler. Geçmiyorsa yöntem değişir: merdivenle taşıma ya da <a href="/asansorlu-nakliyat">dış cephe asansörü</a> devreye girer, bu da süreyi ve ekipmanı birlikte değiştirir.</p>

<h2>Aracın durabildiği nokta ile kapı arası</h2>
<p>İstanbul'da teklifi en çok şaşırtan kalem çoğu zaman burada oluyor. Dar sokak, araç girişinin saatle sınırlandığı bir cadde, site içinde aracın bloğa yanaşamaması ya da yükleme için yer bulunamaması, her kutunun elde taşınacağı mesafeyi uzatır. Yüz metrelik bir yürüme mesafesi tek başına küçük görünür; yüz kutuyla çarpıldığında iş saatine dönüşür.</p>

<h2>Bazı parçalar kendi yöntemini getirir</h2>
<p>Piyano, kasa, akvaryum, büyük ekran televizyon, antika mobilya ya da yerinde sökülmesi gereken gömme gardırop standart bir koltuk gibi taşınmaz. Bunlar ayrı ambalaj, bazen ek ekipman ve marangoz işi ister. Bu parçaları önceden söylemek, teklifin sonradan değişmesini önleyen en pratik adımdır.</p>

<h2>Teklifleri karşılaştırırken</h2>
<p>İki teklif arasındaki fark çoğu zaman fiyattan değil, kapsamın farklı olmasından gelir. Karşılaştırmayı anlamlı yapan şey aynı soruları ikisine de sormaktır: ambalaj malzemesi dahil mi, ayrıca mı faturalanıyor? Demontaj ve montaj fiyatın içinde mi? Sorumluluğun kapsamı nasıl tanımlanmış? Tarih ve saat nasıl planlanıyor?</p>
<p>Kaba bir aralığı önceden görmek isterseniz <a href="/fiyat-hesaplama">fiyat hesaplama aracı</a> ev büyüklüğü, mesafe, kat ve asansör bilgisinden bir tahmin üretir. Adresin kendi koşulları — sokak genişliği, aracın yanaşma noktası, kabin ölçüsü — o hesaba girmez; onlar yerinde görülüp <a href="/evden-eve-nakliyat">taşıma planına</a> yazılır.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // #2 — Haftalık omurga KORUNDU (kullanışlıydı) ama her hafta artık bir
  // İŞ LİSTESİ değil bir KARAR TÜRÜ: erişim, hacim, başkasına bağlı işler,
  // cihazlar. Eski domaindeki "4/3/2/1 hafta kala" madde listesiyle aynı
  // metin kalmadı.
  // ══════════════════════════════════════════════════════════════════
  'tasinma-oncesi-yapilacaklar-listesi': {
    subtitle: 'Erişim ve eşya kararlarını dört haftaya yayan hazırlık planı',
    metaTitle: 'Taşınma Öncesi Hazırlık: Dört Haftalık Plan',
    metaDescription:
      'Taşınma gününü uzatan işlerin çoğu daha önce verilmemiş kararlardır. Erişim, hacim ve bina izinlerini haftalara bölen bir hazırlık planı.',
    excerpt:
      'Taşınma gününde yaşanan tıkanmaların çoğu, haftalar önce alınmamış kararlardan çıkar. Erişim, hacim ve izin kararlarını dört haftaya yaydık.',
    content: `<p>Taşınma gününde yaşanan tıkanmaların çoğu o gün alınan kararlardan değil, haftalar önce alınmamış kararlardan çıkar. Eşyanın ne kadarının gideceği, iki adrese hangi saatte girilebileceği ve hangi parçanın sökülmesi gerektiği belli olduğunda gün kendiliğinden kısalır.</p>

<h2>Dört hafta kala: iki adresi ayrı ayrı düşünün</h2>
<p>Taşınma tek bir adres işi değil, iki ayrı erişim probleminin aynı güne denk getirilmesidir. Çıkışta kolay olan şey varışta zor olabilir. Bu hafta ikisini de aynı sorularla gözden geçirin: araç binaya kaç metre yanaşabiliyor, yük asansörü var mı, varsa kabin hangi ölçüde, merdiven dönüşü büyük parçayı geçirir mi?</p>
<p>Tarih de bu hafta konuşulur. Ay başı, ay sonu ve hafta sonları yoğun dönemlerdir; esnek olabildiğiniz bir aralık vermek, planı iki adresin de uygun olduğu bir güne oturtmayı kolaylaştırır.</p>

<h2>Üç hafta kala: hacmi küçültme haftası</h2>
<p>Taşınmayacak her eşya hem araçtan hem günden düşer. Bu yüzden eleme paketlemeden önce gelir — sonradan azalan eşya çoğu zaman plana geri yansımaz. Az kullanılan yerlerden başlayın: depo, kiler, misafir odası.</p>
<p>Kutuları oda adıyla değil, açılma sırasıyla etiketleyin. "Mutfak" bir kutuyu bulmaya yetmez; "mutfak — üst dolap — nadir" hangi kutunun yeni evde bekleyebileceğini söyler.</p>

<h2>İki hafta kala: sizin dışınızda kalan işler</h2>
<p>Bazı işler sizin takviminize değil başkasının takvimine bağlıdır ve geciktiğinde günü doğrudan etkiler. Site ya da apartman yönetimiyle konuşup yük asansörü kullanımı, araç girişi ve çalışma saatleri için izin gerekip gerekmediğini öğrenin; bazı binalarda bu izin gün ve saat sınırı getirebiliyor.</p>
<p>Abonelik nakil ve kapama başvurularını da bu hafta yapın: elektrik, su, doğalgaz, internet. Yeni adreste ısıtmanın taşınma gününden önce açılmış olması özellikle kış aylarında işi kolaylaştırır.</p>
<p>Yeni evin yerleşim planını kabaca çıkarın. Hangi mobilyanın hangi odaya gireceği belliyse ekip kutuyu ikinci kez taşımaz.</p>

<h2>Son hafta: cihazlar ve ayrılacaklar</h2>
<p>Buzdolabı taşımadan en az 24 saat önce boşaltılıp fişten çekilir, buzu çözülür ve içi kurulanır. Çamaşır makinesinin nakliye vidalarını şimdiden bulun; yerinde arandığında bulunamayan parça genellikle budur.</p>
<p>Değerli evrak, mücevher ve düzenli kullandığınız ilaçları ayrı bir kutuda toplayıp yanınıza alın. Aynı mantıkla <a href="/tasinma-gunu-ilk-gece-kutusu">ilk gece kutunuzu</a> da bu hafta hazırlayın.</p>

<h2>Taşınma günü</h2>
<p>Ekibe yerleşim planını verin. Yükleme bittikten sonra evi bir kez daha dolaşmak da bu güne dahil: geride kalan eşya genellikle dolap üstünde, balkonda ya da kombi dolabında çıkıyor. Teslimatta eşyayı birlikte gözden geçirin — fark edilen bir durum, ekip henüz oradayken en kolay çözülendir.</p>
<p>Hazırlığın kendisi de plana giriyor. Hangi koşulun taşımayı nasıl değiştirdiğini <a href="/evden-eve-nakliyat">evden eve nakliyat</a> sayfasında ayrıntılı anlatıyoruz.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // #3 — Eski yapı eşya türüne göreydi (tabak / cam / televizyon).
  // Yeni yapı KIRILMA SEBEBİNE göre: boşluk, yön, kutunun kendisi, denge,
  // etiket. C8 burada kapanıyor: "ağır alta hafif üste" mutlak kuralı
  // yerine hangi parçanın üstündeki yükü taşıyabildiği anlatılıyor.
  // ══════════════════════════════════════════════════════════════════
  'kirilacak-esyalar-nasil-paketlenir': {
    subtitle: 'Malzeme, yön ve kutu seçimini kırılma sebebine göre kurmak',
    metaTitle: 'Kırılacak Eşya Paketleme: Boşluk Neden Kırar?',
    metaDescription:
      'Kutu içinde hareket eden eşya yolda kendi kendine vurur. Sarma, sabitleme, yön ve kutu seçimini kırılma sebebine göre anlatan bir paketleme rehberi.',
    excerpt:
      'Kırılabilir eşyada belirleyici olan ne kadar sarıldığı değil, kutunun içinde hareket edip etmediği. Malzeme, yön ve kutu kararlarını anlatıyoruz.',
    content: `<p>Bir kutunun içindeki tabak, yolda aldığı darbeyle değil çoğu zaman kendi hareketiyle kırılır. Sarma malzemesi bu hareketi yumuşatır ama durdurmaz; durduran şey kutunun içinde boşluk kalmamasıdır. Paketleme kararlarının çoğu tek bir soruya bağlanıyor: bu parça kutunun içinde oynayabiliyor mu?</p>

<h2>Sarmak ile sabitlemek ayrı iki iş</h2>
<p>Balonlu naylon eşyanın yüzeyini korur; kabarcıklı yüz içeri bakacak şekilde sarılır. Ama sarılmış bir bardak da kutunun içinde kayabilir. İkinci iş kalan boşluğu doldurmaktır: köpük dolgu, ambalaj kâğıdı ya da katlanmış tekstil. Gazete kâğıdı porselende tercih edilmez, mürekkep bırakır.</p>
<p>Kontrol basit: kutuyu kapatmadan önce hafifçe sallayın. İçeride hareket duyuyorsanız kutu hazır değildir.</p>

<h2>Yön, malzemeden önce gelir</h2>
<p>Bazı parçalarda doğru duruş, ne kadar sarıldığından daha belirleyici. Tabaklar üst üste değil, plaka gibi dik dizilir; yatay istiflenen tabak üsttekinin ağırlığıyla ortadan çatlayabilir. Bardaklar tek tek sarılır, ağızları yukarı bakar ve aralarına karton ayraç girer.</p>
<p>Ayna, cam ve tablo dik taşınır — yatık duran büyük cam kendi ağırlığıyla ortadan kırılabilir. Cam yüzeye köşegen çekilen bant, kırılma hâlinde parçaların dağılmasını sınırlar.</p>

<h2>Kutunun kendisi de bir malzeme</h2>
<p>Marketten alınan kutular bu iş için üretilmiyor; yük bindiğinde tabanı verebilir. Çift oluklu karton tercih edilir. Bantlama da alt ve üst birleşimin ikisini birden kapatacak biçimde, H düzeninde yapılır. Kutu boyutu da bir karar: kırılabilir eşya için küçük kutu, hem ağırlığı hem içerideki hareket payını sınırlar.</p>

<h2>Ağırlık bir kural değil, bir denge</h2>
<p>Yerleşimi belirleyen şey sabit bir sıralama değil, hangi parçanın üstündeki yükü taşıyabildiği. Kitap dolu bir kutu tek kişinin rahat kaldırabileceği ağırlığı geçmemeli — taşınamayan kutu düşürülme riskiyle zaten kendi içeriğini tehdit eder. Kırılabilir parçalar ayrı işaretlenip araçta üstlerine yük gelmeyecek biçimde yerleştirilir.</p>

<h2>Etiket, kutunun ikinci kez taşınmasını önler</h2>
<p>Kutunun üstüne yalnız "kırılacak" yazmak eksik bilgi. Hangi odaya gideceği ve içinde ne olduğu da yazılırsa ekip kutuyu doğrudan doğru odaya bırakır.</p>
<p>Paketlemeyi ekibin yapmasını tercih ederseniz malzeme ve yöntem seçimi <a href="/paketleme-hizmeti">paketleme hizmeti</a> kapsamında planlanıyor; kırılabilir parçalar ayrı işaretlenip araçta ayrı yerleşiyor.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // #4 — GERÇEK OTORİTE YENİDEN YAZIMI.
  //
  // Eski yazı "genellikle kapsam içinde olanlar / kapsam dışında kalanlar"
  // diye İKİ LİSTE veriyordu. Bu listeler doğrulanmamıştı ve okuyucuya
  // işletmenin belirli bir poliçe sunduğunu ima ediyordu — hizmet
  // sayfalarının M2'de kaçındığı çerçevenin tam tersi.
  //
  // Yeni yazı liste vermiyor, SORU veriyor. Sonunda açık çerçeve cümlesi
  // var. Kapanış, hizmet sayfalarındaki sorumluluk diliyle birebir
  // hizalandı ("sorumluluğun nasıl tanımlandığını taşımadan önce
  // netleştiriyoruz").
  // ══════════════════════════════════════════════════════════════════
  'nakliyat-sigortasi-neyi-kapsar': {
    subtitle: 'Genel bilgilendirme: teklif alırken sorulması gereken başlıklar',
    metaTitle: 'Nakliyat Sigortası: Poliçede Neye Bakmalı?',
    metaDescription:
      'Nakliyat sigortası tek bir standart paket değildir. Sigortalanan taraf, değer beyanı, kapsam dışı başlıklar ve hasar kaydı için sorulacak sorular.',
    excerpt:
      'Nakliyatta sigorta tek bir standart paket değil; kapsam poliçeye ve hizmete göre değişir. Teklif alırken neyi sormanız gerektiğini genel çerçevede anlatıyoruz.',
    imageAlt: 'Nakliyeci teslim sırasında tespit tutanağı dolduruyor',
    content: `<p>Nakliyatta "sigorta" tek bir standart paketin adı değildir. Kapsam; sözleşmeye, seçilen teminata ve hizmetin kendisine göre değişir. Bu yüzden "sigortalıyız" cümlesi doğru olabilir ama tek başına hiçbir soruyu cevaplamaz. Aşağıdaki başlıklar, teklif alırken neyi sormanız gerektiğini genel çerçevede anlatıyor.</p>

<h2>"Sigortalı taşıma" tek başına ne söylüyor?</h2>
<p>Bu ifade pratikte çok farklı düzenlemeleri anlatmak için kullanılıyor. Taşıyıcının yasal sorumluluğunu karşılayan bir düzenleme de, eşyanın kendi değeri üzerinden ayrıca yapılan bir düzenleme de aynı cümleyle özetlenebiliyor. İkisi aynı şey değildir ve hasar hâlinde farklı sonuç verir. İlk soru bu yüzden basit: burada tam olarak ne sigortalanıyor?</p>

<h2>Sigortalanan taraf kim, sigortalanan şey ne?</h2>
<p>Bir düzenlemede korunan taraf taşıyıcı firma olabilir, eşya sahibi olabilir ya da ikisi farklı kapsamlarla yer alabilir. Poliçenin veya sözleşmenin bunu açıkça belirtmesi gerekir.</p>
<p>"Eşya" kelimesinin de netleşmesi lazım: bütün ev eşyası mı, yalnız belirli parçalar mı? Ambalajı kimin yaptığı kapsamı değiştiriyor mu? Bu ikinci soru özellikle önemli, çünkü müşterinin kendi paketlediği kutuların içi çoğu düzenlemede ayrı değerlendiriliyor.</p>

<h2>Eşyanın değeri nasıl ele alınıyor?</h2>
<p>Çoğu düzenlemede ödeme, eşyanın önceden beyan edilen değeri üzerinden hesaplanır. Bu taşımadan önce yapılan bir işlemdir: antika, sanat eseri, koleksiyon parçası ya da yüksek değerli elektronik gibi parçaların ayrıca belirtilmesi gerekir. Beyan edilmemiş bir parça için sonradan tam değer üzerinden talepte bulunmak güçleşiyor.</p>
<p>Değerin nasıl belirlendiğini de baştan sorun: toplam beyan mı, parça bazlı liste mi? Hasar anında tartışılacak konu genellikle burada başlıyor.</p>

<h2>Kapsam dışı başlıklar nerede yazıyor?</h2>
<p>Kapsam dışı maddeler firmadan firmaya ve poliçeden poliçeye değiştiği için burada bir liste vermek yanıltıcı olur. Ama hangi başlıkların kontrol edileceği bellidir: müşterinin kendi paketlediği kutuların içi, eşyanın kendi yapısal kusurundan kaynaklanan bozulmalar, nakit para ve ziynet gibi yanınızda taşınması beklenen değerler, resmî evrak, eşyanın niteliği gereği oluşan aşınma. Poliçenin bu bölümünü taşımadan önce okumak, hasardan sonra okumaktan çok daha kolay.</p>

<h2>Hasar hâlinde hangi kayıt işinize yarar?</h2>
<p>Süreç poliçe şartlarına göre yürür, ama hangi düzenleme olursa olsun elinizi güçlendiren şey aynı: kayıt.</p>
<ul>
<li>Teslimat anında eşyayı ekip henüz oradayken gözden geçirin.</li>
<li>Fark edilen durumun kaydını birlikte tutun.</li>
<li>Etkilenen parçayı ve varsa ambalajını birlikte fotoğraflayın.</li>
<li>Bildirimi sözlü değil yazılı yapın.</li>
</ul>
<p>Bildirim için tanınan süre ve istenen belgeler poliçeye göre değişir; ikisini de sözleşmeyi imzalamadan önce öğrenin.</p>

<h2>Teklif alırken sorulacak beş şey</h2>
<ul>
<li>Bu taşımada sigortalanan taraf ve sigortalanan kapsam ne?</li>
<li>Ödeme neye göre hesaplanıyor, değer beyanı nasıl alınıyor?</li>
<li>Kapsam dışı durumlar nerede yazılı, okuyabilir miyim?</li>
<li>Ambalajı kimin yaptığı kapsamı değiştiriyor mu?</li>
<li>Hasar bildirimi için hangi süre ve hangi belgeler isteniyor?</li>
</ul>

<p>Bu yazı genel bir bilgilendirmedir; sizin için geçerli kapsam yalnız size sunulan poliçe ve sözleşme üzerinden doğrulanabilir. Kendi taşımanızda sorumluluğun nasıl tanımlandığını taşımadan önce sizinle netleştiriyoruz — ayrıntısı <a href="/evden-eve-nakliyat">ev taşıma hizmetimizin</a> sayfasında.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // #10 — M10'un en temiz iki yazısından biri. Teknik gücü KORUNDU:
  // nakliye vidası, kompresör yağı, filtre suyu, yetkili gaz bağlantısı.
  // Değişen: eksen. Eski yazı "6 hata" listesiydi; yeni yazı cihazın
  // hazırlığı + binadan çıkış + devreye alma zinciri.
  //
  // "en az birkaç saat dik bekletilmelidir" ifadesi KALDIRILDI: süre
  // cihaza göre değişiyor ve işletmeden doğrulanmadı; kullanım kılavuzuna
  // yönlendiriliyor.
  // ══════════════════════════════════════════════════════════════════
  'beyaz-esya-tasima-rehberi': {
    title: 'Beyaz Eşya Taşıma: Hazırlık, Çıkış ve Devreye Alma',
    subtitle: 'Cihaz hazırlığı, binadan çıkış yolu ve yeni adreste devreye alma',
    metaTitle: 'Beyaz Eşya Taşıma: Hazırlık ve Devreye Alma',
    metaDescription:
      'Buzdolabı, çamaşır makinesi ve fırında taşıma öncesi hazırlık, çıkış yolunun ölçülmesi ve yeni adreste devreye alma sırası tek bir plana bağlıdır.',
    excerpt:
      'Beyaz eşyada arızaların çoğu darbeden değil hazırlıksızlıktan çıkar. Cihazın kendi hazırlığı, binadan çıkış yolu ve yeni adreste devreye alma birlikte planlanır.',
    content: `<p>Beyaz eşyada taşıma sonrası çıkan arızaların çoğu yolda alınan darbeden değil, cihazın taşınmaya hazırlanmamış olmasından geliyor. Ama hazırlık tek başına yetmiyor: cihazın binadan nasıl çıkacağı ve yeni adreste nasıl devreye alınacağı da aynı planın parçası.</p>

<h2>Hazırlık cihazın kendi içinde başlıyor</h2>
<p>Buzdolabının içi taşımadan en az 24 saat önce boşaltılır; fişi çekilir, buzu çözülür ve iç yüzey kurulanır. Bu yapılmazsa biriken su yolda dışarı çıkar ve hem cihazın elektronik aksamını hem yanındaki eşyayı etkileyebilir.</p>
<p>Buzdolabı dik taşınır. Kompresördeki yağ, dolap yatırıldığında soğutucu hatlarına kaçabilir. Zorunlu olarak yatırıldıysa yeni adreste fişe takılmadan önce bir süre dik bekletilmesi gerekiyor; bu sürenin ne kadar olacağını cihazın kendi kullanım kılavuzu söyler.</p>
<p>Çamaşır makinesinin tamburu yaylar üzerinde asılı durur. Taşıma sırasında tamburu sabitleyen nakliye vidaları, makine ilk kurulurken sökülüp bir kenara konur ve taşımadan önce geri takılır. Takılmazsa tambur yolda savrulur; yatak ve amortisör hasarı buradan çıkar. Vidalar bulunamıyorsa yetkili servisten temin edilebiliyor.</p>

<h2>Su ve gaz bağlantısı ayrı bir iş</h2>
<p>Çamaşır ve bulaşık makinesinde hortumlarda ve pompada su kalır. Filtre kapağı açılıp kalan su alınmazsa bu su yolda dışarı çıkar.</p>
<p>Fırın ve ocakta doğalgaz bağlantısını sökmek ve yeniden kurmak yetkili kişiye ait bir iş. Bu bir tasarruf kalemi değil; taşınma gününün planına ayrı bir randevu olarak girer.</p>

<h2>Kapı, kabin ve merdiven dönüşü</h2>
<p>Beyaz eşya tek parçadır; sökülüp küçültülemez. Bu yüzden çıkış yolu baştan ölçülür: kapı genişliği, asansör kabininin iç ölçüsü ve merdiven sahanlığındaki dönüş. İstanbul'daki dar merdiven boşluklarında sorun çoğu zaman asansör kabininden önce dönüş noktasında çıkıyor. Geçmiyorsa yöntem değişir: merdivenle taşıma ya da <a href="/asansorlu-nakliyat">asansörlü taşıma</a> planlanır.</p>
<p>Kapaklar taşıma sırasında açılıp menteşesinden zarar görebilir. Bantla ya da streçle sabitlenir; boyaya zarar vermeyecek bir bant seçilir.</p>

<h2>Yeni adreste devreye alma</h2>
<p>Bağlantılar yapıldıktan sonra ilk çalıştırmayı siz oradayken yapın. Bir sızıntı ya da alışılmadık ses çıkacaksa bunu ekip binadan ayrılmadan görmek işi kolaylaştırır. Yatırılarak taşınmış bir buzdolabında bekleme süresi tamamlanmadan fişe takılmaması, en çok atlanan adım.</p>
<p>Söküm, taşıma ve yeniden kurulum sırası <a href="/evden-eve-nakliyat">ev taşıma planının</a> içinde belirleniyor; hangi bağlantının yetkili servise, hangisinin ekibe ait olduğu baştan konuşuluyor.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // #11 — M10'un en generic ve en kısa yazısıydı (184 kelime, %25 generic).
  // Eski yapı: üç soru + oda oda tarama + üç elden çıkarma yolu.
  // Yeni yapı: DÖRT SONUÇLU karar sistemi. Dördüncü sonuç (geçici saklama)
  // eskisinde hiç yoktu ve kararsız kalınan eşyanın araca binmesinin asıl
  // sebebi oydu.
  //
  // BELEDİYE/KURUM HİZMETİ UYDURULMADI: "elektronik atık normal çöpe
  // atılmaz" genel bir kural, bir toplama hizmeti vaadi değil.
  // ══════════════════════════════════════════════════════════════════
  'tasinirken-esyalardan-nasil-kurtulunur': {
    subtitle: 'Hacmi ve yeni evdeki düzeni birlikte belirleyen dört sonuç',
    metaTitle: 'Taşınmadan Önce Eşya Elemesi Nasıl Yapılır?',
    metaDescription:
      'Eleme, taşınacak hacmi ve yeni evdeki düzeni birlikte belirler. Kararsız kalınan eşyayı çözen dört sonuç ve elemenin keşiften önce yapılma sebebi.',
    excerpt:
      'Taşınmadan önceki eleme yalnız eşya azaltmak değil; araca girecek hacmi ve yeni evde kurulacak düzeni belirler. Kararı hızlandıran dört sonuç ve üç soru.',
    content: `<p>Taşınmadan önceki eleme bir temizlik işi gibi görünür ama aslında iki şeyi birden belirler: araca girecek hacmi ve yeni evde kurulacak düzeni. Taşınmayan her parça hem faturadan hem günden düşer; taşınan her parça ise yeni evde kendine bir yer ister. Karar bu ikisi birlikte düşünülünce kolaylaşıyor.</p>

<h2>Soru "atayım mı" değil, "nereye gidiyor"</h2>
<p>Eşyayı ikiye ayırmak — kalsın, gitsin — çoğu zaman tıkanır, çünkü kararsız kalınan her parça "kalsın" tarafına düşer. Dört sonucu baştan tanımlamak bu tıkanmayı açıyor:</p>
<ul>
<li><strong>Taşınacak:</strong> yeni evde yeri ve işi belli olan parçalar.</li>
<li><strong>Bağış ya da satış:</strong> kullanılabilir durumda olup size gerekmeyenler.</li>
<li><strong>Geri dönüşüm ya da atık:</strong> kullanılamaz durumda olanlar. Elektronik atık normal çöpe atılmaz; teslim yöntemini önceden araştırın.</li>
<li><strong>Geçici saklama:</strong> vazgeçemediğiniz ama yeni evde şimdilik yeri olmayanlar.</li>
</ul>
<p>Dördüncü seçenek genellikle atlanıyor ve kararsız parçaların araca binmesinin asıl sebebi bu. Yeni ev henüz hazır değilse ya da iki tarih arasında boşluk varsa bu parçalar için <a href="/esya-depolama">eşya depolama</a> ayrı bir seçenek olarak planlanabiliyor.</p>

<h2>Karar vermeyi hızlandıran üç soru</h2>
<p>Son bir yılda kullandım mı? Mevsimlik eşya bu sorunun dışında kalır; onun ölçüsü "geçen sezon" olur. Yeni evde yeri var mı? Oranın ölçüsüne oturmayan bir mobilya orada da aynı sorunu yaşatır, üstüne bir de taşınma bedeli biner. Bugün bozulsa yenisini alır mıydım? Cevap hayırsa o parça ihtiyaç değil, alışkanlık.</p>

<h2>Hacmi gerçekten değiştiren yerler</h2>
<p>Eleme her yerde aynı kazancı vermiyor. Kitaplık, depo ve balkon hacmi en çok büyüten yerler; kitap kutuları hem yer tutar hem ağırlık yapar. Mutfakta çift kalmış kaplar ve hiç kullanılmayan küçük ev aletleri, gardıropta bedeni tutmayan kıyafetler, banyoda yarım kalmış ürünler kısa sürede belirgin bir hacim farkı yaratıyor.</p>

<h2>Zamanlama: eleme keşiften önce</h2>
<p>Keşifte hesaplanan şey, o gün evde duran eşyadır. Sonradan azalan eşya plana ve teklife her zaman yansımayabilir. Satış düşünüyorsanız ilanın birkaç hafta önceden verilmesi gerekiyor; bağış yapacaksanız teslim yöntemini önceden ayarlayın. Son güne kalan eleme, eleme olmaktan çıkıp kutu doldurmaya dönüşür.</p>
<p>Elenen hacmin plana etkisini kabaca görmek isterseniz <a href="/fiyat-hesaplama">fiyat hesaplama</a> aracında ev büyüklüğünü değiştirerek aralığın nasıl kaydığına bakabilirsiniz.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // #12 — İKİ İDDİA BİRDEN KAPANIYOR.
  //
  // C3: "en sakin ve en uygun fiyatlı dönem" — doğrulanmamış fiyat
  //     karşılaştırmasıydı ve metaDescription'da, yani SERP'te duruyordu.
  //     Yazının "avantajları" bölümü tamamen kalktı; tez artık takvim
  //     değil, planın değişebilirliği.
  // C4: "Kuvvetli rüzgârda dış cephe asansörü kullanılmaz" — M5'te
  //     /asansorlu-nakliyat'tan tam olarak bu sınıf ifade çıkarılmıştı.
  //     Yerine kararın sahada, kurulumu yapan ekip tarafından verildiği
  //     yazıyor. SAYISAL EŞİK VERİLMEDİ.
  //
  // YAN ETKİ: eski yazıda 2 <h2> + 5 <h3> vardı ve M11A'nın teknik marjı
  // (eşik: 3 <h2>) bu tek yazıda görünmüyordu. Yeni yapı altı <h2>
  // kullanıyor; marj artık on yazının onunda da çıkıyor.
  // ══════════════════════════════════════════════════════════════════
  'kis-aylarinda-tasinmak': {
    title: 'Kış Aylarında Taşınmak: Hava ve Erişim Koşulları',
    subtitle: 'Havanın planı değiştirebildiği bir dönemde ne hazır olmalı',
    metaTitle: 'Kışın Taşınmak: Plan Neye Göre Değişir?',
    metaDescription:
      'Kışın plan hava ve erişim koşullarına göre gün içinde değişebilir. Zemin koruma, ıslanan ambalaj, dış cephe kararı ve ısınma için koşullu bir hazırlık.',
    excerpt:
      'Kışın taşınmanın farkı takvimde değil, planın ne kadar çabuk değişebileceğinde. Zemin, ambalaj, dış cephe operasyonu ve ısınma için koşullu bir plan.',
    content: `<p>Kışın taşınmanın farkı takvimde değil, planın ne kadar çabuk değişebileceğinde. Yağış, zemin ve yol durumu; yükleme saatini, kullanılacak yöntemi ve güzergâhı aynı gün içinde etkileyebiliyor. Bu yüzden kış planı yaz planından daha fazla yedek içeriyor.</p>

<h2>Taşınma günü tek bir saat değil, bir aralık</h2>
<p>Hava koşulları gün içinde değişebildiği için başlangıç saatini ve yükleme sırasını esnek tutmak işe yarıyor. Yol durumu İstanbul'da güzergâhı da etkiliyor: aynı iki adres arasındaki süre saate ve hava durumuna göre belirgin biçimde değişebiliyor. Çıkış ile varış arasındaki geçişe pay bırakmak, günü kurtaran şey oluyor.</p>

<h2>Zemin ve giriş güzergâhı</h2>
<p>Gün boyu ıslak ayakkabıyla girilip çıkılan bir evde zemin kaplaması ve halı zarar görebiliyor. Bu yüzden iki adreste de kapıdan odaya kadar olan hat örtüyle kapatılır. Bina girişi, rampa ve merdiven basamağı buzlandığında hem ekip hem eşya için risk oluşuyor; bu alanların taşımadan önce temizlenmiş olması işin ilk şartı.</p>

<h2>Ambalaj ıslanınca dayanımını kaybediyor</h2>
<p>Karton kutu ıslandığında dayanımını kaybeder. Yağış varsa araca aktarım örtü altında yapılır; elektronik ve kıymetli parçalar için su geçirmez bir katman ekleniyor. Yükleme sırası da değişebiliyor: dışarıda en az bekleyecek parçalar en son çıkar.</p>

<h2>Dış cephe operasyonu havaya bağlı</h2>
<p>Dış cephe asansörü kullanılacaksa hava koşulu doğrudan yöntemi etkiler. Rüzgâr, buzlanma ve zeminin kurulum için uygun olup olmaması yerinde değerlendirilir; koşullar uygun değilse iş o gün merdivenle ya da başka bir saatte planlanabiliyor. Bu karar sahada, kurulumu yapan ekip tarafından veriliyor. Yöntemin nasıl seçildiğini <a href="/asansorlu-nakliyat">asansörlü nakliyat</a> sayfasında anlatıyoruz.</p>

<h2>Cihazlar soğuktan sıcağa geçerken</h2>
<p>Soğukta bekleyen elektronik cihazların içinde, sıcak bir ortama alındığında yoğuşma oluşabilir. Televizyon, bilgisayar ve benzeri cihazları yeni adreste hemen fişe takmamak, oda sıcaklığına gelmelerini beklemek daha güvenli bir sıra.</p>

<h2>Yeni adres taşınmadan önce ısınmış olmalı</h2>
<p>Yeni adreste ısıtmanın taşınmadan önce devrede olması hem oturanın hem eşyanın işine yarıyor. Isınmamış bir eve girmek ilk geceyi gereksiz yere zorlaştırıyor. Ahşap mobilya ve müzik aleti gibi parçalar da ani sıcaklık değişiminden etkilenebiliyor.</p>
<p>Kışın asıl risk hava değil, hava için plan yapılmamış olması. Güzergâh örtüsü ve yedek ambalaj hazırsa kış, taşınmak için sanıldığından uygun bir dönem olabiliyor.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // #13 — M10'un en güçlü yazılarından. YENİDEN YAZIM MİNİMUMDA TUTULDU.
  //
  // Korunan özgün bilgi: "Kediler ve köpekler alanlarını kokuyla tanır",
  // taşıma kabının haftalar önce ortaya çıkarılması, battaniyedeki tanıdık
  // kokunun yıkanmaması, kedilerin ilk günlerde dışarı çıkarılmaması.
  //
  // Değişen: bölüm organizasyonu (eski domainle aynı üçlü yapı bırakıldı;
  // dördüncü bölüm eklendi) ve VETERİNERLİK DİLİ. Eski metin "Birkaç günü
  // aşan iştahsızlıkta veterinerle görüşün" diyerek kesin bir eşik
  // veriyordu; yeni metin eşiği kaldırıp değerlendirmeyi veterinere
  // bırakıyor.
  //
  // İSTANBUL BU YAZIDA HİÇ GEÇMİYOR — konunun operasyonla ilgisi yok,
  // zorlanmadı.
  // ══════════════════════════════════════════════════════════════════
  'evcil-hayvanla-tasinmak': {
    subtitle: 'Kabın alıştırılmasından yeni evde kademeli geçişe kadar',
    metaTitle: 'Evcil Hayvanla Taşınmak: Gün Nasıl Planlanır?',
    metaDescription:
      'Taşınma günü kaçma riskinin en yüksek olduğu an yükleme sürecidir. Kabın alıştırılması, hayvanın gün boyu nerede tutulacağı ve kademeli geçiş.',
    excerpt:
      'Kediler ve köpekler alanlarını kokuyla tanır; taşınma bu haritayı bir günde siler. Hazırlık, taşıma günü ve yeni eve kademeli geçiş için pratik bir plan.',
    content: `<p>Kediler ve köpekler yaşadıkları alanı kokuyla tanır. Taşınma, bu haritanın tek bir günde silinmesi demek. Zorlayan şey yeni evin kendisi değil, geçişin ne kadar ani olduğu — ve bu, planlanabilir bir şey.</p>

<h2>Hazırlık günler önce başlıyor</h2>
<p>Taşıma kabını taşınmadan haftalar önce ortaya çıkarın. Kabı yalnız veterinere giderken gören bir hayvan için o kutu tek başına bir uyarı işaretine dönüşüyor. Kapağı açık hâlde odada dursun, içine kendi battaniyesi konsun; hedef, kabın sıradan bir eşya hâline gelmesi.</p>
<p>Kimlik bilgilerini ve tasma künyesini yeni adrese göre güncelleyin. Aşı karnesi ve sağlık kayıtları taşıma günü kutuların içinde değil, yanınızda olsun.</p>

<h2>Taşıma günü: hayvanı operasyonun dışında tutmak</h2>
<p>Günün en riskli anı yükleme süreci: kapılar sürekli açık, ev kalabalık ve tanıdık düzen ortadan kalkmış durumda. Kaçma ihtimalinin en yüksek olduğu an bu.</p>
<p>Mümkünse hayvanı o gün başka bir yerde bırakın — tanıdık bir ev ya da pansiyon. Mümkün değilse kapısı kapalı boş bir odaya alın; mama kabı, tuvalet kabı ve yatağı yanında olsun, kapıya "lütfen açmayın" notu asılsın. O oda en son boşaltılır. Mama ve su gün boyu erişilebilir kalsın.</p>

<h2>Yeni evde kademeli geçiş</h2>
<p>Bütün evi bir anda açmayın. Önce tek bir odayı hazırlayın: mama, su, tuvalet kabı ve yatağı orada olsun. Diğer odalar sonraki günlerde kademeli olarak devreye girer.</p>
<p>Eski eşyalarını hemen yıkamayın. Battaniyesindeki tanıdık koku, alışma sürecini kolaylaştıran en pratik şey. Mama ve yürüyüş saatlerini eskisi gibi tutun; değişimin ortasında sabit kalan şey güven veriyor. Kediler ilk günlerde dışarı bırakılmaz — eski adrese dönmeyi deneyebiliyorlar.</p>
<p>Kendi ilk gecenizi de aynı mantıkla düşünün: hayvanın eşyaları gibi sizin <a href="/tasinma-gunu-ilk-gece-kutusu">ilk gece kutunuz</a> da diğer kolilerden ayrı dursun.</p>

<h2>Ne zaman veterinere danışmalı</h2>
<p>İlk günlerde saklanmak, iştahsızlık ve sessizlik sık görülen tepkiler. Ama bunun ne kadar süreceği ve neyin normal sayılacağı hayvana göre değişir; süren iştahsızlık, davranış değişikliği ya da hastalık belirtisi gördüğünüzde değerlendirmeyi veterinerinize bırakın. Taşınma öncesinde sakinleştirici ya da benzeri bir uygulama düşünüyorsanız bu da veteriner kararı.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // #14 — İKİ İDDİA BİRDEN.
  //
  // C6: Başlıktaki "Depozitoyu EKSİKSİZ Almanın Yolu" bir sonuç vaadiydi
  //     ve M8'de ofis subtitle'ından "iş kaybı olmadan" aynı gerekçeyle
  //     çıkarılmıştı. Yeni başlık ne vaat ediyor ne de sonuç söylüyor.
  // C5: "Depozito anlaşmazlıklarının NEREDEYSE TAMAMI ..." doğrulanmamış
  //     bir istatistikti; kaldırıldı.
  //
  // Yazı bilinçli olarak HUKUK DANIŞMANLIĞI DEĞİL: yasal sonuç, hak ya da
  // süre söylemiyor. Anlattığı şey hangi kaydın tutulacağı ve son bölüm
  // açıkça "bu adımların hiçbiri bir sonucu garanti etmez" diyor.
  //
  // İSTANBUL BU YAZIDA DA GEÇMİYOR — konu operasyonel değil.
  // ══════════════════════════════════════════════════════════════════
  'kirali-evden-cikarken-depozito': {
    title: 'Kiralık Evden Çıkarken Depozito İçin Kontrol Listesi',
    subtitle: 'Sözleşmeden çıkış tutanağına kadar tutulacak kayıtlar',
    metaTitle: 'Kiralık Evden Çıkış: Depozito Kontrol Listesi',
    metaDescription:
      'Çıkışta işinize yarayan tek şey kayıttır. Sözleşme, ev boşken yapılacaklar, sayaç ve anahtar teslimi ile çıkış tutanağı için kontrol listesi.',
    excerpt:
      'Depozito tartışmaları çoğunlukla evin giriş ve çıkış hâline dair kayıt olmadığında büyüyor. Sözleşmeden teslim tutanağına kadar pratik bir kontrol listesi.',
    imageAlt: 'Nakliyeci taşınan aileyi teslim süreci hakkında bilgilendiriyor',
    content: `<p>Çıkışta depozito konusunda yaşanan tartışmaların ortak noktası genellikle aynı: evin giriş ve çıkış hâline dair elde bir kayıt yok. Aşağıdaki başlıklar hukuki bir tavsiye değil; teslim sürecinde hangi kaydın işinize yarayacağını gösteren pratik bir kontrol listesi.</p>

<h2>Önce sözleşme ne diyor</h2>
<p>Çıkış bildirimi için tanınan süre, boya ve temizlik yükümlülüğü ve depozitonun iadesine ilişkin koşullar genellikle sözleşmede yazılıdır. Çıkış kararını verdiğinizde ilk okunacak belge bu. Bildirimi yazılı yapın; sözlü bildirimin sonradan gösterilecek bir karşılığı olmuyor.</p>
<p>Eve girerken tutulmuş bir tutanak ya da çekilmiş fotoğraflar varsa bulun. Giriş hâlini gösteren kayıt, çıkışta karşılaştırma yapılabilecek tek referans.</p>

<h2>Ev boşken yapılacaklar</h2>
<p>Eşya çıktıktan sonra ev ilk kez gerçek hâliyle görünür. Duvarda kalan askı ve raf delikleri, genellikle kiracının kapatması beklenen kalemler arasında. Temizlikte en çok bakılan yerler mutfak dolaplarının içi, fırın, banyo derzleri ve pencere çerçeveleri.</p>
<p>Kırık priz kapağı ya da düşmüş dolap kulbu gibi küçük işler, tamir edilmediğinde tutarla orantısız bir kesinti tartışmasına dönüşebiliyor. Yaptırdığınız yedekler dahil bütün anahtarlar teslim edilir.</p>

<h2>Sayaçlar, abonelikler ve ortak giderler</h2>
<p>Elektrik, su ve doğalgaz sayaç değerlerini fotoğraflayın; kapamayı son endeks üzerinden yapın. Aidat ve ortak gider borcunu kapatıp yönetimden buna dair bir yazı isteyin. İnternette süreli bir taahhüt varsa iptal yerine nakil seçeneğine bakın; iptalin cayma bedeli çıkabiliyor.</p>
<p>Bu başvuruların zamanlamasını taşınma takvimine oturtmak da ayrı bir iş; <a href="/tasinma-oncesi-yapilacaklar-listesi">taşınma öncesi hazırlık</a> yazısında haftalara bölmüştük.</p>

<h2>Teslim anında iki taraf</h2>
<p>Ev boş ve temizken her odayı ayrı ayrı görüntüleyin; çekim tarihi kaydın içinde saklı kalıyor. Turu ev sahibiyle birlikte yapın — bir itirazı olacaksa onu o anda duymak sonradan duymaktan iyi. Çıkış tutanağını iki taraf da imzalasın: eksik ya da hasar var mı, depozitonun ne zaman iade edileceği yazılı olsun. Sayaç değerlerini de tutanağa geçirin.</p>

<h2>Kaydın işi ne</h2>
<p>Bu adımların hiçbiri bir sonucu garanti etmez; anlaşmazlık yine çıkabilir. Ama konu evin giriş ve çıkış hâlinin karşılaştırılmasına geldiğinde, elinde görüntü ve tutanak olan taraf tartışmayı çok daha kısa kapatıyor. On dakikalık bir kayıt, aylara yayılabilecek bir yazışmanın yerini alabiliyor.</p>`,
  },

  // ══════════════════════════════════════════════════════════════════
  // #15 — C7: excerpt "bu sorunu TAMAMEN ORTADAN KALDIRIYOR" diyordu;
  // mutlak sonuç iddiasıydı, kaldırıldı.
  //
  // Eski yapı oda oda listeydi (Banyo / Yatak odası / Mutfak / Ev için /
  // Evrak çantası). Yeni yapı KARAR MANTIĞINA göre: kutunun işi ne, o
  // akşam ne lazım, ne araca hiç binmez, montaj tarafı, çocuk/hayvan,
  // işaretleme. Liste korundu ama artık listenin kendisi tez değil.
  //
  // İLAÇ KONUSUNDA TIBBİ ÖNERİ YOK: yalnız "düzenli kullandığınız ilaçlar
  // yanınızda kalsın" deniyor, hangi ilaç/doz/koşul denmiyor.
  // ══════════════════════════════════════════════════════════════════
  'tasinma-gunu-ilk-gece-kutusu': {
    subtitle: 'Hiçbir koliyi açmadan ilk saatleri geçirmek için ayrılan kutu',
    metaTitle: 'İlk Gece Kutusu: Taşınma Akşamı İçin Liste',
    metaDescription:
      'İlk gece kutusuna ne girer, ne girmez ve hangi belgeler araca hiç binmez? Kutuyu diğerlerinden ayıran işaretleme ve yükleme sırası.',
    excerpt:
      'İlk gece kutusu bir liste değil, küçük bir operasyon katmanı: hiçbir koliyi açmadan ilk saatleri geçirmek için. Ne girer, ne girmez, ne yanınızda kalır.',
    content: `<p>İlk gece kutusu bir liste değil, küçük bir operasyon katmanı. İşi şu: eşya indikten sonra hiçbir koliyi açmadan ilk saatleri geçirebilmek. Bu yüzden en son yüklenir, en önce indirilir ve diğer kutuların arasına karışmaz.</p>

<h2>Kutunun işi hangi soruyu kapatıyor</h2>
<p>Eşya yeni eve indiğinde ortada onlarca kapalı kutu olur ve en yorucu an "şimdi hangi kutuda?" aramasıdır. İlk gece kutusu bu aramayı ertesi güne erteler. Kapsamı da buradan çıkıyor: o akşam duş almak, bir şey yemek ve uyumak için gerekenler. Ertesi gün lazım olacak şeyler bu kutuya girmez — girerse kutu bir koliye daha dönüşür.</p>

<h2>O akşam gerçekten lazım olanlar</h2>
<ul>
<li><strong>Banyo:</strong> tuvalet kâğıdı, sabun, şampuan, diş fırçası ve macunu, kişi başı bir havlu.</li>
<li><strong>Uyku:</strong> nevresim takımı, yastık, bir günlük kıyafet ve pijama.</li>
<li><strong>Mutfak:</strong> su ısıtıcısı, çay ya da kahve, birkaç bardak, kaşık, bir tabak ve gerekiyorsa açacak.</li>
<li><strong>Ev:</strong> ampul, uzatma kablosu, el feneri, temizlik bezi ve çöp poşeti.</li>
<li><strong>Şarj:</strong> telefon şarj aleti — birden fazla.</li>
</ul>
<p>Perde ya da geçici bir karartma çözümü de bu listeye giriyor; ilk gece en çok fark edilen eksik genellikle bu oluyor.</p>

<h2>Kutuya değil, yanınıza</h2>
<p>Bazı şeylerin araca hiç binmemesi gerekiyor. Kimlikler, kira sözleşmesi ve tapu gibi belgeler, taşımaya ilişkin sözleşme, anahtarlar, nakit para ve ziynet eşyası ayrı bir çantada yanınızda kalır. Düzenli kullandığınız ilaçlar da bu çantaya girer; kutulara karıştığında bulunması en zor şeylerden biri.</p>

<h2>Bir de montaj tarafı</h2>
<p>Yatağın kurulması gereken bir gecede tornavida seti, alyan takımı ve maket bıçağının olmaması ilk gecenin en sık yaşanan sorunu. Söküm ve kurulum ekibe aitse bunlara gerek kalmayabilir; kimin yapacağı taşımadan önce netleşmeli. <a href="/evden-eve-nakliyat">Söküm ve kurulum kapsamının</a> nasıl belirlendiğini ayrı bir sayfada anlatıyoruz.</p>

<h2>Evde çocuk ya da evcil hayvan varsa</h2>
<p>Çocuk varsa uyku düzeninin bağlı olduğu oyuncak ya da battaniye de bu kutuya girer. Evcil hayvan varsa mama, su kabı ve tuvalet kabı aynı mantıkla ayrı tutulur; <a href="/evcil-hayvanla-tasinmak">evcil hayvanla taşınmanın</a> ilk gece düzeni ayrıca planlanıyor.</p>

<h2>Kutuyu nasıl işaretlemeli</h2>
<p>Kutuyu diğerlerinden ayıran bir bant kullanın ve üstüne büyük harflerle "İLK GECE" yazılsın. Araca en son binen, yeni adreste ilk inen kutu bu olmalı. Nereye bırakılacağını da ekibe baştan söyleyin; aranmayan kutu, açılmayan kutudan iyidir.</p>`,
  },
}

// ─────────────────────────────────────────────────────────────────────
const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

if (process.argv.includes('--geri')) {
  if (!existsSync(YEDEK)) throw new Error(`Yedek yok: ${YEDEK}`)
  for (const k of JSON.parse(readFileSync(YEDEK, 'utf8'))) {
    await db.post.update({ where: { id: k.id }, data: k.eski })
    console.log(`geri  #${k.id} ${k.slug} — ${Object.keys(k.eski).join(', ')}`)
  }
  console.log('\nOn kayıt M11B öncesi hâline döndürüldü.')
} else {
  const yedek = []
  for (const [slug, yeni] of Object.entries(YAZILAR)) {
    const kayit = await db.post.findUnique({ where: { slug } })
    if (!kayit) throw new Error(`Kayıt bulunamadı: ${slug}`)

    const eski = {}
    const yaz = {}
    for (const alan of ALANLAR) {
      if (yeni[alan] === undefined) continue
      if (kayit[alan] === yeni[alan]) continue // yeniden çalıştırmada atlanır
      eski[alan] = kayit[alan]
      yaz[alan] = yeni[alan]
    }
    if (!Object.keys(yaz).length) {
      console.log(`ATLANDI #${kayit.id} ${slug} — alanlar zaten güncel`)
      continue
    }
    yedek.push({ id: kayit.id, slug, eski })
    await db.post.update({ where: { id: kayit.id }, data: yaz })
    const kelime = (s) => String(s || '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length
    console.log(
      `~  #${String(kayit.id).padStart(2)} ${slug.padEnd(50)} ` +
        `${String(kelime(kayit.content)).padStart(3)} → ${String(kelime(yeni.content)).padStart(3)} kelime  ` +
        `[${Object.keys(yaz).join(', ')}]`
    )
  }

  // Yedek YALNIZ BİR KEZ yazılır: script yeniden çalıştırıldığında özgün
  // değerlerin üstüne yazılmaz.
  if (!existsSync(YEDEK)) {
    writeFileSync(YEDEK, JSON.stringify(yedek, null, 1), 'utf8')
    console.log(`\nM11B öncesi değerler ${YEDEK} içine yazıldı (${yedek.length} kayıt).`)
  } else {
    console.log(`\nYedek zaten var, KORUNUYOR: ${YEDEK}`)
  }
  console.log('Geri almak için: node --env-file=.env scripts/blog-istanbul-authority.mjs --geri')
}

await db.$disconnect()
