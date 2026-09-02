import type { RouterConfig } from '@nuxt/schema'

/**
 * ROTA DEĞİŞİMİNDE KAYDIRMA DAVRANIŞI
 *
 * ─────────────────────────────────────────────────────────────────────
 * KÖK NEDEN — ölçüldü, varsayılmadı
 *
 * Sayfanın altındayken footer/navbar bağlantısına tıklanınca yeni rota
 * sayfanın başından açılmıyordu. Sebep eksik bir scrollBehavior DEĞİL:
 * Vue Router zaten başa dönmeye çalışıyordu. Sorun, `main.css` içindeki
 *
 *     html { scroll-behavior: smooth }
 *
 * kuralının router'ın `window.scrollTo(0, 0)` çağrısını ANİMASYONA
 * çevirmesiydi. Animasyonun süresi mesafeyle büyüyor ve yeni sayfa çoktan
 * basılmış oluyor. 1920 px'te rAF ile kare kare ölçüldü:
 *
 *     tıklama öncesi scrollY = 3281        (blog detayının dibi)
 *      100 ms   y=3281   rota artık /bolgelerimiz  ← yeni sayfa basıldı
 *      200 ms   y=3281                             ← kaydırma HÂLÂ başlamadı
 *      400 ms   y=2696
 *      800 ms   y= 236
 *     1135 ms   y=   0                             ← ancak burada tepede
 *
 * Yani kullanıcı yeni sayfayı bir saniyeden uzun süre 3.000 px aşağıdan
 * görüyor. Daha kısa bir sayfaya geçildiğinde bu, doğrudan alt bilgide
 * açılmak demek. İkinci ölçüm (/hakkimizda, 4609 px) 1307 ms verdi.
 *
 * ─────────────────────────────────────────────────────────────────────
 * ÇÖZÜM — TEK YERDE, ROUTER SEVİYESİNDE
 *
 * `behavior: 'instant'` CSS'teki `smooth`u O ÇAĞRI İÇİN eziyor. Sayfa içi
 * çapa (hash) gezinmesinde yumuşak kaydırma İSTENEN davranış olduğu için
 * orada korunuyor. `main.css`'e ve hiçbir bileşene dokunulmadı; tek tek
 * `window.scrollTo` yamaları eklenmedi.
 *
 * Öncelik sırası:
 *   1. savedPosition  → tarayıcı geri/ileri tuşu; kullanıcının bıraktığı
 *                       yere ANINDA dönülür (animasyon burada yanlış olur,
 *                       kullanıcı zaten "geri gittim" bekliyor).
 *   2. to.hash        → çapaya yumuşak kaydırma + yapışkan barın yüksekliği
 *                       kadar üst boşluk, yoksa hedef başlık barın altında
 *                       kalıyor.
 *   3. diğer her şey  → { top: 0 }, anında.
 *
 * ÜST BOŞLUK YALNIZ HASH'TE. Normal rota geçişinde offset verilmiyor;
 * sayfanın ilk pikseli zaten barın altından başlıyor.
 */

/** Yapışkan barın o anki yüksekliği. Ölçülüyor — sabit yazılmıyor, çünkü
 *  bar 390 px'te 56, ≥1024 px'te 64 px (bkz. --sahne-navbar). */
function barYuksekligi(): number {
  if (typeof document === 'undefined') return 0
  const bar = document.querySelector('header')
  if (!bar) return 0
  const st = getComputedStyle(bar)
  if (st.position !== 'sticky' && st.position !== 'fixed') return 0
  return Math.round(bar.getBoundingClientRect().height)
}

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    // 1 — Geri/İleri: kaydedilmiş konum aynen geri veriliyor.
    if (savedPosition) return { ...savedPosition, behavior: 'instant' }

    // 2 — Sayfa içi çapa. Aynı sayfada da olabilir, başka sayfada da.
    if (to.hash) {
      return {
        el: to.hash,
        top: barYuksekligi() + 16,
        behavior: 'smooth',
      }
    }

    // 3 — Normal rota değişimi. Aynı adrese (yalnız sorgu değişimi)
    //     gidiliyorsa kaydırmaya dokunulmuyor: /blog?sayfa=2 gibi
    //     sayfalama bağlantıları listeyi baştan okutmalı ama tam sayfa
    //     sıçraması yapmamalı — burada da başa dönmek doğru davranış,
    //     çünkü liste yeniden basılıyor.
    return { left: 0, top: 0, behavior: 'instant' }
  },
}
