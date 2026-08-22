// prisma/ilce-metinleri-tohum.mjs
//
//     npm run ilce-metinleri
//
// 39 İSTANBUL İLÇESİNİN İÇERİK/İDDİA TEMİZLİĞİ.
//
// ─────────────────────────────────────────────────────────────────────────
// KAPSAM: YALNIZ 39 İSTANBUL İLÇESİ
//
// Veri tabanında 375 bölge kaydı var; 335'i İstanbul dışı (il sayfaları,
// Ankara/İzmir ilçeleri). Bu betik onlara DOKUNMUYOR. Hedef listesi
// shared/utils/istanbul.ts'teki yaka eşlemesinden geliyor — ikinci bir
// slug listesi tutulmuyor.
//
// ─────────────────────────────────────────────────────────────────────────
// NE TEMİZLENİYOR
//
//   metaDescription (39/39)
//     Hepsi aynı kalıptaydı: "{İlçe} evden eve nakliyat: {ilçeye özgü
//     operasyonel cümle}. {İDDİA}." İlk yarı GERÇEKTEN ilçeye özgü ve
//     korunuyor; yalnız kapanış cümlesi değişiyor. Ölçüldü: 35'inde
//     "ücretsiz", 6'sında "yazılı sabit fiyat", 3'ünde "aynı gün ücretsiz
//     keşif" vardı.
//
//     Yeni kapanışlar sinonim döndürmesi DEĞİL: her biri o ilçenin kendi
//     koşulundan (araç erişimi, kat, site izni, güzergâh süresi) türüyor.
//
//   faqs (6 kayıt)
//     "ücretsiz keşif sonrasında", "Keşif ücretsiz.", "telefonda kesin
//     fiyat vermiyoruz" ifadeleri. İki soru da yeniden yazıldı ("keşif
//     ücretli mi?" sorusunun cevabı artık ücretten söz etmiyor).
//
//   imageAlt (7 kayıt)
//     "Beşiktaş sokaklarında…", "Nakliyat aracımız Kadıköy sokaklarında"
//     gibi metinler fotoğrafın O İLÇEDE çekildiğini söylüyordu; elimizde
//     bunu doğrulayan bir kayıt yok. Betimleme korunuyor, konum iddiası
//     kaldırılıyor. (Kalan 23 alt metni zaten konum söylemiyor.)
//
// ─────────────────────────────────────────────────────────────────────────
// KORUNANLAR — BİLİNÇLİ
//
//   priceFactors → "Kısa mesafe; iş aynı gün bitiyor" (9 ilçe)
//     Bu bir TESLİM SÖZÜ değil, faktör tablosunun "fiyatı düşüren" sütunu:
//     karşısında "Uzak güzergâh; taşıma iki güne yayılıyor" yazıyor.
//
//   faqs → "aynı gün biter mi?" cevapları (5 ilçe)
//     Cevaplar zaten garanti VERMİYOR: "çoğunlukla", "büyük kısmı",
//     "gerçekçi süreyi keşifte söylüyoruz". Kaldırmak içeriği fakirleştirir.
//
//   "sigortalı taşıma / sigortalı ambalaj"
//     Yasak olan "%100 sigorta" iddiası; sigorta kapsamının varlığı gerçek
//     ve SSS'te doğru çerçeveleniyor ("sorumluluğumuz yazılı sözleşmede
//     tanımlı"). Yine de yeni metaDescription kapanışlarında yer almıyor:
//     kapanış artık operasyonu anlatıyor, hizmet listesi saymıyor.
//
// ─────────────────────────────────────────────────────────────────────────
// YÖNTEM
//
// Alan yalnız BİLİNEN eski değerin aynısıysa değişir. Panelden sonradan
// elle yazılmış metin ezilmez; betik tekrar çalıştırılabilir (idempotent).
// Metin içi değişikliklerde (SSS cevapları) aynı güvence alt dize
// düzeyinde: aranan ifade yoksa o kayıt atlanır.
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { istanbulYakalari } from '../shared/utils/istanbul.ts'
import { PrismaClient } from './generated/client/client.ts'

