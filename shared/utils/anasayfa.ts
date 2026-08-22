// shared/utils/anasayfa.ts
//
// ANA SAYFA BÖLÜM SÖZLEŞMESİ — TEK KAYNAK.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN `shared/`
//
// Aynı sözleşmeyi İKİ taraf okuyor:
//   · sunucu  — hangi anahtar geçerli, bölüm kaç öğe taşıyabilir
//   · panel   — hangi alanlar için form basılacak
// İki kopya yazılsaydı biri değiştiğinde diğeri sessizce eskir ve panel
// sunucunun reddedeceği bir form gösterirdi.
//
// ─────────────────────────────────────────────────────────────────────────
// BU SÖZLEŞME TASARIMIN DELİKLERİNİ TARİF EDİYOR, TASARIMI DEĞİL
//
// Bölüm sırası, yerleşim, koreografi, künye numaraları ve ızgara KODDA.
// Burada yalnız "yöneticinin değiştirmesi beklenen metin ve görseller"
// listeleniyor. Anahtar kümesi KAPALI: yönetici yeni bölüm üretemiyor,
// var olanı silemiyor, öğe sayısını değiştiremiyor.

/** Kapalı bölüm anahtarı kümesi. Sıra, sayfadaki gerçek sırayla aynı. */
export const ANASAYFA_ANAHTARLARI = [
  'hero',
  'kapsam',
  'uc-istanbul',
  'hizmetler',
  'fiyat',
  // Sorular ile Kapanış arasına giriyor. Sorular'ın kendi anahtarı YOK —
  // içeriği `FaqSection`'dan geliyor — ama sıra sayfadaki gerçek sıra:
  // … Fiyat → Sorular → Yorumlar → Kapanış.
  'yorumlar',
  'kapanis',
] as const

export type AnasayfaAnahtari = (typeof ANASAYFA_ANAHTARLARI)[number]

export const anasayfaAnahtariMi = (deger: unknown): deger is AnasayfaAnahtari =>
  typeof deger === 'string' && (ANASAYFA_ANAHTARLARI as readonly string[]).includes(deger)

/** Bölüm gövdesinde kullanılabilen adlandırılmış metin/görsel yuvaları. */
export type BolumAlani =
  | 'heading'
  | 'lead'
  | 'note'
  | 'closing'
  | 'closingNote'
  | 'ctaLabel'
  | 'imagePath'
  | 'imageAlt'

/** Öğede kullanılabilen alanlar. */
export type OgeAlani = 'label' | 'subLabel' | 'title' | 'body' | 'imagePath' | 'imageAlt'

export interface BolumTanimi {
  /** Panelde görünen ad. */
  ad: string
  /** Yöneticiye bölümün sayfadaki yerini hatırlatan tek cümle. */
  aciklama: string
  /** Bu bölümün kullandığı gövde alanları — sırayla. */
  alanlar: BolumAlani[]
  /** Alan başına panelde görünecek etiket. */
  etiketler: Partial<Record<BolumAlani, string>>
  /**
   * SABİT öğe sayısı. Tasarımın parçası: üç sahne üç sahnedir, dördüncüsü
   * ızgarayı bozar. `0` = bu bölümün öğesi yok.
   */
  ogeSayisi: number
  /** Öğelerde kullanılan alanlar. */
  ogeAlanlari: OgeAlani[]
  ogeEtiketleri: Partial<Record<OgeAlani, string>>
  /** Panelde öğe grubunun başlığı. */
  ogeBasligi?: string
}

