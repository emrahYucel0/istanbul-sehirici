<script setup>
/**
 * 01 / HESABI OLUŞTUR — hesaplayıcı.
 *
 * Eski `base/PriceEstimator.vue`'nun yerini alıyor. O bileşen duruyor ama
 * artık kullanılmıyor.
 *
 * ─────────────────────────────────────────────────────────────────────
 * FORMÜL DEĞİŞMEDİ, İŞ KATSAYILARI DEĞİŞMEDİ.
 *
 * Aritmetik `app/utils/fiyat.ts`'e taşındı (test edilebilsin diye);
 * katsayılar yine `/api/price-estimator` üzerinden panelden geliyor.
 * Bu bileşen tek bir iş rakamı tanımlamıyor.
 *
 * ─────────────────────────────────────────────────────────────────────
 * DÜZELTİLEN İKİ HATA
 *
 * 1. GİZLİ VARSAYILAN. `odaId`/`mesafeId` `null` başlıyordu ve seçim
 *    listelerinde bu değere karşılık gelen bir seçenek yoktu — ölçüldü:
 *    açılışta iki listede de `selectedIndex = -1`, yani ekranda HİÇBİR ŞEY
 *    seçili görünmüyordu. Buna karşılık hesap sessizce üçüncü seçeneğe
 *    (2+1) ve ilk mesafeye düşüyor, ekranda "38.500 – 51.500 TL"
 *    yazıyordu. Kullanıcı, neye ait olduğunu göremediği bir fiyat
 *    görüyordu.
 *
 *    Düzeltme, HESABI DEĞİL GÖRÜNÜRLÜĞÜ değiştiriyor: aynı iki varsayılan
 *    artık listelerde de seçili duruyor. Açılış tutarı birebir aynı.
 *
 * 2. SINIRSIZ KAT. Alan `max="30"` ilan ediyordu ama tarayıcı bunu yalnız
 *    form doğrulamasında uygular ve burada form yok. Ölçüldü: kata 999
 *    yazıldığında araç "1.718.000 – 2.324.000 TL" gösteriyordu. Sınırlama
 *    artık hesabın içinde (bkz. fiyat.ts) ve alandan çıkıldığında değer
 *    görünür biçimde de düzeltiliyor.
 *
 * ─────────────────────────────────────────────────────────────────────
 * KODA GÖMÜLÜ YEDEK RAKAMLAR KALDIRILDI.
 *
 * Eski bileşen, API'ye ulaşılamazsa devreye giren bir yedek katsayı kümesi
 * taşıyordu. Ölçüldü: bu rakamlar panelde duran gerçek değerlerin yaklaşık
 * dörtte biriydi (kat ücreti 450'ye karşı 2.000; 2+1 tabanı 12.000'e karşı
 * 45.000). Yedek devreye girse kullanıcı sessizce yanlış bir fiyat
 * görürdü. Artık katsayı okunamazsa RAKAM GÖSTERİLMİYOR; kullanıcı doğrudan
 * iletişime yönlendiriliyor.
 *
 * HESAP İSTEMCİDE KALIYOR: sunucuya istek gitmiyor, tahminin gizli tutulacak
 * bir tarafı yok ve anında tepki veriyor.
 */
import { computed, ref } from 'vue'
import { tahminiAralik, tlYaz, KAT_EN_AZ, KAT_EN_COK } from '~/utils/fiyat'

const { data: ayarYanit } = await useFetch('/api/price-estimator', {
  key: 'price-estimator',
  // Sayfa yüküne yalnız hesabın okuduğu alanlar iniyor.
  transform: (yanit) => {
    const k = yanit?.data
    if (!k) return null
    return {
      floorFee: k.floorFee,
      packingMultiplier: k.packingMultiplier,
      storageFee: k.storageFee,
      rangePercent: k.rangePercent,
      roundTo: k.roundTo,
      not: String(k.note ?? '').trim(),
      odalar: (k.sizes || []).map((o) => ({ id: o.id, ad: o.label, taban: o.basePrice })),
      mesafeler: (k.distances || []).map((m) => ({ id: m.id, ad: m.label, carpan: m.multiplier })),
    }
  },
})

