// scripts/hero-alt-metni.mjs
//
// HERO ALT METNİNİ YENİ ARTWORK'E GÖRE DÜZELTİR.
//
// ═════════════════════════════════════════════════════════════════════════
// NEDEN BU BETİK VAR
//
// Hero görseli fotoğraftan TEKNİK ÇİZİME döndü, ama `imageAlt` eski
// fotoğrafı anlatmaya devam ediyordu:
//
//   "İstanbul manzarası önünde nakliye çalışanlarının kamyona yükleme
//    yapması"
//
// Ekranda böyle bir sahne YOK. Ekran okuyucu kullanan biri var olmayan bir
// fotoğrafın tarifini duyuyordu — erişilebilirlik açısından yanlış bilgi,
// arama motoru açısından da içerikle örtüşmeyen sinyal.
//
// Yeni metin çizimde GERÇEKTEN olanı anlatıyor: iki bina kesiti, aradaki
// araç ve numaralandırılmış beş adım. Süsleme yok, "görsel" ya da "resim"
// gibi gereksiz önek yok (ekran okuyucu zaten görsel olduğunu söylüyor).
//
// ALAN SAHİPLİĞİ PANELDE KALIYOR. Bu betik tek seferlik bir düzeltme;
// bundan sonrası panelden yönetilir. `--geri` eski değeri yazar.
//
// KULLANIM
//   node scripts/hero-alt-metni.mjs          (uygula)
//   node scripts/hero-alt-metni.mjs --geri   (eskiye dön)
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../prisma/generated/client/client.ts'

const YEDEK = 'scripts/.hero-alt-onceki.json'

const YENI =
  'İstanbul’da bir taşımanın teknik kesiti: solda asansörsüz eski bir ' +
  'apartmanın kat kat kesiti, sağda yük asansörlü modern bir blok, ' +
  'ikisinin arasında yükleme yapan bir nakliye aracı. Arka planda Boğaz ' +
  'silueti; ölçüm, paketleme, transfer, taşıma ve kurulum adımları ' +
  'birden beşe numaralandırılmış.'

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

const bolum = await db.homeSection.findFirst({ where: { sectionKey: 'hero' } })
if (!bolum) throw new Error("HomeSection('hero') bulunamadı")

if (process.argv.includes('--geri')) {
  if (!existsSync(YEDEK)) throw new Error(`${YEDEK} yok — geri alınacak değer kaydedilmemiş`)
  const { imageAlt } = JSON.parse(readFileSync(YEDEK, 'utf8'))
  await db.homeSection.update({ where: { id: bolum.id }, data: { imageAlt } })
  console.log('geri alındı:', imageAlt)
} else {
  writeFileSync(YEDEK, JSON.stringify({ id: bolum.id, imageAlt: bolum.imageAlt }, null, 2), 'utf8')
  await db.homeSection.update({ where: { id: bolum.id }, data: { imageAlt: YENI } })
  console.log('eski :', bolum.imageAlt)
  console.log('yeni :', YENI)
  console.log('yedek:', YEDEK)
}

await db.$disconnect()
