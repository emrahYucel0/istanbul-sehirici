import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Nitro route dosyaları (server/api/*.ts, server/middleware/*.ts) Nuxt'un
// auto-import'larına (useRuntimeConfig, createError, getCookie, useStorage vb.)
// bağımlı olduğu için burada test edilmiyor — bunlar sadece gerçek bir Nitro
// sunucusu (veya @nuxt/test-utils'in ağır Nitro-ayağa-kaldırma test ortamı)
// içinde çözümlenir. Bunun yerine test kapsamı, Nitro'dan bağımsız çalışabilen
// katmanlara odaklanıyor: server/domain (Prisma delegate'i dışarıdan enjekte
// edilen servisler) ve server/utils'teki saf mantık (auth imzalama/doğrulama,
// rate limit penceresi) — Nitro globalleri burada test setup'ında elle mock'lanıyor.
export default defineConfig({
  // ALIAS ANLAMLARI NUXT 4 İLE AYNI OLMAK ZORUNDA.
  // Nuxt 4'te `~`/`@` srcDir'i (app/), `~~`/`@@` ise proje kökünü gösterir.
  // Burada `~` eskiden köke bağlıydı; app/ yapısına geçtikten sonra bu, test
  // ile uygulamanın aynı yazımı FARKLI yerlere çözmesi demek olurdu — testler
  // geçerken uygulamanın kırılabileceği (ya da tersi) sessiz bir tuzak.
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      '~~': fileURLToPath(new URL('.', import.meta.url)),
      '@@': fileURLToPath(new URL('.', import.meta.url)),
      // Nuxt 4'te `#shared` → `shared/`. Hem uygulama hem sunucu bu
      // klasörden okuyor (örn. `server/domain/regions/istanbul.service.ts`
      // → `#shared/utils/istanbul`); testler de aynı yere çözmeli, yoksa
      // paylaşılan modüller test ortamında bulunamıyor.
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    // `app/utils` de dahil: oradaki dosyalar Nuxt çalışma zamanına bağlı
    // OLMAYAN saf yardımcılar (Türkçe ek üretimi, yer tutucu değişimi gibi).
    // Aynı gerekçeyle server/utils zaten kapsamdaydı; app/utils dışarıda
    // kalmıştı ve testleri sessizce hiç çalışmıyordu.
    include: ['server/**/*.test.ts', 'test/**/*.test.ts', 'app/utils/**/*.test.ts'],
  },
})
