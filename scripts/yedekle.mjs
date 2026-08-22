/**
 * VERİTABANI YEDEĞİ
 *
 *     node scripts/yedekle.mjs                  → yedekler/ altına zaman damgalı dump
 *     node scripts/yedekle.mjs C:\hedef\klasor  → başka bir klasöre
 *
 * Neden var: bu sitede müşteri talepleri (ContactLead) tutulacak — kaybı telafi
 * edilemez. Şu anki tek güvence MySQL binlog'u ve o 30 günlük, üstelik sunucu
 * yapılandırmasına bağlı. Yayına çıkmadan önce düzenli, dosya bazlı yedek şart.
 *
 * Bağlantı bilgisi DATABASE_URL'den okunuyor; parola mysqldump'a komut satırı
 * argümanı olarak DEĞİL, ortam değişkeniyle (MYSQL_PWD) geçiliyor — argüman
 * olarak verilseydi süreç listesinde (`ps`, Görev Yöneticisi) açıkta görünürdü.
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, statSync, readdirSync, unlinkSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const KOK = join(dirname(fileURLToPath(import.meta.url)), '..')
const HEDEF = process.argv[2] || join(KOK, 'yedekler')

/** Kaç günden eski yedekler silinsin (disk şişmesin). */
const SAKLAMA_GUN = 30

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL tanımlı değil. Komutu şöyle çalıştırın:\n  node --env-file=.env scripts/yedekle.mjs')
  process.exit(1)
}

let baglanti
try {
  baglanti = new URL(url)
} catch {
  console.error('DATABASE_URL çözümlenemedi.')
  process.exit(1)
}

const veritabani = baglanti.pathname.replace(/^\//, '')
const kullanici = decodeURIComponent(baglanti.username)
const parola = decodeURIComponent(baglanti.password)
const sunucu = baglanti.hostname
const port = baglanti.port || '3306'

// mysqldump PATH'te olmayabilir; bilinen kurulum yolları da denenir.
const ADAYLAR = [
  process.env.MYSQLDUMP_PATH,
  'mysqldump',
  'C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe',
  'C:/xampp/mysql/bin/mysqldump.exe',
  '/usr/bin/mysqldump',
].filter(Boolean)

mkdirSync(HEDEF, { recursive: true })

const damga = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const dosya = join(HEDEF, `${veritabani}-${damga}.sql`)

let sonuc = null
let kullanilan = null
for (const aday of ADAYLAR) {
  sonuc = spawnSync(
    aday,
    [
      `--host=${sunucu}`,
      `--port=${port}`,
      `--user=${kullanici}`,
      '--single-transaction',   // InnoDB'de tabloları kilitlemeden tutarlı anlık görüntü
      '--routines',
      '--triggers',
      '--default-character-set=utf8mb4',
      `--result-file=${dosya}`,
      veritabani,
    ],
    { env: { ...process.env, MYSQL_PWD: parola }, encoding: 'utf8' }
  )
  if (!sonuc.error) { kullanilan = aday; break }
}

if (!kullanilan) {
  console.error('mysqldump bulunamadı. MYSQLDUMP_PATH ortam değişkeniyle yolunu verin.')
  process.exit(1)
}

if (sonuc.status !== 0) {
  console.error('Yedekleme başarısız:', (sonuc.stderr || '').trim().slice(0, 400))
  process.exit(1)
}

const boyut = statSync(dosya).size
if (boyut < 1024) {
  // Boş/kırık bir dump sessizce "başarılı" görünebilir; bu kontrol onu yakalar.
  console.error(`Yedek şüpheli derecede küçük (${boyut} bayt) — kontrol edin: ${dosya}`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// TABLO ADLARINI TAŞINABİLİR HÂLE GETİR
//
// Windows'ta MySQL `lower_case_table_names=1` ile çalışıyor: tablolar diske
// KÜÇÜK harfle yazılıyor (`aboutsection`) ve mysqldump da onları öyle döküyor.
// Prisma ise şemadaki adı kullanıyor (`AboutSection`).
//
// Windows'ta bu sorun çıkarmaz çünkü MySQL sorguyu da küçültüp eşleştirir.
// Ama Linux'ta varsayılan `lower_case_table_names=0`, yani büyük/küçük harf
// AYRIMI vardır. Bu dump olduğu gibi bir Linux sunucuya yüklenirse Prisma
// `AboutSection` arar, veritabanında `aboutsection` bulunur ve site komple
// çalışmaz — üstelik hata "tablo yok" diye geleceği için sebebi bulmak zordur.
//
// Bu yüzden dump'taki tablo adları şemadaki kanonik yazımlarına çevriliyor.
// Yalnızca ŞEMADA TANIMLI model adlarıyla eşleşen tanımlayıcılar değiştirilir;
// veri içeriğine dokunulmaz.
//
// SUNUCUDA ŞEMA DOSYASI YOKTUR ve bu normaldir: dağıtım paketi yalnızca
// `.output` ve `scripts/` taşıyor. Zaten bu düzeltme yalnızca Windows'ta
// alınan bir dump'ı Linux'a taşırken gerekiyor; Linux'ta alınan dump'ta
// tablo adları hâlihazırda doğru. O yüzden dosya yoksa SESSİZCE atlanıyor —
// aksi hâlde günlük cron her gün anlamsız bir uyarı basardı.
const semaYolu = join(KOK, 'prisma', 'schema.prisma')
let duzeltilen = 0
if (existsSync(semaYolu)) try {
  const sema = readFileSync(semaYolu, 'utf8')
  const modeller = [...sema.matchAll(/^model\s+([A-Za-z_]\w*)\s*\{/gm)].map((m) => m[1])
  const harita = new Map(modeller.map((m) => [m.toLowerCase(), m]))

  let icerik = readFileSync(dosya, 'utf8')
  icerik = icerik.replace(/`([A-Za-z_]\w*)`/g, (tam, ad) => {
    const dogru = harita.get(ad.toLowerCase())
    if (!dogru || dogru === ad) return tam
    duzeltilen++
    return '`' + dogru + '`'
  })
  writeFileSync(dosya, icerik, 'utf8')
} catch (e) {
  console.warn('  UYARI: tablo adları taşınabilir hâle getirilemedi:', e.message)
}

console.log(`✔ Yedek alındı: ${dosya}`)
console.log(`  boyut: ${(statSync(dosya).size / 1048576).toFixed(2)} MB`)
if (duzeltilen) {
  console.log(`  ${duzeltilen} tablo adı şemadaki yazımına çevrildi (Linux uyumu)`)
}

// Eski yedekleri temizle
const sinir = Date.now() - SAKLAMA_GUN * 24 * 60 * 60 * 1000
let silinen = 0
for (const ad of readdirSync(HEDEF)) {
  if (!ad.endsWith('.sql')) continue
  const yol = join(HEDEF, ad)
  if (statSync(yol).mtimeMs < sinir) { unlinkSync(yol); silinen++ }
}
if (silinen) console.log(`  ${SAKLAMA_GUN} günden eski ${silinen} yedek silindi`)

const toplam = readdirSync(HEDEF).filter((a) => a.endsWith('.sql')).length
console.log(`  klasördeki yedek sayısı: ${toplam}`)
