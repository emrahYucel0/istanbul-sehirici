// scripts/surum-geri-yukle.mjs
//
// SÜRÜM YEDEĞİNİ GERİ YÜKLER — VERİTABANI + GÖRSELLER BİRLİKTE.
//
// ═════════════════════════════════════════════════════════════════════════
// BU BETİK VERİTABANININ ÜZERİNE YAZAR.
//
// Bir yedeğin işe yarayıp yaramadığı, ancak geri yüklendiğinde belli olur.
// Yedekleme sistemlerinin en sinsi hatası, ihtiyaç duyulan güne kadar hiç
// denenmemiş olmalarıdır. Bu betik o denemeyi ucuz ve tekrarlanabilir
// yapıyor: BOŞ BİR TEST VERİTABANINA geri yükleyip sayımları künyeyle
// karşılaştırıyor.
//
// ─────────────────────────────────────────────────────────────────────────
// ÜÇ ÇİT
//
// 1. HEDEF AÇIKÇA VERİLİR. `--veritabani=` zorunlu; varsayılan yok.
//    "Yanlışlıkla canlıya yazdım" senaryosunun tek gerçek çaresi, hedefin
//    hiçbir zaman örtük olmamasıdır.
//
// 2. `DATABASE_URL`in gösterdiği veritabanına yazmak AYRI ONAY ister
//    (`--ustune-yaz`). Yani günlük geliştirme veritabanınızı bir tuş
//    hatasıyla ezemezsiniz.
//
// 3. VARSAYILAN KURU ÇALIŞTIRMA. `--uygula` olmadan hiçbir şey yazılmaz;
//    yalnız ne yapılacağı ve künyedeki sayımlar gösterilir.
//
// ─────────────────────────────────────────────────────────────────────────
// GÖRSELLER
//
// `--yuklemeler=<klasör>` verilirse arşiv oraya açılır. Verilmezse
// görseller ATLANIR ve bu açıkça yazılır — sessizce proje klasörünün
// üzerine açmak, testin yan etkisi olarak canlı görselleri değiştirmek
// olurdu.
//
// ─────────────────────────────────────────────────────────────────────────
// KULLANIM
//
//   # kuru çalıştırma
//   node --env-file=.env scripts/surum-geri-yukle.mjs \
//     --paket=yedekler/surum-2026-08-22T11-00-00 --veritabani=nakliyeDB_test
//
//   # uygula (test veritabanı + geçici görsel klasörü)
//   ... --uygula --yuklemeler=C:/temp/yuklemeler-test
//
// ÜRETİMDE: hedef veritabanı sunucudaki gerçek şema, `--ustune-yaz` ile.
// Öncesinde MUTLAKA o veritabanının kendi sürüm yedeği alınmış olmalı.
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { araciBul, baglantiyiCoz, baglantiBayraklari, parolaliOrtam } from './mysql-araclari.mjs'

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const arg = (ad) => process.argv.find((a) => a.startsWith(`--${ad}=`))?.split('=').slice(1).join('=')
const bayrak = (ad) => process.argv.includes(`--${ad}`)

const yaz = (...a) => console.log(...a)
const durdur = (m) => { console.error('\n⛔', m); process.exit(1) }

const paketArg = arg('paket')
const hedefDb = arg('veritabani')
const hedefYuklemeler = arg('yuklemeler')
const uygula = bayrak('uygula')
const ustuneYaz = bayrak('ustune-yaz')

if (!paketArg) durdur('--paket=<klasör> zorunlu.')
if (!hedefDb) durdur('--veritabani=<ad> zorunlu. Varsayılan hedef YOK; bu bilinçli.')

const paket = path.isAbsolute(paketArg) ? paketArg : path.join(KOK, paketArg)
const kunyeYolu = path.join(paket, 'surum.json')
if (!fs.existsSync(kunyeYolu)) durdur(`Künye yok: ${kunyeYolu}\n   Bu bir sürüm yedeği paketi değil.`)

