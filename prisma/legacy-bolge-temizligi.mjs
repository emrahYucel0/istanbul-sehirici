// prisma/legacy-bolge-temizligi.mjs
//
// İSTANBUL DIŞI BÖLGE KAYITLARINI VE YALNIZ ONLARA AİT GÖRSELLERİ SİLER.
//
// ═════════════════════════════════════════════════════════════════════════
// BU BETİK VERİ SİLİYOR. GERİ ALINAMAZ.
//
// Emeklilik betiği (`legacy-bolge-emeklilik.mjs`) kaydı yayından çekiyordu
// ama saklıyordu. Bu betik onun yerine geçmiyor, ONDAN SONRA geliyor:
// işletme kararı "site İstanbul-only" olduğu için kayıtların kendisi de
// kalkıyor.
//
// ─────────────────────────────────────────────────────────────────────────
// NE SİLİNİYOR
//
//   Region satırı:  istanbulIlcesiMi(kayıt) === false
//                && slug !== ISTANBUL_IL_SLUG
//
// Yayın durumuna BAKILMIYOR — pasif olanlar da gidiyor, çünkü karar
// "yayından kaldır" değil "kapsam dışı".
//
// ─────────────────────────────────────────────────────────────────────────
// NE SİLİNMİYOR
//
//   · 39 İstanbul ilçesi
//   · özel `istanbul` kaydı (adresi `/`'a yönlendiriliyor)
//   · Neighborhood kayıtları — hiçbiri bu kümeye bağlı DEĞİL, ve betik
//     bunu silmeden ÖNCE ölçüp kanıtlıyor. Bir tane bile bağlıysa DURUYOR.
//   · `/images/...` altındaki statik varlıklar — kütüphanenin sahibi
//     olmadığı, kaynak kodla gelen dosyalar
//   · Birden fazla yerde kullanılan `/yuklemeler` görselleri
//
// ─────────────────────────────────────────────────────────────────────────
// GÖRSEL SİLME KURALI — KANIT ZORUNLU
//
// Bir mantıksal görsel ancak şu üç koşulun ÜÇÜ birden sağlanırsa siliniyor:
//
//   1. `/yuklemeler/` altında (yönetilen depo)
//   2. Bugün en az bir silinecek bölge tarafından kullanılıyor
//   3. Silme sonrası referans sayısı SIFIR — yani ne kalan bölgelerde,
//      ne mahallede, ne hizmette, ne yazıda, ne ana sayfada, ne iç
//      sayfada, ne süreç adımında, ne site ayarlarında, ne yorumda geçiyor
//
// Referans kümesi M7'de kurulan kütükten (`media.registry.ts`) geliyor;
// ikinci bir tarama yazılmadı. Varyantlar (`-320`, `-640`…) mantıksal ada
// göre gruplanıyor, yani bir görselin küçük boyu "kullanılmıyor" sanılıp
// tek başına silinemiyor.
//
// ─────────────────────────────────────────────────────────────────────────
// KULLANIM
//
//   node --env-file=.env prisma/legacy-bolge-temizligi.mjs           (kuru çalıştırma)
//   node --env-file=.env prisma/legacy-bolge-temizligi.mjs --uygula
//
// `--uygula` yedek ister: `yedekler/` içinde son 24 saatte alınmış bir
// döküm yoksa çalışmayı reddeder.
import fs from 'node:fs'
import path from 'node:path'
import prisma from '../server/utils/prisma.ts'
import { istanbulIlcesiMi, ISTANBUL_IL_SLUG } from '../shared/utils/istanbul.ts'
import { referansHaritasi, mantiksalAd, yoldanAd, YUKLEME_ONEKI } from '../server/domain/files/media.registry.ts'

const uygula = process.argv.includes('--uygula')
const KOK = process.cwd()
const DEPO = path.join(KOK, 'yuklemeler')

const yaz = (...a) => console.log(...a)
const baslik = (m) => yaz(`\n═══ ${m} ═══`)

// ─────────────────────────────────────────── 0. YEDEK KONTROLÜ
baslik('0. YEDEK')
const yedekKlasoru = path.join(KOK, 'yedekler')
const yedekler = fs.existsSync(yedekKlasoru)
  ? fs.readdirSync(yedekKlasoru).filter((a) => a.endsWith('.sql')).map((a) => ({ a, m: fs.statSync(path.join(yedekKlasoru, a)).mtimeMs }))
  : []
