// test/dagitim-sozlesmesi.test.ts
//
// DAĞITIM SÖZLEŞMESİ — BELGE İLE ARAÇLAR AYNI ŞEYİ SÖYLÜYOR MU?
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN TEST EDİLİYOR
//
// Yayın belgesi çalıştırılabilir değil, yani "eskidi mi" sorusunu kendisi
// cevaplayamıyor. M8 denetiminde tam olarak bu oldu: belge "yedekler/
// klasöründeki en güncel .sql dosyasını yükle" diyordu ve o dosya M1
// öncesine aitti — yani belgeyi harfiyen izleyen biri, kodun beklediği
// tabloları taşımayan bir veritabanı kurardı.
//
// Bu dosya belgeyi bir SÖZLEŞME gibi ele alıyor: içinde bulunması gereken
// ifadeler ve kesinlikle bulunmaması gereken ifadeler.
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const oku = (...p: string[]) => readFileSync(join(process.cwd(), ...p), 'utf8')
const belge = oku('deploy', 'YAYIN-ADIMLARI.md')
const paketJson = JSON.parse(oku('package.json'))

// ═══════════════════════════════════════════ BAYAT YORDAM

describe('eski dump yordamı geri gelmedi', () => {
  it('"en güncel .sql dosyasını yükle" talimatı YOK', () => {
    // Tırnak içinde alıntılandığı yer (neden değiştiğini anlatan blok)
    // sayılmıyor; aranan şey TALİMAT biçimi.
    const talimatlar = belge
      .split('\n')
      .filter((s) => !s.trimStart().startsWith('>') && !s.trimStart().startsWith('//'))
      .join('\n')
    expect(talimatlar).not.toMatch(/en güncel[^\n]*\.sql[^\n]*yükle/i)
  })

  it('dökümün KESME ANINDA alınacağı yazıyor', () => {
    expect(belge).toContain('döküm kesme anında alınır')
  })

  it('dağıtım sırasında `surum-yedegi` en sonda', () => {
    const blok = belge.slice(belge.indexOf('npm run build'), belge.indexOf('Sıra önemli'))
    expect(blok).toContain('npm run surum-yedegi')
    expect(blok.indexOf('npm run surum-yedegi')).toBeGreaterThan(blok.indexOf('npm run dagitim-paketi'))
  })
})

// ═══════════════════════════════════════════ MIGRATE DEPLOY

describe('`prisma migrate deploy` üretimde destekleniyormuş gibi anlatılmıyor', () => {
  it('belge üretimde çalıştırılamadığını açıkça söylüyor', () => {
    expect(belge).toContain('üretimde `prisma migrate deploy`')
    expect(belge).toMatch(/çalıştırılamaz/i)
  })

  it('göçlerin YERELDE uygulandığı yazıyor', () => {
    expect(belge).toContain('Göçler **yerelde** uygulanır')
  })

  it('`prisma/` klasörünün yüklenmeyecekler listesinde olduğu duruyor', () => {
    const blok = belge.slice(belge.indexOf('**Yüklenmeyecekler:**'), belge.indexOf('**Yüklenmeyecekler:**') + 400)
    expect(blok).toContain('`prisma/`')
    expect(blok).toContain('`node_modules/`')
  })

  it('üretimde `npm install` yapılmadığı yazılı', () => {
    expect(belge).toMatch(/npm install.{0,40}YAPILMAYACAK|Sunucuda `npm install` yapılmıyor/i)
  })
})

// ═══════════════════════════════════════════ SÜRÜM YEDEĞİ

describe('sürüm yedeği: veritabanı ve görseller birlikte', () => {
  it('npm betikleri tanımlı', () => {
    expect(paketJson.scripts['surum-yedegi']).toBe('node --env-file=.env scripts/surum-yedegi.mjs')
    expect(paketJson.scripts['surum-geri-yukle']).toBe('node --env-file=.env scripts/surum-geri-yukle.mjs')
  })

  it('günlük yedek betiği KALDIRILMADI — ikisi farklı iş yapıyor', () => {
    expect(paketJson.scripts['yedekle']).toContain('scripts/yedekle.mjs')
    expect(existsSync(join(process.cwd(), 'scripts', 'yedekle.mjs'))).toBe(true)
  })

  it.each(['veritabani.sql', 'yuklemeler.tar.gz', 'surum.json'])('paket %s içeriyor', (dosya) => {
    expect(belge).toContain(dosya)
  })

  it('künyenin geri yükleme doğrulamasında kullanıldığı yazıyor', () => {
    expect(belge).toContain('sayımları künyeyle karşılaştırıyor')
  })
})

