/**
 * useReveal — ana sayfanın (ve tüm sitenin) ortak scroll-belirme dili.
 *
 * KULLANIM
 *   <script setup>
 *     const root = ref(null)
 *     useReveal(root)
 *   </script>
 *   <template>
 *     <section ref="root">
 *       <h2 data-reveal>Başlık</h2>
 *       <p  data-reveal="fade">Açıklama</p>
 *
 *       <!-- Grup: kartlar BİRLİKTE tetiklenir, sırayla (stagger) belirir -->
 *       <div data-reveal-group>
 *         <article data-reveal>…</article>
 *         <article data-reveal>…</article>
 *       </div>
 *     </section>
 *   </template>
 *
 * TASARIM KARARLARI
 *
 * 1. Animasyonu CSS yapar, JS sadece sınıf ekler/çıkarır.
 *    → 60 FPS (compositor'da opacity + transform), JS bundle'ı ~1 KB.
 *
 * 2. Gizleme sınıfı (.is-hidden) SUNUCUDA DEĞİL, istemcide mount sonrası
 *    eklenir. Sonuçları:
 *      • Sunucudan gelen HTML'de içerik görünür → SEO ve JS-kapalı güvenli.
 *      • JS hata verir / IntersectionObserver yoksa → içerik görünür kalır.
 *    Bu bilinçli bir "fail-safe" tercihidir: daha önce GSAP ScrollTrigger
 *    ile yaşanan "bölüm canlıda kalıcı olarak görünmez kaldı" hatası bu
 *    tasarımda yapısal olarak mümkün değildir.
 *
 * 3. Emniyet zamanlayıcısı: IntersectionObserver, observe() çağrısından
 *    hemen sonra — kesişme olmasa bile — ilk raporunu gönderir. Bu rapor
 *    FAILSAFE_MS içinde hiç gelmezse gözlemci çalışmıyor demektir ve tüm
 *    içerik görünür yapılır. İlk rapor geldiği anda zamanlayıcı iptal
 *    edilir; yani sayfanın çok altındaki bir bölüm, kullanıcı oraya
 *    ulaşmadan asla zorla açılmaz.
 *
 * 4. Gruplama: bir grid'deki kartlar ekrana aynı anda girer; bu yüzden
 *    grup kabıyla tek seferde tetiklenip index'e göre gecikirler. Dikey
 *    listelerde grup KULLANILMAZ, her öğe kendi görünürlüğünde belirir —
 *    aksi halde alttaki öğeler ekrana girmeden animasyonu bitirmiş olurdu.
 */

const HIDDEN_CLASS = 'is-hidden'
const FAILSAFE_MS = 2500

export interface RevealOptions {
  /** Elemanın ne kadarı görününce tetiklensin (0-1). */
  threshold?: number
  /** Viewport kenarlarına uygulanan pay. Alt kenardan biraz içeride
   *  tetiklemek, animasyonun "tam ekrana girdiği anda" değil, hemen
   *  öncesinde başlamasını sağlar. */
  rootMargin?: string
  /**
   * true ise animasyon yalnızca ilk görünmede oynar ve eleman bir daha
   * gizlenmez.
   *
   * VARSAYILAN ARTIK true (eskiden false idi).
   *
   * Eski gerekçe "geri dönüşte tekrar oynatmanın maliyeti düşük" diyordu
   * ama ölçüldüğünde maliyet düşük değil, YANLIŞ: bir belirme animasyonu
   * "bu içerik yeni geldi" der. Kullanıcı yukarı kaydırıp geri döndüğünde
   * içerik yeni değil, zaten okunmuş; tekrar oynayan animasyon sayfayı
   * huzursuz gösteriyor ve okuma yerini kaybettiriyor.
   *
   * `once: false` isteyen çağıran açıkça verebilir; varsayılan davranış
   * artık bir kez.
   */
  once?: boolean
}

