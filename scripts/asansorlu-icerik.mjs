// ASANSÖRLÜ NAKLİYAT (#74) — İÇERİK OTORİTESİ TURU
//
// NEDEN
// M4 denetimi bu sayfayı 8.0 verdi ve iki ayrı sorun ölçtü:
//
//   1. FACTUAL — `content` içinde İSTANBUL DIŞI örnekler vardı:
//      "İzmir'de Konak'ın üst mahalleleri, Trabzon ve Zonguldak'ın büyük
//      kısmı". Sitenin tamamı İstanbul konumlandırmasında; hizmet şeması
//      `areaServed: City İstanbul`, hizmet sayfaları yalnız İstanbul
//      ilçelerine bağlanıyor ve daha önce tam bu sebeple "Türkiye
//      genelinde veriyoruz" başlığıyla 12 il rozeti kaldırılmıştı.
//
//   2. TEZ — sayfanın en güçlü fikri ("Her yüksek katlı taşınmada
//      gerekmiyor") tek cümlede kalıyordu. Kararın neye göre verildiği
//      açılmıyordu.
//
// YENİ TEZ
// Dış cephe asansörü kat sayısına göre değil, binanın ve sokağın erişim
// geometrisine göre anlam kazanıyor. Sayfa artık bu geometriyi tek tek
// açıyor: kabin ölçüsü, merdiven dönüşü, en büyük parça, cephe açıklığı,
// kurulum alanı, zemin ve iki adresin ayrı koşulları.
//
// DOĞRULANMAMIŞ SAYI UYDURULMADI
// Elimizde olmayan hiçbir rakam yazılmadı ve mevcut olanlar kaldırıldı:
//   · "1960–1980 arası apartmanlarda asansör ya yok ya tek kişilik"
//     → dönem istatistiği çıkarıldı; yerine keşifte GÖRÜLEN koşul
//       ("kabini tek kişilik olan asansör") anlatılıyor
//   · "bu bir günlük iş değil" (izin süresi çağrışımı)
//     → süre ifadesi çıkarıldı; iznin belediyenin kararına bağlı olduğu
//       açıkça yazıldı
//   · "komşu bilgilendirmesi taşınma gününü YARIM GÜN kısaltabiliyor"
//     → nicel iddia çıkarıldı; nedeni kaldı (araçların kaldırılması)
//   · "Kullandığımız asansörler YÜKSEK KATLARA ulaşıyor" (FAQ 4)
//     → soru tamamen değişti (aşağıda), çünkü doğru cevabı ancak gerçek
//       ekipman sınırı verir ve o bilgi elimizde yok
// Kat sınırı, kurulum yüksekliği, minimum kaldırım genişliği ve rüzgâr
// limiti gibi sayılar HİÇBİR YERDE geçmiyor.
//
// "İzin sürecini biz takip ediyoruz" ifadesi KORUNDU ama genişletilmedi:
// yapılan iş (başvuru + takip) ile sonuç (iznin verilmesi) ayrı tutuldu.
//
// SONUÇ GARANTİSİ ÇAĞRIŞIMI DA TEMİZLENDİ
// İkinci turda iki ifade daha nötrleştirildi — ikisi de sayı değil, örtük
// bir SONUÇ sözü veriyordu:
//   · "kurulum alanı elverişli değilse yöntem değişiyor, İŞ ERTELENMİYOR"
//     → "kurulum alanı uygun değilse taşıma yöntemi baştan yeniden
//        planlanıyor". Eski hâli "hiçbir koşulda ertelemeyiz" diye
//        okunuyordu; oysa ertelemeyi gerektiren durum (izin, hava, yol)
//        sayfanın kendi içinde de anlatılıyor — yani metin kendiyle
//        çelişiyordu.
//   · "Yük asansörü olan binalarda çoğu parça SORUNSUZ iniyor"
//     → "parçaların çoğu kabine sığıyor". "Sorunsuz" bir sonuç sözü;
//        "kabine sığıyor" ise ölçülebilir bir koşul. Aynı cümle hem
//        `content` hem `faqs` içinde geçtiği için İKİSİ BİRDEN
//        düzeltildi — biri kalsaydı sayfa kendi kendiyle çelişirdi.
// FAQ cevabına ayrıca "cephe açıklığı" eklendi: karar üç ölçüden
// çıkıyor (kabin + merdiven + açıklık), cevap ikisini sayıyordu.
//
// NE DEĞİŞMİYOR ve NEDEN
//   title / H1     bozulmuyor
//   metaTitle      M2'de kurulan niyet ayrımı korunuyor
//   subtitle       "Dar merdiven ve yüksek katlar için" — yeni tezle
//                  hafif gerilimde ama /hizmetlerimiz dizininde de
//                  basılıyor ve o sayfa FREEZE
//   excerpt        ÖLÇÜLDÜ: hem /hizmetlerimiz hem ana sayfa hizmet
//                  kartında birebir görünüyor; ikisi de FREEZE
//   description    herkese açık hiçbir yerde basılmıyor (yalnız JSON-LD
//                  yedeği, o da `excerpt`in arkasında)
//   imagePath      görsel değişmiyor, yalnız alt metni düzeliyor
//
// BAŞLIK UZUNLUĞU BİR TASARIM KISITI
// Şablonun sağ teknik marjı gövdenin <h3> başlıklarını okuyor. Başlıklar
// 21 karakteri geçmiyor ki 1024'te marj sütununda ikinci satıra inmesin.
//
// KULLANIM
//   node --env-file=.env scripts/asansorlu-icerik.mjs          (uygula)
//   node --env-file=.env scripts/asansorlu-icerik.mjs --geri   (eskiye dön)
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../prisma/generated/client/client.ts'