// ═══════════════════════════════════════════ BETİK ÇİTLERİ

describe('geri yükleme betiği çitleri', () => {
  const geri = oku('scripts', 'surum-geri-yukle.mjs')
  const kod = geri.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ')

  it('hedef veritabanı zorunlu — varsayılan yok', () => {
    expect(kod).toContain("if (!hedefDb) durdur('--veritabani=<ad> zorunlu.")
    expect(kod).not.toMatch(/hedefDb\s*=\s*arg\('veritabani'\)\s*\|\|/)
  })

  it('DATABASE_URL veritabanına yazmak ayrı onay istiyor', () => {
    expect(kod).toContain('hedefDb === baglanti.veritabani && !ustuneYaz')
    expect(kod).toContain('--ustune-yaz')
  })

  it('varsayılan kuru çalıştırma', () => {
    expect(kod).toContain("bayrak('uygula')")
    expect(kod).toContain('if (!uygula)')
  })

  it('sha256 bütünlüğü silmeden/yazmadan ÖNCE kontrol ediliyor', () => {
    const iOzet = kod.indexOf('Paket bozulmuş')
    const iYaz = kod.indexOf('DROP DATABASE IF EXISTS')
    expect(iOzet).toBeGreaterThan(-1)
    expect(iYaz).toBeGreaterThan(iOzet)
  })

  it('geri yükleme sonrası sayımlar künyeyle karşılaştırılıyor', () => {
    expect(kod).toContain('kunye.sayimlar')
    expect(kod).toContain('process.exit(sapma === 0 ? 0 : 1)')
  })

  it('görseller açıkça istenmediyse ATLANIYOR', () => {
    expect(kod).toContain('if (hedefYuklemeler)')
    expect(geri).toContain('--yuklemeler verilmedi')
  })
})

