// prisma/politika-kimlik.mjs
//
// HUKUKİ METİNLERDEKİ KİMLİĞİ GÜNCELLER.
//
// ═════════════════════════════════════════════════════════════════════════
// NE YAPIYOR, NE YAPMIYOR
//
// YAPIYOR: eski alan adı ve eski e-posta adresini yenisiyle değiştiriyor;
// tanımsız kalmış "Şirket" terimini nötr "site işletmecisi" ifadesine
// çeviriyor.
//
// YAPMIYOR: hukuki hükümlerin anlamını değiştirmiyor. Hiçbir cümle yeniden
// yazılmıyor, madde eklenmiyor, çıkarılmıyor. Değişen tek şey KİMLİK.
//
// ─────────────────────────────────────────────────────────────────────────
// TİCARİ UNVAN UYDURULMADI
//
// Kullanım Şartları altı yerde "Şirket" diyordu ama metnin hiçbir yerinde
// bu terim TANIMLANMAMIŞTI ("… bundan sonra Şirket olarak anılacaktır"
// gibi bir cümle yok). Yani yükümlülükler adı geçmeyen bir tüzel kişiye
// atfediliyordu.
//
// İki seçenek vardı: terimi tanımlamak ya da nötrleştirmek. Tanımlamak
// gerçek bir ticari unvan gerektirir ve elimizde yok — uydurmak, hukuki
// bir belgeye sahte taraf yazmak olurdu. Bu yüzden terim "site
// işletmecisi" ifadesine çevrildi: yükümlülükler aynı tarafta kalıyor,
// yalnız o taraf adıyla değil sıfatıyla anılıyor.
//
// İşletme gerçek ticari unvanı bildirdiğinde bu ifadeler tek seferde
// güncellenebilir. RAPORLANMASI GEREKEN AÇIK BİR EKSİKTİR.
//
// ─────────────────────────────────────────────────────────────────────────
// SIRA ÖNEMLİ
//
// E-posta önce değişiyor. Ters sırada `evenakliyatevden.com` kuralı
// `info@evenakliyatevden.com` dizesinin İÇİNDEKİ alan adını da değiştirir
// ve sonuç doğru çıkar ama e-posta sayacı yanlış raporlanırdı.
//
// ─────────────────────────────────────────────────────────────────────────
// TOHUM DOSYASIYLA BİRLİKTE
//
// `prisma/politika-tohum.mjs` içindeki metinler AYNI değişimden geçirildi.
// Tohum kayıt varsa dokunmuyor; yani yeni bir kurulumda eski kimlik geri
// gelmiyor, mevcut kurulumda da bu betik düzeltiyor. İkisinin ayrışmadığını
// `test/politika-kimlik.test.ts` denetliyor.
//
// KULLANIM
//   node --env-file=.env prisma/politika-kimlik.mjs            (kuru çalıştırma)
//   node --env-file=.env prisma/politika-kimlik.mjs --uygula
//
// Yeniden çalıştırılabilir: metinler zaten temizse hiçbir şey yazmaz.
import prisma from '../server/utils/prisma.ts'

const uygula = process.argv.includes('--uygula')

/** Kimlik değişimi. Sıra korunmalı (bkz. başlık). */
export const KIMLIK = [
  ['info@evenakliyatevden.com', 'info@istanbulevenakliyat.com'],
  ['evenakliyatevden.com', 'istanbulevenakliyat.com'],
]

/**
 * Tanımsız "Şirket" terimi → nötr sıfat.
 *
 * Bağlamıyla birlikte eşleşiyor: cümle başında büyük, cümle içinde küçük
 * harf gerekiyor ve Türkçe ekler ("Şirket'e" → "site işletmecisine")
 * kalıpla çözülemez.
 */
export const UNVAN = [
  ["<li>Şirket, Şartları dilediği zaman", '<li>Site işletmecisi, Şartları dilediği zaman'],
  ["vb.) Şirket'e veya lisans verenlerine aittir", 'vb.) site işletmecisine veya lisans verenlerine aittir'],
  ["korur ancak Şirket'e bu içerikleri", 'korur ancak site işletmecisine bu içerikleri'],
  ["<p>Şirket, aşağıdaki durumlarda Hizmet'i", "<p>Site işletmecisi, aşağıdaki durumlarda Hizmet'i"],
  ['sağlanır ve Şirket, aşağıdaki durumlar için', 'sağlanır ve site işletmecisi, aşağıdaki durumlar için'],
  ["<p>Şirket'in toplam sorumluluğu", '<p>Site işletmecisinin toplam sorumluluğu'],
]

const donustur = (metin) => {
  let sonuc = String(metin ?? '')
  const rapor = []
  for (const [eski, yeni] of [...KIMLIK, ...UNVAN]) {
    const adet = sonuc.split(eski).length - 1
    if (!adet) continue
    sonuc = sonuc.split(eski).join(yeni)
    rapor.push({ eski, yeni, adet })
  }
  return { sonuc, rapor }
}

