// PARÇA EŞYA TAŞIMA (#75) — İÇERİK OTORİTESİ TURU
//
// NEDEN
// M4 denetimi bu sayfayı 8.0 verdi. Omurgası sağlamdı ama iki eksiği vardı:
//
//   1. İSTANBUL ERİŞİM GERÇEKLİĞİ SIFIRDI. Yedi erişim başlığından yalnız
//      biri (genel "güzergâh") geçiyordu. Oysa tek parça taşımada asıl
//      problem tam da bu: dar sokakta tek koltuk, asansörsüz üst katta tek
//      buzdolabı, park hattı dolu bir caddede kısa duruş penceresi.
//      Sayfa "az eşya" ile "kolay iş"i sessizce eşitliyordu.
//
//   2. MALİYET İDDİALARI DOĞRULANMAMIŞTI. "Maliyet belirgin düşüyor",
//      "parsiyel açık ara ekonomik" ve FAQ başlığı "Parça eşya taşıma
//      neden daha ucuz?" — üçü de paylaşımlı modelin KESİN olarak daha
//      ucuz olduğunu söylüyordu. Elimizde bunu doğrulayan bir fiyat verisi
//      yok; üstelik hacim/erişim koşullarına göre iki model bazı işlerde
//      birbirine yaklaşabiliyor.
//
// NÖTRLEŞTİRİLENLER (hepsi işletmeden gelmeyen iddialardı)
//   · "Maliyet bu yüzden belirgin düşüyor"
//     → "maliyet paylaşılıyor" (mekanizma kalıyor, büyüklük iddiası gidiyor)
//   · "Hacim küçükse ve tarih esnekse parsiyel AÇIK ARA EKONOMİK"
//     → cümle tamamen çıktı; yerine hangi durumda hangi modelin gündeme
//       geldiği anlatılıyor
//   · FAQ "Parça eşya taşıma NEDEN DAHA UCUZ?"
//     → soru varsayımı taşıyordu; "Paylaşımlı taşıma ile özel araç
//       arasında ne değişiyor?" olarak yeniden kuruldu
//   · includes "Parsiyel (paylaşımlı) araçla EKONOMİK sefer"
//     → "Özel araç ya da paylaşımlı sefer seçeneği"
//   · "EYLÜL–EKİM VE HAZİRAN günleri erken doluyor"
//     → ay adları çıktı (elde talep verisi yok); "dönem başı ve sonunda
//       talep artıyor, uygun gün bulmak zorlaşıyor" kaldı
//   · "EN AZ BİR HAFTA önceden planlama öneriyoruz"
//     → sayı çıktı; "mümkün olduğunca önceden" kaldı
//   · imageAlt "eşyaların ÖZENLE araçlarımıza yerleştirilmesi"
//     → reklam sıfatı çıktı, karede gerçekten görünen şey yazıldı
//
// İKİNCİ TURDA İKİ İFADE DAHA
//   · "PAHALI OLANI ÖNERMEK GİBİ BİR ALIŞKANLIĞIMIZ YOK"
//     → doğrulanamayan bir niyet beyanıydı; okur bunu kontrol edemez.
//       Yerine kararın GERÇEKTEN neye baktığı yazıldı: eşya listesi,
//       tarihin ne kadar esneyebildiği ve iki adresin erişim koşulu.
//       Davranış artık iddia değil, tarif.
//   · "Bu, modelin karşılığında istediği TEK ŞEY"
//     → kategorik ifade; paylaşımlı modelin başka takasları da var
//       (aktarma, rota bağımlılığı). "önemli takaslarından biri" oldu.
//
// UYDURULMAYANLAR
// Gün aralığı (kaç gün), fiyat eşiği, minimum ücret, ekip kişi sayısı ve
// minimum hacim HİÇBİR YERDE geçmiyor. "Gün aralığı veriliyor" ifadesi
// korundu çünkü bu daha AZ kesinlik beyan ediyor, daha çok değil.
//
// NE DEĞİŞMİYOR ve NEDEN
//   title / H1     bozulmuyor
//   metaTitle      M2'de kurulan niyet ayrımı korunuyor
//   subtitle       "Tek eşya, birkaç koli, öğrenci taşınması" —
//                  /hizmetlerimiz dizininde de basılıyor, o sayfa FREEZE
//   excerpt        ÖLÇÜLDÜ: hem /hizmetlerimiz hem ana sayfa hizmet
//                  kartında görünüyor; ikisi de FREEZE
//   description    herkese açık hiçbir yerde basılmıyor
//   imagePath      görsel değişmiyor, yalnız alt metni düzeliyor
//
// BAŞLIK UZUNLUĞU BİR TASARIM KISITI
// Şablonun sağ teknik marjı gövdenin <h3> başlıklarını okuyor; başlıklar
// 25 karakteri geçmiyor ki 1024'te marjda ikinci satıra inmesin.
//
// KULLANIM
//   node --env-file=.env scripts/parca-esya-icerik.mjs          (uygula)
//   node --env-file=.env scripts/parca-esya-icerik.mjs --geri   (eskiye dön)
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../prisma/generated/client/client.ts'

