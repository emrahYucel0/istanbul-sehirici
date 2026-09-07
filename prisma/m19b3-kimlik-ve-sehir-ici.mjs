// prisma/m19b3-kimlik-ve-sehir-ici.mjs
//
//     node --env-file=.env prisma/m19b3-kimlik-ve-sehir-ici.mjs
//
// M19B3 — YAYIN ÖNCESİ KİMLİK VE HİZMET HİZALAMASI.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN BU BETİK VAR
//
// Site HENÜZ YAYINDA DEĞİL. İlk yayın şu kimlikle yapılacak:
//
//     alan adı   https://istanbulsehirici.com
//     marka      Ege Kent Nakliyat
//     e-posta    info@istanbulsehirici.com
//
// Alan adı KODDA (nuxt.config.ts → site.url). Ama e-posta, marka, meta
// kayıtları, politika gövdeleri ve hizmet içerikleri VERİTABANINDA. Üretime
// `prisma/` klasörü yüklenmiyor; içerik veritabanı DÖKÜMÜYLE taşınıyor
// (bkz. deploy/YAYIN-ADIMLARI.md §1.1). Yani canlı siteyi üretecek kaynak
// yerel veritabanı — ama o değişiklik depoda gözden geçirilebilir olmalı.
// Bu betik o köprü: yaptığı her şey burada yazılı ve tekrar çalıştırılabilir.
//
// YÖNTEM — projedeki diğer devir betikleriyle aynı: bir alan YALNIZ bilinen
// eski değerin aynısıysa değişir. Panelden sonradan elle yazılmış metin
// ezilmez, betik iki kez çalıştırılınca ikinci kez hiçbir şey yapmaz.
//
// ─────────────────────────────────────────────────────────────────────────
// İKİNCİ İŞ — HİZMET DEVRİ
//
// "Şehirler Arası Nakliyat" hizmeti "Şehir İçi Nakliyat" ile DEĞİŞTİRİLİYOR.
// Site İstanbul şehir içi taşımaya konumlanıyor; şehirler arası bir hizmet
// bu konumlandırmayla yarışıyordu.
//
// Yeni bir kayıt AÇILMIYOR: mevcut kayıt yerinde dönüştürülüyor. Böylece
// `order` (5. sıra), `servicesId` ve `id` korunuyor — ana sayfa defteri,
// /hizmetlerimiz dizini ve komşu hizmet gezinmesi aynı yuvayı kullanmaya
// devam ediyor, sekizinci bir hizmet doğmuyor.
//
// Site hiç yayınlanmadığı için eski adres için YÖNLENDİRME KURULMUYOR:
// /sehirlerarasi-nakliyat hiç indekslenmedi, korunacak bir SEO geçmişi yok.
// Slug değiştiği anda o adres 404 oluyor — istenen davranış bu.
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/client/client.ts'

const p = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

const ESKI_ALAN = 'istanbulevenakliyat.com'
const YENI_ALAN = 'istanbulsehirici.com'
const ESKI_POSTA = 'info@istanbulevenakliyat.com'
const YENI_POSTA = 'info@istanbulsehirici.com'

let degisen = 0
const bildir = (nerede, alan, eski, yeni) => {
  degisen++
  const kis = (v) => (v ?? '').toString().replace(/\s+/g, ' ').slice(0, 58)
  console.log(`  ✔ ${nerede} · ${alan}\n      eski: ${kis(eski)}\n      yeni: ${kis(yeni)}`)
}
const atla = (nerede, alan, sebep) => console.log(`  – ${nerede} · ${alan} (${sebep})`)

/** Alan yalnız bilinen eski değerdeyse günceller. */
async function devret(model, kayit, alan, eskisi, yenisi, etiket) {
  const simdi = kayit[alan]
  if (simdi === yenisi) return atla(etiket, alan, 'zaten yeni değerde')
  if (simdi !== eskisi) return atla(etiket, alan, 'beklenen eski değerde değil, dokunulmadı')
  await model.update({ where: { id: kayit.id }, data: { [alan]: yenisi } })
  bildir(etiket, alan, eskisi, yenisi)
}

