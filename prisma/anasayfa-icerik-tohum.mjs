// prisma/anasayfa-icerik-tohum.mjs
//
// ANA SAYFA V2 İÇERİĞİ → VERİ TABANI.
//
// ─────────────────────────────────────────────────────────────────────────
// YÖN: V2 → DB. TERSİ DEĞİL.
//
// Bu betiğin taşıdığı metinlerin tamamı BUGÜN CANLIDA olan V2 bileşen
// metinleri. Eski markanın veri tabanındaki V1 içeriği (HeroPage'in
// "Sigortalı, Şeffaf Fiyatlı…" başlığı, dokuz uzun SSS, beş V1 süreç
// adımı) public'e BAĞLANMIYOR — tam tersine, V2 metinleri onların üstüne
// yazılıyor ki yönetim paneli gerçekten canlı içeriği yönetsin.
//
// Sonuç: sayfa açıldığında görünen hiçbir şey değişmiyor; değişen tek şey
// metnin NEREDEN geldiği.
//
// ─────────────────────────────────────────────────────────────────────────
// YENİDEN ÇALIŞTIRILABİLİR (IDEMPOTENT)
//
//   · `HomeSection`  → sectionKey ile upsert; öğeler silinip yeniden yazılır
//   · `ProcessStep`  → `order` ile eşleştirilip GÜNCELLENİR (id korunur)
//   · `FaqItem`      → soru metniyle eşleştirilir; V2'de olmayan eski
//                      kayıtlar SİLİNMEZ, yalnız pasifleştirilir
//
// `--dogrula` ile çalıştırıldığında hiçbir şey yazmaz, ne yapacağını yazar.
import prisma from '../server/utils/prisma.ts'

const KURU = process.argv.includes('--dogrula')
const yaz = (s = '') => console.log(s)

// ═════════════════════════════════════════════════════════════════════════
// V2 İÇERİĞİ — bileşenlerden birebir alındı
// ═════════════════════════════════════════════════════════════════════════

