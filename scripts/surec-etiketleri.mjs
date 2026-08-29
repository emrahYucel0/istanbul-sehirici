// SÜREÇ ADIM ETİKETLERİ — tek seferlik içerik düzeltmesi.
//
// NEDEN
// Beş adımın etiketi ekranda adımın ADI olarak okunuyor ve künye dilinin
// parçası. İki tanesi adımın gerçekte yaptığı işi karşılamıyordu:
//
//   03  "SÖKÜM VE YÜKLEME"  →  yükleme aslında 04'ün işi; bu adım
//                              sökümü ve taşımaya hazırlığı anlatıyor.
//   04  "KAMYON"            →  araç bir nesne, adım ise bir operasyon:
//                              yükleme ve taşıma.
//
// Ayrıca 02'deki tekil "Hizmet kapsamımız" bağlantısı kaldırılıyor: beş
// adımdan yalnız birinde CTA olması ritmi bozuyordu, sayfanın kendi
// kapanışında zaten aynı yere giden bir çağrı var.
//
// ETİKETLER KODA GİRMİYOR. Değer `ProcessStep.label` alanında; panelden
// düzenlenebilir olmaya devam ediyor. Bu betik yalnız mevcut kayıtları
// güncelliyor — yeni model, yeni alan, toplu yeniden yazım yok.
//
// KULLANIM
//   node --env-file=.env scripts/surec-etiketleri.mjs          (uygula)
//   node --env-file=.env scripts/surec-etiketleri.mjs --geri   (eskiye dön)
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../prisma/generated/client/client.ts'

const YEDEK = 'scripts/.surec-etiket-onceki.json'

/** order → yeni değerler. Yalnız DEĞİŞENLER yazılı. */
const YENI = {
  1: { linkLabel: null, linkHref: null },
  2: { label: 'SÖKÜM & HAZIRLIK' },
  3: { label: 'YÜKLEME & TAŞIMA' },
}

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

const bolum = await db.processSection.findFirst({
  include: { steps: { orderBy: { order: 'asc' } } },
})
if (!bolum) throw new Error('ProcessSection bulunamadı')

const geri = process.argv.includes('--geri')

if (geri) {
  if (!existsSync(YEDEK)) throw new Error(`Yedek yok: ${YEDEK}`)
  const onceki = JSON.parse(readFileSync(YEDEK, 'utf8'))
  for (const k of onceki) {
    await db.processStep.update({
      where: { id: k.id },
      data: { label: k.label, linkLabel: k.linkLabel, linkHref: k.linkHref },
    })
    console.log(`↩︎  #${k.id}  etiket: ${k.label}  bağlantı: ${k.linkLabel ?? '—'}`)
  }
  console.log('\nEski değerler geri yüklendi.')
} else {
  const yedek = []
  for (const adim of bolum.steps) {
    const yeni = YENI[adim.order]
    if (!yeni) continue
    yedek.push({
      id: adim.id,
      label: adim.label,
      linkLabel: adim.linkLabel,
      linkHref: adim.linkHref,
    })
    await db.processStep.update({ where: { id: adim.id }, data: yeni })
    const ne = Object.entries(yeni)
      .map(([a, d]) => `${a}: ${d === null ? '—' : d}`)
      .join('  ')
    console.log(`✔  #${adim.id} (sıra ${adim.order})  ${ne}`)
  }
  writeFileSync(YEDEK, JSON.stringify(yedek, null, 1), 'utf8')
  console.log(`\nEski değerler ${YEDEK} içine yazıldı.`)
  console.log('Geri almak için: node --env-file=.env scripts/surec-etiketleri.mjs --geri')
}

await db.$disconnect()
