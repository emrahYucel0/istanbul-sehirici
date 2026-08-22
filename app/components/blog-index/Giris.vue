<script setup>
/**
 * BLOG DİZİNİ — SAYFA GİRİŞİ.
 *
 * DÜZELTİLEN BORÇ: `<h1>` `<main>` DIŞINDAYDI.
 * Sayfa `fixed/PageHeader.vue` kullanıyordu; bant `<main>`den önce
 * basıldığı için ana bölgede hiç başlık yoktu (ölçüldü: `main h1` = 0) ve
 * yazı başlıkları `<h3>` seviyesinden başlıyordu.
 *
 * BAŞLIK VE GİRİŞ GERÇEK İÇERİĞE DAYANIYOR. Kayıtlı on yazının konuları
 * tek tek okundu: hazırlık planı, paketleme, fiyatın neye göre belirlendiği,
 * sigortanın kapsamı, beyaz eşya, eşya sadeleştirme, mevsim, evcil hayvan,
 * depozito ve taşınma günü. Giriş bunları özetliyor — kapsamadığı bir konu
 * vaat etmiyor.
 *
 * GÖRSEL YOK: dizinin işi yazıları taratmak, sahne kurmak değil.
 */
defineProps({
  /** `InternalPageSection('blog', 'giris')` — dizinin editoryal girişi. */
  bolum: { type: Object, default: () => ({}) },

  /** Kayıtlı toplam yazı sayısı — künye satırı bunu yazıyor. */
  yaziSayisi: { type: Number, default: 0 },
})
</script>

<template>
  <section class="bg-kap" aria-labelledby="blog-baslik">
    <div class="bg sahne-alan">
      <nav class="bg-yol" aria-label="Yol izi">
        <ol class="bg-yol-liste" itemscope itemtype="https://schema.org/BreadcrumbList">
          <li
            class="bg-yol-oge"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <NuxtLink to="/" itemprop="item"><span itemprop="name">Ana sayfa</span></NuxtLink>
            <meta itemprop="position" content="1" />
          </li>
          <li
            class="bg-yol-oge"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <span itemprop="name" aria-current="page">Blog</span>
            <meta itemprop="position" content="2" />
          </li>
        </ol>
      </nav>

      <p class="bg-kunye op-kunye">
        BİLGİ / BLOG<span v-if="yaziSayisi"> / {{ yaziSayisi }} YAZI</span>
      </p>

      <h1 id="blog-baslik" class="bg-h1 tip-baslik">
        {{ bolum.heading }}
      </h1>

      <p v-if="bolum.lead" class="bg-giris tip-giris">{{ bolum.lead }}</p>
    </div>
  </section>
</template>

<style scoped>
.bg-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
  border-bottom: 1px solid rgb(var(--c-rule));
}
.bg {
  padding-block: var(--sahne-dikey-dar) var(--sahne-dikey);
}

/* ---- Yol izi ----------------------------------------------------------- */
.bg-yol-liste {
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
.bg-yol-oge + .bg-yol-oge::before {
  content: '/';
  margin-right: 0.5rem;
  color: rgb(var(--c-measure));
}
.bg-yol a {
  color: rgb(var(--c-ink-soft));
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.bg-yol a:hover {
  color: rgb(var(--c-ink));
  border-bottom-color: rgb(var(--c-ink));
}
.bg-yol [aria-current='page'] {
  color: rgb(var(--c-ink));
}

.bg-kunye {
  margin-top: clamp(2rem, 1.5rem + 2vw, 3.5rem);
}
.bg-h1 {
  margin-top: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
  max-width: 17ch;
}
.bg-giris {
  margin-top: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);
}

@media (min-width: 1024px) {
  .bg {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    align-items: start;
  }
  .bg-yol {
    grid-column: 1 / 9;
  }
  .bg-kunye {
    grid-column: 2 / 8;
  }
  .bg-h1 {
    grid-column: 2 / 8;
  }
  /* Giriş D alanında: liste bir ekran aşağı itilmiyor. */
  .bg-giris {
    grid-column: 8 / 13;
    grid-row: 3 / 5;
    align-self: end;
    margin-top: 0;
  }
}
</style>
