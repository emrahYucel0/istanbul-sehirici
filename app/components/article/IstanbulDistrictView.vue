<script setup>
/**
 * İSTANBUL İLÇE DETAYI — V2.
 *
 * `article/RegionView.vue`'nun İSTANBUL İLÇELERİ İÇİN AYRILMIŞ hâli.
 * İkisi bilinçli olarak ayrı dosya: veri tabanında 375 bölge kaydı var ve
 * 335'i İstanbul dışı (il sayfaları, Ankara/İzmir ilçeleri). Tek görünümü
 * V2'ye çevirmek, hiç denetlenmemiş 335 sayfanın düzenini de bir gecede
 * değiştirmek olurdu. Ayrım `shared/utils/istanbul.ts → istanbulIlcesiMi`
 * ile veri ilişkisinden yapılıyor (bkz. app/pages/[...slug].vue).
 *
 * SAYFA ROLÜ: YEREL OPERASYON REHBERİ.
 * Ana sayfa sinematik, /hizmetlerimiz editoryal dizin, hizmet detayı
 * operasyonel açıklayıcı, /bolgelerimiz coğrafi dizin. Burası bir adres
 * grubunun taşıma koşullarını anlatıyor: sokak, bina, kat, site kuralı,
 * mahalle kırılımı, güzergâh.
 *
 * BÖLÜM NUMARALARI İÇERİKTEN TÜRÜYOR.
 * Sabit yazılmıyor; bir ilçenin künyesi boşsa numaralar kaymaya devam
 * ediyor ve boşlukta "02" görünmüyor. Şablon içeriği zorlamıyor.
 *
 * MAHALLELER ARTIK BAĞLANTI.
 * Adresler `shared/utils/mahalle.ts` tarafından üretiliyor ve buraya hazır
 * geliyor (`mahalleler` prop'u) — bileşen kendi slug'ını hesaplamıyor.
 * Sebep: bir mahallenin adresi, adının 473'ün TAMAMI içinde çakışıp
 * çakışmadığına bağlı ("Merkez" 7 ilçede var). O karar tek yerde veriliyor,
 * ilçe sayfası ile mahalle sayfası aynı adresi görüyor.
 *
 * Liste `mahalleler` boşsa (dizin çekilememişse) kaydın kendi
 * `neighborhoods` alanına düşülüyor ve adlar bağlantısız basılıyor:
 * bölüm hiç kaybolmuyor, yalnız tıklanamaz oluyor.
 */
import { computed } from 'vue'
import { istanbulYakasi } from '#shared/utils/istanbul'

const props = defineProps({
  district: { type: Object, required: true },
  /** Yayındaki İstanbul ilçeleri — güzergâh ve komşu bağlantıları için. */
  districts: { type: Array, default: () => [] },
  /** Yedi hizmet kaydı — ilgili hizmet bağlantıları buradan çözülüyor. */
  services: { type: Array, default: () => [] },
  /**
   * Bu ilçenin YAYINDAKİ mahalleleri, adresleriyle: [{ yol, ad, aktif }].
   * Süzgeç sunucuda; burada ikinci bir filtreleme yapılmıyor. Adres
   * politikası shared/utils/mahalle.ts'te, adresin kendisi veri tabanında.
   */
  mahalleler: { type: Array, default: () => [] },
})

const ad = computed(() => props.district?.subtitle?.trim() || props.district?.title || '')
const yaka = computed(() => istanbulYakasi(props.district?.slug))

/* ---------------------------------------------------------- içerik alanları */
/**
 * Gösterilecek mahalle satırları — YALNIZ YAYINDAKİLER.
 *
 * TEK KAYNAK: `Neighborhood` tablosu, sunucuda `isActive` ile süzülmüş
 * hâliyle geliyor (bkz. neighborhoods.service.listByDistrictSlug).
 *
 * ESKİ YEDEK KALDIRILDI. Liste `props.mahalleler` boşken
 * `Region.neighborhoods` JSON alanına düşüyordu ve oradaki adları
 * BAĞLANTISIZ basıyordu. İki sonucu vardı: (1) sayfası olmayan mahalleler
 * kapsam varmış gibi listeleniyordu, (2) panelden JSON'a eklenen bir ad
 * ekranda görünüyordu ama hiçbir sayfa oluşmuyordu. Mahalle verisinin tek
 * yetkili kaynağı artık tablo; yedek, iki kaynağın ayrışmasının tam olarak
 * gerçekleştiği yerdi.
 */