const ayar = computed(() => ayarYanit.value ?? null)
const odalar = computed(() => ayar.value?.odalar ?? [])
const mesafeler = computed(() => ayar.value?.mesafeler ?? [])

/** Araç ancak hem taban listesi hem mesafe listesi varsa çalışabilir. */
const kullanilabilir = computed(() => odalar.value.length > 0 && mesafeler.value.length > 0)

/**
 * VARSAYILANLAR ARTIK GÖRÜNÜR.
 * Eski davranışta hesap üçüncü odaya ve ilk mesafeye düşüyordu; aynı iki
 * seçim korunuyor, tek fark listede de seçili görünmeleri.
 */
const VARSAYILAN_ODA_SIRASI = 2

const form = ref({
  odaId: null,
  mesafeId: null,
  cikisKat: 2,
  cikisAsansor: true,
  varisKat: 2,
  varisAsansor: true,
  paketleme: false,
  depolama: false,
})

watchEffect(() => {
  if (form.value.odaId === null && odalar.value.length) {
    form.value.odaId = (odalar.value[VARSAYILAN_ODA_SIRASI] ?? odalar.value[0]).id
  }
  if (form.value.mesafeId === null && mesafeler.value.length) {
    form.value.mesafeId = mesafeler.value[0].id
  }
})

const seciliOda = computed(() => odalar.value.find((o) => o.id === form.value.odaId) ?? null)
const seciliMesafe = computed(
  () => mesafeler.value.find((m) => m.id === form.value.mesafeId) ?? null
)

/** Alandan çıkıldığında değeri ilan edilen aralığa çekiyor. */
const katiDuzelt = (alan) => {
  const ham = Number(form.value[alan])
  const guvenli = Number.isFinite(ham) ? Math.min(Math.max(Math.floor(ham), KAT_EN_AZ), KAT_EN_COK) : 0
  form.value[alan] = guvenli
}

/**
 * KAT ALANININ İKİ SESSİZ DAVRANIŞI ARTIK YAZILI.
 *
 * ─────────────────────────────────────────────────────────────────────
 * 1. SINIRLAMA SESSİZDİ. `katiDuzelt` alandan çıkıldığında 999'u 30'a,
 *    −5'i 0'a, 3,7'yi 3'e çekiyor — doğru davranış ve KORUNUYOR, ama
 *    ölçüldüğünde hiçbir açıklama yoktu: kullanıcı yazdığı sayının neden
 *    değiştiğini göremiyordu. Aralık artık alanın altında yazılı.
 *
 * 2. ASANSÖR VARKEN ALAN ETKİSİZDİ. Formül gereği asansör varsa kat
 *    tutarı değiştirmiyor (bkz. utils/fiyat.ts → `katEki`). Ölçüldü:
 *    kat 2 → 20 yapıldığında tutar birebir aynı kalıyordu ve kontrol
 *    bunu hiçbir biçimde söylemiyordu.
 *
 * NEDEN `disabled` DEĞİL: alan devre dışı bırakılsaydı klavye sırasından
 * çıkardı ve kullanıcı asansör kutusunu kaldırdığında geri gelen alanın
 * odağı kaybolurdu. Değer ayrıca hâlâ anlamlı — kutu kaldırıldığı anda
 * hesaba giriyor. `readonly` de aynı sebeple kullanılmadı.
 *
 * HESAP KURALI DEĞİŞMEDİ. Buradaki her şey yalnız sunum.
 */
const KAT_ARALIGI_METNI = `Kat ${KAT_EN_AZ}–${KAT_EN_COK} arasında kullanılır.`
const ASANSOR_ETKISIZ_METNI = 'Asansör varken kat, tutarı değiştirmiyor.'

/**
 * Alanın `aria-describedby` listesi. Asansör notu yalnız ekrandayken
 * listeye giriyor: var olmayan bir `id`ye işaret eden `aria-describedby`
 * geçersiz olurdu.
 */
