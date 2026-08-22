// Site'ın GERÇEKTE yüklediği harici kaynaklar: @nuxt/image için izin verilen
// domainler (nuxt.config.ts -> image.domains), dosya yükleme önizlemesi için
// blob:/data: (bkz. components/FileUploader.vue) ve iletişim sayfasındaki
// Google Haritalar embed'i. Font Awesome (cdnjs.cloudflare.com) kullanılmadığı
// için çıkarılmıştı; Google Fonts de kendi sunucumuza taşındığı için çıktı.
//
// ─────────────────────────────────────────────────────────────────────────
// M6'DA KALDIRILAN İZİNLER: googletagmanager · google-analytics ·
// pagead2.googlesyndication
//
// Buradaki not "Site Ayarları'ndan (bkz. app.vue) etkinleştirilebilen Google
// Analytics/Tag Manager/AdSense" diyordu. ÖLÇÜLDÜ: app.vue'da böyle bir kod
// YOK ve projenin hiçbir yerinde gtag/GTM/dataLayer yükleyen satır yok. Yani
// bu izinler, hiçbir zaman yapılmayan istekler için açık duruyordu — yani
// bedava saldırı yüzeyi. İlgili panel alanları da aynı turda kaldırıldı.
//
// Geri gelmeleri gerekirse önce rıza (consent) altyapısı gerekiyor; o gün
// bu satırlara ilgili host yeniden eklenir.
const CSP = [
  "default-src 'self'",
  // Nuxt'un SSR hydration script'i (window.__NUXT__) nonce altyapısı
  // olmadan inline çalıştığı için 'unsafe-inline' gerekli.
  "script-src 'self' 'unsafe-inline'",
  // Google Fonts izinleri KALDIRILDI: Inter artık kendi sunucumuzdan
  // geliyor (public/fonts + assets/css/fonts.css). Ölçümde sayfanın hiçbir
  // harici sunucuya isteği kalmadı; izinleri açık bırakmak gereksiz yüzey.
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob: https://istanbulevenakliyat.com https://cdn.istanbulevenakliyat.com",
  "connect-src 'self'",
  // google.com: İletişim sayfasındaki Google Haritalar embed'i (Site
  // Ayarları'ndan giriliyor). Bu izin olmadan admin haritayı ekliyor ama
  // tarayıcı iframe'i CSP nedeniyle sessizce engelliyordu.
  "frame-src https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

export default defineEventHandler((event) => {
  setHeader(event, "X-Frame-Options", "DENY");
  setHeader(event, "X-Content-Type-Options", "nosniff");
  setHeader(event, "Content-Security-Policy", CSP);
  setHeader(event, "Referrer-Policy", "strict-origin-when-cross-origin");
  setHeader(
    event,
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );

  if (process.env.NODE_ENV === "production") {
    setHeader(event, "Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
});
