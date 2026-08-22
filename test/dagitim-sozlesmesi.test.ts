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
