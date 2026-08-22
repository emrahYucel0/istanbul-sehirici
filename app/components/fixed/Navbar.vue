<script setup>
/**
 * NAVBAR — "Kat Planı" kimliği.
 *
 * KUTU DEĞİL ÇİZGİ. Gölge, yarıçap, cam efekti yok; bar kâğıt zemin
 * üzerinde tek bir saç teli çizgiyle bitiyor. Mimari çizim dilinde bir
 * bar bir nesne değil, bir sınırdır.
 *
 * YAPIŞKANLIK BİR KARAR, VARSAYILAN DEĞİL
 * İkisinde de yapışkan ama gerekçeleri farklı:
 *   · MOBİLDE zorunlu — bu işte dönüşüm telefonla oluyor ve arama
 *     eylemi her an bir dokunuş uzakta olmalı.
 *   · MASAÜSTÜNDE bar çok ince ve opak tutuldu; kompozisyonla yarışmıyor.
 *     Şeffaf/bulanık bir bar hem yasak listesindeki cam efekti olurdu
 *     hem de altındaki fotoğrafın üstünde metni okunmaz yapardı.
 *
 * MOBİL AYRI KOMPOZİSYON
 * Masaüstündeki yatay menü mobilde küçültülmüyor. Barda yalnız iki şey
 * kalıyor: marka ve ARAMA. Menü ayrı bir tam sayfa kâğıt panelde açılıyor —
 * açılır kutu değil, sayfanın kendisi. Böylece dokunma hedefleri büyük ve
 * liste tek sütun okunuyor.
 *
 * HAREKET: yok. Sözleşme madde 3 — hareket iyileştirmedir; burada
 * iyileştirecek bir şey olmadığı için eklenmedi.
 */
const { settings, brandName } = await useSiteSettings()

const { data: navbarResponse } = await useFetch('/api/navbar', { key: 'navbar-section' })
const navbarData = computed(() => navbarResponse.value?.data ?? null)
const brandLabel = computed(() => navbarData.value?.logo || brandName.value)

const phone = computed(() => settings.value?.phone || settings.value?.mobilePhone || '')
const telHref = computed(() => `tel:${String(phone.value).replace(/[^\d+]/g, '')}`)

/* WhatsApp artık BARDA. Eskiden sağ altta yüzen bir daireydi ve sayfadaki
   içeriği kalıcı olarak örtüyordu (bkz. app.vue'daki not). Barda durunca
   hiçbir şeyi kapatmıyor ve çizgi diliyle uyumlu kalıyor. */
const whatsAppHref = computed(() => {
  const rakam = String(settings.value?.whatsAppNumber || '').replace(/\D/g, '')
  return rakam ? `https://wa.me/${rakam}?text=Merhaba` : '/iletisim'
})

/** Menü kütüğü — kaynak tek yerde. */
const NAV_LINKS = [
  { yol: '/hizmetlerimiz', ad: 'Hizmetler' },
  { yol: '/bolgelerimiz', ad: 'Bölgeler' },
  { yol: '/fiyat-hesaplama', ad: 'Fiyat' },
  { yol: '/hakkimizda', ad: 'Hakkımızda' },
  { yol: '/iletisim', ad: 'İletişim' },
]

const route = useRoute()
const aktifMi = (yol) => route.path === yol || route.path.startsWith(`${yol}/`)

// ---- Mobil menü ----------------------------------------------------------
const MENU_ID = 'mobil-menu'
const menuAcik = ref(false)
const acmaDugmesi = ref(null)

const menuKapat = ({ odagiGeriVer = false } = {}) => {
  menuAcik.value = false
  if (odagiGeriVer) acmaDugmesi.value?.focus()
}
const menuDegistir = () => (menuAcik.value = !menuAcik.value)

// Esc ile kapanma ve odağın düğmeye dönmesi — klavye kullanıcısı menüde
// kilitli kalmasın.
const tusIzle = (e) => {
  if (e.key === 'Escape' && menuAcik.value) menuKapat({ odagiGeriVer: true })
}
onMounted(() => window.addEventListener('keydown', tusIzle))
onUnmounted(() => window.removeEventListener('keydown', tusIzle))

