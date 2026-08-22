<script setup>
/**
 * İLÇE KARTLARI — bir il sayfasının altında yer alır.
 *
 * İki katmanlı dizin yapısının ikinci katmanı: /bolgelerimiz 81 il kartını
 * gösterir, o ilin ilçeleri de burada listelenir. Böylece ~1.054 bölge
 * sayfasının tamamı en fazla iki tıklama uzakta kalıyor ve her ilçe, kendi
 * ilinin sayfasından DOĞRUDAN bağlantı alıyor (sayfalamaya bölünseydi
 * çoğu ilçe bu bağlantıyı kaybederdi).
 *
 * SAYFALAMA YOK — BİLİNÇLİ
 * Türkiye'de en çok ilçesi olan il İstanbul (39). Yani bu ızgara hiçbir
 * zaman 39 kartı geçmiyor; sayfalamak, ilçelerin çoğunu il sayfasından
 * gelen bağlantıdan mahrum bırakmaktan başka bir işe yaramazdı.
 *
 * YAKA AYRIMI
 * İstanbul'da ilçeler Avrupa/Anadolu olarak ikiye ayrılıyor. Bu, nakliyatta
 * gerçekten fark yaratan bir bilgi: yakalar arası taşımada köprü güzergâhı,
 * geçiş kısıtı ve süre değişiyor. Haritası olmayan illerde tek liste
 * gösteriliyor — özel durum bileşene değil, veriye bağlı.
 */
import { computed } from 'vue'

const props = defineProps({
  /** İlin adı ("İstanbul") — başlık metninde ve yaka haritası seçiminde kullanılır. */
  cityName: { type: String, required: true },
  /** O ile bağlı ilçe kayıtları (il sayfasının kendisi hariç). */
  districts: { type: Array, default: () => [] },
})

const collator = new Intl.Collator('tr-TR')
const labelOf = (region) =>
  region.subtitle?.trim() || region.shortTitle?.trim() || region.title || region.slug
const sortByLabel = (items) => [...items].sort((a, b) => collator.compare(labelOf(a), labelOf(b)))

const groups = computed(() => {
  // Yaka eşlemesi shared/utils/istanbul.ts'te (sunucu da aynı listeyi okuyor).
  const sides = props.cityName === 'İstanbul' ? istanbulYakalari : null
  if (!sides) return [{ key: 'tumu', name: '', items: sortByLabel(props.districts) }]

  const result = sides
    .map((side) => ({
      key: side.anahtar,
      name: side.ad,
      items: sortByLabel(props.districts.filter((region) => side.sluglar.includes(region.slug))),
    }))
    .filter((group) => group.items.length)

  // Haritada olmayan ilçeler (panelden yeni kayıt eklenirse) kaybolmasın.
  const mapped = new Set(sides.flatMap((side) => side.sluglar))
  const rest = sortByLabel(props.districts.filter((region) => !mapped.has(region.slug)))
  if (rest.length) result.push({ key: 'diger', name: 'Diğer İlçeler', items: rest })

  return result
})
</script>

<template>
  <section v-if="districts.length" class="districts" aria-labelledby="ilceler">
    <!-- `scroll-margin-top`: içindekiler bağlantısıyla gelindiğinde başlık
         yapışkan menünün altında kalmasın. -->
    <h2 id="ilceler" class="districts__title text-h3 text-ink">
      {{ cityName }} İlçelerinde Evden Eve Nakliyat
    </h2>
    <p class="mt-2 text-ink-muted">
      {{ cityName }} genelinde hizmet verdiğimiz {{ districts.length }} ilçe. Bölgenizi seçerseniz
      orada tam olarak nasıl çalıştığımızı okuyabilirsiniz.
    </p>

    <div class="mt-8 flex flex-col gap-10">
      <div v-for="group in groups" :key="group.key">
        <h3 v-if="group.name" class="districts__group-title">
          {{ group.name }}
          <span class="districts__count">{{ group.items.length }}</span>
        </h3>

        <ul class="districts__grid">
          <li v-for="district in group.items" :key="district.slug">
            <region-card :region="district" />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.districts {
  margin-top: var(--space-block);
}

.districts__title {
  scroll-margin-top: 6rem;
}

.districts__group-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.625rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid rgb(var(--c-line));
  font-size: 1.0625rem;
  font-weight: 700;
  color: rgb(var(--c-ink));
}

.districts__count {
  padding: 0.125rem 0.5rem;
  border-radius: var(--r-full);
  background: rgb(var(--c-surface-muted));
  color: rgb(var(--c-ink-muted));
  font-size: 0.75rem;
  font-weight: 600;
}

.districts__grid {
  display: grid;
  gap: 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
}

.districts__grid > li {
  display: flex;
}

.districts__grid > li > * {
  width: 100%;
}
</style>
