<script setup>
/**
 * YORUM FORMU — V2.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NE DEĞİŞTİ, NEDEN
 *
 * Formun kendisi V1'den beri vardı ve API sözleşmesi sağlamdı; kaldırılan
 * şey yalnız GÖRSEL DİL ve GEREKSİZ ALANLAR oldu. Eski hâli yuvarlak
 * köşeli bir kart, hap biçimli düğmeler ve marka rengiyle dolu bir
 * kutuydu — sayfanın kalan sekiz bölümünde böyle bir nesne yok. Yeni hâli
 * bölümün kendi dilinde: kâğıt zemin, ince yapısal çizgiler, mono etiket.
 *
 * KART YOK. GÖLGE YOK. CAM YOK. Alanlar yalnız alt çizgiyle tanımlı;
 * form sayfanın üstünde duran bir nesne değil, sayfanın devamı.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ALANLAR — DÖRT, DAHA FAZLASI DEĞİL
 *
 *   Ad      zorunlu · yayınlanan tek kimlik
 *   Puan    zorunlu · 1-5 tam sayı
 *   Yorum   zorunlu · metnin kendisi
 *   E-posta İSTEĞE BAĞLI · yayınlanmıyor, yalnız moderasyonda doğrulama
 *
 * KALDIRILAN İKİ ALAN — "İlçe" ve "Aldığınız hizmet".
 * İkisi de ekranda hiç gösterilmiyordu ve hizmet türü boş bırakıldığında
 * sunucu onu listedeki İLK değere ("Evden Eve Nakliyat") düşürüyordu:
 * ziyaretçinin hiç söylemediği bir bilgi, onun yorumuna iliştirilip
 * veri tabanına yazılıyordu. Sormadığımız şeyi varsaymıyoruz.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PUAN GİRİŞİ GERÇEK BİR RADIO GRUBU
 *
 * Eskiden beş `<button aria-pressed>` vardı. `aria-pressed` bir aç/kapa
 * düğmesini anlatır, "beşten birini seç"i değil; ok tuşlarıyla gezinme de
 * yoktu. Şimdi `fieldset` + `input[type=radio]`: tarayıcı ok tuşu
 * gezinmesini, grup semantiğini ve odak halkasını kendisi veriyor.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * GÖNDERİM SÖZLEŞMESİ
 *
 * Yorum ANINDA YAYINLANMIYOR; moderasyon kuyruğuna düşüyor. Bu, kullanıcıya
 * gönderimden ÖNCE ve SONRA açıkça söyleniyor — "yayınlandı" demiyoruz,
 * çünkü yayınlanmadı.
 *
 * ÇİFT GÖNDERİM: hem `gonderiliyor` bayrağı hem `disabled`. Ağ hatasında
 * form ALANLARI KORUNUYOR (sıfırlama yalnız başarıda) — yazdığı yorumu
 * kaybeden kullanıcı ikinci kez yazmaz.
 */
import { ref } from 'vue'

defineProps({
  /** Form kapalıyken görünen davet cümlesi — panelden (HomeSection) geliyor. */
  davet: { type: String, default: 'Deneyiminizi yazın' },
})

const acik = ref(false)
const gonderiliyor = ref(false)
const durum = ref('')
const hata = ref('')

const bos = () => ({ customerName: '', rating: 5, comment: '', email: '' })
const form = ref(bos())

/** Bal küpü — gerçek kullanıcı göremez, botlar doldurur. */
const website = ref('')

const gonder = async () => {
  if (gonderiliyor.value) return
  gonderiliyor.value = true
  hata.value = ''
  durum.value = ''

  try {
    const cevap = await $fetch('/api/reviews', {
      method: 'POST',
      body: { ...form.value, website: website.value },
    })
    if (cevap?.success === false) throw new Error(cevap.error || 'Gönderilemedi')

    // "Yayınlandı" DEĞİL. Kayıt onay bekliyor ve kullanıcı bunu bilmeli;
    // yorumunu sayfada göremeyince kaybolduğunu sanmasın.
    durum.value = 'Yorumunuz alındı ve yayınlanmadan önce incelenecek.'
    form.value = bos()
    acik.value = false
  } catch (e) {
    hata.value = e?.data?.message || e?.message || 'Yorum gönderilemedi. Lütfen tekrar deneyin.'
  } finally {
    gonderiliyor.value = false
  }
}
</script>