yedekler.sort((x, y) => y.m - x.m)
const sonYedek = yedekler[0]
const yas = sonYedek ? (Date.now() - sonYedek.m) / 3600000 : Infinity
yaz('  son yedek     :', sonYedek?.a ?? '(YOK)')
yaz('  yaşı          :', Number.isFinite(yas) ? `${yas.toFixed(1)} saat` : '—')
const yedekTaze = Number.isFinite(yas) && yas < 24

// ─────────────────────────────────────────── 1. SİLİNECEK KÜME
baslik('1. SİLİNECEK KÜME')
const hepsi = await prisma.region.findMany({
  select: { id: true, slug: true, title: true, cities: true, isActive: true, image: true, priceFactorsImage: true },
})
const ilceler = hepsi.filter(istanbulIlcesiMi)
const ilKaydi = hepsi.filter((r) => r.slug === ISTANBUL_IL_SLUG)
const hedef = hepsi
  .filter((r) => !istanbulIlcesiMi(r) && r.slug !== ISTANBUL_IL_SLUG)
  .sort((a, b) => a.slug.localeCompare(b.slug))

yaz('  Region toplam :', hepsi.length)
yaz('  KORUNAN       :', ilceler.length, 'İstanbul ilçesi +', ilKaydi.length, `özel \`${ISTANBUL_IL_SLUG}\``)
yaz('  SİLİNECEK     :', hedef.length, `(${hedef.filter((r) => r.isActive).length} aktif · ${hedef.filter((r) => !r.isActive).length} pasif)`)

// ─────────────────────────────────────────── 2. YABANCI ANAHTAR
baslik('2. YABANCI ANAHTAR — Neighborhood.districtId (onDelete: Cascade)')
const hedefIdler = hedef.map((r) => r.id)
const bagliMahalle = await prisma.neighborhood.findMany({
  where: { districtId: { in: hedefIdler } },
  select: { id: true, slug: true, canonicalPath: true, isActive: true, districtId: true },
})
yaz('  silinecek kayıtlara bağlı mahalle:', bagliMahalle.length)
if (bagliMahalle.length) {
  yaz('  ⚠ CASCADE bu mahalleleri de silerdi:')
  for (const m of bagliMahalle.slice(0, 20)) yaz('     ', m.canonicalPath, m.isActive ? '(AKTİF)' : '(pasif)')
}
const toplamMahalle = await prisma.neighborhood.count()
const ilceyeBagli = await prisma.neighborhood.count({ where: { districtId: { in: ilceler.map((r) => r.id) } } })
yaz('  Neighborhood toplam:', toplamMahalle, '| İstanbul ilçelerine bağlı:', ilceyeBagli)

// Region'a başka FK var mı? Şema taranıyor — elle liste tutulmuyor.
const sema = fs.readFileSync(path.join(KOK, 'prisma', 'schema.prisma'), 'utf8')
const fkSatirlari = sema.split('\n').filter((s) => /@relation\([^)]*references:\s*\[id\]/.test(s) && /Region/.test(s))
yaz('  şemada Region\'a işaret eden ilişki:', fkSatirlari.length)
for (const s of fkSatirlari) yaz('     ', s.trim().slice(0, 110))

// ─────────────────────────────────────────── 3. MEDYA
baslik('3. MEDYA REFERANSI')
const harita = await referansHaritasi()
yaz('  kütükteki referanslı mantıksal görsel:', harita.size)

/** Silinecek bölgelerin kullandığı mantıksal görseller. */
const hedefGorselleri = new Map() // anahtar → [ 'slug (alan)' ]
for (const r of hedef) {
  for (const [alan, yol] of [['bölge görseli', r.image], ['fiyat faktörü görseli', r.priceFactorsImage]]) {
    const y = String(yol ?? '').trim()
    if (!y || !y.startsWith(YUKLEME_ONEKI)) continue
    const anahtar = mantiksalAd(yoldanAd(y))
    if (!hedefGorselleri.has(anahtar)) hedefGorselleri.set(anahtar, [])
    hedefGorselleri.get(anahtar).push(`${r.slug} (${alan})`)
  }
}
yaz('  silinecek bölgelerin kullandığı yönetilen görsel:', hedefGorselleri.size)

// /images altındaki statik varlıklar ayrı sayılıyor — dokunulmuyor.
const statikKullanim = hedef.filter((r) =>
  [r.image, r.priceFactorsImage].some((y) => String(y ?? '').startsWith('/images/'))
).length
yaz('  bunlardan /images (statik, DOKUNULMUYOR) kullanan bölge:', statikKullanim)

