// prisma/mahalle-icerik-tohum.mjs
//
//     npm run mahalle-icerik -- --dogrula   → yalnız rapor, HİÇBİR ŞEY yazmaz
//     npm run mahalle-icerik                → pilot içerikleri yazar
//
// PİLOT MAHALLE İÇERİĞİ — 10 KAYIT.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN 473 DEĞİL 10
//
// Bu turun ölçütü "473 içerik üretildi" değil, "yüzlerce sayfaya güvenle
// ölçeklenebilecek sistem kanıtlandı". Pilot, şablonun ve veri modelinin
// gerçek içerikle çalıştığını gösteriyor; kalanlar ancak aynı kalite
// kapısından geçtikçe açılacak.
//
// ─────────────────────────────────────────────────────────────────────────
// İÇERİK NEYE DAYANIYOR — UYDURMA YEREL BİLGİ YOK
//
// Pilot mahalleler RASTGELE seçilmedi: hepsi bağlı olduğu ilçenin KENDİ
// kaydında (`Region.content` / `Region.facts` / `Region.routes`) ADIYLA
// geçiyor. Yani "Moda'nın iç sokakları dar ve tek yön", "Levent'te yük
// asansörü var ama yönetim saat kısıtı uyguluyor", "Kurtköy'de yapı stoku
// daha yeni" gibi ifadeler bu turda ÜRETİLMEDİ — işletmenin kendi yazdığı
// kayıtta zaten duruyorlar.
//
// Adı ilçe metninde geçmeyen mahalleler (Bostancı, Balmumcu, Velibaba…)
// pilota ALINMADI: onlar için elimizde doğrulanmış tek bir fiziksel bilgi
// yok ve "sokaklar dardır" diye yazmak uydurma olurdu.
//
// ─────────────────────────────────────────────────────────────────────────
// İLÇE SAYFASININ KOPYASI DEĞİL
//
// Aynı olgular ADRES ÖLÇEĞİNDE ve yeni cümlelerle yazıldı. Birebir
// paragraf kopyası ölçülerek sıfırlandı (bkz. final rapor → Kopya Denetimi).
//
// ─────────────────────────────────────────────────────────────────────────
// YÖNTEM
//
// Alan yalnız BOŞSA ya da bilinen tohum değerinin aynısıysa yazılır.
// Panelden elle yazılmış içerik EZİLMEZ; betik tekrar çalıştırılabilir.
// Bu betik yalnız içerik yazar — YAYINA ALMAZ. Aktivasyon ayrı kapıdan
// (prisma/mahalle-yayina-al.mjs) geçiyor.
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/client/client.ts'

const p = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })
const YALNIZ_DOGRULA = process.argv.slice(2).includes('--dogrula')

