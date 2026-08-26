<script setup>
/**
 * 02 / TAŞINMAYI ANLATIN — talep formu + yanında hazırlık kütüğü.
 *
 * Eski `contact/Form.vue`'nun yerini alıyor. O bileşen duruyor ama artık
 * kullanılmıyor. ARKA UÇ SÖZLEŞMESİ AYNEN KORUNDU — bu bir görünüm ve
 * erişilebilirlik turu, form altyapısı turu değil:
 *
 *   uç nokta   POST /api/leads
 *   gövde      { name, email, phone, message, sourcePage, website }
 *   doğrulama  vee-validate + yup (istemci) · yup (sunucu, server/api/leads.ts)
 *   bal küpü   `website` alanı — dolu gelirse istek gönderilmiyor
 *   sıra       talep ÖNCE veri tabanına yazılıyor, mail SONRA deneniyor
 *
 * Yeni bağımlılık eklenmedi.
 *
 * ─────────────────────────────────────────────────────────────────────
 * GÖRÜNÜMDE DEĞİŞENLER
 *   · `ui-card` (yuvarlak köşe + gölge) kalktı; alanlar kâğıt üzerinde,
 *     1 px çizgili, köşe yarıçapsız kutular.
 *   · Gönder düğmesi hap biçimli değil; mürekkep bloğu.
 *   · Başlık "Ücretsiz Keşif ve Teklif" idi — iddia; kalktı.
 *   · Açıklama "yazılı ve sabit bir fiyat sunalım" diyordu — kalktı.
 *
 * ERİŞİLEBİLİRLİKTE DÜZELTİLENLER
 *   1. ZORUNLULUK YALNIZ `*` İLE ANLATILIYORDU. Alanlarda `required`
 *      niteliği YOKTU (ölçüldü: dördü de `required = false`), yani ekran
 *      okuyucu alanı zorunlu diye duyurmuyordu. Artık hem `required` hem
 *      görünür "zorunlu" etiketi var. Formda `novalidate` var: tarayıcının
 *      kendi baloncuğu vee-validate'in mesajlarıyla yarışmasın diye —
 *      anlam korunuyor, çift arayüz olmuyor.
 *   2. MESAJ ALANININ AÇIKLAMASI YALNIZ PLACEHOLDER'DAYDI. Ne yazılacağı
 *      bilgisi ilk harfte kayboluyordu. Artık kalıcı bir yardım metni ve
 *      `aria-describedby` ile bağlı.
 *   3. Hata özeti YOKTU. Gönderim doğrulamada takıldığında ekranda hiçbir
 *      şey değişmiyordu (mesajlar alanların altındaydı ama sayfa uzun).
 *      Artık ilk hatalı alana odak veriliyor.
 */
