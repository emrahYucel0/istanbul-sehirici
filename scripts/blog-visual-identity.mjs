// BLOG GÖRSEL KİMLİK GEÇİŞİ (M13B + M13C) — 10/10 kapak
//
// ─────────────────────────────────────────────────────────────────────
// NEDEN BU TUR VAR
//
// On blog kapağının TAMAMI evenakliyatevden.com'da da kullanılıyordu.
// M11B içeriği ayrıştırmıştı, M11B2 başlıkları; görseller son kalan
// ortak katmandı. Bu tur onu da kapatıyor: on kapağın hiçbiri artık eski
// domainle paylaşılmıyor.
//
// M13'te #1'in kapağı zaten bir kez değişmişti (tabletteki sahte teklif
// ekranı ve ₺12.750 yüzünden). O onarım ayrı bir scriptte duruyor
// (`blog-asset-repair.mjs`) ve YEDEĞİ EZİLMİYOR — bu scriptin kendi
// anlık görüntüsü var ve M13B ÖNCESİ hâli saklıyor, yani #1 için
// dar-sokaklar görselini. İkisi zincir hâlinde geri alınabiliyor:
//   önce  blog-visual-identity.mjs --geri   (M13B öncesine)
//   sonra blog-asset-repair.mjs   --geri   (M13 öncesine)
//
// ─────────────────────────────────────────────────────────────────────
// EŞLEME DOSYA ADIYLA DEĞİL, GÖRSELE BAKARAK YAPILDI
//
// İki dosya adı yanıltıcıydı ve tahminle yazılsaydı yanlış olurdu:
//
//   `nakliyat-blog-tasinma-oncesi-gorseli`  adı #2'yi çağırıyor ama
//        içeriği TAŞINACAK / BAĞIŞLANACAK / DEPOLANACAK / ÇIKARILACAK,
//        yani #11.
//   `nakliyat-blog-plan-gorseli`            adı genel ama içeriği
//        4 HAFTA → 3 HAFTA → 2 HAFTA → SON HAFTA, yani #2.
//
// M13C'DE ALTI KAPAK YENİLENDİ (#3, #11, #12, #13, #14, #15). Kullanıcı
// panelden yeni sürümleri yükledi; aşağıdaki yollar o gerçek dosyalar.
// Kapanan üç sorun:
//   #13  ekip tişörtündeki uydurma "İSTANBUL TAŞIMACILIK" markası
//   #14  etiketsiz 01–05 adımlar ve `⋮⋮⋮` yer tutucuları
//   #15  mobilde okunamayan 21 satırlık üç sütunlu liste
// Ayrıca #11/#12'nin site paleti dışındaki doygun renkleri ve dört 3:2
// kaynağın merkez kırpmada yarım kalan alt şeridi de gitti: on kapağın
// dokuzu artık 1672x941 (16/9) ve %0 kırpmayla basılıyor.
//
// Dört alt metin bu turda yenilendi (#3, #12, #14, #15): hepsi hâlâ ESKİ
// görselleri tarif ediyordu — örneğin #15'in alt metni artık var olmayan
// bir listeden söz ediyordu.
//
// ─────────────────────────────────────────────────────────────────────
// SADECE image / imageAlt
//
// slug, title, content, excerpt, metaTitle, metaDescription, publishedAt,
// isActive — HİÇBİRİ. Alan listesi aşağıda kilitli.
//
// ÖLÇÜMDE ÇIKAN: kayıtlar bu tur başlamadan ÖNCE zaten yeni kaynaklara
// geçirilmişti (panelden). Değişmesi gereken asıl katman `imageAlt`'tı:
// onunun da alt metni hâlâ ESKİ fotoğrafları tarif ediyordu — örneğin #10
// üç aşamalı bir şema gösterirken alt metni "Ekiplerimiz çamaşır makinesi
// ve dolap taşırken" diyordu. Bu script iki alanı da tek yerde kilitliyor;
// `image` değerleri mevcut hâlle aynı olduğunda sessizce atlanıyor.
//
// KULLANIM
//   node --env-file=.env scripts/blog-visual-identity.mjs          (uygula)
//   node --env-file=.env scripts/blog-visual-identity.mjs --geri   (eskiye dön)
import { PrismaClient } from '../prisma/generated/client/client.ts'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

/** Tek seferlik anlık görüntü; .gitignore altında (`scripts/.*-onceki.json`). */
const YEDEK = 'scripts/.blog-visual-identity-onceki.json'

const ALANLAR = ['image', 'imageAlt']
/*
 * KAYDEDİLEN ADRES EN BÜYÜK VARYANTI GÖSTERİR — sağlayıcı sözleşmesi.
 *
 * `app/providers/statik.ts`: "adresteki sayı bir TAVAN; onun altındaki
 * basamaklar garanti var" ve merdiven `[...320/640/1024 < tavan, tavan]`
 * olarak kuruluyor. Yani 1024 yazılırsa 1536–1695 px'lik dosyalar HİÇ
 * servis edilmez ve 2× ekranda kapak gereksiz yere yumuşar. Her kaynak
 * kendi en büyük türeviyle yazılıyor.
 */
const Y = (ad, tavan) => `/yuklemeler/${ad}-${tavan}.webp`

