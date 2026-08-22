// prisma/hakkimizda-metinleri-tohum.mjs
//
//     npm run hakkimizda-metin -- --dogrula   → yalnız rapor, HİÇBİR ŞEY yazmaz
//     npm run hakkimizda-metin                → devri uygular
//
// /HAKKIMIZDA — DOĞRULANMAMIŞ İDDİA DEVRİ.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN
//
// `AboutSection` kaydındaki sekiz anlatı alanı iddia politikasından önce
// yazılmıştı ve şunları taşıyordu:
//
//     "On iki yılı aşkın süredir"        → kuruluş yılı doğrulanamıyor
//     "her işe ücretsiz keşifle"         → ücretsizlik taahhüdü
//     "yazılı ve net bir fiyat … sabit"  → fiyat garantisi
//     "Tüm taşımalarımız sigortalı"      → koşulsuz teminat
//     "Türkiye genelinde 81 ilde"        → yanlış konumlandırma (site İstanbul odaklı)
//     "8.500'ü aşkın taşıma"             → kayıt yok
//
// Bu alanların HEPSİ sayfada görünüyor. Görünen yüzeyde doğrulanmamış
// iddia bırakmamak için metinler operasyonel karşılıklarıyla değişiyor.
//
// ─────────────────────────────────────────────────────────────────────────
// NE DEĞİŞMİYOR
//
// `stats` (4 rakam), `services` (6 satır), `teamImage`/`teamImageAlt`
// alanlarına DOKUNULMUYOR. Sebebi: V2 sayfası bunların hiçbirini basmıyor.
// Görünmeyen veriyi sessizce yeniden yazmak yerine raporlanıyor — "önce
// bildir, kendiliğinden onarma". Betiğin sonundaki blok bunları listeliyor.
//
// ─────────────────────────────────────────────────────────────────────────
// GÜVENLİ YAZMA
//
// Her alan yalnız şu iki durumda yazılıyor:
//   · mevcut değer BOŞ, ya da
//   · mevcut değer, aşağıda `eski` olarak kayıtlı metnin AYNISI
//
// Panelden elle değiştirilmiş bir metin (ne boş ne de bilinen eski hâli)
// EZİLMİYOR; "elle yazılmış" diye raporlanıyor. Betik ikinci kez
// çalıştırıldığında 0 yazma üretiyor.
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/client/client.ts'

const p = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

const YALNIZ_DOGRULA = process.argv.slice(2).includes('--dogrula')

const BOLUM = 'about-section'

/**
 * Alan devirleri. `eski`, bu betiğin yazıldığı andaki kayıtlı değerdir —
 * eşleşmezse alana dokunulmuyor.
 */
