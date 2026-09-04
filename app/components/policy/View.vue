<script setup>
/**
 * POLİTİKA SAYFASI GÖRÜNÜMÜ — üç yasal sayfanın ortak kabuğu.
 *
 * İçerik veritabanından geliyor (Admin > Politika Metinleri). Önceden her
 * sayfanın metni kendi Vue bileşeninin ŞABLONUNA gömülüydü; Gizlilik
 * Politikası var olmayan alt bileşenleri çağırdığı için canlıda tamamen
 * boş basılıyordu ve bunu hiçbir test yakalayamamıştı — şablona gömülü
 * içerik ne veritabanı denetiminde ne de içerik listelerinde görünür.
 *
 * Metin `article-prose` ile basılıyor: sanitizeHtml'den geçiyor ve
 * sitedeki diğer zengin metinlerle (blog, bölge) aynı tipografiyi
 * kullanıyor.
 */
const props = defineProps({
  slug: { type: String, required: true },
})

const { data: cevap } = await useFetch(`/api/policies?slug=${props.slug}`, {
  key: `policy-${props.slug}`,
})

const sayfa = computed(() => (cevap.value?.success ? cevap.value.data : null))

// Kayıt yoksa ya da yayından kaldırıldıysa 404. Boş bir yasal sayfa
// yayınlamaktansa bulunamadı demek doğru: tam olarak bu sayfaların
// başına gelen buydu.
if (!sayfa.value || sayfa.value.isActive === false) {
  throw createError({ statusCode: 404, statusMessage: 'Sayfa Bulunamadı' })
}

/**
 * Künyenin sağ yarısı — başlığın versal hâli ("GİZLİLİK POLİTİKASI").
 *
 * `tr-TR` yerel ayarı ŞART: varsayılan `toUpperCase()` "i" harfini "I"
 * yapıyor ve "Gizlilik" → "GIZLILIK" çıkıyor. Türkçe metin taşıyan bir
 * sitede bu, künyenin tek görünür kusuru olurdu.
 */
const kunyeAdi = computed(() =>
  String(sayfa.value?.title ?? '').toLocaleUpperCase('tr-TR')
)

const guncellemeTarihi = computed(() => {
  const t = sayfa.value?.lastUpdated
  if (!t) return ''
  const d = new Date(t)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('tr-TR')
})
</script>

<template>
  <main>
    <ui-section tone="surface" labelledby="politika-baslik">
      <article class="politika">
        <header class="politika__ust">
          <p class="politika__kunye op-kunye">YASAL / {{ kunyeAdi }}</p>
          <h1 id="politika-baslik" class="politika__baslik tip-baslik">{{ sayfa.title }}</h1>
          <p v-if="sayfa.subtitle" class="politika__alt tip-giris">{{ sayfa.subtitle }}</p>
          <p v-if="guncellemeTarihi" class="politika__tarih op-kunye">
            SON GÜNCELLEME ·
            <time :datetime="sayfa.lastUpdated">{{ guncellemeTarihi }}</time>
          </p>
        </header>

        <article-prose :html="sayfa.content" class="politika__govde" />
      </article>
    </ui-section>
  </main>
</template>

<style scoped>
/*
 * ÖLÇÜ 39rem — ESKİSİ 52rem (832px = 85ch) İDİ.
 *
 * Ölçüldü: sitenin donmuş uzun metin yüzeyi (blog yazısı) 1440'ta 623px
 * basıyor, yani ~64ch. Legal aynı puntoyla 85ch veriyordu — aynı sitede
 * %33 daha uzun satır.
 *
 * BİRİM NEDEN `ch` DEĞİL: `ch`, yazıldığı elemanın punto bağlamında
 * çözülüyor. Bu kap 16px gövde bağlamında, içindeki metin ise 17px;
 * `64ch` yazınca ekrana 60ch'lik bir metin çıkıyordu (ölçüldü: 587px).
 * `rem` bağlamdan bağımsız ve donmuş referansla birebir eşleşiyor.
 *
 * Kademe, renk ve satır aralığı DEĞİŞMEDİ; yalnız ölçü sitenin kendi
 * standardına çekildi.
 */
.politika {
  margin: 0 auto;
  max-width: 39rem;
}

.politika__ust {
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgb(var(--c-line));
}

/* Bölüm kimliği — sitenin her sayfasında olan mono künye. Legal
   sayfalarda yoktu ve aile bu yüzden başka bir siteden gibi duruyordu. */
.politika__kunye {
  margin-bottom: 1rem;
}

/* Kademe artık ortak `.tip-baslik`ten geliyor (700); buradaki yerel
   clamp ve `font-weight: 800` kaldırıldı — sitede 800 başka hiçbir
   başlıkta kullanılmıyordu. */
.politika__baslik {
  color: rgb(var(--c-ink));
}

.politika__alt {
  margin-top: 0.75rem;
}

/* Tarih artık kapanış cümlesi değil, editoryal künye: mono, versal,
   sayfanın diğer metadata satırlarıyla aynı dil. */
.politika__tarih {
  margin-top: 1.25rem;
}
</style>