// ══════════════════════════════════════════════ 1) SİTE AYARLARI
async function siteAyarlari() {
  console.log('\n── SİTE AYARLARI')
  const s = await p.siteSettings.findFirst()
  if (!s) return console.log('  kayıt yok')

  await devret(p.siteSettings, s, 'email', ESKI_POSTA, YENI_POSTA, 'siteSettings')

  await devret(
    p.siteSettings,
    { ...s, email: YENI_POSTA },
    'metaDescription',
    "İstanbul'un 39 ilçesinde evden eve nakliyat. Fiyat ve yöntem; araç erişimi, bina girişi ve kat durumuna göre planlanıyor.",
    'İstanbul şehir içi evden eve nakliyat. Fiyat ve yöntem; araç erişimi, bina girişi ve kat durumuna göre planlanıyor.',
    'siteSettings'
  )

  const s2 = await p.siteSettings.findFirst()
  await devret(
    p.siteSettings,
    s2,
    'siteDescription',
    "İstanbul'da şehir içi evden eve nakliyat, ofis taşıma, parça eşya, ambalajlama ve marangozlu söküm-kurulum. Plan, iki adresin erişim ve kat koşullarına göre kuruluyor.",
    "İstanbul şehir içi nakliyat: evden eve taşıma, ofis, parça eşya, ambalajlama ve marangozlu söküm-kurulum. Plan, iki adresin erişim ve kat koşullarına göre kuruluyor.",
    'siteSettings'
  )
}

// ══════════════════════════════════════════════ 2) META KAYITLARI
//
// Bu iki kayıt `app/utils/sayfa-meta.ts` kütüğündeki yedeği EZİYOR
// (bkz. composables/usePageSeo.ts). Kütük M19B3'te güncellendi; veritabanı
// da aynı hizaya çekilmezse arama sonucunda eski metin kalırdı.
async function metaKayitlari() {
  console.log('\n── META KAYITLARI')
  const hedef = [
    {
      page: 'about',
      title: {
        eskisi: "Hakkımızda | İstanbul'da Evden Eve Nakliyat",
        yenisi: 'Ege Kent Nakliyat | İstanbul Şehir İçi Taşıma',
      },
      description: {
        eskisi:
          "İstanbul'da evden eve, ofis ve parça eşya taşıması yapıyoruz. Nasıl çalıştığımız, neyi ölçtüğümüz ve kapsamı nasıl belirlediğimiz.",
        yenisi:
          'İstanbul şehir içi taşımada nasıl çalıştığımızı, neyi ölçtüğümüzü ve bir taşımanın kapsamını neye göre belirlediğimizi anlatıyoruz.',
      },
    },
    {
      page: 'services',
      title: {
        eskisi: 'İstanbul Nakliyat Hizmetleri | Evden Eve, Asansörlü, Ofis, Depolama',
        yenisi: 'İstanbul Şehir İçi Nakliyat Hizmetleri | Ege Kent Nakliyat',
      },
      description: {
        eskisi: null, // aşağıda gerçek değere göre çözülüyor
        yenisi:
          "İstanbul'da şehir içi nakliyat, evden eve taşıma, asansörlü nakliyat, parça eşya, ofis, depolama ve paketleme. Yedi hizmetin kapsamı ayrı ayrı.",
      },
    },
  ]

  for (const h of hedef) {
    const k = await p.meta.findUnique({ where: { page: h.page } })
    if (!k) { atla('meta:' + h.page, '-', 'kayıt yok'); continue }
    await devret(p.meta, k, 'title', h.title.eskisi, h.title.yenisi, 'meta:' + h.page)
    const k2 = await p.meta.findUnique({ where: { page: h.page } })
    const eskiAciklama = h.description.eskisi ?? k2.description
    if (h.description.eskisi === null) {
      // `services` açıklamasının tamamı depoda yazılı değildi; mevcut metinde
      // yalnız konumlandırma çelişkisi varsa (şehirler arası) değiştiriliyor.
      if (!/şehirler\s*arası/i.test(eskiAciklama ?? '')) {
        atla('meta:' + h.page, 'description', 'şehirler arası ifadesi yok')
        continue
      }
    }
    await devret(p.meta, k2, 'description', eskiAciklama, h.description.yenisi, 'meta:' + h.page)
  }
}

