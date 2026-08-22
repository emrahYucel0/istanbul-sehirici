// scripts/yayina-hazir-mi.mjs
//
// YAYIN ÖNCESİ HAZIRLIK KONTROLÜ.
//
// Duman testinden farkı: duman testi "kod çalışıyor mu" diye bakar, bu betik
// "İÇERİK ve AYARLAR eksik mi" diye bakar. İkisi farklı hata sınıfı — site
// teknik olarak kusursuz çalışırken logosu, analitiği ve gerçek yorumu
// olmayabilir. Öyle bir site yayına çıkarsa hata vermez, sadece iş yapmaz.
//
//   node --env-file=.env scripts/yayina-hazir-mi.mjs
//
// ENGEL = düzeltilmeden yayına çıkılmamalı
// UYARI = çıkılabilir ama ilk hafta içinde kapatılmalı
// BİLGİ = farkında ol yeter
import { existsSync } from 'node:fs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../prisma/generated/client/client.ts'

const p = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

const bulgular = []
const ekle = (seviye, baslik, detay, nerede) =>
  bulgular.push({ seviye, baslik, detay, nerede })

const bos = (v) => v === null || v === undefined || String(v).trim() === ''

// ── 1) Site ayarları ───────────────────────────────────────────────────────
const ayar = await p.siteSettings.findFirst()
if (!ayar) {
  ekle('ENGEL', 'Site Ayarları kaydı yok', 'Marka adı, telefon, adres hiçbiri yok.', 'Admin > Site Ayarları')
} else {
  const zorunlu = {
    brandName: 'Marka adı',
    phone: 'Telefon',
    email: 'E-posta',
    address: 'Adres',
  }
  for (const [alan, ad] of Object.entries(zorunlu)) {
    if (bos(ayar[alan])) ekle('ENGEL', `${ad} boş`, 'İletişim bilgisi olmadan dönüşüm olmaz.', 'Admin > Site Ayarları')
  }

  if (bos(ayar.logo)) ekle('UYARI', 'Logo yüklenmemiş', 'Marka adı metin olarak gösteriliyor.', 'Admin > Site Ayarları')
  if (bos(ayar.ogImage))
    ekle('UYARI', 'Paylaşım görseli (ogImage) yok', 'WhatsApp/Facebook paylaşımlarında görselsiz kart çıkar.', 'Admin > Site Ayarları')
  if (bos(ayar.googleAnalyticsId))
    ekle('UYARI', 'Google Analytics kimliği yok', 'Yayın sonrası hangi sayfanın çalıştığını ölçemezsiniz.', 'Admin > Site Ayarları')
  if (ayar.latitude == null || ayar.longitude == null)
    ekle('UYARI', 'Konum koordinatı girilmemiş', 'Yapısal veride `geo` alanı üretilmiyor; yerel aramada işletme kartını zayıflatır.', 'Admin > Site Ayarları > Google İşletme Bilgileri')
  if (bos(ayar.priceRange))
    ekle('BİLGİ', 'Fiyat aralığı girilmemiş', 'Şemadaki `priceRange` alanı boş kalıyor.', 'Admin > Site Ayarları')

  // Yer tutucu metin canlıya çıkmasın
  const yerTutucu = /^(site açıklaması|açıklama|lorem|örnek|test|deneme)$/i
  for (const alan of ['siteDescription', 'metaDescription', 'footerText', 'siteName']) {
    if (!bos(ayar[alan]) && yerTutucu.test(String(ayar[alan]).trim()))
      ekle('ENGEL', `${alan} yer tutucu metin içeriyor`, `"${ayar[alan]}"`, 'Admin > Site Ayarları')
  }
}

// ── 2) Yorumlar — yıldız puanını besliyorlar ───────────────────────────────
// Alan adı `customerName` — `name` DEĞİL. (Bu betiği yazarken tahmin edip
// hata aldım; şemayı okumadan alan adı varsaymanın bedeli hep aynı.)
const yorumlar = await p.testimonial.findMany({
  select: { customerName: true, comment: true, isActive: true, isApproved: true },
})
const yayindaki = yorumlar.filter((y) => y.isActive && y.isApproved !== false)
// `\b` KULLANILMIYOR — bilinçli. JavaScript'te `\b` sınırı `\w`ye dayalı
// ([A-Za-z0-9_]) ve "ö" bir `\w` karakteri değil; `/\börnek\b/` ifadesi
// "(örnek)" içindeki kelimeyi HİÇ yakalamıyor. İlk hâli böyleydi ve tam da
// uyarması gereken üç kaydı görmüyordu. Unicode harf sınırı doğru çalışıyor
// ve "Örnektepe Mahallesi" gibi meşru metinlerde yanlış alarm üretmiyor.
// (Aynı desen app/utils/yer-tutucu.ts içinde de var.)
const sahteDeseni = /(?<!\p{L})(örnek|ornek|test|lorem|ipsum|deneme)(?!\p{L})/iu
const sahte = yayindaki.filter(
  (y) => sahteDeseni.test(y.customerName || '') || sahteDeseni.test(y.comment || '')
)
if (sahte.length) {
  ekle(
    'ENGEL',
    `${sahte.length} örnek/test yorum yayında`,
    `Bu yorumlar arama sonucundaki yıldız puanını besliyor. Gerçek olmayan yorumu işaretlemek Google politika ihlalidir. — ${sahte.map((s) => s.customerName).join(', ')}`,
    'Admin > Müşteri Yorumları'
  )
}

