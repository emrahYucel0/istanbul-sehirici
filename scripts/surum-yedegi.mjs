// scripts/surum-yedegi.mjs
//
// SÜRÜM YEDEĞİ — VERİTABANI + YÜKLENEN GÖRSELLER, TEK PAKET.
//
// ═════════════════════════════════════════════════════════════════════════
// NEDEN AYRI BİR BETİK VAR
//
// `yedekle.mjs` yalnız veritabanını döküyor ve günlük cron için doğru araç:
// müşteri talepleri her gün değişiyor, görseller değişmiyor.
//
// Ama YAYIN ve GERİ DÖNÜŞ için tek başına yetmiyor. İkisi birbirine bağlı:
//
//   · `Region.image` = "/yuklemeler/kadikoy-…-1024.webp"
//   · O satır veritabanında, dosya diskte.
//
// Yalnız veritabanını geri yüklerseniz sayfalar kırık görsele işaret eder;
// yalnız dosyaları geri yüklerseniz kimse onları göstermez. Bu yüzden
// sürüm yedeği İKİSİNİ BİRLİKTE alıyor ve aralarındaki bağı bir künyeyle
// (`surum.json`) kanıtlıyor: geri yüklerken hangi dökümün hangi görsel
// arşiviyle eşleştiği tahmin edilmiyor.
//
// ─────────────────────────────────────────────────────────────────────────
// PAKETİN İÇİ
//
//   yedekler/surum-<damga>/
//     veritabani.sql        mysqldump --single-transaction
//     yuklemeler.tar.gz     yuklemeler/ klasörünün tamamı
//     surum.json            künye: tarih · git · sayımlar · sha256
//
// Künye bir "yorum" değil, GERİ YÜKLEME DOĞRULAMASININ girdisi:
// `surum-geri-yukle.mjs` restore sonrası sayımları buradaki değerlerle
// karşılaştırıyor. Eşleşmezse hata veriyor.
//
// ─────────────────────────────────────────────────────────────────────────
// KULLANIM
//
//   npm run surum-yedegi
//   npm run surum-yedegi -- --hedef=D:/yedek     (başka klasöre)
//
// Bu betik OKUR, silmez. Saklama temizliği `yedekle.mjs`in işi.
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { araciBul, baglantiyiCoz, baglantiBayraklari, parolaliOrtam } from './mysql-araclari.mjs'

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const YUKLEMELER = path.join(KOK, 'yuklemeler')

const arg = (ad) => process.argv.find((a) => a.startsWith(`--${ad}=`))?.split('=').slice(1).join('=')
const HEDEF_KOK = arg('hedef') || path.join(KOK, 'yedekler')

// GNU tar `C:\...` biçimini UZAK SUNUCU adresi sanıyor (`host:path`) ve
// "Cannot connect to C" diye düşüyor. `--force-local` yolu her zaman yerel
// dosya olarak okutuyor. Linux'ta zararsız, Windows'ta zorunlu.
const TAR_BAYRAK = ['--force-local']

const yaz = (...a) => console.log(...a)
const durdur = (m) => { console.error('\n⛔', m); process.exit(1) }

// ─────────────────────────────────────────── HAZIRLIK
let baglanti
try { baglanti = baglantiyiCoz(process.env.DATABASE_URL) } catch (e) { durdur(e.message + '\n   node --env-file=.env scripts/surum-yedegi.mjs') }

const mysqldump = araciBul('mysqldump', 'MYSQLDUMP_PATH')
if (!mysqldump) durdur('mysqldump bulunamadı. MYSQLDUMP_PATH ortam değişkeniyle yolunu verin.')

const damga = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const paket = path.join(HEDEF_KOK, `surum-${damga}`)
fs.mkdirSync(paket, { recursive: true })

yaz('═══ SÜRÜM YEDEĞİ ═══')
yaz('  veritabanı :', baglanti.veritabani, '@', baglanti.sunucu + ':' + baglanti.port)
yaz('  paket      :', path.relative(KOK, paket))

// ─────────────────────────────────────────── 1. VERİTABANI
const sqlYolu = path.join(paket, 'veritabani.sql')
const dump = spawnSync(
  mysqldump,
  [
    ...baglantiBayraklari(baglanti),
    '--single-transaction', // InnoDB'de kilitsiz tutarlı anlık görüntü
    '--routines',
    '--triggers',
    `--result-file=${sqlYolu}`,
    baglanti.veritabani,
  ],
  { env: parolaliOrtam(baglanti), encoding: 'utf8' }
)
if (dump.status !== 0) durdur('mysqldump başarısız: ' + String(dump.stderr || '').trim().slice(0, 400))