const YEDEK = 'scripts/.parca-esya-icerik-onceki.json'
const SLUG = 'parca-esya-tasima'

const CONTENT = `<p>Parça eşya taşıma, bir evin tamamını değil tek tek parçaları taşımak: bir koltuk takımı, bir buzdolabı, birkaç koli kitap ya da bir öğrencinin yurt eşyası. Tam taşımadan farkı fiyatlandırma değil, aracın kullanım biçimi ve planın hangi koşula göre kurulduğu.</p>

<h3>Az eşya, kısa iş değil</h3>
<p>Parça sayısı azaldığında erişim problemi ortadan kalkmıyor. Tek bir koltuk da dar bir sokaktan çıkıyor, tek bir buzdolabı da asansörsüz üst kattan iniyor. İşi zorlaştıran eşyanın miktarı değil, o parçanın hangi koşuldan geçeceği.</p>
<p>Bu yüzden tek parçada da iki adres ayrı ayrı soruluyor: kat, bina asansörünün kabin ölçüsü, merdiven sahanlığı ve aracın kapıya ne kadar yaklaşabildiği. Çoğu işte süreyi bu dört başlık belirliyor, taşınan parça sayısı değil.</p>

<h3>Parça ölçüsü ve erişim</h3>
<p>Tek parçada belirleyici olan hacim değil ölçü. Bir buzdolabı hacim olarak küçük ama kapıdan, sahanlıktan ve asansör kabininden ayrı ayrı geçmesi gerekiyor; biri geçirmiyorsa yöntem değişiyor.</p>
<p>Kapıdan ya da sahanlıktan geçmeyen gardırop ve köşe takımı gibi parçalar yerinde sökülüyor. Sökülemiyorsa ya da bina buna elverişli değilse tek parça için de <a href="/asansorlu-nakliyat">dış cephe asansörü</a> gündeme gelebiliyor; kararın neye göre verildiği o sayfada ayrıntılı.</p>
<p>Aracın kapı önünde durabildiği süre de plana giriyor. İstanbul'da dar sokakta ya da park hattı dolu bir caddede araç uzun süre bekleyemiyorsa, parçanın çıkışı o kısa pencereye göre hazırlanıyor: ambalaj önceden yapılıyor, söküm gerekiyorsa araç gelmeden bitiriliyor.</p>

<h3>Araç nasıl seçiliyor</h3>
<p>İki model var. Özel araçta araç yalnız sizin işinize göre planlanıyor: gün netleşiyor, başka bir yüke bağlı kalınmıyor.</p>
<p>Paylaşımlı seferde ise aynı rota üzerindeki başka yüklerle birlikte planlama yapılıyor. Araç tek bir müşteriye ayrılmadığı için maliyet paylaşılıyor; karşılığında zamanlamanın esnek olması gerekebiliyor.</p>
<p>Seçim üç girdiye bakıyor: eşya listesi, tarihin ne kadar esneyebildiği ve iki adresin erişim koşulu. Hacim bir aracın önemli kısmını dolduruyorsa ya da tarih sabitse özel araç zaten daha doğru oluyor; üçü aynı yöne işaret etmiyorsa hangisinin neyi değiştirdiğini konuşup kararı birlikte veriyoruz. Kaba bir aralık için <a href="/fiyat-hesaplama">fiyat hesaplama aracı</a> başlangıç noktası olabiliyor; kesin kapsam eşya listesiyle çıkıyor.</p>

<h3>Tarih ve esneklik</h3>
<p>Paylaşımlı seferde tek bir gün değil gün aralığı veriliyor, çünkü sefer rotadaki diğer duraklara da bağlı. Zamanlama esnekliği, paylaşımlı modelin önemli takaslarından biri ve baştan söyleniyor.</p>
<p>Tarihin sabit olmak zorunda olduğu durumlar var: ev teslim günü, kira başlangıcı, yurt çıkışı. Böyle işlerde paylaşımlı model önerilmiyor. Gün netliği ile maliyet arasında seçim yapmanız gerekiyorsa bunu keşifte açıkça konuşuyoruz.</p>

<h3>Tek beyaz eşya</h3>
<p>Buzdolabı, çamaşır makinesi ve bulaşık makinesi taşınırken sabitlenmesi gereken parçalar var; makine boşta çalkalandığında iç aksamı zarar görüyor. Bu eşyalar taşıma aparatıyla sabitleniyor ve dik konumda taşınıyor.</p>
<p>Buzdolabının taşındıktan sonra bir süre çalıştırılmadan bekletilmesi gerekiyor; bunu teslimde hatırlatıyoruz. Tek beyaz eşya taşımalarında çıkış ve giriş adresinin kat farkı da plana giriyor — aynı makine iki katta iki ayrı iş demek.</p>

<h3>Öğrenci ve yurt taşınması</h3>
<p>Dönem başı ve sonunda parça eşya talebi belirgin artıyor ve bu dönemlerde uygun gün bulmak zorlaşıyor. Tarihi mümkün olduğunca önceden konuşmak hem araç seçeneğini hem gün netliğini artırıyor.</p>
<p>Yurt ya da ev çıkışı ile yeni adrese giriş arasında boşluk varsa eşyanın aradaki sürede beklemesi de plana yazılabiliyor; bu durumda taşıma iki ayrı sefer olarak kuruluyor.</p>`