// ── 3) Bölge içerikleri ────────────────────────────────────────────────────
const bolgeler = await p.region.findMany({
  select: { slug: true, isActive: true, metaDescription: true, priceFactors: true, image: true, priceFactorsImage: true },
})
const aktif = bolgeler.filter((b) => b.isActive)
const metasiz = aktif.filter((b) => bos(b.metaDescription))
if (metasiz.length) ekle('UYARI', `${metasiz.length} yayındaki bölgede arama açıklaması yok`, metasiz.slice(0, 5).map((b) => b.slug).join(', '), 'Admin > Bölgeler')

const dizi = (v) => (Array.isArray(v) ? v : [])
const faktorsuz = aktif.filter((b) => dizi(b.priceFactors).length === 0)
if (faktorsuz.length)
  ekle('BİLGİ', `${faktorsuz.length} bölgede fiyat faktörleri tablosu boş`, 'En düşük emek / en yüksek getirili içerik boşluğu.', 'Admin > Bölgeler')

// Aynı görseli paylaşan bölgeler — paylaşım kartlarını tekdüze yapar
const gorselSayaci = new Map()
for (const b of aktif) if (!bos(b.image)) gorselSayaci.set(b.image, (gorselSayaci.get(b.image) || 0) + 1)
const enCokPaylasilan = [...gorselSayaci.entries()].sort((a, b) => b[1] - a[1])[0]
if (enCokPaylasilan && enCokPaylasilan[1] > 5)
  ekle('UYARI', `${enCokPaylasilan[1]} bölge aynı görseli kullanıyor`, `${enCokPaylasilan[0]} — sosyal paylaşımda hepsi aynı resmi gösterir.`, 'Admin > Bölgeler')

// ── 4) Hizmet ve yazılar ───────────────────────────────────────────────────
const hizmetler = await p.service.findMany({ select: { slug: true, title: true, metaDescription: true, imagePath: true } })
const hizmetEksik = hizmetler.filter((h) => h.slug && bos(h.metaDescription))
if (hizmetEksik.length) ekle('UYARI', `${hizmetEksik.length} hizmette arama açıklaması yok`, hizmetEksik.map((h) => h.title).join(', '), 'Admin > Hizmetler')

const yazilar = await p.post.findMany({ select: { slug: true, title: true, metaDescription: true, image: true } })
const yaziEksik = yazilar.filter((y) => bos(y.metaDescription))
if (yaziEksik.length) ekle('UYARI', `${yaziEksik.length} yazıda arama açıklaması yok`, yaziEksik.map((y) => y.title).join(', '), 'Admin > Blog')

// ── 5) Politika metinleri — yasal zorunluluk ───────────────────────────────
const politikalar = await p.policyPage.findMany({ select: { slug: true, content: true, isActive: true } })
for (const slug of ['gizlilik-politikasi', 'kullanim-sartlari', 'cerez-politikasi']) {
  const kayit = politikalar.find((x) => x.slug === slug)
  if (!kayit) ekle('ENGEL', `${slug} metni yok`, 'KVKK kapsamında yayınlanması zorunlu.', 'Admin > Politika Metinleri')
  else if (!kayit.isActive) ekle('ENGEL', `${slug} yayında değil`, 'Yasal metin yayında olmalı.', 'Admin > Politika Metinleri')
  else if ((kayit.content || '').length < 500) ekle('ENGEL', `${slug} içeriği çok kısa`, `${(kayit.content || '').length} karakter.`, 'Admin > Politika Metinleri')
}

// ── 6) Ortam değişkenleri ──────────────────────────────────────────────────
const cevre = {
  DATABASE_URL: 'Veritabanı bağlantısı',
  AUTH_SECRET: 'Oturum jetonu imzalama anahtarı',
}
for (const [k, ad] of Object.entries(cevre)) {
  if (bos(process.env[k])) ekle('ENGEL', `${k} tanımsız`, ad, '.env')
}
// Yedisi de gerekli. Mail ayarı derlemeye GÖMÜLÜ DEĞİL, istek anında
// ortamdan okunuyor (server/mail/config.ts) — yani gömülü varsayılan yok,
// eksik kalan alan doğrudan "bildirim gitmiyor" demek.
for (const k of ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASSWORD', 'MAIL_FROM', 'MAIL_TO']) {
  if (bos(process.env[k])) ekle('UYARI', `${k} tanımsız`, 'Teklif formu kaydediliyor ama e-posta bildirimi gitmiyor.', '.env / hosting ortam değişkenleri')
}