const katYardimId = (yer, asansorVar) =>
  [`fh-${yer}-aralik`, asansorVar ? `fh-${yer}-asansor` : null].filter(Boolean).join(' ')

const sonuc = computed(() => {
  if (!ayar.value || !seciliOda.value || !seciliMesafe.value) return null
  return tahminiAralik(
    {
      taban: seciliOda.value.taban,
      mesafeCarpani: seciliMesafe.value.carpan,
      cikisKat: form.value.cikisKat,
      cikisAsansor: form.value.cikisAsansor,
      varisKat: form.value.varisKat,
      varisAsansor: form.value.varisAsansor,
      paketleme: form.value.paketleme,
      depolama: form.value.depolama,
    },
    ayar.value
  )
})

/**
 * Sonucun altındaki özet: kullanıcının hangi seçimlerin karşılığını
 * gördüğünü tek bakışta söylüyor. Rozet duvarı değil, kısa bir kütük.
 */
const ozet = computed(() => {
  if (!sonuc.value) return []
  const kat = (k, asansor) => `${k}. kat · ${asansor ? 'asansör var' : 'asansör yok'}`
  const liste = [
    { etiket: 'EV', deger: seciliOda.value.ad },
    { etiket: 'MESAFE', deger: seciliMesafe.value.ad },
    { etiket: 'ÇIKIŞ', deger: kat(form.value.cikisKat, form.value.cikisAsansor) },
    { etiket: 'VARIŞ', deger: kat(form.value.varisKat, form.value.varisAsansor) },
  ]
  const ekler = []
  if (form.value.paketleme) ekler.push('paketleme')
  if (form.value.depolama) ekler.push('depolama')
  if (ekler.length) liste.push({ etiket: 'EK', deger: ekler.join(' · ') })
  return liste
})

/**
 * Panelden gelen uyarı metni. Yedek metin, panel alanı boş kalırsa
 * basılıyor ve iddia taşımıyor.
 */
const uyari = computed(
  () =>
    ayar.value?.not ||
    'Bu bir ön tahmindir, teklif değildir. Kesinleşen tutar, iki adres görüldükten sonra netleşir.'
)

/** `InternalPageSection('fiyat', 'arac')` — YALNIZ başlık. */
defineProps({
  bolum: { type: Object, default: () => ({}) },
})
</script>