import { computed, ref } from 'vue'
import { Field, Form as VeeForm, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'

const { settings } = await useSiteSettings()

const schema = yup.object({
  name: yup.string().trim().required('Adınızı giriniz.'),
  email: yup
    .string()
    .trim()
    .email('Geçerli bir e-posta adresi giriniz.')
    .required('E-posta adresinizi giriniz.'),
  phone: yup
    .string()
    .trim()
    .required('Telefon numaranızı giriniz.')
    // Biçim serbest (boşluk, +, parantez, tire); şart yeterli sayıda RAKAM.
    // Eski kural `/^[0-9]+$/` idi ve alanın kendi örneğini reddediyordu.
    .test('telefon', 'Geçerli bir telefon numarası giriniz.', (value) => {
      const digits = String(value || '').replace(/\D/g, '')
      return digits.length >= 10 && digits.length <= 15
    }),
  note: yup.string().trim().required('Mesajınızı yazınız.'),
})

const route = useRoute()
const isSubmitting = ref(false)
const status = ref('') // '' | 'success' | 'error'
/** Bal küpü — ekranda görünmez, botlar doldurur. */
const website = ref('')
const formRef = ref(null)

const fallbackPhone = computed(() => settings.value?.phone || settings.value?.mobilePhone || '')
const telHref = computed(() => `tel:${fallbackPhone.value.replace(/[^\d+]/g, '')}`)

/**
 * Doğrulama takıldığında İLK hatalı alana odak — form uzun, hata mesajı
 * ekranın dışında kalabiliyor.
 *
 * Odak, hata nesnesinin ANAHTAR SIRASINA göre değil DOM SIRASINA göre
 * seçiliyor: ilk denemede `Object.keys(errors)[0]` kullanılmıştı ve dört
 * alan da boşken odak "name"e değil "email"e gidiyordu — yup'ın döndürdüğü
 * anahtar sırası ekrandaki sırayla aynı değil. Kullanıcının gördüğü sıra
 * DOM sırası, dolayısıyla ölçüt de o.
 *
 * `nextTick`: `aria-invalid` tepkisel olarak bağlı, olay işleyicisi
 * çalıştığı anda henüz DOM'a yazılmamış oluyor.
 */
const hataliyaOdaklan = async () => {
  await nextTick()
  const kap = formRef.value?.$el
  const ilk = kap?.querySelector('[aria-invalid="true"]')
  if (ilk) ilk.focus()
}

const onSubmit = async (values, { resetForm }) => {
  if (website.value) return // bot

  isSubmitting.value = true
  status.value = ''

  try {
    // Doğrudan mail atılmıyor. İstek kendi ucumuza gidiyor; orada talep
    // ÖNCE veritabanına yazılıyor, mail ONDAN SONRA deneniyor. SMTP'de bir
    // aksama olduğunda müşteri adayı kaybolmasın diye.
    const cevap = await $fetch('/api/leads', {
      method: 'POST',
      body: {
        name: values.name,
        email: values.email,
        phone: values.phone,
        message: values.note,
        // Hangi sayfadan geldiği: hangi bölge sayfasının gerçekten müşteri
        // getirdiğini ancak bu gösteriyor.
        sourcePage: route.path,
        website: website.value,
      },
    })

    if (cevap?.success === false) throw new Error(cevap.error || 'Gönderilemedi')

    status.value = 'success'
    resetForm()
  } catch (error) {
    // Ham hata metni kullanıcıya GÖSTERİLMİYOR; teknik ayrıntı konsola.
    console.error('Form gönderilemedi:', error)
    status.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Form bu alanları TOPLAMIYOR — beşi de mesaj kutusuna yazılıyor. Bu
 * yüzden kütük "zorunlu alan" gibi değil, "yazarsanız işe yarar" diye
 * sunuluyor; olmayan bir form alanını varmış gibi göstermek kullanıcıyı
 * boş yere arattırırdı.
 */
const HAZIRLIK = [
  { etiket: 'ÇIKIŞ ADRESİ', metin: 'İlçe ve mahalle yeterli; sokak adı gerekmiyor.' },
  { etiket: 'VARIŞ ADRESİ', metin: 'Yeni adres henüz kesin değilse ilçesini yazmanız yeterli.' },
  { etiket: 'KAT VE ASANSÖR', metin: 'Kaçıncı kat, asansör var mı, kabin bir koltuğu alıyor mu.' },
  { etiket: 'EŞYA KAPSAMI', metin: 'Kaç odalı bir ev ve ayrıca ele alınması gereken parça var mı.' },
  { etiket: 'TAŞINMA TARİHİ', metin: 'Kesin gün ya da bir aralık.' },
]

/** İç sayfa içeriği — bkz. shared/utils/ic-sayfa.ts */
defineProps({
  bolum: { type: Object, default: () => ({}) },
})
</script>

<template>
  <section class="if-kap" aria-labelledby="form-baslik">
    <div class="if sahne-alan">
      <p class="if-kunye op-kunye">02 / TAŞINMAYI ANLATIN</p>

      <h2 id="form-baslik" class="if-h2 tip-anlati">{{ bolum.heading }}</h2>

      <!-- Hazırlık kütüğü formdan ÖNCE geliyor (kaynak sırası). Mobilde
           kullanıcı ne yazacağını okuyup sonra yazmaya başlıyor; masaüstünde
           D alanına geçip formun yanında duruyor. -->
      <div class="if-hazirlik">
        <p v-if="bolum.lead" class="if-hazirlik-giris tip-not">{{ bolum.lead }}</p>
        <dl class="if-hazirlik-liste">
          <div v-for="h in HAZIRLIK" :key="h.etiket" class="if-hazirlik-oge">
            <dt class="if-hazirlik-etiket op-kunye">{{ h.etiket }}</dt>
            <dd class="if-hazirlik-metin tip-not">{{ h.metin }}</dd>
          </div>
        </dl>
      </div>

      <div class="if-form">
        <!-- Gönderimden SONRA ne olduğu yazılı. Süre TAAHHÜT EDİLMİYOR:
             "5 dakikada döneriz" gibi bir söz tutulamadığında sayfanın
             tamamının güvenilirliğini götürür. -->
        <p v-if="bolum.note" class="if-giris tip-govde">{{ bolum.note }}</p>

        <!-- Canlı bölge: durum mesajları ekran okuyucuya duyurulur. -->
        <div aria-live="polite">
          <div v-if="status === 'success'" class="if-durum if-durum--ok" role="status">
            <p class="if-durum-baslik op-kunye">MESAJINIZ ULAŞTI</p>
            <p class="if-durum-metin tip-not">
              Talebiniz kaydedildi. Adresleri konuşmak için size dönüş yapacağız;
              acelesi varsa
              <a v-if="fallbackPhone" :href="telHref" class="if-durum-bag">{{ fallbackPhone }}</a>
              <span v-else>telefon</span>
              numarasından doğrudan ulaşabilirsiniz.
            </p>
          </div>

          <div v-else-if="status === 'error'" class="if-durum if-durum--hata" role="alert">
            <p class="if-durum-baslik op-kunye">GÖNDERİLEMEDİ</p>
            <p class="if-durum-metin tip-not">
              Mesajınız gönderilemedi ve yazdıklarınız formda duruyor; tekrar
              deneyebilirsiniz.
              <template v-if="fallbackPhone">
                Dilerseniz doğrudan
                <a :href="telHref" class="if-durum-bag">{{ fallbackPhone }}</a>
                numarasından ulaşın.
              </template>
            </p>
          </div>
        </div>

        <!-- `novalidate`: `required` niteliği ANLAM için duruyor, tarayıcının
             kendi baloncuğu vee-validate mesajlarıyla yarışmasın diye
             arayüzü kapatılıyor. -->
        <vee-form
          ref="formRef"
          v-slot="{ errors }"
          novalidate
          :validation-schema="schema"
          class="if-alanlar"
          @submit="onSubmit"
          @invalid-submit="hataliyaOdaklan"
        >
          <!-- Bal küpü: ekran okuyucudan ve sekme sırasından çıkarılmış. -->
          <div class="if-tuzak" aria-hidden="true">
            <label for="website">Web siteniz</label>
            <input id="website" v-model="website" type="text" tabindex="-1" autocomplete="off" />
          </div>

          <div class="if-ikili">
            <div class="if-alan">
              <label for="name" class="if-etiket">
                Adınız soyadınız <span class="if-zorunlu">zorunlu</span>
              </label>
              <Field
                id="name"
                name="name"
                type="text"
                required
                class="if-girdi"
                :class="{ 'is-hatali': errors.name }"
                autocomplete="name"
                :aria-invalid="errors.name ? 'true' : undefined"
                :aria-describedby="errors.name ? 'name-error' : undefined"
              />
              <ErrorMessage id="name-error" name="name" as="p" class="if-hata" />
            </div>

            <div class="if-alan">
              <label for="phone" class="if-etiket">
                Telefon numaranız <span class="if-zorunlu">zorunlu</span>
              </label>
              <Field
                id="phone"
                name="phone"
                type="tel"
                required
                inputmode="tel"
                class="if-girdi"
                :class="{ 'is-hatali': errors.phone }"
                autocomplete="tel"
                :aria-invalid="errors.phone ? 'true' : undefined"
                :aria-describedby="errors.phone ? 'phone-error' : undefined"
              />
              <ErrorMessage id="phone-error" name="phone" as="p" class="if-hata" />
            </div>
          </div>

          <div class="if-alan">
            <label for="email" class="if-etiket">
              E-posta adresiniz <span class="if-zorunlu">zorunlu</span>
            </label>
            <Field
              id="email"
              name="email"
              type="email"
              required
              inputmode="email"
              class="if-girdi"
              :class="{ 'is-hatali': errors.email }"
              autocomplete="email"
              :aria-invalid="errors.email ? 'true' : undefined"
              :aria-describedby="errors.email ? 'email-error' : undefined"
            />
            <ErrorMessage id="email-error" name="email" as="p" class="if-hata" />
          </div>

          <div class="if-alan">
            <label for="note" class="if-etiket">
              Taşınmanız <span class="if-zorunlu">zorunlu</span>
            </label>
            <!-- Yardım metni PLACEHOLDER DEĞİL: ilk harfte kaybolmuyor. -->
            <p id="note-hint" class="if-yardim tip-not">
              Nereden nereye, hangi kat, yaklaşık ne kadar eşya ve hangi tarih.
            </p>
            <Field
              id="note"
              as="textarea"
              name="note"
              rows="6"
              required
              class="if-girdi if-metin"
              :class="{ 'is-hatali': errors.note }"
              :aria-invalid="errors.note ? 'true' : undefined"
              :aria-describedby="errors.note ? 'note-hint note-error' : 'note-hint'"
            />
            <ErrorMessage id="note-error" name="note" as="p" class="if-hata" />
          </div>

          <!-- DOLGULU DÜĞME KALKTI. Sitedeki tek dolu düğme buydu; her
               yerde eylem = metin + alt çizgi. Şimdi birincil kademeyi
               kütükten alıyor (`.op-eylem`, assets/css/sahne.css).
               Metin de versal mono değil, diğer birincil eylemlerle aynı
               dilde.

               BEKLEME DURUMU: metin değişiyor ve düğmenin altındaki ölçü
               çizgisi soldan sağa taranıyor. Yapısal bir işaret — dönen
               ikon ya da opaklık değil; hareket azaltma isteyen kullanıcı
               aynı çizgiyi DURAĞAN ve tam boyda görüyor, yani bilgi
               kaybolmuyor.

               METİN AYNEN KORUNDU ("GÖNDER" / "GÖNDERİLİYOR…"): bu tur
               etkileşim turu, kopya turu değil. -->
          <div class="if-gonder-kap">
            <button type="submit" class="op-eylem if-gonder" :disabled="isSubmitting">
              {{ isSubmitting ? 'GÖNDERİLİYOR…' : 'GÖNDER' }}
            </button>
            <span v-if="isSubmitting" class="if-tarama" aria-hidden="true" />
          </div>

          <p class="if-kvkk tip-not">
            Formu göndererek paylaştığınız bilgilerin
            <NuxtLink to="/gizlilik-politikasi" class="if-kvkk-bag">gizlilik politikamızda</NuxtLink>
            anlatıldığı biçimde işlenmesini kabul etmiş olursunuz.
          </p>
        </vee-form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.if-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
  border-top: 1px solid rgb(var(--c-rule));
}
.if {
  padding-block: var(--sahne-dikey);
}
.if-kunye {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.if-h2 {
  max-width: 18ch;
}

/* ---- Hazırlık kütüğü --------------------------------------------------- */
.if-hazirlik {
  margin-top: clamp(1.5rem, 1.25rem + 1vw, 2.5rem);
}
.if-hazirlik-giris {
  margin: 0;
  max-width: var(--olcu-govde);
  color: rgb(var(--c-ink-soft));
}
.if-hazirlik-liste {
  margin: clamp(1rem, 0.85rem + 0.6vw, 1.5rem) 0 0;
  padding: 0;
  border-bottom: 1px solid rgb(var(--c-rule));
}
.if-hazirlik-oge {
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: 0.75rem;
}
.if-hazirlik-etiket {
  margin: 0;
  color: rgb(var(--c-ink-soft));
}
.if-hazirlik-metin {
  margin: 0.25rem 0 0;
}

/* ---- Form -------------------------------------------------------------- */
.if-form {
  margin-top: clamp(2rem, 1.5rem + 1.5vw, 3rem);
}
.if-giris {
  margin: 0 0 clamp(1.5rem, 1.25rem + 1vw, 2.25rem);
  max-width: var(--olcu-govde);
}
.if-alanlar {
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 1rem + 0.8vw, 1.75rem);
}
.if-ikili {
  display: grid;
  gap: clamp(1.25rem, 1rem + 0.8vw, 1.75rem);
}
.if-alan {
  display: flex;
  flex-direction: column;
}

/* ═══════════════════════════════════════════════════════════════════════
   ALANLAR ARTIK KUTU DEĞİL ÇİZGİ
   -----------------------------------------------------------------------
   Bu form sitedeki TEK kutulu yüzeydi: dört alanın dördü de 1px'lik tam
   çerçeve + dolgulu zemin taşıyordu. Oysa aynı sitedeki yorum formu
   (`base/ReviewForm.vue`) zaten çizgi tabanlı ve o dil onaylıydı —
   ortada iki ayrı form dili vardı. Burada YENİ bir dil kurulmadı;
   mevcut ve onaylı olana hizalandı:

     etiket      mono · versal · küçük punto      (künye katmanı)
     alan        yalnız ALT çizgi, zemin yok
     odak        çizgi 2px bakıra dönüyor + odak halkası
     hata        çizgi 2px `--c-signal-deep` + alan altında METİN

   Renk tek başına anlam taşımıyor (WCAG 1.4.1): hata durumunda hem
   çizgi kalınlaşıyor hem yazı çıkıyor hem `aria-invalid` duyuruluyor.
   ═══════════════════════════════════════════════════════════════════════ */
.if-etiket {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(var(--c-ink-soft));
}
/* Zorunluluk yalnız `*` ile anlatılmıyor: hem yazıyla görünüyor hem de
   alanda `required` niteliği duruyor. Etiket de mono olduğu için ayrım
   artık versallikten değil — bu parça küçük harfte kalıyor. */
.if-zorunlu {
  text-transform: none;
  letter-spacing: 0.04em;
  color: rgb(var(--c-ink-soft));
}

.if-yardim {
  margin: 0 0 0.5rem;
  color: rgb(var(--c-ink-soft));
}

.if-girdi {
  width: 100%;
  /* Dokunma hedefi: 1,5 satır (24px) + 2 × 0,625rem = 44px. */
  padding: 0.625rem 0;
  border: 0;
  border-bottom: 1px solid rgb(var(--c-measure));
  border-radius: 0;
  background: none;
  color: rgb(var(--c-ink));
  /* 16 px altı, mobil Safari'de odakta sayfayı yakınlaştırıyor. */
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.15s ease-out;
}
.if-girdi:hover {
  border-bottom-color: rgb(var(--c-ink));
}
/* Çizgi kalınlaşırken dolgu 1px azalıyor: alan YERİNDEN OYNAMIYOR. */
.if-girdi:focus {
  outline: none;
  border-bottom-color: rgb(var(--c-signal));
  border-bottom-width: 2px;
  padding-bottom: calc(0.625rem - 1px);
}
.if-girdi:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}
.if-girdi.is-hatali {
  border-bottom-width: 2px;
  border-bottom-color: rgb(var(--c-signal-deep));
  padding-bottom: calc(0.625rem - 1px);
}
.if-metin {
  resize: vertical;
  min-height: 8rem;
}

.if-hata {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: rgb(var(--c-signal-deep));
}

/* Görünüm `.op-eylem` kütüğünden; burada yalnız yerleşim ve versal
   metnin harf aralığı. */
.if-gonder-kap {
  align-self: flex-start;
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
}
.if-gonder {
  letter-spacing: 0.04em;
}

/* BEKLEME TARAMASI — konum ve boyut değişmiyor, yalnız bir ölçü çizgisi
   düğmenin altında soldan sağa geçiyor. Bakır çizginin 3px altında;
   ikisi üst üste binmiyor. */
.if-tarama {
  display: block;
  height: 1px;
  margin-top: 3px;
  background: rgb(var(--c-measure));
  transform-origin: left center;
}
@media (prefers-reduced-motion: no-preference) {
  .if-tarama {
    animation: if-tara 1.1s ease-in-out infinite;
  }
  @keyframes if-tara {
    0%   { transform: scaleX(0); transform-origin: left center; }
    50%  { transform: scaleX(1); transform-origin: left center; }
    51%  { transform: scaleX(1); transform-origin: right center; }
    100% { transform: scaleX(0); transform-origin: right center; }
  }
}

.if-kvkk {
  margin: 0;
  max-width: var(--olcu-govde);
  color: rgb(var(--c-ink-soft));
}
.if-kvkk-bag {
  color: rgb(var(--c-ink));
  text-decoration: none;
  border-bottom: 1px solid rgb(var(--c-measure));
}
.if-kvkk-bag:hover {
  border-bottom-color: rgb(var(--c-ink));
}
.if-kvkk-bag:focus-visible {
  outline: 2px solid rgb(var(--c-ink));
  outline-offset: 4px;
}

/* ---- Durum bildirimleri ------------------------------------------------ */
/* Kutu değil, İŞARETLİ CÜMLE: yalnız solda bir çizgi. Dolgulu zemin
   (`--c-paper-sunken`) kalktı — yorum formundaki durum satırıyla
   (`.yf-durum`) aynı dil; iki formda iki farklı bildirim biçimi vardı. */
.if-durum {
  margin-bottom: clamp(1.25rem, 1rem + 0.8vw, 1.75rem);
  padding: 0.875rem 0 0.875rem 1rem;
  border-left: 2px solid rgb(var(--c-ink));
}
.if-durum--ok {
  border-left-color: rgb(var(--c-signal));
}
.if-durum--hata {
  border-left-color: rgb(var(--c-signal-deep));
}
.if-durum-baslik {
  margin: 0;
  color: rgb(var(--c-ink));
}
.if-durum-metin {
  margin: 0.375rem 0 0;
  max-width: var(--olcu-govde);
}
.if-durum-bag {
  color: rgb(var(--c-ink));
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid rgb(var(--c-measure));
}
.if-durum-bag:hover {
  border-bottom-color: rgb(var(--c-ink));
}

/* Bal küpü: `display: none` kullanılmıyor çünkü bazı botlar onu tespit
   ediyor; ekran dışına alınıyor. `aria-hidden` + `tabindex="-1"` ile
   gerçek kullanıcıya hiçbir şekilde ulaşmıyor. */
.if-tuzak {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* ===========================================================================
   MASAÜSTÜ — form B ekseninde, hazırlık kütüğü D alanında
   ======================================================================== */
@media (min-width: 640px) {
  .if-ikili {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .if {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
    /* Kütük forma göre daha kısa; kaptan taşmasın diye üstten hizalı. */
    align-items: start;
  }
  .if-kunye {
    grid-column: 1 / 8;
  }
  .if-h2 {
    grid-column: 2 / 8;
  }
  /* Form dar bir 400 px kutuya sıkışmıyor: altı sütun ≈ 640 px. */
  .if-form {
    grid-column: 2 / 8;
    grid-row: 3;
    margin-top: clamp(1.5rem, 1.25rem + 1vw, 2.5rem);
  }
  .if-hazirlik {
    grid-column: 9 / 13;
    grid-row: 2 / 4;
    margin-top: 0;
  }
}
</style>