// TABLO ADI BÜYÜK/KÜÇÜK HARF DÜZELTMESİ.
//
// Windows'ta MySQL `lower_case_table_names=1` ile çalışıyor: tablolar diske
// küçük harfle yazılıyor ve dump da onları öyle döküyor. Linux sunucuda
// tablo adları büyük/küçük harfe DUYARLI, yani `region` diye oluşturulan
// tabloyu Prisma `Region` diye arayınca bulamıyor. Şemadaki yazıma
// çevriliyor. (`yedekle.mjs` aynı düzeltmeyi yapıyor.)
const sema = fs.readFileSync(path.join(KOK, 'prisma', 'schema.prisma'), 'utf8')
const modeller = [...sema.matchAll(/^model\s+([A-Za-z_]\w*)\s*\{/gm)].map((m) => m[1])
const harita = new Map(modeller.map((m) => [m.toLowerCase(), m]))
let duzeltilen = 0
const icerik = fs.readFileSync(sqlYolu, 'utf8').replace(/`([A-Za-z_]\w*)`/g, (tam, ad) => {
  const dogru = harita.get(ad.toLowerCase())
  if (!dogru || dogru === ad) return tam
  duzeltilen++
  return '`' + dogru + '`'
})
fs.writeFileSync(sqlYolu, icerik, 'utf8')

const sqlBoyut = fs.statSync(sqlYolu).size
if (sqlBoyut < 1024) durdur(`Döküm şüpheli derecede küçük (${sqlBoyut} bayt).`)
const tabloSayisi = (icerik.match(/CREATE TABLE/gi) || []).length
yaz('\n  ✔ veritabani.sql   ', (sqlBoyut / 1048576).toFixed(2), 'MB ·', tabloSayisi, 'tablo ·', duzeltilen, 'ad düzeltildi')

// ─────────────────────────────────────────── 2. YÜKLEMELER
const tarYolu = path.join(paket, 'yuklemeler.tar.gz')
let dosyaSayisi = 0
if (fs.existsSync(YUKLEMELER)) {
  dosyaSayisi = fs.readdirSync(YUKLEMELER).length
  // `-C KOK yuklemeler` — arşivin içinde MUTLAK yol değil, `yuklemeler/…`
  // göreli yolu duruyor; başka bir makinede açıldığında doğru yere çıkıyor.
  const tar = spawnSync('tar', [...TAR_BAYRAK, '-czf', tarYolu, '-C', KOK, 'yuklemeler'], { encoding: 'utf8' })
  if (tar.status !== 0) durdur('tar başarısız: ' + String(tar.stderr || '').trim().slice(0, 400))
} else {
  fs.writeFileSync(tarYolu, '')
  yaz('  UYARI: yuklemeler/ klasörü yok; boş arşiv yazıldı.')
}
const tarBoyut = fs.statSync(tarYolu).size

// Arşiv gerçekten okunabiliyor mu? Bozuk bir tar'ı ancak geri yüklerken
// fark etmek, en kötü anda fark etmektir.
const liste = spawnSync('tar', [...TAR_BAYRAK, '-tzf', tarYolu], { encoding: 'utf8' })
if (liste.status !== 0) durdur('Arşiv doğrulanamadı: ' + String(liste.stderr || '').trim().slice(0, 200))
const arsivGirdi = (liste.stdout || '').split('\n').filter((s) => s.trim() && !s.endsWith('/')).length
yaz('  ✔ yuklemeler.tar.gz', (tarBoyut / 1048576).toFixed(2), 'MB ·', arsivGirdi, 'dosya (diskte', dosyaSayisi + ')')
if (dosyaSayisi !== arsivGirdi) durdur(`Arşivdeki dosya sayısı diskle uyuşmuyor: ${arsivGirdi} ≠ ${dosyaSayisi}`)

// ─────────────────────────────────────────── 3. SAYIMLAR
// Künyedeki sayımlar dökümün İÇİNDEN okunuyor, ayrı bir veritabanı
// sorgusundan değil: geri yükleme sonrası karşılaştırılacak sayı,
// dökümün gerçekten taşıdığı sayı olmalı.
const satirSay = (tablo) => {
  const kalip = new RegExp('INSERT INTO `' + tablo + '` VALUES (.*);', 'g')
  let toplam = 0
  for (const m of icerik.matchAll(kalip)) toplam += (m[1].match(/\),\(/g) || []).length + 1
  return toplam
}
const SAYILACAK = [
  'Region', 'Neighborhood', 'Service', 'Post', 'HomeSection', 'HomeSectionItem',
  'InternalPageSection', 'InternalPageItem', 'FaqItem', 'ProcessStep',
  'Meta', 'PolicyPage', 'SiteSettings', 'StoredFile', 'Testimonial', 'User',
]
const sayimlar = Object.fromEntries(SAYILACAK.map((t) => [t, satirSay(t)]))
yaz('\n  künye sayımları:')
for (const [t, n] of Object.entries(sayimlar)) yaz('    ', t.padEnd(22), n)

// ─────────────────────────────────────────── 4. KÜNYE
const ozet = (yol) => createHash('sha256').update(fs.readFileSync(yol)).digest('hex')
const git = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: KOK, encoding: 'utf8' })
const gitDurum = spawnSync('git', ['status', '--porcelain'], { cwd: KOK, encoding: 'utf8' })

const kunye = {
  bicim: 1,
  tarih: new Date().toISOString(),
  veritabani: baglanti.veritabani,
  git: {
    commit: git.status === 0 ? git.stdout.trim() : null,
    temiz: gitDurum.status === 0 ? gitDurum.stdout.trim() === '' : null,
  },
  sql: { dosya: 'veritabani.sql', bayt: sqlBoyut, tablo: tabloSayisi, sha256: ozet(sqlYolu) },
  yuklemeler: { dosya: 'yuklemeler.tar.gz', bayt: tarBoyut, adet: arsivGirdi, sha256: ozet(tarYolu) },
  sayimlar,
}
fs.writeFileSync(path.join(paket, 'surum.json'), JSON.stringify(kunye, null, 2) + '\n')

yaz('\n  ✔ surum.json')
yaz('    git       :', kunye.git.commit?.slice(0, 8) ?? '—', kunye.git.temiz === false ? '(çalışma ağacı KİRLİ)' : '(temiz)')
yaz('    sql sha256:', kunye.sql.sha256.slice(0, 16) + '…')
yaz('    tar sha256:', kunye.yuklemeler.sha256.slice(0, 16) + '…')

yaz('\n═══ TAMAM ═══')
yaz('  paket:', paket)
yaz('  toplam:', ((sqlBoyut + tarBoyut) / 1048576).toFixed(2), 'MB')
yaz('\n  Geri yükleme:')
yaz('    node --env-file=.env scripts/surum-geri-yukle.mjs --paket=' + path.relative(KOK, paket).replace(/\\/g, '/'))