<template>
  <section class="fh-kap" aria-labelledby="hesap-baslik">
    <div class="fh sahne-alan">
      <p class="fh-kunye op-kunye">01 / HESABI OLUŞTUR</p>
      <h2 id="hesap-baslik" class="fh-h2 tip-anlati">{{ bolum.heading }}</h2>

      <!-- Katsayılar okunamadı: RAKAM GÖSTERİLMİYOR (bkz. yukarıdaki not). -->
      <div v-if="!kullanilabilir" class="fh-yok">
        <p class="fh-yok-baslik op-kunye">HESAPLAMA ŞU AN KULLANILAMIYOR</p>
        <p class="fh-yok-metin tip-govde">
          Fiyat katsayıları yüklenemedi. Eski bir rakam göstermektense hiç
          göstermemeyi tercih ediyoruz. Taşınmanızı anlatırsanız aralığı
          birlikte çıkaralım:
          <NuxtLink to="/iletisim" class="op-bag op-bag--sakin fh-satir-bag"
            >iletişim sayfası</NuxtLink
          >.
        </p>
      </div>

      <template v-else>
        <div class="fh-form">
          <div class="fh-alan">
            <label for="fh-oda" class="fh-etiket">Evin büyüklüğü</label>
            <select id="fh-oda" v-model="form.odaId" class="fh-girdi">
              <option v-for="o in odalar" :key="o.id" :value="o.id">{{ o.ad }}</option>
            </select>
          </div>

          <div class="fh-alan">
            <label for="fh-mesafe" class="fh-etiket">Mesafe</label>
            <select id="fh-mesafe" v-model="form.mesafeId" class="fh-girdi">
              <option v-for="m in mesafeler" :key="m.id" :value="m.id">{{ m.ad }}</option>
            </select>
          </div>

          <!--
            İKİ ADRES AYNI DESENİ KULLANIYOR ama `id`ler ayrı olmak
            zorunda: her kat alanı KENDİ yardımcı metnine bağlanıyor.
            Çıkışta asansör varken varış alanının notu değişmiyor.
          -->
          <fieldset class="fh-grup">
            <legend class="fh-legend op-kunye">ÇIKIŞ ADRESİ</legend>
            <div class="fh-ikili">
              <div class="fh-alan fh-alan--dar" :class="{ 'fh-alan--pasif': form.cikisAsansor }">
                <label for="fh-cikis-kat" class="fh-etiket">Kat</label>
                <input
                  id="fh-cikis-kat"
                  v-model.number="form.cikisKat"
                  class="fh-girdi"
                  type="number"
                  inputmode="numeric"
                  :min="KAT_EN_AZ"
                  :max="KAT_EN_COK"
                  step="1"
                  :aria-describedby="katYardimId('cikis', form.cikisAsansor)"
                  @blur="katiDuzelt('cikisKat')"
                />
              </div>
              <label class="fh-onay">
                <input v-model="form.cikisAsansor" type="checkbox" class="fh-kutu" />
                <span>Asansör var</span>
              </label>
            </div>
            <!-- CANLI BÖLGE DEĞİL. `role="alert"` ya da `aria-live`
                 konmuyor: sayfadaki tek canlı bölge `<output>` ve iç içe
                 duyuru aynı değişikliği iki kez okutur. Bu metinler
                 `aria-describedby` ile alana bağlı; ekran okuyucu onları
                 alana ODAKLANDIĞINDA okuyor. -->
            <p class="fh-yardim tip-not">
              <span id="fh-cikis-aralik">{{ KAT_ARALIGI_METNI }}</span>
              <span v-if="form.cikisAsansor" id="fh-cikis-asansor">{{ ASANSOR_ETKISIZ_METNI }}</span>
            </p>
          </fieldset>

          <fieldset class="fh-grup">
            <legend class="fh-legend op-kunye">VARIŞ ADRESİ</legend>
            <div class="fh-ikili">
              <div class="fh-alan fh-alan--dar" :class="{ 'fh-alan--pasif': form.varisAsansor }">
                <label for="fh-varis-kat" class="fh-etiket">Kat</label>
                <input
                  id="fh-varis-kat"
                  v-model.number="form.varisKat"
                  class="fh-girdi"
                  type="number"
                  inputmode="numeric"
                  :min="KAT_EN_AZ"
                  :max="KAT_EN_COK"
                  step="1"
                  :aria-describedby="katYardimId('varis', form.varisAsansor)"
                  @blur="katiDuzelt('varisKat')"
                />
              </div>
              <label class="fh-onay">
                <input v-model="form.varisAsansor" type="checkbox" class="fh-kutu" />
                <span>Asansör var</span>
              </label>
            </div>
            <p class="fh-yardim tip-not">
              <span id="fh-varis-aralik">{{ KAT_ARALIGI_METNI }}</span>
              <span v-if="form.varisAsansor" id="fh-varis-asansor">{{ ASANSOR_ETKISIZ_METNI }}</span>
            </p>
          </fieldset>

          <fieldset class="fh-grup">
            <legend class="fh-legend op-kunye">EK HİZMET</legend>
            <label class="fh-onay">
              <input v-model="form.paketleme" type="checkbox" class="fh-kutu" />
              <span>Paketlemeyi biz yapalım</span>
            </label>
            <label class="fh-onay">
              <input v-model="form.depolama" type="checkbox" class="fh-kutu" />
              <span>Eşya bir süre depoda kalacak</span>
            </label>
          </fieldset>
        </div>

        <!--
          CANLI BÖLGE TEK YERDE: `<output>`.
          Bu etiket örtük olarak `aria-live="polite"` taşıyor — hesaplanmış
          bir sonuç için tarayıcıların ve ekran okuyucuların beklediği desen
          bu. Kapsayıcıya ikinci bir `aria-live` KONMUYOR: iç içe canlı bölge
          aynı değişikliği iki kez duyurabiliyor, `aria-live="off"` ile
          bastırmak ise sonucu tamamen sessizleştiriyor.

          Özet kütüğü ve uyarı metni bilerek canlı bölgenin DIŞINDA: onlar
          sonucu açıklayan yardımcı içerik, her seçimde yeniden okunmaları
          gürültü olurdu.
        -->
        <div class="fh-sonuc">
          <p class="fh-sonuc-etiket op-kunye">TAHMİNİ ARALIK</p>

          <!-- TUTAR ↔ UYARI BAĞI.
               Ekran okuyucu tutarı duyuyordu ama "teklif değildir"
               cümlesi bağlantısız ayrı bir paragraftı; kullanıcı rakamı
               bağlamı olmadan alabiliyordu. `aria-describedby` ikisini
               bağlıyor. YENİ CANLI BÖLGE YOK: `<output>`un örtük
               `aria-live`ı olduğu gibi duruyor, uyarı metni onun İÇİNE
               taşınmadı — her seçimde tekrar okunması gürültü olurdu. -->
          <output v-if="sonuc" class="fh-tutar" aria-describedby="fh-uyari">
            {{ tlYaz(sonuc.alt) }} – {{ tlYaz(sonuc.ust) }}
            <span class="fh-birim">TL</span>
          </output>
          <p v-else class="fh-tutar fh-tutar--yok">—</p>

          <dl v-if="ozet.length" class="fh-ozet">
            <div v-for="o in ozet" :key="o.etiket" class="fh-ozet-oge">
              <dt class="fh-ozet-etiket op-kunye">{{ o.etiket }}</dt>
              <dd class="fh-ozet-deger">{{ o.deger }}</dd>
            </div>
          </dl>

          <!-- `id` KARARLI: yukarıdaki `<output>` buna bağlanıyor. -->
          <p id="fh-uyari" class="fh-uyari tip-not">{{ uyari }}</p>

          <NuxtLink to="/iletisim" class="fh-cta">Taşıma ayrıntılarını paylaşın</NuxtLink>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.fh-kap {
  background: rgb(var(--c-paper-sunken));
  color: rgb(var(--c-ink));
}
.fh {
  padding-block: var(--sahne-dikey);
}
.fh-kunye {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.fh-h2 {
  max-width: 16ch;
}

/* ---- Katsayı yok durumu ------------------------------------------------ */
.fh-yok {
  margin-top: clamp(1.5rem, 1.25rem + 1vw, 2.5rem);
  padding-left: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem);
  border-left: 3px solid rgb(var(--c-signal-deep));
}
.fh-yok-baslik {
  margin: 0;
  color: rgb(var(--c-ink));
}
.fh-yok-metin {
  margin: 0.5rem 0 0;
  max-width: var(--olcu-govde);
}