describe('parola komut satırına yazılmıyor', () => {
  it.each(['surum-yedegi.mjs', 'surum-geri-yukle.mjs', 'mysql-araclari.mjs'])('%s', (dosya) => {
    const kaynak = oku('scripts', dosya)
    expect(kaynak).not.toMatch(/--password=/)
    expect(kaynak).not.toMatch(/-p\$\{/)
  })

  it('parola MYSQL_PWD ortam değişkeniyle geçiyor', () => {
    expect(oku('scripts', 'mysql-araclari.mjs')).toContain('MYSQL_PWD: b.parola')
  })
})

// ═══════════════════════════════════════════ GERİ ALMA

describe('geri alma yordamı belgeli', () => {
  it('kod / veritabanı / görsel ayrı ayrı anlatılıyor', () => {
    const blok = belge.slice(belge.indexOf('## 7b)'), belge.indexOf('## 8)'))
    expect(blok).toContain('### Kod')
    expect(blok).toContain('### Veritabanı')
    expect(blok).toContain('### Yüklenen görseller')
    expect(blok).toContain('### Sıra')
  })

  it('ekleme-yalnız göçlerin sonucu yazılı — çoğu durumda DB geri alınmıyor', () => {
    expect(belge).toContain('eski kod yeni şemayla çalışır')
  })

  it('yıkıcı geri alma SQL\'i önerilmiyor', () => {
    expect(belge).toContain('Yıkıcı geri alma SQL\'i üretilmiyor')
  })

  it('döküm ve arşivin AYNI paketten gelmesi gerektiği yazılı', () => {
    expect(belge).toContain('**aynı paketten** gelmeli')
  })
})

// ═══════════════════════════════════════════ ORTAM SÖZLEŞMESİ

describe('.env.example', () => {
  const ornek = oku('.env.example')

  it('depoda ve gitignore beyaz listesinde', () => {
    expect(oku('.gitignore')).toContain('!.env.example')
  })

  it.each([
    'DATABASE_URL',
    'AUTH_SECRET',
    'NODE_ENV',
    'MAIL_HOST',
    'MAIL_PORT',
    'MAIL_SECURE',
    'MAIL_USER',
    'MAIL_PASSWORD',
    'MAIL_FROM',
    'MAIL_TO',
  ])('zorunlu değişken %s var', (ad) => {
    expect(ornek).toContain(ad)
  })

  it.each(['NUXT_SITE_URL', 'REDIS_URL', 'MYSQLDUMP_PATH', 'MYSQL_PATH'])(
    'isteğe bağlı değişken %s belgeli',
    (ad) => {
      expect(ornek).toContain(ad)
    }
  )

  it('kullanım dışı adlar uyarıyla anılıyor', () => {
    expect(ornek).toContain('NUXT_MAIL_SMTP_')
    expect(ornek).toMatch(/ARTIK OKUNMUYOR/i)
  })

  it('GERÇEK DEĞER TAŞIMIYOR', () => {
    // Atama gövdeleri boş ya da açık yer tutucu olmalı.
    const atamalar = ornek
      .split('\n')
      .filter((s) => /^[A-Z_]+=/.test(s))
      .map((s) => s.slice(s.indexOf('=') + 1).trim().replace(/^"|"$/g, ''))
    for (const v of atamalar) {
      const yerTutucu =
        v === '' ||
        v === 'production' ||
        v === '587' ||
        v === 'false' ||
        v.includes('KULLANICI') ||
        v.includes('PAROLA')
      expect(yerTutucu, `beklenmedik değer: "${v}"`).toBe(true)
    }
  })

  it('gerçek alan adı ya da e-posta sızmamış', () => {
    expect(ornek).not.toContain('evenakliyatevden')
    expect(ornek).not.toMatch(/@(gmail|hotmail|yandex)\./i)
  })
})

// ═══════════════════════════════════════════ YÜKLEME ROTASI

/**
 * PANELDEN YÜKLENEN GÖRSELLERİN ROTASI — HEAD DE KARŞILANMALI.
 *
 * Bu kusur EKRANDA GÖRÜNMÜYOR: tarayıcı GET attığı için site kusursuz
 * çalışıyor, yalnız sosyal tarayıcılar takılıyor.
 *
 *   GET  /yuklemeler/…-og.jpg → 200 · image/jpeg
 *   HEAD /yuklemeler/…-og.jpg → 404 · text/html   ← ölçüldü, canlıda
 *
 * WhatsApp, Twitter ve Facebook görseli indirmeden önce çoğunlukla HEAD
 * atıp tipini ve boyutunu doğruluyor; 404 alınca kartı görselsiz basıyor.
 * Etiketler, format, boyut ve oran kusursuz olduğu hâlde WhatsApp'ta
 * görselin bir türlü çıkmamasının sebebi buydu.
 *
 * Sebep dosya ADIYDI: `[...ad].get.ts` soneki rotayı yalnız GET'e bağlıyor.
 *
 * İKİNCİ TUZAK: HEAD dalında `return null` yazılamaz — h3 bunu 204'e
 * çevirip `Content-Length`i düşürüyor (ölçüldü). Tarayıcılar boyutu o
 * başlıktan okuyor.
 */
describe('yükleme rotası sosyal tarayıcılara açık', () => {
  const ROTA = join('server', 'routes', 'yuklemeler')

  it('dosya adı metoda KİLİTLİ DEĞİL', () => {
    expect(existsSync(join(process.cwd(), ROTA, '[...ad].get.ts')), 'ad .get.ts — HEAD 404 döner').toBe(false)
    expect(existsSync(join(process.cwd(), ROTA, '[...ad].ts'))).toBe(true)
  })

  it('GET ve HEAD kabul, diğerleri 405', () => {
    const kaynak = oku(ROTA, '[...ad].ts')
    expect(kaynak).toMatch(/metot !== 'GET' && metot !== 'HEAD'/)
    expect(kaynak).toContain('statusCode: 405')
  })

  it('HEAD 200 dönüyor — 204 değil, Content-Length korunuyor', () => {
    const kaynak = oku(ROTA, '[...ad].ts')
    const dal = kaynak.slice(kaynak.indexOf("if (metot === 'HEAD')"))
    expect(dal).toContain('setResponseStatus(event, 200)')
    expect(dal, 'null dönerse h3 204 üretir ve Content-Length düşer').not.toMatch(/if \(metot === 'HEAD'\) return null/)
    // Content-Length HEAD dalından ÖNCE konmalı ki yanıtta kalsın.
    expect(kaynak.indexOf("setHeader(event, 'Content-Length'")).toBeLessThan(
      kaynak.indexOf("if (metot === 'HEAD')")
    )
  })

  it('rotanın KAYNAĞI depoda — gitignore onu yutmuyor', () => {
    // Çıpasız `yuklemeler` deseni `server/routes/yuklemeler/`i de kapsıyordu;
    // rota yerelde çalıştığı için fark edilmiyordu ama depoda YOKTU.
    const yoksay = oku('.gitignore')
    expect(yoksay, 'çıpasız desen alt klasörleri de yutar').toMatch(/^\/yuklemeler$/m)
    expect(yoksay).not.toMatch(/^yuklemeler$/m)
  })
})
