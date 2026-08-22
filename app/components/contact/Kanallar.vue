<script setup>
/**
 * 01 / DOĞRUDAN İLETİŞİM — telefon, WhatsApp, e-posta, adres, saatler.
 *
 * Eski `contact/Info.vue`'nun yerini alıyor. O bileşen üç yuvarlak köşeli
 * kart basıyordu ve her satırın başında yumuşak dolgulu bir ikon karesi
 * vardı (§ ikon daireleri: 3 adet). V2'de kart yok — kütük var.
 *
 * VERİ KAYNAĞI: SİTE AYARLARI, TEK YER.
 * Hiçbir numara, adres ya da e-posta koda gömülü değil. Değer yoksa satır
 * hiç basılmıyor — eksik bilgi yerine uydurma bilgi göstermek bu ailenin
 * geçmişte yaptığı hataydı (şablondan gelen, bu işletmeye ait olmayan iki
 * numara aylarca ekranda durmuştu).
 *
 * `/api/quote` KAYDI ARTIK OKUNMUYOR. Eski sayfa telefonu önce `Quote`
 * kaydından, sonra Site Ayarları'ndan okuyordu. Ölçüldü: `Quote` kaydı
 * veri tabanında YOK (`/api/quote` → `data: null`), yani ikinci kaynak hiç
 * çalışmıyordu ama her istekte sorgulanıyordu. İki kaynaklı telefon,
 * numaraların ayrışabileceği bir yer demek.
 *
 * WHATSAPP — ÜRETİLMİYOR, OKUNUYOR.
 * `whatsAppNumber` alanı panelde TAM URL olarak tutuluyor
 * (`https://wa.me/…?text=…`). Telefondan wa.me adresi TÜRETİLMİYOR: bir
 * numaranın WhatsApp'ta açık olduğu varsayımı doğrulanabilir bir şey değil.
 * Alan boşsa bağlantı hiç görünmüyor. (Alt bilgi de aynı kuralı
 * uyguluyor; navbar ham rakamları süzüp adresi yeniden kuruyor — bugün
 * aynı sonucu veriyor ama kırılgan, bkz. rapor.)
 */
const { settings } = await useSiteSettings()

const temiz = (deger) => String(deger ?? '').trim()

const telefon = computed(() => temiz(settings.value?.phone) || temiz(settings.value?.mobilePhone))
const telHref = computed(() => `tel:${telefon.value.replace(/[^\d+]/g, '')}`)

const eposta = computed(() => temiz(settings.value?.email))
const adres = computed(() => temiz(settings.value?.address))

