// shared/utils/ic-sayfa.ts
//
// İÇ SAYFA BÖLÜM SÖZLEŞMESİ — TEK KAYNAK.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN `shared/`
//
// Aynı sözleşmeyi İKİ taraf okuyor: sunucu (hangi anahtar geçerli, bölüm kaç
// öğe taşır) ve panel (hangi alanlar için form basılacak). İki kopya
// yazılsaydı biri değiştiğinde diğeri sessizce eskir ve panel sunucunun
// reddedeceği bir form gösterirdi. Ana sayfa için aynı desen M4'te kuruldu
// (bkz. shared/utils/anasayfa.ts); burada iç sayfalar için tekrarlanıyor.
//
// ─────────────────────────────────────────────────────────────────────────
// BU SÖZLEŞME TASARIMIN DELİKLERİNİ TARİF EDİYOR, TASARIMI DEĞİL
//
// Bölüm sırası, yerleşim, künye numaraları, ızgara ve bileşen bileşimi
// KODDA. Burada yalnız "yöneticinin değiştirmesi beklenen metin ve
// görseller" listeleniyor.
//
// ANAHTAR KÜMELERİ KAPALI: yönetici yeni sayfa üretemiyor, yeni bölüm
// üretemiyor, bölüm sırasını değiştiremiyor, öğe sayısını değiştiremiyor.
//
// ─────────────────────────────────────────────────────────────────────────
// BURADA OLMAYANLAR — BİLEREK
//
//   künye numaraları ("01 / HİZMET DİZİNİ")   tasarım dili
//   yol izi (breadcrumb) etiketleri            rota haritası
//   form alan etiketleri ve doğrulama metni    arayüz metni
//   hata / boş durum cümleleri                 uygulama durumu
//   sayfa içi gezinme cümleleri                rota haritası
//
//   SEO başlığı ve açıklaması                  Meta(page) — TEK SAHİP
//   telefon / WhatsApp / adres / saatler       SiteSettings — TEK SAHİP
//   hizmet envanteri                           Service — TEK SAHİP
//   ilçe sayıları ve adları                    Region'dan TÜRETİLİYOR
//   fiyat katsayıları                          PriceEstimator — TEK SAHİP
//   yazı listesi                               Post — TEK SAHİP
//
// Bunların hiçbiri bu tabloya İKİNCİ KEZ yazılmıyor.

/** Kapalı sayfa anahtarı kümesi. */
export const IC_SAYFA_ANAHTARLARI = [
  'hizmetler',
  'bolgeler',
  'hakkimizda',
  'iletisim',
  'fiyat',
  'blog',
] as const

export type IcSayfaAnahtari = (typeof IC_SAYFA_ANAHTARLARI)[number]

export const icSayfaAnahtariMi = (deger: unknown): deger is IcSayfaAnahtari =>
  typeof deger === 'string' && (IC_SAYFA_ANAHTARLARI as readonly string[]).includes(deger)

/** Bölüm gövdesinde kullanılabilen adlandırılmış yuvalar. */
export type BolumAlani = 'heading' | 'lead' | 'note' | 'closing' | 'imagePath' | 'imageAlt'

// NOT — `closing` YALNIZ bir bölümde kullanılıyor (hakkimizda/saha).
// Diğer kapanış paragraflarının hepsi içinde sayfa içi bağlantı (`NuxtLink`)
// taşıyor; onları CMS'e almak ya bağlantıları düşürmek ya da panele HTML
// sokmak demek olurdu. İkisi de kontrollü CMS ilkesine aykırı, o yüzden
// bağlantılı cümleler ROTA HARİTASININ parçası sayılıp kodda bırakıldı.

/** Öğede kullanılabilen alanlar. */
export type OgeAlani = 'label' | 'title' | 'body' | 'note' | 'imagePath' | 'imageAlt'

export interface BolumTanimi {
  /** Panelde görünen ad. */
  ad: string
  /** Yöneticiye bölümün sayfadaki yerini hatırlatan tek cümle. */
  aciklama: string
  alanlar: BolumAlani[]
  etiketler: Partial<Record<BolumAlani, string>>
  /** SABİT öğe sayısı. `0` = bu bölümün öğesi yok. */
  ogeSayisi: number
  ogeAlanlari: OgeAlani[]
  ogeEtiketleri: Partial<Record<OgeAlani, string>>
  ogeBasligi?: string
}

