// prisma/ic-sayfa-tohum.mjs
//
// İÇ SAYFA EDİTORYAL İÇERİĞİ → VERİ TABANI.
//
// ─────────────────────────────────────────────────────────────────────────
// YÖN: BUGÜN CANLIDA OLAN V2 → DB. TERSİ DEĞİL.
//
// Buradaki metinlerin tamamı, bu tur başlarken bileşenlerin içinde duran
// metinlerin birebir kendisi. Eski markanın veri tabanındaki V1 içeriği
// public'e BAĞLANMIYOR. Sonuç: sayfa açıldığında görünen hiçbir şey
// değişmiyor; değişen tek şey metnin NEREDEN geldiği.
//
// ─────────────────────────────────────────────────────────────────────────
// YENİDEN ÇALIŞTIRILABİLİR (IDEMPOTENT)
//
// `pageKey + sectionKey` ile upsert; öğeler silinip yeniden yazılır.
// `--dogrula` ile çalıştırıldığında hiçbir şey yazmaz, ne yapacağını yazar.
//
// ─────────────────────────────────────────────────────────────────────────
// GÖRSEL YOLLARI OLDUĞU GİBİ TAŞINIYOR
//
// `/images/...` altındaki dosyalar kaynak kodun parçası; kopyalanmıyor,
// yeniden kodlanmıyor, `/yuklemeler/` içine taşınmıyor. Veri tabanına aynı
// adresle yazılıyorlar, yani herkese açık HTML'de tek bir karakter bile
// değişmiyor. Yönetici ileride kütüphaneden başka bir görsel seçtiğinde
// yerine `/yuklemeler/...` yazılacak.
import prisma from '../server/utils/prisma.ts'
import { IC_SAYFALAR } from '../shared/utils/ic-sayfa.ts'

const KURU = process.argv.includes('--dogrula')
const yaz = (s = '') => console.log(s)

// ═════════════════════════════════════════════════════════════════════════
// İÇERİK — bileşenlerden birebir alındı
// ═════════════════════════════════════════════════════════════════════════