const DEVIRLER = [
  {
    alan: 'mainTitle',
    eski: 'Eşya Taşımıyoruz, Bir Günü Yönetiyoruz',
    yeni: 'Taşımayı, taşıma gününden önce planlıyoruz',
    sebep: 'V2 başlık dili cümle düzeninde; başlık sayfanın çalışma biçimini söylüyor',
  },
  {
    alan: 'description1',
    eski:
      'On iki yılı aşkın süredir evden eve nakliyat yapıyoruz. Bu sürede öğrendiğimiz en önemli şey şu: taşınmanın zor kısmı eşyayı kaldırmak değil, o günü kurgulamak. Kaç kutu çıkacağı, hangi mobilyanın kapıdan geçmeyeceği, asansörün kaça kadar çalıştığı, yeni evde hangi eşyanın hangi odaya gireceği — bunlar taşıma günü değil, taşımadan önce çözülmesi gereken sorular.',
    yeni:
      "İstanbul'da evden eve, ofis ve parça eşya taşıması yapıyoruz. Bir taşınmanın nasıl geçeceğini çoğu zaman mesafe değil, iki adresin koşulları belirliyor. Bu yüzden işin büyük bölümü taşıma gününde değil, ondan önce yapılıyor: adres görülüyor, kapsam yazılıyor, gün buna göre kuruluyor.",
    sebep: '"On iki yılı aşkın süredir" kaldırıldı, İstanbul odağı açık hâle getirildi',
  },
  {
    alan: 'description2',
    eski:
      'Bu yüzden her işe ücretsiz keşifle başlıyoruz. Eve gelip eşyaları yerinde görüyor, hacmi ve kat/asansör durumunu ölçüyor, özel taşıma gerektiren parçaları (piyano, kasa, akvaryum, sanat eseri) ayrıca not ediyoruz. Keşfin sonunda size yazılı ve net bir fiyat sunuyoruz; bu fiyat taşıma gününe kadar sabit kalıyor.',
    yeni:
      'Bir taşınmanın kaç saat süreceğini eşyanın ağırlığı değil, o eşyanın binadan nasıl çıkacağı belirliyor. Kaç kutu çıkacağı, hangi mobilyanın kapıdan geçmeyeceği, asansör kabininin hangi parçayı almadığı, yeni adreste hangi eşyanın hangi odaya gireceği — bunların hepsi taşıma gününden önce cevaplanabilir sorular. Cevaplanmadığında gün, planı yürütmekle değil karar vermekle geçiyor.',
    sebep: '"ücretsiz keşif" ve "yazılı ve net … sabit kalıyor" fiyat garantisi kaldırıldı',
  },
  {
    alan: 'description3',
    eski:
      'Taşıma günü tek muhatabınız oluyoruz: paketleme, demontaj, yükleme, taşıma, montaj ve yerleştirme aynı ekibin işi. Tüm taşımalarımız sigortalı; bugün Türkiye genelinde 81 ilde hizmet veriyoruz.',
    yeni:
      'İşimiz yalnız araç ve ekip sağlamak değil. Paketleme, söküm, yükleme, taşıma, montaj ve yerleştirme aynı planın parçaları; hangisinin gerekip hangisinin gerekmediği adrese göre değişiyor. Taşıma günü tek muhatabınız oluyoruz ve kapsam baştan belirlendiği için gün içinde konuşulacak yeni bir iş kalmıyor.',
    sebep: '"Tüm taşımalarımız sigortalı" ve "Türkiye genelinde 81 ilde" kaldırıldı',
  },
  {
    alan: 'historyTitle',
    eski: 'Nasıl Bu Noktaya Geldik',
    yeni: 'Yöntem her işte aynı, plan her adreste farklı',
    sebep: 'Bölüm artık tarihçe değil, çalışma yöntemi anlatıyor',
  },
  {
    alan: 'historyText1',
    eski:
      'İşe küçük bir ekiple, şehir içi ev taşımalarıyla başladık. İlk yıllarda en çok duyduğumuz şikâyet fiyatla ilgiliydi: telefonda bir rakam söyleniyor, taşıma günü kat farkı, asansör farkı, ambalaj farkı diye başka bir rakam çıkıyordu. Biz de en baştan tersini yapmayı seçtik — önce yerinde bakmadan fiyat vermemek, verdiğimiz fiyatı da yazılı hâle getirmek.',
    yeni:
      'İşe şehir içi ev taşımalarıyla başladık. En çok duyduğumuz şikâyet fiyatla ilgiliydi: telefonda bir rakam söyleniyor, taşıma günü kat farkı, asansör farkı, ambalaj farkı diye başka bir rakam çıkıyordu. Biz de tersini yapmayı seçtik — adresi görmeden rakam vermemek, neyin dahil olduğunu yazıya dökmek.',
    sebep: '"verdiğimiz fiyatı yazılı hâle getirmek" → kapsamın yazılı olması (fiyat taahhüdü değil)',
  },
  {
    alan: 'historyText2',
    eski:
      'Ev taşımada oturan bu düzeni zamanla diğer alanlara taşıdık. Şehirler arası taşımada müşterinin en büyük korkusu eşyanın günlerce yolda kalmasıydı; süreç boyunca bilgilendirme yaparak bunu çözdük. Ofis taşımada işin durmaması gerekiyordu; hafta sonu çalışma ve etiketli demontaj-montaj bu ihtiyaçtan doğdu. Ara dönemde kalacak yeri olmayanlar için depolama, tek parça göndermek isteyenler için parça eşya hizmeti eklendi.',
    yeni:
      'Ev taşımada oturan bu düzeni diğer işlere de taşıdık. Ofis taşımada karşımızdaki asıl sorun eşya değil, ertesi sabah çalışır bir düzen olduğu için mesai dışı planlama ve etiketli söküm-montaj oradan doğdu. Ara dönemde kalacak yeri olmayanlar için depolama, tek parça göndermek isteyenler için parça eşya taşıma aynı şekilde ihtiyaçtan çıktı.',
    sebep: 'Anlatı korundu; "şehirler arası" vurgusu Türkiye-geneli izlenimi vermesin diye kısaldı',
  },
  {
    alan: 'historyText3',
    eski:
      'Bugün 8.500’ü aşkın taşımayı tamamlamış durumdayız ve hizmet ağımız 81 ile ulaştı. Buna rağmen işleyiş ilk günkü gibi: her taşınma tek tek planlanıyor, hiçbir ev diğerinin kopyası sayılmıyor.',
    yeni:
      'İşleyiş bugün de aynı: her taşınma tek tek planlanıyor, hiçbir adres diğerinin kopyası sayılmıyor. Aşağıdaki dört karar, işin türü ne olursa olsun her taşımada aynı sırayla veriliyor.',
    sebep: '"8.500 taşıma" ve "81 il" kaldırıldı — ikisi de kayıtla desteklenmiyor',
  },
]