// ══════════════════════════════════════════════ 3) POLİTİKA GÖVDELERİ
//
// Hukuki ANLAM değişmiyor: yalnız veri sorumlusunun alan adı ve başvuru
// e-postası güncelleniyor. Metin yapısı ve maddeler olduğu gibi kalıyor.
async function politikalar() {
  console.log('\n── POLİTİKA METİNLERİ (yalnız alan adı / e-posta)')
  const kayitlar = await p.policyPage.findMany().catch(() => null)
  if (!kayitlar) return console.log('  policyPage modeli okunamadı')
  for (const k of kayitlar) {
    const alanlar = ['content', 'title', 'subtitle'].filter((a) => typeof k[a] === 'string')
    const veri = {}
    for (const a of alanlar) {
      const yeni = k[a].split(ESKI_POSTA).join(YENI_POSTA).split(ESKI_ALAN).join(YENI_ALAN)
      if (yeni !== k[a]) veri[a] = yeni
    }
    if (!Object.keys(veri).length) { atla('policy:' + (k.slug ?? k.id), '-', 'eski kimlik yok'); continue }
    await p.policyPage.update({ where: { id: k.id }, data: veri })
    degisen++
    console.log(`  ✔ policy:${k.slug ?? k.id} · ${Object.keys(veri).join(', ')} (alan adı + e-posta)`)
  }
}

// ══════════════════════════════════════════════ 4) ŞEHİR İÇİ NAKLİYAT HİZMETİ