const mahalleSatirlari = computed(() => props.mahalleler)
const kunye = computed(() =>
  parseJsonArray(props.district?.facts).filter((x) => x?.label && x?.value)
)
const sorular = computed(() =>
  parseJsonArray(props.district?.faqs).filter((x) => x?.question && x?.answer)
)
const fiyatFaktorleri = computed(() =>
  parseJsonArray(props.district?.priceFactors).filter((x) => x?.factor)
)

/**
 * GÜZERGÂHLAR — ilçe → ilçe iç bağlantısı.
 *
 * Hedefin slug'ı veri tabanında saklanmıyor, ilçe adından çözülüyor.
 * Çözülemezse satır düz metin kalıyor: hedef pasifse ya da adı değiştiyse
 * 404 veren bir bağlantı oluşmuyor. Yalnız İSTANBUL ilçeleri aday —
 * `districts` zaten sadece onları taşıyor, yani eski "ilgili bölgeler"
 * mantığının Ankara/Bursa sızdırması burada yapısal olarak mümkün değil.
 */
const guzergahlar = computed(() => {
  const slugaGore = new Map(props.districts.map((x) => [x.slug, x]))
  return parseJsonArray(props.district?.routes)
    .filter((x) => x?.to)
    .map((x) => {
      const hedef = slugaGore.get(slugify(x.to))
      return {
        ad: x.to,
        not: x.note || '',
        slug: hedef && hedef.slug !== props.district.slug ? hedef.slug : null,
      }
    })
})

/**
 * İLGİLİ HİZMETLER — ilçenin KENDİ metninden çıkarılıyor.
 *
 * Yedi hizmeti her ilçe sayfasına dökmek bir bağlantı çiftliği olurdu ve
 * hiçbir şey söylemezdi. Burada ilçenin gövde metni, künyesi ve soruları
 * taranıyor; hangi hizmet gerçekten o ilçenin koşullarında geçiyorsa o
 * bağlantı veriliyor. `evden-eve-nakliyat` her zaman ilk sırada çünkü
 * sayfanın H1'i zaten o.
 */
const HIZMET_IZLERI = {
  'asansorlu-nakliyat': ['asansör', 'dış cephe'],
  'ofis-tasima': ['ofis', 'işyeri', 'atölye', 'dükkân', 'plaza', 'iş merkezi', 'depo'],
  'esya-depolama': ['depolama', 'yazlık', 'ara depo'],
  'paketleme-hizmeti': ['ambalaj', 'paketle', 'kırılabilir', 'cam eşya'],
  'parca-esya-tasima': ['parça eşya', 'tek oda', 'öğrenci'],
  'sehirler-arasi-nakliyat': ['şehirler arası', 'şehir dışı'],
}
const HIZMET_SINIRI = 5

const ilgiliHizmetler = computed(() => {
  const havuz = new Map(props.services.map((h) => [h.slug, h]))
  const metin = [
    props.district?.content,
    props.district?.excerpt,
    JSON.stringify(props.district?.facts || ''),
    JSON.stringify(props.district?.faqs || ''),
  ]
    .join(' ')
    .toLocaleLowerCase('tr')

  const secilen = ['evden-eve-nakliyat']
  for (const [slug, izler] of Object.entries(HIZMET_IZLERI)) {
    if (secilen.length >= HIZMET_SINIRI) break
    if (izler.some((iz) => metin.includes(iz))) secilen.push(slug)
  }
  return secilen
    .map((slug) => havuz.get(slug))
    .filter(Boolean)
    .map((h) => ({ slug: h.slug, baslik: h.title, altBaslik: h.subtitle || '' }))
})

/**
 * KOMŞU İLÇELER — aynı yakada Türkçe alfabetik önceki/sonraki.
 *
 * Coğrafi komşuluk verisi elimizde YOK; uydurmak yerine dizinin kendi
 * sırası kullanılıyor — ziyaretçi `/bolgelerimiz`de gördüğü sıranın
 * içinde geziniyor. Eski tarih sıralı gezinme kaldırıldı: o sıra tüm 375
 * kayıt üzerinden çalışıyordu ve bir İstanbul ilçesinin "sonraki"si
 * Bursa'nın bir ilçesi olabiliyordu.
 */
