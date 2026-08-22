<script setup>
/**
 * YÜZEN BUTONLAR TAMAMEN KALDIRILDI.
 *
 * WhatsApp butonu daha önce kaldırılmıştı; "başa dön" butonu bu turda.
 * Kök neden ikisinde de aynı: `position: fixed` kalıcı kaplama, daire +
 * gölge + hover ölçekleme — yeni tasarım dilinin yasakladığı yüzen panel
 * dilinin tamamı. Buton `--c-brand-600` (eski yeşil palet) kullanıyordu ve
 * yeni bölümlerin her ekran görüntüsünde sağ altta duruyordu.
 *
 * Kaybedilen işlev: "başa dön". Karşılığı zaten her yerde var — masaüstünde
 * Home/Ctrl+Home, iOS'ta durum çubuğuna dokunma, Android'de üst bara
 * dokunma. Kalıcı bir kaplamayı hak edecek kadar sık kullanılan bir yol
 * değildi.
 *
 * GLOBAL KARAR: `app.vue` bütün sayfalarda çalışıyor, yani buton her
 * sayfadan kalktı. Kaldırılan şey yalnızca bu; sayfa kaydırma dinleyicisi
 * de birlikte gitti (istemcide her kaydırmada çalışan bir iş eksildi).
 */
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- YÜZEN WHATSAPP BUTONU KALDIRILDI.
      Kök neden: `position: fixed` ile kalıcı bir kaplamaydı ve sağ altta
      ne varsa onu örtüyordu — 412px'te künye şeridinin son hücresinin
      üstüne biniyordu. Bileşene dolgu eklemek çözüm değil; sonraki her
      bölümde aynı çakışma tekrar ederdi.
      Ayrıca yeni tasarım dilinde daire + gölge yasak (yüzen panel).
      Kalıcı erişim artık yapışkan barda: ARA ve WP.
      AÇIK KARAR: mobil dönüşüm modeli (alt eylem şeridi vb.) sayfanın
      kalanı tasarlanırken ayrıca ele alınacak. -->

    <!-- Yüzen "başa dön" butonu da kaldırıldı; gerekçe script bloğunda. -->
  </div>
</template>

<style>
/* ---------------------------------------------------------------------------
   YÜZEN EYLEM BUTONLARI (WhatsApp + başa dön)
   ---------------------------------------------------------------------------
   Buradaki stiller kasıtlı olarak global (scoped değil): iki buton da
   <NuxtLayout>'un dışında, uygulama kökünde duruyor.

   Bu bloktan KALDIRILANLAR ve gerekçeleri:

   • `* { outline: none }` — sitedeki TÜM elemanların odak halkasını yok
     ediyordu. Klavyeyle gezinen kullanıcı nerede olduğunu göremiyordu
     (WCAG 2.4.7 ihlali). Üstelik katmansız (unlayered) yazıldığı için,
     cascade layer kuralları gereği main.css'teki `@layer base` içindeki
     `:focus-visible` kuralını ÖZGÜLLÜKTEN BAĞIMSIZ olarak eziyordu —
     yani odak halkası düzeltmesi hiç devreye girmiyordu.
     `* { margin/padding/box-sizing }` kısmı da gereksizdi: Tailwind
     Preflight bunları zaten ve daha doğru biçimde yapıyor.

   • `body { background: <mermer gradient> }` — token tabanlı zemine
     taşındı (bkz. assets/css/main.css).

   • `.section-title { color: black }` — iki bölümün başlık rengini
     token'ların dışından eziyordu.

   • `blockquote` + sarı tırnak ::before/::after — design system'e taşındı.
   ------------------------------------------------------------------------ */
</style>
