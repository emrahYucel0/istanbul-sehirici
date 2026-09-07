// test/yonetim-erisim-sozlesmesi.test.ts
//
// YÖNETİM GİRİŞ ROTASI — SÖZLEŞME.
//
// ─────────────────────────────────────────────────────────────────────────
// NE OLDU
//
// Yönetim girişi `/evdeneveyonetim` (dizin index'i) iken `/sehiriciyonetim`
// kök sayfasına taşındı. Eski adres artık 404 dönüyor ve BİLEREK yönlendirme
// konulmadı: bir yönlendirme, eski adresi deneyen herkese yeni adresi
// söylerdi.
//
// Bu dosya dört şeyi koruyor:
//
//   1. Giriş sayfası dosyası `/sehiriciyonetim`te; eski dizinde index yok.
//   2. Koruyucu YALNIZ alt yolları kapsıyor. Koşul çıplak `/evdeneveyonetim`i
//      de kapsasaydı istek 404'e ulaşamadan girişe yönlenir, yeni adres
//      ifşa olurdu (ölçüldü: düzeltme öncesi 302 → /sehiriciyonetim).
//   3. Çıkış ve yetkisiz erişim YENİ adrese gidiyor; kodda eski adrese
//      yönlendiren bir dal kalmadı.
//   4. Yeni kök adres rezerve — bir CMS kaydı onu slug olarak alamaz.
//
// SIR YOK: bu dosya hiçbir e-posta/parola içermiyor; hesap kimliği
// veritabanında ve gitignore'lu `.env` içinde duruyor.
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const kok = process.cwd()
const yolu = (...p: string[]) => join(kok, ...p)
const oku = (...p: string[]) => readFileSync(yolu(...p), 'utf8')
/** Yorumları atar: iddialar KOD için, gerekçe metni için değil. */
const kodu = (k: string) =>
  k.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ')

const GIRIS_YOLU = '/sehiriciyonetim'
const ESKI_YOL = '/evdeneveyonetim'

const middleware = kodu(oku('app', 'middleware', 'auth.global.ts'))
const nav = kodu(oku('app', 'components', 'admin', 'fixed', 'Nav.vue'))
/**
 * `nuxt.config.ts` YORUMSUZLAŞTIRILMIYOR.
 *
 * Rota kalıplarında `"/admin/**"` gibi değerler var; blok yorum ayıklayıcı
 * oradaki `/*` dizisini yorum başlangıcı sanıp dosyanın büyük bölümünü
 * yutuyordu (ölçüldü: routeRules bloğu tamamen kayboluyordu). Bu dosyadaki
 * iddialar zaten yorumda geçmeyecek kadar özgül.
 */
const config = oku('nuxt.config.ts')
const kokAdresler = kodu(oku('server', 'domain', 'shared', 'root-paths.ts'))
const seed = kodu(oku('prisma', 'seed.ts'))

describe('giriş sayfası yeni kök rotada', () => {
  it('app/pages/sehiriciyonetim.vue var', () => {
    expect(existsSync(yolu('app', 'pages', 'sehiriciyonetim.vue'))).toBe(true)
  })

  it('eski dizinde index.vue YOK — çıplak adres 404 olabilsin', () => {
    expect(existsSync(yolu('app', 'pages', 'evdeneveyonetim', 'index.vue'))).toBe(false)
  })

  it('giriş sayfası gerçek uca bağlı', () => {
    const giris = oku('app', 'pages', 'sehiriciyonetim.vue')
    expect(giris).toContain('/api/login')
    // Girişten sonra yönetim alanına dönülüyor (alan taşınmadı).
    expect(giris).toContain(`${ESKI_YOL}/dashboard`)
  })
})

describe('koruyucu yalnız alt yolları kapsıyor', () => {
  it('önek sondaki eğik çizgiyle tanımlı', () => {
    expect(middleware).toMatch(/const YONETIM_ONEKI = '\/evdeneveyonetim\/'/)
    expect(middleware).toMatch(/startsWith\(YONETIM_ONEKI\)/)
  })

  it('çıplak önek koşuldan muaf', () => {
    // `to.path === YONETIM_ONEKI` dalı, sondaki eğik çizgili biçimi de
    // koruyucudan geçirip 404'e bırakıyor.
    expect(middleware).toMatch(/to\.path === YONETIM_ONEKI/)
  })

  it('eski "giriş sayfası istisnası" geri gelmedi', () => {
    // Bu kalıp çıplak adresi koruyucunun İÇİNE alıyordu.
    expect(middleware).not.toMatch(/startsWith\('\/evdeneveyonetim'\)/)
    expect(middleware).not.toMatch(/to\.path === '\/evdeneveyonetim'/)
  })

  it('yetkisiz erişim YENİ adrese gidiyor', () => {
    expect(middleware).toMatch(/const GIRIS_YOLU = '\/sehiriciyonetim'/)
    expect(middleware).toMatch(/navigateTo\(GIRIS_YOLU\)/)
  })
})

describe('eski adres hiçbir yerden yeniden yayınlanmıyor', () => {
  it('çıkış yeni adrese dönüyor', () => {
    expect(nav).toContain(`router.push('${GIRIS_YOLU}')`)
    expect(nav).not.toContain(`router.push('${ESKI_YOL}')`)
  })

  it('eski adrese yönlendirme kuralı yok', () => {
    // routeRules ile bir redirect, yeni adresi herkese açık biçimde ifşa ederdi.
    expect(config).not.toMatch(/"\/evdeneveyonetim":\s*\{[^}]*redirect/)
    expect(config).not.toMatch(/redirect:[^}]*sehiriciyonetim/)
  })
})

describe('yeni rota keşfe kapalı', () => {
  it('noindex, nofollow ilan edilmiş', () => {
    expect(config).toMatch(/"\/sehiriciyonetim":\s*\{\s*robots:\s*"noindex, nofollow"\s*\}/)
  })

  it('kök adres rezerve — CMS slugu çakışamaz', () => {
    expect(kokAdresler).toMatch(/'sehiriciyonetim'/)
    expect(kokAdresler).toMatch(/'evdeneveyonetim'/)
  })
})

describe('yönetici hesabı sözleşmesi', () => {
  it('tohum TEK yönetici oluşturuyor', () => {
    const dizi = seed.slice(seed.indexOf('const admins = ['), seed.indexOf('];', seed.indexOf('const admins = [')))
    expect((dizi.match(/requireEnv\('SEED_ADMIN_/g) || []).length).toBe(2) // 1 hesap × (e-posta + parola)
    expect(seed).not.toMatch(/SEED_ADMIN_2_/)
  })

  it('kimlik bilgisi KODDA değil, ortamdan okunuyor', () => {
    expect(seed).toMatch(/requireEnv\('SEED_ADMIN_1_EMAIL'\)/)
    expect(seed).toMatch(/requireEnv\('SEED_ADMIN_1_PASSWORD'\)/)
    // Eksik değişkende süreç düşüyor; yer tutucu parola üretilmiyor.
    expect(seed).toMatch(/throw new Error\(`\$\{name\} ortam değişkeni tanımlı değil/)
  })

  it('parola hashleme zayıflatılmadı (bcrypt, cost 10)', () => {
    expect(seed).toMatch(/const saltRounds = 10/)
    expect(seed).toMatch(/bcrypt\.hash\(password, saltRounds\)/)
  })
})