const p = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

/** Hedef kapsam — shared eşlemesinden, ikinci liste tutulmuyor. */
const ILCE_SLUGLARI = istanbulYakalari.flatMap((y) => y.sluglar)

// ---------------------------------------------------------------------------
// 1) metaDescription — 39 kayıt
// ---------------------------------------------------------------------------
const META = {
  adalar: {
    eskisi:
      'Adalar evden eve nakliyat: vapur saatine göre planlanan taşıma, sigortalı ambalaj ve marangozlu montaj. Ücretsiz keşif için hemen arayın.',
    yenisi:
      'Adalar evden eve nakliyat: taşıma vapur saatine göre planlanıyor. İskelede aktarma ve motorlu araç kısıtı keşifte hesaba katılıyor.',
  },
  arnavutkoy: {
    eskisi:
      'Arnavutköy evden eve nakliyat: havalimanı çevresi ve köy adreslerine kapıdan kapıya taşıma, sigortalı ambalaj. Ücretsiz keşif, yazılı teklif.',
    yenisi:
      'Arnavutköy evden eve nakliyat: havalimanı çevresi ve köy adreslerine kapıdan kapıya taşıma. Araç erişimi ve yol durumu önceden ölçülüyor.',
  },
  atasehir: {
    eskisi:
      'Ataşehir evden eve nakliyat: site yönetimi izni ve yük asansörü randevusu bizden. Sigortalı taşıma, marangozlu montaj. Ücretsiz keşif alın.',
    yenisi:
      'Ataşehir evden eve nakliyat: site yönetimi izni ve yük asansörü randevusu önceden alınıyor. Giriş saati plana baştan yazılıyor.',
  },
  avcilar: {
    eskisi:
      'Avcılar evden eve nakliyat: öğrenci ve tek oda taşımalarına uygun parça eşya seçeneği, sigortalı ambalaj. Aynı gün ücretsiz keşif ve teklif.',
    yenisi:
      'Avcılar evden eve nakliyat: öğrenci ve tek oda taşımalarına uygun parça eşya seçeneği. Kat ve asansör durumu keşifte belirleniyor.',
  },
  bagcilar: {
    eskisi:
      'Bağcılar evden eve nakliyat ve işyeri taşıma: atölye, ofis ve konut için ayrı ekip. Sigortalı taşıma, yazılı sabit fiyat. Hemen teklif alın.',
    yenisi:
      'Bağcılar evden eve nakliyat ve işyeri taşıma: atölye, ofis ve konut için ayrı ekip. İşyeri taşımaları mesai dışına planlanıyor.',
  },
  bahcelievler: {
    eskisi:
      'Bahçelievler evden eve nakliyat: dar sokaklarda park izni ve dış cephe asansörü çözümü. Sigortalı ambalaj, marangozlu montaj. Ücretsiz keşif.',
    yenisi:
      'Bahçelievler evden eve nakliyat: dar sokaklarda park izni ve dış cephe asansörü çözümü. Araç yanaşma noktası keşifte belirleniyor.',
  },
  bakirkoy: {
    eskisi:
      'Bakırköy evden eve nakliyat: E-5 trafiğine göre planlanan saat, asansörlü taşıma ve sigortalı ambalaj. Ücretsiz keşif ve yazılı sabit fiyat.',
    yenisi:
      'Bakırköy evden eve nakliyat: E-5 trafiğine göre planlanan saat, asansörlü taşıma. Merkezdeki eski binalarda dış cephe asansörü kuruluyor.',
  },
  basaksehir: {
    eskisi:
      'Başakşehir evden eve nakliyat: toplu konut kurallarına uygun taşıma, yük asansörü randevusu ve sigortalı ambalaj. Ücretsiz keşif için arayın.',
    yenisi:
      'Başakşehir evden eve nakliyat: toplu konut kurallarına uygun taşıma ve yük asansörü randevusu. Yönetimin verdiği saat aralığı plana giriyor.',
  },
  bayrampasa: {
    eskisi:
      'Bayrampaşa evden eve nakliyat ve işyeri taşıma: hal ve atölye bölgesinde saat planlaması, sigortalı taşıma. Yazılı sabit fiyat için arayın.',
    yenisi:
      'Bayrampaşa evden eve nakliyat ve işyeri taşıma: hal ve atölye bölgesinde saat planlaması. Raf ve soğutma ekipmanı ayrı ele alınıyor.',
  },
  besiktas: {
    eskisi:
      'Beşiktaş evden eve nakliyat: yokuşlu dar sokaklarda dış cephe asansörü, rezidanslarda yük asansörü. Sigortalı taşıma ve ücretsiz keşif.',
    yenisi:
      'Beşiktaş evden eve nakliyat: yokuşlu dar sokaklarda dış cephe asansörü, rezidanslarda yük asansörü. Araç konumu keşifte belirleniyor.',
  },
  beykoz: {
    eskisi:
      'Beykoz evden eve nakliyat: orman içi yollar ve yalı adresleri için uygun araç seçimi, sigortalı ambalaj. Ücretsiz keşif ve yazılı teklif.',
    yenisi:
      'Beykoz evden eve nakliyat: orman içi yollar ve yalı adresleri için uygun araç seçimi. Yol genişliği ve eğim keşifte ölçülüyor.',
  },
  beylikduzu: {
    eskisi:
      'Beylikdüzü evden eve nakliyat: site içi taşıma izni ve yük asansörü randevusu bizden. Sigortalı ambalaj, marangozlu montaj. Ücretsiz keşif.',
    yenisi:
      'Beylikdüzü evden eve nakliyat: site içi taşıma izni ve yük asansörü randevusu önceden alınıyor. Varış adresinin uzaklığı süreyi belirliyor.',
  },
  beyoglu: {
    eskisi:
      'Beyoğlu evden eve nakliyat: tarihi binalarda dış cephe asansörü ve dar merdiven çözümü. Sigortalı ambalaj, deneyimli ekip. Ücretsiz keşif.',
    yenisi:
      'Beyoğlu evden eve nakliyat: tarihi binalarda dış cephe asansörü ve dar merdiven çözümü. Sokak araç kısıtı keşifte hesaba katılıyor.',
  },
  buyukcekmece: {
    eskisi:
      'Büyükçekmece evden eve nakliyat: yazlık ve site adreslerine kapıdan kapıya taşıma, sigortalı ambalaj. Eşya depolama seçeneğiyle ücretsiz keşif.',
    yenisi:
      'Büyükçekmece evden eve nakliyat: yazlık ve site adreslerine kapıdan kapıya taşıma. Çıkış ve giriş tarihleri arasında depolama seçeneği var.',
  },
  catalca: {
    eskisi:
      'Çatalca evden eve nakliyat: köy ve tarım adreslerine kapıdan kapıya taşıma, sigortalı ambalaj. Ücretsiz keşif ve yazılı sabit fiyat teklifi.',
    yenisi:
      'Çatalca evden eve nakliyat: köy ve tarım adreslerine kapıdan kapıya taşıma. Yol durumu ve araç tipi güzergâha göre belirleniyor.',
  },
  cekmekoy: {
    eskisi:
      'Çekmeköy evden eve nakliyat: villa ve müstakil ev taşımaları için büyük hacimli araç, marangozlu montaj. Sigortalı taşıma, ücretsiz keşif.',
    yenisi:
      'Çekmeköy evden eve nakliyat: villa ve müstakil ev taşımaları için büyük hacimli araç, marangozlu montaj. Bahçe ve depo eşyası ayrı listeleniyor.',
  },
  esenler: {
    eskisi:
      'Esenler evden eve nakliyat: otogar çevresi trafiğine göre saat planlaması, dar sokakta asansörlü taşıma. Sigortalı ambalaj ve ücretsiz keşif.',
    yenisi:
      'Esenler evden eve nakliyat: otogar çevresi trafiğine göre saat planlaması, dar sokakta asansörlü taşıma. Kat durumu süreyi belirliyor.',
  },
  esenyurt: {
    eskisi:
      'Esenyurt evden eve nakliyat: her sitenin taşıma kuralı farklı, izin ve asansör randevusunu biz alıyoruz. Sigortalı taşıma, ücretsiz keşif.',
    yenisi:
      'Esenyurt evden eve nakliyat: her sitenin taşıma kuralı farklı; izin ve asansör randevusunu biz alıyoruz. Giriş saati plana baştan yazılıyor.',
  },
  eyupsultan: {
    eskisi:
      'Eyüpsultan evden eve nakliyat: tarihi merkez, Haliç kıyısı ve Göktürk villalarına uygun ekip. Sigortalı ambalaj, marangozlu montaj, keşif ücretsiz.',
    yenisi:
      'Eyüpsultan evden eve nakliyat: tarihi merkez, Haliç kıyısı ve Göktürk villalarına uygun ekip. Adres tipine göre araç ve ekip değişiyor.',
  },
  fatih: {
    eskisi:
      'Fatih evden eve nakliyat: tarihi yarımadadaki araç kısıtı ve dar sokaklar için dış cephe asansörü. Sigortalı taşıma ve ücretsiz keşif.',
    yenisi:
      'Fatih evden eve nakliyat: tarihi yarımadadaki araç kısıtı ve dar sokaklar için dış cephe asansörü. Park izni önceden ayarlanıyor.',
  },
  gaziosmanpasa: {
    eskisi:
      'Gaziosmanpaşa evden eve nakliyat: yoğun apartman dokusunda asansörlü taşıma, sigortalı ambalaj ve marangozlu montaj. Ücretsiz keşif için arayın.',
    yenisi:
      'Gaziosmanpaşa evden eve nakliyat: yoğun apartman dokusunda asansörlü taşıma ve marangozlu montaj. Araç yanaşma noktası keşifte belirleniyor.',
  },
  gungoren: {
    eskisi:
      'Güngören evden eve nakliyat: sıkışık yapıda park izni ve dış cephe asansörü çözümü, sigortalı ambalaj. Aynı gün ücretsiz keşif ve teklif.',
    yenisi:
      'Güngören evden eve nakliyat: sıkışık yapıda park izni ve dış cephe asansörü çözümü. Sokak genişliği ve kat durumu keşifte ölçülüyor.',
  },
  kadikoy: {
    eskisi:
      "Kadıköy evden eve nakliyat: Moda'nın dar sokakları ve asansörsüz eski apartmanlar için dış cephe asansörü. Sigortalı taşıma, ücretsiz keşif.",
    yenisi:
      "Kadıköy evden eve nakliyat: Moda'nın dar sokakları ve asansörsüz eski apartmanlar için dış cephe asansörü. Park yeri önceden ayarlanıyor.",
  },
  kagithane: {
    eskisi:
      'Kağıthane evden eve nakliyat: dar sokaklarda park izni, ofis kulelerinde yük asansörü randevusu. Sigortalı taşıma ve ücretsiz keşif hizmeti.',
    yenisi:
      'Kağıthane evden eve nakliyat: dar sokaklarda park izni, ofis kulelerinde yük asansörü randevusu. İşyeri taşımaları mesai dışına planlanıyor.',
  },
  kartal: {
    eskisi:
      'Kartal evden eve nakliyat: E-5 ve sahil yolu trafiğine göre planlanan saat, asansörlü taşıma. Sigortalı ambalaj, yazılı sabit fiyat teklifi.',
    yenisi:
      'Kartal evden eve nakliyat: E-5 ve sahil yolu trafiğine göre planlanan saat, asansörlü taşıma. Kat ve asansör durumu keşifte ölçülüyor.',
  },
  kucukcekmece: {
    eskisi:
      "Küçükçekmece evden eve nakliyat: Halkalı ve Sefaköy'ün yoğun dokusunda asansörlü taşıma, sigortalı ambalaj. Ücretsiz keşif, yazılı teklif.",
    yenisi:
      "Küçükçekmece evden eve nakliyat: Halkalı ve Sefaköy'ün yoğun dokusunda asansörlü taşıma. Araç erişimi ve kat durumu keşifte belirleniyor.",
  },
  maltepe: {
    eskisi:
      'Maltepe evden eve nakliyat: üst mahallelerdeki asansörsüz binalarda dış cephe asansörü. Sigortalı ambalaj ve marangozlu montaj, keşif ücretsiz.',
    yenisi:
      'Maltepe evden eve nakliyat: üst mahallelerdeki asansörsüz binalarda dış cephe asansörü. Yol eğimi ve araç konumu keşifte hesaplanıyor.',
  },
  pendik: {
    eskisi:
      "Pendik evden eve nakliyat: sahilden Kurtköy'e ilçe içi mesafeye göre planlama, asansörlü taşıma. Sigortalı ambalaj ve ücretsiz keşif hizmeti.",
    yenisi:
      "Pendik evden eve nakliyat: sahilden Kurtköy'e ilçe içi mesafeye göre planlama, asansörlü taşıma. Yol süresi plana baştan yazılıyor.",
  },
  sancaktepe: {
    eskisi:
      'Sancaktepe evden eve nakliyat: geniş yollarda hızlı yükleme, yeni bloklarda yük asansörü. Sigortalı taşıma, marangozlu montaj, ücretsiz keşif.',
    yenisi:
      'Sancaktepe evden eve nakliyat: geniş yollarda hızlı yükleme, yeni bloklarda yük asansörü. Marangozlu söküm ve montaj aynı ekipte.',
  },
  sariyer: {
    eskisi:
      'Sarıyer evden eve nakliyat: boğaz sırtlarındaki dik ve dar yollara uygun araç, dış cephe asansörü. Sigortalı taşıma ve ücretsiz keşif.',
    yenisi:
      'Sarıyer evden eve nakliyat: boğaz sırtlarındaki dik ve dar yollara uygun araç, dış cephe asansörü. Araç tipi adrese göre seçiliyor.',
  },
  sile: {
    eskisi:
      'Şile evden eve nakliyat: merkeze uzak ve yazlık adreslere kapıdan kapıya taşıma, sigortalı ambalaj. Eşya depolama seçeneğiyle ücretsiz keşif.',
    yenisi:
      'Şile evden eve nakliyat: merkeze uzak ve yazlık adreslere kapıdan kapıya taşıma. Çıkış ve giriş tarihleri arasında depolama seçeneği var.',
  },
  silivri: {
    eskisi:
      "Silivri evden eve nakliyat: İstanbul'un batı ucuna tam gün planlanan taşıma, sigortalı ambalaj ve marangozlu montaj. Ücretsiz keşif için arayın.",
    yenisi:
      "Silivri evden eve nakliyat: İstanbul'un batı ucuna tam gün planlanan taşıma, marangozlu montaj. Güzergâh süresi plana baştan giriyor.",
  },
  sisli: {
    eskisi:
      "Şişli evden eve nakliyat: rezidanslarda yük asansörü, Kurtuluş'un asansörsüz binalarında dış cephe asansörü. Sigortalı taşıma, ücretsiz keşif.",
    yenisi:
      "Şişli evden eve nakliyat: rezidanslarda yük asansörü, Kurtuluş'un asansörsüz binalarında dış cephe asansörü. Park yeri önceden ayarlanıyor.",
  },
  sultanbeyli: {
    eskisi:
      'Sultanbeyli evden eve nakliyat: dar ara sokaklarda park izni ve asansörlü taşıma, sigortalı ambalaj. Aynı gün ücretsiz keşif ve yazılı teklif.',
    yenisi:
      'Sultanbeyli evden eve nakliyat: dar ara sokaklarda park izni ve asansörlü taşıma. Kat ve asansör durumu süreyi belirliyor.',
  },
  sultangazi: {
    eskisi:
      'Sultangazi evden eve nakliyat: eğimli sokaklarda güvenli araç konumlandırma ve dış cephe asansörü. Sigortalı taşıma, ücretsiz keşif hizmeti.',
    yenisi:
      'Sultangazi evden eve nakliyat: eğimli sokaklarda güvenli araç konumlandırma ve dış cephe asansörü. Yükleme noktası keşifte belirleniyor.',
  },
  tuzla: {
    eskisi:
      'Tuzla evden eve nakliyat ve işyeri taşıma: sanayi bölgesinde ağır araç saatlerine göre planlama. Sigortalı taşıma, yazılı sabit fiyat teklifi.',
    yenisi:
      'Tuzla evden eve nakliyat ve işyeri taşıma: sanayi bölgesinde ağır araç saatlerine göre planlama. İşyeri taşımaları vardiya dışına alınıyor.',
  },
  umraniye: {
    eskisi:
      'Ümraniye evden eve nakliyat: yeni sitelerde yük asansörü, eski dar sokaklarda dış cephe asansörü. Sigortalı ambalaj ve ücretsiz keşif.',
    yenisi:
      'Ümraniye evden eve nakliyat: yeni sitelerde yük asansörü, eski dar sokaklarda dış cephe asansörü. Yönetim izni önceden alınıyor.',
  },
  uskudar: {
    eskisi:
      'Üsküdar evden eve nakliyat: yokuşlu dar sokaklar ve sit alanındaki eski yapılar için dış cephe asansörü. Sigortalı taşıma, ücretsiz keşif.',
    yenisi:
      'Üsküdar evden eve nakliyat: yokuşlu dar sokaklar ve sit alanındaki eski yapılar için dış cephe asansörü. Araç konumu keşifte belirleniyor.',
  },
  zeytinburnu: {
    eskisi:
      'Zeytinburnu evden eve nakliyat: sahildeki yeni bloklarda yük asansörü, içerideki eski dokuda dış cephe asansörü. Sigortalı taşıma, keşif ücretsiz.',
    yenisi:
      'Zeytinburnu evden eve nakliyat: sahildeki yeni bloklarda yük asansörü, içerideki eski dokuda dış cephe asansörü. Kat durumu keşifte ölçülüyor.',
  },
}