const YEDEK = 'scripts/.asansorlu-icerik-onceki.json'
const SLUG = 'asansorlu-nakliyat'

const CONTENT = `<p>Dış cephe asansörü, eşyanın merdiven yerine binanın dışından — pencere ya da balkon hizasından — indirilip çıkarılmasıdır. Ne zaman gerektiğini kat sayısı tek başına söylemiyor: yüksek bir kattaki daireye asansörle rahat çıkılabilirken, alt kattaki bir daire dar bir merdiven sahanlığı yüzünden cepheden çözülmek zorunda kalabiliyor. Karar binanın ve sokağın erişim geometrisinden çıkıyor.</p>

<h3>Kararı ne belirliyor</h3>
<p>Keşifte tek bir ölçü değil, birkaç koşul birlikte okunuyor: bina asansörünün kabin ölçüsü, merdiven sahanlığının dönüş payı, taşınacak en büyük parçanın boyu, pencere ya da balkon açıklığı ve cepheye yaklaşılabilirlik.</p>
<p>Bunların hepsi her binada sorun değil. Çoğu adreste bir ya da iki tanesi belirleyici oluyor; hangisi olduğu görülmeden yöntem seçilmiyor. Bu yüzden asansör gerektirebilecek adreslerde keşif fotoğraf üzerinden değil yerinde yapılıyor.</p>

<h3>Bina asansörü varsa</h3>
<p>Binada asansör olması cephe asansörünün gerekmeyeceği anlamına gelmiyor; belirleyici olan kabinin iç ölçüsü. Yük asansörü bulunan binalarda parçaların çoğu kabine sığıyor. Buna karşılık kabini tek kişilik olan bir asansör gardırop, buzdolabı ya da üç kişilik koltuğu almıyor.</p>
<p>Asansörü olmayan ya da kabini dar olan binalarda bu parçalar merdivene kalıyor. Merdiven de geçirmiyorsa cephe gündeme geliyor — yani sıralama kat değil, parça ile açıklık arasındaki ölçü farkı.</p>

<h3>Cephe ve açıklık</h3>
<p>Eşyanın girip çıkacağı açıklık pencere ya da balkon oluyor. Balkonlu dairede korkuluk sökülebiliyorsa geniş bir açıklık çıkıyor; pencereden çalışılacaksa kanadın açılma biçimi ve kasa ölçüsü belirleyici.</p>
<p>Cephenin önünde çıkıntı, tente, klima dış ünitesi ya da ağaç varsa platformun izleyeceği hat değişiyor. Bu yüzden cephe de zeminden bakılarak değil, hangi açıklığın kullanılacağı belirlenerek değerlendiriliyor.</p>

<h3>Kurulum alanı</h3>
<p>Asansör kaldırıma ya da yola kuruluyor, yani binanın önünde ayrılabilecek bir alan gerekiyor. Alan dar kalıyorsa ya da gün boyu dolu bir park hattı varsa kurulum yapılamıyor.</p>
<p>Zeminin düz olması da gerekiyor. Yokuşlu sokaklarda — Kuzguncuk ve Ortaköy gibi — eğim kuruluma izin vermeyebiliyor. Bu durumda asansör bir alt noktaya kuruluyor ya da kurulum alanı uygun değilse taşıma yöntemi baştan yeniden planlanıyor.</p>
<p>Kurulacak yerin önündeki araçların taşıma saatinde kaldırılmış olması gerekiyor. Komşuların ve varsa site yönetiminin önceden bilgilendirilmesi bu yüzden işin bir parçası.</p>

<h3>Belediye izni</h3>
<p>Kaldırım ya da yol kullanıldığı için çoğu ilçede belediyeden kullanım izni alınması gerekiyor. Başvuruyu ve takibini biz yapıyoruz; taşınma tarihi de bu sürecin tamamlanmasına göre planlanıyor.</p>
<p>İznin sonucu belediyenin kararına bağlı olduğu için tarihi baştan gerçekçi veriyoruz. Gün belirleyip sonra ertelemek zorunda kalmaktansa, izin süreci hesaba katılmış bir tarih vermeyi tercih ediyoruz.</p>

<h3>Bina ve eşya koruması</h3>
<p>Cepheden geçirilen her parça önce ambalajlanıyor, sonra platforma bağlanarak sabitleniyor; platformda gevşek duran bir parça yükselirken dönebiliyor.</p>
<p>Açıklığın kenarları — pencere kasası, korkuluk, balkon eşiği — temas noktası olduğu için kaplanıyor. Parça daireye alındıktan sonraki bina içi güzergâh normal taşımadaki gibi korunuyor.</p>

<h3>İki adres, iki karar</h3>
<p>Cephe asansörünün çıkış adresinde gerekmesi, giriş adresinde de gerekeceği anlamına gelmiyor. İki adresin kabin ölçüsü, merdiveni ve önündeki kurulum alanı ayrı ayrı değerlendiriliyor; taşımanın bir ucunda cepheden, diğer ucunda merdivenden çalışıldığı sık oluyor.</p>
<p>Hangi ucun asansör gerektirdiği aynı zamanda süreyi ve ekip dağılımını belirliyor. Taşımanın tamamının nasıl planlandığını <a href="/evden-eve-nakliyat">evden eve nakliyat</a> sayfasında, kaba bir aralık için <a href="/fiyat-hesaplama">fiyat hesaplama aracını</a> kullanarak görebilirsiniz.</p>`