export interface SayfaTanimi {
  ad: string
  /** Herkese açık adres — panelde "nereyi düzenliyorum" sorusunun cevabı. */
  yol: string
  aciklama: string
  /** Bölümler, SAYFADAKİ GERÇEK SIRAYLA. */
  bolumler: Record<string, BolumTanimi>
}

export const IC_SAYFALAR: Record<IcSayfaAnahtari, SayfaTanimi> = {
  hizmetler: {
    ad: 'Hizmetlerimiz',
    yol: '/hizmetlerimiz',
    aciklama:
      'Hizmet listesinin KENDİSİ burada değil — o Servisler ekranından geliyor. Burada yalnız sayfanın editoryal çerçevesi var.',
    bolumler: {
      giris: {
        ad: 'Giriş',
        aciklama: 'Sayfanın ilk ekranı: H1, giriş paragrafı ve büyük fotoğraf.',
        alanlar: ['heading', 'lead', 'imagePath', 'imageAlt'],
        etiketler: {
          heading: 'H1 başlık',
          lead: 'Giriş paragrafı',
          imagePath: 'Giriş fotoğrafı',
          imageAlt: 'Fotoğrafın alt metni',
        },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
      dizin: {
        ad: 'Hizmet dizini başlığı',
        aciklama: 'Yalnız başlık. Satırlar Servisler ekranından geliyor.',
        alanlar: ['heading'],
        etiketler: { heading: 'Başlık' },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
      birlikte: {
        ad: 'Hizmetler birlikte çalışır',
        aciklama: 'Üç örnek durum. Kapanış cümlesi sayfa içi bağlantı taşıdığı için kodda kaldı.',
        alanlar: ['heading', 'lead'],
        etiketler: {
          heading: 'Başlık',
          lead: 'Giriş paragrafı',
        },
        ogeSayisi: 3,
        ogeAlanlari: ['label', 'title', 'body', 'note'],
        ogeEtiketleri: {
          label: 'Durum etiketi',
          title: 'Başlık',
          body: 'Açıklama',
          note: 'Birleşen hizmetler (artı işaretiyle ayırın)',
        },
        ogeBasligi: 'Üç örnek durum',
      },
      sahne: {
        ad: 'Sahne fotoğrafları',
        aciklama: 'İki fotoğraf ve altlarındaki tek cümlelik notlar.',
        alanlar: [],
        etiketler: {},
        ogeSayisi: 2,
        ogeAlanlari: ['imagePath', 'imageAlt', 'body'],
        ogeEtiketleri: { imagePath: 'Fotoğraf', imageAlt: 'Alt metni', body: 'Alt yazı' },
        ogeBasligi: 'İki fotoğraf',
      },
    },
  },

  bolgeler: {
    ad: 'Bölgelerimiz',
    yol: '/bolgelerimiz',
    aciklama:
      'İlçe listesi ve sayıları burada DEĞİL — bölge kayıtlarından hesaplanıyor. Burada yalnız editoryal çerçeve var.',
    bolumler: {
      giris: {
        ad: 'Giriş',
        aciklama: 'Sayfanın H1 ve giriş paragrafı. İlçe SAYISI künyede ve bölge kayıtlarından hesaplanıyor.',
        alanlar: ['heading', 'lead'],
        etiketler: { heading: 'H1 başlık', lead: 'Giriş paragrafı' },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
      dizin: {
        ad: 'Coğrafi dizin',
        aciklama: 'Yaka ayrımının başlığı ve açıklaması.',
        alanlar: ['heading', 'lead'],
        etiketler: { heading: 'Başlık', lead: 'Açıklama paragrafı' },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
      aciklama: {
        ad: 'İlçe sayfasında ne var',
        aciklama: 'Dizinin altındaki açıklama bandı.',
        alanlar: ['heading', 'lead'],
        etiketler: { heading: 'Başlık', lead: 'Açıklama paragrafı' },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
    },
  },

  hakkimizda: {
    ad: 'Hakkımızda',
    yol: '/hakkimizda',
    aciklama:
      'Sayfanın ANLATI METİNLERİ burada değil — Hakkımızda ekranından geliyor. Burada yalnız o ekranın taşımadığı bölümler ve fotoğraflar var.',
    bolumler: {
      giris: {
        ad: 'Giriş fotoğrafı',
        aciklama: 'Başlık ve giriş paragrafı Hakkımızda ekranından geliyor; burada yalnız fotoğraf.',
        alanlar: ['imagePath', 'imageAlt'],
        etiketler: { imagePath: 'Giriş fotoğrafı', imageAlt: 'Fotoğrafın alt metni' },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
      yontem: {
        ad: 'Yöntem fotoğrafı',
        aciklama: 'Tarihçe metni Hakkımızda ekranından geliyor; burada yalnız fotoğraf ve üstündeki vurgu.',
        alanlar: ['note', 'imagePath', 'imageAlt'],
        etiketler: {
          note: 'Fotoğrafın üstündeki vurgu cümlesi',
          imagePath: 'Fotoğraf',
          imageAlt: 'Fotoğrafın alt metni',
        },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
      saha: {
        ad: 'Keşifte ne kayda geçiyor',
        aciklama: 'Keşifte ölçülen dört başlık.',
        alanlar: ['heading', 'lead', 'closing'],
        etiketler: { heading: 'Başlık', lead: 'Giriş paragrafı', closing: 'Kapanış paragrafı' },
        ogeSayisi: 4,
        ogeAlanlari: ['label', 'body', 'title'],
        ogeEtiketleri: { label: 'Ölçüm adı', body: 'Ne kaydediliyor', title: 'Neden ölçülüyor' },
        ogeBasligi: 'Dört ölçüm',
      },
      kapsam: {
        ad: 'Hizmet alanları',
        aciklama: 'Başlık ve giriş paragrafı. Hizmet listesi Servisler ekranından, kapanış cümlesi (bağlantı taşıyor) koddan geliyor.',
        alanlar: ['heading', 'lead'],
        etiketler: { heading: 'Başlık', lead: 'Giriş paragrafı' },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
      odak: {
        ad: 'İstanbul odağı',
        aciklama: 'Sayfanın kapanış bandının başlığı ve ilk paragrafı. Bağlantı taşıyan cümleler kodda.',
        alanlar: ['heading', 'lead'],
        etiketler: { heading: 'Başlık', lead: 'Açıklama paragrafı' },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
    },
  },

  iletisim: {
    ad: 'İletişim',
    yol: '/iletisim',
    aciklama:
      'Telefon, WhatsApp, e-posta ve adres burada DEĞİL — Site Genel ekranından geliyor. Form alan etiketleri de kodda.',
    bolumler: {
      giris: {
        ad: 'Giriş',
        aciklama: 'Sayfanın H1 ve giriş paragrafı.',
        alanlar: ['heading', 'lead'],
        etiketler: { heading: 'H1 başlık', lead: 'Giriş paragrafı' },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
      kanallar: {
        ad: 'Doğrudan iletişim',
        aciklama: 'Telefon bandının başlığı ve açıklaması. Numaranın kendisi Site Genel’den geliyor.',
        alanlar: ['heading', 'lead'],
        etiketler: { heading: 'Başlık', lead: 'Açıklama paragrafı' },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
      form: {
        ad: 'Talep formu çerçevesi',
        aciklama: 'Formun üstündeki başlık ve yönlendirme metni. Alan etiketleri kodda.',
        alanlar: ['heading', 'lead', 'note'],
        etiketler: {
          heading: 'Başlık',
          lead: 'Ne yazılmasını istediğinizi anlatan paragraf',
          note: 'Formun altındaki bilgilendirme',
        },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
    },
  },

  fiyat: {
    ad: 'Fiyat Hesaplama',
    yol: '/fiyat-hesaplama',
    aciklama:
      'Hesaplama KATSAYILARI burada değil — Fiyat Hesaplama ekranından geliyor. Burada yalnız aracın etrafındaki editoryal metin var.',
    bolumler: {
      giris: {
        ad: 'Giriş',
        aciklama: 'Sayfanın H1 ve giriş paragrafı.',
        alanlar: ['heading', 'lead'],
        etiketler: { heading: 'H1 başlık', lead: 'Giriş paragrafı' },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
      arac: {
        ad: 'Hesaplama aracı başlığı',
        aciklama: 'Yalnız başlık. Formun kendisi ve katsayılar kodda/Fiyat Hesaplama ekranında.',
        alanlar: ['heading'],
        etiketler: { heading: 'Başlık' },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
      girenler: {
        ad: 'Hesaba ne giriyor',
        aciklama: 'Aracın kullandığı altı girdinin açıklaması.',
        alanlar: ['heading', 'lead'],
        etiketler: { heading: 'Başlık', lead: 'Açıklama paragrafı' },
        ogeSayisi: 6,
        ogeAlanlari: ['label', 'body'],
        ogeEtiketleri: { label: 'Girdi adı', body: 'Açıklama' },
        ogeBasligi: 'Altı girdi',
      },
      disarida: {
        ad: 'Hesabın dışında kalanlar',
        aciklama:
          'TİCARİ KARAR LİSTESİ — altı kalem. Neyin fiyata dahil olmadığı işletmenin kararı; değiştiğinde bu liste de değişmeli.',
        alanlar: ['heading', 'lead'],
        etiketler: { heading: 'Başlık', lead: 'Açıklama paragrafı' },
        ogeSayisi: 6,
        ogeAlanlari: ['label', 'body'],
        ogeEtiketleri: { label: 'Kalem adı', body: 'Açıklama' },
        ogeBasligi: 'Altı kalem',
      },
      sonraki: {
        ad: 'Aralıktan sonra',
        aciklama: 'Kapanış bandının başlığı ve ilk paragrafı. Bağlantı taşıyan cümleler kodda.',
        alanlar: ['heading', 'lead'],
        etiketler: { heading: 'Başlık', lead: 'Açıklama paragrafı' },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
    },
  },

  blog: {
    ad: 'Blog dizini',
    yol: '/blog',
    aciklama:
      'Yazıların KENDİSİ burada değil — Postlar ekranından geliyor. Burada yalnız dizinin girişi var; kapanış cümlesi bağlantı taşıdığı için kodda.',
    bolumler: {
      giris: {
        ad: 'Giriş',
        aciklama: 'Dizinin H1 ve giriş paragrafı.',
        alanlar: ['heading', 'lead'],
        etiketler: { heading: 'H1 başlık', lead: 'Giriş paragrafı' },
        ogeSayisi: 0,
        ogeAlanlari: [],
        ogeEtiketleri: {},
      },
      // KAPANIŞ BÖLÜMÜ SÖZLEŞMEDE YOK — bilerek. Dizinin altındaki tek
      // kapanış cümlesi içinde `/iletisim` bağlantısı taşıyor, yani rota
      // haritasının parçası. CMS'e almak ya bağlantıyı düşürmek ya da
      // panele HTML sokmak olurdu.
    },
  },
}

/** `pageKey.sectionKey` çiftini doğrular. */
export const icBolumAnahtariMi = (sayfa: unknown, bolum: unknown): boolean =>
  icSayfaAnahtariMi(sayfa) &&
  typeof bolum === 'string' &&
  Object.prototype.hasOwnProperty.call(IC_SAYFALAR[sayfa].bolumler, bolum)

/** Uzun metin girişi isteyen alanlar — panel `textarea` basıyor. */
export const UZUN_ALANLAR: ReadonlySet<string> = new Set([
  'lead',
  'note',
  'closing',
  'body',
  'imageAlt',
])

/** Görsel seçici isteyen alanlar. */
export const GORSEL_ALANLARI: ReadonlySet<string> = new Set(['imagePath'])

/** Toplam bölüm sayısı — testler ve rapor için. */
export const IC_BOLUM_SAYISI = Object.values(IC_SAYFALAR).reduce(
  (t, s) => t + Object.keys(s.bolumler).length,
  0
)
