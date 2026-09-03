// BLOG KAPAK ONARIMI (M13)
//
// ─────────────────────────────────────────────────────────────────────
// TEK KAYIT DEĞİŞİYOR: #1 — evden-eve-nakliyat-fiyatlari-neye-gore-belirlenir
//
// NEDEN KALDIRILDI
// Eski kapak (`nakliyat-fiyat-belirleme-gorseli-c696f1`) bir tabletin
// üzerinde OKUNABİLİR, KURGU bir teklif ekranı gösteriyordu:
//
//     Hacim:        22m²          ← hacim m³ ile ölçülür, birim yanlış
//     Mesafe (km):  450km
//     Kat:          4
//     Asansör:      Var (6/nolda) ← bozuk AI metni
//     Özel Eşya:    1 (Antika Belçigi)  ← bozuk AI metni
//     Toplam Fiyat: ₺12.750       ← SOMUT FİYAT
//
// En ağır kalem sonuncusu. Sitenin bütün içerik disiplini "taşıma fiyatı
// adres görülmeden belirlenemez" üzerine kurulu; M10 iddia taramasında
// fiyat ve süre taahhütleri tek tek metinden çıkarıldı. Kapakta duran
// somut bir toplam tutar, o disiplinle doğrudan çelişiyordu ve gerçek
// işletme verisi izlenimi veriyordu.
//
// Ayrıca kolilerin üzerinde ve poloda, sitenin gerçek markası OLMAYAN
// uydurma bir logo/isim izi vardı.
//
// YERİNE NE GELDİ VE NEDEN
// `istanbul-evden-eve-nakliyat-kamyon-dar-sokaklar-gorseli` — yazının
// konusunun kendisi: fiyatı belirleyen FİZİKSEL koşullar. Dar sokak, iki
// yanı park dolu yol, aracın yanaşabildiği nokta, eşyanın araca kadar
// elde taşındığı mesafe, apartman girişi. Görselde rakam yok, form yok,
// fiyat yok, firma logosu yok; okunabilir tek yazı gerçek bir apartman
// giriş tabelası ("DAİRE 1-8 GİRİŞ").
//
// TEKNİK: 1024x559 (1.83) — diğer sekiz kapakla aynı oran, 16/9 kırpması
// yok. 320/640/1024 türevlerinin üçü de mevcut, yani NuxtImg srcset
// üretimi ve LCP davranışı değişmiyor.
//
// ─────────────────────────────────────────────────────────────────────
// BU SCRIPT NE YAPMIYOR
//
// slug, title, content, excerpt, metaTitle, metaDescription — HİÇBİRİ.
// Yalnız `image` ve ona bağlı `imageAlt`.
//
// #12 (kış) ve #13 (evcil hayvan) kapakları da denetimde sınıf C çıktı
// ama BU SCRIPT ONLARA DOKUNMUYOR: havuzda uygun alternatif yok ve kötü
// bir görseli başka bir kötü görselle değiştirmek onarım değildir.
// Rapordaki "NEW ASSET REQUIRED" listesine bakın.
//
// ─────────────────────────────────────────────────────────────────────
// KULLANIM
//   node --env-file=.env scripts/blog-asset-repair.mjs          (uygula)
//   node --env-file=.env scripts/blog-asset-repair.mjs --geri   (eskiye dön)
import { PrismaClient } from '../prisma/generated/client/client.ts'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

/** Tek seferlik anlık görüntü; .gitignore altında (`scripts/.*-onceki.json`). */
const YEDEK = 'scripts/.blog-asset-repair-onceki.json'

const ALANLAR = ['image', 'imageAlt']

const KAPAKLAR = {
  'evden-eve-nakliyat-fiyatlari-neye-gore-belirlenir': {
    image: '/yuklemeler/istanbul-evden-eve-nakliyat-kamyon-dar-sokaklar-gorseli-49bbc3-1024.webp',
    // Alt metin görselin GERÇEKTEN gösterdiğini anlatıyor. Eski metin
    // ("Nakliyeci çeşitli kriterlere göre fiyat çalışması yapıyor") artık
    // ekranda olmayan bir sahneyi tarif ediyordu.
    imageAlt: 'Dar bir İstanbul sokağında park hâlindeki araçların arasından eşya taşıyan nakliye ekibi',
  },
}

// ─────────────────────────────────────────────────────────────────────
const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

if (process.argv.includes('--geri')) {
  if (!existsSync(YEDEK)) throw new Error(`Yedek yok: ${YEDEK}`)
  for (const k of JSON.parse(readFileSync(YEDEK, 'utf8'))) {
    await db.post.update({ where: { id: k.id }, data: k.eski })
    console.log(`geri  #${k.id} ${k.slug} — ${Object.keys(k.eski).join(', ')}`)
  }
  console.log('\nKapaklar M13 öncesi hâline döndürüldü.')
} else {
  // Yedek BİRİKEREK tamamlanıyor: var olan hiçbir alan ezilmiyor, yalnız
  // ilk kez değişen alanın ŞU ANKİ (yani M13 öncesi) değeri ekleniyor.
  const yedek = existsSync(YEDEK) ? JSON.parse(readFileSync(YEDEK, 'utf8')) : []
  let yedekDegisti = !existsSync(YEDEK)

  for (const [slug, yeni] of Object.entries(KAPAKLAR)) {
    const kayit = await db.post.findUnique({ where: { slug } })
    if (!kayit) throw new Error(`Kayıt bulunamadı: ${slug}`)

    let girdi = yedek.find((y) => y.slug === slug)
    if (!girdi) { girdi = { id: kayit.id, slug, eski: {} }; yedek.push(girdi); yedekDegisti = true }

    const yaz = {}
    for (const alan of ALANLAR) {
      if (yeni[alan] === undefined) continue
      if (kayit[alan] === yeni[alan]) continue // yeniden çalıştırmada atlanır
      if (!(alan in girdi.eski)) { girdi.eski[alan] = kayit[alan]; yedekDegisti = true }
      yaz[alan] = yeni[alan]
    }
    if (!Object.keys(yaz).length) {
      console.log(`ATLANDI #${kayit.id} ${slug} — kapak zaten güncel`)
      continue
    }
    await db.post.update({ where: { id: kayit.id }, data: yaz })
    console.log(`~  #${kayit.id} ${slug}`)
    for (const alan of Object.keys(yaz)) {
      console.log(`      ${alan}:`)
      console.log(`        eski: ${girdi.eski[alan]}`)
      console.log(`        yeni: ${yaz[alan]}`)
    }
  }

  if (yedekDegisti) {
    writeFileSync(YEDEK, JSON.stringify(yedek, null, 1), 'utf8')
    const n = yedek.reduce((a, y) => a + Object.keys(y.eski).length, 0)
    console.log(`\nYedek: ${YEDEK} — ${yedek.length} kayıt / ${n} alan`)
  }
}

await db.$disconnect()