<template>
  <div class="yf">
    <!--
      CANLI BÖLGE HER ZAMAN DOM'DA — `v-if` DEĞİL.

      Burada `v-if="durum"` vardı ve gerçek tarayıcıda ölçüldüğünde bölgenin
      gönderim anında DOM'da hiç bulunmadığı görüldü. Ekran okuyucular canlı
      bölgeyi İÇERİK DEĞİŞTİĞİNDE okur; bölge o an yeni yaratılıyorsa
      değişimi kaçırabiliyorlar. Yani görsel kullanıcı "alındı" mesajını
      görüyor, ekran okuyucu kullanıcısı hiçbir şey duymuyordu.

      Bölge artık boş olarak baştan basılıyor; boşken `:empty` ile
      gizleniyor, yani düzende yer kaplamıyor.
    -->
    <output class="yf-durum" aria-live="polite">{{ durum }}</output>

    <button v-if="!acik" type="button" class="yf-ac" @click="acik = true">
      {{ davet }}
    </button>

    <form v-else class="yf-govde" novalidate @submit.prevent="gonder">
      <p class="yf-not">
        Yorumunuz kontrol edildikten sonra yayınlanır. E-posta adresiniz sitede görünmez.
      </p>

      <!-- Aynı gerekçe: `role="alert"` bölgesi de baştan var. -->
      <p class="yf-hata" role="alert">{{ hata }}</p>

      <fieldset class="yf-puan">
        <legend class="yf-etiket">Puanınız</legend>
        <div class="yf-puan-satir">
          <label v-for="n in 5" :key="n" class="yf-puan-secim" :class="{ 'is-secili': n === form.rating }">
            <input v-model.number="form.rating" type="radio" name="yorum-puan" :value="n" class="yf-radyo" />
            <span aria-hidden="true">{{ n }}</span>
            <span class="sr-only">{{ n }} puan</span>
          </label>
        </div>
      </fieldset>

      <div class="yf-alan">
        <label class="yf-etiket" for="yf-ad">Adınız</label>
        <input
          id="yf-ad"
          v-model="form.customerName"
          type="text"
          required
          minlength="2"
          maxlength="60"
          autocomplete="name"
          class="yf-girdi"
        />
      </div>

      <div class="yf-alan">
        <label class="yf-etiket" for="yf-metin">Yorumunuz</label>
        <textarea
          id="yf-metin"
          v-model="form.comment"
          rows="5"
          required
          minlength="15"
          maxlength="1000"
          class="yf-girdi yf-metin"
        />
        <span class="yf-sayac">{{ form.comment.length }} / 1000</span>
      </div>

      <div class="yf-alan">
        <label class="yf-etiket" for="yf-eposta">E-posta <span class="yf-ops">isteğe bağlı, yayınlanmaz</span></label>
        <input
          id="yf-eposta"
          v-model="form.email"
          type="email"
          maxlength="120"
          autocomplete="email"
          class="yf-girdi"
        />
      </div>

      <!-- Bal küpü: `display:none` DEĞİL — bazı botlar onu atlıyor. -->
      <div class="yf-kupu" aria-hidden="true">
        <label for="yf-website">Bu alanı boş bırakın</label>
        <input id="yf-website" v-model="website" type="text" tabindex="-1" autocomplete="off" />
      </div>

      <div class="yf-dugmeler">
        <button type="submit" class="yf-gonder" :disabled="gonderiliyor">
          {{ gonderiliyor ? 'Gönderiliyor…' : 'Yorumu gönder' }}
        </button>
        <button type="button" class="yf-vazgec" @click="acik = false">Vazgeç</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.yf {
  margin-top: clamp(2.25rem, 1.75rem + 1.5vw, 3.25rem);
}

/* Durum satırı: kutu değil, tek bakır çizgiyle işaretlenmiş bir cümle.
   Boşken tamamen gizli — ama DOM'da duruyor (bkz. şablondaki gerekçe). */
.yf-durum:empty,
.yf-hata:empty {
  display: none;
}

.yf-durum {
  display: block;
  padding: 0.875rem 0 0.875rem 1rem;
  border-left: 2px solid rgb(var(--c-signal));
  color: rgb(var(--c-ink));
  font-size: 0.9375rem;
  line-height: 1.6;
  max-width: 52ch;
}

/* Açma eylemi: Kapanış'taki birincil eylemin sakin hâli — çerçeve yok,
   altı çizgili. Hap düğme sayfanın hiçbir yerinde yok. */
.yf-ac {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  font-weight: 600;
  letter-spacing: -0.012em;
  color: rgb(var(--c-ink));
  background: none;
  border: 0;
  border-bottom: 2px solid rgb(var(--c-signal));
  padding: 0 0 0.375rem;
  cursor: pointer;
  transition: border-color 0.15s ease-out;
}
.yf-ac:hover {
  border-bottom-color: rgb(var(--c-ink));
}
.yf-ac:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 6px;
}

