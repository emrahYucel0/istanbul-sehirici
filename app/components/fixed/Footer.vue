<script setup>
/**
 * FOOTER — yeni tasarım dilinin utility katmanı.
 *
 * GLOBAL: `layouts/default.vue` üzerinden BÜTÜN sayfalarda görünüyor.
 * Bu yüzden ana sayfaya özel hiçbir şey içermiyor.
 *
 * GÖREVİ SATIŞ DEĞİL
 * Dönüşümü Kapanış yaptı. Burası kimlik, temel navigasyon, gerçek iletişim
 * bilgisi ve yasal bağlantılar için sakin son katman. İkinci bir CTA
 * bölümü değil; büyük başlık yok.
 *
 * YÜZEY — Kapanış koyu, Footer KÂĞIT
 * İkisi aynı koyu yüzeyde devam etseydi tek dev blok gibi okunurdu.
 * Renk değişimi anlatının bittiğini, utility katmanının başladığını
 * söylüyor. Üstteki tek ölçü çizgisi, Kapanış olmayan sayfalarda da
 * (ör. /iletisim) ayrımı garanti ediyor.
 *
 * KOMPOZİSYON — jenerik dört kart değil
 *   · kimlik ve fiziksel varlık (adres, saatler) SOL eksende
 *   · iletişim kanalları AYRI bir baseline'da, sağda
 *   · navigasyon TEK YATAY SATIR — dikey link kolonları yok
 *   · yasal/meta bilgisi en altta ince bir katmanda
 * Kutu, kart, panel yok. İki çizgi var, ikisi de gerçek ayırma yapıyor.
 *
 * ESKİ FOOTER'DAN ÇIKARILANLAR (bkz. rapor) — hiçbiri doğrulanamadı:
 *   "sigortalı, şeffaf fiyatlı ve zamanında teslimat esasına dayalı hizmet"
 * Yerine doğrulanmamış YENİ slogan da yazılmadı; tanım cümlesi yalnız
 * ne yapıldığını ve nerede yapıldığını söylüyor.
 *
 * BAĞLANTI MİMARİSİ — sitemap değil
 * Eski Footer üç CMS kolonu basıyordu: hizmet derin bağlantıları, blog
 * yazıları ve ŞEHİR bağlantıları (/bursa, /izmir, /ankara) — sonuncular
 * İstanbul konumlandırmasıyla doğrudan çelişiyordu. Artık yalnız sitenin
 * gerçek birincil rotaları var; hepsi 200 döndüğü doğrulandı. CMS verisi
 * SİLİNMEDİ, yalnız render edilmiyor (bkz. rapor).
 */
const { settings, brandName } = await useSiteSettings()

/**
 * Footer kaydı iletişim alanlarını taşıyabiliyor ama şu an hepsi BOŞ;
 * bu yüzden Site Ayarları'na düşülüyor. Sıra korunuyor: footer kaydı >
 * site ayarları. Hiçbiri doluysa alan render EDİLMİYOR.
 */
/*
 * `/api/footer` İSTEĞİ KALDIRILDI (M6).
 *
 * Bu bileşen o kayıttan yalnız ÜÇ alanı okuyordu — adres, e-posta, telefon —
 * ve üçü de Site Ayarları'nın ÜSTÜNE YAZMA alanıydı: `footer.address ||
 * settings.address` biçiminde. Üçü de veri tabanında BOŞTU, yani görünen
 * değer zaten Site Ayarları'ndan geliyordu.
 *
 * İki kaynaklı iletişim bilgisi gerçek bir tuzaktı: yönetici Footer
 * ekranına telefon yazdığında Site Ayarları'ndaki numara sessizce
 * ezilecek, ama Navbar'daki numara değişmeyecekti — aynı sitede iki farklı
 * telefon. Tek sahip artık Site Ayarları.
 *
 * Kaydın geri kalanı (telif metni, sosyal bağlantılar, hızlı/blog/bölge
 * bağlantı listeleri) zaten hiç okunmuyordu: alttaki gezinme listeleri bu
 * dosyanın içinde sabit (`gezinme`, `yasal`) ve telif satırı
 * `© {yıl} {marka}` olarak basılıyor.
 *
 * ÖLÇÜLDÜ: görünen adres, e-posta ve telefon DEĞİŞMEDİ. Sunucu tarafında
 * bir istek eksildi.
 */

const isletmeTanimi = computed(() => settings.value?.footerText?.trim() || '')

const adres = computed(() => settings.value?.address?.trim() || '')
const eposta = computed(() => settings.value?.email?.trim() || '')
const telefon = computed(
  () => settings.value?.phone?.trim() || settings.value?.mobilePhone?.trim() || ''
)
const telHref = computed(() => `tel:${telefon.value.replace(/[^\d+]/g, '')}`)

