/**
 * Tailwind, design token'larının TÜKETİCİSİDİR — kaynağı değil.
 * Tüm değerler assets/css/tokens.css içindeki CSS custom property'lerinden
 * okunur. Burada sabit bir hex/px görüyorsan bu bir hatadır.
 *
 * Renkler `rgb(var(--token) / <alpha-value>)` kalıbıyla tanımlı; bu sayede
 * `bg-brand-600/10`, `text-ink/70` gibi opaklık kısayolları çalışır.
 */

/** @param {string} token */
const color = (token) => `rgb(var(${token}) / <alpha-value>)`;

/**
 * İçerik genişliği — assets/css/tokens.css'teki `--container` ile AYNI değer.
 *
 * Neden burada CSS değişkeni kullanamıyoruz: Tailwind'in container eklentisi
 * `container.screens` içindeki değeri hem `max-width` hem de sardığı
 * `@media (min-width: …)` sorgusunda kullanır. Media query'lerde `var()`
 * geçersizdir; `@media (min-width: var(--container))` yazıldığında tarayıcı
 * kuralın tamamını atıyor ve container 1024px'te takılı kalıyordu.
 */
const CONTAINER = "1280px";

module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./composables/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    // Container'ı token'a bağlıyoruz; artık her bölümde `container mx-auto px-4`
    // tekrarına gerek yok, yan boşluk akışkan (--gutter).
    // 2xl'de 1536px yerine 1280'de sabitleniyor: ultrawide ekranlarda satır
    // uzunluğunun okunamayacak kadar büyümesini engeller.
    container: {
      center: true,
      padding: "var(--gutter)",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: CONTAINER,
        "2xl": CONTAINER,
      },
    },
    extend: {
      fontFamily: {
        // İSİM BORCU KAPANDI: anahtar `inter` iken aile Archivo'ydu.
        // Yardımcının gerçek kullanımı ölçüldü — kod tabanında TEK yer
        // (assets/css/main.css, body kuralı) ve hiçbir CMS içeriğinde
        // `font-inter` sınıfı geçmiyor. Bu yüzden yeniden adlandırma
        // güvenliydi.
        // "Inter Fallback" ölçü eşleştirilmiş yedek olarak duruyor — Archivo
        // için yeniden ölçülmeli (ayrı iş; şu an CLS ölçümü 0 gösteriyor).
        archivo: [
          "Archivo",
          "Inter Fallback",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },

      colors: {
        brand: {
          50: color("--c-brand-50"),
          100: color("--c-brand-100"),
          200: color("--c-brand-200"),
          300: color("--c-brand-300"),
          400: color("--c-brand-400"),
          500: color("--c-brand-500"),
          600: color("--c-brand-600"),
          700: color("--c-brand-700"),
          800: color("--c-brand-800"),
          900: color("--c-brand-900"),
          950: color("--c-brand-950"),
          DEFAULT: color("--c-brand-600"),
        },
        accent: {
          50: color("--c-accent-50"),
          100: color("--c-accent-100"),
          200: color("--c-accent-200"),
          300: color("--c-accent-300"),
          400: color("--c-accent-400"),
          500: color("--c-accent-500"),
          600: color("--c-accent-600"),
          700: color("--c-accent-700"),
          800: color("--c-accent-800"),
          900: color("--c-accent-900"),
          DEFAULT: color("--c-accent-400"),
        },
        ink: {
          DEFAULT: color("--c-ink"),
          muted: color("--c-ink-muted"),
          subtle: color("--c-ink-subtle"),
          inverse: color("--c-ink-inverse"),
        },
        surface: {
          DEFAULT: color("--c-surface"),
          sunken: color("--c-surface-sunken"),
          muted: color("--c-surface-muted"),
        },
        line: {
          DEFAULT: color("--c-line"),
          strong: color("--c-line-strong"),
        },

        /* ---- Geriye dönük uyumluluk takma adları -------------------------
           Kod tabanında halihazırda kullanılan `primary`, `secondary`,
           `dark`, `background` isimleri KIRILMIYOR — sadece artık token'lara
           bağlılar. Yeni kod yazarken `brand`/`accent`/`ink` tercih edilmeli.
           ------------------------------------------------------------------ */
        primary: {
          DEFAULT: color("--c-brand-600"),
          dark: color("--c-brand-700"),
        },
        secondary: {
          DEFAULT: color("--c-accent-400"),
          dark: color("--c-accent-500"),
        },
        dark: {
          DEFAULT: color("--c-ink"),
          light: color("--c-ink-muted"),
        },
        background: color("--c-surface-muted"),
      },

      /* Akışkan tipografi ölçeği. Boyut + satır yüksekliği + harf aralığı +
         ağırlık birlikte tanımlı, böylece `text-h2` tek başına tutarlı bir
         başlık üretir; her component'te ayrı ayrı ayarlanmaz. */
      fontSize: {
        display: [
          "clamp(2.75rem, 1.85rem + 3.6vw, 4.5rem)",
          { lineHeight: "1.02", letterSpacing: "-0.035em", fontWeight: "700" },
        ],
        h1: [
          "clamp(2.25rem, 1.6rem + 2.6vw, 3.5rem)",
          { lineHeight: "1.08", letterSpacing: "-0.03em", fontWeight: "700" },
        ],
        h2: [
          "clamp(1.875rem, 1.4rem + 1.8vw, 2.75rem)",
          { lineHeight: "1.15", letterSpacing: "-0.022em", fontWeight: "700" },
        ],
        h3: [
          "clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)",
          { lineHeight: "1.3", letterSpacing: "-0.012em", fontWeight: "600" },
        ],
        h4: ["1.125rem", { lineHeight: "1.4", letterSpacing: "-0.008em", fontWeight: "600" }],
        lead: ["clamp(1.0625rem, 1rem + 0.4vw, 1.25rem)", { lineHeight: "1.7" }],
        body: ["1rem", { lineHeight: "1.75" }],
        eyebrow: [
          "0.75rem",
          { lineHeight: "1", letterSpacing: "0.14em", fontWeight: "600" },
        ],
        stat: [
          "clamp(2rem, 1.5rem + 2vw, 3rem)",
          { lineHeight: "1", letterSpacing: "-0.03em", fontWeight: "700" },
        ],
      },

      spacing: {
        section: "var(--space-section)",
        "section-sm": "var(--space-section-sm)",
        block: "var(--space-block)",
        gutter: "var(--gutter)",
      },

      maxWidth: {
        container: "var(--container)",
        wide: "var(--container-wide)",
        measure: "var(--measure)",
      },

      /* ÖNEMLİ — aşağıdaki ölçekler Tailwind'in mevcut isimlerini (rounded-lg,
         shadow-md, duration-300 …) EZMEZ, yanlarına yeni isimler ekler.
         Sebep: bu redesign bölüm bölüm ilerliyor; `rounded-xl`in anlamını
         bugün değiştirseydik henüz elimizin değmediği 20+ component'te
         kontrolsüz görsel kayma olurdu. Her bölüm sırası geldiğinde yeni
         token isimlerine (rounded-card, shadow-float …) geçiriliyor. */
      borderRadius: {
        pill: "var(--r-full)",
        chip: "var(--r-sm)",
        field: "var(--r-md)",
        card: "var(--r-lg)",
        panel: "var(--r-xl)",
        hero: "var(--r-2xl)",
      },

      boxShadow: {
        hairline: "var(--shadow-hairline)",
        subtle: "var(--shadow-xs)",
        soft: "var(--shadow-sm)",
        float: "var(--shadow-md)",
        lifted: "var(--shadow-lg)",
        deep: "var(--shadow-xl)",
      },

      transitionDuration: {
        fast: "var(--dur-fast)",
        base: "var(--dur-base)",
        slow: "var(--dur-slow)",
        reveal: "var(--dur-reveal)",
      },

      transitionTimingFunction: {
        out: "var(--ease-out)",
        smooth: "var(--ease-in-out)",
        soft: "var(--ease-soft)",
      },

      zIndex: {
        base: "var(--z-base)",
        raised: "var(--z-raised)",
        sticky: "var(--z-sticky)",
        header: "var(--z-header)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
      },

      lineHeight: {
        28: "28px",
      },
    },
  },
  plugins: [],
};