const silinecekGorsel = []
const korunacakGorsel = []
for (const [anahtar, sahipler] of hedefGorselleri) {
  const tumReferanslar = harita.get(anahtar) ?? []
  // Silme sonrası kalacak referanslar: silinecek bölgelere ait OLMAYANLAR.
  const hedefSluglari = new Set(hedef.map((r) => r.slug))
  const kalan = tumReferanslar.filter((r) => !(r.tur === 'Bölge' && hedefSluglari.has(r.etiket)))
  if (kalan.length === 0) silinecekGorsel.push({ anahtar, sahipler, toplam: tumReferanslar.length })
  else korunacakGorsel.push({ anahtar, kalan: kalan.map((r) => `${r.tur}: ${r.etiket} (${r.alan})`) })
}
yaz('  → silme sonrası SIFIR referanslı:', silinecekGorsel.length)
yaz('  → başka yerde de kullanılıyor, KORUNUYOR:', korunacakGorsel.length)
for (const k of korunacakGorsel.slice(0, 10)) yaz('     ·', k.anahtar, '←', k.kalan.slice(0, 3).join(' | '))

// Silinecek görsellerin diskteki varyantları
const diskDosyalari = fs.existsSync(DEPO) ? fs.readdirSync(DEPO) : []
const silinecekDosyalar = []
for (const g of silinecekGorsel) {
  const varyantlar = diskDosyalari.filter((d) => mantiksalAd(d) === g.anahtar)
  silinecekDosyalar.push({ ...g, varyantlar })
}
const dosyaSayisi = silinecekDosyalar.reduce((a, g) => a + g.varyantlar.length, 0)
const satirSayisi = await prisma.storedFile.count({
  where: { OR: silinecekGorsel.map((g) => ({ storedName: { startsWith: g.anahtar } })) },
}).catch(() => -1)
yaz('  silinecek disk dosyası (varyant dahil):', dosyaSayisi)
yaz('  eşleşen StoredFile satırı            :', satirSayisi)

// ─────────────────────────────────────────── 4. KÖK AD ALANI
baslik('4. KÖK AD ALANI SONUCU')
yaz('  serbest kalacak kök adres:', hedef.length)
yaz('  örnek:', hedef.slice(0, 8).map((r) => '/' + r.slug).join(' '), '…')
yaz('  NOT: bu adresler bugüne kadar kayıt tarafından REZERVE tutuluyordu.')
yaz('       Silme sonrası yeni bir yazı/hizmet/mahalle onları alabilir.')
yaz('       Bu bir regresyon değil, kaydın silinmesinin doğrudan sonucu.')

// ─────────────────────────────────────────── 5. ÖZET
baslik('5. ÖZET')
yaz('  Region        ', hepsi.length, '→', hepsi.length - hedef.length)
yaz('  Neighborhood  ', toplamMahalle, '→', toplamMahalle - bagliMahalle.length)
yaz('  StoredFile    ', await prisma.storedFile.count(), '→', satirSayisi >= 0 ? (await prisma.storedFile.count()) - satirSayisi : '?')
yaz('  yuklemeler/   ', diskDosyalari.length, '→', diskDosyalari.length - dosyaSayisi)

const engeller = []
if (bagliMahalle.length) engeller.push(`${bagliMahalle.length} mahalle kaydı silinecek bölgelere bağlı — cascade veri kaybı`)
if (!yedekTaze) engeller.push('son 24 saatte alınmış yedek yok')
if (ilceler.length !== 39) engeller.push(`İstanbul ilçesi sayısı 39 değil (${ilceler.length})`)
if (ilKaydi.length !== 1) engeller.push(`özel \`istanbul\` kaydı tek değil (${ilKaydi.length})`)

if (engeller.length) {
  yaz('\n  ⛔ ENGEL:')
  for (const e of engeller) yaz('     ·', e)
} else {
  yaz('\n  ✔ engel yok')
}

if (!uygula) {
  yaz('\nKuru çalıştırma. Silmek için: --uygula')
  fs.writeFileSync(
    path.join(KOK, 'prisma', 'legacy-bolge-temizligi-plan.json'),
    JSON.stringify(
      {
        tarih: new Date().toISOString(),
        yedek: sonYedek?.a ?? null,
        silinecekBolge: hedef.map((r) => ({ id: r.id, slug: r.slug, title: r.title, isActive: r.isActive })),
        silinecekGorsel: silinecekDosyalar,
        korunanGorsel: korunacakGorsel,
        bagliMahalle: bagliMahalle.length,
      },
      null,
      1
    )
  )
  yaz('Plan yazıldı: prisma/legacy-bolge-temizligi-plan.json')
  await prisma.$disconnect()
  process.exit(engeller.length ? 1 : 0)
}

