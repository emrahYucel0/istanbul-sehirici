<script setup>
/**
 * KAPANIŞ — `close` kompozisyonu. Sayfanın son cümlesi.
 *
 * GÖREVİ
 * Yeni bilgi öğretmiyor, yeni hizmet anlatmıyor, yeni sayı göstermiyor.
 * Tek işi anlatıyı kapatmak: "yeterince gördün, şimdi konuşabiliriz".
 *
 * KOYU YÜZEY — sayfanın TEK koyu bölümü
 * Yeni tasarımın dokuz bölümünün hepsi kâğıt zeminde. Kapanış `--c-ink`
 * üzerine alındı çünkü bitişi anlatan en güçlü araç bu ve tasarım sistemi
 * sayfa başına yaklaşık bir koyu yüzeye izin veriyor. Altındaki Footer
 * beyaz; koyu bant ikisinin arasına net bir sınır koyuyor, kullanıcı yeni
 * bir bölüm başladığını değil anlatının bittiğini görüyor.
 *
 * BAKIR KULLANIMI — ÖLÇÜLDÜ, METİN OLARAK KULLANILAMAZ
 * `--c-signal` koyu zeminde 3,13:1. Metin için AA eşiği 4,5; geçmiyor.
 * Bu yüzden birincil eylemin YAZISI kâğıt renginde (15,85:1), bakır yalnız
 * 1px alt çizgide kalıyor — orada UI eşiği 3:1 geçerli ve 3,13 onu geçiyor.
 * Böylece aksan korunuyor ama okunaklılık bozulmuyor.
 * Telefon `--c-rule` tonunda (11,14:1): kâğıttan belirgin şekilde geri
 * çekilmiş ama eşiğin çok üstünde. Hiyerarşi kontrastla değil ölçek ve
 * ton farkıyla kuruluyor.
 *
 * KART YOK, PANEL YOK, FORM YOK, FİYAT KUTUSU YOK, BANNER YOK.
 * Sekiz alanlı bir formu finalde tekrar önümüze koymuyoruz; gerçek form
 * `/iletisim` sayfasında ve oraya bağlanıyoruz.
 *
 * İKİ EYLEM, DAHA FAZLASI DEĞİL
 * Birincil: `/iletisim` — gerçekten çalışan akış (contact/Form.vue →
 * POST /api/leads → ContactLead + e-posta).
 * İkincil: telefon. WhatsApp BİLEREK eklenmedi: navbar'da kalıcı olarak
 * duruyor (ARA · WP) ve burada üçüncü eylem, kapanışı beş seçenekli bir
 * menüye çevirirdi.
 *
 * DOĞRULANMAMIŞ İDDİA YOK. Eski Pricing'in "ücretsiz keşif", "taşıma
 * gününe kadar değişmez", "sürpriz kalem yok" ifadelerinin hiçbiri
 * taşınmadı.
 *
 * ÇİZGİ YOK: zeminin kendisi zaten mümkün olan en güçlü ayraç.
 * HAREKET YOK: nabız, zıplama, kayan ok, parlayan buton — hiçbiri.
 */
/**
 * ICERIK KAYNAGI — `HomeSection('kapanis')` + Site Ayarlari.
 *
 * Baslik ve dugme etiketi panelden. Telefon ve hedef adres IKINCI KEZ
 * SAKLANMIYOR: telefon Site Ayarlarindan, `/iletisim` ise rota yapisinin
 * kendisinden geliyor.
 */
defineProps({
  bolum: { type: Object, required: true },
})

const { settings } = await useSiteSettings()

/** Telefon SABİT YAZILMIYOR; Site Ayarları'ndan geliyor. */
const phone = computed(() => settings.value?.phone || settings.value?.mobilePhone || '')
const telHref = computed(() => `tel:${String(phone.value).replace(/[^\d+]/g, '')}`)
</script>

<template>
  <!-- `data-yuzey="koyu"` DEKORATİF DEĞİL, BİR SÖZLEŞME.
       Yapışkan bar kâğıt zeminli; bu blok sayfanın tek koyu yüzeyi.
       Bar bu bloğun üstüne geldiğinde açık bir şerit olarak kalıyordu
       (ölçüldü: 1440'ta sayfa dibinde barın altındaki 1px'lik ayraç
       çizgisi koyu zeminde tamamen kayboluyor, bar yapışmış bir yama
       gibi duruyor). Navbar bu niteliği taşıyan bölümleri izliyor ve
       tonunu ona göre alıyor — bkz. components/fixed/Navbar.vue.
       Gelecekte başka bir koyu bölüm eklenirse yalnız bu nitelik yeter. -->
  <section class="cl" data-yuzey="koyu" aria-labelledby="kapanis-baslik">
    <div class="cl-alan">
