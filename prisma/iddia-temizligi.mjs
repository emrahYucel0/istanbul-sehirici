// prisma/iddia-temizligi.mjs
//
// DOĞRULANMAMIŞ TİCARİ İDDİALARIN VERİ TABANI TARAFI.
//
// ─────────────────────────────────────────────────────────────────────────
// İKİ DEĞİŞİKLİK, İKİSİ DE MEVCUT YAZMA SÖZLEŞMESİNDEN GEÇİYOR
//
// 1. SSS — "Eşyalar sigortalı mı?" CEVABI DEĞİŞİYOR, SORU KALIYOR.
//
//    Eski cevap "Taşıma nakliyat sigortası kapsamında yapılıyor" diyordu.
//    Bu bir sigorta TEMİNATI taahhüdü ve depoda onu destekleyen kayıt yok.
//
//    Soruyu tamamen yayından çekmek de bir seçenekti. Seçilmedi, çünkü
//    aynı soru sitenin BAŞKA DÖRT SAYFASINDA zaten iddiasız biçimde
//    cevaplanıyor (ölçüldü: /evden-eve-nakliyat, /sehirler-arasi-nakliyat,
//    /bahcelievler, /kartal):
//
//        "Eşyalarım sigortalı mı taşınıyor?
//         Taşıma sırasındaki hasarlara karşı sorumluluğumuz yazılı
//         sözleşmede tanımlı. Kırılabilir ve yüksek değerli parçalar ayrı
//         listeleniyor, ambalajları da ayrı yapılıyor."
//
//    Bu cümle bir teminat vaat etmiyor; sorumluluğun nerede tanımlı
//    olduğunu söylüyor. Uydurulmuş bir metin de değil — sitenin kendi
//    yayınlanmış cevabı. Ana sayfa artık onunla aynı şeyi söylüyor;
//    ziyaretçinin en sık sorduğu soru cevapsız kalmıyor ve site kendi
//    içinde çelişmiyor.
//
//    NOT: "yazılı sözleşme" ifadesi M1/M2 döneminde yazılmış içerikten
//    geliyor ve bu turda bağımsız olarak doğrulanmadı; kapsamı P1-3
//    değil.
//
//    Ana sayfadaki FAQPage yapısal verisi görünen listeyle AYNI kaynaktan
//    (`sorular.items`, yalnız aktif) üretiliyor; cevap değiştiğinde
//    işaretleme de kendiliğinden değişiyor. SSS sayısı hiçbir yerde
//    sabitlenmemiş, bu turda da değişmiyor: altı madde altı kalıyor.
//
// 2. EYLEM DÜĞMESİ — "Ücretsiz Keşif" → "Keşif Talebi".
//
//    `SiteSettings.ctaLabel` 106 sayfanın tamamında basılıyordu. Keşfin
//    ücretsiz olduğunu gösteren doğrulanmış bir iş kuralı yok. Yeni metin
//    aynı akışı tarif ediyor (ziyaretçi keşif istiyor) ama bir ücret
//    taahhüdü vermiyor. `ctaLink` DEĞİŞMİYOR.
//
// ─────────────────────────────────────────────────────────────────────────
// SAHİPLİK DEĞİŞMİYOR — YAZILAN ALANLAR PANELİN YAZDIĞI ALANLAR
//
// Betik iki alana dokunuyor ve ikisi de panelde zaten düzenlenebilir:
//   · `FaqItem.answer`        → FaqPanel'deki madde metni
//   · `SiteSettings.ctaLabel` → Site Ayarları'ndaki metin alanı
//
// Bölüm servisleri (`faqSectionCrudService`, `siteSettingsCrudService`)
// BİLEREK import edilmiyor: o dosyalar `../../../utils/prisma` gibi
// uzantısız yollar kullanıyor ve Node'un yerleşik tip sıyırması bunları
// çözemiyor (ölçüldü: ERR_MODULE_NOT_FOUND). İkinci bir gerekçe daha var —
// SSS bölüm servisi her yazmada çocukları silip yeniden yaratıyor; tek bir
// cevabı değiştirmek için on beş satırı yeniden üretmek gereksiz risk.
//
// Yazma bu yüzden alan bazında ve dar. Betiğin sonundaki doğrulama, diğer
// on dört maddenin bayt bayt aynı kaldığını ve yalnız hedef cevabın
// değiştiğini gösteriyor.
//
// KULLANIM
//   node --env-file=.env prisma/iddia-temizligi.mjs            (kuru çalıştırma)
//   node --env-file=.env prisma/iddia-temizligi.mjs --uygula
//
// Yeniden çalıştırılabilir: değerler zaten hedefteyse hiçbir şey yazmaz.
import prisma from '../server/utils/prisma.ts'

const uygula = process.argv.includes('--uygula')

const HEDEF_SORU = 'Eşyalar sigortalı mı?'
const YENI_CEVAP =
  'Taşıma sırasındaki hasarlara karşı sorumluluğumuz yazılı sözleşmede tanımlı. ' +
  'Kırılabilir ve yüksek değerli parçalar keşifte ayrı listeleniyor, ambalajları da ayrı yapılıyor.'
const ESKI_CEVAP_IZI = 'sigortası kapsamında'
const ESKI_CTA = 'Ücretsiz Keşif'
const YENI_CTA = 'Keşif Talebi'