/** Panelde tam URL olarak tutuluyor; ham numara girilirse de çalışsın. */
const whatsApp = computed(() => {
  const ham = (settings.value?.whatsAppNumber || '').trim()
  if (!ham) return ''
  if (/^https?:\/\//i.test(ham)) return ham
  const rakam = ham.replace(/\D/g, '')
  return rakam ? `https://wa.me/${rakam}` : ''
})

/**
 * Serbest metin çalışma saatleri "/" ile ayrılmış satırlar hâlinde
 * giriliyor ve içinde uzun boşluk blokları var. Boş satır atılıyor.
 */
const saatler = computed(() =>
  (settings.value?.workingHours || '')
    .split('/')
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
)

/**
 * Sitenin GERÇEK birincil rotaları. Her biri denendi, hepsi 200 döndü.
 * Hizmet başına ayrı detay rotası olmadığı için tek `/hizmetlerimiz`
 * kullanılıyor; sahte bağlantı üretilmedi.
 */
const gezinme = [
  { ad: 'Hizmetler', yol: '/hizmetlerimiz' },
  { ad: 'Bölgeler', yol: '/bolgelerimiz' },
  { ad: 'Fiyat hesaplama', yol: '/fiyat-hesaplama' },
  { ad: 'Hakkımızda', yol: '/hakkimizda' },
  { ad: 'Blog', yol: '/blog' },
  { ad: 'İletişim', yol: '/iletisim' },
]

const yasal = [
  { ad: 'Gizlilik Politikası', yol: '/gizlilik-politikasi' },
  { ad: 'Kullanım Şartları', yol: '/kullanim-sartlari' },
  { ad: 'Çerez Politikası', yol: '/cerez-politikasi' },
]

/**
 * Sosyal hesaplar: yalnız DOLU olanlar. Boş/placeholder ikon basılmıyor.
 * Yeni ikon kütüphanesi eklenmedi — yeni dilde metin bağlantısı zaten
 * ikondan daha okunur ve erişilebilir ad sorunu yaratmıyor.
 */
const sosyal = computed(() =>
  [
    { ad: 'Instagram', url: settings.value?.instagramUrl },
    { ad: 'Facebook', url: settings.value?.facebookUrl },
    { ad: 'YouTube', url: settings.value?.youtubeUrl },
    { ad: 'LinkedIn', url: settings.value?.linkedinUrl },
  ].filter((s) => (s.url || '').trim())
)

const yil = new Date().getFullYear()
</script>

<template>
  <footer class="ft">
    <div class="ft-alan">
      <!-- ── Kimlik ve fiziksel varlık ─────────────────────────────── -->
      <div class="ft-kimlik">
        <p class="ft-marka">{{ brandName }}</p>
        <!--
          İŞLETME TANIMI — SİTE AYARLARI'NDAN (M7).

          Bu cümle koda gömülüydü ve her sayfada basılıyordu; işletme
          hizmet kapsamını değiştirdiğinde kod değişikliği gerekiyordu.
          Doğal sahibi Site Ayarları: aynı ekranda telefon, adres ve marka
          adı zaten duruyor ve alan (`footerText`) orada YILLARDIR VARDI —
          yalnız hiçbir yer okumuyordu. M6'da "düzenlenebilir ama hiçbir şey
          yapmıyor" alanları temizlerken bu, silinmek yerine BAĞLANMASI
          gereken tek örnekti; M7'de bağlandı.

          Boşsa hiç basılmıyor: yedek metin bırakmak ikinci bir çalışma
          zamanı kaynağı demek olurdu.
        -->
        <p v-if="isletmeTanimi" class="ft-tanim">{{ isletmeTanimi }}</p>
        <address class="ft-adres">
          <span v-if="adres">{{ adres }}</span>
          <span v-for="s in saatler" :key="s" class="ft-saat">{{ s }}</span>
        </address>
      </div>

      <!-- ── İletişim kanalları, ayrı baseline ─────────────────────── -->
      <div class="ft-iletisim">
        <a v-if="telefon" :href="telHref" class="ft-tel">{{ telefon }}</a>
        <a v-if="whatsApp" :href="whatsApp" target="_blank" rel="noopener" class="ft-bag">
          WhatsApp
        </a>
        <a v-if="eposta" :href="`mailto:${eposta}`" class="ft-bag">{{ eposta }}</a>
      </div>

      <!-- ── Navigasyon — tek yatay satır, dikey kolon yığını değil.
           Grup etiketleri BAŞLIK YAPILMADI: eski Footer'da "Hizmetlerimiz /
           Bölgelerimiz / Diğer Hizmetler" sahipsiz `h3`lerdi ve sayfanın
           başlık ağacına üç düğüm ekliyorlardı. Ad işini `aria-label`
           yapıyor. -->
      <nav class="ft-gezinme" aria-label="Alt bilgi bağlantıları">
        <NuxtLink v-for="g in gezinme" :key="g.yol" :to="g.yol" class="ft-bag">
          {{ g.ad }}
        </NuxtLink>
      </nav>

      <!-- ── Meta katmanı ──────────────────────────────────────────── -->
      <div class="ft-meta">
        <p class="ft-telif">© {{ yil }} {{ brandName }}</p>
        <nav class="ft-yasal" aria-label="Yasal bilgiler">
          <NuxtLink v-for="y in yasal" :key="y.yol" :to="y.yol" class="ft-bag ft-bag--kucuk">
            {{ y.ad }}
          </NuxtLink>
        </nav>
        <nav v-if="sosyal.length" class="ft-sosyal" aria-label="Sosyal medya">
          <a
            v-for="s in sosyal"
            :key="s.ad"
            :href="s.url"
            target="_blank"
            rel="noopener"
            class="ft-bag ft-bag--kucuk"
          >{{ s.ad }}</a>
        </nav>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.ft {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
  /* Tek üst ayraç: Kapanış'ın koyu yüzeyi zaten ayırıyor ama Kapanış
     olmayan sayfalarda (ör. /iletisim) ayrımı bu çizgi kuruyor. */
  border-top: 1px solid rgb(var(--c-measure));
}

.ft-alan {
  max-width: var(--container-wide);
  margin: 0 auto;
  padding: clamp(3rem, 2rem + 3vw, 4.5rem) clamp(1.25rem, 0.5rem + 3vw, 4rem)
    clamp(2rem, 1.5rem + 1.5vw, 3rem);
  display: grid;
  gap: clamp(2rem, 1.5rem + 2vw, 3rem);
}

/* ---- Kimlik ------------------------------------------------------------ */
.ft-marka {
  font-size: clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem);
  font-weight: 700;
  letter-spacing: -0.015em;
  margin: 0;
}
.ft-tanim {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: rgb(var(--c-ink-soft));
  max-width: 44ch;
  margin: 0.75rem 0 0;
  text-wrap: pretty;
}
.ft-adres {
  display: grid;
  gap: 0.25rem;
  font-style: normal;
  font-size: 0.875rem;
  line-height: 1.55;
  color: rgb(var(--c-ink-soft));
  margin-top: 1.25rem;
}
.ft-saat {
  font-variant-numeric: tabular-nums;
}