/* ---- Form -------------------------------------------------------------- */
.fh-form {
  margin-top: clamp(1.75rem, 1.5rem + 1vw, 2.75rem);
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 1rem + 0.8vw, 1.75rem);
}
.fh-alan {
  display: flex;
  flex-direction: column;
}
.fh-alan--dar {
  max-width: 7rem;
}
.fh-etiket {
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgb(var(--c-ink));
}

/* ---- Kat alanı asansör varken İKİNCİL ----------------------------------
   Alan devre dışı DEĞİL — yalnız vurgusu düşüyor, çünkü o an hesaba
   girmiyor (bkz. script bloğu). Geri çekilen şey ETİKET; girdinin kendi
   çizgisi `--c-measure` tonunda kalıyor, yani WCAG 1.4.11 sınırı hiçbir
   durumda gevşemiyor. `opacity` kullanılmadı: kontrolün metnini de
   soldururdu ve kontrastı ölçülemez hâle getirirdi. */
.fh-alan--pasif .fh-etiket {
  /* Kâğıt üzerinde 6,54:1 — ikincil ama AA metin eşiğinin üstünde. */
  color: rgb(var(--c-ink-soft));
  font-weight: 500;
}

/* ---- Alan altı yardımcı metin ------------------------------------------
   Punto kütükten (`tip-not`); burada yalnız yerleşim ve ayrım var.
   İki cümle yan yana dizilebiliyor, dar ekranda alt alta iniyor. */