/** Panelde tam URL tutuluyor; ham numara girilmişse de çalışsın. */
const whatsApp = computed(() => {
  const ham = temiz(settings.value?.whatsAppNumber)
  if (!ham) return ''
  if (/^https?:\/\//i.test(ham)) return ham
  const rakam = ham.replace(/\D/g, '')
  return rakam ? `https://wa.me/${rakam}` : ''
})

/**
 * Serbest metin saatler "/" ile ayrılmış satırlar hâlinde giriliyor ve
 * içinde uzun boşluk blokları var. Eski sayfa hepsini tek paragrafta
 * basıyordu ("Pazartesi - Cuma: 09:00 - 19:00 / Cumartesi: …"); alt bilgi
 * ise satırlara bölüyordu. Aynı veri iki farklı biçimde duruyordu.
 */
const saatler = computed(() =>
  temiz(settings.value?.workingHours)
    .split('/')
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
)

/** İç sayfa içeriği — bkz. shared/utils/ic-sayfa.ts */
defineProps({
  bolum: { type: Object, default: () => ({}) },
})
</script>

<template>
  <section class="ik-kap" aria-labelledby="kanallar-baslik">
    <div class="ik sahne-alan">
      <p class="ik-kunye op-kunye">01 / DOĞRUDAN İLETİŞİM</p>

      <h2 id="kanallar-baslik" class="ik-h2 tip-anlati">{{ bolum.heading }}</h2>

      <p v-if="bolum.lead" class="ik-giris tip-govde">{{ bolum.lead }}</p>

      <div class="ik-birincil">
        <p v-if="telefon" class="ik-tel-etiket op-kunye">TELEFON</p>
        <p v-if="telefon" class="ik-tel">
          <a :href="telHref" class="ik-tel-bag">{{ telefon }}</a>
        </p>
        <p v-if="whatsApp" class="ik-wa">
          <a :href="whatsApp" target="_blank" rel="noopener noreferrer" class="ik-wa-bag">
            WhatsApp'tan yazın
          </a>
        </p>
      </div>

      <dl class="ik-liste">
        <div v-if="eposta" class="ik-oge">
          <dt class="ik-etiket op-kunye">E-POSTA</dt>
          <dd class="ik-deger">
            <a :href="`mailto:${eposta}`" class="ik-deger-bag">{{ eposta }}</a>
          </dd>
        </div>

        <div v-if="adres" class="ik-oge">
          <dt class="ik-etiket op-kunye">ADRES</dt>
          <dd class="ik-deger">
            <address class="ik-adres">{{ adres }}</address>
          </dd>
        </div>

        <div v-if="saatler.length" class="ik-oge">
          <dt class="ik-etiket op-kunye">ÇALIŞMA SAATLERİ</dt>
          <dd class="ik-deger">
            <span v-for="s in saatler" :key="s" class="ik-saat">{{ s }}</span>
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.ik-kap {
  background: rgb(var(--c-paper-sunken));
  color: rgb(var(--c-ink));
}
.ik {
  padding-block: var(--sahne-dikey);
}
.ik-kunye {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.ik-h2 {
  max-width: 16ch;
}

.ik-giris {
  margin: clamp(1rem, 0.85rem + 0.6vw, 1.5rem) 0 0;
  max-width: var(--olcu-govde);
}

/* ---- Telefon: sayfanın en görünür öğesi, ama satış bandı değil -------- */
.ik-birincil {
  margin-top: clamp(1.5rem, 1.25rem + 1vw, 2.5rem);
}
.ik-tel-etiket {
  margin: 0;
  color: rgb(var(--c-ink-soft));
}
.ik-tel {
  margin: 0.375rem 0 0;
}
.ik-tel-bag {
  display: inline-block;
  /* Rakamlar mono: numaranın okunma birimi rakam grupları, orantılı
     yazıtipinde gruplar birbirine yapışıyor. */
  font-family: var(--f-mono);
  font-size: clamp(1.5rem, 1.15rem + 1.6vw, 2.25rem);
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: rgb(var(--c-ink));
  text-decoration: none;
  border-bottom: 2px solid rgb(var(--c-signal));
  padding-bottom: 0.15em;
  /* Dokunma hedefi: metnin kendisi zaten 44 px'ten yüksek. */
  min-height: 44px;
}
.ik-tel-bag:hover {
  color: rgb(var(--c-signal-deep));
  border-bottom-color: rgb(var(--c-signal-deep));
}
.ik-tel-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}

.ik-wa {
  margin: clamp(1rem, 0.85rem + 0.6vw, 1.5rem) 0 0;
}
.ik-wa-bag {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: 1rem;
  font-weight: 550;
  color: rgb(var(--c-ink));
  text-decoration: none;
  border-bottom: 1px solid rgb(var(--c-measure));
  padding-bottom: 0.25rem;
}
.ik-wa-bag:hover {
  border-bottom-color: rgb(var(--c-ink));
}
.ik-wa-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}

/* ---- İkincil kanallar: kütük ------------------------------------------ */
.ik-liste {
  margin: clamp(2rem, 1.5rem + 1.5vw, 3rem) 0 0;
  padding: 0;
  border-bottom: 1px solid rgb(var(--c-rule));
}
.ik-oge {
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem);
}
.ik-etiket {
  margin: 0;
  color: rgb(var(--c-ink-soft));
}
.ik-deger {
  margin: 0.375rem 0 0;
  font-size: 1.0625rem;
  line-height: 1.6;
}
.ik-deger-bag {
  color: rgb(var(--c-ink));
  text-decoration: none;
  border-bottom: 1px solid rgb(var(--c-measure));
  /* Uzun e-posta dar ekranda satır sonunu zorlamasın. */
  overflow-wrap: anywhere;
}
.ik-deger-bag:hover {
  border-bottom-color: rgb(var(--c-ink));
}
.ik-deger-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}
.ik-adres {
  font-style: normal;
  max-width: 34ch;
}
.ik-saat {
  display: block;
}

@media (min-width: 1024px) {
  .ik {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .ik-kunye {
    grid-column: 1 / 8;
  }
  .ik-h2 {
    grid-column: 2 / 7;
  }
  .ik-giris {
    grid-column: 2 / 7;
  }
  .ik-birincil {
    grid-column: 2 / 7;
  }
  /* İkincil kanallar D alanında: telefon soluyla yarışmıyor, aynı
     yükseklikte okunuyor. */
  .ik-liste {
    grid-column: 8 / 13;
    grid-row: 2 / 4;
    margin-top: 0;
  }
}
</style>