const kayit = await p.aboutSection.findFirst({ where: { sectionName: BOLUM } })
if (!kayit) {
  console.error(`Kayıt bulunamadı: ${BOLUM}`)
  await p.$disconnect()
  process.exit(1)
}

const norm = (v) => String(v ?? '').replace(/\s+/g, ' ').trim()

const yazilacak = {}
let yazildi = 0
let zatenGuncel = 0
const elleYazilmis = []

for (const d of DEVIRLER) {
  const simdi = norm(kayit[d.alan])
  if (simdi === norm(d.yeni)) {
    zatenGuncel++
    continue
  }
  if (simdi && simdi !== norm(d.eski)) {
    elleYazilmis.push(d.alan)
    continue
  }
  yazilacak[d.alan] = d.yeni
  console.log(`  ${YALNIZ_DOGRULA ? 'YAZILACAK' : 'yazıldı  '}  ${d.alan.padEnd(14)} ${d.sebep}`)
  yazildi++
}

if (!YALNIZ_DOGRULA && Object.keys(yazilacak).length) {
  await p.aboutSection.update({ where: { id: kayit.id }, data: yazilacak })
}

console.log(
  `\n${YALNIZ_DOGRULA ? 'DOĞRULAMA' : 'DEVİR'} SONUCU\n` +
    `  alan                ${DEVIRLER.length}\n` +
    `  yazıldı             ${yazildi}${YALNIZ_DOGRULA ? ' (yazılmadı)' : ''}\n` +
    `  zaten güncel        ${zatenGuncel}\n` +
    `  elle yazılmış       ${elleYazilmis.length}`
)
if (elleYazilmis.length) {
  console.log('\nELLE YAZILMIŞ (EZİLMEDİ — panelden gözden geçirilmeli)')
  elleYazilmis.forEach((a) => console.log(`  ${a}`))
}

// --- meta açıklaması ------------------------------------------------------
//
// Panelde `Meta(page: 'about')` kaydı var ve iddia taşımıyor; ama son
// cümlesi "…ve ekibin kapsamı" diyordu. V2 sayfasında ekip bölümü YOK
// (gerçek ekip verisi ve fotoğrafı olmadığı için üretilmedi), yani
// açıklama sayfada karşılığı olmayan bir şey vaat ediyordu. Aynı güvenli
// yazma kuralı: yalnız bilinen eski değerse değişiyor.
const META_ESKI =
  "İstanbul'da evden eve nakliyat, ofis taşıma ve ambalajlama yapıyoruz. Nasıl çalıştığımız, keşifte neyi ölçtüğümüz ve ekibin kapsamı."
const META_YENI =
  "İstanbul'da evden eve, ofis ve parça eşya taşıması yapıyoruz. Nasıl çalıştığımız, keşifte neyi ölçtüğümüz ve kapsamı nasıl belirlediğimiz."

const metaKayit = await p.meta.findFirst({ where: { page: 'about' } })
if (!metaKayit) {
  console.log('\nMETA: about kaydı yok — sayfa `app/utils/sayfa-meta.ts` yedeğini kullanıyor.')
} else if (norm(metaKayit.description) === norm(META_YENI)) {
  console.log('\nMETA: açıklama zaten güncel.')
} else if (metaKayit.description && norm(metaKayit.description) !== norm(META_ESKI)) {
  console.log('\nMETA: açıklama elle yazılmış — EZİLMEDİ.')
} else {
  if (!YALNIZ_DOGRULA) {
    await p.meta.update({ where: { id: metaKayit.id }, data: { description: META_YENI } })
  }
  console.log(
    `\nMETA: açıklama ${YALNIZ_DOGRULA ? 'YAZILACAK' : 'yazıldı'} (${META_YENI.length} karakter)`
  )
}

// --- basılmayan ama kayıtta duran veri: raporla, dokunma -------------------
const artik = await p.aboutSection.findFirst({
  where: { sectionName: BOLUM },
  include: { services: true, stats: true },
})
console.log(
  '\nSAYFADA BASILMAYAN KAYITLI VERİ (bu betik DOKUNMUYOR)\n' +
    `  stats               ${artik.stats.length} satır → ${artik.stats.map((s) => s.value).join(', ')}\n` +
    `  services            ${artik.services.length} satır (gerçek hizmet kaydı ayrı tabloda)\n` +
    `  teamImage           ${artik.teamImage ? artik.teamImage.split('/').pop() : '(boş)'}\n` +
    `  teamImageAlt        ${artik.teamImageAlt || '(boş)'}`
)

await p.$disconnect()