const ICERIK = {
  hizmetler: {
    giris: {
      heading: 'Nakliyat hizmetlerimiz',
      lead: 'Taşımanın kapsamı adrese göre değişiyor: kimi işte yalnız araç ve ekip gerekiyor, kimi işte söküm, ambalajlama ya da depolama da devreye giriyor. Aşağıdaki yedi hizmet bu kapsamı parçalara ayırıyor.',
      imagePath: '/images/sahne-paketleme.webp',
      imageAlt:
        'Bir tablonun köşesine karton köşe koruması takılıyor; yanında balonlu naylon ve streç film rulosu',
    },
    dizin: { heading: 'Her taşıma aynı hizmet değil.' },
    birlikte: {
      heading: 'Çoğu taşımada tek hizmet yetmiyor.',
      lead: 'Hizmetler birbirinin alternatifi değil. Aşağıdaki üç durum, keşifte en sık karşımıza çıkan birleşimler.',
      items: [
        {
          label: 'ARA DÖNEM',
          title: 'Çıkış ve giriş tarihi tutmuyorsa',
          body: 'Evden eve taşıma ile depolama birlikte planlanıyor: eşya ambalajlı hâlde depoya giriyor, teslim gününde aynı ekiple yerleştiriliyor. Ambalaj iki kez açılmıyor.',
          note: 'Evden Eve Nakliyat  +  Eşya Depolama',
        },
        {
          label: 'ERİŞİM',
          title: 'Merdiven boşluğundan geçmeyen parça varsa',
          body: 'Taşımanın kendisi standart ilerlerken yalnız o parçalar için dış cephe asansörü kuruluyor. Keşifte hangi parçanın merdivenden geçmediği ölçülüyor.',
          note: 'Evden Eve Nakliyat  +  Asansörlü Nakliyat',
        },
        {
          label: 'İŞ SÜREKLİLİĞİ',
          title: 'Ofis ertesi sabah çalışır olmalıysa',
          body: 'Ofis taşıma mesai dışına planlanıyor, paketleme ise taşımadan önceki gün yapılıyor. Dosya ve elektronik ekipman numaralandırılıp aynı düzene kuruluyor.',
          note: 'Ofis ve İşyeri Taşıma  +  Paketleme ve Ambalajlama',
        },
      ],
    },
    sahne: {
      items: [
        {
          imagePath: '/images/sahne-sokum.webp',
          imageAlt:
            'Odada gardırop yerinde sökülüyor: bir kişi menteşeyi çıkarıyor, diğeri sökülen paneli battaniyeye taşıyor',
          body: 'Kapıdan geçmeyen parça yerinde sökülüyor.',
        },
        {
          imagePath: '/images/bleed-sabitleme.webp',
          imageAlt:
            'Kamyon kasasında battaniye ve streçle sarılmış koltuğu sabitleme kemeriyle bağlayan nakliyeci',
          body: 'İstif sırası varışta ineceği sıraya göre kuruluyor.',
        },
      ],
    },
  },

  bolgeler: {
    giris: {
      heading: "İstanbul'da hizmet bölgelerimiz",
      lead: "Taşıma planı yalnız mesafeye göre değişmiyor. İlçe, mahalle, sokak genişliği ve bina erişimi yöntemi doğrudan belirliyor. Aşağıda İstanbul'un iki yakası ve ilçeleri var; ilçe sayfasından mahallelere iniyorsunuz.",
    },
    dizin: {
      heading: 'İstanbul iki yakadır.',
      lead: 'Yakalar arası taşımada köprü güzergâhı ve geçiş süresi plana giriyor; yaka içinde kalan işte belirleyici olan sokak ve bina koşulu. İlçe satırlarının yanındaki adlar, kendi sayfası yayında olan mahalleler.',
    },
    aciklama: {
      heading: 'İlçe değişince plan neden değişiyor?',
      lead: 'İlçe sayfalarında o ilçenin yapı dokusu, sık çalıştığımız mahalleler ve oradan en çok taşındığımız güzergâhlar yazılı. Dördü de keşifte ölçülüyor ve teklifi doğrudan etkiliyor:',
    },
  },

  hakkimizda: {
    giris: {
      imagePath: '/images/sahne-kat.webp',
      imageAlt:
        'Eski bir apartmanın dönüşlü mermer merdiveninde, streçle sarılmış kanepeyi iki kişi elde indiriyor',
    },
    yontem: {
      note: 'KAPIDAN GEÇMEYEN PARÇA KEŞİFTE BELİRLENİYOR',
      imagePath: '/images/sahne-sokum.webp',
      imageAlt:
        'Odada gardırop yerinde sökülüyor: bir kişi menteşeyi çıkarıyor, diğeri sökülen paneli battaniyeye taşıyor',
    },
    saha: {
      heading: 'Keşifte ne kayda geçiyor?',
      lead: 'Keşif bir nezaket ziyareti değil, ölçüm. Aşağıdaki dördü her adreste aynı sırayla kaydediliyor ve teklifin dayanağı bunlar oluyor.',
      closing:
        'Keşifte çıkan kapsam yazıya dökülüyor: hangi işlerin dahil olduğu, hangi parçaların sökülüp kurulacağı, ambalaj malzemesinin kime ait olduğu. Kapsam değiştiğinde teklif de değişiyor — bu yüzden neyin dahil olduğu baştan tek tek yazılıyor. Taşıma sırasında doğabilecek sorumluluğun kapsamı ve sınırları da sözleşmede belirtiliyor.',
      items: [
        {
          label: 'EŞYA ENVANTERİ',
          body: 'Oda oda ne çıkacağı sayılıyor: kutulanacak eşya, sökülmesi gereken mobilya, beyaz eşya ve taşınmayacaklar ayrı ayrı.',
          title: 'Araç ölçüsü ve ekip sayısı buradan çıkıyor.',
        },
        {
          label: 'ERİŞİM ÖLÇÜSÜ',
          body: 'Kapı genişliği, merdiven sahanlığının dönüşü ve asansör kabininin iç ölçüsü not ediliyor; aracın binaya kaç metre yanaşabildiği de.',
          title: 'Hangi parçanın merdivenden, hangisinin cepheden ineceği belli oluyor.',
        },
        {
          label: 'ÖZEL PARÇA',
          body: 'Piyano, kasa, akvaryum, büyük ekran ve cam yüzeyli mobilya ayrı ele alınıyor; ambalajı ve taşıma yöntemi standart eşyadan farklı.',
          title: 'Ek malzeme ve ek personel ihtiyacı önceden görülüyor.',
        },
        {
          label: 'TAKVİM KISITI',
          body: 'Site yönetiminin verdiği giriş saati, ofisin çalışma düzeni ve iki adres arasındaki tarih boşluğu kayda giriyor.',
          title: 'Taşımanın hangi gün ve saatte başlayabileceğini bu belirliyor.',
        },
      ],
    },
    kapsam: {
      heading: 'Hangi işleri üstleniyoruz?',
      lead: 'Kapsam adrese göre değişse de üstlendiğimiz iş türleri sabit. Çoğu taşımada bunların ikisi ya da üçü birlikte planlanıyor.',
    },
    odak: {
      heading: 'Neden yalnız bir şehir?',
      lead: 'Bir şehri tanımak, adres listesine sahip olmak değil. Hangi sokakta aracın binaya yanaşamayacağını, hangi sitede giriş izninin bir gün önceden alındığını, hangi caddede öğleden sonra yükleme yapılamayacağını ancak orada tekrar tekrar çalışarak biliyorsunuz. Bu yüzden hizmet alanını genişletmek yerine derinleştirmeyi seçtik.'
    },
  },

  iletisim: {
    giris: {
      heading: 'Taşınma koşullarını birlikte netleştirelim',
      lead: 'Taşımanın planı iki adresin koşullarına göre kuruluyor. Bize ulaşmanın iki yolu var: doğrudan telefon ya da aşağıdaki form. İkisinde de aynı şeyleri soruyoruz — nereden nereye, hangi kat, ne kadar eşya ve hangi tarih.',
    },
    kanallar: {
      heading: 'Doğrudan ulaşmak isterseniz',
      lead: 'Telefon, tarihi yaklaşmış ve bir an önce yön arayan işler için doğru kanal. Kapsamı yazarak anlatmak isteyenler ya da çalışma saatleri dışında ulaşanlar için aşağıdaki form daha rahat: yazdıklarınız kayda giriyor ve keşif planlanırken önümüzde duruyor.',
    },
    form: {
      heading: 'Taşınmanızı kısaca anlatın',
      lead: 'Mesaj kutusuna aşağıdakileri yazarsanız keşif için doğru günü ve ekibi baştan ayırabiliyoruz. Bildiğiniz kadarı yeterli.',
      note: 'Formu gönderdiğinizde talebiniz kayda giriyor. Sonraki adım genellikle kısa bir telefon görüşmesi oluyor: adresleri ve tarihi teyit edip keşif için gün ayırıyoruz. Keşiften önce fiyat konuşulmuyor, çünkü plan görülmeden çıkmıyor.',
    },
  },

  fiyat: {
    giris: {
      heading: 'Taşıma koşullarını girin, ilk hesabı görün',
      lead: 'Bu araç altı bilgiyle bir aralık üretiyor: ev büyüklüğü, mesafe, iki adresin katı ve asansör durumu, paketleme ve depolama. Adresin kendi koşulları — sokak genişliği, aracın binaya yanaşması, asansör kabininin ölçüsü — hesaba girmiyor; onlar keşifte ölçülüyor.',
    },
    arac: { heading: 'Altı bilgi yeterli' },
    girenler: {
      heading: 'Aracın kullandığı altı girdi',
      lead: 'Yukarıdaki aralık yalnız bu altı bilgiden çıkıyor. Başka hiçbir değişken hesaba girmiyor.',
      items: [
        { label: 'EV BÜYÜKLÜĞÜ', body: 'Taban tutarı belirliyor. Araç hacmi ve ekip sayısı buradan çıkıyor.' },
        { label: 'MESAFE KADEMESİ', body: 'Şehir içi, komşu şehir, orta ve uzun mesafe için ayrı çarpan uygulanıyor.' },
        { label: 'ÇIKIŞ KATI VE ASANSÖR', body: 'Asansör varsa kat tutarı değiştirmiyor. Yoksa zemin ve 1. kat dışındaki her kat ekleniyor.' },
        { label: 'VARIŞ KATI VE ASANSÖR', body: 'Aynı kural varış adresi için de ayrıca işliyor.' },
        { label: 'PAKETLEME', body: 'Paketlemeyi ekip üstlenirse ara toplam bir çarpanla artıyor.' },
        { label: 'DEPOLAMA', body: 'Eşya ara dönemde depoda kalacaksa sabit bir tutar ekleniyor.' },
      ],
    },
    disarida: {
      heading: 'Adreste ayrıca değerlendirilenler',
      lead: 'Aşağıdakiler tutarı gerçekten değiştiriyor ama bir formüle sığmıyor; hepsi keşifte ölçülüyor. Aralık ile kesinleşen tutar arasındaki fark çoğunlukla buradan doğuyor.',
      items: [
        { label: 'ARACIN YANAŞMA MESAFESİ', body: 'Aracın binaya kaç metre yaklaşabildiği, sokağın tek yön ya da park dolu olması.' },
        { label: 'ASANSÖR KABİNİ VE SAHANLIK', body: '"Asansör var" tek başına yetmiyor: kabinin bir koltuğu alıp almadığı ve merdiven sahanlığının dönüşü belirleyici.' },
        { label: 'SÖKÜLECEK MOBİLYA', body: 'Kapıdan geçmeyen gardırop ve köşe takımı yerinde sökülüyor; süre ve ekip buna göre değişiyor.' },
        { label: 'ÖZEL PARÇALAR', body: 'Piyano, kasa, akvaryum ve cam yüzeyli mobilya ayrı ambalaj ve yöntem gerektiriyor.' },
        { label: 'SİTE İZNİ VE SAAT KISITI', body: 'Araç kabul saati ve yük asansörü tahsisi taşımanın hangi gün yapılabileceğini belirliyor.' },
        { label: 'DIŞ CEPHE ASANSÖRÜ', body: 'Merdivenden geçmeyen parçalar için kuruluyor; ihtiyacı ancak yerinde görülünce belli oluyor.' },
      ],
    },
    sonraki: {
      heading: 'Aralıktan sonra ne oluyor?',
      lead: 'Aralık bir başlangıç noktası: taşınmanın hangi büyüklükte bir iş olduğunu gösteriyor, tutarı bağlamıyor. Sıradaki adım iki adresin koşullarını konuşmak — kat ve asansör bilgisini zaten girdiniz, geriye sokak erişimi, sökülecek parçalar ve tarih kalıyor.',
    },
  },

  blog: {
    giris: {
      heading: 'Taşınmayı daha iyi planlamak için notlar',
      lead: 'Sahada en çok karşılaştığımız sorulara yazıyla verilmiş cevaplar: taşınma öncesi hazırlık, paketleme, fiyatı neyin belirlediği, sigortanın kapsamı ve taşınma gününün kendisi.',
    },
  },
}