const BOLUMLER = [
  {
    sectionKey: 'hero',
    heading: "İstanbul'da taşınmak, ölçülü bir iştir.",
    lead: 'Dar sokak, asansörsüz kat, dört katlı apartman. Şehri biliyoruz; taşımayı ona göre planlıyoruz.',
    ctaLabel: 'Taşınmayı konuşalım',
    note: 'Her adres, taşınmadan önce dört soruyla ölçülür.',
    // Satır sonu `\n`: bileşen satırlara bölüp `<br>` basıyor. HTML
    // saklanmıyor — panelden HTML girilmesi gereken hiçbir alan yok.
    closing: 'Aynı şehir.\nAynı taşıma değil.',
    closingNote:
      'Bir adreste işe yarayan yöntem, iki sokak ötede işe yaramayabilir. Fark şehirde değil; sokakta, binada ve katta.',
    imagePath: '/images/hero-istanbul.webp',
    imageAlt:
      "İstanbul'da dar bir sokakta, kamyonun yanında ambalajlanmış koltuğu apartman girişine taşıyan iki nakliyeci",
    items: [
      { label: 'ARAÇ ERİŞİMİ', body: 'Kamyon bina önüne yanaşabiliyor mu, yoksa yük sokaktan elden mi taşınacak?' },
      { label: 'BİNA GİRİŞİ', body: 'Kapı genişliği, merdiven sahanlığı ve asansör kabini ölçülür.' },
      { label: 'KAT', body: 'Kaçıncı kat ve asansör var mı; yoksa yöntem baştan değişir.' },
      { label: 'EŞYA HACMİ', body: 'Araç boyutunu ve ekip sayısını belirleyen asıl değişken.' },
    ],
  },

  {
    sectionKey: 'kapsam',
    heading: "İstanbul'un tamamında çalışıyoruz; tamamını aynı yer saymıyoruz.",
    note: 'Erişim, bina ve giriş koşulları ilçeden ilçeye değişiyor. Plan bu koşullara göre kuruluyor, ortalamaya göre değil.',
    items: [
      { label: 'Beşiktaş', body: 'Sokak dar; araç bina önüne yanaşamıyor, yük elden taşınıyor.' },
      { label: 'Kadıköy', body: "1970'ler apartmanı; asansör yok, merdiven iki kişilik değil." },
      { label: 'Başakşehir', body: 'Siteye kayıtlı giriş; yükleme saati ve araç boyu sınırlı.' },
    ],
  },

  {
    sectionKey: 'uc-istanbul',
    heading: 'Aynı iş, üç ayrı İstanbul koşulu.',
    lead: "Bir taşımayı zorlaştıran şey mesafe değil erişimdir. Aşağıdaki üç koşul İstanbul'da en sık karşılaştıklarımız; her biri planı başka bir yerinden değiştiriyor.",
    // İlk satır ("39 ilçe.") TÜRETİLİYOR — sayı bileşende ilçe sayımından
    // geliyor, burada saklanmıyor.
    closing: 'Tek yöntem yok.',
    closingNote:
      'Hangi koşulun geçerli olduğunu adres belirler; ilçe yalnız ipucu verir. Bu yüzden fiyat da yöntem de keşiften sonra netleşiyor.',
    ctaLabel: "İstanbul'da çalıştığımız bölgeler",
    items: [
      {
        label: 'DAR SOKAK',
        subLabel: 'Beşiktaş tipi',
        title: 'Taşıma mesafesi, iki adres arasındaki kilometre değildir.',
        body: 'Araç bina önüne yanaşamadığında yük, kamyonun durabildiği noktadan kapıya kadar elden taşınır. Bu mesafe on metre de olabilir yetmiş metre de; ekip sayısını ve süreyi doğrudan değiştirir. Keşifte ölçtüğümüz şey sokağın genişliği değil, aracın durabileceği en yakın nokta ile bina girişi arasındaki gerçek yürüme mesafesi.',
        imagePath: '/images/stage-a.webp',
        imageAlt: 'Dar bir sokakta kamyonun durduğu noktadan apartman girişine ambalajlı koltuk taşıyan iki nakliyeci',
      },
      {
        label: 'KAT',
        subLabel: 'Kadıköy tipi eski apartman',
        title: 'Kat değişir. Yöntem değişir.',
        body: 'Asansör kabini bir koltuğu almıyorsa eşya merdivenden çıkar. O zaman belirleyici olan kat sayısı değil, merdivenin dönüş sahanlığıdır: dar bir sahanlık üç katlı bir binayı beş katlıdan zor hâle getirir. Gardırop ve köşe takımı gibi parçalar bu noktada yerinde sökülür.',
        imagePath: '/images/sahne-kat.webp',
        imageAlt: 'Eski bir apartmanın dönüşlü mermer merdiveninde, streçle sarılmış kanepeyi iki kişi elde indiriyor',
      },
      {
        label: 'KONTROLLÜ ERİŞİM',
        subLabel: 'Başakşehir tipi site',
        title: 'Erişim önceden netleşir.',
        body: 'Sitelerde ve iş merkezlerinde araç kabul noktası, giriş saati ve yük asansörü tahsisi yönetimden önceden alınır. Randevusuz gelen araç kapıda bekler. Bu yüzden taşıma gününü değil, önce giriş iznini planlıyoruz.',
        imagePath: '/images/sahne-erisim.webp',
        imageAlt: 'Site girişinde kapalı bariyer ve güvenlik kulübesi; nakliye kamyonu araç kabul noktasında bekliyor',
      },
    ],
  },

  {
    sectionKey: 'hizmetler',
    // BAŞLIKTA SAYI YOK — BİLİNÇLİ.
    //
    // V2 metni "altı yetkinliği" diyordu ve altı satır bileşende sabitti;
    // sayı ile liste aynı dosyada olduğu için tutarlıydı. Defter artık
    // YAYINDAKİ hizmetleri listeliyor, yani satır sayısı veriyle
    // değişiyor: bir hizmet yayından kaldırıldığında liste küçülür ve
    // başlıktaki rakam sessizce yalan söylerdi.
    //
    // Üç yol vardı — sayıyı kelimeye çeviren bir katman yazmak (tek
    // kelime için bir dil katmanı), sayıyı ikinci kez saklamak (aynı
    // bilginin iki kaynağı), ya da başlığı sayıdan kurtarmak. Üçüncüsü
    // seçildi. "Farklı yetkinlikleri" ifadesi bölümün kendi gerekçesinden
    // geliyor (bkz. Hizmetler.vue: "Hizmetler ayrı ürün kartları değil,
    // aynı operasyonun farklı yetkinlikleri"), yani metin zayıflamıyor —
    // asıl söylemek istediği şeye dönüyor.
    heading: 'Aynı operasyonun farklı yetkinlikleri.',
    items: [],
  },

  {
    sectionKey: 'fiyat',
    heading: 'Fiyat tek rakamdan başlamaz.',
    lead: 'Telefonda verilen rakam bir tahmindir; keşifte ölçülen beş değişken onu gerçek fiyata çevirir. Aşağıdakiler, aynı büyüklükteki iki evin neden aynı tutmadığını açıklıyor.',
    items: [
      {
        label: 'EŞYA HACMİ',
        body: 'Oda sayısı değil, gerçek hacim. Aynı üç artı bir dairede bir evde iki kamyonluk eşya çıkar, diğerinde yarım kamyon. Hacim aracı, araç da ekip sayısını belirliyor.',
      },
      {
        label: 'ERİŞİM VE KAT',
        body: 'Aracın bina önüne yanaşıp yanaşamaması, asansör kabininin ölçüsü ve merdiven sahanlığı. Asansörsüz dördüncü kat, asansörlü onuncu kattan daha uzun sürüyor.',
      },
      {
        label: 'MESAFE',
        body: 'İki adres arasındaki yol kadar, aracın durabildiği nokta ile kapı arasındaki yürüme mesafesi de hesaba giriyor. İstanbul içinde ikincisi çoğu zaman daha belirleyici.',
      },
      {
        label: 'PAKETLEME',
        body: 'Cam, tablo, mermer ve beyaz eşya ayrı koruma istiyor. Paketlemenin ne kadarını ekibin yaptığı ve hangi malzemenin kullanıldığı fiyatın içinde ayrı bir kalem.',
      },
      {
        label: 'SÖKÜM VE KURULUM',
        body: 'Kapıdan geçmeyen gardırop, köşe takımı ve ranza yerinde sökülüp varışta kuruluyor. Marangoz gerektiren parça sayısı hem süreyi hem ekibi değiştiriyor.',
      },
    ],
  },

  {
    sectionKey: 'yorumlar',
    // M5 ile eklendi. Bu üç cümle bölümün TEK editoryal içeriği; yorumların
    // kendisi ziyaretçiden geliyor ve moderasyondan geçiyor.
    //
    // DOĞRULANMAMIŞ İDDİA YOK: "binlerce mutlu müşteri", "5 yıldızlı
    // hizmet", "%100 memnuniyet" gibi bir cümle bilerek yazılmadı. Sayfada
    // görünen tek sayı, onaylı kayıtlardan hesaplanan gerçek sayı.
    heading: 'Taşındıktan sonra yazılanlar.',
    lead: 'Yorumlar yayınlanmadan önce okunuyor. Buradaki her satır, taşınması bitmiş bir adresten geliyor.',
    note: 'Sizinki de burada olsun',
    items: [],
  },

  {
    sectionKey: 'kapanis',
    heading: 'Adresi biliyorsanız, geri kalanını birlikte çıkarabiliriz.',
    ctaLabel: 'Taşınmayı konuşalım',
    items: [],
  },
]