// ---------------------------------------------------------------------------
// 2) SSS — cevap içi ifade devri (tüm 39 kayıtta aranıyor, 6'sında bulunuyor)
// ---------------------------------------------------------------------------
const SSS_IFADE = [
  ['ücretsiz keşif sonrasında yazılı veriliyor', 'keşiften sonra yazılı veriliyor'],
  ['telefonda kesin fiyat vermiyoruz', 'telefonda rakam vermiyoruz'],
  ['Keşif ücretsiz. ', ''],
]

/** Cevabı ücretten söz etmeyen hâle gelen iki sorunun yeni metni. */
const SSS_SORU = {
  gungoren: {
    eskisi: 'Güngören evden eve nakliyat için keşif ücretli mi?',
    yenisi: 'Güngören evden eve nakliyat teklifi nasıl veriliyor?',
  },
  pendik: {
    eskisi: 'Pendik evden eve nakliyat için keşif ücretli mi?',
    yenisi: 'Pendik evden eve nakliyat teklifi nasıl veriliyor?',
  },
}

// ---------------------------------------------------------------------------
// 3) imageAlt — konum iddiası kaldırılıyor (7 kayıt)
// ---------------------------------------------------------------------------
const ALT = {
  besiktas: {
    eskisi: 'Beşiktaş sokaklarında eşyalar taşınırken',
    yenisi: 'Şehir içi bir sokakta eşyalar taşınırken',
  },
  catalca: {
    eskisi: 'Çatalca köylerine ekip arkadaşlarımız eşya taşırken',
    yenisi: 'Köy yolunda ekip arkadaşlarımız eşya taşırken',
  },
  fatih: {
    eskisi: 'Fatih sokaklarında nakliyeciler dolap taşıyorken',
    yenisi: 'Bir sokakta nakliyeciler dolap taşıyorken',
  },
  kadikoy: {
    eskisi: 'Nakliyat aracımız Kadıköy sokaklarında',
    yenisi: 'Nakliyat aracımız şehir içi bir sokakta',
  },
  kartal: {
    eskisi: 'Kartal caddelerinde çalışma arkadaşlarımız nakliyat gerçekleştirirken',
    yenisi: 'Cadde üzerinde çalışma arkadaşlarımız nakliyat gerçekleştirirken',
  },
  maltepe: {
    eskisi: 'Maltepe sokaklarında nakliyeciler dolap taşıyorken',
    yenisi: 'Bir sokakta nakliyeciler dolap taşıyorken',
  },
  sile: {
    eskisi: 'Nakliyat aracımız Şile yollarında giderken',
    yenisi: 'Nakliyat aracımız yolda giderken',
  },
}