/** canonicalPath → içerik. Anahtar adres, çünkü UNIQUE olan o. */
const PILOT = {
  // ══════════════════════════════ KADIKÖY ══════════════════════════════
  'moda-mahallesi': {
    title: 'Moda Mahallesi Evden Eve Nakliyat',
    excerpt:
      "Moda'da taşınmanın ilk sorusu eşya değil, aracın kapıya kadar gelip gelemediği. Cevap sokaktan sokağa değişiyor ve keşifte yerinde veriliyor.",
    metaDescription:
      "Moda Mahallesi evden eve nakliyat: tek yön iç sokaklarda araç yanaşma ve aktarma planı, asansörsüz binalarda dış cephe asansörü. Keşifte yerinde ölçülüyor.",
    content: `<p>Moda'da iki bina arasındaki mesafe kısa, planlama farkı büyük. İşi belirleyen şey yolun uzunluğu değil, aracın nereye kadar gelebildiği ve eşyanın binadan nasıl çıktığı.</p>
<h3>Araç nereye kadar geliyor</h3>
<p>İç sokakların çoğu tek yön ve iki yanı park dolu. Büyük bir nakliye aracı kapının önüne yanaşamadığında iki seçenek kalıyor: eşyayı sokağın başına kadar el arabasıyla taşımak ya da küçük bir araçla aktarma yapmak. İkisi de süreyi ve ekip sayısını değiştiriyor, o yüzden keşifte ölçülüp teklife baştan yazılıyor — taşınma günü çıkan bir kalem olmuyor.</p>
<h3>Merdivenden çıkmayan parçalar</h3>
<p>Moda'daki binaların önemli bir kısmında asansör ya hiç yok ya da tek kişilik. Gardırop, buzdolabı ve üç kişilik koltuk bu kabinlere girmiyor. Böyle adreslerde parça ya yerinde sökülüyor ya da dış cephe asansörüyle pencereden alınıyor. Hangisinin gerekeceği kat sayısına değil, merdivenin dönüş sahanlığına ve kapı genişliğine bakılarak belirleniyor.</p>
<h3>Taşınma sabahı</h3>
<p>Dış cephe asansörü kurulacaksa aracın duracağı yerin sabah erkenden boş olması gerekiyor. Komşuların ve varsa yönetimin bir gün önceden bilgilendirilmesi, işin yarım gün kısalmasını sağlayabiliyor.</p>
<h3>Keşiften önce hazırlayabilecekleriniz</h3>
<p>Bina kaç katlı, daireniz kaçıncı katta, asansör var mı ve varsa kabin içine bir gardırop giriyor mu — bu üç bilgi telefonda söylenirse keşif çok daha hızlı sonuçlanıyor. Sokağın adı ve varsa park kısıtı da plana giriyor.</p>`,
    facts: [
      {
        label: 'Araç erişimi',
        value:
          'İç sokakların çoğu tek yön ve iki yanı park dolu; kapı önüne yanaşamayan adreslerde aktarma planı keşifte kuruluyor.',
      },
      {
        label: 'Asansör durumu',
        value:
          'Asansör çoğu binada yok ya da tek kişilik; büyük parçalar için dış cephe asansörü sık gerekiyor.',
      },
      {
        label: 'Yapı dokusu',
        value: 'Ağırlıklı olarak 1950–70 arası apartman stoğu.',
      },
    ],
    faqs: [
      {
        question: "Moda'da nakliye aracı kapının önüne yanaşabiliyor mu?",
        answer:
          'Adrese göre değişiyor. Tek yön ve iki yanı park dolu sokaklarda büyük araç çoğu zaman yanaşamıyor; o durumda ya sokağın başına kadar el arabasıyla taşıma ya da küçük araçla aktarma planlanıyor. Hangisinin gerektiği keşifte yerinde belirleniyor.',
      },
      {
        question: 'Asansörsüz bir binadan eşyalar nasıl indiriliyor?',
        answer:
          'Merdiven sahanlığından geçen parçalar elde iniyor. Geçmeyen gardırop, köşe takımı ve beyaz eşya için dış cephe asansörü kuruluyor ya da parça yerinde sökülüyor. Karar kat sayısına değil, merdivenin dönüşüne ve kapı genişliğine bakılarak veriliyor.',
      },
      {
        question: 'Dış cephe asansörü için önceden bir şey yapmam gerekiyor mu?',
        answer:
          'Aracın duracağı yerin taşınma sabahı boş olması gerekiyor. Komşuları ve varsa yönetimi bir gün önceden bilgilendirmek işin süresini belirgin kısaltıyor.',
      },
      {
        question: 'Moda içinde kısa bir taşınmada maliyeti ne belirliyor?',
        answer:
          'Mesafe değil, iki adresin kat ve asansör durumu. Aynı sokakta bile asansörlü bir binadan asansörsüz bir binaya taşınmak planı değiştiriyor.',
      },
    ],
  },

  'caferaga-mahallesi': {
    title: 'Caferağa Mahallesi Evden Eve Nakliyat',
    excerpt:
      'Caferağa merkezî olduğu için taşınma günü asıl sıkıntı mesafede değil, aracın duracağı yeri bulmakta çıkıyor.',
    metaDescription:
      'Caferağa Mahallesi evden eve nakliyat: gün boyu dolu park düzeninde yükleme yeri planlaması, eski apartman stoğunda kat ve asansör değerlendirmesi.',
    content: `<p>Caferağa, Kadıköy merkezine yürüme mesafesindeki yoğun yerleşimlerden. Bu yoğunluk taşınmanın en can sıkıcı kısmını belirliyor: aracın nereye park edeceği.</p>
<h3>Yükleme yeri</h3>
<p>Çevredeki park yerleri gün boyu dolu. Aracın binanın önünde durabileceği alan taşınma sabahı erkenden ayrılmazsa, ekip eşyayı uzaktan taşımak zorunda kalıyor ve bu tek başına yarım güne mal olabiliyor. Bu yüzden başlangıç saatini erkene almak burada gerçekten fark yaratıyor.</p>
<h3>Bina stoğu</h3>
<p>Mahallenin büyük bölümü 1950–70 arası apartmanlardan oluşuyor. Bu binalarda merdiven genişliği ve sahanlık dönüşü, kat sayısından daha belirleyici: dar bir dönüş, üç katlı bir binayı beş katlıdan zor hâle getirebiliyor. Gardırop ve köşe takımı gibi parçalar bu noktada ya yerinde sökülüyor ya da dış cepheden alınıyor.</p>
<h3>Ne zaman başlanır</h3>
<p>Söğütlüçeşme çevresi sabah ve akşam saatlerinde ağır. İlçe içi kısa bir taşınma bile yanlış saatte planlandığında uzuyor; erken saat hem trafiği hem park sorununu aynı anda hafifletiyor.</p>
<h3>Keşifte konuşulanlar</h3>
<p>Eşya listesi kadar önemli olan üç şey var: kat, asansör kabininin iç ölçüsü ve aracın binaya kaç metre yanaşabildiği. Üçü de yerinde ölçülüyor ve teklif bunlardan sonra yazılı veriliyor.</p>`,
    facts: [
      {
        label: 'Park durumu',
        value: 'Gün boyu dolu; aracın duracağı yer taşınma sabahı erkenden ayrılıyor.',
      },
      {
        label: 'Yapı dokusu',
        value: 'Ağırlıklı olarak 1950–70 arası apartman stoğu.',
      },
      {
        label: 'Trafik saati',
        value: 'Söğütlüçeşme çevresi 08.00–10.00 ve 17.00–20.00 arası ağır.',
      },
    ],
    faqs: [
      {
        question: "Caferağa'da taşınmaya neden erken saatte başlanıyor?",
        answer:
          'İki sebep aynı anda: park yerleri gün ilerledikçe doluyor ve Söğütlüçeşme çevresi sabah 10.00 sonrası ağırlaşıyor. Erken başlangıç ikisini birden hafifletiyor.',
      },
      {
        question: 'Aracın duracağı yeri kim ayarlıyor?',
        answer:
          'Keşifte hangi noktanın uygun olduğunu birlikte belirliyoruz. Komşuların ve varsa yönetimin önceden bilgilendirilmesi gerekiyorsa bunu da taşınma gününden önce yazıyoruz.',
      },
      {
        question: 'Eski binalarda hangi eşya sorun çıkarıyor?',
        answer:
          'Gardırop, köşe takımı ve büyük beyaz eşya. Belirleyici olan kat sayısı değil, merdiven sahanlığının dönüşü ve kapı genişliği; ölçü tutmuyorsa parça yerinde sökülüyor ya da dış cephe asansörü kuruluyor.',
      },
    ],
  },

  'yeldegirmeni-mahallesi': {
    title: 'Yeldeğirmeni Mahallesi Evden Eve Nakliyat',
    excerpt:
      "Yeldeğirmeni'nde sokak genişliği ve asansör durumu, taşınma planını eşya miktarından daha çok belirliyor.",
    metaDescription:
      'Yeldeğirmeni Mahallesi evden eve nakliyat: dar ve tek şeritli sokaklarda araç planı, asansörsüz binalarda dış cephe asansörü değerlendirmesi.',
    content: `<p>Yeldeğirmeni'nde taşınmanın planı iki soruya bağlı: araç sokağa girebiliyor mu, eşya binadan merdivenle çıkabiliyor mu. İkisinin cevabı da adrese göre değişiyor.</p>
<h3>Sokak genişliği</h3>
<p>Sokakların çoğu tek şeritli ve iki yanı park dolu. Büyük araç giremediğinde eşya sokağın başına taşınıyor ya da küçük araçla aktarma yapılıyor. Bu, taşınmanın en çok zaman alan kısmı olabiliyor; keşifte hangi aracın gireceği yerinde belirlenip plana yazılıyor.</p>
<h3>Asansör meselesi</h3>
<p>Binaların önemli bir kısmında asansör yok ya da tek kişilik bir kabin var. Bu kabinlere gardırop, buzdolabı ve üç kişilik koltuk girmiyor. Böyle adreslerde ya parça yerinde sökülüyor ya da dış cephe asansörü kuruluyor.</p>
<h3>Ambalaj</h3>
<p>Eşya sokağın başına kadar elde taşınacaksa ambalaj standardı yükseliyor: köşe koruması, streç ve battaniye sarımı, kırılabilir parçalarda ayrı kutu. Bu ek iş de keşifte belirlenip süreye ekleniyor.</p>
<h3>Keşiften önce</h3>
<p>Kat, asansör kabininin iç ölçüsü ve sokağa araç girip giremediği — bu üçü bilinirse keşif kısalıyor ve teklif daha hızlı yazılıyor.</p>`,
    facts: [
      {
        label: 'Sokak ve araç',
        value:
          'Sokakların çoğu tek şeritli ve iki yanı park dolu; büyük araç çoğu adrese yanaşamıyor.',
      },
      {
        label: 'Asansör durumu',
        value: 'Asansör çoğu binada yok ya da tek kişilik; mobilya asansörü sık gerekiyor.',
      },
    ],
    faqs: [
      {
        question: "Yeldeğirmeni'nde hangi araçla geliniyor?",
        answer:
          'Sokağa girebilen en büyük araçla. Giremiyorsa eşya sokağın başına taşınıyor ya da küçük araçla aktarma yapılıyor; hangisinin gerektiği keşifte yerinde belirleniyor.',
      },
      {
        question: 'Aktarma yapılırsa eşya zarar görür mü?',
        answer:
          'Aktarma planlandığında ambalaj standardı yükseltiliyor: köşe koruması, battaniye ve streç sarım, kırılabilir parçalar için ayrı kutu. Taşıma sırasındaki hasarlara karşı sorumluluğumuz yazılı sözleşmede tanımlı.',
      },
      {
        question: 'Dış cephe asansörü her binada kurulabiliyor mu?',
        answer:
          'Hayır. Aracın duracağı alan, cephe önünde engel bulunup bulunmadığı ve pencere ölçüsü belirleyici. Uygun değilse parça yerinde sökülüp merdivenden indiriliyor.',
      },
    ],
  },

  'kozyatagi-mahallesi': {
    title: 'Kozyatağı Mahallesi Evden Eve Nakliyat',
    excerpt:
      "Kozyatağı'nda taşınmanın konusu sokak değil yönetim: yük asansörü ve giriş saati önceden ayarlanıyor.",
    metaDescription:
      'Kozyatağı Mahallesi evden eve nakliyat: yüksek katlı sitelerde yük asansörü randevusu ve giriş saati planlaması, araç kabul noktası keşifte belirleniyor.',
    content: `<p>Kozyatağı, Kadıköy'ün yüksek katlı site dokusunun bulunduğu tarafta. Buradaki taşınma, ilçenin dar sokaklı mahallelerinden bambaşka bir plan gerektiriyor: sorun erişim değil, izin.</p>
<h3>Yönetim izni ve saat</h3>
<p>Sitelerin çoğu taşınma için önceden bildirim istiyor ve belirli saat aralıkları uyguluyor. Yük asansörünün o saatte tahsis edilmiş olması gerekiyor; randevusuz gelen araç kapıda bekliyor. Bu yüzden burada takvim, taşınma gününden değil izin gününden başlıyor.</p>
<h3>Yük asansörü</h3>
<p>Yük asansörü bulunan bir binada iş belirgin hızlanıyor, ama kabin ölçüsü yine de kontrol ediliyor: kabine girmeyen bir gardırop ya da köşe takımı varsa o parça yerinde sökülüyor.</p>
<h3>Araç kabul noktası</h3>
<p>Sitelerde aracın gireceği kapı, bekleyeceği nokta ve kat otoparkı yüksekliği önceden soruluyor. Yüksekliğe takılan bir araç, taşınma sabahı bulunacak bir çözüm değil.</p>
<h3>Süre neye bağlı</h3>
<p>Kozyatağı içinde ya da yakın mahallelere yapılan taşımalarda süreyi belirleyen şey yol değil, yönetimin verdiği saat aralığı ve asansörün ne kadar süreyle tahsis edildiği.</p>`,
    facts: [
      {
        label: 'Yapı dokusu',
        value: 'Ağırlıklı olarak yüksek katlı siteler.',
      },
      {
        label: 'Site prosedürü',
        value: 'Taşıma için önceden bildirim, saat kısıtı ve yük asansörü tahsisi gerekiyor.',
      },
    ],
    faqs: [
      {
        question: 'Site yönetiminden izni kim alıyor?',
        answer:
          'Talep ederseniz bildirim ve yük asansörü randevusunu biz alıyoruz. Bazı yönetimler bunu yalnız daire sahibinden kabul ediyor; keşifte hangisinin geçerli olduğunu birlikte netleştiriyoruz.',
      },
      {
        question: 'Yük asansörü varsa taşınma tek günde biter mi?',
        answer:
          'Belirleyici olan yönetimin verdiği saat aralığı. Asansör gün boyu tahsisliyse işlerin büyük kısmı tek günde tamamlanıyor; kısıtlı bir aralık verildiğinde plan ona göre kuruluyor. Gerçekçi süreyi keşifte söylüyoruz.',
      },
      {
        question: 'Araç sitenin otoparkına girebiliyor mu?',
        answer:
          'Kat otoparkı yükseklik kısıtı olan sitelerde giremiyor. Bu yüzden araç kabul noktası ve yükseklik sınırı keşifte önceden soruluyor, uygun araç ona göre seçiliyor.',
      },
    ],
  },

  // ══════════════════════════════ BEŞİKTAŞ ══════════════════════════════
  'levent-mahallesi': {
    title: 'Levent Mahallesi Evden Eve Nakliyat',
    excerpt:
      "Levent'te erişim sorunu yok; plan, yönetim bildirimi ve yük asansörü rezervasyonu üzerine kuruluyor.",
    metaDescription:
      'Levent Mahallesi evden eve nakliyat ve ofis taşıma: rezidans ve plazalarda yük asansörü rezervasyonu, saat kısıtı ve yönetim bildirimi önceden ayarlanıyor.',
    content: `<p>Levent, Beşiktaş'ın taşınma açısından en kolay erişilen tarafı: araç yanaşma sorunu yok, binaların çoğunda yük asansörü var. Buna karşılık burada işi belirleyen şey fiziksel değil idari.</p>
<h3>Bildirim ve saat kısıtı</h3>
<p>Rezidans ve plaza yönetimlerinin çoğu taşınma için önceden bildirim istiyor ve belirli saat aralıkları uyguluyor. Yük asansörünün o aralıkta rezerve edilmiş olması gerekiyor. Randevusuz gelen araç kapıda bekliyor; bu yüzden takvim izin gününden geriye doğru kuruluyor.</p>
<h3>Ofis ve işyeri</h3>
<p>Bölgedeki ofis taşımaları mesai dışına planlanıyor. Dosya ve elektronik ekipman ayrı ambalajlanıp numaralandırılıyor, yeni adreste aynı düzene kuruluyor.</p>
<h3>Yük asansörü ölçüsü</h3>
<p>Yük asansörü olması her parçanın kabine gireceği anlamına gelmiyor. Kabin iç ölçüsü keşifte alınıyor; girmeyen gardırop ve köşe takımı yerinde sökülüyor.</p>
<h3>Trafik</h3>
<p>Barbaros Bulvarı sabah ve akşam saatlerinde tıkanıyor. Yönetimin verdiği saat aralığı ile trafiğin uygun olduğu saat çakışmıyorsa, plan aralığa göre yapılıyor — kapıda beklemek her koşulda daha pahalı.</p>`,
    facts: [
      {
        label: 'Bina tipi',
        value: 'Yük asansörlü rezidans ve plaza dokusu; araç yanaşma sorunu yok.',
      },
      {
        label: 'Yönetim prosedürü',
        value: 'Önceden bildirim, saat kısıtı ve yük asansörü rezervasyonu gerekiyor.',
      },
      {
        label: 'Trafik saati',
        value: 'Barbaros Bulvarı 08.00–10.00 ve 17.00–20.00 arası ağır.',
      },
    ],
    faqs: [
      {
        question: "Levent'te taşınma için ne kadar önceden haber vermek gerekiyor?",
        answer:
          'Yönetimden yönetime değişiyor; çoğu en az birkaç iş günü önceden bildirim ve yük asansörü rezervasyonu istiyor. Keşifte binanızın kuralını birlikte netleştirip takvime yazıyoruz.',
      },
      {
        question: 'Ofis taşıması hafta içi yapılabiliyor mu?',
        answer:
          'Yapılıyor ama çoğunlukla mesai dışına planlanıyor. Dosya ve elektronik ekipman ayrı ambalajlanıp numaralandırılıyor; kurulum yeni adreste aynı düzene göre yapılıyor.',
      },
      {
        question: 'Yük asansörü varken dış cephe asansörü gerekir mi?',
        answer:
          'Genellikle gerekmiyor. Yalnız kabin iç ölçüsüne girmeyen büyük bir parça varsa gündeme geliyor; o durumda parça yerinde sökülüp yeniden kuruluyor.',
      },
    ],
  },

  'besiktas-ortakoy-mahallesi': {
    title: 'Ortaköy Mahallesi Evden Eve Nakliyat',
    excerpt:
      "Ortaköy'de sokaklar hem dar hem dik. Hangi aracın gireceği ve eşyanın nereden çıkacağı keşifte yerinde belirleniyor.",
    metaDescription:
      'Ortaköy Mahallesi evden eve nakliyat: dar ve eğimli sokaklarda araç seçimi, koruma altındaki yapılarda merdiven koruması ve dış cephe planı.',
    content: `<p>Ortaköy'de taşınma, aracın sahil yolundan yukarı çıkabildiği yere kadar kolay; ondan sonrası plan işi. Bu yüzden burada keşif, başka adreslere göre daha belirleyici.</p>
<h3>Hangi araç girer</h3>
<p>Sahil yolundan yukarı çıkan sokakların çoğu hem dar hem dik ve büyük nakliye aracı giremiyor. Giremediğinde eşya sokağın başına kadar taşınıyor ya da küçük araçla aktarma yapılıyor. Hangi aracın nereye kadar geleceği keşifte yerinde belirlenip plana yazılıyor.</p>
<h3>Koruma altındaki yapılar</h3>
<p>Bölgede ahşap ve kâgir yapı çok. Bu binalarda merdivenler dar, sahanlıklar dönüşe elverişli değil ve yapının kendisi de korunmak zorunda: merdiven basamakları, korkuluklar ve kapı kasaları örtüyle kaplanıyor. Büyük mobilya çoğu zaman merdivenden değil dış cepheden alınıyor.</p>
<h3>Sokakta yer açmak</h3>
<p>Dış cephe asansörü kurulacaksa sokakta aracın duracağı yerin boşaltılması gerekiyor. Eğimli ve dar bir sokakta bu, düz bir caddeye göre daha fazla önceden hazırlık istiyor.</p>
<h3>Saat</h3>
<p>Sahil yolu sabah ve akşam saatlerinde ağır. Kısa bir mesafe yanlış saatte saatler alabildiği için taşınma erken saatte başlatılıyor.</p>`,
    facts: [
      {
        label: 'Sokak yapısı',
        value: 'Sahil yolundan yukarı çıkan sokaklar dar ve dik; büyük araç çoğu adrese giremiyor.',
      },
      {
        label: 'Yapı tipi',
        value:
          'Koruma altında ahşap ve kâgir yapı yoğun; merdivenler dar, sahanlıklar dönüşe elverişsiz.',
      },
      {
        label: 'Trafik saati',
        value: 'Sahil yolu 08.00–10.00 ve 17.00–20.00 arası ağır.',
      },
    ],
    faqs: [
      {
        question: 'Sokağa araç giremezse eşya nasıl taşınıyor?',
        answer:
          'Eşya sokağın başına kadar elde taşınıyor ya da küçük bir araçla aktarma yapılıyor. Hangisinin gerektiği ve ne kadar süreceği keşifte yerinde belirlenip teklife yazılıyor.',
      },
      {
        question: 'Tarihi binada taşınma yaparken binaya zarar verilir mi?',
        answer:
          'Merdiven basamakları, korkuluklar ve kapı kasaları örtüyle korunuyor. Merdivenden geçmeyen büyük parçalar zorlanmıyor; dış cepheden alınıyor ya da yerinde sökülüyor.',
      },
      {
        question: 'Dış cephe asansörü için sokakta yer nasıl ayrılıyor?',
        answer:
          'Aracın duracağı nokta keşifte belirleniyor ve taşınma sabahı boş olması gerekiyor. Dar ve eğimli sokaklarda bu hazırlık düz bir caddeye göre daha erken yapılıyor.',
      },
    ],
  },

  'etiler-mahallesi': {
    title: 'Etiler Mahallesi Evden Eve Nakliyat',
    excerpt:
      "Etiler'de bina erişimi genellikle sorun değil; asıl konu ara sokaklarda aracın duracağı yeri bulmak.",
    metaDescription:
      'Etiler Mahallesi evden eve nakliyat: ara sokaklarda park ve yükleme yeri planı, eğimli sırt sokaklarında araç manevrası keşifte değerlendiriliyor.',
    content: `<p>Etiler'de taşınmanın zorluğu bina içinde değil, binanın önünde başlıyor. Erişim çoğu adreste mümkün; aracın duracağı yer her zaman değil.</p>
<h3>Park ve yükleme yeri</h3>
<p>Ara sokaklarda park sorunu ciddi. Aracın binanın önünde durabileceği alan taşınma sabahı erkenden ayrılmazsa ekip eşyayı uzaktan taşımak zorunda kalıyor. Bu yüzden yükleme noktası keşifte belirleniyor ve gerekiyorsa komşular ile yönetim önceden bilgilendiriliyor.</p>
<h3>Eğim</h3>
<p>Ulus–Etiler sırtlarında eğim sert. Sırt sokaklarında aracın manevra alanı kısıtlı olabiliyor; bu, gelecek aracın boyutunu doğrudan belirliyor ve keşifte yerinde ölçülüyor.</p>
<h3>Bina içi</h3>
<p>Yük asansörü bulunan binalarda iş hızlanıyor, ama kabin iç ölçüsü yine kontrol ediliyor. Kabine girmeyen gardırop ve köşe takımı yerinde sökülüp yeni adreste kuruluyor.</p>
<h3>Saat</h3>
<p>Barbaros Bulvarı sabah ve akşam ağır. Erken başlangıç hem trafiği hem park sorununu aynı anda hafifletiyor.</p>`,
    facts: [
      {
        label: 'Park durumu',
        value: 'Ara sokaklarda park sorunu ciddi; yükleme yeri sabah erkenden ayrılıyor.',
      },
      {
        label: 'Kot farkı',
        value: 'Ulus–Etiler sırtlarında sert eğim; sırt sokaklarında araç manevrası kısıtlı.',
      },
    ],
    faqs: [
      {
        question: "Etiler'de aracın duracağı yer nasıl ayarlanıyor?",
        answer:
          'Yükleme noktası keşifte belirleniyor ve taşınma sabahı boş olması gerekiyor. Gerekiyorsa komşular ve site yönetimi bir gün önceden bilgilendiriliyor.',
      },
      {
        question: 'Eğimli sokaklarda büyük araç kullanılabiliyor mu?',
        answer:
          'Her sokakta değil. Sırt sokaklarında manevra alanı kısıtlı olabildiği için araç boyutu keşifte yerinde belirleniyor; gerekirse aktarma planlanıyor.',
      },
      {
        question: 'Yük asansörü olan binada ek bir hazırlık gerekiyor mu?',
        answer:
          'Kabin iç ölçüsünün alınması gerekiyor. Girmeyen büyük parçalar yerinde sökülüp yeni adreste yeniden kuruluyor.',
      },
    ],
  },

  // ══════════════════════════════ PENDİK ══════════════════════════════
  'kurtkoy-mahallesi': {
    title: 'Kurtköy Mahallesi Evden Eve Nakliyat',
    excerpt:
      "Kurtköy'de erişim rahat, mesafe uzun. Planı belirleyen şey bina değil, ilçe içi bile olsa yol süresi.",
    metaDescription:
      'Kurtköy Mahallesi evden eve nakliyat: yeni site dokusunda yük asansörü ve otopark, havalimanı çevresindeki yol süresi plana baştan yazılıyor.',
    content: `<p>Kurtköy, Pendik'in merkeze en uzak taraflarından. Burada taşınmanın konusu dar sokak ya da asansörsüz bina değil; asıl kalem yolda geçen süre.</p>
<h3>İlçe içi mesafe</h3>
<p>Pendik geniş bir ilçe ve sahil bandı ile Kurtköy arasında araçla ciddi bir mesafe var. "İlçe içi taşınma" burada kısa bir nakliye değil, yarım günlük bir güzergâh işi olabiliyor. Bu süre keşifte hesaplanıp takvime yazılıyor.</p>
<h3>Bina erişimi</h3>
<p>Bölgedeki yapı stoğu daha yeni; geniş yollar ve otopark var, yeni sitelerin çoğunda yük asansörü bulunuyor. Bu, taşınmanın bina içindeki kısmını belirgin kolaylaştırıyor. Buna karşılık yeni sitelerde yönetim izni ve giriş saati gündeme geliyor.</p>
<h3>Havalimanı çevresi</h3>
<p>Sabiha Gökçen çevresindeki bazı yollarda belirli saatlerde ağır araç yoğunluğu oluşuyor. Taşınma saati bu yoğunluğa göre seçiliyor.</p>
<h3>Şehir dışına çıkış</h3>
<p>Bölgede iş kaynaklı taşınma hareketi düzenli. Şehir dışına yapılan taşımalarda çıkış saati ve güzergâh baştan planlanıyor; uzun yolda ambalaj standardı da yükseliyor.</p>`,
    facts: [
      {
        label: 'Yapı dokusu',
        value: 'Yapı stoğu daha yeni; geniş yollar ve otopark mevcut.',
      },
      {
        label: 'Asansör durumu',
        value: 'Yeni sitelerin çoğunda yük asansörü var.',
      },
      {
        label: 'Yol ve süre',
        value:
          'Sahil bandı ile arasında ciddi mesafe; ilçe içi taşımalarda bile yol süresi plana giriyor.',
      },
    ],
    faqs: [
      {
        question: 'Pendik içinde taşınıyorum, neden yarım gün konuşuluyor?',
        answer:
          'Pendik yüzölçümü büyük bir ilçe. Sahil bandı ile Kurtköy arasındaki mesafe araçla ciddi; bu yüzden ilçe içi bir taşınma bile güzergâh işi olabiliyor. Süre keşifte hesaplanıp takvime yazılıyor.',
      },
      {
        question: 'Yeni sitelerde ek bir izin gerekiyor mu?',
        answer:
          'Çoğunda gerekiyor: taşınma için önceden bildirim, giriş saati ve yük asansörü tahsisi. Talep ederseniz bu randevuyu biz alıyoruz.',
      },
      {
        question: 'Havalimanı çevresindeki trafik taşınmayı etkiliyor mu?',
        answer:
          'Bazı yollarda belirli saatlerde ağır araç yoğunluğu oluşuyor. Taşınma saati buna göre seçiliyor; erken başlangıç yol süresini belirgin kısaltıyor.',
      },
      {
        question: "Kurtköy'den şehir dışına taşınma yapıyor musunuz?",
        answer:
          'Yapıyoruz. Çıkış saati ve güzergâh baştan planlanıyor, uzun yolda ambalaj standardı yükseltiliyor. Teslim günü bir aralık olarak baştan bildiriliyor.',
      },
    ],
  },

  'yenisehir-mahallesi': {
    title: 'Yenişehir Mahallesi Evden Eve Nakliyat',
    excerpt:
      "Yenişehir'de bina tarafı rahat: yeni site dokusu ve yük asansörü. Plan, yönetim izni ve ilçe içi mesafe üzerine kuruluyor.",
    metaDescription:
      'Yenişehir Mahallesi evden eve nakliyat: yeni site dokusunda yük asansörü randevusu ve giriş saati, Pendik içi yol süresi keşifte hesaplanıyor.',
    content: `<p>Yenişehir, Pendik'in yeni site dokusunun bulunduğu taraflardan. Bina içindeki iş burada çoğu adreste kolay; planı belirleyen şey yönetim prosedürü ve ilçe içi mesafe.</p>
<h3>Site prosedürü</h3>
<p>Yeni sitelerin çoğunda yük asansörü bulunuyor ve araç yanaşma sorunu yaşanmıyor. Buna karşılık taşınma için önceden bildirim, giriş saati ve asansör tahsisi gerekiyor. Randevusuz gelen araç kapıda bekliyor, o yüzden takvim izin gününden geriye doğru kuruluyor.</p>
<h3>Kabin ölçüsü</h3>
<p>Yük asansörü olması her parçanın kabine gireceği anlamına gelmiyor. Kabin iç ölçüsü keşifte alınıyor; girmeyen gardırop ve köşe takımı yerinde sökülüp yeni adreste kuruluyor.</p>
<h3>İlçe içi mesafe</h3>
<p>Pendik geniş bir ilçe. Sahil tarafına ya da merkeze yapılan taşımalarda yol süresi kısa bir nakliye gibi değil, güzergâh gibi hesaplanıyor ve takvime yazılıyor.</p>
<h3>Keşifte konuşulanlar</h3>
<p>Kat, yük asansörünün kabin ölçüsü, sitenin verdiği saat aralığı ve varış adresinin konumu. Teklif bu dördü belirlendikten sonra yazılı veriliyor.</p>`,
    facts: [
      {
        label: 'Yapı dokusu',
        value: 'Ağırlıklı olarak yeni site dokusu.',
      },
      {
        label: 'Asansör durumu',
        value: 'Yeni sitelerin çoğunda yük asansörü var.',
      },
      {
        label: 'Site prosedürü',
        value: 'Önceden bildirim, giriş saati ve yük asansörü tahsisi gerekiyor.',
      },
    ],
    faqs: [
      {
        question: 'Site yönetiminden randevuyu kim alıyor?',
        answer:
          'Talep ederseniz bildirim ve yük asansörü randevusunu biz alıyoruz. Bazı yönetimler bunu yalnız daire sahibinden kabul ediyor; keşifte hangisinin geçerli olduğunu netleştiriyoruz.',
      },
      {
        question: 'Yük asansörü varken sökme işlemi gerekiyor mu?',
        answer:
          'Yalnız kabin iç ölçüsüne girmeyen parçalar için. Gardırop ve köşe takımı gibi büyük mobilyalar yerinde sökülüp yeni adreste yeniden kuruluyor.',
      },
      {
        question: 'Pendik merkeze taşınmak ne kadar sürüyor?',
        answer:
          'İlçe geniş olduğu için yol süresi kısa bir nakliye gibi değil, güzergâh gibi hesaplanıyor. Gerçekçi süreyi keşifte söyleyip takvime yazıyoruz.',
      },
    ],
  },

  'seyhli-mahallesi': {
    title: 'Şeyhli Mahallesi Evden Eve Nakliyat',
    excerpt:
      "Şeyhli, Pendik'in üst tarafında. Taşınma planında ilk hesaplanan şey ilçe içi yol süresi oluyor.",
    metaDescription:
      'Şeyhli Mahallesi evden eve nakliyat: Pendik üst bölgesinde yol süresi hesabı, araç yanaşma ve kat durumu keşifte yerinde belirleniyor.',
    content: `<p>Şeyhli, Pendik'in sahil bandından uzak üst tarafında. Bu konum taşınma planının ilk kalemini belirliyor: yolda geçen süre.</p>
<h3>Yol süresi</h3>
<p>Sahil bandı ile üst bölge arasında araçla ciddi bir mesafe var. Pendik içinde kalan bir taşınma bile bu yüzden kısa bir nakliye değil, güzergâh işi olabiliyor. Süre keşifte hesaplanıp takvime yazılıyor; taşınma günü sürpriz bir gecikme kalemi çıkmıyor.</p>
<h3>Araç ve yükleme</h3>
<p>Aracın binaya kaç metre yanaşabildiği ve yükleme için uygun bir alan bulunup bulunmadığı keşifte yerinde ölçülüyor. Yanaşma mesafesi uzunsa bu, ekip sayısını ve süreyi doğrudan değiştiriyor.</p>
<h3>Kat ve asansör</h3>
<p>Asansör yoksa ya da kabin küçükse gardırop, buzdolabı ve köşe takımı merdivenden çıkmıyor. Böyle adreslerde parça yerinde sökülüyor ya da dış cephe asansörü kuruluyor; hangisinin gerekeceği merdiven sahanlığına ve kapı genişliğine bakılarak belirleniyor.</p>
<h3>Keşiften önce</h3>
<p>Kat, asansör durumu ve aracın binaya yanaşıp yanaşamadığı — bu üç bilgi baştan söylenirse keşif hızlanıyor ve teklif daha erken yazılıyor.</p>`,
    facts: [
      {
        label: 'Konum',
        value:
          "Pendik'in üst bölgesinde; sahil bandına mesafe ilçe içi taşımalarda bile plana giriyor.",
      },
    ],
    faqs: [
      {
        question: "Şeyhli'den Pendik sahiline taşınmak kısa bir iş mi?",
        answer:
          'Harita üzerinde kısa görünse de araçla ciddi bir mesafe var. Bu yüzden yol süresi keşifte hesaplanıp takvime yazılıyor.',
      },
      {
        question: 'Araç binanın önüne yanaşamazsa ne oluyor?',
        answer:
          'Yükleme için en yakın uygun nokta belirleniyor ve eşya oraya kadar taşınıyor. Yanaşma mesafesi ekip sayısını ve süreyi değiştirdiği için keşifte yerinde ölçülüyor.',
      },
      {
        question: 'Asansörsüz binada büyük mobilya nasıl indiriliyor?',
        answer:
          'Merdiven sahanlığından geçmeyen parçalar yerinde sökülüyor ya da dış cephe asansörüyle alınıyor. Karar kat sayısına değil, sahanlık dönüşüne ve kapı genişliğine bakılarak veriliyor.',
      },
    ],
  },
}