/**
 * Altı madde. Üçü olduğu gibi kaldı.
 *
 * · 1. madde YENİ ve listenin başına konuldu: sayfanın tezi erişim
 *   değerlendirmesi, kapsamın da oradan başlaması gerekiyordu.
 * · 3. maddeden "ekonomik" çıktı — doğrulanmamış bir maliyet iddiasıydı;
 *   yerine gerçekten sunulan şey (iki seçenek) yazıldı.
 * · Çıkarılan "Öğrenci ve yurt taşınmalarında esnek tarih" bir esneklik
 *   SÖZÜ veriyordu; öğrenci taşınması zaten `subtitle`da ve gövdede
 *   kendi bölümüyle duruyor.
 */
const INCLUDES = [
  'Parça ölçüsü ve erişim koşullarının değerlendirilmesi',
  'Tek parça eşya ya da koli taşıma',
  'Özel araç ya da paylaşımlı sefer seçeneği',
  'Parçaya uygun ambalaj ve koruma malzemesi',
  'Beyaz eşya sabitleme ve taşıma aparatları',
  'Gerekiyorsa söküm ve yeniden montaj',
]

/**
 * Beş soru. Üçü konu olarak korundu, ikisi değişti:
 *
 *   YENİDEN KURULDU  "Parça eşya taşıma neden daha ucuz?"
 *        Sorunun kendisi doğrulanmamış bir varsayım taşıyordu. Artık iki
 *        model arasındaki farkı soruyor, birinin ucuzluğunu değil.
 *   ÇIKAN  "Söküm ve montaj yapıyor musunuz?"
 *        Cevabı yedi hizmetin herhangi birine aynen taşınabilirdi.
 *   GİREN  "Büyük bir parça kapıdan geçmiyorsa ne oluyor?"
 *        Tek parça taşımada gerçekten karar anındaki soru; söküm bilgisi
 *        de bu cevabın içinde kalıyor.
 */