// ---------------------------------------------------------------------------

const dizi = (v) => {
  try {
    const x = typeof v === 'string' ? JSON.parse(v) : v
    return Array.isArray(x) ? x : []
  } catch {
    return []
  }
}

const sayac = { devredildi: 0, guncel: 0, atlandi: 0, kayit: 0 }

/** Tam eşleşme devri: yalnız bilinen eski değer duruyorsa yazar. */
const tamDevir = (kayit, alan, tanim, veri) => {
  if (!tanim) return
  const mevcut = String(kayit[alan] ?? '').trim()
  if (mevcut === tanim.yenisi) {
    console.log(`  güncel      ${kayit.slug}.${alan}`)
    sayac.guncel++
    return
  }
  if (mevcut !== tanim.eskisi) {
    console.log(`  atlandı     ${kayit.slug}.${alan}  (elle değiştirilmiş)`)
    sayac.atlandi++
    return
  }
  veri[alan] = tanim.yenisi
  console.log(`  devredildi  ${kayit.slug}.${alan}`)
  sayac.devredildi++
}

for (const slug of ILCE_SLUGLARI) {
  const kayit = await p.region.findFirst({ where: { slug } })
  if (!kayit) {
    console.log(`  bulunamadı  ${slug}`)
    continue
  }

  const veri = {}
  tamDevir(kayit, 'metaDescription', META[slug], veri)
  tamDevir(kayit, 'imageAlt', ALT[slug], veri)

  // --- SSS ---------------------------------------------------------------
  const liste = dizi(kayit.faqs).map((f) => ({ ...f }))
  let sssDegisti = false

  for (const f of liste) {
    const oncekiCevap = String(f.answer ?? '')
    let cevap = oncekiCevap
    for (const [eskisi, yenisi] of SSS_IFADE) {
      if (cevap.includes(eskisi)) cevap = cevap.split(eskisi).join(yenisi)
    }
    if (cevap !== oncekiCevap) {
      f.answer = cevap.trim()
      sssDegisti = true
    }
  }

  const soru = SSS_SORU[slug]
  if (soru) {
    const hedef = liste.find((f) => f.question === soru.eskisi)
    if (hedef) {
      hedef.question = soru.yenisi
      sssDegisti = true
    } else if (!liste.some((f) => f.question === soru.yenisi)) {
      console.log(`  atlandı     ${slug}.faqs  (soru bulunamadı)`)
      sayac.atlandi++
    }
  }

  if (sssDegisti) {
    veri.faqs = liste
    console.log(`  devredildi  ${slug}.faqs`)
    sayac.devredildi++
  }

  if (Object.keys(veri).length) {
    await p.region.update({ where: { id: kayit.id }, data: veri })
    sayac.kayit++
  }
}

console.log(
  `\n${sayac.kayit} ilçe kaydı güncellendi · ${sayac.devredildi} alan devredildi · ` +
    `${sayac.guncel} zaten güncel · ${sayac.atlandi} atlandı`
)
await p.$disconnect()