const kunye = JSON.parse(fs.readFileSync(kunyeYolu, 'utf8'))
const sqlYolu = path.join(paket, kunye.sql.dosya)
const tarYolu = path.join(paket, kunye.yuklemeler.dosya)

yaz('═══ SÜRÜM GERİ YÜKLEME ═══', uygula ? '· UYGULANIYOR' : '· KURU ÇALIŞTIRMA')
yaz('  paket        :', path.relative(KOK, paket))
yaz('  alındığı an  :', kunye.tarih)
yaz('  git          :', kunye.git?.commit?.slice(0, 8) ?? '—', kunye.git?.temiz === false ? '(kirli ağaç)' : '')
yaz('  kaynak DB    :', kunye.veritabani)
yaz('  HEDEF DB     :', hedefDb)
yaz('  hedef görsel :', hedefYuklemeler || '(ATLANIYOR — --yuklemeler verilmedi)')

// ─────────────────────────────────────────── 1. BÜTÜNLÜK
yaz('\n─── 1. PAKET BÜTÜNLÜĞÜ ───')
const ozet = (yol) => createHash('sha256').update(fs.readFileSync(yol)).digest('hex')
for (const [ad, yol, beklenen] of [
  ['veritabani.sql', sqlYolu, kunye.sql.sha256],
  ['yuklemeler.tar.gz', tarYolu, kunye.yuklemeler.sha256],
]) {
  if (!fs.existsSync(yol)) durdur(`Eksik dosya: ${ad}`)
  const bulunan = ozet(yol)
  const tamam = bulunan === beklenen
  yaz(' ', tamam ? '✔' : '✘', ad.padEnd(20), tamam ? 'sha256 eşleşiyor' : `⛔ BOZUK\n     beklenen ${beklenen}\n     bulunan  ${bulunan}`)
  if (!tamam) durdur('Paket bozulmuş; geri yükleme yapılmadı.')
}

// ─────────────────────────────────────────── 2. ÇİTLER
yaz('\n─── 2. ÇİTLER ───')
let baglanti
try { baglanti = baglantiyiCoz(process.env.DATABASE_URL) } catch (e) { durdur(e.message) }

if (hedefDb === baglanti.veritabani && !ustuneYaz) {
  durdur(
    `Hedef, DATABASE_URL'deki veritabanının ta kendisi (${hedefDb}).\n` +
      '   Üzerine yazmak için --ustune-yaz bayrağı gerekli.\n' +
      '   Denemek için ayrı bir test veritabanı kullanın: --veritabani=' + baglanti.veritabani + '_test'
  )
}
yaz('  ✔ hedef açıkça verildi')
yaz(' ', hedefDb === baglanti.veritabani ? '⚠ hedef GELİŞTİRME VERİTABANI — --ustune-yaz onaylandı' : '✔ hedef ayrı bir veritabanı')

const mysql = araciBul('mysql', 'MYSQL_PATH')
if (!mysql) durdur('mysql istemcisi bulunamadı. MYSQL_PATH ortam değişkeniyle yolunu verin.')
yaz('  ✔ mysql istemcisi:', mysql)

yaz('\n─── 3. KÜNYEDEKİ SAYIMLAR ───')
for (const [t, n] of Object.entries(kunye.sayimlar)) yaz('    ', t.padEnd(22), n)

if (!uygula) {
  yaz('\nKuru çalıştırma. Geri yüklemek için: --uygula')
  process.exit(0)
}

// ─────────────────────────────────────────── 4. GERİ YÜKLEME
yaz('\n─── 4. VERİTABANI ───')
const calistir = (sql) =>
  spawnSync(mysql, [...baglantiBayraklari(baglanti), '-e', sql], {
    env: parolaliOrtam(baglanti),
    encoding: 'utf8',
  })