const komsular = computed(() => {
  if (!yaka.value) return { onceki: null, sonraki: null }
  const siralayici = new Intl.Collator('tr-TR')
  const liste = props.districts
    .filter((x) => istanbulYakasi(x.slug)?.anahtar === yaka.value.anahtar)
    .sort((a, b) => siralayici.compare(a.subtitle || a.title || '', b.subtitle || b.title || ''))
  const i = liste.findIndex((x) => x.slug === props.district.slug)
  return {
    onceki: i > 0 ? liste[i - 1] : null,
    sonraki: i >= 0 && i < liste.length - 1 ? liste[i + 1] : null,
  }
})

/* ------------------------------------------------------------------ bölümler */
const bolumler = computed(() => {
  const liste = []
  if (props.district?.content) liste.push({ anahtar: 'tasima', etiket: 'İLÇEDE TAŞIMA' })
  if (kunye.value.length || fiyatFaktorleri.value.length)
    liste.push({ anahtar: 'planlama', etiket: 'PLANLAMA' })
  if (mahalleSatirlari.value.length) liste.push({ anahtar: 'mahalle', etiket: 'MAHALLELER' })
  if (ilgiliHizmetler.value.length) liste.push({ anahtar: 'hizmet', etiket: 'HİZMETLER' })
  if (sorular.value.length) liste.push({ anahtar: 'soru', etiket: 'SORULAR' })
  liste.push({ anahtar: 'adim', etiket: 'SONRAKİ ADIM' })
  return Object.fromEntries(
    liste.map((b, i) => [b.anahtar, { ...b, no: String(i + 1).padStart(2, '0') }])
  )
})

/**
 * GÖRSEL ALT METNİ — konum İDDİA ETMİYOR.
 *
 * Eski varsayılan "{İlçe} evden eve nakliyat çalışmamız" idi; elimizdeki
 * fotoğrafların o ilçede çekildiği doğrulanmış değil. Panelden yazılmış
 * metin varsa o kullanılıyor, yoksa konumsuz bir betimleme.
 */
const gorselAlt = computed(
  () => props.district?.imageAlt?.trim() || 'Nakliyat ekibimiz eşyaları taşırken'
)
</script>