const say = (m, kalip) => (String(m ?? '').match(kalip) || []).length

console.log('═══════════════════════════════════════════════════════')
console.log('POLİTİKA KİMLİĞİ', uygula ? '· UYGULANIYOR' : '· KURU ÇALIŞTIRMA (yazma yok)')
console.log('═══════════════════════════════════════════════════════')

const sayfalar = await prisma.policyPage.findMany({ orderBy: { id: 'asc' } })
const isler = []

for (const s of sayfalar) {
  const alanlar = {}
  const raporlar = []
  for (const alan of ['title', 'subtitle', 'content']) {
    const { sonuc, rapor } = donustur(s[alan])
    if (rapor.length) {
      alanlar[alan] = sonuc
      raporlar.push(...rapor.map((r) => ({ ...r, alan })))
    }
  }
  const govde = [s.title, s.subtitle, s.content].filter(Boolean).join('\n')
  console.log(`\n── ${s.slug} (id ${s.id}, ${s.isActive ? 'aktif' : 'pasif'})`)
  console.log('   eski alan adı:', say(govde, /evenakliyatevden\.com/g),
    '| eski e-posta:', say(govde, /info@evenakliyatevden\.com/g),
    '| tanımsız "Şirket":', say(govde, /Şirket/g))
  if (!raporlar.length) {
    console.log('   → değişiklik gerekmiyor')
    continue
  }
  for (const r of raporlar) {
    const kisalt = (t) => (t.length > 44 ? t.slice(0, 44) + '…' : t)
    console.log(`   ${String(r.adet).padStart(2)} ×  ${kisalt(r.eski)}  →  ${kisalt(r.yeni)}   [${r.alan}]`)
  }
  isler.push({ id: s.id, slug: s.slug, alanlar })
}

console.log('\n─── ÖZET ───')
console.log('  güncellenecek sayfa:', isler.length, '/', sayfalar.length)

if (!isler.length) {
  console.log('  Yapılacak bir şey yok — metinler zaten temiz.')
  await prisma.$disconnect()
  process.exit(0)
}

if (!uygula) {
  console.log('\nKuru çalıştırma. Yazmak için: --uygula')
  await prisma.$disconnect()
  process.exit(0)
}

console.log('')
for (const is of isler) {
  await prisma.policyPage.update({ where: { id: is.id }, data: is.alanlar })
  console.log('   ✔', is.slug, '—', Object.keys(is.alanlar).join(', '), 'güncellendi')
}

// ─────────────────────────────────────────── DOĞRULAMA
const sonra = await prisma.policyPage.findMany({ orderBy: { id: 'asc' } })
console.log('\n─── DOĞRULAMA ───')
let sorun = 0
for (const s of sonra) {
  const govde = [s.title, s.subtitle, s.content].filter(Boolean).join('\n')
  const eskiAlan = say(govde, /evenakliyatevden\.com/g)
  const eskiPosta = say(govde, /info@evenakliyatevden\.com/g)
  const sirket = say(govde, /Şirket/g)
  const yeniAlan = say(govde, /istanbulevenakliyat\.com/g)
  const yeniPosta = say(govde, /info@istanbulevenakliyat\.com/g)
  if (eskiAlan || eskiPosta || sirket) sorun++
  console.log(
    ` ${eskiAlan || eskiPosta || sirket ? '✘' : '✔'} ${s.slug.padEnd(22)}` +
      ` eski: ${eskiAlan}/${eskiPosta} · "Şirket": ${sirket} · yeni: ${yeniAlan}/${yeniPosta}`
  )
}

// Uzunluk karşılaştırması: metnin yeniden yazılmadığını, yalnız kimlik
// dizelerinin değiştiğini gösterir.
console.log('\n  metin uzunluğu (kimlik dizeleri uzunluk farkı yaratır, madde sayısı DEĞİŞMEZ):')
for (const s of sonra) {
  const oncekiSayfa = sayfalar.find((x) => x.id === s.id)
  const h2Once = say(oncekiSayfa.content, /<h2>/g)
  const h2Sonra = say(s.content, /<h2>/g)
  const liOnce = say(oncekiSayfa.content, /<li>/g)
  const liSonra = say(s.content, /<li>/g)
  console.log(
    `    ${s.slug.padEnd(22)} <h2> ${h2Once}→${h2Sonra} ${h2Once === h2Sonra ? '✔' : '✘'}` +
      `  <li> ${liOnce}→${liSonra} ${liOnce === liSonra ? '✔' : '✘'}`
  )
  if (h2Once !== h2Sonra || liOnce !== liSonra) sorun++
}

console.log('\n', sorun === 0 ? '✔ TEMİZ' : `⛔ ${sorun} sorun`)
await prisma.$disconnect()
process.exit(sorun === 0 ? 0 : 1)