// Şema sıfırdan kuruluyor: eski tabloların kalıntısı, dökümde artık
// olmayan bir tabloyu "varmış" gibi göstererek yanlış bir başarı üretirdi.
const olustur = calistir(
  `DROP DATABASE IF EXISTS \`${hedefDb}\`; CREATE DATABASE \`${hedefDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
)
if (olustur.status !== 0) durdur('Veritabanı oluşturulamadı: ' + String(olustur.stderr || '').trim().slice(0, 300))
yaz('  ✔ şema sıfırdan oluşturuldu')

const ice = spawnSync(
  mysql,
  [...baglantiBayraklari(baglanti), hedefDb],
  { env: parolaliOrtam(baglanti), input: fs.readFileSync(sqlYolu, 'utf8'), encoding: 'utf8' }
)
if (ice.status !== 0) durdur('Import başarısız: ' + String(ice.stderr || '').trim().slice(0, 400))
yaz('  ✔ döküm içe aktarıldı')

// ─────────────────────────────────────────── 5. DOĞRULAMA
yaz('\n─── 5. DOĞRULAMA ───')
const sorgu = Object.keys(kunye.sayimlar)
  .map((t) => `SELECT '${t}' AS tablo, COUNT(*) AS adet FROM \`${t}\``)
  .join(' UNION ALL ')
const olcum = spawnSync(mysql, [...baglantiBayraklari(baglanti), hedefDb, '-N', '-B', '-e', sorgu], {
  env: parolaliOrtam(baglanti),
  encoding: 'utf8',
})
if (olcum.status !== 0) durdur('Sayım sorgusu başarısız: ' + String(olcum.stderr || '').trim().slice(0, 300))

const bulunan = Object.fromEntries(
  (olcum.stdout || '').trim().split('\n').filter(Boolean).map((s) => {
    const [t, n] = s.split('\t')
    return [t, Number(n)]
  })
)

let sapma = 0
for (const [t, beklenen] of Object.entries(kunye.sayimlar)) {
  const b = bulunan[t]
  const tamam = b === beklenen
  if (!tamam) sapma++
  yaz(' ', tamam ? '✔' : '✘', t.padEnd(22), String(beklenen).padStart(5), '→', String(b ?? '?').padStart(5))
}

// ─────────────────────────────────────────── 6. GÖRSELLER
let gorselSonuc = 'atlandı'
if (hedefYuklemeler) {
  yaz('\n─── 6. GÖRSELLER ───')
  const hedefKlasor = path.isAbsolute(hedefYuklemeler) ? hedefYuklemeler : path.join(KOK, hedefYuklemeler)
  fs.mkdirSync(hedefKlasor, { recursive: true })
  // Arşivin içinde `yuklemeler/` öneki var; `--strip-components=1` ile
  // dosyalar doğrudan hedef klasöre çıkıyor.
  const ac = spawnSync('tar', ['--force-local', '-xzf', tarYolu, '-C', hedefKlasor, '--strip-components=1'], { encoding: 'utf8' })
  if (ac.status !== 0) durdur('Arşiv açılamadı: ' + String(ac.stderr || '').trim().slice(0, 300))
  const acilan = fs.readdirSync(hedefKlasor).length
  const tamam = acilan === kunye.yuklemeler.adet
  yaz(' ', tamam ? '✔' : '✘', 'dosya', kunye.yuklemeler.adet, '→', acilan, '·', hedefKlasor)
  if (!tamam) sapma++
  gorselSonuc = `${acilan} dosya → ${hedefKlasor}`
} else {
  yaz('\n─── 6. GÖRSELLER ─── atlandı (--yuklemeler verilmedi)')
}

yaz('\n═══ SONUÇ ═══')
yaz('  veritabanı :', hedefDb)
yaz('  görseller  :', gorselSonuc)
yaz('  sapma      :', sapma, sapma === 0 ? '✔ künye ile birebir' : '⛔')
process.exit(sapma === 0 ? 0 : 1)
