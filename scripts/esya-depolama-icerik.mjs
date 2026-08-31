// EŞYA DEPOLAMA (#77) — İÇERİK OTORİTESİ TURU
//
// NEDEN VE NASIL
// M4 denetimi bu sayfayı 7.5 ile ailenin en zayıfı bulmuştu: 177 kelimelik
// en kısa gövde ve en uzun eksik-bilgi listesi. O listedeki maddelerin
// çoğu TESİS ÖZELLİĞİYDİ (depo konumu, tipi, iklim yönetimi, güvenlik
// donanımı, kabul edilmeyen eşya listesi) ve hiçbiri doğrulanamadı.
//
// BU YÜZDEN SAYFA TESİS TANITIMI DEĞİL, KARAR SAYFASI OLARAK YAZILDI.
// Anlatılan şey "depomuzda şunlar var" değil, "depolama nasıl planlanır".
// Uydurulmayanlar — hiçbiri metinde geçmiyor:
//   depo konumu · metrekare · ısıtma · nem/rutubet kontrol sistemi ·
//   kamera · alarm · yangın sistemi · 7/24 güvenlik · kişiye özel oda ·
//   konteyner · erişim saatleri · sigorta kapsamı · minimum süre ·
//   aylık fiyat · spesifik kabul edilmeyen eşya listesi
//
// KALDIRILAN DOĞRULANMAMIŞ İFADELER
//   · subtitle "Taşınma tarihleri arasında GÜVENLİ saklama"
//     → "Ambalajlı ve listeli saklama". "Güvenli" görselden de kayıttan da
//       kanıtlanamayan bir sıfat; yerine gerçekten yapılan iki işlem yazıldı
//       (ikisi de includes[1–2]'de ve sayfa fotoğrafında görünüyor).
//       ⚠ Bu alan /hizmetlerimiz dizininde ve ana sayfa hizmet kartında da
//       basılıyor (ölçüldü). Değişen tasarım değil, doğrulanmamış bir sıfat.
//   · faq "Depodaki eşyama ulaşabilir miyim?" → "...haber vermeniz yeterli;
//     LİSTEDEN YERİNİ BULUP ÇIKARIYORUZ" bir talep üzerine erişim taahhüdüydü.
//     Soru, kararı anlatan biçime çevrildi: erişim ihtiyacı VARSA bunun
//     depolamadan ÖNCE söylenmesi gerektiği ve yerleşimi değiştirdiği.
//   · faq "Kısa süreli (BİRKAÇ GÜN) ve uzun süreli (AYLAR) depolama
//     yapıyoruz" → süre aralığı beyanı çıktı; yerine sürenin HAZIRLIĞI
//     nasıl değiştirdiği anlatılıyor.
//   · includes "NEM VE TOZ KORUMASI İÇİN örtüleme" → "Örtüleme ve palet
//     üzerine yerleştirme". Eskisi bir iklim yönetimi imâ ediyordu; yenisi
//     yapılan işlemin kendisi.
//   · faq5 "kapalı depolanan bir buzdolabında koku ve küf OLUŞUYOR"
//     → "OLUŞABİLİYOR" (kesin sonuç → olasılık).
//   · imageAlt reklam sıfatı taşımıyor; yalnız karede görüneni anlatıyor.
//
// İKİNCİ TURDA ÜÇ MİKRO DÜZELTME
//   · "Taşımada ambalaj BİRKAÇ SAAT iş görüyor" → yazıyla yazılmış bir
//     süre genellemesiydi; taşımanın kaç saat sürdüğü işe göre değişiyor.
//     "Taşıma ile depolamanın ambalaj ihtiyacı aynı değil; depolamada
//     ambalaj eşyanın üzerinde daha uzun süre kalabiliyor" oldu — aynı
//     karşılaştırma, süre iddiası yok.
//   · "her malzeme için DOĞRU OLMUYOR" → "UYGUN OLMAYABİLİYOR". Eskisi
//     kategorik bir teknik hükümdü; yenisi koşullu.
//   · "AĞIR PARÇALAR ALTA, hafif ve kırılabilir olanlar ÜSTE geliyor"
//     → mutlak bir yerleşim kuralıydı ve her depoda/istifte böyle
//     olmayabiliyor. "Yerleşimde ağır parçaların hafif ve kırılabilir
//     eşyalara yük bindirmemesi gözetiliyor" oldu: amaç aynı, kural
//     mutlak değil.
//
// BİLEREK KORUNAN "YANLIŞ POZİTİF"
// Girişteki "Aradaki boşluk bazen birkaç gün, bazen birkaç ay" MÜŞTERİNİN
// takvimini anlatıyor, bizim verdiğimiz bir süre değil — #73'teki "aynı
// güne denk gelmiyor" ile aynı sınıf.
//
// KABUL KOŞULLARI — KATEGORİ DÜZEYİNDE
// İşletmenin kabul politikası bilinmediği için "şunları kabul etmiyoruz"
// listesi YAZILMADI. Bunun yerine hangi ÜRÜN SINIFININ ayrıca konuşulması
// gerektiği söylendi ve bu bir firma politikası gibi değil, depolama
// öncesi netleştirilecek bir başlık olarak sunuldu.
//
// "DEPO KOŞULLARI" BÖLÜMÜ — MÜŞTERİNİN SORU LİSTESİ
// Bölüm "bizde şunlar var" demiyor; hangi depo olursa olsun önceden
// netleşmesi gereken başlıkları sayıyor. Şablona checklist/kart eklenmedi,
// normal CMS düzyazısı.
//
// NE DEĞİŞMİYOR ve NEDEN
//   title / H1     bozulmuyor
//   metaTitle      M2'de kurulan niyet ayrımı korunuyor
//   excerpt        ÖLÇÜLDÜ: /hizmetlerimiz ve ana sayfa hizmet kartında
//                  görünüyor; içinde doğrulanmamış iddia yok, ellenmedi
//   description    herkese açık hiçbir yerde basılmıyor
//   imagePath      görsel semantik olarak uygun (paletli ambalajlı mobilya,
//                  etiketli koli, liste tutan görevli) — değişmiyor
//
// BAŞLIK UZUNLUĞU BİR TASARIM KISITI
// Şablonun sağ teknik marjı gövdenin <h3> başlıklarını okuyor; başlıklar
// 24 karakteri geçmiyor.
//
// KULLANIM
//   node --env-file=.env scripts/esya-depolama-icerik.mjs          (uygula)
//   node --env-file=.env scripts/esya-depolama-icerik.mjs --geri   (eskiye dön)
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../prisma/generated/client/client.ts'