console.log('═══════════════════════════════════════════════════════')
console.log('İDDİA TEMİZLİĞİ', uygula ? '· UYGULANIYOR' : '· KURU ÇALIŞTIRMA (yazma yok)')
console.log('═══════════════════════════════════════════════════════')

// ─────────────────────────────────────────── 1. SSS
const bolum = await prisma.faqSection.findFirst({
  include: { faqs: { orderBy: { order: 'asc' } } },
})
if (!bolum) {
  console.error('FaqSection kaydı yok.')
  process.exit(1)
}

const hedefSoru = bolum.faqs.find((f) => f.question.trim() === HEDEF_SORU)
console.log('\n── SSS ──')
console.log('toplam madde      ', bolum.faqs.length)
console.log('yayında           ', bolum.faqs.filter((f) => f.isActive).length)
if (!hedefSoru) {
  console.log(`"${HEDEF_SORU}" bulunamadı — yapılacak bir şey yok.`)
} else {
  console.log('hedef             ', `#${hedefSoru.id} "${hedefSoru.question}" · aktif: ${hedefSoru.isActive}`)
  console.log('mevcut cevap      ', JSON.stringify(hedefSoru.answer.slice(0, 90) + '…'))
  console.log('iddia izi         ', hedefSoru.answer.includes(ESKI_CEVAP_IZI) ? `VAR ("${ESKI_CEVAP_IZI}")` : 'yok')
  console.log('yeni cevap        ', JSON.stringify(YENI_CEVAP.slice(0, 90) + '…'))
  console.log('madde sayısı      ', 'değişmiyor — soru yayında kalıyor')
}

// ─────────────────────────────────────────── 2. CTA
const ayar = await prisma.siteSettings.findFirst()
console.log('\n── EYLEM DÜĞMESİ ──')
console.log('ctaLabel          ', JSON.stringify(ayar?.ctaLabel))
console.log('ctaLink           ', JSON.stringify(ayar?.ctaLink), '(değişmiyor)')
console.log('hedef             ', JSON.stringify(YENI_CTA))

if (!uygula) {
  console.log('\nKuru çalıştırma. Yazmak için: --uygula')
  await prisma.$disconnect()
  process.exit(0)
}

// ─────────────────────────────────────────── YAZMA
console.log('')

if (hedefSoru && hedefSoru.answer !== YENI_CEVAP) {
  await prisma.faqItem.update({
    where: { id: hedefSoru.id },
    // `isActive` de yazılıyor: madde daha önceki bir turda pasife alınmış
    // olabilir; cevap iddiasız hâle geldiğine göre yayında olmalı.
    data: { answer: YENI_CEVAP, isActive: true },
  })
  console.log(`   ✔ SSS #${hedefSoru.id} cevabı iddiasız metinle değiştirildi`)
} else {
  console.log('   · SSS zaten hedef durumda')
}

if (ayar && ayar.ctaLabel !== YENI_CTA) {
  await prisma.siteSettings.update({ where: { id: ayar.id }, data: { ctaLabel: YENI_CTA } })
  console.log('   ✔ ctaLabel güncellendi (yalnız ctaLabel yazıldı)')
} else {
  console.log('   · ctaLabel zaten hedef durumda')
}

// ─────────────────────────────────────────── DOĞRULAMA
const sonraBolum = await prisma.faqSection.findFirst({
  include: { faqs: { orderBy: { order: 'asc' } } },
})
const sonraAyar = await prisma.siteSettings.findFirst()

// Hedef madde DIŞINDAKİ on dört satır bayt bayt karşılaştırılıyor.
const digerleri = (liste) =>
  liste
    .filter((f) => f.question.trim() !== HEDEF_SORU)
    .map((f) => `${f.order}|${f.question}|${f.answer}|${f.isActive}`)
    .sort()
    .join('\n')

const sonrakiHedef = sonraBolum.faqs.find((f) => f.question.trim() === HEDEF_SORU)

console.log('\n─── DOĞRULAMA ───')
console.log('SSS madde sayısı  ', sonraBolum.faqs.length, sonraBolum.faqs.length === bolum.faqs.length ? '(değişmedi ✓)' : '⚠ DEĞİŞTİ')
console.log('diğer 14 madde    ', digerleri(bolum.faqs) === digerleri(sonraBolum.faqs) ? 'birebir aynı ✓' : '⚠ DEĞİŞTİ')
console.log('yayındaki madde   ', sonraBolum.faqs.filter((f) => f.isActive).length, sonraBolum.faqs.filter((f) => f.isActive).length === 6 ? '✓' : '⚠')
console.log('soru yayında      ', sonrakiHedef?.isActive === true ? 'evet ✓' : '⚠')
console.log('cevapta iddia izi ', sonrakiHedef?.answer.includes(ESKI_CEVAP_IZI) ? '⚠ HÂLÂ VAR' : 'yok ✓')
console.log('cevap             ', JSON.stringify(sonrakiHedef?.answer))
console.log('ctaLabel          ', JSON.stringify(sonraAyar.ctaLabel))
console.log('ctaLink           ', JSON.stringify(sonraAyar.ctaLink), sonraAyar.ctaLink === ayar.ctaLink ? '(değişmedi ✓)' : '⚠ DEĞİŞTİ')

await prisma.$disconnect()
