<script setup>
/**
 * GEÇİCİ — tipografi karşılaştırma sayfası.
 *
 * Amaç tek bir soruyu cevaplamak: Archivo, Inter'e göre BELİRGİN bir
 * karakter kazancı sağlıyor mu? Bayt ölçüsü zaten alındı; burada
 * karşılaştırılan şey ses.
 *
 * Aynı metin, aynı ölçek, aynı renk — değişen tek şey yazı tipi.
 * Doğrulama bitince silinecek.
 */
definePageMeta({ layout: false })
useHead({ title: 'Tipografi karşılaştırma', meta: [{ name: 'robots', content: 'noindex' }] })

const H1 = "İstanbul'da taşınmak, ölçülü bir iştir."
const GOVDE =
  'Dar sokak, asansörsüz kat, dört katlı apartman. Şehri biliyoruz; taşımayı ona göre planlıyoruz. Ağırlık, kat ve mesafe keşifte yerinde ölçülür.'
const AGIRLIKLAR = [500, 600, 700, 800]
</script>

<template>
  <main class="tp">
    <header class="tp-ust">
      <p class="tp-kunye">TİPOGRAFİ / KARŞILAŞTIRMA</p>
      <p class="tp-not">
        Aynı metin, aynı ölçek. Değişen tek şey yazı tipi.
      </p>
    </header>

    <section v-for="aile in ['inter', 'archivo']" :key="aile" class="tp-blok" :class="`tp--${aile}`">
      <p class="tp-etiket">{{ aile === 'inter' ? 'INTER (mevcut)' : 'ARCHIVO (aday)' }}</p>

      <div v-for="w in AGIRLIKLAR" :key="w" class="tp-satir">
        <span class="tp-w">{{ w }}</span>
        <p class="tp-h1" :style="{ fontWeight: w }">{{ H1 }}</p>
      </div>

      <p class="tp-govde">{{ GOVDE }}</p>

      <p class="tp-turkce">Ğ ğ İ ı Ş ş Ç ç Ö ö Ü ü ₺ &nbsp; ILIĞ ışık — İSTANBUL</p>
    </section>

    <section class="tp-blok">
      <p class="tp-etiket">KARAKTER KATMANI — JetBrains Mono</p>
      <p class="tp-mono">İSTANBUL / EVDEN EVE NAKLİYAT</p>
      <p class="tp-mono">HİZMET BÖLGESİ · 39 İLÇE · 0535 529 81 92</p>
      <p class="tp-mono tp-mono--kucuk">01 02 03 04 / KEŞİF · PAKETLEME · TAŞIMA · YERLEŞİM</p>
      <p class="tp-not">Not: JetBrains Mono'da ₺ glifi YOK — bu satırda ₺ 12.000 gövde yazı tipine düşer.</p>
    </section>
  </main>
</template>

<style scoped>
@font-face {
  font-family: 'ArchivoTest';
  src: url('/fonts/archivo.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: block;
}
@font-face {
  font-family: 'JetBrainsMonoTest';
  src: url('/fonts/jetbrains-mono.woff2') format('woff2-variations');
  font-weight: 100 800;
  font-display: block;
}

.tp {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
  padding: 2rem clamp(1.25rem, 0.5rem + 3vw, 4rem) 5rem;
}
.tp-ust {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgb(var(--c-rule));
}
.tp-kunye,
.tp-etiket {
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  color: rgb(var(--c-measure));
  margin: 0;
}
.tp-not {
  font-size: 0.8125rem;
  color: rgb(var(--c-ink-soft));
  margin: 0.5rem 0 0;
}
.tp-blok {
  padding: 2rem 0;
  border-bottom: 1px solid rgb(var(--c-rule));
}
.tp-satir {
  display: flex;
  gap: 1rem;
  align-items: baseline;
  margin-top: 1rem;
}
.tp-w {
  font-family: var(--f-mono);
  font-size: 0.625rem;
  color: rgb(var(--c-measure));
  flex: 0 0 2.5rem;
}
.tp-h1 {
  font-size: clamp(1.75rem, 1.2rem + 2.4vw, 3rem);
  line-height: 1.05;
  letter-spacing: -0.032em;
  margin: 0;
}
.tp-govde {
  font-size: 1rem;
  line-height: 1.65;
  color: rgb(var(--c-ink-soft));
  max-width: 38ch;
  margin: 1.75rem 0 0;
}
.tp-turkce {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 1.25rem 0 0;
}

/* Aileler */
.tp--inter,
.tp--inter .tp-h1,
.tp--inter .tp-govde,
.tp--inter .tp-turkce {
  font-family: 'Inter', system-ui, sans-serif;
}
.tp--archivo,
.tp--archivo .tp-h1,
.tp--archivo .tp-govde,
.tp--archivo .tp-turkce {
  font-family: 'ArchivoTest', system-ui, sans-serif;
}

.tp-mono {
  font-family: 'JetBrainsMonoTest', ui-monospace, monospace;
  font-size: 0.9375rem;
  letter-spacing: 0.06em;
  margin: 1rem 0 0;
  color: rgb(var(--c-ink));
}
.tp-mono--kucuk {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: rgb(var(--c-measure));
}
</style>