const YEDEK = 'scripts/.esya-depolama-icerik-onceki.json'
const SLUG = 'esya-depolama'

const CONTENT = `<p>Eşya depolama, eşyayı boş bir alana bırakmak değil; bekleyeceği süreye, malzemesine ve sonradan nasıl çıkacağına göre hazırlamaktır. İhtiyacı çoğu zaman bir tarih boşluğu doğuruyor: eski evden çıkış ile yeni eve giriş aynı güne denk gelmiyor. Aradaki boşluk bazen birkaç gün, bazen birkaç ay — planı belirleyen de bu sürenin uzunluğu oluyor.</p>

<h3>Ne kadar alan gerekiyor</h3>
<p>Gereken alanı oda sayısı tek başına söylemiyor. Aynı büyüklükteki iki evden çıkan eşya, dolapların doluluğuna ve büyük parçaların ölçüsüne göre çok farklı yer tutuyor.</p>
<p>Keşifte bakılan şey şu: kaç koli çıkıyor, hangi mobilyalar sökülebiliyor, düzensiz biçimli ya da sökülemeyen parçalar var mı. Sökülebilen bir gardırop yatarak yerleşiyor; sökülemeyen bir köşe takımı kendi hacminden fazlasını istiyor, çünkü üstüne başka bir şey konamıyor.</p>
<p>Hacmi ambalaj da büyütüyor. Örtü, köşe koruması ve palet eklendiğinde toplam artıyor; alan bu son hâle göre çıkarılıyor.</p>

<h3>Ne kadar süre bekleyecek</h3>
<p>Süre, hazırlığın ne kadar ileri gideceğini belirliyor. Kısa bir beklemede eşya taşıma ambalajıyla kalabiliyor; uzun bekleyecek eşyada ambalajın kendisi de gözden geçiriliyor.</p>
<p>Süreyi baştan kesin bilmiyorsanız bu bir engel değil; kısa süre üzerinden başlayıp uzatmak mümkün. Ama sürenin uzayabileceğini biliyorsanız bunu baştan söylemek işe yarıyor, çünkü hem yerleşim hem ambalaj kararı değişebiliyor.</p>

<h3>Malzemeye göre hazırlık</h3>
<p>Her eşya aynı şekilde beklemiyor. Ahşap ve deri yüzeyler nemden etkilenen malzemeler; bu parçalar nefes alan örtüyle kaplanıyor ve doğrudan zemine değil palet üzerine yerleştiriliyor. Kitap ve evrak ağırlığı yüzünden küçük kutularda ve alt sıralarda duruyor. Beyaz eşya boşaltılmış ve kurutulmuş olarak, kapağı hafif aralık bırakılarak konuyor; kapalı bekletilen bir buzdolabında koku ve küf oluşabiliyor.</p>
<p>Depolamayı taşımadan ayıran nokta da burası. Taşıma ile depolamanın ambalaj ihtiyacı aynı değil; depolamada ambalaj eşyanın üzerinde daha uzun süre kalabiliyor. Bu yüzden hava almayan sıkı bir kapatma her malzeme için uygun olmayabiliyor — ambalaj yalnız yol darbesine göre değil, bekleme süresine göre de seçiliyor. Hangi parçanın hangi malzemeye gittiği <a href="/paketleme-hizmeti">paketleme</a> tarafında ayrıntılı.</p>

<h3>Yerleşim ve erişim</h3>
<p>Depoya giren her parçanın ne olduğu ve nereden geldiği kayıtlı oluyor: eşya tek tek listeleniyor, odasına göre etiketleniyor ve liste karşılıklı imzalanıyor. Sökülen parçaların vidaları kendi torbasında, ait olduğu mobilyaya bağlı kalıyor — aylar sonra eksik vida aramak istemezsiniz.</p>
<p>Yerleşim sırası da bir karar. Yerleşimde ağır parçaların hafif ve kırılabilir eşyalara yük bindirmemesi gözetiliyor. Bekleme süresi içinde bir eşyaya ulaşmanız gerekebileceğini düşünüyorsanız bunu depolamadan önce söylemek önemli: o parçalar önü kapatılmayacak şekilde yerleştirilebiliyor. Sonradan ortaya çıkan erişim ihtiyacı, önü dolmuş bir istifi açmak demek.</p>

<h3>Depo koşulları</h3>
<p>Depolama kararı verirken alanın kendisi de konuşulmalı. Hangi depoda olursa olsun şu başlıkların önceden netleşmesi gerekiyor: alan kapalı mı, eşya ortak bir alanda mı yoksa ayrılmış bir bölümde mi duracak, nem ve sıcaklık nasıl yönetiliyor, giriş ve erişim hangi koşulda mümkün, güvenlik ve yangın tedbirleri nasıl tanımlanmış, eşya listesi ve teslim kaydı nasıl tutuluyor.</p>
<p>Kabul koşulları da aynı şekilde baştan konuşuluyor. Bozulabilir, tehlikeli, yanıcı ya da özel saklama koşulu gerektiren ürünlerin kabul şartları depolama öncesinde ayrıca netleştirilmeli; bunlar eşya listesi çıkarılırken tek tek konuşulan başlıklar.</p>

<h3>Çıkış ve geri teslim</h3>
<p>Depolama girişle bitmiyor; kurulan plan asıl çıkışta işe yarıyor. Teslim gününde çıkış aynı liste üzerinden yapılıyor, hangi parçanın nerede olduğu baştan sona kayıtlı kalıyor.</p>
<p>Yerleştirme yapılırken çıkış sırası da düşünülüyor: yeni adreste ilk kurulması gereken parçalar en önde duruyor. Etiketler oda ayrımını taşıdığı için eşya yeni adreste doğrudan yerine gidiyor, sökülmüş parçalar da bağlantı elemanlarıyla birlikte çıktığı için montaj için ayrıca bir şey aranmıyor.</p>

<h3>Fiyatı ne belirliyor</h3>
<p>Maliyeti iki kalem birlikte belirliyor: kaplanan hacim ve bekleme süresi. Bunların üstüne depoya giriş ve çıkış taşımaları, paketleme ihtiyacı ve özel işlem gerektiren parçalar ekleniyor.</p>
<p>Mesafe de hesaba giriyor, çünkü depolama iki ayrı taşıma demek: çıkış adresinden depoya, depodan yeni adrese. Kaba bir aralık için <a href="/fiyat-hesaplama">fiyat hesaplama aracı</a> başlangıç noktası olabiliyor; kesin kapsam eşya listesiyle çıkıyor.</p>`