<template>
  <main class="ilc-sayfa">
    <!-- ============================ GİRİŞ ============================ -->
    <section class="ilc-giris-kap" aria-labelledby="ilce-baslik">
      <div class="ilc-giris sahne-alan">
        <nav class="ilc-yol" aria-label="Yol izi">
          <ol class="ilc-yol-liste" itemscope itemtype="https://schema.org/BreadcrumbList">
            <li
              class="ilc-yol-oge"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
            >
              <NuxtLink to="/" itemprop="item"><span itemprop="name">Ana sayfa</span></NuxtLink>
              <meta itemprop="position" content="1" />
            </li>
            <li
              class="ilc-yol-oge"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
            >
              <NuxtLink to="/bolgelerimiz" itemprop="item">
                <span itemprop="name">Bölgelerimiz</span>
              </NuxtLink>
              <meta itemprop="position" content="2" />
            </li>
            <li
              class="ilc-yol-oge"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
            >
              <span itemprop="name" aria-current="page">{{ ad }}</span>
              <meta itemprop="position" content="3" />
            </li>
          </ol>
        </nav>

        <p class="ilc-kunye op-kunye">
          İSTANBUL<span v-if="yaka"> / {{ yaka.ad.toLocaleUpperCase('tr-TR') }}</span>
        </p>

        <h1 id="ilce-baslik" class="ilc-h1 tip-baslik">{{ district.title }}</h1>

        <p v-if="district.excerpt" class="ilc-lead tip-giris">{{ district.excerpt }}</p>

        <!--
          Masaüstünde bu kare ilk ekranda (sağ eksen), o yüzden `eager` ve
          yüksek öncelikli. `quality` VERİLMİYOR: `/yuklemeler` altındaki
          dosyalar önceden üretilmiş sabit varyantlar (-320/-640/-1024),
          yeniden kodlanmıyorlar — parametre etkisiz olurdu.
        -->
        <figure v-if="district.image" class="ilc-gorsel">
          <NuxtImg
            :src="district.image"
            :alt="gorselAlt"
            class="ilc-foto"
            format="webp"
            sizes="xs:90vw sm:90vw md:90vw lg:42vw xl:42vw"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
        </figure>
      </div>
    </section>

    <!-- ====================== 01 — İLÇEDE TAŞIMA ====================== -->
    <section
      v-if="bolumler.tasima"
      class="ilc-bolum ilc-bolum--kagit"
      aria-labelledby="bolum-tasima"
    >
      <div class="ilc sahne-alan">
        <p class="ilc-no op-kunye">{{ bolumler.tasima.no }} / {{ bolumler.tasima.etiket }}</p>
        <h2 id="bolum-tasima" class="ilc-h2 tip-anlati">{{ ad }} taşımasında ne değişiyor?</h2>
        <article-prose :html="district.content" class="ilc-govde" />
      </div>
    </section>

    <!-- ========================= 02 — PLANLAMA ========================= -->
    <section
      v-if="bolumler.planlama"
      class="ilc-bolum ilc-bolum--cukur"
      aria-labelledby="bolum-planlama"
    >
      <div class="ilc sahne-alan">
        <p class="ilc-no op-kunye">{{ bolumler.planlama.no }} / {{ bolumler.planlama.etiket }}</p>
        <h2 id="bolum-planlama" class="ilc-h2 tip-anlati">{{ ad }} künyesi</h2>

        <dl v-if="kunye.length" class="ilc-kunye-liste">
          <div v-for="k in kunye" :key="k.label" class="ilc-kunye-oge">
            <dt class="ilc-kunye-etiket op-kunye">{{ k.label.toLocaleUpperCase('tr-TR') }}</dt>
            <dd class="ilc-kunye-deger tip-not">{{ k.value }}</dd>
          </div>
        </dl>

        <div v-if="fiyatFaktorleri.length" class="ilc-fiyat">
          <h3 class="ilc-h3 tip-alt">Fiyatı belirleyen koşullar</h3>
          <!--
            Rakam YAZILMIYOR: taşıma fiyatı adres görülmeden belirlenemiyor
            ve siteye yazılan bir tutar kısa sürede geçersizleşip yanlış
            beklenti yaratıyor. Tablo koşulun fiyatı hangi yönde
            değiştirdiğini söylüyor.
          -->
          <div class="ilc-tablo-kap">
            <table class="ilc-tablo">
              <caption class="sr-only">
                {{ ad }} bölgesinde evden eve nakliyat fiyatını etkileyen koşullar
              </caption>
              <thead>
                <tr>
                  <th scope="col">Koşul</th>
                  <th scope="col">Fiyatı düşüren</th>
                  <th scope="col">Fiyatı artıran</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(f, i) in fiyatFaktorleri" :key="i">
                  <th scope="row">{{ f.factor }}</th>
                  <td>{{ f.min || '—' }}</td>
                  <td>{{ f.max || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- "yazılı veriliyor" ÇIKARILDI — doğrulanmamış süreç iddiası.
               Teklifin her zaman yazılı verildiğini gösteren bir iş kaydı
               yok; cümle bir taahhüt gibi okunuyordu. Anlam korundu:
               tablodaki aralık bir yön, kesin tutar adres görülmeden
               çıkmıyor. -->
          <p class="ilc-tablo-not tip-not">
            Tablodaki koşullar yönü gösteriyor, tutar değil. Rakam adres
            görüldükten sonra netleşiyor.
          </p>
        </div>
      </div>
    </section>

    <!-- ======================== 03 — MAHALLELER ======================== -->
    <section
      v-if="bolumler.mahalle"
      class="ilc-bolum ilc-bolum--kagit"
      aria-labelledby="bolum-mahalle"
    >
      <div class="ilc sahne-alan">
        <p class="ilc-no op-kunye">{{ bolumler.mahalle.no }} / {{ bolumler.mahalle.etiket }}</p>
        <h2 id="bolum-mahalle" class="ilc-h2 tip-anlati">{{ ad }} mahalleleri</h2>
        <p class="ilc-mahalle-giris tip-giris">
          Kendi sayfası olan {{ ad }} mahalleleri aşağıda. Listede
          göremediğiniz bir {{ ad }} adresi için de keşif veriyoruz.
        </p>
        <!-- Sayı ile liste AYNI diziden: ikisi ayrı kaynaktan geldiğinde
             "17 MAHALLE" yazıp üç satır göstermek mümkün oluyordu. -->
        <p class="ilc-mahalle-sayi op-kunye">{{ mahalleSatirlari.length }} MAHALLE SAYFASI</p>

        <!-- Kütük düzeni aynı kaldı; tek değişiklik adların bağlantıya
             dönmesi. Hap, kart, ikon ya da durum rozeti eklenmedi. -->
        <ol class="ilc-mahalle-liste">
          <li v-for="(m, i) in mahalleSatirlari" :key="m.ad" class="ilc-mahalle">
            <span class="ilc-mahalle-no op-kunye">{{ String(i + 1).padStart(2, '0') }}</span>
            <NuxtLink v-if="m.yol" :to="`/${m.yol}`" class="ilc-mahalle-ad ilc-mahalle-bag tip-not">
              {{ m.ad }}
            </NuxtLink>
            <span v-else class="ilc-mahalle-ad tip-not">{{ m.ad }}</span>
          </li>
        </ol>
      </div>
    </section>

    <!-- ========================= 04 — HİZMETLER ======================== -->
    <section
      v-if="bolumler.hizmet"
      class="ilc-bolum ilc-bolum--cukur"
      aria-labelledby="bolum-hizmet"
    >
      <div class="ilc sahne-alan">
        <p class="ilc-no op-kunye">{{ bolumler.hizmet.no }} / {{ bolumler.hizmet.etiket }}</p>
        <h2 id="bolum-hizmet" class="ilc-h2 tip-anlati">{{ ad }} için ilgili hizmetler</h2>
        <ul class="ilc-hizmet-liste">
          <li v-for="h in ilgiliHizmetler" :key="h.slug" class="ilc-hizmet">
            <NuxtLink :to="`/${h.slug}`" class="ilc-hizmet-bag tip-alt">{{ h.baslik }}</NuxtLink>
            <p v-if="h.altBaslik" class="ilc-hizmet-alt op-kunye">{{ h.altBaslik }}</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- ========================== 05 — SORULAR ========================= -->
    <section v-if="bolumler.soru" class="ilc-bolum ilc-bolum--kagit" aria-labelledby="bolum-soru">
      <div class="ilc sahne-alan">
        <p class="ilc-no op-kunye">{{ bolumler.soru.no }} / {{ bolumler.soru.etiket }}</p>
        <h2 id="bolum-soru" class="ilc-h2 tip-anlati">{{ ad }} için sık sorulanlar</h2>
        <!-- Akordeon YOK: dört soruyu gizlemek için istemci kodu yüklemenin
             karşılığı yok, hepsi SSR HTML'inde açık duruyor. -->
        <dl class="ilc-sss">
          <div v-for="s in sorular" :key="s.question" class="ilc-sss-oge">
            <dt class="ilc-soru tip-alt">{{ s.question }}</dt>
            <dd class="ilc-cevap tip-not">{{ s.answer }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- ======================= 06 — SONRAKİ ADIM ======================= -->
    <section class="ilc-bolum ilc-bolum--cukur" aria-labelledby="bolum-adim">
      <div class="ilc sahne-alan">
        <p class="ilc-no op-kunye">{{ bolumler.adim.no }} / {{ bolumler.adim.etiket }}</p>
        <h2 id="bolum-adim" class="ilc-h2 tip-anlati">{{ ad }} çevresinde sık taşınılan yönler</h2>

        <ul v-if="guzergahlar.length" class="ilc-guzergah-liste">
          <li v-for="g in guzergahlar" :key="g.ad" class="ilc-guzergah">
            <p class="ilc-guzergah-bas tip-alt">
              <span class="ilc-guzergah-kaynak">{{ ad }}</span>
              <span class="ilc-guzergah-ok op-kunye" aria-hidden="true">&#8594;</span>
              <NuxtLink v-if="g.slug" :to="`/${g.slug}`" class="ilc-guzergah-bag">
                {{ g.ad }}
              </NuxtLink>
              <span v-else>{{ g.ad }}</span>
            </p>
            <p v-if="g.not" class="ilc-guzergah-not tip-not">{{ g.not }}</p>
          </li>
        </ul>

        <p class="ilc-kapanis tip-govde">
          Adres koşullarını birlikte çıkaralım:
          <NuxtLink to="/iletisim" class="op-bag op-bag--sakin ilc-bag">keşif talebi</NuxtLink>
          bırakabilir ya da
          <NuxtLink to="/fiyat-hesaplama" class="op-bag op-bag--sakin ilc-bag">
            fiyat hesaplama aracını
          </NuxtLink>
          kullanabilirsiniz.
        </p>

        <!-- Komşu ilçeler + hub'a dönüş: kart değil, satır. -->
        <nav class="ilc-komsu" aria-label="İlçeler arasında gezinme">
          <NuxtLink v-if="komsular.onceki" :to="`/${komsular.onceki.slug}`" class="ilc-komsu-bag">
            <span class="op-kunye">ÖNCEKİ İLÇE</span>
            <span class="tip-not">{{ komsular.onceki.subtitle || komsular.onceki.title }}</span>
          </NuxtLink>
          <NuxtLink to="/bolgelerimiz" class="ilc-komsu-bag ilc-komsu-bag--hub">
            <span class="op-kunye">TÜM İSTANBUL İLÇELERİ</span>
            <span class="tip-not">Bölgelerimiz</span>
          </NuxtLink>
          <NuxtLink
            v-if="komsular.sonraki"
            :to="`/${komsular.sonraki.slug}`"
            class="ilc-komsu-bag ilc-komsu-bag--sag"
          >
            <span class="op-kunye">SONRAKİ İLÇE</span>
            <span class="tip-not">{{ komsular.sonraki.subtitle || komsular.sonraki.title }}</span>
          </NuxtLink>
        </nav>
      </div>
    </section>
  </main>
</template>

<style scoped>
.ilc-sayfa {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}

/* ============================== GİRİŞ ============================== */
.ilc-giris-kap {
  border-bottom: 1px solid rgb(var(--c-rule));
}
.ilc-giris {
  padding-block: var(--sahne-dikey-dar) var(--sahne-dikey);
}
.ilc-yol-liste {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.5rem;
  margin: 0;
  padding: 0;
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  color: rgb(var(--c-ink-soft));
}
.ilc-yol-oge + .ilc-yol-oge::before {
  content: '/';
  margin-right: 0.5rem;
  color: rgb(var(--c-measure));
}
.ilc-yol a {
  color: rgb(var(--c-ink-soft));
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.ilc-yol a:hover {
  color: rgb(var(--c-ink));
  border-bottom-color: rgb(var(--c-ink));
}
.ilc-yol [aria-current='page'] {
  color: rgb(var(--c-ink));
}

.ilc-kunye {
  margin-top: clamp(2rem, 1.5rem + 2vw, 3.5rem);
}
.ilc-h1 {
  margin-top: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
  max-width: 15ch;
}
.ilc-lead {
  margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}
.ilc-gorsel {
  margin: clamp(2rem, 1.5rem + 1.5vw, 3rem) 0 0;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgb(var(--c-paper-sunken));
}
.ilc-foto {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* =========================== ORTAK BÖLÜM =========================== */
.ilc-bolum--kagit {
  background: rgb(var(--c-paper));
}
.ilc-bolum--cukur {
  background: rgb(var(--c-paper-sunken));
  border-block: 1px solid rgb(var(--c-rule));
}
.ilc {
  padding-block: var(--sahne-dikey);
}
.ilc-no {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.ilc-h2 {
  max-width: 18ch;
  margin: 0;
}
.ilc-h3 {
  margin: 0 0 1rem;
}

/* ---- 01 gövde ---- */
.ilc-govde {
  margin-top: clamp(1.5rem, 1.25rem + 1vw, 2.5rem);
  max-width: var(--olcu-govde);
}

/* ---- 02 künye ---- */
.ilc-kunye-liste {
  margin: clamp(1.5rem, 1.25rem + 1vw, 2.5rem) 0 0;
  padding: 0;
}
.ilc-kunye-oge {
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem);
}
.ilc-kunye-oge:last-child {
  border-bottom: 1px solid rgb(var(--c-rule));
}
.ilc-kunye-etiket {
  margin: 0;
  color: rgb(var(--c-ink-soft));
}
.ilc-kunye-deger {
  margin: 0.375rem 0 0;
  max-width: var(--olcu-govde);
}

/* ---- 02 fiyat tablosu ---- */
.ilc-fiyat {
  margin-top: clamp(2.5rem, 2rem + 2vw, 4rem);
}
.ilc-tablo-kap {
  overflow-x: auto;
}
.ilc-tablo {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}
.ilc-tablo th,
.ilc-tablo td {
  text-align: left;
  vertical-align: top;
  padding: 0.875rem 1rem 0.875rem 0;
  border-bottom: 1px solid rgb(var(--c-rule));
}
.ilc-tablo thead th {
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 500;
  color: rgb(var(--c-ink-soft));
  border-bottom-color: rgb(var(--c-ink));
}
.ilc-tablo tbody th {
  font-weight: 600;
  padding-right: 1.5rem;
}
.ilc-tablo td {
  color: rgb(var(--c-ink-soft));
}
.ilc-tablo-not {
  margin: 1rem 0 0;
  max-width: var(--olcu-govde);
  color: rgb(var(--c-ink-soft));
}

/* ---- 03 mahalleler ---- */
.ilc-mahalle-giris {
  margin: clamp(1rem, 0.85rem + 0.6vw, 1.5rem) 0 0;
  max-width: var(--olcu-govde);
}
.ilc-mahalle-sayi {
  margin: clamp(1.5rem, 1.25rem + 1vw, 2.25rem) 0 0;
  color: rgb(var(--c-ink-soft));
}
.ilc-mahalle-liste {
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
  columns: 1;
}
.ilc-mahalle {
  display: flex;
  gap: 0.875rem;
  align-items: baseline;
  break-inside: avoid;
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: 0.6875rem;
}
.ilc-mahalle-no {
  color: rgb(var(--c-ink-soft));
  font-variant-numeric: tabular-nums;
}
.ilc-mahalle-ad {
  margin: 0;
}
.ilc-mahalle-bag {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid rgb(var(--c-measure));
}
.ilc-mahalle-bag:hover {
  border-bottom-color: rgb(var(--c-ink));
}
.ilc-mahalle-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}

/* ---- 04 hizmetler ---- */
.ilc-hizmet-liste {
  list-style: none;
  margin: clamp(1.5rem, 1.25rem + 1vw, 2.5rem) 0 0;
  padding: 0;
}
.ilc-hizmet {
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}
.ilc-hizmet:last-child {
  border-bottom: 1px solid rgb(var(--c-rule));
}
.ilc-hizmet-bag {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid rgb(var(--c-measure));
}
.ilc-hizmet-bag:hover {
  border-bottom-color: rgb(var(--c-ink));
}
.ilc-hizmet-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}
.ilc-hizmet-alt {
  margin: 0.5rem 0 0;
  color: rgb(var(--c-ink-soft));
}

/* ---- 05 sorular ---- */
.ilc-sss {
  margin: clamp(1.5rem, 1.25rem + 1vw, 2.5rem) 0 0;
  padding: 0;
}
.ilc-sss-oge {
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(1.25rem, 1rem + 0.8vw, 1.75rem);
}
.ilc-sss-oge:last-child {
  border-bottom: 1px solid rgb(var(--c-rule));
}
.ilc-soru {
  margin: 0;
}
.ilc-cevap {
  margin: 0.625rem 0 0;
  max-width: var(--olcu-govde);
  color: rgb(var(--c-ink-soft));
}

/* ---- 06 sonraki adım ---- */
.ilc-guzergah-liste {
  list-style: none;
  margin: clamp(1.5rem, 1.25rem + 1vw, 2.5rem) 0 0;
  padding: 0;
}
.ilc-guzergah {
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem);
}
.ilc-guzergah:last-child {
  border-bottom: 1px solid rgb(var(--c-rule));
}
.ilc-guzergah-bas {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
}
.ilc-guzergah-kaynak {
  color: rgb(var(--c-ink-soft));
}
.ilc-guzergah-ok {
  color: rgb(var(--c-ink-soft));
}
.ilc-guzergah-bag {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid rgb(var(--c-measure));
}
.ilc-guzergah-bag:hover {
  border-bottom-color: rgb(var(--c-ink));
}
.ilc-guzergah-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}
.ilc-guzergah-not {
  margin: 0.5rem 0 0;
  max-width: var(--olcu-govde);
  color: rgb(var(--c-ink-soft));
}

.ilc-kapanis {
  margin: clamp(2rem, 1.75rem + 1vw, 3rem) 0 0;
  max-width: var(--olcu-govde);
}
/* `.op-bag` tek başına duran bir eylem bağlantısı için tasarlandı (44px
   taban yüksekliği); cümle içinde satır aralığını açıyor ve alt çizgi
   metinden kopuyordu. Satır içi kullanım metnin kendi ölçüsüne dönüyor. */
.ilc-bag {
  min-height: 0;
  font-size: inherit;
  font-weight: 600;
  padding-bottom: 0.05em;
}

.ilc-komsu {
  margin-top: clamp(2.5rem, 2rem + 2vw, 4rem);
  border-top: 1px solid rgb(var(--c-rule));
  display: grid;
  gap: 0;
}
.ilc-komsu-bag {
  display: grid;
  gap: 0.375rem;
  padding-block: clamp(1rem, 0.85rem + 0.6vw, 1.375rem);
  border-bottom: 1px solid rgb(var(--c-rule));
  color: rgb(var(--c-ink));
  text-decoration: none;
}
.ilc-komsu-bag .op-kunye {
  color: rgb(var(--c-ink-soft));
}
.ilc-komsu-bag .tip-not {
  margin: 0;
}
.ilc-komsu-bag:hover .tip-not {
  text-decoration: underline;
  text-underline-offset: 4px;
}
.ilc-komsu-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}