const YENI_HIZMET = {
  slug: 'sehir-ici-nakliyat',
  title: 'Şehir İçi Nakliyat',
  subtitle: 'İstanbul içinde adresten adrese',
  description:
    'İstanbul içindeki taşımalarda planı mesafe değil, iki adresin erişim ve kat koşulları ile günün saati belirliyor.',
  metaTitle: 'İstanbul Şehir İçi Nakliyat | Ege Kent Nakliyat',
  metaDescription:
    'İstanbul şehir içi nakliyat için bina erişimi, kat, asansör, güzergâh ve taşıma ihtiyaçlarını birlikte değerlendirerek taşınma planınızı oluşturun.',
  excerpt:
    'İstanbul içinde iki adres arasındaki fark çoğu zaman kilometre değil: sokak genişliği, kat ve asansör kabini planı değiştiriyor.',
  imagePath: '/yuklemeler/istanbul-evden-eve-nakliyat-kamyon-dar-sokaklar-gorseli-49bbc3-1024.webp',
  imageAlt: 'Dar bir İstanbul sokağında bina girişine yanaşmış kapalı kasa nakliyat aracı',
  includes: [
    'İki adresin erişim koşullarının ayrı ayrı çıkarılması',
    'Araç yaklaşımı ve park noktasının önceden belirlenmesi',
    'Kat, asansör kabini ve merdiven sahanlığına göre yöntem seçimi',
    'Hacme göre araç ve ekip planı',
    'Yükleme sırasının varış adresine göre kurulması',
    'Varışta yerleştirme, montaj ve ambalaj atıklarının toplanması',
  ],
  faqs: [
    {
      question: 'İstanbul içinde taşıma neye göre fiyatlanıyor?',
      answer:
        'Kilometre tek başına belirleyici değil. Eşya hacmi, iki adresteki kat ve asansör durumu, aracın binaya ne kadar yaklaşabildiği ve paketleme ihtiyacı birlikte hesaba giriyor. Aynı ilçedeki iki taşıma bu yüzden farklı çıkabiliyor.',
    },
    {
      question: 'Aynı ilçe içinde taşınmak daha mı kolay?',
      answer:
        'Her zaman değil. Kısa mesafeli bir taşımada da sokak genişliği, park yasağı, asansör kabininin ölçüsü ve merdiven dönüşü işin süresini belirleyebiliyor. Belirleyici olan iki adresin erişim koşulu.',
    },
    {
      question: 'Taşıma günün hangi saatinde yapılıyor?',
      answer:
        'Saat, güzergâhın trafik yoğunluğuna ve binanın kurallarına göre planlanıyor. Bazı sitelerde taşımaya izin verilen saat aralığı var; bu aralık plan kurulurken soruluyor ve yükleme ona göre başlıyor.',
    },
    {
      question: 'Asansör yoksa ne yapılıyor?',
      answer:
        'Yöntem binanın ve sokağın koşuluna göre belirleniyor: merdivenle taşıma, dış cephe asansörü ya da ikisinin birlikte kullanımı. Hangisinin gerekeceği kat sayısına değil, merdiven sahanlığı ve parça ölçüsüne bakılarak çıkıyor.',
    },
    {
      question: 'Taşıma bir günde bitiyor mu?',
      answer:
        'Çoğu şehir içi taşıma tek günde tamamlanıyor. Süreyi uzatan şey mesafe değil, iki adreste elden taşınan mesafe ve sökülüp yeniden kurulacak parça sayısı. Bunlar belli olduğunda süre aralığı baştan konuşuluyor.',
    },
  ],
  content: `<p>İstanbul içinde bir taşımayı zorlaştıran şey iki adres arasındaki kilometre değil, o iki adrese ulaşma biçimi. Aynı ilçede, birbirine on dakika uzaklıktaki iki daireden biri yarım günde, diğeri bütün günde taşınabiliyor. Fark sokağın genişliğinde, kat sayısında ve asansör kabininin ölçüsünde çıkıyor.</p>

<h3>İki adres, iki ayrı koşul</h3>
<p>Plan tek bir adrese göre değil, çıkış ve varışa ayrı ayrı kuruluyor. Her iki adres için aynı şeyler soruluyor: kat, asansör var mı ve kabin hangi parçayı alıyor, merdiven dönüşü ne kadar geniş, aracın kapıya yanaşabileceği en yakın nokta neresi.</p>
<p>İki adres çoğu zaman birbirinden çok farklı çıkıyor. Dar sokaklı eski bir apartmandan çıkan ev, varışta geniş otoparklı bir siteye girebiliyor ya da tersi. Bu fark yalnız süreyi değil yükleme sırasını da değiştiriyor: varışta önce inmesi gereken parça çıkışta en son yükleniyor.</p>

<h3>Araç binaya ne kadar yaklaşıyor</h3>
<p>Aracın durabildiği nokta ile bina girişi arasındaki yürüme mesafesi, İstanbul içinde en çok değişen kalem. Bu mesafe on metre de olabiliyor yetmiş metre de; ekip sayısını ve süreyi doğrudan etkiliyor.</p>
<p>Bazı sokaklarda park yasağı ya da belirli saatlerde geçiş kısıtı var. Bunlar plan kurulurken soruluyor; yükleme saati de buna göre belirleniyor. Sokak koşulu araç tipini de değiştirebiliyor: dar bir sokakta büyük araç yerine iki küçük sefer daha hızlı sonuç verebiliyor.</p>

<h3>Kat, asansör ve merdiven</h3>
<p>Asansör kabini bir koltuğu almıyorsa eşya merdivenden çıkıyor. O zaman belirleyici olan kat sayısı değil, merdivenin dönüş sahanlığı: dar bir sahanlık üç katlı bir binayı beş katlıdan zor hâle getiriyor.</p>
<p>Gardırop, köşe takımı ve ranza gibi parçalar bu noktada yerinde sökülüp varışta yeniden kuruluyor. Dış cephe asansörünün gerekip gerekmediği de burada belli oluyor — ayrıntısı <a href="/asansorlu-nakliyat">asansörlü nakliyat</a> tarafında.</p>

<h3>Hacim, ekip ve araç</h3>
<p>Oda sayısı hacmi tam anlatmıyor. Aynı üç artı bir dairede iki kamyonluk eşya da çıkabiliyor, yarım kamyonluk da. Araç ve ekip sayısı bu hacme göre belirleniyor; taşınacak şey bir evin tamamı değil de birkaç parçaysa <a href="/parca-esya-tasima">parça eşya taşıma</a> planı daha uygun oluyor.</p>
<p>Hangi parçanın nasıl korunacağı da hacimle birlikte çıkıyor. Cam, tablo, mermer ve beyaz eşya ayrı koruma istiyor; kapsamı <a href="/paketleme-hizmeti">paketleme</a> tarafında anlatılıyor.</p>

<h3>Güzergâh ve gün planı</h3>
<p>Şehir içinde güzergâh, mesafeden çok saatle ilgili. Aynı iki adres arasındaki yol sabah ile öğleden sonra farklı sürüyor; köprü ve tünel geçişleri plana ayrıca giriyor.</p>
<p>Sitelerin taşımaya izin verdiği saat aralıkları da hesaba katılıyor. Yükleme saati, varış adresindeki bu aralığa yetişecek biçimde geriye doğru kuruluyor.</p>

<h3>Varışta ne oluyor</h3>
<p>Boşaltma varış adresinin koşuluna göre planlanıyor; aracın kapıya yanaşamadığı bir adreste boşaltma daha uzun sürüyor ve bu, çıkıştaki yükleme sırasına baştan işleniyor.</p>
<p>Sökülen mobilya yeniden kuruluyor, eşya odalara göre yerleştiriliyor ve ambalaj atıkları toplanıp götürülüyor. Taşınmanın yorucu kısmı çoğu zaman burada başladığı için bu aşama plana dahil.</p>

<p>Koşulların tutara nasıl yansıdığını önce kabaca görmek isterseniz <a href="/fiyat-hesaplama">fiyat hesaplama</a> aracı altı bilgiyle bir aralık veriyor; iki adresin ayrıntısını <a href="/iletisim">iletişim</a> üzerinden birlikte çıkarıyoruz.</p>`,
}