.fh-yardim {
  margin: 0.625rem 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  max-width: var(--olcu-govde);
}
.fh-girdi {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem 0.875rem;
  /* Köşe yarıçapı ve gölge YOK — V2 dilinde kutu değil, çizgi.
     TON `--c-rule` DEĞİL. Ölçüldü: dekoratif ayraç tonu bu çukur zeminde
     1,42:1 veriyor ve kontrolün nerede başlayıp bittiğini gösteren TEK
     işaret bu çizgi — WCAG 2.1 SC 1.4.11 kullanıcı arayüzü bileşeninin
     sınırı için 3:1 istiyor. `tokens.css` zaten aynı şeyi söylüyor:
     "bilgi taşıyan her çizgi `--c-measure` kullanır". Aynı çözüm sitede
     `contact/TalepFormu.vue` girdilerinde de var. */
  border: 1px solid rgb(var(--c-measure));
  border-radius: 0;
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
  /* 16 px altı, mobil Safari'de odakta sayfayı yakınlaştırıyor. */
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  min-height: 48px;
}
/* Üç kademeli çizgi: durağan `--c-measure`, hover `--c-ink-soft`, odak
   `--c-ink`. Hover eskiden `--c-measure`ydı; taban o tona çıkınca hover
   ile durağan hâl aynı olurdu ve affordance kaybolurdu. Yeni renk
   üretilmedi, aynı mürekkep ailesinde bir kademe yukarı çıkıldı. */
.fh-girdi:hover {
  border-color: rgb(var(--c-ink-soft));
}
.fh-girdi:focus {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 2px;
  border-color: rgb(var(--c-ink));
}

.fh-grup {
  margin: 0;
  padding: 0;
  border: 0;
  border-top: 1px solid rgb(var(--c-rule));
  padding-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}
.fh-legend {
  padding: 0;
  color: rgb(var(--c-ink-soft));
}
.fh-ikili {
  display: flex;
  align-items: flex-end;
  gap: clamp(1rem, 0.85rem + 1vw, 2rem);
  flex-wrap: wrap;
  margin-top: 0.75rem;
}
.fh-onay {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  /* Dokunma hedefi: kutucuk 13 px, etiketin tamamı tıklanabilir ve
     satır 44 px'e tamamlanıyor. */
  min-height: 44px;
  font-size: 1rem;
  color: rgb(var(--c-ink));
  cursor: pointer;
}
.fh-grup .fh-onay {
  display: flex;
  margin-top: 0.25rem;
}
.fh-kutu {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: rgb(var(--c-signal));
  cursor: pointer;
}
.fh-kutu:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 3px;
}

/* ---- Sonuç ------------------------------------------------------------- */
.fh-sonuc {
  margin-top: clamp(2rem, 1.5rem + 1.5vw, 3rem);
  padding-top: clamp(1.25rem, 1rem + 1vw, 2rem);
  border-top: 2px solid rgb(var(--c-ink));
}
.fh-sonuc-etiket {
  margin: 0;
  color: rgb(var(--c-ink-soft));
}
.fh-tutar {
  display: block;
  margin-top: 0.5rem;
  /* Rakamlar mono ve sabit genişlikli: değer değişirken satır zıplamıyor. */
  font-family: var(--f-mono);
  font-variant-numeric: tabular-nums;
  font-size: clamp(1.75rem, 1.25rem + 2.4vw, 3rem);
  line-height: 1.15;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: rgb(var(--c-ink));
}
.fh-tutar--yok {
  color: rgb(var(--c-ink-soft));
}
.fh-birim {
  font-size: 0.45em;
  letter-spacing: 0.08em;
  color: rgb(var(--c-ink-soft));
}