/**
 * Panel açıkken arka plan hem KAYMAMALI hem de KLAVYEYE KAPALI olmalı.
 *
 * Kaydırma kilidi zaten vardı. Eksik olan ikincisiydi: panel `v-show` ile
 * DOM'da kaldığı için arkadaki sayfanın bağlantıları hâlâ odaklanabiliyordu
 * — son menü bağlantısından sonra Tab, görünmeyen içeriğe düşüyordu.
 *
 * Elle odak tuzağı yerine `inert`: tek nitelik, tarayıcının kendi
 * uygulaması, ayrıca ekran okuyucudan da çıkarıyor. Panel `<header>` içinde
 * olduğu için erişilebilir kalıyor.
 */
watch(menuAcik, (acik) => {
  if (!import.meta.client) return
  document.documentElement.style.overflow = acik ? 'hidden' : ''
  for (const el of document.querySelectorAll('#icerik, footer')) el.inert = acik
})
// Sayfa değişince menü kapanmalı; aksi hâlde yeni sayfa menü açık açılıyor.
watch(() => route.path, () => menuKapat())
</script>

<template>
  <header class="nb">
    <div class="nb-bar">
      <NuxtLink to="/" class="nb-marka">{{ brandLabel }}</NuxtLink>

      <!-- Masaüstü menü -->
      <nav class="nb-menu" aria-label="Ana menü">
        <NuxtLink
          v-for="l in NAV_LINKS"
          :key="l.yol"
          :to="l.yol"
          class="nb-link"
          :class="{ 'nb-link--aktif': aktifMi(l.yol) }"
          :aria-current="aktifMi(l.yol) ? 'page' : undefined"
        >
          {{ l.ad }}
        </NuxtLink>
      </nav>

      <!-- Arama eylemi — mobilde de masaüstünde de barda kalıyor. -->
      <a v-if="phone" :href="telHref" class="nb-tel">
        <span class="nb-tel-etiket">ARA</span>
        <span class="nb-tel-no">{{ phone }}</span>
      </a>

      <!-- Erişilebilir ad GÖRÜNEN metni İÇERMELİ (WCAG 2.5.3 "Label in
           Name"): sesle kontrol eden kullanıcı "WP"ye tıkla der ama
           erişilebilir ad "WhatsApp üzerinden yazın" idi ve içinde "WP"
           geçmiyordu. Lighthouse bunu `label-content-name-mismatch`
           olarak işaretledi. -->
      <a
        :href="whatsAppHref"
        target="_blank"
        rel="noopener"
        class="nb-wp"
        aria-label="WP — WhatsApp üzerinden yazın"
      >WP</a>

      <button
        ref="acmaDugmesi"
        type="button"
        class="nb-acma"
        :aria-expanded="menuAcik"
        :aria-controls="MENU_ID"
        @click="menuDegistir"
      >
        <span class="nb-acma-yazi">{{ menuAcik ? 'Kapat' : 'Menü' }}</span>
      </button>
    </div>

    <!-- Mobil panel: açılır kutu değil, tam sayfa kâğıt. -->
    <div v-show="menuAcik" :id="MENU_ID" class="nb-panel">
      <nav aria-label="Mobil menü">
        <NuxtLink
          v-for="(l, i) in NAV_LINKS"
          :key="l.yol"
          :to="l.yol"
          class="nb-panel-link"
          :aria-current="aktifMi(l.yol) ? 'page' : undefined"
        >
          <span class="nb-panel-no">{{ String(i + 1).padStart(2, '0') }}</span>
          <span>{{ l.ad }}</span>
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.nb {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgb(var(--c-paper));
  border-bottom: 1px solid rgb(var(--c-rule));
}

/* BAR, SAYFANIN KENDİ IZGARASINDA.
   Önceden yalnız `padding-inline` vardı, `max-width` yoktu: 1920'de bar
   kenardan kenara uzanırken sayfa içeriği `--container-wide` ile
   ortalanıyordu — marka x=60'ta, ana sayfa metni x=300'de başlıyordu ve
   navbar başka bir düzen sistemine aitmiş gibi duruyordu (ölçüldü).
   Artık `.sahne-alan` ile birebir aynı geometri: aynı kap genişliği, aynı
   dolgu. Çizgi (`border-bottom`) tam genişlikte kalıyor — o bir sınır,
   içerik değil. */
.nb-bar {
  max-width: var(--container-wide);
  margin-inline: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: var(--sahne-navbar);
  padding-inline: var(--sahne-pad);
}

.nb-marka {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: -0.02em;
  color: rgb(var(--c-ink));
  text-decoration: none;
  margin-right: auto;
}

/* Masaüstü menü mobilde YOK — küçültülmüyor, kaldırılıyor. */
.nb-menu {
  display: none;
}

.nb-tel {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  min-height: 44px;
  padding-block: 0.5rem;
  text-decoration: none;
  color: rgb(var(--c-signal));
}
.nb-tel-etiket {
  font-family: var(--f-mono);
  font-size: 0.625rem;
  letter-spacing: 0.14em;
  color: rgb(var(--c-measure));
}
.nb-tel-no {
  font-family: var(--f-mono);
  font-size: 0.875rem;
  letter-spacing: 0.01em;
}
/* MOBİLDE NUMARA YOK, yalnız "ARA" etiketi.
   Önce `max-width` ile gizlenmeye çalışıldı ve 412px'te marka + numara +
   menü bara sığmayıp yatay taşma yarattı. Mobil-öncelikli yazım bunu
   yapısal olarak imkânsız kılıyor: numara ancak yer olduğu bilinen
   genişlikte AÇILIYOR. Numaranın kendisi mobil panelde ve Hero'da zaten
   var; barda tekrar etmesi gerekmiyor. */
.nb-tel-no {
  display: none;
}
.nb-tel-etiket {
  font-size: 0.8125rem;
  letter-spacing: 0.12em;
  color: rgb(var(--c-signal));
}

.nb-wp {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  font-family: var(--f-mono);
  font-size: 0.8125rem;
  letter-spacing: 0.12em;
  color: rgb(var(--c-ink-soft));
  text-decoration: none;
}
.nb-wp:hover {
  color: rgb(var(--c-ink));
}

.nb-acma {
  min-height: 44px;
  padding: 0.5rem 0;
  background: none;
  border: 0;
  border-bottom: 1px solid rgb(var(--c-measure));
  font: inherit;
  font-size: 0.875rem;
  color: rgb(var(--c-ink));
  cursor: pointer;
}

/* ---- Mobil panel ------------------------------------------------------- */
.nb-panel {
  position: fixed;
  inset: var(--sahne-navbar) 0 0;
  background: rgb(var(--c-paper));
  overflow-y: auto;
  /* Panel de barla aynı ölçüde: aynı kap, aynı dolgu. */
  max-width: var(--container-wide);
  margin-inline: auto;
  padding: 1rem var(--sahne-pad) 3rem;
}
.nb-panel-link {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 1.125rem 0;
  border-bottom: 1px solid rgb(var(--c-rule));
  font-size: 1.375rem;
  letter-spacing: -0.02em;
  color: rgb(var(--c-ink));
  text-decoration: none;
}
/* `--c-measure` METİN olarak kâğıt üzerinde 3,51:1 — AA'yı geçmiyor
   (ölçüldü). Çizgi olarak kalmaya devam ediyor, yazı olarak değil. */
.nb-panel-no {
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  color: rgb(var(--c-ink-soft));
}
.nb-panel-link[aria-current='page'] .nb-panel-no {
  color: rgb(var(--c-signal));
}

/* ===========================================================================
   MASAÜSTÜ
   ======================================================================== */
@media (min-width: 1024px) {
  .nb-bar {
    gap: 2rem;
  }
  .nb-menu {
    display: flex;
    gap: 1.75rem;
    margin-right: auto;
    margin-left: 2.5rem;
  }
  .nb-link {
    position: relative;
    font-size: 0.9375rem;
    color: rgb(var(--c-ink-soft));
    text-decoration: none;
    padding-block: 0.25rem;
    transition: color 0.15s ease-out;
  }
  .nb-link:hover {
    color: rgb(var(--c-ink));
  }
  /* Aktif sayfa: ölçü çizgisi dili — altına kısa bir kol. */
  .nb-link--aktif {
    color: rgb(var(--c-ink));
  }
  .nb-link--aktif::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 1.25rem;
    height: 1px;
    background: rgb(var(--c-signal));
  }
  .nb-marka {
    margin-right: 0;
  }
  .nb-acma {
    display: none;
  }
  .nb-tel-no {
    display: inline;
  }
  .nb-tel-etiket {
    font-size: 0.625rem;
    color: rgb(var(--c-ink-soft));
  }
}
</style>