/**
 * Altı madde. Beşi olduğu gibi kaldı.
 *
 * 5. maddeden "Nem ve toz koruması için" ibaresi çıktı: bir iklim yönetimi
 * imâ ediyordu ve doğrulanamıyor. Yerine gerçekten yapılan iki işlem
 * yazıldı — ikisi de sayfa fotoğrafında görünüyor.
 */
const INCLUDES = [
  'Ambalajlı ve etiketli depolama',
  'Eşya listesi ve teslim tutanağı',
  'Kısa ve uzun süreli seçenek',
  'Depoya giriş ve çıkış taşımaları',
  'Örtüleme ve palet üzerine yerleştirme',
  'Teslim gününde yerleştirme',
]

/**
 * Beş soru. İkisi konu olarak korundu, üçü değişti:
 *
 *   ÇIKAN  "Eşyalarım depoda ne kadar süre kalabilir?" — cevabı bir süre
 *          aralığı beyanıydı ("birkaç gün / aylar"). Yerine hazırlığın
 *          nasıl yapıldığı soruluyor; süre kararı gövdede kendi bölümünde.
 *   ÇIKAN  "Eşya listesi tutuluyor mu?" — cevabı gövdedeki yerleşim
 *          bölümünün kısaltılmışıydı, yeni bilgi taşımıyordu.
 *   ÇIKAN  "Ahşap mobilya ve beyaz eşya zarar görür mü?" — içeriği yeni
 *          1. soruya taşındı.
 *   YENİDEN "Depodaki eşyama ulaşabilir miyim?" → talep üzerine erişim
 *          taahhüdü veriyordu. Artık kararı anlatıyor: erişim ihtiyacı
 *          varsa önceden söylenmesi gerektiğini.
 *   GİREN  "Ne kadar alan gerektiği nasıl belirleniyor?" ve
 *          "Her eşya depolanabilir mi?" — ikisi de keşif öncesi gerçekten
 *          sorulan, kararı değiştiren sorular.
 */