/** V2 Süreç bölümü — beş kare. */
const SUREC_BASLIK = 'Plan, operasyona böyle dönüşür.'
const SUREC_ADIMLARI = [
  {
    label: 'KEŞİF',
    title: 'Önce hareketi değil, koşulları çıkarırız.',
    description:
      'Eve gelip hacmi, katı, asansör kabinini ve aracın durabileceği noktayı yerinde ölçüyoruz. Ne taşınacağı kadar nereden çıkarılacağı da plana giriyor; ikisi ayrı sorular değil.',
    imagePath: '/images/stage-a.webp',
    imageAlt:
      "İstanbul'da dar bir sokakta kamyonun yanında bina girişine doğru ambalajlı koltuk taşıyan iki nakliyeci",
    linkLabel: null,
    linkHref: null,
  },
  {
    label: 'PAKETLEME',
    title: 'Her eşya aynı şekilde paketlenmez.',
    description:
      'Ahşap yüzey battaniyeye, cam ve tablo sert köşe korumasına, beyaz eşya streç ve bantla sabitlemeye gidiyor. Hangi parçanın hangi malzemeyle sarılacağı keşifte belirleniyor; taşıma günü seçilmiyor.',
    imagePath: '/images/sahne-paketleme.webp',
    imageAlt: 'Bir tablonun köşesine karton köşe koruması takılıyor; yanında balonlu naylon ve streç film rulosu',
    linkLabel: 'Hizmet kapsamımız',
    linkHref: '/hizmetlerimiz',
  },
  {
    label: 'SÖKÜM VE YÜKLEME',
    title: 'Taşıma sırası kapıda başlamaz.',
    description:
      'Kapıdan geçmeyen gardırop ve köşe takımı yerinde sökülüyor. Yükleme sırası çıkış adresine göre değil varış adresine göre kuruluyor: en son yüklenen parça, yeni evde ilk inmesi gereken parça oluyor.',
    imagePath: '/images/sahne-sokum.webp',
    imageAlt: 'Odada gardırop yerinde sökülüyor: bir kişi menteşeyi çıkarıyor, diğeri sökülen paneli battaniyeye taşıyor',
    linkLabel: null,
    linkHref: null,
  },
  {
    label: 'KAMYON',
    title: 'İyi taşıma, kamyonun içinde belli olur.',
    description:
      'Kemer, battaniye ve köşe koruması yükleme başlamadan seçiliyor. İstif sırası varışta eşyanın hangi sırayla ineceğine göre kuruluyor; sabitleme yolda kaymayı değil, kapıda beklemeyi de önlüyor.',
    imagePath: '/images/bleed-sabitleme.webp',
    imageAlt: 'Kamyon kasasında battaniye ve streçle sarılmış koltuğu sabitleme kemeriyle bağlayan nakliyeci',
    linkLabel: null,
    linkHref: null,
  },
  {
    label: 'YERLEŞİM',
    title: 'Taşınma günü karar günü değil, uygulama günüdür.',
    description:
      'Eşya etiketine göre odasına giriyor, sökülen mobilya marangozla kuruluyor, ambalaj aynı gün toplanıyor. O sabah verilecek karar kalmıyor; verilmiş kararlar uygulanıyor.',
    imagePath: '/images/stage-b.webp',
    imageAlt: 'Aynı ekip, ambalajlı koltuğu yeni evin parke zeminli salonuna yerleştiriyor',
    linkLabel: null,
    linkHref: null,
  },
]