const KAPAKLAR = {
  // 1 — hacim + bina erişimi + kamyon park mesafesi + özel eşya
  'evden-eve-nakliyat-fiyatlari-neye-gore-belirlenir': {
    image: Y('nakliyat-blog-tasinma-kosullari-bc5bd5', 1672),
    imageAlt:
      'Eşya hacmi, bina erişimi, kamyon park mesafesi ve özel eşyaları tek şemada gösteren teknik çizim',
  },
  // 2 — 4 hafta → 3 hafta → 2 hafta → son hafta
  'tasinma-oncesi-yapilacaklar-listesi': {
    image: Y('nakliyat-blog-plan-gorseli-518f26', 1695),
    imageAlt:
      'Dört haftadan son haftaya erişim, hacim, izin ve son kontrol adımlarını sıralayan taşınma planı şeması',
  },
  // 3 — gevşek kutu ↔ desteklenmiş kutu
  'kirilacak-esyalar-nasil-paketlenir': {
    image: Y('nakliyat-blog-kirilacak-esya-021f88', 1672),
    imageAlt:
      'Gevşek kutuda boşluk içinde duran bardak ile bölmeli kutuda sabitlenmiş kırılacakları yan yana koyan karşılaştırma',
  },
  // 4 — poliçe + teminat + muafiyet + hasar kaydı + kapsam
  'nakliyat-sigortasi-neyi-kapsar': {
    image: Y('nakliyat-blog-sigorta-gorseli-e7aff4', 1672),
    imageAlt:
      'Poliçe üzerinde teminat, muafiyet, hasar kaydı ve hizmete göre kapsam başlıklarının işaretlendiği şema',
  },
  // 10 — hazırlık → binadan çıkış → devreye alma
  'beyaz-esya-tasima-rehberi': {
    image: Y('nakliyat-blog-asama-gorseli-2cd8c5', 1607),
    imageAlt: 'Beyaz eşyanın hazırlık, binadan çıkış ve yeni adreste devreye alma aşamaları',
  },
  // 11 — taşınacak / bağışlanacak / depolanacak / çıkarılacak
  'tasinirken-esyalardan-nasil-kurtulunur': {
    image: Y('nakliyat-blog-esya-eleme-12c938', 1672),
    imageAlt:
      'Eşyaları taşınacak, bağışlanacak, depolanacak ve çıkarılacak diye dört gruba ayıran eleme şeması',
  },
  // 12 — zemin / ambalaj / dış cephe / ısınma
  'kis-aylarinda-tasinmak': {
    image: Y('nakliyat-blog-kisin-tasinmak-7df044', 1672),
    imageAlt:
      'Karlı Haliç kıyısında rampalı kamyona eşya yükleyen ekip; yanında zemin, ambalaj ve erişim başlıkları',
  },
  // 13 — hazırlık → taşıma günü → yeni eve geçiş
  'evcil-hayvanla-tasinmak': {
    image: Y('nakliyat-blog-evcil-dost-tasinma-93989c', 1672),
    imageAlt:
      'Hazırlık, taşıma günü ve yeni ev aşamalarında kedi ve köpeğin nerede durduğunu gösteren üç kare',
  },
  // 14 — sözleşme / hazırlık / fotoğraf kaydı / kontrol / teslim-iade
  'kirali-evden-cikarken-depozito': {
    image: Y('nakliyat-blog-depozito-teslim-c63763', 1672),
    imageAlt:
      'Anahtar teslimi sırasında fotoğraf, sayaç, anahtar ve tutanak maddeleri işaretlenmiş kontrol listesi',
  },
  // 15 — ne girer / ne girmez / yanınızda kalsın
  'tasinma-gunu-ilk-gece-kutusu': {
    image: Y('nakliyat-blog-ilk-gece-kutusu-74a8f5', 1672),
    imageAlt:
      'İlk saatlerde gereken eşyalarla dolu kutu; yanında kalacaklar ve kutuya girmeyecekler ayrı ayrı işaretli',
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
  console.log('\nOn kapak M13B öncesi hâline döndürüldü.')
} else {
  /*
   * ANLIK GÖRÜNTÜ BİR KEZ ALINIYOR.
   *
   * Dosya yoksa on kaydın O ANKİ image/imageAlt değerleri yazılıyor —
   * yani M13B öncesi hâl. Dosya varsa hiçbir alan EZİLMİYOR; script
   * ikinci kez çalıştırıldığında yedek ilk hâli korumaya devam ediyor.
   */
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
      console.log(`ATLANDI #${String(kayit.id).padStart(2)} ${slug} — kapak zaten güncel`)
      continue
    }
    await db.post.update({ where: { id: kayit.id }, data: yaz })
    console.log(
      `~  #${String(kayit.id).padStart(2)} ${slug.padEnd(50)} ` +
        `${String(girdi.eski.image || kayit.image).split('/').pop()} → ${String(yaz.image || kayit.image).split('/').pop()}`
    )
  }

  if (yedekDegisti) {
    writeFileSync(YEDEK, JSON.stringify(yedek, null, 1), 'utf8')
    const n = yedek.reduce((a, y) => a + Object.keys(y.eski).length, 0)
    console.log(`\nYedek: ${YEDEK} — ${yedek.length} kayıt / ${n} alan`)
  }
}

await db.$disconnect()