<h2 id="kapanis-baslik" class="cl-h2">{{ bolum.heading }}</h2>

      <div class="cl-eylem">
        <!-- Birincil ağırlık artık kütükten (`.op-eylem`); burada ikinci
             kez tanımlanmıyor. Koyu yüzey için `--ters`. -->
        <NuxtLink to="/iletisim" class="op-eylem op-eylem--ters">{{ bolum.ctaLabel }}</NuxtLink>
        <!-- Telefon girilmemişse hiç render edilmiyor: çalışmayan bir
             `tel:` bağlantısı göstermek yanlış bilgi olurdu. -->
        <a
          v-if="phone"
          :href="telHref"
          class="cl-telefon"
          :aria-label="`Telefonla arayın: ${phone}`"
        >{{ phone }}</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cl {
  /* Sayfanın tek koyu yüzeyi. Yeni renk üretilmedi — mevcut aile. */
  background: rgb(var(--c-ink));
  color: rgb(var(--c-paper));
}

/* İÇ PAY ÖLÇÜLDÜ VE KÜÇÜLTÜLDÜ.
   1440'ta pay 204,8px'ti; blok 531px, içindeki içerik (iki satır başlık +
   iki bağlantı) 120px. Yani koyu yüzeyin dörtte üçü boştu ve kapanış
   "büyük" değil "seyrek" okunuyordu. Perde ölçüsüne indirilince blok
   ~389px'e iniyor, içerik oranı 0,23'ten 0,31'e çıkıyor.
   Zemin değişiminin kendisi zaten sayfanın en güçlü ayracı; onu bir de
   200px kâğıtla duyurmak gerekmiyor. */
.cl-alan {
  max-width: var(--container-wide);
  margin: 0 auto;
  padding: var(--sahne-perde) var(--sahne-pad);
}

.cl-h2 {
  /* Hero H1 72px, Vaat 67px. Burada 56px: güçlü ama Hero'yu taklit etmiyor. */
  font-size: clamp(2rem, 1.3rem + 2.8vw, 3.5rem);
  line-height: 1.08;
  letter-spacing: -0.028em;
  font-weight: 700;
  margin: 0;
  max-width: 20ch;
  text-wrap: balance;
}

.cl-eylem {
  margin-top: clamp(2.5rem, 1.75rem + 2.5vw, 4rem);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: clamp(1.25rem, 1rem + 0.8vw, 1.75rem);
}

/* BİRİNCİL EYLEM BURADA TANIMLANMIYOR.
   `.cl-birincil` ile yorum formundaki `.yf-gonder` aynı görünümü iki ayrı
   yerde yazıyordu; ikisi de `.op-eylem` kütüğüne taşındı
   (assets/css/sahne.css). Koyu yüzey farkı `--ters` değişkesinde. */

/* Telefon: karakter katmanının doğal yeri — gerçek teknik veri.
   Dekoratif mono etiket değil, numaranın kendisi. */
.cl-telefon {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-family: var(--f-mono);
  font-size: 0.9375rem;
  letter-spacing: 0.04em;
  color: rgb(var(--c-rule));
  text-decoration: none;
  border-bottom: 1px solid rgb(var(--c-measure));
  padding-bottom: 0.25rem;
  transition: color 0.15s ease-out, border-color 0.15s ease-out;
}
.cl-telefon:hover {
  color: rgb(var(--c-paper));
  border-bottom-color: rgb(var(--c-paper));
}
.cl-telefon:focus-visible {
  outline: 2px solid rgb(var(--c-paper));
  outline-offset: 6px;
}

/* ===========================================================================
   MASAÜSTÜ — cümle solda, eylemler sağda ve cümlenin tabanına hizalı
   ======================================================================== */
@media (min-width: 1024px) {
  .cl-alan {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: clamp(1rem, 0.5rem + 1.5vw, 2rem);
    /* Eylemler cümlenin SON satırının tabanına oturuyor. */
    align-items: end;
  }
  .cl-h2 {
    /* Sayfanın içerik kenarından başlıyor. */
    grid-column: 1 / 8;
    max-width: none;
  }
  .cl-eylem {
    grid-column: 9 / 13;
    margin-top: 0;
  }
}
</style>