export function useReveal(
  root: Ref<HTMLElement | { $el?: HTMLElement } | null>,
  options: RevealOptions = {}
) {
  const { threshold = 0.12, rootMargin = '0px 0px -8% 0px', once = true } = options

  /** ref bir bileşene verilmişse DOM elemanı $el altındadır; sarmalayıcı
   *  bir <div> eklemek zorunda kalmadan doğrudan <ui-section> gibi
   *  bileşenlere ref bağlanabilsin diye çözümleniyor. */
  const resolveRoot = (): HTMLElement | null => {
    const value = root.value
    if (!value) return null
    const el = (value as { $el?: HTMLElement }).$el ?? (value as HTMLElement)
    return el instanceof HTMLElement ? el : null
  }

  let observer: IntersectionObserver | null = null
  let failsafeTimer: ReturnType<typeof setTimeout> | null = null
  let managed: HTMLElement[] = []

  /** Bir gözlem biriminin (tek eleman ya da grup kabı) hedef elemanları. */
  const targetsOf = (unit: HTMLElement): HTMLElement[] =>
    unit.dataset.reveal !== undefined
      ? [unit]
      : Array.from(unit.querySelectorAll<HTMLElement>('[data-reveal]'))

  const show = (unit: HTMLElement) => {
    targetsOf(unit).forEach((el) => el.classList.remove(HIDDEN_CLASS))
  }

  const hide = (unit: HTMLElement) => {
    targetsOf(unit).forEach((el) => el.classList.add(HIDDEN_CLASS))
  }

  const revealEverything = () => {
    managed.forEach((el) => el.classList.remove(HIDDEN_CLASS))
  }

  onMounted(() => {
    const el = resolveRoot()
    if (!el) return

    // Hareket hassasiyeti: hiç gizleme, hiç gözlemci kurma.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Gözlemci desteklenmiyorsa içeriği olduğu gibi bırak (görünür).
    if (!('IntersectionObserver' in window)) return

    const all = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (el.dataset.reveal !== undefined) all.unshift(el)
    if (all.length === 0) return

    managed = all

    // Gözlem birimlerini belirle: bir eleman `[data-reveal-group]` içindeyse
    // birim o gruptur (hepsi birlikte tetiklenir), değilse elemanın kendisi.
    const units = new Set<HTMLElement>()
    all.forEach((target) => {
      const group = target.closest<HTMLElement>('[data-reveal-group]')
      units.add(group && el.contains(group) ? group : target)
    })

    /**
     * EKRANDA ZATEN GÖRÜNEN ÖĞE GİZLENMEZ.
     *
     * Sunucudan gelen HTML'de her şey görünür. Eskiden bu gözlemci mount
     * anında HEPSİNİ gizliyor, sonra kesişme raporuyla geri açıyordu —
     * yani kullanıcının o an baktığı içerik önce kayboluyor, sonra
     * animasyonla geri geliyordu.
     *
     * Ölçüldü (PageSpeed, bölge sayfası): LCP 2,4 sn iken Speed Index
     * 8,2 sn. Aradaki fark, ana içerik boyandıktan sonra ekranın uzun süre
     * değişmeye devam etmesi. Gecikmeli hidrasyonla birlikte bu gizle-göster
     * döngüsü her bölüm için ayrı zamanda çalıştığı için etki büyümüştü.
     *
     * Artık ilk ekranda olan öğeler hiç gizlenmiyor: zaten görünürler,
     * animasyonun onlara katacağı bir şey yok. Aşağıdakiler eskisi gibi
     * belirmeye devam ediyor.
     *
     * Okuma ve yazma AYRI DÖNGÜLERDE: `getBoundingClientRect` düzen
     * hesabını zorluyor; sınıf ekleme ile aynı döngüde yapılsaydı her öğede
     * bir kez yeniden düzenleme tetiklenirdi (layout thrashing).
     */
    const ilkEkranda = new Set<HTMLElement>()
    const pencereYuksekligi = window.innerHeight
    units.forEach((unit) => {
      const kutu = unit.getBoundingClientRect()
      if (kutu.top < pencereYuksekligi && kutu.bottom > 0) ilkEkranda.add(unit)
    })

    // Stagger sırası: her grup kendi içinde 0'dan başlar.
    units.forEach((unit) => {
      targetsOf(unit).forEach((target, index) => {
        if (!target.style.getPropertyValue('--reveal-i')) {
          target.style.setProperty('--reveal-i', String(index))
        }
      })
      if (!ilkEkranda.has(unit)) hide(unit)
    })

    observer = new IntersectionObserver(
      (entries) => {
        // İlk rapor geldi → gözlemci sağlıklı, emniyet zamanlayıcısına
        // gerek yok.
        if (failsafeTimer) {
          clearTimeout(failsafeTimer)
          failsafeTimer = null
        }
        entries.forEach((entry) => {
          const unit = entry.target as HTMLElement
          if (entry.isIntersecting) {
            show(unit)
            if (once) observer?.unobserve(unit)
          } else if (!once) {
            hide(unit)
          }
        })
      },
      { threshold, rootMargin }
    )

    units.forEach((unit) => observer!.observe(unit))

    failsafeTimer = setTimeout(revealEverything, FAILSAFE_MS)
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
    if (failsafeTimer) clearTimeout(failsafeTimer)
    managed = []
  })
}