export const ANASAYFA_BOLUMLERI: Record<AnasayfaAnahtari, BolumTanimi> = {
  hero: {
    ad: 'Hero',
    aciklama: 'Sayfanın ilk ekranı: H1, giriş cümlesi, ölçülen dört koşul ve büyük fotoğraf.',
    alanlar: ['heading', 'lead', 'ctaLabel', 'note', 'closing', 'closingNote', 'imagePath', 'imageAlt'],
    etiketler: {
      heading: 'H1 başlık',
      lead: 'Giriş cümlesi',
      ctaLabel: 'İkinci düğme etiketi (telefon Site Ayarları’ndan gelir)',
      note: 'Koşul listesinin üstündeki cümle',
      closing: 'Kapanış vurgusu (satır sonu için Enter)',
      closingNote: 'Kapanış paragrafı',
      imagePath: 'Hero fotoğrafı',
      imageAlt: 'Fotoğrafın alt metni',
    },
    ogeSayisi: 4,
    ogeAlanlari: ['label', 'body'],
    ogeEtiketleri: { label: 'Koşul adı', body: 'Açıklama' },
    ogeBasligi: 'Ölçülen dört koşul',
  },

  kapsam: {
    ad: 'Kapsam',
    aciklama:
      'İstanbul kapsamı. Yaka sayıları (25 / 14 / 39) buradan YÖNETİLMİYOR — bölge kayıtlarından hesaplanıyor.',
    alanlar: ['heading', 'note'],
    etiketler: { heading: 'Başlık', note: 'Örneklerin üstündeki paragraf' },
    ogeSayisi: 3,
    ogeAlanlari: ['label', 'body'],
    ogeEtiketleri: { label: 'İlçe adı', body: 'Koşul açıklaması' },
    ogeBasligi: 'Üç örnek ilçe',
  },

  'uc-istanbul': {
    ad: 'Üç İstanbul',
    aciklama: 'Üç koşul sahnesi. Sahne sayısı tasarımın parçası; artırılamaz.',
    alanlar: ['heading', 'lead', 'closing', 'closingNote', 'ctaLabel'],
    etiketler: {
      heading: 'Başlık',
      lead: 'Giriş paragrafı',
      closing: 'Kapanış vurgusunun ikinci satırı (ilk satır ilçe sayısından gelir)',
      closingNote: 'Kapanış paragrafı',
      ctaLabel: 'Bağlantı etiketi',
    },
    ogeSayisi: 3,
    ogeAlanlari: ['label', 'subLabel', 'title', 'body', 'imagePath', 'imageAlt'],
    ogeEtiketleri: {
      label: 'Koşul etiketi',
      subLabel: 'Tipoloji',
      title: 'Sahne başlığı',
      body: 'Sahne metni',
      imagePath: 'Sahne fotoğrafı',
      imageAlt: 'Fotoğrafın alt metni',
    },
    ogeBasligi: 'Üç sahne',
  },

  hizmetler: {
    ad: 'Hizmetler',
    aciklama:
      'Yalnız başlık. Hizmet satırlarının kendisi Hizmetler panelinden yönetiliyor — ana sayfa yayındaki hizmetleri olduğu gibi listeliyor.',
    alanlar: ['heading'],
    etiketler: { heading: 'Başlık' },
    ogeSayisi: 0,
    ogeAlanlari: [],
    ogeEtiketleri: {},
  },

  fiyat: {
    ad: 'Fiyat',
    aciklama:
      'Fiyatı neyin değiştirdiğini anlatan beş faktör. Fiyat hesaplama aracının katsayılarıyla ilgisi yok.',
    alanlar: ['heading', 'lead'],
    etiketler: { heading: 'Başlık', lead: 'Giriş paragrafı' },
    ogeSayisi: 5,
    ogeAlanlari: ['label', 'body'],
    ogeEtiketleri: { label: 'Faktör adı', body: 'Açıklama' },
    ogeBasligi: 'Beş faktör',
  },

  yorumlar: {
    ad: 'Yorumlar',
    aciklama:
      'Yalnız başlık ve iki açıklama cümlesi. Yorumların KENDİSİ buradan yönetilmiyor: ziyaretçi formundan gelip Müşteri Yorumları panelinde onaylanıyorlar. Puan ortalaması ve yorum sayısı da buraya yazılmıyor — onaylı kayıtlardan hesaplanıyor.',
    alanlar: ['heading', 'lead', 'note'],
    etiketler: {
      heading: 'Başlık',
      lead: 'Başlığın altındaki paragraf',
      note: 'Form açılmadan önce görünen davet cümlesi',
    },
    ogeSayisi: 0,
    ogeAlanlari: [],
    ogeEtiketleri: {},
  },

  kapanis: {
    ad: 'Kapanış',
    aciklama: 'Sayfanın son cümlesi ve tek eylemi. Telefon Site Ayarları’ndan geliyor.',
    alanlar: ['heading', 'ctaLabel'],
    etiketler: { heading: 'Başlık', ctaLabel: 'Düğme etiketi' },
    ogeSayisi: 0,
    ogeAlanlari: [],
    ogeEtiketleri: {},
  },
}

/** Uzun metin girişi isteyen alanlar — panel `textarea` basıyor. */
export const UZUN_ALANLAR: ReadonlySet<string> = new Set([
  'lead',
  'note',
  'closing',
  'closingNote',
  'body',
  'imageAlt',
])

/** Görsel seçici isteyen alanlar. */
export const GORSEL_ALANLARI: ReadonlySet<string> = new Set(['imagePath'])