const FAQS = [
  {
    question: 'Eşyalar depoya nasıl hazırlanıyor?',
    answer:
      'Ambalaj taşıma standardında yapılıyor ve depolama boyunca açılmıyor. Ahşap ve deri parçalar nefes alan örtüyle kaplanıp palet üzerine alınıyor; beyaz eşya boşaltılmış ve kurutulmuş olarak, kapağı hafif aralık bırakılarak konuyor.',
  },
  {
    question: 'Ne kadar alan gerektiği nasıl belirleniyor?',
    answer:
      'Oda sayısından değil eşya listesinden çıkıyor: koli sayısı, sökülebilen ve sökülemeyen büyük parçalar, düzensiz biçimli mobilyalar. Ambalaj da hacmi büyüttüğü için alan son hâline göre hesaplanıyor.',
  },
  {
    question: 'Depodaki eşyaya ulaşmam gerekirse ne olur?',
    answer:
      'Bekleme süresinde bir parçaya ulaşmanız gerekebileceğini düşünüyorsanız bunu depolamadan önce söyleyin; o parçalar önü kapatılmayacak şekilde yerleştirilebiliyor. Sonradan çıkan ihtiyaç, dolmuş bir istifi açmak demek.',
  },
  {
    question: 'Depolama fiyatı neye göre belirleniyor?',
    answer:
      'Kaplanan hacim ve bekleme süresi. Bunlara depoya giriş ve çıkış taşımaları, paketleme ihtiyacı ve özel işlem gerektiren parçalar ekleniyor. Depolama iki ayrı taşıma demek, mesafe de hesaba giriyor.',
  },
  {
    question: 'Her eşya depolanabilir mi?',
    answer:
      'Bozulabilir, tehlikeli, yanıcı ya da özel saklama koşulu gerektiren ürünlerin kabul şartları depolama öncesinde ayrıca netleştirilmeli. Eşya listesi çıkarılırken bu tür parçalar ayrıca konuşuluyor.',
  },
]