/** V2 Sorular bölümü — altı soru. */
const SSS_BASLIK = 'Taşınmadan önce sorulanlar.'
const SSS = [
  {
    question: 'Keşif şart mı, telefonda fiyat verilemiyor mu?',
    answer:
      'Fiyatı belirleyen şeylerin çoğu telefonda görünmüyor: eşya hacmi, iki adresin katı, asansör durumu ve sokağın aracı alıp almadığı. Keşif bu yüzden yerinde yapılıyor.',
  },
  {
    question: 'Fiyat neye göre değişiyor?',
    answer:
      'Eşya hacmi, iki adresteki kat ve asansör durumu, aracın binaya yanaşıp yanaşamaması, paketleme ihtiyacı ve iki adres arasındaki güzergâh birlikte hesaplanıyor.',
  },
  {
    question: 'Binada asansör yoksa ne oluyor?',
    answer:
      'Yöntem keşifte belirleniyor: merdivenle taşıma, dış cephe asansörü ya da ikisinin birlikte kullanımı. Hangisinin gerekeceği fiyata keşif sırasında yansıyor.',
  },
  {
    question: 'Paketlemeyi kim yapıyor?',
    answer:
      'Ambalajlama ekibin işi. Cam, tablo ve mermer gibi parçalar için ayrı koruma kullanılıyor; hangi parçanın nasıl sarılacağı keşifte belirleniyor.',
  },
  {
    question: 'Taşıma ne kadar sürüyor?',
    answer:
      'Süreyi belirleyen şey mesafe değil, iki adresteki erişim: kat, asansör ve aracın yanaşabileceği nokta. Planlanan gün ve saat aralığı keşiften sonra yazılı veriliyor.',
  },
  {
    question: 'Eşyalar sigortalı mı?',
    answer:
      'Taşıma nakliyat sigortası kapsamında yapılıyor. Kapsam, keşifte beyan edilen eşyaların değerine göre belirleniyor; antika, elektronik ve sanat eseri gibi parçaların ayrıca belirtilmesi bu yüzden önemli.',
  },
]

// ═════════════════════════════════════════════════════════════════════════

async function bolumleriYaz() {
  yaz('── ANA SAYFA BÖLÜMLERİ ──')
  for (const b of BOLUMLER) {
    const mevcut = await prisma.homeSection.findUnique({
      where: { sectionKey: b.sectionKey },
      include: { items: true },
    })
    const durum = mevcut ? 'güncellenecek' : 'oluşturulacak'
    yaz(`  ${b.sectionKey.padEnd(12)} ${durum.padEnd(14)} ${b.items.length} öğe`)
    if (KURU) continue

    const { sectionKey, items, ...govde } = b
    const kayit = await prisma.homeSection.upsert({
      where: { sectionKey },
      create: { sectionKey, ...govde },
      update: govde,
    })
    await prisma.homeSectionItem.deleteMany({ where: { sectionId: kayit.id } })
    if (items.length) {
      await prisma.homeSectionItem.createMany({
        data: items.map((o, i) => ({ ...o, order: i, sectionId: kayit.id })),
      })
    }
  }
}

