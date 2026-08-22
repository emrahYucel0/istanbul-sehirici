// server/domain/reviews/reviews.legacy.test.ts
//
// ESKİ YORUM BÖLÜMÜ YÜZEYİ GERİ GELMESİN.
//
// ─────────────────────────────────────────────────────────────────────────
// NE VARDI
//
// `/api/testimonials-section` + `TestimonialPanel`, yorumları bölüm CRUD'unun
// ÇOCUK kayıtları olarak yönetiyordu. Fabrika her PUT'ta çocukları SİLİP
// yeniden yaratıyor; yani bölüm başlığını değiştirmek için basılan tek bir
// "Kaydet" düğmesi
//
//   · ziyaretçilerin onay bekleyen yorumlarını
//   · onaylanmış gerçek yorumları
//
// tablodan siliyor, yerlerine formdaki kopyaları `isApproved: true,
// source: 'admin'` olarak yazıyordu.
//
// M5 bu yazma yolunu kapatmıştı (children: [], açık ret). M6 yüzeyin
// tamamını kaldırdı: uç nokta, yapılandırma, panel ve rota silindi.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN "DOSYA YOK" TESTİ
//
// M5'teki test, yapılandırma dosyasının İÇİNDE `children: []` yazdığını
// kontrol ediyordu. Dosya artık yok; en güçlü değişmez de bu — var olmayan
// bir yol yeniden etkinleştirilemez. Test bunun geri getirilmediğini
// koruyor.
//
// TESTIMONIAL TABLOSU DURUYOR ve `TestimonialSection` de duruyor: yorumların
// yabancı anahtarı ona bağlı. Ölü YÖNETİM ÖZELLİĞİ ile VERİ MODELİ
// BAĞIMLILIĞI aynı şey değil.
import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const kok = process.cwd()
const yok = (...p: string[]) => !existsSync(join(kok, ...p))

describe('eski yorum bölümü yüzeyi geri gelmedi', () => {
  it.each([
    ['uç nokta', ['server', 'api', 'testimonials-section.ts']],
    ['domain yapılandırması', ['server', 'domain', 'sections', 'configs', 'testimonials-section.config.ts']],
    ['yönetim paneli', ['app', 'components', 'admin', 'base', 'TestimonialPanel.vue']],
    ['yönetim rotası', ['app', 'pages', 'evdeneveyonetim', 'testimonial.vue']],
    ['V1 herkese açık bileşen', ['app', 'components', 'base', 'Testimonial.vue']],
  ])('%s silinmiş durumda', (_ad, parcalar) => {
    expect(yok(...parcalar)).toBe(true)
  })
})

describe('yorum verisinin kendisi korundu', () => {
  it('yorumların bağlı olduğu bölüm kaydı hâlâ okunuyor', async () => {
    // `defaultSectionId` yeni yorumun yabancı anahtarını buluyor. Bölüm
    // YÖNETİMİ kalktı ama bölüm KAYDI duruyor; ikisi ayrı şeyler.
    const kaynak = await import('node:fs').then((fs) =>
      fs.readFileSync(join(kok, 'server', 'domain', 'reviews', 'reviews.repository.ts'), 'utf8')
    )
    expect(kaynak).toContain('prisma.testimonialSection.findFirst')
  })

  it('moderasyon yüzeyi TEK: ReviewsPanel', async () => {
    const fs = await import('node:fs')
    const paneller = fs
      .readdirSync(join(kok, 'app', 'components', 'admin', 'base'))
      .filter((f) => /review|testimonial/i.test(f))
    expect(paneller).toEqual(['ReviewsPanel.vue'])
  })
})
