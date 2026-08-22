/**
 * SAĞLIK UCU — dışarıdan "bu site ayakta mı" sorusunu sorulabilir kılar.
 *
 * NEDEN VAR
 * 14 Ağustos 2026'da site 503 verdi ve bunu kullanıcı fark etti; sistem
 * haber vermedi. Ne kadar süre kapalı kaldığını hâlâ bilmiyoruz. Bu uç,
 * ücretsiz bir dış izleme servisinin (UptimeRobot, Better Stack vb.)
 * dakikada bir yoklayıp düştüğü an e-posta/SMS atabilmesi için var.
 *
 * ANA SAYFAYI YOKLAMAK YETMEZ. Ana sayfa, veritabanı tamamen düşmüş olsa
 * bile önbellekten ya da kısmi veriyle 200 dönebilir. Bu uç veritabanına
 * GERÇEK bir sorgu atıyor; "web sunucusu ayakta ama veritabanı yok"
 * durumunu da yakalıyor. Sessiz kalan tam olarak o durumdu.
 *
 * DURUM KODU İZLEME İÇİN ANLAMLI:
 *   200 — her şey çalışıyor
 *   503 — veritabanına ulaşılamıyor  (izleme servisi burada alarm verir)
 *
 * GİZLİ BİLGİ SIZDIRMAZ. Kimlik doğrulaması yok (izleme servisleri
 * giriş yapamaz), o yüzden yanıt bilinçli olarak fakir: sürüm, bağlantı
 * dizesi, tablo adı, hata ayrıntısı YOK. Hata mesajı sunucu günlüğüne
 * yazılıyor, yanıta değil.
 */
import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const baslangic = Date.now()

  try {
    // ZAMAN SINIRI — Prisma'nın bağlantı havuzu, veritabanına ulaşamadığında
    // varsayılan olarak ~10 saniye bekliyor (ölçüldü: "pool timeout … after
    // 10009ms"). İzleme servisleri genelde bundan önce vazgeçip isteği
    // "zaman aşımı" sayar; o da "503 aldım" ile aynı şey değildir ve
    // grafikte sebebi belirsiz bir boşluk bırakır.
    //
    // Havuzun KENDİ zaman aşımını kısaltmıyoruz: yoğun anda sağlıklı ama
    // yavaş bir veritabanında sahte hata üretirdi. Sınır yalnızca bu uca
    // özgü — burada "3 saniyede cevap veremiyorsa zaten sorun var" doğru
    // bir kabul.
    const SINIR_MS = 3000
    await Promise.race([
      // En ucuz gerçek sorgu: bağlantıyı ve yetkiyi doğrular, tabloya
      // dokunmadığı için şema değişikliklerinden etkilenmez.
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reddet) =>
        setTimeout(() => reddet(new Error(`veritabanı ${SINIR_MS} ms içinde yanıt vermedi`)), SINIR_MS)
      ),
    ])

    return {
      status: 'ok',
      db: 'ok',
      // Ölçümü izleme servisi grafiğe döksün diye: veritabanı yavaşlamaya
      // başladığında düşmeden ÖNCE görünür.
      dbMs: Date.now() - baslangic,
    }
  } catch (error) {
    // Ayrıntı YALNIZCA günlüğe. Yanıtta dönerse bağlantı bilgisi sızabilir.
    console.error('[health] veritabanına ulaşılamıyor:', error)

    setResponseStatus(event, 503)
    return { status: 'error', db: 'down' }
  }
})