/**
 * Altı madde. Üçü olduğu gibi kaldı, üçü somutlaştı.
 *
 * 2. madde bilerek "takibi" diyor: yapılan iş başvuru ve takip; iznin
 *    VERİLMESİ belediyenin kararı. Kapsam ile sonuç garantisi ayrı.
 */
const INCLUDES = [
  'Dış cephe asansörü kurulumu ve operatörü',
  'Belediyeden yol / kaldırım kullanım izni başvurusu ve takibi',
  'Pencere kasası, korkuluk ve kapı kasası koruması',
  'Büyük parçaların sökümü ve yeniden montajı',
  'Cepheden geçen parçaların ambalajı ve platforma sabitlenmesi',
  'Kurulum alanının ve cephe açıklığının yerinde değerlendirilmesi',
]

/**
 * Beş soru. Dördü konu olarak korundu, biri değişti:
 *
 *   ÇIKAN  "Kaç kata kadar çıkabiliyor?"
 *          Cevabı gerçek ekipman sınırını gerektiriyor ve o bilgi elde
 *          yok. Mevcut cevap ("yüksek katlara ulaşıyor") soruyu
 *          savuşturuyordu — sayı uydurmak yerine soruyu değiştirdik.
 *   GİREN  "Binada asansör varsa yine gerekir mi?"
 *          Keşif öncesi en sık sorulan ve yöntemi değiştiren karar.
 *          "Her binaya kurulabiliyor mu?" sorusuyla ÇAKIŞMIYOR: o
 *          kurulum tarafını, bu bina içi alternatifi soruyor.
 */