.fh-ozet {
  margin: clamp(1.25rem, 1rem + 0.8vw, 1.75rem) 0 0;
  padding: 0;
  border-bottom: 1px solid rgb(var(--c-rule));
}
.fh-ozet-oge {
  display: grid;
  grid-template-columns: minmax(0, 7rem) minmax(0, 1fr);
  gap: 0 1rem;
  align-items: baseline;
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: 0.5rem;
}
.fh-ozet-etiket {
  margin: 0;
  color: rgb(var(--c-ink-soft));
}
.fh-ozet-deger {
  margin: 0;
  font-size: 0.9375rem;
}

.fh-uyari {
  margin: clamp(1.25rem, 1rem + 0.8vw, 1.75rem) 0 0;
  max-width: var(--olcu-govde);
  color: rgb(var(--c-ink-soft));
}

.fh-cta {
  display: inline-flex;
  align-items: center;
  margin-top: clamp(1.25rem, 1rem + 0.8vw, 1.75rem);
  min-height: 52px;
  padding: 0.875rem 2rem;
  border-radius: 0;
  background: rgb(var(--c-ink));
  color: rgb(var(--c-paper));
  font-family: var(--f-mono);
  font-size: 0.8125rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
}
.fh-cta:hover {
  background: rgb(var(--c-signal-deep));
}
.fh-cta:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}

.fh-satir-bag {
  min-height: 0;
  font-size: inherit;
  font-weight: 600;
  padding-bottom: 0.05em;
}

/* ===========================================================================
   MASAÜSTÜ — form B ekseninde, sonuç D alanında (aynı anda görünüyorlar)
   ======================================================================== */
/* ===========================================================================
   TABLET BANDI — ARAÇ EKRANIN TAMAMINA YAYILMIYOR
   ───────────────────────────────────────────────────────────────────────
   ÖLÇÜLEN SORUN (834×1112)
   Masaüstü ızgarası 1024'te açılıyor; altında her şey tek sütun ve kabın
   tam genişliğinde. 834'te bu, altı seçenekli bir açılır listenin 768px
   olması demekti — masaüstündeki karşılığının (1024'te 381px) iki katı.
   Araç tablet ölçeğinde "gerilmiş mobil" okunuyordu.

   ÇÖZÜM YENİ BİR SİSTEM DEĞİL: tek sütun KALIYOR, yalnız ölçüsü
   sınırlanıyor. 30rem (480px) keyfi değil — masaüstü ızgarasının kendi
   ürettiği aralığın (1024'te 381px, 1920'de 528px) içinde duruyor, yani
   sayfa zaten bu genişlikte bir form sütununu doğru sayıyor.

   SINIR YALNIZ 1024'ÜN ALTINDA: mevcut breakpoint sözleşmesinin
   tamamlayıcısı, yeni bir kırılım noktası icat edilmedi. 520px'in
   altındaki ekranlarda hiçbir etkisi yok (390'da sütun zaten 350px).

   SONUÇ PANELİ DE AYNI ÖLÇÜDE. Yalnız form sınırlansaydı sonucun üst
   çizgisi formun 288px sağına taşar ve iki blok hizasız kalırdı; ikisi
   aynı sütunda duruyor. Masaüstü ızgarası (aşağıda) bu kuralın dışında —
   orada ikisi zaten ayrı kolonlarda. */
@media (max-width: 1023px) {
  .fh-form,
  .fh-sonuc {
    max-width: 30rem;
  }
}

@media (min-width: 1024px) {
  .fh {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }
  .fh-kunye {
    grid-column: 1 / 8;
  }
  .fh-h2 {
    grid-column: 2 / 8;
  }
  .fh-form {
    grid-column: 2 / 7;
    grid-row: 3;
  }
  .fh-yok {
    grid-column: 2 / 9;
    grid-row: 3;
  }
  /* Sonuç yapışkan: uzun formda seçim değiştikçe tutar ekranda kalıyor. */
  .fh-sonuc {
    grid-column: 8 / 13;
    grid-row: 2 / 4;
    margin-top: 0;
    position: sticky;
    top: 6rem;
  }
}
</style>