/* ---- İletişim ---------------------------------------------------------- */
.ft-iletisim {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}
.ft-tel {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  /* Karakter katmanının doğal yeri: gerçek numara. Dekoratif etiket değil. */
  font-family: var(--f-mono);
  font-size: 1rem;
  letter-spacing: 0.03em;
  font-weight: 500;
  color: rgb(var(--c-ink));
  text-decoration: none;
  border-bottom: 1px solid rgb(var(--c-measure));
  padding-bottom: 0.125rem;
}
.ft-tel:hover {
  border-bottom-color: rgb(var(--c-ink));
}

/* ---- Ortak bağlantı dili ---------------------------------------------- */
.ft-bag {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: 0.9375rem;
  color: rgb(var(--c-ink));
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.15s ease-out, color 0.15s ease-out;
}
.ft-bag:hover {
  border-bottom-color: rgb(var(--c-ink));
}
.ft-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}
.ft-bag--kucuk {
  font-size: 0.8125rem;
  color: rgb(var(--c-ink-soft));
}
.ft-bag--kucuk:hover {
  color: rgb(var(--c-ink));
  border-bottom-color: rgb(var(--c-ink));
}

/* ---- Navigasyon — yatay satır ------------------------------------------ */
.ft-gezinme {
  display: flex;
  flex-wrap: wrap;
  gap: 0 clamp(1.25rem, 0.75rem + 1.5vw, 2.25rem);
}

/* ---- Meta -------------------------------------------------------------- */
.ft-meta {
  border-top: 1px solid rgb(var(--c-rule));
  padding-top: clamp(1rem, 0.75rem + 0.8vw, 1.5rem);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 clamp(1rem, 0.5rem + 1.5vw, 2rem);
}
.ft-telif {
  font-family: var(--f-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: rgb(var(--c-ink-soft));
  margin: 0;
  margin-right: auto;
}
.ft-yasal,
.ft-sosyal {
  display: flex;
  flex-wrap: wrap;
  gap: 0 clamp(0.875rem, 0.5rem + 1vw, 1.5rem);
}

/* ===========================================================================
   MASAÜSTÜ — kimlik solda, iletişim sağda ve ayrı baseline'da
   ======================================================================== */
@media (min-width: 1024px) {
  .ft-alan {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: clamp(1rem, 0.5rem + 1.5vw, 2rem);
    row-gap: clamp(2.5rem, 2rem + 2vw, 4rem);
  }
  .ft-kimlik {
    grid-column: 1 / 7;
    grid-row: 1;
  }
  .ft-iletisim {
    grid-column: 9 / 13;
    grid-row: 1;
    /* Kimlikle aynı hizada başlamıyor: kendi ekseninde biraz aşağıda. */
    margin-top: 0.375rem;
  }
  .ft-gezinme {
    grid-column: 1 / 13;
    grid-row: 2;
  }
  .ft-meta {
    grid-column: 1 / 13;
    grid-row: 3;
  }
}
</style>
