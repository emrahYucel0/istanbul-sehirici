// OFİS (#76) + PAKETLEME (#79) — MİKRO POLISH VE FREEZE
//
// NEDEN KÖKLÜ REWRITE YOK
// M4 denetimi iki sayfayı da 8.5 verdi ve "FREEZE edilebilir" dedi: generic
// oran %15 ve %10, includes 9/10, FAQ 9/10. Gövde metinleri diğer dört
// sayfa 700–900 kelimeye çıktı diye UZATILMADI — bu iki hizmetin karar
// problemi daha dar ve mevcut metin onu zaten karşılıyor.
//
// ─────────────────────────────────────────────────────────────────────
// #76 OFİS
// ─────────────────────────────────────────────────────────────────────
//
// 1. subtitle — TEK GERÇEK İDDİA
//    "Mesai dışı planlama, İŞ KAYBI OLMADAN"
//    Bu bir SONUÇ sözü: taşınmanın işletmeye hiç kayıp yaşatmayacağını
//    taahhüt ediyor. Doğrulanamaz ve sayfanın kendi metniyle de çelişiyor
//    (FAQ 1: "büyük ofis ve depo taşımalarında iş hafta sonuna
//    yayılabiliyor").
//
//    İlk denemede "Mesai dışı ve hafta sonu planlama" yazıldı ve DİZİNDE
//    ÖLÇÜLDÜ: aynı satırda includes[1] "Mesai dışı ve hafta sonu çalışma
//    planı" olduğu için ifade birebir tekrar ediyordu, üstelik excerpt de
//    "mesai saatleri dışına planlanıyor" diyordu — bir satırda üç kez aynı
//    şey. Bunun yerine hizmetin İKİNCİ ekseni alındı: "Ekipman, arşiv ve
//    yeniden kurulum". Mesai dışı bilgisi kaybolmuyor; excerpt,
//    includes[1] ve FAQ 2 zaten taşıyor.
//
//    ⚠ BU ALAN /hizmetlerimiz DİZİNİNDE DE GÖRÜNÜYOR (ölçüldü). Dizinin
//    TASARIMI dondurulmuş; burada değişen tasarım değil, doğrulanmamış bir
//    ticari iddia. Raporda dizindeki satırın önce/sonra hâli açıkça
//    gösteriliyor.
//
// 2. YANLIŞ POZİTİFLER — DEĞİŞTİRİLMEDİ
//    · content "farkı hacim değil, KESİNTİ" → sayfanın tezinin ismi,
//      "kesin/kesinlikle" iddia sınıfı değil
//    · faq5 "KESİN rakam yerinde keşif sonrası netleşiyor" → kesinliği
//      keşfe erteliyor, vermiyor (M2'de zaten "yazılı veriliyor"dan
//      buraya çevrilmişti)
//
// 3. M4'te güçlü bulunan içeriklerin hiçbiri bozulmadı: kesinti tezi,
//    kabloların porta göre etiketlenmesi, BT sorumlusuyla kapatma-açma
//    sırası, mühürlü arşiv, plaza yük asansörü, OSB bildirimi, raf
//    düzenine göre kutulama.
//
// 4. "Zamanlama" paragrafına TEK CÜMLE eklendi. Yeni işletme bilgisi
//    DEĞİL: çalışma penceresini binanın izin verdiği saatlerin ve yük
//    asansörü sırasının daralttığı zaten sayfanın "Bina ve bölge izinleri"
//    bölümünde ve FAQ 2'de yazıyor. Cümle bu iki bilgiyi zamanlama
//    kararına bağlıyor — M4'ün "generic" bulduğu tek paragraf buydu.
//
// ─────────────────────────────────────────────────────────────────────
// #79 PAKETLEME
// ─────────────────────────────────────────────────────────────────────
//
// 1. CONTENT'E HİÇ DOKUNULMADI. M4'ün sınırda bulduğu "Etiketleme"
//    paragrafı incelendi: hangi oda, içerik ve ilk gün açılacak kutu
//    zaten anlatılıyor; kırılabilirlik işareti de "Kırılabilir eşya"
//    bölümünde ("ayrı işaretlenip araçta üst sıraya yerleştiriliyor").
//    Bilgi eksik değil, yalnız iki bölüme dağılmış. Sırf değişiklik
//    üretmek için metin yazılmadı.
//
// 2. YANLIŞ POZİTİF — DEĞİŞTİRİLMEDİ
//    content ve faq4'teki "içeriği YAZILIYOR" kutunun üstüne yazma fiili;
//    "yazılı teklif/sözleşme" iddia sınıfıyla ilgisi yok.
//
// 3. imageAlt'taki "ÖZENLE" reklam sıfatı çıktı.
//
// ─────────────────────────────────────────────────────────────────────
// İKİSİNDE DE DEĞİŞMEYEN
//   title / H1     bozulmuyor
//   metaTitle      M2'de kurulan niyet ayrımı korunuyor
//   excerpt        ÖLÇÜLDÜ: /hizmetlerimiz ve ana sayfa hizmet kartında
//                  görünüyor; içinde doğrulanmamış iddia yok, ellenmedi
//   description    herkese açık hiçbir yerde basılmıyor
//   includes/faqs  ikisinde de dokunulmadı (M4: 9/10 ve 9/10)
//   imagePath      iki görsel de semantik olarak uygun
//
// KULLANIM
//   node --env-file=.env scripts/ofis-paketleme-polish.mjs          (uygula)
//   node --env-file=.env scripts/ofis-paketleme-polish.mjs --geri   (eskiye dön)
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../prisma/generated/client/client.ts'