const FAQS = [
  {
    question: 'Asansörlü nakliyat ne kadar sürüyor?',
    answer:
      'Kurulum ve söküm ayrı bir zaman alıyor ama toplamda işi kısaltıyor: aynı eşyayı dar bir merdivenden taşımak çok daha uzun sürüyor. Süreyi eşya listesi ve iki adresin koşulları çıktıktan sonra söylüyoruz.',
  },
  {
    question: 'Asansör her binaya kurulabiliyor mu?',
    answer:
      'Hayır. Kurulacak yerin düz olması ve önünde ayrılabilecek bir alan bulunması gerekiyor. Dik yokuşlu ya da kaldırımı dar sokaklarda kurulamıyor; bu durumda plan elle taşımaya göre yapılıyor.',
  },
  {
    question: 'Binada asansör varsa yine gerekir mi?',
    answer:
      'Kabin ölçüsüne bağlı. Yük asansörü bulunan binalarda parçaların çoğu kabine sığıyor; kabini tek kişilik bir asansör ise gardırop ya da buzdolabını almıyor. Kabin, merdiven ve cephe açıklığı birlikte değerlendiriliyor.',
  },
  {
    question: 'Asansör ücreti fiyata dahil mi?',
    answer:
      'Asansör gerekiyorsa keşifte belirtiliyor ve teklifte ayrı kalem olarak gösteriliyor. Gerekmiyorsa hiç eklenmiyor. Taşınma günü çıkan "asansör farkı" diye bir kalemimiz yok.',
  },
  {
    question: 'Komşulara ya da site yönetimine haber vermem gerekir mi?',
    answer:
      'Evet, işe yarıyor. Asansörün kurulacağı yerin önündeki araçların taşıma saatinde kaldırılmış olması gerekiyor; komşuların önceden bilgilendirilmesi bunu kolaylaştırıyor. Sitelerde ayrıca yönetim onayı gerekiyor.',
  },
]

/**
 * 147 karakter — özellik listesi değil TEZ. Eski açıklama ("merdiven
 * boşluğundan geçmeyen parçalar … indiriliyor") ne yapıldığını sayıyordu;
 * bu, kararın neye göre verildiğini söylüyor. "merdiven dönüşü" bilerek
 * çıkarıldı: gövdede duruyor, arama açıklamasında 160 karakter bütçesini
 * aşıyordu.
 */
const META_DESCRIPTION =
  'Dış cephe asansörünü kat sayısı değil erişim geometrisi belirliyor: kabin ölçüsü, cephe açıklığı, kurulum alanı. İstanbul’da karar nasıl veriliyor?'

/**
 * Görselde ne olduğuna BAKILARAK yazıldı: dış cephe asansörünün
 * platformunda battaniyeye sarılı bir koltuk, balkon hizasına çıkarılmış
 * durumda. "Özenle", "güvenli", "profesyonel" gibi reklam sıfatı yok;
 * karede olmayan hiçbir şey eklenmedi.
 */
const IMAGE_ALT = 'Dış cephe asansörünün platformundaki ambalajlı koltuk balkon hizasına çıkarılıyor'

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
  console.log(`  imageAlt         "${eski.imageAlt}" → "${IMAGE_ALT}"`)
  console.log('\nGeri almak için: node --env-file=.env scripts/asansorlu-icerik.mjs --geri')
}

await db.$disconnect()