// ---------------------------------------------------------------------------

/**
 * JSON alanlarını ANAHTAR SIRASINDAN BAĞIMSIZ karşılaştırır.
 *
 * MariaDB `JSON` sütunları nesne anahtarlarını normalleştiriyor: yazarken
 * `{question, answer}` verilen kayıt okurken `{answer, question}` dönüyor.
 * Düz `JSON.stringify` karşılaştırması bu yüzden her koşuda "değişmiş"
 * diyordu ve betik idempotent görünmüyordu (ölçüldü: ikinci koşuda 10
 * kayıt gereksiz yere "elle yazılmış" sayıldı).
 */
const kanonik = (deger) =>
  JSON.stringify(deger ?? null, (_, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : 1)))
      : v
  )

const ayni = (a, b) => kanonik(a) === kanonik(b)
const bos = (v) => !String(v ?? '').trim()

const sayac = { yazilan: 0, guncel: 0, atlanan: 0, bulunamayan: 0, kayit: 0 }

for (const [yol, icerik] of Object.entries(PILOT)) {
  const kayit = await p.neighborhood.findUnique({ where: { canonicalPath: yol } })
  if (!kayit) {
    console.log(`  bulunamadı  ${yol}`)
    sayac.bulunamayan++
    continue
  }

  const veri = {}
  let atlandi = false

  for (const alan of ['title', 'excerpt', 'content', 'metaDescription']) {
    const hedef = icerik[alan]
    const mevcut = kayit[alan]
    if (mevcut === hedef) {
      sayac.guncel++
      continue
    }
    // Alan BOŞSA yazılır; doluysa ancak bu betiğin bilinen değeriyse
    // değişir. Panelden elle yazılmış metin ezilmiyor.
    if (!bos(mevcut)) {
      console.log(`  atlandı     ${yol}.${alan}  (elle yazılmış)`)
      sayac.atlanan++
      atlandi = true
      continue
    }
    veri[alan] = hedef
  }

  for (const alan of ['faqs', 'facts']) {
    const hedef = icerik[alan] || []
    const mevcut = Array.isArray(kayit[alan]) ? kayit[alan] : []
    if (ayni(mevcut, hedef)) {
      sayac.guncel++
      continue
    }
    if (mevcut.length) {
      console.log(`  atlandı     ${yol}.${alan}  (elle yazılmış)`)
      sayac.atlanan++
      atlandi = true
      continue
    }
    veri[alan] = hedef
  }

  if (!Object.keys(veri).length) {
    if (!atlandi) console.log(`  güncel      ${yol}`)
    continue
  }

  if (YALNIZ_DOGRULA) {
    console.log(`  YAZILACAK   ${yol}  (${Object.keys(veri).join(', ')})`)
    sayac.yazilan += Object.keys(veri).length
    sayac.kayit++
    continue
  }

  await p.neighborhood.update({ where: { id: kayit.id }, data: veri })
  console.log(`  yazıldı     ${yol}  (${Object.keys(veri).join(', ')})`)
  sayac.yazilan += Object.keys(veri).length
  sayac.kayit++
}

console.log(
  `\n${YALNIZ_DOGRULA ? 'DOĞRULAMA' : 'İÇERİK'} SONUCU\n` +
    `  pilot kayıt      ${Object.keys(PILOT).length}\n` +
    `  güncellenen      ${sayac.kayit}\n` +
    `  yazılan alan     ${sayac.yazilan}${YALNIZ_DOGRULA ? ' (yazılmadı)' : ''}\n` +
    `  zaten güncel     ${sayac.guncel}\n` +
    `  atlanan (elle)   ${sayac.atlanan}\n` +
    `  bulunamayan      ${sayac.bulunamayan}\n\n` +
    'NOT: bu betik YAYINA ALMAZ. Aktivasyon: npm run mahalle-yayin'
)

await p.$disconnect()