/**
 * 152 karakter. Eski açıklama ne yapıldığını sayıyordu; bu, kararın neye
 * göre verildiğini söylüyor. Depo güvenliği ya da iklim sistemi gibi
 * doğrulanmamış hiçbir özellik geçmiyor.
 */
const META_DESCRIPTION =
  'Eşya depolamada belirleyici olan yalnız alan değil: hacim, bekleme süresi, malzemeye göre ambalaj ve erişim planı. İstanbul’da depolama nasıl planlanır.'

/**
 * Görsele bakılarak yazıldı: depo koridorunda paletler üzerinde battaniyeli
 * ve kemerli mobilyalar, "HASSAS — EV EŞYALARI" etiketli koliler, elinde
 * pano tutan görevli. "Güvenli", "modern", "rutubetsiz", "profesyonel" gibi
 * görselden kanıtlanamayacak sıfat yok.
 */
const IMAGE_ALT = 'Depoda paletler üzerinde ambalajlı ve kemerli mobilyalar, etiketli koliler ve liste tutan görevli'

/** Tek doğrulanmamış sıfat buradaydı: "güvenli". */
const SUBTITLE = 'Ambalajlı ve listeli saklama'

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
    subtitle: kayit.subtitle,
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
      subtitle: SUBTITLE,
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
  console.log(`  subtitle         "${eski.subtitle}" → "${SUBTITLE}"`)
  console.log(`  content          ${String(eski.content).length} → ${CONTENT.length} kar · ${kelime(eski.content)} → ${kelime(CONTENT)} kelime`)
  console.log(`  h3               ${(String(eski.content).match(/<h3/g) || []).length} → ${h3.length} · en uzun ${Math.max(...h3.map((x) => x.length))} kar`)
  console.log(`  paragraf         ${(String(eski.content).match(/<p>/g) || []).length} → ${(CONTENT.match(/<p>/g) || []).length}`)
  console.log(`  includes         ${eski.includes.length} → ${INCLUDES.length}`)
  console.log(`  faqs             ${eski.faqs.length} → ${FAQS.length} · cevap ${Math.min(...FAQS.map((f) => f.answer.length))}–${Math.max(...FAQS.map((f) => f.answer.length))} kar`)
  console.log(`  metaDescription  ${String(eski.metaDescription).length} → ${META_DESCRIPTION.length} kar`)
  console.log(`  imageAlt         ${String(eski.imageAlt).length} → ${IMAGE_ALT.length} kar`)
  console.log('\nGeri almak için: node --env-file=.env scripts/esya-depolama-icerik.mjs --geri')
}

await db.$disconnect()