/* ============================= MASAÜSTÜ ============================= */
@media (min-width: 1024px) {
  .ilc-giris,
  .ilc {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }

  .ilc-yol {
    grid-column: 1 / 8;
  }
  .ilc-kunye,
  .ilc-h1,
  .ilc-lead {
    grid-column: 2 / 8;
  }
  .ilc-gorsel {
    grid-column: 8 / 13;
    grid-row: 1 / 5;
    align-self: stretch;
    margin: 0;
    aspect-ratio: auto;
    min-height: 22rem;
  }

  .ilc-no {
    grid-column: 1 / 8;
  }
  .ilc-h2 {
    grid-column: 2 / 7;
  }

  /* 01 — gövde metni sağ eksende, kendi ölçüsünü koruyor */
  .ilc-govde {
    grid-column: 7 / 13;
    margin-top: 0;
  }

  /* 02 — künye sağ eksende, fiyat tablosu tam genişlik */
  .ilc-kunye-liste {
    grid-column: 7 / 13;
    margin-top: 0;
  }
  .ilc-fiyat {
    grid-column: 2 / 13;
  }

  /* 03 — giriş sol, sayı ve liste sağ eksende iki sütun */
  .ilc-mahalle-giris {
    grid-column: 2 / 7;
  }
  .ilc-mahalle-sayi {
    grid-column: 7 / 13;
    grid-row: 2;
    margin-top: 0;
  }
  .ilc-mahalle-liste {
    grid-column: 7 / 13;
    grid-row: 3;
    columns: 2;
    column-gap: var(--sahne-kolon-arasi);
  }

  /* 04 · 05 · 06 */
  .ilc-hizmet-liste,
  .ilc-sss,
  .ilc-guzergah-liste {
    grid-column: 7 / 13;
    margin-top: 0;
  }
  .ilc-kapanis {
    grid-column: 2 / 7;
    margin-top: clamp(1.5rem, 1.25rem + 1vw, 2.25rem);
  }
  .ilc-komsu {
    grid-column: 1 / 13;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    /* Alt çizgi ÜÇ PARÇAYA bölünmesin: masaüstünde üç bağlantı yan yana
       duruyor ve her birine ayrı alt kenarlık verildiğinde sütun
       aralıklarında kopuk çizgiler kalıyordu. Çizgi kabın kendisine ait. */
    border-bottom: 1px solid rgb(var(--c-rule));
  }
  .ilc-komsu-bag {
    border-bottom: 0;
  }
  .ilc-komsu-bag--sag {
    text-align: right;
  }
  .ilc-komsu-bag--hub {
    text-align: center;
  }
}

@media (min-width: 1440px) {
  .ilc-mahalle-liste {
    columns: 3;
  }
}
</style>