const YEDEK = 'scripts/.ofis-paketleme-onceki.json'

/** #76 "Zamanlama" paragrafı — tam dize eşleşmesi, kısmi değil. */
const OFIS_ZAMANLAMA_ESKI =
  '<p>Ofis taşımalarını çoğunlukla mesai bitiminden sonra ya da hafta sonu yapıyoruz; kurulum da aynı çalışma penceresine planlanıyor. Atölye ve fabrika taşımalarında ise plan vardiya değişimlerinin dışına kuruluyor.</p>'

const OFIS_ZAMANLAMA_YENI =
  '<p>Ofis taşımalarını çoğunlukla mesai bitiminden sonra ya da hafta sonu yapıyoruz; kurulum da aynı çalışma penceresine planlanıyor. Atölye ve fabrika taşımalarında ise plan vardiya değişimlerinin dışına kuruluyor. Pencereyi yalnız siz belirlemiyorsunuz: binanın izin verdiği giriş saatleri ve yük asansörü sırası da onu daraltabiliyor, o yüzden tarih ikisi birlikte konuşularak veriliyor.</p>'

const DEGISIKLIKLER = {
  'ofis-tasima': {
    subtitle: 'Ekipman, arşiv ve yeniden kurulum',
    metaDescription:
      'Ofis taşımada asıl problem hacim değil kesinti: çalışma penceresi, ekipman ve arşiv düzeni birlikte planlanıyor. İstanbul’da ofis taşıma nasıl kurgulanıyor.',
    imageAlt: 'Mesai sonrası ofiste monitör taşıyan ekip ve departman adına göre numaralanmış koliler',
    contentDegis: [OFIS_ZAMANLAMA_ESKI, OFIS_ZAMANLAMA_YENI],
  },
  'paketleme-hizmeti': {
    metaDescription:
      'Paketleme koliye koymak değil: koruma yöntemi eşyanın türüne göre değişiyor. Cam, kitap ve tekstil ayrı standartlarda, etiketleme açma sırasına göre.',
    imageAlt: 'Eldivenli eller mavi desenli vazoyu petek desenli kraft kâğıda sarıyor, arkada bantlanmış koli',
  },
}

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })
const bolum = await db.services.findFirst({ include: { services: true } })
if (!bolum) throw new Error('Services bölümü bulunamadı')

if (process.argv.includes('--geri')) {
  if (!existsSync(YEDEK)) throw new Error(`Yedek yok: ${YEDEK}`)
  for (const k of JSON.parse(readFileSync(YEDEK, 'utf8'))) {
    await db.service.update({ where: { id: k.id }, data: k.eski })
    console.log(`geri  #${k.id} ${k.slug} — ${Object.keys(k.eski).join(', ')}`)
  }
} else {
  const yedek = []
  for (const [slug, is] of Object.entries(DEGISIKLIKLER)) {
    const kayit = bolum.services.find((s) => s.slug === slug)
    if (!kayit) throw new Error(`#${slug} bulunamadı`)

    const eski = {}
    const yeni = {}
    for (const alan of ['subtitle', 'metaDescription', 'imageAlt']) {
      if (!is[alan]) continue
      eski[alan] = kayit[alan]
      yeni[alan] = is[alan]
      console.log(`~  #${kayit.id} ${slug} · ${alan}`)
    }
    if (is.contentDegis) {
      const [ara, yerine] = is.contentDegis
      const mevcut = String(kayit.content || '')
      if (!mevcut.includes(ara)) {
        console.log(`ATLANDI #${kayit.id} content: aranan paragraf bulunamadı`)
      } else {
        eski.content = kayit.content
        yeni.content = mevcut.replace(ara, yerine)
        console.log(`~  #${kayit.id} ${slug} · content (Zamanlama paragrafı)`)
      }
    }
    if (!Object.keys(yeni).length) continue
    yedek.push({ id: kayit.id, slug, eski })
    await db.service.update({ where: { id: kayit.id }, data: yeni })
  }

  if (!existsSync(YEDEK)) {
    writeFileSync(YEDEK, JSON.stringify(yedek, null, 1), 'utf8')
    console.log(`\nEski değerler ${YEDEK} içine yazıldı.`)
  } else {
    console.log(`\nYedek zaten var, korunuyor: ${YEDEK}`)
  }
  console.log('Geri almak için: node --env-file=.env scripts/ofis-paketleme-polish.mjs --geri')
}

await db.$disconnect()