async function hizmetDevri() {
  console.log('\n── HİZMET DEVRİ: Şehirler Arası → Şehir İçi')
  const yeni = await p.service.findUnique({ where: { slug: YENI_HIZMET.slug } })
  if (yeni) return atla('service', YENI_HIZMET.slug, 'devir zaten yapılmış')

  const eski = await p.service.findUnique({ where: { slug: 'sehirler-arasi-nakliyat' } })
  if (!eski) return atla('service', 'sehirler-arasi-nakliyat', 'kayıt bulunamadı')

  await p.service.update({
    where: { id: eski.id },
    data: {
      ...YENI_HIZMET,
      // `order`, `servicesId`, `isActive` ve `id` DOKUNULMADAN kalıyor:
      // hizmet aynı yuvada kalsın, sekizinci bir kart doğmasın.
      isActive: true,
    },
  })
  degisen++
  console.log(`  ✔ service#${eski.id} · slug ${eski.slug} → ${YENI_HIZMET.slug}`)
  console.log(`      order ${eski.order} korundu · başlık "${eski.title}" → "${YENI_HIZMET.title}"`)
}

// ══════════════════════════════════════════════ 5) EVDEN EVE NAKLİYAT HİZMETİ
//
// İki alan konumlandırmayla çelişiyordu:
//
//   subtitle  "Şehir İçi & Şehirler Arası" — bu alt başlık kartla birlikte
//             ALTI ROTADA basılıyordu (kendi sayfası, /hizmetlerimiz ve dört
//             komşu hizmet kartı). Artık var olmayan bir hizmeti duyuruyordu.
//   metaTitle "Evden Eve Nakliyat Hizmeti: Kapsam ve Süreç" — konu doğru ama
//             şehir ve marka yok. Bu sayfa ikincil arama niyetinin ana
//             sayfası; başlık onu açıkça söylemeli.
//
// Diğer BEŞ hizmetin metaTitle'ı BİLEREK değiştirilmedi: hepsi zaten benzersiz
// ve niyetle eşleşiyor. Hepsine marka + "İstanbul" eklemek anahtar kelime
// tekrarı olurdu; brief bunu açıkça istemiyor.
async function evdenEveHizmeti() {
  console.log('\n── EVDEN EVE NAKLİYAT (alt başlık + arama başlığı)')
  const k = await p.service.findUnique({ where: { slug: 'evden-eve-nakliyat' } })
  if (!k) return atla('service', 'evden-eve-nakliyat', 'kayıt yok')
  await devret(p.service, k, 'subtitle', 'Şehir İçi & Şehirler Arası', 'İstanbul içinde planlı taşınma', 'service:evden-eve')
  const k2 = await p.service.findUnique({ where: { slug: 'evden-eve-nakliyat' } })
  await devret(
    p.service,
    k2,
    'metaTitle',
    'Evden Eve Nakliyat Hizmeti: Kapsam ve Süreç',
    'İstanbul Evden Eve Nakliyat | Ege Kent Nakliyat',
    'service:evden-eve'
  )
}

// ══════════════════════════════════════════════ ÇALIŞTIR
try {
  await siteAyarlari()
  await metaKayitlari()
  await politikalar()
  await hizmetDevri()
  await evdenEveHizmeti()
  console.log(`\nTOPLAM ${degisen} alan güncellendi.`)
} catch (e) {
  console.error('HATA:', e)
  process.exitCode = 1
} finally {
  await p.$disconnect()
}