.yf-govde {
  max-width: 40rem;
  border-top: 1px solid rgb(var(--c-measure));
  padding-top: clamp(1.5rem, 1.25rem + 1vw, 2.25rem);
}

.yf-not {
  margin: 0 0 1.75rem;
  font-size: 0.875rem;
  line-height: 1.65;
  color: rgb(var(--c-ink-soft));
  max-width: 52ch;
}

.yf-hata {
  margin: 0 0 1.5rem;
  padding-left: 1rem;
  border-left: 2px solid rgb(var(--c-signal-deep));
  font-size: 0.9375rem;
  line-height: 1.6;
  color: rgb(var(--c-ink));
}

/* Etiketler künye dilinde: mono, küçük, harf aralıklı. */
.yf-etiket {
  display: block;
  margin-bottom: 0.5rem;
  padding: 0;
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(var(--c-ink-soft));
}

.yf-ops {
  text-transform: none;
  letter-spacing: 0.04em;
  color: rgb(var(--c-measure));
}

.yf-puan {
  border: 0;
  padding: 0;
  margin: 0 0 1.75rem;
}

.yf-puan-satir {
  display: flex;
  gap: 0;
  border: 1px solid rgb(var(--c-rule));
  width: fit-content;
}

/* Beş eşit hücre. Seçili olan mürekkep zeminde — yıldız ikonu yok,
   sayının kendisi zaten okunur ve ekran okuyucuya da doğru geliyor. */
.yf-puan-secim {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3rem;
  min-height: 44px;
  font-family: var(--f-mono);
  font-size: 0.9375rem;
  letter-spacing: 0.04em;
  color: rgb(var(--c-ink-soft));
  cursor: pointer;
  border-right: 1px solid rgb(var(--c-rule));
  transition: background-color 0.15s ease-out, color 0.15s ease-out;
}
.yf-puan-secim:last-child {
  border-right: 0;
}
.yf-puan-secim:hover {
  background: rgb(var(--c-paper-sunken));
}
.yf-puan-secim.is-secili {
  background: rgb(var(--c-ink));
  color: rgb(var(--c-paper));
}

/* Radyo görünmez ama ODAKLANABİLİR: klavye erişimi tarayıcıdan geliyor. */
.yf-radyo {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
}
.yf-puan-secim:has(.yf-radyo:focus-visible) {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 2px;
}

.yf-alan {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.75rem;
}

/* Alanlar kutu değil: yalnız alt çizgi. Odakta çizgi bakıra dönüyor. */
.yf-girdi {
  width: 100%;
  padding: 0.5rem 0;
  border: 0;
  border-bottom: 1px solid rgb(var(--c-measure));
  border-radius: 0;
  background: none;
  color: rgb(var(--c-ink));
  font: inherit;
  font-size: 1rem;
  line-height: 1.5;
  transition: border-color 0.15s ease-out;
}
.yf-girdi:focus {
  outline: none;
  border-bottom-color: rgb(var(--c-signal));
  border-bottom-width: 2px;
  padding-bottom: calc(0.5rem - 1px);
}
.yf-girdi:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}

.yf-metin {
  resize: vertical;
  min-height: 8rem;
}

.yf-sayac {
  margin-top: 0.375rem;
  align-self: flex-end;
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  color: rgb(var(--c-measure));
}

.yf-kupu {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.yf-dugmeler {
  display: flex;
  align-items: center;
  gap: clamp(1.25rem, 1rem + 0.8vw, 2rem);
  margin-top: 2rem;
}

.yf-gonder {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: -0.012em;
  color: rgb(var(--c-ink));
  background: none;
  border: 0;
  border-bottom: 2px solid rgb(var(--c-signal));
  padding: 0 0 0.375rem;
  cursor: pointer;
  transition: border-color 0.15s ease-out, opacity 0.15s ease-out;
}
.yf-gonder:hover:not(:disabled) {
  border-bottom-color: rgb(var(--c-ink));
}
.yf-gonder:disabled {
  opacity: 0.55;
  cursor: progress;
}
.yf-gonder:focus-visible,
.yf-vazgec:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 6px;
}

.yf-vazgec {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  background: none;
  border: 0;
  padding: 0;
  font-family: var(--f-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--c-ink-soft));
  cursor: pointer;
  transition: color 0.15s ease-out;
}
.yf-vazgec:hover {
  color: rgb(var(--c-ink));
}
</style>