const FAQS = [
  {
    question: 'Tek bir eşya için de geliyor musunuz?',
    answer:
      'Evet. Tek bir koltuk, buzdolabı ya da birkaç koli için sefer düzenleniyor. Ama tek parçada da erişim ayrı soruluyor: kat, asansör kabini ve aracın kapıya yaklaşabildiği mesafe plana giriyor.',
  },
  {
    question: 'Paylaşımlı taşıma ile özel araç arasında ne değişiyor?',
    answer:
      'Özel araçta araç yalnız sizin işinize planlanıyor, gün netleşiyor. Paylaşımlı taşımada aynı rotadaki başka yüklerle planlama yapılıyor; maliyet paylaşılıyor, karşılığında zamanlamanın esnek olması gerekebiliyor.',
  },
  {
    question: 'Eşyam başka yüklerle birlikte taşınırken zarar görür mü?',
    answer:
      'Her müşterinin eşyası ayrı ambalajlanıyor, araç içinde ayrı bölmede sabitleniyor ve etiketleniyor. Kırılabilir parçalar ayrıca işaretlenip üst sıraya yerleştiriliyor.',
  },
  {
    question: 'Kesin gün verebiliyor musunuz?',
    answer:
      'Paylaşımlı seferde tek gün değil gün aralığı veriliyor, çünkü sefer rotadaki diğer duraklara bağlı. Tarihiniz sabit olmak zorundaysa özel araç seçeneği öneriliyor.',
  },
  {
    question: 'Büyük bir parça kapıdan geçmiyorsa ne oluyor?',
    answer:
      'Kapıdan ya da sahanlıktan geçmeyen parça yerinde sökülüyor. Sökülemiyorsa ya da bina elverişli değilse tek parça için de dış cephe asansörü gündeme gelebiliyor; karar keşifte veriliyor.',
  },
]

/**
 * Eski açıklama ne yapıldığını sayıyordu ("tek mobilya ya da birkaç koli
 * için parsiyel sefer"); bu, sayfanın farkını söylüyor: az eşya kolay
 * taşıma demek değil.
 *
 * "İstanbul" gövdede BİR, açıklamada BİR kez geçiyor. Anahtar kelime
 * tekrarı yapılmadı ve semt adı doldurulmadı: sayfanın İstanbul'la ilgisi
 * kelimede değil, anlattığı koşullarda (dar sokak, park hattı, asansörsüz
 * üst kat, kısa duruş penceresi).
 */
const META_DESCRIPTION =
  'Az eşya kolay taşıma demek değil: tek parçada da kat, asansör kabini ve araç erişimi belirleyici. İstanbul’da özel araç ile paylaşımlı sefer arasındaki fark.'

/**
 * Görsele bakılarak yazıldı: açık kasa kapısından görünen araç içi —
 * solda kemerle bağlanmış battaniyeli mobilyalar, sağda oda adına göre
 * etiketlenmiş koli istifi. Reklam sıfatı yok, karede olmayan yok.
 */
const IMAGE_ALT = 'Araç içinde kemerle sabitlenmiş ambalajlı mobilyalar ve oda adına göre etiketlenmiş koliler'

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
  console.log('\nGeri almak için: node --env-file=.env scripts/parca-esya-icerik.mjs --geri')
}

await db.$disconnect()