if (engeller.length) {
  yaz('\nEngeller var; silme YAPILMADI.')
  await prisma.$disconnect()
  process.exit(1)
}

// ─────────────────────────────────────────── 6. SİLME
baslik('6. SİLME')

// SIRA ÖNEMLİ: önce dosya, sonra StoredFile satırı, en son Region.
// Ters sırada bir hata olsaydı, referansı kalmayan dosyaları hangi kaydın
// tuttuğunu artık bilemezdik.
let silinenDosya = 0
const atlanan = []
for (const g of silinecekDosyalar) {
  for (const d of g.varyantlar) {
    const hedefYol = path.resolve(DEPO, d)
    // KÖK KİLİDİ — M7'deki silme yolunun aynısı.
    if (!hedefYol.startsWith(path.resolve(DEPO) + path.sep)) {
      atlanan.push(d)
      continue
    }
    try {
      fs.unlinkSync(hedefYol)
      silinenDosya++
    } catch (e) {
      atlanan.push(`${d}: ${e.code}`)
    }
  }
}
yaz('  silinen dosya:', silinenDosya, atlanan.length ? `| atlanan: ${atlanan.join(' ')}` : '')

const silinenSatir = silinecekGorsel.length
  ? await prisma.storedFile.deleteMany({
      where: { OR: silinecekGorsel.map((g) => ({ storedName: { startsWith: g.anahtar } })) },
    })
  : { count: 0 }
yaz('  silinen StoredFile satırı:', silinenSatir.count)

const silinenBolge = await prisma.region.deleteMany({ where: { id: { in: hedefIdler } } })
yaz('  silinen Region satırı:', silinenBolge.count)

// ─────────────────────────────────────────── 7. DOĞRULAMA
baslik('7. DOĞRULAMA')
const sonra = await prisma.region.findMany({ select: { slug: true, cities: true, isActive: true } })
const sonIlce = sonra.filter(istanbulIlcesiMi)
yaz('  Region        :', sonra.length, sonra.length === hepsi.length - hedef.length ? '✓' : '⚠')
yaz('  İstanbul ilçe :', sonIlce.length, sonIlce.length === 39 ? '✓' : '⚠', '| aktif:', sonIlce.filter((r) => r.isActive).length)
yaz('  özel istanbul :', sonra.filter((r) => r.slug === ISTANBUL_IL_SLUG).length, '✓')
yaz('  legacy kalan  :', sonra.filter((r) => !istanbulIlcesiMi(r) && r.slug !== ISTANBUL_IL_SLUG).length)
yaz('  Neighborhood  :', await prisma.neighborhood.count(), toplamMahalle === (await prisma.neighborhood.count()) ? '✓ (değişmedi)' : '⚠')
yaz('  StoredFile    :', await prisma.storedFile.count())
yaz('  yuklemeler/   :', fs.readdirSync(DEPO).length)

// Kalan kayıtların görselleri hâlâ diskte mi?
const kalanHarita = await referansHaritasi()
const kayipGorsel = []
for (const [anahtar, ref] of kalanHarita) {
  if (!fs.readdirSync(DEPO).some((d) => mantiksalAd(d) === anahtar)) {
    kayipGorsel.push(`${anahtar} ← ${ref.map((r) => r.tur + ':' + r.etiket).slice(0, 2).join(', ')}`)
  }
}
yaz('  referansı olup dosyası KAYIP görsel:', kayipGorsel.length, kayipGorsel.slice(0, 5).join(' | '))

fs.writeFileSync(
  path.join(KOK, 'prisma', 'legacy-bolge-temizligi-kayit.json'),
  JSON.stringify(
    {
      tarih: new Date().toISOString(),
      yedek: sonYedek.a,
      silinenBolge: silinenBolge.count,
      sluglar: hedef.map((r) => r.slug),
      silinenDosya,
      silinenStoredFile: silinenSatir.count,
      silinenGorselAnahtarlari: silinecekGorsel.map((g) => g.anahtar),
    },
    null,
    1
  )
)
yaz('\nSilme kaydı yazıldı: prisma/legacy-bolge-temizligi-kayit.json')
yaz('Geri alma YOK — geri dönüş yalnız yedekten:', sonYedek.a)

await prisma.$disconnect()