async function sureciYaz() {
  yaz('\n── SÜREÇ ──')
  const bolum = await prisma.processSection.findFirst({
    include: { steps: { orderBy: { order: 'asc' } } },
  })
  if (!bolum) {
    yaz('  ProcessSection kaydı YOK — atlanıyor. (`npm run seed` ile oluşturulur.)')
    return
  }

  yaz(`  başlık: "${bolum.mainTitle}" → "${SUREC_BASLIK}"`)
  yaz(`  adım: mevcut ${bolum.steps.length} → hedef ${SUREC_ADIMLARI.length}`)
  if (KURU) {
    for (const [i, a] of SUREC_ADIMLARI.entries()) {
      const eski = bolum.steps.find((s) => s.order === i)
      yaz(`    ${String(i).padStart(2)} ${eski ? `#${eski.id} güncellenecek` : 'oluşturulacak'} — ${a.label}`)
    }
    return
  }

  await prisma.processSection.update({
    where: { id: bolum.id },
    data: { mainTitle: SUREC_BASLIK },
  })

  for (const [i, a] of SUREC_ADIMLARI.entries()) {
    const eski = bolum.steps.find((s) => s.order === i)
    const veri = {
      label: a.label,
      title: a.title,
      description: a.description,
      imagePath: a.imagePath,
      imageAlt: a.imageAlt,
      linkLabel: a.linkLabel,
      linkHref: a.linkHref,
      order: i,
    }
    // ID KORUNUYOR: silip yeniden yaratmak yerine yerinde güncelleme.
    if (eski) await prisma.processStep.update({ where: { id: eski.id }, data: veri })
    else await prisma.processStep.create({ data: { ...veri, processSectionId: bolum.id } })
  }

  const fazla = bolum.steps.filter((s) => s.order >= SUREC_ADIMLARI.length)
  if (fazla.length) {
    await prisma.processStep.deleteMany({ where: { id: { in: fazla.map((s) => s.id) } } })
    yaz(`  ${fazla.length} fazla adım silindi`)
  }
}

async function sorulariYaz() {
  yaz('\n── SORULAR ──')
  const bolum = await prisma.faqSection.findFirst({
    include: { faqs: { orderBy: { order: 'asc' } } },
  })
  if (!bolum) {
    yaz('  FaqSection kaydı YOK — atlanıyor.')
    return
  }

  const v2Sorular = new Set(SSS.map((s) => s.question))
  const eskiler = bolum.faqs.filter((f) => !v2Sorular.has(f.question))

  yaz(`  başlık: "${bolum.mainTitle}" → "${SSS_BASLIK}"`)
  yaz(`  V2 sorusu: ${SSS.length} · eski kayıt: ${eskiler.length} (PASİFLEŞTİRİLECEK, silinmeyecek)`)
  if (KURU) return

  await prisma.faqSection.update({ where: { id: bolum.id }, data: { mainTitle: SSS_BASLIK } })

  for (const [i, s] of SSS.entries()) {
    const eski = bolum.faqs.find((f) => f.question === s.question)
    if (eski) {
      await prisma.faqItem.update({
        where: { id: eski.id },
        data: { answer: s.answer, order: i, isActive: true },
      })
    } else {
      await prisma.faqItem.create({
        data: { question: s.question, answer: s.answer, order: i, isActive: true, faqSectionId: bolum.id },
      })
    }
  }

  // ESKİ KAYITLAR SİLİNMİYOR. Eski markanın dokuz uzun sorusu panelde
  // duruyor ama pasif; ana sayfa yalnız aktif olanları okuyor. Silmek geri
  // alınamaz bir karar olurdu ve bu turun işi değil.
  for (const [i, f] of eskiler.entries()) {
    await prisma.faqItem.update({
      where: { id: f.id },
      // Sıra 100'den başlıyor: panelde aktif altı sorunun ARKASINA
      // düşsünler, araya karışmasınlar.
      data: { isActive: false, order: 100 + i },
    })
  }
}

try {
  yaz(KURU ? 'DOĞRULAMA — hiçbir şey yazılmayacak\n' : 'ANA SAYFA İÇERİĞİ YAZILIYOR\n')
  await bolumleriYaz()
  await sureciYaz()
  await sorulariYaz()
  yaz(KURU ? '\nDoğrulama bitti.' : '\nTamam.')
} finally {
  await prisma.$disconnect()
}