// ── 7) Yönetici hesabı ─────────────────────────────────────────────────────
const yoneticiler = await p.user.count()
if (yoneticiler === 0) ekle('ENGEL', 'Yönetici hesabı yok', 'Panele giriş yapılamaz.', 'veritabanı')

// ── 8) Kırık görsel yolları ────────────────────────────────────────────────
// Veritabanındaki her yerel görsel adresinin diskte gerçekten karşılığı var mı?
// 71 bölge `/images/nakliye2.jpg` taşıyordu; dosya hiç yoktu, panelde alan dolu
// göründüğü için de fark edilmiyordu. Alan doluluğunu kontrol etmek yetmiyor,
// dosyanın VARLIĞINA bakmak gerekiyor.
//
// İki farklı kök var: panelden yüklenenler proje kökündeki `yuklemeler/`
// klasöründe (bkz. server/domain/files/files.service.ts → STORAGE_PATH),
// gerisi `public/` altında.
const gorselVarMi = (u) => {
  if (bos(u) || !String(u).startsWith('/')) return null // dış URL / boş → kapsam dışı
  const yol = String(u)
  return existsSync(yol.startsWith('/yuklemeler/') ? decodeURIComponent(yol.slice(1)) : `public${yol}`)
}

const gorselAlanlari = []
for (const b of bolgeler) {
  gorselAlanlari.push([`Bölge ${b.slug}`, 'görsel', b.image, 'Admin > Bölgeler'])
  gorselAlanlari.push([`Bölge ${b.slug}`, 'fiyat faktörü görseli', b.priceFactorsImage, 'Admin > Bölgeler'])
}
for (const y of yazilar) gorselAlanlari.push([`Yazı ${y.slug}`, 'görsel', y.image, 'Admin > Blog'])
for (const h of hizmetler) gorselAlanlari.push([`Hizmet ${h.title}`, 'görsel', h.imagePath, 'Admin > Hizmetler'])
if (ayar) {
  gorselAlanlari.push(['Site ayarları', 'logo', ayar.logo, 'Admin > Site Ayarları'])
  gorselAlanlari.push(['Site ayarları', 'favicon', ayar.favicon, 'Admin > Site Ayarları'])
  gorselAlanlari.push(['Site ayarları', 'paylaşım görseli', ayar.ogImage, 'Admin > Site Ayarları'])
}
for (const kahraman of await p.heroPage.findMany({ select: { id: true, image: true, backgroundImage: true } })) {
  gorselAlanlari.push([`Hero #${kahraman.id}`, 'görsel', kahraman.image, 'Admin > Ana Sayfa'])
  gorselAlanlari.push([`Hero #${kahraman.id}`, 'arka plan', kahraman.backgroundImage, 'Admin > Ana Sayfa'])
}

const kirikGorseller = gorselAlanlari.filter(([, , url]) => gorselVarMi(url) === false)
if (kirikGorseller.length) {
  ekle(
    'ENGEL',
    `${kirikGorseller.length} görsel adresi diskte yok`,
    kirikGorseller.slice(0, 6).map(([nerede, alan, url]) => `${nerede} ${alan}: ${url}`).join(' · ') +
      (kirikGorseller.length > 6 ? ` · +${kirikGorseller.length - 6} tane daha` : ''),
    'Admin (ilgili bölüm)'
  )
}

// ── Rapor ──────────────────────────────────────────────────────────────────
const sirala = { 'ENGEL': 0, 'UYARI': 1, 'BİLGİ': 2 }
bulgular.sort((a, b) => sirala[a.seviye] - sirala[b.seviye])

const say = (s) => bulgular.filter((b) => b.seviye === s).length
console.log(`\nYAYIN HAZIRLIK RAPORU — ${say('ENGEL')} engel · ${say('UYARI')} uyarı · ${say('BİLGİ')} bilgi\n`)

for (const b of bulgular) {
  console.log(`  [${b.seviye}] ${b.baslik}`)
  console.log(`          ${b.detay}`)
  console.log(`          → ${b.nerede}\n`)
}

if (!bulgular.length) console.log('  Eksik bulunamadı.\n')

console.log(
  say('ENGEL') === 0
    ? '✔ Yayına çıkılabilir.'
    : `✗ ${say('ENGEL')} engel var — yayına çıkmadan önce kapatılmalı.`
)

await p.$disconnect()
process.exit(say('ENGEL') === 0 ? 0 : 1)
