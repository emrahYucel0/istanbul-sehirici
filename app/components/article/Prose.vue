<script setup>
/**
 * Yönetim panelinden gelen zengin metni (HTML) basar.
 *
 * NEDEN AYRI BİR BİLEŞEN
 * Eski `pages/[...slug].vue` içinde İKİ farklı tipografi yapılandırması
 * vardı — biri yazılar, biri bölgeler için — ve ikisi birbirini tutmuyordu:
 *
 *   yazı  : prose-headings:text-gray-900 · prose-a:text-blue-600 ·
 *           prose-blockquote:border-blue-500 · prose-blockquote:bg-blue-50
 *   bölge : prose-headings:text-primary   · prose-a:text-primary ·
 *           prose-blockquote:border-secondary
 *
 * Yani aynı sitede aynı türden içerik iki ayrı görünüme sahipti. Tek bir
 * yerde toplandı.
 *
 * MAVİ SINIFLAR — ölçümle doğrulanan durum
 * Yukarıdaki `blue-600 / blue-500 / blue-50` sınıfları class niteliğinde
 * yazılıydı ama EKRANDA GÖRÜNMÜYORLARDI: aynı dosyanın scoped stilindeki
 * `:deep(.prose blockquote)` kuralları daha yüksek özgüllüğe sahipti ve
 * onları eziyordu. Ölçüm (canlı bir yazı sayfasında):
 *     blockquote zemin  rgb(239,242,241)   ← mavi değil
 *     blockquote kenar  rgb(249,191,41)    ← sarı
 * Yani bu bir görünür hata değil, ÖLÜ SINIF yığınıydı. Kaldırıldı.
 *
 * İçerik `sanitizeHtml`'den geçirilir (bkz. utils/sanitizeHtml.ts).
 */
defineProps({
  html: { type: String, default: '' },
})
</script>

<template>
  <!-- İçerik SUNUCUDA temizleniyor (server/utils/sanitizeHtml.ts), API'den
       temiz geliyor. Burada tekrar temizlemek, `sanitize-html` +
       `htmlparser2` paketlerinin (234 KB) her ziyaretçinin tarayıcısına
       inmesi demekti — ölçüldü, bölge sayfasında ön yüklenen JS'in %45'i. -->
  <div class="prose-body" v-html="html" />
</template>

<style scoped>
.prose-body {
  color: rgb(var(--c-ink));
  font-size: 1.0625rem;
  line-height: 1.75;
}

.prose-body :deep(> *:first-child) {
  margin-top: 0;
}

.prose-body :deep(> *:last-child) {
  margin-bottom: 0;
}

.prose-body :deep(h2) {
  margin: 2.5rem 0 1rem;
  font-size: clamp(1.375rem, 1.15rem + 1vw, 1.75rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: rgb(var(--c-ink));
}

.prose-body :deep(h3) {
  margin: 2rem 0 0.75rem;
  font-size: clamp(1.125rem, 1rem + 0.6vw, 1.375rem);
  font-weight: 700;
  line-height: 1.3;
  color: rgb(var(--c-ink));
}

.prose-body :deep(p) {
  margin: 0 0 1.25rem;
  text-wrap: pretty;
  color: rgb(var(--c-ink-muted));
}

.prose-body :deep(ul),
.prose-body :deep(ol) {
  margin: 0 0 1.25rem;
  padding-left: 1.5rem;
  color: rgb(var(--c-ink-muted));
}

.prose-body :deep(ul) {
  list-style: disc;
}

.prose-body :deep(ol) {
  list-style: decimal;
}

.prose-body :deep(li) {
  margin-bottom: 0.5rem;
  padding-left: 0.25rem;
}

.prose-body :deep(li)::marker {
  color: rgb(var(--c-brand-600));
}

.prose-body :deep(strong) {
  font-weight: 600;
  color: rgb(var(--c-ink));
}

/* Alıntı: sarı kenarlık markanın vurgu rengi. Global blockquote stili
   (assets/css/main.css) italik yapıyor; uzun alıntılarda italik okumayı
   zorlaştırdığı için burada normale çekiliyor. */
.prose-body :deep(blockquote) {
  margin: 2rem 0;
  padding: 1.25rem 1.5rem;
  border: 0;
  border-left: 3px solid rgb(var(--c-accent-400));
  border-radius: 0 var(--r-md) var(--r-md) 0;
  background: rgb(var(--c-surface-muted));
  color: rgb(var(--c-ink));
  font-style: normal;
  font-size: 1.0625rem;
}

.prose-body :deep(blockquote p:last-child) {
  margin-bottom: 0;
}

.prose-body :deep(a) {
  color: rgb(var(--c-brand-700));
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.prose-body :deep(a:hover) {
  color: rgb(var(--c-brand-800));
}

.prose-body :deep(img) {
  display: block;
  width: 100%;
  height: auto;
  margin: 2rem 0;
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-md);
}

/* Tablolar dar ekranda sayfayı genişletmesin diye kendi içinde kayar. */
.prose-body :deep(table) {
  display: block;
  width: 100%;
  overflow-x: auto;
  margin: 1.75rem 0;
  border-collapse: collapse;
  font-size: 0.9375rem;
}

.prose-body :deep(th),
.prose-body :deep(td) {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgb(var(--c-line));
  text-align: left;
}

.prose-body :deep(th) {
  font-weight: 600;
  color: rgb(var(--c-ink));
  background: rgb(var(--c-surface-muted));
}

.prose-body :deep(hr) {
  margin: 2.5rem 0;
  border: 0;
  border-top: 1px solid rgb(var(--c-line));
}

@media (max-width: 640px) {
  .prose-body {
    font-size: 1rem;
  }
}
</style>