// ═════════════════════════════════════════════════════════════════════════

const bosla = (v) => (v === undefined || v === null || String(v).trim() === '' ? null : String(v).trim())

async function calis() {
  yaz('\n══ İÇ SAYFA İÇERİĞİ ══')

  // SÖZLEŞME DENETİMİ — tohum, kapalı kümenin dışına çıkamaz.
  for (const [sayfa, bolumler] of Object.entries(ICERIK)) {
    if (!IC_SAYFALAR[sayfa]) throw new Error(`Sözleşmede olmayan sayfa: ${sayfa}`)
    for (const [bolum, veri] of Object.entries(bolumler)) {
      const tanim = IC_SAYFALAR[sayfa].bolumler[bolum]
      if (!tanim) throw new Error(`Sözleşmede olmayan bölüm: ${sayfa}/${bolum}`)
      const ogeSayisi = (veri.items ?? []).length
      if (ogeSayisi !== tanim.ogeSayisi) {
        throw new Error(
          `${sayfa}/${bolum}: sözleşme ${tanim.ogeSayisi} öğe istiyor, tohumda ${ogeSayisi} var`
        )
      }
    }
  }

  for (const [sayfa, bolumler] of Object.entries(ICERIK)) {
    yaz(`\n── ${IC_SAYFALAR[sayfa].ad} (${IC_SAYFALAR[sayfa].yol})`)
    for (const [bolum, veri] of Object.entries(bolumler)) {
      const mevcut = await prisma.internalPageSection.findUnique({
        where: { pageKey_sectionKey: { pageKey: sayfa, sectionKey: bolum } },
      })
      const eylem = mevcut ? 'güncellenecek' : 'oluşturulacak'
      const ogeSayisi = (veri.items ?? []).length
      yaz(`   ${bolum.padEnd(12)} ${eylem.padEnd(14)} ${ogeSayisi} öğe`)

      if (KURU) continue

      const govde = {
        heading: bosla(veri.heading),
        lead: bosla(veri.lead),
        note: bosla(veri.note),
        closing: bosla(veri.closing),
        imagePath: bosla(veri.imagePath),
        imageAlt: bosla(veri.imageAlt),
      }

      await prisma.$transaction(async (tx) => {
        const kayit = await tx.internalPageSection.upsert({
          where: { pageKey_sectionKey: { pageKey: sayfa, sectionKey: bolum } },
          create: { pageKey: sayfa, sectionKey: bolum, ...govde },
          update: govde,
        })
        await tx.internalPageItem.deleteMany({ where: { sectionId: kayit.id } })
        if (ogeSayisi) {
          await tx.internalPageItem.createMany({
            data: (veri.items ?? []).map((o, i) => ({
              label: bosla(o.label),
              title: bosla(o.title),
              body: bosla(o.body),
              note: bosla(o.note),
              imagePath: bosla(o.imagePath),
              imageAlt: bosla(o.imageAlt),
              order: i,
              sectionId: kayit.id,
            })),
          })
        }
      })
    }
  }

  yaz(KURU ? '\nDoğrulama bitti — hiçbir şey yazılmadı.' : '\nTamam.')
  await prisma.$disconnect()
}

calis().catch(async (e) => {
  console.error('HATA: ' + e.message)
  await prisma.$disconnect()
  process.exit(1)
})
